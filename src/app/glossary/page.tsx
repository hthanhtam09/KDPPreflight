import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { JsonLd } from '@/components/seo/JsonLd';
import { glossaryTerms } from '@/lib/glossary-data';
import { generatePageMetadata } from '@/lib/seo';
import { breadcrumbSchema, definedTermSetSchema, SITE_URL } from '@/lib/schema';

export const metadata: Metadata = generatePageMetadata({
  title: 'KDP Glossary | Amazon KDP Formatting Terms Defined',
  description: 'Clear definitions of KDP bleed, trim size, safe area, spine width, printable area, full wrap cover, barcode area, PDF export, cover templates, and hardcover covers.',
  path: '/glossary',
  keywords: ['KDP glossary', 'Amazon KDP terms', 'KDP formatting definitions', 'KDP bleed definition'],
});

export default function GlossaryPage() {
  return (
    <>
      <JsonLd
        id="glossary-schema"
        data={[
          definedTermSetSchema(glossaryTerms.map((item) => ({ term: item.term, definition: item.definition }))),
          breadcrumbSchema([
            { name: 'Home', url: SITE_URL },
            { name: 'Glossary', url: `${SITE_URL}/glossary` },
          ]),
        ]}
      />
      <main className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <header className="max-w-3xl">
          <p className="ds-eyebrow">KDP glossary</p>
          <h1 className="ds-heading mt-4 text-balance text-[clamp(2.2rem,5vw,4rem)]">Amazon KDP formatting terms defined.</h1>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">
            Short semantic definitions for the production terms that matter when preparing KDP covers and print-ready PDFs.
          </p>
        </header>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {glossaryTerms.map((term) => (
            <Link key={term.slug} href={`/glossary/${term.slug}`} className="group rounded-2xl border border-border bg-card p-5 shadow-card transition hover:-translate-y-0.5 hover:border-primary/30">
              <h2 className="text-lg font-bold text-foreground group-hover:text-primary">{term.term}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{term.definition}</p>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary">
                Read definition <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
