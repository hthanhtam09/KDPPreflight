import type React from 'react';
import { Label, MutedLabel, StatusBadge } from './shared';

export function BlurSharpComparison() {
  return (
    <g>
      <Label x={138} y={56}>blurry: low-resolution source</Label>
      <Label x={488} y={56}>sharp: 300 DPI print-ready</Label>

      {/* Left panel — blurry */}
      <rect x={112} y={78} width={238} height={300} rx={18} fill="var(--card)" stroke="var(--danger)" strokeWidth={3} />
      <rect x={132} y={106} width={198} height={148} rx={6} fill="color-mix(in srgb, var(--primary) 8%, transparent)" />
      {/* Coarse pixel blocks simulating pixelation */}
      <rect x={132} y={106} width={33} height={29} fill="color-mix(in srgb, var(--primary) 34%, transparent)" />
      <rect x={165} y={106} width={27} height={29} fill="color-mix(in srgb, var(--primary) 14%, transparent)" />
      <rect x={192} y={106} width={35} height={29} fill="color-mix(in srgb, var(--primary) 40%, transparent)" />
      <rect x={227} y={106} width={29} height={29} fill="color-mix(in srgb, var(--primary) 18%, transparent)" />
      <rect x={256} y={106} width={33} height={29} fill="color-mix(in srgb, var(--primary) 28%, transparent)" />
      <rect x={289} y={106} width={27} height={29} fill="color-mix(in srgb, var(--primary) 12%, transparent)" />
      <rect x={316} y={106} width={14} height={29} fill="color-mix(in srgb, var(--primary) 30%, transparent)" />
      <rect x={132} y={135} width={29} height={31} fill="color-mix(in srgb, var(--primary) 20%, transparent)" />
      <rect x={161} y={135} width={35} height={31} fill="color-mix(in srgb, var(--primary) 36%, transparent)" />
      <rect x={196} y={135} width={27} height={31} fill="color-mix(in srgb, var(--primary) 16%, transparent)" />
      <rect x={223} y={135} width={33} height={31} fill="color-mix(in srgb, var(--primary) 32%, transparent)" />
      <rect x={256} y={135} width={29} height={31} fill="color-mix(in srgb, var(--primary) 12%, transparent)" />
      <rect x={285} y={135} width={33} height={31} fill="color-mix(in srgb, var(--primary) 24%, transparent)" />
      <rect x={318} y={135} width={12} height={31} fill="color-mix(in srgb, var(--primary) 28%, transparent)" />
      <rect x={132} y={166} width={35} height={29} fill="color-mix(in srgb, var(--primary) 26%, transparent)" />
      <rect x={167} y={166} width={27} height={29} fill="color-mix(in srgb, var(--primary) 16%, transparent)" />
      <rect x={194} y={166} width={33} height={29} fill="color-mix(in srgb, var(--primary) 38%, transparent)" />
      <rect x={227} y={166} width={29} height={29} fill="color-mix(in srgb, var(--primary) 14%, transparent)" />
      <rect x={256} y={166} width={35} height={29} fill="color-mix(in srgb, var(--primary) 30%, transparent)" />
      <rect x={291} y={166} width={27} height={29} fill="color-mix(in srgb, var(--primary) 22%, transparent)" />
      <rect x={318} y={166} width={12} height={29} fill="color-mix(in srgb, var(--primary) 18%, transparent)" />
      <rect x={132} y={195} width={31} height={29} fill="color-mix(in srgb, var(--primary) 32%, transparent)" />
      <rect x={163} y={195} width={33} height={29} fill="color-mix(in srgb, var(--primary) 14%, transparent)" />
      <rect x={196} y={195} width={27} height={29} fill="color-mix(in srgb, var(--primary) 36%, transparent)" />
      <rect x={223} y={195} width={35} height={29} fill="color-mix(in srgb, var(--primary) 18%, transparent)" />
      <rect x={258} y={195} width={29} height={29} fill="color-mix(in srgb, var(--primary) 28%, transparent)" />
      <rect x={287} y={195} width={33} height={29} fill="color-mix(in srgb, var(--primary) 20%, transparent)" />
      <rect x={320} y={195} width={10} height={29} fill="color-mix(in srgb, var(--primary) 24%, transparent)" />
      <rect x={132} y={224} width={33} height={30} fill="color-mix(in srgb, var(--primary) 16%, transparent)" />
      <rect x={165} y={224} width={27} height={30} fill="color-mix(in srgb, var(--primary) 34%, transparent)" />
      <rect x={192} y={224} width={35} height={30} fill="color-mix(in srgb, var(--primary) 22%, transparent)" />
      <rect x={227} y={224} width={29} height={30} fill="color-mix(in srgb, var(--primary) 38%, transparent)" />
      <rect x={256} y={224} width={33} height={30} fill="color-mix(in srgb, var(--primary) 14%, transparent)" />
      <rect x={289} y={224} width={27} height={30} fill="color-mix(in srgb, var(--primary) 26%, transparent)" />
      <rect x={316} y={224} width={14} height={30} fill="color-mix(in srgb, var(--primary) 30%, transparent)" />
      {/* Blurry text (offset/ghosted rects) */}
      <rect x={138} y={276} width={184} height={13} rx={3} fill="var(--foreground)" opacity=".25" />
      <rect x={140} y={279} width={184} height={13} rx={3} fill="var(--foreground)" opacity=".14" />
      <rect x={136} y={273} width={184} height={13} rx={3} fill="var(--foreground)" opacity=".11" />
      <rect x={152} y={302} width={140} height={10} rx={3} fill="var(--foreground)" opacity=".18" />
      <rect x={154} y={304} width={140} height={10} rx={3} fill="var(--foreground)" opacity=".12" />
      <MutedLabel x={140} y={400}>soft edges, visible pixel blocks</MutedLabel>

      {/* Right panel — sharp */}
      <rect x={450} y={78} width={238} height={300} rx={18} fill="var(--card)" stroke="var(--success)" strokeWidth={3} />
      <rect x={470} y={106} width={198} height={148} rx={6} fill="color-mix(in srgb, var(--primary) 16%, transparent)" />
      <path d="M474 220c50-65 90-35 152 10" stroke="var(--primary)" strokeWidth={4} strokeLinecap="round" />
      <circle cx={546} cy={166} r={28} fill="color-mix(in srgb, var(--primary) 24%, transparent)" stroke="var(--primary)" strokeWidth={2.5} />
      <rect x={478} y={276} width={184} height={13} rx={3} fill="var(--foreground)" opacity=".86" />
      <rect x={490} y={302} width={140} height={10} rx={3} fill="var(--foreground)" opacity=".65" />
      <MutedLabel x={462} y={400}>crisp, print-ready 300 DPI output</MutedLabel>
    </g>
  );
}


