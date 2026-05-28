'use client'

import { TRIM_SIZES } from '@/engine/kdp-constants'
import type { BleedType, InteriorType, PaperType, TrimSizeKey } from '@/types/kdp'
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  Circle,
  FileText,
  ImageIcon,
  Loader2,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import type { KRConfidence, KRDetectedSettings, KRScanState } from './types'

// ── Confidence badge ──────────────────────────────────────────────────────────

function ConfBadge({ level }: { readonly level: KRConfidence }) {
  if (level === 'high')
    return (
      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
        Detected
      </span>
    )
  if (level === 'medium')
    return (
      <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[9px] font-bold text-amber-600 dark:text-amber-400 border border-amber-500/20">
        Uncertain
      </span>
    )
  return (
    <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-[9px] font-bold text-rose-600 dark:text-rose-400 border border-rose-500/20">
      Low confidence
    </span>
  )
}

// ── Spine preview ─────────────────────────────────────────────────────────────

const PAPER_THICKNESS: Record<PaperType, number> = {
  white: 0.002252,
  cream: 0.0025,
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

  const label = isNarrow ? 'Too narrow for text' : isThin ? 'Use bold text only' : 'Spine supports text'

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
    reading: 'Reading file…',
    detecting: 'Detecting settings…',
    scanning: `Scanning pages${scan.totalPages > 0 ? ` (${scan.pagesScanned}/${scan.totalPages})` : '…'}`,
    analyzing: 'Analyzing content…',
  }
  return (
    <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2 text-xs font-bold text-muted-foreground animate-pulse">
      <Loader2 className="h-4 w-4 animate-spin text-primary" />
      <span>{label[scan.phase] ?? 'Processing…'}</span>
    </div>
  )
}

function scanProgress(scan: KRScanState) {
  if (scan.phase === 'done') return 100
  if (scan.phase === 'error') return 100
  if (scan.totalPages > 0 && scan.pagesScanned > 0) {
    const pageProgress = Math.min(94, Math.max(18, Math.round((scan.pagesScanned / scan.totalPages) * 82)))
    if (scan.phase === 'analyzing') return Math.max(pageProgress, 86)
    if (scan.phase === 'scanning') return pageProgress
  }
  const phaseBase: Record<KRScanState['phase'], number> = {
    idle: 4,
    reading: 16,
    detecting: 34,
    scanning: 58,
    analyzing: 88,
    done: 100,
    error: 100,
    cancelled: 0,
  }
  return phaseBase[scan.phase] ?? 12
}

function scanLabel(scan: KRScanState) {
  const labels: Record<string, string> = {
    idle: 'Preparing scan...',
    reading: 'Reading files...',
    detecting: 'Detecting page size...',
    scanning: scan.totalPages > 0 ? `Counting pages (${scan.pagesScanned}/${scan.totalPages})` : 'Counting pages...',
    analyzing: 'Preparing print settings...',
    done: `Scan complete - ${scan.totalPages} pages reviewed`,
    error: 'Scan could not complete',
    cancelled: 'Scan cancelled',
  }
  return labels[scan.phase] ?? 'Scanning files...'
}

