/**
 * Session Manager for Analytics
 *
 * Manages session and anonymous IDs for user tracking:
 * - sessionId: UUID, regenerated per session (sessionStorage)
 * - anonymousId: UUID, persistent (cookie + localStorage)
 * - 30-minute session timeout
 *
 * Pattern: Follows cart ID storage pattern from Shopify Hydrogen
 */

const SESSION_ID_KEY = 'talla_session_id';
const ANONYMOUS_ID_KEY = 'talla_anonymous_id';
const SESSION_LAST_ACTIVITY_KEY = 'talla_session_last_activity';
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Generate a UUID v4 using browser's native crypto API
 */
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Get or create session ID
 *
 * Session ID is stored in sessionStorage and expires after 30 minutes of inactivity
 * or when the browser tab/window is closed.
 *
 * @returns Session ID (UUID)
 */
export function getSessionId(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  try {
    const now = Date.now();
    const lastActivity = sessionStorage.getItem(SESSION_LAST_ACTIVITY_KEY);
    const existingSessionId = sessionStorage.getItem(SESSION_ID_KEY);

    // Check if session has timed out
    if (lastActivity && existingSessionId) {
      const timeSinceLastActivity = now - parseInt(lastActivity, 10);

      if (timeSinceLastActivity < SESSION_TIMEOUT_MS) {
        // Session is still valid, update last activity
        sessionStorage.setItem(SESSION_LAST_ACTIVITY_KEY, now.toString());
        return existingSessionId;
      }
    }

    // Create new session
    const newSessionId = generateUUID();
    sessionStorage.setItem(SESSION_ID_KEY, newSessionId);
    sessionStorage.setItem(SESSION_LAST_ACTIVITY_KEY, now.toString());

    return newSessionId;
  } catch (error) {
    // Fallback if sessionStorage is not available
    return generateUUID();
  }
}

/**
 * Get or create anonymous ID
 *
 * Anonymous ID is persistent across sessions and stored in:
 * 1. Cookie (primary, 1 year expiration)
 * 2. localStorage (backup)
 *
 * This allows tracking users across sessions even when they're not logged in.
 *
 * @returns Anonymous ID (UUID)
 */
export function getAnonymousId(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  try {
    // Try to get from cookie first
    let anonymousId = getCookie(ANONYMOUS_ID_KEY);

    // Fallback to localStorage
    if (!anonymousId) {
      anonymousId = localStorage.getItem(ANONYMOUS_ID_KEY) || '';
    }

    // Create new anonymous ID if none exists
    if (!anonymousId) {
      anonymousId = generateUUID();
    }

    // Store in both cookie and localStorage for redundancy
    setCookie(ANONYMOUS_ID_KEY, anonymousId, 365); // 1 year
    localStorage.setItem(ANONYMOUS_ID_KEY, anonymousId);

    return anonymousId;
  } catch (error) {
    // Fallback if cookie/localStorage is not available
    return generateUUID();
  }
}

/**
 * Update session last activity timestamp
 *
 * Call this periodically to keep the session alive
 */
export function updateSessionActivity(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    sessionStorage.setItem(SESSION_LAST_ACTIVITY_KEY, Date.now().toString());
  } catch (error) {
    // Ignore errors
  }
}

/**
 * Clear session (logout or reset)
 *
 * Clears the current session ID but keeps the anonymous ID
 */
export function clearSession(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    sessionStorage.removeItem(SESSION_ID_KEY);
    sessionStorage.removeItem(SESSION_LAST_ACTIVITY_KEY);
  } catch (error) {
    // Ignore errors
  }
}

/**
 * Clear all analytics data (opt-out)
 *
 * Removes both session ID and anonymous ID
 */
export function clearAllAnalyticsData(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    // Clear session data
    sessionStorage.removeItem(SESSION_ID_KEY);
    sessionStorage.removeItem(SESSION_LAST_ACTIVITY_KEY);

    // Clear anonymous ID
    localStorage.removeItem(ANONYMOUS_ID_KEY);
    deleteCookie(ANONYMOUS_ID_KEY);
  } catch (error) {
    // Ignore errors
  }
}

/**
 * Get cookie value by name
 */
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const nameEQ = `${name}=`;
  const cookies = document.cookie.split(';');

  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i];
    while (cookie.charAt(0) === ' ') {
      cookie = cookie.substring(1, cookie.length);
    }
    if (cookie.indexOf(nameEQ) === 0) {
      return cookie.substring(nameEQ.length, cookie.length);
    }
  }

  return null;
}

/**
 * Set cookie with expiration
 */
function setCookie(name: string, value: string, days: number): void {
  if (typeof document === 'undefined') {
    return;
  }

  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`;
}

/**
 * Delete cookie
 */
function deleteCookie(name: string): void {
  if (typeof document === 'undefined') {
    return;
  }

  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
}

/**
 * Check if session is active
 */
export function isSessionActive(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const lastActivity = sessionStorage.getItem(SESSION_LAST_ACTIVITY_KEY);

    if (!lastActivity) {
      return false;
    }

    const timeSinceLastActivity = Date.now() - parseInt(lastActivity, 10);
    return timeSinceLastActivity < SESSION_TIMEOUT_MS;
  } catch (error) {
    return false;
  }
}
