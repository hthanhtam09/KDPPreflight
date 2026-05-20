import type React from 'react';
import { Label, MutedLabel, SpineWrap, StatusBadge } from './shared';

export function SpineMisalignment() {
  const panelW = 340;
  const panelH = 200;
  const spineW = 120;
  const coverW = (panelW - spineW) / 2; // 110
  
  const cx1 = 190, cy = 240;
  const x1 = cx1 - panelW/2; // 20
  const y = cy - panelH/2; // 140
  
  const cx2 = 590;
  const x2 = cx2 - panelW/2; // 420
  
  const shift = 28; // folds shift right

  return (
    <g>
      <Label x={200} y={30}>zoomed spine text alignment</Label>

      {/* --- LEFT PANEL: TOO TIGHT --- */}
      <text x={cx1} y={70} textAnchor="middle" fill="var(--foreground)" fontSize={20} fontWeight={900}>TOO TIGHT</text>
      <text x={cx1} y={92} textAnchor="middle" fill="var(--muted-foreground)" fontSize={13} fontWeight={700}>text fills intended spine width</text>

      {/* Dark Book Cover */}
      <rect x={x1} y={y} width={panelW} height={panelH} rx={6} 
        fill="color-mix(in srgb, var(--foreground) 85%, var(--card))" 
        stroke="var(--border)" strokeWidth={2} 
        style={{ filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.15))' }} />
        
      {/* Intended Spine Highlight */}
      <rect x={x1 + coverW} y={y} width={spineW} height={panelH} fill="var(--card)" opacity={0.05} />

      {/* Intended Folds */}
      <path d={`M ${x1 + coverW} ${y} v ${panelH} M ${x1 + coverW + spineW} ${y} v ${panelH}`} 
        stroke="var(--card)" strokeWidth={2} strokeDasharray="5 5" opacity={0.3} />
      
      {/* Spine Text (Huge) */}
      <text x={cx1} y={cy} textAnchor="middle" transform={`rotate(-90 ${cx1} ${cy})`} 
        fill="var(--card)" fontSize={100} fontWeight={950} opacity={0.95} letterSpacing={2}>TITLE</text>
      
      {/* Actual Folds (Shifted) */}
      <path d={`M ${x1 + coverW + shift} ${y - 14} v ${panelH + 28} M ${x1 + coverW + spineW + shift} ${y - 14} v ${panelH + 28}`} 
        stroke="var(--danger)" strokeWidth={4} strokeDasharray="8 8" />
        
      {/* Labels for Lines */}
      <text x={x1 + coverW - 8} y={y - 16} textAnchor="end" fill="var(--muted-foreground)" fontSize={13} fontWeight={800}>intended fold</text>
      <path d={`M ${x1 + coverW - 12} ${y - 12} L ${x1 + coverW} ${y - 2}`} stroke="var(--muted)" strokeWidth={2} />
      
      <rect x={x1 + coverW + shift - 15} y={y - 42} width={100} height={24} rx={6} fill="var(--card)" stroke="var(--danger)" strokeWidth={2} />
      <text x={x1 + coverW + shift + 35} y={y - 25} textAnchor="middle" fill="var(--danger)" fontSize={13} fontWeight={900}>actual fold</text>
      <path d={`M ${x1 + coverW + shift + 10} ${y - 18} L ${x1 + coverW + shift} ${y - 6}`} stroke="var(--danger)" strokeWidth={2} />

      {/* Wraps to back cover arrow */}
      <path d={`M ${x1 + coverW + shift - 40} ${y + 40} Q ${x1 + coverW + shift - 10} ${y + 40} ${x1 + coverW + shift - 10} ${cy - 40}`} fill="none" stroke="var(--danger)" strokeWidth={3} />
      <path d={`M ${x1 + coverW + shift - 16} ${cy - 48} L ${x1 + coverW + shift - 10} ${cy - 38} L ${x1 + coverW + shift - 4} ${cy - 48}`} fill="none" stroke="var(--danger)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      <text x={x1 + coverW + shift - 45} y={y + 45} textAnchor="end" fill="var(--danger)" fontSize={13} fontWeight={850}>text wraps</text>
      <text x={x1 + coverW + shift - 45} y={y + 60} textAnchor="end" fill="var(--danger)" fontSize={13} fontWeight={850}>to back cover</text>

      <rect x={x1 - 10} y={y + panelH + 34} width={panelW + 20} height={44} rx={12} fill="color-mix(in srgb, var(--danger) 10%, var(--card))" stroke="var(--danger)" strokeWidth={2} />
      <text x={cx1} y={y + panelH + 61} textAnchor="middle" fill="var(--danger)" fontSize={14} fontWeight={850}>shift causes text to wrap around the edge</text>

      {/* --- MIDDLE: SHIFT ARROW --- */}
      <path d={`M 370 ${cy} h 40`} stroke="var(--danger)" strokeWidth={4} strokeDasharray="5 5" />
      <path d={`M 400 ${cy - 8} L 414 ${cy} L 400 ${cy + 8}`} fill="none" stroke="var(--danger)" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
      <text x={390} y={cy - 16} textAnchor="middle" fill="var(--danger)" fontSize={14} fontWeight={900}>fold shift</text>

      {/* --- RIGHT PANEL: SAFE MARGIN --- */}
      <text x={cx2} y={70} textAnchor="middle" fill="var(--foreground)" fontSize={20} fontWeight={900}>SAFE MARGIN</text>
      <text x={cx2} y={92} textAnchor="middle" fill="var(--muted-foreground)" fontSize={13} fontWeight={700}>text has breathing room</text>

      {/* Dark Book Cover */}
      <rect x={x2} y={y} width={panelW} height={panelH} rx={6} 
        fill="color-mix(in srgb, var(--foreground) 85%, var(--card))" 
        stroke="var(--border)" strokeWidth={2} 
        style={{ filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.15))' }} />
        
      {/* Intended Spine Highlight */}
      <rect x={x2 + coverW} y={y} width={spineW} height={panelH} fill="var(--card)" opacity={0.05} />

      {/* Intended Folds */}
      <path d={`M ${x2 + coverW} ${y} v ${panelH} M ${x2 + coverW + spineW} ${y} v ${panelH}`} 
        stroke="var(--card)" strokeWidth={2} strokeDasharray="5 5" opacity={0.3} />
      
      {/* Spine Text (Safe size) */}
      <text x={cx2} y={cy} textAnchor="middle" transform={`rotate(-90 ${cx2} ${cy})`} 
        fill="var(--card)" fontSize={40} fontWeight={900} opacity={0.9} letterSpacing={3}>TITLE</text>
      
      {/* Actual Folds (Shifted) */}
      <path d={`M ${x2 + coverW + shift} ${y - 14} v ${panelH + 28} M ${x2 + coverW + spineW + shift} ${y - 14} v ${panelH + 28}`} 
        stroke="var(--success)" strokeWidth={4} strokeDasharray="8 8" />
        
      {/* Labels for Lines */}
      <text x={x2 + coverW - 8} y={y - 16} textAnchor="end" fill="var(--muted-foreground)" fontSize={13} fontWeight={800}>intended fold</text>
      <path d={`M ${x2 + coverW - 12} ${y - 12} L ${x2 + coverW} ${y - 2}`} stroke="var(--muted)" strokeWidth={2} />
      
      <rect x={x2 + coverW + shift - 15} y={y - 42} width={100} height={24} rx={6} fill="var(--card)" stroke="var(--success)" strokeWidth={2} />
      <text x={x2 + coverW + shift + 35} y={y - 25} textAnchor="middle" fill="var(--success)" fontSize={13} fontWeight={900}>actual fold</text>
      <path d={`M ${x2 + coverW + shift + 10} ${y - 18} L ${x2 + coverW + shift} ${y - 6}`} stroke="var(--success)" strokeWidth={2} />
        
      <rect x={x2 - 10} y={y + panelH + 34} width={panelW + 20} height={44} rx={12} fill="color-mix(in srgb, var(--success) 10%, var(--card))" stroke="var(--success)" strokeWidth={2} />
      <text x={cx2} y={y + panelH + 61} textAnchor="middle" fill="var(--success)" fontSize={14} fontWeight={850}>text safely remains on the physical spine</text>
    </g>
  );
}


