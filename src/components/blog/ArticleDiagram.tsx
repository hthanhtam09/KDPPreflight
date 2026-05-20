import type React from 'react';

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
  | 'kdp-preview-pipeline'
  | 'kdp-pdf-size-optimization'
  | 'kdp-preview-troubleshooting-flow'
  | 'kdp-upload-processing-pipeline'
  | 'file-size-by-book-type'
  | 'canva-bloat-explained'
  | 'transparency-flatten-workflow'
  | 'split-test-method';

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
  'kdp-preview-pipeline': 'KDP must upload, analyze, rasterize, and render your files before the Previewer can open.',
  'kdp-pdf-size-optimization': 'Oversized image-heavy PDFs can freeze preview; optimized print PDFs keep quality while reducing processing load.',
  'kdp-preview-troubleshooting-flow': 'A reliable Previewer troubleshooting sequence starts with browser checks, then isolates PDF and layout issues.',
  'kdp-upload-processing-pipeline': 'Image-heavy PDFs stall at the rasterize and render stages — reducing file weight keeps every processing step moving.',
  'file-size-by-book-type': 'Recommended file size ranges vary by book type. Larger files can still succeed if optimized; these ranges signal when to inspect.',
  'canva-bloat-explained': 'Stacked transparent layers, oversized PNGs, and repeated backgrounds multiply across pages, making Canva PDFs unexpectedly heavy.',
  'transparency-flatten-workflow': 'Flattening merges live layers into a single resolved image, removing the rendering work KDP would otherwise do during processing.',
  'split-test-method': 'Upload small page ranges to bisect the manuscript and locate the exact page or asset causing the upload to stall.',
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
  if (type === 'kdp-preview-pipeline') return <KdpPreviewPipeline />;
  if (type === 'kdp-pdf-size-optimization') return <KdpPdfSizeOptimization />;
  if (type === 'kdp-preview-troubleshooting-flow') return <KdpPreviewTroubleshootingFlow />;
  if (type === 'kdp-upload-processing-pipeline') return <KdpUploadProcessingPipeline />;
  if (type === 'file-size-by-book-type') return <FileSizeByBookType />;
  if (type === 'canva-bloat-explained') return <CanvaBloatExplained />;
  if (type === 'transparency-flatten-workflow') return <TransparencyFlattenWorkflow />;
  if (type === 'split-test-method') return <SplitTestMethod />;
  return <CoverAnatomy />;
}

function Label({ x, y, children }: { x: number; y: number; children: React.ReactNode }) {
  return (
    <text x={x} y={y} fill="var(--foreground)" fontSize="18" fontWeight="700">
      {children}
    </text>
  );
}

function MutedLabel({ x, y, children }: { x: number; y: number; children: React.ReactNode }) {
  return (
    <text x={x} y={y} fill="var(--muted-foreground)" fontSize="14" fontWeight="650">
      {children}
    </text>
  );
}

function KdpUploadProcessingPipeline() {
  return (
    <g>
      <text x={400} y={52} textAnchor="middle" fill="var(--foreground)" fontSize={20} fontWeight={950}>Where heavy PDFs stall during KDP processing</text>

      {/* Heavy PDF document */}
      <rect x={52} y={110} width={112} height={148} rx={14} fill="var(--card)" stroke="var(--border)" strokeWidth={2.5} />
      <path d="M140 110l24 24h-24Z" fill="color-mix(in srgb, var(--muted) 55%, transparent)" stroke="var(--border)" strokeWidth={2} />
      <rect x={68} y={150} width={72} height={7} rx={3.5} fill="var(--foreground)" opacity=".14" />
      <rect x={68} y={163} width={58} height={7} rx={3.5} fill="var(--foreground)" opacity=".11" />
      <rect x={68} y={176} width={65} height={7} rx={3.5} fill="var(--foreground)" opacity=".11" />
      <rect x={68} y={192} width={48} height={20} rx={5} fill="color-mix(in srgb, var(--danger) 14%, transparent)" stroke="var(--danger)" strokeWidth={2} />
      <text x={92} y={206} textAnchor="middle" fill="var(--danger)" fontSize={11} fontWeight={900}>PDF</text>
      <text x={108} y={285} textAnchor="middle" fill="var(--danger)" fontSize={16} fontWeight={900}>320 MB</text>

      {/* Arrow to processing */}
      <path d="M168 184h44" stroke="var(--border)" strokeWidth={3} strokeDasharray="6 4" />
      <path d="M198 168l14 16-14 16" fill="none" stroke="var(--primary)" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" />

      {/* Processing stages */}
      <rect x={222} y={100} width={276} height={226} rx={18} fill="var(--card)" stroke="var(--border)" strokeWidth={2.5} />
      <text x={360} y={126} textAnchor="middle" fill="var(--foreground)" fontSize={14} fontWeight={850}>KDP processes your file</text>
      {([
        { label: 'Receive file', ok: true, note: '' },
        { label: 'Scan structure', ok: true, note: '' },
        { label: 'Rasterize pages', ok: false, note: 'image-heavy files stall here' },
        { label: 'Render proof', ok: false, note: 'or freeze at this stage' },
      ] as { label: string; ok: boolean; note: string }[]).map((stage, i) => (
        <g key={stage.label} transform={`translate(242 ${142 + i * 44})`}>
          <circle cx={11} cy={13} r={11} fill={stage.ok ? 'color-mix(in srgb, var(--success) 15%, transparent)' : 'color-mix(in srgb, var(--danger) 12%, transparent)'} stroke={stage.ok ? 'var(--success)' : 'var(--danger)'} strokeWidth={2.5} />
          {stage.ok
            ? <path d="M6 12l4 4 7-8" fill="none" stroke="var(--success)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
            : <text x={11} y={13} textAnchor="middle" dominantBaseline="central" fill="var(--danger)" fontSize={13} fontWeight={950}>!</text>
          }
          <text x={30} y={18} fill="var(--foreground)" fontSize={13} fontWeight={stage.ok ? 700 : 850}>{stage.label}</text>
          {stage.note ? <text x={30} y={32} fill="var(--danger)" fontSize={10} fontWeight={750}>↳ {stage.note}</text> : null}
        </g>
      ))}

      {/* Stuck spinner */}
      <rect x={530} y={118} width={200} height={174} rx={18} fill="color-mix(in srgb, var(--danger) 7%, transparent)" stroke="var(--danger)" strokeDasharray="8 5" strokeWidth={2.5} />
      <text x={630} y={148} textAnchor="middle" fill="var(--danger)" fontSize={14} fontWeight={900}>upload stuck</text>
      <circle cx={630} cy={207} r={34} fill="none" stroke="var(--muted)" strokeWidth={6} opacity=".4" />
      <path d="M630 173 a34 34 0 1 1 -34 34" fill="none" stroke="var(--danger)" strokeWidth={6} strokeLinecap="round" opacity=".65" />
      <text x={630} y={264} textAnchor="middle" fill="var(--muted-foreground)" fontSize={11} fontWeight={750}>processing forever</text>
      <path d="M502 207h24" stroke="var(--danger)" strokeWidth={3} strokeDasharray="5 4" />

      <rect x={138} y={338} width={524} height={42} rx={14} fill="color-mix(in srgb, var(--primary) 8%, var(--card))" stroke="color-mix(in srgb, var(--primary) 35%, var(--border))" strokeWidth={2} />
      <text x={400} y={364} textAnchor="middle" fill="var(--foreground)" fontSize={13} fontWeight={850}>Reduce file weight so every processing stage can complete</text>
    </g>
  );
}

function FileSizeByBookType() {
  const bx = 222;
  const bw = 466;
  const rows = [
    { label: 'Text book',     sw: Math.round(bw * 0.28), cw: Math.round(bw * 0.24), note: '< 50 MB ideal · > 100 MB inspect · > 200 MB risky' },
    { label: 'Journal',       sw: Math.round(bw * 0.36), cw: Math.round(bw * 0.22), note: '< 60 MB ideal · > 120 MB inspect · > 250 MB risky' },
    { label: 'Coloring book', sw: Math.round(bw * 0.42), cw: Math.round(bw * 0.26), note: '< 150 MB ideal · > 200 MB inspect · > 300 MB risky' },
    { label: 'Photo book',    sw: Math.round(bw * 0.52), cw: Math.round(bw * 0.22), note: '< 200 MB ideal · > 300 MB inspect · > 500 MB risky' },
  ];
  return (
    <g>
      <text x={400} y={50} textAnchor="middle" fill="var(--foreground)" fontSize={20} fontWeight={950}>File size guide by book type</text>
      {rows.map((row, i) => {
        const y = 78 + i * 82;
        const dw = bw - row.sw - row.cw;
        return (
          <g key={row.label}>
            <text x={214} y={y + 16} textAnchor="end" fill="var(--foreground)" fontSize={13} fontWeight={800}>{row.label}</text>
            <rect x={bx} y={y} width={row.sw} height={22} rx={0} fill="color-mix(in srgb, var(--success) 44%, transparent)" />
            <rect x={bx + row.sw} y={y} width={row.cw} height={22} fill="color-mix(in srgb, var(--warning) 50%, transparent)" />
            <rect x={bx + row.sw + row.cw} y={y} width={dw} height={22} fill="color-mix(in srgb, var(--danger) 40%, transparent)" />
            <rect x={bx} y={y} width={bw} height={22} rx={4} fill="none" stroke="var(--border)" strokeWidth={1.5} />
            <text x={bx + 6} y={y + 40} fill="var(--muted-foreground)" fontSize={11} fontWeight={700}>{row.note}</text>
          </g>
        );
      })}
      <g transform="translate(222 420)">
        <rect x={0} y={0} width={14} height={14} rx={3} fill="color-mix(in srgb, var(--success) 44%, transparent)" />
        <text x={20} y={11} fill="var(--muted-foreground)" fontSize={12} fontWeight={700}>ideal range</text>
        <rect x={110} y={0} width={14} height={14} rx={3} fill="color-mix(in srgb, var(--warning) 50%, transparent)" />
        <text x={130} y={11} fill="var(--muted-foreground)" fontSize={12} fontWeight={700}>inspect</text>
        <rect x={200} y={0} width={14} height={14} rx={3} fill="color-mix(in srgb, var(--danger) 40%, transparent)" />
        <text x={220} y={11} fill="var(--muted-foreground)" fontSize={12} fontWeight={700}>high upload risk</text>
      </g>
    </g>
  );
}

function CanvaBloatExplained() {
  const layers = [
    { label: 'Full-page background PNG', weight: '+40 MB', total: false },
    { label: 'Transparent illustration PNG', weight: '+65 MB', total: false },
    { label: 'Shadow + glow overlays', weight: '+18 MB', total: false },
    { label: 'Decorative corner art', weight: '+12 MB', total: false },
    { label: 'Repeated × 100 pages', weight: '= 320 MB', total: true },
  ];
  return (
    <g>
      <text x={400} y={52} textAnchor="middle" fill="var(--foreground)" fontSize={20} fontWeight={950}>What makes a Canva coloring book PDF heavy</text>
      <text x={200} y={94} textAnchor="middle" fill="var(--muted-foreground)" fontSize={13} fontWeight={750}>one page · stacked layers</text>
      {layers.slice(0, 4).map((_, i) => (
        <rect
          key={i}
          x={82 + i * 8}
          y={108 + i * 6}
          width={234}
          height={236 - i * 6}
          rx={10}
          fill={i % 2 === 1 ? 'color-mix(in srgb, var(--danger) 8%, var(--card))' : 'var(--card)'}
          stroke={i % 2 === 1 ? 'var(--danger)' : 'var(--border)'}
          strokeWidth={2}
        />
      ))}
      <text x={220} y={248} textAnchor="middle" fill="var(--muted-foreground)" fontSize={11} fontWeight={700}>layers stacked with transparency</text>

      <rect x={390} y={88} width={328} height={260} rx={16} fill="var(--card)" stroke="var(--border)" strokeWidth={2.5} />
      {layers.map((layer, i) => (
        <g key={layer.label} transform={`translate(406 ${108 + i * 44})`}>
          <rect x={0} y={0} width={296} height={34} rx={8} fill={layer.total ? 'color-mix(in srgb, var(--danger) 10%, transparent)' : 'color-mix(in srgb, var(--muted) 20%, transparent)'} />
          <text x={10} y={22} fill="var(--foreground)" fontSize={12} fontWeight={layer.total ? 900 : 700}>{layer.label}</text>
          <text x={286} y={22} textAnchor="end" fill={layer.total ? 'var(--danger)' : 'var(--muted-foreground)'} fontSize={13} fontWeight={layer.total ? 900 : 750}>{layer.weight}</text>
        </g>
      ))}

      <rect x={102} y={374} width={596} height={42} rx={14} fill="color-mix(in srgb, var(--primary) 8%, var(--card))" stroke="color-mix(in srgb, var(--primary) 35%, var(--border))" strokeWidth={2} />
      <text x={400} y={400} textAnchor="middle" fill="var(--foreground)" fontSize={13} fontWeight={850}>Flatten layers before export to remove unnecessary processing weight</text>
    </g>
  );
}

function TransparencyFlattenWorkflow() {
  return (
    <g>
      <text x={400} y={52} textAnchor="middle" fill="var(--foreground)" fontSize={20} fontWeight={950}>Flatten transparency before uploading to KDP</text>

      {/* Left — complex layers */}
      <text x={200} y={92} textAnchor="middle" fill="var(--danger)" fontSize={14} fontWeight={850}>before flattening</text>
      <rect x={82} y={106} width={234} height={196} rx={16} fill="var(--card)" stroke="var(--danger)" strokeWidth={2.5} />
      <rect x={96} y={120} width={206} height={168} rx={10} fill="color-mix(in srgb, var(--primary) 18%, transparent)" opacity=".7" />
      <rect x={110} y={133} width={178} height={142} rx={8} fill="color-mix(in srgb, var(--warning) 22%, transparent)" opacity=".65" />
      <rect x={124} y={146} width={150} height={116} rx={6} fill="color-mix(in srgb, var(--danger) 14%, transparent)" opacity=".6" />
      <rect x={138} y={159} width={122} height={90} rx={5} fill="color-mix(in srgb, var(--primary) 25%, transparent)" opacity=".55" />
      <text x={199} y={180} textAnchor="middle" fill="var(--danger)" fontSize={11} fontWeight={750}>shadow layer</text>
      <text x={199} y={200} textAnchor="middle" fill="var(--warning)" fontSize={11} fontWeight={750}>overlay</text>
      <text x={199} y={220} textAnchor="middle" fill="var(--primary)" fontSize={11} fontWeight={750}>PNG mask</text>
      <text x={199} y={324} textAnchor="middle" fill="var(--danger)" fontSize={12} fontWeight={800}>KDP must resolve all layers</text>
      <text x={199} y={342} textAnchor="middle" fill="var(--danger)" fontSize={12} fontWeight={800}>→ upload slows or stalls</text>

      {/* Arrow — long, text above */}
      <text x={400} y={190} textAnchor="middle" fill="var(--success)" fontSize={14} fontWeight={900}>flatten</text>
      <path d="M326 204h136" stroke="var(--success)" strokeWidth={4} strokeLinecap="round" />
      <path d="M458 193 l24 11 -24 11Z" fill="var(--success)" />

      {/* Right — flattened */}
      <text x={600} y={92} textAnchor="middle" fill="var(--success)" fontSize={14} fontWeight={850}>after flattening</text>
      <rect x={484} y={106} width={234} height={196} rx={16} fill="var(--card)" stroke="var(--success)" strokeWidth={2.5} />
      <rect x={498} y={120} width={206} height={168} rx={10} fill="color-mix(in srgb, var(--primary) 20%, transparent)" />
      <path d="M540 192 c20-30 42-18 60 0 c20 20 42 16 62-6" stroke="var(--primary)" strokeWidth={4} strokeLinecap="round" fill="none" />
      <path d="M520 224h108" stroke="var(--foreground)" strokeWidth={3} opacity=".18" />
      <path d="M532 242h84" stroke="var(--foreground)" strokeWidth={3} opacity=".13" />
      <text x={600} y={324} textAnchor="middle" fill="var(--success)" fontSize={12} fontWeight={800}>single merged layer</text>
      <text x={600} y={342} textAnchor="middle" fill="var(--success)" fontSize={12} fontWeight={800}>lighter · faster upload</text>

      <rect x={150} y={374} width={500} height={42} rx={14} fill="color-mix(in srgb, var(--primary) 8%, var(--card))" stroke="color-mix(in srgb, var(--primary) 35%, var(--border))" strokeWidth={2} />
      <text x={400} y={400} textAnchor="middle" fill="var(--foreground)" fontSize={13} fontWeight={850}>Keep an editable master · flatten only the upload copy</text>
    </g>
  );
}

function SplitTestMethod() {
  return (
    <g>
      <text x={400} y={50} textAnchor="middle" fill="var(--foreground)" fontSize={20} fontWeight={950}>Split-test the manuscript to find the problem page</text>

      {/* Full book */}
      <rect x={296} y={68} width={208} height={70} rx={12} fill="var(--card)" stroke="var(--border)" strokeWidth={2.5} />
      <text x={400} y={100} textAnchor="middle" fill="var(--foreground)" fontSize={14} fontWeight={850}>Full manuscript</text>
      <text x={400} y={120} textAnchor="middle" fill="var(--danger)" fontSize={12} fontWeight={750}>100 pages · upload stuck</text>

      {/* L1 → L2 connectors */}
      <path d="M400 138v14" stroke="var(--primary)" strokeWidth={2.5} />
      <path d="M190 152h420" stroke="var(--primary)" strokeWidth={2.5} />
      <path d="M190 152v18" stroke="var(--primary)" strokeWidth={2.5} />
      <path d="M610 152v18" stroke="var(--primary)" strokeWidth={2.5} />

      {/* L2 Left — passes */}
      <rect x={100} y={170} width={180} height={66} rx={10} fill="var(--card)" stroke="var(--success)" strokeWidth={2.5} />
      <text x={190} y={200} textAnchor="middle" fill="var(--success)" fontSize={13} fontWeight={850}>Pages 1–50</text>
      <text x={190} y={222} textAnchor="middle" fill="var(--success)" fontSize={11.5} fontWeight={700}>passes ✓</text>

      {/* L2 Right — fails */}
      <rect x={520} y={170} width={180} height={66} rx={10} fill="var(--card)" stroke="var(--danger)" strokeWidth={2.5} />
      <text x={610} y={200} textAnchor="middle" fill="var(--danger)" fontSize={13} fontWeight={850}>Pages 51–100</text>
      <text x={610} y={222} textAnchor="middle" fill="var(--danger)" fontSize={11.5} fontWeight={700}>fails ✗ · narrow here</text>

      {/* L2 Right → L3 connectors */}
      <path d="M610 236v12" stroke="var(--primary)" strokeWidth={2.5} />
      <path d="M470 248h200" stroke="var(--primary)" strokeWidth={2.5} />
      <path d="M470 248v18" stroke="var(--primary)" strokeWidth={2.5} />
      <path d="M670 248v18" stroke="var(--primary)" strokeWidth={2.5} />

      {/* L3 Left — passes */}
      <rect x={378} y={266} width={184} height={62} rx={10} fill="var(--card)" stroke="var(--success)" strokeWidth={2.5} />
      <text x={470} y={295} textAnchor="middle" fill="var(--success)" fontSize={12} fontWeight={850}>Pages 51–75</text>
      <text x={470} y={315} textAnchor="middle" fill="var(--success)" fontSize={11} fontWeight={700}>passes ✓</text>

      {/* L3 Right — fails */}
      <rect x={576} y={266} width={188} height={62} rx={10} fill="var(--card)" stroke="var(--danger)" strokeWidth={2.5} />
      <text x={670} y={295} textAnchor="middle" fill="var(--danger)" fontSize={12} fontWeight={850}>Pages 76–100</text>
      <text x={670} y={315} textAnchor="middle" fill="var(--danger)" fontSize={11} fontWeight={700}>fails ✗ · bad asset here</text>

      {/* Found */}
      <path d="M670 328v16" stroke="var(--danger)" strokeWidth={2.5} />
      <rect x={576} y={344} width={188} height={50} rx={10} fill="color-mix(in srgb, var(--danger) 10%, transparent)" stroke="var(--danger)" strokeWidth={2.5} />
      <text x={670} y={368} textAnchor="middle" fill="var(--danger)" fontSize={13} fontWeight={900}>bad asset found</text>
      <text x={670} y={386} textAnchor="middle" fill="var(--muted-foreground)" fontSize={11} fontWeight={700}>repair · re-export</text>

      {/* Bottom note */}
      <rect x={72} y={408} width={656} height={34} rx={10} fill="color-mix(in srgb, var(--primary) 8%, var(--card))" stroke="color-mix(in srgb, var(--primary) 35%, var(--border))" strokeWidth={2} />
      <text x={400} y={430} textAnchor="middle" fill="var(--foreground)" fontSize={12} fontWeight={850}>Each split halves the search space — find the bad page faster than re-exporting the whole book</text>
    </g>
  );
}

function KdpPreviewPipeline() {
  const steps = [
    { x: 58, label: 'Upload', sub: 'PDF files' },
    { x: 202, label: 'Analyze', sub: 'trim + bleed' },
    { x: 346, label: 'Rasterize', sub: 'pages + cover' },
    { x: 490, label: 'Render', sub: 'browser preview' },
    { x: 634, label: 'Approve', sub: 'final check' },
  ];

  return (
    <g>
      <Label x={88} y={58}>Inside the KDP Preview pipeline</Label>
      <path d="M145 210h510" stroke="var(--primary)" strokeWidth={4} strokeLinecap="round" markerEnd="url(#arrow-kdp-preview-pipeline)" />
      {steps.map((step, index) => (
        <g key={step.label}>
          <rect x={step.x} y={132} width={116} height={154} rx={18} fill="var(--card)" stroke={index === 2 ? 'var(--warning)' : 'var(--border)'} strokeWidth={3} />
          <circle cx={step.x + 58} cy={178} r={24} fill={index === 2 ? 'color-mix(in srgb, var(--warning) 18%, transparent)' : 'color-mix(in srgb, var(--primary) 12%, transparent)'} stroke={index === 2 ? 'var(--warning)' : 'var(--primary)'} strokeWidth={3} />
          <text x={step.x + 58} y={186} textAnchor="middle" fill={index === 2 ? 'var(--warning)' : 'var(--primary)'} fontSize={20} fontWeight={950}>{index + 1}</text>
          <text x={step.x + 58} y={232} textAnchor="middle" fill="var(--foreground)" fontSize={17} fontWeight={900}>{step.label}</text>
          <text x={step.x + 58} y={258} textAnchor="middle" fill="var(--muted-foreground)" fontSize={12} fontWeight={700}>{step.sub}</text>
        </g>
      ))}
      <rect x={146} y={330} width={508} height={46} rx={15} fill="color-mix(in srgb, var(--warning) 10%, var(--card))" stroke="var(--warning)" strokeWidth={2} />
      <text x={400} y={359} textAnchor="middle" fill="var(--foreground)" fontSize={15} fontWeight={850}>Image-heavy PDFs stress the rasterize + render stages first</text>
    </g>
  );
}

function KdpPdfSizeOptimization() {
  return (
    <g>
      <Label x={102} y={58}>Before vs optimized PDF size</Label>
      <rect x={86} y={106} width={258} height={246} rx={22} fill="var(--card)" stroke="var(--danger)" strokeWidth={3} />
      <rect x={118} y={138} width={194} height={120} rx={12} fill="color-mix(in srgb, var(--danger) 10%, transparent)" />
      {[0, 1, 2, 3].map((row) =>
        [0, 1, 2, 3].map((col) => (
          <rect key={`bad-${row}-${col}`} x={130 + col * 43} y={150 + row * 24} width={32} height={18} rx={3} fill="color-mix(in srgb, var(--warning) 28%, transparent)" />
        ))
      )}
      <text x={215} y={294} textAnchor="middle" fill="var(--danger)" fontSize={28} fontWeight={950}>250 MB</text>
      <text x={215} y={324} textAnchor="middle" fill="var(--muted-foreground)" fontSize={14} fontWeight={700}>oversized PNG-heavy export</text>

      <path d="M370 226h62" stroke="var(--primary)" strokeWidth={4} strokeLinecap="round" markerEnd="url(#arrow-kdp-pdf-size-optimization)" />

      <rect x={456} y={106} width={258} height={246} rx={22} fill="var(--card)" stroke="var(--success)" strokeWidth={3} />
      <rect x={488} y={138} width={194} height={120} rx={12} fill="color-mix(in srgb, var(--success) 10%, transparent)" />
      <path d="M510 198h150M510 224h112M510 172h132" stroke="var(--success)" strokeWidth={7} strokeLinecap="round" />
      <text x={585} y={294} textAnchor="middle" fill="var(--success)" fontSize={28} fontWeight={950}>82 MB</text>
      <text x={585} y={324} textAnchor="middle" fill="var(--muted-foreground)" fontSize={14} fontWeight={700}>flattened print-ready PDF</text>

      <text x={400} y={404} textAnchor="middle" fill="var(--foreground)" fontSize={15} fontWeight={850}>Keep print quality, remove unnecessary processing weight</text>
    </g>
  );
}

function KdpPreviewTroubleshootingFlow() {
  const items = [
    { x: 66, label: 'Browser', sub: 'Clean browser', detail: 'incognito test' },
    { x: 201, label: 'PDF', sub: 'Clean export', detail: 'flatten PDF', accent: true },
    { x: 336, label: 'Pages', sub: 'Test pages', detail: 'find bad page' },
    { x: 471, label: 'Layout', sub: 'Check setup', detail: 'trim / bleed' },
    { x: 606, label: 'Retry', sub: 'Upload fix', detail: 'preview again' },
  ];

  return (
    <g>
      <text x={400} y={58} textAnchor="middle" fill="var(--foreground)" fontSize={24} fontWeight={950}>Previewer troubleshooting flow</text>
      <text x={400} y={88} textAnchor="middle" fill="var(--muted-foreground)" fontSize={14} fontWeight={700}>Move left to right: rule out the easy causes before rebuilding the file.</text>

      <rect x={48} y={128} width={704} height={224} rx={30} fill="color-mix(in srgb, var(--card) 90%, transparent)" stroke="var(--border)" strokeWidth={2} />
      <path d="M132 172h536" stroke="color-mix(in srgb, var(--primary) 18%, transparent)" strokeWidth={10} strokeLinecap="round" />
      <path d="M132 172h202" stroke="color-mix(in srgb, var(--warning) 62%, transparent)" strokeWidth={10} strokeLinecap="round" />

      {items.map((item, index) => (
        <g key={item.label}>
          <rect
            x={item.x}
            y={152}
            width={128}
            height={148}
            rx={20}
            fill="var(--card)"
            stroke={item.accent ? 'var(--warning)' : 'var(--border)'}
            strokeWidth={item.accent ? 3 : 2}
          />
          <circle
            cx={item.x + 64}
            cy={172}
            r={24}
            fill={item.accent ? 'color-mix(in srgb, var(--warning) 16%, var(--card))' : 'var(--card)'}
            stroke={item.accent ? 'var(--warning)' : 'var(--primary)'}
            strokeWidth={3}
          />
          <text x={item.x + 64} y={172} textAnchor="middle" dominantBaseline="central" fill={item.accent ? 'var(--warning)' : 'var(--primary)'} fontSize={16} fontWeight={950}>{index + 1}</text>
          <text x={item.x + 64} y={222} textAnchor="middle" fill="var(--foreground)" fontSize={17} fontWeight={950}>{item.label}</text>
          <text x={item.x + 64} y={250} textAnchor="middle" fill="var(--muted-foreground)" fontSize={11.5} fontWeight={850}>{item.sub}</text>
          <text x={item.x + 64} y={274} textAnchor="middle" fill="var(--muted-foreground)" fontSize={10.5} fontWeight={700}>{item.detail}</text>
        </g>
      ))}

      <g>
        <rect x={220} y={370} width={360} height={42} rx={15} fill="color-mix(in srgb, var(--warning) 10%, var(--card))" stroke="color-mix(in srgb, var(--warning) 55%, var(--border))" strokeWidth={2} />
        <circle cx={248} cy={391} r={8} fill="var(--warning)" />
        <text x={415} y={396} textAnchor="middle" fill="var(--foreground)" fontSize={12.5} fontWeight={850}>PDF and page tests fix most stuck previews.</text>
      </g>
    </g>
  );
}

function BleedLayers() {
  return (
    <g>
      <rect x="210" y="42" width="380" height="340" rx="18" fill="color-mix(in srgb, var(--danger) 12%, transparent)" stroke="var(--danger)" strokeDasharray="9 9" strokeWidth="3" />
      <rect x="248" y="80" width="304" height="264" rx="14" fill="var(--card)" stroke="var(--primary)" strokeWidth="3" />
      <rect x="300" y="132" width="200" height="160" rx="10" fill="color-mix(in srgb, var(--success) 10%, transparent)" stroke="var(--success)" strokeDasharray="7 7" strokeWidth="3" />
      <Label x={245} y={68}>bleed</Label>
      <Label x={260} y={110}>trim</Label>
      <Label x={318} y={165}>safe area</Label>
      <path d="M590 212h70" stroke="var(--danger)" strokeWidth="3" markerEnd="url(#arrow)" />
      <MutedLabel x={604} y={244}>0.125 inch</MutedLabel>
    </g>
  );
}

function PrintableAreaError() {
  return (
    <g>
      <rect x="255" y="48" width="290" height="350" rx="18" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <rect x="292" y="86" width="216" height="274" rx="10" fill="color-mix(in srgb, var(--success) 8%, transparent)" stroke="var(--success)" strokeDasharray="8 8" strokeWidth="3" />
      <rect x="236" y="126" width="170" height="38" rx="8" fill="color-mix(in srgb, var(--danger) 12%, transparent)" stroke="var(--danger)" strokeWidth="3" />
      <circle cx="548" cy="314" r="32" fill="color-mix(in srgb, var(--danger) 14%, transparent)" stroke="var(--danger)" strokeWidth="3" />
      <text x="284" y="151" fill="var(--danger)" fontSize="18" fontWeight="800">TITLE</text>
      <text x="540" y="322" fill="var(--danger)" fontSize="22" fontWeight="900">!</text>
      <Label x={258} y={35}>printable area warning</Label>
      <MutedLabel x={315} y={382}>move important elements inward</MutedLabel>
    </g>
  );
}

function ChecklistDiagram() {
  const rows = ['Dimensions match setup', 'Bleed included', 'Text inside safe area', 'Spine recalculated', 'PDF exported cleanly'];
  return (
    <g>
      <rect x="170" y="65" width="460" height="312" rx="22" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <rect x="170" y="65" width="460" height="56" rx="22" fill="color-mix(in srgb, var(--primary) 15%, transparent)" />
      <Label x={206} y={102}>KDP cover preflight</Label>
      {rows.map((row, index) => (
        <g key={row} transform={`translate(206 ${150 + index * 40})`}>
          <circle cx="10" cy="0" r="11" fill="color-mix(in srgb, var(--success) 15%, transparent)" stroke="var(--success)" strokeWidth="3" />
          <path d="M4 -1l5 5 9 -12" fill="none" stroke="var(--success)" strokeWidth="3" />
          <text x="34" y="6" fill="var(--foreground)" fontSize="17" fontWeight="700">{row}</text>
        </g>
      ))}
    </g>
  );
}

function MissingBleed() {
  return (
    <g>
      <Label x={160} y={54}>before</Label>
      <Label x={500} y={54}>after</Label>
      <rect x="105" y="85" width="230" height="285" rx="18" fill="var(--card)" stroke="var(--danger)" strokeWidth="3" />
      <rect x="107" y="87" width="226" height="281" rx="16" fill="color-mix(in srgb, var(--primary) 13%, transparent)" />
      <rect x="465" y="68" width="270" height="320" rx="18" fill="color-mix(in srgb, var(--danger) 10%, transparent)" stroke="var(--danger)" strokeDasharray="8 8" strokeWidth="3" />
      <rect x="485" y="88" width="230" height="280" rx="16" fill="color-mix(in srgb, var(--primary) 16%, transparent)" stroke="var(--primary)" strokeWidth="3" />
      <MutedLabel x={118} y={398}>art stops at trim</MutedLabel>
      <MutedLabel x={510} y={415}>art extends through bleed</MutedLabel>
    </g>
  );
}

