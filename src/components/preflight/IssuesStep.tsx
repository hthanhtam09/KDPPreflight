'use client'

import { motion } from 'framer-motion'
import {
  AlertTriangle, ArrowRight, BookOpen, CheckCircle2, RotateCcw, XCircle,
  Zap,
} from 'lucide-react'
import type { KRIssue, KRResult } from './types'
import { FIX_CAPABILITIES, issueFixability } from './fix-capabilities'

function canFixInApp(issue: KRIssue): boolean {
  return issueFixability(issue) === 'auto-fix' && !!FIX_CAPABILITIES[issue.issueType]
}

function severityCopy(issue: KRIssue): { label: string; tone: string } {
  if (issue.status === 'skipped') {
    return { label: 'Skipped check', tone: 'bg-slate-50 text-slate-600 ring-slate-200' }
  }
  if (issue.status === 'print_advisory' || issue.severity === 'info' || issue.category === 'info') {
    return { label: 'Print advisory', tone: 'bg-blue-50 text-blue-700 ring-blue-200' }
  }
  if (issue.scope === 'setup') return { label: 'Advisory', tone: 'bg-amber-50 text-amber-700 ring-amber-200' }
  return issue.category === 'must-fix'
    ? { label: 'Critical', tone: 'bg-red-50 text-red-700 ring-red-200' }
    : { label: 'Warning', tone: 'bg-amber-50 text-amber-700 ring-amber-200' }
}

function actionCopy(issue: KRIssue): string {
  const cap = FIX_CAPABILITIES[issue.issueType]
  if (issue.status === 'print_advisory') return 'Recommendation'
  if (issueFixability(issue) === 'auto-fix' && cap) return cap.label
  if (issueFixability(issue) === 'manual-review') return 'Manual fix required'
  return 'Review note'
}

function IssueCard({
  issue,
  onAction,
}: {
  readonly issue: KRIssue
  readonly onAction: () => void
}) {
  const fixable = canFixInApp(issue)
  const fixability = issueFixability(issue)
  const severity = severityCopy(issue)

  return (
    <div className={`rounded-2xl border bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)] ${issue.status === 'print_advisory' || issue.category === 'info' ? 'border-blue-200' : issue.category === 'must-fix' && issue.scope !== 'setup' ? 'border-red-200' : 'border-amber-200'}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-bold text-[#0f172a]">{issue.title}</h3>
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ring-1 ${severity.tone}`}>{severity.label}</span>
          </div>
          <div className="mt-3 grid gap-3 text-sm">
            <p><span className="font-semibold text-black/40">Why:</span> <span className="text-black/60">{issue.whyMatters}</span></p>
            <p><span className="font-semibold text-black/40">Where:</span> <span className="text-black/60">{issue.where}</span></p>
            <p>
              <span className="font-semibold text-black/40">Fix action:</span>{' '}
              <span className={fixable ? 'font-semibold text-[#059669]' : fixability === 'manual-review' ? 'font-semibold text-amber-700' : 'text-black/45'}>
                {actionCopy(issue)}
              </span>
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onAction}
          className={[
            'flex shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold',
            fixable
              ? 'bg-[#df8e51] text-white shadow-sm shadow-[#df8e51]/20 hover:bg-[#c2410c]'
              : 'border border-black/10 bg-white text-black/55 hover:bg-black/3',
          ].join(' ')}
        >
          {fixable ? <Zap className="h-4 w-4" /> : <BookOpen className="h-4 w-4" />}
          {fixable ? actionCopy(issue) : 'View steps'}
        </button>
      </div>
    </div>
  )
}

function Group({
  title,
  icon,
  children,
}: {
  readonly title: string
  readonly icon: React.ReactNode
  readonly children: React.ReactNode
}) {
  return (
    <section className="mb-7">
      <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-black/40">
        {icon}
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </section>
  )
}

interface IssuesStepProps {
  readonly result: KRResult
  readonly previousResult: KRResult | null
  readonly onGoFix: (issueId?: string | null) => void
  readonly onReset: () => void
}

