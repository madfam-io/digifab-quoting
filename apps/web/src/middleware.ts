import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['es', 'en'];

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Handle direct locale access (e.g., /en or /es)
  if (locales.some(locale => pathname === `/${locale}`)) {
    // Redirect /en to / or /es to /
    const response = NextResponse.redirect(new URL('/', request.url));
    response.headers.set('x-locale-redirect', 'true');
    return response;
  }

  // Skip middleware for API routes, static files, etc.
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon.ico')
  ) {
    return;
  }

  // For now, we're not using locale prefixes in URLs
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip all internal paths (_next)
    '/((?!_next|api|favicon.ico).*)',
  ],
};