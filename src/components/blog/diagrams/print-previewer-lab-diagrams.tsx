import type React from 'react';
import { Label } from './shared';

const Panel = ({ x, y, w, h, tone = 'primary' }: { x: number; y: number; w: number; h: number; tone?: 'primary' | 'success' | 'danger' | 'warning' }) => {
  const color = tone === 'success' ? 'var(--success)' : tone === 'danger' ? 'var(--danger)' : tone === 'warning' ? 'var(--warning)' : 'var(--primary)';
  return <rect x={x} y={y} width={w} height={h} rx={18} fill="var(--card)" stroke={color} strokeWidth={2.6} />;
};

const LabBadge = ({ x, y, label, tone = 'primary', w = 150 }: { x: number; y: number; label: string; tone?: 'primary' | 'success' | 'danger' | 'warning'; w?: number }) => {
  const color = tone === 'success' ? 'var(--success)' : tone === 'danger' ? 'var(--danger)' : tone === 'warning' ? 'var(--warning)' : 'var(--primary)';
  return (
    <g>
      <rect x={x} y={y} width={w} height={34} rx={10} fill="var(--card)" stroke={color} strokeWidth={2} />
      <text x={x + w / 2} y={y + 22} textAnchor="middle" fill={color} fontSize={11} fontWeight={950}>{label}</text>
    </g>
  );
};

const OpenBook = ({ x, y, danger = false }: { x: number; y: number; danger?: boolean }) => (
  <g>
    <path d={`M${x} ${y + 18}c56-28 112-18 150 14v168c-48-28-96-34-150-10Z`} fill="var(--card)" stroke={danger ? 'var(--danger)' : 'var(--border)'} strokeWidth={2.5} />
    <path d={`M${x + 150} ${y + 32}c38-32 94-42 150-14v172c-54-24-102-18-150 10Z`} fill="var(--card)" stroke={danger ? 'var(--danger)' : 'var(--border)'} strokeWidth={2.5} />
    <path d={`M${x + 150} ${y + 32}v168`} stroke="var(--primary)" strokeWidth={2.4} />
    <path d={`M${x + 32} ${y + 76}h76M${x + 32} ${y + 106}h92M${x + 184} ${y + 76}h84M${x + 184} ${y + 106}h68`} stroke="var(--muted-foreground)" strokeWidth={6} strokeLinecap="round" opacity={0.18} />
  </g>
);

export function PrintLabHeroScene() {
  return (
    <g>
      <Label x={214} y={46}>KDP print preview laboratory</Label>
      <rect x={112} y={92} width={576} height={276} rx={26} fill="color-mix(in srgb, var(--primary) 6%, var(--card))" stroke="var(--border)" strokeWidth={2.5} />
      <rect x={154} y={292} width={492} height={44} rx={18} fill="color-mix(in srgb, var(--foreground) 8%, transparent)" />
      <OpenBook x={250} y={130} />
      <rect x={310} y={92} width={180} height={28} rx={12} fill="var(--card)" stroke="var(--primary)" strokeWidth={2} />
      <path d="M400 120v34" stroke="var(--primary)" strokeWidth={4} strokeLinecap="round" opacity={0.65} />
      <circle cx={400} cy={152} r={24} fill="color-mix(in srgb, var(--primary) 14%, transparent)" stroke="var(--primary)" strokeWidth={2.5} />
      <LabBadge x={92} y={390} label="margins" />
      <LabBadge x={250} y={390} label="bleed" tone="danger" />
      <LabBadge x={408} y={390} label="safe area" tone="success" />
      <LabBadge x={566} y={390} label="cover alignment" tone="warning" />
    </g>
  );
}

export function PreviewGenerationMachine() {
  return (
    <g>
      <Label x={216} y={46}>preview generation machine</Label>
      <rect x={70} y={230} width={660} height={34} rx={17} fill="color-mix(in srgb, var(--foreground) 10%, transparent)" />
      <Panel x={96} y={112} w={150} h={120} />
      <text x={171} y={180} textAnchor="middle" fill="var(--primary)" fontSize={20} fontWeight={950}>PDF</text>
      <Panel x={324} y={94} w={152} h={148} tone="warning" />
      <circle cx={400} cy={168} r={38} fill="none" stroke="var(--warning)" strokeWidth={7} opacity={0.55} />
      <path d="M400 130v76M362 168h76" stroke="var(--warning)" strokeWidth={4} strokeLinecap="round" opacity={0.6} />
      <Panel x={554} y={112} w={150} h={120} tone="success" />
      <text x={629} y={168} textAnchor="middle" fill="var(--success)" fontSize={14} fontWeight={950}>preview</text>
      <text x={629} y={190} textAnchor="middle" fill="var(--success)" fontSize={14} fontWeight={950}>pages</text>
      <LabBadge x={306} y={318} w={188} label="rendering engine" tone="warning" />
    </g>
  );
}

