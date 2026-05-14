import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { pageViewSchema, trackPageView } from '@/lib/analytics';
import { getClientIp, hashIp } from '@/lib/hash';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(request: Request) {
  const headerList = await headers();
  const ipHash = hashIp(getClientIp(headerList));
  const rateKey = ipHash ?? 'anonymous';

  if (!checkRateLimit(`page-view:${rateKey}`, 120, 60_000)) {
    return NextResponse.json({ ok: true });
  }

  try {
    const parsed = pageViewSchema.safeParse(await request.json());
    if (!parsed.success || parsed.data.path.startsWith('/admin')) {
      return NextResponse.json({ ok: true });
    }

    await trackPageView({
      path: parsed.data.path,
      referrer: parsed.data.referrer || undefined,
      userAgent: headerList.get('user-agent') ?? undefined,
      ipHash,
      country: headerList.get('x-vercel-ip-country') ?? headerList.get('cf-ipcountry') ?? undefined,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}

