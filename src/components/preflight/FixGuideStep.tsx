'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ChevronLeft, ArrowRight, Copy, Check,
  XCircle, AlertTriangle,
} from 'lucide-react'
import type { KRIssue, KRIssueCat } from './types'
import { FIX_CONTENT, FIX_TOOL_LABELS, type FixTool } from './fix-content'

// ── Tool tab ──────────────────────────────────────────────────────────────────

function ToolTabs({ tools, active, onChange }: {
  readonly tools: FixTool[]
  readonly active: FixTool
  readonly onChange: (t: FixTool) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {tools.map(t => (
        <button
          key={t}
          type="button"
          onClick={() => onChange(t)}
          className={[
            'rounded-xl border px-4 py-2 text-xs font-semibold transition-all',
            active === t
              ? 'border-[#df8e51] bg-[#df8e51]/8 text-[#df8e51]'
              : 'border-black/8 bg-white text-black/55 hover:border-[#df8e51]/30 hover:text-[#df8e51]',
          ].join(' ')}
        >
          {FIX_TOOL_LABELS[t]}
        </button>
      ))}
    </div>
  )
}

// ── Copy button ───────────────────────────────────────────────────────────────

function CopyButton({ text }: { readonly text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* ignore */ }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="flex items-center gap-1.5 rounded-lg border border-black/8 bg-white px-3 py-1.5 text-xs font-medium text-black/55 hover:bg-black/3"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-[#059669]" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? 'Copied!' : 'Copy steps'}
    </button>
  )
}

// ── Issue selector ────────────────────────────────────────────────────────────

const CAT_ICONS: Record<KRIssueCat, React.ReactNode> = {
  'must-fix':   <XCircle      className="h-3.5 w-3.5 shrink-0 text-red-500"   />,
  'should-fix': <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-500" />,
  'looks-good': <></>,
  'info':       <></>,
}

// ── Main component ────────────────────────────────────────────────────────────

const TOOL_ORDER: FixTool[] = ['canva', 'indesign', 'affinity', 'word', 'photoshop', 'other']

interface FixGuideStepProps {
  readonly issues: KRIssue[]
  readonly selectedIssueId: string | null
  readonly onBack: () => void
  readonly onContinue: () => void
}

export default function FixGuideStep({
  issues, selectedIssueId, onBack, onContinue,
}: FixGuideStepProps) {
  const fixableIssues = issues.filter(i => i.issueType in FIX_CONTENT)
  const startIssue = fixableIssues.find(i => i.id === selectedIssueId) ?? fixableIssues[0]

  const [activeIssue, setActiveIssue] = useState<KRIssue | null>(startIssue ?? null)
  const [activeTool, setActiveTool] = useState<FixTool>('canva')

  const content = activeIssue ? FIX_CONTENT[activeIssue.issueType] : null
  const availableTools = content
    ? (TOOL_ORDER.filter(t => t in content.guides) as FixTool[])
    : []

  const guide = content?.guides[activeTool] ?? content?.guides[availableTools[0]]

  const stepsText = guide
    ? guide.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')
    : ''

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:py-16">

      {/* Back */}
      <button
        type="button"
        onClick={onBack}
        className="mb-6 flex items-center gap-1.5 text-xs font-medium text-black/40 hover:text-black/60"
      >
        <ChevronLeft className="h-3.5 w-3.5" /> Back to review
      </button>

      <div className="mb-8">
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-black/35">Step 4 of 5</p>
        <h2 className="text-3xl font-bold tracking-tight text-[#0f172a]">Fix Guide</h2>
        <p className="mt-2 text-sm text-black/50">
          Exact steps to fix each issue in your design tool, then re-upload.
        </p>
      </div>

      {fixableIssues.length === 0 ? (
        <div className="rounded-2xl border border-[#059669]/20 bg-[#059669]/4 px-6 py-8 text-center">
          <p className="text-sm font-semibold text-[#059669]">No fixes needed — your file passed all checks.</p>
          <p className="mt-1 text-xs text-black/45">Continue to download your review report.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6 lg:flex-row">

          {/* Issue list — left sidebar */}
          <div className="shrink-0 lg:w-56">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-black/35">Issues</p>
            <div className="space-y-1.5">
              {fixableIssues.map(issue => (
                <button
                  key={issue.id}
                  type="button"
                  onClick={() => setActiveIssue(issue)}
                  className={[
                    'flex w-full items-start gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-medium transition-all',
                    activeIssue?.id === issue.id
                      ? 'bg-[#df8e51]/8 text-[#0f172a]'
                      : 'text-black/55 hover:bg-black/3 hover:text-[#0f172a]',
                  ].join(' ')}
                >
                  {CAT_ICONS[issue.category]}
                  <span>{issue.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Guide panel — right */}
          {activeIssue && content && (
            <motion.div
              key={activeIssue.id}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.22 }}
              className="flex-1 min-w-0"
            >
              <div className="rounded-2xl border border-black/7 bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.05)]">

                {/* Issue summary */}
                <h3 className="text-base font-bold text-[#0f172a]">{activeIssue.title}</h3>
                <p className="mt-1 text-sm text-black/55">{content.summary}</p>

                {/* Tool tabs */}
                {availableTools.length > 1 && (
                  <div className="mt-5">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-black/35">Fix in</p>
                    <ToolTabs
                      tools={availableTools}
                      active={availableTools.includes(activeTool) ? activeTool : availableTools[0]}
                      onChange={setActiveTool}
                    />
                  </div>
                )}

                {/* Steps */}
                {guide && (
                  <div className="mt-5">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-widest text-black/35">
                        Steps — {FIX_TOOL_LABELS[availableTools.includes(activeTool) ? activeTool : availableTools[0]]}
                      </p>
                      <CopyButton text={stepsText} />
                    </div>

                    <ol className="space-y-3">
                      {guide.steps.map((step, i) => (
                        <li key={i} className="flex gap-3 text-sm leading-relaxed">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#df8e51]/10 text-[10px] font-bold text-[#df8e51]">
                            {i + 1}
                          </span>
                          <span className="text-black/70">{step}</span>
                        </li>
                      ))}
                    </ol>

                    {guide.exportSettings && (
                      <div className="mt-4 rounded-lg bg-black/3 px-4 py-3 text-xs">
                        <span className="font-semibold text-black/50">Export settings: </span>
                        <span className="text-black/65">{guide.exportSettings}</span>
                      </div>
                    )}

                    {guide.note && (
                      <p className="mt-3 text-xs text-black/45 italic">{guide.note}</p>
                    )}
                  </div>
                )}

                {/* Re-upload prompt */}
                <div className="mt-6 rounded-xl border border-dashed border-black/10 bg-[#f6f8fb] px-4 py-3 text-sm text-black/55">
                  After fixing, come back to{' '}
                  <a href="/preflight" className="font-semibold text-[#df8e51] underline underline-offset-2">
                    /preflight
                  </a>{' '}
                  and re-upload your corrected file to confirm the issue is resolved.
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Continue */}
      <div className="mt-8 flex justify-end">
        <button
          type="button"
          onClick={onContinue}
          className="group flex items-center gap-2.5 rounded-xl bg-[#df8e51] px-8 py-3 text-sm font-semibold text-white shadow-md shadow-[#df8e51]/20 hover:bg-[#c2410c] active:scale-[0.98]"
        >
          Download report
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  )
}
