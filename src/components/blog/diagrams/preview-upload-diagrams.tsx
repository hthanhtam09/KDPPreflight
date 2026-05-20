import type React from 'react';
import { Label } from './shared';

export function KdpUploadProcessingPipeline() {
  return (
    <g>
      <text x={400} y={52} textAnchor="middle" fill="var(--foreground)" fontSize={20} fontWeight={950}>Where heavy PDFs stall during KDP processing</text>

      {/* Heavy PDF document */}
      <rect x={52} y={110} width={112} height={148} rx={14} fill="var(--card)" stroke="var(--border)" strokeWidth={2.5} />
      <path d="M140 110l24 24h-24Z" fill="color-mix(in srgb, var(--muted) 55%, transparent)" stroke="var(--border)" strokeWidth={2} />
      <rect x={68} y={150} width={72} height={7} rx={3.5} fill="var(--foreground)" opacity=".14" />
      <rect x={68} y={163} width={58} height={7} rx={3.5} fill="var(--foreground)" opacity=".11" />
      <rect x={68} y={176} width={65} height={7} rx={3.5} fill="var(--foreground)" opacity=".11" />
      <rect x={68} y={192} width={48} height={20} rx={5} fill="color-mix(in srgb, var(--danger) 14%, transparent)" stroke="var(--danger)" strokeWidth={2} />
      <text x={92} y={206} textAnchor="middle" fill="var(--danger)" fontSize={11} fontWeight={900}>PDF</text>
      <text x={108} y={285} textAnchor="middle" fill="var(--danger)" fontSize={16} fontWeight={900}>320 MB</text>

      {/* Arrow to processing */}
      <path d="M168 184h44" stroke="var(--border)" strokeWidth={3} strokeDasharray="6 4" />
      <path d="M198 168l14 16-14 16" fill="none" stroke="var(--primary)" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" />

      {/* Processing stages */}
      <rect x={222} y={100} width={276} height={226} rx={18} fill="var(--card)" stroke="var(--border)" strokeWidth={2.5} />
      <text x={360} y={126} textAnchor="middle" fill="var(--foreground)" fontSize={14} fontWeight={850}>KDP processes your file</text>
      {([
        { label: 'Receive file', ok: true, note: '' },
        { label: 'Scan structure', ok: true, note: '' },
        { label: 'Rasterize pages', ok: false, note: 'image-heavy files stall here' },
        { label: 'Render proof', ok: false, note: 'or freeze at this stage' },
      ] as { label: string; ok: boolean; note: string }[]).map((stage, i) => (
        <g key={stage.label} transform={`translate(242 ${142 + i * 44})`}>
          <circle cx={11} cy={13} r={11} fill={stage.ok ? 'color-mix(in srgb, var(--success) 15%, transparent)' : 'color-mix(in srgb, var(--danger) 12%, transparent)'} stroke={stage.ok ? 'var(--success)' : 'var(--danger)'} strokeWidth={2.5} />
          {stage.ok
            ? <path d="M6 12l4 4 7-8" fill="none" stroke="var(--success)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
            : <text x={11} y={13} textAnchor="middle" dominantBaseline="central" fill="var(--danger)" fontSize={13} fontWeight={950}>!</text>
          }
          <text x={30} y={18} fill="var(--foreground)" fontSize={13} fontWeight={stage.ok ? 700 : 850}>{stage.label}</text>
          {stage.note ? <text x={30} y={32} fill="var(--danger)" fontSize={10} fontWeight={750}>↳ {stage.note}</text> : null}
        </g>
      ))}

      {/* Stuck spinner */}
      <rect x={530} y={118} width={200} height={174} rx={18} fill="color-mix(in srgb, var(--danger) 7%, transparent)" stroke="var(--danger)" strokeDasharray="8 5" strokeWidth={2.5} />
      <text x={630} y={148} textAnchor="middle" fill="var(--danger)" fontSize={14} fontWeight={900}>upload stuck</text>
      <circle cx={630} cy={207} r={34} fill="none" stroke="var(--muted)" strokeWidth={6} opacity=".4" />
      <path d="M630 173 a34 34 0 1 1 -34 34" fill="none" stroke="var(--danger)" strokeWidth={6} strokeLinecap="round" opacity=".65" />
      <text x={630} y={264} textAnchor="middle" fill="var(--muted-foreground)" fontSize={11} fontWeight={750}>processing forever</text>
      <path d="M502 207h24" stroke="var(--danger)" strokeWidth={3} strokeDasharray="5 4" />

      <rect x={138} y={338} width={524} height={42} rx={14} fill="color-mix(in srgb, var(--primary) 8%, var(--card))" stroke="color-mix(in srgb, var(--primary) 35%, var(--border))" strokeWidth={2} />
      <text x={400} y={364} textAnchor="middle" fill="var(--foreground)" fontSize={13} fontWeight={850}>Reduce file weight so every processing stage can complete</text>
    </g>
  );
}


