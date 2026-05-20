import type React from 'react';

export function KdpTrimShiftBorderVisualization() {
  // Two book covers side-by-side: left = digital (even), right = printed (shifted)
  const coverW = 220;
  const coverH = 290;
  const borderInset = 18;
  const shift = 22; // px trim shift exaggerated for clarity

  return (
    <g>
      <text x={400} y={44} textAnchor="middle" fill="var(--foreground)" fontSize={20} fontWeight={950}>How a trim shift turns a centered border crooked</text>

      {/* ── LEFT: digital / PDF ── */}
      <text x={200} y={80} textAnchor="middle" fill="var(--muted-foreground)" fontSize={13} fontWeight={800}>PDF file — mathematically centered</text>
      {/* book body */}
      <rect x={90} y={92} width={coverW} height={coverH} rx={6} fill="color-mix(in srgb,var(--foreground) 88%,transparent)" />
      {/* border — even on all sides */}
      <rect
        x={90 + borderInset} y={92 + borderInset}
        width={coverW - borderInset * 2} height={coverH - borderInset * 2}
        rx={3} fill="none"
        stroke="color-mix(in srgb,var(--primary) 90%,transparent)" strokeWidth={2.5}
      />
      {/* equal gap arrows */}
      {/* top gap */}
      <line x1={200} y1={92} x2={200} y2={92 + borderInset} stroke="var(--success)" strokeWidth={1.5} strokeDasharray="3 2" />
      <rect x={180} y={92 + 3} width={40} height={16} rx={4} fill="var(--card)" />
      <text x={200} y={104} textAnchor="middle" fill="var(--success)" fontSize={10} fontWeight={900}>18 px</text>
      {/* bottom gap */}
      <line x1={200} y1={92 + coverH - borderInset} x2={200} y2={92 + coverH} stroke="var(--success)" strokeWidth={1.5} strokeDasharray="3 2" />
      <rect x={180} y={92 + coverH - borderInset + 3} width={40} height={16} rx={4} fill="var(--card)" />
      <text x={200} y={92 + coverH - borderInset + 15} textAnchor="middle" fill="var(--success)" fontSize={10} fontWeight={900}>18 px</text>
      {/* left gap */}
      <line x1={90} y1={200} x2={90 + borderInset} y2={200} stroke="var(--success)" strokeWidth={1.5} strokeDasharray="3 2" />
      <rect x={91} y={191} width={24} height={16} rx={4} fill="var(--card)" />
      <text x={103} y={203} textAnchor="middle" fill="var(--success)" fontSize={10} fontWeight={900}>18</text>
      {/* right gap */}
      <line x1={90 + coverW - borderInset} y1={200} x2={90 + coverW} y2={200} stroke="var(--success)" strokeWidth={1.5} strokeDasharray="3 2" />
      <rect x={90 + coverW - borderInset + 3} y={191} width={24} height={16} rx={4} fill="var(--card)" />
      <text x={90 + coverW - borderInset + 15} y={203} textAnchor="middle" fill="var(--success)" fontSize={10} fontWeight={900}>18</text>
      {/* check badge */}
      <circle cx={200} cy={424} r={14} fill="color-mix(in srgb,var(--success) 18%,transparent)" stroke="var(--success)" strokeWidth={2} />
      <path d="M193 424l4 5 10-9" fill="none" stroke="var(--success)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

      {/* ── CENTER arrow ── */}
      <text x={400} y={185} textAnchor="middle" fill="var(--muted-foreground)" fontSize={11} fontWeight={800}>print</text>
      <text x={400} y={200} textAnchor="middle" fill="var(--muted-foreground)" fontSize={11} fontWeight={800}>& cut</text>
      <path d="M348 192 h20 l-8-8 m8 8 l-8 8" fill="none" stroke="var(--primary)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M432 192 h20 l-8-8 m8 8 l-8 8" fill="none" stroke="var(--primary)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M360 192 h80" stroke="var(--primary)" strokeWidth={2} strokeDasharray="4 3" />

      {/* ── RIGHT: printed / shifted ── */}
      <text x={600} y={80} textAnchor="middle" fill="var(--muted-foreground)" fontSize={13} fontWeight={800}>Printed copy — trim shifted left</text>
      {/* book body (trim cuts slightly left, revealing less left gap) */}
      <rect x={490} y={92} width={coverW} height={coverH} rx={6} fill="color-mix(in srgb,var(--foreground) 88%,transparent)" />
      {/* border stays in place on the sheet, but the cover is now cut shifted */}
      {/* visually: border appears closer on the left, further on the right */}
      <rect
        x={490 + borderInset + shift} y={92 + borderInset}
        width={coverW - borderInset * 2} height={coverH - borderInset * 2}
        rx={3} fill="none"
        stroke="color-mix(in srgb,var(--primary) 90%,transparent)" strokeWidth={2.5}
      />
      {/* left gap — small */}
      <line x1={490} y1={200} x2={490 + borderInset + shift} y2={200} stroke="var(--danger)" strokeWidth={1.5} strokeDasharray="3 2" />
      <rect x={491} y={191} width={24} height={16} rx={4} fill="var(--card)" />
      <text x={503} y={203} textAnchor="middle" fill="var(--danger)" fontSize={10} fontWeight={900}>40</text>
      {/* right gap — large */}
      <line x1={490 + borderInset + shift + (coverW - borderInset * 2)} y1={200} x2={490 + coverW} y2={200} stroke="var(--success)" strokeWidth={1.5} strokeDasharray="3 2" />
      <rect x={490 + coverW - 26} y={191} width={24} height={16} rx={4} fill="var(--card)" />
      <text x={490 + coverW - 14} y={203} textAnchor="middle" fill="var(--success)" fontSize={10} fontWeight={900}>7</text>
      {/* warning badge */}
      <circle cx={600} cy={424} r={14} fill="color-mix(in srgb,var(--danger) 15%,transparent)" stroke="var(--danger)" strokeWidth={2} />
      <text x={600} y={429} textAnchor="middle" fill="var(--danger)" fontSize={15} fontWeight={950}>!</text>

      {/* trim shift arrow annotation */}
      <rect x={460} y={386} width={280} height={22} rx={7} fill="color-mix(in srgb,var(--danger) 10%,var(--card))" stroke="var(--danger)" strokeWidth={1.5} />
      <text x={600} y={401} textAnchor="middle" fill="var(--danger)" fontSize={11} fontWeight={850}>trim shifted ~1/16 in → border looks uneven</text>
    </g>
  );
}


