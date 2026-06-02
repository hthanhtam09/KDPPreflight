import type React from 'react';
import { Label } from './shared';

const Card = ({ x, y, w = 150, h = 74, label, tone = 'primary' }: { x: number; y: number; w?: number; h?: number; label: string; tone?: 'primary' | 'success' | 'danger' | 'warning' }) => {
  const color = tone === 'success' ? 'var(--success)' : tone === 'danger' ? 'var(--danger)' : tone === 'warning' ? 'var(--warning)' : 'var(--primary)';
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={14} fill="var(--card)" stroke={color} strokeWidth={2.4} />
      <text x={x + w / 2} y={y + h / 2 + 5} textAnchor="middle" fill={color} fontSize={12} fontWeight={950}>{label}</text>
    </g>
  );
};

const PageShell = ({ x, y, w = 150, h = 214, danger = false }: { x: number; y: number; w?: number; h?: number; danger?: boolean }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx={13} fill="var(--card)" stroke={danger ? 'var(--danger)' : 'var(--border)'} strokeWidth={2.6} />
    <rect x={x + 16} y={y + 16} width={w - 32} height={h - 32} rx={8} fill="transparent" stroke="var(--success)" strokeDasharray="7 6" strokeWidth={2} />
    <rect x={x + 36} y={y + 48} width={w - 72} height={10} rx={5} fill="var(--foreground)" opacity={danger ? 0.52 : 0.18} />
    <rect x={x + 36} y={y + 72} width={w - 90} height={8} rx={4} fill="var(--muted-foreground)" opacity={0.22} />
  </g>
);

