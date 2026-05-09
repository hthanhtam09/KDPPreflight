# Task 4: ConfigStep Component

## Summary
Created `/home/z/my-project/src/components/checker/ConfigStep.tsx` - the Step 2 (Config) component for the KDPPreflight 3-step checker workflow.

## What was built
- **ConfigStep component** - Format-aware configuration panel with live SVG book template visualization
- **Three format-specific config sections**:
  - **KindleConfig**: Layout type (reflowable/fixed), embedded fonts, image scaling, TOC
  - **PaperbackConfig**: Trim size, bleed, spine width (auto-calc), paper type, page count, margin safety, interior type
  - **HardcoverConfig**: All paperback settings + hinge width, wrap area, case laminate, dust jacket, spine adjustments
- **Live SVG Visualization**:
  - `CoverTemplateSVG` - Full cover template (back + spine + front) with trim, bleed, safe zone, barcode, hinge, wrap areas
  - `KindleSVG` - Simplified Kindle device preview with safe zone overlay
- **Reusable sub-components**:
  - `ConfigCard` - Glass morphism card with icon, label, value, help text, interactive controls
  - `ToggleControl` - Switch-based toggle with labels
  - `SegmentedSelector` - Segmented control for multi-option selection
- **Navigation**: Back (→ Import) and Run Checks (→ Preview) buttons

## Key design decisions
- Used `DetectedMetadata | null` type directly instead of `ReturnType<typeof useAppStore>` for cleaner typing
- Fixed `barcodeAreaIn` property name (matching the CalculatedMeasurements interface)
- Used JSX expression syntax for props containing double quotes to avoid JSX parsing issues
- All measurements update in real-time via store's `updateBookConfig` → `calculateMeasurements`
- SVG uses smooth CSS transitions for dimension changes when config changes
- Format-specific config cards animate in/out with AnimatePresence

## Integration
- Uses `useAppStore` for: `kdpFormat`, `bookConfig`, `updateBookConfig`, `measurements`, `detectedMetadata`, `setCheckerStep`
- Imports constants from `@/engine/kdp-constants`: `TRIM_SIZES`, `WRAP_AROUND_IN`, `SAFE_AREA_IN`, `BARCODE_AREA`
- Imports types from `@/types/kdp`: `BookConfig`, `TrimSizeKey`, `CalculatedMeasurements`, `KDPFormat`, `PaperType`, `InteriorType`, `DetectedMetadata`
- Uses shadcn/ui components: `Switch`, `Select`, `Input`

## Verification
- ESLint: Passing (no errors)
- TypeScript: No type errors in ConfigStep.tsx
- Dev server: Running on port 3000, returning 200
