import { z } from 'zod';
import { getPageViewsCollection } from '@/lib/mongodb';

export const pageViewSchema = z.object({
  path: z.string().trim().min(1).max(500).startsWith('/'),
  referrer: z.string().trim().max(700).optional().or(z.literal('')),
});

const DEDUPE_WINDOW_MS = 30_000;

export async function trackPageView(input: {
  path: string;
  referrer?: string;
  userAgent?: string;
  ipHash?: string;
  country?: string;
}) {
  const collection = await getPageViewsCollection();
  const createdAt = new Date();

  if (input.ipHash) {
    const recent = await collection.findOne({
      path: input.path,
      ipHash: input.ipHash,
      createdAt: { $gte: new Date(Date.now() - DEDUPE_WINDOW_MS) },
    });
    if (recent) return { deduped: true };
  }

  await collection.insertOne({
    path: input.path,
    referrer: input.referrer || undefined,
    userAgent: input.userAgent,
    ipHash: input.ipHash,
    country: input.country,
    createdAt,
  });

  return { deduped: false };
}