export function DPI72vs300() {
  return (
    <g>
      <Label x={150} y={56}>72 DPI — web quality</Label>
      <Label x={490} y={56}>300 DPI — print quality</Label>

      {/* Left: coarse 5×5 pixel grid */}
      <rect x={116} y={80} width={270} height={300} rx={18} fill="var(--card)" stroke="var(--danger)" strokeWidth={3} />
      {/* 5 columns × 6 rows of large blocks */}
      {[0,1,2,3,4,5].map((row) =>
        [0,1,2,3,4].map((col) => (
          <rect
            key={`l-${row}-${col}`}
            x={136 + col * 47}
            y={100 + row * 40}
            width={45}
            height={38}
            fill={`color-mix(in srgb, var(--primary) ${12 + ((row * 3 + col * 7) % 28)}%, transparent)`}
            stroke="var(--card)"
            strokeWidth={2}
          />
        ))
      )}
      <text x={251} y={360} fill="var(--danger)" fontSize="18" fontWeight="900" textAnchor="middle">72 pixels / inch</text>
      <text x={251} y={408} fill="var(--muted-foreground)" fontSize="14" fontWeight="650" textAnchor="middle">large blocks — blurry print</text>

      {/* Right: fine 14×14 pixel grid */}
      <rect x={454} y={80} width={270} height={300} rx={18} fill="var(--card)" stroke="var(--success)" strokeWidth={3} />
      <rect x={474} y={100} width={230} height={238} rx={4} fill="color-mix(in srgb, var(--primary) 12%, transparent)" />
      <path d="M474 100v238M484 100v238M494 100v238M504 100v238M514 100v238M524 100v238M534 100v238M544 100v238M554 100v238M564 100v238M574 100v238M584 100v238M594 100v238M604 100v238M614 100v238M624 100v238M634 100v238M644 100v238M654 100v238M664 100v238M674 100v238M684 100v238M694 100v238M704 100v238" stroke="var(--primary)" strokeWidth={0.6} opacity=".3" />
      <path d="M474 100h230M474 117h230M474 134h230M474 151h230M474 168h230M474 185h230M474 202h230M474 219h230M474 236h230M474 253h230M474 270h230M474 287h230M474 304h230M474 321h230M474 338h230" stroke="var(--primary)" strokeWidth={0.6} opacity=".3" />
      <text x={589} y={360} fill="var(--success)" fontSize="18" fontWeight="900" textAnchor="middle">300 pixels / inch</text>
      <text x={589} y={408} fill="var(--muted-foreground)" fontSize="14" fontWeight="650" textAnchor="middle">fine detail — sharp print</text>
    </g>
  );
}


export function StretchedImage() {
  return (
    <g>
      <Label x={148} y={58}>original small file</Label>
      <Label x={482} y={58}>stretched to cover size — blurry</Label>

      {/* Small source image on left */}
      <rect x={130} y={140} width={118} height={148} rx={14} fill="var(--card)" stroke="var(--border)" strokeWidth={3} />
      <rect x={148} y={162} width={82} height={80} rx={8} fill="color-mix(in srgb, var(--primary) 18%, transparent)" />
      <circle cx={189} cy={202} r={20} fill="color-mix(in srgb, var(--primary) 28%, transparent)" stroke="var(--primary)" strokeWidth={2} />
      <rect x={155} y={256} width={68} height={12} rx={4} fill="var(--foreground)" opacity=".6" />
      <text x={156} y={318} fill="var(--muted-foreground)" fontSize="13" fontWeight="750">72 px × 90 px</text>

      {/* Arrow showing stretch */}
      <path d="M256 226h40" stroke="var(--danger)" strokeWidth={4} strokeDasharray="8 8" strokeLinecap="round" />
      <path d="M292 218l14 8-14 8" fill="none" stroke="var(--danger)" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />

      {/* Large stretched image on right — with coarse pixel blocks */}
      <rect x={310} y={82} width={360} height={280} rx={18} fill="var(--card)" stroke="var(--danger)" strokeWidth={3} />
      <rect x={328} y={100} width={324} height={220} rx={8} fill="color-mix(in srgb, var(--primary) 8%, transparent)" />
      {/* Big pixelation blocks */}
      {[0,1,2,3,4].map((row) =>
        [0,1,2,3,4,5,6].map((col) => (
          <rect
            key={`s-${row}-${col}`}
            x={328 + col * 46}
            y={100 + row * 44}
            width={44}
            height={42}
            fill={`color-mix(in srgb, var(--primary) ${10 + ((row * 5 + col * 9) % 30)}%, transparent)`}
            stroke="var(--card)"
            strokeWidth={1.5}
          />
        ))
      )}
      <circle cx={638} cy={92} r={22} fill="var(--card)" stroke="var(--danger)" strokeWidth={4} />
      <text x={632} y={101} fill="var(--danger)" fontSize="26" fontWeight="950">!</text>
      <MutedLabel x={356} y={400}>pixel data spread thin — visible pixelation</MutedLabel>
    </g>
  );
}


export function VectorRasterText() {
  return (
    <g>
      <Label x={145} y={56}>rasterized text — blurry edges</Label>
      <Label x={486} y={56}>vector text — sharp at any size</Label>

      {/* Left: raster text panel */}
      <rect x={114} y={80} width={270} height={300} rx={18} fill="var(--card)" stroke="var(--danger)" strokeWidth={3} />
      {/* Simulate jagged/blurry text edges with offset semi-transparent rects */}
      <rect x={138} y={148} width={218} height={38} rx={4} fill="var(--foreground)" opacity=".7" />
      <rect x={140} y={151} width={218} height={38} rx={4} fill="var(--foreground)" opacity=".3" />
      <rect x={136} y={145} width={218} height={38} rx={4} fill="var(--foreground)" opacity=".2" />
      <rect x={142} y={154} width={218} height={38} rx={4} fill="var(--foreground)" opacity=".15" />
      <text x={152} y={176} fill="var(--card)" fontSize="26" fontWeight="900">TITLE</text>
      {/* Zoom circle showing jagged edges */}
      <circle cx={248} cy={280} r={58} fill="color-mix(in srgb, var(--danger) 8%, var(--card))" stroke="var(--danger)" strokeWidth={3} />
      {/* Jagged edge simulation inside zoom */}
      <rect x={198} y={260} width={12} height={8} fill="var(--foreground)" opacity=".7" />
      <rect x={210} y={254} width={10} height={6} fill="var(--foreground)" opacity=".5" />
      <rect x={220} y={262} width={14} height={8} fill="var(--foreground)" opacity=".6" />
      <rect x={234} y={256} width={10} height={7} fill="var(--foreground)" opacity=".45" />
      <rect x={244} y={263} width={12} height={8} fill="var(--foreground)" opacity=".65" />
      <rect x={256} y={255} width={10} height={7} fill="var(--foreground)" opacity=".5" />
      <rect x={266} y={261} width={14} height={8} fill="var(--foreground)" opacity=".55" />
      <rect x={280} y={257} width={10} height={7} fill="var(--foreground)" opacity=".4" />
      <rect x={290} y={265} width={8} height={6} fill="var(--foreground)" opacity=".6" />
      <text x={214} y={310} fill="var(--danger)" fontSize="12" fontWeight="750">soft, jagged edges</text>
      <MutedLabel x={140} y={404}>pixels lock detail; soft at print scale</MutedLabel>

      {/* Right: vector text panel */}
      <rect x={416} y={80} width={270} height={300} rx={18} fill="var(--card)" stroke="var(--success)" strokeWidth={3} />
      <rect x={440} y={148} width={222} height={38} rx={4} fill="var(--foreground)" opacity=".88" />
      <text x={452} y={176} fill="var(--card)" fontSize="26" fontWeight="900">TITLE</text>
      {/* Zoom circle showing crisp edge */}
      <circle cx={550} cy={280} r={58} fill="color-mix(in srgb, var(--success) 8%, var(--card))" stroke="var(--success)" strokeWidth={3} />
      <rect x={500} y={256} width={100} height={14} rx={2} fill="var(--foreground)" opacity=".9" />
      <text x={514} y={310} fill="var(--success)" fontSize="12" fontWeight="750">clean, precise edge</text>
      <MutedLabel x={440} y={404}>paths scale to any size without blur</MutedLabel>
    </g>
  );
}


