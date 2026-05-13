'use client';

import { BookOpen, Monitor, Box } from 'lucide-react';
import { useAppStore } from '@/store/use-app-store';
import ConfigStep from './ConfigStep';
import ImportStep from './ImportStep';
import { StepProgress } from '@/components/workspace/ProductWorkspace';

// ─── Step Indicator ─────────────────────────────────────────────────────────

function StepIndicator() {
  const { checkerStep, setCheckerStep, bookType, uploadedManuscript } = useAppStore();

  const steps = [
    { key: 'import' as const, label: 'Import' },
    { key: 'config' as const, label: 'Configure' },
    { key: 'preview' as const, label: 'Preview' },
  ];

  const currentIndex = steps.findIndex(s => s.key === checkerStep);

  // A step is reachable if:
  // - It's the current step
  // - It's a past step (always allow going back)
  // - It's the next step AND we have the minimum data (manuscript uploaded for config, etc.)
  const isStepReachable = (key: string, index: number): boolean => {
    if (index <= currentIndex) return true; // Current or past steps
    if (index === currentIndex + 1) {
      // Next step: check if we have required data
      if (key === 'config') return !!uploadedManuscript;
      if (key === 'preview') return !!uploadedManuscript;
    }
    return false;
  };

  const reachableSteps = steps.map((step, i) => ({
    ...step,
    reachable: isStepReachable(step.key, i),
  }));

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <StepProgress
        steps={reachableSteps.map((step) => ({ key: step.key, label: step.label }))}
        current={checkerStep}
        onStepClick={(step) => {
          const target = reachableSteps.find((item) => item.key === step.key);
          if (target?.reachable) setCheckerStep(target.key);
        }}
      />
      {/* Book type badge */}
      <div className="ml-3 flex items-center gap-1.5 rounded-full border border-border bg-secondary/70 px-2.5 py-1 text-[10px] text-muted-foreground shadow-soft">
        {bookType === 'kindle' && <Monitor className="w-3 h-3" />}
        {bookType === 'paperback' && <BookOpen className="w-3 h-3" />}
        {bookType === 'hardcover' && <Box className="w-3 h-3" />}
        {bookType.charAt(0).toUpperCase() + bookType.slice(1)}
      </div>
    </div>
  );
}

// ─── Main Checker Feature ──────────────────────────────────────────────────

export default function CheckerFeature() {
  const { checkerStep } = useAppStore();

  // Import and Config steps have normal layout with step indicator
  // (PreviewStep is rendered at page level to avoid transform/backdrop-filter ancestors)
  return (
    <div className="min-h-full text-foreground">
      {/* Step indicator */}
      <StepIndicator />
      <div className="ds-card-glass my-4 flex items-center justify-between gap-4 px-4 py-3 max-md:flex-col max-md:items-start">
        <strong className="text-sm font-semibold text-foreground/90">KDP preflight control room</strong>
        <span className="flex-1 text-[13px] leading-normal text-muted-foreground">Import files, confirm specs, then inspect page-by-page issues with risk levels and fixes.</span>
      </div>

      {/* Step content */}
      {checkerStep === 'import' && <ImportStep />}
      {checkerStep === 'config' && <ConfigStep />}
    </div>
  );
}
