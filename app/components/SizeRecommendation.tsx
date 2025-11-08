import { useState } from 'react';

interface SizeRecommendationProps {
  onRecommendation: (size: string) => void;
  onClose: () => void;
}

interface SizeRecResponse {
  size: string;
  confidence?: number;
}

export function SizeRecommendation({
  onRecommendation,
  onClose,
}: SizeRecommendationProps) {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | ''>('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SizeRecResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/recommend-size', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          height: parseFloat(height),
          weight: parseFloat(weight),
          gender,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get recommendation');
      }

      const data = (await response.json()) as SizeRecResponse;
      setResult(data);
    } catch (err) {
      setError('Unable to get size recommendation. Please try again.');
      console.error('Size recommendation error:', err);
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
      className="p-6 space-y-4"
      style={{backgroundColor: '#F5F5F5', borderRadius: '4px'}}
    >
      <div className="flex items-center justify-between">
        <h3
          className="text-sm uppercase tracking-wider font-semibold"
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
          className="text-gray-500 hover:text-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2 rounded"
          aria-label="Close size recommendation"
        >
          <svg
            className="w-5 h-5"
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
                className="block text-xs uppercase tracking-wider font-medium mb-2"
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
                min="140"
                max="220"
                className="w-full px-3 py-2 text-sm transition-all duration-base focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2"
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
                className="block text-xs uppercase tracking-wider font-medium mb-2"
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
                min="40"
                max="150"
                className="w-full px-3 py-2 text-sm transition-all duration-base focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2"
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
              className="block text-xs uppercase tracking-wider font-medium mb-2"
              style={{color: '#6B6C75', fontFamily: 'var(--font-sans)'}}
            >
              Gender
            </label>
            <select
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value as 'male' | 'female')}
              required
              className="w-full px-3 py-2 text-sm transition-all duration-base focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2"
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 text-xs uppercase tracking-widest font-semibold transition-all duration-base hover:shadow-premium hover:-translate-y-0.5 active:scale-95 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: '#292929',
              color: '#FFFFFF',
              border: '2px solid #292929',
              fontFamily: 'var(--font-sans)',
              letterSpacing: '0.1em',
            }}
          >
            {loading ? 'Calculating...' : 'Get Recommendation'}
          </button>

          {error && (
            <p
              className="text-xs text-center"
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
              className="text-xs uppercase tracking-wider mb-2"
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
                className="text-xs mt-2"
                style={{
                  color: result.confidence > 0.7 ? '#388E3C' : '#F57C00',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                {result.confidence > 0.7
                  ? 'High confidence'
                  : 'Low confidence - please verify'}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleUseSize}
              className="flex-1 py-2.5 px-4 text-xs uppercase tracking-widest font-semibold transition-all duration-base hover:shadow-premium hover:-translate-y-0.5 active:scale-95 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2"
              style={{
                backgroundColor: '#292929',
                color: '#FFFFFF',
                border: '2px solid #292929',
                fontFamily: 'var(--font-sans)',
                letterSpacing: '0.1em',
              }}
            >
              Use This Size
            </button>
            <button
              type="button"
              onClick={() => setResult(null)}
              className="px-4 text-xs uppercase tracking-wider font-medium transition-colors hover:opacity-70 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2"
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
