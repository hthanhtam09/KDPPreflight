import type React from 'react';
import type { BlogCategory } from '@/lib/blog-categories';

export type BlogPostVisualProps = {
  postSlug: string;
  category: BlogCategory;
  variant?: 'card' | 'featured' | 'article';
};

export function BlogPostVisual({ postSlug, variant = 'card' }: BlogPostVisualProps) {
  const isCard = variant === 'card';
  const isArticle = variant === 'article';
  const isFeatured = variant === 'featured';
  const visualSlug = sharedVisualBySlug[postSlug] ?? postSlug;

  return (
    <div
      aria-hidden="true"
      className={`relative h-full min-h-full overflow-hidden bg-muted/25 ${
        isArticle ? 'aspect-[16/9] rounded-2xl border border-border shadow-card' : ''
      }`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_12%,color-mix(in_srgb,var(--primary)_18%,transparent),transparent_34%),linear-gradient(90deg,color-mix(in_srgb,var(--foreground)_6%,transparent)_1px,transparent_1px),linear-gradient(0deg,color-mix(in_srgb,var(--foreground)_5%,transparent)_1px,transparent_1px)] bg-[length:auto,28px_28px,28px_28px]" />
      <svg viewBox="0 0 800 450" className="relative h-full w-full">
        <defs>
          <filter id={`sketch-${postSlug}-${variant}`} x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="1" seed="12" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale={isFeatured || isArticle ? '1.6' : '1'} />
          </filter>
        </defs>
        <rect width="800" height="450" fill="transparent" />
        {visualSlug === 'kdp-cover-uploaded-successfully-but-looks-cropped' ? (
          <CroppedCoverVisual compact={isCard} />
        ) : visualSlug === 'fix-barcode-area-contains-text-kdp' ? (
          <BarcodeAreaVisual compact={isCard} />
        ) : visualSlug === 'why-your-kdp-cover-looks-blurry-after-upload' ? (
          <BlurryCoverVisual compact={isCard} />
        ) : visualSlug === 'kdp-cover-colors-look-different-after-printing' ? (
          <ColorShiftVisual compact={isCard} />
        ) : visualSlug === 'fix-kdp-spine-text-off-center' ? (
          <SpineTextOffCenterVisual compact={isCard} />
        ) : visualSlug === 'interior-and-cover-file-dont-match-kdp' ? (
          <FileMismatchVisual compact={isCard} />
        ) : visualSlug === 'what-happens-if-you-forget-bleed-on-kdp' ? (
          <ForgotBleedVisual compact={isCard} />
        ) : visualSlug === 'kdp-bleed-vs-no-bleed' ? (
          <BleedVsNoBleedVisual compact={isCard} />
        ) : visualSlug === 'how-far-should-text-be-from-edge-kdp-cover' ? (
          <SafeMarginCoverVisual compact={isCard} />
        ) : visualSlug === 'how-to-check-safe-area-before-exporting-kdp-cover' ? (
          <SafeAreaCheckerVisual compact={isCard} />
        ) : visualSlug === 'why-background-colors-must-extend-past-trim-size' ? (
          <BackgroundBleedVisual compact={isCard} />
        ) : visualSlug === 'fix-text-outside-safe-area-kdp' ? (
          <SafeAreaFixVisual compact={isCard} />
        ) : visualSlug === 'kdp-pdf-upload-takes-forever' ? (
          <SlowUploadVisual compact={isCard} />
        ) : visualSlug === 'kdp-previewer-not-loading' ? (
          <PreviewerFrozenVisual compact={isCard} />
        ) : visualSlug === 'white-lines-on-kdp-cover' ? (
          <WhiteLinesVisual compact={isCard} />
        ) : (
          <g filter={`url(#sketch-${postSlug}-${variant})`}>
            {visualSlug === 'kdp-cover-size-does-not-match-interior' ? <CoverInteriorMismatchVisual compact={isCard} /> : <GenericCoverVisual />}
          </g>
        )}
        {visualSlug === 'kdp-cover-size-does-not-match-interior' && <CoverInteriorMismatchSharpOverlay compact={isCard} />}
      </svg>
    </div>
  );
}

const sharedVisualBySlug: Record<string, string> = {
  'fix-low-resolution-images-kdp': 'why-your-kdp-cover-looks-blurry-after-upload',
};

function SpineTextOffCenterVisual({ compact = false }: { compact?: boolean }) {
  return (
    <g transform={compact ? 'translate(0 20)' : undefined}>
      <rect x="96" y="104" width="608" height="238" rx="22" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <path d="M118 104h246v238H118a22 22 0 0 1-22-22V126a22 22 0 0 1 22-22Z" fill="color-mix(in srgb, var(--muted) 68%, transparent)" />
      <rect x="364" y="104" width="72" height="238" fill="color-mix(in srgb, var(--danger) 10%, transparent)" stroke="var(--danger)" strokeWidth="3" />
      <path d="M436 104h246a22 22 0 0 1 22 22v194a22 22 0 0 1-22 22H436Z" fill="color-mix(in srgb, var(--surface) 76%, transparent)" />
      <path d="M400 120v206" stroke="var(--success)" strokeWidth="3" strokeDasharray="7 7" />
      <text x="380" y="246" textAnchor="middle" fill="var(--danger)" fontSize="15" fontWeight="950" transform="rotate(-90 380 246)">SHIFTED</text>
      <path d="M380 148v156" stroke="var(--danger)" strokeWidth="5" strokeLinecap="round" />
      <circle cx="414" cy="124" r="18" fill="var(--card)" stroke="var(--danger)" strokeWidth="3.5" />
      <text x="408" y="133" fill="var(--danger)" fontSize="22" fontWeight="950">!</text>
      <rect x="132" y="142" width="128" height="20" rx="8" fill="var(--foreground)" opacity=".12" />
      <rect x="500" y="142" width="128" height="20" rx="8" fill="var(--foreground)" opacity=".12" />
      <rect x="292" y="370" width="216" height="34" rx="11" fill="var(--card)" stroke="var(--success)" strokeWidth="2.5" />
      <text x="400" y="393" textAnchor="middle" fill="var(--success)" fontSize="14" fontWeight="950">center guide fixes alignment</text>
      {!compact && <text x="220" y="62" fill="var(--foreground)" fontSize="22" fontWeight="950">KDP spine text alignment</text>}
    </g>
  );
}

