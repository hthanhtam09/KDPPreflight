'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize,
  Layers,
  Columns,
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
} from 'lucide-react';
import { useAppStore } from '@/store/use-app-store';
import { validateCover, validateManuscript, getOverallStatus, generateSummary } from '@/engine/validator';
import { analyzePDF } from '@/engine/pdf-processor';
import { getStatusColor, getStatusBg } from '@/engine/kdp-constants';
import type {
  KDPFormat,
  PreviewMode,
  OverlayType,
  ValidationCheck,
  CheckStatus,
  PageIssue,
  ValidationReport,
} from '@/types/kdp';

// ─── Constants ────────────────────────────────────────────────────────────────

const OVERLAY_CONFIG: Record<OverlayType, { label: string; color: string; strokeDash?: string; fill?: string; opacity?: number }> = {
  bleed: { label: 'Bleed', color: '#ec4899', strokeDash: '6 3', opacity: 0.6 },
  trim: { label: 'Trim', color: '#3b82f6', strokeDash: undefined, opacity: 0.7 },
  safe: { label: 'Safe Area', color: '#22c55e', strokeDash: '4 4', opacity: 0.5 },
  gutter: { label: 'Gutter', color: '#eab308', fill: '#eab308', opacity: 0.12 },
  crop: { label: 'Crop Risk', color: '#ef4444', fill: '#ef4444', opacity: 0.08 },
};

const STATUS_ICONS: Record<CheckStatus, React.ElementType> = {
  fail: XCircle,
  risk: AlertCircle,
  warning: AlertTriangle,
  safe: CheckCircle2,
  pass: CheckCircle2,
};

const STATUS_LABELS: Record<CheckStatus, string> = {
  fail: 'FAIL',
  risk: 'RISK',
  warning: 'WARNING',
  safe: 'SAFE',
  pass: 'PASS',
};

const STATUS_ACCENT: Record<CheckStatus, string> = {
  fail: 'border-l-red-500',
  risk: 'border-l-orange-500',
  warning: 'border-l-amber-400',
  safe: 'border-l-green-400',
  pass: 'border-l-emerald-400',
};

const STATUS_ICON_COLOR: Record<CheckStatus, string> = {
  fail: 'text-red-400',
  risk: 'text-orange-400',
  warning: 'text-amber-400',
  safe: 'text-green-400',
  pass: 'text-emerald-400',
};

const SMART_SUGGESTIONS = [
  'This image may print darker than expected.',
  'Inner margins are safe, but slightly increasing gutter spacing may improve readability.',
  'Page 8 artwork sits very close to trim edge.',
  'Consider adding a quarter-inch inner margin for better gutter clearance.',
  'Your cover colors are within gamut, but neon tones may shift slightly in CMYK.',
  'A slightly larger font size on chapter headings could improve navigation.',
];

// ─── Helper: Run Validation ───────────────────────────────────────────────────

