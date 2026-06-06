import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for Supabase session cookie (can be named differently)
  const cookies = request.cookies.getAll();
  const hasSession = cookies.some(
    (c) =>
      c.name.startsWith('sb-') &&
      (c.name.includes('auth-token') || c.name.includes('access-token'))
  );

  const isProtected =
    pathname.startsWith('/admin') || pathname.startsWith('/dashboard');

  if (isProtected && !hasSession) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*'],
};
