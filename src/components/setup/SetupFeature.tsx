'use client'

import {
  MAX_PAGE_COUNT_PAPERBACK,
  MIN_PAGE_COUNT,
  MIN_PAGE_COUNT_HARDCOVER,
  MAX_PAGE_COUNT_HARDCOVER,
  TRIM_SIZES,
  formatInches,
  inchesToPixels,
} from '@/engine/kdp-constants'
import {
  validateSetupConfig,
  getExpectedManuscriptSize,
  getMarginRequirements,
  KDP_RULE_VERSION,
  type KdpIssue,
  type SetupValidationResult,
} from '@/lib/kdp/kdp-rules'
import { useAppStore } from '@/store/use-app-store'
import type {
  BleedType,
  BookType,
  CoverFinish,
  InteriorType,
  PaperType,
  TrimSizeKey,
} from '@/types/kdp'
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Box,
  CheckCircle2,
  Clipboard,
  ExternalLink,
  Info,
  Monitor,
  Ruler,
} from 'lucide-react'
import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { div } from 'three/src/nodes/math/OperatorNode.js'

const PAPERBACK_TRIMS: TrimSizeKey[] = [
  '5x8',
  '5.25x8',
  '5.5x8.5',
  '6x9',
  '7x10',
  '7.44x9.69',
  '8x10',
  '8.25x6',
  '8.25x8.25',
  '8.5x8.5',
  '8.5x11',
]

const HARDCOVER_TRIMS: TrimSizeKey[] = ['5.5x8.5', '6x9', '7x10', '8.25x8.25', '8.5x11']

function copyText(value: string) {
  if (typeof navigator === 'undefined') return
  navigator.clipboard?.writeText(value).catch(() => undefined)
}

function helperForPageCount(type: BookType, pages: number, spine: number) {
  if (type === 'kindle') return 'Kindle files do not use print spine or trim calculations.'
  if (pages < 80) return 'Low page count: avoid spine text unless the printed spine is wide enough to read.'
  if (spine < 0.15) return 'Thin spine: keep spine artwork simple and verify against the KDP cover template.'
  return 'Page count is within the normal print range for this binding.'
}

function downloadTemplate(widthIn: number, heightIn: number) {
  const canvas = document.createElement('canvas')
  const dpi = 300
  canvas.width = inchesToPixels(widthIn, dpi)
  canvas.height = inchesToPixels(heightIn, dpi)
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.strokeStyle = '#c08457'
  ctx.lineWidth = 4
  ctx.setLineDash([24, 18])
  ctx.strokeRect(12, 12, canvas.width - 24, canvas.height - 24)
  ctx.fillStyle = 'rgba(192, 132, 87, 0.08)'
  ctx.fillRect(12, 12, canvas.width - 24, canvas.height - 24)
  const link = document.createElement('a')
  link.download = 'kdp-cover-template.png'
  link.href = canvas.toDataURL('image/png')
  link.click()
}

// Map trim keys to the lookup key format used in KDP matrix
const TRIM_KEY_MAP: Record<TrimSizeKey, string> = {
  '5x8': '5x8',
  '5.25x8': '5.25x8',
  '5.5x8.5': '5.5x8.5',
  '6x9': '6x9',
  '7x10': '7x10',
  '7.44x9.69': '7.44x9.69',
  '8x10': '8x10',
  '8.25x6': '8.25x6',
  '8.25x8.25': '8.25x8.25',
  '8.5x8.5': '8.5x8.5',
  '8.5x11': '8.5x11',
  'custom': 'custom',
}

