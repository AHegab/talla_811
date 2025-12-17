import {
  Money,
  type OptimisticCartLineInput
} from '@shopify/hydrogen';
import React, { useEffect, useRef, useState } from 'react';

import { AddToCartButton } from './AddToCartButton';
import type { PDPProduct, PDPVariant } from './ProductBuyBox';
import SizeChart from './SizeChart';
import { SizeRecommendationPrompt } from './SizeRecommendationPrompt';

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

  // Track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef(true);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      // Clear all timeouts on unmount
      timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      timeoutsRef.current = [];
    };
  }, []);

  // Comprehensive color name to hex map
  const colorNameToHex: Record<string, string> = {
    // Basic colors
    navy: '#0b3d91',
    black: '#000000',
    white: '#ffffff',
    red: '#dc2626',
    blue: '#3b82f6',
    green: '#10b981',
    yellow: '#f59e0b',
    gray: '#6b7280',
    grey: '#6b7280',
    pink: '#ec4899',
    purple: '#8b5cf6',
    brown: '#8b4513',
    tan: '#d2b48c',
    orange: '#f97316',
    beige: '#f5f5dc',
    cream: '#fffdd0',
    ivory: '#fffff0',

    // Reds and Burgundy shades
    burgundy: '#800020',
    'wine red': '#722f37',
    winered: '#722f37',
    'wine-red': '#722f37',
    wine: '#722f37',
    crimson: '#dc143c',
    scarlet: '#ff2400',
    ruby: '#e0115f',
    garnet: '#733635',
    merlot: '#73343a',
    oxblood: '#4a0000',
    'dark red': '#8b0000',
    darkred: '#8b0000',
    'deep red': '#850101',
    deepred: '#850101',

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
    'light brown': '#cd853f',
    lightbrown: '#cd853f',

    // Dark variants
    'dark grey': '#4b5563',
    'dark gray': '#4b5563',
    darkgrey: '#4b5563',
    darkgray: '#4b5563',
    'dark blue': '#1e3a8a',
    darkblue: '#1e3a8a',
    'dark green': '#065f46',
    darkgreen: '#065f46',
    'dark brown': '#654321',
    darkbrown: '#654321',

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
    mustard: '#ffdb58',
    rust: '#b7410e',
    copper: '#b87333',
    bronze: '#cd7f32',
    camel: '#c19a6b',
    mocha: '#967969',
    chocolate: '#d2691e',
    coffee: '#6f4e37',
    espresso: '#4e3629',
    taupe: '#b38b6d',

    // Additional bag colors
    'cracked black': '#1a1a1a',
    crackedblack: '#1a1a1a',
    'bloody red': '#8b0000',
    bloodyred: '#8b0000',
    pistachio: '#93c572',
    'caramel brown': '#c68642',
    caramelbrown: '#c68642',
    'olive stone': '#6b705c',
    olivestone: '#6b705c',
    'glossy brown': '#5c4033',
    glossybrown: '#5c4033',
    'oat milk': '#e6dcc8',
    oatmilk: '#e6dcc8',
    'black truffle': '#2e2823',
    blacktruffle: '#2e2823',
    pastrami: '#8b6f47',
    'retro red': '#c41e3a',
    retrored: '#c41e3a',
    'forest green': '#228b22',
    forestgreen: '#228b22',
    'diamond black': '#000000',
    diamondblack: '#000000',
    'dark chocolate': '#4a2c2a',
    darkchocolate: '#4a2c2a',
    'cherry red': '#d2042d',
    cherryred: '#d2042d',
    'wood brown': '#704214',
    woodbrown: '#704214',
    havan: '#d2a679',
    'lime green': '#32cd32',
    limegreen: '#32cd32',
    'turquoise blue': '#40e0d0',
    turquoiseblue: '#40e0d0',
  };

  // Parse multi-color values (e.g., "WHITE X LIGHT GREY")
  const parseColorValue = (val: string): { colors: string[]; displayName: string } => {
    // Look for explicit separators: X, x, /, |, +, & (with optional spaces around them)
    const separatorRegex = /\s*[xX\/\|+&]\s*/;

    // Check if the value contains an explicit separator
    if (separatorRegex.test(val)) {
      const parts = val
        .split(separatorRegex)
        .map((p) => p.trim())
        .filter(Boolean);

      return {
        colors: parts,
        displayName: val.toUpperCase(), // Keep original formatting for display
      };
    }

    // Single color - format nicely
    return {
      colors: [val],
      displayName: val
        .split(/\s+/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' '),
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
    if (lightColors.some((lc) => normalized.includes(lc))) return true;

    // Check if any dark color keyword is present
    if (darkColors.some((dc) => normalized.includes(dc))) return false;

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
    const sizeOption = product.options?.find((opt) => opt.name.toLowerCase() === 'size');

    if (sizeOption && sizeOption.values.includes(size)) {
      onOptionChange('Size', size);
      setSizeRecOpen(false);
    }
  };

  const handleAddToCart = () => {
    if (!isMountedRef.current) return;
    
    setAddedToCart(true);
    setShowConfetti(true);
    
    const timeout = setTimeout(() => {
      if (isMountedRef.current) {
        setAddedToCart(false);
        setShowConfetti(false);
      }
    }, 800);
    
    timeoutsRef.current.push(timeout);
  };

  const handleNotifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!notifyEmail || !notifyEmail.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }

    const abortController = new AbortController();

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
        signal: abortController.signal,
      });

      const data = (await response.json()) as any;

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit notification request');
      }

      // Only update state if component is still mounted
      if (!isMountedRef.current) return;

      // Success!
      setNotifySubmitted(true);
      setNotifyEmail('');

      // Also save to localStorage as backup
      try {
        const localNotifications = JSON.parse(
          localStorage.getItem('talla_restock_notifications') || '[]',
        ) as any[];
        localNotifications.push(data.notification);
        localStorage.setItem('talla_restock_notifications', JSON.stringify(localNotifications));
      } catch (err) {
        // Ignore localStorage errors
        console.warn('Failed to save to localStorage:', err);
      }

      // Reset after 3 seconds
      const timeout = setTimeout(() => {
        if (isMountedRef.current) {
          setShowNotifyForm(false);
          setNotifySubmitted(false);
        }
      }, 3000);
      
      timeoutsRef.current.push(timeout);
    } catch (err: any) {
      // Ignore abort errors
      if (err.name === 'AbortError') return;
      
      console.error('Failed to submit notification request:', err);
      if (isMountedRef.current) {
        alert('Something went wrong. Please try again.');
      }
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
    <>
      {/* Size Recommendation Modal - Popup Style */}
      {sizeRecOpen && (
        <div 
          className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 overflow-y-auto"
          style={{
            zIndex: 99999999,
          }}
        >
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-lg z-10">
              <h3 className="text-lg font-semibold text-gray-900">Size Recommendation</h3>
              <button
                onClick={() => setSizeRecOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              {/* Size Chart Table */}
              {product.sizeDimensions && Object.keys(product.sizeDimensions).length > 0 && (
                <div className="mb-6">
                  <h4 className="text-base font-semibold text-gray-900 mb-4">Size Chart</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-900">Size</th>
                          {product.sizeDimensions[Object.keys(product.sizeDimensions)[0]] &&
                            Object.keys(product.sizeDimensions[Object.keys(product.sizeDimensions)[0]]).map((measurement) => (
                              <th key={measurement} className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-900">
                                {measurement.charAt(0).toUpperCase() + measurement.slice(1)}
                              </th>
                            ))}
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(product.sizeDimensions).map(([size, measurements]: [string, any]) => (
                          <tr key={size} className="hover:bg-gray-50">
                            <td className="border border-gray-300 px-4 py-2 text-sm font-medium text-gray-900">{size}</td>
                            {Object.entries(measurements).map(([key, value]: [string, any]) => (
                              <td key={key} className="border border-gray-300 px-4 py-2 text-sm text-gray-700">
                                {value}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4 text-xs text-gray-500">
                    * All measurements are in centimeters (cm)
                  </div>
                  <div className="border-t border-gray-200 my-6"></div>
                </div>
              )}
              
              <SizeRecommendationPrompt
                onComplete={() => setSizeRecOpen(false)}
                onRecommendation={handleSizeRecommendation}
                productSizeDimensions={product.sizeDimensions}
                productType={product.productType}
                tags={product.tags}
                vendor={product.vendor}
                mode="modal"
              />
            </div>
          </div>
        </div>
      )}

      <div
      className="product-header-fixed bg-white border-t border-gray-200"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        width: '100vw',
        maxWidth: '100vw',
        zIndex: 999999,
        boxShadow: '0 -1px 1px rgba(0,0,0,0.03)',
        transform: 'none',
        willChange: 'auto',
      }}
    >
      {/* Success Ripple Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="animate-ripple-out bg-green-500 rounded-full opacity-20 w-32 h-32"></div>
        </div>
      )}

      <div className="px-3 py-0.5 pb-safe">
        {/* Header Top Row with Title and Size Guide Button */}
        <div className="flex items-start justify-between mb-0">
          {/* Title */}
          <h1
            className="text-gray-900 leading-tight flex-1"
            style={{
              fontSize: '13px',
              fontWeight: '400',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            {product.title}
          </h1>
          
          {/* SIZE GUIDE Button - only show if product has size options */}
          {product.options?.some(option => option.name.toLowerCase() === 'size') && (
            <button
              onClick={() => setSizeRecOpen(true)}
              className="bg-black text-white font-semibold text-[6px] px-1 py-0.5 square-sm hover:bg-gray-800 transition-all uppercase tracking-wide ml-2 flex-shrink-0"
              style={{ padding: '2px 6px' }}
            >
              SIZE GUIDE
            </button>
          )}
        </div>

        {/* Price */}
        <div className="text-gray-900" style={{ fontSize: '16px', fontWeight: '400' }}>
          <Money data={selectedVariant.price as any} />
        </div>

        {/* Option Selectors - Sizes first, then Colors below */}
        <div className="flex flex-col gap-0.5">
          {/* Size Options */}
          {product.options &&
            product.options.length > 0 &&
            product.options
              .filter((option) => option.name.toLowerCase() !== 'color')
              .map((option) => (
                <div key={option.name} className="flex flex-wrap gap-1">
                  {option.values.map((value) => {
                    const isAvailable = product.variants.some(
                      (v) =>
                        v.availableForSale &&
                        v.selectedOptions.some((opt) => opt.name === option.name && opt.value === value),
                    );
                    const isSelected = selectedOptions[option.name] === value;
                    const isRec = recommendedSize === value && option.name.toLowerCase() === 'size';

                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => isAvailable && onOptionChange(option.name, value)}
                        disabled={!isAvailable}
                        className={(() => {
                          // Size button - small square with centered text
                          const base = 'w-3.5 h-3.5 flex items-center justify-center border transition-all flex-shrink-0 text-[6px] leading-none font-bold';
                          const selected = isSelected
                            ? 'bg-black text-white border-black'
                            : 'bg-white text-black border-gray-300';
                          const disabled = !isAvailable
                            ? 'opacity-30 cursor-not-allowed line-through'
                            : 'hover:border-black';
                          const rec = isRec && !isSelected ? 'ring-1 ring-emerald-400' : '';
                          return `${base} ${selected} ${disabled} ${rec}`.trim();
                        })()}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        aria-label={`Select ${option.name.toLowerCase()} ${value}${isRec ? ' (Recommended)' : ''}`}
                        aria-pressed={isSelected}
                        aria-disabled={!isAvailable}
                      >
                        {value}
                      </button>
                    );
                  })}
                </div>
              ))}

          {/* Color Options */}
          {product.options &&
            product.options.length > 0 &&
            product.options
              .filter((option) => option.name.toLowerCase() === 'color')
              .map((option) => (
                <div key={option.name} className="flex flex-wrap gap-1">
                  {option.values.map((value) => {
                    const isAvailable = product.variants.some(
                      (v) =>
                        v.availableForSale &&
                        v.selectedOptions.some((opt) => opt.name === option.name && opt.value === value),
                    );
                    const isSelected = selectedOptions[option.name] === value;

                    // Parse color value for color swatches
                    let colorData: { colors: string[]; displayName: string } | null = null;
                    let isMultiColor = false;
                    let singleColor: string | undefined = undefined;
                    let multiColorGradient: string | undefined = undefined;

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
                        multiColorGradient = `linear-gradient(to right, ${colors
                          .map((c, idx) => {
                            const hex = toHex(c);
                            const pct1 = (idx / colorsLength) * 100;
                            const pct2 = ((idx + 1) / colorsLength) * 100;
                            return `${hex} ${pct1}%, ${hex} ${pct2}%`;
                          })
                          .join(', ')})`;
                      }
                    } catch (err) {
                      colorData = { colors: [value], displayName: value };
                      singleColor = '#6b7280';
                    }

                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => onOptionChange(option.name, value)}
                        className={(() => {
                          // Color swatch - small square, always clickable
                          const base = 'w-2.5 h-2.5 border transition-all flex-shrink-0 relative';
                          const border = isSelected ? 'border-black border-2' : 'border-gray-300';
                          const hover = 'hover:border-black';
                          return `${base} ${border} ${hover}`.trim();
                        })()}
                        style={
                          isMultiColor
                            ? ({ backgroundImage: multiColorGradient } as React.CSSProperties)
                            : ({ backgroundColor: singleColor } as React.CSSProperties)
                        }
                        aria-label={`Select ${option.name.toLowerCase()} ${value}${!isAvailable ? ' (Out of Stock)' : ''}`}
                        aria-pressed={isSelected}
                        title={`${colorData?.displayName}${!isAvailable ? ' - Out of Stock' : ''}`}
                      />
                    );
                  })}
                </div>
              ))}

          {/* Add to Cart Button */}
          <div>
            <AddToCartButton
              lines={lines}
              onClick={handleAddToCart}
              disabled={!selectedVariant.availableForSale}
            >
              <span className="text-xs font-medium">
                {selectedVariant.availableForSale ? 'Add to Cart' : 'Sold Out'}
              </span>
            </AddToCartButton>
          </div>
        </div>
      </div>

      {/* Size Chart Modal */}
      {sizeChartOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="max-w-4xl w-full">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-white">
                {chartSource === 'brand' ? 'Brand Size Chart' : 'Size Chart'}
              </h4>
              <button
                onClick={() => {
                  setSizeChartOpen(false);
                  setChartSource(null);
                }}
                className="text-white hover:text-gray-300"
              >
                Close
              </button>
            </div>
            <SizeChart
              imageUrl={
                chartSource === 'brand'
                  ? product.brandSizeChartImage?.url
                  : product.sizeChartImage?.url || product.brandSizeChartImage?.url
              }
              alt={
                chartSource === 'brand'
                  ? product.brandSizeChartImage?.alt || 'Brand size chart'
                  : product.sizeChartImage?.alt ||
                    product.brandSizeChartImage?.alt ||
                    'Size chart'
              }
            />
          </div>
        </div>
      )}
    </div>
    </>
  );
}
