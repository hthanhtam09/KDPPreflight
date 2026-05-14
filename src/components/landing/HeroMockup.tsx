'use client';

import dynamic from 'next/dynamic';
import { LazyMotion, MotionConfig, domAnimation, m } from 'framer-motion';
import { AlertTriangle, ArrowRight, Check, FileText, Loader2, X } from 'lucide-react';
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';

const HeroScanScene = dynamic(() => import('../hero/HeroScanScene'), { ssr: false });

const UPLOAD_ITEMS = [
  { key: 'cover', name: 'cover.pdf', meta: '4.2 MB - Cover PDF' },
  { key: 'ms', name: 'manuscript.pdf', meta: '12.8 MB - Interior PDF' },
];

const STEP_TIMELINE = [
  { step: 1, at: 350 },
  { step: 2, at: 900 },
  { step: 3, at: 1450 },
  { step: 4, at: 2700 },
  { step: 5, at: 3600 },
  { step: 6, at: 4500 },
  { step: 7, at: 5600 },
  { step: 8, at: 6300 },
  { step: 9, at: 7200 },
  { step: 10, at: 8000 },
];

const LOOP_DURATION = 10600;

const STATUS_STEPS: Record<number, string> = {
  0: 'Waiting for files...',
  1: 'Uploading cover and manuscript...',
  2: 'Files uploaded',
  3: 'Scanning KDP requirements...',
  4: 'Issues found',
  5: 'Bleed issue selected',
  6: 'Applying recommended fix...',
  7: 'Bleed fixed',
  8: 'Rechecking file...',
  9: 'All checks passed',
  10: 'Ready to upload',
};

const FLOW_STEPS = [
  { key: 'upload', label: 'Upload', activeFrom: 1, completeFrom: 2 },
  { key: 'scan', label: 'Scan', activeFrom: 3, completeFrom: 4 },
  { key: 'found', label: 'Found', activeFrom: 4, completeFrom: 5 },
  { key: 'fix', label: 'Fix', activeFrom: 5, completeFrom: 7 },
  { key: 'passed', label: 'OK', activeFrom: 9, completeFrom: 10 },
];

type Severity = 'critical' | 'warning' | 'ok';

type ValidationItem = {
  key: 'bleed' | 'spine' | 'trim';
  severity: Severity;
  label: string;
  detail: string;
};

const HERO_TEXT = {
  primary:
    'text-[color-mix(in_srgb,var(--primary-hover)_78%,var(--foreground))] dark:text-[color-mix(in_srgb,var(--primary)_88%,white)]',
  warning:
    'text-[color-mix(in_srgb,var(--warning)_78%,var(--foreground))] dark:text-[color-mix(in_srgb,var(--warning)_90%,white)]',
  success:
    'text-[color-mix(in_srgb,var(--success)_78%,var(--foreground))] dark:text-[color-mix(in_srgb,var(--success)_88%,white)]',
  danger:
    'text-[color-mix(in_srgb,var(--danger)_78%,var(--foreground))] dark:text-[color-mix(in_srgb,var(--danger)_86%,white)]',
  muted: 'text-[color-mix(in_srgb,var(--muted-foreground)_84%,var(--foreground))] dark:text-white/68',
  quiet: 'text-[color-mix(in_srgb,var(--muted-foreground)_72%,var(--foreground))] dark:text-white/56',
};

function subscribeReducedMotion(callback: () => void) {
  if (typeof window === 'undefined') return () => {};

  const query = window.matchMedia('(prefers-reduced-motion: reduce)');
  query.addEventListener('change', callback);
  return () => query.removeEventListener('change', callback);
}

function getReducedMotionSnapshot() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

function useHydrationSafeReducedMotion() {
  return useSyncExternalStore(subscribeReducedMotion, getReducedMotionSnapshot, getReducedMotionServerSnapshot);
}

function severityBg(s: Severity, selected = false) {
  if (selected) return 'border-destructive/60 bg-destructive/[0.1] shadow-[0_0_0_1px_rgba(220,38,38,0.12)]';
  if (s === 'critical') return 'border-destructive/30 bg-destructive/[0.075]';
  if (s === 'warning') return 'border-warning/30 bg-warning/[0.075]';
  return 'border-success/28 bg-success/[0.07]';
}

