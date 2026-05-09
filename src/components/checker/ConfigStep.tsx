'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  BookOpen,
  Ruler,
  FileText,
  Layers,
  ArrowLeft,
  ArrowRight,
  Info,
  RotateCcw,
  Package,
  BookMarked,
  Grid3X3,
  Shield,
  type LucideIcon,
} from 'lucide-react';
import { useAppStore } from '@/store/use-app-store';
import {
  BookConfig,
  TrimSizeKey,
  CalculatedMeasurements,
  KDPFormat,
  PaperType,
  InteriorType,
  DetectedMetadata,
} from '@/types/kdp';
import {
  TRIM_SIZES,
  WRAP_AROUND_IN,
  SAFE_AREA_IN,
  BARCODE_AREA,
} from '@/engine/kdp-constants';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

// ─── Animation Variants ───────────────────────

const cardVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.06,
      duration: 0.45,
      ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number],
    },
  }),
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.97,
    transition: { duration: 0.25 },
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
  exit: { opacity: 0 },
};

// ─── Config Card Component ────────────────────

interface ConfigCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  helpText: string;
  children?: React.ReactNode;
  index?: number;
}

function ConfigCard({ icon: Icon, label, value, helpText, children, index = 0 }: ConfigCardProps) {
  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 hover:bg-white/[0.05] hover:border-white/[0.1] transition-colors duration-300"
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center shrink-0 mt-0.5">
          <Icon className="w-4 h-4 text-white/50" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-sm font-medium text-white/80">{label}</span>
            <span className="text-xs text-white/40 truncate">{value}</span>
          </div>
          {children && <div className="mt-2">{children}</div>}
          <div className="flex items-start gap-1.5 mt-2.5">
            <Info className="w-3 h-3 text-white/20 mt-0.5 shrink-0" />
            <p className="text-[11px] text-white/30 leading-relaxed">{helpText}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Toggle Control ───────────────────────────

interface ToggleControlProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  labels?: [string, string];
}

function ToggleControl({ enabled, onToggle, labels = ['No', 'Yes'] }: ToggleControlProps) {
  return (
    <div className="flex items-center gap-2">
      <span className={`text-xs ${!enabled ? 'text-white/50' : 'text-white/25'}`}>
        {labels[0]}
      </span>
      <Switch
        checked={enabled}
        onCheckedChange={onToggle}
        className="data-[state=checked]:bg-emerald-500/70 data-[state=unchecked]:bg-white/10"
      />
      <span className={`text-xs ${enabled ? 'text-white/50' : 'text-white/25'}`}>
        {labels[1]}
      </span>
    </div>
  );
}

// ─── Segmented Selector ───────────────────────

interface SegmentedSelectorProps<T extends string> {
  options: { value: T; label: string }[];
  selected: T;
  onSelect: (value: T) => void;
}

