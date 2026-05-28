'use client'

import React from 'react'
import { useAppStore } from '@/store/use-app-store'
import { PageTransition } from '@/components/workspace/ProductWorkspace'

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
        <p className="text-xs text-muted-foreground truncate max-w-2xl mt-1 leading-none">
          {config.description}
        </p>
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
}

function StepIndicator({ activeStep }: { activeStep: 'setup' | 'preview' | 'preflight' }) {
  const steps = [
    { key: 'setup' as const, num: 1, label: 'Setup' },
    { key: 'preview' as const, num: 2, label: 'Preview' },
    { key: 'preflight' as const, num: 3, label: 'Preflight' },
  ]

  return (
    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
      {steps.map((step, idx) => {
        const isActive = step.key === activeStep
        const isPast = steps.findIndex((s) => s.key === activeStep) > idx
        return (
          <React.Fragment key={step.key}>
            <div
              className={`flex items-center gap-1.5 px-2 py-1 rounded-full transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary font-semibold'
                  : isPast
                    ? 'text-success'
                    : 'text-muted-foreground'
              }`}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : isPast
                      ? 'bg-success text-success-foreground'
                      : 'bg-border/60'
                }`}
              >
                {isPast ? '✓' : step.num}
              </span>
              <span className="hidden sm:inline">{step.label}</span>
            </div>
            {idx < steps.length - 1 && <span className="opacity-30">→</span>}
          </React.Fragment>
        )
      })}
    </div>
  )
}

export function AppWorkspaceShell({
  title,
  subtitle,
  activeStep,
  primaryAction,
  secondaryAction,
  left,
  main,
  right,
  children,
}: AppWorkspaceShellProps) {
  const PrimaryActionComponent = primaryAction?.href ? 'a' : 'button'
  const SecondaryActionComponent = secondaryAction?.href ? 'a' : 'button'

  return (
    <PageTransition>
      <div className="h-[calc(100svh-var(--nav-height))] flex flex-col overflow-hidden bg-background">
        {/* Context Bar */}
        <div className="shrink-0 border-b border-border/40 bg-surface px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          {/* Left: Title + Subtitle */}
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-foreground leading-tight">{title}</h1>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{subtitle}</p>
          </div>

          {/* Center: Step Indicator */}
          <div className="hidden md:block shrink-0">
            <StepIndicator activeStep={activeStep} />
          </div>

          {/* Right: Actions */}
          {(primaryAction || secondaryAction) && (
            <div className="flex items-center gap-2 shrink-0">
              {secondaryAction && (
                <SecondaryActionComponent
                  href={secondaryAction.href}
                  onClick={secondaryAction.onClick}
                  className="ds-focus inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium border border-border bg-surface hover:bg-muted/40 transition-colors"
                >
                  {secondaryAction.label}
                </SecondaryActionComponent>
              )}
              {primaryAction && (
                <PrimaryActionComponent
                  href={primaryAction.href}
                  onClick={primaryAction.onClick}
                  disabled={primaryAction.disabled}
                  className="ds-focus inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold bg-primary text-primary-foreground shadow-soft hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {primaryAction.label}
                </PrimaryActionComponent>
              )}
            </div>
          )}
        </div>

        {/* Workspace Body */}
        <div className="flex-1 min-h-0 flex gap-0 overflow-hidden">
          {children ? (
            <div className="flex-1 w-full">{children}</div>
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
            <ProductFlowHeader
              config={header}
              primaryAction={primaryAction}
              secondaryAction={secondaryAction}
            />
          )}
          {studio ? (
            <div className="flex-1 min-h-0">{children}</div>
          ) : (
            <div className="mt-2">{children}</div>
          )}
        </div>
      </div>
    </PageTransition>
  )
}
