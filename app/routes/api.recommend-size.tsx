import type { Route } from './+types/api.recommend-size';

interface UserMeasurements {
  height: number;
  weight: number;
  gender: 'male' | 'female';
  bodyFit?: 'slim' | 'regular' | 'athletic' | 'relaxed';
  chest?: number;
  waist?: number;
  hips?: number;
}

interface SizeDimensions {
  [size: string]: {
    chest?: [number, number] | number;
    waist?: [number, number] | number;
    hips?: [number, number] | number;
    length?: [number, number] | number;
    arm?: [number, number] | number;
    shoulder?: [number, number] | number;
  };
}

interface SizeRecommendationResult {
  size: string;
  confidence: number;
  reasoning?: string;
  measurements?: {
    estimatedChest: number;
    estimatedWaist: number;
    estimatedHips: number;
  };
}

/**
 * Estimate body measurements from height and weight using anthropometric formulas
 * This is a heuristic fallback, NOT a medical or precise anthropometric model.
 * Based on proportional body measurements and BMI adjustments.
 */
function estimateBodyMeasurements(
  height: number, // cm
  weight: number, // kg
  gender: 'male' | 'female',
  bodyFit: 'slim' | 'regular' | 'athletic' | 'relaxed' = 'regular'
): { chest: number; waist: number; hips: number; confidence: 'low' | 'medium' } {
  const heightM = height / 100;
  const bmi = weight / (heightM * heightM);

  // Base BMI anchors for average body composition
  const baseBmi = gender === 'female' ? 22 : 23;
  const bmiDelta = bmi - baseBmi;

  // ---- 1) Base proportional measurements (average build) ----
  let chest = 0;
  let waist = 0;
  let hips = 0;

  if (gender === 'female') {
    // Female proportions based on height
    chest = 0.53 * height;
    waist = 0.39 * height;
    hips = 0.54 * height;
  } else {
    // Male proportions based on height
    chest = 0.52 * height;
    waist = 0.45 * height;
    hips = 0.51 * height;
  }

  // ---- 2) BMI-based adjustments ----
  // Clamp bmiDelta so extreme values don't produce impossible measurements
  const clampedDelta = Math.max(-8, Math.min(8, bmiDelta));

  chest += clampedDelta * 1.0;
  hips += clampedDelta * 1.0;
  waist += clampedDelta * 1.5; // Waist responds more to weight changes

  // ---- 3) Body fit / shape adjustments ----
  // Map fit preference to body shape adjustments
  const fitAdjustments = {
    slim: { chest: -3, waist: -4, hips: -3 },      // Slimmer build
    regular: { chest: 0, waist: 0, hips: 0 },      // Average build
    athletic: { chest: 3, waist: -2, hips: 0 },    // More chest, less waist
    relaxed: { chest: 2, waist: 3, hips: 2 },      // Fuller build
  };

  const adjustment = fitAdjustments[bodyFit];
  chest += adjustment.chest;
  waist += adjustment.waist;
  hips += adjustment.hips;

  // ---- 4) Sanity clamps to avoid impossible geometries ----
  const clamp = (value: number, min: number, max: number) =>
    Math.max(min, Math.min(max, value));

  chest = clamp(chest, 70, 140);
  waist = clamp(waist, 60, 140);
  hips = clamp(hips, 70, 150);

  // ---- 5) Confidence heuristic ----
  let confidence: 'low' | 'medium' = 'low';

  // Higher confidence if BMI is in reasonable range
  const bmiInReasonableRange = bmi > 17 && bmi < 32;
  const heightInReasonableRange = height > 140 && height < 210;

  if (bmiInReasonableRange && heightInReasonableRange) {
    confidence = 'medium';
  }

  return {
    chest: Math.round(chest),
    waist: Math.round(waist),
    hips: Math.round(hips),
    confidence,
  };
}

/**
 * Detect if measurements are flat lay (width) vs body circumference
 * Flat lay measurements are typically half of body measurements
 * Heuristic: chest < 50cm is likely flat lay
 */
