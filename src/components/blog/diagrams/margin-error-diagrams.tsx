import type React from 'react';
import { Label } from './shared';

const Page = ({ x, y, w = 150, h = 216, danger = false }: { x: number; y: number; w?: number; h?: number; danger?: boolean }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx={12} fill="var(--card)" stroke={danger ? 'var(--danger)' : 'var(--border)'} strokeWidth={2.5} />
    <rect x={x + 14} y={y + 14} width={w - 28} height={h - 28} rx={7} fill="transparent" stroke="var(--success)" strokeDasharray="7 6" strokeWidth={2} />
    <rect x={x + 28} y={y + 42} width={w - 56} height={10} rx={5} fill="var(--foreground)" opacity={danger ? 0.7 : 0.18} />
    <rect x={x + 28} y={y + 62} width={w - 70} height={7} rx={4} fill="var(--muted-foreground)" opacity={0.24} />
    <rect x={x + 28} y={y + 78} width={w - 64} height={7} rx={4} fill="var(--muted-foreground)" opacity={0.2} />
  </g>
);

const Badge = ({ x, y, label, good = false }: { x: number; y: number; label: string; good?: boolean }) => (
  <g>
    <rect x={x} y={y} width={154} height={34} rx={10} fill={`color-mix(in srgb, ${good ? 'var(--success)' : 'var(--danger)'} 10%, var(--card))`} stroke={good ? 'var(--success)' : 'var(--danger)'} strokeWidth={2} />
    <text x={x + 77} y={y + 22} textAnchor="middle" fill={good ? 'var(--success)' : 'var(--danger)'} fontSize={12} fontWeight={950}>{label}</text>
  </g>
);

export function MarginErrorScreenVsKdp() {
  return (
    <g>
      <Label x={188} y={48}>looks fine on screen vs fails KDP</Label>
      <rect x={70} y={100} width={280} height={190} rx={18} fill="var(--card)" stroke="var(--border)" strokeWidth={2.5} />
      <rect x={98} y={128} width={224} height={126} rx={10} fill="color-mix(in srgb, var(--primary) 9%, transparent)" stroke="var(--primary)" strokeWidth={2} />
      <text x={210} y={194} textAnchor="middle" fill="var(--primary)" fontSize={16} fontWeight={950}>PDF preview</text>
      <Badge x={133} y={322} label="looks centered" good />

      <rect x={450} y={100} width={280} height={190} rx={18} fill="var(--card)" stroke="var(--danger)" strokeWidth={2.5} />
      <Page x={518} y={118} w={144} h={154} danger />
      <rect x={535} y={236} width={110} height={12} rx={6} fill="var(--danger)" opacity={0.75} />
      <path d="M518 257h144" stroke="var(--danger)" strokeDasharray="7 6" strokeWidth={2.5} />
      <Badge x={513} y={322} label="margin too small" />
    </g>
  );
}

export function MarginPageAnatomy() {
  return (
    <g>
      <Label x={244} y={42}>margin, safe area, trim, bleed, gutter</Label>
      <rect x={232} y={72} width={336} height={330} rx={20} fill="color-mix(in srgb, var(--danger) 7%, transparent)" stroke="var(--danger)" strokeDasharray="10 8" strokeWidth={3} />
      <rect x={260} y={100} width={280} height={274} rx={14} fill="var(--card)" stroke="var(--primary)" strokeWidth={3} />
      <rect x={294} y={132} width={212} height={208} rx={10} fill="transparent" stroke="var(--success)" strokeDasharray="8 7" strokeWidth={3} />
      <rect x={294} y={132} width={36} height={208} rx={8} fill="color-mix(in srgb, var(--warning) 18%, transparent)" stroke="var(--warning)" strokeWidth={2} />
      <rect x={354} y={176} width={118} height={10} rx={5} fill="var(--foreground)" opacity={0.22} />
      <rect x={354} y={202} width={96} height={8} rx={4} fill="var(--muted-foreground)" opacity={0.24} />
      {[
        { label: 'bleed', x: 104, y: 118, color: 'var(--danger)' },
        { label: 'trim', x: 594, y: 132, color: 'var(--primary)' },
        { label: 'safe area', x: 594, y: 214, color: 'var(--success)' },
        { label: 'gutter', x: 114, y: 242, color: 'var(--warning)' },
        { label: 'margin', x: 114, y: 326, color: 'var(--muted-foreground)' },
      ].map(({ label, x, y, color }) => (
        <g key={label}>
          <rect x={x} y={y} width={112} height={30} rx={10} fill="var(--card)" stroke={color} strokeWidth={2} />
          <text x={x + 56} y={y + 20} textAnchor="middle" fill={color} fontSize={12} fontWeight={950}>{label}</text>
        </g>
      ))}
    </g>
  );
}

