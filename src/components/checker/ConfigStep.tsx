'use client';

import React, { useMemo, useState, useCallback } from 'react';
import {
  Ruler, BookOpen, ArrowLeft, ArrowRight, Layers, Type,
  Image as ImageIcon, ScanLine, BookMarked, ShieldCheck, FileText,
  ChevronDown, ChevronUp, Info, Minus, Plus, Lock,
  Maximize2, Box, Monitor, Palette, Grid3x3,
  Move, RotateCcw, Check
} from 'lucide-react';
import { useAppStore } from '@/store/use-app-store';
import {
  TRIM_SIZES, BLEED_SIZE_IN, formatInches, inchesToMm, inchesToPixels,
  HARDCOVER_HINGE_IN, HARDCOVER_WRAP_IN, GUTTER_IN,
  SAFE_AREA_IN, BARCODE_AREA,
} from '@/engine/kdp-constants';
import {
  TrimSizeKey, BleedType, PaperType, InteriorType, BookType as BookTypeEnum,
  BookConfig,
} from '@/types/kdp';

// ─── Helpers ────────────────────────────────────────────────────────────────

const PAPERBACK_TRIM_KEYS: TrimSizeKey[] = [
  '5x8', '5.25x8', '5.5x8.5', '6x9', '7x10', '7.44x9.69',
  '8x10', '8.25x6', '8.25x8.25', '8.5x8.5', '8.5x11',
];

const HARDCOVER_TRIM_KEYS: TrimSizeKey[] = [
  '5.5x8.5', '6x9', '7x10', '8.25x8.25', '8.5x11',
];

// ─── Config Card Wrapper ────────────────────────────────────────────────────

interface ConfigCardProps {
  icon: React.ReactNode;
  label: string;
  helpText?: string;
  children: React.ReactNode;
  accent?: boolean;
}

