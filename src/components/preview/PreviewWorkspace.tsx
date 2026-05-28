'use client';

import { memo, useCallback, useMemo, useState } from 'react';
import type React from 'react';
import { AnimatePresence, LazyMotion, domAnimation, m } from 'framer-motion';
import { ArrowLeft, BadgeCheck, ChevronDown, ChevronUp, Info, RotateCcw, Sparkles } from 'lucide-react';
import { useAppStore } from '@/store/use-app-store';
import { DEFAULT_BOOK_CONFIG, formatInches } from '@/engine/kdp-constants';
import PreviewConfigPanel from './PreviewConfigPanel';

export default function PreviewWorkspace() {
  const {
    previewFlowStep,
    setPreviewFlowStep,
    bookConfig,
    previewGenerated,
    updateBookConfig,
    setBookType,
  } = useAppStore();
  const [isMobileConfigOpen, setIsMobileConfigOpen] = useState(false);

  // Track dirty state: snapshot the config key when user generates
  const [lastGeneratedKey, setLastGeneratedKey] = useState<string>('');
  const configKey = `${bookConfig.bookType}|${bookConfig.trimSize}|${bookConfig.bleed}|${bookConfig.pageCount}|${bookConfig.paper}|${bookConfig.interior}|${bookConfig.coverFinish}|${bookConfig.readingDirection}|${bookConfig.customWidth}|${bookConfig.customHeight}`;
  const isDirty = previewGenerated && lastGeneratedKey !== '' && lastGeneratedKey !== configKey;

  const handleGenerate = useCallback(() => {
    setLastGeneratedKey(configKey);
    setPreviewFlowStep('generate');
  }, [configKey, setPreviewFlowStep]);

  const handleReset = useCallback(() => {
    updateBookConfig(DEFAULT_BOOK_CONFIG);
    setBookType(DEFAULT_BOOK_CONFIG.bookType);
  }, [setBookType, updateBookConfig]);

  const isKindle = bookConfig.bookType === 'kindle';
  const isHardcover = bookConfig.bookType === 'hardcover' || bookConfig.binding === 'hardcover';

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 overflow-hidden">
      <div className="flex shrink-0 flex-col gap-3 rounded-[20px] border border-border bg-surface px-3 py-3 shadow-soft lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-extrabold text-foreground">Confirm preview settings</p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            Review layout settings, then generate the final 3D preview.
          </p>
        </div>
        {isDirty && previewGenerated && (
          <p className="rounded-full border border-warning/30 bg-warning/8 px-3 py-1 text-xs font-bold text-warning">
            Settings changed
          </p>
        )}
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => setPreviewFlowStep('import')}
            className="ds-focus inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-muted-foreground hover:bg-muted/40 hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Import
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="ds-focus inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-muted-foreground hover:bg-muted/40 hover:text-foreground"
          >
            <RotateCcw className="h-4 w-4" />
            Reset defaults
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            className="ds-button-primary ds-focus inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold disabled:opacity-60 sm:min-w-52"
          >
            <Sparkles className="h-4 w-4" />
            Generate 3D Preview
          </button>
        </div>
      </div>

      <div className="app-grid-safe grid min-h-0 flex-1 gap-4 overflow-hidden md:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[340px_minmax(0,1fr)]">

      {/* ─── Left: Config panel (desktop/tablet) ─── */}
      <aside className="hidden md:block h-full min-h-0 overflow-hidden">
        <div className="h-full overflow-hidden rounded-[20px] border border-border bg-surface shadow-card">
          <PreviewConfigPanel />
        </div>
      </aside>

      {/* ─── Right: Setup summary / generation area ─── */}
      <div className="flex h-full min-h-0 flex-col min-w-0">

        {/* Mobile: preview-first controls */}
        <div className="mb-3 flex items-center justify-end md:hidden">
          <button
            onClick={() => setIsMobileConfigOpen((p) => !p)}
            className="ds-focus flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-semibold text-foreground"
          >
            Book settings
            {isMobileConfigOpen
              ? <ChevronUp className="h-3.5 w-3.5" />
              : <ChevronDown className="h-3.5 w-3.5" />
            }
          </button>
        </div>

        {/* Mobile: collapsible settings sheet */}
        {isMobileConfigOpen && (
          <div className="mb-4 max-h-[72svh] overflow-hidden rounded-panel border border-border bg-surface shadow-elevated md:hidden">
            <PreviewConfigPanel />
          </div>
        )}

        <LazyMotion features={domAnimation}>
          <AnimatePresence mode="wait">
            <m.div
              key="settings-summary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-1 h-full min-h-0 flex flex-col overflow-hidden"
            >
              <PreviewSettingsSummary
                isKindle={isKindle}
                isHardcover={isHardcover}
                isDirty={isDirty}
              />
            </m.div>
          </AnimatePresence>
        </LazyMotion>

      </div>

      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-muted/20 p-3">
      <p className="text-[11px] font-semibold text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-bold capitalize text-foreground [overflow-wrap:anywhere]">{value}</p>
    </div>
  );
}