export function MarginSafeBleedComparison() {
  const cards = [
    ['Margin error', 'text/page number too close', 'var(--danger)'],
    ['Safe-area risk', 'important object near trim', 'var(--warning)'],
    ['Bleed error', 'edge art stops too soon', 'var(--primary)'],
  ];
  return (
    <g>
      <Label x={196} y={48}>margin error vs safe area vs bleed</Label>
      {cards.map(([title, note, color], i) => {
        const x = 70 + i * 240;
        return (
          <g key={title}>
            <rect x={x} y={94} width={190} height={260} rx={18} fill="var(--card)" stroke={color} strokeWidth={2.5} />
            <Page x={x + 38} y={130} w={114} h={152} danger={i === 0} />
            {i === 2 && <rect x={x + 38} y={130} width={114} height={152} rx={8} fill="transparent" stroke="var(--danger)" strokeDasharray="5 5" strokeWidth={2} />}
            <text x={x + 95} y={318} textAnchor="middle" fill={color} fontSize={14} fontWeight={950}>{title}</text>
            <text x={x + 95} y={340} textAnchor="middle" fill="var(--muted-foreground)" fontSize={10} fontWeight={800}>{note}</text>
          </g>
        );
      })}
    </g>
  );
}

export function MarginCommonCausesMap() {
  const items = ['trim size', 'PDF size', 'page numbers', 'headers', 'borders', 'bleed', 'gutter', 'hidden layers'];
  const nodes = items.map((item, i) => {
    const angle = (Math.PI * 2 * i) / items.length - Math.PI / 2;
    const cx = 400 + Math.cos(angle) * 248;
    const cy = 214 + Math.sin(angle) * 140;
    const dx = cx - 400;
    const dy = cy - 214;
    const length = Math.hypot(dx, dy);
    const start = 122;
    const end = length - 82;
    return {
      item,
      cx,
      cy,
      x1: 400 + (dx / length) * start,
      y1: 214 + (dy / length) * start,
      x2: 400 + (dx / length) * end,
      y2: 214 + (dy / length) * end,
    };
  });
  return (
    <g>
      <Label x={232} y={44}>common causes of the warning</Label>
      {nodes.map(({ item, x1, y1, x2, y2 }) => (
        <path key={`${item}-line`} d={`M${x1} ${y1}L${x2} ${y2}`} stroke="var(--border)" strokeWidth={2} strokeLinecap="round" />
      ))}
      <rect x={282} y={176} width={236} height={74} rx={20} fill="color-mix(in srgb, var(--danger) 10%, var(--card))" stroke="var(--danger)" strokeWidth={3} />
      <text x={400} y={205} textAnchor="middle" fill="var(--danger)" fontSize={16} fontWeight={950}>Margin Too Small</text>
      <text x={400} y={226} textAnchor="middle" fill="var(--muted-foreground)" fontSize={11} fontWeight={800}>KDP manuscript warning</text>
      {nodes.map(({ item, cx, cy }) => (
        <g key={item}>
          <rect x={cx - 64} y={cy - 18} width={128} height={36} rx={11} fill="var(--card)" stroke="var(--primary)" strokeWidth={2} />
          <text x={cx} y={cy + 5} textAnchor="middle" fill="var(--foreground)" fontSize={11} fontWeight={900}>{item}</text>
        </g>
      ))}
    </g>
  );
}