export function ThinVsThickBorderTolerance() {
  return (
    <g>
      <text x={400} y={44} textAnchor="middle" fill="var(--foreground)" fontSize={20} fontWeight={950}>Same trim shift — different visual impact</text>

      {/* shared trim-shift label */}
      <rect x={280} y={60} width={240} height={26} rx={8} fill="color-mix(in srgb,var(--warning) 14%,var(--card))" stroke="var(--warning)" strokeWidth={1.5} />
      <text x={400} y={77} textAnchor="middle" fill="var(--warning)" fontSize={12} fontWeight={900}>trim shifts 4.5 pt (≈ 1/16 in) on both</text>

      {/* ── LEFT: thin border ── */}
      <text x={200} y={112} textAnchor="middle" fill="var(--danger)" fontSize={14} fontWeight={850}>1 pt border</text>

      {/* book */}
      <rect x={80} y={124} width={240} height={240} rx={8} fill="color-mix(in srgb,var(--foreground) 86%,transparent)" />
      {/* border (shifted: left gap narrow, right gap wide) */}
      {/* left gap = 6 pt, right gap = 15 pt  → 2.5× difference, very obvious */}
      <rect x={80 + 6} y={124 + 10} width={240 - 6 - 15} height={240 - 20} rx={2} fill="none" stroke="white" strokeWidth={1} />

      {/* gap ruler — left */}
      <line x1={80} y1={248} x2={86} y2={248} stroke="var(--danger)" strokeWidth={2} />
      <rect x={58} y={240} width={28} height={18} rx={4} fill="var(--card)" stroke="var(--danger)" strokeWidth={1} />
      <text x={72} y={252} textAnchor="middle" fill="var(--danger)" fontSize={11} fontWeight={900}>6 pt</text>
      {/* gap ruler — right */}
      <line x1={305} y1={248} x2={320} y2={248} stroke="var(--success)" strokeWidth={2} />
      <rect x={314} y={240} width={30} height={18} rx={4} fill="var(--card)" stroke="var(--success)" strokeWidth={1} />
      <text x={329} y={252} textAnchor="middle" fill="var(--success)" fontSize={11} fontWeight={900}>15 pt</text>

      {/* ratio label */}
      <rect x={120} y={382} width={160} height={22} rx={7} fill="color-mix(in srgb,var(--danger) 14%,var(--card))" stroke="var(--danger)" strokeWidth={1.5} />
      <text x={200} y={397} textAnchor="middle" fill="var(--danger)" fontSize={11} fontWeight={900}>2.5× gap ratio — obvious</text>

      {/* ── RIGHT: thick border ── */}
      <text x={600} y={112} textAnchor="middle" fill="var(--success)" fontSize={14} fontWeight={850}>12 pt border</text>

      {/* book */}
      <rect x={480} y={124} width={240} height={240} rx={8} fill="color-mix(in srgb,var(--foreground) 86%,transparent)" />
      {/* border shifted same amount — left gap = 8 pt, right gap = 17 pt → much less ratio */}
      <rect x={480 + 8} y={124 + 10} width={240 - 8 - 17} height={240 - 20} rx={2} fill="none" stroke="white" strokeWidth={6} />

      {/* gap ruler — left */}
      <line x1={480} y1={248} x2={488} y2={248} stroke="var(--warning)" strokeWidth={2} />
      <rect x={458} y={240} width={30} height={18} rx={4} fill="var(--card)" stroke="var(--warning)" strokeWidth={1} />
      <text x={473} y={252} textAnchor="middle" fill="var(--warning)" fontSize={11} fontWeight={900}>8 pt</text>
      {/* gap ruler — right */}
      <line x1={705} y1={248} x2={720} y2={248} stroke="var(--warning)" strokeWidth={2} />
      <rect x={714} y={240} width={30} height={18} rx={4} fill="var(--card)" stroke="var(--warning)" strokeWidth={1} />
      <text x={729} y={252} textAnchor="middle" fill="var(--warning)" fontSize={11} fontWeight={900}>17 pt</text>

      {/* ratio label */}
      <rect x={520} y={382} width={160} height={22} rx={7} fill="color-mix(in srgb,var(--success) 14%,var(--card))" stroke="var(--success)" strokeWidth={1.5} />
      <text x={600} y={397} textAnchor="middle" fill="var(--success)" fontSize={11} fontWeight={900}>1.3× gap ratio — tolerable</text>

      <rect x={140} y={420} width={520} height={22} rx={8} fill="color-mix(in srgb,var(--primary) 9%,var(--card))" stroke="color-mix(in srgb,var(--primary) 30%,var(--border))" strokeWidth={1.5} />
      <text x={400} y={435} textAnchor="middle" fill="var(--foreground)" fontSize={12} fontWeight={850}>Thicker borders make the same cutting variation far less visible</text>
    </g>
  );
}