function SegmentedSelector<T extends string>({
  options,
  selected,
  onSelect,
}: SegmentedSelectorProps<T>) {
  return (
    <div className="flex rounded-lg bg-white/[0.04] border border-white/[0.06] p-0.5 gap-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onSelect(opt.value)}
          className={`relative px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
            selected === opt.value
              ? 'bg-white/[0.1] text-white/80 shadow-sm'
              : 'text-white/30 hover:text-white/50'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ─── Kindle Config ────────────────────────────

function KindleConfig({
  bookConfig,
  updateBookConfig,
  detectedMetadata,
}: {
  bookConfig: BookConfig;
  updateBookConfig: (updates: Partial<BookConfig>) => void;
  detectedMetadata: DetectedMetadata | null;
}) {
  const [layoutType, setLayoutType] = React.useState<'reflowable' | 'fixed'>('reflowable');
  const [embeddedFonts, setEmbeddedFonts] = React.useState(true);
  const [imageScaling, setImageScaling] = React.useState<'fit' | 'original'>('fit');
  const [tocIncluded, setTocIncluded] = React.useState(true);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-3"
    >
      <ConfigCard
        icon={Layers}
        label="Layout Type"
        value={layoutType === 'reflowable' ? 'Reflowable' : 'Fixed Layout'}
        helpText="Reflowable text adjusts to the reader's device. Fixed layout preserves exact positioning — best for illustrated books."
        index={0}
      >
        <SegmentedSelector
          options={[
            { value: 'reflowable' as const, label: 'Reflowable' },
            { value: 'fixed' as const, label: 'Fixed Layout' },
          ]}
          selected={layoutType}
          onSelect={setLayoutType}
        />
      </ConfigCard>

      <ConfigCard
        icon={BookOpen}
        label="Embedded Fonts"
        value={embeddedFonts ? 'Included' : 'Not included'}
        helpText="Embedded fonts ensure your book looks the same on every device. Without them, Kindle substitutes default fonts."
        index={1}
      >
        <ToggleControl
          enabled={embeddedFonts}
          onToggle={setEmbeddedFonts}
          labels={['None', 'Embedded']}
        />
      </ConfigCard>

      <ConfigCard
        icon={Grid3X3}
        label="Image Scaling"
        value={imageScaling === 'fit' ? 'Fit to Screen' : 'Original Size'}
        helpText="Fit-to-screen scales images to the reader's display. Original preserves exact dimensions but may require scrolling."
        index={2}
      >
        <SegmentedSelector
          options={[
            { value: 'fit' as const, label: 'Fit to Screen' },
            { value: 'original' as const, label: 'Original' },
          ]}
          selected={imageScaling}
          onSelect={setImageScaling}
        />
      </ConfigCard>

      <ConfigCard
        icon={FileText}
        label="Navigation / TOC"
        value={tocIncluded ? 'Included' : 'Missing'}
        helpText="A Table of Contents helps readers navigate. Kindle requires a logical TOC for most books."
        index={3}
      >
        <ToggleControl
          enabled={tocIncluded}
          onToggle={setTocIncluded}
          labels={['Missing', 'Included']}
        />
      </ConfigCard>
    </motion.div>
  );
}

// ─── Paperback Config ─────────────────────────

function PaperbackConfig({
  bookConfig,
  updateBookConfig,
  measurements,
  detectedMetadata,
}: {
  bookConfig: BookConfig;
  updateBookConfig: (updates: Partial<BookConfig>) => void;
  measurements: CalculatedMeasurements;
  detectedMetadata: DetectedMetadata | null;
}) {
  const trimOptions = Object.entries(TRIM_SIZES)
    .filter(([key]) => key !== 'custom')
    .map(([key, ts]) => ({
      value: key as TrimSizeKey,
      label: ts.label,
    }));

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-3"
    >
      {/* Trim Size */}
      <ConfigCard
        icon={Ruler}
        label="Trim Size"
        value={TRIM_SIZES[bookConfig.trimSize]?.label || 'Custom'}
        helpText="Must match your manuscript's page dimensions exactly. KDP uses this for printing and cover templates."
        index={0}
      >
        <Select
          value={bookConfig.trimSize}
          onValueChange={(val) => updateBookConfig({ trimSize: val as TrimSizeKey })}
        >
          <SelectTrigger className="w-full h-8 text-xs bg-white/[0.04] border-white/[0.08] text-white/70 hover:bg-white/[0.06]">
            <SelectValue placeholder="Select trim size" />
          </SelectTrigger>
          <SelectContent className="bg-[#111] border-white/[0.08]">
            {trimOptions.map((opt) => (
              <SelectItem
                key={opt.value}
                value={opt.value}
                className="text-xs text-white/70 focus:bg-white/[0.08] focus:text-white/90"
              >
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </ConfigCard>

      {/* Bleed */}
      <ConfigCard
        icon={Layers}
        label="Bleed"
        value={bookConfig.bleed === 'bleed' ? 'Enabled' : 'Disabled'}
        helpText={
          bookConfig.bleed === 'bleed'
            ? 'Recommended if artwork touches the edge of the page. Adds 0.125" on each side.'
            : 'Enable bleed if your artwork extends to the page edge. Without bleed, white borders may appear.'
        }
        index={1}
      >
        <ToggleControl
          enabled={bookConfig.bleed === 'bleed'}
          onToggle={(enabled) =>
            updateBookConfig({ bleed: enabled ? 'bleed' : 'no-bleed' })
          }
          labels={['No Bleed', 'Bleed']}
        />
      </ConfigCard>

      {/* Spine Width */}
      <ConfigCard
        icon={BookMarked}
        label="Spine Width"
        value={`${measurements.spineWidthIn.toFixed(3)}"`}
        helpText="Calculated automatically based on page count and paper type. This determines your cover's center strip width."
        index={2}
      >
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06]">
          <span className="text-sm text-white/60 font-mono">
            {measurements.spineWidthIn.toFixed(3)}"
          </span>
          <span className="text-[10px] text-white/20 ml-auto">Auto-calculated</span>
        </div>
      </ConfigCard>

      {/* Paper Type */}
      <ConfigCard
        icon={Package}
        label="Paper Type"
        value={
          bookConfig.paper === 'white'
            ? 'White'
            : bookConfig.paper === 'cream'
              ? 'Cream'
              : 'Premium Color'
        }
        helpText="Paper type affects spine width and print quality. Cream is warmer and thicker; premium color is for full-color interiors."
        index={3}
      >
        <SegmentedSelector
          options={[
            { value: 'white' as const, label: 'White' },
            { value: 'cream' as const, label: 'Cream' },
            { value: 'premium-color' as const, label: 'Premium' },
          ]}
          selected={bookConfig.paper}
          onSelect={(val) => updateBookConfig({ paper: val as PaperType })}
        />
      </ConfigCard>

      {/* Page Count */}
      <ConfigCard
        icon={FileText}
        label="Page Count"
        value={`${bookConfig.pageCount} pages`}
        helpText="Must be between 24 and 828 pages for paperback. Even numbers only — blank pages are added if needed."
        index={4}
      >
        <Input
          type="number"
          min={24}
          max={828}
          value={bookConfig.pageCount}
          onChange={(e) => {
            const val = parseInt(e.target.value, 10);
            if (!isNaN(val) && val >= 24 && val <= 828) {
              updateBookConfig({ pageCount: val });
            }
          }}
          className="h-8 text-xs bg-white/[0.04] border-white/[0.08] text-white/70 hover:bg-white/[0.06] font-mono"
        />
      </ConfigCard>

      {/* Margin Safety */}
      <ConfigCard
        icon={Shield}
        label="Margin Safety"
        value={`${SAFE_AREA_IN}" inside margin`}
        helpText={`Keep all important content at least 0.25" away from the trim edge. The safe zone is shown in the template preview.`}
        index={5}
      >
        <div className="flex items-center gap-3 text-[11px] text-white/30">
          <span>Safe area: {SAFE_AREA_IN}" from edge</span>
          <span className="text-white/10">|</span>
          <span>Gutter: 0.375" minimum</span>
        </div>
      </ConfigCard>

      {/* Interior Type */}
      <ConfigCard
        icon={BookOpen}
        label="Interior Type"
        value={
          bookConfig.interior === 'black-white'
            ? 'Black & White'
            : bookConfig.interior === 'standard-color'
              ? 'Standard Color'
              : 'Premium Color'
        }
        helpText="Affects printing costs and quality. Premium color uses heavier paper and higher-quality inks."
        index={6}
      >
        <SegmentedSelector
          options={[
            { value: 'black-white' as const, label: 'B&W' },
            { value: 'standard-color' as const, label: 'Standard' },
            { value: 'premium-color' as const, label: 'Premium' },
          ]}
          selected={bookConfig.interior}
          onSelect={(val) => updateBookConfig({ interior: val as InteriorType })}
        />
      </ConfigCard>
    </motion.div>
  );
}