function SpineWidth() {
  return (
    <g>
      <rect x="100" y="112" width="600" height="230" rx="18" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <path d="M118 112h247v230H118a18 18 0 0 1-18-18V130a18 18 0 0 1 18-18Z" fill="color-mix(in srgb, var(--muted) 65%, transparent)" />
      <rect x="365" y="112" width="70" height="230" fill="color-mix(in srgb, var(--primary) 22%, transparent)" />
      <path d="M435 112h247a18 18 0 0 1 18 18v194a18 18 0 0 1-18 18H435Z" fill="var(--card)" />
      <path d="M365 112v230M435 112v230M365 112h70M365 342h70" stroke="var(--primary)" strokeWidth="3" strokeLinecap="square" />
      <Label x={180} y={232}>back</Label>
      <Label x={379} y={232}>spine</Label>
      <Label x={530} y={232}>front</Label>
      <path d="M365 372h70" stroke="var(--primary)" strokeWidth="3" />
      <MutedLabel x={330} y={402}>page count x paper type</MutedLabel>
    </g>
  );
}

function SpineMisalignment() {
  const panelW = 340;
  const panelH = 200;
  const spineW = 120;
  const coverW = (panelW - spineW) / 2; // 110
  
  const cx1 = 190, cy = 240;
  const x1 = cx1 - panelW/2; // 20
  const y = cy - panelH/2; // 140
  
  const cx2 = 590;
  const x2 = cx2 - panelW/2; // 420
  
  const shift = 28; // folds shift right

  return (
    <g>
      <Label x={200} y={30}>zoomed spine text alignment</Label>

      {/* --- LEFT PANEL: TOO TIGHT --- */}
      <text x={cx1} y={70} textAnchor="middle" fill="var(--foreground)" fontSize={20} fontWeight={900}>TOO TIGHT</text>
      <text x={cx1} y={92} textAnchor="middle" fill="var(--muted-foreground)" fontSize={13} fontWeight={700}>text fills intended spine width</text>

      {/* Dark Book Cover */}
      <rect x={x1} y={y} width={panelW} height={panelH} rx={6} 
        fill="color-mix(in srgb, var(--foreground) 85%, var(--card))" 
        stroke="var(--border)" strokeWidth={2} 
        style={{ filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.15))' }} />
        
      {/* Intended Spine Highlight */}
      <rect x={x1 + coverW} y={y} width={spineW} height={panelH} fill="var(--card)" opacity={0.05} />

      {/* Intended Folds */}
      <path d={`M ${x1 + coverW} ${y} v ${panelH} M ${x1 + coverW + spineW} ${y} v ${panelH}`} 
        stroke="var(--card)" strokeWidth={2} strokeDasharray="5 5" opacity={0.3} />
      
      {/* Spine Text (Huge) */}
      <text x={cx1} y={cy} textAnchor="middle" transform={`rotate(-90 ${cx1} ${cy})`} 
        fill="var(--card)" fontSize={100} fontWeight={950} opacity={0.95} letterSpacing={2}>TITLE</text>
      
      {/* Actual Folds (Shifted) */}
      <path d={`M ${x1 + coverW + shift} ${y - 14} v ${panelH + 28} M ${x1 + coverW + spineW + shift} ${y - 14} v ${panelH + 28}`} 
        stroke="var(--danger)" strokeWidth={4} strokeDasharray="8 8" />
        
      {/* Labels for Lines */}
      <text x={x1 + coverW - 8} y={y - 16} textAnchor="end" fill="var(--muted-foreground)" fontSize={13} fontWeight={800}>intended fold</text>
      <path d={`M ${x1 + coverW - 12} ${y - 12} L ${x1 + coverW} ${y - 2}`} stroke="var(--muted)" strokeWidth={2} />
      
      <rect x={x1 + coverW + shift - 15} y={y - 42} width={100} height={24} rx={6} fill="var(--card)" stroke="var(--danger)" strokeWidth={2} />
      <text x={x1 + coverW + shift + 35} y={y - 25} textAnchor="middle" fill="var(--danger)" fontSize={13} fontWeight={900}>actual fold</text>
      <path d={`M ${x1 + coverW + shift + 10} ${y - 18} L ${x1 + coverW + shift} ${y - 6}`} stroke="var(--danger)" strokeWidth={2} />

      {/* Wraps to back cover arrow */}
      <path d={`M ${x1 + coverW + shift - 40} ${y + 40} Q ${x1 + coverW + shift - 10} ${y + 40} ${x1 + coverW + shift - 10} ${cy - 40}`} fill="none" stroke="var(--danger)" strokeWidth={3} />
      <path d={`M ${x1 + coverW + shift - 16} ${cy - 48} L ${x1 + coverW + shift - 10} ${cy - 38} L ${x1 + coverW + shift - 4} ${cy - 48}`} fill="none" stroke="var(--danger)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      <text x={x1 + coverW + shift - 45} y={y + 45} textAnchor="end" fill="var(--danger)" fontSize={13} fontWeight={850}>text wraps</text>
      <text x={x1 + coverW + shift - 45} y={y + 60} textAnchor="end" fill="var(--danger)" fontSize={13} fontWeight={850}>to back cover</text>

      <rect x={x1 - 10} y={y + panelH + 34} width={panelW + 20} height={44} rx={12} fill="color-mix(in srgb, var(--danger) 10%, var(--card))" stroke="var(--danger)" strokeWidth={2} />
      <text x={cx1} y={y + panelH + 61} textAnchor="middle" fill="var(--danger)" fontSize={14} fontWeight={850}>shift causes text to wrap around the edge</text>

      {/* --- MIDDLE: SHIFT ARROW --- */}
      <path d={`M 370 ${cy} h 40`} stroke="var(--danger)" strokeWidth={4} strokeDasharray="5 5" />
      <path d={`M 400 ${cy - 8} L 414 ${cy} L 400 ${cy + 8}`} fill="none" stroke="var(--danger)" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
      <text x={390} y={cy - 16} textAnchor="middle" fill="var(--danger)" fontSize={14} fontWeight={900}>fold shift</text>

      {/* --- RIGHT PANEL: SAFE MARGIN --- */}
      <text x={cx2} y={70} textAnchor="middle" fill="var(--foreground)" fontSize={20} fontWeight={900}>SAFE MARGIN</text>
      <text x={cx2} y={92} textAnchor="middle" fill="var(--muted-foreground)" fontSize={13} fontWeight={700}>text has breathing room</text>

      {/* Dark Book Cover */}
      <rect x={x2} y={y} width={panelW} height={panelH} rx={6} 
        fill="color-mix(in srgb, var(--foreground) 85%, var(--card))" 
        stroke="var(--border)" strokeWidth={2} 
        style={{ filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.15))' }} />
        
      {/* Intended Spine Highlight */}
      <rect x={x2 + coverW} y={y} width={spineW} height={panelH} fill="var(--card)" opacity={0.05} />

      {/* Intended Folds */}
      <path d={`M ${x2 + coverW} ${y} v ${panelH} M ${x2 + coverW + spineW} ${y} v ${panelH}`} 
        stroke="var(--card)" strokeWidth={2} strokeDasharray="5 5" opacity={0.3} />
      
      {/* Spine Text (Safe size) */}
      <text x={cx2} y={cy} textAnchor="middle" transform={`rotate(-90 ${cx2} ${cy})`} 
        fill="var(--card)" fontSize={40} fontWeight={900} opacity={0.9} letterSpacing={3}>TITLE</text>
      
      {/* Actual Folds (Shifted) */}
      <path d={`M ${x2 + coverW + shift} ${y - 14} v ${panelH + 28} M ${x2 + coverW + spineW + shift} ${y - 14} v ${panelH + 28}`} 
        stroke="var(--success)" strokeWidth={4} strokeDasharray="8 8" />
        
      {/* Labels for Lines */}
      <text x={x2 + coverW - 8} y={y - 16} textAnchor="end" fill="var(--muted-foreground)" fontSize={13} fontWeight={800}>intended fold</text>
      <path d={`M ${x2 + coverW - 12} ${y - 12} L ${x2 + coverW} ${y - 2}`} stroke="var(--muted)" strokeWidth={2} />
      
      <rect x={x2 + coverW + shift - 15} y={y - 42} width={100} height={24} rx={6} fill="var(--card)" stroke="var(--success)" strokeWidth={2} />
      <text x={x2 + coverW + shift + 35} y={y - 25} textAnchor="middle" fill="var(--success)" fontSize={13} fontWeight={900}>actual fold</text>
      <path d={`M ${x2 + coverW + shift + 10} ${y - 18} L ${x2 + coverW + shift} ${y - 6}`} stroke="var(--success)" strokeWidth={2} />
        
      <rect x={x2 - 10} y={y + panelH + 34} width={panelW + 20} height={44} rx={12} fill="color-mix(in srgb, var(--success) 10%, var(--card))" stroke="var(--success)" strokeWidth={2} />
      <text x={cx2} y={y + panelH + 61} textAnchor="middle" fill="var(--success)" fontSize={14} fontWeight={850}>text safely remains on the physical spine</text>
    </g>
  );
}

function SafeArea() {
  return (
    <g>
      <rect x="260" y="55" width="280" height="340" rx="18" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <rect x="312" y="108" width="176" height="234" rx="12" fill="color-mix(in srgb, var(--success) 10%, transparent)" stroke="var(--success)" strokeDasharray="8 8" strokeWidth="3" />
      <rect x="332" y="152" width="136" height="28" rx="8" fill="var(--foreground)" opacity=".16" />
      <rect x="340" y="205" width="120" height="16" rx="8" fill="var(--primary)" opacity=".55" />
      <rect x="350" y="310" width="100" height="18" rx="7" fill="var(--foreground)" opacity=".12" />
      <Label x={330} y={95}>safe area</Label>
      <MutedLabel x={560} y={205}>text stays inside</MutedLabel>
    </g>
  );
}

function PdfChecklist() {
  const items = ['Correct size', 'Bleed included', 'Fonts embedded', 'Images sharp'];
  return (
    <g>
      <rect x="210" y="58" width="380" height="330" rx="20" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <rect x="250" y="30" width="160" height="56" rx="12" fill="color-mix(in srgb, var(--primary) 15%, transparent)" stroke="var(--primary)" strokeWidth="3" />
      <Label x={287} y={66}>PDF</Label>
      {items.map((item, index) => (
        <g key={item} transform={`translate(270 ${140 + index * 48})`}>
          <rect x="0" y="-18" width="260" height="34" rx="10" fill="color-mix(in srgb, var(--muted) 65%, transparent)" stroke="var(--border)" />
          <circle cx="22" cy="0" r="10" fill="color-mix(in srgb, var(--success) 14%, transparent)" stroke="var(--success)" strokeWidth="2" />
          <text x="48" y="6" fill="var(--foreground)" fontSize="16" fontWeight="750">{item}</text>
        </g>
      ))}
    </g>
  );
}

function CanvaFlow() {
  const steps = ['Custom size', 'Show bleed', 'PDF Print', 'Validate'];
  return (
    <g>
      {steps.map((step, index) => {
        const x = 80 + index * 175;
        return (
          <g key={step}>
            <rect x={x} y="170" width="130" height="86" rx="16" fill="var(--card)" stroke={index === 3 ? 'var(--success)' : 'var(--primary)'} strokeWidth="3" />
            <text x={x + 65} y="218" textAnchor="middle" fill="var(--foreground)" fontSize="15" fontWeight="800">{step}</text>
            {index < steps.length - 1 ? <path d={`M${x + 138} 213h42`} stroke="var(--primary)" strokeWidth="3" strokeDasharray="7 7" /> : null}
          </g>
        );
      })}
      <Label x={270} y={125}>Canva export flow</Label>
    </g>
  );
}

function PhotoshopGuides() {
  return (
    <g>
      <rect x="110" y="72" width="580" height="306" rx="18" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <rect x="138" y="100" width="524" height="250" rx="12" fill="transparent" stroke="var(--danger)" strokeDasharray="8 8" strokeWidth="3" />
      <rect x="172" y="134" width="456" height="182" rx="8" fill="color-mix(in srgb, var(--success) 8%, transparent)" stroke="var(--success)" strokeDasharray="7 7" strokeWidth="3" />
      <rect x="382" y="100" width="44" height="250" fill="color-mix(in srgb, var(--primary) 18%, transparent)" stroke="var(--primary)" strokeWidth="3" />
      <Label x={142} y={58}>Photoshop guide layout</Label>
      <MutedLabel x={145} y={402}>bleed / trim / spine / safe area</MutedLabel>
    </g>
  );
}

function TrimComparison() {
  return (
    <g>
      <rect x="145" y="150" width="135" height="205" rx="14" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <rect x="335" y="118" width="155" height="237" rx="14" fill="var(--card)" stroke="var(--primary)" strokeWidth="3" />
      <rect x="545" y="82" width="170" height="273" rx="14" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <Label x={172} y={390}>5x8</Label>
      <Label x={372} y={390}>6x9</Label>
      <Label x={570} y={390}>8.5x11</Label>
      <MutedLabel x={250} y={70}>trim size changes the cover math</MutedLabel>
    </g>
  );
}

function CoverAnatomy() {
  return (
    <g>
      <text x={400} y={48} textAnchor="middle" fill="var(--foreground)" fontSize={22} fontWeight={950}>Full KDP cover anatomy</text>

      {/* Bleed boundary */}
      <rect
        x={72}
        y={86}
        width={656}
        height={266}
        rx={28}
        fill="color-mix(in srgb, var(--danger) 5%, transparent)"
        stroke="var(--danger)"
        strokeWidth={2.5}
        strokeDasharray="10 10"
        opacity={0.9}
      />

      {/* Trimmed cover */}
      <rect x={104} y={118} width={592} height={202} rx={22} fill="var(--card)" stroke="var(--border)" strokeWidth={2.5} />
      <path d="M126 118h238v202H126a22 22 0 0 1-22-22V140a22 22 0 0 1 22-22Z" fill="color-mix(in srgb, var(--muted) 58%, transparent)" />
      <rect x={364} y={118} width={72} height={202} fill="color-mix(in srgb, var(--primary) 18%, transparent)" stroke="color-mix(in srgb, var(--primary) 74%, var(--border))" strokeWidth={2.5} />
      <path d="M436 118h238a22 22 0 0 1 22 22v158a22 22 0 0 1-22 22H436Z" fill="color-mix(in srgb, var(--card) 92%, transparent)" />

      {/* Fold lines */}
      <path d="M364 118v202M436 118v202" stroke="color-mix(in srgb, var(--primary) 72%, var(--border))" strokeWidth={2} strokeDasharray="7 7" />

      {/* Safe areas */}
      <rect x={132} y={148} width={204} height={142} rx={14} fill="color-mix(in srgb, var(--success) 8%, transparent)" stroke="var(--success)" strokeDasharray="8 8" strokeWidth={2.5} />
      <rect x={464} y={148} width={204} height={142} rx={14} fill="color-mix(in srgb, var(--success) 8%, transparent)" stroke="var(--success)" strokeDasharray="8 8" strokeWidth={2.5} />
      <rect x={378} y={150} width={44} height={138} rx={12} fill="color-mix(in srgb, var(--success) 7%, transparent)" stroke="var(--success)" strokeDasharray="6 7" strokeWidth={2.2} />

      {/* Panel labels */}
      <rect x={194} y={206} width={80} height={36} rx={12} fill="var(--card)" stroke="var(--border)" strokeWidth={1.5} />
      <text x={234} y={230} textAnchor="middle" fill="var(--foreground)" fontSize={18} fontWeight={900}>back</text>
      <rect x={366} y={206} width={68} height={36} rx={12} fill="var(--card)" stroke="color-mix(in srgb, var(--primary) 55%, var(--border))" strokeWidth={1.5} />
      <text x={400} y={230} textAnchor="middle" fill="var(--primary)" fontSize={17} fontWeight={950}>spine</text>
      <rect x={526} y={206} width={80} height={36} rx={12} fill="var(--card)" stroke="var(--border)" strokeWidth={1.5} />
      <text x={566} y={230} textAnchor="middle" fill="var(--foreground)" fontSize={18} fontWeight={900}>front</text>

      {/* Legend */}
      <g transform="translate(112 374)">
        <rect x={0} y={0} width={576} height={44} rx={14} fill="var(--card)" stroke="var(--border)" strokeWidth={1.8} />
        <line x1={24} y1={22} x2={64} y2={22} stroke="var(--danger)" strokeWidth={2.5} strokeDasharray="8 7" />
        <text x={76} y={27} fill="var(--muted-foreground)" fontSize={13} fontWeight={800}>bleed edge</text>
        <line x1={202} y1={22} x2={242} y2={22} stroke="var(--border)" strokeWidth={3} />
        <text x={254} y={27} fill="var(--muted-foreground)" fontSize={13} fontWeight={800}>trimmed cover</text>
        <line x1={404} y1={22} x2={444} y2={22} stroke="var(--success)" strokeWidth={2.5} strokeDasharray="8 7" />
        <text x={456} y={27} fill="var(--muted-foreground)" fontSize={13} fontWeight={800}>safe area</text>
      </g>
    </g>
  );
}

function HardcoverLayout() {
  return (
    <g>
      <rect x="80" y="82" width="640" height="285" rx="18" fill="color-mix(in srgb, var(--danger) 8%, transparent)" stroke="var(--danger)" strokeDasharray="8 8" strokeWidth="3" />
      <rect x="122" y="112" width="556" height="225" rx="14" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <rect x="122" y="112" width="235" height="225" rx="14" fill="color-mix(in srgb, var(--muted) 68%, transparent)" />
      <rect x="357" y="112" width="30" height="225" fill="color-mix(in srgb, var(--warning) 16%, transparent)" stroke="var(--warning)" strokeDasharray="6 6" strokeWidth="2" />
      <rect x="387" y="112" width="48" height="225" fill="color-mix(in srgb, var(--primary) 22%, transparent)" stroke="var(--primary)" strokeWidth="3" />
      <rect x="435" y="112" width="30" height="225" fill="color-mix(in srgb, var(--warning) 16%, transparent)" stroke="var(--warning)" strokeDasharray="6 6" strokeWidth="2" />
      <Label x={170} y={228}>back board</Label>
      <Label x={390} y={228}>spine</Label>
      <Label x={505} y={228}>front board</Label>
      <MutedLabel x={330} y={384}>wrap + hinge zones</MutedLabel>
    </g>
  );
}

function BarcodeBox({ x, y, warning = true }: { x: number; y: number; warning?: boolean }) {
  return (
    <g>
      <rect x={x} y={y} width="88" height="58" rx="8" fill={warning ? 'color-mix(in srgb, var(--danger) 12%, var(--card))' : 'var(--card)'} stroke={warning ? 'var(--danger)' : 'var(--border)'} strokeWidth="3" />
      <rect x={x + 14} y={y + 13} width="8" height="32" fill="var(--foreground)" opacity=".74" />
      <rect x={x + 28} y={y + 13} width="4" height="32" fill="var(--foreground)" opacity=".6" />
      <rect x={x + 38} y={y + 13} width="10" height="32" fill="var(--foreground)" opacity=".7" />
      <rect x={x + 56} y={y + 13} width="5" height="32" fill="var(--foreground)" opacity=".58" />
      <rect x={x + 68} y={y + 13} width="7" height="32" fill="var(--foreground)" opacity=".68" />
    </g>
  );
}

function BarcodeZoneWrap() {
  return (
    <g>
      <rect x="95" y="88" width="610" height="270" rx="18" fill="color-mix(in srgb, var(--danger) 7%, transparent)" stroke="var(--danger)" strokeDasharray="8 8" strokeWidth="3" />
      <rect x="120" y="113" width="560" height="220" rx="14" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <path d="M134 113h226v220H134a14 14 0 0 1-14-14V127a14 14 0 0 1 14-14Z" fill="color-mix(in srgb, var(--muted) 70%, transparent)" />
      <rect x="360" y="113" width="70" height="220" fill="color-mix(in srgb, var(--primary) 18%, transparent)" />
      <path d="M430 113h236a14 14 0 0 1 14 14v192a14 14 0 0 1-14 14H430Z" fill="var(--card)" />
      <path d="M360 113v220M430 113v220" stroke="var(--primary)" strokeWidth="3" />
      <rect x="245" y="246" width="102" height="72" rx="10" fill="color-mix(in srgb, var(--danger) 13%, transparent)" stroke="var(--danger)" strokeDasharray="7 7" strokeWidth="3" />
      <BarcodeBox x={252} y={253} />
      <rect x="150" y="143" width="165" height="24" rx="8" fill="var(--foreground)" opacity=".12" />
      <rect x="150" y="184" width="155" height="16" rx="8" fill="var(--foreground)" opacity=".1" />
      <rect x="456" y="152" width="150" height="116" rx="14" fill="color-mix(in srgb, var(--primary) 10%, transparent)" stroke="var(--primary)" strokeDasharray="7 7" strokeWidth="3" />
      <Label x={185} y={224}>back</Label>
      <Label x={374} y={224}>spine</Label>
      <Label x={520} y={224}>front</Label>
      <MutedLabel x={245} y={373}>bleed</MutedLabel>
      <MutedLabel x={270} y={237}>barcode area</MutedLabel>
      <MutedLabel x={465} y={293}>safe content area</MutedLabel>
    </g>
  );
}

function BarcodeWrongCorrect() {
  return (
    <g>
      <Label x={135} y={60}>wrong</Label>
      <Label x={500} y={60}>correct</Label>
      <rect x="105" y="92" width="245" height="290" rx="18" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <rect x="135" y="130" width="152" height="26" rx="8" fill="var(--foreground)" opacity=".14" />
      <text x="136" y="262" fill="var(--danger)" fontSize="17" fontWeight="850">website + logo</text>
      <path d="M230 266l28 22" stroke="var(--danger)" strokeWidth="3" strokeDasharray="6 6" strokeLinecap="round" />
      <rect x="214" y="286" width="100" height="64" rx="10" fill="color-mix(in srgb, var(--danger) 12%, transparent)" stroke="var(--danger)" strokeDasharray="7 7" strokeWidth="3" />
      <BarcodeBox x={222} y={294} />
      <circle cx="330" cy="278" r="21" fill="var(--card)" stroke="var(--danger)" strokeWidth="4" />
      <circle cx="330" cy="278" r="16" fill="color-mix(in srgb, var(--danger) 10%, transparent)" />
      <text x="324" y="287" fill="var(--danger)" fontSize="27" fontWeight="950">!</text>

      <rect x="450" y="92" width="245" height="290" rx="18" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <rect x="480" y="130" width="152" height="26" rx="8" fill="var(--foreground)" opacity=".14" />
      <text x="488" y="248" fill="var(--foreground)" fontSize="17" fontWeight="850">website + logo</text>
      <rect x="558" y="286" width="100" height="64" rx="10" fill="color-mix(in srgb, var(--success) 10%, transparent)" stroke="var(--success)" strokeDasharray="7 7" strokeWidth="3" />
      <BarcodeBox x={566} y={294} warning={false} />
      <MutedLabel x={116} y={410}>text overlaps barcode box</MutedLabel>
      <MutedLabel x={472} y={410}>content moved upward</MutedLabel>
    </g>
  );
}

function CanvaBarcodeLayout() {
  return (
    <g>
      <rect x="95" y="70" width="610" height="315" rx="22" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <rect x="95" y="70" width="610" height="48" rx="22" fill="color-mix(in srgb, var(--primary) 13%, transparent)" />
      <Label x={128} y={102}>Canva document with locked KDP template layer</Label>
      <rect x="132" y="145" width="250" height="190" rx="16" fill="color-mix(in srgb, var(--danger) 8%, transparent)" stroke="var(--danger)" strokeWidth="3" />
      <rect x="162" y="178" width="118" height="22" rx="8" fill="var(--foreground)" opacity=".14" />
      <text x="168" y="286" fill="var(--danger)" fontSize="16" fontWeight="850">CTA too low</text>
      <rect x="265" y="270" width="88" height="58" rx="8" fill="transparent" stroke="var(--danger)" strokeDasharray="7 7" strokeWidth="3" />
      <BarcodeBox x={268} y={273} />
      <rect x="420" y="145" width="250" height="190" rx="16" fill="color-mix(in srgb, var(--success) 8%, transparent)" stroke="var(--success)" strokeWidth="3" />
      <rect x="450" y="178" width="118" height="22" rx="8" fill="var(--foreground)" opacity=".14" />
      <text x="456" y="245" fill="var(--success)" fontSize="16" fontWeight="850">CTA moved up</text>
      <rect x="553" y="270" width="88" height="58" rx="8" fill="transparent" stroke="var(--success)" strokeDasharray="7 7" strokeWidth="3" />
      <BarcodeBox x={556} y={273} warning={false} />
      <MutedLabel x={176} y={360}>guide visible but ignored</MutedLabel>
      <MutedLabel x={452} y={360}>guide locked and respected</MutedLabel>
    </g>
  );
}

function BackCoverComposition() {
  return (
    <g>
      <rect x="265" y="52" width="270" height="350" rx="22" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <rect x="300" y="92" width="160" height="30" rx="9" fill="var(--foreground)" opacity=".16" />
      <rect x="308" y="150" width="184" height="92" rx="14" fill="color-mix(in srgb, var(--primary) 10%, transparent)" stroke="var(--primary)" strokeDasharray="7 7" strokeWidth="3" />
      <rect x="320" y="264" width="112" height="18" rx="8" fill="var(--foreground)" opacity=".1" />
      <rect x="320" y="296" width="96" height="16" rx="8" fill="var(--foreground)" opacity=".1" />
      <rect x="412" y="318" width="88" height="58" rx="9" fill="color-mix(in srgb, var(--danger) 10%, transparent)" stroke="var(--danger)" strokeDasharray="7 7" strokeWidth="3" />
      <BarcodeBox x={415} y={321} />
      <path d="M540 342h70" stroke="var(--danger)" strokeWidth="3" strokeDasharray="7 7" />
      <MutedLabel x={545} y={333}>keep simple</MutedLabel>
      <MutedLabel x={306} y={258}>blurb above barcode</MutedLabel>
      <Label x={290} y={37}>balanced back cover</Label>
    </g>
  );
}

function BarcodeSafeUnsafe() {
  return (
    <g>
      <Label x={150} y={60}>safe behind barcode</Label>
      <Label x={475} y={60}>unsafe behind barcode</Label>
      <rect x="120" y="95" width="230" height="280" rx="18" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <rect x="145" y="120" width="180" height="230" rx="14" fill="color-mix(in srgb, var(--primary) 9%, transparent)" />
      <path d="M152 146h160M152 188h160M152 230h160M152 272h160" stroke="var(--primary)" strokeWidth="2" opacity=".2" />
      <BarcodeBox x={232} y={292} warning={false} />
      <MutedLabel x={153} y={410}>solid color or subtle texture</MutedLabel>

      <rect x="450" y="95" width="230" height="280" rx="18" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <rect x="475" y="120" width="180" height="230" rx="14" fill="color-mix(in srgb, var(--danger) 8%, transparent)" />
      <text x="490" y="264" fill="var(--danger)" fontSize="16" fontWeight="850">small text</text>
      <path d="M560 268l34 24" stroke="var(--danger)" strokeWidth="3" strokeDasharray="6 6" strokeLinecap="round" />
      <circle cx="648" cy="282" r="19" fill="var(--card)" stroke="var(--danger)" strokeWidth="4" />
      <circle cx="648" cy="282" r="14" fill="color-mix(in srgb, var(--danger) 10%, transparent)" />
      <text x="643" y="290" fill="var(--danger)" fontSize="24" fontWeight="950">!</text>
      <BarcodeBox x={562} y={292} />
      <MutedLabel x={486} y={410}>logos, handles, QR codes</MutedLabel>
    </g>
  );
}

function CoverPageFrame({ x, y, tone = 'neutral' }: { x: number; y: number; tone?: 'neutral' | 'danger' | 'success' | 'dark' }) {
  const fill =
    tone === 'danger'
      ? 'color-mix(in srgb, var(--danger) 8%, var(--card))'
      : tone === 'success'
        ? 'color-mix(in srgb, var(--success) 8%, var(--card))'
        : tone === 'dark'
          ? '#171923'
          : 'var(--card)';

  return (
    <g>
      <rect x={x} y={y} width="230" height="290" rx="18" fill={fill} stroke="var(--border)" strokeWidth="3" />
      <rect x={x + 22} y={y + 22} width="186" height="246" rx="12" fill="transparent" stroke="var(--primary)" strokeWidth="2.5" strokeDasharray="7 7" opacity=".72" />
      <rect x={x + 46} y={y + 48} width="138" height="190" rx="10" fill="transparent" stroke="var(--success)" strokeWidth="2.5" strokeDasharray="7 7" opacity=".7" />
    </g>
  );
}

function CroppedBleedTrimSafe() {
  return (
    <g>
      <rect x="165" y="54" width="470" height="335" rx="22" fill="color-mix(in srgb, var(--danger) 8%, transparent)" stroke="var(--danger)" strokeWidth="3" strokeDasharray="9 9" />
      <rect x="210" y="92" width="380" height="260" rx="18" fill="var(--card)" stroke="var(--primary)" strokeWidth="4" />
      <rect x="260" y="134" width="280" height="176" rx="14" fill="color-mix(in srgb, var(--success) 9%, transparent)" stroke="var(--success)" strokeWidth="3" strokeDasharray="7 7" />
      <rect x="178" y="58" width="64" height="26" rx="8" fill="var(--card)" stroke="var(--danger)" strokeWidth="2" />
      <text x="191" y="77" fill="var(--danger)" fontSize="14" fontWeight="850">bleed</text>
      <rect x="520" y="104" width="56" height="26" rx="8" fill="var(--card)" stroke="var(--primary)" strokeWidth="2" />
      <text x="533" y="123" fill="var(--primary)" fontSize="14" fontWeight="850">trim</text>
      <rect x="286" y="156" width="82" height="30" rx="8" fill="var(--card)" stroke="var(--success)" strokeWidth="2" />
      <text x="302" y="177" fill="var(--success)" fontSize="14" fontWeight="850">safe</text>
      <path d="M165 224h-50M635 224h50" stroke="var(--danger)" strokeWidth="4" strokeLinecap="round" />
      <MutedLabel x={272} y={415}>Previewer simulates the final cut, not just the uploaded PDF page.</MutedLabel>
    </g>
  );
}

function CroppedTextExample() {
  return (
    <g>
      <Label x={150} y={62}>bad: text near trim</Label>
      <CoverPageFrame x={132} y={88} tone="danger" />
      <rect x="105" y="305" width="150" height="36" rx="8" fill="color-mix(in srgb, var(--danger) 12%, var(--card))" stroke="var(--danger)" strokeWidth="3" />
      <text x="122" y="329" fill="var(--danger)" fontSize="18" fontWeight="900">SUBTITLE</text>
      <path d="M132 342h230" stroke="var(--danger)" strokeWidth="4" />
      <circle cx="300" cy="328" r="20" fill="var(--card)" stroke="var(--danger)" strokeWidth="4" />
      <text x="294" y="337" fill="var(--danger)" fontSize="26" fontWeight="950">!</text>

      <Label x={480} y={62}>preview result</Label>
      <rect x="462" y="88" width="230" height="290" rx="18" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <rect x="462" y="88" width="230" height="290" rx="18" fill="color-mix(in srgb, var(--danger) 5%, transparent)" />
      <rect x="492" y="304" width="118" height="32" rx="8" fill="color-mix(in srgb, var(--danger) 10%, var(--card))" stroke="var(--danger)" strokeWidth="3" />
      <text x="508" y="326" fill="var(--danger)" fontSize="17" fontWeight="900">SUBT...</text>
      <MutedLabel x={475} y={410}>trim cuts through important content</MutedLabel>
    </g>
  );
}

