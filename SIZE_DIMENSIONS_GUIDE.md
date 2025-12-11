# Size Dimensions Setup Guide

## Overview
The size recommendation system now supports product-specific size dimensions with flexible measurement formats.

## Metafield Setup in Shopify

### Step 1: Create Custom Metafield
1. Go to **Shopify Admin** → **Settings** → **Custom Data** → **Products**
2. Click **Add definition**
3. Configure:
   - **Name**: Size Dimensions
   - **Namespace and key**: `custom.size_dimensions`
   - **Type**: JSON
   - **Description**: Product-specific size measurements for AI recommendations

### Step 2: Supported Formats

#### Format 1: Single Values (as shown in your screenshot)
```json
{
  "S": {
    "chest": 61,
    "length": 69,
    "arm": 58
  },
  "M": {
    "chest": 64,
    "length": 71,
    "arm": 59
  },
  "L": {
    "chest": 67,
    "length": 73,
    "arm": 60
  },
  "XL": {
    "chest": 70,
    "length": 75,
    "arm": 61
  }
}
```

#### Format 2: Range Values (min-max)
```json
{
  "S": {
    "chest": [86, 91],
    "waist": [71, 76],
    "hips": [91, 96]
  },
  "M": {
    "chest": [91, 96],
    "waist": [76, 81],
    "hips": [96, 101]
  },
  "L": {
    "chest": [96, 101],
    "waist": [81, 86],
    "hips": [101, 106]
  }
}
```

#### Mixed Format (both single values and ranges)
```json
{
  "S": {
    "chest": [86, 91],
    "waist": 73,
    "hips": [91, 96],
    "length": 68
  },
  "M": {
    "chest": [91, 96],
    "waist": 78,
    "hips": [96, 101],
    "length": 70
  }
}
```

## Supported Measurements

The system supports the following measurements (all in **centimeters**):
- `chest` - Chest circumference (primary measurement)
- `waist` - Waist circumference
- `hips` - Hip circumference
- `length` - Garment length
- `arm` - Arm/sleeve length
- `shoulder` - Shoulder width

**Note**: You only need to include the measurements relevant to your product type. The system will automatically use whatever measurements you provide.

## Gender-Specific Products

### Automatic Gender Detection
The system uses the user's selected gender during measurement input. You don't need to mark products as gender-specific unless you want to filter which products show the size recommendation feature.

### Optional: Tag-Based Gender Filtering (Future Enhancement)
If you want to restrict size recommendations to specific genders:
- Add tags like `gender:men`, `gender:women`, or `gender:unisex` to products
- The system will automatically adjust the recommendation algorithm based on user gender

## How the Algorithm Works

### 1. Body Measurement Estimation
- Users enter: height, weight, gender, and fit preference
- System estimates: chest, waist, hips using anthropometric formulas
- Adjusts for BMI and body composition

### 2. Size Matching
- For single values: Creates a tolerance range (±2cm)
- For ranges: Uses the exact range provided
- Scores each size based on fit preference:
  - **Slim fit**: Prefers lower end of range
  - **Regular fit**: Prefers middle of range
  - **Athletic fit**: Slightly prefers lower end
  - **Relaxed fit**: Prefers upper end of range

### 3. Confidence Scoring
- **High confidence (85%+)**: Excellent fit
- **Good confidence (70-85%)**: Good fit - recommended
- **Acceptable (55-70%)**: Acceptable fit - may vary by style
- **Low (<55%)**: Best available option - check size chart carefully

### 4. Gender-Specific Weighting
The algorithm uses different measurement priorities:

**For Men**:
- Chest: 50% importance
- Waist: 30% importance
- Hips: 20% importance

**For Women**:
- Chest: 35% importance
- Waist: 35% importance
- Hips: 30% importance

## Example Product Setups

