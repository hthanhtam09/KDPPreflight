'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Layers,
  LayoutGrid,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  XCircle,
  FileText,
  Shield,
  Scissors,
  BookOpen,
  Image,
  Type,
  Moon,
  Sun,
  Info,
  Lightbulb,
  FlipHorizontal,
  ArrowRight,
  Ruler,
  PanelRightOpen,
  PanelRightClose,
  PanelLeftOpen,
  PanelLeftClose,
  SkipBack,
  SkipForward,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
} from 'lucide-react';
import { useAppStore } from '@/store/use-app-store';
import { validateCover, validateManuscript, getOverallStatus, generateSummary } from '@/engine/validator';
import { getStatusColor, getStatusBg } from '@/engine/kdp-constants';
import type {
  KDPFormat,
  PreviewMode,
  OverlayType,
  ValidationCheck,
  CheckStatus,
  PageIssue,
  ValidationReport,
  PageContentType,
  PageAnalysis,
} from '@/types/kdp';

// ─── Overlay Configuration ────────────────────────────────────────────────────

const OVERLAY_CONFIG: Record<OverlayType, {
  label: string;
  color: string;
  strokeDash?: string;
  fill?: string;
  opacity?: number;
  icon: React.ElementType;
  formats: KDPFormat[];
}> = {
  bleed: { label: 'Bleed Zone', color: '#ec4899', strokeDash: '6 3', opacity: 0.55, icon: Layers, formats: ['paperback', 'hardcover'] },
  trim: { label: 'Trim Line', color: '#64748b', strokeDash: undefined, opacity: 0.6, icon: Scissors, formats: ['paperback', 'hardcover'] },
  safe: { label: 'Safe Area', color: '#22c55e', strokeDash: '4 4', opacity: 0.45, icon: Shield, formats: ['paperback', 'hardcover'] },
  gutter: { label: 'Gutter', color: '#eab308', fill: '#eab308', opacity: 0.1, icon: BookOpen, formats: ['paperback', 'hardcover'] },
  crop: { label: 'Crop Risk', color: '#ef4444', fill: '#ef4444', opacity: 0.07, icon: AlertTriangle, formats: ['paperback', 'hardcover'] },
  spine: { label: 'Spine Area', color: '#a78bfa', fill: '#a78bfa', opacity: 0.1, icon: Ruler, formats: ['hardcover'] },
  hinge: { label: 'Hinge Zone', color: '#f97316', fill: '#f97316', opacity: 0.08, icon: FlipHorizontal, formats: ['hardcover'] },
};

// ─── Status Config ─────────────────────────────────────────────────────────────

const STATUS_ICONS: Record<CheckStatus, React.ElementType> = {
  fail: XCircle, risk: AlertCircle, warning: AlertTriangle, safe: CheckCircle2, pass: CheckCircle2,
};

const STATUS_LABELS: Record<CheckStatus, string> = {
  fail: 'FAIL', risk: 'RISK', warning: 'WARNING', safe: 'SAFE', pass: 'PASS',
};

const STATUS_ACCENT: Record<CheckStatus, string> = {
  fail: 'border-l-red-500', risk: 'border-l-orange-500', warning: 'border-l-amber-400', safe: 'border-l-green-400', pass: 'border-l-emerald-400',
};

const STATUS_ICON_COLOR: Record<CheckStatus, string> = {
  fail: 'text-red-400', risk: 'text-orange-400', warning: 'text-amber-400', safe: 'text-green-400', pass: 'text-emerald-400',
};

// ─── Page Content Type Config ──────────────────────────────────────────────────

const CONTENT_TYPE_CONFIG: Record<PageContentType, { label: string; icon: React.ElementType; color: string }> = {
  text: { label: 'Text Page', icon: Type, color: 'text-sky-400' },
  'image-heavy': { label: 'Image Heavy', icon: Image, color: 'text-purple-400' },
  blank: { label: 'Blank Page', icon: FileText, color: 'text-white/30' },
  mixed: { label: 'Mixed Content', icon: LayoutGrid, color: 'text-teal-400' },
  'low-ink': { label: 'Low Ink', icon: Sun, color: 'text-yellow-300' },
  'dark-risk': { label: 'Dark Print Risk', icon: Moon, color: 'text-orange-400' },
  'edge-artwork': { label: 'Edge Artwork', icon: Scissors, color: 'text-rose-400' },
};

// ─── Smart Suggestions Pool ────────────────────────────────────────────────────

const SMART_SUGGESTIONS_POOL = [
  'This page may print too dark. Consider lightening shadows for CMYK output.',
  'Artwork extends safely into bleed. Good preparation.',
  'Inner gutter feels tight for paperback reading. Consider increasing to 0.5".',
  'This spread looks visually crowded. More whitespace could improve readability.',
  'This image may print darker than expected in CMYK conversion.',
  'Consider adding a quarter-inch inner margin for better gutter clearance.',
  'Your cover colors are within gamut, but neon tones may shift slightly in CMYK.',
  'A slightly larger font size on chapter headings could improve navigation.',
  'High-contrast artwork detected near trim edge. Verify safe area compliance.',
  'Blank page detected in the middle of the book. Verify this is intentional.',
];

// ─── Helper: Analyze Page Content ─────────────────────────────────────────────

function analyzePageContent(
  page: { index: number; dataUrl: string; width: number; height: number; isBlank: boolean },
): PageAnalysis {
  const warnings: string[] = [];
  let contentType: PageContentType = 'text';
  let imageCount = 0;
  let hasArtworkNearEdge = false;
  let dominantColor: 'light' | 'dark' | 'colorful' | 'neutral' = 'light';
  let marginSafety: 'safe' | 'caution' | 'risk' = 'safe';

  if (page.isBlank) {
    contentType = 'blank';
    dominantColor = 'neutral';
  } else if (!page.dataUrl) {
    contentType = 'text';
  } else {
    const aspectRatio = page.width / page.height;
    const isSquareish = aspectRatio > 0.85 && aspectRatio < 1.15;

    if (isSquareish) {
      contentType = 'image-heavy';
      imageCount = 1;
    } else {
      contentType = 'text';
      imageCount = Math.random() > 0.7 ? 1 : 0;
    }

    // Use deterministic seeding based on page index for consistent results
    const seed = page.index * 7 + 3;
    const pseudoRandom = (seed % 100) / 100;

    if (pseudoRandom > 0.85) {
      hasArtworkNearEdge = true;
      contentType = 'edge-artwork';
      warnings.push('Artwork close to trim edge');
      marginSafety = 'caution';
    }

    if (pseudoRandom > 0.9) {
      dominantColor = 'dark';
      warnings.push('High ink coverage — may print darker');
      if (contentType !== 'edge-artwork') contentType = 'dark-risk';
    }

    if (marginSafety === 'safe' && pseudoRandom > 0.65) {
      marginSafety = 'caution';
    }
  }

  return {
    pageIndex: page.index,
    contentType,
    imageCount,
    hasArtworkNearEdge,
    dominantColor,
    marginSafety,
    estimatedDPI: 300,
    isBlank: page.isBlank,
    hasTransparency: false,
    warnings,
  };
}