function CorrectSpacingExample() {
  return (
    <g>
      <CoverPageFrame x={170} y={78} tone="success" />
      <rect x="228" y="258" width="116" height="34" rx="8" fill="var(--card)" stroke="var(--success)" strokeWidth="3" />
      <text x="246" y="281" fill="var(--success)" fontSize="17" fontWeight="900">SUBTITLE</text>
      <path d="M190 324h190" stroke="var(--success)" strokeWidth="4" strokeLinecap="round" />
      <path d="M190 314v20M380 314v20" stroke="var(--success)" strokeWidth="4" strokeLinecap="round" />
      <MutedLabel x={205} y={352}>extra edge spacing</MutedLabel>
      <Label x={190} y={50}>safe placement</Label>

      <rect x="470" y="110" width="170" height="220" rx="16" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <rect x="494" y="142" width="122" height="150" rx="10" fill="color-mix(in srgb, var(--success) 9%, transparent)" stroke="var(--success)" strokeWidth="3" strokeDasharray="7 7" />
      <text x="518" y="224" fill="var(--foreground)" fontSize="18" fontWeight="900">text</text>
      <MutedLabel x={450} y={365}>important elements stay inside safe area</MutedLabel>
    </g>
  );
}

function CanvaCropUnsafe() {
  return (
    <g>
      <rect x="92" y="70" width="616" height="320" rx="22" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <rect x="92" y="70" width="616" height="48" rx="22" fill="color-mix(in srgb, var(--primary) 12%, transparent)" />
      <Label x={126} y={102}>Canva canvas: looks centered, technically unsafe</Label>
      <rect x="135" y="148" width="240" height="190" rx="16" fill="color-mix(in srgb, var(--danger) 8%, transparent)" stroke="var(--danger)" strokeWidth="3" />
      <rect x="150" y="166" width="210" height="156" rx="12" fill="transparent" stroke="var(--primary)" strokeWidth="2.5" strokeDasharray="7 7" />
      <text x="156" y="307" fill="var(--danger)" fontSize="17" fontWeight="900">AUTHOR NAME</text>
      <path d="M150 324h210" stroke="var(--danger)" strokeWidth="4" />
      <rect x="425" y="148" width="240" height="190" rx="16" fill="color-mix(in srgb, var(--success) 8%, transparent)" stroke="var(--success)" strokeWidth="3" />
      <rect x="450" y="176" width="190" height="132" rx="12" fill="transparent" stroke="var(--success)" strokeWidth="2.5" strokeDasharray="7 7" />
      <text x="480" y="258" fill="var(--success)" fontSize="17" fontWeight="900">AUTHOR NAME</text>
      <MutedLabel x={156} y={364}>text sits in trim-risk zone</MutedLabel>
      <MutedLabel x={450} y={364}>text moved inward</MutedLabel>
    </g>
  );
}

function ThinBorderTrim() {
  return (
    <g>
      <Label x={116} y={62}>thin border problem</Label>
      <rect x="110" y="90" width="235" height="290" rx="18" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <rect x="124" y="105" width="207" height="260" rx="12" fill="transparent" stroke="var(--danger)" strokeWidth="4" />
      <rect x="139" y="112" width="207" height="260" rx="12" fill="transparent" stroke="var(--primary)" strokeWidth="2" strokeDasharray="7 7" opacity=".65" />
      <MutedLabel x={128} y={410}>tiny trim shift looks uneven</MutedLabel>

      <Label x={470} y={62}>safer border spacing</Label>
      <rect x="455" y="90" width="235" height="290" rx="18" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <rect x="500" y="140" width="145" height="190" rx="12" fill="transparent" stroke="var(--success)" strokeWidth="5" />
      <rect x="478" y="116" width="189" height="238" rx="12" fill="transparent" stroke="var(--primary)" strokeWidth="2" strokeDasharray="7 7" opacity=".65" />
      <MutedLabel x={478} y={410}>border stays away from trim</MutedLabel>
    </g>
  );
}

function BlackCoverTrimIllusion() {
  return (
    <g>
      <CoverPageFrame x={138} y={84} tone="dark" />
      <rect x="138" y="84" width="230" height="290" rx="18" fill="none" stroke="var(--danger)" strokeWidth="4" />
      <rect x="158" y="106" width="190" height="246" rx="12" fill="none" stroke="rgba(255,255,255,.42)" strokeWidth="2" strokeDasharray="7 7" />
      <text x="184" y="230" fill="#fff" fontSize="24" fontWeight="900">BLACK</text>
      <Label x={138} y={55}>dark cover</Label>
      <MutedLabel x={118} y={410}>small shifts are highly visible</MutedLabel>

      <rect x="472" y="84" width="210" height="290" rx="18" fill="#171923" stroke="var(--border)" strokeWidth="3" />
      <path d="M472 94h210M472 374h210" stroke="var(--danger)" strokeWidth="6" opacity=".85" />
      <text x="512" y="232" fill="#fff" fontSize="24" fontWeight="900">TRIM</text>
      <path d="M440 226h42" stroke="var(--danger)" strokeWidth="4" strokeDasharray="7 7" />
      <MutedLabel x={458} y={410}>Previewer may feel cropped or shifted</MutedLabel>
    </g>
  );
}

function CorrectFullBleed() {
  return (
    <g>
      <rect x="150" y="58" width="500" height="335" rx="22" fill="color-mix(in srgb, var(--primary) 12%, transparent)" stroke="var(--danger)" strokeDasharray="9 9" strokeWidth="3" />
      <rect x="190" y="98" width="420" height="255" rx="18" fill="var(--card)" stroke="var(--primary)" strokeWidth="4" />
      <rect x="236" y="142" width="328" height="166" rx="14" fill="color-mix(in srgb, var(--success) 9%, transparent)" stroke="var(--success)" strokeDasharray="7 7" strokeWidth="3" />
      <path d="M150 120c92 54 140 18 226 58 80 37 124 96 274 34v181H150Z" fill="color-mix(in srgb, var(--primary) 18%, transparent)" />
      <text x="318" y="226" fill="var(--foreground)" fontSize="26" fontWeight="900">TITLE</text>
      <MutedLabel x={196} y={82}>background extends to bleed</MutedLabel>
      <MutedLabel x={438} y={335}>text remains protected</MutedLabel>
    </g>
  );
}

function EdgeSpacingComparison() {
  return (
    <g>
      <Label x={150} y={60}>bad edge spacing</Label>
      <rect x="126" y="92" width="245" height="292" rx="18" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <rect x="140" y="108" width="217" height="260" rx="12" fill="transparent" stroke="var(--primary)" strokeWidth="2.5" strokeDasharray="7 7" />
      <text x="132" y="246" fill="var(--danger)" fontSize="24" fontWeight="950">TITLE</text>
      <path d="M140 108v260" stroke="var(--danger)" strokeWidth="4" />

      <Label x={486} y={60}>correct spacing</Label>
      <rect x="456" y="92" width="245" height="292" rx="18" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <rect x="484" y="126" width="189" height="224" rx="12" fill="transparent" stroke="var(--success)" strokeWidth="2.5" strokeDasharray="7 7" />
      <text x="538" y="246" fill="var(--foreground)" fontSize="24" fontWeight="950">TITLE</text>
      <path d="M456 246h64" stroke="var(--success)" strokeWidth="4" strokeLinecap="round" />
      <MutedLabel x={154} y={414}>title touches trim-risk zone</MutedLabel>
      <MutedLabel x={494} y={414}>more padding survives trim variation</MutedLabel>
    </g>
  );
}

function BlurSharpComparison() {
  return (
    <g>
      <Label x={138} y={56}>blurry: low-resolution source</Label>
      <Label x={488} y={56}>sharp: 300 DPI print-ready</Label>

      {/* Left panel — blurry */}
      <rect x={112} y={78} width={238} height={300} rx={18} fill="var(--card)" stroke="var(--danger)" strokeWidth={3} />
      <rect x={132} y={106} width={198} height={148} rx={6} fill="color-mix(in srgb, var(--primary) 8%, transparent)" />
      {/* Coarse pixel blocks simulating pixelation */}
      <rect x={132} y={106} width={33} height={29} fill="color-mix(in srgb, var(--primary) 34%, transparent)" />
      <rect x={165} y={106} width={27} height={29} fill="color-mix(in srgb, var(--primary) 14%, transparent)" />
      <rect x={192} y={106} width={35} height={29} fill="color-mix(in srgb, var(--primary) 40%, transparent)" />
      <rect x={227} y={106} width={29} height={29} fill="color-mix(in srgb, var(--primary) 18%, transparent)" />
      <rect x={256} y={106} width={33} height={29} fill="color-mix(in srgb, var(--primary) 28%, transparent)" />
      <rect x={289} y={106} width={27} height={29} fill="color-mix(in srgb, var(--primary) 12%, transparent)" />
      <rect x={316} y={106} width={14} height={29} fill="color-mix(in srgb, var(--primary) 30%, transparent)" />
      <rect x={132} y={135} width={29} height={31} fill="color-mix(in srgb, var(--primary) 20%, transparent)" />
      <rect x={161} y={135} width={35} height={31} fill="color-mix(in srgb, var(--primary) 36%, transparent)" />
      <rect x={196} y={135} width={27} height={31} fill="color-mix(in srgb, var(--primary) 16%, transparent)" />
      <rect x={223} y={135} width={33} height={31} fill="color-mix(in srgb, var(--primary) 32%, transparent)" />
      <rect x={256} y={135} width={29} height={31} fill="color-mix(in srgb, var(--primary) 12%, transparent)" />
      <rect x={285} y={135} width={33} height={31} fill="color-mix(in srgb, var(--primary) 24%, transparent)" />
      <rect x={318} y={135} width={12} height={31} fill="color-mix(in srgb, var(--primary) 28%, transparent)" />
      <rect x={132} y={166} width={35} height={29} fill="color-mix(in srgb, var(--primary) 26%, transparent)" />
      <rect x={167} y={166} width={27} height={29} fill="color-mix(in srgb, var(--primary) 16%, transparent)" />
      <rect x={194} y={166} width={33} height={29} fill="color-mix(in srgb, var(--primary) 38%, transparent)" />
      <rect x={227} y={166} width={29} height={29} fill="color-mix(in srgb, var(--primary) 14%, transparent)" />
      <rect x={256} y={166} width={35} height={29} fill="color-mix(in srgb, var(--primary) 30%, transparent)" />
      <rect x={291} y={166} width={27} height={29} fill="color-mix(in srgb, var(--primary) 22%, transparent)" />
      <rect x={318} y={166} width={12} height={29} fill="color-mix(in srgb, var(--primary) 18%, transparent)" />
      <rect x={132} y={195} width={31} height={29} fill="color-mix(in srgb, var(--primary) 32%, transparent)" />
      <rect x={163} y={195} width={33} height={29} fill="color-mix(in srgb, var(--primary) 14%, transparent)" />
      <rect x={196} y={195} width={27} height={29} fill="color-mix(in srgb, var(--primary) 36%, transparent)" />
      <rect x={223} y={195} width={35} height={29} fill="color-mix(in srgb, var(--primary) 18%, transparent)" />
      <rect x={258} y={195} width={29} height={29} fill="color-mix(in srgb, var(--primary) 28%, transparent)" />
      <rect x={287} y={195} width={33} height={29} fill="color-mix(in srgb, var(--primary) 20%, transparent)" />
      <rect x={320} y={195} width={10} height={29} fill="color-mix(in srgb, var(--primary) 24%, transparent)" />
      <rect x={132} y={224} width={33} height={30} fill="color-mix(in srgb, var(--primary) 16%, transparent)" />
      <rect x={165} y={224} width={27} height={30} fill="color-mix(in srgb, var(--primary) 34%, transparent)" />
      <rect x={192} y={224} width={35} height={30} fill="color-mix(in srgb, var(--primary) 22%, transparent)" />
      <rect x={227} y={224} width={29} height={30} fill="color-mix(in srgb, var(--primary) 38%, transparent)" />
      <rect x={256} y={224} width={33} height={30} fill="color-mix(in srgb, var(--primary) 14%, transparent)" />
      <rect x={289} y={224} width={27} height={30} fill="color-mix(in srgb, var(--primary) 26%, transparent)" />
      <rect x={316} y={224} width={14} height={30} fill="color-mix(in srgb, var(--primary) 30%, transparent)" />
      {/* Blurry text (offset/ghosted rects) */}
      <rect x={138} y={276} width={184} height={13} rx={3} fill="var(--foreground)" opacity=".25" />
      <rect x={140} y={279} width={184} height={13} rx={3} fill="var(--foreground)" opacity=".14" />
      <rect x={136} y={273} width={184} height={13} rx={3} fill="var(--foreground)" opacity=".11" />
      <rect x={152} y={302} width={140} height={10} rx={3} fill="var(--foreground)" opacity=".18" />
      <rect x={154} y={304} width={140} height={10} rx={3} fill="var(--foreground)" opacity=".12" />
      <MutedLabel x={140} y={400}>soft edges, visible pixel blocks</MutedLabel>

      {/* Right panel — sharp */}
      <rect x={450} y={78} width={238} height={300} rx={18} fill="var(--card)" stroke="var(--success)" strokeWidth={3} />
      <rect x={470} y={106} width={198} height={148} rx={6} fill="color-mix(in srgb, var(--primary) 16%, transparent)" />
      <path d="M474 220c50-65 90-35 152 10" stroke="var(--primary)" strokeWidth={4} strokeLinecap="round" />
      <circle cx={546} cy={166} r={28} fill="color-mix(in srgb, var(--primary) 24%, transparent)" stroke="var(--primary)" strokeWidth={2.5} />
      <rect x={478} y={276} width={184} height={13} rx={3} fill="var(--foreground)" opacity=".86" />
      <rect x={490} y={302} width={140} height={10} rx={3} fill="var(--foreground)" opacity=".65" />
      <MutedLabel x={462} y={400}>crisp, print-ready 300 DPI output</MutedLabel>
    </g>
  );
}

function DPI72vs300() {
  return (
    <g>
      <Label x={150} y={56}>72 DPI — web quality</Label>
      <Label x={490} y={56}>300 DPI — print quality</Label>

      {/* Left: coarse 5×5 pixel grid */}
      <rect x={116} y={80} width={270} height={300} rx={18} fill="var(--card)" stroke="var(--danger)" strokeWidth={3} />
      {/* 5 columns × 6 rows of large blocks */}
      {[0,1,2,3,4,5].map((row) =>
        [0,1,2,3,4].map((col) => (
          <rect
            key={`l-${row}-${col}`}
            x={136 + col * 47}
            y={100 + row * 40}
            width={45}
            height={38}
            fill={`color-mix(in srgb, var(--primary) ${12 + ((row * 3 + col * 7) % 28)}%, transparent)`}
            stroke="var(--card)"
            strokeWidth={2}
          />
        ))
      )}
      <text x={251} y={360} fill="var(--danger)" fontSize="18" fontWeight="900" textAnchor="middle">72 pixels / inch</text>
      <text x={251} y={408} fill="var(--muted-foreground)" fontSize="14" fontWeight="650" textAnchor="middle">large blocks — blurry print</text>

      {/* Right: fine 14×14 pixel grid */}
      <rect x={454} y={80} width={270} height={300} rx={18} fill="var(--card)" stroke="var(--success)" strokeWidth={3} />
      <rect x={474} y={100} width={230} height={238} rx={4} fill="color-mix(in srgb, var(--primary) 12%, transparent)" />
      <path d="M474 100v238M484 100v238M494 100v238M504 100v238M514 100v238M524 100v238M534 100v238M544 100v238M554 100v238M564 100v238M574 100v238M584 100v238M594 100v238M604 100v238M614 100v238M624 100v238M634 100v238M644 100v238M654 100v238M664 100v238M674 100v238M684 100v238M694 100v238M704 100v238" stroke="var(--primary)" strokeWidth={0.6} opacity=".3" />
      <path d="M474 100h230M474 117h230M474 134h230M474 151h230M474 168h230M474 185h230M474 202h230M474 219h230M474 236h230M474 253h230M474 270h230M474 287h230M474 304h230M474 321h230M474 338h230" stroke="var(--primary)" strokeWidth={0.6} opacity=".3" />
      <text x={589} y={360} fill="var(--success)" fontSize="18" fontWeight="900" textAnchor="middle">300 pixels / inch</text>
      <text x={589} y={408} fill="var(--muted-foreground)" fontSize="14" fontWeight="650" textAnchor="middle">fine detail — sharp print</text>
    </g>
  );
}

function StretchedImage() {
  return (
    <g>
      <Label x={148} y={58}>original small file</Label>
      <Label x={482} y={58}>stretched to cover size — blurry</Label>

      {/* Small source image on left */}
      <rect x={130} y={140} width={118} height={148} rx={14} fill="var(--card)" stroke="var(--border)" strokeWidth={3} />
      <rect x={148} y={162} width={82} height={80} rx={8} fill="color-mix(in srgb, var(--primary) 18%, transparent)" />
      <circle cx={189} cy={202} r={20} fill="color-mix(in srgb, var(--primary) 28%, transparent)" stroke="var(--primary)" strokeWidth={2} />
      <rect x={155} y={256} width={68} height={12} rx={4} fill="var(--foreground)" opacity=".6" />
      <text x={156} y={318} fill="var(--muted-foreground)" fontSize="13" fontWeight="750">72 px × 90 px</text>

      {/* Arrow showing stretch */}
      <path d="M256 226h40" stroke="var(--danger)" strokeWidth={4} strokeDasharray="8 8" strokeLinecap="round" />
      <path d="M292 218l14 8-14 8" fill="none" stroke="var(--danger)" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />

      {/* Large stretched image on right — with coarse pixel blocks */}
      <rect x={310} y={82} width={360} height={280} rx={18} fill="var(--card)" stroke="var(--danger)" strokeWidth={3} />
      <rect x={328} y={100} width={324} height={220} rx={8} fill="color-mix(in srgb, var(--primary) 8%, transparent)" />
      {/* Big pixelation blocks */}
      {[0,1,2,3,4].map((row) =>
        [0,1,2,3,4,5,6].map((col) => (
          <rect
            key={`s-${row}-${col}`}
            x={328 + col * 46}
            y={100 + row * 44}
            width={44}
            height={42}
            fill={`color-mix(in srgb, var(--primary) ${10 + ((row * 5 + col * 9) % 30)}%, transparent)`}
            stroke="var(--card)"
            strokeWidth={1.5}
          />
        ))
      )}
      <circle cx={638} cy={92} r={22} fill="var(--card)" stroke="var(--danger)" strokeWidth={4} />
      <text x={632} y={101} fill="var(--danger)" fontSize="26" fontWeight="950">!</text>
      <MutedLabel x={356} y={400}>pixel data spread thin — visible pixelation</MutedLabel>
    </g>
  );
}

function VectorRasterText() {
  return (
    <g>
      <Label x={145} y={56}>rasterized text — blurry edges</Label>
      <Label x={486} y={56}>vector text — sharp at any size</Label>

      {/* Left: raster text panel */}
      <rect x={114} y={80} width={270} height={300} rx={18} fill="var(--card)" stroke="var(--danger)" strokeWidth={3} />
      {/* Simulate jagged/blurry text edges with offset semi-transparent rects */}
      <rect x={138} y={148} width={218} height={38} rx={4} fill="var(--foreground)" opacity=".7" />
      <rect x={140} y={151} width={218} height={38} rx={4} fill="var(--foreground)" opacity=".3" />
      <rect x={136} y={145} width={218} height={38} rx={4} fill="var(--foreground)" opacity=".2" />
      <rect x={142} y={154} width={218} height={38} rx={4} fill="var(--foreground)" opacity=".15" />
      <text x={152} y={176} fill="var(--card)" fontSize="26" fontWeight="900">TITLE</text>
      {/* Zoom circle showing jagged edges */}
      <circle cx={248} cy={280} r={58} fill="color-mix(in srgb, var(--danger) 8%, var(--card))" stroke="var(--danger)" strokeWidth={3} />
      {/* Jagged edge simulation inside zoom */}
      <rect x={198} y={260} width={12} height={8} fill="var(--foreground)" opacity=".7" />
      <rect x={210} y={254} width={10} height={6} fill="var(--foreground)" opacity=".5" />
      <rect x={220} y={262} width={14} height={8} fill="var(--foreground)" opacity=".6" />
      <rect x={234} y={256} width={10} height={7} fill="var(--foreground)" opacity=".45" />
      <rect x={244} y={263} width={12} height={8} fill="var(--foreground)" opacity=".65" />
      <rect x={256} y={255} width={10} height={7} fill="var(--foreground)" opacity=".5" />
      <rect x={266} y={261} width={14} height={8} fill="var(--foreground)" opacity=".55" />
      <rect x={280} y={257} width={10} height={7} fill="var(--foreground)" opacity=".4" />
      <rect x={290} y={265} width={8} height={6} fill="var(--foreground)" opacity=".6" />
      <text x={214} y={310} fill="var(--danger)" fontSize="12" fontWeight="750">soft, jagged edges</text>
      <MutedLabel x={140} y={404}>pixels lock detail; soft at print scale</MutedLabel>

      {/* Right: vector text panel */}
      <rect x={416} y={80} width={270} height={300} rx={18} fill="var(--card)" stroke="var(--success)" strokeWidth={3} />
      <rect x={440} y={148} width={222} height={38} rx={4} fill="var(--foreground)" opacity=".88" />
      <text x={452} y={176} fill="var(--card)" fontSize="26" fontWeight="900">TITLE</text>
      {/* Zoom circle showing crisp edge */}
      <circle cx={550} cy={280} r={58} fill="color-mix(in srgb, var(--success) 8%, var(--card))" stroke="var(--success)" strokeWidth={3} />
      <rect x={500} y={256} width={100} height={14} rx={2} fill="var(--foreground)" opacity=".9" />
      <text x={514} y={310} fill="var(--success)" fontSize="12" fontWeight="750">clean, precise edge</text>
      <MutedLabel x={440} y={404}>paths scale to any size without blur</MutedLabel>
    </g>
  );
}

function CanvaExportQuality() {
  return (
    <g>
      <Label x={226} y={62}>Canva export quality comparison</Label>

      {/* Standard PDF — bad */}
      <rect x={88} y={90} width={270} height={290} rx={22} fill="var(--card)" stroke="var(--danger)" strokeWidth={3} />
      <rect x={88} y={90} width={270} height={52} rx={22} fill="color-mix(in srgb, var(--danger) 12%, transparent)" />
      <text x={138} y={123} fill="var(--danger)" fontSize="17" fontWeight="900">Standard PDF</text>
      {/* File type steps */}
      <rect x={110} y={164} width={226} height={36} rx={10} fill="color-mix(in srgb, var(--muted) 60%, transparent)" stroke="var(--border)" />
      <text x={156} y={187} fill="var(--foreground)" fontSize="14" fontWeight="800">File type: PDF</text>
      <rect x={110} y={210} width={226} height={36} rx={10} fill="color-mix(in srgb, var(--danger) 10%, transparent)" stroke="var(--danger)" />
      <text x={134} y={233} fill="var(--danger)" fontSize="14" fontWeight="800">Quality: Standard</text>
      {/* Compression indicator */}
      <rect x={110} y={260} width={226} height={36} rx={10} fill="color-mix(in srgb, var(--danger) 8%, transparent)" stroke="var(--danger)" strokeDasharray="6 6" />
      <text x={126} y={283} fill="var(--danger)" fontSize="13" fontWeight="800">Images compressed</text>
      <circle cx={338} cy={226} r={22} fill="var(--card)" stroke="var(--danger)" strokeWidth={4} />
      <text x={332} y={235} fill="var(--danger)" fontSize="26" fontWeight="950">!</text>
      <MutedLabel x={112} y={358}>may cause blurry KDP result</MutedLabel>

      {/* PDF Print — good */}
      <rect x={442} y={90} width={270} height={290} rx={22} fill="var(--card)" stroke="var(--success)" strokeWidth={3} />
      <rect x={442} y={90} width={270} height={52} rx={22} fill="color-mix(in srgb, var(--success) 12%, transparent)" />
      <text x={498} y={123} fill="var(--success)" fontSize="17" fontWeight="900">PDF Print</text>
      <rect x={464} y={164} width={226} height={36} rx={10} fill="color-mix(in srgb, var(--muted) 60%, transparent)" stroke="var(--border)" />
      <text x={510} y={187} fill="var(--foreground)" fontSize="14" fontWeight="800">File type: PDF</text>
      <rect x={464} y={210} width={226} height={36} rx={10} fill="color-mix(in srgb, var(--success) 10%, transparent)" stroke="var(--success)" />
      <text x={494} y={233} fill="var(--success)" fontSize="14" fontWeight="800">Quality: Print</text>
      <rect x={464} y={260} width={226} height={36} rx={10} fill="color-mix(in srgb, var(--success) 8%, transparent)" stroke="var(--success)" strokeDasharray="6 6" />
      <text x={472} y={283} fill="var(--success)" fontSize="13" fontWeight="800">Full image quality preserved</text>
      <circle cx={680} cy={226} r={22} fill="var(--card)" stroke="var(--success)" strokeWidth={4} />
      <path d="M670 226l8 9 18-20" fill="none" stroke="var(--success)" strokeWidth="3.5" strokeLinecap="round" />
      <MutedLabel x={466} y={358}>sharp print result every time</MutedLabel>
    </g>
  );
}

function CompressionDarkCover() {
  return (
    <g>
      <Label x={238} y={56}>JPEG compression on dark covers</Label>

      {/* Dark cover */}
      <rect x={218} y={80} width={364} height={300} rx={22} fill="#171923" stroke="var(--border)" strokeWidth={3} />
      {/* Compression artifact blocks — slightly different shades of dark */}
      {[0,1,2,3,4].map((row) =>
        [0,1,2,3,4,5,6,7].map((col) => (
          <rect
            key={`c-${row}-${col}`}
            x={228 + col * 44}
            y={90 + row * 54}
            width={43}
            height={52}
            fill={`rgba(${30 + ((row * 7 + col * 11) % 20)}, ${28 + ((row * 5 + col * 13) % 18)}, ${42 + ((row * 9 + col * 7) % 22)}, 1)`}
          />
        ))
      )}
      {/* Artifact highlight labels */}
      <circle cx={340} cy={182} r={28} fill="transparent" stroke="var(--danger)" strokeWidth={3} strokeDasharray="7 7" />
      <circle cx={492} cy={262} r={24} fill="transparent" stroke="var(--danger)" strokeWidth={3} strokeDasharray="7 7" />
      <path d="M368 182h60" stroke="var(--danger)" strokeWidth={3} strokeDasharray="6 6" />
      <rect x={424} y={168} width={118} height={30} rx={8} fill="var(--card)" stroke="var(--danger)" strokeWidth={2} />
      <text x={436} y={189} fill="var(--danger)" fontSize="14" fontWeight="850">artifact block</text>
      <path d="M516 262h62" stroke="var(--danger)" strokeWidth={3} strokeDasharray="6 6" />
      <rect x={574} y={249} width={110} height={28} rx={8} fill="var(--card)" stroke="var(--danger)" strokeWidth={2} />
      <text x={584} y={268} fill="var(--danger)" fontSize="14" fontWeight="850">color banding</text>
      <MutedLabel x={238} y={404}>solid-black backgrounds reveal JPEG artifacts in KDP print</MutedLabel>
    </g>
  );
}

function ResolutionCheckWorkflow() {
  const steps = ['Check\nresolution', 'Verify\ndoc DPI', 'Replace\nassets', 'PDF Print\nexport', 'Inspect\nPDF'];
  return (
    <g>
      <Label x={256} y={62}>resolution fix workflow</Label>
      {steps.map((step, i) => {
        const x = 56 + i * 144;
        const lines = step.split('\n');
        return (
          <g key={step}>
            <rect x={x} y={148} width={118} height={88} rx={16}
              fill={i === steps.length - 1 ? 'color-mix(in srgb, var(--success) 12%, transparent)' : 'var(--card)'}
              stroke={i === steps.length - 1 ? 'var(--success)' : 'var(--primary)'}
              strokeWidth={3}
            />
            <text x={x + 59} y={183} textAnchor="middle" fill="var(--foreground)" fontSize="14" fontWeight="800">{lines[0]}</text>
            <text x={x + 59} y={203} textAnchor="middle" fill="var(--foreground)" fontSize="14" fontWeight="800">{lines[1]}</text>
            {i < steps.length - 1 && (
              <path d={`M${x + 126} 192h24`} stroke="var(--primary)" strokeWidth={3} strokeDasharray="6 6" />
            )}
          </g>
        );
      })}
      <MutedLabel x={188} y={292}>fix low-DPI images before exporting the final cover PDF</MutedLabel>
    </g>
  );
}

function PixelationExample() {
  return (
    <g>
      <Label x={220} y={56}>zoomed view of low-resolution cover</Label>

      {/* Cover frame */}
      <rect x={154} y={78} width={336} height={300} rx={20} fill="var(--card)" stroke="var(--border)" strokeWidth={3} />
      {/* Image area with pixel blocks */}
      <rect x={174} y={98} width={296} height={200} rx={10} fill="color-mix(in srgb, var(--primary) 8%, transparent)" />
      {[0,1,2,3].map((row) =>
        [0,1,2,3,4,5,6].map((col) => (
          <rect
            key={`p-${row}-${col}`}
            x={174 + col * 42}
            y={98 + row * 50}
            width={41}
            height={49}
            fill={`color-mix(in srgb, var(--primary) ${10 + ((row * 6 + col * 11) % 30)}%, transparent)`}
            stroke="var(--card)"
            strokeWidth={1.5}
          />
        ))
      )}
      {/* Text area */}
      <rect x={183} y={308} width={178} height={14} rx={4} fill="var(--foreground)" opacity=".2" />
      <rect x={185} y={311} width={178} height={14} rx={4} fill="var(--foreground)" opacity=".12" />
      <rect x={181} y={305} width={178} height={14} rx={4} fill="var(--foreground)" opacity=".1" />

      {/* Zoom detail circle on right */}
      <circle cx={590} cy={224} r={88} fill="color-mix(in srgb, var(--danger) 6%, var(--card))" stroke="var(--danger)" strokeWidth={3} />
      {/* Large pixel blocks inside zoom */}
      <rect x={530} y={168} width={36} height={34} fill="color-mix(in srgb, var(--primary) 32%, transparent)" />
      <rect x={566} y={168} width={30} height={34} fill="color-mix(in srgb, var(--primary) 14%, transparent)" />
      <rect x={596} y={168} width={36} height={34} fill="color-mix(in srgb, var(--primary) 40%, transparent)" />
      <rect x={632} y={168} width={28} height={34} fill="color-mix(in srgb, var(--primary) 22%, transparent)" />
      <rect x={530} y={202} width={36} height={36} fill="color-mix(in srgb, var(--primary) 18%, transparent)" />
      <rect x={566} y={202} width={30} height={36} fill="color-mix(in srgb, var(--primary) 38%, transparent)" />
      <rect x={596} y={202} width={36} height={36} fill="color-mix(in srgb, var(--primary) 12%, transparent)" />
      <rect x={632} y={202} width={28} height={36} fill="color-mix(in srgb, var(--primary) 28%, transparent)" />
      <rect x={530} y={238} width={36} height={34} fill="color-mix(in srgb, var(--primary) 30%, transparent)" />
      <rect x={566} y={238} width={30} height={34} fill="color-mix(in srgb, var(--primary) 16%, transparent)" />
      <rect x={596} y={238} width={36} height={34} fill="color-mix(in srgb, var(--primary) 34%, transparent)" />
      <rect x={632} y={238} width={28} height={34} fill="color-mix(in srgb, var(--primary) 20%, transparent)" />
      {/* Connector line from cover to zoom */}
      <path d="M490 200l42 24" stroke="var(--danger)" strokeWidth={3} strokeDasharray="7 7" />
      <MutedLabel x={530} y={326}>individual pixels visible at 300% zoom</MutedLabel>
    </g>
  );
}

