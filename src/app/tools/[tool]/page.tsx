import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, CheckCircle2, FileCheck2, Ruler } from 'lucide-react';
import { JsonLd } from '@/components/seo/JsonLd';
import { getInternalLinks } from '@/lib/internal-links';
import { generatePageMetadata, SITE_URL } from '@/lib/seo';
import { breadcrumbSchema, faqSchema, softwareApplicationSchema } from '@/lib/schema';
import { getToolPage, toolPages } from '@/lib/tool-pages';

interface Props {
  params: Promise<{ tool: string }>;
}

export function generateStaticParams() {
  return toolPages.map((tool) => ({ tool: tool.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tool } = await params;
  const page = getToolPage(tool);
  if (!page) return {};

  return generatePageMetadata({
    title: page.title,
    description: page.description,
    path: `/tools/${page.slug}`,
    keywords: page.keywords,
  });
}

export default async function ToolPage({ params }: Props) {
  const { tool } = await params;
  const page = getToolPage(tool);
  if (!page) notFound();

  const links = getInternalLinks(page.topic);

  return (
    <>
      <JsonLd
        id={`tool-${page.slug}-schema`}
        data={[
          softwareApplicationSchema(),
          faqSchema(page.faqs),
          breadcrumbSchema([
            { name: 'Home', url: SITE_URL },
            { name: 'Tools', url: `${SITE_URL}/tools/${page.slug}` },
            { name: page.eyebrow, url: `${SITE_URL}/tools/${page.slug}` },
          ]),
        ]}
      />

      <main>
        <section className="border-b border-border bg-surface/30">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-20">
            <p className="ds-eyebrow">{page.eyebrow}</p>
            <h1 className="ds-heading mt-4 max-w-4xl text-balance text-[clamp(2.25rem,5vw,4.4rem)]">{page.h1}</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">{page.intro}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={page.primaryCta.href} className="ds-button-primary inline-flex min-h-12 items-center gap-2.5 rounded-xl px-6 text-sm font-bold">
                <FileCheck2 className="h-4 w-4" />
                {page.primaryCta.label}
              </Link>
              {page.secondaryCta ? (
                <Link href={page.secondaryCta.href} className="ds-button-secondary inline-flex min-h-12 items-center gap-2.5 rounded-xl px-6 text-sm font-bold">
                  <Ruler className="h-4 w-4" />
                  {page.secondaryCta.label}
                </Link>
              ) : null}
            </div>
          </div>
        </section>

        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <section aria-labelledby="checks-heading">
              <h2 id="checks-heading" className="text-3xl font-bold tracking-[-0.025em] text-foreground">What this tool checks</h2>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {page.checks.map((item) => (
                  <div key={item} className="flex gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    <p className="text-sm font-semibold leading-6 text-foreground">{item}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-14" aria-labelledby="steps-heading">
              <h2 id="steps-heading" className="text-3xl font-bold tracking-[-0.025em] text-foreground">How to use it</h2>
              <ol className="mt-6 space-y-4">
                {page.steps.map((step, index) => (
                  <li key={step.name} className="flex gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-black text-primary">{index + 1}</span>
                    <div>
                      <h3 className="font-bold text-foreground">{step.name}</h3>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">{step.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            <section id="faq" className="mt-14" aria-labelledby="faq-heading">
              <h2 id="faq-heading" className="text-3xl font-bold tracking-[-0.025em] text-foreground">Frequently asked questions</h2>
              <div className="mt-6 divide-y divide-border rounded-2xl border border-border bg-card shadow-soft">
                {page.faqs.map((faq) => (
                  <details key={faq.question} className="p-5">
                    <summary className="cursor-pointer list-none font-bold text-foreground">{faq.question}</summary>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            <RelatedLinkBox title="Related guides" links={links.guides} />
            <RelatedLinkBox title="Related tools" links={links.tools.filter((link) => link.href !== `/tools/${page.slug}`)} />
            <RelatedLinkBox title="Glossary terms" links={links.glossary} />
          </aside>
        </div>
      </main>
    </>
  );
}

function RelatedLinkBox({ title, links }: { title: string; links: { label: string; href: string; description?: string }[] }) {
  if (!links.length) return null;

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-muted-foreground">{title}</h2>
      <div className="mt-4 grid gap-2">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="group rounded-xl border border-border bg-muted/20 p-3 transition hover:border-primary/30">
            <span className="flex items-center justify-between gap-3 text-sm font-bold text-foreground group-hover:text-primary">
              {link.label}
              <ArrowRight className="h-3.5 w-3.5 text-primary transition group-hover:translate-x-1" />
            </span>
            {link.description ? <p className="mt-1 text-xs leading-5 text-muted-foreground">{link.description}</p> : null}
          </Link>
        ))}
      </div>
    </section>
  );
}
