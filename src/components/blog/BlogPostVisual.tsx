import type { BlogCategory } from '@/lib/blog';

export type BlogVisualCategory =
  | 'bleed'
  | 'kdp-covers'
  | 'trim-size'
  | 'spine'
  | 'safe-area'
  | 'publishing-errors'
  | 'validator';

export type BlogPostVisualProps = {
  category: BlogVisualCategory;
  title?: string;
  variant?: 'card' | 'featured';
};

const visualMeta: Record<BlogVisualCategory, { label: string; tone: string; accent: string }> = {
  bleed: { label: '0.125" Bleed', tone: 'border-primary/45 bg-primary/10 text-primary', accent: 'bg-primary/70' },
  'kdp-covers': { label: 'Full Wrap', tone: 'border-primary/45 bg-primary/10 text-primary', accent: 'bg-primary/70' },
  'trim-size': { label: 'Trim Size', tone: 'border-sky-500/35 bg-sky-500/10 text-sky-700 dark:text-sky-300', accent: 'bg-sky-500/70' },
  spine: { label: 'Spine Width', tone: 'border-primary/45 bg-primary/10 text-primary', accent: 'bg-primary/70' },
  'safe-area': { label: 'Safe Zone', tone: 'border-success/35 bg-success/10 text-success', accent: 'bg-success/70' },
  'publishing-errors': { label: 'Fix Issues', tone: 'border-warning/40 bg-warning/10 text-warning', accent: 'bg-warning/70' },
  validator: { label: 'Preflight Check', tone: 'border-success/35 bg-success/10 text-success', accent: 'bg-success/70' },
};

export function getBlogVisualCategory(category: BlogCategory, slug?: string): BlogVisualCategory {
  if (category === 'Bleed') return 'bleed';
  if (category === 'KDP Covers') return slug?.includes('validator') ? 'validator' : 'kdp-covers';
  if (category === 'Trim Size') return 'trim-size';
  if (category === 'Spine') return 'spine';
  if (category === 'Safe Area') return 'safe-area';
  if (category === 'Publishing Errors') return 'publishing-errors';
  return 'validator';
}