export default function IssuesStep({ result, previousResult, onGoFix, onReset }: IssuesStepProps) {
  const pageIssues = result.issues.filter(issue => issue.scope === 'page')
  const coverIssues = result.issues.filter(issue => issue.scope === 'cover')
  const setupIssues = result.issues.filter(issue => issue.scope === 'setup')
  const skippedDiagnostics = result.globalDiagnostics ?? []
  const advisories = result.issues.filter(issue => issue.status !== 'skipped' && (issue.status === 'print_advisory' || issue.severity === 'info' || issue.category === 'info' || issue.scope === 'setup'))
  const mustFix    = [...pageIssues, ...coverIssues].filter(issue => issue.category === 'must-fix')
  const shouldFix  = [...pageIssues, ...coverIssues].filter(issue => issue.category === 'should-fix')
  const problemCount = mustFix.length + shouldFix.length
  const isReady    = problemCount === 0

  const handleContinue = () => {
    onGoFix([...pageIssues, ...coverIssues][0]?.id ?? null)
  }
  const firstIssue = [...mustFix, ...shouldFix, ...advisories][0] ?? null

  return (
    <div className="space-y-5">
      <section className="app-card p-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-primary">Verdict</p>
            <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-foreground">
              {isReady ? 'Your file looks ready' : `${problemCount} item${problemCount === 1 ? '' : 's'} to review`}
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              {isReady ? 'No significant KDP upload issues found.' : 'Review these before uploading to KDP.'}
            </p>
          </div>
          <div className="grid min-w-0 grid-cols-3 gap-3 sm:min-w-[360px]">
            <Metric label="Critical" value={mustFix.length} tone="text-red-500" />
            <Metric label="Warnings" value={shouldFix.length} tone="text-amber-500" />
            <Metric label="Advisories" value={advisories.length} tone="text-blue-500" />
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col">
            <button
              type="button"
              onClick={handleContinue}
              className="group flex items-center justify-center gap-2.5 rounded-xl bg-[#df8e51] px-5 py-3 text-sm font-semibold text-white shadow-md shadow-[#df8e51]/20 hover:bg-[#c2410c] active:scale-[0.98]"
            >
              {isReady ? 'Continue to Export' : 'Generate Fixed Preview'}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <button
              type="button"
              onClick={onReset}
              className="flex items-center justify-center gap-2 rounded-xl border border-border bg-white px-5 py-3 text-sm font-medium text-black/50 hover:bg-black/3"
            >
              <RotateCcw className="h-4 w-4" /> Re-run Preflight
            </button>
          </div>
        </div>
      </section>

      {previousResult && (
        <div className="rounded-2xl border border-[#059669]/20 bg-[#059669]/5 p-4 text-sm text-[#047857]">
          Recheck complete. Score changed from {previousResult.score}/100 to {result.score}/100.
        </div>
      )}

      <div className="app-grid-safe grid gap-5 xl:grid-cols-[340px_minmax(0,1fr)_320px]">
        <aside className="app-card p-4">
          <h3 className="text-base font-bold text-foreground">Issue List</h3>
          <p className="mt-1 text-sm text-muted-foreground">Grouped by impact.</p>
          <div className="mt-4 max-h-[680px] overflow-y-auto pr-1">
            {pageIssues.length > 0 && (
              <Group title="Critical / Page Validation" icon={<XCircle className="h-3.5 w-3.5 text-red-500" />}>
                {pageIssues.map((issue, index) => (
                  <motion.div key={issue.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
                    <IssueCard issue={issue} onAction={() => onGoFix(issue.id)} />
                  </motion.div>
                ))}
              </Group>
            )}

            {coverIssues.length > 0 && (
              <Group title="Warnings / Cover Validation" icon={<AlertTriangle className="h-3.5 w-3.5 text-amber-500" />}>
                {coverIssues.map((issue, index) => (
                  <motion.div key={issue.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
                    <IssueCard issue={issue} onAction={() => onGoFix(issue.id)} />
                  </motion.div>
                ))}
              </Group>
            )}

            {setupIssues.length > 0 && (
              <Group title="Advisories" icon={<AlertTriangle className="h-3.5 w-3.5 text-amber-500" />}>
                {setupIssues.map((issue, index) => (
                  <motion.div key={issue.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
                    <IssueCard issue={issue} onAction={() => onGoFix(null)} />
                  </motion.div>
                ))}
              </Group>
            )}
          </div>
          {skippedDiagnostics.length > 0 && (
            <details className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <summary className="cursor-pointer text-xs font-bold text-slate-600">Skipped checks / Diagnostics</summary>
              <div className="mt-3 space-y-2">
                {skippedDiagnostics.map((issue) => (
                  <button key={issue.id} type="button" onClick={() => onGoFix(null)} className="w-full rounded-xl border border-slate-200 bg-white p-3 text-left text-xs text-slate-600">
                    {issue.title}
                  </button>
                ))}
              </div>
            </details>
          )}
        </aside>

        <main className="app-card min-h-[520px] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-foreground">Preview / Compare</h3>
              <p className="mt-1 text-sm text-muted-foreground">Open the repair studio to inspect original and fixed pages.</p>
            </div>
            <button type="button" onClick={handleContinue} className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground">
              {isReady ? 'Export' : 'Fix'}
            </button>
          </div>
          <div className="mt-4 grid min-h-[430px] place-items-center rounded-2xl border border-border bg-[linear-gradient(to_right,color-mix(in_srgb,var(--border)_58%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_srgb,var(--border)_58%,transparent)_1px,transparent_1px)] bg-[size:24px_24px] p-6">
            <div className="w-full max-w-sm rounded-2xl border border-border bg-white p-6 text-center shadow-card">
              <p className="text-sm font-bold text-foreground">{firstIssue ? firstIssue.title : 'Other KDP checks passed.'}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {result.settings.bookType} · {result.settings.pageCount} pages · {result.settings.bleed === 'bleed' ? 'bleed included' : 'no bleed'}
              </p>
            </div>
          </div>
        </main>

        <aside className="app-card p-4">
          <h3 className="text-base font-bold text-foreground">Issue Details</h3>
          {firstIssue ? (
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Selected issue</p>
                <p className="mt-1 text-base font-bold leading-snug text-foreground [overflow-wrap:anywhere]">{firstIssue.title}</p>
              </div>
              <DetailBlock label="Affected pages" value={firstIssue.pageRefs.length ? firstIssue.pageRefs.join(', ') : firstIssue.where} />
              <DetailBlock label="Why it matters" value={firstIssue.whyMatters} />
              <DetailBlock label="Recommended fix" value={firstIssue.howToFix} />
              <button type="button" onClick={() => onGoFix(firstIssue.id)} className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-hover">
                {canFixInApp(firstIssue) ? 'Generate Fixed Preview' : 'View Fix Steps'}
              </button>
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-[#059669]/18 bg-[#059669]/4 p-5">
              <p className="text-sm font-semibold text-[#047857]">No significant problems detected.</p>
              <p className="mt-1 text-sm text-black/50">Your report is ready for review.</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}

function Metric({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="rounded-2xl border border-border bg-muted/20 p-3 text-center">
      <p className={`text-2xl font-extrabold ${tone}`}>{value}</p>
      <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  )
}

function DetailBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm leading-relaxed text-black/60 [overflow-wrap:anywhere]">{value}</p>
    </div>
  )
}
