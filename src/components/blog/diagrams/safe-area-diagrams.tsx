import type React from 'react';
import { Label, MutedLabel, CoverPanel, StatusBadge } from './shared';

export function CoverSafeAreaMap() {
  return (
    <g>
      <Label x={244} y={44}>safe area vs bleed vs trim</Label>
      <rect x={222} y={72} width={356} height={314} rx={22} fill="color-mix(in srgb, var(--danger) 9%, transparent)" stroke="var(--danger)" strokeDasharray="9 9" strokeWidth={3} />
      <rect x={258} y={108} width={284} height={242} rx={18} fill="var(--card)" stroke="var(--primary)" strokeWidth={3} />
      <rect x={312} y={160} width={176} height={138} rx={14} fill="color-mix(in srgb, var(--success) 11%, transparent)" stroke="var(--success)" strokeDasharray="8 8" strokeWidth={3} />
      <text x={400} y={132} textAnchor="middle" fill="var(--primary)" fontSize={15} fontWeight={900}>trim line</text>
      <text x={400} y={226} textAnchor="middle" fill="var(--success)" fontSize={18} fontWeight={900}>safe text</text>
      <text x={400} y={253} textAnchor="middle" fill="var(--muted-foreground)" fontSize={12} fontWeight={800}>protected zone</text>
      <rect x={92} y={96} width={104} height={38} rx={10} fill="color-mix(in srgb, var(--danger) 10%, var(--card))" stroke="var(--danger)" strokeWidth={2.5} />
      <text x={144} y={120} textAnchor="middle" fill="var(--danger)" fontSize={14} fontWeight={900}>bleed</text>
      <rect x={604} y={108} width={104} height={38} rx={10} fill="color-mix(in srgb, var(--primary) 10%, var(--card))" stroke="var(--primary)" strokeWidth={2.5} />
      <text x={656} y={132} textAnchor="middle" fill="var(--primary)" fontSize={14} fontWeight={900}>trim</text>
      <rect x={604} y={246} width={104} height={38} rx={10} fill="color-mix(in srgb, var(--success) 10%, var(--card))" stroke="var(--success)" strokeWidth={2.5} />
      <text x={656} y={270} textAnchor="middle" fill="var(--success)" fontSize={14} fontWeight={900}>safe area</text>
    </g>
  );
}


export function SafeTextPlacement() {
  return (
    <g>
      <Label x={278} y={50}>safe text placement</Label>
      <CoverPanel x={288} y={78} w={224} h={312} stroke="var(--success)" fill="color-mix(in srgb, var(--primary) 5%, var(--card))" />
      <rect x={326} y={126} width={148} height={216} rx={12} fill="transparent" stroke="var(--success)" strokeDasharray="8 8" strokeWidth={3} />
      <rect x={338} y={156} width={124} height={42} rx={10} fill="var(--foreground)" opacity=".82" />
      <text x={400} y={184} textAnchor="middle" fill="var(--card)" fontSize={17} fontWeight={950}>TITLE</text>
      <rect x={352} y={226} width={96} height={18} rx={8} fill="var(--primary)" opacity=".62" />
      <rect x={362} y={306} width={76} height={16} rx={8} fill="var(--foreground)" opacity=".42" />
      <text x={92} y={178} fill="var(--success)" fontSize={16} fontWeight={900}>inward spacing</text>
      <path d="M236 174h74" stroke="var(--success)" strokeWidth={3} strokeDasharray="7 7" />
      <text x={556} y={326} fill="var(--muted-foreground)" fontSize={14} fontWeight={800}>author name safe</text>
    </g>
  );
}


export function UnsafeEdgePlacement() {
  return (
    <g>
      <Label x={266} y={50}>unsafe edge placement</Label>
      <CoverPanel x={288} y={78} w={224} h={312} stroke="var(--danger)" />
      <rect x={324} y={118} width={152} height={232} rx={12} fill="transparent" stroke="var(--success)" strokeDasharray="8 8" strokeWidth={3} opacity=".85" />
      <rect x={246} y={142} width={156} height={38} rx={10} fill="color-mix(in srgb, var(--danger) 12%, var(--card))" stroke="var(--danger)" strokeWidth={3} />
      <text x={324} y={167} textAnchor="middle" fill="var(--danger)" fontSize={16} fontWeight={950}>TITLE</text>
      <rect x={354} y={354} width={92} height={18} rx={8} fill="color-mix(in srgb, var(--danger) 70%, transparent)" />
      <circle cx={512} cy={362} r={20} fill="var(--card)" stroke="var(--danger)" strokeWidth={4} />
      <text x={506} y={371} fill="var(--danger)" fontSize={25} fontWeight={950}>!</text>
      <text x={76} y={226} fill="var(--danger)" fontSize={14} fontWeight={900}>outside safe zone</text>
      <text x={538} y={366} fill="var(--danger)" fontSize={14} fontWeight={900}>too low</text>
    </g>
  );
}


