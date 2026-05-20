import type React from 'react';
import { Label, MutedLabel, BarcodeBox, CoverPageFrame, StatusBadge } from './shared';

export function PrintableAreaError() {
  return (
    <g>
      <rect x="255" y="48" width="290" height="350" rx="18" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <rect x="292" y="86" width="216" height="274" rx="10" fill="color-mix(in srgb, var(--success) 8%, transparent)" stroke="var(--success)" strokeDasharray="8 8" strokeWidth="3" />
      <rect x="236" y="126" width="170" height="38" rx="8" fill="color-mix(in srgb, var(--danger) 12%, transparent)" stroke="var(--danger)" strokeWidth="3" />
      <circle cx="548" cy="314" r="32" fill="color-mix(in srgb, var(--danger) 14%, transparent)" stroke="var(--danger)" strokeWidth="3" />
      <text x="284" y="151" fill="var(--danger)" fontSize="18" fontWeight="800">TITLE</text>
      <text x="540" y="322" fill="var(--danger)" fontSize="22" fontWeight="900">!</text>
      <Label x={258} y={35}>printable area warning</Label>
      <MutedLabel x={315} y={382}>move important elements inward</MutedLabel>
    </g>
  );
}


export function ChecklistDiagram() {
  const rows = ['Dimensions match setup', 'Bleed included', 'Text inside safe area', 'Spine recalculated', 'PDF exported cleanly'];
  return (
    <g>
      <rect x="170" y="65" width="460" height="312" rx="22" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <rect x="170" y="65" width="460" height="56" rx="22" fill="color-mix(in srgb, var(--primary) 15%, transparent)" />
      <Label x={206} y={102}>KDP cover preflight</Label>
      {rows.map((row, index) => (
        <g key={row} transform={`translate(206 ${150 + index * 40})`}>
          <circle cx="10" cy="0" r="11" fill="color-mix(in srgb, var(--success) 15%, transparent)" stroke="var(--success)" strokeWidth="3" />
          <path d="M4 -1l5 5 9 -12" fill="none" stroke="var(--success)" strokeWidth="3" />
          <text x="34" y="6" fill="var(--foreground)" fontSize="17" fontWeight="700">{row}</text>
        </g>
      ))}
    </g>
  );
}


export function SpineWidth() {
  return (
    <g>
      <rect x="100" y="112" width="600" height="230" rx="18" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <path d="M118 112h247v230H118a18 18 0 0 1-18-18V130a18 18 0 0 1 18-18Z" fill="color-mix(in srgb, var(--muted) 65%, transparent)" />
      <rect x="365" y="112" width="70" height="230" fill="color-mix(in srgb, var(--primary) 22%, transparent)" />
      <path d="M435 112h247a18 18 0 0 1 18 18v194a18 18 0 0 1-18 18H435Z" fill="var(--card)" />
      <path d="M365 112v230M435 112v230M365 112h70M365 342h70" stroke="var(--primary)" strokeWidth="3" strokeLinecap="square" />
      <Label x={180} y={232}>back</Label>
      <Label x={379} y={232}>spine</Label>
      <Label x={530} y={232}>front</Label>
      <path d="M365 372h70" stroke="var(--primary)" strokeWidth="3" />
      <MutedLabel x={330} y={402}>page count x paper type</MutedLabel>
    </g>
  );
}


export function SafeArea() {
  return (
    <g>
      <rect x="260" y="55" width="280" height="340" rx="18" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <rect x="312" y="108" width="176" height="234" rx="12" fill="color-mix(in srgb, var(--success) 10%, transparent)" stroke="var(--success)" strokeDasharray="8 8" strokeWidth="3" />
      <rect x="332" y="152" width="136" height="28" rx="8" fill="var(--foreground)" opacity=".16" />
      <rect x="340" y="205" width="120" height="16" rx="8" fill="var(--primary)" opacity=".55" />
      <rect x="350" y="310" width="100" height="18" rx="7" fill="var(--foreground)" opacity=".12" />
      <Label x={330} y={95}>safe area</Label>
      <MutedLabel x={560} y={205}>text stays inside</MutedLabel>
    </g>
  );
}


