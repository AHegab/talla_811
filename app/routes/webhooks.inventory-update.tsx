import type { ActionFunctionArgs } from '@shopify/remix-oxygen';

/**
 * Shopify Inventory Update Webhook Handler
 *
 * This webhook is triggered when inventory levels change.
 * Set it up in Shopify Admin:
 * Settings → Notifications → Webhooks → Create webhook
 * Event: Inventory Levels Update
 * Format: JSON
 * URL: https://yourdomain.com/webhooks/inventory-update
 */

interface InventoryUpdatePayload {
  inventory_item_id: number;
  available?: number;
  location_id?: number;
  updated_at?: string;
}

export async function action({ request }: ActionFunctionArgs) {
  // Verify webhook is from Shopify
  const hmacHeader = request.headers.get('X-Shopify-Hmac-Sha256');
  const shopDomain = request.headers.get('X-Shopify-Shop-Domain');

  if (!hmacHeader || !shopDomain) {
    console.error('Invalid webhook request - missing headers');
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const payload = await request.json() as InventoryUpdatePayload;

    // Check if item is now in stock
    if (payload.available && payload.available > 0) {
      const variantId = `gid://shopify/ProductVariant/${payload.inventory_item_id}`;

      // Feature: Query stored notifications and send restocking emails
      // Requires: Backend implementation with database or Shopify metafields storage
    }

    return new Response('Webhook processed', { status: 200 });
  } catch (error) {
    console.error('Error processing inventory webhook:', error);
    return new Response('Error processing webhook', { status: 500 });
  }
}