export function SpineAlignmentAnatomy() {
  const x = 144;
  const y = 104;
  const panelW = 210;
  const spineW = 92;
  const spineX = x + panelW;       // 354
  const spineCenter = spineX + spineW / 2; // 400
  const rightEdge = x + panelW * 2 + spineW; // 656
  return (
    <g>
      <Label x={246} y={52}>spine alignment anatomy</Label>
      <SpineWrap x={x} y={y} spineWidth={spineW} panelWidth={panelW} />
      <rect x={spineX + 18} y={y + 28} width={spineW - 36} height={164} rx={10} fill="color-mix(in srgb, var(--success) 12%, transparent)" stroke="var(--success)" strokeDasharray="7 7" strokeWidth={3} />
      <path d={`M${spineCenter} ${y + 20}v180`} stroke="var(--success)" strokeWidth={3} />
      <text x={x + panelW / 2} y={220} fill="var(--foreground)" fontSize={18} fontWeight={900}>back</text>
      <text x={spineX + spineW + panelW / 2} y={220} fill="var(--foreground)" fontSize={18} fontWeight={900}>front</text>
      <text x={spineCenter} y={228} textAnchor="middle" fill="var(--primary)" fontSize={15} fontWeight={950} transform={`rotate(-90 ${spineCenter} 228)`}>SPINE</text>
      <rect x={x + 6} y={342} width={102} height={34} rx={10} fill="var(--card)" stroke="var(--primary)" strokeWidth={2.5} />
      <text x={x + 57} y={365} textAnchor="middle" fill="var(--primary)" fontSize={13} fontWeight={950}>trim edge</text>
      <rect x={spineCenter - 59} y={342} width={118} height={34} rx={10} fill="var(--card)" stroke="var(--success)" strokeWidth={2.5} />
      <text x={spineCenter} y={365} textAnchor="middle" fill="var(--success)" fontSize={13} fontWeight={950}>spine center</text>
      <rect x={rightEdge - 116} y={342} width={112} height={34} rx={10} fill="var(--card)" stroke="var(--danger)" strokeWidth={2.5} />
      <text x={rightEdge - 60} y={365} textAnchor="middle" fill="var(--danger)" fontSize={13} fontWeight={950}>unsafe edge</text>
    </g>
  );
}


export function SpineCommonMistakes() {
  const items = [
    ['Thin spine', 'no room'],
    ['Edge text', 'too close'],
    ['Page count', 'changed'],
    ['Paper type', 'wrong'],
    ['Canva snap', 'misread'],
    ['PDF scale', 'resized'],
  ];
  return (
    <g>
      <Label x={260} y={46}>6 common spine mistakes</Label>
      {items.map(([title, detail], index) => {
        const col = index % 3;
        const row = Math.floor(index / 3);
        const x = 94 + col * 220;
        const y = 92 + row * 136;
        return (
          <g key={title}>
            <rect x={x} y={y} width={170} height={92} rx={16} fill="var(--card)" stroke="var(--danger)" strokeWidth={2.5} />
            <circle cx={x + 26} cy={y + 26} r={13} fill="color-mix(in srgb, var(--danger) 14%, transparent)" stroke="var(--danger)" strokeWidth={2.5} />
            <text x={x + 22} y={y + 31} fill="var(--danger)" fontSize={18} fontWeight={950}>!</text>
            <text x={x + 50} y={y + 34} fill="var(--foreground)" fontSize={15} fontWeight={950}>{title}</text>
            <text x={x + 50} y={y + 64} fill="var(--muted-foreground)" fontSize={13} fontWeight={850}>{detail}</text>
          </g>
        );
      })}
      <rect x={238} y={374} width={324} height={34} rx={11} fill="color-mix(in srgb, var(--success) 9%, var(--card))" stroke="var(--success)" strokeWidth={2.5} />
      <text x={400} y={397} textAnchor="middle" fill="var(--success)" fontSize={14} fontWeight={950}>recheck template before export</text>
    </g>
  );
}