function SeverityIcon({ s, fixing }: { s: Severity; fixing?: boolean }) {
  if (fixing) {
    return <Loader2 className={`mt-px h-4 w-4 shrink-0 animate-spin motion-reduce:animate-none ${HERO_TEXT.primary}`} />;
  }
  if (s === 'critical') return <X className={`mt-px h-4 w-4 shrink-0 ${HERO_TEXT.danger}`} />;
  if (s === 'warning') return <AlertTriangle className={`mt-px h-4 w-4 shrink-0 ${HERO_TEXT.warning}`} />;
  return <Check className={`mt-px h-4 w-4 shrink-0 ${HERO_TEXT.success}`} />;
}

// Pure CSS transition — no framer-motion remount on each status change
function StatusBadge({ step }: { step: number }) {
  const status = STATUS_STEPS[step] ?? STATUS_STEPS[0];
  const idle = step === 0;
  const working = (step >= 1 && step <= 3) || (step >= 6 && step <= 8);
  const warning = step >= 4 && step <= 5;
  const success = step >= 9;

  return (
    <div
      className={`flex min-w-[206px] items-center justify-center gap-2 rounded-full border px-3 py-1.5 transition-all duration-200 ${
        idle
          ? `border-border/70 bg-muted/45 ${HERO_TEXT.muted}`
          : working
            ? `border-primary/28 bg-primary/[0.08] ${HERO_TEXT.primary}`
            : warning
              ? `border-warning/32 bg-warning/[0.09] ${HERO_TEXT.warning}`
              : `border-success/30 bg-success/[0.08] ${HERO_TEXT.success}`
      }`}
    >
      {working ? (
        <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin motion-reduce:animate-none" />
      ) : success ? (
        <Check className="h-3.5 w-3.5 shrink-0" />
      ) : warning ? (
        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
      ) : (
        <span className="h-2 w-2 rounded-full bg-current opacity-45" />
      )}
      <span className="whitespace-nowrap text-[11px] font-semibold">{status}</span>
    </div>
  );
}