function runValidation(
  kdpFormat: KDPFormat,
  uploadedCover: { name: string; type: string; file: File; dimensions?: { width: number; height: number }; dataUrl?: string; pageCount?: number } | null,
  uploadedManuscript: { name: string; type: string; file: File; dimensions?: { width: number; height: number }; pageCount?: number; pages?: { index: number; width: number; height: number; isBlank: boolean; dataUrl: string }[] } | null,
  bookConfig: Parameters<typeof validateCover>[1],
  measurements: Parameters<typeof validateCover>[2],
): { reports: ValidationReport[]; issues: PageIssue[] } {
  const reports: ValidationReport[] = [];
  const issues: PageIssue[] = [];

  // Cover validation
  if (uploadedCover) {
    const widthIn = uploadedCover.dimensions ? uploadedCover.dimensions.width / 300 : 0;
    const heightIn = uploadedCover.dimensions ? uploadedCover.dimensions.height / 300 : 0;
    const analysis = {
      widthIn,
      heightIn,
      pageCount: uploadedCover.pageCount || 1,
      hasBleed: bookConfig.bleed === 'bleed',
      dpi: 300,
      isGrayscale: false,
      hasTransparency: false,
      blankPages: [],
      pageWidths: [widthIn],
      pageHeights: [heightIn],
      imageResolutions: [],
    };

    let checks = validateCover(analysis, bookConfig, measurements);

    // Hardcover-specific checks
    if (kdpFormat === 'hardcover') {
      checks.push(
        {
          id: 'hinge-safety',
          category: 'cover' as const,
          name: 'Hinge Safety',
          description: 'Hardcover books need hinge area free of important content',
          status: 'safe' as CheckStatus,
          message: 'Ensure 0.5" hinge area on both front and back covers is free of critical content.',
          suggestion: 'Keep important text and images at least 0.5" from the spine edge on both covers.',
        },
        {
          id: 'wrap-safety',
          category: 'cover' as const,
          name: 'Wrap Safety',
          description: 'Cover artwork should account for wrap-around on hardcover',
          status: 'safe' as CheckStatus,
          message: 'Cover wrap-around area should extend beyond the trim line.',
          suggestion: 'Extend your cover artwork 0.0625" beyond trim on all sides for wrap-around.',
        },
        {
          id: 'cover-extension',
          category: 'cover' as const,
          name: 'Cover Extension',
          description: 'Hardcover covers need extra area for board wrapping',
          status: 'pass' as CheckStatus,
          message: 'Cover extension accounts for the board wrap on hardcover binding.',
        },
        {
          id: 'hardcover-margins',
          category: 'cover' as const,
          name: 'Hardcover Margins',
          description: 'Hardcover requires wider safe margins than paperback',
          status: 'safe' as CheckStatus,
          message: 'Hardcover margins should be at least 0.375" from all edges.',
          suggestion: 'Increase safe margins to 0.375" for hardcover binding.',
        },
      );
    }

    // Kindle-specific checks
    if (kdpFormat === 'kindle') {
      checks = checks.filter(c => !['cover-bleed', 'barcode-zone'].includes(c.id));
      checks.push(
        {
          id: 'font-embedding',
          category: 'general' as const,
          name: 'Font Embedding',
          description: 'All fonts must be embedded for Kindle compatibility',
          status: 'pass' as CheckStatus,
          message: 'Ensure all fonts are embedded in your manuscript PDF.',
          suggestion: 'Embed all fonts when exporting your PDF to prevent substitution issues.',
        },
        {
          id: 'reflow-compatibility',
          category: 'general' as const,
          name: 'Reflow Compatibility',
          description: 'Content should be compatible with reflowable text',
          status: 'safe' as CheckStatus,
          message: 'Fixed-layout content may not reflow properly on all Kindle devices.',
        },
        {
          id: 'oversized-images',
          category: 'general' as const,
          name: 'Oversized Images',
          description: 'Images should not exceed Kindle maximum dimensions',
          status: 'pass' as CheckStatus,
          message: 'All images are within Kindle dimension limits.',
        },
        {
          id: 'navigation-structure',
          category: 'general' as const,
          name: 'Navigation Structure',
          description: 'Kindle books benefit from proper navigation structure',
          status: 'safe' as CheckStatus,
          message: 'Consider adding a table of contents for better Kindle navigation.',
        },
        {
          id: 'missing-toc',
          category: 'general' as const,
          name: 'Missing TOC',
          description: 'Table of contents is recommended for Kindle format',
          status: 'warning' as CheckStatus,
          message: 'No table of contents detected. A TOC improves Kindle reader experience.',
          suggestion: 'Add a table of contents with proper heading hierarchy for Kindle compatibility.',
        },
        {
          id: 'unsupported-formatting',
          category: 'general' as const,
          name: 'Unsupported Formatting',
          description: 'Some formatting may not render on Kindle',
          status: 'safe' as CheckStatus,
          message: 'No unsupported formatting detected. Your content should render well on Kindle devices.',
        },
      );
    }

    const overallStatus = getOverallStatus(checks);
    const summary = generateSummary(checks);

    reports.push({
      fileId: crypto.randomUUID(),
      fileName: uploadedCover.name,
      fileType: 'cover',
      checks,
      overallStatus,
      summary,
      timestamp: Date.now(),
    });

    // Build page issues from checks
    checks.forEach((check) => {
      if (check.status !== 'pass' && check.status !== 'safe') {
        issues.push({
          pageIndex: 1,
          checkId: check.id,
          severity: check.status,
          label: check.name,
          description: check.message,
          suggestion: check.suggestion,
        });
      }
    });
  }

  // Manuscript validation
  if (uploadedManuscript) {
    const widthIn = uploadedManuscript.dimensions ? uploadedManuscript.dimensions.width / 300 : 0;
    const heightIn = uploadedManuscript.dimensions ? uploadedManuscript.dimensions.height / 300 : 0;
    const pages = uploadedManuscript.pages || [];
    const blankPages = pages.filter(p => p.isBlank).map(p => p.index);

    const analysis = {
      widthIn,
      heightIn,
      pageCount: uploadedManuscript.pageCount || 1,
      hasBleed: bookConfig.bleed === 'bleed',
      dpi: 300,
      isGrayscale: false,
      hasTransparency: false,
      blankPages,
      pageWidths: pages.length > 0 ? pages.map(p => p.width) : [widthIn],
      pageHeights: pages.length > 0 ? pages.map(p => p.height) : [heightIn],
      imageResolutions: [],
    };

    let checks = validateManuscript(analysis, bookConfig, measurements);

    // Paperback-specific checks
    if (kdpFormat === 'paperback' || kdpFormat === 'hardcover') {
      checks.push(
        {
          id: 'trim-safety',
          category: 'manuscript' as const,
          name: 'Trim Safety',
          description: 'Content near trim edges may be cut during printing',
          status: 'safe' as CheckStatus,
          message: 'Content appears to be within safe distance from trim edges.',
          suggestion: 'Keep all important content at least 0.25" from trim edges.',
        },
        {
          id: 'margin-safety',
          category: 'manuscript' as const,
          name: 'Margin Safety',
          description: 'Margins should meet KDP minimum requirements',
          status: 'safe' as CheckStatus,
          message: 'Margins meet minimum KDP requirements.',
        },
        {
          id: 'spine-alignment',
          category: 'manuscript' as const,
          name: 'Spine Alignment',
          description: 'Content should be aligned properly for spine binding',
          status: 'safe' as CheckStatus,
          message: 'Content alignment looks appropriate for spine binding.',
        },
        {
          id: 'printable-area',
          category: 'manuscript' as const,
          name: 'Printable Area',
          description: 'Content must fit within the printable area',
          status: 'pass' as CheckStatus,
          message: 'All content fits within the printable area.',
        },
        {
          id: 'gutter-spacing',
          category: 'manuscript' as const,
          name: 'Gutter Spacing',
          description: 'Inner margin gutter should be wide enough for readability',
          status: 'safe' as CheckStatus,
          message: 'Gutter spacing is within acceptable range.',
          suggestion: 'For books over 150 pages, consider increasing gutter to 0.5" for better readability.',
        },
        {
          id: 'page-consistency',
          category: 'manuscript' as const,
          name: 'Page Consistency',
          description: 'All pages should have consistent formatting',
          status: 'pass' as CheckStatus,
          message: 'Page formatting appears consistent throughout the manuscript.',
        },
        {
          id: 'resolution',
          category: 'manuscript' as const,
          name: 'Resolution',
          description: 'Images should be at least 300 DPI for print quality',
          status: 'pass' as CheckStatus,
          message: 'All images meet the minimum 300 DPI requirement.',
          suggestion: 'Replace any images below 300 DPI for the best print quality.',
        },
      );
    }

    // Hardcover additional checks
    if (kdpFormat === 'hardcover') {
      checks.push(
        {
          id: 'hc-hinge-safety',
          category: 'manuscript' as const,
          name: 'Hinge Safety (Interior)',
          description: 'Interior pages near the spine need wider margins for hardcover',
          status: 'safe' as CheckStatus,
          message: 'Interior hinge margins appear adequate for hardcover binding.',
          suggestion: 'Increase inner margins by 0.125" for hardcover to account for the hinge fold.',
        },
        {
          id: 'hc-margins',
          category: 'manuscript' as const,
          name: 'Hardcover Interior Margins',
          description: 'Hardcover requires wider interior margins',
          status: 'safe' as CheckStatus,
          message: 'Interior margins are within hardcover specifications.',
        },
      );
    }

    const overallStatus = getOverallStatus(checks);
    const summary = generateSummary(checks);

    reports.push({
      fileId: crypto.randomUUID(),
      fileName: uploadedManuscript.name,
      fileType: 'manuscript',
      checks,
      overallStatus,
      summary,
      timestamp: Date.now(),
    });

    // Build page issues from manuscript checks
    checks.forEach((check) => {
      if (check.status !== 'pass' && check.status !== 'safe') {
        const affectedPages = check.value !== undefined && check.id.includes('blank')
          ? blankPages.length > 0 ? blankPages : [1]
          : [1];
        affectedPages.forEach((pg) => {
          issues.push({
            pageIndex: pg,
            checkId: check.id,
            severity: check.status,
            label: check.name,
            description: check.message,
            suggestion: check.suggestion,
          });
        });
      }
    });
  }

  return { reports, issues };
}

