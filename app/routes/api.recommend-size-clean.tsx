import type { Route } from './+types/api.recommend-size';

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
    estimatedChestWidth: number; // Half-chest measurement
  };
}

/**
 * Estimate chest width (front measurement, not full circumference) from height and weight.
 * This matches the measurement style in the product image.
 */
function estimateChestWidth(
  heightCm: number,
  weightKg: number,
  gender: 'male' | 'female',
  bodyFit: 'slim' | 'regular' | 'athletic' | 'relaxed'
): number {
  // Calculate BMI
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);

  // Base chest width estimation (front measurement only, half of circumference)
  // This is empirically tuned based on real measurements
  let chestWidth: number;

  if (gender === 'male') {
    // For males: base width from height, adjusted by BMI
    chestWidth = heightCm * 0.26; // ~26% of height for average male

    // BMI adjustment (baseline BMI 23 for males)
    const bmiDelta = bmi - 23;
    chestWidth += bmiDelta * 0.5; // Reduced from 0.8 for more conservative estimates
  } else {
    // For females: slightly different proportions
    chestWidth = heightCm * 0.25; // ~25% of height for average female

    // BMI adjustment (baseline BMI 22 for females)
    const bmiDelta = bmi - 22;
    chestWidth += bmiDelta * 0.4; // Reduced from 0.7 for more conservative estimates
  }

  // Adjust for body fit preference
  const fitAdjustments = {
    slim: -2,      // Slimmer build
    regular: 0,    // Average
    athletic: 1,   // More muscular chest
    relaxed: 2,    // Fuller build
  };

  chestWidth += fitAdjustments[bodyFit];

  // Clamp to reasonable range
  return Math.max(35, Math.min(60, Math.round(chestWidth)));
}

/**
 * Detect if measurements are flat lay (width) or full circumference.
 * Flat lay: typically 30-75cm (regular to oversized garments)
 * Circumference: typically 80-140cm (body measurements)
 */
function areFlayLayMeasurements(sizeDimensions: SizeDimensions): boolean {
  const chestValues = Object.values(sizeDimensions)
    .map(dims => dims.chest)
    .filter((chest): chest is number => chest !== undefined);

  if (chestValues.length === 0) return true; // Assume flat lay by default

  const smallestSize = Math.min(...chestValues);

  // Only treat as circumference if smallest size >= 80cm
  // This allows for oversized flat lay garments (60-75cm)
  // Only very clearly body circumference measurements (80cm+) get converted
  return smallestSize < 80;
}

/**
 * Detect if garment is oversized style based on measurements.
 * Oversized: smallest size >= 55cm flat lay (110cm+ circumference)
 */
function isOversizedGarment(sizeDimensions: SizeDimensions): boolean {
  const chestValues = Object.values(sizeDimensions)
    .map(dims => dims.chest)
    .filter((chest): chest is number => chest !== undefined);

  if (chestValues.length === 0) return false;

  const smallestSize = Math.min(...chestValues);
  return smallestSize >= 55; // 55cm+ flat lay indicates oversized/streetwear style
}

/**
 * Find best size by comparing estimated body width to garment widths.
 * For stretchy garments, the garment should be 5-10cm smaller than body.
 * For oversized garments, the garment should be 8-15cm larger than body.
 */
