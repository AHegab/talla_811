import { getEventQueue } from '../eventQueue';

/**
 * Form Interaction Tracker
 *
 * - Track field focus/blur
 * - Track time spent per field
 * - Track validation errors
 * - Track form submissions (success/failure)
 */

interface FieldTiming {
  fieldName: string;
  focusTime: number;
}

let currentField: FieldTiming | null = null;
const fieldTimings: Map<string, number> = new Map();

/**
 * Initialize form tracking
 */
export function initializeFormTracker(): void {
  if (typeof window === 'undefined') {
    return;
  }

  // Use event delegation for better performance
  document.addEventListener('focus', handleFocus, true);
  document.addEventListener('blur', handleBlur, true);
  document.addEventListener('submit', handleSubmit, true);
  document.addEventListener('invalid', handleInvalid, true);
}

/**
 * Handle field focus
 */
function handleFocus(event: FocusEvent): void {
  const target = event.target as HTMLElement;

  // Only track form fields
  if (!isFormField(target)) {
    return;
  }

  const fieldName = getFieldName(target);
  const eventQueue = getEventQueue();

  // Track focus event
  eventQueue.addEvent('form_field_focus', {
    fieldName,
    fieldType: getFieldType(target),
    formId: getFormId(target),
  });

  // Start timing
  currentField = {
    fieldName,
    focusTime: Date.now(),
  };
}

/**
 * Handle field blur
 */
function handleBlur(event: FocusEvent): void {
  const target = event.target as HTMLElement;

  // Only track form fields
  if (!isFormField(target)) {
    return;
  }

  const fieldName = getFieldName(target);
  const eventQueue = getEventQueue();

  // Calculate time spent
  let timeSpent = 0;
  if (currentField && currentField.fieldName === fieldName) {
    timeSpent = Date.now() - currentField.focusTime;

    // Accumulate total time for this field
    const previousTime = fieldTimings.get(fieldName) || 0;
    fieldTimings.set(fieldName, previousTime + timeSpent);
  }

  // Track blur event
  eventQueue.addEvent('form_field_blur', {
    fieldName,
    fieldType: getFieldType(target),
    formId: getFormId(target),
    timeSpent,
    totalTime: fieldTimings.get(fieldName) || timeSpent,
  });

  currentField = null;
}

/**
 * Handle form submission
 */
function handleSubmit(event: SubmitEvent): void {
  const form = event.target as HTMLFormElement;

  if (!(form instanceof HTMLFormElement)) {
    return;
  }

  const eventQueue = getEventQueue();
  const formId = form.id || form.name || 'unknown';

  // Get form data (without sensitive values)
  const formData = getFormDataSummary(form);

  // Track submission
  eventQueue.addEvent('form_submit', {
    formId,
    formAction: form.action || window.location.href,
    formMethod: form.method || 'get',
    fieldCount: formData.fieldCount,
    fields: formData.fields,
    totalTime: Array.from(fieldTimings.values()).reduce((sum, time) => sum + time, 0),
  });

  // Reset field timings for this form
  fieldTimings.clear();
}

/**
 * Handle validation errors
 */
function handleInvalid(event: Event): void {
  const target = event.target as HTMLElement;

  if (!isFormField(target)) {
    return;
  }

  const eventQueue = getEventQueue();
  const fieldName = getFieldName(target);

  // Track validation error
  eventQueue.addEvent('form_error', {
    fieldName,
    fieldType: getFieldType(target),
    formId: getFormId(target),
    errorMessage: getValidationMessage(target),
  });
}

/**
 * Check if element is a form field
 */
function isFormField(element: HTMLElement): boolean {
  return (
    element instanceof HTMLInputElement ||
    element instanceof HTMLTextAreaElement ||
    element instanceof HTMLSelectElement
  );
}

/**
 * Get field name
 */
function getFieldName(element: HTMLElement): string {
  if (element instanceof HTMLInputElement ||
      element instanceof HTMLTextAreaElement ||
      element instanceof HTMLSelectElement) {
    return element.name || element.id || 'unknown';
  }

  return 'unknown';
}

/**
 * Get field type
 */
function getFieldType(element: HTMLElement): string {
  if (element instanceof HTMLInputElement) {
    return element.type;
  }

  if (element instanceof HTMLTextAreaElement) {
    return 'textarea';
  }

  if (element instanceof HTMLSelectElement) {
    return 'select';
  }

  return 'unknown';
}

/**
 * Get form ID
 */
function getFormId(element: HTMLElement): string {
  const form = element.closest('form');

  if (!form) {
    return 'unknown';
  }

  return form.id || form.name || 'unknown';
}

/**
 * Get validation message
 */
function getValidationMessage(element: HTMLElement): string {
  if (element instanceof HTMLInputElement ||
      element instanceof HTMLTextAreaElement ||
      element instanceof HTMLSelectElement) {
    return element.validationMessage || 'Invalid';
  }

  return 'Unknown error';
}

/**
 * Get form data summary (without sensitive values)
 */
function getFormDataSummary(form: HTMLFormElement): {
  fieldCount: number;
  fields: string[];
} {
  const fields: string[] = [];
  const elements = form.elements;

  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];

    if (isFormField(element as HTMLElement)) {
      const fieldName = getFieldName(element as HTMLElement);
      const fieldType = getFieldType(element as HTMLElement);

      // Don't include sensitive field types
      if (!isSensitiveField(fieldType)) {
        fields.push(`${fieldName}:${fieldType}`);
      }
    }
  }

  return {
    fieldCount: fields.length,
    fields,
  };
}

/**
 * Check if field type is sensitive (password, credit card, etc.)
 */
function isSensitiveField(fieldType: string): boolean {
  const sensitiveTypes = ['password', 'credit-card', 'cc-number', 'cvv', 'ssn'];
  return sensitiveTypes.includes(fieldType.toLowerCase());
}

/**
 * Cleanup form tracker
 */
export function destroyFormTracker(): void {
  if (typeof window === 'undefined') {
    return;
  }

  document.removeEventListener('focus', handleFocus, true);
  document.removeEventListener('blur', handleBlur, true);
  document.removeEventListener('submit', handleSubmit, true);
  document.removeEventListener('invalid', handleInvalid, true);

  fieldTimings.clear();
  currentField = null;
}
