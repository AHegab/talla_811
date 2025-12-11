# Size Dimensions Setup Guide

## Overview
The size recommendation system now supports product-specific size dimensions with flexible measurement formats and improved body measurement estimation.

## How Body Measurements Are Estimated

The system estimates chest width (front measurement only, matching flat lay garment measurements) from height and weight:

### Estimation Algorithm

1. **Base Chest Width** (from height):
   - Male: chest width ≈ 26% of height
   - Female: chest width ≈ 25% of height
   - Example: 175cm male → ~45.5cm base chest width

2. **BMI Adjustments**:
   - Calculates BMI: weight(kg) / height(m)²
   - Compares to baseline (23 for males, 22 for females)
   - For each BMI point above/below baseline:
     - Males: ±0.5cm chest width
     - Females: ±0.4cm chest width
   - Example: BMI 29.7 (vs baseline 23) = +6.7 BMI points → +3.4cm chest width

3. **Fit Preference Adjustments**:
   - Slim: -2cm (slimmer build)
   - Regular: 0cm (average)
   - Athletic: +1cm (more muscular chest)
   - Relaxed: +2cm (fuller build)

4. **Final Range**:
   - Clamped between 35cm - 60cm to ensure reasonable values

5. **Wearing Ease Application**:
   For stretchy fabrics, the garment should be smaller than the body:
   - Slim fit: garment 5cm smaller than body
   - Regular fit: garment 8cm smaller than body
   - Athletic fit: garment 7cm smaller than body
   - Relaxed fit: garment 10cm smaller than body

**Example 1 - Fitted Garment**: 175cm, 91kg male, relaxed fit:
- Base: 175 × 0.26 = 45.5cm
- BMI: 29.7, delta from 23 = +6.7 → add 3.4cm
- Fit adjustment (relaxed): +2cm
- Total body width: ~51cm
- Product with M=38cm flat lay (fitted style, smallest <55cm)
- Target garment (relaxed fitted): 51 - 10 = 41cm
- Difference: 3cm → recommends **M** with good confidence ✓

**Example 2 - Oversized Garment**: 175cm, 91kg male, regular fit:
- Body width: ~51cm (same calculation as above)
- Product with M=64cm flat lay (oversized style, smallest ≥55cm)
- Target garment (regular oversized): 51 + 12 = 63cm
- Difference: 1cm → recommends **M** with excellent confidence ✓

This is a heuristic estimation, NOT a medical or precise anthropometric model.

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
- `chest` - Chest measurement (primary measurement for matching)
- `length` - Garment length
- `arm` - Arm/sleeve length
- `shoulder` - Shoulder width
- `waist` - Waist measurement (for future enhancements)
- `hips` - Hip measurement (for future enhancements)

**Flexible Format Support**: The system automatically detects whether your measurements are:
- **Flat lay width** (typically <80cm) - measured across the front of garment
- **Full circumference** (typically ≥80cm) - full body/garment circumference

If circumference measurements are detected (smallest size ≥80cm), they are automatically converted to flat lay width by dividing by 2.

**Garment Style Detection**: The system also detects garment fit style:
- **Fitted/Stretch** (smallest <55cm flat lay) - applies negative wearing ease (garment smaller than body)
- **Oversized/Streetwear** (smallest ≥55cm flat lay) - applies positive wearing ease (garment larger than body)

**Note**: Currently, the system primarily uses `chest` measurement for size matching. You only need to include the measurements relevant to your product type.

## Gender-Specific Products

### Automatic Gender Detection
The system uses the user's selected gender during measurement input. You don't need to mark products as gender-specific unless you want to filter which products show the size recommendation feature.

### Optional: Tag-Based Gender Filtering (Future Enhancement)
If you want to restrict size recommendations to specific genders:
- Add tags like `gender:men`, `gender:women`, or `gender:unisex` to products
- The system will automatically adjust the recommendation algorithm based on user gender

## How the Algorithm Works

### 1. Body Chest Width Estimation
- Users enter: height, weight, gender, and fit preference
- System estimates chest width (front measurement only):
  - Base calculation: ~26% of height for males, ~25% for females
  - BMI adjustment: adds/subtracts based on how BMI differs from baseline
  - Fit adjustment: ±1-2cm based on body build preference
- Result: Estimated body chest width in cm (e.g., 46cm for 175cm/91kg male)

### 2. Garment Style Detection
The system automatically detects garment style:
- **Fitted/Stretch Style**: Smallest size <55cm flat lay (stretch fabrics, fitted hoodies/tees)
- **Oversized/Streetwear Style**: Smallest size ≥55cm flat lay (loose/boxy fits)

### 3. Wearing Ease Application

**For Fitted/Stretch Garments** (garment smaller than body):
- **Slim fit**: Body - 5cm = target garment (tight fit)
- **Regular fit**: Body - 8cm = target garment (normal fit)
- **Athletic fit**: Body - 7cm = target garment (fitted comfortable)
- **Relaxed fit**: Body - 10cm = target garment (loose with stretch)
- Example: 46cm body → 38cm target garment (regular fit)

