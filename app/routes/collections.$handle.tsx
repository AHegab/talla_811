import { Analytics, getPaginationVariables } from '@shopify/hydrogen';
import { useEffect, useState, type ReactNode } from 'react';
import { redirect, useLoaderData, useSearchParams, Link } from 'react-router';
import type { ProductItemFragment } from 'storefrontapi.generated';
import { PaginatedResourceSection } from '~/components/PaginatedResourceSection';
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
  const [sortBy, setSortBy] = useState<'featured' | 'price-low-high' | 'price-high-low' | 'newest' | 'best-selling'>('featured');

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

  // Initialize filters from URL params
  const [filters, setFilters] = useState<FilterState>({
    sizes: searchParams.get('sizes')?.split(',').filter(Boolean) ?? [],
    colors: searchParams.get('colors')?.split(',').filter(Boolean) ?? [],
    brands: searchParams.get('brands')?.split(',').filter(Boolean) ?? [],
    priceMin: searchParams.get('priceMin') ?? '',
    priceMax: searchParams.get('priceMax') ?? '',
    priceRange: searchParams.get('priceRange') ?? '',
  });

  const products = productsArray;
  const accentColor = '#000000';

  // Update URL when filters change
  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updated = {...filters, ...newFilters};
    setFilters(updated);

    // Build URL params
    const params = new URLSearchParams();
    if (updated.sizes.length) params.set('sizes', updated.sizes.join(','));
    if (updated.colors.length) params.set('colors', updated.colors.join(','));
    if (updated.brands.length) params.set('brands', updated.brands.join(','));
    if (updated.priceMin) params.set('priceMin', updated.priceMin);
    if (updated.priceMax) params.set('priceMax', updated.priceMax);
    if (updated.priceRange) params.set('priceRange', updated.priceRange);

    setSearchParams(params, {replace: true, preventScrollReset: true});
  };

  // Toggle array filter (size, color, brand)
  const toggleFilter = (type: 'sizes' | 'colors' | 'brands', value: string) => {
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
      priceMin: '',
      priceMax: '',
      priceRange: '',
    });
    setSearchParams(new URLSearchParams(), {replace: true, preventScrollReset: true});
  };

  // Filter products client-side
  const filteredProducts = products.filter((product: any) => {
    // Price filter
    if (filters.priceMin || filters.priceMax) {
      const price = parseFloat(product.priceRange?.minVariantPrice?.amount ?? '0');
      const min = filters.priceMin ? parseFloat(filters.priceMin) : 0;
      const max = filters.priceMax ? parseFloat(filters.priceMax) : Infinity;
      if (price < min || price > max) return false;
    }

    // Price range filter
    if (filters.priceRange) {
      const price = parseFloat(product.priceRange?.minVariantPrice?.amount ?? '0');
      const ranges: Record<string, [number, number]> = {
        'under-50': [0, 50],
        '50-100': [50, 100],
        '100-200': [100, 200],
        '200-plus': [200, Infinity],
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
    filters.priceMin !== '' ||
    filters.priceMax !== '' ||
    filters.priceRange !== '';

  // Default collection UI (non-men/non-women) with premium design
  return (
    <div className="min-h-screen bg-[#FDF8F7]">
      {/* HERO SECTION WITH BRAND IMAGE */}
      <section className="relative py-12 sm:py-16 lg:py-20 bg-white">
        <div className="mx-auto max-w-[1440px] px-6 sm:px-10 lg:px-16">
          {/* Breadcrumb */}
          <nav className="mb-10 flex items-center space-x-2 text-[10px] font-medium uppercase tracking-[0.18em] text-[#5A4A4C]">
            <Link to="/" className="transition-colors hover:text-[#1F191A]">
              Home
            </Link>
            <span>/</span>
            <Link to="/collections" className="transition-colors hover:text-[#1F191A]">
              Collections
            </Link>
            <span>/</span>
            <span className="text-[#1F191A]">{collection.title}</span>
          </nav>

          <div className="grid lg:grid-cols-[1.5fr,1fr] gap-10 lg:gap-20 items-center">
            {/* Brand Logo/Image */}
            <div className="flex items-center justify-center lg:justify-start">
              {collection.image ? (
                <div className="relative w-full">
                  <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-gradient-to-br from-white to-[#FAFAFA] border border-[#E8E9EC] shadow-[0_4px_20px_rgba(0,0,0,0.06)] p-10 sm:p-16 lg:p-20">
                    <img
                      src={collection.image.url}
                      alt={collection.image.altText || collection.title}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              ) : (
                <div className="aspect-[16/9] w-full rounded-2xl bg-gradient-to-br from-white to-[#FAFAFA] border border-[#E8E9EC] flex items-center justify-center">
                  <span
                    className="text-6xl sm:text-7xl lg:text-8xl font-bold text-[#E8E9EC] uppercase tracking-[0.1em]"
                    style={{ fontFamily: 'Aeonik, sans-serif' }}
                  >
                    {collection.title.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            {/* Brand Info */}
            <div className="text-center lg:text-left">
              <p
                className="text-[11px] tracking-[0.28em] uppercase text-[#5A4A4C]/70 mb-4"
                style={{
                  fontFamily: 'Georgia, "Playfair Display SC", serif',
                }}
              >
                Brand Collection
              </p>
              <h1
                className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-[0.15em] uppercase text-[#1F191A] mb-6"
                style={{fontFamily: 'Aeonik, sans-serif'}}
              >
                {collection.title}
              </h1>
              <div className="h-[2px] w-20 rounded-full bg-[#1F191A] mb-6 mx-auto lg:mx-0" />
              {collection.description && (
                <p
                  className="text-base sm:text-lg leading-relaxed text-[#5A4A4C] max-w-xl mx-auto lg:mx-0"
                  style={{fontFamily: 'Quicking, sans-serif'}}
                >
                  {collection.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Filter Button */}
      <div className="bg-[#FDF8F7] sticky top-0 z-10 border-b border-[#E8E9EC]">
        <div className="mx-auto max-w-[1440px] px-6 py-4 sm:px-10 lg:px-16">
          <div className="flex items-center justify-between gap-4 lg:hidden">
            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              className="flex items-center gap-2 rounded-lg border border-[#E8E9EC] bg-white px-5 py-2.5 text-xs font-medium uppercase tracking-[0.12em] transition-all duration-200 hover:border-[#292929] hover:shadow-md active:scale-95"
              style={{fontFamily: 'Aeonik, sans-serif'}}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="rounded-full bg-[#292929] px-2 py-0.5 text-xs text-white">
                  {filters.sizes.length + filters.colors.length + filters.brands.length + (filters.priceRange ? 1 : 0) + (filters.priceMin || filters.priceMax ? 1 : 0)}
                </span>
              )}
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="cursor-pointer rounded-lg border border-[#E8E9EC] bg-white px-5 py-2.5 text-xs font-medium uppercase tracking-[0.12em] transition-all duration-200 hover:border-[#292929] focus:outline-none focus:ring-2 focus:ring-[#E8E9EC]"
              style={{fontFamily: 'Aeonik, sans-serif'}}
            >
              <option value="featured">Featured</option>
              <option value="price-low-high">Price: Low to High</option>
              <option value="price-high-low">Price: High to Low</option>
              <option value="newest">Newest</option>
              <option value="best-selling">Best Selling</option>
            </select>
          </div>
        </div>
      </div>

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
                  {[
                    {name: 'Black', color: '#000000'},
                    {name: 'White', color: '#FFFFFF'},
                    {name: 'Gray', color: '#9CA3AF'},
                    {name: 'Beige', color: '#D4C5B9'},
                    {name: 'Navy', color: '#1E3A8A'},
                    {name: 'Green', color: '#065F46'},
                  ].map((colorOption) => {
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

              <FilterSection title="Price Range">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.priceMin}
                      onChange={(e) => updateFilters({priceMin: e.target.value, priceRange: ''})}
                      className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2"
                      style={{fontFamily: 'Quicking, sans-serif'}}
                    />
                    <span className="text-gray-500">—</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.priceMax}
                      onChange={(e) => updateFilters({priceMax: e.target.value, priceRange: ''})}
                      className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2"
                      style={{fontFamily: 'Quicking, sans-serif'}}
                    />
                  </div>
                  <div className="space-y-2">
                    {[
                      {label: 'Under $50', value: 'under-50'},
                      {label: '$50 - $100', value: '50-100'},
                      {label: '$100 - $200', value: '100-200'},
                      {label: '$200+', value: '200-plus'},
                    ].map((range) => (
                      <label key={range.value} className="group flex cursor-pointer items-center gap-3">
                        <input
                          type="radio"
                          name="price"
                          checked={filters.priceRange === range.value}
                          onChange={() => updateFilters({priceRange: range.value, priceMin: '', priceMax: ''})}
                          className="h-4 w-4 border-gray-300 focus:ring-2"
                          style={{accentColor: accentColor}}
                        />
                        <span className="text-sm transition-colors group-hover:text-black" style={{fontFamily: 'Quicking, sans-serif'}}>
                          {range.label}
                        </span>
                      </label>
                    ))}
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
                  {[
                    {name: 'Black', color: '#000000'},
                    {name: 'White', color: '#FFFFFF'},
                    {name: 'Gray', color: '#9CA3AF'},
                    {name: 'Beige', color: '#D4C5B9'},
                    {name: 'Navy', color: '#1E3A8A'},
                    {name: 'Green', color: '#065F46'},
                  ].map((colorOption) => {
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

              <FilterSection title="Price Range">
                <div className="space-y-2">
                  {[
                    {label: 'Under $50', value: 'under-50'},
                    {label: '$50 - $100', value: '50-100'},
                    {label: '$100 - $200', value: '100-200'},
                    {label: '$200+', value: '200-plus'},
                  ].map((range) => {
                    const isSelected = filters.priceRange === range.value;
                    return (
                      <button
                        key={range.value}
                        type="button"
                        onClick={() => updateFilters({priceRange: isSelected ? '' : range.value})}
                        className="flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm transition-all duration-200 hover:bg-gray-50 active:scale-95"
                        style={{
                          fontFamily: 'Aeonik, sans-serif',
                          borderColor: isSelected ? accentColor : '#D1D5DB',
                          backgroundColor: isSelected ? `${accentColor}10` : 'transparent',
                        }}
                      >
                        <div
                          className="h-4 w-4 flex-shrink-0 rounded-full border-2 flex items-center justify-center"
                          style={{borderColor: isSelected ? accentColor : '#D1D5DB'}}
                        >
                          {isSelected && (
                            <div className="h-2 w-2 rounded-full" style={{backgroundColor: accentColor}} />
                          )}
                        </div>
                        <span>{range.label}</span>
                      </button>
                    );
                  })}
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
                <div className="flex items-start justify-between pb-6 border-b border-[#E8E9EC]">
                  <div>
                    <h2 className="text-2xl font-semibold text-[#1F191A] mb-2 uppercase tracking-[0.12em]" style={{fontFamily: 'Aeonik, sans-serif'}}>
                      Products
                    </h2>
                    <p className="text-sm text-[#5A4A4C]" style={{fontFamily: 'Quicking, sans-serif'}}>
                      Showing <span className="font-semibold text-[#1F191A]">{filteredProducts.length}</span> {filteredProducts.length === 1 ? 'product' : 'products'}
                    </p>
                  </div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                    className="cursor-pointer rounded-lg border border-[#E8E9EC] bg-white px-6 py-3 text-xs font-semibold uppercase tracking-[0.12em] transition-all duration-200 hover:border-[#292929] focus:outline-none focus:ring-2 focus:ring-[#E8E9EC]"
                    style={{fontFamily: 'Aeonik, sans-serif'}}
                  >
                    <option value="featured">Featured</option>
                    <option value="price-low-high">Price: Low to High</option>
                    <option value="price-high-low">Price: High to Low</option>
                    <option value="newest">Newest</option>
                    <option value="best-selling">Best Selling</option>
                  </select>
                </div>

                {/* Quick Filters Row */}
                <div className="flex items-center gap-4 pt-6">
                  <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#1F191A] whitespace-nowrap" style={{fontFamily: 'Aeonik, sans-serif'}}>
                    Quick Filters:
                  </span>

                  {/* Size Quick Filters */}
                  <div className="flex items-center gap-2.5">
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
                  <div className="flex items-center gap-2.5">
                    {[
                      {name: 'Black', color: '#000000'},
                      {name: 'White', color: '#FFFFFF'},
                      {name: 'Gray', color: '#9CA3AF'},
                      {name: 'Navy', color: '#1E3A8A'},
                    ].map((colorOption) => {
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

                  {hasActiveFilters && (
                    <>
                      <div className="h-5 w-px bg-[#E8E9EC] ml-1" />
                      <button
                        onClick={clearFilters}
                        className="text-xs font-semibold text-[#5A4A4C] hover:text-[#1F191A] underline transition-colors whitespace-nowrap"
                        style={{fontFamily: 'Aeonik, sans-serif'}}
                      >
                        Clear All
                      </button>
                    </>
                  )}
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
                {filters.priceRange && (
                  <button
                    onClick={() => updateFilters({priceRange: ''})}
                    className="inline-flex items-center gap-2 rounded-full border border-[#E8E9EC] bg-white px-4 py-2 text-xs font-medium transition-all hover:border-[#292929] hover:bg-[#FAFAFA]"
                    style={{fontFamily: 'Aeonik, sans-serif'}}
                  >
                    <span>Price: {filters.priceRange.replace('-', ' - ')}</span>
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
                {(filters.priceMin || filters.priceMax) && (
                  <button
                    onClick={() => updateFilters({priceMin: '', priceMax: ''})}
                    className="inline-flex items-center gap-2 rounded-full border border-[#E8E9EC] bg-white px-4 py-2 text-xs font-medium transition-all hover:border-[#292929] hover:bg-[#FAFAFA]"
                    style={{fontFamily: 'Aeonik, sans-serif'}}
                  >
                    <span>Price: ${filters.priceMin || '0'} - ${filters.priceMax || '∞'}</span>
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            )}

            {filteredProducts.length > 0 ? (
              <ProductGrid>
                {filteredProducts.map((p: any) => (
                  <ProductItem key={p.id} product={p as any} loading="lazy" />
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
        first: $first,
        last: $last,
        before: $startCursor,
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
    }
  }
` as const;