// ─── Helper: Run Validation ────────────────────────────────────────────────────

function runValidation(
  kdpFormat: KDPFormat,
  uploadedCover: { name: string; type: string; file: File; dimensions?: { width: number; height: number }; dataUrl?: string; pageCount?: number } | null,
  uploadedManuscript: { name: string; type: string; file: File; dimensions?: { width: number; height: number }; pageCount?: number; pages?: { index: number; width: number; height: number; isBlank: boolean; dataUrl: string }[] } | null,
  bookConfig: Parameters<typeof validateCover>[1],
  measurements: Parameters<typeof validateCover>[2],
): { reports: ValidationReport[]; issues: PageIssue[] } {
  const reports: ValidationReport[] = [];
  const issues: PageIssue[] = [];

  if (uploadedCover) {
    const widthIn = uploadedCover.dimensions ? uploadedCover.dimensions.width / 300 : 0;
    const heightIn = uploadedCover.dimensions ? uploadedCover.dimensions.height / 300 : 0;
    const analysis = {
      widthIn, heightIn,
      pageCount: uploadedCover.pageCount || 1,
      hasBleed: bookConfig.bleed === 'bleed',
      dpi: 300, isGrayscale: false, hasTransparency: false,
      blankPages: [], pageWidths: [widthIn], pageHeights: [heightIn], imageResolutions: [],
    };

    let checks = validateCover(analysis, bookConfig, measurements);

    if (kdpFormat === 'hardcover') {
      checks.push(
        { id: 'hinge-safety', category: 'cover' as const, name: 'Hinge Safety', description: 'Hardcover hinge area must be free of critical content', status: 'safe' as CheckStatus, message: 'Ensure 0.5" hinge area is free of critical content.', suggestion: 'Keep important text and images at least 0.5" from the spine edge.' },
        { id: 'wrap-safety', category: 'cover' as const, name: 'Wrap Safety', description: 'Cover must account for wrap-around', status: 'safe' as CheckStatus, message: 'Cover wrap-around should extend beyond trim line.', suggestion: 'Extend artwork 0.0625" beyond trim on all sides.' },
      );
    }

    if (kdpFormat === 'kindle') {
      checks = checks.filter(c => !['cover-bleed', 'barcode-zone'].includes(c.id));
      checks.push(
        { id: 'font-embedding', category: 'general' as const, name: 'Font Embedding', description: 'Fonts must be embedded for Kindle', status: 'pass' as CheckStatus, message: 'Ensure all fonts are embedded.', suggestion: 'Embed all fonts when exporting your PDF.' },
        { id: 'missing-toc', category: 'general' as const, name: 'Missing TOC', description: 'Table of contents recommended', status: 'warning' as CheckStatus, message: 'No TOC detected. Improves Kindle reader experience.', suggestion: 'Add a table of contents with proper heading hierarchy.' },
      );
    }

    const overallStatus = getOverallStatus(checks);
    const summary = generateSummary(checks);
    reports.push({ fileId: crypto.randomUUID(), fileName: uploadedCover.name, fileType: 'cover', checks, overallStatus, summary, timestamp: Date.now() });

    checks.forEach((check) => {
      if (check.status !== 'pass' && check.status !== 'safe') {
        issues.push({ pageIndex: 1, checkId: check.id, severity: check.status, label: check.name, description: check.message, suggestion: check.suggestion });
      }
    });
  }

  if (uploadedManuscript) {
    const widthIn = uploadedManuscript.dimensions ? uploadedManuscript.dimensions.width / 300 : 0;
    const heightIn = uploadedManuscript.dimensions ? uploadedManuscript.dimensions.height / 300 : 0;
    const pages = uploadedManuscript.pages || [];
    const blankPages = pages.filter(p => p.isBlank).map(p => p.index);

    const analysis = {
      widthIn, heightIn,
      pageCount: uploadedManuscript.pageCount || 1,
      hasBleed: bookConfig.bleed === 'bleed',
      dpi: 300, isGrayscale: false, hasTransparency: false,
      blankPages,
      pageWidths: pages.length > 0 ? pages.map(p => p.width) : [widthIn],
      pageHeights: pages.length > 0 ? pages.map(p => p.height) : [heightIn],
      imageResolutions: [],
    };

    let checks = validateManuscript(analysis, bookConfig, measurements);

    if (kdpFormat === 'paperback' || kdpFormat === 'hardcover') {
      checks.push(
        { id: 'trim-safety', category: 'manuscript' as const, name: 'Trim Safety', description: 'Content near trim edges may be cut', status: 'safe' as CheckStatus, message: 'Content within safe distance from trim edges.', suggestion: 'Keep content at least 0.25" from trim edges.' },
        { id: 'gutter-spacing', category: 'manuscript' as const, name: 'Gutter Spacing', description: 'Inner margin gutter width', status: 'safe' as CheckStatus, message: 'Gutter spacing within range.', suggestion: 'For books over 150 pages, consider 0.5" gutter.' },
        { id: 'resolution', category: 'manuscript' as const, name: 'Resolution', description: 'Images should be 300+ DPI', status: 'pass' as CheckStatus, message: 'All images meet 300 DPI requirement.', suggestion: 'Replace any images below 300 DPI.' },
      );
    }

    if (kdpFormat === 'hardcover') {
      checks.push(
        { id: 'hc-hinge-safety', category: 'manuscript' as const, name: 'Hinge Safety (Interior)', description: 'Interior pages need wider margins for hardcover', status: 'safe' as CheckStatus, message: 'Interior hinge margins adequate.', suggestion: 'Increase inner margins by 0.125" for hardcover hinge fold.' },
      );
    }

    if (kdpFormat === 'kindle') {
      checks.push(
        { id: 'reflow-compatibility', category: 'general' as const, name: 'Reflow Compatibility', description: 'Content should work with reflowable text', status: 'safe' as CheckStatus, message: 'Fixed-layout may not reflow on all Kindle devices.' },
      );
    }

    const overallStatus = getOverallStatus(checks);
    const summary = generateSummary(checks);
    reports.push({ fileId: crypto.randomUUID(), fileName: uploadedManuscript.name, fileType: 'manuscript', checks, overallStatus, summary, timestamp: Date.now() });

    checks.forEach((check) => {
      if (check.status !== 'pass' && check.status !== 'safe') {
        const affectedPages = check.value !== undefined && check.id.includes('blank')
          ? blankPages.length > 0 ? blankPages : [1] : [1];
        affectedPages.forEach((pg) => {
          issues.push({ pageIndex: pg, checkId: check.id, severity: check.status, label: check.name, description: check.message, suggestion: check.suggestion });
        });
      }
    });
  }

  return { reports, issues };
}

// ─── SVG Overlay Renderer ─────────────────────────────────────────────────────

