import type React from 'react';
import type { BlogCategory } from '@/lib/blog';

export type BlogPostVisualProps = {
  postSlug: string;
  category: BlogCategory;
  variant?: 'card' | 'featured' | 'article';
};

export function BlogPostVisual({ postSlug, category, variant = 'card' }: BlogPostVisualProps) {
  const isArticle = variant === 'article';
  const isFeatured = variant === 'featured';

  return (
    <div
      aria-hidden="true"
      className={`relative h-full min-h-full overflow-hidden bg-muted/25 ${
        isArticle ? 'aspect-[16/9] rounded-2xl border border-border shadow-card' : ''
      }`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_12%,color-mix(in_srgb,var(--primary)_18%,transparent),transparent_34%),linear-gradient(90deg,color-mix(in_srgb,var(--foreground)_6%,transparent)_1px,transparent_1px),linear-gradient(0deg,color-mix(in_srgb,var(--foreground)_5%,transparent)_1px,transparent_1px)] bg-[length:auto,28px_28px,28px_28px]" />
      <svg viewBox="0 0 800 450" className="relative h-full w-full">
        <defs>
          <filter id={`sketch-${postSlug}-${variant}`} x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="1" seed="12" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale={isFeatured || isArticle ? '1.6' : '1'} />
          </filter>
        </defs>
        <rect width="800" height="450" fill="transparent" />
        <g filter={`url(#sketch-${postSlug}-${variant})`}>
          <VisualBySlug slug={postSlug} />
        </g>
      </svg>
      {(isFeatured || isArticle) && (
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-4 rounded-xl border border-border bg-card/78 px-4 py-3 text-xs font-bold text-muted-foreground backdrop-blur">
          <span>{visualLabel(postSlug)}</span>
          <span className="h-px flex-1 bg-border" />
          <span>KDP preflight visual</span>
        </div>
      )}
    </div>
  );
}

function visualLabel(slug: string) {
  const labels: Record<string, string> = {
    'why-amazon-rejected-your-kdp-cover': 'Rejected upload + warning zones',
    'fix-elements-outside-printable-area-kdp': 'Printable area warning',
    'kdp-bleed-explained': 'Bleed / trim / safe layers',
    'fix-kdp-bleed-issues': 'Missing bleed before and after',
    'calculate-kdp-spine-width': 'Full wrap spine calculation',
    'kdp-spine-text-misaligned': 'Shifted spine text comparison',
    'kdp-safe-area-guide': 'Safe title placement',
    'best-pdf-export-settings-kdp': 'Print-ready PDF checklist',
    'export-kdp-cover-from-canva': 'Canva export workflow',
    'setup-kdp-cover-photoshop': 'Photoshop guide layout',
    'kdp-trim-size-guide': 'Paperback trim size comparison',
    'beginners-guide-kdp-cover-formatting': 'Complete cover anatomy',
    'kdp-cover-dimensions-explained': 'Full cover dimension math',
    'kdp-hardcover-cover-requirements': 'Hardcover wrap and hinge layout',
  };
  return labels[slug] ?? 'KDP cover guide';
}

function VisualBySlug({ slug }: { slug: string }) {
  if (slug === 'why-amazon-rejected-your-kdp-cover') return <RejectedUpload />;
  if (slug === 'fix-elements-outside-printable-area-kdp') return <PrintableArea />;
  if (slug === 'kdp-bleed-explained') return <BleedLayers />;
  if (slug === 'fix-kdp-bleed-issues') return <MissingBleed />;
  if (slug === 'calculate-kdp-spine-width') return <SpineCalc />;
  if (slug === 'kdp-spine-text-misaligned') return <SpineShift />;
  if (slug === 'kdp-safe-area-guide') return <SafeArea />;
  if (slug === 'best-pdf-export-settings-kdp') return <PdfSettings />;
  if (slug === 'export-kdp-cover-from-canva') return <CanvaFlow />;
  if (slug === 'setup-kdp-cover-photoshop') return <PhotoshopLayout />;
  if (slug === 'kdp-trim-size-guide') return <TrimSizes />;
  if (slug === 'kdp-cover-dimensions-explained') return <CoverAnatomy />;
  if (slug === 'kdp-hardcover-cover-requirements') return <HardcoverVisual />;
  return <CoverAnatomy />;
}

function T({ x, y, children, fill = 'var(--foreground)' }: { x: number; y: number; children: React.ReactNode; fill?: string }) {
  return <text x={x} y={y} fill={fill} fontSize="20" fontWeight="850">{children}</text>;
}

