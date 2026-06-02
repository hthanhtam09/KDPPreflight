import type React from 'react';
import { Label } from './shared';

const Tag = ({ x, y, label, tone = 'primary', w = 128 }: { x: number; y: number; label: string; tone?: 'primary' | 'success' | 'danger' | 'warning'; w?: number }) => {
  const color = tone === 'success' ? 'var(--success)' : tone === 'danger' ? 'var(--danger)' : tone === 'warning' ? 'var(--warning)' : 'var(--primary)';
  return (
    <g>
      <rect x={x} y={y} width={w} height={34} rx={10} fill="var(--card)" stroke={color} strokeWidth={2} />
      <text x={x + w / 2} y={y + 22} textAnchor="middle" fill={color} fontSize={11} fontWeight={950}>{label}</text>
    </g>
  );
};

const Check = ({ x, y }: { x: number; y: number }) => (
  <g>
    <circle cx={x} cy={y} r={11} fill="color-mix(in srgb, var(--success) 14%, transparent)" stroke="var(--success)" strokeWidth={2} />
    <path d={`M${x - 6} ${y}l5 5 10-11`} fill="none" stroke="var(--success)" strokeWidth={2.3} strokeLinecap="round" strokeLinejoin="round" />
  </g>
);

export function CoverTemplateAnatomyDiagram() {
  return (
    <g>
      <Label x={246} y={46}>KDP cover template anatomy</Label>
      <rect x={80} y={110} width={640} height={220} rx={24} fill="color-mix(in srgb, var(--danger) 5%, transparent)" stroke="var(--danger)" strokeDasharray="10 8" strokeWidth={2.6} />
      <rect x={112} y={142} width={576} height={156} rx={18} fill="var(--card)" stroke="var(--border)" strokeWidth={2.8} />
      <rect x={130} y={160} width={204} height={120} rx={12} fill="color-mix(in srgb, var(--muted) 62%, transparent)" stroke="var(--success)" strokeDasharray="7 6" strokeWidth={2} />
      <rect x={356} y={142} width={88} height={156} fill="color-mix(in srgb, var(--primary) 13%, transparent)" stroke="var(--primary)" strokeWidth={2.5} />
      <rect x={466} y={160} width={166} height={120} rx={12} fill="transparent" stroke="var(--success)" strokeDasharray="7 6" strokeWidth={2} />
      <rect x={600} y={238} width={62} height={40} rx={6} fill="color-mix(in srgb, var(--danger) 10%, var(--card))" stroke="var(--danger)" strokeWidth={2} />
      <Tag x={166} y={354} label="back cover" />
      <Tag x={336} y={354} label="spine" />
      <Tag x={500} y={354} label="front cover" />
    </g>
  );
}

export function TemplateGenerationProcessDiagram() {
  const inputs = ['trim size', 'page count', 'paper type'];
  return (
    <g>
      <Label x={226} y={46}>how KDP generates a template</Label>
      {inputs.map((input, i) => {
        const x = 100 + i * 190;
        return <Tag key={input} x={x} y={126} w={146} label={input} tone={i === 1 ? 'warning' : 'primary'} />;
      })}
      <path d="M400 184v54" stroke="var(--primary)" strokeWidth={3} strokeLinecap="round" />
      <path d="M388 226l12 14 12-14" fill="none" stroke="var(--primary)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      <rect x={230} y={260} width={340} height={86} rx={20} fill="var(--card)" stroke="var(--success)" strokeWidth={3} />
      <text x={400} y={294} textAnchor="middle" fill="var(--success)" fontSize={18} fontWeight={950}>generated cover template</text>
      <text x={400} y={322} textAnchor="middle" fill="var(--muted-foreground)" fontSize={12} fontWeight={850}>new page count means new spine width</text>
    </g>
  );
}

export function FrontCoverTemplateGuide() {
  return (
    <g>
      <Label x={246} y={46}>front cover placement guide</Label>
      <rect x={292} y={92} width={216} height={292} rx={18} fill="var(--card)" stroke="var(--border)" strokeWidth={3} />
      <rect x={320} y={120} width={160} height={236} rx={10} fill="transparent" stroke="var(--success)" strokeDasharray="7 6" strokeWidth={2.4} />
      <rect x={342} y={156} width={116} height={34} rx={8} fill="var(--foreground)" opacity={0.78} />
      <text x={400} y={179} textAnchor="middle" fill="var(--card)" fontSize={14} fontWeight={950}>TITLE</text>
      <rect x={354} y={210} width={92} height={10} rx={5} fill="var(--primary)" opacity={0.38} />
      <circle cx={400} cy={284} r={34} fill="color-mix(in srgb, var(--primary) 16%, transparent)" stroke="var(--primary)" strokeWidth={2.5} />
      <Tag x={80} y={150} label="title inside" tone="success" />
      <Tag x={82} y={250} label="focal point" />
      <Tag x={566} y={150} label="subtitle safe" tone="success" />
      <Tag x={566} y={250} label="edge art bleeds" tone="warning" />
    </g>
  );
}

