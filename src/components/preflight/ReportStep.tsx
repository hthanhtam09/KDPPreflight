'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Download, RotateCcw, FileText, Copy, Check, RefreshCw } from 'lucide-react'
import { TRIM_SIZES } from '@/engine/kdp-constants'
import type { KRResult } from './types'
import { FIX_CONTENT } from './fix-content'

// ── Report HTML generator ─────────────────────────────────────────────────────

function generateReportHTML(result: KRResult): string {
  const { score, verdict, issues, settings, fileNames, fileSize, colorRisk, spineWidthIn } = result
  const trim = TRIM_SIZES[settings.trimSize]
  const mustFix = issues.filter(i => i.category === 'must-fix')
  const shouldFix = issues.filter(i => i.category === 'should-fix')
  const fmt = (b: number) => b < 1048576 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1048576).toFixed(1)} MB`
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  const issueRow = (title: string, whyMatters: string, where: string, howToFix: string) => `
    <div style="margin-bottom:16px;padding:16px;border:1px solid #e2e8f0;border-radius:8px;background:#fff;">
      <p style="margin:0 0 6px;font-weight:700;color:#0f172a;">${title}</p>
      <p style="margin:0 0 4px;color:#475569;font-size:14px;"><strong>Why it matters:</strong> ${whyMatters}</p>
      <p style="margin:0 0 4px;color:#475569;font-size:14px;"><strong>Where:</strong> ${where}</p>
      <p style="margin:0;color:#475569;font-size:14px;"><strong>How to fix:</strong> ${howToFix}</p>
    </div>`

  const checklist = [
    ...mustFix.map(i => `<li>☐ [MUST FIX] ${i.title}</li>`),
    ...shouldFix.map(i => `<li>☐ ${i.title}</li>`),
    '<li>☐ Re-upload fixed files at /preflight</li>',
    '<li>☐ Confirm all settings are correct</li>',
    '<li>☐ No remaining "Must Fix" issues</li>',
  ].join('\n')

  const fixInstructions = issues
    .map(issue => ({ issue, content: FIX_CONTENT[issue.issueType] }))
    .filter((item): item is { issue: typeof item.issue; content: NonNullable<typeof item.content> } => !!item.content)
    .map(({ issue, content }) => {
      const canvaGuide = content.guides.canva
      const steps = canvaGuide
        ? canvaGuide.steps.map((s, idx) => `<li>${idx + 1}. ${s}</li>`).join('')
        : '<li>See the fix guide at /preflight for detailed instructions.</li>'
      return `
        <h3 style="color:#b45309;">${issue.title}</h3>
        <p style="color:#475569;font-size:14px;">${content.summary}</p>
        <p style="font-weight:600;margin:12px 0 6px;">Fix in Canva:</p>
        <ol style="margin:0;padding-left:20px;color:#475569;font-size:14px;line-height:1.7;">${steps}</ol>`
    }).join('<hr style="margin:24px 0;border-color:#e2e8f0;">')

  const colorSection = colorRisk && settings.bookType !== 'kindle' ? `
  <div class="card">
    <h2>Color &amp; Print Risk</h2>
    <p style="font-weight:600;margin:0 0 4px;">${
      colorRisk.riskLevel === 'low' ? '✓ Low Risk' :
      colorRisk.riskLevel === 'medium' ? '⚠ Medium Risk' : '✗ High Risk'
    }</p>
    <p style="color:#475569;font-size:14px;">${colorRisk.riskSummary}</p>
    ${colorRisk.colorPageCount > 0 ? `<p style="font-size:14px;margin-top:8px;">Color pages detected: <strong>${colorRisk.colorPageCount}</strong></p>` : ''}
    ${colorRisk.darkPageCount > 0 ? `<p style="font-size:14px;margin-top:4px;">Dark pages detected: <strong>${colorRisk.darkPageCount}</strong></p>` : ''}
    <p style="font-size:13px;color:#94a3b8;margin-top:12px;font-style:italic;">Printed colors may look different from your screen depending on paper, ink type, and printer.</p>
  </div>` : ''

  const scoreColor = score >= 80 ? '#059669' : score >= 55 ? '#d97706' : '#dc2626'

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>KDP Review Report — ${fileNames.manuscript}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #0f172a; background: #f6f8fb; margin: 0; padding: 32px 16px; }
    .card { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 24px; }
    h1 { font-size: 28px; font-weight: 800; margin: 0 0 4px; }
    h2 { font-size: 18px; font-weight: 700; color: #0f172a; margin: 0 0 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; }
    h3 { font-size: 15px; font-weight: 700; margin: 0 0 6px; }
    p, li { line-height: 1.6; color: #475569; }
    table { width: 100%; border-collapse: collapse; font-size: 14px; }
    td { padding: 8px 0; border-bottom: 1px solid #f1f5f9; }
    td:first-child { color: #64748b; width: 40%; }
    td:last-child { font-weight: 600; color: #0f172a; }
    .score { font-size: 48px; font-weight: 800; color: ${scoreColor}; }
    @media print { body { background: #fff; padding: 16px; } }
  </style>
</head>
<body>
<div style="max-width:680px;margin:0 auto;">

  <div class="card">
    <p style="color:#64748b;margin:0 0 4px;font-size:13px;">Generated ${date} · KDPPreflight.com</p>
    <h1>KDP Review Report</h1>
    <p style="margin:0;color:#64748b;">File: <strong>${fileNames.manuscript}</strong>${fileNames.cover ? ` + ${fileNames.cover}` : ''} &nbsp;·&nbsp; ${fmt(fileSize)}</p>
  </div>

  <div class="card">
    <h2>Review Score</h2>
    <div class="score">${score}<span style="font-size:24px;color:#94a3b8;">/100</span></div>
    <p style="font-size:18px;font-weight:600;margin:8px 0 0;color:#0f172a;">${verdict}</p>
  </div>

  <div class="card">
    <h2>Confirmed Settings</h2>
    <table>
      <tr><td>Book type</td><td>${settings.bookType}</td></tr>
      <tr><td>Trim size</td><td>${trim ? trim.label : settings.trimSize}</td></tr>
      <tr><td>Bleed</td><td>${settings.bleed === 'bleed' ? 'Enabled (0.125")' : 'Disabled'}</td></tr>
      <tr><td>Interior</td><td>${settings.interior}</td></tr>
      <tr><td>Paper</td><td>${settings.paper}</td></tr>
      <tr><td>Page count</td><td>${settings.pageCount} pages</td></tr>
      <tr><td>Dimensions</td><td>${settings.widthIn.toFixed(3)}" × ${settings.heightIn.toFixed(3)}"</td></tr>
      ${spineWidthIn !== null && settings.bookType !== 'kindle' ? `<tr><td>Est. spine width</td><td>${spineWidthIn.toFixed(3)}"</td></tr>` : ''}
    </table>
  </div>

  ${mustFix.length > 0 ? `
  <div class="card">
    <h2 style="color:#dc2626;">Must Fix (${mustFix.length})</h2>
    ${mustFix.map(i => issueRow(i.title, i.whyMatters, i.where, i.howToFix)).join('')}
  </div>` : ''}

  ${shouldFix.length > 0 ? `
  <div class="card">
    <h2 style="color:#d97706;">Should Fix (${shouldFix.length})</h2>
    ${shouldFix.map(i => issueRow(i.title, i.whyMatters, i.where, i.howToFix)).join('')}
  </div>` : ''}

  ${issues.length === 0 ? `
  <div class="card" style="text-align:center;background:#f0fdf4;border-color:#bbf7d0;">
    <p style="font-size:18px;font-weight:700;color:#059669;margin:0;">✓ No issues found — your file passed all checks.</p>
  </div>` : ''}

  ${colorSection}

  ${fixInstructions ? `
  <div class="card">
    <h2>Fix Instructions (Canva)</h2>
    ${fixInstructions}
  </div>` : ''}

  <div class="card">
    <h2>Re-upload Checklist</h2>
    <ul style="margin:0;padding-left:20px;line-height:2;">${checklist}</ul>
  </div>

  <div class="card" style="background:#f8fafc;">
    <p style="margin:0;font-size:13px;color:#94a3b8;text-align:center;">
      Generated by <strong>KDPPreflight.com</strong> · Files were checked locally in your browser.
    </p>
  </div>

