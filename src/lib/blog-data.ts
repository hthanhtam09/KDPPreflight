export type BlogCategory =
  | 'KDP Covers'
  | 'Bleed'
  | 'Trim Size'
  | 'Spine'
  | 'Safe Area'
  | 'Publishing Errors';

export type BlogToolLink = {
  label: string;
  href: string;
  description: string;
};

export type BlogGuideLink = {
  label: string;
  href: string;
};

export type BlogFAQ = {
  question: string;
  answer: string;
};

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  excerpt: string;
  category: BlogCategory;
  tags: string[];
  publishedAt: string;
  updatedAt?: string;
  readingTime: string;
  readingTimeMinutes: number;
  featured?: boolean;
  author: string;
  relatedTools: string[];
  relatedPosts: string[];
  relatedGuides: BlogGuideLink[];
  faqs: BlogFAQ[];
  summary: string[];
  keywords: string[];
  content: string;
};

export const blogTools: Record<string, BlogToolLink> = {
  checker: {
    label: 'Free KDP Cover Checker',
    href: '/checker',
    description: 'Validate cover PDF size, bleed, trim, spine width, safe area, and image quality before upload.',
  },
  preview: {
    label: 'KDP 3D Book Preview',
    href: '/preview',
    description: 'Preview paperback and hardcover books in a realistic browser-based 3D viewer.',
  },
  bleedChecker: {
    label: 'KDP Bleed Checker',
    href: '/kdp-bleed-checker',
    description: 'Check whether your PDF includes the required 0.125 inch bleed.',
  },
  trimCalculator: {
    label: 'KDP Trim Size Calculator',
    href: '/kdp-trim-size-calculator',
    description: 'Calculate trim, bleed, and print-ready page dimensions for common KDP book sizes.',
  },
  spineCalculator: {
    label: 'KDP Spine Width Calculator',
    href: '/kdp-spine-width-calculator',
    description: 'Calculate exact spine width from page count, paper type, and trim size.',
  },
};

