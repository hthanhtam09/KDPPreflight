'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  FileText,
  ImageIcon,
  BookOpen,
  BookMarked,
  Smartphone,
  CheckCircle2,
  Loader2,
  X,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { useAppStore } from '@/store/use-app-store';
import { BookType, TrimSizeKey, DetectedConfig, UploadedFile } from '@/types/kdp';
import { loadPDF, loadImage } from '@/engine/pdf-processor';
import { TRIM_SIZES, BLEED_SIZE_IN } from '@/engine/kdp-constants';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// ---------------------------------------------------------------------------
// Auto-Detection: Match PDF dimensions to closest KDP trim size
// ---------------------------------------------------------------------------

async function detectConfigFromPDF(file: File): Promise<DetectedConfig> {
  const result = await loadPDF(file, { maxPages: 5, renderScale: 1.0 });
  const { widthIn, heightIn, pageCount } = result;

  // Find closest trim size
  let bestMatch: TrimSizeKey | null = null;
  let bestDistance = Infinity;

  for (const [key, trim] of Object.entries(TRIM_SIZES)) {
    if (key === 'custom') continue;
    // Check both orientations
    const d1 = Math.abs(trim.widthIn - widthIn) + Math.abs(trim.heightIn - heightIn);
    const d2 = Math.abs(trim.heightIn - widthIn) + Math.abs(trim.widthIn - heightIn);
    const dist = Math.min(d1, d2);
    if (dist < bestDistance) {
      bestDistance = dist;
      bestMatch = key as TrimSizeKey;
    }
  }

  // Confidence based on how close the match is
  const confidence = bestDistance < 0.02 ? 0.95 : bestDistance < 0.125 ? 0.8 : bestDistance < 0.5 ? 0.5 : 0.3;

  // Detect bleed: if dimensions are larger than trim by ~0.125" on each side
  let bleed: 'bleed' | 'no-bleed' = 'no-bleed';
  if (bestMatch && bestMatch !== 'custom') {
    const trim = TRIM_SIZES[bestMatch];
    const expectedBleedWidth = trim.widthIn + BLEED_SIZE_IN * 2;
    const expectedBleedHeight = trim.heightIn + BLEED_SIZE_IN * 2;
    if (
      Math.abs(widthIn - expectedBleedWidth) < 0.05 ||
      Math.abs(heightIn - expectedBleedHeight) < 0.05
    ) {
      bleed = 'bleed';
    }
  }

  return {
    trimSize: bestMatch || undefined,
    bleed,
    pageCount,
    confidence,
    paper: 'white',
    bookType: 'paperback',
  };
}

// ---------------------------------------------------------------------------
// ImportStep Component
// ---------------------------------------------------------------------------