export function ThinVsSafeSpine() {
  return (
    <g>
      <Label x={126} y={58}>thin spine</Label>
      <Label x={506} y={58}>safe spine</Label>
      <SpineWrap x={76} y={108} spineWidth={30} tone="danger" panelWidth={124} />
      <text x={215} y={230} textAnchor="middle" fill="var(--danger)" fontSize={13} fontWeight={950} transform="rotate(-90 215 230)">TITLE</text>
      <rect x={140} y={350} width={150} height={34} rx={10} fill="var(--card)" stroke="var(--danger)" strokeWidth={2.5} />
      <text x={215} y={373} textAnchor="middle" fill="var(--danger)" fontSize={13} fontWeight={950}>avoid spine text</text>

      <SpineWrap x={420} y={98} spineWidth={92} tone="success" panelWidth={124} />
      <rect x={556} y={130} width={68} height={156} rx={10} fill="color-mix(in srgb, var(--success) 10%, transparent)" stroke="var(--success)" strokeDasharray="7 7" strokeWidth={3} />
      <text x={590} y={230} textAnchor="middle" fill="var(--success)" fontSize={16} fontWeight={950} transform="rotate(-90 590 230)">TITLE</text>
      <rect x={504} y={350} width={172} height={34} rx={10} fill="var(--card)" stroke="var(--success)" strokeWidth={2.5} />
      <text x={590} y={373} textAnchor="middle" fill="var(--success)" fontSize={13} fontWeight={950}>padding stays visible</text>
    </g>
  );
}


export function SpineCenterWorkflow() {
  const steps = [['Template', 'exact'], ['Count', 'final'], ['Center', 'guide'], ['Padding', 'safe']];
  // Cover dimensions — centered in 800px viewBox
  const backW = 210, spineW = 120, frontW = 210;
  const cX = (800 - backW - spineW - frontW) / 2; // 130
  const cY = 236, cH = 152;
  const spineX = cX + backW;            // 340
  const spineCenter = spineX + spineW / 2; // 400
  const frontX = spineX + spineW;       // 460
  return (
    <g>
      <Label x={236} y={46}>correct spine center workflow</Label>
      {steps.map(([top, bottom], index) => {
        const bx = 74 + index * 178;
        return (
          <g key={top}>
            <rect x={bx} y={84} width={128} height={84} rx={16} fill="var(--card)" stroke={index === 3 ? 'var(--success)' : 'var(--primary)'} strokeWidth={3} />
            <text x={bx + 64} y={120} textAnchor="middle" fill="var(--foreground)" fontSize={15} fontWeight={950}>{top}</text>
            <text x={bx + 64} y={146} textAnchor="middle" fill="var(--muted-foreground)" fontSize={12} fontWeight={850}>{bottom}</text>
            {index < steps.length - 1 && <path d={`M${bx + 138} 126h28`} stroke="var(--primary)" strokeWidth={3} strokeDasharray="7 7" />}
          </g>
        );
      })}
      {/* Cover wrap */}
      <rect x={cX} y={cY} width={backW + spineW + frontW} height={cH} rx={18} fill="var(--card)" stroke="var(--border)" strokeWidth={3} />
      {/* Back panel */}
      <path d={`M${cX + 18} ${cY}h${backW - 18}v${cH}H${cX + 18}a18 18 0 0 1-18-18V${cY + 18}a18 18 0 0 1 18-18Z`} fill="color-mix(in srgb, var(--muted) 55%, transparent)" />
      {/* Spine panel */}
      <rect x={spineX} y={cY} width={spineW} height={cH} fill="color-mix(in srgb, var(--primary) 14%, transparent)" />
      {/* Front panel */}
      <path d={`M${frontX} ${cY}h${frontW - 18}a18 18 0 0 1 18 18v${cH - 36}a18 18 0 0 1-18 18H${frontX}Z`} fill="color-mix(in srgb, var(--surface) 68%, transparent)" />
      {/* Spine dividers */}
      <path d={`M${spineX} ${cY}v${cH}M${frontX} ${cY}v${cH}`} stroke="var(--primary)" strokeWidth={3} strokeDasharray="7 7" />
      {/* Center line */}
      <path d={`M${spineCenter} ${cY + 8}v${cH - 16}`} stroke="var(--success)" strokeWidth={3} />
      {/* Safe zone */}
      <rect x={spineX + 18} y={cY + 22} width={spineW - 36} height={cH - 44} rx={10} fill="color-mix(in srgb, var(--success) 10%, transparent)" stroke="var(--success)" strokeDasharray="6 6" strokeWidth={2.5} />
      {/* CENTER label */}
      <text x={spineCenter} y={cY + cH / 2 + 6} textAnchor="middle" fill="var(--success)" fontSize={15} fontWeight={950} transform={`rotate(-90 ${spineCenter} ${cY + cH / 2})`}>CENTER</text>
      {/* Panel labels */}
      <text x={cX + backW / 2} y={cY + cH / 2 + 7} textAnchor="middle" fill="var(--muted-foreground)" fontSize={16} fontWeight={700}>back</text>
      <text x={frontX + frontW / 2} y={cY + cH / 2 + 7} textAnchor="middle" fill="var(--muted-foreground)" fontSize={16} fontWeight={700}>front</text>
    </g>
  );
}


