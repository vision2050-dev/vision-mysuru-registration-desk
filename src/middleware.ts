import { NextRequest, NextResponse } from 'next/server';
import { AUTH_CONFIG, verifySessionToken } from '@/lib/auth';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Static assets & public images
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/logo_final.png') ||
    pathname.match(/\.(png|jpg|jpeg|svg|webp|ico|css|js)$/)
  ) {
    return NextResponse.next();
  }

  // 2. Public E-Pass Badge Pages for Attendees (so students can view their passes)
  if (pathname.startsWith('/pass/') || pathname.startsWith('/api/pass/')) {
    return NextResponse.next();
  }

  // 3. Auth API Endpoints
  if (pathname === '/api/auth/login' || pathname === '/api/auth/logout') {
    return NextResponse.next();
  }

  // 4. Check for session token
  const token = req.cookies.get(AUTH_CONFIG.cookieName)?.value;
  const isAuthenticated = verifySessionToken(token);

  // 5. If already authenticated and trying to visit login page -> redirect to dashboard
  if (pathname === '/login') {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/', req.url));
    }
    return NextResponse.next();
  }

  // 6. If not authenticated and trying to access protected routes
  if (!isAuthenticated) {
    // API routes return 401
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    // Page routes redirect to login
    const loginUrl = new URL('/login', req.url);
    if (pathname !== '/') {
      loginUrl.searchParams.set('from', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