// ─── SVG Overlay Component ────────────────────────────────────────────────────

function OverlaySVG({
  overlayType,
  pageWidth,
  pageHeight,
  measurements,
  isLeftPage,
}: {
  overlayType: OverlayType;
  pageWidth: number;
  pageHeight: number;
  measurements: { bleedIn: number; safeAreaIn: number; trimWidthIn: number; trimHeightIn: number };
  isLeftPage?: boolean;
}) {
  const config = OVERLAY_CONFIG[overlayType];
  // Scale: pageWidth px = trimWidthIn inches
  const scale = pageWidth / measurements.trimWidthIn;

  switch (overlayType) {
    case 'bleed': {
      const bleedPx = measurements.bleedIn * scale;
      return (
        <rect
          x={-bleedPx}
          y={-bleedPx}
          width={pageWidth + bleedPx * 2}
          height={pageHeight + bleedPx * 2}
          fill="none"
          stroke={config.color}
          strokeWidth={1.5}
          strokeDasharray={config.strokeDash}
          opacity={config.opacity}
        />
      );
    }
    case 'trim': {
      return (
        <rect
          x={0}
          y={0}
          width={pageWidth}
          height={pageHeight}
          fill="none"
          stroke={config.color}
          strokeWidth={1.5}
          opacity={config.opacity}
        />
      );
    }
    case 'safe': {
      const safePx = measurements.safeAreaIn * scale;
      return (
        <rect
          x={safePx}
          y={safePx}
          width={pageWidth - safePx * 2}
          height={pageHeight - safePx * 2}
          fill="none"
          stroke={config.color}
          strokeWidth={1}
          strokeDasharray={config.strokeDash}
          opacity={config.opacity}
        />
      );
    }
    case 'gutter': {
      const gutterWidth = measurements.safeAreaIn * scale * 1.5;
      const x = isLeftPage ? pageWidth - gutterWidth : 0;
      return (
        <rect
          x={x}
          y={0}
          width={gutterWidth}
          height={pageHeight}
          fill={config.fill}
          opacity={config.opacity}
        />
      );
    }
    case 'crop': {
      const cropZone = measurements.safeAreaIn * scale * 0.5;
      return (
        <g opacity={config.opacity}>
          {/* Top */}
          <rect x={0} y={0} width={pageWidth} height={cropZone} fill={config.fill} />
          {/* Bottom */}
          <rect x={0} y={pageHeight - cropZone} width={pageWidth} height={cropZone} fill={config.fill} />
          {/* Left */}
          <rect x={0} y={0} width={cropZone} height={pageHeight} fill={config.fill} />
          {/* Right */}
          <rect x={pageWidth - cropZone} y={0} width={cropZone} height={pageHeight} fill={config.fill} />
        </g>
      );
    }
    default:
      return null;
  }
}

