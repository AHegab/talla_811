/**
 * Server-side notification storage
 *
 * In production, replace this with a proper database (PostgreSQL, MongoDB, etc.)
 * For now, we'll use in-memory storage that persists in the server process
 */

interface RestockNotification {
  email: string;
  productId: string;
  variantId: string;
  productTitle: string;
  variantTitle: string;
  timestamp: string;
  status: 'pending' | 'sent' | 'failed';
}

// In-memory storage (resets when server restarts)
// In production, use a database or Shopify metafields
const notifications: Map<string, RestockNotification[]> = new Map();

/**
 * Add a notification request
 */
export function addNotification(notification: Omit<RestockNotification, 'status'>): void {
  const key = notification.variantId;
  const existing = notifications.get(key) || [];

  // Check if email already exists for this variant
  const duplicate = existing.find(n => n.email === notification.email);
  if (duplicate) {
    console.log('⚠️  Notification already exists for:', notification.email, key);
    return;
  }

  existing.push({
    ...notification,
    status: 'pending',
  });

  notifications.set(key, existing);
  console.log('✅ Notification added:', notification.email, 'for variant:', key);
}

/**
 * Get all pending notifications for a variant
 */
export function getNotificationsByVariant(variantId: string): RestockNotification[] {
  return (notifications.get(variantId) || []).filter(n => n.status === 'pending');
}

/**
 * Mark notification as sent
 */
export function markAsSent(variantId: string, email: string): void {
  const existing = notifications.get(variantId) || [];
  const notification = existing.find(n => n.email === email);

  if (notification) {
    notification.status = 'sent';
    console.log('✅ Notification marked as sent:', email, variantId);
  }
}

/**
 * Mark notification as failed
 */
export function markAsFailed(variantId: string, email: string): void {
  const existing = notifications.get(variantId) || [];
  const notification = existing.find(n => n.email === email);

  if (notification) {
    notification.status = 'failed';
    console.log('❌ Notification marked as failed:', email, variantId);
  }
}

/**
 * Get all notifications (for admin dashboard)
 */
export function getAllNotifications(): RestockNotification[] {
  const all: RestockNotification[] = [];
  notifications.forEach(variants => {
    all.push(...variants);
  });
  return all.filter(n => n.status === 'pending');
}

/**
 * Clear sent notifications older than 7 days
 */
export function cleanupOldNotifications(): void {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  notifications.forEach((variants, key) => {
    const filtered = variants.filter(n => {
      if (n.status === 'sent') {
        const notificationDate = new Date(n.timestamp);
        return notificationDate > sevenDaysAgo;
      }
      return true; // Keep pending and failed
    });

    if (filtered.length === 0) {
      notifications.delete(key);
    } else {
      notifications.set(key, filtered);
    }
  });

  console.log('🧹 Cleaned up old notifications');
}

/**
 * Get storage stats
 */
export function getStats() {
  let pending = 0;
  let sent = 0;
  let failed = 0;

  notifications.forEach(variants => {
    variants.forEach(n => {
      if (n.status === 'pending') pending++;
      else if (n.status === 'sent') sent++;
      else if (n.status === 'failed') failed++;
    });
  });

  return { pending, sent, failed, totalVariants: notifications.size };
}
