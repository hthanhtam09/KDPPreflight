'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  FileText,
  BookOpen,
  Tablet,
  Book,
  Loader2,
  CheckCircle2,
  ArrowRight,
  ScanLine,
} from 'lucide-react';
import { useAppStore } from '@/store/use-app-store';
import { loadPDF, analyzePDF } from '@/engine/pdf-processor';
import { PDFAnalysisResult } from '@/engine/validator';
import {
  TRIM_SIZES,
  SPINE_WIDTH_FACTORS,
  BLEED_SIZE_IN,
  calculateMeasurements,
} from '@/engine/kdp-constants';
import type { KDPFormat, UploadedFile, DetectedMetadata, TrimSizeKey } from '@/types/kdp';

// ---------------------------------------------------------------------------
// Animation sequence messages for the auto-detection scan
// ---------------------------------------------------------------------------
const SCAN_MESSAGES = [
  'Analyzing trim size…',
  'Checking bleed setup…',
  'Detecting page count…',
  'Measuring dimensions…',
  'Preparing preview…',
];

// ---------------------------------------------------------------------------
// Format config helpers
// ---------------------------------------------------------------------------
interface FormatConfig {
  key: KDPFormat;
  label: string;
  icon: typeof Tablet;
  zones: { id: 'manuscript' | 'cover' | 'kindle-file'; label: string; accept: string }[];
}

const FORMAT_CONFIGS: FormatConfig[] = [
  {
    key: 'kindle',
    label: 'Kindle',
    icon: Tablet,
    zones: [
      { id: 'kindle-file', label: 'Upload your Kindle file', accept: '.epub,.pdf' },
    ],
  },
  {
    key: 'paperback',
    label: 'Paperback',
    icon: BookOpen,
    zones: [
      { id: 'manuscript', label: 'Upload Manuscript', accept: '.pdf' },
      { id: 'cover', label: 'Upload Cover', accept: '.pdf' },
    ],
  },
  {
    key: 'hardcover',
    label: 'Hardcover',
    icon: Book,
    zones: [
      { id: 'manuscript', label: 'Upload Manuscript', accept: '.pdf' },
      { id: 'cover', label: 'Upload Cover', accept: '.pdf' },
    ],
  },
];

// ---------------------------------------------------------------------------
// Trim-size detection helper
// ---------------------------------------------------------------------------
function detectTrimSize(
  widthIn: number,
  heightIn: number
): { key: TrimSizeKey; hasBleed: boolean } {
  let bestKey: TrimSizeKey = 'custom';
  let bestDist = Infinity;
  let hasBleed = false;

  for (const [key, trim] of Object.entries(TRIM_SIZES)) {
    if (key === 'custom') continue;
    const dw = Math.abs(widthIn - trim.widthIn);
    const dh = Math.abs(heightIn - trim.heightIn);
    const dist = Math.sqrt(dw * dw + dh * dh);
    if (dist < bestDist) {
      bestDist = dist;
      bestKey = key as TrimSizeKey;
    }
  }

  // Also check swapped orientation
  for (const [key, trim] of Object.entries(TRIM_SIZES)) {
    if (key === 'custom') continue;
    const dw = Math.abs(widthIn - trim.heightIn);
    const dh = Math.abs(heightIn - trim.widthIn);
    const dist = Math.sqrt(dw * dw + dh * dh);
    if (dist < bestDist) {
      bestDist = dist;
      bestKey = key as TrimSizeKey;
    }
  }

  const closest = TRIM_SIZES[bestKey];
  if (closest.key !== 'custom') {
    const dw = Math.abs(widthIn - closest.widthIn);
    const dh = Math.abs(heightIn - closest.heightIn);
    if (dw > 0.1 || dh > 0.1) {
      hasBleed = Math.abs(dw - BLEED_SIZE_IN) < 0.02 || Math.abs(dh - BLEED_SIZE_IN) < 0.02;
    }
  }

  return { key: bestKey, hasBleed };
}