export function SubtitleTrimSimulation() {
  return (
    <g>
      <Label x={248} y={48}>subtitle trim simulation</Label>
      <CoverPanel x={112} y={88} w={216} h={286} stroke="var(--danger)" />
      <rect x={146} y={126} width={148} height={44} rx={12} fill="var(--foreground)" opacity=".82" />
      <text x={220} y={155} textAnchor="middle" fill="var(--card)" fontSize={17} fontWeight={950}>TITLE</text>
      <rect x={126} y={316} width={188} height={34} rx={12} fill="var(--card)" stroke="var(--danger)" strokeWidth={3} />
      <text x={220} y={338} textAnchor="middle" fill="var(--danger)" fontSize={14} fontWeight={950}>subtitle too low</text>
      <path d="M112 326h216" stroke="var(--danger)" strokeWidth={4} strokeDasharray="8 8" />
      <rect x={144} y={394} width={152} height={30} rx={9} fill="color-mix(in srgb, var(--danger) 10%, var(--card))" />
      <text x={220} y={414} textAnchor="middle" fill="var(--danger)" fontSize={14} fontWeight={950}>trim can clip</text>

      <CoverPanel x={472} y={88} w={216} h={286} stroke="var(--success)" />
      <rect x={506} y={126} width={148} height={44} rx={12} fill="var(--foreground)" opacity=".82" />
      <text x={580} y={155} textAnchor="middle" fill="var(--card)" fontSize={17} fontWeight={950}>TITLE</text>
      <rect x={502} y={276} width={156} height={30} rx={11} fill="var(--card)" stroke="var(--success)" strokeWidth={3} />
      <text x={580} y={296} textAnchor="middle" fill="var(--success)" fontSize={14} fontWeight={950}>subtitle safe</text>
      <path d="M472 334h216" stroke="var(--danger)" strokeWidth={3} strokeDasharray="8 8" opacity=".55" />
      <rect x={510} y={394} width={140} height={30} rx={9} fill="color-mix(in srgb, var(--success) 10%, var(--card))" />
      <text x={580} y={414} textAnchor="middle" fill="var(--success)" fontSize={14} fontWeight={950}>space remains</text>
    </g>
  );
}


export function BorderTrimRisk() {
  return (
    <g>
      <Label x={264} y={48}>border trim risk</Label>
      <CoverPanel x={104} y={94} w={216} h={274} stroke="var(--danger)" />
      <rect x={118} y={108} width={188} height={246} rx={12} fill="transparent" stroke="var(--danger)" strokeWidth={5} />
      <path d="M104 94h216v24H104Z" fill="var(--card)" opacity=".8" />
      <text x={150} y={405} fill="var(--danger)" fontSize={13} fontWeight={900}>thin border shifted</text>

      <CoverPanel x={480} y={94} w={216} h={274} stroke="var(--success)" />
      <rect x={526} y={144} width={124} height={174} rx={12} fill="transparent" stroke="var(--success)" strokeWidth={5} />
      <rect x={544} y={186} width={88} height={20} rx={8} fill="var(--foreground)" opacity=".35" />
      <text x={526} y={405} fill="var(--success)" fontSize={13} fontWeight={900}>border moved inward</text>
    </g>
  );
}


export function CanvaSafeAreaWorkflow() {
  const steps = [
    ['Guides on', 'bleed visible'],
    ['Text inward', 'safe zone'],
    ['PDF Print', 'clean export'],
    ['Preflight', 'final check'],
  ];
  return (
    <g>
      <Label x={232} y={48}>Canva safe-area workflow</Label>
      {steps.map(([top, bottom], index) => {
        const x = 70 + index * 178;
        return (
          <g key={top}>
            <rect x={x} y={132} width={132} height={92} rx={16} fill="var(--card)" stroke={index === 3 ? 'var(--success)' : 'var(--primary)'} strokeWidth={3} />
            <text x={x + 66} y={169} textAnchor="middle" fill="var(--foreground)" fontSize={14} fontWeight={900}>{top}</text>
            <text x={x + 66} y={196} textAnchor="middle" fill="var(--muted-foreground)" fontSize={12} fontWeight={800}>{bottom}</text>
            {index < steps.length - 1 && <path d={`M${x + 142} 178h28`} stroke="var(--primary)" strokeWidth={3} strokeDasharray="7 7" />}
          </g>
        );
      })}
      <rect x={204} y={286} width={392} height={72} rx={16} fill="color-mix(in srgb, var(--danger) 7%, var(--card))" stroke="var(--danger)" strokeDasharray="8 8" strokeWidth={2.5} />
      <rect x={244} y={304} width={312} height={36} rx={10} fill="color-mix(in srgb, var(--success) 9%, transparent)" stroke="var(--success)" strokeDasharray="7 7" strokeWidth={2.5} />
      <text x={400} y={328} textAnchor="middle" fill="var(--success)" fontSize={13} fontWeight={900}>keep important elements inside guides</text>
    </g>
  );
}


export function SafeSpacingMeasurement() {
  return (
    <g>
      <Label x={214} y={48}>correct spacing measurement</Label>
      <CoverPanel x={300} y={78} w={200} h={306} stroke="var(--primary)" />
      <rect x={342} y={130} width={116} height={202} rx={12} fill="transparent" stroke="var(--success)" strokeDasharray="8 8" strokeWidth={3} />
      <rect x={354} y={166} width={92} height={34} rx={9} fill="var(--foreground)" opacity=".78" />
      <text x={400} y={189} textAnchor="middle" fill="var(--card)" fontSize={14} fontWeight={950}>TITLE</text>
      <path d="M300 110h42" stroke="var(--success)" strokeWidth={3} />
      <path d="M300 102v16M342 102v16" stroke="var(--success)" strokeWidth={3} />
      <text x={84} y={114} fill="var(--success)" fontSize={14} fontWeight={900}>extra safety margin</text>
      <path d="M230 110h66" stroke="var(--success)" strokeWidth={3} strokeDasharray="7 7" />
      <path d="M500 356h-42" stroke="var(--danger)" strokeWidth={3} />
      <path d="M500 348v16M458 348v16" stroke="var(--danger)" strokeWidth={3} />
      <text x={538} y={362} fill="var(--danger)" fontSize={14} fontWeight={900}>trim tolerance</text>
    </g>
  );
}


