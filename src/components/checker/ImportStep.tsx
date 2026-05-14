'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  Upload,
  FileText,
  BookOpen,
  Loader2,
  CheckCircle2,
  ChevronRight,
  Monitor,
  Book,
  BookMarked,
  Ruler,
  ScanLine,
  Eye,
  ShieldCheck,
  BadgeCheck,
  Layers,
  Image as ImageIcon,
} from 'lucide-react';
import { useAppStore } from '@/store/use-app-store';
import {
  BookType,
  UploadedFile,
  ProcessingStep,
  PreviewAssetCache,
  ProcessingStatus,
  PageIssue,
  PageIssueExtended,
  SpreadInfo,
  BookPage,
} from '@/types/kdp';
import { loadPDF, loadImage, preRenderAllForPreview } from '@/engine/pdf-processor';
import { analyzePagesForIssues, computeValidationSummary } from '@/engine/validator';
import { TRIM_SIZES, TrimSizeKey, calculateMeasurements } from '@/engine/kdp-constants';
import { TrustBadge } from '@/components/workspace/ProductWorkspace';

// ---------------------------------------------------------------------------
// Build unified book sequence (Cover → Blank → Interior)
// ---------------------------------------------------------------------------

function buildBookSequence(
  bookType: string,
  coverDataUrl: string | undefined,
  manuscriptPageCount: number,
  pdfPageDataUrls: Map<number, string>,
  measurements: { fullCoverWidthIn: number; fullCoverHeightIn: number; trimWidthIn: number; trimHeightIn: number },
): BookPage[] {
  const pages: BookPage[] = [];
  const isKindle = bookType === 'kindle';

  // PAGE 0: Full Cover Spread (Back Cover + Spine + Front Cover as ONE page)
  if (!isKindle) {
    pages.push({
      id: 'cover',
      section: 'full-cover',
      label: 'Full Cover',
      dataUrl: coverDataUrl,
      isBlank: !coverDataUrl,
      isCoverPage: true,
      widthIn: measurements.fullCoverWidthIn,
      heightIn: measurements.fullCoverHeightIn,
    });
  }

  // PAGE 1 (or 0 for Kindle): Blank page (offset for proper spread alignment)
  pages.push({
    id: 'blank',
    section: 'blank',
    label: 'Blank',
    isBlank: true,
    isCoverPage: false,
    widthIn: measurements.trimWidthIn,
    heightIn: measurements.trimHeightIn,
  });

  // Interior manuscript pages
  for (let i = 1; i <= manuscriptPageCount; i++) {
    pages.push({
      id: `p${i}`,
      section: 'interior',
      label: `Page ${i}`,
      manuscriptIndex: i,
      dataUrl: pdfPageDataUrls.get(i),
      isBlank: false,
      isCoverPage: false,
      widthIn: measurements.trimWidthIn,
      heightIn: measurements.trimHeightIn,
    });
  }

  return pages;
}

// ---------------------------------------------------------------------------
// Compute spreads for the cache
// ---------------------------------------------------------------------------

function computeSpreadsForCache(pages: BookPage[]): SpreadInfo[] {
  if (pages.length === 0) return [];
  const spreads: SpreadInfo[] = [];
  let i = 0;

  while (i < pages.length) {
    if (i + 1 < pages.length) {
      const leftPage = pages[i];
      const rightPage = pages[i + 1];
      const leftLabel = leftPage.section === 'blank' ? 'Blank' :
        leftPage.section === 'full-cover' ? 'Cover' :
        leftPage.label;
      const rightLabel = rightPage.section === 'blank' ? 'Blank' :
        rightPage.section === 'full-cover' ? 'Cover' :
        rightPage.label;

      spreads.push({
        leftPageIndex: i,
        rightPageIndex: i + 1,
        isSingle: false,
        label: `${leftLabel} + ${rightLabel}`,
      });
      i += 2;
    } else {
      const page = pages[i];
      const label = page.section === 'blank' ? 'Blank' :
        page.section === 'full-cover' ? 'Cover' :
        page.label;
      spreads.push({
        leftPageIndex: i,
        rightPageIndex: null,
        isSingle: true,
        label,
      });
      i++;
    }
  }

  return spreads;
}

