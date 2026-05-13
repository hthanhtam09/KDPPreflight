'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RotateCcw,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Monitor,
  Smartphone,
  BookMarked,
  Book,
  Laptop,
  Download,
  Info,
  X,
  Eye,
  Columns2,
  BookText,
  CloudOff,
} from 'lucide-react';
import { BookType, CameraPreset } from '@/types/kdp';
import type { Preview3DState, Preview3DActions } from './BookPreview3D';

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

// Camera preset configuration
const CAMERA_PRESETS: { key: CameraPreset; label: string; icon: React.ReactNode; shortLabel: string }[] = [
  { key: 'front', label: 'Front Cover', icon: <Book className="w-3.5 h-3.5" />, shortLabel: 'Front' },
  { key: 'back', label: 'Back Cover', icon: <BookMarked className="w-3.5 h-3.5" />, shortLabel: 'Back' },
  { key: 'spine', label: 'Spine Edge', icon: <Columns2 className="w-3.5 h-3.5" />, shortLabel: 'Spine' },
  { key: 'open-spread', label: 'Open Spread', icon: <BookOpen className="w-3.5 h-3.5" />, shortLabel: 'Open' },
  { key: 'page-detail', label: 'Page Detail', icon: <BookText className="w-3.5 h-3.5" />, shortLabel: 'Detail' },
];