export function CanvaCenteringVsPrintCentering() {
  const bookW = 210;
  const bookH = 260;
  const bx = 95;
  const by = 100;

  return (
    <g>
      <text x={400} y={40} textAnchor="middle" fill="var(--foreground)" fontSize={20} fontWeight={950}>Canva's precision stops at the PDF edge</text>

      {/* Section labels — above boundaries */}
      <text x={200} y={62} textAnchor="middle" fill="var(--muted-foreground)" fontSize={13} fontWeight={800}>Canva canvas (digital)</text>
      <text x={600} y={62} textAnchor="middle" fill="var(--muted-foreground)" fontSize={13} fontWeight={800}>Physical book after cutting</text>

      {/* Canva canvas */}
      {/* canvas outer boundary */}
      <rect x={bx - 20} y={by - 20} width={bookW + 40} height={bookH + 40} rx={6}
        fill="color-mix(in srgb,var(--primary) 5%,var(--card))" stroke="var(--primary)" strokeWidth={2} strokeDasharray="6 4" />
      <text x={200} y={by - 6} textAnchor="middle" fill="var(--primary)" fontSize={10} fontWeight={800}>Canva canvas edge</text>
      {/* book */}
      <rect x={bx} y={by} width={bookW} height={bookH} rx={5} fill="color-mix(in srgb,var(--foreground) 85%,transparent)" />
      {/* centered border */}
      <rect x={bx + 18} y={by + 18} width={bookW - 36} height={bookH - 36}
        fill="none" stroke="color-mix(in srgb,var(--primary) 80%,transparent)" strokeWidth={2} />
      {/* snap guides */}
      <line x1={200} y1={by - 20} x2={200} y2={by + bookH + 20} stroke="var(--primary)" strokeWidth={1} strokeDasharray="3 3" opacity=".5" />
      <line x1={bx - 20} y1={by + bookH / 2} x2={bx + bookW + 20} y2={by + bookH / 2} stroke="var(--primary)" strokeWidth={1} strokeDasharray="3 3" opacity=".5" />
      <text x={200} y={by + bookH + 30} textAnchor="middle" fill="var(--primary)" fontSize={11} fontWeight={800}>mathematically perfect ✓</text>

      {/* divider */}
      <line x1={380} y1={60} x2={380} y2={400} stroke="var(--border)" strokeWidth={2} strokeDasharray="5 4" />

      {/* PDF + physical */}
      {/* print sheet (larger, showing bleed zone) */}
      <rect x={490 - 14} y={by - 14} width={bookW + 28} height={bookH + 28} rx={4}
        fill="color-mix(in srgb,var(--warning) 6%,var(--card))" stroke="var(--warning)" strokeWidth={1.5} strokeDasharray="4 3" />
      <text x={600} y={by - 2} textAnchor="middle" fill="var(--warning)" fontSize={10} fontWeight={800}>print sheet (with bleed)</text>
      {/* actual trim line (shifted) */}
      <rect x={490 + 12} y={by} width={bookW} height={bookH} rx={5}
        fill="color-mix(in srgb,var(--foreground) 85%,transparent)"
        stroke="var(--danger)" strokeWidth={2} strokeDasharray="5 3" />
      <text x={600} y={by + bookH + 16} textAnchor="middle" fill="var(--danger)" fontSize={10} fontWeight={800}>actual cut position (shifted)</text>
      {/* border — designed to be centered, now appears off-center after print shift */}
      <rect x={490 + 18} y={by + 18} width={bookW - 36} height={bookH - 36}
        fill="none" stroke="color-mix(in srgb,var(--primary) 80%,transparent)" strokeWidth={2} />
      {/* Gap callouts: left small (danger), right large (muted) */}
      <rect x={388} y={by + 124} width={58} height={16} rx={5} fill="var(--card)" stroke="var(--danger)" strokeWidth={1.5} />
      <text x={417} y={by + 136} textAnchor="middle" fill="var(--danger)" fontSize={10} fontWeight={900}>left: 6 px</text>
      <rect x={714} y={by + 124} width={72} height={16} rx={5} fill="var(--card)" stroke="var(--muted-foreground)" strokeWidth={1.5} />
      <text x={750} y={by + 136} textAnchor="middle" fill="var(--muted-foreground)" fontSize={10} fontWeight={900}>right: 30 px</text>

      <rect x={420} y={400} width={356} height={24} rx={8} fill="color-mix(in srgb,var(--danger) 10%,var(--card))" stroke="var(--danger)" strokeWidth={1.5} />
      <text x={598} y={416} textAnchor="middle" fill="var(--danger)" fontSize={12} fontWeight={850}>cutter variation makes identical gaps look unequal</text>
    </g>
  );
}