export function CanvaSpineAlignment() {
  return (
    <g>
      <Label x={232} y={48}>Canva spine alignment setup</Label>
      <rect x={92} y={76} width={616} height={304} rx={22} fill="var(--card)" stroke="var(--border)" strokeWidth={3} />
      <rect x={92} y={76} width={616} height={48} rx={22} fill="color-mix(in srgb, var(--primary) 12%, transparent)" />
      <text x={124} y={107} fill="var(--foreground)" fontSize={15} fontWeight={950}>guides + rulers visible</text>
      <rect x={190} y={154} width={420} height={150} rx={16} fill="color-mix(in srgb, var(--surface) 70%, transparent)" stroke="var(--border)" strokeWidth={2.5} />
      <rect x={378} y={154} width={44} height={150} fill="color-mix(in srgb, var(--primary) 18%, transparent)" stroke="var(--primary)" strokeWidth={3} />
      <path d="M400 154v150" stroke="var(--success)" strokeWidth={3} />
      <text x={400} y={244} textAnchor="middle" fill="var(--success)" fontSize={13} fontWeight={950} transform="rotate(-90 400 244)">TEXT</text>
      <rect x={154} y={334} width={124} height={30} rx={9} fill="var(--card)" stroke="var(--primary)" strokeWidth={2.5} />
      <text x={216} y={354} textAnchor="middle" fill="var(--primary)" fontSize={12} fontWeight={950}>zoom 300%</text>
      <rect x={338} y={334} width={124} height={30} rx={9} fill="var(--card)" stroke="var(--success)" strokeWidth={2.5} />
      <text x={400} y={354} textAnchor="middle" fill="var(--success)" fontSize={12} fontWeight={950}>manual center</text>
      <rect x={522} y={334} width={124} height={30} rx={9} fill="var(--card)" stroke="var(--primary)" strokeWidth={2.5} />
      <text x={584} y={354} textAnchor="middle" fill="var(--primary)" fontSize={12} fontWeight={950}>PDF Print</text>
    </g>
  );
}


export function ProSpineAlignment() {
  return (
    <g>
      <Label x={230} y={48}>professional alignment workflow</Label>
      <rect x={100} y={82} width={600} height={292} rx={22} fill="var(--card)" stroke="var(--border)" strokeWidth={3} />
      <rect x={122} y={112} width={256} height={220} rx={16} fill="color-mix(in srgb, var(--muted) 60%, transparent)" stroke="var(--border)" strokeWidth={2.5} />
      <rect x={378} y={112} width={74} height={220} fill="color-mix(in srgb, var(--primary) 16%, transparent)" stroke="var(--primary)" strokeWidth={3} />
      <rect x={452} y={112} width={226} height={220} rx={16} fill="color-mix(in srgb, var(--surface) 70%, transparent)" stroke="var(--border)" strokeWidth={2.5} />
      <path d="M415 122v200" stroke="var(--success)" strokeWidth={3} />
      <text x={415} y={246} textAnchor="middle" fill="var(--success)" fontSize={14} fontWeight={950} transform="rotate(-90 415 246)">X CENTER</text>
      <rect x={140} y={350} width={132} height={34} rx={10} fill="var(--card)" stroke="var(--primary)" strokeWidth={2.5} />
      <text x={206} y={373} textAnchor="middle" fill="var(--primary)" fontSize={13} fontWeight={950}>smart guides</text>
      <rect x={334} y={350} width={132} height={34} rx={10} fill="var(--card)" stroke="var(--success)" strokeWidth={2.5} />
      <text x={400} y={373} textAnchor="middle" fill="var(--success)" fontSize={13} fontWeight={950}>transform X/Y</text>
      <rect x={528} y={350} width={132} height={34} rx={10} fill="var(--card)" stroke="var(--primary)" strokeWidth={2.5} />
      <text x={594} y={373} textAnchor="middle" fill="var(--primary)" fontSize={13} fontWeight={950}>locked guides</text>
    </g>
  );
}


export function PreviewIllusionPrint() {
  return (
    <g>
      <Label x={126} y={58}>preview illusion</Label>
      <Label x={500} y={58}>measured print file</Label>
      <rect x={118} y={94} width={238} height={284} rx={18} fill="var(--card)" stroke="var(--danger)" strokeWidth={3} />
      <rect x={218} y={94} width={42} height={284} fill="color-mix(in srgb, var(--danger) 12%, transparent)" stroke="var(--danger)" strokeWidth={3} />
      <path d="M224 104c16 74 16 190 0 264" stroke="var(--primary)" strokeWidth={4} opacity=".45" />
      <text x={245} y={244} textAnchor="middle" fill="var(--danger)" fontSize={13} fontWeight={950} transform="rotate(-90 245 244)">LOOKS SHIFTED</text>
      <rect x={466} y={94} width={238} height={284} rx={18} fill="var(--card)" stroke="var(--success)" strokeWidth={3} />
      <rect x={564} y={94} width={42} height={284} fill="color-mix(in srgb, var(--success) 10%, transparent)" stroke="var(--success)" strokeWidth={3} />
      <path d="M585 108v256" stroke="var(--success)" strokeWidth={3} />
      <text x={585} y={246} textAnchor="middle" fill="var(--success)" fontSize={13} fontWeight={950} transform="rotate(-90 585 246)">CENTERED</text>
      <text x={142} y={414} fill="var(--danger)" fontSize={13} fontWeight={900}>browser + fold render</text>
      <text x={506} y={414} fill="var(--success)" fontSize={13} fontWeight={900}>dimensions verified</text>
    </g>
  );
}


export function GoodVsBadSpine() {
  return (
    <g>
      <Label x={150} y={58}>bad spine</Label>
      <Label x={520} y={58}>good spine</Label>
      <SpineWrap x={78} y={108} spineWidth={50} tone="danger" panelWidth={126} />
      <text x={229} y={238} textAnchor="middle" fill="var(--danger)" fontSize={13} fontWeight={950} transform="rotate(-90 229 238)">TINY DECORATIVE TITLE</text>
      <rect x={210} y={110} width={8} height={216} fill="var(--danger)" opacity=".18" />
      <text x={170} y={392} fill="var(--danger)" fontSize={13} fontWeight={950}>too tight</text>
      <SpineWrap x={426} y={98} spineWidth={84} tone="success" panelWidth={126} />
      <rect x={564} y={130} width={60} height={156} rx={10} fill="color-mix(in srgb, var(--success) 10%, transparent)" stroke="var(--success)" strokeDasharray="7 7" strokeWidth={3} />
      <text x={594} y={232} textAnchor="middle" fill="var(--success)" fontSize={16} fontWeight={950} transform="rotate(-90 594 232)">BOOK TITLE</text>
      <text x={524} y={392} fill="var(--success)" fontSize={13} fontWeight={950}>centered + padded</text>
    </g>
  );
}

