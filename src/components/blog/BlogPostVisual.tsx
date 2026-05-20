import type { ComponentType } from 'react';
import type { BlogCategory } from '@/lib/blog-categories';
import {
  BackgroundBleedVisual,
  BarcodeAreaVisual,
  BleedVsNoBleedVisual,
  BlurryCoverVisual,
  CheapProofCopyVisual,
  CanvaToKdpExportVisual,
  ColoringBookBleedDecisionVisual,
  ColorShiftVisual,
  CoverInteriorMismatchSharpOverlay,
  CoverInteriorMismatchVisual,
  CroppedCoverVisual,
  DarkColoringBookVisual,
  FileMismatchVisual,
  ForgotBleedVisual,
  GenericCoverVisual,
  KdpBordersPrintUnevenlyVisual,
  KdpSpineWidthWrongVisual,
  LowContentBookVisual,
  PreviewerFrozenVisual,
  SafeAreaCheckerVisual,
  SafeAreaFixVisual,
  SafeMarginCoverVisual,
  ScreenPrintMismatchVisual,
  SlowUploadVisual,
  SpineTextOffCenterVisual,
  TemplateMismatchVisual,
  WhiteLinesVisual,
  type BlogVisualProps,
} from './blog-post-visuals';

export type BlogPostVisualProps = {
  postSlug: string;
  category: BlogCategory;
  variant?: 'card' | 'featured' | 'article';
};

const sharedVisualBySlug: Record<string, string> = {
  'fix-low-resolution-images-kdp': 'why-your-kdp-cover-looks-blurry-after-upload',
};

const visualBySlug: Record<string, ComponentType<BlogVisualProps>> = {
  'kdp-cover-uploaded-successfully-but-looks-cropped': CroppedCoverVisual,
  'fix-barcode-area-contains-text-kdp': BarcodeAreaVisual,
  'why-your-kdp-cover-looks-blurry-after-upload': BlurryCoverVisual,
  'kdp-cover-colors-look-different-after-printing': ColorShiftVisual,
  'kdp-pdf-looks-fine-on-screen-but-prints-wrong': ScreenPrintMismatchVisual,
  'canva-to-kdp-export-settings': CanvaToKdpExportVisual,
  'what-is-a-low-content-book-on-kdp': LowContentBookVisual,
  'why-my-kdp-proof-copy-looks-cheap': CheapProofCopyVisual,
  'kdp-coloring-book-prints-too-dark': DarkColoringBookVisual,
  'fix-kdp-spine-text-off-center': SpineTextOffCenterVisual,
  'kdp-spine-width-wrong': KdpSpineWidthWrongVisual,
  'interior-and-cover-file-dont-match-kdp': FileMismatchVisual,
  'kdp-cover-dimensions-not-matching-template': TemplateMismatchVisual,
  'what-happens-if-you-forget-bleed-on-kdp': ForgotBleedVisual,
  'kdp-bleed-vs-no-bleed': BleedVsNoBleedVisual,
  'kdp-bleed-vs-no-bleed-coloring-books': ColoringBookBleedDecisionVisual,
  'kdp-safe-area-explained': SafeMarginCoverVisual,
  'how-far-should-text-be-from-edge-kdp-cover': SafeMarginCoverVisual,
  'how-to-check-safe-area-before-exporting-kdp-cover': SafeAreaCheckerVisual,
  'why-background-colors-must-extend-past-trim-size': BackgroundBleedVisual,
  'fix-text-outside-safe-area-kdp': SafeAreaFixVisual,
  'kdp-pdf-upload-takes-forever': SlowUploadVisual,
  'kdp-previewer-not-loading': PreviewerFrozenVisual,
  'white-lines-on-kdp-cover': WhiteLinesVisual,
  'kdp-borders-print-unevenly': KdpBordersPrintUnevenlyVisual,
};

export function BlogPostVisual({ postSlug, variant = 'card' }: BlogPostVisualProps) {
  const isCard = variant === 'card';
  const isArticle = variant === 'article';
  const isFeatured = variant === 'featured';
  const visualSlug = sharedVisualBySlug[postSlug] ?? postSlug;
  const Visual = visualBySlug[visualSlug];
  const filterId = `sketch-${postSlug}-${variant}`;

  return (
    <div
      aria-hidden="true"
      className={`relative h-full min-h-full overflow-hidden bg-muted/25 ${
        isArticle ? 'aspect-[16/9] rounded-2xl border border-border shadow-card' : ''
      }`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_12%,color-mix(in_srgb,var(--primary)_18%,transparent),transparent_34%),linear-gradient(90deg,color-mix(in_srgb,var(--foreground)_6%,transparent)_1px,transparent_1px),linear-gradient(0deg,color-mix(in_srgb,var(--foreground)_5%,transparent)_1px,transparent_1px)] bg-[length:auto,28px_28px,28px_28px]" />
      <svg viewBox="0 0 800 450" className="relative h-full w-full">
        <defs>
          <filter id={filterId} x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="1" seed="12" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale={isFeatured || isArticle ? '1.6' : '1'} />
          </filter>
        </defs>
        <rect width="800" height="450" fill="transparent" />
        {Visual ? (
          <Visual compact={isCard} />
        ) : (
          <g filter={`url(#${filterId})`}>
            {visualSlug === 'kdp-cover-size-does-not-match-interior' ? (
              <CoverInteriorMismatchVisual compact={isCard} />
            ) : (
              <GenericCoverVisual />
            )}
          </g>
        )}
        {visualSlug === 'kdp-cover-size-does-not-match-interior' && <CoverInteriorMismatchSharpOverlay compact={isCard} />}
      </svg>
    </div>
  );
}
