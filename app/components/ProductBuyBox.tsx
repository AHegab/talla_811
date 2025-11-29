import type { FetcherWithComponents } from '@remix-run/react';
import {
  CartForm,
  Money,
  type OptimisticCartLineInput,
} from '@shopify/hydrogen';
import { Flame, Heart, Leaf, Shirt, Sparkles, Sun, Tag, Tags, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { SizeRecommendation } from './SizeRecommendation';
import { SizeRecommendationPrompt } from './SizeRecommendationPrompt';
import SizeChart from './SizeChart';

export interface PDPVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  selectedOptions: { name: string; value: string }[];
  price: { amount: string; currencyCode: string };
  sku?: string;
}

export interface PDPProduct {
  id: string;
  title: string;
  handle: string;
  vendor?: string;
  description?: string;
  productType?: string;
  tags?: string[];
  options: { name: string; values: string[] }[];
  variants: PDPVariant[];
  priceRange: {
    minVariantPrice: { amount: string; currencyCode: string };
  };
  // Optional images for the mini-scroll gallery
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  images?: { nodes: any[] };
  // optional size chart image url
  sizeChartImage?: { url: string; alt?: string } | null;
  // optional brand-level size chart image
  brandSizeChartImage?: { url: string; alt?: string } | null;
}

export interface SimilarProduct {
  id: string;
  title: string;
  handle: string;
  priceRange: {
    minVariantPrice: { amount: string; currencyCode: string };
  };
  featuredImage?: {
    url: string;
    altText?: string;
  };
  tags?: string[];
}

interface ProductBuyBoxProps {
  product: PDPProduct;
  selectedVariant: PDPVariant;
  onVariantChange?: (variant: PDPVariant) => void;
  recommendedSize?: string | null;
}

