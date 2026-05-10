# Task 3 — PreviewStep.tsx Complete UX Refactor

## Summary
Completely rewrote `/home/z/my-project/src/components/checker/PreviewStep.tsx` with a comprehensive UX refactor from a 2-panel layout to a 3-panel design with many new features.

## What Changed

### Layout: 3-Panel Design
- **LEFT SIDEBAR (~18%)**: `ThumbnailSidebar` — vertical scrollable thumbnail navigation
- **CENTER WORKSPACE (~57%)**: Large preview canvas with zoom/pan
- **RIGHT PANEL (~25%)**: Validation + issue panel with beginner-friendly cards

### New Components Created
1. **ThumbnailSidebar** — Left sidebar with vertical thumbnail navigation, collapsible
2. **FriendlyIssueCard** — Beginner-friendly issue card with Problem/Why/Fix structure
3. **SessionRestoreDialog** — Modal asking to restore previous session
4. **OnboardingHint** — Lightweight dismissible hint bubble
5. **SaveStatusIndicator** — Small save status display in toolbar
6. **Overlay Focus Mode** — Integrated into PageOverlay: dims non-highlighted areas when issue selected

### Key UX Changes
- Mode Switcher moved to TOP CENTER with large 44px touch targets and icons + labels
- Issue cards use beginner-friendly Problem / Why It Matters / Recommended Fix structure
- Beginner-friendly filter tabs: [ All ] [ Important ] [ Needs Fix ] [ Safe ]
- Issues grouped by category (Cover, Layout, Bleed, DPI, Margins, Gutter, Fonts, Interior)
- Auto-save to IndexedDB every 5 seconds (debounced) after major actions
- Session restore dialog on mount when saved workspace found
- Onboarding hints for first-time users (4 hints: sidebar, mode switcher, canvas zoom, issue click)
- Overlay focus mode dims non-highlighted page areas when issue selected

### Preserved Business Logic (Identical)
- `buildBookSequence()` function
- `computeSpreads()` function
- `PageOverlay` component (SVG overlays)
- `PageRenderer` component
- Zoom/pan physics (damped interpolation, cursor-centered zoom)
- `FitDropdown`, `JumpToPageModal`, `ProcessingState` components
- All keyboard shortcuts
- All mouse wheel zoom + pan/drag handling
- `allowedOverlaysForBookType()`, `OVERLAY_CONFIG`, all constants
- Helper functions (`getWorstSeverity`, `IssueDot`, `SingleThumb`, `SummaryItem`)

## Verification
- `bun run lint` — passes cleanly
- Dev server compiles successfully
- Page returns HTTP 200
