interface ProductDescriptionProps {
  description?: string;
  fabricType?: 'cotton' | 'cotton_blend' | 'jersey_knit' | 'highly_elastic';
}

export function ProductDescription({
  description,
  fabricType,
}: ProductDescriptionProps) {
  // Map fabric type to human-readable names
  const fabricTypeLabels: Record<string, string> = {
    cotton: 'Cotton',
    cotton_blend: 'Cotton Blend',
    jersey_knit: 'Jersey Knit',
    highly_elastic: 'Highly Elastic',
  };

  return (
    <div className="space-y-4">
      {/* Description Panel */}
      <div className="flex min-h-[64px] flex-col rounded-xl border border-[#D1D5DB] bg-[#F8F9FB] shadow-md transition-all">
        <div className="flex min-h-[56px] items-center rounded-xl px-6 py-4 text-left text-[17px] font-semibold tracking-[0.02em] text-gray-700">
          <span className="tracking-wide">Description</span>
        </div>
        <div className="min-h-[48px] px-6 pb-6 text-[16px] leading-relaxed text-gray-600">
          {description || 'No description available.'}
        </div>
      </div>

      {/* Materials/Fabric Panel */}
      {fabricType && (
        <div className="flex min-h-[64px] flex-col rounded-xl border border-[#D1D5DB] bg-[#F8F9FB] shadow-md transition-all">
          <div className="flex min-h-[56px] items-center rounded-xl px-6 py-4 text-left text-[17px] font-semibold tracking-[0.02em] text-gray-700">
            <span className="tracking-wide">Materials</span>
          </div>
          <div className="min-h-[48px] px-6 pb-6 text-[16px] leading-relaxed text-gray-600">
            {fabricTypeLabels[fabricType] || fabricType}
          </div>
        </div>
      )}
    </div>
  );
}
