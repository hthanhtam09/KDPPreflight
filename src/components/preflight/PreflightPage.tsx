'use client'

import { TRIM_SIZES } from '@/engine/kdp-constants'
import { analyzePdfPageColors, loadPDF } from '@/engine/pdf-processor'
import type { BleedType, BookType, TrimSizeKey } from '@/types/kdp'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import type {
  KRColorRisk,
  KRCoverData,
  KRDetectedSettings,
  KRIssue,
  KRPageBoxDebug,
  KRPageDiagnostics,
  KRSkippedCheck,
  KRResult,
  KRScanData,
  KRScanState,
  KRStep,
} from './types'

import ConfirmStep from './ConfirmStep'
import FixStep from './FixStep'
import IssuesStep from './IssuesStep'
import UploadStep from './UploadStep'
import { getFixability } from './fix-capabilities'
import { createValidationConfigHash, validatePageSizeAgainstConfig } from './page-size-validation'
import { AppWorkspaceShell } from '@/components/shared/PageShell'

// ── State / Reducer ───────────────────────────────────────────────────────────

interface KRState {
  step: KRStep
  bookType: BookType | null
  files: { cover: File | null; manuscript: File | null }
  scan: KRScanState
  scanData: KRScanData | null
  detectedSettings: KRDetectedSettings | null
  confirmedSettings: KRDetectedSettings | null
  result: KRResult | null
  lastResult: KRResult | null
  previousResult: KRResult | null
  isComputingIssues: boolean
  selectedIssueId: string | null
  activeValidationRequestId: number | null
  activeValidationConfigHash: string | null
  activeFileFingerprint: string | null
}

type KRAction =
  | { type: 'SET_BOOK_TYPE'; bookType: BookType }
  | { type: 'SET_FILES'; files: Partial<KRState['files']> }
  | { type: 'SCAN_UPDATE'; scan: Partial<KRScanState> }
  | { type: 'SCAN_DATA_READY'; scanData: KRScanData; detected: KRDetectedSettings }
  | { type: 'GO_CONFIRM' }
  | { type: 'GO_BACK_TO_CONFIRM' }
  | { type: 'UPDATE_SETTINGS'; settings: KRDetectedSettings }
  | { type: 'START_COMPUTING'; requestId: number; fileFingerprint: string; validationConfigHash: string }
  | { type: 'RESULT_READY'; requestId: number; fileFingerprint: string; validationConfigHash: string; result: KRResult }
  | { type: 'GO_FIX'; issueId?: string | null }
  | { type: 'RECHECK'; previousResult: KRResult }
  | { type: 'RESET' }

const INITIAL_SCAN: KRScanState = {
  phase: 'idle',
  pagesScanned: 0,
  totalPages: 0,
  errorMessage: null,
}

const initialState: KRState = {
  step: 'upload',
  bookType: null,
  files: { cover: null, manuscript: null },
  scan: INITIAL_SCAN,
  scanData: null,
  detectedSettings: null,
  confirmedSettings: null,
  result: null,
  lastResult: null,
  previousResult: null,
  isComputingIssues: false,
  selectedIssueId: null,
  activeValidationRequestId: null,
  activeValidationConfigHash: null,
  activeFileFingerprint: null,
}

function fileFingerprint(file: File | null): string {
  if (!file) return 'none'
  return `${file.name}:${file.size}:${file.lastModified}`
}

function filesFingerprint(files: KRState['files']): string {
  return [`manuscript=${fileFingerprint(files.manuscript)}`, `cover=${fileFingerprint(files.cover)}`].join('|')
}

function withValidationConfigHash(settings: KRDetectedSettings): KRDetectedSettings {
  const trim = TRIM_SIZES[settings.trimSize]
  const validationConfigHash = createValidationConfigHash({
    bookType: settings.bookType,
    trimWidthIn: trim?.widthIn ?? settings.widthIn,
    trimHeightIn: trim?.heightIn ?? settings.heightIn,
    bleedEnabled: settings.bleed === 'bleed',
    interiorType: settings.interior,
    paperType: settings.paper,
    pageCount: settings.pageCount,
    bindingType: settings.bookType,
    coverType: settings.bookType,
  })

  return { ...settings, validationConfigHash }
}

