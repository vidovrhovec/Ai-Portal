/**
 * Security Monitoring and Anomaly Detection
 * Implements real-time security event logging and monitoring
 */

import { securityLogger } from './logger';

// Security event types
export enum SecurityEventType {
  AUTH_FAILURE = 'auth_failure',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  XSS_ATTEMPT = 'xss_attempt',
  CSRF_VIOLATION = 'csrf_violation',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  SQL_INJECTION_ATTEMPT = 'sql_injection_attempt',
  FILE_UPLOAD_VIOLATION = 'file_upload_violation',
}

// Security event interface
export interface SecurityEvent {
  type: SecurityEventType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  metadata: Record<string, unknown>;
  ip?: string;
  userId?: string;
  userAgent?: string;
  timestamp: number;
  url?: string;
}

// Anomaly detection patterns
export interface AnomalyPattern {
  id: string;
  name: string;
  description: string;
  condition: (events: SecurityEvent[]) => boolean;
  severity: SecurityEvent['severity'];
  cooldownMs: number; // Minimum time between alerts
}

// Security monitoring class
export class SecurityMonitor {
  private events: SecurityEvent[] = [];
  private maxEventsStored = 1000;
  private anomalyPatterns: AnomalyPattern[] = [];
  private lastAlertTimes: Map<string, number> = new Map();

  constructor() {
    this.initializeAnomalyPatterns();
  }

  /**
   * Log a security event
   */
  logEvent(event: Omit<SecurityEvent, 'timestamp'>): void {
    const securityEvent: SecurityEvent = {
      ...event,
      timestamp: Date.now(),
    };

    // Store event
    this.events.push(securityEvent);

    // Keep only recent events
    if (this.events.length > this.maxEventsStored) {
      this.events = this.events.slice(-this.maxEventsStored);
    }

    // Log to Winston
    this.logToWinston(securityEvent);

    // Check for anomalies
    this.checkAnomalies();
  }

  /**
   * Get recent security events
   */
  getRecentEvents(limit = 100): SecurityEvent[] {
    return this.events.slice(-limit);
  }

  /**
   * Get events by type
   */
  getEventsByType(type: SecurityEventType, limit = 50): SecurityEvent[] {
    return this.events
      .filter(event => event.type === type)
      .slice(-limit);
  }

