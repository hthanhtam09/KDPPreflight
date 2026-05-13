'use client'

import { useAppStore } from '@/store/use-app-store'
import { motion } from 'framer-motion'
import { Check, ChevronRight, CloudOff, HelpCircle, Loader2, RotateCcw, Save, ShieldCheck, Upload } from 'lucide-react'
import type React from 'react'

type Step = {
  key: string | number
  label: string
}

const pillBase = 'inline-flex min-h-[34px] items-center gap-2 rounded-full border px-2.5 py-1.5 text-[11px] font-semibold leading-snug shadow-soft'

export function AppShell({
  children,
  title,
  eyebrow,
  description,
  status,
  action,
  studio = false,
}: {
  children: React.ReactNode
  title: string
  eyebrow: string
  description: string
  status?: string
  action?: React.ReactNode
  studio?: boolean
}) {
  return (
    <PageTransition>
      <div className={studio
        ? 'ws-shell flex h-[calc(100svh-var(--nav-height))] min-h-[560px] flex-col overflow-hidden pb-0 lg:min-h-[720px]'
        : 'ws-shell'
      }>
        <FeatureHeader eyebrow={eyebrow} title={title} description={description} status={status} action={action} studio={studio} />
        {children}
      </div>
    </PageTransition>
  )
}

export function FeatureHeader({
  eyebrow,
  title,
  description,
  status,
  action,
  studio = false,
}: {
  eyebrow: string
  title: string
  description: string
  status?: string
  action?: React.ReactNode
  studio?: boolean
}) {
  return (
    <header className="mx-auto mb-4 flex w-full max-w-7xl shrink-0 items-end justify-between gap-6 max-lg:flex-col max-lg:items-start">
      <div>
        <p className="ds-eyebrow mb-2">{eyebrow}</p>
        <h1 className={`${studio ? 'text-[clamp(26px,3vw,40px)]' : 'text-[clamp(32px,5vw,54px)]'} ds-heading`}>
          {title}
        </h1>
        <span className="ds-body mt-3 block max-w-3xl text-[15px]">{description}</span>
      </div>
      <div className="flex w-full max-w-[470px] flex-wrap justify-end gap-2 max-lg:max-w-full max-lg:justify-start">
        <TrustBadge />
        <SaveStatus label={status} />
        {action}
      </div>
    </header>
  )
}

