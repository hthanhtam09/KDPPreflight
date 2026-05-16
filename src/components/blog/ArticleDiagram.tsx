import type React from 'react';

export type ArticleDiagramType =
  | 'bleed-layers'
  | 'printable-area-error'
  | 'cover-rejection-checklist'
  | 'missing-bleed-before-after'
  | 'spine-width'
  | 'spine-misalignment'
  | 'safe-area'
  | 'pdf-export-checklist'
  | 'canva-export-flow'
  | 'photoshop-guides'
  | 'trim-size-comparison'
  | 'cover-anatomy'
  | 'hardcover-cover-layout';

export type ArticleDiagramProps = {
  type: ArticleDiagramType;
  caption?: string;
};

const captions: Record<ArticleDiagramType, string> = {
  'bleed-layers': 'Bleed extends beyond trim; safe area sits inside trim for important content.',
  'printable-area-error': 'Objects near trim or outside safe area are common printable area warning triggers.',
  'cover-rejection-checklist': 'A pre-upload checklist catches the technical issues that often cause cover rejection.',
  'missing-bleed-before-after': 'Extend edge artwork into bleed without moving important content outward.',
  'spine-width': 'A full cover wrap combines back cover, calculated spine, front cover, and bleed.',
  'spine-misalignment': 'Small shifts become obvious when spine text is too close to fold edges.',
  'safe-area': 'Titles, logos, subtitles, and barcode-adjacent content should stay inside safe boundaries.',
  'pdf-export-checklist': 'The exported PDF should preserve dimensions, fonts, image quality, and bleed.',
  'canva-export-flow': 'Canva covers need correct custom size, visible bleed, PDF Print export, and validation.',
  'photoshop-guides': 'Photoshop cover files need manual guides for bleed, trim, safe area, and spine.',
  'trim-size-comparison': 'Trim size changes the physical book, manuscript layout, and full cover wrap.',
  'cover-anatomy': 'A print cover is a production layout: back cover, spine, front cover, bleed, and safe areas.',
  'hardcover-cover-layout': 'Hardcover covers add wrap and hinge zones around the spine and boards.',
};

export function ArticleDiagram({ type, caption }: ArticleDiagramProps) {
  return (
    <figure className="my-8 overflow-hidden rounded-2xl border border-border bg-card shadow-card">
      <div className="relative aspect-[16/9] w-full bg-[linear-gradient(90deg,color-mix(in_srgb,var(--foreground)_5%,transparent)_1px,transparent_1px),linear-gradient(0deg,color-mix(in_srgb,var(--foreground)_5%,transparent)_1px,transparent_1px)] bg-[length:28px_28px]">
        <svg
          viewBox="0 0 800 450"
          role="img"
          aria-label={caption ?? captions[type]}
          className="h-full w-full"
        >
          <defs>
            <filter id={`rough-${type}`} x="-5%" y="-5%" width="110%" height="110%">
              <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="1" seed="8" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.4" />
            </filter>
          </defs>
          <rect width="800" height="450" fill="transparent" />
          <DiagramBody type={type} />
        </svg>
      </div>
      <figcaption className="border-t border-border bg-surface/40 px-5 py-3 text-sm leading-6 text-muted-foreground">
        {caption ?? captions[type]}
      </figcaption>
    </figure>
  );
}

function DiagramBody({ type }: { type: ArticleDiagramType }) {
  if (type === 'bleed-layers') return <BleedLayers />;
  if (type === 'printable-area-error') return <PrintableAreaError />;
  if (type === 'cover-rejection-checklist') return <ChecklistDiagram />;
  if (type === 'missing-bleed-before-after') return <MissingBleed />;
  if (type === 'spine-width') return <SpineWidth />;
  if (type === 'spine-misalignment') return <SpineMisalignment />;
  if (type === 'safe-area') return <SafeArea />;
  if (type === 'pdf-export-checklist') return <PdfChecklist />;
  if (type === 'canva-export-flow') return <CanvaFlow />;
  if (type === 'photoshop-guides') return <PhotoshopGuides />;
  if (type === 'trim-size-comparison') return <TrimComparison />;
  if (type === 'hardcover-cover-layout') return <HardcoverLayout />;
  return <CoverAnatomy />;
}

function Label({ x, y, children }: { x: number; y: number; children: React.ReactNode }) {
  return (
    <text x={x} y={y} fill="var(--foreground)" fontSize="18" fontWeight="700">
      {children}
    </text>
  );
}