function SafeAreaCheckerVisual({ compact = false }: { compact?: boolean }) {
  return (
    <g transform={compact ? 'translate(0 20)' : undefined}>
      <rect x="112" y="68" width="576" height="318" rx="24" fill="color-mix(in srgb, var(--danger) 8%, transparent)" stroke="var(--danger)" strokeDasharray="9 9" strokeWidth="3" />
      <rect x="154" y="102" width="492" height="252" rx="20" fill="var(--card)" stroke="var(--primary)" strokeWidth="3" />
      <rect x="216" y="150" width="368" height="156" rx="16" fill="color-mix(in srgb, var(--success) 10%, transparent)" stroke="var(--success)" strokeDasharray="8 8" strokeWidth="3" />
      <rect x="276" y="184" width="248" height="42" rx="12" fill="var(--foreground)" opacity=".86" />
      <text x="400" y="212" textAnchor="middle" fill="var(--card)" fontSize="19" fontWeight="950">SAFE TITLE</text>
      <rect x="318" y="246" width="164" height="18" rx="9" fill="var(--primary)" opacity=".62" />
      <rect x="344" y="282" width="112" height="14" rx="7" fill="var(--foreground)" opacity=".35" />
      <rect x="538" y="306" width="78" height="28" rx="9" fill="color-mix(in srgb, var(--danger) 12%, transparent)" stroke="var(--danger)" strokeWidth="2.5" />
      <text x="577" y="325" textAnchor="middle" fill="var(--danger)" fontSize="12" fontWeight="950">too low</text>
      <path d="M624 320h40" stroke="var(--danger)" strokeWidth="3" strokeLinecap="round" />
      <circle cx="646" cy="102" r="25" fill="var(--card)" stroke="var(--success)" strokeWidth="4" />
      <path d="M634 101l9 9 18-21" fill="none" stroke="var(--success)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="70" y="138" width="116" height="34" rx="11" fill="var(--card)" stroke="var(--danger)" strokeWidth="2.5" />
      <text x="128" y="161" textAnchor="middle" fill="var(--danger)" fontSize="14" fontWeight="950">bleed</text>
      <rect x="94" y="194" width="92" height="34" rx="11" fill="var(--card)" stroke="var(--primary)" strokeWidth="2.5" />
      <text x="140" y="217" textAnchor="middle" fill="var(--primary)" fontSize="14" fontWeight="950">trim</text>
      <rect x="82" y="250" width="126" height="34" rx="11" fill="var(--card)" stroke="var(--success)" strokeWidth="2.5" />
      <text x="145" y="273" textAnchor="middle" fill="var(--success)" fontSize="14" fontWeight="950">safe area</text>
      {!compact && <text x="228" y="48" fill="var(--foreground)" fontSize="21" fontWeight="950">pre-export safe-area check</text>}
    </g>
  );
}

function BackgroundBleedVisual({ compact = false }: { compact?: boolean }) {
  return (
    <g transform={compact ? 'translate(0 22)' : undefined}>
      <rect x="120" y="70" width="560" height="320" rx="24" fill="color-mix(in srgb, var(--primary) 18%, transparent)" stroke="var(--danger)" strokeDasharray="9 9" strokeWidth="3" />
      <rect x="166" y="112" width="468" height="236" rx="20" fill="color-mix(in srgb, var(--primary) 22%, transparent)" stroke="var(--primary)" strokeWidth="3" />
      <rect x="244" y="168" width="312" height="118" rx="16" fill="var(--card)" stroke="var(--success)" strokeDasharray="8 8" strokeWidth="3" />
      <rect x="300" y="196" width="200" height="38" rx="11" fill="var(--foreground)" opacity=".82" />
      <text x="400" y="221" textAnchor="middle" fill="var(--card)" fontSize="17" fontWeight="950">BACKGROUND</text>
      <rect x="336" y="254" width="128" height="16" rx="8" fill="var(--primary)" opacity=".62" />
      <rect x="80" y="120" width="108" height="36" rx="11" fill="var(--card)" stroke="var(--danger)" strokeWidth="3" />
      <text x="134" y="144" textAnchor="middle" fill="var(--danger)" fontSize="15" fontWeight="950">bleed</text>
      <rect x="622" y="132" width="96" height="34" rx="10" fill="var(--card)" stroke="var(--primary)" strokeWidth="2.5" />
      <text x="670" y="155" textAnchor="middle" fill="var(--primary)" fontSize="14" fontWeight="950">trim</text>
      <circle cx="638" cy="338" r="25" fill="var(--card)" stroke="var(--success)" strokeWidth="4" />
      <path d="M626 337l9 9 17-21" fill="none" stroke="var(--success)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      {!compact && <text x="220" y="54" fill="var(--foreground)" fontSize="19" fontWeight="950">background extends past trim</text>}
    </g>
  );
}

function SafeMarginCoverVisual({ compact = false }: { compact?: boolean }) {
  return (
    <g transform={compact ? 'translate(0 20)' : undefined}>
      <rect x="126" y="72" width="548" height="318" rx="24" fill="color-mix(in srgb, var(--danger) 8%, transparent)" stroke="var(--danger)" strokeDasharray="9 9" strokeWidth="3" />
      <rect x="164" y="104" width="472" height="254" rx="20" fill="var(--card)" stroke="var(--primary)" strokeWidth="3" />
      <rect x="228" y="154" width="344" height="154" rx="16" fill="color-mix(in srgb, var(--success) 10%, transparent)" stroke="var(--success)" strokeDasharray="8 8" strokeWidth="3" />
      <rect x="272" y="184" width="256" height="44" rx="12" fill="var(--foreground)" opacity=".84" />
      <text x="400" y="213" textAnchor="middle" fill="var(--card)" fontSize="20" fontWeight="950">SAFE TITLE</text>
      <rect x="320" y="252" width="160" height="18" rx="8" fill="var(--primary)" opacity=".62" />
      <rect x="348" y="292" width="104" height="16" rx="8" fill="var(--foreground)" opacity=".35" />
      <rect x="56" y="164" width="146" height="42" rx="13" fill="var(--card)" stroke="var(--danger)" strokeWidth="3" />
      <text x="129" y="191" textAnchor="middle" fill="var(--danger)" fontSize="17" fontWeight="950">too close</text>
      <circle cx="642" cy="334" r="25" fill="var(--card)" stroke="var(--success)" strokeWidth="4" />
      <path d="M630 333l8 8 17-20" fill="none" stroke="var(--success)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      {!compact && (
        <>
          <text x="176" y="54" fill="var(--danger)" fontSize="18" fontWeight="950">bleed</text>
          <text x="174" y="96" fill="var(--primary)" fontSize="18" fontWeight="950">trim</text>
          <rect x="248" y="128" width="116" height="34" rx="10" fill="var(--card)" stroke="var(--success)" strokeWidth="2.5" />
          <text x="306" y="151" textAnchor="middle" fill="var(--success)" fontSize="17" fontWeight="950">safe area</text>
        </>
      )}
    </g>
  );
}

function T({ x, y, children, fill = 'var(--foreground)' }: { x: number; y: number; children: React.ReactNode; fill?: string }) {
  return <text x={x} y={y} fill={fill} fontSize="20" fontWeight="850">{children}</text>;
}

