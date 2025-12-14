import type { Route } from './+types/api.recommend-size';

type WearingPreference = 'very_fitted' | 'fitted' | 'normal' | 'loose' | 'very_loose';
type AbdomenShape = 'flat' | 'medium' | 'bulging';
type HipShape = 'straight' | 'average' | 'wide';
type FabricType = 'cotton' | 'cotton_blend' | 'jersey_knit' | 'highly_elastic';

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
    estimatedShoulderWidth?: number;
  };
  garmentMeasurements?: {
    chest?: string;
    waist?: string;
    hips?: string;
    shoulder?: string;
    length?: string;
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
  shoulderWidth: number;
  confidence: number;
}

/**
 * Format a measurement value for display.
 * Handles both single values and ranges.
 */
function formatMeasurement(value: number | [number, number] | undefined): string | undefined {
  if (value === undefined) return undefined;
  if (Array.isArray(value)) {
    return `${value[0]}-${value[1]}`;
  }
  return value.toString();
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

  // 4. SHOULDER WIDTH (front measurement, half of shoulder span)
  let shoulderWidth: number;
  if (gender === 'male') {
    shoulderWidth = heightCm * 0.24; // ~24% of height for males
  } else {
    shoulderWidth = heightCm * 0.22; // ~22% of height for females
  }

  // Age adjustment for shoulder (shoulders broaden slightly with age)
  if (age > 40) {
    shoulderWidth += 0.5;
  }

  // Clamp shoulder to reasonable range
  shoulderWidth = Math.max(35, Math.min(55, shoulderWidth));

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
    shoulderWidth: Math.round(shoulderWidth),
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
 * Determine garment category from product type, tags, and size dimensions.
 * Priority: productType → tags → length heuristic → default to tops
 */
function detectGarmentCategory(
  sizeDimensions: SizeDimensions,
  productType?: string,
  tags?: string[]
): 'tops' | 'bottoms' | 'dresses' | 'outerwear' {
  const productTypeLower = productType?.toLowerCase() || '';
  const tagsLower = tags?.map(t => t.toLowerCase()) || [];

  // 1. Check productType first (most reliable)
  if (productTypeLower.includes('dress') || productTypeLower.includes('gown')) {
    return 'dresses';
  }
  if (productTypeLower.includes('pant') || productTypeLower.includes('jean') ||
      productTypeLower.includes('short') || productTypeLower.includes('trouser') ||
      productTypeLower.includes('skirt') || productTypeLower.includes('legging')) {
    return 'bottoms';
  }
  if (productTypeLower.includes('jacket') || productTypeLower.includes('coat') ||
      productTypeLower.includes('blazer') || productTypeLower.includes('cardigan') ||
      productTypeLower.includes('hoodie') || productTypeLower.includes('sweater')) {
    return 'outerwear';
  }

  // 2. Check tags as secondary indicator
  if (tagsLower.some(t => t.includes('dress') || t.includes('gown') || t.includes('maxi') || t.includes('midi'))) {
    return 'dresses';
  }
  if (tagsLower.some(t => t.includes('pant') || t.includes('jean') ||
      t.includes('short') || t.includes('trouser') || t.includes('skirt') || t.includes('legging'))) {
    return 'bottoms';
  }
  if (tagsLower.some(t => t.includes('jacket') || t.includes('coat') ||
      t.includes('outerwear') || t.includes('blazer') || t.includes('hoodie'))) {
    return 'outerwear';
  }

  // 3. Fallback to length heuristic (original logic)
  const firstSize = Object.values(sizeDimensions)[0];
  if (firstSize?.length && firstSize.length > 70) {
    return 'dresses';
  }

  // 4. Default to tops
  return 'tops';
}

/**
 * Generate detailed, informative reasoning for the size recommendation.
 */
function generateDetailedReasoning(
  confidence: number,
  category: 'tops' | 'bottoms' | 'dresses' | 'outerwear',
  selectedSize: any,
  targetGarmentWidth: number,
  bodyMeasurements: EstimatedBodyMeasurements,
  wearingPreference: WearingPreference,
  isOversized: boolean
): string {
  let reasoning = '';

  // 1. Base confidence message
  if (confidence >= 0.85) {
    reasoning = 'This size is an excellent match for your measurements';
  } else if (confidence >= 0.70) {
    reasoning = 'This size should fit you well';
  } else if (confidence >= 0.55) {
    reasoning = 'This size may work, but fit could vary';
  } else {
    reasoning = 'This is the closest available size';
  }

  // 2. Add wearing preference context
  const prefLabels: Record<WearingPreference, string> = {
    very_fitted: 'very fitted',
    fitted: 'fitted',
    normal: 'comfortable',
    loose: 'relaxed',
    very_loose: 'very loose',
  };
  reasoning += ` for a ${prefLabels[wearingPreference]} fit`;

  // 3. Add specific fit details based on category and measurements
  if (selectedSize) {
    // BOTTOMS: Provide waist and hip specific guidance
    if (category === 'bottoms' && selectedSize.waist && selectedSize.hips) {
      const waistEase = selectedSize.waist - bodyMeasurements.waistWidth;
      const hipEase = selectedSize.hips - bodyMeasurements.hipWidth;

      if (waistEase < 2 || hipEase < 2) {
        reasoning += '. Snug fit - fabric should have some stretch';
      } else if (waistEase > 6 || hipEase > 6) {
        reasoning += '. Relaxed fit with extra room';
      } else {
        reasoning += '. Comfortable fit on both waist and hips';
      }
    }
    // TOPS/OUTERWEAR/DRESSES: Provide ease-based guidance
    else if (selectedSize.chest) {
      const ease = selectedSize.chest - targetGarmentWidth;

      if (isOversized) {
        reasoning += `. Oversized style with ${Math.round(Math.abs(ease))}cm of extra room for a relaxed, streetwear look`;
      } else {
        if (ease < -8) {
          reasoning += '. Very fitted - close to body, fabric should have stretch';
        } else if (ease < -4) {
          reasoning += '. Fitted style - hugs your body comfortably';
        } else if (ease < 2) {
          reasoning += '. Close to body with slight ease for movement';
        } else if (ease < 6) {
          reasoning += '. Classic fit with comfortable room';
        } else {
          reasoning += '. Relaxed fit with generous ease';
        }
      }
    }
  }

  // 4. Category-specific notes
  if (category === 'outerwear') {
    reasoning += '. Extra room for layering underneath';
  } else if (category === 'dresses') {
    reasoning += '. Fits your proportions well';
  }

  return reasoning + '.';
}

/**
 * Calculate comprehensive confidence score based on multiple factors.
 */
function calculateConfidence(
  measurementDiff: number,
  bodyMeasurementConfidence: number,
  fabricType: FabricType | undefined,
  hasOptionalMeasurements: boolean,
  isOversized: boolean,
  wearingPreference: WearingPreference
): number {
  let baseConfidence = 0.50; // Minimum confidence

  // 1. Measurement match quality (primary factor)
  if (measurementDiff <= 1) {
    baseConfidence += 0.45; // Nearly perfect match
  } else if (measurementDiff <= 2) {
    baseConfidence += 0.40; // Excellent match
  } else if (measurementDiff <= 3) {
    baseConfidence += 0.35; // Very good match
  } else if (measurementDiff <= 4) {
    baseConfidence += 0.30; // Good match
  } else if (measurementDiff <= 6) {
    baseConfidence += 0.20; // Acceptable match
  } else if (measurementDiff <= 8) {
    baseConfidence += 0.10; // Fair match
  }
  // else: stays at base 0.50

  // 2. Fabric type specified bonus (+5%)
  if (fabricType) {
    baseConfidence += 0.05;
  }

  // 3. Optional measurements provided bonus (+5%)
  if (hasOptionalMeasurements) {
    baseConfidence += 0.05;
  }

  // 4. Stretch bonus for fitted garments (+10%)
  // Stretchy fabrics are more forgiving for fitted styles
  if (!isOversized && fabricType && fabricType !== 'cotton') {
    if (wearingPreference === 'very_fitted' || wearingPreference === 'fitted') {
      baseConfidence += 0.10;
    }
  }

  // 5. Multiply by body measurement confidence
  // This accounts for estimation accuracy based on BMI/age extremes
  const finalConfidence = baseConfidence * bodyMeasurementConfidence;

  // 6. Clamp to range 50-100%
  return Math.max(0.50, Math.min(1.0, finalConfidence));
}

/**
 * Generate fit description for a given size compared to user's measurements.
 */
function generateFitDescription(
  sizeMeasurement: number,
  targetGarmentWidth: number,
  category: 'tops' | 'bottoms' | 'dresses' | 'outerwear',
  isOversized: boolean
): string {
  const diff = sizeMeasurement - targetGarmentWidth;

  if (isOversized) {
    // For oversized styles, describe relative to expected oversized fit
    if (diff < -6) return 'Fitted (less oversized)';
    if (diff < -2) return 'Slightly fitted';
    if (diff < 3) return 'Standard oversized';
    if (diff < 7) return 'Relaxed oversized';
    return 'Very oversized';
  } else {
    // For fitted styles, describe stretch and comfort
    if (diff < -10) return 'Very tight - needs stretch';
    if (diff < -6) return 'Snug - fitted look';
    if (diff < -2) return 'Fitted - hugs body';
    if (diff < 2) return 'Comfortable fit';
    if (diff < 6) return 'Relaxed fit';
    if (diff < 10) return 'Loose fit';
    return 'Very loose';
  }
}

/**
 * Generate size comparison for all available sizes.
 */
function generateSizeComparison(
  normalizedDimensions: SizeDimensions,
  targetGarmentWidth: number,
  category: 'tops' | 'bottoms' | 'dresses' | 'outerwear',
  isOversized: boolean,
  bodyMeasurements: EstimatedBodyMeasurements
): { [size: string]: string } {
  const comparison: { [size: string]: string } = {};

  for (const [size, dims] of Object.entries(normalizedDimensions)) {
    let garmentMeasurement: number;

    // Use same logic as findBestSize to determine garment measurement
    if (category === 'bottoms' && dims.waist !== undefined && dims.hips !== undefined) {
      // Check if both waist and hips fit
      const waistFits = dims.waist >= bodyMeasurements.waistWidth - 5;
      const hipsFits = dims.hips >= bodyMeasurements.hipWidth - 5;

      if (!waistFits || !hipsFits) {
        comparison[size] = 'Too tight (waist or hips)';
        continue;
      }

      garmentMeasurement = Math.min(dims.waist, dims.hips);
    } else if (dims.chest !== undefined) {
      garmentMeasurement = dims.chest;
    } else {
      comparison[size] = 'No data';
      continue;
    }

    comparison[size] = generateFitDescription(
      garmentMeasurement,
      targetGarmentWidth,
      category,
      isOversized
    );
  }

  return comparison;
}

/**
 * Find best size based on body measurements and wearing preference.
 */
function findBestSize(
  bodyMeasurements: EstimatedBodyMeasurements,
  sizeDimensions: SizeDimensions,
  wearingPreference: WearingPreference,
  category: 'tops' | 'bottoms' | 'dresses' | 'outerwear' = 'tops',
  fabricType?: FabricType,
  hasOptionalMeasurements: boolean = false
): { size: string; confidence: number; reasoning: string; alternativeSize?: string; sizeComparison: { [size: string]: string } } {

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
    const baseEase: Record<WearingPreference, number> =
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

    // Apply fabric stretch multiplier
    const fabricStretchMultiplier: Record<FabricType, number> = {
      cotton: 1.0,           // No adjustment (rigid fabric)
      cotton_blend: 0.95,    // Can size down 5% (slight stretch)
      jersey_knit: 0.90,     // Can size down 10% (moderate stretch)
      highly_elastic: 0.85,  // Can size down 15% (high stretch)
    };

    const stretchMultiplier = fabricType ? fabricStretchMultiplier[fabricType] : 1.0;
    const adjustedEase = baseEase[wearingPreference] * stretchMultiplier;

    if (fabricType) {
      console.log(`🧵 Fabric: ${fabricType}, stretch multiplier: ${stretchMultiplier}, adjusted ease: ${adjustedEase}cm`);
    }

    targetGarmentWidth = primaryBodyMeasurement - adjustedEase;
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
    let garmentMeasurement: number;

    // Enhanced bottoms handling: check both waist AND hips
    if (category === 'bottoms' && dims.waist !== undefined && dims.hips !== undefined) {
      console.log(`👖 ${size}: waist=${dims.waist}cm, hips=${dims.hips}cm`);

      // For bottoms, BOTH waist and hips must fit
      const waistFits = dims.waist >= bodyMeasurements.waistWidth - 5; // Allow 5cm negative ease
      const hipsFits = dims.hips >= bodyMeasurements.hipWidth - 5;

      if (!waistFits || !hipsFits) {
        console.log(`  ${size}: SKIP - ${!waistFits ? 'waist too tight' : 'hips too tight'}`);
        continue; // Skip sizes that won't fit in waist or hips
      }

      // Use the tighter measurement (smaller of waist/hips) for diff calculation
      garmentMeasurement = Math.min(dims.waist, dims.hips);
      console.log(`  ${size}: Using ${garmentMeasurement}cm (tighter of waist/hips)`);
    } else if (dims.chest !== undefined) {
      // For tops/outerwear/dresses or bottoms without full data
      garmentMeasurement = dims.chest;
    } else {
      continue; // Skip if no measurement available
    }

    const diff = Math.abs(garmentMeasurement - targetGarmentWidth);
    console.log(`  ${size}: ${garmentMeasurement}cm, diff: ${diff}cm`);

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

  // Calculate comprehensive confidence score
  const confidence = calculateConfidence(
    smallestDiff,
    bodyMeasurements.confidence,
    fabricType,
    hasOptionalMeasurements,
    isOversized,
    wearingPreference
  );

  // Generate detailed reasoning
  const selectedSize = normalizedDimensions[bestSize];
  const reasoning = generateDetailedReasoning(
    confidence,
    category,
    selectedSize,
    targetGarmentWidth,
    bodyMeasurements,
    wearingPreference,
    isOversized
  );

  // Determine alternative size
  let alternativeSize: string | undefined;
  if (secondBestSize && secondSmallestDiff <= smallestDiff + 1.5) {
    alternativeSize = secondBestSize;
  }

  // Generate size comparison for all available sizes
  const sizeComparison = generateSizeComparison(
    normalizedDimensions,
    targetGarmentWidth,
    category,
    isOversized,
    bodyMeasurements
  );

  return {
    size: bestSize,
    confidence: Math.round(confidence * 100) / 100,
    reasoning,
    alternativeSize,
    sizeComparison,
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
      productType?: string;
      tags?: string[];
      fabricType?: FabricType;
      shoulder?: number;
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
      productType,
      tags,
      fabricType,
      shoulder,
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

      const category = detectGarmentCategory(sizeDimensions, productType, tags);
      console.log('📦 Detected category:', category, '(from productType:', productType, 'tags:', tags, ')');

      // Check if optional measurements were provided
      const hasOptionalMeasurements = !!shoulder;

      const result = findBestSize(
        bodyMeasurements,
        sizeDimensions,
        wearingPreference,
        category,
        fabricType,
        hasOptionalMeasurements
      );

      console.log('✅ Recommendation:', result);

      // Extract garment measurements for the recommended size
      const recommendedSizeDims = sizeDimensions[result.size];
      const garmentMeasurements = recommendedSizeDims ? {
        chest: formatMeasurement(recommendedSizeDims.chest),
        waist: formatMeasurement(recommendedSizeDims.waist),
        hips: formatMeasurement(recommendedSizeDims.hips),
        shoulder: formatMeasurement(recommendedSizeDims.shoulder),
        length: formatMeasurement(recommendedSizeDims.length),
      } : undefined;

      return Response.json({
        size: result.size,
        confidence: result.confidence,
        reasoning: result.reasoning,
        measurements: {
          estimatedChestWidth: bodyMeasurements.chestWidth,
          estimatedWaistWidth: bodyMeasurements.waistWidth,
          estimatedHipWidth: bodyMeasurements.hipWidth,
          estimatedShoulderWidth: bodyMeasurements.shoulderWidth,
        },
        garmentMeasurements,
        alternativeSize: result.alternativeSize,
        sizeComparison: result.sizeComparison,
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
        estimatedShoulderWidth: bodyMeasurements.shoulderWidth,
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
