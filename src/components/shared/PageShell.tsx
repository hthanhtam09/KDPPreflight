'use client'

import { PageTransition } from '@/components/workspace/ProductWorkspace'
import { useAppStore } from '@/store/use-app-store'
import React from 'react'

export interface HeaderBadgeConfig {
  label: string
  tone: 'orange' | 'green' | 'blue' | 'neutral'
}

export interface HeaderConfig {
  eyebrow: string
  title: string
  description: string
  activeStep: 'setup' | 'preview' | 'preflight'
  badges: HeaderBadgeConfig[]
}

interface PageShellProps {
  activeNav: 'setup' | 'preview' | 'preflight' | 'home' | 'blog'
  header: HeaderConfig
  children: React.ReactNode
  studio?: boolean
  primaryAction?: React.ReactNode
  secondaryAction?: React.ReactNode
}

// ── HeaderBadge Component ──────────────────────────────────────────────────
export function HeaderBadge({ label, tone }: HeaderBadgeConfig) {
  const toneClasses = {
    orange: 'border-orange-500/20 bg-orange-500/8 text-orange-600 dark:text-orange-400',
    green: 'border-emerald-500/20 bg-emerald-500/8 text-emerald-600 dark:text-emerald-400',
    blue: 'border-sky-500/20 bg-sky-500/8 text-sky-600 dark:text-sky-400',
    neutral: 'border-slate-500/20 bg-slate-500/8 text-slate-600 dark:text-slate-400',
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wide shadow-soft transition-colors ${toneClasses[tone]}`}
    >
      {label}
    </span>
  )
}

// ── ProductFlowHeader Component ───────────────────────────────────────────
export function ProductFlowHeader({
  config,
  primaryAction,
  secondaryAction,
}: {
  config: HeaderConfig
  primaryAction?: React.ReactNode
  secondaryAction?: React.ReactNode
}) {
  return (
    <header className="mx-auto mb-4 flex w-full max-w-7xl flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/40 pb-3 px-1">
      {/* Left: Title + Subtitle + Badges */}
      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground leading-none">
            {config.title}
          </h1>
          {/* Badges inline */}
          <div className="flex flex-wrap gap-1">
            {config.badges.slice(0, 2).map((badge, idx) => (
              <HeaderBadge key={idx} label={badge.label} tone={badge.tone} />
            ))}
          </div>
        </div>
        <p className="text-xs text-muted-foreground truncate max-w-2xl mt-1 leading-none">{config.description}</p>
      </div>

      {/* Center: Sleek Breadcrumb Steps (only on desktop/tablet) */}
      <div className="hidden md:flex items-center gap-2 bg-muted/40 border border-border/40 px-3 py-1 rounded-full text-xs font-semibold text-muted-foreground shadow-soft">
        <span className={config.activeStep === 'setup' ? 'text-primary font-bold' : ''}>Setup</span>
        <span className="opacity-30">/</span>
        <span className={config.activeStep === 'preview' ? 'text-primary font-bold' : ''}>Preview</span>
        <span className="opacity-30">/</span>
        <span className={config.activeStep === 'preflight' ? 'text-primary font-bold' : ''}>Preflight</span>
      </div>

      {/* Right: Inline Actions */}
      {(primaryAction || secondaryAction) && (
        <div className="flex items-center gap-2 shrink-0">
          {secondaryAction}
          {primaryAction}
        </div>
      )}
    </header>
  )
}

// ── AppWorkspaceShell Component ───────────────────────────────────────────
export interface AppWorkspaceShellProps {
  activeNav: 'setup' | 'preview' | 'preflight' | 'home' | 'blog'
  title: string
  subtitle: string
  activeStep: 'setup' | 'preview' | 'preflight'
  eyebrow?: string
  badges?: HeaderBadgeConfig[]
  primaryAction?: {
    label: string
    onClick?: () => void
    href?: string
    disabled?: boolean
  }
  secondaryAction?: {
    label: string
    onClick?: () => void
    href?: string
  }
  left?: React.ReactNode
  main?: React.ReactNode
  right?: React.ReactNode
  children?: React.ReactNode
  lockScroll?: boolean
}

function WorkflowPill({ label, tone }: HeaderBadgeConfig) {
  const toneClasses = {
    orange: 'bg-primary/8 text-primary ring-primary/15',
    green: 'bg-success/8 text-success ring-success/15',
    blue: 'bg-sky-500/8 text-sky-700 ring-sky-500/15 dark:text-sky-300',
    neutral: 'bg-muted/60 text-muted-foreground ring-border',
  }

  return (
    <span
      className={`inline-flex min-h-7 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 text-[11px] font-bold ring-1 ${toneClasses[tone]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {label}
    </span>
  )
}

function WorkflowScreenHeader({
  title,
  subtitle,
  activeStep,
  eyebrow,
  badges,
  primaryAction,
  secondaryAction,
  compact = false,
}: {
  title: string
  subtitle: string
  activeStep: 'setup' | 'preview' | 'preflight'
  eyebrow: string
  badges: HeaderBadgeConfig[]
  primaryAction?: AppWorkspaceShellProps['primaryAction']
  secondaryAction?: AppWorkspaceShellProps['secondaryAction']
  compact?: boolean
}) {
  const PrimaryActionComponent = primaryAction?.href ? 'a' : 'button'
  const SecondaryActionComponent = secondaryAction?.href ? 'a' : 'button'
  const context = {
    setup: 'Planning and export sizing',
    preview: 'Visual review workspace',
    preflight: 'Final validation report',
  }[activeStep]

  return (
    <header className={compact ? 'mb-3' : 'mb-5'}>
      <div className={`grid lg:grid-cols-[minmax(0,1fr)_minmax(340px,0.38fr)] lg:items-center ${compact ? 'gap-3 p-3 sm:p-4' : 'gap-5 p-5 sm:p-6 lg:p-7'}`}>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-primary">{eyebrow}</p>
            <span className="hidden h-1 w-1 rounded-full bg-border sm:block" />
            <p className="text-xs font-semibold text-muted-foreground">{context}</p>
          </div>

          <div className={`${compact ? 'mt-2' : 'mt-3'} max-w-3xl`}>
            <h1 className={`font-extrabold leading-[1.02] tracking-tight text-foreground ${compact ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-4xl lg:text-[42px]'}`}>
              {title}
            </h1>
            <p className={`mt-2 max-w-2xl leading-relaxed text-muted-foreground ${compact ? 'text-sm' : 'text-base sm:text-[17px]'}`}>{subtitle}</p>
          </div>
        </div>

        <div className={`flex min-w-0 flex-col gap-3 lg:items-stretch ${compact ? 'p-1' : 'p-3'}`}>
          <div className="flex items-center gap-2 lg:justify-end">
            {badges.slice(0, 2).map((badge) => (
              <WorkflowPill key={badge.label} {...badge} />
            ))}
          </div>
        </div>
      </div>
    </header>
  )
}

export function AppWorkspaceShell({
  activeNav,
  title,
  subtitle,
  activeStep,
  eyebrow,
  badges,
  primaryAction,
  secondaryAction,
  left,
  main,
  right,
  children,
  lockScroll = false,
}: AppWorkspaceShellProps) {
  const { previewFlowStep } = useAppStore()
  const fallbackEyebrows = {
    setup: 'SMART BOOK SETUP',
    preview: 'VISUAL PDF PREVIEW',
    preflight: 'KDP PREFLIGHT CHECK',
  }
  const fallbackBadges: Record<'setup' | 'preview' | 'preflight', HeaderBadgeConfig[]> = {
    setup: [
      { label: 'Official KDP rules', tone: 'orange' },
      { label: 'Live export size', tone: 'green' },
    ],
    preview: [
      { label: 'Safe area guides', tone: 'orange' },
      { label: 'Local preview', tone: 'green' },
    ],
    preflight: [
      { label: 'KDP rule checks', tone: 'orange' },
      { label: 'Fix preview available', tone: 'green' },
    ],
  }
  const headerBadges = (badges ?? fallbackBadges[activeStep]).slice(0, 2)
  const headerEyebrow = eyebrow ?? fallbackEyebrows[activeStep]
  const isImmersivePreview = activeNav === 'preview' && previewFlowStep === 'preview'
  const shouldLockScroll =
    lockScroll || (activeNav === 'preview' && ['config', 'generate', 'preview'].includes(previewFlowStep))

  return (
    <PageTransition>
      <div
        className={
          isImmersivePreview
            ? 'fixed inset-0 z-100 h-dvh overflow-hidden bg-[#eef2f7]'
            : `ws-shell ${shouldLockScroll ? 'h-[calc(100svh-var(--nav-height))] overflow-hidden' : 'min-h-[calc(100svh-var(--nav-height))]'}`
        }
      >
        <main
          className={
            isImmersivePreview
              ? 'flex h-full w-full flex-col overflow-hidden'
              : `app-page-container flex flex-col ${shouldLockScroll ? 'h-full overflow-hidden' : 'min-h-[calc(100svh-var(--nav-height))]'}`
          }
        >
          <div className={isImmersivePreview ? 'hidden' : 'contents'}>
            <WorkflowScreenHeader
              title={title}
              subtitle={subtitle}
              activeStep={activeStep}
              eyebrow={headerEyebrow}
              badges={headerBadges}
              primaryAction={primaryAction}
              secondaryAction={secondaryAction}
              compact={shouldLockScroll}
            />
          </div>

          {/* Workspace Body */}
          <div className={`flex min-h-0 flex-1 gap-0 ${shouldLockScroll ? 'overflow-hidden' : 'overflow-visible'}`}>
            {children ? (
              <div className={`min-w-0 flex-1 ${shouldLockScroll ? 'h-full overflow-hidden' : ''}`}>{children}</div>
            ) : (
              <>
                {/* Left Panel */}
                {left && (
                  <aside className="w-[280px] shrink-0 border-r border-border/40 bg-surface overflow-y-auto">
                    <div className="h-full p-3 sm:p-4">{left}</div>
                  </aside>
                )}

                {/* Main Panel */}
                <main className="flex-1 min-w-0 overflow-hidden bg-background">
                  <div className="h-full overflow-y-auto p-3 sm:p-4">{main}</div>
                </main>

                {/* Right Panel */}
                {right && (
                  <aside className="w-[260px] shrink-0 border-l border-border/40 bg-surface overflow-y-auto">
                    <div className="h-full p-3 sm:p-4">{right}</div>
                  </aside>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </PageTransition>
  )
}

// ── PageShell Component ────────────────────────────────────────────────────
export default function PageShell({
  children,
  header,
  activeNav,
  studio = false,
  primaryAction,
  secondaryAction,
}: PageShellProps) {
  const { previewFlowStep } = useAppStore()

  // Hide the header ONLY during the immersive 3D Preview stage on the Preview screen
  const showHeader = !(activeNav === 'preview' && previewFlowStep === 'preview')

  return (
    <PageTransition>
      <div
        className={`ws-shell ${
          studio
            ? 'flex h-[calc(100svh-var(--nav-height))] min-h-[560px] flex-col overflow-hidden pb-0 lg:min-h-[720px]'
            : 'min-h-[calc(100vh-var(--nav-height))] pb-8'
        }`}
      >
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-2 flex flex-col h-full">
          {showHeader && (
            <ProductFlowHeader config={header} primaryAction={primaryAction} secondaryAction={secondaryAction} />
          )}
          {studio ? <div className="flex-1 min-h-0">{children}</div> : <div className="mt-2">{children}</div>}
        </div>
      </div>
    </PageTransition>
  )
}
