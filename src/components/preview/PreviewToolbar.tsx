'use client';

import type { FormEvent, ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Book,
  BookMarked,
  ChevronLeft,
  ChevronRight,
  Columns2,
  Download,
  Info,
  X,
} from 'lucide-react';
import type { CameraPreset } from '@/types/kdp';
import type { Preview3DActions, Preview3DState } from './BookPreview3D';

interface PreviewToolbarProps {
  state: Preview3DState;
  actions: Preview3DActions;
  totalPages: number;
  isConfigOpen: boolean;
  onCloseConfig: () => void;
  measurements: {
    trimWidth: string;
    trimHeight: string;
    spine: string;
    pageCount: number;
    bookType: string;
    coverSource: string;
    pageSource: string;
    paperType: string;
  };
}

const VIEWS: { key: CameraPreset; label: string; icon: ReactNode }[] = [
  { key: 'front', label: 'Front', icon: <Book className="h-4 w-4" /> },
  { key: 'back', label: 'Back', icon: <BookMarked className="h-4 w-4" /> },
  { key: 'spine', label: 'Spine', icon: <Columns2 className="h-4 w-4" /> },
];

export default function PreviewToolbar({
  state,
  actions,
  totalPages,
  isConfigOpen,
  onCloseConfig,
  measurements,
}: PreviewToolbarProps) {
  const isAtFirstSpread = state.bookPose === 'open' && state.currentPage <= 1;
  const isClosedBack = state.bookPose === 'closedBack';

  const submitPage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const input = form.elements.namedItem('page') as HTMLInputElement | null;
    const page = Number(input?.value);
    if (!Number.isFinite(page)) {
      if (input) input.value = String(state.currentPage);
      return;
    }
    actions.goToPage(page);
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      <div className="pointer-events-auto absolute right-3 top-3 flex items-center gap-2 sm:right-4">
        <IconButton title="Config info" onClick={actions.toggleConfig} icon={<Info className="h-4 w-4" />} active={isConfigOpen} />
        <IconButton title="Export current view" onClick={() => actions.exportScreenshot()} icon={<Download className="h-4 w-4" />} primary />
      </div>

      <div className="pointer-events-auto absolute bottom-4 left-1/2 flex max-w-[calc(100vw-1.5rem)] -translate-x-1/2 items-center gap-1 overflow-x-auto rounded-xl border border-white/20 bg-background/70 p-1.5 shadow-soft backdrop-blur-xl">
        {VIEWS.map((view) => (
          <TextButton
            key={view.key}
            active={state.cameraPreset === view.key}
            disabled={state.isFlipping}
            onClick={() => actions.setCameraPreset(view.key)}
            icon={view.icon}
            label={view.label}
          />
        ))}

        <div className="mx-1 h-7 w-px shrink-0 bg-border" />

        <IconButton title="Previous spread" disabled={state.isFlipping || isAtFirstSpread} onClick={actions.prevPage} icon={<ChevronLeft className="h-4 w-4" />} />
        <form onSubmit={submitPage} className="flex h-10 shrink-0 items-center gap-1 rounded-lg border border-border bg-surface px-2">
          <input
            key={state.currentPage}
            name="page"
            defaultValue={state.currentPage}
            disabled={state.isFlipping}
            inputMode="numeric"
            aria-label="Page number"
            className="h-8 w-14 bg-transparent text-center font-mono text-sm font-semibold text-foreground outline-none disabled:opacity-40"
          />
          <span className="font-mono text-xs text-muted-foreground">/ {totalPages}</span>
        </form>
        <IconButton title="Next spread" disabled={state.isFlipping || isClosedBack} onClick={actions.nextPage} icon={<ChevronRight className="h-4 w-4" />} />
      </div>

      <AnimatePresence>
        {isConfigOpen && (
          <motion.aside
            initial={{ x: 340, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 340, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="pointer-events-auto absolute right-3 top-16 max-h-[calc(100%-6rem)] w-[min(340px,calc(100vw-1.5rem))] overflow-hidden rounded-xl border border-white/20 bg-background/85 shadow-soft backdrop-blur-xl sm:right-4"
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <p className="text-sm font-semibold text-foreground">Config</p>
              <button onClick={onCloseConfig} className="ds-focus grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground" aria-label="Close config">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-2 overflow-y-auto p-3">
              <InfoRow label="Book type" value={measurements.bookType} />
              <InfoRow label="Trim size" value={`${measurements.trimWidth}" x ${measurements.trimHeight}"`} />
              <InfoRow label="Page count" value={String(measurements.pageCount)} />
              <InfoRow label="Spine width" value={`${measurements.spine}"`} />
              <InfoRow label="Cover source" value={measurements.coverSource} />
              <InfoRow label="Page source" value={measurements.pageSource} />
              <InfoRow label="Paper type" value={measurements.paperType} />
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}

function TextButton({
  active,
  disabled,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`ds-focus flex h-10 shrink-0 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-40 ${
        active ? 'bg-primary text-primary-foreground shadow-soft' : 'text-muted-foreground hover:bg-surface hover:text-foreground'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function IconButton({
  title,
  disabled,
  onClick,
  icon,
  primary,
  active,
}: {
  title: string;
  disabled?: boolean;
  onClick: () => void;
  icon: ReactNode;
  primary?: boolean;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      className={`ds-focus grid h-10 w-10 shrink-0 place-items-center rounded-lg disabled:cursor-not-allowed disabled:opacity-35 ${
        primary || active
          ? 'bg-primary text-primary-foreground shadow-soft'
          : 'border border-white/20 bg-background/70 text-muted-foreground backdrop-blur-xl hover:text-foreground'
      }`}
    >
      {icon}
    </button>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 break-words text-sm text-foreground">{value}</p>
    </div>
  );
}
