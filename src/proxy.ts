import { NextResponse, type NextRequest } from 'next/server';
import { hasAdminRequestSession } from '@/lib/admin-session';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminPage = pathname === '/admin' || pathname.startsWith('/admin/');
  const isAdminApi = pathname.startsWith('/api/admin/');
  const isLoginPath = pathname === '/admin/login' || pathname === '/api/admin/login';

  if ((!isAdminPage && !isAdminApi) || isLoginPath) {
    return NextResponse.next();
  }

  const authenticated = await hasAdminRequestSession(request);
  if (authenticated) return NextResponse.next();

  if (isAdminApi) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = '/admin/login';
  loginUrl.searchParams.set('next', pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};

