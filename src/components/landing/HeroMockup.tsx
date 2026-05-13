'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { AlertTriangle, ArrowRight, Check, Loader2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

/* ─── Static data ────────────────────────── */
const UPLOAD_ITEMS = [
  { key: 'cover', name: 'cover.pdf', meta: '4.2 MB · Cover PDF' },
  { key: 'ms', name: 'manuscript.pdf', meta: '12.8 MB · Interior' },
];

const VALIDATION_ITEMS = [
  {
    key: 'bleed',
    severity: 'critical' as const,
    label: 'Bleed too small',
    detail: '0.05″ detected · Expected 0.125″',
  },
  {
    key: 'spine',
    severity: 'warning' as const,
    label: 'Spine may shift',
    detail: 'Width off by 0.04″',
  },
  {
    key: 'trim',
    severity: 'ok' as const,
    label: 'Trim size matched',
    detail: '6″ × 9″ confirmed',
  },
];

/* ─── Severity helpers ───────────────────── */
function severityBg(s: 'critical' | 'warning' | 'ok') {
  if (s === 'critical') return 'border-destructive/22 bg-destructive/[0.06]';
  if (s === 'warning') return 'border-warning/22 bg-warning/[0.06]';
  return 'border-success/22 bg-success/[0.06]';
}

function SeverityIcon({ s }: { s: 'critical' | 'warning' | 'ok' }) {
  if (s === 'critical') return <X className="mt-px h-3.5 w-3.5 shrink-0 text-destructive" />;
  if (s === 'warning')
    return <AlertTriangle className="mt-px h-3.5 w-3.5 shrink-0 text-warning" />;
  return <Check className="mt-px h-3.5 w-3.5 shrink-0 text-success" />;
}

