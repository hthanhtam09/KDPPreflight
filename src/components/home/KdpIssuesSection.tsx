import { ArrowRight, Crop, Maximize2, MoveHorizontal, ScanLine, TriangleAlert } from 'lucide-react'
import Link from 'next/link'
import type { ComponentType } from 'react'

interface KdpIssue {
  icon: ComponentType<{ className?: string }>
  badge: string
  status: string
  statusVariant: 'warning' | 'critical' | 'muted'
  title: string
  description: string
}

const issues: KdpIssue[] = [
  {
    icon: Crop,
    badge: 'Bleed',
    status: 'Detected by Preflight',
    statusVariant: 'warning',
    title: 'White edge after upload preview',
    description: 'Artwork stops at the trim line instead of extending into the 0.125" bleed area.',
  },
  {
    icon: Maximize2,
    badge: 'Trim size',
    status: 'Check dimensions',
    statusVariant: 'muted',
    title: 'Cover PDF does not match selected trim',
    description: 'The final PDF dimensions do not match the trim size, bleed, spine, or page count settings.',
  },
  {
    icon: MoveHorizontal,
    badge: 'Spine',
    status: 'Fix before upload',
    statusVariant: 'critical',
    title: 'Spine width shifts after editing page count',
    description: 'Small page count or paper type changes can move the full-wrap cover layout.',
  },
  {
    icon: TriangleAlert,
    badge: 'Safe area',
    status: 'Detected by Preflight',
    statusVariant: 'warning',
    title: 'Text or barcode sits too close to trim',
    description: 'Important content may be cut off if it sits outside the safe area.',
  },
]

