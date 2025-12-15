import type { FetcherWithComponents } from '@remix-run/react';
import {
  CartForm,
  Money,
  type OptimisticCartLineInput,
} from '@shopify/hydrogen';
import { Flame, Heart, Leaf, Shirt, Sparkles, Sun, Tag, Tags, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';

import SizeChart from './SizeChart';
import { SizeRecommendationPrompt } from './SizeRecommendationPrompt';
import { useOptionalAnalytics } from '~/lib/analytics/AnalyticsProvider';

export interface PDPVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  selectedOptions: { name: string; value: string }[];
  price: { amount: string; currencyCode: string };
  sku?: string;
}

interface SizeDimensions {
  [size: string]: {
    chest?: [number, number] | number;
    waist?: [number, number] | number;
    hips?: [number, number] | number;
    length?: [number, number] | number;
    arm?: [number, number] | number;
    shoulder?: [number, number] | number;
  };
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
  // optional size dimensions for smart recommendation
  sizeDimensions?: SizeDimensions | null;
  // optional fabric type for smart recommendation
  fabricType?: 'cotton' | 'cotton_blend' | 'jersey_knit' | 'highly_elastic';
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
  recommendedSize?: string | null;
}

export function ProductBuyBox({
  product,
  selectedVariant,
  recommendedSize,
}: ProductBuyBoxProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sizeRecOpen, setSizeRecOpen] = useState(false);
  const [sizeChartOpen, setSizeChartOpen] = useState(false);
  const [brandSizeChartOpen, setBrandSizeChartOpen] = useState(false);
  // which chart to show in the main chart modal: 'product' | 'brand'
  const [chartSource, setChartSource] = useState<'product' | 'brand' | null>(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const [showSizePrompt, setShowSizePrompt] = useState(false); // reserved if you want to show a separate prompt later
  const [hasMeasurements, setHasMeasurements] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showNotifyForm, setShowNotifyForm] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState('');
  const [notifySubmitted, setNotifySubmitted] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(
    () => {
      const initial: Record<string, string> = {};
      selectedVariant.selectedOptions.forEach((option) => {
        initial[option.name] = option.value;
      });
      return initial;
    },
  );

  // Analytics
  const analytics = useOptionalAnalytics();

  // Track product view
  useEffect(() => {
    if (analytics) {
      analytics.trackEvent('product_view', {
        productId: product.id,
        productTitle: product.title,
        productHandle: product.handle,
        variantId: selectedVariant?.id,
        variantTitle: selectedVariant?.title,
        price: selectedVariant?.price.amount,
        availableForSale: selectedVariant?.availableForSale,
      });
    }
  }, [analytics, product.id, product.title, product.handle, selectedVariant?.id, selectedVariant?.title, selectedVariant?.price.amount, selectedVariant?.availableForSale]);

  // Comprehensive color name to hex map
  const colorNameToHex: Record<string, string> = {
    // Basic colors
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
    beige: '#f5f5dc',
    cream: '#fffdd0',
    ivory: '#fffff0',

    // Light variants
    'light grey': '#d1d5db',
    'light gray': '#d1d5db',
    lightgrey: '#d1d5db',
    lightgray: '#d1d5db',
    'light blue': '#93c5fd',
    lightblue: '#93c5fd',
    'light pink': '#fbbf24',
    lightpink: '#fbbf24',
    'light green': '#86efac',
    lightgreen: '#86efac',

    // Dark variants
    'dark grey': '#4b5563',
    'dark gray': '#4b5563',
    darkgrey: '#4b5563',
    darkgray: '#4b5563',
    'dark blue': '#1e3a8a',
    darkblue: '#1e3a8a',
    'dark green': '#065f46',
    darkgreen: '#065f46',

    // Sky and other shades
    skyblue: '#38bdf8',
    'sky blue': '#38bdf8',
    charcoal: '#36454f',
    maroon: '#800000',
    olive: '#808000',
    teal: '#14b8a6',
    turquoise: '#06b6d4',
    lavender: '#e9d5ff',
    mint: '#d1fae5',
    coral: '#fb7185',
    salmon: '#fb923c',
    khaki: '#f0e68c',
    burgundy: '#800020',

    // Additional common variants
    silver: '#c0c0c0',
    gold: '#ffd700',
    rose: '#ff66b2',
    peach: '#ffdab9',
    azure: '#007fff',
    indigo: '#4f46e5',
    violet: '#7c3aed',
    magenta: '#d946ef',
    cyan: '#06b6d4',
    lime: '#84cc16',
    emerald: '#10b981',
    amber: '#f59e0b',
    slate: '#64748b',
    zinc: '#71717a',
    stone: '#78716c',
    neutral: '#737373',
    'off white': '#fafafa',
    offwhite: '#fafafa',
    'off-white': '#fafafa',
    ecru: '#c2b280',
  };

  // Parse multi-color values (e.g., "WHITE X LIGHT GREY")
  const parseColorValue = (val: string): { colors: string[]; displayName: string } => {
    // Look for explicit separators: X, x, /, |, +, & (with optional spaces around them)
    const separatorRegex = /\s*[xX\/\|+&]\s*/;

    // Check if the value contains an explicit separator
    if (separatorRegex.test(val)) {
      const parts = val.split(separatorRegex)
        .map(p => p.trim())
        .filter(Boolean);

      return {
        colors: parts,
        displayName: val.toUpperCase() // Keep original formatting for display
      };
    }

    // Single color - format nicely
    return {
      colors: [val],
      displayName: val
        .split(/\s+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
    };
  };

  const toHex = (val: string) => {
    const key = val.trim().toLowerCase();
    if (key.startsWith('#')) return key; // already a hex value

    // Normalize: remove spaces/hyphens/underscores
    const normalized = key.replace(/\s+|[-_]/g, '');

    // Direct match
    if (colorNameToHex[key]) return colorNameToHex[key];
    if (colorNameToHex[normalized]) return colorNameToHex[normalized];

    // Try CSS color names (browser built-in)
    if (/^[a-z]+$/.test(normalized)) return normalized;

    // Fallback to gray for unknown colors
    return '#6b7280';
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

    // Handle hex colors
    if (normalized.startsWith('#')) {
      try {
        const { r, g, b } = hexToRgb(normalized);
        return luminance(r, g, b) > 0.6; // threshold chosen as 0.6 -> light colors
      } catch (e) {
        return false;
      }
    }

    // Named color heuristics - specific checks first
    const lightColors = ['white', 'cream', 'ivory', 'light', 'beige', 'tan', 'khaki', 'yellow', 'pale', 'pastel'];
    const darkColors = ['black', 'navy', 'dark', 'brown', 'charcoal', 'maroon', 'burgundy'];

    // Check if any light color keyword is present
    if (lightColors.some(lc => normalized.includes(lc))) return true;

    // Check if any dark color keyword is present
    if (darkColors.some(dc => normalized.includes(dc))) return false;

    // fallback: if map contains an entry, compute luminance
    if (colorNameToHex[normalized]) {
      const { r, g, b } = hexToRgb(colorNameToHex[normalized]);
      return luminance(r, g, b) > 0.6;
    }

    // Try removing spaces/hyphens for compound names
    const compactKey = normalized.replace(/[\s-_]+/g, '');
    if (colorNameToHex[compactKey]) {
      const { r, g, b } = hexToRgb(colorNameToHex[compactKey]);
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

  // Sync local selectedOptions state with selectedVariant prop changes
  // Only sync when the variant ID actually changes (not on every option change)
  useEffect(() => {
    const newSelectedOptions: Record<string, string> = {};
    selectedVariant.selectedOptions.forEach((option) => {
      newSelectedOptions[option.name] = option.value;
    });
    setSelectedOptions(newSelectedOptions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVariant.id]); // Only depend on variant ID, not the full object

  const handleOptionChange = (optionName: string, value: string) => {
    // Update local state for immediate UI feedback
    setSelectedOptions((prev) => ({ ...prev, [optionName]: value }));

    // Update URL search params to trigger Hydrogen's variant selection
    const newParams = new URLSearchParams(searchParams);
    newParams.set(optionName, value);
    setSearchParams(newParams, {
      replace: true,
      preventScrollReset: true,
    });
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

    // Track add to cart event
    if (analytics) {
      analytics.trackEvent('add_to_cart', {
        productId: product.id,
        productTitle: product.title,
        productHandle: product.handle,
        variantId: selectedVariant.id,
        variantTitle: selectedVariant.title,
        price: selectedVariant.price.amount,
        quantity: 1,
      });
    }

    window.setTimeout(() => {
      setAddedToCart(false);
      setShowConfetti(false);
    }, 800);
  };

  const handleNotifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!notifyEmail || !notifyEmail.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }

    try {
      // Send notification request to API
      const response = await fetch('/api/restock-notify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: notifyEmail,
          productId: product.id,
          variantId: selectedVariant.id,
          productTitle: product.title,
          variantTitle: selectedVariant.title,
        }),
      });

      const data = await response.json() as any;

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit notification request');
      }

      // Success!
      setNotifySubmitted(true);
      setNotifyEmail('');

      // Also save to localStorage as backup
      try {
        const localNotifications = JSON.parse(
          localStorage.getItem('talla_restock_notifications') || '[]'
        ) as any[];
        localNotifications.push(data.notification);
        localStorage.setItem('talla_restock_notifications', JSON.stringify(localNotifications));
      } catch (err) {
        // Ignore localStorage errors
        console.warn('Failed to save to localStorage:', err);
      }

      // Reset after 3 seconds
      setTimeout(() => {
        setShowNotifyForm(false);
        setNotifySubmitted(false);
      }, 3000);

    } catch (err) {
      console.error('Failed to submit notification request:', err);
      alert('Something went wrong. Please try again.');
    }
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
    <div className="space-y-4 animate-fadein relative w-full max-w-3xl">
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
      <h1 className="mb-2 text-xl font-semibold text-gray-900 break-words leading-tight">
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

                {/* Size guide button - only show once for Size option */}
                {option.name.toLowerCase() === 'size' && (
                  <button
                    type="button"
                    onClick={() => {
                      // Open product size chart if available, otherwise open brand chart, else open size recommendation
                      if (product.sizeChartImage) {
                        setChartSource('product');
                        setSizeChartOpen(true);
                      } else if (product.brandSizeChartImage) {
                        setChartSource('brand');
                        setSizeChartOpen(true);
                      } else {
                        setSizeRecOpen(!sizeRecOpen);
                      }
                    }}
                    className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:border-gray-900 hover:bg-gray-50 rounded-full transition-all duration-200 shadow-sm"
                    aria-expanded={sizeRecOpen}
                  >
                    Size Guide
                  </button>
                )}
              </div>

              {/* Options - Smaller, friendlier buttons */}
              <div className="flex flex-wrap gap-3 ml-3">
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
                  const isRec = recommendedSize === value && option.name.toLowerCase() === 'size';

                  // Parse color value for multi-color support with error handling
                  let colorData: { colors: string[]; displayName: string } | null = null;
                  let isMultiColor = false;
                  let singleColor: string | undefined = undefined;
                  let textColorClass = '';
                  let multiColorGradient: string | undefined = undefined;

                  if (isColorOption) {
                    try {
                      colorData = parseColorValue(value);
                      isMultiColor = colorData.colors.length > 1;

                      // For single color
                      if (colorData.colors.length === 1) {
                        singleColor = toHex(colorData.colors[0]);
                        textColorClass = isLightColor(singleColor) ? 'text-gray-900' : 'text-white';
                      }

                      // For multi-color gradient
                      if (isMultiColor && colorData) {
                        const colors = colorData.colors;
                        const colorsLength = colors.length;
                        multiColorGradient = `linear-gradient(to right, ${colors.map((c, idx) => {
                          const hex = toHex(c);
                          const pct1 = (idx / colorsLength) * 100;
                          const pct2 = ((idx + 1) / colorsLength) * 100;
                          return `${hex} ${pct1}%, ${hex} ${pct2}%`;
                        }).join(', ')})`;
                      }
                    } catch (err) {
                      // Fallback to simple gray if parsing fails
                      colorData = { colors: [value], displayName: value };
                      singleColor = '#6b7280';
                      textColorClass = 'text-white';
                    }
                  }

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
                        const base = 'px-5 py-3 text-sm font-medium rounded-full border transition-all duration-300 ease-out relative overflow-hidden';
                        if (isColorOption) {
                          // for color options, rely on inline backgroundColor and vary the border and opacity
                          const border = isSelected ? 'border-gray-900 shadow-lg' : 'border-gray-200 hover:border-gray-400';
                          const selectedRing = isSelected ? 'ring-2 ring-gray-900 ring-offset-2' : '';
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
                      style={
                        isColorOption
                          ? isMultiColor
                            ? ({ backgroundImage: multiColorGradient } as React.CSSProperties)
                            : ({ backgroundColor: singleColor } as React.CSSProperties)
                          : undefined
                      }
                      aria-label={`Select ${option.name.toLowerCase()} ${value}${
                        isRec ? ' (Recommended)' : ''
                      }`}
                      aria-pressed={isSelected}
                      aria-disabled={!isAvailable}
                    >
                      {isColorOption ? (
                        <span className={`inline-block min-w-[96px] text-center font-semibold relative z-10 ${isMultiColor ? 'text-gray-900 bg-white/90 px-2 py-1 rounded-md' : textColorClass}`}>
                          {colorData?.displayName}
                        </span>
                      ) : (
                        value
                      )}
                      {isSelected && (
                        <span className={`ml-2 inline-flex items-center text-sm ${isMultiColor ? 'text-gray-900' : 'text-white'}`}>
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

              {/* Size Recommendation - Show inline right under size buttons */}
              {option.name.toLowerCase() === 'size' && sizeRecOpen && (
                <div className="mt-4">
                  <SizeRecommendationPrompt
                    mode="inline"
                    onRecommendation={handleSizeRecommendation}
                    onComplete={() => setSizeRecOpen(false)}
                    productSizeDimensions={product.sizeDimensions ?? undefined}
                    productType={product.productType ?? undefined}
                    tags={product.tags ?? undefined}
                    vendor={product.vendor ?? undefined}
                    productFabricType={product.fabricType ?? undefined}
                  />
                </div>
              )}
            </div>
          ))}
      </div>

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

      {/* Out of Stock Banner */}
      {!selectedVariant.availableForSale && (
        <div className="rounded-xl border-2 border-red-200 bg-red-50 p-4 mb-4">
          <div className="flex items-start gap-3">
            <svg className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-900 mb-1">This item is currently sold out</h3>
              <p className="text-xs text-red-700 mb-3">
                The selected size/color combination is not available right now.
              </p>

              {!showNotifyForm && !notifySubmitted && (
                <button
                  type="button"
                  onClick={() => setShowNotifyForm(true)}
                  className="text-xs font-semibold text-red-700 hover:text-red-900 underline transition-colors"
                >
                  Notify me when available
                </button>
              )}

              {showNotifyForm && !notifySubmitted && (
                <form onSubmit={handleNotifySubmit} className="mt-3 space-y-2">
                  <input
                    type="email"
                    value={notifyEmail}
                    onChange={(e) => setNotifyEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="w-full px-3 py-2 text-sm border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                    >
                      Notify Me
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowNotifyForm(false);
                        setNotifyEmail('');
                      }}
                      className="px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {notifySubmitted && (
                <div className="mt-3 flex items-center gap-2 text-green-700">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm font-medium">
                    Thanks! We'll notify you when this item is back in stock.
                  </span>
                </div>
              )}
            </div>
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
