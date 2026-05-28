'use client'

import { BLEED_SIZE_IN, TRIM_SIZES } from '@/engine/kdp-constants'
import { loadImage, loadPDF } from '@/engine/pdf-processor'
import { useAppStore } from '@/store/use-app-store'
import { BookType, DetectedConfig, TrimSizeKey, UploadedFile } from '@/types/kdp'
import {
  AlertCircle,
  Book,
  BookMarked,
  CheckCircle2,
  ChevronRight,
  FileText,
  Image as ImageIcon,
  Loader2,
  Monitor,
  Upload,
  X,
} from 'lucide-react'
import { useCallback, useRef, useState } from 'react'

// ---------------------------------------------------------------------------
// Auto-Detection: Match PDF dimensions to closest KDP trim size
// ---------------------------------------------------------------------------

async function detectConfigFromPDF(file: File): Promise<DetectedConfig> {
  const result = await loadPDF(file, { maxPages: 5, renderScale: 1.0 })
  const { widthIn, heightIn, pageCount } = result

  // Find closest trim size
  let bestMatch: TrimSizeKey | null = null
  let bestDistance = Infinity

  for (const [key, trim] of Object.entries(TRIM_SIZES)) {
    if (key === 'custom') continue
    // Check both orientations
    const d1 = Math.abs(trim.widthIn - widthIn) + Math.abs(trim.heightIn - heightIn)
    const d2 = Math.abs(trim.heightIn - widthIn) + Math.abs(trim.widthIn - heightIn)
    const dist = Math.min(d1, d2)
    if (dist < bestDistance) {
      bestDistance = dist
      bestMatch = key as TrimSizeKey
    }
  }

  // Confidence based on how close the match is
  const confidence = bestDistance < 0.02 ? 0.95 : bestDistance < 0.125 ? 0.8 : bestDistance < 0.5 ? 0.5 : 0.3

  // Detect bleed: if dimensions are larger than trim by ~0.125" on each side
  let bleed: 'bleed' | 'no-bleed' = 'no-bleed'
  if (bestMatch && bestMatch !== 'custom') {
    const trim = TRIM_SIZES[bestMatch]
    const expectedBleedWidth = trim.widthIn + BLEED_SIZE_IN * 2
    const expectedBleedHeight = trim.heightIn + BLEED_SIZE_IN * 2
    if (Math.abs(widthIn - expectedBleedWidth) < 0.05 || Math.abs(heightIn - expectedBleedHeight) < 0.05) {
      bleed = 'bleed'
    }
  }

  return {
    trimSize: bestMatch || undefined,
    bleed,
    pageCount,
    confidence,
    paper: 'white',
    bookType: 'paperback',
  }
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
  } = useAppStore()

  const [bookType, setBookType] = useState<BookType>(detectedConfig?.bookType || bookConfig.bookType || 'paperback')
  const [coverProcessing, setCoverProcessing] = useState(false)
  const [manuscriptProcessing, setManuscriptProcessing] = useState(false)
  const [kindleProcessing, setKindleProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isPaperOrHard = bookType === 'paperback' || bookType === 'hardcover'
  const canContinue = isPaperOrHard ? !!uploadedCover && !!uploadedManuscript : !!uploadedManuscript && !!uploadedCover

  // ---- Cover upload handler ----
  const handleCoverUpload = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
        setError('Cover must be a PDF, PNG, or JPEG file')
        return
      }
      setCoverProcessing(true)
      setError(null)
      try {
        let dataUrl: string
        let width: number
        let height: number

        if (file.type === 'application/pdf') {
          const result = await loadPDF(file, { maxPages: 1, renderScale: 2.5 })
          if (result.pages.length === 0 || !result.pages[0].dataUrl) {
            throw new Error('Cover PDF has no renderable pages')
          }
          dataUrl = result.pages[0].dataUrl
          width = result.widthIn
          height = result.heightIn

          // Auto-detect from cover PDF
          const detected = await detectConfigFromPDF(file)
          if (detected.confidence > 0.3) {
            setDetectedConfig(detected)
            if (detected.trimSize) {
              updateBookConfig({ trimSize: detected.trimSize })
            }
            if (detected.pageCount) {
              updateBookConfig({ pageCount: detected.pageCount })
            }
            if (detected.bleed) {
              updateBookConfig({ bleed: detected.bleed })
            }
          }
        } else {
          const result = await loadImage(file)
          dataUrl = result.dataUrl
          width = result.width
          height = result.height
        }

        setCoverDataUrl(dataUrl)
        setUploadedCover({
          id: crypto.randomUUID(),
          name: file.name,
          size: file.size,
          type: file.type,
          file,
          dimensions: { width, height },
          dataUrl,
        })
      } catch (err) {
        setError('Failed to process cover file')
        console.error(err)
      } finally {
        setCoverProcessing(false)
      }
    },
    [setUploadedCover, setCoverDataUrl, setDetectedConfig, updateBookConfig]
  )

  // ---- Manuscript upload handler ----
  const handleManuscriptUpload = useCallback(
    async (file: File) => {
      if (file.type !== 'application/pdf') {
        setError('Manuscript must be a PDF file')
        return
      }
      setManuscriptProcessing(true)
      setError(null)
      try {
        const result = await loadPDF(file, { maxPages: 50, renderScale: 1.5 })

        // Store pages
        for (let i = 0; i < result.pages.length; i++) {
          const page = result.pages[i]
          if (page.dataUrl) {
            setPdfPageDataUrl(i, page.dataUrl)
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
        })

        // Auto-detect from manuscript
        const detected = await detectConfigFromPDF(file)
        if (detected.confidence > 0.3) {
          // Merge with existing detected config
          setDetectedConfig((prev: any) => (prev ? { ...prev, ...detected } : detected))
          if (detected.trimSize && !detectedConfig?.trimSize) {
            updateBookConfig({ trimSize: detected.trimSize })
          }
          if (detected.pageCount) {
            updateBookConfig({ pageCount: detected.pageCount })
          }
        }
      } catch (err) {
        setError('Failed to process manuscript')
        console.error(err)
      } finally {
        setManuscriptProcessing(false)
      }
    },
    [setUploadedManuscript, setPdfPageDataUrl, setDetectedConfig, updateBookConfig, detectedConfig]
  )

  // ---- Kindle file upload handler ----
  const handleKindleUpload = useCallback(
    async (file: File) => {
      if (file.type !== 'application/pdf' && !file.name.endsWith('.epub')) {
        setError('Kindle file must be a PDF or EPUB')
        return
      }
      setKindleProcessing(true)
      setError(null)
      try {
        if (file.type === 'application/pdf') {
          const result = await loadPDF(file, { maxPages: 50, renderScale: 1.5 })
          for (let i = 0; i < result.pages.length; i++) {
            const page = result.pages[i]
            if (page.dataUrl) {
              setPdfPageDataUrl(i, page.dataUrl)
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
          })

          // Detect from kindle PDF
          const detected = await detectConfigFromPDF(file)
          detected.bookType = 'kindle'
          setDetectedConfig(detected)
          if (detected.pageCount) {
            updateBookConfig({ pageCount: detected.pageCount })
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
          })
        }
      } catch (err) {
        setError('Failed to process Kindle file')
        console.error(err)
      } finally {
        setKindleProcessing(false)
      }
    },
    [setUploadedManuscript, setPdfPageDataUrl, setDetectedConfig, updateBookConfig]
  )

  // ---- Remove file handlers ----
  const removeCover = useCallback(() => {
    setUploadedCover(null)
    setCoverDataUrl('')
  }, [setUploadedCover, setCoverDataUrl])

  const removeManuscript = useCallback(() => {
    setUploadedManuscript(null)
  }, [setUploadedManuscript])

  // ---- Book type change ----
  const handleBookTypeChange = useCallback(
    (type: BookType) => {
      setBookType(type)
      updateBookConfig({ bookType: type, binding: type === 'hardcover' ? 'hardcover' : 'paperback' })
      if (detectedConfig) {
        setDetectedConfig({ ...detectedConfig, bookType: type })
      }
    },
    [updateBookConfig, detectedConfig, setDetectedConfig]
  )

  // ---- Continue handler ----
  const handleContinue = useCallback(() => {
    // Ensure book type is synced
    updateBookConfig({ bookType, binding: bookType === 'hardcover' ? 'hardcover' : 'paperback' })
    setPreviewFlowStep('config')
  }, [bookType, updateBookConfig, setPreviewFlowStep])

  const anyProcessing = coverProcessing || manuscriptProcessing || kindleProcessing
  const statusMessage = anyProcessing
    ? 'Processing file...'
    : canContinue
      ? 'Files ready. Continue to settings.'
      : uploadedCover && !uploadedManuscript
        ? 'Manuscript required to continue.'
        : uploadedManuscript && !uploadedCover
          ? 'Cover required to continue.'
          : isPaperOrHard
            ? 'Upload cover and manuscript to continue.'
            : 'Upload your Kindle cover and manuscript files.'

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-4">
        <div className="mx-auto w-full max-w-[760px]">
          <TypeSwitcher bookType={bookType} setBookType={handleBookTypeChange} />
        </div>
      </div>

      {/* ---- Upload zones ---- */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {!isPaperOrHard && (
          <>
            <UploadZone
              title="Kindle cover"
              subtitle="PNG or JPG recommended"
              helper="Upload your Kindle cover image or supported cover PDF."
              requirement="Required"
              chips={['PNG', 'JPG', 'PDF']}
              accept=".png,.jpg,.jpeg,.pdf"
              onFile={handleCoverUpload}
              isProcessing={coverProcessing}
              uploadedFile={uploadedCover}
              icon={ImageIcon}
              onRemove={removeCover}
            />
            <UploadZone
              title="Kindle manuscript"
              subtitle="PDF or EPUB"
              helper="Upload your Kindle manuscript file."
              requirement="Required"
              chips={['PDF', 'EPUB']}
              accept=".epub,.pdf"
              onFile={handleKindleUpload}
              isProcessing={kindleProcessing}
              uploadedFile={uploadedManuscript}
              icon={FileText}
              onRemove={removeManuscript}
            />
          </>
        )}
        {isPaperOrHard && (
          <>
            <UploadZone
              title="Cover file"
              subtitle="PDF, PNG, or JPG"
              helper="Upload your full cover spread or cover image."
              requirement="Required"
              chips={['PDF', 'PNG', 'JPG']}
              accept=".pdf,.png,.jpg,.jpeg"
              onFile={handleCoverUpload}
              isProcessing={coverProcessing}
              uploadedFile={uploadedCover}
              icon={ImageIcon}
              onRemove={removeCover}
            />
            <UploadZone
              title="Manuscript file"
              subtitle="PDF only"
              helper="Upload your interior manuscript PDF."
              requirement="Required"
              chips={['PDF']}
              accept=".pdf"
              onFile={handleManuscriptUpload}
              isProcessing={manuscriptProcessing}
              uploadedFile={uploadedManuscript}
              icon={FileText}
              onRemove={removeManuscript}
            />
          </>
        )}
      </div>

      {/* ---- Error ---- */}
      {error && (
        <div className="ds-status-critical flex items-center gap-3 rounded-xl border px-4 py-3">
          <AlertCircle className="h-4 w-4 shrink-0 text-danger" />
          <span className="text-sm">{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ---- Status bar + Continue ---- */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface-glass p-3 shadow-soft backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {anyProcessing ? (
            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" />
          ) : canContinue ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
          ) : detectedConfig && detectedConfig.confidence > 0.3 ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 text-muted-foreground" />
          )}
          <div className="min-w-0">
            <p className={`text-sm font-semibold ${canContinue ? 'text-foreground' : 'text-muted-foreground'}`}>
              {statusMessage}
            </p>
            {detectedConfig && detectedConfig.confidence > 0.3 && (
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {detectedConfig.trimSize ? TRIM_SIZES[detectedConfig.trimSize]?.label : 'Detected settings'}
                {detectedConfig.pageCount ? ` · ${detectedConfig.pageCount} pages` : ''}
                {detectedConfig.bleed ? ` · ${detectedConfig.bleed.replace('-', ' ')}` : ''}
              </p>
            )}
          </div>
        </div>

        <button
          onClick={handleContinue}
          disabled={!canContinue}
          className="flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground shadow-sm shadow-primary/15 transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none sm:min-w-48"
        >
          Continue to Settings
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function TypeSwitcher({ bookType, setBookType }: { bookType: BookType; setBookType: (t: BookType) => void }) {
  const options: { key: BookType; label: string; desc: string; icon: React.ElementType }[] = [
    { key: 'kindle', label: 'Kindle', desc: 'eBook files', icon: Monitor },
    { key: 'paperback', label: 'Paperback', desc: 'Print book', icon: Book },
    { key: 'hardcover', label: 'Hardcover', desc: 'Case laminate', icon: BookMarked },
  ]

  return (
    <div className="grid w-full grid-cols-3 gap-1.5 rounded-[22px] border border-border bg-muted/45 p-1.5 shadow-soft">
      {options.map(({ key, label, desc, icon: Icon }) => {
        const active = bookType === key
        return (
          <button
            key={key}
            onClick={() => setBookType(key)}
            title={desc}
            className={`ds-focus group flex min-w-0 flex-col items-center justify-center gap-1.5 rounded-2xl px-3 py-3 text-center transition-all duration-200 sm:flex-row sm:justify-center sm:gap-3 sm:px-5 ${
              active
                ? 'bg-primary text-primary-foreground shadow-soft'
                : 'bg-surface/70 text-muted-foreground hover:bg-surface-elevated hover:text-foreground'
            }`}
            type="button"
          >
            <span
              className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${active ? 'bg-primary-foreground/15' : 'bg-muted text-primary/75 group-hover:text-primary'}`}
            >
              <Icon className="h-5 w-5" />
            </span>
            <span className="min-w-0 text-center sm:text-left">
              <span className="block truncate text-sm font-extrabold sm:text-base">{label}</span>
              <span
                className={`hidden truncate text-xs font-semibold sm:block ${active ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}
              >
                {desc}
              </span>
            </span>
          </button>
        )
      })}
    </div>
  )
}

interface UploadZoneProps {
  title: string
  subtitle: string
  helper: string
  requirement: string
  chips: string[]
  accept: string
  onFile: (file: File) => void
  onRemove: () => void
  isProcessing: boolean
  uploadedFile?: UploadedFile | null
  icon?: React.ElementType
}

function UploadZone({
  title,
  subtitle,
  helper,
  requirement,
  chips,
  accept,
  onFile,
  onRemove,
  isProcessing,
  uploadedFile,
  icon: ZoneIcon = Upload,
}: UploadZoneProps) {
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragActive(false)
      const file = e.dataTransfer.files[0]
      if (file) onFile(file)
    },
    [onFile]
  )

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }
  const dimensions = formatFileDimensions(uploadedFile)

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setDragActive(true)
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={handleDrop}
      onClick={() => !isProcessing && inputRef.current?.click()}
      className={`group relative flex min-h-[205px] cursor-pointer flex-col overflow-hidden rounded-[22px] border p-4 text-left shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card ${
        isProcessing
          ? 'cursor-wait border-primary/25 bg-primary/4'
          : dragActive
            ? 'scale-[1.01] border-primary/45 bg-primary/8 shadow-card'
            : uploadedFile
              ? 'border-success/25 bg-success/5'
              : 'border-border bg-card hover:border-primary/35 hover:bg-surface-elevated'
      }`}
    >
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-linear-to-r from-transparent via-primary/20 to-transparent" />
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) onFile(f)
        }}
        className="hidden"
      />

      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div
            className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl ${uploadedFile ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'}`}
          >
            {isProcessing ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : uploadedFile ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <ZoneIcon className="h-5 w-5" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-extrabold text-foreground">{title}</h3>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${uploadedFile ? 'bg-success/10 text-success' : 'bg-primary/8 text-primary'}`}
              >
                {uploadedFile ? 'Ready' : requirement}
              </span>
            </div>
            <p className="mt-1 text-xs font-semibold text-muted-foreground">{subtitle}</p>
          </div>
        </div>
      </div>

      <div
        className={`mt-3 grid flex-1 place-items-center rounded-2xl border border-dashed p-4 text-center transition-colors ${
          dragActive
            ? 'border-primary/55 bg-primary/8'
            : uploadedFile
              ? 'border-success/30 bg-surface/80'
              : 'border-border bg-muted/20 group-hover:border-primary/35 group-hover:bg-primary/4'
        }`}
      >
        {isProcessing ? (
          <div>
            <Loader2 className="mx-auto h-7 w-7 animate-spin text-primary" />
            <p className="mt-2 text-sm font-bold text-foreground">Analyzing file...</p>
            <p className="mt-1 text-xs text-muted-foreground">Reading metadata for preview setup.</p>
          </div>
        ) : uploadedFile ? (
          <div className="min-w-0">
            <p className="truncate text-sm font-extrabold text-foreground">{uploadedFile.name}</p>
            <p className="mt-1 text-xs font-semibold text-muted-foreground">
              {[
                uploadedFile.pageCount ? `${uploadedFile.pageCount} pages` : null,
                dimensions,
                formatSize(uploadedFile.size),
              ]
                .filter(Boolean)
                .join(' · ')}
            </p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-bold text-success">Ready</span>
              <span className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold text-muted-foreground">
                Drop another file to replace
              </span>
            </div>
          </div>
        ) : (
          <div>
            <Upload className="mx-auto h-7 w-7 text-primary" />
            <p className="mt-2 text-sm font-extrabold text-foreground">Drop file here or click to browse</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{helper}</p>
            <div className="mt-3 flex flex-wrap justify-center gap-1.5">
              {chips.map((chip) => (
                <span
                  key={chip}
                  className="rounded-md border border-border bg-surface px-2 py-1 text-[10px] font-extrabold text-muted-foreground"
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 flex min-h-8 items-center justify-between gap-3">
        <p className="min-w-0 text-xs leading-relaxed text-muted-foreground">
          {uploadedFile
            ? 'Use this file or replace it before continuing.'
            : 'Max file size depends on KDP processing limits.'}
        </p>
        {uploadedFile && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            className="shrink-0 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs font-semibold text-muted-foreground hover:border-danger/25 hover:bg-danger/5 hover:text-danger"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  )
}

function formatFileDimensions(file?: UploadedFile | null) {
  if (!file?.dimensions) return null
  const { width, height } = file.dimensions
  if (!Number.isFinite(width) || !Number.isFinite(height)) return null
  if (file.type === 'application/pdf' || file.pageCount) {
    const w = width > 40 ? width / 300 : width
    const h = height > 40 ? height / 300 : height
    return `${w.toFixed(3)} × ${h.toFixed(3)} in`
  }
  return `${Math.round(width)} × ${Math.round(height)} px`
}
