import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { JsonLd } from '@/components/seo/JsonLd';
import { glossaryExplainers } from '@/lib/glossary-content';
import { getGlossaryTerm, glossaryTerms } from '@/lib/glossary-data';
import { getInternalLinks } from '@/lib/internal-links';
import { generatePageMetadata } from '@/lib/seo';
import { breadcrumbSchema, definedTermSchema, faqSchema, SITE_URL } from '@/lib/schema';

interface Props {
  params: Promise<{ term: string }>;
}

export function generateStaticParams() {
  return glossaryTerms.map((term) => ({ term: term.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { term: slug } = await params;
  const term = getGlossaryTerm(slug);
  if (!term) return {};
  return generatePageMetadata({
    title: `${term.term} Definition | KDP Glossary`,
    description: `${term.definition} Learn why ${term.term.toLowerCase()} matters for Amazon KDP and how to avoid common mistakes.`,
    path: `/glossary/${term.slug}`,
    keywords: [`KDP ${term.term}`, `${term.term} definition`, 'Amazon KDP glossary'],
  });
}

export default async function GlossaryTermPage({ params }: Props) {
  const { term: slug } = await params;
  const term = getGlossaryTerm(slug);
  if (!term) notFound();

  const links = getInternalLinks(term.topic);
  const extra = glossaryExplainers[term.slug];
  const faqs = [...term.faqs, ...(extra?.extraFaqs ?? [])];

  return (
    <>
      <JsonLd
        id={`glossary-${term.slug}-schema`}
        data={[
          definedTermSchema(term.term, term.definition, `${SITE_URL}/glossary`),
          faqSchema(faqs),
          breadcrumbSchema([
            { name: 'Home', url: SITE_URL },
            { name: 'Glossary', url: `${SITE_URL}/glossary` },
            { name: term.term, url: `${SITE_URL}/glossary/${term.slug}` },
          ]),
        ]}
      />
      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <Link href="/glossary" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" />
          All glossary terms
        </Link>
        <article className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div>
            <p className="ds-eyebrow">KDP definition</p>
            <h1 className="ds-heading mt-4 text-balance text-[clamp(2.1rem,5vw,3.8rem)]">{term.term}</h1>
            <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/10 p-5">
              <p className="text-base font-semibold leading-7 text-foreground">{term.definition}</p>
            </div>
            <section className="mt-10">
              <h2 className="text-2xl font-bold text-foreground">Why it matters for KDP</h2>
              <p className="mt-3 text-base leading-8 text-muted-foreground">{term.whyItMatters}</p>
            </section>
            {extra?.explainer.length ? (
              <section className="mt-10">
                <h2 className="text-2xl font-bold text-foreground">{term.term} explained</h2>
                <div className="mt-4 space-y-4">
                  {extra.explainer.map((paragraph) => (
                    <p key={paragraph.slice(0, 48)} className="text-base leading-8 text-muted-foreground">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ) : null}

            <section className="mt-10">
              <h2 className="text-2xl font-bold text-foreground">Common mistakes</h2>
              <ul className="mt-4 grid gap-3">
                {term.commonMistakes.map((mistake) => (
                  <li key={mistake} className="flex gap-3 text-sm leading-6 text-muted-foreground">
                    <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-success" />
                    {mistake}
                  </li>
                ))}
              </ul>
            </section>
            <section className="mt-10">
              <h2 className="text-2xl font-bold text-foreground">FAQ</h2>
              <div className="mt-4 divide-y divide-border rounded-2xl border border-border bg-card">
                {faqs.map((faq) => (
                  <details key={faq.question} className="p-5">
                    <summary className="cursor-pointer list-none font-bold text-foreground">{faq.question}</summary>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          </div>
          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            <LinkBox title="Related guides" links={links.guides} />
            <LinkBox title="Related tools" links={links.tools} />
            <LinkBox title="Related glossary terms" links={links.glossary.filter((link) => link.href !== `/glossary/${term.slug}`)} />
          </aside>
        </article>
      </main>
    </>
  );
}

function LinkBox({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  if (!links.length) return null;
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-muted-foreground">{title}</h2>
      <div className="mt-4 grid gap-2">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/20 px-3 py-2 text-sm font-bold text-foreground hover:border-primary/30 hover:text-primary">
            {link.label}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        ))}
      </div>
    </section>
  );
}