export function MarginInspectionStation() {
  return (
    <g>
      <Label x={224} y={46}>margin inspection station</Label>
      <rect x={120} y={100} width={560} height={250} rx={24} fill="var(--card)" stroke="var(--border)" strokeWidth={2.6} />
      <rect x={314} y={126} width={172} height={206} rx={14} fill="var(--card)" stroke="var(--primary)" strokeWidth={2.5} />
      <rect x={340} y={152} width={120} height={154} rx={8} fill="transparent" stroke="var(--success)" strokeDasharray="7 6" strokeWidth={2.4} />
      <path d="M198 168h132M198 270h132M470 168h132M470 270h132" stroke="var(--danger)" strokeWidth={2.5} strokeDasharray="8 6" />
      <circle cx={198} cy={168} r={12} fill="color-mix(in srgb, var(--danger) 15%, var(--card))" stroke="var(--danger)" strokeWidth={2} />
      <circle cx={602} cy={270} r={12} fill="color-mix(in srgb, var(--danger) 15%, var(--card))" stroke="var(--danger)" strokeWidth={2} />
      <LabBadge x={126} y={378} label="laser margin scan" tone="danger" />
      <LabBadge x={524} y={378} label="safe zone clear" tone="success" />
    </g>
  );
}

export function BleedTestingChamber() {
  return (
    <g>
      <Label x={246} y={46}>bleed testing chamber</Label>
      <rect x={96} y={96} width={608} height={258} rx={28} fill="color-mix(in srgb, var(--danger) 5%, var(--card))" stroke="var(--border)" strokeWidth={2.5} />
      <rect x={138} y={134} width={170} height={182} rx={18} fill="var(--card)" stroke="var(--danger)" strokeWidth={2.6} />
      <rect x={168} y={164} width={110} height={122} rx={10} fill="color-mix(in srgb, var(--primary) 18%, transparent)" stroke="var(--danger)" strokeDasharray="7 6" strokeWidth={2.2} />
      <rect x={492} y={116} width={210} height={222} rx={20} fill="color-mix(in srgb, var(--primary) 14%, transparent)" stroke="var(--success)" strokeDasharray="10 8" strokeWidth={2.6} />
      <rect x={526} y={152} width={142} height={154} rx={12} fill="var(--card)" stroke="var(--success)" strokeWidth={2.4} />
      <path d="M334 224h122m-20-14 20 14-20 14" fill="none" stroke="var(--primary)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      <LabBadge x={132} y={382} label="failed bleed" tone="danger" />
      <LabBadge x={520} y={382} label="bleed covered" tone="success" />
    </g>
  );
}

export function SafeAreaScannerLab() {
  return (
    <g>
      <Label x={252} y={46}>safe area scanner</Label>
      <rect x={116} y={92} width={568} height={278} rx={26} fill="var(--card)" stroke="var(--border)" strokeWidth={2.6} />
      <rect x={286} y={124} width={228} height={216} rx={18} fill="color-mix(in srgb, var(--primary) 7%, transparent)" stroke="var(--primary)" strokeWidth={2.5} />
      <rect x={320} y={154} width={160} height={156} rx={12} fill="transparent" stroke="var(--success)" strokeDasharray="7 6" strokeWidth={2.4} />
      <rect x={338} y={176} width={124} height={30} rx={8} fill="var(--foreground)" opacity={0.78} />
      <text x={400} y={197} textAnchor="middle" fill="var(--card)" fontSize={13} fontWeight={950}>TITLE</text>
      <rect x={318} y={300} width={164} height={16} rx={8} fill="var(--danger)" opacity={0.52} />
      <path d="M238 102v260M562 102v260" stroke="var(--success)" strokeWidth={4} opacity={0.3} />
      <LabBadge x={126} y={390} label="red danger zone" tone="danger" />
      <LabBadge x={524} y={390} label="green safe zone" tone="success" />
    </g>
  );
}

export function BlankPageDetectorLab() {
  return (
    <g>
      <Label x={240} y={46}>blank page detector</Label>
      <rect x={118} y={102} width={564} height={256} rx={26} fill="var(--card)" stroke="var(--border)" strokeWidth={2.6} />
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect x={160 + i * 116} y={146} width={82} height={118} rx={10} fill="var(--card)" stroke={i === 2 ? 'var(--danger)' : 'var(--success)'} strokeWidth={2.4} />
          {i !== 2 && <path d={`M${178 + i * 116} 186h46M${178 + i * 116} 210h38`} stroke="var(--muted-foreground)" strokeWidth={6} strokeLinecap="round" opacity={0.18} />}
          {i === 2 && <text x={201 + i * 116} y={212} textAnchor="middle" fill="var(--danger)" fontSize={13} fontWeight={950}>blank?</text>}
        </g>
      ))}
      <path d="M160 296h430" stroke="var(--primary)" strokeWidth={4} strokeLinecap="round" opacity={0.32} />
      <LabBadge x={300} y={386} w={200} label="accidental blank page check" tone="danger" />
    </g>
  );
}

