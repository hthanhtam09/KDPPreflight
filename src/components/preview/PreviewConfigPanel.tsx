'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  BadgeCheck,
  BookOpen,
  Box,
  ChevronDown,
  ChevronRight,
  Monitor,
} from 'lucide-react';
import { useAppStore } from '@/store/use-app-store';
import {
  TRIM_SIZES,
  formatInches,
  MAX_PAGE_COUNT_PAPERBACK,
  MIN_PAGE_COUNT,
} from '@/engine/kdp-constants';
import type {
  BleedType,
  BookType,
  CoverFinish,
  DetectedConfig,
  InteriorType,
  PaperType,
  ReadingDirection,
  TrimSizeKey,
} from '@/types/kdp';

const PAPERBACK_TRIMS: TrimSizeKey[] = [
  '5x8', '5.25x8', '5.5x8.5', '6x9', '7x10', '7.44x9.69',
  '8x10', '8.25x6', '8.25x8.25', '8.5x8.5', '8.5x11',
];
const HARDCOVER_TRIMS: TrimSizeKey[] = ['5.5x8.5', '6x9', '7x10', '8.25x8.25', '8.5x11'];

export default function PreviewConfigPanel() {
  const {
    bookConfig,
    bookType,
    measurements,
    updateBookConfig,
    setBookType,
    detectedConfig,
  } = useAppStore();

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [pageCountInput, setPageCountInput] = useState(() => String(bookConfig.pageCount));
  const [isEditingPageCount, setIsEditingPageCount] = useState(false);

  const isKindle = bookType === 'kindle';
  const isHardcover = bookType === 'hardcover';
  const trimKeys = isHardcover ? HARDCOVER_TRIMS : PAPERBACK_TRIMS;
  const maxPages = MAX_PAGE_COUNT_PAPERBACK;
  const pageCountDraft = Number.parseInt(pageCountInput, 10);
  const pageCountRangeError =
    isEditingPageCount &&
    pageCountInput.length > 0 &&
    Number.isFinite(pageCountDraft) &&
    (pageCountDraft < MIN_PAGE_COUNT || pageCountDraft > maxPages);

  useEffect(() => {
    if (!isEditingPageCount) {
      setPageCountInput(String(bookConfig.pageCount));
    }
  }, [bookConfig.pageCount, isEditingPageCount]);

  const isDetected = useCallback(
    (field: keyof DetectedConfig): boolean => {
      if (!detectedConfig || detectedConfig.confidence < 0.3) return false;
      return detectedConfig[field] !== undefined;
    },
    [detectedConfig],
  );

  const handleBookType = useCallback(
    (type: BookType) => {
      setBookType(type);
      updateBookConfig({
        bookType: type,
        binding: type === 'hardcover' ? 'hardcover' : 'paperback',
        trimSize:
          type === 'hardcover' && !HARDCOVER_TRIMS.includes(bookConfig.trimSize)
            ? '6x9'
            : bookConfig.trimSize,
      });
    },
    [bookConfig.trimSize, setBookType, updateBookConfig],
  );

  const handleTrimSize = useCallback(
    (key: string) => {
      if (key === 'custom') {
        updateBookConfig({ trimSize: 'custom', customWidth: 6, customHeight: 9 });
      } else {
        updateBookConfig({ trimSize: key as TrimSizeKey, customWidth: undefined, customHeight: undefined });
      }
    },
    [updateBookConfig],
  );

  const commitPageCount = useCallback(
    (value: string) => {
      const raw = Number.parseInt(value, 10);
      const safeRaw = Number.isFinite(raw) ? raw : bookConfig.pageCount;
      const even = safeRaw % 2 === 0 ? safeRaw : safeRaw + 1;
      const pageCount = Math.max(MIN_PAGE_COUNT, Math.min(maxPages, even));

      setPageCountInput(String(pageCount));
      setIsEditingPageCount(false);
      updateBookConfig({ pageCount });
    },
    [bookConfig.pageCount, maxPages, updateBookConfig],
  );

  const handlePageCountInput = useCallback((value: string) => {
    setIsEditingPageCount(true);
    setPageCountInput(value.replace(/\D/g, ''));
  }, []);

  const adjustPageCount = useCallback(
    (delta: number) => {
      const pageCount = Math.max(MIN_PAGE_COUNT, Math.min(maxPages, bookConfig.pageCount + delta));
      setIsEditingPageCount(false);
      setPageCountInput(String(pageCount));
      updateBookConfig({ pageCount });
    },
    [bookConfig.pageCount, maxPages, updateBookConfig],
  );

  return (
    <div className="flex h-full flex-col overflow-hidden">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="shrink-0 border-b border-border px-4 pb-3 pt-4">
        <p className="text-base font-semibold text-foreground">Book settings</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Adjust dimensions. Preview updates instantly.
        </p>
      </div>

      {/* ── Controls ───────────────────────────────────────────────── */}
      <div className="min-h-0 flex-1 divide-y divide-border/60 overflow-y-auto [scrollbar-gutter:stable]">

        {/* 1. Format */}
        <div className="px-4 py-3">
          <FieldLabel label="Format" />
          <div className="mt-2 grid grid-cols-3 rounded-xl border border-border bg-secondary/50 p-1">
            {([
              { type: 'paperback' as BookType, icon: BookOpen, label: 'Paperback' },
              { type: 'hardcover' as BookType, icon: Box, label: 'Hardcover' },
              { type: 'kindle' as BookType, icon: Monitor, label: 'Kindle' },
            ] as const).map(({ type, icon: Icon, label }) => (
              <button
                key={type}
                onClick={() => handleBookType(type)}
                className={`ds-focus flex flex-col items-center gap-1.5 rounded-lg px-1 py-2 text-[11px] font-semibold transition-colors ${
                  bookType === type
                    ? 'bg-surface text-primary shadow-soft'
                    : 'text-muted-foreground hover:bg-surface/55 hover:text-foreground'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {isKindle ? (
          <div className="px-4 py-3">
            <div className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
              <Monitor className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
              <p className="text-xs leading-5 text-muted-foreground">
                Kindle files are reflowable — no print trim or spine calculations. Cover: 1600 × 2560 px.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* 2. Trim size */}
            <div className="px-4 py-3">
              <FieldLabel label="Trim size" detected={isDetected('trimSize')} />
              <select
                value={bookConfig.trimSize}
                onChange={(e) => handleTrimSize(e.target.value)}
                className="ds-control ds-focus mt-1.5 min-h-9 w-full rounded-lg px-3 text-xs"
              >
                {trimKeys.map((k) => (
                  <option key={k} value={k}>{TRIM_SIZES[k].label}</option>
                ))}
                <option value="custom">Custom size…</option>
              </select>
              {bookConfig.trimSize === 'custom' && (
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <div>
                    <p className="mb-1 text-[10px] text-muted-foreground">Width (in)</p>
                    <input
                      type="number" step="0.01" min={4} max={12}
                      value={bookConfig.customWidth || ''}
                      onChange={(e) => updateBookConfig({ customWidth: parseFloat(e.target.value) || 0 })}
                      className="ds-control ds-focus min-h-9 w-full rounded-lg px-2 text-xs"
                    />
                  </div>
                  <div>
                    <p className="mb-1 text-[10px] text-muted-foreground">Height (in)</p>
                    <input
                      type="number" step="0.01" min={4} max={12}
                      value={bookConfig.customHeight || ''}
                      onChange={(e) => updateBookConfig({ customHeight: parseFloat(e.target.value) || 0 })}
                      className="ds-control ds-focus min-h-9 w-full rounded-lg px-2 text-xs"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 3. Bleed */}
            <div className="px-4 py-3">
              <FieldLabel label="Bleed" detected={isDetected('bleed')} />
              <div className="mt-2 grid grid-cols-2 rounded-xl border border-border bg-secondary/50 p-1">
                {([
                  { value: 'no-bleed', label: 'No bleed', sub: 'Margins, journals' },
                  { value: 'bleed', label: 'Bleed 0.125"', sub: 'Art, photos' },
                ] as const).map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => updateBookConfig({ bleed: opt.value as BleedType })}
                    className={`ds-focus rounded-lg px-2 py-2 text-left transition-colors ${
                      bookConfig.bleed === opt.value
                        ? 'bg-surface shadow-soft'
                        : 'hover:bg-surface/55'
                    }`}
                  >
                    <p className={`text-[11px] font-semibold ${bookConfig.bleed === opt.value ? 'text-primary' : 'text-foreground'}`}>
                      {opt.label}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{opt.sub}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Page count */}
            <div className="px-4 py-3">
              <FieldLabel label="Page count" detected={isDetected('pageCount')} />
              <div className="mt-1.5 flex items-center gap-2">
                <button
                  onClick={() => adjustPageCount(-2)}
                  className="ds-focus grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-border bg-surface text-base text-muted-foreground transition-colors hover:border-primary/20 hover:text-foreground"
                  aria-label="Decrease"
                >−</button>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  min={MIN_PAGE_COUNT}
                  max={maxPages}
                  step={2}
                  value={isEditingPageCount ? pageCountInput : String(bookConfig.pageCount)}
                  onFocus={() => {
                    setIsEditingPageCount(true);
                    setPageCountInput(String(bookConfig.pageCount));
                  }}
                  onChange={(e) => handlePageCountInput(e.target.value)}
                  onBlur={(e) => commitPageCount(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.currentTarget.blur();
                    }
                  }}
                  aria-invalid={pageCountRangeError}
                  aria-describedby="preview-page-count-help"
                  className={`ds-control ds-focus min-h-11 w-full rounded-xl px-3 text-center text-base font-semibold ${
                    pageCountRangeError ? 'border-danger/60 text-danger' : ''
                  }`}
                />
                <button
                  onClick={() => adjustPageCount(2)}
                  className="ds-focus grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-border bg-surface text-base text-muted-foreground transition-colors hover:border-primary/20 hover:text-foreground"
                  aria-label="Increase"
                >+</button>
              </div>
              <p id="preview-page-count-help" className={`mt-1.5 text-[10px] ${pageCountRangeError ? 'text-danger' : 'text-muted-foreground'}`}>
                Spine: <span className="font-mono text-foreground/70">{formatInches(measurements.spineWidthIn)}</span>
                {' · '}
                {pageCountRangeError ? `Enter ${MIN_PAGE_COUNT}-${maxPages} pages` : `Range ${MIN_PAGE_COUNT}-${maxPages}`}
              </p>
            </div>

            {/* 5. Paper */}
            <div className="px-4 py-3">
              <FieldLabel label="Paper type" detected={isDetected('paper')} />
              <select
                value={bookConfig.paper}
                onChange={(e) => updateBookConfig({ paper: e.target.value as PaperType })}
                className="ds-control ds-focus mt-1.5 min-h-9 w-full rounded-lg px-3 text-xs"
              >
                <option value="white">White paper</option>
                <option value="cream">Cream paper</option>
                <option value="premium-color">Premium color paper</option>
              </select>
            </div>

            {/* 6. Advanced (collapsible) */}
            <div className="px-4 py-3">
              <button
                onClick={() => setShowAdvanced((p) => !p)}
                className="ds-focus flex w-full items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                {showAdvanced ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                Advanced settings
              </button>
              {showAdvanced && (
                <div className="mt-3 space-y-3">
                  <div>
                    <FieldLabel label="Interior" />
                    <select
                      value={bookConfig.interior}
                      onChange={(e) => updateBookConfig({ interior: e.target.value as InteriorType })}
                      className="ds-control ds-focus mt-1 min-h-9 w-full rounded-lg px-3 text-xs"
                    >
                      <option value="black-white">Black & white</option>
                      <option value="standard-color">Standard color</option>
                      <option value="premium-color">Premium color</option>
                    </select>
                  </div>
                  <div>
                    <FieldLabel label="Cover finish" />
                    <select
                      value={bookConfig.coverFinish || 'matte'}
                      onChange={(e) => updateBookConfig({ coverFinish: e.target.value as CoverFinish })}
                      className="ds-control ds-focus mt-1 min-h-9 w-full rounded-lg px-3 text-xs"
                    >
                      <option value="matte">Matte</option>
                      <option value="glossy">Glossy</option>
                    </select>
                  </div>
                  <div>
                    <FieldLabel label="Reading direction" />
                    <select
                      value={bookConfig.readingDirection || 'ltr'}
                      onChange={(e) => updateBookConfig({ readingDirection: e.target.value as ReadingDirection })}
                      className="ds-control ds-focus mt-1 min-h-9 w-full rounded-lg px-3 text-xs"
                    >
                      <option value="ltr">Left to right (LTR)</option>
                      <option value="rtl">Right to left (RTL)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function FieldLabel({
  label,
  detected,
}: {
  label: string;
  detected?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs font-semibold text-foreground">{label}</span>
      {detected && (
        <span className="inline-flex items-center gap-0.5 rounded-full border border-primary/30 px-1.5 py-0.5 text-[9px] text-primary">
          <BadgeCheck className="h-2.5 w-2.5" />
          Auto-detected
        </span>
      )}
    </div>
  );
}