export function BlogPostVisual({ category, title, variant = 'card' }: BlogPostVisualProps) {
  const meta = visualMeta[category];
  const featured = variant === 'featured';

  return (
    <div
      aria-hidden="true"
      className={`relative h-full min-h-full overflow-hidden bg-muted/30 ${
        featured ? 'p-5 sm:p-7' : ''
      }`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_26%_18%,color-mix(in_srgb,var(--primary)_22%,transparent),transparent_34%),linear-gradient(90deg,color-mix(in_srgb,var(--foreground)_6%,transparent)_1px,transparent_1px),linear-gradient(0deg,color-mix(in_srgb,var(--foreground)_5%,transparent)_1px,transparent_1px)] bg-[length:auto,28px_28px,28px_28px]" />
      <div className="absolute inset-0 bg-[linear-gradient(145deg,transparent,color-mix(in_srgb,var(--background)_72%,transparent))]" />

      <div
        className={`rounded-2xl border border-border/85 bg-card/82 shadow-soft backdrop-blur transition duration-300 group-hover:-translate-y-0.5 group-hover:border-primary/30 group-hover:shadow-card ${
          featured
            ? 'relative h-full min-h-[232px] p-5 sm:min-h-[300px] sm:p-6'
            : 'absolute inset-x-4 bottom-3 top-[58px] p-2.5'
        }`}
      >
        {featured ? (
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className={`rounded-full border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.13em] ${meta.tone}`}>
              {meta.label}
            </span>
            <span className="h-1.5 w-12 rounded-full bg-gradient-to-r from-primary/55 to-transparent transition group-hover:translate-x-1 group-hover:opacity-90" />
          </div>
        ) : (
          <span className={`absolute left-3 top-3 z-20 h-1.5 w-10 rounded-full ${meta.accent}`} />
        )}

        <div className={`relative mx-auto ${featured ? 'h-[calc(100%-2.25rem)] min-h-[206px]' : 'h-full pt-2'}`}>
          {category === 'kdp-covers' && <FullWrapVisual featured={featured} />}
          {category === 'bleed' && <BleedVisual featured={featured} />}
          {category === 'spine' && <SpineVisual featured={featured} />}
          {category === 'safe-area' && <SafeAreaVisual featured={featured} />}
          {category === 'trim-size' && <TrimSizeVisual featured={featured} />}
          {category === 'publishing-errors' && <PublishingErrorsVisual featured={featured} />}
          {category === 'validator' && <ValidatorVisual featured={featured} />}
        </div>

        {featured && title ? (
          <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between gap-4 text-[11px] font-semibold text-muted-foreground">
            <span className="truncate">{title}</span>
            <span className="h-px min-w-10 flex-1 bg-border" />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function DimensionArrow({ className = '' }: { className?: string }) {
  return (
    <span className={`absolute flex items-center text-primary/70 transition group-hover:text-primary ${className}`}>
      <span className="h-0 w-0 border-y-[3px] border-r-[5px] border-y-transparent border-r-current" />
      <span className="h-px flex-1 bg-current" />
      <span className="h-0 w-0 border-y-[3px] border-l-[5px] border-y-transparent border-l-current" />
    </span>
  );
}

function FullWrapVisual({ featured }: { featured: boolean }) {
  return (
    <div className="absolute inset-0">
      <DimensionArrow className="left-[14%] right-[14%] top-1" />
      <div className="absolute inset-x-[5%] bottom-[10%] top-[18%] rounded-lg border border-border bg-background/82 shadow-card">
        <div className="absolute inset-y-0 left-0 w-[43%] rounded-l-lg border-r border-border bg-muted/35" />
        <div className="absolute inset-y-0 left-[43%] w-[14%] border-x border-primary/55 bg-primary/15 transition group-hover:bg-primary/20" />
        <div className="absolute inset-y-0 right-0 w-[43%] rounded-r-lg bg-card" />
        <div className="absolute left-[8%] top-[18%] h-2 w-[22%] rounded-full bg-foreground/18" />
        <div className="absolute left-[8%] top-[32%] h-1.5 w-[28%] rounded-full bg-muted-foreground/18" />
        <div className="absolute right-[8%] top-[17%] aspect-[3/4] w-[20%] rounded border border-primary/35 bg-primary/10" />
      </div>
      {featured ? <DimensionArrow className="bottom-[2%] left-[5%] right-[5%]" /> : null}
    </div>
  );
}

function BleedVisual({ featured }: { featured: boolean }) {
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-x-[18%] bottom-[7%] top-[4%] rounded-lg border-2 border-dashed border-primary/50 bg-primary/[0.06]" />
      <div className="absolute inset-x-[23%] bottom-[13%] top-[11%] rounded-md border border-foreground/35 bg-card shadow-card" />
      <div className="absolute inset-x-[30%] bottom-[23%] top-[22%] rounded border border-dashed border-success/65 bg-success/[0.04]" />
      <DimensionArrow className="left-[23%] right-[23%] top-[7%]" />
      {featured ? (
        <span className="absolute right-[13%] top-[18%] rounded-full border border-primary/25 bg-card px-2 py-0.5 text-[9px] font-bold text-primary shadow-soft">
          bleed
        </span>
      ) : null}
      {featured ? (
        <span className="absolute left-[12%] bottom-[12%] rounded-full border border-border bg-background/80 px-2 py-0.5 text-[9px] font-bold text-muted-foreground">
          trim + safe
        </span>
      ) : null}
    </div>
  );
}

function SpineVisual({ featured }: { featured: boolean }) {
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-x-[7%] bottom-[11%] top-[16%] rounded-lg border border-border bg-card shadow-card">
        <div className="absolute inset-y-0 left-0 w-[44%] rounded-l-lg bg-muted/30" />
        <div className="absolute inset-y-0 left-[44%] w-[12%] border-x border-primary/60 bg-primary/20 transition group-hover:bg-primary/25" />
        <div className="absolute inset-y-0 right-0 w-[44%] rounded-r-lg bg-background/80" />
        <div className="absolute left-[47%] top-[14%] h-[72%] w-px bg-primary/70" />
        <div className="absolute left-[51%] top-[14%] h-[72%] w-px bg-primary/70" />
      </div>
      <div className="absolute left-[12%] top-[2%] flex gap-1.5">
        {Array.from({ length: featured ? 3 : 2 }).map((_, index) => (
          <span key={index} className="h-2.5 w-9 rounded-full border border-border bg-background/85" />
        ))}
      </div>
      <DimensionArrow className="bottom-[2%] left-[44%] right-[44%]" />
    </div>
  );
}

function SafeAreaVisual({ featured }: { featured: boolean }) {
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-x-[17%] bottom-[7%] top-[6%] rounded-lg border border-border bg-card shadow-card">
        <div className="absolute inset-[15%] rounded-md border border-success/70 bg-success/[0.055]" />
        <div className="absolute left-[27%] top-[28%] h-2 w-[38%] rounded-full bg-foreground/20" />
        <div className="absolute left-[27%] top-[42%] h-1.5 w-[46%] rounded-full bg-muted-foreground/20" />
        <div className="absolute left-[27%] top-[54%] h-1.5 w-[34%] rounded-full bg-muted-foreground/16" />
        <span className="absolute -right-2 top-[18%] grid size-5 place-items-center rounded-full border border-warning/35 bg-warning/12 text-[10px] font-black text-warning">
          !
        </span>
        <span className="absolute -left-2 bottom-[20%] grid size-5 place-items-center rounded-full border border-warning/35 bg-warning/12 text-[10px] font-black text-warning">
          !
        </span>
      </div>
      {featured ? <DimensionArrow className="left-[28%] right-[28%] top-[16%] text-success/70" /> : null}
    </div>
  );
}

