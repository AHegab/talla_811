# Google Maps API Setup for TALLA Checkout

## Overview
The checkout form now includes a Google Maps integration that allows customers to:
- Pin their exact delivery location on a map
- Enter their email address
- Enter their phone number

## Setup Instructions

### 1. Get a Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - **Maps JavaScript API**
   - **Geocoding API**
   - **Places API** (optional, for address autocomplete)
4. Create credentials:
   - Go to "Credentials" in the left sidebar
   - Click "Create Credentials" → "API Key"
   - Copy your new API key

### 2. Restrict Your API Key (Recommended for Production)

1. Click on your API key in the Credentials page
2. Under "Application restrictions":
   - Select "HTTP referrers (web sites)"
   - Add your domains:
     ```
     localhost:3000/*
     yourdomain.com/*
     *.myshopify.com/*
     ```
3. Under "API restrictions":
   - Select "Restrict key"
   - Select only the APIs you enabled above

### 3. Add API Key to Your Code

Open `app/components/CheckoutForm.tsx` and replace this line:

```typescript
script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=places`;
```

With your actual API key:

```typescript
script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyD...your-key-here...&libraries=places`;
```

**For production**, store the API key in environment variables:

1. Create a `.env` file:
   ```
   VITE_GOOGLE_MAPS_API_KEY=AIzaSyD...your-key-here...
   ```

2. Update the component to use the environment variable:
   ```typescript
   script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
   ```

## Features

### Map Interaction
- **Auto-location**: Automatically detects user's current location (with permission)
- **Click to select**: Click anywhere on the map to set delivery location
- **Drag marker**: Drag the red marker to adjust the exact location
- **Reverse geocoding**: Automatically converts coordinates to readable address

### Form Validation
- Email validation with proper regex
- Phone number required
- Location must be selected on map
- All fields required before checkout

### Data Storage
The checkout data is stored in two places:
1. **localStorage** (key: `talla_checkout_data`):
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

2. **Shopify Checkout URL Parameters**:
   - Email is pre-filled
   - Phone number is pre-filled in shipping address
   - Location is added to order note

## Usage Flow

1. Customer adds items to cart
2. Customer clicks "Continue to Checkout" button
3. Modal opens with checkout form
4. Customer fills in email and phone
5. Customer pins location on Google Maps
6. Customer clicks "Continue to Payment"
7. Data is saved to localStorage
8. Customer is redirected to Shopify checkout with pre-filled information

## Customization

### Default Map Center
Currently set to Cairo, Egypt. Update in `CheckoutForm.tsx`:

```typescript
const defaultCenter = { lat: 30.0444, lng: 31.2357 }; // Change these coordinates
```

### Map Styling
The map size and appearance can be customized in the component:

```typescript
zoom: 13, // Adjust zoom level (1-20)
```

For custom map styles, add a `styles` property to the map configuration.

### Validation Rules
Modify validation in the `handleSubmit` function:

```typescript
// Example: Add phone number format validation
const phoneRegex = /^\+?[\d\s-]+$/;
if (!phoneRegex.test(phone)) {
  alert('Please enter a valid phone number');
  return;
}
```

## Troubleshooting

### Map not loading
- Check browser console for errors
- Verify API key is correct
- Ensure APIs are enabled in Google Cloud Console
- Check domain restrictions match your current domain

### Location not detected
- Browser must support geolocation API
- User must grant location permission
- Falls back to default center (Cairo) if denied

### Checkout not redirecting
- Verify cart has a valid `checkoutUrl`
- Check browser console for JavaScript errors
- Ensure localStorage is not disabled

## Cost Considerations

Google Maps API has a free tier:
- **$200 free credit per month**
- Maps JavaScript API: $7 per 1,000 loads
- Geocoding API: $5 per 1,000 requests

For most small to medium stores, this stays within the free tier.

## Security Notes

1. **Never expose API keys in client-side code** for production
2. Use domain restrictions on your API key
3. Consider using a backend proxy to hide the API key
4. Monitor your API usage in Google Cloud Console
5. Set up billing alerts to avoid unexpected charges

## Future Enhancements

Possible improvements:
- Address autocomplete with Places API
- Multiple delivery locations
- Save favorite locations
- Map radius selector for delivery zones
- Delivery time picker
- Special delivery instructions field
