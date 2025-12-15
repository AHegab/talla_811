import { logError } from '~/utils/errorHandling';
import type { ValidatedEvent } from './eventValidator.server';
import type { MongoDBDataAPIClient } from '~/lib/mongodb.server';
import { insertMany, updateOne, findOne } from '~/lib/mongodb.server';

/**
 * Event Processor
 *
 * Process events:
 * - Bulk insert into `events` collection
 * - Update `sessions` collection
 * - Update `page_views` for pageview events
 * - Update `product_interactions` for product events
 * - Use MongoDB bulk operations for performance
 */

/**
 * Process and store events in MongoDB
 *
 * @param client - MongoDB Data API client
 * @param events - Array of validated and sanitized events
 * @returns Promise that resolves when processing is complete
 */
export async function processEvents(client: MongoDBDataAPIClient, events: ValidatedEvent[]): Promise<void> {
  if (events.length === 0) {
    return;
  }

  try {
    // Insert all events into the events collection
    await insertEvents(client, events);

    // Update or create session
    await updateSession(client, events);

    // Process page views
    const pageViews = events.filter(e => e.eventType === 'pageview');
    if (pageViews.length > 0) {
      await processPageViews(client, pageViews);
    }

    // Process product interactions
    const productEvents = events.filter(e =>
      e.eventType === 'product_view' ||
      e.eventType === 'add_to_cart' ||
      e.eventType === 'remove_from_cart'
    );
    if (productEvents.length > 0) {
      await processProductInteractions(client, productEvents);
    }

    // Process mouse movements for heatmap
    const mouseEvents = events.filter(e => e.eventType === 'mouse_move');
    if (mouseEvents.length > 0) {
      await processHeatmapData(client, mouseEvents);
    }
  } catch (error) {
    logError(error, {
      action: 'processEvents',
      eventCount: events.length,
    });
    throw error;
  }
}

/**
 * Insert events into events collection
 */
async function insertEvents(client: MongoDBDataAPIClient, events: ValidatedEvent[]): Promise<void> {
  try {
    await insertMany(client, 'events', events);
  } catch (error) {
    logError(error, {
      action: 'insertEvents',
      eventCount: events.length,
    });
    throw error;
  }
}

/**
 * Update session data
 */
async function updateSession(client: MongoDBDataAPIClient, events: ValidatedEvent[]): Promise<void> {
  try {
    // Get the first event to extract session info
    const firstEvent = events[0];
    const lastEvent = events[events.length - 1];

    const sessionId = firstEvent.sessionId;
    const anonymousId = firstEvent.anonymousId;
    const userId = firstEvent.userId;

    // Count pageviews in this batch
    const pageViewCount = events.filter(e => e.eventType === 'pageview').length;

    // Get max scroll depth from page_exit events
    const exitEvents = events.filter(e => e.eventType === 'page_exit');
    const maxScrollDepth = exitEvents.reduce((max, e) => {
      const scrollDepth = e.eventData?.scrollDepth || 0;
      return Math.max(max, scrollDepth);
    }, 0);

    // Check for cart and checkout events
    const addedToCart = events.some(e => e.eventType === 'add_to_cart');
    const startedCheckout = events.some(e => e.eventType === 'begin_checkout');

    // Update or create session
    await updateOne(
      client,
      'sessions',
      { sessionId },
      {
        $set: {
          anonymousId,
          userId,
          endTime: lastEvent.timestamp,
        },
        $setOnInsert: {
          startTime: firstEvent.timestamp,
          addedToCart: false,
          startedCheckout: false,
        },
        $inc: {
          pageViews: pageViewCount,
        },
        $max: {
          scrollDepthMax: maxScrollDepth,
        },
      },
      { upsert: true }
    );

    // Update cart/checkout flags if needed
    if (addedToCart || startedCheckout) {
      await updateOne(
        client,
        'sessions',
        { sessionId },
        {
          $set: {
            ...(addedToCart && { addedToCart: true }),
            ...(startedCheckout && { startedCheckout: true }),
          },
        }
      );
    }

    // Calculate and update session duration
    const session = await findOne(client, 'sessions', { sessionId });
    if (session && session.startTime && session.endTime) {
      const duration = new Date(session.endTime).getTime() - new Date(session.startTime).getTime();
      await updateOne(
        client,
        'sessions',
        { sessionId },
        { $set: { duration } }
      );
    }

    // Update user profile if userId is present
    if (userId) {
      await updateUserProfile(client, userId, anonymousId, firstEvent.timestamp);
    }
  } catch (error) {
    logError(error, {
      action: 'updateSession',
      sessionId: events[0]?.sessionId,
    });
    throw error;
  }
}

/**
 * Update user profile
 */
async function updateUserProfile(
  client: MongoDBDataAPIClient,
  userId: string,
  anonymousId: string,
  timestamp: Date
): Promise<void> {
  try {
    await updateOne(
      client,
      'users',
      { userId },
      {
        $set: {
          lastSeen: timestamp,
        },
        $setOnInsert: {
          firstSeen: timestamp,
        },
        $addToSet: {
          anonymousIds: anonymousId,
        },
        $inc: {
          totalSessions: 1,
        },
      },
      { upsert: true }
    );
  } catch (error) {
    logError(error, {
      action: 'updateUserProfile',
      userId,
    });
    // Don't throw - this is non-critical
  }
}

/**
 * Process page views
 */
async function processPageViews(client: MongoDBDataAPIClient, pageViews: ValidatedEvent[]): Promise<void> {
  try {
    // Prepare page view documents
    const documents = pageViews.map(event => ({
      sessionId: event.sessionId,
      anonymousId: event.anonymousId,
      userId: event.userId,
      page: event.page,
      timestamp: event.timestamp,
      userAgent: event.userAgent,
      deviceType: event.deviceType,
      screenSize: event.screenSize,
      referrer: event.page.referrer,
    }));

    await insertMany(client, 'page_views', documents);
  } catch (error) {
    logError(error, {
      action: 'processPageViews',
      count: pageViews.length,
    });
    // Don't throw - events are already saved
  }
}

/**
 * Process product interactions
 */
async function processProductInteractions(
  client: MongoDBDataAPIClient,
  productEvents: ValidatedEvent[]
): Promise<void> {
  try {
    // Prepare product interaction documents
    const documents = productEvents.map(event => ({
      sessionId: event.sessionId,
      anonymousId: event.anonymousId,
      userId: event.userId,
      eventType: event.eventType,
      productId: event.eventData?.productId,
      variantId: event.eventData?.variantId,
      productTitle: event.eventData?.productTitle,
      price: event.eventData?.price,
      quantity: event.eventData?.quantity,
      timestamp: event.timestamp,
      page: event.page,
    }));

    await insertMany(client, 'product_interactions', documents);
  } catch (error) {
    logError(error, {
      action: 'processProductInteractions',
      count: productEvents.length,
    });
    // Don't throw - events are already saved
  }
}

/**
 * Process heatmap data (mouse movements)
 */
async function processHeatmapData(client: MongoDBDataAPIClient, mouseEvents: ValidatedEvent[]): Promise<void> {
  try {
    // Prepare heatmap documents
    const documents = mouseEvents.map(event => ({
      sessionId: event.sessionId,
      page: event.page,
      x: event.eventData?.x,
      y: event.eventData?.y,
      timestamp: event.timestamp,
      deviceType: event.deviceType,
      screenSize: event.screenSize,
    }));

    await insertMany(client, 'heatmap_data', documents);
  } catch (error) {
    logError(error, {
      action: 'processHeatmapData',
      count: mouseEvents.length,
    });
    // Don't throw - events are already saved
  }
}
