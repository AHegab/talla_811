import { getEventQueue } from '../eventQueue';

/**
 * Performance Tracker
 *
 * - Web Vitals: LCP, FID, CLS, FCP, TTFB
 * - Page load time
 * - Resource timing
 */

let performanceObserver: PerformanceObserver | null = null;
let clsValue = 0;
let clsEntries: PerformanceEntry[] = [];

/**
 * Initialize performance tracking
 */
export function initializePerformanceTracker(): void {
  if (typeof window === 'undefined') {
    return;
  }

  // Check if Performance API is available
  if (!('performance' in window)) {
    return;
  }

  // Track initial page load metrics
  trackPageLoadMetrics();

  // Track Web Vitals
  trackLCP();
  trackFID();
  trackCLS();
  trackFCP();
  trackTTFB();
}

/**
 * Track page load metrics
 */
function trackPageLoadMetrics(): void {
  // Wait for load event
  if (document.readyState === 'complete') {
    capturePageLoadMetrics();
  } else {
    window.addEventListener('load', capturePageLoadMetrics, { once: true });
  }
}

/**
 * Capture page load metrics
 */
function capturePageLoadMetrics(): void {
  const eventQueue = getEventQueue();
  const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

  if (!perfData) {
    return;
  }

  eventQueue.addEvent('performance', {
    metric: 'page_load',
    domContentLoaded: Math.round(perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart),
    loadComplete: Math.round(perfData.loadEventEnd - perfData.loadEventStart),
    domInteractive: Math.round(perfData.domInteractive),
    domComplete: Math.round(perfData.domComplete),
    transferSize: perfData.transferSize,
    encodedBodySize: perfData.encodedBodySize,
    decodedBodySize: perfData.decodedBodySize,
  });
}

/**
 * Track Largest Contentful Paint (LCP)
 */
function trackLCP(): void {
  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as any;

      if (lastEntry) {
        const eventQueue = getEventQueue();
        eventQueue.addEvent('performance', {
          metric: 'LCP',
          value: Math.round(lastEntry.renderTime || lastEntry.loadTime),
          element: lastEntry.element?.tagName || 'unknown',
        });
      }
    });

    observer.observe({ type: 'largest-contentful-paint', buffered: true });
  } catch (error) {
    // LCP not supported in this browser
  }
}

/**
 * Track First Input Delay (FID)
 */
function trackFID(): void {
  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();

      entries.forEach((entry: any) => {
        const eventQueue = getEventQueue();
        eventQueue.addEvent('performance', {
          metric: 'FID',
          value: Math.round(entry.processingStart - entry.startTime),
          eventType: entry.name,
        });
      });
    });

    observer.observe({ type: 'first-input', buffered: true });
  } catch (error) {
    // FID not supported in this browser
  }
}

/**
 * Track Cumulative Layout Shift (CLS)
 */
function trackCLS(): void {
  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();

      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          clsEntries.push(entry);
        }
      });
    });

    observer.observe({ type: 'layout-shift', buffered: true });

    // Report CLS when page is about to unload
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        reportCLS();
      }
    });

    window.addEventListener('pagehide', reportCLS);
  } catch (error) {
    // CLS not supported in this browser
  }
}

/**
 * Report CLS value
 */
function reportCLS(): void {
  if (clsValue === 0) {
    return;
  }

  const eventQueue = getEventQueue();
  eventQueue.addEvent('performance', {
    metric: 'CLS',
    value: Math.round(clsValue * 1000) / 1000,
    entries: clsEntries.length,
  });
}

/**
 * Track First Contentful Paint (FCP)
 */
function trackFCP(): void {
  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();

      entries.forEach((entry: any) => {
        if (entry.name === 'first-contentful-paint') {
          const eventQueue = getEventQueue();
          eventQueue.addEvent('performance', {
            metric: 'FCP',
            value: Math.round(entry.startTime),
          });
        }
      });
    });

    observer.observe({ type: 'paint', buffered: true });
  } catch (error) {
    // FCP not supported in this browser
  }
}

/**
 * Track Time to First Byte (TTFB)
 */
function trackTTFB(): void {
  try {
    const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

    if (!perfData) {
      return;
    }

    const ttfb = perfData.responseStart - perfData.requestStart;

    const eventQueue = getEventQueue();
    eventQueue.addEvent('performance', {
      metric: 'TTFB',
      value: Math.round(ttfb),
    });
  } catch (error) {
    // TTFB not available
  }
}

/**
 * Track resource timing (optional)
 */
export function trackResourceTiming(): void {
  try {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

    // Only track slow resources (> 1 second)
    const slowResources = resources.filter(resource => resource.duration > 1000);

    if (slowResources.length > 0) {
      const eventQueue = getEventQueue();

      slowResources.forEach(resource => {
        eventQueue.addEvent('performance', {
          metric: 'slow_resource',
          url: resource.name,
          duration: Math.round(resource.duration),
          size: resource.transferSize,
          type: resource.initiatorType,
        });
      });
    }
  } catch (error) {
    // Resource timing not available
  }
}

/**
 * Cleanup performance tracker
 */
export function destroyPerformanceTracker(): void {
  if (performanceObserver) {
    performanceObserver.disconnect();
    performanceObserver = null;
  }

  clsValue = 0;
  clsEntries = [];
}