export function CanvaMarginFixWorkflow() {
  const steps = ['size', 'guides', 'move text', 'PDF Print'];
  return (
    <g>
      <Label x={230} y={48}>Canva margin fix workflow</Label>
      {steps.map((step, i) => {
        const x = 70 + i * 184;
        return (
          <g key={step}>
            <rect x={x} y={132} width={132} height={142} rx={18} fill="var(--card)" stroke={i === 3 ? 'var(--success)' : 'var(--primary)'} strokeWidth={2.5} />
            <text x={x + 66} y={158} textAnchor="middle" fill="var(--muted-foreground)" fontSize={11} fontWeight={900}>STEP {i + 1}</text>
            <rect x={x + 34} y={178} width={64} height={70} rx={8} fill="color-mix(in srgb, var(--primary) 10%, transparent)" stroke="var(--border)" />
            <text x={x + 66} y={306} textAnchor="middle" fill={i === 3 ? 'var(--success)' : 'var(--foreground)'} fontSize={13} fontWeight={950}>{step}</text>
            {i < 3 && <path d={`M${x + 144} 204h28m-10-10 10 10-10 10`} fill="none" stroke="var(--primary)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />}
          </g>
        );
      })}
    </g>
  );
}

export function ColoringBookMarginBeforeAfter() {
  return (
    <g>
      <Label x={202} y={48}>coloring book border before and after</Label>
      <Page x={118} y={104} w={190} h={252} danger />
      <rect x={132} y={118} width={162} height={224} rx={6} fill="none" stroke="var(--danger)" strokeWidth={3} />
      <text x={213} y={386} textAnchor="middle" fill="var(--danger)" fontSize={14} fontWeight={950}>border hugs trim</text>
      <path d="M350 220h100m-18-14 18 14-18 14" fill="none" stroke="var(--primary)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      <Page x={492} y={104} w={190} h={252} />
      <rect x={530} y={142} width={114} height={176} rx={6} fill="none" stroke="var(--success)" strokeWidth={4} />
      <text x={587} y={386} textAnchor="middle" fill="var(--success)" fontSize={14} fontWeight={950}>border moved inward</text>
    </g>
  );
}

export function GutterMarginExample() {
  return (
    <g>
      <Label x={254} y={48}>gutter margin problem</Label>
      <rect x={112} y={118} width={576} height={238} rx={22} fill="var(--card)" stroke="var(--border)" strokeWidth={3} />
      <path d="M400 118c-22 54-22 184 0 238" fill="none" stroke="var(--primary)" strokeWidth={12} opacity={0.28} />
      <path d="M400 118v238" stroke="var(--primary)" strokeWidth={3} />
      <rect x={162} y={162} width={178} height={12} rx={6} fill="var(--foreground)" opacity={0.18} />
      <rect x={212} y={194} width={158} height={9} rx={5} fill="var(--danger)" opacity={0.72} />
      <rect x={430} y={162} width={178} height={12} rx={6} fill="var(--foreground)" opacity={0.18} />
      <rect x={454} y={194} width={138} height={9} rx={5} fill="var(--success)" opacity={0.72} />
      <Badge x={174} y={384} label="too close to spine" />
      <Badge x={474} y={384} label="gutter added" good />
    </g>
  );
}

export function CoverMarginRiskMap() {
  return (
    <g>
      <Label x={256} y={48}>cover margin risk map</Label>
      <rect x={94} y={114} width={612} height={210} rx={20} fill="var(--card)" stroke="var(--border)" strokeWidth={3} />
      <rect x={112} y={132} width={184} height={174} rx={12} fill="color-mix(in srgb, var(--muted) 60%, transparent)" stroke="var(--success)" strokeDasharray="7 6" strokeWidth={2} />
      <rect x={316} y={132} width={68} height={174} fill="color-mix(in srgb, var(--primary) 13%, transparent)" stroke="var(--primary)" strokeWidth={2} />
      <rect x={404} y={132} width={184} height={174} rx={12} fill="transparent" stroke="var(--success)" strokeDasharray="7 6" strokeWidth={2} />
      <rect x={610} y={230} width={66} height={46} rx={6} fill="color-mix(in srgb, var(--danger) 12%, var(--card))" stroke="var(--danger)" strokeWidth={2} />
      <text x={643} y={258} textAnchor="middle" fill="var(--danger)" fontSize={10} fontWeight={950}>barcode</text>
      <text x={350} y={230} textAnchor="middle" fill="var(--primary)" fontSize={12} fontWeight={950} transform="rotate(-90 350 230)">spine text</text>
      <text x={496} y={222} textAnchor="middle" fill="var(--foreground)" fontSize={20} fontWeight={950}>TITLE</text>
      <Badge x={322} y={360} label="spine/barcode/trim" />
    </g>
  );
}

export function MarginTroubleshootingFlow() {
  const steps = ['page size', 'trim size', 'bleed', 'safe area', 'gutter', 'export', 'upload'];
  const cards = steps.map((step, i) => ({
    step,
    i,
    x: 84 + (i % 4) * 162,
    y: i < 4 ? 104 : 268,
  }));
  return (
    <g>
      <Label x={230} y={42}>margin troubleshooting flow</Label>
      {cards.slice(0, -1).map(({ i, x, y }) => (
        <path
          key={`${i}-connector`}
          d={i === 3 ? 'M629 156v80H143v32' : `M${x + 124} ${y + 26}h30m-10-10 10 10-10 10`}
          fill="none"
          stroke="var(--primary)"
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.72}
        />
      ))}
      {cards.map(({ step, i, x, y }) => (
        <g key={step}>
          <rect x={x} y={y} width={118} height={52} rx={14} fill="var(--card)" stroke={i === steps.length - 1 ? 'var(--success)' : 'var(--primary)'} strokeWidth={2.5} />
          <text x={x + 59} y={y + 32} textAnchor="middle" fill="var(--foreground)" fontSize={12} fontWeight={950}>{step}</text>
        </g>
      ))}
      <rect x={274} y={372} width={252} height={34} rx={12} fill="color-mix(in srgb, var(--success) 9%, var(--card))" stroke="var(--success)" strokeWidth={2} />
      <text x={400} y={394} textAnchor="middle" fill="var(--success)" fontSize={12} fontWeight={950}>fix source file before another upload</text>
    </g>
  );
}

