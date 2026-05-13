'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  FileText,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Maximize2,
  BookOpen,
  Monitor,
  Box,
  Minus,
  Plus,
  Search,
  Filter,
  Ruler,
  Info,
  XCircle,
  AlertTriangle,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  Image as ImageIcon,
  RotateCcw,
  Upload,
  Settings,
} from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useAppStore } from '@/store/use-app-store';
import { loadPDF, renderSinglePage } from '@/engine/pdf-processor';
import {
  OverlayType,
  PreviewViewMode,
  CheckStatus,
  BookPage,
  ProcessingStatus,
  PageIssueExtended,
  IssueFilter,
  SpreadModel,
  ValidationSummary,
  KdpRiskLevel,
} from '@/types/kdp';
import { computeValidationSummary, analyzePagesForIssues, PDFAnalysisResult } from '@/engine/validator';
import {
  getStatusColor,
  getStatusIcon,
  getStatusBg,
} from '@/engine/kdp-constants';
import {
  saveWorkspace,
  loadWorkspace,
  clearWorkspace,
  mapToRecord,
  recordToMap,
  SavedWorkspace,
  SaveStatus,
} from '@/lib/persistence';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const OVERLAY_CONFIG: Record<OverlayType, { label: string; color: string; bg: string; border: string; svgStroke: string; svgFill: string }> = {
  bleed: { label: 'Bleed', color: 'text-danger', bg: 'bg-danger/10', border: 'border-danger/35', svgStroke: 'var(--overlay-bleed)', svgFill: 'color-mix(in srgb, var(--overlay-bleed) 10%, transparent)' },
  trim: { label: 'Trim', color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/35', svgStroke: 'var(--overlay-trim)', svgFill: 'transparent' },
  'safe-area': { label: 'Safe Area', color: 'text-success', bg: 'bg-success/10', border: 'border-success/30', svgStroke: 'var(--overlay-safe)', svgFill: 'color-mix(in srgb, var(--overlay-safe) 10%, transparent)' },
  gutter: { label: 'Gutter', color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/30', svgStroke: 'var(--overlay-gutter)', svgFill: 'color-mix(in srgb, var(--overlay-gutter) 12%, transparent)' },
  hinge: { label: 'Hinge', color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/30', svgStroke: 'var(--overlay-hinge)', svgFill: 'color-mix(in srgb, var(--overlay-hinge) 12%, transparent)' },
  crop: { label: 'Crop Risk', color: 'text-danger', bg: 'bg-danger/10', border: 'border-danger/30', svgStroke: 'color-mix(in srgb, var(--overlay-bleed) 58%, transparent)', svgFill: 'color-mix(in srgb, var(--overlay-bleed) 8%, transparent)' },
  spine: { label: 'Spine', color: 'text-foreground/75', bg: 'bg-secondary', border: 'border-border', svgStroke: 'var(--overlay-spine)', svgFill: 'color-mix(in srgb, var(--overlay-spine) 10%, transparent)' },
  barcode: { label: 'Barcode', color: 'text-muted-foreground', bg: 'bg-secondary', border: 'border-border', svgStroke: 'color-mix(in srgb, var(--foreground) 42%, transparent)', svgFill: 'color-mix(in srgb, var(--foreground) 7%, transparent)' },
};

// Zoom physics
const ZOOM_MIN = 0.15;
const ZOOM_MAX = 5.0;
const ZOOM_DAMPING = 0.12;
const ZOOM_WHEEL_SENSITIVITY = 0.001;
const ZOOM_STEP = 0.25;
const PAN_DAMPING = 0.15;

type FitMode = 'fit-page' | 'fit-width' | 'fit-height' | 'fit-spread' | 'actual' | 'custom';

// Beginner-friendly filter labels
type BeginnerFilter = 'all' | 'important' | 'needs-fix' | 'safe';

function allowedOverlaysForBookType(bookType: string): OverlayType[] {
  if (bookType === 'kindle') return [];
  if (bookType === 'paperback') return ['bleed', 'trim', 'safe-area', 'gutter', 'crop'];
  return ['bleed', 'trim', 'safe-area', 'gutter', 'hinge', 'crop'];
}

// ---------------------------------------------------------------------------
// CRITICAL: Correct Spread Pairing Logic
// Cover → ALONE (single spread)
// [Blank + Page 1] → first interior spread
// [Page 2 + Page 3] → second interior spread
// [Page 4 + Page 5] → etc.
// ---------------------------------------------------------------------------

function buildBookSequence(
  bookType: string,
  coverDataUrl: string | undefined,
  manuscriptPageCount: number,
  pdfPageDataUrls: Map<number, string>,
  measurements: { fullCoverWidthIn: number; fullCoverHeightIn: number; trimWidthIn: number; trimHeightIn: number },
): BookPage[] {
  const pages: BookPage[] = [];
  const isKindle = bookType === 'kindle';

  // PAGE 0: Full Cover Spread (stands alone)
  if (!isKindle) {
    pages.push({
      id: 'cover',
      section: 'full-cover',
      label: 'Full Cover',
      dataUrl: coverDataUrl,
      isBlank: !coverDataUrl,
      isCoverPage: true,
      widthIn: measurements.fullCoverWidthIn,
      heightIn: measurements.fullCoverHeightIn,
    });
  }

  // PAGE 1 (or 0 for Kindle): Blank page (inside-cover offset)
  pages.push({
    id: 'blank',
    section: 'blank',
    label: 'Blank',
    isBlank: true,
    isCoverPage: false,
    widthIn: measurements.trimWidthIn,
    heightIn: measurements.trimHeightIn,
  });

  // Interior manuscript pages
  for (let i = 1; i <= manuscriptPageCount; i++) {
    pages.push({
      id: `p${i}`,
      section: 'interior',
      label: `Page ${i}`,
      manuscriptIndex: i,
      dataUrl: pdfPageDataUrls.get(i),
      isBlank: false,
      isCoverPage: false,
      widthIn: measurements.trimWidthIn,
      heightIn: measurements.trimHeightIn,
    });
  }

  return pages;
}

/**
 * CORRECT spread engine:
 * - Cover is ALWAYS alone (single spread)
 * - Blank + Page 1 is the first interior spread
 * - Page 2 + Page 3, Page 4 + Page 5, etc.
 */
function computeSpreads(pages: BookPage[]): SpreadModel[] {
  if (pages.length === 0) return [];
  const spreads: SpreadModel[] = [];

  // Find the cover page (first page, if it's full-cover)
  const coverIdx = pages.findIndex(p => p.section === 'full-cover');

  if (coverIdx >= 0) {
    // Cover stands ALONE — never paired with blank or manuscript
    spreads.push({
      id: 'cover',
      leftPageIndex: coverIdx,
      rightPageIndex: null,
      isSingle: true,
      label: 'Cover',
      spreadIndex: 0,
    });
  }

  // Now build interior spreads starting from the blank page
  // Find where interior pages start (blank + interior pages)
  const blankIdx = pages.findIndex(p => p.section === 'blank');
  if (blankIdx < 0) return spreads;

  // Interior pages = blank + all interior manuscript pages
  const interiorPages: { page: BookPage; originalIdx: number }[] = [];
  for (let i = blankIdx; i < pages.length; i++) {
    if (pages[i].section === 'full-cover') continue; // skip cover (already handled)
    interiorPages.push({ page: pages[i], originalIdx: i });
  }

  // Pair interior pages:
  // [Blank + Page 1], [Page 2 + Page 3], [Page 4 + Page 5], etc.
  let si = coverIdx >= 0 ? 1 : 0;
  let j = 0;
  while (j < interiorPages.length) {
    const left = interiorPages[j];
    const right = j + 1 < interiorPages.length ? interiorPages[j + 1] : null;

    if (right) {
      const leftLabel = left.page.section === 'blank' ? 'Blank' : left.page.label;
      const rightLabel = right.page.section === 'blank' ? 'Blank' : right.page.label;

      // Use en-dash for page ranges (e.g., "2–3")
      const label = left.page.section === 'blank' && right.page.section === 'interior'
        ? `Blank + ${right.page.manuscriptIndex ?? right.page.label}`
        : left.page.section === 'interior' && right.page.section === 'interior'
          ? `${left.page.manuscriptIndex ?? leftLabel}–${right.page.manuscriptIndex ?? rightLabel}`
          : `${leftLabel} + ${rightLabel}`;

      spreads.push({
        id: `spread-${si}`,
        leftPageIndex: left.originalIdx,
        rightPageIndex: right.originalIdx,
        isSingle: false,
        label,
        spreadIndex: si,
      });
      j += 2;
    } else {
      const label = left.page.section === 'blank' ? 'Blank' : left.page.label;
      spreads.push({
        id: `spread-${si}`,
        leftPageIndex: left.originalIdx,
        rightPageIndex: null,
        isSingle: true,
        label,
        spreadIndex: si,
      });
      j++;
    }
    si++;
  }

  return spreads;
}

// ---------------------------------------------------------------------------
// Sub-component: PageOverlay (SVG overlays) — Professional Publishing Style
// ---------------------------------------------------------------------------

interface PageOverlayProps {
  width: number;
  height: number;
  overlays: OverlayType[];
  measurements: {
    bleedIn: number;
    trimWidthIn: number;
    trimHeightIn: number;
    safeAreaIn: number;
    gutterIn: number;
    hingeIn: number;
  };
  isLeftPage?: boolean;
  isCoverPage?: boolean;
  coverWidthIn?: number;
  trimWidthIn?: number;
  // Issue highlight region (in inches, relative to page)
  highlightRegion?: { xIn: number; yIn: number; widthIn: number; heightIn: number } | null;
  highlightSeverity?: CheckStatus;
  // Overlay focus mode — dim everything outside the highlight
  focusMode?: boolean;
}

function PageOverlay({ width, height, overlays, measurements, isLeftPage, isCoverPage, coverWidthIn, trimWidthIn, highlightRegion, highlightSeverity, focusMode }: PageOverlayProps) {
  const referenceWidthIn = isCoverPage && coverWidthIn ? coverWidthIn : measurements.trimWidthIn;
  const pxPerIn = width / referenceWidthIn;
  const bleedPx = measurements.bleedIn * pxPerIn;
  const safePx = measurements.safeAreaIn * pxPerIn;
  const gutterPx = measurements.gutterIn * pxPerIn;
  const hingePx = measurements.hingeIn * pxPerIn;

  const elements: React.ReactNode[] = [];

  // Overlay focus mode: semi-transparent overlay with cutout for highlight
  if (focusMode && highlightRegion) {
    const hx = highlightRegion.xIn * pxPerIn;
    const hy = highlightRegion.yIn * pxPerIn;
    const hw = highlightRegion.widthIn * pxPerIn;
    const hh = highlightRegion.heightIn * pxPerIn;
    const pad = 12; // padding around highlight cutout

    // Top rectangle
    elements.push(
      <rect key="focus-top" x={0} y={0} width={width} height={Math.max(0, hy - pad)} fill="var(--overlay)" />,
    );
    // Bottom rectangle
    elements.push(
      <rect key="focus-bottom" x={0} y={hy + hh + pad} width={width} height={Math.max(0, height - (hy + hh + pad))} fill="var(--overlay)" />,
    );
    // Left rectangle
    elements.push(
      <rect key="focus-left" x={0} y={Math.max(0, hy - pad)} width={Math.max(0, hx - pad)} height={hh + pad * 2} fill="var(--overlay)" />,
    );
    // Right rectangle
    elements.push(
      <rect key="focus-right" x={hx + hw + pad} y={Math.max(0, hy - pad)} width={Math.max(0, width - (hx + hw + pad))} height={hh + pad * 2} fill="var(--overlay)" />,
    );
  }

  overlays.forEach((ov) => {
    switch (ov) {
      case 'bleed':
        elements.push(
          <rect key={ov} x={-bleedPx} y={-bleedPx} width={width + bleedPx * 2} height={height + bleedPx * 2}
            fill={OVERLAY_CONFIG.bleed.svgFill} stroke={OVERLAY_CONFIG.bleed.svgStroke} strokeWidth={0.75} strokeDasharray="8 4" />,
        );
        break;
      case 'trim':
        if (isCoverPage && coverWidthIn && trimWidthIn) {
          const wrapPx = 0.0625 * pxPerIn;
          const spinePx = (coverWidthIn - 2 * trimWidthIn - 2 * measurements.bleedIn - 2 * wrapPx) * pxPerIn;
          const bleedOff = measurements.bleedIn * pxPerIn;
          elements.push(<rect key={`${ov}-back`} x={bleedOff} y={bleedOff} width={trimWidthIn * pxPerIn} height={height - bleedOff * 2} fill="none" stroke={OVERLAY_CONFIG.trim.svgStroke} strokeWidth={0.75} strokeDasharray="6 4" />);
          elements.push(<rect key={`${ov}-front`} x={width - bleedOff - trimWidthIn * pxPerIn} y={bleedOff} width={trimWidthIn * pxPerIn} height={height - bleedOff * 2} fill="none" stroke={OVERLAY_CONFIG.trim.svgStroke} strokeWidth={0.75} strokeDasharray="6 4" />);
          const spineStart = bleedOff + trimWidthIn * pxPerIn + wrapPx;
          elements.push(<line key={`${ov}-spine-l`} x1={spineStart} y1={0} x2={spineStart} y2={height} stroke={OVERLAY_CONFIG.spine.svgStroke} strokeWidth={0.75} strokeDasharray="6 3" />);
          elements.push(<line key={`${ov}-spine-r`} x1={spineStart + spinePx} y1={0} x2={spineStart + spinePx} y2={height} stroke={OVERLAY_CONFIG.spine.svgStroke} strokeWidth={0.75} strokeDasharray="6 3" />);
        } else {
          elements.push(
            <rect key={ov} x={0} y={0} width={width} height={height} fill="none" stroke={OVERLAY_CONFIG.trim.svgStroke} strokeWidth={0.75} strokeDasharray="6 4" />,
          );
        }
        break;
      case 'safe-area':
        if (isCoverPage && coverWidthIn && trimWidthIn) {
          const bleedOff = measurements.bleedIn * pxPerIn;
          elements.push(<rect key={`${ov}-back`} x={bleedOff + safePx} y={bleedOff + safePx} width={trimWidthIn * pxPerIn - safePx * 2} height={height - bleedOff * 2 - safePx * 2} fill={OVERLAY_CONFIG['safe-area'].svgFill} stroke={OVERLAY_CONFIG['safe-area'].svgStroke} strokeWidth={0.75} strokeDasharray="8 4" />);
          elements.push(<rect key={`${ov}-front`} x={width - bleedOff - trimWidthIn * pxPerIn + safePx} y={bleedOff + safePx} width={trimWidthIn * pxPerIn - safePx * 2} height={height - bleedOff * 2 - safePx * 2} fill={OVERLAY_CONFIG['safe-area'].svgFill} stroke={OVERLAY_CONFIG['safe-area'].svgStroke} strokeWidth={0.75} strokeDasharray="8 4" />);
        } else {
          elements.push(
            <rect key={ov} x={safePx} y={safePx} width={width - safePx * 2} height={height - safePx * 2} fill={OVERLAY_CONFIG['safe-area'].svgFill} stroke={OVERLAY_CONFIG['safe-area'].svgStroke} strokeWidth={0.75} strokeDasharray="8 4" />,
          );
        }
        break;
      case 'gutter':
        if (isLeftPage) {
          elements.push(<rect key={ov} x={0} y={0} width={gutterPx} height={height} fill={OVERLAY_CONFIG.gutter.svgFill} stroke={OVERLAY_CONFIG.gutter.svgStroke} strokeWidth={0.75} strokeDasharray="6 3" />);
        } else {
          elements.push(<rect key={ov} x={width - gutterPx} y={0} width={gutterPx} height={height} fill={OVERLAY_CONFIG.gutter.svgFill} stroke={OVERLAY_CONFIG.gutter.svgStroke} strokeWidth={0.75} strokeDasharray="6 3" />);
        }
        break;
      case 'hinge':
        if (isCoverPage && coverWidthIn && trimWidthIn) {
          const bleedOff = measurements.bleedIn * pxPerIn;
          elements.push(<rect key={`${ov}-front`} x={width - bleedOff - trimWidthIn * pxPerIn} y={bleedOff} width={hingePx} height={height - bleedOff * 2} fill={OVERLAY_CONFIG.hinge.svgFill} stroke={OVERLAY_CONFIG.hinge.svgStroke} strokeWidth={0.75} strokeDasharray="8 4" />);
          elements.push(<rect key={`${ov}-back`} x={bleedOff + trimWidthIn * pxPerIn - hingePx} y={bleedOff} width={hingePx} height={height - bleedOff * 2} fill={OVERLAY_CONFIG.hinge.svgFill} stroke={OVERLAY_CONFIG.hinge.svgStroke} strokeWidth={0.75} strokeDasharray="8 4" />);
        } else if (isLeftPage) {
          elements.push(<rect key={ov} x={0} y={0} width={hingePx} height={height} fill={OVERLAY_CONFIG.hinge.svgFill} stroke={OVERLAY_CONFIG.hinge.svgStroke} strokeWidth={0.75} strokeDasharray="8 4" />);
        } else {
          elements.push(<rect key={ov} x={width - hingePx} y={0} width={hingePx} height={height} fill={OVERLAY_CONFIG.hinge.svgFill} stroke={OVERLAY_CONFIG.hinge.svgStroke} strokeWidth={0.75} strokeDasharray="8 4" />);
        }
        break;
      case 'crop': {
        const cropPx = 0.0625 * pxPerIn;
        elements.push(<rect key={ov} x={cropPx} y={cropPx} width={width - cropPx * 2} height={height - cropPx * 2} fill={OVERLAY_CONFIG.crop.svgFill} stroke={OVERLAY_CONFIG.crop.svgStroke} strokeWidth={0.75} strokeDasharray="4 4" />);
        break;
      }
      default:
        break;
    }
  });

  // Issue highlight region
  if (highlightRegion) {
    const hx = highlightRegion.xIn * pxPerIn;
    const hy = highlightRegion.yIn * pxPerIn;
    const hw = highlightRegion.widthIn * pxPerIn;
    const hh = highlightRegion.heightIn * pxPerIn;

    const glowColor = highlightSeverity === 'fail' ? 'var(--validation-critical)' :
      highlightSeverity === 'risk' ? 'var(--validation-warning)' :
      highlightSeverity === 'warning' ? 'var(--validation-warning)' : 'var(--validation-success)';
    const strokeColor = highlightSeverity === 'fail' ? 'var(--overlay-bleed)' :
      highlightSeverity === 'risk' ? 'var(--overlay-hinge)' :
      highlightSeverity === 'warning' ? 'var(--overlay-gutter)' : 'var(--overlay-safe)';

    elements.push(
      <rect key="issue-highlight" x={hx} y={hy} width={hw} height={hh}
        fill={glowColor} stroke={strokeColor} strokeWidth={1.5} strokeDasharray="6 3"
        rx={2} ry={2}
      />,
    );
  }

  if (elements.length === 0) return null;

  const viewBoxPadding = measurements.bleedIn * pxPerIn;
  return (
    <svg
      className="absolute inset-0 pointer-events-none z-10"
      width={width}
      height={height}
      viewBox={`${-viewBoxPadding} ${-viewBoxPadding} ${width + viewBoxPadding * 2} ${height + viewBoxPadding * 2}`}
      style={{ overflow: 'visible' }}
    >
      {elements}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Sub-component: PageRenderer
// ---------------------------------------------------------------------------

function PageRenderer({
  page,
  width,
  height,
  activeOverlays,
  measurements,
  isLeftPage,
  bookType,
  highlightRegion,
  highlightSeverity,
  focusMode,
}: {
  page: BookPage;
  width: number;
  height: number;
  activeOverlays: OverlayType[];
  measurements: ReturnType<typeof useAppStore.getState>['measurements'];
  isLeftPage?: boolean;
  bookType: string;
  highlightRegion?: { xIn: number; yIn: number; widthIn: number; heightIn: number } | null;
  highlightSeverity?: CheckStatus;
  focusMode?: boolean;
}) {
  const isCoverPage = page.section === 'full-cover';
  const isInterior = page.section === 'interior';

  const pageOverlays = useMemo(() => {
    if (bookType === 'kindle') return [];
    if (isCoverPage) return activeOverlays;
    if (isInterior) return activeOverlays;
    return [];
  }, [bookType, isCoverPage, isInterior, activeOverlays]);

  return (
    <div
      className="relative"
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      <div
        className="relative h-full w-full overflow-hidden bg-surface"
        style={{
          boxShadow: 'var(--shadow-elevated)',
          border: '1px solid var(--border)',
          borderRadius: '1px',
        }}
      >
        {page.isBlank ? (
          <div className="flex h-full w-full flex-col items-center justify-center bg-surface">
            <span className="text-[11px] text-gray-300 font-medium">
              {page.section === 'blank' ? 'Blank Page' : page.label}
            </span>
            <span className="text-[9px] text-gray-300/60 mt-1">(offset for alignment)</span>
          </div>
        ) : page.dataUrl ? (
          <img
            src={page.dataUrl}
            alt={page.label}
            className="w-full h-full object-contain"
            draggable={false}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-foreground/80 dark:text-foreground/50 dark:text-foreground/10">
            <FileText className="w-12 h-12 mb-2" />
            <span className="text-xs">{page.label}</span>
            {isCoverPage && <span className="text-[10px] text-foreground/5 mt-1">Upload cover to preview</span>}
          </div>
        )}

        {(pageOverlays.length > 0 || highlightRegion) && (
          <PageOverlay
            width={width}
            height={height}
            overlays={pageOverlays}
            measurements={measurements}
            isLeftPage={isLeftPage}
            isCoverPage={isCoverPage}
            coverWidthIn={isCoverPage ? measurements.fullCoverWidthIn : undefined}
            trimWidthIn={isCoverPage ? measurements.trimWidthIn : undefined}
            highlightRegion={highlightRegion}
            highlightSeverity={highlightSeverity}
            focusMode={focusMode}
          />
        )}
      </div>

      {/* Gutter shadow for spread */}
      {isLeftPage && (
        <div className="absolute top-0 right-0 w-4 h-full pointer-events-none z-20"
          style={{ background: 'linear-gradient(to right, transparent, color-mix(in srgb, var(--overlay) 40%, transparent))' }}
        />
      )}
      {!isLeftPage && page.section !== 'full-cover' && !page.isBlank && (
        <div className="absolute top-0 left-0 w-4 h-full pointer-events-none z-20"
          style={{ background: 'linear-gradient(to left, transparent, color-mix(in srgb, var(--overlay) 40%, transparent))' }}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getWorstSeverity(pages: BookPage[], pageIssues: PageIssueExtended[]): CheckStatus | null {
  const order: CheckStatus[] = ['pass', 'safe', 'warning', 'risk', 'fail'];
  let worst: CheckStatus | null = null;
  for (const page of pages) {
    if (!page.manuscriptIndex) continue;
    const issues = pageIssues.filter((i) => i.page === page.manuscriptIndex);
    for (const iss of issues) {
      if (!worst || order.indexOf(iss.severity) > order.indexOf(worst)) {
        worst = iss.severity;
      }
    }
  }
  return worst;
}

function getIssueCountForPages(pages: BookPage[], pageIssues: PageIssueExtended[]): number {
  let count = 0;
  for (const page of pages) {
    if (!page.manuscriptIndex) continue;
    count += pageIssues.filter(i => i.page === page.manuscriptIndex).length;
  }
  return count;
}

function IssueDot({ severity, size = 'sm' }: { severity: CheckStatus; size?: 'sm' | 'md' }) {
  const color =
    severity === 'fail' ? 'bg-danger' :
    severity === 'risk' ? 'bg-warning' :
    severity === 'warning' ? 'bg-warning' : 'bg-success';
  const dim = size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2';
  return <div className={`rounded-full ${color} ${dim}`} />;
}

function SingleThumb({ page, small }: { page: BookPage; small?: boolean }) {
  if (page.isBlank) {
    return (
      <div className="w-full h-full bg-foreground/80 flex items-center justify-center">
        <span className={`text-gray-300 font-medium ${small ? 'text-[4px]' : 'text-[7px]'}`}>
          {page.section === 'blank' ? 'Blank' : page.label}
        </span>
      </div>
    );
  }
  if (page.dataUrl) {
    return <img src={page.dataUrl} alt={page.label} className="w-full h-full object-contain" />;
  }
  return <FileText className={`${small ? 'w-3 h-3' : 'w-4 h-4'} text-foreground/10`} />;
}

// ---------------------------------------------------------------------------
// Sub-component: OnboardingHint — lightweight dismissible hint bubble
// ---------------------------------------------------------------------------

function OnboardingHint({
  id,
  children,
  onDismiss,
}: {
  id: string;
  children: React.ReactNode;
  onDismiss: (id: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.2 }}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-foreground/[0.13] dark:bg-foreground/[0.06] border border-foreground/[0.22] dark:border-foreground/[0.08] text-[10px] text-foreground/90 dark:text-foreground/75 dark:text-foreground/40"
    >
      <span>{children}</span>
      <button
        onClick={() => onDismiss(id)}
        className="shrink-0 p-0.5 rounded hover:bg-foreground/[0.16] dark:bg-foreground/[0.08] transition-colors"
        aria-label="Dismiss hint"
      >
        <X className="w-2.5 h-2.5 text-foreground/65 dark:text-foreground/25" />
      </button>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Sub-component: SaveStatusIndicator
// ---------------------------------------------------------------------------

function SaveStatusIndicator({ status }: { status: SaveStatus }) {
  if (status === 'idle') return null;

  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md">
      {status === 'saving' && (
        <>
          <Loader2 className="w-3 h-3 text-foreground/85 dark:text-foreground/60 dark:text-foreground/20 animate-spin" />
          <span className="text-[10px] text-foreground/65 dark:text-foreground/30">Saving...</span>
        </>
      )}
      {status === 'saved' && (
        <>
          <CheckCircle2 className="w-3 h-3 text-success/40" />
          <span className="text-[10px] text-success/50">Saved</span>
        </>
      )}
      {status === 'error' && (
        <>
          <AlertCircle className="w-3 h-3 text-danger/40" />
          <span className="text-[10px] text-danger/50">Save failed</span>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-component: SessionRestoreDialog
// ---------------------------------------------------------------------------

function SessionRestoreDialog({
  savedWorkspace,
  onRestore,
  onDiscard,
}: {
  savedWorkspace: SavedWorkspace;
  onRestore: () => void;
  onDiscard: () => void;
}) {
  const timeAgo = useMemo(() => {
    const diff = Date.now() - savedWorkspace.savedAt;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  }, [savedWorkspace.savedAt]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-[calc(100vw-2rem)] max-w-[380px] rounded-xl border border-foreground/[0.22] bg-card p-5 shadow-2xl dark:border-foreground/[0.08] sm:p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-success/10 border border-success/20 flex items-center justify-center">
            <RotateCcw className="w-5 h-5 text-success/60" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground/80">Restore previous session?</h3>
            <p className="text-[11px] text-foreground/65 dark:text-foreground/25 mt-0.5">Last saved: {timeAgo}</p>
          </div>
        </div>

        <div className="bg-foreground/[0.16] dark:bg-foreground/[0.08] dark:bg-foreground/[0.03] border border-foreground/[0.18] dark:border-foreground/[0.06] rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-foreground/85 dark:text-foreground/60 dark:text-foreground/20" />
            <span className="text-[11px] text-foreground/90 dark:text-foreground/75 dark:text-foreground/40 font-medium">
              {savedWorkspace.coverFileName || savedWorkspace.manuscriptFileName || 'Book session'}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-[10px] text-foreground/85 dark:text-foreground/60 dark:text-foreground/20">
              {savedWorkspace.bookPages.length} pages
            </span>
            <span className="text-[10px] text-foreground/85 dark:text-foreground/60 dark:text-foreground/20">
              {savedWorkspace.bookType}
            </span>
            <span className="text-[10px] text-foreground/85 dark:text-foreground/60 dark:text-foreground/20">
              {savedWorkspace.previewViewMode} view
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onDiscard}
            className="flex-1 px-4 py-2.5 rounded-lg text-[12px] font-medium text-foreground/90 dark:text-foreground/75 dark:text-foreground/40 bg-foreground/[0.18] dark:bg-foreground/[0.10] dark:bg-foreground/[0.04] hover:bg-foreground/[0.13] dark:bg-foreground/[0.06] hover:text-foreground/80 dark:text-foreground/50 transition-colors border border-foreground/[0.18] dark:border-foreground/[0.06]"
          >
            Start New
          </button>
          <button
            onClick={onRestore}
            className="flex-1 px-4 py-2.5 rounded-lg text-[12px] font-medium text-success bg-success/15 hover:bg-success/20 transition-colors border border-success/20"
          >
            Restore
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-component: ThumbnailSidebar — Left sidebar with vertical thumbnail navigation
// ---------------------------------------------------------------------------

interface ThumbnailSidebarProps {
  bookPages: BookPage[];
  currentIndex: number;
  viewMode: PreviewViewMode;
  pageIssues: PageIssueExtended[];
  onPageSelect: (index: number) => void;
  spreads: SpreadModel[];
  currentSpreadIdx: number;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

function ThumbnailSidebar({
  bookPages,
  currentIndex,
  viewMode,
  pageIssues,
  onPageSelect,
  spreads,
  currentSpreadIdx,
  collapsed,
  onToggleCollapse,
}: ThumbnailSidebarProps) {
  const activeRef = useRef<HTMLButtonElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-center active thumbnail
  useEffect(() => {
    if (activeRef.current && scrollContainerRef.current) {
      activeRef.current.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, [currentIndex, currentSpreadIdx]);

  if (collapsed) {
    return (
      <div className="w-10 shrink-0 border-r border-foreground/[0.18] dark:border-foreground/[0.06] bg-card flex flex-col items-center pt-2">
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-foreground/65 dark:text-foreground/25 hover:text-foreground/80 dark:text-foreground/50 hover:bg-foreground/[0.18] dark:bg-foreground/[0.10] dark:bg-foreground/[0.04] transition-colors"
          title="Expand sidebar"
        >
          <PanelLeftOpen className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-[170px] min-w-[120px] max-w-[190px] shrink-0 border-r border-foreground/[0.18] dark:border-foreground/[0.06] bg-card flex flex-col">
      {/* Header */}
      <div className="shrink-0 px-3 py-2 border-b border-foreground/[0.18] dark:border-foreground/[0.06] flex items-center justify-between">
        <span className="text-[10px] font-semibold text-foreground/65 dark:text-foreground/25 uppercase tracking-wider">Pages</span>
        <button
          onClick={onToggleCollapse}
          className="p-1 rounded-md text-foreground/85 dark:text-foreground/60 dark:text-foreground/20 hover:text-foreground/90 dark:text-foreground/75 dark:text-foreground/40 hover:bg-foreground/[0.18] dark:bg-foreground/[0.10] dark:bg-foreground/[0.04] transition-colors"
          title="Collapse sidebar"
        >
          <PanelLeftClose className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Scrollable thumbnails */}
      <div ref={scrollContainerRef} className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-2 space-y-1.5">
        {viewMode === 'spread' && spreads.length > 0 ? (
          spreads.map((spread) => {
            const isActive = spread.spreadIndex === currentSpreadIdx;
            const leftPage = spread.leftPageIndex !== null ? bookPages[spread.leftPageIndex] : null;
            const rightPage = spread.rightPageIndex !== null ? bookPages[spread.rightPageIndex] : null;
            const pagesInSpread = [leftPage, rightPage].filter(Boolean) as BookPage[];
            const worstIssue = getWorstSeverity(pagesInSpread, pageIssues);
            const issueCount = getIssueCountForPages(pagesInSpread, pageIssues);

            return (
              <button
                key={spread.id}
                ref={isActive ? activeRef : undefined}
                onClick={() => spread.leftPageIndex !== null && onPageSelect(spread.leftPageIndex)}
                className={`w-full rounded-lg overflow-hidden border transition-all duration-200 text-left ${
                  isActive
                    ? 'border-success/60 ring-2 ring-success/25 bg-success/[0.03]'
                    : 'border-foreground/[0.18] dark:border-foreground/[0.06] hover:border-foreground/[0.25] dark:border-foreground/[0.12]'
                }`}
              >
                {/* Preview image — aspect-ratio aware, no cropping */}
                <div className="relative bg-foreground/[0.16] dark:bg-foreground/[0.08] dark:bg-foreground/[0.03] flex items-center justify-center p-1" style={{ aspectRatio: spread.isSingle ? '2/3' : '4/3' }}>
                  {spread.isSingle ? (
                    leftPage ? <SingleThumb page={leftPage} /> : null
                  ) : (
                    <div className="flex w-full h-full gap-px">
                      <div className="flex-1 overflow-hidden flex items-center justify-center">
                        {leftPage ? <SingleThumb page={leftPage} small /> : null}
                      </div>
                      <div className="w-px bg-muted self-stretch" />
                      <div className="flex-1 overflow-hidden flex items-center justify-center">
                        {rightPage ? <SingleThumb page={rightPage} small /> : null}
                      </div>
                    </div>
                  )}
                  {worstIssue && worstIssue !== 'pass' && worstIssue !== 'safe' && (
                    <div className="absolute top-1 right-1">
                      <IssueDot severity={worstIssue} size="md" />
                    </div>
                  )}
                </div>

                {/* Label + issue badge */}
                <div className="px-2 py-1.5 bg-foreground/[0.13] dark:bg-foreground/[0.06] dark:bg-foreground/[0.02]">
                  <div className="flex items-center justify-between gap-1">
                    <span className={`text-[9px] font-medium leading-tight truncate ${isActive ? 'text-success' : 'text-foreground/35'}`}>
                      {spread.label}
                    </span>
                    <div className="flex items-center gap-1">
                      {worstIssue && worstIssue !== 'pass' && worstIssue !== 'safe' && (
                        <IssueDot severity={worstIssue} />
                      )}
                    </div>
                  </div>
                  {issueCount > 0 && (
                    <span className={`text-[8px] mt-0.5 block font-medium ${
                      worstIssue === 'fail' ? 'text-danger/50' :
                      worstIssue === 'risk' ? 'text-warning/50' :
                      'text-foreground/15'
                    }`}>
                      {issueCount} issue{issueCount !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </button>
            );
          })
        ) : (
          bookPages.map((page, idx) => {
            const isActive = idx === currentIndex;
            const worstIssue = getWorstSeverity([page], pageIssues);
            const issueCount = getIssueCountForPages([page], pageIssues);

            return (
              <button
                key={page.id}
                ref={isActive ? activeRef : undefined}
                onClick={() => onPageSelect(idx)}
                className={`w-full rounded-lg overflow-hidden border transition-all duration-200 text-left ${
                  isActive
                    ? 'border-success/60 ring-2 ring-success/25 bg-success/[0.03]'
                    : 'border-foreground/[0.18] dark:border-foreground/[0.06] hover:border-foreground/[0.25] dark:border-foreground/[0.12]'
                }`}
              >
                {/* Preview image — aspect-ratio aware, no cropping */}
                <div className="relative bg-foreground/[0.16] dark:bg-foreground/[0.08] dark:bg-foreground/[0.03] flex items-center justify-center p-1" style={{ aspectRatio: page.isCoverPage ? '3/2' : '2/3' }}>
                  <SingleThumb page={page} />
                  {worstIssue && worstIssue !== 'pass' && worstIssue !== 'safe' && (
                    <div className="absolute top-1 right-1">
                      <IssueDot severity={worstIssue} size="md" />
                    </div>
                  )}
                </div>

                {/* Label + issue badge */}
                <div className="px-2 py-1.5 bg-foreground/[0.13] dark:bg-foreground/[0.06] dark:bg-foreground/[0.02]">
                  <div className="flex items-center justify-between gap-1">
                    <span className={`text-[9px] font-medium truncate ${isActive ? 'text-success' : 'text-foreground/30'}`}>
                      {page.section === 'full-cover' ? 'Cover' : page.section === 'blank' ? 'Blank' : page.label}
                    </span>
                    {worstIssue && worstIssue !== 'pass' && worstIssue !== 'safe' && (
                      <IssueDot severity={worstIssue} />
                    )}
                  </div>
                  {issueCount > 0 && (
                    <span className={`text-[8px] mt-0.5 block font-medium ${
                      worstIssue === 'fail' ? 'text-danger/50' :
                      worstIssue === 'risk' ? 'text-warning/50' :
                      'text-foreground/15'
                    }`}>
                      {issueCount} issue{issueCount !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-component: FriendlyIssueCard — beginner-friendly issue display
// ---------------------------------------------------------------------------

// Category → friendly problem/why/fix descriptions
const CATEGORY_FRIENDLY: Record<string, { problemPrefix: string; whyItMatters: string; fixHint: string; icon: typeof AlertTriangle }> = {
  margin: { problemPrefix: 'Content is positioned close to the page edge.', whyItMatters: 'During printing, pages are trimmed — content very near edges could be slightly cut. However, KDP rarely rejects files for tight margins alone.', fixHint: 'Move important text and images further inward from the page edge for best results.', icon: Ruler },
  bleed: { problemPrefix: 'Artwork may not extend fully into the bleed area.', whyItMatters: 'Without full bleed, tiny shifts during printing can leave thin white strips at page edges. However, this mainly affects pages with edge-to-edge artwork — if your content doesn\'t touch the edges, it\'s usually fine.', fixHint: 'Extend background colors or images 0.125" beyond the trim line on all sides for maximum compatibility.', icon: AlertTriangle },
  dpi: { problemPrefix: 'Image resolution is below the recommended quality level.', whyItMatters: 'Lower resolution images may appear slightly soft in print, but KDP commonly accepts them. The difference is most noticeable on close inspection.', fixHint: 'Replace with a higher resolution image (300 DPI at the printed size) for the sharpest results, but don\'t worry if you can\'t — KDP will still print it.', icon: ImageIcon },
  font: { problemPrefix: 'A font issue was detected in the document.', whyItMatters: 'Missing or unembedded fonts may cause text to render differently during KDP processing, though KDP often handles common fonts correctly.', fixHint: 'Embed all fonts in your PDF before uploading for the most predictable results.', icon: FileText },
  gutter: { problemPrefix: 'Content is close to the inner edge (gutter/spine).', whyItMatters: 'Text near the spine can be harder to read when the book is open — it curves into the binding. This is a readability concern, not a rejection risk.', fixHint: 'Increase the inner margin so text is at least 0.1" away from the gutter edge for better readability.', icon: BookOpen },
  size: { problemPrefix: 'Page dimensions differ slightly from the selected KDP trim size.', whyItMatters: 'Small size differences are usually caused by export rounding and are commonly accepted by KDP. Large differences may indicate wrong export settings.', fixHint: 'Export your document at the correct dimensions for the selected trim size (plus bleed if enabled) for maximum compatibility.', icon: Ruler },
  interior: { problemPrefix: 'An interior page issue was detected.', whyItMatters: 'This may affect the quality or readability of your book, but most interior issues won\'t cause KDP rejection.', fixHint: 'Review the page and make adjustments as needed — this is likely a quality improvement, not a blocking issue.', icon: FileText },
  cover: { problemPrefix: 'A cover issue was detected.', whyItMatters: 'Cover problems can range from minor quality concerns to potential upload issues. Most common cover issues are warnings, not rejection risks.', fixHint: 'Review the cover file and address any significant issues. Small imperfections are usually acceptable.', icon: AlertTriangle },
};

function getSeverityIcon(severity: CheckStatus) {
  switch (severity) {
    case 'pass':
    case 'safe':
      return <CheckCircle2 className="w-4 h-4" />;
    case 'warning':
      return <AlertTriangle className="w-4 h-4" />;
    case 'risk':
      return <AlertTriangle className="w-4 h-4" />;
    case 'fail':
      return <XCircle className="w-4 h-4" />;
    default:
      return <AlertCircle className="w-4 h-4" />;
  }
}

function getSeverityColors(severity: CheckStatus) {
  switch (severity) {
    case 'pass':
    case 'safe':
      return { bg: 'bg-success/10', text: 'text-success', border: 'border-success/20', glow: 'ring-success/10' };
    case 'warning':
      return { bg: 'bg-warning/10', text: 'text-warning', border: 'border-warning/20', glow: 'ring-warning/10' };
    case 'risk':
      return { bg: 'bg-warning/10', text: 'text-warning', border: 'border-warning/20', glow: 'ring-warning/10' };
    case 'fail':
      return { bg: 'bg-danger/10', text: 'text-danger', border: 'border-danger/20', glow: 'ring-danger/10' };
    default:
      return { bg: 'bg-foreground/5', text: 'text-foreground/40', border: 'border-foreground/10', glow: '' };
  }
}

function getSeverityLabel(severity: CheckStatus) {
  switch (severity) {
    case 'pass': return 'SAFE FOR KDP';
    case 'safe': return 'SAFE FOR KDP';
    case 'warning': return 'PROBABLY OK';
    case 'risk': return 'PRINT RISK';
    case 'fail': return 'HIGH REJECTION RISK';
    default: return (severity as string).toUpperCase();
  }
}

/** Get realistic KDP risk label with emoji */
function getKdpRiskLabel(kdpRisk?: KdpRiskLevel): { label: string; emoji: string; color: string } {
  switch (kdpRisk) {
    case 'safe': return { label: 'Safe for KDP', emoji: 'OK', color: 'text-success' };
    case 'probably-ok': return { label: 'Probably acceptable', emoji: 'Note', color: 'text-warning' };
    case 'print-risk': return { label: 'May cause print inconsistencies', emoji: 'Risk', color: 'text-warning' };
    case 'high-rejection': return { label: 'High rejection risk', emoji: 'Fix', color: 'text-danger' };
    default: return { label: '', emoji: '', color: '' };
  }
}

/** Get spec accuracy label */
function getSpecAccuracyLabel(accuracy?: 'exact' | 'slight-variance' | 'major-variance'): string {
  switch (accuracy) {
    case 'exact': return 'Matches spec';
    case 'slight-variance': return 'Slightly outside spec';
    case 'major-variance': return 'Significantly outside spec';
    default: return '';
  }
}

function FriendlyIssueCard({
  issue,
  isSelected,
  onClick,
  locationLabel,
  staggerIndex = 0,
}: {
  issue: PageIssueExtended;
  isSelected: boolean;
  onClick: () => void;
  /** Override location label, e.g. "Spread 2–3 · Page 3 (Right)" instead of just "Page 3" */
  locationLabel?: string;
  staggerIndex?: number;
}) {
  const [showTechnical, setShowTechnical] = useState(false);
  const colors = getSeverityColors(issue.severity);
  const friendlyInfo = CATEGORY_FRIENDLY[issue.category] || CATEGORY_FRIENDLY['interior'];
  const kdpRiskInfo = getKdpRiskLabel(issue.kdpRisk);
  const specLabel = getSpecAccuracyLabel(issue.specAccuracy);

  const pageLabel = locationLabel || (issue.page ? `Page ${issue.page}` : '');

  // Informational (safe) issues get de-emphasized styling
  const isInfo = issue.isInformational || issue.severity === 'safe' || issue.severity === 'pass';

  return (
    <motion.div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}
      className={`w-full rounded-lg border text-left transition-all duration-150 cursor-pointer ${
        isSelected
          ? `${colors.bg} ${colors.border} ring-1 ${colors.glow}`
          : isInfo
          ? 'border-foreground/[0.10] dark:border-foreground/[0.03] hover:border-foreground/[0.18] dark:border-foreground/[0.06]'
          : 'border-foreground/[0.25] dark:border-foreground/[0.12] dark:border-foreground/[0.04] hover:border-foreground/[0.22] dark:border-foreground/[0.08] hover:bg-foreground/[0.13] dark:bg-foreground/[0.06] dark:bg-foreground/[0.02]'
      }`}
      layout
      initial={{ opacity: 0, y: 7 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: staggerIndex * 0.05 }}
    >
      <div className={isInfo ? 'p-3' : 'p-4'}>
        {/* TOP ROW: Severity badge + title + affected page */}
        <div className="flex items-start gap-2">
          <span className={`shrink-0 mt-0.5 ${isInfo ? 'text-success/40' : colors.text}`}>
            {isInfo ? <CheckCircle2 className="w-3.5 h-3.5" /> : getSeverityIcon(issue.severity)}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${isInfo ? 'bg-success/10 text-success/60' : `${colors.bg} ${colors.text}`}`}>
                {getSeverityLabel(issue.severity)}
              </span>
              {pageLabel && (
                <span className="text-[11px] text-foreground/65 dark:text-foreground/30 font-medium">
                  {pageLabel}
                </span>
              )}
            </div>
            <p className={`text-[13px] font-medium leading-relaxed ${isInfo ? 'text-foreground/40' : isSelected ? 'text-foreground/80' : 'text-foreground/60'}`}>
              {issue.message}
            </p>
          </div>
        </div>

        {/* DUAL-DIMENSION DISPLAY: Spec Accuracy + Real KDP Risk */}
        {(issue.specAccuracy || issue.kdpRisk) && !isInfo && (
          <div className="mt-2.5 ml-6 flex items-center gap-3">
            {specLabel && (
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-semibold text-foreground/65 dark:text-foreground/30 uppercase tracking-wider">Spec:</span>
                <span className={`text-[10px] font-medium ${
                  issue.specAccuracy === 'exact' ? 'text-success/60'
                  : issue.specAccuracy === 'slight-variance' ? 'text-warning/60'
                  : 'text-danger/60'
                }`}>
                  {issue.specAccuracy === 'exact' ? 'Exact' : issue.specAccuracy === 'slight-variance' ? 'Close' : 'Mismatch'} · {specLabel}
                </span>
              </div>
            )}
            {kdpRiskInfo.label && (
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-semibold text-foreground/65 dark:text-foreground/30 uppercase tracking-wider">KDP:</span>
                <span className={`text-[10px] font-medium ${kdpRiskInfo.color}/70`}>
                  {kdpRiskInfo.emoji} {kdpRiskInfo.label}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Real-world impact explanation */}
        {issue.realWorldImpact && !isInfo && (
          <div className="mt-2 ml-6">
            <p className="text-[12px] text-foreground/85 dark:text-foreground/70 dark:text-foreground/35 leading-relaxed italic">
              {issue.realWorldImpact}
            </p>
          </div>
        )}

        {/* MIDDLE SECTION: Problem / Why / Fix — only for non-informational issues */}
        {!isInfo && (
          <div className="mt-3 ml-7 space-y-3">
            <div>
              <span className="text-[10px] font-semibold text-foreground/90 dark:text-foreground/75 dark:text-foreground/40 uppercase tracking-wider">Problem</span>
              <p className="text-[13px] text-foreground/90 dark:text-foreground/75 dark:text-foreground/45 leading-relaxed mt-0.5">
                {friendlyInfo.problemPrefix}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-foreground/90 dark:text-foreground/75 dark:text-foreground/40 uppercase tracking-wider">Why it matters</span>
              <p className="text-[13px] text-foreground/90 dark:text-foreground/75 dark:text-foreground/45 leading-relaxed mt-0.5">
                {friendlyInfo.whyItMatters}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-success/50 uppercase tracking-wider">Recommended fix</span>
              <p className="text-[13px] text-success/40 leading-relaxed mt-0.5 whitespace-pre-line">
                {issue.suggestion || friendlyInfo.fixHint}
              </p>
            </div>
          </div>
        )}

        {/* BOTTOM SECTION: Actual vs Expected comparison table */}
        {(issue.actual || issue.expected) && !isInfo && (
          <div className="mt-2.5 ml-6">
            <div
              onClick={(e) => { e.stopPropagation(); setShowTechnical(!showTechnical); }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); setShowTechnical(!showTechnical); } }}
              className="flex items-center gap-1 text-[11px] text-foreground/65 dark:text-foreground/25 hover:text-foreground/90 dark:text-foreground/75 dark:text-foreground/40 transition-colors cursor-pointer py-1"
            >
              <ChevronDown className={`w-2.5 h-2.5 transition-transform ${showTechnical ? 'rotate-180' : ''}`} />
              Dimensions Comparison
            </div>
            <AnimatePresence>
              {showTechnical && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="overflow-hidden"
                >
                  <div className="mt-1.5 bg-foreground/[0.13] dark:bg-foreground/[0.06] dark:bg-foreground/[0.02] rounded-md overflow-hidden">
                    {/* Table header */}
                    <div className="grid grid-cols-[60px_1fr_1fr_28px] gap-0 text-[9px] font-semibold text-foreground/65 dark:text-foreground/30 uppercase tracking-wider border-b border-foreground/[0.25] dark:border-foreground/[0.12] dark:border-foreground/[0.04] px-2 py-1">
                      <span>Metric</span>
                      <span>Actual</span>
                      <span>Expected</span>
                      <span className="text-center">✓</span>
                    </div>
                    {/* Parse dimensions from actual/expected strings */}
                    {(() => {
                      // Try to parse "8.75" × 11.25"" format
                      const dimRegex = /([\d.]+)"\s*×\s*([\d.]+)"/;
                      const actMatch = issue.actual?.match(dimRegex);
                      const expMatch = issue.expected?.match(dimRegex);

                      if (actMatch && expMatch) {
                        const actW = parseFloat(actMatch[1]);
                        const actH = parseFloat(actMatch[2]);
                        const expW = parseFloat(expMatch[1]);
                        const expH = parseFloat(expMatch[2]);
                        const wDiff = Math.abs(actW - expW);
                        const hDiff = Math.abs(actH - expH);
                        // Use realistic tolerances for the comparison
                        const wStatus = wDiff <= 0.02 ? 'ok' : wDiff <= 0.125 ? 'warn' : 'bad';
                        const hStatus = hDiff <= 0.02 ? 'ok' : hDiff <= 0.125 ? 'warn' : 'bad';

                        return (
                          <>
                            <div className="grid grid-cols-[60px_1fr_1fr_28px] gap-0 text-[10px] px-2 py-1 border-b border-foreground/[0.22] dark:border-foreground/[0.08] dark:border-foreground/[0.02]">
                              <span className="text-foreground/65 dark:text-foreground/25">Width</span>
                              <span className={`font-mono ${wStatus === 'ok' ? 'text-success/50' : wStatus === 'warn' ? 'text-warning/60' : 'text-danger/60'}`}>{actW.toFixed(3)}"</span>
                              <span className="font-mono text-foreground/65 dark:text-foreground/30">{expW.toFixed(3)}"</span>
                              <span className="text-center">{wStatus === 'ok' ? 'OK' : wStatus === 'warn' ? 'Check' : 'Fix'}</span>
                            </div>
                            <div className="grid grid-cols-[60px_1fr_1fr_28px] gap-0 text-[10px] px-2 py-1">
                              <span className="text-foreground/65 dark:text-foreground/25">Height</span>
                              <span className={`font-mono ${hStatus === 'ok' ? 'text-success/50' : hStatus === 'warn' ? 'text-warning/60' : 'text-danger/60'}`}>{actH.toFixed(3)}"</span>
                              <span className="font-mono text-foreground/65 dark:text-foreground/30">{expH.toFixed(3)}"</span>
                              <span className="text-center">{hStatus === 'ok' ? 'OK' : hStatus === 'warn' ? 'Check' : 'Fix'}</span>
                            </div>
                          </>
                        );
                      }

                      // Fallback: just show raw values
                      return (
                        <div className="grid grid-cols-[60px_1fr_1fr_28px] gap-0 text-[10px] px-2 py-1">
                          <span className="text-foreground/65 dark:text-foreground/25">Value</span>
                          <span className="font-mono text-foreground/85 dark:text-foreground/70 dark:text-foreground/35">{issue.actual}</span>
                          <span className="font-mono text-foreground/65 dark:text-foreground/30">{issue.expected}</span>
                          <span></span>
                        </div>
                      );
                    })()}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Sub-component: ValidationPanel (right side — beginner-friendly)
// ---------------------------------------------------------------------------

interface ValidationPanelProps {
  bookType: string;
  bookConfig: ReturnType<typeof useAppStore.getState>['bookConfig'];
  measurements: ReturnType<typeof useAppStore.getState>['measurements'];
  pageIssuesExtended: PageIssueExtended[];
  validationSummary: ValidationSummary;
  selectedIssueId: string | null;
  onSelectIssue: (id: string) => void;
  onJumpToPage: (index: number) => void;
  bookPages: BookPage[];
  issueFilter: IssueFilter;
  setIssueFilter: (filter: Partial<IssueFilter>) => void;
  currentSpreadIdx: number;
  spreads: SpreadModel[];
  viewMode: PreviewViewMode;
}

function ValidationPanel({
  bookType,
  bookConfig,
  measurements,
  pageIssuesExtended,
  validationSummary,
  selectedIssueId,
  onSelectIssue,
  onJumpToPage,
  bookPages,
  issueFilter,
  setIssueFilter,
  currentSpreadIdx,
  spreads,
  viewMode,
}: ValidationPanelProps) {
  const [searchInput, setSearchInput] = useState(issueFilter.search);
  const [beginnerFilter, setBeginnerFilter] = useState<BeginnerFilter>('all');
  const isSpreadMode = viewMode === 'spread' && bookType !== 'kindle';

  // -------------------------------------------------------------------------
  // Helper: compute location label for an issue based on view mode
  // -------------------------------------------------------------------------
  const getLocationLabel = useCallback((issue: PageIssueExtended): string => {
    if (!issue.page) return '';
    if (!isSpreadMode) return `Page ${issue.page}`;

    // Find which spread this page belongs to and whether it's left or right
    for (const spread of spreads) {
      const leftPage = spread.leftPageIndex !== null ? bookPages[spread.leftPageIndex] : null;
      const rightPage = spread.rightPageIndex !== null ? bookPages[spread.rightPageIndex] : null;

      if (leftPage?.manuscriptIndex === issue.page) {
        if (spread.isSingle) return `Cover`;
        return `${spread.label} · Left`;
      }
      if (rightPage?.manuscriptIndex === issue.page) {
        return `${spread.label} · Right`;
      }
    }
    return `Page ${issue.page}`;
  }, [isSpreadMode, spreads, bookPages]);

  // Filter issues
  const filteredIssues = useMemo(() => {
    let issues = [...pageIssuesExtended];

    // Beginner-friendly filter mapping
    if (beginnerFilter === 'important') {
      issues = issues.filter(i => i.severity === 'fail' || i.severity === 'risk');
    } else if (beginnerFilter === 'needs-fix') {
      issues = issues.filter(i => i.severity === 'fail' || i.severity === 'risk' || i.severity === 'warning');
    } else if (beginnerFilter === 'safe') {
      issues = issues.filter(i => i.severity === 'pass' || i.severity === 'safe');
    }

    // Filter by severity (advanced, from expanded filter)
    if (issueFilter.severity !== 'all') {
      issues = issues.filter(i => i.severity === issueFilter.severity);
    }

    // Filter by category
    if (issueFilter.category !== 'all') {
      issues = issues.filter(i => i.category === issueFilter.category);
    }

    // Filter by search
    if (issueFilter.search.trim()) {
      const q = issueFilter.search.toLowerCase();
      issues = issues.filter(i =>
        i.message.toLowerCase().includes(q) ||
        i.suggestion?.toLowerCase().includes(q) ||
        i.actual?.toLowerCase().includes(q) ||
        i.expected?.toLowerCase().includes(q)
      );
    }

    // Sort: worst first
    const severityOrder: CheckStatus[] = ['fail', 'risk', 'warning', 'safe', 'pass'];
    issues.sort((a, b) => severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity));

    return issues;
  }, [pageIssuesExtended, issueFilter, beginnerFilter]);

  // Group issues by SEVERITY (not category) — 🔴 Critical, 🟡 Warning, 🟢 OK
  const severityGroups = useMemo(() => {
    const critical = filteredIssues.filter(i => i.severity === 'fail' || i.severity === 'risk');
    const warnings = filteredIssues.filter(i => i.severity === 'warning');
    const passed = filteredIssues.filter(i => i.severity === 'pass' || i.severity === 'safe');
    return { critical, warnings, passed };
  }, [filteredIssues]);

  // -------------------------------------------------------------------------
  // In SPREAD mode: group issues by spread (then severity within each spread)
  // -------------------------------------------------------------------------
  interface SpreadGroup {
    spread: SpreadModel;
    spreadIndex: number;
    label: string;
    issues: PageIssueExtended[];
    worstSeverity: CheckStatus;
    leftIssues: PageIssueExtended[];
    rightIssues: PageIssueExtended[];
  }

  const spreadGroups = useMemo((): SpreadGroup[] => {
    if (!isSpreadMode) return [];

    const groups: SpreadGroup[] = [];
    for (let si = 0; si < spreads.length; si++) {
      const spread = spreads[si];
      const leftPage = spread.leftPageIndex !== null ? bookPages[spread.leftPageIndex] : null;
      const rightPage = spread.rightPageIndex !== null ? bookPages[spread.rightPageIndex] : null;

      const leftMIdx = leftPage?.manuscriptIndex;
      const rightMIdx = rightPage?.manuscriptIndex;

      const leftIssues = filteredIssues.filter(i => leftMIdx !== undefined && i.page === leftMIdx);
      const rightIssues = filteredIssues.filter(i => rightMIdx !== undefined && i.page === rightMIdx);
      const issues = [...leftIssues, ...rightIssues];

      if (issues.length === 0) continue;

      // Determine worst severity
      const severityOrder: CheckStatus[] = ['fail', 'risk', 'warning', 'safe', 'pass'];
      let worst: CheckStatus = 'pass';
      for (const iss of issues) {
        if (severityOrder.indexOf(iss.severity) < severityOrder.indexOf(worst)) {
          worst = iss.severity;
        }
      }

      groups.push({
        spread,
        spreadIndex: si,
        label: spread.label,
        issues,
        worstSeverity: worst,
        leftIssues,
        rightIssues,
      });
    }
    // Sort: worst severity spreads first
    const severityOrder: CheckStatus[] = ['fail', 'risk', 'warning', 'safe', 'pass'];
    groups.sort((a, b) => severityOrder.indexOf(a.worstSeverity) - severityOrder.indexOf(b.worstSeverity));

    return groups;
  }, [isSpreadMode, spreads, bookPages, filteredIssues]);

  // Issues relevant to current spread
  const currentSpreadIssues = useMemo(() => {
    const currentSpread = spreads[currentSpreadIdx];
    if (!currentSpread) return [];

    const pageIndices = [currentSpread.leftPageIndex, currentSpread.rightPageIndex].filter((idx): idx is number => idx !== null);
    const manuscriptIndices = pageIndices
      .map(idx => bookPages[idx]?.manuscriptIndex)
      .filter((idx): idx is number => idx !== undefined);

    return filteredIssues.filter(i => manuscriptIndices.includes(i.page));
  }, [spreads, currentSpreadIdx, bookPages, filteredIssues]);

  // Current spread label for the pinned section
  const currentSpreadLabel = useMemo(() => {
    if (!isSpreadMode) return 'Current Page';
    const spread = spreads[currentSpreadIdx];
    return spread ? `Current: ${spread.label}` : 'Current Spread';
  }, [isSpreadMode, spreads, currentSpreadIdx]);

  const findPageIndex = useCallback((manuscriptPage: number): number => {
    return bookPages.findIndex((p) => p.manuscriptIndex === manuscriptPage);
  }, [bookPages]);

  const handleIssueClick = useCallback((issue: PageIssueExtended) => {
    onSelectIssue(issue.id);
    const pIdx = findPageIndex(issue.page);
    if (pIdx >= 0) onJumpToPage(pIdx);
  }, [onSelectIssue, findPageIndex, onJumpToPage]);

  // Update search with debounce
  useEffect(() => {
    const t = setTimeout(() => {
      setIssueFilter({ search: searchInput });
    }, 200);
    return () => clearTimeout(t);
  }, [searchInput, setIssueFilter]);

  const trimLabel = bookConfig.trimSize === 'custom'
    ? `${bookConfig.customWidth}" × ${bookConfig.customHeight}"`
    : bookConfig.trimSize.replace('x', '" × ') + '"';

  const beginnerFilters: { key: BeginnerFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'important', label: 'Important' },
    { key: 'needs-fix', label: 'Needs Fix' },
    { key: 'safe', label: 'Safe' },
  ];

  return (
    <div className="flex flex-col h-full bg-card">
      {/* ---- Section 1: PROMINENT STATUS BANNER ---- */}
      <div className={`shrink-0 px-4 py-4 border-b ${
        validationSummary.isReady
          ? 'bg-success/[0.06] border-success/20'
          : validationSummary.overallStatus === 'fail'
          ? 'bg-danger/[0.06] border-danger/20'
          : validationSummary.overallStatus === 'risk'
          ? 'bg-warning/[0.06] border-warning/20'
          : 'bg-warning/[0.04] border-warning/20'
      }`}>
        {/* Main status indicator — LARGE and CLEAR */}
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            validationSummary.isReady
              ? 'bg-success/20'
              : validationSummary.overallStatus === 'fail'
              ? 'bg-danger/20'
              : validationSummary.overallStatus === 'risk'
              ? 'bg-warning/20'
              : 'bg-warning/15'
          }`}>
            {validationSummary.isReady ? <CheckCircle2 className="w-5 h-5 text-success" />
             : validationSummary.overallStatus === 'fail' ? <XCircle className="w-5 h-5 text-danger" />
             : validationSummary.overallStatus === 'risk' ? <AlertTriangle className="w-5 h-5 text-warning" />
             : <AlertCircle className="w-5 h-5 text-warning" />}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className={`text-[15px] font-bold ${
                validationSummary.isReady ? 'text-success'
                : validationSummary.overallStatus === 'fail' ? 'text-danger'
                : validationSummary.overallStatus === 'risk' ? 'text-warning'
                : 'text-warning'
              }`}>
                {validationSummary.isReady ? 'Safe for KDP'
                 : validationSummary.overallStatus === 'fail' ? 'High Rejection Risk'
                 : validationSummary.overallStatus === 'risk' ? 'Print Edge Risk'
                 : 'Probably Acceptable'}
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-foreground/[0.18] dark:bg-foreground/[0.10] dark:bg-foreground/[0.04] text-foreground/85 dark:text-foreground/60 dark:text-foreground/20 font-medium">
                {isSpreadMode ? '📖 Spread' : '📄 Single'}
              </span>
            </div>
            <p className="text-[11px] text-foreground/85 dark:text-foreground/70 dark:text-foreground/35 mt-0.5">
              {validationSummary.isReady
                ? 'Your book meets KDP requirements — no blocking issues found.'
                : validationSummary.overallStatus === 'fail'
                ? 'Significant issues found that may cause KDP to reject your file.'
                : validationSummary.overallStatus === 'risk'
                ? 'Some issues may cause print inconsistencies. Review recommended.'
                : 'Minor issues found, but KDP will likely accept your file.'}
            </p>
          </div>
        </div>

        {/* Document summary pills */}
        <div className="flex items-center gap-1 flex-wrap mb-2">
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-foreground/[0.18] dark:bg-foreground/[0.10] dark:bg-foreground/[0.04] text-foreground/65 dark:text-foreground/25 font-medium">{bookType.charAt(0).toUpperCase() + bookType.slice(1)}</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-foreground/[0.18] dark:bg-foreground/[0.10] dark:bg-foreground/[0.04] text-foreground/65 dark:text-foreground/25 font-medium">{trimLabel}</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-foreground/[0.18] dark:bg-foreground/[0.10] dark:bg-foreground/[0.04] text-foreground/65 dark:text-foreground/25 font-medium">{bookPages.length} pages</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-foreground/[0.18] dark:bg-foreground/[0.10] dark:bg-foreground/[0.04] text-foreground/65 dark:text-foreground/25 font-medium">{measurements.spineWidthIn.toFixed(3)}" spine</span>
        </div>

        {/* Status pills — severity grouped with realistic KDP labels */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {validationSummary.fail + validationSummary.risk > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded bg-danger/15 text-danger font-bold">
              {validationSummary.fail + validationSummary.risk} Critical
            </span>
          )}
          {validationSummary.warning > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded bg-warning/15 text-warning font-bold">
              {validationSummary.warning} Warning
            </span>
          )}
          {validationSummary.safe + validationSummary.pass > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded bg-success/10 text-success/60 font-medium">
              {validationSummary.safe + validationSummary.pass} OK
            </span>
          )}
          {validationSummary.total === 0 && (
            <span className="text-[10px] text-success/50">No issues detected</span>
          )}
        </div>
      </div>

      {/* ---- Section 2: Beginner-Friendly Filter Bar ---- */}
      <div className="shrink-0 border-b border-foreground/[0.18] dark:border-foreground/[0.06] px-4 py-2">
        {/* Beginner filter tabs */}
        <div className="flex items-center gap-1 mb-2">
          {beginnerFilters.map(f => (
            <button
              key={f.key}
              onClick={() => setBeginnerFilter(f.key)}
              className={`px-3 py-1.5 rounded-md text-[11px] font-medium transition-colors min-h-[32px] ${
                beginnerFilter === f.key
                  ? f.key === 'important' ? 'bg-warning/15 text-warning'
                    : f.key === 'needs-fix' ? 'bg-warning/15 text-warning'
                    : f.key === 'safe' ? 'bg-success/10 text-success/60'
                    : 'bg-foreground/[0.16] dark:bg-foreground/[0.08] text-foreground/60'
                  : 'text-foreground/85 dark:text-foreground/60 dark:text-foreground/20 hover:text-foreground/85 dark:text-foreground/70 dark:text-foreground/35 hover:bg-foreground/[0.16] dark:bg-foreground/[0.08] dark:bg-foreground/[0.03]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-foreground/55 dark:text-foreground/15" />
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search issues..."
            className="w-full bg-foreground/[0.18] dark:bg-foreground/[0.10] dark:bg-foreground/[0.04] border border-foreground/[0.18] dark:border-foreground/[0.06] rounded-md pl-7 pr-2 py-1.5 text-[10px] text-foreground/85 dark:text-foreground/60 placeholder:text-foreground/55 dark:text-foreground/15 outline-none focus:border-success/30 transition-colors"
          />
        </div>
      </div>

      {/* ---- Section 3: Current Page/Spread Issues (pinned) ---- */}
      {currentSpreadIssues.length > 0 && (
        <div className="shrink-0 border-b border-foreground/[0.18] dark:border-foreground/[0.06] px-4 py-2">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Info className="w-3 h-3 text-foreground/85 dark:text-foreground/60 dark:text-foreground/20" />
            <span className="text-[9px] font-medium text-foreground/65 dark:text-foreground/25 uppercase tracking-wider">{currentSpreadLabel}</span>
            <span className="text-[8px] px-1 py-0.5 rounded bg-foreground/[0.13] dark:bg-foreground/[0.06] text-foreground/85 dark:text-foreground/60 dark:text-foreground/20">{currentSpreadIssues.length}</span>
          </div>
          <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
            {currentSpreadIssues.map((issue, i) => (
              <FriendlyIssueCard
                key={issue.id}
                issue={issue}
                isSelected={selectedIssueId === issue.id}
                onClick={() => handleIssueClick(issue)}
                locationLabel={getLocationLabel(issue)}
                staggerIndex={i}
              />
            ))}
          </div>
        </div>
      )}

      {/* ---- Section 4: All Issues ---- */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
        {filteredIssues.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            {pageIssuesExtended.length === 0 ? (
              <>
                <CheckCircle2 className="w-8 h-8 text-success/30" />
                <span className="text-[12px] text-success/40 font-medium">Looks good for KDP</span>
                <span className="text-[10px] text-foreground/55 dark:text-foreground/15">No issues detected</span>
              </>
            ) : (
              <>
                <Search className="w-6 h-6 text-foreground/80 dark:text-foreground/50 dark:text-foreground/10" />
                <span className="text-[11px] text-foreground/85 dark:text-foreground/60 dark:text-foreground/20">No issues match your filter</span>
              </>
            )}
          </div>
        ) : isSpreadMode ? (
          /* ────────────────────────────────────────────────────────────────── */
          /* SPREAD MODE: Group issues by spread, with left/right indicators    */
          /* ────────────────────────────────────────────────────────────────── */
          <div className="p-3 space-y-4">
            {spreadGroups.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2">
                <CheckCircle2 className="w-6 h-6 text-success/25" />
                <span className="text-[11px] text-success/35">All spreads look good</span>
              </div>
            ) : (
              spreadGroups.map((group) => {
                const isCurrentSpread = group.spreadIndex === currentSpreadIdx;
                const severityColors = getSeverityColors(group.worstSeverity);
                const severityDot = group.worstSeverity === 'fail' || group.worstSeverity === 'risk' ? 'Critical'
                  : group.worstSeverity === 'warning' ? 'Warning' : 'OK';

                return (
                  <div key={group.spread.id} className={`rounded-lg border transition-all ${
                    isCurrentSpread
                      ? 'border-success/30 bg-success/[0.03]'
                      : 'border-foreground/[0.25] dark:border-foreground/[0.12] dark:border-foreground/[0.04] hover:border-foreground/[0.22] dark:border-foreground/[0.08]'
                  }`}>
                    {/* Spread header */}
                    <div className="flex items-center gap-2 px-3 py-2 border-b border-foreground/[0.25] dark:border-foreground/[0.12] dark:border-foreground/[0.04]">
                      <span className="text-[10px] uppercase tracking-wider text-foreground/65 dark:text-foreground/25">{severityDot}</span>
                      <span className={`text-[12px] font-semibold ${
                        isCurrentSpread ? 'text-success' : 'text-foreground/60'
                      }`}>
                        {group.label}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${severityColors.bg} ${severityColors.text}`}>
                        {group.issues.length} issue{group.issues.length !== 1 ? 's' : ''}
                      </span>
                      {isCurrentSpread && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-success/15 text-success font-medium">
                          Viewing
                        </span>
                      )}
                    </div>

                    {/* Left page issues */}
                    {group.leftIssues.length > 0 && (
                      <div className={group.rightIssues.length > 0 ? 'border-b border-foreground/[0.10] dark:border-foreground/[0.03]' : ''}>
                        {!group.spread.isSingle && (
                          <div className="px-3 pt-1.5 pb-0.5">
                            <span className="text-[9px] font-medium text-foreground/85 dark:text-foreground/60 dark:text-foreground/20 uppercase tracking-wider">
                              {group.spread.isSingle ? '' : 'Left page'}
                            </span>
                          </div>
                        )}
                        <div className="px-2 pb-1 space-y-1">
                          {group.leftIssues.map((issue, i) => (
                            <FriendlyIssueCard
                              key={issue.id}
                              issue={issue}
                              isSelected={selectedIssueId === issue.id}
                              onClick={() => handleIssueClick(issue)}
                              locationLabel={getLocationLabel(issue)}
                              staggerIndex={i}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Right page issues */}
                    {group.rightIssues.length > 0 && (
                      <div>
                        <div className="px-3 pt-1.5 pb-0.5">
                          <span className="text-[9px] font-medium text-foreground/85 dark:text-foreground/60 dark:text-foreground/20 uppercase tracking-wider">
                            Right page
                          </span>
                        </div>
                        <div className="px-2 pb-2 space-y-1">
                          {group.rightIssues.map((issue, i) => (
                            <FriendlyIssueCard
                              key={issue.id}
                              issue={issue}
                              isSelected={selectedIssueId === issue.id}
                              onClick={() => handleIssueClick(issue)}
                              locationLabel={getLocationLabel(issue)}
                              staggerIndex={i}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        ) : (
          /* ────────────────────────────────────────────────────────────────── */
          /* SINGLE MODE: Group by severity (original behavior)                 */
          /* ────────────────────────────────────────────────────────────────── */
          <div className="p-3 space-y-5">
            {/* 🔴 HIGH REJECTION RISK — May be rejected by KDP */}
            {severityGroups.critical.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3 px-1">
                  <span className="text-[12px] font-semibold text-danger/80">High Rejection Risk</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-danger/15 text-danger font-bold">{severityGroups.critical.length}</span>
                </div>
                <div className="space-y-2">
                  {severityGroups.critical.map((issue, i) => (
                    <FriendlyIssueCard
                      key={issue.id}
                      issue={issue}
                      isSelected={selectedIssueId === issue.id}
                      onClick={() => handleIssueClick(issue)}
                      staggerIndex={i}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 🟡 PROBABLY OK — KDP likely accepts, improvements recommended */}
            {severityGroups.warnings.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3 px-1">
                  <span className="text-[12px] font-semibold text-warning/80">Probably Acceptable</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-warning/15 text-warning font-bold">{severityGroups.warnings.length}</span>
                </div>
                <div className="space-y-2">
                  {severityGroups.warnings.map((issue, i) => (
                    <FriendlyIssueCard
                      key={issue.id}
                      issue={issue}
                      isSelected={selectedIssueId === issue.id}
                      onClick={() => handleIssueClick(issue)}
                      staggerIndex={severityGroups.critical.length + i}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 🟢 SAFE FOR KDP — No practical concerns */}
            {severityGroups.passed.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3 px-1">
                  <span className="text-[12px] font-semibold text-success/70">Safe for KDP</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-success/10 text-success/70 font-medium">{severityGroups.passed.length}</span>
                </div>
                <div className="space-y-2">
                  {severityGroups.passed.map((issue, i) => (
                    <FriendlyIssueCard
                      key={issue.id}
                      issue={issue}
                      isSelected={selectedIssueId === issue.id}
                      onClick={() => handleIssueClick(issue)}
                      staggerIndex={severityGroups.critical.length + severityGroups.warnings.length + i}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-component: SummaryItem
// ---------------------------------------------------------------------------

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-[9px] text-foreground/85 dark:text-foreground/60 dark:text-foreground/20">{label}</span>
      <span className="text-[10px] text-foreground/80 dark:text-foreground/50 font-medium">{value}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-component: JumpToPageModal
// ---------------------------------------------------------------------------

function JumpToPageModal({
  open,
  bookPages,
  onJump,
  onClose,
}: {
  open: boolean;
  bookPages: BookPage[];
  onJump: (index: number) => void;
  onClose: () => void;
}) {
  const [value, setValue] = useState('');

  if (!open) return null;

  const handleJump = () => {
    const num = parseInt(value, 10);
    const mIdx = bookPages.findIndex((p) => p.manuscriptIndex === num);
    if (mIdx >= 0) {
      onJump(mIdx);
      onClose();
      setValue('');
      return;
    }
    if (num >= 0 && num < bookPages.length) {
      onJump(num);
      onClose();
      setValue('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-card border border-foreground/[0.22] dark:border-foreground/[0.08] rounded-xl p-5 w-80 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-sm font-semibold text-foreground/80 mb-1">Jump to Page</h3>
        <p className="text-[11px] text-foreground/65 dark:text-foreground/25 mb-3">Enter a manuscript page number</p>
        <div className="flex gap-2">
          <input
            type="number"
            min={0}
            max={bookPages.length - 1}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleJump(); }}
            placeholder="e.g. 5"
            className="ds-control flex-1 rounded-lg px-3 py-2 text-sm placeholder:text-muted-foreground"
            autoFocus
          />
          <button
            onClick={handleJump}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:brightness-105"
          >
            Go
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-component: ProcessingState
// ---------------------------------------------------------------------------

function ProcessingState({ status }: { status: ProcessingStatus }) {
  if (status === 'ready' || status === 'idle') return null;

  const messages: Record<ProcessingStatus, string> = {
    idle: '',
    parsing: 'Parsing PDF...',
    rendering: 'Rendering pages...',
    analyzing: 'Analyzing pages...',
    ready: '',
    error: 'Processing failed',
  };

  return (
    <div className="flex items-center justify-center gap-3">
      <Loader2 className="w-5 h-5 text-success/60 animate-spin" />
      <span className="text-sm text-foreground/90 dark:text-foreground/75 dark:text-foreground/40">{messages[status]}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-component: ScanProgressOverlay — cinematic scan animation for canvas
// ---------------------------------------------------------------------------

const SCAN_PHASES = [
  { key: 'parsing', label: 'Parsing PDF structure', pct: 22 },
  { key: 'rendering', label: 'Rendering page previews', pct: 58 },
  { key: 'analyzing', label: 'Analyzing KDP compliance', pct: 88 },
] as const;

const SCAN_DOC_H = 260;

function ScanProgressOverlay({ status }: { status: ProcessingStatus }) {
  const reduced = useReducedMotion();
  const phase = SCAN_PHASES.find(p => p.key === status) ?? SCAN_PHASES[0];
  const phaseIdx = SCAN_PHASES.findIndex(p => p.key === status);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
      {/* Ambient radial glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_38%_at_50%_50%,color-mix(in_srgb,var(--primary)_8%,transparent),transparent)]" />

      {/* Document mockup with scan line */}
      <div className="relative mb-8">
        {/* Outer glow ring */}
        {!reduced && (
          <motion.div
            className="absolute -inset-5 -z-10 rounded-[10px] bg-primary/10 blur-2xl"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}

        <div
          className="relative overflow-hidden rounded-[3px] border border-foreground/[0.22] dark:border-foreground/[0.08] bg-foreground/[0.14] dark:bg-foreground/[0.07] dark:bg-foreground/[0.025]"
          style={{ width: 176, height: SCAN_DOC_H }}
        >
          {/* Faint document content lines */}
          <div className="absolute inset-[14px] flex flex-col gap-[6px] pt-2">
            {[100, 80, 100, 70, 100, 88, 62, 100, 92, 78, 100, 82, 60, 100].map((w, i) => (
              <i
                key={i}
                className={`block h-[5px] rounded-full bg-foreground/${i < 2 ? '7' : '4'}`}
                style={{ width: `${w}%` }}
              />
            ))}
          </div>

          {/* Issue-detection pulses (only during analyzing) */}
          {!reduced && status === 'analyzing' && (
            <>
              <motion.div
                className="absolute left-[14px] right-[14px] h-[18px] rounded-[2px] border border-danger/25 bg-danger/10"
                style={{ top: 64 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0.7] }}
                transition={{ delay: 0.4, duration: 0.5 }}
              />
              <motion.div
                className="absolute left-[14px] right-[14px] h-[14px] rounded-[2px] border border-warning/20 bg-warning/10"
                style={{ top: 142 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0.55] }}
                transition={{ delay: 0.9, duration: 0.4 }}
              />
            </>
          )}

          {/* Animated scan line + glow trail */}
          {!reduced && (
            <motion.div
              className="pointer-events-none absolute inset-x-0"
              style={{ top: 0 }}
              animate={{ y: [-2, SCAN_DOC_H + 2] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'linear', repeatDelay: 0.55 }}
            >
              <div className="h-[2px] bg-gradient-to-r from-transparent via-primary/85 to-transparent" />
              <div className="h-7 bg-gradient-to-b from-primary/15 to-transparent" />
            </motion.div>
          )}
        </div>
      </div>

      {/* Status label */}
      <p className="mb-1 text-[13px] font-medium text-foreground/80 dark:text-foreground/50">
        {phase.label}
        {!reduced && (
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          >
            …
          </motion.span>
        )}
        {reduced && '…'}
      </p>

      {/* Phase step indicators */}
      <div className="mb-4 flex items-center gap-1.5">
        {SCAN_PHASES.map((p, i) => (
          <React.Fragment key={p.key}>
            <div
              className={`rounded-full transition-all duration-500 ${
                i < phaseIdx
                  ? 'h-1.5 w-1.5 bg-primary/55'
                  : i === phaseIdx
                  ? 'h-2 w-2 bg-primary'
                  : 'h-1.5 w-1.5 bg-foreground/12'
              }`}
            />
            {i < SCAN_PHASES.length - 1 && (
              <div className={`h-px w-6 transition-all duration-500 ${i < phaseIdx ? 'bg-primary/30' : 'bg-foreground/8'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Progress bar */}
      <div className="h-[3px] w-56 overflow-hidden rounded-full bg-foreground/[0.14] dark:bg-foreground/[0.07]">
        <motion.div
          className="h-full rounded-full bg-primary"
          animate={{ width: `${phase.pct}%` }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-component: ScanSummaryBar — dismissible banner after scan completes
// ---------------------------------------------------------------------------

function ScanSummaryBar({
  summary,
  pageCount,
  onDismiss,
}: {
  summary: { fail: number; risk: number; warning: number };
  pageCount: number;
  onDismiss: () => void;
}) {
  const total = summary.fail + summary.risk + summary.warning;
  const isClean = total === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="absolute top-2.5 left-1/2 z-10 -translate-x-1/2"
    >
      <div className="flex items-center gap-2 rounded-full border border-foreground/8 bg-background/90 px-3 py-1.5 shadow-lg shadow-black/30 backdrop-blur-md">
        {isClean ? (
          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-primary">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Safe for KDP — no issues detected
          </span>
        ) : (
          <>
            <span className="text-[10px] font-medium text-foreground/65 dark:text-foreground/30">Scan complete</span>
            <div className="h-3 w-px bg-foreground/10" />
            {summary.fail + summary.risk > 0 && (
              <span className="text-[10px] font-bold text-danger">
                {summary.fail + summary.risk} critical
              </span>
            )}
            {summary.warning > 0 && (
              <span className="text-[10px] font-bold text-warning">{summary.warning} warn</span>
            )}
            <div className="h-3 w-px bg-foreground/10" />
            <span className="text-[10px] text-foreground/65 dark:text-foreground/25">{pageCount} pages checked</span>
          </>
        )}
        <button
          onClick={onDismiss}
          className="ml-0.5 rounded-full p-0.5 text-foreground/55 dark:text-foreground/15 transition-colors hover:text-foreground/85 dark:text-foreground/70 dark:text-foreground/35"
          aria-label="Dismiss scan summary"
        >
          <X className="h-2.5 w-2.5" />
        </button>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Sub-component: FitDropdown
// ---------------------------------------------------------------------------

function FitDropdown({
  fitMode,
  onFitSelect,
}: {
  fitMode: FitMode;
  onFitSelect: (mode: FitMode) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const items: { mode: FitMode; label: string; shortcut: string }[] = [
    { mode: 'fit-page', label: 'Fit Page', shortcut: '0' },
    { mode: 'fit-width', label: 'Fit Width', shortcut: '' },
    { mode: 'fit-spread', label: 'Fit Spread', shortcut: '' },
    { mode: 'actual', label: 'Actual Size', shortcut: '1' },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium text-foreground/65 dark:text-foreground/30 hover:text-foreground/80 dark:text-foreground/50 hover:bg-foreground/[0.18] dark:bg-foreground/[0.10] dark:bg-foreground/[0.04] transition-colors"
      >
        <Maximize2 className="w-3 h-3" />
        <span className="hidden sm:inline">Fit</span>
        <ChevronDown className={`w-2.5 h-2.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-muted border border-foreground/[0.22] dark:border-foreground/[0.08] rounded-lg shadow-xl py-1 min-w-[140px] z-50">
          {items.map((item) => (
            <button
              key={item.mode}
              onClick={() => { onFitSelect(item.mode); setOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-1.5 text-[11px] transition-colors ${
                fitMode === item.mode ? 'text-success bg-foreground/[0.16] dark:bg-foreground/[0.08] dark:bg-foreground/[0.03]' : 'text-foreground/80 dark:text-foreground/50 hover:text-foreground/85 dark:text-foreground/70 hover:bg-foreground/[0.16] dark:bg-foreground/[0.08] dark:bg-foreground/[0.03]'
              }`}
            >
              <span>{item.label}</span>
              {item.shortcut && <span className="text-[9px] text-foreground/55 dark:text-foreground/15 font-mono">{item.shortcut}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component: PreviewStep — PROFESSIONAL PUBLISHING WORKSPACE
// 3-Panel Layout: Left Sidebar + Center Canvas + Right Validation
// ---------------------------------------------------------------------------

export default function PreviewStep() {
  const {
    bookType,
    measurements,
    bookConfig,
    uploadedCover,
    uploadedManuscript,
    previewViewMode,
    currentPage,
    setCurrentPage,
    activeOverlays,
    pageIssues,
    setCheckerStep,
    setPreviewViewMode,
    toggleOverlay,
    pdfPageDataUrls,
    setPdfPageDataUrl,
    clearPdfPageData,
    bookPages,
    setBookPages,
    coverDataUrl,
    setCoverDataUrl,
    previewReady,
    processingStatus,
    pageIssuesExtended,
    selectedIssueId,
    setSelectedIssueId,
    issueFilter,
    setIssueFilter,
    saveStatus,
    setSaveStatus,
    hasRestoredSession,
    setHasRestoredSession,
    sidebarCollapsed,
    setSidebarCollapsed,
    dismissHint,
    isHintDismissed,
    pdfAnalysis,
    setPdfAnalysis,
    setPageIssuesExtended,
  } = useAppStore();

  // --- Local state ---
  const [jumpModalOpen, setJumpModalOpen] = useState(false);
  const [fitMode, setFitMode] = useState<FitMode>('fit-page');
  const [loading, setLoading] = useState(false);
  const [restoreWorkspace, setRestoreWorkspace] = useState<SavedWorkspace | null>(null);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [showSummaryBar, setShowSummaryBar] = useState(false);

  // --- Zoom & Pan state (smooth interpolation) ---
  const targetZoomRef = useRef(1);
  const currentZoomRef = useRef(1);
  const [displayZoom, setDisplayZoom] = useState(1);
  const targetPanRef = useRef({ x: 0, y: 0 });
  const currentPanRef = useRef({ x: 0, y: 0 });
  const [displayPan, setDisplayPan] = useState({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });

  // Auto-save timer ref
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // -------------------------------------------------------------------------
  // Session restore on mount
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (hasRestoredSession) return;
    let cancelled = false;
    (async () => {
      try {
        const saved = await loadWorkspace();
        if (!cancelled && saved) {
          setRestoreWorkspace(saved);
          setShowRestoreDialog(true);
        }
      } catch (err) {
        console.error('Failed to check for saved workspace:', err);
      }
    })();
    return () => { cancelled = true; };
  }, [hasRestoredSession]);

  // Handle restore
  const handleRestore = useCallback(() => {
    if (!restoreWorkspace) return;
    const ws = restoreWorkspace;
    // Restore state from saved workspace
    setCurrentPage(ws.currentPage);
    setPreviewViewMode(ws.previewViewMode);
    useAppStore.getState().setOverlays(ws.activeOverlays);
    setIssueFilter(ws.issueFilter);
    setBookPages(ws.bookPages);
    useAppStore.getState().setSpreadModels(ws.spreadModels);
    if (ws.coverDataUrl) setCoverDataUrl(ws.coverDataUrl);
    // Restore pdf page data urls
    const pdfMap = recordToMap(ws.pdfPageDataUrls);
    pdfMap.forEach((url, page) => {
      setPdfPageDataUrl(page, url);
    });
    setHasRestoredSession(true);
    setShowRestoreDialog(false);
    setRestoreWorkspace(null);
  }, [restoreWorkspace, setCurrentPage, setPreviewViewMode, setIssueFilter, setBookPages, setCoverDataUrl, setPdfPageDataUrl, setHasRestoredSession]);

  const handleDiscardRestore = useCallback(async () => {
    try {
      await clearWorkspace();
    } catch { /* ignore */ }
    setHasRestoredSession(true);
    setShowRestoreDialog(false);
    setRestoreWorkspace(null);
  }, [setHasRestoredSession]);

  // -------------------------------------------------------------------------
  // Compute spreads (CORRECT pairing) — must be before auto-save
  // -------------------------------------------------------------------------
  const spreads = useMemo(() => computeSpreads(bookPages), [bookPages]);

  const currentSpreadIdx = useMemo(() => {
    return spreads.findIndex(s =>
      s.leftPageIndex === currentPage || s.rightPageIndex === currentPage
    );
  }, [spreads, currentPage]);

  // -------------------------------------------------------------------------
  // Auto-save system
  // -------------------------------------------------------------------------
  const triggerAutoSave = useCallback(() => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    autoSaveTimerRef.current = setTimeout(async () => {
      if (bookPages.length === 0) return;
      setSaveStatus('saving');
      try {
        await saveWorkspace({
          bookType,
          bookConfig,
          coverFileName: uploadedCover?.name ?? '',
          manuscriptFileName: uploadedManuscript?.name ?? '',
          coverDataUrl,
          pdfPageDataUrls: mapToRecord(pdfPageDataUrls),
          currentPage,
          previewViewMode,
          activeOverlays,
          issueFilter,
          bookPages,
          spreadModels: spreads,
          savedAt: Date.now(),
          createdAt: restoreWorkspace?.createdAt ?? Date.now(),
        });
        setSaveStatus('saved');
      } catch {
        setSaveStatus('error');
      }
    }, 5000); // Debounce 5 seconds
  }, [bookPages, bookType, bookConfig, uploadedCover, uploadedManuscript, coverDataUrl, pdfPageDataUrls, currentPage, previewViewMode, activeOverlays, issueFilter, spreads, restoreWorkspace, setSaveStatus]);

  // Save after major actions
  useEffect(() => {
    if (bookPages.length > 0 && hasRestoredSession) {
      triggerAutoSave();
    }
  }, [currentPage, previewViewMode, activeOverlays, selectedIssueId, issueFilter, bookPages.length, hasRestoredSession, triggerAutoSave]);

  // -------------------------------------------------------------------------
  // Refresh protection — warn before leaving if session is active
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (bookPages.length === 0) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [bookPages.length]);

  // -------------------------------------------------------------------------
  // Compute validation summary
  // -------------------------------------------------------------------------
  const validationSummary = useMemo(() => {
    return computeValidationSummary(pageIssuesExtended);
  }, [pageIssuesExtended]);

  // -------------------------------------------------------------------------
  // Re-validate when bookConfig or measurements change
  // This is CRITICAL: the validator must ALWAYS use the active config.
  // Previously, issues were only computed once during import (with stale 6×9 defaults)
  // and never updated when the user changed trim size, bleed, etc.
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!pdfAnalysis) return;
    if (bookPages.length === 0) return;

    const revalidatedIssues = analyzePagesForIssues(
      pdfAnalysis,
      bookConfig,
      measurements,
    );
    setPageIssuesExtended(revalidatedIssues);
  }, [bookConfig, measurements, pdfAnalysis, bookPages.length, setPageIssuesExtended]);

  // -------------------------------------------------------------------------
  // Find the selected issue's highlight region for current page
  // -------------------------------------------------------------------------
  const selectedIssue = useMemo(() => {
    if (!selectedIssueId) return null;
    return pageIssuesExtended.find(i => i.id === selectedIssueId) ?? null;
  }, [selectedIssueId, pageIssuesExtended]);

  // -------------------------------------------------------------------------
  // Observe container size
  // -------------------------------------------------------------------------
  useEffect(() => {
    const el = canvasContainerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerSize({
          w: entry.contentRect.width,
          h: entry.contentRect.height,
        });
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // -------------------------------------------------------------------------
  // Smooth zoom/pan animation loop
  // -------------------------------------------------------------------------
  useEffect(() => {
    const animate = () => {
      let dirty = false;

      const zDiff = targetZoomRef.current - currentZoomRef.current;
      if (Math.abs(zDiff) > 0.0005) {
        currentZoomRef.current += zDiff * ZOOM_DAMPING;
        dirty = true;
      } else if (zDiff !== 0) {
        currentZoomRef.current = targetZoomRef.current;
        dirty = true;
      }

      const pxDiff = targetPanRef.current.x - currentPanRef.current.x;
      const pyDiff = targetPanRef.current.y - currentPanRef.current.y;
      if (Math.abs(pxDiff) > 0.2 || Math.abs(pyDiff) > 0.2) {
        currentPanRef.current.x += pxDiff * PAN_DAMPING;
        currentPanRef.current.y += pyDiff * PAN_DAMPING;
        dirty = true;
      } else if (pxDiff !== 0 || pyDiff !== 0) {
        currentPanRef.current.x = targetPanRef.current.x;
        currentPanRef.current.y = targetPanRef.current.y;
        dirty = true;
      }

      if (dirty) {
        setDisplayZoom(currentZoomRef.current);
        setDisplayPan({ x: currentPanRef.current.x, y: currentPanRef.current.y });
      }

      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // -------------------------------------------------------------------------
  // Calculate fit zoom values
  // -------------------------------------------------------------------------
  const fitZoomValues = useMemo(() => {
    if (bookPages.length === 0 || containerSize.w <= 0 || containerSize.h <= 0) {
      return { page: 1, width: 1, height: 1, spread: 1, actual: 1 };
    }

    const padding = 64;
    const cw = containerSize.w - padding;
    const ch = containerSize.h - padding;

    if (cw <= 0 || ch <= 0) return { page: 1, width: 1, height: 1, spread: 1, actual: 1 };

    const page = bookPages[currentPage];
    if (!page) return { page: 1, width: 1, height: 1, spread: 1, actual: 1 };

    const isSpread = previewViewMode === 'spread' && bookType !== 'kindle';
    const pxPerIn = 96;

    const singleW = (page.widthIn || measurements.trimWidthIn) * pxPerIn;
    const singleH = (page.heightIn || measurements.trimHeightIn) * pxPerIn;

    let spreadW = singleW;
    let spreadH = singleH;
    if (isSpread && currentSpreadIdx >= 0) {
      const spread = spreads[currentSpreadIdx];
      if (spread && spread.leftPageIndex !== null && spread.rightPageIndex !== null) {
        const leftPage = bookPages[spread.leftPageIndex];
        const rightPage = bookPages[spread.rightPageIndex];
        if (leftPage && rightPage) {
          const leftW = (leftPage.widthIn || measurements.trimWidthIn) * pxPerIn;
          const rightW = (rightPage.widthIn || measurements.trimWidthIn) * pxPerIn;
          spreadW = leftW + rightW + 6;
          spreadH = Math.max(
            (leftPage.heightIn || measurements.trimHeightIn) * pxPerIn,
            (rightPage.heightIn || measurements.trimHeightIn) * pxPerIn,
          );
        }
      }
    }

    return {
      page: Math.min(cw / singleW, ch / singleH),
      width: cw / singleW,
      height: ch / singleH,
      spread: Math.min(cw / spreadW, ch / spreadH),
      actual: 1,
    };
  }, [bookPages, currentPage, previewViewMode, bookType, measurements, containerSize, currentSpreadIdx, spreads]);

  // -------------------------------------------------------------------------
  // Apply fit mode
  // -------------------------------------------------------------------------
  const applyFitMode = useCallback((mode: FitMode) => {
    setFitMode(mode);
    targetPanRef.current = { x: 0, y: 0 };

    switch (mode) {
      case 'fit-page':
        targetZoomRef.current = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, fitZoomValues.page));
        break;
      case 'fit-width':
        targetZoomRef.current = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, fitZoomValues.width));
        break;
      case 'fit-height':
        targetZoomRef.current = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, fitZoomValues.height));
        break;
      case 'fit-spread':
        targetZoomRef.current = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, fitZoomValues.spread));
        break;
      case 'actual':
        targetZoomRef.current = 1;
        break;
    }
  }, [fitZoomValues]);

  // Auto-fit when pages change or view mode changes
  useEffect(() => {
    if (fitMode === 'custom') return;
    if (previewViewMode === 'spread' && bookType !== 'kindle') {
      applyFitMode('fit-spread');
    } else {
      applyFitMode('fit-page');
    }
  }, [fitZoomValues, fitMode, applyFitMode, previewViewMode, bookType]);

  // -------------------------------------------------------------------------
  // Load cover data URL (fallback)
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (coverDataUrl || !uploadedCover) return;
    let cancelled = false;
    (async () => {
      try {
        const file = uploadedCover.file;
        if (file.type === 'application/pdf') {
          const result = await loadPDF(file, { maxPages: 1, renderScale: 2.0 });
          if (!cancelled && result.pages.length > 0) {
            setCoverDataUrl(result.pages[0].dataUrl);
          }
        } else {
          const reader = new FileReader();
          reader.onload = (e) => {
            if (!cancelled) setCoverDataUrl(e.target?.result as string);
          };
          reader.readAsDataURL(file);
        }
      } catch (err) {
        console.error('Failed to load cover:', err);
      }
    })();
    return () => { cancelled = true; };
  }, [uploadedCover, coverDataUrl, setCoverDataUrl]);

  // -------------------------------------------------------------------------
  // Load manuscript pages (fallback)
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (pdfPageDataUrls.size > 0 || !uploadedManuscript) return;
    let cancelled = false;

    (async () => {
      setLoading(true);

      try {
        const result = await loadPDF(uploadedManuscript.file, { maxPages: 50, renderScale: 1.5 });
        if (cancelled) return;

        for (const page of result.pages) {
          if (page.dataUrl) {
            setPdfPageDataUrl(page.index, page.dataUrl);
          }
        }

        if (result.pageCount > 50) {
          for (let i = 51; i <= Math.min(result.pageCount, 200); i++) {
            if (cancelled) break;
            try {
              const pageResult = await renderSinglePage(uploadedManuscript.file, i, 1.5);
              setPdfPageDataUrl(i, pageResult.dataUrl);
            } catch {
              // Skip
            }
          }
        }
      } catch (err) {
        console.error('Failed to load manuscript:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [uploadedManuscript, pdfPageDataUrls.size, clearPdfPageData, setPdfPageDataUrl]);

  // -------------------------------------------------------------------------
  // Build unified book sequence
  // -------------------------------------------------------------------------
  useEffect(() => {
    const manuscriptPageCount = uploadedManuscript
      ? (uploadedManuscript.pageCount || pdfPageDataUrls.size || 0)
      : 0;

    const pages = buildBookSequence(
      bookType,
      coverDataUrl || undefined,
      manuscriptPageCount,
      pdfPageDataUrls,
      measurements,
    );

    setBookPages(pages);
  }, [bookType, coverDataUrl, uploadedManuscript, pdfPageDataUrls, measurements, setBookPages]);

  // Ensure current page is within bounds
  useEffect(() => {
    if (bookPages.length > 0 && currentPage >= bookPages.length) {
      setCurrentPage(0);
    }
  }, [bookPages.length, currentPage, setCurrentPage]);

  // -------------------------------------------------------------------------
  // Navigation
  // -------------------------------------------------------------------------
  const navigateTo = useCallback((index: number) => {
    if (index >= 0 && index < bookPages.length) {
      setCurrentPage(index);
    }
  }, [bookPages.length, setCurrentPage]);

  const goNext = useCallback(() => {
    if (previewViewMode === 'spread' && bookType !== 'kindle') {
      if (currentSpreadIdx >= 0 && currentSpreadIdx < spreads.length - 1) {
        const nextSpread = spreads[currentSpreadIdx + 1];
        if (nextSpread.leftPageIndex !== null) navigateTo(nextSpread.leftPageIndex);
      }
    } else {
      navigateTo(currentPage + 1);
    }
  }, [previewViewMode, bookType, currentPage, currentSpreadIdx, spreads, navigateTo]);

  const goPrev = useCallback(() => {
    if (previewViewMode === 'spread' && bookType !== 'kindle') {
      if (currentSpreadIdx > 0) {
        const prevSpread = spreads[currentSpreadIdx - 1];
        if (prevSpread.leftPageIndex !== null) navigateTo(prevSpread.leftPageIndex);
      }
    } else {
      navigateTo(currentPage - 1);
    }
  }, [previewViewMode, bookType, currentPage, currentSpreadIdx, spreads, navigateTo]);

  // -------------------------------------------------------------------------
  // Keyboard shortcuts
  // -------------------------------------------------------------------------
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (jumpModalOpen) return;
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case 'd':
        case 'D':
          e.preventDefault();
          goNext();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'a':
        case 'A':
          e.preventDefault();
          goPrev();
          break;
        case 'Home':
          e.preventDefault();
          navigateTo(0);
          break;
        case 'End':
          e.preventDefault();
          navigateTo(bookPages.length - 1);
          break;
        case '+':
        case '=':
          e.preventDefault();
          targetZoomRef.current = Math.min(ZOOM_MAX, targetZoomRef.current + ZOOM_STEP);
          setFitMode('custom');
          break;
        case '-':
        case '_':
          e.preventDefault();
          targetZoomRef.current = Math.max(ZOOM_MIN, targetZoomRef.current - ZOOM_STEP);
          setFitMode('custom');
          break;
        case '0':
          e.preventDefault();
          applyFitMode('fit-page');
          break;
        case '1':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            applyFitMode('actual');
          }
          break;
        case 'g':
        case 'G':
          e.preventDefault();
          if (activeOverlays.length > 0) {
            useAppStore.getState().setOverlays([]);
          } else {
            useAppStore.getState().setOverlays(allowedOverlaysForBookType(bookType));
          }
          break;
        case 'Escape':
          setSelectedIssueId(null);
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goNext, goPrev, navigateTo, bookPages.length, jumpModalOpen, applyFitMode, activeOverlays, bookType, setSelectedIssueId]);

  // -------------------------------------------------------------------------
  // Zoom: mouse wheel — zoom toward cursor position
  // -------------------------------------------------------------------------
  useEffect(() => {
    const el = canvasContainerRef.current;
    if (!el) return;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      const delta = -e.deltaY * ZOOM_WHEEL_SENSITIVITY;
      const oldZoom = targetZoomRef.current;
      const newZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, oldZoom * (1 + delta)));

      const rect = el.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const pageX = (mouseX - centerX - targetPanRef.current.x) / oldZoom;
      const pageY = (mouseY - centerY - targetPanRef.current.y) / oldZoom;

      targetPanRef.current.x = mouseX - centerX - pageX * newZoom;
      targetPanRef.current.y = mouseY - centerY - pageY * newZoom;

      targetZoomRef.current = newZoom;
      setFitMode('custom');
    };
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  // -------------------------------------------------------------------------
  // Zoom: toolbar buttons
  // -------------------------------------------------------------------------
  const zoomIn = useCallback(() => {
    targetZoomRef.current = Math.min(ZOOM_MAX, targetZoomRef.current + ZOOM_STEP);
    setFitMode('custom');
  }, []);

  const zoomOut = useCallback(() => {
    targetZoomRef.current = Math.max(ZOOM_MIN, targetZoomRef.current - ZOOM_STEP);
    setFitMode('custom');
  }, []);

  const zoomReset = useCallback(() => {
    targetPanRef.current = { x: 0, y: 0 };
    if (previewViewMode === 'spread' && bookType !== 'kindle') {
      applyFitMode('fit-spread');
    } else {
      applyFitMode('fit-page');
    }
  }, [applyFitMode, previewViewMode, bookType]);

  // Double-click zoom toggle
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    if (fitMode === 'actual' || currentZoomRef.current >= 0.95) {
      if (previewViewMode === 'spread' && bookType !== 'kindle') {
        applyFitMode('fit-spread');
      } else {
        applyFitMode('fit-page');
      }
    } else {
      const el = canvasContainerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const oldZoom = currentZoomRef.current;
      const newZoom = Math.min(ZOOM_MAX, oldZoom * 2);

      const pageX = (mouseX - centerX - targetPanRef.current.x) / oldZoom;
      const pageY = (mouseY - centerY - targetPanRef.current.y) / oldZoom;

      targetPanRef.current.x = mouseX - centerX - pageX * newZoom;
      targetPanRef.current.y = mouseY - centerY - pageY * newZoom;
      targetZoomRef.current = newZoom;
      setFitMode('custom');
    }
  }, [fitMode, applyFitMode, previewViewMode, bookType]);

  // -------------------------------------------------------------------------
  // Pan: mouse drag when zoomed
  // -------------------------------------------------------------------------
  useEffect(() => {
    const el = canvasContainerRef.current;
    if (!el) return;

    const fitZoom = fitZoomValues.page;
    const canPan = () => currentZoomRef.current > fitZoom + 0.05;

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      if (!canPan()) return;
      isPanningRef.current = true;
      panStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        panX: targetPanRef.current.x,
        panY: targetPanRef.current.y,
      };
      el.style.cursor = 'grabbing';
      e.preventDefault();
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isPanningRef.current) {
        if (canPan()) {
          el.style.cursor = 'grab';
        } else {
          el.style.cursor = 'default';
        }
        return;
      }
      const dx = e.clientX - panStartRef.current.x;
      const dy = e.clientY - panStartRef.current.y;
      targetPanRef.current = {
        x: panStartRef.current.panX + dx,
        y: panStartRef.current.panY + dy,
      };
    };

    const handleMouseUp = () => {
      if (isPanningRef.current) {
        isPanningRef.current = false;
        el.style.cursor = canPan() ? 'grab' : 'default';
      }
    };

    el.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      el.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [fitZoomValues]);

  // -------------------------------------------------------------------------
  // Compute current page display info
  // -------------------------------------------------------------------------
  const currentPageInfo = useMemo(() => {
    if (bookPages.length === 0) return { label: 'No pages', pageLabel: '', spreadLabel: '' };

    const page = bookPages[currentPage];
    if (!page) return { label: '', pageLabel: '', spreadLabel: '' };

    const pageLabel = page.section === 'full-cover' ? 'Full Cover' :
      page.section === 'blank' ? 'Blank Page' :
      `Page ${page.manuscriptIndex}`;

    if (previewViewMode === 'spread' && bookType !== 'kindle' && currentSpreadIdx >= 0) {
      const spread = spreads[currentSpreadIdx];
      return {
        label: spread?.label ?? pageLabel,
        pageLabel,
        spreadLabel: `Spread ${currentSpreadIdx + 1} / ${spreads.length}`,
      };
    }

    // For single mode, show manuscript page index if available
    const displayIndex = page.manuscriptIndex ?? (currentPage + 1);
    const totalPages = bookPages.filter(p => p.manuscriptIndex).length || bookPages.length;
    return {
      label: pageLabel,
      pageLabel,
      spreadLabel: `Page ${displayIndex} / ${totalPages}`,
    };
  }, [bookPages, currentPage, previewViewMode, bookType, currentSpreadIdx, spreads]);

  // -------------------------------------------------------------------------
  // Compute zoom percentage
  // -------------------------------------------------------------------------
  const zoomPct = Math.round(displayZoom * 100);

  // -------------------------------------------------------------------------
  // Allowed overlays
  // -------------------------------------------------------------------------
  const allowedOverlays = allowedOverlaysForBookType(bookType);

  // -------------------------------------------------------------------------
  // Compute page rendering dimensions
  // -------------------------------------------------------------------------
  const pageRenderInfo = useMemo(() => {
    if (bookPages.length === 0 || containerSize.w <= 0) {
      return { leftWidth: 0, leftHeight: 0, rightWidth: 0, rightHeight: 0 };
    }

    const page = bookPages[currentPage];
    if (!page) return { leftWidth: 0, leftHeight: 0, rightWidth: 0, rightHeight: 0 };

    const pxPerIn = 96;
    const isSpread = previewViewMode === 'spread' && bookType !== 'kindle';

    if (isSpread && currentSpreadIdx >= 0) {
      const spread = spreads[currentSpreadIdx];
      if (!spread) return { leftWidth: 0, leftHeight: 0, rightWidth: 0, rightHeight: 0 };

      const leftPage = spread.leftPageIndex !== null ? bookPages[spread.leftPageIndex] : null;
      const rightPage = spread.rightPageIndex !== null ? bookPages[spread.rightPageIndex] : null;

      const lw = (leftPage?.widthIn || measurements.trimWidthIn) * pxPerIn;
      const lh = (leftPage?.heightIn || measurements.trimHeightIn) * pxPerIn;
      const rw = rightPage ? (rightPage.widthIn || measurements.trimWidthIn) * pxPerIn : 0;
      const rh = rightPage ? (rightPage.heightIn || measurements.trimHeightIn) * pxPerIn : 0;

      return { leftWidth: lw, leftHeight: lh, rightWidth: rw, rightHeight: rh };
    }

    const pw = (page.widthIn || measurements.trimWidthIn) * pxPerIn;
    const ph = (page.heightIn || measurements.trimHeightIn) * pxPerIn;

    return { leftWidth: pw, leftHeight: ph, rightWidth: 0, rightHeight: 0 };
  }, [bookPages, currentPage, previewViewMode, bookType, currentSpreadIdx, spreads, measurements, containerSize]);

  // -------------------------------------------------------------------------
  // Compute highlight region for the selected issue
  // -------------------------------------------------------------------------
  const highlightForLeftPage = useMemo(() => {
    if (!selectedIssue?.region) return null;
    // Check if the issue's page matches the current left page
    const spread = spreads[currentSpreadIdx];
    if (!spread) return selectedIssue.region;
    const leftPage = spread.leftPageIndex !== null ? bookPages[spread.leftPageIndex] : null;
    if (leftPage?.manuscriptIndex === selectedIssue.page) return selectedIssue.region;
    return null;
  }, [selectedIssue, spreads, currentSpreadIdx, bookPages]);

  const highlightForRightPage = useMemo(() => {
    if (!selectedIssue?.region) return null;
    const spread = spreads[currentSpreadIdx];
    if (!spread) return null;
    const rightPage = spread.rightPageIndex !== null ? bookPages[spread.rightPageIndex] : null;
    if (rightPage?.manuscriptIndex === selectedIssue.page) return selectedIssue.region;
    return null;
  }, [selectedIssue, spreads, currentSpreadIdx, bookPages]);

  const highlightForSinglePage = useMemo(() => {
    if (!selectedIssue?.region) return null;
    const page = bookPages[currentPage];
    if (page?.manuscriptIndex === selectedIssue.page) return selectedIssue.region;
    return null;
  }, [selectedIssue, bookPages, currentPage]);

  // -------------------------------------------------------------------------
  // Issue summary for status bar
  // -------------------------------------------------------------------------
  const issueSummary = useMemo(() => {
    const c = { fail: 0, risk: 0, warning: 0 };
    for (const iss of pageIssuesExtended) {
      if (iss.severity === 'fail') c.fail++;
      else if (iss.severity === 'risk') c.risk++;
      else if (iss.severity === 'warning') c.warning++;
    }
    return c;
  }, [pageIssuesExtended]);

  // -------------------------------------------------------------------------
  // Handle issue selection
  // -------------------------------------------------------------------------
  const handleIssueSelect = useCallback((id: string) => {
    setSelectedIssueId(id === selectedIssueId ? null : id);
  }, [selectedIssueId, setSelectedIssueId]);

  // -------------------------------------------------------------------------
  // Onboarding hint dismiss
  // -------------------------------------------------------------------------
  const handleDismissHint = useCallback((hintId: string) => {
    dismissHint(hintId);
  }, [dismissHint]);

  // Show scan summary bar once when previewReady first becomes true
  useEffect(() => {
    if (previewReady && bookPages.length > 0) {
      setShowSummaryBar(true);
    }
  }, [previewReady, bookPages.length]);

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  const isProcessingNow = !previewReady && processingStatus !== 'idle' && processingStatus !== 'error';
  const isSpreadView = previewViewMode === 'spread' && bookType !== 'kindle';

  return (
    <div className="ds-page-stage fixed inset-0 z-[60] flex flex-col overflow-hidden">
      {/* ================================================================== */}
      {/* PRIMARY TOOLBAR (top, ~52px) — Breadcrumb + Mode + Navigation      */}
      {/* LEFT: Import → Configure → Review breadcrumb                       */}
      {/* CENTER: 📄 Single View | 📖 Spread View                           */}
      {/* RIGHT: ◀ Previous | Page X / Y | Next ▶                          */}
      {/* ================================================================== */}
      <div className="flex min-h-[52px] shrink-0 flex-wrap items-center justify-between gap-2 border-b border-border bg-surface-glass px-2 py-2 shadow-soft backdrop-blur-xl sm:h-[52px] sm:flex-nowrap sm:px-3 sm:py-0">
        {/* LEFT: Breadcrumb — Import → Configure → Review */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCheckerStep('import')}
            className="flex items-center gap-1 px-2 py-1.5 rounded-md text-[11px] font-medium text-foreground/65 dark:text-foreground/25 hover:text-foreground/90 dark:text-foreground/75 dark:text-foreground/45 hover:bg-foreground/[0.18] dark:bg-foreground/[0.10] dark:bg-foreground/[0.04] transition-all duration-200"
            title="Back to Import"
          >
            <Upload className="w-3 h-3" />
            <span className="hidden sm:inline">Import</span>
          </button>
          <ChevronRight className="w-3 h-3 text-foreground/80 dark:text-foreground/50 dark:text-foreground/10" />
          <button
            onClick={() => setCheckerStep('config')}
            className="flex items-center gap-1 px-2 py-1.5 rounded-md text-[11px] font-medium text-foreground/65 dark:text-foreground/25 hover:text-foreground/90 dark:text-foreground/75 dark:text-foreground/45 hover:bg-foreground/[0.18] dark:bg-foreground/[0.10] dark:bg-foreground/[0.04] transition-all duration-200"
            title="Back to Configure"
          >
            <Settings className="w-3 h-3" />
            <span className="hidden sm:inline">Configure</span>
          </button>
          <ChevronRight className="w-3 h-3 text-success/40" />
          <span className="flex items-center gap-1 px-2 py-1.5 rounded-md text-[11px] font-semibold text-success bg-success/10 border border-success/20">
            <BookOpen className="w-3 h-3" />
            <span className="hidden sm:inline">Review</span>
          </span>
        </div>

        {/* CENTER: MODE SWITCHER — Most prominent control */}
        <div className="order-3 flex w-full items-center justify-center gap-3 sm:order-none sm:w-auto">
          <div className="flex items-center rounded-xl border border-foreground/[0.25] bg-foreground/[0.13] p-1 shadow-lg shadow-black/20 dark:bg-foreground/[0.06] sm:p-1.5">
            <button
              onClick={() => bookType !== 'kindle' && setPreviewViewMode('single')}
              disabled={bookType === 'kindle'}
              className={`flex min-h-[34px] items-center gap-2 rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-all duration-250 sm:min-h-[38px] sm:px-5 sm:py-2 sm:text-[14px] ${
                previewViewMode === 'single'
                  ? 'bg-success/30 text-success shadow-md shadow-success/10 border border-success/50 ring-1 ring-success/20'
                  : 'text-foreground/85 dark:text-foreground/70 dark:text-foreground/35 hover:text-foreground/55 hover:bg-foreground/[0.13] dark:bg-foreground/[0.06]'
              }`}
              aria-label="Single Page View"
              aria-pressed={previewViewMode === 'single'}
            >
              <span>Single View</span>
            </button>
            <button
              onClick={() => bookType !== 'kindle' && setPreviewViewMode('spread')}
              disabled={bookType === 'kindle'}
              className={`flex min-h-[34px] items-center gap-2 rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-all duration-250 sm:min-h-[38px] sm:px-5 sm:py-2 sm:text-[14px] ${
                previewViewMode === 'spread'
                  ? 'bg-success/30 text-success shadow-md shadow-success/10 border border-success/50 ring-1 ring-success/20'
                  : bookType === 'kindle'
                    ? 'text-foreground/80 dark:text-foreground/50 dark:text-foreground/10 cursor-not-allowed'
                    : 'text-foreground/85 dark:text-foreground/70 dark:text-foreground/35 hover:text-foreground/55 hover:bg-foreground/[0.13] dark:bg-foreground/[0.06]'
              }`}
              aria-label="Spread View"
              aria-pressed={previewViewMode === 'spread'}
            >
              <span>Spread View</span>
            </button>
          </div>

          {/* Onboarding hint: mode switcher */}
          <AnimatePresence>
            {!isHintDismissed('hint-mode-switcher') && bookType !== 'kindle' && (
              <OnboardingHint id="hint-mode-switcher" onDismiss={handleDismissHint}>
                Use Spread View to inspect book layout
              </OnboardingHint>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT: ◀ Previous | Page position | Next ▶ */}
        <div className="flex items-center gap-1">
          <button
            onClick={goPrev}
            disabled={currentPage <= 0 && currentSpreadIdx <= 0}
            className="flex items-center gap-1 px-3 py-2 rounded-lg text-[12px] font-medium text-foreground/90 dark:text-foreground/75 dark:text-foreground/40 hover:text-foreground/85 dark:text-foreground/70 hover:bg-foreground/[0.13] dark:bg-foreground/[0.06] transition-all duration-200 min-h-[36px] disabled:opacity-15 disabled:cursor-not-allowed border border-transparent hover:border-foreground/[0.22] dark:border-foreground/[0.08]"
            title="Previous (← / A)"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Previous</span>
          </button>

          <button
            onClick={() => setJumpModalOpen(true)}
            className="min-w-[72px] rounded-lg border border-foreground/[0.18] px-2 py-1.5 text-center text-[12px] font-medium text-foreground/80 transition-colors hover:border-foreground/[0.25] hover:bg-foreground/[0.13] hover:text-foreground/90 dark:border-foreground/[0.06] dark:bg-foreground/[0.06] dark:text-foreground/50 dark:hover:border-foreground/[0.12] dark:hover:text-foreground/75 sm:min-w-[110px] sm:px-3"
            title="Click to jump to page"
          >
            {currentPageInfo.spreadLabel}
          </button>

          <button
            onClick={goNext}
            disabled={
              previewViewMode === 'spread'
                ? currentSpreadIdx >= spreads.length - 1
                : currentPage >= bookPages.length - 1
            }
            className="flex items-center gap-1 px-3 py-2 rounded-lg text-[12px] font-medium text-foreground/90 dark:text-foreground/75 dark:text-foreground/40 hover:text-foreground/85 dark:text-foreground/70 hover:bg-foreground/[0.13] dark:bg-foreground/[0.06] transition-all duration-200 min-h-[36px] disabled:opacity-15 disabled:cursor-not-allowed border border-transparent hover:border-foreground/[0.22] dark:border-foreground/[0.08]"
            title="Next (→ / D)"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Save status */}
          <SaveStatusIndicator status={saveStatus} />
        </div>
      </div>

      {/* ================================================================== */}
      {/* SECONDARY TOOLBAR — Overlays + Zoom Controls                       */}
      {/* ================================================================== */}
      <div className="flex h-9 shrink-0 items-center justify-between gap-3 overflow-x-auto border-b border-foreground/25 bg-background/80 px-3 backdrop-blur-xl dark:border-foreground/10">
        {/* Left: Overlay toggles */}
        <div className="flex items-center gap-1">
          {allowedOverlays.length > 0 && (
            <div className="flex items-center gap-0.5">
              {allowedOverlays.map((ov) => {
                const cfg = OVERLAY_CONFIG[ov];
                const isActive = activeOverlays.includes(ov);
                return (
                  <button
                    key={ov}
                    onClick={() => toggleOverlay(ov)}
                    className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-all duration-200 ${
                      isActive
                        ? `${cfg.bg} ${cfg.color} border ${cfg.border}`
                        : 'text-foreground/85 dark:text-foreground/60 dark:text-foreground/20 hover:text-foreground/35'
                    }`}
                    title={cfg.label}
                  >
                    {isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    <span className="hidden lg:inline">{cfg.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Zoom controls */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={zoomOut}
            className="p-1 rounded-md text-foreground/65 dark:text-foreground/30 hover:text-foreground/55 hover:bg-foreground/[0.18] dark:bg-foreground/[0.10] dark:bg-foreground/[0.04] transition-colors"
            title="Zoom Out (-)"
          >
            <Minus className="w-3 h-3" />
          </button>
          <button
            onClick={() => setJumpModalOpen(true)}
            className="px-2 py-0.5 rounded-md text-[10px] text-foreground/85 dark:text-foreground/70 dark:text-foreground/35 hover:text-foreground/55 hover:bg-foreground/[0.18] dark:bg-foreground/[0.10] dark:bg-foreground/[0.04] transition-colors min-w-[44px] text-center font-mono"
            title="Click to jump to page"
          >
            {zoomPct}%
          </button>
          <button
            onClick={zoomIn}
            className="p-1 rounded-md text-foreground/65 dark:text-foreground/30 hover:text-foreground/55 hover:bg-foreground/[0.18] dark:bg-foreground/[0.10] dark:bg-foreground/[0.04] transition-colors"
            title="Zoom In (+)"
          >
            <Plus className="w-3 h-3" />
          </button>

          <div className="w-px h-4 bg-foreground/[0.13] dark:bg-foreground/[0.06] mx-0.5" />

          <FitDropdown fitMode={fitMode} onFitSelect={applyFitMode} />
        </div>
      </div>

      {/* ================================================================== */}
      {/* MAIN AREA: Left Sidebar (~18%) + Center Canvas (~57%) + Right (~25%) */}
      {/* ================================================================== */}
      <div className="flex-1 flex min-h-0">
        {/* LEFT: Thumbnail Sidebar */}
        <div className="hidden md:contents">
          <ThumbnailSidebar
            bookPages={bookPages}
            currentIndex={currentPage}
            viewMode={previewViewMode}
            pageIssues={pageIssuesExtended}
            onPageSelect={navigateTo}
            spreads={spreads}
            currentSpreadIdx={currentSpreadIdx}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </div>

        {/* Onboarding hint: sidebar */}
        {!sidebarCollapsed && !isHintDismissed('hint-sidebar') && (
          <div className="absolute left-[170px] top-14 z-30 hidden md:block">
            <OnboardingHint id="hint-sidebar" onDismiss={handleDismissHint}>
              Click a page to preview it
            </OnboardingHint>
          </div>
        )}

        {/* CENTER: Preview canvas area — dark workspace */}
        <div
          ref={canvasContainerRef}
          className="ds-page-stage relative flex min-w-0 flex-1 items-center justify-center overflow-hidden"
          onDoubleClick={handleDoubleClick}
          style={{ cursor: 'default' }}
        >
          {/* Scan summary bar — fades in when scan completes */}
          <AnimatePresence>
            {showSummaryBar && previewReady && bookPages.length > 0 && (
              <ScanSummaryBar
                summary={issueSummary}
                pageCount={bookPages.filter(p => p.manuscriptIndex).length || bookPages.length}
                onDismiss={() => setShowSummaryBar(false)}
              />
            )}
          </AnimatePresence>

          {/* Onboarding hint: zoom */}
          <AnimatePresence>
            {!isHintDismissed('hint-canvas-zoom') && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30">
                <OnboardingHint id="hint-canvas-zoom" onDismiss={handleDismissHint}>
                  Scroll mouse wheel to zoom
                </OnboardingHint>
              </div>
            )}
          </AnimatePresence>

          {loading || isProcessingNow ? (
            <ScanProgressOverlay status={isProcessingNow ? processingStatus : 'rendering'} />
          ) : bookPages.length === 0 ? (
            <div className="flex flex-col items-center gap-3 text-foreground/55 dark:text-foreground/15">
              <BookOpen className="w-12 h-12" />
              <span className="text-sm">No pages to preview</span>
              <span className="text-xs text-foreground/8">Upload a manuscript to begin</span>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={`${currentPage}-${previewViewMode}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="flex items-center justify-center"
                style={{
                  gap: isSpreadView ? '6px' : '0px',
                  transform: `scale(${displayZoom}) translate(${displayPan.x / displayZoom}px, ${displayPan.y / displayZoom}px)`,
                  transformOrigin: 'center center',
                }}
              >
                {/* Render current page(s) */}
                {isSpreadView && currentSpreadIdx >= 0 ? (
                  (() => {
                    const spread = spreads[currentSpreadIdx];
                    if (!spread) return null;
                    const leftPage = spread.leftPageIndex !== null ? bookPages[spread.leftPageIndex] : null;
                    const rightPage = spread.rightPageIndex !== null ? bookPages[spread.rightPageIndex] : null;

                    return (
                      <>
                        {leftPage && (
                          <PageRenderer
                            page={leftPage}
                            width={pageRenderInfo.leftWidth}
                            height={pageRenderInfo.leftHeight}
                            activeOverlays={activeOverlays}
                            measurements={measurements}
                            isLeftPage
                            bookType={bookType}
                            highlightRegion={highlightForLeftPage}
                            highlightSeverity={selectedIssue?.severity}
                            focusMode={!!selectedIssueId && !!selectedIssue?.region}
                          />
                        )}
                        {rightPage && (
                          <PageRenderer
                            page={rightPage}
                            width={pageRenderInfo.rightWidth}
                            height={pageRenderInfo.rightHeight}
                            activeOverlays={activeOverlays}
                            measurements={measurements}
                            isLeftPage={false}
                            bookType={bookType}
                            highlightRegion={highlightForRightPage}
                            highlightSeverity={selectedIssue?.severity}
                            focusMode={!!selectedIssueId && !!selectedIssue?.region}
                          />
                        )}
                      </>
                    );
                  })()
                ) : (
                  <PageRenderer
                    page={bookPages[currentPage]}
                    width={pageRenderInfo.leftWidth}
                    height={pageRenderInfo.leftHeight}
                    activeOverlays={activeOverlays}
                    measurements={measurements}
                    bookType={bookType}
                    highlightRegion={highlightForSinglePage}
                    highlightSeverity={selectedIssue?.severity}
                    focusMode={!!selectedIssueId && !!selectedIssue?.region}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        {/* RIGHT: Validation Panel (~25%) */}
        <div className="hidden min-h-0 w-[25%] min-w-[280px] max-w-[380px] shrink-0 flex-col border-l border-border bg-surface-glass shadow-elevated backdrop-blur-xl lg:flex">
          <ValidationPanel
            bookType={bookType}
            bookConfig={bookConfig}
            measurements={measurements}
            pageIssuesExtended={pageIssuesExtended}
            validationSummary={validationSummary}
            selectedIssueId={selectedIssueId}
            onSelectIssue={handleIssueSelect}
            onJumpToPage={navigateTo}
            bookPages={bookPages}
            issueFilter={issueFilter}
            setIssueFilter={setIssueFilter}
            currentSpreadIdx={currentSpreadIdx}
            spreads={spreads}
            viewMode={previewViewMode}
          />

          {/* Onboarding hint: issue panel */}
          <AnimatePresence>
            {!isHintDismissed('hint-issue-click') && pageIssuesExtended.length > 0 && (
              <div className="absolute bottom-10 right-[25%] z-30">
                <OnboardingHint id="hint-issue-click" onDismiss={handleDismissHint}>
                  Click an issue to highlight it on the page
                </OnboardingHint>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ================================================================== */}
      {/* STATUS BAR (bottom, ~28px)                                         */}
      {/* ================================================================== */}
      <div className="flex h-7 shrink-0 items-center justify-between gap-4 overflow-x-auto border-t border-foreground/25 bg-background/95 px-3 dark:border-foreground/10">
        {/* Left: Page info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-1.5 shrink-0">
            {bookType === 'kindle' && <Monitor className="w-3 h-3 text-foreground/55 dark:text-foreground/15" />}
            {bookType === 'paperback' && <BookOpen className="w-3 h-3 text-foreground/55 dark:text-foreground/15" />}
            {bookType === 'hardcover' && <Box className="w-3 h-3 text-foreground/55 dark:text-foreground/15" />}
            <span className="text-[10px] text-foreground/85 dark:text-foreground/60 dark:text-foreground/20 font-medium uppercase">{bookType}</span>
          </div>

          <span className="text-[10px] text-foreground/55 dark:text-foreground/15">
            {currentPageInfo.pageLabel}
            {isSpreadView && currentSpreadIdx >= 0 && (
              <> &middot; Spread {currentSpreadIdx + 1}</>
            )}
          </span>
        </div>

        {/* Center: View mode + Zoom */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-foreground/55 dark:text-foreground/15">
            {previewViewMode === 'spread' ? 'Spread' : 'Single'}
          </span>
          <span className="text-[10px] text-foreground/85 dark:text-foreground/60 dark:text-foreground/20 font-mono">{zoomPct}%</span>
        </div>

        {/* Right: Issue summary + Ready status */}
        <div className="flex items-center gap-3 shrink-0">
          {pageIssuesExtended.length > 0 ? (
            <div className="flex items-center gap-1.5">
              {issueSummary.fail > 0 && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-danger/10 text-danger/70 font-medium">{issueSummary.fail} fail</span>
              )}
              {issueSummary.risk > 0 && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-warning/10 text-warning/70 font-medium">{issueSummary.risk} risk</span>
              )}
              {issueSummary.warning > 0 && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-warning/10 text-warning/70 font-medium">{issueSummary.warning} warn</span>
              )}
            </div>
          ) : (
            previewReady && (
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-success/50" />
                <span className="text-[9px] text-success/40">Safe for KDP</span>
              </div>
            )
          )}
          {processingStatus === 'error' && (
            <div className="flex items-center gap-1">
              <AlertCircle className="w-3 h-3 text-danger/60" />
              <span className="text-[9px] text-danger/40">Error</span>
            </div>
          )}
          <span className="text-[10px] text-foreground/80 dark:text-foreground/50 dark:text-foreground/10">{bookPages.length} pages</span>
        </div>
      </div>

      {/* ================================================================== */}
      {/* MODALS                                                              */}
      {/* ================================================================== */}
      <JumpToPageModal
        open={jumpModalOpen}
        bookPages={bookPages}
        onJump={navigateTo}
        onClose={() => setJumpModalOpen(false)}
      />

      {/* Session restore dialog */}
      <AnimatePresence>
        {showRestoreDialog && restoreWorkspace && (
          <SessionRestoreDialog
            savedWorkspace={restoreWorkspace}
            onRestore={handleRestore}
            onDiscard={handleDiscardRestore}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