export function PdfChecklist() {
  const items = ['Correct size', 'Bleed included', 'Fonts embedded', 'Images sharp'];
  return (
    <g>
      <rect x="210" y="58" width="380" height="330" rx="20" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <rect x="250" y="30" width="160" height="56" rx="12" fill="color-mix(in srgb, var(--primary) 15%, transparent)" stroke="var(--primary)" strokeWidth="3" />
      <Label x={287} y={66}>PDF</Label>
      {items.map((item, index) => (
        <g key={item} transform={`translate(270 ${140 + index * 48})`}>
          <rect x="0" y="-18" width="260" height="34" rx="10" fill="color-mix(in srgb, var(--muted) 65%, transparent)" stroke="var(--border)" />
          <circle cx="22" cy="0" r="10" fill="color-mix(in srgb, var(--success) 14%, transparent)" stroke="var(--success)" strokeWidth="2" />
          <text x="48" y="6" fill="var(--foreground)" fontSize="16" fontWeight="750">{item}</text>
        </g>
      ))}
    </g>
  );
}


export function CanvaFlow() {
  const steps = ['Custom size', 'Show bleed', 'PDF Print', 'Validate'];
  return (
    <g>
      {steps.map((step, index) => {
        const x = 80 + index * 175;
        return (
          <g key={step}>
            <rect x={x} y="170" width="130" height="86" rx="16" fill="var(--card)" stroke={index === 3 ? 'var(--success)' : 'var(--primary)'} strokeWidth="3" />
            <text x={x + 65} y="218" textAnchor="middle" fill="var(--foreground)" fontSize="15" fontWeight="800">{step}</text>
            {index < steps.length - 1 ? <path d={`M${x + 138} 213h42`} stroke="var(--primary)" strokeWidth="3" strokeDasharray="7 7" /> : null}
          </g>
        );
      })}
      <Label x={270} y={125}>Canva export flow</Label>
    </g>
  );
}


export function PhotoshopGuides() {
  return (
    <g>
      <rect x="110" y="72" width="580" height="306" rx="18" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <rect x="138" y="100" width="524" height="250" rx="12" fill="transparent" stroke="var(--danger)" strokeDasharray="8 8" strokeWidth="3" />
      <rect x="172" y="134" width="456" height="182" rx="8" fill="color-mix(in srgb, var(--success) 8%, transparent)" stroke="var(--success)" strokeDasharray="7 7" strokeWidth="3" />
      <rect x="382" y="100" width="44" height="250" fill="color-mix(in srgb, var(--primary) 18%, transparent)" stroke="var(--primary)" strokeWidth="3" />
      <Label x={142} y={58}>Photoshop guide layout</Label>
      <MutedLabel x={145} y={402}>bleed / trim / spine / safe area</MutedLabel>
    </g>
  );
}


export function TrimComparison() {
  return (
    <g>
      <rect x="145" y="150" width="135" height="205" rx="14" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <rect x="335" y="118" width="155" height="237" rx="14" fill="var(--card)" stroke="var(--primary)" strokeWidth="3" />
      <rect x="545" y="82" width="170" height="273" rx="14" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <Label x={172} y={390}>5x8</Label>
      <Label x={372} y={390}>6x9</Label>
      <Label x={570} y={390}>8.5x11</Label>
      <MutedLabel x={250} y={70}>trim size changes the cover math</MutedLabel>
    </g>
  );
}