function reducer(state: KRState, action: KRAction): KRState {
  switch (action.type) {
    case 'SET_BOOK_TYPE': {
      const locked =
        state.confirmedSettings?.configLocked && state.confirmedSettings.bookType === action.bookType
          ? state.confirmedSettings
          : null
      return { ...initialState, bookType: action.bookType, detectedSettings: locked, confirmedSettings: locked }
    }
    case 'SET_FILES':
      return { ...state, files: { ...state.files, ...action.files } }
    case 'SCAN_UPDATE':
      return { ...state, scan: { ...state.scan, ...action.scan } }
    case 'SCAN_DATA_READY':
      if (state.detectedSettings?.configLocked || state.confirmedSettings?.configLocked) {
        const locked = state.confirmedSettings ?? state.detectedSettings
        return { ...state, scanData: action.scanData, detectedSettings: locked }
      }
      return { ...state, scanData: action.scanData, detectedSettings: action.detected }
    case 'GO_CONFIRM':
      return { ...state, step: 'confirm' }
    case 'GO_BACK_TO_CONFIRM':
      return {
        ...state,
        step: 'confirm',
        detectedSettings: state.confirmedSettings ?? state.detectedSettings,
        confirmedSettings: null,
        result: null,
        isComputingIssues: false,
        selectedIssueId: null,
        activeValidationRequestId: null,
        activeValidationConfigHash: null,
        activeFileFingerprint: null,
      }
    case 'UPDATE_SETTINGS': {
      const settings = withValidationConfigHash({
        ...action.settings,
        configSource: action.settings.configSource ?? 'user',
        configLocked: action.settings.configLocked ?? true,
        lastUpdated: action.settings.lastUpdated ?? Date.now(),
      })
      return {
        ...state,
        confirmedSettings: settings,
        detectedSettings: {
          ...(state.detectedSettings ?? settings),
          ...settings,
        },
      }
    }
    case 'START_COMPUTING':
      return {
        ...state,
        isComputingIssues: true,
        result: null,
        selectedIssueId: null,
        activeValidationRequestId: action.requestId,
        activeValidationConfigHash: action.validationConfigHash,
        activeFileFingerprint: action.fileFingerprint,
      }
    case 'RESULT_READY':
      if (
        action.requestId !== state.activeValidationRequestId ||
        action.validationConfigHash !== state.activeValidationConfigHash ||
        action.fileFingerprint !== state.activeFileFingerprint
      ) {
        return state
      }
      return {
        ...state,
        result: action.result,
        lastResult: action.result,
        isComputingIssues: false,
        step: 'fix',
        selectedIssueId:
          action.result.issues.find(
            (issue) =>
              issue.scope !== 'setup' || issue.issueType === 'spine-width-risk' || issue.issueType === 'spine-text-risk'
          )?.id ?? null,
      }
    case 'GO_FIX':
      return { ...state, step: 'fix', selectedIssueId: action.issueId ?? null }
    case 'RECHECK':
      return { ...initialState, previousResult: action.previousResult }
    case 'RESET':
      return { ...initialState }
    default:
      return state
  }
}

// ── Page quality analysis (browser canvas sampling) ───────────────────────────

async function samplePageQuality(dataUrl: string): Promise<{ lowSharpness: boolean; lowContrast: boolean }> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      try {
        // 96px canvas — ~64% fewer pixels than 160px while retaining enough signal
        const SIZE = 96
        const canvas = document.createElement('canvas')
        canvas.width = SIZE
        canvas.height = SIZE
        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        if (!ctx) {
          resolve({ lowSharpness: false, lowContrast: false })
          return
        }
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, 0, 0, SIZE, SIZE)
        const data = ctx.getImageData(0, 0, SIZE, SIZE).data
        const gray = new Float32Array(SIZE * SIZE)
        let sum = 0

        for (let i = 0, p = 0; i < data.length; i += 4, p++) {
          const value = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
          gray[p] = value
          sum += value
        }

        const mean = sum / gray.length
        let variance = 0
        let edgeTotal = 0
        let edgeCount = 0

        for (let y = 1; y < SIZE - 1; y++) {
          for (let x = 1; x < SIZE - 1; x++) {
            const i = y * SIZE + x
            const gx = Math.abs(gray[i + 1] - gray[i - 1])
            const gy = Math.abs(gray[i + SIZE] - gray[i - SIZE])
            edgeTotal += gx + gy
            edgeCount += 1
          }
        }

        for (let i = 0; i < gray.length; i++) {
          const diff = gray[i] - mean
          variance += diff * diff
        }

        const edgeScore = edgeTotal / Math.max(edgeCount, 1)
        const contrastScore = Math.sqrt(variance / gray.length)

        resolve({
          lowSharpness: edgeScore < 4.2 && contrastScore < 58,
          lowContrast: contrastScore < 28,
        })
      } catch {
        resolve({ lowSharpness: false, lowContrast: false })
      }
    }
    img.onerror = () => resolve({ lowSharpness: false, lowContrast: false })
    img.src = dataUrl
  })
}