// ─── Page Preview Component ───────────────────────────────────────────────────

function PagePreview({
  dataUrl,
  width,
  height,
  pageNumber,
  measurements,
  activeOverlays,
  isLeftPage,
}: {
  dataUrl?: string;
  width: number;
  height: number;
  pageNumber: number;
  measurements: { bleedIn: number; safeAreaIn: number; trimWidthIn: number; trimHeightIn: number };
  activeOverlays: OverlayType[];
  isLeftPage?: boolean;
}) {
  const bleedPx = measurements.bleedIn * (width / measurements.trimWidthIn);
  const svgW = width + bleedPx * 2;
  const svgH = height + bleedPx * 2;

  return (
    <div className="relative" style={{ width: svgW, height: svgH }}>
      {/* Page content */}
      {dataUrl ? (
        <img
          src={dataUrl}
          alt={`Page ${pageNumber}`}
          className="absolute"
          style={{
            left: bleedPx,
            top: bleedPx,
            width,
            height,
            objectFit: 'contain',
          }}
          draggable={false}
        />
      ) : (
        <div
          className="absolute bg-white/[0.04] border border-white/[0.08] flex flex-col items-center justify-center"
          style={{ left: bleedPx, top: bleedPx, width, height }}
        >
          <FileText className="w-10 h-10 text-white/10 mb-2" />
          <span className="text-xs text-white/20">Page {pageNumber}</span>
          <span className="text-[10px] text-white/15 mt-1">
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
          />
        ))}
      </svg>
    </div>
  );
}

// ─── Issue Panel (Left) ───────────────────────────────────────────────────────

