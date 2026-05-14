import { NextResponse } from 'next/server';
import { FEATURE_STATUSES, updateFeatureFeedbackStatus } from '@/lib/admin-queries';

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const status = typeof body.status === 'string' ? body.status : '';

    if (!FEATURE_STATUSES.includes(status as (typeof FEATURE_STATUSES)[number])) {
      return NextResponse.json({ error: 'Invalid status.' }, { status: 400 });
    }

    const updated = await updateFeatureFeedbackStatus(id, status as (typeof FEATURE_STATUSES)[number]);
    if (!updated) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Admin feature feedback update failed:', error);
    return NextResponse.json({ error: 'Status could not be updated.' }, { status: 500 });
  }
}
