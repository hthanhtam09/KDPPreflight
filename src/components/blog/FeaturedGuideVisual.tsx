import { CheckCircle2, Ruler, ShieldCheck } from 'lucide-react';

export type FeaturedGuideVisualProps = {
  type: 'bleed' | 'trim' | 'spine' | 'safe-area' | 'validator';
  title?: string;
};

const visualCopy = {
  bleed: {
    eyebrow: 'Bleed check',
    title: 'Bleed 0.125"',
    note: 'Artwork extends past trim',
  },
  trim: {
    eyebrow: 'Trim setup',
    title: 'Trim Size',
    note: 'Exact PDF dimensions',
  },
  spine: {
    eyebrow: 'Spine width',
    title: '0.676 in',
    note: 'Page count matched',
  },
  'safe-area': {
    eyebrow: 'Safe area',
    title: 'Content clear',
    note: 'Text stays inside risk zone',
  },
  validator: {
    eyebrow: 'Upload check',
    title: 'Ready to scan',
    note: 'Cover risks detected early',
  },
} as const;

export function FeaturedGuideVisual({ type, title }: FeaturedGuideVisualProps) {
  const copy = visualCopy[type];
  const showSpine = type === 'spine' || type === 'validator';
  const emphasizeSafe = type === 'safe-area';
  const emphasizeTrim = type === 'trim';

  return (
    <div className="relative h-full min-h-[300px] overflow-hidden bg-muted/30">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_18%,color-mix(in_srgb,var(--primary)_20%,transparent),transparent_34%),linear-gradient(90deg,color-mix(in_srgb,var(--foreground)_5%,transparent)_1px,transparent_1px),linear-gradient(0deg,color-mix(in_srgb,var(--foreground)_4%,transparent)_1px,transparent_1px)] bg-[length:auto,32px_32px,32px_32px]" />

      <div className="absolute inset-x-5 top-5 flex items-center justify-between gap-3 sm:inset-x-6 sm:top-6">
        <span className="rounded-full border border-primary/20 bg-card/80 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-primary shadow-soft backdrop-blur">
          {copy.eyebrow}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border border-border bg-card/80 px-3 py-1 text-[11px] font-semibold text-muted-foreground shadow-soft backdrop-blur">
          <CheckCircle2 className="h-3.5 w-3.5 text-success" />
          Preflight OK
        </span>
      </div>

      <div className="absolute inset-x-5 bottom-5 top-[4.9rem] rounded-2xl border border-border bg-card/78 p-3 shadow-elevated backdrop-blur-xl transition duration-300 group-hover:scale-[1.01] sm:inset-x-8 sm:bottom-8 sm:top-20 sm:p-4">
        <div className="grid h-full min-h-0 grid-cols-[minmax(0,1fr)_minmax(92px,116px)] gap-3 sm:gap-4">
          <div className="relative min-h-0 overflow-hidden rounded-xl border border-dashed border-primary/45 bg-primary/5 p-3 sm:p-4">
            <span className="absolute left-3 top-3 z-10 rounded-full border border-primary/25 bg-card/95 px-2.5 py-1 text-[10px] font-bold text-primary shadow-soft">
              Bleed 0.125&quot;
            </span>
            <div className={`absolute inset-x-4 bottom-4 top-9 rounded-lg border ${emphasizeTrim ? 'border-primary' : 'border-foreground/35'} bg-card shadow-card sm:inset-x-6 sm:bottom-6 sm:top-12`}>
              <span className="absolute -top-3 left-4 rounded-full border border-border bg-card px-2 py-0.5 text-[10px] font-bold text-muted-foreground shadow-soft">
                Trim Size
              </span>
              {showSpine && (
                <div className="absolute inset-y-0 left-1/2 w-5 -translate-x-1/2 border-x border-primary/45 bg-primary/10">
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-90 whitespace-nowrap text-[10px] font-bold text-primary">
                    Spine
                  </span>
                </div>
              )}
              <div className={`absolute inset-5 rounded-md border ${emphasizeSafe ? 'border-success' : 'border-success/55'} bg-success/5 sm:inset-6`}>
                <span className="absolute bottom-2 right-2 rounded-full border border-success/25 bg-card/95 px-2 py-0.5 text-[10px] font-bold text-success shadow-soft sm:-bottom-3">
                  Safe Area
                </span>
              </div>
              <div className="absolute left-8 top-9 h-3 w-20 rounded-full bg-foreground/18 sm:w-24" />
              <div className="absolute left-8 top-16 h-2 w-28 max-w-[52%] rounded-full bg-muted sm:w-32" />
              <div className="absolute left-8 top-[5.65rem] h-2 w-20 max-w-[42%] rounded-full bg-muted" />
            </div>
          </div>

          <div className="grid min-w-0 content-center gap-2 sm:gap-3">
            <div className="rounded-xl border border-border bg-background/75 p-2.5 shadow-soft sm:p-3">
              <Ruler className="h-4 w-4 text-primary" />
              <p className="mt-2 break-words text-[10px] font-bold uppercase leading-4 tracking-[0.12em] text-muted-foreground sm:text-xs">
                {title ?? copy.title}
              </p>
              <p className="mt-1 text-sm font-bold leading-5 text-foreground">{copy.title}</p>
            </div>
            <div className="rounded-xl border border-border bg-background/75 p-2.5 shadow-soft sm:p-3">
              <ShieldCheck className="h-4 w-4 text-success" />
              <p className="mt-2 text-xs leading-5 text-muted-foreground">{copy.note}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
