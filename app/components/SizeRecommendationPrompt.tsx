import { useState, type FormEvent } from 'react';

type WearingPreference = 'very_fitted' | 'fitted' | 'normal' | 'loose' | 'very_loose';
type AbdomenShape = 'flat' | 'medium' | 'bulging';
type HipShape = 'straight' | 'average' | 'wide';
type FabricType = 'cotton' | 'cotton_blend' | 'jersey_knit' | 'highly_elastic';

interface UserMeasurementInput {
  height: number;
  weight: number;
  unit: 'metric';
  gender: 'male' | 'female';
  age: number;
  abdomenShape: AbdomenShape;
  hipShape: HipShape;
  wearingPreference: WearingPreference;
  fabricType?: FabricType;
  chest?: number;
  waist?: number;
  hips?: number;
  shoulder?: number;
}

interface SizeRecommendation {
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

interface SizeRecommendationPromptProps {
  onComplete?: () => void;
  mode?: 'modal' | 'inline';
  onRecommendation?: (size: string) => void;
  productSizeDimensions?: any;
  productType?: string;
  tags?: string[];
  vendor?: string;
  productFabricType?: FabricType;
}

// Abdomen shape descriptions with SVG illustrations
const abdomenShapeDescriptions = {
  flat: {
    title: 'Flat',
    description: 'Toned, minimal waist definition',
    svg: (
      <svg viewBox="0 0 100 140" className="h-full w-full">
        <defs>
          <linearGradient id="skinTone1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E8D4C0" />
            <stop offset="100%" stopColor="#D4B5A0" />
          </linearGradient>
        </defs>
        {/* Head */}
        <ellipse cx="50" cy="25" rx="15" ry="18" fill="url(#skinTone1)" />
        {/* Torso - straight, minimal waist */}
        <path
          d="M 35 43 L 33 75 L 35 105 L 65 105 L 67 75 L 65 43 Z"
          fill="url(#skinTone1)"
        />
        {/* Arms */}
        <rect x="20" y="50" width="8" height="40" rx="4" fill="url(#skinTone1)" />
        <rect x="72" y="50" width="8" height="40" rx="4" fill="url(#skinTone1)" />
      </svg>
    ),
  },
  medium: {
    title: 'Medium',
    description: 'Average shape, natural waist',
    svg: (
      <svg viewBox="0 0 100 140" className="h-full w-full">
        <defs>
          <linearGradient id="skinTone2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E8D4C0" />
            <stop offset="100%" stopColor="#D4B5A0" />
          </linearGradient>
        </defs>
        {/* Head */}
        <ellipse cx="50" cy="25" rx="15" ry="18" fill="url(#skinTone2)" />
        {/* Torso - slight curve */}
        <path
          d="M 35 43 L 31 70 L 33 105 L 67 105 L 69 70 L 65 43 Z"
          fill="url(#skinTone2)"
        />
        {/* Arms */}
        <rect x="20" y="50" width="8" height="40" rx="4" fill="url(#skinTone2)" />
        <rect x="72" y="50" width="8" height="40" rx="4" fill="url(#skinTone2)" />
      </svg>
    ),
  },
  bulging: {
    title: 'Bulging',
    description: 'Fuller midsection, rounder waist',
    svg: (
      <svg viewBox="0 0 100 140" className="h-full w-full">
        <defs>
          <linearGradient id="skinTone3" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E8D4C0" />
            <stop offset="100%" stopColor="#D4B5A0" />
          </linearGradient>
        </defs>
        {/* Head */}
        <ellipse cx="50" cy="25" rx="15" ry="18" fill="url(#skinTone3)" />
        {/* Torso - pronounced curve */}
        <path
          d="M 35 43 L 28 70 L 30 105 L 70 105 L 72 70 L 65 43 Z"
          fill="url(#skinTone3)"
        />
        {/* Arms */}
        <rect x="18" y="50" width="8" height="40" rx="4" fill="url(#skinTone3)" />
        <rect x="74" y="50" width="8" height="40" rx="4" fill="url(#skinTone3)" />
      </svg>
    ),
  },
};

// Hip shape descriptions with SVG illustrations
const hipShapeDescriptions = {
  straight: {
    title: 'Straight',
    description: 'Narrow hips, athletic build',
    svg: (
      <svg viewBox="0 0 100 160" className="h-full w-full">
        <defs>
          <linearGradient id="skinTone4" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E8D4C0" />
            <stop offset="100%" stopColor="#D4B5A0" />
          </linearGradient>
        </defs>
        {/* Head */}
        <ellipse cx="50" cy="20" rx="14" ry="16" fill="url(#skinTone4)" />
        {/* Body - straight hips */}
        <rect x="38" y="36" width="24" height="50" rx="3" fill="url(#skinTone4)" />
        {/* Legs */}
        <rect x="40" y="86" width="9" height="50" rx="3" fill="url(#skinTone4)" />
        <rect x="51" y="86" width="9" height="50" rx="3" fill="url(#skinTone4)" />
      </svg>
    ),
  },
  average: {
    title: 'Average',
    description: 'Balanced proportions',
    svg: (
      <svg viewBox="0 0 100 160" className="h-full w-full">
        <defs>
          <linearGradient id="skinTone5" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E8D4C0" />
            <stop offset="100%" stopColor="#D4B5A0" />
          </linearGradient>
        </defs>
        {/* Head */}
        <ellipse cx="50" cy="20" rx="14" ry="16" fill="url(#skinTone5)" />
        {/* Body - average hips */}
        <path
          d="M 40 36 L 38 60 L 36 86 L 45 86 L 45 36 Z"
          fill="url(#skinTone5)"
        />
        <path
          d="M 60 36 L 62 60 L 64 86 L 55 86 L 55 36 Z"
          fill="url(#skinTone5)"
        />
        {/* Legs */}
        <rect x="38" y="86" width="10" height="50" rx="3" fill="url(#skinTone5)" />
        <rect x="52" y="86" width="10" height="50" rx="3" fill="url(#skinTone5)" />
      </svg>
    ),
  },
  wide: {
    title: 'Wide',
    description: 'Wider hips, curvy figure',
    svg: (
      <svg viewBox="0 0 100 160" className="h-full w-full">
        <defs>
          <linearGradient id="skinTone6" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E8D4C0" />
            <stop offset="100%" stopColor="#D4B5A0" />
          </linearGradient>
        </defs>
        {/* Head */}
        <ellipse cx="50" cy="20" rx="14" ry="16" fill="url(#skinTone6)" />
        {/* Body - wide hips */}
        <path
          d="M 42 36 L 38 55 L 32 86 L 44 86 L 44 36 Z"
          fill="url(#skinTone6)"
        />
        <path
          d="M 58 36 L 62 55 L 68 86 L 56 86 L 56 36 Z"
          fill="url(#skinTone6)"
        />
        {/* Legs */}
        <rect x="36" y="86" width="11" height="50" rx="3" fill="url(#skinTone6)" />
        <rect x="53" y="86" width="11" height="50" rx="3" fill="url(#skinTone6)" />
      </svg>
    ),
  },
};

// Wearing preference descriptions
const wearingPreferenceDescriptions = {
  very_fitted: {
    title: 'Very Fitted',
    description: 'Very close to body, minimal ease',
  },
  fitted: {
    title: 'Fitted',
    description: 'Close to body, tailored silhouette',
  },
  normal: {
    title: 'Normal',
    description: 'Comfortable, classic fit with room to move',
  },
  loose: {
    title: 'Loose',
    description: 'Relaxed, comfortable with extra room',
  },
  very_loose: {
    title: 'Very Loose',
    description: 'Very relaxed, oversized look',
  },
};

export function SizeRecommendationPrompt({
  onComplete,
  mode = 'modal',
  onRecommendation,
  productSizeDimensions,
  productType,
  tags,
  vendor,
  productFabricType,
}: SizeRecommendationPromptProps) {
  const [showForm, setShowForm] = useState(mode === 'inline'); // Auto-open in inline mode
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SizeRecommendation | null>(null);

  // Debug: Log result changes
  console.log('🔍 Current result state:', result);

  const [measurements, setMeasurements] = useState<UserMeasurementInput>({
    height: 0,
    weight: 0,
    unit: 'metric',
    gender: 'male',
    age: 25,
    abdomenShape: 'medium',
    hipShape: 'average',
    wearingPreference: 'normal',
    fabricType: productFabricType,
    chest: undefined,
    waist: undefined,
    hips: undefined,
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Validate required fields
      if (!measurements.height || !measurements.weight || !measurements.age) {
        throw new Error('Please fill in all required fields');
      }

      // Save to localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(
          'talla_user_measurements',
          JSON.stringify(measurements)
        );
      }

      const requestData = {
        ...measurements,
        sizeDimensions: productSizeDimensions,
        productType,
        tags,
        vendor,
      };
      console.log('📤 Sending recommendation request:', requestData);

      // Call API
      const response = await fetch('/api/recommend-size', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error('Failed to get size recommendation');
      }

      const data = await response.json() as SizeRecommendation;
      console.log('✅ Size recommendation received:', data);
      setResult(data);

      // Don't call onRecommendation here - wait for user to click "Select Size" button
      // This prevents the panel from closing before showing results
    } catch (err) {
      console.error('❌ Size recommendation error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setShowForm(false);
    setResult(null);
    setError(null);
    onComplete?.();
  };

  const handleRetry = () => {
    setResult(null);
    setError(null);
  };

  const handleSelectSize = () => {
    if (result && onRecommendation) {
      onRecommendation(result.size);
    }
    handleClose();
  };

  // Trigger button (for inline mode)
  if (!showForm) {
    console.log('👉 Showing trigger button (showForm is false)');
    return (
      <button
        onClick={() => setShowForm(true)}
        className="inline-flex items-center gap-2 text-sm text-indigo-600 underline underline-offset-2 hover:text-indigo-700 transition-colors"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        Get size recommendation
      </button>
    );
  }

  console.log('📋 Rendering form, mode:', mode, 'result:', result ? 'HAS RESULT' : 'NO RESULT');

  // Modal/Inline wrapper
  const containerClass =
    mode === 'modal'
      ? 'fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-sm'
      : 'relative w-full my-6';

  const cardClass =
    mode === 'modal'
      ? 'relative my-8 w-full max-w-3xl rounded-2xl !bg-white shadow-2xl'
      : 'w-full rounded-xl !bg-white border-2 border-gray-200 shadow-lg';

  // Result display
  if (result) {
    console.log('✨ Rendering result display for size:', result.size);
    return (
      <div className={containerClass}>
        <div className={cardClass}>
          {/* Close button */}
          <button
            onClick={handleClose}
            className={`absolute top-4 right-4 z-10 flex items-center justify-center rounded-full text-white transition-all ${
              mode === 'modal'
                ? 'h-12 w-12 !bg-gray-900 hover:!bg-indigo-600 transform hover:scale-110 active:scale-95 shadow-lg'
                : 'h-8 w-8 !bg-gray-600 hover:!bg-gray-800'
            }`}
            aria-label="Close"
          >
            <svg
              className={mode === 'modal' ? 'h-6 w-6' : 'h-4 w-4'}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Result Content */}
          <div className="p-8 space-y-8" style={{ backgroundColor: '#FFFFFF' }}>
            {/* Hero Section */}
            <div className="relative rounded-2xl p-12 text-center overflow-hidden" style={{ background: 'linear-gradient(to bottom right, #10b981, #059669)' }}>
              {/* Decorative circles */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>

              <div className="relative z-10">
                <h3 className="text-white text-lg font-semibold mb-2 uppercase tracking-wider">
                  Your Perfect Size
                </h3>
                <div className="text-white text-8xl font-bold mb-4">
                  {result.size}
                </div>
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-5 py-2 text-white">
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm font-semibold">
                    {Math.round(result.confidence * 100)}% Confidence
                  </span>
                </div>
              </div>
            </div>

            {/* Reasoning */}
            <div className="text-center">
              <p className="text-gray-700 text-lg">{result.reasoning}</p>
            </div>

            {/* Measurements Display */}
            <div className="rounded-xl p-6" style={{ background: 'linear-gradient(to bottom right, #eef2ff, #e0e7ff)' }}>
              <h4 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: '#312e81' }}>
                Estimated Measurements
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="rounded-lg p-4 text-center" style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
                  <div className="text-2xl font-bold" style={{ color: '#4f46e5' }}>
                    {result.measurements.estimatedChestWidth}
                  </div>
                  <div className="text-xs mt-1" style={{ color: '#4b5563' }}>Chest Width (cm)</div>
                </div>
                {result.measurements.estimatedWaistWidth && (
                  <div className="rounded-lg p-4 text-center" style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
                    <div className="text-2xl font-bold" style={{ color: '#4f46e5' }}>
                      {result.measurements.estimatedWaistWidth}
                    </div>
                    <div className="text-xs mt-1" style={{ color: '#4b5563' }}>Waist Width (cm)</div>
                  </div>
                )}
                {result.measurements.estimatedHipWidth && (
                  <div className="rounded-lg p-4 text-center" style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
                    <div className="text-2xl font-bold" style={{ color: '#4f46e5' }}>
                      {result.measurements.estimatedHipWidth}
                    </div>
                    <div className="text-xs mt-1" style={{ color: '#4b5563' }}>Hip Width (cm)</div>
                  </div>
                )}
                {result.measurements.estimatedShoulderWidth && (
                  <div className="rounded-lg p-4 text-center" style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
                    <div className="text-2xl font-bold" style={{ color: '#4f46e5' }}>
                      {result.measurements.estimatedShoulderWidth}
                    </div>
                    <div className="text-xs mt-1" style={{ color: '#4b5563' }}>Shoulder Width (cm)</div>
                  </div>
                )}
              </div>
            </div>

            {/* Garment Measurements - "This Size Fits" */}
            {result.garmentMeasurements && Object.values(result.garmentMeasurements).some(v => v !== undefined) && (
              <div className="rounded-xl p-6" style={{ background: 'linear-gradient(to bottom right, #fef3c7, #fde68a)' }}>
                <h4 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: '#78350f' }}>
                  This Size Fits
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {result.garmentMeasurements.chest && (
                    <div className="text-sm">
                      <span className="font-semibold text-gray-700">Chest:</span>{' '}
                      <span className="font-bold text-amber-900">{result.garmentMeasurements.chest} cm</span>
                    </div>
                  )}
                  {result.garmentMeasurements.waist && (
                    <div className="text-sm">
                      <span className="font-semibold text-gray-700">Waist:</span>{' '}
                      <span className="font-bold text-amber-900">{result.garmentMeasurements.waist} cm</span>
                    </div>
                  )}
                  {result.garmentMeasurements.hips && (
                    <div className="text-sm">
                      <span className="font-semibold text-gray-700">Hips:</span>{' '}
                      <span className="font-bold text-amber-900">{result.garmentMeasurements.hips} cm</span>
                    </div>
                  )}
                  {result.garmentMeasurements.shoulder && (
                    <div className="text-sm">
                      <span className="font-semibold text-gray-700">Shoulder:</span>{' '}
                      <span className="font-bold text-amber-900">{result.garmentMeasurements.shoulder} cm</span>
                    </div>
                  )}
                  {result.garmentMeasurements.length && (
                    <div className="text-sm">
                      <span className="font-semibold text-gray-700">Length:</span>{' '}
                      <span className="font-bold text-amber-900">{result.garmentMeasurements.length} cm</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Size Comparison Table */}
            {result.sizeComparison && Object.keys(result.sizeComparison).length > 0 && (
              <div className="rounded-xl p-6" style={{ background: 'linear-gradient(to bottom right, #f0f9ff, #e0f2fe)' }}>
                <h4 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: '#0c4a6e' }}>
                  How Each Size Fits You
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2" style={{ borderColor: '#bae6fd' }}>
                        <th className="text-left py-2 px-3 font-bold" style={{ color: '#0c4a6e' }}>Size</th>
                        <th className="text-left py-2 px-3 font-bold" style={{ color: '#0c4a6e' }}>Fit Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(result.sizeComparison).map(([size, description]) => {
                        const isRecommended = size === result.size;
                        const isAlternative = size === result.alternativeSize;

                        return (
                          <tr
                            key={size}
                            className="border-b transition-colors hover:bg-white/50"
                            style={{
                              borderColor: '#e0f2fe',
                              backgroundColor: isRecommended ? '#dcfce7' : isAlternative ? '#fef3c7' : 'transparent'
                            }}
                          >
                            <td className="py-3 px-3 font-bold" style={{ color: isRecommended ? '#166534' : '#0c4a6e' }}>
                              {size}
                              {isRecommended && <span className="ml-2 text-xs font-normal px-2 py-0.5 rounded-full" style={{ backgroundColor: '#22c55e', color: 'white' }}>Recommended</span>}
                            </td>
                            <td className="py-3 px-3" style={{ color: isRecommended ? '#166534' : '#475569' }}>
                              {description}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Alternative Size */}
            {result.alternativeSize && (
              <div className="border-2 rounded-lg p-4" style={{ backgroundColor: '#fffbeb', borderColor: '#fcd34d' }}>
                <p className="text-sm" style={{ color: '#78350f' }}>
                  <span className="font-semibold">Alternative: </span>
                  Size {result.alternativeSize} might also work depending on your preference
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleSelectSize}
                className="flex-1 font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 active:scale-95 shadow-lg"
                style={{ backgroundColor: '#1f2937', color: '#ffffff' }}
              >
                Select Size {result.size}
              </button>
              <button
                onClick={handleRetry}
                className="border-2 font-semibold py-4 px-6 rounded-xl transition-all"
                style={{ backgroundColor: '#ffffff', borderColor: '#d1d5db', color: '#374151' }}
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Form display
  return (
    <div className={containerClass}>
      <div className={cardClass}>
        {/* Close button */}
        <button
          onClick={handleClose}
          className={`absolute top-4 right-4 z-10 flex items-center justify-center rounded-full text-white transition-all ${
            mode === 'modal'
              ? 'h-12 w-12 !bg-gray-900 hover:!bg-indigo-600 transform hover:scale-110 active:scale-95 shadow-lg'
              : 'h-8 w-8 !bg-gray-600 hover:!bg-gray-800'
          }`}
          aria-label="Close"
        >
          <svg
            className={mode === 'modal' ? 'h-6 w-6' : 'h-4 w-4'}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Header */}
        <div className="border-b border-gray-200 px-8 py-6">
          <h3 className={mode === 'modal' ? 'text-3xl font-bold text-gray-900' : 'text-2xl font-bold text-gray-900'}>
            Get Your Perfect Size
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            Answer a few questions for personalized size recommendations
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className={`space-y-8 p-8 ${mode === 'modal' ? 'max-h-[calc(90vh-120px)] overflow-y-auto' : ''}`}
        >
          {/* Info Message */}
          <div className="rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-indigo-100 p-5">
            <div className="flex items-start gap-3">
              <svg
                className="mt-0.5 h-6 w-6 flex-shrink-0 text-indigo-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-semibold text-indigo-900">
                  Saved locally - Your privacy matters
                </p>
                <p className="mt-1 text-xs text-indigo-700">
                  Your measurements stay on your device and are never shared
                </p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-xl bg-red-50 border-2 border-red-200 p-4">
              <p className="text-sm font-semibold text-red-800">{error}</p>
            </div>
          )}

          {/* Gender Selection */}
          <div>
            <label className="mb-3 block text-sm font-bold uppercase tracking-wider text-gray-900">
              Gender *
            </label>
            <div className="grid grid-cols-2 gap-4">
              {(['male', 'female'] as const).map((gender) => (
                <button
                  key={gender}
                  type="button"
                  onClick={() => setMeasurements({ ...measurements, gender })}
                  className={`relative border-2 rounded-xl px-6 py-4 text-sm font-bold uppercase tracking-wider transition-all ${
                    measurements.gender === gender
                      ? 'bg-white border-indigo-600 ring-2 ring-indigo-600 ring-offset-2'
                      : 'bg-white border-gray-300 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: '#FFFFFF' }}
                >
                  <span style={{ color: '#1F2937' }}>{gender === 'male' ? 'Male' : 'Female'}</span>
                  {measurements.gender === gender && (
                    <svg
                      className="absolute top-3 right-3 h-5 w-5 text-indigo-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Height, Weight, Age */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="height"
                className="mb-2 block text-sm font-semibold text-gray-900"
              >
                Height (cm) *
              </label>
              <input
                type="number"
                id="height"
                value={measurements.height || ''}
                onChange={(e) =>
                  setMeasurements({
                    ...measurements,
                    height: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="175"
                required
                min={100}
                max={250}
                className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-sm focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
              />
            </div>

            <div>
              <label
                htmlFor="weight"
                className="mb-2 block text-sm font-semibold text-gray-900"
              >
                Weight (kg) *
              </label>
              <input
                type="number"
                id="weight"
                value={measurements.weight || ''}
                onChange={(e) =>
                  setMeasurements({
                    ...measurements,
                    weight: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="70"
                required
                min={30}
                max={200}
                className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-sm focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
              />
            </div>

            <div>
              <label
                htmlFor="age"
                className="mb-2 block text-sm font-semibold text-gray-900"
              >
                Age (years) *
              </label>
              <input
                type="number"
                id="age"
                value={measurements.age || ''}
                onChange={(e) =>
                  setMeasurements({
                    ...measurements,
                    age: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="25"
                required
                min={15}
                max={80}
                className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-sm focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
              />
            </div>
          </div>

          {/* Abdomen Shape */}
          <div>
            <label className="mb-4 block text-sm font-bold uppercase tracking-wider text-gray-900">
              Abdomen Shape *
            </label>
            <div className="grid grid-cols-3 gap-4">
              {(Object.keys(abdomenShapeDescriptions) as AbdomenShape[]).map(
                (shape) => {
                  const shapeInfo = abdomenShapeDescriptions[shape];
                  const selected = measurements.abdomenShape === shape;

                  return (
                    <button
                      key={shape}
                      type="button"
                      onClick={() =>
                        setMeasurements({ ...measurements, abdomenShape: shape })
                      }
                      className={`relative flex flex-col items-center !bg-white border-2 rounded-xl p-5 transition-all ${
                        selected
                          ? 'border-indigo-600 ring-2 ring-indigo-600 ring-offset-2'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {/* SVG Container */}
                      <div className="h-32 w-24 mb-3 rounded-lg bg-gradient-to-br from-amber-100 to-orange-200 p-2 flex items-center justify-center">
                        {shapeInfo.svg}
                      </div>

                      {/* Text */}
                      <p className="text-sm font-bold text-gray-900 mb-1">
                        {shapeInfo.title}
                      </p>
                      <p className="text-xs text-gray-600 text-center">
                        {shapeInfo.description}
                      </p>

                      {/* Checkmark */}
                      {selected && (
                        <svg
                          className="absolute top-3 right-3 h-5 w-5 text-indigo-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* Hip Shape */}
          <div>
            <label className="mb-4 block text-sm font-bold uppercase tracking-wider text-gray-900">
              Hip Shape *
            </label>
            <div className="grid grid-cols-3 gap-4">
              {(Object.keys(hipShapeDescriptions) as HipShape[]).map((shape) => {
                const shapeInfo = hipShapeDescriptions[shape];
                const selected = measurements.hipShape === shape;

                return (
                  <button
                    key={shape}
                    type="button"
                    onClick={() =>
                      setMeasurements({ ...measurements, hipShape: shape })
                    }
                    className={`relative flex flex-col items-center !bg-white border-2 rounded-xl p-5 transition-all ${
                      selected
                        ? 'border-indigo-600 ring-2 ring-indigo-600 ring-offset-2'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {/* SVG Container */}
                    <div className="h-32 w-24 mb-3 rounded-lg bg-gradient-to-br from-amber-100 to-orange-200 p-2 flex items-center justify-center">
                      {shapeInfo.svg}
                    </div>

                    {/* Text */}
                    <p className="text-sm font-bold text-gray-900 mb-1">
                      {shapeInfo.title}
                    </p>
                    <p className="text-xs text-gray-600 text-center">
                      {shapeInfo.description}
                    </p>

                    {/* Checkmark */}
                    {selected && (
                      <svg
                        className="absolute top-3 right-3 h-5 w-5 text-indigo-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Wearing Preference */}
          <div>
            <label className="mb-4 block text-sm font-bold uppercase tracking-wider text-gray-900">
              How do you prefer your clothes to fit? *
            </label>
            <div className="space-y-3">
              {(
                Object.keys(
                  wearingPreferenceDescriptions
                ) as WearingPreference[]
              ).map((pref) => {
                const prefInfo = wearingPreferenceDescriptions[pref];
                const selected = measurements.wearingPreference === pref;

                return (
                  <button
                    key={pref}
                    type="button"
                    onClick={() =>
                      setMeasurements({ ...measurements, wearingPreference: pref })
                    }
                    className={`relative flex w-full items-center justify-between !bg-white border-2 rounded-xl px-6 py-4 transition-all ${
                      selected
                        ? 'border-indigo-600 ring-2 ring-indigo-600 ring-offset-2'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-left">
                      <p className="text-sm font-bold text-gray-900">
                        {prefInfo.title}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {prefInfo.description}
                      </p>
                    </div>

                    {/* Checkmark */}
                    {selected && (
                      <svg
                        className="h-6 w-6 flex-shrink-0 text-indigo-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fabric Type - Only show if not provided by product */}
          {!productFabricType && (
            <div>
              <label className="mb-4 block text-sm font-bold uppercase tracking-wider text-gray-900">
                Fabric Type
                <span className="ml-2 text-xs font-normal text-gray-500">Optional - For Better Accuracy</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {([
                  { value: 'cotton', label: 'Pure Cotton', desc: 'No stretch, structured fabric' },
                  { value: 'cotton_blend', label: 'Milton / Blends', desc: 'Slight stretch, comfortable' },
                  { value: 'jersey_knit', label: 'Polyester / Knit', desc: 'Moderate stretch, form-fitting' },
                  { value: 'highly_elastic', label: 'Lycra / Stretch', desc: 'High stretch, very flexible' },
                ] as const).map((fabric) => {
                  const selected = measurements.fabricType === fabric.value;
                  return (
                    <button
                      key={fabric.value}
                      type="button"
                      onClick={() => setMeasurements({ ...measurements, fabricType: fabric.value })}
                      className={`relative flex w-full items-center justify-between !bg-white border-2 rounded-xl px-6 py-4 transition-all ${
                        selected
                          ? 'border-indigo-600 ring-2 ring-indigo-600 ring-offset-2'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="text-left">
                        <p className="text-sm font-bold text-gray-900">{fabric.label}</p>
                        <p className="text-xs text-gray-600 mt-1">{fabric.desc}</p>
                      </div>
                      {selected && (
                        <svg className="h-6 w-6 flex-shrink-0 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Optional Measurements */}
          <div className="rounded-xl border-2 border-dashed border-indigo-200 bg-gradient-to-br from-indigo-50/50 to-indigo-100/50 p-6">
            <div className="mb-4 flex items-center gap-2">
              <svg
                className="h-5 w-5 text-indigo-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm font-bold uppercase tracking-wider text-indigo-900">
                Optional (For Better Accuracy)
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Chest */}
              <div>
                <label
                  htmlFor="chest"
                  className="mb-2 block text-xs font-semibold text-gray-700"
                >
                  Chest (cm)
                </label>
                <input
                  type="number"
                  id="chest"
                  value={measurements.chest || ''}
                  onChange={(e) =>
                    setMeasurements({
                      ...measurements,
                      chest: parseFloat(e.target.value) || undefined,
                    })
                  }
                  placeholder="90"
                  min={1}
                  step={0.1}
                  className="w-full rounded-lg border-2 border-indigo-200 px-3 py-2 text-sm focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
                />
              </div>

              {/* Waist */}
              <div>
                <label
                  htmlFor="waist"
                  className="mb-2 block text-xs font-semibold text-gray-700"
                >
                  Waist (cm)
                </label>
                <input
                  type="number"
                  id="waist"
                  value={measurements.waist || ''}
                  onChange={(e) =>
                    setMeasurements({
                      ...measurements,
                      waist: parseFloat(e.target.value) || undefined,
                    })
                  }
                  placeholder="75"
                  min={1}
                  step={0.1}
                  className="w-full rounded-lg border-2 border-indigo-200 px-3 py-2 text-sm focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
                />
              </div>

              {/* Hips */}
              <div>
                <label
                  htmlFor="hips"
                  className="mb-2 block text-xs font-semibold text-gray-700"
                >
                  Hips (cm)
                </label>
                <input
                  type="number"
                  id="hips"
                  value={measurements.hips || ''}
                  onChange={(e) =>
                    setMeasurements({
                      ...measurements,
                      hips: parseFloat(e.target.value) || undefined,
                    })
                  }
                  placeholder="95"
                  min={1}
                  step={0.1}
                  className="w-full rounded-lg border-2 border-indigo-200 px-3 py-2 text-sm focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
                />
              </div>

              {/* Shoulder */}
              <div>
                <label
                  htmlFor="shoulder"
                  className="mb-2 block text-xs font-semibold text-gray-700"
                >
                  Shoulder (cm)
                  <span className="ml-1 text-xs text-gray-500" title="Measure from shoulder point to shoulder point across back">
                    ⓘ
                  </span>
                </label>
                <input
                  type="number"
                  id="shoulder"
                  value={measurements.shoulder || ''}
                  onChange={(e) =>
                    setMeasurements({
                      ...measurements,
                      shoulder: parseFloat(e.target.value) || undefined,
                    })
                  }
                  placeholder="42"
                  min={1}
                  step={0.1}
                  className="w-full rounded-lg border-2 border-indigo-200 px-3 py-2 text-sm focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-8 py-5 text-sm font-bold uppercase tracking-wider text-white transition-all hover:from-indigo-700 hover:to-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg
                    className="h-5 w-5 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Getting Recommendation...
                </span>
              ) : (
                'Get My Perfect Size'
              )}
            </button>
            <p className="mt-3 text-center text-xs text-gray-500">
              🔒 Your data is saved locally and never shared
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
