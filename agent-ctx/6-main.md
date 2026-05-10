# Task 6: Enhance Validator Engine

## Summary
Enhanced the `analyzePagesForIssues` function in `/home/z/my-project/src/engine/validator.ts` to produce richer, more detailed `PageIssueExtended` issues, and added `computeValidationSummary` function.

## Changes Made

### 1. `/home/z/my-project/src/types/kdp.ts`
- `PageIssueExtended`: Made `category`, `actual`, `expected`, `suggestion` required fields; `category` uses `IssueCategory` type
- `ValidationSummary`: Replaced `totalChecks` with `total`, added `byCategory: Record<IssueCategory, number>` and `isReady: boolean`

### 2. `/home/z/my-project/src/engine/validator.ts`
- `analyzePagesForIssues()` now returns `PageIssueExtended[]` with 7 enhanced issue types:
  1. Page size mismatch (category: 'size', region: full page)
  2. Blank page detection (category: 'interior', front-matter aware)
  3. Low resolution images (category: 'dpi', region: estimated image area)
  4. Bleed issues (category: 'bleed', missing vs present variants)
  5. Margin safety (category: 'margin', region: inner safe area)
  6. Gutter tightness (category: 'gutter', region: gutter strip)
  7. Trim danger (category: 'margin', region: inner safe area)
- Added `computeValidationSummary()` — aggregates by severity and category, overall status, isReady flag
- All existing functions preserved

### 3. `/home/z/my-project/src/store/use-app-store.ts`
- Updated `validationSummary` default to new shape with `byCategory` and `isReady`

### 4. `/home/z/my-project/src/components/checker/ImportStep.tsx`
- Added `PageIssueExtended`, `computeValidationSummary` imports
- Added `setPageIssuesExtended` to store accessors
- Updated `analyzePagesForIssues` call to use `PageIssueExtended[]` type
- Added `setPageIssuesExtended(pageIssues)` call

## Verification
- Lint: 0 errors, 0 warnings
- Dev server: compiles successfully, responds 200
