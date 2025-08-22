import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['es', 'en'];
const defaultLocale = 'es';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Check if the pathname is missing a locale
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

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
  // If you want to enable them later, uncomment the following:
  /*
  if (pathnameIsMissingLocale) {
    const locale = defaultLocale;
    return NextResponse.redirect(
      new URL(`/${locale}${pathname}`, request.url)
    );
  }
  */
}

export const config = {
  matcher: [
    // Skip all internal paths (_next)
    '/((?!_next|api|favicon.ico).*)',
  ],
};