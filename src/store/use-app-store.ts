import { create } from 'zustand';
import {
  AppView, BookConfig, CalculatedMeasurements, UploadedFile,
  ValidationReport, PageTexture, BookType, CheckerStep,
  PreviewViewMode, OverlayType, PageAnalysis, PageIssue,
  BookPage, PreviewAssetCache, ProcessingStatus, PageIssueExtended,
  IssueFilter, SpreadModel, ValidationSummary, CheckStatus,
} from '@/types/kdp';
import { DEFAULT_BOOK_CONFIG, calculateMeasurements } from '@/engine/kdp-constants';
import type { PDFAnalysisResult } from '@/engine/validator';
import type { SaveStatus } from '@/lib/persistence';

interface AppStore {
  // Navigation
  view: AppView;
  setView: (view: AppView) => void;

  // Book Setup
  bookConfig: BookConfig;
  measurements: CalculatedMeasurements;
  updateBookConfig: (updates: Partial<BookConfig>) => void;

  // Uploaded Files
  uploadedCover: UploadedFile | null;
  uploadedManuscript: UploadedFile | null;
  setUploadedCover: (file: UploadedFile | null) => void;
  setUploadedManuscript: (file: UploadedFile | null) => void;

  // Validation
  validationReports: ValidationReport[];
  setValidationReports: (reports: ValidationReport[]) => void;
  clearValidationReports: () => void;

  // Textures for 3D preview
  coverTextures: PageTexture[];
  manuscriptTextures: PageTexture[];
  setCoverTextures: (textures: PageTexture[]) => void;
  setManuscriptTextures: (textures: PageTexture[]) => void;

  // Processing state
  isProcessing: boolean;
  processingMessage: string;
  setProcessing: (isProcessing: boolean, message?: string) => void;

  // Checker workflow
  checkerStep: CheckerStep;
  setCheckerStep: (step: CheckerStep) => void;
  bookType: BookType;
  setBookType: (type: BookType) => void;

  // Preview state
  previewViewMode: PreviewViewMode;
  setPreviewViewMode: (mode: PreviewViewMode) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  setTotalPages: (total: number) => void;
  activeOverlays: OverlayType[];
  toggleOverlay: (overlay: OverlayType) => void;
  setOverlays: (overlays: OverlayType[]) => void;

  // Page analysis
  pageAnalyses: PageAnalysis[];
  setPageAnalyses: (analyses: PageAnalysis[]) => void;
  pageIssues: PageIssue[];
  setPageIssues: (issues: PageIssue[]) => void;

  // PDF document data
  pdfPageDataUrls: Map<number, string>;
  setPdfPageDataUrl: (page: number, dataUrl: string) => void;
  clearPdfPageData: () => void;

  // Unified book model
  bookPages: BookPage[];
  setBookPages: (pages: BookPage[]) => void;
  coverDataUrl: string;
  setCoverDataUrl: (url: string) => void;

  // Preview asset cache (built during import)
  previewCache: PreviewAssetCache | null;
  setPreviewCache: (cache: PreviewAssetCache | null) => void;

  // Processing status
  processingStatus: ProcessingStatus;
  setProcessingStatus: (status: ProcessingStatus) => void;

  // Preview ready flag
  previewReady: boolean;
  setPreviewReady: (ready: boolean) => void;

  // Extended page issues (with position info)
  pageIssuesExtended: PageIssueExtended[];
  setPageIssuesExtended: (issues: PageIssueExtended[]) => void;

  // Selected issue for highlighting
  selectedIssueId: string | null;
  setSelectedIssueId: (id: string | null) => void;

  // Issue filter
  issueFilter: IssueFilter;
  setIssueFilter: (filter: Partial<IssueFilter>) => void;

  // Spread model (correctly computed)
  spreadModels: SpreadModel[];
  setSpreadModels: (spreads: SpreadModel[]) => void;

  // Current spread index (derived from currentPage)
  currentSpreadIndex: number;