export function BackCoverTemplateGuide() {
  return (
    <g>
      <Label x={246} y={46}>back cover layout guide</Label>
      <rect x={284} y={92} width={232} height={292} rx={18} fill="var(--card)" stroke="var(--border)" strokeWidth={3} />
      <rect x={312} y={124} width={176} height={214} rx={10} fill="transparent" stroke="var(--success)" strokeDasharray="7 6" strokeWidth={2.4} />
      <rect x={338} y={152} width={124} height={12} rx={6} fill="var(--foreground)" opacity={0.2} />
      <rect x={338} y={184} width={124} height={58} rx={8} fill="color-mix(in srgb, var(--primary) 9%, transparent)" stroke="var(--border)" />
      <rect x={338} y={266} width={88} height={10} rx={5} fill="var(--foreground)" opacity={0.16} />
      <rect x={410} y={302} width={58} height={38} rx={6} fill="color-mix(in srgb, var(--danger) 10%, var(--card))" stroke="var(--danger)" strokeWidth={2} />
      <Tag x={76} y={160} label="benefit copy" />
      <Tag x={76} y={260} label="preview image" />
      <Tag x={566} y={160} label="clear spacing" tone="success" />
      <Tag x={566} y={260} label="barcode clear" tone="danger" />
    </g>
  );
}

export function SpineWidthTemplateGuide() {
  return (
    <g>
      <Label x={250} y={46}>spine width guide</Label>
      <rect x={106} y={126} width={242} height={180} rx={18} fill="var(--card)" stroke="var(--danger)" strokeWidth={2.5} />
      <rect x={214} y={126} width={26} height={180} fill="color-mix(in srgb, var(--danger) 12%, transparent)" stroke="var(--danger)" strokeWidth={2.5} />
      <text x={227} y={228} textAnchor="middle" fill="var(--danger)" fontSize={10} fontWeight={950} transform="rotate(-90 227 228)">too thin</text>
      <Tag x={150} y={342} label="no spine text" tone="danger" />
      <rect x={454} y={112} width={260} height={208} rx={18} fill="var(--card)" stroke="var(--success)" strokeWidth={2.5} />
      <rect x={566} y={112} width={66} height={208} fill="color-mix(in srgb, var(--success) 12%, transparent)" stroke="var(--success)" strokeWidth={2.5} />
      <text x={599} y={230} textAnchor="middle" fill="var(--success)" fontSize={12} fontWeight={950} transform="rotate(-90 599 230)">centered title</text>
      <Tag x={508} y={342} label="safe spine text" tone="success" />
    </g>
  );
}

export function CoverBleedTemplateGuide() {
  return (
    <g>
      <Label x={254} y={46}>cover bleed guide</Label>
      <rect x={118} y={112} width={190} height={244} rx={18} fill="var(--card)" stroke="var(--danger)" strokeWidth={3} />
      <rect x={146} y={146} width={134} height={176} rx={10} fill="color-mix(in srgb, var(--primary) 16%, transparent)" stroke="var(--danger)" strokeDasharray="7 6" strokeWidth={2.5} />
      <Tag x={134} y={382} label="background stops" tone="danger" />
      <path d="M348 224h102m-18-14 18 14-18 14" fill="none" stroke="var(--primary)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      <rect x={492} y={86} width={214} height={296} rx={20} fill="color-mix(in srgb, var(--primary) 12%, transparent)" stroke="var(--danger)" strokeDasharray="10 8" strokeWidth={2.6} />
      <rect x={526} y={122} width={146} height={224} rx={12} fill="var(--card)" stroke="var(--success)" strokeWidth={2.4} />
      <Tag x={522} y={382} label="art extends" tone="success" />
    </g>
  );
}

export function CoverSafeAreaTemplateGuide() {
  return (
    <g>
      <Label x={238} y={46}>cover safe area guide</Label>
      <rect x={146} y={104} width={190} height={252} rx={18} fill="var(--card)" stroke="var(--danger)" strokeWidth={3} />
      <rect x={164} y={122} width={154} height={216} rx={10} fill="transparent" stroke="var(--success)" strokeDasharray="7 6" strokeWidth={2} />
      <rect x={160} y={304} width={126} height={14} rx={7} fill="var(--danger)" opacity={0.75} />
      <Tag x={150} y={382} label="text too low" tone="danger" />
      <path d="M372 224h76m-16-14 16 14-16 14" fill="none" stroke="var(--primary)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      <rect x={498} y={104} width={190} height={252} rx={18} fill="var(--card)" stroke="var(--success)" strokeWidth={3} />
      <rect x={526} y={132} width={134} height={196} rx={10} fill="transparent" stroke="var(--success)" strokeDasharray="7 6" strokeWidth={2.4} />
      <rect x={552} y={270} width={82} height={12} rx={6} fill="var(--success)" opacity={0.75} />
      <Tag x={520} y={382} label="text protected" tone="success" />
    </g>
  );
}

