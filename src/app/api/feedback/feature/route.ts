import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { sendFeedbackEmail } from '@/lib/email';
import {
  buildFeatureEmail,
  checkRateLimit,
  featureFeedbackSchema,
  getClientIp,
  hashIp,
  sanitizeText,
} from '@/lib/feedback';
import { getFeatureFeedbackCollection } from '@/lib/mongodb';

export async function POST(request: Request) {
  const headerList = await headers();
  const ipHash = hashIp(getClientIp(headerList));
  const rateLimitKey = ipHash ?? 'anonymous';

  if (!checkRateLimit(`feature:${rateLimitKey}`)) {
    return NextResponse.json({ error: 'Too many feedback submissions. Please try again soon.' }, { status: 429 });
  }

  try {
    const rawBody = await request.json();
    const parsed = featureFeedbackSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid feedback payload.' }, { status: 400 });
    }

    const feedback = {
      category: parsed.data.category,
      message: sanitizeText(parsed.data.message) ?? parsed.data.message,
      email: sanitizeText(parsed.data.email || undefined),
      url: parsed.data.url,
    };
    const createdAt = new Date();
    const userAgent = sanitizeText(headerList.get('user-agent') ?? undefined);

    const collection = await getFeatureFeedbackCollection();
    await collection.insertOne({
      ...feedback,
      userAgent,
      ipHash,
      createdAt,
    });

    const email = buildFeatureEmail({ feedback, userAgent, createdAt });
    void sendFeedbackEmail(email);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Feature feedback submission failed:', error);
    return NextResponse.json({ error: 'Feedback could not be saved right now.' }, { status: 500 });
  }
}