function isFlatLayMeasurement(sizeDimensions: SizeDimensions): boolean {
  // Check chest measurements across all sizes
  const chestValues = Object.values(sizeDimensions)
    .map(dim => dim.chest)
    .filter((val): val is number | [number, number] => val !== undefined);

  if (chestValues.length === 0) return false;

  // Get average chest value
  const avgChest = chestValues.reduce((sum, val) => {
    const numVal = Array.isArray(val) ? (val[0] + val[1]) / 2 : val;
    return sum + numVal;
  }, 0) / chestValues.length;

  // If average chest is less than 50cm, it's likely flat lay (width)
  return avgChest < 50;
}

/**
 * Convert flat lay measurement to body circumference
 * Flat lay width should be doubled for body circumference
 */
function convertFlatLayToCircumference(dimension: [number, number] | number | undefined): [number, number] | number | undefined {
  if (!dimension) return undefined;

  if (Array.isArray(dimension)) {
    return [dimension[0] * 2, dimension[1] * 2] as [number, number];
  }

  return (dimension as number) * 2;
}

/**
 * Normalize size dimension to a range [min, max]
 * Handles both single values and ranges
 */
function normalizeToRange(dimension: [number, number] | number | undefined): [number, number] | undefined {
  if (!dimension) return undefined;

  // If it's already a range, return it
  if (Array.isArray(dimension)) {
    return dimension as [number, number];
  }

  // If it's a single value, create a range around it (±2cm tolerance)
  const value = dimension as number;
  return [value - 2, value + 2];
}

/**
 * Calculate how well measurements fit within a size range
 * Returns a score from 0 (poor fit) to 1 (perfect fit)
 */
function calculateFitScore(
  measurement: number,
  dimension: [number, number] | number | undefined,
  fitPreference: 'slim' | 'regular' | 'athletic' | 'relaxed'
): number {
  const range = normalizeToRange(dimension);
  if (!range) return 0.5; // Neutral if range not specified

  const [min, max] = range;
  const mid = (min + max) / 2;
  const rangeSize = max - min;

  // Adjust preferred position in range based on fit preference
  const preferenceOffsets = {
    slim: -0.2,      // Prefer lower end of range
    regular: 0,      // Prefer middle of range
    athletic: -0.1,  // Slightly prefer lower end
    relaxed: 0.2,    // Prefer upper end of range
  };

  const preferredPoint = mid + (rangeSize * preferenceOffsets[fitPreference]);

  // Calculate how far the measurement is from preferred point
  if (measurement >= min && measurement <= max) {
    // Within range - calculate how close to preferred point
    const distance = Math.abs(measurement - preferredPoint);
    const maxDistance = rangeSize / 2;
    return 1 - (distance / maxDistance) * 0.3; // Max penalty 30% for being away from preferred point
  } else if (measurement < min) {
    // Below range - exponential penalty
    const distance = min - measurement;
    return Math.max(0, 0.7 - (distance / rangeSize) * 0.5);
  } else {
    // Above range - exponential penalty
    const distance = measurement - max;
    return Math.max(0, 0.7 - (distance / rangeSize) * 0.5);
  }
}

/**
 * Find best matching size from product size dimensions
 */