/* ─── Scanning badge ─────────────────────── */
function ScanningBadge() {
  const reduced = useReducedMotion();
  return (
    <div className="flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/8 px-2.5 py-1">
      {!reduced && (
        <motion.span
          className="block h-[7px] w-[7px] rounded-full bg-primary"
          animate={{ opacity: [1, 0.2, 1] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          aria-hidden="true"
        />
      )}
      <span className="text-[11px] font-semibold text-primary">Scanning</span>
    </div>
  );
}

/* ─── Document preview with overlay lines ── */
const DOC_W = 148;
const DOC_H = 196;

function DocPreview() {
  const reduced = useReducedMotion();

  return (
    <div className="flex flex-col items-center gap-3" aria-hidden="true">
      {/* Page container — always white to look like real paper */}
      <div
        className="relative overflow-hidden rounded-[4px] border border-border bg-surface shadow-card"
        style={{ width: DOC_W, height: DOC_H }}
      >
        {/* Bleed zone — dashed red, full area */}
        <span className="absolute inset-[2px] rounded-[3px] border-[1.5px] border-dashed border-destructive/45" />
        {/* Trim line — solid thin blue */}
        <span className="absolute inset-[8px] rounded-[2px] border border-primary/40" />
        {/* Safe area — dashed green */}
        <span className="absolute inset-[16px] rounded-[2px] border border-dashed border-success/50" />

        {/* Abstract text content blocks */}
        <div className="absolute inset-[22px] flex flex-col gap-[5px] pt-1">
          <i className="block h-[6px] w-full rounded-full bg-gray-300/70" />
          <i className="block h-[6px] w-4/5 rounded-full bg-gray-300/70" />
          <i className="block h-[6px] w-full rounded-full bg-gray-300/65" />
          <i className="block h-[6px] w-3/5 rounded-full bg-gray-300/55" />
          <div className="mt-[3px]" />
          <i className="block h-[5px] w-full rounded-full bg-gray-300/40" />
          <i className="block h-[5px] w-11/12 rounded-full bg-gray-300/40" />
          <i className="block h-[5px] w-10/12 rounded-full bg-gray-300/40" />
          <i className="block h-[5px] w-full rounded-full bg-gray-300/35" />
          <div className="mt-[3px]" />
          <i className="block h-[5px] w-9/12 rounded-full bg-gray-300/35" />
          <i className="block h-[5px] w-full rounded-full bg-gray-300/35" />
          <i className="block h-[5px] w-7/12 rounded-full bg-gray-300/30" />
        </div>

        {/* Animated scan line */}
        {!reduced && (
          <motion.div
            className="pointer-events-none absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-primary/55 to-transparent"
            style={{ top: 0 }}
            animate={{ y: [-2, DOC_H + 2] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
            aria-hidden="true"
          />
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 border-t-[1.5px] border-dashed border-destructive/50" />
          Bleed
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 border-t border-primary/55" />
          Trim
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 border-t-[1.5px] border-dashed border-success/55" />
          Safe
        </span>
      </div>
    </div>
  );
}

/* ─── Main component ─────────────────────── */
export default function HeroMockup() {
  const reduced = useReducedMotion();
  // step: 0=empty, 1=files, 2=val[0], 3=val[1], 4=val[2]=complete
  const [step, setStep] = useState(reduced ? 4 : 0);

  useEffect(() => {
    if (reduced) return;

    const ids: ReturnType<typeof setTimeout>[] = [];
    let alive = true;

    function cycle() {
      if (!alive) return;
      setStep(0);
      ids.push(setTimeout(() => alive && setStep(1), 450));
      ids.push(setTimeout(() => alive && setStep(2), 1250));
      ids.push(setTimeout(() => alive && setStep(3), 2000));
      ids.push(setTimeout(() => alive && setStep(4), 2750));
      ids.push(setTimeout(() => alive && cycle(), 7200));
    }

    cycle();
    return () => {
      alive = false;
      ids.forEach(clearTimeout);
    };
  }, [reduced]);

  return (
    <div className="relative" aria-hidden="true">
      {/* Ambient glow behind the card */}
      <div
        className="pointer-events-none absolute -inset-8 rounded-[40px] bg-gradient-to-br from-primary/[0.09] via-transparent to-transparent blur-3xl dark:from-primary/[0.06]"
        aria-hidden="true"
      />

      {/* ── Outer card ── */}
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.38, ease: 'easeOut' }}
        className="ds-card-glass relative overflow-hidden rounded-[22px]"
      >
        {/* ── Header bar (macOS-style) ── */}
        <div className="flex items-center justify-between border-b border-border/50 bg-muted/30 px-4 py-2.5">
          <div className="flex items-center gap-2.5">
            <div className="flex gap-[5px]" aria-hidden="true">
              <span className="block h-[10px] w-[10px] rounded-full bg-destructive/35" />
              <span className="block h-[10px] w-[10px] rounded-full bg-warning/35" />
              <span className="block h-[10px] w-[10px] rounded-full bg-success/35" />
            </div>
            <span className="text-[12px] font-semibold text-muted-foreground/80">
              KDP Preflight
            </span>
          </div>
          <ScanningBadge />
        </div>

        {/* ── Card body: two panels ── */}
        <div className="grid grid-cols-1 sm:grid-cols-[188px_1fr]">

          {/* Left panel — Files + Validation */}
          <div className="border-b border-border/40 p-4 sm:border-b-0 sm:border-r">

            {/* Files section */}
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground/60">
              Files
            </p>
            <div className="mb-4 space-y-1.5">
              {UPLOAD_ITEMS.map((f) => (
                <motion.div
                  key={f.key}
                  initial={{ opacity: 0, x: -8 }}
                  animate={step >= 1 ? { opacity: 1, x: 0 } : { opacity: 0, x: -8 }}
                  transition={{ duration: 0.26 }}
                  className="flex items-center gap-2 rounded-[11px] border border-border/50 bg-background/55 px-2.5 py-2"
                >
                  <Check className="h-3.5 w-3.5 shrink-0 text-success" />
                  <div>
                    <p className="text-[11px] font-semibold leading-tight text-foreground">
                      {f.name}
                    </p>
                    <p className="text-[10px] leading-tight text-muted-foreground">{f.meta}</p>
                  </div>
                </motion.div>
              ))}

              {/* Detecting trim */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={step >= 1 ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.3, delay: 0.12 }}
                className="flex items-center gap-1.5 rounded-[11px] border border-primary/18 bg-primary/[0.045] px-2.5 py-1.5"
              >
                <Loader2 className="h-3 w-3 shrink-0 animate-spin text-primary" />
                <p className="text-[10px] font-medium text-primary">Detecting trim size…</p>
              </motion.div>
            </div>

            {/* Validation section */}
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground/60">
              Validation
            </p>
            <div className="space-y-1.5">
              {VALIDATION_ITEMS.map((item, i) => (
                <motion.div
                  key={item.key}
                  initial={{ opacity: 0, x: -8 }}
                  animate={step >= 2 + i ? { opacity: 1, x: 0 } : { opacity: 0, x: -8 }}
                  transition={{ duration: 0.26 }}
                  className={`flex items-start gap-2 rounded-[11px] border px-2.5 py-2 ${severityBg(item.severity)}`}
                >
                  <SeverityIcon s={item.severity} />
                  <div>
                    <p className="text-[11px] font-semibold leading-tight text-foreground">
                      {item.label}
                    </p>
                    <p className="text-[10px] leading-tight text-muted-foreground">
                      {item.detail}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right panel — Document preview */}
          <div className="flex items-center justify-center p-5">
            <DocPreview />
          </div>
        </div>

        {/* ── Before → After footer strip ── */}
        <motion.div
          className="flex flex-wrap items-center gap-2 border-t border-border/40 bg-muted/20 px-4 py-3"
          initial={{ opacity: 0 }}
          animate={step >= 4 ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.38 }}
        >
          <div className="flex items-center gap-2 rounded-[11px] border border-destructive/22 bg-destructive/[0.06] px-3 py-1.5">
            <X className="h-3.5 w-3.5 shrink-0 text-destructive" />
            <div>
              <p className="text-[11px] font-bold leading-tight text-foreground">Before</p>
              <p className="text-[10px] leading-tight text-muted-foreground">KDP rejected</p>
            </div>
          </div>

          <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/35" aria-hidden="true" />

          <div className="flex items-center gap-2 rounded-[11px] border border-success/22 bg-success/[0.06] px-3 py-1.5">
            <Check className="h-3.5 w-3.5 shrink-0 text-success" />
            <div>
              <p className="text-[11px] font-bold leading-tight text-foreground">After</p>
              <p className="text-[10px] leading-tight text-muted-foreground">Ready to upload</p>
            </div>
          </div>

          <span className="ml-auto text-[10px] text-muted-foreground/45">
            ✓ Preflighted
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
}
