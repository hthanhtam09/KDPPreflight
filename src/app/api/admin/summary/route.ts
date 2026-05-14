import { NextResponse } from 'next/server';
import { getAdminSummary, ensureAdminIndexes } from '@/lib/admin-queries';

export async function GET() {
  try {
    await ensureAdminIndexes();
    return NextResponse.json(await getAdminSummary());
  } catch (error) {
    console.error('Admin summary failed:', error);
    return NextResponse.json({ error: 'Summary unavailable.' }, { status: 500 });
  }
}

