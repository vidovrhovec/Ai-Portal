/**
 * Tauri Environment Detection Utilities
 * 
 * Provides utilities for detecting and working with Tauri desktop environment.
 * These utilities help differentiate between web browser and Tauri desktop app contexts.
 */

/**
 * Check if the code is running in a Tauri desktop application
 * 
 * @returns {boolean} True if running in Tauri, false otherwise
 */
export function isTauriApp(): boolean {
  if (typeof window === 'undefined') return false;
  return '__TAURI__' in window;
}

/**
 * Check if the app should use Tauri IPC commands instead of HTTP API
 * 
 * @returns {boolean} True if Tauri IPC should be used
 */
export function shouldUseTauriIPC(): boolean {
  return isTauriApp() && process.env.NODE_ENV !== 'test';
}

/**
 * Get the appropriate API URL for the current environment
 * 
 * In Tauri: Always use localhost:3000
 * In Web: Use relative paths
 * 
 * @param {string} path - The API path (e.g., '/api/courses')
 * @returns {string} The full URL or relative path
 */
export function getApiUrl(path: string): string {
  if (isTauriApp()) {
    // In Tauri, always use localhost
    return `http://localhost:3000${path}`;
  }
  return path; // Use relative path for web
}

/**
 * Check if the code is running on the server side
 * 
 * @returns {boolean} True if server-side, false if client-side
 */
export function isServer(): boolean {
  return typeof window === 'undefined';
}

/**
 * Check if the code is running in development mode
 * 
 * @returns {boolean} True if in development
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Get environment type string for logging
 * 
 * @returns {string} Environment description
 */
export function getEnvironmentType(): string {
  if (isServer()) return 'server';
  if (isTauriApp()) return 'tauri-desktop';
  return 'web-browser';
}

/**
 * Log environment information for debugging
 */
export function logEnvironmentInfo(): void {
  if (isServer()) return; // Don't log on server
  
  const platformInfo = isTauriApp()
    ? (window as unknown as { __TAURI_INTERNALS__?: { metadata?: { currentTarget?: string } } }).__TAURI_INTERNALS__?.metadata?.currentTarget || 'tauri-unknown'
    : 'web';
  
  console.log('🌍 Environment Info:', {
    type: getEnvironmentType(),
    isTauri: isTauriApp(),
    isDev: isDevelopment(),
    platform: platformInfo,
  });
}