export function FileSizeByBookType() {
  const bx = 222;
  const bw = 466;
  const rows = [
    { label: 'Text book',     sw: Math.round(bw * 0.28), cw: Math.round(bw * 0.24), note: '< 50 MB ideal · > 100 MB inspect · > 200 MB risky' },
    { label: 'Journal',       sw: Math.round(bw * 0.36), cw: Math.round(bw * 0.22), note: '< 60 MB ideal · > 120 MB inspect · > 250 MB risky' },
    { label: 'Coloring book', sw: Math.round(bw * 0.42), cw: Math.round(bw * 0.26), note: '< 150 MB ideal · > 200 MB inspect · > 300 MB risky' },
    { label: 'Photo book',    sw: Math.round(bw * 0.52), cw: Math.round(bw * 0.22), note: '< 200 MB ideal · > 300 MB inspect · > 500 MB risky' },
  ];
  return (
    <g>
      <text x={400} y={50} textAnchor="middle" fill="var(--foreground)" fontSize={20} fontWeight={950}>File size guide by book type</text>
      {rows.map((row, i) => {
        const y = 78 + i * 82;
        const dw = bw - row.sw - row.cw;
        return (
          <g key={row.label}>
            <text x={214} y={y + 16} textAnchor="end" fill="var(--foreground)" fontSize={13} fontWeight={800}>{row.label}</text>
            <rect x={bx} y={y} width={row.sw} height={22} rx={0} fill="color-mix(in srgb, var(--success) 44%, transparent)" />
            <rect x={bx + row.sw} y={y} width={row.cw} height={22} fill="color-mix(in srgb, var(--warning) 50%, transparent)" />
            <rect x={bx + row.sw + row.cw} y={y} width={dw} height={22} fill="color-mix(in srgb, var(--danger) 40%, transparent)" />
            <rect x={bx} y={y} width={bw} height={22} rx={4} fill="none" stroke="var(--border)" strokeWidth={1.5} />
            <text x={bx + 6} y={y + 40} fill="var(--muted-foreground)" fontSize={11} fontWeight={700}>{row.note}</text>
          </g>
        );
      })}
      <g transform="translate(222 420)">
        <rect x={0} y={0} width={14} height={14} rx={3} fill="color-mix(in srgb, var(--success) 44%, transparent)" />
        <text x={20} y={11} fill="var(--muted-foreground)" fontSize={12} fontWeight={700}>ideal range</text>
        <rect x={110} y={0} width={14} height={14} rx={3} fill="color-mix(in srgb, var(--warning) 50%, transparent)" />
        <text x={130} y={11} fill="var(--muted-foreground)" fontSize={12} fontWeight={700}>inspect</text>
        <rect x={200} y={0} width={14} height={14} rx={3} fill="color-mix(in srgb, var(--danger) 40%, transparent)" />
        <text x={220} y={11} fill="var(--muted-foreground)" fontSize={12} fontWeight={700}>high upload risk</text>
      </g>
    </g>
  );
}


