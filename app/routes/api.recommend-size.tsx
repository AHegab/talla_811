import type { Route } from './+types/api.recommend-size';

type Gender = 'male' | 'female';
type BodyFit = 'slim' | 'regular' | 'athletic' | 'relaxed';

interface UserMeasurements {
  height: number;
  weight: number;
  gender: Gender;
  bodyFit?: BodyFit;
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
  confidence: number; // 0–1
  reasoning?: string;
  measurements?: {
    estimatedChest: number;
    estimatedWaist: number;
    estimatedHips: number;
  };
}

/**
 * Estimate body measurements from height and weight using regression
 * coefficients derived from the dataset.
 *
 * The original dataset columns are width-ish (half-girth) in cm.
 * We:
 *   1) Predict those widths from height & gender.
 *   2) Scale them to approximate circumferences.
 *   3) Adjust using BMI and fit preference.
 *
 * This is HEURISTIC and should be treated as a noisy prior.
 */
function estimateBodyMeasurements(
  height: number, // cm
  weight: number, // kg
  gender: Gender,
  bodyFit: BodyFit = 'regular'
): { chest: number; waist: number; hips: number; confidence: 'low' | 'medium' } {
  const heightCm = height;
  const heightM = heightCm / 100;
  const bmi = weight / (heightM * heightM);

  // Regression terms from your notebook (already in cm, width-ish)
  const genderBin = gender === 'male' ? 1 : 0;

  let chest = 11.807 + 0.203 * heightCm + 0.925 * genderBin;
  let waist = 14.174 + 0.295 * heightCm - 1.307 * genderBin;
  let hips = 13.493 + 0.310 * heightCm - 3.689 * genderBin;

  // Scale factors: approximate circumference from width
  // (width * 2 for full width, then slightly up/down tuned)
  const SCALE_CHEST = 2.2;
  const SCALE_WAIST = 2.0;
  const SCALE_HIPS = 2.2;

  chest *= SCALE_CHEST;
  waist *= SCALE_WAIST;
  hips *= SCALE_HIPS;

  // BMI adjustment: allow a bit of variation for fuller / leaner body types
  const baseBmi = gender === 'female' ? 22 : 23;
  const bmiDelta = Math.max(-8, Math.min(8, bmi - baseBmi));

  chest += bmiDelta * 1.0;
  hips += bmiDelta * 1.0;
  waist += bmiDelta * 1.5;

  // Fit preference adjustment
  const fitAdjustments: Record<
    BodyFit,
    { chest: number; waist: number; hips: number }
  > = {
    slim: { chest: -3, waist: -4, hips: -3 },
    regular: { chest: 0, waist: 0, hips: 0 },
    athletic: { chest: 3, waist: -2, hips: 0 },
    relaxed: { chest: 2, waist: 3, hips: 2 },
  };

  const adj = fitAdjustments[bodyFit];
  chest += adj.chest;
  waist += adj.waist;
  hips += adj.hips;

  // Sanity clamps (human-ish ranges for adult customers)
  const clamp = (v: number, min: number, max: number) =>
    Math.max(min, Math.min(max, v));

  chest = clamp(chest, 70, 140);
  waist = clamp(waist, 60, 140);
  hips = clamp(hips, 80, 160);

  // Confidence only reflects how "typical" height/BMI are
  let confidence: 'low' | 'medium' = 'low';
  if (bmi > 17 && bmi < 32 && heightCm > 145 && heightCm < 200) {
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
 * Detect if product size measurements are flat-lay width values.
 * Heuristic: if average chest < 50 cm, we assume they are widths.
 */
function isFlatLayMeasurement(sizeDimensions: SizeDimensions): boolean {
  const chestValues = Object.values(sizeDimensions)
    .map((dim) => dim.chest)
    .filter((val): val is number | [number, number] => val !== undefined);

  if (chestValues.length === 0) return false;

  const avgChest =
    chestValues.reduce((sum: number, val) => {
      const numVal = Array.isArray(val) ? (val[0] + val[1]) / 2 : val;
      return sum + numVal;
    }, 0) / chestValues.length;

  return avgChest < 50;
}

/**
 * Flat lay → circumference conversion (width * 2).
 */
function convertFlatLayToCircumference(
  dimension: [number, number] | number | undefined
): [number, number] | number | undefined {
  if (dimension == null) return undefined;

  if (Array.isArray(dimension)) {
    return [dimension[0] * 2, dimension[1] * 2] as [number, number];
  }
  return (dimension as number) * 2;
}

/**
 * Normalize a size dimension into a [min, max] range.
 */
function normalizeToRange(
  dimension: [number, number] | number | undefined
): [number, number] | undefined {
  if (dimension == null) return undefined;

  if (Array.isArray(dimension)) {
    return dimension as [number, number];
  }

  const value = dimension as number;
  return [value - 2, value + 2]; // ±2 cm tolerance window
}

/**
 * Score how well a single measurement fits a size dimension.
 * 0 = poor, 1 = excellent.
 */
function calculateFitScore(
  measurement: number,
  dimension: [number, number] | number | undefined,
  fitPreference: BodyFit
): number {
  const range = normalizeToRange(dimension);
  if (!range) return 0.5;

  const [min, max] = range;
  const mid = (min + max) / 2;
  const rangeSize = max - min || 1;

  const preferenceOffsets: Record<BodyFit, number> = {
    slim: -0.2,
    regular: 0,
    athletic: -0.1,
    relaxed: 0.2,
  };

  const preferredPoint = mid + rangeSize * preferenceOffsets[fitPreference];

  if (measurement >= min && measurement <= max) {
    // Inside range: penalty only for distance from preferred point
    const distance = Math.abs(measurement - preferredPoint);
    const maxDistance = rangeSize / 2;
    return 1 - (distance / maxDistance) * 0.3;
  }

  // Outside the range: penalise more heavily
  if (measurement < min) {
    const distance = min - measurement;
    return Math.max(0, 0.7 - (distance / rangeSize) * 0.5);
  } else {
    const distance = measurement - max;
    return Math.max(0, 0.7 - (distance / rangeSize) * 0.5);
  }
}

/**
 * Choose the best size based on user measurements and product dimensions.
 */
function findBestSize(
  userMeasurements: { chest: number; waist: number; hips: number },
  sizeDimensions: SizeDimensions,
  fitPreference: BodyFit,
  gender: Gender
): { size: string; confidence: number; reasoning: string } {
  let bestSize = '';
  let bestScore = 0;

  const isFlatLay = isFlatLayMeasurement(sizeDimensions);
  const convertedSizeDimensions: SizeDimensions = {};

  if (isFlatLay) {
    for (const [size, dimensions] of Object.entries(sizeDimensions)) {
      convertedSizeDimensions[size] = {
        chest: convertFlatLayToCircumference(dimensions.chest),
        waist: convertFlatLayToCircumference(dimensions.waist),
        hips: convertFlatLayToCircumference(dimensions.hips),
        length: dimensions.length,
        arm: dimensions.arm,
        shoulder: dimensions.shoulder,
      };
    }
  } else {
    Object.assign(convertedSizeDimensions, sizeDimensions);
  }

  const sizeOrder = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL'];

  for (const [size, dimensions] of Object.entries(convertedSizeDimensions)) {
    let totalWeight = 0;
    let weightedScore = 0;

    // Chest: primary weight
    if (dimensions.chest != null) {
      const score = calculateFitScore(
        userMeasurements.chest,
        dimensions.chest,
        fitPreference
      );
      const weight = 0.5;
      weightedScore += score * weight;
      totalWeight += weight;
    }

    // Waist
    if (dimensions.waist != null) {
      const score = calculateFitScore(
        userMeasurements.waist,
        dimensions.waist,
        fitPreference
      );
      const weight = 0.3;
      weightedScore += score * weight;
      totalWeight += weight;
    }

    // Hips
    if (dimensions.hips != null) {
      const score = calculateFitScore(
        userMeasurements.hips,
        dimensions.hips,
        fitPreference
      );
      const weight = 0.2;
      weightedScore += score * weight;
      totalWeight += weight;
    }

    const totalScore = totalWeight > 0 ? weightedScore / totalWeight : 0.5;

    if (totalScore > bestScore) {
      bestScore = totalScore;
      bestSize = size;
    }
  }

  // Fallback: no size scored better than 0 (or no sizes)
  if (!bestSize) {
    const availableSizes = Object.keys(convertedSizeDimensions);
    if (availableSizes.length === 0) {
      return {
        size: 'M',
        confidence: 0.3,
        reasoning: 'No size chart data available; defaulting to M.',
      };
    }

    availableSizes.sort((a, b) => {
      const aIndex = sizeOrder.indexOf(a);
      const bIndex = sizeOrder.indexOf(b);
      return bIndex - aIndex; // largest first
    });

    bestSize = availableSizes[0];
    bestScore = 0.2;
  }

  const sizeDim = convertedSizeDimensions[bestSize];
  if (!sizeDim) {
    return {
      size: bestSize,
      confidence: bestScore,
      reasoning: 'Size recommendation based on available options.',
    };
  }

  let reasoning: string;

  if (bestScore >= 0.85) {
    reasoning = 'Excellent fit based on your measurements.';
  } else if (bestScore >= 0.7) {
    reasoning = 'Good fit; recommended for your measurements.';
  } else if (bestScore >= 0.55) {
    reasoning = 'Acceptable fit; may vary by style.';
  } else if (bestScore >= 0.3) {
    reasoning =
      'Best available option from this size chart; please review measurements.';
  } else {
    reasoning =
      'Measurements are outside this brand’s typical range; largest size is recommended.';
  }

  const chestRange = normalizeToRange(sizeDim.chest);
  const waistRange = normalizeToRange(sizeDim.waist);
  const hipsRange = normalizeToRange(sizeDim.hips);

  const chestExcess = chestRange
    ? userMeasurements.chest - chestRange[1]
    : 0;
  const waistExcess = waistRange
    ? userMeasurements.waist - waistRange[1]
    : 0;
  const hipsExcess = hipsRange ? userMeasurements.hips - hipsRange[1] : 0;

  if (chestExcess > 10) {
    reasoning += ` Chest is approximately ${Math.round(
      chestExcess
    )} cm larger than this size.`;
  } else if (waistExcess > 10) {
    reasoning += ` Waist is approximately ${Math.round(
      waistExcess
    )} cm larger than this size.`;
  } else if (hipsExcess > 10) {
    reasoning += ` Hips are approximately ${Math.round(
      hipsExcess
    )} cm larger than this size.`;
  } else if (chestRange && userMeasurements.chest > chestRange[1]) {
    reasoning += ' It may feel tight in the chest.';
  } else if (waistRange && userMeasurements.waist > waistRange[1]) {
    reasoning += ' It may feel tight around the waist.';
  } else if (hipsRange && userMeasurements.hips > hipsRange[1]) {
    reasoning += ' It may feel tight around the hips.';
  }

  if (fitPreference === 'slim') {
    reasoning += ' Optimised for a slimmer fit.';
  } else if (fitPreference === 'relaxed') {
    reasoning += ' Optimised for a more relaxed fit.';
  } else if (fitPreference === 'athletic') {
    reasoning += ' Optimised for an athletic build.';
  }

  return {
    size: bestSize || 'M',
    confidence: Math.round(bestScore * 100) / 100,
    reasoning,
  };
}

/**
 * Combine:
 *  - how good the size match is (fitScore)
 *  - how trustworthy the measurements are (estimated vs user-provided)
 * into a single confidence number between 0 and 1.
 */
function combineConfidence(
  fitScore: number,
  measurementSource: 'user' | 'estimate-medium' | 'estimate-low'
): number {
  const sourceFactor =
    measurementSource === 'user'
      ? 1.0
      : measurementSource === 'estimate-medium'
      ? 0.85
      : 0.7;

  const combined = fitScore * sourceFactor;
  return Math.max(0.2, Math.min(0.99, Math.round(combined * 100) / 100));
}

export async function action({ request }: Route.ActionArgs) {
  try {
    const body = (await request.json()) as {
      height: number;
      weight: number;
      gender: Gender;
      bodyFit?: BodyFit;
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

    if (!height || !weight || !gender) {
      return Response.json(
        { error: 'Missing required fields: height, weight, gender.' },
        { status: 400 }
      );
    }

    const estimated = estimateBodyMeasurements(height, weight, gender, bodyFit);

    // Use user-provided values when available, otherwise fall back to estimate
    const measurements = {
      chest: providedChest ?? estimated.chest,
      waist: providedWaist ?? estimated.waist,
      hips: providedHips ?? estimated.hips,
    };

    const measurementSource: 'user' | 'estimate-medium' | 'estimate-low' =
      providedChest || providedWaist || providedHips
        ? 'user'
        : estimated.confidence === 'medium'
        ? 'estimate-medium'
        : 'estimate-low';

    // Main path: we have a size chart for this product
    if (sizeDimensions && Object.keys(sizeDimensions).length > 0) {
      try {
        const result = findBestSize(
          measurements,
          sizeDimensions,
          bodyFit,
          gender
        );

        const confidence = combineConfidence(
          result.confidence,
          measurementSource
        );

        return Response.json({
          size: result.size,
          confidence,
          reasoning: result.reasoning,
          measurements: {
            estimatedChest: measurements.chest,
            estimatedWaist: measurements.waist,
            estimatedHips: measurements.hips,
          },
        } as SizeRecommendationResult);
      } catch (matchError) {
        // If smart matching fails for any reason, fall back to generic ranges
        console.error('Error in findBestSize:', matchError);
      }
    }

    // Fallback path: generic size boundaries by chest only
    let size: string = 'M';
    let baseFitScore = 0.6;

    if (gender === 'male') {
      if (measurements.chest < 91) {
        size = 'S';
      } else if (measurements.chest < 101) {
        size = 'M';
      } else {
        size = 'L';
      }
    } else {
      if (measurements.chest < 86) {
        size = 'XS';
      } else if (measurements.chest < 91) {
        size = 'S';
      } else if (measurements.chest < 96) {
        size = 'M';
      } else {
        size = 'L';
      }
    }

    const confidence = combineConfidence(baseFitScore, measurementSource);

    return Response.json({
      size,
      confidence,
      reasoning:
        'Generic recommendation based on chest measurement only; product-specific size chart was not available.',
      measurements: {
        estimatedChest: measurements.chest,
        estimatedWaist: measurements.waist,
        estimatedHips: measurements.hips,
      },
    } as SizeRecommendationResult);
  } catch (error) {
    console.error('Size recommendation error:', error);
    return Response.json(
      {
        error: 'Failed to calculate size recommendation.',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