export function FullBlackTrimRisk() {
  return (
    <g>
      <Label x={254} y={48}>full-black trim example</Label>
      <rect x={114} y={92} width={218} height={284} rx={18} fill="#111827" stroke="var(--danger)" strokeWidth={3} />
      <rect x={114} y={92} width={14} height={284} fill="var(--card)" opacity=".95" />
      <text x={190} y={226} fill="white" fontSize={22} fontWeight={950}>DARK</text>
      <text x={164} y={406} fill="var(--danger)" fontSize={13} fontWeight={900}>white sliver visible</text>

      <rect x={470} y={76} width={250} height={316} rx={22} fill="#111827" stroke="var(--success)" strokeDasharray="8 8" strokeWidth={3} />
      <rect x={496} y={102} width={198} height={264} rx={18} fill="#111827" stroke="var(--success)" strokeWidth={3} />
      <text x={560} y={226} fill="white" fontSize={22} fontWeight={950}>DARK</text>
      <text x={520} y={406} fill="var(--success)" fontSize={13} fontWeight={900}>black extends into bleed</text>
    </g>
  );
}


export function SafeCoverComposition() {
  return (
    <g>
      <Label x={238} y={48}>safe layout composition</Label>
      <CoverPanel x={276} y={78} w={248} h={312} stroke="var(--success)" fill="color-mix(in srgb, var(--primary) 5%, var(--card))" />
      <rect x={320} y={124} width={160} height={220} rx={14} fill="transparent" stroke="var(--success)" strokeDasharray="8 8" strokeWidth={3} />
      <rect x={348} y={152} width={104} height={56} rx={12} fill="var(--foreground)" opacity=".85" />
      <text x={400} y={186} textAnchor="middle" fill="var(--card)" fontSize={15} fontWeight={950}>TITLE</text>
      <rect x={356} y={232} width={88} height={18} rx={8} fill="var(--primary)" opacity=".58" />
      <circle cx={400} cy={286} r={22} fill="color-mix(in srgb, var(--primary) 16%, transparent)" stroke="var(--primary)" strokeWidth={2.5} />
      <rect x={362} y={322} width={76} height={16} rx={8} fill="var(--foreground)" opacity=".32" />
      <text x={88} y={178} fill="var(--muted-foreground)" fontSize={13} fontWeight={800}>balanced hierarchy</text>
      <text x={548} y={326} fill="var(--muted-foreground)" fontSize={13} fontWeight={800}>safe author area</text>
    </g>
  );
}


export function EdgeRiskComparison() {
  return (
    <g>
      <Label x={246} y={48}>edge-risk comparison</Label>
      <CoverPanel x={92} y={96} w={220} h={270} stroke="var(--danger)" />
      <rect x={76} y={132} width={156} height={34} rx={9} fill="color-mix(in srgb, var(--danger) 13%, var(--card))" stroke="var(--danger)" strokeWidth={2.5} />
      <text x={154} y={154} textAnchor="middle" fill="var(--danger)" fontSize={13} fontWeight={900}>edge title</text>
      <rect x={122} y={330} width={166} height={20} rx={8} fill="color-mix(in srgb, var(--danger) 18%, var(--card))" stroke="var(--danger)" strokeWidth={2.5} />
      <text x={146} y={406} fill="var(--danger)" fontSize={13} fontWeight={900}>high risk</text>

      <CoverPanel x={488} y={96} w={220} h={270} stroke="var(--success)" />
      <rect x={532} y={144} width={132} height={44} rx={10} fill="var(--foreground)" opacity=".78" />
      <text x={598} y={172} textAnchor="middle" fill="var(--card)" fontSize={14} fontWeight={950}>TITLE</text>
      <rect x={544} y={250} width={108} height={18} rx={8} fill="var(--primary)" opacity=".58" />
      <rect x={556} y={310} width={84} height={16} rx={8} fill="var(--foreground)" opacity=".32" />
      <text x={550} y={406} fill="var(--success)" fontSize={13} fontWeight={900}>low risk</text>
    </g>
  );
}


