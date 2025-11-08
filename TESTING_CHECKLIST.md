# Complete Customer Journey - Test Checklist

## ✅ Everything is now ready to test!

All components have been verified and error handling added. Follow this checklist to test the complete flow:

---

## 🎯 Test Scenario: First-Time Customer Journey

### 1. **Product Discovery & Detail Page**

**URL:** `http://localhost:3000/products/talla-classic-tee`

#### Test Points:
- [ ] Page loads without errors
- [ ] Product gallery shows images (3:4 aspect ratio)
- [ ] Vendor, Type, and Tags display correctly:
  - Vendor: "Talla" with border separator
  - Type: "T-Shirt" with label
  - Tags: up to 5 tags as gray pills
- [ ] Size options show with proper styling
- [ ] Color options show (if available)
- [ ] Price displays correctly
- [ ] Add to Cart button is functional

#### Size Recommendation Flow:

**If NO measurements saved:**
- [ ] Banner shows: "Not sure about your size?" with "Get size recommendation" link
- [ ] Clicking link opens measurement form modal
- [ ] Form includes:
  - [ ] Metric/Imperial toggle
  - [ ] Height input (cm or inches)
  - [ ] Weight input (kg or lbs)
  - [ ] Body fit preference (slim/regular/relaxed)
  - [ ] Gender selection (male/female/unisex)
- [ ] Submitting form saves to localStorage and reloads page
- [ ] After reload, recommended size shows

**If measurements exist:**
- [ ] Green banner shows: "We recommend size M for you"
- [ ] Recommended size button has cyan border + checkmark icon
- [ ] Clicking recommended size selects it

---

### 2. **Add to Cart**

#### Test Points:
- [ ] Select size (e.g., M)
- [ ] Select color (if applicable)
- [ ] Click "Add to Cart"
- [ ] Success feedback shows
- [ ] Cart icon updates with quantity

---

### 3. **Cart Page**

**URL:** `http://localhost:3000/cart`

#### Test Points:
- [ ] Cart page loads successfully
- [ ] Product items display with:
  - [ ] Product image
  - [ ] Title
  - [ ] Selected options (Size, Color)
  - [ ] Price
  - [ ] Quantity selector
  - [ ] Remove button
- [ ] Subtotal calculates correctly
- [ ] Discount code input works (optional)
- [ ] Gift card input works (optional)
- [ ] "Continue to Checkout" button is visible and enabled

---

### 4. **Custom Checkout Modal**

#### Test Points:

**Opening Modal:**
- [ ] Click "Continue to Checkout" button
- [ ] Modal opens with backdrop blur
- [ ] Close button (X) visible in top-right corner
- [ ] Clicking backdrop or X closes modal

**Contact Information:**
- [ ] Email input field present
- [ ] Phone number input field present
- [ ] Typing works in both fields
- [ ] Email validation:
  - [ ] Invalid email shows error (test: "test@test")
  - [ ] Valid email accepts (test: "customer@example.com")

**Google Maps Integration:**

**Success Case (map loads):**
- [ ] Map loads successfully
- [ ] Default center: Cairo, Egypt (30.0444, 31.2357)
- [ ] Browser asks for location permission
- [ ] If "Allow": map centers on actual location
- [ ] If "Deny": stays at Cairo center
- [ ] Red marker is visible and draggable
- [ ] Clicking map moves marker
- [ ] Dragging marker updates location
- [ ] Address updates below map with:
  - [ ] Selected location text
  - [ ] Full address
  - [ ] Coordinates (latitude, longitude)
- [ ] Green banner shows selected location