function TrimSizeVisual({ featured }: { featured: boolean }) {
  return (
    <div className="absolute inset-0">
      <div className="absolute left-[10%] top-[18%] h-[68%] w-[30%] rounded-lg border border-border bg-card shadow-card transition group-hover:-translate-y-0.5">
        {featured ? (
          <span className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold text-primary">
            6x9
          </span>
        ) : null}
      </div>
      <div className="absolute right-[10%] top-[9%] h-[78%] w-[36%] rounded-lg border border-border bg-background/85 shadow-card transition group-hover:translate-y-0.5">
        {featured ? (
          <span className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-sky-500/10 px-2 py-0.5 text-[9px] font-bold text-sky-700 dark:text-sky-300">
            8.5x11
          </span>
        ) : null}
      </div>
      <div className="absolute left-[5%] right-[5%] top-1 flex justify-between">
        {Array.from({ length: featured ? 13 : 9 }).map((_, index) => (
          <span key={index} className="h-2 w-px bg-muted-foreground/35 odd:h-3" />
        ))}
      </div>
      <DimensionArrow className="bottom-[3%] left-[10%] right-[10%]" />
    </div>
  );
}

function PublishingErrorsVisual({ featured }: { featured: boolean }) {
  const rows = featured ? ['Trim mismatch', 'Bleed fixed', 'DPI warning', 'Ready'] : ['Trim', 'Bleed', 'Ready'];

  return (
    <div className="absolute inset-0">
      <div className="absolute inset-x-[12%] bottom-[8%] top-[8%] rounded-xl border border-border bg-background/82 p-3 shadow-card">
        <div className="mb-2 flex items-center gap-2">
          <span className="grid size-6 place-items-center rounded-full border border-warning/35 bg-warning/12 text-xs font-black text-warning">!</span>
          <span className="h-2 w-20 rounded-full bg-foreground/18" />
        </div>
        <div className="grid gap-1.5">
          {rows.map((row, index) => {
            const ok = index === 1 || index === rows.length - 1;
            return (
              <div key={row} className="flex items-center gap-2 rounded-lg border border-border bg-card/75 px-2 py-1.5">
                <span className={`grid size-4 place-items-center rounded-full text-[9px] font-black ${ok ? 'bg-success/12 text-success' : 'bg-warning/12 text-warning'}`}>
                  {ok ? '✓' : '!'}
                </span>
                <span className="h-1.5 flex-1 rounded-full bg-muted-foreground/18" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ValidatorVisual({ featured }: { featured: boolean }) {
  return (
    <div className="absolute inset-0">
      <div className="absolute left-[12%] top-[9%] h-[78%] w-[38%] rounded-lg border border-border bg-card shadow-card">
        <div className="flex h-7 items-center justify-between border-b border-border px-2">
          {featured ? <span className="text-[9px] font-black text-primary">PDF</span> : <span className="h-1.5 w-8 rounded-full bg-primary/25" />}
          <span className="size-2 rounded-full bg-success" />
        </div>
        <div className="space-y-2 p-3">
          <span className="block h-2 rounded-full bg-foreground/18" />
          <span className="block h-1.5 w-4/5 rounded-full bg-muted-foreground/18" />
          <span className="block h-8 rounded border border-dashed border-primary/35 bg-primary/5" />
        </div>
      </div>
      <div className="absolute right-[10%] top-[18%] grid w-[34%] grid-cols-2 gap-1.5">
        {Array.from({ length: featured ? 6 : 4 }).map((_, index) => (
          <span key={index} className="grid aspect-square place-items-center rounded-lg border border-border bg-background/80 text-[11px] font-black text-success shadow-soft">
            ✓
          </span>
        ))}
      </div>
      <DimensionArrow className="bottom-[3%] left-[14%] right-[14%] text-success/70" />
    </div>
  );
}
