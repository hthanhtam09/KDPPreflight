import type React from 'react';

export function Label({ x, y, children }: { x: number; y: number; children: React.ReactNode }) {
  return (
    <text x={x} y={y} fill="var(--foreground)" fontSize="18" fontWeight="700">
      {children}
    </text>
  );
}


export function MutedLabel({ x, y, children }: { x: number; y: number; children: React.ReactNode }) {
  return (
    <text x={x} y={y} fill="var(--muted-foreground)" fontSize="14" fontWeight="650">
      {children}
    </text>
  );
}


export function BarcodeBox({ x, y, warning = true }: { x: number; y: number; warning?: boolean }) {
  return (
    <g>
      <rect x={x} y={y} width="88" height="58" rx="8" fill={warning ? 'color-mix(in srgb, var(--danger) 12%, var(--card))' : 'var(--card)'} stroke={warning ? 'var(--danger)' : 'var(--border)'} strokeWidth="3" />
      <rect x={x + 14} y={y + 13} width="8" height="32" fill="var(--foreground)" opacity=".74" />
      <rect x={x + 28} y={y + 13} width="4" height="32" fill="var(--foreground)" opacity=".6" />
      <rect x={x + 38} y={y + 13} width="10" height="32" fill="var(--foreground)" opacity=".7" />
      <rect x={x + 56} y={y + 13} width="5" height="32" fill="var(--foreground)" opacity=".58" />
      <rect x={x + 68} y={y + 13} width="7" height="32" fill="var(--foreground)" opacity=".68" />
    </g>
  );
}


export function CoverPageFrame({ x, y, tone = 'neutral' }: { x: number; y: number; tone?: 'neutral' | 'danger' | 'success' | 'dark' }) {
  const fill =
    tone === 'danger'
      ? 'color-mix(in srgb, var(--danger) 8%, var(--card))'
      : tone === 'success'
        ? 'color-mix(in srgb, var(--success) 8%, var(--card))'
        : tone === 'dark'
          ? '#171923'
          : 'var(--card)';

  return (
    <g>
      <rect x={x} y={y} width="230" height="290" rx="18" fill={fill} stroke="var(--border)" strokeWidth="3" />
      <rect x={x + 22} y={y + 22} width="186" height="246" rx="12" fill="transparent" stroke="var(--primary)" strokeWidth="2.5" strokeDasharray="7 7" opacity=".72" />
      <rect x={x + 46} y={y + 48} width="138" height="190" rx="10" fill="transparent" stroke="var(--success)" strokeWidth="2.5" strokeDasharray="7 7" opacity=".7" />
    </g>
  );
}


export function PageFrame({
  x,
  y,
  danger = false,
  dark = false,
}: {
  x: number;
  y: number;
  danger?: boolean;
  dark?: boolean;
}) {
  return (
    <g>
      <rect x={x} y={y} width={148} height={212} rx={14} fill={danger ? 'color-mix(in srgb, var(--danger) 8%, transparent)' : 'color-mix(in srgb, var(--success) 8%, transparent)'} stroke={danger ? 'var(--danger)' : 'var(--success)'} strokeDasharray="8 8" strokeWidth={2.5} />
      <rect x={x + 14} y={y + 14} width={120} height={184} rx={10} fill={dark ? 'var(--foreground)' : 'var(--card)'} stroke="var(--primary)" strokeWidth={2.5} />
      <rect x={x + 34} y={y + 44} width={80} height={88} rx={8} fill={dark ? 'var(--card)' : 'color-mix(in srgb, var(--primary) 16%, transparent)'} opacity={dark ? '.1' : '1'} />
      <rect x={x + 38} y={y + 152} width={72} height={9} rx={3} fill={dark ? 'var(--card)' : 'var(--foreground)'} opacity={dark ? '.72' : '.18'} />
      <rect x={x + 48} y={y + 170} width={52} height={7} rx={3} fill={dark ? 'var(--card)' : 'var(--foreground)'} opacity={dark ? '.48' : '.12'} />
    </g>
  );
}


export function StatusBadge({ x, y, label, good = false }: { x: number; y: number; label: string; good?: boolean }) {
  return (
    <g>
      <rect x={x} y={y} width={142} height={34} rx={9} fill={`color-mix(in srgb, ${good ? 'var(--success)' : 'var(--danger)'} 11%, var(--card))`} stroke={good ? 'var(--success)' : 'var(--danger)'} strokeWidth={2} />
      <text x={x + 71} y={y + 22} textAnchor="middle" fill={good ? 'var(--success)' : 'var(--danger)'} fontSize="12" fontWeight="900">{label}</text>
    </g>
  );
}


export function CoverPanel({ x, y, w = 190, h = 270, stroke = 'var(--border)', fill = 'var(--card)' }: { x: number; y: number; w?: number; h?: number; stroke?: string; fill?: string }) {
  return <rect x={x} y={y} width={w} height={h} rx={18} fill={fill} stroke={stroke} strokeWidth={3} />;
}


export function SpineWrap({
  x,
  y,
  spineWidth = 58,
  tone = 'neutral',
  panelWidth = 210,
}: {
  x: number;
  y: number;
  spineWidth?: number;
  tone?: 'neutral' | 'danger' | 'success';
  panelWidth?: number;
}) {
  const backWidth = panelWidth;
  const frontWidth = panelWidth;
  const fullWidth = backWidth + spineWidth + frontWidth;
  const stroke = tone === 'danger' ? 'var(--danger)' : tone === 'success' ? 'var(--success)' : 'var(--border)';
  return (
    <g>
      <rect x={x} y={y} width={fullWidth} height={220} rx={16} fill="var(--card)" stroke={stroke} strokeWidth={3} />
      <path d={`M${x + 14} ${y}h${backWidth - 14}v220H${x + 14}A14 14 0 0 1 ${x} ${y + 206}V${y + 14}A14 14 0 0 1 ${x + 14} ${y}Z`} fill="color-mix(in srgb, var(--muted) 68%, transparent)" />
      <rect x={x + backWidth} y={y} width={spineWidth} height={220} fill="color-mix(in srgb, var(--primary) 15%, transparent)" />
      <path d={`M${x + backWidth + spineWidth} ${y}h${frontWidth - 14}A14 14 0 0 1 ${x + fullWidth} ${y + 14}v192A14 14 0 0 1 ${x + fullWidth - 14} ${y + 220}h-${frontWidth - 14}Z`} fill="color-mix(in srgb, var(--surface) 72%, transparent)" />
      <path d={`M${x + backWidth} ${y}v220M${x + backWidth + spineWidth} ${y}v220`} stroke="var(--primary)" strokeWidth={3} strokeDasharray="7 7" />
    </g>
  );
}


