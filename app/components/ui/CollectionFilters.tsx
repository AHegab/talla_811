import { useEffect, useState } from 'react';

export type FilterState = {
  vendors: string[];
  minPrice?: number | null;
  maxPrice?: number | null;
};

export default function CollectionFilters({
  vendors = [],
  initial = {vendors: [], minPrice: null, maxPrice: null},
  onChange,
}: {
  vendors?: string[];
  initial?: {vendors?: string[]; minPrice?: number | null; maxPrice?: number | null};
  onChange?: (filters: FilterState) => void;
}) {
  const [selectedVendors, setSelectedVendors] = useState<string[]>(initial.vendors || []);
  const [minPrice, setMinPrice] = useState<number | '' | null>(initial.minPrice ?? '');
  const [maxPrice, setMaxPrice] = useState<number | '' | null>(initial.maxPrice ?? '');

  useEffect(() => {
    onChange?.({vendors: selectedVendors, minPrice: typeof minPrice === 'number' ? minPrice : null, maxPrice: typeof maxPrice === 'number' ? maxPrice : null});
  }, [selectedVendors, minPrice, maxPrice]);

  function toggleVendor(v: string) {
    setSelectedVendors((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));
  }

  function clear() {
    setSelectedVendors([]);
    setMinPrice('');
    setMaxPrice('');
  }

  return (
    <aside aria-label="Filters" className="bg-white rounded-md p-4 shadow border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">Filters</h3>
        <button
          className="text-xs text-gray-500 hover:text-black"
          onClick={() => clear()}
          type="button"
        >
          Clear
        </button>
      </div>
      <div className="mb-4">
        <p className="text-xs font-medium mb-2">Vendor</p>
        <div className="flex flex-wrap gap-2">
          {vendors.map((v) => (
            <button
              key={v}
              onClick={() => toggleVendor(v)}
              className={`px-2 py-1 text-xs rounded-full border transition-all ${selectedVendors.includes(v) ? 'bg-[#f3d5d8] border-[#f3d5d8]' : 'bg-white border-gray-200'}`}>
              {v}
            </button>
          ))}
        </div>
      </div>
      <div className="mb-4">
        <p className="text-xs font-medium mb-2">Price</p>
        <div className="flex items-center gap-2">
          <input
            className="w-1/2 p-2 border rounded text-sm"
            type="number"
            placeholder="Min"
            value={minPrice === null ? '' : minPrice}
            onChange={(e) => setMinPrice(e.target.value === '' ? '' : Number(e.target.value))}
          />
          <input
            className="w-1/2 p-2 border rounded text-sm"
            type="number"
            placeholder="Max"
            value={maxPrice === null ? '' : maxPrice}
            onChange={(e) => setMaxPrice(e.target.value === '' ? '' : Number(e.target.value))}
          />
        </div>
      </div>
    </aside>
  );
}