export function CanvaExportQuality() {
  return (
    <g>
      <Label x={226} y={62}>Canva export quality comparison</Label>

      {/* Standard PDF — bad */}
      <rect x={88} y={90} width={270} height={290} rx={22} fill="var(--card)" stroke="var(--danger)" strokeWidth={3} />
      <rect x={88} y={90} width={270} height={52} rx={22} fill="color-mix(in srgb, var(--danger) 12%, transparent)" />
      <text x={138} y={123} fill="var(--danger)" fontSize="17" fontWeight="900">Standard PDF</text>
      {/* File type steps */}
      <rect x={110} y={164} width={226} height={36} rx={10} fill="color-mix(in srgb, var(--muted) 60%, transparent)" stroke="var(--border)" />
      <text x={156} y={187} fill="var(--foreground)" fontSize="14" fontWeight="800">File type: PDF</text>
      <rect x={110} y={210} width={226} height={36} rx={10} fill="color-mix(in srgb, var(--danger) 10%, transparent)" stroke="var(--danger)" />
      <text x={134} y={233} fill="var(--danger)" fontSize="14" fontWeight="800">Quality: Standard</text>
      {/* Compression indicator */}
      <rect x={110} y={260} width={226} height={36} rx={10} fill="color-mix(in srgb, var(--danger) 8%, transparent)" stroke="var(--danger)" strokeDasharray="6 6" />
      <text x={126} y={283} fill="var(--danger)" fontSize="13" fontWeight="800">Images compressed</text>
      <circle cx={338} cy={226} r={22} fill="var(--card)" stroke="var(--danger)" strokeWidth={4} />
      <text x={332} y={235} fill="var(--danger)" fontSize="26" fontWeight="950">!</text>
      <MutedLabel x={112} y={358}>may cause blurry KDP result</MutedLabel>

      {/* PDF Print — good */}
      <rect x={442} y={90} width={270} height={290} rx={22} fill="var(--card)" stroke="var(--success)" strokeWidth={3} />
      <rect x={442} y={90} width={270} height={52} rx={22} fill="color-mix(in srgb, var(--success) 12%, transparent)" />
      <text x={498} y={123} fill="var(--success)" fontSize="17" fontWeight="900">PDF Print</text>
      <rect x={464} y={164} width={226} height={36} rx={10} fill="color-mix(in srgb, var(--muted) 60%, transparent)" stroke="var(--border)" />
      <text x={510} y={187} fill="var(--foreground)" fontSize="14" fontWeight="800">File type: PDF</text>
      <rect x={464} y={210} width={226} height={36} rx={10} fill="color-mix(in srgb, var(--success) 10%, transparent)" stroke="var(--success)" />
      <text x={494} y={233} fill="var(--success)" fontSize="14" fontWeight="800">Quality: Print</text>
      <rect x={464} y={260} width={226} height={36} rx={10} fill="color-mix(in srgb, var(--success) 8%, transparent)" stroke="var(--success)" strokeDasharray="6 6" />
      <text x={472} y={283} fill="var(--success)" fontSize="13" fontWeight="800">Full image quality preserved</text>
      <circle cx={680} cy={226} r={22} fill="var(--card)" stroke="var(--success)" strokeWidth={4} />
      <path d="M670 226l8 9 18-20" fill="none" stroke="var(--success)" strokeWidth="3.5" strokeLinecap="round" />
      <MutedLabel x={466} y={358}>sharp print result every time</MutedLabel>
    </g>
  );
}


export function CompressionDarkCover() {
  return (
    <g>
      <Label x={238} y={56}>JPEG compression on dark covers</Label>

      {/* Dark cover */}
      <rect x={218} y={80} width={364} height={300} rx={22} fill="#171923" stroke="var(--border)" strokeWidth={3} />
      {/* Compression artifact blocks — slightly different shades of dark */}
      {[0,1,2,3,4].map((row) =>
        [0,1,2,3,4,5,6,7].map((col) => (
          <rect
            key={`c-${row}-${col}`}
            x={228 + col * 44}
            y={90 + row * 54}
            width={43}
            height={52}
            fill={`rgba(${30 + ((row * 7 + col * 11) % 20)}, ${28 + ((row * 5 + col * 13) % 18)}, ${42 + ((row * 9 + col * 7) % 22)}, 1)`}
          />
        ))
      )}
      {/* Artifact highlight labels */}
      <circle cx={340} cy={182} r={28} fill="transparent" stroke="var(--danger)" strokeWidth={3} strokeDasharray="7 7" />
      <circle cx={492} cy={262} r={24} fill="transparent" stroke="var(--danger)" strokeWidth={3} strokeDasharray="7 7" />
      <path d="M368 182h60" stroke="var(--danger)" strokeWidth={3} strokeDasharray="6 6" />
      <rect x={424} y={168} width={118} height={30} rx={8} fill="var(--card)" stroke="var(--danger)" strokeWidth={2} />
      <text x={436} y={189} fill="var(--danger)" fontSize="14" fontWeight="850">artifact block</text>
      <path d="M516 262h62" stroke="var(--danger)" strokeWidth={3} strokeDasharray="6 6" />
      <rect x={574} y={249} width={110} height={28} rx={8} fill="var(--card)" stroke="var(--danger)" strokeWidth={2} />
      <text x={584} y={268} fill="var(--danger)" fontSize="14" fontWeight="850">color banding</text>
      <MutedLabel x={238} y={404}>solid-black backgrounds reveal JPEG artifacts in KDP print</MutedLabel>
    </g>
  );
}


