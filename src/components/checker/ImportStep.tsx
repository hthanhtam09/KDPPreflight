'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
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
    <div className="flex items-center gap-1 bg-white/[0.04] rounded-xl p-1 border border-white/[0.06]">
      {options.map(({ key, label, icon: Icon }) => {
        const active = bookType === key;
        return (
          <button
            key={key}
            onClick={() => setBookType(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              active
                ? 'bg-white/[0.08] text-white/90 shadow-sm'
                : 'text-white/40 hover:text-white/60 hover:bg-white/[0.03]'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
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
      className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer min-h-[180px] flex flex-col items-center justify-center gap-3 ${
        isProcessing
          ? 'border-emerald-500/20 bg-emerald-500/[0.03] cursor-wait'
          : dragActive
            ? 'border-emerald-500/40 bg-emerald-500/[0.06] scale-[1.01]'
            : uploadedFile
              ? 'border-emerald-500/20 bg-emerald-500/[0.03]'
              : 'border-white/10 hover:border-white/20 hover:bg-white/[0.02]'
      }`}
    >
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
          <Loader2 className="w-10 h-10 text-emerald-400/60 animate-spin" />
          <p className="text-sm text-white/50">Analyzing file…</p>
        </>
      ) : uploadedFile ? (
        <>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm text-emerald-400 font-medium">{uploadedFile.name}</p>
            <p className="text-xs text-white/30 mt-0.5">
              {formatSize(uploadedFile.size)}
              {uploadedFile.pageCount ? ` · ${uploadedFile.pageCount} pages` : ''}
            </p>
          </div>
          <p className="text-[11px] text-white/20 mt-1">Click or drop to replace</p>
        </>
      ) : (
        <>
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors duration-300 ${
              dragActive ? 'bg-emerald-500/10' : 'bg-white/[0.04]'
            }`}
          >
            <ZoneIcon
              className={`w-7 h-7 transition-colors duration-300 ${
                dragActive ? 'text-emerald-400' : 'text-white/20'
              }`}
            />
          </div>
          <p className="text-sm text-white/60">{label}</p>
          <p className="text-xs text-white/25">Drop file or click to browse</p>
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
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
        <span className="text-sm font-medium text-white/70">Processing</span>
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
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : isActive ? (
                <Loader2 className="w-4 h-4 text-emerald-400/80 animate-spin" />
              ) : (
                <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
              )}
            </div>
            <span
              className={`text-sm transition-colors duration-300 ${
                isComplete
                  ? 'text-emerald-400/60 line-through'
                  : isActive
                    ? 'text-white/80'
                    : 'text-white/30'
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
  onContinue,
  processingActive,
}: {
  info: DetectionInfo;
  onContinue: () => void;
  processingActive: boolean;
}) {
  const confidencePct = Math.round(info.confidence * 100);
  const confidenceLabel =
    info.confidence >= 0.8 ? 'High' : info.confidence >= 0.5 ? 'Medium' : 'Low';
  const confidenceColor =
    info.confidence >= 0.8
      ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
      : info.confidence >= 0.5
        ? 'text-amber-400 bg-amber-400/10 border-amber-400/20'
        : 'text-red-400 bg-red-400/10 border-red-400/20';

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
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-medium text-white/80">Auto-Detected Settings</span>
        </div>
        <span
          className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${confidenceColor}`}
        >
          <BadgeCheck className="w-3 h-3 inline mr-1 -mt-px" />
          {confidenceLabel} Confidence ({confidencePct}%)
        </span>
      </div>

      {/* Detail grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-px bg-white/[0.04]">
        {details.map(({ icon: DIcon, label, value }) => (
          <div key={label} className="bg-[#0a0a0f] p-4 flex flex-col gap-1.5">
            <DIcon className="w-3.5 h-3.5 text-white/25" />
            <span className="text-[11px] text-white/30 uppercase tracking-wider">{label}</span>
            <span className="text-sm text-white/80 font-medium">{value}</span>
          </div>
        ))}
      </div>

      {/* Continue button */}
      <div className="px-5 py-4 border-t border-white/[0.06] flex justify-end items-center gap-3">
        {processingActive && (
          <span className="flex items-center gap-2 text-xs text-white/40">
            <Loader2 className="w-3.5 h-3.5 text-emerald-400/60 animate-spin" />
            Preparing preview…
          </span>
        )}
        <button
          onClick={onContinue}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-semibold rounded-xl transition-colors duration-200"
        >
          Review &amp; Continue
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
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

  // -----------------------------------------------------------------------
  // Continue to Config step – update store with detected values
  // -----------------------------------------------------------------------
  const handleContinue = useCallback(() => {
    if (!detectionInfo) return;

    const { key: trimKey } = matchTrimSize(detectionInfo.widthIn, detectionInfo.heightIn);
    const hasBleed = detectionInfo.bleed.includes('With Bleed');

    updateBookConfig({
      trimSize: trimKey,
      bleed: hasBleed ? 'bleed' : 'no-bleed',
      pageCount: detectionInfo.pageCount,
      bookType,
      binding: bookType === 'hardcover' ? 'hardcover' : 'paperback',
    });

    setCheckerStep('config');
  }, [detectionInfo, bookType, updateBookConfig, setCheckerStep]);

  // -----------------------------------------------------------------------
  // Determine what upload zones to show and whether continue is enabled
  // -----------------------------------------------------------------------
  const showCoverZone = bookType === 'paperback' || bookType === 'hardcover';
  const showKindleZone = bookType === 'kindle';
  const showManuscriptZone = bookType === 'paperback' || bookType === 'hardcover';

  const canContinue = (() => {
    if (isStepProcessing || coverProcessing || manuscriptProcessing) return false;
    if (bookType === 'kindle') return !!uploadedManuscript;
    // Paperback / Hardcover – at least manuscript needed
    return !!uploadedManuscript;
  })();

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
    <div className="w-full max-w-3xl mx-auto space-y-8">
      {/* ---- Header ---- */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold text-white/90 tracking-tight">
          Import Your Book
        </h2>
        <p className="text-sm text-white/40 max-w-md mx-auto">
          Upload your files and we&apos;ll auto-detect trim size, page count, bleed settings, and more.
        </p>
      </div>

      {/* ---- Type Switcher ---- */}
      <div className="flex justify-center">
        <TypeSwitcher bookType={bookType} setBookType={setBookType} />
      </div>

      {/* ---- Upload Zones ---- */}
      <div
        className={`grid gap-4 ${
          showCoverZone && showManuscriptZone
            ? 'grid-cols-1 sm:grid-cols-2'
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
      <div className="text-[11px] text-white/20 space-y-0.5 px-1">
        {bookType === 'kindle' ? (
          <>
            <p>· Kindle files: EPUB or PDF up to 650 MB</p>
            <p>· We&apos;ll check interior formatting and reflow compatibility</p>
          </>
        ) : (
          <>
            <p>· Cover: PDF, PNG, or JPG up to 650 MB</p>
            <p>· Manuscript: PDF only, minimum 24 pages</p>
            <p>· We&apos;ll auto-detect trim size, bleed, and page count</p>
          </>
        )}
      </div>

      {/* ---- Processing overlay ---- */}
      {anyProcessing && processingSteps.length > 0 && (
        <ProcessingOverlay steps={processingSteps} />
      )}

      {/* ---- Background preview processing indicator ---- */}
      {bgProcessingActive && !anyProcessing && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06]">
          <Loader2 className="w-3.5 h-3.5 text-emerald-400/60 animate-spin" />
          <span className="text-xs text-white/40">
            {processingStatus === 'parsing' && 'Parsing PDF...'}
            {processingStatus === 'rendering' && 'Rendering pages for preview...'}
            {processingStatus === 'analyzing' && 'Analyzing pages for issues...'}
            {'Preparing preview...'}
          </span>
        </div>
      )}

      {/* ---- Preview ready indicator ---- */}
      {processingStatus === 'ready' && previewReady && !anyProcessing && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/[0.04] border border-emerald-500/[0.10]">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400/70" />
          <span className="text-xs text-emerald-400/50">Preview ready — all pages rendered and analyzed</span>
        </div>
      )}

      {/* ---- Detection results ---- */}
      {detectionInfo && !anyProcessing && (
        <DetectionResults
          info={detectionInfo}
          onContinue={handleContinue}
          processingActive={bgProcessingActive}
        />
      )}

      {/* ---- Continue button (always visible at bottom when files present but no detection yet) ---- */}
      {!detectionInfo && !anyProcessing && canContinue && (
        <div className="flex justify-end">
          <button
            onClick={handleContinue}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-semibold rounded-xl transition-colors duration-200"
          >
            Continue to Config
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
