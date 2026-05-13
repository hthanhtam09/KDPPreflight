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
  Lightbulb, Eye, X,
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
import { StepProgress } from '@/components/workspace/ProductWorkspace';

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

// ─── Educational Concepts Data ────────────────────────────────────────────

const CONCEPTS: Record<string, {
  emoji: string;
  title: string;
  explanation: string;
  whyItMatters: string;
  recommendation?: string;
}> = {
  trimSize: {
    emoji: '📏',
    title: 'What Is Trim Size?',
    explanation: 'Trim size is the final physical size of your printed book after cutting. For example, an 8.5" × 11" book means the final printed pages will measure 8.5 inches wide and 11 inches tall.',
    whyItMatters: 'Your manuscript and cover must match this size exactly. Different trim sizes affect your layout, margins, spine width, and printing cost.',
    recommendation: '6" × 9" is the most popular KDP trim size for novels. 8.5" × 11" is common for workbooks and textbooks.',
  },
  bleed: {
    emoji: '🩸',
    title: 'What Is Bleed?',
    explanation: 'Bleed is extra artwork that extends beyond the final cut edge of the page. After printing, books are trimmed mechanically, and small cutting shifts can happen naturally.',
    whyItMatters: 'Bleed prevents white edges appearing near page borders. If your artwork touches the edge of the page, bleed helps ensure the print still looks clean after trimming.',
    recommendation: 'Enable bleed for coloring books, full-page artwork, or edge-to-edge designs. Usually NOT needed for simple text books or journals with white margins.',
  },
  safeArea: {
    emoji: '🟩',
    title: 'What Is Safe Area?',
    explanation: 'Safe area is the zone where important content should remain. Text or artwork placed too close to the edge may appear cut off after printing.',
    whyItMatters: 'Printing and trimming are never perfectly exact. Keeping content inside the safe area improves readability, print consistency, and professional appearance.',
    recommendation: 'Keep text, page numbers, and important artwork inside the safe area whenever possible.',
  },
  spineWidth: {
    emoji: '📘',
    title: 'What Is Spine Width?',
    explanation: 'The spine is the center section connecting the front and back cover. Its width depends mainly on page count and paper type. More pages = thicker spine.',
    whyItMatters: 'Incorrect spine width can cause misaligned covers, shifted artwork, or rejected cover files.',
    recommendation: 'Very thin books may not support readable spine text. KDP calculates spine width automatically based on your page count and paper choice.',
  },
  dpi: {
    emoji: '🖼',
    title: 'What Is DPI?',
    explanation: 'DPI means "Dots Per Inch." It measures image print quality. Higher DPI = sharper printed images.',
    whyItMatters: 'Low DPI images may appear blurry, look pixelated, or print poorly on paper. KDP recommends 300 DPI for best results.',
    recommendation: 'Always design at 300 DPI from the start. Upscaling a low-resolution image later will not improve quality.',
  },
  gutter: {
    emoji: '📖',
    title: 'What Is Gutter Margin?',
    explanation: 'The gutter is the inner margin near the spine. Books naturally curve inward near the center.',
    whyItMatters: 'Text placed too close to the spine can become hard to read. Thicker books require larger gutter margins.',
    recommendation: 'Increase your gutter margin for books with 150+ pages to keep text readable near the spine.',
  },
  barcode: {
    emoji: '🏷',
    title: 'What Is the Barcode Area?',
    explanation: 'KDP usually places a barcode on the back cover of your book. This area is reserved for the ISBN barcode.',
    whyItMatters: 'Important artwork or text placed here may become covered by the barcode. Keep this zone simple and uncluttered.',
    recommendation: 'Leave the bottom-right 2" × 1.2" area of your back cover free of important content.',
  },
  hinge: {
    emoji: '📚',
    title: 'What Is the Hardcover Hinge Area?',
    explanation: 'Hardcover books include fold/hinge areas near the spine. These areas bend when the book opens.',
    whyItMatters: 'Important artwork crossing the hinge may distort visually when the book is opened. Avoid placing text across the hinge.',
    recommendation: 'Keep text and important design elements away from hinge zones on hardcover covers.',
  },
};

// ─── Educational Components ───────────────────────────────────────────────