// ---------------------------------------------------------------------------
// UploadZone – premium cinematic drag-and-drop area
// ---------------------------------------------------------------------------
function UploadZone({
  label,
  accept,
  onFile,
  isProcessing,
  uploadedFile,
}: {
  label: string;
  accept: string;
  onFile: (file: File) => void;
  isProcessing: boolean;
  uploadedFile: UploadedFile | null;
}) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files[0];
      if (file) onFile(file);
    },
    [onFile]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) onFile(f);
    },
    [onFile]
  );

  return (
    <motion.div
      onDragOver={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`relative min-h-[200px] flex flex-col items-center justify-center rounded-2xl cursor-pointer transition-all duration-300 overflow-hidden
        ${
          dragActive
            ? 'border-2 border-emerald-400/50 bg-emerald-400/[0.06] shadow-[0_0_40px_rgba(52,211,153,0.1)]'
            : uploadedFile
              ? 'border border-emerald-400/20 bg-emerald-400/[0.03]'
              : 'border-2 border-dashed border-white/[0.08] bg-white/[0.02] hover:border-white/[0.15] hover:bg-white/[0.04] hover:shadow-[0_0_60px_rgba(255,255,255,0.02)]'
        }`}
      whileHover={
        !uploadedFile && !isProcessing
          ? { scale: 1.005 }
          : undefined
      }
    >
      {/* Subtle pulse animation to invite interaction */}
      {!uploadedFile && !isProcessing && !dragActive && (
        <motion.div
          className="absolute inset-0 rounded-2xl border-2 border-dashed border-white/[0.04]"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Glow ring on hover */}
      <AnimatePresence>
        {dragActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-0 rounded-2xl bg-gradient-to-b from-emerald-400/[0.04] to-transparent pointer-events-none"
          />
        )}
      </AnimatePresence>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
      />

      {/* Content states */}
      <div className="relative z-10 flex flex-col items-center gap-3 p-6">
        {isProcessing ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <ScanLine className="w-10 h-10 text-white/30" />
            </motion.div>
            <p className="text-sm text-white/40 font-medium">Scanning file…</p>
          </>
        ) : uploadedFile ? (
          <>
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-sm text-emerald-400 font-medium text-center break-all"
            >
              {uploadedFile.name}
            </motion.p>
            <p className="text-xs text-white/25">Click or drop to replace</p>
          </>
        ) : (
          <>
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Upload className="w-10 h-10 text-white/15" />
            </motion.div>
            <p className="text-sm text-white/50 font-medium">{label}</p>
            <p className="text-xs text-white/25">Drag & drop or click to browse</p>
          </>
        )}
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// ScanSequence – animated analysis messages
// ---------------------------------------------------------------------------
function ScanSequence({ onComplete }: { onComplete: () => void }) {
  const [visibleIndex, setVisibleIndex] = useState(-1);

  useEffect(() => {
    let cancelled = false;
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    SCAN_MESSAGES.forEach((_, i) => {
      timeouts.push(
        setTimeout(() => {
          if (!cancelled) setVisibleIndex(i);
        }, i * 500)
      );
    });

    // After all messages shown, wait briefly then complete
    timeouts.push(
      setTimeout(() => {
        if (!cancelled) onComplete();
      }, SCAN_MESSAGES.length * 500 + 300)
    );

    return () => {
      cancelled = true;
      timeouts.forEach(clearTimeout);
    };
  }, [onComplete]);

  return (
    <div className="space-y-2">
      {SCAN_MESSAGES.map((msg, i) => (
        <motion.div
          key={msg}
          initial={{ opacity: 0, x: -10 }}
          animate={
            i <= visibleIndex
              ? { opacity: i < visibleIndex ? 0.35 : 1, x: 0 }
              : { opacity: 0, x: -10 }
          }
          transition={{ duration: 0.3 }}
          className="flex items-center gap-2.5"
        >
          {i < visibleIndex ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400/60 shrink-0" />
          ) : i === visibleIndex ? (
            <Loader2 className="w-3.5 h-3.5 text-white/50 shrink-0 animate-spin" />
          ) : (
            <div className="w-3.5 h-3.5 shrink-0" />
          )}
          <span
            className={`text-xs ${
              i < visibleIndex
                ? 'text-white/30'
                : i === visibleIndex
                  ? 'text-white/70'
                  : 'text-white/10'
            }`}
          >
            {msg}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// DetectionSummaryCard – shows detected metadata
// ---------------------------------------------------------------------------
function DetectionSummaryCard({ meta }: { meta: DetectedMetadata }) {
  const trim = meta.trimSize ? TRIM_SIZES[meta.trimSize] : null;

  const rows: { label: string; value: string }[] = [
    {
      label: 'Trim Size',
      value: trim ? trim.label : `${meta.widthIn.toFixed(2)}" × ${meta.heightIn.toFixed(2)}"`,
    },
    { label: 'Page Count', value: String(meta.pageCount) },
    { label: 'Bleed', value: meta.hasBleed ? 'Yes (0.125")' : 'None' },
    { label: 'Orientation', value: meta.orientation === 'portrait' ? 'Portrait' : 'Landscape' },
    { label: 'Spine Width', value: `${meta.spineWidthIn.toFixed(4)}"` },
    { label: 'DPI', value: String(meta.dpi) },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 space-y-4"
    >
      <div className="flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        <h3 className="text-sm text-white/80 font-semibold tracking-wide">
          Detection Complete
        </h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {rows.map((row) => (
          <div
            key={row.label}
            className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-3"
          >
            <p className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5">
              {row.label}
            </p>
            <p className="text-sm text-white/80 font-medium">{row.value}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main ImportStep Component
// ---------------------------------------------------------------------------
export default function ImportStep() {
  const {
    kdpFormat,
    setKdpFormat,
    uploadedCover,
    uploadedManuscript,
    setUploadedCover,
    setUploadedManuscript,
    setDetectedMetadata,
    setCheckerStep,
    updateBookConfig,
  } = useAppStore();

  // Per-zone processing state
  const [manuscriptProcessing, setManuscriptProcessing] = useState(false);
  const [coverProcessing, setCoverProcessing] = useState(false);

  // Detection animation state
  const [detecting, setDetecting] = useState(false);
  const [detectionComplete, setDetectionComplete] = useState(false);
  const [detectedMeta, setDetectedMeta] = useState<DetectedMetadata | null>(null);

  // Clear detection state when format changes
  useEffect(() => {
    setDetectionComplete(false);
    setDetectedMeta(null);
    setDetecting(false);
  }, [kdpFormat]);

  // -----------------------------------------------------------------------
  // Process a single PDF and return DetectedMetadata
  // -----------------------------------------------------------------------
  const processPDF = useCallback(
    async (file: File, zoneType: 'manuscript' | 'cover' | 'kindle-file') => {
      const result = await loadPDF(file);
      const analysis: PDFAnalysisResult = analyzePDF(
        result.widthIn,
        result.heightIn,
        result.pageCount,
        result.pages
      );

      // Detect trim size
      const { key: trimKey, hasBleed } = detectTrimSize(
        analysis.widthIn,
        analysis.heightIn
      );

      // Determine orientation
      const orientation: 'portrait' | 'landscape' =
        analysis.heightIn >= analysis.widthIn ? 'portrait' : 'landscape';

      // Spine width (use white paper as default; user can change later)
      const paperType = 'white';
      const spineWidthIn = Math.round(analysis.pageCount * SPINE_WIDTH_FACTORS[paperType] * 10000) / 10000;

      const probableFormat: KDPFormat =
        zoneType === 'kindle-file'
          ? 'kindle'
          : kdpFormat === 'kindle'
            ? 'paperback' // fall back
            : kdpFormat;

      const meta: DetectedMetadata = {
        trimSize: trimKey,
        widthIn: analysis.widthIn,
        heightIn: analysis.heightIn,
        pageCount: analysis.pageCount,
        hasBleed,
        probableFormat,
        spineWidthIn,
        orientation,
        dpi: analysis.dpi,
        isGrayscale: analysis.isGrayscale,
        hasTransparency: analysis.hasTransparency,
        colorProfile: 'sRGB',
      };

      return { meta, result, analysis };
    },
    [kdpFormat]
  );

  // -----------------------------------------------------------------------
  // Handle file upload for a zone
  // -----------------------------------------------------------------------
  const handleFileUpload = useCallback(
    async (file: File, zoneType: 'manuscript' | 'cover' | 'kindle-file') => {
      // Set processing indicator
      if (zoneType === 'manuscript' || zoneType === 'kindle-file') {
        setManuscriptProcessing(true);
      }
      if (zoneType === 'cover') {
        setCoverProcessing(true);
      }

      // Reset detection state
      setDetectionComplete(false);
      setDetectedMeta(null);

      try {
        const isPDF =
          file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

        if (isPDF) {
          const { meta, result } = await processPDF(file, zoneType);

          // Store the uploaded file in the app store
          const uploaded: UploadedFile = {
            id: crypto.randomUUID(),
            name: file.name,
            size: file.size,
            type: file.type || 'application/pdf',
            file,
            pageCount: result.pageCount,
            dimensions: { width: result.widthIn * 300, height: result.heightIn * 300 },
            dataUrl: result.pages[0]?.dataUrl,
            pages: result.pages.map((p) => ({
              index: p.index,
              dataUrl: p.dataUrl,
              width: p.width,
              height: p.height,
              isBlank: p.isBlank,
            })),
          };

          if (zoneType === 'manuscript' || zoneType === 'kindle-file') {
            setUploadedManuscript(uploaded);
          } else {
            setUploadedCover(uploaded);
          }

          // Start detection animation
          setDetecting(true);
          // We'll complete detection after the scan animation finishes
          // Store meta temporarily so we can use it after animation
          setDetectedMeta(meta);
        } else {
          // EPUB or other format for Kindle – store without PDF analysis
          const uploaded: UploadedFile = {
            id: crypto.randomUUID(),
            name: file.name,
            size: file.size,
            type: file.type,
            file,
          };

          if (zoneType === 'kindle-file') {
            setUploadedManuscript(uploaded);
          } else {
            setUploadedCover(uploaded);
          }

          // Minimal metadata for non-PDF
          const meta: DetectedMetadata = {
            trimSize: null,
            widthIn: 0,
            heightIn: 0,
            pageCount: 0,
            hasBleed: false,
            probableFormat: 'kindle',
            spineWidthIn: 0,
            orientation: 'portrait',
            dpi: 0,
            isGrayscale: false,
            hasTransparency: false,
            colorProfile: 'sRGB',
          };

          setDetecting(true);
          setDetectedMeta(meta);
        }
      } catch (err) {
        console.error('Error processing file:', err);
      } finally {
        setManuscriptProcessing(false);
        setCoverProcessing(false);
      }
    },
    [processPDF, setUploadedManuscript, setUploadedCover]
  );

  // -----------------------------------------------------------------------
  // Called when scan animation finishes
  // -----------------------------------------------------------------------
  const handleScanComplete = useCallback(() => {
    setDetecting(false);
    if (detectedMeta) {
      setDetectedMetadata(detectedMeta);
      // Also update bookConfig with detected values
      updateBookConfig({
        trimSize: detectedMeta.trimSize || '6x9',
        pageCount: detectedMeta.pageCount,
        bleed: detectedMeta.hasBleed ? 'bleed' : 'no-bleed',
        binding: kdpFormat === 'hardcover' ? 'hardcover' : 'paperback',
      });
      setDetectionComplete(true);
    }
  }, [detectedMeta, setDetectedMetadata, updateBookConfig, kdpFormat]);

  // -----------------------------------------------------------------------
  // Determine if all required files are uploaded
  // -----------------------------------------------------------------------
  const formatConfig = FORMAT_CONFIGS.find((f) => f.key === kdpFormat)!;
  const allFilesUploaded = formatConfig.zones.every((zone) => {
    if (zone.id === 'manuscript' || zone.id === 'kindle-file')
      return !!uploadedManuscript;
    if (zone.id === 'cover') return !!uploadedCover;
    return false;
  });

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* ── Format Selector ── */}
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-1 bg-white/[0.03] border border-white/[0.06] rounded-full p-1">
          {FORMAT_CONFIGS.map((fmt) => {
            const Icon = fmt.icon;
            const isActive = kdpFormat === fmt.key;
            return (
              <button
                key={fmt.key}
                onClick={() => setKdpFormat(fmt.key)}
                className={`
                  relative flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200
                  ${
                    isActive
                      ? 'bg-white/[0.06] text-white shadow-[0_0_20px_rgba(255,255,255,0.04)]'
                      : 'text-white/35 hover:text-white/55'
                  }
                `}
              >
                {isActive && (
                  <motion.div
                    layoutId="format-pill"
                    className="absolute inset-0 bg-white/[0.06] rounded-full"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon className="w-4 h-4 relative z-10" />
                <span className="relative z-10">{fmt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Upload Zones ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={kdpFormat}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3 }}
          className={`grid gap-6 ${
            formatConfig.zones.length > 1
              ? 'grid-cols-1 md:grid-cols-2'
              : 'grid-cols-1 max-w-lg mx-auto'
          }`}
        >
          {formatConfig.zones.map((zone) => (
            <UploadZone
              key={zone.id}
              label={zone.label}
              accept={zone.accept}
              onFile={(file) => handleFileUpload(file, zone.id)}
              isProcessing={
                zone.id === 'cover'
                  ? coverProcessing
                  : manuscriptProcessing
              }
              uploadedFile={
                zone.id === 'cover'
                  ? uploadedCover
                  : uploadedManuscript
              }
            />
          ))}
        </motion.div>
      </AnimatePresence>

      {/* ── Scan Animation ── */}
      <AnimatePresence>
        {detecting && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-4 h-4 text-white/40" />
                <h3 className="text-sm text-white/60 font-medium">
                  Auto-detecting book properties
                </h3>
              </div>
              <ScanSequence onComplete={handleScanComplete} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Detection Summary ── */}
      <AnimatePresence>
        {detectionComplete && detectedMeta && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <DetectionSummaryCard meta={detectedMeta} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Continue Button ── */}
      <AnimatePresence>
        {allFilesUploaded && detectionComplete && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="flex flex-col items-center gap-3 pt-2"
          >
            <p className="text-sm text-emerald-400/70 font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Ready for configuration
            </p>
            <button
              onClick={() => setCheckerStep('config')}
              className="group flex items-center gap-2 px-7 py-3 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] hover:border-white/[0.15] rounded-full text-sm text-white/80 hover:text-white font-medium transition-all duration-200"
            >
              Continue to Config
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
