'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Layers,
  Columns2,
  LayoutGrid,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Download,
  Box,
  FileText,
  ArrowLeft,
  Eye,
  EyeOff,
  Shield,
  Search,
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
  FileCheck,
  RotateCcw,
  Ruler,
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
    // Heuristic analysis based on page properties
    const isLarge = page.width > 600 && page.height > 800;
    if (isLarge) {
      contentType = Math.random() > 0.5 ? 'image-heavy' : 'mixed';
      imageCount = Math.floor(Math.random() * 4) + 1;
    } else {
      contentType = 'text';
      imageCount = Math.floor(Math.random() * 2);
    }

    // Edge artwork simulation
    if (Math.random() > 0.8) {
      hasArtworkNearEdge = true;
      contentType = 'edge-artwork';
      warnings.push('Artwork close to trim edge');
      marginSafety = 'caution';
    }

    // Dark risk simulation
    if (Math.random() > 0.85) {
      dominantColor = 'dark';
      warnings.push('High ink coverage — may print darker');
      if (contentType !== 'edge-artwork') contentType = 'dark-risk';
    }

    if (marginSafety === 'safe' && Math.random() > 0.7) {
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
        { id: 'hardcover-margins', category: 'cover' as const, name: 'Hardcover Margins', description: 'Hardcover requires wider margins', status: 'safe' as CheckStatus, message: 'Margins should be at least 0.375" from all edges.', suggestion: 'Increase safe margins to 0.375" for hardcover.' },
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
        { id: 'page-consistency', category: 'manuscript' as const, name: 'Page Consistency', description: 'Consistent formatting throughout', status: 'pass' as CheckStatus, message: 'Page formatting appears consistent.' },
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
        { id: 'unsupported-formatting', category: 'general' as const, name: 'Unsupported Formatting', description: 'Some formatting may not render on Kindle', status: 'safe' as CheckStatus, message: 'No unsupported formatting detected.' },
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
}) {
  const bleedPx = measurements.bleedIn * (width / measurements.trimWidthIn);
  const svgW = width + bleedPx * 2;
  const svgH = height + bleedPx * 2;

  // Determine page border style
  const issueSeverity = pageAnalysis?.warnings?.length
    ? pageAnalysis.marginSafety === 'risk' ? 'ring-2 ring-red-500/30' : pageAnalysis.marginSafety === 'caution' ? 'ring-2 ring-amber-500/20' : ''
    : '';

  return (
    <motion.div
      className={`relative cursor-pointer transition-shadow duration-300 ${issueSeverity} ${isSelected ? 'ring-2 ring-sky-400/40' : ''}`}
      style={{ width: svgW, height: svgH }}
      onClick={onClick}
      whileHover={{ scale: 1.005 }}
      transition={{ duration: 0.15 }}
    >
      {/* Shadow */}
      <div className="absolute inset-0 rounded-sm" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.4), 0 1px 4px rgba(0,0,0,0.2)' }} />

      {/* Page Content */}
      {dataUrl ? (
        <img
          src={dataUrl}
          alt={`Page ${pageNumber}`}
          className="absolute bg-white rounded-sm"
          style={{ left: bleedPx, top: bleedPx, width, height, objectFit: 'contain' }}
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

// ─── Issue Panel (Left Sidebar) ────────────────────────────────────────────────

function IssuePanel({
  reports,
  pageIssues,
  onGoToPage,
  collapsed,
  onToggleCollapse,
  kdpFormat,
}: {
  reports: ValidationReport[];
  pageIssues: PageIssue[];
  onGoToPage: (page: number) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
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

  // Count summary
  const failCount = groupedIssues.fail.length;
  const riskCount = groupedIssues.risk.length;
  const warningCount = groupedIssues.warning.length;

  if (collapsed) {
    return (
      <button
        onClick={onToggleCollapse}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] rounded-xl p-2.5 hover:bg-white/[0.1] transition-colors group"
        aria-label="Expand issue panel"
      >
        <Shield className="w-4 h-4 text-white/50 group-hover:text-white/70" />
        {hasIssues && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-[9px] font-bold text-white flex items-center justify-center">
            {failCount + riskCount}
          </span>
        )}
      </button>
    );
  }

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -20, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="w-[280px] shrink-0 bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-white/[0.06]">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-white/70 uppercase tracking-wider flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-white/40" />
            Validation
          </h3>
          <button onClick={onToggleCollapse} className="text-white/30 hover:text-white/60 transition-colors" aria-label="Collapse">
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
        {/* Summary counts */}
        <div className="flex gap-2">
          {failCount > 0 && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">{failCount} Fail</span>}
          {riskCount > 0 && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">{riskCount} Risk</span>}
          {warningCount > 0 && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">{warningCount} Warn</span>}
          {!hasIssues && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">All Clear</span>}
        </div>
      </div>

      {/* Issues list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5 max-h-[calc(100vh-360px)]" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
        {!hasIssues ? (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center justify-center py-8 text-center"
          >
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </div>
            <p className="text-emerald-400 font-medium text-sm">Your interior looks clean and KDP-ready.</p>
            <p className="text-white/25 text-[10px] mt-1">All checks passed successfully</p>
          </motion.div>
        ) : (
          <>
            {(['fail', 'risk', 'warning'] as CheckStatus[]).map((severity) => {
              const items = groupedIssues[severity];
              if (items.length === 0) return null;
              const Icon = STATUS_ICONS[severity];
              return (
                <div key={severity} className="space-y-1">
                  <div className="flex items-center gap-1.5 px-1">
                    <Icon className={`w-3 h-3 ${STATUS_ICON_COLOR[severity]}`} />
                    <span className={`text-[9px] font-bold uppercase tracking-wider ${STATUS_ICON_COLOR[severity]}`}>
                      {STATUS_LABELS[severity]} ({items.length})
                    </span>
                  </div>
                  {items.map((check, i) => {
                    const matchingIssue = pageIssues.find((pi) => pi.checkId === check.id);
                    return (
                      <motion.div
                        key={`${check.id}-${i}`}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className={`rounded-lg border-l-2 ${STATUS_ACCENT[severity]} bg-white/[0.02] border border-white/[0.04] p-2 hover:bg-white/[0.04] transition-colors`}
                      >
                        <p className="text-[11px] text-white/80 font-medium">{check.name}</p>
                        <p className="text-[9px] text-white/35 mt-0.5 line-clamp-2">{check.message}</p>
                        {matchingIssue && (
                          <button
                            onClick={() => onGoToPage(matchingIssue.pageIndex)}
                            className="text-[9px] text-sky-400 hover:text-sky-300 mt-1 flex items-center gap-0.5 transition-colors"
                          >
                            <ArrowRight className="w-2.5 h-2.5" />
                            Page {matchingIssue.pageIndex}
                          </button>
                        )}
                      </motion.div>
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
        <div className="border-t border-white/[0.06] p-3 max-h-[200px] overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
          <p className="text-[9px] font-bold uppercase tracking-wider text-white/25 px-1 mb-1.5 flex items-center gap-1">
            <Lightbulb className="w-2.5 h-2.5" /> Suggestions
          </p>
          {suggestions.map((s, i) => (
            <div key={i} className="flex gap-1.5 items-start bg-white/[0.02] rounded-lg p-1.5 mb-1 hover:bg-white/[0.04] transition-colors">
              <Info className="w-2.5 h-2.5 text-teal-400/60 mt-0.5 shrink-0" />
              <p className="text-[9px] text-white/35 leading-relaxed">{s}</p>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ─── Page Metadata Panel ───────────────────────────────────────────────────────

function PageMetadataPanel({
  pageAnalysis,
  measurements,
  pageNumber,
  totalPages,
  kdpFormat,
  previewMode,
}: {
  pageAnalysis: PageAnalysis | null;
  measurements: { trimWidthIn: number; trimHeightIn: number; bleedIn: number; safeAreaIn: number };
  pageNumber: number;
  totalPages: number;
  kdpFormat: KDPFormat;
  previewMode: PreviewMode;
}) {
  if (!pageAnalysis) return null;

  const contentTypeConf = CONTENT_TYPE_CONFIG[pageAnalysis.contentType];
  const ContentTypeIcon = contentTypeConf.icon;

  const metaItems = [
    { label: 'Dimensions', value: `${measurements.trimWidthIn}" × ${measurements.trimHeightIn}"` },
    { label: 'Bleed', value: measurements.bleedIn > 0 ? `${measurements.bleedIn}"` : 'None' },
    { label: 'DPI Estimate', value: `${pageAnalysis.estimatedDPI}` },
    { label: 'Content', value: contentTypeConf.label },
    { label: 'Margin Safety', value: pageAnalysis.marginSafety.toUpperCase(), accent: pageAnalysis.marginSafety === 'risk' ? 'text-red-400' : pageAnalysis.marginSafety === 'caution' ? 'text-amber-400' : 'text-emerald-400' },
    { label: 'Dominant', value: pageAnalysis.dominantColor },
    { label: 'Images', value: `${pageAnalysis.imageCount}` },
    { label: 'Blank', value: pageAnalysis.isBlank ? 'Yes' : 'No' },
  ];

  // Only show format-relevant metadata
  const filteredItems = metaItems.filter(item => {
    if (kdpFormat === 'kindle' && item.label === 'Bleed') return false;
    return true;
  });

  return (
    <div className="border-b border-white/[0.06] p-3">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold text-white/60 uppercase tracking-wider">
          Page {pageNumber} of {totalPages}
        </span>
        {previewMode === 'spread' && pageNumber < totalPages && (
          <span className="text-[9px] text-white/30">Spread {pageNumber}–{pageNumber + 1}</span>
        )}
      </div>

      {/* Content Type Badge */}
      <div className="flex items-center gap-1.5 mb-2.5 px-2 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.05]">
        <ContentTypeIcon className={`w-3.5 h-3.5 ${contentTypeConf.color}`} />
        <span className={`text-[10px] font-semibold ${contentTypeConf.color}`}>{contentTypeConf.label}</span>
      </div>

      {/* Metadata Grid */}
      <div className="space-y-1">
        {filteredItems.map((item) => (
          <div key={item.label} className="flex items-center justify-between px-1">
            <span className="text-[9px] text-white/30">{item.label}</span>
            <span className={`text-[9px] font-medium ${item.accent || 'text-white/50'}`}>{item.value}</span>
          </div>
        ))}
      </div>

      {/* Page Warnings */}
      {pageAnalysis.warnings.length > 0 && (
        <div className="mt-2 space-y-0.5">
          {pageAnalysis.warnings.map((w, i) => (
            <div key={i} className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/[0.06]">
              <AlertTriangle className="w-2.5 h-2.5 text-amber-400/60 shrink-0" />
              <span className="text-[8px] text-amber-300/60">{w}</span>
            </div>
          ))}
        </div>
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

  const issuePages = useMemo(() => new Set(pageIssues.map((pi) => pi.pageIndex)), [pageIssues]);

  const isActive = (pageNum: number) => {
    if (previewMode === 'spread') {
      if (currentPage === 1) return pageNum === 1;
      const pair = spreadPairs.find((p) => p.left === currentPage || p.right === currentPage);
      return pair ? (pageNum === pair.left || pageNum === pair.right) : false;
    }
    return pageNum === currentPage;
  };

  // Auto-scroll to active thumbnail
  useEffect(() => {
    if (!scrollRef.current) return;
    const activeEl = scrollRef.current.querySelector('[data-active="true"]');
    if (activeEl) activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [currentPage, previewMode]);

  // Get severity for issue badges
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
            ? 'border-sky-400/50 shadow-[0_0_16px_rgba(56,189,248,0.12)]'
            : 'border-white/[0.04] hover:border-white/[0.12]'
        }`}
      >
        <div className="relative aspect-[6/9] bg-white/[0.02]">
          {page.dataUrl ? (
            <img src={page.dataUrl} alt={`Page ${pageNum}`} className="w-full h-full object-cover" draggable={false} loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-[10px] text-white/15">{pageNum}</span>
            </div>
          )}
          {/* Page number */}
          <span className="absolute bottom-0.5 left-0.5 text-[8px] text-white/50 bg-black/50 px-1 rounded font-medium">
            {pageNum}
          </span>
          {/* Issue severity badge */}
          {severity && (
            <span className={`absolute top-0.5 right-0.5 w-2 h-2 rounded-full ${severityBadgeColor[severity] || 'bg-gray-400'}`} />
          )}
          {/* Content type mini badge */}
          {contentType && contentType !== 'text' && !page.isBlank && (
            <span className="absolute top-0.5 left-0.5">
              <span className={`text-[6px] font-bold px-0.5 rounded ${CONTENT_TYPE_CONFIG[contentType].color} bg-black/50`}>
                {CONTENT_TYPE_CONFIG[contentType].label.substring(0, 3).toUpperCase()}
              </span>
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
          pairActive ? 'border-sky-400/50 shadow-[0_0_16px_rgba(56,189,248,0.12)]' : 'border-white/[0.04] hover:border-white/[0.12]'
        }`}
      >
        <div className="flex aspect-[12/9] bg-white/[0.02]">
          <div className="w-1/2 relative border-r border-white/[0.06]">
            {leftPage?.dataUrl ? (
              <img src={leftPage.dataUrl} alt={`Page ${pair.left}`} className="w-full h-full object-cover" draggable={false} loading="lazy" />
            ) : (
              <div className="w-full h-full flex items-center justify-center"><span className="text-[9px] text-white/15">{pair.left}</span></div>
            )}
            <span className="absolute bottom-0.5 left-0.5 text-[7px] text-white/40 bg-black/50 px-0.5 rounded">{pair.left}</span>
            {leftSeverity && <span className={`absolute top-0.5 left-0.5 w-1.5 h-1.5 rounded-full ${severityBadgeColor[leftSeverity] || 'bg-gray-400'}`} />}
          </div>
          <div className="w-1/2 relative">
            {rightPage?.dataUrl ? (
              <img src={rightPage.dataUrl} alt={`Page ${pair.right}`} className="w-full h-full object-cover" draggable={false} loading="lazy" />
            ) : (
              <div className="w-full h-full flex items-center justify-center"><span className="text-[9px] text-white/15">{pair.right}</span></div>
            )}
            <span className="absolute bottom-0.5 right-0.5 text-[7px] text-white/40 bg-black/50 px-0.5 rounded">{pair.right}</span>
            {rightSeverity && <span className={`absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full ${severityBadgeColor[rightSeverity] || 'bg-gray-400'}`} />}
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="w-[140px] shrink-0 bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl flex flex-col overflow-hidden">
      <div className="p-2.5 border-b border-white/[0.06]">
        <h3 className="text-[9px] font-bold text-white/35 uppercase tracking-wider">
          {previewMode === 'spread' ? 'Spreads' : 'Pages'} · {pages.length}
        </h3>
      </div>
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-1.5 space-y-1"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}
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

  const [zoom, setZoom] = useState(1);
  const [issuePanelCollapsed, setIssuePanelCollapsed] = useState(false);
  const [pageJumpInput, setPageJumpInput] = useState('');
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0 });

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
  }, []);

  // Overall status
  const overallStatus = useMemo(() => {
    const allChecks = validationReports.flatMap((r) => r.checks);
    return getOverallStatus(allChecks);
  }, [validationReports]);

  // Navigation
  const canGoPrev = currentPreviewPage > 1;
  const canGoNext = previewMode === 'spread' ? currentPreviewPage < totalPages - 1 : currentPreviewPage < totalPages;

  const goPrev = useCallback(() => {
    if (!canGoPrev) return;
    const step = previewMode === 'spread' ? 2 : 1;
    setCurrentPreviewPage(Math.max(1, currentPreviewPage - step));
  }, [canGoPrev, currentPreviewPage, previewMode, setCurrentPreviewPage]);

  const goNext = useCallback(() => {
    if (!canGoNext) return;
    const step = previewMode === 'spread' ? 2 : 1;
    setCurrentPreviewPage(Math.min(totalPages, currentPreviewPage + step));
  }, [canGoNext, currentPreviewPage, previewMode, totalPages, setCurrentPreviewPage]);

  const goToPage = useCallback((page: number) => {
    setCurrentPreviewPage(Math.max(1, Math.min(totalPages, page)));
  }, [totalPages, setCurrentPreviewPage]);

  // Handle page jump
  const handlePageJump = useCallback(() => {
    const num = parseInt(pageJumpInput, 10);
    if (!isNaN(num) && num >= 1 && num <= totalPages) {
      goToPage(num);
    }
    setPageJumpInput('');
  }, [pageJumpInput, totalPages, goToPage]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goPrev, goNext]);

  // Zoom
  const zoomIn = useCallback(() => { setZoom((z) => Math.min(4, z + 0.25)); setPanOffset({ x: 0, y: 0 }); }, []);
  const zoomOut = useCallback(() => { setZoom((z) => Math.max(0.25, z - 0.25)); setPanOffset({ x: 0, y: 0 }); }, []);
  const zoomFit = useCallback(() => {
    if (!previewContainerRef.current) return;
    const container = previewContainerRef.current;
    const containerW = container.clientWidth - 80;
    const containerH = container.clientHeight - 80;
    const pageW = measurements.trimWidthIn * 72;
    const pageH = measurements.trimHeightIn * 72;
    const isSpread = previewMode === 'spread';
    const scaleW = containerW / (isSpread ? pageW * 2 + 24 : pageW);
    const scaleH = containerH / pageH;
    setZoom(Math.min(scaleW, scaleH, 2.5));
    setPanOffset({ x: 0, y: 0 });
  }, [measurements, previewMode]);

  // Auto-fit on mount or mode change
  useEffect(() => { zoomFit(); }, [zoomFit]);

  // Pan handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (zoom > 1.2) {
      setIsPanning(true);
      panStart.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
    }
  }, [zoom, panOffset]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      setPanOffset({ x: e.clientX - panStart.current.x, y: e.clientY - panStart.current.y });
    }
  }, [isPanning]);

  const handleMouseUp = useCallback(() => { setIsPanning(false); }, []);

  // Scroll zoom with wheel
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom((z) => Math.max(0.25, Math.min(4, z + delta)));
    }
  }, []);

  // Current page data
  const currentPageData = useMemo(() => {
    if (previewMode === 'spread') {
      const left = pages.find((p) => p.index === currentPreviewPage);
      const rightIdx = currentPreviewPage + 1;
      const right = pages.find((p) => p.index === rightIdx);
      return { left, right: rightIdx <= totalPages ? right : undefined };
    }
    return { left: pages.find((p) => p.index === currentPreviewPage), right: undefined };
  }, [previewMode, currentPreviewPage, pages, totalPages]);

  // Page dimensions
  const pageDisplayW = measurements.trimWidthIn * 72 * zoom;
  const pageDisplayH = measurements.trimHeightIn * 72 * zoom;

  // Spread info for navigation display
  const spreadInfo = useMemo(() => {
    if (previewMode === 'spread') {
      if (currentPreviewPage === 1) return 'Page 1';
      const right = Math.min(currentPreviewPage + 1, totalPages);
      return `Spread ${currentPreviewPage}–${right}`;
    }
    return `Page ${currentPreviewPage}`;
  }, [previewMode, currentPreviewPage, totalPages]);

  // Current page analysis
  const currentPageAnalysis = pageAnalyses.get(currentPreviewPage) || null;

  // Format-appropriate overlays
  const availableOverlays = useMemo(() => {
    return (Object.entries(OVERLAY_CONFIG) as [OverlayType, typeof OVERLAY_CONFIG[OverlayType]][])
      .filter(([, conf]) => conf.formats.includes(kdpFormat))
      .map(([type, conf]) => ({ type, label: conf.label, icon: conf.icon }));
  }, [kdpFormat]);

  // Kindle-specific features
  const [kindleDarkMode, setKindleDarkMode] = useState(false);

  return (
    <div className="flex flex-col h-full w-full">
      {/* ═══ Top Toolbar ═══ */}
      <div className="shrink-0 flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06] bg-white/[0.02] backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCheckerStep('config')}
            className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Config</span>
          </button>
          <div className="w-px h-4 bg-white/[0.08]" />
          <h2 className="text-sm font-semibold text-white/80 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-white/40" />
            Preview &amp; Validate
          </h2>
          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getStatusBg(overallStatus)} ${getStatusColor(overallStatus)}`}>
            {STATUS_LABELS[overallStatus]}
          </span>
        </div>

        {/* Center: View mode + Navigation */}
        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center bg-white/[0.04] rounded-lg border border-white/[0.06] p-0.5">
            <button
              onClick={() => setPreviewMode('single')}
              className={`p-1.5 rounded-md transition-all ${previewMode === 'single' ? 'bg-white/[0.1] text-white/80' : 'text-white/30 hover:text-white/50'}`}
              title="Single Page"
            >
              <FileText className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setPreviewMode('spread')}
              className={`p-1.5 rounded-md transition-all ${previewMode === 'spread' ? 'bg-white/[0.1] text-white/80' : 'text-white/30 hover:text-white/50'}`}
              title="Spread View"
            >
              <BookOpen className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="w-px h-4 bg-white/[0.06]" />

          {/* Navigation */}
          <button onClick={goPrev} disabled={!canGoPrev} className="p-1.5 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/[0.05] disabled:opacity-30 disabled:cursor-not-allowed transition-all">
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1.5 min-w-[100px] justify-center">
            <span className="text-xs text-white/60 font-medium tabular-nums">{spreadInfo}</span>
            <span className="text-[10px] text-white/25">of {totalPages}</span>
          </div>

          <button onClick={goNext} disabled={!canGoNext} className="p-1.5 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/[0.05] disabled:opacity-30 disabled:cursor-not-allowed transition-all">
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Page jump */}
          <div className="hidden sm:flex items-center gap-1">
            <input
              type="number"
              min={1}
              max={totalPages}
              value={pageJumpInput}
              onChange={(e) => setPageJumpInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handlePageJump()}
              placeholder="Go"
              className="w-10 h-6 text-[10px] text-center bg-white/[0.04] border border-white/[0.08] rounded-md text-white/60 placeholder:text-white/20 focus:outline-none focus:border-sky-400/30"
            />
          </div>
        </div>

        {/* Right: Zoom + Overlay + Kindle + Actions */}
        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <div className="flex items-center gap-0.5">
            <button onClick={zoomOut} className="p-1 rounded text-white/30 hover:text-white/60 hover:bg-white/[0.05] transition-all" title="Zoom Out">
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] text-white/40 tabular-nums w-10 text-center">{Math.round(zoom * 100)}%</span>
            <button onClick={zoomIn} className="p-1 rounded text-white/30 hover:text-white/60 hover:bg-white/[0.05] transition-all" title="Zoom In">
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button onClick={zoomFit} className="p-1 rounded text-white/30 hover:text-white/60 hover:bg-white/[0.05] transition-all" title="Fit to View">
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="w-px h-4 bg-white/[0.06]" />

          {/* Overlay toggles */}
          <div className="hidden md:flex items-center gap-0.5">
            {availableOverlays.map(({ type, label, icon: Icon }) => (
              <button
                key={type}
                onClick={() => toggleOverlay(type)}
                className={`p-1 rounded text-[10px] flex items-center gap-0.5 transition-all ${
                  activeOverlays.includes(type) ? 'bg-white/[0.1] text-white/70' : 'text-white/25 hover:text-white/50'
                }`}
                title={label}
              >
                <Icon className="w-3 h-3" />
                <span className="hidden lg:inline">{label}</span>
              </button>
            ))}
          </div>

          {/* Mobile overlay toggle */}
          <div className="md:hidden">
            <button
              onClick={() => {
                // Toggle most common overlay
                if (activeOverlays.length > 0) {
                  activeOverlays.forEach(o => toggleOverlay(o));
                } else {
                  toggleOverlay('safe');
                }
              }}
              className={`p-1.5 rounded-lg transition-all ${activeOverlays.length > 0 ? 'bg-white/[0.1] text-white/70' : 'text-white/30 hover:text-white/50'}`}
              title="Toggle Overlays"
            >
              <Layers className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Kindle dark mode toggle */}
          {kdpFormat === 'kindle' && (
            <>
              <div className="w-px h-4 bg-white/[0.06]" />
              <button
                onClick={() => setKindleDarkMode(!kindleDarkMode)}
                className={`p-1.5 rounded-lg transition-all ${kindleDarkMode ? 'bg-amber-500/20 text-amber-400' : 'text-white/30 hover:text-white/50'}`}
                title="Kindle Dark Mode"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          <div className="w-px h-4 bg-white/[0.06]" />

          {/* Issue panel toggle */}
          <button
            onClick={() => setIssuePanelCollapsed(!issuePanelCollapsed)}
            className={`p-1.5 rounded-lg transition-all ${!issuePanelCollapsed ? 'bg-white/[0.1] text-white/70' : 'text-white/30 hover:text-white/50'}`}
            title="Toggle Issues"
          >
            <Shield className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ═══ Main Content Area ═══ */}
      <div className="flex-1 flex min-h-0 relative">
        {/* Left: Issue Panel */}
        <AnimatePresence mode="wait">
          {!issuePanelCollapsed && (
            <IssuePanel
              reports={validationReports}
              pageIssues={pageIssues}
              onGoToPage={goToPage}
              collapsed={issuePanelCollapsed}
              onToggleCollapse={() => setIssuePanelCollapsed(true)}
              kdpFormat={kdpFormat}
            />
          )}
        </AnimatePresence>

        {/* Center: Preview Canvas */}
        <div
          ref={previewContainerRef}
          className="flex-1 min-w-0 overflow-auto flex items-center justify-center relative"
          style={{
            background: kindleDarkMode
              ? 'radial-gradient(ellipse at center, #1a1a1a 0%, #0d0d0d 100%)'
              : 'radial-gradient(ellipse at center, rgba(30,30,40,0.6) 0%, rgba(10,10,15,0.9) 100%)',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(255,255,255,0.1) transparent',
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          <motion.div
            className="flex items-center gap-3"
            style={{
              transform: `translate(${panOffset.x}px, ${panOffset.y}px)`,
              cursor: zoom > 1.2 ? (isPanning ? 'grabbing' : 'grab') : 'default',
            }}
            animate={{ opacity: 1 }}
            key={`${currentPreviewPage}-${previewMode}`}
            initial={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
          >
            {/* Left page (or single page) */}
            <PageRenderer
              dataUrl={currentPageData.left?.dataUrl}
              width={pageDisplayW}
              height={pageDisplayH}
              pageNumber={currentPreviewPage}
              measurements={measurements}
              activeOverlays={activeOverlays}
              isLeftPage={previewMode === 'spread'}
              kdpFormat={kdpFormat}
              isSelected
              pageAnalysis={currentPageAnalysis}
            />

            {/* Right page in spread mode */}
            {previewMode === 'spread' && currentPageData.right && (
              <>
                {/* Gutter simulation */}
                <div
                  className="shrink-0 rounded-sm"
                  style={{
                    width: Math.max(2, measurements.spineWidthIn * zoom * 72 * 0.3),
                    height: pageDisplayH,
                    background: 'linear-gradient(90deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.3) 100%)',
                    boxShadow: '2px 0 8px rgba(0,0,0,0.3), -2px 0 8px rgba(0,0,0,0.3)',
                  }}
                />
                <PageRenderer
                  dataUrl={currentPageData.right.dataUrl}
                  width={pageDisplayW}
                  height={pageDisplayH}
                  pageNumber={currentPreviewPage + 1}
                  measurements={measurements}
                  activeOverlays={activeOverlays}
                  isLeftPage={false}
                  kdpFormat={kdpFormat}
                  isSelected
                  pageAnalysis={pageAnalyses.get(currentPreviewPage + 1) || null}
                />
              </>
            )}
          </motion.div>

          {/* Empty state overlay */}
          {pages.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <FileText className="w-12 h-12 text-white/10 mx-auto mb-3" />
                <p className="text-white/30 text-sm">No manuscript uploaded</p>
                <p className="text-white/15 text-xs mt-1">Upload a PDF in the Import step to preview pages</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar: Metadata + Thumbnails */}
        <div className="w-[180px] shrink-0 flex flex-col gap-2 p-2">
          {/* Page Metadata */}
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl overflow-hidden">
            <PageMetadataPanel
              pageAnalysis={currentPageAnalysis}
              measurements={measurements}
              pageNumber={currentPreviewPage}
              totalPages={totalPages}
              kdpFormat={kdpFormat}
              previewMode={previewMode}
            />
          </div>

          {/* Thumbnail Navigator */}
          <div className="flex-1 min-h-0">
            <ThumbnailNavigator
              pages={pages}
              currentPage={currentPreviewPage}
              previewMode={previewMode}
              onPageClick={goToPage}
              pageIssues={pageIssues}
              pageAnalyses={pageAnalyses}
            />
          </div>
        </div>
      </div>

      {/* ═══ Bottom Action Bar ═══ */}
      <div className="shrink-0 flex items-center justify-between px-4 py-2 border-t border-white/[0.06] bg-white/[0.02] backdrop-blur-sm">
        <div className="flex items-center gap-2">
          {/* Navigation dots / progress */}
          <div className="hidden md:flex items-center gap-0.5">
            {pages.length > 0 && (
              <div className="flex items-center gap-1">
                <div className="w-24 h-1 bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sky-400/40 rounded-full transition-all duration-300"
                    style={{ width: `${(currentPreviewPage / totalPages) * 100}%` }}
                  />
                </div>
                <span className="text-[9px] text-white/25 tabular-nums">{Math.round((currentPreviewPage / totalPages) * 100)}%</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick reading flow navigation */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => goToPage(1)}
            disabled={currentPreviewPage === 1}
            className="text-[9px] text-white/25 hover:text-white/50 disabled:opacity-30 px-2 py-1 rounded transition-colors"
          >
            First
          </button>
          <button onClick={goPrev} disabled={!canGoPrev} className="p-1 rounded text-white/30 hover:text-white/60 disabled:opacity-30 transition-all">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-[10px] text-white/40 font-medium tabular-nums min-w-[60px] text-center">
            {currentPreviewPage} / {totalPages}
          </span>
          <button onClick={goNext} disabled={!canGoNext} className="p-1 rounded text-white/30 hover:text-white/60 disabled:opacity-30 transition-all">
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => goToPage(totalPages)}
            disabled={currentPreviewPage === totalPages}
            className="text-[9px] text-white/25 hover:text-white/50 disabled:opacity-30 px-2 py-1 rounded transition-colors"
          >
            Last
          </button>
        </div>

        {/* Final Actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCheckerStep('config')}
            className="flex items-center gap-1 text-[10px] text-white/30 hover:text-white/60 px-2 py-1.5 rounded-lg hover:bg-white/[0.04] transition-all"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Config</span>
          </button>
          <button
            onClick={() => setView('preview')}
            className="flex items-center gap-1 text-[10px] text-white/30 hover:text-white/60 px-2 py-1.5 rounded-lg hover:bg-white/[0.04] transition-all"
          >
            <Box className="w-3 h-3" />
            <span className="hidden sm:inline">3D Preview</span>
          </button>
          <button
            className="flex items-center gap-1 text-[10px] text-white/50 hover:text-white/80 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] transition-all"
          >
            <FileCheck className="w-3 h-3" />
            <span className="hidden sm:inline">Export Report</span>
          </button>
        </div>
      </div>
    </div>
  );
}