export function SafeVsRiskyBorderPositions() {
  // Two book covers showing border distance from trim
  return (
    <g>
      <text x={400} y={44} textAnchor="middle" fill="var(--foreground)" fontSize={20} fontWeight={950}>Border distance from trim edge</text>

      {/* ── LEFT: risky ── */}
      <text x={200} y={78} textAnchor="middle" fill="var(--danger)" fontSize={14} fontWeight={850}>risky — too close to trim</text>
      <rect x={74} y={90} width={252} height={306} rx={6} fill="color-mix(in srgb,var(--foreground) 87%,transparent)" />
      {/* danger zone fill */}
      <rect x={74} y={90} width={252} height={18} rx={0} fill="color-mix(in srgb,var(--danger) 22%,transparent)" />
      <rect x={74} y={90} width={18} height={306} rx={0} fill="color-mix(in srgb,var(--danger) 22%,transparent)" />
      <rect x={74 + 252 - 18} y={90} width={18} height={306} rx={0} fill="color-mix(in srgb,var(--danger) 22%,transparent)" />
      <rect x={74} y={90 + 306 - 18} width={252} height={18} rx={0} fill="color-mix(in srgb,var(--danger) 22%,transparent)" />
      {/* border — too close */}
      <rect x={74 + 10} y={90 + 10} width={252 - 20} height={306 - 20} rx={2} fill="none" stroke="var(--danger)" strokeWidth={2} />
      {/* distance label top */}
      <line x1={200} y1={90} x2={200} y2={100} stroke="var(--danger)" strokeWidth={1.5} />
      <rect x={170} y={95} width={60} height={18} rx={5} fill="var(--card)" stroke="var(--danger)" strokeWidth={1} />
      <text x={200} y={108} textAnchor="middle" fill="var(--danger)" fontSize={11} fontWeight={900}>0.09 in ✗</text>
      {/* safe area boundary */}
      <rect x={74 + 18} y={90 + 18} width={252 - 36} height={306 - 36} rx={2} fill="none" stroke="var(--warning)" strokeWidth={1} strokeDasharray="4 3" />
      <text x={200} y={420} textAnchor="middle" fill="var(--warning)" fontSize={10} fontWeight={800}>safe area boundary</text>

      {/* ── RIGHT: safe ── */}
      <text x={600} y={78} textAnchor="middle" fill="var(--success)" fontSize={14} fontWeight={850}>safe — moved well inward</text>
      <rect x={474} y={90} width={252} height={306} rx={6} fill="color-mix(in srgb,var(--foreground) 87%,transparent)" />
      {/* safe zone fill */}
      <rect x={474} y={90} width={252} height={46} rx={0} fill="color-mix(in srgb,var(--success) 10%,transparent)" />
      <rect x={474} y={90} width={46} height={306} rx={0} fill="color-mix(in srgb,var(--success) 10%,transparent)" />
      <rect x={474 + 252 - 46} y={90} width={46} height={306} rx={0} fill="color-mix(in srgb,var(--success) 10%,transparent)" />
      <rect x={474} y={90 + 306 - 46} width={252} height={46} rx={0} fill="color-mix(in srgb,var(--success) 10%,transparent)" />
      {/* border — well inward */}
      <rect x={474 + 40} y={90 + 40} width={252 - 80} height={306 - 80} rx={2} fill="none" stroke="var(--success)" strokeWidth={2} />
      {/* distance label top */}
      <line x1={600} y1={90} x2={600} y2={130} stroke="var(--success)" strokeWidth={1.5} />
      <rect x={570} y={105} width={60} height={18} rx={5} fill="var(--card)" stroke="var(--success)" strokeWidth={1} />
      <text x={600} y={118} textAnchor="middle" fill="var(--success)" fontSize={11} fontWeight={900}>0.4 in ✓</text>
      {/* safe area boundary */}
      <rect x={474 + 18} y={90 + 18} width={252 - 36} height={306 - 36} rx={2} fill="none" stroke="var(--warning)" strokeWidth={1} strokeDasharray="4 3" />
      <text x={600} y={420} textAnchor="middle" fill="var(--warning)" fontSize={10} fontWeight={800}>safe area boundary</text>

      <rect x={130} y={424} width={540} height={22} rx={8} fill="color-mix(in srgb,var(--primary) 8%,var(--card))" stroke="color-mix(in srgb,var(--primary) 30%,var(--border))" strokeWidth={1.5} />
      <text x={400} y={439} textAnchor="middle" fill="var(--foreground)" fontSize={12} fontWeight={850}>Min. 0.375 in inset — more for thin strokes or matte dark covers</text>
    </g>
  );
}