export function TrimSafeZoneAnatomy() {
  // Bleed outer: x=120, y=34, w=560, h=340
  // Trim (cover): x=145, y=58, w=510, h=292
  // Safe zone: x=205, y=118, w=390, h=172
  const bx = 120, by = 34, bw = 560, bh = 340;
  const cx = 145, cy = 58, cw = 510, ch = 292;
  const sx = 205, sy = 118, sw = 390, sh = 172;
  const scx = sx + sw / 2;

  return (
    <g>
      <Label x={240} y={24}>bleed · trim line · safe area — three print zones</Label>

      {/* Bleed zone fill + border */}
      <rect x={bx} y={by} width={bw} height={bh} rx={8}
        fill="color-mix(in srgb, var(--danger) 6%, transparent)"
        stroke="var(--danger)" strokeWidth={2} strokeDasharray="8 5" />

      {/* Cover / trim face */}
      <rect x={cx} y={cy} width={cw} height={ch} rx={4}
        fill="color-mix(in srgb, var(--primary) 7%, var(--card))"
        stroke="color-mix(in srgb, var(--foreground) 55%, transparent)" strokeWidth={2.5} strokeDasharray="10 5" />

      {/* Safe area zone */}
      <rect x={sx} y={sy} width={sw} height={sh} rx={10}
        fill="color-mix(in srgb, var(--success) 9%, transparent)"
        stroke="var(--success)" strokeWidth={2} strokeDasharray="6 4" />

      {/* Content inside safe zone */}
      <rect x={scx - 110} y={sy + 30} width={220} height={28} rx={6} fill="var(--foreground)" opacity={0.82} />
      <text x={scx} y={sy + 50} textAnchor="middle" fill="var(--card)" fontSize={13} fontWeight={950}>BOOK TITLE</text>
      <rect x={scx - 70} y={sy + 68} width={140} height={10} rx={4} fill="var(--muted-foreground)" opacity={0.35} />
      <text x={scx} y={sy + 104} textAnchor="middle" dominantBaseline="middle" fill="var(--muted-foreground)" fontSize={11} fontWeight={700}>Author Name</text>

      {/* Zone labels — top-left corners */}
      <rect x={bx + 6} y={by + 6} width={78} height={22} rx={5} fill="color-mix(in srgb, var(--danger) 10%, var(--card))" stroke="var(--danger)" strokeWidth={1.5} />
      <text x={bx + 14} y={by + 21} fill="var(--danger)" fontSize={11} fontWeight={950}>bleed zone</text>

      <rect x={cx + 6} y={cy + 6} width={72} height={22} rx={5} fill="var(--card)" stroke="color-mix(in srgb, var(--foreground) 50%, transparent)" strokeWidth={1.5} />
      <text x={cx + 14} y={cy + 21} fill="var(--foreground)" fontSize={11} fontWeight={850}>trim line</text>

      <rect x={sx + 6} y={sy + 6} width={70} height={22} rx={5} fill="color-mix(in srgb, var(--success) 10%, var(--card))" stroke="var(--success)" strokeWidth={1.5} />
      <text x={sx + 14} y={sy + 21} fill="var(--success)" fontSize={11} fontWeight={950}>safe area</text>

      {/* Bottom annotation bar */}
      <rect x={bx} y={by + bh + 14} width={174} height={36} rx={8} fill="color-mix(in srgb, var(--danger) 7%, var(--card))" stroke="var(--danger)" strokeWidth={1.5} />
      <text x={bx + 87} y={by + bh + 28} textAnchor="middle" fill="var(--danger)" fontSize={11} fontWeight={950}>bleed</text>
      <text x={bx + 87} y={by + bh + 44} textAnchor="middle" fill="var(--muted-foreground)" fontSize={10}>artwork extends here</text>

      <rect x={bx + 193} y={by + bh + 14} width={174} height={36} rx={8} fill="var(--card)" stroke="var(--border)" strokeWidth={1.5} />
      <text x={bx + 280} y={by + bh + 28} textAnchor="middle" fill="var(--foreground)" fontSize={11} fontWeight={950}>trim line</text>
      <text x={bx + 280} y={by + bh + 44} textAnchor="middle" fill="var(--muted-foreground)" fontSize={10}>final cut edge</text>

      <rect x={bx + 386} y={by + bh + 14} width={174} height={36} rx={8} fill="color-mix(in srgb, var(--success) 7%, var(--card))" stroke="var(--success)" strokeWidth={1.5} />
      <text x={bx + 473} y={by + bh + 28} textAnchor="middle" fill="var(--success)" fontSize={11} fontWeight={950}>safe area</text>
      <text x={bx + 473} y={by + bh + 44} textAnchor="middle" fill="var(--muted-foreground)" fontSize={10}>text belongs here</text>
    </g>
  );
}


