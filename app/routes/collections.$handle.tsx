import { Analytics, getPaginationVariables } from '@shopify/hydrogen';
import { useEffect, useState, type ReactNode } from 'react';
import { redirect, useLoaderData, useSearchParams } from 'react-router';
import type { ProductItemFragment } from 'storefrontapi.generated';
import { ProductItem } from '~/components/ProductItem';
import { ProductGrid } from '~/components/ui';
import { MenCollectionPage } from '~/components/ui/MenCollectionPage';
import { WomenCollectionPage } from '~/components/ui/WomenCollectionPage';
import { redirectIfHandleIsLocalized } from '~/lib/redirect';
import type { Route } from './+types/collections.$handle';

// Filter types
interface FilterState {
  sizes: string[];
  colors: string[];
  brands: string[];
  categories: string[];
  types: string[];
  priceMin: string;
  priceMax: string;
  priceRange: string;
}

export const meta: Route.MetaFunction = ({data}) => {
  const title = data?.collection?.title ?? 'Collection';
  return [
    {
      title: `TALLA | ${title}`,
    },
    {
      name: 'description',
      content: `Explore the ${title} selection on TALLA – curated premium fashion from local and regional brands.`,
    },
  ];
};

export async function loader(args: Route.LoaderArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  const {storefront} = context;
  const isLargeCollection = Boolean(handle?.toLowerCase?.().includes('men') || handle?.toLowerCase?.().includes('women'));
  const paginationVariables = getPaginationVariables(request, {
    // Use a larger page size for Men/Women collections to show more of the catalog
    pageBy: isLargeCollection ? 250 : 8,
  });

  if (!handle) {
    throw redirect('/collections');
  }

  const [{collection}] = await Promise.all([
    storefront.query(COLLECTION_QUERY, {
      variables: {handle, ...paginationVariables},
      // Add other queries here, so that they are loaded in parallel
    }),
  ]);

  if (!collection) {
    throw new Response(`Collection ${handle} not found`, {
      status: 404,
    });
  }

  // The API handle might be localized, so redirect to the localized handle
  redirectIfHandleIsLocalized(request, {handle, data: collection});

  return {
    collection,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: Route.LoaderArgs) {
  return {};
}

export default function Collection() {
  const {collection} = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const handleLower = collection?.handle?.toLowerCase?.() ?? '';
  const isMale = Boolean(handleLower === 'men' || /\bmen\b/i.test(collection?.title || ''));
  const isFemale = Boolean(handleLower === 'women' || /\bwomen\b/i.test(collection?.title || ''));

  // Set a body class to allow header styling for the male collection
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isMale) document.body.classList.add('male-theme-header');
    else document.body.classList.remove('male-theme-header');

    if (isFemale) document.body.classList.add('female-theme-header');
    else document.body.classList.remove('female-theme-header');

    return () => {
      document.body.classList.remove('male-theme-header');
      document.body.classList.remove('female-theme-header');
    };
  }, [isMale, isFemale]);

  const productsArray = collection?.products?.nodes ?? [];

  // Render dedicated collection pages for Men and Women
  if (isMale) {
    return <MenCollectionPage collection={collection as any} products={productsArray as ProductItemFragment[]} />;
  }

  // isFemale is computed earlier using `handleLower` and regex
  if (isFemale) {
    return <WomenCollectionPage collection={collection as any} products={productsArray as ProductItemFragment[]} />;
  }

  const products = productsArray;
  const accentColor = '#000000';

  // Extract price range from products
  const prices = products
    .map((p: any) => parseFloat(p.priceRange?.minVariantPrice?.amount ?? '0'))
    .filter(price => price > 0);

  const minPrice = prices.length > 0 ? Math.floor(Math.min(...prices)) : 0;
  const maxPrice = prices.length > 0 ? Math.ceil(Math.max(...prices)) : 1000;

  // Extract unique colors from products
  const availableColors = Array.from(
    new Set(
      products.flatMap((product: any) =>
        product.options
          ?.find((opt: any) => opt.name.toLowerCase() === 'color')
          ?.values?.map((v: string) => v) || []
      )
    )
  ).sort();

  // Extract product types
  const availableTypes = Array.from(
    new Set(
      products.map((product: any) => product.productType).filter(Boolean)
    )
  ).sort();

  // Initialize filters from URL params
  const [filters, setFilters] = useState<FilterState>({
    sizes: searchParams.get('sizes')?.split(',').filter(Boolean) ?? [],
    colors: searchParams.get('colors')?.split(',').filter(Boolean) ?? [],
    brands: searchParams.get('brands')?.split(',').filter(Boolean) ?? [],
    categories: searchParams.get('categories')?.split(',').filter(Boolean) ?? [],
    types: searchParams.get('types')?.split(',').filter(Boolean) ?? [],
    priceMin: searchParams.get('priceMin') ?? minPrice.toString(),
    priceMax: searchParams.get('priceMax') ?? maxPrice.toString(),
    priceRange: searchParams.get('priceRange') ?? '',
  });

  // Color mapping for common colors
  const colorHexMap: Record<string, string> = {
    'black': '#000000',
    'white': '#FFFFFF',
    'gray': '#9CA3AF',
    'grey': '#9CA3AF',
    'beige': '#D4C5B9',
    'navy': '#1E3A8A',
    'blue': '#3B82F6',
    'green': '#10B981',
    'red': '#EF4444',
    'yellow': '#F59E0B',
    'orange': '#F97316',
    'pink': '#EC4899',
    'purple': '#A855F7',
    'brown': '#92400E',
    'olive': '#84CC16',
    'cream': '#FFFDD0',
    'tan': '#D2B48C',
    'khaki': '#C3B091',
    'maroon': '#800000',
    'burgundy': '#800020',
    'silver': '#C0C0C0',
    'gold': '#FFD700',
    'bronze': '#CD7F32',
    'light grey': '#D3D3D3',
    'dark grey': '#696969',
    'light gray': '#D3D3D3',
    'dark gray': '#696969',
  };

  const getColorHex = (colorName: string): string => {
    const name = colorName.toLowerCase().trim();
    return colorHexMap[name] || '#D1D5DB';
  };

  // Format price range label
  const formatPriceRangeLabel = (rangeValue: string): string => {
    const labels: Record<string, string> = {
      'under-500': 'Under 500 EGP',
      '500-1000': '500-1000 EGP',
      '1000-2000': '1000-2000 EGP',
      '2000-plus': '2000+ EGP',
    };
    return labels[rangeValue] || rangeValue;
  };

  // Update URL when filters change
  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updated = {...filters, ...newFilters};
    setFilters(updated);

    // Build URL params
    const params = new URLSearchParams();
    if (updated.sizes.length) params.set('sizes', updated.sizes.join(','));
    if (updated.colors.length) params.set('colors', updated.colors.join(','));
    if (updated.brands.length) params.set('brands', updated.brands.join(','));
    if (updated.categories.length) params.set('categories', updated.categories.join(','));
    if (updated.types.length) params.set('types', updated.types.join(','));
    if (updated.priceMin) params.set('priceMin', updated.priceMin);
    if (updated.priceMax) params.set('priceMax', updated.priceMax);
    if (updated.priceRange) params.set('priceRange', updated.priceRange);

    setSearchParams(params, {replace: true, preventScrollReset: true});
  };

  // Toggle array filter (size, color, brand, category, type)
  const toggleFilter = (type: 'sizes' | 'colors' | 'brands' | 'categories' | 'types', value: string) => {
    const current = filters[type];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    updateFilters({[type]: updated});
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      sizes: [],
      colors: [],
      brands: [],
      categories: [],
      types: [],
      priceMin: minPrice.toString(),
      priceMax: maxPrice.toString(),
      priceRange: '',
    });
    setSearchParams(new URLSearchParams(), {replace: true, preventScrollReset: true});
  };

  // Filter products client-side
  const filteredProducts = products.filter((product: any) => {
    // Size filter
    if (filters.sizes.length > 0) {
      const productSizes = product.options
        ?.find((opt: any) => opt.name.toLowerCase() === 'size')
        ?.values || [];
      const hasMatchingSize = filters.sizes.some(size =>
        productSizes.some((ps: string) => ps.toLowerCase() === size.toLowerCase())
      );
      if (!hasMatchingSize) return false;
    }

    // Color filter
    if (filters.colors.length > 0) {
      const productColors = product.options
        ?.find((opt: any) => opt.name.toLowerCase() === 'color')
        ?.values || [];
      const hasMatchingColor = filters.colors.some(color =>
        productColors.some((pc: string) => pc.toLowerCase() === color.toLowerCase())
      );
      if (!hasMatchingColor) return false;
    }

    // Brand filter
    if (filters.brands.length > 0) {
      const productBrand = product.vendor || '';
      if (!filters.brands.includes(productBrand)) return false;
    }

    // Product Type filter
    if (filters.types.length > 0) {
      const productType = product.productType || '';
      if (!filters.types.includes(productType)) return false;
    }

    // Category filter (Men/Women/Unisex)
    if (filters.categories.length > 0) {
      // Check product tags or title for category matching
      const productTags = product.tags?.map((t: string) => t.toLowerCase()) || [];
      const productTitle = (product.title || '').toLowerCase();
      const hasMatchingCategory = filters.categories.some(category => {
        const cat = category.toLowerCase();
        return productTags.includes(cat) || productTitle.includes(cat);
      });
      if (!hasMatchingCategory) return false;
    }

    // Price filter (only filter if user changed from default)
    const currentMin = parseFloat(filters.priceMin || '0');
    const currentMax = parseFloat(filters.priceMax || maxPrice.toString());
    if (currentMin !== minPrice || currentMax !== maxPrice) {
      const price = parseFloat(product.priceRange?.minVariantPrice?.amount ?? '0');
      if (price < currentMin || price > currentMax) return false;
    }

    // Price range filter
    if (filters.priceRange) {
      const price = parseFloat(product.priceRange?.minVariantPrice?.amount ?? '0');
      const ranges: Record<string, [number, number]> = {
        'under-500': [0, 500],
        '500-1000': [500, 1000],
        '1000-2000': [1000, 2000],
        '2000-plus': [2000, Infinity],
      };
      const [min, max] = ranges[filters.priceRange] ?? [0, Infinity];
      if (price < min || price > max) return false;
    }

    return true;
  });

  const hasActiveFilters =
    filters.sizes.length > 0 ||
    filters.colors.length > 0 ||
    filters.brands.length > 0 ||
    filters.categories.length > 0 ||
    filters.types.length > 0 ||
    (filters.priceMin !== '' && parseFloat(filters.priceMin) !== minPrice) ||
    (filters.priceMax !== '' && parseFloat(filters.priceMax) !== maxPrice) ||
    filters.priceRange !== '';

  // Check if this is bags or partywear collection
  const isDarkTheme = collection.handle === 'bags' || collection.handle === 'partywear';

  // Default collection UI (non-men/non-women) with premium design
  return (
    <div className={`min-h-screen ${isDarkTheme ? 'bg-black' : 'bg-[#FDF8F7]'}`}>
      {/* HERO SECTION WITH BRAND IMAGE */}
      <section className={`relative pt-[128px] lg:pt-[128px] ${isDarkTheme ? 'bg-black' : 'bg-white'}`}>
        <div className="mx-auto max-w-[1440px]">
          
          {/* Brand Image - Full Width Below Header */}
          {collection.image && (
            <div className="w-full mb-12">
              <img
                src={collection.image.url}
                alt={collection.image.altText || collection.title}
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          {/* Brand Info */}
          <div className="text-center px-6 sm:px-10 lg:px-16 pb-12 sm:pb-16 lg:pb-20">
            {collection.description && (
              <p
                className="text-base sm:text-lg leading-relaxed text-[#5A4A4C] max-w-2xl mx-auto"
                style={{fontFamily: 'Quicking, sans-serif'}}
              >
                {collection.description}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Filters Drawer - Mobile */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/30 transition-opacity"
            onClick={() => setFiltersOpen(false)}
            aria-label="Close filters"
          />
          <div className="absolute inset-y-0 left-0 flex w-full max-w-md flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 p-6">
              <h2 className="text-base font-bold uppercase tracking-[0.12em]" style={{fontFamily: 'Aeonik, sans-serif', color: accentColor}}>
                Filters
              </h2>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="rounded-lg p-2 transition-colors hover:bg-gray-100"
                aria-label="Close filters"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 space-y-8 overflow-y-auto p-6">
              <FilterSection title="Size">
                <div className="grid grid-cols-4 gap-2">
                  {['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL'].map((size) => {
                    const isSelected = filters.sizes.includes(size);
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => toggleFilter('sizes', size)}
                        className="relative overflow-hidden rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-200 active:scale-95"
                        style={{
                          fontFamily: 'Aeonik, sans-serif',
                          borderColor: isSelected ? accentColor : '#D1D5DB',
                          backgroundColor: isSelected ? accentColor : 'transparent',
                          color: isSelected ? '#FFFFFF' : '#000000',
                        }}
                      >
                        <span className="relative z-10">{size}</span>
                      </button>
                    );
                  })}
                </div>
              </FilterSection>

              <FilterSection title="Color">
                <div className="grid grid-cols-6 gap-3">
                  {availableColors.map((colorName) => {
                    const colorOption = {name: colorName, color: getColorHex(colorName)};
                    const isSelected = filters.colors.includes(colorOption.name);
                    return (
                      <button
                        key={colorOption.name}
                        type="button"
                        onClick={() => toggleFilter('colors', colorOption.name)}
                        className="relative h-12 w-12 rounded-full shadow-sm transition-all duration-200 hover:scale-110 hover:shadow-md active:scale-95"
                        style={{
                          backgroundColor: colorOption.color,
                          borderWidth: '3px',
                          borderStyle: 'solid',
                          borderColor: isSelected ? accentColor : '#D1D5DB',
                        }}
                        aria-label={colorOption.name}
                        title={colorOption.name}
                      >
                        {isSelected && (
                          <svg
                            className="absolute inset-0 m-auto h-5 w-5"
                            fill="none"
                            stroke={colorOption.name === 'White' || colorOption.name === 'Beige' ? '#000' : '#FFF'}
                            viewBox="0 0 24 24"
                            strokeWidth={3}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              </FilterSection>

              <FilterSection title="Brand">
                <div className="space-y-3">
                  {['ZARA', 'TALLA', 'Aurora', 'Forge'].map((brand) => (
                    <label key={brand} className="group flex cursor-pointer items-center gap-3">
                      <input
                        type="checkbox"
                        checked={filters.brands.includes(brand)}
                        onChange={() => toggleFilter('brands', brand)}
                        className="h-4 w-4 rounded border-gray-300 focus:ring-2"
                        style={{accentColor: accentColor}}
                      />
                      <span className="text-sm transition-colors group-hover:text-black" style={{fontFamily: 'Quicking, sans-serif'}}>
                        {brand}
                      </span>
                    </label>
                  ))}
                </div>
              </FilterSection>

              <FilterSection title="Category">
                <div className="space-y-3">
                  {['Men', 'Women', 'Unisex', 'Kids'].map((category) => (
                    <label key={category} className="group flex cursor-pointer items-center gap-3">
                      <input
                        type="checkbox"
                        checked={filters.categories.includes(category)}
                        onChange={() => toggleFilter('categories', category)}
                        className="h-4 w-4 rounded border-gray-300 focus:ring-2"
                        style={{accentColor: accentColor}}
                      />
                      <span className="text-sm transition-colors group-hover:text-black" style={{fontFamily: 'Quicking, sans-serif'}}>
                        {category}
                      </span>
                    </label>
                  ))}
                </div>
              </FilterSection>

              <FilterSection title="Product Type">
                <div className="space-y-3">
                  {availableTypes.map((type) => (
                    <label key={type} className="group flex cursor-pointer items-center gap-3">
                      <input
                        type="checkbox"
                        checked={filters.types.includes(type)}
                        onChange={() => toggleFilter('types', type)}
                        className="h-4 w-4 rounded border-gray-300 focus:ring-2"
                        style={{accentColor: accentColor}}
                      />
                      <span className="text-sm transition-colors group-hover:text-black" style={{fontFamily: 'Quicking, sans-serif'}}>
                        {type}
                      </span>
                    </label>
                  ))}
                </div>
              </FilterSection>

              <FilterSection title="Price Range">
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <label className="text-xs text-gray-600 uppercase tracking-wide" style={{fontFamily: 'Aeonik, sans-serif'}}>MIN</label>
                        <div className="relative">
                          <input
                            type="number"
                            placeholder="0"
                            value={filters.priceMin}
                            onChange={(e) => updateFilters({priceMin: e.target.value, priceRange: ''})}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-12 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-black"
                            style={{fontFamily: 'Quicking, sans-serif'}}
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-medium">EGP</span>
                        </div>
                      </div>
                      <span className="text-gray-400 pt-5">—</span>
                      <div className="flex-1">
                        <label className="text-xs text-gray-600 uppercase tracking-wide" style={{fontFamily: 'Aeonik, sans-serif'}}>MAX</label>
                        <div className="relative">
                          <input
                            type="number"
                            placeholder={maxPrice.toString()}
                            value={filters.priceMax}
                            onChange={(e) => updateFilters({priceMax: e.target.value, priceRange: ''})}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-12 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-black"
                            style={{fontFamily: 'Quicking, sans-serif'}}
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-medium">EGP</span>
                        </div>
                      </div>
                    </div>
                    <input
                      type="range"
                      min={minPrice}
                      max={maxPrice}
                      value={filters.priceMax || maxPrice}
                      onChange={(e) => updateFilters({priceMax: e.target.value, priceMin: filters.priceMin || minPrice.toString(), priceRange: ''})}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                      style={{
                        background: `linear-gradient(to right, #000 0%, #000 ${((parseFloat(filters.priceMax || maxPrice.toString()) - minPrice) / (maxPrice - minPrice)) * 100}%, #E5E7EB ${((parseFloat(filters.priceMax || maxPrice.toString()) - minPrice) / (maxPrice - minPrice)) * 100}%, #E5E7EB 100%)`
                      }}
                    />
                  </div>
                </div>
              </FilterSection>
            </div>
            <div className="flex gap-3 border-t border-gray-200 p-6">
              <button
                type="button"
                onClick={() => {
                  clearFilters();
                  setFiltersOpen(false);
                }}
                className="flex-1 rounded-lg border border-gray-300 py-3 text-xs font-semibold uppercase tracking-[0.12em] transition-all duration-200 hover:border-gray-800 hover:bg-gray-50 active:scale-95"
                style={{fontFamily: 'Aeonik, sans-serif'}}
              >
                Clear All
              </button>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="group relative flex-1 overflow-hidden rounded-lg py-3 text-xs font-semibold uppercase tracking-[0.12em] text-white transition-all duration-200 hover:shadow-lg active:scale-95"
                style={{fontFamily: 'Aeonik, sans-serif', backgroundColor: accentColor}}
              >
                <span className="relative z-10">Apply Filters</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content - Sidebar + Products */}
      <div className="mx-auto max-w-[1440px] px-6 pb-16 sm:px-10 lg:px-16">
        <div className="flex gap-8 lg:gap-10">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0 bg-white rounded-2xl border border-[#E8E9EC] p-6 h-fit sticky top-24 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
            <div className="sticky top-4 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-[0.12em]" style={{fontFamily: 'Aeonik, sans-serif'}}>
                  Filters
                </h2>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="text-xs text-gray-600 underline hover:text-gray-900">
                    Clear All
                  </button>
                )}
              </div>

              <FilterSection title="Size">
                <div className="grid grid-cols-4 gap-2">
                  {['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL'].map((size) => {
                    const isSelected = filters.sizes.includes(size);
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => toggleFilter('sizes', size)}
                        className="relative overflow-hidden rounded-lg border px-2 py-1.5 text-xs font-medium transition-all duration-200 active:scale-95"
                        style={{
                          fontFamily: 'Aeonik, sans-serif',
                          borderColor: isSelected ? accentColor : '#D1D5DB',
                          backgroundColor: isSelected ? accentColor : 'transparent',
                          color: isSelected ? '#FFFFFF' : '#000000',
                        }}
                      >
                        <span className="relative z-10">{size}</span>
                      </button>
                    );
                  })}
                </div>
              </FilterSection>

              <FilterSection title="Color">
                <div className="grid grid-cols-6 gap-2">
                  {availableColors.map((colorName) => {
                    const colorOption = {name: colorName, color: getColorHex(colorName)};
                    const isSelected = filters.colors.includes(colorOption.name);
                    return (
                      <button
                        key={colorOption.name}
                        type="button"
                        onClick={() => toggleFilter('colors', colorOption.name)}
                        className="relative h-10 w-10 rounded-full shadow-sm transition-all duration-200 hover:scale-110 hover:shadow-md active:scale-95"
                        style={{
                          backgroundColor: colorOption.color,
                          borderWidth: '2px',
                          borderStyle: 'solid',
                          borderColor: isSelected ? accentColor : '#D1D5DB',
                        }}
                        aria-label={colorOption.name}
                        title={colorOption.name}
                      >
                        {isSelected && (
                          <svg
                            className="absolute inset-0 m-auto h-4 w-4"
                            fill="none"
                            stroke={colorOption.name === 'White' || colorOption.name === 'Beige' ? '#000' : '#FFF'}
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              </FilterSection>

              <FilterSection title="Brand">
                <div className="space-y-2">
                  {['ZARA', 'TALLA', 'Aurora', 'Forge'].map((brand) => {
                    const isSelected = filters.brands.includes(brand);
                    return (
                      <button
                        key={brand}
                        type="button"
                        onClick={() => toggleFilter('brands', brand)}
                        className="flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm transition-all duration-200 hover:bg-gray-50 active:scale-95"
                        style={{
                          fontFamily: 'Aeonik, sans-serif',
                          borderColor: isSelected ? accentColor : '#D1D5DB',
                          backgroundColor: isSelected ? `${accentColor}10` : 'transparent',
                        }}
                      >
                        <div
                          className="h-4 w-4 flex-shrink-0 rounded border-2 flex items-center justify-center"
                          style={{
                            borderColor: isSelected ? accentColor : '#D1D5DB',
                            backgroundColor: isSelected ? accentColor : 'transparent',
                          }}
                        >
                          {isSelected && (
                            <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span>{brand}</span>
                      </button>
                    );
                  })}
                </div>
              </FilterSection>

              <FilterSection title="Category">
                <div className="space-y-2">
                  {['Men', 'Women', 'Unisex', 'Kids'].map((category) => {
                    const isSelected = filters.categories.includes(category);
                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() => toggleFilter('categories', category)}
                        className="flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm transition-all duration-200 hover:bg-gray-50 active:scale-95"
                        style={{
                          fontFamily: 'Aeonik, sans-serif',
                          borderColor: isSelected ? accentColor : '#D1D5DB',
                          backgroundColor: isSelected ? `${accentColor}10` : 'transparent',
                        }}
                      >
                        <div
                          className="h-4 w-4 flex-shrink-0 rounded border-2 flex items-center justify-center"
                          style={{
                            borderColor: isSelected ? accentColor : '#D1D5DB',
                            backgroundColor: isSelected ? accentColor : 'transparent',
                          }}
                        >
                          {isSelected && (
                            <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span>{category}</span>
                      </button>
                    );
                  })}
                </div>
              </FilterSection>

              <FilterSection title="Product Type">
                <div className="space-y-2">
                  {availableTypes.map((type) => {
                    const isSelected = filters.types.includes(type);
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => toggleFilter('types', type)}
                        className="flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm transition-all duration-200 hover:bg-gray-50 active:scale-95"
                        style={{
                          fontFamily: 'Aeonik, sans-serif',
                          borderColor: isSelected ? accentColor : '#D1D5DB',
                          backgroundColor: isSelected ? `${accentColor}10` : 'transparent',
                        }}
                      >
                        <div
                          className="h-4 w-4 flex-shrink-0 rounded border-2 flex items-center justify-center"
                          style={{
                            borderColor: isSelected ? accentColor : '#D1D5DB',
                            backgroundColor: isSelected ? accentColor : 'transparent',
                          }}
                        >
                          {isSelected && (
                            <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span>{type}</span>
                      </button>
                    );
                  })}
                </div>
              </FilterSection>

              <FilterSection title="Price Range">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <label className="text-[10px] text-gray-600 uppercase tracking-wide mb-1 block" style={{fontFamily: 'Aeonik, sans-serif'}}>MIN</label>
                      <div className="relative">
                        <input
                          type="number"
                          placeholder="0"
                          value={filters.priceMin}
                          onChange={(e) => updateFilters({priceMin: e.target.value, priceRange: ''})}
                          className="w-full border border-gray-300 rounded-lg px-2 py-1.5 pr-10 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-black"
                          style={{fontFamily: 'Quicking, sans-serif'}}
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 font-medium">EGP</span>
                      </div>
                    </div>
                    <span className="text-gray-400 pt-4 text-sm">—</span>
                    <div className="flex-1">
                      <label className="text-[10px] text-gray-600 uppercase tracking-wide mb-1 block" style={{fontFamily: 'Aeonik, sans-serif'}}>MAX</label>
                      <div className="relative">
                        <input
                          type="number"
                          placeholder={maxPrice.toString()}
                          value={filters.priceMax}
                          onChange={(e) => updateFilters({priceMax: e.target.value, priceRange: ''})}
                          className="w-full border border-gray-300 rounded-lg px-2 py-1.5 pr-10 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-black"
                          style={{fontFamily: 'Quicking, sans-serif'}}
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 font-medium">EGP</span>
                      </div>
                    </div>
                  </div>
                  <input
                    type="range"
                    min={minPrice}
                    max={maxPrice}
                    value={filters.priceMax || maxPrice}
                    onChange={(e) => updateFilters({priceMax: e.target.value, priceMin: filters.priceMin || minPrice.toString(), priceRange: ''})}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                  />
                </div>
              </FilterSection>
            </div>
          </aside>

          {/* Products Section */}
          <div className="flex-1 min-w-0">
            {/* Enhanced Product Controls Bar - Desktop */}
            <div className="hidden lg:block mb-8">
              <div className="bg-white rounded-2xl border border-[#E8E9EC] p-8 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                {/* Header Row */}
                <div className="pb-6 border-b border-[#E8E9EC]">
                  <h2 className="text-2xl font-semibold text-[#1F191A] mb-2 uppercase tracking-[0.12em]" style={{fontFamily: 'Aeonik, sans-serif'}}>
                    Products
                  </h2>
                  <p className="text-sm text-[#5A4A4C]" style={{fontFamily: 'Quicking, sans-serif'}}>
                    Showing <span className="font-semibold text-[#1F191A]">{filteredProducts.length}</span> {filteredProducts.length === 1 ? 'product' : 'products'}
                  </p>
                </div>

                {/* Quick Filters Row */}
                <div className="flex items-center flex-wrap gap-3 pt-6">
                  <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#1F191A] whitespace-nowrap" style={{fontFamily: 'Aeonik, sans-serif'}}>
                    Quick Filters:
                  </span>

                  {/* Size Quick Filters */}
                  <div className="flex items-center gap-2">
                    {['S', 'M', 'L', 'XL'].map((size) => {
                      const isSelected = filters.sizes.includes(size);
                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => toggleFilter('sizes', size)}
                          className="px-4 py-2 rounded-lg border text-xs font-semibold transition-all duration-200 hover:shadow-md active:scale-95 min-w-[44px]"
                          style={{
                            fontFamily: 'Aeonik, sans-serif',
                            borderColor: isSelected ? accentColor : '#E8E9EC',
                            backgroundColor: isSelected ? accentColor : 'white',
                            color: isSelected ? '#FFFFFF' : '#5A4A4C',
                          }}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>

                  <div className="h-5 w-px bg-[#E8E9EC]" />

                  {/* Color Quick Filters */}
                  <div className="flex items-center gap-2">
                    {availableColors.slice(0, 6).map((colorName) => {
                      const colorOption = {name: colorName, color: getColorHex(colorName)};
                      const isSelected = filters.colors.includes(colorOption.name);
                      return (
                        <button
                          key={colorOption.name}
                          type="button"
                          onClick={() => toggleFilter('colors', colorOption.name)}
                          className="relative h-9 w-9 rounded-full shadow-sm transition-all duration-200 hover:scale-110 hover:shadow-md active:scale-95"
                          style={{
                            backgroundColor: colorOption.color,
                            borderWidth: '2.5px',
                            borderStyle: 'solid',
                            borderColor: isSelected ? accentColor : '#E8E9EC',
                          }}
                          aria-label={colorOption.name}
                          title={colorOption.name}
                        >
                          {isSelected && (
                            <svg
                              className="absolute inset-0 m-auto h-4 w-4"
                              fill="none"
                              stroke={colorOption.name === 'White' ? '#000' : '#FFF'}
                              viewBox="0 0 24 24"
                              strokeWidth={3}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="h-5 w-px bg-[#E8E9EC]" />

                  {/* Category Quick Filters */}
                  <div className="flex items-center gap-2">
                    {['Men', 'Women', 'Unisex'].map((category) => {
                      const isSelected = filters.categories.includes(category);
                      return (
                        <button
                          key={category}
                          type="button"
                          onClick={() => toggleFilter('categories', category)}
                          className="px-3 py-2 rounded-lg border text-xs font-semibold transition-all duration-200 hover:shadow-md active:scale-95"
                          style={{
                            fontFamily: 'Aeonik, sans-serif',
                            borderColor: isSelected ? accentColor : '#E8E9EC',
                            backgroundColor: isSelected ? accentColor : 'white',
                            color: isSelected ? '#FFFFFF' : '#5A4A4C',
                          }}
                        >
                          {category}
                        </button>
                      );
                    })}
                  </div>

                  {hasActiveFilters && (
                    <>
                      <div className="h-5 w-px bg-[#E8E9EC]" />
                      <button
                        onClick={clearFilters}
                        className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-[#1F191A] transition-all duration-200 active:scale-95 whitespace-nowrap"
                        style={{fontFamily: 'Aeonik, sans-serif'}}
                      >
                        CLEAR ALL
                      </button>
                    </>
                  )}
                </div>

                {/* Price Range Section */}
                <div className="pt-6 border-t border-[#E8E9EC] mt-6">
                  <h3 className="text-xs font-bold uppercase tracking-[0.12em] mb-4 text-[#1F191A]" style={{fontFamily: 'Aeonik, sans-serif'}}>
                    Price Range
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <label className="text-[10px] text-gray-600 uppercase tracking-wide mb-1.5 block" style={{fontFamily: 'Aeonik, sans-serif'}}>MIN</label>
                        <div className="relative">
                          <input
                            type="number"
                            value={filters.priceMin}
                            onChange={(e) => updateFilters({priceMin: e.target.value, priceRange: ''})}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-12 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-black"
                            style={{fontFamily: 'Quicking, sans-serif'}}
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-medium">EGP</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <label className="text-[10px] text-gray-600 uppercase tracking-wide mb-1.5 block" style={{fontFamily: 'Aeonik, sans-serif'}}>MAX</label>
                        <div className="relative">
                          <input
                            type="number"
                            value={filters.priceMax}
                            onChange={(e) => updateFilters({priceMax: e.target.value, priceRange: ''})}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-12 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-black"
                            style={{fontFamily: 'Quicking, sans-serif'}}
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-medium">EGP</span>
                        </div>
                      </div>
                    </div>
                    <div className="relative pt-1">
                      <input
                        type="range"
                        min={minPrice}
                        max={maxPrice}
                        value={filters.priceMax || maxPrice}
                        onChange={(e) => updateFilters({priceMax: e.target.value, priceMin: filters.priceMin || minPrice.toString(), priceRange: ''})}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                        style={{
                          background: `linear-gradient(to right, #000 0%, #000 ${((parseFloat(filters.priceMax || maxPrice.toString()) - minPrice) / (maxPrice - minPrice)) * 100}%, #E5E7EB ${((parseFloat(filters.priceMax || maxPrice.toString()) - minPrice) / (maxPrice - minPrice)) * 100}%, #E5E7EB 100%)`
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="mb-8 flex flex-wrap items-center gap-2">
                {filters.sizes.map(size => (
                  <button
                    key={`size-${size}`}
                    onClick={() => toggleFilter('sizes', size)}
                    className="inline-flex items-center gap-2 rounded-full border border-[#E8E9EC] bg-white px-4 py-2 text-xs font-medium transition-all hover:border-[#292929] hover:bg-[#FAFAFA]"
                    style={{fontFamily: 'Aeonik, sans-serif'}}
                  >
                    <span>Size: {size}</span>
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                ))}
                {filters.colors.map(color => (
                  <button
                    key={`color-${color}`}
                    onClick={() => toggleFilter('colors', color)}
                    className="inline-flex items-center gap-2 rounded-full border border-[#E8E9EC] bg-white px-4 py-2 text-xs font-medium transition-all hover:border-[#292929] hover:bg-[#FAFAFA]"
                    style={{fontFamily: 'Aeonik, sans-serif'}}
                  >
                    <span>Color: {color}</span>
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                ))}
                {filters.brands.map(brand => (
                  <button
                    key={`brand-${brand}`}
                    onClick={() => toggleFilter('brands', brand)}
                    className="inline-flex items-center gap-2 rounded-full border border-[#E8E9EC] bg-white px-4 py-2 text-xs font-medium transition-all hover:border-[#292929] hover:bg-[#FAFAFA]"
                    style={{fontFamily: 'Aeonik, sans-serif'}}
                  >
                    <span>Brand: {brand}</span>
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                ))}
                {filters.categories.map(category => (
                  <button
                    key={`category-${category}`}
                    onClick={() => toggleFilter('categories', category)}
                    className="inline-flex items-center gap-2 rounded-full border border-[#E8E9EC] bg-white px-4 py-2 text-xs font-medium transition-all hover:border-[#292929] hover:bg-[#FAFAFA]"
                    style={{fontFamily: 'Aeonik, sans-serif'}}
                  >
                    <span>{category}</span>
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                ))}
                {filters.types.map(type => (
                  <button
                    key={`type-${type}`}
                    onClick={() => toggleFilter('types', type)}
                    className="inline-flex items-center gap-2 rounded-full border border-[#E8E9EC] bg-white px-4 py-2 text-xs font-medium transition-all hover:border-[#292929] hover:bg-[#FAFAFA]"
                    style={{fontFamily: 'Aeonik, sans-serif'}}
                  >
                    <span>Type: {type}</span>
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                ))}
                {filters.priceRange && (
                  <button
                    onClick={() => updateFilters({priceRange: ''})}
                    className="inline-flex items-center gap-2 rounded-full border border-[#E8E9EC] bg-white px-4 py-2 text-xs font-medium transition-all hover:border-[#292929] hover:bg-[#FAFAFA]"
                    style={{fontFamily: 'Aeonik, sans-serif'}}
                  >
                    <span>{formatPriceRangeLabel(filters.priceRange)}</span>
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
                {((filters.priceMin && parseFloat(filters.priceMin) !== minPrice) || (filters.priceMax && parseFloat(filters.priceMax) !== maxPrice)) && (
                  <button
                    onClick={() => updateFilters({priceMin: minPrice.toString(), priceMax: maxPrice.toString()})}
                    className="inline-flex items-center gap-2 rounded-full border border-[#E8E9EC] bg-white px-4 py-2 text-xs font-medium transition-all hover:border-[#292929] hover:bg-[#FAFAFA]"
                    style={{fontFamily: 'Aeonik, sans-serif'}}
                  >
                    <span>Price: {filters.priceMin || minPrice} - {filters.priceMax || maxPrice} EGP</span>
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            )}

            {/* Products Grid */}
            <div className="mt-16">
              {filteredProducts.length > 0 ? (
                <ProductGrid>
                  {filteredProducts.map((p: any) => (
                  <ProductItem key={p.id} product={p as any} loading="lazy" isDarkTheme={isDarkTheme} />
                ))}
              </ProductGrid>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="mb-6 rounded-full bg-[#FAFAFA] p-6">
                  <svg className="h-12 w-12 text-[#C4C5CB]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="mb-2 text-xl font-semibold text-[#1F191A]" style={{fontFamily: 'Aeonik, sans-serif'}}>No products found</h3>
                <p className="mb-6 text-[#5A4A4C]" style={{fontFamily: 'Quicking, sans-serif'}}>Try adjusting your filters to see more results</p>
                <button
                  onClick={clearFilters}
                  className="rounded-lg border border-[#E8E9EC] bg-white px-6 py-3 text-sm font-medium uppercase tracking-[0.12em] transition-all hover:border-[#292929] hover:bg-[#FAFAFA]"
                  style={{fontFamily: 'Aeonik, sans-serif'}}
                >
                  Clear All Filters
                </button>
              </div>
            )}
            </div>
          </div>
        </div>
      </div>

      <Analytics.CollectionView
        data={{
          collection: {
            id: collection.id,
            handle: collection.handle,
          },
        }}
      />
    </div>
  );
}

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4">
      <h3 className="mb-1 text-xs font-semibold uppercase tracking-[0.12em]" style={{fontFamily: 'Aeonik, sans-serif'}}>
        {title}
      </h3>
      {children}
    </section>
  );
}

const PRODUCT_ITEM_FRAGMENT = `#graphql
  fragment MoneyProductItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment ProductItem on Product {
    id
    handle
    title
    vendor
    productType
    tags
    featuredImage {
      id
      altText
      url
      width
      height
    }
    priceRange {
      minVariantPrice {
        ...MoneyProductItem
      }
      maxVariantPrice {
        ...MoneyProductItem
      }
    }
    options {
      name
      values
    }
    variants(first: 1) {
      nodes {
        id
        availableForSale
        selectedOptions {
          name
          value
        }
      }
    }
  }
` as const;

// NOTE: https://shopify.dev/docs/api/storefront/2022-04/objects/collection
const COLLECTION_QUERY = `#graphql
  ${PRODUCT_ITEM_FRAGMENT}
  query CollectionPage(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      image {
        id
        url
        altText
        width
        height
      }
      products(
        first: $first
        last: $last
        before: $startCursor
        after: $endCursor
      ) {
        nodes {
          ...ProductItem
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          endCursor
          startCursor
        }
      }
      metafields(identifiers: [
        {namespace: "custom", key: "brand_logo"}
        {namespace: "custom", key: "collection_type"}
      ]) {
        namespace
        key
        value
        type
      }
    }
  }
` as const;
