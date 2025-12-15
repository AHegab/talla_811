# Error Handling Guide

## Overview

The Talla application has comprehensive error handling to prevent crashes and provide a great user experience even when errors occur. This document describes the error handling strategy and how to use the error handling utilities.

## Error Handling Strategy

Our error handling follows these principles:

1. **Never Crash**: The application should never completely crash. All errors are caught and handled gracefully.
2. **Fail Gracefully**: When errors occur, provide meaningful feedback to users.
3. **Log Everything**: All errors are logged for debugging and monitoring.
4. **Validate Early**: Validate user inputs before processing to prevent errors.
5. **Timeout Protection**: All external API calls have timeouts to prevent hanging.

## Error Handling Components

### 1. React Error Boundary

**Location:** `app/components/ErrorBoundary.tsx`

A React error boundary that catches JavaScript errors anywhere in the component tree.

**Usage:**
```tsx
import { ErrorBoundary } from '~/components/ErrorBoundary';

function MyComponent() {
  return (
    <ErrorBoundary>
      <ChildComponents />
    </ErrorBoundary>
  );
}
```

**Features:**
- Catches all React component errors
- Displays user-friendly error UI
- Shows detailed error info in development mode
- Allows users to refresh or go to homepage
- Integrates with error tracking services (Sentry)

### 2. Route Error Boundary

**Location:** `app/root.tsx` - `ErrorBoundary` function

Handles routing errors and loader/action failures.

**Features:**
- Custom error messages for different HTTP status codes
- 404: Page not found
- 401: Unauthorized
- 403: Forbidden
- 500: Server error
- 503: Service unavailable
- Beautiful error UI with icons
- Refresh and homepage buttons

### 3. Root Loader Protection

**Location:** `app/root.tsx` - `loader` function

The root loader is wrapped in try-catch to prevent complete app crashes.

**Behavior:**
- If critical data fails to load, throws a 500 error
- Error boundary catches and displays error page
- User can refresh or navigate to homepage

## Error Handling Utilities

**Location:** `app/utils/errorHandling.ts`

### logError(error, context?)

Logs errors to console and external services.

```typescript
import { logError } from '~/utils/errorHandling';

try {
  // risky operation
} catch (error) {
  logError(error, {
    component: 'ProductPage',
    action: 'add-to-cart',
    userId: '123'
  });
}
```

### safeJsonParse(json, fallback)

Safely parse JSON with error handling.

```typescript
import { safeJsonParse } from '~/utils/errorHandling';

const data = safeJsonParse(jsonString, { default: 'value' });
// Returns fallback if parsing fails
```

### safeLocalStorage()

Safe localStorage access with error handling.

```typescript
import { safeLocalStorage } from '~/utils/errorHandling';

const storage = safeLocalStorage();
const value = storage.getItem('key'); // Returns null if error
storage.setItem('key', 'value'); // Returns boolean
storage.removeItem('key'); // Returns boolean
```

### isValidEmail(email)

Validates email addresses.

```typescript
import { isValidEmail } from '~/utils/errorHandling';

if (!isValidEmail(email)) {
  return createErrorResponse('Invalid email', 400);
}
```

### sanitizeInput(input)

Sanitizes user input to prevent XSS attacks.

```typescript
import { sanitizeInput } from '~/utils/errorHandling';

const clean = sanitizeInput(userInput);
// Removes <, >, javascript:, event handlers
```

### validateNumber(value, options)

Validates and clamps numbers.

```typescript
import { validateNumber } from '~/utils/errorHandling';

const height = validateNumber(userHeight, {
  min: 100,
  max: 250,
  fallback: 175
});
// Returns clamped value or fallback
```

### retryWithBackoff(fn, options)

Retries async operations with exponential backoff.

```typescript
import { retryWithBackoff } from '~/utils/errorHandling';

const data = await retryWithBackoff(
  async () => fetch(url).then(r => r.json()),
  {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    onRetry: (attempt, error) => {
      console.log(`Retry attempt ${attempt}`, error);
    }
  }
);
```

### withTimeout(promise, timeoutMs, errorMessage)

Wraps a promise with a timeout.

```typescript
import { withTimeout } from '~/utils/errorHandling';

const data = await withTimeout(
  fetch(url),
  30000,
  'Request timed out'
);
// Throws error if takes longer than 30s
```

### safeFetch(url, options, timeoutMs)

Safe fetch with timeout and error handling.

