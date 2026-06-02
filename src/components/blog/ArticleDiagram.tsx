import { BleedLayers, MissingBleed, ForgotBleedComparison, WhiteEdgeSimulation, EdgeToEdgeCorrect, IncorrectTrimExample, CanvaBleedWorkflow, SafeAreaBleedMap, BlackPageTrimExample, CorrectExportSetup, EdgeArtSafety, BleedChoiceComparison, NoBleedMarginPage, BookTypeBleedGrid, ColoringBookBleedExample, JournalNoBleedExample, PaperbackCoverBleedMap, CanvaBleedNoBleed, BleedDecisionFlow, TrimResultComparison, CorrectEdgeExtension, BackgroundExtensionTrim, WhiteEdgeBackground, TrimToleranceShift, OversizedPrintSheet, BlackBackgroundBleed, BorderBackgroundRisk, CanvaBackgroundBleed, BleedSafeLayout, CorrectEdgeBackground, TrimEdgeOnlySetup } from './diagrams/bleed-trim-diagrams';
import { PrintableAreaError, ChecklistDiagram, SpineWidth, SafeArea, PdfChecklist, CanvaFlow, PhotoshopGuides, TrimComparison, CoverAnatomy, HardcoverLayout, BarcodeZoneWrap, BarcodeWrongCorrect, CanvaBarcodeLayout, BackCoverComposition, BarcodeSafeUnsafe, CroppedBleedTrimSafe, CroppedTextExample, CorrectSpacingExample, CanvaCropUnsafe, ThinBorderTrim, BlackCoverTrimIllusion, CorrectFullBleed, EdgeSpacingComparison } from './diagrams/cover-anatomy-diagrams';
import { BlurSharpComparison, DPI72vs300, StretchedImage, VectorRasterText, CanvaExportQuality, CompressionDarkCover, ResolutionCheckWorkflow, PixelationExample, SharpCoverExport, InteriorCoverMismatch, TrimMismatchComparison, SpineMismatchDiagram, BleedMismatchOverlay, CanvaWrongSetup, CanvaCorrectWraparound, PdfDimensionCheck, FileAlignmentWorkflow } from './diagrams/resolution-mismatch-diagrams';
import { CoverSafeAreaMap, SafeTextPlacement, UnsafeEdgePlacement, SubtitleTrimSimulation, BorderTrimRisk, CanvaSafeAreaWorkflow, SafeSpacingMeasurement, FullBlackTrimRisk, SafeCoverComposition, EdgeRiskComparison, TrimSafeZoneAnatomy, UnsafeTextPlacementExamples, SafeAreaMistakesGrid, MarginRecommendationLayout, CanvaSafeMarginSteps, BorderTrimShiftComparison, ProfessionalGuideSetup } from './diagrams/safe-area-diagrams';
import { SpineMisalignment, SpineAlignmentAnatomy, SpineCommonMistakes, ThinVsSafeSpine, SpineCenterWorkflow, CanvaSpineAlignment, ProSpineAlignment, PreviewIllusionPrint, GoodVsBadSpine, ScreenVsPrintComparison, RgbVsPrintOutput, BlackPrintComparison, ExportWorkflowBadGood, ColoringBookContrast, MatteGlossyFinish, ColorProofWorkflow } from './diagrams/spine-color-diagrams';
import { LowContentVsRegular, LowContentClassificationFlow, ColoringBookGrayArea, LowContentPrintRiskMap, DigitalVsProofCopy, CheapVsPremiumLayout, ProofCopyIterationFlow, DarkColoringDigitalVsPrint, MatteVsGlossyColoringContrast, PureBlackVsDarkGray, MuddyVsCleanColoringPages } from './diagrams/low-content-diagrams';
import { KdpPreviewPipeline, KdpPdfSizeOptimization, KdpPreviewTroubleshootingFlow, KdpUploadProcessingPipeline, FileSizeByBookType, CanvaBloatExplained, TransparencyFlattenWorkflow, SplitTestMethod } from './diagrams/preview-upload-diagrams';
import { KdpTrimShiftBorderVisualization, ThinVsThickBorderTolerance, CanvaCenteringVsPrintCentering, SafeVsRiskyBorderPositions, SpineWraparoundBorderShift, ProofCopyBorderBeforeAfter, HighRiskBorderLayoutTypes, SaferBorderAlternativesComparison } from './diagrams/border-diagrams';
import { MarginErrorScreenVsKdp, MarginPageAnatomy, MarginSafeBleedComparison, MarginCommonCausesMap, CanvaMarginFixWorkflow, ColoringBookMarginBeforeAfter, GutterMarginExample, CoverMarginRiskMap, MarginTroubleshootingFlow, FinalMarginChecklistDiagram } from './diagrams/margin-error-diagrams';
import { PdfLooksFineRejected, KdpPdfValidationPipeline, PdfRejectionCauseMap, WrongTrimSizePdfExample, PdfBleedErrorBeforeAfter, PdfSafeAreaCorrection, FontEmbeddingProblem, TransparencyLayerRejection, PdfRejectionTroubleshootingFlow, PdfRejectionPreventionChecklist } from './diagrams/pdf-rejection-diagrams';
import { UploadProcessFailurePoints, UploadFailedVsRejected, UploadFailureCauseMap, LargePdfUploadProblem, FilenameProblemExample, BrowserUploadTroubleshooting, ColoringBookUploadIssues, UploadTroubleshootingFlowchart, UploadChecklistDiagram } from './diagrams/upload-failure-diagrams';
import { PdfRequirementsValidationPipeline, ManuscriptPdfRequirementsMap, CoverPdfRequirementsMap, TrimSizeRequirementComparison, BleedRequirementComparison, SafeAreaRequirementExample, ImageResolutionRequirement, FontEmbeddingRequirement, ColorPrintRequirement, FileSizeRequirement, ColoringBookPdfRequirement, CommonPdfMistakesMap, PdfValidationWorkflow, UltimatePdfChecklistDiagram } from './diagrams/pdf-requirements-diagrams';
import { PublishingWorkflowDiagram, ManuscriptChecklistDiagram, CoverChecklistDiagram, PdfValidationChecklistDiagram, MetadataChecklistDiagram, KeywordResearchDiagram, CategorySelectionDiagram, PricingChecklistDiagram, PreviewerChecklistDiagram, ColoringBookPublishingChecklistDiagram, BeginnerMistakesMap, UltimatePublishChecklistDiagram } from './diagrams/publishing-checklist-diagrams';
import { CoverTemplateAnatomyDiagram, TemplateGenerationProcessDiagram, FrontCoverTemplateGuide, BackCoverTemplateGuide, SpineWidthTemplateGuide, CoverBleedTemplateGuide, CoverSafeAreaTemplateGuide, BarcodeAreaTemplateGuide, CoverTemplateMistakesMap, ColoringBookCoverTemplateGuide, UltimateCoverTemplateChecklist } from './diagrams/cover-template-diagrams';
import { PrintLabHeroScene, PreviewGenerationMachine, MarginInspectionStation, BleedTestingChamber, SafeAreaScannerLab, BlankPageDetectorLab, CoverAlignmentTestRig, PreviewerFailureInvestigationRoom, DigitalVsPhysicalLab, FinalApprovalRoom } from './diagrams/print-previewer-lab-diagrams';

