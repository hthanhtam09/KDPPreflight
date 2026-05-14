import type { BlogFAQ } from '@/lib/blog';

export function ArticleFAQ({ items }: { items: BlogFAQ[] }) {
  if (!items.length) return null;

  return (
    <section id="faq" className="mt-12 scroll-mt-28" aria-labelledby="faq-heading">
      <h2 id="faq-heading" className="text-2xl font-bold tracking-[-0.02em] text-foreground">
        Frequently asked questions
      </h2>
      <div className="mt-5 divide-y divide-border rounded-2xl border border-border bg-card shadow-soft">
        {items.map((item) => (
          <details key={item.question} className="group p-5">
            <summary className="cursor-pointer list-none text-base font-bold text-foreground marker:hidden">
              {item.question}
            </summary>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