// ── Settings Summary ───────────────────────────────────────────────────────────

const PreviewSettingsSummary = memo(function PreviewSettingsSummary({
  isKindle,
  isHardcover,
  isDirty,
}: {
  isKindle: boolean;
  isHardcover: boolean;
  isDirty: boolean;
}) {
  const { bookConfig, measurements, previewGenerated } = useAppStore();

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-[20px] border border-border bg-surface shadow-card">
      <div className="shrink-0 border-b border-border px-5 py-4">
        <p className="text-sm font-extrabold text-foreground">Ready to generate</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Confirm the detected setup, then use the single Generate button above.
        </p>
      </div>

      {isDirty && previewGenerated && (
        <div className="shrink-0 border-b border-warning/20 bg-warning/8 px-5 py-2 text-xs font-semibold text-warning">
          Settings changed — regenerate 3D preview.
        </div>
      )}

      <div className="grid min-h-0 flex-1 gap-4 overflow-hidden p-4 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div className="min-h-0 overflow-y-auto rounded-2xl border border-border bg-muted/15 p-4 [scrollbar-gutter:stable]">
          <div className="grid gap-3 sm:grid-cols-2">
            <SummaryRow label="Status" value={previewGenerated ? (isDirty ? 'Regenerate needed' : 'Preview generated') : 'Ready to generate'} />
            <SummaryRow label="Format" value={bookConfig.bookType} />
            <SummaryRow label="Trim" value={bookConfig.trimSize === 'custom' ? 'Custom' : bookConfig.trimSize} />
            <SummaryRow label="Pages" value={`${bookConfig.pageCount}`} />
            {!isKindle && <SummaryRow label="Bleed" value={bookConfig.bleed === 'bleed' ? 'With bleed' : 'No bleed'} />}
            {!isKindle && <SummaryRow label="Spine" value={formatInches(measurements.spineWidthIn)} />}
            {!isKindle && <SummaryRow label="Full cover" value={`${formatInches(measurements.fullCoverWidthIn)} × ${formatInches(measurements.fullCoverHeightIn)}`} />}
            {isHardcover && <SummaryRow label="Hinge" value={formatInches(measurements.hingeIn)} />}
            {isKindle && <SummaryRow label="Cover target" value="1600 × 2560 px" />}
          </div>

          <div className="mt-4 rounded-2xl border border-primary/15 bg-primary/5 p-4">
            <div className="flex items-start gap-3">
              <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-bold text-foreground">One final action</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  The 3D preview will be generated from these settings and your imported files. Use Reset defaults if you want to return to the standard paperback setup.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden min-h-0 overflow-y-auto rounded-2xl border border-border bg-surface p-4 [scrollbar-gutter:stable] lg:block">
          <p className="text-sm font-bold text-foreground">What happens next</p>
          <div className="mt-4 space-y-3">
            <StepHint number="1" label="Use current settings" />
            <StepHint number="2" label="Generate the 3D preview" />
            <StepHint number="3" label="Inspect cover, spine, and pages" />
          </div>
          <details className="mt-4 rounded-xl border border-border bg-muted/20 p-3">
            <summary className="cursor-pointer text-xs font-bold text-foreground">Diagnostics</summary>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Missing file metadata and skipped checks are handled in Preflight diagnostics.
            </p>
          </details>
        </div>
      </div>

      <div className="shrink-0 flex items-start gap-2 border-t border-border bg-surface/70 px-4 py-2.5 sm:px-5">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Generate once when your settings are ready, then inspect the final 3D preview.
        </p>
      </div>
    </section>
  );
});

