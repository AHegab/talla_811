import type { Route } from './+types/api.recommend-size';

type WearingPreference = 'very_fitted' | 'fitted' | 'normal' | 'loose' | 'very_loose';
type AbdomenShape = 'flat' | 'medium' | 'bulging';
type HipShape = 'straight' | 'average' | 'wide';

interface SizeDimensions {
  [size: string]: {
    chest?: number;  // Flat lay width in cm
    length?: number; // Length in cm
    arm?: number;    // Sleeve length in cm
  };
}

interface SizeRecommendationResult {
  size: string;
  confidence: number;
  reasoning: string;
  measurements: {
    estimatedChestWidth: number;
    estimatedWaistWidth?: number;
    estimatedHipWidth?: number;
  };
  alternativeSize?: string;
  sizeComparison?: {
    [size: string]: string;
  };
}

interface EstimatedBodyMeasurements {
  chestWidth: number;
  waistWidth: number;
  hipWidth: number;
  confidence: number;
}

/**
 * Estimate body measurements (chest, waist, hips) from user inputs.
 * These are FRONT measurements (half of circumference), matching flat lay product measurements.
 */
function estimateBodyMeasurements(
  heightCm: number,
  weightKg: number,
  gender: 'male' | 'female',
  age: number,
  abdomenShape: AbdomenShape,
  hipShape: HipShape
): EstimatedBodyMeasurements {
  // Calculate BMI
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);

  // 1. CHEST WIDTH (front measurement, half of circumference)
  let chestWidth: number;

  if (gender === 'male') {
    // Males: base width from height, adjusted by BMI
    chestWidth = heightCm * 0.26; // ~26% of height
    const bmiDelta = bmi - 23; // baseline BMI 23 for males
    chestWidth += bmiDelta * 0.5;
  } else {
    // Females: slightly different proportions
    chestWidth = heightCm * 0.25; // ~25% of height
    const bmiDelta = bmi - 22; // baseline BMI 22 for females
    chestWidth += bmiDelta * 0.4;
  }

  // Age adjustment (body composition changes with age)
  if (age < 25) {
    chestWidth -= 0.5; // Younger people tend to be slightly slimmer
  } else if (age > 50) {
    chestWidth += 1.0; // Older people tend to have broader torsos
  }

  // Clamp chest to reasonable range
  chestWidth = Math.max(35, Math.min(60, chestWidth));

  // 2. WAIST WIDTH
  let waistWidth: number;
  if (gender === 'male') {
    waistWidth = chestWidth - 2; // Men typically have narrower waists
  } else {
    waistWidth = chestWidth - 4; // Women typically have more defined waists
  }

  // Adjust for abdomen shape
  const abdomenAdjustments: Record<AbdomenShape, number> = {
    flat: -2,
    medium: 0,
    bulging: 3,
  };
  waistWidth += abdomenAdjustments[abdomenShape];

  // 3. HIP WIDTH
  let hipWidth: number;
  if (gender === 'male') {
    hipWidth = waistWidth + 1; // Men have slightly wider hips than waist
  } else {
    hipWidth = waistWidth + 5; // Women typically have wider hips
  }

  // Adjust for hip shape
  const hipAdjustments: Record<HipShape, number> = {
    straight: -2,
    average: 0,
    wide: 3,
  };
  hipWidth += hipAdjustments[hipShape];

  // Calculate confidence based on how standard the measurements are
  let confidence = 0.8; // Base confidence

  // Check for extreme BMI
  if (bmi < 18.5 || bmi > 30) {
    confidence -= 0.1;
  }

  // Check for extreme age
  if (age < 18 || age > 70) {
    confidence -= 0.05;
  }

  return {
    chestWidth: Math.round(chestWidth),
    waistWidth: Math.round(waistWidth),
    hipWidth: Math.round(hipWidth),
    confidence: Math.max(0.5, Math.min(1.0, confidence)),
  };
}

/**
 * Detect if measurements are flat lay (width) or full circumference.
 */
function areFlayLayMeasurements(sizeDimensions: SizeDimensions): boolean {
  const chestValues = Object.values(sizeDimensions)
    .map(dims => dims.chest)
    .filter((chest): chest is number => chest !== undefined);

  if (chestValues.length === 0) return true;

  const smallestSize = Math.min(...chestValues);
  return smallestSize < 80;
}

/**
 * Detect if garment is oversized style.
 */
function isOversizedGarment(sizeDimensions: SizeDimensions): boolean {
  const chestValues = Object.values(sizeDimensions)
    .map(dims => dims.chest)
    .filter((chest): chest is number => chest !== undefined);

  if (chestValues.length === 0) return false;

  const smallestSize = Math.min(...chestValues);
  return smallestSize >= 55;
}

/**
 * Determine garment category from size dimensions.
 */