function SharpCoverExport() {
  const steps = ['300 DPI\nsource', 'PDF Print\nexport', 'Inspect\nPDF zoom', 'Upload\nto KDP'];
  return (
    <g>
      <Label x={262} y={62}>correct export workflow for sharp covers</Label>
      {steps.map((step, i) => {
        const x = 84 + i * 166;
        const lines = step.split('\n');
        const isLast = i === steps.length - 1;
        return (
          <g key={step}>
            <rect x={x} y={148} width={132} height={92} rx={18}
              fill={isLast ? 'color-mix(in srgb, var(--success) 12%, transparent)' : 'var(--card)'}
              stroke={isLast ? 'var(--success)' : 'var(--primary)'}
              strokeWidth={3}
            />
            <circle cx={x + 22} cy={148} r={14} fill={isLast ? 'var(--success)' : 'var(--primary)'} />
            <text x={x + 22} y={153} textAnchor="middle" fill="var(--card)" fontSize="13" fontWeight="900">{i + 1}</text>
            <text x={x + 66} y={187} textAnchor="middle" fill="var(--foreground)" fontSize="14" fontWeight="800">{lines[0]}</text>
            <text x={x + 66} y={207} textAnchor="middle" fill="var(--foreground)" fontSize="14" fontWeight="800">{lines[1]}</text>
            {!isLast && (
              <path d={`M${x + 140} 194h32`} stroke="var(--primary)" strokeWidth={3} strokeDasharray="6 6" />
            )}
          </g>
        );
      })}
      <MutedLabel x={196} y={296}>follow all four steps for a print-quality KDP cover</MutedLabel>
    </g>
  );
}

function InteriorCoverMismatch() {
  return (
    <g>
      <Label x={234} y={56}>interior vs cover file: mismatch detected</Label>
      {/* Interior manuscript */}
      <rect x={50} y={82} width={198} height={268} rx={14} fill="var(--card)" stroke="var(--border)" strokeWidth={3} />
      <rect x={70} y={106} width={158} height={11} rx={3} fill="var(--foreground)" opacity=".18" />
      <rect x={70} y={126} width={138} height={9} rx={3} fill="var(--foreground)" opacity=".12" />
      <rect x={70} y={143} width={148} height={9} rx={3} fill="var(--foreground)" opacity=".12" />
      <rect x={70} y={160} width={128} height={9} rx={3} fill="var(--foreground)" opacity=".12" />
      <rect x={70} y={177} width={142} height={9} rx={3} fill="var(--foreground)" opacity=".12" />
      <rect x={70} y={212} width={158} height={34} rx={8} fill="color-mix(in srgb, var(--primary) 12%, transparent)" stroke="var(--primary)" strokeWidth={2} strokeDasharray="6 6" />
      <text x={149} y={235} textAnchor="middle" fill="var(--primary)" fontSize="13" fontWeight="850">trim: 6 × 9 in</text>
      <text x={149} y={300} textAnchor="middle" fill="var(--muted-foreground)" fontSize="13" fontWeight="750">200 pages · cream</text>
      <text x={88} y={72} fill="var(--foreground)" fontSize="15" fontWeight="800">interior file</text>
      {/* Warning indicator center */}
      <circle cx={400} cy={216} r={38} fill="var(--card)" stroke="var(--danger)" strokeWidth={4} />
      <circle cx={400} cy={216} r={30} fill="color-mix(in srgb, var(--danger) 12%, transparent)" />
      <rect x={396} y={198} width={8} height={22} rx={4} fill="var(--danger)" />
      <circle cx={400} cy={230} r={5} fill="var(--danger)" />
      <text x={400} y={270} textAnchor="middle" fill="var(--danger)" fontSize="13" fontWeight="850">mismatch</text>
      <path d="M248 216h116" stroke="var(--danger)" strokeWidth={3} strokeDasharray="7 7" opacity=".6" />
      <path d="M438 216h76" stroke="var(--danger)" strokeWidth={3} strokeDasharray="7 7" opacity=".6" />
      {/* Cover file - full wrap */}
      <rect x={514} y={118} width={254} height={182} rx={14} fill="var(--card)" stroke="var(--danger)" strokeWidth={3} />
      <path d="M528 118h82v182h-82a14 14 0 0 1-14-14v-154a14 14 0 0 1 14-14z" fill="color-mix(in srgb, var(--muted) 58%, transparent)" />
      <rect x={610} y={118} width={38} height={182} fill="color-mix(in srgb, var(--danger) 16%, transparent)" />
      <path d="M610 118v182M648 118v182" stroke="var(--danger)" strokeWidth={2} />
      <path d="M648 118h108a14 14 0 0 1 14 14v154a14 14 0 0 1-14 14h-108z" fill="color-mix(in srgb, var(--surface) 80%, transparent)" />
      <text x={553} y={215} textAnchor="middle" fill="var(--foreground)" fontSize="14" fontWeight="800">back</text>
      <text x={629} y={215} textAnchor="middle" fill="var(--danger)" fontSize="12" fontWeight="800">spine</text>
      <text x={700} y={215} textAnchor="middle" fill="var(--foreground)" fontSize="14" fontWeight="800">front</text>
      <rect x={530} y={80} width={204} height={30} rx={8} fill="color-mix(in srgb, var(--danger) 12%, transparent)" stroke="var(--danger)" strokeWidth={2} />
      <text x={632} y={101} textAnchor="middle" fill="var(--danger)" fontSize="13" fontWeight="850">wrong trim size used</text>
      <text x={641} y={322} textAnchor="middle" fill="var(--foreground)" fontSize="15" fontWeight="800">cover file</text>
    </g>
  );
}

function TrimMismatchComparison() {
  return (
    <g>
      <Label x={224} y={54}>trim size mismatch: interior vs cover</Label>
      {/* Left: interior correct */}
      <rect x={48} y={76} width={296} height={298} rx={18} fill="color-mix(in srgb, var(--success) 6%, var(--card))" stroke="var(--success)" strokeWidth={3} />
      <text x={196} y={108} textAnchor="middle" fill="var(--success)" fontSize="15" fontWeight="850">interior file</text>
      <rect x={78} y={122} width={236} height={194} rx={12} fill="var(--card)" stroke="var(--border)" strokeWidth={2} />
      <rect x={96} y={140} width={200} height={10} rx={3} fill="var(--foreground)" opacity=".17" />
      <rect x={96} y={158} width={178} height={9} rx={3} fill="var(--foreground)" opacity=".12" />
      <rect x={96} y={174} width={190} height={9} rx={3} fill="var(--foreground)" opacity=".12" />
      <rect x={96} y={190} width={166} height={9} rx={3} fill="var(--foreground)" opacity=".12" />
      <rect x={96} y={242} width={200} height={30} rx={8} fill="color-mix(in srgb, var(--success) 14%, transparent)" stroke="var(--success)" strokeWidth={2} />
      <text x={196} y={263} textAnchor="middle" fill="var(--success)" fontSize="13" fontWeight="850">6 × 9 in trim</text>
      <circle cx={292} cy={332} r={20} fill="color-mix(in srgb, var(--success) 14%, transparent)" stroke="var(--success)" strokeWidth={3} />
      <path d="M282 332l7 8 14-16" stroke="var(--success)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <text x={196} y={370} textAnchor="middle" fill="var(--success)" fontSize="13" fontWeight="800">correct trim</text>
      {/* Right: cover wrong */}
      <rect x={458} y={76} width={296} height={298} rx={18} fill="color-mix(in srgb, var(--danger) 6%, var(--card))" stroke="var(--danger)" strokeWidth={3} />
      <text x={606} y={108} textAnchor="middle" fill="var(--danger)" fontSize="15" fontWeight="850">cover file</text>
      <rect x={488} y={122} width={236} height={194} rx={12} fill="var(--card)" stroke="var(--danger)" strokeWidth={2} strokeDasharray="8 8" />
      <rect x={508} y={150} width={196} height={134} rx={10} fill="color-mix(in srgb, var(--primary) 10%, transparent)" stroke="var(--primary)" strokeWidth={2} />
      <rect x={508} y={242} width={196} height={30} rx={8} fill="color-mix(in srgb, var(--danger) 14%, transparent)" stroke="var(--danger)" strokeWidth={2} />
      <text x={606} y={263} textAnchor="middle" fill="var(--danger)" fontSize="13" fontWeight="850">8.5 × 11 in trim</text>
      <circle cx={502} cy={332} r={20} fill="color-mix(in srgb, var(--danger) 12%, transparent)" stroke="var(--danger)" strokeWidth={3} />
      <path d="M493 323l18 18M511 323l-18 18" stroke="var(--danger)" strokeWidth={3} strokeLinecap="round" />
      <text x={606} y={370} textAnchor="middle" fill="var(--danger)" fontSize="13" fontWeight="800">wrong trim — mismatch</text>
    </g>
  );
}

function SpineMismatchDiagram() {
  return (
    <g>
      <Label x={220} y={56}>spine width mismatch: page count drives cover width</Label>
      {/* Interior page count box */}
      <rect x={48} y={86} width={200} height={180} rx={16} fill="var(--card)" stroke="var(--border)" strokeWidth={3} />
      <text x={148} y={118} textAnchor="middle" fill="var(--foreground)" fontSize="15" fontWeight="850">interior</text>
      <rect x={76} y={134} width={144} height={36} rx={10} fill="color-mix(in srgb, var(--primary) 14%, transparent)" stroke="var(--primary)" strokeWidth={2} />
      <text x={148} y={158} textAnchor="middle" fill="var(--primary)" fontSize="16" fontWeight="900">240 pages</text>
      <rect x={76} y={180} width={144} height={28} rx={8} fill="var(--surface)" stroke="var(--border)" strokeWidth={2} />
      <text x={148} y={199} textAnchor="middle" fill="var(--muted-foreground)" fontSize="13" fontWeight="750">cream paper</text>
      <text x={148} y={244} textAnchor="middle" fill="var(--muted-foreground)" fontSize="12" fontWeight="750">spine = 0.600 in</text>
      {/* Calculation arrow */}
      <path d="M248 178h80" stroke="var(--primary)" strokeWidth={3} strokeDasharray="7 7" />
      <polygon points="328,172 344,178 328,184" fill="var(--primary)" />
      <text x={284} y={162} textAnchor="middle" fill="var(--muted-foreground)" fontSize="11" fontWeight="750">page count</text>
      <text x={284} y={198} textAnchor="middle" fill="var(--muted-foreground)" fontSize="11" fontWeight="750">× 0.0025</text>
      {/* Cover panel showing mismatch */}
      <rect x={344} y={68} width={406} height={204} rx={16} fill="var(--card)" stroke="var(--danger)" strokeWidth={3} />
      <path d="M360 68h146v204h-146a16 16 0 0 1-16-16v-172a16 16 0 0 1 16-16z" fill="color-mix(in srgb, var(--muted) 56%, transparent)" />
      {/* Spine too narrow (built for 200 pages = 0.500in) */}
      <rect x={506} y={68} width={32} height={204} fill="color-mix(in srgb, var(--danger) 18%, transparent)" />
      <path d="M506 68v204M538 68v204" stroke="var(--danger)" strokeWidth={2} />
      <path d="M538 68h196a16 16 0 0 1 16 16v172a16 16 0 0 1-16 16h-196z" fill="color-mix(in srgb, var(--surface) 80%, transparent)" />
      <text x={425} y={176} textAnchor="middle" fill="var(--foreground)" fontSize="14" fontWeight="800">back</text>
      <text x={522} y={176} textAnchor="middle" fill="var(--danger)" fontSize="12" fontWeight="850">spine</text>
      <text x={644} y={176} textAnchor="middle" fill="var(--foreground)" fontSize="14" fontWeight="800">front</text>
      {/* Warning on spine */}
      <rect x={476} y={80} width={92} height={30} rx={8} fill="color-mix(in srgb, var(--danger) 14%, transparent)" stroke="var(--danger)" strokeWidth={2} />
      <text x={522} y={100} textAnchor="middle" fill="var(--danger)" fontSize="12" fontWeight="850">too narrow</text>
      <MutedLabel x={50} y={306}>cover was built for 200 pages (spine: 0.500 in) but interior has 240 pages (spine: 0.600 in)</MutedLabel>
    </g>
  );
}

function BleedMismatchOverlay() {
  return (
    <g>
      <Label x={222} y={54}>bleed mismatch: cover dimensions vs trim dimensions</Label>
      {/* Left: Interior PDF — trim only */}
      <text x={168} y={86} textAnchor="middle" fill="var(--foreground)" fontSize="15" fontWeight="800">interior PDF</text>
      <rect x={70} y={100} width={196} height={256} rx={12} fill="var(--card)" stroke="var(--primary)" strokeWidth={3} />
      <rect x={88} y={118} width={160} height={11} rx={3} fill="var(--foreground)" opacity=".17" />
      <rect x={88} y={137} width={140} height={9} rx={3} fill="var(--foreground)" opacity=".12" />
      <rect x={88} y={154} width={152} height={9} rx={3} fill="var(--foreground)" opacity=".12" />
      <text x={168} y={236} textAnchor="middle" fill="var(--primary)" fontSize="13" fontWeight="800">trim size only</text>
      <rect x={88} y={220} width={160} height={30} rx={8} fill="color-mix(in srgb, var(--primary) 10%, transparent)" stroke="var(--primary)" strokeWidth={2} />
      {/* Dimension lines interior */}
      <path d="M70 370h196" stroke="var(--primary)" strokeWidth={3} />
      <path d="M70 360v20M266 360v20" stroke="var(--primary)" strokeWidth={3} />
      <text x={168} y={400} textAnchor="middle" fill="var(--primary)" fontSize="13" fontWeight="800">6.00 × 9.00 in</text>
      {/* Divider */}
      <path d="M400 68v360" stroke="var(--border)" strokeWidth={2} strokeDasharray="8 8" />
      {/* Right: Cover PDF — with bleed */}
      <text x={608} y={86} textAnchor="middle" fill="var(--foreground)" fontSize="15" fontWeight="800">cover PDF (correct)</text>
      {/* Bleed extensions dashed */}
      <rect x={470} y={88} width={276} height={280} rx={14} fill="color-mix(in srgb, var(--danger) 6%, transparent)" stroke="var(--danger)" strokeWidth={2} strokeDasharray="8 8" />
      <text x={742} y={108} textAnchor="end" fill="var(--danger)" fontSize="11" fontWeight="800">+ bleed</text>
      {/* Trim area inside */}
      <rect x={483} y={100} width={250} height={256} rx={10} fill="var(--card)" stroke="var(--success)" strokeWidth={3} />
      <rect x={502} y={118} width={212} height={12} rx={3} fill="color-mix(in srgb, var(--primary) 18%, transparent)" />
      <rect x={502} y={142} width={82} height={100} rx={8} fill="color-mix(in srgb, var(--muted) 60%, transparent)" />
      <rect x={596} y={142} width={28} height={100} fill="color-mix(in srgb, var(--primary) 20%, transparent)" />
      <rect x={624} y={142} width={90} height={100} rx={8} fill="var(--card)" />
      <text x={535} y={200} textAnchor="middle" fill="var(--foreground)" fontSize="11" fontWeight="750">back</text>
      <text x={610} y={200} textAnchor="middle" fill="var(--primary)" fontSize="11" fontWeight="750">spine</text>
      <text x={669} y={200} textAnchor="middle" fill="var(--foreground)" fontSize="11" fontWeight="750">front</text>
      {/* Dimension lines cover */}
      <path d="M470 382h276" stroke="var(--success)" strokeWidth={3} />
      <path d="M470 372v20M746 372v20" stroke="var(--success)" strokeWidth={3} />
      <text x={608} y={410} textAnchor="middle" fill="var(--success)" fontSize="12" fontWeight="800">full wrap + 0.25 in bleed</text>
    </g>
  );
}

function CanvaWrongSetup() {
  // Canvas: x=140–360 (w=220), right edge x=360
  // Callouts: x=452–692 (w=240), left edge x=452
  // Lines: horizontal from x=360 to x=452 at each callout center-y
  const cx = 240; // canvas center-x
  const cl = 452; // callout left edge
  const cw = 240; // callout width
  const ccx = cl + cw / 2; // callout center-x = 572
  return (
    <g>
      {/* Title — sits above everything */}
      <Label x={cx} y={28}>canva: front-cover-only setup (incorrect)</Label>
      {/* Canvas outer rect */}
      <rect x={130} y={50} width={220} height={300} rx={14}
        fill="var(--card)" stroke="var(--danger)" strokeWidth={3} />
      {/* Inner "front-only" content area */}
      <rect x={152} y={74} width={176} height={212} rx={10}
        fill="color-mix(in srgb, var(--primary) 12%, transparent)"
        stroke="var(--primary)" strokeWidth={2} />
      <text x={cx} y={190} textAnchor="middle" fill="var(--foreground)" fontSize="16" fontWeight="800">front cover</text>
      <text x={cx} y={212} textAnchor="middle" fill="var(--muted-foreground)" fontSize="13" fontWeight="700">6 × 9 canvas</text>
      {/* "will fail" badge — below canvas */}
      <rect x={130} y={358} width={220} height={30} rx={8}
        fill="color-mix(in srgb, var(--danger) 12%, transparent)"
        stroke="var(--danger)" strokeWidth={2} />
      <text x={cx} y={378} textAnchor="middle" fill="var(--danger)" fontSize="13" fontWeight="850">front panel only — will fail</text>
      {/* Callout 1: missing back + spine (center-y = 110) */}
      <rect x={cl} y={80} width={cw} height={60} rx={12}
        fill="color-mix(in srgb, var(--danger) 8%, var(--card))"
        stroke="var(--danger)" strokeWidth={2} />
      <path d="M360 110 L452 110" stroke="var(--danger)" strokeWidth={2.5} strokeDasharray="7 5" />
      <text x={ccx} y={107} textAnchor="middle" fill="var(--danger)" fontSize="13" fontWeight="850">missing:</text>
      <text x={ccx} y={127} textAnchor="middle" fill="var(--danger)" fontSize="13" fontWeight="750">back cover + spine</text>
      {/* Callout 2: missing bleed (center-y = 208) */}
      <rect x={cl} y={178} width={cw} height={60} rx={12}
        fill="color-mix(in srgb, var(--danger) 8%, var(--card))"
        stroke="var(--danger)" strokeWidth={2} />
      <path d="M360 208 L452 208" stroke="var(--danger)" strokeWidth={2.5} strokeDasharray="7 5" />
      <text x={ccx} y={205} textAnchor="middle" fill="var(--danger)" fontSize="13" fontWeight="850">missing:</text>
      <text x={ccx} y={225} textAnchor="middle" fill="var(--danger)" fontSize="13" fontWeight="750">0.125 in bleed edges</text>
      {/* Callout 3: export format (center-y = 306) */}
      <rect x={cl} y={276} width={cw} height={60} rx={12}
        fill="color-mix(in srgb, var(--danger) 8%, var(--card))"
        stroke="var(--danger)" strokeWidth={2} />
      <path d="M360 306 L452 306" stroke="var(--danger)" strokeWidth={2.5} strokeDasharray="7 5" />
      <text x={ccx} y={303} textAnchor="middle" fill="var(--danger)" fontSize="13" fontWeight="850">export:</text>
      <text x={ccx} y={323} textAnchor="middle" fill="var(--danger)" fontSize="13" fontWeight="750">PDF Print required</text>
    </g>
  );
}

function CanvaCorrectWraparound() {
  return (
    <g>
      <Label x={220} y={46}>canva: correct full-wrap setup</Label>
      {/* Bleed area — dashed, outermost boundary */}
      <rect x={28} y={62} width={530} height={314} rx={20}
        fill="color-mix(in srgb, var(--danger) 4%, transparent)"
        stroke="var(--danger)" strokeWidth={2} strokeDasharray="8 8" />
      <text x={36} y={78} textAnchor="start" fill="var(--danger)" fontSize="12" fontWeight="800">+ bleed (0.125 in each side)</text>
      {/* Trim area — solid green border, inner rect */}
      <rect x={48} y={82} width={490} height={274} rx={18}
        fill="var(--card)" stroke="var(--success)" strokeWidth={3} />
      {/* Back cover — left corners rounded, right edge straight */}
      <path d="M66 82h164v274h-164a18 18 0 0 1-18-18v-238a18 18 0 0 1 18-18z"
        fill="color-mix(in srgb, var(--muted) 62%, transparent)" />
      {/* Spine fill */}
      <rect x={230} y={82} width={68} height={274}
        fill="color-mix(in srgb, var(--primary) 14%, transparent)" />
      <path d="M230 82v274M298 82v274" stroke="var(--success)" strokeWidth={2} />
      {/* Front cover — right corners rounded, left edge straight */}
      <path d="M298 82h222a18 18 0 0 1 18 18v238a18 18 0 0 1-18 18h-222z"
        fill="color-mix(in srgb, var(--primary) 7%, transparent)" />
      {/* Front cover: image block + text lines */}
      <rect x={316} y={102} width={202} height={136} rx={10}
        fill="color-mix(in srgb, var(--primary) 18%, transparent)" />
      <rect x={316} y={252} width={138} height={10} rx={3} fill="var(--foreground)" opacity=".22" />
      <rect x={316} y={268} width={104} height={8} rx={3} fill="var(--foreground)" opacity=".15" />
      {/* Section labels */}
      <text x={139} y={228} textAnchor="middle" fill="var(--foreground)" fontSize="16" fontWeight="800">back</text>
      <text x={264} y={228} textAnchor="middle" fill="var(--primary)" fontSize="14" fontWeight="850">spine</text>
      <text x={418} y={228} textAnchor="middle" fill="var(--foreground)" fontSize="16" fontWeight="800">front</text>
      {/* Dimension line below bleed box */}
      <path d="M28 392h530" stroke="var(--success)" strokeWidth={2.5} />
      <path d="M28 382v20M558 382v20" stroke="var(--success)" strokeWidth={2.5} />
      <text x={293} y={420} textAnchor="middle" fill="var(--success)" fontSize="13" fontWeight="800">full wrap + 0.25 in bleed</text>
      {/* Right info panel */}
      <rect x={574} y={86} width={200} height={48} rx={12}
        fill="color-mix(in srgb, var(--success) 14%, transparent)" stroke="var(--success)" strokeWidth={3} />
      <circle cx={596} cy={110} r={13} fill="color-mix(in srgb, var(--success) 20%, transparent)" stroke="var(--success)" strokeWidth={2} />
      <path d="M589 110l5 6 11-12" stroke="var(--success)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <text x={676} y={116} textAnchor="middle" fill="var(--success)" fontSize="14" fontWeight="900">correct setup</text>
      <rect x={574} y={148} width={200} height={60} rx={12}
        fill="var(--card)" stroke="var(--border)" strokeWidth={2} />
      <text x={674} y={174} textAnchor="middle" fill="var(--muted-foreground)" fontSize="12" fontWeight="750">export as:</text>
      <text x={674} y={198} textAnchor="middle" fill="var(--success)" fontSize="16" fontWeight="900">PDF Print</text>
      <rect x={574} y={222} width={200} height={80} rx={12}
        fill="var(--card)" stroke="var(--border)" strokeWidth={2} />
      <text x={674} y={248} textAnchor="middle" fill="var(--muted-foreground)" fontSize="12" fontWeight="750">width =</text>
      <text x={674} y={268} textAnchor="middle" fill="var(--foreground)" fontSize="12" fontWeight="800">back + spine + front</text>
      <text x={674} y={287} textAnchor="middle" fill="var(--primary)" fontSize="12" fontWeight="800">+ 0.25 in bleed</text>
    </g>
  );
}

function PdfDimensionCheck() {
  return (
    <g>
      <Label x={212} y={54}>verify pdf dimensions before uploading</Label>
      {/* Document rectangle */}
      <rect x={68} y={78} width={330} height={298} rx={16} fill="var(--card)" stroke="var(--border)" strokeWidth={3} />
      {/* Interior page lines */}
      <rect x={96} y={110} width={274} height={13} rx={3} fill="var(--foreground)" opacity=".17" />
      <rect x={96} y={132} width={240} height={10} rx={3} fill="var(--foreground)" opacity=".11" />
      <rect x={96} y={150} width={258} height={10} rx={3} fill="var(--foreground)" opacity=".11" />
      <rect x={96} y={168} width={226} height={10} rx={3} fill="var(--foreground)" opacity=".11" />
      <rect x={96} y={186} width={244} height={10} rx={3} fill="var(--foreground)" opacity=".11" />
      <rect x={96} y={238} width={274} height={10} rx={3} fill="var(--foreground)" opacity=".11" />
      <rect x={96} y={256} width={248} height={10} rx={3} fill="var(--foreground)" opacity=".11" />
      {/* Width dimension arrow */}
      <path d="M68 392h330" stroke="var(--primary)" strokeWidth={3} />
      <path d="M68 382v20M398 382v20" stroke="var(--primary)" strokeWidth={3} />
      <text x={233} y={425} textAnchor="middle" fill="var(--primary)" fontSize="14" fontWeight="850">width = back + spine + front + 0.25 in</text>
      {/* Height dimension arrow */}
      <path d="M38 78v298" stroke="var(--success)" strokeWidth={3} />
      <path d="M28 78h20M28 376h20" stroke="var(--success)" strokeWidth={3} />
      <text x={22} y={232} textAnchor="middle" fill="var(--success)" fontSize="13" fontWeight="850" transform="rotate(-90 22 232)">height = trim + 0.25 in</text>
      {/* Check panel right */}
      <rect x={444} y={88} width={300} height={70} rx={14} fill="color-mix(in srgb, var(--success) 10%, var(--card))" stroke="var(--success)" strokeWidth={3} />
      <circle cx={474} cy={123} r={16} fill="color-mix(in srgb, var(--success) 16%, transparent)" stroke="var(--success)" strokeWidth={2} />
      <path d="M465 123l6 7 13-14" stroke="var(--success)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <text x={498} y={117} fill="var(--foreground)" fontSize="13" fontWeight="800">dimensions match KDP spec</text>
      <text x={498} y={137} fill="var(--success)" fontSize="13" fontWeight="800">ready to upload</text>
      <rect x={444} y={174} width={300} height={70} rx={14} fill="color-mix(in srgb, var(--danger) 8%, var(--card))" stroke="var(--danger)" strokeWidth={3} />
      <circle cx={474} cy={209} r={16} fill="color-mix(in srgb, var(--danger) 14%, transparent)" stroke="var(--danger)" strokeWidth={2} />
      <path d="M465 200l18 18M483 200l-18 18" stroke="var(--danger)" strokeWidth={2.5} strokeLinecap="round" />
      <text x={498} y={203} fill="var(--foreground)" fontSize="13" fontWeight="800">dimensions do not match</text>
      <text x={498} y={223} fill="var(--danger)" fontSize="13" fontWeight="800">rebuild cover before upload</text>
      <rect x={444} y={262} width={300} height={56} rx={14} fill="var(--card)" stroke="var(--border)" strokeWidth={2} />
      <text x={594} y={286} textAnchor="middle" fill="var(--muted-foreground)" fontSize="12" fontWeight="800">check: File → Properties</text>
      <text x={594} y={308} textAnchor="middle" fill="var(--muted-foreground)" fontSize="12" fontWeight="750">in Acrobat Reader or Preview</text>
    </g>
  );
}

function FileAlignmentWorkflow() {
  const steps = ['Finalize\nmanuscript', 'Lock\npage count', 'Download\ntemplate', 'Design\ncover', 'Verify\nPDFs', 'Upload\nto KDP'];
  return (
    <g>
      <Label x={222} y={56}>correct file alignment workflow</Label>
      {steps.map((step, i) => {
        const x = 36 + i * 124;
        const lines = step.split('\n');
        const isLast = i === steps.length - 1;
        const isCritical = i === 1;
        return (
          <g key={step}>
            <rect x={x} y={130} width={106} height={88} rx={14}
              fill={isLast ? 'color-mix(in srgb, var(--success) 12%, transparent)' : isCritical ? 'color-mix(in srgb, var(--primary) 10%, transparent)' : 'var(--card)'}
              stroke={isLast ? 'var(--success)' : isCritical ? 'var(--primary)' : 'var(--border)'}
              strokeWidth={3}
            />
            <circle cx={x + 18} cy={130} r={13} fill={isLast ? 'var(--success)' : isCritical ? 'var(--primary)' : 'var(--muted-foreground)'} />
            <text x={x + 18} y={135} textAnchor="middle" fill="var(--card)" fontSize="12" fontWeight="900">{i + 1}</text>
            <text x={x + 53} y={168} textAnchor="middle" fill="var(--foreground)" fontSize="13" fontWeight="800">{lines[0]}</text>
            <text x={x + 53} y={186} textAnchor="middle" fill="var(--foreground)" fontSize="13" fontWeight="800">{lines[1]}</text>
            {!isLast && (
              <path d={`M${x + 114} 174h16`} stroke="var(--border)" strokeWidth={2.5} strokeDasharray="5 5" />
            )}
            {isCritical && (
              <>
                <rect x={x - 10} y={240} width={126} height={34} rx={8} fill="color-mix(in srgb, var(--primary) 10%, transparent)" stroke="var(--primary)" strokeWidth={2} />
                <text x={x + 53} y={263} textAnchor="middle" fill="var(--primary)" fontSize="11" fontWeight="850">finalize first!</text>
              </>
            )}
          </g>
        );
      })}
      <MutedLabel x={108} y={320}>never start the cover until the interior page count is completely final</MutedLabel>
    </g>
  );
}

function PageFrame({
  x,
  y,
  danger = false,
  dark = false,
}: {
  x: number;
  y: number;
  danger?: boolean;
  dark?: boolean;
}) {
  return (
    <g>
      <rect x={x} y={y} width={148} height={212} rx={14} fill={danger ? 'color-mix(in srgb, var(--danger) 8%, transparent)' : 'color-mix(in srgb, var(--success) 8%, transparent)'} stroke={danger ? 'var(--danger)' : 'var(--success)'} strokeDasharray="8 8" strokeWidth={2.5} />
      <rect x={x + 14} y={y + 14} width={120} height={184} rx={10} fill={dark ? 'var(--foreground)' : 'var(--card)'} stroke="var(--primary)" strokeWidth={2.5} />
      <rect x={x + 34} y={y + 44} width={80} height={88} rx={8} fill={dark ? 'var(--card)' : 'color-mix(in srgb, var(--primary) 16%, transparent)'} opacity={dark ? '.1' : '1'} />
      <rect x={x + 38} y={y + 152} width={72} height={9} rx={3} fill={dark ? 'var(--card)' : 'var(--foreground)'} opacity={dark ? '.72' : '.18'} />
      <rect x={x + 48} y={y + 170} width={52} height={7} rx={3} fill={dark ? 'var(--card)' : 'var(--foreground)'} opacity={dark ? '.48' : '.12'} />
    </g>
  );
}

function StatusBadge({ x, y, label, good = false }: { x: number; y: number; label: string; good?: boolean }) {
  return (
    <g>
      <rect x={x} y={y} width={142} height={34} rx={9} fill={`color-mix(in srgb, ${good ? 'var(--success)' : 'var(--danger)'} 11%, var(--card))`} stroke={good ? 'var(--success)' : 'var(--danger)'} strokeWidth={2} />
      <text x={x + 71} y={y + 22} textAnchor="middle" fill={good ? 'var(--success)' : 'var(--danger)'} fontSize="12" fontWeight="900">{label}</text>
    </g>
  );
}

function ForgotBleedComparison() {
  return (
    <g>
      <Label x={112} y={48}>bleed vs no bleed</Label>
      <PageFrame x={100} y={86} />
      <StatusBadge x={103} y={320} label="correct bleed" good />
      <text x={174} y={72} textAnchor="middle" fill="var(--success)" fontSize="13" fontWeight="850">art extends past trim</text>
      <path d="M282 200h92" stroke="var(--border)" strokeWidth={3} strokeDasharray="7 7" />
      <text x={328} y={186} textAnchor="middle" fill="var(--muted-foreground)" fontSize="12" fontWeight="800">KDP trim</text>
      <PageFrame x={420} y={86} danger />
      <rect x={434} y={100} width={120} height={184} rx={10} fill="var(--card)" stroke="var(--danger)" strokeWidth={2.5} />
      <rect x={442} y={108} width={104} height={168} rx={8} fill="color-mix(in srgb, var(--primary) 13%, transparent)" />
      <path d="M434 100h120M434 284h120M434 100v184M554 100v184" stroke="var(--danger)" strokeWidth={3} />
      <StatusBadge x={423} y={320} label="no bleed risk" />
      <text x={494} y={72} textAnchor="middle" fill="var(--danger)" fontSize="13" fontWeight="850">art stops at trim</text>
    </g>
  );
}

