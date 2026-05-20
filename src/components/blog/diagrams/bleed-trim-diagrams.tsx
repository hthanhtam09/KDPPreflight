import type React from 'react';
import { Label, MutedLabel, PageFrame, StatusBadge } from './shared';

export function BleedLayers() {
  return (
    <g>
      <rect x="210" y="42" width="380" height="340" rx="18" fill="color-mix(in srgb, var(--danger) 12%, transparent)" stroke="var(--danger)" strokeDasharray="9 9" strokeWidth="3" />
      <rect x="248" y="80" width="304" height="264" rx="14" fill="var(--card)" stroke="var(--primary)" strokeWidth="3" />
      <rect x="300" y="132" width="200" height="160" rx="10" fill="color-mix(in srgb, var(--success) 10%, transparent)" stroke="var(--success)" strokeDasharray="7 7" strokeWidth="3" />
      <Label x={245} y={68}>bleed</Label>
      <Label x={260} y={110}>trim</Label>
      <Label x={318} y={165}>safe area</Label>
      <path d="M590 212h70" stroke="var(--danger)" strokeWidth="3" markerEnd="url(#arrow)" />
      <MutedLabel x={604} y={244}>0.125 inch</MutedLabel>
    </g>
  );
}


export function MissingBleed() {
  return (
    <g>
      <Label x={160} y={54}>before</Label>
      <Label x={500} y={54}>after</Label>
      <rect x="105" y="85" width="230" height="285" rx="18" fill="var(--card)" stroke="var(--danger)" strokeWidth="3" />
      <rect x="107" y="87" width="226" height="281" rx="16" fill="color-mix(in srgb, var(--primary) 13%, transparent)" />
      <rect x="465" y="68" width="270" height="320" rx="18" fill="color-mix(in srgb, var(--danger) 10%, transparent)" stroke="var(--danger)" strokeDasharray="8 8" strokeWidth="3" />
      <rect x="485" y="88" width="230" height="280" rx="16" fill="color-mix(in srgb, var(--primary) 16%, transparent)" stroke="var(--primary)" strokeWidth="3" />
      <MutedLabel x={118} y={398}>art stops at trim</MutedLabel>
      <MutedLabel x={510} y={415}>art extends through bleed</MutedLabel>
    </g>
  );
}


export function ForgotBleedComparison() {
  return (
    <g>
      <Label x={112} y={48}>bleed vs no bleed</Label>
      <PageFrame x={100} y={86} />
      <StatusBadge x={103} y={320} label="correct bleed" good />
      <text x={174} y={72} textAnchor="middle" fill="var(--success)" fontSize="13" fontWeight="850">art extends past trim</text>
      <path d="M282 200h92" stroke="var(--border)" strokeWidth={3} strokeDasharray="7 7" />
      <text x={328} y={186} textAnchor="middle" fill="var(--muted-foreground)" fontSize="12" fontWeight="800">KDP trim</text>
      <PageFrame x={420} y={86} danger />
      <rect x={434} y={100} width={120} height={184} rx={10} fill="var(--card)" stroke="var(--danger)" strokeWidth={2.5} />
      <rect x={442} y={108} width={104} height={168} rx={8} fill="color-mix(in srgb, var(--primary) 13%, transparent)" />
      <path d="M434 100h120M434 284h120M434 100v184M554 100v184" stroke="var(--danger)" strokeWidth={3} />
      <StatusBadge x={423} y={320} label="no bleed risk" />
      <text x={494} y={72} textAnchor="middle" fill="var(--danger)" fontSize="13" fontWeight="850">art stops at trim</text>
    </g>
  );
}


export function WhiteEdgeSimulation() {
  return (
    <g>
      <Label x={220} y={48}>why white edges appear</Label>
      <rect x={96} y={86} width={228} height={270} rx={18} fill="var(--card)" stroke="var(--border)" strokeWidth={3} />
      <rect x={116} y={106} width={188} height={230} rx={12} fill="color-mix(in srgb, var(--primary) 18%, transparent)" stroke="var(--primary)" strokeWidth={3} />
      <text x={210} y={224} textAnchor="middle" fill="var(--foreground)" fontSize="16" fontWeight="850">expected trim</text>
      <path d="M372 222h64" stroke="var(--primary)" strokeWidth={3} markerEnd="url(#arrow-white-edge-simulation)" />
      <rect x={488} y={86} width={228} height={270} rx={18} fill="var(--card)" stroke="var(--danger)" strokeWidth={3} />
      <rect x={522} y={106} width={174} height={230} rx={12} fill="color-mix(in srgb, var(--primary) 18%, transparent)" />
      <rect x={504} y={106} width={18} height={230} rx={4} fill="var(--card)" stroke="var(--danger)" strokeWidth={2} />
      <text x={609} y={224} textAnchor="middle" fill="var(--foreground)" fontSize="16" fontWeight="850">shifted cut</text>
      <rect x={462} y={372} width={104} height={28} rx={8} fill="color-mix(in srgb, var(--danger) 10%, var(--card))" stroke="var(--danger)" strokeWidth={2} />
      <text x={514} y={391} textAnchor="middle" fill="var(--danger)" fontSize="12" fontWeight="900">white edge</text>
      <MutedLabel x={170} y={390}>normal trim tolerance</MutedLabel>
      <MutedLabel x={594} y={390}>background stopped too soon</MutedLabel>
    </g>
  );
}


export function EdgeToEdgeCorrect() {
  return (
    <g>
      <Label x={196} y={48}>correct edge-to-edge setup</Label>
      <rect x={154} y={72} width={492} height={300} rx={20} fill="color-mix(in srgb, var(--danger) 8%, transparent)" stroke="var(--danger)" strokeDasharray="8 8" strokeWidth={3} />
      <rect x={190} y={106} width={420} height={232} rx={16} fill="color-mix(in srgb, var(--primary) 14%, transparent)" stroke="var(--primary)" strokeWidth={3} />
      <rect x={250} y={154} width={300} height={138} rx={12} fill="color-mix(in srgb, var(--success) 9%, var(--card))" stroke="var(--success)" strokeDasharray="7 7" strokeWidth={3} />
      <text x={230} y={94} fill="var(--danger)" fontSize="14" fontWeight="850">bleed</text>
      <text x={204} y={132} fill="var(--primary)" fontSize="14" fontWeight="850">trim</text>
      <text x={348} y={232} fill="var(--success)" fontSize="17" fontWeight="900">safe text</text>
      <path d="M610 222h80" stroke="var(--success)" strokeWidth={3} />
      <text x={638} y={252} fill="var(--success)" fontSize="13" fontWeight="850">text stays in</text>
      <path d="M116 224h70" stroke="var(--danger)" strokeWidth={3} />
      <text x={82} y={256} fill="var(--danger)" fontSize="13" fontWeight="850">background out</text>
    </g>
  );
}