function buildColorRisk(
  interior: string,
  colorPageIndices: number[],
  darkPageIndices: number[],
  pageCount: number
): KRColorRisk {
  const colorCount = colorPageIndices.length
  const darkCount = darkPageIndices.length
  const isBW = interior === 'black-white'

  let riskLevel: KRColorRisk['riskLevel'] = 'low'
  let riskSummary = 'No significant color risks detected.'

  if (isBW && colorCount > 0) {
    riskLevel = colorCount > 5 ? 'high' : 'medium'
    riskSummary = `${colorCount} color page${colorCount > 1 ? 's' : ''} found in a Black & White book. KDP will auto-convert to grayscale.`
  } else if (!isBW && colorCount === 0 && pageCount > 20) {
    riskLevel = 'medium'
    riskSummary = 'No color detected but Color interior is selected. You may be paying more than necessary.'
  } else if (darkCount >= 3) {
    riskLevel = 'medium'
    riskSummary = `${darkCount} pages have very dark backgrounds. Order a proof copy to check print quality.`
  }

  return {
    colorPageCount: colorCount,
    darkPageCount: darkCount,
    colorPageIndices,
    darkPageIndices,
    riskLevel,
    riskSummary,
  }
}

// ── Settings helpers ──────────────────────────────────────────────────────────

function matchTrimSize(w: number, h: number): TrimSizeKey {
  let best: TrimSizeKey = '6x9'
  let bestDist = Infinity
  for (const [key, size] of Object.entries(TRIM_SIZES)) {
    if (key === 'custom') continue
    const plain = Math.hypot(size.widthIn - w, size.heightIn - h)
    const withBleed = Math.hypot(size.widthIn - (w - 0.25), size.heightIn - (h - 0.25))
    const dist = Math.min(plain, withBleed)
    if (dist < bestDist) {
      bestDist = dist
      best = key as TrimSizeKey
    }
  }
  return best
}

function detectBleed(w: number, h: number, trimW: number, trimH: number): boolean {
  return Math.abs(w - (trimW + 0.25)) < 0.07 && Math.abs(h - (trimH + 0.25)) < 0.07
}

function buildDetectedSettings(
  bookType: BookType,
  widthIn: number,
  heightIn: number,
  pageCount: number
): KRDetectedSettings {
  const trimKey = matchTrimSize(widthIn, heightIn)
  const trim = TRIM_SIZES[trimKey]
  const bleed = detectBleed(widthIn, heightIn, trim.widthIn, trim.heightIn) ? 'bleed' : 'no-bleed'
  const dimDist = Math.hypot(trim.widthIn - widthIn, trim.heightIn - heightIn)
  const trimConf = dimDist < 0.05 ? 'high' : dimDist < 0.2 ? 'medium' : 'low'

  return withValidationConfigHash({
    configSource: 'detected',
    configLocked: false,
    lastUpdated: Date.now(),
    bookType,
    trimSize: trimKey,
    bleed: bleed as BleedType,
    paper: 'white',
    interior: 'black-white',
    pageCount,
    widthIn,
    heightIn,
    orientation: widthIn > heightIn ? 'landscape' : 'portrait',
    confidence: {
      trimSize: trimConf,
      bleed: dimDist < 0.1 ? 'high' : 'medium',
    },
  })
}

