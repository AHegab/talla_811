import { getEventQueue } from '../eventQueue';

/**
 * Page View Tracker
 *
 * Auto-track page views on route change:
 * - Track time on page
 * - Track exit pages
 * - Track scroll depth
 */

let pageStartTime: number = 0;
let currentUrl: string = '';
let maxScrollDepth: number = 0;

/**
 * Initialize page view tracking
 *
 * Call this once when the app loads
 */
export function initializePageViewTracker(): void {
  if (typeof window === 'undefined') {
    return;
  }

  // Track initial page view
  trackPageView();

  // Track page views on navigation
  window.addEventListener('popstate', handlePageChange);

  // Track time on page before unload
  window.addEventListener('beforeunload', trackPageExit);
  window.addEventListener('pagehide', trackPageExit);

  // Track scroll depth
  window.addEventListener('scroll', trackScrollDepth, { passive: true });
}

/**
 * Track page view
 */
function trackPageView(): void {
  const eventQueue = getEventQueue();
  const url = window.location.href;

  // Track exit from previous page
  if (currentUrl && currentUrl !== url) {
    trackPageExit();
  }

  // Reset tracking for new page
  pageStartTime = Date.now();
  currentUrl = url;
  maxScrollDepth = 0;

  // Track page view event
  eventQueue.addEvent('pageview', {
    url,
    path: window.location.pathname,
    title: document.title,
    referrer: document.referrer,
  });
}

/**
 * Track page exit
 */
function trackPageExit(): void {
  if (!pageStartTime || !currentUrl) {
    return;
  }

  const eventQueue = getEventQueue();
  const timeOnPage = Date.now() - pageStartTime;

  eventQueue.addEvent('page_exit', {
    url: currentUrl,
    path: window.location.pathname,
    timeOnPage,
    scrollDepth: maxScrollDepth,
  });
}

/**
 * Track scroll depth
 */
function trackScrollDepth(): void {
  const windowHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

  const scrollPercentage = Math.round(
    ((scrollTop + windowHeight) / documentHeight) * 100
  );

  maxScrollDepth = Math.max(maxScrollDepth, scrollPercentage);
}

/**
 * Handle page change
 */
function handlePageChange(): void {
  trackPageView();
}

/**
 * Get current scroll depth
 */
export function getCurrentScrollDepth(): number {
  return maxScrollDepth;
}

/**
 * Get time on current page
 */
export function getTimeOnPage(): number {
  if (!pageStartTime) {
    return 0;
  }

  return Date.now() - pageStartTime;
}

/**
 * Cleanup page view tracker
 */
export function destroyPageViewTracker(): void {
  if (typeof window === 'undefined') {
    return;
  }

  trackPageExit();

  window.removeEventListener('popstate', handlePageChange);
  window.removeEventListener('beforeunload', trackPageExit);
  window.removeEventListener('pagehide', trackPageExit);
  window.removeEventListener('scroll', trackScrollDepth);
}
