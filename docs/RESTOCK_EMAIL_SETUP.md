# Restock Email Notifications - Setup Guide

## 🚨 Important: Email Setup Required

The restock notification system **stores customer requests** but does NOT automatically send emails yet. You need to complete the setup below.

## Quick Start (5 minutes)

### Option 1: SendGrid (Recommended - Free for 100 emails/day)

1. **Sign up for SendGrid**
   - Go to https://signup.sendgrid.com/
   - Free plan: 100 emails/day forever

2. **Create API Key**
   - Login → Settings → API Keys → Create API Key
   - Name: `TALLA Restock Notifications`
   - Permissions: Full Access (or Mail Send only)
   - Copy the API key (you'll only see it once!)

3. **Verify Sender Email**
   - Settings → Sender Authentication → Single Sender Verification
   - Enter your email (e.g., `noreply@yourdomain.com`)
   - Check your inbox and verify

4. **Add to Environment**
   ```bash
   # Add to your .env file
   SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxx
   PUBLIC_STORE_URL=https://yourdomain.com
   ```

5. **Update Email Template**
   - Edit `app/utils/sendRestockEmail.ts`
   - Line 26: Change `'noreply@yourdomain.com'` to your verified sender email

### Option 2: Resend (Modern alternative)

1. **Sign up for Resend**
   - Go to https://resend.com/signup
   - Free plan: 100 emails/day

2. **Get API Key**
   - Dashboard → API Keys → Create API Key
   - Copy the key

3. **Verify Domain** (optional but recommended)
   - Dashboard → Domains → Add Domain
   - Follow DNS setup instructions

4. **Add to Environment**
   ```bash
   # Add to your .env file
   RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxx
   PUBLIC_STORE_URL=https://yourdomain.com
   ```

## How It Works Now

### Current Flow:

1. ✅ Customer clicks "Notify me when available"
2. ✅ Request saved to localStorage + API
3. ✅ Admin can view requests at `/admin/restock-notifications`
4. ❌ **Emails NOT sent automatically** (needs setup above)

### After Setup:

1. ✅ Customer requests notification
2. ✅ Request saved
3. ✅ When you restock, go to admin dashboard
4. ✅ Click "Send Email" for each customer
5. ✅ Beautiful email sent automatically

## Viewing Notification Requests

### Method 1: Admin Dashboard (Visual)
```
https://yourdomain.com/admin/restock-notifications
```

You'll see:
- List of all customer requests
- Product names and variants
- Customer emails
- "Send Email" button for each

### Method 2: Browser Console (Developer)
```javascript
// Open DevTools Console
JSON.parse(localStorage.getItem('talla_restock_notifications'))
```

### Method 3: Server Logs
Check your terminal where `npm run dev` is running for:
```
📧 Restock Notification Request: { ... }
```

## Sending Emails

### Manual Process (Current):

1. Go to `/admin/restock-notifications`
2. Find restocked items
3. Click "Send Email" button
4. Email sent automatically via configured service

### Automated Process (Future Enhancement):

Set up Shopify webhook:
1. Shopify Admin → Settings → Notifications → Webhooks
2. Create webhook: `Inventory Levels Update`
3. URL: `https://yourdomain.com/webhooks/inventory-update`
4. Format: JSON
5. Webhook will automatically detect restocks and send emails

## Testing

### Test the Email Integration:

1. Make sure you have at least one notification request
2. Add your email service API key to `.env`
3. Restart your dev server: `npm run dev`
4. Go to `/admin/restock-notifications`
5. Click "Send Email"
6. Check the customer's inbox!

### Test Email Template:

Create a test notification request:
```javascript
// Browser console on any product page
fetch('/api/restock-notify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'your-test-email@gmail.com',
    productId: 'test-product',
    variantId: 'test-variant',
    productTitle: 'Test Product',
    variantTitle: 'Size M / Black'
  })
});
```

Then send yourself a test email from the admin dashboard!

## Production Checklist

Before going live:

- [ ] Email service API key added to `.env`
- [ ] Sender email verified with email provider
- [ ] Test email sent successfully
- [ ] Email template customized (logo, colors, etc.)
- [ ] Admin dashboard tested
- [ ] Consider setting up Shopify webhooks for automation
- [ ] Consider moving from localStorage to database storage

## Troubleshooting

### "No email service configured" error
- Check your `.env` file has `SENDGRID_API_KEY` or `RESEND_API_KEY`
- Restart your dev server after adding env variables

### Email not sending
- Verify your sender email with the provider
- Check API key is correct and active
- Check server console for error messages
- Try sending a test email via provider's dashboard first

### Can't see notifications in admin
- Notifications are stored in browser localStorage
- They won't persist across different browsers/devices
- For production, consider using a database instead

## Next Steps

1. **Now:** Set up SendGrid/Resend (5 minutes)
2. **Soon:** Test sending emails from admin dashboard
3. **Later:** Set up Shopify webhooks for automation
4. **Future:** Move to database storage for persistence

## Need Help?

- SendGrid Docs: https://docs.sendgrid.com/
- Resend Docs: https://resend.com/docs
- Shopify Webhooks: https://shopify.dev/docs/api/admin-rest/2024-01/resources/webhook

---

## Quick Reference

**Admin Dashboard:** `/admin/restock-notifications`

**API Endpoint:** `POST /api/restock-notify`

**Email Utility:** `app/utils/sendRestockEmail.ts`

**Webhook Handler:** `app/routes/webhooks.inventory-update.tsx`
