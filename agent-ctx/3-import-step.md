# Task 3: ImportStep Component

## Summary
Created `/home/z/my-project/src/components/checker/ImportStep.tsx` — the Step 1 component for the KDP Preflight checker workflow (Import → Config → Preview).

## What was built

### Format Selector
- Pill-style segmented control at top with animated layoutId spring transition
- Three options: Kindle (Tablet icon), Paperback (BookOpen icon), Hardcover (Book icon)
- Active state uses `bg-white/[0.06]` with subtle glow shadow
- Switching formats resets detection state and changes upload zone layout

### Upload Zones
- **Kindle mode**: Single centered upload zone accepting `.epub,.pdf`
- **Paperback/Hardcover mode**: Two side-by-side zones (manuscript + cover), stacked on mobile
- Each zone is min-h-[200px] with premium cinematic styling
- Dashed border with subtle pulse animation when empty
- Hover glow effect and gentle float animation on the upload icon
- Drag-over state with emerald glow ring
- Processing state shows rotating ScanLine icon
- Success state shows CheckCircle2 with spring animation + file name
- Click-to-replace after upload

### Auto-Detection (Animated)
- ScanSequence component with 5 messages appearing sequentially (~2.5s total)
- Each message: Loader2 spinner while active → CheckCircle2 checkmark when done
- Previous messages fade to lower opacity
- After sequence completes, triggers detection finalization

### Detection Logic
- Calls `loadPDF(file)` → `analyzePDF()` for PDF files
- Compares dimensions against `TRIM_SIZES` to detect probable trim size (including swapped orientation check)
- Detects bleed by checking if dimensions exceed closest trim by ~0.125"
- Calculates spine width from page count and white paper factor
- Determines portrait/landscape orientation
- Creates `DetectedMetadata` object and stores via `setDetectedMetadata`
- Also updates `bookConfig` with detected trim size, page count, bleed, binding

### Detection Summary Card
- Glass morphism card (`bg-white/[0.03]` + `border-white/[0.06]`)
- Grid display of 6 key properties: Trim Size, Page Count, Bleed, Orientation, Spine Width, DPI
- Each property in its own mini-card with label/value

### Continue Flow
- "Ready for configuration" message + "Continue to Config →" button appears when:
  - All required files for current format are uploaded
  - Detection is complete
- Button calls `setCheckerStep('config')` to advance workflow

### Styling
- Dark theme base (`bg-[#050508]` inherited from parent)
- Framer Motion for all animations (AnimatePresence, motion.div, layoutId)
- Lucide icons: Upload, FileText, BookOpen, Tablet, Book, Loader2, CheckCircle2, ArrowRight, ScanLine
- Glass morphism: `bg-white/[0.03] border border-white/[0.06]`
- Rounded-2xl cards
- Responsive: grid-cols-1 on mobile, grid-cols-2 on md+ for dual upload zones

## Store Integration
- Reads: `kdpFormat`, `uploadedCover`, `uploadedManuscript`
- Writes: `setKdpFormat`, `setUploadedCover`, `setUploadedManuscript`, `setDetectedMetadata`, `setCheckerStep`, `updateBookConfig`

## Verification
- ESLint passed with no errors
- No React.createElement used — JSX only
- Strict TypeScript typing throughout
- `'use client'` directive included
