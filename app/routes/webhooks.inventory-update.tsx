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

    console.log('📦 Inventory Update Webhook Received:', {
      variantId: payload.inventory_item_id,
      available: payload.available,
      shop: shopDomain,
    });

    // Check if item is now in stock
    if (payload.available && payload.available > 0) {
      const variantId = `gid://shopify/ProductVariant/${payload.inventory_item_id}`;

      // Get notification requests from localStorage equivalent (we'll use a better storage later)
      // For now, this needs to be stored server-side
      console.log('🔔 Item back in stock! Variant ID:', variantId);
      console.log('⚠️  To send emails, check notification requests and send to customers');

      // TODO: Query stored notifications and send emails
      // This requires server-side storage (database or Shopify metafields)
    }

    return new Response('Webhook processed', { status: 200 });
  } catch (error) {
    console.error('Error processing inventory webhook:', error);
    return new Response('Error processing webhook', { status: 500 });
  }
}