export function SpineWraparoundBorderShift() {
  // Full wrap: back | spine | front — shows border crossing spine
  const backW = 210;
  const spineW = 60;
  const frontW = 210;
  const coverH = 240;
  const startX = 60;
  const topY = 90;

  const backX = startX;
  const spineX = startX + backW;
  const frontX = startX + backW + spineW;

  return (
    <g>
      <text x={400} y={44} textAnchor="middle" fill="var(--foreground)" fontSize={20} fontWeight={950}>Spine fold shift breaks wraparound borders</text>

      {/* Back cover */}
      <rect x={backX} y={topY} width={backW} height={coverH} rx={0} fill="color-mix(in srgb,var(--foreground) 84%,transparent)" />
      <text x={backX + backW / 2} y={topY + coverH / 2} textAnchor="middle" fill="var(--muted-foreground)" fontSize={12} fontWeight={750}>back cover</text>

      {/* Spine */}
      <rect x={spineX} y={topY} width={spineW} height={coverH} rx={0} fill="color-mix(in srgb,var(--foreground) 74%,transparent)" />
      <text x={spineX + spineW / 2} y={topY + coverH / 2} textAnchor="middle" fill="var(--muted-foreground)" fontSize={10} fontWeight={750} writingMode="tb">SPINE</text>

      {/* Front cover */}
      <rect x={frontX} y={topY} width={frontW} height={coverH} rx={0} fill="color-mix(in srgb,var(--foreground) 84%,transparent)" />
      <text x={frontX + frontW / 2} y={topY + coverH / 2} textAnchor="middle" fill="var(--muted-foreground)" fontSize={12} fontWeight={750}>front cover</text>

      {/* Wraparound border — designed */}
      <rect x={backX + 16} y={topY + 16} width={backW + spineW + frontW - 32} height={coverH - 32}
        fill="none" stroke="color-mix(in srgb,var(--primary) 75%,transparent)" strokeWidth={2.5} strokeDasharray="0" />
      <text x={400} y={topY - 6} textAnchor="middle" fill="var(--primary)" fontSize={10} fontWeight={800}>designed border (PDF)</text>

      {/* Fold lines (designed) */}
      <line x1={spineX} y1={topY} x2={spineX} y2={topY + coverH} stroke="var(--border)" strokeWidth={2} strokeDasharray="5 3" />
      <line x1={frontX} y1={topY} x2={frontX} y2={topY + coverH} stroke="var(--border)" strokeWidth={2} strokeDasharray="5 3" />
      <text x={spineX} y={topY + coverH + 18} textAnchor="end" fill="var(--muted-foreground)" fontSize={10} fontWeight={750}>designed fold</text>
      <text x={frontX} y={topY + coverH + 18} textAnchor="start" fill="var(--muted-foreground)" fontSize={10} fontWeight={750}>designed fold</text>

      {/* Actual fold — shifted */}
      <line x1={spineX + 14} y1={topY} x2={spineX + 14} y2={topY + coverH} stroke="var(--danger)" strokeWidth={2} strokeDasharray="4 3" />
      <line x1={frontX + 14} y1={topY} x2={frontX + 14} y2={topY + coverH} stroke="var(--danger)" strokeWidth={2} strokeDasharray="4 3" />

      {/* Shift annotation */}
      <rect x={spineX} y={topY + 120} width={14} height={40} rx={0} fill="color-mix(in srgb,var(--danger) 20%,transparent)" />
      <line x1={spineX + 7} y1={topY + 120} x2={spineX + 7} y2={topY + 120} stroke="var(--danger)" strokeWidth={1} />
      <text x={spineX + 22} y={topY + 140} fill="var(--danger)" fontSize={10} fontWeight={900}>shift</text>
      <text x={spineX + 22} y={topY + 154} fill="var(--danger)" fontSize={10} fontWeight={900}>+14 px</text>

      {/* Result labels */}
      <rect x={62} y={topY + coverH + 34} width={140} height={32} rx={8} fill="color-mix(in srgb,var(--success) 10%,var(--card))" stroke="var(--success)" strokeWidth={1.5} />
      <text x={132} y={topY + coverH + 50} textAnchor="middle" fill="var(--success)" fontSize={11} fontWeight={850}>back border even</text>
      <rect x={530} y={topY + coverH + 34} width={150} height={32} rx={8} fill="color-mix(in srgb,var(--danger) 10%,var(--card))" stroke="var(--danger)" strokeWidth={1.5} />
      <text x={605} y={topY + coverH + 50} textAnchor="middle" fill="var(--danger)" fontSize={11} fontWeight={850}>front border shifted</text>

      <rect x={160} y={topY + coverH + 76} width={480} height={22} rx={8} fill="color-mix(in srgb,var(--primary) 8%,var(--card))" stroke="color-mix(in srgb,var(--primary) 28%,var(--border))" strokeWidth={1.5} />
      <text x={400} y={topY + coverH + 91} textAnchor="middle" fill="var(--foreground)" fontSize={12} fontWeight={850}>Avoid continuous borders across the spine fold</text>
    </g>
  );
}