function ScanProgressScreen({
  scan,
  files,
  detected,
  onBack,
}: {
  readonly scan: KRScanState
  readonly files?: { manuscript: File | null; cover: File | null }
  readonly detected: KRDetectedSettings
  readonly onBack: () => void
}) {
  const progress = scanProgress(scan)
  const stages = [
    'Reading files',
    'Detecting page size',
    'Counting pages',
    'Checking cover dimensions',
    'Preparing print settings',
  ]
  const activeStage = Math.min(stages.length - 1, Math.floor((progress / 100) * stages.length))
  const fileSize = (file: File) => `${(file.size / (1024 * 1024)).toFixed(2)} MB`

  if (scan.phase === 'error') {
    return (
      <div className="grid h-full min-h-0 place-items-center overflow-hidden">
        <div className="w-full max-w-2xl rounded-[24px] border border-danger/20 bg-surface p-6 text-center shadow-card">
          <AlertTriangle className="mx-auto h-9 w-9 text-danger" />
          <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-foreground">Scan could not complete</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
            {scan.errorMessage || 'The PDF scan stopped before all metadata could be read.'}
          </p>
          <button
            type="button"
            onClick={onBack}
            className="mt-5 inline-flex min-h-10 items-center justify-center rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-muted-foreground hover:bg-muted/40 hover:text-foreground"
          >
            Back to Import
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="grid h-full min-h-0 place-items-center overflow-hidden">
      <div className="w-full max-w-3xl rounded-[24px] border border-border bg-surface p-6 shadow-card">
        <div className="text-center">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-primary">Local processing</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground">Scanning your files</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            We're reading your manuscript and cover details before showing print settings.
          </p>
        </div>

        <div className="mt-6 rounded-2xl border border-border bg-muted/20 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-bold text-foreground">{scanLabel(scan)}</p>
              <p className="mt-1 text-xs text-muted-foreground">Files stay in your browser.</p>
            </div>
            <span className="font-mono text-sm font-extrabold text-primary">{progress}%</span>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-border/70">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {files?.manuscript && (
            <div className="rounded-2xl border border-border bg-surface p-4">
              <FileText className="h-5 w-5 text-primary" />
              <p className="mt-2 truncate text-sm font-bold text-foreground">{files.manuscript.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {scan.totalPages > 0 ? `${scan.totalPages} pages detected` : 'Reading manuscript'} ·{' '}
                {fileSize(files.manuscript)}
              </p>
            </div>
          )}
          {files?.cover && (
            <div className="rounded-2xl border border-border bg-surface p-4">
              <ImageIcon className="h-5 w-5 text-primary" />
              <p className="mt-2 truncate text-sm font-bold text-foreground">{files.cover.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">Cover dimensions detecting · {fileSize(files.cover)}</p>
            </div>
          )}
        </div>

        <div className="mt-4 grid gap-2">
          {stages.map((stage, index) => (
            <div key={stage} className="flex items-center gap-3 rounded-xl border border-border bg-muted/15 px-3 py-2">
              {index < activeStage ? (
                <CheckCircle2 className="h-4 w-4 text-success" />
              ) : index === activeStage ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground/50" />
              )}
              <span
                className={`text-xs font-semibold ${index <= activeStage ? 'text-foreground' : 'text-muted-foreground'}`}
              >
                {stage}
              </span>
            </div>
          ))}
        </div>

        {scan.phase === 'done' && (
          <div className="mt-4 rounded-2xl border border-success/20 bg-success/8 p-3 text-center text-sm font-bold text-success">
            Scan complete - {detected.pageCount} pages reviewed
          </div>
        )}
      </div>
    </div>
  )
}

// ── Select ────────────────────────────────────────────────────────────────────

