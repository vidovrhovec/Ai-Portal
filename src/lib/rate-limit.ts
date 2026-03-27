import { NextRequest, NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { securityConfig } from './security-config';

/**
 * Rate Limiting Configuration
 *
 * Uses Upstash Redis (via Vercel KV) for distributed rate limiting.
 * Implements sliding window algorithm for fair rate limiting.
 *
 * Configuration:
 * - Standard limit: 100 requests per 15 minutes
 * - Strict limit: 10 requests per 15 minutes (for sensitive endpoints)
 *
 * Sensitive endpoints: Defined in securityConfig.sensitiveEndpoints
 *
 * Error Handling:
 * - If KV is not configured (development), rate limiting is bypassed
 * - Errors are logged but don't block requests
 */

// Lazy-loaded rate limiters - only initialized when needed
let ratelimit: Ratelimit | null = null;
let strictRateLimit: Ratelimit | null = null;
let kvInitialized = false;

// Function to initialize KV and rate limiters lazily
async function initializeRateLimiters() {
  if (kvInitialized) return;

  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    kvInitialized = true; // Mark as initialized even if not configured
    return;
  }

  try {
    // Dynamic import KV only when needed
    const { kv } = await import('@vercel/kv');

    ratelimit = new Ratelimit({
      redis: kv,
      limiter: Ratelimit.slidingWindow(
        securityConfig.rateLimit.maxRequests,
        `${securityConfig.rateLimit.windowMs / 1000} s`
      ),
      analytics: false,
    });

    strictRateLimit = new Ratelimit({
      redis: kv,
      limiter: Ratelimit.slidingWindow(
        securityConfig.rateLimit.strictMaxRequests,
        `${securityConfig.rateLimit.windowMs / 1000} s`
      ),
      analytics: false,
    });

    kvInitialized = true;
  } catch (error) {
    console.warn('KV initialization failed:', error);
    kvInitialized = true; // Mark as initialized to avoid retrying
  }
}

// Endpoints that require strict rate limiting
const STRICT_ENDPOINTS = securityConfig.sensitiveEndpoints;

/**
 * Rate Limiting Middleware
 *
 * Applies rate limiting to incoming requests based on IP address.
 * Uses different limits for regular vs sensitive endpoints.
 *
 * Process:
 * 1. Extract client IP from headers
 * 2. Choose appropriate rate limiter
 * 3. Check if request exceeds limit
 * 4. Return 429 if limited, or continue with headers if allowed
 *
 * Headers Added:
 * - X-RateLimit-Limit: Max requests allowed
 * - X-RateLimit-Remaining: Remaining requests
 * - X-RateLimit-Reset: Time until reset (Unix timestamp)
 *
 * @param request - Next.js request object
 * @returns NextResponse or null (continue)
 */
export async function rateLimitMiddleware(request: NextRequest) {
  // Skip rate limiting in Tauri environment
  if (process.env.TAURI_ENV_PLATFORM !== undefined) {
    console.log('Rate limiting skipped - Tauri environment detected');
    return NextResponse.next();
  }

  // Skip rate limiting in development if KV not configured
  if (process.env.NODE_ENV !== 'production' && !process.env.KV_REST_API_URL) {
    console.log('Rate limiting skipped - KV not configured in development');
    return NextResponse.next();
  }

  try {
    // Initialize rate limiters if not already done
    await initializeRateLimiters();

    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';
    const pathname = request.nextUrl.pathname;

    // Choose rate limiter based on endpoint sensitivity
    const limiter = STRICT_ENDPOINTS.some(endpoint => pathname.startsWith(endpoint))
      ? strictRateLimit
      : ratelimit;

    // Skip rate limiting if limiter is not initialized (KV not configured)
    if (!limiter) {
      console.log('Rate limiting skipped - limiter not initialized');
      return NextResponse.next();
    }

    const { success, limit, reset, remaining } = await limiter.limit(ip);

    if (!success) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          retryAfter: reset - Date.now() / 1000,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
            'Retry-After': Math.ceil((reset - Date.now() / 1000)).toString(),
          },
        }
      );
    }

    // Add rate limit headers to successful requests
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', limit.toString());
    response.headers.set('X-RateLimit-Remaining', remaining.toString());
    response.headers.set('X-RateLimit-Reset', reset.toString());

    return response;
  } catch (error) {
    console.warn('Rate limiting error (KV not configured):', error);
    // Continue without rate limiting if KV is not configured
    return NextResponse.next();
  }
}