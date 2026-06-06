import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Get auth token from cookies
  const authToken = request.cookies.get('sb-auth-token')?.value;

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!authToken) {
      return NextResponse.redirect(new URL('/auth/otp-login', request.url));
    }

    // Admin role validation happens client-side in admin layout
    // since we need database access to verify the role
  }

  // Protect app routes
  if (request.nextUrl.pathname.startsWith('/app')) {
    if (!authToken) {
      return NextResponse.redirect(new URL('/auth/otp-login', request.url));
    }
  }

  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!authToken) {
      return NextResponse.redirect(new URL('/auth/otp-login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*'],
};