// ─── Hardcover Config ─────────────────────────

function HardcoverConfig({
  bookConfig,
  updateBookConfig,
  measurements,
  detectedMetadata,
}: {
  bookConfig: BookConfig;
  updateBookConfig: (updates: Partial<BookConfig>) => void;
  measurements: CalculatedMeasurements;
  detectedMetadata: DetectedMetadata | null;
}) {
  const trimOptions = Object.entries(TRIM_SIZES)
    .filter(([key]) => key !== 'custom')
    .map(([key, ts]) => ({
      value: key as TrimSizeKey,
      label: ts.label,
    }));

  const [caseLaminate, setCaseLaminate] = React.useState<'matte' | 'glossy'>('matte');
  const [dustJacket, setDustJacket] = React.useState(false);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-3"
    >
      {/* Trim Size */}
      <ConfigCard
        icon={Ruler}
        label="Trim Size"
        value={TRIM_SIZES[bookConfig.trimSize]?.label || 'Custom'}
        helpText="Must match your manuscript's page dimensions exactly. KDP uses this for printing and cover templates."
        index={0}
      >
        <Select
          value={bookConfig.trimSize}
          onValueChange={(val) => updateBookConfig({ trimSize: val as TrimSizeKey })}
        >
          <SelectTrigger className="w-full h-8 text-xs bg-white/[0.04] border-white/[0.08] text-white/70 hover:bg-white/[0.06]">
            <SelectValue placeholder="Select trim size" />
          </SelectTrigger>
          <SelectContent className="bg-[#111] border-white/[0.08]">
            {trimOptions.map((opt) => (
              <SelectItem
                key={opt.value}
                value={opt.value}
                className="text-xs text-white/70 focus:bg-white/[0.08] focus:text-white/90"
              >
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </ConfigCard>

      {/* Bleed */}
      <ConfigCard
        icon={Layers}
        label="Bleed"
        value={bookConfig.bleed === 'bleed' ? 'Enabled' : 'Disabled'}
        helpText={
          bookConfig.bleed === 'bleed'
            ? 'Recommended if artwork touches the edge of the page. Adds 0.125" on each side.'
            : 'Enable bleed if your artwork extends to the page edge. Without bleed, white borders may appear.'
        }
        index={1}
      >
        <ToggleControl
          enabled={bookConfig.bleed === 'bleed'}
          onToggle={(enabled) =>
            updateBookConfig({ bleed: enabled ? 'bleed' : 'no-bleed' })
          }
          labels={['No Bleed', 'Bleed']}
        />
      </ConfigCard>

      {/* Spine Width */}
      <ConfigCard
        icon={BookMarked}
        label="Spine Width"
        value={`${measurements.spineWidthIn.toFixed(3)}"`}
        helpText="Calculated automatically based on page count and paper type. Hardcovers may have additional spine adjustments."
        index={2}
      >
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06]">
          <span className="text-sm text-white/60 font-mono">
            {measurements.spineWidthIn.toFixed(3)}"
          </span>
          <span className="text-[10px] text-white/20 ml-auto">Auto-calculated</span>
        </div>
      </ConfigCard>

      {/* Paper Type */}
      <ConfigCard
        icon={Package}
        label="Paper Type"
        value={
          bookConfig.paper === 'white'
            ? 'White'
            : bookConfig.paper === 'cream'
              ? 'Cream'
              : 'Premium Color'
        }
        helpText="Paper type affects spine width and print quality. Premium color uses heavier paper for vivid results."
        index={3}
      >
        <SegmentedSelector
          options={[
            { value: 'white' as const, label: 'White' },
            { value: 'cream' as const, label: 'Cream' },
            { value: 'premium-color' as const, label: 'Premium' },
          ]}
          selected={bookConfig.paper}
          onSelect={(val) => updateBookConfig({ paper: val as PaperType })}
        />
      </ConfigCard>

      {/* Page Count */}
      <ConfigCard
        icon={FileText}
        label="Page Count"
        value={`${bookConfig.pageCount} pages`}
        helpText="Must be between 24 and 550 pages for hardcover. Even numbers only — blank pages are added if needed."
        index={4}
      >
        <Input
          type="number"
          min={24}
          max={550}
          value={bookConfig.pageCount}
          onChange={(e) => {
            const val = parseInt(e.target.value, 10);
            if (!isNaN(val) && val >= 24 && val <= 550) {
              updateBookConfig({ pageCount: val });
            }
          }}
          className="h-8 text-xs bg-white/[0.04] border-white/[0.08] text-white/70 hover:bg-white/[0.06] font-mono"
        />
      </ConfigCard>

      {/* Margin Safety */}
      <ConfigCard
        icon={Shield}
        label="Margin Safety"
        value={`${SAFE_AREA_IN}" inside margin`}
        helpText={`Keep all important content at least 0.25" away from the trim edge. The safe zone is shown in the template preview.`}
        index={5}
      >
        <div className="flex items-center gap-3 text-[11px] text-white/30">
          <span>Safe area: {SAFE_AREA_IN}" from edge</span>
          <span className="text-white/10">|</span>
          <span>Gutter: 0.375" minimum</span>
        </div>
      </ConfigCard>

      {/* Interior Type */}
      <ConfigCard
        icon={BookOpen}
        label="Interior Type"
        value={
          bookConfig.interior === 'black-white'
            ? 'Black & White'
            : bookConfig.interior === 'standard-color'
              ? 'Standard Color'
              : 'Premium Color'
        }
        helpText="Affects printing costs and quality. Premium color uses heavier paper and higher-quality inks."
        index={6}
      >
        <SegmentedSelector
          options={[
            { value: 'black-white' as const, label: 'B&W' },
            { value: 'standard-color' as const, label: 'Standard' },
            { value: 'premium-color' as const, label: 'Premium' },
          ]}
          selected={bookConfig.interior}
          onSelect={(val) => updateBookConfig({ interior: val as InteriorType })}
        />
      </ConfigCard>

      {/* Hinge Width */}
      <ConfigCard
        icon={BookMarked}
        label="Hinge Width"
        value={'0.375"'}
        helpText="The hinge allows the cover to open. Keep important content away from this area."
        index={7}
      >
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06]">
          <span className="text-sm text-white/60 font-mono">0.375"</span>
          <span className="text-[10px] text-white/20 ml-auto">Standard KDP hinge</span>
        </div>
      </ConfigCard>

      {/* Wrap Area */}
      <ConfigCard
        icon={Layers}
        label="Wrap Area"
        value={`${WRAP_AROUND_IN}" per side`}
        helpText={`The wrap-around extends the cover around the book board. 0.0625" is added on each side of the cover.`}
        index={8}
      >
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06]">
          <span className="text-sm text-white/60 font-mono">
            {WRAP_AROUND_IN}" × 2 sides
          </span>
          <span className="text-[10px] text-white/20 ml-auto">0.0625" per side</span>
        </div>
      </ConfigCard>

      {/* Case Laminate */}
      <ConfigCard
        icon={Settings}
        label="Case Laminate"
        value={caseLaminate === 'matte' ? 'Matte' : 'Glossy'}
        helpText="Matte gives a smooth, elegant finish. Glossy is vibrant and reflective. This affects the cover's final look."
        index={9}
      >
        <SegmentedSelector
          options={[
            { value: 'matte' as const, label: 'Matte' },
            { value: 'glossy' as const, label: 'Glossy' },
          ]}
          selected={caseLaminate}
          onSelect={setCaseLaminate}
        />
      </ConfigCard>

      {/* Dust Jacket */}
      <ConfigCard
        icon={Package}
        label="Dust Jacket"
        value={dustJacket ? 'Included' : 'Not included'}
        helpText="A dust jacket wraps around the hardcover. If included, the jacket has its own template with flaps."
        index={10}
      >
        <ToggleControl
          enabled={dustJacket}
          onToggle={setDustJacket}
          labels={['None', 'Included']}
        />
        {dustJacket && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 px-3 py-2 rounded-lg bg-emerald-500/[0.06] border border-emerald-500/[0.12]"
          >
            <div className="flex items-start gap-1.5">
              <Info className="w-3 h-3 text-emerald-400/60 mt-0.5 shrink-0" />
              <div className="text-[10px] text-emerald-400/50 leading-relaxed space-y-1">
                <p>Dust jacket dimensions include front flap (3.5") and back flap (3.5")</p>
                <p>
                  Total width:{' '}
                  {(
                    measurements.trimWidthIn +
                    measurements.spineWidthIn +
                    measurements.trimWidthIn +
                    3.5 +
                    3.5 +
                    measurements.bleedIn * 2
                  ).toFixed(3)}
                  " × {measurements.fullCoverHeightIn.toFixed(3)}"
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </ConfigCard>

      {/* Hardcover spine adjustments info */}
      <ConfigCard
        icon={Info}
        label="Spine Adjustments"
        value="Hardcover specific"
        helpText="Hardcover spines include the board thickness and may vary slightly from calculated values. KDP will confirm exact dimensions."
        index={11}
      >
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06]">
          <span className="text-[11px] text-white/30">
            Board thickness: ~0.08&quot; per side added to spine calculation
          </span>
        </div>
      </ConfigCard>
    </motion.div>
  );
}

