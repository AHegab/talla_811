# How to Assign Images to Product Variants in Shopify

## Why Images Aren't Changing?

When you select different colors on your product page, the image should change. If it's not working, it's because **variant images aren't assigned in Shopify Admin**.

## Quick Fix (2 minutes per product)

### Method 1: Assign Images to Variants (Recommended)

1. **Go to Shopify Admin**
   - Products → All Products
   - Click on the product (e.g., "Henley Tshirt")

2. **Scroll to "Media" section**
   - You'll see all your product images

3. **Click on each image**
   - In the popup, you'll see "Assign to variant"
   - Select the variants this image represents
   - Example: For the olive-colored shirt image, select:
     - ✓ S / Olive
     - ✓ M / Olive
     - ✓ L / Olive
     - ✓ XL / Olive

4. **Repeat for each color**
   - White shirt image → assign to all "White" variants
   - Black shirt image → assign to all "Black" variants
   - Light Grey image → assign to all "Light Grey" variants
   - Olive image → assign to all "Olive" variants

5. **Save the product**

### Method 2: Add Color Names to Image Alt Text (Fallback)

If you don't want to assign variants manually, the code now has a smart fallback:

1. **Edit each product image**
2. **Add the color name to the Alt Text**
   - Example: "Henley Tshirt - Olive"
   - Example: "Henley Tshirt - White"
   - Example: "Henley Tshirt - Black"

3. **Save**

The system will automatically match images by color name!

## How It Works Now

The code tries 3 methods in order:

1. **Shopify Assignment** (Best) - If variant has an image assigned in Shopify
2. **Alt Text Matching** (Fallback) - If image alt text contains the color name
3. **URL Matching** (Fallback) - If image URL contains the color name
4. **Show All Images** (Default) - If no match, show all product images

## Testing

After assigning images:

1. Go to your product page
2. Select different colors
3. The main gallery image should change immediately
4. Check browser console for: `✅ Matched image by color: olive`

## Bulk Editing (For Many Products)

If you have many products, consider:

1. **Shopify Bulk Editor**
   - Products → All Products
   - Select multiple products
   - More actions → Edit media

2. **CSV Export/Import**
   - Products → Export
   - Add variant image URLs in CSV
   - Re-import

3. **Shopify App**
   - Search Shopify App Store for "bulk image assignment"
   - Apps like "Bulk Image Edit" can help

## Example: Your Henley Tshirt

Based on your Shopify admin screenshot, here's what to do:

### Images You Have:
1. First image (Light Grey on model)
2. Second image (White shirt on model)
3. Third image (Grey shirt flat)
4. Fourth image (Olive shirt on model)
5. Fifth image (Black shirt on model)
6. Additional images...

### Assign Them Like This:

**Image 1 (Light Grey model):**
- S / Light Grey
- M / Light Grey
- L / Light Grey
- XL / Light Grey

**Image 2 (White model):**
- S / White
- M / White
- L / White
- XL / White

**Image 4 (Olive model):**
- S / Olive
- M / Olive
- L / Olive
- XL / Olive

**Image 5 (Black model):**
- S / Black
- M / Black
- L / Black
- XL / Black

## Common Issues

### "I assigned images but they're not changing"
- Clear your browser cache (Ctrl+Shift+R)
- Check that you saved the product
- Verify variant image in GraphQL: Query the product and check variant.image

### "Some colors work, others don't"
- Make sure every color variant has an image assigned
- Check the color name matches exactly (case doesn't matter)

### "I have color variations within each color"
- Assign the best representative image to the variant
- All variant images will still be available in the thumbnail gallery

## Need Help?

Check the browser console logs:
```javascript
// You should see:
Selected Variant: S / Olive
✅ Matched image by color: olive
Variant Image: https://cdn.shopify.com/.../olive-shirt.jpg
```

If you see "Variant Image: undefined", the image isn't assigned properly.

---

## Pro Tips

1. **Consistent Naming**: Name your images with color in the filename (e.g., `henley-olive.jpg`)
2. **Alt Text**: Always include color in alt text for SEO and accessibility
3. **First Image**: The first image in media should be your primary/hero image
4. **Order Matters**: Arrange images in Shopify media section in the order you want them to appear

After setting this up once, all new products will work correctly if you follow the same naming convention!
