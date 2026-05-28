'use client'

import type { BookType } from '@/types/kdp'
import { ArrowRight, Book, BookMarked, CheckCircle2, Circle, FileText, ImageIcon, Monitor, Upload } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { KRResult } from './types'

interface Files {
  cover: File | null
  manuscript: File | null
}

const BOOK_TYPES: { type: BookType; icon: React.ReactNode; title: string; desc: string }[] = [
  { type: 'kindle', icon: <Monitor className="h-5 w-5" />, title: 'Kindle', desc: 'eBook files' },
  { type: 'paperback', icon: <Book className="h-5 w-5" />, title: 'Paperback', desc: 'Print book' },
  { type: 'hardcover', icon: <BookMarked className="h-5 w-5" />, title: 'Hardcover', desc: 'Case laminate' },
]

interface UploadStepProps {
  readonly bookType: BookType | null
  readonly files: Files
  readonly previousResult: KRResult | null
  readonly onStart: (bookType: BookType, files: Files) => void
}

export default function UploadStep({ bookType, files, previousResult, onStart }: UploadStepProps) {
  const [localType, setLocalType] = useState<BookType | null>(bookType ?? 'paperback')
  const [localFiles, setLocalFiles] = useState<Files>(files)

  useEffect(() => {
    if (!bookType) return
    let cancelled = false
    queueMicrotask(() => {
      if (!cancelled) setLocalType(bookType)
    })
    return () => {
      cancelled = true
    }
  }, [bookType])

  useEffect(() => {
    let cancelled = false
    queueMicrotask(() => {
      if (!cancelled) setLocalFiles(files)
    })
    return () => {
      cancelled = true
    }
  }, [files])

  const requiresBothFiles = localType === 'paperback' || localType === 'hardcover'
  const canStart = localType !== null && localFiles.manuscript !== null && (localType === 'kindle' || localFiles.cover !== null)

  const setFile = (key: keyof Files) => (file: File | null) => setLocalFiles((prev) => ({ ...prev, [key]: file }))

  const clearFilesForNewImport = () => {
    setLocalFiles({ cover: null, manuscript: null })
  }

  const handleSelectType = (type: BookType) => {
    setLocalType(type)
    clearFilesForNewImport()
  }

  const statusMessage =
    localType === null
      ? 'Select a book type to continue.'
      : canStart
        ? previousResult
          ? 'Files ready. Re-run Preflight.'
          : 'Files ready. Start Preflight.'
        : localFiles.cover && !localFiles.manuscript
          ? 'Manuscript required to continue.'
          : localFiles.manuscript && requiresBothFiles && !localFiles.cover
            ? 'Cover required to continue.'
            : requiresBothFiles
              ? 'Upload cover and manuscript to continue.'
              : 'Upload your Kindle file to continue.'

  return (
    <div className="app-card flex flex-col gap-4 p-4">
      <div className="mx-auto w-full max-w-[760px]">
        <BookTypeTabs selected={localType} onSelect={handleSelectType} />
      </div>

      <FileUploadGrid
        bookType={localType ?? 'paperback'}
        files={localFiles}
        disabled={!localType}
        onFile={(key, file) => setFile(key)(file)}
        onClear={(key) => setFile(key)(null)}
      />

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface-glass p-3 shadow-soft backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {canStart ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
          ) : (
            <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
          )}
          <div className="min-w-0">
            <p className={`text-sm font-semibold ${canStart ? 'text-foreground' : 'text-muted-foreground'}`}>
              {statusMessage}
            </p>
            {previousResult && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                Previous score: {previousResult.score}/100
              </p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
          {canStart && (
            <button
              type="button"
              onClick={clearFilesForNewImport}
              className="min-h-10 rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-muted-foreground hover:bg-muted/40 hover:text-foreground"
            >
              Change files
            </button>
          )}
          <button
            type="button"
            onClick={() => localType && onStart(localType, localFiles)}
            disabled={!canStart || !localType}
            className="group flex min-h-10 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground shadow-sm shadow-primary/15 transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none sm:min-w-44"
          >
            {previousResult ? 'Re-run Preflight' : 'Start Preflight'}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

function BookTypeTabs({
  selected,
  onSelect,
}: {
  readonly selected: BookType | null
  readonly onSelect: (type: BookType) => void
}) {
  return (
    <div className="grid w-full grid-cols-3 gap-1.5 rounded-[22px] border border-border bg-muted/45 p-1.5 shadow-soft">
      {BOOK_TYPES.map(({ type, icon, title, desc }) => {
        const active = selected === type
        return (
          <button
            key={type}
            type="button"
            title={desc}
            onClick={() => onSelect(type)}
            className={`ds-focus group flex min-w-0 flex-col items-center justify-center gap-1.5 rounded-2xl px-3 py-3 text-center transition-all duration-200 sm:flex-row sm:justify-center sm:gap-3 sm:px-5 ${
              active
                ? 'bg-primary text-primary-foreground shadow-soft'
                : 'bg-surface/70 text-muted-foreground hover:bg-surface-elevated hover:text-foreground'
            }`}
          >
            <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${active ? 'bg-primary-foreground/15' : 'bg-muted text-primary/75 group-hover:text-primary'}`}>
              {icon}
            </span>
            <span className="min-w-0 text-center sm:text-left">
              <span className="block truncate text-sm font-extrabold sm:text-base">{title}</span>
              <span className={`hidden truncate text-xs font-semibold sm:block ${active ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                {desc}
              </span>
            </span>
          </button>
        )
      })}
    </div>
  )
}

function FileUploadGrid({
  bookType,
  files,
  disabled,
  onFile,
  onClear,
}: {
  readonly bookType: BookType
  readonly files: Files
  readonly disabled: boolean
  readonly onFile: (key: keyof Files, file: File) => void
  readonly onClear: (key: keyof Files) => void
}) {
  if (bookType === 'kindle') {
    return (
      <div className={disabled ? 'pointer-events-none opacity-70' : ''}>
        <UploadCard
          title="Kindle file"
          subtitle="PDF or EPUB"
          helper="Upload your Kindle file for Preflight."
          chips={['PDF', 'EPUB']}
          icon={<FileText className="h-5 w-5" />}
          accept=".pdf,.epub,application/pdf,application/epub+zip"
          file={files.manuscript}
          disabled={disabled}
          onFile={(file) => onFile('manuscript', file)}
          onClear={() => onClear('manuscript')}
        />
      </div>
    )
  }

  return (
    <div className={`grid grid-cols-1 gap-4 lg:grid-cols-2 ${disabled ? 'pointer-events-none opacity-70' : ''}`}>
      <UploadCard
        title="Cover file"
        subtitle="PDF"
        helper="Upload your full cover spread PDF."
        chips={['PDF']}
        icon={<ImageIcon className="h-5 w-5" />}
        accept=".pdf,application/pdf"
        file={files.cover}
        disabled={disabled}
        onFile={(file) => onFile('cover', file)}
        onClear={() => onClear('cover')}
      />
      <UploadCard
        title="Manuscript file"
        subtitle="PDF only"
        helper="Upload your interior manuscript PDF."
        chips={['PDF']}
        icon={<FileText className="h-5 w-5" />}
        accept=".pdf,application/pdf"
        file={files.manuscript}
        disabled={disabled}
        onFile={(file) => onFile('manuscript', file)}
        onClear={() => onClear('manuscript')}
      />
    </div>
  )
}

function UploadCard({
  title,
  subtitle,
  helper,
  chips,
  icon,
  accept,
  file,
  disabled,
  onFile,
  onClear,
}: {
  readonly title: string
  readonly subtitle: string
  readonly helper: string
  readonly chips: string[]
  readonly icon: React.ReactNode
  readonly accept: string
  readonly file: File | null
  readonly disabled: boolean
  readonly onFile: (file: File) => void
  readonly onClear: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)

  useEffect(() => {
    if (!file && inputRef.current) {
      inputRef.current.value = ''
    }
  }, [file])

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      setDragActive(false)
      const dropped = event.dataTransfer.files[0]
      if (dropped) onFile(dropped)
    },
    [onFile]
  )

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Upload ${title}`}
      onDragOver={(event) => {
        event.preventDefault()
        if (!disabled) setDragActive(true)
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={disabled ? undefined : handleDrop}
      onClick={() => {
        if (!disabled && inputRef.current) {
          inputRef.current.value = ''
          inputRef.current.click()
        }
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter' && !disabled && inputRef.current) {
          inputRef.current.value = ''
          inputRef.current.click()
        }
      }}
      className={`group relative flex min-h-[205px] cursor-pointer flex-col overflow-hidden rounded-[22px] border p-4 text-left shadow-soft transition-all duration-300 outline-none hover:-translate-y-0.5 hover:shadow-card focus-visible:ring-2 focus-visible:ring-primary/40 ${
        disabled
          ? 'cursor-not-allowed border-border bg-card/60'
          : dragActive
            ? 'scale-[1.01] border-primary/45 bg-primary/8 shadow-card'
            : file
              ? 'border-success/25 bg-success/5'
              : 'border-border bg-card hover:border-primary/35 hover:bg-surface-elevated'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(event) => {
          const selected = event.target.files?.[0]
          if (selected) onFile(selected)
          event.currentTarget.value = ''
        }}
      />

      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl ${file ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'}`}>
            {file ? <CheckCircle2 className="h-5 w-5" /> : icon}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-extrabold text-foreground">{title}</h3>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${file ? 'bg-success/10 text-success' : 'bg-primary/8 text-primary'}`}>
                {file ? 'Ready' : 'Required'}
              </span>
            </div>
            <p className="mt-1 text-xs font-semibold text-muted-foreground">{subtitle}</p>
          </div>
        </div>
      </div>

      <div className={`mt-3 grid flex-1 place-items-center rounded-2xl border border-dashed p-4 text-center transition-colors ${
        dragActive
          ? 'border-primary/55 bg-primary/8'
          : file
            ? 'border-success/30 bg-surface/80'
            : 'border-border bg-muted/20 group-hover:border-primary/35 group-hover:bg-primary/4'
      }`}>
        {file ? (
          <div className="min-w-0">
            <p className="truncate text-sm font-extrabold text-foreground">{file.name}</p>
            <p className="mt-1 text-xs font-semibold text-muted-foreground">{formatSize(file.size)}</p>
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
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{disabled ? 'Select a book type first.' : helper}</p>
            <div className="mt-3 flex flex-wrap justify-center gap-1.5">
              {chips.map((chip) => (
                <span key={chip} className="rounded-md border border-border bg-surface px-2 py-1 text-[10px] font-extrabold text-muted-foreground">
                  {chip}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 flex min-h-8 items-center justify-between gap-3">
        <p className="min-w-0 text-xs leading-relaxed text-muted-foreground">
          {file ? 'Use this file or replace it before continuing.' : 'Max file size depends on KDP processing limits.'}
        </p>
        {file && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              if (inputRef.current) inputRef.current.value = ''
              onClear()
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

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