function GenericCoverVisual() {
  return (
    <>
      <rect x="105" y="126" width="590" height="210" rx="18" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <rect x="105" y="126" width="252" height="210" rx="18" fill="color-mix(in srgb, var(--muted) 70%, transparent)" />
      <rect x="357" y="126" width="86" height="210" fill="color-mix(in srgb, var(--primary) 22%, transparent)" stroke="var(--primary)" strokeWidth="3" />
      <rect x="443" y="126" width="252" height="210" rx="18" fill="color-mix(in srgb, var(--surface) 80%, transparent)" />
      <rect x="126" y="146" width="548" height="170" rx="12" fill="transparent" stroke="var(--danger)" strokeDasharray="8 8" strokeWidth="3" />
      <rect x="154" y="174" width="492" height="114" rx="10" fill="transparent" stroke="var(--success)" strokeDasharray="7 7" strokeWidth="3" />
      <T x={186} y={238}>back</T>
      <T x={373} y={238}>spine</T>
      <T x={533} y={238}>front</T>
      <path d="M250 378h300" stroke="var(--primary)" strokeWidth="4" />
      <T x={248} y={410}>trim + bleed + safe area</T>
    </>
  );
}

function CoverInteriorMismatchVisual({ compact = false }: { compact?: boolean }) {
  return (
    <g transform={compact ? 'translate(0 28)' : undefined}>
      <rect x="76" y="110" width="468" height="210" rx="18" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <rect x="76" y="110" width="198" height="210" rx="18" fill="color-mix(in srgb, var(--muted) 68%, transparent)" />
      <rect x="274" y="110" width="70" height="210" fill="color-mix(in srgb, var(--primary) 22%, transparent)" stroke="var(--primary)" strokeWidth="3" />
      <rect x="344" y="110" width="200" height="210" rx="18" fill="color-mix(in srgb, var(--surface) 82%, transparent)" />
      <rect x="98" y="132" width="424" height="166" rx="12" fill="transparent" stroke="var(--danger)" strokeDasharray="8 8" strokeWidth="3" />
      <rect x="122" y="158" width="376" height="112" rx="10" fill="transparent" stroke="var(--success)" strokeDasharray="7 7" strokeWidth="3" />
      <T x={145} y={226}>back</T>
      <T x={284} y={226}>spine</T>
      <T x={410} y={226}>front</T>

      <rect x="600" y="86" width="116" height="158" rx="14" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <rect x="620" y="116" width="76" height="98" rx="8" fill="color-mix(in srgb, var(--primary) 12%, transparent)" stroke="var(--primary)" strokeDasharray="7 7" strokeWidth="3" />
      <T x={613} y={280}>interior</T>
      <text x="604" y="304" fill="var(--muted-foreground)" fontSize="14" fontWeight="750">trim + pages</text>

      <path d="M548 210h44" stroke="var(--danger)" strokeWidth="4" strokeDasharray="8 8" opacity=".45" />
      <circle cx="572" cy="210" r="28" fill="var(--card)" />
      <circle cx="572" cy="210" r="24" fill="color-mix(in srgb, var(--danger) 10%, transparent)" stroke="var(--danger)" strokeWidth="4" />
      <rect x="568" y="194" width="8" height="22" rx="4" fill="var(--danger)" />
      <circle cx="572" cy="224" r="4.5" fill="var(--danger)" />

      <path d="M92 354h438" stroke="var(--primary)" strokeWidth="4" />
      <path d="M92 344v20M530 344v20" stroke="var(--primary)" strokeWidth="4" />
      <T x={176} y={390}>full cover width</T>
      {!compact && (
        <>
          <text x="112" y="72" fill="var(--foreground)" fontSize="22" fontWeight="900">cover file</text>
          <text x="596" y="58" fill="var(--danger)" fontSize="20" fontWeight="900">size mismatch</text>
        </>
      )}
    </g>
  );
}

function CoverInteriorMismatchSharpOverlay({ compact = false }: { compact?: boolean }) {
  return (
    <g aria-hidden="true" transform={compact ? 'translate(0 28)' : undefined}>
      <path d="M274 110v210" stroke="var(--primary)" strokeWidth="4" strokeLinecap="square" />
      <path d="M344 110v210" stroke="var(--primary)" strokeWidth="4" strokeLinecap="square" />
      <path d="M274 110h70M274 320h70" stroke="var(--primary)" strokeWidth="4" strokeLinecap="square" />
    </g>
  );
}

function BarcodeAreaVisual({ compact = false }: { compact?: boolean }) {
  return (
    <g transform={compact ? 'translate(0 28)' : undefined}>
      <rect x="95" y="102" width="610" height="238" rx="20" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <path d="M115 102h245v238H115a20 20 0 0 1-20-20V122a20 20 0 0 1 20-20Z" fill="color-mix(in srgb, var(--muted) 68%, transparent)" />
      <rect x="360" y="102" width="72" height="238" fill="color-mix(in srgb, var(--primary) 18%, transparent)" />
      <path d="M432 102h253a20 20 0 0 1 20 20v198a20 20 0 0 1-20 20H432Z" fill="var(--card)" />
      <path d="M360 102v238M432 102v238" stroke="var(--primary)" strokeWidth="4" />
      <rect x="244" y="250" width="112" height="76" rx="12" fill="color-mix(in srgb, var(--danger) 12%, transparent)" stroke="var(--danger)" strokeDasharray="8 8" strokeWidth="3" />
      <rect x="255" y="260" width="90" height="58" rx="9" fill="var(--card)" stroke="var(--danger)" strokeWidth="3" />
      <rect x="270" y="273" width="8" height="31" fill="var(--foreground)" opacity=".72" />
      <rect x="286" y="273" width="4" height="31" fill="var(--foreground)" opacity=".58" />
      <rect x="298" y="273" width="10" height="31" fill="var(--foreground)" opacity=".68" />
      <rect x="318" y="273" width="5" height="31" fill="var(--foreground)" opacity=".58" />
      <rect x="330" y="273" width="7" height="31" fill="var(--foreground)" opacity=".68" />
      <text x="166" y="225" fill="var(--foreground)" fontSize="22" fontWeight="900">back</text>
      <text x="376" y="225" fill="var(--foreground)" fontSize="20" fontWeight="900">spine</text>
      <text x="530" y="225" fill="var(--foreground)" fontSize="22" fontWeight="900">front</text>
      {!compact && <text x="218" y="82" fill="var(--danger)" fontSize="22" fontWeight="900">barcode area contains text</text>}
      <path d="M300 250v-62" stroke="var(--danger)" strokeWidth="4" strokeDasharray="8 8" />
      <rect x="230" y="164" width="140" height="34" rx="10" fill="color-mix(in srgb, var(--danger) 12%, transparent)" stroke="var(--danger)" strokeWidth="3" />
      <text x="252" y="187" fill="var(--danger)" fontSize="16" fontWeight="850">unsafe text</text>
    </g>
  );
}

