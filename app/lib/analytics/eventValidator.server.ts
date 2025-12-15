import { sanitizeInput, logError } from '~/utils/errorHandling';

/**
 * Event Validator
 *
 * Validate and sanitize analytics events:
 * - Check sessionId/anonymousId format (UUID)
 * - Sanitize all string fields
 * - Validate timestamps (not future, not too old)
 * - Whitelist event types
 * - Maximum batch size check
 */

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_BATCH_SIZE = 50;
const MAX_EVENT_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours
const MAX_STRING_LENGTH = 1000;

// Whitelist of allowed event types
const ALLOWED_EVENT_TYPES = new Set([
  'pageview',
  'page_exit',
  'click',
  'scroll',
  'form_submit',
  'form_field_focus',
  'form_field_blur',
  'form_error',
  'add_to_cart',
  'remove_from_cart',
  'update_cart',
  'begin_checkout',
  'complete_checkout',
  'product_view',
  'product_image_view',
  'size_recommendation',
  'search',
  'search_by_image',
  'filter_applied',
  'sort_applied',
  'error',
  'performance',
  'mouse_move',
  'mouse_click',
]);

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface ValidatedEvent {
  sessionId: string;
  anonymousId: string;
  userId?: string;
  eventType: string;
  eventData: any;
  page: {
    url: string;
    path: string;
    title: string;
    referrer: string;
  };
  timestamp: Date;
  userAgent: string;
  deviceType: string;
  screenSize: {
    width: number;
    height: number;
  };
}

/**
 * Validate event batch
 *
 * @param batch - Event batch from client
 * @returns Validation result
 */
