import { useState } from 'react';

interface UserMeasurements {
  height: number;
  weight: number;
  unit: 'metric';
  bodyFit: 'slim' | 'regular' | 'athletic' | 'relaxed';
  gender: 'male' | 'female';
  chest?: number;
  waist?: number;
  hips?: number;
}

const bodyFitDescriptions = {
  male: {
    slim: {
      title: 'Slim Fit',
      description: 'Close to body, tailored silhouette',
      svg: (
        <svg viewBox="0 0 80 120" className="w-full h-full">
          {/* Slim male figure */}
          <ellipse cx="40" cy="20" rx="12" ry="14" fill="#E0E0E0" />
          <rect x="30" y="34" width="20" height="35" rx="3" fill="#BDBDBD" />
          <rect x="28" y="69" width="10" height="35" rx="2" fill="#9E9E9E" />
          <rect x="42" y="69" width="10" height="35" rx="2" fill="#9E9E9E" />
          <line x1="22" y1="40" x2="15" y2="60" stroke="#9E9E9E" strokeWidth="3" strokeLinecap="round" />
          <line x1="58" y1="40" x2="65" y2="60" stroke="#9E9E9E" strokeWidth="3" strokeLinecap="round" />
        </svg>
      )
    },
    regular: {
      title: 'Regular Fit',
      description: 'Comfortable, classic fit with room to move',
      svg: (
        <svg viewBox="0 0 80 120" className="w-full h-full">
          {/* Regular male figure */}
          <ellipse cx="40" cy="20" rx="13" ry="15" fill="#E0E0E0" />
          <rect x="27" y="34" width="26" height="38" rx="4" fill="#BDBDBD" />
          <rect x="26" y="72" width="12" height="36" rx="2" fill="#9E9E9E" />
          <rect x="42" y="72" width="12" height="36" rx="2" fill="#9E9E9E" />
          <line x1="20" y1="42" x2="12" y2="65" stroke="#9E9E9E" strokeWidth="4" strokeLinecap="round" />
          <line x1="60" y1="42" x2="68" y2="65" stroke="#9E9E9E" strokeWidth="4" strokeLinecap="round" />
        </svg>
      )
    },
    athletic: {
      title: 'Athletic Fit',
      description: 'Broader shoulders, tapered waist',
      svg: (
        <svg viewBox="0 0 80 120" className="w-full h-full">
          {/* Athletic male figure */}
          <ellipse cx="40" cy="20" rx="13" ry="15" fill="#E0E0E0" />
          <path d="M 25 34 L 22 50 L 25 72 L 55 72 L 58 50 L 55 34 Z" fill="#BDBDBD" />
          <rect x="27" y="72" width="11" height="36" rx="2" fill="#9E9E9E" />
          <rect x="42" y="72" width="11" height="36" rx="2" fill="#9E9E9E" />
          <line x1="18" y1="40" x2="10" y2="62" stroke="#9E9E9E" strokeWidth="5" strokeLinecap="round" />
          <line x1="62" y1="40" x2="70" y2="62" stroke="#9E9E9E" strokeWidth="5" strokeLinecap="round" />
        </svg>
      )
    },
    relaxed: {
      title: 'Relaxed Fit',
      description: 'Loose, comfortable with extra room',
      svg: (
        <svg viewBox="0 0 80 120" className="w-full h-full">
          {/* Relaxed male figure */}
          <ellipse cx="40" cy="20" rx="14" ry="16" fill="#E0E0E0" />
          <rect x="24" y="34" width="32" height="40" rx="5" fill="#BDBDBD" />
          <rect x="24" y="74" width="14" height="36" rx="3" fill="#9E9E9E" />
          <rect x="42" y="74" width="14" height="36" rx="3" fill="#9E9E9E" />
          <line x1="18" y1="44" x2="10" y2="68" stroke="#9E9E9E" strokeWidth="5" strokeLinecap="round" />
          <line x1="62" y1="44" x2="70" y2="68" stroke="#9E9E9E" strokeWidth="5" strokeLinecap="round" />
        </svg>
      )
    }
  },
  female: {
    slim: {
      title: 'Slim Fit',
      description: 'Close to body, figure-hugging silhouette',
      svg: (
        <svg viewBox="0 0 80 120" className="w-full h-full">
          {/* Slim female figure */}
          <ellipse cx="40" cy="20" rx="11" ry="13" fill="#E0E0E0" />
          <path d="M 32 34 L 28 50 L 30 68 L 50 68 L 52 50 L 48 34 Z" fill="#BDBDBD" />
          <path d="M 30 68 L 32 85 L 28 104 L 38 104 L 38 68 Z" fill="#9E9E9E" />
          <path d="M 50 68 L 48 85 L 52 104 L 42 104 L 42 68 Z" fill="#9E9E9E" />
          <line x1="24" y1="38" x2="16" y2="58" stroke="#9E9E9E" strokeWidth="3" strokeLinecap="round" />
          <line x1="56" y1="38" x2="64" y2="58" stroke="#9E9E9E" strokeWidth="3" strokeLinecap="round" />
        </svg>
      )
    },
    regular: {
      title: 'Regular Fit',
      description: 'Comfortable, flattering everyday fit',
      svg: (
        <svg viewBox="0 0 80 120" className="w-full h-full">
          {/* Regular female figure */}
          <ellipse cx="40" cy="20" rx="12" ry="14" fill="#E0E0E0" />
          <path d="M 30 34 L 26 52 L 28 70 L 52 70 L 54 52 L 50 34 Z" fill="#BDBDBD" />
          <path d="M 28 70 L 30 88 L 26 106 L 37 106 L 37 70 Z" fill="#9E9E9E" />
          <path d="M 52 70 L 50 88 L 54 106 L 43 106 L 43 70 Z" fill="#9E9E9E" />
          <line x1="22" y1="40" x2="14" y2="62" stroke="#9E9E9E" strokeWidth="4" strokeLinecap="round" />
          <line x1="58" y1="40" x2="66" y2="62" stroke="#9E9E9E" strokeWidth="4" strokeLinecap="round" />
        </svg>
      )
    },
    athletic: {
      title: 'Athletic Fit',
      description: 'Defined shoulders, tailored through body',
      svg: (
        <svg viewBox="0 0 80 120" className="w-full h-full">
          {/* Athletic female figure */}
          <ellipse cx="40" cy="20" rx="12" ry="14" fill="#E0E0E0" />
          <path d="M 28 34 L 24 50 L 26 70 L 54 70 L 56 50 L 52 34 Z" fill="#BDBDBD" />
          <path d="M 26 70 L 28 86 L 25 105 L 36 105 L 36 70 Z" fill="#9E9E9E" />
          <path d="M 54 70 L 52 86 L 55 105 L 44 105 L 44 70 Z" fill="#9E9E9E" />
          <line x1="20" y1="38" x2="12" y2="60" stroke="#9E9E9E" strokeWidth="4" strokeLinecap="round" />
          <line x1="60" y1="38" x2="68" y2="60" stroke="#9E9E9E" strokeWidth="4" strokeLinecap="round" />
        </svg>
      )
    },
    relaxed: {
      title: 'Relaxed Fit',
      description: 'Loose, comfortable with extra room',
      svg: (
        <svg viewBox="0 0 80 120" className="w-full h-full">
          {/* Relaxed female figure */}
          <ellipse cx="40" cy="20" rx="13" ry="15" fill="#E0E0E0" />
          <rect x="26" y="34" width="28" height="38" rx="4" fill="#BDBDBD" />
          <path d="M 26 72 L 28 90 L 24 108 L 36 108 L 36 72 Z" fill="#9E9E9E" />
          <path d="M 54 72 L 52 90 L 56 108 L 44 108 L 44 72 Z" fill="#9E9E9E" />
          <line x1="20" y1="42" x2="12" y2="66" stroke="#9E9E9E" strokeWidth="5" strokeLinecap="round" />
          <line x1="60" y1="42" x2="68" y2="66" stroke="#9E9E9E" strokeWidth="5" strokeLinecap="round" />
        </svg>
      )
    }
  }
};