function FlowIndicator({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-1.5 rounded-full border border-border/55 bg-background/55 px-2 py-1">
      {FLOW_STEPS.map((item, index) => {
        const active = step >= item.activeFrom && step < item.completeFrom;
        const complete = step >= item.completeFrom;
        const finalActive = item.key === 'passed' && step >= 9;

        return (
          <div key={item.key} className="flex items-center gap-1.5">
            {index > 0 ? <span className="h-px w-3 bg-border/70" /> : null}
            <span
              className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] transition-colors ${
                active || finalActive
                  ? `bg-primary/12 ${HERO_TEXT.primary}`
                  : complete
                    ? `bg-success/10 ${HERO_TEXT.success}`
                    : HERO_TEXT.quiet
              }`}
            >
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function DocPreview({ step }: { step: number }) {
  const reduceMotion = useHydrationSafeReducedMotion();
  const scanning = step === 3;
  const rechecking = step === 8;
  const selected = step === 5;
  const fixing = step === 6;
  const fixed = step >= 7;
  const passed = step >= 9;

  const tooltip =
    selected
      ? { tone: 'danger' as const, title: 'Bleed is too small', body: 'Expected 0.125" on all sides' }
      : fixing
        ? { tone: 'primary' as const, title: 'Applying fix', body: 'Extending artwork to bleed area' }
        : fixed && step < 8
          ? { tone: 'success' as const, title: 'Bleed fixed', body: '0.125" bleed applied' }
          : null;

  return (
    <div className="flex flex-col items-center gap-3" aria-hidden="true">
      <div className="relative h-[300px] w-[226px] overflow-visible max-sm:h-[236px] max-sm:w-[178px]">
        <div className="relative h-full w-full overflow-hidden rounded-md border border-border bg-[#f8fafc] shadow-card">
          <div className="absolute inset-x-0 top-0 flex h-9 items-center justify-between border-b border-slate-200 bg-white px-3">
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600">
              <FileText className={`h-3 w-3 ${HERO_TEXT.primary}`} />
              cover.pdf
            </span>
            <span className="text-[9px] font-semibold text-slate-400">PDF</span>
          </div>

          <m.span
            className={`absolute inset-x-3 bottom-3 top-12 rounded-[4px] border-2 border-dashed ${
              fixed ? 'border-success/70' : 'border-destructive/60'
            }`}
            animate={
              selected && !reduceMotion
                ? { opacity: [0.82, 1, 1], scale: [1, 1.012, 1] }
                : { opacity: 1, scale: 1 }
            }
            transition={{ duration: 0.9, repeat: 0, ease: [0.22, 1, 0.36, 1] }}
          />
          <span className="absolute inset-x-5 bottom-5 top-14 rounded-[3px] border border-primary/60" />
          <span className="absolute inset-x-9 bottom-10 top-24 rounded-[3px] border border-dashed border-success/70" />
          <span className="absolute left-1/2 top-14 h-[calc(100%-70px)] w-px -translate-x-1/2 bg-warning/45" />
          <span className="absolute left-[calc(50%-15px)] top-14 h-[calc(100%-70px)] w-px border-l border-dashed border-warning/35" />
          <span className="absolute left-[calc(50%+15px)] top-14 h-[calc(100%-70px)] w-px border-l border-dashed border-warning/35" />

          <div className="absolute inset-x-11 top-[82px] flex flex-col gap-2.5">
            <i className="block h-2.5 rounded-full bg-slate-300/80" />
            <i className="block h-2.5 w-4/5 rounded-full bg-slate-300/75" />
            <i className="block h-2.5 w-full rounded-full bg-slate-300/60" />
            <div className="my-1.5 h-20 rounded border border-slate-200 bg-gradient-to-br from-slate-100 to-white" />
            <i className="block h-1.5 w-full rounded-full bg-slate-300/45" />
            <i className="block h-1.5 w-10/12 rounded-full bg-slate-300/45" />
            <i className="block h-1.5 w-11/12 rounded-full bg-slate-300/35" />
          </div>

          {(scanning || rechecking) && !reduceMotion ? (
            <>
              <m.div
                key={rechecking ? 'recheck-fill' : 'scan-fill'}
                className="pointer-events-none absolute inset-y-0 left-0 w-[44px] bg-gradient-to-r from-transparent via-primary/45 to-transparent mix-blend-multiply"
                initial={{ x: -54 }}
                animate={{ x: 246 }}
                transition={{ duration: rechecking ? 1.15 : 2.45, ease: 'easeInOut' }}
              />
              <m.div
                key={rechecking ? 'recheck-line' : 'scan-line'}
                className="pointer-events-none absolute inset-y-0 left-0 w-[2px] bg-primary shadow-[0_0_22px_rgba(192,132,87,0.65)]"
                initial={{ x: -4 }}
                animate={{ x: 226 }}
                transition={{ duration: rechecking ? 1.15 : 2.45, ease: 'easeInOut' }}
              />
            </>
          ) : null}

          {selected && !fixed ? (
            <m.span
              className="absolute right-4 top-[58px] h-3 w-3 rounded-full border-2 border-white bg-destructive shadow-[0_0_0_5px_rgba(220,38,38,0.18)]"
              animate={reduceMotion ? undefined : { scale: [1, 1.18, 1] }}
              transition={{ duration: 0.72, repeat: 1, ease: [0.22, 1, 0.36, 1] }}
            />
          ) : null}

          {fixing && !reduceMotion ? (
            <>
              {/* scale instead of inset — GPU-composited, no layout reflow */}
              <m.span
                className="absolute inset-x-3 bottom-3 top-12 origin-center rounded-[3px] border-2 border-primary/45"
                initial={{ scale: 0.96, opacity: 0.28 }}
                animate={{ scale: 1.04, opacity: 0 }}
                transition={{ duration: 1.1, ease: 'easeOut' }}
              />
              {/* scaleX instead of width — GPU-composited, no layout reflow */}
              <m.span
                className="absolute left-3 top-12 h-[3px] w-[calc(100%-24px)] origin-left rounded-full bg-primary shadow-[0_0_18px_rgba(192,132,87,0.55)]"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1.05, ease: 'easeInOut' }}
              />
            </>
          ) : null}

          {passed ? (
            <m.div
              className={`absolute right-4 top-12 flex h-8 w-8 items-center justify-center rounded-full border border-success/35 bg-success/12 shadow-[0_0_24px_rgba(5,150,105,0.22)] ${HERO_TEXT.success}`}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.32, ease: 'easeOut' }}
            >
              <Check className="h-4 w-4" />
            </m.div>
          ) : null}
        </div>

        {tooltip ? (
          <m.div
            key={tooltip.title}
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24 }}
            className={`absolute -right-12 top-16 w-[154px] rounded-xl border bg-surface-elevated px-3 py-2 shadow-[0_16px_38px_-22px_rgba(0,0,0,0.55)] max-sm:-right-4 ${
              tooltip.tone === 'success'
                ? 'border-success/45'
                : tooltip.tone === 'primary'
                  ? 'border-primary/45'
                  : 'border-destructive/45'
            }`}
          >
            <p
              className={`whitespace-nowrap text-[11px] font-bold leading-tight ${
                tooltip.tone === 'success'
                  ? HERO_TEXT.success
                  : tooltip.tone === 'primary'
                    ? HERO_TEXT.primary
                    : HERO_TEXT.danger
              }`}
            >
              {tooltip.title}
            </p>
            <p className="mt-0.5 truncate text-[10px] font-medium leading-tight text-foreground/82 dark:text-white/82">
              {tooltip.body}
            </p>
          </m.div>
        ) : null}
      </div>

      <div className="flex items-center gap-3 text-[10px] font-medium text-foreground/72 dark:text-white/72">
        <span className="flex items-center gap-1">
          <span className={`inline-block w-3 border-t-[1.5px] border-dashed ${fixed ? 'border-success/70' : 'border-destructive/60'}`} />
          Bleed
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 border-t border-primary/70" />
          Trim
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 border-t-[1.5px] border-dashed border-success/70" />
          Safe
        </span>
      </div>
    </div>
  );
}

function FooterResult({ step }: { step: number }) {
  const hidden = step < 4;
  const issue = step >= 4 && step <= 5;
  const fixing = step >= 6 && step <= 8;
  const final = step >= 9;

  return (
    <m.div
      className="flex flex-wrap items-center gap-2 border-t border-border/40 bg-muted/20 px-5 py-3.5"
      initial={{ opacity: 0 }}
      animate={{ opacity: hidden ? 0 : 1 }}
      transition={{ duration: 0.34 }}
    >
      <div className="flex items-center gap-2 rounded-xl border border-destructive/24 bg-destructive/[0.06] px-3 py-2">
        {issue ? (
          <AlertTriangle className={`h-3.5 w-3.5 shrink-0 ${HERO_TEXT.warning}`} />
        ) : fixing ? (
          <Loader2 className={`h-3.5 w-3.5 shrink-0 animate-spin motion-reduce:animate-none ${HERO_TEXT.primary}`} />
        ) : (
          <X className={`h-3.5 w-3.5 shrink-0 ${HERO_TEXT.danger}`} />
        )}
        <div className="min-w-0">
          <p className="whitespace-nowrap text-[11px] font-bold leading-tight text-foreground">{issue ? 'Issue found' : fixing ? 'Fixing' : 'Before'}</p>
          <p className={`truncate text-[10px] leading-tight ${HERO_TEXT.muted}`}>
            {issue ? 'Bleed too small' : fixing ? 'Applying bleed correction' : 'KDP rejection risk'}
          </p>
        </div>
      </div>

      <ArrowRight className={`h-4 w-4 shrink-0 ${HERO_TEXT.quiet}`} aria-hidden="true" />

      <div
        className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${
          final
            ? 'border-success/25 bg-success/[0.07]'
            : fixing
              ? 'border-primary/28 bg-primary/[0.07]'
              : 'border-warning/28 bg-warning/[0.07]'
        }`}
      >
        {final ? (
          <Check className={`h-3.5 w-3.5 shrink-0 ${HERO_TEXT.success}`} />
        ) : fixing ? (
          <Loader2 className={`h-3.5 w-3.5 shrink-0 animate-spin motion-reduce:animate-none ${HERO_TEXT.primary}`} />
        ) : (
          <AlertTriangle className={`h-3.5 w-3.5 shrink-0 ${HERO_TEXT.warning}`} />
        )}
        <div className="min-w-0">
          <p className="whitespace-nowrap text-[11px] font-bold leading-tight text-foreground">{final ? 'After' : fixing ? 'Recheck' : 'After scan'}</p>
          <p className={`truncate text-[10px] leading-tight ${HERO_TEXT.muted}`}>
            {final ? 'Ready to upload' : fixing ? 'Fix applied - rechecking' : 'Issues found before upload'}
          </p>
        </div>
      </div>

      <span
        className={`ml-auto whitespace-nowrap text-[10px] font-semibold ${
          final ? HERO_TEXT.success : fixing ? HERO_TEXT.primary : HERO_TEXT.warning
        }`}
      >
        {final ? 'Passed' : fixing ? 'Rechecking' : 'Needs fixing'}
      </span>
    </m.div>
  );
}

export default function HeroMockup() {
  const [step, setStep] = useState(0);
  const reduceMotion = useHydrationSafeReducedMotion();
  const displayStep = step;
  const isFixed = displayStep >= 7;
  const allPassed = displayStep >= 9;

  const visibleValidationItems = useMemo<ValidationItem[]>(() => {
    if (isFixed) {
      return [
        { key: 'bleed', severity: 'ok', label: 'Bleed fixed', detail: '0.125" bleed applied on all sides' },
        {
          key: 'spine',
          severity: allPassed ? 'ok' : 'warning',
          label: allPassed ? 'Spine adjusted' : 'Spine width warning',
          detail: allPassed ? 'Spine width recalculated correctly' : 'Cover spine off by 0.04"',
        },
        { key: 'trim', severity: 'ok', label: 'Trim size OK', detail: '6" x 9" confirmed' },
      ];
    }

    return [
      { key: 'bleed', severity: 'critical', label: 'Bleed issue found', detail: '0.05" detected - Expected 0.125"' },
      { key: 'spine', severity: 'warning', label: 'Spine width warning', detail: 'Cover spine off by 0.04"' },
      { key: 'trim', severity: 'ok', label: 'Trim size OK', detail: '6" x 9" confirmed' },
    ];
  }, [allPassed, isFixed]);

  useEffect(() => {
    const ids: ReturnType<typeof setTimeout>[] = [];
    let alive = true;

    function cycle() {
      if (!alive) return;
      setStep(0);
      STEP_TIMELINE.forEach(({ step: nextStep, at }) => {
        ids.push(setTimeout(() => alive && setStep(nextStep), at));
      });
      ids.push(setTimeout(() => alive && cycle(), LOOP_DURATION));
    }

    cycle();
    return () => {
      alive = false;
      ids.forEach(clearTimeout);
    };
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domAnimation}>
        <div className="relative mx-auto w-full max-w-[720px]" aria-hidden="true">
          <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[24px]">
            <div className="absolute -inset-10 hidden opacity-70 lg:block">
              <HeroScanScene activeStep={displayStep} />
            </div>
            <div
              className="absolute -inset-6 rounded-[36px] bg-[radial-gradient(circle_at_62%_45%,rgba(192,132,87,0.18),transparent_42%)] blur-2xl"
              aria-hidden="true"
            />
          </div>

          <m.div
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.34, ease: 'easeOut' }}
            className="ds-card-glass relative z-10 overflow-hidden rounded-[24px] bg-surface/95"
          >
            <div className="relative z-10">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 bg-muted/24 px-5 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex gap-[5px]" aria-hidden="true">
                    <span className="block h-[10px] w-[10px] rounded-full bg-destructive/35" />
                    <span className="block h-[10px] w-[10px] rounded-full bg-warning/35" />
                    <span className="block h-[10px] w-[10px] rounded-full bg-success/35" />
                  </div>
                  <span className={`whitespace-nowrap text-[12px] font-semibold ${HERO_TEXT.muted}`}>KDP Preflight Checker</span>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <FlowIndicator step={displayStep} />
                  <StatusBadge step={displayStep} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[245px_1fr]">
                <div className="space-y-4 border-b border-border/40 p-4 md:border-b-0 md:border-r md:p-5">
                  <div>
                    <p className={`mb-2 text-[10px] font-bold uppercase tracking-[0.16em] ${HERO_TEXT.quiet}`}>Files</p>
                    <div className="space-y-2">
                      {UPLOAD_ITEMS.map((f, index) => (
                        <m.div
                          key={f.key}
                          initial={{ opacity: 0, x: -10 }}
                          animate={displayStep >= 1 ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                          transition={{ duration: 0.28, delay: index * 0.08 }}
                          className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-background/65 px-3 py-2.5"
                        >
                          <Check className={`h-4 w-4 shrink-0 ${HERO_TEXT.success}`} />
                          <div className="min-w-0">
                            <p className="truncate text-[12px] font-semibold leading-tight text-foreground">{f.name}</p>
                            <p className={`truncate text-[10px] leading-tight ${HERO_TEXT.muted}`}>{f.meta}</p>
                          </div>
                        </m.div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className={`mb-2 text-[10px] font-bold uppercase tracking-[0.16em] ${HERO_TEXT.quiet}`}>
                      Validation
                    </p>
                    {/* Plain div — removed staggerChildren motion wrapper overhead */}
                    <div className="space-y-2">
                      {visibleValidationItems.map((item, i) => {
                        const visible = displayStep >= 4 || reduceMotion;
                        const selected = item.key === 'bleed' && displayStep === 5;
                        const fixing = item.key === 'bleed' && displayStep === 6;
                        const pulse = selected && !reduceMotion;

                        return (
                          // layout prop removed — no FLIP DOM measurement on each step change
                          <m.div
                            key={item.key}
                            variants={{
                              hidden: { opacity: 0, x: -12, scale: 0.98 },
                              show: { opacity: 1, x: 0, scale: 1 },
                            }}
                            initial="hidden"
                            animate={visible ? 'show' : 'hidden'}
                            transition={{ duration: 0.34, ease: 'easeOut', delay: displayStep === 4 ? i * 0.15 : 0 }}
                            className={`flex items-start gap-2.5 rounded-xl border px-3 py-2.5 transition-colors ${severityBg(item.severity, selected)}`}
                          >
                            <SeverityIcon s={item.severity} fixing={fixing} />
                            <div
                              className={`min-w-0 flex-1 transition-opacity duration-700 ${pulse ? 'opacity-[0.84]' : 'opacity-100'}`}
                            >
                              <div className="flex min-w-0 items-center gap-2">
                                <p className="truncate text-[12px] font-semibold leading-tight text-foreground">{fixing ? 'Fixing bleed issue' : item.label}</p>
                                {selected ? (
                                  <span className={`shrink-0 rounded-full border border-destructive/25 bg-destructive/[0.08] px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.08em] ${HERO_TEXT.danger}`}>
                                    Selected
                                  </span>
                                ) : item.key === 'bleed' && displayStep === 4 ? (
                                  <span className={`shrink-0 rounded-full border border-warning/25 bg-warning/[0.08] px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.08em] ${HERO_TEXT.warning}`}>
                                    View issue
                                  </span>
                                ) : null}
                              </div>
                              <p className={`mt-0.5 truncate text-[10px] leading-tight ${HERO_TEXT.muted}`}>
                                {fixing ? 'Extending artwork to the required bleed' : item.detail}
                              </p>
                            </div>
                          </m.div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center p-5 md:p-6">
                  <DocPreview step={displayStep} />
                </div>
              </div>

              <FooterResult step={displayStep} />
            </div>
          </m.div>
        </div>
      </LazyMotion>
    </MotionConfig>
  );
}