export function IncorrectTrimExample() {
  return (
    <g>
      <Label x={210} y={48}>incorrect no-bleed trim setup</Label>
      <rect x={120} y={86} width={240} height={278} rx={18} fill="var(--card)" stroke="var(--danger)" strokeWidth={3} />
      <rect x={120} y={86} width={240} height={278} rx={18} fill="color-mix(in srgb, var(--primary) 16%, transparent)" />
      <path d="M128 94h224M128 356h224M128 94v262M352 94v262" stroke="var(--danger)" strokeWidth={2.5} strokeDasharray="8 8" opacity=".7" />
      <rect x={134} y={280} width={132} height={38} rx={9} fill="color-mix(in srgb, var(--danger) 12%, var(--card))" stroke="var(--danger)" strokeWidth={2.5} />
      <text x={200} y={304} textAnchor="middle" fill="var(--danger)" fontSize="15" fontWeight="900">EDGE TEXT</text>
      <rect x={466} y={118} width={210} height={216} rx={16} fill="var(--card)" stroke="var(--border)" strokeWidth={3} />
      <rect x={486} y={118} width={190} height={216} rx={12} fill="color-mix(in srgb, var(--primary) 16%, transparent)" />
      <rect x={466} y={118} width={20} height={216} fill="var(--card)" stroke="var(--danger)" strokeWidth={2.5} />
      <text x={571} y={232} textAnchor="middle" fill="var(--foreground)" fontSize="16" fontWeight="850">printed result</text>
      <text x={476} y={354} textAnchor="middle" fill="var(--danger)" fontSize="13" fontWeight="900">paper shows</text>
      <StatusBadge x={171} y={386} label="art at trim edge" />
      <StatusBadge x={500} y={386} label="visible issue" />
    </g>
  );
}


export function CanvaBleedWorkflow() {
  const steps = [
    ['1', 'show bleed'],
    ['2', 'extend art'],
    ['3', 'PDF Print'],
    ['4', 'verify PDF'],
  ];
  return (
    <g>
      <Label x={214} y={48}>Canva bleed workflow</Label>
      {steps.map(([number, label], index) => {
        const x = 70 + index * 176;
        return (
          <g key={label}>
            <rect x={x} y={116} width={130} height={118} rx={16} fill="var(--card)" stroke={index === 1 ? 'var(--success)' : 'var(--border)'} strokeWidth={3} />
            <circle cx={x + 24} cy={116} r={15} fill={index === 1 ? 'var(--success)' : 'var(--primary)'} />
            <text x={x + 24} y={121} textAnchor="middle" fill="var(--card)" fontSize="13" fontWeight="900">{number}</text>
            <text x={x + 65} y={184} textAnchor="middle" fill="var(--foreground)" fontSize="14" fontWeight="850">{label}</text>
            {index < steps.length - 1 && <path d={`M${x + 140} 176h28`} stroke="var(--primary)" strokeWidth={3} markerEnd="url(#arrow-canva-bleed-workflow)" />}
          </g>
        );
      })}
      <rect x={240} y={276} width={320} height={74} rx={16} fill="color-mix(in srgb, var(--success) 10%, var(--card))" stroke="var(--success)" strokeWidth={3} />
      <text x={400} y={308} textAnchor="middle" fill="var(--success)" fontSize="16" fontWeight="900">background crosses bleed guide</text>
      <text x={400} y={332} textAnchor="middle" fill="var(--muted-foreground)" fontSize="13" fontWeight="750">text and logos stay inside safe margins</text>
    </g>
  );
}


export function SafeAreaBleedMap() {
  return (
    <g>
      <Label x={216} y={48}>safe area vs bleed area</Label>
      <rect x={198} y={70} width={404} height={320} rx={20} fill="color-mix(in srgb, var(--danger) 9%, transparent)" stroke="var(--danger)" strokeDasharray="8 8" strokeWidth={3} />
      <rect x={240} y={108} width={320} height={244} rx={16} fill="var(--card)" stroke="var(--primary)" strokeWidth={3} />
      <rect x={296} y={158} width={208} height={144} rx={12} fill="color-mix(in srgb, var(--success) 10%, transparent)" stroke="var(--success)" strokeDasharray="7 7" strokeWidth={3} />
      <text x={400} y={94} textAnchor="middle" fill="var(--danger)" fontSize="15" fontWeight="900">bleed: trim-away artwork</text>
      <text x={400} y={135} textAnchor="middle" fill="var(--primary)" fontSize="15" fontWeight="900">trim: final page edge</text>
      <text x={400} y={236} textAnchor="middle" fill="var(--success)" fontSize="18" fontWeight="950">safe area</text>
      <text x={400} y={264} textAnchor="middle" fill="var(--muted-foreground)" fontSize="13" fontWeight="750">important text lives here</text>
    </g>
  );
}


export function BlackPageTrimExample() {
  return (
    <g>
      <Label x={190} y={48}>full-black page trim example</Label>
      <PageFrame x={120} y={88} dark />
      <text x={194} y={326} textAnchor="middle" fill="var(--success)" fontSize="13" fontWeight="900">black extends into bleed</text>
      <rect x={438} y={88} width={160} height={224} rx={14} fill="var(--card)" stroke="var(--danger)" strokeWidth={3} />
      <rect x={462} y={106} width={126} height={188} rx={10} fill="var(--foreground)" />
      <rect x={438} y={106} width={24} height={188} fill="var(--card)" stroke="var(--danger)" strokeWidth={2} />
      <text x={518} y={326} textAnchor="middle" fill="var(--danger)" fontSize="13" fontWeight="900">white edge is obvious</text>
      <MutedLabel x={128} y={376}>low contrast risk</MutedLabel>
      <MutedLabel x={440} y={376}>high contrast risk</MutedLabel>
    </g>
  );
}


