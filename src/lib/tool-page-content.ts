import type { ToolPageSlug } from './tool-pages';

/**
 * Long-form editorial content for each /tools/* page.
 *
 * Kept separate from `tool-pages.ts` so the metadata/CTA config stays readable.
 * Every number quoted here is sourced from `src/lib/kdp/kdp-rules.ts`, which in
 * turn cites the official KDP help topics — keep the two in sync when KDP
 * changes a specification.
 */

export type ToolSection = {
  heading: string;
  body: string[];
  bullets?: { term: string; text: string }[];
  table?: { caption: string; columns: string[]; rows: string[][] };
};

export const toolPageSections: Record<ToolPageSlug, ToolSection[]> = {
  'kdp-cover-checker': [
    {
      heading: 'Why KDP covers get rejected',
      body: [
        'Almost every KDP cover rejection comes down to the same thing: the PDF you exported is not the size Amazon expected. KDP does not check your design in Canva, Photoshop, or Affinity Publisher. It measures the finished PDF, compares it against the dimensions implied by your trim size, page count, and paper type, and rejects anything outside tolerance.',
        'That is why a cover can look perfect on screen and still fail. The guides you set up in your design tool are not written into the exported file. If the export dropped the bleed area, flattened to the wrong page size, or used a spine width calculated from a draft page count, the PDF Amazon receives is simply the wrong shape.',
        'The second-largest category is content placed where the press cannot reliably print it. Paperback printing has physical tolerance: the sheet shifts slightly as it is cut and bound. Text sitting close to the trim line on your screen can be cut off on the finished book, and Amazon flags it before that happens.',
      ],
    },
    {
      heading: 'How KDP cover dimensions are calculated',
      body: [
        'A print cover is one single PDF page containing the back cover, the spine, and the front cover side by side, plus bleed around the outside. It is not three files, and it is not a front-cover image. The full width is the sum of every panel:',
        'Total width = 0.125 in bleed + trim width (back) + spine width + trim width (front) + 0.125 in bleed. Total height = trim height + 0.25 in, which is 0.125 in of bleed at the top and the same at the bottom.',
        'The spine is the part that moves. It is derived from your page count and paper type, so changing your manuscript by even a few pages changes the required width of the whole cover. This is the single most common reason a cover that passed last week fails today.',
      ],
      bullets: [
        { term: 'Bleed', text: '0.125 in on all four outside edges of the cover. The spine does not get its own bleed — it sits between the two panels.' },
        { term: 'Trim size', text: 'The finished cut size of the book, e.g. 6 x 9 in. Trim never includes bleed.' },
        { term: 'Spine width', text: 'Page count multiplied by a per-page paper factor. See the spine width calculator for the exact factors.' },
        { term: 'Safe area', text: 'Keep text, logos, and important artwork at least 0.25 in inside the trim line on every panel.' },
        { term: 'Barcode zone', text: 'Amazon prints a barcode in the lower-right of the back cover. Reserve roughly 2 x 1.2 in and keep it clear.' },
      ],
    },
    {
      heading: 'What the checker reads from your PDF',
      body: [
        'The checker opens the actual exported file rather than trusting your design settings. It measures the real page geometry and compares it against what your book specification requires, then reports the difference in inches so you know exactly how much to adjust.',
        'Because the analysis runs in your browser, the PDF is never uploaded to a server. Nothing about an unpublished cover leaves your machine, which matters if you are working under an NDA or simply do not want a draft cover sitting in someone else’s storage.',
      ],
      bullets: [
        { term: 'Page count', text: 'A print cover must be exactly one PDF page. Multi-page exports are rejected by KDP.' },
        { term: 'Actual page size', text: 'Measured in inches and compared to the expected full-wrap dimensions.' },
        { term: 'Implied spine', text: 'Working backwards from the file width to check whether the spine you designed matches the spine your page count requires.' },
        { term: 'Image resolution', text: 'Effective DPI of placed artwork. Below 300 DPI prints soft; below 150 DPI is visibly degraded.' },
        { term: 'File size', text: 'KDP caps print files at 650 MB. Files above roughly 300 MB are worth compressing before upload.' },
      ],
    },
    {
      heading: 'Fixing the most common warnings',
      body: [
        'If the file is too small in both directions by exactly 0.125 in per edge, your export dropped the bleed. Re-export with bleed included rather than scaling the artwork up, which softens the image and shifts every element off its intended position.',
        'If the width is wrong but the height is correct, the spine is the culprit. Recalculate it from your final page count and paper type, rebuild the cover at the new width, and reposition the front and back panels. Do not stretch the existing artwork to fit.',
        'If dimensions are right but content sits in a risk zone, move the offending element inward. The safe area is a printing tolerance, not a stylistic suggestion. Spine text in particular needs a book thick enough to hold it: below about 80 pages the spine is too narrow to place text safely, and it is better to leave it blank than to have it wrap onto the front cover.',
      ],
    },
  ],

  'kdp-bleed-checker': [
    {
      heading: 'What bleed actually is',
      body: [
        'Bleed is extra artwork extending past the line where the book will be cut. Printing and cutting both have tolerance, so the blade never lands in exactly the same place twice. If your background stops precisely at the trim line, a cut that drifts even a fraction outward exposes the bare paper underneath, and you get a thin white sliver along the edge of a finished book.',
        'Extending the artwork past the trim line gives the blade somewhere to land. Whatever falls outside the trim is discarded; the reader only ever sees the trimmed page. KDP asks for 0.125 in of bleed, which is one eighth of an inch.',
        'The critical point that trips up most authors: bleed lives in the exported PDF, not in your design tool. Setting up bleed guides in Canva or Photoshop does nothing on its own. If the export does not include the bleed area, the file KDP receives is trim-only and it will be flagged.',
      ],
    },
    {
      heading: 'When you need bleed and when you do not',
      body: [
        'Bleed is required whenever ink is meant to reach the edge of the page. It is unnecessary, and sometimes counterproductive, when your pages have white margins all the way around.',
      ],
      bullets: [
        { term: 'Use bleed', text: 'Coloring books, full-page photographs, illustrated children’s books, workbooks with edge-to-edge colour blocks, and any cover with a background that reaches the edge — which is nearly every cover.' },
        { term: 'Skip bleed', text: 'Novels, poetry, journals, and text-only nonfiction where every page has a white margin. No-bleed setups are simpler and leave less room for export error.' },
        { term: 'Mixed interiors', text: 'If any interior page bleeds, the whole manuscript must be set up with bleed. You cannot mix bleed and no-bleed pages in one file.' },
      ],
    },
    {
      heading: 'The dimension maths that catches people out',
      body: [
        'Interior pages and covers add bleed differently, and confusing the two produces a file that is wrong by a predictable amount.',
        'For an interior page with bleed, add 0.125 in to the width and 0.25 in to the height. The width only gains bleed on the outer edge because the inner edge is bound into the spine and never cut. The height gains bleed at both top and bottom. A 6 x 9 in interior with bleed exports at 6.125 x 9.25 in.',
        'For a cover, all four outside edges are cut, so the full wrap gains 0.125 in on every side: 0.25 in total on the width and 0.25 in total on the height, on top of the combined panel widths.',
      ],
      table: {
        caption: 'Interior page size with and without bleed',
        columns: ['Trim size', 'No bleed', 'With bleed'],
        rows: [
          ['5 x 8 in', '5 x 8 in', '5.125 x 8.25 in'],
          ['5.5 x 8.5 in', '5.5 x 8.5 in', '5.625 x 8.75 in'],
          ['6 x 9 in', '6 x 9 in', '6.125 x 9.25 in'],
          ['7 x 10 in', '7 x 10 in', '7.125 x 10.25 in'],
          ['8.5 x 11 in', '8.5 x 11 in', '8.625 x 11.25 in'],
        ],
      },
    },
    {
      heading: 'Export settings that silently drop bleed',
      body: [
        'Most missing-bleed problems are a single unchecked box in the export dialog. The design is correct; the file is not.',
        'In Canva, exporting as PDF Print without ticking "Crop marks and bleed" produces a trim-sized file even when the bleed guides are visible on your canvas. In Adobe InDesign and Illustrator, the bleed values must be entered in the Marks and Bleeds panel at export, or set with "Use Document Bleed Settings" enabled. In Affinity Publisher, bleed is set on the document and must also be included in the PDF export preset. Photoshop has no bleed concept at all: you must build the canvas at the full bleed dimensions yourself.',
        'After exporting, check the file. Open the PDF properties and read the page size in inches. If it matches the trim size exactly, the bleed is not there, whatever your design tool showed you.',
      ],
    },
    {
      heading: 'Do not fix bleed by scaling',
      body: [
        'The tempting shortcut when a file is 0.125 in too small is to scale it up to the right dimensions. Avoid this. Scaling enlarges every element, so text drifts toward the trim line and may land inside the safe-area zone or the barcode area, and raster artwork loses effective resolution, potentially dropping below the 300 DPI threshold for clean printing.',
        'Return to the source design, extend the background artwork past the trim boundary, and re-export with bleed enabled. It takes a few minutes and produces a file that is correct rather than one that is merely the right size.',
      ],
    },
  ],

  'kdp-spine-width-calculator': [
    {
      heading: 'How KDP calculates spine width',
      body: [
        'Spine width is a straightforward multiplication: page count multiplied by the thickness of a single sheet of the paper you selected. There is no rounding table and no minimum — a 100-page book on white paper has a spine of 0.2252 in, and that is the number your cover must be built around.',
        'The per-page factor depends on the paper and ink combination you chose in your KDP book setup, not on trim size. Getting the paper type wrong is a common source of error because the resulting difference is small enough to look plausible but large enough to fail validation.',
      ],
      table: {
        caption: 'KDP per-page thickness by paper and ink type',
        columns: ['Paper / ink', 'Inches per page', 'Spine at 200 pages', 'Spine at 400 pages'],
        rows: [
          ['Black ink, white paper', '0.002252', '0.4504 in', '0.9008 in'],
          ['Black ink, cream paper', '0.0025', '0.5000 in', '1.0000 in'],
          ['Standard colour, white paper', '0.002347', '0.4694 in', '0.9388 in'],
          ['Premium colour, white paper', '0.002347', '0.4694 in', '0.9388 in'],
        ],
      },
    },
    {
      heading: 'Why the spine changes your whole cover',
      body: [
        'The spine is not a separate file. It is the middle strip of one full-wrap cover PDF, so its width is part of the total cover width: bleed, back cover, spine, front cover, bleed. Change the spine and the total width changes with it.',
        'This is why editing your manuscript after designing the cover is such a reliable way to break the upload. Adding a two-page acknowledgements section changes the page count, which changes the spine, which changes the required cover width. The cover file that passed validation yesterday is now the wrong size, and Amazon reports it as a dimension mismatch rather than a spine problem — which is why the cause is often missed.',
        'The practical rule: finalise your interior first. Get the manuscript to its final, formatted page count, and only then calculate the spine and build the cover.',
      ],
    },
    {
      heading: 'Cream versus white at the same page count',
      body: [
        'Cream paper is thicker than white — 0.0025 in per page against 0.002252 in. At 300 pages that is a spine of 0.75 in on cream and 0.6756 in on white, a difference of nearly 0.075 in.',
        'That gap is more than enough to fail validation, and it is invisible in your design tool. If you switched from white to cream partway through setup, or picked one in KDP and designed for the other, recalculate before exporting.',
      ],
    },
    {
      heading: 'Spine text: when to include it, when to leave it off',
      body: [
        'Spine text needs a spine wide enough to hold it with clearance on both sides. As a working threshold, books under about 80 pages have spines too narrow for reliable spine text. At 80 pages on white paper the spine is roughly 0.18 in — thinner than a pencil — and binding tolerance can shift printed text around by a noticeable fraction of that.',
        'When the spine is wide enough, keep at least 0.0625 in of clearance between your text and each spine edge. Text that runs closer risks wrapping onto the front or back cover on some copies of the print run, which looks like a manufacturing defect even though the file caused it.',
        'If your book is borderline, leaving the spine blank or using a solid colour is the safer choice. A clean blank spine reads as a deliberate design decision; text creeping around the edge does not.',
      ],
      bullets: [
        { term: 'Under 80 pages', text: 'Leave the spine blank. Use a solid colour that continues from the front and back covers.' },
        { term: '80 to 130 pages', text: 'Possible but tight. Use a small, bold typeface and keep clearance generous.' },
        { term: 'Over 130 pages', text: 'Comfortable for title and author name. Keep at least 0.0625 in from each edge.' },
        { term: 'Any page count', text: 'Spine text must run top-to-bottom for a book read left-to-right — the convention on English-language shelves.' },
      ],
    },
  ],

  'kdp-trim-size-calculator': [
    {
      heading: 'Choosing a trim size',
      body: [
        'Trim size is the finished cut dimension of your book, and it is the decision every other specification hangs from. Margins, spine width, cover dimensions, and even whether your book qualifies for Expanded Distribution all follow from it.',
        'Changing trim size after you have laid out a manuscript means reflowing the entire interior and rebuilding the cover from scratch, so it is worth getting right at the start. Choose based on what readers in your category expect, not on what looks appealing in isolation — a novel in an unusual size reads as self-published even when the content is excellent.',
      ],
      bullets: [
        { term: '5 x 8 and 5.25 x 8 in', text: 'Compact fiction, poetry, novellas, and pocket-sized nonfiction.' },
        { term: '5.5 x 8.5 in', text: 'The default for fiction. Familiar, economical, and eligible for Expanded Distribution on both white and cream paper.' },
        { term: '6 x 9 in', text: 'The default for nonfiction, memoir, and business books. The most widely supported size on KDP.' },
        { term: '7 x 10 and 8 x 10 in', text: 'Illustrated nonfiction, cookbooks, and textbooks where images need room.' },
        { term: '8.5 x 11 in', text: 'Workbooks, planners, journals, and coloring books. Matches US Letter, so it feels natural for anything a reader writes in.' },
        { term: '8.5 x 8.5 in', text: 'Square format for children’s picture books and photography.' },
      ],
    },
    {
      heading: 'Interior margins scale with page count',
      body: [
        'The inside margin — the gutter — is the space swallowed by the binding. A thick book curves more sharply at the spine, so it needs a wider gutter to keep text readable without the reader cracking the spine flat.',
        'KDP enforces a minimum gutter that grows with page count. Outside, top, and bottom margins have a flat minimum of 0.25 in without bleed, or 0.375 in with bleed. These are minimums, not targets: adding a little extra makes the finished book more comfortable to read.',
      ],
      table: {
        caption: 'KDP minimum margins by page count',
        columns: ['Page count', 'Inside (gutter)', 'Outside, no bleed', 'Outside, with bleed'],
        rows: [
          ['24 to 150', '0.375 in', '0.25 in', '0.375 in'],
          ['151 to 300', '0.5 in', '0.25 in', '0.375 in'],
          ['301 to 500', '0.625 in', '0.25 in', '0.375 in'],
          ['501 to 700', '0.75 in', '0.25 in', '0.375 in'],
          ['701 to 828', '0.875 in', '0.25 in', '0.375 in'],
        ],
      },
    },
    {
      heading: 'Page count limits and Expanded Distribution',
      body: [
        'Print books have a floor of 24 pages and a ceiling that depends on trim size, paper, and ink. Black ink on white paper supports the longest books; colour interiors and cream paper cap out sooner because the paper is thicker and the book block can only get so wide before it cannot be bound.',
        'Expanded Distribution — which makes your book available to bookstores and libraries beyond Amazon — is only offered on certain combinations. Standard sizes like 5.5 x 8.5 and 6 x 9 in qualify broadly. Larger and squarer formats such as 8.25 x 8.25, 8.25 x 11, and 8.25 x 6 in are not eligible at all, regardless of paper choice. Some sizes qualify on white paper but not cream.',
        'If distribution beyond Amazon matters to your plans, check eligibility before you design rather than discovering the restriction at publication.',
      ],
    },
    {
      heading: 'From trim size to finished files',
      body: [
        'Once trim size is settled, every other dimension follows deterministically. Your interior page size is the trim size, or the trim size plus 0.125 in width and 0.25 in height if you are using bleed. Your cover width is two trim widths plus the spine plus 0.25 in of bleed, and your cover height is the trim height plus 0.25 in.',
        'Set your design tool to those exact dimensions before you place a single element. Building at the wrong size and scaling afterwards is the root cause of most rejected uploads, because scaling moves content relative to the safe area and degrades image resolution at the same time.',
      ],
    },
  ],

  'kdp-cover-validator': [
    {
      heading: 'What a valid KDP print cover looks like',
      body: [
        'A print cover is one PDF page, laid out as a single continuous wrap. Reading left to right it contains the back cover, then the spine, then the front cover, with 0.125 in of bleed around the outside. There are no separate files, no multi-page PDFs, and no front-cover-only uploads for paperbacks or hardcovers.',
        'This surprises authors who have published an ebook first. Kindle covers are a single front-facing image; print covers are a physical object flattened into one file. Uploading an ebook cover to a paperback listing is one of the most common first-time rejections, and the error message does not always make the cause obvious.',
      ],
    },
    {
      heading: 'The dimensions the validator checks',
      body: [
        'Validation compares the geometry actually present in your PDF against the geometry your book specification requires. Both numbers are derived independently — one from the file, one from your trim size, page count, and paper type — so a mismatch tells you precisely which panel is wrong.',
      ],
      bullets: [
        { term: 'Single page', text: 'Exactly one PDF page. A two-page export with front and back separated will be rejected.' },
        { term: 'Total width', text: '0.125 + trim width + spine width + trim width + 0.125, in inches.' },
        { term: 'Total height', text: 'Trim height + 0.25 in, giving 0.125 in of bleed top and bottom.' },
        { term: 'Implied spine', text: 'Derived from the file width, then compared against the spine your page count and paper type require.' },
        { term: 'Barcode clearance', text: 'Roughly 2 x 1.2 in in the lower-right of the back cover, kept free of text and busy artwork.' },
        { term: 'Safe area', text: 'Important content at least 0.25 in inside the trim line on every panel.' },
        { term: 'Resolution', text: 'Effective image DPI at final size, checked against the 300 DPI recommendation.' },
      ],
    },
    {
      heading: 'The barcode area',
      body: [
        'Amazon prints a barcode on the back cover of every print book, in the lower-right corner. You do not supply it, but you do have to leave room for it. Reserve approximately 2 x 1.2 in and keep at least 0.25 in of clearance around that zone.',
        'The barcode is printed on a white background. If your back cover is dark, a white rectangle will appear over your artwork — which looks accidental unless you designed for it. The cleanest solution is to place a deliberate light-coloured panel in that corner so the barcode sits on something intentional.',
        'Blurb text, review quotes, and author photographs are the usual casualties here. Anything overlapping the barcode zone is either obscured by the barcode or flagged during review.',
      ],
    },
    {
      heading: 'Validation versus calculation',
      body: [
        'A calculator predicts what your file should be. A validator reads what your file actually is. Both are useful, and they catch different problems.',
        'Use a calculator before you design, to establish the canvas dimensions to build on. Use a validator after you export, because the export step is where things go wrong — bleed gets dropped, page sizes get rounded, artwork gets scaled, colour profiles get converted. The design can be flawless and the exported PDF still be unusable.',
        'The practical workflow is to calculate first, design to those numbers, export, then validate the exported file before uploading. Validating the file you are actually going to upload — not a proof, not a preview, not a re-saved copy — is what catches the last category of errors.',
      ],
    },
    {
      heading: 'Hardcover covers are different',
      body: [
        'Hardcover case wraps are not paperback covers at larger dimensions. The case has to fold around rigid board, which requires additional wrap material on all four edges, and it needs hinge allowance on either side of the spine where the cover flexes when the book opens.',
        'KDP allows roughly 0.625 in of wrap on each outside edge and about 0.375 in of hinge on each side of the spine. Content placed in the hinge area disappears into the fold; content in the wrap area is turned under and glued to the inside of the board where nobody sees it.',
        'If you are publishing the same book in both formats, budget time to rebuild the cover rather than resizing it. The panel proportions genuinely differ, and a stretched paperback cover will not fold correctly.',
      ],
    },
  ],
};
