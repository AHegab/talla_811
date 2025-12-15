import { getEventQueue } from '../eventQueue';

/**
 * Click Tracker
 *
 * Event delegation on document:
 * - Capture all button/link clicks
 * - Store element path and target
 * - Track click position
 */

/**
 * Initialize click tracking
 *
 * Call this once when the app loads
 */
export function initializeClickTracker(): void {
  if (typeof window === 'undefined') {
    return;
  }

  // Use event delegation for better performance
  document.addEventListener('click', handleClick, true);
}

/**
 * Handle click event
 */
function handleClick(event: MouseEvent): void {
  const target = event.target as HTMLElement;

  if (!target) {
    return;
  }

  const eventQueue = getEventQueue();

  // Get element info
  const elementInfo = getElementInfo(target);

  // Track click event
  eventQueue.addEvent('click', {
    element: elementInfo.selector,
    elementType: elementInfo.type,
    elementText: elementInfo.text,
    target: elementInfo.href || elementInfo.action || '',
    x: event.clientX,
    y: event.clientY,
    timestamp: Date.now(),
  });
}

/**
 * Get element information
 */
function getElementInfo(element: HTMLElement): {
  selector: string;
  type: string;
  text: string;
  href?: string;
  action?: string;
} {
  const tagName = element.tagName.toLowerCase();
  let type = tagName;
  let href: string | undefined;
  let action: string | undefined;

  // Get element type
  if (element instanceof HTMLButtonElement) {
    type = 'button';
  } else if (element instanceof HTMLAnchorElement) {
    type = 'link';
    href = element.href;
  } else if (element instanceof HTMLInputElement) {
    type = `input[${element.type}]`;
  } else if (element instanceof HTMLFormElement) {
    type = 'form';
    action = element.action;
  }

  // Get element selector (try ID, class, or path)
  const selector = getElementSelector(element);

  // Get element text (trimmed to 100 chars)
  const text = getElementText(element).substring(0, 100);

  return {
    selector,
    type,
    text,
    href,
    action,
  };
}

/**
 * Get element selector
 */
function getElementSelector(element: HTMLElement): string {
  // Try ID first
  if (element.id) {
    return `#${element.id}`;
  }

  // Try class
  if (element.className && typeof element.className === 'string') {
    const classes = element.className.split(' ').filter(c => c.length > 0);
    if (classes.length > 0) {
      return `.${classes[0]}`;
    }
  }

  // Try data attributes
  const dataAttributes = Array.from(element.attributes)
    .filter(attr => attr.name.startsWith('data-'))
    .map(attr => `[${attr.name}="${attr.value}"]`)
    .join('');

  if (dataAttributes) {
    return `${element.tagName.toLowerCase()}${dataAttributes}`;
  }

  // Fallback to tag name
  return element.tagName.toLowerCase();
}

/**
 * Get element text content
 */
function getElementText(element: HTMLElement): string {
  // For buttons and links, get immediate text
  if (element instanceof HTMLButtonElement || element instanceof HTMLAnchorElement) {
    return element.textContent?.trim() || '';
  }

  // For inputs, get value or placeholder
  if (element instanceof HTMLInputElement) {
    return element.value || element.placeholder || '';
  }

  // For other elements, get text content
  return element.textContent?.trim() || '';
}

/**
 * Cleanup click tracker
 */
export function destroyClickTracker(): void {
  if (typeof window === 'undefined') {
    return;
  }

  document.removeEventListener('click', handleClick, true);
}
