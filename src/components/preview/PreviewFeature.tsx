'use client';

import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { AnimatePresence, LazyMotion, domAnimation, m } from 'framer-motion';
import {
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { useAppStore } from '@/store/use-app-store';
import { CameraPreset, PreviewFlowStep } from '@/types/kdp';
import { CoverSegments } from '@/engine/cover-parser';
import { calculateMeasurements, DEFAULT_BOOK_CONFIG } from '@/engine/kdp-constants';
import dynamic from 'next/dynamic';
import PreviewToolbar from './PreviewToolbar';
import ImportStep from './ImportStep';
import ConfigStep from './ConfigStep';
import GenerateStep from './GenerateStep';
import type { Preview3DOverlays, Preview3DState, Preview3DActions } from './BookPreview3D';
import { StepProgress } from '@/components/workspace/ProductWorkspace';

// Dynamic imports to avoid SSR issues with Three.js
const BookPreview3D = dynamic(() => import('./BookPreview3D'), { ssr: false });
const KindlePreview = dynamic(() => import('./KindlePreview'), { ssr: false });

// ---------------------------------------------------------------------------
// Step definitions
// ---------------------------------------------------------------------------

interface StepDef {
  key: PreviewFlowStep;
  label: string;
}

const STEPS: StepDef[] = [
  { key: 'import', label: 'Import' },
  { key: 'config', label: 'Config' },
  { key: 'generate', label: 'Generate' },
  { key: 'preview', label: '3D Preview' },
];

const PREVIEW_ONLY_OVERLAYS: Preview3DOverlays = {
  bleed: false,
  trim: false,
  safe: false,
};

// ---------------------------------------------------------------------------
// Main Preview Feature Component — 4-Step Orchestrator
// ---------------------------------------------------------------------------

export default function PreviewFeature() {
  const {
    previewFlowStep,
    setPreviewFlowStep,
    uploadedCover,
    measurements,
    bookConfig,
    coverDataUrl,
    isProcessing,
    processingMessage,
    generationProgress,
    activateFeatureWorkspace,
  } = useAppStore();
  const safeBookConfig = bookConfig ?? DEFAULT_BOOK_CONFIG;
  const safeMeasurements = measurements ?? calculateMeasurements(safeBookConfig);

  const [coverSegments, setCoverSegments] = useState<CoverSegments | null>(null);
  const exportRef = useRef<(() => void) | null>(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  useEffect(() => {
    activateFeatureWorkspace('preview');
  }, [activateFeatureWorkspace]);

  // Derive coverUrl from store instead of syncing via effect
  const coverUrl = useMemo(
    () => coverDataUrl || uploadedCover?.dataUrl || undefined,
    [coverDataUrl, uploadedCover?.dataUrl],
  );

  // 3D Preview State — derive bookType from config rather than syncing via effect
  const [previewState, setPreviewState] = useState<Preview3DState>(() => ({
    currentPage: 1,
    isFlipping: false,
    flipProgress: 0,
    flipDirection: 'forward',
    targetPage: null,
    bookType: safeBookConfig.bookType || 'paperback',
    kindleDevice: 'paperwhite',
    darkMode: false,
    bookPose: 'closedFront',
    cameraPreset: 'front',
  }));

  // Keep bookType in sync via callback (not effect)
  const effectivePreviewState = useMemo(
    () => ({ ...previewState, bookType: safeBookConfig.bookType || previewState.bookType }),
    [previewState, safeBookConfig.bookType],
  );

  // ---- 3D Actions ----
  const actions: Preview3DActions = {
    nextPage: useCallback(() => {
      setPreviewState(prev => {
        if (prev.isFlipping || prev.bookPose === 'closedBack') return prev;
        return {
          ...prev,
          isFlipping: true,
          flipProgress: 0,
          flipDirection: 'forward',
          targetPage: null,
          bookPose: 'open',
          cameraPreset: 'open-spread',
        };
      });
    }, [safeBookConfig.pageCount]),
    prevPage: useCallback(() => {
      setPreviewState(prev => {
        if (prev.isFlipping || (prev.bookPose === 'open' && prev.currentPage <= 1)) return prev;
        const fromBackCover = prev.bookPose === 'closedBack';
        const lastSpread = safeBookConfig.pageCount <= 1 ? 1 : safeBookConfig.pageCount % 2 === 0 ? safeBookConfig.pageCount : safeBookConfig.pageCount - 1;
        return {
          ...prev,
          isFlipping: true,
          flipProgress: 0,
          flipDirection: 'backward',
          targetPage: fromBackCover ? lastSpread : null,
          currentPage: fromBackCover ? lastSpread : prev.currentPage,
          bookPose: 'open',
          cameraPreset: 'open-spread',
        };
      });
    }, [safeBookConfig.pageCount]),
    goToPage: useCallback((page: number) => {
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const clamped = Math.max(1, Math.min(Math.round(page), safeBookConfig.pageCount));
      const normalized = clamped === 1 ? 1 : clamped % 2 === 0 ? clamped : clamped - 1;
      setPreviewState(prev => {
        if (prev.isFlipping) return prev;
        if (reducedMotion || normalized === prev.currentPage) {
          return {
            ...prev,
            currentPage: normalized,
            targetPage: null,
            isFlipping: false,
            flipProgress: 0,
            bookPose: 'open',
            cameraPreset: 'open-spread',
          };
        }
        return {
          ...prev,
          isFlipping: true,
          flipProgress: 0,
          flipDirection: normalized > prev.currentPage ? 'forward' : 'backward',
          targetPage: normalized,
          bookPose: 'open',
          cameraPreset: 'open-spread',
        };
      });
    }, [safeBookConfig.pageCount]),
    exportScreenshot: useCallback((_highRes?: boolean) => {
      if (exportRef.current) exportRef.current();
    }, []),
    setCameraPreset: useCallback((preset: CameraPreset) => {
      setPreviewState(prev => {
        if (preset === 'front') return { ...prev, bookPose: 'closedFront', isFlipping: false, flipProgress: 0, targetPage: null, cameraPreset: 'front' };
        if (preset === 'back') return { ...prev, bookPose: 'closedBack', isFlipping: false, flipProgress: 0, targetPage: null, cameraPreset: 'back' };
        if (preset === 'spine') return { ...prev, bookPose: 'closedSpine', isFlipping: false, flipProgress: 0, targetPage: null, cameraPreset: 'spine' };
        return { ...prev, cameraPreset: preset };
      });
    }, []),
    toggleConfig: useCallback(() => setIsConfigOpen(prev => !prev), []),
  };

  const handleStateChange = useCallback((updates: Partial<Preview3DState>) => {
    setPreviewState(prev => ({ ...prev, ...updates }));
  }, []);

  // ---- Kindle-specific page navigation (no flip animation) ----
  const kindleNextPage = useCallback(() => {
    setPreviewState(prev => ({
      ...prev,
      currentPage: Math.min(prev.currentPage + 1, safeBookConfig.pageCount),
    }));
  }, [safeBookConfig.pageCount]);

  const kindlePrevPage = useCallback(() => {
    setPreviewState(prev => ({
      ...prev,
      currentPage: Math.max(prev.currentPage - 1, 1),
    }));
  }, []);

  const kindleGoToPage = useCallback((page: number) => {
    const clamped = Math.max(1, Math.min(Math.round(page), safeBookConfig.pageCount));
    setPreviewState(prev => ({ ...prev, currentPage: clamped }));
  }, [safeBookConfig.pageCount]);

  // ---- Keyboard navigation for Preview ----
  useEffect(() => {
    if (previewFlowStep !== 'preview') return;
    const isKindle = safeBookConfig.bookType === 'kindle';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) return;

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          if (isKindle) kindleNextPage();
          else actions.nextPage();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (isKindle) kindlePrevPage();
          else actions.prevPage();
          break;
        case 'o':
        case 'O':
          if (!isKindle) actions.setCameraPreset('open-spread');
          break;
        case 'f':
        case 'F':
          if (!isKindle) actions.setCameraPreset('front');
          break;
        case 'b':
        case 'B':
          if (!isKindle) actions.setCameraPreset('back');
          break;
        case 's':
        case 'S':
          if (!isKindle) actions.setCameraPreset('spine');
          break;
        case 'r':
        case 'R':
          if (!isKindle) actions.setCameraPreset('front');
          break;
        case 'e':
        case 'E':
          if (!isKindle) actions.exportScreenshot();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewFlowStep, actions, safeBookConfig.bookType, kindleNextPage, kindlePrevPage]);

  // ---- Step navigation: can go back, not forward ----
  const canGoToStep = useCallback((step: PreviewFlowStep): boolean => {
    const stepOrder: PreviewFlowStep[] = ['import', 'config', 'generate', 'preview'];
    const currentIndex = stepOrder.indexOf(previewFlowStep);
    const targetIndex = stepOrder.indexOf(step);
    return targetIndex <= currentIndex;
  }, [previewFlowStep]);

  const handleStepClick = useCallback((step: PreviewFlowStep) => {
    if (canGoToStep(step)) {
      setPreviewFlowStep(step);
    }
  }, [canGoToStep, setPreviewFlowStep]);

  // Get step index
  const isInPreviewStep = previewFlowStep === 'preview';

  return (
    <div className="flex h-full min-h-0 flex-col bg-transparent text-foreground">
      {/* ─── Step Indicator ─── */}
      {!isInPreviewStep && (
        <div className="flex items-center justify-between gap-3 overflow-x-auto border-b border-border bg-surface-glass px-3 py-3 backdrop-blur-xl sm:px-4">
          <StepProgress
            steps={STEPS.map((step) => ({ key: step.key, label: step.label }))}
            current={previewFlowStep}
            onStepClick={(step) => handleStepClick(step.key as PreviewFlowStep)}
          />
        </div>
      )}

      {/* ─── Step Content ─── */}
      <div className={`flex-1 overflow-hidden ${isInPreviewStep ? 'relative' : ''}`}>
        <LazyMotion features={domAnimation}>
        <AnimatePresence mode="wait">
          {previewFlowStep === 'import' && (
            <m.div
              key="import"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
              className="h-full overflow-y-auto"
            >
              <ImportStep />
            </m.div>
          )}

          {previewFlowStep === 'config' && (
            <m.div
              key="config"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
              className="h-full overflow-y-auto"
            >
              <ConfigStep />
            </m.div>
          )}

          {previewFlowStep === 'generate' && (
            <m.div
              key="generate"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
              className="h-full"
            >
              <GenerateStep onCoverSegments={setCoverSegments} />
            </m.div>
          )}

          {previewFlowStep === 'preview' && (
            <m.div
              key="preview"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="h-full relative"
            >
              {effectivePreviewState.bookType === 'kindle' ? (
                /* ── Kindle flat e-reader preview ── */
                <KindlePreview
                  currentPage={effectivePreviewState.currentPage}
                  totalPages={safeBookConfig.pageCount}
                  onPrev={kindlePrevPage}
                  onNext={kindleNextPage}
                  onGoToPage={kindleGoToPage}
                  onBack={() => setPreviewFlowStep('config')}
                  measurements={{
                    pageCount: safeBookConfig.pageCount,
                    bookType: safeBookConfig.bookType,
                    coverSource: uploadedCover?.name || (coverDataUrl ? 'Imported cover' : 'Not loaded'),
                    pageSource: `${safeBookConfig.pageCount} rendered pages`,
                  }}
                />
              ) : (
                /* ── Physical book 3D preview ── */
                <div className="h-full ds-page-stage">
                  <BookPreview3D
                    coverUrl={coverUrl}
                    coverSegments={coverSegments}
                    state={effectivePreviewState}
                    onStateChange={handleStateChange}
                    onExportRef={exportRef}
                    overlays={PREVIEW_ONLY_OVERLAYS}
                  />

                  <PreviewToolbar
                    state={effectivePreviewState}
                    actions={actions}
                    totalPages={safeBookConfig.pageCount}
                    isConfigOpen={isConfigOpen}
                    onCloseConfig={() => setIsConfigOpen(false)}
                    measurements={{
                      trimWidth: safeMeasurements.trimWidthIn.toFixed(2),
                      trimHeight: safeMeasurements.trimHeightIn.toFixed(2),
                      spine: safeMeasurements.spineWidthIn.toFixed(3),
                      pageCount: safeBookConfig.pageCount,
                      bookType: safeBookConfig.bookType,
                      coverSource: uploadedCover?.name || (coverDataUrl ? 'Imported cover' : 'Not loaded'),
                      pageSource: `${safeBookConfig.pageCount} rendered pages`,
                      paperType: safeBookConfig.paper,
                    }}
                  />

                  <button
                    onClick={() => setPreviewFlowStep('config')}
                    className="ds-focus ds-control absolute left-3 top-3 z-20 flex items-center gap-2 rounded-xl px-3 py-2 text-xs sm:left-4"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Config
                  </button>

                  {isProcessing && (
                    <div className="absolute inset-0 z-30 flex items-center justify-center bg-overlay backdrop-blur-sm">
                      <div className="ds-card-glass flex items-center gap-3 px-6 py-4">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        <span className="text-sm text-foreground/80">{processingMessage || 'Processing...'}</span>
                      </div>
                    </div>
                  )}

                  {generationProgress.phase !== 'idle' && generationProgress.phase !== 'complete' && (
                    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20">
                      <div className="ds-card-glass flex items-center gap-3 rounded-xl px-4 py-2">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <span className="text-xs text-muted-foreground">{generationProgress.phaseLabel} — {generationProgress.progress}%</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </m.div>
          )}
        </AnimatePresence>
        </LazyMotion>
      </div>
    </div>
  );
}