export function ResolutionCheckWorkflow() {
  const steps = ['Check\nresolution', 'Verify\ndoc DPI', 'Replace\nassets', 'PDF Print\nexport', 'Inspect\nPDF'];
  return (
    <g>
      <Label x={256} y={62}>resolution fix workflow</Label>
      {steps.map((step, i) => {
        const x = 56 + i * 144;
        const lines = step.split('\n');
        return (
          <g key={step}>
            <rect x={x} y={148} width={118} height={88} rx={16}
              fill={i === steps.length - 1 ? 'color-mix(in srgb, var(--success) 12%, transparent)' : 'var(--card)'}
              stroke={i === steps.length - 1 ? 'var(--success)' : 'var(--primary)'}
              strokeWidth={3}
            />
            <text x={x + 59} y={183} textAnchor="middle" fill="var(--foreground)" fontSize="14" fontWeight="800">{lines[0]}</text>
            <text x={x + 59} y={203} textAnchor="middle" fill="var(--foreground)" fontSize="14" fontWeight="800">{lines[1]}</text>
            {i < steps.length - 1 && (
              <path d={`M${x + 126} 192h24`} stroke="var(--primary)" strokeWidth={3} strokeDasharray="6 6" />
            )}
          </g>
        );
      })}
      <MutedLabel x={188} y={292}>fix low-DPI images before exporting the final cover PDF</MutedLabel>
    </g>
  );
}


export function PixelationExample() {
  return (
    <g>
      <Label x={220} y={56}>zoomed view of low-resolution cover</Label>

      {/* Cover frame */}
      <rect x={154} y={78} width={336} height={300} rx={20} fill="var(--card)" stroke="var(--border)" strokeWidth={3} />
      {/* Image area with pixel blocks */}
      <rect x={174} y={98} width={296} height={200} rx={10} fill="color-mix(in srgb, var(--primary) 8%, transparent)" />
      {[0,1,2,3].map((row) =>
        [0,1,2,3,4,5,6].map((col) => (
          <rect
            key={`p-${row}-${col}`}
            x={174 + col * 42}
            y={98 + row * 50}
            width={41}
            height={49}
            fill={`color-mix(in srgb, var(--primary) ${10 + ((row * 6 + col * 11) % 30)}%, transparent)`}
            stroke="var(--card)"
            strokeWidth={1.5}
          />
        ))
      )}
      {/* Text area */}
      <rect x={183} y={308} width={178} height={14} rx={4} fill="var(--foreground)" opacity=".2" />
      <rect x={185} y={311} width={178} height={14} rx={4} fill="var(--foreground)" opacity=".12" />
      <rect x={181} y={305} width={178} height={14} rx={4} fill="var(--foreground)" opacity=".1" />

      {/* Zoom detail circle on right */}
      <circle cx={590} cy={224} r={88} fill="color-mix(in srgb, var(--danger) 6%, var(--card))" stroke="var(--danger)" strokeWidth={3} />
      {/* Large pixel blocks inside zoom */}
      <rect x={530} y={168} width={36} height={34} fill="color-mix(in srgb, var(--primary) 32%, transparent)" />
      <rect x={566} y={168} width={30} height={34} fill="color-mix(in srgb, var(--primary) 14%, transparent)" />
      <rect x={596} y={168} width={36} height={34} fill="color-mix(in srgb, var(--primary) 40%, transparent)" />
      <rect x={632} y={168} width={28} height={34} fill="color-mix(in srgb, var(--primary) 22%, transparent)" />
      <rect x={530} y={202} width={36} height={36} fill="color-mix(in srgb, var(--primary) 18%, transparent)" />
      <rect x={566} y={202} width={30} height={36} fill="color-mix(in srgb, var(--primary) 38%, transparent)" />
      <rect x={596} y={202} width={36} height={36} fill="color-mix(in srgb, var(--primary) 12%, transparent)" />
      <rect x={632} y={202} width={28} height={36} fill="color-mix(in srgb, var(--primary) 28%, transparent)" />
      <rect x={530} y={238} width={36} height={34} fill="color-mix(in srgb, var(--primary) 30%, transparent)" />
      <rect x={566} y={238} width={30} height={34} fill="color-mix(in srgb, var(--primary) 16%, transparent)" />
      <rect x={596} y={238} width={36} height={34} fill="color-mix(in srgb, var(--primary) 34%, transparent)" />
      <rect x={632} y={238} width={28} height={34} fill="color-mix(in srgb, var(--primary) 20%, transparent)" />
      {/* Connector line from cover to zoom */}
      <path d="M490 200l42 24" stroke="var(--danger)" strokeWidth={3} strokeDasharray="7 7" />
      <MutedLabel x={530} y={326}>individual pixels visible at 300% zoom</MutedLabel>
    </g>
  );
}


export function SharpCoverExport() {
  const steps = ['300 DPI\nsource', 'PDF Print\nexport', 'Inspect\nPDF zoom', 'Upload\nto KDP'];
  return (
    <g>
      <Label x={262} y={62}>correct export workflow for sharp covers</Label>
      {steps.map((step, i) => {
        const x = 84 + i * 166;
        const lines = step.split('\n');
        const isLast = i === steps.length - 1;
        return (
          <g key={step}>
            <rect x={x} y={148} width={132} height={92} rx={18}
              fill={isLast ? 'color-mix(in srgb, var(--success) 12%, transparent)' : 'var(--card)'}
              stroke={isLast ? 'var(--success)' : 'var(--primary)'}
              strokeWidth={3}
            />
            <circle cx={x + 22} cy={148} r={14} fill={isLast ? 'var(--success)' : 'var(--primary)'} />
            <text x={x + 22} y={153} textAnchor="middle" fill="var(--card)" fontSize="13" fontWeight="900">{i + 1}</text>
            <text x={x + 66} y={187} textAnchor="middle" fill="var(--foreground)" fontSize="14" fontWeight="800">{lines[0]}</text>
            <text x={x + 66} y={207} textAnchor="middle" fill="var(--foreground)" fontSize="14" fontWeight="800">{lines[1]}</text>
            {!isLast && (
              <path d={`M${x + 140} 194h32`} stroke="var(--primary)" strokeWidth={3} strokeDasharray="6 6" />
            )}
          </g>
        );
      })}
      <MutedLabel x={196} y={296}>follow all four steps for a print-quality KDP cover</MutedLabel>
    </g>
  );
}


