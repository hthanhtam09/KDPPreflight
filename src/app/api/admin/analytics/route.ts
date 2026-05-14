import { NextResponse } from 'next/server';
import { getAnalyticsOverview } from '@/lib/admin-queries';

export async function GET() {
  try {
    return NextResponse.json(await getAnalyticsOverview());
  } catch (error) {
    console.error('Admin analytics failed:', error);
    return NextResponse.json({ error: 'Analytics unavailable.' }, { status: 500 });
  }
}