// ─── Color / Print diagrams ────────────────────────────────────────────────


export function ScreenVsPrintComparison() {
  // Left panel = vivid screen, right panel = muted print, centered in 800×450
  const lx = 82, rx = 438, py = 78, pw = 280, ph = 248;
  const midX = (lx + pw + rx) / 2 + 20; // ≈ 420 → vs-circle X
  return (
    <g>
      <Label x={268} y={50}>screen preview vs printed result</Label>

      {/* Left: screen */}
      <rect x={lx} y={py} width={pw} height={ph} rx={20} fill="var(--card)" stroke="var(--primary)" strokeWidth={3} />
      {/* Screen top bar with traffic-light dots */}
      <rect x={lx} y={py} width={pw} height={38} rx={20} fill="color-mix(in srgb, var(--primary) 14%, transparent)" />
      <circle cx={lx + 20} cy={py + 19} r={5} fill="var(--danger)" />
      <circle cx={lx + 36} cy={py + 19} r={5} fill="color-mix(in srgb, var(--primary) 80%, var(--foreground))" />
      <circle cx={lx + 52} cy={py + 19} r={5} fill="var(--success)" />
      <text x={lx + 140} y={py + 24} textAnchor="middle" fill="var(--muted-foreground)" fontSize={11} fontWeight={700}>design preview</text>
      {/* Vivid color swatches */}
      <rect x={lx + 18} y={py + 52} width={72} height={66} rx={10} fill="color-mix(in srgb, var(--danger) 68%, transparent)" />
      <rect x={lx + 104} y={py + 52} width={72} height={66} rx={10} fill="color-mix(in srgb, var(--primary) 72%, transparent)" />
      <rect x={lx + 190} y={py + 52} width={72} height={66} rx={10} fill="color-mix(in srgb, var(--success) 64%, transparent)" />
      {/* Title bar */}
      <rect x={lx + 18} y={py + 132} width={244} height={42} rx={9} fill="var(--foreground)" opacity={0.88} />
      <text x={lx + 140} y={py + 159} textAnchor="middle" fill="var(--card)" fontSize={17} fontWeight={950}>BOOK TITLE</text>
      {/* Author line */}
      <rect x={lx + 60} y={py + 186} width={160} height={14} rx={6} fill="var(--primary)" opacity={0.55} />
      {/* Label */}
      <rect x={lx + 68} y={py + ph + 14} width={144} height={30} rx={9} fill="var(--card)" stroke="var(--primary)" strokeWidth={2} />
      <text x={lx + 140} y={py + ph + 34} textAnchor="middle" fill="var(--primary)" fontSize={12} fontWeight={850}>screen — vibrant</text>

      {/* VS circle */}
      <circle cx={midX} cy={py + ph / 2} r={28} fill="var(--card)" stroke="var(--border)" strokeWidth={2.5} />
      <text x={midX} y={py + ph / 2 + 6} textAnchor="middle" fill="var(--muted-foreground)" fontSize={15} fontWeight={900}>vs</text>

      {/* Right: print */}
      <rect x={rx} y={py} width={pw} height={ph} rx={20} fill="var(--card)" stroke="var(--border)" strokeWidth={3} />
      <rect x={rx} y={py} width={pw} height={38} rx={20} fill="color-mix(in srgb, var(--muted) 48%, transparent)" />
      <text x={rx + 140} y={py + 24} textAnchor="middle" fill="var(--muted-foreground)" fontSize={11} fontWeight={700}>physical proof copy</text>
      {/* Muted color swatches */}
      <rect x={rx + 18} y={py + 52} width={72} height={66} rx={10} fill="color-mix(in srgb, var(--danger) 24%, transparent)" />
      <rect x={rx + 104} y={py + 52} width={72} height={66} rx={10} fill="color-mix(in srgb, var(--primary) 26%, transparent)" />
      <rect x={rx + 190} y={py + 52} width={72} height={66} rx={10} fill="color-mix(in srgb, var(--success) 22%, transparent)" />
      {/* Title bar (darker / muted) */}
      <rect x={rx + 18} y={py + 132} width={244} height={42} rx={9} fill="var(--foreground)" opacity={0.52} />
      <text x={rx + 140} y={py + 159} textAnchor="middle" fill="var(--card)" fontSize={17} fontWeight={950}>BOOK TITLE</text>
      {/* Author line */}
      <rect x={rx + 60} y={py + 186} width={160} height={14} rx={6} fill="var(--muted-foreground)" opacity={0.38} />
      {/* Warning badge */}
      <circle cx={rx + pw - 22} cy={py + 22} r={18} fill="var(--card)" stroke="var(--danger)" strokeWidth={3} />
      <text x={rx + pw - 28} y={py + 30} fill="var(--danger)" fontSize={20} fontWeight={950}>!</text>
      {/* Label */}
      <rect x={rx + 52} y={py + ph + 14} width={176} height={30} rx={9} fill="var(--card)" stroke="var(--border)" strokeWidth={2} />
      <text x={rx + 140} y={py + ph + 34} textAnchor="middle" fill="var(--muted-foreground)" fontSize={12} fontWeight={850}>print — softer &amp; darker</text>
    </g>
  );
}


