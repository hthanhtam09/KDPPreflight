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
          ? 'bg-emerald-500/[0.06] border-emerald-500/20'
          : 'bg-white/[0.03] border-white/[0.06] hover:border-white/[0.12]'
      }`}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              accent ? 'bg-emerald-500/20' : 'bg-white/[0.06]'
            }`}>
              {icon}
            </div>
            <span className="text-sm font-medium text-white/80">{label}</span>
          </div>
          {helpText && (
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="w-5 h-5 rounded-full flex items-center justify-center text-white/20 hover:text-white/50 hover:bg-white/[0.06] transition-colors"
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
          <div className="mt-3 flex gap-2 items-start bg-white/[0.03] rounded-lg p-2.5 transition-all duration-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
            <p className="text-[11px] text-white/50 leading-relaxed">{helpText}</p>
          </div>
        )}
      </div>

      {/* Bottom help (always visible) */}
      {helpText && !showHelp && (
        <div className="px-4 pb-3">
          <p className="text-[10px] text-white/25 truncate">{helpText}</p>
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
      className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
        active
          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm shadow-emerald-500/10'
          : 'bg-white/[0.04] text-white/45 border border-transparent hover:bg-white/[0.08] hover:text-white/65'
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
        icon={<Type className="w-3.5 h-3.5 text-emerald-400" />}
        label="Font Embedding"
        helpText="Embedded fonts ensure your book displays consistently across all Kindle devices and apps. Without embedding, Kindle may substitute fonts."
      >
        <div className="flex gap-2">
          <OptionBtn label="Enabled" active={fontEmbed} onClick={() => setFontEmbed(true)} />
          <OptionBtn label="Disabled" active={!fontEmbed} onClick={() => setFontEmbed(false)} />
        </div>
      </ConfigCard>

      {/* TOC Validation */}
      <ConfigCard
        icon={<BookMarked className="w-3.5 h-3.5 text-emerald-400" />}
        label="TOC Validation"
        helpText="Validates your Table of Contents has proper NCX and HTML navigation. KDP requires a functional TOC for Kindle books."
      >
        <div className="flex gap-2">
          <OptionBtn label="Enabled" active={tocValidation} onClick={() => setTocValidation(true)} />
          <OptionBtn label="Disabled" active={!tocValidation} onClick={() => setTocValidation(false)} />
        </div>
      </ConfigCard>

      {/* Reflow Testing */}
      <ConfigCard
        icon={<Move className="w-3.5 h-3.5 text-emerald-400" />}
        label="Reflow Testing"
        helpText="Tests how your content reflows across different font sizes and device orientations. Critical for a good reading experience."
      >
        <div className="flex gap-2">
          <OptionBtn label="Enabled" active={reflowTesting} onClick={() => setReflowTesting(true)} />
          <OptionBtn label="Disabled" active={!reflowTesting} onClick={() => setReflowTesting(false)} />
        </div>
      </ConfigCard>

      {/* Image Scaling */}
      <ConfigCard
        icon={<ImageIcon className="w-3.5 h-3.5 text-emerald-400" />}
        label="Image Scaling"
        helpText="Controls how images are processed. 'Optimized' resizes for Kindle screens while maintaining quality. 'None' keeps original sizes."
      >
        <div className="flex gap-2">
          <OptionBtn label="Default" active={imageScaling === 'default'} onClick={() => setImageScaling('default')} />
          <OptionBtn label="Optimized" active={imageScaling === 'optimized'} onClick={() => setImageScaling('optimized')} />
          <OptionBtn label="None" active={imageScaling === 'none'} onClick={() => setImageScaling('none')} />
        </div>
      </ConfigCard>

      {/* Readability Mode */}
      <ConfigCard
        icon={<Palette className="w-3.5 h-3.5 text-emerald-400" />}
        label="Readability Mode"
        helpText="Large Print increases font size for accessibility. Dyslexia-friendly uses specialized fonts and spacing recommended for readers with dyslexia."
      >
        <div className="flex gap-2">
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
        icon={<Maximize2 className="w-3.5 h-3.5 text-emerald-400" />}
        label="Trim Size"
        helpText="Select a KDP-approved trim size. This determines your book's final printed dimensions and affects spine width calculation."
      >
        <div className="grid grid-cols-3 gap-1.5">
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
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div>
              <label className="text-[10px] text-white/30 mb-1 block">Width (inches)</label>
              <input
                type="number"
                value={customWidth}
                onChange={(e) => handleCustomWidthChange(e.target.value)}
                step="0.01"
                min="5"
                max="8.5"
                className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white/80 focus:outline-none focus:border-emerald-500/40 transition-colors"
                placeholder="6.0"
              />
            </div>
            <div>
              <label className="text-[10px] text-white/30 mb-1 block">Height (inches)</label>
              <input
                type="number"
                value={customHeight}
                onChange={(e) => handleCustomHeightChange(e.target.value)}
                step="0.01"
                min="5"
                max="11"
                className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white/80 focus:outline-none focus:border-emerald-500/40 transition-colors"
                placeholder="9.0"
              />
            </div>
          </div>
        )}
      </ConfigCard>

      {/* Bleed */}
      <ConfigCard
        icon={<ScanLine className="w-3.5 h-3.5 text-emerald-400" />}
        label="Bleed"
        helpText={
          bookConfig.bleed === 'bleed'
            ? 'Recommended when artwork reaches page edges. Adds 0.125" on each side for printing tolerance.'
            : 'White border around content. Choose this if your artwork does not extend to the page edges.'
        }
      >
        <div className="flex gap-2">
          <OptionBtn label="No Bleed" active={bookConfig.bleed === 'no-bleed'} onClick={() => updateBookConfig({ bleed: 'no-bleed' })} />
          <OptionBtn label="With Bleed" active={bookConfig.bleed === 'bleed'} onClick={() => updateBookConfig({ bleed: 'bleed' })} />
        </div>
      </ConfigCard>

      {/* Paper Type */}
      <ConfigCard
        icon={<Layers className="w-3.5 h-3.5 text-emerald-400" />}
        label="Paper Type"
        helpText="Paper type affects spine width calculation. Cream and premium paper are thicker per page, resulting in a wider spine."
      >
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
      <ConfigCard
        icon={<Palette className="w-3.5 h-3.5 text-emerald-400" />}
        label="Interior Type"
        helpText="Interior type determines printing method. B&W is most cost-effective. Color options use higher quality printing processes."
      >
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
      <ConfigCard
        icon={<FileText className="w-3.5 h-3.5 text-emerald-400" />}
        label="Page Count"
        helpText="Spine width is automatically calculated from page count and paper type. KDP requires even page numbers within the valid range."
        accent
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => handlePageCountChange(String(bookConfig.pageCount - 2))}
            className="w-8 h-8 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] flex items-center justify-center text-white/50 hover:text-white/80 transition-colors"
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
            className="flex-1 bg-white/[0.05] border border-white/10 rounded-lg px-3 py-2 text-center text-sm font-mono text-white/80 focus:outline-none focus:border-emerald-500/40 transition-colors"
          />
          <button
            onClick={() => handlePageCountChange(String(bookConfig.pageCount + 2))}
            className="w-8 h-8 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] flex items-center justify-center text-white/50 hover:text-white/80 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
        {autoPageCount && autoPageCount !== bookConfig.pageCount && (
          <button
            onClick={() => handlePageCountChange(String(autoPageCount))}
            className="mt-2 text-[10px] text-emerald-400/60 hover:text-emerald-400 transition-colors flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            Auto-fill from manuscript: {autoPageCount} pages
          </button>
        )}
        <p className="text-[10px] text-white/25 mt-2">
          Range: 24–{isHardcover ? '550' : '828'} pages • Spine: {formatInches(measurements.spineWidthIn)}
        </p>
      </ConfigCard>

      {/* Binding */}
      <ConfigCard
        icon={<BookOpen className="w-3.5 h-3.5 text-white/30" />}
        label={`Binding: ${isHardcover ? 'Hardcover' : 'Paperback'}`}
        helpText={isHardcover
          ? 'Hardcover binding includes a rigid case wrap with hinge and wrap zones for proper folding.'
          : 'Perfect binding with a glued spine. The most common and cost-effective binding for KDP.'
        }
      >
        <div className="flex items-center gap-2 bg-white/[0.03] rounded-lg px-3 py-2">
          <Lock className="w-3.5 h-3.5 text-white/20" />
          <span className="text-xs text-white/30">{isHardcover ? 'Hardcover' : 'Paperback'} — set during import</span>
        </div>
      </ConfigCard>

      {/* Hardcover Extras */}
      {isHardcover && (
        <>
          <ConfigCard
            icon={<Grid3x3 className="w-3.5 h-3.5 text-amber-400" />}
            label="Hinge Area"
            helpText="Required folding area for hardcover binding. The hinge allows the cover to open smoothly without damaging the spine."
          >
            <div className="flex items-center justify-between bg-white/[0.03] rounded-lg px-3 py-2.5">
              <span className="text-xs text-white/40">Hinge width</span>
              <span className="text-sm font-mono text-amber-400">{formatInches(HARDCOVER_HINGE_IN)}</span>
            </div>
            <p className="text-[10px] text-white/25 mt-1.5">0.375" on each side — auto-calculated for hardcover</p>
          </ConfigCard>

          <ConfigCard
            icon={<Box className="w-3.5 h-3.5 text-amber-400" />}
            label="Wrap Zone"
            helpText="The wrap zone extends the cover around the hardcover case. This area wraps around the board edges and onto the inside."
          >
            <div className="flex items-center justify-between bg-white/[0.03] rounded-lg px-3 py-2.5">
              <span className="text-xs text-white/40">Wrap width</span>
              <span className="text-sm font-mono text-amber-400">{formatInches(HARDCOVER_WRAP_IN)}</span>
            </div>
            <p className="text-[10px] text-white/25 mt-1.5">0.625" on each side — auto-calculated for hardcover</p>
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
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
        <h4 className="text-xs text-white/50 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Monitor className="w-3.5 h-3.5" />
          Kindle Format
        </h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 bg-white/[0.02] rounded-lg">
            <span className="text-xs text-white/40">Format</span>
            <span className="text-xs text-white/70">KFX / MOBI / EPUB</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-white/[0.02] rounded-lg">
            <span className="text-xs text-white/40">Reflowable</span>
            <span className="text-xs text-emerald-400">Yes</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-white/[0.02] rounded-lg">
            <span className="text-xs text-white/40">Max File Size</span>
            <span className="text-xs text-white/70">650 MB</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
      <h4 className="text-xs text-white/50 uppercase tracking-wider mb-3 flex items-center gap-2">
        <Ruler className="w-3.5 h-3.5" />
        Calculated Measurements
      </h4>
      <div className="space-y-1.5">
        {items.map((item) => (
          <div
            key={item.label}
            className={`flex items-center justify-between p-2 rounded-lg transition-colors duration-200 ${
              (item as any).highlight
                ? 'bg-emerald-500/[0.08] border border-emerald-500/20'
                : 'bg-white/[0.02]'
            }`}
          >
            <div className="min-w-0">
              <p className="text-[11px] text-white/45">{item.label}</p>
              <p className="text-[9px] text-white/25 truncate">{item.sub}</p>
            </div>
            <p className={`text-xs font-mono font-medium shrink-0 ml-2 ${
              (item as any).highlight ? 'text-emerald-400' : 'text-white/70'
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
    <div className="flex flex-col items-center justify-center h-full">
      <h3 className="text-xs text-white/40 uppercase tracking-wider mb-4">
        {isHardcover ? 'Hardcover' : 'Paperback'} Cover Layout
      </h3>
      <svg
        width={svgW}
        height={svgH}
        viewBox={`0 0 ${svgW} ${svgH}`}
        className="text-white max-w-full"
      >
        {/* Full Cover Outline */}
        <rect
          x={x0} y={y0}
          width={coverW} height={coverH}
          fill="none"
          stroke="rgba(255,255,255,0.12)"
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
              fill="rgba(251,191,36,0.03)"
              stroke="none"
              style={{ transition: 'all 0.4s ease' }}
            />
            <rect
              x={wrapL} y={wrapT}
              width={wrapR - wrapL} height={wrapB - wrapT}
              fill="none"
              stroke="rgba(251,191,36,0.2)"
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
            fill="rgba(239,68,68,0.04)"
            stroke="rgba(239,68,68,0.25)"
            strokeWidth="0.5"
            style={{ transition: 'all 0.4s ease' }}
          />
        )}

        {/* Back Cover */}
        <rect
          x={backX} y={backY}
          width={backW} height={backH}
          fill="rgba(255,255,255,0.03)"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="1"
          style={{ transition: 'all 0.4s ease' }}
        />

        {/* Front Cover */}
        <rect
          x={frontX} y={frontY}
          width={frontW} height={frontH}
          fill="rgba(255,255,255,0.06)"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="1"
          style={{ transition: 'all 0.4s ease' }}
        />

        {/* Spine */}
        <rect
          x={spineX} y={spineY}
          width={Math.max(spine, 1)} height={spineH}
          fill="rgba(16,185,129,0.1)"
          stroke="rgba(16,185,129,0.4)"
          strokeWidth="0.5"
          style={{ transition: 'all 0.4s ease' }}
        />

        {/* Hinge Areas (hardcover only) */}
        {isHardcover && hinge > 0 && (
          <>
            <rect
              x={hingeLeftX} y={bleedT}
              width={hinge} height={trimH}
              fill="rgba(251,191,36,0.06)"
              stroke="rgba(251,191,36,0.3)"
              strokeWidth="0.5"
              strokeDasharray="2 2"
              style={{ transition: 'all 0.4s ease' }}
            />
            <rect
              x={hingeRightX} y={bleedT}
              width={hinge} height={trimH}
              fill="rgba(251,191,36,0.06)"
              stroke="rgba(251,191,36,0.3)"
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
          stroke="rgba(59,130,246,0.3)"
          strokeWidth="0.5"
          strokeDasharray="2 2"
          style={{ transition: 'all 0.4s ease' }}
        />
        {/* Front safe */}
        <rect
          x={frontX + safe} y={frontY + safe}
          width={Math.max(frontW - 2 * safe, 1)} height={Math.max(frontH - 2 * safe, 1)}
          fill="none"
          stroke="rgba(59,130,246,0.3)"
          strokeWidth="0.5"
          strokeDasharray="2 2"
          style={{ transition: 'all 0.4s ease' }}
        />

        {/* Barcode Area (paperback only) */}
        {!isHardcover && (
          <rect
            x={barcodeX} y={barcodeY}
            width={barcodeW} height={barcodeH}
            fill="rgba(168,85,247,0.06)"
            stroke="rgba(168,85,247,0.25)"
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
          fill="rgba(255,255,255,0.5)"
        >
          Front Cover
        </text>
        <text
          x={frontX + frontW / 2}
          y={frontY + frontH / 2 + 8}
          textAnchor="middle"
          className="text-[8px]"
          fill="rgba(255,255,255,0.25)"
        >
          {formatInches(m.trimWidthIn)} × {formatInches(m.trimHeightIn)}
        </text>

        <text
          x={backX + backW / 2}
          y={backY + backH / 2}
          textAnchor="middle"
          className="text-[9px]"
          fill="rgba(255,255,255,0.35)"
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
            fill="rgba(16,185,129,0.6)"
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
              fill="rgba(251,191,36,0.5)"
              transform={`rotate(-90, ${hingeLeftX + hinge / 2}, ${bleedT + trimH / 2})`}
            >
              Hinge
            </text>
            <text
              x={hingeRightX + hinge / 2}
              y={bleedT + trimH / 2}
              textAnchor="middle"
              className="text-[6px]"
              fill="rgba(251,191,36,0.5)"
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
            fill="rgba(168,85,247,0.5)"
          >
            Barcode
          </text>
        )}

        {/* Dimension lines */}
        <line
          x1={x0} y1={y0 + coverH + 14}
          x2={x0 + coverW} y2={y0 + coverH + 14}
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="0.5"
        />
        <text
          x={x0 + coverW / 2} y={y0 + coverH + 25}
          textAnchor="middle"
          className="text-[8px]"
          fill="rgba(255,255,255,0.3)"
        >
          {formatInches(m.fullCoverWidthIn)}
        </text>

        <line
          x1={x0 + coverW + 14} y1={y0}
          x2={x0 + coverW + 14} y2={y0 + coverH}
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="0.5"
        />
        <text
          x={x0 + coverW + 22} y={y0 + coverH / 2}
          textAnchor="middle"
          className="text-[8px]"
          fill="rgba(255,255,255,0.3)"
          transform={`rotate(90, ${x0 + coverW + 22}, ${y0 + coverH / 2})`}
        >
          {formatInches(m.fullCoverHeightIn)}
        </text>
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 justify-center mt-3">
        <div className="flex items-center gap-1.5 text-[10px] text-white/35">
          <div className="w-3 h-0.5 border border-dashed border-white/20" /> Full Cover
        </div>
        {bleed > 0 && (
          <div className="flex items-center gap-1.5 text-[10px] text-white/35">
            <div className="w-3 h-0.5 bg-red-500/30" /> Bleed
          </div>
        )}
        <div className="flex items-center gap-1.5 text-[10px] text-white/35">
          <div className="w-3 h-0.5 bg-emerald-500/40" /> Spine
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-white/35">
          <div className="w-3 h-0.5 border border-dashed border-blue-400/30" /> Safe Zone
        </div>
        {!isHardcover && (
          <div className="flex items-center gap-1.5 text-[10px] text-white/35">
            <div className="w-3 h-0.5 border border-dashed border-purple-400/30" /> Barcode
          </div>
        )}
        {isHardcover && (
          <div className="flex items-center gap-1.5 text-[10px] text-white/35">
            <div className="w-3 h-0.5 border border-dashed border-amber-400/30" /> Hinge/Wrap
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Kindle Visualization ───────────────────────────────────────────────────

function KindleVisualization() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h3 className="text-xs text-white/40 uppercase tracking-wider mb-6">
        Kindle Digital Preview
      </h3>

      {/* Device frame */}
      <div className="relative">
        <svg width="280" height="380" viewBox="0 0 280 380" className="text-white">
          {/* Device body */}
          <rect
            x="20" y="10"
            width="240" height="360"
            rx="16" ry="16"
            fill="rgba(255,255,255,0.03)"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="1.5"
          />

          {/* Screen area */}
          <rect
            x="36" y="36"
            width="208" height="290"
            rx="2" ry="2"
            fill="rgba(255,255,255,0.02)"
            stroke="rgba(255,255,255,0.06)"
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
              fill="rgba(255,255,255,0.06)"
            />
          ))}

          {/* Title text */}
          <text x="140" y="46" textAnchor="middle" className="text-[8px]" fill="rgba(255,255,255,0.3)">
            Chapter Title
          </text>

          {/* Page indicator */}
          <text x="140" y="352" textAnchor="middle" className="text-[7px]" fill="rgba(255,255,255,0.2)">
            Loc 1234 · 15%
          </text>

          {/* Kindle logo dot */}
          <circle cx="140" cy="340" r="3" fill="rgba(255,255,255,0.08)" />
        </svg>
      </div>

      <div className="flex gap-4 mt-4">
        <div className="flex items-center gap-1.5 text-[10px] text-white/35">
          <Monitor className="w-3 h-3" /> Reflowable Layout
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-white/35">
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
    <div className="bg-emerald-500/[0.08] border border-emerald-500/20 rounded-xl p-3 flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
        <Check className="w-4 h-4 text-emerald-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-emerald-300 font-medium">Auto-detected from import</p>
        <p className="text-[10px] text-white/40">
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
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* ─── LEFT: Config Panel ─── */}
      <div className="lg:w-[400px] xl:w-[440px] shrink-0 flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-200px)] pr-1 custom-scrollbar">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400">
            {bookTypeIcon}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white/90">Configure</h2>
            <p className="text-xs text-white/40">{bookTypeLabel} — set your book specifications</p>
          </div>
        </div>

        {/* Auto-fill banner */}
        <AutoFillBanner />

        {/* Context-aware config cards */}
        {isKindle ? <KindleConfigCards /> : <PrintConfigCards isHardcover={isHardcover} />}

        {/* Measurements Display */}
        <MeasurementsDisplay />

        {/* Navigation */}
        <div className="flex gap-3 pt-2 pb-4">
          <button
            onClick={() => setCheckerStep('import')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-xs text-white/50 hover:text-white/70 transition-all duration-200"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Import
          </button>
          <button
            onClick={() => setCheckerStep('preview')}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-medium text-xs transition-all duration-200 shadow-lg shadow-emerald-500/20"
          >
            Start Preview
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ─── RIGHT: Live Visualization ─── */}
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-8 w-full h-full min-h-[500px] flex items-center justify-center">
          <CoverVisualization />
        </div>
      </div>
    </div>
  );
}