function annotatePageBoxes(
  boxes: KRPageBoxDebug[],
  selectedTrimWidthIn: number,
  selectedTrimHeightIn: number,
  bleedEnabled: boolean
): KRPageBoxDebug[] {
  const OK_TOLERANCE = 0.02
  const SHOULD_CHECK_TOLERANCE = 0.24
  return boxes.map((box) => {
    const pageSize = validatePageSizeAgainstConfig({
      actualWidthIn: box.printBox.widthIn,
      actualHeightIn: box.printBox.heightIn,
      selectedTrimWidthIn,
      selectedTrimHeightIn,
      bleedEnabled,
      toleranceIn: OK_TOLERANCE,
    })
    const validationResult = pageSize.ok
      ? 'ok'
      : pageSize.maxDiffIn <= SHOULD_CHECK_TOLERANCE
        ? 'should-check'
        : 'must-fix'
    const reasonCode =
      validationResult === 'ok'
        ? 'BOX_MATCHES_CONFIRMED_SIZE'
        : validationResult === 'should-check'
          ? 'BOX_DIFF_SMALL_REVIEW'
          : 'BOX_DIFF_EXCEEDS_KDP_TOLERANCE'
    return {
      ...box,
      expectedWidthIn: pageSize.expectedWidthIn,
      expectedHeightIn: pageSize.expectedHeightIn,
      diffWidthIn: pageSize.diffWidthIn,
      diffHeightIn: pageSize.diffHeightIn,
      validationResult,
      reasonCode,
      validationSource: 'setup-level',
    }
  })
}

function toDebugBoxes(
  pages: Array<{
    boxes?: Omit<
      KRPageBoxDebug,
      'expectedWidthIn' | 'expectedHeightIn' | 'diffWidthIn' | 'diffHeightIn' | 'validationResult' | 'reasonCode'
    >
  }>
): KRPageBoxDebug[] {
  return pages
    .map((p) => p.boxes)
    .filter((box): box is NonNullable<typeof box> => !!box)
    .map((box) => ({
      ...box,
      expectedWidthIn: null,
      expectedHeightIn: null,
      diffWidthIn: null,
      diffHeightIn: null,
      validationResult: 'ok',
      reasonCode: 'NOT_VALIDATED_YET',
    }))
}

function withFixability(issues: KRIssue[]): KRIssue[] {
  return issues.map((issue) => ({
    ...issue,
    fixability: issue.fixability ?? getFixability(issue.issueType),
  }))
}

// ── Main component ────────────────────────────────────────────────────────────