export function CorrectExportSetup() {
  const checks = [
    ['Bleed setting matches file'],
    ['Artwork reaches bleed edge'],
    ['PDF dimensions verified'],
    ['No crop marks or', 'extra margins'],
  ];
  return (
    <g>
      <Label x={208} y={48}>correct export setup</Label>
      <rect x={92} y={84} width={330} height={288} rx={18} fill="var(--card)" stroke="var(--border)" strokeWidth={3} />
      <rect x={116} y={110} width={282} height={34} rx={10} fill="color-mix(in srgb, var(--primary) 12%, transparent)" stroke="var(--primary)" strokeWidth={2} />
      <text x={257} y={133} textAnchor="middle" fill="var(--primary)" fontSize="15" fontWeight="900">PDF Print export</text>
      {checks.map((lines, index) => (
        <g key={lines.join(' ')} transform={`translate(124 ${180 + index * 42})`}>
          <circle cx="10" cy="0" r="11" fill="color-mix(in srgb, var(--success) 16%, transparent)" stroke="var(--success)" strokeWidth={2.5} />
          <path d="M4 0l5 5 10-13" fill="none" stroke="var(--success)" strokeWidth={2.5} />
          <text x="32" y={lines.length > 1 ? -3 : 5} fill="var(--foreground)" fontSize="13" fontWeight="800">{lines[0]}</text>
          {lines[1] && <text x="32" y="15" fill="var(--foreground)" fontSize="13" fontWeight="800">{lines[1]}</text>}
        </g>
      ))}
      <rect x={496} y={116} width={176} height={214} rx={16} fill="color-mix(in srgb, var(--success) 10%, var(--card))" stroke="var(--success)" strokeWidth={3} />
      <text x={584} y={210} textAnchor="middle" fill="var(--success)" fontSize="20" fontWeight="950">ready</text>
      <text x={584} y={236} textAnchor="middle" fill="var(--muted-foreground)" fontSize="13" fontWeight="750">upload to Previewer</text>
    </g>
  );
}


export function EdgeArtSafety() {
  return (
    <g>
      <Label x={198} y={48}>edge-art safety check</Label>
      <rect x={96} y={88} width={258} height={260} rx={18} fill="var(--card)" stroke="var(--success)" strokeWidth={3} />
      <path d="M106 100h238M106 336h238M108 100v236M342 100v236" stroke="var(--primary)" strokeWidth={8} opacity=".55" />
      <rect x={154} y={150} width={142} height={92} rx={12} fill="color-mix(in srgb, var(--success) 10%, transparent)" stroke="var(--success)" strokeDasharray="7 7" strokeWidth={3} />
      <text x={225} y={202} textAnchor="middle" fill="var(--success)" fontSize="16" fontWeight="900">title safe</text>
      <StatusBadge x={154} y={370} label="safe layout" good />
      <rect x={458} y={88} width={258} height={260} rx={18} fill="var(--card)" stroke="var(--danger)" strokeWidth={3} />
      <path d="M468 100h238M468 336h238M470 100v236M704 100v236" stroke="var(--primary)" strokeWidth={8} opacity=".55" />
      <rect x={470} y={292} width={154} height={38} rx={9} fill="color-mix(in srgb, var(--danger) 12%, var(--card))" stroke="var(--danger)" strokeWidth={2.5} />
      <text x={547} y={316} textAnchor="middle" fill="var(--danger)" fontSize="15" fontWeight="900">title at edge</text>
      <StatusBadge x={516} y={370} label="unsafe content" />
    </g>
  );
}


export function BleedChoiceComparison() {
  return (
    <g>
      <Label x={238} y={44}>KDP bleed vs no bleed</Label>
      <rect x={70} y={74} width={276} height={280} rx={18} fill="color-mix(in srgb, var(--danger) 7%, transparent)" stroke="var(--danger)" strokeDasharray="8 8" strokeWidth={3} />
      <rect x={98} y={102} width={220} height={224} rx={14} fill="color-mix(in srgb, var(--primary) 15%, transparent)" stroke="var(--primary)" strokeWidth={3} />
      <rect x={148} y={156} width={120} height={88} rx={10} fill="color-mix(in srgb, var(--success) 10%, var(--card))" stroke="var(--success)" strokeDasharray="7 7" strokeWidth={2.5} />
      <text x={208} y={202} textAnchor="middle" fill="var(--foreground)" fontSize="16" fontWeight="900">edge art</text>
      <text x={208} y={382} textAnchor="middle" fill="var(--success)" fontSize="14" fontWeight="900">BLEED: art reaches edge</text>

      <rect x={454} y={102} width={220} height={224} rx={14} fill="var(--card)" stroke="var(--border)" strokeWidth={3} />
      <rect x={492} y={142} width={144} height={144} rx={12} fill="color-mix(in srgb, var(--primary) 11%, transparent)" stroke="var(--success)" strokeDasharray="7 7" strokeWidth={2.5} />
      <rect x={516} y={178} width={96} height={10} rx={3} fill="var(--foreground)" opacity=".2" />
      <rect x={528} y={204} width={72} height={8} rx={3} fill="var(--foreground)" opacity=".14" />
      <text x={564} y={382} textAnchor="middle" fill="var(--primary)" fontSize="14" fontWeight="900">NO BLEED: margins stay white</text>
      <text x={386} y={222} textAnchor="middle" fill="var(--muted-foreground)" fontSize="13" fontWeight="850">choose by page edge</text>
    </g>
  );
}


