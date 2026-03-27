import { NextRequest, NextResponse } from 'next/server';
import { proxy } from './src/proxy';
import { adminMiddleware } from './src/middleware/admin';
import { rateLimitMiddleware } from './src/lib/rate-limit';

export async function middleware(request: NextRequest) {
  // Skip middleware for Tauri app in development
  // Tauri apps run on localhost:3000 but don't need rate limiting or CSRF
  if (process.env.TAURI_ENV_PLATFORM !== undefined &&
      process.env.NODE_ENV !== 'production') {
    console.log('Middleware skipped - Tauri development environment');
    return NextResponse.next();
  }

  // Apply rate limiting first (with graceful fallback)
  const rateLimitResponse = await rateLimitMiddleware(request);
  if (rateLimitResponse && rateLimitResponse.status === 429) {
    return rateLimitResponse;
  }

  // Check admin access
  const adminResponse = await adminMiddleware(request);
  if (adminResponse) {
    return adminResponse;
  }

  // Continue with normal proxy
  return proxy(request);
}

export const config = {
  runtime: 'nodejs',
  matcher: ['/api/:path*', '/dashboard/:path*'],
};