export function validateEventBatch(batch: any): ValidationResult {
  const errors: string[] = [];

  // Check if batch is an object
  if (!batch || typeof batch !== 'object') {
    return {
      valid: false,
      errors: ['Invalid batch: must be an object'],
    };
  }

  // Validate sessionId
  if (!batch.sessionId || typeof batch.sessionId !== 'string') {
    errors.push('Missing or invalid sessionId');
  } else if (!UUID_REGEX.test(batch.sessionId)) {
    errors.push('Invalid sessionId format: must be a UUID');
  }

  // Validate anonymousId
  if (!batch.anonymousId || typeof batch.anonymousId !== 'string') {
    errors.push('Missing or invalid anonymousId');
  } else if (!UUID_REGEX.test(batch.anonymousId)) {
    errors.push('Invalid anonymousId format: must be a UUID');
  }

  // Validate userId (optional)
  if (batch.userId && typeof batch.userId !== 'string') {
    errors.push('Invalid userId: must be a string');
  }

  // Validate events array
  if (!Array.isArray(batch.events)) {
    errors.push('Missing or invalid events: must be an array');
  } else if (batch.events.length === 0) {
    errors.push('Empty events array');
  } else if (batch.events.length > MAX_BATCH_SIZE) {
    errors.push(`Too many events: maximum ${MAX_BATCH_SIZE} per batch`);
  }

  // Validate context
  if (!batch.context || typeof batch.context !== 'object') {
    errors.push('Missing or invalid context');
  } else {
    if (!batch.context.userAgent || typeof batch.context.userAgent !== 'string') {
      errors.push('Missing or invalid context.userAgent');
    }

    if (!batch.context.screenSize || typeof batch.context.screenSize !== 'object') {
      errors.push('Missing or invalid context.screenSize');
    } else {
      if (typeof batch.context.screenSize.width !== 'number' ||
          typeof batch.context.screenSize.height !== 'number') {
        errors.push('Invalid screen size: width and height must be numbers');
      }
    }

    if (!batch.context.deviceType || typeof batch.context.deviceType !== 'string') {
      errors.push('Missing or invalid context.deviceType');
    }
  }

  // Validate each event
  if (Array.isArray(batch.events)) {
    batch.events.forEach((event: any, index: number) => {
      const eventErrors = validateEvent(event, index);
      errors.push(...eventErrors);
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate individual event
 *
 * @param event - Event object
 * @param index - Event index in batch
 * @returns Array of error messages
 */
function validateEvent(event: any, index: number): string[] {
  const errors: string[] = [];
  const prefix = `Event ${index}:`;

  // Validate eventType
  if (!event.eventType || typeof event.eventType !== 'string') {
    errors.push(`${prefix} Missing or invalid eventType`);
  } else if (!ALLOWED_EVENT_TYPES.has(event.eventType)) {
    errors.push(`${prefix} Unknown eventType: ${event.eventType}`);
  }

  // Validate timestamp
  if (!event.timestamp || typeof event.timestamp !== 'number') {
    errors.push(`${prefix} Missing or invalid timestamp`);
  } else {
    const now = Date.now();
    const eventAge = now - event.timestamp;

    // Check if timestamp is in the future
    if (event.timestamp > now + 60000) { // Allow 1 minute clock skew
      errors.push(`${prefix} Timestamp is in the future`);
    }

    // Check if timestamp is too old
    if (eventAge > MAX_EVENT_AGE_MS) {
      errors.push(`${prefix} Timestamp is too old (max 24 hours)`);
    }
  }

  // Validate page object
  if (!event.page || typeof event.page !== 'object') {
    errors.push(`${prefix} Missing or invalid page object`);
  } else {
    if (!event.page.url || typeof event.page.url !== 'string') {
      errors.push(`${prefix} Missing or invalid page.url`);
    }

    if (!event.page.path || typeof event.page.path !== 'string') {
      errors.push(`${prefix} Missing or invalid page.path`);
    }

    if (typeof event.page.title !== 'string') {
      errors.push(`${prefix} Invalid page.title`);
    }

    if (typeof event.page.referrer !== 'string') {
      errors.push(`${prefix} Invalid page.referrer`);
    }
  }

  // Validate eventData (must be an object, but can be empty)
  if (event.eventData && typeof event.eventData !== 'object') {
    errors.push(`${prefix} Invalid eventData: must be an object`);
  }

  return errors;
}

/**
 * Sanitize and prepare events for storage
 *
 * @param batch - Validated event batch
 * @returns Array of sanitized events ready for MongoDB
 */
export function sanitizeEventBatch(batch: any): ValidatedEvent[] {
  const sanitizedEvents: ValidatedEvent[] = [];

  batch.events.forEach((event: any) => {
    try {
      const sanitizedEvent: ValidatedEvent = {
        sessionId: sanitizeInput(batch.sessionId),
        anonymousId: sanitizeInput(batch.anonymousId),
        userId: batch.userId ? sanitizeInput(batch.userId) : undefined,
        eventType: sanitizeInput(event.eventType),
        eventData: sanitizeObject(event.eventData || {}),
        page: {
          url: sanitizeInput(event.page.url).substring(0, MAX_STRING_LENGTH),
          path: sanitizeInput(event.page.path).substring(0, MAX_STRING_LENGTH),
          title: sanitizeInput(event.page.title || '').substring(0, MAX_STRING_LENGTH),
          referrer: sanitizeInput(event.page.referrer || '').substring(0, MAX_STRING_LENGTH),
        },
        timestamp: new Date(event.timestamp),
        userAgent: sanitizeInput(batch.context.userAgent).substring(0, MAX_STRING_LENGTH),
        deviceType: sanitizeInput(batch.context.deviceType),
        screenSize: {
          width: Math.min(Math.max(batch.context.screenSize.width, 0), 10000),
          height: Math.min(Math.max(batch.context.screenSize.height, 0), 10000),
        },
      };

      sanitizedEvents.push(sanitizedEvent);
    } catch (error) {
      logError(error, {
        action: 'sanitizeEventBatch',
        eventType: event.eventType,
      });
      // Skip this event if sanitization fails
    }
  });

  return sanitizedEvents;
}

/**
 * Sanitize object recursively
 *
 * @param obj - Object to sanitize
 * @param depth - Current recursion depth
 * @returns Sanitized object
 */
function sanitizeObject(obj: any, depth: number = 0): any {
  // Prevent deep recursion
  if (depth > 5) {
    return {};
  }

  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    return sanitizeInput(obj).substring(0, MAX_STRING_LENGTH);
  }

  if (typeof obj === 'number' || typeof obj === 'boolean') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.slice(0, 100).map(item => sanitizeObject(item, depth + 1));
  }

  if (typeof obj === 'object') {
    const sanitized: any = {};
    let keyCount = 0;

    for (const key in obj) {
      if (keyCount >= 50) break; // Limit number of keys

      const sanitizedKey = sanitizeInput(key).substring(0, 100);
      sanitized[sanitizedKey] = sanitizeObject(obj[key], depth + 1);
      keyCount++;
    }

    return sanitized;
  }

  return null;
}
