'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft, ArrowRight, Loader2, CheckCircle2,
  AlertTriangle, Info, FileText, ImageIcon, Settings, Ruler, BookOpen
} from 'lucide-react'
import { TRIM_SIZES } from '@/engine/kdp-constants'
import type { TrimSizeKey, BleedType, PaperType, InteriorType } from '@/types/kdp'
import type { KRDetectedSettings, KRScanState, KRConfidence } from './types'

// ── Confidence badge ──────────────────────────────────────────────────────────

function ConfBadge({ level }: { readonly level: KRConfidence }) {
  if (level === 'high')   return <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">Detected</span>
  if (level === 'medium') return <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[9px] font-bold text-amber-600 dark:text-amber-400 border border-amber-500/20">Uncertain</span>
  return <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-[9px] font-bold text-rose-600 dark:text-rose-400 border border-rose-500/20">Low confidence</span>
}

// ── Spine preview ─────────────────────────────────────────────────────────────

const PAPER_THICKNESS: Record<PaperType, number> = {
  'white':         0.002252,
  'cream':         0.0025,
  'premium-color': 0.003,
}

function SpineTag({ pageCount, paper }: { readonly pageCount: number; readonly paper: PaperType }) {
  const spineIn = pageCount * (PAPER_THICKNESS[paper] ?? PAPER_THICKNESS.white)
  const isNarrow = spineIn < 0.13
  const isThin = spineIn < 0.5
  
  const color = isNarrow 
    ? 'text-rose-600 bg-rose-500/8 border border-rose-500/20' 
    : isThin 
      ? 'text-amber-600 bg-amber-500/8 border border-amber-500/20' 
      : 'text-emerald-600 bg-emerald-500/8 border border-emerald-500/20'
      
  const label = isNarrow 
    ? 'Too narrow for text' 
    : isThin 
      ? 'Use bold text only' 
      : 'Spine supports text'
      
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold ${color}`}>
      <span className="font-bold font-mono">{spineIn.toFixed(3)}"</span>
      <span className="opacity-40">·</span>
      <span>{label}</span>
    </span>
  )
}

// ── Scan indicator ────────────────────────────────────────────────────────────

function ScanIndicator({ scan }: { readonly scan: KRScanState }) {
  if (scan.phase === 'done') {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/8 px-3 py-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        <span>Scan complete — {scan.totalPages} pages reviewed</span>
      </div>
    )
  }
  if (scan.phase === 'error') {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/8 px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-400">
        <AlertTriangle className="h-4 w-4 text-rose-500" />
        <span>Partial scan — using available data</span>
      </div>
    )
  }
  const label: Record<string, string> = {
    reading:   'Reading file…',
    detecting: 'Detecting settings…',
    scanning:  `Scanning pages${scan.totalPages > 0 ? ` (${scan.pagesScanned}/${scan.totalPages})` : '…'}`,
    analyzing: 'Analyzing content…',
  }
  return (
    <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2 text-xs font-bold text-muted-foreground animate-pulse">
      <Loader2 className="h-4 w-4 animate-spin text-primary" />
      <span>{label[scan.phase] ?? 'Processing…'}</span>
    </div>
  )
}

// ── Select ────────────────────────────────────────────────────────────────────

function Select<T extends string>({
  value, options, onChange,
}: { readonly value: T; readonly options: { value: T; label: string }[]; readonly onChange: (v: T) => void }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value as T)}
      className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs font-semibold text-foreground outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}

// ── Options ───────────────────────────────────────────────────────────────────

const TRIM_OPTIONS = Object.entries(TRIM_SIZES)
  .filter(([k]) => k !== 'custom')
  .map(([k, v]) => ({ value: k as TrimSizeKey, label: v.label }))

const BLEED_OPTIONS: { value: BleedType; label: string }[] = [
  { value: 'no-bleed', label: 'No bleed (white margins)' },
  { value: 'bleed',    label: 'Bleed (0.125" page edges)' },
]

const PAPER_OPTIONS: { value: PaperType; label: string }[] = [
  { value: 'white',         label: 'White Paper'         },
  { value: 'cream',         label: 'Cream Paper'         },
  { value: 'premium-color', label: 'Premium Color Paper' },
]

const INTERIOR_OPTIONS: { value: InteriorType; label: string; desc: string }[] = [
  { value: 'black-white',    label: 'Black & White',   desc: 'Standard print' },
  { value: 'standard-color', label: 'Standard Color',  desc: 'Medium ink limit'  },
  { value: 'premium-color',  label: 'Premium Color',   desc: 'Best ink limit' },
]

// ── Main component ────────────────────────────────────────────────────────────

interface ConfirmStepProps {
  readonly detected: KRDetectedSettings
  readonly scan: KRScanState
  readonly isComputing: boolean
  readonly onConfirm: (settings: KRDetectedSettings) => void
  readonly onBack: () => void
  readonly files?: { manuscript: File | null; cover: File | null }
  readonly firstPageDataUrl?: string | null
}

export default function ConfirmStep({
  detected, scan, isComputing, onConfirm, onBack, files, firstPageDataUrl,
}: ConfirmStepProps) {
  const [s, setS] = useState<KRDetectedSettings>(detected)
  const [hasUserEdited, setHasUserEdited] = useState(detected.configSource === 'user' || detected.configLocked)
  const [previewImgLoaded, setPreviewImgLoaded] = useState(!firstPageDataUrl)

  const scanDone = scan.phase === 'done' || scan.phase === 'error'
  const canContinue = scanDone && previewImgLoaded && !isComputing

  useEffect(() => {
    if (hasUserEdited && !(detected.configSource === 'user' || detected.configLocked)) return
    let cancelled = false
    queueMicrotask(() => { if (!cancelled) setS(detected) })
    return () => { cancelled = true }
  }, [detected, hasUserEdited])

  const update = <K extends keyof KRDetectedSettings>(k: K, v: KRDetectedSettings[K]) => {
    setHasUserEdited(true)
    setS(prev => ({
      ...prev, [k]: v,
      configSource: 'user', configLocked: true, lastUpdated: Date.now(),
      confidence: {
        ...prev.confidence,
        ...(k === 'trimSize' ? { trimSize: 'high' as KRConfidence } : {}),
        ...(k === 'bleed' ? { bleed: 'high' as KRConfidence } : {}),
      },
    }))
  }

  const isPrint = s.bookType !== 'kindle'
  const hasLowConf = s.confidence.trimSize === 'low' || s.confidence.bleed === 'low'
  const detectedDiffers = s.configLocked && (
    s.trimSize !== detected.trimSize || s.bleed !== detected.bleed ||
    s.paper !== detected.paper || s.interior !== detected.interior || s.pageCount !== detected.pageCount
  )

  return (
    <div className="grid h-[calc(100vh-var(--nav-height)-76px)] overflow-hidden grid-gap-6 grid-cols-1 xl:grid-cols-[380px_1fr] text-foreground px-1 pb-4">
      
      {/* ─── Left Spec Form: Guided Book Settings (Scrolls Internally) ─── */}
      <div className="h-full overflow-y-auto pr-2 pb-6 space-y-3.5 flex flex-col min-h-0 relative">
        <div className="space-y-3 flex-1">
          
          <div className="rounded-xl border border-border bg-secondary/20 p-3">
            <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
              <Settings className="h-3.5 w-3.5 text-primary" />
              Configure Print Settings
            </span>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
              Verify detected PDF specifications. Adjust values as needed before launching the preflight diagnostics checks.
            </p>
          </div>

          {/* 1. Trim size */}
          <div className="rounded-xl border border-border bg-surface p-3.5 shadow-soft">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Trim size</span>
              <ConfBadge level={s.confidence.trimSize} />
            </div>
            <Select value={s.trimSize} options={TRIM_OPTIONS} onChange={v => update('trimSize', v)} />
            <p className="mt-1.5 flex items-center gap-1 text-[10px] text-muted-foreground/70">
              <Info className="h-3 w-3 shrink-0 text-muted-foreground/45" />
              Detected from PDF: {detected.widthIn.toFixed(2)}" × {detected.heightIn.toFixed(2)}"
            </p>
          </div>

          {/* 2. Bleed */}
          {isPrint && (
            <div className="rounded-xl border border-border bg-surface p-3.5 shadow-soft">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Bleed option</span>
                <ConfBadge level={s.confidence.bleed} />
              </div>
              <Select value={s.bleed} options={BLEED_OPTIONS} onChange={v => update('bleed', v as BleedType)} />
              <p className="mt-1.5 flex items-center gap-1 text-[10px] text-muted-foreground/70">
                <Info className="h-3 w-3 shrink-0 text-muted-foreground/45" />
                Select bleed if images reach the page edge.
              </p>
            </div>
          )}

          {/* 3. Interior type */}
          {isPrint && (
            <div className="rounded-xl border border-border bg-surface p-3.5 shadow-soft">
              <span className="mb-2.5 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Interior ink type</span>
              <div className="flex flex-col gap-2">
                {INTERIOR_OPTIONS.map(opt => (
                  <label key={opt.value} className="flex cursor-pointer items-center justify-between rounded-lg border border-border/60 bg-secondary/15 px-3 py-2 transition-colors hover:border-primary/25">
                    <span className="flex items-center gap-2">
                      <input
                        type="radio" name="interior" value={opt.value}
                        checked={s.interior === opt.value}
                        onChange={() => update('interior', opt.value as InteriorType)}
                        className="accent-primary"
                      />
                      <span className="text-xs font-semibold text-foreground">{opt.label}</span>
                    </span>
                    <span className="text-[10px] text-muted-foreground font-semibold uppercase">{opt.desc}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* 4. Paper type */}
          {isPrint && (
            <div className="rounded-xl border border-border bg-surface p-3.5 shadow-soft">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Paper stock</span>
              <Select value={s.paper} options={PAPER_OPTIONS} onChange={v => update('paper', v as PaperType)} />
            </div>
          )}

          {/* 5. Page count */}
          <div className="rounded-xl border border-border bg-surface p-3.5 shadow-soft">
            <span className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Page count</span>
            <div className="flex items-center gap-3">
              <input
                type="number" min={1} max={1000} value={s.pageCount}
                onChange={e => update('pageCount', Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full rounded-lg border border-border bg-secondary/20 px-3 py-1.5 text-sm font-semibold text-foreground outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
              />
              <span className="text-xs text-muted-foreground shrink-0 font-semibold">pages analyzed</span>
            </div>
          </div>

        </div>

        {/* Left Sticky Footer Actions */}
        <div className="sticky bottom-0 z-10 shrink-0 space-y-2 border-t border-border bg-surface px-3 py-3 shadow-[0_-12px_28px_-24px_rgba(15,23,42,0.5)] rounded-xl">
          <button
            type="button"
            disabled={!canContinue}
            onClick={() => onConfirm(s)}
            className="ds-button-primary ds-focus flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold disabled:opacity-60 transition-transform active:scale-[0.98]"
          >
            {isComputing ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Reviewing issues…</>
            ) : scanDone ? (
              <>Continue to Repair Studio <ArrowRight className="h-4 w-4" /></>
            ) : (
              <><Loader2 className="h-4 w-4 animate-spin" /> Scanning pages…</>
            )}
          </button>
          <button
            type="button"
            onClick={onBack}
            className="ds-focus flex w-full items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="h-3 w-3" /> Upload different files
          </button>
        </div>

      </div>

      {/* ─── Right Panel: Inspection & Verdict Board (Scrolls Internally) ─── */}
      <div className="h-full overflow-y-auto pb-6 space-y-4">
        
        {/* Status Indicators */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3 shadow-soft">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Scan progress</span>
            <div className="mt-1">
              <ScanIndicator scan={scan} />
            </div>
          </div>
          
          {isPrint && (
            <div className="flex flex-col gap-0.5 items-start sm:items-end">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Spine thickness</span>
              <div className="mt-1">
                <SpineTag pageCount={s.pageCount} paper={s.paper} />
              </div>
            </div>
          )}
        </div>

        {/* Alerts & Mismatches */}
        <AnimatePresence>
          {(hasLowConf || detectedDiffers || isComputing) && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-col gap-2 overflow-hidden"
            >
              {hasLowConf && (
                <div className="flex items-center gap-3 rounded-xl border border-warning/30 bg-warning/8 px-4 py-2.5">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-warning" />
                  <p className="text-xs text-warning">
                    Low confidence detected on some PDF configurations — please review values before running diagnostics.
                  </p>
                </div>
              )}
              {detectedDiffers && (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-warning/30 bg-warning/8 px-4 py-2.5">
                  <p className="text-xs font-semibold text-warning">Your edited values differ from automated detections.</p>
                  <div className="flex shrink-0 gap-2">
                    <button 
                      type="button" 
                      onClick={() => setHasUserEdited(true)}
                      className="rounded-lg bg-surface px-2.5 py-1 text-xs font-bold text-foreground ring-1 ring-border shadow-soft hover:bg-muted/10"
                    >
                      Keep mine
                    </button>
                    <button 
                      type="button"
                      onClick={() => { setHasUserEdited(true); setS({ ...detected, configSource: 'user', configLocked: true, lastUpdated: Date.now() }) }}
                      className="rounded-lg px-2.5 py-1 text-xs font-bold text-warning hover:bg-surface/50"
                    >
                      Use detected
                    </button>
                  </div>
                </div>
              )}
              {isComputing && (
                <div className="flex items-center gap-3 rounded-xl border border-primary/25 bg-surface px-4 py-2.5">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <p className="text-xs font-semibold text-foreground">Analyzing file dimensions and margin safe zones with selected setup…</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Visual Inspection Card */}
        <div className="grid gap-4 md:grid-cols-[220px_1fr] rounded-xl border border-border bg-surface p-4 shadow-soft">
          
          {/* PDF Page 1 Mockup Thumbnail */}
          <div className="flex flex-col items-center justify-center bg-secondary/30 rounded-xl p-4 border border-border/60">
            <div className="relative shrink-0 overflow-hidden rounded-lg border border-border bg-background shadow-soft hover:shadow-card transition-shadow" style={{ width: 130, height: 180 }}>
              {!previewImgLoaded && firstPageDataUrl && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              )}
              {firstPageDataUrl ? (
                <img
                  src={firstPageDataUrl}
                  alt="First page preview"
                  className="h-full w-full object-contain"
                  onLoad={() => setPreviewImgLoaded(true)}
                  onError={() => setPreviewImgLoaded(true)}
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-3">
                  <FileText className="h-7 w-7 text-muted-foreground/35 mb-2" />
                  <span className="text-[10px] text-muted-foreground/60 font-semibold leading-relaxed">No preview page generated</span>
                </div>
              )}
            </div>
            <span className="mt-3 block text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Page 1 Layout</span>
          </div>

          {/* File Statistics & Meta */}
          <div className="flex flex-col justify-between min-w-0">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Document Info & Verification</span>
              
              <div className="mt-3 space-y-2">
                {files?.manuscript && (
                  <div className="flex items-center justify-between rounded-lg border border-border/40 bg-secondary/10 px-3 py-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="h-4 w-4 shrink-0 text-primary/65" />
                      <span className="truncate text-xs font-semibold text-foreground">{files.manuscript.name}</span>
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground shrink-0 font-semibold ml-2">
                      {(files.manuscript.size / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>
                )}

                {files?.cover && (
                  <div className="flex items-center justify-between rounded-lg border border-border/40 bg-secondary/10 px-3 py-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <ImageIcon className="h-4 w-4 shrink-0 text-primary/65" />
                      <span className="truncate text-xs font-semibold text-foreground">{files.cover.name}</span>
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground shrink-0 font-semibold ml-2">
                      {(files.cover.size / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-border/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Calculated targets</span>
              <div className="mt-2.5 grid grid-cols-2 sm:grid-cols-3 gap-2">
                
                <div className="rounded-lg border border-border/50 bg-secondary/5 p-2">
                  <span className="block text-[9px] font-bold text-muted-foreground uppercase leading-none">Trim target</span>
                  <span className="mt-1 block font-mono text-xs font-bold text-foreground">
                    {TRIM_SIZES[s.trimSize]?.widthIn.toFixed(2)} × {TRIM_SIZES[s.trimSize]?.heightIn.toFixed(2)} in
                  </span>
                </div>

                <div className="rounded-lg border border-border/50 bg-secondary/5 p-2">
                  <span className="block text-[9px] font-bold text-muted-foreground uppercase leading-none">Bleed margin</span>
                  <span className="mt-1 block font-mono text-xs font-bold text-foreground">
                    {s.bleed === 'bleed' ? '0.125 in' : 'None'}
                  </span>
                </div>

                <div className="rounded-lg border border-border/50 bg-secondary/5 p-2 col-span-2 sm:col-span-1">
                  <span className="block text-[9px] font-bold text-muted-foreground uppercase leading-none">Safe Margin Inset</span>
                  <span className="mt-1 block font-mono text-xs font-bold text-foreground">
                    0.250 in
                  </span>
                </div>

              </div>
            </div>

          </div>

        </div>

        {/* Verification matrix guidelines */}
        <div className="rounded-xl border border-border bg-surface p-4 shadow-soft">
          <span className="flex items-center gap-1.5 text-xs font-bold text-foreground mb-2">
            <Ruler className="h-4 w-4 text-primary" />
            KDP Print Layout Guidelines
          </span>
          <ul className="text-[11px] leading-relaxed text-muted-foreground space-y-1.5 list-disc pl-4">
            <li><strong>Margins check:</strong> Safe boundary must cover at least 0.25" inward from trim edges. Pages must not have text overflow outside safe boxes.</li>
            <li><strong>Bleed expansion:</strong> If images bleed, the PDF page size must measure exactly {TRIM_SIZES[s.trimSize]?.widthIn.toFixed(2) ? (TRIM_SIZES[s.trimSize].widthIn + 0.125).toFixed(3) : 'trim + 0.125"'} × {TRIM_SIZES[s.trimSize]?.heightIn.toFixed(2) ? (TRIM_SIZES[s.trimSize].heightIn + 0.25).toFixed(3) : 'trim + 0.25"'} in.</li>
            <li><strong>Spine text:</strong> Books require a minimum of 80 pages to place readable text on the spine surface. Cream paper produces wider spines than white paper.</li>
          </ul>
        </div>

      </div>

    </div>
  )
}
