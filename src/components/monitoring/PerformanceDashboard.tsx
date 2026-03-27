'use client';

import { useEffect, useState } from 'react';
import {
  PerformanceMetrics,
  PerformanceAlert,
  AlertLevel,
  performanceUtils,
} from '@/lib/performance-monitoring';

// Type definitions for performance entries
interface LayoutShift extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}

interface PerformanceEventTiming extends PerformanceEntry {
  processingStart: number;
}

/**
 * Hook for monitoring Core Web Vitals
 */
export function useCoreWebVitals() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({});
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const newMetrics: Partial<PerformanceMetrics> = {};

      entries.forEach((entry) => {
        switch (entry.entryType) {
          case 'largest-contentful-paint':
            newMetrics.lcp = entry.startTime;
            break;
          case 'first-input':
            newMetrics.fid = (entry as PerformanceEventTiming).processingStart - entry.startTime;
            break;
          case 'layout-shift':
            if (!(entry as LayoutShift).hadRecentInput) {
              newMetrics.cls = (newMetrics.cls || 0) + (entry as LayoutShift).value;
            }
            break;
          case 'paint':
            if (!newMetrics.paintTiming) {
              newMetrics.paintTiming = [];
            }
            newMetrics.paintTiming.push(entry);
            if (entry.name === 'first-contentful-paint') {
              newMetrics.fcp = entry.startTime;
            }
            break;
          case 'navigation':
            newMetrics.navigationTiming = entry as PerformanceNavigationTiming;
            newMetrics.ttfb = (entry as PerformanceNavigationTiming).responseStart;
            break;
        }
      });

      setMetrics(prev => ({ ...prev, ...newMetrics }));

      // Check for alerts
      const currentMetrics = { ...metrics, ...newMetrics };
      const newAlerts = performanceUtils.checkPerformanceAlerts(currentMetrics);
      if (newAlerts.length > 0) {
        setAlerts(prev => [...prev, ...newAlerts]);
      }
    });

    // Observe performance entries
    try {
      observer.observe({
        entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift', 'paint', 'navigation']
      });
    } catch (error) {
      console.warn('Performance observer failed:', error);
    }

    // Get navigation timing on load (move to separate effect to avoid cascading renders)
    const loadInitialMetrics = () => {
      if (performance.getEntriesByType) {
        const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
        if (navEntries.length > 0) {
          setMetrics(prev => ({
            ...prev,
            navigationTiming: navEntries[0],
            ttfb: navEntries[0].responseStart,
          }));
        }
      }
    };
    
    // Load initial metrics after observer is set up
    setTimeout(loadInitialMetrics, 0);

    return () => observer.disconnect();
  }, [metrics]);

  return { metrics, alerts };
}

/**
 * React component for displaying performance metrics
 */
export function PerformanceDashboard({ 
  metrics, 
  alerts 
}: { 
  metrics: PerformanceMetrics; 
  alerts: PerformanceAlert[] 
}) {
  const getStatusColor = (level: AlertLevel) => {
    switch (level) {
      case AlertLevel.GOOD: return 'text-green-600';
      case AlertLevel.NEEDS_IMPROVEMENT: return 'text-yellow-600';
      case AlertLevel.POOR: return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const formatMetric = (value: number | undefined, unit: string = 'ms') => {
    return value ? `${value.toFixed(2)}${unit}` : 'N/A';
  };

  return (
    <div className="performance-dashboard p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Core Web Vitals</h3>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {formatMetric(metrics.lcp)}
          </div>
          <div className="text-sm text-gray-600">LCP</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {formatMetric(metrics.fid)}
          </div>
          <div className="text-sm text-gray-600">FID</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {formatMetric(metrics.cls, '')}
          </div>
          <div className="text-sm text-gray-600">CLS</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">
            {formatMetric(metrics.fcp)}
          </div>
          <div className="text-sm text-gray-600">FCP</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-indigo-600">
            {formatMetric(metrics.ttfb)}
          </div>
          <div className="text-sm text-gray-600">TTFB</div>
        </div>
      </div>

      {alerts.length > 0 && (
        <div className="alerts-section">
          <h4 className="text-md font-semibold mb-2">Performance Alerts</h4>
          <div className="space-y-2">
            {alerts.slice(-5).map((alert, index) => (
              <div key={index} className={`p-2 rounded ${getStatusColor(alert.level)} bg-opacity-10`}>
                <div className="text-sm">
                  <strong>{alert.metric}:</strong> {alert.value.toFixed(2)}
                  {alert.metric === 'CLS' ? '' : 'ms'} (threshold: {alert.threshold}
                  {alert.metric === 'CLS' ? '' : 'ms'})
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}