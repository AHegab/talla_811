interface ProductDescriptionProps {
  description?: string;
  fabricType?: 'cotton' | 'cotton_blend' | 'jersey_knit' | 'highly_elastic';
  modelSize?: string;
  vendor?: string;
}

export function ProductDescription({
  description,
  fabricType,
  modelSize,
  vendor,
}: ProductDescriptionProps) {
  // Map fabric type to human-readable names
  const fabricTypeLabels: Record<string, string> = {
    cotton: 'Cotton',
    cotton_blend: 'Cotton Blend',
    jersey_knit: 'Jersey Knit',
    highly_elastic: 'Highly Elastic',
  };

  return (
    <div className="space-y-6">
      {/* Vendor */}
      {vendor && (
        <div>
          
          <p className="text-[15px] text-gray-900">{vendor}</p>
        </div>
      )}

      {/* Description */}
      <div>
        
        <p className="text-[15px] leading-[1.7] text-gray-900">
          {description || 'No description available.'}
        </p>
      </div>

      {/* Model Size */}
      {modelSize && (
        <div>
          
          <p className="text-[15px] text-gray-900">{modelSize}</p>
        </div>
      )}

      {/* Materials/Fabric */}
      {fabricType && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Materials</h3>
          <p className="text-[15px] text-gray-900">
            {fabricTypeLabels[fabricType] || fabricType}
          </p>
        </div>
      )}
    </div>
  );
}