export type ArticleDiagramType =
  | 'bleed-layers'
  | 'printable-area-error'
  | 'cover-rejection-checklist'
  | 'missing-bleed-before-after'
  | 'spine-width'
  | 'spine-misalignment'
  | 'safe-area'
  | 'pdf-export-checklist'
  | 'canva-export-flow'
  | 'photoshop-guides'
  | 'trim-size-comparison'
  | 'cover-anatomy'
  | 'hardcover-cover-layout'
  | 'barcode-zone-wrap'
  | 'barcode-wrong-correct'
  | 'canva-barcode-layout'
  | 'back-cover-composition'
  | 'barcode-safe-unsafe'
  | 'cropped-bleed-trim-safe'
  | 'cropped-text-example'
  | 'correct-spacing-example'
  | 'canva-crop-unsafe'
  | 'thin-border-trim'
  | 'black-cover-trim-illusion'
  | 'correct-full-bleed'
  | 'edge-spacing-comparison'
  | 'blur-sharp-comparison'
  | 'dpi-72-vs-300'
  | 'stretched-image'
  | 'vector-raster-text'
  | 'canva-export-quality'
  | 'compression-dark-cover'
  | 'resolution-check-workflow'
  | 'pixelation-example'
  | 'sharp-cover-export'
  | 'interior-cover-mismatch'
  | 'trim-mismatch-comparison'
  | 'spine-mismatch'
  | 'bleed-mismatch-overlay'
  | 'canva-wrong-setup'
  | 'canva-correct-wraparound'
  | 'pdf-dimension-check'
  | 'file-alignment-workflow'
  | 'forgot-bleed-comparison'
  | 'white-edge-simulation'
  | 'edge-to-edge-correct'
  | 'incorrect-trim-example'
  | 'canva-bleed-workflow'
  | 'safe-area-bleed-map'
  | 'black-page-trim-example'
  | 'correct-export-setup'
  | 'edge-art-safety'
  | 'bleed-choice-comparison'
  | 'no-bleed-margin-page'
  | 'book-type-bleed-grid'
  | 'coloring-book-bleed-example'
  | 'journal-no-bleed-example'
  | 'paperback-cover-bleed-map'
  | 'canva-bleed-no-bleed'
  | 'bleed-decision-flow'
  | 'trim-result-comparison'
  | 'correct-edge-extension'
  | 'cover-safe-area-map'
  | 'safe-text-placement'
  | 'unsafe-edge-placement'
  | 'subtitle-trim-simulation'
  | 'border-trim-risk'
  | 'canva-safe-area-workflow'
  | 'safe-spacing-measurement'
  | 'full-black-trim-risk'
  | 'safe-cover-composition'
  | 'edge-risk-comparison'
  | 'background-extension-trim'
  | 'white-edge-background'
  | 'trim-tolerance-shift'
  | 'oversized-print-sheet'
  | 'black-background-bleed'
  | 'border-background-risk'
  | 'canva-background-bleed'
  | 'bleed-safe-layout'
  | 'correct-edge-background'
  | 'trim-edge-only-setup'
  | 'spine-alignment-anatomy'
  | 'spine-common-mistakes'
  | 'thin-vs-safe-spine'
  | 'spine-center-workflow'
  | 'canva-spine-alignment'
  | 'pro-spine-alignment'
  | 'preview-illusion-print'
  | 'good-vs-bad-spine'
  | 'screen-vs-print-comparison'
  | 'rgb-vs-print-output'
  | 'black-print-comparison'
  | 'export-workflow-bad-good'
  | 'coloring-book-contrast'
  | 'matte-glossy-finish'
  | 'color-proof-workflow'
  | 'trim-safe-zone-anatomy'
  | 'unsafe-text-placement-examples'
  | 'safe-area-mistakes-grid'
  | 'margin-recommendation-layout'
  | 'canva-safe-margin-steps'
  | 'border-trim-shift-comparison'
  | 'professional-guide-setup'
  | 'low-content-vs-regular'
  | 'low-content-classification-flow'
  | 'coloring-book-gray-area'
  | 'low-content-print-risk-map'
  | 'digital-vs-proof-copy'
  | 'cheap-vs-premium-layout'
  | 'proof-copy-iteration-flow'
  | 'dark-coloring-digital-vs-print'
  | 'matte-vs-glossy-coloring-contrast'
  | 'pure-black-vs-dark-gray'
  | 'muddy-vs-clean-coloring-pages'
  | 'kdp-preview-pipeline'
  | 'kdp-pdf-size-optimization'
  | 'kdp-preview-troubleshooting-flow'
  | 'kdp-upload-processing-pipeline'
  | 'file-size-by-book-type'
  | 'canva-bloat-explained'
  | 'transparency-flatten-workflow'
  | 'split-test-method'
  | 'kdp-trim-shift-border-visualization'
  | 'thin-vs-thick-border-tolerance'
  | 'canva-centering-vs-print-centering'
  | 'safe-vs-risky-border-positions'
  | 'spine-wraparound-border-shift'
  | 'proof-copy-border-before-after'
  | 'high-risk-border-layout-types'
  | 'safer-border-alternatives-comparison'
  | 'margin-error-screen-vs-kdp'
  | 'margin-page-anatomy'
  | 'margin-safe-bleed-comparison'
  | 'margin-common-causes-map'
  | 'canva-margin-fix-workflow'
  | 'coloring-book-margin-before-after'
  | 'gutter-margin-example'
  | 'cover-margin-risk-map'
  | 'margin-troubleshooting-flow'
  | 'final-margin-checklist'
  | 'pdf-looks-fine-rejected'
  | 'kdp-pdf-validation-pipeline'
  | 'pdf-rejection-cause-map'
  | 'wrong-trim-size-pdf-example'
  | 'pdf-bleed-error-before-after'
  | 'pdf-safe-area-correction'
  | 'font-embedding-problem'
  | 'transparency-layer-rejection'
  | 'pdf-rejection-troubleshooting-flow'
  | 'pdf-rejection-prevention-checklist'
  | 'upload-process-failure-points'
  | 'upload-failed-vs-rejected'
  | 'upload-failure-cause-map'
  | 'large-pdf-upload-problem'
  | 'filename-problem-example'
  | 'browser-upload-troubleshooting'
  | 'coloring-book-upload-issues'
  | 'upload-troubleshooting-flowchart'
  | 'upload-checklist'
  | 'pdf-requirements-validation-pipeline'
  | 'manuscript-pdf-requirements-map'
  | 'cover-pdf-requirements-map'
  | 'trim-size-requirement-comparison'
  | 'bleed-requirement-comparison'
  | 'safe-area-requirement-example'
  | 'image-resolution-requirement'
  | 'font-embedding-requirement'
  | 'color-print-requirement'
  | 'file-size-requirement'
  | 'coloring-book-pdf-requirement'
  | 'common-pdf-mistakes-map'
  | 'pdf-validation-workflow'
  | 'ultimate-pdf-checklist'
  | 'publishing-workflow-diagram'
  | 'manuscript-checklist-diagram'
  | 'cover-checklist-diagram'
  | 'pdf-validation-checklist-diagram'
  | 'metadata-checklist-diagram'
  | 'keyword-research-diagram'
  | 'category-selection-diagram'
  | 'pricing-checklist-diagram'
  | 'previewer-checklist-diagram'
  | 'coloring-book-publishing-checklist-diagram'
  | 'beginner-mistakes-map'
  | 'ultimate-publish-checklist-diagram'
  | 'cover-template-anatomy-diagram'
  | 'template-generation-process-diagram'
  | 'front-cover-template-guide'
  | 'back-cover-template-guide'
  | 'spine-width-template-guide'
  | 'cover-bleed-template-guide'
  | 'cover-safe-area-template-guide'
  | 'barcode-area-template-guide'
  | 'cover-template-mistakes-map'
  | 'coloring-book-cover-template-guide'
  | 'ultimate-cover-template-checklist'
  | 'print-lab-hero-scene'
  | 'preview-generation-machine'
  | 'margin-inspection-station'
  | 'bleed-testing-chamber'
  | 'safe-area-scanner-lab'
  | 'blank-page-detector-lab'
  | 'cover-alignment-test-rig'
  | 'previewer-failure-investigation-room'
  | 'digital-vs-physical-lab'
  | 'final-approval-room';

