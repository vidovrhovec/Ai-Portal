import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import { securityConfig } from './security-config';

// Initialize DOMPurify with JSDOM for server-side usage
const window = new JSDOM('').window;
const DOMPurifyServer = DOMPurify(window as any);

/**
 * Sanitizes HTML content to prevent XSS attacks
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurifyServer.sanitize(dirty, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'code', 'pre'],
    ALLOWED_ATTR: [],
    ALLOW_DATA_ATTR: false,
  });
}

/**
 * Sanitizes AI query input to prevent prompt injection
 */
export function sanitizeAIQuery(query: string): string {
  if (!query || typeof query !== 'string') {
    return '';
  }

  // Remove or escape potentially dangerous patterns
  const sanitized = query
    // Remove system prompt injection attempts
    .replace(/system:\s*/gi, '')
    .replace(/assistant:\s*/gi, '')
    .replace(/user:\s*/gi, '')
    // Remove role-based injection patterns
    .replace(/###\s*(system|assistant|user)/gi, '')
    // Remove markdown code blocks that might contain instructions
    .replace(/```\w*\n[\s\S]*?\n```/g, '[CODE_BLOCK_REMOVED]')
    // Remove potential instruction separators
    .replace(/---+\n?/g, '')
    .replace(/\*\*\*+\n?/g, '')
    // Limit length to prevent extremely long prompts
    .substring(0, securityConfig.sanitization.maxQueryLength)
    // Trim whitespace
    .trim();

  // Ensure the query is not empty after sanitization
  if (!sanitized) {
    return 'Please provide a valid query.';
  }

  return sanitized;
}

/**
 * Sanitizes chat messages for group communication
 */
export function sanitizeChatMessage(message: string): string {
  if (!message || typeof message !== 'string') {
    return '';
  }

  // First sanitize HTML/XSS
  const htmlSanitized = sanitizeHtml(message);

  // Additional chat-specific sanitization
  return htmlSanitized
    // Remove excessive whitespace
    .replace(/\s+/g, ' ')
    .trim()
    // Limit message length
    .substring(0, securityConfig.sanitization.maxMessageLength);
}

/**
 * Validates and sanitizes user input for database operations
 */
export function sanitizeUserInput(input: string, maxLength: number = securityConfig.sanitization.maxQueryLength): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return input
    // Remove null bytes and other control characters
    .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
    // Trim whitespace
    .trim()
    // Limit length
    .substring(0, maxLength);
}

/**
 * Sanitizes file names for uploads
 */
export function sanitizeFileName(fileName: string): string {
  if (!fileName || typeof fileName !== 'string') {
    return 'unnamed_file';
  }

  return fileName
    // Remove path traversal attempts
    .replace(/(\.\.[\/\\])+/, '')
    // Remove dangerous characters
    .replace(/[<>:"|?*\x00-\x1f]/g, '_')
    // Replace multiple dots with single dot
    .replace(/\.{2,}/g, '.')
    // Limit length
    .substring(0, securityConfig.sanitization.maxFileNameLength)
    // Ensure it's not empty
    || 'unnamed_file';
}