```typescript
import { safeFetch } from '~/utils/errorHandling';

const response = await safeFetch(
  'https://api.example.com/data',
  { method: 'POST', body: JSON.stringify(data) },
  30000
);
// Automatically handles timeouts and HTTP errors
```

### createErrorResponse(message, status, details?)

Creates standardized API error responses.

```typescript
import { createErrorResponse } from '~/utils/errorHandling';

export async function action({ request }: ActionArgs) {
  try {
    // ... operation
  } catch (error) {
    return createErrorResponse(
      'Failed to process request',
      500,
      error
    );
  }
}
```

## API Route Error Handling

All API routes follow this pattern:

```typescript
import {
  logError,
  validateNumber,
  isValidEmail,
  sanitizeInput,
  createErrorResponse,
  withTimeout
} from '~/utils/errorHandling';

export async function action({ request, context }: ActionArgs) {
  // 1. Method validation
  if (request.method !== 'POST') {
    return createErrorResponse('Method not allowed', 405);
  }

  try {
    // 2. Parse request body with timeout
    let body: any;
    try {
      body = await withTimeout(
        request.json(),
        5000,
        'Request timeout'
      );
    } catch (parseError) {
      logError(parseError, { action: 'api.endpoint', step: 'parse' });
      return createErrorResponse('Invalid JSON', 400);
    }

    // 3. Validate required fields
    if (!body.email) {
      logError(new Error('Missing email'), { action: 'api.endpoint' });
      return createErrorResponse('Email is required', 400);
    }

    // 4. Validate and sanitize inputs
    const email = sanitizeInput(body.email.trim().toLowerCase());
    if (!isValidEmail(email)) {
      logError(new Error('Invalid email'), { action: 'api.endpoint', email });
      return createErrorResponse('Invalid email format', 400);
    }

    const age = validateNumber(body.age, {
      min: 1,
      max: 120,
      fallback: 0
    });

    if (age === 0) {
      logError(new Error('Invalid age'), { action: 'api.endpoint', age: body.age });
      return createErrorResponse('Invalid age', 400);
    }

    // 5. Process request with error handling
    let result;
    try {
      result = await withTimeout(
        processData({ email, age }),
        30000,
        'Processing timeout'
      );
    } catch (processingError) {
      logError(processingError, {
        action: 'api.endpoint',
        step: 'process',
        email
      });
      return createErrorResponse('Processing failed', 500, processingError);
    }

    // 6. Return success response
    return Response.json({ success: true, result });

  } catch (error) {
    // 7. Catch-all error handler
    logError(error, { action: 'api.endpoint', step: 'unexpected' });
    return createErrorResponse(
      'An unexpected error occurred',
      500,
      error
    );
  }
}
```

## Component Error Handling

### Async Operations in Components

```typescript
import { useState } from 'react';
import { logError } from '~/utils/errorHandling';

function MyComponent() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleAction() {
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/endpoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      // Handle success
    } catch (err) {
      logError(err, {
        component: 'MyComponent',
        action: 'handleAction'
      });
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (error) {
    return (
      <div className="error-message">
        {error}
        <button onClick={() => setError(null)}>Dismiss</button>
      </div>
    );
  }

  return (
    <button onClick={handleAction} disabled={loading}>
      {loading ? 'Loading...' : 'Submit'}
    </button>
  );
}
```

### Form Validation

```typescript
import { isValidEmail, sanitizeInput } from '~/utils/errorHandling';

function ContactForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validateForm(data: FormData) {
    const newErrors: Record<string, string> = {};

    const email = sanitizeInput(data.get('email') as string || '');
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Invalid email format';
    }

    const name = sanitizeInput(data.get('name') as string || '');
    if (!name) {
      newErrors.name = 'Name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);

    if (!validateForm(formData)) {
      return;
    }

    // Submit form
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" type="email" />
      {errors.email && <span className="error">{errors.email}</span>}

      <input name="name" type="text" />
      {errors.name && <span className="error">{errors.name}</span>}

      <button type="submit">Submit</button>
    </form>
  );
}
```

## External Service Integration

### Error Tracking (Sentry)

To integrate with Sentry or other error tracking services:

1. Install Sentry SDK:
```bash
npm install @sentry/react
```

2. Initialize in `app/entry.client.tsx`:
```typescript
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  environment: process.env.NODE_ENV,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay(),
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

3. The error handling utilities will automatically use Sentry if available.

## Best Practices

### 1. Always Validate User Input

```typescript
// ❌ Bad
const age = Number(request.body.age);
processAge(age);