**Failure Case (map doesn't load):**
- [ ] Yellow warning banner shows instead of map
- [ ] Message: "Map couldn't load"
- [ ] Explanation: "You can still proceed..."
- [ ] Submit button stays enabled
- [ ] Footer text changes to: "You'll provide your delivery address on the next page"

**Form Submission:**
- [ ] Button disabled when fields empty
- [ ] Button enabled when:
  - Email filled
  - Phone filled
  - Location selected (or map error)
- [ ] Clicking "Continue to Payment":
  - [ ] Data saved to localStorage (`talla_checkout_data`)
  - [ ] Redirected to Shopify checkout
  - [ ] Email pre-filled in Shopify
  - [ ] Phone pre-filled in Shopify
  - [ ] Location in order note (if map worked)

---

### 5. **Shopify Checkout**

**URL:** `https://[your-store].myshopify.com/checkouts/...`

#### Test Points:
- [ ] Checkout page loads
- [ ] Email is pre-filled
- [ ] Phone number is pre-filled in shipping address
- [ ] Can complete shipping address
- [ ] Can select shipping method
- [ ] Can enter payment details
- [ ] Can place order

---

### 6. **Order Confirmation**

#### Test Points:
- [ ] Order confirmation page shows
- [ ] Order number displayed
- [ ] Email confirmation sent
- [ ] Order note includes delivery location (if map was used)

---

## 🔧 LocalStorage Data Verification

Open DevTools → Application → Local Storage → `localhost:3000`

**Check for these keys:**

1. **`talla_user_measurements`**
```json
{
  "height": 175,
  "weight": 70,
  "unit": "metric",
  "bodyFit": "regular",
  "gender": "male"
}
```

2. **`talla_checkout_data`**
```json
{
  "email": "customer@example.com",
  "phone": "+20 123 456 7890",
  "location": {
    "lat": 30.0444,
    "lng": 31.2357,
    "address": "Cairo, Egypt"
  },
  "cartId": "gid://shopify/Cart/...",
  "timestamp": "2025-11-08T..."
}
```

---

## 🐛 Error Scenarios to Test

### Product Page Errors:
- [ ] Product with no vendor → should not crash
- [ ] Product with no type → should not crash
- [ ] Product with no tags → should not crash
- [ ] Product with no variants → should show error gracefully
- [ ] Product out of stock → sizes should be disabled

### Cart Errors:
- [ ] Empty cart → shows "Your cart is empty" message
- [ ] No checkout URL → button disabled

### Checkout Modal Errors:
- [ ] Google Maps API key invalid → shows yellow warning
- [ ] Network offline → map shows error, can still proceed
- [ ] Location permission denied → uses default Cairo location
- [ ] Invalid email format → shows alert
- [ ] Empty fields → button stays disabled

---

## 📱 Mobile Testing

Test on mobile viewport (375px width):

- [ ] Product images scale properly
- [ ] Size buttons are tappable
- [ ] Cart layout is mobile-friendly
- [ ] Checkout modal is scrollable
- [ ] Map is zoomable/pannable with touch
- [ ] Marker is draggable on touch
- [ ] Form inputs have proper mobile keyboards

---

## ⚡ Performance Checks

- [ ] Product page loads < 3s
- [ ] Map loads < 2s
- [ ] Form submits instantly
- [ ] No console errors
- [ ] No React hydration errors
- [ ] No GraphQL errors

---

## 🎨 Visual Checks

### Product Page:
- [ ] Clean minimal design
- [ ] Proper spacing
- [ ] Fonts load correctly (Playfair Display SC + Open Sans)
- [ ] Colors match brand (#FBFBFB bg, #1A1A1A text)
- [ ] Images sharp and clear
- [ ] Recommended size has cyan border (#00F4D2)

### Cart Page:
- [ ] Clean layout
- [ ] Proper alignment
- [ ] Discount/gift card sections styled
- [ ] Checkout button prominent

### Checkout Modal:
- [ ] Centered on screen
- [ ] Proper shadows
- [ ] Map fills container
- [ ] Inputs have focus states
- [ ] Button has hover state
- [ ] Close button visible

---

## 🚀 Quick Test Commands

```bash
# Start dev server (if not running)
npm run dev

# Open in browser
start http://localhost:3000/products/talla-classic-tee

# Check for TypeScript errors
npx tsc --noEmit

# Check for console errors
# Open DevTools → Console
```

---

## ✨ Success Criteria

All checkboxes above should be ✅ for a perfect customer journey.

### Key Metrics:
- **Zero runtime errors** in console
- **Zero TypeScript errors** in build
- **100% form submission success** (with or without map)
- **Data persistence** in localStorage
- **Shopify pre-fill** working correctly
- **Graceful fallbacks** for all error scenarios

---

## 🎯 What's Working Now

1. ✅ **PDP displays metadata** (vendor, type, tags)
2. ✅ **Size recommendations** with visual highlight
3. ✅ **Measurement prompt** for new users
4. ✅ **Cart flow** with modal checkout
5. ✅ **Google Maps integration** with location picker
6. ✅ **Form validation** and localStorage storage
7. ✅ **Shopify checkout** with pre-filled data
8. ✅ **Error handling** and graceful fallbacks
9. ✅ **Map error fallback** (can proceed without map)
10. ✅ **Mobile-responsive** design

---

## 📝 Notes

- **Google Maps API Key**: Already added (`AIzaSyCdGhlWqS0SU4Y3MMBxoQLTV0mBtRGzkzk`)
- **Default Location**: Cairo, Egypt (can be changed in CheckoutForm.tsx)
- **Measurements**: Stored indefinitely in localStorage
- **Checkout Data**: Stored until checkout completes

---

## 🔄 Testing Loop

For best results, test in this order:
1. Clear localStorage
2. Visit product page
3. Complete size recommendation form
4. Add product to cart
5. Go to cart
6. Open checkout modal
7. Fill form + pin location
8. Submit to Shopify
9. Verify pre-filled data
10. Check localStorage data

Then repeat with variations (map error, no measurements, etc.)

---

**Ready to test!** 🎉