function MutedLabel({ x, y, children }: { x: number; y: number; children: React.ReactNode }) {
  return (
    <text x={x} y={y} fill="var(--muted-foreground)" fontSize="14" fontWeight="650">
      {children}
    </text>
  );
}

function BleedLayers() {
  return (
    <g filter="url(#rough-bleed-layers)">
      <rect x="210" y="42" width="380" height="340" rx="18" fill="color-mix(in srgb, var(--danger) 12%, transparent)" stroke="var(--danger)" strokeDasharray="9 9" strokeWidth="3" />
      <rect x="248" y="80" width="304" height="264" rx="14" fill="var(--card)" stroke="var(--primary)" strokeWidth="3" />
      <rect x="300" y="132" width="200" height="160" rx="10" fill="color-mix(in srgb, var(--success) 10%, transparent)" stroke="var(--success)" strokeDasharray="7 7" strokeWidth="3" />
      <Label x={245} y={68}>bleed</Label>
      <Label x={260} y={110}>trim</Label>
      <Label x={318} y={165}>safe area</Label>
      <path d="M590 212h70" stroke="var(--danger)" strokeWidth="3" markerEnd="url(#arrow)" />
      <MutedLabel x={604} y={244}>0.125 inch</MutedLabel>
    </g>
  );
}

function PrintableAreaError() {
  return (
    <g filter="url(#rough-printable-area-error)">
      <rect x="255" y="48" width="290" height="350" rx="18" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <rect x="292" y="86" width="216" height="274" rx="10" fill="color-mix(in srgb, var(--success) 8%, transparent)" stroke="var(--success)" strokeDasharray="8 8" strokeWidth="3" />
      <rect x="236" y="126" width="170" height="38" rx="8" fill="color-mix(in srgb, var(--danger) 12%, transparent)" stroke="var(--danger)" strokeWidth="3" />
      <circle cx="548" cy="314" r="32" fill="color-mix(in srgb, var(--danger) 14%, transparent)" stroke="var(--danger)" strokeWidth="3" />
      <text x="284" y="151" fill="var(--danger)" fontSize="18" fontWeight="800">TITLE</text>
      <text x="540" y="322" fill="var(--danger)" fontSize="22" fontWeight="900">!</text>
      <Label x={258} y={35}>printable area warning</Label>
      <MutedLabel x={315} y={382}>move important elements inward</MutedLabel>
    </g>
  );
}

function ChecklistDiagram() {
  const rows = ['Dimensions match setup', 'Bleed included', 'Text inside safe area', 'Spine recalculated', 'PDF exported cleanly'];
  return (
    <g filter="url(#rough-cover-rejection-checklist)">
      <rect x="170" y="65" width="460" height="312" rx="22" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <rect x="170" y="65" width="460" height="56" rx="22" fill="color-mix(in srgb, var(--primary) 15%, transparent)" />
      <Label x={206} y={102}>KDP cover preflight</Label>
      {rows.map((row, index) => (
        <g key={row} transform={`translate(206 ${150 + index * 40})`}>
          <circle cx="10" cy="0" r="11" fill="color-mix(in srgb, var(--success) 15%, transparent)" stroke="var(--success)" strokeWidth="3" />
          <path d="M4 -1l5 5 9 -12" fill="none" stroke="var(--success)" strokeWidth="3" />
          <text x="34" y="6" fill="var(--foreground)" fontSize="17" fontWeight="700">{row}</text>
        </g>
      ))}
    </g>
  );
}

function MissingBleed() {
  return (
    <g filter="url(#rough-missing-bleed-before-after)">
      <Label x={160} y={54}>before</Label>
      <Label x={500} y={54}>after</Label>
      <rect x="105" y="85" width="230" height="285" rx="18" fill="var(--card)" stroke="var(--danger)" strokeWidth="3" />
      <rect x="107" y="87" width="226" height="281" rx="16" fill="color-mix(in srgb, var(--primary) 13%, transparent)" />
      <rect x="465" y="68" width="270" height="320" rx="18" fill="color-mix(in srgb, var(--danger) 10%, transparent)" stroke="var(--danger)" strokeDasharray="8 8" strokeWidth="3" />
      <rect x="485" y="88" width="230" height="280" rx="16" fill="color-mix(in srgb, var(--primary) 16%, transparent)" stroke="var(--primary)" strokeWidth="3" />
      <MutedLabel x={118} y={398}>art stops at trim</MutedLabel>
      <MutedLabel x={510} y={415}>art extends through bleed</MutedLabel>
    </g>
  );
}

