import { useEffect, useState } from 'react';

// Types for user measurements
export interface UserMeasurements {
  gender: 'male' | 'female';
  height: number;
  weight: number;
  bodyFit: 'slim' | 'regular' | 'athletic' | 'relaxed';
  chest?: number;
  waist?: number;
  hips?: number;
  unit: 'metric';
  savedAt: string;
}

// Body fit visual descriptions with SVG diagrams
const bodyFitDescriptions: Record<'male' | 'female', Record<'slim' | 'regular' | 'athletic' | 'relaxed', { title: string; description: string; svg: JSX.Element }>> = {
  male: {
    slim: {
      title: 'Slim Fit',
      description: 'Close to body, tailored silhouette',
      svg: (
        <svg viewBox="0 0 80 120" className="w-full h-full">
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

export const meta = () => {
  return [
    { title: 'AI Size Guide | TALLA' },
    { name: 'description', content: 'Get personalized size recommendations powered by AI' },
  ];
};

export async function loader() {
  return {};
}

export default function SizeGuidePage() {
  const [gender, setGender] = useState<UserMeasurements['gender']>('male');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bodyFit, setBodyFit] = useState<UserMeasurements['bodyFit']>('regular');
  const [chest, setChest] = useState('');
  const [waist, setWaist] = useState('');
  const [hips, setHips] = useState('');
  const [unit, setUnit] = useState<UserMeasurements['unit']>('metric');
  const [isSaved, setIsSaved] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Load saved measurements on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('talla_user_measurements');
      if (saved) {
        try {
          const data = JSON.parse(saved) as UserMeasurements;
          setGender(data.gender);
          setHeight(data.height.toString());
          setWeight(data.weight.toString());
          setBodyFit(data.bodyFit);
          setChest(data.chest?.toString() || '');
          setWaist(data.waist?.toString() || '');
          setHips(data.hips?.toString() || '');
          setUnit(data.unit);
          setIsSaved(true);
        } catch (e) {
          console.error('Failed to load saved measurements:', e);
        }
      }
    }
  }, []);

  const handleSaveMeasurements = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);

    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 1000));

    const measurements: UserMeasurements = {
      gender,
      height: parseFloat(height),
      weight: parseFloat(weight),
      bodyFit,
      chest: chest ? parseFloat(chest) : undefined,
      waist: waist ? parseFloat(waist) : undefined,
      hips: hips ? parseFloat(hips) : undefined,
      unit,
      savedAt: new Date().toISOString(),
    };

    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('talla_user_measurements', JSON.stringify(measurements));
    }

    setIsSaved(true);
    setIsAnalyzing(false);
  };

  const handleClearMeasurements = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('talla_user_measurements');
    }
    setGender('male');
    setHeight('');
    setWeight('');
    setBodyFit('regular');
    setChest('');
    setWaist('');
    setHips('');
    setUnit('metric');
    setIsSaved(false);
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-16 py-16 lg:py-24">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#00F4D2]/10 rounded-full mb-6">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#00F4D2]">
              <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
              <path d="M2 17l10 5 10-5"></path>
              <path d="M2 12l10 5 10-5"></path>
            </svg>
            <span className="text-sm font-semibold text-[#00F4D2] uppercase tracking-wider" style={{ fontFamily: 'Aeonik, sans-serif' }}>
              AI-Powered
            </span>
          </div>
          <h1 
            className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight mb-4" 
            style={{ fontFamily: 'Georgia, serif' }}
          >
            Size Guide
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto" style={{ fontFamily: 'Quicking, sans-serif' }}>
            Save your measurements once, get personalized recommendations across all brands
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Form Section */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8">
            {isSaved && (
              <div className="mb-6 p-4 bg-[#00F4D2]/10 border border-[#00F4D2]/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#00F4D2] flex-shrink-0 mt-0.5">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <div>
                    <p className="text-sm font-semibold text-black mb-1" style={{ fontFamily: 'Aeonik, sans-serif' }}>
                      Your measurements are saved!
                    </p>
                    <p className="text-xs text-gray-600" style={{ fontFamily: 'Quicking, sans-serif' }}>
                      You'll see personalized size recommendations on all product pages.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSaveMeasurements} className="space-y-6">
              {/* Gender Selection */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-3 text-gray-700" style={{ fontFamily: 'Aeonik, sans-serif' }}>
                  Gender
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setGender('male')}
                    className={`py-3 px-4 rounded-lg text-sm font-semibold uppercase tracking-wider transition-all duration-200 ${
                      gender === 'male'
                        ? 'bg-black text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:border-black'
                    }`}
                    style={{ fontFamily: 'Aeonik, sans-serif' }}
                  >
                    MALE
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('female')}
                    className={`py-3 px-4 rounded-lg text-sm font-semibold uppercase tracking-wider transition-all duration-200 ${
                      gender === 'female'
                        ? 'bg-black text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:border-black'
                    }`}
                    style={{ fontFamily: 'Aeonik, sans-serif' }}
                  >
                    FEMALE
                  </button>
                </div>
              </div>

              {/* Height & Weight */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="height" className="block text-xs font-semibold uppercase tracking-wider mb-2 text-gray-700" style={{ fontFamily: 'Aeonik, sans-serif' }}>
                    Height (CM)*
                  </label>
                  <input
                    id="height"
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="170"
                    required
                    className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black transition-colors"
                    style={{ fontFamily: 'Quicking, sans-serif' }}
                  />
                </div>
                <div>
                  <label htmlFor="weight" className="block text-xs font-semibold uppercase tracking-wider mb-2 text-gray-700" style={{ fontFamily: 'Aeonik, sans-serif' }}>
                    Weight (KG)*
                  </label>
                  <input
                    id="weight"
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="65"
                    required
                    className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black transition-colors"
                    style={{ fontFamily: 'Quicking, sans-serif' }}
                  />
                </div>
              </div>

              {/* Body Fit Preference with Visual Diagrams */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-3 text-gray-700" style={{ fontFamily: 'Aeonik, sans-serif' }}>
                  Body Shape*
                </label>
                <div className="space-y-3">
                  {(['slim', 'regular', 'athletic', 'relaxed'] as const).map((fit) => {
                    const fitData = bodyFitDescriptions[gender][fit];
                    return (
                      <button
                        key={fit}
                        type="button"
                        onClick={() => setBodyFit(fit)}
                        className={`w-full relative p-5 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 ${
                          bodyFit === fit
                            ? 'border-black bg-gray-50'
                            : 'border-gray-200 bg-white hover:border-gray-400'
                        }`}
                      >
                        {/* Visual Diagram */}
                        <div className="w-16 h-24 flex-shrink-0">
                          {fitData.svg}
                        </div>
                        
                        {/* Text Content */}
                        <div className="flex-1 text-left">
                          <div className="text-sm font-bold mb-1" style={{ fontFamily: 'Aeonik, sans-serif' }}>
                            {fitData.title}
                          </div>
                          <div className="text-xs text-gray-600" style={{ fontFamily: 'Quicking, sans-serif' }}>
                            {fitData.description}
                          </div>
                        </div>
                        
                        {/* Check Mark when selected */}
                        {bodyFit === fit && (
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
                <p className="text-xs font-semibold uppercase tracking-wider mb-4 text-gray-500" style={{ fontFamily: 'Aeonik, sans-serif' }}>
                  Optional (for better accuracy)
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label htmlFor="chest" className="block text-xs font-semibold uppercase tracking-wider mb-2 text-gray-600" style={{ fontFamily: 'Aeonik, sans-serif' }}>
                      {gender === 'male' ? 'Chest' : 'Bust'} (CM)
                    </label>
                    <input
                      id="chest"
                      type="number"
                      value={chest}
                      onChange={(e) => setChest(e.target.value)}
                      placeholder="90"
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black transition-colors"
                      style={{ fontFamily: 'Quicking, sans-serif' }}
                    />
                  </div>
                  <div>
                    <label htmlFor="waist" className="block text-xs font-semibold uppercase tracking-wider mb-2 text-gray-600" style={{ fontFamily: 'Aeonik, sans-serif' }}>
                      Waist (CM)
                    </label>
                    <input
                      id="waist"
                      type="number"
                      value={waist}
                      onChange={(e) => setWaist(e.target.value)}
                      placeholder="75"
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black transition-colors"
                      style={{ fontFamily: 'Quicking, sans-serif' }}
                    />
                  </div>
                  <div>
                    <label htmlFor="hips" className="block text-xs font-semibold uppercase tracking-wider mb-2 text-gray-600" style={{ fontFamily: 'Aeonik, sans-serif' }}>
                      Hips (CM)
                    </label>
                    <input
                      id="hips"
                      type="number"
                      value={hips}
                      onChange={(e) => setHips(e.target.value)}
                      placeholder="95"
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black transition-colors"
                      style={{ fontFamily: 'Quicking, sans-serif' }}
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isAnalyzing}
                className="w-full py-3.5 bg-black text-white rounded-lg text-sm font-semibold uppercase tracking-wider hover:bg-gray-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                style={{ fontFamily: 'Aeonik, sans-serif' }}
              >
                {isAnalyzing ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  isSaved ? 'Update My Measurements' : 'Save My Measurements'
                )}
              </button>

              {isSaved && (
                <button
                  type="button"
                  onClick={handleClearMeasurements}
                  className="w-full py-3 text-sm text-gray-600 hover:text-black transition-colors"
                  style={{ fontFamily: 'Aeonik, sans-serif' }}
                >
                  Clear Saved Data
                </button>
              )}
            </form>
          </div>

          {/* Info Section */}
          <div className="flex flex-col justify-center space-y-8">
            {/* How It Works */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8">
              <h3 className="text-xl font-semibold mb-6" style={{ fontFamily: 'Aeonik, sans-serif' }}>
                How It Works
              </h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-bold" style={{ fontFamily: 'Aeonik, sans-serif' }}>
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1" style={{ fontFamily: 'Aeonik, sans-serif' }}>
                      Save Your Measurements
                    </h4>
                    <p className="text-sm text-gray-600" style={{ fontFamily: 'Quicking, sans-serif' }}>
                      Enter your measurements once and we'll save them securely
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-bold" style={{ fontFamily: 'Aeonik, sans-serif' }}>
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1" style={{ fontFamily: 'Aeonik, sans-serif' }}>
                      Browse Products
                    </h4>
                    <p className="text-sm text-gray-600" style={{ fontFamily: 'Quicking, sans-serif' }}>
                      Shop from multiple brands with different size charts
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#00F4D2] text-black rounded-full flex items-center justify-center font-bold" style={{ fontFamily: 'Aeonik, sans-serif' }}>
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1" style={{ fontFamily: 'Aeonik, sans-serif' }}>
                      Get Recommendations
                    </h4>
                    <p className="text-sm text-gray-600" style={{ fontFamily: 'Quicking, sans-serif' }}>
                      See personalized size recommendations on every product page
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#00F4D2] flex-shrink-0 mt-1">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <div>
                  <h4 className="font-semibold text-sm mb-1" style={{ fontFamily: 'Aeonik, sans-serif' }}>
                    Works Across All Brands
                  </h4>
                  <p className="text-xs text-gray-600" style={{ fontFamily: 'Quicking, sans-serif' }}>
                    One profile, accurate recommendations for every brand's size chart
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#00F4D2] flex-shrink-0 mt-1">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <div>
                  <h4 className="font-semibold text-sm mb-1" style={{ fontFamily: 'Aeonik, sans-serif' }}>
                    Reduce Returns
                  </h4>
                  <p className="text-xs text-gray-600" style={{ fontFamily: 'Quicking, sans-serif' }}>
                    Get the right size the first time, every time
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#00F4D2] flex-shrink-0 mt-1">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <div>
                  <h4 className="font-semibold text-sm mb-1" style={{ fontFamily: 'Aeonik, sans-serif' }}>
                    Your Data is Private
                  </h4>
                  <p className="text-xs text-gray-600" style={{ fontFamily: 'Quicking, sans-serif' }}>
                    All measurements are stored locally on your device
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