export function ProofCopyBorderBeforeAfter() {
  // Before: thin border on dark cover (imbalanced gaps)
  // After:  thicker border moved inward (balanced)
  return (
    <g>
      <text x={400} y={44} textAnchor="middle" fill="var(--foreground)" fontSize={20} fontWeight={950}>Proof copy result — before and after fix</text>

      {/* ── BEFORE ── */}
      <text x={195} y={78} textAnchor="middle" fill="var(--danger)" fontSize={14} fontWeight={850}>before — thin, near edge</text>
      {/* dark book */}
      <rect x={70} y={90} width={250} height={240} rx={8} fill="#1a1a1a" stroke="var(--border)" strokeWidth={2} />
      {/* thin white border — shifted (print result) */}
      <rect x={70 + 8} y={90 + 22} width={250 - 8 - 22} height={240 - 30} rx={2} fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth={1} />
      {/* uneven gap callouts */}
      {/* left */}
      <rect x={44} y={201} width={38} height={20} rx={6} fill="var(--card)" stroke="var(--danger)" strokeWidth={1.5} />
      <text x={63} y={215} textAnchor="middle" fill="var(--danger)" fontSize={11} fontWeight={900}>8 px</text>
      <line x1={82} y1={211} x2={78} y2={211} stroke="var(--danger)" strokeWidth={1.5} />
      {/* right */}
      <rect x={319} y={201} width={40} height={20} rx={6} fill="var(--card)" stroke="var(--success)" strokeWidth={1.5} />
      <text x={339} y={215} textAnchor="middle" fill="var(--success)" fontSize={11} fontWeight={900}>22 px</text>
      <line x1={320} y1={211} x2={319} y2={211} stroke="var(--success)" strokeWidth={1.5} />

      <text x={70} y={356} fill="var(--danger)" fontSize={11} fontWeight={800}>① border: 1 pt stroke</text>
      <text x={70} y={370} fill="var(--danger)" fontSize={11} fontWeight={800}>② inset: ~0.08 in</text>
      <text x={70} y={384} fill="var(--danger)" fontSize={11} fontWeight={800}>③ result: uneven gaps</text>

      {/* arrow */}
      <text x={400} y={205} textAnchor="middle" fill="var(--success)" fontSize={13} fontWeight={900}>fix</text>
      <path d="M362 210 h76" stroke="var(--success)" strokeWidth={3} strokeLinecap="round" />
      <path d="M428 201 l10 9 -10 9" fill="none" stroke="var(--success)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />

      {/* ── AFTER ── */}
      <text x={605} y={78} textAnchor="middle" fill="var(--success)" fontSize={14} fontWeight={850}>after — thick, moved inward</text>
      {/* dark book */}
      <rect x={480} y={90} width={250} height={240} rx={8} fill="#1a1a1a" stroke="var(--border)" strokeWidth={2} />
      {/* thicker white border — centered (better result) */}
      <rect x={480 + 38} y={90 + 38} width={250 - 76} height={240 - 76} rx={3} fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth={5} />
      {/* even gap callouts */}
      {/* left */}
      <rect x={454} y={201} width={38} height={20} rx={6} fill="var(--card)" stroke="var(--success)" strokeWidth={1.5} />
      <text x={473} y={215} textAnchor="middle" fill="var(--success)" fontSize={11} fontWeight={900}>38 px</text>
      <line x1={492} y1={211} x2={494} y2={211} stroke="var(--success)" strokeWidth={1.5} />
      {/* right */}
      <rect x={729} y={201} width={40} height={20} rx={6} fill="var(--card)" stroke="var(--success)" strokeWidth={1.5} />
      <text x={749} y={215} textAnchor="middle" fill="var(--success)" fontSize={11} fontWeight={900}>38 px</text>
      <line x1={725} y1={211} x2={729} y2={211} stroke="var(--success)" strokeWidth={1.5} />

      <text x={480} y={356} fill="var(--success)" fontSize={11} fontWeight={800}>① border: 5 pt stroke</text>
      <text x={480} y={370} fill="var(--success)" fontSize={11} fontWeight={800}>② inset: 0.4 in</text>
      <text x={480} y={384} fill="var(--success)" fontSize={11} fontWeight={800}>③ result: balanced gaps</text>
    </g>
  );
}


