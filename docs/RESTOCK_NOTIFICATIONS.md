# Restock Notifications Integration Guide

## Overview
The restock notification system is now fully integrated with a backend API. When customers request notifications for out-of-stock items, the system will:

1. POST to `/api/restock-notify`
2. Validate the request
3. Log the notification (console)
4. Optionally send emails or save to database

## Environment Variables

Add these to your `.env` file:

```bash
# Store admin email (receives restock notification requests)
STORE_ADMIN_EMAIL=admin@yourdomain.com

# SendGrid Integration (Optional)
SENDGRID_API_KEY=your_sendgrid_api_key_here

# Custom Database Integration (Optional)
DATABASE_URL=https://your-database-api.com

# Shopify Flow (Optional - Requires Shopify Plus)
SHOPIFY_FLOW_ENABLED=true
```

## Integration Options

### Option 1: Email to Store Admin (SendGrid)

1. Sign up for [SendGrid](https://sendgrid.com/)
2. Get your API key
3. Add to `.env`:
   ```bash
   SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
   STORE_ADMIN_EMAIL=admin@yourdomain.com
   ```
4. Uncomment the SendGrid code in `app/routes/api.restock-notify.tsx` (line 52-62)

### Option 2: Klaviyo Integration

1. Sign up for [Klaviyo](https://www.klaviyo.com/)
2. Create a "Back in Stock" flow
3. Add this code to the API route:

```typescript
// Send to Klaviyo
await fetch('https://a.klaviyo.com/api/v2/list/{LIST_ID}/subscribe', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    api_key: context.env.KLAVIYO_API_KEY,
    profiles: [
      {
        email: email,
        $consent: ['email'],
        properties: {
          product_id: productId,
          variant_id: variantId,
          product_title: productTitle,
          variant_title: variantTitle,
        },
      },
    ],
  }),
});
```

### Option 3: Mailchimp Integration

1. Sign up for [Mailchimp](https://mailchimp.com/)
2. Create an audience list
3. Add this code:

```typescript
await fetch(`https://{dc}.api.mailchimp.com/3.0/lists/{LIST_ID}/members`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${context.env.MAILCHIMP_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email_address: email,
    status: 'subscribed',
    merge_fields: {
      PRODUCT: productTitle,
      VARIANT: variantTitle,
      PRDID: productId,
      VARID: variantId,
    },
    tags: ['restock-notification'],
  }),
});
```

### Option 4: Save to Database

If you have a PostgreSQL/MySQL/MongoDB database:

```typescript
// Example with Prisma
await prisma.restockNotification.create({
  data: {
    email,
    productId,
    variantId,
    productTitle,
    variantTitle,
    status: 'pending',
    createdAt: new Date(),
  },
});
```

### Option 5: Shopify Flow (Shopify Plus Only)

Create a custom Flow that triggers when items are back in stock:

1. Go to Shopify Admin → Settings → Apps and sales channels
2. Install Shopify Flow
3. Create a new workflow
4. Trigger: Product inventory updated
5. Condition: Inventory quantity > 0
6. Action: Send email to customers who requested notifications

## Testing

1. Find a product variant that's out of stock
2. Click "Notify me when available"
3. Enter your email
4. Check your server logs (or email inbox if configured)

## Current Status

✅ API endpoint created: `/api/restock-notify`
✅ Frontend integrated with fetch API
✅ Data logged to console
✅ Backup to localStorage
⏳ Email integration (choose your provider)
⏳ Database storage (optional)

## Next Steps

1. Choose an email/notification provider (SendGrid, Klaviyo, Mailchimp)
2. Add API keys to `.env`
3. Uncomment the integration code in `app/routes/api.restock-notify.tsx`
4. Test with a real out-of-stock product
5. Monitor your admin email or database for notifications

## Viewing Stored Notifications

Currently, notifications are logged to the console. To view them:

```bash
# In your terminal where the dev server is running
# You'll see: 📧 Restock Notification Request: { ... }
```

Or check localStorage in browser DevTools:
```javascript
// Browser console
JSON.parse(localStorage.getItem('talla_restock_notifications'))
```

## Production Recommendations

For production, we recommend:

1. **Email Service**: Use Klaviyo (best for e-commerce) or SendGrid
2. **Database**: Store notifications in your database for tracking
3. **Admin Dashboard**: Create an admin page to view/manage notifications
4. **Automation**: Set up automated emails when items restock
5. **Analytics**: Track notification conversion rates

## Support

For questions or issues with the integration, check:
- SendGrid Docs: https://docs.sendgrid.com/
- Klaviyo Docs: https://developers.klaviyo.com/
- Shopify Flow: https://help.shopify.com/en/manual/shopify-flow
