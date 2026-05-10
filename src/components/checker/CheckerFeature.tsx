'use client';

import React from 'react';
import { Upload, Settings, BookOpen, Monitor, Box } from 'lucide-react';
import { useAppStore } from '@/store/use-app-store';
import ConfigStep from './ConfigStep';
import ImportStep from './ImportStep';
import PreviewStep from './PreviewStep';

// ─── Step Indicator ─────────────────────────────────────────────────────────

function StepIndicator() {
  const { checkerStep, setCheckerStep, bookType } = useAppStore();

  const steps = [
    { key: 'import' as const, label: 'Import', icon: Upload },
    { key: 'config' as const, label: 'Configure', icon: Settings },
    { key: 'preview' as const, label: 'Preview', icon: BookOpen },
  ];

  const currentIndex = steps.findIndex(s => s.key === checkerStep);

  return (
    <div className="flex items-center gap-1">
      {steps.map((step, i) => {
        const Icon = step.icon;
        const isActive = checkerStep === step.key;
        const isPast = i < currentIndex;
        const isClickable = i <= currentIndex;

        return (
          <React.Fragment key={step.key}>
            {i > 0 && (
              <div className={`w-6 h-px transition-colors duration-300 ${
                isPast ? 'bg-emerald-500/40' : 'bg-white/10'
              }`} />
            )}
            <button
              onClick={() => isClickable && setCheckerStep(step.key)}
              disabled={!isClickable}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                  : isPast
                    ? 'text-white/40 hover:text-white/60 hover:bg-white/[0.04]'
                    : 'text-white/20 cursor-not-allowed'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{step.label}</span>
            </button>
          </React.Fragment>
        );
      })}

      {/* Book type badge */}
      <div className="ml-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] text-[10px] text-white/30">
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

  // Preview step takes over the entire viewport (100vh fullscreen)
  if (checkerStep === 'preview') {
    return <PreviewStep />;
  }

  // Import and Config steps have normal layout with step indicator
  return (
    <div className="space-y-4">
      {/* Step indicator */}
      <StepIndicator />

      {/* Step content */}
      {checkerStep === 'import' && <ImportStep />}
      {checkerStep === 'config' && <ConfigStep />}
    </div>
  );
}
