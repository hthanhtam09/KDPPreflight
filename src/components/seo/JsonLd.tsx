import type { JsonLdObject } from '@/lib/schema';

export function JsonLd({ id, data }: { id: string; data: JsonLdObject | JsonLdObject[] }) {
  return (
    <script
      id={id}
      type="application/ld+json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
