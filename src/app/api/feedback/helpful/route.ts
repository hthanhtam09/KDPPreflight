import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { sendFeedbackEmail } from '@/lib/email';
import {
  buildHelpfulEmail,
  checkRateLimit,
  getClientIp,
  hashIp,
  helpfulFeedbackSchema,
  sanitizeText,
} from '@/lib/feedback';
import { getFeedbackCollection } from '@/lib/mongodb';

export async function POST(request: Request) {
  const headerList = await headers();
  const ipHash = hashIp(getClientIp(headerList));
  const rateLimitKey = ipHash ?? 'anonymous';

  if (!checkRateLimit(`helpful:${rateLimitKey}`)) {
    return NextResponse.json({ error: 'Too many feedback submissions. Please try again soon.' }, { status: 429 });
  }

  try {
    const rawBody = await request.json();
    const parsed = helpfulFeedbackSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid feedback payload.' }, { status: 400 });
    }

    const feedback = {
      type: parsed.data.type,
      pageSlug: sanitizeText(parsed.data.pageSlug) ?? parsed.data.pageSlug,
      pageTitle: sanitizeText(parsed.data.pageTitle) ?? parsed.data.pageTitle,
      message: sanitizeText(parsed.data.message),
      url: parsed.data.url,
    };
    const createdAt = new Date();
    const userAgent = sanitizeText(headerList.get('user-agent') ?? undefined);

    const collection = await getFeedbackCollection();
    await collection.insertOne({
      ...feedback,
      userAgent,
      ipHash,
      createdAt,
    });

    const email = buildHelpfulEmail({ feedback, userAgent, createdAt });
    void sendFeedbackEmail(email);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Helpful feedback submission failed:', error);
    return NextResponse.json({ error: 'Feedback could not be saved right now.' }, { status: 500 });
  }
}
