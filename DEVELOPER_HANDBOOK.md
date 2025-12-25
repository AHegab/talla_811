# Talla E-Commerce Platform - Developer Handbook

**Version:** 2025.7.0
**Last Updated:** December 24, 2024
**Framework:** Shopify Hydrogen (React Router v7)

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Architecture](#project-architecture)
4. [Shopify Integration](#shopify-integration)
5. [File Structure & Explanations](#file-structure--explanations)
6. [Key Features](#key-features)
7. [Data Flow](#data-flow)
8. [Development Guide](#development-guide)
9. [Deployment](#deployment)

---

## Project Overview

Talla is a premium e-commerce platform built on **Shopify Hydrogen**, a React-based framework optimized for headless Shopify stores. The project leverages modern web technologies to deliver a high-performance, customizable shopping experience.

### Key Objectives
- **Performance**: Server-side rendering (SSR) with optimized caching
- **Customization**: Full control over UI/UX beyond Shopify's default themes
- **Premium UX**: Advanced features like AI-powered size recommendations, visual search, and dynamic product recommendations
- **Shopify Integration**: Seamless connection to Shopify Admin for product/order management

---

## Technology Stack

### Core Framework
- **Shopify Hydrogen** (v2025.7.0) - React-based framework for Shopify storefronts
- **React Router** (v7.9.2) - File-based routing and data loading
- **React** (v18.3.1) - UI component library
- **TypeScript** (v5.9.2) - Type-safe development

### Styling
- **Tailwind CSS** (v4.1.6) - Utility-first CSS framework
- **Custom CSS** - Brand-specific design system

### Build Tools
- **Vite** (v6.4.1) - Fast build tool and dev server
- **GraphQL Codegen** - Auto-generate TypeScript types from Shopify GraphQL schema

### Shopify APIs
- **Storefront API** - Product data, cart, checkout
- **Customer Account API** - User authentication and orders
- **Admin API** - Webhooks for inventory updates

---

## Project Architecture

### Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           React Components (Hydrogen)                  │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐    │  │
│  │  │  Pages   │  │Components│  │   React Router   │    │  │
│  │  └──────────┘  └──────────┘  └──────────────────┘    │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           ▲
                           │ GraphQL Queries
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   Oxygen (Edge Runtime)                      │
│  ┌───────────────────────────────────────────────────────┐  │
│  │        Server-Side Rendering (SSR)                     │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐    │  │
│  │  │ Loaders  │  │  Cache   │  │   API Routes     │    │  │
│  │  └──────────┘  └──────────┘  └──────────────────┘    │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           ▲
                           │ GraphQL API
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     Shopify Backend                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐    │  │
│  │  │ Products │  │   Cart   │  │   Customer       │    │  │
│  │  └──────────┘  └──────────┘  └──────────────────┘    │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐    │  │
│  │  │  Orders  │  │Inventory │  │   Webhooks       │    │  │
│  │  └──────────┘  └──────────┘  └──────────────────┘    │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Key Concepts

1. **File-Based Routing**: Routes are defined by file structure in `app/routes/`
2. **Data Loaders**: Each route has a `loader()` function that fetches data server-side
3. **GraphQL Queries**: All Shopify data is fetched via GraphQL Storefront API
4. **SSR + Hydration**: Pages render on server, then React hydrates on client
5. **Edge Caching**: Oxygen edge network caches responses for performance

---

## Shopify Integration

### How Shopify Powers the Store

#### 1. **Storefront API** (Primary Data Source)
The Shopify Storefront API provides all product, collection, cart, and checkout data.

**Connection Setup:**
- Environment variables in `.env`:
  ```env
  PUBLIC_STOREFRONT_API_TOKEN=xxxxx
  PUBLIC_STORE_DOMAIN=your-store.myshopify.com
  ```
- GraphQL client configured in `app/lib/context.ts`

**What Shopify Manages:**
- ✅ Products (title, description, images, variants, pricing)
- ✅ Collections (categories, filters)
- ✅ Inventory (stock levels, availability)
- ✅ Cart & Checkout (add to cart, discounts, checkout URL)
- ✅ Customer Accounts (login, orders, addresses)
- ✅ Orders (order history, tracking)

**What This App Handles:**
- ✅ Custom UI/UX (product pages, collection pages, cart drawer)
- ✅ Advanced features (size recommendations, visual search, restock notifications)
- ✅ Performance optimizations (caching, SSR)

#### 2. **Customer Account API**
Handles user authentication and order management.

**Key Features:**
- Customer login/logout
- Order history
- Address management
- Profile updates

**Files:**
- `app/routes/($locale).account.tsx` - Account dashboard
- `app/routes/($locale).account_.login.tsx` - Login page
- `app/routes/($locale).account.orders._index.tsx` - Order list

#### 3. **Admin API** (Webhooks)
Listens for inventory updates from Shopify Admin.

**Webhook Endpoint:**
- `app/routes/webhooks.inventory-update.tsx`
- Triggered when product inventory changes
- Used for restock notification emails

#### 4. **Checkout**
Checkout is handled by **Shopify's hosted checkout** (not custom).

**Flow:**
1. User adds products to cart (custom UI)
2. User clicks "Checkout" button
3. Redirected to `https://your-store.myshopify.com/checkout`
4. Completes purchase on Shopify checkout
5. Redirected back to order confirmation

**Why?** Shopify checkout is PCI-compliant, secure, and handles all payment gateways.

---

## File Structure & Explanations

### Root Files

| File | Purpose |
|------|---------|
| `package.json` | Dependencies, scripts, project metadata |
| `vite.config.ts` | Vite build configuration |
| `tsconfig.json` | TypeScript compiler options |
| `tailwind.config.ts` | Tailwind CSS configuration |
| `.env` | Environment variables (API keys, domain) |
| `.shopify/project.json` | Shopify CLI project configuration |

---

### `/app` - Application Code

#### `app/root.tsx` (Root Layout)
**Purpose:** Top-level layout wrapper for entire app.

**What it does:**
- Loads global data (header, footer, cart)
- Wraps app in `<PageLayout>` component
- Provides Shopify Analytics
- Handles global error boundaries

**Key Functions:**
- `loader()` - Fetches header/footer menus from Shopify
- `Layout()` - HTML structure (`<html>`, `<head>`, `<body>`)
- `ErrorBoundary()` - Global error handling

**Shopify Integration:**
```typescript
const [header] = await storefront.query(HEADER_QUERY, {
  cache: storefront.CacheLong(), // Cache for performance
});
```

---

### `/app/routes` - Pages & API Routes

Routes are **file-based**. File name = URL path.

#### Product Pages

**`products.$handle.tsx`**
- **URL:** `/products/crew-neck-shirt`
- **Purpose:** Product detail page (PDP)
- **Loader:** Fetches product data, similar products
- **Component:** Renders `<ProductPage>` component

**Shopify Data Fetched:**
```graphql
query ProductQuery($handle: String!) {
  product(handle: $handle) {
    id, title, description, images, variants, metafields
    # Custom metafields for size chart, fabric type, etc.
  }
}
```

**Key Features:**
- Product images gallery
- Size selection
- Color swatches
- Add to cart
- Size recommendation modal
- Similar products

---

#### Collection Pages

**`($locale).collections.$handle.tsx`**
- **URL:** `/collections/bags`
- **Purpose:** Collection/category listing
- **Loader:** Fetches collection + products with filters
- **Features:** Filtering, sorting, pagination

**Filters Supported:**
- Price range
- Availability (in stock / out of stock)
- Product type
- Vendor (brand)

---

#### Cart & Checkout

**`($locale).cart.tsx`**
- **URL:** `/cart`
- **Purpose:** Full-page cart view
- **Component:** `<CartMain>` component

**Cart Flow:**
1. User clicks "Add to Cart" → `<AddToCartButton>` component
2. Submits to `/cart` route via `<CartForm>` (Hydrogen component)
3. Hydrogen updates Shopify cart via Storefront API
4. Cart drawer opens (`<Aside type="cart">`)
5. User clicks "Checkout" → Redirects to Shopify checkout

---

#### Account Pages

**`($locale).account.tsx`**
- **URL:** `/account`
- **Purpose:** Account dashboard (orders, addresses, profile)

**Sub-routes:**
- `account.orders._index.tsx` - Order history
- `account.orders.$id.tsx` - Single order details
- `account.addresses.tsx` - Manage addresses
- `account.profile.tsx` - Update profile

**Authentication:**
- Uses **Shopify Customer Account API**
- Login handled by `account_.login.tsx`
- Session stored in cookies

---

#### API Routes

**`api.recommend-size.tsx`**
- **URL:** `/api/recommend-size`
- **Method:** POST
- **Purpose:** AI-powered size recommendation
- **Input:** User measurements (height, weight, body shape)
- **Output:** Recommended size + confidence score

**Algorithm:**
1. Fetch product size dimensions from metafield
2. Estimate user body measurements from input
3. Compare user measurements to garment dimensions
4. Account for fabric stretch, fit preference
5. Return recommended size

---

**`api.restock-notify.tsx`**
- **URL:** `/api/restock-notify`
- **Method:** POST
- **Purpose:** Subscribe to restock notifications
- **Storage:** Shopify Admin Metafields (per variant)

**Flow:**
1. User submits email for out-of-stock variant
2. Email saved to variant metafield (JSON array)
3. When inventory updates (webhook), email sent
4. Email removed from metafield

---

**`api.search-by-image.tsx`**
- **URL:** `/api/search-by-image`
- **Method:** POST
- **Purpose:** Visual product search (upload image, find similar)
- **Implementation:** Color extraction + tag matching

---

**`webhooks.inventory-update.tsx`**
- **URL:** `/webhooks/inventory-update`
- **Method:** POST
- **Purpose:** Shopify webhook listener for inventory changes
- **Trigger:** When product inventory increases in Shopify Admin
- **Action:** Send restock emails to subscribers

---

### `/app/components` - Reusable UI Components

#### Layout Components

**`PageLayout.tsx`**
- Wraps all pages with header, footer, aside drawers
- Provides cart, search, mobile menu drawers
- Uses `<Aside.Provider>` for state management

**`Header.tsx`**
- Fixed header with navigation, search, account, cart icons
- Hides on scroll down, shows on scroll up
- Dark background with white text

**`Footer.tsx`**
- Footer with links, social media, newsletter signup

**`Aside.tsx`**
- Drawer/modal component for cart, search, mobile menu
- Slide-in from right
- Accessible (keyboard navigation, ARIA)

---

#### Product Components

**`ProductPage.tsx`**
- Main product page component
- Orchestrates all PDP elements
- Manages size recommendation modal state
- **Hides ProductHeader when cart is open** (recent change)

**`ProductHeader.tsx`**
- Fixed bottom bar on product pages
- Shows product title, price, size/color selectors, add to cart
- Includes size guide button
- Displays size chart table in modal

**`ProductImagesVertical.tsx`**
- Vertical scrolling image gallery
- Mobile-optimized
- Shows size guide link overlay

**`ProductDescription.tsx`**
- Product description text
- Fabric type
- Model size info
- Vendor (brand)

---

#### Size Recommendation Components

**`SizeRecommendationPrompt.tsx`**
- Full-featured size recommendation form
- Collects user measurements (height, weight, age, body shape, fit preference)
- Displays results with confidence score
- Shows estimated measurements vs. garment measurements
- Includes size comparison table

**`SizeRecommendation.tsx`**
- Simpler size recommendation component
- Used in some legacy flows

**`SizeChart.tsx`**
- Displays size chart image from metafield
- Fallback message if no chart available

---

#### Cart Components

**`CartMain.tsx`**
- Main cart UI (used in both cart page and drawer)
- Lists cart items
- Shows subtotal
- Checkout button

**`CartLineItem.tsx`**
- Individual cart item
- Image, title, variant, quantity selector, remove button

**`CartSummary.tsx`**
- Cart subtotal, discounts, checkout button

**`AddToCartButton.tsx`**
- Submits to Shopify cart via `<CartForm>` (Hydrogen)
- Shows loading state during submission

---

#### Collection Components

**`ProductCard.tsx`**
- Product thumbnail on collection pages
- Image, title, price
- Hover effects

**`ProductGrid.tsx`**
- Grid layout for product cards

**`SearchFilters.tsx`**
- Filter UI (price, availability, type, vendor)
- Sort dropdown
- Mobile-responsive

---

### `/app/lib` - Utility Functions

**`context.ts`**
- Creates Shopify Storefront API client
- Configures caching strategies
- Exports `createStorefrontClient()`

**`fragments.ts`**
- GraphQL query fragments (reusable query parts)
- `HEADER_QUERY`, `FOOTER_QUERY`, `PRODUCT_FRAGMENT`, etc.

**`fabricMapping.ts`**
- Maps Shopify material names to standardized fabric types
- Used for size recommendation algorithm
- Example: "Cotton" → "cotton", "Lycra Blend" → "highly_elastic"

**`brandFitProfiles.ts`**
- Brand-specific fit adjustments
- Some brands run small/large
- Modifies size recommendations accordingly

**`similarProductsConfig.ts`**
- Configuration for "Similar Products" feature
- How many tag overlaps required
- Fallback strategies (vendor, product type)

**`similarProductsUtils.ts`**
- Helper functions for finding similar products
- `filterByTagOverlap()`, `vendorFallback()`, `productTypeFallback()`

**`session.ts`**
- Session management utilities
- Cookie-based session storage

**`redirect.ts`**
- Handles redirects for localized handles
- If Shopify returns a different handle (e.g., SEO redirect), redirects user

---

### `/app/styles` - Stylesheets

**`app.css`**
- Main application styles
- Custom component styles
- Overrides and utilities

**`tailwind.css`**
- Tailwind base, components, utilities
- Configured with custom colors, fonts

**`talla-design-system.css`**
- Brand-specific design tokens
- Colors, typography, spacing

**`fonts.css`**
- Custom font imports
- Font-face declarations

**`reset.css`**
- CSS reset for cross-browser consistency

---

## Key Features

### 1. AI-Powered Size Recommendation

**How it Works:**
1. Product has `size_dimensions` metafield (JSON with chest, waist, length, etc.)
2. User enters measurements + fit preference in modal
3. Algorithm estimates body measurements from height/weight/body shape
4. Compares user measurements to each size's garment dimensions
5. Accounts for fabric stretch (`fabricType` metafield)
6. Returns recommended size + confidence score

**Files:**
- `api.recommend-size.tsx` - Backend logic
- `SizeRecommendationPrompt.tsx` - Frontend UI
- `fabricMapping.ts` - Fabric type definitions
- `brandFitProfiles.ts` - Brand-specific adjustments

**Shopify Metafields Required:**
- `custom.size_dimensions` (JSON) - Garment measurements per size
- `custom.fabric_type` (String) - Fabric material
- `custom.model_size` (String) - What size model is wearing

---

### 2. Restock Notifications

**How it Works:**
1. User enters email for out-of-stock variant
2. Email saved to variant's `custom.restock_emails` metafield (JSON array)
3. Shopify sends webhook when inventory increases
4. `webhooks.inventory-update.tsx` processes webhook
5. Sends email to all subscribers via `/api/send-restock-email`
6. Removes emails from metafield after sending

**Files:**
- `api.restock-notify.tsx` - Subscribes user
- `webhooks.inventory-update.tsx` - Processes Shopify webhook
- `api.send-restock-email.tsx` - Sends email via SMTP/API
- `admin.restock-notifications.tsx` - Admin dashboard to view/manage subscriptions

**Shopify Setup:**
- Create webhook in Shopify Admin: `Products/Update` → `https://your-site.com/webhooks/inventory-update`

---

### 3. Visual Search

**How it Works:**
1. User uploads image
2. Image analyzed for dominant colors
3. Products searched by color tags (e.g., "navy", "black")
4. Results ranked by color similarity

**Files:**
- `api.search-by-image.tsx` - Image processing + search

**Limitations:**
- Basic color matching (no ML model)
- Relies on accurate product tagging

---

### 4. Similar Products

**How it Works:**
1. On product page, fetch products with overlapping tags
2. Require minimum tag overlap (configurable)
3. Fallback to vendor or product type if no tag matches
4. Display up to 5 similar products

**Files:**
- `products.$handle.tsx` - Fetches similar products in loader
- `SimilarProductsSection.tsx` - Displays similar products
- `similarProductsConfig.ts` - Configuration (overlap threshold, fallback)
- `similarProductsUtils.ts` - Helper functions

---

### 5. Dynamic Size Chart Display

**How it Works:**
1. Product has `custom.size_chart` metafield (image URL or reference)
2. When user clicks "Size Guide" button, modal opens
3. If `size_dimensions` metafield exists, displays table
4. If `size_chart` image exists, displays image

**Files:**
- `ProductHeader.tsx` - Size guide button + modal
- `SizeChart.tsx` - Displays chart image

**Recent Fix:**
- Array values (e.g., `[61, 64]`) now display as ranges "61-64 cm" instead of concatenated "6164"

---

## Data Flow

### Example: Product Page Load

1. **User navigates to `/products/crew-neck-shirt`**

2. **Server (Oxygen Edge):**
   - Calls `loader()` in `products.$handle.tsx`
   - Executes GraphQL query to Shopify:
     ```graphql
     query ProductQuery($handle: "crew-neck-shirt") {
       product(handle: $handle) { ... }
     }
     ```
   - Receives product data from Shopify
   - Fetches similar products (tag-based search)
   - Returns data to React Router

3. **React Router:**
   - Passes data to `Product()` component
   - Renders `<ProductPage>` with data
   - Sends HTML to browser (SSR)

4. **Browser:**
   - Receives HTML
   - React hydrates (makes interactive)
   - User can now interact (select size, add to cart)

5. **User clicks "Add to Cart":**
   - `<AddToCartButton>` submits to `/cart`
   - Hydrogen's `<CartForm>` sends GraphQL mutation:
     ```graphql
     mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
       cartLinesAdd(cartId: $cartId, lines: $lines) { ... }
     }
     ```
   - Shopify updates cart
   - Cart drawer opens with updated cart

---

### Example: Size Recommendation

1. **User clicks "Size Guide" button on PDP**

2. **Frontend:**
   - `ProductHeader.tsx` opens modal
   - Renders `<SizeRecommendationPrompt>` component
   - Shows form (height, weight, body shape, fit preference)

3. **User submits form:**
   - Sends POST to `/api/recommend-size` with:
     ```json
     {
       "height": 175,
       "weight": 70,
       "gender": "male",
       "abdomenShape": "medium",
       "hipShape": "average",
       "wearingPreference": "normal",
       "sizeDimensions": { "S": {...}, "M": {...} }
     }
     ```

4. **Backend (`api.recommend-size.tsx`):**
   - Estimates user's chest, waist measurements from BMI
   - Adjusts for body shape (abdomen, hips)
   - Compares to each size's garment dimensions
   - Accounts for fabric stretch
   - Calculates fit score for each size
   - Returns recommended size + confidence

5. **Frontend:**
   - Displays result: "Recommended Size: M (85% confidence)"
   - Shows estimated measurements vs. garment measurements
   - Shows size comparison table
   - User clicks "Select Size M" → Size M auto-selected

---

## Development Guide

### Setup

1. **Clone repository:**
   ```bash
   git clone <repo-url>
   cd talla
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   - Copy `.env.example` to `.env`
   - Fill in Shopify credentials:
     ```env
     PUBLIC_STOREFRONT_API_TOKEN=xxxxx
     PUBLIC_STORE_DOMAIN=your-store.myshopify.com
     PUBLIC_STOREFRONT_ID=gid://shopify/...
     ```

4. **Run development server:**
   ```bash
   npm run dev
   ```
   - Opens at `http://localhost:3000`
   - Hot-reload enabled

---

### GraphQL Schema Updates

When Shopify schema changes (e.g., new metafields):

1. **Regenerate types:**
   ```bash
   npm run codegen
   ```
   - Fetches latest schema from Shopify
   - Generates TypeScript types in `storefrontapi.generated.d.ts`

2. **Update queries in `app/lib/fragments.ts`:**
   ```typescript
   const PRODUCT_FRAGMENT = `#graphql
     fragment ProductNonLocale on Product {
       id, title, description
       myNewMetafield: metafield(namespace: "custom", key: "my_new_field") {
         value
       }
     }
   `;
   ```

3. **Use in components:**
   ```typescript
   const myValue = product.myNewMetafield?.value;
   ```

---

### Adding New Features

#### Example: Add "Product Reviews" Feature

1. **Create review component:**
   ```tsx
   // app/components/ProductReviews.tsx
   export function ProductReviews({ productId }: { productId: string }) {
     const [reviews, setReviews] = useState([]);
     // Fetch reviews from API
     return <div>...</div>;
   }
   ```

2. **Add to product page:**
   ```tsx
   // app/routes/products.$handle.tsx
   import { ProductReviews } from '~/components/ProductReviews';

   export default function Product() {
     return (
       <ProductPage ...>
         <ProductReviews productId={product.id} />
       </ProductPage>
     );
   }
   ```

3. **Create API route (if needed):**
   ```tsx
   // app/routes/api.reviews.tsx
   export async function loader({ request }: Route.LoaderArgs) {
     const productId = new URL(request.url).searchParams.get('productId');
     // Fetch reviews from database or third-party service
     return json({ reviews });
   }
   ```

---

### Testing

Run tests:
```bash
npm test
```

Test files are in `app/routes/__tests__/` and `app/lib/__tests__/`.

Example test structure:
```typescript
import { describe, it, expect } from 'vitest';
import { filterByTagOverlap } from '../similarProductsUtils';

describe('filterByTagOverlap', () => {
  it('should filter products by tag overlap', () => {
    const products = [
      { tags: ['red', 'cotton', 'shirt'] },
      { tags: ['blue', 'polyester', 'pants'] },
    ];
    const result = filterByTagOverlap(products, ['red', 'shirt'], 2);
    expect(result).toHaveLength(1);
  });
});
```

---

### Code Style

- **TypeScript** for all new code
- **Functional components** with hooks
- **Tailwind** for styling (avoid inline styles)
- **GraphQL** for Shopify data (no REST API)
- **ESLint** for linting: `npm run lint`
- **Prettier** for formatting

---

## Deployment

### Shopify Oxygen (Production)

Talla deploys to **Shopify Oxygen**, Shopify's edge hosting platform.

1. **Link project to Shopify:**
   ```bash
   npm run shopify hydrogen link
   ```

2. **Deploy:**
   ```bash
   npm run shopify hydrogen deploy
   ```
   - Builds production bundle
   - Uploads to Oxygen
   - Assigns URL: `https://<workspace>.oxygen.shopifypreview.com`

3. **Connect custom domain:**
   - In Shopify Admin > Online Store > Domains
   - Add custom domain (e.g., `talla.com`)
   - Update DNS records

---

### Environment Variables (Production)

Set in Shopify Oxygen dashboard:
- `PUBLIC_STOREFRONT_API_TOKEN`
- `PUBLIC_STORE_DOMAIN`
- `PUBLIC_STOREFRONT_ID`
- `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` (for restock emails)

---

### Webhooks Setup

1. **In Shopify Admin > Settings > Notifications > Webhooks:**
   - Add webhook: `Products/Update`
   - URL: `https://your-site.com/webhooks/inventory-update`
   - Format: JSON
   - API version: 2024-10

2. **Verify webhook signature** in `webhooks.inventory-update.tsx`:
   ```typescript
   const hmac = request.headers.get('X-Shopify-Hmac-Sha256');
   // Verify signature matches
   ```

---

## Common Issues & Solutions

### Issue: Products not loading

**Cause:** Storefront API token invalid or expired.

**Solution:**
1. Check `.env` file has correct `PUBLIC_STOREFRONT_API_TOKEN`
2. Regenerate token in Shopify Admin > Apps > Create custom app
3. Restart dev server

---

### Issue: Cart not updating

**Cause:** Hydrogen cart utilities not initialized.

**Solution:**
1. Ensure `cart.get()` is called in `root.tsx` loader
2. Check `<Analytics.Provider cart={data.cart}>` wraps app
3. Verify `<CartForm>` is used (not custom form submission)

---

### Issue: Size chart not displaying

**Cause:** Metafield `custom.size_chart` not set or incorrect format.

**Solution:**
1. In Shopify Admin, edit product
2. Set `size_chart` metafield (type: File or Single line text)
3. Ensure value is image URL or file reference
4. Clear cache and refresh page

---

### Issue: Size recommendations inaccurate

**Cause:** Missing or incorrect `size_dimensions` metafield.

**Solution:**
1. Verify `custom.size_dimensions` metafield exists on product
2. Check JSON format:
   ```json
   {
     "S": { "chest": [61, 64], "length": [69, 71] },
     "M": { "chest": [64, 67], "length": [71, 73] }
   }
   ```
3. Ensure measurements are in centimeters
4. Verify `fabric_type` metafield is set correctly

---

### Issue: Webhook not receiving events

**Cause:** Webhook URL incorrect or signature verification failing.

**Solution:**
1. Check webhook URL in Shopify Admin matches deployed URL
2. Verify webhook is enabled and subscribed to `Products/Update`
3. Check webhook signature verification code
4. Test with Shopify webhook tester

---

## Performance Optimization

### Caching Strategies

Hydrogen provides built-in caching:

```typescript
// Long cache (1 hour)
const product = await storefront.query(PRODUCT_QUERY, {
  cache: storefront.CacheLong(),
});

// Short cache (5 minutes)
const products = await storefront.query(COLLECTION_QUERY, {
  cache: storefront.CacheShort(),
});

// No cache
const cart = await storefront.query(CART_QUERY, {
  cache: storefront.CacheNone(),
});
```

**Cache Locations:**
- Oxygen edge nodes (global CDN)
- Browser cache (via Cache-Control headers)

---

### Image Optimization

Use Shopify CDN image transformations:

```tsx
<img
  src={`${product.featuredImage.url}&width=800`}
  alt={product.title}
  loading="lazy"
/>
```

**Supported params:**
- `width=800` - Resize width
- `height=600` - Resize height
- `crop=center` - Crop mode
- `quality=80` - JPEG quality

---

### Code Splitting

React Router automatically code-splits routes.

**Manual code splitting:**
```tsx
import { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

function MyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HeavyComponent />
    </Suspense>
  );
}
```

---

## Security Best Practices

### Environment Variables

- **Never commit `.env` file**
- Store secrets in Oxygen environment variables (production)
- Use `PUBLIC_` prefix only for client-safe variables
- Rotate API tokens regularly

### Input Validation

Always validate user input:

```typescript
export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const email = formData.get('email');

  if (!email || !email.includes('@')) {
    return json({ error: 'Invalid email' }, { status: 400 });
  }
  // ...
}
```

### CSRF Protection

Hydrogen provides CSRF protection via session tokens.

Ensure forms use Hydrogen's form components:
```tsx
<CartForm action={CartForm.ACTIONS.LinesAdd}>
  {/* Hydrogen adds CSRF token automatically */}
</CartForm>
```

---

## Troubleshooting Development

### Clear Build Cache

```bash
rm -rf .react-router .shopify/build build
npm run build
```

### Reset Shopify CLI

```bash
shopify hydrogen logout
shopify hydrogen login
```

### View Network Requests

Enable debug mode:
```bash
DEBUG=* npm run dev
```

Shows all GraphQL queries and responses in terminal.

---

## Additional Resources

- [Shopify Hydrogen Docs](https://shopify.dev/docs/custom-storefronts/hydrogen)
- [Storefront API Reference](https://shopify.dev/docs/api/storefront)
- [React Router v7 Docs](https://reactrouter.com/)
- [Tailwind CSS Docs](https://tailwindcss.com/)

---

## Contact & Support

For questions or issues:
1. Check this documentation
2. Review Shopify Hydrogen docs
3. Search GitHub issues: [github.com/Shopify/hydrogen/issues](https://github.com/Shopify/hydrogen/issues)
4. Contact development team

---

**Last Updated:** December 24, 2024
**Maintained By:** Talla Development Team