export function CanvaBloatExplained() {
  const layers = [
    { label: 'Full-page background PNG', weight: '+40 MB', total: false },
    { label: 'Transparent illustration PNG', weight: '+65 MB', total: false },
    { label: 'Shadow + glow overlays', weight: '+18 MB', total: false },
    { label: 'Decorative corner art', weight: '+12 MB', total: false },
    { label: 'Repeated × 100 pages', weight: '= 320 MB', total: true },
  ];
  return (
    <g>
      <text x={400} y={52} textAnchor="middle" fill="var(--foreground)" fontSize={20} fontWeight={950}>What makes a Canva coloring book PDF heavy</text>
      <text x={200} y={94} textAnchor="middle" fill="var(--muted-foreground)" fontSize={13} fontWeight={750}>one page · stacked layers</text>
      {layers.slice(0, 4).map((_, i) => (
        <rect
          key={i}
          x={82 + i * 8}
          y={108 + i * 6}
          width={234}
          height={236 - i * 6}
          rx={10}
          fill={i % 2 === 1 ? 'color-mix(in srgb, var(--danger) 8%, var(--card))' : 'var(--card)'}
          stroke={i % 2 === 1 ? 'var(--danger)' : 'var(--border)'}
          strokeWidth={2}
        />
      ))}
      <text x={220} y={248} textAnchor="middle" fill="var(--muted-foreground)" fontSize={11} fontWeight={700}>layers stacked with transparency</text>

      <rect x={390} y={88} width={328} height={260} rx={16} fill="var(--card)" stroke="var(--border)" strokeWidth={2.5} />
      {layers.map((layer, i) => (
        <g key={layer.label} transform={`translate(406 ${108 + i * 44})`}>
          <rect x={0} y={0} width={296} height={34} rx={8} fill={layer.total ? 'color-mix(in srgb, var(--danger) 10%, transparent)' : 'color-mix(in srgb, var(--muted) 20%, transparent)'} />
          <text x={10} y={22} fill="var(--foreground)" fontSize={12} fontWeight={layer.total ? 900 : 700}>{layer.label}</text>
          <text x={286} y={22} textAnchor="end" fill={layer.total ? 'var(--danger)' : 'var(--muted-foreground)'} fontSize={13} fontWeight={layer.total ? 900 : 750}>{layer.weight}</text>
        </g>
      ))}

      <rect x={102} y={374} width={596} height={42} rx={14} fill="color-mix(in srgb, var(--primary) 8%, var(--card))" stroke="color-mix(in srgb, var(--primary) 35%, var(--border))" strokeWidth={2} />
      <text x={400} y={400} textAnchor="middle" fill="var(--foreground)" fontSize={13} fontWeight={850}>Flatten layers before export to remove unnecessary processing weight</text>
    </g>
  );
}


export function TransparencyFlattenWorkflow() {
  return (
    <g>
      <text x={400} y={52} textAnchor="middle" fill="var(--foreground)" fontSize={20} fontWeight={950}>Flatten transparency before uploading to KDP</text>

      {/* Left — complex layers */}
      <text x={200} y={92} textAnchor="middle" fill="var(--danger)" fontSize={14} fontWeight={850}>before flattening</text>
      <rect x={82} y={106} width={234} height={196} rx={16} fill="var(--card)" stroke="var(--danger)" strokeWidth={2.5} />
      <rect x={96} y={120} width={206} height={168} rx={10} fill="color-mix(in srgb, var(--primary) 18%, transparent)" opacity=".7" />
      <rect x={110} y={133} width={178} height={142} rx={8} fill="color-mix(in srgb, var(--warning) 22%, transparent)" opacity=".65" />
      <rect x={124} y={146} width={150} height={116} rx={6} fill="color-mix(in srgb, var(--danger) 14%, transparent)" opacity=".6" />
      <rect x={138} y={159} width={122} height={90} rx={5} fill="color-mix(in srgb, var(--primary) 25%, transparent)" opacity=".55" />
      <text x={199} y={180} textAnchor="middle" fill="var(--danger)" fontSize={11} fontWeight={750}>shadow layer</text>
      <text x={199} y={200} textAnchor="middle" fill="var(--warning)" fontSize={11} fontWeight={750}>overlay</text>
      <text x={199} y={220} textAnchor="middle" fill="var(--primary)" fontSize={11} fontWeight={750}>PNG mask</text>
      <text x={199} y={324} textAnchor="middle" fill="var(--danger)" fontSize={12} fontWeight={800}>KDP must resolve all layers</text>
      <text x={199} y={342} textAnchor="middle" fill="var(--danger)" fontSize={12} fontWeight={800}>→ upload slows or stalls</text>

      {/* Arrow — long, text above */}
      <text x={400} y={190} textAnchor="middle" fill="var(--success)" fontSize={14} fontWeight={900}>flatten</text>
      <path d="M326 204h136" stroke="var(--success)" strokeWidth={4} strokeLinecap="round" />
      <path d="M458 193 l24 11 -24 11Z" fill="var(--success)" />

      {/* Right — flattened */}
      <text x={600} y={92} textAnchor="middle" fill="var(--success)" fontSize={14} fontWeight={850}>after flattening</text>
      <rect x={484} y={106} width={234} height={196} rx={16} fill="var(--card)" stroke="var(--success)" strokeWidth={2.5} />
      <rect x={498} y={120} width={206} height={168} rx={10} fill="color-mix(in srgb, var(--primary) 20%, transparent)" />
      <path d="M540 192 c20-30 42-18 60 0 c20 20 42 16 62-6" stroke="var(--primary)" strokeWidth={4} strokeLinecap="round" fill="none" />
      <path d="M520 224h108" stroke="var(--foreground)" strokeWidth={3} opacity=".18" />
      <path d="M532 242h84" stroke="var(--foreground)" strokeWidth={3} opacity=".13" />
      <text x={600} y={324} textAnchor="middle" fill="var(--success)" fontSize={12} fontWeight={800}>single merged layer</text>
      <text x={600} y={342} textAnchor="middle" fill="var(--success)" fontSize={12} fontWeight={800}>lighter · faster upload</text>

      <rect x={150} y={374} width={500} height={42} rx={14} fill="color-mix(in srgb, var(--primary) 8%, var(--card))" stroke="color-mix(in srgb, var(--primary) 35%, var(--border))" strokeWidth={2} />
      <text x={400} y={400} textAnchor="middle" fill="var(--foreground)" fontSize={13} fontWeight={850}>Keep an editable master · flatten only the upload copy</text>
    </g>
  );
}