function BlurryCoverVisual({ compact = false }: { compact?: boolean }) {
  return (
    <g transform={compact ? 'translate(0 20)' : undefined}>
      {/* Left panel: blurry / pixelated */}
      <rect x={68} y={88} width={266} height={288} rx={20} fill="var(--card)" stroke="var(--danger)" strokeWidth={3} />
      <rect x={88} y={114} width={226} height={164} rx={10} fill="color-mix(in srgb, var(--primary) 8%, transparent)" />
      {/* Coarse pixel blocks */}
      {[0,1,2,3].map((row) =>
        [0,1,2,3,4].map((col) => (
          <rect
            key={`b-${row}-${col}`}
            x={88 + col * 45}
            y={114 + row * 41}
            width={44}
            height={40}
            fill={`color-mix(in srgb, var(--primary) ${10 + ((row * 7 + col * 11) % 28)}%, transparent)`}
            stroke="var(--card)"
            strokeWidth={1.5}
          />
        ))
      )}
      {/* Blurry text placeholder */}
      <rect x={96} y={294} width={178} height={12} rx={3} fill="var(--foreground)" opacity=".22" />
      <rect x={98} y={297} width={178} height={12} rx={3} fill="var(--foreground)" opacity=".13" />
      <rect x={94} y={291} width={178} height={12} rx={3} fill="var(--foreground)" opacity=".1" />
      <rect x={110} y={320} width={134} height={10} rx={3} fill="var(--foreground)" opacity=".16" />
      {!compact && <text x={90} y={68} fill="var(--danger)" fontSize="20" fontWeight="900">blurry after upload</text>}
      <circle cx={314} cy={98} r={22} fill="var(--card)" stroke="var(--danger)" strokeWidth={4} />
      <text x={308} y={107} fill="var(--danger)" fontSize="26" fontWeight="950">!</text>

      {/* Right panel: sharp 300 DPI */}
      <rect x={466} y={88} width={266} height={288} rx={20} fill="var(--card)" stroke="var(--success)" strokeWidth={3} />
      <rect x={486} y={114} width={226} height={164} rx={10} fill="color-mix(in srgb, var(--primary) 16%, transparent)" />
      <path d="M490 236c50-65 100-35 152 12" stroke="var(--primary)" strokeWidth={4} strokeLinecap="round" />
      <circle cx={556} cy={168} r={30} fill="color-mix(in srgb, var(--primary) 24%, transparent)" stroke="var(--primary)" strokeWidth={2.5} />
      <path d="M618 138l20-20" stroke="var(--primary)" strokeWidth={3} strokeLinecap="round" opacity=".6" />
      <rect x={494} y={294} width={178} height={12} rx={3} fill="var(--foreground)" opacity=".86" />
      <rect x={506} y={320} width={134} height={10} rx={3} fill="var(--foreground)" opacity=".65" />
      {!compact && <text x={468} y={68} fill="var(--success)" fontSize="20" fontWeight="900">sharp: 300 DPI</text>}

      {/* Comparison label strip */}
      <path d="M68 404h700" stroke="var(--primary)" strokeWidth={3} opacity=".35" />
      <text x={134} y={430} fill="var(--muted-foreground)" fontSize="14" fontWeight="800">low resolution</text>
      <text x={518} y={430} fill="var(--muted-foreground)" fontSize="14" fontWeight="800">print-ready quality</text>
    </g>
  );
}

function FileMismatchVisual({ compact = false }: { compact?: boolean }) {
  return (
    <g transform={compact ? 'translate(0 22)' : undefined}>
      {/* Interior page — left */}
      <rect x="68" y="88" width="196" height="266" rx="16" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <rect x="88" y="112" width="156" height="11" rx="3" fill="var(--foreground)" opacity=".18" />
      <rect x="88" y="131" width="136" height="9" rx="3" fill="var(--foreground)" opacity=".12" />
      <rect x="88" y="148" width="148" height="9" rx="3" fill="var(--foreground)" opacity=".12" />
      <rect x="88" y="165" width="126" height="9" rx="3" fill="var(--foreground)" opacity=".12" />
      <rect x="88" y="210" width="156" height="34" rx="9" fill="color-mix(in srgb, var(--primary) 12%, transparent)" stroke="var(--primary)" strokeWidth="2" strokeDasharray="6 6" />
      <text x="166" y="233" textAnchor="middle" fill="var(--primary)" fontSize="13" fontWeight="850">trim: 6 × 9 in</text>
      <text x="166" y="302" textAnchor="middle" fill="var(--muted-foreground)" fontSize="12" fontWeight="750">200 pages · cream</text>
      {!compact && <text x="100" y="76" fill="var(--foreground)" fontSize="16" fontWeight="850">interior file</text>}
      {/* Warning circle center */}
      <circle cx="400" cy="222" r="40" fill="var(--card)" stroke="var(--danger)" strokeWidth="4" />
      <circle cx="400" cy="222" r="31" fill="color-mix(in srgb, var(--danger) 13%, transparent)" />
      <rect x="396" y="204" width="8" height="22" rx="4" fill="var(--danger)" />
      <circle cx="400" cy="237" r="5" fill="var(--danger)" />
      <text x="400" y="278" textAnchor="middle" fill="var(--danger)" fontSize="13" fontWeight="850">mismatch</text>
      <path d="M264 222h100" stroke="var(--danger)" strokeWidth="3" strokeDasharray="7 7" opacity=".55" />
      <path d="M440 222h82" stroke="var(--danger)" strokeWidth="3" strokeDasharray="7 7" opacity=".55" />
      {/* Cover file — right, full wrap */}
      <rect x="522" y="122" width="250" height="176" rx="14" fill="var(--card)" stroke="var(--danger)" strokeWidth="3" />
      <path d="M536 122h80v176h-80a14 14 0 0 1-14-14v-148a14 14 0 0 1 14-14z" fill="color-mix(in srgb, var(--muted) 56%, transparent)" />
      <rect x="616" y="122" width="36" height="176" fill="color-mix(in srgb, var(--danger) 18%, transparent)" />
      <path d="M616 122v176M652 122v176" stroke="var(--danger)" strokeWidth="2" />
      <path d="M652 122h106a14 14 0 0 1 14 14v148a14 14 0 0 1-14 14h-106z" fill="color-mix(in srgb, var(--surface) 80%, transparent)" />
      <text x="560" y="218" textAnchor="middle" fill="var(--foreground)" fontSize="13" fontWeight="800">back</text>
      <text x="634" y="218" textAnchor="middle" fill="var(--danger)" fontSize="12" fontWeight="850">spine</text>
      <text x="704" y="218" textAnchor="middle" fill="var(--foreground)" fontSize="13" fontWeight="800">front</text>
      {!compact && (
        <>
          <text x="522" y="110" fill="var(--danger)" fontSize="15" fontWeight="850">wrong trim size</text>
          <text x="562" y="318" textAnchor="middle" fill="var(--foreground)" fontSize="16" fontWeight="850">cover file</text>
        </>
      )}
    </g>
  );
}