export default function PreviewToolbar({ state, actions, totalPages, measurements }: PreviewToolbarProps) {
  const [showInfo, setShowInfo] = useState(false);
  const [showDevicePicker, setShowDevicePicker] = useState(false);
  const [showCameraPresets, setShowCameraPresets] = useState(false);

  const isKindle = state.bookType === 'kindle';
  const activePreset = state.cameraPreset;

  return (
    <>
      {/* ━━━ Top bar - Book type selector ━━━ */}
      <div className="absolute left-3 right-3 top-3 z-10 sm:left-1/2 sm:right-auto sm:top-4 sm:-translate-x-1/2">
        <div className="ds-card-glass mx-auto flex w-fit max-w-full items-center gap-1 p-1">
          <BookTypeButton
            active={state.bookType === 'paperback'}
            onClick={() => actions.setBookType('paperback')}
            icon={<Book className="w-4 h-4" />}
            label="Paperback"
          />
          <BookTypeButton
            active={state.bookType === 'hardcover'}
            onClick={() => actions.setBookType('hardcover')}
            icon={<BookMarked className="w-4 h-4" />}
            label="Hardcover"
          />
          <BookTypeButton
            active={state.bookType === 'kindle'}
            onClick={() => actions.setBookType('kindle')}
            icon={<Smartphone className="w-4 h-4" />}
            label="Kindle"
          />
        </div>
      </div>

      {/* ━━━ Left toolbar - View controls ━━━ */}
      <div className="absolute right-3 top-24 z-10 sm:right-4 sm:top-1/2 sm:-translate-y-1/2">
        <div className="ds-card-glass flex flex-col gap-2 p-2">
          <ToolBarButton
            onClick={actions.resetCamera}
            icon={<RotateCcw className="w-4 h-4" />}
            tooltip="Reset view"
          />

          {!isKindle && (
            <ToolBarButton
              onClick={actions.toggleOpen}
              icon={<BookOpen className="w-4 h-4" />}
              tooltip={state.isOpen ? 'Close book' : 'Open book'}
              active={state.isOpen}
            />
          )}

          {isKindle && (
            <>
              <ToolBarButton
                onClick={actions.toggleDarkMode}
                icon={state.darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                tooltip={state.darkMode ? 'Light mode' : 'Dark mode'}
                active={state.darkMode}
              />
              <ToolBarButton
                onClick={() => setShowDevicePicker(!showDevicePicker)}
                icon={<Monitor className="w-4 h-4" />}
                tooltip="Device type"
                active={showDevicePicker}
              />
            </>
          )}

          <div className="mx-auto h-px w-6 bg-border" />

          {/* Camera presets toggle */}
          <ToolBarButton
            onClick={() => setShowCameraPresets(!showCameraPresets)}
            icon={<Eye className="w-4 h-4" />}
            tooltip="Camera views"
            active={showCameraPresets || activePreset !== 'free'}
          />

          <div className="mx-auto h-px w-6 bg-border" />

          <ToolBarButton
            onClick={() => setShowInfo(!showInfo)}
            icon={<Info className="w-4 h-4" />}
            tooltip="Book info"
            active={showInfo}
          />
        </div>
      </div>

      {/* ━━━ Camera preset popup ━━━ */}
      <AnimatePresence>
        {showCameraPresets && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="absolute left-3 top-24 z-20 sm:left-20 sm:top-1/2 sm:-translate-y-1/2"
          >
            <div className="ds-card-glass min-w-[140px] space-y-1 p-2">
              <div className="px-2 pb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Camera Views
              </div>
              {CAMERA_PRESETS.map((preset) => (
                <CameraPresetButton
                  key={preset.key}
                  active={activePreset === preset.key}
                  onClick={() => {
                    actions.setCameraPreset(preset.key);
                  }}
                  icon={preset.icon}
                  label={preset.shortLabel}
                />
              ))}
              <div className="my-1 h-px w-full bg-border" />
              <CameraPresetButton
                active={activePreset === 'free'}
                onClick={() => actions.setCameraPreset('free')}
                icon={<RotateCcw className="w-3.5 h-3.5" />}
                label="Free orbit"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ━━━ Device picker popup ━━━ */}
      <AnimatePresence>
        {showDevicePicker && isKindle && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="absolute left-3 top-24 z-20 sm:left-20 sm:top-1/2 sm:-translate-y-1/2"
          >
            <div className="ds-card-glass space-y-1 p-2">
              <DeviceButton
                active={state.kindleDevice === 'paperwhite'}
                onClick={() => { actions.setKindleDevice('paperwhite'); setShowDevicePicker(false); }}
                icon={<Book className="w-3.5 h-3.5" />}
                label="Paperwhite"
              />
              <DeviceButton
                active={state.kindleDevice === 'oasis'}
                onClick={() => { actions.setKindleDevice('oasis'); setShowDevicePicker(false); }}
                icon={<BookMarked className="w-3.5 h-3.5" />}
                label="Oasis"
              />
              <DeviceButton
                active={state.kindleDevice === 'tablet'}
                onClick={() => { actions.setKindleDevice('tablet'); setShowDevicePicker(false); }}
                icon={<Laptop className="w-3.5 h-3.5" />}
                label="Tablet"
              />
              <DeviceButton
                active={state.kindleDevice === 'phone'}
                onClick={() => { actions.setKindleDevice('phone'); setShowDevicePicker(false); }}
                icon={<Smartphone className="w-3.5 h-3.5" />}
                label="Phone"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ━━━ Bottom bar - Camera presets quick access + Page navigation + Export ━━━ */}
      <div className="absolute bottom-3 left-3 right-3 z-10 sm:bottom-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2">
        <div className="flex max-w-full flex-col items-center gap-2">
          {/* Camera preset quick buttons */}
          <div className="ds-card-glass flex items-center gap-1 px-2 py-1.5">
            {CAMERA_PRESETS.filter((preset) => ['front', 'back', 'spine'].includes(preset.key)).map((preset) => (
              <button
                key={preset.key}
                onClick={() => actions.setCameraPreset(preset.key)}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium transition-all ${
                  activePreset === preset.key
                    ? 'bg-primary text-primary-foreground shadow-soft'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
                title={preset.label}
              >
                {preset.icon}
                <span className="hidden sm:inline">{preset.shortLabel}</span>
              </button>
            ))}
          </div>

          {/* Page navigation + Export */}
          <div className="ds-card-glass flex w-full max-w-[calc(100vw-1.5rem)] items-center gap-2 px-3 py-2.5 sm:w-auto sm:gap-3 sm:px-4">
            <button
              onClick={actions.prevPage}
              disabled={state.currentPage <= 0 || state.isFlipping}
              className="text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex min-w-0 flex-1 items-center gap-2 sm:min-w-[200px] sm:gap-3">
              <span className="w-8 text-right font-mono text-xs text-muted-foreground">
                {state.currentPage + 1}
              </span>
              <input
                type="range"
                min={0}
                max={Math.max(totalPages - 1, 0)}
                value={state.currentPage}
                onChange={(e) => actions.goToPage(parseInt(e.target.value))}
                disabled={state.isFlipping}
                className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-secondary
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary
                  [&::-webkit-slider-thumb]:transition-colors
                  disabled:opacity-30 disabled:cursor-not-allowed"
              />
              <span className="w-8 font-mono text-xs text-muted-foreground">
                {totalPages}
              </span>
            </div>

            <button
              onClick={actions.nextPage}
              disabled={state.currentPage >= totalPages - 1 || state.isFlipping}
              className="text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div className="h-5 w-px bg-border" />

            <button
              onClick={() => actions.exportScreenshot()}
              className="ds-button-primary inline-flex min-h-[34px] items-center gap-2 rounded-[10px] px-3 text-xs font-extrabold transition hover:-translate-y-px"
              title="Export transparent PNG"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export transparent PNG</span>
            </button>
          </div>
          <div className="ds-status-success hidden items-center gap-2 rounded-full border px-2.5 py-1.5 text-[11px] font-semibold sm:inline-flex">
            <CloudOff className="h-3.5 w-3.5" />
            <span>Preview export runs locally. Files are not stored.</span>
          </div>
        </div>
      </div>

      {/* ━━━ Right info panel ━━━ */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="absolute left-3 top-24 z-10 sm:left-auto sm:right-4 sm:top-4"
          >
            <div className="ds-card-glass min-w-[180px] p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-foreground/90">Book Info</span>
                <button onClick={() => setShowInfo(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-2 text-xs">
                <InfoRow label="Type" value={state.bookType.charAt(0).toUpperCase() + state.bookType.slice(1)} />
                <InfoRow label="Trim" value={`${measurements.trimWidth}" × ${measurements.trimHeight}"`} />
                <InfoRow label="Spine" value={`${measurements.spine}"`} />
                <InfoRow label="Pages" value={String(measurements.pageCount)} />
                <InfoRow label="State" value={state.isOpen ? 'Open' : 'Closed'} />
                <InfoRow label="Page" value={`${state.currentPage + 1} / ${totalPages}`} />
                <InfoRow label="View" value={activePreset === 'free' ? 'Free orbit' : activePreset.replace('-', ' ')} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function BookTypeButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
        active
          ? 'bg-primary text-primary-foreground shadow-soft'
          : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function ToolBarButton({
  onClick,
  icon,
  tooltip,
  active = false,
  disabled = false,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  tooltip: string;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={tooltip}
      className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${
        active
          ? 'bg-primary text-primary-foreground'
          : disabled
            ? 'cursor-not-allowed text-muted-foreground/35'
            : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
      }`}
    >
      {icon}
    </button>
  );
}

function CameraPresetButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all ${
        active
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function DeviceButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all ${
        active
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground/80">{value}</span>
    </div>
  );
}
