import { getEventQueue } from '../eventQueue';

/**
 * Mouse Movement Tracker
 *
 * - Sample mouse position (1 sample/second)
 * - Store relative coordinates (percentage)
 * - Track clicks and movements
 * - Sampling: Only 10% of users for performance
 */

let mouseTrackingEnabled = false;
let lastSampleTime = 0;
const SAMPLE_INTERVAL_MS = 1000; // 1 sample per second
const SAMPLING_RATE = 0.1; // 10% of users

/**
 * Initialize mouse tracking
 *
 * Only initializes for 10% of users (sampling)
 */
export function initializeMouseTracker(): void {
  if (typeof window === 'undefined') {
    return;
  }

  // Check if this user should be sampled
  if (!shouldSampleUser()) {
    return;
  }

  mouseTrackingEnabled = true;
  lastSampleTime = Date.now();

  // Attach mouse move listener
  document.addEventListener('mousemove', handleMouseMove, { passive: true });
}

/**
 * Determine if this user should be sampled (10% chance)
 */
function shouldSampleUser(): boolean {
  // Check if already decided (stored in sessionStorage)
  const stored = sessionStorage.getItem('talla_mouse_tracking');

  if (stored !== null) {
    return stored === 'true';
  }

  // Randomly decide
  const shouldSample = Math.random() < SAMPLING_RATE;
  sessionStorage.setItem('talla_mouse_tracking', shouldSample.toString());

  return shouldSample;
}

/**
 * Handle mouse move event
 */
function handleMouseMove(event: MouseEvent): void {
  if (!mouseTrackingEnabled) {
    return;
  }

  const now = Date.now();

  // Throttle to 1 sample per second
  if (now - lastSampleTime < SAMPLE_INTERVAL_MS) {
    return;
  }

  lastSampleTime = now;

  // Get relative coordinates (percentage)
  const x = Math.round((event.clientX / window.innerWidth) * 100);
  const y = Math.round((event.clientY / window.innerHeight) * 100);

  // Track mouse position
  const eventQueue = getEventQueue();
  eventQueue.addEvent('mouse_move', {
    x,
    y,
    timestamp: now,
  });
}

/**
 * Check if mouse tracking is enabled for this user
 */
export function isMouseTrackingEnabled(): boolean {
  return mouseTrackingEnabled;
}

/**
 * Cleanup mouse tracker
 */
export function destroyMouseTracker(): void {
  if (typeof window === 'undefined') {
    return;
  }

  document.removeEventListener('mousemove', handleMouseMove);
  mouseTrackingEnabled = false;
}