function ForgotBleedVisual({ compact = false }: { compact?: boolean }) {
  return (
    <g transform={compact ? 'translate(0 26)' : undefined}>
      <rect x="78" y="98" width="260" height="250" rx="20" fill="color-mix(in srgb, var(--success) 9%, transparent)" stroke="var(--success)" strokeWidth="3" />
      <rect x="98" y="118" width="220" height="210" rx="16" fill="color-mix(in srgb, var(--primary) 15%, transparent)" stroke="var(--primary)" strokeWidth="3" />
      <rect x="138" y="160" width="140" height="102" rx="12" fill="var(--card)" opacity=".72" />
      <text x="208" y="224" textAnchor="middle" fill="var(--success)" fontSize="22" fontWeight="950">bleed on</text>
      <text x="208" y="376" textAnchor="middle" fill="var(--success)" fontSize="15" fontWeight="850">art extends past trim</text>

      <path d="M374 222h58" stroke="var(--border)" strokeWidth="4" strokeDasharray="8 8" />
      <circle cx="403" cy="222" r="26" fill="var(--card)" stroke="var(--primary)" strokeWidth="3" />
      <path d="M392 222h22" stroke="var(--primary)" strokeWidth="4" />

      <rect x="474" y="98" width="260" height="250" rx="20" fill="var(--card)" stroke="var(--danger)" strokeWidth="3" />
      <rect x="512" y="118" width="202" height="210" rx="14" fill="color-mix(in srgb, var(--primary) 15%, transparent)" />
      <rect x="492" y="118" width="20" height="210" rx="4" fill="var(--card)" stroke="var(--danger)" strokeWidth="2" />
      <rect x="544" y="160" width="130" height="102" rx="12" fill="var(--card)" opacity=".72" />
      <text x="609" y="224" textAnchor="middle" fill="var(--danger)" fontSize="22" fontWeight="950">missing</text>
      <text x="609" y="376" textAnchor="middle" fill="var(--danger)" fontSize="15" fontWeight="850">white edge after trim</text>
      {!compact && (
        <text x="172" y="68" fill="var(--foreground)" fontSize="22" fontWeight="900">forgot bleed on KDP</text>
      )}
    </g>
  );
}

function ColorShiftVisual({ compact = false }: { compact?: boolean }) {
  return (
    <g transform={compact ? 'translate(0 18)' : undefined}>
      {/* Left panel — vivid screen */}
      <rect x="88" y="84" width="258" height="250" rx="20" fill="var(--card)" stroke="var(--primary)" strokeWidth="3" />
      {/* Top bar */}
      <rect x="88" y="84" width="258" height="36" rx="20" fill="color-mix(in srgb, var(--primary) 14%, transparent)" />
      <circle cx="108" cy="102" r="5" fill="var(--danger)" />
      <circle cx="124" cy="102" r="5" fill="color-mix(in srgb, var(--primary) 80%, var(--foreground))" />
      <circle cx="140" cy="102" r="5" fill="var(--success)" />
      {/* Vivid swatches */}
      <rect x="102" y="134" width="64" height="58" rx="9" fill="color-mix(in srgb, var(--danger) 70%, transparent)" />
      <rect x="178" y="134" width="64" height="58" rx="9" fill="color-mix(in srgb, var(--primary) 74%, transparent)" />
      <rect x="254" y="134" width="64" height="58" rx="9" fill="color-mix(in srgb, var(--success) 68%, transparent)" />
      {/* Title */}
      <rect x="102" y="206" width="230" height="40" rx="8" fill="var(--foreground)" opacity=".88" />
      <text x="217" y="232" textAnchor="middle" fill="var(--card)" fontSize="16" fontWeight="950">BOOK TITLE</text>
      <rect x="140" y="258" width="154" height="12" rx="5" fill="var(--primary)" opacity=".55" />
      {/* Screen label */}
      <rect x="130" y="356" width="116" height="28" rx="8" fill="var(--card)" stroke="var(--primary)" strokeWidth="2" />
      <text x="188" y="375" textAnchor="middle" fill="var(--primary)" fontSize="11" fontWeight="850">screen — vivid</text>

      {/* VS */}
      <circle cx="400" cy="208" r="26" fill="var(--card)" stroke="var(--border)" strokeWidth="2.5" />
      <text x="400" y="215" textAnchor="middle" fill="var(--muted-foreground)" fontSize="14" fontWeight="900">vs</text>

      {/* Right panel — muted print */}
      <rect x="454" y="84" width="258" height="250" rx="20" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <rect x="454" y="84" width="258" height="36" rx="20" fill="color-mix(in srgb, var(--muted) 45%, transparent)" />
      {/* Muted swatches */}
      <rect x="468" y="134" width="64" height="58" rx="9" fill="color-mix(in srgb, var(--danger) 22%, transparent)" />
      <rect x="544" y="134" width="64" height="58" rx="9" fill="color-mix(in srgb, var(--primary) 24%, transparent)" />
      <rect x="620" y="134" width="64" height="58" rx="9" fill="color-mix(in srgb, var(--success) 20%, transparent)" />
      {/* Title — darker / duller */}
      <rect x="468" y="206" width="230" height="40" rx="8" fill="var(--foreground)" opacity=".50" />
      <text x="583" y="232" textAnchor="middle" fill="var(--card)" fontSize="16" fontWeight="950">BOOK TITLE</text>
      <rect x="506" y="258" width="154" height="12" rx="5" fill="var(--muted-foreground)" opacity=".35" />
      {/* Warning */}
      <circle cx="688" cy="102" r="18" fill="var(--card)" stroke="var(--danger)" strokeWidth="3" />
      <text x="682" y="110" fill="var(--danger)" fontSize="20" fontWeight="950">!</text>
      {/* Print label */}
      <rect x="494" y="356" width="178" height="28" rx="8" fill="var(--card)" stroke="var(--border)" strokeWidth="2" />
      <text x="583" y="375" textAnchor="middle" fill="var(--muted-foreground)" fontSize="11" fontWeight="850">print — softer &amp; darker</text>

      {!compact && <text x="240" y="60" fill="var(--foreground)" fontSize="20" fontWeight="950">screen vs print color shift</text>}
    </g>
  );
}