function RejectedUpload() {
  return (
    <>
      <rect x="170" y="75" width="460" height="295" rx="24" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <rect x="170" y="75" width="460" height="62" rx="24" fill="color-mix(in srgb, var(--danger) 12%, transparent)" />
      <circle cx="222" cy="106" r="19" fill="color-mix(in srgb, var(--danger) 16%, transparent)" stroke="var(--danger)" strokeWidth="3" />
      <T x={216} y={114} fill="var(--danger)">!</T>
      <T x={255} y={114}>Upload rejected</T>
      <rect x="220" y="168" width="170" height="150" rx="12" fill="var(--surface)" stroke="var(--danger)" strokeDasharray="7 7" strokeWidth="3" />
      <rect x="420" y="168" width="130" height="20" rx="8" fill="var(--foreground)" opacity=".16" />
      <rect x="420" y="210" width="160" height="16" rx="8" fill="var(--danger)" opacity=".34" />
      <rect x="420" y="248" width="120" height="16" rx="8" fill="var(--primary)" opacity=".42" />
      <circle cx="390" cy="160" r="15" fill="var(--danger)" opacity=".85" />
      <circle cx="221" cy="323" r="15" fill="var(--danger)" opacity=".85" />
    </>
  );
}

function PrintableArea() {
  return (
    <>
      <rect x="265" y="64" width="270" height="330" rx="20" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <rect x="305" y="106" width="190" height="245" rx="12" fill="color-mix(in srgb, var(--success) 10%, transparent)" stroke="var(--success)" strokeDasharray="8 8" strokeWidth="3" />
      <rect x="236" y="150" width="160" height="42" rx="10" fill="color-mix(in srgb, var(--danger) 14%, transparent)" stroke="var(--danger)" strokeWidth="3" />
      <T x={268} y={178} fill="var(--danger)">TEXT</T>
      <T x={548} y={235} fill="var(--danger)">trim warning</T>
    </>
  );
}

function BleedLayers() {
  return (
    <>
      <rect x="245" y="50" width="310" height="350" rx="20" fill="color-mix(in srgb, var(--danger) 10%, transparent)" stroke="var(--danger)" strokeDasharray="10 8" strokeWidth="3" />
      <rect x="283" y="88" width="234" height="274" rx="14" fill="var(--card)" stroke="var(--primary)" strokeWidth="3" />
      <rect x="330" y="138" width="140" height="172" rx="10" fill="color-mix(in srgb, var(--success) 10%, transparent)" stroke="var(--success)" strokeDasharray="7 7" strokeWidth="3" />
      <T x={220} y={82} fill="var(--danger)">bleed</T>
      <T x={525} y={134} fill="var(--primary)">trim</T>
      <T x={350} y={225} fill="var(--success)">safe</T>
    </>
  );
}

function MissingBleed() {
  return (
    <>
      <T x={155} y={82}>before</T>
      <T x={510} y={82}>after</T>
      <rect x="115" y="112" width="220" height="260" rx="18" fill="var(--card)" stroke="var(--danger)" strokeWidth="3" />
      <rect x="116" y="113" width="218" height="258" rx="16" fill="color-mix(in srgb, var(--primary) 16%, transparent)" />
      <rect x="465" y="92" width="270" height="300" rx="18" fill="color-mix(in srgb, var(--danger) 10%, transparent)" stroke="var(--danger)" strokeDasharray="8 8" strokeWidth="3" />
      <rect x="488" y="116" width="224" height="252" rx="16" fill="color-mix(in srgb, var(--primary) 18%, transparent)" stroke="var(--primary)" strokeWidth="3" />
    </>
  );
}

function SpineCalc() {
  return (
    <>
      <rect x="105" y="126" width="590" height="210" rx="18" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <rect x="105" y="126" width="252" height="210" rx="18" fill="color-mix(in srgb, var(--muted) 70%, transparent)" />
      <rect x="357" y="126" width="86" height="210" fill="color-mix(in srgb, var(--primary) 22%, transparent)" stroke="var(--primary)" strokeWidth="3" />
      <T x={373} y={236}>spine</T>
      <path d="M250 378h300" stroke="var(--primary)" strokeWidth="4" />
      <T x={220} y={410}>page count + paper type</T>
    </>
  );
}

function SpineShift() {
  return (
    <>
      <rect x="145" y="100" width="210" height="260" rx="16" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <rect x="230" y="100" width="42" height="260" fill="color-mix(in srgb, var(--danger) 15%, transparent)" stroke="var(--danger)" strokeWidth="3" />
      <text x="250" y="285" textAnchor="middle" fill="var(--danger)" fontSize="18" fontWeight="900" transform="rotate(-90 250 285)">SHIFT</text>
      <rect x="455" y="100" width="210" height="260" rx="16" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <rect x="539" y="100" width="42" height="260" fill="color-mix(in srgb, var(--success) 15%, transparent)" stroke="var(--success)" strokeWidth="3" />
      <text x="560" y="292" textAnchor="middle" fill="var(--success)" fontSize="18" fontWeight="900" transform="rotate(-90 560 292)">CENTER</text>
    </>
  );
}

