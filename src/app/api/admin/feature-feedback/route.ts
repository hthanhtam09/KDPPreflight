import { NextResponse } from 'next/server';
import { getFeatureFeedbackList } from '@/lib/admin-queries';

export async function GET(request: Request) {
  const url = new URL(request.url);
  try {
    return NextResponse.json(await getFeatureFeedbackList({
      category: url.searchParams.get('category') ?? undefined,
      status: url.searchParams.get('status') ?? undefined,
      search: url.searchParams.get('search') ?? undefined,
      page: Number(url.searchParams.get('page') ?? 1),
    }));
  } catch (error) {
    console.error('Admin feature feedback failed:', error);
    return NextResponse.json({ error: 'Feature feedback unavailable.' }, { status: 500 });
  }
}