export function CoverAlignmentTestRig() {
  return (
    <g>
      <Label x={246} y={46}>cover alignment test rig</Label>
      <rect x={84} y={112} width={632} height={218} rx={24} fill="var(--card)" stroke="var(--border)" strokeWidth={2.6} />
      <rect x={120} y={146} width={560} height={150} rx={18} fill="color-mix(in srgb, var(--primary) 5%, transparent)" stroke="var(--border)" strokeWidth={2.4} />
      <rect x={136} y={162} width={196} height={118} rx={12} fill="color-mix(in srgb, var(--muted) 62%, transparent)" stroke="var(--success)" strokeDasharray="7 6" strokeWidth={2} />
      <rect x={356} y={146} width={88} height={150} fill="color-mix(in srgb, var(--primary) 13%, transparent)" stroke="var(--primary)" strokeWidth={2.5} />
      <rect x={468} y={162} width={166} height={118} rx={12} fill="transparent" stroke="var(--success)" strokeDasharray="7 6" strokeWidth={2} />
      <rect x={596} y={236} width={62} height={40} rx={6} fill="color-mix(in srgb, var(--danger) 10%, var(--card))" stroke="var(--danger)" strokeWidth={2} />
      <path d="M400 118v206M80 222h640" stroke="var(--warning)" strokeWidth={2.4} strokeDasharray="9 7" />
      <LabBadge x={126} y={384} label="back cover" />
      <LabBadge x={326} y={384} label="spine" tone="warning" />
      <LabBadge x={526} y={384} label="barcode" tone="danger" />
    </g>
  );
}

export function PreviewerFailureInvestigationRoom() {
  return (
    <g>
      <Label x={208} y={46}>Previewer failure investigation room</Label>
      <rect x={92} y={98} width={616} height={270} rx={28} fill="color-mix(in srgb, var(--foreground) 5%, var(--card))" stroke="var(--border)" strokeWidth={2.6} />
      <Panel x={132} y={138} w={174} h={138} tone="danger" />
      <circle cx={219} cy={207} r={34} fill="none" stroke="var(--muted)" strokeWidth={7} opacity={0.35} />
      <path d="M219 173a34 34 0 1 1-34 34" fill="none" stroke="var(--danger)" strokeWidth={7} strokeLinecap="round" opacity={0.72} />
      <Panel x={346} y={118} w={112} h={170} tone="warning" />
      <text x={402} y={198} textAnchor="middle" fill="var(--warning)" fontSize={18} fontWeight={950}>PDF</text>
      <Panel x={498} y={138} w={170} h={138} tone="primary" />
      <path d="M526 184h112M526 214h78M526 244h98" stroke="var(--primary)" strokeWidth={7} strokeLinecap="round" opacity={0.22} />
      <LabBadge x={144} y={390} label="browser" tone="danger" />
      <LabBadge x={324} y={390} label="file size" tone="warning" />
      <LabBadge x={504} y={390} label="PDF structure" />
    </g>
  );
}

export function DigitalVsPhysicalLab() {
  return (
    <g>
      <Label x={232} y={46}>Previewer vs proof copy</Label>
      <rect x={86} y={112} width={284} height={220} rx={24} fill="var(--card)" stroke="var(--primary)" strokeWidth={2.6} />
      <rect x={126} y={152} width={204} height={120} rx={14} fill="color-mix(in srgb, var(--primary) 12%, transparent)" stroke="var(--primary)" strokeWidth={2.4} />
      <text x={228} y={218} textAnchor="middle" fill="var(--primary)" fontSize={15} fontWeight={950}>digital simulation</text>
      <rect x={430} y={112} width={284} height={220} rx={24} fill="var(--card)" stroke="var(--success)" strokeWidth={2.6} />
      <OpenBook x={452} y={142} />
      <LabBadge x={138} y={374} label="screen check" />
      <LabBadge x={506} y={374} label="physical proof" tone="success" />
    </g>
  );
}

export function FinalApprovalRoom() {
  return (
    <g>
      <Label x={264} y={46}>final preview approval room</Label>
      <rect x={120} y={98} width={560} height={270} rx={28} fill="color-mix(in srgb, var(--success) 6%, var(--card))" stroke="var(--success)" strokeWidth={2.6} />
      <OpenBook x={250} y={132} />
      <circle cx={400} cy={116} r={24} fill="color-mix(in srgb, var(--success) 16%, transparent)" stroke="var(--success)" strokeWidth={3} />
      <path d="M388 116l8 9 18-20" fill="none" stroke="var(--success)" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
      <rect x={282} y={330} width={236} height={38} rx={13} fill="var(--card)" stroke="var(--success)" strokeWidth={2} />
      <text x={400} y={354} textAnchor="middle" fill="var(--success)" fontSize={13} fontWeight={950}>inspection completed</text>
      <LabBadge x={110} y={390} label="margins clear" tone="success" />
      <LabBadge x={325} y={390} label="cover aligned" tone="success" />
      <LabBadge x={540} y={390} label="warnings reviewed" tone="success" />
    </g>
  );
}