function ConfigCard({ icon, label, helpText, children, accent }: ConfigCardProps) {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div
      className={`group rounded-xl border transition-all duration-300 ${
        accent
          ? 'bg-success/[0.06] border-success/20'
          : 'bg-foreground/[0.16] dark:bg-foreground/[0.08] dark:bg-foreground/[0.03] border-foreground/[0.18] dark:border-foreground/[0.06] hover:border-foreground/[0.25] dark:border-foreground/[0.12]'
      }`}
    >
      <div className="p-4">
        {/* Header */}
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              accent ? 'bg-success/20' : 'bg-foreground/[0.13] dark:bg-foreground/[0.06]'
            }`}>
              {icon}
            </div>
            <span className="min-w-0 break-words text-sm font-medium text-foreground/80">{label}</span>
          </div>
          {helpText && (
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="w-5 h-5 rounded-full flex items-center justify-center text-foreground/85 dark:text-foreground/60 dark:text-foreground/20 hover:text-foreground/80 dark:text-foreground/50 hover:bg-foreground/[0.13] dark:bg-foreground/[0.06] transition-colors"
              title="Toggle help"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Content */}
        {children}

        {/* Help Text */}
        {helpText && showHelp && (
          <div className="mt-3 flex gap-2 items-start bg-foreground/[0.16] dark:bg-foreground/[0.08] dark:bg-foreground/[0.03] rounded-lg p-2.5 transition-all duration-200">
            <ShieldCheck className="w-3.5 h-3.5 text-success mt-0.5 shrink-0" />
            <p className="text-[11px] text-foreground/80 dark:text-foreground/50 leading-relaxed">{helpText}</p>
          </div>
        )}
      </div>

      {/* Bottom help (always visible) */}
      {helpText && !showHelp && (
        <div className="px-4 pb-3">
          <p className="text-[10px] text-foreground/65 dark:text-foreground/25 truncate">{helpText}</p>
        </div>
      )}
    </div>
  );
}

// ─── Option Button ──────────────────────────────────────────────────────────

interface OptionBtnProps {
  label: string;
  active: boolean;
  onClick: () => void;
  className?: string;
}

function OptionBtn({ label, active, onClick, className = '' }: OptionBtnProps) {
  return (
    <button
      onClick={onClick}
      className={`min-w-0 flex-1 rounded-lg px-2.5 py-2 text-xs font-medium leading-tight transition-all duration-200 sm:flex-none sm:px-3 ${
        active
          ? 'bg-success/20 text-success border border-success/30 shadow-sm shadow-success/10'
          : 'bg-foreground/[0.18] dark:bg-foreground/[0.10] dark:bg-foreground/[0.04] text-foreground/90 dark:text-foreground/75 dark:text-foreground/45 border border-transparent hover:bg-foreground/[0.16] dark:bg-foreground/[0.08] hover:text-foreground/65'
      } ${className}`}
    >
      {active && <Check className="w-3 h-3 inline mr-1 -mt-0.5" />}
      {label}
    </button>
  );
}

// ─── Kindle Config Cards ────────────────────────────────────────────────────

function KindleConfigCards() {
  const { bookConfig, updateBookConfig } = useAppStore();
  const [fontEmbed, setFontEmbed] = useState(true);
  const [tocValidation, setTocValidation] = useState(true);
  const [reflowTesting, setReflowTesting] = useState(true);
  const [imageScaling, setImageScaling] = useState<'default' | 'optimized' | 'none'>('default');
  const [readabilityMode, setReadabilityMode] = useState<'default' | 'large-print' | 'dyslexia'>('default');

  return (
    <div className="space-y-3">
      {/* Font Embedding */}
      <ConfigCard
        icon={<Type className="w-3.5 h-3.5 text-success" />}
        label="Font Embedding"
        helpText="Embedded fonts ensure your book displays consistently across all Kindle devices and apps. Without embedding, Kindle may substitute fonts."
      >
        <div className="flex flex-wrap gap-2">
          <OptionBtn label="Enabled" active={fontEmbed} onClick={() => setFontEmbed(true)} />
          <OptionBtn label="Disabled" active={!fontEmbed} onClick={() => setFontEmbed(false)} />
        </div>
      </ConfigCard>

      {/* TOC Validation */}
      <ConfigCard
        icon={<BookMarked className="w-3.5 h-3.5 text-success" />}
        label="TOC Validation"
        helpText="Validates your Table of Contents has proper NCX and HTML navigation. KDP requires a functional TOC for Kindle books."
      >
        <div className="flex flex-wrap gap-2">
          <OptionBtn label="Enabled" active={tocValidation} onClick={() => setTocValidation(true)} />
          <OptionBtn label="Disabled" active={!tocValidation} onClick={() => setTocValidation(false)} />
        </div>
      </ConfigCard>

      {/* Reflow Testing */}
      <ConfigCard
        icon={<Move className="w-3.5 h-3.5 text-success" />}
        label="Reflow Testing"
        helpText="Tests how your content reflows across different font sizes and device orientations. Critical for a good reading experience."
      >
        <div className="flex flex-wrap gap-2">
          <OptionBtn label="Enabled" active={reflowTesting} onClick={() => setReflowTesting(true)} />
          <OptionBtn label="Disabled" active={!reflowTesting} onClick={() => setReflowTesting(false)} />
        </div>
      </ConfigCard>

      {/* Image Scaling */}
      <ConfigCard
        icon={<ImageIcon className="w-3.5 h-3.5 text-success" />}
        label="Image Scaling"
        helpText="Controls how images are processed. 'Optimized' resizes for Kindle screens while maintaining quality. 'None' keeps original sizes."
      >
        <div className="flex flex-wrap gap-2">
          <OptionBtn label="Default" active={imageScaling === 'default'} onClick={() => setImageScaling('default')} />
          <OptionBtn label="Optimized" active={imageScaling === 'optimized'} onClick={() => setImageScaling('optimized')} />
          <OptionBtn label="None" active={imageScaling === 'none'} onClick={() => setImageScaling('none')} />
        </div>
      </ConfigCard>

      {/* Readability Mode */}
      <ConfigCard
        icon={<Palette className="w-3.5 h-3.5 text-success" />}
        label="Readability Mode"
        helpText="Large Print increases font size for accessibility. Dyslexia-friendly uses specialized fonts and spacing recommended for readers with dyslexia."
      >
        <div className="flex flex-wrap gap-2">
          <OptionBtn label="Default" active={readabilityMode === 'default'} onClick={() => setReadabilityMode('default')} />
          <OptionBtn label="Large Print" active={readabilityMode === 'large-print'} onClick={() => setReadabilityMode('large-print')} />
          <OptionBtn label="Dyslexia" active={readabilityMode === 'dyslexia'} onClick={() => setReadabilityMode('dyslexia')} />
        </div>
      </ConfigCard>
    </div>
  );
}

// ─── Print Config Cards (shared by paperback & hardcover) ───────────────────

function PrintConfigCards({ isHardcover }: { isHardcover: boolean }) {
  const { bookConfig, updateBookConfig, measurements, uploadedManuscript } = useAppStore();
  const [customWidth, setCustomWidth] = useState(bookConfig.customWidth?.toString() || '');
  const [customHeight, setCustomHeight] = useState(bookConfig.customHeight?.toString() || '');

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
    let num = parseInt(value) || 24;
    // Ensure even number
    if (num % 2 !== 0) num += 1;
    num = Math.max(24, Math.min(isHardcover ? 550 : 828, num));
    updateBookConfig({ pageCount: num });
  }, [isHardcover, updateBookConfig]);

  // Auto-detect page count from uploaded manuscript
  const autoPageCount = uploadedManuscript?.pageCount;

  const handleCustomWidthChange = useCallback((value: string) => {
    setCustomWidth(value);
    const w = parseFloat(value) || 0;
    updateBookConfig({ customWidth: w });
  }, [updateBookConfig]);

  const handleCustomHeightChange = useCallback((value: string) => {
    setCustomHeight(value);
    const h = parseFloat(value) || 0;
    updateBookConfig({ customHeight: h });
  }, [updateBookConfig]);

  return (
    <div className="space-y-3">
      {/* Trim Size */}
      <ConfigCard
        icon={<Maximize2 className="w-3.5 h-3.5 text-success" />}
        label="Trim Size"
        helpText="Select a KDP-approved trim size. This determines your book's final printed dimensions and affects spine width calculation."
      >
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
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
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <div>
              <label className="text-[10px] text-foreground/65 dark:text-foreground/30 mb-1 block">Width (inches)</label>
              <input
                type="number"
                value={customWidth}
                onChange={(e) => handleCustomWidthChange(e.target.value)}
                step="0.01"
                min="5"
                max="8.5"
                className="w-full bg-foreground/[0.20] dark:bg-foreground/[0.12] dark:bg-foreground/[0.05] border border-foreground/25 dark:border-foreground/10 rounded-lg px-3 py-1.5 text-xs text-foreground/80 focus:outline-none focus:border-success/40 transition-colors"
                placeholder="6.0"
              />
            </div>
            <div>
              <label className="text-[10px] text-foreground/65 dark:text-foreground/30 mb-1 block">Height (inches)</label>
              <input
                type="number"
                value={customHeight}
                onChange={(e) => handleCustomHeightChange(e.target.value)}
                step="0.01"
                min="5"
                max="11"
                className="w-full bg-foreground/[0.20] dark:bg-foreground/[0.12] dark:bg-foreground/[0.05] border border-foreground/25 dark:border-foreground/10 rounded-lg px-3 py-1.5 text-xs text-foreground/80 focus:outline-none focus:border-success/40 transition-colors"
                placeholder="9.0"
              />
            </div>
          </div>
        )}
      </ConfigCard>

      {/* Bleed */}
      <ConfigCard
        icon={<ScanLine className="w-3.5 h-3.5 text-success" />}
        label="Bleed"
        helpText={
          bookConfig.bleed === 'bleed'
            ? 'Recommended when artwork reaches page edges. Adds 0.125" on each side for printing tolerance.'
            : 'White border around content. Choose this if your artwork does not extend to the page edges.'
        }
      >
        <div className="flex flex-wrap gap-2">
          <OptionBtn label="No Bleed" active={bookConfig.bleed === 'no-bleed'} onClick={() => updateBookConfig({ bleed: 'no-bleed' })} />
          <OptionBtn label="With Bleed" active={bookConfig.bleed === 'bleed'} onClick={() => updateBookConfig({ bleed: 'bleed' })} />
        </div>
      </ConfigCard>

      {/* Paper Type */}
      <ConfigCard
        icon={<Layers className="w-3.5 h-3.5 text-success" />}
        label="Paper Type"
        helpText="Paper type affects spine width calculation. Cream and premium paper are thicker per page, resulting in a wider spine."
      >
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
      </ConfigCard>

      {/* Interior Type */}
      <ConfigCard
        icon={<Palette className="w-3.5 h-3.5 text-success" />}
        label="Interior Type"
        helpText="Interior type determines printing method. B&W is most cost-effective. Color options use higher quality printing processes."
      >
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
      <ConfigCard
        icon={<FileText className="w-3.5 h-3.5 text-success" />}
        label="Page Count"
        helpText="Spine width is automatically calculated from page count and paper type. KDP requires even page numbers within the valid range."
        accent
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => handlePageCountChange(String(bookConfig.pageCount - 2))}
            className="w-8 h-8 rounded-lg bg-foreground/[0.13] dark:bg-foreground/[0.06] hover:bg-foreground/[0.1] flex items-center justify-center text-foreground/80 dark:text-foreground/50 hover:text-foreground/80 transition-colors"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <input
            type="number"
            value={bookConfig.pageCount}
            onChange={(e) => handlePageCountChange(e.target.value)}
            min={24}
            max={isHardcover ? 550 : 828}
            step={2}
            className="flex-1 bg-foreground/[0.20] dark:bg-foreground/[0.12] dark:bg-foreground/[0.05] border border-foreground/25 dark:border-foreground/10 rounded-lg px-3 py-2 text-center text-sm font-mono text-foreground/80 focus:outline-none focus:border-success/40 transition-colors"
          />
          <button
            onClick={() => handlePageCountChange(String(bookConfig.pageCount + 2))}
            className="w-8 h-8 rounded-lg bg-foreground/[0.13] dark:bg-foreground/[0.06] hover:bg-foreground/[0.1] flex items-center justify-center text-foreground/80 dark:text-foreground/50 hover:text-foreground/80 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
        {autoPageCount && autoPageCount !== bookConfig.pageCount && (
          <button
            onClick={() => handlePageCountChange(String(autoPageCount))}
            className="mt-2 text-[10px] text-success/60 hover:text-success transition-colors flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            Auto-fill from manuscript: {autoPageCount} pages
          </button>
        )}
        <p className="text-[10px] text-foreground/65 dark:text-foreground/25 mt-2">
          Range: 24–{isHardcover ? '550' : '828'} pages • Spine: {formatInches(measurements.spineWidthIn)}
        </p>
      </ConfigCard>

      {/* Binding */}
      <ConfigCard
        icon={<BookOpen className="w-3.5 h-3.5 text-foreground/65 dark:text-foreground/30" />}
        label={`Binding: ${isHardcover ? 'Hardcover' : 'Paperback'}`}
        helpText={isHardcover
          ? 'Hardcover binding includes a rigid case wrap with hinge and wrap zones for proper folding.'
          : 'Perfect binding with a glued spine. The most common and cost-effective binding for KDP.'
        }
      >
        <div className="flex items-center gap-2 bg-foreground/[0.16] dark:bg-foreground/[0.08] dark:bg-foreground/[0.03] rounded-lg px-3 py-2">
          <Lock className="w-3.5 h-3.5 text-foreground/85 dark:text-foreground/60 dark:text-foreground/20" />
          <span className="text-xs text-foreground/65 dark:text-foreground/30">{isHardcover ? 'Hardcover' : 'Paperback'} — set during import</span>
        </div>
      </ConfigCard>

      {/* Hardcover Extras */}
      {isHardcover && (
        <>
          <ConfigCard
            icon={<Grid3x3 className="w-3.5 h-3.5 text-warning" />}
            label="Hinge Area"
            helpText="Required folding area for hardcover binding. The hinge allows the cover to open smoothly without damaging the spine."
          >
            <div className="flex flex-col gap-1 rounded-lg bg-foreground/[0.16] px-3 py-2.5 dark:bg-foreground/[0.03] sm:flex-row sm:items-center sm:justify-between">
              <span className="text-xs text-foreground/90 dark:text-foreground/75 dark:text-foreground/40">Hinge width</span>
              <span className="text-sm font-mono text-warning">{formatInches(HARDCOVER_HINGE_IN)}</span>
            </div>
            <p className="text-[10px] text-foreground/65 dark:text-foreground/25 mt-1.5">0.375" on each side — auto-calculated for hardcover</p>
          </ConfigCard>

          <ConfigCard
            icon={<Box className="w-3.5 h-3.5 text-warning" />}
            label="Wrap Zone"
            helpText="The wrap zone extends the cover around the hardcover case. This area wraps around the board edges and onto the inside."
          >
            <div className="flex flex-col gap-1 rounded-lg bg-foreground/[0.16] px-3 py-2.5 dark:bg-foreground/[0.03] sm:flex-row sm:items-center sm:justify-between">
              <span className="text-xs text-foreground/90 dark:text-foreground/75 dark:text-foreground/40">Wrap width</span>
              <span className="text-sm font-mono text-warning">{formatInches(HARDCOVER_WRAP_IN)}</span>
            </div>
            <p className="text-[10px] text-foreground/65 dark:text-foreground/25 mt-1.5">0.625" on each side — auto-calculated for hardcover</p>
          </ConfigCard>
        </>
      )}
    </div>
  );
}

// ─── Measurements Display ───────────────────────────────────────────────────

function MeasurementsDisplay() {
  const { measurements, bookType, bookConfig } = useAppStore();
  const isHardcover = bookType === 'hardcover';

  const items = useMemo(() => {
    const base = [
      {
        label: 'Trim Size',
        value: `${formatInches(measurements.trimWidthIn)} × ${formatInches(measurements.trimHeightIn)}`,
        sub: `${inchesToMm(measurements.trimWidthIn).toFixed(1)} × ${inchesToMm(measurements.trimHeightIn).toFixed(1)} mm`,
      },
      {
        label: 'Spine Width',
        value: formatInches(measurements.spineWidthIn),
        sub: `${inchesToMm(measurements.spineWidthIn).toFixed(2)} mm`,
        highlight: true,
      },
      {
        label: 'Full Cover',
        value: `${formatInches(measurements.fullCoverWidthIn)} × ${formatInches(measurements.fullCoverHeightIn)}`,
        sub: `${inchesToPixels(measurements.fullCoverWidthIn)} × ${inchesToPixels(measurements.fullCoverHeightIn)} px`,
      },
      {
        label: 'Bleed',
        value: measurements.bleedIn > 0 ? `${formatInches(measurements.bleedIn)} per edge` : 'None',
        sub: measurements.bleedIn > 0 ? `${formatInches(BLEED_SIZE_IN)} on each side` : 'No bleed selected',
      },
      {
        label: 'Safe Area',
        value: `${formatInches(measurements.safeAreaIn)} from each edge`,
        sub: 'Keep content inside',
      },
      {
        label: 'Gutter',
        value: `${formatInches(measurements.gutterIn)} inner margin`,
        sub: 'Extra inner spacing improves readability near the spine',
      },
    ];

    if (isHardcover) {
      base.push(
        {
          label: 'Hinge',
          value: formatInches(measurements.hingeIn),
          sub: 'Required folding area for hardcover binding',
          highlight: true,
        },
        {
          label: 'Wrap',
          value: formatInches(HARDCOVER_WRAP_IN),
          sub: 'Cover wrap around case board',
        }
      );
    }

    if (bookType === 'paperback') {
      base.push({
        label: 'Barcode Safe Area',
        value: `2.000" × 1.200"`,
        sub: 'Bottom-right of back cover',
      });
    }

    return base;
  }, [measurements, bookType, isHardcover]);

  if (bookType === 'kindle') {
    return (
      <div className="bg-foreground/[0.16] dark:bg-foreground/[0.08] dark:bg-foreground/[0.03] border border-foreground/[0.18] dark:border-foreground/[0.06] rounded-xl p-4">
        <h4 className="text-xs text-foreground/80 dark:text-foreground/50 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Monitor className="w-3.5 h-3.5" />
          Kindle Format
        </h4>
        <div className="space-y-2">
          <div className="flex flex-col gap-1 rounded-lg bg-foreground/[0.13] p-2 dark:bg-foreground/[0.02] sm:flex-row sm:items-center sm:justify-between">
            <span className="text-xs text-foreground/90 dark:text-foreground/75 dark:text-foreground/40">Format</span>
            <span className="text-xs text-foreground/85 dark:text-foreground/70">KFX / MOBI / EPUB</span>
          </div>
          <div className="flex flex-col gap-1 rounded-lg bg-foreground/[0.13] p-2 dark:bg-foreground/[0.02] sm:flex-row sm:items-center sm:justify-between">
            <span className="text-xs text-foreground/90 dark:text-foreground/75 dark:text-foreground/40">Reflowable</span>
            <span className="text-xs text-success">Yes</span>
          </div>
          <div className="flex flex-col gap-1 rounded-lg bg-foreground/[0.13] p-2 dark:bg-foreground/[0.02] sm:flex-row sm:items-center sm:justify-between">
            <span className="text-xs text-foreground/90 dark:text-foreground/75 dark:text-foreground/40">Max File Size</span>
            <span className="text-xs text-foreground/85 dark:text-foreground/70">650 MB</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-foreground/[0.16] dark:bg-foreground/[0.08] dark:bg-foreground/[0.03] border border-foreground/[0.18] dark:border-foreground/[0.06] rounded-xl p-4">
      <h4 className="text-xs text-foreground/80 dark:text-foreground/50 uppercase tracking-wider mb-3 flex items-center gap-2">
        <Ruler className="w-3.5 h-3.5" />
        Calculated Measurements
      </h4>
      <div className="space-y-1.5">
        {items.map((item) => (
          <div
            key={item.label}
            className={`flex flex-col gap-2 rounded-lg p-2 transition-colors duration-200 sm:flex-row sm:items-center sm:justify-between ${
              (item as any).highlight
                ? 'bg-success/[0.08] border border-success/20'
                : 'bg-foreground/[0.13] dark:bg-foreground/[0.06] dark:bg-foreground/[0.02]'
            }`}
          >
            <div className="min-w-0">
              <p className="text-[11px] text-foreground/90 dark:text-foreground/75 dark:text-foreground/45">{item.label}</p>
              <p className="text-[9px] text-foreground/65 dark:text-foreground/25 truncate">{item.sub}</p>
            </div>
            <p className={`break-words font-mono text-xs font-medium sm:ml-2 sm:shrink-0 sm:text-right ${
              (item as any).highlight ? 'text-success' : 'text-foreground/70'
            }`}>
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Live SVG Visualization ─────────────────────────────────────────────────

function CoverVisualization() {
  const { measurements, bookType, bookConfig } = useAppStore();
  const isHardcover = bookType === 'hardcover';

  if (bookType === 'kindle') {
    return <KindleVisualization />;
  }

  // Scale to fit within SVG viewport
  const svgW = 500;
  const svgH = 420;
  const padding = 40;

  const m = measurements;
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

  // Positions
  const x0 = offX; // full cover left
  const y0 = offY; // full cover top

  // Wrap inner edge
  const wrapL = x0 + wrap;
  const wrapT = y0 + wrap;
  const wrapR = x0 + coverW - wrap;
  const wrapB = y0 + coverH - wrap;

  // Bleed inner edge
  const bleedL = wrapL + bleed;
  const bleedT = wrapT + bleed;
  const bleedR = wrapR - bleed;
  const bleedB = wrapB - bleed;

  // Back cover trim area
  const backX = bleedL;
  const backY = bleedT;
  const backW = trimW;
  const backH = trimH;

  // Spine
  const spineX = backX + backW;
  const spineY = bleedT;
  const spineH = trimH;

  // Front cover trim area
  const frontX = spineX + spine;
  const frontY = bleedT;
  const frontW = trimW;
  const frontH = trimH;

  // Hinge areas (hardcover only)
  const hingeLeftX = backX;
  const hingeRightX = frontX + frontW - hinge;

  // Barcode area (paperback only)
  const barcodeW = BARCODE_AREA.width * scale;
  const barcodeH = BARCODE_AREA.height * scale;
  const barcodeX = backX + backW - safe - barcodeW;
  const barcodeY = backY + backH - safe - barcodeH;

  return (
    <div className="flex h-full w-full min-w-0 flex-col items-center justify-center">
      <h3 className="text-xs text-foreground/90 dark:text-foreground/75 dark:text-foreground/40 uppercase tracking-wider mb-4">
        {isHardcover ? 'Hardcover' : 'Paperback'} Cover Layout
      </h3>
      <svg
        width={svgW}
        height={svgH}
        viewBox={`0 0 ${svgW} ${svgH}`}
        className="h-auto w-full max-w-[500px] text-foreground"
      >
        {/* Full Cover Outline */}
        <rect
          x={x0} y={y0}
          width={coverW} height={coverH}
          fill="none"
          stroke="color-mix(in srgb, var(--foreground) 12%, transparent)"
          strokeWidth="1"
          strokeDasharray="4 3"
          style={{ transition: 'all 0.4s ease' }}
        />

        {/* Wrap Area (hardcover) */}
        {isHardcover && (
          <>
            <rect
              x={x0} y={y0}
              width={coverW} height={coverH}
              fill="color-mix(in srgb, var(--overlay-gutter) 8%, transparent)"
              stroke="none"
              style={{ transition: 'all 0.4s ease' }}
            />
            <rect
              x={wrapL} y={wrapT}
              width={wrapR - wrapL} height={wrapB - wrapT}
              fill="none"
              stroke="color-mix(in srgb, var(--overlay-gutter) 38%, transparent)"
              strokeWidth="0.5"
              strokeDasharray="3 2"
              style={{ transition: 'all 0.4s ease' }}
            />
          </>
        )}

        {/* Bleed Area */}
        {bleed > 0 && (
          <rect
            x={wrapL} y={wrapT}
            width={wrapR - wrapL} height={wrapB - wrapT}
            fill="color-mix(in srgb, var(--overlay-bleed) 10%, transparent)"
            stroke="rgba(239,68,68,0.25)"
            strokeWidth="0.5"
            style={{ transition: 'all 0.4s ease' }}
          />
        )}

        {/* Back Cover */}
        <rect
          x={backX} y={backY}
          width={backW} height={backH}
          fill="color-mix(in srgb, var(--foreground) 3%, transparent)"
          stroke="color-mix(in srgb, var(--foreground) 18%, transparent)"
          strokeWidth="1"
          style={{ transition: 'all 0.4s ease' }}
        />

        {/* Front Cover */}
        <rect
          x={frontX} y={frontY}
          width={frontW} height={frontH}
          fill="color-mix(in srgb, var(--foreground) 6%, transparent)"
          stroke="color-mix(in srgb, var(--foreground) 25%, transparent)"
          strokeWidth="1"
          style={{ transition: 'all 0.4s ease' }}
        />

        {/* Spine */}
        <rect
          x={spineX} y={spineY}
          width={Math.max(spine, 1)} height={spineH}
          fill="color-mix(in srgb, var(--overlay-safe) 18%, transparent)"
          stroke="var(--overlay-safe)"
          strokeWidth="0.5"
          style={{ transition: 'all 0.4s ease' }}
        />

        {/* Hinge Areas (hardcover only) */}
        {isHardcover && hinge > 0 && (
          <>
            <rect
              x={hingeLeftX} y={bleedT}
              width={hinge} height={trimH}
              fill="color-mix(in srgb, var(--overlay-gutter) 12%, transparent)"
              stroke="var(--overlay-gutter)"
              strokeWidth="0.5"
              strokeDasharray="2 2"
              style={{ transition: 'all 0.4s ease' }}
            />
            <rect
              x={hingeRightX} y={bleedT}
              width={hinge} height={trimH}
              fill="color-mix(in srgb, var(--overlay-gutter) 12%, transparent)"
              stroke="var(--overlay-gutter)"
              strokeWidth="0.5"
              strokeDasharray="2 2"
              style={{ transition: 'all 0.4s ease' }}
            />
          </>
        )}

        {/* Safe Zones */}
        {/* Back safe */}
        <rect
          x={backX + safe} y={backY + safe}
          width={Math.max(backW - 2 * safe, 1)} height={Math.max(backH - 2 * safe, 1)}
          fill="none"
          stroke="var(--overlay-trim)"
          strokeWidth="0.5"
          strokeDasharray="2 2"
          style={{ transition: 'all 0.4s ease' }}
        />
        {/* Front safe */}
        <rect
          x={frontX + safe} y={frontY + safe}
          width={Math.max(frontW - 2 * safe, 1)} height={Math.max(frontH - 2 * safe, 1)}
          fill="none"
          stroke="var(--overlay-trim)"
          strokeWidth="0.5"
          strokeDasharray="2 2"
          style={{ transition: 'all 0.4s ease' }}
        />

        {/* Barcode Area (paperback only) */}
        {!isHardcover && (
          <rect
            x={barcodeX} y={barcodeY}
            width={barcodeW} height={barcodeH}
            fill="color-mix(in srgb, var(--overlay-margin) 12%, transparent)"
            stroke="var(--overlay-margin)"
            strokeWidth="0.5"
            strokeDasharray="2 2"
            style={{ transition: 'all 0.4s ease' }}
          />
        )}

        {/* ─── Labels ─── */}
        <text
          x={frontX + frontW / 2}
          y={frontY + frontH / 2 - 6}
          textAnchor="middle"
          className="text-[9px]"
          fill="color-mix(in srgb, var(--foreground) 50%, transparent)"
        >
          Front Cover
        </text>
        <text
          x={frontX + frontW / 2}
          y={frontY + frontH / 2 + 8}
          textAnchor="middle"
          className="text-[8px]"
          fill="color-mix(in srgb, var(--foreground) 25%, transparent)"
        >
          {formatInches(m.trimWidthIn)} × {formatInches(m.trimHeightIn)}
        </text>

        <text
          x={backX + backW / 2}
          y={backY + backH / 2}
          textAnchor="middle"
          className="text-[9px]"
          fill="color-mix(in srgb, var(--foreground) 35%, transparent)"
        >
          Back Cover
        </text>

        {/* Spine label */}
        {spine > 12 && (
          <text
            x={spineX + spine / 2}
            y={spineY + spineH / 2}
            textAnchor="middle"
            className="text-[7px]"
            fill="var(--overlay-safe)"
            transform={`rotate(-90, ${spineX + spine / 2}, ${spineY + spineH / 2})`}
          >
            Spine {formatInches(m.spineWidthIn)}
          </text>
        )}

        {/* Hinge labels */}
        {isHardcover && hinge > 8 && (
          <>
            <text
              x={hingeLeftX + hinge / 2}
              y={bleedT + trimH / 2}
              textAnchor="middle"
              className="text-[6px]"
              fill="var(--overlay-gutter)"
              transform={`rotate(-90, ${hingeLeftX + hinge / 2}, ${bleedT + trimH / 2})`}
            >
              Hinge
            </text>
            <text
              x={hingeRightX + hinge / 2}
              y={bleedT + trimH / 2}
              textAnchor="middle"
              className="text-[6px]"
              fill="var(--overlay-gutter)"
              transform={`rotate(-90, ${hingeRightX + hinge / 2}, ${bleedT + trimH / 2})`}
            >
              Hinge
            </text>
          </>
        )}

        {/* Barcode label */}
        {!isHardcover && (
          <text
            x={barcodeX + barcodeW / 2}
            y={barcodeY + barcodeH / 2}
            textAnchor="middle"
            className="text-[6px]"
            fill="var(--overlay-margin)"
          >
            Barcode
          </text>
        )}

        {/* Dimension lines */}
        <line
          x1={x0} y1={y0 + coverH + 14}
          x2={x0 + coverW} y2={y0 + coverH + 14}
          stroke="color-mix(in srgb, var(--foreground) 15%, transparent)"
          strokeWidth="0.5"
        />
        <text
          x={x0 + coverW / 2} y={y0 + coverH + 25}
          textAnchor="middle"
          className="text-[8px]"
          fill="color-mix(in srgb, var(--foreground) 30%, transparent)"
        >
          {formatInches(m.fullCoverWidthIn)}
        </text>

        <line
          x1={x0 + coverW + 14} y1={y0}
          x2={x0 + coverW + 14} y2={y0 + coverH}
          stroke="color-mix(in srgb, var(--foreground) 15%, transparent)"
          strokeWidth="0.5"
        />
        <text
          x={x0 + coverW + 22} y={y0 + coverH / 2}
          textAnchor="middle"
          className="text-[8px]"
          fill="color-mix(in srgb, var(--foreground) 30%, transparent)"
          transform={`rotate(90, ${x0 + coverW + 22}, ${y0 + coverH / 2})`}
        >
          {formatInches(m.fullCoverHeightIn)}
        </text>
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 justify-center mt-3">
        <div className="flex items-center gap-1.5 text-[10px] text-foreground/85 dark:text-foreground/70 dark:text-foreground/35">
          <div className="w-3 h-0.5 border border-dashed border-foreground/30 dark:border-foreground/20" /> Full Cover
        </div>
        {bleed > 0 && (
          <div className="flex items-center gap-1.5 text-[10px] text-foreground/85 dark:text-foreground/70 dark:text-foreground/35">
            <div className="w-3 h-0.5 bg-danger/30" /> Bleed
          </div>
        )}
        <div className="flex items-center gap-1.5 text-[10px] text-foreground/85 dark:text-foreground/70 dark:text-foreground/35">
          <div className="w-3 h-0.5 bg-success/40" /> Spine
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-foreground/85 dark:text-foreground/70 dark:text-foreground/35">
          <div className="w-3 h-0.5 border border-dashed border-primary/30" /> Safe Zone
        </div>
        {!isHardcover && (
          <div className="flex items-center gap-1.5 text-[10px] text-foreground/85 dark:text-foreground/70 dark:text-foreground/35">
            <div className="w-3 h-0.5 border border-dashed border-primary/30" /> Barcode
          </div>
        )}
        {isHardcover && (
          <div className="flex items-center gap-1.5 text-[10px] text-foreground/85 dark:text-foreground/70 dark:text-foreground/35">
            <div className="w-3 h-0.5 border border-dashed border-warning/30" /> Hinge/Wrap
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Kindle Visualization ───────────────────────────────────────────────────

function KindleVisualization() {
  return (
    <div className="flex h-full w-full min-w-0 flex-col items-center justify-center">
      <h3 className="text-xs text-foreground/90 dark:text-foreground/75 dark:text-foreground/40 uppercase tracking-wider mb-6">
        Kindle Digital Preview
      </h3>

      {/* Device frame */}
      <div className="relative w-full max-w-[280px]">
        <svg width="280" height="380" viewBox="0 0 280 380" className="h-auto w-full text-foreground">
          {/* Device body */}
          <rect
            x="20" y="10"
            width="240" height="360"
            rx="16" ry="16"
            fill="color-mix(in srgb, var(--foreground) 3%, transparent)"
            stroke="color-mix(in srgb, var(--foreground) 12%, transparent)"
            strokeWidth="1.5"
          />

          {/* Screen area */}
          <rect
            x="36" y="36"
            width="208" height="290"
            rx="2" ry="2"
            fill="color-mix(in srgb, var(--foreground) 2%, transparent)"
            stroke="color-mix(in srgb, var(--foreground) 6%, transparent)"
            strokeWidth="0.5"
          />

          {/* Simulated text lines */}
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
            <rect
              key={i}
              x="48"
              y={52 + i * 22}
              width={i % 3 === 1 ? 140 : i % 3 === 2 ? 170 : 185}
              height="4"
              rx="2"
              fill="color-mix(in srgb, var(--foreground) 6%, transparent)"
            />
          ))}

          {/* Title text */}
          <text x="140" y="46" textAnchor="middle" className="text-[8px]" fill="color-mix(in srgb, var(--foreground) 30%, transparent)">
            Chapter Title
          </text>

          {/* Page indicator */}
          <text x="140" y="352" textAnchor="middle" className="text-[7px]" fill="rgba(255,255,255,0.2)">
            Loc 1234 · 15%
          </text>

          {/* Kindle logo dot */}
          <circle cx="140" cy="340" r="3" fill="color-mix(in srgb, var(--foreground) 8%, transparent)" />
        </svg>
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-3 sm:gap-4">
        <div className="flex items-center gap-1.5 text-[10px] text-foreground/85 dark:text-foreground/70 dark:text-foreground/35">
          <Monitor className="w-3 h-3" /> Reflowable Layout
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-foreground/85 dark:text-foreground/70 dark:text-foreground/35">
          <Type className="w-3 h-3" /> Embedded Fonts
        </div>
      </div>
    </div>
  );
}

// ─── Auto-Fill Banner ───────────────────────────────────────────────────────

function AutoFillBanner() {
  const { uploadedCover, uploadedManuscript, bookConfig, updateBookConfig } = useAppStore();

  const hasAutoFill = uploadedManuscript?.pageCount && uploadedManuscript.pageCount !== bookConfig.pageCount;

  if (!hasAutoFill) return null;

  return (
    <div className="bg-success/[0.08] border border-success/20 rounded-xl p-3 flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-success/20 flex items-center justify-center shrink-0">
        <Check className="w-4 h-4 text-success" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-success font-medium">Auto-detected from import</p>
        <p className="text-[10px] text-foreground/90 dark:text-foreground/75 dark:text-foreground/40">
          {uploadedManuscript?.pageCount} pages detected — you can still adjust settings manually
        </p>
      </div>
    </div>
  );
}

// ─── Main ConfigStep ────────────────────────────────────────────────────────

export default function ConfigStep() {
  const {
    bookType, bookConfig, measurements, updateBookConfig,
    uploadedCover, uploadedManuscript, setCheckerStep,
  } = useAppStore();

  const isHardcover = bookType === 'hardcover';
  const isKindle = bookType === 'kindle';

  const bookTypeLabel = {
    kindle: 'Kindle eBook',
    paperback: 'Paperback',
    hardcover: 'Hardcover',
  }[bookType];

  const bookTypeIcon = {
    kindle: <Monitor className="w-4 h-4" />,
    paperback: <BookOpen className="w-4 h-4" />,
    hardcover: <Box className="w-4 h-4" />,
  }[bookType];

  return (
    <div className="flex h-full flex-col gap-6 lg:flex-row">
      {/* ─── LEFT: Config Panel ─── */}
      <div className="flex min-w-0 flex-col gap-4 overflow-y-visible pr-0 lg:max-h-[calc(100vh-200px)] lg:w-[400px] lg:shrink-0 lg:overflow-y-auto lg:pr-1 xl:w-[440px] custom-scrollbar">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-success/15 flex items-center justify-center text-success">
            {bookTypeIcon}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground/90">Configure</h2>
            <p className="text-xs text-foreground/90 dark:text-foreground/75 dark:text-foreground/40">{bookTypeLabel} — set your book specifications</p>
          </div>
        </div>

        {/* Auto-fill banner */}
        <AutoFillBanner />

        {/* Context-aware config cards */}
        {isKindle ? <KindleConfigCards /> : <PrintConfigCards isHardcover={isHardcover} />}

        {/* Measurements Display */}
        <MeasurementsDisplay />
      </div>

      {/* ─── RIGHT: Live Visualization + Sticky Action ─── */}
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        {/* Live Visualization */}
        <div className="flex min-h-[320px] flex-1 items-center justify-center rounded-2xl border border-foreground/[0.18] bg-foreground/[0.13] p-4 dark:bg-foreground/[0.02] dark:border-foreground/[0.06] sm:min-h-[420px] sm:p-6 lg:min-h-[500px] lg:p-8">
          <CoverVisualization />
        </div>

        {/* Sticky Navigation — always visible, no scrolling needed */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={() => setCheckerStep('import')}
            className="flex items-center justify-center gap-2 rounded-xl border border-foreground/[0.18] bg-foreground/[0.18] px-4 py-3 text-xs text-foreground/80 transition-all duration-200 hover:bg-foreground/[0.16] hover:text-foreground/85 dark:bg-foreground/[0.04] dark:border-foreground/[0.06] dark:text-foreground/50 dark:hover:text-foreground/70"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Import
          </button>
          <button
            onClick={() => setCheckerStep('preview')}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-success hover:bg-success text-foreground font-semibold text-sm transition-all duration-200 shadow-lg shadow-success/25"
          >
            Start Review
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