export function InteriorCoverMismatch() {
  return (
    <g>
      <Label x={234} y={56}>interior vs cover file: mismatch detected</Label>
      {/* Interior manuscript */}
      <rect x={50} y={82} width={198} height={268} rx={14} fill="var(--card)" stroke="var(--border)" strokeWidth={3} />
      <rect x={70} y={106} width={158} height={11} rx={3} fill="var(--foreground)" opacity=".18" />
      <rect x={70} y={126} width={138} height={9} rx={3} fill="var(--foreground)" opacity=".12" />
      <rect x={70} y={143} width={148} height={9} rx={3} fill="var(--foreground)" opacity=".12" />
      <rect x={70} y={160} width={128} height={9} rx={3} fill="var(--foreground)" opacity=".12" />
      <rect x={70} y={177} width={142} height={9} rx={3} fill="var(--foreground)" opacity=".12" />
      <rect x={70} y={212} width={158} height={34} rx={8} fill="color-mix(in srgb, var(--primary) 12%, transparent)" stroke="var(--primary)" strokeWidth={2} strokeDasharray="6 6" />
      <text x={149} y={235} textAnchor="middle" fill="var(--primary)" fontSize="13" fontWeight="850">trim: 6 × 9 in</text>
      <text x={149} y={300} textAnchor="middle" fill="var(--muted-foreground)" fontSize="13" fontWeight="750">200 pages · cream</text>
      <text x={88} y={72} fill="var(--foreground)" fontSize="15" fontWeight="800">interior file</text>
      {/* Warning indicator center */}
      <circle cx={400} cy={216} r={38} fill="var(--card)" stroke="var(--danger)" strokeWidth={4} />
      <circle cx={400} cy={216} r={30} fill="color-mix(in srgb, var(--danger) 12%, transparent)" />
      <rect x={396} y={198} width={8} height={22} rx={4} fill="var(--danger)" />
      <circle cx={400} cy={230} r={5} fill="var(--danger)" />
      <text x={400} y={270} textAnchor="middle" fill="var(--danger)" fontSize="13" fontWeight="850">mismatch</text>
      <path d="M248 216h116" stroke="var(--danger)" strokeWidth={3} strokeDasharray="7 7" opacity=".6" />
      <path d="M438 216h76" stroke="var(--danger)" strokeWidth={3} strokeDasharray="7 7" opacity=".6" />
      {/* Cover file - full wrap */}
      <rect x={514} y={118} width={254} height={182} rx={14} fill="var(--card)" stroke="var(--danger)" strokeWidth={3} />
      <path d="M528 118h82v182h-82a14 14 0 0 1-14-14v-154a14 14 0 0 1 14-14z" fill="color-mix(in srgb, var(--muted) 58%, transparent)" />
      <rect x={610} y={118} width={38} height={182} fill="color-mix(in srgb, var(--danger) 16%, transparent)" />
      <path d="M610 118v182M648 118v182" stroke="var(--danger)" strokeWidth={2} />
      <path d="M648 118h108a14 14 0 0 1 14 14v154a14 14 0 0 1-14 14h-108z" fill="color-mix(in srgb, var(--surface) 80%, transparent)" />
      <text x={553} y={215} textAnchor="middle" fill="var(--foreground)" fontSize="14" fontWeight="800">back</text>
      <text x={629} y={215} textAnchor="middle" fill="var(--danger)" fontSize="12" fontWeight="800">spine</text>
      <text x={700} y={215} textAnchor="middle" fill="var(--foreground)" fontSize="14" fontWeight="800">front</text>
      <rect x={530} y={80} width={204} height={30} rx={8} fill="color-mix(in srgb, var(--danger) 12%, transparent)" stroke="var(--danger)" strokeWidth={2} />
      <text x={632} y={101} textAnchor="middle" fill="var(--danger)" fontSize="13" fontWeight="850">wrong trim size used</text>
      <text x={641} y={322} textAnchor="middle" fill="var(--foreground)" fontSize="15" fontWeight="800">cover file</text>
    </g>
  );
}


export function TrimMismatchComparison() {
  return (
    <g>
      <Label x={224} y={54}>trim size mismatch: interior vs cover</Label>
      {/* Left: interior correct */}
      <rect x={48} y={76} width={296} height={298} rx={18} fill="color-mix(in srgb, var(--success) 6%, var(--card))" stroke="var(--success)" strokeWidth={3} />
      <text x={196} y={108} textAnchor="middle" fill="var(--success)" fontSize="15" fontWeight="850">interior file</text>
      <rect x={78} y={122} width={236} height={194} rx={12} fill="var(--card)" stroke="var(--border)" strokeWidth={2} />
      <rect x={96} y={140} width={200} height={10} rx={3} fill="var(--foreground)" opacity=".17" />
      <rect x={96} y={158} width={178} height={9} rx={3} fill="var(--foreground)" opacity=".12" />
      <rect x={96} y={174} width={190} height={9} rx={3} fill="var(--foreground)" opacity=".12" />
      <rect x={96} y={190} width={166} height={9} rx={3} fill="var(--foreground)" opacity=".12" />
      <rect x={96} y={242} width={200} height={30} rx={8} fill="color-mix(in srgb, var(--success) 14%, transparent)" stroke="var(--success)" strokeWidth={2} />
      <text x={196} y={263} textAnchor="middle" fill="var(--success)" fontSize="13" fontWeight="850">6 × 9 in trim</text>
      <circle cx={292} cy={332} r={20} fill="color-mix(in srgb, var(--success) 14%, transparent)" stroke="var(--success)" strokeWidth={3} />
      <path d="M282 332l7 8 14-16" stroke="var(--success)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <text x={196} y={370} textAnchor="middle" fill="var(--success)" fontSize="13" fontWeight="800">correct trim</text>
      {/* Right: cover wrong */}
      <rect x={458} y={76} width={296} height={298} rx={18} fill="color-mix(in srgb, var(--danger) 6%, var(--card))" stroke="var(--danger)" strokeWidth={3} />
      <text x={606} y={108} textAnchor="middle" fill="var(--danger)" fontSize="15" fontWeight="850">cover file</text>
      <rect x={488} y={122} width={236} height={194} rx={12} fill="var(--card)" stroke="var(--danger)" strokeWidth={2} strokeDasharray="8 8" />
      <rect x={508} y={150} width={196} height={134} rx={10} fill="color-mix(in srgb, var(--primary) 10%, transparent)" stroke="var(--primary)" strokeWidth={2} />
      <rect x={508} y={242} width={196} height={30} rx={8} fill="color-mix(in srgb, var(--danger) 14%, transparent)" stroke="var(--danger)" strokeWidth={2} />
      <text x={606} y={263} textAnchor="middle" fill="var(--danger)" fontSize="13" fontWeight="850">8.5 × 11 in trim</text>
      <circle cx={502} cy={332} r={20} fill="color-mix(in srgb, var(--danger) 12%, transparent)" stroke="var(--danger)" strokeWidth={3} />
      <path d="M493 323l18 18M511 323l-18 18" stroke="var(--danger)" strokeWidth={3} strokeLinecap="round" />
      <text x={606} y={370} textAnchor="middle" fill="var(--danger)" fontSize="13" fontWeight="800">wrong trim — mismatch</text>
    </g>
  );
}


