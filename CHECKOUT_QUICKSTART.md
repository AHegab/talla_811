# Quick Start: Add Google Maps API Key

## Immediate Steps (5 minutes)

### 1. Get Your API Key
Visit: https://console.cloud.google.com/

1. Click "Create Project" or select existing project
2. Go to "APIs & Services" → "Library"
3. Search and enable:
   - Maps JavaScript API
   - Geocoding API
4. Go to "Credentials" → "Create Credentials" → "API Key"
5. Copy the API key

### 2. Add to Your Code
Open: `app/components/CheckoutForm.tsx`

Find line 41:
```typescript
script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=places`;
```

Replace `YOUR_GOOGLE_MAPS_API_KEY` with your actual key:
```typescript
script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyD...&libraries=places`;
``` 

### 3. Test It
1. Save the file
2. Go to cart page: http://localhost:3000/cart
3. Add items to cart
4. Click "Continue to Checkout"
5. You should see the modal with:
   - Email input
   - Phone input
   - Interactive Google Map

### 4. How It Works

**Customer Flow:**
1. Customer adds products to cart
2. Clicks "Continue to Checkout" button in cart
3. Modal opens with checkout form
4. Customer fills email + phone
5. Customer pins location on map (click or drag marker)
6. Selected address appears below map
7. Clicks "Continue to Payment"
8. Data saved and redirected to Shopify checkout

**Data Saved:**
- Email, phone, location → localStorage (`talla_checkout_data`)
- Email, phone, location → Shopify checkout URL parameters
- Location → Order note in Shopify

## Testing Checklist

- [ ] Map loads correctly
- [ ] Current location detected (may need to allow browser permission)
- [ ] Can click on map to set location
- [ ] Can drag marker to adjust location
- [ ] Address updates when location changes
- [ ] Email validation works
- [ ] Phone validation works
- [ ] "Continue to Payment" button redirects to Shopify checkout
- [ ] Data pre-filled in Shopify checkout form

## Common Issues

**Map not showing?**
- Check API key is correct
- Check browser console for errors
- Verify APIs are enabled in Google Cloud Console

**Location not detected?**
- Click "Allow" when browser asks for location permission
- If denied, map will center on default location (Cairo)

**Button not clickable?**
- All fields must be filled
- Location must be selected on map

## Need Help?

See `GOOGLE_MAPS_SETUP.md` for detailed documentation.
