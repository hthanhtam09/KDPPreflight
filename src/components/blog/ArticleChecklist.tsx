import { CheckCircle2 } from 'lucide-react';

export function ArticleChecklist({ title = 'Pre-upload checklist', items }: { title?: string; items: string[] }) {
  if (!items.length) return null;

  return (
    <section className="my-10 rounded-2xl border border-border bg-card p-5 shadow-soft" aria-labelledby="article-checklist-heading">
      <h2 id="article-checklist-heading" className="text-2xl font-bold tracking-[-0.02em] text-foreground">
        {title}
      </h2>
      <ul className="mt-5 grid gap-3">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-sm leading-6 text-muted-foreground">
            <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-success" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
