import { NextResponse } from 'next/server';
import { toCsv } from '@/lib/csv';
import { getFeatureFeedbackExportRows } from '@/lib/admin-queries';

export async function GET() {
  try {
    return new NextResponse(toCsv(await getFeatureFeedbackExportRows()), {
      headers: {
        'content-type': 'text/csv; charset=utf-8',
        'content-disposition': 'attachment; filename="feature-feedback.csv"',
      },
    });
  } catch (error) {
    console.error('Admin feature feedback export failed:', error);
    return NextResponse.json({ error: 'Export unavailable.' }, { status: 500 });
  }
}