export function HighRiskBorderLayoutTypes() {
  // 4-panel grid showing risky patterns with danger annotations
  const panels: { label: string; sub: string }[] = [
    { label: 'Hairline full frame', sub: '1 pt stroke near trim' },
    { label: 'Mirrored corners', sub: 'doubles comparison points' },
    { label: 'Black bg + thin light border', sub: 'max contrast at edge' },
    { label: 'Centered minimalist grid', sub: 'every gap becomes a ruler' },
  ];

  return (
    <g>
      <text x={400} y={38} textAnchor="middle" fill="var(--foreground)" fontSize={19} fontWeight={950}>Layout patterns most likely to print unevenly</text>

      {panels.map((p, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const px = 60 + col * 340;
        const py = 52 + row * 190;
        const pw = 300;
        const ph = 145;
        const isDark = i === 2;

        return (
          <g key={p.label}>
            <rect x={px} y={py} width={pw} height={ph} rx={10}
              fill={isDark ? '#111' : 'color-mix(in srgb,var(--foreground) 86%,transparent)'}
              stroke="var(--danger)" strokeWidth={2}
            />

            {/* pattern preview */}
            {i === 0 && (
              // hairline full frame
              <rect x={px + 8} y={py + 8} width={pw - 16} height={ph - 16} rx={2}
                fill="none" stroke={isDark ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.5)'} strokeWidth={1} />
            )}
            {i === 1 && (
              // mirrored corner ornaments
              <g>
                <path d={`M${px + 14} ${py + 14} l20 0 0 20`} fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth={2} strokeLinecap="round" />
                <path d={`M${px + pw - 14} ${py + 14} l-20 0 0 20`} fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth={2} strokeLinecap="round" />
                <path d={`M${px + 14} ${py + ph - 14} l20 0 0-20`} fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth={2} strokeLinecap="round" />
                <path d={`M${px + pw - 14} ${py + ph - 14} l-20 0 0-20`} fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth={2} strokeLinecap="round" />
              </g>
            )}
            {i === 2 && (
              // dark bg + thin light border
              <>
                <rect x={px + 10} y={py + 10} width={pw - 20} height={ph - 20} rx={2}
                  fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth={1.5} />
                <text x={px + pw / 2} y={py + ph / 2 + 5} textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize={11} fontWeight={700}>dark background</text>
              </>
            )}
            {i === 3 && (
              // minimalist grid
              <g>
                <line x1={px + pw / 2} y1={py + 10} x2={px + pw / 2} y2={py + ph - 10} stroke="rgba(255,255,255,0.35)" strokeWidth={1} />
                <line x1={px + 10} y1={py + ph / 2} x2={px + pw - 10} y2={py + ph / 2} stroke="rgba(255,255,255,0.35)" strokeWidth={1} />
                <rect x={px + 10} y={py + 10} width={pw - 20} height={ph - 20} rx={2} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth={1} />
              </g>
            )}

            {/* danger badge */}
            <circle cx={px + pw - 18} cy={py + 18} r={13}
              fill="color-mix(in srgb,var(--danger) 18%,var(--card))" stroke="var(--danger)" strokeWidth={2} />
            <text x={px + pw - 18} y={py + 23} textAnchor="middle" fill="var(--danger)" fontSize={14} fontWeight={950}>!</text>

            {/* label */}
            <rect x={px} y={py + ph + 4} width={pw} height={16} rx={4} fill="transparent" />
            <text x={px + pw / 2} y={py + ph + 16} textAnchor="middle" fill="var(--foreground)" fontSize={12} fontWeight={850}>{p.label}</text>
            <text x={px + pw / 2} y={py + ph + 30} textAnchor="middle" fill="var(--muted-foreground)" fontSize={10} fontWeight={700}>{p.sub}</text>
          </g>
        );
      })}

      <rect x={140} y={428} width={520} height={22} rx={8} fill="color-mix(in srgb,var(--danger) 9%,var(--card))" stroke="var(--danger)" strokeWidth={1.5} />
      <text x={400} y={443} textAnchor="middle" fill="var(--danger)" fontSize={12} fontWeight={850}>All four patterns ask the cutter for perfection it cannot guarantee</text>
    </g>
  );
}


