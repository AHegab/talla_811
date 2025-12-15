import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { getEventQueue } from './eventQueue';

/**
 * Analytics Provider - React Context
 *
 * Provides analytics tracking API to all components:
 * - trackEvent(): Track custom events
 * - trackPageView(): Track page views
 * - trackClick(): Track clicks
 * - setUserId(): Set user ID when user logs in
 */

export interface AnalyticsContextValue {
  trackEvent: (eventType: string, eventData: any) => void;
  trackPageView: (url: string, title: string) => void;
  trackClick: (element: string, target: string, additionalData?: any) => void;
  setUserId: (userId: string | undefined) => void;
}

const AnalyticsContext = createContext<AnalyticsContextValue | null>(null);

interface AnalyticsProviderProps {
  children: ReactNode;
  userId?: string;
}

export function AnalyticsProvider({ children, userId }: AnalyticsProviderProps) {
  const eventQueue = getEventQueue();

  // Set user ID when it changes
  useEffect(() => {
    if (userId) {
      eventQueue.setUserId(userId);
    }
  }, [userId, eventQueue]);

  // Track page view on mount and URL changes
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    // Track initial page view
    trackPageView(window.location.href, document.title);

    // Track page views on route changes
    const handleRouteChange = () => {
      trackPageView(window.location.href, document.title);
    };

    // Listen for popstate (browser back/forward)
    window.addEventListener('popstate', handleRouteChange);

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  /**
   * Track custom event
   *
   * @param eventType - Type of event (e.g., 'add_to_cart', 'search', 'filter_applied')
   * @param eventData - Event-specific data
   */
  const trackEvent = (eventType: string, eventData: any): void => {
    try {
      eventQueue.addEvent(eventType, eventData);
    } catch (error) {
      // Silently fail - don't disrupt user experience
    }
  };

  /**
   * Track page view
   *
   * @param url - Page URL
   * @param title - Page title
   */
  const trackPageView = (url: string, title: string): void => {
    try {
      eventQueue.addEvent('pageview', {
        url,
        title,
        referrer: typeof document !== 'undefined' ? document.referrer : '',
      });
    } catch (error) {
      // Silently fail
    }
  };

  /**
   * Track click event
   *
   * @param element - Element identifier (e.g., 'add_to_cart_button', 'product_link')
   * @param target - Click target URL or action
   * @param additionalData - Optional additional data
   */
  const trackClick = (element: string, target: string, additionalData?: any): void => {
    try {
      eventQueue.addEvent('click', {
        element,
        target,
        ...additionalData,
      });
    } catch (error) {
      // Silently fail
    }
  };

  /**
   * Set user ID (call when user logs in)
   *
   * @param userId - User ID (Shopify customer ID)
   */
  const setUserId = (userId: string | undefined): void => {
    try {
      eventQueue.setUserId(userId);
    } catch (error) {
      // Silently fail
    }
  };

  const value: AnalyticsContextValue = {
    trackEvent,
    trackPageView,
    trackClick,
    setUserId,
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
}

/**
 * Hook to access analytics context
 *
 * @returns Analytics context value
 * @throws Error if used outside AnalyticsProvider
 */
export function useAnalytics(): AnalyticsContextValue {
  const context = useContext(AnalyticsContext);

  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }

  return context;
}

/**
 * Optional hook that returns analytics context or null if not available
 *
 * Useful for components that may be rendered outside AnalyticsProvider
 *
 * @returns Analytics context value or null
 */
export function useOptionalAnalytics(): AnalyticsContextValue | null {
  return useContext(AnalyticsContext);
}
