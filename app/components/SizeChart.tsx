
export type SizeChartProps = {
  /** Image URL for the size chart. */
  imageUrl?: string | null;
  /** Optional alt text */
  alt?: string;
  /** Optional className */
  className?: string;
};

/**
 * SizeChart component
 * - Displays a product size chart image elegantly
 * - Fallback: shows a message if no size chart available
 */
export default function SizeChart({imageUrl, alt = 'Size chart', className = ''}: SizeChartProps) {
  if (!imageUrl) {
    return (
      <div className={`text-sm text-gray-600 ${className}`}>
        No size chart available.
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="rounded-md overflow-hidden border border-[#E8E9EC] bg-white shadow-sm">
        <img
          src={imageUrl}
          alt={alt}
          className="w-full h-auto object-contain"
          style={{maxHeight: '640px'}}
        />
      </div>
    </div>
  );
}
