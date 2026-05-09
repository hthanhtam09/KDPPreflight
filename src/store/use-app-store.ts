import { create } from 'zustand';
import { AppView, BookConfig, CalculatedMeasurements, UploadedFile, ValidationReport, PageTexture, KDPFormat, CheckerStep, PreviewMode, OverlayType, DetectedMetadata, PageIssue } from '@/types/kdp';
import { DEFAULT_BOOK_CONFIG, calculateMeasurements } from '@/engine/kdp-constants';

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

  // Checker flow
  kdpFormat: KDPFormat;
  setKdpFormat: (format: KDPFormat) => void;
  checkerStep: CheckerStep;
  setCheckerStep: (step: CheckerStep) => void;

  // Preview
  previewMode: PreviewMode;
  setPreviewMode: (mode: PreviewMode) => void;
  activeOverlays: OverlayType[];
  toggleOverlay: (overlay: OverlayType) => void;
  currentPreviewPage: number;
  setCurrentPreviewPage: (page: number) => void;

  // Detection
  detectedMetadata: DetectedMetadata | null;
  setDetectedMetadata: (meta: DetectedMetadata | null) => void;
  pageIssues: PageIssue[];
  setPageIssues: (issues: PageIssue[]) => void;

  // Reset
  reset: () => void;
}

const initialConfig = DEFAULT_BOOK_CONFIG;
const initialMeasurements = calculateMeasurements(initialConfig);

export const useAppStore = create<AppStore>((set) => ({
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

  // Checker flow
  kdpFormat: 'paperback',
  setKdpFormat: (format) => set({ kdpFormat: format }),
  checkerStep: 'import',
  setCheckerStep: (step) => set({ checkerStep: step }),

  // Preview
  previewMode: 'single',
  setPreviewMode: (mode) => set({ previewMode: mode }),
  activeOverlays: [],
  toggleOverlay: (overlay) =>
    set((state) => ({
      activeOverlays: state.activeOverlays.includes(overlay)
        ? state.activeOverlays.filter((o) => o !== overlay)
        : [...state.activeOverlays, overlay],
    })),
  currentPreviewPage: 1,
  setCurrentPreviewPage: (page) => set({ currentPreviewPage: page }),

  // Detection
  detectedMetadata: null,
  setDetectedMetadata: (meta) => set({ detectedMetadata: meta }),
  pageIssues: [],
  setPageIssues: (issues) => set({ pageIssues: issues }),

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
      kdpFormat: 'paperback',
      checkerStep: 'import',
      previewMode: 'single',
      activeOverlays: [],
      currentPreviewPage: 1,
      detectedMetadata: null,
      pageIssues: [],
    }),
}));
