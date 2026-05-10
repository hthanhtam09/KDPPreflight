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
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
} from '@/types/kdp';
import { computeValidationSummary } from '@/engine/validator';
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
  bleed: { label: 'Bleed', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/40', svgStroke: 'rgba(239,68,68,0.35)', svgFill: 'rgba(239,68,68,0.03)' },
  trim: { label: 'Trim', color: 'text-white/60', bg: 'bg-white/5', border: 'border-white/30', svgStroke: 'rgba(255,255,255,0.25)', svgFill: 'rgba(255,255,255,0.01)' },
  'safe-area': { label: 'Safe Area', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', svgStroke: 'rgba(52,211,153,0.35)', svgFill: 'rgba(52,211,153,0.03)' },
  gutter: { label: 'Gutter', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', svgStroke: 'rgba(234,179,8,0.3)', svgFill: 'rgba(234,179,8,0.04)' },
  hinge: { label: 'Hinge', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', svgStroke: 'rgba(249,115,22,0.3)', svgFill: 'rgba(249,115,22,0.04)' },
  crop: { label: 'Crop Risk', color: 'text-red-300', bg: 'bg-red-500/15', border: 'border-red-400/30', svgStroke: 'rgba(239,68,68,0.2)', svgFill: 'rgba(239,68,68,0.02)' },
  spine: { label: 'Spine', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30', svgStroke: 'rgba(168,85,247,0.3)', svgFill: 'rgba(168,85,247,0.03)' },
  barcode: { label: 'Barcode', color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/30', svgStroke: 'rgba(156,163,175,0.3)', svgFill: 'rgba(156,163,175,0.03)' },
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
      <rect key="focus-top" x={0} y={0} width={width} height={Math.max(0, hy - pad)} fill="rgba(0,0,0,0.4)" />,
    );
    // Bottom rectangle
    elements.push(
      <rect key="focus-bottom" x={0} y={hy + hh + pad} width={width} height={Math.max(0, height - (hy + hh + pad))} fill="rgba(0,0,0,0.4)" />,
    );
    // Left rectangle
    elements.push(
      <rect key="focus-left" x={0} y={Math.max(0, hy - pad)} width={Math.max(0, hx - pad)} height={hh + pad * 2} fill="rgba(0,0,0,0.4)" />,
    );
    // Right rectangle
    elements.push(
      <rect key="focus-right" x={hx + hw + pad} y={Math.max(0, hy - pad)} width={Math.max(0, width - (hx + hw + pad))} height={hh + pad * 2} fill="rgba(0,0,0,0.4)" />,
    );
  }

  overlays.forEach((ov) => {
    switch (ov) {
      case 'bleed':
        elements.push(
          <rect key={ov} x={-bleedPx} y={-bleedPx} width={width + bleedPx * 2} height={height + bleedPx * 2}
            fill="rgba(239,68,68,0.02)" stroke="rgba(239,68,68,0.3)" strokeWidth={0.75} strokeDasharray="8 4" />,
        );
        break;
      case 'trim':
        if (isCoverPage && coverWidthIn && trimWidthIn) {
          const wrapPx = 0.0625 * pxPerIn;
          const spinePx = (coverWidthIn - 2 * trimWidthIn - 2 * measurements.bleedIn - 2 * wrapPx) * pxPerIn;
          const bleedOff = measurements.bleedIn * pxPerIn;
          elements.push(<rect key={`${ov}-back`} x={bleedOff} y={bleedOff} width={trimWidthIn * pxPerIn} height={height - bleedOff * 2} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={0.75} strokeDasharray="6 4" />);
          elements.push(<rect key={`${ov}-front`} x={width - bleedOff - trimWidthIn * pxPerIn} y={bleedOff} width={trimWidthIn * pxPerIn} height={height - bleedOff * 2} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={0.75} strokeDasharray="6 4" />);
          const spineStart = bleedOff + trimWidthIn * pxPerIn + wrapPx;
          elements.push(<line key={`${ov}-spine-l`} x1={spineStart} y1={0} x2={spineStart} y2={height} stroke="rgba(168,85,247,0.25)" strokeWidth={0.75} strokeDasharray="6 3" />);
          elements.push(<line key={`${ov}-spine-r`} x1={spineStart + spinePx} y1={0} x2={spineStart + spinePx} y2={height} stroke="rgba(168,85,247,0.25)" strokeWidth={0.75} strokeDasharray="6 3" />);
        } else {
          elements.push(
            <rect key={ov} x={0} y={0} width={width} height={height} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={0.75} strokeDasharray="6 4" />,
          );
        }
        break;
      case 'safe-area':
        if (isCoverPage && coverWidthIn && trimWidthIn) {
          const bleedOff = measurements.bleedIn * pxPerIn;
          elements.push(<rect key={`${ov}-back`} x={bleedOff + safePx} y={bleedOff + safePx} width={trimWidthIn * pxPerIn - safePx * 2} height={height - bleedOff * 2 - safePx * 2} fill="rgba(52,211,153,0.03)" stroke="rgba(52,211,153,0.3)" strokeWidth={0.75} strokeDasharray="8 4" />);
          elements.push(<rect key={`${ov}-front`} x={width - bleedOff - trimWidthIn * pxPerIn + safePx} y={bleedOff + safePx} width={trimWidthIn * pxPerIn - safePx * 2} height={height - bleedOff * 2 - safePx * 2} fill="rgba(52,211,153,0.03)" stroke="rgba(52,211,153,0.3)" strokeWidth={0.75} strokeDasharray="8 4" />);
        } else {
          elements.push(
            <rect key={ov} x={safePx} y={safePx} width={width - safePx * 2} height={height - safePx * 2} fill="rgba(52,211,153,0.03)" stroke="rgba(52,211,153,0.3)" strokeWidth={0.75} strokeDasharray="8 4" />,
          );
        }
        break;
      case 'gutter':
        if (isLeftPage) {
          elements.push(<rect key={ov} x={0} y={0} width={gutterPx} height={height} fill="rgba(234,179,8,0.04)" stroke="rgba(234,179,8,0.25)" strokeWidth={0.75} strokeDasharray="6 3" />);
        } else {
          elements.push(<rect key={ov} x={width - gutterPx} y={0} width={gutterPx} height={height} fill="rgba(234,179,8,0.04)" stroke="rgba(234,179,8,0.25)" strokeWidth={0.75} strokeDasharray="6 3" />);
        }
        break;
      case 'hinge':
        if (isCoverPage && coverWidthIn && trimWidthIn) {
          const bleedOff = measurements.bleedIn * pxPerIn;
          elements.push(<rect key={`${ov}-front`} x={width - bleedOff - trimWidthIn * pxPerIn} y={bleedOff} width={hingePx} height={height - bleedOff * 2} fill="rgba(249,115,22,0.04)" stroke="rgba(249,115,22,0.25)" strokeWidth={0.75} strokeDasharray="8 4" />);
          elements.push(<rect key={`${ov}-back`} x={bleedOff + trimWidthIn * pxPerIn - hingePx} y={bleedOff} width={hingePx} height={height - bleedOff * 2} fill="rgba(249,115,22,0.04)" stroke="rgba(249,115,22,0.25)" strokeWidth={0.75} strokeDasharray="8 4" />);
        } else if (isLeftPage) {
          elements.push(<rect key={ov} x={0} y={0} width={hingePx} height={height} fill="rgba(249,115,22,0.04)" stroke="rgba(249,115,22,0.25)" strokeWidth={0.75} strokeDasharray="8 4" />);
        } else {
          elements.push(<rect key={ov} x={width - hingePx} y={0} width={hingePx} height={height} fill="rgba(249,115,22,0.04)" stroke="rgba(249,115,22,0.25)" strokeWidth={0.75} strokeDasharray="8 4" />);
        }
        break;
      case 'crop': {
        const cropPx = 0.0625 * pxPerIn;
        elements.push(<rect key={ov} x={cropPx} y={cropPx} width={width - cropPx * 2} height={height - cropPx * 2} fill="rgba(239,68,68,0.02)" stroke="rgba(239,68,68,0.15)" strokeWidth={0.75} strokeDasharray="4 4" />);
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

    const glowColor = highlightSeverity === 'fail' ? 'rgba(239,68,68,0.15)' :
      highlightSeverity === 'risk' ? 'rgba(249,115,22,0.12)' :
      highlightSeverity === 'warning' ? 'rgba(234,179,8,0.10)' : 'rgba(52,211,153,0.08)';
    const strokeColor = highlightSeverity === 'fail' ? 'rgba(239,68,68,0.6)' :
      highlightSeverity === 'risk' ? 'rgba(249,115,22,0.5)' :
      highlightSeverity === 'warning' ? 'rgba(234,179,8,0.4)' : 'rgba(52,211,153,0.3)';

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
        className="w-full h-full bg-white overflow-hidden relative"
        style={{
          boxShadow: '0 4px 24px rgba(0,0,0,0.5), 0 1px 3px rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '1px',
        }}
      >
        {page.isBlank ? (
          <div className="w-full h-full bg-white flex flex-col items-center justify-center">
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
          <div className="w-full h-full flex flex-col items-center justify-center text-white/10">
            <FileText className="w-12 h-12 mb-2" />
            <span className="text-xs">{page.label}</span>
            {isCoverPage && <span className="text-[10px] text-white/5 mt-1">Upload cover to preview</span>}
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
          style={{ background: 'linear-gradient(to right, transparent, rgba(0,0,0,0.25))' }}
        />
      )}
      {!isLeftPage && page.section !== 'full-cover' && !page.isBlank && (
        <div className="absolute top-0 left-0 w-4 h-full pointer-events-none z-20"
          style={{ background: 'linear-gradient(to left, transparent, rgba(0,0,0,0.25))' }}
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
    severity === 'fail' ? 'bg-red-500' :
    severity === 'risk' ? 'bg-orange-500' :
    severity === 'warning' ? 'bg-amber-500' : 'bg-green-500';
  const dim = size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2';
  return <div className={`rounded-full ${color} ${dim}`} />;
}

function SingleThumb({ page, small }: { page: BookPage; small?: boolean }) {
  if (page.isBlank) {
    return (
      <div className="w-full h-full bg-white/80 flex items-center justify-center">
        <span className={`text-gray-300 font-medium ${small ? 'text-[4px]' : 'text-[7px]'}`}>
          {page.section === 'blank' ? 'Blank' : page.label}
        </span>
      </div>
    );
  }
  if (page.dataUrl) {
    return <img src={page.dataUrl} alt={page.label} className="w-full h-full object-contain" />;
  }
  return <FileText className={`${small ? 'w-3 h-3' : 'w-4 h-4'} text-white/10`} />;
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
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/[0.08] text-[10px] text-white/40"
    >
      <span>{children}</span>
      <button
        onClick={() => onDismiss(id)}
        className="shrink-0 p-0.5 rounded hover:bg-white/[0.08] transition-colors"
        aria-label="Dismiss hint"
      >
        <X className="w-2.5 h-2.5 text-white/25" />
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
          <Loader2 className="w-3 h-3 text-white/20 animate-spin" />
          <span className="text-[10px] text-white/30">Saving...</span>
        </>
      )}
      {status === 'saved' && (
        <>
          <CheckCircle2 className="w-3 h-3 text-emerald-400/40" />
          <span className="text-[10px] text-emerald-400/50">Saved</span>
        </>
      )}
      {status === 'error' && (
        <>
          <AlertCircle className="w-3 h-3 text-red-400/40" />
          <span className="text-[10px] text-red-400/50">Save failed</span>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#1e1f22] border border-white/[0.08] rounded-xl p-6 w-[380px] shadow-2xl"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <RotateCcw className="w-5 h-5 text-emerald-400/60" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white/80">Restore previous session?</h3>
            <p className="text-[11px] text-white/25 mt-0.5">Last saved: {timeAgo}</p>
          </div>
        </div>

        <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-white/20" />
            <span className="text-[11px] text-white/40 font-medium">
              {savedWorkspace.coverFileName || savedWorkspace.manuscriptFileName || 'Book session'}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-[10px] text-white/20">
              {savedWorkspace.bookPages.length} pages
            </span>
            <span className="text-[10px] text-white/20">
              {savedWorkspace.bookType}
            </span>
            <span className="text-[10px] text-white/20">
              {savedWorkspace.previewViewMode} view
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onDiscard}
            className="flex-1 px-4 py-2.5 rounded-lg text-[12px] font-medium text-white/40 bg-white/[0.04] hover:bg-white/[0.06] hover:text-white/50 transition-colors border border-white/[0.06]"
          >
            Start New
          </button>
          <button
            onClick={onRestore}
            className="flex-1 px-4 py-2.5 rounded-lg text-[12px] font-medium text-emerald-400 bg-emerald-500/15 hover:bg-emerald-500/20 transition-colors border border-emerald-500/20"
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
      <div className="w-10 shrink-0 border-r border-white/[0.06] bg-[#1a1b1e] flex flex-col items-center pt-2">
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-white/25 hover:text-white/50 hover:bg-white/[0.04] transition-colors"
          title="Expand sidebar"
        >
          <PanelLeftOpen className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-[170px] min-w-[120px] max-w-[190px] shrink-0 border-r border-white/[0.06] bg-[#1a1b1e] flex flex-col">
      {/* Header */}
      <div className="shrink-0 px-3 py-2 border-b border-white/[0.06] flex items-center justify-between">
        <span className="text-[10px] font-semibold text-white/25 uppercase tracking-wider">Pages</span>
        <button
          onClick={onToggleCollapse}
          className="p-1 rounded-md text-white/20 hover:text-white/40 hover:bg-white/[0.04] transition-colors"
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
                    ? 'border-emerald-400/60 ring-2 ring-emerald-500/25 bg-emerald-500/[0.03]'
                    : 'border-white/[0.06] hover:border-white/[0.12]'
                }`}
              >
                {/* Preview image — aspect-ratio aware, no cropping */}
                <div className="relative bg-white/[0.03] flex items-center justify-center p-1" style={{ aspectRatio: spread.isSingle ? '2/3' : '4/3' }}>
                  {spread.isSingle ? (
                    leftPage ? <SingleThumb page={leftPage} /> : null
                  ) : (
                    <div className="flex w-full h-full gap-px">
                      <div className="flex-1 overflow-hidden flex items-center justify-center">
                        {leftPage ? <SingleThumb page={leftPage} small /> : null}
                      </div>
                      <div className="w-px bg-[#2a2b2e] self-stretch" />
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
                <div className="px-2 py-1.5 bg-white/[0.02]">
                  <div className="flex items-center justify-between gap-1">
                    <span className={`text-[9px] font-medium leading-tight truncate ${isActive ? 'text-emerald-400' : 'text-white/35'}`}>
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
                      worstIssue === 'fail' ? 'text-red-400/50' :
                      worstIssue === 'risk' ? 'text-orange-400/50' :
                      'text-white/15'
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
                    ? 'border-emerald-400/60 ring-2 ring-emerald-500/25 bg-emerald-500/[0.03]'
                    : 'border-white/[0.06] hover:border-white/[0.12]'
                }`}
              >
                {/* Preview image — aspect-ratio aware, no cropping */}
                <div className="relative bg-white/[0.03] flex items-center justify-center p-1" style={{ aspectRatio: page.isCoverPage ? '3/2' : '2/3' }}>
                  <SingleThumb page={page} />
                  {worstIssue && worstIssue !== 'pass' && worstIssue !== 'safe' && (
                    <div className="absolute top-1 right-1">
                      <IssueDot severity={worstIssue} size="md" />
                    </div>
                  )}
                </div>

                {/* Label + issue badge */}
                <div className="px-2 py-1.5 bg-white/[0.02]">
                  <div className="flex items-center justify-between gap-1">
                    <span className={`text-[9px] font-medium truncate ${isActive ? 'text-emerald-400' : 'text-white/30'}`}>
                      {page.section === 'full-cover' ? 'Cover' : page.section === 'blank' ? 'Blank' : page.label}
                    </span>
                    {worstIssue && worstIssue !== 'pass' && worstIssue !== 'safe' && (
                      <IssueDot severity={worstIssue} />
                    )}
                  </div>
                  {issueCount > 0 && (
                    <span className={`text-[8px] mt-0.5 block font-medium ${
                      worstIssue === 'fail' ? 'text-red-400/50' :
                      worstIssue === 'risk' ? 'text-orange-400/50' :
                      'text-white/15'
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
  margin: { problemPrefix: 'Content is too close to the edge.', whyItMatters: 'Printed books may cut off content near edges.', fixHint: 'Move content slightly inward from the edge.', icon: Ruler },
  bleed: { problemPrefix: 'Content extends beyond the bleed area.', whyItMatters: 'Parts of your design may be trimmed unexpectedly during printing.', fixHint: 'Extend background images to the bleed edge, but keep text inside the safe area.', icon: AlertTriangle },
  dpi: { problemPrefix: 'Image resolution is too low.', whyItMatters: 'Low resolution images will appear blurry or pixelated in print.', fixHint: 'Replace with a higher resolution image (300 DPI recommended).', icon: ImageIcon },
  font: { problemPrefix: 'A font issue was detected.', whyItMatters: 'Missing or embedded fonts may render incorrectly in the final book.', fixHint: 'Embed all fonts in your PDF before uploading.', icon: FileText },
  gutter: { problemPrefix: 'Content is too close to the gutter (spine).', whyItMatters: 'Text near the spine can be hard to read when the book is open.', fixHint: 'Add more inner margin space to keep text readable.', icon: BookOpen },
  size: { problemPrefix: 'Page dimensions do not match the selected trim size.', whyItMatters: 'Incorrect page size may cause printing issues or unexpected cropping.', fixHint: 'Adjust your document to match the KDP trim size exactly.', icon: Ruler },
  interior: { problemPrefix: 'An interior page issue was detected.', whyItMatters: 'This may affect the quality or readability of your book.', fixHint: 'Review the page and make adjustments as needed.', icon: FileText },
  cover: { problemPrefix: 'A cover issue was detected.', whyItMatters: 'Cover problems may cause your book to be rejected by KDP.', fixHint: 'Review the cover file and ensure it meets KDP specifications.', icon: AlertTriangle },
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
      return { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20', glow: 'ring-green-500/10' };
    case 'warning':
      return { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', glow: 'ring-amber-500/10' };
    case 'risk':
      return { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20', glow: 'ring-orange-500/10' };
    case 'fail':
      return { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', glow: 'ring-red-500/10' };
    default:
      return { bg: 'bg-white/5', text: 'text-white/40', border: 'border-white/10', glow: '' };
  }
}

function getSeverityLabel(severity: CheckStatus) {
  switch (severity) {
    case 'pass': return 'OK';
    case 'safe': return 'OK';
    case 'warning': return 'WARNING';
    case 'risk': return 'CRITICAL';
    case 'fail': return 'CRITICAL';
    default: return severity.toUpperCase();
  }
}

function FriendlyIssueCard({
  issue,
  isSelected,
  onClick,
}: {
  issue: PageIssueExtended;
  isSelected: boolean;
  onClick: () => void;
}) {
  const [showTechnical, setShowTechnical] = useState(false);
  const colors = getSeverityColors(issue.severity);
  const friendlyInfo = CATEGORY_FRIENDLY[issue.category] || CATEGORY_FRIENDLY['interior'];

  const pageLabel = issue.page ? `Page ${issue.page}` : '';

  return (
    <motion.div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}
      className={`w-full rounded-lg border text-left transition-all duration-150 cursor-pointer ${
        isSelected
          ? `${colors.bg} ${colors.border} ring-1 ${colors.glow}`
          : 'border-white/[0.04] hover:border-white/[0.08] hover:bg-white/[0.02]'
      }`}
      layout
    >
      <div className="p-4">
        {/* TOP ROW: Severity badge + title + affected page */}
        <div className="flex items-start gap-2">
          <span className={`shrink-0 mt-0.5 ${colors.text}`}>
            {getSeverityIcon(issue.severity)}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${colors.bg} ${colors.text}`}>
                {getSeverityLabel(issue.severity)}
              </span>
              {pageLabel && (
                <span className="text-[11px] text-white/30 font-medium">
                  {pageLabel}
                </span>
              )}
            </div>
            <p className={`text-[14px] font-medium leading-relaxed ${isSelected ? 'text-white/80' : 'text-white/60'}`}>
              {issue.message}
            </p>
          </div>
        </div>

        {/* MIDDLE SECTION: Beginner-friendly Problem / Why / Fix */}
        <div className="mt-3 ml-7 space-y-3">
          <div>
            <span className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Problem</span>
            <p className="text-[13px] text-white/45 leading-relaxed mt-0.5">
              {friendlyInfo.problemPrefix}
            </p>
          </div>
          <div>
            <span className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Why it matters</span>
            <p className="text-[13px] text-white/45 leading-relaxed mt-0.5">
              {friendlyInfo.whyItMatters}
            </p>
          </div>
          <div>
            <span className="text-[10px] font-semibold text-emerald-400/50 uppercase tracking-wider">Recommended fix</span>
            <p className="text-[13px] text-emerald-400/40 leading-relaxed mt-0.5">
              {issue.suggestion || friendlyInfo.fixHint}
            </p>
          </div>
        </div>

        {/* BOTTOM SECTION: Technical details (collapsible) */}
        {(issue.actual || issue.expected) && (
          <div className="mt-2.5 ml-6">
            <div
              onClick={(e) => { e.stopPropagation(); setShowTechnical(!showTechnical); }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); setShowTechnical(!showTechnical); } }}
              className="flex items-center gap-1 text-[11px] text-white/25 hover:text-white/40 transition-colors cursor-pointer py-1"
            >
              <ChevronDown className={`w-2.5 h-2.5 transition-transform ${showTechnical ? 'rotate-180' : ''}`} />
              Technical Details
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
                  <div className="mt-1.5 space-y-0.5 bg-white/[0.02] rounded-md p-2">
                    {issue.actual && (
                      <div className="flex items-baseline gap-2">
                        <span className="text-[10px] text-white/25 shrink-0 w-20">Actual:</span>
                        <span className="text-[11px] text-white/35 font-mono">{issue.actual}</span>
                      </div>
                    )}
                    {issue.expected && (
                      <div className="flex items-baseline gap-2">
                        <span className="text-[10px] text-white/25 shrink-0 w-20">Recommended:</span>
                        <span className="text-[11px] text-white/35 font-mono">{issue.expected}</span>
                      </div>
                    )}
                    {issue.actual && issue.expected && (
                      <div className="flex items-baseline gap-2">
                        <span className="text-[8px] text-white/15 shrink-0 w-16">Difference:</span>
                        <span className="text-[9px] text-amber-400/30 font-mono">
                          {(() => {
                            const actNum = parseFloat(issue.actual);
                            const expNum = parseFloat(issue.expected);
                            if (!isNaN(actNum) && !isNaN(expNum)) {
                              return `${Math.abs(actNum - expNum).toFixed(3)}"`;
                            }
                            return '—';
                          })()}
                        </span>
                      </div>
                    )}
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
}: ValidationPanelProps) {
  const [searchInput, setSearchInput] = useState(issueFilter.search);
  const [beginnerFilter, setBeginnerFilter] = useState<BeginnerFilter>('all');

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
    <div className="flex flex-col h-full bg-[#1a1b1e]">
      {/* ---- Section 1: Validation Status ---- */}
      <div className="shrink-0 border-b border-white/[0.06] px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[11px] font-semibold text-white/35 uppercase tracking-wider">Validation</h3>
          <div className="flex items-center gap-1">
            {validationSummary.isReady ? (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span className="text-[9px] text-emerald-400 font-medium">KDP-Ready</span>
              </div>
            ) : (
              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${getStatusBg(validationSummary.overallStatus)}`}>
                {validationSummary.overallStatus === 'fail' ? <XCircle className="w-3 h-3 text-red-400" /> :
                 validationSummary.overallStatus === 'risk' ? <AlertTriangle className="w-3 h-3 text-orange-400" /> :
                 <AlertCircle className="w-3 h-3 text-amber-400" />}
                <span className={`text-[9px] font-medium ${getStatusColor(validationSummary.overallStatus)}`}>
                  {validationSummary.overallStatus.toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Document summary pills */}
        <div className="flex items-center gap-1 flex-wrap mb-2">
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.04] text-white/25 font-medium">{bookType.charAt(0).toUpperCase() + bookType.slice(1)}</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.04] text-white/25 font-medium">{trimLabel}</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.04] text-white/25 font-medium">{bookPages.length} pages</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.04] text-white/25 font-medium">{measurements.spineWidthIn.toFixed(3)}" spine</span>
        </div>

        {/* Status pills — severity grouped */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {validationSummary.fail + validationSummary.risk > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/15 text-red-400 font-bold">
              🔴 {validationSummary.fail + validationSummary.risk} Critical
            </span>
          )}
          {validationSummary.warning > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 font-bold">
              🟡 {validationSummary.warning} Warning{validationSummary.warning !== 1 ? 's' : ''}
            </span>
          )}
          {validationSummary.safe + validationSummary.pass > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded bg-green-500/10 text-green-400/60 font-medium">
              🟢 {validationSummary.safe + validationSummary.pass} OK
            </span>
          )}
          {validationSummary.total === 0 && (
            <span className="text-[10px] text-emerald-400/50">No issues detected</span>
          )}
        </div>
      </div>

      {/* ---- Section 2: Beginner-Friendly Filter Bar ---- */}
      <div className="shrink-0 border-b border-white/[0.06] px-4 py-2">
        {/* Beginner filter tabs */}
        <div className="flex items-center gap-1 mb-2">
          {beginnerFilters.map(f => (
            <button
              key={f.key}
              onClick={() => setBeginnerFilter(f.key)}
              className={`px-3 py-1.5 rounded-md text-[11px] font-medium transition-colors min-h-[32px] ${
                beginnerFilter === f.key
                  ? f.key === 'important' ? 'bg-orange-500/15 text-orange-400'
                    : f.key === 'needs-fix' ? 'bg-amber-500/15 text-amber-400'
                    : f.key === 'safe' ? 'bg-green-500/10 text-green-400/60'
                    : 'bg-white/[0.08] text-white/60'
                  : 'text-white/20 hover:text-white/35 hover:bg-white/[0.03]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-white/15" />
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search issues..."
            className="w-full bg-white/[0.04] border border-white/[0.06] rounded-md pl-7 pr-2 py-1.5 text-[10px] text-white/60 placeholder:text-white/15 outline-none focus:border-emerald-500/30 transition-colors"
          />
        </div>
      </div>

      {/* ---- Section 3: Current Spread Issues (pinned) ---- */}
      {currentSpreadIssues.length > 0 && (
        <div className="shrink-0 border-b border-white/[0.06] px-4 py-2">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Info className="w-3 h-3 text-white/20" />
            <span className="text-[9px] font-medium text-white/25 uppercase tracking-wider">Current Spread</span>
            <span className="text-[8px] px-1 py-0.5 rounded bg-white/[0.06] text-white/20">{currentSpreadIssues.length}</span>
          </div>
          <div className="space-y-1 max-h-40 overflow-y-auto custom-scrollbar">
            {currentSpreadIssues.slice(0, 3).map(issue => (
              <FriendlyIssueCard
                key={issue.id}
                issue={issue}
                isSelected={selectedIssueId === issue.id}
                onClick={() => handleIssueClick(issue)}
              />
            ))}
            {currentSpreadIssues.length > 3 && (
              <span className="text-[8px] text-white/15 pl-2">+{currentSpreadIssues.length - 3} more below</span>
            )}
          </div>
        </div>
      )}

      {/* ---- Section 4: All Issues (grouped by SEVERITY: 🔴 Critical → 🟡 Warning → 🟢 OK) ---- */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
        {filteredIssues.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            {pageIssuesExtended.length === 0 ? (
              <>
                <CheckCircle2 className="w-8 h-8 text-emerald-400/30" />
                <span className="text-[12px] text-emerald-400/40 font-medium">Your book appears KDP-ready</span>
                <span className="text-[10px] text-white/15">No issues detected</span>
              </>
            ) : (
              <>
                <Search className="w-6 h-6 text-white/10" />
                <span className="text-[11px] text-white/20">No issues match your filter</span>
              </>
            )}
          </div>
        ) : (
          <div className="p-3 space-y-5">
            {/* 🔴 CRITICAL ISSUES — Likely Rejected By KDP */}
            {severityGroups.critical.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3 px-1">
                  <span className="text-[13px]">🔴</span>
                  <span className="text-[12px] font-semibold text-red-400/80">Critical Issues</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 font-bold">{severityGroups.critical.length}</span>
                </div>
                <div className="space-y-2">
                  {severityGroups.critical.map(issue => (
                    <FriendlyIssueCard
                      key={issue.id}
                      issue={issue}
                      isSelected={selectedIssueId === issue.id}
                      onClick={() => handleIssueClick(issue)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 🟡 WARNINGS — Recommended Improvements */}
            {severityGroups.warnings.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3 px-1">
                  <span className="text-[13px]">🟡</span>
                  <span className="text-[12px] font-semibold text-amber-400/80">Recommended Improvements</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 font-bold">{severityGroups.warnings.length}</span>
                </div>
                <div className="space-y-2">
                  {severityGroups.warnings.map(issue => (
                    <FriendlyIssueCard
                      key={issue.id}
                      issue={issue}
                      isSelected={selectedIssueId === issue.id}
                      onClick={() => handleIssueClick(issue)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 🟢 PASSED CHECKS — Validated */}
            {severityGroups.passed.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3 px-1">
                  <span className="text-[13px]">🟢</span>
                  <span className="text-[12px] font-semibold text-green-400/70">Passed Checks</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/10 text-green-400/70 font-medium">{severityGroups.passed.length}</span>
                </div>
                <div className="space-y-2">
                  {severityGroups.passed.map(issue => (
                    <FriendlyIssueCard
                      key={issue.id}
                      issue={issue}
                      isSelected={selectedIssueId === issue.id}
                      onClick={() => handleIssueClick(issue)}
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
      <span className="text-[9px] text-white/20">{label}</span>
      <span className="text-[10px] text-white/50 font-medium">{value}</span>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#1e1f22] border border-white/[0.08] rounded-xl p-5 w-80 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-sm font-semibold text-white/80 mb-1">Jump to Page</h3>
        <p className="text-[11px] text-white/25 mb-3">Enter a manuscript page number</p>
        <div className="flex gap-2">
          <input
            type="number"
            min={0}
            max={bookPages.length - 1}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleJump(); }}
            placeholder="e.g. 5"
            className="flex-1 bg-white/[0.06] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/80 placeholder:text-white/15 outline-none focus:border-emerald-500/40 transition-colors"
            autoFocus
          />
          <button
            onClick={handleJump}
            className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm font-medium hover:bg-emerald-500/30 transition-colors"
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
      <Loader2 className="w-5 h-5 text-emerald-400/60 animate-spin" />
      <span className="text-sm text-white/40">{messages[status]}</span>
    </div>
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
        className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium text-white/30 hover:text-white/50 hover:bg-white/[0.04] transition-colors"
      >
        <Maximize2 className="w-3 h-3" />
        <span className="hidden sm:inline">Fit</span>
        <ChevronDown className={`w-2.5 h-2.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-[#2a2b2e] border border-white/[0.08] rounded-lg shadow-xl py-1 min-w-[140px] z-50">
          {items.map((item) => (
            <button
              key={item.mode}
              onClick={() => { onFitSelect(item.mode); setOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-1.5 text-[11px] transition-colors ${
                fitMode === item.mode ? 'text-emerald-400 bg-white/[0.03]' : 'text-white/50 hover:text-white/70 hover:bg-white/[0.03]'
              }`}
            >
              <span>{item.label}</span>
              {item.shortcut && <span className="text-[9px] text-white/15 font-mono">{item.shortcut}</span>}
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
  } = useAppStore();

  // --- Local state ---
  const [jumpModalOpen, setJumpModalOpen] = useState(false);
  const [fitMode, setFitMode] = useState<FitMode>('fit-page');
  const [loading, setLoading] = useState(false);
  const [restoreWorkspace, setRestoreWorkspace] = useState<SavedWorkspace | null>(null);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);

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

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  const isProcessingNow = !previewReady && processingStatus !== 'idle' && processingStatus !== 'error';
  const isSpreadView = previewViewMode === 'spread' && bookType !== 'kindle';

  return (
    <div className="fixed inset-0 z-[60] flex flex-col overflow-hidden bg-[#1e1f22]">
      {/* ================================================================== */}
      {/* PRIMARY TOOLBAR (top, ~52px) — Core Navigation Controls            */}
      {/* LEFT: ← Back to Config                                             */}
      {/* CENTER: 📄 Single View | 📖 Spread View                           */}
      {/* RIGHT: ◀ Previous | Page X / Y | Next ▶                          */}
      {/* ================================================================== */}
      <div className="shrink-0 h-[52px] flex items-center justify-between px-3 border-b border-white/[0.06] bg-[#232529]">
        {/* LEFT: Back to Config — prominent, safe-feeling */}
        <button
          onClick={() => setCheckerStep('config')}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-medium text-white/45 hover:text-white/75 hover:bg-white/[0.06] transition-all duration-200 border border-white/[0.08] hover:border-white/[0.15] min-h-[36px]"
          title="Return to Configuration (preserves all progress)"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back to Config</span>
        </button>

        {/* CENTER: MODE SWITCHER — Most prominent control */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white/[0.06] rounded-xl p-1.5 border border-white/[0.12] shadow-lg shadow-black/20">
            <button
              onClick={() => bookType !== 'kindle' && setPreviewViewMode('single')}
              disabled={bookType === 'kindle'}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-[14px] font-semibold transition-all duration-250 min-h-[38px] ${
                previewViewMode === 'single'
                  ? 'bg-emerald-500/30 text-emerald-100 shadow-md shadow-emerald-500/10 border border-emerald-400/50 ring-1 ring-emerald-400/20'
                  : 'text-white/35 hover:text-white/55 hover:bg-white/[0.06]'
              }`}
              aria-label="Single Page View"
              aria-pressed={previewViewMode === 'single'}
            >
              <span className="text-[16px] leading-none">📄</span>
              <span>Single View</span>
            </button>
            <button
              onClick={() => bookType !== 'kindle' && setPreviewViewMode('spread')}
              disabled={bookType === 'kindle'}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-[14px] font-semibold transition-all duration-250 min-h-[38px] ${
                previewViewMode === 'spread'
                  ? 'bg-emerald-500/30 text-emerald-100 shadow-md shadow-emerald-500/10 border border-emerald-400/50 ring-1 ring-emerald-400/20'
                  : bookType === 'kindle'
                    ? 'text-white/10 cursor-not-allowed'
                    : 'text-white/35 hover:text-white/55 hover:bg-white/[0.06]'
              }`}
              aria-label="Spread View"
              aria-pressed={previewViewMode === 'spread'}
            >
              <span className="text-[16px] leading-none">📖</span>
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
            className="flex items-center gap-1 px-3 py-2 rounded-lg text-[12px] font-medium text-white/40 hover:text-white/70 hover:bg-white/[0.06] transition-all duration-200 min-h-[36px] disabled:opacity-15 disabled:cursor-not-allowed border border-transparent hover:border-white/[0.08]"
            title="Previous (← / A)"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Previous</span>
          </button>

          <button
            onClick={() => setJumpModalOpen(true)}
            className="px-3 py-1.5 rounded-lg text-[12px] text-white/50 hover:text-white/75 hover:bg-white/[0.06] transition-colors min-w-[110px] text-center font-medium border border-white/[0.06] hover:border-white/[0.12]"
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
            className="flex items-center gap-1 px-3 py-2 rounded-lg text-[12px] font-medium text-white/40 hover:text-white/70 hover:bg-white/[0.06] transition-all duration-200 min-h-[36px] disabled:opacity-15 disabled:cursor-not-allowed border border-transparent hover:border-white/[0.08]"
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
      <div className="shrink-0 h-9 flex items-center justify-between px-3 border-b border-white/[0.04] bg-[#1e1f22]/80">
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
                        : 'text-white/20 hover:text-white/35'
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
            className="p-1 rounded-md text-white/30 hover:text-white/55 hover:bg-white/[0.04] transition-colors"
            title="Zoom Out (-)"
          >
            <Minus className="w-3 h-3" />
          </button>
          <button
            onClick={() => setJumpModalOpen(true)}
            className="px-2 py-0.5 rounded-md text-[10px] text-white/35 hover:text-white/55 hover:bg-white/[0.04] transition-colors min-w-[44px] text-center font-mono"
            title="Click to jump to page"
          >
            {zoomPct}%
          </button>
          <button
            onClick={zoomIn}
            className="p-1 rounded-md text-white/30 hover:text-white/55 hover:bg-white/[0.04] transition-colors"
            title="Zoom In (+)"
          >
            <Plus className="w-3 h-3" />
          </button>

          <div className="w-px h-4 bg-white/[0.06] mx-0.5" />

          <FitDropdown fitMode={fitMode} onFitSelect={applyFitMode} />
        </div>
      </div>

      {/* ================================================================== */}
      {/* MAIN AREA: Left Sidebar (~18%) + Center Canvas (~57%) + Right (~25%) */}
      {/* ================================================================== */}
      <div className="flex-1 flex min-h-0">
        {/* LEFT: Thumbnail Sidebar */}
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

        {/* Onboarding hint: sidebar */}
        {!sidebarCollapsed && !isHintDismissed('hint-sidebar') && (
          <div className="absolute left-[170px] top-14 z-30">
            <OnboardingHint id="hint-sidebar" onDismiss={handleDismissHint}>
              Click a page to preview it
            </OnboardingHint>
          </div>
        )}

        {/* CENTER: Preview canvas area — dark workspace */}
        <div
          ref={canvasContainerRef}
          className="flex-1 relative overflow-hidden flex items-center justify-center"
          onDoubleClick={handleDoubleClick}
          style={{
            background: 'radial-gradient(ellipse at center, #232529 0%, #1e1f22 100%)',
            cursor: 'default',
          }}
        >
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
            <ProcessingState status={isProcessingNow ? processingStatus : 'rendering'} />
          ) : bookPages.length === 0 ? (
            <div className="flex flex-col items-center gap-3 text-white/15">
              <BookOpen className="w-12 h-12" />
              <span className="text-sm">No pages to preview</span>
              <span className="text-xs text-white/8">Upload a manuscript to begin</span>
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
        <div className="w-[25%] min-w-[280px] max-w-[380px] shrink-0 border-l border-white/[0.06] flex flex-col min-h-0">
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
      <div className="shrink-0 h-7 flex items-center justify-between px-3 border-t border-white/[0.06] bg-[#232529]">
        {/* Left: Page info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-1.5 shrink-0">
            {bookType === 'kindle' && <Monitor className="w-3 h-3 text-white/15" />}
            {bookType === 'paperback' && <BookOpen className="w-3 h-3 text-white/15" />}
            {bookType === 'hardcover' && <Box className="w-3 h-3 text-white/15" />}
            <span className="text-[10px] text-white/20 font-medium uppercase">{bookType}</span>
          </div>

          <span className="text-[10px] text-white/15">
            {currentPageInfo.pageLabel}
            {isSpreadView && currentSpreadIdx >= 0 && (
              <> &middot; Spread {currentSpreadIdx + 1}</>
            )}
          </span>
        </div>

        {/* Center: View mode + Zoom */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-white/15">
            {previewViewMode === 'spread' ? 'Spread' : 'Single'}
          </span>
          <span className="text-[10px] text-white/20 font-mono">{zoomPct}%</span>
        </div>

        {/* Right: Issue summary + Ready status */}
        <div className="flex items-center gap-3 shrink-0">
          {pageIssuesExtended.length > 0 ? (
            <div className="flex items-center gap-1.5">
              {issueSummary.fail > 0 && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400/70 font-medium">{issueSummary.fail} fail</span>
              )}
              {issueSummary.risk > 0 && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400/70 font-medium">{issueSummary.risk} risk</span>
              )}
              {issueSummary.warning > 0 && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400/70 font-medium">{issueSummary.warning} warn</span>
              )}
            </div>
          ) : (
            previewReady && (
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400/50" />
                <span className="text-[9px] text-emerald-400/40">KDP-ready</span>
              </div>
            )
          )}
          {processingStatus === 'error' && (
            <div className="flex items-center gap-1">
              <AlertCircle className="w-3 h-3 text-red-400/60" />
              <span className="text-[9px] text-red-400/40">Error</span>
            </div>
          )}
          <span className="text-[10px] text-white/10">{bookPages.length} pages</span>
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