export type ArticleDiagramProps = {
  type: ArticleDiagramType;
  caption?: string;
};

const captions: Record<ArticleDiagramType, string> = {
  'bleed-layers': 'Bleed extends beyond trim; safe area sits inside trim for important content.',
  'printable-area-error': 'Objects near trim or outside safe area are common printable area warning triggers.',
  'cover-rejection-checklist': 'A pre-upload checklist catches the technical issues that often cause cover rejection.',
  'missing-bleed-before-after': 'Extend edge artwork into bleed without moving important content outward.',
  'spine-width': 'A full cover wrap combines back cover, calculated spine, front cover, and bleed.',
  'spine-misalignment': 'Small shifts become obvious when spine text is too close to fold edges.',
  'safe-area': 'Titles, logos, subtitles, and barcode-adjacent content should stay inside safe boundaries.',
  'pdf-export-checklist': 'The exported PDF should preserve dimensions, fonts, image quality, and bleed.',
  'canva-export-flow': 'Canva covers need correct custom size, visible bleed, PDF Print export, and validation.',
  'photoshop-guides': 'Photoshop cover files need manual guides for bleed, trim, safe area, and spine.',
  'trim-size-comparison': 'Trim size changes the physical book, manuscript layout, and full cover wrap.',
  'cover-anatomy': 'A print cover is a production layout: back cover, spine, front cover, bleed, and safe areas.',
  'hardcover-cover-layout': 'Hardcover covers add wrap and hinge zones around the spine and boards.',
  'barcode-zone-wrap': 'The KDP barcode zone sits on the lower-right of the back cover and should stay clear.',
  'barcode-wrong-correct': 'Move text, logos, QR codes, and decorative frames away from the barcode area.',
  'canva-barcode-layout': 'Use the KDP template as a locked guide layer in Canva, then design around the barcode box.',
  'back-cover-composition': 'A balanced back cover keeps blurbs and calls to action above the reserved barcode zone.',
  'barcode-safe-unsafe': 'Subtle backgrounds can sit behind the barcode; important content should not.',
  'cropped-bleed-trim-safe': 'KDP Previewer shows the trim result: bleed may be cut away, while safe-area content stays protected.',
  'cropped-text-example': 'Text placed in the trim-risk zone can appear cropped even when the PDF uploaded successfully.',
  'correct-spacing-example': 'Move subtitles, author names, and logos inward so trim variation does not cut them off.',
  'canva-crop-unsafe': 'A Canva design can look fine on canvas while important elements sit outside the safe area.',
  'thin-border-trim': 'Thin edge borders make normal print trim shifts look like alignment problems.',
  'black-cover-trim-illusion': 'Dark covers exaggerate tiny trim movement and can make the preview look cropped or shifted.',
  'correct-full-bleed': 'A correct full-bleed cover extends background art outward while keeping important content inside safe area.',
  'edge-spacing-comparison': 'Use extra spacing near edges; avoid placing text directly beside the trim line.',
  'blur-sharp-comparison': 'A low-resolution source produces a blurry cover; a 300 DPI file produces a sharp, print-ready result.',
  'dpi-72-vs-300': 'At 72 DPI each inch holds few coarse pixels; at 300 DPI the same inch holds fine, dense detail.',
  'stretched-image': 'Stretching a small file to fill a large cover spreads the existing pixels further apart, making pixelation visible.',
  'vector-raster-text': 'Vector text stays crisp at any print size; rasterized text becomes blurry when resolution is insufficient.',
  'canva-export-quality': 'PDF Print preserves full image quality; Standard PDF applies compression that can cause blurry KDP results.',
  'compression-dark-cover': 'JPEG compression artifacts appear as faint blocks or banding on dark and solid-black covers.',
  'resolution-check-workflow': 'Check image resolution, verify document DPI, replace low-quality assets, export as PDF Print, then inspect the PDF.',
  'pixelation-example': 'Zooming into a low-resolution KDP cover reveals large visible pixels in image and text areas.',
  'sharp-cover-export': 'A print-ready KDP cover starts with a high-resolution source, 300 DPI document, PDF Print export, and a final PDF check.',
  'interior-cover-mismatch': 'KDP compares interior and cover dimensions together; a size difference on either side triggers a mismatch warning.',
  'trim-mismatch-comparison': 'A cover designed for one trim size will never pass validation when paired with an interior at a different trim size.',
  'spine-mismatch': 'Spine width is calculated from page count; adding or removing pages after cover design causes a spine width mismatch.',
  'bleed-mismatch-overlay': 'The cover PDF must be 0.25 inches taller and wider than trim to include the required 0.125-inch bleed on each outside edge.',
  'canva-wrong-setup': 'A Canva canvas sized only for the front panel cannot pass KDP validation — the full back, spine, and front must be included.',
  'canva-correct-wraparound': 'A correct Canva paperback cover uses full-wrap dimensions: back trim width + spine + front trim width + 0.25 inches bleed.',
  'pdf-dimension-check': 'Check cover PDF page dimensions in document properties and compare against the KDP-specified full wrap size before uploading.',
  'file-alignment-workflow': 'Finish the manuscript before starting the cover — locking page count first prevents the most common mismatch errors.',
  'forgot-bleed-comparison': 'With bleed, artwork extends past trim; without bleed, the cut can expose paper or crop edge artwork.',
  'white-edge-simulation': 'A tiny trim shift can reveal white paper when the background stops exactly at the trim line.',
  'edge-to-edge-correct': 'Correct edge-to-edge artwork sends background into bleed while keeping text inside the safe area.',
  'incorrect-trim-example': 'Full-page artwork becomes unsafe when the file is exported as no bleed but content reaches the edge.',
  'canva-bleed-workflow': 'In Canva, extend backgrounds beyond the bleed guides and export as PDF Print before uploading to KDP.',
  'safe-area-bleed-map': 'Bleed, trim, and safe area are separate zones; each one protects a different print-production risk.',
  'black-page-trim-example': 'Full-black pages make small trim variation easier to see because any exposed paper becomes high contrast.',
  'correct-export-setup': 'The final export should include correct page dimensions, bleed enabled where needed, and no extra crop marks.',
  'edge-art-safety': 'Decorative edge art can bleed outward, but readable or important content should stay well inside safe margins.',
  'bleed-choice-comparison': 'Bleed extends artwork past trim for edge-to-edge printing; no bleed keeps content inside intentional margins.',
  'no-bleed-margin-page': 'A no-bleed page keeps white margins visible and protects text from trim variation.',
  'book-type-bleed-grid': 'Different book types call for different bleed choices depending on whether artwork reaches the edge.',
  'coloring-book-bleed-example': 'Coloring books often need bleed when illustrations, borders, or dark backgrounds touch the page edge.',
  'journal-no-bleed-example': 'Journals usually work better with no bleed because writing space benefits from clean inside margins.',
  'paperback-cover-bleed-map': 'A paperback cover uses bleed around the outside of the full wrap while important content stays inside safe areas.',
  'canva-bleed-no-bleed': 'Canva files need different setup habits depending on whether the KDP project uses bleed or no bleed.',
  'bleed-decision-flow': 'Choose bleed only when printed artwork needs to reach the physical page edge.',
  'trim-result-comparison': 'The printed result changes when trim variation meets full-bleed art versus intentional white margins.',
  'correct-edge-extension': 'Correct full-bleed setup extends only expendable background art outward, not important text.',
  'cover-safe-area-map': 'Bleed, trim, and safe area protect different parts of a KDP cover layout.',
  'safe-text-placement': 'Important cover text stays comfortably inside the safe area, away from trim movement.',
  'unsafe-edge-placement': 'Text near the trim edge can be clipped or flagged even when it looks fine on screen.',
  'subtitle-trim-simulation': 'Small subtitles placed low on the front cover are vulnerable to normal trim variation.',
  'border-trim-risk': 'Thin borders near the edge make small print shifts look like visible alignment errors.',
  'canva-safe-area-workflow': 'Canva layouts need visible guides, inward text placement, and a final PDF check.',
  'safe-spacing-measurement': 'A practical safety margin gives trim variation room without threatening readable content.',
  'full-black-trim-risk': 'Dark covers make tiny trim shifts and exposed paper edges easier to notice.',
  'safe-cover-composition': 'A safe composition keeps hierarchy centered inside the protected content zone.',
  'edge-risk-comparison': 'Edge-heavy layouts create more risk than balanced layouts with generous spacing.',
  'background-extension-trim': 'Background art extends beyond trim so the cut lands on printed color.',
  'white-edge-background': 'When background stops at trim, a small cutting shift can reveal white paper.',
  'trim-tolerance-shift': 'Bleed absorbs normal trim tolerance while protected content stays inward.',
  'oversized-print-sheet': 'KDP print files include extra artwork around the final trimmed book size.',
  'black-background-bleed': 'Full-black backgrounds need bleed because white paper edges are high contrast.',
  'border-background-risk': 'Thin edge borders reveal trim variation faster than forgiving background art.',
  'canva-background-bleed': 'Canva backgrounds must pass the bleed guide before PDF Print export.',
  'bleed-safe-layout': 'Bleed, trim, and safe area work together: background outward, text inward.',
  'correct-edge-background': 'A correct edge-to-edge background continues through the bleed zone.',
  'trim-edge-only-setup': 'A trim-edge-only background has no spare artwork for trimming movement.',
  'spine-alignment-anatomy': 'A centered KDP spine layout depends on the exact spine width, folds, safe area, and trim edges.',
  'spine-common-mistakes': 'Most spine text problems come from thin spines, wrong templates, unsafe margins, and export scaling.',
  'thin-vs-safe-spine': 'Very thin spines leave little room for readable text; wider spines allow safer padding.',
  'spine-center-workflow': 'Find the spine center from the exact template, then keep the text group inside the spine safe area.',
  'canva-spine-alignment': 'Canva spine text should be centered with guides and verified after PDF Print export.',
  'pro-spine-alignment': 'Professional design tools reduce alignment risk when coordinates, guides, and transform values are checked.',
  'preview-illusion-print': 'KDP Previewer can make a correctly measured spine look slightly shifted because it simulates folds and screen rendering.',
  'good-vs-bad-spine': 'Good spine design uses centered text, strong contrast, and generous padding away from fold edges.',
  'screen-vs-print-comparison': 'Screens emit light and show vivid colors; printed covers reflect light and appear softer, darker, and less saturated.',
  'rgb-vs-print-output': 'RGB can display colors that print inks cannot reproduce — neon and highly saturated tones shift the most.',
  'black-print-comparison': 'Screen black looks deeper because of backlighting; printed black on matte paper appears softer and less rich.',
  'export-workflow-bad-good': 'A correct Canva export uses PDF Print, high-resolution assets, and the exact KDP cover dimensions.',
  'coloring-book-contrast': 'High-contrast coloring book covers remain readable in print; low-contrast designs collapse into muddy thumbnails.',
  'matte-glossy-finish': 'Matte laminate softens colors and reduces blacks; glossy laminate adds saturation and makes dark covers richer.',
  'color-proof-workflow': 'A reliable color test workflow: review at reduced brightness, check grayscale contrast, then order a physical proof.',
  'trim-safe-zone-anatomy': 'Three production zones: bleed extends artwork outward, trim marks the final cut, and safe area protects important content inward.',
  'unsafe-text-placement-examples': 'Text near top trim, subtitle near bottom edge, border touching trim, and corner logos are the most common unsafe placements.',
  'safe-area-mistakes-grid': 'The six most common safe area mistakes that cause KDP cover warnings and poor printed results.',
  'margin-recommendation-layout': 'Keep all important content at least 0.25 inches inside the trim line — more for small text, subtitles, and bottom-edge elements.',
  'canva-safe-margin-steps': 'Eight Canva steps to fix unsafe text placement: guides, template, identify, move, check corners, group, export PDF Print, verify.',
  'border-trim-shift-comparison': 'A centered border looks even in the file but becomes visually uneven after a small trim shift during physical printing.',
  'professional-guide-setup': 'Professional cover files use locked guide layers for bleed, trim, safe area, spine, and barcode zone during the entire design process.',
  'low-content-vs-regular': 'Low-content books are classified by how the interior is used; the label affects ISBN and distribution options, not the value of the book.',
  'low-content-classification-flow': 'KDP uses the low-content classification to organize print workflows, ISBN options, metadata, and marketplace handling.',
  'coloring-book-gray-area': 'Coloring books can sit between low content and activity books depending on originality, instruction, written content, and interior complexity.',
  'low-content-print-risk-map': 'Low-content interiors often repeat borders, lines, and full-page artwork, which makes trim, bleed, export, and resolution mistakes more visible.',
  'digital-vs-proof-copy': 'Digital PDFs glow on screen; proof copies reveal paper absorption, trim movement, resolution, and contrast limits.',
  'cheap-vs-premium-layout': 'Premium KDP layouts usually use calmer spacing, stronger hierarchy, fewer edge borders, and cleaner contrast.',
  'proof-copy-iteration-flow': 'Professional proofing is iterative: inspect the physical copy, adjust the file, export again, and order a new proof when needed.',
  'dark-coloring-digital-vs-print': 'Black-background coloring pages look brighter on screens than they do after ink, paper absorption, and matte finish reduce contrast.',
  'matte-vs-glossy-coloring-contrast': 'Matte finish softens contrast, while glossier surfaces can preserve more perceived depth but may not fit every coloring-book use case.',
  'pure-black-vs-dark-gray': 'Dark charcoal can preserve separation in print better than large areas of pure black.',
  'muddy-vs-clean-coloring-pages': 'Print-safe coloring pages use clearer value separation, readable numbers, and fewer muddy midtones.',
  'kdp-preview-pipeline': 'KDP must upload, analyze, rasterize, and render your files before the Previewer can open.',
  'kdp-pdf-size-optimization': 'Oversized image-heavy PDFs can freeze preview; optimized print PDFs keep quality while reducing processing load.',
  'kdp-preview-troubleshooting-flow': 'A reliable Previewer troubleshooting sequence starts with browser checks, then isolates PDF and layout issues.',
  'kdp-upload-processing-pipeline': 'Image-heavy PDFs stall at the rasterize and render stages — reducing file weight keeps every processing step moving.',
  'file-size-by-book-type': 'Recommended file size ranges vary by book type. Larger files can still succeed if optimized; these ranges signal when to inspect.',
  'canva-bloat-explained': 'Stacked transparent layers, oversized PNGs, and repeated backgrounds multiply across pages, making Canva PDFs unexpectedly heavy.',
  'transparency-flatten-workflow': 'Flattening merges live layers into a single resolved image, removing the rendering work KDP would otherwise do during processing.',
  'split-test-method': 'Upload small page ranges to bisect the manuscript and locate the exact page or asset causing the upload to stall.',
  'kdp-trim-shift-border-visualization': 'A perfectly centered PDF border becomes visually uneven after a small physical trim shift during printing.',
  'thin-vs-thick-border-tolerance': 'Thin borders amplify the same trim shift into obvious imbalance; thick borders absorb the movement proportionally.',
  'canva-centering-vs-print-centering': 'Canva centers borders with mathematical precision on a digital canvas that cannot predict where the physical cutter will land.',
  'safe-vs-risky-border-positions': 'Borders inside the safe area are at high risk of imbalance; borders moved well inward survive trim movement without looking crooked.',
  'spine-wraparound-border-shift': 'A wraparound border crossing the spine fold can appear misaligned when the physical fold position differs from the calculated spine width.',
  'proof-copy-border-before-after': 'Moving a thin border inward and increasing its weight produces a balanced result on the physical proof copy.',
  'high-risk-border-layout-types': 'Layouts with thin full-perimeter frames, mirrored elements, and edge-hugging geometry are the most likely to print unevenly.',
  'safer-border-alternatives-comparison': 'Faded gradients, shadow framing, thick interior panels, and partial frames communicate visual containment without depending on precise trim alignment.',
  'margin-error-screen-vs-kdp': 'A PDF can look centered on screen while KDP flags content that sits too close to the physical trim edge.',
  'margin-page-anatomy': 'Margin errors are easier to fix when you separate bleed, trim, safe area, margin, and gutter.',
  'margin-safe-bleed-comparison': 'Margin, safe-area, and bleed warnings describe different print-production risks.',
  'margin-common-causes-map': 'The same KDP margin warning can come from trim size, page numbers, borders, gutter, bleed, or hidden objects.',
  'canva-margin-fix-workflow': 'In Canva, fix margin warnings by checking size, adding guides, moving text inward, and exporting PDF Print.',
  'coloring-book-margin-before-after': 'Coloring book borders should move inward so normal trimming does not make them uneven or clipped.',
  'gutter-margin-example': 'Thick books need extra gutter space because binding hides content near the spine.',
  'cover-margin-risk-map': 'Cover margin problems often involve spine text, barcode space, safe areas, and trim-edge placement.',
  'margin-troubleshooting-flow': 'A reliable troubleshooting path checks page size, trim, bleed, safe area, gutter, export, and upload.',
  'final-margin-checklist': 'Verify the final PDF before upload: dimensions, bleed, safe area, gutter, page numbers, and export settings.',
  'pdf-looks-fine-rejected': 'A PDF can open normally in a viewer while failing KDP print validation.',
  'kdp-pdf-validation-pipeline': 'KDP runs upload, automated validation, preview generation, print checks, and review before a file is approved.',
  'pdf-rejection-cause-map': 'Most KDP PDF rejections trace back to trim, bleed, safe area, resolution, fonts, transparency, file size, or barcode conflicts.',
  'wrong-trim-size-pdf-example': 'A PDF built for the wrong trim size can fail even when the design appears centered.',
  'pdf-bleed-error-before-after': 'Bleed errors are fixed by extending background artwork outward while keeping important content inward.',
  'pdf-safe-area-correction': 'Safe-area rejection is fixed by moving important text and graphics away from trim edges.',
  'font-embedding-problem': 'Embedding fonts keeps typography available to KDP during validation, preview generation, and print processing.',
  'transparency-layer-rejection': 'Flattening complex transparency and hidden layers can make the upload PDF easier for KDP to process.',
  'pdf-rejection-troubleshooting-flow': 'Diagnose repeated PDF rejection in order: trim, bleed, safe area, resolution, fonts, layers, file size, then upload.',
  'pdf-rejection-prevention-checklist': 'A prevention checklist catches the most common KDP PDF rejection risks before upload.',
  'upload-process-failure-points': 'KDP uploads can fail during transfer, storage, validation, preview generation, or review.',
  'upload-failed-vs-rejected': 'Upload failed, Previewer failed, PDF rejected, and approval rejected describe different stages of the KDP workflow.',
  'upload-failure-cause-map': 'Most KDP upload failures trace back to browser state, file size, format, PDF corruption, internet, filename, or KDP settings.',
  'large-pdf-upload-problem': 'Large image-heavy PDFs upload more reliably after assets are optimized at final print size.',
  'filename-problem-example': 'Simple lowercase filenames with hyphens avoid special-character upload problems.',
  'browser-upload-troubleshooting': 'Trying a clean browser session can separate local browser problems from true file problems.',
  'coloring-book-upload-issues': 'Coloring books often fail uploads because repeated full-page artwork creates heavy PDFs.',
  'upload-troubleshooting-flowchart': 'A practical upload troubleshooting sequence checks format, size, filename, browser, PDF, internet, then retries.',
  'upload-checklist': 'A final upload checklist catches simple problems before another KDP upload attempt.',
  'pdf-requirements-validation-pipeline': 'KDP checks file structure, dimensions, bleed, preview generation, print readiness, and review.',
  'manuscript-pdf-requirements-map': 'A manuscript PDF must match trim size, margins, gutter, and page-count expectations.',
  'cover-pdf-requirements-map': 'A cover PDF includes back cover, spine, front cover, bleed, safe areas, and barcode space.',
  'trim-size-requirement-comparison': 'Common trim sizes create different PDF page dimensions and cover-wrap calculations.',
  'bleed-requirement-comparison': 'Bleed is required when artwork reaches the physical edge of the printed page.',
  'safe-area-requirement-example': 'Safe areas keep text, page numbers, logos, and borders away from trim risk.',
  'image-resolution-requirement': 'Print-ready images need enough real pixel detail at final printed size.',
  'font-embedding-requirement': 'Embedded fonts travel with the PDF so KDP can render typography correctly.',
  'color-print-requirement': 'Color and grayscale choices should be checked for predictable print output.',
  'file-size-requirement': 'Optimized PDFs preserve print quality without unnecessary upload and rendering weight.',
  'coloring-book-pdf-requirement': 'Coloring book PDFs need safe line art, correct bleed, and print-friendly borders.',
  'common-pdf-mistakes-map': 'The most common KDP PDF mistakes include wrong size, missing bleed, unsafe content, low DPI, fonts, and old templates.',
  'pdf-validation-workflow': 'A manual validation workflow checks dimensions, bleed, safe area, images, fonts, cover setup, and export.',
  'ultimate-pdf-checklist': 'The final PDF checklist catches trim, bleed, margins, gutter, fonts, images, cover, spine, barcode, and export issues.',
  'publishing-workflow-diagram': 'The KDP publishing process moves from idea to creation, formatting, upload, preview, and publish.',
  'manuscript-checklist-diagram': 'A beginner manuscript checklist covers page count, trim size, margins, gutter, page numbers, and headings.',
  'cover-checklist-diagram': 'A KDP cover checklist verifies full-wrap dimensions, bleed, spine, barcode area, and safe zones.',
  'pdf-validation-checklist-diagram': 'PDF validation checks dimensions, bleed, embedded fonts, image resolution, transparency, and print export settings.',
  'metadata-checklist-diagram': 'Metadata connects the book title, subtitle, description, keywords, categories, and A+ Content.',
  'keyword-research-diagram': 'Beginner keyword research starts with reader phrases, relevance, specificity, and the final keyword slots.',
  'category-selection-diagram': 'Category selection balances relevance, competition, and long-term discoverability.',
  'pricing-checklist-diagram': 'Pricing should account for print cost, royalty, competitor expectations, and profit margin.',
  'previewer-checklist-diagram': 'KDP Previewer should be checked for margins, bleed, blank pages, borders, and spine alignment.',
  'coloring-book-publishing-checklist-diagram': 'Coloring books need special checks for single-sided pages, borders, bleed, black backgrounds, and page count.',
  'beginner-mistakes-map': 'Common beginner KDP mistakes include wrong trim, weak keywords, unsafe margins, wrong price, and skipped proofs.',
  'ultimate-publish-checklist-diagram': 'A final publish checklist covers manuscript, cover, PDF, metadata, keywords, categories, pricing, preview, proof, and publish.',
  'cover-template-anatomy-diagram': 'A KDP cover template maps the back cover, spine, front cover, bleed, safe area, and barcode zone.',
  'template-generation-process-diagram': 'KDP generates each cover template from trim size, page count, paper type, and binding choices.',
  'front-cover-template-guide': 'The front cover area should keep title, subtitle, and focal artwork inside protected zones.',
  'back-cover-template-guide': 'The back cover area needs readable marketing copy, spacing, and a clear barcode zone.',
  'spine-width-template-guide': 'Spine width changes with page count and determines whether spine text can fit safely.',
  'cover-bleed-template-guide': 'Cover backgrounds must extend into bleed to avoid white edges after trimming.',
  'cover-safe-area-template-guide': 'Safe area keeps title, subtitle, logos, and decorative elements away from trim risk.',
  'barcode-area-template-guide': 'The barcode area must stay clear so Amazon can place or scan the barcode properly.',
  'cover-template-mistakes-map': 'Common template mistakes include wrong spine, missing bleed, barcode overlap, old page count, and text near trim.',
  'coloring-book-cover-template-guide': 'Coloring book covers need large readable titles, strong contrast, and controlled background complexity.',
  'ultimate-cover-template-checklist': 'A final cover template checklist verifies page count, template, bleed, safe area, spine, barcode, and export.',
  'print-lab-hero-scene': 'KDP Print Previewer acts like a digital inspection lab for margins, bleed, page order, and cover alignment.',
  'preview-generation-machine': 'KDP must transform uploaded PDFs into preview pages and print simulation before you can approve them.',
  'margin-inspection-station': 'Margin warnings appear when text, page numbers, or other content sits too close to a print boundary.',
  'bleed-testing-chamber': 'Bleed checks look for edge artwork that extends far enough past trim to avoid white edges.',
  'safe-area-scanner-lab': 'Safe area warnings flag important text or design elements that are too close to trim or fold movement.',
  'blank-page-detector-lab': 'Previewer can reveal accidental blank pages, wrong page order, or unexpected page breaks.',
  'cover-alignment-test-rig': 'Cover preview checks spine, barcode, front cover, back cover, bleed, and overall wrap alignment.',
  'previewer-failure-investigation-room': 'Previewer can fail because of browser state, file size, PDF complexity, or temporary KDP processing issues.',
  'digital-vs-physical-lab': 'Previewer is a digital simulation, while a proof copy reveals physical paper, trim, ink, and binding behavior.',
  'final-approval-room': 'Final approval should happen only after every warning and visible preview issue has been reviewed.',
};

