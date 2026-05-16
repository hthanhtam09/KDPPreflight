'use client';

import { memo, useCallback, useMemo, useState } from 'react';
import type React from 'react';
import { AnimatePresence, LazyMotion, domAnimation, m } from 'framer-motion';
import { ChevronDown, ChevronUp, Info, Maximize2, Minus, Plus, Sparkles } from 'lucide-react';
import { useAppStore } from '@/store/use-app-store';
import { formatInches } from '@/engine/kdp-constants';
import type { CoverSegments } from '@/engine/cover-parser';
import PreviewConfigPanel from './PreviewConfigPanel';
import GenerateStep from './GenerateStep';

interface Props {
  onCoverSegments: (segments: CoverSegments | null) => void;
}

export default function PreviewWorkspace({ onCoverSegments }: Props) {
  const { previewFlowStep, setPreviewFlowStep, bookConfig, previewGenerated } = useAppStore();
  const [isMobileConfigOpen, setIsMobileConfigOpen] = useState(false);

  // Track dirty state: snapshot the config key when user generates
  const [lastGeneratedKey, setLastGeneratedKey] = useState<string>('');
  const configKey = `${bookConfig.bookType}|${bookConfig.trimSize}|${bookConfig.bleed}|${bookConfig.pageCount}|${bookConfig.paper}|${bookConfig.interior}|${bookConfig.coverFinish}|${bookConfig.readingDirection}|${bookConfig.customWidth}|${bookConfig.customHeight}`;
  const isDirty = previewGenerated && lastGeneratedKey !== '' && lastGeneratedKey !== configKey;

  const isGenerating = previewFlowStep === 'generate';

  const handleGenerate = useCallback(() => {
    setLastGeneratedKey(configKey);
    setPreviewFlowStep('generate');
  }, [configKey, setPreviewFlowStep]);

  const isKindle = bookConfig.bookType === 'kindle';
  const isHardcover = bookConfig.bookType === 'hardcover' || bookConfig.binding === 'hardcover';
  const [zoom, setZoom] = useState(1);

  const fitPreview = useCallback(() => setZoom(1), []);
  const zoomOut = useCallback(() => setZoom((value) => Math.max(0.72, Number((value - 0.08).toFixed(2)))), []);
  const zoomIn = useCallback(() => setZoom((value) => Math.min(1.28, Number((value + 0.08).toFixed(2)))), []);

  return (
    <div className="grid min-h-0 gap-4 md:grid-cols-[280px_minmax(0,1fr)] lg:grid-cols-[360px_minmax(0,1fr)] lg:gap-6">

      {/* ─── Left: Config panel (desktop/tablet) ─── */}
      <aside className="hidden md:block">
        <div className="sticky top-4 max-h-[calc(100svh-var(--nav-height)-112px)] overflow-hidden rounded-panel border border-border bg-surface shadow-card">
          <PreviewConfigPanel
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
            isDirty={isDirty}
          />
        </div>
      </aside>

      {/* ─── Right: Live preview area ─── */}
      <div className="min-w-0">

        {/* Mobile: preview-first controls */}
        <div className="mb-3 flex items-center justify-between md:hidden">
          <button
            onClick={() => setPreviewFlowStep('import')}
            className="ds-focus text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Import
          </button>
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
            <PreviewConfigPanel
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
              isDirty={isDirty}
            />
          </div>
        )}

        <LazyMotion features={domAnimation}>
          <AnimatePresence mode="wait">
            {isGenerating ? (
              <m.div
                key="generating"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="min-h-[560px] rounded-panel border border-border bg-surface shadow-card"
              >
                <GenerateStep onCoverSegments={onCoverSegments} />
              </m.div>
            ) : (
              <m.div
                key="live-preview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <LiveCoverLayout
                  isKindle={isKindle}
                  isHardcover={isHardcover}
                  isDirty={isDirty}
                  onGenerate={handleGenerate}
                  isGenerating={isGenerating}
                  zoom={zoom}
                  onFit={fitPreview}
                  onZoomIn={zoomIn}
                  onZoomOut={zoomOut}
                />
              </m.div>
            )}
          </AnimatePresence>
        </LazyMotion>

        <div className="sticky bottom-0 z-20 mt-4 border-t border-border bg-background/90 py-3 backdrop-blur md:hidden">
          {isDirty && previewGenerated && (
            <p className="mb-2 rounded-lg border border-warning/30 bg-warning/8 px-3 py-2 text-[11px] text-warning">
              Settings changed — regenerate 3D preview.
            </p>
          )}
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="ds-button-primary ds-focus flex min-h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold disabled:opacity-60"
          >
            <Sparkles className="h-4 w-4" />
            Generate 3D Preview
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Live Cover Layout ──────────────────────────────────────────────────────────