**For Oversized Garments** (garment larger than body):
- **Slim fit**: Body + 8cm = target garment (minimal oversized)
- **Regular fit**: Body + 12cm = target garment (standard oversized)
- **Athletic fit**: Body + 10cm = target garment (fitted oversized)
- **Relaxed fit**: Body + 15cm = target garment (very oversized)
- Example: 51cm body → 63cm target garment (regular fit)

### 4. Size Matching
- Compares target garment width to each size's chest measurement
- Finds the size with smallest difference
- Simple closest-match algorithm

### 5. Confidence Scoring
Based on how close the match is:
- **Difference ≤2cm**: 95% confidence - Excellent fit
- **Difference ≤4cm**: 80% confidence - Good fit
- **Difference ≤6cm**: 65% confidence - Acceptable fit
- **Difference >6cm**: 50% confidence - Best available option

### 6. Reasoning Generation
Provides specific guidance:
- "Excellent fit based on your measurements" (confidence ≥85%)
- "Good fit - recommended for your measurements" (confidence ≥70%)
- Additional notes if garment may be tight or loose
- Includes fit preference in reasoning

## Example Product Setups

The system supports both flat lay and circumference measurements - it auto-detects the format!

### Men's Hoodie - Flat Lay Format
```json
{
  "S": {
    "chest": 35,
    "length": 53,
    "arm": 61
  },
  "M": {
    "chest": 38,
    "length": 55,
    "arm": 63
  },
  "L": {
    "chest": 41,
    "length": 57,
    "arm": 65
  },
  "XL": {
    "chest": 43,
    "length": 59,
    "arm": 67
  }
}
```

### Men's Oversized Hoodie - Flat Lay Format (Streetwear Style)
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
*The system will detect these are oversized garments (smallest size ≥55cm) and apply positive wearing ease*

### Men's T-Shirt (flat lay measurements)
```json
{
  "S": {
    "chest": 46,
    "length": 69,
    "shoulder": 45
  },
  "M": {
    "chest": 48,
    "length": 71,
    "shoulder": 47
  },
  "L": {
    "chest": 51,
    "length": 73,
    "shoulder": 49
  },
  "XL": {
    "chest": 53,
    "length": 75,
    "shoulder": 51
  }
}
```

### Women's T-Shirt (flat lay measurements)
```json
{
  "XS": {
    "chest": 40,
    "length": 60,
    "shoulder": 38
  },
  "S": {
    "chest": 42,
    "length": 62,
    "shoulder": 40
  },
  "M": {
    "chest": 44,
    "length": 64,
    "shoulder": 42
  },
  "L": {
    "chest": 47,
    "length": 66,
    "shoulder": 44
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
- Wearing ease values might not match your garment's stretch/fit
- User's body measurements may differ from BMI-based estimates

**Solutions**:
- Ensure all measurements are in **centimeters**
- The system auto-detects flat lay vs circumference format, but verify the detection is correct in console logs
- Check console logs for "Measurement format detected: Flat lay width" or "Full circumference"
- Test with known good fits and adjust measurements if needed
- Consider that the wearing ease assumes stretchy fabrics (hoodies, t-shirts)

### Issue: Wrong size names
**Solution**: Size names in metafield must **exactly match** your product variant size options (including case and spaces)

## Best Practices

1. **Measure Accurately**: Use flat lay measurements taken from actual garments
2. **Be Consistent**: Use the same measurement method for all products in a category
3. **Include Chest Measurement**: Always include chest width for tops (primary matching dimension)
4. **Trust Auto-Detection**: The system detects fitted vs oversized styles automatically based on measurements
5. **Test with Real Users**: Get feedback on recommendations and fine-tune if needed
6. **Use Exact Size Names**: Ensure metafield size names exactly match your variant options

## Getting Measurements

### From Your Products (Recommended)
The best approach is to physically measure your garments. You can use either method:

**Flat Lay Method** (recommended):
1. Lay the garment flat on a table
2. Measure chest width from armpit to armpit across the front
3. Measure length from shoulder to hem
4. Measure sleeve from shoulder seam to cuff
5. Record in centimeters

**Circumference Method** (also works):
1. Measure the full chest circumference of the garment
2. The system will auto-detect and convert (÷2) to flat lay width
3. Record in centimeters

### From Existing Size Charts
You can use measurements in either format:
- **Flat lay measurements** (<80cm) - used directly
- **Circumference measurements** (≥80cm) - automatically converted by dividing by 2

The system will also detect if your garments are fitted (<55cm smallest size) or oversized (≥55cm smallest size) and adjust wearing ease accordingly.

**DO NOT manually convert or add wearing ease** - the algorithm handles this automatically.

### From Manufacturer Specs
Use whatever format the manufacturer provides - flat lay or circumference. The system auto-detects and normalizes the format.

## Support

If you encounter any issues or need assistance:
1. Check console logs for detailed error messages
2. Verify JSON format using a JSON validator
3. Test with a simple format first (single values only)
4. Gradually add more sizes and measurements

---

**Note**: The system will automatically fall back to generic recommendations if product-specific data is not available, so you can roll out metafields gradually across your catalog.