function BleedVsNoBleedVisual({ compact = false }: { compact?: boolean }) {
  return (
    <g transform={compact ? 'translate(0 24)' : undefined}>
      <rect x="82" y="94" width="282" height="250" rx="22" fill="color-mix(in srgb, var(--success) 9%, transparent)" stroke="var(--success)" strokeWidth="3" strokeDasharray="9 8" />
      <rect x="112" y="124" width="222" height="190" rx="16" fill="color-mix(in srgb, var(--primary) 16%, transparent)" stroke="var(--primary)" strokeWidth="3" />
      <rect x="162" y="172" width="122" height="76" rx="12" fill="var(--card)" opacity=".74" />
      <text x="223" y="219" textAnchor="middle" fill="var(--success)" fontSize="24" fontWeight="950">bleed</text>
      <text x="223" y="374" textAnchor="middle" fill="var(--success)" fontSize="15" fontWeight="850">edge-to-edge art</text>

      <rect x="444" y="124" width="222" height="190" rx="16" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <rect x="492" y="164" width="126" height="110" rx="12" fill="color-mix(in srgb, var(--primary) 11%, transparent)" stroke="var(--primary)" strokeWidth="2.5" />
      <rect x="512" y="194" width="86" height="10" rx="3" fill="var(--foreground)" opacity=".2" />
      <rect x="526" y="220" width="58" height="8" rx="3" fill="var(--foreground)" opacity=".14" />
      <text x="555" y="219" textAnchor="middle" fill="var(--primary)" fontSize="24" fontWeight="950">no bleed</text>
      <text x="555" y="374" textAnchor="middle" fill="var(--primary)" fontSize="15" fontWeight="850">intentional margins</text>

      <path d="M386 220h36" stroke="var(--border)" strokeWidth="4" strokeDasharray="7 7" />
      {!compact && <text x="250" y="64" fill="var(--foreground)" fontSize="22" fontWeight="900">choose the right KDP setting</text>}
    </g>
  );
}

function CroppedCoverVisual({ compact = false }: { compact?: boolean }) {
  return (
    <g transform={compact ? 'translate(0 24)' : undefined}>
      <rect x="130" y="76" width="540" height="310" rx="24" fill="color-mix(in srgb, var(--danger) 8%, transparent)" stroke="var(--danger)" strokeWidth="4" strokeDasharray="10 10" />
      <rect x="178" y="118" width="444" height="226" rx="18" fill="var(--card)" stroke="var(--primary)" strokeWidth="4" />
      <rect x="224" y="154" width="352" height="154" rx="14" fill="color-mix(in srgb, var(--success) 9%, transparent)" stroke="var(--success)" strokeDasharray="8 8" strokeWidth="3" />
      <path d="M132 310c76-58 142-46 212-18 84 34 155 52 326-26v120H130Z" fill="color-mix(in srgb, var(--primary) 18%, transparent)" />
      <path d="M178 118v226M622 118v226" stroke="var(--primary)" strokeWidth="4" opacity=".75" />
      <rect x="190" y="306" width="176" height="44" rx="10" fill="color-mix(in srgb, var(--danger) 12%, var(--card))" stroke="var(--danger)" strokeWidth="3" />
      <text x="214" y="335" fill="var(--danger)" fontSize="22" fontWeight="900">TEXT CUT</text>
      <path d="M178 344h444" stroke="var(--danger)" strokeWidth="4" />
      <circle cx="622" cy="118" r="30" fill="var(--card)" stroke="var(--danger)" strokeWidth="5" />
      <text x="613" y="129" fill="var(--danger)" fontSize="34" fontWeight="950">!</text>
      {!compact && (
        <>
          <text x="170" y="56" fill="var(--foreground)" fontSize="22" fontWeight="900">bleed / trim / safe area mismatch</text>
          <text x="492" y="374" fill="var(--muted-foreground)" fontSize="16" fontWeight="800">Previewer crop simulation</text>
        </>
      )}
    </g>
  );
}

function SlowUploadVisual({ compact = false }: { compact?: boolean }) {
  return (
    <g transform={compact ? 'translate(0 18)' : undefined}>
      {/* Heavy PDF document — left */}
      <rect x="76" y="80" width="152" height="198" rx="14" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <path d="M196 80l32 32h-32Z" fill="color-mix(in srgb, var(--muted) 60%, transparent)" stroke="var(--border)" strokeWidth="2" />
      <rect x="96" y="132" width="92" height="8" rx="4" fill="var(--foreground)" opacity=".15" />
      <rect x="96" y="148" width="76" height="8" rx="4" fill="var(--foreground)" opacity=".11" />
      <rect x="96" y="164" width="86" height="8" rx="4" fill="var(--foreground)" opacity=".11" />
      <rect x="96" y="180" width="64" height="8" rx="4" fill="var(--foreground)" opacity=".11" />
      <rect x="96" y="200" width="60" height="22" rx="6" fill="color-mix(in srgb, var(--danger) 14%, transparent)" stroke="var(--danger)" strokeWidth="2" />
      <text x="126" y="216" textAnchor="middle" fill="var(--danger)" fontSize="12" fontWeight="900">PDF</text>
      {/* File size badge */}
      <rect x="76" y="296" width="152" height="34" rx="10" fill="color-mix(in srgb, var(--danger) 10%, transparent)" stroke="var(--danger)" strokeWidth="2.5" />
      <text x="152" y="319" textAnchor="middle" fill="var(--danger)" fontSize="16" fontWeight="900">320 MB</text>

      {/* Upload arrow */}
      <path d="M256 178h82" stroke="var(--border)" strokeWidth="3.5" strokeDasharray="8 6" />
      <path d="M320 161l18 17-18 17" fill="none" stroke="var(--primary)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

      {/* Progress panel — right */}
      <rect x="358" y="84" width="368" height="248" rx="18" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <text x="542" y="122" textAnchor="middle" fill="var(--foreground)" fontSize="14" fontWeight="850">KDP manuscript processing</text>
      {/* Progress bar track */}
      <rect x="382" y="140" width="320" height="18" rx="9" fill="var(--muted)" opacity=".45" />
      {/* Progress bar fill — stuck at ~76% */}
      <rect x="382" y="140" width="244" height="18" rx="9" fill="var(--primary)" opacity=".55" />
      {/* Stuck marker */}
      <circle cx="626" cy="149" r="11" fill="var(--card)" stroke="var(--danger)" strokeWidth="3" />
      <rect x="622" y="141" width="7" height="11" rx="3.5" fill="var(--danger)" />
      <circle cx="626" cy="156" r="3.5" fill="var(--danger)" />
      {/* Progress label */}
      <text x="542" y="178" textAnchor="middle" fill="var(--muted-foreground)" fontSize="12" fontWeight="750">76% · still processing…</text>
      {/* Stuck warning box */}
      <rect x="382" y="196" width="320" height="114" rx="14" fill="color-mix(in srgb, var(--danger) 7%, transparent)" stroke="var(--danger)" strokeDasharray="8 5" strokeWidth="2.5" />
      <text x="542" y="230" textAnchor="middle" fill="var(--danger)" fontSize="14" fontWeight="900">upload stuck</text>
      <text x="542" y="252" textAnchor="middle" fill="var(--muted-foreground)" fontSize="12">compress images · flatten PDF</text>
      <text x="542" y="272" textAnchor="middle" fill="var(--muted-foreground)" fontSize="12">re-export · split-test manuscript</text>
      {/* Warning circle top right */}
      <circle cx="694" cy="102" r="22" fill="var(--card)" stroke="var(--danger)" strokeWidth="3.5" />
      <rect x="690" y="88" width="8" height="17" rx="4" fill="var(--danger)" />
      <circle cx="694" cy="113" r="4.5" fill="var(--danger)" />
      {!compact && (
        <text x="168" y="62" fill="var(--foreground)" fontSize="20" fontWeight="900">KDP upload stuck processing</text>
      )}
    </g>
  );
}

