import { getSessionId, getAnonymousId, updateSessionActivity } from './sessionManager';

/**
 * Event Queue for Analytics
 *
 * Client-side batching:
 * - Queue events in memory (max 20 events or 30 seconds)
 * - Flush on: page unload, queue full, timeout
 * - Use navigator.sendBeacon() for reliable unload sending
 * - Retry failed sends with exponential backoff
 */

export interface AnalyticsEvent {
  eventType: string;
  eventData: any;
  timestamp: number;
  page: {
    url: string;
    path: string;
    title: string;
    referrer: string;
  };
}

export interface EventBatch {
  sessionId: string;
  anonymousId: string;
  userId?: string;
  events: AnalyticsEvent[];
  context: {
    userAgent: string;
    screenSize: {
      width: number;
      height: number;
    };
    deviceType: string;
  };
}

const MAX_QUEUE_SIZE = 20;
const FLUSH_INTERVAL_MS = 30000; // 30 seconds
const API_ENDPOINT = '/api/analytics/events';
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000;

class EventQueue {
  private queue: AnalyticsEvent[] = [];
  private flushTimer: ReturnType<typeof setTimeout> | null = null;
  private userId: string | undefined;
  private isFlushing = false;
  private retryCount = 0;
  private unloadListenerAttached = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.attachUnloadListener();
      this.startFlushTimer();
    }
  }

  /**
   * Add event to queue
   *
   * @param eventType - Type of event (e.g., 'pageview', 'click', 'add_to_cart')
   * @param eventData - Event-specific data
   */
  public addEvent(eventType: string, eventData: any): void {
    if (typeof window === 'undefined') {
      return;
    }

    // Update session activity
    updateSessionActivity();

    // Get current page info
    const page = {
      url: window.location.href,
      path: window.location.pathname,
      title: document.title,
      referrer: document.referrer,
    };

    const event: AnalyticsEvent = {
      eventType,
      eventData,
      timestamp: Date.now(),
      page,
    };

    this.queue.push(event);

    // Flush if queue is full
    if (this.queue.length >= MAX_QUEUE_SIZE) {
      this.flush();
    }
  }

  /**
   * Set user ID (when user logs in)
   */
  public setUserId(userId: string | undefined): void {
    this.userId = userId;

    // Flush existing events before changing user ID
    if (this.queue.length > 0) {
      this.flush();
    }
  }

  /**
   * Flush events to server
   */
  public async flush(): Promise<void> {
    if (this.isFlushing || this.queue.length === 0) {
      return;
    }

    this.isFlushing = true;

    try {
      const batch = this.createBatch();

      // Try to send with fetch
      const success = await this.sendBatch(batch);

      if (success) {
        // Clear queue on success
        this.queue = [];
        this.retryCount = 0;
      } else {
        // Retry logic
        await this.handleRetry();
      }
    } catch (error) {
      // Ignore errors, don't want to disrupt user experience
      await this.handleRetry();
    } finally {
      this.isFlushing = false;
    }
  }

  /**
   * Flush on page unload (uses sendBeacon for reliability)
   */
  private flushOnUnload = (): void => {
    if (this.queue.length === 0) {
      return;
    }

    const batch = this.createBatch();
    const data = JSON.stringify(batch);

    // Use sendBeacon for reliable sending during page unload
    if (navigator.sendBeacon) {
      navigator.sendBeacon(API_ENDPOINT, data);
    } else {
      // Fallback to synchronous XHR (not recommended but necessary)
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', API_ENDPOINT, false); // Synchronous
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(data);
      } catch (error) {
        // Ignore errors
      }
    }

    // Clear queue
    this.queue = [];
  };

  /**
   * Create batch payload
   */
  private createBatch(): EventBatch {
    const sessionId = getSessionId();
    const anonymousId = getAnonymousId();

    return {
      sessionId,
      anonymousId,
      userId: this.userId,
      events: [...this.queue], // Clone array
      context: {
        userAgent: navigator.userAgent,
        screenSize: {
          width: window.screen.width,
          height: window.screen.height,
        },
        deviceType: this.getDeviceType(),
      },
    };
  }

  /**
   * Send batch to server
   */
  private async sendBatch(batch: EventBatch): Promise<boolean> {
    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(batch),
        keepalive: true, // Keep connection alive during page transitions
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Handle retry logic with exponential backoff
   */
  private async handleRetry(): Promise<void> {
    if (this.retryCount >= MAX_RETRIES) {
      // Give up after max retries
      this.queue = [];
      this.retryCount = 0;
      return;
    }

    this.retryCount++;
    const delay = INITIAL_RETRY_DELAY * Math.pow(2, this.retryCount - 1);

    // Wait before retrying
    await new Promise((resolve) => setTimeout(resolve, delay));

    // Retry flush
    this.isFlushing = false;
    await this.flush();
  }

  /**
   * Start flush timer
   */
  private startFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    this.flushTimer = setInterval(() => {
      if (this.queue.length > 0) {
        this.flush();
      }
    }, FLUSH_INTERVAL_MS);
  }

  /**
   * Attach unload listener
   */
  private attachUnloadListener(): void {
    if (this.unloadListenerAttached) {
      return;
    }

    // Use both events for better browser support
    window.addEventListener('beforeunload', this.flushOnUnload);
    window.addEventListener('pagehide', this.flushOnUnload);

    // Also flush on visibility change (when tab is hidden)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.flushOnUnload();
      }
    });

    this.unloadListenerAttached = true;
  }

  /**
   * Get device type
   */
  private getDeviceType(): string {
    const ua = navigator.userAgent;

    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return 'tablet';
    }

    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
      return 'mobile';
    }

    return 'desktop';
  }

  /**
   * Cleanup resources
   */
  public destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }

    if (typeof window !== 'undefined') {
      window.removeEventListener('beforeunload', this.flushOnUnload);
      window.removeEventListener('pagehide', this.flushOnUnload);
    }

    // Final flush
    this.flushOnUnload();
  }
}

// Singleton instance
let eventQueueInstance: EventQueue | null = null;

/**
 * Get event queue instance
 */
export function getEventQueue(): EventQueue {
  if (!eventQueueInstance) {
    eventQueueInstance = new EventQueue();
  }

  return eventQueueInstance;
}

/**
 * Destroy event queue instance
 */
export function destroyEventQueue(): void {
  if (eventQueueInstance) {
    eventQueueInstance.destroy();
    eventQueueInstance = null;
  }
}
