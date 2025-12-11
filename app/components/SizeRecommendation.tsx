import {useState, type FormEvent} from 'react';

interface SizeDimensions {
  [size: string]: {
    chest?: [number, number];
    waist?: [number, number];
    hips?: [number, number];
  };
}

interface SizeRecommendationProps {
  onRecommendation: (size: string) => void;
  onClose: () => void;
  sizeDimensions?: SizeDimensions;
}

interface SizeRecResponse {
  size: string;
  confidence?: number;
  reasoning?: string;
  measurements?: {
    estimatedChest: number;
    estimatedWaist: number;
    estimatedHips: number;
  };
}

export function SizeRecommendation({
  onRecommendation,
  onClose,
  sizeDimensions,
}: SizeRecommendationProps) {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | ''>('');
  const [bodyFit, setBodyFit] = useState<'slim' | 'regular' | 'athletic' | 'relaxed'>('regular');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SizeRecResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const heightNum = parseFloat(height);
    const weightNum = parseFloat(weight);

    if (!gender || Number.isNaN(heightNum) || Number.isNaN(weightNum)) {
      setError('Please fill all fields with valid values.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/recommend-size', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          height: heightNum,
          weight: weightNum,
          gender,
          bodyFit,
          sizeDimensions,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get recommendation');
      }

      const data = (await response.json()) as SizeRecResponse;

      if (!data.size) {
        throw new Error('Invalid response from recommendation service');
      }

      setResult(data);
    } catch (err) {
      console.error('Size recommendation error:', err);
      setError('Unable to get size recommendation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUseSize = () => {
    if (result?.size) {
      onRecommendation(result.size);
    }
  };

  return (
    <div
      className="space-y-4 p-6"
      style={{backgroundColor: '#F5F5F5', borderRadius: '4px'}}
    >
      <div className="flex items-center justify-between">
        <h3
          className="text-sm font-semibold uppercase tracking-wider"
          style={{
            fontFamily: 'var(--font-sans)',
            color: '#292929',
            letterSpacing: '0.05em',
          }}
        >
          Find Your Size
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="rounded text-gray-500 transition-colors hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2"
          aria-label="Close size recommendation"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {!result ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {/* Height Input */}
            <div>
              <label
                htmlFor="height"
                className="mb-2 block text-xs font-medium uppercase tracking-wider"
                style={{color: '#6B6C75', fontFamily: 'var(--font-sans)'}}
              >
                Height (cm)
              </label>
              <input
                type="number"
                id="height"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                required
                min={140}
                max={220}
                className="w-full px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2"
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid #DDDEE2',
                  color: '#292929',
                  fontFamily: 'var(--font-sans)',
                }}
                placeholder="170"
              />
            </div>

            {/* Weight Input */}
            <div>
              <label
                htmlFor="weight"
                className="mb-2 block text-xs font-medium uppercase tracking-wider"
                style={{color: '#6B6C75', fontFamily: 'var(--font-sans)'}}
              >
                Weight (kg)
              </label>
              <input
                type="number"
                id="weight"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                required
                min={40}
                max={150}
                className="w-full px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2"
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid #DDDEE2',
                  color: '#292929',
                  fontFamily: 'var(--font-sans)',
                }}
                placeholder="70"
              />
            </div>
          </div>

          {/* Gender Select */}
          <div>
            <label
              htmlFor="gender"
              className="mb-2 block text-xs font-medium uppercase tracking-wider"
              style={{color: '#6B6C75', fontFamily: 'var(--font-sans)'}}
            >
              Gender
            </label>
            <select
              id="gender"
              value={gender}
              onChange={(e) =>
                setGender(e.target.value as 'male' | 'female' | '')
              }
              required
              className="w-full px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2"
              style={{
                backgroundColor: '#FFFFFF',
                border: '1.5px solid #DDDEE2',
                color: '#292929',
                fontFamily: 'var(--font-sans)',
              }}
            >
              <option value="">Select...</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          {/* Body Fit Select */}
          <div>
            <label
              htmlFor="bodyFit"
              className="mb-2 block text-xs font-medium uppercase tracking-wider"
              style={{color: '#6B6C75', fontFamily: 'var(--font-sans)'}}
            >
              Preferred Fit
            </label>
            <select
              id="bodyFit"
              value={bodyFit}
              onChange={(e) =>
                setBodyFit(e.target.value as 'slim' | 'regular' | 'athletic' | 'relaxed')
              }
              className="w-full px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2"
              style={{
                backgroundColor: '#FFFFFF',
                border: '1.5px solid #DDDEE2',
                color: '#292929',
                fontFamily: 'var(--font-sans)',
              }}
            >
              <option value="slim">Slim Fit</option>
              <option value="regular">Regular Fit</option>
              <option value="athletic">Athletic Fit</option>
              <option value="relaxed">Relaxed Fit</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.1em] transition-all hover:-translate-y-0.5 hover:shadow-premium focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              backgroundColor: '#292929',
              color: '#FFFFFF',
              border: '2px solid #292929',
              fontFamily: 'var(--font-sans)',
            }}
          >
            {loading ? 'Calculating...' : 'Get Recommendation'}
          </button>

          {error && (
            <p
              className="text-center text-xs"
              style={{color: '#D32F2F', fontFamily: 'var(--font-sans)'}}
              role="alert"
            >
              {error}
            </p>
          )}
        </form>
      ) : (
        <div className="space-y-4">
          {/* Result Display */}
          <div
            className="p-4 text-center"
            style={{backgroundColor: '#FFFFFF', borderRadius: '4px'}}
          >
            <p
              className="mb-2 text-xs uppercase tracking-wider"
              style={{color: '#6B6C75', fontFamily: 'var(--font-sans)'}}
            >
              Recommended Size
            </p>
            <p
              className="text-3xl font-semibold"
              style={{color: '#292929', fontFamily: 'var(--font-display)'}}
            >
              {result.size}
            </p>
            {result.confidence !== undefined && (
              <p
                className="mt-2 text-xs"
                style={{
                  color: result.confidence > 0.7 ? '#388E3C' : '#F57C00',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                {result.confidence > 0.7
                  ? 'High confidence'
                  : 'Low confidence – please verify'}
              </p>
            )}
            {result.reasoning && (
              <p
                className="mt-3 text-xs leading-relaxed"
                style={{color: '#6B6C75', fontFamily: 'var(--font-sans)'}}
              >
                {result.reasoning}
              </p>
            )}
          </div>

          {/* Estimated Measurements */}
          {result.measurements && (
            <div
              className="p-4"
              style={{backgroundColor: '#FFFFFF', borderRadius: '4px'}}
            >
              <p
                className="mb-3 text-xs font-medium uppercase tracking-wider"
                style={{color: '#6B6C75', fontFamily: 'var(--font-sans)'}}
              >
                Your Estimated Measurements
              </p>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p
                    className="text-xs uppercase tracking-wide mb-1"
                    style={{color: '#6B6C75', fontFamily: 'var(--font-sans)'}}
                  >
                    Chest
                  </p>
                  <p
                    className="text-lg font-semibold"
                    style={{color: '#292929', fontFamily: 'var(--font-sans)'}}
                  >
                    {result.measurements.estimatedChest.toFixed(1)}
                  </p>
                  <p
                    className="text-[10px]"
                    style={{color: '#6B6C75', fontFamily: 'var(--font-sans)'}}
                  >
                    cm
                  </p>
                </div>
                <div>
                  <p
                    className="text-xs uppercase tracking-wide mb-1"
                    style={{color: '#6B6C75', fontFamily: 'var(--font-sans)'}}
                  >
                    Waist
                  </p>
                  <p
                    className="text-lg font-semibold"
                    style={{color: '#292929', fontFamily: 'var(--font-sans)'}}
                  >
                    {result.measurements.estimatedWaist.toFixed(1)}
                  </p>
                  <p
                    className="text-[10px]"
                    style={{color: '#6B6C75', fontFamily: 'var(--font-sans)'}}
                  >
                    cm
                  </p>
                </div>
                <div>
                  <p
                    className="text-xs uppercase tracking-wide mb-1"
                    style={{color: '#6B6C75', fontFamily: 'var(--font-sans)'}}
                  >
                    Hips
                  </p>
                  <p
                    className="text-lg font-semibold"
                    style={{color: '#292929', fontFamily: 'var(--font-sans)'}}
                  >
                    {result.measurements.estimatedHips.toFixed(1)}
                  </p>
                  <p
                    className="text-[10px]"
                    style={{color: '#6B6C75', fontFamily: 'var(--font-sans)'}}
                  >
                    cm
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleUseSize}
              className="flex-1 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.1em] transition-all hover:-translate-y-0.5 hover:shadow-premium focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2"
              style={{
                backgroundColor: '#292929',
                color: '#FFFFFF',
                border: '2px solid #292929',
                fontFamily: 'var(--font-sans)',
              }}
            >
              Use This Size
            </button>
            <button
              type="button"
              onClick={() => setResult(null)}
              className="px-4 text-xs font-medium uppercase tracking-wider transition-colors hover:opacity-70 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2"
              style={{color: '#6B6C75', fontFamily: 'var(--font-sans)'}}
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
