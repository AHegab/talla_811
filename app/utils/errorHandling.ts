/**
 * Error handling utilities for the application
 */

export interface ErrorLogContext {
  component?: string;
  action?: string;
  userId?: string;
  [key: string]: any;
}

/**
 * Log error to console and external services
 */
export function logError(error: unknown, context?: ErrorLogContext): void {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;

  // Always log to console in development
  if (process.env.NODE_ENV !== 'production') {
    console.error('Error:', errorMessage, {
      stack: errorStack,
      context,
    });
  }

  // In production, log errors but not sensitive data
  if (process.env.NODE_ENV === 'production') {
    console.error('Error:', errorMessage);
  }

  // Send to error tracking service (e.g., Sentry)
  if (typeof window !== 'undefined' && (window as any).Sentry) {
    (window as any).Sentry.captureException(error, {
      extra: context,
    });
  }
}

/**
 * Safely parse JSON with error handling
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch (error) {
    logError(error, { action: 'JSON parsing', json: json.substring(0, 100) });
    return fallback;
  }
}

/**
 * Safely access localStorage with error handling
 */
export function safeLocalStorage() {
  const isAvailable = (() => {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  })();

  return {
    getItem(key: string): string | null {
      if (!isAvailable) return null;
      try {
        return localStorage.getItem(key);
      } catch (error) {
        logError(error, { action: 'localStorage.getItem', key });
        return null;
      }
    },

    setItem(key: string, value: string): boolean {
      if (!isAvailable) return false;
      try {
        localStorage.setItem(key, value);
        return true;
      } catch (error) {
        logError(error, { action: 'localStorage.setItem', key });
        return false;
      }
    },

    removeItem(key: string): boolean {
      if (!isAvailable) return false;
      try {
        localStorage.removeItem(key);
        return true;
      } catch (error) {
        logError(error, { action: 'localStorage.removeItem', key });
        return false;
      }
    },
  };
}

/**
 * Validate email address
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Validate and sanitize number input
 */
export function validateNumber(
  value: unknown,
  options: { min?: number; max?: number; fallback: number }
): number {
  const num = Number(value);

  if (isNaN(num)) {
    return options.fallback;
  }

  if (options.min !== undefined && num < options.min) {
    return options.min;
  }

  if (options.max !== undefined && num > options.max) {
    return options.max;
  }

  return num;
}

/**
 * Retry async operation with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    onRetry?: (attempt: number, error: unknown) => void;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    onRetry,
  } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries) {
        throw error;
      }

      const delay = Math.min(initialDelay * Math.pow(2, attempt), maxDelay);

      if (onRetry) {
        onRetry(attempt + 1, error);
      }

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Wrap async function with timeout
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage = 'Operation timed out'
): Promise<T> {
  let timeoutHandle: NodeJS.Timeout;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(() => {
      reject(new Error(errorMessage));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timeoutHandle!);
  }
}

/**
 * Safe fetch with timeout and error handling
 */
export async function safeFetch(
  url: string,
  options: RequestInit = {},
  timeoutMs = 30000
): Promise<Response> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    throw error;
  }
}

/**
 * Handle GraphQL errors
 */
export function handleGraphQLErrors(errors: any[]): Error {
  if (!errors || errors.length === 0) {
    return new Error('Unknown GraphQL error');
  }

  const errorMessages = errors.map((err) => err.message).join(', ');
  return new Error(`GraphQL Error: ${errorMessages}`);
}

/**
 * Create standardized API error response
 */
export function createErrorResponse(
  message: string,
  status = 500,
  details?: any
) {
  return new Response(
    JSON.stringify({
      error: true,
      message,
      details: process.env.NODE_ENV === 'development' ? details : undefined,
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}

/**
 * Validate required environment variables
 */
export function validateEnv(variables: string[]): void {
  const missing = variables.filter((varName) => !process.env[varName]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
}