  // Validation summary (computed from pageIssues)
  validationSummary: ValidationSummary;

  // Save/restore system
  saveStatus: SaveStatus;
  setSaveStatus: (status: SaveStatus) => void;
  hasRestoredSession: boolean;
  setHasRestoredSession: (restored: boolean) => void;

  // Onboarding hints
  dismissedHints: string[];
  dismissHint: (hintId: string) => void;
  isHintDismissed: (hintId: string) => boolean;

  // Sidebar collapsed state
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // PDF analysis result (stored for re-validation when config changes)
  pdfAnalysis: PDFAnalysisResult | null;
  setPdfAnalysis: (analysis: PDFAnalysisResult | null) => void;

  // Reset
  reset: () => void;
}

const initialConfig: BookConfig = { ...DEFAULT_BOOK_CONFIG, bookType: 'paperback' };
const initialMeasurements = calculateMeasurements(initialConfig);

// Load dismissed hints from localStorage
function loadDismissedHints(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem('kdp-dismissed-hints');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Load view mode from localStorage
function loadViewMode(): PreviewViewMode {
  if (typeof window === 'undefined') return 'single';
  try {
    const stored = localStorage.getItem('kdp-view-mode');
    return (stored === 'spread' || stored === 'single') ? stored : 'single';
  } catch {
    return 'single';
  }
}

export const useAppStore = create<AppStore>((set, get) => ({
  // Navigation
  view: 'landing',
  setView: (view) => set({ view }),

  // Book Setup
  bookConfig: initialConfig,
  measurements: initialMeasurements,
  updateBookConfig: (updates) =>
    set((state) => {
      const newConfig = { ...state.bookConfig, ...updates };
      const newMeasurements = calculateMeasurements(newConfig);
      return { bookConfig: newConfig, measurements: newMeasurements };
    }),

  // Uploaded Files
  uploadedCover: null,
  uploadedManuscript: null,
  setUploadedCover: (file) => set({ uploadedCover: file }),
  setUploadedManuscript: (file) => set({ uploadedManuscript: file }),

  // Validation
  validationReports: [],
  setValidationReports: (reports) => set({ validationReports: reports }),
  clearValidationReports: () => set({ validationReports: [] }),

  // Textures
  coverTextures: [],
  manuscriptTextures: [],
  setCoverTextures: (textures) => set({ coverTextures: textures }),
  setManuscriptTextures: (textures) => set({ manuscriptTextures: textures }),

  // Processing
  isProcessing: false,
  processingMessage: '',
  setProcessing: (isProcessing, message = '') => set({ isProcessing, processingMessage: message }),

  // Checker workflow
  checkerStep: 'import',
  setCheckerStep: (step) => set({ checkerStep: step }),
  bookType: 'paperback',
  setBookType: (type) => set({ bookType: type }),

  // Preview state
  previewViewMode: loadViewMode(),
  setPreviewViewMode: (mode) => {
    if (typeof window !== 'undefined') {
      try { localStorage.setItem('kdp-view-mode', mode); } catch { /* ignore */ }
    }
    set({ previewViewMode: mode });
  },
  currentPage: 0,
  setCurrentPage: (page) => set({ currentPage: page }),
  totalPages: 1,
  setTotalPages: (total) => set({ totalPages: total }),
  activeOverlays: [],
  toggleOverlay: (overlay) =>
    set((state) => ({
      activeOverlays: state.activeOverlays.includes(overlay)
        ? state.activeOverlays.filter((o) => o !== overlay)
        : [...state.activeOverlays, overlay],
    })),
  setOverlays: (overlays) => set({ activeOverlays: overlays }),

  // Page analysis
  pageAnalyses: [],
  setPageAnalyses: (analyses) => set({ pageAnalyses: analyses }),
  pageIssues: [],
  setPageIssues: (issues) => set({ pageIssues: issues }),

  // PDF page data
  pdfPageDataUrls: new Map(),
  setPdfPageDataUrl: (page, dataUrl) =>
    set((state) => {
      const newMap = new Map(state.pdfPageDataUrls);
      newMap.set(page, dataUrl);
      return { pdfPageDataUrls: newMap };
    }),
  clearPdfPageData: () => set({ pdfPageDataUrls: new Map() }),

  // Unified book model
  bookPages: [],
  setBookPages: (pages) => set({ bookPages: pages }),
  coverDataUrl: '',
  setCoverDataUrl: (url) => set({ coverDataUrl: url }),

  // Preview asset cache
  previewCache: null,
  setPreviewCache: (cache) => set({ previewCache: cache }),

  // Processing status
  processingStatus: 'idle',
  setProcessingStatus: (status) => set({ processingStatus: status }),

  // Preview ready flag
  previewReady: false,
  setPreviewReady: (ready) => set({ previewReady: ready }),

  // Extended page issues
  pageIssuesExtended: [],
  setPageIssuesExtended: (issues) => set({ pageIssuesExtended: issues }),

  // Selected issue for highlighting
  selectedIssueId: null,
  setSelectedIssueId: (id) => set({ selectedIssueId: id }),

  // Issue filter
  issueFilter: { severity: 'all', category: 'all', search: '' },
  setIssueFilter: (filter) =>
    set((state) => ({ issueFilter: { ...state.issueFilter, ...filter } })),

  // Spread model
  spreadModels: [],
  setSpreadModels: (spreads) => set({ spreadModels: spreads }),

  // Current spread index (derived from currentPage)
  currentSpreadIndex: 0,

  // Validation summary (computed from pageIssues)
  validationSummary: { total: 0, fail: 0, risk: 0, warning: 0, safe: 0, pass: 0, byCategory: { cover: 0, interior: 0, bleed: 0, dpi: 0, font: 0, gutter: 0, margin: 0, size: 0 }, overallStatus: 'pass' as CheckStatus, isReady: true },

  // Save/restore system
  saveStatus: 'idle',
  setSaveStatus: (status) => set({ saveStatus: status }),
  hasRestoredSession: false,
  setHasRestoredSession: (restored) => set({ hasRestoredSession: restored }),

  // Onboarding hints
  dismissedHints: loadDismissedHints(),
  dismissHint: (hintId) =>
    set((state) => {
      const updated = [...state.dismissedHints];
      if (!updated.includes(hintId)) updated.push(hintId);
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('kdp-dismissed-hints', JSON.stringify(updated)); } catch { /* ignore */ }
      }
      return { dismissedHints: updated };
    }),
  isHintDismissed: (hintId) => get().dismissedHints.includes(hintId),

  // Sidebar collapsed state
  sidebarCollapsed: false,
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

  // PDF analysis result
  pdfAnalysis: null,
  setPdfAnalysis: (analysis) => set({ pdfAnalysis: analysis }),

  // Reset
  reset: () =>
    set({
      view: 'landing',
      bookConfig: initialConfig,
      measurements: initialMeasurements,
      uploadedCover: null,
      uploadedManuscript: null,
      validationReports: [],
      coverTextures: [],
      manuscriptTextures: [],
      isProcessing: false,
      processingMessage: '',
      checkerStep: 'import',
      bookType: 'paperback',
      previewViewMode: loadViewMode(),
      currentPage: 0,
      totalPages: 1,
      activeOverlays: [],
      pageAnalyses: [],
      pageIssues: [],
      pdfPageDataUrls: new Map(),
      bookPages: [],
      coverDataUrl: '',
      previewCache: null,
      processingStatus: 'idle',
      previewReady: false,
      pageIssuesExtended: [],
      selectedIssueId: null,
      issueFilter: { severity: 'all', category: 'all', search: '' },
      spreadModels: [],
      saveStatus: 'idle',
      hasRestoredSession: false,
      sidebarCollapsed: false,
      pdfAnalysis: null,
    }),
}));