export function ProductBuyBox({
  product,
  selectedVariant,
  onVariantChange,
  recommendedSize,
}: ProductBuyBoxProps) {
  const [sizeRecOpen, setSizeRecOpen] = useState(false);
  const [sizeChartOpen, setSizeChartOpen] = useState(false);
  const [brandSizeChartOpen, setBrandSizeChartOpen] = useState(false);
  // which chart to show in the main chart modal: 'product' | 'brand'
  const [chartSource, setChartSource] = useState<'product' | 'brand' | null>(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const [showSizePrompt, setShowSizePrompt] = useState(false); // reserved if you want to show a separate prompt later
  const [hasMeasurements, setHasMeasurements] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(
    () => {
      const initial: Record<string, string> = {};
      selectedVariant.selectedOptions.forEach((option) => {
        initial[option.name] = option.value;
      });
      return initial;
    },
  );

  // Simple name -> hex map for common colors used in product option labels.
  // If you add uncommon color names, extend the map here so the UI renders correctly.
  const colorNameToHex: Record<string, string> = {
    navy: '#0b3d91',
    black: '#000000',
    white: '#ffffff',
    red: '#ef4444',
    blue: '#3b82f6',
    green: '#10b981',
    yellow: '#f59e0b',
    gray: '#6b7280',
    grey: '#6b7280',
    pink: '#ec4899',
    purple: '#8b5cf6',
    brown: '#7c3f00',
    tan: '#d2b48c',
    orange: '#f97316',
    skyblue: '#38bdf8',
    'sky blue': '#38bdf8',
  };

  const toHex = (val: string) => {
    const key = val.trim().toLowerCase();
    if (key.startsWith('#')) return key; // already a hex value
    // Normalize common misspellings or multiple-word names by removing spaces/hyphens
    const normalized = key.replace(/\s+|[-_]/g, '');
    if (colorNameToHex[key as keyof typeof colorNameToHex]) return colorNameToHex[key as keyof typeof colorNameToHex];
    if (colorNameToHex[normalized as keyof typeof colorNameToHex]) return colorNameToHex[normalized as keyof typeof colorNameToHex];
    // If the value is a CSS color label without spaces (e.g., skyblue), use it directly
    if (/^[a-z]+$/.test(normalized)) return normalized;
    // fallback: return the original value and let the browser try to resolve it
    return val;
  };

  const hexToRgb = (hex: string) => {
    // Normalize shorthand hex
    const normalized = hex.replace('#', '');
    let r = 0, g = 0, b = 0;
    if (normalized.length === 3) {
      r = parseInt(normalized[0] + normalized[0], 16);
      g = parseInt(normalized[1] + normalized[1], 16);
      b = parseInt(normalized[2] + normalized[2], 16);
    } else if (normalized.length === 6) {
      r = parseInt(normalized.substring(0, 2), 16);
      g = parseInt(normalized.substring(2, 4), 16);
      b = parseInt(normalized.substring(4, 6), 16);
    }
    return { r, g, b };
  };

  const luminance = (r: number, g: number, b: number) => {
    // relative luminance formula adjusted for sRGB; output in 0..1
    const [rs, gs, bs] = [r, g, b].map((c) => {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const isLightColor = (cssColor: string) => {
    const normalized = cssColor.trim().toLowerCase();
    if (normalized.startsWith('#')) {
      try {
        const { r, g, b } = hexToRgb(normalized);
        return luminance(r, g, b) > 0.6; // threshold chosen as 0.6 -> light colors
      } catch (e) {
        return false;
      }
    }
    // Named color heuristics
    if (normalized.includes('white') || normalized.includes('cream') || normalized.includes('ivory') || normalized.includes('light')) return true;
    if (normalized.includes('black') || normalized.includes('navy') || normalized.includes('dark') || normalized.includes('brown')) return false;
    // fallback: if map contains an entry return computed luminance
    if (colorNameToHex[normalized]) {
      const { r, g, b } = hexToRgb(colorNameToHex[normalized]);
      return luminance(r, g, b) > 0.6;
    }
    // default: dark (so we use white text)
    return false;
  };

  // Check if user has measurements saved
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem('talla_user_measurements');
      setHasMeasurements(!!stored);
    }
  }, []);

  // Find variant based on selected options
  useEffect(() => {
    const variant = product.variants.find((v) =>
      v.selectedOptions.every(
        (option) => selectedOptions[option.name] === option.value,
      ),
    );

    if (variant && variant.id !== selectedVariant.id && onVariantChange) {
      onVariantChange(variant);
    }
  }, [product.variants, selectedOptions, selectedVariant.id, onVariantChange]);

  const handleOptionChange = (optionName: string, value: string) => {
    setSelectedOptions((prev) => ({ ...prev, [optionName]: value }));
  };

  const handleSizeRecommendation = (size: string) => {
    const sizeOption = product.options?.find(
      (opt) => opt.name.toLowerCase() === 'size',
    );

    if (sizeOption && sizeOption.values.includes(size)) {
      handleOptionChange('Size', size);
      setSizeRecOpen(false);
    }
  };

  const handleAddToCart = () => {
    setAddedToCart(true);
    setShowConfetti(true);
    window.setTimeout(() => {
      setAddedToCart(false);
      setShowConfetti(false);
    }, 800);
  };

  const lines: OptimisticCartLineInput[] = [
    {
      merchandiseId: selectedVariant.id,
      quantity: 1,
      // Hydrogen allows passing selectedVariant for optimistic UI
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      selectedVariant: selectedVariant as any,
    },
  ];

  // Optional images for horizontal scroll (if you pass them on PDPProduct)
  const images = (product as PDPProduct).images?.nodes ?? [];

  // No fallback similar products; we require server-side filter for >=2 tags overlap

  return (
    <div className="space-y-4 animate-fadein relative">
      {/* Success Ripple Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="animate-ripple-out bg-green-500 rounded-full opacity-20 w-32 h-32"></div>
        </div>
      )}

      {/* Product Images - Horizontal Scroll (mini gallery above buy box) */}
      {images.length > 0 && (
        <div
          className="flex gap-4 flex-wrap pb-2"
          style={{ scrollbarWidth: 'thin' }}
        >
          {images.map((img: any, idx: number) => (
            <div
              key={img.id || idx}
              className="flex h-[96px] min-w-[96px] items-center justify-center rounded-lg border border-gray-200 bg-gray-50"
              style={{
                boxShadow: '0 1px 4px 0 rgba(220,220,230,0.07)',
              }}
            >
              <img
                src={img.url}
                alt={img.altText || product.title}
                className="h-full w-full rounded-lg object-cover"
              />
            </div>
          ))}
        </div>
      )}

      {/* Vendor / Brand */}
      {product.vendor && (
        <div className="pb-2">
          <p className="text-xs uppercase tracking-wide text-gray-500">
            {product.vendor}
          </p>
        </div>
      )}
      {/* Brand size chart link */}
      {product.brandSizeChartImage && (
        <div className="pb-2">
          <button type="button" onClick={() => setBrandSizeChartOpen(true)} className="text-xs text-gray-600 underline hover:text-black">
            View Brand Size Chart
          </button>
        </div>
      )}

      {/* Title */}
      <h1 className="mb-2 text-lg font-medium text-gray-900">
        {product.title}
      </h1>

      {/* Price */}
      <div className="text-xl font-semibold text-gray-900 pb-3">
        <Money data={selectedVariant.price as any} />
      </div>

      {/* Product Metadata - Simple & Friendly */}
      <div className="space-y-2 py-2">
        {product.productType && (
          <div className="flex items-center gap-3 text-xs text-gray-600">
            <Tag size={12} className="opacity-50" />
            <span className="uppercase text-[10px] tracking-wide font-medium">Type:</span>
            <span>{product.productType}</span>
          </div>
        )}

        {product.tags && product.tags.length > 0 && (
          <div>
            <div className="flex items-center gap-3 text-xs text-gray-600 mb-2">
              <Tags size={12} className="opacity-50" />
              <span className="uppercase text-[10px] tracking-wide font-medium">Tags:</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {product.tags.slice(0, 5).map((tag, index) => {
                const tagLower = tag.toLowerCase();
                let Icon = Tag;
                let iconColor = '#6B7280';

                // Match icons to tag meanings
                if (tagLower.includes('denim') || tagLower.includes('jean')) {
                  Icon = Shirt;
                  iconColor = '#3B82F6';
                } else if (tagLower.includes('women') || tagLower.includes('woman') || tagLower.includes('female')) {
                  Icon = Users;
                  iconColor = '#EC4899';
                } else if (tagLower.includes('men') || tagLower.includes('male')) {
                  Icon = Users;
                  iconColor = '#3B82F6';
                } else if (tagLower.includes('summer') || tagLower.includes('sun')) {
                  Icon = Sun;
                  iconColor = '#F59E0B';
                } else if (tagLower.includes('eco') || tagLower.includes('organic') || tagLower.includes('sustainable')) {
                  Icon = Leaf;
                  iconColor = '#10B981';
                } else if (tagLower.includes('new') || tagLower.includes('trending') || tagLower.includes('hot')) {
                  Icon = Flame;
                  iconColor = '#EF4444';
                } else if (tagLower.includes('love') || tagLower.includes('favorite')) {
                  Icon = Heart;
                  iconColor = '#EF4444';
                } else if (tagLower.includes('wide') || tagLower.includes('leg')) {
                  Icon = Shirt;
                  iconColor = '#6B7280';
                } else if (tagLower.includes('zara') || tagLower.includes('brand')) {
                  Icon = Sparkles;
                  iconColor = '#8B5CF6';
                }

                return (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 px-2 py-0.5 rounded-md bg-gray-100 text-xs text-gray-700"
                  >
                    <Icon size={12} color={iconColor} strokeWidth={2} />
                    {tag}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Size Recommendation Banner */}
      {recommendedSize && (
      <div className="flex items-center gap-3 rounded-md bg-green-50 border border-green-200 py-2 px-3">
          <svg
            className="h-4 w-4 text-green-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-xs text-green-800">
            We recommend size <strong>{recommendedSize}</strong> for you
          </span>
        </div>
      )}

      {/* Prompt to get size recommendation */}
      {!hasMeasurements &&
        !recommendedSize &&
        product.options &&
        product.options.some((opt) => opt.name.toLowerCase() === 'size') && (
          <div className="flex items-center justify-between gap-3 rounded-md bg-gray-50 border border-gray-200 py-2 px-3">
            <div className="flex items-center gap-3">
              <svg
                className="h-4 w-4 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-xs text-gray-700">
                Not sure about your size?
              </span>
            </div>
            <SizeRecommendationPrompt
              onComplete={() => setHasMeasurements(true)}
            />
          </div>
        )}

      {/* Option Selectors - Simple & Friendly */}
      <div className="space-y-4 pt-3">
        {product.options &&
          product.options.length > 0 &&
          product.options.map((option) => (
            <div key={option.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-900">
                  {option.name}
                </label>

                {/* Size guide link for Size option */}
                {option.name.toLowerCase() === 'size' && (
                  <button
                    type="button"
                    onClick={() => setSizeRecOpen(!sizeRecOpen)}
                    className="px-4 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 hover:border-gray-400 rounded-full transition-all duration-200 hover:bg-gray-50"
                    aria-expanded={sizeRecOpen}
                  >
                    Size Guide
                  </button>
                )}
                {/* Size Chart button (from product metafield) */}
                {(product.sizeChartImage || product.brandSizeChartImage) && (
                  <button
                    type="button"
                    onClick={() => {
                      if (product.sizeChartImage) {
                        setChartSource('product');
                      } else if (product.brandSizeChartImage) {
                        setChartSource('brand');
                      }
                      setSizeChartOpen(true);
                    }}
                    className="px-4 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 hover:border-gray-400 rounded-full transition-all duration-200 hover:bg-gray-50"
                  >
                    Size Chart
                  </button>
                )}
                {product.brandSizeChartImage && (
                  <button
                    type="button"
                    onClick={() => setBrandSizeChartOpen(true)}
                    className="px-4 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 hover:border-gray-400 rounded-full transition-all duration-200 hover:bg-gray-50"
                  >
                    Brand Size Chart
                  </button>
                )}
              </div>

              {/* Options - Smaller, friendlier buttons */}
              <div className="flex flex-wrap gap-3">
                {option.values.map((value) => {
                  const isAvailable = product.variants.some(
                    (v) =>
                      v.availableForSale &&
                      v.selectedOptions.some(
                        (opt) =>
                          opt.name === option.name && opt.value === value,
                      ),
                  );
                  const isSelected = selectedOptions[option.name] === value;
                  const isColorOption = option.name.toLowerCase() === 'color';
                  const cssColor = isColorOption ? toHex(value) : undefined;
                  const textColorClass = cssColor ? (isLightColor(cssColor) ? 'text-gray-900' : 'text-white') : '';
                  const isRec = recommendedSize === value && option.name.toLowerCase() === 'size';

                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() =>
                        isAvailable &&
                        handleOptionChange(option.name, value)
                      }
                      disabled={!isAvailable}
                      className={(() => {
                        const base = 'px-5 py-3 text-sm font-medium rounded-full border transition-all duration-300 ease-out';
                        if (isColorOption) {
                          // for color options, rely on inline backgroundColor and vary the border and opacity
                          const border = isSelected ? 'border-gray-900 shadow-lg' : 'border-gray-200 hover:border-gray-400';
                          const selectedRing = isSelected ? (isLightColor(cssColor!) ? 'ring-2 ring-gray-900 ring-offset-2' : 'ring-2 ring-gray-900 ring-offset-2') : '';
                          const disabled = !isAvailable ? 'opacity-30 cursor-not-allowed filter grayscale line-through' : '';
                          const rec = isRec && !isSelected ? 'ring-2 ring-emerald-400 ring-offset-2' : '';
                          const classes = [base, border, disabled, selectedRing, rec, isSelected ? 'transform scale-105' : ''].filter(Boolean).join(' ');
                          return classes;
                        }
                        // Not a color option - soft, friendly styling
                        const classes = `${base} ${isSelected
                          ? 'bg-gray-900 text-white border-gray-900 shadow-lg transform scale-105 ring-2 ring-gray-900'
                          : isAvailable
                            ? 'bg-white text-gray-700 border-gray-200 hover:border-gray-400 hover:bg-gray-50'
                            : 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed line-through'
                        } ${isRec && !isSelected ? 'ring-2 ring-emerald-400 ring-offset-2' : ''}`;
                        return classes;
                      })()}
                      style={isColorOption ? ({ backgroundColor: cssColor } as React.CSSProperties) : undefined}
                      aria-label={`Select ${option.name.toLowerCase()} ${value}${
                        isRec ? ' (Recommended)' : ''
                      }`}
                      aria-pressed={isSelected}
                      aria-disabled={!isAvailable}
                    >
                      {isColorOption ? (
                        <span className={`inline-block min-w-[48px] text-center ${textColorClass}`}>
                          {value}
                        </span>
                      ) : (
                        value
                      )}
                      {isSelected && (
                        <span className="ml-2 inline-flex items-center text-sm text-white">
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </span>
                      )}
                      {isRec && !isSelected && <span className="ml-1 text-green-600">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
      </div>

      {/* Size Recommendation (collapsible panel) */}
      {sizeRecOpen && (
        <SizeRecommendation
          onRecommendation={handleSizeRecommendation}
          onClose={() => setSizeRecOpen(false)}
        />
      )}

      {/* Size Chart Modal / Viewer */}
      {sizeChartOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="max-w-4xl w-full">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold">{chartSource === 'brand' ? 'Brand Size Chart' : 'Size Chart'}</h4>
              <button onClick={() => { setSizeChartOpen(false); setChartSource(null); }} className="text-gray-600">Close</button>
            </div>
            <SizeChart imageUrl={chartSource === 'brand' ? product.brandSizeChartImage?.url : product.sizeChartImage?.url || product.brandSizeChartImage?.url} alt={chartSource === 'brand' ? product.brandSizeChartImage?.alt || 'Brand size chart' : product.sizeChartImage?.alt || product.brandSizeChartImage?.alt || 'Size chart'} />
          </div>
        </div>
      )}
      {brandSizeChartOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="max-w-4xl w-full">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold">Brand Size Chart</h4>
              <button onClick={() => setBrandSizeChartOpen(false)} className="text-gray-600">Close</button>
            </div>
            <SizeChart imageUrl={product.brandSizeChartImage?.url} alt={product.brandSizeChartImage?.alt || 'Brand size chart'} />
          </div>
        </div>
      )}

      {/* Add to Cart Button - Simple & Friendly */}
      <CartForm
        route="/cart"
        inputs={{ lines }}
        action={CartForm.ACTIONS.LinesAdd}
      >
        {(fetcher: FetcherWithComponents<any>) => {
          const isAdding = fetcher.state !== 'idle';

          return (
            <button
              type="submit"
              disabled={!selectedVariant.availableForSale || isAdding}
              onClick={handleAddToCart}
              className={`
                w-full rounded-full px-8 py-4 text-base font-semibold transition-all duration-200 ease-out relative overflow-hidden
                ${
                  selectedVariant.availableForSale && !isAdding
                    ? addedToCart
                      ? 'bg-green-600 text-white shadow-lg'
                      : 'bg-gray-900 text-white hover:bg-gray-800 shadow-md hover:shadow-lg active:scale-[0.98]'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }
              `}
              aria-label={
                isAdding
                  ? 'Adding to cart'
                  : selectedVariant.availableForSale
                    ? 'Add to cart'
                    : 'Sold out'
              }
            >
              <span className={`inline-flex items-center justify-center gap-2 ${addedToCart ? 'animate-fade-in-fast' : ''}`}>
                {isAdding
                  ? 'Adding...'
                  : addedToCart
                    ? (
                      <>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Added
                      </>
                    )
                    : selectedVariant.availableForSale
                      ? 'Add to Cart'
                      : 'Sold Out'}
              </span>
            </button>
          );
        }}
      </CartForm>

    </div>
  );
}
