import type React from 'react';
import { Label } from './shared';

const LCCard = ({ x, title, examples, isbn, tone, color }: { x: number; title: string; examples: string; isbn: string; tone: string; color: string }) => (
  <g>
    <rect x={x} y={82} width={296} height={276} rx={18} fill="var(--card)" stroke={color} strokeWidth={2.5} />
    <rect x={x + 20} y={106} width={256} height={42} rx={12} fill={`color-mix(in srgb, ${color} 10%, transparent)`} stroke={color} strokeWidth={1.5} />
    <text x={x + 148} y={132} textAnchor="middle" fill={color} fontSize={15} fontWeight={950}>{title}</text>
    {[
      ['Examples', examples],
      ['ISBN', isbn],
      ['Meaning', tone],
    ].map(([label, value], index) => {
      const y = 176 + index * 56;
      return (
        <g key={label}>
          <text x={x + 26} y={y} fill="var(--muted-foreground)" fontSize={10} fontWeight={900}>{label.toUpperCase()}</text>
          <rect x={x + 24} y={y + 10} width={248} height={30} rx={8} fill="color-mix(in srgb, var(--foreground) 4%, transparent)" stroke="var(--border)" strokeWidth={1} />
          <text x={x + 38} y={y + 30} fill="var(--foreground)" fontSize={11} fontWeight={800}>{value}</text>
        </g>
      );
    })}
  </g>
);

export function LowContentVsRegular() {
  return (
    <g>
      <Label x={214} y={46}>low content vs regular KDP books</Label>
      <LCCard
        x={82}
        title="Low Content"
        examples="journals · planners · logbooks"
        isbn="free KDP ISBN not eligible"
        tone="classification, not punishment"
        color="var(--primary)"
      />
      <LCCard
        x={422}
        title="Regular Book"
        examples="novels · memoirs · textbooks"
        isbn="free KDP ISBN usually available"
        tone="reader consumes written content"
        color="var(--success)"
      />
      <rect x={204} y={382} width={392} height={38} rx={14} fill="var(--card)" stroke="var(--border)" strokeWidth={2} />
      <text x={400} y={397} textAnchor="middle" fill="var(--muted-foreground)" fontSize={10} fontWeight={850}>KDP uses labels for</text>
      <text x={400} y={414} textAnchor="middle" fill="var(--foreground)" fontSize={12} fontWeight={950}>ISBN options · metadata · distribution rules</text>
    </g>
  );
}


export function LowContentClassificationFlow() {
  const steps = [
    ['Interior type', 'lined · prompts · puzzles'],
    ['KDP label', 'low content checkbox'],
    ['ISBN options', 'free ISBN unavailable'],
    ['Publishing checks', 'metadata + layout'],
  ];

  return (
    <g>
      <Label x={194} y={48}>how the low-content classification is used</Label>
      {steps.map(([top, bottom], index) => {
        const x = 54 + index * 186;
        const final = index === steps.length - 1;
        return (
          <g key={top}>
            <rect x={x} y={130} width={144} height={96} rx={16} fill="var(--card)" stroke={final ? 'var(--success)' : 'var(--primary)'} strokeWidth={2.5} />
            <text x={x + 72} y={166} textAnchor="middle" fill="var(--foreground)" fontSize={13} fontWeight={950}>{top}</text>
            <text x={x + 72} y={194} textAnchor="middle" fill="var(--muted-foreground)" fontSize={10} fontWeight={800}>{bottom}</text>
            {index < steps.length - 1 && (
              <g>
                <path d={`M${x + 150} 178h24`} stroke="var(--primary)" strokeWidth={2.5} strokeDasharray="6 5" />
                <path d={`M${x + 164} 166l12 12-12 12`} fill="none" stroke="var(--primary)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
              </g>
            )}
          </g>
        );
      })}
      <rect x={178} y={286} width={444} height={54} rx={15} fill="color-mix(in srgb, var(--primary) 8%, var(--card))" stroke="var(--primary)" strokeWidth={2} />
      <text x={400} y={308} textAnchor="middle" fill="var(--foreground)" fontSize={13} fontWeight={950}>not a rejection · not an account strike · not a quality verdict</text>
      <text x={400} y={329} textAnchor="middle" fill="var(--muted-foreground)" fontSize={11} fontWeight={750}>it mainly changes publishing options and marketplace handling</text>
    </g>
  );
}


