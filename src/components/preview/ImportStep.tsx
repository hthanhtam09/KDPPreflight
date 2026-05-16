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

  return (
    <div className="flex flex-col gap-4">
      {/* ---- Type switcher + trust badge ---- */}
      <div className="flex items-center justify-between gap-4">
        <TypeSwitcher bookType={bookType} setBookType={handleBookTypeChange} />
      </div>

      {/* ---- Upload zones ---- */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {!isPaperOrHard && (
          <>
            <UploadZone
              label="Kindle File (EPUB or PDF)"
              accept=".epub,.pdf"
              onFile={handleKindleUpload}
              isProcessing={kindleProcessing}
              uploadedFile={uploadedManuscript}
              icon={FileText}
            />
            <UploadZone
              label="Cover — PNG, JPG, or PDF"
              accept=".png,.jpg,.jpeg,.pdf"
              onFile={handleCoverUpload}
              isProcessing={coverProcessing}
              uploadedFile={uploadedCover}
              icon={ImageIcon}
            />
          </>
        )}
        {isPaperOrHard && (
          <>
            <UploadZone
              label="Cover — PDF, PNG, or JPG"
              accept=".pdf,.png,.jpg,.jpeg"
              onFile={handleCoverUpload}
              isProcessing={coverProcessing}
              uploadedFile={uploadedCover}
              icon={ImageIcon}
            />
            <UploadZone
              label="Manuscript — PDF only"
              accept=".pdf"
              onFile={handleManuscriptUpload}
              isProcessing={manuscriptProcessing}
              uploadedFile={uploadedManuscript}
              icon={FileText}
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
      <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-surface-glass px-4 py-3 backdrop-blur-sm">
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          {anyProcessing ? (
            <>
              <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-primary" />
              <span className="truncate text-xs text-muted-foreground">Processing file…</span>
            </>
          ) : detectedConfig && detectedConfig.confidence > 0.3 ? (
            <span className="truncate text-xs text-muted-foreground">
              {detectedConfig.trimSize ? TRIM_SIZES[detectedConfig.trimSize]?.label : '—'}
              {detectedConfig.pageCount ? ` · ${detectedConfig.pageCount} pages` : ''}
              {detectedConfig.bleed ? ` · ${detectedConfig.bleed.replace('-', ' ')}` : ''}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">
              {isPaperOrHard ? 'Upload cover and manuscript to continue' : 'Upload your Kindle file to continue'}
            </span>
          )}
        </div>

        <button
          onClick={handleContinue}
          disabled={!canContinue}
          className="flex shrink-0 items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40"
        >
          Continue
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
  const options: { key: BookType; label: string; icon: React.ElementType }[] = [
    { key: 'kindle', label: 'Kindle', icon: Monitor },
    { key: 'paperback', label: 'Paperback', icon: Book },
    { key: 'hardcover', label: 'Hardcover', icon: BookMarked },
  ]

  return (
    <div className="grid w-full grid-cols-3 gap-1 rounded-xl border border-border bg-secondary/70 p-1 shadow-soft sm:inline-grid sm:w-auto">
      {options.map(({ key, label, icon: Icon }) => {
        const active = bookType === key
        return (
          <button
            key={key}
            onClick={() => setBookType(key)}
            className={`ds-focus flex min-w-0 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold transition-all duration-200 sm:gap-2 sm:px-4 sm:text-sm ${
              active
                ? 'bg-primary text-primary-foreground shadow-soft'
                : 'text-muted-foreground hover:bg-surface-elevated hover:text-foreground'
            }`}
            type="button"
          >
            <Icon className="w-4 h-4" />
            <span className="truncate">{label}</span>
          </button>
        )
      })}
    </div>
  )
}

interface UploadZoneProps {
  label: string
  accept: string
  onFile: (file: File) => void
  isProcessing: boolean
  uploadedFile?: UploadedFile | null
  icon?: React.ElementType
}

function UploadZone({ label, accept, onFile, isProcessing, uploadedFile, icon: ZoneIcon = Upload }: UploadZoneProps) {
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

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setDragActive(true)
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={handleDrop}
      onClick={() => !isProcessing && inputRef.current?.click()}
      className={`relative flex min-h-44 cursor-pointer flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border p-5 text-center shadow-soft transition-all duration-300 sm:min-h-48 sm:p-8 ${
        isProcessing
          ? 'cursor-wait border-primary/25 bg-primary/4'
          : dragActive
            ? 'scale-[1.01] border-primary/45 bg-primary/8 shadow-card'
            : uploadedFile
              ? 'border-primary/25 bg-primary/4'
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

      {isProcessing ? (
        <>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
          <p className="text-sm font-medium text-foreground">Analyzing file…</p>
        </>
      ) : uploadedFile ? (
        <>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <CheckCircle2 className="h-6 w-6 text-primary" />
          </div>
          <div className="min-w-0 max-w-full">
            <p className="truncate text-sm font-semibold text-primary">{uploadedFile.name}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {formatSize(uploadedFile.size)}
              {uploadedFile.pageCount ? ` · ${uploadedFile.pageCount} pages` : ''}
            </p>
          </div>
          <p className="mt-1 text-[11px] font-medium text-muted-foreground">Click or drop to replace</p>
        </>
      ) : (
        <>
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-colors duration-300 ${
              dragActive ? 'bg-primary/10' : 'bg-secondary'
            }`}
          >
            <ZoneIcon
              className={`h-7 w-7 transition-colors duration-300 ${dragActive ? 'text-primary' : 'text-primary/70'}`}
            />
          </div>
          <p className="text-sm font-semibold text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">Drop file here or click to browse</p>
        </>
      )}
    </div>
  )
}
