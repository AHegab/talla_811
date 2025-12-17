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
      <div className="flex min-h-[64px] flex-col rounded-lg border border-[#E5E7EB] bg-white shadow-sm transition-all hover:shadow-md">
        <div className="flex min-h-[48px] items-center px-5 py-3 text-left border-b border-[#F3F4F6]">
          <span className="text-[15px] font-medium tracking-wide text-gray-800" style={{ fontFamily: 'Aeonik, sans-serif', letterSpacing: '0.02em' }}>Description</span>
        </div>
        <div className="px-5 py-4 text-[14px] leading-[1.7] text-gray-600" style={{ fontFamily: 'Quicking, sans-serif' }}>
          {description || 'No description available.'}
        </div>
      </div>

      {/* Materials/Fabric Panel */}
      {fabricType && (
        <div className="flex min-h-[64px] flex-col rounded-lg border border-[#E5E7EB] bg-white shadow-sm transition-all hover:shadow-md">
          <div className="flex min-h-[48px] items-center px-5 py-3 text-left border-b border-[#F3F4F6]">
            <span className="text-[15px] font-medium tracking-wide text-gray-800" style={{ fontFamily: 'Aeonik, sans-serif', letterSpacing: '0.02em' }}>Materials</span>
          </div>
          <div className="px-5 py-4 text-[14px] leading-[1.7] text-gray-600" style={{ fontFamily: 'Quicking, sans-serif' }}>
            {fabricTypeLabels[fabricType] || fabricType}
          </div>
        </div>
      )}
    </div>
  );
}
