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
    chest?: [number, number];
    waist?: [number, number];
    hips?: [number, number];
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
 * Calculate how well measurements fit within a size range
 * Returns a score from 0 (poor fit) to 1 (perfect fit)
 */
function calculateFitScore(
  measurement: number,
  range: [number, number] | undefined,
  fitPreference: 'slim' | 'regular' | 'athletic' | 'relaxed'
): number {
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
    const chestScore = calculateFitScore(userMeasurements.chest, dimensions.chest, fitPreference);
    const waistScore = calculateFitScore(userMeasurements.waist, dimensions.waist, fitPreference);
    const hipsScore = calculateFitScore(userMeasurements.hips, dimensions.hips, fitPreference);

    // Weighted average - waist is most important, then chest, then hips
    const weights = gender === 'male'
      ? { chest: 0.4, waist: 0.4, hips: 0.2 }
      : { chest: 0.35, waist: 0.35, hips: 0.3 };

    const totalScore =
      (chestScore * weights.chest) +
      (waistScore * weights.waist) +
      (hipsScore * weights.hips);

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

  // Add specific guidance
  if (sizeDim.chest && userMeasurements.chest > sizeDim.chest[1]) {
    reasoning += '. May be tight in chest.';
  } else if (sizeDim.waist && userMeasurements.waist > sizeDim.waist[1]) {
    reasoning += '. May be tight in waist.';
  } else if (sizeDim.hips && userMeasurements.hips > sizeDim.hips[1]) {
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
      return Response.json(
        { error: 'Missing required fields: height, weight, gender' },
        { status: 400 }
      );
    }

    // Estimate or use provided measurements
    const estimated = estimateBodyMeasurements(height, weight, gender, bodyFit);

    const measurements = {
      chest: providedChest || estimated.chest,
      waist: providedWaist || estimated.waist,
      hips: providedHips || estimated.hips,
    };

    // If product has size dimensions, use smart matching
    if (sizeDimensions && Object.keys(sizeDimensions).length > 0) {
      const result = findBestSize(measurements, sizeDimensions, bodyFit, gender);

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
    console.error('Size recommendation error:', error);
    return Response.json(
      { error: 'Failed to calculate size recommendation' },
      { status: 500 }
    );
  }
}
