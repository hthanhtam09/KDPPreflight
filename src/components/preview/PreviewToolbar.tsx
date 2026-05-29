'use client';

import type { FormEvent, ReactNode } from 'react';
import {
  Book,
  BookMarked,
  ChevronLeft,
  ChevronRight,
  Columns2,
} from 'lucide-react';
import type { CameraPreset } from '@/types/kdp';
import type { Preview3DActions, Preview3DState } from './BookPreview3D';

interface PreviewToolbarProps {
  state: Preview3DState;
  actions: Preview3DActions;
  totalPages: number;
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
}: PreviewToolbarProps) {
  const isClosedFront = state.bookPose === 'closedFront';
  const isClosedBack = state.bookPose === 'closedBack';
  const displayedPage = isClosedFront ? 'Front' : isClosedBack ? 'Back' : String(state.currentPage);

  const submitPage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const input = form.elements.namedItem('page') as HTMLInputElement | null;
    const page = Number(input?.value);
    if (!Number.isFinite(page)) {
      if (input) input.value = displayedPage;
      return;
    }
    const clamped = Math.max(1, Math.min(Math.round(page), totalPages));
    if (input) input.value = String(clamped);
    actions.goToPage(clamped);
  };

  const clampPageInput = (input: HTMLInputElement) => {
    if (input.value === '') return;
    const page = Number(input.value);
    if (!Number.isFinite(page)) {
      input.value = displayedPage;
      return;
    }
    if (page > totalPages) input.value = String(totalPages);
    if (page < 1) input.value = '1';
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
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

        <IconButton title="Previous spread" disabled={state.isFlipping || isClosedFront} onClick={actions.prevPage} icon={<ChevronLeft className="h-4 w-4" />} />
        <form onSubmit={submitPage} className="flex h-10 shrink-0 items-center gap-1 rounded-lg border border-border bg-surface px-2">
          <input
            key={`${state.bookPose}-${state.currentPage}`}
            name="page"
            defaultValue={displayedPage}
            disabled={state.isFlipping}
            inputMode={isClosedFront || isClosedBack ? 'text' : 'numeric'}
            min={1}
            max={totalPages}
            onInput={(event) => clampPageInput(event.currentTarget)}
            aria-label="Page number"
            className="h-8 w-14 bg-transparent text-center font-mono text-sm font-semibold text-foreground outline-none disabled:opacity-40"
          />
          <span className="font-mono text-xs text-muted-foreground">/ {totalPages}</span>
        </form>
        <IconButton title="Next spread" disabled={state.isFlipping || isClosedBack} onClick={actions.nextPage} icon={<ChevronRight className="h-4 w-4" />} />
      </div>

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
