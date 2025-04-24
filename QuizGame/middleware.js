import { NextResponse } from 'next/server';

// Supported locales
const locales = ['en', 'vi', 'ja', 'fr', 'de', 'zh'];
const defaultLocale = 'en';

export function middleware(request) {
  const pathname = request.nextUrl.pathname;

  // Skip paths that already include a locale or are static files
  if (locales.some((locale) => pathname.startsWith(`/${locale}`)) || pathname.includes('.')) {
    return NextResponse.next();
  }

  // Handle root path - redirect to default locale
  if (pathname === '/') {
    return NextResponse.redirect(new URL(`/${defaultLocale}`, request.url));
  }

  // Detect user's preferred language
  const acceptLanguage = request.headers.get('accept-language');
  const preferredLocale = acceptLanguage
    ? acceptLanguage.split(',')[0].split('-')[0]
    : defaultLocale;

  const locale = locales.includes(preferredLocale) ? preferredLocale : defaultLocale;

  // Redirect to the appropriate locale
  return NextResponse.redirect(new URL(`/${locale}${pathname}`, request.url));
}

export const config = {
  matcher: '/((?!api|_next|.*\\..*).*)', // Match all paths except API routes, Next.js internals, and static files
};