export function SplitTestMethod() {
  return (
    <g>
      <text x={400} y={50} textAnchor="middle" fill="var(--foreground)" fontSize={20} fontWeight={950}>Split-test the manuscript to find the problem page</text>

      {/* Full book */}
      <rect x={296} y={68} width={208} height={70} rx={12} fill="var(--card)" stroke="var(--border)" strokeWidth={2.5} />
      <text x={400} y={100} textAnchor="middle" fill="var(--foreground)" fontSize={14} fontWeight={850}>Full manuscript</text>
      <text x={400} y={120} textAnchor="middle" fill="var(--danger)" fontSize={12} fontWeight={750}>100 pages · upload stuck</text>

      {/* L1 → L2 connectors */}
      <path d="M400 138v14" stroke="var(--primary)" strokeWidth={2.5} />
      <path d="M190 152h420" stroke="var(--primary)" strokeWidth={2.5} />
      <path d="M190 152v18" stroke="var(--primary)" strokeWidth={2.5} />
      <path d="M610 152v18" stroke="var(--primary)" strokeWidth={2.5} />

      {/* L2 Left — passes */}
      <rect x={100} y={170} width={180} height={66} rx={10} fill="var(--card)" stroke="var(--success)" strokeWidth={2.5} />
      <text x={190} y={200} textAnchor="middle" fill="var(--success)" fontSize={13} fontWeight={850}>Pages 1–50</text>
      <text x={190} y={222} textAnchor="middle" fill="var(--success)" fontSize={11.5} fontWeight={700}>passes ✓</text>

      {/* L2 Right — fails */}
      <rect x={520} y={170} width={180} height={66} rx={10} fill="var(--card)" stroke="var(--danger)" strokeWidth={2.5} />
      <text x={610} y={200} textAnchor="middle" fill="var(--danger)" fontSize={13} fontWeight={850}>Pages 51–100</text>
      <text x={610} y={222} textAnchor="middle" fill="var(--danger)" fontSize={11.5} fontWeight={700}>fails ✗ · narrow here</text>

      {/* L2 Right → L3 connectors */}
      <path d="M610 236v12" stroke="var(--primary)" strokeWidth={2.5} />
      <path d="M470 248h200" stroke="var(--primary)" strokeWidth={2.5} />
      <path d="M470 248v18" stroke="var(--primary)" strokeWidth={2.5} />
      <path d="M670 248v18" stroke="var(--primary)" strokeWidth={2.5} />

      {/* L3 Left — passes */}
      <rect x={378} y={266} width={184} height={62} rx={10} fill="var(--card)" stroke="var(--success)" strokeWidth={2.5} />
      <text x={470} y={295} textAnchor="middle" fill="var(--success)" fontSize={12} fontWeight={850}>Pages 51–75</text>
      <text x={470} y={315} textAnchor="middle" fill="var(--success)" fontSize={11} fontWeight={700}>passes ✓</text>

      {/* L3 Right — fails */}
      <rect x={576} y={266} width={188} height={62} rx={10} fill="var(--card)" stroke="var(--danger)" strokeWidth={2.5} />
      <text x={670} y={295} textAnchor="middle" fill="var(--danger)" fontSize={12} fontWeight={850}>Pages 76–100</text>
      <text x={670} y={315} textAnchor="middle" fill="var(--danger)" fontSize={11} fontWeight={700}>fails ✗ · bad asset here</text>

      {/* Found */}
      <path d="M670 328v16" stroke="var(--danger)" strokeWidth={2.5} />
      <rect x={576} y={344} width={188} height={50} rx={10} fill="color-mix(in srgb, var(--danger) 10%, transparent)" stroke="var(--danger)" strokeWidth={2.5} />
      <text x={670} y={368} textAnchor="middle" fill="var(--danger)" fontSize={13} fontWeight={900}>bad asset found</text>
      <text x={670} y={386} textAnchor="middle" fill="var(--muted-foreground)" fontSize={11} fontWeight={700}>repair · re-export</text>

      {/* Bottom note */}
      <rect x={72} y={408} width={656} height={34} rx={10} fill="color-mix(in srgb, var(--primary) 8%, var(--card))" stroke="color-mix(in srgb, var(--primary) 35%, var(--border))" strokeWidth={2} />
      <text x={400} y={430} textAnchor="middle" fill="var(--foreground)" fontSize={12} fontWeight={850}>Each split halves the search space — find the bad page faster than re-exporting the whole book</text>
    </g>
  );
}


