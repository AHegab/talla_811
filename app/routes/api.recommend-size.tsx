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
 * Based on research data and body composition analysis
 */
function estimateBodyMeasurements(
  height: number, // cm
  weight: number, // kg
  gender: 'male' | 'female',
  bodyFit: 'slim' | 'regular' | 'athletic' | 'relaxed' = 'regular'
): { chest: number; waist: number; hips: number } {
  // Calculate BMI for body composition
  const bmi = weight / Math.pow(height / 100, 2);

  // Body fat percentage estimation (Jackson-Pollock formula approximation)
  const bodyFat = gender === 'male'
    ? 1.2 * bmi + 0.23 * 25 - 16.2 // Assuming age 25 for general calculation
    : 1.2 * bmi + 0.23 * 25 - 5.4;

  let chest: number, waist: number, hips: number;

  if (gender === 'male') {
    // Male measurement estimation formulas
    // Based on anthropometric data correlations
    chest = (height * 0.52) + (weight * 0.3) - 10;
    waist = (height * 0.38) + (weight * 0.45) - 20;
    hips = (height * 0.48) + (weight * 0.35) - 15;

    // Adjust for body composition
    if (bmi < 18.5) { // Underweight
      chest -= 3;
      waist -= 5;
      hips -= 3;
    } else if (bmi > 25) { // Overweight
      waist += (bmi - 25) * 1.5;
      hips += (bmi - 25) * 1.2;
    }
  } else {
    // Female measurement estimation formulas
    // Accounting for different body composition
    chest = (height * 0.48) + (weight * 0.35) - 5;
    waist = (height * 0.34) + (weight * 0.42) - 18;
    hips = (height * 0.54) + (weight * 0.38) - 8;

    // Adjust for body composition
    if (bmi < 18.5) { // Underweight
      chest -= 4;
      waist -= 6;
      hips -= 4;
    } else if (bmi > 25) { // Overweight
      chest += (bmi - 25) * 0.8;
      waist += (bmi - 25) * 1.8;
      hips += (bmi - 25) * 1.5;
    }
  }

  // Apply body fit adjustments
  const fitAdjustments = {
    slim: { chest: -2, waist: -3, hips: -2 },
    regular: { chest: 0, waist: 0, hips: 0 },
    athletic: { chest: 2, waist: -1, hips: 1 },
    relaxed: { chest: 3, waist: 1, hips: 3 },
  };

  const adjustment = fitAdjustments[bodyFit];
  chest += adjustment.chest;
  waist += adjustment.waist;
  hips += adjustment.hips;

  return {
    chest: Math.round(chest * 10) / 10,
    waist: Math.round(waist * 10) / 10,
    hips: Math.round(hips * 10) / 10,
  };
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

  // Define size order for fallback
  const sizeOrder = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL'];

  // Calculate fit score for each size
  for (const [size, dimensions] of Object.entries(sizeDimensions)) {
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

  // Generate reasoning
  let reasoning = '';
  const sizeDim = sizeDimensions[bestSize];

  if (bestScore >= 0.85) {
    reasoning = 'Excellent fit based on your measurements';
  } else if (bestScore >= 0.70) {
    reasoning = 'Good fit - recommended for your measurements';
  } else if (bestScore >= 0.55) {
    reasoning = 'Acceptable fit - may vary by style';
  } else {
    reasoning = 'Best available option - check size chart carefully';
  }

  // Add specific guidance based on available measurements
  const chestRange = normalizeToRange(sizeDim.chest);
  const waistRange = normalizeToRange(sizeDim.waist);
  const hipsRange = normalizeToRange(sizeDim.hips);

  if (chestRange && userMeasurements.chest > chestRange[1]) {
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

    // Estimate or use provided measurements
    const estimated = estimateBodyMeasurements(height, weight, gender, bodyFit);

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
