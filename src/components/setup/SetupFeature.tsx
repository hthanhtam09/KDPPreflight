'use client';

import { useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ruler, BookOpen, Download, RotateCcw, ChevronDown } from 'lucide-react';
import { useAppStore } from '@/store/use-app-store';
import { TRIM_SIZES, BLEED_SIZE_IN, formatInches, inchesToMm, inchesToPixels } from '@/engine/kdp-constants';
import { TrimSizeKey, BleedType, PaperType, InteriorType, BookConfig } from '@/types/kdp';

// --- Configuration Panel ---
function ConfigPanel() {
  const { bookConfig, updateBookConfig, measurements } = useAppStore();
  const [customWidth, setCustomWidth] = useState(bookConfig.customWidth?.toString() || '');
  const [customHeight, setCustomHeight] = useState(bookConfig.customHeight?.toString() || '');

  const handleTrimSizeChange = (key: TrimSizeKey) => {
    if (key === 'custom') {
      const w = parseFloat(customWidth) || 6;
      const h = parseFloat(customHeight) || 9;
      updateBookConfig({ trimSize: 'custom', customWidth: w, customHeight: h });
    } else {
      updateBookConfig({ trimSize: key });
    }
  };

  const handleCustomWidthChange = (value: string) => {
    setCustomWidth(value);
    const w = parseFloat(value) || 0;
    updateBookConfig({ customWidth: w });
  };

  const handleCustomHeightChange = (value: string) => {
    setCustomHeight(value);
    const h = parseFloat(value) || 0;
    updateBookConfig({ customHeight: h });
  };

  return (
    <div className="space-y-5">
      {/* Trim Size */}
      <div>
        <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block">Trim Size</label>
        <div className="grid grid-cols-2 gap-1.5">
          {Object.values(TRIM_SIZES).map((size) => (
            <button
              key={size.key}
              onClick={() => handleTrimSizeChange(size.key)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all text-left ${
                bookConfig.trimSize === size.key
                  ? 'bg-white/10 text-white border border-white/20'
                  : 'bg-white/[0.03] text-white/50 border border-transparent hover:bg-white/[0.06] hover:text-white/70'
              }`}
            >
              {size.label}
            </button>
          ))}
        </div>
        {bookConfig.trimSize === 'custom' && (
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div>
              <label className="text-[10px] text-white/40 mb-1 block">Width (in)</label>
              <input
                type="number"
                value={customWidth}
                onChange={(e) => handleCustomWidthChange(e.target.value)}
                step="0.01"
                className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white/80 focus:outline-none focus:border-white/30"
                placeholder="6.0"
              />
            </div>
            <div>
              <label className="text-[10px] text-white/40 mb-1 block">Height (in)</label>
              <input
                type="number"
                value={customHeight}
                onChange={(e) => handleCustomHeightChange(e.target.value)}
                step="0.01"
                className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white/80 focus:outline-none focus:border-white/30"
                placeholder="9.0"
              />
            </div>
          </div>
        )}
      </div>

      {/* Bleed */}
      <div>
        <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block">Bleed</label>
        <div className="grid grid-cols-2 gap-1.5">
          {(['no-bleed', 'bleed'] as BleedType[]).map((bleed) => (
            <button
              key={bleed}
              onClick={() => updateBookConfig({ bleed })}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                bookConfig.bleed === bleed
                  ? 'bg-white/10 text-white border border-white/20'
                  : 'bg-white/[0.03] text-white/50 border border-transparent hover:bg-white/[0.06] hover:text-white/70'
              }`}
            >
              {bleed === 'bleed' ? 'With Bleed' : 'No Bleed'}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-white/30 mt-1.5">
          {bookConfig.bleed === 'bleed' 
            ? `Adds ${BLEED_SIZE_IN}" on each edge for artwork that extends to the trim line.`
            : 'White border around content. Artwork stays within trim boundaries.'}
        </p>
      </div>

      {/* Paper Type */}
      <div>
        <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block">Paper Type</label>
        <div className="grid grid-cols-3 gap-1.5">
          {(['white', 'cream', 'premium-color'] as PaperType[]).map((paper) => (
            <button
              key={paper}
              onClick={() => updateBookConfig({ paper })}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                bookConfig.paper === paper
                  ? 'bg-white/10 text-white border border-white/20'
                  : 'bg-white/[0.03] text-white/50 border border-transparent hover:bg-white/[0.06] hover:text-white/70'
              }`}
            >
              {paper === 'premium-color' ? 'Premium' : paper.charAt(0).toUpperCase() + paper.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Interior Type */}
      <div>
        <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block">Interior Type</label>
        <div className="grid grid-cols-3 gap-1.5">
          {(['black-white', 'standard-color', 'premium-color'] as InteriorType[]).map((interior) => (
            <button
              key={interior}
              onClick={() => updateBookConfig({ interior })}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                bookConfig.interior === interior
                  ? 'bg-white/10 text-white border border-white/20'
                  : 'bg-white/[0.03] text-white/50 border border-transparent hover:bg-white/[0.06] hover:text-white/70'
              }`}
            >
              {interior === 'black-white' ? 'B&W' : interior === 'standard-color' ? 'Color' : 'Premium'}
            </button>
          ))}
        </div>
      </div>

      {/* Page Count */}
      <div>
        <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block">Page Count</label>
        <input
          type="number"
          value={bookConfig.pageCount}
          onChange={(e) => updateBookConfig({ pageCount: Math.max(24, parseInt(e.target.value) || 24) })}
          min={24}
          max={828}
          step={2}
          className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 focus:outline-none focus:border-white/30"
        />
        <p className="text-[10px] text-white/30 mt-1.5">
          KDP requires 24–828 pages for paperback. Must be an even number.
        </p>
      </div>
    </div>
  );
}

// --- Measurements Display ---
function MeasurementsPanel() {
  const { measurements, bookConfig } = useAppStore();

  const measurementItems = [
    { label: 'Trim Size', value: `${formatInches(measurements.trimWidthIn)} × ${formatInches(measurements.trimHeightIn)}`, sub: `${inchesToMm(measurements.trimWidthIn).toFixed(1)} × ${inchesToMm(measurements.trimHeightIn).toFixed(1)} mm` },
    { label: 'Spine Width', value: formatInches(measurements.spineWidthIn), sub: `${inchesToMm(measurements.spineWidthIn).toFixed(2)} mm`, highlight: true },
    { label: 'Full Cover Width', value: formatInches(measurements.fullCoverWidthIn), sub: `${inchesToPixels(measurements.fullCoverWidthIn)} px @ 300 DPI` },
    { label: 'Full Cover Height', value: formatInches(measurements.fullCoverHeightIn), sub: `${inchesToPixels(measurements.fullCoverHeightIn)} px @ 300 DPI` },
    { label: 'Bleed', value: measurements.bleedIn > 0 ? formatInches(measurements.bleedIn) : 'None', sub: measurements.bleedIn > 0 ? '0.125" per edge' : 'No bleed selected' },
    { label: 'Safe Area', value: formatInches(measurements.safeAreaIn), sub: 'From each edge' },
    { label: 'Wrap Around', value: formatInches(measurements.wrapAroundIn), sub: 'Each side of full cover' },
  ];

  return (
    <div className="space-y-2">
      {measurementItems.map((item) => (
        <div
          key={item.label}
          className={`flex items-center justify-between p-2.5 rounded-lg ${
            item.highlight ? 'bg-emerald-500/[0.08] border border-emerald-500/20' : 'bg-white/[0.02]'
          }`}
        >
          <div>
            <p className="text-xs text-white/50">{item.label}</p>
            <p className="text-[10px] text-white/30">{item.sub}</p>
          </div>
          <p className={`text-sm font-mono font-medium ${item.highlight ? 'text-emerald-400' : 'text-white/80'}`}>
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}

// --- Visual Diagram ---
function BookDiagram() {
  const { measurements, bookConfig } = useAppStore();
  
  // Scale diagram to fit
  const maxDim = Math.max(measurements.fullCoverWidthIn, measurements.fullCoverHeightIn);
  const scale = 280 / maxDim;
  const w = measurements.fullCoverWidthIn * scale;
  const h = measurements.fullCoverHeightIn * scale;
  
  const bleed = measurements.bleedIn * scale;
  const spine = measurements.spineWidthIn * scale;
  const trimW = measurements.trimWidthIn * scale;
  const trimH = measurements.trimHeightIn * scale;
  const wrap = measurements.wrapAroundIn * scale;
  const safe = measurements.safeAreaIn * scale;
  
  const offsetX = (280 - w) / 2;
  const offsetY = (320 - h) / 2;
  
  return (
    <div className="flex flex-col items-center">
      <svg width="300" height="340" viewBox="0 0 300 340" className="text-white">
        {/* Full Cover (with bleed & wrap) */}
        <rect
          x={offsetX} y={offsetY}
          width={w} height={h}
          fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="4 2"
        />
        
        {/* Bleed Area */}
        {bleed > 0 && (
          <rect
            x={offsetX + wrap} y={offsetY + wrap}
            width={w - 2 * wrap} height={h - 2 * wrap}
            fill="rgba(239,68,68,0.06)" stroke="rgba(239,68,68,0.3)" strokeWidth="0.5"
          />
        )}
        
        {/* Trim Area - Back Cover */}
        <rect
          x={offsetX + wrap + bleed} y={offsetY + wrap + bleed}
          width={trimW} height={trimH}
          fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.2)" strokeWidth="1"
        />
        
        {/* Trim Area - Front Cover */}
        <rect
          x={offsetX + wrap + bleed + trimW + spine} y={offsetY + wrap + bleed}
          width={trimW} height={trimH}
          fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.3)" strokeWidth="1"
        />
        
        {/* Spine */}
        <rect
          x={offsetX + wrap + bleed + trimW} y={offsetY + wrap + bleed}
          width={Math.max(spine, 1)} height={trimH}
          fill="rgba(16,185,129,0.08)" stroke="rgba(16,185,129,0.4)" strokeWidth="0.5"
        />
        
        {/* Safe Zone - Front Cover */}
        <rect
          x={offsetX + wrap + bleed + trimW + spine + safe} y={offsetY + wrap + bleed + safe}
          width={trimW - 2 * safe} height={trimH - 2 * safe}
          fill="none" stroke="rgba(59,130,246,0.3)" strokeWidth="0.5" strokeDasharray="2 2"
        />
        
        {/* Safe Zone - Back Cover */}
        <rect
          x={offsetX + wrap + bleed + safe} y={offsetY + wrap + bleed + safe}
          width={trimW - 2 * safe} height={trimH - 2 * safe}
          fill="none" stroke="rgba(59,130,246,0.3)" strokeWidth="0.5" strokeDasharray="2 2"
        />
        
        {/* Labels */}
        <text x={offsetX + w / 2} y={offsetY - 6} textAnchor="middle" className="text-[9px]" fill="rgba(255,255,255,0.4)">
          Full Cover
        </text>
        
        {/* Front label */}
        <text x={offsetX + wrap + bleed + trimW + spine + trimW / 2} y={offsetY + wrap + bleed + trimH / 2} textAnchor="middle" className="text-[9px]" fill="rgba(255,255,255,0.5)">
          Front Cover
        </text>
        
        {/* Back label */}
        <text x={offsetX + wrap + bleed + trimW / 2} y={offsetY + wrap + bleed + trimH / 2} textAnchor="middle" className="text-[9px]" fill="rgba(255,255,255,0.4)">
          Back Cover
        </text>
        
        {/* Spine label */}
        {spine > 10 && (
          <text x={offsetX + wrap + bleed + trimW + spine / 2} y={offsetY + wrap + bleed + trimH / 2} textAnchor="middle" className="text-[7px]" fill="rgba(16,185,129,0.6)" transform={`rotate(-90, ${offsetX + wrap + bleed + trimW + spine / 2}, ${offsetY + wrap + bleed + trimH / 2})`}>
            Spine
          </text>
        )}
        
        {/* Dimension lines */}
        {/* Width */}
        <line x1={offsetX} y1={offsetY + h + 12} x2={offsetX + w} y2={offsetY + h + 12} stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
        <text x={offsetX + w / 2} y={offsetY + h + 22} textAnchor="middle" className="text-[8px]" fill="rgba(255,255,255,0.3)">
          {formatInches(measurements.fullCoverWidthIn)}
        </text>
        
        {/* Height */}
        <line x1={offsetX + w + 12} y1={offsetY} x2={offsetX + w + 12} y2={offsetY + h} stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
        <text x={offsetX + w + 18} y={offsetY + h / 2} textAnchor="middle" className="text-[8px]" fill="rgba(255,255,255,0.3)" transform={`rotate(90, ${offsetX + w + 18}, ${offsetY + h / 2})`}>
          {formatInches(measurements.fullCoverHeightIn)}
        </text>
      </svg>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-3 justify-center mt-2">
        <div className="flex items-center gap-1.5 text-[10px] text-white/40">
          <div className="w-3 h-0.5 border border-dashed border-white/20" /> Full Cover
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-white/40">
          <div className="w-3 h-0.5 bg-red-500/30" /> Bleed
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-white/40">
          <div className="w-3 h-0.5 bg-emerald-500/40" /> Spine
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-white/40">
          <div className="w-3 h-0.5 border border-dashed border-blue-400/30" /> Safe Zone
        </div>
      </div>
    </div>
  );
}

// --- Export Functions ---
function ExportPanel() {
  const { measurements, bookConfig } = useAppStore();
  
  const exportMeasurements = useCallback(() => {
    const lines = [
      'KDPPreflight - Book Measurements',
      '================================',
      `Trim Size: ${formatInches(measurements.trimWidthIn)} × ${formatInches(measurements.trimHeightIn)}`,
      `Spine Width: ${formatInches(measurements.spineWidthIn)}`,
      `Full Cover Width: ${formatInches(measurements.fullCoverWidthIn)}`,
      `Full Cover Height: ${formatInches(measurements.fullCoverHeightIn)}`,
      `Bleed: ${measurements.bleedIn > 0 ? formatInches(measurements.bleedIn) + ' per edge' : 'None'}`,
      `Safe Area: ${formatInches(measurements.safeAreaIn)} from each edge`,
      `Wrap Around: ${formatInches(measurements.wrapAroundIn)} each side`,
      '',
      'At 300 DPI:',
      `Full Cover: ${inchesToPixels(measurements.fullCoverWidthIn)} × ${inchesToPixels(measurements.fullCoverHeightIn)} px`,
      `Trim: ${inchesToPixels(measurements.trimWidthIn)} × ${inchesToPixels(measurements.trimHeightIn)} px`,
      '',
      `Page Count: ${bookConfig.pageCount}`,
      `Paper: ${bookConfig.paper}`,
      `Interior: ${bookConfig.interior}`,
      `Bleed: ${bookConfig.bleed}`,
    ].join('\n');
    
    const blob = new Blob([lines], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'kdp-measurements.txt';
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }, [measurements, bookConfig]);

  const exportTemplatePNG = useCallback(() => {
    const canvas = document.createElement('canvas');
    const dpi = 300;
    canvas.width = inchesToPixels(measurements.fullCoverWidthIn, dpi);
    canvas.height = inchesToPixels(measurements.fullCoverHeightIn, dpi);
    const ctx = canvas.getContext('2d')!;
    
    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Wrap area
    const wrapPx = inchesToPixels(measurements.wrapAroundIn, dpi);
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(wrapPx, wrapPx, canvas.width - 2 * wrapPx, canvas.height - 2 * wrapPx);
    
    // Bleed area
    const bleedPx = inchesToPixels(measurements.bleedIn, dpi);
    const trimWPx = inchesToPixels(measurements.trimWidthIn, dpi);
    const spinePx = Math.max(inchesToPixels(measurements.spineWidthIn, dpi), 2);
    const trimHPx = inchesToPixels(measurements.trimHeightIn, dpi);
    
    // Trim lines
    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    
    // Back cover trim
    ctx.strokeRect(wrapPx + bleedPx, wrapPx + bleedPx, trimWPx, trimHPx);
    // Front cover trim
    ctx.strokeRect(wrapPx + bleedPx + trimWPx + spinePx, wrapPx + bleedPx, trimWPx, trimHPx);
    // Spine
    ctx.strokeStyle = '#10b981';
    ctx.strokeRect(wrapPx + bleedPx + trimWPx, wrapPx + bleedPx, spinePx, trimHPx);
    
    // Safe zones
    const safePx = inchesToPixels(measurements.safeAreaIn, dpi);
    ctx.strokeStyle = '#3b82f6';
    ctx.setLineDash([3, 3]);
    ctx.strokeRect(wrapPx + bleedPx + safePx, wrapPx + bleedPx + safePx, trimWPx - 2 * safePx, trimHPx - 2 * safePx);
    ctx.strokeRect(wrapPx + bleedPx + trimWPx + spinePx + safePx, wrapPx + bleedPx + safePx, trimWPx - 2 * safePx, trimHPx - 2 * safePx);
    
    // Barcode area
    ctx.fillStyle = 'rgba(239, 68, 68, 0.1)';
    const barcodeW = inchesToPixels(2, dpi);
    const barcodeH = inchesToPixels(1.2, dpi);
    ctx.fillRect(
      wrapPx + bleedPx + safePx,
      wrapPx + bleedPx + trimHPx - safePx - barcodeH,
      barcodeW,
      barcodeH
    );
    
    // Download
    const link = document.createElement('a');
    link.download = 'kdp-cover-template.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, [measurements]);

  return (
    <div className="flex gap-2">
      <button
        onClick={exportTemplatePNG}
        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white/[0.05] hover:bg-white/[0.1] rounded-lg text-xs text-white/60 hover:text-white/80 transition-all border border-white/[0.06]"
      >
        <Download className="w-3.5 h-3.5" />
        Template PNG
      </button>
      <button
        onClick={exportMeasurements}
        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white/[0.05] hover:bg-white/[0.1] rounded-lg text-xs text-white/60 hover:text-white/80 transition-all border border-white/[0.06]"
      >
        <Ruler className="w-3.5 h-3.5" />
        Measurements
      </button>
    </div>
  );
}

// --- Main Setup Feature ---
export default function SetupFeature() {
  const { updateBookConfig, bookConfig, measurements } = useAppStore();

  return (
    <div className="flex flex-col lg:flex-row h-full gap-6">
      {/* Left Panel - Configuration */}
      <div className="lg:w-80 shrink-0 space-y-4 overflow-y-auto max-h-[calc(100vh-200px)] pr-1">
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
          <h3 className="text-white/90 font-semibold text-sm uppercase tracking-wider flex items-center gap-2 mb-4">
            <BookOpen className="w-4 h-4" />
            Book Configuration
          </h3>
          <ConfigPanel />
        </div>
        
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
          <h3 className="text-white/90 font-semibold text-sm uppercase tracking-wider flex items-center gap-2 mb-3">
            <Ruler className="w-4 h-4" />
            Calculated Measurements
          </h3>
          <MeasurementsPanel />
        </div>

        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
          <h3 className="text-white/90 font-semibold text-sm uppercase tracking-wider mb-3">Export</h3>
          <ExportPanel />
        </div>
      </div>

      {/* Right Panel - Visual Diagram */}
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-8 w-full max-w-lg">
          <h3 className="text-white/90 font-semibold text-sm uppercase tracking-wider text-center mb-4">
            Cover Layout Preview
          </h3>
          <BookDiagram />
        </div>
      </div>
    </div>
  );
}
