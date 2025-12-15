import { MongoClient, type Db } from 'mongodb';
import { withTimeout, retryWithBackoff, logError } from '~/utils/errorHandling';

/**
 * MongoDB Connection Utility
 *
 * Provides connection pooling optimized for edge runtime (Cloudflare Workers).
 * Features:
 * - Connection caching to avoid creating new connections per request
 * - Timeout handling (10 second max)
 * - Automatic retry with exponential backoff
 * - Health check function
 * - Graceful error handling
 */

// Global connection cache for edge runtime
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;
let connectionPromise: Promise<MongoClient> | null = null;

/**
 * Get MongoDB database connection
 *
 * @param env - Environment variables containing MONGODB_URI and MONGODB_DATABASE
 * @returns MongoDB database instance
 * @throws Error if connection fails or environment variables are missing
 */
export async function getMongoDBConnection(env: Env): Promise<Db> {
  // Validate environment variables
  if (!env.MONGODB_URI) {
    const error = new Error('MONGODB_URI environment variable is not set');
    logError(error, { action: 'getMongoDBConnection', step: 'validate-env' });
    throw error;
  }

  if (!env.MONGODB_DATABASE) {
    const error = new Error('MONGODB_DATABASE environment variable is not set');
    logError(error, { action: 'getMongoDBConnection', step: 'validate-env' });
    throw error;
  }

  // Return cached database if available
  if (cachedDb && cachedClient) {
    return cachedDb;
  }

  try {
    // If a connection is already in progress, wait for it
    if (connectionPromise) {
      await connectionPromise;
      if (cachedDb) {
        return cachedDb;
      }
    }

    // Create new connection with retry logic
    connectionPromise = retryWithBackoff(
      async () => {
        const client = new MongoClient(env.MONGODB_URI, {
          maxPoolSize: 10,
          minPoolSize: 2,
          serverSelectionTimeoutMS: 10000,
          socketTimeoutMS: 10000,
          connectTimeoutMS: 10000,
        });

        // Connect with timeout
        await withTimeout(
          client.connect(),
          10000,
          'MongoDB connection timeout (10 seconds)'
        );

        return client;
      },
      {
        maxRetries: 3,
        initialDelay: 1000,
        maxDelay: 5000,
        onRetry: (attempt, error) => {
          logError(error, {
            action: 'getMongoDBConnection',
            step: 'retry-connection',
            attempt,
          });
        },
      }
    );

    const client = await connectionPromise;
    cachedClient = client;
    cachedDb = client.db(env.MONGODB_DATABASE);

    return cachedDb;
  } catch (error) {
    logError(error, { action: 'getMongoDBConnection', step: 'connect' });

    // Clear cache on error
    cachedClient = null;
    cachedDb = null;
    connectionPromise = null;

    throw new Error(
      `Failed to connect to MongoDB: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Close MongoDB connection
 *
 * Should be called during application shutdown or when connection needs to be reset.
 * Note: In edge runtime (Cloudflare Workers), connections are typically managed automatically.
 */
export async function closeConnection(): Promise<void> {
  try {
    if (cachedClient) {
      await withTimeout(
        cachedClient.close(),
        5000,
        'MongoDB close connection timeout'
      );
    }
  } catch (error) {
    logError(error, { action: 'closeConnection' });
  } finally {
    cachedClient = null;
    cachedDb = null;
    connectionPromise = null;
  }
}

/**
 * Health check for MongoDB connection
 *
 * @param env - Environment variables
 * @returns true if connection is healthy, false otherwise
 */
export async function healthCheck(env: Env): Promise<boolean> {
  try {
    const db = await withTimeout(
      getMongoDBConnection(env),
      5000,
      'MongoDB health check timeout'
    );

    // Ping the database
    await withTimeout(
      db.admin().ping(),
      3000,
      'MongoDB ping timeout'
    );

    return true;
  } catch (error) {
    logError(error, { action: 'healthCheck' });
    return false;
  }
}

/**
 * Get analytics enabled status from environment
 *
 * @param env - Environment variables
 * @returns true if analytics is enabled, false otherwise
 */
export function isAnalyticsEnabled(env: Env): boolean {
  return env.ANALYTICS_ENABLED === 'true' || env.ANALYTICS_ENABLED === '1';
}