export function ColoringBookGrayArea() {
  return (
    <g>
      <Label x={184} y={48}>why coloring books can feel like a gray area</Label>

      <rect x={80} y={104} width={250} height={232} rx={18} fill="var(--card)" stroke="var(--primary)" strokeWidth={2.5} />
      <text x={205} y={134} textAnchor="middle" fill="var(--primary)" fontSize={14} fontWeight={950}>Low-content leaning</text>
      <rect x={124} y={164} width={162} height={112} rx={10} fill="color-mix(in srgb, var(--primary) 7%, transparent)" stroke="var(--border)" strokeWidth={1.5} />
      <path d="M156 244c34-62 78-62 102 0" fill="none" stroke="var(--foreground)" strokeWidth={3} opacity={0.45} />
      <text x={205} y={306} textAnchor="middle" fill="var(--muted-foreground)" fontSize={11} fontWeight={800}>single-purpose pages</text>

      <rect x={470} y={104} width={250} height={232} rx={18} fill="var(--card)" stroke="var(--success)" strokeWidth={2.5} />
      <text x={595} y={134} textAnchor="middle" fill="var(--success)" fontSize={14} fontWeight={950}>Activity-book leaning</text>
      <rect x={514} y={164} width={162} height={112} rx={10} fill="color-mix(in srgb, var(--success) 7%, transparent)" stroke="var(--border)" strokeWidth={1.5} />
      <rect x={534} y={184} width={122} height={10} rx={4} fill="var(--foreground)" opacity={0.22} />
      <rect x={534} y={205} width={90} height={10} rx={4} fill="var(--foreground)" opacity={0.18} />
      <path d="M542 252c28-42 64-42 88 0" fill="none" stroke="var(--foreground)" strokeWidth={2.5} opacity={0.35} />
      <text x={595} y={306} textAnchor="middle" fill="var(--muted-foreground)" fontSize={11} fontWeight={800}>instructions + varied tasks</text>

      <rect x={326} y={196} width={148} height={50} rx={15} fill="var(--card)" stroke="var(--border)" strokeWidth={2} />
      <text x={400} y={216} textAnchor="middle" fill="var(--foreground)" fontSize={12} fontWeight={950}>classification</text>
      <text x={400} y={236} textAnchor="middle" fill="var(--muted-foreground)" fontSize={10} fontWeight={800}>depends on use case</text>
    </g>
  );
}


export function LowContentPrintRiskMap() {
  const risks = [
    ['Bleed', 'edge art needs spare area', 'var(--danger)'],
    ['Safe area', 'text and borders inward', 'var(--success)'],
    ['Resolution', 'avoid blurry PNG pages', 'var(--primary)'],
    ['File size', 'flatten heavy exports', 'var(--primary)'],
  ];

  return (
    <g>
      <Label x={172} y={46}>low-content print risks to check before upload</Label>
      <rect x={96} y={90} width={236} height={286} rx={18} fill="color-mix(in srgb, var(--primary) 7%, var(--card))" stroke="var(--border)" strokeWidth={2} />
      <rect x={126} y={124} width={176} height={224} rx={10} fill="var(--card)" stroke="var(--border)" strokeWidth={1.5} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <line key={i} x1={148} y1={158 + i * 28} x2={280} y2={158 + i * 28} stroke="var(--foreground)" strokeWidth={2} opacity={0.14} />
      ))}
      <rect x={126} y={124} width={176} height={224} rx={10} fill="transparent" stroke="var(--danger)" strokeWidth={2} strokeDasharray="7 5" />
      <rect x={154} y={152} width={120} height={168} rx={8} fill="transparent" stroke="var(--success)" strokeWidth={2} strokeDasharray="6 4" />

      {risks.map(([label, note, color], index) => {
        const y = 102 + index * 74;
        return (
          <g key={label}>
            <rect x={396} y={y} width={318} height={52} rx={12} fill="var(--card)" stroke={color} strokeWidth={1.8} />
            <circle cx={420} cy={y + 26} r={12} fill={`color-mix(in srgb, ${color} 12%, transparent)`} />
            <text x={420} y={y + 26} textAnchor="middle" dominantBaseline="central" fill={color} fontSize={11} fontWeight={950}>!</text>
            <text x={444} y={y + 22} fill="var(--foreground)" fontSize={12} fontWeight={950}>{label}</text>
            <text x={444} y={y + 40} fill="var(--muted-foreground)" fontSize={10} fontWeight={750}>{note}</text>
          </g>
        );
      })}
    </g>
  );
}