export default function ImportStep() {
  const {
    uploadedCover,
    uploadedManuscript,
    setUploadedCover,
    setUploadedManuscript,
    setDetectedConfig,
    setPreviewFlowStep,
    setCoverDataUrl,
    setPdfPageDataUrl,
    detectedConfig,
    bookConfig,
    updateBookConfig,
  } = useAppStore();

  const [bookType, setBookType] = useState<BookType>(
    detectedConfig?.bookType || bookConfig.bookType || 'paperback'
  );
  const [coverProcessing, setCoverProcessing] = useState(false);
  const [manuscriptProcessing, setManuscriptProcessing] = useState(false);
  const [coverDragActive, setCoverDragActive] = useState(false);
  const [manuscriptDragActive, setManuscriptDragActive] = useState(false);
  const [kindleDragActive, setKindleDragActive] = useState(false);
  const [kindleProcessing, setKindleProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const manuscriptInputRef = useRef<HTMLInputElement>(null);
  const kindleInputRef = useRef<HTMLInputElement>(null);

  const isPaperOrHard = bookType === 'paperback' || bookType === 'hardcover';
  const canContinue = isPaperOrHard
    ? !!uploadedCover || !!uploadedManuscript
    : !!uploadedManuscript; // Kindle just needs the file

  // ---- Cover upload handler ----
  const handleCoverUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      setError('Cover must be a PDF, PNG, or JPEG file');
      return;
    }
    setCoverProcessing(true);
    setError(null);
    try {
      let dataUrl: string;
      let width: number;
      let height: number;

      if (file.type === 'application/pdf') {
        const result = await loadPDF(file, { maxPages: 1, renderScale: 2.5 });
        if (result.pages.length === 0 || !result.pages[0].dataUrl) {
          throw new Error('Cover PDF has no renderable pages');
        }
        dataUrl = result.pages[0].dataUrl;
        width = result.widthIn;
        height = result.heightIn;

        // Auto-detect from cover PDF
        const detected = await detectConfigFromPDF(file);
        if (detected.confidence > 0.3) {
          setDetectedConfig(detected);
          if (detected.trimSize) {
            updateBookConfig({ trimSize: detected.trimSize });
          }
          if (detected.pageCount) {
            updateBookConfig({ pageCount: detected.pageCount });
          }
          if (detected.bleed) {
            updateBookConfig({ bleed: detected.bleed });
          }
        }
      } else {
        const result = await loadImage(file);
        dataUrl = result.dataUrl;
        width = result.width;
        height = result.height;
      }

      setCoverDataUrl(dataUrl);
      setUploadedCover({
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        type: file.type,
        file,
        dimensions: { width, height },
        dataUrl,
      });
    } catch (err) {
      setError('Failed to process cover file');
      console.error(err);
    } finally {
      setCoverProcessing(false);
    }
  }, [setUploadedCover, setCoverDataUrl, setDetectedConfig, updateBookConfig]);

  // ---- Manuscript upload handler ----
  const handleManuscriptUpload = useCallback(async (file: File) => {
    if (file.type !== 'application/pdf') {
      setError('Manuscript must be a PDF file');
      return;
    }
    setManuscriptProcessing(true);
    setError(null);
    try {
      const result = await loadPDF(file, { maxPages: 50, renderScale: 1.5 });

      // Store pages
      for (let i = 0; i < result.pages.length; i++) {
        const page = result.pages[i];
        if (page.dataUrl) {
          setPdfPageDataUrl(i, page.dataUrl);
        }
      }

      setUploadedManuscript({
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        type: file.type,
        file,
        pageCount: result.pageCount,
        dimensions: { width: result.widthIn * 300, height: result.heightIn * 300 },
        dataUrl: '',
      });

      // Auto-detect from manuscript
      const detected = await detectConfigFromPDF(file);
      if (detected.confidence > 0.3) {
        // Merge with existing detected config
        setDetectedConfig(prev => prev ? { ...prev, ...detected } : detected);
        if (detected.trimSize && !detectedConfig?.trimSize) {
          updateBookConfig({ trimSize: detected.trimSize });
        }
        if (detected.pageCount) {
          updateBookConfig({ pageCount: detected.pageCount });
        }
      }
    } catch (err) {
      setError('Failed to process manuscript');
      console.error(err);
    } finally {
      setManuscriptProcessing(false);
    }
  }, [setUploadedManuscript, setPdfPageDataUrl, setDetectedConfig, updateBookConfig, detectedConfig]);

  // ---- Kindle file upload handler ----
  const handleKindleUpload = useCallback(async (file: File) => {
    if (file.type !== 'application/pdf' && !file.name.endsWith('.epub')) {
      setError('Kindle file must be a PDF or EPUB');
      return;
    }
    setKindleProcessing(true);
    setError(null);
    try {
      if (file.type === 'application/pdf') {
        const result = await loadPDF(file, { maxPages: 50, renderScale: 1.5 });
        for (let i = 0; i < result.pages.length; i++) {
          const page = result.pages[i];
          if (page.dataUrl) {
            setPdfPageDataUrl(i, page.dataUrl);
          }
        }
        setUploadedManuscript({
          id: crypto.randomUUID(),
          name: file.name,
          size: file.size,
          type: file.type,
          file,
          pageCount: result.pageCount,
          dimensions: { width: result.widthIn * 300, height: result.heightIn * 300 },
          dataUrl: '',
        });

        // Detect from kindle PDF
        const detected = await detectConfigFromPDF(file);
        detected.bookType = 'kindle';
        setDetectedConfig(detected);
        if (detected.pageCount) {
          updateBookConfig({ pageCount: detected.pageCount });
        }
      }
      // EPUB: just store the reference, no rendering
      else {
        setUploadedManuscript({
          id: crypto.randomUUID(),
          name: file.name,
          size: file.size,
          type: file.type,
          file,
          dataUrl: '',
        });
      }
    } catch (err) {
      setError('Failed to process Kindle file');
      console.error(err);
    } finally {
      setKindleProcessing(false);
    }
  }, [setUploadedManuscript, setPdfPageDataUrl, setDetectedConfig, updateBookConfig]);

  // ---- Remove file handlers ----
  const removeCover = useCallback(() => {
    setUploadedCover(null);
    setCoverDataUrl('');
  }, [setUploadedCover, setCoverDataUrl]);

  const removeManuscript = useCallback(() => {
    setUploadedManuscript(null);
  }, [setUploadedManuscript]);

  // ---- Book type change ----
  const handleBookTypeChange = useCallback((type: BookType) => {
    setBookType(type);
    updateBookConfig({ bookType: type, binding: type === 'hardcover' ? 'hardcover' : 'paperback' });
    if (detectedConfig) {
      setDetectedConfig({ ...detectedConfig, bookType: type });
    }
  }, [updateBookConfig, detectedConfig, setDetectedConfig]);

  // ---- Continue handler ----
  const handleContinue = useCallback(() => {
    // Ensure book type is synced
    updateBookConfig({ bookType, binding: bookType === 'hardcover' ? 'hardcover' : 'paperback' });
    setPreviewFlowStep('config');
  }, [bookType, updateBookConfig, setPreviewFlowStep]);

  // ---- Drop handlers ----
  const handleCoverDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setCoverDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleCoverUpload(file);
  }, [handleCoverUpload]);

  const handleManuscriptDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setManuscriptDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleManuscriptUpload(file);
  }, [handleManuscriptUpload]);

  const handleKindleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setKindleDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleKindleUpload(file);
  }, [handleKindleUpload]);

  return (
    <div className="h-full overflow-y-auto bg-[#0a0a0f]">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center space-y-3"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/15 to-fuchsia-500/15 border border-violet-500/20">
            <Upload className="w-7 h-7 text-violet-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white/90">
            Import Your Book Files
          </h1>
          <p className="text-white/40 text-sm max-w-md mx-auto">
            Upload your cover and manuscript files. We&apos;ll auto-detect trim size, page count, and other settings.
          </p>
        </motion.div>

        {/* Book Type Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <label className="text-xs text-white/50 uppercase tracking-wider mb-3 block">
            Book Type
          </label>
          <div className="grid grid-cols-3 gap-3">
            <BookTypeCard
              active={bookType === 'paperback'}
              onClick={() => handleBookTypeChange('paperback')}
              icon={<BookOpen className="w-6 h-6" />}
              label="Paperback"
              description="Soft cover binding"
            />
            <BookTypeCard
              active={bookType === 'hardcover'}
              onClick={() => handleBookTypeChange('hardcover')}
              icon={<BookMarked className="w-6 h-6" />}
              label="Hardcover"
              description="Case wrap binding"
            />
            <BookTypeCard
              active={bookType === 'kindle'}
              onClick={() => handleBookTypeChange('kindle')}
              icon={<Smartphone className="w-6 h-6" />}
              label="Kindle"
              description="E-book preview"
            />
          </div>
        </motion.div>

        {/* Upload Zones */}
        <AnimatePresence mode="wait">
          {isPaperOrHard ? (
            <motion.div
              key="print"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Cover Upload */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <label className="text-xs text-white/50 uppercase tracking-wider">
                    Cover File
                  </label>
                  <Badge variant="outline" className="text-[10px] border-violet-500/30 text-violet-400">
                    Required
                  </Badge>
                </div>
                <FileUploadZone
                  dragActive={coverDragActive}
                  onDragOver={(e) => { e.preventDefault(); setCoverDragActive(true); }}
                  onDragLeave={() => setCoverDragActive(false)}
                  onDrop={handleCoverDrop}
                  onClick={() => coverInputRef.current?.click()}
                  accept=".png,.jpg,.jpeg,.pdf"
                  processing={coverProcessing}
                >
                  {uploadedCover ? (
                    <UploadedFilePreview
                      file={uploadedCover}
                      onRemove={removeCover}
                      thumbnail={uploadedCover.dataUrl}
                    />
                  ) : (
                    <UploadPrompt
                      icon={<ImageIcon className="w-8 h-8" />}
                      title="Upload Cover"
                      subtitle="Full cover spread PDF, PNG, or JPEG"
                    />
                  )}
                </FileUploadZone>
                <input
                  ref={coverInputRef}
                  type="file"
                  accept=".png,.jpg,.jpeg,.pdf"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCoverUpload(f); }}
                  className="hidden"
                />
              </div>

              {/* Manuscript Upload */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <label className="text-xs text-white/50 uppercase tracking-wider">
                    Interior Manuscript
                  </label>
                  <Badge variant="outline" className="text-[10px] border-white/20 text-white/40">
                    Optional
                  </Badge>
                </div>
                <FileUploadZone
                  dragActive={manuscriptDragActive}
                  onDragOver={(e) => { e.preventDefault(); setManuscriptDragActive(true); }}
                  onDragLeave={() => setManuscriptDragActive(false)}
                  onDrop={handleManuscriptDrop}
                  onClick={() => manuscriptInputRef.current?.click()}
                  accept=".pdf"
                  processing={manuscriptProcessing}
                >
                  {uploadedManuscript ? (
                    <UploadedFilePreview
                      file={uploadedManuscript}
                      onRemove={removeManuscript}
                      pageCount={uploadedManuscript.pageCount}
                    />
                  ) : (
                    <UploadPrompt
                      icon={<FileText className="w-8 h-8" />}
                      title="Upload Manuscript"
                      subtitle="Interior pages PDF"
                    />
                  )}
                </FileUploadZone>
                <input
                  ref={manuscriptInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleManuscriptUpload(f); }}
                  className="hidden"
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="kindle"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Kindle file upload */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <label className="text-xs text-white/50 uppercase tracking-wider">
                    Kindle File
                  </label>
                  <Badge variant="outline" className="text-[10px] border-violet-500/30 text-violet-400">
                    Required
                  </Badge>
                </div>
                <FileUploadZone
                  dragActive={kindleDragActive}
                  onDragOver={(e) => { e.preventDefault(); setKindleDragActive(true); }}
                  onDragLeave={() => setKindleDragActive(false)}
                  onDrop={handleKindleDrop}
                  onClick={() => kindleInputRef.current?.click()}
                  accept=".pdf,.epub"
                  processing={kindleProcessing}
                >
                  {uploadedManuscript ? (
                    <UploadedFilePreview
                      file={uploadedManuscript}
                      onRemove={removeManuscript}
                      pageCount={uploadedManuscript.pageCount}
                    />
                  ) : (
                    <UploadPrompt
                      icon={<Smartphone className="w-8 h-8" />}
                      title="Upload Kindle File"
                      subtitle="EPUB or PDF format"
                    />
                  )}
                </FileUploadZone>
                <input
                  ref={kindleInputRef}
                  type="file"
                  accept=".pdf,.epub"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleKindleUpload(f); }}
                  className="hidden"
                />
              </div>

              {/* Optional Kindle cover */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <label className="text-xs text-white/50 uppercase tracking-wider">
                    Cover Image
                  </label>
                  <Badge variant="outline" className="text-[10px] border-white/20 text-white/40">
                    Optional
                  </Badge>
                </div>
                <FileUploadZone
                  dragActive={coverDragActive}
                  onDragOver={(e) => { e.preventDefault(); setCoverDragActive(true); }}
                  onDragLeave={() => setCoverDragActive(false)}
                  onDrop={handleCoverDrop}
                  onClick={() => coverInputRef.current?.click()}
                  accept=".png,.jpg,.jpeg,.pdf"
                  processing={coverProcessing}
                >
                  {uploadedCover ? (
                    <UploadedFilePreview
                      file={uploadedCover}
                      onRemove={removeCover}
                      thumbnail={uploadedCover.dataUrl}
                    />
                  ) : (
                    <UploadPrompt
                      icon={<ImageIcon className="w-8 h-8" />}
                      title="Upload Cover (Optional)"
                      subtitle="Display cover on Kindle device"
                    />
                  )}
                </FileUploadZone>
                <input
                  ref={coverInputRef}
                  type="file"
                  accept=".png,.jpg,.jpeg,.pdf"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCoverUpload(f); }}
                  className="hidden"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Auto-detection Result */}
        <AnimatePresence>
          {detectedConfig && detectedConfig.confidence > 0.3 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-violet-500/[0.06] border border-violet-500/20 rounded-xl p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-violet-400" />
                <span className="text-sm font-medium text-violet-300">Auto-Detected</span>
                <Badge variant="outline" className="text-[10px] border-violet-500/30 text-violet-400">
                  {Math.round(detectedConfig.confidence * 100)}% confidence
                </Badge>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {detectedConfig.trimSize && (
                  <div>
                    <span className="text-white/30">Trim Size</span>
                    <p className="text-white/70 font-medium mt-0.5">
                      {TRIM_SIZES[detectedConfig.trimSize]?.label || detectedConfig.trimSize}
                    </p>
                  </div>
                )}
                {detectedConfig.pageCount && (
                  <div>
                    <span className="text-white/30">Pages</span>
                    <p className="text-white/70 font-medium mt-0.5">{detectedConfig.pageCount}</p>
                  </div>
                )}
                {detectedConfig.bleed && (
                  <div>
                    <span className="text-white/30">Bleed</span>
                    <p className="text-white/70 font-medium mt-0.5 capitalize">
                      {detectedConfig.bleed.replace('-', ' ')}
                    </p>
                  </div>
                )}
                <div>
                  <span className="text-white/30">Type</span>
                  <p className="text-white/70 font-medium mt-0.5 capitalize">{bookType}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-500/[0.06] border border-red-500/20 rounded-xl p-4 flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <span className="text-red-300 text-sm">{error}</span>
              <button onClick={() => setError(null)} className="ml-auto text-white/30 hover:text-white/60">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Continue Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex justify-end"
        >
          <Button
            onClick={handleContinue}
            disabled={!canContinue}
            className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white px-8 py-3 rounded-xl text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Continue to Config
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function BookTypeCard({
  active,
  onClick,
  icon,
  label,
  description,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  description: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
        active
          ? 'bg-violet-500/10 border-violet-500/40 text-white shadow-lg shadow-violet-500/5'
          : 'bg-white/[0.02] border-white/[0.06] text-white/40 hover:bg-white/[0.04] hover:border-white/10 hover:text-white/60'
      }`}
    >
      {active && (
        <motion.div
          layoutId="bookTypeGlow"
          className="absolute inset-0 rounded-xl bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5"
        />
      )}
      <div className={`relative z-10 ${active ? 'text-violet-400' : ''}`}>
        {icon}
      </div>
      <div className="relative z-10 text-center">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-[10px] opacity-60">{description}</p>
      </div>
      {active && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-2 right-2"
        >
          <CheckCircle2 className="w-4 h-4 text-violet-400" />
        </motion.div>
      )}
    </button>
  );
}

function FileUploadZone({
  dragActive,
  onDragOver,
  onDragLeave,
  onDrop,
  onClick,
  accept,
  processing,
  children,
}: {
  dragActive: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onClick: () => void;
  accept?: string;
  processing?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={onClick}
      className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer min-h-[140px] flex items-center justify-center ${
        dragActive
          ? 'border-violet-500/50 bg-violet-500/[0.08]'
          : 'border-white/[0.08] hover:border-white/15 hover:bg-white/[0.02]'
      }`}
    >
      {processing && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-violet-400 animate-spin" />
            <span className="text-white/70 text-sm">Processing...</span>
          </div>
        </div>
      )}
      {children}
    </div>
  );
}

