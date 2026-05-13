'use client';

import type { ReactNode } from 'react';
import {
  Book,
  BookMarked,
  BookOpen,
  Camera,
  ChevronLeft,
  ChevronRight,
  Columns2,
  Download,
  FileImage,
  Monitor,
  Moon,
  RotateCcw,
  Smartphone,
  Sun,
} from 'lucide-react';
import type { CameraPreset } from '@/types/kdp';
import type { Preview3DActions, Preview3DState } from './BookPreview3D';

interface PreviewToolbarProps {
  state: Preview3DState;
  actions: Preview3DActions;
  totalPages: number;
  measurements: {
    trimWidth: string;
    trimHeight: string;
    spine: string;
    pageCount: number;
  };
}

const VIEW_BUTTONS: { key: CameraPreset; label: string; icon: ReactNode }[] = [
  { key: 'front', label: 'Front', icon: <Book className="h-4 w-4" /> },
  { key: 'back', label: 'Back', icon: <BookMarked className="h-4 w-4" /> },
  { key: 'spine', label: 'Spine', icon: <Columns2 className="h-4 w-4" /> },
  { key: 'open-spread', label: 'Open', icon: <BookOpen className="h-4 w-4" /> },
];

export default function PreviewToolbar({ state, actions, totalPages, measurements }: PreviewToolbarProps) {
  const isKindle = state.bookType === 'kindle';
  const currentView = state.cameraPreset === 'free' ? 'Free orbit' : state.cameraPreset.replace('-', ' ');

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col">
      <div className="pointer-events-auto border-b border-border bg-surface-glass px-3 py-2 shadow-soft backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <div className="grid grid-cols-3 gap-1 rounded-lg bg-secondary p-1">
              <BookTypeButton active={state.bookType === 'kindle'} onClick={() => actions.setBookType('kindle')} icon={<Smartphone className="h-4 w-4" />} label="Kindle" />
              <BookTypeButton active={state.bookType === 'paperback'} onClick={() => actions.setBookType('paperback')} icon={<Book className="h-4 w-4" />} label="Paperback" />
              <BookTypeButton active={state.bookType === 'hardcover'} onClick={() => actions.setBookType('hardcover')} icon={<BookMarked className="h-4 w-4" />} label="Hardcover" />
            </div>
            <div className="hidden min-w-0 border-l border-border pl-3 md:block">
              <p className="truncate text-sm font-semibold text-foreground">3D book proof</p>
              <p className="text-xs capitalize text-muted-foreground">Current view: {currentView}</p>
            </div>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto">
            {VIEW_BUTTONS.map((view) => (
              <IconTextButton
                key={view.key}
                active={state.cameraPreset === view.key}
                onClick={() => actions.setCameraPreset(view.key)}
                icon={view.icon}
                label={view.label}
              />
            ))}
            <IconButton title="Reset camera" onClick={actions.resetCamera} icon={<RotateCcw className="h-4 w-4" />} />
            <IconButton title="Export current view" onClick={() => actions.exportScreenshot()} icon={<Download className="h-4 w-4" />} primary />
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 justify-end">
        <aside className="pointer-events-auto hidden h-full w-[320px] shrink-0 border-l border-border bg-surface-glass backdrop-blur-xl lg:block">
          <div className="flex h-full flex-col">
            <div className="border-b border-border p-4">
              <p className="text-sm font-semibold text-foreground">Preview settings</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">Inspect spine alignment, cover wrap, thickness, and page spread before publishing.</p>
            </div>

            <div className="space-y-4 overflow-y-auto p-4">
              <SettingBlock title="Cover source" value="Imported cover or generated fallback" icon={<FileImage className="h-4 w-4" />} />
              <SettingBlock title="Page source" value={`${measurements.pageCount} rendered pages`} icon={<BookOpen className="h-4 w-4" />} />
              <SettingBlock title="Trim" value={`${measurements.trimWidth}" x ${measurements.trimHeight}"`} icon={<Book className="h-4 w-4" />} />
              <SettingBlock title="Spine" value={`${measurements.spine}" calculated from paper and page count`} icon={<Columns2 className="h-4 w-4" />} />

              {isKindle && (
                <div className="rounded-xl border border-border bg-surface p-3">
                  <p className="mb-2 text-xs font-semibold text-muted-foreground">Kindle device</p>
                  <div className="grid grid-cols-2 gap-2">
                    {(['paperwhite', 'oasis', 'tablet', 'phone'] as const).map((device) => (
                      <button
                        key={device}
                        onClick={() => actions.setKindleDevice(device)}
                        className={`ds-focus min-h-9 rounded-lg px-2 text-xs font-semibold capitalize ${
                          state.kindleDevice === device ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {device}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={actions.toggleDarkMode}
                    className="ds-focus mt-2 flex min-h-9 w-full items-center justify-center gap-2 rounded-lg border border-border bg-surface text-xs font-semibold text-foreground"
                  >
                    {state.darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    {state.darkMode ? 'Light reading mode' : 'Dark reading mode'}
                  </button>
                </div>
              )}

              <div className="rounded-xl border border-border bg-surface p-3">
                <p className="mb-2 text-xs font-semibold text-muted-foreground">Screenshot options</p>
                <button
                  onClick={() => actions.exportScreenshot()}
                  className="ds-button-primary ds-focus flex min-h-10 w-full items-center justify-center gap-2 rounded-lg text-sm font-semibold"
                >
                  <Camera className="h-4 w-4" />
                  Export current view
                </button>
                <p className="mt-2 text-[11px] leading-5 text-muted-foreground">Exports the exact camera angle visible in the 3D canvas.</p>
              </div>

              <div className="rounded-xl border border-success/25 bg-success/10 p-3 text-xs leading-5 text-muted-foreground">
                The preview renders only the active covers, page stacks, visible spread, and flipping page for stable performance.
              </div>
            </div>
          </div>
        </aside>
      </div>

      <div className="pointer-events-auto border-t border-border bg-surface-glass px-3 py-2 backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <IconButton title="Previous page" disabled={state.currentPage <= 0 || state.isFlipping} onClick={actions.prevPage} icon={<ChevronLeft className="h-4 w-4" />} />
          <div className="flex min-w-[220px] items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2">
            <span className="w-8 text-right font-mono text-xs text-muted-foreground">{state.currentPage + 1}</span>
            <input
              type="range"
              min={0}
              max={Math.max(totalPages - 1, 0)}
              value={state.currentPage}
              onChange={(event) => actions.goToPage(Number(event.target.value))}
              disabled={state.isFlipping}
              className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-secondary accent-primary disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Current page"
            />
            <span className="w-8 font-mono text-xs text-muted-foreground">{totalPages}</span>
          </div>
          <IconButton title="Next page" disabled={state.currentPage >= totalPages - 1 || state.isFlipping} onClick={actions.nextPage} icon={<ChevronRight className="h-4 w-4" />} />
          {!isKindle && (
            <button
              onClick={actions.toggleOpen}
              className="ds-focus flex min-h-10 items-center gap-2 rounded-lg border border-border bg-surface px-3 text-xs font-semibold text-foreground hover:border-primary/30"
            >
              <BookOpen className="h-4 w-4" />
              {state.isOpen ? 'Close book' : 'Open book'}
            </button>
          )}
          <button
            onClick={() => actions.setCameraPreset('free')}
            className="ds-focus flex min-h-10 items-center gap-2 rounded-lg border border-border bg-surface px-3 text-xs font-semibold text-foreground hover:border-primary/30"
          >
            <Monitor className="h-4 w-4" />
            Free orbit
          </button>
        </div>
      </div>
    </div>
  );
}

function BookTypeButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`ds-focus flex min-h-9 items-center justify-center gap-1.5 rounded-md px-2 text-xs font-semibold sm:px-3 ${
        active ? 'bg-primary text-primary-foreground shadow-soft' : 'text-muted-foreground hover:bg-surface hover:text-foreground'
      }`}
      title={label}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function IconTextButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`ds-focus flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold ${
        active ? 'bg-primary text-primary-foreground shadow-soft' : 'bg-surface text-muted-foreground hover:text-foreground'
      }`}
      title={label}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function IconButton({ title, onClick, icon, primary, disabled }: { title: string; onClick: () => void; icon: ReactNode; primary?: boolean; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`ds-focus grid h-10 w-10 place-items-center rounded-lg disabled:cursor-not-allowed disabled:opacity-35 ${
        primary ? 'bg-primary text-primary-foreground shadow-soft' : 'border border-border bg-surface text-muted-foreground hover:text-foreground'
      }`}
      title={title}
      aria-label={title}
    >
      {icon}
    </button>
  );
}

function SettingBlock({ title, value, icon }: { title: string; value: string; icon: ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-3">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-primary">{icon}</div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground">{title}</p>
          <p className="mt-1 text-sm leading-5 text-foreground">{value}</p>
        </div>
      </div>
    </div>
  );
}