function WhiteEdgeSimulation() {
  return (
    <g>
      <Label x={220} y={48}>why white edges appear</Label>
      <rect x={96} y={86} width={228} height={270} rx={18} fill="var(--card)" stroke="var(--border)" strokeWidth={3} />
      <rect x={116} y={106} width={188} height={230} rx={12} fill="color-mix(in srgb, var(--primary) 18%, transparent)" stroke="var(--primary)" strokeWidth={3} />
      <text x={210} y={224} textAnchor="middle" fill="var(--foreground)" fontSize="16" fontWeight="850">expected trim</text>
      <path d="M372 222h64" stroke="var(--primary)" strokeWidth={3} markerEnd="url(#arrow-white-edge-simulation)" />
      <rect x={488} y={86} width={228} height={270} rx={18} fill="var(--card)" stroke="var(--danger)" strokeWidth={3} />
      <rect x={522} y={106} width={174} height={230} rx={12} fill="color-mix(in srgb, var(--primary) 18%, transparent)" />
      <rect x={504} y={106} width={18} height={230} rx={4} fill="var(--card)" stroke="var(--danger)" strokeWidth={2} />
      <text x={609} y={224} textAnchor="middle" fill="var(--foreground)" fontSize="16" fontWeight="850">shifted cut</text>
      <rect x={462} y={372} width={104} height={28} rx={8} fill="color-mix(in srgb, var(--danger) 10%, var(--card))" stroke="var(--danger)" strokeWidth={2} />
      <text x={514} y={391} textAnchor="middle" fill="var(--danger)" fontSize="12" fontWeight="900">white edge</text>
      <MutedLabel x={170} y={390}>normal trim tolerance</MutedLabel>
      <MutedLabel x={594} y={390}>background stopped too soon</MutedLabel>
    </g>
  );
}

function EdgeToEdgeCorrect() {
  return (
    <g>
      <Label x={196} y={48}>correct edge-to-edge setup</Label>
      <rect x={154} y={72} width={492} height={300} rx={20} fill="color-mix(in srgb, var(--danger) 8%, transparent)" stroke="var(--danger)" strokeDasharray="8 8" strokeWidth={3} />
      <rect x={190} y={106} width={420} height={232} rx={16} fill="color-mix(in srgb, var(--primary) 14%, transparent)" stroke="var(--primary)" strokeWidth={3} />
      <rect x={250} y={154} width={300} height={138} rx={12} fill="color-mix(in srgb, var(--success) 9%, var(--card))" stroke="var(--success)" strokeDasharray="7 7" strokeWidth={3} />
      <text x={230} y={94} fill="var(--danger)" fontSize="14" fontWeight="850">bleed</text>
      <text x={204} y={132} fill="var(--primary)" fontSize="14" fontWeight="850">trim</text>
      <text x={348} y={232} fill="var(--success)" fontSize="17" fontWeight="900">safe text</text>
      <path d="M610 222h80" stroke="var(--success)" strokeWidth={3} />
      <text x={638} y={252} fill="var(--success)" fontSize="13" fontWeight="850">text stays in</text>
      <path d="M116 224h70" stroke="var(--danger)" strokeWidth={3} />
      <text x={82} y={256} fill="var(--danger)" fontSize="13" fontWeight="850">background out</text>
    </g>
  );
}

function IncorrectTrimExample() {
  return (
    <g>
      <Label x={210} y={48}>incorrect no-bleed trim setup</Label>
      <rect x={120} y={86} width={240} height={278} rx={18} fill="var(--card)" stroke="var(--danger)" strokeWidth={3} />
      <rect x={120} y={86} width={240} height={278} rx={18} fill="color-mix(in srgb, var(--primary) 16%, transparent)" />
      <path d="M128 94h224M128 356h224M128 94v262M352 94v262" stroke="var(--danger)" strokeWidth={2.5} strokeDasharray="8 8" opacity=".7" />
      <rect x={134} y={280} width={132} height={38} rx={9} fill="color-mix(in srgb, var(--danger) 12%, var(--card))" stroke="var(--danger)" strokeWidth={2.5} />
      <text x={200} y={304} textAnchor="middle" fill="var(--danger)" fontSize="15" fontWeight="900">EDGE TEXT</text>
      <rect x={466} y={118} width={210} height={216} rx={16} fill="var(--card)" stroke="var(--border)" strokeWidth={3} />
      <rect x={486} y={118} width={190} height={216} rx={12} fill="color-mix(in srgb, var(--primary) 16%, transparent)" />
      <rect x={466} y={118} width={20} height={216} fill="var(--card)" stroke="var(--danger)" strokeWidth={2.5} />
      <text x={571} y={232} textAnchor="middle" fill="var(--foreground)" fontSize="16" fontWeight="850">printed result</text>
      <text x={476} y={354} textAnchor="middle" fill="var(--danger)" fontSize="13" fontWeight="900">paper shows</text>
      <StatusBadge x={171} y={386} label="art at trim edge" />
      <StatusBadge x={500} y={386} label="visible issue" />
    </g>
  );
}

function CanvaBleedWorkflow() {
  const steps = [
    ['1', 'show bleed'],
    ['2', 'extend art'],
    ['3', 'PDF Print'],
    ['4', 'verify PDF'],
  ];
  return (
    <g>
      <Label x={214} y={48}>Canva bleed workflow</Label>
      {steps.map(([number, label], index) => {
        const x = 70 + index * 176;
        return (
          <g key={label}>
            <rect x={x} y={116} width={130} height={118} rx={16} fill="var(--card)" stroke={index === 1 ? 'var(--success)' : 'var(--border)'} strokeWidth={3} />
            <circle cx={x + 24} cy={116} r={15} fill={index === 1 ? 'var(--success)' : 'var(--primary)'} />
            <text x={x + 24} y={121} textAnchor="middle" fill="var(--card)" fontSize="13" fontWeight="900">{number}</text>
            <text x={x + 65} y={184} textAnchor="middle" fill="var(--foreground)" fontSize="14" fontWeight="850">{label}</text>
            {index < steps.length - 1 && <path d={`M${x + 140} 176h28`} stroke="var(--primary)" strokeWidth={3} markerEnd="url(#arrow-canva-bleed-workflow)" />}
          </g>
        );
      })}
      <rect x={240} y={276} width={320} height={74} rx={16} fill="color-mix(in srgb, var(--success) 10%, var(--card))" stroke="var(--success)" strokeWidth={3} />
      <text x={400} y={308} textAnchor="middle" fill="var(--success)" fontSize="16" fontWeight="900">background crosses bleed guide</text>
      <text x={400} y={332} textAnchor="middle" fill="var(--muted-foreground)" fontSize="13" fontWeight="750">text and logos stay inside safe margins</text>
    </g>
  );
}

function SafeAreaBleedMap() {
  return (
    <g>
      <Label x={216} y={48}>safe area vs bleed area</Label>
      <rect x={198} y={70} width={404} height={320} rx={20} fill="color-mix(in srgb, var(--danger) 9%, transparent)" stroke="var(--danger)" strokeDasharray="8 8" strokeWidth={3} />
      <rect x={240} y={108} width={320} height={244} rx={16} fill="var(--card)" stroke="var(--primary)" strokeWidth={3} />
      <rect x={296} y={158} width={208} height={144} rx={12} fill="color-mix(in srgb, var(--success) 10%, transparent)" stroke="var(--success)" strokeDasharray="7 7" strokeWidth={3} />
      <text x={400} y={94} textAnchor="middle" fill="var(--danger)" fontSize="15" fontWeight="900">bleed: trim-away artwork</text>
      <text x={400} y={135} textAnchor="middle" fill="var(--primary)" fontSize="15" fontWeight="900">trim: final page edge</text>
      <text x={400} y={236} textAnchor="middle" fill="var(--success)" fontSize="18" fontWeight="950">safe area</text>
      <text x={400} y={264} textAnchor="middle" fill="var(--muted-foreground)" fontSize="13" fontWeight="750">important text lives here</text>
    </g>
  );
}

function BlackPageTrimExample() {
  return (
    <g>
      <Label x={190} y={48}>full-black page trim example</Label>
      <PageFrame x={120} y={88} dark />
      <text x={194} y={326} textAnchor="middle" fill="var(--success)" fontSize="13" fontWeight="900">black extends into bleed</text>
      <rect x={438} y={88} width={160} height={224} rx={14} fill="var(--card)" stroke="var(--danger)" strokeWidth={3} />
      <rect x={462} y={106} width={126} height={188} rx={10} fill="var(--foreground)" />
      <rect x={438} y={106} width={24} height={188} fill="var(--card)" stroke="var(--danger)" strokeWidth={2} />
      <text x={518} y={326} textAnchor="middle" fill="var(--danger)" fontSize="13" fontWeight="900">white edge is obvious</text>
      <MutedLabel x={128} y={376}>low contrast risk</MutedLabel>
      <MutedLabel x={440} y={376}>high contrast risk</MutedLabel>
    </g>
  );
}

function CorrectExportSetup() {
  const checks = [
    ['Bleed setting matches file'],
    ['Artwork reaches bleed edge'],
    ['PDF dimensions verified'],
    ['No crop marks or', 'extra margins'],
  ];
  return (
    <g>
      <Label x={208} y={48}>correct export setup</Label>
      <rect x={92} y={84} width={330} height={288} rx={18} fill="var(--card)" stroke="var(--border)" strokeWidth={3} />
      <rect x={116} y={110} width={282} height={34} rx={10} fill="color-mix(in srgb, var(--primary) 12%, transparent)" stroke="var(--primary)" strokeWidth={2} />
      <text x={257} y={133} textAnchor="middle" fill="var(--primary)" fontSize="15" fontWeight="900">PDF Print export</text>
      {checks.map((lines, index) => (
        <g key={lines.join(' ')} transform={`translate(124 ${180 + index * 42})`}>
          <circle cx="10" cy="0" r="11" fill="color-mix(in srgb, var(--success) 16%, transparent)" stroke="var(--success)" strokeWidth={2.5} />
          <path d="M4 0l5 5 10-13" fill="none" stroke="var(--success)" strokeWidth={2.5} />
          <text x="32" y={lines.length > 1 ? -3 : 5} fill="var(--foreground)" fontSize="13" fontWeight="800">{lines[0]}</text>
          {lines[1] && <text x="32" y="15" fill="var(--foreground)" fontSize="13" fontWeight="800">{lines[1]}</text>}
        </g>
      ))}
      <rect x={496} y={116} width={176} height={214} rx={16} fill="color-mix(in srgb, var(--success) 10%, var(--card))" stroke="var(--success)" strokeWidth={3} />
      <text x={584} y={210} textAnchor="middle" fill="var(--success)" fontSize="20" fontWeight="950">ready</text>
      <text x={584} y={236} textAnchor="middle" fill="var(--muted-foreground)" fontSize="13" fontWeight="750">upload to Previewer</text>
    </g>
  );
}

function EdgeArtSafety() {
  return (
    <g>
      <Label x={198} y={48}>edge-art safety check</Label>
      <rect x={96} y={88} width={258} height={260} rx={18} fill="var(--card)" stroke="var(--success)" strokeWidth={3} />
      <path d="M106 100h238M106 336h238M108 100v236M342 100v236" stroke="var(--primary)" strokeWidth={8} opacity=".55" />
      <rect x={154} y={150} width={142} height={92} rx={12} fill="color-mix(in srgb, var(--success) 10%, transparent)" stroke="var(--success)" strokeDasharray="7 7" strokeWidth={3} />
      <text x={225} y={202} textAnchor="middle" fill="var(--success)" fontSize="16" fontWeight="900">title safe</text>
      <StatusBadge x={154} y={370} label="safe layout" good />
      <rect x={458} y={88} width={258} height={260} rx={18} fill="var(--card)" stroke="var(--danger)" strokeWidth={3} />
      <path d="M468 100h238M468 336h238M470 100v236M704 100v236" stroke="var(--primary)" strokeWidth={8} opacity=".55" />
      <rect x={470} y={292} width={154} height={38} rx={9} fill="color-mix(in srgb, var(--danger) 12%, var(--card))" stroke="var(--danger)" strokeWidth={2.5} />
      <text x={547} y={316} textAnchor="middle" fill="var(--danger)" fontSize="15" fontWeight="900">title at edge</text>
      <StatusBadge x={516} y={370} label="unsafe content" />
    </g>
  );
}

function BleedChoiceComparison() {
  return (
    <g>
      <Label x={238} y={44}>KDP bleed vs no bleed</Label>
      <rect x={70} y={74} width={276} height={280} rx={18} fill="color-mix(in srgb, var(--danger) 7%, transparent)" stroke="var(--danger)" strokeDasharray="8 8" strokeWidth={3} />
      <rect x={98} y={102} width={220} height={224} rx={14} fill="color-mix(in srgb, var(--primary) 15%, transparent)" stroke="var(--primary)" strokeWidth={3} />
      <rect x={148} y={156} width={120} height={88} rx={10} fill="color-mix(in srgb, var(--success) 10%, var(--card))" stroke="var(--success)" strokeDasharray="7 7" strokeWidth={2.5} />
      <text x={208} y={202} textAnchor="middle" fill="var(--foreground)" fontSize="16" fontWeight="900">edge art</text>
      <text x={208} y={382} textAnchor="middle" fill="var(--success)" fontSize="14" fontWeight="900">BLEED: art reaches edge</text>

      <rect x={454} y={102} width={220} height={224} rx={14} fill="var(--card)" stroke="var(--border)" strokeWidth={3} />
      <rect x={492} y={142} width={144} height={144} rx={12} fill="color-mix(in srgb, var(--primary) 11%, transparent)" stroke="var(--success)" strokeDasharray="7 7" strokeWidth={2.5} />
      <rect x={516} y={178} width={96} height={10} rx={3} fill="var(--foreground)" opacity=".2" />
      <rect x={528} y={204} width={72} height={8} rx={3} fill="var(--foreground)" opacity=".14" />
      <text x={564} y={382} textAnchor="middle" fill="var(--primary)" fontSize="14" fontWeight="900">NO BLEED: margins stay white</text>
      <text x={386} y={222} textAnchor="middle" fill="var(--muted-foreground)" fontSize="13" fontWeight="850">choose by page edge</text>
    </g>
  );
}

function NoBleedMarginPage() {
  return (
    <g>
      <Label x={236} y={48}>no-bleed page with safe margins</Label>
      <rect x={260} y={78} width={280} height={306} rx={20} fill="var(--card)" stroke="var(--border)" strokeWidth={3} />
      <rect x={310} y={132} width={180} height={198} rx={14} fill="color-mix(in srgb, var(--success) 8%, transparent)" stroke="var(--success)" strokeDasharray="7 7" strokeWidth={3} />
      <rect x={330} y={164} width={140} height={10} rx={3} fill="var(--foreground)" opacity=".18" />
      <rect x={330} y={188} width={118} height={8} rx={3} fill="var(--foreground)" opacity=".12" />
      <rect x={330} y={210} width={132} height={8} rx={3} fill="var(--foreground)" opacity=".12" />
      <text x={400} y={270} textAnchor="middle" fill="var(--success)" fontSize="17" fontWeight="900">content safe</text>
      <text x={400} y={410} textAnchor="middle" fill="var(--muted-foreground)" fontSize="13" fontWeight="800">white margin is intentional</text>
      <text x={162} y={182} textAnchor="middle" fill="var(--primary)" fontSize="13" fontWeight="850">trim edge</text>
      <path d="M206 178h48" stroke="var(--primary)" strokeWidth={3} />
      <text x={652} y={182} textAnchor="middle" fill="var(--success)" fontSize="13" fontWeight="850">safe margin</text>
      <path d="M546 178h58" stroke="var(--success)" strokeWidth={3} />
    </g>
  );
}

function BookTypeBleedGrid() {
  const rows = [
    ['Coloring', 'Bleed', 'edge art'],
    ['Novel', 'No bleed', 'text margins'],
    ['Journal', 'No bleed', 'writing space'],
    ['Photo book', 'Bleed', 'full images'],
    ['Puzzle book', 'Depends', 'grid position'],
  ];
  return (
    <g>
      <Label x={236} y={50}>book type recommendations</Label>
      <rect x={116} y={82} width={568} height={290} rx={20} fill="var(--card)" stroke="var(--border)" strokeWidth={3} />
      {rows.map(([book, choice, reason], index) => {
        const y = 126 + index * 48;
        const bleed = choice === 'Bleed';
        const depends = choice === 'Depends';
        const color = depends ? 'var(--primary)' : bleed ? 'var(--success)' : 'var(--muted-foreground)';
        return (
          <g key={book}>
            {index > 0 && <path d={`M144 ${y - 24}h512`} stroke="var(--border)" strokeWidth={1.5} />}
            <text x={160} y={y} fill="var(--foreground)" fontSize="15" fontWeight="850">{book}</text>
            <rect x={322} y={y - 22} width={112} height={30} rx={9} fill={`color-mix(in srgb, ${color} 10%, transparent)`} stroke={color} strokeWidth={2} />
            <text x={378} y={y - 2} textAnchor="middle" fill={color} fontSize="12" fontWeight="900">{choice}</text>
            <text x={488} y={y} fill="var(--muted-foreground)" fontSize="13" fontWeight="750">{reason}</text>
          </g>
        );
      })}
    </g>
  );
}

function ColoringBookBleedExample() {
  return (
    <g>
      <Label x={214} y={48}>coloring book bleed example</Label>
      <rect x={96} y={82} width={220} height={270} rx={18} fill="color-mix(in srgb, var(--success) 8%, transparent)" stroke="var(--success)" strokeDasharray="8 8" strokeWidth={3} />
      <rect x={116} y={102} width={180} height={230} rx={14} fill="var(--card)" stroke="var(--primary)" strokeWidth={3} />
      <path d="M134 222c50-90 105-92 144 0M142 224c36-38 72-42 126 0" fill="none" stroke="var(--foreground)" strokeWidth={3} opacity=".65" />
      <text x={206} y={382} textAnchor="middle" fill="var(--success)" fontSize="13" fontWeight="900">correct: line art extends</text>

      <rect x={482} y={102} width={180} height={230} rx={14} fill="var(--card)" stroke="var(--danger)" strokeWidth={3} />
      <rect x={502} y={102} width={160} height={230} rx={10} fill="color-mix(in srgb, var(--primary) 8%, transparent)" />
      <rect x={482} y={102} width={18} height={230} fill="var(--card)" stroke="var(--danger)" strokeWidth={2} />
      <path d="M506 222c45-84 99-86 136 0M514 224c34-36 66-38 116 0" fill="none" stroke="var(--foreground)" strokeWidth={3} opacity=".65" />
      <text x={572} y={382} textAnchor="middle" fill="var(--danger)" fontSize="13" fontWeight="900">wrong: white edge risk</text>
    </g>
  );
}

function JournalNoBleedExample() {
  return (
    <g>
      <Label x={224} y={48}>journal no-bleed example</Label>
      <rect x={202} y={76} width={396} height={300} rx={20} fill="var(--card)" stroke="var(--border)" strokeWidth={3} />
      <rect x={248} y={118} width={304} height={216} rx={14} fill="color-mix(in srgb, var(--success) 7%, transparent)" stroke="var(--success)" strokeDasharray="8 8" strokeWidth={3} />
      {[0, 1, 2, 3, 4].map((line) => (
        <path key={line} d={`M278 ${158 + line * 34}h244`} stroke="var(--primary)" strokeWidth={2.5} opacity=".45" />
      ))}
      <text x={400} y={358} textAnchor="middle" fill="var(--success)" fontSize="14" fontWeight="900">clean margins protect writing space</text>
      <text x={154} y={206} textAnchor="middle" fill="var(--muted-foreground)" fontSize="13" fontWeight="800">no edge art</text>
      <text x={646} y={206} textAnchor="middle" fill="var(--muted-foreground)" fontSize="13" fontWeight="800">no bleed needed</text>
    </g>
  );
}

function PaperbackCoverBleedMap() {
  return (
    <g>
      <Label x={218} y={48}>paperback cover bleed map</Label>
      <rect x={60} y={84} width={680} height={252} rx={20} fill="color-mix(in srgb, var(--danger) 7%, transparent)" stroke="var(--danger)" strokeDasharray="8 8" strokeWidth={3} />
      <rect x={86} y={110} width={628} height={200} rx={16} fill="var(--card)" stroke="var(--primary)" strokeWidth={3} />
      <rect x={106} y={130} width={236} height={160} rx={12} fill="color-mix(in srgb, var(--muted) 60%, transparent)" />
      <rect x={342} y={110} width={82} height={200} fill="color-mix(in srgb, var(--primary) 16%, transparent)" stroke="var(--primary)" strokeWidth={2} />
      <rect x={424} y={130} width={270} height={160} rx={12} fill="color-mix(in srgb, var(--success) 7%, transparent)" />
      <rect x={126} y={150} width={548} height={120} rx={12} fill="transparent" stroke="var(--success)" strokeDasharray="7 7" strokeWidth={3} />
      <text x={224} y={218} textAnchor="middle" fill="var(--foreground)" fontSize="16" fontWeight="850">back</text>
      <text x={383} y={218} textAnchor="middle" fill="var(--primary)" fontSize="14" fontWeight="900">spine</text>
      <text x={560} y={218} textAnchor="middle" fill="var(--foreground)" fontSize="16" fontWeight="850">front</text>
      <text x={400} y={364} textAnchor="middle" fill="var(--danger)" fontSize="13" fontWeight="900">bleed surrounds outside edges only</text>
      <text x={400} y={390} textAnchor="middle" fill="var(--success)" fontSize="13" fontWeight="900">titles, barcode, and logos stay inside safe area</text>
    </g>
  );
}

function CanvaBleedNoBleed() {
  return (
    <g>
      <Label x={226} y={48}>Canva bleed vs no bleed workflow</Label>
      <rect x={74} y={92} width={288} height={230} rx={18} fill="color-mix(in srgb, var(--success) 8%, transparent)" stroke="var(--success)" strokeWidth={3} />
      <rect x={100} y={118} width={236} height={178} rx={14} fill="color-mix(in srgb, var(--primary) 13%, transparent)" stroke="var(--primary)" strokeWidth={3} />
      <text x={218} y={184} textAnchor="middle" fill="var(--success)" fontSize="16" fontWeight="900">bleed project</text>
      <text x={218} y={214} textAnchor="middle" fill="var(--muted-foreground)" fontSize="12" fontWeight="800">extend background</text>
      <text x={218} y={344} textAnchor="middle" fill="var(--success)" fontSize="13" fontWeight="900">PDF Print + bleed guides</text>

      <rect x={438} y={118} width={236} height={178} rx={14} fill="var(--card)" stroke="var(--border)" strokeWidth={3} />
      <rect x={486} y={156} width={140} height={92} rx={10} fill="color-mix(in srgb, var(--success) 8%, transparent)" stroke="var(--success)" strokeDasharray="7 7" strokeWidth={2.5} />
      <text x={556} y={194} textAnchor="middle" fill="var(--primary)" fontSize="16" fontWeight="900">no bleed</text>
      <text x={556} y={224} textAnchor="middle" fill="var(--muted-foreground)" fontSize="12" fontWeight="800">keep margins</text>
      <text x={556} y={344} textAnchor="middle" fill="var(--primary)" fontSize="13" fontWeight="900">PDF Print + trim size</text>
    </g>
  );
}

function BleedDecisionFlow() {
  const steps = [
    ['Edge art?', 'yes → bleed'],
    ['Only text?', 'no bleed'],
    ['Dark pages?', 'bleed'],
    ['Journal?', 'usually no bleed'],
  ];
  return (
    <g>
      <Label x={238} y={48}>quick bleed decision flow</Label>
      {steps.map(([top, bottom], index) => {
        const x = 70 + index * 178;
        const isBleed = bottom.includes('bleed') && !bottom.includes('no bleed');
        return (
          <g key={top}>
            <rect x={x} y={130} width={132} height={92} rx={16} fill={isBleed ? 'color-mix(in srgb, var(--success) 10%, transparent)' : 'var(--card)'} stroke={isBleed ? 'var(--success)' : 'var(--border)'} strokeWidth={3} />
            <text x={x + 66} y={168} textAnchor="middle" fill="var(--foreground)" fontSize="14" fontWeight="850">{top}</text>
            <text x={x + 66} y={195} textAnchor="middle" fill={isBleed ? 'var(--success)' : 'var(--primary)'} fontSize="13" fontWeight="900">{bottom}</text>
            {index < steps.length - 1 && <path d={`M${x + 142} 176h26`} stroke="var(--border)" strokeWidth={2.5} strokeDasharray="6 6" />}
          </g>
        );
      })}
      <rect x={232} y={286} width={336} height={58} rx={14} fill="color-mix(in srgb, var(--primary) 9%, var(--card))" stroke="var(--primary)" strokeWidth={2.5} />
      <text x={400} y={310} textAnchor="middle" fill="var(--foreground)" fontSize="13" fontWeight="850">Simple rule:</text>
      <text x={400} y={331} textAnchor="middle" fill="var(--primary)" fontSize="13" fontWeight="900">edge-to-edge print needs bleed</text>
    </g>
  );
}

function TrimResultComparison() {
  return (
    <g>
      <Label x={238} y={48}>trim result simulation</Label>
      <rect x={98} y={90} width={214} height={240} rx={18} fill="color-mix(in srgb, var(--success) 8%, transparent)" stroke="var(--success)" strokeDasharray="8 8" strokeWidth={3} />
      <rect x={118} y={110} width={174} height={200} rx={14} fill="color-mix(in srgb, var(--primary) 15%, transparent)" stroke="var(--primary)" strokeWidth={3} />
      <path d="M118 110h174M118 310h174" stroke="var(--success)" strokeWidth={2} />
      <text x={205} y={360} textAnchor="middle" fill="var(--success)" fontSize="13" fontWeight="900">bleed absorbs trim shift</text>
      <rect x={488} y={110} width={174} height={200} rx={14} fill="var(--card)" stroke="var(--danger)" strokeWidth={3} />
      <rect x={510} y={110} width={152} height={200} rx={10} fill="color-mix(in srgb, var(--primary) 15%, transparent)" />
      <rect x={488} y={110} width={22} height={200} fill="var(--card)" stroke="var(--danger)" strokeWidth={2} />
      <text x={575} y={360} textAnchor="middle" fill="var(--danger)" fontSize="13" fontWeight="900">no spare artwork</text>
    </g>
  );
}

function CorrectEdgeExtension() {
  return (
    <g>
      <Label x={218} y={48}>correct edge extension</Label>
      <rect x={130} y={86} width={540} height={280} rx={20} fill="color-mix(in srgb, var(--danger) 7%, transparent)" stroke="var(--danger)" strokeDasharray="8 8" strokeWidth={3} />
      <rect x={170} y={120} width={460} height={212} rx={16} fill="color-mix(in srgb, var(--primary) 14%, transparent)" stroke="var(--primary)" strokeWidth={3} />
      <rect x={262} y={176} width={276} height={92} rx={12} fill="color-mix(in srgb, var(--success) 10%, var(--card))" stroke="var(--success)" strokeDasharray="7 7" strokeWidth={3} />
      <text x={400} y={218} textAnchor="middle" fill="var(--success)" fontSize="17" fontWeight="900">important content safe</text>
      <text x={400} y={248} textAnchor="middle" fill="var(--muted-foreground)" fontSize="12" fontWeight="800">background extends outward</text>
      <rect x={166} y={104} width={58} height={24} rx={7} fill="color-mix(in srgb, var(--danger) 10%, var(--card))" stroke="var(--danger)" strokeWidth={2} />
      <text x={195} y={121} textAnchor="middle" fill="var(--danger)" fontSize="12" fontWeight="900">bleed</text>
      <text x={184} y={142} fill="var(--primary)" fontSize="13" fontWeight="900">trim</text>
    </g>
  );
}

function CoverPanel({ x, y, w = 190, h = 270, stroke = 'var(--border)', fill = 'var(--card)' }: { x: number; y: number; w?: number; h?: number; stroke?: string; fill?: string }) {
  return <rect x={x} y={y} width={w} height={h} rx={18} fill={fill} stroke={stroke} strokeWidth={3} />;
}

function CoverSafeAreaMap() {
  return (
    <g>
      <Label x={244} y={44}>safe area vs bleed vs trim</Label>
      <rect x={222} y={72} width={356} height={314} rx={22} fill="color-mix(in srgb, var(--danger) 9%, transparent)" stroke="var(--danger)" strokeDasharray="9 9" strokeWidth={3} />
      <rect x={258} y={108} width={284} height={242} rx={18} fill="var(--card)" stroke="var(--primary)" strokeWidth={3} />
      <rect x={312} y={160} width={176} height={138} rx={14} fill="color-mix(in srgb, var(--success) 11%, transparent)" stroke="var(--success)" strokeDasharray="8 8" strokeWidth={3} />
      <text x={400} y={132} textAnchor="middle" fill="var(--primary)" fontSize={15} fontWeight={900}>trim line</text>
      <text x={400} y={226} textAnchor="middle" fill="var(--success)" fontSize={18} fontWeight={900}>safe text</text>
      <text x={400} y={253} textAnchor="middle" fill="var(--muted-foreground)" fontSize={12} fontWeight={800}>protected zone</text>
      <rect x={92} y={96} width={104} height={38} rx={10} fill="color-mix(in srgb, var(--danger) 10%, var(--card))" stroke="var(--danger)" strokeWidth={2.5} />
      <text x={144} y={120} textAnchor="middle" fill="var(--danger)" fontSize={14} fontWeight={900}>bleed</text>
      <rect x={604} y={108} width={104} height={38} rx={10} fill="color-mix(in srgb, var(--primary) 10%, var(--card))" stroke="var(--primary)" strokeWidth={2.5} />
      <text x={656} y={132} textAnchor="middle" fill="var(--primary)" fontSize={14} fontWeight={900}>trim</text>
      <rect x={604} y={246} width={104} height={38} rx={10} fill="color-mix(in srgb, var(--success) 10%, var(--card))" stroke="var(--success)" strokeWidth={2.5} />
      <text x={656} y={270} textAnchor="middle" fill="var(--success)" fontSize={14} fontWeight={900}>safe area</text>
    </g>
  );
}

function SafeTextPlacement() {
  return (
    <g>
      <Label x={278} y={50}>safe text placement</Label>
      <CoverPanel x={288} y={78} w={224} h={312} stroke="var(--success)" fill="color-mix(in srgb, var(--primary) 5%, var(--card))" />
      <rect x={326} y={126} width={148} height={216} rx={12} fill="transparent" stroke="var(--success)" strokeDasharray="8 8" strokeWidth={3} />
      <rect x={338} y={156} width={124} height={42} rx={10} fill="var(--foreground)" opacity=".82" />
      <text x={400} y={184} textAnchor="middle" fill="var(--card)" fontSize={17} fontWeight={950}>TITLE</text>
      <rect x={352} y={226} width={96} height={18} rx={8} fill="var(--primary)" opacity=".62" />
      <rect x={362} y={306} width={76} height={16} rx={8} fill="var(--foreground)" opacity=".42" />
      <text x={92} y={178} fill="var(--success)" fontSize={16} fontWeight={900}>inward spacing</text>
      <path d="M236 174h74" stroke="var(--success)" strokeWidth={3} strokeDasharray="7 7" />
      <text x={556} y={326} fill="var(--muted-foreground)" fontSize={14} fontWeight={800}>author name safe</text>
    </g>
  );
}

