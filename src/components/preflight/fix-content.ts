import type { KRIssueType } from './types'

export type FixTool = 'canva' | 'indesign' | 'affinity' | 'word' | 'photoshop' | 'other'

export const FIX_TOOL_LABELS: Record<FixTool, string> = {
  canva:     'Canva',
  indesign:  'Adobe InDesign',
  affinity:  'Affinity Publisher',
  word:      'Word / PowerPoint',
  photoshop: 'Photoshop / Illustrator',
  other:     'Other tools',
}

export interface ToolGuide {
  steps: string[]
  exportSettings?: string
  note?: string
}

export interface IssueFixContent {
  summary: string
  guides: Partial<Record<FixTool, ToolGuide>>
}

export const FIX_CONTENT: Partial<Record<KRIssueType, IssueFixContent>> = {

  'bleed-missing': {
    summary: 'Re-export your file with 0.125" (3mm) bleed added on all four sides.',
    guides: {
      canva: {
        steps: [
          'Open your design in Canva.',
          'Go to File → Settings.',
          'Enable "Show print bleed" — bleed guides appear at the edges.',
          'Extend all backgrounds, images, and colored areas to the bleed guide.',
          'Make sure no important text or faces are near the edges.',
          'Click Share → Download → select PDF Print.',
          'Check "Crop marks and bleed" before downloading.',
        ],
        exportSettings: 'PDF Print format · Crop marks and bleed enabled',
        note: 'Canva adds approximately 0.118" bleed. KDP usually accepts this slight variance.',
      },
      indesign: {
        steps: [
          'Open Document Setup (File → Document Setup or Cmd/Ctrl+Alt+P).',
          'In the Bleed and Slug section, set all four sides to 0.125 in.',
          'Click OK.',
          'Extend all backgrounds and edge elements into the bleed area.',
          'Go to File → Export → Adobe PDF (Print).',
          'In the Marks and Bleeds tab, check "Use Document Bleed Settings".',
          'Export and verify the file size is correct before uploading.',
        ],
        exportSettings: 'Adobe PDF (Print) · Marks and Bleeds → Use Document Bleed Settings',
      },
      affinity: {
        steps: [
          'Go to File → Document Setup.',
          'Click the Bleed tab and set all sides to 0.125 in.',
          'Click OK.',
          'Extend backgrounds and edge elements to the bleed border (shown in red).',
          'Go to File → Export → PDF.',
          'In export settings, enable "Include bleed".',
          'Click Export.',
        ],
        exportSettings: 'PDF export · Include bleed enabled',
      },
      word: {
        steps: [
          'Microsoft Word and PowerPoint do not support print bleed.',
          'If your book has full-bleed images or colored backgrounds, recreate it in Canva, InDesign, or Affinity Publisher.',
          'If your book is text-only with white margins, bleed is not required and you can ignore this issue.',
          'To convert: export your Word file as PDF, then open in Affinity Publisher to add bleed.',
        ],
        note: 'Word is designed for office documents, not print-ready book files. For best results, use a dedicated design tool.',
      },
      photoshop: {
        steps: [
          'In Photoshop, go to Image → Canvas Size.',
          'Add 0.25" to both Width and Height (bleed on each side × 2).',
          'Position the anchor in the center so bleed is added equally.',
          'Extend all background layers to fill the new canvas.',
          'Save as PDF via File → Save As → Photoshop PDF.',
          'In PDF settings, ensure "Preserve Photoshop Editing Capabilities" is unchecked for smaller files.',
        ],
        note: 'For multi-page books, Illustrator or InDesign is better suited than Photoshop.',
      },
      other: {
        steps: [
          'Look for a "bleed" setting in your document or page setup.',
          'Set bleed to 3mm or 0.125 inches on all sides.',
          'Extend backgrounds, colors, and images to fill the bleed area.',
          'When exporting to PDF, enable "Include bleed" or "Marks and Bleeds".',
          'Verify: the exported PDF should be 0.25" wider and 0.25" taller than your trim size.',
        ],
      },
    },
  },

  'size-mismatch': {
    summary: 'Your file dimensions do not match the selected KDP trim size. Re-export at the correct size.',
    guides: {
      canva: {
        steps: [
          'In Canva, open your design.',
          'Click on the design size button at the top (e.g., "6 × 9 in").',
          'Select "Resize" from the menu.',
          'Enter your correct trim size in inches (e.g., 6" × 9").',
          'If your design uses bleed, add 0.25" to both width and height (e.g., 6.25" × 9.25").',
          'Review your design — resizing may shift elements.',
          'Re-export as PDF Print.',
        ],
        note: 'Always set the document size first, before designing. Resizing after the fact may require layout adjustments.',
      },
      indesign: {
        steps: [
          'Go to File → Document Setup.',
          'Set the page size to match your KDP trim size exactly.',
          'If using bleed, set it separately in the Bleed and Slug section.',
          'Review that text and images still fit properly.',
          'Re-export as PDF Print with correct bleed settings.',
        ],
        exportSettings: 'Page size must exactly match your trim size (without bleed). Bleed is added separately.',
      },
      affinity: {
        steps: [
          'Go to File → Document Setup.',
          'Change the page dimensions to match your trim size.',
          'Check bleed settings are correct (0.125 in if needed).',
          'Review your layout after resizing.',
          'Re-export as PDF with bleed included.',
        ],
      },
      word: {
        steps: [
          'Go to Layout → Size → More Paper Sizes.',
          'Enter your trim width and height in inches.',
          'Click OK.',
          'Review that text and images are still positioned correctly.',
          'Export as PDF (File → Export → Create PDF/XPS).',
        ],
        note: 'Word does not support bleed. For bleed-enabled exports, use Canva or InDesign instead.',
      },
      photoshop: {
        steps: [
          'Go to Image → Canvas Size or Image → Image Size.',
          'Set the resolution to 300 PPI and enter your trim size in inches.',
          'If adding bleed, add 0.25" to both width and height.',
          'Review all layers for position after resizing.',
          'Export via File → Save As → Photoshop PDF.',
        ],
      },
      other: {
        steps: [
          'Find the page or document size setting.',
          'Set it to exactly match your KDP trim size (e.g., 6" × 9").',
          'If using bleed, add 0.25" total: set page to 6.25" × 9.25".',
          'Re-export as PDF.',
          'Verify the exported file dimensions before re-uploading.',
        ],
      },
    },
  },

  'page-count-low': {
    summary: 'Your manuscript has fewer pages than KDP requires. Add more content pages.',
    guides: {
      canva: {
        steps: [
          'Open your Canva design.',
          'Add more pages using the "Add page" button.',
          'You can add blank pages or copyright/dedication/about-the-author pages.',
          'KDP requires at least 24 pages for paperback books.',
          'Re-export as PDF Print when your page count meets the minimum.',
        ],
      },
      indesign: {
        steps: [
          'Open the Pages panel (Window → Pages).',
          'Add pages by clicking the "Create new page" button.',
          'You can add blank pages or back matter (index, bibliography, etc.).',
          'Make sure the total page count meets KDP\'s minimum.',
          'Re-export when done.',
        ],
      },
      affinity: {
        steps: [
          'Open the Pages panel.',
          'Right-click and select "Insert Pages" to add blank pages.',
          'Add the necessary content to meet the minimum page count.',
          'Re-export as PDF.',
        ],
      },
      word: {
        steps: [
          'Place your cursor at the end of your document.',
          'Add content pages, a blank page, or a short afterword.',
          'Press Ctrl+Enter to insert page breaks for new pages.',
          'Re-export as PDF when the page count meets the KDP minimum.',
        ],
      },
      other: {
        steps: [
          'Open your document.',
          'Add extra pages until you reach the minimum required by KDP.',
          'Content options: blank page, copyright page, dedication, author bio.',
          'Re-export as PDF.',
        ],
      },
    },
  },

  'page-count-high': {
    summary: 'Your manuscript exceeds the KDP maximum page limit. Reduce the page count.',
    guides: {
      canva: {
        steps: [
          'Open your Canva design.',
          'Delete pages from the end of the document until you are within the limit.',
          'Consider splitting your book into two volumes.',
          'Re-export as PDF Print.',
        ],
        note: 'KDP paperback limit: 828 pages. KDP hardcover limit: 550 pages.',
      },
      indesign: {
        steps: [
          'Open the Pages panel.',
          'Delete excess pages from the end of your document.',
          'Consider creating a Volume 2 document for the remaining content.',
          'Re-export when within the limit.',
        ],
      },
      affinity: {
        steps: [
          'Open the Pages panel.',
          'Right-click and delete pages until within the KDP limit.',
          'Save the deleted pages as a separate document for a second volume.',
          'Re-export as PDF.',
        ],
      },
      word: {
        steps: [
          'Remove content from the end of the document.',
          'Consider splitting into two Word documents (Volume 1, Volume 2).',
          'Re-export as PDF.',
        ],
      },
      other: {
        steps: [
          'Reduce your page count to within KDP\'s maximum.',
          'Paperback maximum: 828 pages.',
          'Hardcover maximum: 550 pages.',
          'Consider splitting into multiple volumes if needed.',
        ],
      },
    },
  },

  'inconsistent-pages': {
    summary: 'Some pages have different dimensions. Make sure all pages use the same size before exporting.',
    guides: {
      canva: {
        steps: [
          'Open your Canva design.',
          'Click the three dots next to a page with a different size.',
          'Check the page dimensions in the right panel.',
          'If a page has the wrong size, delete and recreate it at the correct size.',
          'Canva designs should use a single consistent page size.',
          'Re-export as PDF Print.',
        ],
      },
      indesign: {
        steps: [
          'Go to Window → Pages to open the Pages panel.',
          'Click on each page and check the dimensions in the Properties panel.',
          'Select all pages with the wrong size.',
          'Right-click → Page Attributes → adjust to the correct size.',
          'Re-export as PDF Print.',
        ],
        note: 'InDesign supports mixed page sizes but KDP does not. All pages must match.',
      },
      affinity: {
        steps: [
          'Open the Pages panel.',
          'Click on each page and check its size in the Transform panel.',
          'For pages with a wrong size, right-click → Page Properties → set correct dimensions.',
          'Re-export as PDF.',
        ],
      },
      word: {
        steps: [
          'In Word, all pages should automatically use the same size.',
          'If some pages look different, check for manual page size overrides in Layout → Page Setup.',
          'Make sure all sections use the same page size.',
          'Re-export as PDF.',
        ],
      },
      other: {
        steps: [
          'Review your document for any pages with different dimensions.',
          'All interior pages must match the trim size exactly.',
          'Check for inserted pages from different documents or templates.',
          'Re-export as PDF after fixing all inconsistencies.',
        ],
      },
    },
  },

  'blank-pages': {
    summary: 'Your manuscript contains several unexpected blank pages. Review and confirm they are intentional.',
    guides: {
      canva: {
        steps: [
          'Scroll through your Canva design pages.',
          'If you see blank pages that are unintentional, click and delete them.',
          'Some blank pages may be intentional (chapter breaks, end of sections).',
          'Re-export as PDF Print when finished.',
        ],
      },
      indesign: {
        steps: [
          'Open the Pages panel and scroll through thumbnails.',
          'Identify blank pages that should not be blank.',
          'Click on blank pages and add content, or delete them.',
          'Re-export when done.',
        ],
      },
      affinity: {
        steps: [
          'Open the Pages panel and scroll through.',
          'Identify and remove unintentional blank pages.',
          'Re-export as PDF.',
        ],
      },
      word: {
        steps: [
          'Go to View → Draft to see all pages clearly.',
          'Look for extra blank pages created by extra paragraph marks.',
          'Enable formatting marks (Ctrl+Shift+8) to find and remove extra breaks.',
          'Re-export as PDF.',
        ],
      },
      other: {
        steps: [
          'Scroll through your document and identify blank pages.',
          'Blank pages at the end of chapters are normal.',
          'Remove unintentional blank pages that add nothing.',
          'Re-export as PDF.',
        ],
      },
    },
  },

  'pdf-too-large': {
    summary: 'Your file exceeds KDP\'s 650 MB limit. Compress images and reduce file size before uploading.',
    guides: {
      canva: {
        steps: [
          'In Canva, re-export as PDF Print at a lower image quality.',
          'Canva\'s "Compress file" option (if available) reduces size.',
          'Remove any high-resolution images you imported and replace with lower DPI versions.',
          'Download as PDF Print (not PDF Standard — Print is already optimized for KDP).',
        ],
        note: 'If your file is over 650 MB, it likely contains very large images. Consider replacing them with 300 DPI versions.',
      },
      indesign: {
        steps: [
          'Go to File → Export → PDF (Print).',
          'In the Compression tab, set Color/Grayscale to 300 PPI, Compression: JPEG, Quality: High.',
          'In the Advanced tab, enable Flattening.',
          'Check that "Subset Fonts Below" is at 100%.',
          'Re-export and check the file size.',
        ],
        exportSettings: 'PDF Print · Compression: JPEG High at 300 PPI · Flatten transparency',
      },
      affinity: {
        steps: [
          'Go to File → Export → PDF.',
          'Set rasterize to 300 DPI.',
          'Enable image compression (JPEG, High quality).',
          'Uncheck "Embed ICC profiles" if not required.',
          'Re-export and check the size.',
        ],
      },
      word: {
        steps: [
          'In Word, go to File → Options → Advanced.',
          'Under Image Size and Quality, check "Discard editing data" and "Compress images in file".',
          'Set default target output to 220 ppi.',
          'Re-export as PDF.',
        ],
      },
      photoshop: {
        steps: [
          'Go to Image → Image Size and reduce resolution to 300 PPI.',
          'For JPEG images, use File → Save As and reduce quality to 8-9/12.',
          'Flatten all layers (Layer → Flatten Image) before saving to PDF.',
          'Use File → Save As → Photoshop PDF, and in Options set Image Quality to 8.',
        ],
      },
      other: {
        steps: [
          'Use a PDF compression tool (such as Adobe Acrobat\'s "Reduce File Size").',
          'Reduce all embedded image resolutions to 300 DPI.',
          'Remove any embedded thumbnails or metadata.',
          'If still over 650 MB, consider splitting the book into two volumes.',
        ],
      },
    },
  },

  'oversized-file-risk': {
    summary: 'Your file is larger than recommended. Compress images to improve upload speed and reduce KDP processing time.',
    guides: {
      canva: {
        steps: [
          'Re-export from Canva as PDF Print.',
          'Remove any very large images and replace with 300 DPI versions.',
          'Check if Canva offers a "Compress file" option in your export settings.',
        ],
      },
      indesign: {
        steps: [
          'Export as PDF Print with JPEG compression at 300 PPI.',
          'In the Advanced tab, enable Flatten Transparency.',
          'Remove unnecessary embedded data in the Output tab.',
        ],
        exportSettings: 'PDF Print · JPEG High at 300 PPI',
      },
      affinity: {
        steps: [
          'Export as PDF with rasterize at 300 DPI.',
          'Use JPEG High compression.',
          'Re-export and check the file size.',
        ],
      },
      word: {
        steps: [
          'Go to File → Options → Advanced → Image Size and Quality.',
          'Check "Compress images in file" and set target to 220 ppi.',
          'Re-export as PDF.',
        ],
      },
      photoshop: {
        steps: [
          'Reduce image resolution to 300 PPI (Image → Image Size).',
          'Flatten all layers before saving.',
          'Save as PDF with JPEG quality 8-9.',
        ],
      },
      other: {
        steps: [
          'Reduce image resolutions to 300 DPI throughout the document.',
          'Use JPEG compression when exporting.',
          'Remove any embedded high-resolution previews or metadata.',
        ],
      },
    },
  },

  'odd-even-pages': {
    summary: 'Print books work best with an even number of pages. Add one blank page to the end.',
    guides: {
      canva: {
        steps: [
          'Open your design in Canva.',
          'Click "Add page" at the very end to add one blank page.',
          'Leave the page blank or add a very subtle "End" or decorative element.',
          'Re-export as PDF Print.',
        ],
      },
      indesign: {
        steps: [
          'Open the Pages panel.',
          'Click the "Create new page" button to add one page at the end.',
          'Leave it blank or add a colophon.',
          'Re-export as PDF Print.',
        ],
      },
      affinity: {
        steps: [
          'Open the Pages panel.',
          'Right-click after the last page and select "Insert Pages".',
          'Add 1 blank page.',
          'Re-export as PDF.',
        ],
      },
      word: {
        steps: [
          'Place your cursor at the very end of the document.',
          'Press Ctrl+Enter to insert one new blank page.',
          'Re-export as PDF.',
        ],
      },
      other: {
        steps: [
          'Add one blank page to the very end of your document.',
          'This gives your book an even page count.',
          'Re-export as PDF.',
        ],
      },
    },
  },

  'spine-width-risk': {
    summary: 'Your book\'s spine is narrow. Adjust your cover design to account for limited spine space.',
    guides: {
      canva: {
        steps: [
          'Open the KDP Cover Calculator at kdp.amazon.com to get your exact spine width.',
          'Enter your page count, paper type, and trim size.',
          'Note the spine width in inches.',
          'In Canva, open your cover spread design.',
          'Resize the spine text to fit — or remove it if the spine is under 0.13".',
          'Keep text centered on the spine and at least 0.0625" away from fold lines.',
          'Re-export as PDF Print.',
        ],
        note: 'KDP\'s cover calculator gives the most accurate spine measurement. Use it before finalizing your cover.',
      },
      indesign: {
        steps: [
          'Get your exact spine width from KDP\'s cover calculator.',
          'In InDesign, adjust your cover template to match the exact spine width.',
          'Resize or remove spine text to fit.',
          'For very thin spines (under 0.25"), leave the spine blank.',
          'Re-export as PDF Print.',
        ],
      },
      affinity: {
        steps: [
          'Get your exact spine width from KDP\'s cover calculator.',
          'In Affinity Publisher, adjust the spine zone in your cover spread.',
          'Remove or scale down spine text if the spine is under 0.25".',
          'Re-export as PDF.',
        ],
      },
      photoshop: {
        steps: [
          'Get your exact spine width from KDP\'s cover calculator.',
          'Adjust your cover file canvas to match the exact full-cover dimensions (front + spine + back).',
          'Scale or remove spine text to fit within the spine area.',
          'Save as PDF or flatten and save as high-resolution JPEG (300 DPI).',
        ],
      },
      other: {
        steps: [
          'Visit KDP\'s cover calculator to find your exact spine width.',
          'Adjust your cover design to use the correct spine area.',
          'For spines under 0.13", leave the spine blank.',
          'For spines between 0.13" and 0.5", use small, bold fonts only.',
          'Re-export as PDF.',
        ],
      },
    },
  },

  'color-in-bw-book': {
    summary: 'Color pages found in a Black & White book. Decide whether to convert to B&W or switch to Color interior.',
    guides: {
      canva: {
        steps: [
          'Decide: should this book be Black & White or Color?',
          'If B&W: open each flagged page in Canva.',
          'Select all elements on the page and use the color filter to desaturate.',
          'Or: download the page, convert to grayscale in an image editor, then re-upload.',
          'If Color: change your KDP interior setting to Standard Color or Premium Color.',
          'Re-export as PDF Print.',
        ],
        note: 'Converting to true grayscale in your design tool gives better results than letting KDP auto-convert.',
      },
      indesign: {
        steps: [
          'If converting to B&W: go to Edit → Edit Colors → Convert to Grayscale.',
          'This converts the document color space — review all pages after conversion.',
          'If switching to Color: update your KDP Manuscript settings to Standard Color or Premium Color.',
          'Re-export as PDF Print.',
        ],
        exportSettings: 'For B&W books: export as PDF with Grayscale color profile.',
      },
      affinity: {
        steps: [
          'If converting to B&W: go to File → Document Setup → Color Format → Grayscale.',
          'Review all pages after conversion.',
          'If switching to Color: keep RGB or CMYK and update your KDP settings to Color.',
          'Re-export as PDF.',
        ],
      },
      photoshop: {
        steps: [
          'Open each color page in Photoshop.',
          'Go to Image → Mode → Grayscale to convert.',
          'Adjust levels/curves to improve grayscale contrast.',
          'Save and re-embed in your document.',
          'Alternatively, change your KDP interior type to Color.',
        ],
      },
      word: {
        steps: [
          'For text documents, color may come from headings, tables, or images.',
          'Select all text and set the font color to black.',
          'For color images, right-click → Format Picture → Picture → Color → Grayscale.',
          'Or change your KDP interior setting to Standard Color.',
          'Re-export as PDF.',
        ],
      },
      other: {
        steps: [
          'Identify pages with color using the affected page list above.',
          'Choose: convert those pages to grayscale, or change your KDP interior type to Color.',
          'For grayscale conversion, use your design tool\'s color mode settings.',
          'Re-export as PDF after making changes.',
        ],
      },
    },
  },

  'bw-in-color-book': {
    summary: 'Most pages appear grayscale in a Color interior book. Consider switching to B&W to save on printing costs.',
    guides: {
      canva: {
        steps: [
          'Review your design — are most pages truly black and white?',
          'If yes, consider changing your KDP interior type to Black & White.',
          'B&W printing is significantly cheaper than Color, lowering your book\'s minimum price.',
          'If there are a few key color pages, consider whether Color is worth the extra cost.',
          'Update your KDP manuscript settings accordingly.',
        ],
        note: 'Black & White printing on KDP costs approximately $0.012/page vs $0.07/page for Color.',
      },
      indesign: {
        steps: [
          'Review your document — if most pages are text or grayscale art, switch to B&W.',
          'Go to your KDP bookshelf and update the interior type to Black & White.',
          'For the few color pages, either convert them to grayscale or keep Color interior.',
          'Re-export as PDF if you change the color mode.',
        ],
      },
      affinity: {
        steps: [
          'Review pages for meaningful color content.',
          'If mostly grayscale, update your KDP interior setting to Black & White.',
          'Optionally convert the document to Grayscale in File → Document Setup.',
          'Re-export as PDF.',
        ],
      },
      other: {
        steps: [
          'Count how many pages have meaningful color content.',
          'If most pages are grayscale or text-only, switching to B&W interior saves money.',
          'Update your KDP interior type in your book\'s manuscript settings.',
          'Re-export your PDF if you change the document color mode.',
        ],
      },
    },
  },

  'dark-background-risk': {
    summary: 'Pages with dark backgrounds may look uneven in print. Request a proof copy to check before publishing.',
    guides: {
      canva: {
        steps: [
          'Open each dark page in Canva.',
          'For covers or full-page dark backgrounds, check that the background color is not pure black (0,0,0).',
          'Use a very dark gray (e.g., #0a0a0a) or a rich black if your design tool supports CMYK.',
          'For interiors, avoid full-page dark backgrounds — they consume a lot of ink and may print unevenly.',
          'Order a physical proof copy from KDP before publishing to check the print result.',
        ],
        note: 'Physical proof copies are the best way to verify dark backgrounds before you publish.',
      },
      indesign: {
        steps: [
          'For dark covers, use rich black (C:63, M:52, Y:51, K:100) instead of pure K:100.',
          'Avoid using pure RGB black (0,0,0) for large areas — it can appear inconsistent in print.',
          'For dark interior pages, consider reducing the background opacity slightly.',
          'Re-export as PDF Print.',
          'Order a proof copy to verify the print result before publishing.',
        ],
        exportSettings: 'Use CMYK color profile for print; rich black for large dark areas.',
      },
      affinity: {
        steps: [
          'Switch to CMYK color mode in File → Document Setup if not already set.',
          'For dark backgrounds, use rich black (C:63, M:52, Y:51, K:100).',
          'Avoid pure K:100 for large background areas.',
          'Re-export as PDF.',
          'Order a proof copy to confirm the print result.',
        ],
      },
      photoshop: {
        steps: [
          'Convert to CMYK (Image → Mode → CMYK Color).',
          'For large dark areas, use rich black values: C:63, M:52, Y:51, K:100.',
          'Avoid pure R:0, G:0, B:0 black for large printed areas.',
          'Save and re-export.',
          'Order a proof copy to verify.',
        ],
      },
      other: {
        steps: [
          'Avoid pure black (RGB 0,0,0 or K:100 only) for large dark areas.',
          'Use rich black for print: CMYK C:63, M:52, Y:51, K:100.',
          'For dark interiors, test with a physical proof before publishing.',
          'KDP offers proof copies before you publish — always order one for dark designs.',
        ],
      },
    },
  },

  'blurry-page-risk': {
    summary: 'Some pages may print soft because they appear to use low-resolution or heavily compressed raster content.',
    guides: {
      canva: {
        steps: [
          'Open the affected pages in Canva.',
          'Replace screenshots or low-resolution uploads with the original high-resolution images.',
          'Avoid enlarging images beyond their original size.',
          'Download as PDF Print rather than JPG or PNG.',
          'Re-upload the fresh PDF and check the preview again.',
        ],
        exportSettings: 'PDF Print · use original high-resolution assets',
      },
      indesign: {
        steps: [
          'Open the Links panel and check Effective PPI for images on the affected pages.',
          'Replace images below 300 PPI with higher-resolution originals.',
          'Avoid reusing flattened screenshot pages.',
          'Export with Press Quality or PDF/X settings.',
        ],
        exportSettings: 'Press Quality or PDF/X · images at 300 PPI effective resolution',
      },
      affinity: {
        steps: [
          'Open Resource Manager and inspect placed image DPI.',
          'Replace low-DPI images with higher-resolution originals.',
          'Avoid scaling raster text or screenshots upward.',
          'Export as PDF for print with raster downsampling no lower than 300 DPI.',
        ],
      },
      word: {
        steps: [
          'Avoid inserting screenshots of text pages.',
          'Use live text where possible instead of flattened images.',
          'Turn off aggressive image compression in document options.',
          'Export directly to PDF instead of printing to PDF through a screenshot workflow.',
        ],
      },
      other: {
        steps: [
          'Use original source files rather than screenshots.',
          'Keep print images at roughly 300 DPI at final size.',
          'Avoid repeated JPEG export and re-import cycles.',
          'Export directly from the design app to PDF.',
        ],
      },
    },
  },

  'cover-size-mismatch': {
    summary: 'Your cover PDF does not match the required full-spread size for your trim and page count. Download the KDP Cover Calculator template and re-export at the exact dimensions shown.',
    guides: {
      other: {
        steps: [
          'Go to kdp.amazon.com and use the Cover Calculator to get the exact dimensions.',
          'Resize your cover canvas to match the required full-spread width and height.',
          'Export as a high-resolution PDF.',
        ],
      },
    },
  },

  'cover-bleed-missing': {
    summary: 'Your cover PDF does not include 0.125" bleed on all sides. Extend background artwork to the bleed edge and re-export.',
    guides: {
      canva: {
        steps: [
          'In your cover design, go to File → Page Setup.',
          'Increase the canvas size by 0.25" on each dimension.',
          'Download → PDF Print → check "Include bleed and crop marks".',
        ],
      },
      indesign: {
        steps: [
          'File → Export → Adobe PDF (Print).',
          'In the Marks and Bleeds section, set bleed to 0.125" on all sides.',
          'Export the file.',
        ],
      },
      other: {
        steps: [
          'Extend background elements 0.125" beyond the trim edge on all sides.',
          'Re-export at the full spread size including bleed.',
        ],
      },
    },
  },

  'spine-text-risk': {
    summary: 'The spine is very narrow. Keep spine text minimal, centered, and in a large bold font. Consider leaving the spine blank for thin books.',
    guides: {
      other: {
        steps: [
          'Use a minimum 7pt font on the spine.',
          'Keep all spine text at least 0.0625" from the spine edge.',
          'Use the KDP Cover Calculator to verify exact spine width.',
        ],
      },
    },
  },

  'cover-barcode-conflict': {
    summary: 'Content may overlap the KDP barcode area on the back cover. KDP places a barcode in the lower-right corner of the back cover. Keep that area clear.',
    guides: {
      other: {
        steps: [
          'Leave a 2" × 1.2" area in the lower-right of the back cover free of important content.',
          'KDP will automatically overlay the barcode in that region.',
        ],
      },
    },
  },

  'cover-low-quality': {
    summary: 'Your cover appears to contain low-resolution or heavily compressed artwork. KDP recommends a minimum of 300 DPI for all cover images.',
    guides: {
      other: {
        steps: [
          'Replace raster images with the highest-resolution originals available.',
          'Export your cover directly from the design tool at 300 DPI or higher.',
          'Avoid using screenshots or images saved as JPEG multiple times.',
          'Vector elements (text, shapes) do not lose quality — focus on raster photos and artwork.',
        ],
      },
    },
  },

}
