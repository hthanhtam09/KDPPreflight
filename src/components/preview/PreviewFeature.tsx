'use client';

import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { useAppStore } from '@/store/use-app-store';
import { BookType, CameraPreset, PreviewFlowStep } from '@/types/kdp';
import { CoverSegments } from '@/engine/cover-parser';
import dynamic from 'next/dynamic';
import PreviewToolbar from './PreviewToolbar';
import ImportStep from './ImportStep';
import ConfigStep from './ConfigStep';
import GenerateStep from './GenerateStep';
import type { Preview3DState, Preview3DActions } from './BookPreview3D';
import { StepProgress } from '@/components/workspace/ProductWorkspace';

// Dynamic import to avoid SSR issues with Three.js
const BookPreview3D = dynamic(() => import('./BookPreview3D'), { ssr: false });

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
    cameraPreset,
    isProcessing,
    processingMessage,
    generationProgress,
  } = useAppStore();

  const [coverSegments, setCoverSegments] = useState<CoverSegments | null>(null);
  const exportRef = useRef<(() => void) | null>(null);

  // Derive coverUrl from store instead of syncing via effect
  const coverUrl = useMemo(
    () => coverDataUrl || uploadedCover?.dataUrl || undefined,
    [coverDataUrl, uploadedCover?.dataUrl],
  );

  // 3D Preview State — derive bookType from config rather than syncing via effect
  const [previewState, setPreviewState] = useState<Preview3DState>(() => ({
    isOpen: false,
    currentPage: 0,
    isFlipping: false,
    flipProgress: 0,
    flipDirection: 'forward',
    bookType: bookConfig.bookType || 'paperback',
    kindleDevice: 'paperwhite',
    darkMode: false,
    bookState: 'closed',
    cameraPreset: 'free',
  }));

  // Keep bookType in sync via callback (not effect)
  const effectivePreviewState = useMemo(
    () => ({ ...previewState, bookType: bookConfig.bookType || previewState.bookType }),
    [previewState, bookConfig.bookType],
  );

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
      setPreviewState(prev => ({ ...prev, cameraPreset: 'free' }));
    }, []),
    exportScreenshot: useCallback((_highRes?: boolean) => {
      if (exportRef.current) exportRef.current();
    }, []),
    setCameraPreset: useCallback((preset: CameraPreset) => {
      setPreviewState(prev => ({ ...prev, cameraPreset: preset }));
    }, []),
  };

  const handleStateChange = useCallback((updates: Partial<Preview3DState>) => {
    setPreviewState(prev => ({ ...prev, ...updates }));
  }, []);

  // ---- Keyboard navigation for 3D Preview ----
  useEffect(() => {
    if (previewFlowStep !== 'preview') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture when user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) return;

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          actions.nextPage();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          actions.prevPage();
          break;
        case 'o':
        case 'O':
          actions.toggleOpen();
          break;
        case 'f':
        case 'F':
          actions.setCameraPreset('front');
          break;
        case 'b':
        case 'B':
          actions.setCameraPreset('back');
          break;
        case 's':
        case 'S':
          actions.setCameraPreset('spine');
          break;
        case 'r':
        case 'R':
          actions.resetCamera();
          break;
        case 'e':
        case 'E':
          actions.exportScreenshot();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewFlowStep, actions]);

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
    <div className="flex h-full min-h-0 flex-col bg-transparent text-[#f7f1e7]">
      {/* ─── Step Indicator ─── */}
      {!isInPreviewStep && (
        <div className="flex items-center justify-between gap-3 border-b border-[#f4efe5]/10 bg-[#080a0d]/75 px-4 py-3 backdrop-blur-xl">
          <StepProgress
            steps={STEPS.map((step) => ({ key: step.key, label: step.label }))}
            current={previewFlowStep}
            onStepClick={(step) => handleStepClick(step.key as PreviewFlowStep)}
          />
        </div>
      )}

      {/* ─── Step Content ─── */}
      <div className={`flex-1 overflow-hidden ${isInPreviewStep ? 'relative' : ''}`}>
        <AnimatePresence mode="wait">
          {previewFlowStep === 'import' && (
            <motion.div
              key="import"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
              className="h-full overflow-y-auto"
            >
              <ImportStep />
            </motion.div>
          )}

          {previewFlowStep === 'config' && (
            <motion.div
              key="config"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
              className="h-full overflow-y-auto"
            >
              <ConfigStep />
            </motion.div>
          )}

          {previewFlowStep === 'generate' && (
            <motion.div
              key="generate"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
              className="h-full"
            >
              <GenerateStep onCoverSegments={setCoverSegments} />
            </motion.div>
          )}

          {previewFlowStep === 'preview' && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="h-full relative"
            >
              {/* 3D Viewport */}
              <div className="h-full bg-[#0a0a0f]">
                <BookPreview3D
                  coverUrl={coverUrl}
                  coverSegments={coverSegments}
                  state={effectivePreviewState}
                  onStateChange={handleStateChange}
                  onExportRef={exportRef}
                  cameraPreset={cameraPreset}
                />

                {/* Premium Toolbar Overlay */}
                <PreviewToolbar
                  state={effectivePreviewState}
                  actions={actions}
                  totalPages={bookConfig.pageCount}
                  measurements={{
                    trimWidth: measurements.trimWidthIn.toFixed(2),
                    trimHeight: measurements.trimHeightIn.toFixed(2),
                    spine: measurements.spineWidthIn.toFixed(3),
                    pageCount: bookConfig.pageCount,
                  }}
                />

                {/* Back to Config button */}
                <button
                  onClick={() => setPreviewFlowStep('config')}
                  className="absolute top-4 right-4 z-10 bg-black/60 backdrop-blur-xl rounded-xl border border-white/10 px-3 py-2 text-white/50 hover:text-white/80 hover:bg-black/80 transition-all flex items-center gap-2 text-xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Config
                </button>

                {/* Processing overlay */}
                {isProcessing && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-30">
                    <div className="bg-black/80 rounded-2xl border border-white/10 px-6 py-4 flex items-center gap-3">
                      <Loader2 className="w-5 h-5 text-white/60 animate-spin" />
                      <span className="text-white/80 text-sm">{processingMessage || 'Processing...'}</span>
                    </div>
                  </div>
                )}

                {/* Generation progress overlay (during re-generation) */}
                {generationProgress.phase !== 'idle' && generationProgress.phase !== 'complete' && (
                  <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20">
                    <div className="bg-black/70 backdrop-blur-xl rounded-xl border border-white/10 px-4 py-2 flex items-center gap-3">
                      <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
                      <span className="text-white/70 text-xs">{generationProgress.phaseLabel} — {generationProgress.progress}%</span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
