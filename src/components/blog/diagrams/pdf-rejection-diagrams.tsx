import type React from 'react';
import { Label } from './shared';

const MiniPdf = ({ x, y, danger = false }: { x: number; y: number; danger?: boolean }) => (
  <g>
    <rect x={x} y={y} width={118} height={154} rx={12} fill="var(--card)" stroke={danger ? 'var(--danger)' : 'var(--border)'} strokeWidth={2.5} />
    <path d={`M${x + 88} ${y}l30 30h-30Z`} fill="color-mix(in srgb, var(--muted) 55%, transparent)" stroke="var(--border)" strokeWidth={1.5} />
    <rect x={x + 22} y={y + 48} width={74} height={8} rx={4} fill="var(--foreground)" opacity={0.18} />
    <rect x={x + 22} y={y + 68} width={62} height={7} rx={4} fill="var(--muted-foreground)" opacity={0.22} />
    <rect x={x + 22} y={y + 86} width={70} height={7} rx={4} fill="var(--muted-foreground)" opacity={0.18} />
    {danger && (
      <circle cx={x + 96} cy={y + 132} r={16} fill="color-mix(in srgb, var(--danger) 15%, var(--card))" stroke="var(--danger)" strokeWidth={2.5} />
    )}
    {danger && <text x={x + 96} y={y + 138} textAnchor="middle" fill="var(--danger)" fontSize={18} fontWeight={950}>!</text>}
  </g>
);

const Status = ({ x, y, label, good = false }: { x: number; y: number; label: string; good?: boolean }) => (
  <g>
    <rect x={x} y={y} width={156} height={34} rx={10} fill={`color-mix(in srgb, ${good ? 'var(--success)' : 'var(--danger)'} 10%, var(--card))`} stroke={good ? 'var(--success)' : 'var(--danger)'} strokeWidth={2} />
    <text x={x + 78} y={y + 22} textAnchor="middle" fill={good ? 'var(--success)' : 'var(--danger)'} fontSize={12} fontWeight={950}>{label}</text>
  </g>
);

export function PdfLooksFineRejected() {
  return (
    <g>
      <Label x={214} y={48}>PDF opens fine but KDP rejects it</Label>
      <rect x={72} y={104} width={282} height={188} rx={20} fill="var(--card)" stroke="var(--success)" strokeWidth={2.5} />
      <MiniPdf x={154} y={122} />
      <Status x={135} y={326} label="viewer opens" good />
      <path d="M382 206h64m-16-14 16 14-16 14" fill="none" stroke="var(--primary)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      <rect x={476} y={104} width={252} height={188} rx={20} fill="color-mix(in srgb, var(--danger) 7%, var(--card))" stroke="var(--danger)" strokeWidth={2.5} />
      <text x={602} y={154} textAnchor="middle" fill="var(--danger)" fontSize={18} fontWeight={950}>KDP rejected</text>
      <text x={602} y={184} textAnchor="middle" fill="var(--muted-foreground)" fontSize={12} fontWeight={800}>print validation failed</text>
      <MiniPdf x={542} y={206} danger />
    </g>
  );
}

export function KdpPdfValidationPipeline() {
  const steps = ['upload', 'validate', 'preview', 'print check', 'review'];
  return (
    <g>
      <Label x={234} y={48}>how KDP reviews a PDF</Label>
      {steps.map((step, i) => {
        const x = 54 + i * 148;
        const danger = i === 1 || i === 3;
        return (
          <g key={step}>
            <rect x={x} y={144} width={108} height={82} rx={16} fill="var(--card)" stroke={danger ? 'var(--danger)' : 'var(--primary)'} strokeWidth={2.5} />
            <text x={x + 54} y={190} textAnchor="middle" fill={danger ? 'var(--danger)' : 'var(--foreground)'} fontSize={12} fontWeight={950}>{step}</text>
            {i < steps.length - 1 && <path d={`M${x + 116} 185h24m-9-9 9 9-9 9`} fill="none" stroke="var(--primary)" strokeWidth={2.3} strokeLinecap="round" strokeLinejoin="round" />}
          </g>
        );
      })}
      <rect x={178} y={304} width={444} height={42} rx={14} fill="color-mix(in srgb, var(--warning) 10%, var(--card))" stroke="var(--warning)" strokeWidth={2} />
      <text x={400} y={331} textAnchor="middle" fill="var(--foreground)" fontSize={13} fontWeight={900}>successful upload does not mean final approval</text>
    </g>
  );
}

