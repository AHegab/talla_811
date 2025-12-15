import type { Db } from 'mongodb';
import { logError } from '~/utils/errorHandling';

/**
 * MongoDB Schema Initialization
 *
 * Defines collections and indexes for the analytics system.
 * Collections:
 * 1. events - Main event stream (all user actions)
 * 2. sessions - Aggregated session data
 * 3. users - User profiles (merged anonymous → logged-in)
 * 4. page_views - Dedicated page analytics
 * 5. product_interactions - Product-specific events
 * 6. heatmap_data - Mouse movement samples
 */

/**
 * Initialize all collections and indexes
 *
 * This function is idempotent - it can be called multiple times safely.
 * It will only create collections and indexes that don't already exist.
 *
 * @param db - MongoDB database instance
 */
export async function initializeCollections(db: Db): Promise<void> {
  try {
    // Create events collection with indexes
    await createEventsCollection(db);

    // Create sessions collection with indexes
    await createSessionsCollection(db);

    // Create users collection with indexes
    await createUsersCollection(db);

    // Create page_views collection with indexes
    await createPageViewsCollection(db);

    // Create product_interactions collection with indexes
    await createProductInteractionsCollection(db);

    // Create heatmap_data collection with indexes
    await createHeatmapDataCollection(db);
  } catch (error) {
    logError(error, { action: 'initializeCollections' });
    throw error;
  }
}

/**
 * Create events collection with indexes
 */
async function createEventsCollection(db: Db): Promise<void> {
  const collectionName = 'events';

  try {
    // Check if collection exists
    const collections = await db.listCollections({ name: collectionName }).toArray();

    if (collections.length === 0) {
      // Create collection
      await db.createCollection(collectionName);
    }

    const collection = db.collection(collectionName);

    // Create indexes
    await collection.createIndex(
      { sessionId: 1, timestamp: -1 },
      { name: 'sessionId_timestamp' }
    );

    await collection.createIndex(
      { userId: 1, timestamp: -1 },
      { name: 'userId_timestamp', sparse: true }
    );

    await collection.createIndex(
      { anonymousId: 1, timestamp: -1 },
      { name: 'anonymousId_timestamp' }
    );

    await collection.createIndex(
      { eventType: 1, timestamp: -1 },
      { name: 'eventType_timestamp' }
    );

    // TTL index - automatically delete events older than 90 days
    await collection.createIndex(
      { timestamp: 1 },
      { name: 'timestamp_ttl', expireAfterSeconds: 90 * 24 * 60 * 60 }
    );
  } catch (error) {
    logError(error, { action: 'createEventsCollection', collection: collectionName });
    throw error;
  }
}

/**
 * Create sessions collection with indexes
 */
async function createSessionsCollection(db: Db): Promise<void> {
  const collectionName = 'sessions';

  try {
    const collections = await db.listCollections({ name: collectionName }).toArray();

    if (collections.length === 0) {
      await db.createCollection(collectionName);
    }

    const collection = db.collection(collectionName);

    // Create indexes
    await collection.createIndex(
      { userId: 1, startTime: -1 },
      { name: 'userId_startTime', sparse: true }
    );

    await collection.createIndex(
      { anonymousId: 1, startTime: -1 },
      { name: 'anonymousId_startTime' }
    );

    await collection.createIndex(
      { startTime: -1 },
      { name: 'startTime_desc' }
    );

    // TTL index - automatically delete sessions older than 90 days
    await collection.createIndex(
      { startTime: 1 },
      { name: 'startTime_ttl', expireAfterSeconds: 90 * 24 * 60 * 60 }
    );
  } catch (error) {
    logError(error, { action: 'createSessionsCollection', collection: collectionName });
    throw error;
  }
}

/**
 * Create users collection with indexes
 */
async function createUsersCollection(db: Db): Promise<void> {
  const collectionName = 'users';

  try {
    const collections = await db.listCollections({ name: collectionName }).toArray();

    if (collections.length === 0) {
      await db.createCollection(collectionName);
    }

    const collection = db.collection(collectionName);

    // Create indexes
    await collection.createIndex(
      { anonymousIds: 1 },
      { name: 'anonymousIds' }
    );

    await collection.createIndex(
      { lastSeen: -1 },
      { name: 'lastSeen_desc' }
    );

    await collection.createIndex(
      { firstSeen: -1 },
      { name: 'firstSeen_desc' }
    );
  } catch (error) {
    logError(error, { action: 'createUsersCollection', collection: collectionName });
    throw error;
  }
}