export function StepProgress({
  steps,
  current,
  onStepClick,
}: {
  steps: Step[]
  current: string | number
  onStepClick?: (step: Step) => void
}) {
  const currentIndex = steps.findIndex((step) => step.key === current)

  return (
    <nav className="flex w-full gap-2 overflow-x-auto pb-1" aria-label="Feature progress">
      {steps.map((step, index) => {
        const active = step.key === current
        const complete = index < currentIndex

        return (
          <button
            key={step.key}
            type="button"
            onClick={() => onStepClick?.(step)}
            className={`ds-focus relative flex min-h-11 min-w-[116px] flex-1 items-center gap-2.5 rounded-xl border px-3 py-2 text-left transition duration-200 sm:min-w-0 ${
              active
                ? 'border-primary/35 bg-primary/10 text-foreground shadow-soft'
                : complete
                  ? 'ds-status-success text-success'
                  : 'ds-control text-muted-foreground hover:-translate-y-px hover:text-foreground'
            }`}
            disabled={!onStepClick}
          >
            <span className={`grid size-6 place-items-center rounded-full text-[11px] font-extrabold ${active ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
              {complete ? <Check className="h-3.5 w-3.5" /> : index + 1}
            </span>
            <strong className="truncate text-xs font-bold">{step.label}</strong>
          </button>
        )
      })}
    </nav>
  )
}

export function WorkspacePanel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <section className={`mx-auto max-w-7xl rounded-panel p-3 ws-panel sm:p-4 ${className}`}>{children}</section>
}

export function UploadDropzone({ title, description, children }: { title: string; description: string; children?: React.ReactNode }) {
  return (
    <div className="ds-card-glass p-6 text-center">
      <Upload className="mx-auto h-5 w-5 text-primary/80" />
      <h3 className="mt-3 text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      {children}
    </div>
  )
}

export function ConfigCard({ children }: { children: React.ReactNode }) {
  return <div className="ds-card-glass p-4">{children}</div>
}

export function SpecCard({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="ds-card p-4">
      <p className="ds-eyebrow text-[10px]">{label}</p>
      <strong className="mt-2 block text-lg font-semibold text-foreground">{value}</strong>
      {note && <span className="mt-1 block text-xs text-muted-foreground">{note}</span>}
    </div>
  )
}

export function IssueCard({ severity = 'warning', title, children }: { severity?: 'critical' | 'warning' | 'ok'; title: string; children: React.ReactNode }) {
  return (
    <article className={`ds-card p-4 ${severity === 'critical' ? 'ds-status-critical' : severity === 'warning' ? 'ds-status-warning' : 'ds-status-success'}`}>
      <p className="text-xs uppercase tracking-[0.18em] opacity-75">{severity}</p>
      <h3 className="mt-2 text-base font-semibold text-foreground">{title}</h3>
      {children}
    </article>
  )
}

export function PreviewCanvas({ children }: { children: React.ReactNode }) {
  return <div className="ds-card overflow-hidden">{children}</div>
}

export function ThumbnailRail({ children }: { children: React.ReactNode }) {
  return <aside className="ds-card overflow-hidden">{children}</aside>
}

export function ToolbarButton({ children, active = false, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      {...props}
      className={`ds-focus ds-control rounded-[11px] px-3 py-2 text-sm ${active ? 'border-primary/35 bg-primary/10 text-foreground' : ''} ${props.className ?? ''}`}
    >
      {children}
    </button>
  )
}

export function SegmentedControl({ options, value, onChange }: { options: { value: string; label: string }[]; value: string; onChange: (value: string) => void }) {
  return (
    <div className="inline-flex rounded-2xl border border-border bg-secondary/70 p-1 shadow-soft">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${option.value === value ? 'bg-primary text-primary-foreground shadow-soft' : 'text-muted-foreground hover:bg-surface-elevated hover:text-foreground'}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export function TrustBadge({ variant = 'compact' }: { variant?: 'compact' | 'full' }) {
  const label = 'Files are processed locally in your browser. We do not store your manuscript or cover.'
  const isFull = variant === 'full'

  return (
    <div
      className={`${pillBase} ds-status-success max-w-full ${isFull ? 'max-w-xl justify-center whitespace-normal' : ''}`}
      title={label}
      aria-label={label}
    >
      <CloudOff className="h-3.5 w-3.5 shrink-0" />
      <span className={isFull ? 'min-w-0 whitespace-normal break-words' : 'truncate'}>
        {isFull ? label : 'Local processing · no file storage'}
      </span>
    </div>
  )
}

export function HelpPopover({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 text-primary/80">
      <HelpCircle className="h-3.5 w-3.5" />
      <span>{children}</span>
    </span>
  )
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="ds-card p-8 text-center">
      <ShieldCheck className="mx-auto h-5 w-5 text-success" />
      <h3 className="mt-3 text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

export function FeatureFAQ({ title = 'Common publishing questions', items }: { title?: string; items: { question: string; answer: string }[] }) {
  return (
    <section className="ds-card-elevated mx-auto mt-5 max-w-7xl p-5" aria-labelledby="feature-faq-title">
      <h2 id="feature-faq-title" className="mb-4 text-lg font-bold tracking-[-0.02em] text-foreground/90">{title}</h2>
      <div className="grid gap-3 md:grid-cols-3">
        {items.map((item) => (
          <article key={item.question} className="ds-card p-4">
            <h3 className="text-sm font-bold leading-snug text-foreground/90">{item.question}</h3>
            <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{item.answer}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export function SaveStatus({ label }: { label?: string }) {
  const { saveStatus, hasRestoredSession } = useAppStore()
  const statusLabel =
    label ??
    (saveStatus === 'saving'
      ? 'Saving...'
      : saveStatus === 'saved'
        ? 'Saved locally'
        : hasRestoredSession
          ? 'Restore session available'
          : 'Local session ready')

  return (
    <div className={`${pillBase} max-w-full border-primary/20 bg-primary/10 text-primary`}>
      {saveStatus === 'saving' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
      <span className="truncate">{statusLabel}</span>
    </div>
  )
}

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.32, ease: 'easeOut' }}>
      {children}
    </motion.div>
  )
}

export function RestoreSessionNotice() {
  const { hasRestoredSession, setHasRestoredSession } = useAppStore()
  if (!hasRestoredSession) return null

  return (
    <motion.div
      className="ds-card-glass mx-auto mb-3 flex max-w-7xl items-center gap-2.5 px-3.5 py-3 text-[13px] text-foreground/80"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <RotateCcw className="h-4 w-4" />
      <span>Restore session available from this browser.</span>
      <button type="button" onClick={() => setHasRestoredSession(false)} className="ml-auto inline-flex items-center gap-1 text-xs font-bold text-primary">
        Dismiss <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  )
}