</div>
</body>
</html>`
}

// ── Checklist row ─────────────────────────────────────────────────────────────

function CheckRow({ text }: { readonly text: string }) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#059669]" />
      <span className="text-sm text-[#0f172a]">{text}</span>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

interface ReportStepProps {
  readonly result: KRResult
  readonly previousResult: KRResult | null
  readonly onStartOver: () => void
  readonly onRecheck: () => void
}

export default function ReportStep({ result, previousResult, onStartOver, onRecheck }: ReportStepProps) {
  const [copied, setCopied] = useState(false)
  const trim = TRIM_SIZES[result.settings.trimSize]
  const mustFix = result.issues.filter(i => i.category === 'must-fix')
  const shouldFix = result.issues.filter(i => i.category === 'should-fix')
  const hasIssues = result.issues.length > 0

  const handleDownload = () => {
    const html = generateReportHTML(result)
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `kdp-review-${result.fileNames.manuscript.replace(/\.[^.]+$/, '')}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleCopyChecklist = async () => {
    const lines = [
      '=== KDP Pre-upload Checklist ===',
      ...mustFix.map(i => `☐ [MUST FIX] ${i.title}`),
      ...shouldFix.map(i => `☐ [SHOULD FIX] ${i.title}`),
      '☐ Re-upload fixed files at /preflight',
      '☐ Confirm all settings are correct',
      '☐ No remaining "Must Fix" issues',
    ]
    try {
      await navigator.clipboard.writeText(lines.join('\n'))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* ignore */ }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 md:py-16">

      {/* Header */}
      <motion.div className="mb-10 text-center" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <motion.div
          className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#059669]/10"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <FileText className="h-8 w-8 text-[#059669]" />
        </motion.div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-black/35">Step 5 of 5</p>
        <h2 className="text-3xl font-bold tracking-tight text-[#0f172a] md:text-4xl">
          Your KDP Review Report
        </h2>
        <p className="mt-3 text-base text-black/50">
          Download the full report with all settings, issues, and fix instructions.
        </p>
      </motion.div>

      {/* Report summary card */}
      <motion.div
        className="mb-8 rounded-3xl border border-black/7 bg-white p-6 shadow-[0_14px_40px_-24px_rgba(15,23,42,0.15)]"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
      >
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-black/35">What's in the report</p>
        <div className="divide-y divide-black/5">
          <CheckRow text={`File: ${result.fileNames.manuscript}${result.fileNames.cover ? ` + ${result.fileNames.cover}` : ''}`} />
          <CheckRow text={`Book type: ${result.settings.bookType} · Trim: ${trim?.label ?? result.settings.trimSize} · ${result.settings.pageCount} pages`} />
          <CheckRow text={`Bleed: ${result.settings.bleed === 'bleed' ? 'Enabled' : 'Disabled'} · Interior: ${result.settings.interior.replace('-', ' ')}`} />
          {result.spineWidthIn !== null && result.settings.bookType !== 'kindle' && (
            <CheckRow text={`Estimated spine width: ${result.spineWidthIn.toFixed(3)}"`} />
          )}
          <CheckRow text={`Score: ${result.score}/100 — ${result.verdict}`} />
          {mustFix.length > 0 && <CheckRow text={`${mustFix.length} must-fix issue${mustFix.length > 1 ? 's' : ''} with exact fix instructions`} />}
          {shouldFix.length > 0 && <CheckRow text={`${shouldFix.length} should-fix item${shouldFix.length > 1 ? 's' : ''}`} />}
          {result.colorRisk && result.settings.bookType !== 'kindle' && (
            <CheckRow text={`Color & print risk: ${result.colorRisk.riskLevel} — ${result.colorRisk.riskSummary}`} />
          )}
          <CheckRow text="Re-upload checklist for when you've made fixes" />
          <CheckRow text="Step-by-step instructions for Canva, InDesign, Affinity, Photoshop" />
          {previousResult && (
            <CheckRow text={`Improvement from previous check: ${result.score - previousResult.score > 0 ? '+' : ''}${result.score - previousResult.score} points`} />
          )}
        </div>
      </motion.div>

      {/* Primary CTA */}
      <motion.div
        className="mb-6 space-y-3"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <button
          type="button"
          onClick={handleDownload}
          className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-[#df8e51] px-8 py-4 text-base font-semibold text-white shadow-lg shadow-[#df8e51]/25 transition-all hover:bg-[#c2410c] hover:shadow-xl active:scale-[0.98]"
        >
          <Download className="h-5 w-5" />
          Download KDP Review Report (.html)
        </button>

        <button
          type="button"
          onClick={handleCopyChecklist}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-black/10 bg-white py-3 text-sm font-medium text-black/60 hover:bg-black/2"
        >
          {copied ? <Check className="h-4 w-4 text-[#059669]" /> : <Copy className="h-4 w-4" />}
          {copied ? 'Checklist copied!' : 'Copy checklist to clipboard'}
        </button>
      </motion.div>

      {/* Re-upload & recheck */}
      {hasIssues && (
        <motion.div
          className="mb-6 rounded-2xl border border-[#df8e51]/20 bg-[#df8e51]/4 p-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          <p className="mb-1 text-sm font-semibold text-[#0f172a]">Fixed your issues?</p>
          <p className="mb-4 text-sm text-black/55">
            Re-upload your corrected file to see your new score and confirm all issues are resolved.
          </p>
          <button
            type="button"
            onClick={onRecheck}
            className="flex items-center gap-2 rounded-xl bg-[#df8e51] px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-[#df8e51]/20 hover:bg-[#c2410c] active:scale-[0.98]"
          >
            <RefreshCw className="h-4 w-4" />
            Re-upload &amp; recheck
          </button>
        </motion.div>
      )}

      {/* What to do next */}
      {hasIssues && (
        <motion.div
          className="mb-8 rounded-2xl border border-black/7 bg-white p-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-black/35">What to do next</p>
          <ol className="space-y-2">
            {mustFix.length > 0 && (
              <li className="flex gap-3 text-sm">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-[10px] font-bold text-red-600">1</span>
                <span className="text-black/70">Fix the <strong className="text-[#0f172a]">{mustFix.length} Must Fix</strong> issue{mustFix.length > 1 ? 's' : ''} using the fix guide instructions.</span>
              </li>
            )}
            {shouldFix.length > 0 && (
              <li className="flex gap-3 text-sm">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-[10px] font-bold text-amber-600">{mustFix.length > 0 ? 2 : 1}</span>
                <span className="text-black/70">Review the <strong className="text-[#0f172a]">{shouldFix.length} Should Fix</strong> item{shouldFix.length > 1 ? 's' : ''}.</span>
              </li>
            )}
            <li className="flex gap-3 text-sm">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#df8e51]/15 text-[10px] font-bold text-[#df8e51]">{mustFix.length + (shouldFix.length > 0 ? 1 : 0) + 1}</span>
              <span className="text-black/70">
                Click <strong className="text-[#0f172a]">Re-upload &amp; recheck</strong> above to confirm fixes are working.
              </span>
            </li>
          </ol>
        </motion.div>
      )}

      {/* Start over */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={onStartOver}
          className="flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium text-black/40 hover:bg-black/3 hover:text-black/60"
        >
          <RotateCcw className="h-4 w-4" /> Check a different file
        </button>
      </div>
    </div>
  )
}
