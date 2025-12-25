# Quick Start Guide

Get Talla running locally in 10 minutes.

---

## Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** 10+ (comes with Node.js)
- **Shopify Store** (Plus or Standard plan)
- **Git** ([Download](https://git-scm.com/))
- **Code Editor** (VS Code recommended)

---

## Step 1: Clone & Install

```bash
# Clone repository
git clone <your-repo-url>
cd talla

# Install dependencies
npm install
```

**Expected time:** 2-3 minutes

---

## Step 2: Configure Shopify

### Get Storefront API Token

1. **Login to Shopify Admin:**
   - Go to `https://your-store.myshopify.com/admin`

2. **Create Custom App:**
   - Settings > Apps and sales channels
   - Click "Develop apps"
   - Click "Create an app"
   - Name: "Talla Storefront"

3. **Configure Scopes:**
   - Click "Configure Storefront API scopes"
   - Enable:
     - ✅ `unauthenticated_read_product_listings`
     - ✅ `unauthenticated_write_checkouts`
     - ✅ `unauthenticated_read_checkouts`
   - Save

4. **Install App:**
   - Click "Install app"
   - Copy the **Storefront API access token**

---

## Step 3: Setup Environment Variables

1. **Copy example file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` file:**
   ```env
   PUBLIC_STOREFRONT_API_TOKEN=shpat_xxxxxxxxxxxxx
   PUBLIC_STORE_DOMAIN=your-store.myshopify.com
   PUBLIC_STOREFRONT_ID=gid://shopify/Storefront/xxxxx
   ```

   **How to get Storefront ID:**
   - In Shopify Admin > Online Store
   - Or use this format: `gid://shopify/Storefront/1`

3. **Save file**

---

## Step 4: Run Development Server

```bash
npm run dev
```

**Output:**
```
Hydrogen server started
Local:   http://localhost:3000
```

**Open browser:**
- Go to `http://localhost:3000`
- You should see your store homepage

---

## Step 5: Verify Setup

### Test Product Page

1. **Find a product in Shopify Admin:**
   - Products > Click any product
   - Copy the product "handle" from URL
   - Example: `crew-neck-shirt`

2. **Visit product page:**
   - `http://localhost:3000/products/crew-neck-shirt`

3. **Expected result:**
   - Product images
   - Title, price
   - Size/color options
   - Add to cart button

### Test Cart

1. **Add product to cart**
2. **Click cart icon**
3. **Expected result:**
   - Cart drawer opens
   - Product shows in cart
   - Checkout button visible

---

## Common Issues

### Issue: "Invalid API token"

**Solution:**
1. Check `.env` file has correct token
2. Verify token starts with `shpat_`
3. Regenerate token in Shopify Admin
4. Restart dev server: Stop (Ctrl+C) and run `npm run dev` again

---

### Issue: "Product not found"

**Solution:**
1. Check product is published
2. In Shopify Admin > Products > Edit product
3. Scroll to "Product availability"
4. Ensure "Headless" channel is checked
5. Save product

---

### Issue: Port 3000 already in use

**Solution:**
```bash
# Use different port
PORT=3001 npm run dev
```

---

## Next Steps

### 1. Setup Metafields (Optional)

For advanced features (size recommendation, size charts):

1. **Go to Shopify Admin:**
   - Settings > Custom data > Products

2. **Add metafield:**
   - Name: `Size Dimensions`
   - Namespace: `custom`
   - Key: `size_dimensions`
   - Type: JSON

3. **Add value to a product:**
   ```json
   {
     "S": {"chest": [61, 64], "length": [69, 71]},
     "M": {"chest": [64, 67], "length": [71, 73]},
     "L": {"chest": [67, 70], "length": [73, 75]}
   }
   ```

**See:** `SHOPIFY_INTEGRATION_GUIDE.md` for full metafield setup

---

### 2. Customize Styling

**Update brand colors:**
- Edit `app/styles/talla-design-system.css`
- Edit `tailwind.config.ts`

**Update logo:**
- Replace `public/talla-logo-black.svg`
- Replace `public/talla-logo-white.svg`

---

### 3. Test Features

**Size Recommendation:**
1. Visit any product page
2. Click "Size Guide" button
3. Fill in measurements
4. Get recommended size

**Restock Notifications:**
1. Find out-of-stock product
2. Click "Notify Me" button
3. Enter email
4. Restock product in Shopify
5. Check email inbox

---

## Development Commands

```bash
# Start dev server
npm run dev

# Run tests
npm test

# Type checking
npm run typecheck

# Lint code
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Project Structure

```
talla/
├── app/
│   ├── routes/           # Page routes
│   ├── components/       # React components
│   ├── lib/              # Utilities
│   ├── styles/           # CSS files
│   └── root.tsx          # Root layout
├── public/               # Static assets
├── .env                  # Environment variables (DO NOT COMMIT)
└── package.json          # Dependencies
```

---

## Key Files to Edit

### Adding a new page

Create file in `app/routes/`:
- `pages.new-page.tsx` → `/pages/new-page`

### Adding a new component

Create file in `app/components/`:
- `MyComponent.tsx`

### Updating styles

Edit files in `app/styles/`:
- `app.css` - Custom styles
- `tailwind.css` - Tailwind config

---

## Documentation Index

1. **DEVELOPER_HANDBOOK.md** - Complete project overview
2. **COMPONENT_REFERENCE.md** - Every component explained
3. **SHOPIFY_INTEGRATION_GUIDE.md** - Shopify setup & workflows
4. **QUICK_START.md** - This file

---

## Getting Help

### Check Documentation

1. Read `DEVELOPER_HANDBOOK.md`
2. Search `COMPONENT_REFERENCE.md`
3. Review `SHOPIFY_INTEGRATION_GUIDE.md`

### External Resources

- [Shopify Hydrogen Docs](https://shopify.dev/docs/custom-storefronts/hydrogen)
- [React Router v7](https://reactrouter.com/)
- [Tailwind CSS](https://tailwindcss.com/)

### Common Questions

**Q: How do I add a new product field?**
A: See "Custom Metafields" in `SHOPIFY_INTEGRATION_GUIDE.md`

**Q: How do I customize the checkout?**
A: Checkout is hosted by Shopify. Use Shopify Checkout Extensibility for customization.

**Q: How do I deploy to production?**
A: See "Deployment" in `DEVELOPER_HANDBOOK.md`

**Q: Where is the cart data stored?**
A: In Shopify's backend, accessed via Storefront API. No local database.

**Q: Can I use a different database?**
A: Hydrogen is designed for Shopify data. For additional data (e.g., reviews), use external service or Shopify metaobjects.

---

## Development Workflow

### Daily Workflow

1. **Pull latest code:**
   ```bash
   git pull origin main
   ```

2. **Create feature branch:**
   ```bash
   git checkout -b feature/my-new-feature
   ```

3. **Start dev server:**
   ```bash
   npm run dev
   ```

4. **Make changes:**
   - Edit components
   - Test in browser
   - Hot-reload updates automatically

5. **Commit changes:**
   ```bash
   git add .
   git commit -m "Add new feature"
   ```

6. **Push to remote:**
   ```bash
   git push origin feature/my-new-feature
   ```

7. **Create pull request:**
   - On GitHub/GitLab
   - Request code review
   - Merge to main

---

### Testing Checklist

Before committing:

- ✅ Pages load without errors
- ✅ Cart functions work (add, update, remove)
- ✅ Checkout redirects to Shopify
- ✅ No TypeScript errors (`npm run typecheck`)
- ✅ No lint errors (`npm run lint`)
- ✅ Mobile responsive (test in DevTools)

---

## Tips & Tricks

### Fast Refresh

Vite hot-reloads changes instantly. No need to restart server for:
- Component changes
- Style changes
- Route changes

**Do restart for:**
- `.env` changes
- `package.json` changes
- GraphQL schema changes

### Debug Mode

Enable detailed logs:
```bash
DEBUG=* npm run dev
```

Shows:
- GraphQL queries
- Cache hits/misses
- Route matches

### GraphQL Explorer

Test queries in Shopify:
1. Shopify Admin > Apps > Your app
2. Click "API credentials"
3. Scroll to "Storefront API access token"
4. Click "Manage Storefront API scopes"
5. Use GraphiQL explorer

### VS Code Extensions

Recommended:
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- GraphQL
- Shopify Liquid (for checkout customization)

---

## Troubleshooting

### Server won't start

```bash
# Clear cache
rm -rf .react-router .shopify node_modules
npm install
npm run dev
```

### Changes not reflecting

```bash
# Hard refresh browser
Cmd+Shift+R (Mac)
Ctrl+Shift+R (Windows)
```

### GraphQL errors

1. Check `.env` has correct `PUBLIC_STOREFRONT_API_TOKEN`
2. Verify API scopes in Shopify Admin
3. Test query in GraphiQL explorer
4. Check network tab for error details

---

## Ready to Deploy?

See `DEVELOPER_HANDBOOK.md` > "Deployment" section for:
- Production build
- Shopify Oxygen deployment
- Custom domain setup
- Environment variables

---

**Welcome to Talla! 🎉**

Happy coding! If you get stuck, check the documentation or reach out to the team.
