/**
 * Long-form explainers for each glossary term.
 *
 * `glossary-data.ts` holds the short definition used in schema markup and
 * listings; this file holds the article body rendered on the term page. Numbers
 * quoted here come from `src/lib/kdp/kdp-rules.ts` — keep the two in sync.
 */

export type GlossaryExplainer = {
  /** Article paragraphs rendered under the definition callout. */
  explainer: string[];
  /** Appended to the term's own FAQ list. */
  extraFaqs?: { question: string; answer: string }[];
};

export const glossaryExplainers: Record<string, GlossaryExplainer> = {
  bleed: {
    explainer: [
      'Printing a book involves two separate mechanical steps that each carry tolerance: ink is laid onto a large sheet, and the sheet is then cut down to the finished page size. Neither step is exact. The blade lands within a small margin of where it is aimed, and that margin varies slightly from copy to copy across a print run.',
      'Bleed exists to absorb that variance. By extending your background artwork past the line where the book will be cut, you guarantee that wherever the blade actually lands, it lands in ink rather than in bare paper. The overhang is discarded during trimming and the reader never sees it — its only job is to be sacrificed.',
      'KDP asks for 0.125 inches of bleed, one eighth of an inch, on every outside edge that will be cut. On a cover that means all four edges. On an interior page it means the top, bottom, and outer edge, but not the inner edge, because the inner edge is bound into the spine and never trimmed.',
      'The detail that causes the most trouble is that bleed has to survive the export. Design tools display bleed as a guide on your canvas, but a guide is not geometry. If your export settings do not explicitly include the bleed area, the PDF you upload is trim-sized and Amazon will flag it — no matter how correct the file looked while you were working on it.',
      'The reliable check is to open the finished PDF and read its page dimensions in inches. A 6 x 9 inch book exported with bleed should measure 6.125 x 9.25 inches. If it reads exactly 6 x 9, the bleed was dropped somewhere in the export.',
    ],
    extraFaqs: [
      { question: 'Do interior pages and covers add bleed the same way?', answer: 'No. An interior page adds 0.125 inches to the width and 0.25 inches to the height, because only the outer edge of the width is trimmed. A cover adds 0.125 inches on all four edges, so 0.25 inches to both total width and total height.' },
      { question: 'Can I fix missing bleed by scaling the PDF up?', answer: 'It is a bad idea. Scaling moves every element outward relative to the trim line, which can push text into the safe-area or barcode zones, and it reduces effective image resolution. Re-export from the source design with bleed enabled instead.' },
      { question: 'Does a book without edge-to-edge artwork need bleed?', answer: 'No. If every page has a white margin around the content, a no-bleed setup is simpler and removes an entire category of export error. Covers almost always need bleed because the background normally reaches the edge.' },
    ],
  },

  'trim-size': {
    explainer: [
      'Trim size is the width and height of the book after the printed sheets have been cut down — the dimensions you would measure by holding a ruler against the finished paperback. It is quoted before bleed and never includes it.',
      'It is the first decision in a print project because everything downstream is derived from it. Your interior page dimensions are the trim size, optionally plus bleed. Your minimum margins are checked against it. Your cover width is two trim widths plus the spine. Even your eligibility for Expanded Distribution, which places the book with bookstores and libraries outside Amazon, depends on which trim size you chose.',
      'Because so much follows from it, changing trim size late is expensive. A manuscript laid out for 5.5 x 8.5 inches has to be reflowed entirely for 6 x 9, which changes the page count, which changes the spine, which means the cover has to be rebuilt as well. It is worth spending time on this decision before any layout work begins.',
      'Choose based on category convention rather than personal preference. Readers form expectations from the books already on the shelf: 5.5 x 8.5 inches reads as a novel, 6 x 9 as nonfiction or memoir, 8.5 x 11 as a workbook or planner, and square formats as children’s picture books. An unusual size signals self-publishing before anyone opens the cover.',
      'KDP supports a fixed list of trim sizes rather than arbitrary dimensions, and not every size supports every combination of paper, ink, and page count. Longer books and colour interiors narrow the options, so if you are writing something long or heavily illustrated, confirm your combination is available before committing.',
    ],
    extraFaqs: [
      { question: 'Which trim size is safest for a first book?', answer: '6 x 9 inches for nonfiction and 5.5 x 8.5 inches for fiction. Both are widely supported across paper types and page counts, and both qualify for Expanded Distribution on white and cream paper.' },
      { question: 'Do margins change with trim size?', answer: 'The minimum outside, top, and bottom margins are the same regardless of trim size. The inside gutter margin scales with page count, not trim size — from 0.375 inches under 150 pages up to 0.875 inches above 700.' },
      { question: 'Are all trim sizes eligible for Expanded Distribution?', answer: 'No. Larger and squarer formats such as 8.25 x 8.25, 8.25 x 11, and 8.25 x 6 inches are not eligible on any paper type, and some sizes qualify on white paper but not cream.' },
    ],
  },

  'safe-area': {
    explainer: [
      'The safe area is the region inside the trim line where content can be placed with confidence that it will survive printing and binding. Anything closer to the edge than the safe-area boundary is at risk of being cut off, obscured by the fold, or positioned inconsistently from copy to copy.',
      'It is the same production tolerance that makes bleed necessary, viewed from the other direction. Bleed protects you when the blade cuts slightly outside the trim line; the safe area protects you when it cuts slightly inside. Both are responses to the fact that a print run is a mechanical process with variance, not a pixel-perfect render.',
      'KDP recommends keeping important content at least 0.25 inches inside the trim line on every edge. That applies to text, logos, page numbers, borders, and anything else where being clipped would look like a defect. Background artwork is exempt — that is what bleed is for.',
      'Borders deserve particular caution. A thin rule running parallel to the trim edge is the most unforgiving element you can put on a page, because any drift in the cut makes the border visibly thicker on one side than the other. A border that measures evenly in your design tool can print noticeably lopsided. If you want a framed look, keep the frame well inside the safe area or make it thick enough that a small shift is not obvious.',
      'On a cover, the safe area applies to each panel independently. The front cover, the spine, and the back cover each have their own edges, and spine text has the tightest constraint of all — it needs clearance from both spine folds, on a panel that may only be a fraction of an inch wide.',
    ],
    extraFaqs: [
      { question: 'How far from the edge should cover text sit?', answer: 'At least 0.25 inches inside the trim line. Titles and author names usually look better with considerably more than the minimum, both for safety and for visual balance.' },
      { question: 'Why do my borders print unevenly?', answer: 'Cutting tolerance. A border running close to and parallel with the trim edge amplifies any drift in the cut, so a shift of a fraction of a millimetre becomes a visibly thicker line on one side. Move the border further inside the safe area or increase its weight.' },
      { question: 'Does the safe area apply to background images?', answer: 'No. Backgrounds should deliberately extend past the trim line into the bleed area. The safe area governs content that must remain fully visible.' },
    ],
  },

  'spine-width': {
    explainer: [
      'Spine width is the thickness of the book block — the stack of printed pages once they are bound. It is calculated rather than chosen: page count multiplied by the thickness of one sheet of the paper you selected.',
      'KDP publishes a per-page factor for each paper and ink combination. Black ink on white paper is 0.002252 inches per page. Black ink on cream paper is thicker at 0.0025 inches. Colour interiors on white paper sit between the two at 0.002347 inches. A 300-page book therefore has a spine of 0.6756 inches on white paper but 0.75 inches on cream — a difference large enough to fail validation and invisible in your design tool.',
      'The spine is not a separate file. It is the middle strip of one continuous full-wrap cover PDF, which means its width is part of the total cover width. Change the spine and you change the required width of the entire cover.',
      'This is why editing the manuscript after finishing the cover is such a dependable way to break an upload. Adding a two-page dedication changes the page count, which changes the spine, which changes the cover width — and Amazon reports the resulting failure as a dimension mismatch rather than a spine problem, so the actual cause is easy to miss. Finalise the interior first, then calculate the spine, then build the cover.',
      'Spine text adds a further constraint. A narrow spine cannot hold text reliably, because binding tolerance shifts printed content by a fraction of an inch and a fraction is most of the panel. Below roughly 80 pages the spine is too thin for text to be safe. Above that, keep at least 0.0625 inches of clearance from each spine edge, and remember that a blank spine reads as a design choice while text wrapping onto the front cover reads as a manufacturing fault.',
    ],
    extraFaqs: [
      { question: 'How do I calculate KDP spine width?', answer: 'Multiply your final page count by the per-page factor for your paper and ink: 0.002252 inches for black ink on white paper, 0.0025 inches for black ink on cream, and 0.002347 inches for colour interiors on white paper.' },
      { question: 'Why did my cover stop fitting after I edited the manuscript?', answer: 'Editing changed the page count, which changed the spine width, which changed the total cover width. The cover has to be rebuilt at the new dimensions — the file itself did not change, the requirement did.' },
      { question: 'What is the minimum page count for spine text?', answer: 'Around 80 pages as a working threshold. At 80 pages on white paper the spine is roughly 0.18 inches, which is already tight. Below that, leave the spine blank.' },
    ],
  },

  'printable-area': {
    explainer: [
      'Printable area is the portion of a page or cover where KDP expects your content to sit without running into a production constraint. It is bounded on the outside by trim and safe-area requirements, and on the inside by binding — the gutter on an interior page, or the spine folds on a cover.',
      'A printable-area warning is usually shorthand for content being too close to something physical: the cut line, the fold, or a zone Amazon reserves for its own use such as the barcode area on the back cover.',
      'On interior pages the inside boundary is the one people underestimate. The gutter is the space consumed by the binding, and it grows with page count because a thicker book curves more sharply at the spine. KDP requires 0.375 inches under 150 pages, rising in steps to 0.875 inches for books over 700 pages. Text set to the minimum in a long book is legible but requires the reader to press the spine flat; a little extra makes the finished book noticeably more comfortable.',
      'On covers the reserved barcode zone is the constraint most often missed, because nothing in your design tool marks it. Amazon prints a barcode in the lower-right of the back cover on a white background, so back-cover blurb, review quotes, or author photographs placed in that corner will be covered up on the finished book.',
      'The distinction that matters when reading a warning is between decorative and essential content. Background artwork can and should run past the trim line. Text, logos, page numbers, and anything a reader needs to see must stay within the printable area.',
    ],
    extraFaqs: [
      { question: 'What is the KDP gutter margin?', answer: 'The inside margin lost to binding. KDP requires 0.375 inches for 24 to 150 pages, 0.5 inches for 151 to 300, 0.625 inches for 301 to 500, 0.75 inches for 501 to 700, and 0.875 inches for 701 to 828 pages.' },
      { question: 'Can background artwork sit outside the printable area?', answer: 'Yes. Backgrounds are meant to extend into the bleed. The printable area constrains content that must stay fully visible and correctly positioned.' },
    ],
  },

  'full-wrap-cover': {
    explainer: [
      'A full wrap cover is the single PDF page that becomes the entire outside of a printed book. Read from left to right it contains the back cover, then the spine, then the front cover, with bleed around the outside. It is one continuous image of a physical object flattened into a file.',
      'This is the format KDP requires for paperbacks and hardcovers, and it is where authors coming from ebook publishing most often go wrong. A Kindle cover is a single front-facing image; uploading that to a paperback listing produces a rejection whose error message does not always make the reason obvious.',
      'The full width is the sum of every panel plus bleed: 0.125 inches of bleed, the back cover at trim width, the spine, the front cover at trim width, and another 0.125 inches of bleed. The height is the trim height plus 0.25 inches, which is 0.125 inches of bleed top and bottom. For a 200-page 6 x 9 inch paperback on white paper, that works out to roughly 12.7 x 9.25 inches.',
      'Because the spine sits in the middle of that calculation, the total width depends on your page count. A full wrap built for a 200-page book is the wrong size for the same book at 220 pages, even though nothing about the front cover artwork changed.',
      'Build the wrap at its final dimensions from the start rather than designing panels separately and assembling them afterwards. Assembling introduces alignment error at the spine folds, which is exactly where a small mistake is most visible on the finished book.',
    ],
    extraFaqs: [
      { question: 'Can I upload a front-cover-only file for a paperback?', answer: 'No. Print books require the complete wrap — back cover, spine, and front cover — as a single PDF page. A front-cover-only file is valid for Kindle ebooks but not for print.' },
      { question: 'How many pages should the cover PDF have?', answer: 'Exactly one. A two-page PDF with front and back separated will be rejected even if both pages are individually correct.' },
      { question: 'Does the spine get its own bleed?', answer: 'No. The spine sits between the two cover panels and is never cut, so bleed applies only to the four outside edges of the wrap.' },
    ],
  },

  'barcode-area': {
    explainer: [
      'Every print book sold through Amazon carries a barcode encoding its ISBN, printed in the lower-right corner of the back cover. You do not supply it and you cannot move it — but you do have to design around it.',
      'The reserved zone is approximately 2 x 1.2 inches, and it should have at least 0.25 inches of clearance around it. Anything you place inside that footprint will either be covered by the printed barcode or flagged during review.',
      'The complication is that the barcode prints on a white background. If your back cover is dark or heavily patterned, a white rectangle appears in the corner of the finished book. On a design that did not anticipate it, this reads as a printing error. The fix is to make it deliberate: place a light-coloured panel in that corner as part of the design, so the barcode sits on something that looks intentional.',
      'The usual casualties are back-cover blurb text that runs too far down the page, an author photograph positioned in the corner, a publisher logo, or a decorative frame whose lower-right section passes through the zone. Borders are easy to overlook here because the offending part is small and the design reads as balanced overall.',
      'If you have purchased your own ISBN and are supplying your own barcode, you still place it in the same area, at 300 DPI or better, with the same clearance around it.',
    ],
    extraFaqs: [
      { question: 'How large is the KDP barcode area?', answer: 'Approximately 2 x 1.2 inches in the lower-right of the back cover, with at least 0.25 inches of clearance recommended around it.' },
      { question: 'Will the barcode cover my back cover artwork?', answer: 'Yes, within its footprint, and it prints on a white background. On dark back covers, design a light panel into that corner so the result looks intentional.' },
      { question: 'Do I need to add the barcode myself?', answer: 'No. Amazon adds it automatically unless you are supplying your own ISBN and barcode. Either way, leave the space clear.' },
    ],
  },

  'pdf-export': {
    explainer: [
      'The export step is where most KDP problems are actually created. Your design can be entirely correct and the resulting PDF still be unusable, because exporting is a translation — from a live document with layers, fonts, and linked images into a fixed file that a printer will interpret literally.',
      'Amazon does not see your Canva project, your InDesign document, or your Affinity file. It sees the PDF. Every check it runs is against that file, which is why the only meaningful validation is validation of the exported artefact rather than the source design.',
      'Four things commonly go wrong in translation. Bleed is dropped, because the export preset did not include it. Images are downsampled to web quality, pushing effective resolution below the 300 DPI that prints cleanly. Fonts are not embedded, so text reflows or substitutes on Amazon’s systems. And colour is converted unexpectedly, so a screen-accurate design prints duller than intended.',
      'Print-oriented export presets exist precisely to avoid these. Use the print or press-quality option rather than the smallest-file or web option, enable bleed explicitly, and confirm that fonts are embedded rather than outlined away or substituted. In Canva, that means PDF Print with crop marks and bleed ticked; in InDesign and Illustrator, a press-quality preset with document bleed settings enabled; in Affinity Publisher, a PDF for print preset with bleed included.',
      'Then check the file you produced. Open the PDF, read its page dimensions in inches, and confirm they match what your book specification requires. It takes a few seconds and catches the majority of upload failures before Amazon ever sees the file.',
    ],
    extraFaqs: [
      { question: 'Should I validate the source design or the exported PDF?', answer: 'The exported PDF, always. It is the only file Amazon processes, and the export step is where bleed, resolution, and font problems are introduced.' },
      { question: 'What resolution do KDP print files need?', answer: '300 DPI at final printed size is the recommendation. Below that, artwork prints soft; below about 150 DPI, degradation is obvious to the reader.' },
      { question: 'How large can a KDP print file be?', answer: 'The maximum is 650 MB. Files above roughly 300 MB are worth compressing first, since large uploads are slow and more likely to time out.' },
    ],
  },

  'cover-template': {
    explainer: [
      'A cover template is a pre-built guide showing exactly where the trim lines, spine folds, bleed area, safe area, and barcode zone fall for one specific book configuration. KDP generates them on demand from your trim size, page count, paper type, and book format.',
      'Used properly, a template removes the arithmetic from cover design. Rather than calculating the full wrap width yourself and hoping you positioned the spine correctly, you build on a canvas where every boundary is already drawn in the right place.',
      'The critical constraint is that a template is generated for one exact configuration. It is not a generic guide for your trim size. Change the page count and the spine width changes, so the template no longer describes your book — and because the spine sits in the middle of the wrap, a stale template puts the front and back panels in the wrong horizontal positions as well as making the file the wrong width.',
      'The habit worth forming is to regenerate the template after the manuscript is final rather than downloading one early in the project. Any template obtained before the page count settled is out of date by definition.',
      'The other frequent mistake is leaving the template visible in the export. Guide lines belong on a layer that is hidden or deleted before the PDF is produced. A cover printed with its own trim guides visible is a striking way to demonstrate that the file was never checked after export.',
      'Templates are also format-specific. A paperback template will not work for a hardcover edition of the same book, because hardcover cases need hinge allowance beside the spine and additional wrap material on every outside edge.',
    ],
    extraFaqs: [
      { question: 'When should I download the cover template?', answer: 'After the manuscript is final and the page count is fixed. A template generated earlier will specify the wrong spine width and therefore the wrong overall cover dimensions.' },
      { question: 'Can I use a paperback template for a hardcover?', answer: 'No. Hardcover cases require hinge zones either side of the spine and wider wrap allowance on the outside edges, so the panel layout genuinely differs.' },
      { question: 'Do template guide lines print?', answer: 'They will if you leave them visible. Put the template on its own layer and hide or delete it before exporting the final PDF.' },
    ],
  },

  'hardcover-cover': {
    explainer: [
      'A hardcover cover is a case wrap: a printed sheet glued around rigid boards rather than a flexible cover attached directly to the book block. That physical difference changes the layout in ways that go beyond scaling a paperback cover up.',
      'Two zones exist on a hardcover that have no paperback equivalent. The wrap is the margin of material folded around each board edge and glued to the inside — roughly 0.625 inches on every outside edge. Anything placed there is turned under and permanently hidden. The hinge is the flexible channel either side of the spine where the case bends when the book opens, about 0.375 inches wide on each side; content there disappears into the fold and distorts as the book is used.',
      'Together these consume a substantial band around the whole design. A layout that looks generously spaced as a flat rectangle can lose its outer content entirely once the case is assembled, which is why resizing a paperback cover to hardcover dimensions reliably produces a poor result.',
      'The hinge in particular changes how the front cover reads. Because the flexing channel sits inboard of the spine, the visible front panel starts further from the spine than it would on a paperback. Titles and artwork positioned relative to the spine need repositioning, not rescaling.',
      'Plan for a rebuild rather than a conversion if you are publishing both formats. Keep the source artwork at high resolution and lay it out fresh on a hardcover template, treating the wrap and hinge as areas that will not be seen. The front cover image can be reused; the composition around it cannot.',
    ],
    extraFaqs: [
      { question: 'Can I reuse my paperback cover for the hardcover edition?', answer: 'Not by resizing. Hardcover cases need wrap allowance on the outside edges and hinge allowance beside the spine, so the panel proportions differ. Rebuild the layout on a hardcover template using the same source artwork.' },
      { question: 'What is the hinge area on a hardcover?', answer: 'A flexible channel roughly 0.375 inches wide on each side of the spine, where the case bends as the book opens. Content placed there folds into the crease and should be avoided.' },
      { question: 'How much wrap does a hardcover need?', answer: 'Around 0.625 inches on each outside edge. This material folds around the board and is glued to the inside, so anything printed there is never visible.' },
    ],
  },
};
