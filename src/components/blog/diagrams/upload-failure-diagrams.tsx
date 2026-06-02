import type React from 'react';
import { Label } from './shared';

const SmallDoc = ({ x, y, tone = 'neutral' }: { x: number; y: number; tone?: 'neutral' | 'danger' | 'success' }) => {
  const stroke = tone === 'danger' ? 'var(--danger)' : tone === 'success' ? 'var(--success)' : 'var(--border)';
  return (
    <g>
      <rect x={x} y={y} width={112} height={146} rx={12} fill="var(--card)" stroke={stroke} strokeWidth={2.5} />
      <path d={`M${x + 84} ${y}l28 28h-28Z`} fill="color-mix(in srgb, var(--muted) 55%, transparent)" stroke="var(--border)" strokeWidth={1.5} />
      <rect x={x + 20} y={y + 48} width={72} height={8} rx={4} fill="var(--foreground)" opacity={0.16} />
      <rect x={x + 20} y={y + 68} width={58} height={7} rx={4} fill="var(--muted-foreground)" opacity={0.22} />
      <rect x={x + 20} y={y + 86} width={66} height={7} rx={4} fill="var(--muted-foreground)" opacity={0.18} />
      {tone === 'danger' && (
        <g>
          <circle cx={x + 90} cy={y + 122} r={16} fill="color-mix(in srgb, var(--danger) 15%, var(--card))" stroke="var(--danger)" strokeWidth={2.5} />
          <text x={x + 90} y={y + 128} textAnchor="middle" fill="var(--danger)" fontSize={18} fontWeight={950}>!</text>
        </g>
      )}
    </g>
  );
};

const Pill = ({ x, y, label, good = false }: { x: number; y: number; label: string; good?: boolean }) => (
  <g>
    <rect x={x} y={y} width={150} height={34} rx={10} fill={`color-mix(in srgb, ${good ? 'var(--success)' : 'var(--danger)'} 10%, var(--card))`} stroke={good ? 'var(--success)' : 'var(--danger)'} strokeWidth={2} />
    <text x={x + 75} y={y + 22} textAnchor="middle" fill={good ? 'var(--success)' : 'var(--danger)'} fontSize={12} fontWeight={950}>{label}</text>
  </g>
);

