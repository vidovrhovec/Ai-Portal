import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { auth } from '@/auth';

const ADMIN_DIR = path.join(process.cwd(), '.admin');
const ENABLED_FLAG = path.join(ADMIN_DIR, '.enabled');

interface AdminConfig {
  version: string;
  features: {
    selfRegistration: boolean;
    emailVerification: boolean;
    multiTenant: boolean;
  };
  database: {
    type: string;
    connectionString: string;
  };
  security: {
    auditLogging: boolean;
    sessionTimeout: number;
  };
  createdAt: string;
  updatedAt?: string;
}

/**
 * Check if admin panel is enabled
 */
export async function isAdminEnabled(): Promise<boolean> {
  try {
    await fs.access(ENABLED_FLAG);
    return true;
  } catch {
    return false;
  }
}

/**
 * Admin middleware - checks if admin panel access is enabled and user has ADMIN role
 */
export async function adminMiddleware(request: NextRequest): Promise<NextResponse | null> {
  const { pathname } = request.nextUrl;

  // Only apply to admin routes
  if (!pathname.startsWith('/admin')) {
    return null;
  }

  const isEnabled = await isAdminEnabled();

  if (!isEnabled) {
    // Admin not enabled - redirect to home or show 404
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Check user authentication and role
  const session = await auth();

  if (!session?.user) {
    // User not authenticated - redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (session.user.role !== 'ADMIN') {
    // User doesn't have ADMIN role - redirect to dashboard or show 403
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return null; // Continue with request
}

/**
 * Get admin configuration
 */
export async function getAdminConfig(): Promise<AdminConfig | null> {
  try {
    const configPath = path.join(ADMIN_DIR, 'config.json');
    const configData = await fs.readFile(configPath, 'utf8');
    return JSON.parse(configData) as AdminConfig;
  } catch {
    return null;
  }
}

/**
 * Update admin configuration
 */
export async function updateAdminConfig(updates: Partial<AdminConfig>): Promise<boolean> {
  try {
    const configPath = path.join(ADMIN_DIR, 'config.json');
    let currentConfig: Record<string, unknown> = {};

    try {
      const configData = await fs.readFile(configPath, 'utf8');
      currentConfig = JSON.parse(configData);
    } catch {
      // Config doesn't exist, use defaults
    }

    const newConfig = {
      ...currentConfig,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await fs.writeFile(configPath, JSON.stringify(newConfig, null, 2));
    return true;
  } catch {
    return false;
  }
}