export function RgbVsPrintOutput() {
  const colors: { label: string; rgb: string; print: string }[] = [
    { label: 'Neon pink', rgb: 'color-mix(in srgb, var(--danger) 85%, transparent)', print: 'color-mix(in srgb, var(--danger) 26%, transparent)' },
    { label: 'Electric blue', rgb: 'color-mix(in srgb, var(--primary) 90%, transparent)', print: 'color-mix(in srgb, var(--primary) 28%, transparent)' },
    { label: 'Vivid green', rgb: 'color-mix(in srgb, var(--success) 80%, transparent)', print: 'color-mix(in srgb, var(--success) 24%, transparent)' },
    { label: 'Royal purple', rgb: 'color-mix(in srgb, var(--primary) 70%, var(--danger) 30%)', print: 'color-mix(in srgb, var(--primary) 22%, var(--danger) 10%)' },
  ];
  return (
    <g>
      <Label x={272} y={48}>RGB screen color vs print ink result</Label>
      {/* Column headers */}
      <text x={200} y={82} textAnchor="middle" fill="var(--primary)" fontSize={14} fontWeight={950}>RGB on screen</text>
      <text x={500} y={82} textAnchor="middle" fill="var(--muted-foreground)" fontSize={14} fontWeight={850}>printed result</text>
      <text x={350} y={82} textAnchor="middle" fill="var(--border)" fontSize={20} fontWeight={400}>→</text>
      {colors.map(({ label, rgb, print }, i) => {
        const y = 100 + i * 84;
        return (
          <g key={label}>
            <rect x={82} y={y} width={234} height={64} rx={14} fill={rgb} />
            <text x={199} y={y + 37} textAnchor="middle" fill="var(--foreground)" fontSize={13} fontWeight={950}>{label}</text>
            <path d="M332 0v0" /> {/* spacer */}
            <rect x={82 + 302} y={y} width={234} height={64} rx={14} fill={print} />
            <text x={501} y={y + 37} textAnchor="middle" fill="var(--muted-foreground)" fontSize={13} fontWeight={850}>{label} — muted</text>
            {/* Arrow */}
            <path d={`M322 ${y + 32}h62`} stroke="var(--border)" strokeWidth={2.5} strokeDasharray="6 5" />
            <path d={`M378 ${y + 26}l8 6-8 6`} fill="none" stroke="var(--border)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </g>
        );
      })}
      <rect x={230} y={444} width={340} height={0} rx={0} /> {/* keeps viewBox */}
    </g>
  );
}


export function BlackPrintComparison() {
  const lx = 88, rx = 442, by = 72, bw = 270, bh = 280;
  return (
    <g>
      <Label x={272} y={50}>screen black vs printed black on matte paper</Label>

      {/* Left: screen deep black */}
      <rect x={lx} y={by} width={bw} height={bh} rx={20} fill="var(--foreground)" opacity={0.94} />
      {/* Screen glow rim */}
      <rect x={lx - 6} y={by - 6} width={bw + 12} height={bh + 12} rx={24} fill="none" stroke="var(--primary)" strokeWidth={2} opacity={0.4} />
      {/* Visible gradient detail (faint) */}
      <rect x={lx + 24} y={by + 32} width={222} height={108} rx={12} fill="color-mix(in srgb, var(--primary) 18%, transparent)" />
      <text x={lx + 135} y={by + 93} textAnchor="middle" fill="var(--card)" fontSize={20} fontWeight={950}>TITLE</text>
      <rect x={lx + 64} y={by + 158} width={142} height={14} rx={6} fill="var(--card)" opacity={0.45} />
      <rect x={lx + 90} y={by + 182} width={90} height={10} rx={5} fill="var(--card)" opacity={0.28} />
      {/* Label */}
      <rect x={lx + 50} y={by + bh + 16} width={170} height={30} rx={9} fill="var(--card)" stroke="var(--primary)" strokeWidth={2} />
      <text x={lx + 135} y={by + bh + 36} textAnchor="middle" fill="var(--primary)" fontSize={12} fontWeight={850}>screen: deep black</text>

      {/* Right: printed matte */}
      <rect x={rx} y={by} width={bw} height={bh} rx={20} fill="color-mix(in srgb, var(--foreground) 58%, var(--muted))" />
      {/* Details barely visible in print */}
      <rect x={rx + 24} y={by + 32} width={222} height={108} rx={12} fill="color-mix(in srgb, var(--muted) 20%, transparent)" />
      <text x={rx + 135} y={by + 93} textAnchor="middle" fill="var(--card)" fontSize={20} fontWeight={950}>TITLE</text>
      <rect x={rx + 64} y={by + 158} width={142} height={14} rx={6} fill="var(--card)" opacity={0.18} />
      <rect x={rx + 90} y={by + 182} width={90} height={10} rx={5} fill="var(--card)" opacity={0.10} />
      {/* Warning badge */}
      <circle cx={rx + bw - 24} cy={by + 24} r={18} fill="var(--card)" stroke="var(--danger)" strokeWidth={3} />
      <text x={rx + bw - 30} y={by + 32} fill="var(--danger)" fontSize={20} fontWeight={950}>!</text>
      {/* Label */}
      <rect x={rx + 30} y={by + bh + 16} width={210} height={30} rx={9} fill="var(--card)" stroke="var(--danger)" strokeWidth={2} />
      <text x={rx + 135} y={by + bh + 36} textAnchor="middle" fill="var(--danger)" fontSize={12} fontWeight={850}>print: soft gray on matte</text>

      {/* Fix tip */}
      <rect x={246} y={408} width={308} height={30} rx={10} fill="color-mix(in srgb, var(--success) 9%, var(--card))" stroke="var(--success)" strokeWidth={2} />
      <text x={400} y={428} textAnchor="middle" fill="var(--success)" fontSize={12} fontWeight={950}>fix: increase contrast + consider glossy</text>
    </g>
  );
}