export function UnsafeTextPlacementExamples() {
  // Cover: x=262, y=68, w=340, h=314 — leaves room for side callouts
  const cx = 262, cy = 68, cw = 340, ch = 314;
  // Safe zone inset 52px
  const sx = cx + 52, sy = cy + 52, sw = cw - 104, sh = ch - 104;

  // Left callout label: line from cover-left to label box (x=16–240)
  const LWarn = ({ y, label }: { y: number; label: string }) => (
    <g>
      <path d={`M16 ${y}H${cx - 4}`} stroke="var(--danger)" strokeWidth={1.5} strokeDasharray="5 4" />
      <rect x={16} y={y - 13} width={220} height={26} rx={7}
        fill="color-mix(in srgb, var(--danger) 7%, var(--card))" stroke="var(--danger)" strokeWidth={1.5} />
      <circle cx={32} cy={y} r={11}
        fill="color-mix(in srgb, var(--danger) 14%, transparent)" />
      <text x={32} y={y} textAnchor="middle" dominantBaseline="central"
        fill="var(--danger)" fontSize={11} fontWeight={950}>!</text>
      <text x={52} y={y} dominantBaseline="middle"
        fill="var(--danger)" fontSize={11} fontWeight={850}>{label}</text>
    </g>
  );

  // Right callout label: line from cover-right to label box (x=606–784)
  const RWarn = ({ y, label }: { y: number; label: string }) => (
    <g>
      <path d={`M${cx + cw + 4} ${y}H${cx + cw + 26}`} stroke="var(--danger)" strokeWidth={1.5} strokeDasharray="5 4" />
      <rect x={cx + cw + 28} y={y - 13} width={144} height={26} rx={7}
        fill="color-mix(in srgb, var(--danger) 7%, var(--card))" stroke="var(--danger)" strokeWidth={1.5} />
      <circle cx={cx + cw + 44} cy={y} r={11}
        fill="color-mix(in srgb, var(--danger) 14%, transparent)" />
      <text x={cx + cw + 44} y={y} textAnchor="middle" dominantBaseline="central"
        fill="var(--danger)" fontSize={11} fontWeight={950}>!</text>
      <text x={cx + cw + 64} y={y} dominantBaseline="middle"
        fill="var(--danger)" fontSize={11} fontWeight={850}>{label}</text>
    </g>
  );

  return (
    <g>
      <Label x={228} y={46}>common unsafe text placements — all flagged by KDP</Label>

      {/* Cover background */}
      <rect x={cx} y={cy} width={cw} height={ch} rx={4}
        fill="color-mix(in srgb, var(--primary) 8%, var(--card))" stroke="var(--border)" strokeWidth={2} />

      {/* Safe zone boundary */}
      <rect x={sx} y={sy} width={sw} height={sh} rx={8}
        fill="transparent" stroke="var(--success)" strokeWidth={1.5} strokeDasharray="6 4" />
      <text x={cx + cw / 2} y={cy + ch / 2} textAnchor="middle" dominantBaseline="middle"
        fill="var(--success)" fontSize={12} fontWeight={700} opacity={0.45}>safe area</text>

      {/* 1. Title bar — top trim zone */}
      <rect x={cx} y={cy} width={cw} height={34} rx={3}
        fill="color-mix(in srgb, var(--foreground) 72%, transparent)" />
      <text x={cx + cw / 2} y={cy + 17} textAnchor="middle" dominantBaseline="central"
        fill="var(--card)" fontSize={12} fontWeight={950}>TITLE — too close to top</text>

      {/* 2. Subtitle bar — bottom trim zone */}
      <rect x={cx} y={cy + ch - 30} width={cw} height={30}
        fill="var(--muted-foreground)" opacity={0.35} />
      <text x={cx + cw / 2} y={cy + ch - 15} textAnchor="middle" dominantBaseline="central"
        fill="var(--card)" fontSize={11} fontWeight={850}>Subtitle — near bottom edge</text>

      {/* 3. Left border strip */}
      <rect x={cx} y={cy} width={5} height={ch} fill="var(--muted-foreground)" opacity={0.5} />

      {/* 4. Right border strip */}
      <rect x={cx + cw - 5} y={cy} width={5} height={ch} fill="var(--muted-foreground)" opacity={0.5} />

      {/* 5. Corner logo upper-right */}
      <rect x={cx + cw - 44} y={cy} width={44} height={34} rx={3}
        fill="color-mix(in srgb, var(--primary) 28%, transparent)" stroke="var(--primary)" strokeWidth={1.5} />
      <text x={cx + cw - 22} y={cy + 17} textAnchor="middle" dominantBaseline="central"
        fill="var(--primary)" fontSize={9} fontWeight={950}>LOGO</text>

      {/* Left callouts — staggered y positions */}
      <LWarn y={cy + 17}   label="title near top" />
      <LWarn y={cy + ch / 2} label="left border" />
      <LWarn y={cy + ch - 15} label="subtitle" />

      {/* Right callouts */}
      <RWarn y={cy + 17}   label="corner logo" />
      <RWarn y={cy + ch / 2} label="right border" />
    </g>
  );
}


export function SafeAreaMistakesGrid() {
  const mistakes = [
    { label: 'Border near trim', sub: 'shifts look uneven', color: 'var(--danger)' },
    { label: 'Title near edge', sub: 'top or side risk', color: 'var(--danger)' },
    { label: 'Tiny margins', sub: 'underestimate shift', color: 'var(--danger)' },
    { label: 'Canva snap error', sub: 'centered ≠ safe', color: 'var(--danger)' },
    { label: 'No template', sub: 'wrong safe zone', color: 'var(--danger)' },
    { label: 'Spine overflow', sub: 'text exits spine', color: 'var(--danger)' },
  ];
  const cols = 3, bw = 220, bh = 104, gx = 24, gy = 32;
  const totalW = cols * bw + (cols - 1) * gx;
  const startX = (800 - totalW) / 2;
  const startY = 72;

  return (
    <g>
      <Label x={232} y={46}>6 common safe area mistakes on KDP covers</Label>
      {mistakes.map(({ label, sub, color }, i) => {
        const col = i % cols, row = Math.floor(i / cols);
        const bx = startX + col * (bw + gx);
        const by = startY + row * (bh + gy);
        return (
          <g key={label}>
            <rect x={bx} y={by} width={bw} height={bh} rx={14}
              fill="color-mix(in srgb, var(--danger) 5%, var(--card))"
              stroke={color} strokeWidth={2} />
            {/* Warning icon */}
            <circle cx={bx + 26} cy={by + 30} r={14}
              fill="color-mix(in srgb, var(--danger) 12%, transparent)" />
            <text x={bx + 26} y={by + 30} textAnchor="middle" dominantBaseline="central"
              fill="var(--danger)" fontSize={13} fontWeight={950}>!</text>
            {/* Labels */}
            <text x={bx + 50} y={by + 26} fill="var(--foreground)" fontSize={13} fontWeight={950}>{label}</text>
            <text x={bx + 50} y={by + 46} fill="var(--muted-foreground)" fontSize={11} fontWeight={750}>{sub}</text>
            {/* Mini illustration — edge strip */}
            <rect x={bx + 12} y={by + 64} width={bw - 24} height={24} rx={7}
              fill="var(--card)" stroke="var(--border)" strokeWidth={1.5} />
            <rect x={bx + 12} y={by + 64} width={28} height={24} rx={7}
              fill="color-mix(in srgb, var(--danger) 14%, transparent)" />
            <text x={bx + 26} y={by + 78} textAnchor="middle" dominantBaseline="middle"
              fill="var(--danger)" fontSize={9} fontWeight={850}>edge</text>
            <rect x={bx + 52} y={by + 70} width={bw - 80} height={12} rx={4}
              fill="var(--muted-foreground)" opacity={0.25} />
          </g>
        );
      })}
    </g>
  );
}