export function SizeRecommendationPrompt({ onComplete }: { onComplete?: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [measurements, setMeasurements] = useState<UserMeasurements>({
    height: 0,
    weight: 0,
    unit: 'metric',
    bodyFit: 'regular',
    gender: 'male',
    chest: undefined,
    waist: undefined,
    hips: undefined,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (measurements.height > 0 && measurements.weight > 0) {
      localStorage.setItem('talla_user_measurements', JSON.stringify(measurements));
      setShowForm(false);
      if (onComplete) onComplete();
      // Reload page to trigger size recommendation
      window.location.reload();
    }
  };

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 underline underline-offset-2"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Get size recommendation
      </button>
    );
  }

  const currentBodyFits = bodyFitDescriptions[measurements.gender];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full my-8">
        <div className="sticky top-0 bg-white rounded-t-lg border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h3 className="text-2xl font-semibold text-gray-900">Get Your Perfect Size</h3>
            <p className="text-sm text-gray-600 mt-1">
              {measurements.gender === 'male' ? 'Men\'s' : 'Women\'s'} size recommendations
            </p>
          </div>
          <button
            onClick={() => setShowForm(false)}
            className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          {/* Success Message */}
          <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-cyan-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium text-cyan-900">Your measurements are saved!</p>
                <p className="text-xs text-cyan-700 mt-1">
                  You'll see personalized size recommendations on all product pages.
                </p>
              </div>
            </div>
          </div>

          {/* Gender Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-3 text-gray-700" style={{ fontFamily: 'Aeonik, sans-serif' }}>
              Gender
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(['male', 'female'] as const).map((gender) => (
                <button
                  key={gender}
                  type="button"
                  onClick={() => setMeasurements({ ...measurements, gender })}
                  className={`px-6 py-3.5 text-sm font-semibold border rounded transition-colors uppercase tracking-wider ${
                    measurements.gender === gender
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-black border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {gender === 'male' ? 'MALE' : 'FEMALE'}
                </button>
              ))}
            </div>
          </div>

          {/* Height */}
          <div>
            <label htmlFor="height" className="block text-sm font-semibold text-gray-900 mb-2">
              HEIGHT (CM)*
            </label>
            <input
              type="number"
              id="height"
              value={measurements.height || ''}
              onChange={(e) => setMeasurements({ ...measurements, height: parseFloat(e.target.value) || 0 })}
              placeholder="e.g., 175"
              required
              min="1"
              step="0.1"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>

          {/* Weight */}
          <div>
            <label htmlFor="weight" className="block text-sm font-semibold text-gray-900 mb-2">
              WEIGHT (KG)*
            </label>
            <input
              type="number"
              id="weight"
              value={measurements.weight || ''}
              onChange={(e) => setMeasurements({ ...measurements, weight: parseFloat(e.target.value) || 0 })}
              placeholder="e.g., 70"
              required
              min="1"
              step="0.1"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>

          {/* Body Fit Preference with Diagrams */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              BODY SHAPE*
            </label>
            <div className="space-y-3">
              {(Object.keys(currentBodyFits) as Array<keyof typeof currentBodyFits>).map((fit) => {
                const fitInfo = currentBodyFits[fit];
                return (
                  <button
                    key={fit}
                    type="button"
                    onClick={() => setMeasurements({ ...measurements, bodyFit: fit })}
                    className={`w-full relative p-5 border-2 rounded-xl transition-all flex items-center gap-4 ${
                      measurements.bodyFit === fit
                        ? 'border-black bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    {/* Body diagram */}
                    <div className="w-16 h-24 flex-shrink-0 flex items-center justify-center">
                      {fitInfo.svg}
                    </div>
                    
                    {/* Fit info */}
                    <div className="flex-1 text-left">
                      <p className={`text-sm font-bold mb-1 ${
                        measurements.bodyFit === fit ? 'text-black' : 'text-gray-700'
                      }`}>
                        {fitInfo.title}
                      </p>
                      <p className="text-xs text-gray-600">
                        {fitInfo.description}
                      </p>
                    </div>
                    
                    {/* Selection indicator */}
                    {measurements.bodyFit === fit && (
                      <div className="flex-shrink-0">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-black">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Measurements */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm font-semibold text-gray-900">OPTIONAL (FOR BETTER ACCURACY)</span>
              <span className="text-xs text-gray-500">— Recommended</span>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {/* Chest/Bust */}
              <div>
                <label htmlFor="chest" className="block text-xs font-medium text-gray-700 mb-2">
                  {measurements.gender === 'male' ? 'CHEST (CM)' : 'BUST (CM)'}
                </label>
                <input
                  type="number"
                  id="chest"
                  value={measurements.chest || ''}
                  onChange={(e) => setMeasurements({ ...measurements, chest: parseFloat(e.target.value) || undefined })}
                  placeholder="90"
                  min="1"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>

              {/* Waist */}
              <div>
                <label htmlFor="waist" className="block text-xs font-medium text-gray-700 mb-2">
                  WAIST (CM)
                </label>
                <input
                  type="number"
                  id="waist"
                  value={measurements.waist || ''}
                  onChange={(e) => setMeasurements({ ...measurements, waist: parseFloat(e.target.value) || undefined })}
                  placeholder="75"
                  min="1"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>

              {/* Hips */}
              <div>
                <label htmlFor="hips" className="block text-xs font-medium text-gray-700 mb-2">
                  HIPS (CM)
                </label>
                <input
                  type="number"
                  id="hips"
                  value={measurements.hips || ''}
                  onChange={(e) => setMeasurements({ ...measurements, hips: parseFloat(e.target.value) || undefined })}
                  placeholder="95"
                  min="1"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="sticky bottom-0 bg-white pt-4 border-t border-gray-200 -mx-6 px-6 -mb-6 pb-6 rounded-b-lg">
            <button
              type="submit"
              className="w-full px-6 py-4 bg-black text-white text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors rounded-lg shadow-sm"
            >
              Save & Get Recommendations
            </button>
            <p className="text-xs text-center text-gray-500 mt-3">
              Your measurements are saved locally and never shared
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