export function CoverAnatomy() {
  return (
    <g>
      <text x={400} y={48} textAnchor="middle" fill="var(--foreground)" fontSize={22} fontWeight={950}>Full KDP cover anatomy</text>

      {/* Bleed boundary */}
      <rect
        x={72}
        y={86}
        width={656}
        height={266}
        rx={28}
        fill="color-mix(in srgb, var(--danger) 5%, transparent)"
        stroke="var(--danger)"
        strokeWidth={2.5}
        strokeDasharray="10 10"
        opacity={0.9}
      />

      {/* Trimmed cover */}
      <rect x={104} y={118} width={592} height={202} rx={22} fill="var(--card)" stroke="var(--border)" strokeWidth={2.5} />
      <path d="M126 118h238v202H126a22 22 0 0 1-22-22V140a22 22 0 0 1 22-22Z" fill="color-mix(in srgb, var(--muted) 58%, transparent)" />
      <rect x={364} y={118} width={72} height={202} fill="color-mix(in srgb, var(--primary) 18%, transparent)" stroke="color-mix(in srgb, var(--primary) 74%, var(--border))" strokeWidth={2.5} />
      <path d="M436 118h238a22 22 0 0 1 22 22v158a22 22 0 0 1-22 22H436Z" fill="color-mix(in srgb, var(--card) 92%, transparent)" />

      {/* Fold lines */}
      <path d="M364 118v202M436 118v202" stroke="color-mix(in srgb, var(--primary) 72%, var(--border))" strokeWidth={2} strokeDasharray="7 7" />

      {/* Safe areas */}
      <rect x={132} y={148} width={204} height={142} rx={14} fill="color-mix(in srgb, var(--success) 8%, transparent)" stroke="var(--success)" strokeDasharray="8 8" strokeWidth={2.5} />
      <rect x={464} y={148} width={204} height={142} rx={14} fill="color-mix(in srgb, var(--success) 8%, transparent)" stroke="var(--success)" strokeDasharray="8 8" strokeWidth={2.5} />
      <rect x={378} y={150} width={44} height={138} rx={12} fill="color-mix(in srgb, var(--success) 7%, transparent)" stroke="var(--success)" strokeDasharray="6 7" strokeWidth={2.2} />

      {/* Panel labels */}
      <rect x={194} y={206} width={80} height={36} rx={12} fill="var(--card)" stroke="var(--border)" strokeWidth={1.5} />
      <text x={234} y={230} textAnchor="middle" fill="var(--foreground)" fontSize={18} fontWeight={900}>back</text>
      <rect x={366} y={206} width={68} height={36} rx={12} fill="var(--card)" stroke="color-mix(in srgb, var(--primary) 55%, var(--border))" strokeWidth={1.5} />
      <text x={400} y={230} textAnchor="middle" fill="var(--primary)" fontSize={17} fontWeight={950}>spine</text>
      <rect x={526} y={206} width={80} height={36} rx={12} fill="var(--card)" stroke="var(--border)" strokeWidth={1.5} />
      <text x={566} y={230} textAnchor="middle" fill="var(--foreground)" fontSize={18} fontWeight={900}>front</text>

      {/* Legend */}
      <g transform="translate(112 374)">
        <rect x={0} y={0} width={576} height={44} rx={14} fill="var(--card)" stroke="var(--border)" strokeWidth={1.8} />
        <line x1={24} y1={22} x2={64} y2={22} stroke="var(--danger)" strokeWidth={2.5} strokeDasharray="8 7" />
        <text x={76} y={27} fill="var(--muted-foreground)" fontSize={13} fontWeight={800}>bleed edge</text>
        <line x1={202} y1={22} x2={242} y2={22} stroke="var(--border)" strokeWidth={3} />
        <text x={254} y={27} fill="var(--muted-foreground)" fontSize={13} fontWeight={800}>trimmed cover</text>
        <line x1={404} y1={22} x2={444} y2={22} stroke="var(--success)" strokeWidth={2.5} strokeDasharray="8 7" />
        <text x={456} y={27} fill="var(--muted-foreground)" fontSize={13} fontWeight={800}>safe area</text>
      </g>
    </g>
  );
}