export function ArticleDiagram({ type, caption }: ArticleDiagramProps) {
  return (
    <figure className="my-8 overflow-hidden rounded-2xl border border-border bg-card shadow-card">
      <div className="relative aspect-[16/9] w-full bg-[linear-gradient(90deg,color-mix(in_srgb,var(--foreground)_5%,transparent)_1px,transparent_1px),linear-gradient(0deg,color-mix(in_srgb,var(--foreground)_5%,transparent)_1px,transparent_1px)] bg-[length:28px_28px]">
        <svg
          viewBox="0 0 800 450"
          role="img"
          aria-label={caption ?? captions[type]}
          className="h-full w-full"
        >
          <defs>
            <marker id={`arrow-${type}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0 0l10 5-10 5z" fill="var(--primary)" />
            </marker>
            <filter id={`rough-${type}`} x="-5%" y="-5%" width="110%" height="110%">
              <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="1" seed="8" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.4" />
            </filter>
          </defs>
          <rect width="800" height="450" fill="transparent" />
          <DiagramBody type={type} />
        </svg>
      </div>
      <figcaption className="border-t border-border bg-surface/40 px-5 py-3 text-sm leading-6 text-muted-foreground">
        {caption ?? captions[type]}
      </figcaption>
    </figure>
  );
}

function DiagramBody({ type }: { type: ArticleDiagramType }) {
  if (type === 'bleed-layers') return <BleedLayers />;
  if (type === 'printable-area-error') return <PrintableAreaError />;
  if (type === 'cover-rejection-checklist') return <ChecklistDiagram />;
  if (type === 'missing-bleed-before-after') return <MissingBleed />;
  if (type === 'spine-width') return <SpineWidth />;
  if (type === 'spine-misalignment') return <SpineMisalignment />;
  if (type === 'safe-area') return <SafeArea />;
  if (type === 'pdf-export-checklist') return <PdfChecklist />;
  if (type === 'canva-export-flow') return <CanvaFlow />;
  if (type === 'photoshop-guides') return <PhotoshopGuides />;
  if (type === 'trim-size-comparison') return <TrimComparison />;
  if (type === 'hardcover-cover-layout') return <HardcoverLayout />;
  if (type === 'barcode-zone-wrap') return <BarcodeZoneWrap />;
  if (type === 'barcode-wrong-correct') return <BarcodeWrongCorrect />;
  if (type === 'canva-barcode-layout') return <CanvaBarcodeLayout />;
  if (type === 'back-cover-composition') return <BackCoverComposition />;
  if (type === 'barcode-safe-unsafe') return <BarcodeSafeUnsafe />;
  if (type === 'cropped-bleed-trim-safe') return <CroppedBleedTrimSafe />;
  if (type === 'cropped-text-example') return <CroppedTextExample />;
  if (type === 'correct-spacing-example') return <CorrectSpacingExample />;
  if (type === 'canva-crop-unsafe') return <CanvaCropUnsafe />;
  if (type === 'thin-border-trim') return <ThinBorderTrim />;
  if (type === 'black-cover-trim-illusion') return <BlackCoverTrimIllusion />;
  if (type === 'correct-full-bleed') return <CorrectFullBleed />;
  if (type === 'edge-spacing-comparison') return <EdgeSpacingComparison />;
  if (type === 'blur-sharp-comparison') return <BlurSharpComparison />;
  if (type === 'dpi-72-vs-300') return <DPI72vs300 />;
  if (type === 'stretched-image') return <StretchedImage />;
  if (type === 'vector-raster-text') return <VectorRasterText />;
  if (type === 'canva-export-quality') return <CanvaExportQuality />;
  if (type === 'compression-dark-cover') return <CompressionDarkCover />;
  if (type === 'resolution-check-workflow') return <ResolutionCheckWorkflow />;
  if (type === 'pixelation-example') return <PixelationExample />;
  if (type === 'sharp-cover-export') return <SharpCoverExport />;
  if (type === 'interior-cover-mismatch') return <InteriorCoverMismatch />;
  if (type === 'trim-mismatch-comparison') return <TrimMismatchComparison />;
  if (type === 'spine-mismatch') return <SpineMismatchDiagram />;
  if (type === 'bleed-mismatch-overlay') return <BleedMismatchOverlay />;
  if (type === 'canva-wrong-setup') return <CanvaWrongSetup />;
  if (type === 'canva-correct-wraparound') return <CanvaCorrectWraparound />;
  if (type === 'pdf-dimension-check') return <PdfDimensionCheck />;
  if (type === 'file-alignment-workflow') return <FileAlignmentWorkflow />;
  if (type === 'forgot-bleed-comparison') return <ForgotBleedComparison />;
  if (type === 'white-edge-simulation') return <WhiteEdgeSimulation />;
  if (type === 'edge-to-edge-correct') return <EdgeToEdgeCorrect />;
  if (type === 'incorrect-trim-example') return <IncorrectTrimExample />;
  if (type === 'canva-bleed-workflow') return <CanvaBleedWorkflow />;
  if (type === 'safe-area-bleed-map') return <SafeAreaBleedMap />;
  if (type === 'black-page-trim-example') return <BlackPageTrimExample />;
  if (type === 'correct-export-setup') return <CorrectExportSetup />;
  if (type === 'edge-art-safety') return <EdgeArtSafety />;
  if (type === 'bleed-choice-comparison') return <BleedChoiceComparison />;
  if (type === 'no-bleed-margin-page') return <NoBleedMarginPage />;
  if (type === 'book-type-bleed-grid') return <BookTypeBleedGrid />;
  if (type === 'coloring-book-bleed-example') return <ColoringBookBleedExample />;
  if (type === 'journal-no-bleed-example') return <JournalNoBleedExample />;
  if (type === 'paperback-cover-bleed-map') return <PaperbackCoverBleedMap />;
  if (type === 'canva-bleed-no-bleed') return <CanvaBleedNoBleed />;
  if (type === 'bleed-decision-flow') return <BleedDecisionFlow />;
  if (type === 'trim-result-comparison') return <TrimResultComparison />;
  if (type === 'correct-edge-extension') return <CorrectEdgeExtension />;
  if (type === 'cover-safe-area-map') return <CoverSafeAreaMap />;
  if (type === 'safe-text-placement') return <SafeTextPlacement />;
  if (type === 'unsafe-edge-placement') return <UnsafeEdgePlacement />;
  if (type === 'subtitle-trim-simulation') return <SubtitleTrimSimulation />;
  if (type === 'border-trim-risk') return <BorderTrimRisk />;
  if (type === 'canva-safe-area-workflow') return <CanvaSafeAreaWorkflow />;
  if (type === 'safe-spacing-measurement') return <SafeSpacingMeasurement />;
  if (type === 'full-black-trim-risk') return <FullBlackTrimRisk />;
  if (type === 'safe-cover-composition') return <SafeCoverComposition />;
  if (type === 'edge-risk-comparison') return <EdgeRiskComparison />;
  if (type === 'background-extension-trim') return <BackgroundExtensionTrim />;
  if (type === 'white-edge-background') return <WhiteEdgeBackground />;
  if (type === 'trim-tolerance-shift') return <TrimToleranceShift />;
  if (type === 'oversized-print-sheet') return <OversizedPrintSheet />;
  if (type === 'black-background-bleed') return <BlackBackgroundBleed />;
  if (type === 'border-background-risk') return <BorderBackgroundRisk />;
  if (type === 'canva-background-bleed') return <CanvaBackgroundBleed />;
  if (type === 'bleed-safe-layout') return <BleedSafeLayout />;
  if (type === 'correct-edge-background') return <CorrectEdgeBackground />;
  if (type === 'trim-edge-only-setup') return <TrimEdgeOnlySetup />;
  if (type === 'spine-alignment-anatomy') return <SpineAlignmentAnatomy />;
  if (type === 'spine-common-mistakes') return <SpineCommonMistakes />;
  if (type === 'thin-vs-safe-spine') return <ThinVsSafeSpine />;
  if (type === 'spine-center-workflow') return <SpineCenterWorkflow />;
  if (type === 'canva-spine-alignment') return <CanvaSpineAlignment />;
  if (type === 'pro-spine-alignment') return <ProSpineAlignment />;
  if (type === 'preview-illusion-print') return <PreviewIllusionPrint />;
  if (type === 'good-vs-bad-spine') return <GoodVsBadSpine />;
  if (type === 'screen-vs-print-comparison') return <ScreenVsPrintComparison />;
  if (type === 'rgb-vs-print-output') return <RgbVsPrintOutput />;
  if (type === 'black-print-comparison') return <BlackPrintComparison />;
  if (type === 'export-workflow-bad-good') return <ExportWorkflowBadGood />;
  if (type === 'coloring-book-contrast') return <ColoringBookContrast />;
  if (type === 'matte-glossy-finish') return <MatteGlossyFinish />;
  if (type === 'color-proof-workflow') return <ColorProofWorkflow />;
  if (type === 'trim-safe-zone-anatomy') return <TrimSafeZoneAnatomy />;
  if (type === 'unsafe-text-placement-examples') return <UnsafeTextPlacementExamples />;
  if (type === 'safe-area-mistakes-grid') return <SafeAreaMistakesGrid />;
  if (type === 'margin-recommendation-layout') return <MarginRecommendationLayout />;
  if (type === 'canva-safe-margin-steps') return <CanvaSafeMarginSteps />;
  if (type === 'border-trim-shift-comparison') return <BorderTrimShiftComparison />;
  if (type === 'professional-guide-setup') return <ProfessionalGuideSetup />;
  if (type === 'low-content-vs-regular') return <LowContentVsRegular />;
  if (type === 'low-content-classification-flow') return <LowContentClassificationFlow />;
  if (type === 'coloring-book-gray-area') return <ColoringBookGrayArea />;
  if (type === 'low-content-print-risk-map') return <LowContentPrintRiskMap />;
  if (type === 'digital-vs-proof-copy') return <DigitalVsProofCopy />;
  if (type === 'cheap-vs-premium-layout') return <CheapVsPremiumLayout />;
  if (type === 'proof-copy-iteration-flow') return <ProofCopyIterationFlow />;
  if (type === 'dark-coloring-digital-vs-print') return <DarkColoringDigitalVsPrint />;
  if (type === 'matte-vs-glossy-coloring-contrast') return <MatteVsGlossyColoringContrast />;
  if (type === 'pure-black-vs-dark-gray') return <PureBlackVsDarkGray />;
  if (type === 'muddy-vs-clean-coloring-pages') return <MuddyVsCleanColoringPages />;
  if (type === 'kdp-preview-pipeline') return <KdpPreviewPipeline />;
  if (type === 'kdp-pdf-size-optimization') return <KdpPdfSizeOptimization />;
  if (type === 'kdp-preview-troubleshooting-flow') return <KdpPreviewTroubleshootingFlow />;
  if (type === 'kdp-upload-processing-pipeline') return <KdpUploadProcessingPipeline />;
  if (type === 'file-size-by-book-type') return <FileSizeByBookType />;
  if (type === 'canva-bloat-explained') return <CanvaBloatExplained />;
  if (type === 'transparency-flatten-workflow') return <TransparencyFlattenWorkflow />;
  if (type === 'split-test-method') return <SplitTestMethod />;
  if (type === 'kdp-trim-shift-border-visualization') return <KdpTrimShiftBorderVisualization />;
  if (type === 'thin-vs-thick-border-tolerance') return <ThinVsThickBorderTolerance />;
  if (type === 'canva-centering-vs-print-centering') return <CanvaCenteringVsPrintCentering />;
  if (type === 'safe-vs-risky-border-positions') return <SafeVsRiskyBorderPositions />;
  if (type === 'spine-wraparound-border-shift') return <SpineWraparoundBorderShift />;
  if (type === 'proof-copy-border-before-after') return <ProofCopyBorderBeforeAfter />;
  if (type === 'high-risk-border-layout-types') return <HighRiskBorderLayoutTypes />;
  if (type === 'safer-border-alternatives-comparison') return <SaferBorderAlternativesComparison />;
  if (type === 'margin-error-screen-vs-kdp') return <MarginErrorScreenVsKdp />;
  if (type === 'margin-page-anatomy') return <MarginPageAnatomy />;
  if (type === 'margin-safe-bleed-comparison') return <MarginSafeBleedComparison />;
  if (type === 'margin-common-causes-map') return <MarginCommonCausesMap />;
  if (type === 'canva-margin-fix-workflow') return <CanvaMarginFixWorkflow />;
  if (type === 'coloring-book-margin-before-after') return <ColoringBookMarginBeforeAfter />;
  if (type === 'gutter-margin-example') return <GutterMarginExample />;
  if (type === 'cover-margin-risk-map') return <CoverMarginRiskMap />;
  if (type === 'margin-troubleshooting-flow') return <MarginTroubleshootingFlow />;
  if (type === 'final-margin-checklist') return <FinalMarginChecklistDiagram />;
  if (type === 'pdf-looks-fine-rejected') return <PdfLooksFineRejected />;
  if (type === 'kdp-pdf-validation-pipeline') return <KdpPdfValidationPipeline />;
  if (type === 'pdf-rejection-cause-map') return <PdfRejectionCauseMap />;
  if (type === 'wrong-trim-size-pdf-example') return <WrongTrimSizePdfExample />;
  if (type === 'pdf-bleed-error-before-after') return <PdfBleedErrorBeforeAfter />;
  if (type === 'pdf-safe-area-correction') return <PdfSafeAreaCorrection />;
  if (type === 'font-embedding-problem') return <FontEmbeddingProblem />;
  if (type === 'transparency-layer-rejection') return <TransparencyLayerRejection />;
  if (type === 'pdf-rejection-troubleshooting-flow') return <PdfRejectionTroubleshootingFlow />;
  if (type === 'pdf-rejection-prevention-checklist') return <PdfRejectionPreventionChecklist />;
  if (type === 'upload-process-failure-points') return <UploadProcessFailurePoints />;
  if (type === 'upload-failed-vs-rejected') return <UploadFailedVsRejected />;
  if (type === 'upload-failure-cause-map') return <UploadFailureCauseMap />;
  if (type === 'large-pdf-upload-problem') return <LargePdfUploadProblem />;
  if (type === 'filename-problem-example') return <FilenameProblemExample />;
  if (type === 'browser-upload-troubleshooting') return <BrowserUploadTroubleshooting />;
  if (type === 'coloring-book-upload-issues') return <ColoringBookUploadIssues />;
  if (type === 'upload-troubleshooting-flowchart') return <UploadTroubleshootingFlowchart />;
  if (type === 'upload-checklist') return <UploadChecklistDiagram />;
  if (type === 'pdf-requirements-validation-pipeline') return <PdfRequirementsValidationPipeline />;
  if (type === 'manuscript-pdf-requirements-map') return <ManuscriptPdfRequirementsMap />;
  if (type === 'cover-pdf-requirements-map') return <CoverPdfRequirementsMap />;
  if (type === 'trim-size-requirement-comparison') return <TrimSizeRequirementComparison />;
  if (type === 'bleed-requirement-comparison') return <BleedRequirementComparison />;
  if (type === 'safe-area-requirement-example') return <SafeAreaRequirementExample />;
  if (type === 'image-resolution-requirement') return <ImageResolutionRequirement />;
  if (type === 'font-embedding-requirement') return <FontEmbeddingRequirement />;
  if (type === 'color-print-requirement') return <ColorPrintRequirement />;
  if (type === 'file-size-requirement') return <FileSizeRequirement />;
  if (type === 'coloring-book-pdf-requirement') return <ColoringBookPdfRequirement />;
  if (type === 'common-pdf-mistakes-map') return <CommonPdfMistakesMap />;
  if (type === 'pdf-validation-workflow') return <PdfValidationWorkflow />;
  if (type === 'ultimate-pdf-checklist') return <UltimatePdfChecklistDiagram />;
  if (type === 'publishing-workflow-diagram') return <PublishingWorkflowDiagram />;
  if (type === 'manuscript-checklist-diagram') return <ManuscriptChecklistDiagram />;
  if (type === 'cover-checklist-diagram') return <CoverChecklistDiagram />;
  if (type === 'pdf-validation-checklist-diagram') return <PdfValidationChecklistDiagram />;
  if (type === 'metadata-checklist-diagram') return <MetadataChecklistDiagram />;
  if (type === 'keyword-research-diagram') return <KeywordResearchDiagram />;
  if (type === 'category-selection-diagram') return <CategorySelectionDiagram />;
  if (type === 'pricing-checklist-diagram') return <PricingChecklistDiagram />;
  if (type === 'previewer-checklist-diagram') return <PreviewerChecklistDiagram />;
  if (type === 'coloring-book-publishing-checklist-diagram') return <ColoringBookPublishingChecklistDiagram />;
  if (type === 'beginner-mistakes-map') return <BeginnerMistakesMap />;
  if (type === 'ultimate-publish-checklist-diagram') return <UltimatePublishChecklistDiagram />;
  if (type === 'cover-template-anatomy-diagram') return <CoverTemplateAnatomyDiagram />;
  if (type === 'template-generation-process-diagram') return <TemplateGenerationProcessDiagram />;
  if (type === 'front-cover-template-guide') return <FrontCoverTemplateGuide />;
  if (type === 'back-cover-template-guide') return <BackCoverTemplateGuide />;
  if (type === 'spine-width-template-guide') return <SpineWidthTemplateGuide />;
  if (type === 'cover-bleed-template-guide') return <CoverBleedTemplateGuide />;
  if (type === 'cover-safe-area-template-guide') return <CoverSafeAreaTemplateGuide />;
  if (type === 'barcode-area-template-guide') return <BarcodeAreaTemplateGuide />;
  if (type === 'cover-template-mistakes-map') return <CoverTemplateMistakesMap />;
  if (type === 'coloring-book-cover-template-guide') return <ColoringBookCoverTemplateGuide />;
  if (type === 'ultimate-cover-template-checklist') return <UltimateCoverTemplateChecklist />;
  if (type === 'print-lab-hero-scene') return <PrintLabHeroScene />;
  if (type === 'preview-generation-machine') return <PreviewGenerationMachine />;
  if (type === 'margin-inspection-station') return <MarginInspectionStation />;
  if (type === 'bleed-testing-chamber') return <BleedTestingChamber />;
  if (type === 'safe-area-scanner-lab') return <SafeAreaScannerLab />;
  if (type === 'blank-page-detector-lab') return <BlankPageDetectorLab />;
  if (type === 'cover-alignment-test-rig') return <CoverAlignmentTestRig />;
  if (type === 'previewer-failure-investigation-room') return <PreviewerFailureInvestigationRoom />;
  if (type === 'digital-vs-physical-lab') return <DigitalVsPhysicalLab />;
  if (type === 'final-approval-room') return <FinalApprovalRoom />;
  return <CoverAnatomy />;
}