export function DigitalVsProofCopy() {
  return (
    <g>
      <Label x={210} y={46}>why digital PDFs look better than print</Label>

      <rect x={78} y={94} width={282} height={230} rx={18} fill="var(--card)" stroke="var(--primary)" strokeWidth={2.5} />
      <rect x={108} y={126} width={222} height={138} rx={12} fill="color-mix(in srgb, var(--primary) 13%, transparent)" stroke="var(--primary)" strokeWidth={2} />
      <rect x={144} y={160} width={150} height={28} rx={7} fill="var(--foreground)" opacity={0.85} />
      <text x={219} y={180} textAnchor="middle" fill="var(--card)" fontSize={13} fontWeight={950}>PDF PREVIEW</text>
      <rect x={156} y={204} width={126} height={10} rx={5} fill="var(--primary)" opacity={0.45} />
      <text x={219} y={296} textAnchor="middle" fill="var(--primary)" fontSize={13} fontWeight={950}>screen emits light</text>

      <rect x={440} y={94} width={282} height={230} rx={18} fill="var(--card)" stroke="var(--danger)" strokeWidth={2.5} />
      <rect x={470} y={126} width={222} height={138} rx={12} fill="color-mix(in srgb, var(--foreground) 6%, var(--card))" stroke="var(--border)" strokeWidth={2} />
      <rect x={506} y={162} width={150} height={26} rx={7} fill="var(--foreground)" opacity={0.58} />
      <text x={581} y={181} textAnchor="middle" fill="var(--card)" fontSize={12} fontWeight={950}>PROOF COPY</text>
      <rect x={518} y={204} width={126} height={10} rx={5} fill="var(--muted-foreground)" opacity={0.28} />
      <path d="M470 246h222" stroke="var(--danger)" strokeWidth={2} strokeDasharray="6 5" opacity={0.65} />
      <text x={581} y={296} textAnchor="middle" fill="var(--danger)" fontSize={13} fontWeight={950}>paper absorbs light</text>

      <rect x={292} y={172} width={216} height={44} rx={14} fill="var(--card)" stroke="var(--border)" strokeWidth={2} />
      <text x={400} y={190} textAnchor="middle" fill="var(--muted-foreground)" fontSize={10} fontWeight={850}>proof reveals</text>
      <text x={400} y={208} textAnchor="middle" fill="var(--foreground)" fontSize={12} fontWeight={950}>trim · blur · dull color</text>

      <rect x={164} y={358} width={472} height={34} rx={12} fill="color-mix(in srgb, var(--danger) 7%, var(--card))" stroke="var(--danger)" strokeWidth={2} />
      <text x={400} y={380} textAnchor="middle" fill="var(--danger)" fontSize={12} fontWeight={900}>the proof is not harsher — it is more honest about print production</text>
    </g>
  );
}


const LayoutCover = ({ x, premium }: { x: number; premium: boolean }) => (
  <g>
    <rect x={x} y={92} width={230} height={292} rx={10} fill="var(--card)" stroke={premium ? 'var(--success)' : 'var(--danger)'} strokeWidth={2.5} />
    {premium ? (
      <>
        <rect x={x + 48} y={132} width={134} height={40} rx={7} fill="var(--foreground)" opacity={0.78} />
        <text x={x + 115} y={158} textAnchor="middle" fill="var(--card)" fontSize={13} fontWeight={950}>TITLE</text>
        <rect x={x + 66} y={196} width={98} height={10} rx={5} fill="var(--muted-foreground)" opacity={0.35} />
        <text x={x + 115} y={330} textAnchor="middle" fill="var(--muted-foreground)" fontSize={10} fontWeight={750}>Author Name</text>
        <rect x={x + 36} y={116} width={158} height={232} rx={9} fill="transparent" stroke="var(--success)" strokeWidth={1.6} strokeDasharray="6 5" />
      </>
    ) : (
      <>
        <rect x={x + 12} y={106} width={206} height={268} rx={7} fill="transparent" stroke="var(--danger)" strokeWidth={2.2} />
        <rect x={x + 26} y={122} width={178} height={28} rx={6} fill="var(--foreground)" opacity={0.7} />
        <text x={x + 115} y={142} textAnchor="middle" fill="var(--card)" fontSize={12} fontWeight={950}>TITLE</text>
        <rect x={x + 22} y={168} width={186} height={8} rx={4} fill="var(--muted-foreground)" opacity={0.32} />
        <rect x={x + 22} y={184} width={178} height={8} rx={4} fill="var(--muted-foreground)" opacity={0.28} />
        <rect x={x + 34} y={212} width={162} height={72} rx={8} fill="color-mix(in srgb, var(--primary) 10%, transparent)" stroke="var(--border)" />
        <text x={x + 115} y={360} textAnchor="middle" fill="var(--danger)" fontSize={10} fontWeight={850}>too close to trim</text>
      </>
    )}
  </g>
);