export function HardcoverLayout() {
  return (
    <g>
      <rect x="80" y="82" width="640" height="285" rx="18" fill="color-mix(in srgb, var(--danger) 8%, transparent)" stroke="var(--danger)" strokeDasharray="8 8" strokeWidth="3" />
      <rect x="122" y="112" width="556" height="225" rx="14" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <rect x="122" y="112" width="235" height="225" rx="14" fill="color-mix(in srgb, var(--muted) 68%, transparent)" />
      <rect x="357" y="112" width="30" height="225" fill="color-mix(in srgb, var(--warning) 16%, transparent)" stroke="var(--warning)" strokeDasharray="6 6" strokeWidth="2" />
      <rect x="387" y="112" width="48" height="225" fill="color-mix(in srgb, var(--primary) 22%, transparent)" stroke="var(--primary)" strokeWidth="3" />
      <rect x="435" y="112" width="30" height="225" fill="color-mix(in srgb, var(--warning) 16%, transparent)" stroke="var(--warning)" strokeDasharray="6 6" strokeWidth="2" />
      <Label x={170} y={228}>back board</Label>
      <Label x={390} y={228}>spine</Label>
      <Label x={505} y={228}>front board</Label>
      <MutedLabel x={330} y={384}>wrap + hinge zones</MutedLabel>
    </g>
  );
}


export function BarcodeZoneWrap() {
  return (
    <g>
      <rect x="95" y="88" width="610" height="270" rx="18" fill="color-mix(in srgb, var(--danger) 7%, transparent)" stroke="var(--danger)" strokeDasharray="8 8" strokeWidth="3" />
      <rect x="120" y="113" width="560" height="220" rx="14" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <path d="M134 113h226v220H134a14 14 0 0 1-14-14V127a14 14 0 0 1 14-14Z" fill="color-mix(in srgb, var(--muted) 70%, transparent)" />
      <rect x="360" y="113" width="70" height="220" fill="color-mix(in srgb, var(--primary) 18%, transparent)" />
      <path d="M430 113h236a14 14 0 0 1 14 14v192a14 14 0 0 1-14 14H430Z" fill="var(--card)" />
      <path d="M360 113v220M430 113v220" stroke="var(--primary)" strokeWidth="3" />
      <rect x="245" y="246" width="102" height="72" rx="10" fill="color-mix(in srgb, var(--danger) 13%, transparent)" stroke="var(--danger)" strokeDasharray="7 7" strokeWidth="3" />
      <BarcodeBox x={252} y={253} />
      <rect x="150" y="143" width="165" height="24" rx="8" fill="var(--foreground)" opacity=".12" />
      <rect x="150" y="184" width="155" height="16" rx="8" fill="var(--foreground)" opacity=".1" />
      <rect x="456" y="152" width="150" height="116" rx="14" fill="color-mix(in srgb, var(--primary) 10%, transparent)" stroke="var(--primary)" strokeDasharray="7 7" strokeWidth="3" />
      <Label x={185} y={224}>back</Label>
      <Label x={374} y={224}>spine</Label>
      <Label x={520} y={224}>front</Label>
      <MutedLabel x={245} y={373}>bleed</MutedLabel>
      <MutedLabel x={270} y={237}>barcode area</MutedLabel>
      <MutedLabel x={465} y={293}>safe content area</MutedLabel>
    </g>
  );
}


export function BarcodeWrongCorrect() {
  return (
    <g>
      <Label x={135} y={60}>wrong</Label>
      <Label x={500} y={60}>correct</Label>
      <rect x="105" y="92" width="245" height="290" rx="18" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <rect x="135" y="130" width="152" height="26" rx="8" fill="var(--foreground)" opacity=".14" />
      <text x="136" y="262" fill="var(--danger)" fontSize="17" fontWeight="850">website + logo</text>
      <path d="M230 266l28 22" stroke="var(--danger)" strokeWidth="3" strokeDasharray="6 6" strokeLinecap="round" />
      <rect x="214" y="286" width="100" height="64" rx="10" fill="color-mix(in srgb, var(--danger) 12%, transparent)" stroke="var(--danger)" strokeDasharray="7 7" strokeWidth="3" />
      <BarcodeBox x={222} y={294} />
      <circle cx="330" cy="278" r="21" fill="var(--card)" stroke="var(--danger)" strokeWidth="4" />
      <circle cx="330" cy="278" r="16" fill="color-mix(in srgb, var(--danger) 10%, transparent)" />
      <text x="324" y="287" fill="var(--danger)" fontSize="27" fontWeight="950">!</text>

      <rect x="450" y="92" width="245" height="290" rx="18" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <rect x="480" y="130" width="152" height="26" rx="8" fill="var(--foreground)" opacity=".14" />
      <text x="488" y="248" fill="var(--foreground)" fontSize="17" fontWeight="850">website + logo</text>
      <rect x="558" y="286" width="100" height="64" rx="10" fill="color-mix(in srgb, var(--success) 10%, transparent)" stroke="var(--success)" strokeDasharray="7 7" strokeWidth="3" />
      <BarcodeBox x={566} y={294} warning={false} />
      <MutedLabel x={116} y={410}>text overlaps barcode box</MutedLabel>
      <MutedLabel x={472} y={410}>content moved upward</MutedLabel>
    </g>
  );
}