function PreviewerFrozenVisual({ compact = false }: { compact?: boolean }) {
  return (
    <g transform={compact ? 'translate(0 18)' : undefined}>
      {/* Browser chrome */}
      <rect x="82" y="72" width="636" height="316" rx="18" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      {/* Browser top bar */}
      <rect x="82" y="72" width="636" height="44" rx="18" fill="color-mix(in srgb, var(--muted) 45%, transparent)" />
      <rect x="82" y="95" width="636" height="21" fill="color-mix(in srgb, var(--muted) 45%, transparent)" />
      {/* Traffic lights */}
      <circle cx="110" cy="94" r="7" fill="var(--danger)" opacity=".65" />
      <circle cx="130" cy="94" r="7" fill="color-mix(in srgb, var(--primary) 75%, transparent)" opacity=".65" />
      <circle cx="150" cy="94" r="7" fill="var(--success)" opacity=".65" />
      {/* URL bar */}
      <rect x="198" y="82" width="424" height="24" rx="7" fill="var(--card)" stroke="var(--border)" strokeWidth="1.5" />
      <text x="410" y="98" textAnchor="middle" fill="var(--muted-foreground)" fontSize="11">kdp.amazon.com · launching preview…</text>
      {/* KDP content area */}
      <rect x="98" y="132" width="604" height="240" rx="10" fill="color-mix(in srgb, var(--muted) 15%, transparent)" />
      {/* Launch Preview button — greyed out */}
      <rect x="312" y="144" width="176" height="36" rx="10" fill="color-mix(in srgb, var(--muted) 50%, transparent)" stroke="var(--border)" strokeWidth="2" />
      <text x="400" y="167" textAnchor="middle" fill="var(--muted-foreground)" fontSize="14" fontWeight="800">Launch Preview</text>
      {/* Preview pane */}
      <rect x="172" y="194" width="456" height="162" rx="14" fill="var(--card)" stroke="var(--border)" strokeWidth="2.5" />
      {/* Spinner track */}
      <circle cx="400" cy="252" r="42" fill="none" stroke="var(--muted)" strokeWidth="7" opacity=".4" />
      {/* Spinner arc — 3/4 clockwise from 12 to 9 o'clock */}
      <path d="M400 210 a42 42 0 1 1 -42 42" fill="none" stroke="var(--primary)" strokeWidth="7" strokeLinecap="round" opacity=".7" />
      {/* Frozen label */}
      <rect x="312" y="320" width="176" height="26" rx="8" fill="color-mix(in srgb, var(--danger) 10%, transparent)" stroke="var(--danger)" strokeWidth="2" />
      <text x="400" y="337" textAnchor="middle" fill="var(--danger)" fontSize="12" fontWeight="850">Preview not loading</text>
      {/* Warning badge */}
      <circle cx="676" cy="152" r="22" fill="var(--card)" stroke="var(--danger)" strokeWidth="3.5" />
      <rect x="672" y="138" width="8" height="17" rx="4" fill="var(--danger)" />
      <circle cx="676" cy="162" r="4.5" fill="var(--danger)" />
      {!compact && (
        <text x="192" y="54" fill="var(--foreground)" fontSize="20" fontWeight="900">KDP Previewer frozen</text>
      )}
    </g>
  );
}

function SafeAreaFixVisual({ compact = false }: Readonly<{ compact?: boolean }>) {
  const dy = compact ? 18 : 0;
  // Cover: x=130, y=72, w=540, h=306
  const cx = 130, cy = 72 + dy, cw = 540, ch = 306;
  // Safe zone inset 52px
  const sx = cx + 52, sy = cy + 52, sw = cw - 104, sh = ch - 104;

  return (
    <g>
      {/* Cover background */}
      <rect x={cx} y={cy} width={cw} height={ch} rx="6"
        fill="color-mix(in srgb, var(--primary) 8%, var(--card))" stroke="var(--border)" strokeWidth="2" />

      {/* Safe zone boundary */}
      <rect x={sx} y={sy} width={sw} height={sh} rx="12"
        fill="color-mix(in srgb, var(--success) 7%, transparent)"
        stroke="var(--success)" strokeWidth="2" strokeDasharray="7 4" />

      {/* Unsafe subtitle — below safe zone bottom edge */}
      <rect x={cx + 90} y={cy + ch - 34} width={360} height={22} rx="5"
        fill="color-mix(in srgb, var(--danger) 14%, var(--card))"
        stroke="var(--danger)" strokeWidth="1.5" />
      <text x={cx + cw / 2} y={cy + ch - 19} textAnchor="middle" dominantBaseline="middle"
        fill="var(--danger)" fontSize="12" fontWeight="850">Subtitle — too close to trim edge</text>

      {/* Warning badge on subtitle */}
      <circle cx={cx + 74} cy={cy + ch - 23} r="14"
        fill="var(--card)" stroke="var(--danger)" strokeWidth="2.5" />
      <text x={cx + 74} y={cy + ch - 23} textAnchor="middle" dominantBaseline="central"
        fill="var(--danger)" fontSize="13" fontWeight="950">!</text>

      {/* Safe title inside safe zone */}
      <rect x={sx + 36} y={sy + 36} width={sw - 72} height={30} rx="6"
        fill="var(--foreground)" opacity=".8" />
      <text x={cx + cw / 2} y={sy + 57} textAnchor="middle" dominantBaseline="middle"
        fill="var(--card)" fontSize="14" fontWeight="950">BOOK TITLE</text>

      {/* Author — inside safe zone, comfortable spacing */}
      <text x={cx + cw / 2} y={sy + sh - 28} textAnchor="middle" dominantBaseline="middle"
        fill="var(--muted-foreground)" fontSize="12">Author Name</text>
      <circle cx={cx + cw / 2 + 90} cy={sy + sh - 28} r="11"
        fill="color-mix(in srgb, var(--success) 12%, var(--card))" stroke="var(--success)" strokeWidth="2" />
      <text x={cx + cw / 2 + 90} y={sy + sh - 28} textAnchor="middle" dominantBaseline="central"
        fill="var(--success)" fontSize="11" fontWeight="950">✓</text>

      {/* Safe area label */}
      <text x={sx + 8} y={sy + 16} fill="var(--success)" fontSize="11" fontWeight="850">safe area</text>

      {!compact && (
        <text x={cx + 16} y={cy - 14} fill="var(--foreground)" fontSize="20" fontWeight="900">
          text outside safe area — fix before upload
        </text>
      )}
    </g>
  );
}