function KdpDiagnosticVisual() {
  return (
    <div
      aria-hidden="true"
      className="relative flex h-full min-h-[420px] flex-col overflow-hidden rounded-3xl border border-border bg-secondary/20"
    >
      {/* Technical grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
          backgroundSize: '18px 18px',
        }}
      />

      {/* Header bar */}
      <div className="relative z-10 flex items-center justify-between border-b border-border px-5 py-3.5">
        <span className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-primary/60" />
          KDP Full-Wrap Cover · Preflight Check
        </span>
        <span className="flex items-center gap-1.5 rounded-md border border-warning/30 bg-warning/8 px-2 py-1 font-mono text-[10px] font-bold text-warning">
          <TriangleAlert className="h-2.5 w-2.5" />
          4 issues
        </span>
      </div>

      {/* SVG diagram */}
      <div className="relative flex flex-1 items-center justify-center px-5 pb-14 pt-6">
        <svg
          viewBox="0 0 520 290"
          className="h-full w-full max-h-[280px]"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* ── Bleed outer boundary ── */}
          <rect
            x="6" y="6" width="508" height="278"
            fill="none"
            stroke="#ef4444"
            strokeWidth="1.2"
            strokeDasharray="5 3"
            opacity="0.4"
          />

          {/* ── Cover fill zones ── */}
          {/* Back cover */}
          <rect x="20" y="20" width="186" height="250" fill="#f1f5f9" />
          {/* Spine */}
          <rect
            x="206" y="20" width="48" height="250"
            fill="rgba(223,142,81,0.07)"
          />
          {/* Front cover */}
          <rect x="254" y="20" width="246" height="250" fill="white" />

          {/* Cover outer trim border */}
          <rect
            x="20" y="20" width="480" height="250"
            fill="none"
            stroke="#cbd5e1"
            strokeWidth="1"
          />

          {/* Spine separator lines */}
          <line x1="206" y1="20" x2="206" y2="270" stroke="rgba(223,142,81,0.4)" strokeWidth="1.2" strokeDasharray="3 3" />
          <line x1="254" y1="20" x2="254" y2="270" stroke="rgba(223,142,81,0.4)" strokeWidth="1.2" strokeDasharray="3 3" />

          {/* ── Safe area (front cover) ── */}
          <rect
            x="266" y="32" width="222" height="226"
            fill="rgba(16,185,129,0.04)"
            stroke="rgba(16,185,129,0.45)"
            strokeWidth="1"
            strokeDasharray="4 2"
          />

          {/* ── Barcode zone (back cover bottom) ── */}
          <rect
            x="114" y="214" width="72" height="44"
            fill="rgba(217,119,6,0.08)"
            stroke="rgba(217,119,6,0.4)"
            strokeWidth="0.8"
            rx="1"
          />
          {/* Barcode stripes */}
          {[0, 5, 9, 14, 18, 22, 27, 31, 36, 40, 44, 49, 53, 57, 62, 66].map((x, i) => (
            <line
              key={i}
              x1={114 + x} y1="222"
              x2={114 + x} y2="248"
              stroke={i % 4 === 0 ? 'rgba(217,119,6,0.55)' : 'rgba(217,119,6,0.25)'}
              strokeWidth={i % 4 === 0 ? 2.2 : 1}
            />
          ))}
          <text x="150" y="256" textAnchor="middle" fontSize="6" fill="rgba(217,119,6,0.7)" fontFamily="monospace">ISBN</text>

          {/* ── Spine content hint ── */}
          <text
            transform="translate(230, 145) rotate(-90)"
            textAnchor="middle"
            fontSize="7"
            fontWeight="700"
            fill="rgba(223,142,81,0.65)"
            fontFamily="monospace"
            letterSpacing="0.08em"
          >
            SPINE
          </text>

          {/* ── Zone labels ── */}
          <text x="113" y="126" textAnchor="middle" fontSize="8" fontWeight="600" fill="rgba(100,116,139,0.65)" fontFamily="monospace" letterSpacing="0.04em">BACK COVER</text>
          <text x="377" y="126" textAnchor="middle" fontSize="8" fontWeight="600" fill="rgba(100,116,139,0.65)" fontFamily="monospace" letterSpacing="0.04em">FRONT COVER</text>

          {/* ── Safe area label ── */}
          <text x="377" y="38" textAnchor="middle" fontSize="6.5" fill="rgba(16,185,129,0.7)" fontFamily="monospace" letterSpacing="0.04em">safe area</text>

          {/* ━━━ Warning markers ━━━ */}

          {/* 1. Bleed missing — top-left trim corner */}
          <circle cx="20" cy="20" r="5" fill="#ef4444" opacity="0.85" />
          <line x1="20" y1="15" x2="20" y2="6" stroke="#ef4444" strokeWidth="1" opacity="0.5" />
          <rect x="26" y="0" width="76" height="14" rx="3" fill="rgba(239,68,68,0.12)" />
          <text x="29" y="10" fontSize="8" fontWeight="700" fill="#ef4444" fontFamily="sans-serif" opacity="0.9">bleed missing</text>

          {/* 2. Spine shifted — top of spine */}
          <circle cx="230" cy="20" r="5" fill="#df8e51" opacity="0.85" />
          <line x1="230" y1="15" x2="230" y2="6" stroke="#df8e51" strokeWidth="1" opacity="0.5" />
          <rect x="188" y="0" width="78" height="14" rx="3" fill="rgba(223,142,81,0.12)" />
          <text x="191" y="10" fontSize="8" fontWeight="700" fill="#df8e51" fontFamily="sans-serif" opacity="0.9">spine shifted</text>

          {/* 3. Text near trim — right side of front cover */}
          <circle cx="500" cy="140" r="5" fill="#df8e51" opacity="0.85" />
          <line x1="495" y1="140" x2="484" y2="140" stroke="#df8e51" strokeWidth="1" opacity="0.5" />
          <rect x="400" y="130" width="82" height="14" rx="3" fill="rgba(223,142,81,0.12)" />
          <text x="403" y="140.5" fontSize="8" fontWeight="700" fill="#df8e51" fontFamily="sans-serif" opacity="0.9">text near trim</text>

          {/* 4. Barcode risk — back cover barcode */}
          <circle cx="114" cy="218" r="5" fill="#df8e51" opacity="0.85" />
          <line x1="109" y1="221" x2="94" y2="232" stroke="#df8e51" strokeWidth="1" opacity="0.5" />
          <rect x="24" y="256" width="72" height="14" rx="3" fill="rgba(223,142,81,0.12)" />
          <text x="27" y="266" fontSize="8" fontWeight="700" fill="#df8e51" fontFamily="sans-serif" opacity="0.9">barcode risk</text>

          {/* ── Bleed measurement annotation ── */}
          <line x1="6" y1="282" x2="20" y2="282" stroke="rgba(239,68,68,0.45)" strokeWidth="1" />
          <line x1="6" y1="279" x2="6" y2="285" stroke="rgba(239,68,68,0.45)" strokeWidth="1" />
          <line x1="20" y1="279" x2="20" y2="285" stroke="rgba(239,68,68,0.45)" strokeWidth="1" />
          <text x="13" y="292" textAnchor="middle" fontSize="6.5" fill="rgba(239,68,68,0.6)" fontFamily="monospace">.125"</text>

          {/* ── Spine width annotation ── */}
          <line x1="206" y1="274" x2="254" y2="274" stroke="rgba(223,142,81,0.45)" strokeWidth="1" />
          <line x1="206" y1="271" x2="206" y2="277" stroke="rgba(223,142,81,0.45)" strokeWidth="1" />
          <line x1="254" y1="271" x2="254" y2="277" stroke="rgba(223,142,81,0.45)" strokeWidth="1" />
          <text x="230" y="285" textAnchor="middle" fontSize="6.5" fill="rgba(223,142,81,0.7)" fontFamily="monospace">spine width</text>
        </svg>
      </div>

      {/* Footer status strip */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-border bg-surface/70 px-5 py-2.5 backdrop-blur-sm">
        <p className="text-center text-[11px] text-muted-foreground">
          Cover can look correct in Canva, Acrobat, or Preview — and still fail KDP's checks
        </p>
      </div>
    </div>
  )
}

