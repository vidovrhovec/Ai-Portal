/**
 * Core Web Vitals and Performance Monitoring
 * Implements real-time tracking and alerting for performance metrics
 */

// Core Web Vitals thresholds
export const PERFORMANCE_THRESHOLDS = {
  LCP: 2500, // Largest Contentful Paint (ms)
  FID: 100,  // First Input Delay (ms)
  CLS: 0.1,  // Cumulative Layout Shift
  FCP: 1800, // First Contentful Paint (ms)
  TTFB: 800, // Time to First Byte (ms)
};

// Performance metrics interface
export interface PerformanceMetrics {
  lcp?: number;
  fid?: number;
  cls?: number;
  fcp?: number;
  ttfb?: number;
  navigationTiming?: PerformanceNavigationTiming;
  paintTiming?: PerformanceEntry[];
}

// Alert levels
export enum AlertLevel {
  GOOD = 'good',
  NEEDS_IMPROVEMENT = 'needs-improvement',
  POOR = 'poor',
}

// Performance alert interface
export interface PerformanceAlert {
  metric: string;
  value: number;
  threshold: number;
  level: AlertLevel;
  timestamp: number;
  url: string;
}

/**
 * Performance monitoring utility functions
 */
export const performanceUtils = {
  /**
   * Measure custom performance metrics
   */
  measure: (name: string, startMark?: string, endMark?: string) => {
    if (typeof performance === 'undefined') return;

    try {
      if (startMark && endMark) {
        performance.measure(name, startMark, endMark);
      } else {
        performance.mark(name);
      }

      const measure = performance.getEntriesByName(name)[0] as PerformanceMeasure;
      return measure ? measure.duration : 0;
    } catch (error) {
      console.warn('Performance measurement failed:', error);
      return 0;
    }
  },

  /**
   * Start performance mark
   */
  startMark: (name: string) => {
    if (typeof performance !== 'undefined') {
      performance.mark(name);
    }
  },

  /**
   * End performance mark and measure
   */
  endMark: (name: string) => {
    if (typeof performance !== 'undefined') {
      performance.mark(`${name}-end`);
      return performanceUtils.measure(name, name, `${name}-end`);
    }
    return 0;
  },

  /**
   * Send metrics to monitoring service
   */
  reportMetrics: async (metrics: PerformanceMetrics) => {
    try {
      // In a real implementation, this would send to your monitoring service
      console.log('Performance metrics:', metrics);

      // Example: Send to analytics endpoint
      // await fetch('/api/analytics/performance', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(metrics),
      // });
    } catch (error) {
      console.error('Failed to report performance metrics:', error);
    }
  },

  /**
   * Check performance alerts
   */
  checkPerformanceAlerts: (currentMetrics: PerformanceMetrics): PerformanceAlert[] => {
    const newAlerts: PerformanceAlert[] = [];

    // Check each metric against thresholds
    Object.entries(PERFORMANCE_THRESHOLDS).forEach(([metric, threshold]) => {
      const value = currentMetrics[metric.toLowerCase() as keyof PerformanceMetrics] as number;

      if (value !== undefined) {
        let level: AlertLevel;

        if (metric === 'CLS') {
          level = value <= 0.1 ? AlertLevel.GOOD :
                 value <= 0.25 ? AlertLevel.NEEDS_IMPROVEMENT : AlertLevel.POOR;
        } else {
          level = value <= threshold ? AlertLevel.GOOD :
                 value <= threshold * 1.5 ? AlertLevel.NEEDS_IMPROVEMENT : AlertLevel.POOR;
        }

        if (level !== AlertLevel.GOOD) {
          newAlerts.push({
            metric: metric.toUpperCase(),
            value,
            threshold,
            level,
            timestamp: Date.now(),
            url: typeof window !== 'undefined' ? window.location.href : '',
          });
        }
      }
    });

    if (newAlerts.length > 0) {
      // Log alerts
      newAlerts.forEach(alert => {
        console.warn(`Performance Alert: ${alert.metric} = ${alert.value}ms (threshold: ${alert.threshold}ms)`);
      });
    }

    return newAlerts;
  },
};