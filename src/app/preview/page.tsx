'use client';

import PreviewFeature from '@/components/preview/PreviewFeature';
import { AppShell } from '@/components/workspace/ProductWorkspace';

export default function PreviewPage() {
  return (
    <AppShell
      studio
      eyebrow="3D Book Preview"
      title="3D KDP Book Preview"
      description="Preview your paperback, hardcover, or Kindle book as a physical object before uploading to KDP. Export realistic transparent book snapshots when the preview looks right."
    >
      <section className="sr-only" aria-label="3D KDP book preview FAQ">
        <h2>KDP book preview FAQ</h2>
        <h3>Can I preview a paperback mockup?</h3>
        <p>Yes. The 3D KDP book preview shows paperback page stack, cover, spine, and page navigation.</p>
        <h3>Can I preview a hardcover book?</h3>
        <p>Yes. Hardcover preview uses a different book type mode so the presentation feels more rigid and substantial.</p>
        <h3>Can I export a transparent PNG?</h3>
        <p>Yes. Use the export control in the 3D preview studio to save a transparent book snapshot.</p>
      </section>
      <PreviewFeature />
    </AppShell>
  );
}
