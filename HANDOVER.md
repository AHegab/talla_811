# Talla E-Commerce Storefront - Complete Handover Documentation

**Version:** 2025.7.0
**Last Updated:** December 15, 2025
**Project Type:** Shopify Hydrogen Headless E-Commerce Storefront

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Architecture](#architecture)
4. [Directory Structure](#directory-structure)
5. [Key Features](#key-features)
6. [Getting Started](#getting-started)
7. [Development Workflow](#development-workflow)
8. [Environment Configuration](#environment-configuration)
9. [API Endpoints](#api-endpoints)
10. [Components Overview](#components-overview)
11. [Routes Overview](#routes-overview)
12. [Utilities and Libraries](#utilities-and-libraries)
13. [Deployment](#deployment)
14. [Testing](#testing)
15. [Troubleshooting](#troubleshooting)
16. [Production Checklist](#production-checklist)

---

## Project Overview

Talla is a modern, headless e-commerce storefront built with Shopify Hydrogen. It provides a custom shopping experience with advanced features like AI-powered size recommendations, restock notifications, visual search, and a sophisticated product catalog.

### What Makes This Project Special

- **Smart Size Recommendations**: AI-powered sizing algorithm that estimates body measurements from height, weight, and fit preferences
- **Restock Email Notifications**: Customer notification system for out-of-stock items
- **Visual Product Search**: Image-based product discovery
- **Custom Collection Pages**: Gender-specific collection pages with custom hero carousels
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Brand Fit Profiles**: Per-brand sizing profiles for accurate recommendations

---

## Tech Stack

### Core Framework
- **Shopify Hydrogen** (2025.7.0) - Shopify's headless commerce framework
- **React Router** (7.9.2) - File-based routing and server-side rendering
- **React** (18.3.1) - UI library
- **TypeScript** (5.9.2) - Type safety

### Styling & UI
- **Tailwind CSS** (4.1.6) - Utility-first CSS framework
- **Framer Motion** (12.23.24) - Animation library
- **Lucide React** (0.553.0) - Icon library
- **React Icons** (5.5.0) - Additional icons

### Build Tools
- **Vite** (6.2.4) - Build tool and dev server
- **ESLint** (9.18.0) - Linting
- **Prettier** (3.4.2) - Code formatting
- **GraphQL Code Generator** - Type-safe GraphQL queries

### Data & API
- **GraphQL** (16.10.0) - API queries to Shopify
- **Shopify Storefront API** - Product and cart data
- **Shopify Customer Account API** - User account management

### Testing
- **Vitest** (1.3.2) - Unit testing framework
- **jsdom** (22.1.0) - DOM testing environment

### Deployment
- **Shopify Oxygen** - Deployment platform (Shopify's edge hosting)

### Third-Party Integrations
- **SendGrid** (Optional) - Email notifications
- **Resend** (Optional) - Email notifications alternative

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client (Browser)                      │
│                                                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │   React    │  │  Tailwind  │  │   Framer   │           │
│  │ Components │  │    CSS     │  │   Motion   │           │
│  └────────────┘  └────────────┘  └────────────┘           │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            │ HTTP/GraphQL
                            │
┌───────────────────────────▼──────────────────────────────────┐
│                    Hydrogen Server (SSR)                      │
│                                                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │   Routes   │  │ Components │  │ API Routes │           │
│  │  (Loader)  │  │   (SSR)    │  │  (Server)  │           │
│  └────────────┘  └────────────┘  └────────────┘           │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │           Utilities & Business Logic                │    │
│  │  • Size Recommendation Engine                      │    │
│  │  • Restock Notification Storage                    │    │
│  │  • Email Service Integration                       │    │
│  │  • Product Search & Filtering                      │    │
│  └────────────────────────────────────────────────────┘    │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            │ GraphQL
                            │
┌───────────────────────────▼──────────────────────────────────┐
│                      Shopify APIs                            │
│                                                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │ Storefront │  │  Customer  │  │   Admin    │           │
│  │    API     │  │ Account API│  │    API     │           │
│  └────────────┘  └────────────┘  └────────────┘           │
└──────────────────────────────────────────────────────────────┘
```

### Request Flow

1. **Client Request** → Browser navigates to a route (e.g., `/products/shirt-1`)
2. **Route Loader** → Server-side loader fetches data via GraphQL
3. **SSR Rendering** → React components render on server with data
4. **HTML Response** → Server sends fully rendered HTML to client
5. **Hydration** → Client-side React takes over for interactivity
6. **Client Navigation** → Subsequent navigation handled client-side with data fetching

---

## Directory Structure

```
talla/
├── .claude/                    # Claude Code configuration
│   └── settings.local.json     # Local permissions and settings
│
├── .github/                    # GitHub configuration
│   └── workflows/              # CI/CD workflows
│       └── oxygen-deployment-1000060479.yml
│
├── .shopify/                   # Shopify CLI configuration
│   └── project.json
│
├── app/                        # Main application code
│   ├── assets/                 # Static assets (favicon)
│   ├── components/             # React components (35 files)
│   │   ├── ui/                 # UI-specific components
│   │   │   ├── MenCollectionPage.tsx
│   │   │   └── WomenCollectionPage.tsx
│   │   ├── AddToCartButton.tsx
│   │   ├── CartMain.tsx
│   │   ├── Footer.tsx
│   │   ├── Header.tsx
│   │   ├── ProductBuyBox.tsx   # Main product interaction component
│   │   ├── ProductPage.tsx     # Product detail page
│   │   ├── SizeRecommendation.tsx
│   │   └── ... (32 more components)
│   │
│   ├── config/                 # Configuration files
│   │   └── restock-notifications.md
│   │
│   ├── graphql/                # GraphQL queries and mutations
│   │   └── customer-account/   # Customer account operations
│   │       ├── CustomerDetailsQuery.ts
│   │       ├── CustomerOrdersQuery.ts
│   │       └── CustomerAddressMutations.ts
│   │
│   ├── lib/                    # Utility libraries
│   │   ├── __tests__/          # Unit tests
│   │   ├── brand-fit-profiles.ts    # Brand-specific sizing data
│   │   ├── fabricMapping.ts         # Fabric type mappings
│   │   ├── fragments.ts             # GraphQL fragments
│   │   ├── search.ts                # Search utilities
│   │   ├── similarProductsUtils.ts  # Product matching logic
│   │   └── variants.ts              # Product variant helpers
│   │
│   ├── routes/                 # File-based routes (76 files)
│   │   ├── ($locale)/          # Localized routes
│   │   │   ├── collections.$handle.tsx
│   │   │   ├── products.$handle.tsx
│   │   │   ├── pages.size-guide.tsx
│   │   │   └── ... (more routes)
│   │   ├── api.recommend-size.tsx     # Size recommendation API
│   │   ├── api.restock-notify.tsx     # Restock notification API
│   │   ├── api.search-by-image.tsx    # Visual search API
│   │   ├── api.send-restock-email.tsx # Email sending API
│   │   ├── admin.restock-notifications.tsx
│   │   └── ... (more routes)
│   │
│   ├── styles/                 # CSS stylesheets
│   │   ├── app.css             # Main styles (75KB)
│   │   ├── fonts.css           # Font imports
│   │   └── tailwind.css        # Tailwind config
│   │
│   ├── types/                  # TypeScript type definitions
│   │   └── sizeDimensions.ts
│   │
│   ├── utils/                  # Utility functions
│   │   ├── notificationStorage.server.ts  # In-memory notification storage
│   │   └── sendRestockEmail.ts            # Email service integration
│   │
│   ├── entry.client.tsx        # Client-side entry point
│   ├── entry.server.tsx        # Server-side rendering entry
│   ├── root.tsx                # Root layout component
│   └── routes.ts               # Route configuration
│
├── dist/                       # Build output (generated)
│   ├── client/                 # Client bundle
│   └── server/                 # Server bundle
│
├── docs/                       # Documentation
│   ├── RESTOCK_EMAIL_SETUP.md
│   ├── SHOPIFY_FABRIC_SETUP.md
│   ├── SHOPIFY_VARIANT_IMAGES_GUIDE.md
│   └── SIZE_DIMENSIONS_GUIDE.md
│
├── guides/                     # Feature guides with screenshots
│   ├── predictiveSearch/
│   └── search/
│
├── public/                     # Static public assets
│   ├── bodyFigs/               # Body shape visualizations
│   ├── hero/                   # Hero carousel images
│   ├── icons/                  # SVG/PNG icons
│   └── *.svg, *.png            # Logo files
│
├── .env                        # Environment variables (gitignored)
├── .env.restock-example        # Example environment config
├── .gitignore                  # Git ignore rules
├── CHANGELOG.md                # Version history (102KB)
├── eslint.config.js            # ESLint configuration
├── package.json                # Dependencies and scripts
├── react-router.config.ts      # React Router configuration
├── README.md                   # Project README
├── server.ts                   # Express server entry
├── tailwind.config.js          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
└── vite.config.ts              # Vite build configuration
```

---

## Key Features

### 1. Smart Size Recommendation System

**Location:** `app/routes/api.recommend-size.tsx`, `app/components/SizeRecommendation.tsx`

**How It Works:**
- Estimates body measurements from user input (height, weight, gender, fit preference)
- Uses sophisticated algorithm with BMI adjustments and fit preferences
- Matches user measurements against product-specific size dimensions
- Accounts for fabric stretch and garment category (tops, bottoms, dresses)
- Provides confidence levels for each size recommendation

**Inputs:**
- Height (cm)
- Weight (kg)
- Gender (male/female)
- Fit Preference (slim, regular, athletic, relaxed)
- Optional: Chest, waist, hips measurements

**Outputs:**
- Recommended size
- Confidence level (high/medium/low)
- Alternative sizes
- Fit description

**Algorithm Flow:**
```
User Input → Body Measurement Estimation →
Garment Category Detection → Fabric Stretch Calculation →
Size Matching → Confidence Scoring → Recommendation
```

**Configuration:**
- Product size dimensions stored in Shopify product metafields
- Brand fit profiles in `app/lib/brand-fit-profiles.ts`
- Fabric stretch values in `app/lib/fabricMapping.ts`

### 2. Restock Email Notifications

**Location:** `app/routes/api.restock-notify.tsx`, `app/utils/sendRestockEmail.ts`

**How It Works:**
- Customers can request notifications for out-of-stock items
- Requests stored in server memory (in-memory storage)
- Admin dashboard shows all pending notifications
- Email sent when inventory webhook receives restock event
- Supports SendGrid and Resend email providers

**Flow:**
```
Customer Request → Validation → Storage →
Admin Review → Inventory Webhook → Email Trigger →
Send Email → Mark as Sent
```

**Components:**
- Request form in ProductBuyBox component
- Storage: `app/utils/notificationStorage.server.ts`
- Email: `app/utils/sendRestockEmail.ts`
- Admin: `app/routes/admin.restock-notifications.tsx`
- Webhook: `app/routes/webhooks.inventory-update.tsx`

**Note:** Currently uses in-memory storage. For production, consider migrating to database or Shopify metafields.

### 3. Visual Product Search

**Location:** `app/routes/api.search-by-image.tsx`

**How It Works:**
- Users upload an image to find similar products
- System analyzes image tags and product metadata
- Matches products based on vendor, product type, and tags
- Returns ranked results with similarity scores

**Configuration:**
- Overlap threshold: Determines tag matching strictness
- Fallback modes: Single tag matching, vendor matching
- Result limit: Number of similar products to return

**Note:** Currently uses tag-based matching. Can be enhanced with actual computer vision API (e.g., Google Vision, AWS Rekognition).

### 4. Custom Collection Pages

**Location:** `app/components/ui/MenCollectionPage.tsx`, `app/components/ui/WomenCollectionPage.tsx`

**Features:**
- Gender-specific hero carousels with 3D product showcases
- Smooth scrolling product grids
- Custom sorting (newest, price, popular)
- Responsive design with mobile optimization
- Integrated with Shopify collections

### 5. Product Filtering & Search

**Location:** `app/routes/($locale).collections.$handle.tsx`, `app/routes/($locale).search.tsx`

**Features:**
- Real-time search with predictive suggestions
- Filter by availability, price, vendor
- Sort by relevance, price, newest
- URL-based filter persistence
- SEO-friendly URLs

### 6. Customer Account Management

**Location:** `app/routes/($locale).account.*`

**Features:**
- Order history and tracking
- Address management
- Profile editing
- OAuth authentication via Shopify Customer Account API

### 7. Cart & Checkout

**Location:** `app/components/CartMain.tsx`

**Features:**
- Real-time cart updates
- Line item quantity adjustment
- Discount code application
- Redirects to Shopify hosted checkout
- Cart persistence across sessions

---

## Getting Started

### Prerequisites

- **Node.js** 18.0.0 or higher
- **npm** 10.8.2 (included with Node.js)
- **Shopify Store** with Hydrogen sales channel
- **Git** for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd talla
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:
   ```bash
   # Copy the example file
   cp .env.restock-example .env
   ```

   Required variables:
   ```env
   # Shopify Configuration
   SESSION_SECRET=<random-secret-key>
   PUBLIC_STOREFRONT_API_TOKEN=<your-token>
   PUBLIC_STORE_DOMAIN=<your-store>.myshopify.com
   PUBLIC_CHECKOUT_DOMAIN=<your-store>.myshopify.com

   # Optional: Restock Notifications
   SENDGRID_API_KEY=SG.xxxxx
   PUBLIC_STORE_URL=https://yourdomain.com
   STORE_ADMIN_EMAIL=admin@yourdomain.com
   ```

4. **Link to Shopify store**
   ```bash
   npx shopify hydrogen link
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Local: `http://localhost:3000`
   - Network: Uses Shopify CLI tunnel for testing

---

## Development Workflow

### Available Scripts

```bash
# Development
npm run dev              # Start dev server with hot reload
npm run preview          # Preview production build locally

# Code Quality
npm run typecheck        # Run TypeScript type checking
npm run lint             # Lint code with ESLint
npm run codegen          # Generate GraphQL types

# Testing
npm run test             # Run unit tests

# Production
npm run build            # Build for production
```

### Development Best Practices

1. **Type Safety**
   - Always run `npm run typecheck` before committing
   - Use TypeScript for new files
   - Define interfaces for component props

2. **Code Quality**
   - Run `npm run lint` and fix all warnings
   - Follow existing code patterns
   - Use Prettier for formatting (configured)

3. **GraphQL**
   - Run `npm run codegen` after modifying GraphQL queries
   - Use fragments for reusable query parts
   - Keep queries in separate files when complex

4. **Component Structure**
   ```tsx
   // Good component structure
   interface Props {
     // ... props
   }

   export function ComponentName({ prop1, prop2 }: Props) {
     // Hooks at the top
     const [state, setState] = useState();

     // Event handlers
     const handleClick = () => { };

     // Render
     return (
       // ... JSX
     );
   }
   ```

5. **Styling**
   - Use Tailwind utility classes
   - Follow mobile-first approach
   - Use CSS variables for theme colors (defined in app.css)

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "Description of changes"

# Push to remote
git push origin feature/your-feature-name

# Create pull request on GitHub
```

---

## Environment Configuration

### Required Environment Variables

```env
# ============================================
# Shopify Configuration (Required)
# ============================================

# Random secret for session encryption (generate with openssl rand -base64 32)
SESSION_SECRET=your-random-secret-key-here

# Shopify Storefront API token
# Get from: Shopify Admin → Settings → Apps and sales channels → Develop apps
PUBLIC_STOREFRONT_API_TOKEN=shpat_xxxxxxxxxxxxxxxxxxxxx

# Your Shopify store domain
PUBLIC_STORE_DOMAIN=your-store.myshopify.com

# Checkout domain (usually same as store domain)
PUBLIC_CHECKOUT_DOMAIN=your-store.myshopify.com

# ============================================
# Optional: Restock Email Notifications
# ============================================

# SendGrid API Key (for email notifications)
# Get from: https://app.sendgrid.com/settings/api_keys
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Alternative: Resend API Key
# Get from: https://resend.com
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Public store URL (for links in emails)
PUBLIC_STORE_URL=https://yourdomain.com

# Admin email (receives notification requests)
STORE_ADMIN_EMAIL=admin@yourdomain.com

# ============================================
# Optional: Analytics & Monitoring
# ============================================

# Google Analytics ID
PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX

# Sentry DSN (error tracking)
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
```

### How to Get Shopify API Credentials

1. **Go to Shopify Admin**
   - Navigate to your store admin panel

2. **Create a Custom App**
   - Settings → Apps and sales channels
   - Develop apps → Create an app
   - Name it "Hydrogen Storefront"

3. **Configure API Scopes**
   - Storefront API scopes needed:
     - `unauthenticated_read_product_listings`
     - `unauthenticated_read_product_inventory`
     - `unauthenticated_read_customers`
     - `unauthenticated_write_checkouts`

4. **Install and Get Tokens**
   - Install the app
   - Copy the Storefront API access token

---

## API Endpoints

### Public API Routes

All API routes are located in `app/routes/`

#### 1. Size Recommendation API

**Endpoint:** `POST /api/recommend-size`

**Purpose:** Get size recommendation based on user measurements

**Request Body:**
```json
{
  "height": 175,
  "weight": 70,
  "gender": "male",
  "fitPreference": "regular",
  "productHandle": "product-handle",
  "productType": "T-Shirt",
  "tags": ["cotton", "fitted"],
  "sizeDimensions": {
    "S": { "chest": 48 },
    "M": { "chest": 52 },
    "L": { "chest": 56 }
  },
  "chest": 95,
  "waist": 80,
  "hips": 95
}
```

**Response:**
```json
{
  "recommendedSize": "M",
  "confidence": "high",
  "alternativeSizes": ["L"],
  "fitDescription": "This size should fit you perfectly for a regular fit"
}
```

#### 2. Restock Notification API

**Endpoint:** `POST /api/restock-notify`

**Purpose:** Register customer for restock notification

**Request Body:**
```json
{
  "email": "customer@example.com",
  "productId": "gid://shopify/Product/123",
  "variantId": "gid://shopify/ProductVariant/456",
  "productTitle": "Classic T-Shirt",
  "variantTitle": "Medium / Blue"
}
```

**Response:**
```json
{
  "success": true,
  "message": "You'll be notified when this item is back in stock"
}
```

#### 3. Send Restock Email API

**Endpoint:** `POST /api/send-restock-email`

**Purpose:** Send restock notification email (admin use)

**Request Body:**
```json
{
  "email": "customer@example.com",
  "productTitle": "Classic T-Shirt",
  "variantTitle": "Medium / Blue",
  "productHandle": "classic-t-shirt"
}
```

**Response:**
```json
{
  "success": true
}
```

#### 4. Visual Search API

**Endpoint:** `POST /api/search-by-image`

**Purpose:** Find similar products by image

**Request Body:**
```json
{
  "imageUrl": "https://example.com/image.jpg",
  "tags": ["blue", "shirt"],
  "vendor": "Brand Name",
  "productType": "T-Shirt"
}
```

**Response:**
```json
{
  "products": [
    {
      "id": "gid://shopify/Product/123",
      "handle": "product-handle",
      "title": "Product Title",
      "images": [...],
      "priceRange": {...}
    }
  ]
}
```

### Admin Routes

#### Admin Dashboard

**Route:** `/admin/restock-notifications`

**Purpose:** View and manage restock notification requests

**Features:**
- View all pending notifications
- Filter by status (pending/sent/failed)
- Send test emails
- Check inventory status

---

## Components Overview

### Core Components

#### 1. ProductPage

**File:** `app/components/ProductPage.tsx`

**Purpose:** Main product detail page component

**Features:**
- Product gallery with zoom
- Variant selection
- Add to cart
- Size recommendation integration
- Similar items
- Product description and details

**Props:**
```tsx
interface ProductPageProps {
  product: Product;
  recommendedSize?: string | null;
  sizeChartImage?: string;
}
```

#### 2. ProductBuyBox

**File:** `app/components/ProductBuyBox.tsx`

**Purpose:** Product purchase interaction component

**Features:**
- Variant selection (size, color)
- Price display
- Stock status
- Add to cart button
- Restock notification form
- Size recommendation trigger

**State Management:**
- Selected variant
- Notification email
- Loading states

#### 3. SizeRecommendation

**File:** `app/components/SizeRecommendation.tsx`

**Purpose:** Size recommendation modal and form

**Features:**
- Measurement input form
- Gender and fit preference selection
- Body shape visualization
- API integration for recommendations

#### 4. CartMain

**File:** `app/components/CartMain.tsx`

**Purpose:** Shopping cart management

**Features:**
- Line item list
- Quantity adjustment
- Remove items
- Discount codes
- Cart summary
- Checkout button

#### 5. Header

**File:** `app/components/Header.tsx`

**Purpose:** Site navigation header

**Features:**
- Logo and branding
- Main navigation menu
- Search bar
- Cart icon with count
- Account menu

#### 6. Footer

**File:** `app/components/Footer.tsx`

**Purpose:** Site footer

**Features:**
- Newsletter signup
- Social media links
- Policy links
- Copyright information

### UI Components

#### MenCollectionPage / WomenCollectionPage

**Files:** `app/components/ui/MenCollectionPage.tsx`, `app/components/ui/WomenCollectionPage.tsx`

**Purpose:** Gender-specific collection landing pages

**Features:**
- Hero carousel with 3D product showcase
- Custom product grid
- Sorting and filtering
- Smooth scroll animations

### Utility Components

- **ProductCard:** Product grid item
- **ProductImage:** Optimized image component
- **Money:** Price formatting
- **PaginatedResourceSection:** Pagination wrapper
- **SearchForm:** Search input and suggestions

---

## Routes Overview

### Route Structure

The application uses file-based routing with React Router 7. Routes are defined in `app/routes/`

### Localized Routes (`($locale)/`)

Routes with locale parameter support internationalization:

```
/                           → Homepage
/products/:handle           → Product detail page
/collections/:handle        → Collection page
/collections/all            → All products
/cart                       → Shopping cart
/search                     → Search results
/pages/size-guide           → Size guide page
/pages/faq                  → FAQ page
/pages/returns              → Returns policy
/account                    → Customer account
/account/orders             → Order history
/account/addresses          → Address management
/account/profile            → Profile settings
```

### Non-Localized Routes

```
/brands                     → Brand index page
/design-system-showcase     → Component showcase
/admin/restock-notifications → Admin dashboard
```

### API Routes

```
POST /api/recommend-size         → Size recommendation
POST /api/restock-notify         → Restock notification registration
POST /api/send-restock-email     → Send restock email
POST /api/search-by-image        → Visual search
POST /api/suggest                → Search suggestions
```

### Webhook Routes

```
POST /webhooks/inventory-update  → Shopify inventory webhook
```

---

## Utilities and Libraries

### Size Recommendation Engine

**Location:** `app/routes/api.recommend-size.tsx`

**Key Functions:**

- `estimateBodyMeasurements()` - Calculates body measurements from height/weight
- `detectGarmentCategory()` - Determines garment type (top/bottom/dress)
- `calculateFabricStretch()` - Gets stretch percentage from fabric type
- `findBestSize()` - Matches user to product size

**Algorithm:**
1. Estimate body measurements (chest, waist, hips)
2. Apply fit preference adjustments
3. Detect garment category
4. Calculate fabric stretch
5. Apply wearing ease based on fit
6. Match against product dimensions
7. Calculate confidence score

### Brand Fit Profiles

**Location:** `app/lib/brand-fit-profiles.ts`

**Purpose:** Store brand-specific sizing adjustments

**Structure:**
```typescript
export const brandFitProfiles: Record<string, BrandFitProfile> = {
  'Brand Name': {
    runsTrueToSize: true,
    adjustments: {
      chest: 0,
      waist: 0,
      hips: 0,
    },
    notes: 'Fits true to size'
  }
}
```

### Fabric Mapping

**Location:** `app/lib/fabricMapping.ts`

**Purpose:** Map fabric types to stretch percentages

**Example:**
```typescript
export const fabricStretchMap: Record<string, number> = {
  'Cotton': 0,
  'Cotton + Lycra': 15,
  'Polyester Blend': 5,
  // ...
}
```

### Similar Products Utility

**Location:** `app/lib/similarProductsUtils.ts`

**Purpose:** Find similar products based on tags

**Function:**
```typescript
export function findSimilarProducts(
  products: Product[],
  currentProduct: Product,
  config: SearchConfig
): Product[]
```

### Notification Storage

**Location:** `app/utils/notificationStorage.server.ts`

**Purpose:** In-memory storage for restock notifications

**Important:** This is temporary storage that resets on server restart. For production, migrate to database.

**Functions:**
- `addNotification()` - Add new notification request
- `getNotifications()` - Get all notifications
- `markAsSent()` - Mark notification as sent
- `markAsFailed()` - Mark notification as failed
- `cleanupOldNotifications()` - Remove old notifications

### Email Service

**Location:** `app/utils/sendRestockEmail.ts`

**Purpose:** Send restock notification emails

**Supported Providers:**
- SendGrid
- Resend

**Functions:**
- `sendRestockEmailViaSendGrid()`
- `sendRestockEmailViaResend()`
- `sendRestockEmail()` - Main function that routes to provider

---

## Deployment

### Shopify Oxygen Deployment

The application is deployed to Shopify Oxygen, Shopify's edge hosting platform.

### Automatic Deployment

GitHub Actions workflow automatically deploys on push to `main` branch.

**Workflow File:** `.github/workflows/oxygen-deployment-1000060479.yml`

### Manual Deployment

```bash
# Build the application
npm run build

# Deploy to Oxygen
npx shopify hydrogen deploy
```

### Deployment Checklist

- [ ] All tests passing (`npm run test`)
- [ ] TypeScript checks passing (`npm run typecheck`)
- [ ] Linting clean (`npm run lint`)
- [ ] Environment variables set in Oxygen dashboard
- [ ] Build successful (`npm run build`)
- [ ] Preview deployment tested

### Environment Variables in Production

Set these in the Shopify Oxygen dashboard:

1. Go to Shopify Admin → Settings → Hydrogen
2. Select your storefront
3. Environment variables → Add variables
4. Add all required variables from `.env` file

---

## Testing

### Unit Tests

**Framework:** Vitest

**Location:** `app/lib/__tests__/`, `app/routes/__tests__/`

**Run tests:**
```bash
npm run test              # Run all tests
npm run test -- --watch   # Watch mode
```

### Existing Tests

1. **Similar Products Utility**
   - File: `app/lib/__tests__/similarProductsUtils.test.ts`
   - Tests tag matching, vendor filtering, overlap calculation

2. **Image Search API**
   - File: `app/routes/__tests__/api.search-by-image.test.ts`
   - Tests API endpoint logic

### Writing New Tests

```typescript
import { describe, it, expect } from 'vitest';

describe('MyFunction', () => {
  it('should do something', () => {
    const result = myFunction(input);
    expect(result).toBe(expected);
  });
});
```

### Test Coverage

Current coverage is minimal. Areas needing tests:
- Size recommendation algorithm
- Cart logic
- Product variant selection
- Email sending utilities
- Restock notification storage

---

## Troubleshooting

### Common Issues

#### 1. Build Errors

**Problem:** TypeScript errors during build

**Solution:**
```bash
# Regenerate types
npm run codegen
npm run typecheck
```

#### 2. GraphQL Errors

**Problem:** "Cannot query field" GraphQL errors

**Solution:**
- Check Shopify API version compatibility
- Verify API scopes in custom app
- Run `npm run codegen` to regenerate types

#### 3. Environment Variables Not Loading

**Problem:** `undefined` environment variables

**Solution:**
- Verify `.env` file exists in root directory
- Check variable names (PUBLIC_ prefix for client-side)
- Restart dev server after changes

#### 4. Restock Emails Not Sending

**Problem:** Emails not being delivered

**Solution:**
- Check `SENDGRID_API_KEY` or `RESEND_API_KEY` is set
- Verify sender email is verified with email provider
- Check `PUBLIC_STORE_URL` is set correctly
- Review server logs for errors

#### 5. Size Recommendation Not Working

**Problem:** No size recommendation shown

**Solution:**
- Verify product has size dimensions in metafields
- Check `sizeDimensions` prop is passed to component
- Review API request/response in network tab
- Ensure user inputs are valid (height, weight)

#### 6. Shopify OAuth Issues

**Problem:** Cannot login to customer account

**Solution:**
- Verify Customer Account API is enabled in Shopify
- Check redirect URIs are configured
- Ensure app has correct scopes
- Review Shopify CLI tunnel is active

#### 7. Cart Not Persisting

**Problem:** Cart items disappear on refresh

**Solution:**
- Check browser cookies are enabled
- Verify `SESSION_SECRET` is set
- Clear browser cache and cookies
- Check for console errors

### Debug Mode

Enable debug logging:

```typescript
// In development, check process.env.NODE_ENV
if (process.env.NODE_ENV !== 'production') {
  console.log('Debug info:', data);
}
```

### Shopify CLI Logs

View detailed logs:
```bash
# View server logs
npx shopify hydrogen dev --debug

# View build logs
npx shopify hydrogen build --verbose
```

---

## Production Checklist

### Before Going Live

#### Code Quality
- [ ] All TypeScript errors resolved
- [ ] ESLint warnings addressed
- [ ] No console.log statements (except errors)
- [ ] Code reviewed and approved
- [ ] Git branch merged to main

#### Testing
- [ ] Manual testing of all major flows
- [ ] Test on mobile devices
- [ ] Test on different browsers
- [ ] Cart and checkout working
- [ ] Search and filtering working
- [ ] Size recommendation working

#### Configuration
- [ ] Environment variables set in production
- [ ] Email service configured (SendGrid/Resend)
- [ ] Store URL configured correctly
- [ ] Shopify API credentials valid
- [ ] Custom domain configured (if applicable)

#### Performance
- [ ] Build size optimized
- [ ] Images optimized
- [ ] Lazy loading implemented
- [ ] Lighthouse score reviewed

#### SEO
- [ ] Meta tags configured
- [ ] Sitemap generated
- [ ] robots.txt configured
- [ ] Analytics tracking setup (Google Analytics)

#### Security
- [ ] API keys secured (not in code)
- [ ] HTTPS enabled
- [ ] Content Security Policy reviewed
- [ ] Rate limiting on API endpoints

#### Monitoring
- [ ] Error tracking setup (Sentry recommended)
- [ ] Performance monitoring
- [ ] Uptime monitoring
- [ ] Log aggregation

#### Documentation
- [ ] README updated
- [ ] CHANGELOG updated
- [ ] API documentation complete
- [ ] Deployment guide reviewed

### Post-Launch

- [ ] Monitor error logs
- [ ] Review performance metrics
- [ ] Collect user feedback
- [ ] Plan improvements

---

## Additional Resources

### Documentation
- [Shopify Hydrogen Docs](https://shopify.dev/custom-storefronts/hydrogen)
- [React Router Docs](https://reactrouter.com)
- [Tailwind CSS Docs](https://tailwindcss.com)
- [Shopify Storefront API](https://shopify.dev/docs/api/storefront)

### Internal Documentation
- `docs/SIZE_DIMENSIONS_GUIDE.md` - Size system setup
- `docs/RESTOCK_EMAIL_SETUP.md` - Email configuration
- `docs/SHOPIFY_FABRIC_SETUP.md` - Fabric type setup
- `docs/SHOPIFY_VARIANT_IMAGES_GUIDE.md` - Product image setup

### Support

For questions or issues:
1. Check this documentation
2. Review existing code comments
3. Check Shopify Hydrogen documentation
4. Review GitHub issues/PRs
5. Contact development team

---

## Changelog

See `CHANGELOG.md` for detailed version history.

### Recent Updates (v2025.7.0)

- Production cleanup completed
- Debug console logs removed
- Documentation organized in `docs/` directory
- TypeScript strict mode enabled
- Build optimization
- Email notification system enhanced

---

## License

This project is proprietary. All rights reserved.

---

**Document Version:** 1.0
**Last Updated:** December 15, 2025
**Maintained By:** Development Team

For updates to this documentation, please create a pull request.