function SpineWidth() {
  return (
    <g filter="url(#rough-spine-width)">
      <rect x="100" y="112" width="600" height="230" rx="18" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <rect x="100" y="112" width="265" height="230" rx="18" fill="color-mix(in srgb, var(--muted) 65%, transparent)" />
      <rect x="365" y="112" width="70" height="230" fill="color-mix(in srgb, var(--primary) 22%, transparent)" stroke="var(--primary)" strokeWidth="3" />
      <rect x="435" y="112" width="265" height="230" rx="18" fill="var(--card)" />
      <Label x={180} y={232}>back</Label>
      <Label x={379} y={232}>spine</Label>
      <Label x={530} y={232}>front</Label>
      <path d="M365 372h70" stroke="var(--primary)" strokeWidth="3" />
      <MutedLabel x={330} y={402}>page count x paper type</MutedLabel>
    </g>
  );
}

function SpineMisalignment() {
  return (
    <g filter="url(#rough-spine-misalignment)">
      <rect x="130" y="100" width="220" height="260" rx="16" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <rect x="222" y="100" width="38" height="260" fill="color-mix(in srgb, var(--danger) 14%, transparent)" stroke="var(--danger)" strokeWidth="3" />
      <text x="241" y="292" textAnchor="middle" fill="var(--danger)" fontSize="17" fontWeight="900" transform="rotate(-90 241 292)">SHIFTED</text>
      <rect x="450" y="100" width="220" height="260" rx="16" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <rect x="541" y="100" width="38" height="260" fill="color-mix(in srgb, var(--success) 14%, transparent)" stroke="var(--success)" strokeWidth="3" />
      <text x="560" y="285" textAnchor="middle" fill="var(--success)" fontSize="17" fontWeight="900" transform="rotate(-90 560 285)">CENTERED</text>
      <Label x={155} y={70}>too tight</Label>
      <Label x={486} y={70}>safe margin</Label>
    </g>
  );
}

function SafeArea() {
  return (
    <g filter="url(#rough-safe-area)">
      <rect x="260" y="55" width="280" height="340" rx="18" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <rect x="312" y="108" width="176" height="234" rx="12" fill="color-mix(in srgb, var(--success) 10%, transparent)" stroke="var(--success)" strokeDasharray="8 8" strokeWidth="3" />
      <rect x="332" y="152" width="136" height="28" rx="8" fill="var(--foreground)" opacity=".16" />
      <rect x="340" y="205" width="120" height="16" rx="8" fill="var(--primary)" opacity=".55" />
      <rect x="350" y="310" width="100" height="18" rx="7" fill="var(--foreground)" opacity=".12" />
      <Label x={330} y={95}>safe area</Label>
      <MutedLabel x={560} y={205}>text stays inside</MutedLabel>
    </g>
  );
}

function PdfChecklist() {
  const items = ['Correct size', 'Bleed included', 'Fonts embedded', 'Images sharp'];
  return (
    <g filter="url(#rough-pdf-export-checklist)">
      <rect x="210" y="58" width="380" height="330" rx="20" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <rect x="250" y="30" width="160" height="56" rx="12" fill="color-mix(in srgb, var(--primary) 15%, transparent)" stroke="var(--primary)" strokeWidth="3" />
      <Label x={287} y={66}>PDF</Label>
      {items.map((item, index) => (
        <g key={item} transform={`translate(270 ${140 + index * 48})`}>
          <rect x="0" y="-18" width="260" height="34" rx="10" fill="color-mix(in srgb, var(--muted) 65%, transparent)" stroke="var(--border)" />
          <circle cx="22" cy="0" r="10" fill="color-mix(in srgb, var(--success) 14%, transparent)" stroke="var(--success)" strokeWidth="2" />
          <text x="48" y="6" fill="var(--foreground)" fontSize="16" fontWeight="750">{item}</text>
        </g>
      ))}
    </g>
  );
}

function CanvaFlow() {
  const steps = ['Custom size', 'Show bleed', 'PDF Print', 'Validate'];
  return (
    <g filter="url(#rough-canva-export-flow)">
      {steps.map((step, index) => {
        const x = 80 + index * 175;
        return (
          <g key={step}>
            <rect x={x} y="170" width="130" height="86" rx="16" fill="var(--card)" stroke={index === 3 ? 'var(--success)' : 'var(--primary)'} strokeWidth="3" />
            <text x={x + 65} y="218" textAnchor="middle" fill="var(--foreground)" fontSize="15" fontWeight="800">{step}</text>
            {index < steps.length - 1 ? <path d={`M${x + 138} 213h42`} stroke="var(--primary)" strokeWidth="3" strokeDasharray="7 7" /> : null}
          </g>
        );
      })}
      <Label x={270} y={125}>Canva export flow</Label>
    </g>
  );
}