export function NoBleedMarginPage() {
  return (
    <g>
      <Label x={236} y={48}>no-bleed page with safe margins</Label>
      <rect x={260} y={78} width={280} height={306} rx={20} fill="var(--card)" stroke="var(--border)" strokeWidth={3} />
      <rect x={310} y={132} width={180} height={198} rx={14} fill="color-mix(in srgb, var(--success) 8%, transparent)" stroke="var(--success)" strokeDasharray="7 7" strokeWidth={3} />
      <rect x={330} y={164} width={140} height={10} rx={3} fill="var(--foreground)" opacity=".18" />
      <rect x={330} y={188} width={118} height={8} rx={3} fill="var(--foreground)" opacity=".12" />
      <rect x={330} y={210} width={132} height={8} rx={3} fill="var(--foreground)" opacity=".12" />
      <text x={400} y={270} textAnchor="middle" fill="var(--success)" fontSize="17" fontWeight="900">content safe</text>
      <text x={400} y={410} textAnchor="middle" fill="var(--muted-foreground)" fontSize="13" fontWeight="800">white margin is intentional</text>
      <text x={162} y={182} textAnchor="middle" fill="var(--primary)" fontSize="13" fontWeight="850">trim edge</text>
      <path d="M206 178h48" stroke="var(--primary)" strokeWidth={3} />
      <text x={652} y={182} textAnchor="middle" fill="var(--success)" fontSize="13" fontWeight="850">safe margin</text>
      <path d="M546 178h58" stroke="var(--success)" strokeWidth={3} />
    </g>
  );
}


export function BookTypeBleedGrid() {
  const rows = [
    ['Coloring', 'Bleed', 'edge art'],
    ['Novel', 'No bleed', 'text margins'],
    ['Journal', 'No bleed', 'writing space'],
    ['Photo book', 'Bleed', 'full images'],
    ['Puzzle book', 'Depends', 'grid position'],
  ];
  return (
    <g>
      <Label x={236} y={50}>book type recommendations</Label>
      <rect x={116} y={82} width={568} height={290} rx={20} fill="var(--card)" stroke="var(--border)" strokeWidth={3} />
      {rows.map(([book, choice, reason], index) => {
        const y = 126 + index * 48;
        const bleed = choice === 'Bleed';
        const depends = choice === 'Depends';
        const color = depends ? 'var(--primary)' : bleed ? 'var(--success)' : 'var(--muted-foreground)';
        return (
          <g key={book}>
            {index > 0 && <path d={`M144 ${y - 24}h512`} stroke="var(--border)" strokeWidth={1.5} />}
            <text x={160} y={y} fill="var(--foreground)" fontSize="15" fontWeight="850">{book}</text>
            <rect x={322} y={y - 22} width={112} height={30} rx={9} fill={`color-mix(in srgb, ${color} 10%, transparent)`} stroke={color} strokeWidth={2} />
            <text x={378} y={y - 2} textAnchor="middle" fill={color} fontSize="12" fontWeight="900">{choice}</text>
            <text x={488} y={y} fill="var(--muted-foreground)" fontSize="13" fontWeight="750">{reason}</text>
          </g>
        );
      })}
    </g>
  );
}


export function ColoringBookBleedExample() {
  return (
    <g>
      <Label x={214} y={48}>coloring book bleed example</Label>
      <rect x={96} y={82} width={220} height={270} rx={18} fill="color-mix(in srgb, var(--success) 8%, transparent)" stroke="var(--success)" strokeDasharray="8 8" strokeWidth={3} />
      <rect x={116} y={102} width={180} height={230} rx={14} fill="var(--card)" stroke="var(--primary)" strokeWidth={3} />
      <path d="M134 222c50-90 105-92 144 0M142 224c36-38 72-42 126 0" fill="none" stroke="var(--foreground)" strokeWidth={3} opacity=".65" />
      <text x={206} y={382} textAnchor="middle" fill="var(--success)" fontSize="13" fontWeight="900">correct: line art extends</text>

      <rect x={482} y={102} width={180} height={230} rx={14} fill="var(--card)" stroke="var(--danger)" strokeWidth={3} />
      <rect x={502} y={102} width={160} height={230} rx={10} fill="color-mix(in srgb, var(--primary) 8%, transparent)" />
      <rect x={482} y={102} width={18} height={230} fill="var(--card)" stroke="var(--danger)" strokeWidth={2} />
      <path d="M506 222c45-84 99-86 136 0M514 224c34-36 66-38 116 0" fill="none" stroke="var(--foreground)" strokeWidth={3} opacity=".65" />
      <text x={572} y={382} textAnchor="middle" fill="var(--danger)" fontSize="13" fontWeight="900">wrong: white edge risk</text>
    </g>
  );
}


export function JournalNoBleedExample() {
  return (
    <g>
      <Label x={224} y={48}>journal no-bleed example</Label>
      <rect x={202} y={76} width={396} height={300} rx={20} fill="var(--card)" stroke="var(--border)" strokeWidth={3} />
      <rect x={248} y={118} width={304} height={216} rx={14} fill="color-mix(in srgb, var(--success) 7%, transparent)" stroke="var(--success)" strokeDasharray="8 8" strokeWidth={3} />
      {[0, 1, 2, 3, 4].map((line) => (
        <path key={line} d={`M278 ${158 + line * 34}h244`} stroke="var(--primary)" strokeWidth={2.5} opacity=".45" />
      ))}
      <text x={400} y={358} textAnchor="middle" fill="var(--success)" fontSize="14" fontWeight="900">clean margins protect writing space</text>
      <text x={154} y={206} textAnchor="middle" fill="var(--muted-foreground)" fontSize="13" fontWeight="800">no edge art</text>
      <text x={646} y={206} textAnchor="middle" fill="var(--muted-foreground)" fontSize="13" fontWeight="800">no bleed needed</text>
    </g>
  );
}