function findBestSize(
  estimatedChestWidth: number,
  sizeDimensions: SizeDimensions,
  fitPreference: 'slim' | 'regular' | 'athletic' | 'relaxed'
): { size: string; confidence: number; reasoning: string } {

  // Detect measurement format and convert if needed
  const isFlatLay = areFlayLayMeasurements(sizeDimensions);
  console.log('📐 Measurement format detected:', isFlatLay ? 'Flat lay width' : 'Full circumference');

  // If measurements are circumference, convert to flat lay width
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

  // Wearing ease: difference between garment and body
  // For FITTED/STRETCH garments: garment smaller than body (negative ease)
  // For OVERSIZED garments: garment larger than body (positive ease)
  let targetGarmentWidth: number;

  if (isOversized) {
    // Oversized style - garment should be LARGER than body
    const oversizedEase = {
      slim: 8,      // Garment 8cm larger (minimal oversized look)
      regular: 12,  // Garment 12cm larger (standard oversized)
      athletic: 10, // Garment 10cm larger (fitted oversized)
      relaxed: 15,  // Garment 15cm larger (very oversized/loose)
    };
    targetGarmentWidth = estimatedChestWidth + oversizedEase[fitPreference];
  } else {
    // Fitted/stretch style - garment should be SMALLER than body
    const fittedEase = {
      slim: 5,      // Garment 5cm smaller than body (tight fit)
      regular: 8,   // Garment 8cm smaller than body (normal fit)
      athletic: 7,  // Garment 7cm smaller (fitted but comfortable)
      relaxed: 10,  // Garment 10cm smaller (loose fit with stretch)
    };
    targetGarmentWidth = estimatedChestWidth - fittedEase[fitPreference];
  }

  console.log('📏 Estimated body chest width:', estimatedChestWidth, 'cm');
  console.log('🎯 Target garment width:', targetGarmentWidth, 'cm');

  // Find closest size
  let bestSize = '';
  let smallestDiff = Infinity;

  for (const [size, dims] of Object.entries(normalizedDimensions)) {
    if (!dims.chest) continue;

    const diff = Math.abs(dims.chest - targetGarmentWidth);
    console.log(`  ${size}: ${dims.chest}cm (${isFlatLay ? 'flat lay' : 'converted from circumference'}), diff: ${diff}cm`);

    if (diff < smallestDiff) {
      smallestDiff = diff;
      bestSize = size;
    }
  }

  // If no size found, pick middle size
  if (!bestSize) {
    const sizes = Object.keys(normalizedDimensions);
    bestSize = sizes[Math.floor(sizes.length / 2)] || 'M';
  }

  // Calculate confidence
  let confidence: number;
  if (smallestDiff <= 2) {
    confidence = 0.95; // Excellent match
  } else if (smallestDiff <= 4) {
    confidence = 0.80; // Good match
  } else if (smallestDiff <= 6) {
    confidence = 0.65; // Acceptable match
  } else {
    confidence = 0.50; // Poor match
  }

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

  // Add specific guidance
  const selectedSize = normalizedDimensions[bestSize];
  if (selectedSize?.chest && targetGarmentWidth > selectedSize.chest + 5) {
    reasoning += '. May be slightly tight.';
  } else if (selectedSize?.chest && targetGarmentWidth < selectedSize.chest - 5) {
    reasoning += '. May be slightly loose.';
  }

  // Add fit preference note
  if (fitPreference !== 'regular') {
    reasoning += ` (${fitPreference} fit)`;
  }

  return {
    size: bestSize,
    confidence: Math.round(confidence * 100) / 100,
    reasoning,
  };
}

export async function action({ request }: Route.ActionArgs) {
  try {
    const body = await request.json() as {
      height: number;
      weight: number;
      gender: 'male' | 'female';
      bodyFit?: 'slim' | 'regular' | 'athletic' | 'relaxed';
      sizeDimensions?: SizeDimensions;
    };

    const {
      height,
      weight,
      gender,
      bodyFit = 'regular',
      sizeDimensions,
    } = body;

    console.log('📥 Received request:', { height, weight, gender, bodyFit });

    // Validate inputs
    if (!height || !weight || !gender) {
      return Response.json(
        { error: 'Missing required fields: height, weight, gender' },
        { status: 400 }
      );
    }

    // Estimate body chest width (front measurement)
    const estimatedChestWidth = estimateChestWidth(height, weight, gender, bodyFit);

    // If product has size dimensions, use smart matching
    if (sizeDimensions && Object.keys(sizeDimensions).length > 0) {
      console.log('🎯 Using smart matching with product dimensions');

      const result = findBestSize(estimatedChestWidth, sizeDimensions, bodyFit);

      console.log('✅ Recommendation:', result);

      return Response.json({
        size: result.size,
        confidence: result.confidence,
        reasoning: result.reasoning,
        measurements: {
          estimatedChestWidth,
        },
      } as SizeRecommendationResult);
    }

    // Fallback generic recommendation
    let size = 'M';
    if (estimatedChestWidth < 42) size = 'S';
    else if (estimatedChestWidth < 47) size = 'M';
    else if (estimatedChestWidth < 52) size = 'L';
    else size = 'XL';

    return Response.json({
      size,
      confidence: 0.6,
      reasoning: 'Generic recommendation - product size data not available',
      measurements: {
        estimatedChestWidth,
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
