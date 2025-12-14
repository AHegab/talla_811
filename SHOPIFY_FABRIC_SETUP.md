# How to Add Fabric/Material Information in Shopify

This guide explains how to add fabric/material information to your products so the size recommendation system can provide better sizing accuracy.

## Quick Setup

### Step 1: Create the Metafield in Shopify

1. Go to **Shopify Admin → Settings → Custom data**
2. Click on **Products**
3. Click **Add definition**
4. Fill in:
   - **Name**: `Fabric Type`
   - **Namespace and key**: `custom.fabric_type`
   - **Description**: `Material composition for size recommendation system`
   - **Type**: Select **Single line text**
   - **Validation**: Leave as "None" (allows any material name)
5. Click **Save**

### Step 2: Add Materials to Your Products

Go to any product and you'll now see a "Fabric Type" field in the metafields section. You can enter any of your materials:

## Your Supported Materials

The system automatically recognizes these materials and applies the correct stretch adjustments:

| Material Name | Stretch Adjustment | Best For |
|---------------|-------------------|----------|
| **Pure 100% Cotton** | 0% (no stretch) | Formal shirts, rigid garments (cotton only, no lycra) |
| **100% Pure Cotton + Lycra** | 15% (high stretch) | Comfortable fitted garments with stretch |
| **Milton** | 5% (slight stretch) | Comfortable everyday wear |
| **Refined Summer Milton** | 5% (slight stretch) | Lightweight summer clothing |
| **Polyester** | 10% (moderate stretch) | Athletic wear, casual tops |
| **Lycra** | 15% (high stretch) | Activewear, fitted garments |

### How to Add to Products

**Option 1: Individual Product (Shopify Admin)**
1. Go to **Products** → Select a product
2. Scroll to **Metafields** section
3. Find "Fabric Type" field
4. Enter the material name exactly as shown above (case-insensitive)
   - Examples: `Milton`, `pure 100% cotton`, `Lycra`, `100% Pure Cotton + Lycra`
5. Save the product

**Option 2: Bulk Import via CSV**

Create a CSV file like this:

```csv
Handle,Metafield: custom.fabric_type [single_line_text_field]
classic-shirt,Pure 100% Cotton
fitted-tee,100% Pure Cotton + Lycra
summer-tee,Milton
polo-shirt,Refined Summer Milton
track-pants,Polyester
yoga-pants,Lycra
```

Then import:
1. Go to **Products** → **Import**
2. Upload your CSV file
3. Check "Overwrite existing products with same handle"
4. Click **Upload and continue**

**Option 3: Using Shopify Admin API**

```graphql
mutation UpdateProductFabric {
  productUpdate(input: {
    id: "gid://shopify/Product/YOUR_PRODUCT_ID"
    metafields: [{
      namespace: "custom"
      key: "fabric_type"
      value: "Milton"
      type: "single_line_text_field"
    }]
  }) {
    product {
      id
      metafields(first: 10) {
        nodes {
          namespace
          key
          value
        }
      }
    }
  }
}
```

## How It Works

### Automatic Mapping

The system automatically maps your material names to fabric types:

- **Pure 100% Cotton** (alone) → Pure Cotton (no stretch)
- **100% Pure Cotton + Lycra** → Highly Elastic (15% stretch)
- **Milton / Refined Summer Milton** → Cotton Blend (5% stretch)
- **Polyester** → Knit Fabric (10% stretch)
- **Lycra** → Highly Elastic (15% stretch)

### Stretch Adjustments Applied

When a user selects a fitted wearing preference and your product has a stretchy material:

| Material | User can size down by | Result |
|----------|----------------------|---------|
| Pure Cotton | 0 cm | No adjustment |
| Milton | ~0.4-0.6 cm | Slight flexibility |
| Polyester | ~0.8-1.0 cm | Moderate flexibility |
| Lycra | ~1.2-1.5 cm | High flexibility |

### Smart Matching

The system is smart about matching! It will recognize:
- Variations: "milton", "Milton", "MILTON"
- With extra text: "Milton fabric", "Pure 100% cotton"
- Common typos: "polyesteer" → Polyester
- Blends: "cotton lycra", "Cotton + Lycra", "pure cotton + lycra" → Highly Elastic
- Partial matches: Intelligently detects combinations

**Important for Blends:**
- Any material containing BOTH "cotton" AND "lycra" → Highly Elastic (15% stretch)
- This ensures cotton+lycra blends get proper stretch treatment
- "Pure 100% Cotton" alone (no lycra) → No stretch

If you enter a material that isn't recognized, it will:
1. Try to detect cotton+lycra combinations first
2. Try to match keywords (cotton, lycra, polyester, etc.)
3. Fall back to no stretch adjustment
4. Log a warning in the console (visible in browser dev tools)

## Testing

After adding fabric types to products:

1. Visit a product page with fabric_type set
2. Open browser console (F12)
3. Look for: `✅ Material: Milton → Fabric type: cotton_blend`
4. Click "Find My Size"
5. The fabric selector should be pre-selected with the correct option

## Adding New Materials

If you introduce new materials in the future, you can:

1. **Add to the mapping** (developer task):
   - Edit `app/lib/fabricMapping.ts`
   - Add your material to the `materialMappings` object
   - Map it to the appropriate fabric type

2. **Or just use it as-is**:
   - The system will try to match keywords
   - Example: "Cotton Spandex Blend" will automatically map to highly_elastic

## Benefits

When fabric type is specified:

✅ **Better Sizing**: Accounts for material stretch in recommendations
✅ **Higher Confidence**: +5% confidence boost when fabric is known
✅ **Fitted Styles**: +10% confidence for fitted styles with stretchy fabrics
✅ **User-Friendly**: Fabric selector pre-filled in the form
✅ **Flexible**: Works with your exact material names

## FAQ

**Q: What if I misspell a material name?**
A: The system has fuzzy matching and will try to match keywords. For best results, use the exact names listed above.

**Q: Can I use material blends?**
A: Yes! Use combinations like "Cotton Lycra" or "Poly Cotton" and the system will intelligently map them.

**Q: What happens if I don't add fabric_type to a product?**
A: The size recommendation still works! It just won't apply stretch adjustments. Users can manually select the fabric type in the form.

**Q: Can I see which products have fabric_type set?**
A: Yes! In Shopify Admin → Products, you can filter by metafields or export to CSV to see which products have this field populated.

## Next Steps

1. Create the `custom.fabric_type` metafield in Shopify
2. Add fabric types to your products (start with best-sellers)
3. Test the size recommendation on a product page
4. Consider bulk importing if you have many products

All done! The system will now provide more accurate size recommendations based on your actual materials.
