import type React from 'react';
import { Label } from './shared';

const Box = ({ x, y, w = 132, h = 58, label, tone = 'primary' }: { x: number; y: number; w?: number; h?: number; label: string; tone?: 'primary' | 'success' | 'danger' | 'warning' }) => {
  const color = tone === 'success' ? 'var(--success)' : tone === 'danger' ? 'var(--danger)' : tone === 'warning' ? 'var(--warning)' : 'var(--primary)';
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={14} fill="var(--card)" stroke={color} strokeWidth={2.4} />
      <text x={x + w / 2} y={y + h / 2 + 5} textAnchor="middle" fill={color} fontSize={11.5} fontWeight={950}>{label}</text>
    </g>
  );
};

const Check = ({ x, y }: { x: number; y: number }) => (
  <g>
    <circle cx={x} cy={y} r={11} fill="color-mix(in srgb, var(--success) 14%, transparent)" stroke="var(--success)" strokeWidth={2} />
    <path d={`M${x - 6} ${y}l5 5 10-11`} fill="none" stroke="var(--success)" strokeWidth={2.3} strokeLinecap="round" strokeLinejoin="round" />
  </g>
);

const PageIcon = ({ x, y, tone = 'primary' }: { x: number; y: number; tone?: 'primary' | 'success' | 'danger' }) => {
  const color = tone === 'success' ? 'var(--success)' : tone === 'danger' ? 'var(--danger)' : 'var(--primary)';
  return (
    <g>
      <rect x={x} y={y} width={112} height={148} rx={12} fill="var(--card)" stroke={color} strokeWidth={2.5} />
      <path d={`M${x + 84} ${y}l28 28h-28Z`} fill="color-mix(in srgb, var(--muted) 55%, transparent)" stroke="var(--border)" strokeWidth={1.5} />
      <rect x={x + 22} y={y + 48} width={68} height={8} rx={4} fill="var(--foreground)" opacity={0.18} />
      <rect x={x + 22} y={y + 68} width={58} height={7} rx={4} fill="var(--muted-foreground)" opacity={0.22} />
      <rect x={x + 22} y={y + 86} width={64} height={7} rx={4} fill="var(--muted-foreground)" opacity={0.18} />
    </g>
  );
};

