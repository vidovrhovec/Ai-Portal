import winston from 'winston';
import { securityConfig } from './security-config';
import fs from 'fs';
import path from 'path';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Add colors to winston
winston.addColors(colors);

/**
 * Parse size string (e.g., '20m', '1g') to bytes
 */
function parseSize(sizeStr: string): number {
  const units: { [key: string]: number } = {
    k: 1024,
    m: 1024 * 1024,
    g: 1024 * 1024 * 1024,
  };

  const match = sizeStr.toLowerCase().match(/^(\d+)([kmg]?)$/);
  if (!match) return 20 * 1024 * 1024; // Default 20MB

  const [, num, unit] = match;
  const multiplier = units[unit] || 1;
  return parseInt(num, 10) * multiplier;
}

// Check if we're in Edge Runtime
const isEdgeRuntime = typeof window !== 'undefined' || process.env.NEXT_RUNTIME === 'edge';

// Simple Edge Runtime compatible logger
class EdgeLogger {
  private level: string;

  constructor(level: string = 'info') {
    this.level = level;
  }

  private shouldLog(level: string): boolean {
    const levels = ['error', 'warn', 'info', 'http', 'debug'];
    const currentLevelIndex = levels.indexOf(this.level);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex <= currentLevelIndex;
  }

  private formatMessage(level: string, message: string, meta?: Record<string, unknown>): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaStr}`;
  }

  error(message: string, meta?: Record<string, unknown>) {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message, meta));
    }
  }

  warn(message: string, meta?: Record<string, unknown>) {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, meta));
    }
  }

  info(message: string, meta?: Record<string, unknown>) {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message, meta));
    }
  }

  http(message: string, meta?: Record<string, unknown>) {
    if (this.shouldLog('http')) {
      console.log(this.formatMessage('http', message, meta));
    }
  }

  debug(message: string, meta?: Record<string, unknown>) {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message, meta));
    }
  }
}

// Create appropriate logger based on runtime
let logger: winston.Logger | EdgeLogger;

if (isEdgeRuntime) {
  // Use simple console-based logger for Edge Runtime
  logger = new EdgeLogger(securityConfig.logging.level);
} else {
  // Use Winston for Node.js runtime
  logger = winston.createLogger({
    level: securityConfig.logging.level,
    levels,
    format: winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.json()
    ),
    defaultMeta: { service: 'ai-learning-portal' },
    transports: [
      // Write all logs with importance level of `error` or less to `error.log`
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        maxsize: parseSize(securityConfig.logging.maxSize),
        maxFiles: securityConfig.logging.maxFiles
      }),
      // Write all logs with importance level of `info` or less to `combined.log`
      new winston.transports.File({
        filename: 'logs/combined.log',
        maxsize: parseSize(securityConfig.logging.maxSize),
        maxFiles: securityConfig.logging.maxFiles
      }),
      // Always include console transport for development
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
      }),
    ],
  });
}

// Create a stream for Morgan HTTP logging (only available in Node.js runtime)
export const stream = !isEdgeRuntime ? {
  write: (message: string) => {
    logger.http(message.trim());
  },
} : {
  write: (message: string) => {
    console.log(`HTTP: ${message.trim()}`);
  },
};

// Security-specific logging functions
export const securityLogger = {
  suspiciousActivity: (message: string, metadata?: Record<string, unknown>) => {
    logger.warn('SECURITY: Suspicious activity detected', { message, ...metadata });
  },

  rateLimitExceeded: (ip: string, endpoint: string) => {
    logger.warn('SECURITY: Rate limit exceeded', { ip, endpoint });
  },

  authFailure: (message: string, metadata?: Record<string, unknown>) => {
    logger.warn('SECURITY: Authentication failure', { message, ...metadata });
  },

  inputSanitization: (original: string, sanitized: string, reason: string) => {
    logger.debug('SECURITY: Input sanitized', { original, sanitized, reason });
  },

  csrfViolation: (sessionId: string, token: string) => {
    logger.error('SECURITY: CSRF violation detected', { sessionId, token });
  },

  xssAttempt: (input: string, userId?: string) => {
    logger.warn('SECURITY: Potential XSS attempt detected', { input, userId });
  },
};

/**
 * Log errors to workflow memory files for tracking and debugging
 */
export const workflowErrorLogger = {
  logLocalError: (error: Error | string, context?: Record<string, unknown>) => {
    try {
      const errorEntry = {
        timestamp: new Date().toISOString(),
        error: typeof error === 'string' ? error : error.message,
        stack: typeof error === 'object' ? error.stack : undefined,
        context,
        phase: 'security-fix',
      };

      const localErrorsPath = path.join(process.cwd(), '.workflow/memory/local_errors.json');

      // Ensure directory exists
      const dir = path.dirname(localErrorsPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Read existing errors
      let errors: any[] = [];
      if (fs.existsSync(localErrorsPath)) {
        try {
          const data = fs.readFileSync(localErrorsPath, 'utf8');
          errors = JSON.parse(data);
        } catch (_e) {
          // If file is corrupted, start fresh
          errors = [];
        }
      }

      // Add new error
      errors.push(errorEntry);

      // Keep only last 100 errors
      if (errors.length > 100) {
        errors = errors.slice(-100);
      }

      // Write back
      fs.writeFileSync(localErrorsPath, JSON.stringify(errors, null, 2));

      logger.error('Workflow error logged locally', { error: errorEntry.error, context });
    } catch (logError) {
      logger.error('Failed to log workflow error locally', { logError, originalError: error });
    }
  },

  logGlobalError: (error: Error | string, context?: Record<string, unknown>) => {
    try {
      const errorEntry = {
        timestamp: new Date().toISOString(),
        project: 'ai-ucni-portal',
        error: typeof error === 'string' ? error : error.message,
        stack: typeof error === 'object' ? error.stack : undefined,
        context,
        phase: 'security-fix',
      };

      const globalErrorsPath = path.join(process.env.HOME || '~', '.kilocode/global_errors.json');

      // Ensure directory exists
      const dir = path.dirname(globalErrorsPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Read existing errors
      let errors: any[] = [];
      if (fs.existsSync(globalErrorsPath)) {
        try {
          const data = fs.readFileSync(globalErrorsPath, 'utf8');
          errors = JSON.parse(data);
        } catch (_e) {
          // If file is corrupted, start fresh
          errors = [];
        }
      }

      // Add new error
      errors.push(errorEntry);

      // Keep only last 200 errors
      if (errors.length > 200) {
        errors = errors.slice(-200);
      }

      // Write back
      fs.writeFileSync(globalErrorsPath, JSON.stringify(errors, null, 2));

      logger.error('Workflow error logged globally', { error: errorEntry.error, context });
    } catch (logError) {
      logger.error('Failed to log workflow error globally', { logError, originalError: error });
    }
  },

  logError: (error: Error | string, context?: Record<string, unknown>) => {
    workflowErrorLogger.logLocalError(error, context);
    workflowErrorLogger.logGlobalError(error, context);
  },
};

export default logger;