export function PdfRequirementsValidationPipeline() {
  const steps = ['upload', 'structure', 'dimensions', 'bleed', 'preview', 'review'];
  return (
    <g>
      <Label x={224} y={46}>KDP PDF validation pipeline</Label>
      {steps.map((step, i) => {
        const x = 48 + i * 122;
        return (
          <g key={step}>
            <rect x={x} y={146} width={94} height={72} rx={15} fill="var(--card)" stroke={i === 2 || i === 3 ? 'var(--warning)' : 'var(--primary)'} strokeWidth={2.4} />
            <text x={x + 47} y={187} textAnchor="middle" fill="var(--foreground)" fontSize={10.5} fontWeight={950}>{step}</text>
            {i < steps.length - 1 && <path d={`M${x + 102} 182h16m-6-6 6 6-6 6`} fill="none" stroke="var(--primary)" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" opacity={0.68} />}
          </g>
        );
      })}
      <rect x={180} y={300} width={440} height={42} rx={14} fill="color-mix(in srgb, var(--primary) 8%, var(--card))" stroke="var(--primary)" strokeWidth={2} />
      <text x={400} y={326} textAnchor="middle" fill="var(--foreground)" fontSize={13} fontWeight={900}>a PDF must pass more than “opens correctly”</text>
    </g>
  );
}

export function ManuscriptPdfRequirementsMap() {
  return (
    <g>
      <Label x={214} y={46}>manuscript PDF requirements</Label>
      <PageShell x={314} y={86} w={172} h={260} />
      <rect x={330} y={102} width={140} height={228} rx={8} fill="transparent" stroke="var(--warning)" strokeDasharray="6 6" strokeWidth={2} />
      <rect x={354} y={134} width={92} height={158} rx={7} fill="transparent" stroke="var(--success)" strokeDasharray="7 6" strokeWidth={2.4} />
      <Card x={86} y={112} label="trim size" />
      <Card x={86} y={218} label="gutter" tone="warning" />
      <Card x={564} y={112} label="margins" tone="success" />
      <Card x={564} y={218} label="page count" />
      <rect x={220} y={376} width={360} height={34} rx={12} fill="color-mix(in srgb, var(--success) 8%, var(--card))" stroke="var(--success)" strokeWidth={2} />
      <text x={400} y={398} textAnchor="middle" fill="var(--success)" fontSize={12} fontWeight={950}>interior pages must match the selected print setup</text>
    </g>
  );
}

export function CoverPdfRequirementsMap() {
  return (
    <g>
      <Label x={238} y={46}>cover PDF requirements</Label>
      <rect x={86} y={118} width={628} height={206} rx={22} fill="color-mix(in srgb, var(--danger) 5%, transparent)" stroke="var(--danger)" strokeDasharray="10 8" strokeWidth={2.6} />
      <rect x={116} y={148} width={568} height={146} rx={18} fill="var(--card)" stroke="var(--border)" strokeWidth={2.8} />
      <rect x={130} y={164} width={206} height={114} rx={12} fill="color-mix(in srgb, var(--muted) 62%, transparent)" stroke="var(--success)" strokeDasharray="7 6" strokeWidth={2} />
      <rect x={356} y={148} width={88} height={146} fill="color-mix(in srgb, var(--primary) 13%, transparent)" stroke="var(--primary)" strokeWidth={2.5} />
      <rect x={464} y={164} width={170} height={114} rx={12} fill="transparent" stroke="var(--success)" strokeDasharray="7 6" strokeWidth={2} />
      <rect x={596} y={236} width={60} height={38} rx={6} fill="color-mix(in srgb, var(--danger) 10%, var(--card))" stroke="var(--danger)" strokeWidth={2} />
      <text x={233} y={230} textAnchor="middle" fill="var(--foreground)" fontSize={14} fontWeight={950}>back</text>
      <text x={400} y={232} textAnchor="middle" fill="var(--primary)" fontSize={12} fontWeight={950} transform="rotate(-90 400 232)">spine</text>
      <text x={549} y={230} textAnchor="middle" fill="var(--foreground)" fontSize={14} fontWeight={950}>front</text>
      <text x={626} y={259} textAnchor="middle" fill="var(--danger)" fontSize={9.5} fontWeight={950}>barcode</text>
    </g>
  );
}

export function TrimSizeRequirementComparison() {
  const sizes = [
    ['6 x 9', 92, 128, 98, 146],
    ['7 x 10', 236, 112, 112, 160],
    ['8 x 10', 394, 112, 128, 160],
    ['8.5 x 11', 568, 92, 136, 184],
  ] as const;
  return (
    <g>
      <Label x={232} y={46}>common KDP trim sizes</Label>
      {sizes.map(([label, x, y, w, h]) => (
        <g key={label}>
          <rect x={x} y={y} width={w} height={h} rx={12} fill="var(--card)" stroke="var(--primary)" strokeWidth={2.5} />
          <rect x={x + 12} y={y + 12} width={w - 24} height={h - 24} rx={7} fill="transparent" stroke="var(--success)" strokeDasharray="6 5" strokeWidth={1.8} />
          <text x={x + w / 2} y={324} textAnchor="middle" fill="var(--foreground)" fontSize={13} fontWeight={950}>{label}</text>
        </g>
      ))}
      <text x={400} y={382} textAnchor="middle" fill="var(--muted-foreground)" fontSize={12} fontWeight={850}>the PDF page size must match the trim selected in KDP</text>
    </g>
  );
}

export function BleedRequirementComparison() {
  return (
    <g>
      <Label x={236} y={46}>bleed requirements</Label>
      <rect x={126} y={102} width={194} height={252} rx={18} fill="var(--card)" stroke="var(--border)" strokeWidth={2.5} />
      <rect x={160} y={138} width={126} height={180} rx={10} fill="transparent" stroke="var(--success)" strokeDasharray="7 6" strokeWidth={2} />
      <text x={223} y={386} textAnchor="middle" fill="var(--foreground)" fontSize={13} fontWeight={950}>no bleed</text>
      <rect x={486} y={82} width={218} height={292} rx={20} fill="color-mix(in srgb, var(--primary) 12%, transparent)" stroke="var(--danger)" strokeDasharray="10 8" strokeWidth={2.6} />
      <rect x={520} y={116} width={150} height={224} rx={12} fill="var(--card)" stroke="var(--success)" strokeWidth={2.4} />
      <text x={595} y={386} textAnchor="middle" fill="var(--danger)" fontSize={13} fontWeight={950}>bleed extends outward</text>
      <path d="M354 222h96m-16-14 16 14-16 14" fill="none" stroke="var(--primary)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

export function SafeAreaRequirementExample() {
  return (
    <g>
      <Label x={238} y={46}>safe area requirements</Label>
      <PageShell x={146} y={112} w={150} h={214} danger />
      <rect x={164} y={284} width={96} height={10} rx={5} fill="var(--danger)" opacity={0.8} />
      <Card x={108} y={354} w={226} h={34} label="too close to trim" tone="danger" />
      <path d="M346 216h108m-18-14 18 14-18 14" fill="none" stroke="var(--primary)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      <PageShell x={514} y={112} w={150} h={214} />
      <rect x={558} y={238} width={62} height={10} rx={5} fill="var(--success)" opacity={0.75} />
      <Card x={480} y={354} w={220} h={34} label="inside safe area" tone="success" />
    </g>
  );
}

export function ImageResolutionRequirement() {
  return (
    <g>
      <Label x={230} y={46}>image resolution requirements</Label>
      <rect x={104} y={116} width={240} height={184} rx={18} fill="var(--card)" stroke="var(--danger)" strokeWidth={2.5} />
      {[0, 1, 2, 3].map((row) => [0, 1, 2, 3].map((col) => <rect key={`${row}-${col}`} x={136 + col * 34} y={146 + row * 28} width={26} height={22} rx={4} fill="var(--danger)" opacity={0.18 + row * 0.06} />))}
      <text x={224} y={334} textAnchor="middle" fill="var(--danger)" fontSize={13} fontWeight={950}>low DPI</text>
      <rect x={456} y={116} width={240} height={184} rx={18} fill="var(--card)" stroke="var(--success)" strokeWidth={2.5} />
      <path d="M506 226c30-58 82-58 120 0" fill="none" stroke="var(--success)" strokeWidth={4} strokeLinecap="round" />
      <rect x={518} y={154} width={116} height={14} rx={7} fill="var(--foreground)" opacity={0.18} />
      <text x={576} y={334} textAnchor="middle" fill="var(--success)" fontSize={13} fontWeight={950}>print-ready detail</text>
    </g>
  );
}

export function FontEmbeddingRequirement() {
  return (
    <g>
      <Label x={248} y={46}>font requirements</Label>
      <rect x={110} y={116} width={250} height={194} rx={18} fill="var(--card)" stroke="var(--danger)" strokeWidth={2.5} />
      <text x={235} y={190} textAnchor="middle" fill="var(--danger)" fontSize={38} fontWeight={950}>Aa?</text>
      <text x={235} y={238} textAnchor="middle" fill="var(--muted-foreground)" fontSize={12} fontWeight={850}>font missing</text>
      <path d="M386 212h54m-14-12 14 12-14 12" fill="none" stroke="var(--primary)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      <rect x={470} y={116} width={250} height={194} rx={18} fill="var(--card)" stroke="var(--success)" strokeWidth={2.5} />
      <text x={595} y={190} textAnchor="middle" fill="var(--success)" fontSize={38} fontWeight={950}>Aa</text>
      <text x={595} y={238} textAnchor="middle" fill="var(--muted-foreground)" fontSize={12} fontWeight={850}>embedded in PDF</text>
      <Card x={266} y={360} w={268} h={34} label="embed or safely outline fonts" tone="success" />
    </g>
  );
}

export function ColorPrintRequirement() {
  return (
    <g>
      <Label x={230} y={46}>color and print requirements</Label>
      <rect x={98} y={114} width={188} height={188} rx={20} fill="var(--card)" stroke="var(--primary)" strokeWidth={2.5} />
      <circle cx={164} cy={186} r={38} fill="var(--primary)" opacity={0.72} />
      <circle cx={220} cy={186} r={38} fill="var(--success)" opacity={0.62} />
      <circle cx={192} cy={232} r={38} fill="var(--danger)" opacity={0.42} />
      <text x={192} y={338} textAnchor="middle" fill="var(--primary)" fontSize={13} fontWeight={950}>RGB export</text>
      <rect x={514} y={114} width={188} height={188} rx={20} fill="#171923" stroke="var(--border)" strokeWidth={2.5} />
      <rect x={554} y={158} width={108} height={28} rx={8} fill="#f7f2e8" opacity={0.82} />
      <rect x={554} y={210} width={108} height={28} rx={8} fill="#6b7280" opacity={0.76} />
      <text x={608} y={338} textAnchor="middle" fill="var(--foreground)" fontSize={13} fontWeight={950}>black + grayscale checks</text>
      <Card x={310} y={190} w={180} h={46} label="proof colors" tone="warning" />
    </g>
  );
}

export function FileSizeRequirement() {
  return (
    <g>
      <Label x={250} y={46}>file size requirements</Label>
      <rect x={108} y={120} width={220} height={210} rx={18} fill="var(--card)" stroke="var(--danger)" strokeWidth={2.5} />
      <text x={218} y={180} textAnchor="middle" fill="var(--danger)" fontSize={28} fontWeight={950}>480 MB</text>
      <rect x={150} y={222} width={136} height={18} rx={9} fill="color-mix(in srgb, var(--danger) 18%, transparent)" />
      <rect x={150} y={222} width={128} height={18} rx={9} fill="var(--danger)" opacity={0.7} />
      <path d="M364 224h86m-16-14 16 14-16 14" fill="none" stroke="var(--primary)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      <rect x={492} y={120} width={220} height={210} rx={18} fill="var(--card)" stroke="var(--success)" strokeWidth={2.5} />
      <text x={602} y={180} textAnchor="middle" fill="var(--success)" fontSize={28} fontWeight={950}>96 MB</text>
      <rect x={534} y={222} width={136} height={18} rx={9} fill="color-mix(in srgb, var(--success) 18%, transparent)" />
      <rect x={534} y={222} width={72} height={18} rx={9} fill="var(--success)" opacity={0.75} />
      <text x={602} y={284} textAnchor="middle" fill="var(--muted-foreground)" fontSize={12} fontWeight={850}>optimized, not crushed</text>
    </g>
  );
}

export function ColoringBookPdfRequirement() {
  return (
    <g>
      <Label x={220} y={46}>coloring book PDF requirements</Label>
      <PageShell x={124} y={104} w={164} h={236} />
      <path d="M164 240c22-56 62-56 86 0" fill="none" stroke="var(--foreground)" strokeWidth={3} opacity={0.32} />
      <Card x={84} y={372} w={244} h={34} label="lines inside safe area" tone="success" />
      <PageShell x={516} y={104} w={164} h={236} danger />
      <rect x={536} y={124} width={124} height={196} rx={7} fill="none" stroke="var(--danger)" strokeWidth={3} />
      <Card x={474} y={372} w={250} h={34} label="border too close" tone="danger" />
      <Card x={322} y={198} w={156} h={42} label="check bleed" tone="warning" />
    </g>
  );
}

export function CommonPdfMistakesMap() {
  const items = ['wrong size', 'missing bleed', 'unsafe text', 'low DPI', 'fonts', 'heavy PDF', 'barcode', 'old template'];
  const nodes = items.map((item, i) => {
    const angle = (Math.PI * 2 * i) / items.length - Math.PI / 2;
    const cx = 400 + Math.cos(angle) * 244;
    const cy = 214 + Math.sin(angle) * 136;
    const dx = cx - 400;
    const dy = cy - 214;
    const length = Math.hypot(dx, dy);
    return { item, cx, cy, x1: 400 + (dx / length) * 104, y1: 214 + (dy / length) * 104, x2: 400 + (dx / length) * (length - 78), y2: 214 + (dy / length) * (length - 78) };
  });
  return (
    <g>
      <Label x={248} y={44}>common KDP PDF mistakes</Label>
      {nodes.map(({ item, x1, y1, x2, y2 }) => <path key={`${item}-line`} d={`M${x1} ${y1}L${x2} ${y2}`} stroke="var(--border)" strokeWidth={2} strokeLinecap="round" />)}
      <rect x={300} y={176} width={200} height={70} rx={20} fill="color-mix(in srgb, var(--danger) 10%, var(--card))" stroke="var(--danger)" strokeWidth={3} />
      <text x={400} y={218} textAnchor="middle" fill="var(--danger)" fontSize={17} fontWeight={950}>PDF mistakes</text>
      {nodes.map(({ item, cx, cy }) => <Card key={item} x={cx - 62} y={cy - 18} w={124} h={36} label={item} />)}
    </g>
  );
}

export function PdfValidationWorkflow() {
  const steps = ['dimensions', 'bleed', 'safe area', 'images', 'fonts', 'cover', 'export'];
  const cards = steps.map((step, i) => ({ step, i, x: 84 + (i % 4) * 162, y: i < 4 ? 104 : 268 }));
  return (
    <g>
      <Label x={236} y={42}>manual PDF validation workflow</Label>
      {cards.slice(0, -1).map(({ i, x, y }) => (
        <path key={`${i}-line`} d={i === 3 ? 'M629 156v80H143v32' : `M${x + 124} ${y + 26}h30m-10-10 10 10-10 10`} fill="none" stroke="var(--primary)" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" opacity={0.72} />
      ))}
      {cards.map(({ step, i, x, y }) => <Card key={step} x={x} y={y} w={118} h={52} label={step} tone={i === steps.length - 1 ? 'success' : 'primary'} />)}
      <Card x={300} y={374} w={200} h={34} label="upload verified PDF" tone="success" />
    </g>
  );
}

export function UltimatePdfChecklistDiagram() {
  const items = ['trim', 'bleed', 'margins', 'gutter', 'fonts', 'images', 'cover', 'spine', 'barcode', 'export'];
  return (
    <g>
      <Label x={270} y={44}>ultimate PDF checklist</Label>
      <rect x={154} y={78} width={492} height={332} rx={22} fill="var(--card)" stroke="var(--border)" strokeWidth={3} />
      {items.map((item, i) => {
        const x = i < 5 ? 196 : 430;
        const y = 118 + (i % 5) * 50;
        return (
          <g key={item}>
            <circle cx={x} cy={y} r={12} fill="color-mix(in srgb, var(--success) 14%, transparent)" stroke="var(--success)" strokeWidth={2} />
            <path d={`M${x - 6} ${y}l5 5 10-11`} fill="none" stroke="var(--success)" strokeWidth={2.3} strokeLinecap="round" strokeLinejoin="round" />
            <text x={x + 28} y={y + 5} fill="var(--foreground)" fontSize={13} fontWeight={900}>{item}</text>
          </g>
        );
      })}
      <Card x={260} y={354} w={280} h={34} label="validate before KDP upload" tone="success" />
    </g>
  );
}