/**
 * Create page_views collection with indexes
 */
async function createPageViewsCollection(db: Db): Promise<void> {
  const collectionName = 'page_views';

  try {
    const collections = await db.listCollections({ name: collectionName }).toArray();

    if (collections.length === 0) {
      await db.createCollection(collectionName);
    }

    const collection = db.collection(collectionName);

    // Create indexes
    await collection.createIndex(
      { sessionId: 1, timestamp: -1 },
      { name: 'sessionId_timestamp' }
    );

    await collection.createIndex(
      { 'page.path': 1, timestamp: -1 },
      { name: 'path_timestamp' }
    );

    await collection.createIndex(
      { timestamp: -1 },
      { name: 'timestamp_desc' }
    );

    // TTL index
    await collection.createIndex(
      { timestamp: 1 },
      { name: 'timestamp_ttl', expireAfterSeconds: 90 * 24 * 60 * 60 }
    );
  } catch (error) {
    logError(error, { action: 'createPageViewsCollection', collection: collectionName });
    throw error;
  }
}

/**
 * Create product_interactions collection with indexes
 */
async function createProductInteractionsCollection(db: Db): Promise<void> {
  const collectionName = 'product_interactions';

  try {
    const collections = await db.listCollections({ name: collectionName }).toArray();

    if (collections.length === 0) {
      await db.createCollection(collectionName);
    }

    const collection = db.collection(collectionName);

    // Create indexes
    await collection.createIndex(
      { productId: 1, timestamp: -1 },
      { name: 'productId_timestamp' }
    );

    await collection.createIndex(
      { eventType: 1, timestamp: -1 },
      { name: 'eventType_timestamp' }
    );

    await collection.createIndex(
      { sessionId: 1 },
      { name: 'sessionId' }
    );

    // TTL index
    await collection.createIndex(
      { timestamp: 1 },
      { name: 'timestamp_ttl', expireAfterSeconds: 90 * 24 * 60 * 60 }
    );
  } catch (error) {
    logError(error, { action: 'createProductInteractionsCollection', collection: collectionName });
    throw error;
  }
}

/**
 * Create heatmap_data collection with indexes
 */
async function createHeatmapDataCollection(db: Db): Promise<void> {
  const collectionName = 'heatmap_data';

  try {
    const collections = await db.listCollections({ name: collectionName }).toArray();

    if (collections.length === 0) {
      await db.createCollection(collectionName);
    }

    const collection = db.collection(collectionName);

    // Create indexes
    await collection.createIndex(
      { 'page.path': 1, timestamp: -1 },
      { name: 'path_timestamp' }
    );

    await collection.createIndex(
      { sessionId: 1 },
      { name: 'sessionId' }
    );

    // TTL index - keep heatmap data for 30 days only (large dataset)
    await collection.createIndex(
      { timestamp: 1 },
      { name: 'timestamp_ttl', expireAfterSeconds: 30 * 24 * 60 * 60 }
    );
  } catch (error) {
    logError(error, { action: 'createHeatmapDataCollection', collection: collectionName });
    throw error;
  }
}

/**
 * Drop all analytics collections (use with caution!)
 *
 * This will permanently delete all analytics data.
 * Only use in development or when resetting the analytics system.
 *
 * @param db - MongoDB database instance
 */
export async function dropAllCollections(db: Db): Promise<void> {
  const collections = [
    'events',
    'sessions',
    'users',
    'page_views',
    'product_interactions',
    'heatmap_data',
  ];

  try {
    for (const collectionName of collections) {
      try {
        await db.collection(collectionName).drop();
      } catch (error) {
        // Ignore error if collection doesn't exist
        if ((error as any).code !== 26) {
          throw error;
        }
      }
    }
  } catch (error) {
    logError(error, { action: 'dropAllCollections' });
    throw error;
  }
}
