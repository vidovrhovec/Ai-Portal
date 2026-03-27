/**
 * Security Configuration
 * Centralized security settings for the AI Learning Portal
 */

export const securityConfig = {
  // Rate Limiting
  rateLimit: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // 100 requests per minute for general endpoints
    strictMaxRequests: 10, // 10 requests per minute for sensitive endpoints
  },

  // CSRF Protection
  csrf: {
    tokenExpiry: 15 * 60 * 1000, // 15 minutes
  },

  // API Key Rotation
  apiKeyRotation: {
    interval: 24 * 60 * 60 * 1000, // 24 hours
  },

  // Input Sanitization
  sanitization: {
    maxQueryLength: 10000,
    maxMessageLength: 2000,
    maxFileNameLength: 255,
  },

  // Security Headers
  headers: {
    contentSecurityPolicy: {
      defaultSrc: "'self'",
      scriptSrc: "'self' 'unsafe-inline' 'unsafe-eval'",
      styleSrc: "'self' 'unsafe-inline'",
      imgSrc: "'self' data: https:",
      fontSrc: "'self'",
      connectSrc: "'self'",
      mediaSrc: "'self'",
      objectSrc: "'none'",
      frameSrc: "'none'",
      baseUri: "'self'",
      formAction: "'self'",
    },
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: false,
    },
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    maxFiles: 30, // Keep 30 days of logs
    maxSize: '20m', // Max 20MB per log file
  },

  // Sensitive endpoints that require additional protection
  sensitiveEndpoints: [
    '/api/ai/generate',
    '/api/ai/query',
    '/api/teacher/fake-tests/generate',
    '/api/students/fake-tests/generate',
    '/api/users',
    '/api/auth/change-password',
    '/api/admin',
  ],

  // Allowed file types for uploads
  allowedFileTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],

  // Password requirements
  passwordPolicy: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false,
  },
};