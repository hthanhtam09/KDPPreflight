'use client'

import {
  BARCODE_AREA,
  MAX_PAGE_COUNT_HARDCOVER,
  MAX_PAGE_COUNT_PAPERBACK,
  MIN_PAGE_COUNT,
  TRIM_SIZES,
  formatInches,
  inchesToPixels,
} from '@/engine/kdp-constants'
import { useAppStore } from '@/store/use-app-store'
import type {
  BleedType,
  BookType,
  CoverFinish,
  InteriorType,
  PaperType,
  ReadingDirection,
  TrimSizeKey,
} from '@/types/kdp'
import {
  AlertTriangle,
  BookOpen,
  Box,
  CheckCircle2,
  Clipboard,
  Download,
  FileText,
  Info,
  Monitor,
  Ruler,
} from 'lucide-react'
import { useCallback, useMemo, useState, type ReactNode } from 'react'

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

export default function SetupFeature() {
  const { bookType, setBookType, bookConfig, updateBookConfig, measurements } = useAppStore()
  const [copied, setCopied] = useState<string | null>(null)

  const isKindle = bookType === 'kindle'
  const isHardcover = bookType === 'hardcover'
  const trimKeys = isHardcover ? HARDCOVER_TRIMS : PAPERBACK_TRIMS
  const maxPages = isHardcover ? MAX_PAGE_COUNT_HARDCOVER : MAX_PAGE_COUNT_PAPERBACK
  const pageWarning = !isKindle && (bookConfig.pageCount < 80 || measurements.spineWidthIn < 0.15)

  const specs = useMemo(() => {
    const manuscript = isKindle
      ? 'Reflowable Kindle file'
      : `${formatInches(measurements.trimWidthIn)} x ${formatInches(measurements.trimHeightIn)} ${
          bookConfig.bleed === 'bleed' ? 'plus 0.125" bleed' : 'no bleed'
        }`
    const cover = isKindle
      ? 'Kindle cover image, 1600 x 2560 px recommended'
      : `${formatInches(measurements.fullCoverWidthIn)} x ${formatInches(measurements.fullCoverHeightIn)}`

    return [
      {
        key: 'manuscript',
        label: 'Manuscript size',
        value: manuscript,
        note: 'Use this for your interior document setup.',
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
      {
        key: 'barcode',
        label: 'Barcode area',
        value: isKindle ? 'Not applicable' : `${BARCODE_AREA.width}" x ${BARCODE_AREA.height}"`,
        note: 'Leave the lower-right back cover clear.',
      },
      {
        key: 'export',
        label: 'Export recommendation',
        value: isKindle ? 'EPUB plus high-res JPEG cover' : 'PDF/X or high-quality print PDF at 300 DPI',
        note: 'Flatten transparency before final upload when possible.',
      },
    ]
  }, [bookConfig.bleed, isKindle, measurements])

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

  return (
    <div className="space-y-8 text-foreground">
      {/* ── Section 2 + 3 + 4: Main content ── */}
      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        {/* Left: Guided Setup Steps */}
        <div className="space-y-3">
          {/* Step 1: Book Format */}
          <StepCard step={1} label="Book format" help="KDP rules and cover dimensions change by format.">
            <div className="grid grid-cols-3 gap-2">
              {[
                { type: 'paperback' as BookType, icon: BookOpen, label: 'Paperback' },
                { type: 'hardcover' as BookType, icon: Box, label: 'Hardcover' },
                { type: 'kindle' as BookType, icon: Monitor, label: 'Kindle' },
              ].map(({ type, icon: Icon, label }) => (
                <button
                  key={type}
                  onClick={() => handleBookType(type)}
                  className={`ds-focus flex flex-col items-center gap-2 rounded-xl border p-3 text-xs font-semibold transition-colors ${
                    bookType === type
                      ? 'border-primary/40 bg-primary/8 text-primary'
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
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
              <div className="flex gap-3">
                <Monitor className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Kindle format selected</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Kindle files are reflowable — no print trim sizes or spine calculations apply. Your cover image
                    should be 1600 × 2560 px at 72 DPI minimum.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Step 2: Trim Size */}
              <StepCard step={2} label="Trim size" help="Pick the finished page size your book will be printed at.">
                <select
                  value={bookConfig.trimSize}
                  onChange={(e) => updateBookConfig({ trimSize: e.target.value as TrimSizeKey })}
                  className="ds-control ds-focus min-h-11 w-full rounded-lg px-3 text-sm"
                >
                  {trimKeys.map((key) => (
                    <option key={key} value={key}>
                      {TRIM_SIZES[key].label}
                    </option>
                  ))}
                </select>
              </StepCard>

              {/* Step 3: Bleed */}
              <StepCard step={3} label="Bleed" help="Use bleed when artwork or backgrounds touch the page edge.">
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'no-bleed', label: 'No bleed', desc: 'Journals, text interiors' },
                    { value: 'bleed', label: 'With bleed', desc: 'Art, color, photo books' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => updateBookConfig({ bleed: opt.value as BleedType })}
                      className={`ds-focus rounded-xl border p-3 text-left transition-colors ${
                        bookConfig.bleed === opt.value
                          ? 'border-primary/40 bg-primary/8'
                          : 'border-border bg-surface hover:border-primary/20'
                      }`}
                    >
                      <p
                        className={`text-xs font-semibold ${bookConfig.bleed === opt.value ? 'text-primary' : 'text-foreground'}`}
                      >
                        {opt.label}
                      </p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </StepCard>

              {/* Step 4: Page Count */}
              <StepCard step={4} label="Page count" help="Must be even. Spine width updates as you change this.">
                <input
                  type="number"
                  min={MIN_PAGE_COUNT}
                  max={maxPages}
                  step={2}
                  value={bookConfig.pageCount}
                  onChange={(e) => {
                    const raw = Number(e.target.value)
                    const even = raw % 2 === 0 ? raw : raw + 1
                    updateBookConfig({
                      pageCount: Math.max(MIN_PAGE_COUNT, Math.min(maxPages, even || MIN_PAGE_COUNT)),
                    })
                  }}
                  className="ds-control ds-focus min-h-11 w-full rounded-lg px-3 text-sm"
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  Valid range: {MIN_PAGE_COUNT}–{maxPages} pages · Current spine:{' '}
                  {formatInches(measurements.spineWidthIn)}
                </p>
                {pageWarning && (
                  <div className="mt-2 flex gap-2 rounded-lg border border-warning/30 bg-warning/10 p-2.5">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
                    <p className="text-xs text-warning">
                      {bookConfig.pageCount < 80
                        ? 'Low page count — avoid spine text.'
                        : 'Thin spine — keep spine artwork simple.'}
                    </p>
                  </div>
                )}
              </StepCard>

              {/* Step 5: Paper & Finish */}
              <StepCard
                step={5}
                label="Paper & finish"
                help="Paper type affects spine thickness; finish guides cover proofing."
              >
                <div className="space-y-2">
                  <select
                    value={bookConfig.paper}
                    onChange={(e) => updateBookConfig({ paper: e.target.value as PaperType })}
                    className="ds-control ds-focus min-h-11 w-full rounded-lg px-3 text-sm"
                  >
                    <option value="white">White paper</option>
                    <option value="cream">Cream paper</option>
                    <option value="premium-color">Premium color paper</option>
                  </select>
                  <select
                    value={bookConfig.interior}
                    onChange={(e) => updateBookConfig({ interior: e.target.value as InteriorType })}
                    className="ds-control ds-focus min-h-11 w-full rounded-lg px-3 text-sm"
                  >
                    <option value="black-white">Black and white interior</option>
                    <option value="standard-color">Standard color interior</option>
                    <option value="premium-color">Premium color interior</option>
                  </select>
                  <select
                    value={bookConfig.coverFinish ?? 'matte'}
                    onChange={(e) => updateBookConfig({ coverFinish: e.target.value as CoverFinish })}
                    className="ds-control ds-focus min-h-11 w-full rounded-lg px-3 text-sm"
                  >
                    <option value="matte">Matte cover finish</option>
                    <option value="glossy">Glossy cover finish</option>
                  </select>
                  <select
                    value={bookConfig.readingDirection ?? 'ltr'}
                    onChange={(e) => updateBookConfig({ readingDirection: e.target.value as ReadingDirection })}
                    className="ds-control ds-focus min-h-11 w-full rounded-lg px-3 text-sm"
                  >
                    <option value="ltr">Left-to-right reading</option>
                    <option value="rtl">Right-to-left reading</option>
                  </select>
                </div>
              </StepCard>
            </>
          )}
        </div>

        {/* Right: Preview + Specs */}
        <div className="space-y-6">
          {/* ── Section 3: Live KDP Preview ── */}
          <div className="ws-card">
            <div className="mb-4 flex items-center gap-3">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <Ruler className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground">Live cover layout</h2>
                <p className="text-xs text-muted-foreground">
                  Trim, bleed, safe area, spine, and barcode zones update in real time
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

          {/* ── Section 4: Your KDP Dimensions ── */}
          <div>
            <div className="mb-3 flex items-center gap-3">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <Clipboard className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground">Your KDP dimensions</h2>
                <p className="text-xs text-muted-foreground">Click any card to copy the value</p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {specs.map((item) => (
                <button
                  key={item.key}
                  onClick={() => handleCopy(item.key, item.value)}
                  className="ds-focus group w-full rounded-xl border border-border bg-surface p-3 text-left transition-colors hover:border-primary/30"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-muted-foreground">{item.label}</p>
                      <p className="mt-1 truncate font-mono text-sm text-foreground">{item.value}</p>
                      <p className="mt-1 text-[11px] leading-5 text-muted-foreground">{item.note}</p>
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

            <div
              className={`mt-3 rounded-xl border p-4 ${pageWarning ? 'border-warning/30 bg-warning/10' : 'border-success/25 bg-success/10'}`}
            >
              <div className="flex gap-3">
                {pageWarning ? (
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                ) : (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                )}
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {pageWarning ? 'Review before adding spine text' : 'Specs look practical'}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {helperForPageCount(bookType, bookConfig.pageCount, measurements.spineWidthIn)}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-3 rounded-xl border border-border bg-surface p-4">
              <div className="flex gap-3">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <p className="text-xs leading-5 text-muted-foreground">
                  Keep cover text out of the barcode, hinge, and safe-margin zones. Recheck final PDFs after exporting,
                  not just the design file.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 5: Export / CTA ── */}
      <div className="rounded-2xl border border-border bg-primary/4 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Ready to design?</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Download a blank cover template or check your finished files for KDP compliance.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => downloadTemplate(measurements.fullCoverWidthIn, measurements.fullCoverHeightIn)}
              className="ds-button-primary ds-focus inline-flex min-h-9 items-center gap-2 rounded-lg px-4 text-sm font-semibold"
            >
              <Download className="h-4 w-4" />
              Download template
            </button>
            <a
              href="/checker"
              className="ds-focus ds-control inline-flex min-h-9 items-center gap-2 rounded-lg px-4 text-sm font-semibold"
            >
              <FileText className="h-4 w-4" />
              Format Checker
            </a>
          </div>
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
      <div className="grid min-h-[320px] place-items-center rounded-xl bg-secondary/60 p-6">
        <div className="relative aspect-[0.66] w-full max-w-[200px] rounded-[1.4rem] border border-border bg-surface p-4 shadow-elevated">
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
    <div className="grid min-h-[320px] place-items-center rounded-xl bg-secondary/60 p-4">
      <div className="w-full max-w-[760px]">
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
            value={`${formatInches(measurements.trimWidthIn)} x ${formatInches(measurements.trimHeightIn)}`}
          />
          <Dimension
            label="Full cover"
            value={`${formatInches(measurements.fullCoverWidthIn)} x ${formatInches(measurements.fullCoverHeightIn)}`}
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