function KdpIssueCard({ issue }: { issue: KdpIssue }) {
  const Icon = issue.icon
  const statusClass =
    issue.statusVariant === 'critical'
      ? 'ds-status-critical'
      : issue.statusVariant === 'warning'
        ? 'ds-status-warning'
        : ''
  const statusStyle =
    issue.statusVariant === 'muted'
      ? 'text-[10px] font-semibold text-muted-foreground'
      : `${statusClass} rounded-full border px-2 py-0.5 text-[10px] font-bold`

  return (
    <article className="ds-card ds-card-interactive group flex items-start gap-3.5 p-4 transition-all">
      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-primary/20 bg-primary/8 text-primary transition-colors group-hover:border-primary/35 group-hover:bg-primary/12">
        <Icon className="h-3.5 w-3.5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="rounded-full border border-border bg-secondary/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
            {issue.badge}
          </span>
          <span className={statusStyle}>{issue.status}</span>
        </div>
        <h3 className="mt-1.5 text-[13.5px] font-semibold leading-snug tracking-[-0.01em] text-foreground">
          {issue.title}
        </h3>
        <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
          {issue.description}
        </p>
      </div>
    </article>
  )
}

export default function KdpIssuesSection() {
  return (
    <section className="ds-section px-4 py-12 sm:py-16 lg:py-20 sm:px-6" aria-labelledby="kdp-issues-heading">
      <div className="mx-auto max-w-7xl">
        {/* Section header */}
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <p className="ds-eyebrow mb-4">Hidden cover issues</p>
          <h2
            id="kdp-issues-heading"
            className="ds-heading text-balance text-3xl sm:text-[44px]"
          >
            KDP cover issues your file can hide
          </h2>
          <p className="ds-body mx-auto mt-5 max-w-2xl text-base">
            Your cover can look correct in Canva, Acrobat, Photoshop, or Preview — but still fail
            when KDP checks bleed, trim size, spine width, and safe area.
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-stretch xl:grid-cols-[1.1fr_0.9fr]">
          {/* Left: diagnostic visual */}
          <KdpDiagnosticVisual />

          {/* Right: compact issue list */}
          <div className="flex flex-col gap-3">
            {issues.map((issue) => (
              <KdpIssueCard key={issue.title} issue={issue} />
            ))}

            {/* Inline CTA at bottom of issue list */}
            <div className="mt-1 rounded-2xl border border-border bg-secondary/30 p-5">
              <p className="text-[13.5px] font-semibold text-foreground">
                Check these issues before uploading to KDP.
              </p>
              <p className="mt-1 text-[12px] text-muted-foreground">
                Run a free check on your cover PDF — takes under a minute.
              </p>
              <div className="mt-4 flex flex-wrap gap-2.5">
                <Link
                  href="/checker"
                  className="ds-button-primary inline-flex min-h-9 items-center gap-2 rounded-xl px-4 text-[13px] font-bold transition hover:-translate-y-px active:translate-y-px"
                >
                  <ScanLine className="h-3.5 w-3.5" />
                  Run free cover check
                </Link>
                <Link
                  href="/blog/why-amazon-rejected-your-kdp-cover"
                  className="ds-button-secondary inline-flex min-h-9 items-center gap-2 rounded-xl px-4 text-[13px] font-bold transition hover:-translate-y-px hover:border-primary/30 active:translate-y-px"
                >
                  KDP rejection guide
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
