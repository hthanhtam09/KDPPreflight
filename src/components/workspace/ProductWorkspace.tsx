'use client'

import { useAppStore } from '@/store/use-app-store'
import { motion } from 'framer-motion'
import { Check, ChevronRight, CloudOff, HelpCircle, Loader2, RotateCcw, Save, ShieldCheck, Upload } from 'lucide-react'
import type React from 'react'

type Step = {
  key: string | number
  label: string
}

const shellBase = 'min-h-[calc(100vh-56px)] bg-[radial-gradient(circle_at_88%_10%,rgba(45,212,191,0.09),transparent_26%),linear-gradient(90deg,rgba(215,198,161,0.045)_1px,transparent_1px),linear-gradient(0deg,rgba(215,198,161,0.035)_1px,transparent_1px),linear-gradient(180deg,rgba(15,17,20,0.96),#07090d_46%)] bg-[length:auto,72px_72px,72px_72px,auto] p-6'
const pillBase = 'inline-flex min-h-[34px] items-center gap-2 rounded-full border px-2.5 py-1.5 text-[11px] font-semibold leading-snug'
const panelBase = 'border border-[#f4efe5]/10 bg-[#080a0d]/80 shadow-[0_28px_90px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(244,239,229,0.07)] backdrop-blur-[18px]'

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
      <div className={studio ? `${shellBase} flex h-[calc(100vh-56px)] min-h-[720px] flex-col overflow-hidden pb-0` : shellBase}>
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
        <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.22em] text-[#d7c6a1]/75">{eyebrow}</p>
        <h1 className={`${studio ? 'text-[clamp(26px,3vw,40px)]' : 'text-[clamp(32px,5vw,54px)]'} font-semibold leading-[1.02] tracking-[-0.045em] text-[#f7f1e7]`}>
          {title}
        </h1>
        <span className="mt-3 block max-w-3xl text-[15px] leading-relaxed text-[#d8d0c3]/75">{description}</span>
      </div>
      <div className="flex max-w-[470px] flex-wrap justify-end gap-2">
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
    <nav className="flex w-full gap-2" aria-label="Feature progress">
      {steps.map((step, index) => {
        const active = step.key === current
        const complete = index < currentIndex

        return (
          <button
            key={step.key}
            type="button"
            onClick={() => onStepClick?.(step)}
            className={`relative flex min-h-11 flex-1 items-center gap-2.5 rounded-[14px] border px-3 py-2 text-left transition duration-200 ${
              active
                ? 'border-[#d7c6a1]/30 bg-[#d7c6a1]/10 text-[#f7f1e7]'
                : complete
                  ? 'border-[#8ba79f]/20 bg-[#f4efe5]/[0.028] text-[#a9d6cc]/85'
                  : 'border-[#f4efe5]/10 bg-[#f4efe5]/[0.028] text-[#c8c0b3]/65 hover:-translate-y-px hover:border-[#d7c6a1]/20 hover:text-[#f4efe5]/90'
            }`}
            disabled={!onStepClick}
          >
            <span className={`grid size-6 place-items-center rounded-full text-[11px] font-extrabold ${active ? 'bg-[#d7c6a1] text-[#11100d]' : 'bg-[#f4efe5]/10 text-[#f4efe5]/75'}`}>
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
  return <section className={`mx-auto max-w-7xl rounded-[28px] p-4 ${panelBase} ${className}`}>{children}</section>
}

export function UploadDropzone({ title, description, children }: { title: string; description: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[#f4efe5]/10 bg-[#f4efe5]/[0.035] p-6 text-center">
      <Upload className="mx-auto h-5 w-5 text-[#d7c6a1]/80" />
      <h3 className="mt-3 text-base font-semibold text-[#f7f1e7]">{title}</h3>
      <p className="mt-2 text-sm text-[#c8c0b3]/70">{description}</p>
      {children}
    </div>
  )
}

export function ConfigCard({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-[#f4efe5]/10 bg-[#f4efe5]/[0.035] p-4">{children}</div>
}

export function SpecCard({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="rounded-2xl border border-[#f4efe5]/10 bg-[#f4efe5]/[0.035] p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-[#d7c6a1]/70">{label}</p>
      <strong className="mt-2 block text-lg font-semibold text-[#f7f1e7]">{value}</strong>
      {note && <span className="mt-1 block text-xs text-[#c8c0b3]/70">{note}</span>}
    </div>
  )
}

export function IssueCard({ severity = 'warning', title, children }: { severity?: 'critical' | 'warning' | 'ok'; title: string; children: React.ReactNode }) {
  return (
    <article className="rounded-2xl border border-[#f4efe5]/10 bg-[#f4efe5]/[0.035] p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-[#d7c6a1]/70">{severity}</p>
      <h3 className="mt-2 text-base font-semibold text-[#f7f1e7]">{title}</h3>
      {children}
    </article>
  )
}

export function PreviewCanvas({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-[#f4efe5]/10 bg-[#f4efe5]/[0.035]">{children}</div>
}

export function ThumbnailRail({ children }: { children: React.ReactNode }) {
  return <aside className="rounded-2xl border border-[#f4efe5]/10 bg-[#f4efe5]/[0.035]">{children}</aside>
}

export function ToolbarButton({ children, active = false, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      {...props}
      className={`rounded-[11px] border border-[#f4efe5]/10 bg-[#f4efe5]/[0.045] px-3 py-2 text-[#f4efe5]/75 transition hover:bg-[#f4efe5]/10 ${active ? 'border-[#d7c6a1]/30 bg-[#d7c6a1]/10 text-[#f7f1e7]' : ''} ${props.className ?? ''}`}
    >
      {children}
    </button>
  )
}

export function SegmentedControl({ options, value, onChange }: { options: { value: string; label: string }[]; value: string; onChange: (value: string) => void }) {
  return (
    <div className="inline-flex rounded-2xl border border-[#f4efe5]/10 bg-[#f4efe5]/[0.045] p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${option.value === value ? 'bg-[#d7c6a1] text-[#11100d]' : 'text-[#f4efe5]/70 hover:bg-[#f4efe5]/10'}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export function TrustBadge({ variant = 'compact' }: { variant?: 'compact' | 'full' }) {
  const label = 'Files are processed locally in your browser. We do not store your manuscript or cover.'

  return (
    <div
      className={`${pillBase} border-teal-300/15 bg-teal-400/[0.055] text-teal-50/80 ${variant === 'full' ? 'max-w-xl justify-center whitespace-normal' : 'whitespace-nowrap'}`}
      title={label}
      aria-label={label}
    >
      <CloudOff className="h-3.5 w-3.5 shrink-0" />
      <span>{variant === 'full' ? label : 'Local processing · no file storage'}</span>
    </div>
  )
}

export function HelpPopover({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 text-[#d7c6a1]/80">
      <HelpCircle className="h-3.5 w-3.5" />
      <span>{children}</span>
    </span>
  )
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-[#f4efe5]/10 bg-[#f4efe5]/[0.035] p-8 text-center">
      <ShieldCheck className="mx-auto h-5 w-5 text-teal-200/80" />
      <h3 className="mt-3 text-base font-semibold text-[#f7f1e7]">{title}</h3>
      <p className="mt-2 text-sm text-[#c8c0b3]/70">{description}</p>
    </div>
  )
}

export function FeatureFAQ({ title = 'Common publishing questions', items }: { title?: string; items: { question: string; answer: string }[] }) {
  return (
    <section className="mx-auto mt-5 max-w-7xl rounded-3xl border border-[#f4efe5]/10 bg-[#f4efe5]/[0.026] p-5" aria-labelledby="feature-faq-title">
      <h2 id="feature-faq-title" className="mb-4 text-lg font-bold tracking-[-0.02em] text-[#f7f1e7]/90">{title}</h2>
      <div className="grid gap-3 md:grid-cols-3">
        {items.map((item) => (
          <article key={item.question} className="rounded-2xl border border-[#f4efe5]/10 bg-[#07090c]/45 p-4">
            <h3 className="text-sm font-bold leading-snug text-[#f7f1e7]/90">{item.question}</h3>
            <p className="mt-2 text-[13px] leading-relaxed text-[#c8c0b3]/70">{item.answer}</p>
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
    <div className={`${pillBase} border-[#d7c6a1]/15 bg-[#d7c6a1]/[0.055] text-[#d7c6a1]/80`}>
      {saveStatus === 'saving' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
      <span>{statusLabel}</span>
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
      className="mx-auto mb-3 flex max-w-7xl items-center gap-2.5 rounded-2xl border border-[#d7c6a1]/15 bg-[#d7c6a1]/[0.06] px-3.5 py-3 text-[13px] text-[#f4efe5]/80"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <RotateCcw className="h-4 w-4" />
      <span>Restore session available from this browser.</span>
      <button type="button" onClick={() => setHasRestoredSession(false)} className="ml-auto inline-flex items-center gap-1 text-xs font-bold text-[#d7c6a1]">
        Dismiss <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  )
}
