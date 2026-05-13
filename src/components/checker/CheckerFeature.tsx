'use client';

import type { ReactNode } from 'react';
import { BookOpen, Monitor, Box, FileUp, ScanLine, Target, ClipboardCheck } from 'lucide-react';
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
      <div className="my-4 rounded-xl border border-border bg-surface-glass p-4 shadow-card backdrop-blur-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">KDP Checker</p>
            <h1 className="mt-1 text-xl font-semibold tracking-tight text-foreground">Preflight scanner and issue navigator</h1>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
              Upload cover and manuscript files, scan for practical KDP risks, then jump from each issue to the exact page or area.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-4 lg:min-w-[560px]">
            <WorkflowPill icon={<FileUp className="h-3.5 w-3.5" />} label="Upload" active={checkerStep === 'import'} />
            <WorkflowPill icon={<ScanLine className="h-3.5 w-3.5" />} label="Scan" active={checkerStep === 'import'} />
            <WorkflowPill icon={<Target className="h-3.5 w-3.5" />} label="Inspect" active={checkerStep === 'preview'} />
            <WorkflowPill icon={<ClipboardCheck className="h-3.5 w-3.5" />} label="Fix report" active={checkerStep === 'preview'} />
          </div>
        </div>
      </div>

      {/* Step content */}
      {checkerStep === 'import' && <ImportStep />}
      {checkerStep === 'config' && <ConfigStep />}
    </div>
  );
}

function WorkflowPill({ icon, label, active }: { icon: ReactNode; label: string; active: boolean }) {
  return (
    <div
      className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold ${
        active ? 'border-primary/30 bg-primary/10 text-primary' : 'border-border bg-surface text-muted-foreground'
      }`}
    >
      {icon}
      {label}
    </div>
  );
}