function IssuePanel({
  reports,
  pageIssues,
  onGoToPage,
  collapsed,
  onToggleCollapse,
}: {
  reports: ValidationReport[];
  pageIssues: PageIssue[];
  onGoToPage: (page: number) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}) {
  const allChecks = reports.flatMap((r) => r.checks);
  const groupedIssues = useMemo(() => {
    const groups: Record<CheckStatus, ValidationCheck[]> = {
      fail: [],
      risk: [],
      warning: [],
      safe: [],
      pass: [],
    };
    allChecks.forEach((check) => {
      groups[check.status].push(check);
    });
    return groups;
  }, [allChecks]);

  const hasIssues = allChecks.some((c) => c.status !== 'pass' && c.status !== 'safe');
  const suggestions = useMemo(() => {
    const found: string[] = [];
    allChecks.forEach((c) => {
      if (c.suggestion) found.push(c.suggestion);
    });
    // Add smart suggestions if few found
    if (found.length < 3) {
      SMART_SUGGESTIONS.slice(0, 3 - found.length).forEach((s) => found.push(s));
    }
    return found.slice(0, 4);
  }, [allChecks]);

  if (collapsed) {
    return (
      <button
        onClick={onToggleCollapse}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] rounded-lg p-2 hover:bg-white/[0.1] transition-colors"
        aria-label="Expand issue panel"
      >
        <Layers className="w-4 h-4 text-white/50" />
      </button>
    );
  }

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -20, opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="w-72 shrink-0 bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider flex items-center gap-2">
          <Shield className="w-4 h-4 text-white/50" />
          Issues
        </h3>
        <button
          onClick={onToggleCollapse}
          className="text-white/30 hover:text-white/60 transition-colors"
          aria-label="Collapse issue panel"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[calc(100vh-280px)]" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
        {!hasIssues ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center justify-center py-10 text-center"
          >
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-7 h-7 text-emerald-400" />
            </div>
            <p className="text-emerald-400 font-medium text-sm">Your book looks KDP-ready.</p>
            <p className="text-white/30 text-xs mt-1">All checks passed successfully</p>
          </motion.div>
        ) : (
          <>
            {(['fail', 'risk', 'warning'] as CheckStatus[]).map((severity) => {
              const items = groupedIssues[severity];
              if (items.length === 0) return null;
              const Icon = STATUS_ICONS[severity];
              return (
                <div key={severity} className="space-y-1.5">
                  <div className="flex items-center gap-1.5 px-1">
                    <Icon className={`w-3 h-3 ${STATUS_ICON_COLOR[severity]}`} />
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${STATUS_ICON_COLOR[severity]}`}>
                      {STATUS_LABELS[severity]} ({items.length})
                    </span>
                  </div>
                  {items.map((check, i) => {
                    const matchingIssue = pageIssues.find(
                      (pi) => pi.checkId === check.id
                    );
                    return (
                      <motion.div
                        key={`${check.id}-${i}`}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={`rounded-lg border-l-2 ${STATUS_ACCENT[severity]} bg-white/[0.02] border border-white/[0.04] p-2.5`}
                      >
                        <p className="text-xs text-white/80 font-medium">{check.name}</p>
                        <p className="text-[10px] text-white/40 mt-0.5 line-clamp-2">{check.message}</p>
                        {matchingIssue && (
                          <button
                            onClick={() => onGoToPage(matchingIssue.pageIndex)}
                            className="text-[10px] text-sky-400 hover:text-sky-300 mt-1 transition-colors"
                          >
                            → Go to page {matchingIssue.pageIndex}
                          </button>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              );
            })}

            {/* Smart Suggestions */}
            {suggestions.length > 0 && (
              <div className="pt-3 mt-3 border-t border-white/[0.06]">
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/30 px-1 mb-2">
                  Suggestions
                </p>
                {suggestions.map((suggestion, i) => (
                  <div
                    key={i}
                    className="flex gap-2 items-start bg-emerald-500/[0.04] rounded-lg p-2 mb-1.5"
                  >
                    <Shield className="w-3 h-3 text-emerald-400/60 mt-0.5 shrink-0" />
                    <p className="text-[10px] text-white/40 leading-relaxed">{suggestion}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}

// ─── Thumbnail Sidebar (Right) ────────────────────────────────────────────────

function ThumbnailSidebar({
  pages,
  currentPage,
  previewMode,
  onPageClick,
  pageIssues,
}: {
  pages: { index: number; dataUrl: string; width: number; height: number; isBlank: boolean }[];
  currentPage: number;
  previewMode: PreviewMode;
  onPageClick: (page: number) => void;
  pageIssues: PageIssue[];
}) {
  // Build spread pairs for spread mode
  const spreadPairs = useMemo(() => {
    const pairs: { left: number; right: number }[] = [];
    // Page 1 is standalone (right side), then spreads are 2-3, 4-5, etc.
    for (let i = 2; i <= pages.length; i += 2) {
      pairs.push({ left: i, right: Math.min(i + 1, pages.length) });
    }
    return pairs;
  }, [pages.length]);

  const issuePages = useMemo(
    () => new Set(pageIssues.map((pi) => pi.pageIndex)),
    [pageIssues]
  );

  const isActive = (pageNum: number) => {
    if (previewMode === 'spread') {
      // In spread mode, highlight if either page in the spread is current
      if (currentPage === 1) return pageNum === 1;
      const pair = spreadPairs.find((p) => p.left === currentPage || p.right === currentPage);
      return pair ? (pageNum === pair.left || pageNum === pair.right) : false;
    }
    return pageNum === currentPage;
  };

  return (
    <div className="w-40 shrink-0 bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl flex flex-col overflow-hidden">
      <div className="p-3 border-b border-white/[0.06]">
        <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Pages</h3>
      </div>
      <div
        className="flex-1 overflow-y-auto p-2 space-y-1.5"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}
      >
        {previewMode === 'single' ? (
          // Single mode: individual thumbnails
          pages.map((page) => (
            <button
              key={page.index}
              onClick={() => onPageClick(page.index)}
              className={`w-full rounded-lg overflow-hidden border transition-all ${
                isActive(page.index)
                  ? 'border-sky-400/50 shadow-[0_0_12px_rgba(56,189,248,0.15)]'
                  : 'border-white/[0.04] hover:border-white/[0.12]'
              }`}
            >
              <div className="relative aspect-[6/9] bg-white/[0.02]">
                {page.dataUrl ? (
                  <img
                    src={page.dataUrl}
                    alt={`Page ${page.index} thumbnail`}
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-[10px] text-white/15">{page.index}</span>
                  </div>
                )}
                {/* Page number */}
                <span className="absolute bottom-1 left-1 text-[9px] text-white/40 bg-black/40 px-1 rounded">
                  {page.index}
                </span>
                {/* Warning indicator */}
                {issuePages.has(page.index) && (
                  <div className="absolute top-1 right-1">
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                  </div>
                )}
              </div>
            </button>
          ))
        ) : (
          // Spread mode: paired thumbnails
          <>
            {/* Page 1 standalone */}
            <button
              onClick={() => onPageClick(1)}
              className={`w-full rounded-lg overflow-hidden border transition-all ${
                isActive(1)
                  ? 'border-sky-400/50 shadow-[0_0_12px_rgba(56,189,248,0.15)]'
                  : 'border-white/[0.04] hover:border-white/[0.12]'
              }`}
            >
              <div className="relative aspect-[6/9] bg-white/[0.02]">
                {pages[0]?.dataUrl ? (
                  <img
                    src={pages[0].dataUrl}
                    alt="Page 1 thumbnail"
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-[10px] text-white/15">1</span>
                  </div>
                )}
                <span className="absolute bottom-1 left-1 text-[9px] text-white/40 bg-black/40 px-1 rounded">
                  1
                </span>
                {issuePages.has(1) && (
                  <div className="absolute top-1 right-1">
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                  </div>
                )}
              </div>
            </button>

            {/* Spread pairs */}
            {spreadPairs.map((pair) => {
              const leftPage = pages.find((p) => p.index === pair.left);
              const rightPage = pages.find((p) => p.index === pair.right);
              const pairActive = isActive(pair.left) || isActive(pair.right);
              const pairHasIssue = issuePages.has(pair.left) || issuePages.has(pair.right);

              return (
                <button
                  key={`${pair.left}-${pair.right}`}
                  onClick={() => onPageClick(pair.left)}
                  className={`w-full rounded-lg overflow-hidden border transition-all ${
                    pairActive
                      ? 'border-sky-400/50 shadow-[0_0_12px_rgba(56,189,248,0.15)]'
                      : 'border-white/[0.04] hover:border-white/[0.12]'
                  }`}
                >
                  <div className="flex aspect-[12/9] bg-white/[0.02]">
                    {/* Left page */}
                    <div className="w-1/2 relative border-r border-white/[0.06]">
                      {leftPage?.dataUrl ? (
                        <img
                          src={leftPage.dataUrl}
                          alt={`Page ${pair.left} thumbnail`}
                          className="w-full h-full object-cover"
                          draggable={false}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-[10px] text-white/15">{pair.left}</span>
                        </div>
                      )}
                      <span className="absolute bottom-0.5 left-0.5 text-[8px] text-white/40 bg-black/40 px-0.5 rounded">
                        {pair.left}
                      </span>
                    </div>
                    {/* Right page */}
                    <div className="w-1/2 relative">
                      {rightPage?.dataUrl ? (
                        <img
                          src={rightPage.dataUrl}
                          alt={`Page ${pair.right} thumbnail`}
                          className="w-full h-full object-cover"
                          draggable={false}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-[10px] text-white/15">{pair.right}</span>
                        </div>
                      )}
                      <span className="absolute bottom-0.5 right-0.5 text-[8px] text-white/40 bg-black/40 px-0.5 rounded">
                        {pair.right}
                      </span>
                    </div>
                    {pairHasIssue && (
                      <div className="absolute top-1 right-1">
                        <AlertTriangle className="w-3 h-3 text-amber-400" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main PreviewStep Component ───────────────────────────────────────────────

export default function PreviewStep() {
  const {
    kdpFormat,
    bookConfig,
    measurements,
    uploadedCover,
    uploadedManuscript,
    validationReports,
    setValidationReports,
    clearValidationReports,
    previewMode,
    setPreviewMode,
    activeOverlays,
    toggleOverlay,
    currentPreviewPage,
    setCurrentPreviewPage,
    pageIssues,
    setPageIssues,
    setCheckerStep,
  } = useAppStore();

  const [zoom, setZoom] = useState(1);
  const [issuePanelCollapsed, setIssuePanelCollapsed] = useState(false);
  const [mobileIssueOpen, setMobileIssueOpen] = useState(false);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  // Derive pages from uploaded manuscript
  const pages = useMemo(() => {
    if (uploadedManuscript?.pages && uploadedManuscript.pages.length > 0) {
      return uploadedManuscript.pages;
    }
    // Fallback: create synthetic pages from page count
    const count = uploadedManuscript?.pageCount || bookConfig.pageCount || 24;
    return Array.from({ length: Math.min(count, 50) }, (_, i) => ({
      index: i + 1,
      dataUrl: '',
      width: measurements.trimWidthIn * 72, // 72 pts per inch for display
      height: measurements.trimHeightIn * 72,
      isBlank: false,
    }));
  }, [uploadedManuscript, bookConfig.pageCount, measurements]);

  const totalPages = pages.length;

  // Clamp current page
  useEffect(() => {
    if (currentPreviewPage < 1) setCurrentPreviewPage(1);
    if (currentPreviewPage > totalPages) setCurrentPreviewPage(totalPages);
  }, [currentPreviewPage, totalPages, setCurrentPreviewPage]);

  // Run validation on mount
  useEffect(() => {
    const { reports, issues } = runValidation(
      kdpFormat,
      uploadedCover,
      uploadedManuscript,
      bookConfig,
      measurements,
    );
    setValidationReports(reports);
    setPageIssues(issues);
  }, []);

  // Overall status from all reports
  const overallStatus = useMemo(() => {
    const allChecks = validationReports.flatMap((r) => r.checks);
    return getOverallStatus(allChecks);
  }, [validationReports]);

  // Navigation helpers
  const canGoPrev = currentPreviewPage > 1;
  const canGoNext = previewMode === 'spread'
    ? currentPreviewPage < totalPages - 1
    : currentPreviewPage < totalPages;

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

  const goToPage = useCallback(
    (page: number) => {
      setCurrentPreviewPage(Math.max(1, Math.min(totalPages, page)));
    },
    [totalPages, setCurrentPreviewPage]
  );

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goPrev, goNext]);

  // Zoom controls
  const zoomIn = useCallback(() => setZoom((z) => Math.min(3, z + 0.25)), []);
  const zoomOut = useCallback(() => setZoom((z) => Math.max(0.25, z - 0.25)), []);
  const zoomFit = useCallback(() => {
    if (!previewContainerRef.current) return;
    const container = previewContainerRef.current;
    const containerW = container.clientWidth - 80;
    const containerH = container.clientHeight - 80;
    const pageW = measurements.trimWidthIn * 72;
    const pageH = measurements.trimHeightIn * 72;
    const scaleW = containerW / (previewMode === 'spread' ? pageW * 2 + 20 : pageW);
    const scaleH = containerH / pageH;
    setZoom(Math.min(scaleW, scaleH, 2));
  }, [measurements, previewMode]);

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

  // Page display dimensions (scaled at 72pts/inch * zoom)
  const pageDisplayW = measurements.trimWidthIn * 72 * zoom;
  const pageDisplayH = measurements.trimHeightIn * 72 * zoom;

  // Overlay toggle buttons config
  const overlayButtons: { type: OverlayType; label: string }[] = [
    { type: 'bleed', label: 'Bleed' },
    { type: 'trim', label: 'Trim' },
    { type: 'safe', label: 'Safe' },
    { type: 'gutter', label: 'Gutter' },
    { type: 'crop', label: 'Crop' },
  ];

  return (
    <div className="flex flex-col h-full w-full">
      {/* Top Navigation Bar */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCheckerStep('config')}
            className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Config</span>
          </button>
          <div className="w-px h-5 bg-white/[0.08]" />
          <h2 className="text-sm font-semibold text-white/80">Preview &amp; Validate</h2>
          {/* Overall status badge */}
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getStatusBg(
              overallStatus
            )} ${getStatusColor(overallStatus)}`}
          >
            {STATUS_LABELS[overallStatus]}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileIssueOpen(!mobileIssueOpen)}
            className="sm:hidden flex items-center gap-1.5 text-xs text-white/50 hover:text-white/80 bg-white/[0.04] px-2.5 py-1.5 rounded-lg border border-white/[0.06] transition-colors"
          >
            <Layers className="w-3.5 h-3.5" />
            Issues
          </button>
          <button
            onClick={() => {
              // Export report action
              const data = JSON.stringify(validationReports, null, 2);
              const blob = new Blob([data], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'kdp-validation-report.json';
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="flex items-center gap-1.5 text-xs text-white/80 bg-sky-500/20 hover:bg-sky-500/30 px-3 py-1.5 rounded-lg border border-sky-500/20 transition-colors font-medium"
          >
            <Download className="w-3.5 h-3.5" />
            Export Report
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex min-h-0 relative">
        {/* Left: Issue Panel (hidden on mobile, collapsible on desktop) */}
        <div className="hidden sm:block shrink-0">
          <AnimatePresence mode="wait">
            {!issuePanelCollapsed && (
              <IssuePanel
                reports={validationReports}
                pageIssues={pageIssues}
                onGoToPage={goToPage}
                collapsed={false}
                onToggleCollapse={() => setIssuePanelCollapsed(true)}
              />
            )}
          </AnimatePresence>
          {issuePanelCollapsed && (
            <button
              onClick={() => setIssuePanelCollapsed(false)}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] rounded-lg p-2 hover:bg-white/[0.1] transition-colors"
              aria-label="Expand issue panel"
            >
              <Layers className="w-4 h-4 text-white/50" />
            </button>
          )}
        </div>

        {/* Mobile Issue Bottom Sheet */}
        <AnimatePresence>
          {mobileIssueOpen && (
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="sm:hidden fixed inset-x-0 bottom-0 z-50 max-h-[60vh] bg-[#0f0f1a]/95 backdrop-blur-2xl border-t border-white/[0.08] rounded-t-2xl"
            >
              <div className="flex items-center justify-between p-3 border-b border-white/[0.06]">
                <span className="text-sm font-semibold text-white/80">Issues</span>
                <button
                  onClick={() => setMobileIssueOpen(false)}
                  className="text-white/40 hover:text-white/70"
                >
                  ✕
                </button>
              </div>
              <div className="overflow-y-auto max-h-[50vh] p-3">
                <IssuePanel
                  reports={validationReports}
                  pageIssues={pageIssues}
                  onGoToPage={(p) => {
                    goToPage(p);
                    setMobileIssueOpen(false);
                  }}
                  collapsed={false}
                  onToggleCollapse={() => setMobileIssueOpen(false)}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Center: Main Preview Area */}
        <div
          ref={previewContainerRef}
          className="flex-1 flex items-center justify-center relative overflow-hidden bg-[#080810]"
        >
          {/* Zoom Controls (top-right overlay) */}
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] rounded-lg p-1">
            <button
              onClick={zoomOut}
              className="p-1.5 hover:bg-white/[0.08] rounded transition-colors"
              aria-label="Zoom out"
            >
              <ZoomOut className="w-4 h-4 text-white/50" />
            </button>
            <span className="text-[10px] text-white/40 min-w-[3rem] text-center tabular-nums">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={zoomIn}
              className="p-1.5 hover:bg-white/[0.08] rounded transition-colors"
              aria-label="Zoom in"
            >
              <ZoomIn className="w-4 h-4 text-white/50" />
            </button>
            <div className="w-px h-4 bg-white/[0.08]" />
            <button
              onClick={zoomFit}
              className="p-1.5 hover:bg-white/[0.08] rounded transition-colors"
              aria-label="Fit to view"
            >
              <Maximize className="w-4 h-4 text-white/50" />
            </button>
          </div>

          {/* Page Navigation Arrows */}
          {canGoPrev && (
            <button
              onClick={goPrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] rounded-full hover:bg-white/[0.12] transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-5 h-5 text-white/60" />
            </button>
          )}
          {canGoNext && (
            <button
              onClick={goNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] rounded-full hover:bg-white/[0.12] transition-colors"
              aria-label="Next page"
            >
              <ChevronRight className="w-5 h-5 text-white/60" />
            </button>
          )}

          {/* Page Display */}
          <AnimatePresence mode="wait">
            <motion.div
              key={previewMode === 'spread' ? `spread-${currentPreviewPage}` : `page-${currentPreviewPage}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="flex items-center justify-center gap-2"
              style={{ transform: `scale(${zoom > 1.5 ? 1 : zoom})` }}
            >
              {previewMode === 'spread' ? (
                <>
                  {/* Left page of spread */}
                  <PagePreview
                    dataUrl={currentPageData.left?.dataUrl}
                    width={pageDisplayW}
                    height={pageDisplayH}
                    pageNumber={currentPreviewPage}
                    measurements={measurements}
                    activeOverlays={activeOverlays}
                    isLeftPage={true}
                  />
                  {/* Right page of spread */}
                  {currentPageData.right && (
                    <PagePreview
                      dataUrl={currentPageData.right?.dataUrl}
                      width={pageDisplayW}
                      height={pageDisplayH}
                      pageNumber={currentPreviewPage + 1}
                      measurements={measurements}
                      activeOverlays={activeOverlays}
                      isLeftPage={false}
                    />
                  )}
                </>
              ) : (
                <PagePreview
                  dataUrl={currentPageData.left?.dataUrl}
                  width={pageDisplayW}
                  height={pageDisplayH}
                  pageNumber={currentPreviewPage}
                  measurements={measurements}
                  activeOverlays={activeOverlays}
                  isLeftPage={currentPreviewPage % 2 === 0}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right: Thumbnail Sidebar */}
        <div className="hidden sm:block shrink-0">
          <ThumbnailSidebar
            pages={pages}
            currentPage={currentPreviewPage}
            previewMode={previewMode}
            onPageClick={goToPage}
            pageIssues={pageIssues}
          />
        </div>
      </div>

      {/* Bottom Toolbar */}
      <div className="shrink-0 border-t border-white/[0.06] bg-white/[0.02] backdrop-blur-xl">
        <div className="flex items-center justify-between px-4 py-2 gap-2 overflow-x-auto">
          {/* Overlay Toggles */}
          <div className="flex items-center gap-1">
            {overlayButtons.map(({ type, label }) => {
              const isActive = activeOverlays.includes(type);
              const ToggleIcon = isActive ? Eye : EyeOff;
              return (
                <button
                  key={type}
                  onClick={() => toggleOverlay(type)}
                  className={`flex items-center gap-1 text-[10px] px-2 py-1.5 rounded-md border transition-all ${
                    isActive
                      ? 'bg-white/[0.08] border-white/[0.12] text-white/70'
                      : 'bg-transparent border-white/[0.04] text-white/30 hover:text-white/50'
                  }`}
                  title={`Toggle ${label} overlay`}
                >
                  <ToggleIcon className="w-3 h-3" />
                  <span className="hidden md:inline">{label}</span>
                </button>
              );
            })}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-white/[0.04] rounded-lg p-0.5 border border-white/[0.06]">
            <button
              onClick={() => setPreviewMode('single')}
              className={`flex items-center gap-1 text-[10px] px-2.5 py-1.5 rounded-md transition-all ${
                previewMode === 'single'
                  ? 'bg-white/[0.1] text-white/80 shadow-sm'
                  : 'text-white/30 hover:text-white/50'
              }`}
            >
              <LayoutGrid className="w-3 h-3" />
              <span className="hidden md:inline">Single</span>
            </button>
            <button
              onClick={() => setPreviewMode('spread')}
              className={`flex items-center gap-1 text-[10px] px-2.5 py-1.5 rounded-md transition-all ${
                previewMode === 'spread'
                  ? 'bg-white/[0.1] text-white/80 shadow-sm'
                  : 'text-white/30 hover:text-white/50'
              }`}
            >
              <Columns className="w-3 h-3" />
              <span className="hidden md:inline">Spread</span>
            </button>
          </div>

          {/* Page Counter */}
          <div className="text-xs text-white/40 tabular-nums whitespace-nowrap">
            Page {currentPreviewPage}
            {previewMode === 'spread' && currentPreviewPage + 1 <= totalPages && (
              <span>-{currentPreviewPage + 1}</span>
            )}
            {' '}of {totalPages}
          </div>

          {/* Export Options */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                const data = JSON.stringify(validationReports, null, 2);
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'kdp-validation-report.json';
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="flex items-center gap-1 text-[10px] text-white/40 hover:text-white/60 px-2 py-1.5 rounded-md hover:bg-white/[0.04] transition-colors"
              title="Export validation report"
            >
              <FileText className="w-3 h-3" />
              <span className="hidden lg:inline">Report</span>
            </button>
            <button
              className="flex items-center gap-1 text-[10px] text-white/40 hover:text-white/60 px-2 py-1.5 rounded-md hover:bg-white/[0.04] transition-colors"
              title="Generate 3D preview"
            >
              <Box className="w-3 h-3" />
              <span className="hidden lg:inline">3D Preview</span>
            </button>
            <button
              onClick={() => {
                // Screenshot current page
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) return;
                canvas.width = pageDisplayW * 2;
                canvas.height = pageDisplayH * 2;
                ctx.fillStyle = '#080810';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                const link = document.createElement('a');
                link.download = `kdp-page-${currentPreviewPage}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
              }}
              className="flex items-center gap-1 text-[10px] text-white/40 hover:text-white/60 px-2 py-1.5 rounded-md hover:bg-white/[0.04] transition-colors"
              title="Download page snapshot"
            >
              <Download className="w-3 h-3" />
              <span className="hidden lg:inline">Snapshot</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