export function SpineMismatchDiagram() {
  return (
    <g>
      <Label x={220} y={56}>spine width mismatch: page count drives cover width</Label>
      {/* Interior page count box */}
      <rect x={48} y={86} width={200} height={180} rx={16} fill="var(--card)" stroke="var(--border)" strokeWidth={3} />
      <text x={148} y={118} textAnchor="middle" fill="var(--foreground)" fontSize="15" fontWeight="850">interior</text>
      <rect x={76} y={134} width={144} height={36} rx={10} fill="color-mix(in srgb, var(--primary) 14%, transparent)" stroke="var(--primary)" strokeWidth={2} />
      <text x={148} y={158} textAnchor="middle" fill="var(--primary)" fontSize="16" fontWeight="900">240 pages</text>
      <rect x={76} y={180} width={144} height={28} rx={8} fill="var(--surface)" stroke="var(--border)" strokeWidth={2} />
      <text x={148} y={199} textAnchor="middle" fill="var(--muted-foreground)" fontSize="13" fontWeight="750">cream paper</text>
      <text x={148} y={244} textAnchor="middle" fill="var(--muted-foreground)" fontSize="12" fontWeight="750">spine = 0.600 in</text>
      {/* Calculation arrow */}
      <path d="M248 178h80" stroke="var(--primary)" strokeWidth={3} strokeDasharray="7 7" />
      <polygon points="328,172 344,178 328,184" fill="var(--primary)" />
      <text x={284} y={162} textAnchor="middle" fill="var(--muted-foreground)" fontSize="11" fontWeight="750">page count</text>
      <text x={284} y={198} textAnchor="middle" fill="var(--muted-foreground)" fontSize="11" fontWeight="750">× 0.0025</text>
      {/* Cover panel showing mismatch */}
      <rect x={344} y={68} width={406} height={204} rx={16} fill="var(--card)" stroke="var(--danger)" strokeWidth={3} />
      <path d="M360 68h146v204h-146a16 16 0 0 1-16-16v-172a16 16 0 0 1 16-16z" fill="color-mix(in srgb, var(--muted) 56%, transparent)" />
      {/* Spine too narrow (built for 200 pages = 0.500in) */}
      <rect x={506} y={68} width={32} height={204} fill="color-mix(in srgb, var(--danger) 18%, transparent)" />
      <path d="M506 68v204M538 68v204" stroke="var(--danger)" strokeWidth={2} />
      <path d="M538 68h196a16 16 0 0 1 16 16v172a16 16 0 0 1-16 16h-196z" fill="color-mix(in srgb, var(--surface) 80%, transparent)" />
      <text x={425} y={176} textAnchor="middle" fill="var(--foreground)" fontSize="14" fontWeight="800">back</text>
      <text x={522} y={176} textAnchor="middle" fill="var(--danger)" fontSize="12" fontWeight="850">spine</text>
      <text x={644} y={176} textAnchor="middle" fill="var(--foreground)" fontSize="14" fontWeight="800">front</text>
      {/* Warning on spine */}
      <rect x={476} y={80} width={92} height={30} rx={8} fill="color-mix(in srgb, var(--danger) 14%, transparent)" stroke="var(--danger)" strokeWidth={2} />
      <text x={522} y={100} textAnchor="middle" fill="var(--danger)" fontSize="12" fontWeight="850">too narrow</text>
      <MutedLabel x={50} y={306}>cover was built for 200 pages (spine: 0.500 in) but interior has 240 pages (spine: 0.600 in)</MutedLabel>
    </g>
  );
}


export function BleedMismatchOverlay() {
  return (
    <g>
      <Label x={222} y={54}>bleed mismatch: cover dimensions vs trim dimensions</Label>
      {/* Left: Interior PDF — trim only */}
      <text x={168} y={86} textAnchor="middle" fill="var(--foreground)" fontSize="15" fontWeight="800">interior PDF</text>
      <rect x={70} y={100} width={196} height={256} rx={12} fill="var(--card)" stroke="var(--primary)" strokeWidth={3} />
      <rect x={88} y={118} width={160} height={11} rx={3} fill="var(--foreground)" opacity=".17" />
      <rect x={88} y={137} width={140} height={9} rx={3} fill="var(--foreground)" opacity=".12" />
      <rect x={88} y={154} width={152} height={9} rx={3} fill="var(--foreground)" opacity=".12" />
      <text x={168} y={236} textAnchor="middle" fill="var(--primary)" fontSize="13" fontWeight="800">trim size only</text>
      <rect x={88} y={220} width={160} height={30} rx={8} fill="color-mix(in srgb, var(--primary) 10%, transparent)" stroke="var(--primary)" strokeWidth={2} />
      {/* Dimension lines interior */}
      <path d="M70 370h196" stroke="var(--primary)" strokeWidth={3} />
      <path d="M70 360v20M266 360v20" stroke="var(--primary)" strokeWidth={3} />
      <text x={168} y={400} textAnchor="middle" fill="var(--primary)" fontSize="13" fontWeight="800">6.00 × 9.00 in</text>
      {/* Divider */}
      <path d="M400 68v360" stroke="var(--border)" strokeWidth={2} strokeDasharray="8 8" />
      {/* Right: Cover PDF — with bleed */}
      <text x={608} y={86} textAnchor="middle" fill="var(--foreground)" fontSize="15" fontWeight="800">cover PDF (correct)</text>
      {/* Bleed extensions dashed */}
      <rect x={470} y={88} width={276} height={280} rx={14} fill="color-mix(in srgb, var(--danger) 6%, transparent)" stroke="var(--danger)" strokeWidth={2} strokeDasharray="8 8" />
      <text x={742} y={108} textAnchor="end" fill="var(--danger)" fontSize="11" fontWeight="800">+ bleed</text>
      {/* Trim area inside */}
      <rect x={483} y={100} width={250} height={256} rx={10} fill="var(--card)" stroke="var(--success)" strokeWidth={3} />
      <rect x={502} y={118} width={212} height={12} rx={3} fill="color-mix(in srgb, var(--primary) 18%, transparent)" />
      <rect x={502} y={142} width={82} height={100} rx={8} fill="color-mix(in srgb, var(--muted) 60%, transparent)" />
      <rect x={596} y={142} width={28} height={100} fill="color-mix(in srgb, var(--primary) 20%, transparent)" />
      <rect x={624} y={142} width={90} height={100} rx={8} fill="var(--card)" />
      <text x={535} y={200} textAnchor="middle" fill="var(--foreground)" fontSize="11" fontWeight="750">back</text>
      <text x={610} y={200} textAnchor="middle" fill="var(--primary)" fontSize="11" fontWeight="750">spine</text>
      <text x={669} y={200} textAnchor="middle" fill="var(--foreground)" fontSize="11" fontWeight="750">front</text>
      {/* Dimension lines cover */}
      <path d="M470 382h276" stroke="var(--success)" strokeWidth={3} />
      <path d="M470 372v20M746 372v20" stroke="var(--success)" strokeWidth={3} />
      <text x={608} y={410} textAnchor="middle" fill="var(--success)" fontSize="12" fontWeight="800">full wrap + 0.25 in bleed</text>
    </g>
  );
}