### Men's T-Shirt
```json
{
  "S": {
    "chest": 92,
    "length": 69,
    "shoulder": 45
  },
  "M": {
    "chest": 97,
    "length": 71,
    "shoulder": 47
  },
  "L": {
    "chest": 102,
    "length": 73,
    "shoulder": 49
  },
  "XL": {
    "chest": 107,
    "length": 75,
    "shoulder": 51
  }
}
```

### Women's Dress
```json
{
  "XS": {
    "chest": [81, 84],
    "waist": [64, 67],
    "hips": [89, 92],
    "length": 95
  },
  "S": {
    "chest": [84, 89],
    "waist": [67, 72],
    "hips": [92, 97],
    "length": 97
  },
  "M": {
    "chest": [89, 94],
    "waist": [72, 77],
    "hips": [97, 102],
    "length": 99
  },
  "L": {
    "chest": [94, 99],
    "waist": [77, 82],
    "hips": [102, 107],
    "length": 101
  }
}
```

### Men's Jeans (waist-focused)
```json
{
  "30": {
    "waist": [76, 78],
    "hips": [94, 97],
    "length": 102
  },
  "32": {
    "waist": [81, 83],
    "hips": [99, 102],
    "length": 104
  },
  "34": {
    "waist": [86, 88],
    "hips": [104, 107],
    "length": 106
  }
}
```

## Verification Steps

After adding the metafield to a product:

1. **Check Console Logs** (Development mode):
   - Open browser console on product page
   - Look for: `PDP mapped size/brand chart & dimensions`
   - Verify `sizeDimensions` is populated

2. **Test Size Recommendation**:
   - Click "Size Guide" button
   - Enter measurements:
     - Height: 175cm
     - Weight: 70kg
     - Gender: Male
     - Fit: Regular
   - Should see:
     - Recommended size (not "Generic recommendation")
     - Confidence level with color coding
     - Detailed reasoning
     - Your estimated measurements

3. **Expected Results**:
   - ✅ High confidence (green) = Perfect match
   - ⚠️ Low confidence (orange) = Generic fallback (no metafield data)

## Troubleshooting

### Issue: "Generic recommendation - product size data not available"
**Cause**: Metafield not fetched or parsed correctly

**Solutions**:
1. Verify metafield namespace is exactly `custom`
2. Verify metafield key is exactly `size_dimensions`
3. Check JSON format is valid (no trailing commas, proper quotes)
4. Refresh the product page after saving metafield
5. Check browser console for parsing errors

### Issue: Recommendations seem inaccurate
**Causes**:
- Measurements might be in inches instead of centimeters
- Size dimensions might be for flat lay instead of body measurements

**Solutions**:
- Ensure all measurements are in **centimeters**
- For flat lay measurements, add ~4-8cm for body measurements
- Use ranges instead of single values for more flexibility

### Issue: Wrong size names
**Solution**: Size names in metafield must **exactly match** your product variant size options (including case and spaces)

## Best Practices

1. **Use Ranges for Flexibility**: `[min, max]` ranges provide better recommendations than single values
2. **Measure Consistently**: Use the same measurement method for all products in a category
3. **Include Primary Measurements**: Always include chest/bust for tops, waist for bottoms
4. **Test with Real Users**: Get feedback and adjust ranges accordingly
5. **Update Seasonally**: Different fabric weights may need different tolerances

## Getting Measurements

### From Existing Size Charts
Convert your flat size chart measurements to body measurements by adding wearing ease:
- T-shirts: +4-6cm
- Fitted shirts: +6-8cm
- Relaxed fits: +8-12cm
- Dresses: +2-6cm
- Jeans/pants: +2-4cm (waist), +4-6cm (hips)

### From Manufacturer Specs
Use the "fits body measurements" specifications if available, not garment measurements.

### From Competitors
Research similar products and their size charts for reference ranges.

## Support

If you encounter any issues or need assistance:
1. Check console logs for detailed error messages
2. Verify JSON format using a JSON validator
3. Test with a simple format first (single values only)
4. Gradually add more sizes and measurements

---

**Note**: The system will automatically fall back to generic recommendations if product-specific data is not available, so you can roll out metafields gradually across your catalog.