export function UploadProcessFailurePoints() {
  const steps = [
    ['upload', 'var(--danger)'],
    ['storage', 'var(--primary)'],
    ['validate', 'var(--danger)'],
    ['preview', 'var(--warning)'],
    ['review', 'var(--success)'],
  ];
  return (
    <g>
      <Label x={236} y={48}>where KDP uploads fail</Label>
      {steps.map(([step, color], i) => {
        const x = 54 + i * 148;
        return (
          <g key={step}>
            <rect x={x} y={142} width={110} height={82} rx={16} fill="var(--card)" stroke={color} strokeWidth={2.5} />
            <circle cx={x + 55} cy={170} r={11} fill={`color-mix(in srgb, ${color} 14%, transparent)`} stroke={color} strokeWidth={2} />
            <text x={x + 55} y={203} textAnchor="middle" fill="var(--foreground)" fontSize={12} fontWeight={950}>{step}</text>
            {i < steps.length - 1 && <path d={`M${x + 120} 183h20m-8-8 8 8-8 8`} fill="none" stroke="var(--primary)" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" opacity={0.75} />}
          </g>
        );
      })}
      <rect x={166} y={306} width={468} height={42} rx={14} fill="color-mix(in srgb, var(--danger) 8%, var(--card))" stroke="var(--danger)" strokeWidth={2} />
      <text x={400} y={332} textAnchor="middle" fill="var(--danger)" fontSize={13} fontWeight={900}>a failure can happen before KDP ever reviews the book</text>
    </g>
  );
}

export function UploadFailedVsRejected() {
  const cards = [
    ['Upload failed', 'file never completes', 'var(--danger)'],
    ['Preview failed', 'rendering stalls', 'var(--warning)'],
    ['PDF rejected', 'validation fails', 'var(--danger)'],
    ['Approved', 'passes review', 'var(--success)'],
  ];
  return (
    <g>
      <Label x={214} y={48}>upload failed vs rejected</Label>
      {cards.map(([title, note, color], i) => {
        const x = 54 + i * 186;
        return (
          <g key={title}>
            <rect x={x} y={122} width={142} height={174} rx={18} fill="var(--card)" stroke={color} strokeWidth={2.5} />
            <SmallDoc x={x + 28} y={144} tone={title === 'Approved' ? 'success' : title === 'Preview failed' ? 'neutral' : 'danger'} />
            <text x={x + 71} y={334} textAnchor="middle" fill={color} fontSize={12} fontWeight={950}>{title}</text>
            <text x={x + 71} y={354} textAnchor="middle" fill="var(--muted-foreground)" fontSize={9.5} fontWeight={800}>{note}</text>
          </g>
        );
      })}
    </g>
  );
}

export function UploadFailureCauseMap() {
  const items = ['browser', 'file size', 'format', 'PDF', 'internet', 'filename', 'KDP settings'];
  const nodes = items.map((item, i) => {
    const angle = (Math.PI * 2 * i) / items.length - Math.PI / 2;
    const cx = 400 + Math.cos(angle) * 244;
    const cy = 214 + Math.sin(angle) * 136;
    const dx = cx - 400;
    const dy = cy - 214;
    const length = Math.hypot(dx, dy);
    return {
      item,
      cx,
      cy,
      x1: 400 + (dx / length) * 104,
      y1: 214 + (dy / length) * 104,
      x2: 400 + (dx / length) * (length - 78),
      y2: 214 + (dy / length) * (length - 78),
    };
  });
  return (
    <g>
      <Label x={232} y={44}>top upload failure causes</Label>
      {nodes.map(({ item, x1, y1, x2, y2 }) => <path key={`${item}-line`} d={`M${x1} ${y1}L${x2} ${y2}`} stroke="var(--border)" strokeWidth={2} strokeLinecap="round" />)}
      <rect x={294} y={176} width={212} height={70} rx={20} fill="color-mix(in srgb, var(--danger) 10%, var(--card))" stroke="var(--danger)" strokeWidth={3} />
      <text x={400} y={218} textAnchor="middle" fill="var(--danger)" fontSize={18} fontWeight={950}>Upload Failed</text>
      {nodes.map(({ item, cx, cy }) => (
        <g key={item}>
          <rect x={cx - 62} y={cy - 18} width={124} height={36} rx={11} fill="var(--card)" stroke="var(--primary)" strokeWidth={2} />
          <text x={cx} y={cy + 5} textAnchor="middle" fill="var(--foreground)" fontSize={11} fontWeight={900}>{item}</text>
        </g>
      ))}
    </g>
  );
}

export function LargePdfUploadProblem() {
  return (
    <g>
      <Label x={246} y={48}>large PDF upload problem</Label>
      <SmallDoc x={126} y={112} tone="danger" />
      <rect x={96} y={288} width={172} height={36} rx={11} fill="color-mix(in srgb, var(--danger) 10%, var(--card))" stroke="var(--danger)" strokeWidth={2} />
      <text x={182} y={311} textAnchor="middle" fill="var(--danger)" fontSize={13} fontWeight={950}>420 MB PDF</text>
      <path d="M312 204h106m-18-14 18 14-18 14" fill="none" stroke="var(--primary)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      <rect x={456} y={128} width={218} height={126} rx={18} fill="var(--card)" stroke="var(--success)" strokeWidth={2.5} />
      <rect x={486} y={166} width={154} height={18} rx={9} fill="color-mix(in srgb, var(--success) 18%, transparent)" />
      <rect x={486} y={166} width={96} height={18} rx={9} fill="var(--success)" opacity={0.75} />
      <text x={565} y={220} textAnchor="middle" fill="var(--success)" fontSize={14} fontWeight={950}>optimized assets</text>
      <Pill x={490} y={288} label="upload completes" good />
    </g>
  );
}

export function FilenameProblemExample() {
  return (
    <g>
      <Label x={246} y={48}>bad filename vs good filename</Label>
      <rect x={86} y={116} width={288} height={200} rx={18} fill="var(--card)" stroke="var(--danger)" strokeWidth={2.5} />
      {['My Book Final!!!.pdf', 'cover ❤️ version 2.pdf', 'manuscript(NEW)#1.pdf'].map((name, i) => (
        <g key={name}>
          <rect x={112} y={148 + i * 48} width={236} height={32} rx={9} fill="color-mix(in srgb, var(--danger) 8%, transparent)" stroke="var(--danger)" strokeWidth={1.5} />
          <text x={230} y={169 + i * 48} textAnchor="middle" fill="var(--danger)" fontSize={11} fontWeight={850}>{name}</text>
        </g>
      ))}
      <rect x={454} y={116} width={260} height={200} rx={18} fill="var(--card)" stroke="var(--success)" strokeWidth={2.5} />
      {['book-title-interior.pdf', 'book-title-cover.pdf'].map((name, i) => (
        <g key={name}>
          <rect x={482} y={164 + i * 56} width={204} height={34} rx={9} fill="color-mix(in srgb, var(--success) 9%, transparent)" stroke="var(--success)" strokeWidth={1.5} />
          <text x={584} y={186 + i * 56} textAnchor="middle" fill="var(--success)" fontSize={11} fontWeight={900}>{name}</text>
        </g>
      ))}
    </g>
  );
}

export function BrowserUploadTroubleshooting() {
  const browsers = ['Chrome', 'Firefox', 'Safari', 'Edge'];
  return (
    <g>
      <Label x={224} y={48}>browser upload troubleshooting</Label>
      {browsers.map((name, i) => {
        const x = 86 + i * 166;
        return (
          <g key={name}>
            <rect x={x} y={124} width={126} height={126} rx={20} fill="var(--card)" stroke="var(--primary)" strokeWidth={2.5} />
            <circle cx={x + 63} cy={x === 86 ? 169 : 170} r={27} fill="color-mix(in srgb, var(--primary) 14%, transparent)" stroke="var(--primary)" strokeWidth={2.5} />
            <text x={x + 63} y={298} textAnchor="middle" fill="var(--foreground)" fontSize={13} fontWeight={950}>{name}</text>
          </g>
        );
      })}
      <rect x={174} y={346} width={452} height={38} rx={13} fill="color-mix(in srgb, var(--warning) 10%, var(--card))" stroke="var(--warning)" strokeWidth={2} />
      <text x={400} y={370} textAnchor="middle" fill="var(--foreground)" fontSize={12} fontWeight={900}>try a clean browser before rebuilding the file</text>
    </g>
  );
}

export function ColoringBookUploadIssues() {
  return (
    <g>
      <Label x={220} y={48}>coloring book upload bottlenecks</Label>
      <rect x={108} y={92} width={218} height={264} rx={18} fill="var(--card)" stroke="var(--danger)" strokeWidth={2.5} />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={142 + i * 8} y={126 + i * 8} width={112} height={142} rx={8} fill="color-mix(in srgb, var(--danger) 7%, var(--card))" stroke="var(--danger)" strokeWidth={1.5} opacity={0.88} />
      ))}
      <text x={217} y={312} textAnchor="middle" fill="var(--danger)" fontSize={13} fontWeight={950}>huge repeated pages</text>
      <path d="M364 216h80m-16-14 16 14-16 14" fill="none" stroke="var(--primary)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      <rect x={482} y={120} width={220} height={208} rx={18} fill="var(--card)" stroke="var(--success)" strokeWidth={2.5} />
      <text x={592} y={170} textAnchor="middle" fill="var(--success)" fontSize={15} fontWeight={950}>optimized PDF</text>
      <rect x={530} y={202} width={124} height={18} rx={9} fill="var(--success)" opacity={0.58} />
      <rect x={548} y={236} width={88} height={12} rx={6} fill="var(--foreground)" opacity={0.15} />
      <text x={592} y={304} textAnchor="middle" fill="var(--muted-foreground)" fontSize={11} fontWeight={850}>flattened · right DPI</text>
    </g>
  );
}

export function UploadTroubleshootingFlowchart() {
  const steps = ['format', 'file size', 'filename', 'browser', 'PDF', 'internet', 'try again'];
  const cards = steps.map((step, i) => ({ step, i, x: 84 + (i % 4) * 162, y: i < 4 ? 104 : 268 }));
  return (
    <g>
      <Label x={230} y={42}>KDP upload troubleshooting flow</Label>
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
      <Pill x={324} y={374} label="clean upload" good />
    </g>
  );
}

export function UploadChecklistDiagram() {
  const items = ['PDF format', 'simple filename', 'file optimized', 'browser clean', 'cache cleared', 'internet stable', 'KDP settings match', 'fresh export'];
  return (
    <g>
      <Label x={260} y={44}>upload checklist</Label>
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
      <rect x={252} y={362} width={296} height={28} rx={10} fill="color-mix(in srgb, var(--primary) 9%, var(--card))" stroke="var(--primary)" strokeWidth={2} />
      <text x={400} y={381} textAnchor="middle" fill="var(--primary)" fontSize={11} fontWeight={950}>upload after the file passes checks</text>
    </g>
  );
}