function StepHint({ number, label }: { number: string; label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/15 p-3">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-extrabold text-primary">
        {number}
      </span>
      <span className="text-xs font-semibold text-foreground">{label}</span>
    </div>
  );
}

// ── Kindle placeholder diagram ──────────────────────────────────────────────────

function KindleLayoutDiagram() {
  return (
    <div className="grid min-h-[320px] place-items-center rounded-xl bg-secondary/60 p-6">
      <div className="relative aspect-[0.66] w-full max-w-[220px] rounded-[1.4rem] border border-border bg-surface p-4 shadow-elevated">
        <div className="h-full rounded-md border border-border bg-background p-5">
          <div className="mb-5 h-3 w-2/3 rounded bg-muted" />
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="mb-3 h-2 rounded bg-muted"
              style={{ width: `${i % 3 === 0 ? 88 : i % 3 === 1 ? 72 : 96}%` }}
            />
          ))}
        </div>
        <div className="absolute bottom-2 left-1/2 h-1 w-1/3 -translate-x-1/2 rounded-full bg-muted" />
      </div>
    </div>
  );
}

// ── Print layout SVG diagram ────────────────────────────────────────────────────

function PrintLayoutDiagram({
  trimWidthIn,
  trimHeightIn,
  spineWidthIn,
  bleedIn,
  wrapAroundIn,
  hingeIn,
  isHardcover,
  fullCoverWidthIn,
  fullCoverHeightIn,
}: {
  trimWidthIn: number;
  trimHeightIn: number;
  spineWidthIn: number;
  bleedIn: number;
  wrapAroundIn: number;
  hingeIn: number;
  isHardcover: boolean;
  fullCoverWidthIn: number;
  fullCoverHeightIn: number;
}) {
  const layout = useMemo(() => {
    const fullWidth =
      wrapAroundIn + bleedIn + trimWidthIn + spineWidthIn + trimWidthIn + bleedIn + wrapAroundIn;
    const fullHeight = wrapAroundIn + bleedIn + trimHeightIn + bleedIn + wrapAroundIn;

    const svgW = 520;
    const svgH = (fullHeight / fullWidth) * svgW;
    const s = svgW / fullWidth;
    const toX = (v: number) => v * s;
    const toY = (v: number) => v * s;

    const wL = { x: 0, w: toX(wrapAroundIn) };
    const bkL = { x: wL.x + wL.w, w: toX(bleedIn) };
    const bk = { x: bkL.x + bkL.w, w: toX(trimWidthIn) };
    const bkR = { x: bk.x + bk.w, w: toX(bleedIn) };
    const sp = { x: bkR.x + bkR.w, w: Math.max(toX(spineWidthIn), 2) };
    const frL = { x: sp.x + sp.w, w: toX(bleedIn) };
    const fr = { x: frL.x + frL.w, w: toX(trimWidthIn) };
    const frR = { x: fr.x + fr.w, w: toX(bleedIn) };
    const wR = { x: frR.x + frR.w, w: toX(wrapAroundIn) };

    const tW = { y: 0, h: toY(wrapAroundIn) };
    const tB = { y: tW.y + tW.h, h: toY(bleedIn) };
    const tm = { y: tB.y + tB.h, h: toY(trimHeightIn) };
    const bB = { y: tm.y + tm.h, h: toY(bleedIn) };
    const bW = { y: bB.y + bB.h, h: toY(wrapAroundIn) };
    const safeInset = toX(0.25);
    const hingeW = isHardcover ? toX(hingeIn) : 0;

    return {
      svgW,
      svgH,
      toX,
      toY,
      wL,
      bkL,
      bk,
      bkR,
      sp,
      frL,
      fr,
      frR,
      wR,
      tW,
      tB,
      tm,
      bB,
      bW,
      safeInset,
      hingeW,
      labelSize: Math.min(11, bk.w * 0.13),
      spineFS: Math.min(9, Math.max(sp.w * 0.28, 5)),
    };
  }, [bleedIn, hingeIn, isHardcover, spineWidthIn, trimHeightIn, trimWidthIn, wrapAroundIn]);

  const {
    svgW,
    svgH,
    toX,
    toY,
    wL,
    bkL,
    bk,
    bkR,
    sp,
    frL,
    fr,
    frR,
    wR,
    tB,
    tm,
    bB,
    safeInset,
    hingeW,
    labelSize,
    spineFS,
  } = layout;

  return (
    <div className="flex w-full max-w-[780px] items-center justify-center">
      <svg viewBox={`0 0 ${svgW} ${svgH + 22}`} className="h-auto max-h-[min(54svh,520px)] w-full">

        {/* Wrap zones */}
        <rect x={wL.x} y={0} width={wL.w} height={svgH}
          fill="color-mix(in srgb, var(--overlay-margin) 12%, transparent)"
          stroke="color-mix(in srgb, var(--overlay-margin) 30%, transparent)"
          strokeWidth={0.5} strokeDasharray="3,3" />
        <rect x={wR.x} y={0} width={wR.w} height={svgH}
          fill="color-mix(in srgb, var(--overlay-margin) 12%, transparent)"
          stroke="color-mix(in srgb, var(--overlay-margin) 30%, transparent)"
          strokeWidth={0.5} strokeDasharray="3,3" />

        {/* Back cover trim */}
        <rect x={bk.x} y={tm.y} width={bk.w} height={tm.h}
          fill="color-mix(in srgb, var(--surface) 80%, transparent)"
          stroke="var(--primary)" strokeWidth={1} strokeOpacity={0.6} />

        {/* Front cover trim */}
        <rect x={fr.x} y={tm.y} width={fr.w} height={tm.h}
          fill="color-mix(in srgb, var(--surface) 80%, transparent)"
          stroke="var(--primary)" strokeWidth={1} strokeOpacity={0.6} />

        {/* Spine */}
        <rect x={sp.x} y={tm.y} width={sp.w} height={tm.h}
          fill="color-mix(in srgb, var(--warning) 18%, transparent)"
          stroke="var(--warning)" strokeWidth={0.8} strokeOpacity={0.7} />

        {/* Bleed zones */}
        {bleedIn > 0 && (
          <>
            {[bkL, bkR, frL, frR].map((z, i) => (
              <rect key={i} x={z.x} y={tB.y} width={z.w}
                height={tm.h + tB.h + bB.h}
                fill="color-mix(in srgb, var(--danger) 12%, transparent)"
                stroke="var(--danger)" strokeWidth={0.4} strokeDasharray="2,2" strokeOpacity={0.6} />
            ))}
            <rect x={bkL.x} y={tB.y} width={frR.x + frR.w - bkL.x} height={tB.h}
              fill="color-mix(in srgb, var(--danger) 12%, transparent)"
              stroke="var(--danger)" strokeWidth={0.4} strokeDasharray="2,2" strokeOpacity={0.6} />
            <rect x={bkL.x} y={bB.y} width={frR.x + frR.w - bkL.x} height={bB.h}
              fill="color-mix(in srgb, var(--danger) 12%, transparent)"
              stroke="var(--danger)" strokeWidth={0.4} strokeDasharray="2,2" strokeOpacity={0.6} />
          </>
        )}

        {/* Safe areas */}
        <rect x={bk.x + safeInset} y={tm.y + safeInset}
          width={bk.w - safeInset * 2} height={tm.h - safeInset * 2}
          fill="color-mix(in srgb, var(--success) 8%, transparent)"
          stroke="var(--success)" strokeWidth={0.6} strokeDasharray="3,2" strokeOpacity={0.7} />
        <rect x={fr.x + safeInset} y={tm.y + safeInset}
          width={fr.w - safeInset * 2} height={tm.h - safeInset * 2}
          fill="color-mix(in srgb, var(--success) 8%, transparent)"
          stroke="var(--success)" strokeWidth={0.6} strokeDasharray="3,2" strokeOpacity={0.7} />

        {/* Barcode zone (back cover, bottom-right) */}
        {(() => {
          const bcW = toX(2);
          const bcH = toY(1.2);
          return (
            <rect
              x={bk.x + bk.w - safeInset - bcW}
              y={tm.y + tm.h - safeInset - bcH}
              width={bcW} height={bcH}
              fill="color-mix(in srgb, var(--warning) 18%, transparent)"
              stroke="var(--warning)" strokeWidth={0.6} strokeDasharray="3,2" strokeOpacity={0.7}
            />
          );
        })()}

        {/* Hinge zones for hardcover */}
        {isHardcover && hingeW > 0 && (
          <>
            <rect x={bk.x + bk.w - hingeW} y={tm.y}
              width={hingeW} height={tm.h}
              fill="color-mix(in srgb, var(--warning) 14%, transparent)"
              stroke="var(--warning)" strokeWidth={0.5} strokeDasharray="3,2" strokeOpacity={0.7} />
            <rect x={fr.x} y={tm.y}
              width={hingeW} height={tm.h}
              fill="color-mix(in srgb, var(--warning) 14%, transparent)"
              stroke="var(--warning)" strokeWidth={0.5} strokeDasharray="3,2" strokeOpacity={0.7} />
          </>
        )}

        {/* Labels */}
        <text x={bk.x + bk.w / 2} y={tm.y + tm.h / 2}
          textAnchor="middle" dominantBaseline="middle"
          fill="color-mix(in srgb, var(--foreground) 45%, transparent)"
          fontSize={labelSize} fontFamily="system-ui" fontWeight={500}>
          BACK
        </text>

        <text
          x={sp.x + sp.w / 2} y={tm.y + tm.h / 2}
          textAnchor="middle" dominantBaseline="middle"
          fill="color-mix(in srgb, var(--warning) 90%, transparent)"
          fontSize={spineFS} fontFamily="system-ui" fontWeight={500}
          transform={`rotate(-90, ${sp.x + sp.w / 2}, ${tm.y + tm.h / 2})`}
        >
          SPINE
        </text>

        <text x={fr.x + fr.w / 2} y={tm.y + tm.h / 2}
          textAnchor="middle" dominantBaseline="middle"
          fill="color-mix(in srgb, var(--foreground) 45%, transparent)"
          fontSize={labelSize} fontFamily="system-ui" fontWeight={500}>
          FRONT
        </text>

        {/* Barcode label */}
        {(() => {
          const bcW = toX(2);
          const bcH = toY(1.2);
          const bx = bk.x + bk.w - safeInset - bcW;
          const by = tm.y + tm.h - safeInset - bcH;
          return (
            <text x={bx + bcW / 2} y={by + bcH / 2}
              textAnchor="middle" dominantBaseline="middle"
              fill="color-mix(in srgb, var(--warning) 90%, transparent)"
              fontSize={Math.min(7, bcW * 0.25)} fontFamily="system-ui">
              ▊ Barcode
            </text>
          );
        })()}

        {/* Full cover dimensions */}
        <text x={svgW / 2} y={svgH + 15}
          textAnchor="middle"
          fill="color-mix(in srgb, var(--foreground) 30%, transparent)"
          fontSize={9} fontFamily="monospace">
          Full cover: {formatInches(fullCoverWidthIn)} × {formatInches(fullCoverHeightIn)}
        </text>
      </svg>

      {/* Dimension row below diagram */}
      <div className="sr-only">
        Full cover: {formatInches(fullCoverWidthIn)} × {formatInches(fullCoverHeightIn)}
      </div>
    </div>
  );
}

// ── Legend item ────────────────────────────────────────────────────────────────

function IconAction({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="ds-focus ds-control grid h-9 w-9 place-items-center rounded-xl text-muted-foreground transition-colors hover:text-foreground"
    >
      {children}
    </button>
  );
}

function LegendItem({ label, className }: { label: string; className: string }) {
  return (
    <div className="flex min-h-8 items-center gap-2 rounded-lg border border-border bg-surface px-2 py-1.5 text-xs text-muted-foreground">
      <span className={`h-3 w-5 shrink-0 rounded border ${className}`} />
      <span className="truncate">{label}</span>
    </div>
  );
}
