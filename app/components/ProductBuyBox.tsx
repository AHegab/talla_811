import { CartForm, Money, type OptimisticCartLineInput } from '@shopify/hydrogen';
import { useEffect, useState } from 'react';
import { type FetcherWithComponents } from 'react-router';
import { SizeRecommendation } from './SizeRecommendation';
import { SizeRecommendationPrompt } from './SizeRecommendationPrompt';

export interface PDPVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  selectedOptions: {name: string; value: string}[];
  price: {amount: string; currencyCode: string};
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
  options: {name: string; values: string[]}[];
  variants: PDPVariant[];
  priceRange: {minVariantPrice: {amount: string; currencyCode: string}};
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
  const [addedToCart, setAddedToCart] = useState(false);
  const [showSizePrompt, setShowSizePrompt] = useState(false);
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
      const stored = localStorage.getItem('talla_user_measurements');
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
  }, [selectedOptions, product.variants, selectedVariant.id, onVariantChange]);

  const handleOptionChange = (optionName: string, value: string) => {
    setSelectedOptions((prev) => ({...prev, [optionName]: value}));
  };

  const handleSizeRecommendation = (recommendedSize: string) => {
    const sizeOption = product.options?.find(
      (opt) => opt.name.toLowerCase() === 'size',
    );
    if (sizeOption && sizeOption.values.includes(recommendedSize)) {
      handleOptionChange('Size', recommendedSize);
      setSizeRecOpen(false);
    }
  };

  const handleAddToCart = () => {
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const lines: OptimisticCartLineInput[] = [
    {
      merchandiseId: selectedVariant.id,
      quantity: 1,
      selectedVariant,
    },
  ];

  return (
    <div className="space-y-3">
      {/* Vendor/Brand */}
      {product.vendor && (
        <div className="pb-2 border-b border-gray-200">
          <p
            className="text-xs uppercase tracking-wider font-medium"
            style={{
              color: '#757575',
              fontFamily: 'var(--font-sans)',
              letterSpacing: '0.1em',
            }}
          >
            {product.vendor}
          </p>
        </div>
      )}

      {/* Title */}
      <h1
        className="text-2xl sm:text-3xl font-light leading-tight"
        style={{
          fontFamily: 'var(--font-sans)',
          color: '#000000',
          letterSpacing: '-0.01em',
          fontWeight: 300,
        }}
      >
        {product.title}
      </h1>

      {/* Price */}
      <div
        className="text-xl font-medium"
        style={{fontFamily: 'var(--font-sans)', color: '#000000'}}
      >
        <Money data={selectedVariant.price as any} />
      </div>

      {/* Tax/Shipping Note */}
      <p
        className="text-xs pb-3 border-b border-gray-200"
        style={{color: '#9E9E9E', fontFamily: 'var(--font-sans)'}}
      >
        Tax included • Free shipping on orders over $100
      </p>

      {/* Product Metadata - Type and Tags */}
      {(product.productType || (product.tags && product.tags.length > 0)) && (
        <div className="py-3 space-y-2 border-b border-gray-200">
          {product.productType && (
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-medium" style={{color: '#9E9E9E', fontFamily: 'var(--font-sans)'}}>
                Type:
              </span>
              <span className="text-xs font-medium" style={{color: '#424242', fontFamily: 'var(--font-sans)'}}>
                {product.productType}
              </span>
            </div>
          )}
          {product.tags && product.tags.length > 0 && (
            <div className="flex items-start gap-2">
              <span className="text-xs uppercase tracking-wider font-medium flex-shrink-0" style={{color: '#9E9E9E', fontFamily: 'var(--font-sans)'}}>
                Tags:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {product.tags.slice(0, 5).map((tag, index) => (
                  <span 
                    key={index}
                    className="px-2 py-0.5 text-xs rounded"
                    style={{
                      backgroundColor: '#F5F5F5',
                      color: '#424242',
                      fontFamily: 'var(--font-sans)',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Size Recommendation Prompt */}
      {recommendedSize && (
        <div 
          className="py-2.5 px-3 flex items-center gap-2 rounded"
          style={{
            backgroundColor: '#E8F5E9',
            border: '1px solid #81C784',
          }}
        >
          <svg className="w-4 h-4 flex-shrink-0" style={{color: '#2E7D32'}} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="text-xs font-medium" style={{color: '#1B5E20', fontFamily: 'var(--font-sans)'}}>
            We recommend size <strong>{recommendedSize}</strong> for you
          </span>
        </div>
      )}

      {/* Prompt to get size recommendation if no measurements saved */}
      {!hasMeasurements && !recommendedSize && product.options && product.options.some(opt => opt.name.toLowerCase() === 'size') && (
        <div 
          className="py-2.5 px-3 flex items-center justify-between gap-2 rounded"
          style={{
            backgroundColor: '#F5F5F5',
            border: '1px solid #E0E0E0',
          }}
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" style={{color: '#757575'}} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs" style={{color: '#424242', fontFamily: 'var(--font-sans)'}}>
              Not sure about your size?
            </span>
          </div>
          <SizeRecommendationPrompt onComplete={() => setHasMeasurements(true)} />
        </div>
      )}

      {/* Options Selectors */}
      <div className="space-y-5">
        {product.options && product.options.length > 0 && product.options.map((option) => (
          <div key={option.name} className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label
                className="text-xs uppercase tracking-wider font-medium"
                style={{
                  fontFamily: 'var(--font-sans)',
                  color: '#000000',
                  letterSpacing: '0.08em',
                }}
              >
                {option.name}
              </label>

              {/* Size guide link for Size option */}
              {option.name.toLowerCase() === 'size' && (
                <button
                  type="button"
                  onClick={() => setSizeRecOpen(!sizeRecOpen)}
                  className="text-xs underline hover:no-underline transition-all focus:outline-none"
                  style={{color: '#9E9E9E'}}
                  aria-expanded={sizeRecOpen}
                >
                  Size Guide
                </button>
              )}
            </div>

            {/* Option Values */}
            {option.name.toLowerCase() === 'size' ? (
              // Size: Clean minimal buttons with rounded corners
              <div className="flex flex-wrap gap-3">
                {option.values.map((value) => {
                  const isAvailable = product.variants.some(
                    (v) =>
                      v.availableForSale &&
                      v.selectedOptions.some(
                        (opt) => opt.name === option.name && opt.value === value,
                      ),
                  );
                  const isSelected = selectedOptions[option.name] === value;
                  const isRecommended = recommendedSize === value;

                  return (
                    <div key={value} className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          isAvailable && handleOptionChange(option.name, value)
                        }
                        disabled={!isAvailable}
                        className={`min-w-[52px] px-5 py-3 text-sm font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                          isSelected
                            ? 'focus:ring-black shadow-sm'
                            : isAvailable
                              ? 'hover:bg-gray-50 hover:shadow-sm focus:ring-gray-300'
                              : 'cursor-not-allowed opacity-40 line-through'
                        }`}
                        style={{
                          backgroundColor: isSelected ? '#000000' : '#FFFFFF',
                          color: isSelected
                            ? '#FFFFFF'
                            : isAvailable
                              ? '#000000'
                              : '#BDBDBD',
                          border: isRecommended && isAvailable && !isSelected
                            ? '2px solid #00F4D2'
                            : isSelected
                              ? '2px solid #000000'
                              : isAvailable
                                ? '1.5px solid #E5E5E5'
                                : '1px solid #F5F5F5',
                          fontFamily: 'var(--font-sans)',
                        }}
                        aria-label={`Select size ${value}${isRecommended ? ' (Recommended)' : ''}`}
                        aria-pressed={isSelected}
                        aria-disabled={!isAvailable}
                      >
                        {value}
                      </button>
                      {isRecommended && isAvailable && !isSelected && (
                        <div 
                          className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-white shadow-md"
                          style={{backgroundColor: '#00F4D2', fontSize: '10px', fontWeight: 'bold'}}
                          aria-label="AI Recommended"
                        >
                          ✓
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              // Other options: Simple clean buttons with rounded corners
              <div className="flex flex-wrap gap-3">
                {option.values.map((value) => {
                  const isAvailable = product.variants.some(
                    (v) =>
                      v.availableForSale &&
                      v.selectedOptions.some(
                        (opt) => opt.name === option.name && opt.value === value,
                      ),
                  );
                  const isSelected = selectedOptions[option.name] === value;

                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() =>
                        isAvailable && handleOptionChange(option.name, value)
                      }
                      disabled={!isAvailable}
                      className={`px-5 py-3 text-sm font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        isSelected
                          ? 'focus:ring-black shadow-sm'
                          : isAvailable
                            ? 'hover:bg-gray-50 hover:shadow-sm focus:ring-gray-300'
                            : 'cursor-not-allowed opacity-40'
                      }`}
                      style={{
                        backgroundColor: isSelected ? '#000000' : '#FFFFFF',
                        color: isSelected
                          ? '#FFFFFF'
                          : isAvailable
                            ? '#000000'
                            : '#BDBDBD',
                        border: isSelected
                          ? '1.5px solid #000000'
                          : '1px solid #E0E0E0',
                        fontFamily: 'var(--font-sans)',
                      }}
                      aria-label={`Select ${option.name.toLowerCase()} ${value}`}
                      aria-pressed={isSelected}
                      aria-disabled={!isAvailable}
                    >
                      {value}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Size Recommendation (Collapsible) */}
      {sizeRecOpen && (
        <SizeRecommendation
          onRecommendation={handleSizeRecommendation}
          onClose={() => setSizeRecOpen(false)}
        />
      )}

      {/* Add to Cart Button */}
      <CartForm
        route="/cart"
        inputs={{lines}}
        action={CartForm.ACTIONS.LinesAdd}
      >
        {(fetcher: FetcherWithComponents<any>) => {
          const isAdding = fetcher.state !== 'idle';

          return (
            <button
              type="submit"
              disabled={!selectedVariant.availableForSale || isAdding}
              onClick={handleAddToCart}
              className={`w-full text-sm py-3.5 px-8 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 ${
                selectedVariant.availableForSale && !isAdding
                  ? 'hover:bg-gray-800 active:bg-black'
                  : 'cursor-not-allowed'
              }`}
              style={{
                backgroundColor:
                  selectedVariant.availableForSale && !isAdding
                    ? '#000000'
                    : '#E0E0E0',
                color:
                  selectedVariant.availableForSale && !isAdding
                    ? '#FFFFFF'
                    : '#BDBDBD',
                border: 'none',
                fontFamily: 'var(--font-sans)',
                letterSpacing: '0.05em',
              }}
              aria-label={
                isAdding
                  ? 'Adding to cart'
                  : selectedVariant.availableForSale
                    ? 'Add to cart'
                    : 'Sold out'
              }
            >
              {isAdding
                ? 'ADDING...'
                : addedToCart
                  ? '✓ ADDED TO CART'
                  : selectedVariant.availableForSale
                    ? 'ADD TO CART'
                    : 'SOLD OUT'}
            </button>
          );
        }}
      </CartForm>
    </div>
  );
}