export function CanvaBarcodeLayout() {
  return (
    <g>
      <rect x="95" y="70" width="610" height="315" rx="22" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <rect x="95" y="70" width="610" height="48" rx="22" fill="color-mix(in srgb, var(--primary) 13%, transparent)" />
      <Label x={128} y={102}>Canva document with locked KDP template layer</Label>
      <rect x="132" y="145" width="250" height="190" rx="16" fill="color-mix(in srgb, var(--danger) 8%, transparent)" stroke="var(--danger)" strokeWidth="3" />
      <rect x="162" y="178" width="118" height="22" rx="8" fill="var(--foreground)" opacity=".14" />
      <text x="168" y="286" fill="var(--danger)" fontSize="16" fontWeight="850">CTA too low</text>
      <rect x="265" y="270" width="88" height="58" rx="8" fill="transparent" stroke="var(--danger)" strokeDasharray="7 7" strokeWidth="3" />
      <BarcodeBox x={268} y={273} />
      <rect x="420" y="145" width="250" height="190" rx="16" fill="color-mix(in srgb, var(--success) 8%, transparent)" stroke="var(--success)" strokeWidth="3" />
      <rect x="450" y="178" width="118" height="22" rx="8" fill="var(--foreground)" opacity=".14" />
      <text x="456" y="245" fill="var(--success)" fontSize="16" fontWeight="850">CTA moved up</text>
      <rect x="553" y="270" width="88" height="58" rx="8" fill="transparent" stroke="var(--success)" strokeDasharray="7 7" strokeWidth="3" />
      <BarcodeBox x={556} y={273} warning={false} />
      <MutedLabel x={176} y={360}>guide visible but ignored</MutedLabel>
      <MutedLabel x={452} y={360}>guide locked and respected</MutedLabel>
    </g>
  );
}


export function BackCoverComposition() {
  return (
    <g>
      <rect x="265" y="52" width="270" height="350" rx="22" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <rect x="300" y="92" width="160" height="30" rx="9" fill="var(--foreground)" opacity=".16" />
      <rect x="308" y="150" width="184" height="92" rx="14" fill="color-mix(in srgb, var(--primary) 10%, transparent)" stroke="var(--primary)" strokeDasharray="7 7" strokeWidth="3" />
      <rect x="320" y="264" width="112" height="18" rx="8" fill="var(--foreground)" opacity=".1" />
      <rect x="320" y="296" width="96" height="16" rx="8" fill="var(--foreground)" opacity=".1" />
      <rect x="412" y="318" width="88" height="58" rx="9" fill="color-mix(in srgb, var(--danger) 10%, transparent)" stroke="var(--danger)" strokeDasharray="7 7" strokeWidth="3" />
      <BarcodeBox x={415} y={321} />
      <path d="M540 342h70" stroke="var(--danger)" strokeWidth="3" strokeDasharray="7 7" />
      <MutedLabel x={545} y={333}>keep simple</MutedLabel>
      <MutedLabel x={306} y={258}>blurb above barcode</MutedLabel>
      <Label x={290} y={37}>balanced back cover</Label>
    </g>
  );
}


