# Talla - Premium E-Commerce Platform

A modern, high-performance e-commerce platform built on Shopify Hydrogen with advanced features like AI-powered size recommendations, visual search, and smart product discovery.

---

## 🚀 Quick Links

- **[Quick Start Guide](./QUICK_START.md)** - Get running in 10 minutes
- **[Developer Handbook](./DEVELOPER_HANDBOOK.md)** - Complete project overview
- **[Component Reference](./COMPONENT_REFERENCE.md)** - Detailed component documentation
- **[Shopify Integration](./SHOPIFY_INTEGRATION_GUIDE.md)** - Shopify setup & workflows

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Key Features](#key-features)
3. [Technology Stack](#technology-stack)
4. [Getting Started](#getting-started)
5. [Documentation](#documentation)
6. [Development](#development)
7. [Deployment](#deployment)
8. [Contributing](#contributing)

---

## Overview

Talla is a **headless Shopify storefront** built with Shopify Hydrogen, providing:

- ⚡ **Lightning-fast performance** - Server-side rendering on Shopify's global edge network
- 🎨 **Complete design control** - Custom UI/UX beyond Shopify themes
- 🤖 **AI-powered features** - Smart size recommendations, visual search
- 📱 **Mobile-first** - Responsive design optimized for all devices
- 🔒 **Secure & scalable** - Built on Shopify's infrastructure

### What is Headless Shopify?

Traditional Shopify uses themes for the storefront. **Headless Shopify** separates:

- **Backend:** Shopify Admin (products, inventory, orders)
- **Frontend:** Custom app (this project) using Shopify APIs

**Benefits:**
- Unlimited customization
- Better performance (edge caching)
- Modern development stack (React, TypeScript)
- Advanced features not possible in themes

---

## Key Features

### 🛍️ E-Commerce Core

- **Product Catalog** - Browse collections, filter, sort
- **Product Pages** - Image galleries, variant selection, rich descriptions
- **Shopping Cart** - Add/update/remove items, discount codes
- **Checkout** - Secure Shopify-hosted checkout
- **Account Management** - Order history, addresses, profile

### 🎯 Advanced Features

#### AI Size Recommendation
- Collects user measurements (height, weight, body shape)
- Compares to garment dimensions
- Accounts for fabric stretch and fit preference
- Returns recommended size with confidence score

#### Restock Notifications
- Users subscribe with email for out-of-stock items
- Automatic emails when inventory restocked
- Managed via Shopify webhooks

#### Visual Search
- Upload image to find similar products
- Color-based matching
- Smart product discovery

#### Smart Product Recommendations
- Similar products based on tags
- Fallback to vendor/product type
- Configurable matching rules

### 📊 Technical Features

- **Server-Side Rendering (SSR)** - Fast initial load
- **Edge Caching** - Global CDN performance
- **GraphQL API** - Efficient data fetching
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Modern utility-first styling
- **Responsive Design** - Mobile, tablet, desktop optimized

---

## Technology Stack

### Frontend
- **React 18** - UI library
- **React Router 7** - File-based routing
- **Shopify Hydrogen** - Shopify integration framework
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **Framer Motion** - Animations
- **Lucide React** - Icons

### Backend
- **Shopify Storefront API** - Product data, cart, checkout
- **Shopify Customer Account API** - User authentication
- **Shopify Admin API** - Webhooks, metafields
- **Oxygen** - Shopify's edge hosting platform

### Build Tools
- **Vite 6** - Build tool & dev server
- **GraphQL Codegen** - Type generation
- **Vitest** - Testing framework
- **ESLint** - Code linting
- **Prettier** - Code formatting

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 10+
- Shopify store (Plus or Standard plan)
- Git

### Installation

```bash
# Clone repository
git clone <your-repo-url>
cd talla

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Configure .env with your Shopify credentials
# (See Quick Start Guide for details)

# Start development server
npm run dev
```

**Open:** `http://localhost:3000`

**For detailed setup instructions, see [Quick Start Guide](./QUICK_START.md)**

---

## Documentation

### For New Developers

**Start here:** [Quick Start Guide](./QUICK_START.md)
- Setup instructions
- Basic workflow
- Common issues

### For Understanding the Project

**Read:** [Developer Handbook](./DEVELOPER_HANDBOOK.md)
- Project architecture
- How Shopify integration works
- Data flow diagrams
- Key concepts

### For Implementing Features

**Reference:** [Component Reference](./COMPONENT_REFERENCE.md)
- Every component explained
- Props, state, behavior
- Usage examples

### For Shopify Integration

**Guide:** [Shopify Integration Guide](./SHOPIFY_INTEGRATION_GUIDE.md)
- API setup
- Metafields configuration
- Webhooks setup
- Common workflows

---

## Development

### Commands

```bash
# Development
npm run dev              # Start dev server
npm run dev:debug        # Debug mode with logs

# Code Quality
npm run typecheck        # TypeScript type checking
npm run lint             # ESLint
npm test                 # Run tests

# Build
npm run build            # Production build
npm run preview          # Preview production build

# Shopify
npm run codegen          # Generate GraphQL types
```

### Project Structure

```
talla/
├── app/
│   ├── routes/              # Pages & API endpoints
│   │   ├── products.$handle.tsx
│   │   ├── collections.$handle.tsx
│   │   ├── cart.tsx
│   │   └── api.recommend-size.tsx
│   │
│   ├── components/          # React components
│   │   ├── ProductPage.tsx
│   │   ├── ProductHeader.tsx
│   │   ├── CartMain.tsx
│   │   └── ...
│   │
│   ├── lib/                 # Utilities
│   │   ├── context.ts       # API clients
│   │   ├── fragments.ts     # GraphQL queries
│   │   └── fabricMapping.ts
│   │
│   ├── styles/              # CSS
│   │   ├── app.css
│   │   └── tailwind.css
│   │
│   └── root.tsx             # Root layout
│
├── public/                  # Static assets
│   ├── talla-logo-black.svg
│   └── talla-logo-white.svg
│
├── .env                     # Environment variables (DO NOT COMMIT)
├── .env.example             # Environment template
├── package.json             # Dependencies
├── vite.config.ts           # Vite configuration
├── tailwind.config.ts       # Tailwind configuration
└── tsconfig.json            # TypeScript configuration
```

### Key Conventions

1. **File-based routing:** File name = URL path
   - `products.$handle.tsx` → `/products/:handle`
   - `api.recommend-size.tsx` → `/api/recommend-size`

2. **GraphQL queries:** Defined in `app/lib/fragments.ts`

3. **Components:** Functional components with TypeScript

4. **Styling:** Tailwind utility classes

5. **State management:** React hooks + React Router loaders

---

## Deployment

### Shopify Oxygen

Talla deploys to Shopify Oxygen, the official hosting platform for Hydrogen apps.

```bash
# Build and deploy
npm run shopify hydrogen deploy
```

**URL:** `https://<workspace>.oxygen.shopifypreview.com`

### Custom Domain

1. Deploy to Oxygen
2. In Shopify Admin > Online Store > Domains
3. Add custom domain
4. Update DNS records

### Environment Variables

Set in Oxygen dashboard:
- `PUBLIC_STOREFRONT_API_TOKEN`
- `PUBLIC_STORE_DOMAIN`
- `PUBLIC_STOREFRONT_ID`
- `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` (for emails)

**For detailed deployment instructions, see [Developer Handbook](./DEVELOPER_HANDBOOK.md#deployment)**

---

## Contributing

### Workflow

1. **Create branch:**
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make changes:**
   - Write code
   - Add tests
   - Update docs

3. **Test:**
   ```bash
   npm run typecheck
   npm run lint
   npm test
   ```

4. **Commit:**
   ```bash
   git add .
   git commit -m "Add feature: description"
   ```

5. **Push:**
   ```bash
   git push origin feature/my-feature
   ```

6. **Create Pull Request**

### Code Style

- **TypeScript** for all new code
- **Functional components** with hooks
- **Tailwind CSS** for styling
- **ESLint** rules enforced
- **Prettier** for formatting

### Testing

- Unit tests for utilities (Vitest)
- Component tests for complex components
- E2E tests for critical flows (optional)

---

## Recent Updates

### December 24, 2024

✅ **Fixed:** Size chart display now shows ranges (e.g., "61-64 cm") instead of concatenated values

✅ **Improved:** ProductHeader now hides when cart drawer is open (better UX)

✅ **Added:** Comprehensive documentation (4 guides covering all aspects)

---

## Support & Resources

### Documentation

- [Quick Start Guide](./QUICK_START.md)
- [Developer Handbook](./DEVELOPER_HANDBOOK.md)
- [Component Reference](./COMPONENT_REFERENCE.md)
- [Shopify Integration Guide](./SHOPIFY_INTEGRATION_GUIDE.md)

### External Resources

- [Shopify Hydrogen Docs](https://shopify.dev/docs/custom-storefronts/hydrogen)
- [Shopify Storefront API](https://shopify.dev/docs/api/storefront)
- [React Router v7](https://reactrouter.com/)
- [Tailwind CSS](https://tailwindcss.com/)

---

**For questions, issues, or contributions, please refer to the documentation or create an issue.**

**Happy coding! 🚀**