function ConceptExplainer({ conceptKey, children }: { conceptKey: string; children?: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const concept = CONCEPTS[conceptKey];
  if (!concept) return null;

  return (
    <div className="mt-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 text-[11px] text-primary/70 hover:text-primary transition-colors"
      >
        <Lightbulb className="w-3 h-3" />
        <span>{concept.emoji} {concept.title}</span>
        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
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
            <div className="bg-primary/[0.06] border border-primary/15 rounded-xl p-3.5 mt-2 space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="text-sm">{concept.emoji}</span>
                <span className="text-xs font-medium text-primary/80">{concept.title}</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{concept.explanation}</p>
              <div className="flex gap-2 items-start bg-primary/[0.04] rounded-lg p-2">
                <ShieldCheck className="w-3.5 h-3.5 text-primary/60 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] font-medium text-primary/50 mb-0.5">Why it matters</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{concept.whyItMatters}</p>
                </div>
              </div>
              {concept.recommendation && (
                <div className="flex gap-2 items-start">
                  <Check className="w-3 h-3 text-success/60 mt-0.5 shrink-0" />
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{concept.recommendation}</p>
                </div>
              )}
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function BleedVisualDiagram() {
  return (
    <div className="flex justify-center mt-2 mb-1">
      <svg width="180" height="130" viewBox="0 0 180 130" className="h-auto w-full max-w-[180px] text-foreground">
        {/* Bleed Zone - outermost */}
        <rect x="10" y="10" width="160" height="110" rx="2" fill="color-mix(in srgb, var(--overlay-bleed) 18%, transparent)" stroke="var(--overlay-bleed)" strokeWidth="1" />
        <text x="90" y="24" textAnchor="middle" className="text-[7px]" fill="var(--overlay-bleed)">BLEED ZONE</text>

        {/* Trim Size - middle */}
        <rect x="25" y="25" width="130" height="80" rx="1" fill="color-mix(in srgb, var(--foreground) 4%, transparent)" stroke="color-mix(in srgb, var(--foreground) 35%, transparent)" strokeWidth="1" />
        <text x="90" y="60" textAnchor="middle" className="text-[8px]" fill="color-mix(in srgb, var(--foreground) 45%, transparent)">TRIM SIZE</text>
        <text x="90" y="72" textAnchor="middle" className="text-[6px]" fill="color-mix(in srgb, var(--foreground) 25%, transparent)">(final cut)</text>

        {/* Safe Area - innermost */}
        <rect x="40" y="35" width="100" height="60" rx="1" fill="color-mix(in srgb, var(--overlay-safe) 10%, transparent)" stroke="var(--overlay-safe)" strokeWidth="0.75" strokeDasharray="3 2" />
        <text x="90" y="68" textAnchor="middle" className="text-[7px]" fill="var(--overlay-safe)">SAFE AREA</text>

        {/* Arrow indicators */}
        <line x1="10" y1="7" x2="25" y2="7" stroke="var(--overlay-bleed)" strokeWidth="0.5" />
        <text x="17" y="5" textAnchor="middle" className="text-[5px]" fill="var(--overlay-bleed)">0.125"</text>
      </svg>
    </div>
  );
}

function WhenToUse({ recommended, notRecommended }: { recommended: string[]; notRecommended: string[] }) {
  return (
    <div className="bg-secondary border border-border rounded-xl p-4 mt-2.5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-[10px] font-medium text-success/60 mb-2">Recommended For</p>
          <div className="space-y-1.5">
            {recommended.map((item) => (
              <div key={item} className="flex items-center gap-1.5">
                <Check className="w-3 h-3 text-success/50 shrink-0" />
                <span className="text-[11px] text-muted-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="text-[10px] font-medium text-danger/60 mb-2">Usually NOT Needed For</p>
          <div className="space-y-1.5">
            {notRecommended.map((item) => (
              <div key={item} className="flex items-center gap-1.5">
                <X className="w-3 h-3 text-danger/40 shrink-0" />
                <span className="text-[11px] text-muted-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function RealKdpNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-warning/[0.06] border border-warning/15 rounded-lg p-2.5 flex gap-2 items-start mt-2">
      <ShieldCheck className="w-3.5 h-3.5 text-warning/70 mt-0.5 shrink-0" />
      <p className="text-[11px] text-muted-foreground leading-relaxed">{children}</p>
    </div>
  );
}

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
                  ? 'bg-success/20 text-success border border-success/30'
                  : isCompleted
                    ? 'bg-secondary text-muted-foreground border border-border hover:bg-secondary'
                    : 'bg-transparent text-muted-foreground border border-transparent hover:bg-secondary'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-success' : ''}`} />
              <span className="hidden sm:inline">{step.label}</span>
              {isCompleted && <Check className="w-3 h-3 text-success ml-0.5" />}
            </button>
            {idx < STEPS.length - 1 && (
              <div className={`w-4 sm:w-6 h-px ${currentStep > step.id ? 'bg-success/30' : 'bg-secondary'}`} />
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
    <div className="mt-8 flex items-center justify-between gap-3 border-t border-border pt-6">
      <button
        onClick={onPrev}
        disabled={currentStep === 1}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
          currentStep === 1
            ? 'text-muted-foreground cursor-not-allowed'
            : 'text-muted-foreground hover:text-foreground bg-secondary hover:bg-secondary border border-border'
        }`}
      >
        <ChevronLeft className="w-4 h-4" />
        Back
      </button>
      <button
        onClick={onNext}
        className="flex items-center justify-center gap-2 rounded-xl border border-success/30 bg-success/20 px-4 py-2.5 text-sm font-medium text-success transition-all duration-200 hover:bg-success/30 hover:text-success sm:px-5"
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
        <h2 className="text-2xl font-bold text-foreground mb-2">Choose Your Book Format</h2>
        <p className="text-sm text-muted-foreground">Select the type of book you want to publish. This determines which specifications apply.</p>
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
                  ? 'bg-success/[0.08] border-2 border-success/40 shadow-lg shadow-success/10'
                  : 'bg-secondary border-2 border-border hover:border-border hover:bg-secondary'
              }`}
            >
              {isActive && (
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-success flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-foreground" />
                </div>
              )}
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${
                isActive ? 'bg-success/20 text-success' : 'bg-secondary text-muted-foreground'
              }`}>
                {icon}
              </div>
              <h3 className={`text-lg font-semibold mb-1 ${isActive ? 'text-success' : 'text-foreground/80'}`}>
                {label}
              </h3>
              <p className="text-xs text-muted-foreground mb-4">{desc}</p>
              <div className="space-y-1.5">
                {features.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <div className={`w-1 h-1 rounded-full ${isActive ? 'bg-success' : 'bg-muted-foreground/30'}`} />
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
          <h2 className="text-2xl font-bold text-foreground mb-2">Kindle Configuration</h2>
          <p className="text-sm text-muted-foreground">Kindle eBooks use reflowable layout — no fixed dimensions required.</p>
        </div>
        <div className="max-w-lg mx-auto space-y-4">
          <ConfigCard icon={<Type className="w-4 h-4 text-success" />} label="Format">
            <div className="flex flex-wrap gap-2">
              {['KFX', 'MOBI', 'EPUB'].map((fmt) => (
                <span key={fmt} className="px-3 py-2 rounded-lg bg-secondary text-xs text-muted-foreground border border-border">{fmt}</span>
              ))}
            </div>
          </ConfigCard>
          <ConfigCard icon={<BookMarked className="w-4 h-4 text-success" />} label="Layout Type">
            <OptionBtn label="Reflowable" active={true} onClick={() => {}} />
            <p className="text-[10px] text-muted-foreground mt-2">Kindle content adapts to screen size. No fixed page dimensions.</p>
          </ConfigCard>
          <ConfigCard icon={<ImageIcon className="w-4 h-4 text-success" />} label="File Requirements">
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
        <h2 className="text-2xl font-bold text-foreground mb-2">Print Configuration</h2>
        <p className="text-sm text-muted-foreground">Set your {isHardcover ? 'hardcover' : 'paperback'} specifications. Measurements update automatically.</p>
      </div>

      <div className="max-w-2xl mx-auto space-y-4">
        {/* Trim Size */}
        <ConfigCard
          icon={<Maximize2 className="w-4 h-4 text-success" />}
          label="Trim Size"
          help="Select a KDP-approved trim size. This determines your book's final printed dimensions and affects spine width."
          education={{
            icon: <Maximize2 className="w-4 h-4 text-primary" />,
            title: CONCEPTS.trimSize.title,
            explanation: CONCEPTS.trimSize.explanation,
            whyItMatters: CONCEPTS.trimSize.whyItMatters,
            recommendation: CONCEPTS.trimSize.recommendation,
            extraContent: (
              <p className="text-[10px] text-muted-foreground">
                Your chosen trim size means your final book will be {formatInches(measurements.trimWidthIn)} × {formatInches(measurements.trimHeightIn)} after printing.
              </p>
            ),
          }}
        >
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
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
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-[10px] text-muted-foreground mb-1 block">Width (inches)</label>
                <input
                  type="number"
                  value={customWidth}
                  onChange={(e) => { setCustomWidth(e.target.value); updateBookConfig({ customWidth: parseFloat(e.target.value) || 0 }); }}
                  step="0.01"
                  min="5"
                  max="8.5"
                  className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-xs text-foreground/80 focus:outline-none focus:border-success/40"
                  placeholder="6.0"
                />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground mb-1 block">Height (inches)</label>
                <input
                  type="number"
                  value={customHeight}
                  onChange={(e) => { setCustomHeight(e.target.value); updateBookConfig({ customHeight: parseFloat(e.target.value) || 0 }); }}
                  step="0.01"
                  min="5"
                  max="11"
                  className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-xs text-foreground/80 focus:outline-none focus:border-success/40"
                  placeholder="9.0"
                />
              </div>
            </div>
          )}
        </ConfigCard>

        {/* Bleed */}
        <ConfigCard
          icon={<ScanLine className="w-4 h-4 text-success" />}
          label="Bleed"
          help={bookConfig.bleed === 'bleed' ? 'Adds 0.125" on each side for artwork extending to edges.' : 'White border around content. Choose if artwork stays within trim boundaries.'}
          education={{
            icon: <ScanLine className="w-4 h-4 text-primary" />,
            title: CONCEPTS.bleed.title,
            explanation: CONCEPTS.bleed.explanation,
            whyItMatters: CONCEPTS.bleed.whyItMatters,
            recommendation: CONCEPTS.bleed.recommendation,
            extraContent: (
              <>
                <BleedVisualDiagram />
                <WhenToUse
                  recommended={['Coloring books', 'Comic books', 'Full-page artwork', 'Photography books']}
                  notRecommended={['Novels', 'Simple journals', 'Minimal text interiors']}
                />
              </>
            ),
          }}
        >
          <div className="flex flex-wrap gap-2">
            <OptionBtn label="No Bleed" active={bookConfig.bleed === 'no-bleed'} onClick={() => updateBookConfig({ bleed: 'no-bleed' })} />
            <OptionBtn label="With Bleed" active={bookConfig.bleed === 'bleed'} onClick={() => updateBookConfig({ bleed: 'bleed' })} />
          </div>
        </ConfigCard>

        {/* Paper Type */}
        <ConfigCard icon={<Layers className="w-4 h-4 text-success" />} label="Paper Type" help="Paper type affects spine width. Cream and premium paper are thicker, resulting in a wider spine.">
          <div className="flex flex-wrap gap-2">
            {(['white', 'cream', 'premium-color'] as PaperType[]).map((paper) => (
              <OptionBtn
                key={paper}
                label={paper === 'premium-color' ? 'Premium' : paper.charAt(0).toUpperCase() + paper.slice(1)}
                active={bookConfig.paper === paper}
                onClick={() => updateBookConfig({ paper })}
              />
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">White paper is thinnest (0.002252&quot;/page), cream is thicker (0.0025&quot;/page), premium is also 0.0025&quot;/page.</p>
        </ConfigCard>

        {/* Interior Type */}
        <ConfigCard icon={<Palette className="w-4 h-4 text-success" />} label="Interior Type" help="Interior type determines printing method. B&W is most cost-effective.">
          <div className="flex flex-wrap gap-2">
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
        <ConfigCard icon={<FileText className="w-4 h-4 text-success" />} label="Page Count" help={`Spine width is calculated from page count × paper thickness. Range: ${MIN_PAGE_COUNT}–${maxPages} pages.`} accent>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => handlePageCountChange(String(bookConfig.pageCount - 2))}
              className="w-9 h-9 rounded-lg bg-secondary hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground/80 transition-colors"
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
              className="flex-1 bg-secondary border border-border rounded-lg px-3 py-2.5 text-center text-sm font-mono text-foreground/80 focus:outline-none focus:border-success/40"
            />
            <button
              onClick={() => handlePageCountChange(String(bookConfig.pageCount + 2))}
              className="w-9 h-9 rounded-lg bg-secondary hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground/80 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">
            Spine: {formatInches(measurements.spineWidthIn)} • Must be even • Range: {MIN_PAGE_COUNT}–{maxPages}
          </p>
          <RealKdpNote>
            KDP requires even page numbers. Your spine width will be {formatInches(measurements.spineWidthIn)} based on {bookConfig.pageCount} pages of {bookConfig.paper} paper.
          </RealKdpNote>
        </ConfigCard>

        {/* Spine Width Concept Explainer */}
        <ConceptExplainer conceptKey="spineWidth" />

        {/* Reading Direction + Cover Finish */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ConfigCard icon={<ArrowLeft className="w-4 h-4 text-success" />} label="Reading Direction">
            <div className="flex flex-wrap gap-2">
              <OptionBtn label="LTR" active={bookConfig.readingDirection !== 'rtl'} onClick={() => updateBookConfig({ readingDirection: 'ltr' })} />
              <OptionBtn label="RTL" active={bookConfig.readingDirection === 'rtl'} onClick={() => updateBookConfig({ readingDirection: 'rtl' })} />
            </div>
          </ConfigCard>
          <ConfigCard icon={<Sparkles className="w-4 h-4 text-success" />} label="Cover Finish">
            <div className="flex flex-wrap gap-2">
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
          <h2 className="text-2xl font-bold text-foreground mb-2">Kindle Specifications</h2>
          <p className="text-sm text-muted-foreground">Digital format specifications for your Kindle eBook.</p>
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
        <h2 className="text-2xl font-bold text-foreground mb-2">Live KDP Specifications</h2>
        <p className="text-sm text-muted-foreground">All measurements update in real-time as you change your configuration.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 max-w-5xl mx-auto">
        {/* Specs Panel */}
        <div className="min-w-0 space-y-3 lg:w-[380px] lg:shrink-0">
          <SpecCard
            emoji="📘"
            label="Manuscript Size"
            value={`${formatInches(manuscriptWidth)} × ${formatInches(manuscriptHeight)}`}
            sub={m.bleedIn > 0 ? `Trim + ${formatInches(m.bleedIn)} bleed per edge` : 'Trim size (no bleed)'}
            copyText={manuscriptWidth.toFixed(3) + '\u2033 \u00D7 ' + manuscriptHeight.toFixed(3) + '\u2033'}
          />
          <SpecCard
            emoji="📕"
            label="Cover Size"
            value={`${formatInches(m.fullCoverWidthIn)} × ${formatInches(m.fullCoverHeightIn)}`}
            sub={`${inchesToPixels(m.fullCoverWidthIn)} × ${inchesToPixels(m.fullCoverHeightIn)} px @ 300 DPI`}
            copyText={m.fullCoverWidthIn.toFixed(3) + '\u2033 \u00D7 ' + m.fullCoverHeightIn.toFixed(3) + '\u2033'}
          />
          <SpecCard
            emoji="📗"
            label="Spine Width"
            value={formatInches(m.spineWidthIn)}
            sub={`${inchesToMm(m.spineWidthIn).toFixed(2)} mm`}
            highlight
            copyText={formatInches(m.spineWidthIn)}
            conceptId="spineWidth"
          />
          <SpecCard
            emoji="📙"
            label="Safe Area"
            value={`${formatInches(m.safeAreaIn)} from each edge`}
            sub="Keep text and important content inside"
            conceptId="safeArea"
          />
          <SpecCard
            emoji="📒"
            label="Bleed Area"
            value={m.bleedIn > 0 ? `${formatInches(m.bleedIn)} per edge` : 'Disabled'}
            sub={m.bleedIn > 0 ? 'Artwork extends to this area' : 'No bleed selected'}
            conceptId="bleed"
          />
          {isHardcover && (
            <>
              <SpecCard
                emoji="🔶"
                label="Hinge"
                value={formatInches(m.hingeIn)}
                sub="Required folding area for hardcover"
                conceptId="hinge"
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
              conceptId="barcode"
            />
          )}

          {/* Real KDP Note */}
          <RealKdpNote>
            KDP often accepts small bleed variances, but using exact dimensions improves print reliability.
          </RealKdpNote>

          {/* Download Template */}
          <DownloadTemplateButton />
        </div>

        {/* SVG Diagram */}
        <div className="flex min-w-0 flex-1 items-start justify-center">
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
          <h2 className="text-2xl font-bold text-foreground mb-2">Kindle File Preparation</h2>
          <p className="text-sm text-muted-foreground">Guidelines for preparing your Kindle eBook files.</p>
        </div>
        <div className="max-w-2xl mx-auto space-y-4">
          <PrepCard title="Kindle Format Requirements" icon={<Monitor className="w-5 h-5 text-success" />}>
            <div className="space-y-3">
              <PrepRow label="Supported Formats" value="KFX / MOBI / EPUB" />
              <PrepRow label="Layout" value="Reflowable (adapts to screen)" />
              <PrepRow label="Max File Size" value="650 MB" />
              <PrepRow label="Embed Fonts" value="Recommended for consistency" />
              <PrepRow label="Table of Contents" value="Required (NCX + HTML)" />
              <PrepRow label="Images" value="JPEG / GIF / PNG / SVG" />
            </div>
          </PrepCard>
          <PrepCard title="Common Kindle Pitfalls" icon={<AlertTriangle className="w-5 h-5 text-warning" />}>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex gap-2"><span className="text-warning shrink-0">•</span> Missing TOC — KDP requires functional navigation</li>
              <li className="flex gap-2"><span className="text-warning shrink-0">•</span> Non-embedded fonts — Kindle substitutes fonts if not embedded</li>
              <li className="flex gap-2"><span className="text-warning shrink-0">•</span> Fixed-layout used when reflowable is better — limits device compatibility</li>
              <li className="flex gap-2"><span className="text-warning shrink-0">•</span> Large images not optimized — increases file size unnecessarily</li>
            </ul>
          </PrepCard>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">File Preparation Guide</h2>
        <p className="text-sm text-muted-foreground">Everything you need to know to prepare print-ready files for KDP.</p>
      </div>

      <div className="max-w-2xl mx-auto space-y-4">
        {/* DPI Concept Explainer */}
        <ConceptExplainer conceptKey="dpi" />

        {/* Manuscript Export */}
        <PrepCard title="Manuscript Export Size" icon={<FileText className="w-5 h-5 text-success" />}>
          <div className="space-y-3">
            <PrepRow label="Trim Size" value={`${formatInches(m.trimWidthIn)} × ${formatInches(m.trimHeightIn)}`} />
            <PrepRow label="Bleed" value={m.bleedIn > 0 ? `Enabled (+${formatInches(m.bleedIn)} per edge)` : 'Disabled'} />
            <PrepRow
              label="Recommended Export Size"
              value={`${formatInches(manuscriptWidth)} × ${formatInches(manuscriptHeight)}`}
              highlight
            />
            <PrepRow label="KDP Safe Area" value={`Keep content inside ${formatInches(safeW)} × ${formatInches(safeH)}`} />

            {/* Gutter Concept Explainer */}
            <ConceptExplainer conceptKey="gutter" />

            <PrepRow label="Recommended DPI" value="300" />
          </div>
        </PrepCard>

        {/* Cover Export */}
        <PrepCard title="Cover Export Requirements" icon={<BookOpen className="w-5 h-5 text-success" />}>
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
        <PrepCard title="Pixel Dimensions at 300 DPI" icon={<Ruler className="w-5 h-5 text-success" />}>
          <div className="space-y-3">
            <PrepRow label="Manuscript" value={`${inchesToPixels(manuscriptWidth)} × ${inchesToPixels(manuscriptHeight)} px`} />
            <PrepRow label="Full Cover" value={`${inchesToPixels(m.fullCoverWidthIn)} × ${inchesToPixels(m.fullCoverHeightIn)} px`} />
            <PrepRow label="Spine" value={`${inchesToPixels(m.spineWidthIn)} px`} />
          </div>
        </PrepCard>

        {/* Real KDP Note */}
        <RealKdpNote>
          Many Canva exports accidentally remove bleed during PDF export. Always verify your final PDF dimensions match the KDP requirements.
        </RealKdpNote>
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
      kdpNote: 'Canva\'s PDF Standard export strips bleed. Always use PDF Print format for KDP covers.',
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
      kdpNote: 'Photoshop\'s \'Save As PDF\' may not embed fonts correctly. Use \'Export As\' → PDF instead.',
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
      kdpNote: 'Affinity Designer has excellent PDF/X export. Use PDF/X-1a:2001 for maximum KDP compatibility.',
    },
  ];

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Export Recommendations</h2>
        <p className="text-sm text-muted-foreground">Practical tips for exporting your files from popular design tools.</p>
      </div>

      <div className="max-w-2xl mx-auto space-y-3">
        {tips.map((tip) => {
          const isOpen = expanded.has(tip.id);
          return (
            <div key={tip.id} className="bg-secondary border border-border rounded-xl overflow-hidden">
              <button
                onClick={() => toggle(tip.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-secondary transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{tip.icon}</span>
                  <span className="text-sm font-medium text-foreground/80">{tip.title}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
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
                          <Check className="w-3.5 h-3.5 text-success mt-0.5 shrink-0" />
                          <p className="text-xs text-muted-foreground leading-relaxed">{item}</p>
                        </div>
                      ))}
                      {tip.kdpNote && (
                        <RealKdpNote>{tip.kdpNote}</RealKdpNote>
                      )}
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

  // KDP behavior notes — expanded with more entries
  const kdpNotes = [
    { label: 'Bleed', note: 'KDP often accepts small bleed variances, but using exact dimensions improves print reliability.' },
    { label: 'DPI', note: 'Images below 300 DPI may still upload, but printed quality can appear soft or blurry.' },
    { label: 'Safe Area', note: 'Text placed too close to trim edges may appear inconsistent after printing.' },
    { label: 'Spine', note: 'Spine width varies by paper type. Always recalculate when changing paper.' },
    { label: 'Page Count', note: 'KDP requires even page numbers. Minimum 24 pages for paperback.' },
    { label: 'Gutter', note: 'Thicker books need wider gutters. If text disappears into the spine, increase your gutter margin.' },
    { label: 'Cover', note: 'KDP may reject covers with incorrect dimensions. Always verify your cover template matches your book specs.' },
    { label: 'Barcode', note: 'KDP adds a barcode automatically. Don\'t include your own barcode on the cover.' },
    { label: 'Canva', note: 'Many Canva exports accidentally remove bleed. Always check your exported PDF dimensions.' },
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
        <h2 className="text-2xl font-bold text-foreground mb-2">Publishing Tips & Ready for Design</h2>
        <p className="text-sm text-muted-foreground">Important KDP notes and your complete setup summary.</p>
      </div>

      <div className="max-w-2xl mx-auto space-y-5">
        {/* Smart Warnings */}
        {warnings.length > 0 && (
          <div className="bg-warning/[0.08] border border-warning/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-warning" />
              <span className="text-sm font-medium text-warning">Smart Warnings</span>
            </div>
            <div className="space-y-2">
              {warnings.map((w, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-warning mt-1.5 shrink-0" />
                  <p className="text-xs text-muted-foreground">{w}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* When Should I Use Bleed? — only for print types */}
        {!isKindle && (
          <div className="bg-secondary border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Eye className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground/70">When Should I Use Bleed?</span>
            </div>
            <WhenToUse
              recommended={['Coloring books', 'Comic books', 'Full-page artwork', 'Photography books']}
              notRecommended={['Novels', 'Simple journals', 'Minimal text interiors', 'Workbooks with white margins']}
            />
          </div>
        )}

        {/* KDP Behavior Notes */}
        <div className="bg-secondary border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="w-4 h-4 text-success" />
            <span className="text-sm font-medium text-foreground/70">Real KDP Behavior Notes</span>
          </div>
          <div className="space-y-3">
            {kdpNotes.map((n) => (
              <div key={n.label} className="flex gap-3 items-start">
                <span className="w-[60px] shrink-0 pt-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{n.label}</span>
                <p className="text-xs text-muted-foreground leading-relaxed">{n.note}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Ready for Design Summary */}
        <div className="bg-success/[0.06] border border-success/20 rounded-xl p-4 sm:p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-success" />
              <span className="text-sm font-semibold text-success">Your Book Setup</span>
            </div>
            <button
              onClick={() => copyToClipboard(summaryText)}
              className="flex items-center justify-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-[11px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground/80"
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

        {/* Educational Footer */}
        <div className="text-center py-3">
          <p className="text-[11px] text-muted-foreground">You&apos;re ready to design! If you ever need to review these concepts, come back to Smart Setup anytime.</p>
        </div>
      </div>
    </div>
  );
}

// ─── Shared Sub-Components ────────────────────────────────────────────────

function ConfigCard({ icon, label, help, children, accent, education }: {
  icon: React.ReactNode;
  label: string;
  help?: string;
  children: React.ReactNode;
  accent?: boolean;
  education?: {
    icon: React.ReactNode;
    title: string;
    explanation: string;
    whyItMatters: string;
    recommendation?: string;
    extraContent?: React.ReactNode;
  };
}) {
  const [showHelp, setShowHelp] = useState(false);
  const [showEducation, setShowEducation] = useState(false);

  return (
    <div className={`rounded-xl border transition-all duration-300 ${
      accent ? 'bg-success/[0.06] border-success/20' : 'bg-secondary border-border'
    }`}>
      <div className="p-4">
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${accent ? 'bg-success/20' : 'bg-secondary'}`}>
              {icon}
            </div>
            <span className="text-sm font-medium text-foreground/80">{label}</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {education && (
              <button
                onClick={() => setShowEducation(!showEducation)}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] text-primary/60 transition-colors hover:bg-primary/[0.06] hover:text-primary"
                title="Learn more"
              >
                <BookOpen className="w-3 h-3" />
                <span>Learn more</span>
              </button>
            )}
            {help && (
              <button
                onClick={() => setShowHelp(!showHelp)}
                className="w-5 h-5 rounded-full flex items-center justify-center text-muted-foreground hover:text-muted-foreground hover:bg-secondary transition-colors"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
        {children}
        {help && showHelp && (
          <div className="mt-3 flex gap-2 items-start bg-secondary rounded-lg p-2.5">
            <ShieldCheck className="w-3.5 h-3.5 text-success mt-0.5 shrink-0" />
            <p className="text-[11px] text-muted-foreground leading-relaxed">{help}</p>
          </div>
        )}
        {/* Education Section */}
        <AnimatePresence>
          {education && showEducation && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-3 bg-primary/[0.06] border border-primary/15 rounded-xl p-3.5 space-y-2.5">
                <div className="flex items-center gap-2">
                  {education.icon}
                  <span className="text-xs font-medium text-primary/80">{education.title}</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{education.explanation}</p>
                <div className="flex gap-2 items-start bg-primary/[0.04] rounded-lg p-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary/60 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] font-medium text-primary/50 mb-0.5">Why it matters</p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{education.whyItMatters}</p>
                  </div>
                </div>
                {education.recommendation && (
                  <div className="flex gap-2 items-start">
                    <Check className="w-3 h-3 text-success/60 mt-0.5 shrink-0" />
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{education.recommendation}</p>
                  </div>
                )}
                {education.extraContent}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {help && !showHelp && !showEducation && (
        <div className="px-4 pb-3">
          <p className="text-[10px] text-muted-foreground truncate">{help}</p>
        </div>
      )}
    </div>
  );
}

function OptionBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`min-w-0 flex-1 rounded-lg px-2.5 py-2 text-xs font-medium leading-tight transition-all duration-200 sm:flex-none sm:px-3 ${
        active
          ? 'bg-success/20 text-success border border-success/30 shadow-sm shadow-success/10'
          : 'bg-secondary text-muted-foreground border border-transparent hover:bg-secondary hover:text-muted-foreground'
      }`}
    >
      {active && <Check className="w-3 h-3 inline mr-1 -mt-0.5" />}
      {label}
    </button>
  );
}

function SpecCard({ emoji, label, value, sub, highlight, copyText, conceptId }: {
  emoji: string;
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
  copyText?: string;
  conceptId?: string;
}) {
  const [showConcept, setShowConcept] = useState(false);
  const concept = conceptId ? CONCEPTS[conceptId] : null;

  return (
    <div>
      <div className={`flex flex-col gap-3 rounded-xl p-3 transition-all duration-200 sm:flex-row sm:items-center sm:justify-between ${
        highlight ? 'bg-success/[0.08] border border-success/20' : 'bg-secondary border border-border'
      }`}>
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <span className="text-base shrink-0">{emoji}</span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-xs text-muted-foreground">{label}</p>
              {concept && (
                <button
                  onClick={() => setShowConcept(!showConcept)}
                  className="w-4 h-4 rounded-full flex items-center justify-center text-primary/50 hover:text-primary hover:bg-primary/[0.08] transition-colors"
                  title={`Learn about ${concept.title}`}
                >
                  <Info className="w-3 h-3" />
                </button>
              )}
            </div>
            {sub && <p className="text-[10px] text-muted-foreground truncate">{sub}</p>}
          </div>
        </div>
        <div className="flex min-w-0 items-center gap-2 sm:ml-3 sm:shrink-0">
          <p className={`min-w-0 break-words font-mono text-sm font-medium ${highlight ? 'text-success' : 'text-foreground/80'}`}>
            {value}
          </p>
          {copyText && (
            <button
              onClick={() => copyToClipboard(copyText)}
              className="w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-muted-foreground hover:bg-secondary transition-colors"
              title="Copy"
            >
              <Copy className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
      {/* Inline Concept Explainer */}
      <AnimatePresence>
        {concept && showConcept && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="bg-primary/[0.06] border border-primary/15 rounded-xl p-3.5 mt-1.5 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm">{concept.emoji}</span>
                <span className="text-xs font-medium text-primary/80">{concept.title}</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{concept.explanation}</p>
              <div className="flex gap-2 items-start bg-primary/[0.04] rounded-lg p-2">
                <ShieldCheck className="w-3.5 h-3.5 text-primary/60 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] font-medium text-primary/50 mb-0.5">Why it matters</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{concept.whyItMatters}</p>
                </div>
              </div>
              {concept.recommendation && (
                <div className="flex gap-2 items-start">
                  <Check className="w-3 h-3 text-success/60 mt-0.5 shrink-0" />
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{concept.recommendation}</p>
                </div>
              )}
              {/* Safe Area inline diagram */}
              {conceptId === 'safeArea' && (
                <BleedVisualDiagram />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg bg-secondary p-2 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="break-words text-xs text-foreground/70 sm:text-right">{value}</span>
    </div>
  );
}

function PrepCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-secondary p-4 sm:p-5">
      <div className="flex items-center gap-2.5 mb-4">
        {icon}
        <h3 className="text-sm font-semibold text-foreground/80">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function PrepRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`flex flex-col gap-1 rounded-lg p-2.5 sm:flex-row sm:items-center sm:justify-between ${highlight ? 'bg-success/[0.06] border border-success/15' : 'bg-secondary'}`}>
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`break-words font-mono text-xs sm:text-right ${highlight ? 'text-success font-medium' : 'text-foreground/70'}`}>{value}</span>
    </div>
  );
}

function SummaryRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex flex-col gap-1 py-1.5 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`break-words font-mono text-sm sm:text-right ${highlight ? 'text-success font-medium' : 'text-foreground/70'}`}>{value}</span>
    </div>
  );
}

// ─── Kindle Visualization ────────────────────────────────────────────────

function KindleVisualization() {
  return (
    <div className="flex flex-col items-center justify-center mt-6">
      <svg width="240" height="320" viewBox="0 0 240 320" className="h-auto w-full max-w-[240px] text-foreground">
        <rect x="16" y="8" width="208" height="304" rx="14" ry="14" fill="color-mix(in srgb, var(--foreground) 3%, transparent)" stroke="color-mix(in srgb, var(--foreground) 12%, transparent)" strokeWidth="1.5" />
        <rect x="30" y="30" width="180" height="246" rx="2" ry="2" fill="color-mix(in srgb, var(--foreground) 2%, transparent)" stroke="color-mix(in srgb, var(--foreground) 6%, transparent)" strokeWidth="0.5" />
        <text x="120" y="44" textAnchor="middle" className="text-[8px]" fill="color-mix(in srgb, var(--foreground) 30%, transparent)">Chapter Title</text>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
          <rect key={i} x="42" y={58 + i * 20} width={i % 3 === 1 ? 120 : i % 3 === 2 ? 150 : 162} height="3.5" rx="1.5" fill="rgba(255,255,255,0.05)" />
        ))}
        <text x="120" y="296" textAnchor="middle" className="text-[7px]" fill="rgba(255,255,255,0.2)">Loc 1234 · 15%</text>
        <circle cx="120" cy="286" r="2.5" fill="color-mix(in srgb, var(--foreground) 8%, transparent)" />
      </svg>
      <div className="flex gap-4 mt-3">
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <Monitor className="w-3 h-3" /> Reflowable
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
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

  const spineH = trimH;

  return (
    <div className="flex w-full min-w-0 flex-col items-center">
      <h3 className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
        {isHardcover ? 'Hardcover' : 'Paperback'} Cover Layout
      </h3>
      <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} className="h-auto w-full max-w-[500px] text-foreground">
        {/* Full Cover Outline — Black/dashed */}
        <rect x={x0} y={y0} width={coverW} height={coverH} fill="none" stroke="color-mix(in srgb, var(--foreground) 12%, transparent)" strokeWidth="1" strokeDasharray="4 3" style={{ transition: 'all 0.4s ease' }} />

        {/* Wrap Area — Amber (hardcover) */}
        {isHardcover && (
          <>
            <rect x={x0} y={y0} width={coverW} height={coverH} fill="color-mix(in srgb, var(--overlay-gutter) 8%, transparent)" stroke="none" style={{ transition: 'all 0.4s ease' }} />
            <rect x={wrapL} y={wrapT} width={wrapR - wrapL} height={wrapB - wrapT} fill="none" stroke="color-mix(in srgb, var(--overlay-gutter) 38%, transparent)" strokeWidth="0.5" strokeDasharray="3 2" style={{ transition: 'all 0.4s ease' }} />
          </>
        )}

        {/* Bleed Area — Red */}
        {bleed > 0 && (
          <rect x={wrapL} y={wrapT} width={wrapR - wrapL} height={wrapB - wrapT} fill="color-mix(in srgb, var(--overlay-bleed) 10%, transparent)" stroke="rgba(239,68,68,0.25)" strokeWidth="0.5" style={{ transition: 'all 0.4s ease' }} />
        )}

        {/* Back Cover — Black solid border (trim line) */}
        <rect x={backX} y={backY} width={backW} height={backH} fill="color-mix(in srgb, var(--foreground) 3%, transparent)" stroke="color-mix(in srgb, var(--foreground) 18%, transparent)" strokeWidth="1" style={{ transition: 'all 0.4s ease' }} />

        {/* Front Cover — Black solid border (trim line) */}
        <rect x={frontX} y={frontY} width={frontW} height={frontH} fill="color-mix(in srgb, var(--foreground) 6%, transparent)" stroke="color-mix(in srgb, var(--foreground) 25%, transparent)" strokeWidth="1" style={{ transition: 'all 0.4s ease' }} />

        {/* Spine — Green */}
        <rect x={spineX} y={spineY} width={Math.max(spine, 1)} height={trimH} fill="color-mix(in srgb, var(--overlay-safe) 18%, transparent)" stroke="var(--overlay-safe)" strokeWidth="0.5" style={{ transition: 'all 0.4s ease' }} />

        {/* Hinge Areas — Amber dashed (hardcover only) */}
        {isHardcover && hinge > 0 && (
          <>
            <rect x={hingeLeftX} y={bleedT} width={hinge} height={trimH} fill="color-mix(in srgb, var(--overlay-gutter) 12%, transparent)" stroke="var(--overlay-gutter)" strokeWidth="0.5" strokeDasharray="2 2" style={{ transition: 'all 0.4s ease' }} />
            <rect x={hingeRightX} y={bleedT} width={hinge} height={trimH} fill="color-mix(in srgb, var(--overlay-gutter) 12%, transparent)" stroke="var(--overlay-gutter)" strokeWidth="0.5" strokeDasharray="2 2" style={{ transition: 'all 0.4s ease' }} />
          </>
        )}

        {/* Safe Zones — Blue dashed */}
        <rect x={backX + safe} y={backY + safe} width={Math.max(backW - 2 * safe, 1)} height={Math.max(backH - 2 * safe, 1)} fill="none" stroke="var(--overlay-trim)" strokeWidth="0.5" strokeDasharray="2 2" style={{ transition: 'all 0.4s ease' }} />
        <rect x={frontX + safe} y={frontY + safe} width={Math.max(frontW - 2 * safe, 1)} height={Math.max(frontH - 2 * safe, 1)} fill="none" stroke="var(--overlay-trim)" strokeWidth="0.5" strokeDasharray="2 2" style={{ transition: 'all 0.4s ease' }} />

        {/* Barcode Area — Purple dashed (paperback only) */}
        {!isHardcover && (
          <rect x={barcodeX} y={barcodeY} width={barcodeW} height={barcodeH} fill="color-mix(in srgb, var(--overlay-margin) 12%, transparent)" stroke="var(--overlay-margin)" strokeWidth="0.5" strokeDasharray="2 2" style={{ transition: 'all 0.4s ease' }} />
        )}

        {/* Labels */}
        <text x={frontX + frontW / 2} y={frontY + frontH / 2 - 6} textAnchor="middle" className="text-[9px]" fill="color-mix(in srgb, var(--foreground) 50%, transparent)">Front Cover</text>
        <text x={frontX + frontW / 2} y={frontY + frontH / 2 + 8} textAnchor="middle" className="text-[8px]" fill="color-mix(in srgb, var(--foreground) 25%, transparent)">{formatInches(m.trimWidthIn)} × {formatInches(m.trimHeightIn)}</text>
        <text x={backX + backW / 2} y={backY + backH / 2} textAnchor="middle" className="text-[9px]" fill="color-mix(in srgb, var(--foreground) 35%, transparent)">Back Cover</text>

        {spine > 12 && (
          <text x={spineX + spine / 2} y={spineY + spineH / 2} textAnchor="middle" className="text-[7px]" fill="var(--overlay-safe)" transform={`rotate(-90, ${spineX + spine / 2}, ${spineY + spineH / 2})`}>Spine {formatInches(m.spineWidthIn)}</text>
        )}

        {isHardcover && hinge > 8 && (
          <>
            <text x={hingeLeftX + hinge / 2} y={bleedT + trimH / 2} textAnchor="middle" className="text-[6px]" fill="var(--overlay-gutter)" transform={`rotate(-90, ${hingeLeftX + hinge / 2}, ${bleedT + trimH / 2})`}>Hinge</text>
            <text x={hingeRightX + hinge / 2} y={bleedT + trimH / 2} textAnchor="middle" className="text-[6px]" fill="var(--overlay-gutter)" transform={`rotate(-90, ${hingeRightX + hinge / 2}, ${bleedT + trimH / 2})`}>Hinge</text>
          </>
        )}

        {!isHardcover && (
          <text x={barcodeX + barcodeW / 2} y={barcodeY + barcodeH / 2} textAnchor="middle" className="text-[6px]" fill="var(--overlay-margin)">Barcode</text>
        )}

        {/* Dimension lines */}
        <line x1={x0} y1={y0 + coverH + 14} x2={x0 + coverW} y2={y0 + coverH + 14} stroke="color-mix(in srgb, var(--foreground) 15%, transparent)" strokeWidth="0.5" />
        <text x={x0 + coverW / 2} y={y0 + coverH + 25} textAnchor="middle" className="text-[8px]" fill="color-mix(in srgb, var(--foreground) 30%, transparent)">{formatInches(m.fullCoverWidthIn)}</text>
        <line x1={x0 + coverW + 14} y1={y0} x2={x0 + coverW + 14} y2={y0 + coverH} stroke="color-mix(in srgb, var(--foreground) 15%, transparent)" strokeWidth="0.5" />
        <text x={x0 + coverW + 22} y={y0 + coverH / 2} textAnchor="middle" className="text-[8px]" fill="color-mix(in srgb, var(--foreground) 30%, transparent)" transform={`rotate(90, ${x0 + coverW + 22}, ${y0 + coverH / 2})`}>{formatInches(m.fullCoverHeightIn)}</text>
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 justify-center mt-3">
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground"><div className="w-3 h-0.5 border border-dashed border-border" /> Trim Line</div>
        {bleed > 0 && <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground"><div className="w-3 h-0.5 bg-danger/30" /> Bleed</div>}
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground"><div className="w-3 h-0.5 bg-success/40" /> Spine</div>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground"><div className="w-3 h-0.5 border border-dashed border-primary/30" /> Safe Area</div>
        {!isHardcover && <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground"><div className="w-3 h-0.5 border border-dashed border-primary/30" /> Barcode</div>}
        {isHardcover && <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground"><div className="w-3 h-0.5 border border-dashed border-warning/30" /> Hinge/Wrap</div>}
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
      ctx.strokeStyle = 'var(--overlay-gutter)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(wrapPx, wrapPx, canvas.width - 2 * wrapPx, canvas.height - 2 * wrapPx);
    }

    // Bleed area
    if (m.bleedIn > 0) {
      ctx.strokeStyle = 'var(--overlay-bleed)';
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
      ctx.fillStyle = 'color-mix(in srgb, var(--overlay-margin) 14%, transparent)';
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = 'var(--overlay-margin)';
      ctx.lineWidth = 1;
      const barcodeW = inchesToPixels(2, dpi);
      const barcodeH = inchesToPixels(1.2, dpi);
      ctx.fillRect(wrapPx + bleedPx + safePx, wrapPx + bleedPx + trimHPx - safePx - barcodeH, barcodeW, barcodeH);
      ctx.strokeRect(wrapPx + bleedPx + safePx, wrapPx + bleedPx + trimHPx - safePx - barcodeH, barcodeW, barcodeH);
    }

    // Hinge areas (hardcover only)
    if (bookType === 'hardcover') {
      const hingePx = inchesToPixels(m.hingeIn, dpi);
      ctx.strokeStyle = 'var(--overlay-gutter)';
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
      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-secondary hover:bg-secondary rounded-xl text-xs text-muted-foreground hover:text-foreground/80 transition-all border border-border"
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

  return (
    <div className="min-h-full text-foreground">
      {/* Step Indicator */}
      <StepProgress
        steps={STEPS.map((step) => ({ key: step.id, label: step.label }))}
        current={currentStep}
        onStepClick={(step) => goToStep(Number(step.key))}
      />
      <div className="ds-card-glass my-4 flex items-center justify-between gap-4 px-4 py-3 max-md:flex-col max-md:items-start">
        <strong className="text-sm font-semibold text-foreground/90">Smart planning workspace</strong>
        <span className="flex-1 text-[13px] leading-normal text-muted-foreground">Live KDP specs update as you choose trim, bleed, paper, and page count.</span>
      </div>

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