function Select<T extends string>({
  value,
  options,
  onChange,
}: {
  readonly value: T
  readonly options: { value: T; label: string }[]
  readonly onChange: (v: T) => void
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs font-semibold text-foreground outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}

// ── Options ───────────────────────────────────────────────────────────────────

const TRIM_OPTIONS = Object.entries(TRIM_SIZES)
  .filter(([k]) => k !== 'custom')
  .map(([k, v]) => ({ value: k as TrimSizeKey, label: v.label }))

const BLEED_OPTIONS: { value: BleedType; label: string }[] = [
  { value: 'no-bleed', label: 'No bleed (white margins)' },
  { value: 'bleed', label: 'Bleed (0.125" page edges)' },
]

const PAPER_OPTIONS: { value: PaperType; label: string }[] = [
  { value: 'white', label: 'White Paper' },
  { value: 'cream', label: 'Cream Paper' },
  { value: 'premium-color', label: 'Premium Color Paper' },
]

const INTERIOR_OPTIONS: { value: InteriorType; label: string; desc: string }[] = [
  { value: 'black-white', label: 'Black & White', desc: 'Standard print' },
  { value: 'standard-color', label: 'Standard Color', desc: 'Medium ink limit' },
  { value: 'premium-color', label: 'Premium Color', desc: 'Best ink limit' },
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
  detected,
  scan,
  isComputing,
  onConfirm,
  onBack,
  files,
  firstPageDataUrl,
}: ConfirmStepProps) {
  const [s, setS] = useState<KRDetectedSettings>(detected)
  const [hasUserEdited, setHasUserEdited] = useState(detected.configSource === 'user' || detected.configLocked)
  const [previewImgLoaded, setPreviewImgLoaded] = useState(!firstPageDataUrl)

  const scanDone = scan.phase === 'done' || scan.phase === 'error'
  const canContinue = scanDone && previewImgLoaded && !isComputing

  useEffect(() => {
    const htmlOverflow = document.documentElement.style.overflow
    const bodyOverflow = document.body.style.overflow
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'

    return () => {
      document.documentElement.style.overflow = htmlOverflow
      document.body.style.overflow = bodyOverflow
    }
  }, [])

  useEffect(() => {
    if (hasUserEdited && !(detected.configSource === 'user' || detected.configLocked)) return
    let cancelled = false
    queueMicrotask(() => {
      if (!cancelled) setS(detected)
    })
    return () => {
      cancelled = true
    }
  }, [detected, hasUserEdited])

  const update = <K extends keyof KRDetectedSettings>(k: K, v: KRDetectedSettings[K]) => {
    setHasUserEdited(true)
    setS((prev) => ({
      ...prev,
      [k]: v,
      configSource: 'user',
      configLocked: true,
      lastUpdated: Date.now(),
      confidence: {
        ...prev.confidence,
        ...(k === 'trimSize' ? { trimSize: 'high' as KRConfidence } : {}),
        ...(k === 'bleed' ? { bleed: 'high' as KRConfidence } : {}),
      },
    }))
  }

  const isPrint = s.bookType !== 'kindle'
  const hasLowConf = s.confidence.trimSize === 'low' || s.confidence.bleed === 'low'
  const detectedDiffers =
    s.configLocked &&
    (s.trimSize !== detected.trimSize ||
      s.bleed !== detected.bleed ||
      s.paper !== detected.paper ||
      s.interior !== detected.interior ||
      s.pageCount !== detected.pageCount)

  if (!scanDone) {
    return <ScanProgressScreen scan={scan} files={files} detected={detected} onBack={onBack} />
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 overflow-hidden text-foreground">
      <div className="flex shrink-0 flex-col gap-3 rounded-[22px] border border-border bg-surface px-4 py-3 shadow-soft sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-primary">Confirm print settings</p>
          <h2 className="mt-1 text-xl font-extrabold tracking-tight text-foreground">
            Review detected values before diagnostics
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ScanIndicator scan={scan} />
          <span className="rounded-full border border-border bg-muted/35 px-3 py-1.5 text-xs font-bold text-muted-foreground">
            {s.pageCount} pages
          </span>
        </div>
      </div>

      <div className="app-grid-safe grid min-h-0 flex-1 gap-4 xl:grid-cols-[320px_minmax(0,1fr)_280px]">
        <section className="app-card config-panel min-h-0 overflow-auto p-4">
          <PanelTitle title="Detected settings" subtitle="Compact controls for the KDP setup." />
          <div className="mt-4 space-y-3">
            <FieldRow label="Trim size" badge={<ConfBadge level={s.confidence.trimSize} />}>
              <Select value={s.trimSize} options={TRIM_OPTIONS} onChange={(v) => update('trimSize', v)} />
              <p className="mt-1.5 text-[11px] text-muted-foreground">
                Detected: {detected.widthIn.toFixed(2)}" × {detected.heightIn.toFixed(2)}"
              </p>
            </FieldRow>

            {isPrint && (
              <FieldRow label="Bleed option" badge={<ConfBadge level={s.confidence.bleed} />}>
                <Select value={s.bleed} options={BLEED_OPTIONS} onChange={(v) => update('bleed', v as BleedType)} />
              </FieldRow>
            )}

            {isPrint && (
              <FieldRow label="Interior ink type">
                <div className="grid gap-2">
                  {INTERIOR_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className="flex cursor-pointer items-center justify-between rounded-lg border border-border/60 bg-muted/20 px-3 py-2 transition-colors hover:border-primary/25"
                    >
                      <span className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="interior"
                          value={opt.value}
                          checked={s.interior === opt.value}
                          onChange={() => update('interior', opt.value as InteriorType)}
                          className="accent-primary"
                        />
                        <span className="text-xs font-semibold text-foreground">{opt.label}</span>
                      </span>
                      <span className="text-[10px] font-semibold uppercase text-muted-foreground">{opt.desc}</span>
                    </label>
                  ))}
                </div>
              </FieldRow>
            )}

            {isPrint && (
              <FieldRow label="Paper stock">
                <Select value={s.paper} options={PAPER_OPTIONS} onChange={(v) => update('paper', v as PaperType)} />
              </FieldRow>
            )}

            <FieldRow label="Page count">
              <input
                type="number"
                min={1}
                max={1000}
                value={s.pageCount}
                onChange={(e) => update('pageCount', Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm font-semibold text-foreground outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
              />
            </FieldRow>
          </div>
        </section>

        <section className="app-card config-panel min-h-0 overflow-auto p-4">
          <PanelTitle title="Document summary" subtitle="Scan output and KDP target measurements." />

          {(hasLowConf || detectedDiffers || isComputing) && (
            <div className="mt-4 space-y-2">
              {hasLowConf && (
                <CompactAlert
                  tone="warning"
                  text="Low confidence detected on some PDF configurations - please review values."
                />
              )}
              {isComputing && (
                <CompactAlert
                  tone="primary"
                  text="Analyzing file dimensions and margin safe zones with selected setup..."
                  loading
                />
              )}
              {detectedDiffers && (
                <div className="rounded-2xl border border-warning/30 bg-warning/8 p-3">
                  <p className="text-xs font-semibold text-warning">
                    Your edited values differ from automated detections.
                  </p>
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setHasUserEdited(true)}
                      className="rounded-lg bg-surface px-2.5 py-1 text-xs font-bold text-foreground ring-1 ring-border"
                    >
                      Keep mine
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setHasUserEdited(true)
                        setS({ ...detected, configSource: 'user', configLocked: true, lastUpdated: Date.now() })
                      }}
                      className="rounded-lg px-2.5 py-1 text-xs font-bold text-warning hover:bg-surface/50"
                    >
                      Use detected
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-4 grid gap-3 md:grid-cols-[150px_minmax(0,1fr)]">
            <div className="grid place-items-center rounded-2xl border border-border bg-muted/25 p-3">
              <div className="relative h-[170px] w-[122px] overflow-hidden rounded-lg border border-border bg-background shadow-soft">
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
                  <div className="absolute inset-0 grid place-items-center p-3 text-center">
                    <FileText className="h-7 w-7 text-muted-foreground/35" />
                  </div>
                )}
              </div>
            </div>

            <div className="min-w-0 space-y-3">
              {files?.manuscript && (
                <FileInfo
                  icon={<FileText className="h-4 w-4 text-primary/70" />}
                  name={files.manuscript.name}
                  size={files.manuscript.size}
                />
              )}
              {files?.cover && (
                <FileInfo
                  icon={<ImageIcon className="h-4 w-4 text-primary/70" />}
                  name={files.cover.name}
                  size={files.cover.size}
                />
              )}
              <div className="grid grid-cols-2 gap-2">
                <InfoTile label="Pages" value={String(s.pageCount)} />
                <InfoTile
                  label="Trim target"
                  value={`${TRIM_SIZES[s.trimSize]?.widthIn.toFixed(2)} × ${TRIM_SIZES[s.trimSize]?.heightIn.toFixed(2)}`}
                />
                <InfoTile label="Bleed" value={s.bleed === 'bleed' ? '0.125 in' : 'None'} />
                <InfoTile label="Safe margin" value="0.250 in" />
                {isPrint && (
                  <InfoTile
                    label="Spine"
                    value={`${(s.pageCount * (PAPER_THICKNESS[s.paper] ?? PAPER_THICKNESS.white)).toFixed(3)} in`}
                  />
                )}
                <InfoTile label="Scan status" value={scan.phase === 'error' ? 'Partial' : 'Complete'} />
              </div>
            </div>
          </div>

          <details className="mt-4 rounded-2xl border border-border bg-muted/20 p-3">
            <summary className="cursor-pointer text-xs font-bold text-foreground">KDP layout guidelines</summary>
            <ul className="mt-3 list-disc space-y-1.5 pl-4 text-[11px] leading-relaxed text-muted-foreground">
              <li>Keep text and important art at least 0.25" inside trim edges.</li>
              <li>Bleed pages must extend artwork beyond trim edges.</li>
              <li>Books need at least 80 pages before spine text is practical.</li>
            </ul>
          </details>
        </section>

        <aside className="app-card config-panel min-h-0 overflow-auto p-4">
          <PanelTitle title="Ready to continue?" subtitle="Preflight will run diagnostics with these settings." />
          <div className="mt-4 space-y-3">
            <div className="rounded-2xl border border-success/20 bg-success/8 p-3">
              <p className="text-sm font-bold text-success">Setup ready for review</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Preflight will check trim, bleed, color, margins, cover, and PDF technical issues.
              </p>
            </div>
            {isPrint && <SpineTag pageCount={s.pageCount} paper={s.paper} />}
            {!canContinue && (
              <p className="rounded-xl border border-border bg-muted/20 p-3 text-xs font-semibold text-muted-foreground">
                Wait for preview loading to finish before continuing.
              </p>
            )}
          </div>
        </aside>
      </div>

      <div className="flex shrink-0 flex-col gap-3 rounded-2xl border border-border bg-surface-glass p-3 shadow-soft backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onBack}
          className="ds-focus inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-muted-foreground hover:bg-muted/40 hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Import
        </button>
        <button
          type="button"
          disabled={!canContinue}
          onClick={() => onConfirm(s)}
          className="ds-button-primary ds-focus inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isComputing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Reviewing issues...
            </>
          ) : (
            <>
              Continue to Preflight <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </div>
  )
}

function PanelTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h3 className="text-base font-extrabold text-foreground">{title}</h3>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{subtitle}</p>
    </div>
  )
}

function FieldRow({ label, badge, children }: { label: string; badge?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-3 shadow-soft">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
        {badge}
      </div>
      {children}
    </div>
  )
}

function FileInfo({ icon, name, size }: { icon: React.ReactNode; name: string; size: number }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/15 px-3 py-2">
      <div className="flex min-w-0 items-center gap-2">
        {icon}
        <span className="truncate text-xs font-semibold text-foreground">{name}</span>
      </div>
      <span className="shrink-0 font-mono text-[10px] font-semibold text-muted-foreground">
        {(size / (1024 * 1024)).toFixed(2)} MB
      </span>
    </div>
  )
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-muted/15 p-2">
      <p className="text-[9px] font-bold uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 truncate font-mono text-xs font-bold text-foreground">{value}</p>
    </div>
  )
}

function CompactAlert({
  text,
  tone,
  loading = false,
}: {
  text: string
  tone: 'warning' | 'primary'
  loading?: boolean
}) {
  const classes =
    tone === 'warning'
      ? 'border-warning/30 bg-warning/8 text-warning'
      : 'border-primary/25 bg-primary/8 text-foreground'
  return (
    <div className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold ${classes}`}>
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
      ) : (
        <AlertTriangle className="h-4 w-4 shrink-0" />
      )}
      {text}
    </div>
  )
}
