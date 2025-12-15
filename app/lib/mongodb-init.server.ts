/**
 * MongoDB Schema Documentation
 *
 * Since we're using MongoDB Data API (HTTP-based), indexes must be created
 * manually in MongoDB Atlas UI. This file documents the required schema.
 *
 * Collections:
 * 1. events - Main event stream (all user actions)
 * 2. sessions - Aggregated session data
 * 3. users - User profiles (merged anonymous → logged-in)
 * 4. page_views - Dedicated page analytics
 * 5. product_interactions - Product-specific events
 * 6. heatmap_data - Mouse movement samples
 */

/**
 * REQUIRED INDEXES (Create manually in MongoDB Atlas)
 *
 * Collection: events
 * - { sessionId: 1, timestamp: -1 } - name: "sessionId_timestamp"
 * - { userId: 1, timestamp: -1 } - name: "userId_timestamp", sparse: true
 * - { anonymousId: 1, timestamp: -1 } - name: "anonymousId_timestamp"
 * - { eventType: 1, timestamp: -1 } - name: "eventType_timestamp"
 * - { timestamp: 1 } - name: "timestamp_ttl", expireAfterSeconds: 7776000 (90 days)
 *
 * Collection: sessions
 * - { userId: 1, startTime: -1 } - name: "userId_startTime", sparse: true
 * - { anonymousId: 1, startTime: -1 } - name: "anonymousId_startTime"
 * - { startTime: -1 } - name: "startTime_desc"
 * - { startTime: 1 } - name: "startTime_ttl", expireAfterSeconds: 7776000 (90 days)
 *
 * Collection: users
 * - { anonymousIds: 1 } - name: "anonymousIds"
 * - { lastSeen: -1 } - name: "lastSeen_desc"
 * - { firstSeen: -1 } - name: "firstSeen_desc"
 *
 * Collection: page_views
 * - { sessionId: 1, timestamp: -1 } - name: "sessionId_timestamp"
 * - { "page.path": 1, timestamp: -1 } - name: "path_timestamp"
 * - { timestamp: -1 } - name: "timestamp_desc"
 * - { timestamp: 1 } - name: "timestamp_ttl", expireAfterSeconds: 7776000 (90 days)
 *
 * Collection: product_interactions
 * - { productId: 1, timestamp: -1 } - name: "productId_timestamp"
 * - { eventType: 1, timestamp: -1 } - name: "eventType_timestamp"
 * - { sessionId: 1 } - name: "sessionId"
 * - { timestamp: 1 } - name: "timestamp_ttl", expireAfterSeconds: 7776000 (90 days)
 *
 * Collection: heatmap_data
 * - { "page.path": 1, timestamp: -1 } - name: "path_timestamp"
 * - { sessionId: 1 } - name: "sessionId"
 * - { timestamp: 1 } - name: "timestamp_ttl", expireAfterSeconds: 2592000 (30 days)
 */

/**
 * SCHEMA EXAMPLES
 *
 * events:
 * {
 *   sessionId: "uuid",
 *   anonymousId: "uuid",
 *   userId: "shopify_customer_id", // optional
 *   eventType: "pageview",
 *   eventData: {},
 *   page: { url, path, title, referrer },
 *   timestamp: ISODate(),
 *   userAgent: "string",
 *   deviceType: "desktop|mobile|tablet",
 *   screenSize: { width: 1920, height: 1080 }
 * }
 *
 * sessions:
 * {
 *   sessionId: "uuid",
 *   userId: "shopify_customer_id", // optional
 *   anonymousId: "uuid",
 *   startTime: ISODate(),
 *   endTime: ISODate(),
 *   duration: 12345, // milliseconds
 *   pageViews: 5,
 *   scrollDepthMax: 75,
 *   addedToCart: false,
 *   startedCheckout: false
 * }
 *
 * users:
 * {
 *   userId: "shopify_customer_id",
 *   anonymousIds: ["uuid1", "uuid2"],
 *   firstSeen: ISODate(),
 *   lastSeen: ISODate(),
 *   totalSessions: 10,
 *   totalPageViews: 50
 * }
 */

export const MONGODB_SCHEMA_VERSION = '1.0.0';
