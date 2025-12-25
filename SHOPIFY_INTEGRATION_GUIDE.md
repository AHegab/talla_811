# Shopify Integration Guide

Complete guide to how Talla integrates with Shopify, including setup, data flow, and common workflows.

---

## Table of Contents

1. [Shopify Setup](#shopify-setup)
2. [API Integration](#api-integration)
3. [Data Synchronization](#data-synchronization)
4. [Custom Metafields](#custom-metafields)
5. [Webhooks Configuration](#webhooks-configuration)
6. [Common Workflows](#common-workflows)
7. [Troubleshooting](#troubleshooting)

---

## Shopify Setup

### Prerequisites

1. **Shopify Plus or Standard Plan**
   - Hydrogen requires Shopify plan with API access
   - Custom Storefront API access

2. **Shopify Admin Access**
   - Admin permissions to create custom apps
   - Access to Settings > Apps and sales channels

---

### Step 1: Create Custom Storefront App

1. **Navigate to Shopify Admin:**
   - Settings > Apps and sales channels > Develop apps

2. **Create App:**
   - Click "Create an app"
   - Name: "Talla Hydrogen Storefront"
   - App developer: Your name/email

3. **Configure API Scopes:**

   **Storefront API:**
   - `unauthenticated_read_product_listings`
   - `unauthenticated_read_product_inventory`
   - `unauthenticated_read_product_tags`
   - `unauthenticated_read_collection_listings`
   - `unauthenticated_write_checkouts`
   - `unauthenticated_read_checkouts`
   - `unauthenticated_read_content`
   - `unauthenticated_read_metaobjects`

   **Admin API (for webhooks):**
   - `read_products`
   - `write_products` (for metafield updates)
   - `read_inventory`

4. **Install App:**
   - Click "Install app"
   - Copy Storefront API access token
   - Save to `.env` file:
     ```env
     PUBLIC_STOREFRONT_API_TOKEN=shpat_xxxxxxxxxxxxx
     PUBLIC_STORE_DOMAIN=your-store.myshopify.com
     ```

---

### Step 2: Configure Custom Metafields

Metafields extend Shopify products with custom data.

#### Product Metafields

1. **Navigate to:**
   - Settings > Custom data > Products

2. **Add Metafield: Size Dimensions**
   - Name: `Size Dimensions`
   - Namespace and key: `custom.size_dimensions`
   - Type: JSON
   - Description: "Garment measurements for each size (in cm)"

   **Example Value:**
   ```json
   {
     "S": {
       "chest": [61, 64],
       "waist": [58, 61],
       "length": [69, 71],
       "arm": [58, 59],
       "shoulder": [40, 42]
     },
     "M": {
       "chest": [64, 67],
       "waist": [61, 64],
       "length": [71, 73],
       "arm": [59, 60],
       "shoulder": [42, 44]
     },
     "L": {
       "chest": [67, 70],
       "waist": [64, 67],
       "length": [73, 75],
       "arm": [60, 61],
       "shoulder": [44, 46]
     },
     "XL": {
       "chest": [70, 73],
       "waist": [67, 70],
       "length": [75, 77],
       "arm": [61, 62],
       "shoulder": [46, 48]
     }
   }
   ```

   **Note:** All measurements in centimeters (cm). Arrays represent min-max range.

3. **Add Metafield: Size Chart Image**
   - Name: `Size Chart`
   - Namespace and key: `custom.size_chart`
   - Type: File (or Single line text for URL)
   - Description: "Size chart image URL"

4. **Add Metafield: Fabric Type**
   - Name: `Fabric Type`
   - Namespace and key: `custom.fabric_type`
   - Type: Single line text
   - Description: "Material type (Cotton, Polyester, Lycra Blend, etc.)"

   **Accepted Values:**
   - `Cotton`
   - `Cotton Blend`
   - `Polyester`
   - `Jersey Knit`
   - `Lycra`
   - `Spandex`
   - etc.

5. **Add Metafield: Model Size**
   - Name: `Model Size`
   - Namespace and key: `custom.model_size`
   - Type: Single line text
   - Description: "Size the model is wearing (e.g., 'M')"

---

#### Variant Metafields

1. **Navigate to:**
   - Settings > Custom data > Variants

2. **Add Metafield: Restock Emails**
   - Name: `Restock Emails`
   - Namespace and key: `custom.restock_emails`
   - Type: JSON
   - Description: "List of emails for restock notifications"

   **Example Value:**
   ```json
   [
     "user1@example.com",
     "user2@example.com"
   ]
   ```

   **Note:** This is auto-populated by the restock notification feature. You don't need to set it manually.

---

### Step 3: Set Up Customer Accounts

1. **Enable Customer Accounts:**
   - Settings > Customer accounts
   - Enable: "Accounts are optional"
   - Or: "Accounts are required" (for logged-in only checkout)

2. **Enable New Customer Accounts (Recommended):**
   - Settings > Customer accounts > New customer accounts
   - This enables the Customer Account API used by Hydrogen

3. **Configure Login Methods:**
   - Email + password
   - Social login (optional)

---

## API Integration

### Storefront API

The Storefront API is the primary data source for Talla.

#### Authentication

All requests include the Storefront API token:

```typescript
const response = await fetch('https://your-store.myshopify.com/api/2024-10/graphql.json', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Shopify-Storefront-Access-Token': env.PUBLIC_STOREFRONT_API_TOKEN,
  },
  body: JSON.stringify({ query, variables }),
});
```

#### Key Queries

**Fetch Product:**
```graphql
query Product($handle: String!) {
  product(handle: $handle) {
    id
    title
    description
    handle
    images(first: 10) {
      nodes {
        url
        altText
      }
    }
    variants(first: 100) {
      nodes {
        id
        title
        price { amount currencyCode }
        availableForSale
        selectedOptions { name value }
      }
    }
    metafields(identifiers: [
      { namespace: "custom", key: "size_dimensions" },
      { namespace: "custom", key: "fabric_type" }
    ]) {
      key
      value
    }
  }
}
```

**Fetch Collection:**
```graphql
query Collection($handle: String!, $first: Int!) {
  collection(handle: $handle) {
    id
    title
    description
    products(first: $first) {
      nodes {
        id
        title
        handle
        priceRange {
          minVariantPrice { amount currencyCode }
        }
        featuredImage { url altText }
      }
    }
  }
}
```

**Add to Cart:**
```graphql
mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
  cartLinesAdd(cartId: $cartId, lines: $lines) {
    cart {
      id
      lines(first: 100) {
        nodes {
          id
          merchandise { ... on ProductVariant { id title } }
          quantity
        }
      }
    }
  }
}
```

---

### Customer Account API

Used for authenticated customer actions.

#### Login Flow

1. User clicks "Login"
2. Redirected to Shopify Customer Account login
3. User authenticates
4. Redirected back to `/account/authorize` with auth code
5. Exchange code for access token
6. Store token in session cookie
7. Use token for customer queries

**Example Query:**
```graphql
query Customer {
  customer {
    id
    firstName
    lastName
    email
    orders(first: 10) {
      nodes {
        id
        orderNumber
        totalPrice { amount currencyCode }
        fulfillmentStatus
      }
    }
  }
}
```

---

### Admin API (Webhooks Only)

The Admin API is used for:
- Receiving webhooks
- Updating metafields (restock emails)

**Not used for:** Product data, cart, checkout (use Storefront API)

---

## Data Synchronization

### How Data Flows

```
Shopify Admin
     │
     │ (Admin edits product)
     │
     ▼
Shopify Database
     │
     │ (GraphQL Storefront API)
     │
     ▼
Talla App (Oxygen)
     │
     │ (SSR + Caching)
     │
     ▼
User Browser
```

### Caching Strategy

**Oxygen Edge Cache:**
- Products: 1 hour (`CacheLong`)
- Collections: 1 hour
- Cart: No cache (`CacheNone`)
- Customer data: No cache

**When to Revalidate:**
- Product update: Wait for cache expiry (1 hour) OR manually purge cache
- Inventory change: Real-time via webhook
- Price change: Wait for cache expiry

**Manual Cache Purge:**
```bash
# Redeploy to clear all caches
npm run shopify hydrogen deploy
```

---

### Real-Time Updates

**Inventory via Webhooks:**
1. Product inventory changes in Shopify Admin
2. Shopify sends `products/update` webhook
3. Talla processes webhook
4. Sends restock emails if inventory increased
5. Cache purge (optional)

**Cart Updates:**
- Cart is always fetched fresh (no cache)
- Updates reflect immediately

---

## Custom Metafields

### Why Metafields?

Metafields allow storing custom data not native to Shopify:
- Size dimensions
- Fabric type
- Model size
- Restock notification subscribers

### Reading Metafields

**In GraphQL Query:**
```graphql
product(handle: $handle) {
  sizeDimensions: metafield(namespace: "custom", key: "size_dimensions") {
    value
    type
  }
  fabricType: metafield(namespace: "custom", key: "fabric_type") {
    value
  }
}
```

**In Component:**
```typescript
const sizeDimensions = JSON.parse(product.sizeDimensions?.value || '{}');
const fabricType = product.fabricType?.value || 'cotton';
```

---

### Writing Metafields

**From Shopify Admin:**
1. Edit product
2. Scroll to metafields section
3. Fill in values

**Programmatically (Admin API):**
```typescript
const response = await fetch(
  `https://${env.SHOPIFY_STORE_DOMAIN}/admin/api/2024-10/graphql.json`,
  {
    method: 'POST',
    headers: {
      'X-Shopify-Access-Token': env.ADMIN_API_TOKEN,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `
        mutation UpdateVariantMetafield($input: ProductVariantInput!) {
          productVariantUpdate(input: $input) {
            productVariant {
              id
              metafields(first: 10) {
                nodes { key value }
              }
            }
          }
        }
      `,
      variables: {
        input: {
          id: 'gid://shopify/ProductVariant/123',
          metafields: [
            {
              namespace: 'custom',
              key: 'restock_emails',
              value: JSON.stringify(['user@example.com']),
              type: 'json',
            },
          ],
        },
      },
    }),
  }
);
```

**Used in:** `api.restock-notify.tsx` to save emails

---

## Webhooks Configuration

### Webhook: Product Update

**Purpose:** Detect inventory changes for restock notifications

**Event:** `products/update`

**Setup:**

1. **In Shopify Admin:**
   - Settings > Notifications > Webhooks
   - Click "Create webhook"

2. **Configure:**
   - Event: `Product update`
   - Format: JSON
   - URL: `https://your-site.com/webhooks/inventory-update`
   - API version: `2024-10`

3. **Test:**
   - Update a product's inventory in Shopify Admin
   - Check webhook delivery logs
   - Verify Talla received webhook (check server logs)

---

### Webhook Payload

**Example:**
```json
{
  "id": 7582894178500,
  "title": "Crew Neck Shirt",
  "handle": "crew-neck-shirt",
  "variants": [
    {
      "id": 42339050152132,
      "title": "M / Navy",
      "sku": "CREW-M-NAVY",
      "inventory_quantity": 10,
      "old_inventory_quantity": 0,
      "inventory_management": "shopify"
    }
  ],
  "updated_at": "2024-12-24T12:00:00Z"
}
```

---

### Webhook Security

**HMAC Signature Verification:**

Shopify signs webhooks with HMAC-SHA256.

**Verify in Code:**
```typescript
const hmac = request.headers.get('X-Shopify-Hmac-Sha256');
const body = await request.text();

const hash = crypto
  .createHmac('sha256', env.SHOPIFY_WEBHOOK_SECRET)
  .update(body, 'utf8')
  .digest('base64');

if (hash !== hmac) {
  throw new Error('Invalid webhook signature');
}
```

**Get Webhook Secret:**
- Shown when creating webhook in Shopify Admin
- Save to `.env` as `SHOPIFY_WEBHOOK_SECRET`

---

## Common Workflows

### Workflow 1: User Browses Products

**Steps:**

1. **User visits `/collections/bags`**

2. **Server (Talla):**
   - Calls `loader()` in `collections.$handle.tsx`
   - Queries Shopify:
     ```graphql
     collection(handle: "bags") {
       products(first: 24) { ... }
     }
     ```
   - Returns data

3. **React:**
   - Renders product grid
   - User sees products

4. **User clicks product:**
   - Navigates to `/products/leather-bag`
   - Repeats process for product page

---

### Workflow 2: User Adds to Cart

**Steps:**

1. **User selects size/color on PDP**

2. **User clicks "Add to Cart":**
   - `<AddToCartButton>` submits form
   - Posts to `/cart` route

3. **Hydrogen's `<CartForm>`:**
   - Calls `cartLinesAdd` GraphQL mutation
   - Shopify adds item to cart
   - Returns updated cart

4. **Cart drawer opens:**
   - `<Aside type="cart">` renders
   - Shows updated cart items

5. **User proceeds to checkout:**
   - Clicks "Checkout" button
   - Redirects to `cart.checkoutUrl`
   - Example: `https://your-store.myshopify.com/checkout/c/abc123...`

6. **User completes purchase on Shopify Checkout:**
   - Enters shipping/payment info
   - Places order

7. **Shopify processes order:**
   - Creates order in Shopify Admin
   - Sends confirmation email
   - User can view order in `/account/orders`

---

### Workflow 3: User Gets Size Recommendation

**Steps:**

1. **User clicks "Size Guide" on PDP**

2. **Modal opens:**
   - Shows size chart table (from `size_dimensions` metafield)
   - Shows size recommendation form

3. **User fills form:**
   - Height: 175 cm
   - Weight: 70 kg
   - Gender: Male
   - Body shape: Medium abdomen, Average hips
   - Fit preference: Normal

4. **User submits:**
   - POST to `/api/recommend-size`
   - Request body includes measurements + product size dimensions

5. **API processes:**
   - Estimates user's chest/waist from BMI
   - Compares to each size's garment dimensions
   - Accounts for fabric stretch
   - Returns recommended size: "M" with 85% confidence

6. **UI displays result:**
   - Shows recommended size
   - Shows estimated vs. garment measurements
   - User clicks "Select Size M"

7. **Size auto-selected:**
   - "M" size button highlighted
   - User can now add to cart

---

### Workflow 4: User Subscribes to Restock Notification

**Steps:**

1. **User visits PDP for out-of-stock variant**

2. **"Add to Cart" button shows "Sold Out":**
   - Button disabled
   - "Notify Me" button appears

3. **User clicks "Notify Me":**
   - Modal/form opens
   - User enters email

4. **User submits email:**
   - POST to `/api/restock-notify`
   - Email saved to variant's `restock_emails` metafield

5. **Confirmation:**
   - Success message: "You'll be notified when this item is back in stock"

6. **Later: Admin restocks product in Shopify:**
   - Inventory increased from 0 to 10

7. **Shopify sends webhook:**
   - `products/update` webhook to `/webhooks/inventory-update`

8. **Talla processes webhook:**
   - Detects inventory increase
   - Fetches `restock_emails` from variant metafield
   - Sends email to each subscriber

9. **User receives email:**
   - Subject: "Back in Stock: Crew Neck Shirt (M / Navy)"
   - Link to product

10. **Email removed from metafield:**
    - User won't receive duplicate emails

---

### Workflow 5: User Logs In & Views Orders

**Steps:**

1. **User clicks "Account" icon in header**

2. **Redirects to `/account/login`:**
   - Shopify Customer Account login page

3. **User enters email/password:**
   - Shopify authenticates
   - Redirects to `/account/authorize?code=abc123`

4. **Talla exchanges code for token:**
   - Calls Customer Account API
   - Gets access token
   - Stores in session cookie

5. **Redirects to `/account`:**
   - Dashboard page

6. **User clicks "Orders":**
   - Navigates to `/account/orders`

7. **Talla fetches orders:**
   - Queries Customer Account API:
     ```graphql
     customer {
       orders(first: 10) { ... }
     }
     ```
   - Returns order list

8. **UI displays orders:**
   - Order number, date, total, status
   - User clicks order to see details

---

## Troubleshooting

### Issue: Products not showing

**Possible Causes:**
1. Storefront API token invalid
2. Products not published to "Headless" sales channel
3. GraphQL query error

**Solutions:**

1. **Verify API token:**
   - Check `.env` has correct `PUBLIC_STOREFRONT_API_TOKEN`
   - Regenerate token in Shopify Admin if needed

2. **Check product availability:**
   - In Shopify Admin, edit product
   - Scroll to "Product availability"
   - Ensure "Headless" channel is checked

3. **Check GraphQL query:**
   - Add `console.log()` to log query errors
   - Use Shopify GraphQL Explorer to test query

---

### Issue: Cart not updating

**Possible Causes:**
1. Cart ID expired
2. Variant out of stock
3. GraphQL mutation error

**Solutions:**

1. **Clear cart:**
   - Delete cart cookie
   - Refresh page
   - New cart will be created

2. **Check inventory:**
   - Verify variant is in stock in Shopify Admin

3. **Check mutation:**
   - Log GraphQL errors
   - Verify `lines` input format:
     ```typescript
     lines: [{ merchandiseId: 'gid://...', quantity: 1 }]
     ```

---

### Issue: Metafields not appearing

**Possible Causes:**
1. Metafield definition missing
2. Wrong namespace/key
3. Value not set on product

**Solutions:**

1. **Check metafield definition:**
   - Settings > Custom data > Products
   - Ensure metafield exists

2. **Verify namespace/key:**
   - Must match exactly: `custom.size_dimensions`
   - Case-sensitive

3. **Set metafield value:**
   - Edit product
   - Scroll to metafields section
   - Set value

4. **Query metafield correctly:**
   ```graphql
   metafield(namespace: "custom", key: "size_dimensions") {
     value
   }
   ```

---

### Issue: Webhooks not receiving

**Possible Causes:**
1. Webhook URL incorrect
2. HMAC verification failing
3. Webhook disabled

**Solutions:**

1. **Verify webhook URL:**
   - Check in Shopify Admin > Settings > Notifications > Webhooks
   - Must match deployed URL exactly

2. **Check HMAC verification:**
   - Ensure `SHOPIFY_WEBHOOK_SECRET` in `.env` matches webhook secret
   - Test with webhook tester

3. **Enable webhook:**
   - In Shopify Admin, ensure webhook is enabled

4. **Check webhook logs:**
   - Shopify Admin > Settings > Notifications > Webhooks > Click webhook
   - View "Recent deliveries"
   - Check response codes (should be 200)

---

### Issue: Size recommendation inaccurate

**Possible Causes:**
1. `size_dimensions` metafield incorrect
2. Measurements in wrong units
3. Fabric type not set

**Solutions:**

1. **Verify size dimensions:**
   - Check JSON format is correct
   - Ensure all sizes have all measurements
   - Example:
     ```json
     {
       "S": {
         "chest": [61, 64],
         "length": [69, 71]
       }
     }
     ```

2. **Check units:**
   - All measurements must be in centimeters (cm)
   - NOT inches

3. **Set fabric type:**
   - Set `custom.fabric_type` metafield
   - Use values like "Cotton", "Lycra Blend", etc.

4. **Test algorithm:**
   - Try different measurements
   - Check confidence score
   - Verify estimated measurements make sense

---

## Advanced Customization

### Adding New Product Fields

**Example: Add "Care Instructions" field**

1. **Create metafield in Shopify:**
   - Name: `Care Instructions`
   - Namespace: `custom`
   - Key: `care_instructions`
   - Type: Multi-line text

2. **Query metafield:**
   ```typescript
   // In app/lib/fragments.ts
   const PRODUCT_FRAGMENT = `#graphql
     fragment Product on Product {
       ...
       careInstructions: metafield(namespace: "custom", key: "care_instructions") {
         value
       }
     }
   `;
   ```

3. **Display in component:**
   ```tsx
   // In app/components/ProductDescription.tsx
   export function ProductDescription({ product }) {
     return (
       <div>
         <p>{product.description}</p>
         {product.careInstructions?.value && (
           <div>
             <h3>Care Instructions</h3>
             <p>{product.careInstructions.value}</p>
           </div>
         )}
       </div>
     );
   }
   ```

---

### Custom Checkout Fields

Hydrogen doesn't support fully custom checkout (must use Shopify Checkout).

**Options:**
1. **Use Shopify Checkout Extensibility** - Add custom fields to Shopify Checkout
2. **Collect info before checkout** - Capture data on cart page, save to cart attributes
3. **Use order notes** - Add note field before checkout

**Example: Order Notes**
```tsx
<CartForm action={CartForm.ACTIONS.NoteUpdate}>
  <textarea name="note" placeholder="Order notes" />
  <button type="submit">Save Note</button>
</CartForm>
```

---

## Best Practices

### 1. Metafield Naming

- Use `custom` namespace for all custom fields
- Use snake_case for keys: `size_dimensions`, not `sizeDimensions`
- Be descriptive: `fabric_type` not `fabric`

### 2. GraphQL Queries

- Request only needed fields
- Use fragments to avoid repetition
- Paginate large lists (don't fetch all products at once)

### 3. Caching

- Cache product/collection data (1 hour)
- Don't cache cart or customer data
- Purge cache after major updates

### 4. Error Handling

- Always handle GraphQL errors
- Provide user-friendly error messages
- Log errors for debugging

### 5. Performance

- Optimize images (use Shopify CDN)
- Lazy load components
- Minimize GraphQL query complexity

---

## Resources

- [Shopify Storefront API Docs](https://shopify.dev/docs/api/storefront)
- [Shopify Admin API Docs](https://shopify.dev/docs/api/admin-graphql)
- [Hydrogen Docs](https://shopify.dev/docs/custom-storefronts/hydrogen)
- [Metafields Guide](https://shopify.dev/docs/apps/build/custom-data/metafields)
- [Webhooks Guide](https://shopify.dev/docs/apps/build/webhooks)

---

**End of Shopify Integration Guide**

For overall project architecture, see `DEVELOPER_HANDBOOK.md`.
For component details, see `COMPONENT_REFERENCE.md`.
