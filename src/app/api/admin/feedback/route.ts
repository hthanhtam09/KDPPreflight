import { NextResponse } from 'next/server';
import { getFeedbackList } from '@/lib/admin-queries';

export async function GET(request: Request) {
  const url = new URL(request.url);
  try {
    return NextResponse.json(await getFeedbackList({
      type: url.searchParams.get('type') ?? undefined,
      search: url.searchParams.get('search') ?? undefined,
      page: Number(url.searchParams.get('page') ?? 1),
    }));
  } catch (error) {
    console.error('Admin feedback failed:', error);
    return NextResponse.json({ error: 'Feedback unavailable.' }, { status: 500 });
  }
}

