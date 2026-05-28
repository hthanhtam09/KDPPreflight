import Link from 'next/link';
import { ArrowRight, Check, FileCheck2, Ruler } from 'lucide-react';
import { JsonLd } from '@/components/seo/JsonLd';
import { faqSchema, howToSchema, breadcrumbSchema, SITE_URL } from '@/lib/schema';

export type FaqItem = { question: string; answer: string };
export type HowToStep = { name: string; text: string; url?: string };

interface SeoLandingPageProps {
  schemaId: string;
  breadcrumb: { name: string; url: string }[];
  hero: {
    eyebrow: string;
    h1: string;
    intro: string;
    primaryCta: { label: string; href: string };
    secondaryCta?: { label: string; href: string };
  };
  sections: {
    id: string;
    h2: string;
    body: string;
    items?: { title: string; body: string }[];
  }[];
  howTo?: {
    name: string;
    description: string;
    steps: HowToStep[];
  };
  faqs: FaqItem[];
}

function FaqAccordion({ faqs }: { faqs: FaqItem[] }) {
  return (
    <div className="divide-y divide-border rounded-2xl border border-border overflow-hidden">
      {faqs.map(({ question, answer }) => (
        <details key={question} className="group bg-background/60 px-6 py-4 open:bg-muted/20">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-foreground marker:hidden">
            {question}
            <ArrowRight className="h-4 w-4 shrink-0 rotate-90 text-primary transition-transform group-open:rotate-[270deg]" />
          </summary>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{answer}</p>
        </details>
      ))}
    </div>
  );
}

export function SeoLandingPage({
  schemaId,
  breadcrumb,
  hero,
  sections,
  howTo,
  faqs,
}: SeoLandingPageProps) {
  const schemas = [
    faqSchema(faqs),
    breadcrumbSchema(breadcrumb),
    ...(howTo ? [howToSchema(howTo)] : []),
  ];

  return (
    <>
      <JsonLd id={schemaId} data={schemas} />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mx-auto max-w-5xl px-4 pt-6 sm:px-6">
        <ol className="flex flex-wrap items-center gap-1.5 text-[12px] text-muted-foreground">
          {breadcrumb.map((crumb, i) => (
            <li key={crumb.url} className="flex items-center gap-1.5">
              {i < breadcrumb.length - 1 ? (
                <>
                  <Link href={crumb.url} className="hover:text-primary transition-colors">
                    {crumb.name}
                  </Link>
                  <span aria-hidden="true">/</span>
                </>
              ) : (
                <span aria-current="page" className="text-foreground font-medium">
                  {crumb.name}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-4 pb-10 pt-10 sm:px-6">
        <p className="mb-4 text-[11px] font-extrabold uppercase tracking-[0.18em] text-primary">
          {hero.eyebrow}
        </p>
        <h1 className="text-balance text-[clamp(30px,5vw,52px)] font-bold leading-[1.12] tracking-[-0.03em] text-foreground">
          {hero.h1}
        </h1>
        <p className="mt-5 max-w-2xl text-[clamp(15px,1.4vw,17px)] leading-relaxed text-muted-foreground">
          {hero.intro}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={hero.primaryCta.href}
            className="ds-button-primary inline-flex min-h-12 items-center gap-2.5 rounded-xl px-6 text-sm font-bold transition hover:-translate-y-px active:translate-y-px"
          >
            <FileCheck2 className="h-4 w-4" />
            {hero.primaryCta.label}
          </Link>
          {hero.secondaryCta && (
            <Link
              href={hero.secondaryCta.href}
              className="ds-button-secondary inline-flex min-h-12 items-center gap-2.5 rounded-xl px-6 text-sm font-bold transition hover:-translate-y-px hover:border-primary/30 active:translate-y-px"
            >
              <Ruler className="h-4 w-4" />
              {hero.secondaryCta.label}
            </Link>
          )}
        </div>

        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
          {['Free to use', 'Files processed locally', 'No account required'].map((t) => (
            <span key={t} className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
              <Check className="h-3 w-3 text-success shrink-0" />
              {t}
            </span>
          ))}
        </div>
      </section>

      {/* Content sections */}
      {sections.map((section) => (
        <section
          key={section.id}
          id={section.id}
          className="mx-auto max-w-5xl px-4 py-10 sm:px-6"
        >
          <h2 className="mb-4 text-2xl font-bold tracking-[-0.02em] text-foreground sm:text-3xl">
            {section.h2}
          </h2>
          <p className="mb-8 max-w-3xl text-base leading-relaxed text-muted-foreground">
            {section.body}
          </p>
          {section.items && (
            <div className="grid gap-4 sm:grid-cols-2">
              {section.items.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-border bg-background/60 p-5"
                >
                  <h3 className="mb-2 text-base font-bold text-foreground">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      ))}

      {/* How To steps (if provided) */}
      {howTo && (
        <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
          <h2 className="mb-8 text-2xl font-bold tracking-[-0.02em] text-foreground sm:text-3xl">
            {howTo.name}
          </h2>
          <ol className="space-y-4">
            {howTo.steps.map((step, i) => (
              <li key={step.name} className="flex gap-4 rounded-2xl border border-border bg-background/60 p-5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {i + 1}
                </span>
                <div>
                  <h3 className="mb-1 font-semibold text-foreground">{step.name}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{step.text}</p>
                  {step.url && (
                    <Link
                      href={step.url}
                      className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-primary"
                    >
                      Open tool <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* FAQ */}
      <section
        id="faq"
        aria-labelledby="faq-heading"
        className="mx-auto max-w-5xl px-4 py-10 sm:px-6"
      >
        <h2
          id="faq-heading"
          className="mb-8 text-2xl font-bold tracking-[-0.02em] text-foreground sm:text-3xl"
        >
          Frequently Asked Questions
        </h2>
        <FaqAccordion faqs={faqs} />
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-4 pb-20 pt-6 sm:px-6">
        <div className="rounded-[var(--radius-panel,20px)] border border-primary/20 bg-primary/5 p-8 text-center sm:p-12">
          <h2 className="mb-3 text-2xl font-bold tracking-[-0.02em] text-foreground sm:text-3xl">
            Ready to check your KDP files?
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-base text-muted-foreground">
            Upload your cover and manuscript PDFs and get exact measurements — bleed, trim,
            spine, margins — before Amazon KDP sees them.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/preflight"
              className="ds-button-primary inline-flex min-h-12 items-center gap-2.5 rounded-xl px-6 text-sm font-bold transition hover:-translate-y-px active:translate-y-px"
            >
              <FileCheck2 className="h-4 w-4" />
              Scan My KDP Files
            </Link>
            <Link
              href="/setup"
              className="ds-button-secondary inline-flex min-h-12 items-center gap-2.5 rounded-xl px-6 text-sm font-bold transition hover:-translate-y-px hover:border-primary/30 active:translate-y-px"
            >
              <Ruler className="h-4 w-4" />
              Calculate Book Specs
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