function UnsafeEdgePlacement() {
  return (
    <g>
      <Label x={266} y={50}>unsafe edge placement</Label>
      <CoverPanel x={288} y={78} w={224} h={312} stroke="var(--danger)" />
      <rect x={324} y={118} width={152} height={232} rx={12} fill="transparent" stroke="var(--success)" strokeDasharray="8 8" strokeWidth={3} opacity=".85" />
      <rect x={246} y={142} width={156} height={38} rx={10} fill="color-mix(in srgb, var(--danger) 12%, var(--card))" stroke="var(--danger)" strokeWidth={3} />
      <text x={324} y={167} textAnchor="middle" fill="var(--danger)" fontSize={16} fontWeight={950}>TITLE</text>
      <rect x={354} y={354} width={92} height={18} rx={8} fill="color-mix(in srgb, var(--danger) 70%, transparent)" />
      <circle cx={512} cy={362} r={20} fill="var(--card)" stroke="var(--danger)" strokeWidth={4} />
      <text x={506} y={371} fill="var(--danger)" fontSize={25} fontWeight={950}>!</text>
      <text x={76} y={226} fill="var(--danger)" fontSize={14} fontWeight={900}>outside safe zone</text>
      <text x={538} y={366} fill="var(--danger)" fontSize={14} fontWeight={900}>too low</text>
    </g>
  );
}

function SubtitleTrimSimulation() {
  return (
    <g>
      <Label x={248} y={48}>subtitle trim simulation</Label>
      <CoverPanel x={112} y={88} w={216} h={286} stroke="var(--danger)" />
      <rect x={146} y={126} width={148} height={44} rx={12} fill="var(--foreground)" opacity=".82" />
      <text x={220} y={155} textAnchor="middle" fill="var(--card)" fontSize={17} fontWeight={950}>TITLE</text>
      <rect x={126} y={316} width={188} height={34} rx={12} fill="var(--card)" stroke="var(--danger)" strokeWidth={3} />
      <text x={220} y={338} textAnchor="middle" fill="var(--danger)" fontSize={14} fontWeight={950}>subtitle too low</text>
      <path d="M112 326h216" stroke="var(--danger)" strokeWidth={4} strokeDasharray="8 8" />
      <rect x={144} y={394} width={152} height={30} rx={9} fill="color-mix(in srgb, var(--danger) 10%, var(--card))" />
      <text x={220} y={414} textAnchor="middle" fill="var(--danger)" fontSize={14} fontWeight={950}>trim can clip</text>

      <CoverPanel x={472} y={88} w={216} h={286} stroke="var(--success)" />
      <rect x={506} y={126} width={148} height={44} rx={12} fill="var(--foreground)" opacity=".82" />
      <text x={580} y={155} textAnchor="middle" fill="var(--card)" fontSize={17} fontWeight={950}>TITLE</text>
      <rect x={502} y={276} width={156} height={30} rx={11} fill="var(--card)" stroke="var(--success)" strokeWidth={3} />
      <text x={580} y={296} textAnchor="middle" fill="var(--success)" fontSize={14} fontWeight={950}>subtitle safe</text>
      <path d="M472 334h216" stroke="var(--danger)" strokeWidth={3} strokeDasharray="8 8" opacity=".55" />
      <rect x={510} y={394} width={140} height={30} rx={9} fill="color-mix(in srgb, var(--success) 10%, var(--card))" />
      <text x={580} y={414} textAnchor="middle" fill="var(--success)" fontSize={14} fontWeight={950}>space remains</text>
    </g>
  );
}

function BorderTrimRisk() {
  return (
    <g>
      <Label x={264} y={48}>border trim risk</Label>
      <CoverPanel x={104} y={94} w={216} h={274} stroke="var(--danger)" />
      <rect x={118} y={108} width={188} height={246} rx={12} fill="transparent" stroke="var(--danger)" strokeWidth={5} />
      <path d="M104 94h216v24H104Z" fill="var(--card)" opacity=".8" />
      <text x={150} y={405} fill="var(--danger)" fontSize={13} fontWeight={900}>thin border shifted</text>

      <CoverPanel x={480} y={94} w={216} h={274} stroke="var(--success)" />
      <rect x={526} y={144} width={124} height={174} rx={12} fill="transparent" stroke="var(--success)" strokeWidth={5} />
      <rect x={544} y={186} width={88} height={20} rx={8} fill="var(--foreground)" opacity=".35" />
      <text x={526} y={405} fill="var(--success)" fontSize={13} fontWeight={900}>border moved inward</text>
    </g>
  );
}

function CanvaSafeAreaWorkflow() {
  const steps = [
    ['Guides on', 'bleed visible'],
    ['Text inward', 'safe zone'],
    ['PDF Print', 'clean export'],
    ['Preflight', 'final check'],
  ];
  return (
    <g>
      <Label x={232} y={48}>Canva safe-area workflow</Label>
      {steps.map(([top, bottom], index) => {
        const x = 70 + index * 178;
        return (
          <g key={top}>
            <rect x={x} y={132} width={132} height={92} rx={16} fill="var(--card)" stroke={index === 3 ? 'var(--success)' : 'var(--primary)'} strokeWidth={3} />
            <text x={x + 66} y={169} textAnchor="middle" fill="var(--foreground)" fontSize={14} fontWeight={900}>{top}</text>
            <text x={x + 66} y={196} textAnchor="middle" fill="var(--muted-foreground)" fontSize={12} fontWeight={800}>{bottom}</text>
            {index < steps.length - 1 && <path d={`M${x + 142} 178h28`} stroke="var(--primary)" strokeWidth={3} strokeDasharray="7 7" />}
          </g>
        );
      })}
      <rect x={204} y={286} width={392} height={72} rx={16} fill="color-mix(in srgb, var(--danger) 7%, var(--card))" stroke="var(--danger)" strokeDasharray="8 8" strokeWidth={2.5} />
      <rect x={244} y={304} width={312} height={36} rx={10} fill="color-mix(in srgb, var(--success) 9%, transparent)" stroke="var(--success)" strokeDasharray="7 7" strokeWidth={2.5} />
      <text x={400} y={328} textAnchor="middle" fill="var(--success)" fontSize={13} fontWeight={900}>keep important elements inside guides</text>
    </g>
  );
}

function SafeSpacingMeasurement() {
  return (
    <g>
      <Label x={214} y={48}>correct spacing measurement</Label>
      <CoverPanel x={300} y={78} w={200} h={306} stroke="var(--primary)" />
      <rect x={342} y={130} width={116} height={202} rx={12} fill="transparent" stroke="var(--success)" strokeDasharray="8 8" strokeWidth={3} />
      <rect x={354} y={166} width={92} height={34} rx={9} fill="var(--foreground)" opacity=".78" />
      <text x={400} y={189} textAnchor="middle" fill="var(--card)" fontSize={14} fontWeight={950}>TITLE</text>
      <path d="M300 110h42" stroke="var(--success)" strokeWidth={3} />
      <path d="M300 102v16M342 102v16" stroke="var(--success)" strokeWidth={3} />
      <text x={84} y={114} fill="var(--success)" fontSize={14} fontWeight={900}>extra safety margin</text>
      <path d="M230 110h66" stroke="var(--success)" strokeWidth={3} strokeDasharray="7 7" />
      <path d="M500 356h-42" stroke="var(--danger)" strokeWidth={3} />
      <path d="M500 348v16M458 348v16" stroke="var(--danger)" strokeWidth={3} />
      <text x={538} y={362} fill="var(--danger)" fontSize={14} fontWeight={900}>trim tolerance</text>
    </g>
  );
}

function FullBlackTrimRisk() {
  return (
    <g>
      <Label x={254} y={48}>full-black trim example</Label>
      <rect x={114} y={92} width={218} height={284} rx={18} fill="#111827" stroke="var(--danger)" strokeWidth={3} />
      <rect x={114} y={92} width={14} height={284} fill="var(--card)" opacity=".95" />
      <text x={190} y={226} fill="white" fontSize={22} fontWeight={950}>DARK</text>
      <text x={164} y={406} fill="var(--danger)" fontSize={13} fontWeight={900}>white sliver visible</text>

      <rect x={470} y={76} width={250} height={316} rx={22} fill="#111827" stroke="var(--success)" strokeDasharray="8 8" strokeWidth={3} />
      <rect x={496} y={102} width={198} height={264} rx={18} fill="#111827" stroke="var(--success)" strokeWidth={3} />
      <text x={560} y={226} fill="white" fontSize={22} fontWeight={950}>DARK</text>
      <text x={520} y={406} fill="var(--success)" fontSize={13} fontWeight={900}>black extends into bleed</text>
    </g>
  );
}

function SafeCoverComposition() {
  return (
    <g>
      <Label x={238} y={48}>safe layout composition</Label>
      <CoverPanel x={276} y={78} w={248} h={312} stroke="var(--success)" fill="color-mix(in srgb, var(--primary) 5%, var(--card))" />
      <rect x={320} y={124} width={160} height={220} rx={14} fill="transparent" stroke="var(--success)" strokeDasharray="8 8" strokeWidth={3} />
      <rect x={348} y={152} width={104} height={56} rx={12} fill="var(--foreground)" opacity=".85" />
      <text x={400} y={186} textAnchor="middle" fill="var(--card)" fontSize={15} fontWeight={950}>TITLE</text>
      <rect x={356} y={232} width={88} height={18} rx={8} fill="var(--primary)" opacity=".58" />
      <circle cx={400} cy={286} r={22} fill="color-mix(in srgb, var(--primary) 16%, transparent)" stroke="var(--primary)" strokeWidth={2.5} />
      <rect x={362} y={322} width={76} height={16} rx={8} fill="var(--foreground)" opacity=".32" />
      <text x={88} y={178} fill="var(--muted-foreground)" fontSize={13} fontWeight={800}>balanced hierarchy</text>
      <text x={548} y={326} fill="var(--muted-foreground)" fontSize={13} fontWeight={800}>safe author area</text>
    </g>
  );
}

function EdgeRiskComparison() {
  return (
    <g>
      <Label x={246} y={48}>edge-risk comparison</Label>
      <CoverPanel x={92} y={96} w={220} h={270} stroke="var(--danger)" />
      <rect x={76} y={132} width={156} height={34} rx={9} fill="color-mix(in srgb, var(--danger) 13%, var(--card))" stroke="var(--danger)" strokeWidth={2.5} />
      <text x={154} y={154} textAnchor="middle" fill="var(--danger)" fontSize={13} fontWeight={900}>edge title</text>
      <rect x={122} y={330} width={166} height={20} rx={8} fill="color-mix(in srgb, var(--danger) 18%, var(--card))" stroke="var(--danger)" strokeWidth={2.5} />
      <text x={146} y={406} fill="var(--danger)" fontSize={13} fontWeight={900}>high risk</text>

      <CoverPanel x={488} y={96} w={220} h={270} stroke="var(--success)" />
      <rect x={532} y={144} width={132} height={44} rx={10} fill="var(--foreground)" opacity=".78" />
      <text x={598} y={172} textAnchor="middle" fill="var(--card)" fontSize={14} fontWeight={950}>TITLE</text>
      <rect x={544} y={250} width={108} height={18} rx={8} fill="var(--primary)" opacity=".58" />
      <rect x={556} y={310} width={84} height={16} rx={8} fill="var(--foreground)" opacity=".32" />
      <text x={550} y={406} fill="var(--success)" fontSize={13} fontWeight={900}>low risk</text>
    </g>
  );
}

function BackgroundExtensionTrim() {
  return (
    <g>
      <Label x={220} y={48}>background past trim</Label>
      <rect x={150} y={72} width={500} height={312} rx={22} fill="color-mix(in srgb, var(--primary) 17%, transparent)" stroke="var(--danger)" strokeDasharray="9 9" strokeWidth={3} />
      <rect x={196} y={116} width={408} height={226} rx={18} fill="color-mix(in srgb, var(--primary) 22%, transparent)" stroke="var(--primary)" strokeWidth={3} />
      <rect x={258} y={166} width={284} height={126} rx={14} fill="color-mix(in srgb, var(--success) 10%, var(--card))" stroke="var(--success)" strokeDasharray="8 8" strokeWidth={3} />
      <text x={400} y={204} textAnchor="middle" fill="var(--foreground)" fontSize={17} fontWeight={950}>safe content</text>
      <text x={400} y={232} textAnchor="middle" fill="var(--muted-foreground)" fontSize={13} fontWeight={850}>text stays inward</text>
      <rect x={64} y={96} width={112} height={34} rx={10} fill="var(--card)" stroke="var(--danger)" strokeWidth={2.5} />
      <text x={120} y={119} textAnchor="middle" fill="var(--danger)" fontSize={14} fontWeight={950}>bleed</text>
      <rect x={624} y={124} width={104} height={34} rx={10} fill="var(--card)" stroke="var(--primary)" strokeWidth={2.5} />
      <text x={676} y={147} textAnchor="middle" fill="var(--primary)" fontSize={14} fontWeight={950}>trim</text>
      <text x={238} y={410} fill="var(--muted-foreground)" fontSize={14} fontWeight={850}>extra background is intentionally cut away</text>
    </g>
  );
}

function WhiteEdgeBackground() {
  const bgW = 200, bgH = 260;
  
  // Left Panel
  const cx1 = 220, cy = 250; 
  const bx1 = cx1 - bgW/2, by = cy - bgH/2;
  const shift = -16;
  const cut1X = bx1 + shift, cutY = by, cutW = bgW, cutH = bgH;
  
  // Right Panel
  const cx2 = 580;
  const bx2 = cx2 - bgW/2, by2 = cy - bgH/2;
  const bleed = 16;
  const bg2X = bx2 - bleed, bg2Y = by2 - bleed, bg2W = bgW + bleed*2, bg2H = bgH + bleed*2;
  const cut2X = bx2 + shift, cut2Y = by2, cut2W = bgW, cut2H = bgH;

  return (
    <g>
      <Label x={246} y={48}>white-edge simulation</Label>

      {/* --- MIDDLE: SAME CUT INDICATOR --- */}
      <path d={`M 360 ${cy} h 80`} stroke="var(--danger)" strokeWidth={3} strokeDasharray="6 6" />
      <path d={`M 360 ${cy - 8} L 350 ${cy} L 360 ${cy + 8}`} fill="none" stroke="var(--danger)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      <text x={400} y={cy - 16} textAnchor="middle" fill="var(--danger)" fontSize={14} fontWeight={850}>cut shifts left</text>

      {/* --- LEFT PANEL: NO BLEED --- */}
      <text x={cx1} y={80} textAnchor="middle" fill="var(--foreground)" fontSize={18} fontWeight={900}>WITHOUT BLEED</text>
      
      {/* Intended Trim */}
      <rect x={bx1} y={by} width={bgW} height={bgH} rx={4} fill="none" stroke="var(--primary)" strokeDasharray="4 4" strokeWidth={2.5} opacity={0.6} />
      <text x={bx1 + bgW/2} y={by + 20} textAnchor="middle" fill="var(--primary)" fontSize={11} fontWeight={850}>intended trim</text>

      {/* Physical Paper */}
      <rect x={cut1X} y={cutY} width={cutW} height={cutH} rx={4} fill="var(--card)" stroke="var(--border)" strokeWidth={2} 
        style={{ filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.1))' }} />
        
      {/* Printed Background on Paper */}
      <rect x={bx1} y={by} width={bgW - Math.abs(shift)} height={bgH} rx={2} fill="color-mix(in srgb, var(--primary) 20%, transparent)" />
      
      {/* White Edge Highlight */}
      <rect x={cut1X} y={cutY} width={Math.abs(shift)} height={cutH} rx={4} fill="color-mix(in srgb, var(--danger) 15%, transparent)" stroke="var(--danger)" strokeWidth={2} />
      
      <rect x={cut1X + Math.abs(shift)/2 - 36} y={cutY - 30} width={72} height={20} rx={4} fill="color-mix(in srgb, var(--danger) 12%, var(--card))" stroke="var(--danger)" strokeWidth={1.5} />
      <text x={cut1X + Math.abs(shift)/2} y={cutY - 16} textAnchor="middle" fill="var(--danger)" fontSize={11} fontWeight={900}>white gap</text>
      
      <rect x={cx1 - 80} y={by + bgH + 24} width={160} height={32} rx={8} fill="color-mix(in srgb, var(--danger) 10%, var(--card))" stroke="var(--danger)" strokeWidth={2} />
      <text x={cx1} y={by + bgH + 45} textAnchor="middle" fill="var(--danger)" fontSize={14} fontWeight={850}>paper edge shows</text>

      {/* --- RIGHT PANEL: WITH BLEED --- */}
      <text x={cx2} y={80} textAnchor="middle" fill="var(--foreground)" fontSize={18} fontWeight={900}>WITH BLEED</text>
      
      {/* Bleed Boundary */}
      <rect x={bg2X} y={bg2Y} width={bg2W} height={bg2H} rx={6} fill="color-mix(in srgb, var(--danger) 4%, transparent)" stroke="var(--danger)" strokeDasharray="6 6" strokeWidth={2} />
      <rect x={bg2X + bg2W/2 - 50} y={bg2Y - 10} width={100} height={20} rx={4} fill="var(--card)" stroke="var(--danger)" strokeWidth={1.5} />
      <text x={bg2X + bg2W/2} y={bg2Y + 4} textAnchor="middle" fill="var(--danger)" fontSize={11} fontWeight={850}>required bleed</text>

      {/* Intended Trim */}
      <rect x={bx2} y={by2} width={bgW} height={bgH} rx={4} fill="none" stroke="var(--primary)" strokeDasharray="4 4" strokeWidth={2.5} opacity={0.6} />
      <text x={bx2 + bgW/2} y={by2 + 20} textAnchor="middle" fill="var(--primary)" fontSize={11} fontWeight={850}>intended trim</text>

      {/* Physical Paper */}
      <rect x={cut2X} y={cut2Y} width={cut2W} height={cut2H} rx={4} fill="var(--card)" stroke="var(--border)" strokeWidth={2} 
        style={{ filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.1))' }} />
        
      {/* Printed Background on Paper */}
      <rect x={cut2X} y={cut2Y} width={cut2W} height={cut2H} rx={2} fill="color-mix(in srgb, var(--primary) 20%, transparent)" />
      
      {/* Success Highlight */}
      <rect x={cut2X} y={cut2Y} width={cut2W} height={cut2H} rx={4} fill="none" stroke="var(--success)" strokeWidth={3} />
      
      <rect x={cx2 - 80} y={by2 + bgH + 24} width={160} height={32} rx={8} fill="color-mix(in srgb, var(--success) 10%, var(--card))" stroke="var(--success)" strokeWidth={2} />
      <text x={cx2} y={by2 + bgH + 45} textAnchor="middle" fill="var(--success)" fontSize={14} fontWeight={850}>bleed covers shift</text>

    </g>
  );
}

function TrimToleranceShift() {
  return (
    <g>
      <Label x={238} y={48}>trim tolerance</Label>
      <rect x={132} y={90} width={536} height={270} rx={22} fill="color-mix(in srgb, var(--primary) 12%, transparent)" stroke="var(--danger)" strokeDasharray="8 8" strokeWidth={3} />
      <rect x={184} y={130} width={432} height={190} rx={18} fill="var(--card)" stroke="var(--primary)" strokeWidth={3} />
      <rect x={228} y={162} width={344} height={126} rx={14} fill="transparent" stroke="var(--success)" strokeDasharray="8 8" strokeWidth={3} />
      <path d="M184 130v190" stroke="var(--danger)" strokeWidth={4} opacity=".75" />
      <path d="M204 130v190" stroke="var(--danger)" strokeWidth={4} strokeDasharray="8 8" opacity=".75" />
      <rect x={72} y={104} width={156} height={46} rx={14} fill="var(--card)" stroke="var(--danger)" strokeWidth={3} />
      <text x={150} y={133} textAnchor="middle" fill="var(--danger)" fontSize={17} fontWeight={950}>cut can shift</text>
      <text x={352} y={224} textAnchor="middle" fill="var(--success)" fontSize={17} fontWeight={950}>safe area</text>
      <text x={262} y={392} fill="var(--muted-foreground)" fontSize={14} fontWeight={850}>bleed gives trimming room</text>
    </g>
  );
}

function OversizedPrintSheet() {
  return (
    <g>
      <Label x={238} y={48}>oversized print sheet</Label>
      <rect x={94} y={92} width={250} height={292} rx={18} fill="color-mix(in srgb, var(--primary) 14%, transparent)" stroke="var(--danger)" strokeDasharray="8 8" strokeWidth={3} />
      <rect x={124} y={126} width={190} height={224} rx={14} fill="var(--card)" stroke="var(--primary)" strokeWidth={3} />
      <text x={150} y={414} fill="var(--danger)" fontSize={14} fontWeight={950}>printed larger</text>
      <path d="M374 236h72" stroke="var(--primary)" strokeWidth={4} strokeDasharray="8 8" />
      <rect x={486} y={126} width={190} height={224} rx={14} fill="var(--card)" stroke="var(--success)" strokeWidth={3} />
      <path d="M486 126h190M486 350h190M486 126v224M676 126v224" stroke="var(--success)" strokeWidth={2} />
      <text x={518} y={414} fill="var(--success)" fontSize={14} fontWeight={950}>final trimmed book</text>
      <text x={548} y={242} fill="var(--foreground)" fontSize={17} fontWeight={950}>result</text>
    </g>
  );
}

function BlackBackgroundBleed() {
  return (
    <g>
      <Label x={232} y={48}>black background bleed</Label>
      <rect x={104} y={92} width={220} height={280} rx={18} fill="#111827" stroke="var(--danger)" strokeWidth={3} />
      <rect x={104} y={92} width={14} height={280} fill="var(--card)" />
      <text x={174} y={226} fill="white" fontSize={22} fontWeight={950}>BLACK</text>
      <text x={130} y={406} fill="var(--danger)" fontSize={14} fontWeight={950}>high contrast edge</text>

      <rect x={476} y={72} width={256} height={320} rx={22} fill="#111827" stroke="var(--success)" strokeDasharray="8 8" strokeWidth={3} />
      <rect x={510} y={106} width={188} height={252} rx={16} fill="#111827" stroke="var(--success)" strokeWidth={3} />
      <text x={560} y={226} fill="white" fontSize={22} fontWeight={950}>BLACK</text>
      <text x={520} y={406} fill="var(--success)" fontSize={14} fontWeight={950}>black extends out</text>
    </g>
  );
}

function BorderBackgroundRisk() {
  return (
    <g>
      <Label x={246} y={48}>border trim problem</Label>
      <rect x={100} y={96} width={220} height={270} rx={18} fill="var(--card)" stroke="var(--danger)" strokeWidth={3} />
      <rect x={114} y={110} width={192} height={242} rx={13} fill="transparent" stroke="var(--danger)" strokeWidth={5} />
      <path d="M100 96h220v22H100Z" fill="var(--card)" opacity=".92" />
      <text x={136} y={406} fill="var(--danger)" fontSize={14} fontWeight={950}>edge frame shifts</text>

      <rect x={480} y={96} width={220} height={270} rx={18} fill="var(--card)" stroke="var(--success)" strokeWidth={3} />
      <rect x={526} y={148} width={128} height={166} rx={13} fill="transparent" stroke="var(--success)" strokeWidth={5} />
      <text x={520} y={406} fill="var(--success)" fontSize={14} fontWeight={950}>frame moved inward</text>
    </g>
  );
}

function CanvaBackgroundBleed() {
  const steps = [
    ['Show bleed', 'guides on'],
    ['Extend bg', 'past line'],
    ['Keep text', 'inside'],
    ['PDF Print', 'verify'],
  ];
  return (
    <g>
      <Label x={224} y={48}>Canva bleed workflow</Label>
      {steps.map(([top, bottom], index) => {
        const x = 70 + index * 178;
        return (
          <g key={top}>
            <rect x={x} y={126} width={132} height={92} rx={16} fill="var(--card)" stroke={index === 3 ? 'var(--success)' : 'var(--primary)'} strokeWidth={3} />
            <text x={x + 66} y={164} textAnchor="middle" fill="var(--foreground)" fontSize={14} fontWeight={950}>{top}</text>
            <text x={x + 66} y={192} textAnchor="middle" fill="var(--muted-foreground)" fontSize={12} fontWeight={850}>{bottom}</text>
            {index < steps.length - 1 && <path d={`M${x + 142} 172h28`} stroke="var(--primary)" strokeWidth={3} strokeDasharray="7 7" />}
          </g>
        );
      })}
      <rect x={208} y={286} width={384} height={76} rx={18} fill="color-mix(in srgb, var(--primary) 12%, transparent)" stroke="var(--danger)" strokeDasharray="8 8" strokeWidth={3} />
      <rect x={246} y={306} width={308} height={36} rx={10} fill="var(--card)" stroke="var(--success)" strokeWidth={2.5} />
      <text x={400} y={330} textAnchor="middle" fill="var(--success)" fontSize={13} fontWeight={950}>background crosses bleed guide</text>
    </g>
  );
}

function BleedSafeLayout() {
  return (
    <g>
      <Label x={230} y={48}>bleed / trim / safe</Label>
      <rect x={170} y={78} width={460} height={312} rx={22} fill="color-mix(in srgb, var(--danger) 8%, transparent)" stroke="var(--danger)" strokeDasharray="8 8" strokeWidth={3} />
      <rect x={214} y={120} width={372} height={226} rx={18} fill="color-mix(in srgb, var(--primary) 12%, var(--card))" stroke="var(--primary)" strokeWidth={3} />
      <rect x={278} y={176} width={244} height={114} rx={14} fill="color-mix(in srgb, var(--success) 10%, var(--card))" stroke="var(--success)" strokeDasharray="8 8" strokeWidth={3} />
      <text x={400} y={226} textAnchor="middle" fill="var(--foreground)" fontSize={17} fontWeight={950}>text here</text>
      <text x={82} y={116} fill="var(--danger)" fontSize={14} fontWeight={950}>bleed</text>
      <text x={604} y={144} fill="var(--primary)" fontSize={14} fontWeight={950}>trim</text>
      <text x={548} y={252} fill="var(--success)" fontSize={14} fontWeight={950}>safe area</text>
    </g>
  );
}