// ─── Live SVG Visualization ───────────────────

function CoverTemplateSVG({
  kdpFormat,
  bookConfig,
  measurements,
}: {
  kdpFormat: KDPFormat;
  bookConfig: BookConfig;
  measurements: CalculatedMeasurements;
}) {
  // Scale: pixels per inch for the SVG display
  const scale = 36;

  const { trimWidthIn, trimHeightIn, bleedIn, spineWidthIn, safeAreaIn, wrapAroundIn, barcodeAreaIn } =
    measurements;

  const hasBleed = bookConfig.bleed === 'bleed';
  const isHardcover = kdpFormat === 'hardcover';
  const isPaperback = kdpFormat === 'paperback';
  const hingeWidthIn = isHardcover ? 0.375 : 0;

  // Full cover dimensions (front + spine + back)
  const totalWidthIn = trimWidthIn * 2 + spineWidthIn + bleedIn * 2 + wrapAroundIn * 2;
  const totalHeightIn = trimHeightIn + bleedIn * 2 + wrapAroundIn * 2;

  // SVG dimensions
  const svgWidth = totalWidthIn * scale;
  const svgHeight = totalHeightIn * scale;

  // Padding for labels
  const pad = 20;
  const fullW = svgWidth + pad * 2;
  const fullH = svgHeight + pad * 2 + 24;

  // Helper: inches to SVG x/y
  const ix = (inches: number) => pad + inches * scale;
  const iy = (inches: number) => pad + inches * scale;

  // Key x positions (from left)
  const wrapLeft = 0;
  const bleedLeft = wrapAroundIn;
  const backCoverLeft = wrapAroundIn + bleedIn;
  const spineLeft = backCoverLeft + trimWidthIn;
  const frontCoverLeft = spineLeft + spineWidthIn;
  const frontCoverRight = frontCoverLeft + trimWidthIn;
  const bleedRight = frontCoverRight + bleedIn;
  const wrapRight = bleedRight + wrapAroundIn;

  // Key y positions
  const wrapTop = 0;
  const bleedTop = wrapAroundIn;
  const contentTop = wrapAroundIn + bleedIn;
  const contentBottom = contentTop + trimHeightIn;
  const bleedBottom = contentBottom + bleedIn;
  const wrapBottom = bleedBottom + wrapAroundIn;

  // Hinge positions (hardcover only)
  const hingeBackRight = backCoverLeft + hingeWidthIn;
  const hingeFrontLeft = frontCoverLeft;
  const hingeFrontRight = frontCoverLeft + hingeWidthIn;
  const hingeBackLeft = backCoverLeft;

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${fullW} ${fullH}`}
      className="max-h-full"
      style={{ transition: 'all 0.5s cubic-bezier(0.25, 0.4, 0.25, 1)' }}
    >
      <defs>
        {/* Grid pattern */}
        <pattern id="grid" width={scale / 4} height={scale / 4} patternUnits="userSpaceOnUse">
          <path
            d={`M ${scale / 4} 0 L 0 0 0 ${scale / 4}`}
            fill="none"
            stroke="rgba(255,255,255,0.03)"
            strokeWidth="0.5"
          />
        </pattern>
        <pattern id="gridMajor" width={scale} height={scale} patternUnits="userSpaceOnUse">
          <path
            d={`M ${scale} 0 L 0 0 0 ${scale}`}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="0.5"
          />
        </pattern>

        {/* Bleed pattern */}
        <pattern id="bleedPattern" width={8} height={8} patternUnits="userSpaceOnUse">
          <line x1="0" y1="8" x2="8" y2="0" stroke="rgba(239,68,68,0.2)" strokeWidth="0.5" />
        </pattern>

        {/* Hinge pattern */}
        <pattern id="hingePattern" width={6} height={6} patternUnits="userSpaceOnUse">
          <line x1="0" y1="6" x2="6" y2="0" stroke="rgba(251,191,36,0.2)" strokeWidth="0.5" />
        </pattern>
      </defs>

      {/* Background grid */}
      <rect x={pad} y={pad} width={svgWidth} height={svgHeight} fill="url(#grid)" rx="2" />
      <rect x={pad} y={pad} width={svgWidth} height={svgHeight} fill="url(#gridMajor)" rx="2" />

      {/* Wrap area (hardcover) */}
      {isHardcover && wrapAroundIn > 0 && (
        <g>
          {/* Left wrap */}
          <rect
            x={ix(wrapLeft)}
            y={iy(wrapTop)}
            width={wrapAroundIn * scale}
            height={totalHeightIn * scale}
            fill="rgba(139,92,246,0.06)"
            stroke="rgba(139,92,246,0.15)"
            strokeWidth="0.5"
            strokeDasharray="3 2"
            rx="1"
            style={{ transition: 'all 0.4s ease' }}
          />
          {/* Right wrap */}
          <rect
            x={ix(bleedRight)}
            y={iy(wrapTop)}
            width={wrapAroundIn * scale}
            height={totalHeightIn * scale}
            fill="rgba(139,92,246,0.06)"
            stroke="rgba(139,92,246,0.15)"
            strokeWidth="0.5"
            strokeDasharray="3 2"
            rx="1"
            style={{ transition: 'all 0.4s ease' }}
          />
          {/* Top wrap */}
          <rect
            x={ix(wrapLeft)}
            y={iy(wrapTop)}
            width={totalWidthIn * scale}
            height={wrapAroundIn * scale}
            fill="rgba(139,92,246,0.06)"
            stroke="rgba(139,92,246,0.15)"
            strokeWidth="0.5"
            strokeDasharray="3 2"
            rx="1"
            style={{ transition: 'all 0.4s ease' }}
          />
          {/* Bottom wrap */}
          <rect
            x={ix(wrapLeft)}
            y={iy(bleedBottom)}
            width={totalWidthIn * scale}
            height={wrapAroundIn * scale}
            fill="rgba(139,92,246,0.06)"
            stroke="rgba(139,92,246,0.15)"
            strokeWidth="0.5"
            strokeDasharray="3 2"
            rx="1"
            style={{ transition: 'all 0.4s ease' }}
          />
        </g>
      )}

      {/* Bleed area (if enabled) */}
      {hasBleed && (
        <g>
          {/* Left bleed */}
          <rect
            x={ix(bleedLeft)}
            y={iy(bleedTop)}
            width={bleedIn * scale}
            height={trimHeightIn * scale + bleedIn * 2 * scale}
            fill="url(#bleedPattern)"
            stroke="rgba(239,68,68,0.25)"
            strokeWidth="0.5"
            style={{ transition: 'all 0.4s ease' }}
          />
          {/* Right bleed */}
          <rect
            x={ix(frontCoverRight)}
            y={iy(bleedTop)}
            width={bleedIn * scale}
            height={trimHeightIn * scale + bleedIn * 2 * scale}
            fill="url(#bleedPattern)"
            stroke="rgba(239,68,68,0.25)"
            strokeWidth="0.5"
            style={{ transition: 'all 0.4s ease' }}
          />
          {/* Top bleed */}
          <rect
            x={ix(bleedLeft)}
            y={iy(bleedTop)}
            width={(trimWidthIn * 2 + spineWidthIn + bleedIn * 2) * scale}
            height={bleedIn * scale}
            fill="url(#bleedPattern)"
            stroke="rgba(239,68,68,0.25)"
            strokeWidth="0.5"
            style={{ transition: 'all 0.4s ease' }}
          />
          {/* Bottom bleed */}
          <rect
            x={ix(bleedLeft)}
            y={iy(contentBottom)}
            width={(trimWidthIn * 2 + spineWidthIn + bleedIn * 2) * scale}
            height={bleedIn * scale}
            fill="url(#bleedPattern)"
            stroke="rgba(239,68,68,0.25)"
            strokeWidth="0.5"
            style={{ transition: 'all 0.4s ease' }}
          />
        </g>
      )}

      {/* Back Cover */}
      <rect
        x={ix(backCoverLeft)}
        y={iy(contentTop)}
        width={trimWidthIn * scale}
        height={trimHeightIn * scale}
        fill="rgba(255,255,255,0.04)"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth="1"
        rx="1"
        style={{ transition: 'all 0.4s ease' }}
      />

      {/* Spine */}
      <rect
        x={ix(spineLeft)}
        y={iy(contentTop)}
        width={spineWidthIn * scale}
        height={trimHeightIn * scale}
        fill="rgba(251,191,36,0.08)"
        stroke="rgba(251,191,36,0.3)"
        strokeWidth="1"
        rx="0.5"
        style={{ transition: 'all 0.4s ease' }}
      />

      {/* Front Cover */}
      <rect
        x={ix(frontCoverLeft)}
        y={iy(contentTop)}
        width={trimWidthIn * scale}
        height={trimHeightIn * scale}
        fill="rgba(255,255,255,0.04)"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth="1"
        rx="1"
        style={{ transition: 'all 0.4s ease' }}
      />

      {/* Hinge areas (hardcover only) */}
      {isHardcover && (
        <g>
          {/* Back cover hinge */}
          <rect
            x={ix(hingeBackLeft)}
            y={iy(contentTop)}
            width={hingeWidthIn * scale}
            height={trimHeightIn * scale}
            fill="url(#hingePattern)"
            stroke="rgba(251,191,36,0.25)"
            strokeWidth="0.5"
            strokeDasharray="4 2"
            style={{ transition: 'all 0.4s ease' }}
          />
          {/* Front cover hinge */}
          <rect
            x={ix(hingeFrontRight - hingeWidthIn)}
            y={iy(contentTop)}
            width={hingeWidthIn * scale}
            height={trimHeightIn * scale}
            fill="url(#hingePattern)"
            stroke="rgba(251,191,36,0.25)"
            strokeWidth="0.5"
            strokeDasharray="4 2"
            style={{ transition: 'all 0.4s ease' }}
          />
        </g>
      )}

      {/* Safe zone - back cover */}
      <rect
        x={ix(backCoverLeft + safeAreaIn)}
        y={iy(contentTop + safeAreaIn)}
        width={(trimWidthIn - safeAreaIn * 2) * scale}
        height={(trimHeightIn - safeAreaIn * 2) * scale}
        fill="none"
        stroke="rgba(52,211,153,0.25)"
        strokeWidth="0.75"
        strokeDasharray="6 3"
        rx="1"
        style={{ transition: 'all 0.4s ease' }}
      />

      {/* Safe zone - front cover */}
      <rect
        x={ix(frontCoverLeft + safeAreaIn)}
        y={iy(contentTop + safeAreaIn)}
        width={(trimWidthIn - safeAreaIn * 2) * scale}
        height={(trimHeightIn - safeAreaIn * 2) * scale}
        fill="none"
        stroke="rgba(52,211,153,0.25)"
        strokeWidth="0.75"
        strokeDasharray="6 3"
        rx="1"
        style={{ transition: 'all 0.4s ease' }}
      />

      {/* Barcode zone (paperback only) */}
      {isPaperback && (
        <rect
          x={ix(frontCoverLeft + barcodeAreaIn.x)}
          y={iy(contentTop + barcodeAreaIn.y)}
          width={barcodeAreaIn.width * scale}
          height={barcodeAreaIn.height * scale}
          fill="rgba(139,92,246,0.08)"
          stroke="rgba(139,92,246,0.3)"
          strokeWidth="0.75"
          strokeDasharray="3 2"
          rx="1"
          style={{ transition: 'all 0.4s ease' }}
        />
      )}

      {/* Labels */}
      <g className="text-[9px] fill-white/25" style={{ fontSize: '9px', fontFamily: 'ui-monospace, monospace' }}>
        {/* Back Cover label */}
        <text
          x={ix(backCoverLeft + trimWidthIn / 2)}
          y={iy(contentTop + trimHeightIn / 2) - 6}
          textAnchor="middle"
          fill="rgba(255,255,255,0.3)"
        >
          BACK
        </text>
        <text
          x={ix(backCoverLeft + trimWidthIn / 2)}
          y={iy(contentTop + trimHeightIn / 2) + 6}
          textAnchor="middle"
          fill="rgba(255,255,255,0.15)"
          style={{ fontSize: '7px' }}
        >
          {trimWidthIn}" × {trimHeightIn}"
        </text>

        {/* Spine label */}
        {spineWidthIn * scale > 16 && (
          <text
            x={ix(spineLeft + spineWidthIn / 2)}
            y={iy(contentTop + trimHeightIn / 2)}
            textAnchor="middle"
            fill="rgba(251,191,36,0.5)"
            style={{ fontSize: '7px' }}
          >
            {spineWidthIn.toFixed(3)}"
          </text>
        )}

        {/* Front Cover label */}
        <text
          x={ix(frontCoverLeft + trimWidthIn / 2)}
          y={iy(contentTop + trimHeightIn / 2) - 6}
          textAnchor="middle"
          fill="rgba(255,255,255,0.3)"
        >
          FRONT
        </text>
        <text
          x={ix(frontCoverLeft + trimWidthIn / 2)}
          y={iy(contentTop + trimHeightIn / 2) + 6}
          textAnchor="middle"
          fill="rgba(255,255,255,0.15)"
          style={{ fontSize: '7px' }}
        >
          {trimWidthIn}" × {trimHeightIn}"
        </text>

        {/* Barcode label */}
        {isPaperback && barcodeAreaIn.width * scale > 30 && (
          <text
            x={ix(frontCoverLeft + barcodeAreaIn.x + barcodeAreaIn.width / 2)}
            y={iy(contentTop + barcodeAreaIn.y + barcodeAreaIn.height / 2 + 3)}
            textAnchor="middle"
            fill="rgba(139,92,246,0.4)"
            style={{ fontSize: '6px' }}
          >
            ISBN
          </text>
        )}

        {/* Hinge labels */}
        {isHardcover && hingeWidthIn * scale > 14 && (
          <>
            <text
              x={ix(hingeBackLeft + hingeWidthIn / 2)}
              y={iy(contentTop + trimHeightIn - 8)}
              textAnchor="middle"
              fill="rgba(251,191,36,0.3)"
              style={{ fontSize: '6px' }}
            >
              HINGE
            </text>
            <text
              x={ix(hingeFrontRight - hingeWidthIn / 2)}
              y={iy(contentTop + trimHeightIn - 8)}
              textAnchor="middle"
              fill="rgba(251,191,36,0.3)"
              style={{ fontSize: '6px' }}
            >
              HINGE
            </text>
          </>
        )}

        {/* Wrap labels */}
        {isHardcover && wrapAroundIn * scale > 10 && (
          <>
            <text
              x={ix(wrapLeft + wrapAroundIn / 2)}
              y={iy(wrapTop + totalHeightIn / 2)}
              textAnchor="middle"
              fill="rgba(139,92,246,0.3)"
              style={{ fontSize: '6px' }}
              transform={`rotate(-90, ${ix(wrapLeft + wrapAroundIn / 2)}, ${iy(wrapTop + totalHeightIn / 2)})`}
            >
              WRAP
            </text>
          </>
        )}
      </g>

      {/* Dimension annotations */}
      <g style={{ fontSize: '8px', fontFamily: 'ui-monospace, monospace' }}>
        {/* Full width dimension */}
        <line
          x1={ix(0)}
          y1={iy(totalHeightIn) + 10}
          x2={ix(totalWidthIn)}
          y2={iy(totalHeightIn) + 10}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="0.5"
        />
        <line
          x1={ix(0)}
          y1={iy(totalHeightIn) + 7}
          x2={ix(0)}
          y2={iy(totalHeightIn) + 13}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="0.5"
        />
        <line
          x1={ix(totalWidthIn)}
          y1={iy(totalHeightIn) + 7}
          x2={ix(totalWidthIn)}
          y2={iy(totalHeightIn) + 13}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="0.5"
        />
        <text
          x={ix(totalWidthIn / 2)}
          y={iy(totalHeightIn) + 20}
          textAnchor="middle"
          fill="rgba(255,255,255,0.2)"
        >
          {measurements.fullCoverWidthIn.toFixed(3)}" total width
        </text>
      </g>

      {/* Legend */}
      <g transform={`translate(${pad}, ${pad + svgHeight + 32})`} style={{ fontSize: '8px' }}>
        {/* Trim */}
        <rect x="0" y="-4" width="8" height="8" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" rx="1" />
        <text x="12" y="2" fill="rgba(255,255,255,0.25)">Trim</text>

        {/* Spine */}
        <rect x="52" y="-4" width="8" height="8" fill="rgba(251,191,36,0.15)" stroke="rgba(251,191,36,0.3)" strokeWidth="0.75" rx="1" />
        <text x="64" y="2" fill="rgba(255,255,255,0.25)">Spine</text>

        {/* Safe zone */}
        <rect x="110" y="-4" width="8" height="8" fill="none" stroke="rgba(52,211,153,0.25)" strokeWidth="0.75" strokeDasharray="3 1.5" rx="1" />
        <text x="122" y="2" fill="rgba(255,255,255,0.25)">Safe</text>

        {hasBleed && (
          <>
            <rect x="158" y="-4" width="8" height="8" fill="url(#bleedPattern)" stroke="rgba(239,68,68,0.25)" strokeWidth="0.5" rx="1" />
            <text x="170" y="2" fill="rgba(255,255,255,0.25)">Bleed</text>
          </>
        )}

        {isHardcover && (
          <>
            <rect x={hasBleed ? '210' : '158'} y="-4" width="8" height="8" fill="url(#hingePattern)" stroke="rgba(251,191,36,0.25)" strokeWidth="0.5" strokeDasharray="3 1.5" rx="1" />
            <text x={hasBleed ? '222' : '170'} y="2" fill="rgba(255,255,255,0.25)">Hinge</text>

            <rect x={hasBleed ? '262' : '210'} y="-4" width="8" height="8" fill="rgba(139,92,246,0.08)" stroke="rgba(139,92,246,0.15)" strokeWidth="0.5" strokeDasharray="3 1.5" rx="1" />
            <text x={hasBleed ? '274' : '222'} y="2" fill="rgba(255,255,255,0.25)">Wrap</text>
          </>
        )}

        {isPaperback && (
          <>
            <rect x={hasBleed ? '210' : '158'} y="-4" width="8" height="8" fill="rgba(139,92,246,0.08)" stroke="rgba(139,92,246,0.3)" strokeWidth="0.5" strokeDasharray="3 1.5" rx="1" />
            <text x={hasBleed ? '222' : '170'} y="2" fill="rgba(255,255,255,0.25)">Barcode</text>
          </>
        )}
      </g>
    </svg>
  );
}

// ─── Kindle SVG (simplified) ──────────────────

function KindleSVG() {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 240 340"
      className="max-h-full"
    >
      <defs>
        <pattern id="kindleGrid" width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
        </pattern>
      </defs>

      {/* Device frame */}
      <rect
        x="20"
        y="10"
        width="200"
        height="320"
        fill="rgba(255,255,255,0.03)"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="1.5"
        rx="12"
      />

      {/* Screen */}
      <rect
        x="32"
        y="30"
        width="176"
        height="260"
        fill="rgba(255,255,255,0.04)"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="0.75"
        rx="4"
      />

      {/* Grid inside screen */}
      <rect x="32" y="30" width="176" height="260" fill="url(#kindleGrid)" rx="4" />

      {/* Safe zone */}
      <rect
        x="44"
        y="42"
        width="152"
        height="236"
        fill="none"
        stroke="rgba(52,211,153,0.2)"
        strokeWidth="0.75"
        strokeDasharray="6 3"
        rx="2"
      />

      {/* Title area */}
      <rect
        x="52"
        y="55"
        width="100"
        height="6"
        fill="rgba(255,255,255,0.08)"
        rx="3"
      />
      {/* Text lines */}
      {[80, 95, 110, 125, 140, 155, 170, 185, 200, 215].map((y, i) => (
        <rect
          key={i}
          x="52"
          y={y}
          width={140 - (i === 9 ? 40 : i === 8 ? 60 : 0)}
          height="3"
          fill="rgba(255,255,255,0.04)"
          rx="1.5"
        />
      ))}

      {/* Home button */}
      <circle cx="120" cy="310" r="6" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

      {/* Labels */}
      <text x="120" y="25" textAnchor="middle" fill="rgba(255,255,255,0.2)" style={{ fontSize: '8px', fontFamily: 'ui-monospace, monospace' }}>
        KINDLE
      </text>
      <text x="120" y="48" textAnchor="middle" fill="rgba(52,211,153,0.3)" style={{ fontSize: '7px', fontFamily: 'ui-monospace, monospace' }}>
        Safe zone
      </text>
    </svg>
  );
}

// ─── Main ConfigStep Component ────────────────

export default function ConfigStep() {
  const {
    kdpFormat,
    bookConfig,
    updateBookConfig,
    measurements,
    detectedMetadata,
    setCheckerStep,
  } = useAppStore();

  const formatLabel: Record<KDPFormat, string> = {
    kindle: 'Kindle eBook',
    paperback: 'Paperback',
    hardcover: 'Hardcover',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col h-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-semibold text-white/90 flex items-center gap-2">
            <Settings className="w-5 h-5 text-white/40" />
            Configuration
          </h2>
          <p className="text-xs text-white/30 mt-0.5">
            Review and adjust settings for your {formatLabel[kdpFormat]} — everything is auto-detected, but you can fine-tune.
          </p>
        </div>

        {/* Format badge */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-white/40">
            {formatLabel[kdpFormat]}
          </div>
          <button
            onClick={() => {
              updateBookConfig({
                trimSize: '6x9',
                bleed: 'no-bleed',
                paper: 'white',
                interior: 'black-white',
                pageCount: 100,
                binding: kdpFormat === 'kindle' ? 'paperback' : kdpFormat,
              });
            }}
            className="p-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] transition-colors group"
            title="Reset to defaults"
          >
            <RotateCcw className="w-3.5 h-3.5 text-white/20 group-hover:text-white/40 transition-colors" />
          </button>
        </div>
      </div>

      {/* Main Content: Left config + Right SVG */}
      <div className="flex-1 flex flex-col lg:flex-row gap-5 min-h-0">
        {/* Left: Config Cards */}
        <div className="lg:w-[380px] xl:w-[420px] shrink-0 overflow-y-auto pr-1 max-h-[calc(100vh-220px)] lg:max-h-none custom-scrollbar">
          <AnimatePresence mode="wait">
            {kdpFormat === 'kindle' && (
              <motion.div
                key="kindle-config"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <KindleConfig
                  bookConfig={bookConfig}
                  updateBookConfig={updateBookConfig}
                  detectedMetadata={detectedMetadata}
                />
              </motion.div>
            )}
            {kdpFormat === 'paperback' && (
              <motion.div
                key="paperback-config"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <PaperbackConfig
                  bookConfig={bookConfig}
                  updateBookConfig={updateBookConfig}
                  measurements={measurements}
                  detectedMetadata={detectedMetadata}
                />
              </motion.div>
            )}
            {kdpFormat === 'hardcover' && (
              <motion.div
                key="hardcover-config"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <HardcoverConfig
                  bookConfig={bookConfig}
                  updateBookConfig={updateBookConfig}
                  measurements={measurements}
                  detectedMetadata={detectedMetadata}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Live SVG Visualization */}
        <div className="flex-1 min-h-[300px] lg:min-h-0 bg-white/[0.015] border border-white/[0.04] rounded-2xl overflow-hidden flex items-center justify-center p-4">
          <AnimatePresence mode="wait">
            {kdpFormat === 'kindle' ? (
              <motion.div
                key="kindle-svg"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35 }}
                className="w-full h-full flex items-center justify-center"
              >
                <KindleSVG />
              </motion.div>
            ) : (
              <motion.div
                key={`${kdpFormat}-svg`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35 }}
                className="w-full h-full flex items-center justify-center"
              >
                <CoverTemplateSVG
                  kdpFormat={kdpFormat}
                  bookConfig={bookConfig}
                  measurements={measurements}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/[0.04]">
        <button
          onClick={() => setCheckerStep('import')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-white/40 hover:text-white/60 hover:bg-white/[0.04] transition-all duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <button
          onClick={() => setCheckerStep('preview')}
          className="btn-premium flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-white/[0.08] text-white/80 border border-white/[0.1] hover:bg-white/[0.12] hover:text-white transition-all duration-300"
        >
          Run Checks
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