export function PaperbackCoverBleedMap() {
  return (
    <g>
      <Label x={218} y={48}>paperback cover bleed map</Label>
      <rect x={60} y={84} width={680} height={252} rx={20} fill="color-mix(in srgb, var(--danger) 7%, transparent)" stroke="var(--danger)" strokeDasharray="8 8" strokeWidth={3} />
      <rect x={86} y={110} width={628} height={200} rx={16} fill="var(--card)" stroke="var(--primary)" strokeWidth={3} />
      <rect x={106} y={130} width={236} height={160} rx={12} fill="color-mix(in srgb, var(--muted) 60%, transparent)" />
      <rect x={342} y={110} width={82} height={200} fill="color-mix(in srgb, var(--primary) 16%, transparent)" stroke="var(--primary)" strokeWidth={2} />
      <rect x={424} y={130} width={270} height={160} rx={12} fill="color-mix(in srgb, var(--success) 7%, transparent)" />
      <rect x={126} y={150} width={548} height={120} rx={12} fill="transparent" stroke="var(--success)" strokeDasharray="7 7" strokeWidth={3} />
      <text x={224} y={218} textAnchor="middle" fill="var(--foreground)" fontSize="16" fontWeight="850">back</text>
      <text x={383} y={218} textAnchor="middle" fill="var(--primary)" fontSize="14" fontWeight="900">spine</text>
      <text x={560} y={218} textAnchor="middle" fill="var(--foreground)" fontSize="16" fontWeight="850">front</text>
      <text x={400} y={364} textAnchor="middle" fill="var(--danger)" fontSize="13" fontWeight="900">bleed surrounds outside edges only</text>
      <text x={400} y={390} textAnchor="middle" fill="var(--success)" fontSize="13" fontWeight="900">titles, barcode, and logos stay inside safe area</text>
    </g>
  );
}


export function CanvaBleedNoBleed() {
  return (
    <g>
      <Label x={226} y={48}>Canva bleed vs no bleed workflow</Label>
      <rect x={74} y={92} width={288} height={230} rx={18} fill="color-mix(in srgb, var(--success) 8%, transparent)" stroke="var(--success)" strokeWidth={3} />
      <rect x={100} y={118} width={236} height={178} rx={14} fill="color-mix(in srgb, var(--primary) 13%, transparent)" stroke="var(--primary)" strokeWidth={3} />
      <text x={218} y={184} textAnchor="middle" fill="var(--success)" fontSize="16" fontWeight="900">bleed project</text>
      <text x={218} y={214} textAnchor="middle" fill="var(--muted-foreground)" fontSize="12" fontWeight="800">extend background</text>
      <text x={218} y={344} textAnchor="middle" fill="var(--success)" fontSize="13" fontWeight="900">PDF Print + bleed guides</text>

      <rect x={438} y={118} width={236} height={178} rx={14} fill="var(--card)" stroke="var(--border)" strokeWidth={3} />
      <rect x={486} y={156} width={140} height={92} rx={10} fill="color-mix(in srgb, var(--success) 8%, transparent)" stroke="var(--success)" strokeDasharray="7 7" strokeWidth={2.5} />
      <text x={556} y={194} textAnchor="middle" fill="var(--primary)" fontSize="16" fontWeight="900">no bleed</text>
      <text x={556} y={224} textAnchor="middle" fill="var(--muted-foreground)" fontSize="12" fontWeight="800">keep margins</text>
      <text x={556} y={344} textAnchor="middle" fill="var(--primary)" fontSize="13" fontWeight="900">PDF Print + trim size</text>
    </g>
  );
}


export function BleedDecisionFlow() {
  const steps = [
    ['Edge art?', 'yes → bleed'],
    ['Only text?', 'no bleed'],
    ['Dark pages?', 'bleed'],
    ['Journal?', 'usually no bleed'],
  ];
  return (
    <g>
      <Label x={238} y={48}>quick bleed decision flow</Label>
      {steps.map(([top, bottom], index) => {
        const x = 70 + index * 178;
        const isBleed = bottom.includes('bleed') && !bottom.includes('no bleed');
        return (
          <g key={top}>
            <rect x={x} y={130} width={132} height={92} rx={16} fill={isBleed ? 'color-mix(in srgb, var(--success) 10%, transparent)' : 'var(--card)'} stroke={isBleed ? 'var(--success)' : 'var(--border)'} strokeWidth={3} />
            <text x={x + 66} y={168} textAnchor="middle" fill="var(--foreground)" fontSize="14" fontWeight="850">{top}</text>
            <text x={x + 66} y={195} textAnchor="middle" fill={isBleed ? 'var(--success)' : 'var(--primary)'} fontSize="13" fontWeight="900">{bottom}</text>
            {index < steps.length - 1 && <path d={`M${x + 142} 176h26`} stroke="var(--border)" strokeWidth={2.5} strokeDasharray="6 6" />}
          </g>
        );
      })}
      <rect x={232} y={286} width={336} height={58} rx={14} fill="color-mix(in srgb, var(--primary) 9%, var(--card))" stroke="var(--primary)" strokeWidth={2.5} />
      <text x={400} y={310} textAnchor="middle" fill="var(--foreground)" fontSize="13" fontWeight="850">Simple rule:</text>
      <text x={400} y={331} textAnchor="middle" fill="var(--primary)" fontSize="13" fontWeight="900">edge-to-edge print needs bleed</text>
    </g>
  );
}


export function TrimResultComparison() {
  return (
    <g>
      <Label x={238} y={48}>trim result simulation</Label>
      <rect x={98} y={90} width={214} height={240} rx={18} fill="color-mix(in srgb, var(--success) 8%, transparent)" stroke="var(--success)" strokeDasharray="8 8" strokeWidth={3} />
      <rect x={118} y={110} width={174} height={200} rx={14} fill="color-mix(in srgb, var(--primary) 15%, transparent)" stroke="var(--primary)" strokeWidth={3} />
      <path d="M118 110h174M118 310h174" stroke="var(--success)" strokeWidth={2} />
      <text x={205} y={360} textAnchor="middle" fill="var(--success)" fontSize="13" fontWeight="900">bleed absorbs trim shift</text>
      <rect x={488} y={110} width={174} height={200} rx={14} fill="var(--card)" stroke="var(--danger)" strokeWidth={3} />
      <rect x={510} y={110} width={152} height={200} rx={10} fill="color-mix(in srgb, var(--primary) 15%, transparent)" />
      <rect x={488} y={110} width={22} height={200} fill="var(--card)" stroke="var(--danger)" strokeWidth={2} />
      <text x={575} y={360} textAnchor="middle" fill="var(--danger)" fontSize="13" fontWeight="900">no spare artwork</text>
    </g>
  );
}