export function BarcodeSafeUnsafe() {
  return (
    <g>
      <Label x={150} y={60}>safe behind barcode</Label>
      <Label x={475} y={60}>unsafe behind barcode</Label>
      <rect x="120" y="95" width="230" height="280" rx="18" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <rect x="145" y="120" width="180" height="230" rx="14" fill="color-mix(in srgb, var(--primary) 9%, transparent)" />
      <path d="M152 146h160M152 188h160M152 230h160M152 272h160" stroke="var(--primary)" strokeWidth="2" opacity=".2" />
      <BarcodeBox x={232} y={292} warning={false} />
      <MutedLabel x={153} y={410}>solid color or subtle texture</MutedLabel>

      <rect x="450" y="95" width="230" height="280" rx="18" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <rect x="475" y="120" width="180" height="230" rx="14" fill="color-mix(in srgb, var(--danger) 8%, transparent)" />
      <text x="490" y="264" fill="var(--danger)" fontSize="16" fontWeight="850">small text</text>
      <path d="M560 268l34 24" stroke="var(--danger)" strokeWidth="3" strokeDasharray="6 6" strokeLinecap="round" />
      <circle cx="648" cy="282" r="19" fill="var(--card)" stroke="var(--danger)" strokeWidth="4" />
      <circle cx="648" cy="282" r="14" fill="color-mix(in srgb, var(--danger) 10%, transparent)" />
      <text x="643" y="290" fill="var(--danger)" fontSize="24" fontWeight="950">!</text>
      <BarcodeBox x={562} y={292} />
      <MutedLabel x={486} y={410}>logos, handles, QR codes</MutedLabel>
    </g>
  );
}


export function CroppedBleedTrimSafe() {
  return (
    <g>
      <rect x="165" y="54" width="470" height="335" rx="22" fill="color-mix(in srgb, var(--danger) 8%, transparent)" stroke="var(--danger)" strokeWidth="3" strokeDasharray="9 9" />
      <rect x="210" y="92" width="380" height="260" rx="18" fill="var(--card)" stroke="var(--primary)" strokeWidth="4" />
      <rect x="260" y="134" width="280" height="176" rx="14" fill="color-mix(in srgb, var(--success) 9%, transparent)" stroke="var(--success)" strokeWidth="3" strokeDasharray="7 7" />
      <rect x="178" y="58" width="64" height="26" rx="8" fill="var(--card)" stroke="var(--danger)" strokeWidth="2" />
      <text x="191" y="77" fill="var(--danger)" fontSize="14" fontWeight="850">bleed</text>
      <rect x="520" y="104" width="56" height="26" rx="8" fill="var(--card)" stroke="var(--primary)" strokeWidth="2" />
      <text x="533" y="123" fill="var(--primary)" fontSize="14" fontWeight="850">trim</text>
      <rect x="286" y="156" width="82" height="30" rx="8" fill="var(--card)" stroke="var(--success)" strokeWidth="2" />
      <text x="302" y="177" fill="var(--success)" fontSize="14" fontWeight="850">safe</text>
      <path d="M165 224h-50M635 224h50" stroke="var(--danger)" strokeWidth="4" strokeLinecap="round" />
      <MutedLabel x={272} y={415}>Previewer simulates the final cut, not just the uploaded PDF page.</MutedLabel>
    </g>
  );
}


export function CroppedTextExample() {
  return (
    <g>
      <Label x={150} y={62}>bad: text near trim</Label>
      <CoverPageFrame x={132} y={88} tone="danger" />
      <rect x="105" y="305" width="150" height="36" rx="8" fill="color-mix(in srgb, var(--danger) 12%, var(--card))" stroke="var(--danger)" strokeWidth="3" />
      <text x="122" y="329" fill="var(--danger)" fontSize="18" fontWeight="900">SUBTITLE</text>
      <path d="M132 342h230" stroke="var(--danger)" strokeWidth="4" />
      <circle cx="300" cy="328" r="20" fill="var(--card)" stroke="var(--danger)" strokeWidth="4" />
      <text x="294" y="337" fill="var(--danger)" fontSize="26" fontWeight="950">!</text>

      <Label x={480} y={62}>preview result</Label>
      <rect x="462" y="88" width="230" height="290" rx="18" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <rect x="462" y="88" width="230" height="290" rx="18" fill="color-mix(in srgb, var(--danger) 5%, transparent)" />
      <rect x="492" y="304" width="118" height="32" rx="8" fill="color-mix(in srgb, var(--danger) 10%, var(--card))" stroke="var(--danger)" strokeWidth="3" />
      <text x="508" y="326" fill="var(--danger)" fontSize="17" fontWeight="900">SUBT...</text>
      <MutedLabel x={475} y={410}>trim cuts through important content</MutedLabel>
    </g>
  );
}


