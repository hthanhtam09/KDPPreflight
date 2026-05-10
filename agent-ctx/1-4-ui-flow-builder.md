# Task 1-4: UI Flow Builder

## Task
Build ImportStep, ConfigStep, GenerateStep, and PreviewFeature components for the new 4-step 3D preview flow.

## Files Created
- `/home/z/my-project/src/components/preview/ImportStep.tsx` - Step 1: File upload with auto-detection
- `/home/z/my-project/src/components/preview/ConfigStep.tsx` - Step 2: Book configuration with live measurements
- `/home/z/my-project/src/components/preview/GenerateStep.tsx` - Step 3: Progressive generation UI

## Files Updated
- `/home/z/my-project/src/components/preview/PreviewFeature.tsx` - Complete rewrite as 4-step orchestrator

## Key Decisions
1. **Cover segments**: GenerateStep produces cover segments via `sliceCoverTextures` and passes them back to PreviewFeature via `onCoverSegments` callback prop, avoiding the need for useEffect-with-setState pattern
2. **State derivation**: `coverUrl` is derived via `useMemo` from `coverDataUrl || uploadedCover?.dataUrl` instead of syncing via effect
3. **BookType sync**: `effectivePreviewState` is derived via `useMemo` merging `previewState` with `bookConfig.bookType`, avoiding effect-based sync
4. **Step navigation**: Users can navigate back to any previous step but cannot skip ahead
5. **Step indicator**: Hidden during 3D preview for full-screen viewport experience

## Dependencies
- Uses `loadPDF`, `loadImage` from `@/engine/pdf-processor` for file processing
- Uses `sliceCoverTextures` from `@/engine/cover-parser` for cover segmentation
- Uses `TRIM_SIZES`, `calculateMeasurements`, `DEFAULT_BOOK_CONFIG` from `@/engine/kdp-constants`
- Uses `Preview3DState`, `Preview3DActions` types from `BookPreview3D.tsx`
- Uses shadcn/ui components: Button, Badge, Input, Label, Select, Card, Progress

## Lint Status
All lint checks pass with no errors.
