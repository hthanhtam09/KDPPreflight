'use client'

import { CoverSegments } from '@/engine/cover-parser'
import { DEFAULT_BOOK_CONFIG } from '@/engine/kdp-constants'
import { useAppStore } from '@/store/use-app-store'
import { CameraPreset, PreviewFlowStep } from '@/types/kdp'
import { AnimatePresence, domAnimation, LazyMotion, m } from 'framer-motion'
import { ArrowLeft, Check, Circle, Download, Loader2, Settings, X } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Preview3DActions, Preview3DOverlays, Preview3DState } from './BookPreview3D'
import ImportStep from './ImportStep'
import PreviewToolbar from './PreviewToolbar'
import PreviewWorkspace from './PreviewWorkspace'
import GenerateStep from './GenerateStep'
import PreviewConfigPanel from './PreviewConfigPanel'

// Dynamic imports to avoid SSR issues with Three.js
const BookPreview3D = dynamic(() => import('./BookPreview3D'), { ssr: false })
const KindlePreview = dynamic(() => import('./KindlePreview'), { ssr: false })

// ---------------------------------------------------------------------------
// Step definitions
// ---------------------------------------------------------------------------

interface StepDef {
  key: PreviewFlowStep
  label: string
}

const STEPS: StepDef[] = [
  { key: 'import', label: 'Import' },
  { key: 'config', label: 'Settings' },
  { key: 'generate', label: 'Generate' },
  { key: 'preview', label: 'Preview' },
]

const PREVIEW_ONLY_OVERLAYS: Preview3DOverlays = {
  bleed: false,
  trim: false,
  safe: false,
}

// ---------------------------------------------------------------------------
// Main Preview Feature Component — 4-Step Orchestrator
// ---------------------------------------------------------------------------