function CorrectEdgeBackground() {
  return (
    <g>
      <Label x={202} y={48}>correct edge-to-edge background</Label>
      <rect x={150} y={78} width={500} height={310} rx={22} fill="color-mix(in srgb, var(--primary) 20%, transparent)" stroke="var(--success)" strokeDasharray="8 8" strokeWidth={3} />
      <rect x={194} y={120} width={412} height={226} rx={18} fill="color-mix(in srgb, var(--primary) 24%, transparent)" stroke="var(--primary)" strokeWidth={3} />
      <rect x={286} y={178} width={228} height={84} rx={14} fill="var(--card)" stroke="var(--success)" strokeWidth={3} />
      <text x={400} y={228} textAnchor="middle" fill="var(--success)" fontSize={17} fontWeight={950}>content protected</text>
      <circle cx={628} cy={344} r={26} fill="var(--card)" stroke="var(--success)" strokeWidth={4} />
      <path d="M616 343l9 9 18-22" fill="none" stroke="var(--success)" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

function TrimEdgeOnlySetup() {
  return (
    <g>
      <Label x={232} y={48}>trim-edge-only setup</Label>
      <rect x={166} y={82} width={468} height={304} rx={22} fill="var(--card)" stroke="var(--danger)" strokeDasharray="8 8" strokeWidth={3} />
      <rect x={210} y={126} width={380} height={216} rx={18} fill="color-mix(in srgb, var(--primary) 20%, transparent)" stroke="var(--danger)" strokeWidth={3} />
      <path d="M210 126v216" stroke="var(--card)" strokeWidth={18} opacity=".92" />
      <text x={316} y={226} fill="var(--foreground)" fontSize={17} fontWeight={950}>background stops</text>
      <rect x={74} y={188} width={126} height={38} rx={11} fill="var(--card)" stroke="var(--danger)" strokeWidth={3} />
      <text x={137} y={213} textAnchor="middle" fill="var(--danger)" fontSize={14} fontWeight={950}>no bleed</text>
      <text x={500} y={400} fill="var(--danger)" fontSize={14} fontWeight={950}>white edge risk</text>
    </g>
  );
}

function SpineWrap({
  x,
  y,
  spineWidth = 58,
  tone = 'neutral',
  panelWidth = 210,
}: {
  x: number;
  y: number;
  spineWidth?: number;
  tone?: 'neutral' | 'danger' | 'success';
  panelWidth?: number;
}) {
  const backWidth = panelWidth;
  const frontWidth = panelWidth;
  const fullWidth = backWidth + spineWidth + frontWidth;
  const stroke = tone === 'danger' ? 'var(--danger)' : tone === 'success' ? 'var(--success)' : 'var(--border)';
  return (
    <g>
      <rect x={x} y={y} width={fullWidth} height={220} rx={16} fill="var(--card)" stroke={stroke} strokeWidth={3} />
      <path d={`M${x + 14} ${y}h${backWidth - 14}v220H${x + 14}A14 14 0 0 1 ${x} ${y + 206}V${y + 14}A14 14 0 0 1 ${x + 14} ${y}Z`} fill="color-mix(in srgb, var(--muted) 68%, transparent)" />
      <rect x={x + backWidth} y={y} width={spineWidth} height={220} fill="color-mix(in srgb, var(--primary) 15%, transparent)" />
      <path d={`M${x + backWidth + spineWidth} ${y}h${frontWidth - 14}A14 14 0 0 1 ${x + fullWidth} ${y + 14}v192A14 14 0 0 1 ${x + fullWidth - 14} ${y + 220}h-${frontWidth - 14}Z`} fill="color-mix(in srgb, var(--surface) 72%, transparent)" />
      <path d={`M${x + backWidth} ${y}v220M${x + backWidth + spineWidth} ${y}v220`} stroke="var(--primary)" strokeWidth={3} strokeDasharray="7 7" />
    </g>
  );
}

function SpineAlignmentAnatomy() {
  const x = 144;
  const y = 104;
  const panelW = 210;
  const spineW = 92;
  const spineX = x + panelW;       // 354
  const spineCenter = spineX + spineW / 2; // 400
  const rightEdge = x + panelW * 2 + spineW; // 656
  return (
    <g>
      <Label x={246} y={52}>spine alignment anatomy</Label>
      <SpineWrap x={x} y={y} spineWidth={spineW} panelWidth={panelW} />
      <rect x={spineX + 18} y={y + 28} width={spineW - 36} height={164} rx={10} fill="color-mix(in srgb, var(--success) 12%, transparent)" stroke="var(--success)" strokeDasharray="7 7" strokeWidth={3} />
      <path d={`M${spineCenter} ${y + 20}v180`} stroke="var(--success)" strokeWidth={3} />
      <text x={x + panelW / 2} y={220} fill="var(--foreground)" fontSize={18} fontWeight={900}>back</text>
      <text x={spineX + spineW + panelW / 2} y={220} fill="var(--foreground)" fontSize={18} fontWeight={900}>front</text>
      <text x={spineCenter} y={228} textAnchor="middle" fill="var(--primary)" fontSize={15} fontWeight={950} transform={`rotate(-90 ${spineCenter} 228)`}>SPINE</text>
      <rect x={x + 6} y={342} width={102} height={34} rx={10} fill="var(--card)" stroke="var(--primary)" strokeWidth={2.5} />
      <text x={x + 57} y={365} textAnchor="middle" fill="var(--primary)" fontSize={13} fontWeight={950}>trim edge</text>
      <rect x={spineCenter - 59} y={342} width={118} height={34} rx={10} fill="var(--card)" stroke="var(--success)" strokeWidth={2.5} />
      <text x={spineCenter} y={365} textAnchor="middle" fill="var(--success)" fontSize={13} fontWeight={950}>spine center</text>
      <rect x={rightEdge - 116} y={342} width={112} height={34} rx={10} fill="var(--card)" stroke="var(--danger)" strokeWidth={2.5} />
      <text x={rightEdge - 60} y={365} textAnchor="middle" fill="var(--danger)" fontSize={13} fontWeight={950}>unsafe edge</text>
    </g>
  );
}

function SpineCommonMistakes() {
  const items = [
    ['Thin spine', 'no room'],
    ['Edge text', 'too close'],
    ['Page count', 'changed'],
    ['Paper type', 'wrong'],
    ['Canva snap', 'misread'],
    ['PDF scale', 'resized'],
  ];
  return (
    <g>
      <Label x={260} y={46}>6 common spine mistakes</Label>
      {items.map(([title, detail], index) => {
        const col = index % 3;
        const row = Math.floor(index / 3);
        const x = 94 + col * 220;
        const y = 92 + row * 136;
        return (
          <g key={title}>
            <rect x={x} y={y} width={170} height={92} rx={16} fill="var(--card)" stroke="var(--danger)" strokeWidth={2.5} />
            <circle cx={x + 26} cy={y + 26} r={13} fill="color-mix(in srgb, var(--danger) 14%, transparent)" stroke="var(--danger)" strokeWidth={2.5} />
            <text x={x + 22} y={y + 31} fill="var(--danger)" fontSize={18} fontWeight={950}>!</text>
            <text x={x + 50} y={y + 34} fill="var(--foreground)" fontSize={15} fontWeight={950}>{title}</text>
            <text x={x + 50} y={y + 64} fill="var(--muted-foreground)" fontSize={13} fontWeight={850}>{detail}</text>
          </g>
        );
      })}
      <rect x={238} y={374} width={324} height={34} rx={11} fill="color-mix(in srgb, var(--success) 9%, var(--card))" stroke="var(--success)" strokeWidth={2.5} />
      <text x={400} y={397} textAnchor="middle" fill="var(--success)" fontSize={14} fontWeight={950}>recheck template before export</text>
    </g>
  );
}

function ThinVsSafeSpine() {
  return (
    <g>
      <Label x={126} y={58}>thin spine</Label>
      <Label x={506} y={58}>safe spine</Label>
      <SpineWrap x={76} y={108} spineWidth={30} tone="danger" panelWidth={124} />
      <text x={215} y={230} textAnchor="middle" fill="var(--danger)" fontSize={13} fontWeight={950} transform="rotate(-90 215 230)">TITLE</text>
      <rect x={140} y={350} width={150} height={34} rx={10} fill="var(--card)" stroke="var(--danger)" strokeWidth={2.5} />
      <text x={215} y={373} textAnchor="middle" fill="var(--danger)" fontSize={13} fontWeight={950}>avoid spine text</text>

      <SpineWrap x={420} y={98} spineWidth={92} tone="success" panelWidth={124} />
      <rect x={556} y={130} width={68} height={156} rx={10} fill="color-mix(in srgb, var(--success) 10%, transparent)" stroke="var(--success)" strokeDasharray="7 7" strokeWidth={3} />
      <text x={590} y={230} textAnchor="middle" fill="var(--success)" fontSize={16} fontWeight={950} transform="rotate(-90 590 230)">TITLE</text>
      <rect x={504} y={350} width={172} height={34} rx={10} fill="var(--card)" stroke="var(--success)" strokeWidth={2.5} />
      <text x={590} y={373} textAnchor="middle" fill="var(--success)" fontSize={13} fontWeight={950}>padding stays visible</text>
    </g>
  );
}

function SpineCenterWorkflow() {
  const steps = [['Template', 'exact'], ['Count', 'final'], ['Center', 'guide'], ['Padding', 'safe']];
  // Cover dimensions — centered in 800px viewBox
  const backW = 210, spineW = 120, frontW = 210;
  const cX = (800 - backW - spineW - frontW) / 2; // 130
  const cY = 236, cH = 152;
  const spineX = cX + backW;            // 340
  const spineCenter = spineX + spineW / 2; // 400
  const frontX = spineX + spineW;       // 460
  return (
    <g>
      <Label x={236} y={46}>correct spine center workflow</Label>
      {steps.map(([top, bottom], index) => {
        const bx = 74 + index * 178;
        return (
          <g key={top}>
            <rect x={bx} y={84} width={128} height={84} rx={16} fill="var(--card)" stroke={index === 3 ? 'var(--success)' : 'var(--primary)'} strokeWidth={3} />
            <text x={bx + 64} y={120} textAnchor="middle" fill="var(--foreground)" fontSize={15} fontWeight={950}>{top}</text>
            <text x={bx + 64} y={146} textAnchor="middle" fill="var(--muted-foreground)" fontSize={12} fontWeight={850}>{bottom}</text>
            {index < steps.length - 1 && <path d={`M${bx + 138} 126h28`} stroke="var(--primary)" strokeWidth={3} strokeDasharray="7 7" />}
          </g>
        );
      })}
      {/* Cover wrap */}
      <rect x={cX} y={cY} width={backW + spineW + frontW} height={cH} rx={18} fill="var(--card)" stroke="var(--border)" strokeWidth={3} />
      {/* Back panel */}
      <path d={`M${cX + 18} ${cY}h${backW - 18}v${cH}H${cX + 18}a18 18 0 0 1-18-18V${cY + 18}a18 18 0 0 1 18-18Z`} fill="color-mix(in srgb, var(--muted) 55%, transparent)" />
      {/* Spine panel */}
      <rect x={spineX} y={cY} width={spineW} height={cH} fill="color-mix(in srgb, var(--primary) 14%, transparent)" />
      {/* Front panel */}
      <path d={`M${frontX} ${cY}h${frontW - 18}a18 18 0 0 1 18 18v${cH - 36}a18 18 0 0 1-18 18H${frontX}Z`} fill="color-mix(in srgb, var(--surface) 68%, transparent)" />
      {/* Spine dividers */}
      <path d={`M${spineX} ${cY}v${cH}M${frontX} ${cY}v${cH}`} stroke="var(--primary)" strokeWidth={3} strokeDasharray="7 7" />
      {/* Center line */}
      <path d={`M${spineCenter} ${cY + 8}v${cH - 16}`} stroke="var(--success)" strokeWidth={3} />
      {/* Safe zone */}
      <rect x={spineX + 18} y={cY + 22} width={spineW - 36} height={cH - 44} rx={10} fill="color-mix(in srgb, var(--success) 10%, transparent)" stroke="var(--success)" strokeDasharray="6 6" strokeWidth={2.5} />
      {/* CENTER label */}
      <text x={spineCenter} y={cY + cH / 2 + 6} textAnchor="middle" fill="var(--success)" fontSize={15} fontWeight={950} transform={`rotate(-90 ${spineCenter} ${cY + cH / 2})`}>CENTER</text>
      {/* Panel labels */}
      <text x={cX + backW / 2} y={cY + cH / 2 + 7} textAnchor="middle" fill="var(--muted-foreground)" fontSize={16} fontWeight={700}>back</text>
      <text x={frontX + frontW / 2} y={cY + cH / 2 + 7} textAnchor="middle" fill="var(--muted-foreground)" fontSize={16} fontWeight={700}>front</text>
    </g>
  );
}

function CanvaSpineAlignment() {
  return (
    <g>
      <Label x={232} y={48}>Canva spine alignment setup</Label>
      <rect x={92} y={76} width={616} height={304} rx={22} fill="var(--card)" stroke="var(--border)" strokeWidth={3} />
      <rect x={92} y={76} width={616} height={48} rx={22} fill="color-mix(in srgb, var(--primary) 12%, transparent)" />
      <text x={124} y={107} fill="var(--foreground)" fontSize={15} fontWeight={950}>guides + rulers visible</text>
      <rect x={190} y={154} width={420} height={150} rx={16} fill="color-mix(in srgb, var(--surface) 70%, transparent)" stroke="var(--border)" strokeWidth={2.5} />
      <rect x={378} y={154} width={44} height={150} fill="color-mix(in srgb, var(--primary) 18%, transparent)" stroke="var(--primary)" strokeWidth={3} />
      <path d="M400 154v150" stroke="var(--success)" strokeWidth={3} />
      <text x={400} y={244} textAnchor="middle" fill="var(--success)" fontSize={13} fontWeight={950} transform="rotate(-90 400 244)">TEXT</text>
      <rect x={154} y={334} width={124} height={30} rx={9} fill="var(--card)" stroke="var(--primary)" strokeWidth={2.5} />
      <text x={216} y={354} textAnchor="middle" fill="var(--primary)" fontSize={12} fontWeight={950}>zoom 300%</text>
      <rect x={338} y={334} width={124} height={30} rx={9} fill="var(--card)" stroke="var(--success)" strokeWidth={2.5} />
      <text x={400} y={354} textAnchor="middle" fill="var(--success)" fontSize={12} fontWeight={950}>manual center</text>
      <rect x={522} y={334} width={124} height={30} rx={9} fill="var(--card)" stroke="var(--primary)" strokeWidth={2.5} />
      <text x={584} y={354} textAnchor="middle" fill="var(--primary)" fontSize={12} fontWeight={950}>PDF Print</text>
    </g>
  );
}

function ProSpineAlignment() {
  return (
    <g>
      <Label x={230} y={48}>professional alignment workflow</Label>
      <rect x={100} y={82} width={600} height={292} rx={22} fill="var(--card)" stroke="var(--border)" strokeWidth={3} />
      <rect x={122} y={112} width={256} height={220} rx={16} fill="color-mix(in srgb, var(--muted) 60%, transparent)" stroke="var(--border)" strokeWidth={2.5} />
      <rect x={378} y={112} width={74} height={220} fill="color-mix(in srgb, var(--primary) 16%, transparent)" stroke="var(--primary)" strokeWidth={3} />
      <rect x={452} y={112} width={226} height={220} rx={16} fill="color-mix(in srgb, var(--surface) 70%, transparent)" stroke="var(--border)" strokeWidth={2.5} />
      <path d="M415 122v200" stroke="var(--success)" strokeWidth={3} />
      <text x={415} y={246} textAnchor="middle" fill="var(--success)" fontSize={14} fontWeight={950} transform="rotate(-90 415 246)">X CENTER</text>
      <rect x={140} y={350} width={132} height={34} rx={10} fill="var(--card)" stroke="var(--primary)" strokeWidth={2.5} />
      <text x={206} y={373} textAnchor="middle" fill="var(--primary)" fontSize={13} fontWeight={950}>smart guides</text>
      <rect x={334} y={350} width={132} height={34} rx={10} fill="var(--card)" stroke="var(--success)" strokeWidth={2.5} />
      <text x={400} y={373} textAnchor="middle" fill="var(--success)" fontSize={13} fontWeight={950}>transform X/Y</text>
      <rect x={528} y={350} width={132} height={34} rx={10} fill="var(--card)" stroke="var(--primary)" strokeWidth={2.5} />
      <text x={594} y={373} textAnchor="middle" fill="var(--primary)" fontSize={13} fontWeight={950}>locked guides</text>
    </g>
  );
}

function PreviewIllusionPrint() {
  return (
    <g>
      <Label x={126} y={58}>preview illusion</Label>
      <Label x={500} y={58}>measured print file</Label>
      <rect x={118} y={94} width={238} height={284} rx={18} fill="var(--card)" stroke="var(--danger)" strokeWidth={3} />
      <rect x={218} y={94} width={42} height={284} fill="color-mix(in srgb, var(--danger) 12%, transparent)" stroke="var(--danger)" strokeWidth={3} />
      <path d="M224 104c16 74 16 190 0 264" stroke="var(--primary)" strokeWidth={4} opacity=".45" />
      <text x={245} y={244} textAnchor="middle" fill="var(--danger)" fontSize={13} fontWeight={950} transform="rotate(-90 245 244)">LOOKS SHIFTED</text>
      <rect x={466} y={94} width={238} height={284} rx={18} fill="var(--card)" stroke="var(--success)" strokeWidth={3} />
      <rect x={564} y={94} width={42} height={284} fill="color-mix(in srgb, var(--success) 10%, transparent)" stroke="var(--success)" strokeWidth={3} />
      <path d="M585 108v256" stroke="var(--success)" strokeWidth={3} />
      <text x={585} y={246} textAnchor="middle" fill="var(--success)" fontSize={13} fontWeight={950} transform="rotate(-90 585 246)">CENTERED</text>
      <text x={142} y={414} fill="var(--danger)" fontSize={13} fontWeight={900}>browser + fold render</text>
      <text x={506} y={414} fill="var(--success)" fontSize={13} fontWeight={900}>dimensions verified</text>
    </g>
  );
}

function GoodVsBadSpine() {
  return (
    <g>
      <Label x={150} y={58}>bad spine</Label>
      <Label x={520} y={58}>good spine</Label>
      <SpineWrap x={78} y={108} spineWidth={50} tone="danger" panelWidth={126} />
      <text x={229} y={238} textAnchor="middle" fill="var(--danger)" fontSize={13} fontWeight={950} transform="rotate(-90 229 238)">TINY DECORATIVE TITLE</text>
      <rect x={210} y={110} width={8} height={216} fill="var(--danger)" opacity=".18" />
      <text x={170} y={392} fill="var(--danger)" fontSize={13} fontWeight={950}>too tight</text>
      <SpineWrap x={426} y={98} spineWidth={84} tone="success" panelWidth={126} />
      <rect x={564} y={130} width={60} height={156} rx={10} fill="color-mix(in srgb, var(--success) 10%, transparent)" stroke="var(--success)" strokeDasharray="7 7" strokeWidth={3} />
      <text x={594} y={232} textAnchor="middle" fill="var(--success)" fontSize={16} fontWeight={950} transform="rotate(-90 594 232)">BOOK TITLE</text>
      <text x={524} y={392} fill="var(--success)" fontSize={13} fontWeight={950}>centered + padded</text>
    </g>
  );
}

// ─── Color / Print diagrams ────────────────────────────────────────────────

function ScreenVsPrintComparison() {
  // Left panel = vivid screen, right panel = muted print, centered in 800×450
  const lx = 82, rx = 438, py = 78, pw = 280, ph = 248;
  const midX = (lx + pw + rx) / 2 + 20; // ≈ 420 → vs-circle X
  return (
    <g>
      <Label x={268} y={50}>screen preview vs printed result</Label>

      {/* Left: screen */}
      <rect x={lx} y={py} width={pw} height={ph} rx={20} fill="var(--card)" stroke="var(--primary)" strokeWidth={3} />
      {/* Screen top bar with traffic-light dots */}
      <rect x={lx} y={py} width={pw} height={38} rx={20} fill="color-mix(in srgb, var(--primary) 14%, transparent)" />
      <circle cx={lx + 20} cy={py + 19} r={5} fill="var(--danger)" />
      <circle cx={lx + 36} cy={py + 19} r={5} fill="color-mix(in srgb, var(--primary) 80%, var(--foreground))" />
      <circle cx={lx + 52} cy={py + 19} r={5} fill="var(--success)" />
      <text x={lx + 140} y={py + 24} textAnchor="middle" fill="var(--muted-foreground)" fontSize={11} fontWeight={700}>design preview</text>
      {/* Vivid color swatches */}
      <rect x={lx + 18} y={py + 52} width={72} height={66} rx={10} fill="color-mix(in srgb, var(--danger) 68%, transparent)" />
      <rect x={lx + 104} y={py + 52} width={72} height={66} rx={10} fill="color-mix(in srgb, var(--primary) 72%, transparent)" />
      <rect x={lx + 190} y={py + 52} width={72} height={66} rx={10} fill="color-mix(in srgb, var(--success) 64%, transparent)" />
      {/* Title bar */}
      <rect x={lx + 18} y={py + 132} width={244} height={42} rx={9} fill="var(--foreground)" opacity={0.88} />
      <text x={lx + 140} y={py + 159} textAnchor="middle" fill="var(--card)" fontSize={17} fontWeight={950}>BOOK TITLE</text>
      {/* Author line */}
      <rect x={lx + 60} y={py + 186} width={160} height={14} rx={6} fill="var(--primary)" opacity={0.55} />
      {/* Label */}
      <rect x={lx + 68} y={py + ph + 14} width={144} height={30} rx={9} fill="var(--card)" stroke="var(--primary)" strokeWidth={2} />
      <text x={lx + 140} y={py + ph + 34} textAnchor="middle" fill="var(--primary)" fontSize={12} fontWeight={850}>screen — vibrant</text>

      {/* VS circle */}
      <circle cx={midX} cy={py + ph / 2} r={28} fill="var(--card)" stroke="var(--border)" strokeWidth={2.5} />
      <text x={midX} y={py + ph / 2 + 6} textAnchor="middle" fill="var(--muted-foreground)" fontSize={15} fontWeight={900}>vs</text>

      {/* Right: print */}
      <rect x={rx} y={py} width={pw} height={ph} rx={20} fill="var(--card)" stroke="var(--border)" strokeWidth={3} />
      <rect x={rx} y={py} width={pw} height={38} rx={20} fill="color-mix(in srgb, var(--muted) 48%, transparent)" />
      <text x={rx + 140} y={py + 24} textAnchor="middle" fill="var(--muted-foreground)" fontSize={11} fontWeight={700}>physical proof copy</text>
      {/* Muted color swatches */}
      <rect x={rx + 18} y={py + 52} width={72} height={66} rx={10} fill="color-mix(in srgb, var(--danger) 24%, transparent)" />
      <rect x={rx + 104} y={py + 52} width={72} height={66} rx={10} fill="color-mix(in srgb, var(--primary) 26%, transparent)" />
      <rect x={rx + 190} y={py + 52} width={72} height={66} rx={10} fill="color-mix(in srgb, var(--success) 22%, transparent)" />
      {/* Title bar (darker / muted) */}
      <rect x={rx + 18} y={py + 132} width={244} height={42} rx={9} fill="var(--foreground)" opacity={0.52} />
      <text x={rx + 140} y={py + 159} textAnchor="middle" fill="var(--card)" fontSize={17} fontWeight={950}>BOOK TITLE</text>
      {/* Author line */}
      <rect x={rx + 60} y={py + 186} width={160} height={14} rx={6} fill="var(--muted-foreground)" opacity={0.38} />
      {/* Warning badge */}
      <circle cx={rx + pw - 22} cy={py + 22} r={18} fill="var(--card)" stroke="var(--danger)" strokeWidth={3} />
      <text x={rx + pw - 28} y={py + 30} fill="var(--danger)" fontSize={20} fontWeight={950}>!</text>
      {/* Label */}
      <rect x={rx + 52} y={py + ph + 14} width={176} height={30} rx={9} fill="var(--card)" stroke="var(--border)" strokeWidth={2} />
      <text x={rx + 140} y={py + ph + 34} textAnchor="middle" fill="var(--muted-foreground)" fontSize={12} fontWeight={850}>print — softer &amp; darker</text>
    </g>
  );
}

function RgbVsPrintOutput() {
  const colors: { label: string; rgb: string; print: string }[] = [
    { label: 'Neon pink', rgb: 'color-mix(in srgb, var(--danger) 85%, transparent)', print: 'color-mix(in srgb, var(--danger) 26%, transparent)' },
    { label: 'Electric blue', rgb: 'color-mix(in srgb, var(--primary) 90%, transparent)', print: 'color-mix(in srgb, var(--primary) 28%, transparent)' },
    { label: 'Vivid green', rgb: 'color-mix(in srgb, var(--success) 80%, transparent)', print: 'color-mix(in srgb, var(--success) 24%, transparent)' },
    { label: 'Royal purple', rgb: 'color-mix(in srgb, var(--primary) 70%, var(--danger) 30%)', print: 'color-mix(in srgb, var(--primary) 22%, var(--danger) 10%)' },
  ];
  return (
    <g>
      <Label x={272} y={48}>RGB screen color vs print ink result</Label>
      {/* Column headers */}
      <text x={200} y={82} textAnchor="middle" fill="var(--primary)" fontSize={14} fontWeight={950}>RGB on screen</text>
      <text x={500} y={82} textAnchor="middle" fill="var(--muted-foreground)" fontSize={14} fontWeight={850}>printed result</text>
      <text x={350} y={82} textAnchor="middle" fill="var(--border)" fontSize={20} fontWeight={400}>→</text>
      {colors.map(({ label, rgb, print }, i) => {
        const y = 100 + i * 84;
        return (
          <g key={label}>
            <rect x={82} y={y} width={234} height={64} rx={14} fill={rgb} />
            <text x={199} y={y + 37} textAnchor="middle" fill="var(--foreground)" fontSize={13} fontWeight={950}>{label}</text>
            <path d="M332 0v0" /> {/* spacer */}
            <rect x={82 + 302} y={y} width={234} height={64} rx={14} fill={print} />
            <text x={501} y={y + 37} textAnchor="middle" fill="var(--muted-foreground)" fontSize={13} fontWeight={850}>{label} — muted</text>
            {/* Arrow */}
            <path d={`M322 ${y + 32}h62`} stroke="var(--border)" strokeWidth={2.5} strokeDasharray="6 5" />
            <path d={`M378 ${y + 26}l8 6-8 6`} fill="none" stroke="var(--border)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </g>
        );
      })}
      <rect x={230} y={444} width={340} height={0} rx={0} /> {/* keeps viewBox */}
    </g>
  );
}

function BlackPrintComparison() {
  const lx = 88, rx = 442, by = 72, bw = 270, bh = 280;
  return (
    <g>
      <Label x={272} y={50}>screen black vs printed black on matte paper</Label>

      {/* Left: screen deep black */}
      <rect x={lx} y={by} width={bw} height={bh} rx={20} fill="var(--foreground)" opacity={0.94} />
      {/* Screen glow rim */}
      <rect x={lx - 6} y={by - 6} width={bw + 12} height={bh + 12} rx={24} fill="none" stroke="var(--primary)" strokeWidth={2} opacity={0.4} />
      {/* Visible gradient detail (faint) */}
      <rect x={lx + 24} y={by + 32} width={222} height={108} rx={12} fill="color-mix(in srgb, var(--primary) 18%, transparent)" />
      <text x={lx + 135} y={by + 93} textAnchor="middle" fill="var(--card)" fontSize={20} fontWeight={950}>TITLE</text>
      <rect x={lx + 64} y={by + 158} width={142} height={14} rx={6} fill="var(--card)" opacity={0.45} />
      <rect x={lx + 90} y={by + 182} width={90} height={10} rx={5} fill="var(--card)" opacity={0.28} />
      {/* Label */}
      <rect x={lx + 50} y={by + bh + 16} width={170} height={30} rx={9} fill="var(--card)" stroke="var(--primary)" strokeWidth={2} />
      <text x={lx + 135} y={by + bh + 36} textAnchor="middle" fill="var(--primary)" fontSize={12} fontWeight={850}>screen: deep black</text>

      {/* Right: printed matte */}
      <rect x={rx} y={by} width={bw} height={bh} rx={20} fill="color-mix(in srgb, var(--foreground) 58%, var(--muted))" />
      {/* Details barely visible in print */}
      <rect x={rx + 24} y={by + 32} width={222} height={108} rx={12} fill="color-mix(in srgb, var(--muted) 20%, transparent)" />
      <text x={rx + 135} y={by + 93} textAnchor="middle" fill="var(--card)" fontSize={20} fontWeight={950}>TITLE</text>
      <rect x={rx + 64} y={by + 158} width={142} height={14} rx={6} fill="var(--card)" opacity={0.18} />
      <rect x={rx + 90} y={by + 182} width={90} height={10} rx={5} fill="var(--card)" opacity={0.10} />
      {/* Warning badge */}
      <circle cx={rx + bw - 24} cy={by + 24} r={18} fill="var(--card)" stroke="var(--danger)" strokeWidth={3} />
      <text x={rx + bw - 30} y={by + 32} fill="var(--danger)" fontSize={20} fontWeight={950}>!</text>
      {/* Label */}
      <rect x={rx + 30} y={by + bh + 16} width={210} height={30} rx={9} fill="var(--card)" stroke="var(--danger)" strokeWidth={2} />
      <text x={rx + 135} y={by + bh + 36} textAnchor="middle" fill="var(--danger)" fontSize={12} fontWeight={850}>print: soft gray on matte</text>

      {/* Fix tip */}
      <rect x={246} y={408} width={308} height={30} rx={10} fill="color-mix(in srgb, var(--success) 9%, var(--card))" stroke="var(--success)" strokeWidth={2} />
      <text x={400} y={428} textAnchor="middle" fill="var(--success)" fontSize={12} fontWeight={950}>fix: increase contrast + consider glossy</text>
    </g>
  );
}

function ExportWorkflowBadGood() {
  const bad = [
    ['PNG / JPEG export', '✗'],
    ['Screenshots as artwork', '✗'],
    ['Resize after export', '✗'],
    ['Standard PDF quality', '✗'],
  ];
  const good = [
    ['PDF Print export', '✓'],
    ['300 DPI source images', '✓'],
    ['No resize after export', '✓'],
    ['Verify file size (5–30 MB)', '✓'],
  ];
  return (
    <g>
      <Label x={236} y={46}>Canva export: common mistakes vs correct workflow</Label>
      {/* Column headers */}
      <rect x={82} y={64} width={278} height={36} rx={12} fill="color-mix(in srgb, var(--danger) 10%, var(--card))" stroke="var(--danger)" strokeWidth={2} />
      <text x={221} y={87} textAnchor="middle" fill="var(--danger)" fontSize={14} fontWeight={950}>mistakes</text>
      <rect x={440} y={64} width={278} height={36} rx={12} fill="color-mix(in srgb, var(--success) 10%, var(--card))" stroke="var(--success)" strokeWidth={2} />
      <text x={579} y={87} textAnchor="middle" fill="var(--success)" fontSize={14} fontWeight={950}>correct workflow</text>
      {/* Bad column */}
      {bad.map(([text, icon], i) => (
        <g key={text}>
          <rect x={82} y={112 + i * 72} width={278} height={54} rx={13} fill="var(--card)" stroke="var(--danger)" strokeWidth={2} />
          <circle cx={116} cy={112 + i * 72 + 27} r={14} fill="color-mix(in srgb, var(--danger) 12%, transparent)" />
          <text x={116} y={112 + i * 72 + 27} textAnchor="middle" dominantBaseline="central" fill="var(--danger)" fontSize={14} fontWeight={950}>{icon}</text>
          <text x={140} y={112 + i * 72 + 27} dominantBaseline="central" fill="var(--foreground)" fontSize={13} fontWeight={850}>{text}</text>
        </g>
      ))}
      {/* Good column */}
      {good.map(([text, icon], i) => (
        <g key={text}>
          <rect x={440} y={112 + i * 72} width={278} height={54} rx={13} fill="var(--card)" stroke="var(--success)" strokeWidth={2} />
          <circle cx={474} cy={112 + i * 72 + 27} r={14} fill="color-mix(in srgb, var(--success) 12%, transparent)" />
          <text x={474} y={112 + i * 72 + 27} textAnchor="middle" dominantBaseline="central" fill="var(--success)" fontSize={14} fontWeight={950}>{icon}</text>
          <text x={498} y={112 + i * 72 + 27} dominantBaseline="central" fill="var(--foreground)" fontSize={13} fontWeight={850}>{text}</text>
        </g>
      ))}
      {/* Divider */}
      <path d="M398 64v364" stroke="var(--border)" strokeWidth={2} strokeDasharray="6 6" />
    </g>
  );
}

function ColoringBookContrast() {
  const lx = 84, rx = 448, cy2 = 76, cw = 268, ch = 290;
  return (
    <g>
      <Label x={252} y={52}>coloring book cover: low contrast vs high contrast</Label>

      {/* Left: low contrast — muddy */}
      <rect x={lx} y={cy2} width={cw} height={ch} rx={18} fill="color-mix(in srgb, var(--foreground) 88%, transparent)" />
      {/* Near-same-shade color cells (hard to distinguish) */}
      {[0, 1, 2].map((col) =>
        [0, 1, 2].map((row) => (
          <rect
            key={`lo-${col}-${row}`}
            x={lx + 16 + col * 76}
            y={cy2 + 20 + row * 72}
            width={68}
            height={64}
            rx={8}
            fill={`color-mix(in srgb, var(--foreground) ${72 - col * 6 - row * 4}%, transparent)`}
          />
        ))
      )}
      {/* Title on low-contrast bg — barely visible */}
      <rect x={lx + 20} y={cy2 + ch - 62} width={228} height={46} rx={10} fill="color-mix(in srgb, var(--foreground) 70%, transparent)" />
      <text x={lx + 134} y={cy2 + ch - 32} textAnchor="middle" fill="color-mix(in srgb, var(--card) 50%, transparent)" fontSize={16} fontWeight={950}>TITLE</text>
      <rect x={lx + 24} y={cy2 + ch + 14} width={220} height={28} rx={9} fill="var(--card)" stroke="var(--danger)" strokeWidth={2} />
      <text x={lx + 134} y={cy2 + ch + 33} textAnchor="middle" fill="var(--danger)" fontSize={12} fontWeight={850}>low contrast — muddy print</text>

      {/* Right: high contrast — clear */}
      <rect x={rx} y={cy2} width={cw} height={ch} rx={18} fill="var(--foreground)" opacity={0.92} />
      {/* Distinct color cells */}
      {[
        ['var(--danger)', 'var(--primary)', 'var(--success)'],
        ['var(--primary)', 'var(--success)', 'var(--danger)'],
        ['var(--success)', 'var(--danger)', 'var(--primary)'],
      ].map((row, ri) =>
        row.map((color, ci) => (
          <rect
            key={`hi-${ri}-${ci}`}
            x={rx + 16 + ci * 76}
            y={cy2 + 20 + ri * 72}
            width={68}
            height={64}
            rx={8}
            fill={`color-mix(in srgb, ${color} 60%, transparent)`}
          />
        ))
      )}
      {/* Clear title */}
      <rect x={rx + 20} y={cy2 + ch - 62} width={228} height={46} rx={10} fill="var(--card)" />
      <text x={rx + 134} y={cy2 + ch - 32} textAnchor="middle" fill="var(--foreground)" fontSize={16} fontWeight={950}>TITLE</text>
      <rect x={rx + 24} y={cy2 + ch + 14} width={220} height={28} rx={9} fill="var(--card)" stroke="var(--success)" strokeWidth={2} />
      <text x={rx + 134} y={cy2 + ch + 33} textAnchor="middle" fill="var(--success)" fontSize={12} fontWeight={850}>high contrast — print-ready</text>
    </g>
  );
}

function MatteGlossyFinish() {
  const lx = 86, rx = 444, py = 78, pw = 270, ph = 270;
  return (
    <g>
      <Label x={268} y={52}>matte vs glossy laminate color appearance</Label>

      {/* Left: matte — soft */}
      <rect x={lx} y={py} width={pw} height={ph} rx={20} fill="var(--card)" stroke="var(--border)" strokeWidth={3} />
      {/* Soft matte fill */}
      <rect x={lx + 14} y={py + 14} width={pw - 28} height={ph - 28} rx={14} fill="color-mix(in srgb, var(--primary) 30%, var(--muted))" />
      <rect x={lx + 44} y={py + 52} width={182} height={52} rx={10} fill="color-mix(in srgb, var(--foreground) 55%, transparent)" />
      <text x={lx + 135} y={py + 84} textAnchor="middle" fill="var(--card)" fontSize={18} fontWeight={950}>TITLE</text>
      <rect x={lx + 80} y={py + 116} width={110} height={14} rx={6} fill="var(--card)" opacity={0.32} />
      {/* Matte texture lines (subtle) */}
      {[0, 1, 2, 3].map((i) => (
        <path key={i} d={`M${lx + 14} ${py + 168 + i * 18}h${pw - 28}`} stroke="var(--card)" strokeWidth={1} opacity={0.06} />
      ))}
      <text x={lx + 135} y={py + 232} textAnchor="middle" fill="var(--muted-foreground)" fontSize={12} fontWeight={750}>soft · non-reflective</text>
      <rect x={lx + 54} y={py + ph + 14} width={162} height={30} rx={9} fill="var(--card)" stroke="var(--border)" strokeWidth={2} />
      <text x={lx + 135} y={py + ph + 34} textAnchor="middle" fill="var(--muted-foreground)" fontSize={12} fontWeight={850}>matte — softer colors</text>

      {/* Right: glossy — vivid */}
      <rect x={rx} y={py} width={pw} height={ph} rx={20} fill="var(--card)" stroke="var(--primary)" strokeWidth={3} />
      {/* Vivid glossy fill */}
      <rect x={rx + 14} y={py + 14} width={pw - 28} height={ph - 28} rx={14} fill="color-mix(in srgb, var(--primary) 62%, transparent)" />
      <rect x={rx + 44} y={py + 52} width={182} height={52} rx={10} fill="var(--foreground)" opacity={0.88} />
      <text x={rx + 135} y={py + 84} textAnchor="middle" fill="var(--card)" fontSize={18} fontWeight={950}>TITLE</text>
      <rect x={rx + 80} y={py + 116} width={110} height={14} rx={6} fill="var(--card)" opacity={0.6} />
      {/* Glare highlight */}
      <ellipse cx={rx + 220} cy={py + 40} rx={38} ry={16} fill="var(--card)" opacity={0.18} transform="rotate(-20 0 0)" />
      <text x={rx + 135} y={py + 232} textAnchor="middle" fill="var(--primary)" fontSize={12} fontWeight={750}>bright · reflective</text>
      <rect x={rx + 40} y={py + ph + 14} width={190} height={30} rx={9} fill="var(--card)" stroke="var(--primary)" strokeWidth={2} />
      <text x={rx + 135} y={py + ph + 34} textAnchor="middle" fill="var(--primary)" fontSize={12} fontWeight={850}>glossy — richer colors</text>
    </g>
  );
}

function ColorProofWorkflow() {
  const steps = [
    { icon: '☀', label: 'Normal brightness', sub: 'reduce to 50–60%' },
    { icon: '⊕', label: 'Thumbnail check', sub: 'zoom to 200px' },
    { icon: '◑', label: 'Grayscale test', sub: 'text must stay clear' },
    { icon: '⎙', label: 'Local draft print', sub: 'any home printer' },
    { icon: '↑', label: 'Upload to KDP', sub: 'PDF Print only' },
    { icon: '📦', label: 'Order proof copy', sub: 'review in person' },
  ];
  const cols = 3, rows = 2;
  const bw = 192, bh = 96, gapX = 60, gapY = 52;
  const totalW = cols * bw + (cols - 1) * gapX;
  const startX = (800 - totalW) / 2;
  return (
    <g>
      <Label x={236} y={46}>color test workflow before publishing</Label>
      {steps.map(({ icon, label, sub }, i) => {
        const col = i % cols, row = Math.floor(i / cols);
        const bx = startX + col * (bw + gapX);
        const by = 74 + row * (bh + gapY);
        const isLast = i === steps.length - 1;
        return (
          <g key={label}>
            <rect x={bx} y={by} width={bw} height={bh} rx={16}
              fill="var(--card)"
              stroke={isLast ? 'var(--success)' : 'var(--primary)'}
              strokeWidth={isLast ? 3 : 2.5} />
            {/* Step number */}
            <circle cx={bx + 22} cy={by + 22} r={14} fill={isLast ? 'color-mix(in srgb, var(--success) 14%, transparent)' : 'color-mix(in srgb, var(--primary) 14%, transparent)'} />
            <text x={bx + 17} y={by + 28} fill={isLast ? 'var(--success)' : 'var(--primary)'} fontSize={13} fontWeight={950}>{i + 1}</text>
            {/* Label */}
            <text x={bx + 46} y={by + 36} fill="var(--foreground)" fontSize={13} fontWeight={950}>{label}</text>
            <text x={bx + 46} y={by + 56} fill="var(--muted-foreground)" fontSize={11} fontWeight={750}>{sub}</text>
            {/* Connector arrow (right) */}
            {col < cols - 1 && (
              <path d={`M${bx + bw + 4} ${by + bh / 2}h${gapX - 8}`} stroke="var(--primary)" strokeWidth={2.5} strokeDasharray="6 5" />
            )}
            {/* Connector arrow (down, last in row) */}
            {col === cols - 1 && row < rows - 1 && (
              <path d={`M${bx + bw / 2} ${by + bh + 4}v${gapY - 8}`} stroke="var(--primary)" strokeWidth={2.5} strokeDasharray="6 5" />
            )}
          </g>
        );
      })}
      {/* Result tip */}
      <rect x={250} y={396} width={300} height={34} rx={11} fill="color-mix(in srgb, var(--success) 9%, var(--card))" stroke="var(--success)" strokeWidth={2.5} />
      <text x={400} y={418} textAnchor="middle" fill="var(--success)" fontSize={13} fontWeight={950}>proof copy = only reliable color check</text>
    </g>
  );
}

function TrimSafeZoneAnatomy() {
  // Bleed outer: x=120, y=34, w=560, h=340
  // Trim (cover): x=145, y=58, w=510, h=292
  // Safe zone: x=205, y=118, w=390, h=172
  const bx = 120, by = 34, bw = 560, bh = 340;
  const cx = 145, cy = 58, cw = 510, ch = 292;
  const sx = 205, sy = 118, sw = 390, sh = 172;
  const scx = sx + sw / 2;

  return (
    <g>
      <Label x={240} y={24}>bleed · trim line · safe area — three print zones</Label>

      {/* Bleed zone fill + border */}
      <rect x={bx} y={by} width={bw} height={bh} rx={8}
        fill="color-mix(in srgb, var(--danger) 6%, transparent)"
        stroke="var(--danger)" strokeWidth={2} strokeDasharray="8 5" />

      {/* Cover / trim face */}
      <rect x={cx} y={cy} width={cw} height={ch} rx={4}
        fill="color-mix(in srgb, var(--primary) 7%, var(--card))"
        stroke="color-mix(in srgb, var(--foreground) 55%, transparent)" strokeWidth={2.5} strokeDasharray="10 5" />

      {/* Safe area zone */}
      <rect x={sx} y={sy} width={sw} height={sh} rx={10}
        fill="color-mix(in srgb, var(--success) 9%, transparent)"
        stroke="var(--success)" strokeWidth={2} strokeDasharray="6 4" />

      {/* Content inside safe zone */}
      <rect x={scx - 110} y={sy + 30} width={220} height={28} rx={6} fill="var(--foreground)" opacity={0.82} />
      <text x={scx} y={sy + 50} textAnchor="middle" fill="var(--card)" fontSize={13} fontWeight={950}>BOOK TITLE</text>
      <rect x={scx - 70} y={sy + 68} width={140} height={10} rx={4} fill="var(--muted-foreground)" opacity={0.35} />
      <text x={scx} y={sy + 104} textAnchor="middle" dominantBaseline="middle" fill="var(--muted-foreground)" fontSize={11} fontWeight={700}>Author Name</text>

      {/* Zone labels — top-left corners */}
      <rect x={bx + 6} y={by + 6} width={78} height={22} rx={5} fill="color-mix(in srgb, var(--danger) 10%, var(--card))" stroke="var(--danger)" strokeWidth={1.5} />
      <text x={bx + 14} y={by + 21} fill="var(--danger)" fontSize={11} fontWeight={950}>bleed zone</text>

      <rect x={cx + 6} y={cy + 6} width={72} height={22} rx={5} fill="var(--card)" stroke="color-mix(in srgb, var(--foreground) 50%, transparent)" strokeWidth={1.5} />
      <text x={cx + 14} y={cy + 21} fill="var(--foreground)" fontSize={11} fontWeight={850}>trim line</text>

      <rect x={sx + 6} y={sy + 6} width={70} height={22} rx={5} fill="color-mix(in srgb, var(--success) 10%, var(--card))" stroke="var(--success)" strokeWidth={1.5} />
      <text x={sx + 14} y={sy + 21} fill="var(--success)" fontSize={11} fontWeight={950}>safe area</text>

      {/* Bottom annotation bar */}
      <rect x={bx} y={by + bh + 14} width={174} height={36} rx={8} fill="color-mix(in srgb, var(--danger) 7%, var(--card))" stroke="var(--danger)" strokeWidth={1.5} />
      <text x={bx + 87} y={by + bh + 28} textAnchor="middle" fill="var(--danger)" fontSize={11} fontWeight={950}>bleed</text>
      <text x={bx + 87} y={by + bh + 44} textAnchor="middle" fill="var(--muted-foreground)" fontSize={10}>artwork extends here</text>

      <rect x={bx + 193} y={by + bh + 14} width={174} height={36} rx={8} fill="var(--card)" stroke="var(--border)" strokeWidth={1.5} />
      <text x={bx + 280} y={by + bh + 28} textAnchor="middle" fill="var(--foreground)" fontSize={11} fontWeight={950}>trim line</text>
      <text x={bx + 280} y={by + bh + 44} textAnchor="middle" fill="var(--muted-foreground)" fontSize={10}>final cut edge</text>

      <rect x={bx + 386} y={by + bh + 14} width={174} height={36} rx={8} fill="color-mix(in srgb, var(--success) 7%, var(--card))" stroke="var(--success)" strokeWidth={1.5} />
      <text x={bx + 473} y={by + bh + 28} textAnchor="middle" fill="var(--success)" fontSize={11} fontWeight={950}>safe area</text>
      <text x={bx + 473} y={by + bh + 44} textAnchor="middle" fill="var(--muted-foreground)" fontSize={10}>text belongs here</text>
    </g>
  );
}

function UnsafeTextPlacementExamples() {
  // Cover: x=262, y=68, w=340, h=314 — leaves room for side callouts
  const cx = 262, cy = 68, cw = 340, ch = 314;
  // Safe zone inset 52px
  const sx = cx + 52, sy = cy + 52, sw = cw - 104, sh = ch - 104;

  // Left callout label: line from cover-left to label box (x=16–240)
  const LWarn = ({ y, label }: { y: number; label: string }) => (
    <g>
      <path d={`M16 ${y}H${cx - 4}`} stroke="var(--danger)" strokeWidth={1.5} strokeDasharray="5 4" />
      <rect x={16} y={y - 13} width={220} height={26} rx={7}
        fill="color-mix(in srgb, var(--danger) 7%, var(--card))" stroke="var(--danger)" strokeWidth={1.5} />
      <circle cx={32} cy={y} r={11}
        fill="color-mix(in srgb, var(--danger) 14%, transparent)" />
      <text x={32} y={y} textAnchor="middle" dominantBaseline="central"
        fill="var(--danger)" fontSize={11} fontWeight={950}>!</text>
      <text x={52} y={y} dominantBaseline="middle"
        fill="var(--danger)" fontSize={11} fontWeight={850}>{label}</text>
    </g>
  );

  // Right callout label: line from cover-right to label box (x=606–784)
  const RWarn = ({ y, label }: { y: number; label: string }) => (
    <g>
      <path d={`M${cx + cw + 4} ${y}H${cx + cw + 26}`} stroke="var(--danger)" strokeWidth={1.5} strokeDasharray="5 4" />
      <rect x={cx + cw + 28} y={y - 13} width={144} height={26} rx={7}
        fill="color-mix(in srgb, var(--danger) 7%, var(--card))" stroke="var(--danger)" strokeWidth={1.5} />
      <circle cx={cx + cw + 44} cy={y} r={11}
        fill="color-mix(in srgb, var(--danger) 14%, transparent)" />
      <text x={cx + cw + 44} y={y} textAnchor="middle" dominantBaseline="central"
        fill="var(--danger)" fontSize={11} fontWeight={950}>!</text>
      <text x={cx + cw + 64} y={y} dominantBaseline="middle"
        fill="var(--danger)" fontSize={11} fontWeight={850}>{label}</text>
    </g>
  );

  return (
    <g>
      <Label x={228} y={46}>common unsafe text placements — all flagged by KDP</Label>

      {/* Cover background */}
      <rect x={cx} y={cy} width={cw} height={ch} rx={4}
        fill="color-mix(in srgb, var(--primary) 8%, var(--card))" stroke="var(--border)" strokeWidth={2} />

      {/* Safe zone boundary */}
      <rect x={sx} y={sy} width={sw} height={sh} rx={8}
        fill="transparent" stroke="var(--success)" strokeWidth={1.5} strokeDasharray="6 4" />
      <text x={cx + cw / 2} y={cy + ch / 2} textAnchor="middle" dominantBaseline="middle"
        fill="var(--success)" fontSize={12} fontWeight={700} opacity={0.45}>safe area</text>

      {/* 1. Title bar — top trim zone */}
      <rect x={cx} y={cy} width={cw} height={34} rx={3}
        fill="color-mix(in srgb, var(--foreground) 72%, transparent)" />
      <text x={cx + cw / 2} y={cy + 17} textAnchor="middle" dominantBaseline="central"
        fill="var(--card)" fontSize={12} fontWeight={950}>TITLE — too close to top</text>

      {/* 2. Subtitle bar — bottom trim zone */}
      <rect x={cx} y={cy + ch - 30} width={cw} height={30}
        fill="var(--muted-foreground)" opacity={0.35} />
      <text x={cx + cw / 2} y={cy + ch - 15} textAnchor="middle" dominantBaseline="central"
        fill="var(--card)" fontSize={11} fontWeight={850}>Subtitle — near bottom edge</text>

      {/* 3. Left border strip */}
      <rect x={cx} y={cy} width={5} height={ch} fill="var(--muted-foreground)" opacity={0.5} />

      {/* 4. Right border strip */}
      <rect x={cx + cw - 5} y={cy} width={5} height={ch} fill="var(--muted-foreground)" opacity={0.5} />

      {/* 5. Corner logo upper-right */}
      <rect x={cx + cw - 44} y={cy} width={44} height={34} rx={3}
        fill="color-mix(in srgb, var(--primary) 28%, transparent)" stroke="var(--primary)" strokeWidth={1.5} />
      <text x={cx + cw - 22} y={cy + 17} textAnchor="middle" dominantBaseline="central"
        fill="var(--primary)" fontSize={9} fontWeight={950}>LOGO</text>

      {/* Left callouts — staggered y positions */}
      <LWarn y={cy + 17}   label="title near top" />
      <LWarn y={cy + ch / 2} label="left border" />
      <LWarn y={cy + ch - 15} label="subtitle" />

      {/* Right callouts */}
      <RWarn y={cy + 17}   label="corner logo" />
      <RWarn y={cy + ch / 2} label="right border" />
    </g>
  );
}

function SafeAreaMistakesGrid() {
  const mistakes = [
    { label: 'Border near trim', sub: 'shifts look uneven', color: 'var(--danger)' },
    { label: 'Title near edge', sub: 'top or side risk', color: 'var(--danger)' },
    { label: 'Tiny margins', sub: 'underestimate shift', color: 'var(--danger)' },
    { label: 'Canva snap error', sub: 'centered ≠ safe', color: 'var(--danger)' },
    { label: 'No template', sub: 'wrong safe zone', color: 'var(--danger)' },
    { label: 'Spine overflow', sub: 'text exits spine', color: 'var(--danger)' },
  ];
  const cols = 3, bw = 220, bh = 104, gx = 24, gy = 32;
  const totalW = cols * bw + (cols - 1) * gx;
  const startX = (800 - totalW) / 2;
  const startY = 72;

  return (
    <g>
      <Label x={232} y={46}>6 common safe area mistakes on KDP covers</Label>
      {mistakes.map(({ label, sub, color }, i) => {
        const col = i % cols, row = Math.floor(i / cols);
        const bx = startX + col * (bw + gx);
        const by = startY + row * (bh + gy);
        return (
          <g key={label}>
            <rect x={bx} y={by} width={bw} height={bh} rx={14}
              fill="color-mix(in srgb, var(--danger) 5%, var(--card))"
              stroke={color} strokeWidth={2} />
            {/* Warning icon */}
            <circle cx={bx + 26} cy={by + 30} r={14}
              fill="color-mix(in srgb, var(--danger) 12%, transparent)" />
            <text x={bx + 26} y={by + 30} textAnchor="middle" dominantBaseline="central"
              fill="var(--danger)" fontSize={13} fontWeight={950}>!</text>
            {/* Labels */}
            <text x={bx + 50} y={by + 26} fill="var(--foreground)" fontSize={13} fontWeight={950}>{label}</text>
            <text x={bx + 50} y={by + 46} fill="var(--muted-foreground)" fontSize={11} fontWeight={750}>{sub}</text>
            {/* Mini illustration — edge strip */}
            <rect x={bx + 12} y={by + 64} width={bw - 24} height={24} rx={7}
              fill="var(--card)" stroke="var(--border)" strokeWidth={1.5} />
            <rect x={bx + 12} y={by + 64} width={28} height={24} rx={7}
              fill="color-mix(in srgb, var(--danger) 14%, transparent)" />
            <text x={bx + 26} y={by + 78} textAnchor="middle" dominantBaseline="middle"
              fill="var(--danger)" fontSize={9} fontWeight={850}>edge</text>
            <rect x={bx + 52} y={by + 70} width={bw - 80} height={12} rx={4}
              fill="var(--muted-foreground)" opacity={0.25} />
          </g>
        );
      })}
    </g>
  );
}

function MarginRecommendationLayout() {
  // Cover centered: x=200, y=64, w=400, h=322
  const cx = 200, cy = 64, cw = 400, ch = 322;
  // Safe zone 56px inset
  const sx = cx + 56, sy = cy + 56, sw = cw - 112, sh = ch - 112;
  const scx = sx + sw / 2;

  const MeasureArrow = ({ x1, y1, x2, y2, label, lx, ly }: { x1: number; y1: number; x2: number; y2: number; label: string; lx: number; ly: number }) => (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--primary)" strokeWidth={1.5} strokeDasharray="4 3" />
      <rect x={lx - label.length * 4.2 - 2} y={ly - 10} width={label.length * 8.4 + 4} height={20} rx={5} fill="var(--card)" stroke="var(--primary)" strokeWidth={1.5} />
      <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fill="var(--primary)" fontSize={11} fontWeight={950}>{label}</text>
    </g>
  );

  return (
    <g>
      <Label x={226} y={46}>recommended safe margin layout — 0.25 in minimum</Label>

      {/* Cover */}
      <rect x={cx} y={cy} width={cw} height={ch} rx={4}
        fill="color-mix(in srgb, var(--primary) 8%, var(--card))" stroke="var(--border)" strokeWidth={2} />

      {/* Safe zone */}
      <rect x={sx} y={sy} width={sw} height={sh} rx={10}
        fill="color-mix(in srgb, var(--success) 8%, transparent)"
        stroke="var(--success)" strokeWidth={2} strokeDasharray="6 4" />

      {/* Content inside safe zone */}
      <rect x={scx - 96} y={sy + 26} width={192} height={26} rx={5} fill="var(--foreground)" opacity={0.8} />
      <text x={scx} y={sy + 44} textAnchor="middle" fill="var(--card)" fontSize={13} fontWeight={950}>TITLE</text>
      <rect x={scx - 64} y={sy + 64} width={128} height={12} rx={4} fill="var(--muted-foreground)" opacity={0.35} />
      <text x={scx} y={sy + 100} textAnchor="middle" dominantBaseline="middle" fill="var(--muted-foreground)" fontSize={11}>Author Name</text>

      {/* Top measure arrow */}
      <MeasureArrow x1={cx + cw / 2} y1={cy} x2={cx + cw / 2} y2={sy} label="0.25 in+" lx={cx + cw / 2 + 56} ly={cy + 28} />
      {/* Bottom measure arrow */}
      <MeasureArrow x1={cx + cw / 2} y1={sy + sh} x2={cx + cw / 2} y2={cy + ch} label="0.25 in+" lx={cx + cw / 2 + 56} ly={sy + sh + 28} />
      {/* Left measure arrow */}
      <MeasureArrow x1={cx} y1={cy + ch / 2} x2={sx} y2={cy + ch / 2} label="0.25 in+" lx={cx - 48} ly={cy + ch / 2} />
      {/* Right measure arrow */}
      <MeasureArrow x1={sx + sw} y1={cy + ch / 2} x2={cx + cw} y2={cy + ch / 2} label="0.25 in+" lx={cx + cw + 48} ly={cy + ch / 2} />

      {/* "safe area" center label */}
      <text x={scx} y={sy + sh - 14} textAnchor="middle" fill="var(--success)" fontSize={12} fontWeight={700} opacity={0.6}>safe area</text>

      {/* Tip badge */}
      <rect x={scx - 190} y={cy + ch + 18} width={380} height={28} rx={9}
        fill="color-mix(in srgb, var(--success) 8%, var(--card))" stroke="var(--success)" strokeWidth={2} />
      <text x={scx} y={cy + ch + 33} textAnchor="middle" dominantBaseline="middle"
        fill="var(--success)" fontSize={12} fontWeight={850}>use more space for small text and bottom-edge elements</text>
    </g>
  );
}

function CanvaSafeMarginSteps() {
  const steps = [
    { n: 1, label: 'Open design', sub: 'original file only' },
    { n: 2, label: 'Enable rulers', sub: 'View → Show Rulers' },
    { n: 3, label: 'Add guides', sub: '0.25 in from trim' },
    { n: 4, label: 'Find flagged items', sub: 'sub · author · border' },
    { n: 5, label: 'Move inward', sub: 'use X / Y coords' },
    { n: 6, label: 'Check corners', sub: 'extra space each edge' },
    { n: 7, label: 'Export PDF Print', sub: 'not Standard PDF' },
    { n: 8, label: 'Verify the PDF', sub: 'inspect before reupload' },
  ];
  // bw=180, gx=14 → total = 4×180 + 3×14 = 762 → startX=19
  // text starts at bx+44, box ends at bx+180 → available = 130px per label
  const cols = 4, bw = 180, bh = 86, gx = 14, gy = 28;
  const totalW = cols * bw + (cols - 1) * gx;
  const startX = (800 - totalW) / 2;
  const startY = 68;

  return (
    <g>
      <Label x={216} y={44}>8 Canva steps to fix safe area problems</Label>
      {steps.map(({ n, label, sub }) => {
        const idx = n - 1;
        const col = idx % cols;
        const row = Math.floor(idx / cols);
        const bx = startX + col * (bw + gx);
        const by = startY + row * (bh + gy);
        const isLast = n === 8;
        const cy2 = by + bh / 2;
        return (
          <g key={n}>
            <rect x={bx} y={by} width={bw} height={bh} rx={12}
              fill="var(--card)"
              stroke={isLast ? 'var(--success)' : 'var(--primary)'}
              strokeWidth={isLast ? 2.5 : 2} />
            <circle cx={bx + 22} cy={cy2 - 10} r={13}
              fill={isLast ? 'color-mix(in srgb, var(--success) 14%, transparent)' : 'color-mix(in srgb, var(--primary) 14%, transparent)'} />
            <text x={bx + 22} y={cy2 - 10} textAnchor="middle" dominantBaseline="central"
              fill={isLast ? 'var(--success)' : 'var(--primary)'} fontSize={12} fontWeight={950}>{n}</text>
            <text x={bx + 44} y={cy2 - 6} fill="var(--foreground)" fontSize={12} fontWeight={950}>{label}</text>
            <text x={bx + 44} y={cy2 + 12} fill="var(--muted-foreground)" fontSize={9} fontWeight={750}>{sub}</text>
            {/* Connector right */}
            {col < cols - 1 && (
              <path d={`M${bx + bw + 2} ${cy2}h${gx - 4}`} stroke="var(--primary)" strokeWidth={2} strokeDasharray="5 4" />
            )}
            {/* Connector down (end of row) */}
            {col === cols - 1 && row === 0 && (
              <path d={`M${bx + bw / 2} ${by + bh + 2}v${gy - 4}`} stroke="var(--primary)" strokeWidth={2} strokeDasharray="5 4" />
            )}
          </g>
        );
      })}
    </g>
  );
}

function BorderTrimShiftComparison() {
  // Left cover: x=64, y=60, w=298, h=330
  // Right cover: x=438, y=60, w=298, h=330
  const lx = 64, rx = 438, cy2 = 60, cw = 298, ch = 330;
  const bpad = 14; // border inset from cover edge

  return (
    <g>
      <Label x={218} y={42}>centered border — then after trim shift</Label>

      {/* Left: perfectly centered border in file */}
      <rect x={lx} y={cy2} width={cw} height={ch} rx={4}
        fill="color-mix(in srgb, var(--primary) 8%, var(--card))" stroke="var(--border)" strokeWidth={1.5} />
      {/* Even border inside */}
      <rect x={lx + bpad} y={cy2 + bpad} width={cw - bpad * 2} height={ch - bpad * 2} rx={5}
        fill="transparent" stroke="var(--muted-foreground)" strokeWidth={2.5} />
      {/* Content */}
      <rect x={lx + 46} y={cy2 + 88} width={206} height={26} rx={5} fill="var(--foreground)" opacity={0.78} />
      <text x={lx + cw / 2} y={cy2 + 106} textAnchor="middle" fill="var(--card)" fontSize={12} fontWeight={950}>BOOK TITLE</text>
      <text x={lx + cw / 2} y={cy2 + 152} textAnchor="middle" fill="var(--muted-foreground)" fontSize={10}>Author Name</text>
      {/* "Even" indicators */}
      {[0, 1, 2, 3].map((side) => {
        const positions = [
          { x: lx + cw / 2, y: cy2 + bpad / 2 },
          { x: lx + cw / 2, y: cy2 + ch - bpad / 2 },
          { x: lx + bpad / 2, y: cy2 + ch / 2 },
          { x: lx + cw - bpad / 2, y: cy2 + ch / 2 },
        ];
        return (
          <text key={side} x={positions[side].x} y={positions[side].y} textAnchor="middle" dominantBaseline="central"
            fill="var(--success)" fontSize={9} fontWeight={850}>✓</text>
        );
      })}
      {/* Label */}
      <rect x={lx + 54} y={cy2 + ch + 14} width={190} height={28} rx={8}
        fill="color-mix(in srgb, var(--success) 8%, var(--card))" stroke="var(--success)" strokeWidth={2} />
      <text x={lx + cw / 2} y={cy2 + ch + 29} textAnchor="middle" dominantBaseline="middle"
        fill="var(--success)" fontSize={12} fontWeight={850}>file: perfectly even</text>

      {/* Divider */}
      <path d="M398 52v360" stroke="var(--border)" strokeWidth={1.5} strokeDasharray="5 5" />
      <circle cx={398} cy={232} r={22} fill="var(--card)" stroke="var(--border)" strokeWidth={1.5} />
      <text x={398} y={232} textAnchor="middle" dominantBaseline="central"
        fill="var(--muted-foreground)" fontSize={11} fontWeight={900}>→</text>

      {/* Right: same cover after trim shift (2 mm right) — border uneven */}
      <rect x={rx} y={cy2} width={cw} height={ch} rx={4}
        fill="color-mix(in srgb, var(--primary) 8%, var(--card))" stroke="var(--border)" strokeWidth={1.5} />
      {/* Shifted border: trimmed on left by 6px extra, right side thicker */}
      <rect x={rx + bpad - 6} y={cy2 + bpad} width={cw - bpad * 2 + 6} height={ch - bpad * 2} rx={5}
        fill="transparent" stroke="var(--muted-foreground)" strokeWidth={2.5} />
      {/* Content same as left */}
      <rect x={rx + 46} y={cy2 + 88} width={206} height={26} rx={5} fill="var(--foreground)" opacity={0.78} />
      <text x={rx + cw / 2} y={cy2 + 106} textAnchor="middle" fill="var(--card)" fontSize={12} fontWeight={950}>BOOK TITLE</text>
      <text x={rx + cw / 2} y={cy2 + 152} textAnchor="middle" fill="var(--muted-foreground)" fontSize={10}>Author Name</text>
      {/* Warning on narrow left side */}
      <circle cx={rx + 5} cy={cy2 + ch / 2} r={14} fill="color-mix(in srgb, var(--danger) 10%, var(--card))" stroke="var(--danger)" strokeWidth={2} />
      <text x={rx + 5} y={cy2 + ch / 2} textAnchor="middle" dominantBaseline="central"
        fill="var(--danger)" fontSize={11} fontWeight={950}>!</text>
      {/* Label */}
      <rect x={rx + 30} y={cy2 + ch + 14} width={238} height={28} rx={8}
        fill="color-mix(in srgb, var(--danger) 8%, var(--card))" stroke="var(--danger)" strokeWidth={2} />
      <text x={rx + cw / 2} y={cy2 + ch + 29} textAnchor="middle" dominantBaseline="middle"
        fill="var(--danger)" fontSize={12} fontWeight={850}>print: uneven after trim shift</text>
    </g>
  );
}

function ProfessionalGuideSetup() {
  // Title at y=22; bleed starts at y=34 — no overlap
  // Cover: x=118, y=54, w=546, h=308
  const cx = 118, cy = 54, cw = 546, ch = 308;
  const bx = cx - 16, by = cy - 20; // bleed rect
  const sx = cx + 52, sy = cy + 52, sw = cw - 104, sh = ch - 104;
  const spineX = 370, spineW = 60; // centered ~400
  const barX = cx + 12, barY = cy + ch - 78, barW = 110, barH = 56;

  // Right label column: lines start at cx+cw+4, labels at cx+cw+26
  const lx = cx + cw + 26; // 690
  const lw = 96;
  // Label y positions — each 40px apart so boxes (22px tall) never touch
  const guideLabels: { y: number; label: string; color: string }[] = [
    { y: 66,  label: 'bleed',     color: 'var(--danger)' },
    { y: 110, label: 'trim line', color: 'color-mix(in srgb, var(--foreground) 65%, transparent)' },
    { y: 158, label: 'safe area', color: 'var(--success)' },
    { y: 208, label: 'spine',     color: 'var(--primary)' },
  ];

  return (
    <g>
      {/* Title sits fully above the bleed rect */}
      <Label x={172} y={22}>professional guide layer setup — all zones locked</Label>

      {/* Cover background */}
      <rect x={cx} y={cy} width={cw} height={ch} rx={3}
        fill="color-mix(in srgb, var(--primary) 6%, var(--card))" stroke="var(--border)" strokeWidth={2} />

      {/* Bleed guide — starts at by=34, well below title */}
      <rect x={bx} y={by} width={cw + 32} height={ch + 40} rx={5}
        fill="transparent" stroke="var(--danger)" strokeWidth={1.5} strokeDasharray="7 4" />

      {/* Safe area guide */}
      <rect x={sx} y={sy} width={sw} height={sh} rx={8}
        fill="color-mix(in srgb, var(--success) 7%, transparent)"
        stroke="var(--success)" strokeWidth={1.5} strokeDasharray="5 3" />

      {/* Spine guide lines + tint */}
      <rect x={spineX} y={cy} width={spineW} height={ch}
        fill="color-mix(in srgb, var(--primary) 7%, transparent)" />
      <line x1={spineX} y1={cy} x2={spineX} y2={cy + ch}
        stroke="var(--primary)" strokeWidth={1.5} strokeDasharray="4 3" />
      <line x1={spineX + spineW} y1={cy} x2={spineX + spineW} y2={cy + ch}
        stroke="var(--primary)" strokeWidth={1.5} strokeDasharray="4 3" />

      {/* Barcode zone */}
      <rect x={barX} y={barY} width={barW} height={barH} rx={5}
        fill="color-mix(in srgb, var(--danger) 8%, transparent)"
        stroke="var(--danger)" strokeWidth={1.5} strokeDasharray="5 4" />
      <text x={barX + barW / 2} y={barY + barH / 2} textAnchor="middle" dominantBaseline="central"
        fill="var(--danger)" fontSize={9} fontWeight={850}>barcode zone</text>

      {/* Guide labels — right column, 40px spacing, no overlap */}
      {guideLabels.map(({ y, label, color }) => (
        <g key={label}>
          <line x1={cx + cw + 4} y1={y} x2={lx - 4} y2={y}
            stroke={color} strokeWidth={1.5} />
          <rect x={lx} y={y - 11} width={lw} height={22} rx={6}
            fill="var(--card)" stroke={color} strokeWidth={1.5} />
          <text x={lx + lw / 2} y={y} textAnchor="middle" dominantBaseline="middle"
            fill={color} fontSize={11} fontWeight={850}>{label}</text>
        </g>
      ))}

      {/* Tip badge */}
      <rect x={cx} y={cy + ch + 18} width={cw} height={26} rx={8}
        fill="color-mix(in srgb, var(--primary) 7%, var(--card))" stroke="var(--primary)" strokeWidth={2} />
      <text x={cx + cw / 2} y={cy + ch + 31} textAnchor="middle" dominantBaseline="middle"
        fill="var(--primary)" fontSize={11} fontWeight={850}>keep all guides locked and visible throughout the entire design process</text>
    </g>
  );
}