export function PdfRejectionCauseMap() {
  const items = ['trim', 'bleed', 'safe area', 'resolution', 'fonts', 'transparency', 'file size', 'barcode'];
  const nodes = items.map((item, i) => {
    const angle = (Math.PI * 2 * i) / items.length - Math.PI / 2;
    const cx = 400 + Math.cos(angle) * 246;
    const cy = 214 + Math.sin(angle) * 136;
    const dx = cx - 400;
    const dy = cy - 214;
    const length = Math.hypot(dx, dy);
    const start = 104;
    const end = length - 76;
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
      <Label x={236} y={44}>top KDP PDF rejection causes</Label>
      {nodes.map(({ item, x1, y1, x2, y2 }) => (
        <path key={`${item}-line`} d={`M${x1} ${y1}L${x2} ${y2}`} stroke="var(--border)" strokeWidth={2} strokeLinecap="round" />
      ))}
      <rect x={300} y={176} width={200} height={70} rx={20} fill="color-mix(in srgb, var(--danger) 10%, var(--card))" stroke="var(--danger)" strokeWidth={3} />
      <text x={400} y={218} textAnchor="middle" fill="var(--danger)" fontSize={18} fontWeight={950}>PDF rejected</text>
      {nodes.map(({ item, cx, cy }) => (
        <g key={item}>
          <rect x={cx - 58} y={cy - 18} width={116} height={36} rx={11} fill="var(--card)" stroke="var(--primary)" strokeWidth={2} />
          <text x={cx} y={cy + 5} textAnchor="middle" fill="var(--foreground)" fontSize={11} fontWeight={900}>{item}</text>
        </g>
      ))}
    </g>
  );
}

export function WrongTrimSizePdfExample() {
  return (
    <g>
      <Label x={252} y={48}>wrong trim size example</Label>
      <rect x={126} y={96} width={190} height={262} rx={16} fill="var(--card)" stroke="var(--danger)" strokeWidth={3} />
      <rect x={154} y={134} width={134} height={190} rx={8} fill="color-mix(in srgb, var(--danger) 10%, transparent)" stroke="var(--danger)" strokeDasharray="7 6" strokeWidth={2.5} />
      <text x={221} y={390} textAnchor="middle" fill="var(--danger)" fontSize={13} fontWeight={950}>PDF: 8.5 x 11</text>
      <path d="M352 218h96m-16-14 16 14-16 14" fill="none" stroke="var(--primary)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      <rect x={484} y={116} width={170} height={242} rx={16} fill="var(--card)" stroke="var(--success)" strokeWidth={3} />
      <rect x={510} y={150} width={118} height={176} rx={8} fill="color-mix(in srgb, var(--success) 10%, transparent)" stroke="var(--success)" strokeDasharray="7 6" strokeWidth={2.5} />
      <text x={569} y={390} textAnchor="middle" fill="var(--success)" fontSize={13} fontWeight={950}>KDP: 6 x 9</text>
    </g>
  );
}

export function PdfBleedErrorBeforeAfter() {
  return (
    <g>
      <Label x={250} y={48}>bleed error before and after</Label>
      <rect x={118} y={98} width={190} height={250} rx={16} fill="var(--card)" stroke="var(--danger)" strokeWidth={3} />
      <rect x={142} y={126} width={142} height={194} rx={10} fill="color-mix(in srgb, var(--primary) 22%, transparent)" stroke="var(--danger)" strokeDasharray="7 6" strokeWidth={2.5} />
      <text x={213} y={382} textAnchor="middle" fill="var(--danger)" fontSize={13} fontWeight={950}>art stops at trim</text>
      <path d="M348 218h100m-18-14 18 14-18 14" fill="none" stroke="var(--primary)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      <rect x={492} y={82} width={210} height={282} rx={18} fill="color-mix(in srgb, var(--primary) 12%, transparent)" stroke="var(--success)" strokeDasharray="9 7" strokeWidth={3} />
      <rect x={520} y={112} width={154} height={224} rx={12} fill="var(--card)" stroke="var(--success)" strokeWidth={2.5} />
      <text x={597} y={382} textAnchor="middle" fill="var(--success)" fontSize={13} fontWeight={950}>background extends</text>
    </g>
  );
}

export function PdfSafeAreaCorrection() {
  return (
    <g>
      <Label x={252} y={48}>safe area correction</Label>
      <MiniPdf x={142} y={112} danger />
      <rect x={164} y={224} width={52} height={11} rx={5.5} fill="var(--danger)" opacity={0.82} />
      <Status x={123} y={314} label="text near edge" />
      <path d="M344 196h106m-18-14 18 14-18 14" fill="none" stroke="var(--primary)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      <MiniPdf x={536} y={112} />
      <rect x={570} y={204} width={56} height={10} rx={5} fill="var(--success)" opacity={0.8} />
      <Status x={517} y={314} label="inside safe area" good />
    </g>
  );
}

export function FontEmbeddingProblem() {
  return (
    <g>
      <Label x={252} y={48}>font embedding problem</Label>
      <rect x={92} y={110} width={250} height={210} rx={18} fill="var(--card)" stroke="var(--danger)" strokeWidth={2.5} />
      <text x={217} y={170} textAnchor="middle" fill="var(--danger)" fontSize={34} fontWeight={950}>Aa?</text>
      <text x={217} y={220} textAnchor="middle" fill="var(--muted-foreground)" fontSize={12} fontWeight={850}>missing or substituted font</text>
      <Status x={139} y={350} label="not embedded" />
      <path d="M372 210h70m-16-14 16 14-16 14" fill="none" stroke="var(--primary)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      <rect x={474} y={110} width={250} height={210} rx={18} fill="var(--card)" stroke="var(--success)" strokeWidth={2.5} />
      <text x={599} y={170} textAnchor="middle" fill="var(--success)" fontSize={34} fontWeight={950}>Aa</text>
      <text x={599} y={220} textAnchor="middle" fill="var(--muted-foreground)" fontSize={12} fontWeight={850}>font travels inside PDF</text>
      <Status x={521} y={350} label="embedded" good />
    </g>
  );
}

export function TransparencyLayerRejection() {
  const colors = ['var(--primary)', 'var(--warning)', 'var(--danger)', 'var(--success)'];
  return (
    <g>
      <Label x={226} y={48}>transparency and hidden layers</Label>
      <rect x={98} y={110} width={230} height={210} rx={18} fill="var(--card)" stroke="var(--danger)" strokeWidth={2.5} />
      {colors.map((color, i) => <rect key={color} x={120 + i * 16} y={130 + i * 13} width={134} height={98} rx={10} fill={`color-mix(in srgb, ${color} 20%, transparent)`} stroke={color} strokeWidth={2} opacity={0.66} />)}
      <rect x={126} y={274} width={174} height={30} rx={10} fill="color-mix(in srgb, var(--danger) 9%, var(--card))" stroke="var(--danger)" strokeWidth={1.6} />
      <text x={213} y={294} textAnchor="middle" fill="var(--danger)" fontSize={10.5} fontWeight={900}>flatten live effects</text>
      <path d="M362 214h84m-16-14 16 14-16 14" fill="none" stroke="var(--primary)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      <rect x={484} y={110} width={230} height={210} rx={18} fill="var(--card)" stroke="var(--success)" strokeWidth={2.5} />
      <rect x={532} y={146} width={134} height={112} rx={10} fill="color-mix(in srgb, var(--primary) 18%, transparent)" stroke="var(--success)" strokeWidth={2.5} />
      <text x={599} y={286} textAnchor="middle" fill="var(--success)" fontSize={12} fontWeight={900}>flattened upload copy</text>
    </g>
  );
}

export function PdfRejectionTroubleshootingFlow() {
  const steps = ['trim', 'bleed', 'safe area', 'resolution', 'fonts', 'layers', 'file size', 'upload'];
  const cards = steps.map((step, i) => ({
    step,
    i,
    x: 76 + (i % 4) * 166,
    y: i < 4 ? 104 : 266,
  }));
  return (
    <g>
      <Label x={236} y={42}>PDF rejection troubleshooting flow</Label>
      {cards.slice(0, -1).map(({ i, x, y }) => (
        <path
          key={`${i}-connector`}
          d={i === 3 ? 'M634 158v70H136v38' : `M${x + 128} ${y + 27}h28m-10-10 10 10-10 10`}
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
          <rect x={x} y={y} width={120} height={54} rx={14} fill="var(--card)" stroke={i === 7 ? 'var(--success)' : 'var(--primary)'} strokeWidth={2.5} />
          <text x={x + 60} y={y + 34} textAnchor="middle" fill="var(--foreground)" fontSize={12} fontWeight={950}>{step}</text>
        </g>
      ))}
      <Status x={322} y={374} label="re-export once fixed" good />
    </g>
  );
}

export function PdfRejectionPreventionChecklist() {
  const items = ['trim matches', 'bleed verified', 'safe area clear', '300 DPI images', 'fonts embedded', 'layers flattened', 'file optimized', 'barcode clear'];
  return (
    <g>
      <Label x={226} y={44}>prevent KDP PDF rejection</Label>
      <rect x={164} y={78} width={472} height={332} rx={22} fill="var(--card)" stroke="var(--border)" strokeWidth={3} />
      {items.map((item, i) => {
        const x = i < 4 ? 204 : 430;
        const y = 126 + (i % 4) * 58;
        return (
          <g key={item}>
            <circle cx={x} cy={y} r={12} fill="color-mix(in srgb, var(--success) 14%, transparent)" stroke="var(--success)" strokeWidth={2} />
            <path d={`M${x - 6} ${y}l5 5 10-11`} fill="none" stroke="var(--success)" strokeWidth={2.3} strokeLinecap="round" strokeLinejoin="round" />
            <text x={x + 26} y={y + 5} fill="var(--foreground)" fontSize={13} fontWeight={900}>{item}</text>
          </g>
        );
      })}
      <rect x={250} y={362} width={300} height={28} rx={10} fill="color-mix(in srgb, var(--primary) 9%, var(--card))" stroke="var(--primary)" strokeWidth={2} />
      <text x={400} y={381} textAnchor="middle" fill="var(--primary)" fontSize={11} fontWeight={950}>validate the final PDF before upload</text>
    </g>
  );
}