export function CorrectSpacingExample() {
  return (
    <g>
      <CoverPageFrame x={170} y={78} tone="success" />
      <rect x="228" y="258" width="116" height="34" rx="8" fill="var(--card)" stroke="var(--success)" strokeWidth="3" />
      <text x="246" y="281" fill="var(--success)" fontSize="17" fontWeight="900">SUBTITLE</text>
      <path d="M190 324h190" stroke="var(--success)" strokeWidth="4" strokeLinecap="round" />
      <path d="M190 314v20M380 314v20" stroke="var(--success)" strokeWidth="4" strokeLinecap="round" />
      <MutedLabel x={205} y={352}>extra edge spacing</MutedLabel>
      <Label x={190} y={50}>safe placement</Label>

      <rect x="470" y="110" width="170" height="220" rx="16" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <rect x="494" y="142" width="122" height="150" rx="10" fill="color-mix(in srgb, var(--success) 9%, transparent)" stroke="var(--success)" strokeWidth="3" strokeDasharray="7 7" />
      <text x="518" y="224" fill="var(--foreground)" fontSize="18" fontWeight="900">text</text>
      <MutedLabel x={450} y={365}>important elements stay inside safe area</MutedLabel>
    </g>
  );
}


export function CanvaCropUnsafe() {
  return (
    <g>
      <rect x="92" y="70" width="616" height="320" rx="22" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <rect x="92" y="70" width="616" height="48" rx="22" fill="color-mix(in srgb, var(--primary) 12%, transparent)" />
      <Label x={126} y={102}>Canva canvas: looks centered, technically unsafe</Label>
      <rect x="135" y="148" width="240" height="190" rx="16" fill="color-mix(in srgb, var(--danger) 8%, transparent)" stroke="var(--danger)" strokeWidth="3" />
      <rect x="150" y="166" width="210" height="156" rx="12" fill="transparent" stroke="var(--primary)" strokeWidth="2.5" strokeDasharray="7 7" />
      <text x="156" y="307" fill="var(--danger)" fontSize="17" fontWeight="900">AUTHOR NAME</text>
      <path d="M150 324h210" stroke="var(--danger)" strokeWidth="4" />
      <rect x="425" y="148" width="240" height="190" rx="16" fill="color-mix(in srgb, var(--success) 8%, transparent)" stroke="var(--success)" strokeWidth="3" />
      <rect x="450" y="176" width="190" height="132" rx="12" fill="transparent" stroke="var(--success)" strokeWidth="2.5" strokeDasharray="7 7" />
      <text x="480" y="258" fill="var(--success)" fontSize="17" fontWeight="900">AUTHOR NAME</text>
      <MutedLabel x={156} y={364}>text sits in trim-risk zone</MutedLabel>
      <MutedLabel x={450} y={364}>text moved inward</MutedLabel>
    </g>
  );
}


export function ThinBorderTrim() {
  return (
    <g>
      <Label x={116} y={62}>thin border problem</Label>
      <rect x="110" y="90" width="235" height="290" rx="18" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <rect x="124" y="105" width="207" height="260" rx="12" fill="transparent" stroke="var(--danger)" strokeWidth="4" />
      <rect x="139" y="112" width="207" height="260" rx="12" fill="transparent" stroke="var(--primary)" strokeWidth="2" strokeDasharray="7 7" opacity=".65" />
      <MutedLabel x={128} y={410}>tiny trim shift looks uneven</MutedLabel>

      <Label x={470} y={62}>safer border spacing</Label>
      <rect x="455" y="90" width="235" height="290" rx="18" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <rect x="500" y="140" width="145" height="190" rx="12" fill="transparent" stroke="var(--success)" strokeWidth="5" />
      <rect x="478" y="116" width="189" height="238" rx="12" fill="transparent" stroke="var(--primary)" strokeWidth="2" strokeDasharray="7 7" opacity=".65" />
      <MutedLabel x={478} y={410}>border stays away from trim</MutedLabel>
    </g>
  );
}