export function CheapVsPremiumLayout() {
  return (
    <g>
      <Label x={186} y={46}>cheap-looking vs premium-looking layout</Label>
      <LayoutCover x={126} premium={false} />
      <LayoutCover x={444} premium />
      <rect x={154} y={398} width={174} height={28} rx={9} fill="color-mix(in srgb, var(--danger) 8%, var(--card))" stroke="var(--danger)" strokeWidth={2} />
      <text x={241} y={416} textAnchor="middle" fill="var(--danger)" fontSize={11} fontWeight={950}>crowded + fragile</text>
      <rect x={474} y={398} width={170} height={28} rx={9} fill="color-mix(in srgb, var(--success) 8%, var(--card))" stroke="var(--success)" strokeWidth={2} />
      <text x={559} y={416} textAnchor="middle" fill="var(--success)" fontSize={11} fontWeight={950}>calm + print-safe</text>
      <rect x={360} y={218} width={80} height={34} rx={12} fill="var(--card)" stroke="var(--border)" strokeWidth={2} />
      <text x={400} y={240} textAnchor="middle" fill="var(--muted-foreground)" fontSize={12} fontWeight={900}>adjust</text>
    </g>
  );
}


export function ProofCopyIterationFlow() {
  const steps = [
    ['Inspect proof', 'trim · color · blur'],
    ['Fix source', 'layout + contrast'],
    ['Export PDF', 'print settings'],
    ['Proof again', 'approve later'],
  ];

  return (
    <g>
      <Label x={210} y={48}>professional proof-copy workflow</Label>
      {steps.map(([top, bottom], index) => {
        const x = 58 + index * 184;
        const done = index === steps.length - 1;
        return (
          <g key={top}>
            <rect x={x} y={138} width={142} height={92} rx={16} fill="var(--card)" stroke={done ? 'var(--success)' : 'var(--primary)'} strokeWidth={2.5} />
            <text x={x + 71} y={173} textAnchor="middle" fill="var(--foreground)" fontSize={13} fontWeight={950}>{top}</text>
            <text x={x + 71} y={200} textAnchor="middle" fill="var(--muted-foreground)" fontSize={10} fontWeight={800}>{bottom}</text>
            {index < steps.length - 1 && (
              <path d={`M${x + 150} 184h24`} stroke="var(--primary)" strokeWidth={2.5} strokeDasharray="6 5" />
            )}
          </g>
        );
      })}
      <rect x={182} y={290} width={436} height={54} rx={15} fill="color-mix(in srgb, var(--success) 8%, var(--card))" stroke="var(--success)" strokeWidth={2} />
      <text x={400} y={312} textAnchor="middle" fill="var(--foreground)" fontSize={13} fontWeight={950}>proof copies are part of production</text>
      <text x={400} y={333} textAnchor="middle" fill="var(--muted-foreground)" fontSize={11} fontWeight={750}>not evidence that your first design failed forever</text>
    </g>
  );
}


