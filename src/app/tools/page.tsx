import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Wrench } from 'lucide-react';
import { JsonLd } from '@/components/seo/JsonLd';
import { generatePageMetadata, SITE_URL } from '@/lib/seo';
import { breadcrumbSchema, itemListSchema } from '@/lib/schema';
import { toolPages } from '@/lib/tool-pages';

export const metadata: Metadata = generatePageMetadata({
  title: 'KDP Tools | Cover Checker, Bleed Checker, Spine & Trim Calculators',
  description: 'Free KDP tools for cover checking, bleed checking, spine width calculation, trim size calculation, and cover validation before Amazon upload.',
  path: '/tools',
  keywords: ['KDP tools', 'KDP cover checker', 'KDP bleed checker', 'KDP spine width calculator', 'KDP trim size calculator'],
});

export default function ToolsIndexPage() {
  return (
    <>
      <JsonLd
        id="tools-index-schema"
        data={[
          breadcrumbSchema([
            { name: 'Home', url: SITE_URL },
            { name: 'Tools', url: `${SITE_URL}/tools` },
          ]),
          itemListSchema(
            'KDP Preflight Tools',
            toolPages.map((tool) => ({
              name: tool.eyebrow,
              url: `${SITE_URL}/tools/${tool.slug}`,
              description: tool.description,
            })),
          ),
        ]}
      />
      <main className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <header className="max-w-3xl">
          <p className="ds-eyebrow">KDP tools</p>
          <h1 className="ds-heading mt-4 text-balance text-[clamp(2.2rem,5vw,4rem)]">
            KDP cover validation tools for real upload problems.
          </h1>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">
            High-intent utilities for checking cover PDFs, bleed, trim size, spine width, and full wrap validation before Amazon KDP reviews your files.
          </p>
        </header>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {toolPages.map((tool) => (
            <Link key={tool.slug} href={`/tools/${tool.slug}`} className="group rounded-2xl border border-border bg-card p-6 shadow-card transition hover:-translate-y-0.5 hover:border-primary/30">
              <span className="grid size-11 place-items-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                <Wrench className="h-5 w-5" />
              </span>
              <h2 className="mt-5 text-xl font-bold text-foreground group-hover:text-primary">{tool.eyebrow}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{tool.description}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-primary">
                Open tool page <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