export default function PreflightPage() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const workerRef = useRef<Worker | null>(null)
  const cancelRef = useRef(false)
  const analysisRequestRef = useRef(0)
  useEffect(() => {
    workerRef.current = new Worker('/workers/kdp-analysis-worker.js')
    return () => workerRef.current?.terminate()
  }, [])

  // ── Reload guard — active on fix/issues steps ────────────────────────────────

  const [showReloadDialog, setShowReloadDialog] = useState(false)

  useEffect(() => {
    if (state.step !== 'fix' && state.step !== 'issues') return
    const onKeyDown = (e: KeyboardEvent) => {
      const isReload =
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'r') || e.key === 'F5'
      if (!isReload) return
      e.preventDefault()
      setShowReloadDialog(true)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [state.step])

  // ── Quick + full scan ────────────────────────────────────────────────────

  const startScan = useCallback(async (manuscript: File, bookType: BookType) => {
    cancelRef.current = false
    dispatch({ type: 'SCAN_UPDATE', scan: { phase: 'reading', pagesScanned: 0, totalPages: 0 } })

    try {
      const quick = await loadPDF(manuscript, { maxPages: 1, renderScale: 0.7 })
      if (cancelRef.current) return

      dispatch({ type: 'SCAN_UPDATE', scan: { phase: 'detecting', totalPages: quick.pageCount, pagesScanned: 1 } })

      const detected = buildDetectedSettings(bookType, quick.widthIn, quick.heightIn, quick.pageCount)
      const firstPageDataUrl = quick.pages[0]?.dataUrl ?? null
      const fileSizeMb = manuscript.size / 1048576

      dispatch({
        type: 'SCAN_DATA_READY',
        scanData: {
          widthIn: quick.widthIn,
          heightIn: quick.heightIn,
          pageCount: quick.pageCount,
          firstPageDataUrl,
          pageWidths: [quick.widthIn],
          pageHeights: [quick.heightIn],
          pageBoxes: toDebugBoxes(quick.pages),
          blankPageIndices: quick.pages.filter((p) => p.isBlank).map((p) => p.index),
          colorPageIndices: [],
          grayscalePageIndices: [],
          pageColorStatsByPage: undefined,
          darkPageIndices: [],
          blurryPageIndices: [],
          fileSizeMb,
        },
        detected,
      })
      dispatch({ type: 'GO_CONFIRM' })

      if (quick.pageCount > 1) {
        dispatch({ type: 'SCAN_UPDATE', scan: { phase: 'scanning', pagesScanned: 0, totalPages: quick.pageCount } })
        const full = await loadPDF(manuscript, {
          maxPages: quick.pageCount,
          renderScale: 0.3,
          isCancelled: () => cancelRef.current,
          onProgress: (current, total) => {
            dispatch({ type: 'SCAN_UPDATE', scan: { phase: 'scanning', pagesScanned: current, totalPages: total } })
          },
        })
        if (cancelRef.current) return

        dispatch({ type: 'SCAN_UPDATE', scan: { phase: 'analyzing' } })
        const { colorPageIndices, grayscalePageIndices, pageColorStatsByPage, darkPageIndices, blurryPageIndices } =
          await analyzePdfPageColors(manuscript, {
            isCancelled: () => cancelRef.current,
            onProgress: (current, total) => {
              dispatch({ type: 'SCAN_UPDATE', scan: { phase: 'analyzing', pagesScanned: current, totalPages: total } })
            },
          })
        if (cancelRef.current) return

        dispatch({
          type: 'SCAN_DATA_READY',
          scanData: {
            widthIn: full.widthIn,
            heightIn: full.heightIn,
            pageCount: full.pageCount,
            firstPageDataUrl,
            pageWidths: full.pages.map((p) => p.width),
            pageHeights: full.pages.map((p) => p.height),
            pageBoxes: toDebugBoxes(full.pages),
            blankPageIndices: full.pages.filter((p) => p.isBlank).map((p) => p.index),
            colorPageIndices,
            grayscalePageIndices,
            pageColorStatsByPage,
            darkPageIndices,
            blurryPageIndices,
            fileSizeMb,
          },
          detected: withValidationConfigHash({ ...detected, pageCount: full.pageCount }),
        })
        dispatch({
          type: 'SCAN_UPDATE',
          scan: { phase: 'done', pagesScanned: full.pageCount, totalPages: full.pageCount },
        })
      } else {
        dispatch({ type: 'SCAN_UPDATE', scan: { phase: 'analyzing', pagesScanned: 0, totalPages: quick.pageCount } })
        const { colorPageIndices, grayscalePageIndices, pageColorStatsByPage, darkPageIndices, blurryPageIndices } =
          await analyzePdfPageColors(manuscript, {
            isCancelled: () => cancelRef.current,
            onProgress: (current, total) => {
              dispatch({ type: 'SCAN_UPDATE', scan: { phase: 'analyzing', pagesScanned: current, totalPages: total } })
            },
          })
        if (cancelRef.current) return

        dispatch({
          type: 'SCAN_DATA_READY',
          scanData: {
            widthIn: quick.widthIn,
            heightIn: quick.heightIn,
            pageCount: quick.pageCount,
            firstPageDataUrl,
            pageWidths: quick.pages.map((p) => p.width),
            pageHeights: quick.pages.map((p) => p.height),
            pageBoxes: toDebugBoxes(quick.pages),
            blankPageIndices: quick.pages.filter((p) => p.isBlank).map((p) => p.index),
            colorPageIndices,
            grayscalePageIndices,
            pageColorStatsByPage,
            darkPageIndices,
            blurryPageIndices,
            fileSizeMb,
          },
          detected: withValidationConfigHash({ ...detected, pageCount: quick.pageCount }),
        })
        dispatch({ type: 'SCAN_UPDATE', scan: { phase: 'done', pagesScanned: 1, totalPages: 1 } })
      }
    } catch (err) {
      if (!cancelRef.current) {
        dispatch({ type: 'SCAN_UPDATE', scan: { phase: 'error', errorMessage: String(err) } })
      }
    }
  }, [])

  const handleUpload = useCallback(
    (bookType: BookType, files: { cover: File | null; manuscript: File | null }) => {
      analysisRequestRef.current += 1
      dispatch({ type: 'SET_BOOK_TYPE', bookType })
      dispatch({ type: 'SET_FILES', files })
      if (files.manuscript) startScan(files.manuscript, bookType)
    },
    [startScan]
  )

  // ── Compute issues (after user confirms settings) ────────────────────────

  const computeIssues = useCallback(
    async (confirmed: KRDetectedSettings) => {
      const scanData = state.scanData
      const manuscript = state.files.manuscript
      if (!scanData || !manuscript) return
      const requestId = ++analysisRequestRef.current
      const configSnapshot = withValidationConfigHash({
        ...confirmed,
        configSource: 'user',
        configLocked: true,
        lastUpdated: Date.now(),
      })
      const validationConfigHash = configSnapshot.validationConfigHash ?? ''
      const currentFileFingerprint = filesFingerprint(state.files)
      const cacheKey = `${currentFileFingerprint}:${validationConfigHash}`

      dispatch({ type: 'UPDATE_SETTINGS', settings: configSnapshot })
      dispatch({ type: 'START_COMPUTING', requestId, fileFingerprint: currentFileFingerprint, validationConfigHash })

      const trim = TRIM_SIZES[configSnapshot.trimSize]
      // Custom or missing trim dimensions are passed through as zero; the worker
      // skips page-size validation instead of producing "n/a" expected sizes.
      const hasBleed = configSnapshot.bleed === 'bleed'
      const pageBoxes = annotatePageBoxes(scanData.pageBoxes, trim.widthIn, trim.heightIn, hasBleed)
      const worker = workerRef.current
      if (!worker) return

      // Load cover dimensions if a cover file was provided
      const coverFile = state.files.cover
      let coverWidthIn: number | null = null
      let coverHeightIn: number | null = null
      let coverDataUrl: string | null = null
      if (coverFile) {
        try {
          const coverPdf = await loadPDF(coverFile, { maxPages: 1, renderScale: 0.5 })
          if (requestId !== analysisRequestRef.current) return
          coverWidthIn = coverPdf.widthIn
          coverHeightIn = coverPdf.heightIn
          coverDataUrl = coverPdf.pages[0]?.dataUrl ?? null
        } catch {
          // Cover load failure is non-fatal — proceed without cover validation
        }
      }

      const analysisResult = await new Promise<{
        issues: KRIssue[]
        score: number
        verdict: string
        verdictLevel: 'good' | 'caution' | 'danger'
        spineWidthIn: number
        expectedFullWidthIn: number
        expectedFullHeightIn: number
        bleedIn: number
        pageBoxes?: KRPageBoxDebug[]
        checksPerformed?: string[]
        checksSkipped?: KRSkippedCheck[]
        missingMetadata?: string[]
        globalDiagnostics?: KRIssue[]
        internalDiagnostics?: unknown[]
        pageDiagnostics?: Record<number, KRPageDiagnostics>
        ruleVersion?: string
        officialSourcesUsed?: string[]
      }>((resolve, reject) => {
        const handler = (e: MessageEvent) => {
          if (e.data.requestId !== requestId) return
          if (e.data.fileFingerprint !== currentFileFingerprint) return
          if (e.data.validationConfigHash !== validationConfigHash) return
          if (e.data.type === 'ANALYSIS_COMPLETE') {
            worker.removeEventListener('message', handler)
            resolve(e.data.payload)
          } else if (e.data.type === 'ANALYSIS_ERROR') {
            worker.removeEventListener('message', handler)
            reject(new Error(e.data.payload.message))
          }
        }
        worker.addEventListener('message', handler)
        worker.postMessage({
          type: 'ANALYZE',
          requestId,
          fileFingerprint: currentFileFingerprint,
          validationConfigHash,
          configSnapshot,
          payload: {
            bookType: configSnapshot.bookType,
            pageCount: configSnapshot.pageCount,
            widthIn: scanData.widthIn,
            heightIn: scanData.heightIn,
            pageWidths: scanData.pageWidths,
            pageHeights: scanData.pageHeights,
            pageBoxes,
            blankPageIndices: scanData.blankPageIndices,
            confirmedTrimWidthIn: trim.widthIn,
            confirmedTrimHeightIn: trim.heightIn,
            confirmedBleed: configSnapshot.bleed,
            interior: configSnapshot.interior,
            paper: configSnapshot.paper,
            fileSizeMb: scanData.fileSizeMb,
            colorPageIndices: scanData.colorPageIndices,
            grayscalePageIndices: scanData.grayscalePageIndices,
            pageColorStatsByPage: scanData.pageColorStatsByPage,
            darkPageIndices: scanData.darkPageIndices,
            blurryPageIndices: scanData.blurryPageIndices,
            coverWidthIn,
            coverHeightIn,
            hasCover: !!coverFile,
          },
        })
      })
      if (requestId !== analysisRequestRef.current) return

      const colorRisk = buildColorRisk(
        configSnapshot.interior,
        scanData.colorPageIndices,
        scanData.darkPageIndices,
        configSnapshot.pageCount
      )

      // Sample cover quality — flag if artwork appears blurry/low-resolution
      const coverQualityIssues: KRIssue[] = []
      if (coverDataUrl) {
        const { lowSharpness } = await samplePageQuality(coverDataUrl)
        if (requestId !== analysisRequestRef.current) return
        if (lowSharpness) {
          coverQualityIssues.push({
            id: 'cover-low-quality',
            category: 'should-fix',
            fixability: 'auto-fix',
            issueType: 'cover-low-quality',
            scope: 'cover',
            title: 'Cover may print blurry',
            whyMatters:
              'This cover appears to contain low-resolution or heavily compressed artwork. KDP recommends 300 DPI minimum for all cover images.',
            where: 'Entire cover.',
            howToFix:
              'Replace raster images with high-resolution originals and re-export the cover at 300 DPI or higher.',
            pageRefs: [],
          })
        }
      }

      const coverData: KRCoverData | null =
        coverWidthIn && coverHeightIn
          ? {
              widthIn: coverWidthIn,
              heightIn: coverHeightIn,
              dataUrl: coverDataUrl,
              expectedFullWidthIn: analysisResult.expectedFullWidthIn,
              expectedFullHeightIn: analysisResult.expectedFullHeightIn,
              spineWidthIn: analysisResult.spineWidthIn,
              trimWidthIn: trim.widthIn,
              trimHeightIn: trim.heightIn,
              bleedIn: analysisResult.bleedIn,
            }
          : null

      const issues = withFixability([...analysisResult.issues, ...coverQualityIssues])
      const resultPageBoxes = analysisResult.pageBoxes ?? pageBoxes
      if (requestId !== analysisRequestRef.current) return

      dispatch({
        type: 'RESULT_READY',
        requestId,
        fileFingerprint: currentFileFingerprint,
        validationConfigHash,
        result: {
          fileFingerprint: currentFileFingerprint,
          validationConfigHash,
          cacheKey,
          score: analysisResult.score,
          verdict: analysisResult.verdict,
          verdictLevel: analysisResult.verdictLevel,
          issues,
          settings: configSnapshot,
          fileNames: {
            manuscript: manuscript.name,
            cover: coverFile?.name ?? null,
          },
          fileSize: manuscript.size + (coverFile?.size ?? 0),
          fileSizeMb: scanData.fileSizeMb,
          colorRisk,
          spineWidthIn: analysisResult.spineWidthIn ?? null,
          pageBoxes: resultPageBoxes,
          coverData,
          checksPerformed: analysisResult.checksPerformed,
          checksSkipped: analysisResult.checksSkipped,
          missingMetadata: analysisResult.missingMetadata,
          globalDiagnostics: analysisResult.globalDiagnostics,
          internalDiagnostics: analysisResult.internalDiagnostics,
          pageDiagnostics: analysisResult.pageDiagnostics,
          ruleVersion: analysisResult.ruleVersion,
          officialSourcesUsed: analysisResult.officialSourcesUsed,
        },
      })
    },
    [state.scanData, state.files]
  )

  // ── Back to config from fix/review screen ────────────────────────────────

  const handleBackToConfig = useCallback(() => {
    analysisRequestRef.current += 1
    dispatch({ type: 'GO_BACK_TO_CONFIRM' })
  }, [])

  // ── From IssuesStep: go to Fix ───────────────────────────────────────────

  const handleGoFix = useCallback((issueId?: string | null) => {
    dispatch({ type: 'GO_FIX', issueId })
  }, [])

  // ── Config change from drawer in Repair Studio ───────────────────────────

  const handleConfigChange = useCallback(
    (newSettings: KRDetectedSettings) => {
      void computeIssues(newSettings)
    },
    [computeIssues]
  )

  const stableResult = state.result ?? (state.isComputingIssues ? state.lastResult : null)
  const isUploadOrConfirm = state.step === 'upload' || state.step === 'confirm'

  const renderContent = () => (
    <AnimatePresence mode="wait">
      <motion.div
        key={state.step}
        className={state.step === 'confirm' ? 'h-full min-h-0' : undefined}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        {state.step === 'upload' && (
          <UploadStep
            bookType={state.bookType}
            files={state.files}
            previousResult={state.previousResult}
            onStart={handleUpload}
          />
        )}

        {state.step === 'confirm' && state.detectedSettings && (
          <ConfirmStep
            detected={state.detectedSettings}
            scan={state.scan}
            isComputing={state.isComputingIssues}
            files={state.files}
            firstPageDataUrl={state.scanData?.firstPageDataUrl ?? null}
            onConfirm={computeIssues}
            onBack={() => {
              cancelRef.current = true
              analysisRequestRef.current += 1
              dispatch({ type: 'RESET' })
            }}
          />
        )}

        {state.step === 'issues' && state.result && (
          <IssuesStep
            result={state.result}
            previousResult={state.previousResult}
            onGoFix={handleGoFix}
            onReset={() => dispatch({ type: 'RESET' })}
          />
        )}

        {state.step === 'fix' && stableResult && (
          <FixStep
            issues={state.isComputingIssues ? [] : stableResult.issues}
            manuscriptFile={state.files.manuscript}
            coverFile={state.files.cover}
            result={stableResult}
            confirmedSettings={state.confirmedSettings ?? state.detectedSettings ?? stableResult.settings}
            selectedIssueId={state.isComputingIssues ? null : state.selectedIssueId}
            firstPageDataUrl={state.scanData?.firstPageDataUrl ?? null}
            pageBoxes={state.isComputingIssues ? [] : (stableResult.pageBoxes ?? state.scanData?.pageBoxes ?? [])}
            coverData={stableResult.coverData}
            isRevalidating={state.isComputingIssues}
            files={state.files}
            onBackToConfig={handleBackToConfig}
            onConfigChange={handleConfigChange}
            onBack={() => dispatch({ type: 'GO_FIX', issueId: state.selectedIssueId })}
          />
        )}
      </motion.div>
    </AnimatePresence>
  )

  return (
    <>
      <AlertDialog open={showReloadDialog} onOpenChange={setShowReloadDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave Repair Studio?</AlertDialogTitle>
            <AlertDialogDescription>
              Your current fixes and progress will be lost. You will be taken back to the import screen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay on this page</AlertDialogCancel>
            <AlertDialogAction onClick={() => { setShowReloadDialog(false); dispatch({ type: 'RESET' }) }}>
              Go to Import
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {isUploadOrConfirm ? (
        <AppWorkspaceShell
          activeNav="preflight"
          activeStep="preflight"
          title="Preflight Report"
          subtitle="Check your files against KDP print rules before upload."
          lockScroll={state.step === 'confirm'}
        >
          {renderContent()}
        </AppWorkspaceShell>
      ) : (
        <div className="fixed inset-0 z-100 h-dvh overflow-hidden bg-[#eef2f7]">
          {renderContent()}
        </div>
      )}
    </>
  )
}