export function DarkColoringDigitalVsPrint() {
  return (
    <g>
      <Label x={174} y={46}>why black coloring pages look different in print</Label>
      <rect x={88} y={92} width={260} height={266} rx={18} fill="var(--card)" stroke="var(--primary)" strokeWidth={2.5} />
      <rect x={128} y={126} width={180} height={180} rx={14} fill="color-mix(in srgb, var(--foreground) 88%, var(--card))" stroke="var(--primary)" strokeWidth={2} />
      <path d="M168 252c24-82 76-82 100 0" fill="none" stroke="var(--card)" strokeWidth={5} opacity={0.78} />
      <circle cx={218} cy={204} r={48} fill="none" stroke="var(--card)" strokeWidth={4} opacity={0.6} />
      <text x={218} y={332} textAnchor="middle" fill="var(--primary)" fontSize={13} fontWeight={950}>screen preview</text>

      <rect x={452} y={92} width={260} height={266} rx={18} fill="var(--card)" stroke="var(--danger)" strokeWidth={2.5} />
      <rect x={492} y={126} width={180} height={180} rx={14} fill="color-mix(in srgb, var(--foreground) 72%, var(--card))" stroke="var(--border)" strokeWidth={2} />
      <path d="M532 252c24-82 76-82 100 0" fill="none" stroke="var(--card)" strokeWidth={4} opacity={0.38} />
      <circle cx={582} cy={204} r={48} fill="none" stroke="var(--card)" strokeWidth={3} opacity={0.28} />
      <rect x={530} y={176} width={104} height={26} rx={8} fill="color-mix(in srgb, var(--danger) 10%, var(--card))" stroke="var(--danger)" strokeWidth={1.5} />
      <text x={582} y={193} textAnchor="middle" fill="var(--danger)" fontSize={10} fontWeight={900}>details merge</text>
      <text x={582} y={332} textAnchor="middle" fill="var(--danger)" fontSize={13} fontWeight={950}>physical proof</text>

      <rect x={318} y={184} width={164} height={44} rx={14} fill="var(--card)" stroke="var(--border)" strokeWidth={2} />
      <text x={400} y={202} textAnchor="middle" fill="var(--muted-foreground)" fontSize={10} fontWeight={850}>ink + paper</text>
      <text x={400} y={220} textAnchor="middle" fill="var(--foreground)" fontSize={12} fontWeight={950}>reduce contrast</text>
    </g>
  );
}


const ContrastPanel = ({ x, title, strong }: { x: number; title: string; strong: boolean }) => (
  <g>
    <rect x={x} y={100} width={244} height={248} rx={18} fill="var(--card)" stroke={strong ? 'var(--success)' : 'var(--danger)'} strokeWidth={2.5} />
    <rect x={x + 42} y={132} width={160} height={150} rx={14} fill={`color-mix(in srgb, var(--foreground) ${strong ? '78%' : '62%'}, var(--card))`} stroke="var(--border)" strokeWidth={2} />
    <text x={x + 122} y={166} textAnchor="middle" fill="var(--card)" fontSize={strong ? 16 : 13} fontWeight={950} opacity={strong ? 0.9 : 0.55}>12</text>
    <text x={x + 90} y={218} textAnchor="middle" fill="var(--card)" fontSize={strong ? 15 : 12} fontWeight={950} opacity={strong ? 0.82 : 0.45}>38</text>
    <text x={x + 154} y={238} textAnchor="middle" fill="var(--card)" fontSize={strong ? 15 : 12} fontWeight={950} opacity={strong ? 0.82 : 0.45}>44</text>
    <text x={x + 122} y={316} textAnchor="middle" fill={strong ? 'var(--success)' : 'var(--danger)'} fontSize={13} fontWeight={950}>{title}</text>
  </g>
);

export function MatteVsGlossyColoringContrast() {
  return (
    <g>
      <Label x={192} y={48}>matte vs glossy contrast expectations</Label>
      <ContrastPanel x={118} title="matte: softer contrast" strong={false} />
      <ContrastPanel x={438} title="glossier: more pop" strong />
      <rect x={250} y={382} width={300} height={34} rx={12} fill="var(--card)" stroke="var(--border)" strokeWidth={2} />
      <text x={400} y={404} textAnchor="middle" fill="var(--muted-foreground)" fontSize={11} fontWeight={850}>cover finish differs from interior paper behavior</text>
    </g>
  );
}


