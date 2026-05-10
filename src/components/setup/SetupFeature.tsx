'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Monitor, Box, ChevronRight, ChevronLeft,
  Maximize2, ScanLine, Layers, Palette, FileText,
  Minus, Plus, ArrowLeft, ArrowRight, Copy, Download,
  Check, AlertTriangle, Info, ChevronDown, ShieldCheck,
  Ruler, Type, Image as ImageIcon, BookMarked,
  ClipboardCheck, Sparkles, FileOutput,
} from 'lucide-react';
import { useAppStore } from '@/store/use-app-store';
import {
  TRIM_SIZES, BLEED_SIZE_IN, formatInches, inchesToMm, inchesToPixels,
  HARDCOVER_HINGE_IN, HARDCOVER_WRAP_IN, GUTTER_IN,
  SAFE_AREA_IN, BARCODE_AREA,
  MIN_PAGE_COUNT, MAX_PAGE_COUNT_PAPERBACK, MAX_PAGE_COUNT_HARDCOVER,
  SPINE_WIDTH_FACTORS,
} from '@/engine/kdp-constants';
import {
  TrimSizeKey, BleedType, PaperType, InteriorType, BookType, BookConfig,
} from '@/types/kdp';

// ─── Constants ────────────────────────────────────────────────────────────

const PAPERBACK_TRIM_KEYS: TrimSizeKey[] = [
  '5x8', '5.25x8', '5.5x8.5', '6x9', '7x10', '7.44x9.69',
  '8x10', '8.25x6', '8.25x8.25', '8.5x8.5', '8.5x11',
];

const HARDCOVER_TRIM_KEYS: TrimSizeKey[] = [
  '5.5x8.5', '6x9', '7x10', '8.25x8.25', '8.5x11',
];

const STEPS = [
  { id: 1, label: 'Book Type', icon: BookOpen },
  { id: 2, label: 'Print Config', icon: Layers },
  { id: 3, label: 'KDP Specs', icon: Ruler },
  { id: 4, label: 'File Prep', icon: FileText },
  { id: 5, label: 'Export Tips', icon: FileOutput },
  { id: 6, label: 'Publish Ready', icon: ClipboardCheck },
];

// ─── Helpers ──────────────────────────────────────────────────────────────

function copyToClipboard(text: string) {
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(text).catch(() => {});
  }
}

// ─── Step Indicator ───────────────────────────────────────────────────────