export const blogPosts: BlogPost[] = [
  {
    slug: 'kdp-bleed-guide',
    title: 'KDP Bleed Guide: Fix Missing Bleed Before Upload',
    description:
      'Learn exactly how KDP bleed works, why Amazon flags missing bleed, and how to export print-ready PDFs from Canva, InDesign, Illustrator, and Affinity Publisher.',
    excerpt:
      'A practical guide to the 0.125 inch KDP bleed requirement, common export mistakes, and the fastest way to verify your final PDF.',
    category: 'Bleed',
    tags: ['KDP bleed', 'print-ready PDF', 'Canva bleed', 'PDF export'],
    publishedAt: '2026-01-08',
    updatedAt: '2026-04-22',
    readingTime: '8 min read',
    readingTimeMinutes: 8,
    featured: true,
    author: 'KDP Preflight Editorial',
    relatedTools: ['bleedChecker', 'checker', 'trimCalculator'],
    relatedPosts: ['kdp-cover-size-guide', 'kdp-safe-area-guide', 'kdp-upload-error-fixes'],
    relatedGuides: [
      { label: 'KDP Bleed Checker', href: '/kdp-bleed-checker' },
      { label: 'KDP Paperback Guide', href: '/kdp-paperback-guide' },
    ],
    faqs: [
      {
        question: 'How much bleed does Amazon KDP require?',
        answer:
          'Amazon KDP expects 0.125 inch bleed on the outer edges where artwork, backgrounds, or images reach the trim line.',
      },
      {
        question: 'Why does my KDP file still fail after I added bleed guides?',
        answer:
          'Most failures happen because the design file has bleed guides but the exported PDF does not include the bleed area. The PDF dimensions must be larger than the trim size.',
      },
      {
        question: 'Can I fix missing bleed without redesigning the whole book?',
        answer:
          'Often yes. Resize the document or export with bleed enabled, then extend edge artwork into the bleed area before exporting again.',
      },
    ],
    summary: [
      'Bleed is the extra 0.125 inch print area beyond the trim edge.',
      'KDP rejects files when the exported PDF dimensions omit bleed.',
      'Always verify the final PDF dimensions before uploading to Amazon KDP.',
    ],
    keywords: ['KDP bleed guide', 'KDP bleed checker', 'fix KDP bleed error', 'Amazon KDP bleed'],
    content: `
## What KDP bleed means

KDP bleed is the extra **0.125 inch** of artwork that extends beyond the finished trim edge. It exists because printed books are cut in batches, and a tiny production shift can expose a white edge when the artwork stops exactly at the trim line.

If your cover, manuscript background, illustration, or full-page image reaches the edge, it needs bleed. Body text and important cover elements should stay inside the safe area instead.

## The correct bleed math

For a single page with bleed, add 0.125 inch to each outside edge. A 6 x 9 inch page with bleed becomes **6.25 x 9.25 inches**.

For a full paperback cover wrap, use this formula:

**total width = back cover + spine width + front cover + 0.25 inch bleed**

**total height = trim height + 0.25 inch bleed**

## Why Amazon flags missing bleed

Amazon KDP checks the actual PDF boxes and dimensions, not just what your design tool shows. You can have visible bleed guides in Canva, Illustrator, InDesign, or Affinity Publisher and still export a trim-only PDF.

Common causes include:

- The canvas was built at trim size instead of bleed size
- The export dialog did not include bleed
- Artwork stops at the trim line instead of extending past it
- A PDF optimizer cropped the file after export

## How to fix bleed in Canva

Create the design at the finished bleed size when possible. For a 6 x 9 inch full-bleed interior page, use 6.25 x 9.25 inches. Extend backgrounds and edge artwork to the full canvas.

When downloading, choose PDF Print and enable crop marks and bleed. Then check the downloaded PDF dimensions, not only the Canva preview.

## How to fix bleed in Adobe apps

In InDesign or Illustrator, keep the artboard or page at trim size and define bleed as 0.125 inch in document setup. Extend artwork to the red bleed guide. During export, enable document bleed settings.

In Affinity Publisher, define bleed in document setup, extend artwork into the bleed zone, and enable include bleed in the PDF export options.

## Verify before uploading

Use the [KDP bleed checker](/kdp-bleed-checker) or the full [KDP cover checker](/checker) before uploading. The tool reads the PDF dimensions and highlights whether the file includes the required bleed.

## Summary

Missing bleed is usually an export problem, not a design talent problem. Build or export the PDF at the correct bleed size, extend edge artwork past the trim, and verify the final PDF before KDP reviews it.
`,
  },
  {
    slug: 'kdp-cover-size-guide',
    title: 'KDP Cover Size Guide: Full Wrap Dimensions for Paperbacks',
    description:
      'Calculate exact KDP cover dimensions for paperback full wraps, including front cover, back cover, spine width, bleed, trim size, and 300 DPI pixel dimensions.',
    excerpt:
      'Use the full-wrap formula KDP expects and avoid cover dimension errors caused by wrong trim size, bleed, or page count.',
    category: 'KDP Covers',
    tags: ['KDP cover size', 'cover dimensions', 'full wrap', '300 DPI'],
    publishedAt: '2026-01-18',
    updatedAt: '2026-04-22',
    readingTime: '7 min read',
    readingTimeMinutes: 7,
    author: 'KDP Preflight Editorial',
    relatedTools: ['checker', 'trimCalculator', 'spineCalculator', 'preview'],
    relatedPosts: ['kdp-spine-width-guide', 'kdp-bleed-guide', 'kdp-upload-error-fixes'],
    relatedGuides: [
      { label: 'KDP Cover Size Guide', href: '/kdp-cover-size-guide' },
      { label: 'KDP Trim Size Calculator', href: '/kdp-trim-size-calculator' },
    ],
    faqs: [
      {
        question: 'What size should my KDP cover be?',
        answer:
          'A KDP paperback cover must be one full-wrap PDF containing back cover, spine, front cover, and bleed. The exact size depends on trim size, page count, and paper type.',
      },
      {
        question: 'Can I upload only the front cover to KDP?',
        answer:
          'For paperback and hardcover print books, KDP expects a full cover wrap PDF, not a front-cover-only image.',
      },
    ],
    summary: [
      'KDP print covers are full wraps, not front-cover-only files.',
      'Total width changes whenever page count or paper type changes.',
      'Use 300 DPI pixel dimensions only after calculating the correct inch size.',
    ],
    keywords: ['KDP cover size guide', 'KDP cover dimensions', 'Amazon KDP cover size', 'full wrap cover'],
    content: `
## The KDP full cover formula

KDP paperback covers are uploaded as one full-wrap PDF. The file includes the back cover, spine, front cover, and bleed.

Use this formula:

**cover width = back trim width + spine width + front trim width + 0.25 inch bleed**

**cover height = trim height + 0.25 inch bleed**

## Example for a 6 x 9 paperback

For a 6 x 9 inch paperback with 300 pages on white paper:

- Back cover: 6 inches
- Spine: 0.676 inches
- Front cover: 6 inches
- Bleed: 0.25 inches total width
- Total cover size: **12.926 x 9.25 inches**

At 300 DPI, that is about **3878 x 2775 pixels**.

## Why page count matters

The spine width is calculated from page count and paper type. If your manuscript changes from 300 pages to 320 pages, the spine becomes wider and the total cover PDF width changes.

That means cover design should happen after the manuscript is close to final. If the page count changes, recalculate before exporting.

## Common cover size mistakes

- Uploading a front cover instead of a full wrap
- Forgetting the 0.125 inch bleed on each outside edge
- Using the wrong paper type in the spine calculation
- Designing at a rounded width instead of the exact decimal size
- Exporting from Canva or Adobe tools with the wrong page bounds

## Set up guides before designing

Create guides for the back cover, spine, front cover, trim line, bleed line, and safe area. The spine boundaries should be exact, not eyeballed.

The [KDP trim size calculator](/kdp-trim-size-calculator) and [KDP spine width calculator](/kdp-spine-width-calculator) help you calculate the exact values before you build the canvas.

## Final check

Before uploading, run the exported PDF through the [KDP cover checker](/checker). It compares the PDF width and height against the expected KDP dimensions for your trim size, paper type, and page count.
`,
  },
  {
    slug: 'kdp-spine-width-guide',
    title: 'KDP Spine Width Guide: Calculate Spine Size from Page Count',
    description:
      'Understand how KDP spine width is calculated from page count and paper type, and how to avoid spine text, cover wrap, and upload errors.',
    excerpt:
      'A clear spine-width reference for KDP paperbacks, including formulas, design limits, and full cover wrap implications.',
    category: 'Spine',
    tags: ['KDP spine width', 'page count', 'paper type', 'spine text'],
    publishedAt: '2026-02-03',
    updatedAt: '2026-04-22',
    readingTime: '7 min read',
    readingTimeMinutes: 7,
    author: 'KDP Preflight Editorial',
    relatedTools: ['spineCalculator', 'checker', 'preview'],
    relatedPosts: ['kdp-cover-size-guide', 'kdp-safe-area-guide', 'kdp-upload-error-fixes'],
    relatedGuides: [
      { label: 'KDP Spine Width Calculator', href: '/kdp-spine-width-calculator' },
      { label: 'KDP Paperback Guide', href: '/kdp-paperback-guide' },
    ],
    faqs: [
      {
        question: 'How does KDP calculate spine width?',
        answer:
          'KDP spine width is calculated from page count multiplied by the paper type thickness constant.',
      },
      {
        question: 'When can I put text on a KDP spine?',
        answer:
          'Spine text is safest when the book has enough pages to create a readable spine. Very thin books should avoid spine text.',
      },
    ],
    summary: [
      'Spine width is determined by page count and paper type.',
      'A changed manuscript page count changes the full cover width.',
      'Thin books often should not use spine text.',
    ],
    keywords: ['KDP spine width guide', 'KDP spine calculator', 'paperback spine width', 'KDP spine text'],
    content: `
## What spine width controls

Spine width controls two important things: the physical book spine and the total width of your cover PDF. If the spine width is wrong, KDP can reject the cover even when the front and back artwork look perfect.

## The spine formula

**spine width = page count x paper thickness**

Common KDP paper constants include:

- White paper: 0.002252 inch per page
- Cream paper: 0.0025 inch per page
- Color interior: 0.002347 inch per page

## Example spine calculation

A 300 page paperback on white paper:

**300 x 0.002252 = 0.6756 inches**

Rounded for layout, that is about **0.676 inches**.

## How spine width changes the cover

The spine sits between the back and front covers. For a 6 x 9 book with 300 white-paper pages, the full cover width is:

**6 + 0.676 + 6 + 0.25 = 12.926 inches**

If the book grows to 340 pages, the cover width must grow too.

## Spine text rules

Thin spines are risky. Keep text away from the spine folds and avoid spine text completely on very short books. For moderate spines, use compact type, generous spacing, and exact spine guides.

## Best workflow

Finalize the manuscript page count, calculate spine width, build the full cover canvas, export the PDF, then verify the result with the [KDP spine width calculator](/kdp-spine-width-calculator) and [KDP cover checker](/checker).
`,
  },
  {
    slug: 'kdp-safe-area-guide',
    title: 'KDP Safe Area Guide: Keep Cover Text Away from the Trim',
    description:
      'Learn KDP safe area rules for cover text, logos, barcode placement, spine content, margins, and full-bleed artwork.',
    excerpt:
      'Place text, logos, barcode space, and key artwork where they will survive real-world trimming and KDP preview checks.',
    category: 'Safe Area',
    tags: ['KDP safe area', 'cover margins', 'barcode area', 'trim edge'],
    publishedAt: '2026-02-14',
    updatedAt: '2026-04-22',
    readingTime: '6 min read',
    readingTimeMinutes: 6,
    author: 'KDP Preflight Editorial',
    relatedTools: ['checker', 'preview', 'trimCalculator'],
    relatedPosts: ['kdp-bleed-guide', 'kdp-cover-size-guide', 'kdp-spine-width-guide'],
    relatedGuides: [
      { label: 'KDP Safe Area Guide', href: '/kdp-safe-area-guide' },
      { label: 'KDP Cover Validator', href: '/kdp-cover-validator' },
    ],
    faqs: [
      {
        question: 'What is the KDP safe area?',
        answer:
          'The safe area is the zone inside the trim line where important text, logos, and key artwork should stay to avoid being cut off.',
      },
      {
        question: 'Can backgrounds go outside the safe area?',
        answer:
          'Yes. Backgrounds and decorative artwork should often extend through the trim and into the bleed area, while important content stays inside the safe area.',
      },
    ],
    summary: [
      'Important content should stay inside the safe area.',
      'Decorative edge artwork should extend into bleed.',
      'Back covers need a clear barcode area.',
    ],
    keywords: ['KDP safe area guide', 'KDP safe zone', 'KDP barcode area', 'cover text too close to edge'],
    content: `
## Safe area vs bleed

Bleed is for artwork that reaches the edge. Safe area is for content that must not be cut. They solve opposite problems, and a print-ready KDP cover needs both.

## Cover safe area

Keep titles, subtitles, author names, logos, and important character faces at least 0.25 inch inside the trim edge. This protects the design from small trimming shifts in production.

## Barcode area

KDP can place a barcode on the lower-right back cover. Leave a clean rectangle in that area unless you are supplying your own accepted barcode workflow.

Do not place blurbs, logos, ISBN text, or decorative details where the barcode may land.

## Spine safe area

Spine text should stay inside the spine boundaries with extra breathing room on both sides. If the spine is thin, remove spine text rather than forcing unreadable type into a risky area.

## Interior safe area

Interior pages need enough margin for readability and binding. The gutter usually needs more room as page count increases.

## How to check placement

Use the [KDP cover checker](/checker) to review trim, bleed, safe area, and spine boundaries together. Then use the [3D preview](/preview) to inspect how the book feels in context.
`,
  },
  {
    slug: 'kdp-upload-error-fixes',
    title: 'KDP Upload Error Fixes: Cover Rejections and PDF Problems',
    description:
      'Decode common Amazon KDP upload errors for covers and PDFs, including wrong dimensions, missing bleed, spine mismatch, low image resolution, and unsafe text placement.',
    excerpt:
      'A troubleshooting guide for the KDP errors that stop paperback and hardcover uploads right before publishing.',
    category: 'Publishing Errors',
    tags: ['KDP upload errors', 'cover rejected', 'PDF problems', 'print preview'],
    publishedAt: '2026-03-01',
    updatedAt: '2026-04-22',
    readingTime: '9 min read',
    readingTimeMinutes: 9,
    author: 'KDP Preflight Editorial',
    relatedTools: ['checker', 'bleedChecker', 'spineCalculator', 'preview'],
    relatedPosts: ['kdp-bleed-guide', 'kdp-cover-size-guide', 'kdp-safe-area-guide'],
    relatedGuides: [
      { label: 'KDP Cover Validator', href: '/kdp-cover-validator' },
      { label: 'KDP Glossary', href: '/kdp-glossary' },
    ],
    faqs: [
      {
        question: 'Why does Amazon KDP reject my cover dimensions?',
        answer:
          'The most common reasons are missing bleed, wrong spine width, wrong trim size, or uploading a front cover instead of a full cover wrap.',
      },
      {
        question: 'How do I find the exact KDP upload problem?',
        answer:
          'Check the exported PDF dimensions, spine width, bleed, and safe area against the book settings you selected in KDP.',
      },
    ],
    summary: [
      'Most KDP upload errors are caused by measurable PDF problems.',
      'Wrong dimensions often point to bleed, trim, or spine mistakes.',
      'A preflight check catches issues before Amazon review.',
    ],
    keywords: ['KDP upload errors', 'Amazon KDP cover rejected', 'KDP PDF problems', 'KDP cover dimension error'],
    content: `
## Why KDP upload errors feel vague

KDP error messages often describe the symptom, not the source. A dimension error could mean wrong trim size, missing bleed, wrong spine width, or a front-cover-only upload.

## Wrong cover dimensions

Check whether your PDF is a full wrap. A paperback cover must include back cover, spine, front cover, and bleed in one PDF.

If the width is slightly off, recalculate the spine using the final page count and paper type. If the height is 0.25 inch too short, bleed is probably missing.

## Missing bleed

A missing bleed error usually means the PDF exported at trim size. Add or enable 0.125 inch bleed and extend edge artwork beyond the trim line.

## Spine mismatch

Spine mismatch happens when the cover was designed for an old page count. Recalculate after manuscript edits, paper type changes, or formatting changes.

## Low image resolution

KDP print covers should use high-resolution artwork at final print size. Avoid screenshots, heavily compressed JPEGs, and images scaled beyond their native resolution.

## Content too close to the trim

Move text, logos, subtitles, and barcode-sensitive content inward. Keep decorative backgrounds in bleed, but keep meaningful content in the safe area.

## Fast troubleshooting workflow

1. Confirm trim size and paper type in KDP.
2. Confirm final manuscript page count.
3. Recalculate spine width and full cover dimensions.
4. Export with bleed enabled.
5. Run the final PDF through the [KDP cover checker](/checker).
6. Review the result in the [KDP 3D preview](/preview).
`,
  },
];