// ---------------------------------------------------------------------------
// TypeSwitcher – segmented control for Kindle / Paperback / Hardcover
// ---------------------------------------------------------------------------

function TypeSwitcher({
  bookType,
  setBookType,
}: {
  bookType: BookType;
  setBookType: (t: BookType) => void;
}) {
  const options: { key: BookType; label: string; icon: React.ElementType }[] = [
    { key: 'kindle', label: 'Kindle', icon: Monitor },
    { key: 'paperback', label: 'Paperback', icon: Book },
    { key: 'hardcover', label: 'Hardcover', icon: BookMarked },
  ];

  return (
    <div className="grid w-full grid-cols-3 gap-1 rounded-xl border border-border bg-secondary/70 p-1 shadow-soft sm:inline-grid sm:w-auto">
      {options.map(({ key, label, icon: Icon }) => {
        const active = bookType === key;
        return (
          <button
            key={key}
            onClick={() => setBookType(key)}
            className={`ds-focus flex min-w-0 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold transition-all duration-200 sm:gap-2 sm:px-4 sm:text-sm ${
              active
                ? 'bg-primary text-primary-foreground shadow-soft'
                : 'text-muted-foreground hover:bg-surface-elevated hover:text-foreground'
            }`}
            type="button"
          >
            <Icon className="w-4 h-4" />
            <span className="truncate">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// UploadZone – large cinematic drag-and-drop area
// ---------------------------------------------------------------------------

interface UploadZoneProps {
  label: string;
  accept: string;
  onFile: (file: File) => void;
  isProcessing: boolean;
  uploadedFile?: UploadedFile | null;
  icon?: React.ElementType;
}

function UploadZone({
  label,
  accept,
  onFile,
  isProcessing,
  uploadedFile,
  icon: ZoneIcon = Upload,
}: UploadZoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files[0];
      if (file) onFile(file);
    },
    [onFile],
  );

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={handleDrop}
      onClick={() => !isProcessing && inputRef.current?.click()}
      className={`relative flex min-h-[176px] cursor-pointer flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border p-5 text-center shadow-soft transition-all duration-300 sm:min-h-[190px] sm:p-8 ${
        isProcessing
          ? 'cursor-wait border-primary/25 bg-primary/[0.04]'
          : dragActive
            ? 'scale-[1.01] border-primary/45 bg-primary/[0.08] shadow-card'
            : uploadedFile
              ? 'border-primary/25 bg-primary/[0.04]'
              : 'border-border bg-card hover:border-primary/35 hover:bg-surface-elevated'
      }`}
    >
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
        }}
        className="hidden"
      />

      {isProcessing ? (
        <>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
          <p className="text-sm font-medium text-foreground">Analyzing file...</p>
        </>
      ) : uploadedFile ? (
        <>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <CheckCircle2 className="h-6 w-6 text-primary" />
          </div>
          <div className="min-w-0 max-w-full">
            <p className="truncate text-sm font-semibold text-primary">{uploadedFile.name}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {formatSize(uploadedFile.size)}
              {uploadedFile.pageCount ? ` · ${uploadedFile.pageCount} pages` : ''}
            </p>
          </div>
          <p className="mt-1 text-[11px] font-medium text-muted-foreground">Click or drop to replace</p>
        </>
      ) : (
        <>
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-colors duration-300 ${
              dragActive ? 'bg-primary/10' : 'bg-secondary'
            }`}
          >
            <ZoneIcon
              className={`h-7 w-7 transition-colors duration-300 ${
                dragActive ? 'text-primary' : 'text-primary/70'
              }`}
            />
          </div>
          <p className="text-sm font-semibold text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">Drop file here or click to browse</p>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ProcessingOverlay – animated sequential steps
// ---------------------------------------------------------------------------

const PROCESSING_STEPS: Omit<ProcessingStep, 'status'>[] = [
  { id: 'trim', label: 'Analyzing trim size…' },
  { id: 'bleed', label: 'Detecting bleed…' },
  { id: 'pages', label: 'Scanning manuscript pages…' },
  { id: 'fonts', label: 'Checking fonts…' },
  { id: 'preview', label: 'Preparing preview…' },
];

function ProcessingOverlay({ steps }: { steps: ProcessingStep[] }) {
  return (
    <div className="ds-card space-y-3 p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Loader2 className="w-4 h-4 text-primary animate-spin" />
        <span className="text-sm font-medium text-foreground">Processing</span>
      </div>
      {steps.map((step) => {
        const isActive = step.status === 'active';
        const isComplete = step.status === 'complete';
        return (
          <div
            key={step.id}
            className={`flex items-center gap-3 transition-all duration-300 ${
              isComplete
                ? 'opacity-60'
                : isActive
                  ? 'opacity-100'
                  : 'opacity-30'
            }`}
          >
            <div className="w-5 h-5 flex items-center justify-center shrink-0">
              {isComplete ? (
                <CheckCircle2 className="w-4 h-4 text-primary" />
              ) : isActive ? (
                <Loader2 className="w-4 h-4 text-primary animate-spin" />
              ) : (
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/35" />
              )}
            </div>
            <span
              className={`text-sm transition-colors duration-300 ${
                isComplete
                  ? 'text-primary/70 line-through'
                : isActive
                    ? 'text-foreground'
                    : 'text-muted-foreground'
              }`}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// DetectionResults – auto-detected info after processing
// ---------------------------------------------------------------------------

interface DetectionInfo {
  trimSize: string;
  widthIn: number;
  heightIn: number;
  pageCount: number;
  bleed: string;
  dpi: number;
  orientation: 'portrait' | 'landscape';
  confidence: number;
}

function DetectionResults({
  info,
  processingActive,
}: {
  info: DetectionInfo;
  processingActive: boolean;
}) {
  const confidencePct = Math.round(info.confidence * 100);
  const confidenceLabel =
    info.confidence >= 0.8 ? 'High' : info.confidence >= 0.5 ? 'Medium' : 'Low';
  const confidenceColor =
    info.confidence >= 0.8
      ? 'text-primary bg-primary/10 border-primary/20'
      : info.confidence >= 0.5
        ? 'text-warning bg-warning/10 border-warning/20'
        : 'text-danger bg-danger/10 border-danger/20';

  const details: { icon: React.ElementType; label: string; value: string }[] = [
    { icon: Ruler, label: 'Trim Size', value: info.trimSize },
    { icon: Layers, label: 'Page Count', value: `${info.pageCount}` },
    { icon: ScanLine, label: 'Bleed', value: info.bleed },
    { icon: Eye, label: 'Resolution', value: `${info.dpi} DPI` },
    {
      icon: info.orientation === 'portrait' ? BookOpen : Book,
      label: 'Orientation',
      value: info.orientation.charAt(0).toUpperCase() + info.orientation.slice(1),
    },
  ];

  return (
    <div className="ds-card overflow-hidden">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-border bg-surface-elevated px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Auto-Detected Settings</span>
        </div>
        <span
          className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${confidenceColor}`}
        >
          <BadgeCheck className="w-3 h-3 inline mr-1 -mt-px" />
          {confidenceLabel} Confidence ({confidencePct}%)
        </span>
      </div>

      {/* Detail grid */}
      <div className="grid grid-cols-1 gap-px bg-border sm:grid-cols-2 lg:grid-cols-5">
        {details.map(({ icon: DIcon, label, value }) => (
          <div key={label} className="flex min-w-0 flex-col gap-1.5 bg-card p-4">
            <DIcon className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[11px] text-muted-foreground uppercase tracking-wider">{label}</span>
            <span className="break-words text-sm font-semibold text-foreground">{value}</span>
          </div>
        ))}
      </div>

      {/* Processing indicator (no duplicate button) */}
      {processingActive && (
        <div className="px-5 py-3 border-t border-border bg-surface-elevated flex items-center gap-2">
          <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
          <span className="text-xs text-muted-foreground">Preparing preview...</span>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// matchTrimSize – find the closest KDP trim size for given dimensions
// ---------------------------------------------------------------------------

function matchTrimSize(
  widthIn: number,
  heightIn: number,
): { key: TrimSizeKey; confidence: number } {
  let bestKey: TrimSizeKey = '6x9';
  let bestDist = Infinity;

  for (const [key, trim] of Object.entries(TRIM_SIZES)) {
    if (key === 'custom') continue;
    const dist = Math.sqrt(
      Math.pow(trim.widthIn - widthIn, 2) + Math.pow(trim.heightIn - heightIn, 2),
    );
    if (dist < bestDist) {
      bestDist = dist;
      bestKey = key as TrimSizeKey;
    }
  }

  // Confidence: 1.0 if exact match, decreasing with distance
  const confidence = Math.max(0, Math.min(1, 1 - bestDist / 2));
  return { key: bestKey, confidence };
}

// ---------------------------------------------------------------------------
// ImportStep – main export
// ---------------------------------------------------------------------------

export default function ImportStep() {
  const {
    bookType,
    setBookType,
    uploadedCover,
    setUploadedCover,
    uploadedManuscript,
    setUploadedManuscript,
    setProcessing,
    setCheckerStep,
    updateBookConfig,
    setTotalPages,
    // New store accessors for background processing
    setPreviewCache,
    setProcessingStatus,
    setPreviewReady,
    setPageIssues,
    setPageIssuesExtended,
    setPdfAnalysis,
    setCoverDataUrl,
    setPdfPageDataUrl,
    setBookPages,
    measurements,
    processingStatus,
    previewReady,
    bookConfig,
  } = useAppStore();

  // Local processing state
  const [coverProcessing, setCoverProcessing] = useState(false);
  const [manuscriptProcessing, setManuscriptProcessing] = useState(false);
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([]);
  const [detectionInfo, setDetectionInfo] = useState<DetectionInfo | null>(null);
  const [isStepProcessing, setIsStepProcessing] = useState(false);
  const stepTimerRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  // Guard ref to prevent duplicate background processing runs
  const bgProcessingRef = useRef(false);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      stepTimerRef.current.forEach(clearTimeout);
    };
  }, []);

  // -----------------------------------------------------------------------
  // Build detection info from processing result (must be declared first)
  // -----------------------------------------------------------------------
  const buildDetectionInfo = useCallback(
    (
      result: { widthIn: number; heightIn: number; pageCount: number; dpi: number },
      _fileType: 'cover' | 'manuscript' | 'kindle',
    ) => {
      const { key: trimKey, confidence: trimConf } = matchTrimSize(result.widthIn, result.heightIn);
      const trim = TRIM_SIZES[trimKey];

      // Determine bleed confidence (assume no-bleed unless width suggests bleed)
      const hasBleed =
        Math.abs(result.widthIn - trim.widthIn - 0.125 * 2) <
        Math.abs(result.widthIn - trim.widthIn);
      const bleedConf = hasBleed ? 0.6 : 0.85;

      const overallConfidence = Math.min(trimConf, bleedConf, 1);

      setDetectionInfo({
        trimSize: trim.label,
        widthIn: result.widthIn,
        heightIn: result.heightIn,
        pageCount: result.pageCount,
        bleed: hasBleed ? 'With Bleed (0.125")' : 'No Bleed',
        dpi: result.dpi,
        orientation: result.heightIn >= result.widthIn ? 'portrait' : 'landscape',
        confidence: Math.round(overallConfidence * 100) / 100,
      });
    },
    [],
  );

  // -----------------------------------------------------------------------
  // Run animated processing steps then process the file
  // -----------------------------------------------------------------------
  const runProcessingAnimation = useCallback(
    async (
      file: File,
      fileType: 'cover' | 'manuscript' | 'kindle',
    ): Promise<{ widthIn: number; heightIn: number; pageCount: number; dpi: number } | null> => {
      setIsStepProcessing(true);
      setDetectionInfo(null);

      // Initialize steps
      const steps: ProcessingStep[] = PROCESSING_STEPS.map((s) => ({
        ...s,
        status: 'pending' as const,
      }));
      setProcessingSteps(steps);
      setProcessing(true, 'Processing file…');

      // Advance steps sequentially with delay
      for (let i = 0; i < steps.length; i++) {
        // Mark current as active
        const updated = [...steps];
        updated[i] = { ...updated[i], status: 'active' };
        setProcessingSteps(updated);

        // Wait for processing time
        await new Promise<void>((resolve) => {
          const t = setTimeout(resolve, 400 + Math.random() * 300);
          stepTimerRef.current.push(t);
        });

        // Mark as complete
        steps[i] = { ...steps[i], status: 'complete' };
        setProcessingSteps([...steps]);
      }

      // Actually process the file (parallel with last animation step)
      let result: { widthIn: number; heightIn: number; pageCount: number; dpi: number } | null = null;

      try {
        const isImage =
          file.type.startsWith('image/') ||
          file.name.endsWith('.png') ||
          file.name.endsWith('.jpg') ||
          file.name.endsWith('.jpeg');

        if (isImage) {
          const img = await loadImage(file);
          const widthIn = img.width / 300;
          const heightIn = img.height / 300;
          result = { widthIn, heightIn, pageCount: 1, dpi: 300 };
        } else {
          // Assume PDF / EPUB treated as PDF for loadPDF
          const pdf = await loadPDF(file);
          result = {
            widthIn: pdf.widthIn,
            heightIn: pdf.heightIn,
            pageCount: pdf.pageCount,
            dpi: 300,
          };
        }
      } catch (err) {
        console.error('File processing error:', err);
      }

      setProcessing(false, '');
      setIsStepProcessing(false);
      return result;
    },
    [setProcessing],
  );

  // -----------------------------------------------------------------------
  // Handle cover upload
  // -----------------------------------------------------------------------
  const handleCoverUpload = useCallback(
    async (file: File) => {
      setCoverProcessing(true);
      setDetectionInfo(null);

      const result = await runProcessingAnimation(file, 'cover');

      if (result) {
        const uploaded: UploadedFile = {
          id: crypto.randomUUID(),
          name: file.name,
          size: file.size,
          type: file.type,
          file,
          pageCount: result.pageCount > 1 ? result.pageCount : undefined,
          dimensions: { width: result.widthIn * 300, height: result.heightIn * 300 },
        };

        // Generate thumbnail for image files
        if (file.type.startsWith('image/')) {
          try {
            const img = await loadImage(file);
            uploaded.dataUrl = img.dataUrl;
          } catch {
            /* ignore */
          }
        }

        setUploadedCover(uploaded);
        buildDetectionInfo(result, 'cover');
      }

      setCoverProcessing(false);
    },
    [runProcessingAnimation, setUploadedCover, buildDetectionInfo],
  );

  // -----------------------------------------------------------------------
  // Handle manuscript upload
  // -----------------------------------------------------------------------
  const handleManuscriptUpload = useCallback(
    async (file: File) => {
      setManuscriptProcessing(true);
      setDetectionInfo(null);

      const result = await runProcessingAnimation(file, 'manuscript');

      if (result) {
        const uploaded: UploadedFile = {
          id: crypto.randomUUID(),
          name: file.name,
          size: file.size,
          type: file.type,
          file,
          pageCount: result.pageCount,
          dimensions: { width: result.widthIn * 300, height: result.heightIn * 300 },
        };

        setUploadedManuscript(uploaded);
        setTotalPages(result.pageCount);
        buildDetectionInfo(result, 'manuscript');
      }

      setManuscriptProcessing(false);
    },
    [runProcessingAnimation, setUploadedManuscript, setTotalPages, buildDetectionInfo],
  );

  // -----------------------------------------------------------------------
  // Handle Kindle upload (single zone)
  // -----------------------------------------------------------------------
  const handleKindleUpload = useCallback(
    async (file: File) => {
      setManuscriptProcessing(true);
      setDetectionInfo(null);

      const result = await runProcessingAnimation(file, 'kindle');

      if (result) {
        const uploaded: UploadedFile = {
          id: crypto.randomUUID(),
          name: file.name,
          size: file.size,
          type: file.type,
          file,
          pageCount: result.pageCount,
          dimensions: { width: result.widthIn * 300, height: result.heightIn * 300 },
        };

        setUploadedManuscript(uploaded);
        setTotalPages(result.pageCount);
        buildDetectionInfo(result, 'kindle');
      }

      setManuscriptProcessing(false);
    },
    [runProcessingAnimation, setUploadedManuscript, setTotalPages, buildDetectionInfo],
  );

  // -----------------------------------------------------------------------
  // Background preview processing — pre-render everything for instant preview
  // -----------------------------------------------------------------------
  const startBackgroundPreviewProcessing = useCallback(
    async (coverFile: File | null, manuscriptFile: File | null) => {
      // Guard against duplicate runs
      if (bgProcessingRef.current) return;
      bgProcessingRef.current = true;

      setProcessingStatus('parsing');

      try {
        // Step 1: Pre-render everything
        const renderResult = await preRenderAllForPreview(
          coverFile,
          manuscriptFile,
          {
            renderScale: 1.5,
            onProgress: (status, _progress) => {
              setProcessingStatus(status === 'complete' ? 'analyzing' : 'rendering');
            },
          },
        );

        // Step 2: Store cover data URL
        if (renderResult.coverDataUrl) {
          setCoverDataUrl(renderResult.coverDataUrl);
        }

        // Step 3: Store manuscript page data URLs
        renderResult.pages.forEach((dataUrl, index) => {
          setPdfPageDataUrl(index, dataUrl);
        });

        setTotalPages(renderResult.pageCount);

        // Step 4: Analyze pages for issues
        setProcessingStatus('analyzing');

        const currentMeasurements = measurements || calculateMeasurements(bookConfig);

        const pdfAnalysis = {
          widthIn: renderResult.widthIn,
          heightIn: renderResult.heightIn,
          pageCount: renderResult.pageCount,
          hasBleed: bookConfig.bleed === 'bleed',
          dpi: renderResult.pageCount > 0 ? 300 : 0,
          isGrayscale: false,
          hasTransparency: false,
          blankPages: renderResult.blankPages,
          pageWidths: Array(renderResult.pageCount).fill(renderResult.widthIn),
          pageHeights: Array(renderResult.pageCount).fill(renderResult.heightIn),
          imageResolutions: [] as { page: number; dpi: number }[],
        };

        const pageIssues: PageIssueExtended[] = analyzePagesForIssues(
          pdfAnalysis,
          bookConfig,
          currentMeasurements,
        );
        setPageIssues(pageIssues);
        setPageIssuesExtended(pageIssues);
        setPdfAnalysis(pdfAnalysis);

        // Step 5: Build book sequence (Cover → Blank → Interior)
        const bookPagesArr = buildBookSequence(
          bookType,
          renderResult.coverDataUrl || undefined,
          renderResult.pageCount,
          renderResult.pages,
          {
            fullCoverWidthIn: currentMeasurements.fullCoverWidthIn,
            fullCoverHeightIn: currentMeasurements.fullCoverHeightIn,
            trimWidthIn: currentMeasurements.trimWidthIn,
            trimHeightIn: currentMeasurements.trimHeightIn,
          },
        );
        setBookPages(bookPagesArr);

        // Step 6: Compute spreads
        const spreads = computeSpreadsForCache(bookPagesArr);

        // Step 7: Build issue map
        const issueMap = new Map<number, PageIssue[]>();
        for (const issue of pageIssues) {
          const existing = issueMap.get(issue.page) || [];
          existing.push(issue);
          issueMap.set(issue.page, existing);
        }

        // Step 8: Build preview cache
        const previewCache: PreviewAssetCache = {
          pages: renderResult.pages,
          thumbnails: renderResult.thumbnails,
          coverDataUrl: renderResult.coverDataUrl,
          coverThumbnail: renderResult.coverThumbnail,
          spreads,
          issueMap,
          pageAnalyses: [],
          metadata: {
            totalBookPages: bookPagesArr.length,
            manuscriptPages: renderResult.pageCount,
            hasCover: !!coverFile,
            bookType,
            trimWidthIn: currentMeasurements.trimWidthIn,
            trimHeightIn: currentMeasurements.trimHeightIn,
            fullCoverWidthIn: currentMeasurements.fullCoverWidthIn,
            fullCoverHeightIn: currentMeasurements.fullCoverHeightIn,
            dpi: 300,
            createdAt: Date.now(),
          },
          status: 'ready',
        };

        setPreviewCache(previewCache);
        setProcessingStatus('ready');
        setPreviewReady(true);
      } catch (err) {
        console.error('Background preview processing failed:', err);
        setProcessingStatus('error');
        setPreviewReady(false);
      } finally {
        bgProcessingRef.current = false;
      }
    },
    [
      bookType,
      bookConfig,
      measurements,
      setProcessingStatus,
      setCoverDataUrl,
      setPdfPageDataUrl,
      setTotalPages,
      setPageIssues,
      setBookPages,
      setPreviewCache,
      setPreviewReady,
    ],
  );

  // -----------------------------------------------------------------------
  // Auto-trigger background processing when files are uploaded
  // -----------------------------------------------------------------------
  useEffect(() => {
    const coverFile = uploadedCover?.file ?? null;
    const manuscriptFile = uploadedManuscript?.file ?? null;

    // Only trigger if we have the minimum required files and preview isn't ready
    if (previewReady || bgProcessingRef.current) return;
    if (processingStatus === 'rendering' || processingStatus === 'analyzing' || processingStatus === 'parsing') return;

    if (bookType === 'kindle') {
      if (manuscriptFile) {
        startBackgroundPreviewProcessing(null, manuscriptFile);
      }
    } else {
      if (manuscriptFile) {
        startBackgroundPreviewProcessing(coverFile, manuscriptFile);
      }
    }
  }, [
    uploadedCover,
    uploadedManuscript,
    bookType,
    previewReady,
    processingStatus,
    startBackgroundPreviewProcessing,
  ]);

  const resolvedDetectionInfo = useMemo<DetectionInfo | null>(() => {
    if (detectionInfo) return detectionInfo;
    if (!uploadedManuscript) return null;

    const m = measurements;
    const hasBleed = bookConfig.bleed === 'bleed';
    const trim = TRIM_SIZES[bookConfig.trimSize as TrimSizeKey];

    return {
      trimSize: trim?.label ?? `${m.trimWidthIn}" × ${m.trimHeightIn}"`,
      widthIn: m.trimWidthIn,
      heightIn: m.trimHeightIn,
      pageCount: bookConfig.pageCount,
      bleed: hasBleed ? 'With Bleed (0.125")' : 'No Bleed',
      dpi: 300,
      orientation: m.trimHeightIn >= m.trimWidthIn ? 'portrait' : 'landscape',
      confidence: 0.85,
    };
  }, [detectionInfo, uploadedManuscript, measurements, bookConfig]);

  // -----------------------------------------------------------------------
  // Continue to Config step – update store with detected values
  // -----------------------------------------------------------------------
  const handleContinue = useCallback(() => {
    if (resolvedDetectionInfo) {
      // Fresh upload: use detected values
      const { key: trimKey } = matchTrimSize(resolvedDetectionInfo.widthIn, resolvedDetectionInfo.heightIn);
      const hasBleed = resolvedDetectionInfo.bleed.includes('With Bleed');

      updateBookConfig({
        trimSize: trimKey,
        bleed: hasBleed ? 'bleed' : 'no-bleed',
        pageCount: resolvedDetectionInfo.pageCount,
        bookType,
        binding: bookType === 'hardcover' ? 'hardcover' : 'paperback',
      });
    }
    // Even without detectionInfo (e.g. returning to Import),
    // the bookConfig is already set from a previous continue, so just navigate.
    setCheckerStep('config');
  }, [resolvedDetectionInfo, bookType, updateBookConfig, setCheckerStep]);

  // -----------------------------------------------------------------------
  // Determine what upload zones to show and whether continue is enabled
  // -----------------------------------------------------------------------
  const showCoverZone = bookType === 'paperback' || bookType === 'hardcover';
  const showKindleZone = bookType === 'kindle';
  const showManuscriptZone = bookType === 'paperback' || bookType === 'hardcover';

  const canContinue = (() => {
    // Only block if the INITIAL file analysis is still running (not background preview)
    if (isStepProcessing || coverProcessing || manuscriptProcessing) return false;
    if (bookType === 'kindle') return !!uploadedManuscript;
    // Paperback / Hardcover – at least manuscript needed
    return !!uploadedManuscript;
  })();

  // Continue is allowed even while background processing runs
  // Background preview processing will continue in the store regardless of navigation

  const anyProcessing = coverProcessing || manuscriptProcessing || isStepProcessing;

  // Is background preview processing still running?
  const bgProcessingActive =
    processingStatus === 'parsing' ||
    processingStatus === 'rendering' ||
    processingStatus === 'analyzing';

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------
  return (
    <div className="mx-auto w-full max-w-5xl space-y-7">
      {/* ---- Header ---- */}
      <div className="mx-auto max-w-2xl space-y-3 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Import Your Book
        </h2>
        <p className="mx-auto max-w-lg text-sm leading-6 text-muted-foreground sm:text-base">
          Upload your files and we&apos;ll auto-detect trim size, page count, bleed settings, and more.
        </p>
        <div className="flex justify-center pt-2">
          <TrustBadge variant="full" />
        </div>
      </div>

      {/* ---- Type Switcher ---- */}
      <div className="flex justify-center">
        <TypeSwitcher bookType={bookType} setBookType={setBookType} />
      </div>

      {/* ---- Upload Zones ---- */}
      <div className="ds-card-elevated overflow-hidden p-4 sm:p-5">
        {/* ---- Upload Zones ---- */}
        <div
          className={`grid gap-4 ${
            showCoverZone && showManuscriptZone
              ? 'grid-cols-1 lg:grid-cols-2'
              : 'grid-cols-1'
          }`}
        >
          {/* Kindle single zone */}
          {showKindleZone && (
            <UploadZone
              label="Upload Kindle File (EPUB or PDF)"
              accept=".epub,.pdf"
              onFile={handleKindleUpload}
              isProcessing={manuscriptProcessing}
              uploadedFile={uploadedManuscript}
              icon={FileText}
            />
          )}

          {/* Cover zone */}
          {showCoverZone && (
            <UploadZone
              label="Upload Cover (PDF, PNG, JPG)"
              accept=".pdf,.png,.jpg,.jpeg"
              onFile={handleCoverUpload}
              isProcessing={coverProcessing}
              uploadedFile={uploadedCover}
              icon={ImageIcon}
            />
          )}

          {/* Manuscript zone */}
          {showManuscriptZone && (
            <UploadZone
              label="Upload Manuscript (PDF)"
              accept=".pdf"
              onFile={handleManuscriptUpload}
              isProcessing={manuscriptProcessing}
              uploadedFile={uploadedManuscript}
              icon={FileText}
            />
          )}
        </div>

        {/* ---- File info hints ---- */}
        <div className="mt-4 grid gap-2 border-t border-border pt-4 text-xs text-muted-foreground sm:grid-cols-3">
          {bookType === 'kindle' ? (
            <>
              <p>EPUB or PDF up to 650 MB</p>
              <p>Interior formatting and reflow checks</p>
              <p>Local browser-only processing</p>
            </>
          ) : (
            <>
              <p>Cover: PDF, PNG, or JPG up to 650 MB</p>
              <p>Manuscript: PDF only, minimum 24 pages</p>
              <p>Auto-detect trim, bleed, and page count</p>
            </>
          )}
        </div>
      </div>

      {/* ---- Processing overlay ---- */}
      {anyProcessing && processingSteps.length > 0 && (
        <ProcessingOverlay steps={processingSteps} />
      )}

      {/* ---- Background preview processing indicator ---- */}
      {bgProcessingActive && !anyProcessing && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card shadow-soft">
          <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
          <span className="text-xs text-muted-foreground">
            {processingStatus === 'parsing' && 'Parsing PDF...'}
            {processingStatus === 'rendering' && 'Rendering pages for preview...'}
            {processingStatus === 'analyzing' && 'Analyzing pages for issues...'}
            {'Preparing preview...'}
          </span>
        </div>
      )}

      {/* ---- Preview ready indicator ---- */}
      {processingStatus === 'ready' && previewReady && !anyProcessing && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/[0.06] border border-primary/20">
          <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs text-primary">Preview ready — all pages rendered and analyzed</span>
        </div>
      )}

      {/* ---- Detection results (no continue button — that's in the sticky footer) ---- */}
      {resolvedDetectionInfo && !anyProcessing && (
        <DetectionResults
          info={resolvedDetectionInfo}
          processingActive={bgProcessingActive}
        />
      )}

      {/* ---- Single Continue button (sticky, always visible when eligible) ---- */}
      {canContinue && (
        <div className="sticky bottom-4 z-10 flex justify-stretch sm:justify-end">
          <button
            onClick={handleContinue}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-colors duration-200 hover:bg-primary-hover sm:w-auto"
          >
            Continue to Configure
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