export function KdpPreviewPipeline() {
  const steps = [
    { x: 58, label: 'Upload', sub: 'PDF files' },
    { x: 202, label: 'Analyze', sub: 'trim + bleed' },
    { x: 346, label: 'Rasterize', sub: 'pages + cover' },
    { x: 490, label: 'Render', sub: 'browser preview' },
    { x: 634, label: 'Approve', sub: 'final check' },
  ];

  return (
    <g>
      <Label x={88} y={58}>Inside the KDP Preview pipeline</Label>
      <path d="M145 210h510" stroke="var(--primary)" strokeWidth={4} strokeLinecap="round" markerEnd="url(#arrow-kdp-preview-pipeline)" />
      {steps.map((step, index) => (
        <g key={step.label}>
          <rect x={step.x} y={132} width={116} height={154} rx={18} fill="var(--card)" stroke={index === 2 ? 'var(--warning)' : 'var(--border)'} strokeWidth={3} />
          <circle cx={step.x + 58} cy={178} r={24} fill={index === 2 ? 'color-mix(in srgb, var(--warning) 18%, transparent)' : 'color-mix(in srgb, var(--primary) 12%, transparent)'} stroke={index === 2 ? 'var(--warning)' : 'var(--primary)'} strokeWidth={3} />
          <text x={step.x + 58} y={186} textAnchor="middle" fill={index === 2 ? 'var(--warning)' : 'var(--primary)'} fontSize={20} fontWeight={950}>{index + 1}</text>
          <text x={step.x + 58} y={232} textAnchor="middle" fill="var(--foreground)" fontSize={17} fontWeight={900}>{step.label}</text>
          <text x={step.x + 58} y={258} textAnchor="middle" fill="var(--muted-foreground)" fontSize={12} fontWeight={700}>{step.sub}</text>
        </g>
      ))}
      <rect x={146} y={330} width={508} height={46} rx={15} fill="color-mix(in srgb, var(--warning) 10%, var(--card))" stroke="var(--warning)" strokeWidth={2} />
      <text x={400} y={359} textAnchor="middle" fill="var(--foreground)" fontSize={15} fontWeight={850}>Image-heavy PDFs stress the rasterize + render stages first</text>
    </g>
  );
}


