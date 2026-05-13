'use client';

import { useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Settings2,
  Ruler,
  BookOpen,
  BadgeCheck,
  ArrowLeft,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { useAppStore } from '@/store/use-app-store';
import {
  TrimSizeKey,
  BleedType,
  PaperType,
  InteriorType,
  BookType,
  ReadingDirection,
  CoverFinish,
  DetectedConfig,
} from '@/types/kdp';
import { TRIM_SIZES, calculateMeasurements, DEFAULT_BOOK_CONFIG, formatInches, HARDCOVER_HINGE_IN } from '@/engine/kdp-constants';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

// ---------------------------------------------------------------------------
// ConfigStep Component
// ---------------------------------------------------------------------------

export default function ConfigStep() {
  const {
    bookConfig,
    measurements,
    updateBookConfig,
    detectedConfig,
    setPreviewFlowStep,
  } = useAppStore();

  const isHardcover = bookConfig.bookType === 'hardcover' || bookConfig.binding === 'hardcover';
  const isKindle = bookConfig.bookType === 'kindle';

  // ---- Handlers ----
  const handleTrimSizeChange = useCallback((value: string) => {
    const key = value as TrimSizeKey;
    if (key === 'custom') {
      updateBookConfig({ trimSize: 'custom', customWidth: 6, customHeight: 9 });
    } else {
      updateBookConfig({ trimSize: key, customWidth: undefined, customHeight: undefined });
    }
  }, [updateBookConfig]);

  const handleBack = useCallback(() => {
    setPreviewFlowStep('import');
  }, [setPreviewFlowStep]);

  const handleGenerate = useCallback(() => {
    setPreviewFlowStep('generate');
  }, [setPreviewFlowStep]);

  const handleReset = useCallback(() => {
    updateBookConfig(DEFAULT_BOOK_CONFIG);
  }, [updateBookConfig]);

  // Check if a field was auto-detected
  const isDetected = useCallback((field: keyof DetectedConfig): boolean => {
    if (!detectedConfig || detectedConfig.confidence < 0.3) return false;
    return detectedConfig[field] !== undefined;
  }, [detectedConfig]);

  return (
    <div className="ds-page-stage h-full overflow-y-auto">
      <div className="mx-auto max-w-6xl px-3 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center space-y-3 mb-8"
        >
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
            <Settings2 className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            Configure Your Book
          </h1>
          <p className="mx-auto max-w-md text-sm text-muted-foreground">
            Review and adjust book settings. Auto-detected values are pre-filled — you can override any field.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ─── Left: Config Cards ─── */}
          <div className="lg:col-span-2 space-y-5">
            {/* Book Type & Binding */}
            <ConfigCard icon={<BookOpen className="w-4 h-4" />} title="Book Type">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="mb-1.5 block text-xs text-muted-foreground">Book Type</Label>
                  <div className="ds-control rounded-lg px-3 py-2.5 text-sm capitalize text-foreground/75">
                    {bookConfig.bookType}
                    {isDetected('bookType') && <DetectedBadge />}
                  </div>
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs text-muted-foreground">Binding</Label>
                  <div className="ds-control rounded-lg px-3 py-2.5 text-sm capitalize text-foreground/75">
                    {bookConfig.binding}
                  </div>
                </div>
              </div>
            </ConfigCard>

            {/* Trim Size */}
            <ConfigCard icon={<Ruler className="w-4 h-4" />} title="Dimensions">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Label className="text-xs text-muted-foreground">Trim Size</Label>
                    {isDetected('trimSize') && <DetectedBadge />}
                  </div>
                  <Select value={bookConfig.trimSize} onValueChange={handleTrimSizeChange}>
                    <SelectTrigger className="ds-control text-foreground/75">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-border bg-popover">
                      {Object.entries(TRIM_SIZES).map(([key, trim]) => (
                        <SelectItem key={key} value={key} className="text-foreground/75 focus:bg-secondary focus:text-foreground">
                          {trim.label}
                          {key !== 'custom' && (
                            <span className="ml-2 text-muted-foreground">
                              ({trim.widthIn}&quot; × {trim.heightIn}&quot;)
                            </span>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {bookConfig.trimSize === 'custom' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="grid gap-4 sm:grid-cols-2"
                  >
                    <div>
                      <Label className="mb-1.5 block text-xs text-muted-foreground">Width (inches)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min={4}
                        max={12}
                        value={bookConfig.customWidth || ''}
                        onChange={(e) => updateBookConfig({ customWidth: parseFloat(e.target.value) || 0 })}
                        className="text-foreground/75"
                      />
                    </div>
                    <div>
                      <Label className="mb-1.5 block text-xs text-muted-foreground">Height (inches)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min={4}
                        max={12}
                        value={bookConfig.customHeight || ''}
                        onChange={(e) => updateBookConfig({ customHeight: parseFloat(e.target.value) || 0 })}
                        className="text-foreground/75"
                      />
                    </div>
                  </motion.div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <Label className="text-xs text-muted-foreground">Bleed</Label>
                      {isDetected('bleed') && <DetectedBadge />}
                    </div>
                    <Select
                      value={bookConfig.bleed}
                      onValueChange={(v) => updateBookConfig({ bleed: v as BleedType })}
                    >
                      <SelectTrigger className="ds-control text-foreground/75">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-border bg-popover">
                        <SelectItem value="no-bleed" className="text-foreground/75 focus:bg-secondary focus:text-foreground">
                          No Bleed
                        </SelectItem>
                        <SelectItem value="bleed" className="text-foreground/75 focus:bg-secondary focus:text-foreground">
                          With Bleed (0.125&quot;)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <Label className="text-xs text-muted-foreground">Page Count</Label>
                      {isDetected('pageCount') && <DetectedBadge />}
                    </div>
                    <Input
                      type="number"
                      min={24}
                      max={828}
                      value={bookConfig.pageCount}
                      onChange={(e) => updateBookConfig({ pageCount: parseInt(e.target.value) || 24 })}
                      className="text-foreground/75"
                    />
                  </div>
                </div>
              </div>
            </ConfigCard>

            {/* Paper & Interior */}
            <ConfigCard icon={<BookOpen className="w-4 h-4" />} title="Paper & Finish">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Label className="text-xs text-muted-foreground">Paper Type</Label>
                    {isDetected('paper') && <DetectedBadge />}
                  </div>
                  <Select
                    value={bookConfig.paper}
                    onValueChange={(v) => updateBookConfig({ paper: v as PaperType })}
                  >
                    <SelectTrigger className="ds-control text-foreground/75">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-border bg-popover">
                      <SelectItem value="white" className="text-foreground/75 focus:bg-secondary focus:text-foreground">
                        White
                      </SelectItem>
                      <SelectItem value="cream" className="text-foreground/75 focus:bg-secondary focus:text-foreground">
                        Cream
                      </SelectItem>
                      <SelectItem value="premium-color" className="text-foreground/75 focus:bg-secondary focus:text-foreground">
                        Premium Color
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs text-muted-foreground">Interior Type</Label>
                  <Select
                    value={bookConfig.interior}
                    onValueChange={(v) => updateBookConfig({ interior: v as InteriorType })}
                  >
                    <SelectTrigger className="ds-control text-foreground/75">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-border bg-popover">
                      <SelectItem value="black-white" className="text-foreground/75 focus:bg-secondary focus:text-foreground">
                        Black & White
                      </SelectItem>
                      <SelectItem value="standard-color" className="text-foreground/75 focus:bg-secondary focus:text-foreground">
                        Standard Color
                      </SelectItem>
                      <SelectItem value="premium-color" className="text-foreground/75 focus:bg-secondary focus:text-foreground">
                        Premium Color
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs text-muted-foreground">Cover Finish</Label>
                  <Select
                    value={bookConfig.coverFinish || 'matte'}
                    onValueChange={(v) => updateBookConfig({ coverFinish: v as CoverFinish })}
                  >
                    <SelectTrigger className="ds-control text-foreground/75">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-border bg-popover">
                      <SelectItem value="matte" className="text-foreground/75 focus:bg-secondary focus:text-foreground">
                        Matte
                      </SelectItem>
                      <SelectItem value="glossy" className="text-foreground/75 focus:bg-secondary focus:text-foreground">
                        Glossy
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs text-muted-foreground">Reading Direction</Label>
                  <Select
                    value={bookConfig.readingDirection || 'ltr'}
                    onValueChange={(v) => updateBookConfig({ readingDirection: v as ReadingDirection })}
                  >
                    <SelectTrigger className="ds-control text-foreground/75">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-border bg-popover">
                      <SelectItem value="ltr" className="text-foreground/75 focus:bg-secondary focus:text-foreground">
                        Left to Right (LTR)
                      </SelectItem>
                      <SelectItem value="rtl" className="text-foreground/75 focus:bg-secondary focus:text-foreground">
                        Right to Left (RTL)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </ConfigCard>
          </div>

          {/* ─── Right: Live Measurements + SVG Diagram ─── */}
          <div className="space-y-5">
            {/* Live Measurements */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm text-foreground/80">
                  <Ruler className="h-4 w-4 text-primary" />
                  Live Measurements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <MeasurementRow label="Trim Size" value={`${formatInches(measurements.trimWidthIn)} × ${formatInches(measurements.trimHeightIn)}`} />
                <MeasurementRow label="Spine Width" value={formatInches(measurements.spineWidthIn)} highlight />
                <MeasurementRow label="Bleed" value={measurements.bleedIn > 0 ? formatInches(measurements.bleedIn) : 'None'} />
                <MeasurementRow label="Wrap-Around" value={formatInches(measurements.wrapAroundIn)} />
                {isHardcover && (
                  <MeasurementRow label="Hinge" value={formatInches(measurements.hingeIn)} />
                )}
                <div className="mt-3 border-t border-border pt-3">
                  <MeasurementRow
                    label="Full Cover"
                    value={`${formatInches(measurements.fullCoverWidthIn)} × ${formatInches(measurements.fullCoverHeightIn)}`}
                    highlight
                  />
                </div>
              </CardContent>
            </Card>

            {/* SVG Cover Diagram */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm text-foreground/80">
                  <BookOpen className="h-4 w-4 text-primary" />
                  Cover Layout
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CoverDiagram
                  trimWidthIn={measurements.trimWidthIn}
                  trimHeightIn={measurements.trimHeightIn}
                  spineWidthIn={measurements.spineWidthIn}
                  bleedIn={measurements.bleedIn}
                  wrapAroundIn={measurements.wrapAroundIn}
                  hingeIn={measurements.hingeIn}
                  isHardcover={isHardcover}
                />
              </CardContent>
            </Card>

            {/* Reset Config */}
            <button
              onClick={handleReset}
              className="flex w-full items-center justify-center gap-2 py-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <RotateCcw className="w-3 h-3" />
              Reset to defaults
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between"
        >
          <Button
            variant="ghost"
            onClick={handleBack}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Import
          </Button>
          <Button
            onClick={handleGenerate}
            className="w-full rounded-xl px-6 py-3 text-sm font-medium sm:w-auto sm:px-8"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Generate 3D Preview
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ConfigCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-sm text-foreground/80">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function MeasurementRow({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`break-words font-mono text-xs sm:text-right ${highlight ? 'font-medium text-primary' : 'text-foreground/70'}`}>
        {value}
      </span>
    </div>
  );
}

function DetectedBadge() {
  return (
    <Badge
      variant="outline"
      className="ml-1 h-4 border-primary/30 px-1.5 py-0 text-[9px] text-primary"
    >
      <BadgeCheck className="w-2.5 h-2.5 mr-0.5" />
      Detected
    </Badge>
  );
}

// ---------------------------------------------------------------------------
// SVG Cover Diagram
// ---------------------------------------------------------------------------

function CoverDiagram({
  trimWidthIn,
  trimHeightIn,
  spineWidthIn,
  bleedIn,
  wrapAroundIn,
  hingeIn,
  isHardcover,
}: {
  trimWidthIn: number;
  trimHeightIn: number;
  spineWidthIn: number;
  bleedIn: number;
  wrapAroundIn: number;
  hingeIn: number;
  isHardcover: boolean;
}) {
  // Calculate proportions
  const fullWidth =
    wrapAroundIn + bleedIn + trimWidthIn + spineWidthIn + trimWidthIn + bleedIn + wrapAroundIn;
  const fullHeight = wrapAroundIn + bleedIn + trimHeightIn + bleedIn + wrapAroundIn;

  const svgWidth = 320;
  const svgHeight = (fullHeight / fullWidth) * svgWidth;
  const scale = svgWidth / fullWidth;

  const toX = (inches: number) => inches * scale;
  const toY = (inches: number) => inches * scale;

  // Regions
  const wrapLeft = { x: 0, w: toX(wrapAroundIn) };
  const backBleedLeft = { x: wrapLeft.x + wrapLeft.w, w: toX(bleedIn) };
  const backTrim = { x: backBleedLeft.x + backBleedLeft.w, w: toX(trimWidthIn) };
  const backBleedRight = { x: backTrim.x + backTrim.w, w: toX(bleedIn) };
  const spine = { x: backBleedRight.x + backBleedRight.w, w: toX(spineWidthIn) };
  const frontBleedLeft = { x: spine.x + spine.w, w: toX(bleedIn) };
  const frontTrim = { x: frontBleedLeft.x + frontBleedLeft.w, w: toX(trimWidthIn) };
  const frontBleedRight = { x: frontTrim.x + frontTrim.w, w: toX(bleedIn) };
  const wrapRight = { x: frontBleedRight.x + frontBleedRight.w, w: toX(wrapAroundIn) };

  const topWrap = { y: 0, h: toY(wrapAroundIn) };
  const topBleed = { y: topWrap.y + topWrap.h, h: toY(bleedIn) };
  const trimV = { y: topBleed.y + topBleed.h, h: toY(trimHeightIn) };
  const bottomBleed = { y: trimV.y + trimV.h, h: toY(bleedIn) };
  const bottomWrap = { y: bottomBleed.y + bottomBleed.h, h: toY(wrapAroundIn) };

  // Hinge regions (inside front/back trim, next to spine)
  const hingeW = isHardcover ? toX(hingeIn) : 0;

  return (
    <svg
      viewBox={`0 0 ${svgWidth} ${svgHeight + 20}`}
      className="h-auto w-full"
      style={{ maxHeight: '200px' }}
    >
      {/* Full cover background */}
      <rect x={0} y={0} width={svgWidth} height={svgHeight} fill="#1a1a2e" rx={4} />

      {/* Back cover area */}
      <rect
        x={backTrim.x}
        y={trimV.y}
        width={backTrim.w}
        height={trimV.h}
        fill="#2a2a3e"
        stroke="#4a4a6a"
        strokeWidth={0.5}
      />

      {/* Spine */}
      <rect
        x={spine.x}
        y={trimV.y}
        width={Math.max(spine.w, 2)}
        height={trimV.h}
        fill="#3a3a5e"
        stroke="#6a6a9a"
        strokeWidth={0.5}
      />

      {/* Front cover area */}
      <rect
        x={frontTrim.x}
        y={trimV.y}
        width={frontTrim.w}
        height={trimV.h}
        fill="#2a2a3e"
        stroke="#4a4a6a"
        strokeWidth={0.5}
      />

      {/* Bleed areas (transparent overlay) */}
      {bleedIn > 0 && (
        <>
          <rect x={backBleedLeft.x} y={topBleed.y} width={backBleedLeft.w} height={trimV.h + topBleed.h + bottomBleed.h} fill="color-mix(in srgb, var(--overlay-bleed) 16%, transparent)" stroke="var(--overlay-bleed)" strokeWidth={0.3} strokeDasharray="2,2" />
          <rect x={backBleedRight.x} y={topBleed.y} width={backBleedRight.w} height={trimV.h + topBleed.h + bottomBleed.h} fill="color-mix(in srgb, var(--overlay-bleed) 16%, transparent)" stroke="var(--overlay-bleed)" strokeWidth={0.3} strokeDasharray="2,2" />
          <rect x={frontBleedLeft.x} y={topBleed.y} width={frontBleedLeft.w} height={trimV.h + topBleed.h + bottomBleed.h} fill="color-mix(in srgb, var(--overlay-bleed) 16%, transparent)" stroke="var(--overlay-bleed)" strokeWidth={0.3} strokeDasharray="2,2" />
          <rect x={frontBleedRight.x} y={topBleed.y} width={frontBleedRight.w} height={trimV.h + topBleed.h + bottomBleed.h} fill="color-mix(in srgb, var(--overlay-bleed) 16%, transparent)" stroke="var(--overlay-bleed)" strokeWidth={0.3} strokeDasharray="2,2" />
          <rect x={wrapLeft.w} y={topBleed.y} width={svgWidth - wrapLeft.w - wrapRight.w} height={topBleed.h} fill="color-mix(in srgb, var(--overlay-bleed) 16%, transparent)" stroke="var(--overlay-bleed)" strokeWidth={0.3} strokeDasharray="2,2" />
          <rect x={wrapLeft.w} y={bottomBleed.y} width={svgWidth - wrapLeft.w - wrapRight.w} height={bottomBleed.h} fill="color-mix(in srgb, var(--overlay-bleed) 16%, transparent)" stroke="var(--overlay-bleed)" strokeWidth={0.3} strokeDasharray="2,2" />
        </>
      )}

      {/* Wrap areas */}
      <rect x={0} y={0} width={wrapLeft.w} height={svgHeight} fill="color-mix(in srgb, var(--overlay-margin) 12%, transparent)" stroke="color-mix(in srgb, var(--overlay-margin) 38%, transparent)" strokeWidth={0.3} strokeDasharray="2,2" />
      <rect x={wrapRight.x} y={0} width={wrapRight.w} height={svgHeight} fill="color-mix(in srgb, var(--overlay-margin) 12%, transparent)" stroke="color-mix(in srgb, var(--overlay-margin) 38%, transparent)" strokeWidth={0.3} strokeDasharray="2,2" />

      {/* Hinge indicators for hardcover */}
      {isHardcover && hingeW > 0 && (
        <>
          <rect
            x={backTrim.x + backTrim.w - hingeW}
            y={trimV.y}
            width={hingeW}
            height={trimV.h}
            fill="color-mix(in srgb, var(--overlay-gutter) 16%, transparent)"
            stroke="var(--overlay-gutter)"
            strokeWidth={0.5}
            strokeDasharray="3,2"
          />
          <rect
            x={frontTrim.x}
            y={trimV.y}
            width={hingeW}
            height={trimV.h}
            fill="color-mix(in srgb, var(--overlay-gutter) 16%, transparent)"
            stroke="var(--overlay-gutter)"
            strokeWidth={0.5}
            strokeDasharray="3,2"
          />
        </>
      )}

      {/* Labels */}
      <text x={backTrim.x + backTrim.w / 2} y={trimV.y + trimV.h / 2} textAnchor="middle" fill="color-mix(in srgb, var(--foreground) 50%, transparent)" fontSize={Math.min(9, backTrim.w * 0.15)} fontFamily="system-ui">
        BACK
      </text>
      <text x={spine.x + Math.max(spine.w, 2) / 2} y={trimV.y + trimV.h / 2} textAnchor="middle" fill="color-mix(in srgb, var(--foreground) 60%, transparent)" fontSize={Math.min(7, Math.max(spine.w * 0.3, 5))} fontFamily="system-ui" transform={`rotate(-90, ${spine.x + Math.max(spine.w, 2) / 2}, ${trimV.y + trimV.h / 2})`}>
        SPINE
      </text>
      <text x={frontTrim.x + frontTrim.w / 2} y={trimV.y + trimV.h / 2} textAnchor="middle" fill="color-mix(in srgb, var(--foreground) 50%, transparent)" fontSize={Math.min(9, frontTrim.w * 0.15)} fontFamily="system-ui">
        FRONT
      </text>

      {/* Dimension labels below */}
      <text x={svgWidth / 2} y={svgHeight + 14} textAnchor="middle" fill="color-mix(in srgb, var(--foreground) 30%, transparent)" fontSize={9} fontFamily="monospace">
        {formatInches(fullWidth)} × {formatInches(fullHeight)}
      </text>
    </svg>
  );
}