function SafeArea() {
  return (
    <>
      <rect x="270" y="60" width="260" height="330" rx="20" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <rect x="318" y="112" width="164" height="226" rx="12" fill="color-mix(in srgb, var(--success) 10%, transparent)" stroke="var(--success)" strokeDasharray="7 7" strokeWidth="3" />
      <rect x="342" y="154" width="116" height="32" rx="9" fill="var(--foreground)" opacity=".16" />
      <rect x="348" y="210" width="104" height="18" rx="9" fill="var(--primary)" opacity=".5" />
      <T x={325} y={100} fill="var(--success)">safe zone</T>
    </>
  );
}

function PdfSettings() {
  const rows = ['PDF Print', 'embed fonts', '300 DPI', 'include bleed'];
  return (
    <>
      <rect x="220" y="70" width="360" height="310" rx="22" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <T x={270} y={118}>PDF export settings</T>
      {rows.map((row, index) => (
        <g key={row}>
          <rect x="270" y={150 + index * 48} width="260" height="32" rx="10" fill="color-mix(in srgb, var(--muted) 70%, transparent)" />
          <circle cx="292" cy={166 + index * 48} r="9" fill="var(--success)" opacity=".75" />
          <text x="318" y={172 + index * 48} fill="var(--foreground)" fontSize="16" fontWeight="750">{row}</text>
        </g>
      ))}
    </>
  );
}

function CanvaFlow() {
  const steps = ['size', 'bleed', 'PDF', 'check'];
  return (
    <>
      {steps.map((step, index) => {
        const x = 105 + index * 170;
        return (
          <g key={step}>
            <rect x={x} y="180" width="120" height="78" rx="16" fill="var(--card)" stroke="var(--primary)" strokeWidth="3" />
            <T x={x + 32} y={228}>{step}</T>
            {index < steps.length - 1 ? <path d={`M${x + 130} 219h35`} stroke="var(--primary)" strokeWidth="3" strokeDasharray="7 7" /> : null}
          </g>
        );
      })}
      <T x={272} y={140}>Canva export flow</T>
    </>
  );
}

function PhotoshopLayout() {
  return (
    <>
      <rect x="115" y="78" width="570" height="300" rx="18" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <rect x="145" y="108" width="510" height="240" rx="12" fill="transparent" stroke="var(--danger)" strokeDasharray="8 8" strokeWidth="3" />
      <rect x="180" y="142" width="440" height="172" rx="10" fill="transparent" stroke="var(--success)" strokeDasharray="7 7" strokeWidth="3" />
      <rect x="380" y="108" width="40" height="240" fill="color-mix(in srgb, var(--primary) 18%, transparent)" stroke="var(--primary)" strokeWidth="3" />
      <T x={245} y={58}>Photoshop guides</T>
    </>
  );
}

function TrimSizes() {
  return (
    <>
      <rect x="130" y="155" width="135" height="205" rx="14" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <rect x="335" y="125" width="155" height="235" rx="14" fill="var(--card)" stroke="var(--primary)" strokeWidth="3" />
      <rect x="555" y="85" width="170" height="275" rx="14" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <T x={168} y={398}>5x8</T>
      <T x={374} y={398}>6x9</T>
      <T x={574} y={398}>8.5x11</T>
    </>
  );
}

function CoverAnatomy() {
  return (
    <>
      <rect x="95" y="92" width="610" height="260" rx="18" fill="color-mix(in srgb, var(--danger) 8%, transparent)" stroke="var(--danger)" strokeDasharray="8 8" strokeWidth="3" />
      <rect x="120" y="117" width="560" height="210" rx="14" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <rect x="120" y="117" width="246" height="210" rx="14" fill="color-mix(in srgb, var(--muted) 70%, transparent)" />
      <rect x="366" y="117" width="68" height="210" fill="color-mix(in srgb, var(--primary) 20%, transparent)" stroke="var(--primary)" strokeWidth="3" />
      <T x={190} y={230}>back</T>
      <T x={383} y={230}>spine</T>
      <T x={525} y={230}>front</T>
    </>
  );
}

function HardcoverVisual() {
  return (
    <>
      <rect x="90" y="94" width="620" height="260" rx="18" fill="color-mix(in srgb, var(--danger) 8%, transparent)" stroke="var(--danger)" strokeDasharray="8 8" strokeWidth="3" />
      <rect x="130" y="120" width="540" height="208" rx="14" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <rect x="360" y="120" width="34" height="208" fill="color-mix(in srgb, var(--warning) 15%, transparent)" stroke="var(--warning)" strokeDasharray="6 6" strokeWidth="2" />
      <rect x="394" y="120" width="56" height="208" fill="color-mix(in srgb, var(--primary) 22%, transparent)" stroke="var(--primary)" strokeWidth="3" />
      <rect x="450" y="120" width="34" height="208" fill="color-mix(in srgb, var(--warning) 15%, transparent)" stroke="var(--warning)" strokeDasharray="6 6" strokeWidth="2" />
      <T x={180} y={232}>back</T>
      <T x={394} y={232}>spine</T>
      <T x={535} y={232}>front</T>
      <T x={315} y={380} fill="var(--warning)">hinge zones</T>
    </>
  );
}