export function ExportWorkflowBadGood() {
  const bad = [
    ['PNG / JPEG export', '✗'],
    ['Screenshots as artwork', '✗'],
    ['Resize after export', '✗'],
    ['Standard PDF quality', '✗'],
  ];
  const good = [
    ['PDF Print export', '✓'],
    ['300 DPI source images', '✓'],
    ['No resize after export', '✓'],
    ['Verify file size (5–30 MB)', '✓'],
  ];
  return (
    <g>
      <Label x={236} y={46}>Canva export: common mistakes vs correct workflow</Label>
      {/* Column headers */}
      <rect x={82} y={64} width={278} height={36} rx={12} fill="color-mix(in srgb, var(--danger) 10%, var(--card))" stroke="var(--danger)" strokeWidth={2} />
      <text x={221} y={87} textAnchor="middle" fill="var(--danger)" fontSize={14} fontWeight={950}>mistakes</text>
      <rect x={440} y={64} width={278} height={36} rx={12} fill="color-mix(in srgb, var(--success) 10%, var(--card))" stroke="var(--success)" strokeWidth={2} />
      <text x={579} y={87} textAnchor="middle" fill="var(--success)" fontSize={14} fontWeight={950}>correct workflow</text>
      {/* Bad column */}
      {bad.map(([text, icon], i) => (
        <g key={text}>
          <rect x={82} y={112 + i * 72} width={278} height={54} rx={13} fill="var(--card)" stroke="var(--danger)" strokeWidth={2} />
          <circle cx={116} cy={112 + i * 72 + 27} r={14} fill="color-mix(in srgb, var(--danger) 12%, transparent)" />
          <text x={116} y={112 + i * 72 + 27} textAnchor="middle" dominantBaseline="central" fill="var(--danger)" fontSize={14} fontWeight={950}>{icon}</text>
          <text x={140} y={112 + i * 72 + 27} dominantBaseline="central" fill="var(--foreground)" fontSize={13} fontWeight={850}>{text}</text>
        </g>
      ))}
      {/* Good column */}
      {good.map(([text, icon], i) => (
        <g key={text}>
          <rect x={440} y={112 + i * 72} width={278} height={54} rx={13} fill="var(--card)" stroke="var(--success)" strokeWidth={2} />
          <circle cx={474} cy={112 + i * 72 + 27} r={14} fill="color-mix(in srgb, var(--success) 12%, transparent)" />
          <text x={474} y={112 + i * 72 + 27} textAnchor="middle" dominantBaseline="central" fill="var(--success)" fontSize={14} fontWeight={950}>{icon}</text>
          <text x={498} y={112 + i * 72 + 27} dominantBaseline="central" fill="var(--foreground)" fontSize={13} fontWeight={850}>{text}</text>
        </g>
      ))}
      {/* Divider */}
      <path d="M398 64v364" stroke="var(--border)" strokeWidth={2} strokeDasharray="6 6" />
    </g>
  );
}


export function ColoringBookContrast() {
  const lx = 84, rx = 448, cy2 = 76, cw = 268, ch = 290;
  return (
    <g>
      <Label x={252} y={52}>coloring book cover: low contrast vs high contrast</Label>

      {/* Left: low contrast — muddy */}
      <rect x={lx} y={cy2} width={cw} height={ch} rx={18} fill="color-mix(in srgb, var(--foreground) 88%, transparent)" />
      {/* Near-same-shade color cells (hard to distinguish) */}
      {[0, 1, 2].map((col) =>
        [0, 1, 2].map((row) => (
          <rect
            key={`lo-${col}-${row}`}
            x={lx + 16 + col * 76}
            y={cy2 + 20 + row * 72}
            width={68}
            height={64}
            rx={8}
            fill={`color-mix(in srgb, var(--foreground) ${72 - col * 6 - row * 4}%, transparent)`}
          />
        ))
      )}
      {/* Title on low-contrast bg — barely visible */}
      <rect x={lx + 20} y={cy2 + ch - 62} width={228} height={46} rx={10} fill="color-mix(in srgb, var(--foreground) 70%, transparent)" />
      <text x={lx + 134} y={cy2 + ch - 32} textAnchor="middle" fill="color-mix(in srgb, var(--card) 50%, transparent)" fontSize={16} fontWeight={950}>TITLE</text>
      <rect x={lx + 24} y={cy2 + ch + 14} width={220} height={28} rx={9} fill="var(--card)" stroke="var(--danger)" strokeWidth={2} />
      <text x={lx + 134} y={cy2 + ch + 33} textAnchor="middle" fill="var(--danger)" fontSize={12} fontWeight={850}>low contrast — muddy print</text>

      {/* Right: high contrast — clear */}
      <rect x={rx} y={cy2} width={cw} height={ch} rx={18} fill="var(--foreground)" opacity={0.92} />
      {/* Distinct color cells */}
      {[
        ['var(--danger)', 'var(--primary)', 'var(--success)'],
        ['var(--primary)', 'var(--success)', 'var(--danger)'],
        ['var(--success)', 'var(--danger)', 'var(--primary)'],
      ].map((row, ri) =>
        row.map((color, ci) => (
          <rect
            key={`hi-${ri}-${ci}`}
            x={rx + 16 + ci * 76}
            y={cy2 + 20 + ri * 72}
            width={68}
            height={64}
            rx={8}
            fill={`color-mix(in srgb, ${color} 60%, transparent)`}
          />
        ))
      )}
      {/* Clear title */}
      <rect x={rx + 20} y={cy2 + ch - 62} width={228} height={46} rx={10} fill="var(--card)" />
      <text x={rx + 134} y={cy2 + ch - 32} textAnchor="middle" fill="var(--foreground)" fontSize={16} fontWeight={950}>TITLE</text>
      <rect x={rx + 24} y={cy2 + ch + 14} width={220} height={28} rx={9} fill="var(--card)" stroke="var(--success)" strokeWidth={2} />
      <text x={rx + 134} y={cy2 + ch + 33} textAnchor="middle" fill="var(--success)" fontSize={12} fontWeight={850}>high contrast — print-ready</text>
    </g>
  );
}


