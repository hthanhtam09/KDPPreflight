'use client';

import { useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2,
  CheckCircle2,
  Circle,
  BookOpen,
  FileText,
  BookMarked,
  Sparkles,
  ArrowLeft,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { useAppStore } from '@/store/use-app-store';
import { GenerationPhase, GenerationProgress } from '@/types/kdp';
import { loadPDF, loadImage } from '@/engine/pdf-processor';
import { sliceCoverTextures, CoverSegments } from '@/engine/cover-parser';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

// ---------------------------------------------------------------------------
// Generation Phase Definitions
// ---------------------------------------------------------------------------

interface PhaseDefinition {
  phase: GenerationPhase;
  icon: string;
  label: string;
  description: string;
  iconComponent: React.ReactNode;
}

const PHASES: PhaseDefinition[] = [
  {
    phase: 'analyzing',
    icon: '📘',
    label: 'Preparing Book Structure',
    description: 'Analyzing configuration and preparing geometry data',
    iconComponent: <BookOpen className="w-5 h-5" />,
  },
  {
    phase: 'rendering-interior',
    icon: '📄',
    label: 'Rendering Interior Pages',
    description: 'Loading and processing manuscript pages',
    iconComponent: <FileText className="w-5 h-5" />,
  },
  {
    phase: 'building-cover',
    icon: '📕',
    label: 'Building Cover Geometry',
    description: 'Slicing cover into front, spine, and back textures',
    iconComponent: <BookMarked className="w-5 h-5" />,
  },
  {
    phase: 'optimizing',
    icon: '✨',
    label: 'Optimizing 3D Preview',
    description: 'Pre-caching textures and preparing scene data',
    iconComponent: <Sparkles className="w-5 h-5" />,
  },
];

// ---------------------------------------------------------------------------
// GenerateStep Component
// ---------------------------------------------------------------------------

export default function GenerateStep({ onCoverSegments }: { onCoverSegments?: (segments: CoverSegments | null) => void }) {
  const {
    uploadedCover,
    uploadedManuscript,
    bookConfig,
    measurements,
    generationProgress,
    setGenerationProgress,
    setPreviewFlowStep,
    setPreviewGenerated,
    setCoverDataUrl,
    setPdfPageDataUrl,
    coverDataUrl,
  } = useAppStore();

  const hasStartedRef = useRef(false);

  // ---- Main generation function ----
  const generate3DPreview = useCallback(async () => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    try {
      // Phase 1: Analyzing
      setGenerationProgress({
        phase: 'analyzing',
        phaseLabel: 'Preparing Book Structure',
        phaseIcon: '📘',
        progress: 10,
        details: 'Analyzing book configuration...',
      });

      // Small delay for UX
      await delay(400);

      // Slice cover if we have a cover data URL
      if (coverDataUrl || uploadedCover?.dataUrl) {
        setGenerationProgress(prev => ({
          ...prev,
          progress: 20,
          details: 'Calculating cover regions...',
        }));
      }

      await delay(300);

      // Phase 2: Rendering Interior
      setGenerationProgress({
        phase: 'rendering-interior',
        phaseLabel: 'Rendering Interior Pages',
        phaseIcon: '📄',
        progress: 30,
        details: 'Loading manuscript pages...',
      });

      if (uploadedManuscript?.file && uploadedManuscript.file.type === 'application/pdf') {
        // Pre-render manuscript pages (more than initial load)
        const manuscriptFile = uploadedManuscript.file;
        const pageCount = bookConfig.pageCount;
        const pagesToRender = Math.min(pageCount, 100);

        setGenerationProgress(prev => ({
          ...prev,
          progress: 35,
          details: `Rendering ${pagesToRender} pages...`,
        }));

        const result = await loadPDF(manuscriptFile, {
          maxPages: pagesToRender,
          renderScale: 1.5,
        });

        // Store each page
        for (let i = 0; i < result.pages.length; i++) {
          const page = result.pages[i];
          if (page.dataUrl) {
            setPdfPageDataUrl(i, page.dataUrl);
          }
          // Update progress
          if (i % 5 === 0) {
            setGenerationProgress(prev => ({
              ...prev,
              progress: 35 + Math.round((i / result.pages.length) * 25),
              details: `Rendering page ${i + 1} of ${result.pages.length}...`,
            }));
          }
        }
      } else {
        // No manuscript - skip with quick progress
        setGenerationProgress(prev => ({
          ...prev,
          progress: 55,
          details: 'No manuscript to render',
        }));
      }

      await delay(200);

      // Phase 3: Building Cover
      setGenerationProgress({
        phase: 'building-cover',
        phaseLabel: 'Building Cover Geometry',
        phaseIcon: '📕',
        progress: 60,
        details: 'Slicing cover into segments...',
      });

      const coverData = coverDataUrl || uploadedCover?.dataUrl;
      if (coverData) {
        try {
          const bookType = bookConfig.bookType === 'hardcover' ? 'hardcover' : 'paperback';
          const segments = await sliceCoverTextures(coverData, measurements, bookType);

          // Pass segments back to parent
          onCoverSegments?.(segments);

          setGenerationProgress(prev => ({
            ...prev,
            progress: 75,
            details: segments.isFullSpread
              ? 'Full cover spread detected and sliced'
              : 'Front cover image prepared',
          }));
        } catch (err) {
          console.warn('Cover slicing failed (may be single image):', err);
          onCoverSegments?.(null);
          setGenerationProgress(prev => ({
            ...prev,
            progress: 75,
            details: 'Cover prepared (single image mode)',
          }));
        }
      } else {
        setGenerationProgress(prev => ({
          ...prev,
          progress: 75,
          details: 'No cover file — using placeholder',
        }));
      }

      await delay(300);

      // Phase 4: Optimizing
      setGenerationProgress({
        phase: 'optimizing',
        phaseLabel: 'Optimizing 3D Preview',
        phaseIcon: '✨',
        progress: 85,
        details: 'Pre-caching textures...',
      });

      await delay(400);

      setGenerationProgress(prev => ({
        ...prev,
        progress: 92,
        details: 'Preparing scene data...',
      }));

      await delay(300);

      // Complete
      setGenerationProgress({
        phase: 'complete',
        phaseLabel: 'Ready',
        phaseIcon: '✅',
        progress: 100,
        details: '3D preview is ready!',
      });

      setPreviewGenerated(true);

      // Short delay before transitioning
      await delay(600);
      setPreviewFlowStep('preview');

    } catch (err) {
      console.error('Generation failed:', err);
      setGenerationProgress({
        phase: 'error',
        phaseLabel: 'Generation Failed',
        phaseIcon: '❌',
        progress: 0,
        details: err instanceof Error ? err.message : 'An unknown error occurred',
      });
    }
  }, [
    uploadedCover,
    uploadedManuscript,
    bookConfig,
    measurements,
    coverDataUrl,
    setGenerationProgress,
    setPreviewGenerated,
    setPreviewFlowStep,
    setCoverDataUrl,
    setPdfPageDataUrl,
    onCoverSegments,
  ]);

  // Auto-start generation when component mounts
  useEffect(() => {
    generate3DPreview();
  }, [generate3DPreview]);

  // ---- Determine phase status ----
  const getPhaseStatus = (phase: GenerationPhase): 'pending' | 'active' | 'complete' => {
    const currentIndex = PHASES.findIndex(p => p.phase === generationProgress.phase);
    const phaseIndex = PHASES.findIndex(p => p.phase === phase);

    if (generationProgress.phase === 'error') return 'pending';
    if (generationProgress.phase === 'complete') return 'complete';

    if (phaseIndex < currentIndex) return 'complete';
    if (phaseIndex === currentIndex) return 'active';
    return 'pending';
  };

  const isError = generationProgress.phase === 'error';
  const isComplete = generationProgress.phase === 'complete';

  return (
    <div className="ds-page-stage flex h-full items-center justify-center">
      <div className="max-w-lg w-full mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
              {isError ? (
                <AlertCircle className="h-7 w-7 text-danger" />
              ) : isComplete ? (
                <CheckCircle2 className="h-7 w-7 text-success" />
              ) : (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                >
                  <Sparkles className="h-7 w-7 text-primary" />
                </motion.div>
              )}
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              {isError ? 'Generation Failed' : isComplete ? 'Preview Ready!' : 'Generating 3D Preview'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isError
                ? generationProgress.details
                : isComplete
                  ? 'Your 3D book preview is ready'
                  : 'Preparing your book for interactive 3D visualization'}
            </p>
          </div>

          {/* Overall Progress */}
          {!isError && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">{generationProgress.phaseLabel}</span>
                <span className="font-mono text-foreground/70">{generationProgress.progress}%</span>
              </div>
              <Progress
                value={generationProgress.progress}
                className="h-2 bg-secondary [&>div]:bg-primary"
              />
            </div>
          )}

          {/* Phase List */}
          <div className="space-y-1">
            {PHASES.map((phaseDef, index) => {
              const status = getPhaseStatus(phaseDef.phase);
              return (
                <PhaseItem
                  key={phaseDef.phase}
                  phaseDef={phaseDef}
                  status={status}
                  isCurrentPhase={generationProgress.phase === phaseDef.phase}
                  details={generationProgress.phase === phaseDef.phase ? generationProgress.details : undefined}
                />
              );
            })}
          </div>

          {/* Error Actions */}
          {isError && (
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="ghost"
                onClick={() => setPreviewFlowStep('import')}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Import
              </Button>
              <Button
                onClick={() => {
                  hasStartedRef.current = false;
                  setGenerationProgress({ phase: 'idle', phaseLabel: '', phaseIcon: '', progress: 0 });
                  generate3DPreview();
                }}
                className="px-6 text-sm"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function PhaseItem({
  phaseDef,
  status,
  isCurrentPhase,
  details,
}: {
  phaseDef: PhaseDefinition;
  status: 'pending' | 'active' | 'complete';
  isCurrentPhase: boolean;
  details?: string;
}) {
  return (
    <motion.div
      layout
      className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
        status === 'active'
          ? 'border border-primary/20 bg-primary/10'
          : status === 'complete'
            ? 'border border-transparent bg-success/5'
            : 'border border-transparent bg-transparent'
      }`}
    >
      {/* Status Icon */}
      <div className="shrink-0">
        {status === 'complete' ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <CheckCircle2 className="h-5 w-5 text-success" />
          </motion.div>
        ) : status === 'active' ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          >
            <Loader2 className="h-5 w-5 text-primary" />
          </motion.div>
        ) : (
          <Circle className="h-5 w-5 text-muted-foreground/35" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${
            status === 'active' ? 'text-foreground' :
            status === 'complete' ? 'text-muted-foreground' :
            'text-muted-foreground/55'
          }`}>
            <span className="mr-1.5">{phaseDef.icon}</span>
            {phaseDef.label}
          </span>
        </div>
        <AnimatePresence>
          {isCurrentPhase && details && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-0.5 text-xs text-muted-foreground"
            >
              {details}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Phase number */}
      <span className={`text-xs font-mono ${
        status === 'active' ? 'text-primary' :
        status === 'complete' ? 'text-success/70' :
        'text-muted-foreground/35'
      }`}>
        {status === 'complete' ? '✓' : `${PHASES.indexOf(phaseDef) + 1}/4`}
      </span>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