export function CanvaWrongSetup() {
  // Canvas: x=140–360 (w=220), right edge x=360
  // Callouts: x=452–692 (w=240), left edge x=452
  // Lines: horizontal from x=360 to x=452 at each callout center-y
  const cx = 240; // canvas center-x
  const cl = 452; // callout left edge
  const cw = 240; // callout width
  const ccx = cl + cw / 2; // callout center-x = 572
  return (
    <g>
      {/* Title — sits above everything */}
      <Label x={cx} y={28}>canva: front-cover-only setup (incorrect)</Label>
      {/* Canvas outer rect */}
      <rect x={130} y={50} width={220} height={300} rx={14}
        fill="var(--card)" stroke="var(--danger)" strokeWidth={3} />
      {/* Inner "front-only" content area */}
      <rect x={152} y={74} width={176} height={212} rx={10}
        fill="color-mix(in srgb, var(--primary) 12%, transparent)"
        stroke="var(--primary)" strokeWidth={2} />
      <text x={cx} y={190} textAnchor="middle" fill="var(--foreground)" fontSize="16" fontWeight="800">front cover</text>
      <text x={cx} y={212} textAnchor="middle" fill="var(--muted-foreground)" fontSize="13" fontWeight="700">6 × 9 canvas</text>
      {/* "will fail" badge — below canvas */}
      <rect x={130} y={358} width={220} height={30} rx={8}
        fill="color-mix(in srgb, var(--danger) 12%, transparent)"
        stroke="var(--danger)" strokeWidth={2} />
      <text x={cx} y={378} textAnchor="middle" fill="var(--danger)" fontSize="13" fontWeight="850">front panel only — will fail</text>
      {/* Callout 1: missing back + spine (center-y = 110) */}
      <rect x={cl} y={80} width={cw} height={60} rx={12}
        fill="color-mix(in srgb, var(--danger) 8%, var(--card))"
        stroke="var(--danger)" strokeWidth={2} />
      <path d="M360 110 L452 110" stroke="var(--danger)" strokeWidth={2.5} strokeDasharray="7 5" />
      <text x={ccx} y={107} textAnchor="middle" fill="var(--danger)" fontSize="13" fontWeight="850">missing:</text>
      <text x={ccx} y={127} textAnchor="middle" fill="var(--danger)" fontSize="13" fontWeight="750">back cover + spine</text>
      {/* Callout 2: missing bleed (center-y = 208) */}
      <rect x={cl} y={178} width={cw} height={60} rx={12}
        fill="color-mix(in srgb, var(--danger) 8%, var(--card))"
        stroke="var(--danger)" strokeWidth={2} />
      <path d="M360 208 L452 208" stroke="var(--danger)" strokeWidth={2.5} strokeDasharray="7 5" />
      <text x={ccx} y={205} textAnchor="middle" fill="var(--danger)" fontSize="13" fontWeight="850">missing:</text>
      <text x={ccx} y={225} textAnchor="middle" fill="var(--danger)" fontSize="13" fontWeight="750">0.125 in bleed edges</text>
      {/* Callout 3: export format (center-y = 306) */}
      <rect x={cl} y={276} width={cw} height={60} rx={12}
        fill="color-mix(in srgb, var(--danger) 8%, var(--card))"
        stroke="var(--danger)" strokeWidth={2} />
      <path d="M360 306 L452 306" stroke="var(--danger)" strokeWidth={2.5} strokeDasharray="7 5" />
      <text x={ccx} y={303} textAnchor="middle" fill="var(--danger)" fontSize="13" fontWeight="850">export:</text>
      <text x={ccx} y={323} textAnchor="middle" fill="var(--danger)" fontSize="13" fontWeight="750">PDF Print required</text>
    </g>
  );
}


export function CanvaCorrectWraparound() {
  return (
    <g>
      <Label x={220} y={46}>canva: correct full-wrap setup</Label>
      {/* Bleed area — dashed, outermost boundary */}
      <rect x={28} y={62} width={530} height={314} rx={20}
        fill="color-mix(in srgb, var(--danger) 4%, transparent)"
        stroke="var(--danger)" strokeWidth={2} strokeDasharray="8 8" />
      <text x={36} y={78} textAnchor="start" fill="var(--danger)" fontSize="12" fontWeight="800">+ bleed (0.125 in each side)</text>
      {/* Trim area — solid green border, inner rect */}
      <rect x={48} y={82} width={490} height={274} rx={18}
        fill="var(--card)" stroke="var(--success)" strokeWidth={3} />
      {/* Back cover — left corners rounded, right edge straight */}
      <path d="M66 82h164v274h-164a18 18 0 0 1-18-18v-238a18 18 0 0 1 18-18z"
        fill="color-mix(in srgb, var(--muted) 62%, transparent)" />
      {/* Spine fill */}
      <rect x={230} y={82} width={68} height={274}
        fill="color-mix(in srgb, var(--primary) 14%, transparent)" />
      <path d="M230 82v274M298 82v274" stroke="var(--success)" strokeWidth={2} />
      {/* Front cover — right corners rounded, left edge straight */}
      <path d="M298 82h222a18 18 0 0 1 18 18v238a18 18 0 0 1-18 18h-222z"
        fill="color-mix(in srgb, var(--primary) 7%, transparent)" />
      {/* Front cover: image block + text lines */}
      <rect x={316} y={102} width={202} height={136} rx={10}
        fill="color-mix(in srgb, var(--primary) 18%, transparent)" />
      <rect x={316} y={252} width={138} height={10} rx={3} fill="var(--foreground)" opacity=".22" />
      <rect x={316} y={268} width={104} height={8} rx={3} fill="var(--foreground)" opacity=".15" />
      {/* Section labels */}
      <text x={139} y={228} textAnchor="middle" fill="var(--foreground)" fontSize="16" fontWeight="800">back</text>
      <text x={264} y={228} textAnchor="middle" fill="var(--primary)" fontSize="14" fontWeight="850">spine</text>
      <text x={418} y={228} textAnchor="middle" fill="var(--foreground)" fontSize="16" fontWeight="800">front</text>
      {/* Dimension line below bleed box */}
      <path d="M28 392h530" stroke="var(--success)" strokeWidth={2.5} />
      <path d="M28 382v20M558 382v20" stroke="var(--success)" strokeWidth={2.5} />
      <text x={293} y={420} textAnchor="middle" fill="var(--success)" fontSize="13" fontWeight="800">full wrap + 0.25 in bleed</text>
      {/* Right info panel */}
      <rect x={574} y={86} width={200} height={48} rx={12}
        fill="color-mix(in srgb, var(--success) 14%, transparent)" stroke="var(--success)" strokeWidth={3} />
      <circle cx={596} cy={110} r={13} fill="color-mix(in srgb, var(--success) 20%, transparent)" stroke="var(--success)" strokeWidth={2} />
      <path d="M589 110l5 6 11-12" stroke="var(--success)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <text x={676} y={116} textAnchor="middle" fill="var(--success)" fontSize="14" fontWeight="900">correct setup</text>
      <rect x={574} y={148} width={200} height={60} rx={12}
        fill="var(--card)" stroke="var(--border)" strokeWidth={2} />
      <text x={674} y={174} textAnchor="middle" fill="var(--muted-foreground)" fontSize="12" fontWeight="750">export as:</text>
      <text x={674} y={198} textAnchor="middle" fill="var(--success)" fontSize="16" fontWeight="900">PDF Print</text>
      <rect x={574} y={222} width={200} height={80} rx={12}
        fill="var(--card)" stroke="var(--border)" strokeWidth={2} />
      <text x={674} y={248} textAnchor="middle" fill="var(--muted-foreground)" fontSize="12" fontWeight="750">width =</text>
      <text x={674} y={268} textAnchor="middle" fill="var(--foreground)" fontSize="12" fontWeight="800">back + spine + front</text>
      <text x={674} y={287} textAnchor="middle" fill="var(--primary)" fontSize="12" fontWeight="800">+ 0.25 in bleed</text>
    </g>
  );
}


