'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  Camera,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Settings,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { useAppStore } from '@/store/use-app-store';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ZOOM_MIN = 0.6;
const ZOOM_MAX = 2.0;
const ZOOM_STEP = 0.2;

// Export canvas dimensions — 4× logical device size (260×352 px CSS units)
const EXP_W = 1040;
const EXP_H = 1408;

// Device geometry as fractions (must mirror the CSS exactly)
const GEO = {
  bodyRadius: 0.055,           // border-radius as fraction of width
  screenInsetTop: 0.055,       // inset top as fraction of height
  screenInsetSide: 0.085,      // inset left+right as fraction of width
  screenInsetBottom: 0.09,     // inset bottom as fraction of height
  screenRadius: 0.010,         // screen corner radius as fraction of width
  barWidth: 0.09,              // logo bar width as fraction of device width
  barHeight: 0.0065,           // logo bar height as fraction of device height
  barBottom: 0.024,            // logo bar bottom offset as fraction of height
} as const;

// ---------------------------------------------------------------------------
// Canvas helpers
// ---------------------------------------------------------------------------

function rrect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  w: number, h: number,
  r: number,
) {
  // Use native roundRect when available (Chrome 99+, FF 112+, Safari 15.4+)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (typeof (ctx as any).roundRect === 'function') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ctx as any).roundRect(x, y, w, h, r);
    return;
  }
  const cr = Math.min(r, w / 2, h / 2);
  ctx.moveTo(x + cr, y);
  ctx.lineTo(x + w - cr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + cr);
  ctx.lineTo(x + w, y + h - cr);
  ctx.quadraticCurveTo(x + w, y + h, x + w - cr, y + h);
  ctx.lineTo(x + cr, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - cr);
  ctx.lineTo(x, y + cr);
  ctx.quadraticCurveTo(x, y, x + cr, y);
  ctx.closePath();
}

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface KindlePreviewProps {
  currentPage: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  onGoToPage: (page: number) => void;
  onBack: () => void;
  bleedInfo: { status: string; label: string };
  measurements: {
    pageCount: number;
    bookType: string;
    coverSource: string;
    pageSource: string;
    expectedPageSize: string;
    actualPageSize: string;
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function KindlePreview({
  currentPage,
  totalPages,
  onPrev,
  onNext,
  onGoToPage,
  onBack,
  bleedInfo,
  measurements,
}: KindlePreviewProps) {
  const { pdfPageDataUrls } = useAppStore();
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [zoom, setZoom] = useState(1.0);
  const [isCapturing, setIsCapturing] = useState(false);
  const deviceAreaRef = useRef<HTMLDivElement>(null);

  // Wheel-to-zoom — non-passive to allow preventDefault
  useEffect(() => {
    const el = deviceAreaRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP;
      setZoom(z => +Math.min(Math.max(z + delta, ZOOM_MIN), ZOOM_MAX).toFixed(1));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const pageUrl = pdfPageDataUrls.get(currentPage - 1) ?? null;

  const zoomIn = useCallback(
    () => setZoom(z => +Math.min(z + ZOOM_STEP, ZOOM_MAX).toFixed(1)),
    [],
  );
  const zoomOut = useCallback(
    () => setZoom(z => +Math.max(z - ZOOM_STEP, ZOOM_MIN).toFixed(1)),
    [],
  );

  // ---- Canvas export ----
  const capture = useCallback(async () => {
    const url = pdfPageDataUrls.get(currentPage - 1) ?? null;
    setIsCapturing(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = EXP_W;
      canvas.height = EXP_H;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // High-quality image rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // -- Device body (rounded rect with gradient, corners stay transparent) --
      const bodyR = EXP_W * GEO.bodyRadius;

      // CSS linear-gradient(150deg, ...) → compute canvas gradient endpoints.
      // 150° CSS angle → direction vector in canvas coords (y-down):
      //   d = (sin 150°, −cos 150°) = (0.5, +√3/2) ≈ (0.5, 0.866)
      // Intersect ray from center in direction d with bounding box:
      //   center = (EXP_W/2, EXP_H/2) = (520, 704)
      //   hit bottom edge (y=EXP_H): t = (EXP_H − 704) / 0.866 = 704 / 0.866 ≈ 812.5
      //   hit right edge (x=EXP_W):  t = (EXP_W − 520) / 0.5   = 520 / 0.5   = 1040
      //   min t = 812.5  → intersection near bottom-right
      const cx = EXP_W / 2, cy = EXP_H / 2;
      const t = Math.min((EXP_H - cy) / 0.866, (EXP_W - cx) / 0.5);
      const gx0 = cx - 0.5 * t, gy0 = cy - 0.866 * t; // 0% end (upper-left)
      const gx1 = cx + 0.5 * t, gy1 = cy + 0.866 * t; // 100% end (lower-right)

      const bodyGrad = ctx.createLinearGradient(gx0, gy0, gx1, gy1);
      bodyGrad.addColorStop(0,    '#303030');
      bodyGrad.addColorStop(0.55, '#262626');
      bodyGrad.addColorStop(1,    '#1e1e1e');

      ctx.beginPath();
      rrect(ctx, 0, 0, EXP_W, EXP_H, bodyR);
      ctx.fillStyle = bodyGrad;
      ctx.fill();

      // -- Screen area --
      const sx = EXP_W * GEO.screenInsetSide;
      const sy = EXP_H * GEO.screenInsetTop;
      const sw = EXP_W * (1 - GEO.screenInsetSide * 2);
      const sh = EXP_H * (1 - GEO.screenInsetTop - GEO.screenInsetBottom);
      const sr = EXP_W * GEO.screenRadius;

      ctx.beginPath();
      rrect(ctx, sx, sy, sw, sh, sr);
      ctx.fillStyle = '#f2ede2';
      ctx.fill();

      // -- Page image (object-contain inside screen, clipped) --
      if (url) {
        const img = await loadImg(url);
        const imgAspect = img.naturalWidth / img.naturalHeight;
        const screenAspect = sw / sh;
        let dw: number, dh: number, dx: number, dy: number;
        if (imgAspect > screenAspect) {
          dw = sw; dh = sw / imgAspect;
          dx = sx; dy = sy + (sh - dh) / 2;
        } else {
          dh = sh; dw = sh * imgAspect;
          dx = sx + (sw - dw) / 2; dy = sy;
        }
        ctx.save();
        ctx.beginPath();
        rrect(ctx, sx, sy, sw, sh, sr);
        ctx.clip();
        ctx.drawImage(img, dx, dy, dw, dh);
        ctx.restore();
      }

      // -- E-ink sheen (top highlight) --
      const sheenGrad = ctx.createRadialGradient(
        sx + sw / 2, sy - sh * 0.1, 0,
        sx + sw / 2, sy - sh * 0.1, sw * 0.8,
      );
      sheenGrad.addColorStop(0, 'rgba(255,255,255,0.10)');
      sheenGrad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.save();
      ctx.beginPath();
      rrect(ctx, sx, sy, sw, sh, sr);
      ctx.clip();
      ctx.fillStyle = sheenGrad;
      ctx.fillRect(sx, sy, sw, sh);
      ctx.restore();

      // -- Logo bar --
      const barW = EXP_W * GEO.barWidth;
      const barH = Math.max(4, EXP_H * GEO.barHeight);
      const barX = (EXP_W - barW) / 2;
      const barY = EXP_H - EXP_H * GEO.barBottom - barH;
      ctx.beginPath();
      rrect(ctx, barX, barY, barW, barH, 2);
      ctx.fillStyle = '#363636';
      ctx.fill();

      // -- Download as PNG blob --
      await new Promise<void>(resolve => {
        canvas.toBlob(blob => {
          if (!blob) { resolve(); return; }
          const objUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = objUrl;
          a.download = `kindle-preview-p${currentPage}.png`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(objUrl);
          resolve();
        }, 'image/png');
      });
    } finally {
      setIsCapturing(false);
    }
  }, [currentPage, pdfPageDataUrls]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = e.currentTarget.elements.namedItem('page') as HTMLInputElement;
    const n = Number(input?.value);
    if (Number.isFinite(n)) {
      onGoToPage(n);
    } else if (input) {
      input.value = String(currentPage);
    }
  };

  return (
    <div className="relative flex h-full flex-col bg-gradient-to-b from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-900">
      {/* Top bar */}
      <div className="flex shrink-0 items-center justify-between px-4 py-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Config
        </button>

        <div className="flex flex-col items-center gap-1">
          <span className="text-xs font-semibold tracking-wide text-foreground/60">
            Kindle Preview
          </span>
          <span className="rounded-full border border-foreground/10 bg-background/50 px-2.5 py-px text-[10px] leading-none text-muted-foreground backdrop-blur-sm">
            {bleedInfo.label}
          </span>
        </div>

        {/* Top-right actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={capture}
            disabled={!pageUrl || isCapturing}
            aria-label="Export device as PNG"
            title="Export Kindle device as PNG"
            className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-all hover:bg-foreground/10 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
          >
            {isCapturing
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <Camera className="h-4 w-4" />
            }
          </button>
          <button
            onClick={() => setIsConfigOpen(p => !p)}
            aria-label="Toggle settings"
            title="Settings"
            className={`grid h-8 w-8 place-items-center rounded-lg transition-all ${
              isConfigOpen
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-foreground/10 hover:text-foreground'
            }`}
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Kindle device centered */}
      <div
        ref={deviceAreaRef}
        className="flex min-h-0 flex-1 cursor-zoom-in items-center justify-center overflow-hidden p-4"
      >
        <div
          className="relative shrink-0"
          style={{
            height: 'min(400px, 100%, calc(100vh - 215px))',
            aspectRatio: '260 / 352',
            transform: `scale(${zoom})`,
            transformOrigin: 'center center',
            transition: 'transform 0.2s ease',
          }}
        >
          {/* Device body */}
          <div
            className="absolute inset-0"
            style={{
              borderRadius: '5.5%',
              background: 'linear-gradient(150deg, #303030 0%, #262626 55%, #1e1e1e 100%)',
              boxShadow: [
                '0 32px 80px rgba(0,0,0,0.22)',
                '0 12px 32px rgba(0,0,0,0.16)',
                '0 3px 8px rgba(0,0,0,0.12)',
                'inset 0 1px 0 rgba(255,255,255,0.07)',
                'inset 0 -1px 0 rgba(0,0,0,0.25)',
              ].join(', '),
            }}
          />

          {/* Screen */}
          <div
            className="absolute overflow-hidden"
            style={{
              inset: '5.5% 8.5% 9% 8.5%',
              borderRadius: '1.2%',
              background: '#f2ede2',
            }}
          >
            {/* E-ink sheen */}
            <div
              className="pointer-events-none absolute inset-0 z-10"
              style={{
                background: 'radial-gradient(ellipse at 50% -10%, rgba(255,255,255,0.2) 0%, transparent 65%)',
              }}
            />

            {/* Page content — fade + lift */}
            <AnimatePresence mode="wait">
              {pageUrl ? (
                <motion.img
                  key={currentPage}
                  src={pageUrl}
                  alt={`Page ${currentPage}`}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="absolute inset-0 h-full w-full object-contain"
                  draggable={false}
                />
              ) : (
                <motion.div
                  key={`ph-${currentPage}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <p className="text-center text-[9px] leading-relaxed" style={{ color: '#a09880' }}>
                    Page {currentPage}
                    <br />
                    Loading…
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom bezel logo bar */}
          <div
            className="absolute"
            style={{
              bottom: '2.4%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '9%',
              minHeight: '2px',
              height: '0.65%',
              borderRadius: '1px',
              background: '#363636',
            }}
          />
        </div>
      </div>

      {/* Bottom floating controls */}
      <div className="flex shrink-0 justify-center px-4 pb-5 pt-2">
        <div className="flex items-center gap-0.5 rounded-2xl border border-foreground/10 bg-background/80 px-1.5 py-1.5 shadow-lg backdrop-blur-sm">
          {/* Zoom */}
          <button
            onClick={zoomOut}
            disabled={zoom <= ZOOM_MIN}
            aria-label="Zoom out"
            title="Zoom out"
            className="grid h-9 w-9 place-items-center rounded-xl text-foreground/60 transition-all hover:bg-foreground/10 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ZoomOut className="h-4 w-4" />
          </button>

          <span className="min-w-[2.8rem] text-center font-mono text-xs font-semibold text-foreground/50 tabular-nums">
            {Math.round(zoom * 100)}%
          </span>

          <button
            onClick={zoomIn}
            disabled={zoom >= ZOOM_MAX}
            aria-label="Zoom in"
            title="Zoom in"
            className="grid h-9 w-9 place-items-center rounded-xl text-foreground/60 transition-all hover:bg-foreground/10 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ZoomIn className="h-4 w-4" />
          </button>

          <div className="mx-1 h-6 w-px shrink-0 bg-foreground/10" />

          {/* Page navigation */}
          <button
            onClick={onPrev}
            disabled={currentPage <= 1}
            aria-label="Previous page"
            className="grid h-9 w-9 place-items-center rounded-xl text-foreground/60 transition-all hover:bg-foreground/10 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <form onSubmit={handleSubmit} className="flex items-center gap-1.5 px-1.5">
            <input
              key={currentPage}
              name="page"
              defaultValue={currentPage}
              inputMode="numeric"
              aria-label="Page number"
              className="h-8 w-9 bg-transparent text-center font-mono text-sm font-semibold text-foreground outline-none"
            />
            <span className="font-mono text-xs text-muted-foreground">/ {totalPages}</span>
          </form>

          <button
            onClick={onNext}
            disabled={currentPage >= totalPages}
            aria-label="Next page"
            className="grid h-9 w-9 place-items-center rounded-xl text-foreground/60 transition-all hover:bg-foreground/10 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Config slide-over */}
      <AnimatePresence>
        {isConfigOpen && (
          <motion.aside
            initial={{ x: 340, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 340, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="absolute right-3 top-14 z-20 max-h-[calc(100%-5rem)] w-[min(320px,calc(100vw-1.5rem))] overflow-hidden rounded-xl border border-foreground/10 bg-background/90 shadow-xl backdrop-blur-xl"
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <p className="text-sm font-semibold text-foreground">Config</p>
              <button
                onClick={() => setIsConfigOpen(false)}
                aria-label="Close config"
                className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-2 overflow-y-auto p-3">
              <InfoRow label="Book type"            value={measurements.bookType} />
              <InfoRow label="Page count"           value={String(measurements.pageCount)} />
              <InfoRow label="Expected page size"   value={measurements.expectedPageSize} />
              <InfoRow label="Actual page size"     value={measurements.actualPageSize} />
              <InfoRow label="Cover source"         value={measurements.coverSource} />
              <InfoRow label="Page source"          value={measurements.pageSource} />
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function InfoRow({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 break-words text-sm text-foreground">{value}</p>
    </div>
  );
}
