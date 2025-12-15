import type { FetcherWithComponents } from '@remix-run/react';
import {
  CartForm,
  Money,
  type OptimisticCartLineInput,
} from '@shopify/hydrogen';
import React, { useEffect, useState } from 'react';

import SizeChart from './SizeChart';
import { SizeRecommendationPrompt } from './SizeRecommendationPrompt';
import type { PDPProduct, PDPVariant } from './ProductBuyBox';

interface ProductHeaderProps {
  product: PDPProduct;
  selectedVariant: PDPVariant;
  recommendedSize?: string | null;
  onOptionChange: (optionName: string, value: string) => void;
  selectedOptions: Record<string, string>;
}

export function ProductHeader({
  product,
  selectedVariant,
  recommendedSize,
  onOptionChange,
  selectedOptions,
}: ProductHeaderProps) {
  const [sizeRecOpen, setSizeRecOpen] = useState(false);
  const [sizeChartOpen, setSizeChartOpen] = useState(false);
  const [brandSizeChartOpen, setBrandSizeChartOpen] = useState(false);
  const [chartSource, setChartSource] = useState<'product' | 'brand' | null>(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showNotifyForm, setShowNotifyForm] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState('');
  const [notifySubmitted, setNotifySubmitted] = useState(false);

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

  const handleSizeRecommendation = (size: string) => {
    const sizeOption = product.options?.find(
      (opt) => opt.name.toLowerCase() === 'size',
    );

    if (sizeOption && sizeOption.values.includes(size)) {
      onOptionChange('Size', size);
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
      selectedVariant: selectedVariant as any,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white">
      {/* Success Ripple Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="animate-ripple-out bg-green-500 rounded-full opacity-20 w-32 h-32"></div>
        </div>
      )}

      <div className="px-3 py-2">
        {/* Title */}
        <h1
          className="text-gray-900 leading-tight mb-1"
          style={{
            fontSize: '10px',
            fontWeight: '400',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}
        >
          {product.title}
        </h1>

        {/* Price */}
        <div
          className="text-gray-900 mb-2"
          style={{ fontSize: '10px', fontWeight: '400' }}
        >
          <Money data={selectedVariant.price as any} />
        </div>

        {/* Option Selectors */}
        <div className="flex flex-wrap gap-1">
          {product.options &&
            product.options.length > 0 &&
            product.options.map((option) => (
              <React.Fragment key={option.name}>
                {/* Options - inline with no label */}
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

                  // Parse color value for color swatches
                  let colorData: { colors: string[]; displayName: string } | null = null;
                  let isMultiColor = false;
                  let singleColor: string | undefined = undefined;
                  let multiColorGradient: string | undefined = undefined;

                  if (isColorOption) {
                    try {
                      colorData = parseColorValue(value);
                      isMultiColor = colorData.colors.length > 1;

                      // For single color
                      if (colorData.colors.length === 1) {
                        singleColor = toHex(colorData.colors[0]);
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
                      colorData = { colors: [value], displayName: value };
                      singleColor = '#6b7280';
                    }
                  }

                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() =>
                        isAvailable &&
                        onOptionChange(option.name, value)
                      }
                      disabled={!isAvailable}
                      className={(() => {
                        if (isColorOption) {
                          // Color swatch - small square with border
                          const base = 'w-5 h-5 rounded-sm border transition-all flex-shrink-0';
                          const border = isSelected ? 'border-black border-2' : 'border-gray-400';
                          const disabled = !isAvailable ? 'opacity-30 cursor-not-allowed' : 'hover:border-black';
                          return `${base} ${border} ${disabled}`.trim();
                        } else {
                          // Size button - small square with text perfectly centered
                          const base = 'w-5 h-5 flex items-center justify-center text-[9px] font-bold border transition-all';
                          const selected = isSelected ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-300';
                          const disabled = !isAvailable ? 'opacity-30 cursor-not-allowed line-through' : 'hover:border-black';
                          const rec = isRec && !isSelected ? 'ring-1 ring-emerald-400' : '';
                          return `${base} ${selected} ${disabled} ${rec}`.trim();
                        }
                      })()}
                      style={
                        isColorOption
                          ? isMultiColor
                            ? ({ backgroundImage: multiColorGradient } as React.CSSProperties)
                            : ({ backgroundColor: singleColor } as React.CSSProperties)
                          : ({
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              textAlign: 'center',
                              lineHeight: '1'
                            } as React.CSSProperties)
                      }
                      aria-label={`Select ${option.name.toLowerCase()} ${value}${
                        isRec ? ' (Recommended)' : ''
                      }`}
                      aria-pressed={isSelected}
                      aria-disabled={!isAvailable}
                      title={isColorOption ? colorData?.displayName : value}
                    >
                      {!isColorOption && value}
                    </button>
                  );
                })}
              </React.Fragment>
            ))}
        </div>
      </div>

      {/* Size Chart Modal */}
      {sizeChartOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="max-w-4xl w-full">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-white">{chartSource === 'brand' ? 'Brand Size Chart' : 'Size Chart'}</h4>
              <button onClick={() => { setSizeChartOpen(false); setChartSource(null); }} className="text-white hover:text-gray-300">Close</button>
            </div>
            <SizeChart imageUrl={chartSource === 'brand' ? product.brandSizeChartImage?.url : product.sizeChartImage?.url || product.brandSizeChartImage?.url} alt={chartSource === 'brand' ? product.brandSizeChartImage?.alt || 'Brand size chart' : product.sizeChartImage?.alt || product.brandSizeChartImage?.alt || 'Size chart'} />
          </div>
        </div>
      )}
    </div>
  );
}