export default function PreviewFeature() {
  const {
    previewFlowStep,
    setPreviewFlowStep,
    uploadedCover,
    bookConfig,
    coverDataUrl,
    isProcessing,
    processingMessage,
    generationProgress,
    activateFeatureWorkspace,
  } = useAppStore()
  const safeBookConfig = bookConfig ?? DEFAULT_BOOK_CONFIG

  const [coverSegments, setCoverSegments] = useState<CoverSegments | null>(null)
  const exportRef = useRef<(() => void) | null>(null)
  const [isConfigOpen, setIsConfigOpen] = useState(false)
  const previewTitle =
    safeBookConfig.bookType === 'kindle'
      ? 'Kindle Preview'
      : safeBookConfig.bookType === 'hardcover'
        ? 'Hardcover Preview'
        : 'Paperback Preview'

  useEffect(() => {
    activateFeatureWorkspace('preview')
  }, [activateFeatureWorkspace])

  useEffect(() => {
    if (!['config', 'generate', 'preview'].includes(previewFlowStep)) return

    const htmlOverflow = document.documentElement.style.overflow
    const bodyOverflow = document.body.style.overflow
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'

    return () => {
      document.documentElement.style.overflow = htmlOverflow
      document.body.style.overflow = bodyOverflow
    }
  }, [previewFlowStep])

  // Derive coverUrl from store instead of syncing via effect
  const coverUrl = useMemo(
    () => coverDataUrl || uploadedCover?.dataUrl || undefined,
    [coverDataUrl, uploadedCover?.dataUrl]
  )

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
  }))

  // Keep bookType in sync via callback (not effect)
  const effectivePreviewState = useMemo(
    () => ({ ...previewState, bookType: safeBookConfig.bookType || previewState.bookType }),
    [previewState, safeBookConfig.bookType]
  )

  useEffect(() => {
    const lastSpread =
      safeBookConfig.pageCount <= 1
        ? 1
        : safeBookConfig.pageCount % 2 === 0
          ? safeBookConfig.pageCount
          : safeBookConfig.pageCount - 1

    setPreviewState((prev) => {
      const currentPage =
        prev.bookPose === 'closedBack'
          ? lastSpread
          : Math.max(1, Math.min(prev.currentPage, safeBookConfig.pageCount))

      if (currentPage === prev.currentPage) return prev
      return { ...prev, currentPage }
    })
  }, [safeBookConfig.pageCount])

  // ---- 3D Actions ----
  const actions: Preview3DActions = {
    nextPage: useCallback(() => {
      setPreviewState((prev) => {
        if (prev.isFlipping || prev.bookPose === 'closedBack') return prev
        const lastSpread =
          safeBookConfig.pageCount <= 1
            ? 1
            : safeBookConfig.pageCount % 2 === 0
              ? safeBookConfig.pageCount
              : safeBookConfig.pageCount - 1
        const isClosingBackCover = prev.bookPose === 'open' && prev.currentPage >= lastSpread
        if (prev.bookPose === 'closedFront' || prev.bookPose === 'closedSpine') {
          return {
            ...prev,
            currentPage: 1,
            isFlipping: true,
            flipProgress: 0,
            flipDirection: 'forward',
            targetPage: 1,
            bookPose: 'closedFront',
            cameraPreset: 'open-spread',
          }
        }
        return {
          ...prev,
          isFlipping: true,
          flipProgress: 0,
          flipDirection: 'forward',
          targetPage: null,
          bookPose: 'open',
          cameraPreset: isClosingBackCover ? prev.cameraPreset : 'open-spread',
        }
      })
    }, [safeBookConfig.pageCount]),
    prevPage: useCallback(() => {
      setPreviewState((prev) => {
        if (prev.isFlipping || prev.bookPose === 'closedFront') return prev
        const fromBackCover = prev.bookPose === 'closedBack'
        const lastSpread =
          safeBookConfig.pageCount <= 1
            ? 1
            : safeBookConfig.pageCount % 2 === 0
              ? safeBookConfig.pageCount
              : safeBookConfig.pageCount - 1
        return {
          ...prev,
          isFlipping: true,
          flipProgress: 0,
          flipDirection: 'backward',
          targetPage: fromBackCover ? lastSpread : null,
          currentPage: fromBackCover ? lastSpread : prev.currentPage,
          bookPose: 'open',
          cameraPreset: fromBackCover ? prev.cameraPreset : 'open-spread',
        }
      })
    }, [safeBookConfig.pageCount]),
    goToPage: useCallback(
      (page: number) => {
        const clamped = Math.max(1, Math.min(Math.round(page), safeBookConfig.pageCount))
        const normalized = clamped === 1 ? 1 : clamped % 2 === 0 ? clamped : clamped - 1
        setPreviewState((prev) => {
          if (prev.isFlipping) return prev
          return {
            ...prev,
            currentPage: normalized,
            targetPage: null,
            isFlipping: false,
            flipProgress: 0,
            bookPose: 'open',
            cameraPreset: 'open-spread',
          }
        })
      },
      [safeBookConfig.pageCount]
    ),
    exportScreenshot: useCallback((_highRes?: boolean) => {
      if (exportRef.current) exportRef.current()
    }, []),
    setCameraPreset: useCallback((preset: CameraPreset) => {
      setPreviewState((prev) => {
        const lastSpread =
          safeBookConfig.pageCount <= 1
            ? 1
            : safeBookConfig.pageCount % 2 === 0
              ? safeBookConfig.pageCount
              : safeBookConfig.pageCount - 1
        if (preset === 'front')
          return {
            ...prev,
            currentPage: 1,
            bookPose: 'closedFront',
            isFlipping: false,
            flipProgress: 0,
            flipDirection: 'forward',
            targetPage: null,
            cameraPreset: 'front',
          }
        if (preset === 'back')
          return {
            ...prev,
            currentPage: lastSpread,
            bookPose: 'closedBack',
            isFlipping: false,
            flipProgress: 0,
            flipDirection: 'backward',
            targetPage: null,
            cameraPreset: 'back',
          }
        if (preset === 'spine')
          return {
            ...prev,
            currentPage: 1,
            bookPose: 'closedSpine',
            isFlipping: false,
            flipProgress: 0,
            flipDirection: 'forward',
            targetPage: null,
            cameraPreset: 'spine',
          }
        return { ...prev, cameraPreset: preset }
      })
    }, [safeBookConfig.pageCount]),
    toggleConfig: useCallback(() => setIsConfigOpen((prev) => !prev), []),
  }

  const handleStateChange = useCallback((updates: Partial<Preview3DState>) => {
    setPreviewState((prev) => ({ ...prev, ...updates }))
  }, [])

  // ---- Kindle-specific page navigation (no flip animation) ----
  const kindleNextPage = useCallback(() => {
    setPreviewState((prev) => ({
      ...prev,
      currentPage: Math.min(prev.currentPage + 1, safeBookConfig.pageCount),
    }))
  }, [safeBookConfig.pageCount])

  const kindlePrevPage = useCallback(() => {
    setPreviewState((prev) => ({
      ...prev,
      currentPage: Math.max(prev.currentPage - 1, 1),
    }))
  }, [])

  const kindleGoToPage = useCallback(
    (page: number) => {
      const clamped = Math.max(1, Math.min(Math.round(page), safeBookConfig.pageCount))
      setPreviewState((prev) => ({ ...prev, currentPage: clamped }))
    },
    [safeBookConfig.pageCount]
  )

  // ---- Keyboard navigation for Preview ----
  useEffect(() => {
    if (previewFlowStep !== 'preview') return
    const isKindle = safeBookConfig.bookType === 'kindle'

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      )
        return

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault()
          if (isKindle) kindleNextPage()
          else actions.nextPage()
          break
        case 'ArrowLeft':
          e.preventDefault()
          if (isKindle) kindlePrevPage()
          else actions.prevPage()
          break
        case 'o':
        case 'O':
          if (!isKindle) actions.setCameraPreset('open-spread')
          break
        case 'f':
        case 'F':
          if (!isKindle) actions.setCameraPreset('front')
          break
        case 'b':
        case 'B':
          if (!isKindle) actions.setCameraPreset('back')
          break
        case 's':
        case 'S':
          if (!isKindle) actions.setCameraPreset('spine')
          break
        case 'r':
        case 'R':
          if (!isKindle) actions.setCameraPreset('front')
          break
        case 'e':
        case 'E':
          if (!isKindle) actions.exportScreenshot()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [previewFlowStep, actions, safeBookConfig.bookType, kindleNextPage, kindlePrevPage])

  // ---- Step navigation: can go back, not forward ----
  const canGoToStep = useCallback(
    (step: PreviewFlowStep): boolean => {
      const stepOrder: PreviewFlowStep[] = ['import', 'config', 'generate', 'preview']
      const currentIndex = stepOrder.indexOf(previewFlowStep)
      const targetIndex = stepOrder.indexOf(step)
      return targetIndex <= currentIndex
    },
    [previewFlowStep]
  )

  const handleStepClick = useCallback(
    (step: PreviewFlowStep) => {
      if (canGoToStep(step)) {
        setPreviewFlowStep(step)
      }
    },
    [canGoToStep, setPreviewFlowStep]
  )

  const isInPreviewStep = previewFlowStep === 'preview'
  const isInWorkspace = previewFlowStep === 'config'

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 overflow-hidden bg-transparent text-foreground">
      <LazyMotion features={domAnimation}>
        <AnimatePresence mode="wait">
          {/* ─── Import: panel layout ─── */}
          {previewFlowStep === 'import' && (
            <m.div
              key="import"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
              className="min-h-0"
            >
              <section>
                <CompactPreviewStepper steps={STEPS} current={previewFlowStep} onStepClick={handleStepClick} />
                <div className="app-card mt-3 p-4">
                  <ImportStep />
                </div>
              </section>
            </m.div>
          )}

          {/* ─── Config: settings workspace ─── */}
          {isInWorkspace && (
            <m.div
              key="workspace"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex h-full min-h-0 flex-col overflow-hidden"
            >
              <div className="w-full shrink-0 pb-3">
                <CompactPreviewStepper steps={STEPS} current={previewFlowStep} onStepClick={handleStepClick} />
              </div>
              <div className="min-h-0 flex-1 w-full overflow-hidden">
                <PreviewWorkspace />
              </div>
            </m.div>
          )}

          {/* ─── Generate: focused progress screen ─── */}
          {previewFlowStep === 'generate' && (
            <m.div
              key="generate"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex h-full min-h-0 flex-col overflow-hidden"
            >
              <div className="w-full shrink-0 pb-3">
                <CompactPreviewStepper steps={STEPS} current={previewFlowStep} onStepClick={handleStepClick} />
              </div>
              <div className="min-h-0 flex-1 overflow-hidden rounded-[22px] border border-border bg-surface shadow-card">
                <GenerateStep onCoverSegments={setCoverSegments} />
              </div>
            </m.div>
          )}

          {/* ─── 3D Preview: full-height canvas ─── */}
          {isInPreviewStep && (
            <m.div
              key="preview"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="relative h-full min-h-0 overflow-hidden bg-[#eef2f7]"
            >
              <button
                onClick={() => setPreviewFlowStep('config')}
                className="ds-focus ds-control absolute left-3 top-3 z-20 flex items-center gap-2 rounded-xl px-3 py-2 text-xs sm:left-4"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
              </button>
              <div className="pointer-events-none absolute left-1/2 top-3 z-20 -translate-x-1/2 text-sm font-semibold tracking-wide text-foreground/60">
                {previewTitle}
              </div>
              <div className="absolute right-3 top-3 z-20 flex items-center gap-2 sm:right-4">
                <button
                  type="button"
                  onClick={() => setIsConfigOpen((prev) => !prev)}
                  aria-label="Book settings"
                  title="Book settings"
                  className={`ds-focus grid h-10 w-10 shrink-0 place-items-center rounded-lg transition-all ${
                    isConfigOpen
                      ? 'bg-primary text-primary-foreground shadow-soft'
                      : 'border border-white/20 bg-background/70 text-muted-foreground backdrop-blur-xl hover:text-foreground'
                  }`}
                >
                  <Settings className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => exportRef.current?.()}
                  aria-label="Export current view"
                  title="Export current view"
                  className="ds-focus grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground shadow-soft"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
              <AnimatePresence>
                {isConfigOpen && (
                  <m.aside
                    initial={{ x: 340, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 340, opacity: 0 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    className="absolute right-3 top-16 z-30 h-[min(720px,calc(100%-6rem))] w-[min(360px,calc(100vw-1.5rem))] overflow-hidden rounded-xl border border-white/20 bg-background/92 shadow-soft backdrop-blur-xl sm:right-4"
                  >
                    <div className="flex items-center justify-between border-b border-border px-4 py-3">
                      <p className="text-sm font-semibold text-foreground">Book settings</p>
                      <button
                        type="button"
                        onClick={() => setIsConfigOpen(false)}
                        className="ds-focus grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
                        aria-label="Close settings"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="h-[calc(100%-3.5rem)] min-h-0 overflow-hidden">
                      <PreviewConfigPanel />
                    </div>
                  </m.aside>
                )}
              </AnimatePresence>
              <div className="h-full min-h-0 bg-[#eef2f7]">
                {effectivePreviewState.bookType === 'kindle' ? (
                  <KindlePreview
                    currentPage={effectivePreviewState.currentPage}
                    totalPages={safeBookConfig.pageCount}
                    onPrev={kindlePrevPage}
                    onNext={kindleNextPage}
                    onGoToPage={kindleGoToPage}
                    onExportRef={exportRef}
                  />
                ) : (
                  <>
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
                  />
                  </>
                )}
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
                        <span className="text-xs text-muted-foreground">
                          {generationProgress.phaseLabel} — {generationProgress.progress}%
                        </span>
                      </div>
                    </div>
                  )}
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </LazyMotion>
    </div>
  )
}