export function CorrectEdgeExtension() {
  return (
    <g>
      <Label x={218} y={48}>correct edge extension</Label>
      <rect x={130} y={86} width={540} height={280} rx={20} fill="color-mix(in srgb, var(--danger) 7%, transparent)" stroke="var(--danger)" strokeDasharray="8 8" strokeWidth={3} />
      <rect x={170} y={120} width={460} height={212} rx={16} fill="color-mix(in srgb, var(--primary) 14%, transparent)" stroke="var(--primary)" strokeWidth={3} />
      <rect x={262} y={176} width={276} height={92} rx={12} fill="color-mix(in srgb, var(--success) 10%, var(--card))" stroke="var(--success)" strokeDasharray="7 7" strokeWidth={3} />
      <text x={400} y={218} textAnchor="middle" fill="var(--success)" fontSize="17" fontWeight="900">important content safe</text>
      <text x={400} y={248} textAnchor="middle" fill="var(--muted-foreground)" fontSize="12" fontWeight="800">background extends outward</text>
      <rect x={166} y={104} width={58} height={24} rx={7} fill="color-mix(in srgb, var(--danger) 10%, var(--card))" stroke="var(--danger)" strokeWidth={2} />
      <text x={195} y={121} textAnchor="middle" fill="var(--danger)" fontSize="12" fontWeight="900">bleed</text>
      <text x={184} y={142} fill="var(--primary)" fontSize="13" fontWeight="900">trim</text>
    </g>
  );
}


export function BackgroundExtensionTrim() {
  return (
    <g>
      <Label x={220} y={48}>background past trim</Label>
      <rect x={150} y={72} width={500} height={312} rx={22} fill="color-mix(in srgb, var(--primary) 17%, transparent)" stroke="var(--danger)" strokeDasharray="9 9" strokeWidth={3} />
      <rect x={196} y={116} width={408} height={226} rx={18} fill="color-mix(in srgb, var(--primary) 22%, transparent)" stroke="var(--primary)" strokeWidth={3} />
      <rect x={258} y={166} width={284} height={126} rx={14} fill="color-mix(in srgb, var(--success) 10%, var(--card))" stroke="var(--success)" strokeDasharray="8 8" strokeWidth={3} />
      <text x={400} y={204} textAnchor="middle" fill="var(--foreground)" fontSize={17} fontWeight={950}>safe content</text>
      <text x={400} y={232} textAnchor="middle" fill="var(--muted-foreground)" fontSize={13} fontWeight={850}>text stays inward</text>
      <rect x={64} y={96} width={112} height={34} rx={10} fill="var(--card)" stroke="var(--danger)" strokeWidth={2.5} />
      <text x={120} y={119} textAnchor="middle" fill="var(--danger)" fontSize={14} fontWeight={950}>bleed</text>
      <rect x={624} y={124} width={104} height={34} rx={10} fill="var(--card)" stroke="var(--primary)" strokeWidth={2.5} />
      <text x={676} y={147} textAnchor="middle" fill="var(--primary)" fontSize={14} fontWeight={950}>trim</text>
      <text x={238} y={410} fill="var(--muted-foreground)" fontSize={14} fontWeight={850}>extra background is intentionally cut away</text>
    </g>
  );
}


export function WhiteEdgeBackground() {
  const bgW = 200, bgH = 260;
  
  // Left Panel
  const cx1 = 220, cy = 250; 
  const bx1 = cx1 - bgW/2, by = cy - bgH/2;
  const shift = -16;
  const cut1X = bx1 + shift, cutY = by, cutW = bgW, cutH = bgH;
  
  // Right Panel
  const cx2 = 580;
  const bx2 = cx2 - bgW/2, by2 = cy - bgH/2;
  const bleed = 16;
  const bg2X = bx2 - bleed, bg2Y = by2 - bleed, bg2W = bgW + bleed*2, bg2H = bgH + bleed*2;
  const cut2X = bx2 + shift, cut2Y = by2, cut2W = bgW, cut2H = bgH;

  return (
    <g>
      <Label x={246} y={48}>white-edge simulation</Label>

      {/* --- MIDDLE: SAME CUT INDICATOR --- */}
      <path d={`M 360 ${cy} h 80`} stroke="var(--danger)" strokeWidth={3} strokeDasharray="6 6" />
      <path d={`M 360 ${cy - 8} L 350 ${cy} L 360 ${cy + 8}`} fill="none" stroke="var(--danger)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      <text x={400} y={cy - 16} textAnchor="middle" fill="var(--danger)" fontSize={14} fontWeight={850}>cut shifts left</text>

      {/* --- LEFT PANEL: NO BLEED --- */}
      <text x={cx1} y={80} textAnchor="middle" fill="var(--foreground)" fontSize={18} fontWeight={900}>WITHOUT BLEED</text>
      
      {/* Intended Trim */}
      <rect x={bx1} y={by} width={bgW} height={bgH} rx={4} fill="none" stroke="var(--primary)" strokeDasharray="4 4" strokeWidth={2.5} opacity={0.6} />
      <text x={bx1 + bgW/2} y={by + 20} textAnchor="middle" fill="var(--primary)" fontSize={11} fontWeight={850}>intended trim</text>

      {/* Physical Paper */}
      <rect x={cut1X} y={cutY} width={cutW} height={cutH} rx={4} fill="var(--card)" stroke="var(--border)" strokeWidth={2} 
        style={{ filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.1))' }} />
        
      {/* Printed Background on Paper */}
      <rect x={bx1} y={by} width={bgW - Math.abs(shift)} height={bgH} rx={2} fill="color-mix(in srgb, var(--primary) 20%, transparent)" />
      
      {/* White Edge Highlight */}
      <rect x={cut1X} y={cutY} width={Math.abs(shift)} height={cutH} rx={4} fill="color-mix(in srgb, var(--danger) 15%, transparent)" stroke="var(--danger)" strokeWidth={2} />
      
      <rect x={cut1X + Math.abs(shift)/2 - 36} y={cutY - 30} width={72} height={20} rx={4} fill="color-mix(in srgb, var(--danger) 12%, var(--card))" stroke="var(--danger)" strokeWidth={1.5} />
      <text x={cut1X + Math.abs(shift)/2} y={cutY - 16} textAnchor="middle" fill="var(--danger)" fontSize={11} fontWeight={900}>white gap</text>
      
      <rect x={cx1 - 80} y={by + bgH + 24} width={160} height={32} rx={8} fill="color-mix(in srgb, var(--danger) 10%, var(--card))" stroke="var(--danger)" strokeWidth={2} />
      <text x={cx1} y={by + bgH + 45} textAnchor="middle" fill="var(--danger)" fontSize={14} fontWeight={850}>paper edge shows</text>

      {/* --- RIGHT PANEL: WITH BLEED --- */}
      <text x={cx2} y={80} textAnchor="middle" fill="var(--foreground)" fontSize={18} fontWeight={900}>WITH BLEED</text>
      
      {/* Bleed Boundary */}
      <rect x={bg2X} y={bg2Y} width={bg2W} height={bg2H} rx={6} fill="color-mix(in srgb, var(--danger) 4%, transparent)" stroke="var(--danger)" strokeDasharray="6 6" strokeWidth={2} />
      <rect x={bg2X + bg2W/2 - 50} y={bg2Y - 10} width={100} height={20} rx={4} fill="var(--card)" stroke="var(--danger)" strokeWidth={1.5} />
      <text x={bg2X + bg2W/2} y={bg2Y + 4} textAnchor="middle" fill="var(--danger)" fontSize={11} fontWeight={850}>required bleed</text>

      {/* Intended Trim */}
      <rect x={bx2} y={by2} width={bgW} height={bgH} rx={4} fill="none" stroke="var(--primary)" strokeDasharray="4 4" strokeWidth={2.5} opacity={0.6} />
      <text x={bx2 + bgW/2} y={by2 + 20} textAnchor="middle" fill="var(--primary)" fontSize={11} fontWeight={850}>intended trim</text>

      {/* Physical Paper */}
      <rect x={cut2X} y={cut2Y} width={cut2W} height={cut2H} rx={4} fill="var(--card)" stroke="var(--border)" strokeWidth={2} 
        style={{ filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.1))' }} />
        
      {/* Printed Background on Paper */}
      <rect x={cut2X} y={cut2Y} width={cut2W} height={cut2H} rx={2} fill="color-mix(in srgb, var(--primary) 20%, transparent)" />
      
      {/* Success Highlight */}
      <rect x={cut2X} y={cut2Y} width={cut2W} height={cut2H} rx={4} fill="none" stroke="var(--success)" strokeWidth={3} />
      
      <rect x={cx2 - 80} y={by2 + bgH + 24} width={160} height={32} rx={8} fill="color-mix(in srgb, var(--success) 10%, var(--card))" stroke="var(--success)" strokeWidth={2} />
      <text x={cx2} y={by2 + bgH + 45} textAnchor="middle" fill="var(--success)" fontSize={14} fontWeight={850}>bleed covers shift</text>

    </g>
  );
}


