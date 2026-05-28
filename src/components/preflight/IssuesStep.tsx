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

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:py-16">
      <div className="mb-8 text-center">
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-black/35">Review</p>
        <h2 className="text-3xl font-bold tracking-tight text-[#0f172a]">
          {isReady ? 'Your file looks ready' : `${problemCount} item${problemCount === 1 ? '' : 's'} to review`}
        </h2>
        <p className="mt-2 text-sm text-black/45">
          {isReady ? 'No significant KDP upload issues found.' : 'Review these before uploading to KDP.'}
        </p>
      </div>

      {previousResult && (
        <div className="mb-6 rounded-2xl border border-[#059669]/20 bg-[#059669]/5 p-4 text-sm text-[#047857]">
          Recheck complete. Score changed from {previousResult.score}/100 to {result.score}/100.
        </div>
      )}

      <div className="mb-8 rounded-3xl border border-black/7 bg-white p-6 shadow-[0_14px_40px_-24px_rgba(15,23,42,0.12)]">
        <div className="grid gap-4 text-center sm:grid-cols-3">
          <div>
            <p className="text-3xl font-bold text-red-500">{mustFix.length}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-black/35">Critical Issues</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-amber-500">{shouldFix.length}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-black/35">Warnings</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-blue-500">{advisories.length}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-black/35">Advisories</p>
          </div>
        </div>
      </div>

      {pageIssues.length > 0 && (
        <Group title="Page Validation" icon={<XCircle className="h-3.5 w-3.5 text-red-500" />}>
          {pageIssues.map((issue, index) => (
            <motion.div key={issue.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
              <IssueCard issue={issue} onAction={() => onGoFix(issue.id)} />
            </motion.div>
          ))}
        </Group>
      )}

      {coverIssues.length > 0 && (
        <Group title="Cover Validation" icon={<AlertTriangle className="h-3.5 w-3.5 text-amber-500" />}>
          {coverIssues.map((issue, index) => (
            <motion.div key={issue.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
              <IssueCard issue={issue} onAction={() => onGoFix(issue.id)} />
            </motion.div>
          ))}
        </Group>
      )}

      {setupIssues.length > 0 && (
        <Group title="Book Setup Advisories" icon={<AlertTriangle className="h-3.5 w-3.5 text-amber-500" />}>
          {setupIssues.map((issue, index) => (
            <motion.div key={issue.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
              <IssueCard issue={issue} onAction={() => onGoFix(null)} />
            </motion.div>
          ))}
        </Group>
      )}

      {skippedDiagnostics.length > 0 && (
        <Group title="Skipped checks / metadata needed" icon={<AlertTriangle className="h-3.5 w-3.5 text-slate-400" />}>
          {skippedDiagnostics.map((issue, index) => (
            <motion.div key={issue.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
              <IssueCard issue={issue} onAction={() => onGoFix(null)} />
            </motion.div>
          ))}
        </Group>
      )}

      <Group title="Looks Good" icon={<CheckCircle2 className="h-3.5 w-3.5 text-[#059669]" />}>
        <div className="rounded-2xl border border-[#059669]/18 bg-[#059669]/4 p-5">
          <p className="text-sm font-semibold text-[#047857]">
            {isReady ? 'No significant problems detected.' : 'Other KDP checks passed.'}
          </p>
          <p className="mt-1 text-sm text-black/50">
            {result.settings.bookType} · {result.settings.pageCount} pages · {result.settings.bleed === 'bleed' ? 'bleed included' : 'no bleed'}
          </p>
        </div>
      </Group>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
        <button
          type="button"
          onClick={onReset}
          className="flex items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-5 py-3 text-sm font-medium text-black/50 hover:bg-black/3"
        >
          <RotateCcw className="h-4 w-4" /> Upload different files
        </button>
        <button
          type="button"
          onClick={handleContinue}
          className="group flex items-center justify-center gap-2.5 rounded-xl bg-[#df8e51] px-8 py-3 text-sm font-semibold text-white shadow-md shadow-[#df8e51]/20 hover:bg-[#c2410c] active:scale-[0.98]"
        >
          {isReady ? 'Continue to Export' : 'Continue to Fix'}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  )
}
