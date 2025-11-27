import type { FetcherWithComponents } from '@remix-run/react';
import {
  CartForm,
  Money,
  type OptimisticCartLineInput,
} from '@shopify/hydrogen';
import { Tag, Tags, Sparkles, Shirt, Users, Sun, Leaf, Heart, Flame } from 'lucide-react';
import { useEffect, useState } from 'react';

import { SizeRecommendation } from './SizeRecommendation';
import { SizeRecommendationPrompt } from './SizeRecommendationPrompt';

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
  similarProducts?: SimilarProduct[];
}

export function ProductBuyBox({
  product,
  selectedVariant,
  onVariantChange,
  recommendedSize,
  similarProducts = [],
}: ProductBuyBoxProps) {
  const [sizeRecOpen, setSizeRecOpen] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [showSizePrompt, setShowSizePrompt] = useState(false); // reserved if you want to show a separate prompt later
  const [hasMeasurements, setHasMeasurements] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(
    () => {
      const initial: Record<string, string> = {};
      selectedVariant.selectedOptions.forEach((option) => {
        initial[option.name] = option.value;
      });
      return initial;
    },
  );

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
    window.setTimeout(() => setAddedToCart(false), 2000);
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

  return (
    <div className="space-y-4 animate-fadein">
      {/* Product Images - Horizontal Scroll (mini gallery above buy box) */}
      {images.length > 0 && (
        <div
          className="flex gap-3 flex-wrap pb-2"
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
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Tag size={12} className="opacity-50" />
            <span className="uppercase text-[10px] tracking-wide font-medium">Type:</span>
            <span>{product.productType}</span>
          </div>
        )}

        {product.tags && product.tags.length > 0 && (
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
              <Tags size={12} className="opacity-50" />
              <span className="uppercase text-[10px] tracking-wide font-medium">Tags:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
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
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 text-xs text-gray-700"
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
        <div className="flex items-center gap-2 rounded-md bg-green-50 border border-green-200 py-2 px-3">
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
          <div className="flex items-center justify-between gap-2 rounded-md bg-gray-50 border border-gray-200 py-2 px-3">
            <div className="flex items-center gap-2">
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
                    className="text-xs text-gray-500 hover:text-gray-900 transition-colors"
                    aria-expanded={sizeRecOpen}
                  >
                    Size Guide
                  </button>
                )}
              </div>

              {/* Options - Smaller, friendlier buttons */}
              <div className="flex flex-wrap gap-2">
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
                      className={`
                        px-4 py-2 text-sm rounded-md border transition-all
                        ${
                          isSelected
                            ? 'bg-black text-white border-black'
                            : isAvailable
                              ? 'bg-white text-gray-900 border-gray-300 hover:border-gray-900'
                              : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed line-through'
                        }
                        ${isRec && !isSelected ? 'ring-2 ring-green-400' : ''}
                      `}
                      aria-label={`Select ${option.name.toLowerCase()} ${value}${
                        isRec ? ' (Recommended)' : ''
                      }`}
                      aria-pressed={isSelected}
                      aria-disabled={!isAvailable}
                    >
                      {value}
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
                w-full rounded-md px-6 py-3 text-sm font-medium transition-all
                ${
                  selectedVariant.availableForSale && !isAdding
                    ? 'bg-black text-white hover:bg-gray-800'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
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
              {isAdding
                ? 'Adding...'
                : addedToCart
                  ? '✓ Added to Cart'
                  : selectedVariant.availableForSale
                    ? 'Add to Cart'
                    : 'Sold Out'}
            </button>
          );
        }}
      </CartForm>

    </div>
  );
}