export function TrimToleranceShift() {
  return (
    <g>
      <Label x={238} y={48}>trim tolerance</Label>
      <rect x={132} y={90} width={536} height={270} rx={22} fill="color-mix(in srgb, var(--primary) 12%, transparent)" stroke="var(--danger)" strokeDasharray="8 8" strokeWidth={3} />
      <rect x={184} y={130} width={432} height={190} rx={18} fill="var(--card)" stroke="var(--primary)" strokeWidth={3} />
      <rect x={228} y={162} width={344} height={126} rx={14} fill="transparent" stroke="var(--success)" strokeDasharray="8 8" strokeWidth={3} />
      <path d="M184 130v190" stroke="var(--danger)" strokeWidth={4} opacity=".75" />
      <path d="M204 130v190" stroke="var(--danger)" strokeWidth={4} strokeDasharray="8 8" opacity=".75" />
      <rect x={72} y={104} width={156} height={46} rx={14} fill="var(--card)" stroke="var(--danger)" strokeWidth={3} />
      <text x={150} y={133} textAnchor="middle" fill="var(--danger)" fontSize={17} fontWeight={950}>cut can shift</text>
      <text x={352} y={224} textAnchor="middle" fill="var(--success)" fontSize={17} fontWeight={950}>safe area</text>
      <text x={262} y={392} fill="var(--muted-foreground)" fontSize={14} fontWeight={850}>bleed gives trimming room</text>
    </g>
  );
}


export function OversizedPrintSheet() {
  return (
    <g>
      <Label x={238} y={48}>oversized print sheet</Label>
      <rect x={94} y={92} width={250} height={292} rx={18} fill="color-mix(in srgb, var(--primary) 14%, transparent)" stroke="var(--danger)" strokeDasharray="8 8" strokeWidth={3} />
      <rect x={124} y={126} width={190} height={224} rx={14} fill="var(--card)" stroke="var(--primary)" strokeWidth={3} />
      <text x={150} y={414} fill="var(--danger)" fontSize={14} fontWeight={950}>printed larger</text>
      <path d="M374 236h72" stroke="var(--primary)" strokeWidth={4} strokeDasharray="8 8" />
      <rect x={486} y={126} width={190} height={224} rx={14} fill="var(--card)" stroke="var(--success)" strokeWidth={3} />
      <path d="M486 126h190M486 350h190M486 126v224M676 126v224" stroke="var(--success)" strokeWidth={2} />
      <text x={518} y={414} fill="var(--success)" fontSize={14} fontWeight={950}>final trimmed book</text>
      <text x={548} y={242} fill="var(--foreground)" fontSize={17} fontWeight={950}>result</text>
    </g>
  );
}


export function BlackBackgroundBleed() {
  return (
    <g>
      <Label x={232} y={48}>black background bleed</Label>
      <rect x={104} y={92} width={220} height={280} rx={18} fill="#111827" stroke="var(--danger)" strokeWidth={3} />
      <rect x={104} y={92} width={14} height={280} fill="var(--card)" />
      <text x={174} y={226} fill="white" fontSize={22} fontWeight={950}>BLACK</text>
      <text x={130} y={406} fill="var(--danger)" fontSize={14} fontWeight={950}>high contrast edge</text>

      <rect x={476} y={72} width={256} height={320} rx={22} fill="#111827" stroke="var(--success)" strokeDasharray="8 8" strokeWidth={3} />
      <rect x={510} y={106} width={188} height={252} rx={16} fill="#111827" stroke="var(--success)" strokeWidth={3} />
      <text x={560} y={226} fill="white" fontSize={22} fontWeight={950}>BLACK</text>
      <text x={520} y={406} fill="var(--success)" fontSize={14} fontWeight={950}>black extends out</text>
    </g>
  );
}