function detectGarmentCategory(sizeDimensions: SizeDimensions): 'tops' | 'bottoms' | 'dresses' | 'outerwear' {
  // Simple heuristic - can be improved with actual product category
  const firstSize = Object.values(sizeDimensions)[0];

  if (!firstSize) return 'tops';

  // If has length > 70cm, likely a dress or long garment
  if (firstSize.length && firstSize.length > 70) {
    return 'dresses';
  }

  // Default to tops
  return 'tops';
}

/**
 * Find best size based on body measurements and wearing preference.
 */
function findBestSize(
  bodyMeasurements: EstimatedBodyMeasurements,
  sizeDimensions: SizeDimensions,
  wearingPreference: WearingPreference,
  category: 'tops' | 'bottoms' | 'dresses' | 'outerwear' = 'tops'
): { size: string; confidence: number; reasoning: string; alternativeSize?: string } {

  // Detect measurement format
  const isFlatLay = areFlayLayMeasurements(sizeDimensions);
  console.log('📐 Measurement format:', isFlatLay ? 'Flat lay width' : 'Full circumference');

  // Normalize to flat lay if needed
  const normalizedDimensions: SizeDimensions = {};
  for (const [size, dims] of Object.entries(sizeDimensions)) {
    normalizedDimensions[size] = {
      ...dims,
      chest: dims.chest ? (isFlatLay ? dims.chest : dims.chest / 2) : undefined,
    };
  }

  // Detect garment style
  const isOversized = isOversizedGarment(normalizedDimensions);
  console.log('👕 Garment style:', isOversized ? 'Oversized/Streetwear' : 'Fitted/Stretch');

  // Select primary body measurement based on category
  let primaryBodyMeasurement: number;
  if (category === 'tops' || category === 'outerwear') {
    primaryBodyMeasurement = bodyMeasurements.chestWidth;
  } else if (category === 'bottoms') {
    primaryBodyMeasurement = Math.max(bodyMeasurements.waistWidth, bodyMeasurements.hipWidth);
  } else if (category === 'dresses') {
    primaryBodyMeasurement = Math.max(bodyMeasurements.chestWidth, bodyMeasurements.hipWidth);
  } else {
    primaryBodyMeasurement = bodyMeasurements.chestWidth;
  }

  // Calculate target garment width based on wearing preference
  let targetGarmentWidth: number;

  if (isOversized) {
    // Oversized garments - positive ease (garment larger than body)
    const oversizedEase: Record<WearingPreference, number> = {
      very_fitted: 8,   // Minimal oversized look
      fitted: 10,       // Fitted oversized
      normal: 12,       // Standard oversized
      loose: 14,        // Loose oversized
      very_loose: 16,   // Very oversized
    };
    targetGarmentWidth = primaryBodyMeasurement + oversizedEase[wearingPreference];
  } else {
    // Fitted garments - negative ease for tops (stretchy), less negative for bottoms
    const fittedEase: Record<WearingPreference, number> =
      category === 'bottoms'
        ? {
            very_fitted: 4,   // Very tight fit
            fitted: 6,        // Snug fit
            normal: 8,        // Normal fit
            loose: 10,        // Relaxed fit
            very_loose: 13,   // Very loose fit
          }
        : {
            very_fitted: 6,   // Very tight fit
            fitted: 8,        // Fitted
            normal: 10,       // Normal fit
            loose: 12,        // Loose fit
            very_loose: 15,   // Very loose fit
          };

    targetGarmentWidth = primaryBodyMeasurement - fittedEase[wearingPreference];
  }

  // Add extra ease for outerwear (layering)
  if (category === 'outerwear') {
    targetGarmentWidth += 3;
  }

  console.log('📏 Body measurement:', primaryBodyMeasurement, 'cm');
  console.log('🎯 Target garment width:', targetGarmentWidth, 'cm');

  // Find closest size
  let bestSize = '';
  let smallestDiff = Infinity;
  let secondBestSize = '';
  let secondSmallestDiff = Infinity;

  for (const [size, dims] of Object.entries(normalizedDimensions)) {
    if (!dims.chest) continue;

    const diff = Math.abs(dims.chest - targetGarmentWidth);
    console.log(`  ${size}: ${dims.chest}cm, diff: ${diff}cm`);

    if (diff < smallestDiff) {
      // New best size found
      secondBestSize = bestSize;
      secondSmallestDiff = smallestDiff;
      bestSize = size;
      smallestDiff = diff;
    } else if (diff < secondSmallestDiff) {
      // New second best
      secondBestSize = size;
      secondSmallestDiff = diff;
    }
  }

  // Fallback
  if (!bestSize) {
    const sizes = Object.keys(normalizedDimensions);
    bestSize = sizes[Math.floor(sizes.length / 2)] || 'M';
  }

  // Calculate confidence
  let confidence: number;
  if (smallestDiff <= 2) {
    confidence = 0.95;
  } else if (smallestDiff <= 4) {
    confidence = 0.80;
  } else if (smallestDiff <= 6) {
    confidence = 0.65;
  } else {
    confidence = 0.50;
  }

  // Boost confidence for stretchy fabrics
  if (!isOversized && smallestDiff <= 8) {
    confidence += 0.05;
  }

  // Factor in body measurement confidence
  confidence = confidence * bodyMeasurements.confidence;

  // Generate reasoning
  let reasoning: string;
  if (confidence >= 0.85) {
    reasoning = 'Excellent fit based on your measurements';
  } else if (confidence >= 0.70) {
    reasoning = 'Good fit - recommended for your measurements';
  } else if (confidence >= 0.55) {
    reasoning = 'Acceptable fit - may vary by style';
  } else {
    reasoning = 'Best available option - check size chart carefully';
  }

  // Add fit guidance
  const selectedSize = normalizedDimensions[bestSize];
  if (selectedSize?.chest && targetGarmentWidth > selectedSize.chest + 5) {
    reasoning += '. May be slightly tight.';
  } else if (selectedSize?.chest && targetGarmentWidth < selectedSize.chest - 5) {
    reasoning += '. May be slightly loose.';
  }

  // Add preference note
  const prefLabels: Record<WearingPreference, string> = {
    very_fitted: 'very fitted',
    fitted: 'fitted',
    normal: 'normal',
    loose: 'loose',
    very_loose: 'very loose',
  };
  if (wearingPreference !== 'normal') {
    reasoning += ` (${prefLabels[wearingPreference]} fit)`;
  }

  // Determine alternative size
  let alternativeSize: string | undefined;
  if (secondBestSize && secondSmallestDiff <= smallestDiff + 1.5) {
    alternativeSize = secondBestSize;
  }

  return {
    size: bestSize,
    confidence: Math.round(confidence * 100) / 100,
    reasoning,
    alternativeSize,
  };
}

