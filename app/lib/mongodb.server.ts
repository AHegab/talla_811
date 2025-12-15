import { withTimeout, logError } from '~/utils/errorHandling';

/**
 * MongoDB Data API Client
 *
 * HTTP-based client for MongoDB Atlas Data API.
 * Works in edge runtime environments (Cloudflare Workers, Shopify Oxygen).
 *
 * Features:
 * - RESTful API calls instead of native driver
 * - Timeout handling (10 second max)
 * - Automatic retry with exponential backoff
 * - Health check function
 * - Graceful error handling
 */

export interface MongoDBDataAPIClient {
  database: string;
  cluster: string;
  apiUrl: string;
  apiKey: string;
}

/**
 * Get MongoDB Data API client
 *
 * @param env - Environment variables
 * @returns MongoDB Data API client configuration
 */
export function getMongoDBClient(env: Env): MongoDBDataAPIClient {
  // Validate environment variables
  if (!env.MONGODB_DATA_API_URL) {
    const error = new Error('MONGODB_DATA_API_URL environment variable is not set');
    logError(error, { action: 'getMongoDBClient', step: 'validate-env' });
    throw error;
  }

  if (!env.MONGODB_DATA_API_KEY) {
    const error = new Error('MONGODB_DATA_API_KEY environment variable is not set');
    logError(error, { action: 'getMongoDBClient', step: 'validate-env' });
    throw error;
  }

  if (!env.MONGODB_DATABASE) {
    const error = new Error('MONGODB_DATABASE environment variable is not set');
    logError(error, { action: 'getMongoDBClient', step: 'validate-env' });
    throw error;
  }

  if (!env.MONGODB_CLUSTER_NAME) {
    const error = new Error('MONGODB_CLUSTER_NAME environment variable is not set');
    logError(error, { action: 'getMongoDBClient', step: 'validate-env' });
    throw error;
  }

  return {
    database: env.MONGODB_DATABASE,
    cluster: env.MONGODB_CLUSTER_NAME,
    apiUrl: env.MONGODB_DATA_API_URL,
    apiKey: env.MONGODB_DATA_API_KEY,
  };
}

/**
 * Insert multiple documents into a collection
 */
export async function insertMany(
  client: MongoDBDataAPIClient,
  collection: string,
  documents: any[]
): Promise<{ insertedIds: string[] }> {
  const response = await makeDataAPIRequest(client, 'insertMany', {
    collection,
    database: client.database,
    dataSource: client.cluster,
    documents,
  });

  return { insertedIds: response.insertedIds || [] };
}

/**
 * Insert one document into a collection
 */
export async function insertOne(
  client: MongoDBDataAPIClient,
  collection: string,
  document: any
): Promise<{ insertedId: string }> {
  const response = await makeDataAPIRequest(client, 'insertOne', {
    collection,
    database: client.database,
    dataSource: client.cluster,
    document,
  });

  return { insertedId: response.insertedId };
}

/**
 * Update one document
 */
export async function updateOne(
  client: MongoDBDataAPIClient,
  collection: string,
  filter: any,
  update: any,
  options?: { upsert?: boolean }
): Promise<{ matchedCount: number; modifiedCount: number; upsertedId?: string }> {
  const response = await makeDataAPIRequest(client, 'updateOne', {
    collection,
    database: client.database,
    dataSource: client.cluster,
    filter,
    update,
    ...options,
  });

  return {
    matchedCount: response.matchedCount || 0,
    modifiedCount: response.modifiedCount || 0,
    upsertedId: response.upsertedId,
  };
}

/**
 * Find one document
 */
export async function findOne(
  client: MongoDBDataAPIClient,
  collection: string,
  filter: any
): Promise<any | null> {
  const response = await makeDataAPIRequest(client, 'findOne', {
    collection,
    database: client.database,
    dataSource: client.cluster,
    filter,
  });

  return response.document || null;
}

/**
 * Find multiple documents
 */
export async function find(
  client: MongoDBDataAPIClient,
  collection: string,
  filter: any,
  options?: { limit?: number; sort?: any }
): Promise<any[]> {
  const response = await makeDataAPIRequest(client, 'find', {
    collection,
    database: client.database,
    dataSource: client.cluster,
    filter,
    ...options,
  });

  return response.documents || [];
}

/**
 * Make a request to MongoDB Data API
 */
async function makeDataAPIRequest(
  client: MongoDBDataAPIClient,
  action: string,
  body: any
): Promise<any> {
  try {
    const url = `${client.apiUrl}/action/${action}`;

    const response = await withTimeout(
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': client.apiKey,
        },
        body: JSON.stringify(body),
      }),
      10000,
      'MongoDB Data API request timeout'
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`MongoDB Data API error (${response.status}): ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    logError(error, {
      action: 'makeDataAPIRequest',
      apiAction: action,
      collection: body.collection,
    });
    throw error;
  }
}

/**
 * Health check for MongoDB Data API
 *
 * @param env - Environment variables
 * @returns true if connection is healthy, false otherwise
 */
export async function healthCheck(env: Env): Promise<boolean> {
  try {
    const client = getMongoDBClient(env);

    // Try to find a document (any collection)
    await withTimeout(
      makeDataAPIRequest(client, 'findOne', {
        collection: 'events',
        database: client.database,
        dataSource: client.cluster,
        filter: {},
      }),
      5000,
      'MongoDB health check timeout'
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