export function BarcodeAreaTemplateGuide() {
  return (
    <g>
      <Label x={238} y={46}>barcode area guide</Label>
      <rect x={126} y={104} width={208} height={270} rx={18} fill="var(--card)" stroke="var(--danger)" strokeWidth={3} />
      <rect x={158} y={144} width={144} height={90} rx={10} fill="color-mix(in srgb, var(--primary) 9%, transparent)" />
      <rect x={226} y={286} width={76} height={50} rx={7} fill="color-mix(in srgb, var(--danger) 12%, var(--card))" stroke="var(--danger)" strokeWidth={2} />
      <text x={264} y={316} textAnchor="middle" fill="var(--danger)" fontSize={10} fontWeight={950}>TEXT</text>
      <Tag x={154} y={394} label="overlap" tone="danger" />
      <rect x={486} y={104} width={208} height={270} rx={18} fill="var(--card)" stroke="var(--success)" strokeWidth={3} />
      <rect x={518} y={144} width={144} height={90} rx={10} fill="color-mix(in srgb, var(--primary) 9%, transparent)" />
      <rect x={590} y={286} width={76} height={50} rx={7} fill="color-mix(in srgb, var(--success) 10%, var(--card))" stroke="var(--success)" strokeWidth={2} />
      <text x={628} y={316} textAnchor="middle" fill="var(--success)" fontSize={10} fontWeight={950}>CLEAR</text>
      <Tag x={530} y={394} label="reserved zone" tone="success" />
    </g>
  );
}

export function CoverTemplateMistakesMap() {
  const items = ['wrong spine', 'missing bleed', 'barcode overlap', 'text near trim', 'old page count', 'template mismatch', 'crop marks', 'low DPI'];
  const nodes = items.map((item, i) => {
    const angle = (Math.PI * 2 * i) / items.length - Math.PI / 2;
    const cx = 400 + Math.cos(angle) * 250;
    const cy = 214 + Math.sin(angle) * 138;
    const dx = cx - 400;
    const dy = cy - 214;
    const length = Math.hypot(dx, dy);
    return { item, cx, cy, x1: 400 + (dx / length) * 112, y1: 214 + (dy / length) * 112, x2: 400 + (dx / length) * (length - 84), y2: 214 + (dy / length) * (length - 84) };
  });
  return (
    <g>
      <Label x={230} y={44}>common template mistakes</Label>
      {nodes.map(({ item, x1, y1, x2, y2 }) => <path key={`${item}-line`} d={`M${x1} ${y1}L${x2} ${y2}`} stroke="var(--border)" strokeWidth={2} strokeLinecap="round" />)}
      <rect x={292} y={176} width={216} height={70} rx={20} fill="color-mix(in srgb, var(--danger) 10%, var(--card))" stroke="var(--danger)" strokeWidth={3} />
      <text x={400} y={218} textAnchor="middle" fill="var(--danger)" fontSize={17} fontWeight={950}>cover mistakes</text>
      {nodes.map(({ item, cx, cy }) => <Tag key={item} x={cx - 64} y={cy - 18} w={128} label={item} />)}
    </g>
  );
}

export function ColoringBookCoverTemplateGuide() {
  return (
    <g>
      <Label x={202} y={46}>coloring book cover structure</Label>
      <rect x={132} y={96} width={206} height={270} rx={18} fill="var(--card)" stroke="var(--success)" strokeWidth={3} />
      <rect x={158} y={126} width={154} height={210} rx={10} fill="transparent" stroke="var(--success)" strokeDasharray="7 6" strokeWidth={2.4} />
      <rect x={178} y={154} width={114} height={36} rx={8} fill="var(--foreground)" opacity={0.82} />
      <text x={235} y={178} textAnchor="middle" fill="var(--card)" fontSize={13} fontWeight={950}>BIG TITLE</text>
      <path d="M184 286c28-52 74-52 102 0" fill="none" stroke="var(--primary)" strokeWidth={3} opacity={0.55} />
      <Tag x={160} y={392} label="thumbnail readable" tone="success" />
      <rect x={500} y={112} width={180} height={238} rx={18} fill="#171923" stroke="var(--danger)" strokeWidth={3} />
      <rect x={528} y={146} width={124} height={26} rx={8} fill="#3f4656" />
      <text x={590} y={164} textAnchor="middle" fill="#171923" fontSize={11} fontWeight={950}>low contrast</text>
      <Tag x={508} y={392} label="too busy/dark" tone="danger" />
    </g>
  );
}

export function UltimateCoverTemplateChecklist() {
  const items = ['final page count', 'correct template', 'full wrap', 'bleed', 'safe area', 'spine text', 'barcode clear', 'PDF export', 'no crop marks', 'preview checked'];
  return (
    <g>
      <Label x={228} y={44}>ultimate cover template checklist</Label>
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
      <Tag x={260} y={354} w={280} label="upload the verified cover PDF" tone="success" />
    </g>
  );
}
