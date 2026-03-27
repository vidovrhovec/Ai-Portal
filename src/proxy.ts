import { NextRequest, NextResponse } from 'next/server';
import { rateLimitMiddleware } from '@/lib/rate-limit';
import { csrfProtection } from '@/lib/csrf';
import logger, { securityLogger } from '@/lib/logger';
import { securityConfig } from '@/lib/security-config';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/auth/') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Apply rate limiting to API routes (disabled in development)
  if (pathname.startsWith('/api/') && process.env.NODE_ENV === 'production') {
    const rateLimitResult = await rateLimitMiddleware(request);
    if (rateLimitResult && rateLimitResult.status === 429) {
      securityLogger.rateLimitExceeded(
        request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        pathname
      );
      return rateLimitResult;
    }
  }

  // Apply CSRF protection to state-changing operations
  if (pathname.startsWith('/api/') && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    // CSRF validation moved to individual API routes after authentication
    // since session cookies are httpOnly and can't be accessed by middleware
  }

  // Create response with security headers
  const response = NextResponse.next();

  // Security Headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // Content Security Policy
  const csp = Object.entries(securityConfig.headers.contentSecurityPolicy)
    .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()} ${value}`)
    .join('; ');

  response.headers.set('Content-Security-Policy', csp);

  // HSTS (HTTP Strict Transport Security) - only in production
  if (process.env.NODE_ENV === 'production') {
    const hstsConfig = securityConfig.headers.hsts;
    response.headers.set(
      'Strict-Transport-Security',
      `max-age=${hstsConfig.maxAge}${hstsConfig.includeSubDomains ? '; includeSubDomains' : ''}${hstsConfig.preload ? '; preload' : ''}`
    );
  }

  return response;
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