export default function SetupFeature() {
  const { bookType, setBookType, bookConfig, updateBookConfig, measurements } = useAppStore()
  const [copied, setCopied] = useState<string | null>(null)
  const [pageCountInput, setPageCountInput] = useState(() => String(bookConfig.pageCount))
  const [isEditingPageCount, setIsEditingPageCount] = useState(false)
  const [showDevDiagnostics, setShowDevDiagnostics] = useState(false)

  const isKindle = bookType === 'kindle'
  const isHardcover = bookType === 'hardcover'
  const trimKeys = isHardcover ? HARDCOVER_TRIMS : PAPERBACK_TRIMS
  const maxPages = isHardcover ? MAX_PAGE_COUNT_HARDCOVER : MAX_PAGE_COUNT_PAPERBACK
  const minPages = isHardcover ? MIN_PAGE_COUNT_HARDCOVER : MIN_PAGE_COUNT
  const pageWarning = !isKindle && (bookConfig.pageCount < 80 || measurements.spineWidthIn < 0.15)
  const displayedPageCount = isEditingPageCount ? pageCountInput : String(bookConfig.pageCount)
  const pageCountDraft = Number.parseInt(pageCountInput, 10)
  const pageCountRangeError =
    isEditingPageCount &&
    pageCountInput.length > 0 &&
    Number.isFinite(pageCountDraft) &&
    (pageCountDraft < minPages || pageCountDraft > maxPages)

  // ── KDP Setup Validation ──────────────────────────────────────────────────

  const kdpValidation: SetupValidationResult | null = useMemo(() => {
    if (isKindle) return null
    const trim = TRIM_SIZES[bookConfig.trimSize]
    if (!trim) return null
    return validateSetupConfig({
      bookType: bookType as 'paperback' | 'hardcover',
      trimKey: TRIM_KEY_MAP[bookConfig.trimSize] ?? bookConfig.trimSize,
      trimWidthIn: trim.widthIn,
      trimHeightIn: trim.heightIn,
      interior: bookConfig.interior,
      paper: bookConfig.paper,
      bleed: bookConfig.bleed,
      pageCount: bookConfig.pageCount > 0 ? bookConfig.pageCount : null,
    })
  }, [bookType, bookConfig, isKindle])

  // ── Expected manuscript size (bleed-aware) ────────────────────────────────

  const expectedManuscriptSize = useMemo(() => {
    const trim = TRIM_SIZES[bookConfig.trimSize]
    if (!trim || isKindle) return null
    return getExpectedManuscriptSize(trim.widthIn, trim.heightIn, bookConfig.bleed)
  }, [bookConfig.trimSize, bookConfig.bleed, isKindle])

  // ── Margin requirements ───────────────────────────────────────────────────

  const marginReqs = useMemo(() => {
    if (!bookConfig.pageCount || bookConfig.pageCount <= 0) return null
    return getMarginRequirements(bookConfig.pageCount)
  }, [bookConfig.pageCount])

  // ── Specs for display cards ───────────────────────────────────────────────

  const specs = useMemo(() => {
    // Manuscript size display — shows the actual required PDF export size
    let manuscriptValue: string
    if (isKindle) {
      manuscriptValue = 'Reflowable Kindle file'
    } else if (expectedManuscriptSize) {
      const w = expectedManuscriptSize.widthIn.toFixed(3)
      const h = expectedManuscriptSize.heightIn.toFixed(3)
      manuscriptValue = expectedManuscriptSize.includesBleed
        ? `${w} × ${h} in (includes bleed)`
        : `${w} × ${h} in`
    } else {
      manuscriptValue = '—'
    }

    const cover = isKindle
      ? 'Kindle cover image, 1600 × 2560 px recommended'
      : `${formatInches(measurements.fullCoverWidthIn)} × ${formatInches(measurements.fullCoverHeightIn)}`

    return [
      {
        key: 'manuscript',
        label: 'Required manuscript PDF size',
        value: manuscriptValue,
        note: expectedManuscriptSize?.includesBleed
          ? 'Export your PDF at this size — bleed is already included.'
          : 'Export your PDF at exactly this size.',
      },
      {
        key: 'cover',
        label: 'Full cover size',
        value: cover,
        note: 'Back cover + spine + front cover, including bleed/wrap.',
      },
      {
        key: 'spine',
        label: 'Spine width',
        value: isKindle ? 'Not applicable' : formatInches(measurements.spineWidthIn),
        note: 'Driven by page count and paper type.',
      },
      {
        key: 'safe',
        label: 'Safe area',
        value: isKindle ? 'Device dependent' : `${formatInches(measurements.safeAreaIn)} inside trim`,
        note: 'Keep text and important art inside this zone.',
      },
    ]
  }, [bookConfig.bleed, isKindle, measurements, expectedManuscriptSize])

  const [activeTab, setActiveTab] = useState<'requirements' | 'cover'>('requirements')

  const handleBookType = useCallback(
    (type: BookType) => {
      setBookType(type)
      updateBookConfig({
        bookType: type,
        binding: type === 'hardcover' ? 'hardcover' : 'paperback',
        trimSize: type === 'hardcover' && !HARDCOVER_TRIMS.includes(bookConfig.trimSize) ? '6x9' : bookConfig.trimSize,
      })
    },
    [bookConfig.trimSize, setBookType, updateBookConfig]
  )

  const handleCopy = (key: string, value: string) => {
    copyText(value)
    setCopied(key)
    window.setTimeout(() => setCopied(null), 1200)
  }

  const commitPageCount = useCallback(
    (value: string) => {
      const raw = Number.parseInt(value, 10)
      const safeRaw = Number.isFinite(raw) ? raw : bookConfig.pageCount
      const even = safeRaw % 2 === 0 ? safeRaw : safeRaw + 1
      const pageCount = Math.max(minPages, Math.min(maxPages, even))

      setPageCountInput(String(pageCount))
      setIsEditingPageCount(false)
      updateBookConfig({ pageCount })
    },
    [bookConfig.pageCount, maxPages, minPages, updateBookConfig]
  )

  const handlePageCountInput = useCallback((value: string) => {
    setIsEditingPageCount(true)
    setPageCountInput(value.replace(/\D/g, ''))
  }, [])

  return (
    <div className="grid h-full w-full grid-cols-[280px_1fr_260px] gap-0 overflow-hidden text-foreground">
      {/* Left: Guided Setup Specs Form */}
      <div className="overflow-y-auto space-y-2 flex flex-col min-h-0 relative">
        <div className="space-y-2 flex-1">
          {/* Step 1: Book Format */}
          <StepCard step={1} label="Book format" help="KDP rules change by format.">
            <div className="grid grid-cols-3 gap-2">
              {[
                { type: 'paperback' as BookType, icon: BookOpen, label: 'Paperback' },
                { type: 'hardcover' as BookType, icon: Box, label: 'Hardcover' },
                { type: 'kindle' as BookType, icon: Monitor, label: 'Kindle' },
              ].map(({ type, icon: Icon, label }) => (
                <button
                  key={type}
                  onClick={() => handleBookType(type)}
                  className={`ds-focus flex flex-col items-center gap-1.5 rounded-xl border p-2 text-xs font-semibold transition-colors ${bookType === type
                    ? 'border-primary/40 bg-primary/8 text-primary font-bold'
                    : 'border-border bg-surface text-muted-foreground hover:border-primary/20 hover:text-foreground'
                    }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
          </StepCard>

          {isKindle ? (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
              <div className="flex gap-2">
                <Monitor className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <p className="text-xs font-bold text-foreground">Kindle format selected</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                    Kindle covers are images (1600 × 2560 px recommended). Print specs, trim sizes, and margins do not apply to e-readers.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Step 2: Trim Size */}
              <StepCard step={2} label="Trim size" help="Select the printed page trim dimensions.">
                <select
                  value={bookConfig.trimSize}
                  onChange={(e) => updateBookConfig({ trimSize: e.target.value as TrimSizeKey })}
                  className="ds-control ds-focus min-h-9 w-full rounded-lg px-2 py-1.5 text-xs font-semibold"
                >
                  {trimKeys.map((key) => (
                    <option key={key} value={key}>
                      {TRIM_SIZES[key].label}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-[10px] text-muted-foreground font-semibold">
                  Print Trim Size:{' '}
                  <span className="font-mono text-foreground">
                    {TRIM_SIZES[bookConfig.trimSize]?.widthIn.toFixed(2)} × {TRIM_SIZES[bookConfig.trimSize]?.heightIn.toFixed(2)} in
                  </span>
                </p>
              </StepCard>

              {/* Step 3: Bleed */}
              <StepCard step={3} label="Bleed" help="Use bleed if backgrounds or images reach the page edge.">
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'no-bleed', label: 'No bleed', desc: 'Text, journals' },
                    { value: 'bleed', label: 'With bleed', desc: 'Color, photo books' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => updateBookConfig({ bleed: opt.value as BleedType })}
                      className={`ds-focus rounded-xl border p-2 text-left transition-colors ${bookConfig.bleed === opt.value
                        ? 'border-primary/45 bg-primary/8'
                        : 'border-border bg-surface hover:border-primary/20'
                        }`}
                    >
                      <p
                        className={`text-xs font-bold ${bookConfig.bleed === opt.value ? 'text-primary' : 'text-foreground'}`}
                      >
                        {opt.label}
                      </p>
                      <p className="mt-0.5 text-[9px] text-muted-foreground">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </StepCard>

              {/* Step 4: Page Count */}
              <StepCard step={4} label="Page count" help="Must be even. Spine width scales dynamically.">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  min={minPages}
                  max={maxPages}
                  step={2}
                  value={displayedPageCount}
                  onFocus={() => {
                    setIsEditingPageCount(true)
                    setPageCountInput(String(bookConfig.pageCount))
                  }}
                  onChange={(e) => handlePageCountInput(e.target.value)}
                  onBlur={(e) => commitPageCount(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.currentTarget.blur()
                    }
                  }}
                  aria-invalid={pageCountRangeError}
                  aria-describedby="setup-page-count-help"
                  className={`ds-control ds-focus min-h-9 w-full rounded-lg px-2.5 py-1 text-xs font-semibold ${pageCountRangeError ? 'border-danger/60 text-danger' : ''
                    }`}
                />
                <p
                  id="setup-page-count-help"
                  className={`mt-1.5 text-[10px] ${pageCountRangeError ? 'text-danger font-semibold' : 'text-muted-foreground'}`}
                >
                  {pageCountRangeError
                    ? `Enter ${minPages}–${maxPages} pages.`
                    : `Allowed: ${minPages}–${maxPages} pages · Est. Spine: ${formatInches(measurements.spineWidthIn)}`}
                </p>
              </StepCard>

              {/* Step 5: Paper & Finish */}
              <StepCard
                step={5}
                label="Paper & finish"
                help="Paper affects spine thickness."
              >
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={bookConfig.paper}
                    onChange={(e) => updateBookConfig({ paper: e.target.value as PaperType })}
                    className="ds-control ds-focus min-h-9 w-full rounded-lg px-2 text-xs font-semibold"
                  >
                    <option value="white">White paper</option>
                    <option value="cream">Cream paper</option>
                  </select>
                  <select
                    value={bookConfig.interior}
                    onChange={(e) => updateBookConfig({ interior: e.target.value as InteriorType })}
                    className="ds-control ds-focus min-h-9 w-full rounded-lg px-2 text-xs font-semibold"
                  >
                    <option value="black-white">B&W Interior</option>
                    <option value="standard-color">Standard Color</option>
                    <option value="premium-color">Premium Color</option>
                  </select>
                  <select
                    value={bookConfig.coverFinish ?? 'matte'}
                    onChange={(e) => updateBookConfig({ coverFinish: e.target.value as CoverFinish })}
                    className="ds-control ds-focus col-span-2 min-h-9 w-full rounded-lg px-2 text-xs font-semibold"
                  >
                    <option value="matte">Matte cover finish</option>
                    <option value="glossy">Glossy cover finish</option>
                  </select>
                </div>
              </StepCard>

              {/* KDP Validation Panel */}
              {kdpValidation && <SetupValidationPanel validation={kdpValidation} />}
            </>
          )}
        </div>

      </div>

      {/* Main: Required Output + Cover Diagram (Scrolls Internally) */}
      <div className="overflow-y-auto flex flex-col space-y-3 min-h-0">
        {/* Tab switcher */}
        <div className="flex border-b border-border/40 pb-2 flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex gap-1 bg-muted/40 p-0.5 rounded-lg border border-border/30">
            <button
              onClick={() => setActiveTab('requirements')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${activeTab === 'requirements'
                ? 'bg-surface text-foreground shadow-soft border border-border/20'
                : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              Specs & Requirements
            </button>
            <button
              onClick={() => setActiveTab('cover')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${activeTab === 'cover'
                ? 'bg-surface text-foreground shadow-soft border border-border/20'
                : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                }`}
            >
              Cover Diagram
            </button>
          </div>
        </div>

        {/* Content switch */}
        {activeTab === 'requirements' ? (
          <div className="space-y-4 flex-1">
            {/* Required Manuscript PDF Export Size */}
            {expectedManuscriptSize && (
              <div className="rounded-xl border border-primary/20 bg-primary/4 p-4 shadow-soft">
                <span className="text-[10px] font-extrabold tracking-wider uppercase text-muted-foreground">REQUIRED INTERIOR MANUSCRIPT SIZE</span>
                <div className="mt-1.5 flex items-baseline gap-2.5 flex-wrap">
                  <span className="text-2xl sm:text-3xl font-extrabold text-foreground font-mono leading-none">
                    {expectedManuscriptSize.widthIn.toFixed(3)} × {expectedManuscriptSize.heightIn.toFixed(3)} in
                  </span>
                  {expectedManuscriptSize.includesBleed ? (
                    <span className="text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 rounded-full px-2.5 py-0.5">
                      Includes KDP Bleed
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-muted-foreground bg-muted border border-border/50 rounded-full px-2.5 py-0.5">
                      No Bleed
                    </span>
                  )}
                </div>
                <p className="mt-2.5 text-xs text-muted-foreground leading-normal">
                  Configure your canvas in Canva, Word, Pages, or InDesign to this exact sizing before exporting your interior print-ready PDF file.
                </p>
              </div>
            )}

            {/* Click to Copy Specs Cards */}
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">KDP SPECS SUMMARY (CLICK TO COPY)</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {specs.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => handleCopy(item.key, item.value)}
                    className="ds-focus group w-full rounded-xl border border-border bg-surface p-3 text-left transition-colors hover:border-primary/30"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">{item.label}</p>
                        <p className="mt-1 truncate font-mono text-sm font-extrabold text-foreground leading-none">{item.value}</p>
                        <p className="mt-1.5 text-[10px] leading-relaxed text-muted-foreground/80">{item.note}</p>
                      </div>
                      {copied === item.key ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                      ) : (
                        <Clipboard className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Page Count Warning Box */}
            <div className={`rounded-xl border p-4 shadow-soft ${pageWarning ? 'border-warning/30 bg-warning/10' : 'border-success/25 bg-success/10'}`}>
              <div className="flex gap-3">
                {pageWarning ? (
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                ) : (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                )}
                <div>
                  <p className="text-xs font-bold text-foreground">
                    {pageWarning ? 'Review spine spacing' : 'Page range check passed'}
                  </p>
                  <p className="mt-1 text-xs leading-normal text-muted-foreground">
                    {helperForPageCount(bookType, bookConfig.pageCount, measurements.spineWidthIn)}
                  </p>
                </div>
              </div>
            </div>

            {/* Collapsible Margin requirements */}
            {marginReqs && (
              <details className="group rounded-xl border border-border bg-surface/50 p-3 transition hover:bg-surface shadow-soft">
                <summary className="flex cursor-pointer items-center justify-between text-xs font-bold text-foreground outline-none">
                  <span>View KDP Gutter & Page Margin Minimums</span>
                  <span className="text-primary transition-transform group-open:rotate-180">▼</span>
                </summary>
                <div className="mt-3 text-xs text-muted-foreground space-y-2 border-t border-border/40 pt-3">
                  <p>KDP required minimum boundary margins for {bookConfig.pageCount} pages:</p>
                  <div className="grid grid-cols-2 gap-3 bg-muted/20 p-2.5 rounded-lg border border-border/40">
                    <div>
                      <p className="font-semibold text-foreground">Inside Gutter Margin</p>
                      <p className="font-mono text-sm font-bold text-primary mt-0.5">{marginReqs.insideIn}"</p>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Outside Page Margin</p>
                      <p className="font-mono text-sm font-bold text-primary mt-0.5">
                        {bookConfig.bleed === 'bleed' ? marginReqs.outsideBleedIn : marginReqs.outsideNoBleedIn}"
                      </p>
                    </div>
                  </div>
                  <p className="text-[10px] leading-relaxed text-muted-foreground/80">
                    Important: Body text, page numbers, and headers must not enter this border buffer zone to clear final verification checks on KDP.
                  </p>
                </div>
              </details>
            )}

            {/* Quick design guidelines */}
            <div className="rounded-xl border border-border bg-surface p-4 shadow-soft">
              <div className="flex gap-3">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <p className="text-xs leading-normal text-muted-foreground">
                  Text or elements touching margins will cause print submission rejections. Always perform final PDF proof checks, as design canvas bounds might slightly shift during export.
                </p>
              </div>
            </div>

            {/* Dev diagnostics */}
            {process.env.NODE_ENV === 'development' && kdpValidation && (
              <details className="group rounded-xl border border-border/50 p-2 text-[10px] text-muted-foreground">
                <summary className="cursor-pointer font-semibold outline-none hover:text-foreground">▼ Technical rules metadata</summary>
                <pre className="mt-2 max-h-48 overflow-auto rounded-lg border border-border bg-surface p-2 font-mono text-[9px]">
                  {JSON.stringify({
                    ruleVersion: KDP_RULE_VERSION,
                    expectedManuscriptSize: kdpValidation.expectedManuscriptSize,
                    checksPerformed: kdpValidation.checksPerformed,
                    checksSkipped: kdpValidation.checksSkipped,
                  }, null, 2)}
                </pre>
              </details>
            )}
          </div>
        ) : (
          <div className="space-y-4 flex-1">
            {/* Live KDP Preview Card */}
            <div className="rounded-xl border border-border bg-surface p-4 shadow-soft">
              <div className="mb-4 flex items-center gap-3">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Ruler className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-foreground">Interactive cover layout</h2>
                  <p className="text-xs text-muted-foreground">
                    Shows barcode safe area, hinges, spine bounds, and bleed wrapping limits.
                  </p>
                </div>
              </div>
              <BookDiagram isKindle={isKindle} isHardcover={isHardcover} />
              {!isKindle && (
                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <Legend label="Trim" className="border-primary/60" />
                  <Legend label="Bleed / wrap" className="border-danger/60 bg-danger/10" />
                  <Legend label="Safe area" className="border-success/60 border-dashed" />
                  <Legend label="Spine / barcode" className="border-warning/70 bg-warning/10" />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right: KDP Summary & Validation */}
      <div className="overflow-y-auto flex flex-col space-y-3 min-h-0">
        {!isKindle && expectedManuscriptSize && (
          <div className="rounded-xl border border-border bg-surface p-3">
            <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Setup Summary</p>
            <div className="space-y-2">
              <div>
                <p className="text-[10px] text-muted-foreground">Trim Size</p>
                <p className="text-sm font-semibold text-foreground">
                  {TRIM_SIZES[bookConfig.trimSize]?.label}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Interior Type</p>
                <p className="text-sm font-semibold text-foreground capitalize">
                  {bookConfig.interior.replace('-', ' ')}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Page Count</p>
                <p className="text-sm font-semibold text-foreground">{bookConfig.pageCount}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Bleed</p>
                <p className="text-sm font-semibold text-foreground">
                  {bookConfig.bleed === 'bleed' ? 'With bleed' : 'No bleed'}
                </p>
              </div>
            </div>
          </div>
        )}

        {kdpValidation && <SetupValidationPanel validation={kdpValidation} />}

        {isKindle && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
            <p className="text-xs font-bold text-foreground">Kindle format selected</p>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
              Kindle covers are images. Print specs do not apply.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// ── KDP Validation Panel ──────────────────────────────────────────────────────

function SetupValidationPanel({ validation }: { validation: SetupValidationResult }) {
  const blockingIssues = validation.issues.filter(i => i.category === 'must-fix')
  const warningIssues = validation.issues.filter(i => i.category === 'should-fix')
  const infoIssues = validation.issues.filter(i => i.category === 'info' && i.status !== 'skipped')

  if (blockingIssues.length === 0 && warningIssues.length === 0 && infoIssues.length === 0) {
    // All valid — show a small success indicator
    return (
      <div className="flex items-center gap-2 rounded-xl border border-success/25 bg-success/8 px-3 py-2.5">
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-success" />
        <p className="text-xs font-medium text-success">
          Valid KDP combination
          {validation.selectedPrintRule && (
            <span className="ml-1 font-normal text-muted-foreground">
              — {validation.selectedPrintRule.minPages}–{validation.selectedPrintRule.maxPages} pages allowed
            </span>
          )}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {blockingIssues.map(issue => (
        <ValidationIssueCard key={issue.id} issue={issue} />
      ))}
      {warningIssues.map(issue => (
        <ValidationIssueCard key={issue.id} issue={issue} />
      ))}
      {infoIssues.map(issue => (
        <ValidationIssueCard key={issue.id} issue={issue} />
      ))}
    </div>
  )
}

function ValidationIssueCard({ issue }: { issue: KdpIssue }) {
  const [expanded, setExpanded] = useState(false)

  const isBlocking = issue.category === 'must-fix'
  const isWarning = issue.category === 'should-fix'
  const isInfo = issue.category === 'info'

  const borderColor = isBlocking
    ? 'border-danger/40 bg-danger/8'
    : isWarning
      ? 'border-warning/40 bg-warning/8'
      : 'border-primary/20 bg-primary/5'

  const Icon = isBlocking ? AlertCircle : isWarning ? AlertTriangle : Info
  const iconColor = isBlocking ? 'text-danger' : isWarning ? 'text-warning' : 'text-primary'
  const titleColor = isBlocking ? 'text-danger' : isWarning ? 'text-warning' : 'text-foreground'

  return (
    <div className={`rounded-xl border p-3 ${borderColor}`}>
      <div className="flex items-start gap-2">
        <Icon className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${iconColor}`} />
        <div className="min-w-0 flex-1">
          <p className={`text-xs font-semibold ${titleColor}`}>{issue.title}</p>
          {expanded && (
            <div className="mt-1.5 space-y-1">
              <p className="text-[11px] leading-4 text-muted-foreground">{issue.whyMatters}</p>
              <p className="text-[11px] leading-4 text-foreground">{issue.howToFix}</p>
              {issue.evidence?.sourceUrl && (
                <a
                  href={issue.evidence.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary"
                >
                  <ExternalLink className="h-2.5 w-2.5" />
                  Source: Amazon KDP
                </a>
              )}
            </div>
          )}
          <button
            onClick={() => setExpanded(v => !v)}
            className="mt-1 text-[10px] text-muted-foreground hover:text-foreground"
          >
            {expanded ? '▲ Hide' : '▼ Why?'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StepCard({ step, label, help, children }: { step: number; label: string; help: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="mb-3 flex items-center gap-2.5">
        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
          {step}
        </span>
        <div>
          <p className="text-sm font-semibold text-foreground">{label}</p>
          <p className="text-[11px] text-muted-foreground">{help}</p>
        </div>
      </div>
      {children}
    </div>
  )
}

function BookDiagram({ isKindle, isHardcover }: { isKindle: boolean; isHardcover: boolean }) {
  const { measurements } = useAppStore()

  if (isKindle) {
    return (
      <div className="grid min-h-80 place-items-center rounded-xl bg-secondary/60 p-6">
        <div className="relative aspect-[0.66] w-full max-w-50 rounded-[1.4rem] border border-border bg-surface p-4 shadow-elevated">
          <div className="h-full rounded-md border border-border bg-background p-5">
            <div className="mb-5 h-3 w-2/3 rounded bg-muted" />
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="mb-3 h-2 rounded bg-muted"
                style={{ width: `${i % 3 === 0 ? 88 : i % 3 === 1 ? 72 : 96}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const spinePct = Math.max(3, Math.min(14, (measurements.spineWidthIn / measurements.fullCoverWidthIn) * 100))

  return (
    <div className="grid min-h-80 place-items-center rounded-xl bg-secondary/60 p-4">
      <div className="w-full max-w-190">
        <div className="relative aspect-[1.75] w-full rounded-lg border border-dashed border-danger/50 bg-danger/10 p-[3%] shadow-card">
          {isHardcover && <div className="absolute inset-[1.5%] rounded-md border border-dashed border-warning/60" />}
          <div className="relative flex h-full rounded-md border border-primary/60 bg-surface">
            <div className="relative flex-1 border-r border-border">
              <SafeBox label="Back cover safe area" />
              <div className="absolute bottom-[8%] right-[8%] grid h-[17%] w-[22%] place-items-center rounded border border-dashed border-warning/70 bg-warning/10 text-[10px] font-semibold text-warning">
                Barcode
              </div>
            </div>
            <div className="relative h-full border-x border-warning/70 bg-warning/10" style={{ width: `${spinePct}%` }}>
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-90 whitespace-nowrap text-[10px] font-semibold text-warning">
                Spine {formatInches(measurements.spineWidthIn)}
              </span>
            </div>
            <div className="relative flex-1">
              <SafeBox label="Front cover safe area" />
            </div>
          </div>
        </div>
        <div className="mt-4 grid gap-2 text-center sm:grid-cols-3">
          <Dimension
            label="Trim"
            value={`${formatInches(measurements.trimWidthIn)} × ${formatInches(measurements.trimHeightIn)}`}
          />
          <Dimension
            label="Full cover"
            value={`${formatInches(measurements.fullCoverWidthIn)} × ${formatInches(measurements.fullCoverHeightIn)}`}
          />
          <Dimension
            label={isHardcover ? 'Hinge' : 'Bleed'}
            value={isHardcover ? formatInches(measurements.hingeIn) : formatInches(measurements.bleedIn)}
          />
        </div>
      </div>
    </div>
  )
}

function SafeBox({ label }: { label: string }) {
  return (
    <div className="absolute inset-[8%] grid place-items-center rounded border border-dashed border-success/70 bg-success/10 text-center text-[11px] font-semibold text-success">
      {label}
    </div>
  )
}

function Dimension({ label, value }: { label: string; value: string }) {
  return (
    <button
      onClick={() => copyText(value)}
      className="ds-focus rounded-lg border border-border bg-surface px-3 py-2 text-left hover:border-primary/30"
    >
      <span className="block text-[11px] font-semibold text-muted-foreground">{label}</span>
      <span className="mt-0.5 block font-mono text-xs text-foreground">{value}</span>
    </button>
  )
}

function Legend({ label, className }: { label: string; className: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-xs text-muted-foreground">
      <span className={`h-3 w-6 rounded border ${className}`} />
      {label}
    </div>
  )
}
