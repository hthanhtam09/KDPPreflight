'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  Box,
  ImageIcon,
  BookOpen,
  BookMarked,
  Smartphone,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Layers,
  Ruler,
  FileText,
  Zap,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { useAppStore } from '@/store/use-app-store';
import { BookType } from '@/types/kdp';
import { loadImage, loadPDF } from '@/engine/pdf-processor';
import { parseCoverFile, sliceCoverTextures, CoverSegments } from '@/engine/cover-parser';
import dynamic from 'next/dynamic';
import PreviewToolbar from './PreviewToolbar';
import type { Preview3DState, Preview3DActions } from './BookPreview3D';

// Dynamic import to avoid SSR issues with Three.js
const BookPreview3D = dynamic(() => import('./BookPreview3D'), { ssr: false });

// ---------------------------------------------------------------------------
// Main Preview Feature Component
// ---------------------------------------------------------------------------

export default function PreviewFeature() {
  const {
    uploadedCover,
    measurements,
    setUploadedCover,
    bookConfig,
    setProcessing,
    isProcessing,
    processingMessage,
    pdfPageDataUrls,
    coverDataUrl,
    setPdfPageDataUrl,
    setCoverDataUrl,
    uploadedManuscript,
    setUploadedManuscript,
  } = useAppStore();

  const [coverUrl, setCoverUrl] = useState<string | undefined>();
  const [coverSegments, setCoverSegments] = useState<CoverSegments | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [manuscriptDragActive, setManuscriptDragActive] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [manuscriptProgress, setManuscriptProgress] = useState<{ loaded: number; total: number } | null>(null);
  const exportRef = useRef<(() => void) | null>(null);

  // 3D Preview State
  const [previewState, setPreviewState] = useState<Preview3DState>({
    isOpen: false,
    currentPage: 0,
    isFlipping: false,
    flipProgress: 0,
    flipDirection: 'forward',
    bookType: bookConfig.bookType || 'paperback',
    kindleDevice: 'paperwhite',
    darkMode: false,
    bookState: 'closed',
  });

  // If cover was already uploaded from checker
  useEffect(() => {
    if (uploadedCover?.dataUrl && !coverUrl) {
      setCoverUrl(uploadedCover.dataUrl);
      // Try to slice it as a cover spread
      sliceExistingCover(uploadedCover.dataUrl);
    }
  }, [uploadedCover, coverUrl]);

  // Sync bookType from config
  useEffect(() => {
    if (bookConfig.bookType) {
      setPreviewState(prev => ({ ...prev, bookType: bookConfig.bookType }));
    }
  }, [bookConfig.bookType]);

  // ---- Slice existing cover into segments ----
  const sliceExistingCover = useCallback(async (dataUrl: string) => {
    try {
      const segments = await sliceCoverTextures(
        dataUrl,
        measurements,
        bookConfig.bookType === 'hardcover' ? 'hardcover' : 'paperback',
      );
      setCoverSegments(segments);
    } catch (err) {
      console.warn('Could not slice cover (may be a single image):', err);
      setCoverSegments(null);
    }
  }, [measurements, bookConfig.bookType]);

  // ---- Cover upload handler ----
  const handleCoverUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') return;
    setProcessing(true, 'Processing cover image...');
    try {
      let dataUrl: string;
      let width: number;
      let height: number;

      if (file.type === 'application/pdf') {
        // PDF: render first page as high-res image
        const result = await loadPDF(file, { maxPages: 1, renderScale: 2.5 });
        if (result.pages.length === 0 || !result.pages[0].dataUrl) {
          throw new Error('Cover PDF has no renderable pages');
        }
        dataUrl = result.pages[0].dataUrl;
        width = result.widthIn;
        height = result.heightIn;
      } else {
        // Image file
        const result = await loadImage(file);
        dataUrl = result.dataUrl;
        width = result.width;
        height = result.height;
      }

      setCoverUrl(dataUrl);
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

      // Slice the cover into front/spine/back
      const bookType = bookConfig.bookType === 'hardcover' ? 'hardcover' : 'paperback';
      try {
        const segments = await sliceCoverTextures(dataUrl, measurements, bookType);
        setCoverSegments(segments);
      } catch {
        setCoverSegments(null);
      }
    } catch (err) {
      console.error('Error loading cover:', err);
    } finally {
      setProcessing(false);
    }
  }, [setUploadedCover, setProcessing, setCoverDataUrl, measurements, bookConfig.bookType]);

  // ---- Manuscript upload handler ----
  const handleManuscriptUpload = useCallback(async (file: File) => {
    if (file.type !== 'application/pdf') return;
    setProcessing(true, 'Processing manuscript...');
    setManuscriptProgress({ loaded: 0, total: 0 });

    try {
      const result = await loadPDF(file, {
        maxPages: 200,
        renderScale: 1.5,
      });

      // Store each page as a data URL in the store
      for (let i = 0; i < result.pages.length; i++) {
        const page = result.pages[i];
        if (page.dataUrl) {
          setPdfPageDataUrl(i, page.dataUrl);
        }
        setManuscriptProgress({ loaded: i + 1, total: result.pageCount });
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
    } catch (err) {
      console.error('Error loading manuscript:', err);
    } finally {
      setProcessing(false);
      setManuscriptProgress(null);
    }
  }, [setUploadedManuscript, setProcessing, setPdfPageDataUrl]);

  // ---- Drop handlers ----
  const handleCoverDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleCoverUpload(file);
  }, [handleCoverUpload]);

  const handleManuscriptDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setManuscriptDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleManuscriptUpload(file);
  }, [handleManuscriptUpload]);

  const handleCoverFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleCoverUpload(file);
  }, [handleCoverUpload]);

  const handleManuscriptFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleManuscriptUpload(file);
  }, [handleManuscriptUpload]);

  // ---- 3D Actions ----
  const actions: Preview3DActions = {
    toggleOpen: useCallback(() => {
      setPreviewState(prev => ({
        ...prev,
        isOpen: !prev.isOpen,
        bookState: prev.isOpen ? 'closing' : 'opening',
      }));
    }, []),
    nextPage: useCallback(() => {
      setPreviewState(prev => {
        if (prev.isFlipping || prev.currentPage >= bookConfig.pageCount - 2) return prev;
        return {
          ...prev,
          isFlipping: true,
          flipProgress: 0,
          flipDirection: 'forward',
          bookState: 'flipping',
        };
      });
    }, [bookConfig.pageCount]),
    prevPage: useCallback(() => {
      setPreviewState(prev => {
        if (prev.isFlipping || prev.currentPage <= 0) return prev;
        return {
          ...prev,
          isFlipping: true,
          flipProgress: 0,
          flipDirection: 'backward',
          bookState: 'flipping',
        };
      });
    }, []),
    goToPage: useCallback((page: number) => {
      setPreviewState(prev => ({
        ...prev,
        currentPage: Math.max(0, Math.min(page, bookConfig.pageCount - 1)),
        isFlipping: false,
        flipProgress: 0,
        bookState: prev.isOpen ? 'opened' : 'closed',
      }));
    }, [bookConfig.pageCount]),
    setBookType: useCallback((type: BookType) => {
      setPreviewState(prev => ({
        ...prev,
        bookType: type,
        isOpen: type === 'kindle' ? false : prev.isOpen,
      }));
    }, []),
    setKindleDevice: useCallback((device: 'paperwhite' | 'oasis' | 'tablet' | 'phone') => {
      setPreviewState(prev => ({ ...prev, kindleDevice: device }));
    }, []),
    toggleDarkMode: useCallback(() => {
      setPreviewState(prev => ({ ...prev, darkMode: !prev.darkMode }));
    }, []),
    resetCamera: useCallback(() => {
      setPreviewState(prev => ({ ...prev }));
    }, []),
    exportScreenshot: useCallback(() => {
      if (exportRef.current) exportRef.current();
    }, []),
  };

  // Handle state changes from BookPreview3D
  const handleStateChange = useCallback((updates: Partial<Preview3DState>) => {
    setPreviewState(prev => ({ ...prev, ...updates }));
  }, []);

  // Determine if we have content
  const hasContent = coverUrl || coverDataUrl || pdfPageDataUrls.size > 0;

  return (
    <div className="flex h-full gap-0 relative">
      {/* ━━━ Left Sidebar ━━━ */}
      <AnimatePresence>
        {!sidebarCollapsed && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="shrink-0 overflow-hidden border-r border-white/[0.06]"
          >
            <div className="w-[280px] h-full flex flex-col gap-4 p-4 overflow-y-auto">
              {/* Header */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center">
                  <Box className="w-4 h-4 text-violet-400" />
                </div>
                <div>
                  <h3 className="text-white/90 font-semibold text-sm">3D Preview</h3>
                  <p className="text-white/40 text-xs">Interactive book visualization</p>
                </div>
              </div>

              {/* Cover Upload */}
              <Section label="Cover Image" icon={<ImageIcon className="w-3 h-3" />}>
                <UploadZone
                  dragActive={dragActive}
                  onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleCoverDrop}
                  onFileInput={handleCoverFileInput}
                  accept=".png,.jpg,.jpeg,.pdf"
                  hasContent={!!coverUrl}
                >
                  {coverUrl ? (
                    <div className="space-y-2">
                      <div className="w-full aspect-[2/3] rounded-lg overflow-hidden bg-black/30">
                        <img src={coverUrl} alt="Cover preview" className="w-full h-full object-contain" />
                      </div>
                      <div className="flex items-center gap-2 text-emerald-400 text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {uploadedCover?.name}
                        {coverSegments?.isFullSpread && (
                          <span className="text-violet-400 ml-1">• Spread detected</span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1 py-2">
                      <Upload className="w-5 h-5 mx-auto text-white/30" />
                      <p className="text-xs text-white/40">Drop cover image or PDF</p>
                      <p className="text-[10px] text-white/25">Supports full cover spreads</p>
                    </div>
                  )}
                </UploadZone>
              </Section>

              {/* Manuscript Upload */}
              <Section label="Interior Pages" icon={<FileText className="w-3 h-3" />}>
                <UploadZone
                  dragActive={manuscriptDragActive}
                  onDragOver={(e) => { e.preventDefault(); setManuscriptDragActive(true); }}
                  onDragLeave={() => setManuscriptDragActive(false)}
                  onDrop={handleManuscriptDrop}
                  onFileInput={handleManuscriptFileInput}
                  accept=".pdf"
                  hasContent={pdfPageDataUrls.size > 0}
                >
                  {pdfPageDataUrls.size > 0 ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-emerald-400 text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {pdfPageDataUrls.size} pages loaded
                      </div>
                      {manuscriptProgress && (
                        <div className="w-full bg-white/10 rounded-full h-1.5">
                          <div
                            className="bg-emerald-500 h-1.5 rounded-full transition-all"
                            style={{ width: `${(manuscriptProgress.loaded / manuscriptProgress.total) * 100}%` }}
                          />
                        </div>
                      )}
                      <p className="text-white/30 text-[10px]">Pages appear when book is opened</p>
                    </div>
                  ) : (
                    <div className="space-y-1 py-2">
                      <FileText className="w-5 h-5 mx-auto text-white/30" />
                      <p className="text-xs text-white/40">Drop manuscript PDF</p>
                      <p className="text-[10px] text-white/25">See real pages inside the book</p>
                    </div>
                  )}
                </UploadZone>
              </Section>

              {/* Book Type */}
              <Section label="Book Type" icon={<Layers className="w-3 h-3" />}>
                <div className="grid grid-cols-3 gap-1.5">
                  <QuickTypeButton
                    active={previewState.bookType === 'paperback'}
                    onClick={() => actions.setBookType('paperback')}
                    icon={<BookOpen className="w-4 h-4" />}
                    label="Paperback"
                  />
                  <QuickTypeButton
                    active={previewState.bookType === 'hardcover'}
                    onClick={() => actions.setBookType('hardcover')}
                    icon={<BookMarked className="w-4 h-4" />}
                    label="Hardcover"
                  />
                  <QuickTypeButton
                    active={previewState.bookType === 'kindle'}
                    onClick={() => actions.setBookType('kindle')}
                    icon={<Smartphone className="w-4 h-4" />}
                    label="Kindle"
                  />
                </div>
              </Section>

              {/* Dimensions */}
              <Section label="Dimensions" icon={<Ruler className="w-3 h-3" />}>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <DimCard label="Trim" value={`${measurements.trimWidthIn}" × ${measurements.trimHeightIn}"`} />
                  <DimCard label="Spine" value={`${measurements.spineWidthIn}"`} />
                  <DimCard label="Bleed" value={`${measurements.bleedIn}"`} />
                  <DimCard label="Pages" value={String(bookConfig.pageCount)} />
                  <DimCard label="Paper" value={bookConfig.paper} />
                  <DimCard label="Binding" value={bookConfig.binding} />
                </div>
              </Section>

              {/* Quick Actions */}
              <Section label="Quick Actions" icon={<Zap className="w-3 h-3" />}>
                <div className="space-y-1.5">
                  <QuickActionButton
                    onClick={actions.toggleOpen}
                    icon={<BookOpen className="w-3.5 h-3.5" />}
                    label={previewState.isOpen ? 'Close Book' : 'Open Book'}
                    disabled={previewState.bookType === 'kindle'}
                  />
                  <QuickActionButton
                    onClick={() => actions.exportScreenshot()}
                    icon={<Sparkles className="w-3.5 h-3.5" />}
                    label="Export Preview PNG"
                  />
                </div>
              </Section>

              {/* Controls Help */}
              <div className="mt-auto">
                <div className="bg-white/[0.02] rounded-lg p-3 text-[10px] text-white/30 space-y-1">
                  <p className="text-white/40 font-medium text-xs mb-1">Controls</p>
                  <p>🖱️ Left drag — Rotate</p>
                  <p>🔍 Scroll — Zoom</p>
                  <p>✋ Right drag — Pan</p>
                  <p>📖 Open — View interior pages</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar Toggle */}
      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className="absolute top-4 left-0 z-20 bg-black/60 backdrop-blur-sm rounded-r-lg border border-l-0 border-white/10 p-1.5 text-white/40 hover:text-white/70 transition-colors"
        style={{ left: sidebarCollapsed ? 0 : 280 }}
      >
        {sidebarCollapsed ? <ChevronDown className="w-4 h-4 rotate-90" /> : <ChevronUp className="w-4 h-4 -rotate-90" />}
      </button>

      {/* ━━━ 3D Viewport ━━━ */}
      <div className="flex-1 relative bg-[#0a0a0f] overflow-hidden">
        {hasContent ? (
          <>
            <BookPreview3D
              coverUrl={coverUrl}
              coverSegments={coverSegments}
              state={previewState}
              onStateChange={handleStateChange}
              onExportRef={exportRef}
            />

            {/* Premium Toolbar Overlay */}
            <PreviewToolbar
              state={previewState}
              actions={actions}
              totalPages={bookConfig.pageCount}
              measurements={{
                trimWidth: measurements.trimWidthIn.toFixed(2),
                trimHeight: measurements.trimHeightIn.toFixed(2),
                spine: measurements.spineWidthIn.toFixed(3),
                pageCount: bookConfig.pageCount,
              }}
            />

            {/* Processing overlay */}
            {isProcessing && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-30">
                <div className="bg-black/80 rounded-2xl border border-white/10 px-6 py-4 flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-white/60 animate-spin" />
                  <span className="text-white/80 text-sm">{processingMessage || 'Processing...'}</span>
                </div>
              </div>
            )}
          </>
        ) : (
          <EmptyState onCoverUpload={handleCoverUpload} onManuscriptUpload={handleManuscriptUpload} />
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function Section({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block flex items-center gap-1.5">
        {icon}
        {label}
      </label>
      {children}
    </div>
  );
}

function UploadZone({
  dragActive,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileInput,
  accept,
  hasContent,
  children,
}: {
  dragActive: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onFileInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  accept: string;
  hasContent: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`relative border-2 border-dashed rounded-xl p-4 text-center transition-all cursor-pointer ${
        dragActive
          ? 'border-white/30 bg-white/[0.05]'
          : hasContent
            ? 'border-emerald-500/30 bg-emerald-500/[0.05]'
            : 'border-white/10 hover:border-white/20'
      }`}
    >
      <input
        type="file"
        accept={accept}
        onChange={onFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      {children}
    </div>
  );
}

function QuickTypeButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl text-xs transition-all ${
        active
          ? 'bg-white/10 text-white border border-white/10'
          : 'bg-white/[0.02] text-white/40 border border-transparent hover:bg-white/5 hover:text-white/60'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function DimCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/[0.03] rounded-lg p-2.5">
      <span className="text-white/30 text-[10px]">{label}</span>
      <p className="text-white/70 font-medium text-xs mt-0.5">{value}</p>
    </div>
  );
}

function QuickActionButton({
  onClick,
  icon,
  label,
  disabled = false,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all ${
        disabled
          ? 'text-white/20 cursor-not-allowed'
          : 'text-white/50 hover:text-white/80 hover:bg-white/5'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function EmptyState({
  onCoverUpload,
  onManuscriptUpload,
}: {
  onCoverUpload: (file: File) => void;
  onManuscriptUpload: (file: File) => void;
}) {
  const coverInputRef = useRef<HTMLInputElement>(null);
  const manuscriptInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      if (file.type === 'application/pdf') {
        onManuscriptUpload(file);
      } else {
        onCoverUpload(file);
      }
    }
  }, [onCoverUpload, onManuscriptUpload]);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
      onDragLeave={() => setDragActive(false)}
      onDrop={handleDrop}
      className="flex flex-col items-center justify-center h-full text-center p-8"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="relative">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 flex items-center justify-center mx-auto">
            <Box className="w-10 h-10 text-violet-400/60" />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-violet-300" />
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-white/60 text-lg font-semibold">3D Book Preview</h3>
          <p className="text-white/30 text-sm max-w-sm">
            Upload your KDP cover and manuscript to see a realistic 3D book preview.
            Supports full cover spreads with automatic front/spine/back splitting.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => coverInputRef.current?.click()}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
              dragActive
                ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 hover:text-white'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            Upload Cover
          </button>
          <button
            onClick={() => manuscriptInputRef.current?.click()}
            className="px-5 py-2.5 rounded-xl text-sm font-medium bg-white/[0.03] text-white/40 border border-white/[0.06] hover:bg-white/[0.06] hover:text-white/60 transition-all flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Upload Manuscript
          </button>
        </div>

        <input
          ref={coverInputRef}
          type="file"
          accept=".png,.jpg,.jpeg,.pdf"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) onCoverUpload(f); }}
          className="hidden"
        />
        <input
          ref={manuscriptInputRef}
          type="file"
          accept=".pdf"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) onManuscriptUpload(f); }}
          className="hidden"
        />

        <div className="flex items-center gap-4 text-[10px] text-white/20">
          <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> Paperback</span>
          <span className="flex items-center gap-1"><BookMarked className="w-3 h-3" /> Hardcover</span>
          <span className="flex items-center gap-1"><Smartphone className="w-3 h-3" /> Kindle</span>
        </div>
      </motion.div>
    </div>
  );
}
