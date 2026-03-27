import { NextRequest, NextResponse } from 'next/server';
import { securityConfig } from './security-config';

// CSRF token storage (in production, use Redis or database)
const csrfTokens = new Map<string, { token: string; expires: number }>();

// CSRF token expiry time
const TOKEN_EXPIRY = securityConfig.csrf.tokenExpiry;

/**
 * Generate a cryptographically secure random token using Web Crypto API
 * Compatible with Edge Runtime
 */
function generateSecureToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate a new CSRF token for a session
 */
export function generateCSRFToken(sessionId: string): string {
  const token = generateSecureToken();
  const expires = Date.now() + TOKEN_EXPIRY;

  csrfTokens.set(sessionId, { token, expires });

  // Clean up expired tokens periodically
  cleanupExpiredTokens();

  return token;
}

/**
 * Validate a CSRF token
 */
export function validateCSRFToken(sessionId: string, token: string): boolean {
  const stored = csrfTokens.get(sessionId);

  if (!stored) {
    return false;
  }

  // Check if token is expired
  if (Date.now() > stored.expires) {
    csrfTokens.delete(sessionId);
    return false;
  }

  // Check if token matches
  if (stored.token !== token) {
    return false;
  }

  // Token is valid, remove it (one-time use)
  csrfTokens.delete(sessionId);
  return true;
}

/**
 * Clean up expired tokens
 */
function cleanupExpiredTokens(): void {
  const now = Date.now();
  for (const [sessionId, data] of csrfTokens.entries()) {
    if (now > data.expires) {
      csrfTokens.delete(sessionId);
    }
  }
}

/**
 * CSRF protection middleware for state-changing operations
 */
export function csrfProtection(request: NextRequest): NextResponse | null {
  const method = request.method.toUpperCase();

  // Only protect state-changing methods
  if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    return null;
  }

  // Skip CSRF for API routes that handle authentication
  const pathname = request.nextUrl.pathname;
  if (pathname.startsWith('/api/auth/') || pathname === '/api/users') {
    return null;
  }

  const sessionId = request.cookies.get('authjs.session-token')?.value;
  if (!sessionId) {
    return NextResponse.json(
      { error: 'Session required for this operation' },
      { status: 401 }
    );
  }

  const csrfToken = request.headers.get('x-csrf-token') ||
                   request.nextUrl.searchParams.get('csrfToken');

  if (!csrfToken) {
    return NextResponse.json(
      { error: 'CSRF token required' },
      { status: 403 }
    );
  }

  if (!validateCSRFToken(sessionId, csrfToken)) {
    return NextResponse.json(
      { error: 'Invalid or expired CSRF token' },
      { status: 403 }
    );
  }

  return null; // Token is valid, proceed
}

/**
 * Get CSRF token for client-side usage
 */
export function getCSRFToken(sessionId: string): string | null {
  const stored = csrfTokens.get(sessionId);
  if (!stored || Date.now() > stored.expires) {
    return null;
  }
  return stored.token;
}