const LiveCoverLayout = memo(function LiveCoverLayout({
  isKindle,
  isHardcover,
  isDirty,
  onGenerate,
  isGenerating,
  zoom,
  onFit,
  onZoomIn,
  onZoomOut,
}: {
  isKindle: boolean;
  isHardcover: boolean;
  isDirty: boolean;
  onGenerate: () => void;
  isGenerating: boolean;
  zoom: number;
  onFit: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}) {
  const { measurements, previewGenerated } = useAppStore();

  return (
    <section className="overflow-hidden rounded-panel border border-border bg-surface shadow-card">
      <div className="flex flex-col gap-3 border-b border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <p className="text-sm font-semibold text-foreground">Live cover layout</p>
          <p className="mt-0.5 max-w-2xl text-xs text-muted-foreground">
            Updates instantly. Generate when you are ready for the final 3D preview.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <IconAction label="Fit" onClick={onFit}>
            <Maximize2 className="h-3.5 w-3.5" />
          </IconAction>
          <IconAction label="Zoom out" onClick={onZoomOut}>
            <Minus className="h-3.5 w-3.5" />
          </IconAction>
          <span className="min-w-10 text-center font-mono text-[11px] text-muted-foreground">
            {Math.round(zoom * 100)}%
          </span>
          <IconAction label="Zoom in" onClick={onZoomIn}>
            <Plus className="h-3.5 w-3.5" />
          </IconAction>
          <button
            onClick={onGenerate}
            disabled={isGenerating}
            className="ds-button-primary ds-focus ml-0 inline-flex h-9 items-center gap-2 rounded-xl px-3 text-xs font-semibold disabled:opacity-60 sm:ml-1"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Generate
          </button>
        </div>
      </div>

      {isDirty && previewGenerated && (
        <div className="border-b border-warning/20 bg-warning/8 px-4 py-2 text-[11px] font-medium text-warning sm:px-5">
          Settings changed — regenerate 3D preview.
        </div>
      )}

      <div className="bg-[linear-gradient(to_right,color-mix(in_srgb,var(--border)_58%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_srgb,var(--border)_58%,transparent)_1px,transparent_1px)] bg-[size:24px_24px] p-3 sm:p-5">
        <div className="grid min-h-[360px] place-items-center overflow-hidden rounded-2xl border border-border bg-background/70 p-3 sm:min-h-[min(62svh,620px)] sm:p-5">
          <div
            className="flex w-full origin-center items-center justify-center will-change-transform"
            style={{ transform: `scale(${zoom})` }}
          >
            {isKindle ? (
              <KindleLayoutDiagram />
            ) : (
              <PrintLayoutDiagram
                trimWidthIn={measurements.trimWidthIn}
                trimHeightIn={measurements.trimHeightIn}
                spineWidthIn={measurements.spineWidthIn}
                bleedIn={measurements.bleedIn}
                wrapAroundIn={measurements.wrapAroundIn}
                hingeIn={measurements.hingeIn}
                isHardcover={isHardcover}
                fullCoverWidthIn={measurements.fullCoverWidthIn}
                fullCoverHeightIn={measurements.fullCoverHeightIn}
              />
            )}
          </div>
        </div>

        {!isKindle && (
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
            <LegendItem label="Trim" className="border-primary/60" />
            <LegendItem label="Bleed" className="border-danger/60 bg-danger/10" />
            <LegendItem label="Safe area" className="border-success/60 border-dashed" />
            <LegendItem label="Spine" className="border-warning/70 bg-warning/10" />
            <LegendItem label="Barcode" className="border-warning/70 border-dashed bg-warning/10" />
          </div>
        )}
      </div>

      <div className="flex items-start gap-2 border-t border-border bg-surface/70 px-4 py-3 sm:px-5">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <p className="text-xs leading-5 text-muted-foreground">
          Keep cover text out of the barcode, hinge, and safe-margin zones.
        </p>
      </div>
    </section>
  );
});

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
