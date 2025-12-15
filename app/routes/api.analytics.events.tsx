import type { ActionFunctionArgs } from '@shopify/remix-oxygen';
import { getMongoDBConnection, isAnalyticsEnabled } from '~/lib/mongodb.server';
import { initializeCollections } from '~/lib/mongodb-init.server';
import { validateEventBatch, sanitizeEventBatch } from '~/lib/analytics/eventValidator.server';
import { processEvents } from '~/lib/analytics/eventProcessor.server';
import { logError, createErrorResponse, withTimeout } from '~/utils/errorHandling';

/**
 * Analytics Events API Endpoint
 *
 * Receives event batches from client:
 * - Validate POST requests only
 * - Parse JSON body with timeout
 * - Sanitize all inputs
 * - Validate event structure
 * - Insert into MongoDB
 * - Return success response
 *
 * Pattern follows: app/routes/api.recommend-size.tsx
 */

export async function action({ request, context }: ActionFunctionArgs) {
  // Only accept POST requests
  if (request.method !== 'POST') {
    return createErrorResponse('Method not allowed', 405);
  }

  try {
    // Check if analytics is enabled
    if (!isAnalyticsEnabled(context.env)) {
      // Silently accept but don't process
      return Response.json({ success: true, message: 'Analytics disabled' });
    }

    // Parse request body with timeout
    let batch: any;
    try {
      batch = await withTimeout(
        request.json(),
        5000,
        'Request timeout while parsing JSON'
      );
    } catch (parseError) {
      logError(parseError, { action: 'api.analytics.events', step: 'parse-body' });
      return createErrorResponse('Invalid JSON request body', 400);
    }

    // Validate batch structure
    const validationResult = validateEventBatch(batch);

    if (!validationResult.valid) {
      logError(new Error('Batch validation failed'), {
        action: 'api.analytics.events',
        step: 'validate',
        errors: validationResult.errors,
      });
      return createErrorResponse(
        'Invalid event batch',
        400,
        { errors: validationResult.errors }
      );
    }

    // Sanitize events
    let sanitizedEvents;
    try {
      sanitizedEvents = sanitizeEventBatch(batch);

      if (sanitizedEvents.length === 0) {
        logError(new Error('No valid events after sanitization'), {
          action: 'api.analytics.events',
          step: 'sanitize',
        });
        return createErrorResponse('No valid events in batch', 400);
      }
    } catch (sanitizeError) {
      logError(sanitizeError, {
        action: 'api.analytics.events',
        step: 'sanitize',
      });
      return createErrorResponse('Failed to sanitize events', 400, sanitizeError);
    }

    // Get MongoDB connection
    let db;
    try {
      db = await withTimeout(
        getMongoDBConnection(context.env),
        10000,
        'MongoDB connection timeout'
      );
    } catch (connectionError) {
      logError(connectionError, {
        action: 'api.analytics.events',
        step: 'mongodb-connection',
      });
      return createErrorResponse(
        'Failed to connect to analytics database',
        503,
        connectionError
      );
    }

    // Initialize collections if needed (this is idempotent)
    try {
      await withTimeout(
        initializeCollections(db),
        15000,
        'Collection initialization timeout'
      );
    } catch (initError) {
      logError(initError, {
        action: 'api.analytics.events',
        step: 'initialize-collections',
      });
      // Continue anyway - collections might already exist
    }

    // Process events
    try {
      await withTimeout(
        processEvents(db, sanitizedEvents),
        30000,
        'Event processing timeout'
      );
    } catch (processingError) {
      logError(processingError, {
        action: 'api.analytics.events',
        step: 'process-events',
        eventCount: sanitizedEvents.length,
      });
      return createErrorResponse(
        'Failed to process events',
        500,
        processingError
      );
    }

    // Return success
    return Response.json({
      success: true,
      message: 'Events processed successfully',
      count: sanitizedEvents.length,
    });

  } catch (error) {
    // Catch-all error handler
    logError(error, { action: 'api.analytics.events', step: 'unexpected-error' });
    return createErrorResponse(
      'An unexpected error occurred while processing analytics events',
      500,
      error
    );
  }
}

// Reject GET requests
export async function loader() {
  return createErrorResponse('This endpoint only accepts POST requests', 405);
}