function findBestSize(
  userMeasurements: { chest: number; waist: number; hips: number },
  sizeDimensions: SizeDimensions,
  fitPreference: 'slim' | 'regular' | 'athletic' | 'relaxed',
  gender: 'male' | 'female'
): { size: string; confidence: number; reasoning: string } {
  let bestSize = '';
  let bestScore = 0;
  const scores: { [size: string]: number } = {};

  // Check if measurements are flat lay and need to be doubled
  const isFlatLay = isFlatLayMeasurement(sizeDimensions);
  console.log('🔍 Detected flat lay measurements:', isFlatLay);

  // Convert flat lay to body circumference if needed
  const convertedSizeDimensions: SizeDimensions = {};
  if (isFlatLay) {
    for (const [size, dimensions] of Object.entries(sizeDimensions)) {
      convertedSizeDimensions[size] = {
        chest: convertFlatLayToCircumference(dimensions.chest),
        waist: convertFlatLayToCircumference(dimensions.waist),
        hips: convertFlatLayToCircumference(dimensions.hips),
        // Keep length, arm, shoulder as-is (these are not circumference)
        length: dimensions.length,
        arm: dimensions.arm,
        shoulder: dimensions.shoulder,
      };
    }
    console.log('✅ Converted flat lay to body circumference:', convertedSizeDimensions);
  } else {
    Object.assign(convertedSizeDimensions, sizeDimensions);
  }

  // Define size order for fallback
  const sizeOrder = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL'];

  // Calculate fit score for each size
  for (const [size, dimensions] of Object.entries(convertedSizeDimensions)) {
    // Get scores for available measurements
    const measurements: { [key: string]: number } = {};
    let totalWeight = 0;
    let weightedScore = 0;

    // Chest measurement (primary)
    if (dimensions.chest) {
      const score = calculateFitScore(userMeasurements.chest, dimensions.chest, fitPreference);
      const weight = 0.5; // Chest is most important for fit
      measurements.chest = score;
      weightedScore += score * weight;
      totalWeight += weight;
    }

    // Waist measurement
    if (dimensions.waist) {
      const score = calculateFitScore(userMeasurements.waist, dimensions.waist, fitPreference);
      const weight = 0.3;
      measurements.waist = score;
      weightedScore += score * weight;
      totalWeight += weight;
    }

    // Hips measurement
    if (dimensions.hips) {
      const score = calculateFitScore(userMeasurements.hips, dimensions.hips, fitPreference);
      const weight = 0.2;
      measurements.hips = score;
      weightedScore += score * weight;
      totalWeight += weight;
    }

    // Calculate final score (normalize by total weight)
    const totalScore = totalWeight > 0 ? weightedScore / totalWeight : 0.5;
    scores[size] = totalScore;

    if (totalScore > bestScore) {
      bestScore = totalScore;
      bestSize = size;
    }
  }

  // Fallback: if no size was selected (bestSize is empty), pick the largest size
  if (!bestSize || bestSize === '') {
    const sizeOrder = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL'];
    const availableSizes = Object.keys(convertedSizeDimensions);

    // Sort by size order and pick the largest
    availableSizes.sort((a, b) => {
      const aIndex = sizeOrder.indexOf(a);
      const bIndex = sizeOrder.indexOf(b);
      return bIndex - aIndex; // Descending order
    });

    bestSize = availableSizes[0] || 'L'; // Default to first available or 'L'
    bestScore = 0.2; // Low score for fallback
  }

  // Generate reasoning
  let reasoning = '';
  const sizeDim = convertedSizeDimensions[bestSize];

  if (!sizeDim) {
    // Safety check - this shouldn't happen but just in case
    return {
      size: bestSize,
      confidence: bestScore,
      reasoning: 'Size recommendation based on available options',
    };
  }

  if (bestScore >= 0.85) {
    reasoning = 'Excellent fit based on your measurements';
  } else if (bestScore >= 0.70) {
    reasoning = 'Good fit - recommended for your measurements';
  } else if (bestScore >= 0.55) {
    reasoning = 'Acceptable fit - may vary by style';
  } else if (bestScore >= 0.30) {
    reasoning = 'Best available option - check size chart carefully';
  } else {
    // Very poor fit - measurements are outside size range
    reasoning = 'Measurements exceed available sizes - largest size recommended';
  }

  // Add specific guidance based on available measurements
  const chestRange = normalizeToRange(sizeDim.chest);
  const waistRange = normalizeToRange(sizeDim.waist);
  const hipsRange = normalizeToRange(sizeDim.hips);

  const chestExcess = chestRange ? userMeasurements.chest - chestRange[1] : 0;
  const waistExcess = waistRange ? userMeasurements.waist - waistRange[1] : 0;
  const hipsExcess = hipsRange ? userMeasurements.hips - hipsRange[1] : 0;

  // Check if measurements significantly exceed size
  if (chestExcess > 10) {
    reasoning += `. Chest is ${Math.round(chestExcess)}cm larger than this size.`;
  } else if (waistExcess > 10) {
    reasoning += `. Waist is ${Math.round(waistExcess)}cm larger than this size.`;
  } else if (hipsExcess > 10) {
    reasoning += `. Hips are ${Math.round(hipsExcess)}cm larger than this size.`;
  } else if (chestRange && userMeasurements.chest > chestRange[1]) {
    reasoning += '. May be tight in chest.';
  } else if (waistRange && userMeasurements.waist > waistRange[1]) {
    reasoning += '. May be tight in waist.';
  } else if (hipsRange && userMeasurements.hips > hipsRange[1]) {
    reasoning += '. May be tight in hips.';
  }

  // If fit preference is different from regular, mention it
  if (fitPreference === 'slim') {
    reasoning += ' (Optimized for slim fit)';
  } else if (fitPreference === 'relaxed') {
    reasoning += ' (Optimized for relaxed fit)';
  } else if (fitPreference === 'athletic') {
    reasoning += ' (Optimized for athletic build)';
  }

  return {
    size: bestSize || 'M', // Fallback to M if no size found
    confidence: Math.round(bestScore * 100) / 100,
    reasoning,
  };
}

