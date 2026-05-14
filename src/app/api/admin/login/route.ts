import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { validateAdminCredentials } from '@/lib/admin-auth';
import { createAdminSessionToken, setAdminSessionCookie } from '@/lib/admin-session';
import { getClientIp, hashIp } from '@/lib/hash';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(request: Request) {
  const headerList = await headers();
  const ipKey = hashIp(getClientIp(headerList)) ?? 'anonymous';

  if (!checkRateLimit(`admin-login:${ipKey}`, 5, 15 * 60 * 1000)) {
    return NextResponse.json({ error: 'Login failed. Please try again later.' }, { status: 429 });
  }

  try {
    const body = await request.json();
    const username = typeof body.username === 'string' ? body.username : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!validateAdminCredentials(username, password)) {
      return NextResponse.json({ error: 'Invalid username or password.' }, { status: 401 });
    }

    const token = await createAdminSessionToken(username);
    const response = NextResponse.json({ ok: true });
    setAdminSessionCookie(response, token);
    return response;
  } catch (error) {
    console.error('Admin login failed:', error);
    return NextResponse.json({ error: 'Login failed. Please try again.' }, { status: 500 });
  }
}