export function MarginRecommendationLayout() {
  // Cover centered: x=200, y=64, w=400, h=322
  const cx = 200, cy = 64, cw = 400, ch = 322;
  // Safe zone 56px inset
  const sx = cx + 56, sy = cy + 56, sw = cw - 112, sh = ch - 112;
  const scx = sx + sw / 2;

  const MeasureArrow = ({ x1, y1, x2, y2, label, lx, ly }: { x1: number; y1: number; x2: number; y2: number; label: string; lx: number; ly: number }) => (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--primary)" strokeWidth={1.5} strokeDasharray="4 3" />
      <rect x={lx - label.length * 4.2 - 2} y={ly - 10} width={label.length * 8.4 + 4} height={20} rx={5} fill="var(--card)" stroke="var(--primary)" strokeWidth={1.5} />
      <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fill="var(--primary)" fontSize={11} fontWeight={950}>{label}</text>
    </g>
  );

  return (
    <g>
      <Label x={226} y={46}>recommended safe margin layout — 0.25 in minimum</Label>

      {/* Cover */}
      <rect x={cx} y={cy} width={cw} height={ch} rx={4}
        fill="color-mix(in srgb, var(--primary) 8%, var(--card))" stroke="var(--border)" strokeWidth={2} />

      {/* Safe zone */}
      <rect x={sx} y={sy} width={sw} height={sh} rx={10}
        fill="color-mix(in srgb, var(--success) 8%, transparent)"
        stroke="var(--success)" strokeWidth={2} strokeDasharray="6 4" />

      {/* Content inside safe zone */}
      <rect x={scx - 96} y={sy + 26} width={192} height={26} rx={5} fill="var(--foreground)" opacity={0.8} />
      <text x={scx} y={sy + 44} textAnchor="middle" fill="var(--card)" fontSize={13} fontWeight={950}>TITLE</text>
      <rect x={scx - 64} y={sy + 64} width={128} height={12} rx={4} fill="var(--muted-foreground)" opacity={0.35} />
      <text x={scx} y={sy + 100} textAnchor="middle" dominantBaseline="middle" fill="var(--muted-foreground)" fontSize={11}>Author Name</text>

      {/* Top measure arrow */}
      <MeasureArrow x1={cx + cw / 2} y1={cy} x2={cx + cw / 2} y2={sy} label="0.25 in+" lx={cx + cw / 2 + 56} ly={cy + 28} />
      {/* Bottom measure arrow */}
      <MeasureArrow x1={cx + cw / 2} y1={sy + sh} x2={cx + cw / 2} y2={cy + ch} label="0.25 in+" lx={cx + cw / 2 + 56} ly={sy + sh + 28} />
      {/* Left measure arrow */}
      <MeasureArrow x1={cx} y1={cy + ch / 2} x2={sx} y2={cy + ch / 2} label="0.25 in+" lx={cx - 48} ly={cy + ch / 2} />
      {/* Right measure arrow */}
      <MeasureArrow x1={sx + sw} y1={cy + ch / 2} x2={cx + cw} y2={cy + ch / 2} label="0.25 in+" lx={cx + cw + 48} ly={cy + ch / 2} />

      {/* "safe area" center label */}
      <text x={scx} y={sy + sh - 14} textAnchor="middle" fill="var(--success)" fontSize={12} fontWeight={700} opacity={0.6}>safe area</text>

      {/* Tip badge */}
      <rect x={scx - 190} y={cy + ch + 18} width={380} height={28} rx={9}
        fill="color-mix(in srgb, var(--success) 8%, var(--card))" stroke="var(--success)" strokeWidth={2} />
      <text x={scx} y={cy + ch + 33} textAnchor="middle" dominantBaseline="middle"
        fill="var(--success)" fontSize={12} fontWeight={850}>use more space for small text and bottom-edge elements</text>
    </g>
  );
}