export async function action({request}: Route.ActionArgs) {
  try {
    const body = await request.json() as {
      height: number;
      weight: number;
      gender: 'male' | 'female';
      bodyFit?: 'slim' | 'regular' | 'athletic' | 'relaxed';
      chest?: number;
      waist?: number;
      hips?: number;
      sizeDimensions?: SizeDimensions;
    };

    console.log('📥 Received recommendation request:', body);

    const {
      height,
      weight,
      gender,
      bodyFit = 'regular',
      chest: providedChest,
      waist: providedWaist,
      hips: providedHips,
      sizeDimensions,
    } = body;

    // Validate inputs
    if (!height || !weight || !gender) {
      console.error('❌ Missing required fields');
      return Response.json(
        { error: 'Missing required fields: height, weight, gender' },
        { status: 400 }
      );
    }

    console.log('📏 Size dimensions received:', sizeDimensions);
    console.log('📏 Size dimensions type:', typeof sizeDimensions);
    console.log('📏 Size dimensions keys:', sizeDimensions ? Object.keys(sizeDimensions) : 'undefined');

    // Estimate or use provided measurements
    const estimated = estimateBodyMeasurements(height, weight, gender, bodyFit);

    console.log('📊 Estimated measurements:', estimated);
    console.log(`📈 Estimation confidence: ${estimated.confidence}`);

    const measurements = {
      chest: providedChest || estimated.chest,
      waist: providedWaist || estimated.waist,
      hips: providedHips || estimated.hips,
    };

    // If product has size dimensions, use smart matching
    if (sizeDimensions && Object.keys(sizeDimensions).length > 0) {
      console.log('🎯 Using smart matching with product dimensions');
      console.log('👤 User measurements:', measurements);

      try {
        const result = findBestSize(measurements, sizeDimensions, bodyFit, gender);

        console.log('✅ Recommendation result:', result);

        return Response.json({
          size: result.size,
          confidence: result.confidence,
          reasoning: result.reasoning,
          measurements: {
            estimatedChest: measurements.chest,
            estimatedWaist: measurements.waist,
            estimatedHips: measurements.hips,
          },
        } as SizeRecommendationResult);
      } catch (matchError) {
        console.error('❌ Error in findBestSize:', matchError);
        // Fall through to generic recommendation
      }
    }

    // Fallback to generic sizing if no product dimensions provided
    // This is the old basic algorithm as fallback
    let size = 'M';
    let confidence = 0.6; // Lower confidence without product data

    if (gender === 'male') {
      if (measurements.chest < 91) {
        size = 'S';
      } else if (measurements.chest >= 91 && measurements.chest < 101) {
        size = 'M';
      } else if (measurements.chest >= 101) {
        size = 'L';
      }
    } else {
      if (measurements.chest < 86) {
        size = 'XS';
      } else if (measurements.chest >= 86 && measurements.chest < 91) {
        size = 'S';
      } else if (measurements.chest >= 91 && measurements.chest < 96) {
        size = 'M';
      } else if (measurements.chest >= 96) {
        size = 'L';
      }
    }

    return Response.json({
      size,
      confidence,
      reasoning: 'Generic recommendation - product size data not available',
      measurements: {
        estimatedChest: measurements.chest,
        estimatedWaist: measurements.waist,
        estimatedHips: measurements.hips,
      },
    } as SizeRecommendationResult);

  } catch (error) {
    console.error('❌ Size recommendation error:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    return Response.json(
      {
        error: 'Failed to calculate size recommendation',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