export function KdpPdfSizeOptimization() {
  return (
    <g>
      <Label x={102} y={58}>Before vs optimized PDF size</Label>
      <rect x={86} y={106} width={258} height={246} rx={22} fill="var(--card)" stroke="var(--danger)" strokeWidth={3} />
      <rect x={118} y={138} width={194} height={120} rx={12} fill="color-mix(in srgb, var(--danger) 10%, transparent)" />
      {[0, 1, 2, 3].map((row) =>
        [0, 1, 2, 3].map((col) => (
          <rect key={`bad-${row}-${col}`} x={130 + col * 43} y={150 + row * 24} width={32} height={18} rx={3} fill="color-mix(in srgb, var(--warning) 28%, transparent)" />
        ))
      )}
      <text x={215} y={294} textAnchor="middle" fill="var(--danger)" fontSize={28} fontWeight={950}>250 MB</text>
      <text x={215} y={324} textAnchor="middle" fill="var(--muted-foreground)" fontSize={14} fontWeight={700}>oversized PNG-heavy export</text>

      <path d="M370 226h62" stroke="var(--primary)" strokeWidth={4} strokeLinecap="round" markerEnd="url(#arrow-kdp-pdf-size-optimization)" />

      <rect x={456} y={106} width={258} height={246} rx={22} fill="var(--card)" stroke="var(--success)" strokeWidth={3} />
      <rect x={488} y={138} width={194} height={120} rx={12} fill="color-mix(in srgb, var(--success) 10%, transparent)" />
      <path d="M510 198h150M510 224h112M510 172h132" stroke="var(--success)" strokeWidth={7} strokeLinecap="round" />
      <text x={585} y={294} textAnchor="middle" fill="var(--success)" fontSize={28} fontWeight={950}>82 MB</text>
      <text x={585} y={324} textAnchor="middle" fill="var(--muted-foreground)" fontSize={14} fontWeight={700}>flattened print-ready PDF</text>

      <text x={400} y={404} textAnchor="middle" fill="var(--foreground)" fontSize={15} fontWeight={850}>Keep print quality, remove unnecessary processing weight</text>
    </g>
  );
}


export function KdpPreviewTroubleshootingFlow() {
  const items = [
    { x: 66, label: 'Browser', sub: 'Clean browser', detail: 'incognito test' },
    { x: 201, label: 'PDF', sub: 'Clean export', detail: 'flatten PDF', accent: true },
    { x: 336, label: 'Pages', sub: 'Test pages', detail: 'find bad page' },
    { x: 471, label: 'Layout', sub: 'Check setup', detail: 'trim / bleed' },
    { x: 606, label: 'Retry', sub: 'Upload fix', detail: 'preview again' },
  ];

  return (
    <g>
      <text x={400} y={58} textAnchor="middle" fill="var(--foreground)" fontSize={24} fontWeight={950}>Previewer troubleshooting flow</text>
      <text x={400} y={88} textAnchor="middle" fill="var(--muted-foreground)" fontSize={14} fontWeight={700}>Move left to right: rule out the easy causes before rebuilding the file.</text>

      <rect x={48} y={128} width={704} height={224} rx={30} fill="color-mix(in srgb, var(--card) 90%, transparent)" stroke="var(--border)" strokeWidth={2} />
      <path d="M132 172h536" stroke="color-mix(in srgb, var(--primary) 18%, transparent)" strokeWidth={10} strokeLinecap="round" />
      <path d="M132 172h202" stroke="color-mix(in srgb, var(--warning) 62%, transparent)" strokeWidth={10} strokeLinecap="round" />

      {items.map((item, index) => (
        <g key={item.label}>
          <rect
            x={item.x}
            y={152}
            width={128}
            height={148}
            rx={20}
            fill="var(--card)"
            stroke={item.accent ? 'var(--warning)' : 'var(--border)'}
            strokeWidth={item.accent ? 3 : 2}
          />
          <circle
            cx={item.x + 64}
            cy={172}
            r={24}
            fill={item.accent ? 'color-mix(in srgb, var(--warning) 16%, var(--card))' : 'var(--card)'}
            stroke={item.accent ? 'var(--warning)' : 'var(--primary)'}
            strokeWidth={3}
          />
          <text x={item.x + 64} y={172} textAnchor="middle" dominantBaseline="central" fill={item.accent ? 'var(--warning)' : 'var(--primary)'} fontSize={16} fontWeight={950}>{index + 1}</text>
          <text x={item.x + 64} y={222} textAnchor="middle" fill="var(--foreground)" fontSize={17} fontWeight={950}>{item.label}</text>
          <text x={item.x + 64} y={250} textAnchor="middle" fill="var(--muted-foreground)" fontSize={11.5} fontWeight={850}>{item.sub}</text>
          <text x={item.x + 64} y={274} textAnchor="middle" fill="var(--muted-foreground)" fontSize={10.5} fontWeight={700}>{item.detail}</text>
        </g>
      ))}

      <g>
        <rect x={220} y={370} width={360} height={42} rx={15} fill="color-mix(in srgb, var(--warning) 10%, var(--card))" stroke="color-mix(in srgb, var(--warning) 55%, var(--border))" strokeWidth={2} />
        <circle cx={248} cy={391} r={8} fill="var(--warning)" />
        <text x={415} y={396} textAnchor="middle" fill="var(--foreground)" fontSize={12.5} fontWeight={850}>PDF and page tests fix most stuck previews.</text>
      </g>
    </g>
  );
}