export function CanvaSafeMarginSteps() {
  const steps = [
    { n: 1, label: 'Open design', sub: 'original file only' },
    { n: 2, label: 'Enable rulers', sub: 'View → Show Rulers' },
    { n: 3, label: 'Add guides', sub: '0.25 in from trim' },
    { n: 4, label: 'Find flagged items', sub: 'sub · author · border' },
    { n: 5, label: 'Move inward', sub: 'use X / Y coords' },
    { n: 6, label: 'Check corners', sub: 'extra space each edge' },
    { n: 7, label: 'Export PDF Print', sub: 'not Standard PDF' },
    { n: 8, label: 'Verify the PDF', sub: 'inspect before reupload' },
  ];
  // bw=180, gx=14 → total = 4×180 + 3×14 = 762 → startX=19
  // text starts at bx+44, box ends at bx+180 → available = 130px per label
  const cols = 4, bw = 180, bh = 86, gx = 14, gy = 28;
  const totalW = cols * bw + (cols - 1) * gx;
  const startX = (800 - totalW) / 2;
  const startY = 68;

  return (
    <g>
      <Label x={216} y={44}>8 Canva steps to fix safe area problems</Label>
      {steps.map(({ n, label, sub }) => {
        const idx = n - 1;
        const col = idx % cols;
        const row = Math.floor(idx / cols);
        const bx = startX + col * (bw + gx);
        const by = startY + row * (bh + gy);
        const isLast = n === 8;
        const cy2 = by + bh / 2;
        return (
          <g key={n}>
            <rect x={bx} y={by} width={bw} height={bh} rx={12}
              fill="var(--card)"
              stroke={isLast ? 'var(--success)' : 'var(--primary)'}
              strokeWidth={isLast ? 2.5 : 2} />
            <circle cx={bx + 22} cy={cy2 - 10} r={13}
              fill={isLast ? 'color-mix(in srgb, var(--success) 14%, transparent)' : 'color-mix(in srgb, var(--primary) 14%, transparent)'} />
            <text x={bx + 22} y={cy2 - 10} textAnchor="middle" dominantBaseline="central"
              fill={isLast ? 'var(--success)' : 'var(--primary)'} fontSize={12} fontWeight={950}>{n}</text>
            <text x={bx + 44} y={cy2 - 6} fill="var(--foreground)" fontSize={12} fontWeight={950}>{label}</text>
            <text x={bx + 44} y={cy2 + 12} fill="var(--muted-foreground)" fontSize={9} fontWeight={750}>{sub}</text>
            {/* Connector right */}
            {col < cols - 1 && (
              <path d={`M${bx + bw + 2} ${cy2}h${gx - 4}`} stroke="var(--primary)" strokeWidth={2} strokeDasharray="5 4" />
            )}
            {/* Connector down (end of row) */}
            {col === cols - 1 && row === 0 && (
              <path d={`M${bx + bw / 2} ${by + bh + 2}v${gy - 4}`} stroke="var(--primary)" strokeWidth={2} strokeDasharray="5 4" />
            )}
          </g>
        );
      })}
    </g>
  );
}


export function BorderTrimShiftComparison() {
  // Left cover: x=64, y=60, w=298, h=330
  // Right cover: x=438, y=60, w=298, h=330
  const lx = 64, rx = 438, cy2 = 60, cw = 298, ch = 330;
  const bpad = 14; // border inset from cover edge

  return (
    <g>
      <Label x={218} y={42}>centered border — then after trim shift</Label>

      {/* Left: perfectly centered border in file */}
      <rect x={lx} y={cy2} width={cw} height={ch} rx={4}
        fill="color-mix(in srgb, var(--primary) 8%, var(--card))" stroke="var(--border)" strokeWidth={1.5} />
      {/* Even border inside */}
      <rect x={lx + bpad} y={cy2 + bpad} width={cw - bpad * 2} height={ch - bpad * 2} rx={5}
        fill="transparent" stroke="var(--muted-foreground)" strokeWidth={2.5} />
      {/* Content */}
      <rect x={lx + 46} y={cy2 + 88} width={206} height={26} rx={5} fill="var(--foreground)" opacity={0.78} />
      <text x={lx + cw / 2} y={cy2 + 106} textAnchor="middle" fill="var(--card)" fontSize={12} fontWeight={950}>BOOK TITLE</text>
      <text x={lx + cw / 2} y={cy2 + 152} textAnchor="middle" fill="var(--muted-foreground)" fontSize={10}>Author Name</text>
      {/* "Even" indicators */}
      {[0, 1, 2, 3].map((side) => {
        const positions = [
          { x: lx + cw / 2, y: cy2 + bpad / 2 },
          { x: lx + cw / 2, y: cy2 + ch - bpad / 2 },
          { x: lx + bpad / 2, y: cy2 + ch / 2 },
          { x: lx + cw - bpad / 2, y: cy2 + ch / 2 },
        ];
        return (
          <text key={side} x={positions[side].x} y={positions[side].y} textAnchor="middle" dominantBaseline="central"
            fill="var(--success)" fontSize={9} fontWeight={850}>✓</text>
        );
      })}
      {/* Label */}
      <rect x={lx + 54} y={cy2 + ch + 14} width={190} height={28} rx={8}
        fill="color-mix(in srgb, var(--success) 8%, var(--card))" stroke="var(--success)" strokeWidth={2} />
      <text x={lx + cw / 2} y={cy2 + ch + 29} textAnchor="middle" dominantBaseline="middle"
        fill="var(--success)" fontSize={12} fontWeight={850}>file: perfectly even</text>

      {/* Divider */}
      <path d="M398 52v360" stroke="var(--border)" strokeWidth={1.5} strokeDasharray="5 5" />
      <circle cx={398} cy={232} r={22} fill="var(--card)" stroke="var(--border)" strokeWidth={1.5} />
      <text x={398} y={232} textAnchor="middle" dominantBaseline="central"
        fill="var(--muted-foreground)" fontSize={11} fontWeight={900}>→</text>

      {/* Right: same cover after trim shift (2 mm right) — border uneven */}
      <rect x={rx} y={cy2} width={cw} height={ch} rx={4}
        fill="color-mix(in srgb, var(--primary) 8%, var(--card))" stroke="var(--border)" strokeWidth={1.5} />
      {/* Shifted border: trimmed on left by 6px extra, right side thicker */}
      <rect x={rx + bpad - 6} y={cy2 + bpad} width={cw - bpad * 2 + 6} height={ch - bpad * 2} rx={5}
        fill="transparent" stroke="var(--muted-foreground)" strokeWidth={2.5} />
      {/* Content same as left */}
      <rect x={rx + 46} y={cy2 + 88} width={206} height={26} rx={5} fill="var(--foreground)" opacity={0.78} />
      <text x={rx + cw / 2} y={cy2 + 106} textAnchor="middle" fill="var(--card)" fontSize={12} fontWeight={950}>BOOK TITLE</text>
      <text x={rx + cw / 2} y={cy2 + 152} textAnchor="middle" fill="var(--muted-foreground)" fontSize={10}>Author Name</text>
      {/* Warning on narrow left side */}
      <circle cx={rx + 5} cy={cy2 + ch / 2} r={14} fill="color-mix(in srgb, var(--danger) 10%, var(--card))" stroke="var(--danger)" strokeWidth={2} />
      <text x={rx + 5} y={cy2 + ch / 2} textAnchor="middle" dominantBaseline="central"
        fill="var(--danger)" fontSize={11} fontWeight={950}>!</text>
      {/* Label */}
      <rect x={rx + 30} y={cy2 + ch + 14} width={238} height={28} rx={8}
        fill="color-mix(in srgb, var(--danger) 8%, var(--card))" stroke="var(--danger)" strokeWidth={2} />
      <text x={rx + cw / 2} y={cy2 + ch + 29} textAnchor="middle" dominantBaseline="middle"
        fill="var(--danger)" fontSize={12} fontWeight={850}>print: uneven after trim shift</text>
    </g>
  );
}