function StepIndicator({ currentStep, onStepClick }: { currentStep: number; onStepClick: (step: number) => void }) {
  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2 mb-8">
      {STEPS.map((step, idx) => {
        const Icon = step.icon;
        const isActive = currentStep === step.id;
        const isCompleted = currentStep > step.id;
        return (
          <React.Fragment key={step.id}>
            <button
              onClick={() => onStepClick(step.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all duration-300 text-xs font-medium ${
                isActive
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : isCompleted
                    ? 'bg-white/[0.04] text-white/50 border border-white/[0.06] hover:bg-white/[0.08]'
                    : 'bg-transparent text-white/25 border border-transparent hover:bg-white/[0.03]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : ''}`} />
              <span className="hidden sm:inline">{step.label}</span>
              {isCompleted && <Check className="w-3 h-3 text-emerald-500 ml-0.5" />}
            </button>
            {idx < STEPS.length - 1 && (
              <div className={`w-4 sm:w-6 h-px ${currentStep > step.id ? 'bg-emerald-500/30' : 'bg-white/[0.08]'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Navigation Buttons ──────────────────────────────────────────────────

function NavButtons({
  currentStep,
  onPrev,
  onNext,
  nextLabel,
}: {
  currentStep: number;
  onPrev: () => void;
  onNext: () => void;
  nextLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/[0.06]">
      <button
        onClick={onPrev}
        disabled={currentStep === 1}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
          currentStep === 1
            ? 'text-white/20 cursor-not-allowed'
            : 'text-white/60 hover:text-white/90 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06]'
        }`}
      >
        <ChevronLeft className="w-4 h-4" />
        Back
      </button>
      <button
        onClick={onNext}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 hover:text-emerald-200 transition-all duration-200"
      >
        {nextLabel || 'Continue'}
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── Step 1: Book Type ───────────────────────────────────────────────────

function StepBookType() {
  const { bookType, setBookType, updateBookConfig } = useAppStore();

  const bookTypes: { type: BookType; label: string; desc: string; icon: React.ReactNode; features: string[] }[] = [
    {
      type: 'kindle',
      label: 'Kindle eBook',
      desc: 'Digital format for Kindle devices and apps',
      icon: <Monitor className="w-8 h-8" />,
      features: ['Reflowable layout', 'No print dimensions', 'Embedded fonts', 'KFX / MOBI / EPUB'],
    },
    {
      type: 'paperback',
      label: 'Paperback',
      desc: 'Perfect-bound softcover with glued spine',
      icon: <BookOpen className="w-8 h-8" />,
      features: ['Trim size selection', 'Bleed options', 'Spine calculation', 'Barcode zone'],
    },
    {
      type: 'hardcover',
      label: 'Hardcover',
      desc: 'Case-wrap binding with hinge and wrap zones',
      icon: <Box className="w-8 h-8" />,
      features: ['Rigid case binding', 'Hinge + wrap zones', 'Premium feel', 'Spine text'],
    },
  ];

  const handleSelect = (type: BookType) => {
    setBookType(type);
    const binding = type === 'hardcover' ? 'hardcover' : 'paperback';
    updateBookConfig({ bookType: type, binding });
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white/90 mb-2">Choose Your Book Format</h2>
        <p className="text-sm text-white/40">Select the type of book you want to publish. This determines which specifications apply.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
        {bookTypes.map(({ type, label, desc, icon, features }) => {
          const isActive = bookType === type;
          return (
            <motion.button
              key={type}
              onClick={() => handleSelect(type)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative p-6 rounded-xl text-left transition-all duration-300 ${
                isActive
                  ? 'bg-emerald-500/[0.08] border-2 border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                  : 'bg-white/[0.03] border-2 border-white/[0.06] hover:border-white/[0.15] hover:bg-white/[0.05]'
              }`}
            >
              {isActive && (
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-white" />
                </div>
              )}
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${
                isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/[0.06] text-white/40'
              }`}>
                {icon}
              </div>
              <h3 className={`text-lg font-semibold mb-1 ${isActive ? 'text-emerald-300' : 'text-white/80'}`}>
                {label}
              </h3>
              <p className="text-xs text-white/40 mb-4">{desc}</p>
              <div className="space-y-1.5">
                {features.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-[11px] text-white/35">
                    <div className={`w-1 h-1 rounded-full ${isActive ? 'bg-emerald-400' : 'bg-white/20'}`} />
                    {f}
                  </div>
                ))}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Step 2: Print Configuration ─────────────────────────────────────────

function StepPrintConfig() {
  const { bookType, bookConfig, updateBookConfig, measurements } = useAppStore();
  const [customWidth, setCustomWidth] = useState(bookConfig.customWidth?.toString() || '');
  const [customHeight, setCustomHeight] = useState(bookConfig.customHeight?.toString() || '');
  const isHardcover = bookType === 'hardcover';
  const isKindle = bookType === 'kindle';
  const maxPages = isHardcover ? MAX_PAGE_COUNT_HARDCOVER : MAX_PAGE_COUNT_PAPERBACK;

  const trimKeys = isHardcover ? HARDCOVER_TRIM_KEYS : PAPERBACK_TRIM_KEYS;

  const handleTrimSizeChange = useCallback((key: TrimSizeKey) => {
    if (key === 'custom') {
      const w = parseFloat(customWidth) || 6;
      const h = parseFloat(customHeight) || 9;
      updateBookConfig({ trimSize: 'custom', customWidth: w, customHeight: h });
    } else {
      updateBookConfig({ trimSize: key });
    }
  }, [customWidth, customHeight, updateBookConfig]);

  const handlePageCountChange = useCallback((value: string) => {
    let num = parseInt(value) || MIN_PAGE_COUNT;
    if (num % 2 !== 0) num += 1;
    num = Math.max(MIN_PAGE_COUNT, Math.min(maxPages, num));
    updateBookConfig({ pageCount: num });
  }, [maxPages, updateBookConfig]);

  if (isKindle) {
    return (
      <div>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white/90 mb-2">Kindle Configuration</h2>
          <p className="text-sm text-white/40">Kindle eBooks use reflowable layout — no fixed dimensions required.</p>
        </div>
        <div className="max-w-lg mx-auto space-y-4">
          <ConfigCard icon={<Type className="w-4 h-4 text-emerald-400" />} label="Format">
            <div className="flex gap-2">
              {['KFX', 'MOBI', 'EPUB'].map((fmt) => (
                <span key={fmt} className="px-3 py-2 rounded-lg bg-white/[0.04] text-xs text-white/50 border border-white/[0.06]">{fmt}</span>
              ))}
            </div>
          </ConfigCard>
          <ConfigCard icon={<BookMarked className="w-4 h-4 text-emerald-400" />} label="Layout Type">
            <OptionBtn label="Reflowable" active={true} onClick={() => {}} />
            <p className="text-[10px] text-white/25 mt-2">Kindle content adapts to screen size. No fixed page dimensions.</p>
          </ConfigCard>
          <ConfigCard icon={<ImageIcon className="w-4 h-4 text-emerald-400" />} label="File Requirements">
            <div className="space-y-2">
              <SpecRow label="Max file size" value="650 MB" />
              <SpecRow label="Embed fonts" value="Recommended" />
              <SpecRow label="TOC" value="Required (NCX + HTML)" />
            </div>
          </ConfigCard>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white/90 mb-2">Print Configuration</h2>
        <p className="text-sm text-white/40">Set your {isHardcover ? 'hardcover' : 'paperback'} specifications. Measurements update automatically.</p>
      </div>

      <div className="max-w-2xl mx-auto space-y-4">
        {/* Trim Size */}
        <ConfigCard icon={<Maximize2 className="w-4 h-4 text-emerald-400" />} label="Trim Size" help="Select a KDP-approved trim size. This determines your book's final printed dimensions and affects spine width.">
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {trimKeys.map((key) => {
              const size = TRIM_SIZES[key];
              return (
                <OptionBtn
                  key={key}
                  label={size.label}
                  active={bookConfig.trimSize === key}
                  onClick={() => handleTrimSizeChange(key)}
                />
              );
            })}
            {!isHardcover && (
              <OptionBtn
                label="Custom"
                active={bookConfig.trimSize === 'custom'}
                onClick={() => handleTrimSizeChange('custom')}
              />
            )}
          </div>
          {bookConfig.trimSize === 'custom' && !isHardcover && (
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="text-[10px] text-white/30 mb-1 block">Width (inches)</label>
                <input
                  type="number"
                  value={customWidth}
                  onChange={(e) => { setCustomWidth(e.target.value); updateBookConfig({ customWidth: parseFloat(e.target.value) || 0 }); }}
                  step="0.01"
                  min="5"
                  max="8.5"
                  className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-3 py-2 text-xs text-white/80 focus:outline-none focus:border-emerald-500/40"
                  placeholder="6.0"
                />
              </div>
              <div>
                <label className="text-[10px] text-white/30 mb-1 block">Height (inches)</label>
                <input
                  type="number"
                  value={customHeight}
                  onChange={(e) => { setCustomHeight(e.target.value); updateBookConfig({ customHeight: parseFloat(e.target.value) || 0 }); }}
                  step="0.01"
                  min="5"
                  max="11"
                  className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-3 py-2 text-xs text-white/80 focus:outline-none focus:border-emerald-500/40"
                  placeholder="9.0"
                />
              </div>
            </div>
          )}
        </ConfigCard>

        {/* Bleed */}
        <ConfigCard icon={<ScanLine className="w-4 h-4 text-emerald-400" />} label="Bleed" help={bookConfig.bleed === 'bleed' ? 'Adds 0.125" on each side for artwork extending to edges.' : 'White border around content. Choose if artwork stays within trim boundaries.'}>
          <div className="flex gap-2">
            <OptionBtn label="No Bleed" active={bookConfig.bleed === 'no-bleed'} onClick={() => updateBookConfig({ bleed: 'no-bleed' })} />
            <OptionBtn label="With Bleed" active={bookConfig.bleed === 'bleed'} onClick={() => updateBookConfig({ bleed: 'bleed' })} />
          </div>
        </ConfigCard>

        {/* Paper Type */}
        <ConfigCard icon={<Layers className="w-4 h-4 text-emerald-400" />} label="Paper Type" help="Paper type affects spine width. Cream and premium paper are thicker, resulting in a wider spine.">
          <div className="flex gap-2">
            {(['white', 'cream', 'premium-color'] as PaperType[]).map((paper) => (
              <OptionBtn
                key={paper}
                label={paper === 'premium-color' ? 'Premium' : paper.charAt(0).toUpperCase() + paper.slice(1)}
                active={bookConfig.paper === paper}
                onClick={() => updateBookConfig({ paper })}
              />
            ))}
          </div>
        </ConfigCard>

        {/* Interior Type */}
        <ConfigCard icon={<Palette className="w-4 h-4 text-emerald-400" />} label="Interior Type" help="Interior type determines printing method. B&W is most cost-effective.">
          <div className="flex gap-2">
            {(['black-white', 'standard-color', 'premium-color'] as InteriorType[]).map((interior) => (
              <OptionBtn
                key={interior}
                label={interior === 'black-white' ? 'B&W' : interior === 'standard-color' ? 'Standard' : 'Premium'}
                active={bookConfig.interior === interior}
                onClick={() => updateBookConfig({ interior })}
              />
            ))}
          </div>
        </ConfigCard>

        {/* Page Count */}
        <ConfigCard icon={<FileText className="w-4 h-4 text-emerald-400" />} label="Page Count" help={`Spine width is calculated from page count × paper thickness. Range: ${MIN_PAGE_COUNT}–${maxPages} pages.`} accent>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handlePageCountChange(String(bookConfig.pageCount - 2))}
              className="w-9 h-9 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] flex items-center justify-center text-white/50 hover:text-white/80 transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <input
              type="number"
              value={bookConfig.pageCount}
              onChange={(e) => handlePageCountChange(e.target.value)}
              min={MIN_PAGE_COUNT}
              max={maxPages}
              step={2}
              className="flex-1 bg-white/[0.05] border border-white/10 rounded-lg px-3 py-2.5 text-center text-sm font-mono text-white/80 focus:outline-none focus:border-emerald-500/40"
            />
            <button
              onClick={() => handlePageCountChange(String(bookConfig.pageCount + 2))}
              className="w-9 h-9 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] flex items-center justify-center text-white/50 hover:text-white/80 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[10px] text-white/25 mt-2">
            Spine: {formatInches(measurements.spineWidthIn)} • Must be even • Range: {MIN_PAGE_COUNT}–{maxPages}
          </p>
        </ConfigCard>

        {/* Reading Direction + Cover Finish */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ConfigCard icon={<ArrowLeft className="w-4 h-4 text-emerald-400" />} label="Reading Direction">
            <div className="flex gap-2">
              <OptionBtn label="LTR" active={bookConfig.readingDirection !== 'rtl'} onClick={() => updateBookConfig({ readingDirection: 'ltr' })} />
              <OptionBtn label="RTL" active={bookConfig.readingDirection === 'rtl'} onClick={() => updateBookConfig({ readingDirection: 'rtl' })} />
            </div>
          </ConfigCard>
          <ConfigCard icon={<Sparkles className="w-4 h-4 text-emerald-400" />} label="Cover Finish">
            <div className="flex gap-2">
              <OptionBtn label="Matte" active={bookConfig.coverFinish !== 'glossy'} onClick={() => updateBookConfig({ coverFinish: 'matte' })} />
              <OptionBtn label="Glossy" active={bookConfig.coverFinish === 'glossy'} onClick={() => updateBookConfig({ coverFinish: 'glossy' })} />
            </div>
          </ConfigCard>
        </div>
      </div>
    </div>
  );
}

// ─── Step 3: Live KDP Specs ──────────────────────────────────────────────

function StepKdpSpecs() {
  const { bookType, bookConfig, measurements } = useAppStore();
  const isHardcover = bookType === 'hardcover';
  const isKindle = bookType === 'kindle';
  const m = measurements;

  const manuscriptWidth = m.trimWidthIn + (m.bleedIn * 2);
  const manuscriptHeight = m.trimHeightIn + (m.bleedIn * 2);

  if (isKindle) {
    return (
      <div>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white/90 mb-2">Kindle Specifications</h2>
          <p className="text-sm text-white/40">Digital format specifications for your Kindle eBook.</p>
        </div>
        <div className="max-w-lg mx-auto space-y-3">
          <SpecCard emoji="📘" label="Format" value="KFX / MOBI / EPUB" />
          <SpecCard emoji="📕" label="Layout" value="Reflowable" />
          <SpecCard emoji="📗" label="Max File Size" value="650 MB" />
          <SpecCard emoji="📙" label="Embed Fonts" value="Recommended" />
          <SpecCard emoji="📒" label="TOC Required" value="NCX + HTML navigation" />
          <KindleVisualization />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white/90 mb-2">Live KDP Specifications</h2>
        <p className="text-sm text-white/40">All measurements update in real-time as you change your configuration.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 max-w-5xl mx-auto">
        {/* Specs Panel */}
        <div className="lg:w-[380px] shrink-0 space-y-3">
          <SpecCard
            emoji="📘"
            label="Manuscript Size"
            value={`${formatInches(manuscriptWidth)} × ${formatInches(manuscriptHeight)}`}
            sub={m.bleedIn > 0 ? `Trim + ${formatInches(m.bleedIn)} bleed per edge` : 'Trim size (no bleed)'}
            copyText={`${manuscriptWidth.toFixed(3)}" × ${manuscriptHeight.toFixed(3)}"`}
          />
          <SpecCard
            emoji="📕"
            label="Cover Size"
            value={`${formatInches(m.fullCoverWidthIn)} × ${formatInches(m.fullCoverHeightIn)}`}
            sub={`${inchesToPixels(m.fullCoverWidthIn)} × ${inchesToPixels(m.fullCoverHeightIn)} px @ 300 DPI`}
            copyText={`${m.fullCoverWidthIn.toFixed(3)}" × ${m.fullCoverHeightIn.toFixed(3)}"`}
          />
          <SpecCard
            emoji="📗"
            label="Spine Width"
            value={formatInches(m.spineWidthIn)}
            sub={`${inchesToMm(m.spineWidthIn).toFixed(2)} mm`}
            highlight
            copyText={formatInches(m.spineWidthIn)}
          />
          <SpecCard
            emoji="📙"
            label="Safe Area"
            value={`${formatInches(m.safeAreaIn)} from each edge`}
            sub="Keep text and important content inside"
          />
          <SpecCard
            emoji="📒"
            label="Bleed Area"
            value={m.bleedIn > 0 ? `${formatInches(m.bleedIn)} per edge` : 'Disabled'}
            sub={m.bleedIn > 0 ? 'Artwork extends to this area' : 'No bleed selected'}
          />
          {isHardcover && (
            <>
              <SpecCard
                emoji="🔶"
                label="Hinge"
                value={formatInches(m.hingeIn)}
                sub="Required folding area for hardcover"
              />
              <SpecCard
                emoji="🔶"
                label="Wrap Zone"
                value={formatInches(HARDCOVER_WRAP_IN)}
                sub="Cover wraps around case board"
              />
            </>
          )}
          {bookType === 'paperback' && (
            <SpecCard
              emoji="🟣"
              label="Barcode Area"
              value={`2.000" × 1.200"`}
              sub="Bottom-right of back cover — keep clear"
            />
          )}

          {/* Download Template */}
          <DownloadTemplateButton />
        </div>

        {/* SVG Diagram */}
        <div className="flex-1 flex items-start justify-center">
          <CoverDiagram />
        </div>
      </div>
    </div>
  );
}

// ─── Step 4: File Preparation Guide ──────────────────────────────────────

function StepFilePrep() {
  const { bookType, bookConfig, measurements } = useAppStore();
  const m = measurements;
  const isKindle = bookType === 'kindle';
  const isHardcover = bookType === 'hardcover';

  const manuscriptWidth = m.trimWidthIn + (m.bleedIn * 2);
  const manuscriptHeight = m.trimHeightIn + (m.bleedIn * 2);
  const safeW = m.trimWidthIn - (m.safeAreaIn * 2);
  const safeH = m.trimHeightIn - (m.safeAreaIn * 2);

  if (isKindle) {
    return (
      <div>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white/90 mb-2">Kindle File Preparation</h2>
          <p className="text-sm text-white/40">Guidelines for preparing your Kindle eBook files.</p>
        </div>
        <div className="max-w-2xl mx-auto space-y-4">
          <PrepCard title="Kindle Format Requirements" icon={<Monitor className="w-5 h-5 text-emerald-400" />}>
            <div className="space-y-3">
              <PrepRow label="Supported Formats" value="KFX / MOBI / EPUB" />
              <PrepRow label="Layout" value="Reflowable (adapts to screen)" />
              <PrepRow label="Max File Size" value="650 MB" />
              <PrepRow label="Embed Fonts" value="Recommended for consistency" />
              <PrepRow label="Table of Contents" value="Required (NCX + HTML)" />
              <PrepRow label="Images" value="JPEG / GIF / PNG / SVG" />
            </div>
          </PrepCard>
          <PrepCard title="Common Kindle Pitfalls" icon={<AlertTriangle className="w-5 h-5 text-amber-400" />}>
            <ul className="space-y-2 text-xs text-white/50">
              <li className="flex gap-2"><span className="text-amber-400 shrink-0">•</span> Missing TOC — KDP requires functional navigation</li>
              <li className="flex gap-2"><span className="text-amber-400 shrink-0">•</span> Non-embedded fonts — Kindle substitutes fonts if not embedded</li>
              <li className="flex gap-2"><span className="text-amber-400 shrink-0">•</span> Fixed-layout used when reflowable is better — limits device compatibility</li>
              <li className="flex gap-2"><span className="text-amber-400 shrink-0">•</span> Large images not optimized — increases file size unnecessarily</li>
            </ul>
          </PrepCard>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white/90 mb-2">File Preparation Guide</h2>
        <p className="text-sm text-white/40">Everything you need to know to prepare print-ready files for KDP.</p>
      </div>

      <div className="max-w-2xl mx-auto space-y-4">
        {/* Manuscript Export */}
        <PrepCard title="Manuscript Export Size" icon={<FileText className="w-5 h-5 text-emerald-400" />}>
          <div className="space-y-3">
            <PrepRow label="Trim Size" value={`${formatInches(m.trimWidthIn)} × ${formatInches(m.trimHeightIn)}`} />
            <PrepRow label="Bleed" value={m.bleedIn > 0 ? `Enabled (+${formatInches(m.bleedIn)} per edge)` : 'Disabled'} />
            <PrepRow
              label="Recommended Export Size"
              value={`${formatInches(manuscriptWidth)} × ${formatInches(manuscriptHeight)}`}
              highlight
            />
            <PrepRow label="KDP Safe Area" value={`Keep content inside ${formatInches(safeW)} × ${formatInches(safeH)}`} />
            <PrepRow label="Recommended DPI" value="300" />
          </div>
        </PrepCard>

        {/* Cover Export */}
        <PrepCard title="Cover Export Requirements" icon={<BookOpen className="w-5 h-5 text-emerald-400" />}>
          <div className="space-y-3">
            <PrepRow
              label="Front + Back + Spine"
              value={`${formatInches(m.fullCoverWidthIn)} × ${formatInches(m.fullCoverHeightIn)}`}
              highlight
            />
            <PrepRow label="Spine Width" value={formatInches(m.spineWidthIn)} />
            {bookType === 'paperback' && (
              <PrepRow label="Barcode Area" value={'Leave bottom-right 2" × 1.2" clear'} />
            )}
            {isHardcover && (
              <>
                <PrepRow label="Hinge Zone" value={`${formatInches(m.hingeIn)} each side — avoid text here`} />
                <PrepRow label="Wrap Zone" value={`${formatInches(HARDCOVER_WRAP_IN)} each side — wraps around board`} />
              </>
            )}
            <PrepRow label="Recommended" value="Export as PDF Print (300 DPI)" />
          </div>
        </PrepCard>

        {/* Pixel Dimensions */}
        <PrepCard title="Pixel Dimensions at 300 DPI" icon={<Ruler className="w-5 h-5 text-emerald-400" />}>
          <div className="space-y-3">
            <PrepRow label="Manuscript" value={`${inchesToPixels(manuscriptWidth)} × ${inchesToPixels(manuscriptHeight)} px`} />
            <PrepRow label="Full Cover" value={`${inchesToPixels(m.fullCoverWidthIn)} × ${inchesToPixels(m.fullCoverHeightIn)} px`} />
            <PrepRow label="Spine" value={`${inchesToPixels(m.spineWidthIn)} px`} />
          </div>
        </PrepCard>
      </div>
    </div>
  );
}

// ─── Step 5: Export Recommendations ──────────────────────────────────────

function StepExportTips() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['canva']));

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const tips = [
    {
      id: 'canva',
      title: 'Canva Tips',
      icon: '🎨',
      items: [
        'Enable PDF Print (not PDF Standard) for highest quality output',
        'Disable crop marks — KDP adds its own during printing',
        'Enable bleed if your design extends to edges',
        'Avoid transparent elements near edges — they may render unpredictably',
        'Set custom dimensions to your exact cover size before designing',
        'Flatten all layers before export to avoid transparency issues',
      ],
    },
    {
      id: 'photoshop',
      title: 'Photoshop Tips',
      icon: '🖼️',
      items: [
        'Use 300 DPI resolution from the start — don\'t upscale later',
        'Export as High Quality PDF (PDF/X-1a if available)',
        'Flatten transparent effects before export',
        'Convert text to outlines or embed all fonts',
        'Use CMYK color mode for print-accurate colors',
        'Verify final dimensions match KDP requirements exactly',
      ],
    },
    {
      id: 'affinity',
      title: 'Affinity Designer / InDesign Tips',
      icon: '📐',
      items: [
        'Embed all fonts in the PDF export',
        'Export using PDF/X-1a when available for maximum compatibility',
        'Ensure bleed settings match KDP requirements (0.125")',
        'Run Preflight check before export to catch issues',
        'Use facing pages with correct spine width for cover spreads',
        'Convert spot colors to CMYK before export',
      ],
    },
  ];

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white/90 mb-2">Export Recommendations</h2>
        <p className="text-sm text-white/40">Practical tips for exporting your files from popular design tools.</p>
      </div>

      <div className="max-w-2xl mx-auto space-y-3">
        {tips.map((tip) => {
          const isOpen = expanded.has(tip.id);
          return (
            <div key={tip.id} className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
              <button
                onClick={() => toggle(tip.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{tip.icon}</span>
                  <span className="text-sm font-medium text-white/80">{tip.title}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-white/30 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-2.5">
                      {tip.items.map((item, i) => (
                        <div key={i} className="flex gap-2.5 items-start">
                          <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                          <p className="text-xs text-white/45 leading-relaxed">{item}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Step 6: Publishing Tips + Ready for Design ──────────────────────────

function StepPublishReady() {
  const { bookType, bookConfig, measurements } = useAppStore();
  const m = measurements;
  const isKindle = bookType === 'kindle';
  const isHardcover = bookType === 'hardcover';

  const manuscriptWidth = m.trimWidthIn + (m.bleedIn * 2);
  const manuscriptHeight = m.trimHeightIn + (m.bleedIn * 2);

  // Smart warnings
  const warnings: string[] = [];
  if (!isKindle && m.spineWidthIn < 0.1) {
    warnings.push('Your spine is extremely thin. Spine text may not print reliably.');
  }
  if (!isKindle && bookConfig.bleed === 'bleed') {
    warnings.push('If your pages do not contain edge-to-edge artwork, you may prefer no-bleed formatting.');
  }
  if (!isKindle && bookConfig.pageCount < 40) {
    warnings.push('Low page count may result in a very thin book. Consider combining content.');
  }

  // KDP behavior notes
  const kdpNotes = [
    { label: 'Bleed', note: 'KDP may still accept slightly imperfect bleed, but full bleed dimensions reduce print risk significantly.' },
    { label: 'DPI', note: 'Images below 300 DPI may still upload, but printed quality can appear soft or blurry.' },
    { label: 'Safe Area', note: 'Text placed too close to trim edges may appear inconsistent after printing.' },
    { label: 'Spine', note: 'Spine width varies by paper type. Always recalculate when changing paper.' },
    { label: 'Page Count', note: 'KDP requires even page numbers. Minimum 24 pages for paperback.' },
  ];

  const bookTypeLabel = isKindle ? 'Kindle eBook' : isHardcover ? 'Hardcover' : 'Paperback';

  const summaryText = [
    `✅ Your Book Setup`,
    `Type: ${bookTypeLabel}`,
    `Trim: ${formatInches(m.trimWidthIn)} × ${formatInches(m.trimHeightIn)}`,
    `Bleed: ${bookConfig.bleed === 'bleed' ? 'Enabled' : 'Disabled'}`,
    !isKindle ? `Manuscript Export: ${formatInches(manuscriptWidth)} × ${formatInches(manuscriptHeight)}` : 'Format: KFX / MOBI / EPUB',
    !isKindle ? `Cover Export: ${formatInches(m.fullCoverWidthIn)} × ${formatInches(m.fullCoverHeightIn)}` : 'Layout: Reflowable',
    !isKindle ? `Spine Width: ${formatInches(m.spineWidthIn)}` : null,
    `Recommended: 300 DPI PDF Print`,
  ].filter(Boolean).join('\n');

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white/90 mb-2">Publishing Tips & Ready for Design</h2>
        <p className="text-sm text-white/40">Important KDP notes and your complete setup summary.</p>
      </div>

      <div className="max-w-2xl mx-auto space-y-5">
        {/* Smart Warnings */}
        {warnings.length > 0 && (
          <div className="bg-amber-500/[0.08] border border-amber-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-medium text-amber-300">Smart Warnings</span>
            </div>
            <div className="space-y-2">
              {warnings.map((w, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  <p className="text-xs text-white/50">{w}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* KDP Behavior Notes */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-white/70">Real KDP Behavior Notes</span>
          </div>
          <div className="space-y-3">
            {kdpNotes.map((n) => (
              <div key={n.label} className="flex gap-3 items-start">
                <span className="text-[10px] uppercase tracking-wider text-white/30 font-medium min-w-[60px] pt-0.5">{n.label}</span>
                <p className="text-xs text-white/40 leading-relaxed">{n.note}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Ready for Design Summary */}
        <div className="bg-emerald-500/[0.06] border border-emerald-500/20 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-emerald-400" />
              <span className="text-sm font-semibold text-emerald-300">Your Book Setup</span>
            </div>
            <button
              onClick={() => copyToClipboard(summaryText)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-[11px] text-white/50 hover:text-white/80 transition-colors"
            >
              <Copy className="w-3 h-3" />
              Copy All Settings
            </button>
          </div>
          <div className="space-y-2.5">
            <SummaryRow label="Type" value={bookTypeLabel} />
            <SummaryRow label="Trim" value={`${formatInches(m.trimWidthIn)} × ${formatInches(m.trimHeightIn)}`} />
            <SummaryRow label="Bleed" value={bookConfig.bleed === 'bleed' ? 'Enabled' : 'Disabled'} />
            {!isKindle && (
              <>
                <SummaryRow label="Manuscript Export" value={`${formatInches(manuscriptWidth)} × ${formatInches(manuscriptHeight)}`} />
                <SummaryRow label="Cover Export" value={`${formatInches(m.fullCoverWidthIn)} × ${formatInches(m.fullCoverHeightIn)}`} />
                <SummaryRow label="Spine Width" value={formatInches(m.spineWidthIn)} highlight />
              </>
            )}
            {isKindle && (
              <>
                <SummaryRow label="Format" value="KFX / MOBI / EPUB" />
                <SummaryRow label="Layout" value="Reflowable" />
              </>
            )}
            <SummaryRow label="Recommended" value="300 DPI PDF Print" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Shared Sub-Components ────────────────────────────────────────────────

function ConfigCard({ icon, label, help, children, accent }: {
  icon: React.ReactNode;
  label: string;
  help?: string;
  children: React.ReactNode;
  accent?: boolean;
}) {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className={`rounded-xl border transition-all duration-300 ${
      accent ? 'bg-emerald-500/[0.06] border-emerald-500/20' : 'bg-white/[0.03] border-white/[0.06]'
    }`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${accent ? 'bg-emerald-500/20' : 'bg-white/[0.06]'}`}>
              {icon}
            </div>
            <span className="text-sm font-medium text-white/80">{label}</span>
          </div>
          {help && (
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="w-5 h-5 rounded-full flex items-center justify-center text-white/20 hover:text-white/50 hover:bg-white/[0.06] transition-colors"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        {children}
        {help && showHelp && (
          <div className="mt-3 flex gap-2 items-start bg-white/[0.03] rounded-lg p-2.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
            <p className="text-[11px] text-white/50 leading-relaxed">{help}</p>
          </div>
        )}
      </div>
      {help && !showHelp && (
        <div className="px-4 pb-3">
          <p className="text-[10px] text-white/25 truncate">{help}</p>
        </div>
      )}
    </div>
  );
}

function OptionBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
        active
          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm shadow-emerald-500/10'
          : 'bg-white/[0.04] text-white/45 border border-transparent hover:bg-white/[0.08] hover:text-white/65'
      }`}
    >
      {active && <Check className="w-3 h-3 inline mr-1 -mt-0.5" />}
      {label}
    </button>
  );
}

function SpecCard({ emoji, label, value, sub, highlight, copyText }: {
  emoji: string;
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
  copyText?: string;
}) {
  return (
    <div className={`flex items-center justify-between p-3 rounded-xl transition-all duration-200 ${
      highlight ? 'bg-emerald-500/[0.08] border border-emerald-500/20' : 'bg-white/[0.03] border border-white/[0.06]'
    }`}>
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <span className="text-base shrink-0">{emoji}</span>
        <div className="min-w-0">
          <p className="text-xs text-white/45">{label}</p>
          {sub && <p className="text-[10px] text-white/25 truncate">{sub}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0 ml-3">
        <p className={`text-sm font-mono font-medium ${highlight ? 'text-emerald-400' : 'text-white/80'}`}>
          {value}
        </p>
        {copyText && (
          <button
            onClick={() => copyToClipboard(copyText)}
            className="w-6 h-6 rounded-md flex items-center justify-center text-white/20 hover:text-white/50 hover:bg-white/[0.06] transition-colors"
            title="Copy"
          >
            <Copy className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between p-2 bg-white/[0.02] rounded-lg">
      <span className="text-xs text-white/40">{label}</span>
      <span className="text-xs text-white/70">{value}</span>
    </div>
  );
}

function PrepCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
      <div className="flex items-center gap-2.5 mb-4">
        {icon}
        <h3 className="text-sm font-semibold text-white/80">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function PrepRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`flex items-center justify-between p-2.5 rounded-lg ${highlight ? 'bg-emerald-500/[0.06] border border-emerald-500/15' : 'bg-white/[0.02]'}`}>
      <span className="text-xs text-white/40">{label}</span>
      <span className={`text-xs font-mono ${highlight ? 'text-emerald-400 font-medium' : 'text-white/70'}`}>{value}</span>
    </div>
  );
}

function SummaryRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-xs text-white/40">{label}</span>
      <span className={`text-sm font-mono ${highlight ? 'text-emerald-400 font-medium' : 'text-white/75'}`}>{value}</span>
    </div>
  );
}

// ─── Kindle Visualization ────────────────────────────────────────────────

function KindleVisualization() {
  return (
    <div className="flex flex-col items-center justify-center mt-6">
      <svg width="240" height="320" viewBox="0 0 240 320" className="text-white">
        <rect x="16" y="8" width="208" height="304" rx="14" ry="14" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
        <rect x="30" y="30" width="180" height="246" rx="2" ry="2" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
        <text x="120" y="44" textAnchor="middle" className="text-[8px]" fill="rgba(255,255,255,0.3)">Chapter Title</text>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
          <rect key={i} x="42" y={58 + i * 20} width={i % 3 === 1 ? 120 : i % 3 === 2 ? 150 : 162} height="3.5" rx="1.5" fill="rgba(255,255,255,0.05)" />
        ))}
        <text x="120" y="296" textAnchor="middle" className="text-[7px]" fill="rgba(255,255,255,0.2)">Loc 1234 · 15%</text>
        <circle cx="120" cy="286" r="2.5" fill="rgba(255,255,255,0.08)" />
      </svg>
      <div className="flex gap-4 mt-3">
        <div className="flex items-center gap-1.5 text-[10px] text-white/35">
          <Monitor className="w-3 h-3" /> Reflowable
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-white/35">
          <Type className="w-3 h-3" /> Embedded Fonts
        </div>
      </div>
    </div>
  );
}

// ─── Cover SVG Diagram ──────────────────────────────────────────────────

function CoverDiagram() {
  const { measurements, bookType, bookConfig } = useAppStore();
  const m = measurements;
  const isHardcover = bookType === 'hardcover';

  const svgW = 500;
  const svgH = 420;
  const padding = 40;

  const maxDim = Math.max(m.fullCoverWidthIn, m.fullCoverHeightIn);
  const availW = svgW - padding * 2;
  const availH = svgH - padding * 2;
  const scale = Math.min(availW, availH) / maxDim;

  const coverW = m.fullCoverWidthIn * scale;
  const coverH = m.fullCoverHeightIn * scale;
  const offX = (svgW - coverW) / 2;
  const offY = (svgH - coverH) / 2;

  const bleed = m.bleedIn * scale;
  const wrap = m.wrapAroundIn * scale;
  const spine = m.spineWidthIn * scale;
  const trimW = m.trimWidthIn * scale;
  const trimH = m.trimHeightIn * scale;
  const safe = m.safeAreaIn * scale;
  const hinge = m.hingeIn * scale;

  const x0 = offX;
  const y0 = offY;

  const wrapL = x0 + wrap;
  const wrapT = y0 + wrap;
  const wrapR = x0 + coverW - wrap;
  const wrapB = y0 + coverH - wrap;

  const bleedL = wrapL + bleed;
  const bleedT = wrapT + bleed;
  const bleedR = wrapR - bleed;
  const bleedB = wrapB - bleed;

  const backX = bleedL;
  const backY = bleedT;
  const backW = trimW;
  const backH = trimH;

  const spineX = backX + backW;
  const spineY = bleedT;

  const frontX = spineX + spine;
  const frontY = bleedT;
  const frontW = trimW;
  const frontH = trimH;

  const hingeLeftX = backX;
  const hingeRightX = frontX + frontW - hinge;

  const barcodeW = BARCODE_AREA.width * scale;
  const barcodeH = BARCODE_AREA.height * scale;
  const barcodeX = backX + backW - safe - barcodeW;
  const barcodeY = backY + backH - safe - barcodeH;

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-xs text-white/40 uppercase tracking-wider mb-3">
        {isHardcover ? 'Hardcover' : 'Paperback'} Cover Layout
      </h3>
      <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} className="text-white max-w-full">
        {/* Full Cover Outline — Black/dashed */}
        <rect x={x0} y={y0} width={coverW} height={coverH} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="4 3" style={{ transition: 'all 0.4s ease' }} />

        {/* Wrap Area — Amber (hardcover) */}
        {isHardcover && (
          <>
            <rect x={x0} y={y0} width={coverW} height={coverH} fill="rgba(251,191,36,0.03)" stroke="none" style={{ transition: 'all 0.4s ease' }} />
            <rect x={wrapL} y={wrapT} width={wrapR - wrapL} height={wrapB - wrapT} fill="none" stroke="rgba(251,191,36,0.2)" strokeWidth="0.5" strokeDasharray="3 2" style={{ transition: 'all 0.4s ease' }} />
          </>
        )}

        {/* Bleed Area — Red */}
        {bleed > 0 && (
          <rect x={wrapL} y={wrapT} width={wrapR - wrapL} height={wrapB - wrapT} fill="rgba(239,68,68,0.04)" stroke="rgba(239,68,68,0.25)" strokeWidth="0.5" style={{ transition: 'all 0.4s ease' }} />
        )}

        {/* Back Cover — Black solid border (trim line) */}
        <rect x={backX} y={backY} width={backW} height={backH} fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.18)" strokeWidth="1" style={{ transition: 'all 0.4s ease' }} />

        {/* Front Cover — Black solid border (trim line) */}
        <rect x={frontX} y={frontY} width={frontW} height={frontH} fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.25)" strokeWidth="1" style={{ transition: 'all 0.4s ease' }} />

        {/* Spine — Green */}
        <rect x={spineX} y={spineY} width={Math.max(spine, 1)} height={trimH} fill="rgba(16,185,129,0.1)" stroke="rgba(16,185,129,0.4)" strokeWidth="0.5" style={{ transition: 'all 0.4s ease' }} />

        {/* Hinge Areas — Amber dashed (hardcover only) */}
        {isHardcover && hinge > 0 && (
          <>
            <rect x={hingeLeftX} y={bleedT} width={hinge} height={trimH} fill="rgba(251,191,36,0.06)" stroke="rgba(251,191,36,0.3)" strokeWidth="0.5" strokeDasharray="2 2" style={{ transition: 'all 0.4s ease' }} />
            <rect x={hingeRightX} y={bleedT} width={hinge} height={trimH} fill="rgba(251,191,36,0.06)" stroke="rgba(251,191,36,0.3)" strokeWidth="0.5" strokeDasharray="2 2" style={{ transition: 'all 0.4s ease' }} />
          </>
        )}

        {/* Safe Zones — Blue dashed */}
        <rect x={backX + safe} y={backY + safe} width={Math.max(backW - 2 * safe, 1)} height={Math.max(backH - 2 * safe, 1)} fill="none" stroke="rgba(59,130,246,0.3)" strokeWidth="0.5" strokeDasharray="2 2" style={{ transition: 'all 0.4s ease' }} />
        <rect x={frontX + safe} y={frontY + safe} width={Math.max(frontW - 2 * safe, 1)} height={Math.max(frontH - 2 * safe, 1)} fill="none" stroke="rgba(59,130,246,0.3)" strokeWidth="0.5" strokeDasharray="2 2" style={{ transition: 'all 0.4s ease' }} />

        {/* Barcode Area — Purple dashed (paperback only) */}
        {!isHardcover && (
          <rect x={barcodeX} y={barcodeY} width={barcodeW} height={barcodeH} fill="rgba(168,85,247,0.06)" stroke="rgba(168,85,247,0.25)" strokeWidth="0.5" strokeDasharray="2 2" style={{ transition: 'all 0.4s ease' }} />
        )}

        {/* Labels */}
        <text x={frontX + frontW / 2} y={frontY + frontH / 2 - 6} textAnchor="middle" className="text-[9px]" fill="rgba(255,255,255,0.5)">Front Cover</text>
        <text x={frontX + frontW / 2} y={frontY + frontH / 2 + 8} textAnchor="middle" className="text-[8px]" fill="rgba(255,255,255,0.25)">{formatInches(m.trimWidthIn)} × {formatInches(m.trimHeightIn)}</text>
        <text x={backX + backW / 2} y={backY + backH / 2} textAnchor="middle" className="text-[9px]" fill="rgba(255,255,255,0.35)">Back Cover</text>

        {spine > 12 && (
          <text x={spineX + spine / 2} y={spineY + spineH / 2} textAnchor="middle" className="text-[7px]" fill="rgba(16,185,129,0.6)" transform={`rotate(-90, ${spineX + spine / 2}, ${spineY + spineH / 2})`}>Spine {formatInches(m.spineWidthIn)}</text>
        )}

        {isHardcover && hinge > 8 && (
          <>
            <text x={hingeLeftX + hinge / 2} y={bleedT + trimH / 2} textAnchor="middle" className="text-[6px]" fill="rgba(251,191,36,0.5)" transform={`rotate(-90, ${hingeLeftX + hinge / 2}, ${bleedT + trimH / 2})`}>Hinge</text>
            <text x={hingeRightX + hinge / 2} y={bleedT + trimH / 2} textAnchor="middle" className="text-[6px]" fill="rgba(251,191,36,0.5)" transform={`rotate(-90, ${hingeRightX + hinge / 2}, ${bleedT + trimH / 2})`}>Hinge</text>
          </>
        )}

        {!isHardcover && (
          <text x={barcodeX + barcodeW / 2} y={barcodeY + barcodeH / 2} textAnchor="middle" className="text-[6px]" fill="rgba(168,85,247,0.5)">Barcode</text>
        )}

        {/* Dimension lines */}
        <line x1={x0} y1={y0 + coverH + 14} x2={x0 + coverW} y2={y0 + coverH + 14} stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
        <text x={x0 + coverW / 2} y={y0 + coverH + 25} textAnchor="middle" className="text-[8px]" fill="rgba(255,255,255,0.3)">{formatInches(m.fullCoverWidthIn)}</text>
        <line x1={x0 + coverW + 14} y1={y0} x2={x0 + coverW + 14} y2={y0 + coverH} stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
        <text x={x0 + coverW + 22} y={y0 + coverH / 2} textAnchor="middle" className="text-[8px]" fill="rgba(255,255,255,0.3)" transform={`rotate(90, ${x0 + coverW + 22}, ${y0 + coverH / 2})`}>{formatInches(m.fullCoverHeightIn)}</text>
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 justify-center mt-3">
        <div className="flex items-center gap-1.5 text-[10px] text-white/35"><div className="w-3 h-0.5 border border-dashed border-white/20" /> Trim Line</div>
        {bleed > 0 && <div className="flex items-center gap-1.5 text-[10px] text-white/35"><div className="w-3 h-0.5 bg-red-500/30" /> Bleed</div>}
        <div className="flex items-center gap-1.5 text-[10px] text-white/35"><div className="w-3 h-0.5 bg-emerald-500/40" /> Spine</div>
        <div className="flex items-center gap-1.5 text-[10px] text-white/35"><div className="w-3 h-0.5 border border-dashed border-blue-400/30" /> Safe Area</div>
        {!isHardcover && <div className="flex items-center gap-1.5 text-[10px] text-white/35"><div className="w-3 h-0.5 border border-dashed border-purple-400/30" /> Barcode</div>}
        {isHardcover && <div className="flex items-center gap-1.5 text-[10px] text-white/35"><div className="w-3 h-0.5 border border-dashed border-amber-400/30" /> Hinge/Wrap</div>}
      </div>
    </div>
  );
}

// ─── Download Template PNG Button ────────────────────────────────────────

function DownloadTemplateButton() {
  const { measurements, bookType, bookConfig } = useAppStore();

  const handleDownload = useCallback(() => {
    const m = measurements;
    const canvas = document.createElement('canvas');
    const dpi = 300;
    canvas.width = inchesToPixels(m.fullCoverWidthIn, dpi);
    canvas.height = inchesToPixels(m.fullCoverHeightIn, dpi);
    const ctx = canvas.getContext('2d')!;

    // Transparent background
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const wrapPx = inchesToPixels(m.wrapAroundIn, dpi);
    const bleedPx = inchesToPixels(m.bleedIn, dpi);
    const trimWPx = inchesToPixels(m.trimWidthIn, dpi);
    const trimHPx = inchesToPixels(m.trimHeightIn, dpi);
    const spinePx = Math.max(inchesToPixels(m.spineWidthIn, dpi), 2);
    const safePx = inchesToPixels(m.safeAreaIn, dpi);

    // Wrap area
    if (bookType === 'hardcover') {
      ctx.strokeStyle = 'rgba(251,191,36,0.3)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(wrapPx, wrapPx, canvas.width - 2 * wrapPx, canvas.height - 2 * wrapPx);
    }

    // Bleed area
    if (m.bleedIn > 0) {
      ctx.strokeStyle = 'rgba(239,68,68,0.4)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(wrapPx, wrapPx, canvas.width - 2 * wrapPx, canvas.height - 2 * wrapPx);
    }

    // Trim lines (back + front)
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(wrapPx + bleedPx, wrapPx + bleedPx, trimWPx, trimHPx);
    ctx.strokeRect(wrapPx + bleedPx + trimWPx + spinePx, wrapPx + bleedPx, trimWPx, trimHPx);

    // Spine
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
    ctx.strokeRect(wrapPx + bleedPx + trimWPx, wrapPx + bleedPx, spinePx, trimHPx);

    // Safe zones
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.strokeRect(wrapPx + bleedPx + safePx, wrapPx + bleedPx + safePx, trimWPx - 2 * safePx, trimHPx - 2 * safePx);
    ctx.strokeRect(wrapPx + bleedPx + trimWPx + spinePx + safePx, wrapPx + bleedPx + safePx, trimWPx - 2 * safePx, trimHPx - 2 * safePx);

    // Barcode area (paperback only)
    if (bookType === 'paperback') {
      ctx.fillStyle = 'rgba(168,85,247,0.08)';
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = 'rgba(168,85,247,0.4)';
      ctx.lineWidth = 1;
      const barcodeW = inchesToPixels(2, dpi);
      const barcodeH = inchesToPixels(1.2, dpi);
      ctx.fillRect(wrapPx + bleedPx + safePx, wrapPx + bleedPx + trimHPx - safePx - barcodeH, barcodeW, barcodeH);
      ctx.strokeRect(wrapPx + bleedPx + safePx, wrapPx + bleedPx + trimHPx - safePx - barcodeH, barcodeW, barcodeH);
    }

    // Hinge areas (hardcover only)
    if (bookType === 'hardcover') {
      const hingePx = inchesToPixels(m.hingeIn, dpi);
      ctx.strokeStyle = 'rgba(251,191,36,0.4)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.strokeRect(wrapPx + bleedPx, wrapPx + bleedPx, hingePx, trimHPx);
      ctx.strokeRect(wrapPx + bleedPx + trimWPx + spinePx + trimWPx - hingePx, wrapPx + bleedPx, hingePx, trimHPx);
    }

    const link = document.createElement('a');
    link.download = 'kdp-cover-template.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, [measurements, bookType]);

  return (
    <button
      onClick={handleDownload}
      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/[0.04] hover:bg-white/[0.08] rounded-xl text-xs text-white/50 hover:text-white/80 transition-all border border-white/[0.06]"
    >
      <Download className="w-4 h-4" />
      Download Template PNG
    </button>
  );
}

// ─── Main SetupFeature ──────────────────────────────────────────────────

export default function SetupFeature() {
  const [currentStep, setCurrentStep] = useState(1);
  const { bookType } = useAppStore();

  const goToStep = (step: number) => {
    // Steps 2+ require book type to be selected
    if (step > 1 && !bookType) return;
    setCurrentStep(Math.max(1, Math.min(6, step)));
  };

  const handlePrev = () => goToStep(currentStep - 1);
  const handleNext = () => goToStep(currentStep + 1);

  const stepDescriptions: Record<number, string> = {
    1: 'Choose your publishing format',
    2: 'Configure print specifications',
    3: 'Review live measurements & diagram',
    4: 'Prepare your files for upload',
    5: 'Export tips for popular tools',
    6: 'Final review & publish checklist',
  };

  return (
    <div className="min-h-screen">
      {/* Step Indicator */}
      <StepIndicator currentStep={currentStep} onStepClick={goToStep} />

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
        >
          {currentStep === 1 && <StepBookType />}
          {currentStep === 2 && <StepPrintConfig />}
          {currentStep === 3 && <StepKdpSpecs />}
          {currentStep === 4 && <StepFilePrep />}
          {currentStep === 5 && <StepExportTips />}
          {currentStep === 6 && <StepPublishReady />}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <NavButtons
        currentStep={currentStep}
        onPrev={handlePrev}
        onNext={handleNext}
        nextLabel={currentStep === 6 ? 'Finish' : undefined}
      />
    </div>
  );
}
