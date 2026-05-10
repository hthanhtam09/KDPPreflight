'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RotateCcw,
  ZoomIn,
  ZoomOut,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Camera,
  CameraOff,
  Sun,
  Moon,
  Monitor,
  Smartphone,
  BookMarked,
  Book,
  Laptop,
  Maximize2,
  Download,
  Info,
  X,
} from 'lucide-react';
import { BookType } from '@/types/kdp';
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

export default function PreviewToolbar({ state, actions, totalPages, measurements }: PreviewToolbarProps) {
  const [showInfo, setShowInfo] = useState(false);
  const [showDevicePicker, setShowDevicePicker] = useState(false);

  const isKindle = state.bookType === 'kindle';

  return (
    <>
      {/* Top bar - Book type selector */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
        <div className="flex items-center bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 p-1 gap-1">
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

      {/* Left toolbar - View controls */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
        <div className="flex flex-col gap-2 bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 p-2">
          <ToolBarButton
            onClick={actions.resetCamera}
            icon={<RotateCcw className="w-4 h-4" />}
            tooltip="Reset view"
          />
          <ToolBarButton
            onClick={() => {}} // Zoom handled by OrbitControls
            icon={<ZoomIn className="w-4 h-4" />}
            tooltip="Scroll to zoom"
            disabled
          />

          {/* Open/Close - only for physical books */}
          {!isKindle && (
            <ToolBarButton
              onClick={actions.toggleOpen}
              icon={<BookOpen className="w-4 h-4" />}
              tooltip={state.isOpen ? 'Close book' : 'Open book'}
              active={state.isOpen}
            />
          )}

          {/* Dark mode toggle - only for Kindle */}
          {isKindle && (
            <ToolBarButton
              onClick={actions.toggleDarkMode}
              icon={state.darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              tooltip={state.darkMode ? 'Light mode' : 'Dark mode'}
              active={state.darkMode}
            />
          )}

          {/* Device picker - only for Kindle */}
          {isKindle && (
            <ToolBarButton
              onClick={() => setShowDevicePicker(!showDevicePicker)}
              icon={<Monitor className="w-4 h-4" />}
              tooltip="Device type"
              active={showDevicePicker}
            />
          )}

          <div className="w-6 h-px bg-white/10 mx-auto" />

          <ToolBarButton
            onClick={() => setShowInfo(!showInfo)}
            icon={<Info className="w-4 h-4" />}
            tooltip="Book info"
            active={showInfo}
          />
        </div>
      </div>

      {/* Device picker popup */}
      <AnimatePresence>
        {showDevicePicker && isKindle && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="absolute left-20 top-1/2 -translate-y-1/2 z-20"
          >
            <div className="bg-black/80 backdrop-blur-xl rounded-xl border border-white/10 p-2 space-y-1">
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

      {/* Bottom bar - Page navigation + Export */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
        <div className="flex items-center gap-3 bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 px-4 py-2.5">
          {/* Previous page */}
          <button
            onClick={actions.prevPage}
            disabled={state.currentPage <= 0 || state.isFlipping}
            className="text-white/60 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Page slider */}
          <div className="flex items-center gap-3 min-w-[200px]">
            <span className="text-white/60 text-xs font-mono w-8 text-right">
              {state.currentPage + 1}
            </span>
            <input
              type="range"
              min={0}
              max={Math.max(totalPages - 1, 0)}
              value={state.currentPage}
              onChange={(e) => actions.goToPage(parseInt(e.target.value))}
              disabled={state.isFlipping}
              className="flex-1 h-1 bg-white/10 rounded-full appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white/80
                [&::-webkit-slider-thumb]:hover:bg-white [&::-webkit-slider-thumb]:transition-colors
                disabled:opacity-30 disabled:cursor-not-allowed"
            />
            <span className="text-white/60 text-xs font-mono w-8">
              {totalPages}
            </span>
          </div>

          {/* Next page */}
          <button
            onClick={actions.nextPage}
            disabled={state.currentPage >= totalPages - 1 || state.isFlipping}
            className="text-white/60 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="w-px h-5 bg-white/10" />

          {/* Export buttons */}
          <button
            onClick={() => actions.exportScreenshot(false)}
            className="flex items-center gap-1.5 text-white/60 hover:text-white transition-colors text-xs"
            title="Export PNG"
          >
            <Camera className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button
            onClick={() => actions.exportScreenshot(true)}
            className="flex items-center gap-1.5 text-white/60 hover:text-white transition-colors text-xs"
            title="Export HD"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">HD</span>
          </button>
        </div>
      </div>

      {/* Right info panel */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="absolute right-4 top-4 z-10"
          >
            <div className="bg-black/80 backdrop-blur-xl rounded-xl border border-white/10 p-4 min-w-[180px]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white/90 text-xs font-semibold uppercase tracking-wider">Book Info</span>
                <button onClick={() => setShowInfo(false)} className="text-white/40 hover:text-white/70">
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
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// --- Sub-components ---

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
          ? 'bg-white/15 text-white shadow-lg shadow-white/5'
          : 'text-white/50 hover:text-white/80 hover:bg-white/5'
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
          ? 'bg-white/15 text-white'
          : disabled
            ? 'text-white/20 cursor-not-allowed'
            : 'text-white/50 hover:text-white hover:bg-white/10'
      }`}
    >
      {icon}
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
          ? 'bg-white/15 text-white'
          : 'text-white/50 hover:text-white hover:bg-white/5'
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
      <span className="text-white/40">{label}</span>
      <span className="text-white/80 font-medium">{value}</span>
    </div>
  );
}
