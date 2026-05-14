import { NextResponse } from 'next/server';
import { toCsv } from '@/lib/csv';
import { getFeedbackExportRows } from '@/lib/admin-queries';

export async function GET() {
  try {
    return new NextResponse(toCsv(await getFeedbackExportRows()), {
      headers: {
        'content-type': 'text/csv; charset=utf-8',
        'content-disposition': 'attachment; filename="feedback.csv"',
      },
    });
  } catch (error) {
    console.error('Admin feedback export failed:', error);
    return NextResponse.json({ error: 'Export unavailable.' }, { status: 500 });
  }
}

