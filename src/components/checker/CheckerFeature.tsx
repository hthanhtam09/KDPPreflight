'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Settings, Eye, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '@/store/use-app-store';
import { CheckerStep as CheckerStepType, KDPFormat } from '@/types/kdp';
import ImportStep from './ImportStep';
import ConfigStep from './ConfigStep';
import PreviewStep from './PreviewStep';

// ─── Step Configuration ───────────────────────

const STEPS: { key: CheckerStepType; label: string; icon: typeof Upload; description: string }[] = [
  { key: 'import', label: 'Import', icon: Upload, description: 'Upload & detect' },
  { key: 'config', label: 'Config', icon: Settings, description: 'Review & adjust' },
  { key: 'preview', label: 'Preview', icon: Eye, description: 'Validate & inspect' },
];

// ─── Step Indicator ───────────────────────────

function StepIndicator() {
  const { checkerStep } = useAppStore();
  const currentIndex = STEPS.findIndex((s) => s.key === checkerStep);

  return (
    <div className="flex items-center gap-2">
      {STEPS.map((step, i) => {
        const Icon = step.icon;
        const isActive = step.key === checkerStep;
        const isCompleted = i < currentIndex;
        const isUpcoming = i > currentIndex;

        return (
          <div key={step.key} className="flex items-center gap-2">
            {/* Step pill */}
            <motion.div
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300
                ${
                  isActive
                    ? 'bg-white/[0.08] text-white/80 border border-white/[0.1]'
                    : isCompleted
                      ? 'bg-emerald-500/[0.08] text-emerald-400/70 border border-emerald-500/[0.12]'
                      : 'text-white/25 border border-transparent'
                }
              `}
              whileHover={isUpcoming ? { scale: 1.02 } : undefined}
            >
              {isCompleted ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400/70" />
              ) : (
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white/60' : 'text-white/20'}`} />
              )}
              <span className="hidden sm:inline">{step.label}</span>
            </motion.div>

            {/* Connector */}
            {i < STEPS.length - 1 && (
              <div className="flex items-center">
                <div
                  className={`w-6 h-px transition-colors duration-300 ${
                    i < currentIndex ? 'bg-emerald-400/30' : 'bg-white/[0.06]'
                  }`}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Format Badge ─────────────────────────────

function FormatBadge() {
  const { kdpFormat, setKdpFormat, checkerStep } = useAppStore();

  // Only show format selector on import step; show badge on other steps
  if (checkerStep !== 'import') {
    const formatLabel = kdpFormat === 'kindle' ? 'Kindle' : kdpFormat === 'paperback' ? 'Paperback' : 'Hardcover';
    return (
      <span className="text-[10px] uppercase tracking-wider text-white/30 px-2 py-1 rounded-md bg-white/[0.03] border border-white/[0.06]">
        {formatLabel}
      </span>
    );
  }

  return null;
}

// ─── Main CheckerFeature ─────────────────────

export default function CheckerFeature() {
  const { checkerStep } = useAppStore();

  return (
    <div className="flex flex-col h-full w-full">
      {/* Top bar with step indicator */}
      <div className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/[0.06] bg-white/[0.02]">
        <StepIndicator />
        <FormatBadge />
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={checkerStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
            className="h-full overflow-y-auto"
          >
            {checkerStep === 'import' && <ImportStep />}
            {checkerStep === 'config' && <ConfigStep />}
            {checkerStep === 'preview' && <PreviewStep />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