// ✅ Good
const age = validateNumber(request.body.age, {
  min: 1,
  max: 120,
  fallback: 0
});

if (age === 0) {
  return createErrorResponse('Invalid age', 400);
}

processAge(age);
```

### 2. Always Use Timeouts for External Calls

```typescript
// ❌ Bad
const response = await fetch(url);

// ✅ Good
const response = await safeFetch(url, {}, 30000);
// or
const response = await withTimeout(fetch(url), 30000, 'Request timed out');
```

### 3. Sanitize User Input

```typescript
// ❌ Bad
const comment = request.body.comment;
saveToDatabase(comment);

// ✅ Good
const comment = sanitizeInput(request.body.comment);
saveToDatabase(comment);
```

### 4. Provide Meaningful Error Messages

```typescript
// ❌ Bad
return createErrorResponse('Error', 500);

// ✅ Good
return createErrorResponse(
  'Failed to send email. The email service may be unavailable.',
  500,
  emailError
);
```

### 5. Log Errors with Context

```typescript
// ❌ Bad
console.error(error);

// ✅ Good
logError(error, {
  component: 'ProductPage',
  action: 'add-to-cart',
  productId: product.id,
  userId: user?.id
});
```

### 6. Handle Both Success and Error States in UI

```typescript
// ❌ Bad
function MyComponent() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/data')
      .then(r => r.json())
      .then(setData);
  }, []);

  return <div>{data?.value}</div>;
}

// ✅ Good
function MyComponent() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/data')
      .then(r => r.json())
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  return <div>{data?.value}</div>;
}
```

## Testing Error Scenarios

### Manual Testing

1. **Network Errors**: Disconnect internet and test all API calls
2. **Invalid Input**: Submit forms with invalid data
3. **Timeout**: Test slow API responses
4. **Server Errors**: Trigger 500 errors from API
5. **404 Errors**: Navigate to non-existent routes

### Automated Testing

```typescript
import { describe, it, expect, vi } from 'vitest';
import { logError, createErrorResponse } from '~/utils/errorHandling';

describe('Error Handling', () => {
  it('should log errors', () => {
    const consoleSpy = vi.spyOn(console, 'error');
    const error = new Error('Test error');

    logError(error, { action: 'test' });

    expect(consoleSpy).toHaveBeenCalled();
  });

  it('should create proper error responses', () => {
    const response = createErrorResponse('Test error', 400);

    expect(response.status).toBe(400);
    expect(response.headers.get('Content-Type')).toBe('application/json');
  });
});
```

## Monitoring and Alerts

### Key Metrics to Monitor

1. **Error Rate**: Percentage of requests that result in errors
2. **Error Types**: Distribution of error types (400, 500, etc.)
3. **Failed Endpoints**: Which API endpoints fail most often
4. **User Impact**: How many users are affected by errors
5. **Response Times**: Slow endpoints that might timeout

### Setting Up Alerts

Configure alerts for:
- Error rate > 5%
- Any 500 errors
- Timeout rate > 2%
- Multiple errors from same user

## Troubleshooting

### Common Issues

#### "TypeError: Cannot read property 'X' of undefined"

**Solution**: Add null checks
```typescript
// ❌ Bad
const value = data.user.profile.name;

// ✅ Good
const value = data?.user?.profile?.name || 'Unknown';
```

#### "Network request failed"

**Solution**: Add timeout and retry logic
```typescript
const data = await retryWithBackoff(
  () => safeFetch(url, {}, 30000),
  { maxRetries: 3 }
);
```

#### "Invalid JSON"

**Solution**: Use safeJsonParse
```typescript
const data = safeJsonParse(jsonString, { default: 'value' });
```

## Summary

The Talla application has comprehensive error handling at all levels:

1. ✅ **React Error Boundary** - Catches component errors
2. ✅ **Route Error Boundary** - Catches routing errors
3. ✅ **API Error Handling** - All API routes have try-catch
4. ✅ **Input Validation** - All user inputs are validated
5. ✅ **Timeout Protection** - All external calls have timeouts
6. ✅ **Error Logging** - All errors are logged with context
7. ✅ **User-Friendly Messages** - Meaningful error messages for users
8. ✅ **Graceful Degradation** - App never completely crashes

This ensures the application provides a robust and reliable experience for all users, even when errors occur.