export function PublishingWorkflowDiagram() {
  const steps = ['idea', 'create', 'format', 'upload', 'preview', 'publish'];
  return (
    <g>
      <Label x={238} y={46}>Amazon KDP publishing workflow</Label>
      {steps.map((step, i) => {
        const x = 48 + i * 122;
        return (
          <g key={step}>
            <Box x={x} y={156} w={92} h={64} label={step} tone={i === steps.length - 1 ? 'success' : 'primary'} />
            {i < steps.length - 1 && <path d={`M${x + 100} 188h18m-7-7 7 7-7 7`} fill="none" stroke="var(--primary)" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" opacity={0.72} />}
          </g>
        );
      })}
      <rect x={164} y={304} width={472} height={42} rx={14} fill="color-mix(in srgb, var(--success) 8%, var(--card))" stroke="var(--success)" strokeWidth={2} />
      <text x={400} y={330} textAnchor="middle" fill="var(--success)" fontSize={13} fontWeight={900}>each stage has its own checklist</text>
    </g>
  );
}

export function ManuscriptChecklistDiagram() {
  const items = ['page count', 'trim size', 'margins', 'gutter', 'page numbers', 'headings'];
  return (
    <g>
      <Label x={250} y={46}>manuscript checklist</Label>
      <PageIcon x={116} y={108} />
      <rect x={330} y={92} width={354} height={278} rx={20} fill="var(--card)" stroke="var(--border)" strokeWidth={2.5} />
      {items.map((item, i) => {
        const y = 126 + i * 38;
        return (
          <g key={item}>
            <Check x={366} y={y} />
            <text x={392} y={y + 5} fill="var(--foreground)" fontSize={13} fontWeight={900}>{item}</text>
          </g>
        );
      })}
    </g>
  );
}

export function CoverChecklistDiagram() {
  return (
    <g>
      <Label x={270} y={46}>cover checklist</Label>
      <rect x={90} y={124} width={620} height={198} rx={22} fill="color-mix(in srgb, var(--danger) 5%, transparent)" stroke="var(--danger)" strokeDasharray="10 8" strokeWidth={2.6} />
      <rect x={120} y={154} width={560} height={138} rx={18} fill="var(--card)" stroke="var(--border)" strokeWidth={2.6} />
      <rect x={136} y={170} width={200} height={106} rx={12} fill="color-mix(in srgb, var(--muted) 60%, transparent)" stroke="var(--success)" strokeDasharray="7 6" strokeWidth={2} />
      <rect x={356} y={154} width={88} height={138} fill="color-mix(in srgb, var(--primary) 13%, transparent)" stroke="var(--primary)" strokeWidth={2.4} />
      <rect x={464} y={170} width={164} height={106} rx={12} fill="transparent" stroke="var(--success)" strokeDasharray="7 6" strokeWidth={2} />
      <rect x={594} y={234} width={60} height={38} rx={6} fill="color-mix(in srgb, var(--danger) 10%, var(--card))" stroke="var(--danger)" strokeWidth={2} />
      <text x={236} y={228} textAnchor="middle" fill="var(--foreground)" fontSize={13} fontWeight={950}>back</text>
      <text x={400} y={232} textAnchor="middle" fill="var(--primary)" fontSize={11} fontWeight={950} transform="rotate(-90 400 232)">spine</text>
      <text x={546} y={228} textAnchor="middle" fill="var(--foreground)" fontSize={13} fontWeight={950}>front</text>
      <Box x={278} y={368} w={244} h={34} label="dimensions · bleed · barcode" tone="success" />
    </g>
  );
}

export function PdfValidationChecklistDiagram() {
  const items = ['dimensions', 'bleed', 'fonts', '300 DPI', 'transparency', 'PDF Print'];
  return (
    <g>
      <Label x={242} y={46}>PDF validation checklist</Label>
      {items.map((item, i) => {
        const x = 96 + (i % 3) * 220;
        const y = i < 3 ? 126 : 246;
        return (
          <g key={item}>
            <rect x={x} y={y} width={166} height={70} rx={16} fill="var(--card)" stroke={i === 5 ? 'var(--success)' : 'var(--primary)'} strokeWidth={2.5} />
            <Check x={x + 28} y={y + 35} />
            <text x={x + 92} y={y + 40} textAnchor="middle" fill="var(--foreground)" fontSize={12} fontWeight={900}>{item}</text>
          </g>
        );
      })}
    </g>
  );
}

export function MetadataChecklistDiagram() {
  const items = ['title', 'subtitle', 'description', 'keywords', 'categories', 'A+ content'];
  return (
    <g>
      <Label x={248} y={46}>metadata checklist</Label>
      <rect x={142} y={92} width={516} height={280} rx={22} fill="var(--card)" stroke="var(--border)" strokeWidth={2.5} />
      {items.map((item, i) => {
        const x = i < 3 ? 190 : 430;
        const y = 134 + (i % 3) * 68;
        return (
          <g key={item}>
            <rect x={x} y={y} width={180} height={42} rx={12} fill="color-mix(in srgb, var(--primary) 7%, transparent)" stroke="var(--primary)" strokeWidth={2} />
            <text x={x + 90} y={y + 27} textAnchor="middle" fill="var(--foreground)" fontSize={12} fontWeight={950}>{item}</text>
          </g>
        );
      })}
      <text x={400} y={410} textAnchor="middle" fill="var(--muted-foreground)" fontSize={12} fontWeight={850}>metadata helps readers and Amazon understand the book</text>
    </g>
  );
}

export function KeywordResearchDiagram() {
  const steps = ['reader phrase', 'relevance', 'specificity', 'final slots'];
  return (
    <g>
      <Label x={250} y={46}>keyword research workflow</Label>
      {steps.map((step, i) => {
        const x = 72 + i * 184;
        return (
          <g key={step}>
            <Box x={x} y={154} w={132} h={76} label={step} tone={i === 3 ? 'success' : 'primary'} />
            {i < steps.length - 1 && <path d={`M${x + 142} 192h30m-10-10 10 10-10 10`} fill="none" stroke="var(--primary)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" opacity={0.72} />}
          </g>
        );
      })}
      <Box x={250} y={306} w={300} h={42} label="avoid stuffing and unrelated terms" tone="warning" />
    </g>
  );
}

export function CategorySelectionDiagram() {
  return (
    <g>
      <Label x={250} y={46}>category selection checklist</Label>
      <rect x={96} y={120} width={190} height={204} rx={18} fill="var(--card)" stroke="var(--primary)" strokeWidth={2.5} />
      <text x={191} y={166} textAnchor="middle" fill="var(--primary)" fontSize={14} fontWeight={950}>relevant</text>
      <rect x={122} y={206} width={138} height={28} rx={8} fill="color-mix(in srgb, var(--primary) 9%, transparent)" />
      <rect x={122} y={250} width={104} height={24} rx={8} fill="color-mix(in srgb, var(--primary) 7%, transparent)" />
      <rect x={326} y={120} width={190} height={204} rx={18} fill="var(--card)" stroke="var(--warning)" strokeWidth={2.5} />
      <text x={421} y={166} textAnchor="middle" fill="var(--warning)" fontSize={14} fontWeight={950}>reachable</text>
      <rect x={362} y={206} width={118} height={18} rx={9} fill="var(--warning)" opacity={0.54} />
      <rect x={362} y={240} width={78} height={18} rx={9} fill="var(--warning)" opacity={0.32} />
      <rect x={556} y={120} width={154} height={204} rx={18} fill="var(--card)" stroke="var(--success)" strokeWidth={2.5} />
      <text x={633} y={166} textAnchor="middle" fill="var(--success)" fontSize={14} fontWeight={950}>strategy</text>
      <Check x={633} y={232} />
      <Box x={244} y={372} w={312} h={34} label="choose for readers, not loopholes" tone="success" />
    </g>
  );
}

export function PricingChecklistDiagram() {
  const items = ['print cost', 'royalty', 'competitors', 'profit'];
  return (
    <g>
      <Label x={266} y={46}>pricing checklist</Label>
      {items.map((item, i) => {
        const x = 82 + i * 174;
        return (
          <g key={item}>
            <rect x={x} y={126} width={132} height={146} rx={18} fill="var(--card)" stroke={i === 3 ? 'var(--success)' : 'var(--primary)'} strokeWidth={2.5} />
            <text x={x + 66} y={178} textAnchor="middle" fill={i === 3 ? 'var(--success)' : 'var(--primary)'} fontSize={18} fontWeight={950}>$</text>
            <text x={x + 66} y={230} textAnchor="middle" fill="var(--foreground)" fontSize={12} fontWeight={950}>{item}</text>
          </g>
        );
      })}
      <Box x={250} y={340} w={300} h={42} label="price above minimum and test demand" tone="warning" />
    </g>
  );
}

export function PreviewerChecklistDiagram() {
  const items = ['margins', 'bleed', 'blank pages', 'borders', 'spine'];
  return (
    <g>
      <Label x={248} y={46}>KDP Previewer checklist</Label>
      <rect x={108} y={100} width={320} height={236} rx={20} fill="var(--card)" stroke="var(--border)" strokeWidth={2.5} />
      <rect x={134} y={132} width={268} height={154} rx={12} fill="color-mix(in srgb, var(--primary) 8%, transparent)" stroke="var(--primary)" strokeWidth={2} />
      <text x={268} y={214} textAnchor="middle" fill="var(--primary)" fontSize={16} fontWeight={950}>Previewer</text>
      <rect x={474} y={100} width={220} height={236} rx={20} fill="var(--card)" stroke="var(--border)" strokeWidth={2.5} />
      {items.map((item, i) => {
        const y = 134 + i * 36;
        return (
          <g key={item}>
            <Check x={506} y={y} />
            <text x={532} y={y + 5} fill="var(--foreground)" fontSize={12} fontWeight={900}>{item}</text>
          </g>
        );
      })}
    </g>
  );
}

export function ColoringBookPublishingChecklistDiagram() {
  return (
    <g>
      <Label x={204} y={46}>coloring book publishing checklist</Label>
      <PageIcon x={130} y={112} />
      <path d="M166 220c22-44 58-44 78 0" fill="none" stroke="var(--foreground)" strokeWidth={3} opacity={0.34} />
      <Box x={90} y={324} w={190} h={34} label="single-sided pages" tone="primary" />
      <PageIcon x={522} y={112} tone="danger" />
      <rect x={538} y={128} width={80} height={112} rx={7} fill="none" stroke="var(--danger)" strokeWidth={2.5} />
      <Box x={484} y={324} w={190} h={34} label="border risk" tone="danger" />
      <Box x={304} y={188} w={192} h={42} label="bleed + black pages" tone="warning" />
    </g>
  );
}

export function BeginnerMistakesMap() {
  const items = ['wrong trim', 'weak cover', 'bad keywords', 'no proof', 'unsafe margins', 'wrong price', 'rushed preview', 'old template'];
  const nodes = items.map((item, i) => {
    const angle = (Math.PI * 2 * i) / items.length - Math.PI / 2;
    const cx = 400 + Math.cos(angle) * 244;
    const cy = 214 + Math.sin(angle) * 136;
    const dx = cx - 400;
    const dy = cy - 214;
    const length = Math.hypot(dx, dy);
    return { item, cx, cy, x1: 400 + (dx / length) * 108, y1: 214 + (dy / length) * 108, x2: 400 + (dx / length) * (length - 78), y2: 214 + (dy / length) * (length - 78) };
  });
  return (
    <g>
      <Label x={234} y={44}>common beginner mistakes</Label>
      {nodes.map(({ item, x1, y1, x2, y2 }) => <path key={`${item}-line`} d={`M${x1} ${y1}L${x2} ${y2}`} stroke="var(--border)" strokeWidth={2} strokeLinecap="round" />)}
      <rect x={294} y={176} width={212} height={70} rx={20} fill="color-mix(in srgb, var(--danger) 10%, var(--card))" stroke="var(--danger)" strokeWidth={3} />
      <text x={400} y={218} textAnchor="middle" fill="var(--danger)" fontSize={17} fontWeight={950}>avoid these</text>
      {nodes.map(({ item, cx, cy }) => <Box key={item} x={cx - 62} y={cy - 18} w={124} h={36} label={item} />)}
    </g>
  );
}

export function UltimatePublishChecklistDiagram() {
  const items = ['manuscript', 'cover', 'PDF', 'metadata', 'keywords', 'categories', 'price', 'preview', 'proof', 'publish'];
  return (
    <g>
      <Label x={244} y={44}>ultimate publish checklist</Label>
      <rect x={154} y={78} width={492} height={332} rx={22} fill="var(--card)" stroke="var(--border)" strokeWidth={3} />
      {items.map((item, i) => {
        const x = i < 5 ? 196 : 430;
        const y = 118 + (i % 5) * 50;
        return (
          <g key={item}>
            <Check x={x} y={y} />
            <text x={x + 28} y={y + 5} fill="var(--foreground)" fontSize={13} fontWeight={900}>{item}</text>
          </g>
        );
      })}
      <Box x={262} y={354} w={276} h={34} label="publish after the final review" tone="success" />
    </g>
  );
}