function CompactPreviewStepper({
  steps,
  current,
  onStepClick,
}: {
  steps: StepDef[]
  current: PreviewFlowStep
  onStepClick: (step: PreviewFlowStep) => void
}) {
  const currentIndex = steps.findIndex((step) => step.key === current)

  return (
    <nav className="w-full overflow-x-auto py-0.5" aria-label="Preview workflow progress">
      <ol className="flex min-w-max items-center justify-center gap-1.5 sm:min-w-0">
        {steps.map((step, index) => {
          const active = step.key === current
          const complete = index < currentIndex

          return (
            <li key={step.key} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onStepClick(step.key)}
                className={`ds-focus inline-flex h-8 items-center gap-1.5 rounded-full border px-2.5 text-xs font-semibold transition-colors ${
                  active
                    ? 'border-primary/35 bg-primary/10 text-foreground shadow-soft'
                    : complete
                      ? 'border-success/20 bg-success/8 text-success'
                      : 'border-border bg-surface/70 text-muted-foreground'
                }`}
              >
                <span
                  className={`grid size-4 place-items-center rounded-full text-[9px] ${
                    active
                      ? 'bg-primary text-primary-foreground'
                      : complete
                        ? 'bg-success text-success-foreground'
                        : 'bg-secondary text-muted-foreground'
                  }`}
                >
                  {complete ? (
                    <Check className="h-3 w-3" />
                  ) : active ? (
                    <Circle className="h-2.5 w-2.5 fill-current" />
                  ) : (
                    index + 1
                  )}
                </span>
                {step.label}
              </button>
              {index < steps.length - 1 && <span className="h-px w-3 bg-border" aria-hidden="true" />}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