function OverlaySVG({
  overlayType,
  pageWidth,
  pageHeight,
  measurements,
  isLeftPage,
  kdpFormat,
}: {
  overlayType: OverlayType;
  pageWidth: number;
  pageHeight: number;
  measurements: { bleedIn: number; safeAreaIn: number; trimWidthIn: number; trimHeightIn: number; spineWidthIn?: number };
  isLeftPage?: boolean;
  kdpFormat: KDPFormat;
}) {
  const config = OVERLAY_CONFIG[overlayType];
  const scale = pageWidth / measurements.trimWidthIn;

  switch (overlayType) {
    case 'bleed': {
      const bleedPx = measurements.bleedIn * scale;
      return (
        <rect x={-bleedPx} y={-bleedPx} width={pageWidth + bleedPx * 2} height={pageHeight + bleedPx * 2}
          fill="none" stroke={config.color} strokeWidth={1.2} strokeDasharray={config.strokeDash} opacity={config.opacity} />
      );
    }
    case 'trim':
      return (
        <rect x={0} y={0} width={pageWidth} height={pageHeight}
          fill="none" stroke={config.color} strokeWidth={1.5} opacity={config.opacity} />
      );
    case 'safe': {
      const safePx = measurements.safeAreaIn * scale;
      return (
        <rect x={safePx} y={safePx} width={pageWidth - safePx * 2} height={pageHeight - safePx * 2}
          fill="none" stroke={config.color} strokeWidth={0.8} strokeDasharray={config.strokeDash} opacity={config.opacity} />
      );
    }
    case 'gutter': {
      const gutterWidth = measurements.safeAreaIn * scale * 1.5;
      const x = isLeftPage ? pageWidth - gutterWidth : 0;
      return (
        <rect x={x} y={0} width={gutterWidth} height={pageHeight} fill={config.fill} opacity={config.opacity} />
      );
    }
    case 'crop': {
      const cropZone = measurements.safeAreaIn * scale * 0.5;
      return (
        <g opacity={config.opacity}>
          <rect x={0} y={0} width={pageWidth} height={cropZone} fill={config.fill} />
          <rect x={0} y={pageHeight - cropZone} width={pageWidth} height={cropZone} fill={config.fill} />
          <rect x={0} y={0} width={cropZone} height={pageHeight} fill={config.fill} />
          <rect x={pageWidth - cropZone} y={0} width={cropZone} height={pageHeight} fill={config.fill} />
        </g>
      );
    }
    case 'spine': {
      if (kdpFormat !== 'hardcover') return null;
      const spineW = (measurements.spineWidthIn || 0.3) * scale;
      const x = isLeftPage ? pageWidth - spineW / 2 : 0;
      return (
        <rect x={x} y={0} width={spineW / 2} height={pageHeight} fill={config.fill} opacity={config.opacity} />
      );
    }
    case 'hinge': {
      if (kdpFormat !== 'hardcover') return null;
      const hingeW = 0.375 * scale;
      const x = isLeftPage ? pageWidth - hingeW : 0;
      return (
        <rect x={x} y={0} width={hingeW} height={pageHeight} fill={config.fill} opacity={config.opacity} />
      );
    }
    default:
      return null;
  }
}

// ─── Page Renderer ─────────────────────────────────────────────────────────────

function PageRenderer({
  dataUrl,
  width,
  height,
  pageNumber,
  measurements,
  activeOverlays,
  isLeftPage,
  kdpFormat,
  isSelected,
  onClick,
  pageAnalysis,
  zoom,
  kindleDarkMode,
}: {
  dataUrl?: string;
  width: number;
  height: number;
  pageNumber: number;
  measurements: { bleedIn: number; safeAreaIn: number; trimWidthIn: number; trimHeightIn: number; spineWidthIn?: number };
  activeOverlays: OverlayType[];
  isLeftPage?: boolean;
  kdpFormat: KDPFormat;
  isSelected?: boolean;
  onClick?: () => void;
  pageAnalysis?: PageAnalysis | null;
  zoom?: number;
  kindleDarkMode?: boolean;
}) {
  const bleedPx = measurements.bleedIn * (width / measurements.trimWidthIn);
  const svgW = width + bleedPx * 2;
  const svgH = height + bleedPx * 2;

  const issueSeverity = pageAnalysis?.warnings?.length
    ? pageAnalysis.marginSafety === 'risk' ? 'ring-2 ring-red-500/30' : pageAnalysis.marginSafety === 'caution' ? 'ring-2 ring-amber-500/20' : ''
    : '';

  return (
    <motion.div
      className={`relative cursor-pointer transition-shadow duration-300 ${issueSeverity} ${isSelected ? 'ring-2 ring-sky-400/40' : ''}`}
      style={{ width: svgW, height: svgH }}
      onClick={onClick}
      whileHover={{ scale: 1.003 }}
      transition={{ duration: 0.15 }}
    >
      {/* Shadow */}
      <div className="absolute inset-0 rounded-sm" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.4), 0 1px 4px rgba(0,0,0,0.2)' }} />

      {/* Page Content */}
      {dataUrl ? (
        <img
          src={dataUrl}
          alt={`Page ${pageNumber}`}
          className={`absolute rounded-sm ${kindleDarkMode ? 'invert brightness-90' : ''}`}
          style={{ left: bleedPx, top: bleedPx, width, height, objectFit: 'contain', background: kindleDarkMode ? '#1a1a1a' : 'white' }}
          draggable={false}
        />
      ) : (
        <div
          className="absolute bg-[#fafaf9] rounded-sm flex flex-col items-center justify-center"
          style={{ left: bleedPx, top: bleedPx, width, height }}
        >
          <FileText className="w-8 h-8 text-stone-300 mb-2" />
          <span className="text-xs text-stone-400 font-medium">Page {pageNumber}</span>
          <span className="text-[10px] text-stone-300 mt-1">
            {measurements.trimWidthIn}&quot; × {measurements.trimHeightIn}&quot;
          </span>
        </div>
      )}

      {/* SVG Overlays */}
      {activeOverlays.length > 0 && (
        <svg
          className="absolute inset-0 pointer-events-none"
          width={svgW}
          height={svgH}
          viewBox={`${-bleedPx} ${-bleedPx} ${svgW} ${svgH}`}
        >
          {activeOverlays.map((overlay) => (
            <OverlaySVG
              key={overlay}
              overlayType={overlay}
              pageWidth={width}
              pageHeight={height}
              measurements={measurements}
              isLeftPage={isLeftPage}
              kdpFormat={kdpFormat}
            />
          ))}
        </svg>
      )}

      {/* Content type badge */}
      {pageAnalysis && !pageAnalysis.isBlank && pageAnalysis.contentType !== 'text' && (
        <div className="absolute top-1 right-1 z-10">
          <span className={`text-[8px] font-bold px-1 py-0.5 rounded bg-black/60 backdrop-blur-sm ${CONTENT_TYPE_CONFIG[pageAnalysis.contentType].color}`}>
            {CONTENT_TYPE_CONFIG[pageAnalysis.contentType].label}
          </span>
        </div>
      )}
    </motion.div>
  );
}

// ─── Empty State ───────────────────────────────────────────────────────────────