export async function action({ request }: Route.ActionArgs) {
  try {
    const body = await request.json() as {
      height: number;
      weight: number;
      gender: 'male' | 'female';
      age: number;
      abdomenShape: AbdomenShape;
      hipShape: HipShape;
      wearingPreference: WearingPreference;
      sizeDimensions?: SizeDimensions;
    };

    const {
      height,
      weight,
      gender,
      age,
      abdomenShape,
      hipShape,
      wearingPreference,
      sizeDimensions,
    } = body;

    console.log('📥 Received request:', {
      height,
      weight,
      gender,
      age,
      abdomenShape,
      hipShape,
      wearingPreference
    });

    // Validate inputs
    if (!height || !weight || !gender || !age || !abdomenShape || !hipShape || !wearingPreference) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Estimate body measurements
    const bodyMeasurements = estimateBodyMeasurements(
      height,
      weight,
      gender,
      age,
      abdomenShape,
      hipShape
    );

    console.log('📊 Estimated body measurements:', bodyMeasurements);

    // If product has size dimensions, use smart matching
    if (sizeDimensions && Object.keys(sizeDimensions).length > 0) {
      console.log('🎯 Using smart matching with product dimensions');

      const category = detectGarmentCategory(sizeDimensions);
      const result = findBestSize(
        bodyMeasurements,
        sizeDimensions,
        wearingPreference,
        category
      );

      console.log('✅ Recommendation:', result);

      return Response.json({
        size: result.size,
        confidence: result.confidence,
        reasoning: result.reasoning,
        measurements: {
          estimatedChestWidth: bodyMeasurements.chestWidth,
          estimatedWaistWidth: bodyMeasurements.waistWidth,
          estimatedHipWidth: bodyMeasurements.hipWidth,
        },
        alternativeSize: result.alternativeSize,
      } as SizeRecommendationResult);
    }

    // Fallback generic recommendation based on chest width
    let size = 'M';
    const chestWidth = bodyMeasurements.chestWidth;

    if (chestWidth < 42) size = 'S';
    else if (chestWidth < 47) size = 'M';
    else if (chestWidth < 52) size = 'L';
    else size = 'XL';

    return Response.json({
      size,
      confidence: 0.6,
      reasoning: 'Generic recommendation - product size data not available',
      measurements: {
        estimatedChestWidth: bodyMeasurements.chestWidth,
        estimatedWaistWidth: bodyMeasurements.waistWidth,
        estimatedHipWidth: bodyMeasurements.hipWidth,
      },
    } as SizeRecommendationResult);

  } catch (error) {
    console.error('❌ Size recommendation error:', error);
    return Response.json(
      {
        error: 'Failed to calculate size recommendation',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