function UploadPrompt({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="space-y-2 py-2">
      <div className="text-white/20 mx-auto flex justify-center">{icon}</div>
      <p className="text-sm text-white/50 font-medium">{title}</p>
      <p className="text-xs text-white/25">{subtitle}</p>
      <p className="text-[10px] text-white/15">Drag & drop or click to browse</p>
    </div>
  );
}

function UploadedFilePreview({
  file,
  onRemove,
  thumbnail,
  pageCount,
}: {
  file: UploadedFile;
  onRemove: () => void;
  thumbnail?: string;
  pageCount?: number;
}) {
  return (
    <div className="flex items-center gap-4 w-full text-left">
      {/* Thumbnail */}
      {thumbnail ? (
        <div className="w-16 h-20 rounded-lg overflow-hidden bg-black/30 border border-white/10 shrink-0">
          <img src={thumbnail} alt="Preview" className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="w-16 h-20 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0">
          <FileText className="w-6 h-6 text-white/20" />
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <p className="text-sm text-white/80 font-medium truncate">{file.name}</p>
        </div>
        <div className="flex items-center gap-3 mt-1 text-xs text-white/30">
          <span>{(file.size / 1024 / 1024).toFixed(1)} MB</span>
          {pageCount && <span>{pageCount} pages</span>}
          <span className="uppercase">{file.type.split('/').pop()}</span>
        </div>
      </div>

      {/* Remove */}
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        className="text-white/20 hover:text-white/60 transition-colors p-1"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