const BWPage = ({ x, pure }: { x: number; pure: boolean }) => (
  <g>
    <rect x={x} y={94} width={238} height={288} rx={18} fill="var(--card)" stroke={pure ? 'var(--danger)' : 'var(--success)'} strokeWidth={2.5} />
    <rect x={x + 38} y={128} width={162} height={190} rx={12} fill={pure ? 'var(--foreground)' : 'color-mix(in srgb, var(--foreground) 82%, var(--card))'} />
    {[0, 1, 2, 3].map((i) => (
      <text key={i} x={x + 78 + i * 28} y={186 + (i % 2) * 58} textAnchor="middle" fill="var(--card)" fontSize={pure ? 10 : 14} fontWeight={950} opacity={pure ? 0.33 : 0.72}>{12 + i * 7}</text>
    ))}
    <path d={`M${x + 78} 276c28-54 66-54 92 0`} fill="none" stroke="var(--card)" strokeWidth={pure ? 2 : 4} opacity={pure ? 0.25 : 0.58} />
    <text x={x + 119} y={350} textAnchor="middle" fill={pure ? 'var(--danger)' : 'var(--success)'} fontSize={13} fontWeight={950}>{pure ? 'pure black overload' : 'print-safe charcoal'}</text>
  </g>
);

export function PureBlackVsDarkGray() {
  return (
    <g>
      <Label x={202} y={48}>pure black vs print-safe dark gray</Label>
      <BWPage x={124} pure />
      <BWPage x={438} pure={false} />
      <rect x={304} y={196} width={192} height={42} rx={13} fill="var(--card)" stroke="var(--border)" strokeWidth={2} />
      <text x={400} y={213} textAnchor="middle" fill="var(--muted-foreground)" fontSize={10} fontWeight={850}>goal</text>
      <text x={400} y={231} textAnchor="middle" fill="var(--foreground)" fontSize={12} fontWeight={950}>separation, not max ink</text>
    </g>
  );
}


const MuddyPage = ({ x, clean }: { x: number; clean: boolean }) => (
  <g>
    <rect x={x} y={92} width={242} height={288} rx={18} fill="var(--card)" stroke={clean ? 'var(--success)' : 'var(--danger)'} strokeWidth={2.5} />
    <rect x={x + 36} y={128} width={170} height={196} rx={12} fill="color-mix(in srgb, var(--foreground) 8%, var(--card))" stroke="var(--border)" strokeWidth={2} />
    {clean ? (
      <>
        <circle cx={x + 121} cy={210} r={58} fill="none" stroke="var(--foreground)" strokeWidth={4} opacity={0.62} />
        <path d={`M${x + 74} ${244}c32-56 72-56 96 0`} fill="none" stroke="var(--foreground)" strokeWidth={4} opacity={0.62} />
        <text x={x + 86} y={180} fill="var(--foreground)" fontSize={15} fontWeight={950} opacity={0.72}>12</text>
        <text x={x + 148} y={250} fill="var(--foreground)" fontSize={15} fontWeight={950} opacity={0.72}>27</text>
      </>
    ) : (
      <>
        {[0, 1, 2, 3, 4].map((i) => <circle key={i} cx={x + 72 + i * 24} cy={188 + (i % 2) * 28} r={34} fill="none" stroke="var(--foreground)" strokeWidth={2} opacity={0.16} />)}
        <text x={x + 86} y={180} fill="var(--foreground)" fontSize={9} fontWeight={950} opacity={0.26}>12</text>
        <text x={x + 148} y={250} fill="var(--foreground)" fontSize={9} fontWeight={950} opacity={0.22}>27</text>
      </>
    )}
    <text x={x + 121} y={352} textAnchor="middle" fill={clean ? 'var(--success)' : 'var(--danger)'} fontSize={13} fontWeight={950}>{clean ? 'print-safe clarity' : 'muddy midtones'}</text>
  </g>
);

export function MuddyVsCleanColoringPages() {
  return (
    <g>
      <Label x={182} y={48}>muddy vs print-safe coloring pages</Label>
      <MuddyPage x={124} clean={false} />
      <MuddyPage x={438} clean />
      <rect x={324} y={394} width={152} height={30} rx={10} fill="var(--card)" stroke="var(--border)" strokeWidth={2} />
      <text x={400} y={414} textAnchor="middle" fill="var(--muted-foreground)" fontSize={11} fontWeight={850}>separate values clearly</text>
    </g>
  );
}

// ─── Border article diagrams ─────────────────────────────────────────────────