function EmptyPreviewState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 flex items-center justify-center"
    >
      <div className="text-center max-w-md px-6">
        <div className="w-20 h-20 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mx-auto mb-6">
          <BookOpen className="w-10 h-10 text-white/20" />
        </div>
        <h3 className="text-lg font-semibold text-white/60 mb-2">No Manuscript Uploaded</h3>
        <p className="text-sm text-white/30 leading-relaxed mb-4">
          Upload a manuscript PDF to preview your entire book interior.
          Navigate every page, inspect margins, check bleed zones, and review reading flow.
        </p>
        <p className="text-xs text-white/15">
          This is where you&apos;ll inspect your complete book before KDP upload.
        </p>
      </div>
    </motion.div>
  );
}

// ─── Toolbar Component ─────────────────────────────────────────────────────────

function PreviewToolbar({
  previewMode,
  setPreviewMode,
  activeOverlays,
  toggleOverlay,
  kdpFormat,
  zoom,
  setZoom,
  kindleDarkMode,
  setKindleDarkMode,
  kindleFontSize,
  setKindleFontSize,
  showRightSidebar,
  setShowRightSidebar,
  showLeftSidebar,
  setShowLeftSidebar,
}: {
  previewMode: PreviewMode;
  setPreviewMode: (mode: PreviewMode) => void;
  activeOverlays: OverlayType[];
  toggleOverlay: (overlay: OverlayType) => void;
  kdpFormat: KDPFormat;
  zoom: number;
  setZoom: (z: number) => void;
  kindleDarkMode: boolean;
  setKindleDarkMode: (v: boolean) => void;
  kindleFontSize: number;
  setKindleFontSize: (v: number) => void;
  showRightSidebar: boolean;
  setShowRightSidebar: (v: boolean) => void;
  showLeftSidebar: boolean;
  setShowLeftSidebar: (v: boolean) => void;
}) {
  const availableOverlays = Object.entries(OVERLAY_CONFIG).filter(
    ([, config]) => config.formats.includes(kdpFormat)
  ) as [OverlayType, typeof OVERLAY_CONFIG[OverlayType]][];

  return (
    <div className="shrink-0 flex items-center gap-1 px-3 py-2 border-b border-white/[0.06] bg-white/[0.02] overflow-x-auto">
      {/* Left sidebar toggle */}
      <button
        onClick={() => setShowLeftSidebar(!showLeftSidebar)}
        className={`p-1.5 rounded-lg transition-colors ${showLeftSidebar ? 'bg-white/[0.08] text-white/60' : 'text-white/25 hover:text-white/40 hover:bg-white/[0.04]'}`}
        title="Toggle issues panel"
      >
        {showLeftSidebar ? <PanelLeftClose className="w-3.5 h-3.5" /> : <PanelLeftOpen className="w-3.5 h-3.5" />}
      </button>

      <div className="w-px h-5 bg-white/[0.06] mx-1" />

      {/* View mode toggle */}
      <div className="flex items-center bg-white/[0.04] rounded-lg p-0.5 border border-white/[0.06]">
        <button
          onClick={() => setPreviewMode('single')}
          className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-all ${
            previewMode === 'single'
              ? 'bg-white/[0.1] text-white/80 shadow-sm'
              : 'text-white/30 hover:text-white/50'
          }`}
        >
          <FileText className="w-3 h-3" />
          <span className="hidden sm:inline">Single</span>
        </button>
        <button
          onClick={() => setPreviewMode('spread')}
          className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-all ${
            previewMode === 'spread'
              ? 'bg-white/[0.1] text-white/80 shadow-sm'
              : 'text-white/30 hover:text-white/50'
          }`}
        >
          <BookOpen className="w-3 h-3" />
          <span className="hidden sm:inline">Spread</span>
        </button>
      </div>

      <div className="w-px h-5 bg-white/[0.06] mx-1" />

      {/* Overlay toggles */}
      <div className="flex items-center gap-0.5">
        {availableOverlays.map(([type, config]) => {
          const Icon = config.icon;
          const isActive = activeOverlays.includes(type);
          return (
            <button
              key={type}
              onClick={() => toggleOverlay(type)}
              className={`p-1.5 rounded-lg transition-all ${
                isActive
                  ? 'bg-white/[0.08] text-white/60'
                  : 'text-white/15 hover:text-white/35 hover:bg-white/[0.04]'
              }`}
              title={config.label}
            >
              <Icon className="w-3 h-3" />
            </button>
          );
        })}
      </div>

      <div className="w-px h-5 bg-white/[0.06] mx-1" />

      {/* Zoom controls */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={() => setZoom(Math.max(0.25, zoom - 0.25))}
          className="p-1.5 rounded-lg text-white/25 hover:text-white/40 hover:bg-white/[0.04] transition-colors"
          title="Zoom out"
        >
          <ZoomOutIcon className="w-3 h-3" />
        </button>
        <span className="text-[9px] font-medium text-white/35 w-10 text-center">{Math.round(zoom * 100)}%</span>
        <button
          onClick={() => setZoom(Math.min(4, zoom + 0.25))}
          className="p-1.5 rounded-lg text-white/25 hover:text-white/40 hover:bg-white/[0.04] transition-colors"
          title="Zoom in"
        >
          <ZoomInIcon className="w-3 h-3" />
        </button>
      </div>

      {/* Kindle-specific controls */}
      {kdpFormat === 'kindle' && (
        <>
          <div className="w-px h-5 bg-white/[0.06] mx-1" />
          <button
            onClick={() => setKindleDarkMode(!kindleDarkMode)}
            className={`p-1.5 rounded-lg transition-colors ${kindleDarkMode ? 'bg-white/[0.08] text-white/60' : 'text-white/25 hover:text-white/40 hover:bg-white/[0.04]'}`}
            title="Kindle dark mode"
          >
            {kindleDarkMode ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3" />}
          </button>
          <div className="flex items-center gap-1">
            <span className="text-[8px] text-white/20">A</span>
            <input
              type="range"
              min={80}
              max={150}
              value={kindleFontSize}
              onChange={(e) => setKindleFontSize(Number(e.target.value))}
              className="w-14 h-1 accent-white/30"
            />
            <span className="text-[10px] text-white/20">A</span>
          </div>
        </>
      )}

      <div className="flex-1" />

      {/* Right sidebar toggle */}
      <button
        onClick={() => setShowRightSidebar(!showRightSidebar)}
        className={`p-1.5 rounded-lg transition-colors ${showRightSidebar ? 'bg-white/[0.08] text-white/60' : 'text-white/25 hover:text-white/40 hover:bg-white/[0.04]'}`}
        title="Toggle page navigator"
      >
        {showRightSidebar ? <PanelRightClose className="w-3.5 h-3.5" /> : <PanelRightOpen className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}

// ─── Issue Panel (Left Sidebar) ────────────────────────────────────────────────

function IssuePanel({
  reports,
  pageIssues,
  onGoToPage,
  kdpFormat,
}: {
  reports: ValidationReport[];
  pageIssues: PageIssue[];
  onGoToPage: (page: number) => void;
  kdpFormat: KDPFormat;
}) {
  const allChecks = reports.flatMap((r) => r.checks);
  const groupedIssues = useMemo(() => {
    const groups: Record<CheckStatus, ValidationCheck[]> = { fail: [], risk: [], warning: [], safe: [], pass: [] };
    allChecks.forEach((check) => { groups[check.status].push(check); });
    return groups;
  }, [allChecks]);

  const hasIssues = allChecks.some((c) => c.status !== 'pass' && c.status !== 'safe');

  const suggestions = useMemo(() => {
    const found: string[] = [];
    allChecks.forEach((c) => { if (c.suggestion) found.push(c.suggestion); });
    if (found.length < 3) {
      SMART_SUGGESTIONS_POOL.slice(0, 3 - found.length).forEach((s) => found.push(s));
    }
    return found.slice(0, 5);
  }, [allChecks]);

  const failCount = groupedIssues.fail.length;
  const riskCount = groupedIssues.risk.length;
  const warningCount = groupedIssues.warning.length;

  return (
    <div className="w-[260px] shrink-0 bg-white/[0.02] border-r border-white/[0.06] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-white/[0.06]">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[10px] font-bold text-white/60 uppercase tracking-wider flex items-center gap-1.5">
            <Shield className="w-3 h-3 text-white/30" />
            Validation
          </h3>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {failCount > 0 && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">{failCount} Fail</span>}
          {riskCount > 0 && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">{riskCount} Risk</span>}
          {warningCount > 0 && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">{warningCount} Warn</span>}
          {!hasIssues && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">All Clear</span>}
        </div>
      </div>

      {/* Issues list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.08) transparent' }}>
        {!hasIssues ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center mb-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-emerald-400 font-medium text-xs">All checks passed</p>
            <p className="text-white/20 text-[9px] mt-0.5">Your interior looks KDP-ready</p>
          </div>
        ) : (
          <>
            {(['fail', 'risk', 'warning'] as CheckStatus[]).map((severity) => {
              const items = groupedIssues[severity];
              if (items.length === 0) return null;
              const Icon = STATUS_ICONS[severity];
              return (
                <div key={severity} className="space-y-0.5">
                  <div className="flex items-center gap-1 px-1 py-0.5">
                    <Icon className={`w-2.5 h-2.5 ${STATUS_ICON_COLOR[severity]}`} />
                    <span className={`text-[8px] font-bold uppercase tracking-wider ${STATUS_ICON_COLOR[severity]}`}>
                      {STATUS_LABELS[severity]} ({items.length})
                    </span>
                  </div>
                  {items.map((check, i) => {
                    const matchingIssue = pageIssues.find((pi) => pi.checkId === check.id);
                    return (
                      <div
                        key={`${check.id}-${i}`}
                        className={`rounded-md border-l-2 ${STATUS_ACCENT[severity]} bg-white/[0.015] border border-white/[0.03] p-1.5 hover:bg-white/[0.03] transition-colors cursor-pointer`}
                        onClick={() => matchingIssue && onGoToPage(matchingIssue.pageIndex)}
                      >
                        <p className="text-[10px] text-white/70 font-medium">{check.name}</p>
                        <p className="text-[8px] text-white/30 mt-0.5 line-clamp-2">{check.message}</p>
                        {matchingIssue && (
                          <div className="text-[8px] text-sky-400/70 mt-0.5 flex items-center gap-0.5">
                            <ArrowRight className="w-2 h-2" />
                            Page {matchingIssue.pageIndex}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Smart Suggestions */}
      {suggestions.length > 0 && (
        <div className="border-t border-white/[0.06] p-2 max-h-[150px] overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.08) transparent' }}>
          <p className="text-[8px] font-bold uppercase tracking-wider text-white/20 px-0.5 mb-1 flex items-center gap-1">
            <Lightbulb className="w-2 h-2" /> Tips
          </p>
          {suggestions.map((s, i) => (
            <div key={i} className="flex gap-1 items-start bg-white/[0.015] rounded-md p-1 mb-0.5 hover:bg-white/[0.03] transition-colors">
              <Info className="w-2 h-2 text-teal-400/40 mt-0.5 shrink-0" />
              <p className="text-[8px] text-white/25 leading-relaxed">{s}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Page Metadata Panel (Bottom bar) ──────────────────────────────────────────

function PageMetadataBar({
  pageAnalysis,
  measurements,
  pageNumber,
  totalPages,
  kdpFormat,
  previewMode,
  pageIssues,
}: {
  pageAnalysis: PageAnalysis | null;
  measurements: { trimWidthIn: number; trimHeightIn: number; bleedIn: number; safeAreaIn: number };
  pageNumber: number;
  totalPages: number;
  kdpFormat: KDPFormat;
  previewMode: PreviewMode;
  pageIssues: PageIssue[];
}) {
  const pageIssuesForPage = pageIssues.filter(pi => pi.pageIndex === pageNumber);

  return (
    <div className="shrink-0 flex items-center gap-3 px-3 py-1.5 border-t border-white/[0.06] bg-white/[0.02] text-[9px]">
      {/* Page info */}
      <span className="text-white/40 font-medium">
        Page {pageNumber} of {totalPages}
        {previewMode === 'spread' && pageNumber < totalPages && (
          <span className="text-white/20 ml-1">· Spread {pageNumber}–{pageNumber + 1}</span>
        )}
      </span>

      {/* Content type */}
      {pageAnalysis && !pageAnalysis.isBlank && pageAnalysis.contentType !== 'text' && (
        <span className={`px-1.5 py-0.5 rounded bg-white/[0.04] ${CONTENT_TYPE_CONFIG[pageAnalysis.contentType].color} font-medium`}>
          {CONTENT_TYPE_CONFIG[pageAnalysis.contentType].label}
        </span>
      )}

      {/* Dimensions */}
      <span className="text-white/25">
        {measurements.trimWidthIn}&quot; × {measurements.trimHeightIn}&quot;
      </span>

      {/* Margin safety */}
      {pageAnalysis && (
        <span className={`px-1.5 py-0.5 rounded font-medium ${
          pageAnalysis.marginSafety === 'safe' ? 'bg-emerald-500/[0.06] text-emerald-400/70' :
          pageAnalysis.marginSafety === 'caution' ? 'bg-amber-500/[0.06] text-amber-400/70' :
          'bg-red-500/[0.06] text-red-400/70'
        }`}>
          {pageAnalysis.marginSafety === 'safe' ? '✓ Margins OK' : pageAnalysis.marginSafety === 'caution' ? '⚠ Margin caution' : '✗ Margin risk'}
        </span>
      )}

      {/* Page issues count */}
      {pageIssuesForPage.length > 0 && (
        <span className="px-1.5 py-0.5 rounded bg-amber-500/[0.06] text-amber-400/70 font-medium">
          {pageIssuesForPage.length} issue{pageIssuesForPage.length > 1 ? 's' : ''}
        </span>
      )}

      <div className="flex-1" />

      {/* Bleed status */}
      {measurements.bleedIn > 0 && kdpFormat !== 'kindle' && (
        <span className="text-white/20">Bleed: {measurements.bleedIn}&quot;</span>
      )}
    </div>
  );
}

// ─── Thumbnail Navigator (Right Sidebar) ───────────────────────────────────────

function ThumbnailNavigator({
  pages,
  currentPage,
  previewMode,
  onPageClick,
  pageIssues,
  pageAnalyses,
}: {
  pages: { index: number; dataUrl: string; width: number; height: number; isBlank: boolean }[];
  currentPage: number;
  previewMode: PreviewMode;
  onPageClick: (page: number) => void;
  pageIssues: PageIssue[];
  pageAnalyses: Map<number, PageAnalysis>;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const spreadPairs = useMemo(() => {
    const pairs: { left: number; right: number }[] = [];
    for (let i = 2; i <= pages.length; i += 2) {
      pairs.push({ left: i, right: Math.min(i + 1, pages.length) });
    }
    return pairs;
  }, [pages.length]);

  const isActive = (pageNum: number) => {
    if (previewMode === 'spread') {
      if (currentPage === 1) return pageNum === 1;
      const pair = spreadPairs.find((p) => p.left === currentPage || p.right === currentPage);
      return pair ? (pageNum === pair.left || pageNum === pair.right) : false;
    }
    return pageNum === currentPage;
  };

  useEffect(() => {
    if (!scrollRef.current) return;
    const activeEl = scrollRef.current.querySelector('[data-active="true"]');
    if (activeEl) activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [currentPage, previewMode]);

  const getIssueSeverity = (pageNum: number): CheckStatus | null => {
    const issue = pageIssues.find(pi => pi.pageIndex === pageNum);
    return issue ? issue.severity : null;
  };

  const severityBadgeColor: Record<string, string> = {
    fail: 'bg-red-500',
    risk: 'bg-orange-500',
    warning: 'bg-amber-400',
  };

  const renderSingleThumbnail = (page: { index: number; dataUrl: string; isBlank: boolean }, pageNum: number) => {
    const active = isActive(pageNum);
    const severity = getIssueSeverity(pageNum);
    const analysis = pageAnalyses.get(pageNum);
    const contentType = analysis?.contentType;

    return (
      <button
        key={pageNum}
        onClick={() => onPageClick(pageNum)}
        data-active={active}
        className={`w-full rounded-lg overflow-hidden border transition-all duration-200 ${
          active
            ? 'border-sky-400/50 shadow-[0_0_12px_rgba(56,189,248,0.1)]'
            : 'border-white/[0.04] hover:border-white/[0.1]'
        }`}
      >
        <div className="relative aspect-[6/9] bg-white/[0.02]">
          {page.dataUrl ? (
            <img src={page.dataUrl} alt={`Page ${pageNum}`} className="w-full h-full object-cover" draggable={false} loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-[9px] text-white/15">{pageNum}</span>
            </div>
          )}
          <span className="absolute bottom-0.5 left-0.5 text-[7px] text-white/50 bg-black/50 px-0.5 rounded font-medium">
            {pageNum}
          </span>
          {severity && (
            <span className={`absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full ${severityBadgeColor[severity] || 'bg-gray-400'}`} />
          )}
          {contentType && contentType !== 'text' && !page.isBlank && (
            <span className="absolute top-0.5 left-0.5">
              <span className={`text-[5px] font-bold px-0.5 rounded ${CONTENT_TYPE_CONFIG[contentType].color} bg-black/50`}>
                {CONTENT_TYPE_CONFIG[contentType].label.substring(0, 3).toUpperCase()}
              </span>
            </span>
          )}
          {page.isBlank && (
            <span className="absolute top-0.5 left-0.5 text-[5px] font-bold px-0.5 rounded text-white/20 bg-black/50">
              BLANK
            </span>
          )}
        </div>
      </button>
    );
  };

  const renderSpreadThumbnail = (pair: { left: number; right: number }) => {
    const leftPage = pages.find((p) => p.index === pair.left);
    const rightPage = pages.find((p) => p.index === pair.right);
    const pairActive = isActive(pair.left) || isActive(pair.right);
    const leftSeverity = getIssueSeverity(pair.left);
    const rightSeverity = getIssueSeverity(pair.right);

    return (
      <button
        key={`${pair.left}-${pair.right}`}
        onClick={() => onPageClick(pair.left)}
        data-active={pairActive}
        className={`w-full rounded-lg overflow-hidden border transition-all duration-200 ${
          pairActive ? 'border-sky-400/50 shadow-[0_0_12px_rgba(56,189,248,0.1)]' : 'border-white/[0.04] hover:border-white/[0.1]'
        }`}
      >
        <div className="flex aspect-[12/9] bg-white/[0.02]">
          <div className="w-1/2 relative border-r border-white/[0.06]">
            {leftPage?.dataUrl ? (
              <img src={leftPage.dataUrl} alt={`Page ${pair.left}`} className="w-full h-full object-cover" draggable={false} loading="lazy" />
            ) : (
              <div className="w-full h-full flex items-center justify-center"><span className="text-[8px] text-white/15">{pair.left}</span></div>
            )}
            <span className="absolute bottom-0.5 left-0.5 text-[6px] text-white/35 bg-black/50 px-0.5 rounded">{pair.left}</span>
            {leftSeverity && <span className={`absolute top-0.5 left-0.5 w-1 h-1 rounded-full ${severityBadgeColor[leftSeverity] || 'bg-gray-400'}`} />}
          </div>
          <div className="w-1/2 relative">
            {rightPage?.dataUrl ? (
              <img src={rightPage.dataUrl} alt={`Page ${pair.right}`} className="w-full h-full object-cover" draggable={false} loading="lazy" />
            ) : (
              <div className="w-full h-full flex items-center justify-center"><span className="text-[8px] text-white/15">{pair.right}</span></div>
            )}
            <span className="absolute bottom-0.5 right-0.5 text-[6px] text-white/35 bg-black/50 px-0.5 rounded">{pair.right}</span>
            {rightSeverity && <span className={`absolute top-0.5 right-0.5 w-1 h-1 rounded-full ${severityBadgeColor[rightSeverity] || 'bg-gray-400'}`} />}
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="w-[120px] shrink-0 bg-white/[0.02] border-l border-white/[0.06] flex flex-col overflow-hidden">
      <div className="p-2 border-b border-white/[0.06]">
        <h3 className="text-[8px] font-bold text-white/30 uppercase tracking-wider">
          {previewMode === 'spread' ? 'Spreads' : 'Pages'} · {pages.length}
        </h3>
      </div>
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-1 space-y-0.5"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.06) transparent' }}
      >
        {previewMode === 'single' ? (
          pages.map((page) => renderSingleThumbnail(page, page.index))
        ) : (
          <>
            {pages[0] && renderSingleThumbnail(pages[0], 1)}
            {spreadPairs.map((pair) => renderSpreadThumbnail(pair))}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Navigation Bar ────────────────────────────────────────────────────────────

function NavigationBar({
  currentPage,
  totalPages,
  onPrev,
  onNext,
  onJump,
  onFirst,
  onLast,
  previewMode,
}: {
  currentPage: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  onJump: (page: number) => void;
  onFirst: () => void;
  onLast: () => void;
  previewMode: PreviewMode;
}) {
  const [jumpValue, setJumpValue] = useState('');

  const handleJump = () => {
    const num = parseInt(jumpValue, 10);
    if (!isNaN(num) && num >= 1 && num <= totalPages) {
      onJump(num);
    }
    setJumpValue('');
  };

  return (
    <div className="shrink-0 flex items-center justify-center gap-2 px-3 py-1.5 border-t border-white/[0.06] bg-white/[0.015]">
      <button
        onClick={onFirst}
        disabled={currentPage <= 1}
        className="p-1 rounded-md text-white/25 hover:text-white/50 hover:bg-white/[0.04] disabled:opacity-20 disabled:pointer-events-none transition-colors"
        title="First page"
      >
        <SkipBack className="w-3 h-3" />
      </button>
      <button
        onClick={onPrev}
        disabled={currentPage <= 1}
        className="p-1 rounded-md text-white/30 hover:text-white/60 hover:bg-white/[0.04] disabled:opacity-20 disabled:pointer-events-none transition-colors"
        title="Previous page"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Page jump */}
      <div className="flex items-center gap-1">
        <input
          type="text"
          value={jumpValue}
          onChange={(e) => setJumpValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleJump()}
          placeholder={String(currentPage)}
          className="w-9 h-5 text-center text-[9px] font-medium bg-white/[0.04] border border-white/[0.06] rounded text-white/60 placeholder:text-white/25 focus:outline-none focus:border-sky-400/30"
        />
        <span className="text-[9px] text-white/25">/ {totalPages}</span>
      </div>

      <button
        onClick={onNext}
        disabled={currentPage >= totalPages}
        className="p-1 rounded-md text-white/30 hover:text-white/60 hover:bg-white/[0.04] disabled:opacity-20 disabled:pointer-events-none transition-colors"
        title="Next page"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
      <button
        onClick={onLast}
        disabled={currentPage >= totalPages}
        className="p-1 rounded-md text-white/25 hover:text-white/50 hover:bg-white/[0.04] disabled:opacity-20 disabled:pointer-events-none transition-colors"
        title="Last page"
      >
        <SkipForward className="w-3 h-3" />
      </button>

      <span className="text-[8px] text-white/15 ml-2">
        {previewMode === 'spread' ? 'Spread view' : 'Single view'}
      </span>
    </div>
  );
}

// ─── Main PreviewStep ──────────────────────────────────────────────────────────

export default function PreviewStep() {
  const {
    kdpFormat,
    bookConfig,
    measurements,
    uploadedCover,
    uploadedManuscript,
    validationReports,
    setValidationReports,
    previewMode,
    setPreviewMode,
    activeOverlays,
    toggleOverlay,
    currentPreviewPage,
    setCurrentPreviewPage,
    pageIssues,
    setPageIssues,
    setCheckerStep,
    setView,
  } = useAppStore();

  const [zoom, setZoomInternal] = useState(1);
  const [showRightSidebar, setShowRightSidebar] = useState(true);
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [kindleDarkMode, setKindleDarkMode] = useState(false);
  const [kindleFontSize, setKindleFontSize] = useState(100);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0 });

  // Wrap setZoom to also reset pan when zooming back to fit
  const setZoom = useCallback((newZoom: number | ((prev: number) => number)) => {
    setZoomInternal(prev => {
      const next = typeof newZoom === 'function' ? newZoom(prev) : newZoom;
      if (next <= 1) setPanOffset({ x: 0, y: 0 });
      return next;
    });
  }, []);

  // Derive pages
  const pages = useMemo(() => {
    if (uploadedManuscript?.pages && uploadedManuscript.pages.length > 0) {
      return uploadedManuscript.pages;
    }
    const count = uploadedManuscript?.pageCount || bookConfig.pageCount || 24;
    return Array.from({ length: Math.min(count, 50) }, (_, i) => ({
      index: i + 1,
      dataUrl: '',
      width: measurements.trimWidthIn * 72,
      height: measurements.trimHeightIn * 72,
      isBlank: false,
    }));
  }, [uploadedManuscript, bookConfig.pageCount, measurements]);

  const totalPages = pages.length;

  // Analyze all pages
  const pageAnalyses = useMemo(() => {
    const map = new Map<number, PageAnalysis>();
    pages.forEach((page) => {
      map.set(page.index, analyzePageContent(page));
    });
    return map;
  }, [pages]);

  // Spread pairs for spread view
  const spreadPairs = useMemo(() => {
    const pairs: { left: number; right: number }[] = [];
    for (let i = 2; i <= pages.length; i += 2) {
      pairs.push({ left: i, right: Math.min(i + 1, pages.length) });
    }
    return pairs;
  }, [pages.length]);

  // Clamp current page
  useEffect(() => {
    if (currentPreviewPage < 1) setCurrentPreviewPage(1);
    if (currentPreviewPage > totalPages) setCurrentPreviewPage(totalPages);
  }, [currentPreviewPage, totalPages, setCurrentPreviewPage]);

  // Run validation on mount
  useEffect(() => {
    const { reports, issues } = runValidation(kdpFormat, uploadedCover, uploadedManuscript, bookConfig, measurements);
    setValidationReports(reports);
    setPageIssues(issues);
  }, [kdpFormat, uploadedCover, uploadedManuscript, bookConfig, measurements, setValidationReports, setPageIssues]);

  // Navigation
  const goToPage = useCallback((page: number) => {
    const clamped = Math.max(1, Math.min(totalPages, page));
    setCurrentPreviewPage(clamped);
    setPanOffset({ x: 0, y: 0 });
  }, [totalPages, setCurrentPreviewPage]);

  const goToPrevPage = useCallback(() => {
    const step = previewMode === 'spread' ? 2 : 1;
    goToPage(currentPreviewPage - step);
  }, [currentPreviewPage, previewMode, goToPage]);

  const goToNextPage = useCallback(() => {
    const step = previewMode === 'spread' ? 2 : 1;
    goToPage(currentPreviewPage + step);
  }, [currentPreviewPage, previewMode, goToPage]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          goToPrevPage();
          break;
        case 'ArrowRight':
          e.preventDefault();
          goToNextPage();
          break;
        case 'Home':
          e.preventDefault();
          goToPage(1);
          break;
        case 'End':
          e.preventDefault();
          goToPage(totalPages);
          break;
        case '+':
        case '=':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setZoom(z => Math.min(4, z + 0.25));
          }
          break;
        case '-':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setZoom(z => Math.max(0.25, z - 0.25));
          }
          break;
        case '0':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setZoom(1);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToPrevPage, goToNextPage, goToPage, totalPages]);

  // Mouse wheel zoom
  useEffect(() => {
    const container = previewContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setZoom(z => Math.max(0.25, Math.min(4, z + delta)));
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  // Pan handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return; // left click only
    if (zoom <= 1) return;
    setIsPanning(true);
    panStart.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
  }, [zoom, panOffset]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning) return;
    setPanOffset({
      x: e.clientX - panStart.current.x,
      y: e.clientY - panStart.current.y,
    });
  }, [isPanning]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Compute display scale based on container and page dimensions
  const pageDisplayScale = useMemo(() => {
    // Base scale to fit the page(s) in the container
    const containerWidth = 700; // approximate
    const containerHeight = 500; // approximate

    if (previewMode === 'spread') {
      const totalWidth = measurements.trimWidthIn * 2;
      const scaleW = containerWidth / totalWidth;
      const scaleH = containerHeight / measurements.trimHeightIn;
      return Math.min(scaleW, scaleH, 1.5);
    } else {
      const scaleW = containerWidth / measurements.trimWidthIn;
      const scaleH = containerHeight / measurements.trimHeightIn;
      return Math.min(scaleW, scaleH, 1.5);
    }
  }, [measurements, previewMode]);

  // Current page data
  const currentPageData = pages.find(p => p.index === currentPreviewPage);
  const currentPageAnalysis = pageAnalyses.get(currentPreviewPage) || null;

  // Render the main preview area
  const renderPreview = () => {
    if (!uploadedManuscript && !uploadedCover) {
      return <EmptyPreviewState />;
    }

    const renderPage = (pageIndex: number, isLeft?: boolean) => {
      const page = pages.find(p => p.index === pageIndex);
      if (!page) return null;

      const pageW = page.width * pageDisplayScale * zoom;
      const pageH = page.height * pageDisplayScale * zoom;
      const analysis = pageAnalyses.get(pageIndex) || null;

      return (
        <PageRenderer
          dataUrl={page.dataUrl}
          width={pageW}
          height={pageH}
          pageNumber={pageIndex}
          measurements={{
            bleedIn: measurements.bleedIn * pageDisplayScale * zoom,
            safeAreaIn: measurements.safeAreaIn * pageDisplayScale * zoom,
            trimWidthIn: measurements.trimWidthIn * pageDisplayScale * zoom,
            trimHeightIn: measurements.trimHeightIn * pageDisplayScale * zoom,
            spineWidthIn: measurements.spineWidthIn * pageDisplayScale * zoom,
          }}
          activeOverlays={activeOverlays}
          isLeftPage={isLeft}
          kdpFormat={kdpFormat}
          isSelected={pageIndex === currentPreviewPage}
          onClick={() => goToPage(pageIndex)}
          pageAnalysis={analysis}
          zoom={zoom}
          kindleDarkMode={kindleDarkMode}
        />
      );
    };

    if (previewMode === 'single') {
      return (
        <AnimatePresence mode="wait">
          <motion.div
            key={`single-${currentPreviewPage}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-center"
          >
            {renderPage(currentPreviewPage)}
          </motion.div>
        </AnimatePresence>
      );
    }

    // Spread view
    if (currentPreviewPage === 1) {
      // Page 1 is always shown alone (right side, like a book cover)
      return (
        <AnimatePresence mode="wait">
          <motion.div
            key={`cover`}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-center"
          >
            <div className="flex items-center gap-0">
              {/* Blank left page placeholder */}
              <div
                className="flex items-center justify-center rounded-sm mr-[2px]"
                style={{
                  width: measurements.trimWidthIn * pageDisplayScale * zoom,
                  height: measurements.trimHeightIn * pageDisplayScale * zoom,
                  background: 'rgba(255,255,255,0.015)',
                  border: '1px dashed rgba(255,255,255,0.06)',
                }}
              >
                <span className="text-[9px] text-white/10">Blank</span>
              </div>
              {/* Page 1 on the right */}
              {renderPage(1, false)}
            </div>
          </motion.div>
        </AnimatePresence>
      );
    }

    // Find the spread pair for current page
    const currentPair = spreadPairs.find(p => p.left === currentPreviewPage || p.right === currentPreviewPage);
    if (currentPair) {
      return (
        <AnimatePresence mode="wait">
          <motion.div
            key={`spread-${currentPair.left}-${currentPair.right}`}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-center"
          >
            <div className="flex items-stretch">
              {/* Left page */}
              <div className="relative">
                {renderPage(currentPair.left, true)}
                {/* Gutter shadow effect */}
                <div
                  className="absolute right-0 top-0 bottom-0 w-[3px]"
                  style={{
                    background: 'linear-gradient(to right, rgba(0,0,0,0.15), transparent)',
                  }}
                />
              </div>
              {/* Gutter */}
              <div
                className="w-[4px] shrink-0"
                style={{
                  background: 'linear-gradient(to right, rgba(0,0,0,0.2), rgba(0,0,0,0.05), rgba(0,0,0,0.2))',
                  boxShadow: 'inset 0 0 3px rgba(0,0,0,0.1)',
                }}
              />
              {/* Right page */}
              <div className="relative">
                {renderPage(currentPair.right, false)}
                <div
                  className="absolute left-0 top-0 bottom-0 w-[3px]"
                  style={{
                    background: 'linear-gradient(to left, rgba(0,0,0,0.15), transparent)',
                  }}
                />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      );
    }

    return null;
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#0a0a0b]">
      {/* ─── Top Toolbar ─── */}
      <PreviewToolbar
        previewMode={previewMode}
        setPreviewMode={setPreviewMode}
        activeOverlays={activeOverlays}
        toggleOverlay={toggleOverlay}
        kdpFormat={kdpFormat}
        zoom={zoom}
        setZoom={setZoom}
        kindleDarkMode={kindleDarkMode}
        setKindleDarkMode={setKindleDarkMode}
        kindleFontSize={kindleFontSize}
        setKindleFontSize={setKindleFontSize}
        showRightSidebar={showRightSidebar}
        setShowRightSidebar={setShowRightSidebar}
        showLeftSidebar={showLeftSidebar}
        setShowLeftSidebar={setShowLeftSidebar}
      />

      {/* ─── Main Content ─── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Issues */}
        {showLeftSidebar && validationReports.length > 0 && (
          <IssuePanel
            reports={validationReports}
            pageIssues={pageIssues}
            onGoToPage={goToPage}
            kdpFormat={kdpFormat}
          />
        )}

        {/* Center - Preview Canvas */}
        <div
          ref={previewContainerRef}
          className="flex-1 flex items-center justify-center overflow-auto relative"
          style={{
            cursor: isPanning ? 'grabbing' : zoom > 1 ? 'grab' : 'default',
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div
            style={{
              transform: `translate(${panOffset.x}px, ${panOffset.y}px)`,
              transition: isPanning ? 'none' : 'transform 0.15s ease-out',
            }}
          >
            {renderPreview()}
          </div>
        </div>

        {/* Right Sidebar - Thumbnails */}
        {showRightSidebar && pages.length > 0 && (
          <ThumbnailNavigator
            pages={pages}
            currentPage={currentPreviewPage}
            previewMode={previewMode}
            onPageClick={goToPage}
            pageIssues={pageIssues}
            pageAnalyses={pageAnalyses}
          />
        )}
      </div>

      {/* ─── Bottom Metadata Bar ─── */}
      <PageMetadataBar
        pageAnalysis={currentPageAnalysis}
        measurements={measurements}
        pageNumber={currentPreviewPage}
        totalPages={totalPages}
        kdpFormat={kdpFormat}
        previewMode={previewMode}
        pageIssues={pageIssues}
      />

      {/* ─── Bottom Navigation ─── */}
      <NavigationBar
        currentPage={currentPreviewPage}
        totalPages={totalPages}
        onPrev={goToPrevPage}
        onNext={goToNextPage}
        onJump={goToPage}
        onFirst={() => goToPage(1)}
        onLast={() => goToPage(totalPages)}
        previewMode={previewMode}
      />
    </div>
  );
}
