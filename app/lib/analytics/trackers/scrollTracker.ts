import { getEventQueue } from '../eventQueue';

/**
 * Scroll Depth Tracker
 *
 * - Throttled scroll listener (250ms)
 * - Calculate scroll percentage
 * - Track max scroll depth per page
 * - Track scroll milestones (25%, 50%, 75%, 100%)
 */

let scrollTimeout: ReturnType<typeof setTimeout> | null = null;
let maxScrollDepth: number = 0;
let scrollMilestones: Set<number> = new Set();
const THROTTLE_MS = 250;
const MILESTONES = [25, 50, 75, 100];

/**
 * Initialize scroll tracking
 */
export function initializeScrollTracker(): void {
  if (typeof window === 'undefined') {
    return;
  }

  // Reset on initialization
  maxScrollDepth = 0;
  scrollMilestones.clear();

  // Attach scroll listener with throttling
  window.addEventListener('scroll', handleScroll, { passive: true });

  // Track initial scroll position
  trackScrollPosition();
}

/**
 * Handle scroll event (throttled)
 */
function handleScroll(): void {
  if (scrollTimeout) {
    return;
  }

  scrollTimeout = setTimeout(() => {
    trackScrollPosition();
    scrollTimeout = null;
  }, THROTTLE_MS);
}

/**
 * Track current scroll position
 */
function trackScrollPosition(): void {
  const scrollDepth = calculateScrollDepth();

  // Update max scroll depth
  if (scrollDepth > maxScrollDepth) {
    maxScrollDepth = scrollDepth;

    // Check for milestone achievement
    checkScrollMilestones(scrollDepth);
  }
}

/**
 * Calculate scroll depth percentage
 */
function calculateScrollDepth(): number {
  const windowHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

  // Handle edge case where document height equals window height
  if (documentHeight <= windowHeight) {
    return 100;
  }

  const scrollPercentage = Math.round(
    ((scrollTop + windowHeight) / documentHeight) * 100
  );

  return Math.min(scrollPercentage, 100);
}

/**
 * Check and track scroll milestones
 */
function checkScrollMilestones(currentDepth: number): void {
  const eventQueue = getEventQueue();

  MILESTONES.forEach(milestone => {
    if (currentDepth >= milestone && !scrollMilestones.has(milestone)) {
      scrollMilestones.add(milestone);

      // Track milestone event
      eventQueue.addEvent('scroll', {
        milestone,
        scrollDepth: currentDepth,
        url: window.location.href,
        path: window.location.pathname,
      });
    }
  });
}

/**
 * Get current scroll depth
 */
export function getCurrentScrollDepth(): number {
  return maxScrollDepth;
}

/**
 * Reset scroll tracking (call when navigating to new page)
 */
export function resetScrollTracker(): void {
  maxScrollDepth = 0;
  scrollMilestones.clear();
}

/**
 * Cleanup scroll tracker
 */
export function destroyScrollTracker(): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.removeEventListener('scroll', handleScroll);

  if (scrollTimeout) {
    clearTimeout(scrollTimeout);
    scrollTimeout = null;
  }

  maxScrollDepth = 0;
  scrollMilestones.clear();
}