export function ProfessionalGuideSetup() {
  // Title at y=22; bleed starts at y=34 — no overlap
  // Cover: x=118, y=54, w=546, h=308
  const cx = 118, cy = 54, cw = 546, ch = 308;
  const bx = cx - 16, by = cy - 20; // bleed rect
  const sx = cx + 52, sy = cy + 52, sw = cw - 104, sh = ch - 104;
  const spineX = 370, spineW = 60; // centered ~400
  const barX = cx + 12, barY = cy + ch - 78, barW = 110, barH = 56;

  // Right label column: lines start at cx+cw+4, labels at cx+cw+26
  const lx = cx + cw + 26; // 690
  const lw = 96;
  // Label y positions — each 40px apart so boxes (22px tall) never touch
  const guideLabels: { y: number; label: string; color: string }[] = [
    { y: 66,  label: 'bleed',     color: 'var(--danger)' },
    { y: 110, label: 'trim line', color: 'color-mix(in srgb, var(--foreground) 65%, transparent)' },
    { y: 158, label: 'safe area', color: 'var(--success)' },
    { y: 208, label: 'spine',     color: 'var(--primary)' },
  ];

  return (
    <g>
      {/* Title sits fully above the bleed rect */}
      <Label x={172} y={22}>professional guide layer setup — all zones locked</Label>

      {/* Cover background */}
      <rect x={cx} y={cy} width={cw} height={ch} rx={3}
        fill="color-mix(in srgb, var(--primary) 6%, var(--card))" stroke="var(--border)" strokeWidth={2} />

      {/* Bleed guide — starts at by=34, well below title */}
      <rect x={bx} y={by} width={cw + 32} height={ch + 40} rx={5}
        fill="transparent" stroke="var(--danger)" strokeWidth={1.5} strokeDasharray="7 4" />

      {/* Safe area guide */}
      <rect x={sx} y={sy} width={sw} height={sh} rx={8}
        fill="color-mix(in srgb, var(--success) 7%, transparent)"
        stroke="var(--success)" strokeWidth={1.5} strokeDasharray="5 3" />

      {/* Spine guide lines + tint */}
      <rect x={spineX} y={cy} width={spineW} height={ch}
        fill="color-mix(in srgb, var(--primary) 7%, transparent)" />
      <line x1={spineX} y1={cy} x2={spineX} y2={cy + ch}
        stroke="var(--primary)" strokeWidth={1.5} strokeDasharray="4 3" />
      <line x1={spineX + spineW} y1={cy} x2={spineX + spineW} y2={cy + ch}
        stroke="var(--primary)" strokeWidth={1.5} strokeDasharray="4 3" />

      {/* Barcode zone */}
      <rect x={barX} y={barY} width={barW} height={barH} rx={5}
        fill="color-mix(in srgb, var(--danger) 8%, transparent)"
        stroke="var(--danger)" strokeWidth={1.5} strokeDasharray="5 4" />
      <text x={barX + barW / 2} y={barY + barH / 2} textAnchor="middle" dominantBaseline="central"
        fill="var(--danger)" fontSize={9} fontWeight={850}>barcode zone</text>

      {/* Guide labels — right column, 40px spacing, no overlap */}
      {guideLabels.map(({ y, label, color }) => (
        <g key={label}>
          <line x1={cx + cw + 4} y1={y} x2={lx - 4} y2={y}
            stroke={color} strokeWidth={1.5} />
          <rect x={lx} y={y - 11} width={lw} height={22} rx={6}
            fill="var(--card)" stroke={color} strokeWidth={1.5} />
          <text x={lx + lw / 2} y={y} textAnchor="middle" dominantBaseline="middle"
            fill={color} fontSize={11} fontWeight={850}>{label}</text>
        </g>
      ))}

      {/* Tip badge */}
      <rect x={cx} y={cy + ch + 18} width={cw} height={26} rx={8}
        fill="color-mix(in srgb, var(--primary) 7%, var(--card))" stroke="var(--primary)" strokeWidth={2} />
      <text x={cx + cw / 2} y={cy + ch + 31} textAnchor="middle" dominantBaseline="middle"
        fill="var(--primary)" fontSize={11} fontWeight={850}>keep all guides locked and visible throughout the entire design process</text>
    </g>
  );
}