export function MatteGlossyFinish() {
  const lx = 86, rx = 444, py = 78, pw = 270, ph = 270;
  return (
    <g>
      <Label x={268} y={52}>matte vs glossy laminate color appearance</Label>

      {/* Left: matte — soft */}
      <rect x={lx} y={py} width={pw} height={ph} rx={20} fill="var(--card)" stroke="var(--border)" strokeWidth={3} />
      {/* Soft matte fill */}
      <rect x={lx + 14} y={py + 14} width={pw - 28} height={ph - 28} rx={14} fill="color-mix(in srgb, var(--primary) 30%, var(--muted))" />
      <rect x={lx + 44} y={py + 52} width={182} height={52} rx={10} fill="color-mix(in srgb, var(--foreground) 55%, transparent)" />
      <text x={lx + 135} y={py + 84} textAnchor="middle" fill="var(--card)" fontSize={18} fontWeight={950}>TITLE</text>
      <rect x={lx + 80} y={py + 116} width={110} height={14} rx={6} fill="var(--card)" opacity={0.32} />
      {/* Matte texture lines (subtle) */}
      {[0, 1, 2, 3].map((i) => (
        <path key={i} d={`M${lx + 14} ${py + 168 + i * 18}h${pw - 28}`} stroke="var(--card)" strokeWidth={1} opacity={0.06} />
      ))}
      <text x={lx + 135} y={py + 232} textAnchor="middle" fill="var(--muted-foreground)" fontSize={12} fontWeight={750}>soft · non-reflective</text>
      <rect x={lx + 54} y={py + ph + 14} width={162} height={30} rx={9} fill="var(--card)" stroke="var(--border)" strokeWidth={2} />
      <text x={lx + 135} y={py + ph + 34} textAnchor="middle" fill="var(--muted-foreground)" fontSize={12} fontWeight={850}>matte — softer colors</text>

      {/* Right: glossy — vivid */}
      <rect x={rx} y={py} width={pw} height={ph} rx={20} fill="var(--card)" stroke="var(--primary)" strokeWidth={3} />
      {/* Vivid glossy fill */}
      <rect x={rx + 14} y={py + 14} width={pw - 28} height={ph - 28} rx={14} fill="color-mix(in srgb, var(--primary) 62%, transparent)" />
      <rect x={rx + 44} y={py + 52} width={182} height={52} rx={10} fill="var(--foreground)" opacity={0.88} />
      <text x={rx + 135} y={py + 84} textAnchor="middle" fill="var(--card)" fontSize={18} fontWeight={950}>TITLE</text>
      <rect x={rx + 80} y={py + 116} width={110} height={14} rx={6} fill="var(--card)" opacity={0.6} />
      {/* Glare highlight */}
      <ellipse cx={rx + 220} cy={py + 40} rx={38} ry={16} fill="var(--card)" opacity={0.18} transform="rotate(-20 0 0)" />
      <text x={rx + 135} y={py + 232} textAnchor="middle" fill="var(--primary)" fontSize={12} fontWeight={750}>bright · reflective</text>
      <rect x={rx + 40} y={py + ph + 14} width={190} height={30} rx={9} fill="var(--card)" stroke="var(--primary)" strokeWidth={2} />
      <text x={rx + 135} y={py + ph + 34} textAnchor="middle" fill="var(--primary)" fontSize={12} fontWeight={850}>glossy — richer colors</text>
    </g>
  );
}


export function ColorProofWorkflow() {
  const steps = [
    { icon: '☀', label: 'Normal brightness', sub: 'reduce to 50–60%' },
    { icon: '⊕', label: 'Thumbnail check', sub: 'zoom to 200px' },
    { icon: '◑', label: 'Grayscale test', sub: 'text must stay clear' },
    { icon: '⎙', label: 'Local draft print', sub: 'any home printer' },
    { icon: '↑', label: 'Upload to KDP', sub: 'PDF Print only' },
    { icon: '📦', label: 'Order proof copy', sub: 'review in person' },
  ];
  const cols = 3, rows = 2;
  const bw = 192, bh = 96, gapX = 60, gapY = 52;
  const totalW = cols * bw + (cols - 1) * gapX;
  const startX = (800 - totalW) / 2;
  return (
    <g>
      <Label x={236} y={46}>color test workflow before publishing</Label>
      {steps.map(({ icon, label, sub }, i) => {
        const col = i % cols, row = Math.floor(i / cols);
        const bx = startX + col * (bw + gapX);
        const by = 74 + row * (bh + gapY);
        const isLast = i === steps.length - 1;
        return (
          <g key={label}>
            <rect x={bx} y={by} width={bw} height={bh} rx={16}
              fill="var(--card)"
              stroke={isLast ? 'var(--success)' : 'var(--primary)'}
              strokeWidth={isLast ? 3 : 2.5} />
            {/* Step number */}
            <circle cx={bx + 22} cy={by + 22} r={14} fill={isLast ? 'color-mix(in srgb, var(--success) 14%, transparent)' : 'color-mix(in srgb, var(--primary) 14%, transparent)'} />
            <text x={bx + 17} y={by + 28} fill={isLast ? 'var(--success)' : 'var(--primary)'} fontSize={13} fontWeight={950}>{i + 1}</text>
            {/* Label */}
            <text x={bx + 46} y={by + 36} fill="var(--foreground)" fontSize={13} fontWeight={950}>{label}</text>
            <text x={bx + 46} y={by + 56} fill="var(--muted-foreground)" fontSize={11} fontWeight={750}>{sub}</text>
            {/* Connector arrow (right) */}
            {col < cols - 1 && (
              <path d={`M${bx + bw + 4} ${by + bh / 2}h${gapX - 8}`} stroke="var(--primary)" strokeWidth={2.5} strokeDasharray="6 5" />
            )}
            {/* Connector arrow (down, last in row) */}
            {col === cols - 1 && row < rows - 1 && (
              <path d={`M${bx + bw / 2} ${by + bh + 4}v${gapY - 8}`} stroke="var(--primary)" strokeWidth={2.5} strokeDasharray="6 5" />
            )}
          </g>
        );
      })}
      {/* Result tip */}
      <rect x={250} y={396} width={300} height={34} rx={11} fill="color-mix(in srgb, var(--success) 9%, var(--card))" stroke="var(--success)" strokeWidth={2.5} />
      <text x={400} y={418} textAnchor="middle" fill="var(--success)" fontSize={13} fontWeight={950}>proof copy = only reliable color check</text>
    </g>
  );
}