export function SaferBorderAlternativesComparison() {
  type Alt = { label: string; sub: string; draw: (px: number, py: number, pw: number, ph: number) => React.ReactNode };

  const alts: Alt[] = [
    {
      label: 'Faded edge gradient',
      sub: 'no hard line — trim-proof',
      draw: (px, py, pw, ph) => (
        <>
          <defs>
            <radialGradient id="grad-vignette" cx="50%" cy="50%" r="70%">
              <stop offset="40%" stopColor="transparent" />
              <stop offset="100%" stopColor="rgba(0,0,0,0.55)" />
            </radialGradient>
          </defs>
          <rect x={px} y={py} width={pw} height={ph} fill="url(#grad-vignette)" rx={6} />
        </>
      ),
    },
    {
      label: 'Thick interior panel',
      sub: '0.4 in inset — absorbs shift',
      draw: (px, py, pw, ph) => (
        <rect x={px + 22} y={py + 22} width={pw - 44} height={ph - 44} rx={3}
          fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth={7} />
      ),
    },
    {
      label: 'Partial frame (3 sides)',
      sub: 'breaks symmetry expectation',
      draw: (px, py, pw, ph) => (
        <path d={`M${px + 20} ${py + ph - 20} L${px + 20} ${py + 20} L${px + pw - 20} ${py + 20} L${px + pw - 20} ${py + ph - 20}`}
          fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth={3} strokeLinecap="round" />
      ),
    },
    {
      label: 'Shadow frame',
      sub: 'depth without a hard line',
      draw: (px, py, pw, ph) => (
        <>
          <defs>
            <filter id="shadow-frame-f">
              <feDropShadow dx="0" dy="0" stdDeviation="10" floodColor="rgba(0,0,0,0.7)" />
            </filter>
          </defs>
          <rect x={px + 28} y={py + 28} width={pw - 56} height={ph - 56}
            fill="color-mix(in srgb,var(--primary) 30%,transparent)"
            filter="url(#shadow-frame-f)" rx={6} />
        </>
      ),
    },
  ];

  return (
    <g>
      <text x={400} y={38} textAnchor="middle" fill="var(--foreground)" fontSize={19} fontWeight={950}>Safer border alternatives for KDP covers</text>

      {alts.map((alt, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const px = 58 + col * 342;
        const py = 52 + row * 190;
        const pw = 300;
        const ph = 140;

        return (
          <g key={alt.label}>
            {/* book panel */}
            <rect x={px} y={py} width={pw} height={ph} rx={8}
              fill="color-mix(in srgb,var(--foreground) 82%,transparent)" />
            {alt.draw(px, py, pw, ph)}

            {/* success badge */}
            <circle cx={px + pw - 18} cy={py + 18} r={13}
              fill="color-mix(in srgb,var(--success) 16%,var(--card))" stroke="var(--success)" strokeWidth={2} />
            <path d={`M${px + pw - 23} ${py + 18} l4 4 8-8`} fill="none" stroke="var(--success)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

            {/* label */}
            <text x={px + pw / 2} y={py + ph + 18} textAnchor="middle" fill="var(--foreground)" fontSize={12} fontWeight={850}>{alt.label}</text>
            <text x={px + pw / 2} y={py + ph + 32} textAnchor="middle" fill="var(--muted-foreground)" fontSize={10} fontWeight={700}>{alt.sub}</text>
          </g>
        );
      })}

      <rect x={130} y={424} width={540} height={22} rx={8} fill="color-mix(in srgb,var(--success) 9%,var(--card))" stroke="var(--success)" strokeWidth={1.5} />
      <text x={400} y={439} textAnchor="middle" fill="var(--success)" fontSize={12} fontWeight={850}>All four approaches communicate visual framing without a fragile edge line</text>
    </g>
  );
}

