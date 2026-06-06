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

    // For admin check, we would need to verify the token
    // This would typically be done with a server-side check
    // For now, we'll let the client-side check handle it
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
