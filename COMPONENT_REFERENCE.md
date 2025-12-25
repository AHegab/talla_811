# Talla Component Reference Guide

Complete reference for every component, route, and utility file in the Talla codebase.

---

## Table of Contents

1. [Routes Reference](#routes-reference)
2. [Components Reference](#components-reference)
3. [Utilities Reference](#utilities-reference)
4. [Quick Reference Tables](#quick-reference-tables)

---

## Routes Reference

### Product Routes

#### `products.$handle.tsx`
**URL Pattern:** `/products/:handle`

**Purpose:** Product detail page (PDP)

**Loader Function:**
- Fetches product by handle from Shopify
- Loads similar products using tag-based search
- Fallback to vendor/productType if no tag matches
- Handles localized handle redirects

**Key GraphQL Queries:**
```graphql
PRODUCT_QUERY - Full product data including:
  - id, title, description, images
  - variants (price, availability, SKU)
  - metafields (size_dimensions, size_chart, fabric_type, model_size)
  - options (Size, Color, etc.)

PRODUCT_RECOMMENDATIONS_QUERY - Similar products:
  - Search by tags (up to 3 tags)
  - Filter by tag overlap count
  - Fallback to vendor or productType
```

**Component:** `<ProductPage>`

**Data Structure:**
```typescript
{
  product: ShopifyProduct,
  similarProducts: SimilarProduct[]
}
```

**Recent Changes:**
- Added ProductHeader hiding when cart is open (Dec 24, 2024)
- Fixed size chart display to show ranges instead of concatenated values (Dec 24, 2024)

---

#### `($locale).products.$handle.tsx`
Same as `products.$handle.tsx` but with locale prefix (e.g., `/en/products/...`)

---

### Collection Routes

#### `collections.$handle.tsx`
**URL Pattern:** `/collections/:handle`

**Purpose:** Category/collection listing page with filters

**Loader Function:**
- Fetches collection by handle
- Loads products with pagination (24 per page)
- Applies filters (price, availability, type, vendor)
- Applies sorting (featured, price, newest)

**Query Parameters:**
- `?page=2` - Pagination
- `?minPrice=50&maxPrice=100` - Price filter
- `?available=true` - Availability filter
- `?productType=Shirt` - Product type filter
- `?vendor=Nike` - Vendor filter
- `?sortKey=PRICE&reverse=false` - Sorting

**Key Features:**
- Server-side filtering
- Infinite scroll/pagination
- Filter state in URL
- SEO-friendly URLs

**Component:** Custom collection page layout

---

#### `collections.all.tsx`
**URL Pattern:** `/collections/all`

**Purpose:** All products listing

Special collection showing all available products with same filtering as collection pages.

---

#### `($locale).collections._index.tsx`
**URL Pattern:** `/collections`

**Purpose:** Collections listing page

Shows all available collections/categories.

---

### Cart & Checkout Routes

#### `cart.tsx`
**URL Pattern:** `/cart`

**Purpose:** Full-page cart view

**Loader Function:**
- Fetches cart data from Shopify
- Returns cart lines, totals, discount codes

**Component:** `<CartMain layout="page">`

**Actions:**
- Update line quantities
- Remove line items
- Apply discount codes
- Proceed to checkout (redirects to Shopify checkout)

---

#### `cart.$lines.tsx`
**URL Pattern:** `/cart/:lines`

**Purpose:** Handles cart mutations (add, update, remove)

**Example URLs:**
- `/cart/123:1` - Add variant 123, quantity 1
- `/cart/456:2,789:1` - Add multiple items

This is typically handled by Hydrogen's `<CartForm>` component.

---

### Account Routes

#### `account.tsx`
**URL Pattern:** `/account`

**Purpose:** Account layout wrapper

**Loader Function:**
- Checks if user is logged in
- Redirects to login if not authenticated
- Fetches customer data

**Layout:** Wraps all account sub-routes

---

#### `account._index.tsx`
**URL Pattern:** `/account` (index)

**Purpose:** Account dashboard overview

Shows summary of orders, addresses, and profile.

---

#### `account.orders._index.tsx`
**URL Pattern:** `/account/orders`

**Purpose:** Order history listing

**Loader Function:**
- Fetches customer orders via Customer Account API
- Paginated (10 orders per page)

**Displays:**
- Order number
- Order date
- Total price
- Fulfillment status
- Link to order details

---

#### `account.orders.$id.tsx`
**URL Pattern:** `/account/orders/:id`

**Purpose:** Single order details

**Loader Function:**
- Fetches order by ID
- Includes line items, shipping address, tracking

**Displays:**
- Order summary
- Items ordered
- Shipping address
- Billing address
- Tracking information

---

#### `account.addresses.tsx`
**URL Pattern:** `/account/addresses`

**Purpose:** Manage shipping addresses

**Features:**
- Add new address
- Edit existing address
- Delete address
- Set default address

**Actions:**
- `CREATE` - Add address
- `UPDATE` - Edit address
- `DELETE` - Remove address
- `SET_DEFAULT` - Set default

---

#### `account.profile.tsx`
**URL Pattern:** `/account/profile`

**Purpose:** Update customer profile

**Fields:**
- First name
- Last name
- Email
- Phone number

**Action:** Updates customer info via Customer Account API

---

#### `account_.login.tsx`
**URL Pattern:** `/account/login`

**Purpose:** Login page

**Note:** Underscore prefix (`account_`) means NOT nested under account layout (no authentication required)

**Flow:**
1. User submits email/password
2. Calls Shopify Customer Account API
3. Sets session cookie
4. Redirects to `/account`

---

#### `account_.logout.tsx`
**URL Pattern:** `/account/logout`

**Purpose:** Logout endpoint

Clears session and redirects to home.

---

#### `account_.authorize.tsx`
**URL Pattern:** `/account/authorize`

**Purpose:** OAuth callback for Customer Account API

Handles OAuth flow for login.

---

### Search Routes

#### `search.tsx`
**URL Pattern:** `/search?q=shirt`

**Purpose:** Search results page

**Loader Function:**
- Searches products by query
- Supports filters (type, vendor, availability)
- Supports sorting

**Query Parameters:**
- `q=shirt` - Search query
- `type=Shirt` - Filter by type
- `vendor=Nike` - Filter by vendor
- `available=true` - In stock only

**Component:** `<SearchResults>`

---

### Page Routes

#### `pages.$handle.tsx`
**URL Pattern:** `/pages/:handle`

**Purpose:** Generic content pages

**Loader Function:**
- Fetches page by handle from Shopify
- Returns page title, body (HTML)

**Examples:**
- `/pages/about`
- `/pages/contact`

---

#### `($locale).pages.contact.tsx`
**URL Pattern:** `/pages/contact`

**Purpose:** Contact form page

**Features:**
- Contact form (name, email, message)
- Submit to email API or Shopify
- Success/error messages

---

#### `($locale).pages.size-guide.tsx`
**URL Pattern:** `/pages/size-guide`

**Purpose:** General size guide page

Shows sizing information, how to measure, size chart images.

---

#### `($locale).pages.faq.tsx`
**URL Pattern:** `/pages/faq`

**Purpose:** Frequently asked questions

Hardcoded FAQ content with accordion UI.

---

#### `($locale).pages.shipping.tsx`
**URL Pattern:** `/pages/shipping`

**Purpose:** Shipping policy page

Shipping information, delivery times, costs.

---

#### `($locale).pages.returns.tsx`
**URL Pattern:** `/pages/returns`

**Purpose:** Returns policy page

Return process, conditions, refund policy.

---

#### `($locale).pages.refunds.tsx`
**URL Pattern:** `/pages/refunds`

**Purpose:** Refund policy page

Refund terms, processing time.

---

#### `($locale).pages.terms.tsx`
**URL Pattern:** `/pages/terms`

**Purpose:** Terms of service page

Legal terms and conditions.

---

### Policy Routes

#### `policies.$handle.tsx`
**URL Pattern:** `/policies/:handle`

**Purpose:** Policy pages from Shopify

**Loader Function:**
- Fetches policy by handle (privacy, refund, shipping, terms)
- Returns policy body (HTML)

**Examples:**
- `/policies/privacy-policy`
- `/policies/refund-policy`

---

#### `($locale).policies._index.tsx`
**URL Pattern:** `/policies`

**Purpose:** Policy listing page

Links to all store policies.

---

### Blog Routes

#### `blogs.$blogHandle._index.tsx`
**URL Pattern:** `/blogs/:blogHandle`

**Purpose:** Blog article listing

**Loader Function:**
- Fetches blog by handle
- Loads articles (paginated)

**Example:** `/blogs/journal`

---

#### `blogs.$blogHandle.$articleHandle.tsx`
**URL Pattern:** `/blogs/:blogHandle/:articleHandle`

**Purpose:** Individual blog article

**Loader Function:**
- Fetches article by handle
- Returns article title, content, author, date

**Example:** `/blogs/journal/how-to-style-winter-coats`

---

### API Routes

#### `api.recommend-size.tsx`
**Method:** POST
**URL:** `/api/recommend-size`

**Purpose:** AI-powered size recommendation

**Request Body:**
```json
{
  "height": 175,
  "weight": 70,
  "gender": "male",
  "age": 25,
  "abdomenShape": "medium",
  "hipShape": "average",
  "wearingPreference": "normal",
  "fabricType": "cotton",
  "chest": 90,
  "waist": 75,
  "hips": 95,
  "shoulder": 42,
  "sizeDimensions": {
    "S": { "chest": [61, 64], "length": [69, 71] },
    "M": { "chest": [64, 67], "length": [71, 73] }
  },
  "productType": "Shirt",
  "tags": ["cotton", "casual"],
  "vendor": "Nike"
}
```

**Response:**
```json
{
  "size": "M",
  "confidence": 0.85,
  "reasoning": "Based on your measurements...",
  "measurements": {
    "estimatedChestWidth": 48,
    "estimatedWaistWidth": 38,
    "estimatedHipWidth": 48,
    "estimatedShoulderWidth": 45
  },
  "garmentMeasurements": {
    "chest": "64-67",
    "length": "71-73"
  },
  "alternativeSize": "L",
  "sizeComparison": {
    "S": "Too tight in chest",
    "M": "Perfect fit",
    "L": "Slightly loose"
  }
}
```

**Algorithm:**
1. Calculate BMI from height/weight
2. Estimate chest circumference from BMI + gender + age
3. Convert circumference to flat-lay width (÷ 2)
4. Adjust for body shape (abdomen, hips)
5. If user provided measurements, use those directly
6. Compare to each size's garment dimensions
7. Account for fabric stretch (from fabricType)
8. Apply brand fit profile adjustments (from vendor)
9. Calculate fit score for each size
10. Return best-fitting size + confidence

**Fabric Stretch Factors:**
- Cotton: 2 cm ease
- Cotton blend: 3 cm ease
- Jersey/knit: 5 cm ease
- Highly elastic: 8 cm ease

**Fit Preference Adjustments:**
- Very fitted: -2 cm
- Fitted: -1 cm
- Normal: 0 cm
- Loose: +2 cm
- Very loose: +4 cm

---

#### `api.restock-notify.tsx`
**Method:** POST
**URL:** `/api/restock-notify`

**Purpose:** Subscribe to restock notifications

**Request Body:**
```json
{
  "email": "user@example.com",
  "productId": "gid://shopify/Product/123",
  "variantId": "gid://shopify/ProductVariant/456",
  "productTitle": "Crew Neck Shirt",
  "variantTitle": "M / Navy"
}
```

**Response:**
```json
{
  "success": true,
  "notification": {
    "email": "user@example.com",
    "productId": "gid://shopify/Product/123",
    "variantId": "gid://shopify/ProductVariant/456",
    "createdAt": "2024-12-24T12:00:00Z"
  }
}
```

**Storage:**
- Saves to variant's `custom.restock_emails` metafield
- Format: JSON array of email addresses
- Deduplicated (same email can't subscribe twice)

**Shopify Admin Metafield Setup:**
1. Go to Settings > Custom data > Variants
2. Add metafield: `restock_emails`
3. Namespace: `custom`
4. Type: JSON

---

#### `api.send-restock-email.tsx`
**Method:** POST
**URL:** `/api/send-restock-email`

**Purpose:** Send restock notification email

**Request Body:**
```json
{
  "email": "user@example.com",
  "productTitle": "Crew Neck Shirt",
  "variantTitle": "M / Navy",
  "productUrl": "https://talla.com/products/crew-neck-shirt?variant=456"
}
```

**Email Template:**
```
Subject: Back in Stock: Crew Neck Shirt (M / Navy)

Hi,

Great news! The item you were waiting for is back in stock:

Crew Neck Shirt - M / Navy

[Shop Now Button]

This email was sent because you signed up for restock notifications.
```

**SMTP Configuration:**
- Uses environment variables: `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`
- Or third-party service (SendGrid, Mailgun, etc.)

---

#### `api.search-by-image.tsx`
**Method:** POST
**URL:** `/api/search-by-image`

**Purpose:** Visual product search

**Request Body:**
```json
{
  "imageUrl": "data:image/jpeg;base64,..."
}
```

**Response:**
```json
{
  "products": [
    {
      "id": "gid://shopify/Product/123",
      "title": "Navy Crew Neck",
      "handle": "navy-crew-neck",
      "similarity": 0.92
    }
  ]
}
```

**Algorithm:**
1. Extract dominant colors from image
2. Map colors to color names (navy, black, etc.)
3. Search products by color tags
4. Rank by color similarity
5. Return top matches

**Limitations:**
- Basic color matching (no ML model)
- Relies on accurate product tags
- No shape/pattern recognition

---

#### `webhooks.inventory-update.tsx`
**Method:** POST
**URL:** `/webhooks/inventory-update`

**Purpose:** Shopify webhook listener for inventory updates

**Shopify Webhook Setup:**
- Event: `products/update`
- URL: `https://your-site.com/webhooks/inventory-update`
- Format: JSON
- API Version: 2024-10

**Webhook Payload (from Shopify):**
```json
{
  "id": 123,
  "title": "Crew Neck Shirt",
  "variants": [
    {
      "id": 456,
      "inventory_quantity": 10,
      "old_inventory_quantity": 0
    }
  ]
}
```

**Handler Logic:**
1. Verify webhook signature (HMAC)
2. Check if inventory increased
3. Fetch `restock_emails` metafield for variant
4. Send email to each subscriber
5. Remove emails from metafield
6. Return 200 OK

**Security:**
- Verifies `X-Shopify-Hmac-Sha256` header
- Rejects invalid signatures

---

#### `admin.restock-notifications.tsx`
**Method:** GET
**URL:** `/admin/restock-notifications`

**Purpose:** Admin dashboard to view/manage restock subscriptions

**Authentication:** Should be protected (add password or admin token)

**Features:**
- List all restock subscriptions
- Filter by product/variant
- Manually remove subscriptions
- Test email sending

**Data Source:**
- Queries all products
- Reads `restock_emails` metafield from each variant
- Aggregates and displays

---

### Utility Routes

#### `[robots.txt].tsx`
**URL:** `/robots.txt`

**Purpose:** SEO robots file

Generates robots.txt dynamically.

---

#### `[sitemap.xml].tsx`
**URL:** `/sitemap.xml`

**Purpose:** XML sitemap

Generates sitemap with all pages, products, collections.

---

#### `sitemap.$type.$page[.xml].tsx`
**URL:** `/sitemap/:type/:page.xml`

**Purpose:** Paginated sitemap

For large sites with 1000+ pages.

---

---

## Components Reference

### Layout Components

#### `PageLayout.tsx`

**Purpose:** Root layout wrapper for all pages

**Features:**
- Provides `<Aside.Provider>` context
- Renders `<Header>`, `<Footer>`
- Manages cart, search, mobile menu drawers

**Props:**
```typescript
interface PageLayoutProps {
  cart: Promise<CartApiQueryFragment | null>;
  footer: Promise<FooterQuery | null>;
  header: HeaderQuery;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
  children?: React.ReactNode;
}
```

**Structure:**
```tsx
<Aside.Provider>
  <CartAside cart={cart} />
  <SearchAside />
  <MobileMenuAside header={header} />

  <div className="min-h-screen flex flex-col">
    <Header />
    <main>{children}</main>
    <Footer />
  </div>
</Aside.Provider>
```

---

#### `Header.tsx`

**Purpose:** Fixed header with navigation

**Features:**
- Auto-hide on scroll down
- Dark theme (#2b2b2b background)
- Responsive (mobile + desktop nav)
- Search toggle
- Cart icon with count badge
- Account icon
- Logo (center on mobile, left on desktop)

**State:**
- `hidden` - Whether header is hidden (scroll down)
- `searchOpen` - Whether search bar is open

**Navigation Items:**
- Women
- Men
- Accessories
- Brands
- Journal
- About

---

#### `Footer.tsx`

**Purpose:** Site footer with links

**Sections:**
- Quick links (About, Contact, FAQ, etc.)
- Customer service (Shipping, Returns, Size Guide, etc.)
- Legal (Privacy, Terms, Refunds, etc.)
- Newsletter signup
- Social media icons
- Copyright

---

#### `Aside.tsx`

**Purpose:** Drawer/modal component

**Types:**
- `cart` - Shopping cart drawer
- `search` - Search panel
- `mobile` - Mobile menu
- `closed` - No drawer open

**Context API:**
```typescript
const { type, open, close } = useAside();
```

**Usage:**
```tsx
<Aside type="cart" heading="CART">
  <CartMain cart={cart} />
</Aside>
```

**Features:**
- Slide-in from right
- Click outside to close
- ESC key to close
- Accessible (ARIA roles)

---

### Product Components

#### `ProductPage.tsx`

**Purpose:** Main product detail page component

**Props:**
```typescript
interface ProductPageProps {
  product: ShopifyProduct;
  selectedVariant: ShopifyProduct['selectedOrFirstAvailableVariant'];
  similarProducts?: SimilarProduct[];
  brandSizeChart?: { url: string; alt?: string } | null;
}
```

**Features:**
- Manages variant selection state
- Handles option changes (size, color)
- Updates URL params when variant changes
- Opens size recommendation modal
- Displays size chart modal
- Transforms Shopify data to component-friendly format

**State:**
- `selectedOptions` - Current option selections (e.g., {Size: 'M', Color: 'Navy'})
- `sizeChartOpen` - Whether size chart modal is open
- `isCartOpen` - Whether cart drawer is open (hides ProductHeader)

**Child Components:**
- `<ProductImagesVertical>` - Image gallery
- `<ProductDescription>` - Product description text
- `<SimilarProductsSection>` - Similar products carousel
- `<ProductHeader>` - Fixed bottom bar (title, price, add to cart)
- `<SizeChart>` - Size chart modal

**Recent Changes:**
- Hides `<ProductHeader>` when cart is open (prevents overlap)

---

#### `ProductHeader.tsx`

**Purpose:** Fixed bottom bar on product pages

**Features:**
- Product title
- Price
- Size selector (small square buttons)
- Color selector (color swatches)
- Add to cart button
- Size guide button (opens modal)
- Recommended size indicator (green ring)

**Props:**
```typescript
interface ProductHeaderProps {
  product: PDPProduct;
  selectedVariant: PDPVariant;
  recommendedSize?: string | null;
  onOptionChange: (optionName: string, value: string) => void;
  selectedOptions: Record<string, string>;
}
```

**Size Guide Modal:**
- Displays size chart table (from `sizeDimensions` metafield)
- Shows size recommendation form (`<SizeRecommendationPrompt>`)
- Fixed array display (ranges like "61-64 cm" instead of "6164")

**Styling:**
- Fixed position at bottom
- z-index: 999999
- White background
- Border-top separator

**Recent Changes:**
- Fixed size chart table to display array values as ranges (e.g., "61-64")

---

#### `ProductImagesVertical.tsx`

**Purpose:** Vertical scrolling image gallery

**Props:**
```typescript
interface ProductImagesVerticalProps {
  images: PDPImage[];
  productTitle: string;
  sizeChartUrl?: string;
  onSizeGuideClick: () => void;
}
```

**Features:**
- Vertical scroll on mobile
- Lazy loading
- Size guide link overlay on first image
- Aspect ratio maintained
- Responsive

**Image Structure:**
```typescript
interface PDPImage {
  id?: string;
  url: string;
  alt: string;
  width?: number;
  height?: number;
}
```

---

#### `ProductDescription.tsx`

**Purpose:** Product description text + metadata

**Props:**
```typescript
interface ProductDescriptionProps {
  description: string;
  fabricType?: string;
  modelSize?: string;
  vendor?: string;
}
```

**Displays:**
- Product description (plain text or HTML)
- Fabric type (if available)
- Model size info (e.g., "Model is wearing size M")
- Brand/vendor name

**Styling:**
- Max width: 2xl
- Centered
- Padding: 4/6/8

---

#### `SimilarProductsSection.tsx`

**Purpose:** Display similar/related products

**Props:**
```typescript
interface SimilarProductsSectionProps {
  products: SimilarProduct[];
}

interface SimilarProduct {
  id: string;
  title: string;
  handle: string;
  tags?: string[];
  productType?: string;
  priceRange: {
    minVariantPrice: { amount: string; currencyCode: string };
  };
  featuredImage?: { url: string; altText?: string };
}
```

**Layout:**
- Horizontal scroll on mobile
- Grid on desktop
- Up to 5 products

---

### Size Recommendation Components

#### `SizeRecommendationPrompt.tsx`

**Purpose:** Full-featured size recommendation form

**Props:**
```typescript
interface SizeRecommendationPromptProps {
  onComplete?: () => void;
  mode?: 'modal' | 'inline';
  onRecommendation?: (size: string) => void;
  productSizeDimensions?: any;
  productType?: string;
  tags?: string[];
  vendor?: string;
  productFabricType?: FabricType;
}
```

**Form Fields:**
- Gender (Male/Female)
- Height (cm)
- Weight (kg)
- Age (years)
- Abdomen Shape (Flat/Medium/Bulging) - with SVG illustrations
- Hip Shape (Straight/Average/Wide) - with SVG illustrations
- Wearing Preference (Very Fitted / Fitted / Normal / Loose / Very Loose)
- Fabric Type (if not provided by product)
- Optional measurements: Chest, Waist, Hips, Shoulder

**Result Display:**
- Recommended size (large display)
- Confidence percentage
- Reasoning text
- Estimated measurements (chest, waist, hip, shoulder)
- Garment measurements for recommended size
- Size comparison table (how each size fits)
- Alternative size suggestion

**Local Storage:**
- Saves user measurements to `localStorage` (key: `talla_user_measurements`)
- Auto-fills form on next visit

**Styling:**
- Modal: Full-screen overlay with centered card
- Inline: Embedded in page
- Gradient backgrounds for sections
- Professional UI with animations

---

#### `SizeRecommendation.tsx`

**Purpose:** Simplified size recommendation (legacy)

**Props:**
```typescript
interface SizeRecommendationProps {
  onRecommendation: (size: string) => void;
  onClose: () => void;
  sizeDimensions?: SizeDimensions;
}
```

**Simpler than `SizeRecommendationPrompt`:
- Only height, weight, gender, body fit
- No body shape or advanced options
- Basic result display

**Note:** May be replaced by `SizeRecommendationPrompt` in future.

---

#### `SizeChart.tsx`

**Purpose:** Display size chart image

**Props:**
```typescript
interface SizeChartProps {
  imageUrl?: string | null;
  alt?: string;
  className?: string;
}
```

**Fallback:**
- Shows "No size chart available" if no image

---

### Cart Components

#### `CartMain.tsx`

**Purpose:** Main cart UI

**Props:**
```typescript
interface CartMainProps {
  cart: CartApiQueryFragment | null;
  layout: 'page' | 'aside';
}
```

**Layouts:**
- `page` - Full cart page (`/cart`)
- `aside` - Cart drawer

**Features:**
- List of cart items (`<CartLineItem>`)
- Cart summary (`<CartSummary>`)
- Empty cart message
- Continue shopping link

---

#### `CartLineItem.tsx`

**Purpose:** Individual cart item

**Props:**
```typescript
interface CartLineItemProps {
  line: CartLine;
  layout: 'page' | 'aside';
}
```

**Features:**
- Product image
- Title + variant title
- Price (each + total)
- Quantity selector
- Remove button

**Optimistic UI:**
- Uses `useOptimisticCart()` from Hydrogen
- Shows loading state during updates

---

#### `CartSummary.tsx`

**Purpose:** Cart totals + checkout button

**Features:**
- Subtotal
- Discounts (if any)
- Checkout button (redirects to Shopify checkout)

**Checkout URL:**
```typescript
const checkoutUrl = cart.checkoutUrl;
// Example: https://your-store.myshopify.com/checkout/c/abc123...
```

---

#### `AddToCartButton.tsx`

**Purpose:** Add to cart button with loading state

**Props:**
```typescript
interface AddToCartButtonProps {
  analytics?: unknown;
  children: React.ReactNode;
  disabled?: boolean;
  lines: Array<OptimisticCartLineInput>;
  onClick?: () => void;
}
```

**Usage:**
```tsx
<AddToCartButton
  lines={[{ merchandiseId: variant.id, quantity: 1 }]}
  onClick={() => setAddedToCart(true)}
>
  Add to Cart
</AddToCartButton>
```

**Behind the Scenes:**
- Uses Hydrogen's `<CartForm>` component
- Submits to `/cart` route
- Hydrogen calls Shopify `cartLinesAdd` mutation
- Cart updates automatically

---

### Collection Components

#### `ProductCard.tsx`

**Purpose:** Product thumbnail on collection pages

**Props:**
```typescript
interface ProductCardProps {
  product: {
    title: string;
    handle: string;
    priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
    featuredImage?: { url: string; altText?: string };
  };
}
```

**Features:**
- Product image
- Title
- Price
- Link to PDP
- Hover effects

---

#### `ProductGrid.tsx`

**Purpose:** Grid layout for product cards

**Props:**
```typescript
interface ProductGridProps {
  products: Product[];
}
```

**Layout:**
- 2 columns on mobile
- 3-4 columns on desktop
- Responsive gap

---

#### `SearchFilters.tsx`

**Purpose:** Filter UI for collections/search

**Features:**
- Price range slider
- Availability checkbox
- Product type dropdown
- Vendor dropdown
- Sort by dropdown
- Apply/reset buttons

**Filter State:**
- Managed in URL query params
- Server-side filtering (in route loader)

---

### Search Components

#### `SearchFormPredictive.tsx`

**Purpose:** Search input with predictive results

**Features:**
- Real-time search as you type
- Debounced queries (300ms)
- Keyboard navigation
- Accessible

**Usage:**
```tsx
<SearchFormPredictive action="/search">
  {({ inputRef, fetchResults, goToSearch }) => (
    <input
      ref={inputRef}
      onChange={fetchResults}
      onKeyDown={(e) => e.key === 'Enter' && goToSearch()}
    />
  )}
</SearchFormPredictive>
```

---

#### `SearchResultsPredictive.tsx`

**Purpose:** Predictive search results dropdown

**Features:**
- Products
- Collections
- Articles
- Pages
- Grouped by type

**Sub-components:**
- `SearchResultsPredictive.Products`
- `SearchResultsPredictive.Collections`
- `SearchResultsPredictive.Articles`
- `SearchResultsPredictive.Pages`
- `SearchResultsPredictive.Empty`

---

#### `SearchResults.tsx`

**Purpose:** Full search results page

**Features:**
- Product grid
- Filters
- Pagination
- Result count

---

### UI Components

#### `ErrorBoundary.tsx`

**Purpose:** Error boundary wrapper

**Features:**
- Catches React errors
- Displays user-friendly error message
- Reload button
- Go to homepage button
- Development mode: Shows error stack trace

---

#### `HeroCarousel.tsx`

**Purpose:** Homepage hero carousel

**Features:**
- Auto-rotate slides
- Manual navigation
- Responsive
- Accessible

---

#### `PriceBlock.tsx`

**Purpose:** Price display with compare-at price

**Props:**
```typescript
interface PriceBlockProps {
  price: Money;
  compareAtPrice?: Money;
}
```

**Features:**
- Shows sale price in red if discounted
- Strikethrough compare-at price

---

---

## Utilities Reference

### `/app/lib/context.ts`

**Purpose:** Create Shopify API clients

**Exports:**
- `createStorefrontClient()` - Storefront API client
- `createCustomerAccountClient()` - Customer Account API client

**Configuration:**
```typescript
const { storefront } = createStorefrontClient({
  publicStorefrontToken: env.PUBLIC_STOREFRONT_API_TOKEN,
  storeDomain: env.PUBLIC_STORE_DOMAIN,
  storefrontApiVersion: '2024-10',
});
```

**Caching Strategies:**
- `CacheLong()` - 1 hour
- `CacheShort()` - 5 minutes
- `CacheNone()` - No cache

---

### `/app/lib/fragments.ts`

**Purpose:** GraphQL query fragments

**Key Fragments:**
- `PRODUCT_FRAGMENT` - Full product data
- `PRODUCT_VARIANT_FRAGMENT` - Variant data
- `CART_FRAGMENT` - Cart data
- `HEADER_QUERY` - Header menu
- `FOOTER_QUERY` - Footer menu

**Usage:**
```typescript
const PRODUCT_QUERY = `#graphql
  query Product($handle: String!) {
    product(handle: $handle) {
      ...ProductFragment
    }
  }
  ${PRODUCT_FRAGMENT}
`;
```

---

### `/app/lib/fabricMapping.ts`

**Purpose:** Map material names to fabric types

**Function:**
```typescript
function mapMaterialToFabricType(material: string): FabricType | null {
  // "100% Cotton" → "cotton"
  // "Lycra Blend" → "highly_elastic"
}
```

**Fabric Types:**
- `cotton` - Pure cotton (no stretch)
- `cotton_blend` - Cotton blends (slight stretch)
- `jersey_knit` - Jersey, knit fabrics (moderate stretch)
- `highly_elastic` - Lycra, spandex (high stretch)

**Used in:** Size recommendation algorithm

---

### `/app/lib/brandFitProfiles.ts`

**Purpose:** Brand-specific fit adjustments

**Structure:**
```typescript
interface BrandFitProfile {
  brand: string;
  runsSmall?: boolean; // Recommend size up
  runsLarge?: boolean; // Recommend size down
  adjustment?: number; // +/- cm adjustment
}
```

**Example:**
```typescript
{
  brand: "Nike",
  runsSmall: true,
  adjustment: 2 // Add 2cm ease
}
```

**Used in:** Size recommendation algorithm

---

### `/app/lib/similarProductsConfig.ts`

**Purpose:** Configuration for similar products

**Config:**
```typescript
{
  overlap: 2, // Minimum tag overlap required
  allowOneTagFallback: true, // If no 2-tag matches, allow 1-tag
  fallbackEnabled: true, // Enable vendor/type fallback
}
```

---

### `/app/lib/similarProductsUtils.ts`

**Purpose:** Helper functions for similar products

**Functions:**
- `filterByTagOverlap()` - Filter products by tag overlap count
- `vendorFallback()` - Find products from same vendor
- `productTypeFallback()` - Find products of same type

---

### `/app/lib/session.ts`

**Purpose:** Session management

**Functions:**
- `createSession()` - Create session cookie
- `getSession()` - Read session from cookie
- `destroySession()` - Clear session cookie

---

### `/app/lib/redirect.ts`

**Purpose:** Handle Shopify handle redirects

**Function:**
```typescript
function redirectIfHandleIsLocalized(
  request: Request,
  { handle, data }: { handle: string; data: any }
) {
  // If Shopify returned different handle, redirect
}
```

---

### `/app/lib/variants.ts`

**Purpose:** Variant selection utilities

**Functions:**
- `getVariantBySelectedOptions()` - Find variant matching options
- `isOptionAvailable()` - Check if option combination is in stock

---

---

## Quick Reference Tables

### Route → File Mapping

| URL | File |
|-----|------|
| `/` | `_index.tsx` |
| `/products/shirt` | `products.$handle.tsx` |
| `/collections/bags` | `collections.$handle.tsx` |
| `/cart` | `cart.tsx` |
| `/account` | `account._index.tsx` |
| `/account/orders` | `account.orders._index.tsx` |
| `/search?q=shirt` | `search.tsx` |
| `/pages/about` | `pages.$handle.tsx` |
| `/policies/privacy` | `policies.$handle.tsx` |
| `/api/recommend-size` | `api.recommend-size.tsx` |

---

### Component → Purpose

| Component | Purpose |
|-----------|---------|
| `ProductPage` | Main PDP component |
| `ProductHeader` | Fixed bottom bar on PDP |
| `ProductImagesVertical` | Image gallery |
| `SizeRecommendationPrompt` | Size recommendation form |
| `CartMain` | Cart UI |
| `CartLineItem` | Cart item row |
| `AddToCartButton` | Add to cart button |
| `Header` | Site header |
| `Footer` | Site footer |
| `Aside` | Drawer/modal component |
| `ProductCard` | Product thumbnail |
| `SearchFilters` | Filter UI |

---

### Metafield → Purpose

| Metafield | Type | Purpose |
|-----------|------|---------|
| `custom.size_dimensions` | JSON | Garment measurements per size |
| `custom.size_chart` | File/URL | Size chart image |
| `custom.fabric_type` | String | Material type (cotton, etc.) |
| `custom.model_size` | String | Model wearing size |
| `custom.restock_emails` | JSON | Emails for restock notifications |

**Example `size_dimensions`:**
```json
{
  "S": {
    "chest": [61, 64],
    "length": [69, 71],
    "arm": [58, 59]
  },
  "M": {
    "chest": [64, 67],
    "length": [71, 73],
    "arm": [59, 60]
  }
}
```

---

### GraphQL Query → Data

| Query | Returns |
|-------|---------|
| `PRODUCT_QUERY` | Full product data |
| `COLLECTION_QUERY` | Collection + products |
| `CART_QUERY` | Cart lines + totals |
| `CUSTOMER_QUERY` | Customer profile + orders |
| `SEARCH_QUERY` | Search results |

---

### Environment Variables

| Variable | Purpose |
|----------|---------|
| `PUBLIC_STOREFRONT_API_TOKEN` | Shopify Storefront API token |
| `PUBLIC_STORE_DOMAIN` | Shopify store domain |
| `PUBLIC_STOREFRONT_ID` | Storefront ID (for analytics) |
| `PUBLIC_CHECKOUT_DOMAIN` | Checkout domain |
| `SMTP_HOST` | SMTP server for emails |
| `SMTP_USER` | SMTP username |
| `SMTP_PASS` | SMTP password |

---

**End of Component Reference**

For architecture and integration details, see `DEVELOPER_HANDBOOK.md`.