export function BlackCoverTrimIllusion() {
  return (
    <g>
      <CoverPageFrame x={138} y={84} tone="dark" />
      <rect x="138" y="84" width="230" height="290" rx="18" fill="none" stroke="var(--danger)" strokeWidth="4" />
      <rect x="158" y="106" width="190" height="246" rx="12" fill="none" stroke="rgba(255,255,255,.42)" strokeWidth="2" strokeDasharray="7 7" />
      <text x="184" y="230" fill="#fff" fontSize="24" fontWeight="900">BLACK</text>
      <Label x={138} y={55}>dark cover</Label>
      <MutedLabel x={118} y={410}>small shifts are highly visible</MutedLabel>

      <rect x="472" y="84" width="210" height="290" rx="18" fill="#171923" stroke="var(--border)" strokeWidth="3" />
      <path d="M472 94h210M472 374h210" stroke="var(--danger)" strokeWidth="6" opacity=".85" />
      <text x="512" y="232" fill="#fff" fontSize="24" fontWeight="900">TRIM</text>
      <path d="M440 226h42" stroke="var(--danger)" strokeWidth="4" strokeDasharray="7 7" />
      <MutedLabel x={458} y={410}>Previewer may feel cropped or shifted</MutedLabel>
    </g>
  );
}


export function CorrectFullBleed() {
  return (
    <g>
      <rect x="150" y="58" width="500" height="335" rx="22" fill="color-mix(in srgb, var(--primary) 12%, transparent)" stroke="var(--danger)" strokeDasharray="9 9" strokeWidth="3" />
      <rect x="190" y="98" width="420" height="255" rx="18" fill="var(--card)" stroke="var(--primary)" strokeWidth="4" />
      <rect x="236" y="142" width="328" height="166" rx="14" fill="color-mix(in srgb, var(--success) 9%, transparent)" stroke="var(--success)" strokeDasharray="7 7" strokeWidth="3" />
      <path d="M150 120c92 54 140 18 226 58 80 37 124 96 274 34v181H150Z" fill="color-mix(in srgb, var(--primary) 18%, transparent)" />
      <text x="318" y="226" fill="var(--foreground)" fontSize="26" fontWeight="900">TITLE</text>
      <MutedLabel x={196} y={82}>background extends to bleed</MutedLabel>
      <MutedLabel x={438} y={335}>text remains protected</MutedLabel>
    </g>
  );
}


export function EdgeSpacingComparison() {
  return (
    <g>
      <Label x={150} y={60}>bad edge spacing</Label>
      <rect x="126" y="92" width="245" height="292" rx="18" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <rect x="140" y="108" width="217" height="260" rx="12" fill="transparent" stroke="var(--primary)" strokeWidth="2.5" strokeDasharray="7 7" />
      <text x="132" y="246" fill="var(--danger)" fontSize="24" fontWeight="950">TITLE</text>
      <path d="M140 108v260" stroke="var(--danger)" strokeWidth="4" />

      <Label x={486} y={60}>correct spacing</Label>
      <rect x="456" y="92" width="245" height="292" rx="18" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <rect x="484" y="126" width="189" height="224" rx="12" fill="transparent" stroke="var(--success)" strokeWidth="2.5" strokeDasharray="7 7" />
      <text x="538" y="246" fill="var(--foreground)" fontSize="24" fontWeight="950">TITLE</text>
      <path d="M456 246h64" stroke="var(--success)" strokeWidth="4" strokeLinecap="round" />
      <MutedLabel x={154} y={414}>title touches trim-risk zone</MutedLabel>
      <MutedLabel x={494} y={414}>more padding survives trim variation</MutedLabel>
    </g>
  );
}