export function BorderBackgroundRisk() {
  return (
    <g>
      <Label x={246} y={48}>border trim problem</Label>
      <rect x={100} y={96} width={220} height={270} rx={18} fill="var(--card)" stroke="var(--danger)" strokeWidth={3} />
      <rect x={114} y={110} width={192} height={242} rx={13} fill="transparent" stroke="var(--danger)" strokeWidth={5} />
      <path d="M100 96h220v22H100Z" fill="var(--card)" opacity=".92" />
      <text x={136} y={406} fill="var(--danger)" fontSize={14} fontWeight={950}>edge frame shifts</text>

      <rect x={480} y={96} width={220} height={270} rx={18} fill="var(--card)" stroke="var(--success)" strokeWidth={3} />
      <rect x={526} y={148} width={128} height={166} rx={13} fill="transparent" stroke="var(--success)" strokeWidth={5} />
      <text x={520} y={406} fill="var(--success)" fontSize={14} fontWeight={950}>frame moved inward</text>
    </g>
  );
}


export function CanvaBackgroundBleed() {
  const steps = [
    ['Show bleed', 'guides on'],
    ['Extend bg', 'past line'],
    ['Keep text', 'inside'],
    ['PDF Print', 'verify'],
  ];
  return (
    <g>
      <Label x={224} y={48}>Canva bleed workflow</Label>
      {steps.map(([top, bottom], index) => {
        const x = 70 + index * 178;
        return (
          <g key={top}>
            <rect x={x} y={126} width={132} height={92} rx={16} fill="var(--card)" stroke={index === 3 ? 'var(--success)' : 'var(--primary)'} strokeWidth={3} />
            <text x={x + 66} y={164} textAnchor="middle" fill="var(--foreground)" fontSize={14} fontWeight={950}>{top}</text>
            <text x={x + 66} y={192} textAnchor="middle" fill="var(--muted-foreground)" fontSize={12} fontWeight={850}>{bottom}</text>
            {index < steps.length - 1 && <path d={`M${x + 142} 172h28`} stroke="var(--primary)" strokeWidth={3} strokeDasharray="7 7" />}
          </g>
        );
      })}
      <rect x={208} y={286} width={384} height={76} rx={18} fill="color-mix(in srgb, var(--primary) 12%, transparent)" stroke="var(--danger)" strokeDasharray="8 8" strokeWidth={3} />
      <rect x={246} y={306} width={308} height={36} rx={10} fill="var(--card)" stroke="var(--success)" strokeWidth={2.5} />
      <text x={400} y={330} textAnchor="middle" fill="var(--success)" fontSize={13} fontWeight={950}>background crosses bleed guide</text>
    </g>
  );
}


export function BleedSafeLayout() {
  return (
    <g>
      <Label x={230} y={48}>bleed / trim / safe</Label>
      <rect x={170} y={78} width={460} height={312} rx={22} fill="color-mix(in srgb, var(--danger) 8%, transparent)" stroke="var(--danger)" strokeDasharray="8 8" strokeWidth={3} />
      <rect x={214} y={120} width={372} height={226} rx={18} fill="color-mix(in srgb, var(--primary) 12%, var(--card))" stroke="var(--primary)" strokeWidth={3} />
      <rect x={278} y={176} width={244} height={114} rx={14} fill="color-mix(in srgb, var(--success) 10%, var(--card))" stroke="var(--success)" strokeDasharray="8 8" strokeWidth={3} />
      <text x={400} y={226} textAnchor="middle" fill="var(--foreground)" fontSize={17} fontWeight={950}>text here</text>
      <text x={82} y={116} fill="var(--danger)" fontSize={14} fontWeight={950}>bleed</text>
      <text x={604} y={144} fill="var(--primary)" fontSize={14} fontWeight={950}>trim</text>
      <text x={548} y={252} fill="var(--success)" fontSize={14} fontWeight={950}>safe area</text>
    </g>
  );
}


export function CorrectEdgeBackground() {
  return (
    <g>
      <Label x={202} y={48}>correct edge-to-edge background</Label>
      <rect x={150} y={78} width={500} height={310} rx={22} fill="color-mix(in srgb, var(--primary) 20%, transparent)" stroke="var(--success)" strokeDasharray="8 8" strokeWidth={3} />
      <rect x={194} y={120} width={412} height={226} rx={18} fill="color-mix(in srgb, var(--primary) 24%, transparent)" stroke="var(--primary)" strokeWidth={3} />
      <rect x={286} y={178} width={228} height={84} rx={14} fill="var(--card)" stroke="var(--success)" strokeWidth={3} />
      <text x={400} y={228} textAnchor="middle" fill="var(--success)" fontSize={17} fontWeight={950}>content protected</text>
      <circle cx={628} cy={344} r={26} fill="var(--card)" stroke="var(--success)" strokeWidth={4} />
      <path d="M616 343l9 9 18-22" fill="none" stroke="var(--success)" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}


export function TrimEdgeOnlySetup() {
  return (
    <g>
      <Label x={232} y={48}>trim-edge-only setup</Label>
      <rect x={166} y={82} width={468} height={304} rx={22} fill="var(--card)" stroke="var(--danger)" strokeDasharray="8 8" strokeWidth={3} />
      <rect x={210} y={126} width={380} height={216} rx={18} fill="color-mix(in srgb, var(--primary) 20%, transparent)" stroke="var(--danger)" strokeWidth={3} />
      <path d="M210 126v216" stroke="var(--card)" strokeWidth={18} opacity=".92" />
      <text x={316} y={226} fill="var(--foreground)" fontSize={17} fontWeight={950}>background stops</text>
      <rect x={74} y={188} width={126} height={38} rx={11} fill="var(--card)" stroke="var(--danger)" strokeWidth={3} />
      <text x={137} y={213} textAnchor="middle" fill="var(--danger)" fontSize={14} fontWeight={950}>no bleed</text>
      <text x={500} y={400} fill="var(--danger)" fontSize={14} fontWeight={950}>white edge risk</text>
    </g>
  );
}