function WhiteLinesVisual({ compact = false }: { compact?: boolean }) {
  const dy = compact ? 22 : 0;

  // Intended trim dimensions
  const bx = 110, by = 100 + dy, bw = 400, bh = 240;
  const bleed = 18;
  
  // Trim shift
  const shift = 14;

  // Physical paper (cut result)
  const cutX = bx + shift, cutY = by, cutW = bw, cutH = bh;

  // Printed background (stops at intended trim)
  const bgX = bx, bgY = by, bgW = bw, bgH = bh;

  return (
    <g>
      {/* 1. PHYSICAL PAPER AND PRINTED BACKGROUND */}
      {/* Physical Paper */}
      <rect x={cutX} y={cutY} width={cutW} height={cutH} rx={2}
        fill="var(--card)" stroke="var(--border)" strokeWidth={2} 
        style={{ filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.08))' }} />

      {/* Background printed on the paper */}
      <rect x={cutX} y={cutY} width={bgX + bgW - cutX} height={bgH} rx={1}
        fill="color-mix(in srgb, var(--foreground) 85%, var(--card))" />

      {/* Spine fold lines for realism */}
      <path d={`M ${cutX + cutW/2 - 24} ${cutY} v ${cutH} M ${cutX + cutW/2 + 24} ${cutY} v ${cutH}`} 
        stroke="var(--card)" strokeWidth={2} opacity={0.15} />
      
      <text x={cutX + cutW/2} y={cutY + cutH/2} textAnchor="middle" transform={`rotate(-90 ${cutX + cutW/2} ${cutY + cutH/2})`}
        fill="var(--card)" fontSize={12} fontWeight={800} opacity={0.5}>SPINE</text>

      {/* Front cover content */}
      <rect x={cutX + cutW * 0.75 - 70} y={cutY + 40} width={140} height={130} rx={8}
        fill="var(--card)" opacity={0.05} stroke="var(--card)" strokeWidth={2} strokeDasharray="4 4" />
      <text x={cutX + cutW * 0.75} y={cutY + 80} textAnchor="middle" 
        fill="var(--card)" fontSize={18} fontWeight={950} opacity={0.95}>BOOK TITLE</text>
      <rect x={cutX + cutW * 0.75 - 40} y={cutY + 100} width={80} height={6} rx={3} fill="var(--card)" opacity={0.6} />
      <rect x={cutX + cutW * 0.75 - 60} y={cutY + 115} width={120} height={6} rx={3} fill="var(--card)" opacity={0.4} />

      {/* 2. BOUNDARY LINES */}
      {/* Bleed boundary */}
      <rect x={bx - bleed} y={by - bleed} width={bw + bleed * 2} height={bh + bleed * 2} rx={6}
        fill="color-mix(in srgb, var(--danger) 4%, transparent)"
        stroke="var(--danger)" strokeDasharray="6 6" strokeWidth={2.5} />
      
      {/* Intended Trim line */}
      <rect x={bx} y={by} width={bw} height={bh}
        fill="none" stroke="var(--primary)" strokeDasharray="4 4" strokeWidth={2.5} opacity={0.8} />

      {/* 3. LABELS */}
      {/* Label for required bleed */}
      <rect x={bx - bleed + 8} y={by - bleed + 8} width={100} height={24} rx={6}
        fill="var(--card)" stroke="var(--danger)" strokeWidth={2} />
      <text x={bx - bleed + 58} y={by - bleed + 24} textAnchor="middle" 
        fill="var(--danger)" fontSize={11} fontWeight={850}>required bleed</text>

      {/* Label for intended trim */}
      <rect x={bx + 8} y={by + 16} width={100} height={24} rx={6}
        fill="var(--card)" stroke="var(--primary)" strokeWidth={2} opacity={0.9} />
      <text x={bx + 58} y={by + 32} textAnchor="middle" 
        fill="var(--primary)" fontSize={11} fontWeight={850}>intended trim</text>

      {/* Right side labels */}
      {/* 1. White Line gap */}
      <path d={`M ${cutX + cutW + 30} ${cutY + 60} L ${cutX + cutW - 4} ${cutY + 60}`} 
        stroke="var(--danger)" strokeWidth={2.5} />
      <circle cx={cutX + cutW - 4} cy={cutY + 60} r={4} fill="var(--danger)" />
        
      <rect x={cutX + cutW + 30} y={cutY + 35} width={180} height={50} rx={10}
        fill="color-mix(in srgb, var(--danger) 8%, var(--card))" stroke="var(--danger)" strokeWidth={2} />
      <text x={cutX + cutW + 120} y={cutY + 54} textAnchor="middle" fill="var(--danger)" fontSize={13} fontWeight={900}>WHITE LINE</text>
      <text x={cutX + cutW + 120} y={cutY + 72} textAnchor="middle" fill="var(--danger)" fontSize={11} fontWeight={750}>exposed unprinted paper</text>

      {/* 2. Background stopped at trim */}
      <path d={`M ${bx + bw + 30} ${cutY + 140} L ${bx + bw + 2} ${cutY + 140}`} 
        stroke="var(--primary)" strokeWidth={2.5} />
      <circle cx={bx + bw + 2} cy={cutY + 140} r={4} fill="var(--primary)" />

      <rect x={bx + bw + 30} y={cutY + 115} width={180} height={50} rx={10}
        fill="var(--card)" stroke="var(--primary)" strokeWidth={2} />
      <text x={bx + bw + 120} y={cutY + 134} textAnchor="middle" fill="var(--primary)" fontSize={13} fontWeight={900}>BACKGROUND STOPPED</text>
      <text x={bx + bw + 120} y={cutY + 152} textAnchor="middle" fill="var(--primary)" fontSize={11} fontWeight={750}>did not extend into bleed</text>

      {!compact && (
        <>
          <text x={400} y={by - 26} textAnchor="middle"
            fill="var(--foreground)" fontSize={22} fontWeight={950}>
            Why white lines appear on printed covers
          </text>
          
          <rect x={120} y={by + bh + 30} width={560} height={36} rx={12}
            fill="color-mix(in srgb, var(--danger) 10%, var(--card))" stroke="var(--danger)" strokeWidth={2} opacity={0.8} />
          <text x={400} y={by + bh + 53} textAnchor="middle"
            fill="var(--danger)" fontSize={14} fontWeight={850}>
            trim shifts outward → cut misses background → blank paper exposed
          </text>
        </>
      )}
    </g>
  );
}