export function FinalMarginChecklistDiagram() {
  const items = ['trim size verified', 'PDF dimensions match', 'bleed setting correct', 'text inside safe area', 'gutter margin checked', 'page numbers moved up'];
  return (
    <g>
      <Label x={262} y={44}>final pre-upload checklist</Label>
      <rect x={174} y={82} width={452} height={320} rx={22} fill="var(--card)" stroke="var(--border)" strokeWidth={3} />
      {items.map((item, i) => {
        const y = 124 + i * 42;
        return (
          <g key={item}>
            <circle cx={218} cy={y} r={12} fill="color-mix(in srgb, var(--success) 14%, transparent)" stroke="var(--success)" strokeWidth={2} />
            <path d={`M212 ${y}l5 5 10-11`} fill="none" stroke="var(--success)" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
            <text x={246} y={y + 5} fill="var(--foreground)" fontSize={14} fontWeight={900}>{item}</text>
          </g>
        );
      })}
      <rect x={238} y={360} width={324} height={28} rx={10} fill="color-mix(in srgb, var(--primary) 9%, var(--card))" stroke="var(--primary)" strokeWidth={2} />
      <text x={400} y={379} textAnchor="middle" fill="var(--primary)" fontSize={11} fontWeight={950}>upload only the verified final PDF</text>
    </g>
  );
}