function PhotoshopGuides() {
  return (
    <g filter="url(#rough-photoshop-guides)">
      <rect x="110" y="72" width="580" height="306" rx="18" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <rect x="138" y="100" width="524" height="250" rx="12" fill="transparent" stroke="var(--danger)" strokeDasharray="8 8" strokeWidth="3" />
      <rect x="172" y="134" width="456" height="182" rx="8" fill="color-mix(in srgb, var(--success) 8%, transparent)" stroke="var(--success)" strokeDasharray="7 7" strokeWidth="3" />
      <rect x="382" y="100" width="44" height="250" fill="color-mix(in srgb, var(--primary) 18%, transparent)" stroke="var(--primary)" strokeWidth="3" />
      <Label x={142} y={58}>Photoshop guide layout</Label>
      <MutedLabel x={145} y={402}>bleed / trim / spine / safe area</MutedLabel>
    </g>
  );
}

function TrimComparison() {
  return (
    <g filter="url(#rough-trim-size-comparison)">
      <rect x="145" y="150" width="135" height="205" rx="14" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <rect x="335" y="118" width="155" height="237" rx="14" fill="var(--card)" stroke="var(--primary)" strokeWidth="3" />
      <rect x="545" y="82" width="170" height="273" rx="14" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <Label x={172} y={390}>5x8</Label>
      <Label x={372} y={390}>6x9</Label>
      <Label x={570} y={390}>8.5x11</Label>
      <MutedLabel x={250} y={70}>trim size changes the cover math</MutedLabel>
    </g>
  );
}

function CoverAnatomy() {
  return (
    <g filter="url(#rough-cover-anatomy)">
      <rect x="95" y="92" width="610" height="260" rx="18" fill="color-mix(in srgb, var(--danger) 8%, transparent)" stroke="var(--danger)" strokeDasharray="8 8" strokeWidth="3" />
      <rect x="120" y="117" width="560" height="210" rx="14" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <rect x="120" y="117" width="246" height="210" rx="14" fill="color-mix(in srgb, var(--muted) 70%, transparent)" />
      <rect x="366" y="117" width="68" height="210" fill="color-mix(in srgb, var(--primary) 20%, transparent)" stroke="var(--primary)" strokeWidth="3" />
      <rect x="434" y="117" width="246" height="210" rx="14" fill="transparent" />
      <rect x="150" y="150" width="180" height="140" rx="10" fill="transparent" stroke="var(--success)" strokeDasharray="7 7" strokeWidth="3" />
      <rect x="470" y="150" width="175" height="140" rx="10" fill="transparent" stroke="var(--success)" strokeDasharray="7 7" strokeWidth="3" />
      <Label x={190} y={230}>back</Label>
      <Label x={383} y={230}>spine</Label>
      <Label x={525} y={230}>front</Label>
      <MutedLabel x={262} y={382}>full cover anatomy</MutedLabel>
    </g>
  );
}

function HardcoverLayout() {
  return (
    <g filter="url(#rough-hardcover-cover-layout)">
      <rect x="80" y="82" width="640" height="285" rx="18" fill="color-mix(in srgb, var(--danger) 8%, transparent)" stroke="var(--danger)" strokeDasharray="8 8" strokeWidth="3" />
      <rect x="122" y="112" width="556" height="225" rx="14" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <rect x="122" y="112" width="235" height="225" rx="14" fill="color-mix(in srgb, var(--muted) 68%, transparent)" />
      <rect x="357" y="112" width="30" height="225" fill="color-mix(in srgb, var(--warning) 16%, transparent)" stroke="var(--warning)" strokeDasharray="6 6" strokeWidth="2" />
      <rect x="387" y="112" width="48" height="225" fill="color-mix(in srgb, var(--primary) 22%, transparent)" stroke="var(--primary)" strokeWidth="3" />
      <rect x="435" y="112" width="30" height="225" fill="color-mix(in srgb, var(--warning) 16%, transparent)" stroke="var(--warning)" strokeDasharray="6 6" strokeWidth="2" />
      <Label x={170} y={228}>back board</Label>
      <Label x={390} y={228}>spine</Label>
      <Label x={505} y={228}>front board</Label>
      <MutedLabel x={330} y={384}>wrap + hinge zones</MutedLabel>
    </g>
  );
}
