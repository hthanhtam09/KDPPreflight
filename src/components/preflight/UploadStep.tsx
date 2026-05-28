'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Book, BookOpen, Tablet, Upload, X, FileText, ImageIcon,
  ArrowRight, RotateCcw, CheckCircle2, Zap, Circle,
} from 'lucide-react'
import type { BookType } from '@/types/kdp'
import type { KRResult } from './types'

interface Files { cover: File | null; manuscript: File | null }

const EASE = [0.22, 1, 0.36, 1] as const

// ── Drop zone ─────────────────────────────────────────────────────────────────

function DropZone({
  label, hint, icon, accept, file, onFile, onClear,
}: {
  readonly label: string; readonly hint: string; readonly icon: React.ReactNode
  readonly accept: string; readonly file: File | null
  readonly onFile: (f: File) => void; readonly onClear: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    const f = e.dataTransfer.files[0]; if (f) onFile(f)
  }, [onFile])
  const fmt = (b: number) => b < 1048576 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1048576).toFixed(1)} MB`

  return (
    <div
      role="button" tabIndex={0} aria-label={`Upload ${label}`}
      className={[
        'relative cursor-pointer rounded-xl border-2 border-dashed transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[#df8e51]/40',
        dragging ? 'border-[#df8e51] bg-[#df8e51]/5'
          : file ? 'border-[#059669]/40 bg-[#059669]/3'
            : 'border-black/10 bg-white hover:border-[#df8e51]/50',
      ].join(' ')}
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => { if (!file) inputRef.current?.click() }}
      onKeyDown={e => { if (e.key === 'Enter' && !file) inputRef.current?.click() }}
    >
      <input ref={inputRef} type="file" accept={accept} className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f) }} />
      <div className="flex min-h-28 flex-col items-center justify-center gap-2 px-4 py-5">
        {file ? (
          <>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#059669]/10 text-[#059669]">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div className="text-center">
              <p className="max-w-40 truncate text-sm font-semibold text-[#0f172a]">{file.name}</p>
              <p className="mt-0.5 text-xs text-black/40">{fmt(file.size)}</p>
            </div>
            <button type="button" onClick={e => { e.stopPropagation(); onClear() }}
              className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-black/35 hover:bg-black/5 hover:text-black/55">
              <X className="h-3 w-3" /> Remove
            </button>
          </>
        ) : (
          <>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/5 text-black/35">
              {icon}
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-[#0f172a]">{label}</p>
              <p className="mt-0.5 text-xs text-black/35">{hint}</p>
            </div>
            <span className="flex items-center gap-1 rounded-lg border border-black/8 bg-white px-2.5 py-1 text-xs font-medium text-black/45">
              <Upload className="h-3 w-3" /> Choose file
            </span>
          </>
        )}
      </div>
    </div>
  )
}

// ── Book type cards ───────────────────────────────────────────────────────────

const BOOK_TYPES: { type: BookType; icon: React.ReactNode; title: string; desc: string }[] = [
  { type: 'kindle', icon: <Tablet className="h-5 w-5" />, title: 'Kindle', desc: 'EPUB or PDF for e-readers' },
  { type: 'paperback', icon: <BookOpen className="h-5 w-5" />, title: 'Paperback', desc: 'Print-on-demand soft cover' },
  { type: 'hardcover', icon: <Book className="h-5 w-5" />, title: 'Hardcover', desc: 'Premium case-bound edition' },
]

function BookTypeCards({
  selected, onSelect, compact = false,
}: {
  readonly selected: BookType | null
  readonly onSelect: (t: BookType) => void
  readonly compact?: boolean
}) {
  return (
    <div className={compact ? 'flex flex-col gap-2' : 'grid grid-cols-3 gap-3'}>
      {BOOK_TYPES.map(({ type, icon, title, desc }) => {
        const active = selected === type
        return (
          <button key={type} type="button" onClick={() => onSelect(type)}
            className={[
              'group flex items-center gap-3 rounded-xl border transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#df8e51]/40',
              compact ? 'px-3 py-2.5' : 'flex-col justify-center px-3 py-4 text-center',
              active ? 'border-[#df8e51] bg-[#df8e51]/6 ring-1 ring-[#df8e51]/20' : 'border-black/8 bg-white hover:border-[#df8e51]/40 hover:bg-[#df8e51]/2',
            ].join(' ')}
          >
            <div className={[
              'flex shrink-0 items-center justify-center rounded-lg transition-colors',
              compact ? 'h-8 w-8' : 'h-10 w-10',
              active ? 'bg-[#df8e51]/15 text-[#df8e51]' : 'bg-black/5 text-black/40 group-hover:text-[#df8e51]',
            ].join(' ')}>
              {icon}
            </div>
            <div className={compact ? 'min-w-0 flex-1 text-left' : ''}>
              <p className={`text-sm font-semibold leading-tight ${active ? 'text-[#0f172a]' : 'text-black/60'}`}>{title}</p>
              {compact
                ? active && <p className="mt-0.5 truncate text-xs text-black/40">{desc}</p>
                : <p className="mt-0.5 text-xs text-black/35">{desc}</p>
              }
            </div>
            {compact && active && (
              <div className="ml-auto h-2 w-2 shrink-0 rounded-full bg-[#df8e51]" />
            )}
          </button>
        )
      })}
    </div>
  )
}

// ── Files panel ───────────────────────────────────────────────────────────────

function FilesPanel({
  bookType, files, onFile, onClear,
}: {
  readonly bookType: BookType; readonly files: Files
  readonly onFile: (k: keyof Files, f: File) => void
  readonly onClear: (k: keyof Files) => void
}) {
  return (
    <div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-black/35">
        {bookType === 'kindle' ? 'Your file' : 'Your files'}
      </p>
      {bookType === 'kindle' ? (
        <DropZone label="Kindle file" hint="PDF or EPUB · up to 650 MB"
          icon={<Upload className="h-4 w-4" />}
          accept=".pdf,.epub,application/pdf,application/epub+zip"
          file={files.manuscript} onFile={f => onFile('manuscript', f)} onClear={() => onClear('manuscript')} />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <DropZone label="Cover spread" hint="PDF · full wrap"
            icon={<ImageIcon className="h-4 w-4" />} accept=".pdf,application/pdf"
            file={files.cover} onFile={f => onFile('cover', f)} onClear={() => onClear('cover')} />
          <DropZone label="Manuscript" hint="PDF · interior"
            icon={<FileText className="h-4 w-4" />} accept=".pdf,application/pdf"
            file={files.manuscript} onFile={f => onFile('manuscript', f)} onClear={() => onClear('manuscript')} />
        </div>
      )}
      <p className="mt-3 text-center text-[11px] text-black/28">
        Processed locally in your browser — nothing is uploaded to servers.
      </p>
    </div>
  )
}

// ── Files compact (right column) ──────────────────────────────────────────────

function FilesCompact({
  bookType, files, onClear,
}: {
  readonly bookType: BookType; readonly files: Files
  readonly onClear: (k: keyof Files) => void
}) {
  const fmt = (b: number) => b < 1048576 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1048576).toFixed(1)} MB`
  const items: { key: keyof Files; label: string; file: File | null }[] =
    bookType === 'kindle'
      ? [{ key: 'manuscript', label: 'Kindle file', file: files.manuscript }]
      : [
        { key: 'cover', label: 'Cover spread', file: files.cover },
        { key: 'manuscript', label: 'Manuscript', file: files.manuscript },
      ]
  return (
    <div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-black/35">Your files</p>
      <div className="flex flex-col gap-2">
        {items.map(({ key, label, file }) => (
          <div key={key} className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${file ? 'border-[#059669]/25 bg-[#059669]/5' : 'border-black/8 bg-white/60'}`}>
            <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${file ? 'bg-[#059669]/12 text-[#059669]' : 'bg-black/5 text-black/25'}`}>
              {file ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold text-black/35">{label}</p>
              {file
                ? <p className="truncate text-xs font-medium text-[#0f172a]">{file.name}</p>
                : <p className="text-xs text-black/25">Not uploaded</p>
              }
              {file && <p className="text-[11px] text-black/30">{fmt(file.size)}</p>}
            </div>
            {file && (
              <button type="button" onClick={() => onClear(key)}
                className="shrink-0 rounded-lg p-1 text-black/25 hover:bg-black/5 hover:text-black/50">
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Phase dots ────────────────────────────────────────────────────────────────

function PhaseDots({ phase }: { readonly phase: 0 | 1 | 2 }) {
  const steps = ['Book type', 'Upload files', 'Start']
  return (
    <div className="flex items-center gap-2">
      {steps.map((label, i) => (
        <div key={label} className="flex items-center gap-2">
          <div className={`flex h-5 items-center gap-1.5 rounded-full transition-all duration-300 ${i === phase ? 'px-2.5 bg-[#df8e51]/15' : ''}`}>
            <div className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${i < phase ? 'bg-[#059669]' : i === phase ? 'bg-[#df8e51]' : 'bg-black/18'}`} />
            {i === phase && (
              <span className="text-[11px] font-semibold text-[#df8e51]">{label}</span>
            )}
          </div>
          {i < steps.length - 1 && (
            <div className={`h-px w-4 transition-colors duration-300 ${i < phase ? 'bg-[#059669]/40' : 'bg-black/10'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

interface UploadStepProps {
  readonly bookType: BookType | null
  readonly files: Files
  readonly previousResult: KRResult | null
  readonly onStart: (bookType: BookType, files: Files) => void
}

export default function UploadStep({ bookType, files, previousResult, onStart }: UploadStepProps) {
  const [localType, setLocalType] = useState<BookType | null>(bookType)
  const [localFiles, setLocalFiles] = useState<Files>(files)

  useEffect(() => {
    if (!bookType) return
    let cancelled = false
    queueMicrotask(() => { if (!cancelled) setLocalType(bookType) })
    return () => { cancelled = true }
  }, [bookType])

  useEffect(() => {
    let cancelled = false
    queueMicrotask(() => { if (!cancelled) setLocalFiles(files) })
    return () => { cancelled = true }
  }, [files])

  const requiresBothFiles = localType === 'paperback' || localType === 'hardcover'
  const canStart = localType !== null &&
    localFiles.manuscript !== null &&
    (localType === 'kindle' || localFiles.cover !== null)

  const setFile = (key: keyof Files) => (f: File | null) => setLocalFiles(p => ({ ...p, [key]: f }))

  const phase: 0 | 1 | 2 = localType === null ? 0 : canStart ? 2 : 1

  const handleSelectType = (t: BookType) => {
    setLocalType(t)
    setLocalFiles({ cover: null, manuscript: null })
  }

  return (
    <div className="space-y-6">
      {/* ── Workflow Phase indicator ── */}
      <div className="flex flex-col gap-4 items-center pb-5">
        <div className="flex items-center gap-2">
          {previousResult ? (
            <div className="flex items-center gap-2 rounded-xl bg-orange-500/10 border border-orange-500/25 px-4 py-2 text-sm font-semibold text-orange-600 dark:text-orange-400">
              <RotateCcw className="h-4 w-4 animate-pulse" />
              <span>Re-uploading to recheck · Previous score: {previousResult.score}/100</span>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground font-medium">
              Files are processed 100% locally in your browser. No files are stored or uploaded.
            </p>
          )}
        </div>
        <PhaseDots phase={phase} />
      </div>

      {/* ── 3-panel layout ── */}
      <div className="grid w-full grid-cols-1 md:grid-cols-[220px_1fr_220px] items-start gap-6">

        {/* LEFT: Book type compact (phases 1 + 2) */}
        <div className="min-h-px">
          <AnimatePresence>
            {phase >= 1 && (
              <motion.div
                key="bt-left"
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.3, ease: EASE }}
              >
                <div className="rounded-2xl border border-border bg-surface p-4 shadow-soft">
                  <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Book type</p>
                  <BookTypeCards compact selected={localType} onSelect={handleSelectType} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* CENTER: main active area */}
        <div>
          <AnimatePresence mode="wait">

            {/* Phase 0: Book type selection (full grid) */}
            {phase === 0 && (
              <motion.div key="p0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14, transition: { duration: 0.2 } }}
                transition={{ duration: 0.32, ease: EASE }}
              >
                <div className="mb-5 text-center">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Step 1</p>
                  <p className="mt-1 text-lg font-bold text-foreground">Select your book type</p>
                </div>
                <BookTypeCards selected={localType} onSelect={handleSelectType} />
              </motion.div>
            )}

            {/* Phase 1: Upload files */}
            {phase === 1 && (
              <motion.div key="p1"
                initial={{ opacity: 0, x: 32 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24, transition: { duration: 0.2 } }}
                transition={{ duration: 0.32, ease: EASE }}
              >
                <div className="mb-5">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Step 2</p>
                  <p className="mt-1 text-lg font-bold text-foreground">Upload your files</p>
                </div>
                <FilesPanel
                  bookType={localType!}
                  files={localFiles}
                  onFile={(k, f) => setFile(k)(f)}
                  onClear={k => setFile(k)(null)}
                />
              </motion.div>
            )}

            {/* Phase 2: Ready to start */}
            {phase === 2 && (
              <motion.div key="p2"
                initial={{ opacity: 0, scale: 0.97, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                transition={{ duration: 0.32, ease: EASE }}
                className="flex flex-col items-center py-4 text-center"
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-success/10 text-success">
                  <Zap className="h-7 w-7" />
                </div>
                <p className="text-xs font-semibold uppercase tracking-widest text-success/70">Step 3 — Ready</p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
                  Ready to analyze
                </h2>
                <p className="mt-2 max-w-xs text-sm text-muted-foreground">
                  Your {localType} {requiresBothFiles ? 'files are' : 'file is'} loaded.
                  We'll scan every page for KDP issues.
                </p>

                <button
                  type="button"
                  onClick={() => onStart(localType!, localFiles)}
                  className="group mt-7 flex items-center gap-2.5 rounded-2xl bg-primary px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary-hover active:scale-[0.98]"
                >
                  {previousResult ? 'Recheck my files' : 'Start analysis'}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </button>

                <button
                  type="button"
                  onClick={() => setLocalFiles({ cover: null, manuscript: null })}
                  className="mt-3 text-xs text-muted-foreground hover:text-foreground"
                >
                  Change files
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* RIGHT: Uploaded files summary (phase 2) */}
        <div className="min-h-px">
          <AnimatePresence>
            {phase === 2 && (
              <motion.div
                key="files-right"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 24 }}
                transition={{ duration: 0.3, ease: EASE }}
              >
                <div className="rounded-2xl border border-border bg-surface p-4 shadow-soft">
                  <FilesCompact
                    bookType={localType!}
                    files={localFiles}
                    onClear={k => setFile(k)(null)}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  )
}