export function PdfDimensionCheck() {
  return (
    <g>
      <Label x={212} y={54}>verify pdf dimensions before uploading</Label>
      {/* Document rectangle */}
      <rect x={68} y={78} width={330} height={298} rx={16} fill="var(--card)" stroke="var(--border)" strokeWidth={3} />
      {/* Interior page lines */}
      <rect x={96} y={110} width={274} height={13} rx={3} fill="var(--foreground)" opacity=".17" />
      <rect x={96} y={132} width={240} height={10} rx={3} fill="var(--foreground)" opacity=".11" />
      <rect x={96} y={150} width={258} height={10} rx={3} fill="var(--foreground)" opacity=".11" />
      <rect x={96} y={168} width={226} height={10} rx={3} fill="var(--foreground)" opacity=".11" />
      <rect x={96} y={186} width={244} height={10} rx={3} fill="var(--foreground)" opacity=".11" />
      <rect x={96} y={238} width={274} height={10} rx={3} fill="var(--foreground)" opacity=".11" />
      <rect x={96} y={256} width={248} height={10} rx={3} fill="var(--foreground)" opacity=".11" />
      {/* Width dimension arrow */}
      <path d="M68 392h330" stroke="var(--primary)" strokeWidth={3} />
      <path d="M68 382v20M398 382v20" stroke="var(--primary)" strokeWidth={3} />
      <text x={233} y={425} textAnchor="middle" fill="var(--primary)" fontSize="14" fontWeight="850">width = back + spine + front + 0.25 in</text>
      {/* Height dimension arrow */}
      <path d="M38 78v298" stroke="var(--success)" strokeWidth={3} />
      <path d="M28 78h20M28 376h20" stroke="var(--success)" strokeWidth={3} />
      <text x={22} y={232} textAnchor="middle" fill="var(--success)" fontSize="13" fontWeight="850" transform="rotate(-90 22 232)">height = trim + 0.25 in</text>
      {/* Check panel right */}
      <rect x={444} y={88} width={300} height={70} rx={14} fill="color-mix(in srgb, var(--success) 10%, var(--card))" stroke="var(--success)" strokeWidth={3} />
      <circle cx={474} cy={123} r={16} fill="color-mix(in srgb, var(--success) 16%, transparent)" stroke="var(--success)" strokeWidth={2} />
      <path d="M465 123l6 7 13-14" stroke="var(--success)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <text x={498} y={117} fill="var(--foreground)" fontSize="13" fontWeight="800">dimensions match KDP spec</text>
      <text x={498} y={137} fill="var(--success)" fontSize="13" fontWeight="800">ready to upload</text>
      <rect x={444} y={174} width={300} height={70} rx={14} fill="color-mix(in srgb, var(--danger) 8%, var(--card))" stroke="var(--danger)" strokeWidth={3} />
      <circle cx={474} cy={209} r={16} fill="color-mix(in srgb, var(--danger) 14%, transparent)" stroke="var(--danger)" strokeWidth={2} />
      <path d="M465 200l18 18M483 200l-18 18" stroke="var(--danger)" strokeWidth={2.5} strokeLinecap="round" />
      <text x={498} y={203} fill="var(--foreground)" fontSize="13" fontWeight="800">dimensions do not match</text>
      <text x={498} y={223} fill="var(--danger)" fontSize="13" fontWeight="800">rebuild cover before upload</text>
      <rect x={444} y={262} width={300} height={56} rx={14} fill="var(--card)" stroke="var(--border)" strokeWidth={2} />
      <text x={594} y={286} textAnchor="middle" fill="var(--muted-foreground)" fontSize="12" fontWeight="800">check: File → Properties</text>
      <text x={594} y={308} textAnchor="middle" fill="var(--muted-foreground)" fontSize="12" fontWeight="750">in Acrobat Reader or Preview</text>
    </g>
  );
}


export function FileAlignmentWorkflow() {
  const steps = ['Finalize\nmanuscript', 'Lock\npage count', 'Download\ntemplate', 'Design\ncover', 'Verify\nPDFs', 'Upload\nto KDP'];
  return (
    <g>
      <Label x={222} y={56}>correct file alignment workflow</Label>
      {steps.map((step, i) => {
        const x = 36 + i * 124;
        const lines = step.split('\n');
        const isLast = i === steps.length - 1;
        const isCritical = i === 1;
        return (
          <g key={step}>
            <rect x={x} y={130} width={106} height={88} rx={14}
              fill={isLast ? 'color-mix(in srgb, var(--success) 12%, transparent)' : isCritical ? 'color-mix(in srgb, var(--primary) 10%, transparent)' : 'var(--card)'}
              stroke={isLast ? 'var(--success)' : isCritical ? 'var(--primary)' : 'var(--border)'}
              strokeWidth={3}
            />
            <circle cx={x + 18} cy={130} r={13} fill={isLast ? 'var(--success)' : isCritical ? 'var(--primary)' : 'var(--muted-foreground)'} />
            <text x={x + 18} y={135} textAnchor="middle" fill="var(--card)" fontSize="12" fontWeight="900">{i + 1}</text>
            <text x={x + 53} y={168} textAnchor="middle" fill="var(--foreground)" fontSize="13" fontWeight="800">{lines[0]}</text>
            <text x={x + 53} y={186} textAnchor="middle" fill="var(--foreground)" fontSize="13" fontWeight="800">{lines[1]}</text>
            {!isLast && (
              <path d={`M${x + 114} 174h16`} stroke="var(--border)" strokeWidth={2.5} strokeDasharray="5 5" />
            )}
            {isCritical && (
              <>
                <rect x={x - 10} y={240} width={126} height={34} rx={8} fill="color-mix(in srgb, var(--primary) 10%, transparent)" stroke="var(--primary)" strokeWidth={2} />
                <text x={x + 53} y={263} textAnchor="middle" fill="var(--primary)" fontSize="11" fontWeight="850">finalize first!</text>
              </>
            )}
          </g>
        );
      })}
      <MutedLabel x={108} y={320}>never start the cover until the interior page count is completely final</MutedLabel>
    </g>
  );
}