  /**
   * Get security statistics
   */
  getStatistics(timeRangeMs = 24 * 60 * 60 * 1000) { // 24 hours
    const cutoffTime = Date.now() - timeRangeMs;
    const recentEvents = this.events.filter(event => event.timestamp > cutoffTime);

    const stats = {
      totalEvents: recentEvents.length,
      byType: {} as Record<SecurityEventType, number>,
      bySeverity: {} as Record<string, number>,
      topIPs: [] as Array<{ ip: string; count: number }>,
      topUserIds: [] as Array<{ userId: string; count: number }>,
    };

    // Count by type and severity
    recentEvents.forEach(event => {
      stats.byType[event.type] = (stats.byType[event.type] || 0) + 1;
      stats.bySeverity[event.severity] = (stats.bySeverity[event.severity] || 0) + 1;
    });

    // Top IPs
    const ipCounts: Record<string, number> = {};
    recentEvents.forEach(event => {
      if (event.ip) {
        ipCounts[event.ip] = (ipCounts[event.ip] || 0) + 1;
      }
    });
    stats.topIPs = Object.entries(ipCounts)
      .map(([ip, count]) => ({ ip, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Top user IDs
    const userIdCounts: Record<string, number> = {};
    recentEvents.forEach(event => {
      if (event.userId) {
        userIdCounts[event.userId] = (userIdCounts[event.userId] || 0) + 1;
      }
    });
    stats.topUserIds = Object.entries(userIdCounts)
      .map(([userId, count]) => ({ userId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return stats;
  }

  private logToWinston(event: SecurityEvent): void {
    const logData = {
      type: event.type,
      severity: event.severity,
      message: event.message,
      metadata: event.metadata,
      ip: event.ip,
      userId: event.userId,
      userAgent: event.userAgent,
      url: event.url,
    };

    switch (event.type) {
      case SecurityEventType.AUTH_FAILURE:
        securityLogger.authFailure(event.message, logData);
        break;
      case SecurityEventType.RATE_LIMIT_EXCEEDED:
        if (event.ip) {
          securityLogger.rateLimitExceeded(event.ip, event.url || 'unknown');
        }
        break;
      case SecurityEventType.SUSPICIOUS_ACTIVITY:
        securityLogger.suspiciousActivity(event.message, logData);
        break;
      case SecurityEventType.XSS_ATTEMPT:
        if (event.metadata.input) {
          securityLogger.xssAttempt(event.metadata.input as string, event.userId);
        }
        break;
      case SecurityEventType.CSRF_VIOLATION:
        if (event.metadata.sessionId && event.metadata.token) {
          securityLogger.csrfViolation(
            event.metadata.sessionId as string,
            event.metadata.token as string
          );
        }
        break;
      default:
        console.warn('Unhandled security event type:', event.type, logData);
    }
  }

  private initializeAnomalyPatterns(): void {
    this.anomalyPatterns = [
      {
        id: 'brute_force_auth',
        name: 'Brute Force Authentication',
        description: 'Multiple authentication failures from same IP',
        condition: (events) => {
          const recentAuthFailures = events.filter(
            e => e.type === SecurityEventType.AUTH_FAILURE &&
                 e.timestamp > Date.now() - 15 * 60 * 1000 // 15 minutes
          );

          const ipGroups = recentAuthFailures.reduce((groups, event) => {
            if (event.ip) {
              groups[event.ip] = (groups[event.ip] || 0) + 1;
            }
            return groups;
          }, {} as Record<string, number>);

          return Object.values(ipGroups).some(count => count >= 5);
        },
        severity: 'high',
        cooldownMs: 30 * 60 * 1000, // 30 minutes
      },
      {
        id: 'rate_limit_abuse',
        name: 'Rate Limit Abuse',
        description: 'Excessive rate limit violations from same IP',
        condition: (events) => {
          const recentRateLimits = events.filter(
            e => e.type === SecurityEventType.RATE_LIMIT_EXCEEDED &&
                 e.timestamp > Date.now() - 60 * 60 * 1000 // 1 hour
          );

          const ipGroups = recentRateLimits.reduce((groups, event) => {
            if (event.ip) {
              groups[event.ip] = (groups[event.ip] || 0) + 1;
            }
            return groups;
          }, {} as Record<string, number>);

          return Object.values(ipGroups).some(count => count >= 10);
        },
        severity: 'medium',
        cooldownMs: 60 * 60 * 1000, // 1 hour
      },
      {
        id: 'xss_attack_pattern',
        name: 'XSS Attack Pattern',
        description: 'Multiple XSS attempts detected',
        condition: (events) => {
          const recentXSS = events.filter(
            e => e.type === SecurityEventType.XSS_ATTEMPT &&
                 e.timestamp > Date.now() - 30 * 60 * 1000 // 30 minutes
          );

          return recentXSS.length >= 3;
        },
        severity: 'high',
        cooldownMs: 60 * 60 * 1000, // 1 hour
      },
      {
        id: 'suspicious_user_activity',
        name: 'Suspicious User Activity',
        description: 'Unusual activity patterns from single user',
        condition: (events) => {
          const recentSuspicious = events.filter(
            e => e.type === SecurityEventType.SUSPICIOUS_ACTIVITY &&
                 e.timestamp > Date.now() - 60 * 60 * 1000 // 1 hour
          );

          const userGroups = recentSuspicious.reduce((groups, event) => {
            if (event.userId) {
              groups[event.userId] = (groups[event.userId] || 0) + 1;
            }
            return groups;
          }, {} as Record<string, number>);

          return Object.values(userGroups).some(count => count >= 5);
        },
        severity: 'medium',
        cooldownMs: 2 * 60 * 60 * 1000, // 2 hours
      },
    ];
  }

  private checkAnomalies(): void {
    const recentEvents = this.events.filter(
      e => e.timestamp > Date.now() - 60 * 60 * 1000 // Last hour
    );

    this.anomalyPatterns.forEach(pattern => {
      const lastAlert = this.lastAlertTimes.get(pattern.id) || 0;
      const timeSinceLastAlert = Date.now() - lastAlert;

      if (timeSinceLastAlert > pattern.cooldownMs && pattern.condition(recentEvents)) {
        // Trigger anomaly alert
        this.triggerAnomalyAlert(pattern);

        // Update last alert time
        this.lastAlertTimes.set(pattern.id, Date.now());
      }
    });
  }

  private triggerAnomalyAlert(pattern: AnomalyPattern): void {
    const alertEvent: SecurityEvent = {
      type: SecurityEventType.SUSPICIOUS_ACTIVITY,
      severity: pattern.severity,
      message: `Security anomaly detected: ${pattern.name}`,
      metadata: {
        anomalyId: pattern.id,
        description: pattern.description,
        pattern: pattern,
      },
      timestamp: Date.now(),
    };

    // Log the anomaly
    this.logEvent(alertEvent);

    // Could send notification to security team
    console.error('🚨 SECURITY ANOMALY DETECTED:', {
      pattern: pattern.name,
      description: pattern.description,
      severity: pattern.severity,
    });
  }
}

// Global security monitor instance
export const securityMonitor = new SecurityMonitor();

// Utility functions for common security events
export const securityUtils = {
  logAuthFailure: (message: string, metadata: Record<string, unknown> = {}) => {
    securityMonitor.logEvent({
      type: SecurityEventType.AUTH_FAILURE,
      severity: 'medium',
      message,
      metadata,
      ip: metadata.ip as string,
      userId: metadata.userId as string,
      userAgent: metadata.userAgent as string,
      url: metadata.url as string,
    });
  },

  logRateLimitExceeded: (ip: string, endpoint: string) => {
    securityMonitor.logEvent({
      type: SecurityEventType.RATE_LIMIT_EXCEEDED,
      severity: 'low',
      message: `Rate limit exceeded for ${endpoint}`,
      metadata: { endpoint },
      ip,
    });
  },

  logSuspiciousActivity: (message: string, metadata: Record<string, unknown> = {}) => {
    securityMonitor.logEvent({
      type: SecurityEventType.SUSPICIOUS_ACTIVITY,
      severity: 'medium',
      message,
      metadata,
      ip: metadata.ip as string,
      userId: metadata.userId as string,
    });
  },

  logXSSAttempt: (input: string, userId?: string, ip?: string) => {
    securityMonitor.logEvent({
      type: SecurityEventType.XSS_ATTEMPT,
      severity: 'high',
      message: 'Potential XSS attempt detected',
      metadata: { input },
      userId,
      ip,
    });
  },

  logCSRFViolation: (sessionId: string, token: string) => {
    securityMonitor.logEvent({
      type: SecurityEventType.CSRF_VIOLATION,
      severity: 'high',
      message: 'CSRF violation detected',
      metadata: { sessionId, token },
    });
  },

  logUnauthorizedAccess: (message: string, metadata: Record<string, unknown> = {}) => {
    securityMonitor.logEvent({
      type: SecurityEventType.UNAUTHORIZED_ACCESS,
      severity: 'high',
      message,
      metadata,
      ip: metadata.ip as string,
      userId: metadata.userId as string,
    });
  },
};