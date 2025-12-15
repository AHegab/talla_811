import { initializePageViewTracker } from './trackers/pageViewTracker';
import { initializeClickTracker } from './trackers/clickTracker';
import { initializeScrollTracker } from './trackers/scrollTracker';
import { initializeMouseTracker } from './trackers/mouseTracker';
import { initializeFormTracker } from './trackers/formTracker';
import { initializePerformanceTracker } from './trackers/performanceTracker';

/**
 * Initialize Analytics System
 *
 * Call this once when the app loads (in entry.client.tsx)
 * - Initialize SessionManager
 * - Attach event listeners (clicks, scrolls, beforeunload)
 * - Track initial pageview
 */

let isInitialized = false;

/**
 * Initialize all analytics trackers
 */
export function initializeAnalytics(): void {
  if (typeof window === 'undefined') {
    return;
  }

  if (isInitialized) {
    return;
  }

  try {
    // Initialize all trackers
    initializePageViewTracker();
    initializeClickTracker();
    initializeScrollTracker();
    initializeMouseTracker(); // Only initializes for 10% of users
    initializeFormTracker();
    initializePerformanceTracker();

    isInitialized = true;
  } catch (error) {
    // Silently fail - don't disrupt user experience
    // Analytics not available, but app continues to work
  }
}

/**
 * Check if analytics is initialized
 */
export function isAnalyticsInitialized(): boolean {
  return isInitialized;
}
