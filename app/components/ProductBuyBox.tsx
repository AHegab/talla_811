import { CartForm, Money, type OptimisticCartLineInput } from '@shopify/hydrogen';
import { useEffect, useState } from 'react';
import { type FetcherWithComponents } from 'react-router';
import { SizeRecommendation } from './SizeRecommendation';

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
  options: {name: string; values: string[]}[];
  variants: PDPVariant[];
  priceRange: {minVariantPrice: {amount: string; currencyCode: string}};
}

interface ProductBuyBoxProps {
  product: PDPProduct;
  selectedVariant: PDPVariant;
  onVariantChange?: (variant: PDPVariant) => void;
}

export function ProductBuyBox({
  product,
  selectedVariant,
  onVariantChange,
}: ProductBuyBoxProps) {
  const [sizeRecOpen, setSizeRecOpen] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(
    () => {
      const initial: Record<string, string> = {};
      selectedVariant.selectedOptions.forEach((option) => {
        initial[option.name] = option.value;
      });
      return initial;
    },
  );

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
    const sizeOption = product.options.find(
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
    <div className="space-y-6 lg:space-y-8">
      {/* Brand */}
      {product.vendor && (
        <p
          className="text-xs uppercase tracking-widest font-medium"
          style={{
            color: '#6B6C75',
            fontFamily: 'var(--font-sans)',
            letterSpacing: '0.15em',
          }}
        >
          {product.vendor}
        </p>
      )}

      {/* Title */}
      <h1
        className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-normal leading-tight"
        style={{
          fontFamily: 'var(--font-display)',
          color: '#292929',
          letterSpacing: '-0.02em',
        }}
      >
        {product.title}
      </h1>

      {/* Price */}
      <div
        className="text-2xl lg:text-3xl font-semibold"
        style={{fontFamily: 'var(--font-sans)', color: '#292929'}}
      >
        <Money data={selectedVariant.price as any} />
      </div>

      {/* Tax/Shipping Note */}
      <p
        className="text-sm"
        style={{color: '#6B6C75', fontFamily: 'var(--font-sans)'}}
      >
        Tax included. Shipping calculated at checkout.
      </p>

      {/* Options Selectors */}
      <div className="space-y-6 pt-4" style={{borderTop: '1px solid #E8E9EC'}}>
        {product.options.map((option) => (
          <div key={option.name} className="space-y-3">
            <div className="flex items-center justify-between">
              <label
                className="text-sm uppercase tracking-wider font-semibold"
                style={{
                  fontFamily: 'var(--font-sans)',
                  color: '#292929',
                  letterSpacing: '0.05em',
                }}
              >
                {option.name}
              </label>

              {/* Size guide link for Size option */}
              {option.name.toLowerCase() === 'size' && (
                <button
                  type="button"
                  onClick={() => setSizeRecOpen(!sizeRecOpen)}
                  className="text-sm underline hover:no-underline transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800"
                  style={{color: '#6B6C75'}}
                  aria-expanded={sizeRecOpen}
                >
                  Find my size
                </button>
              )}
            </div>

            {/* Option Values */}
            {option.name.toLowerCase() === 'size' ? (
              // Size: Radio pills
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
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
                      className={`py-3 px-2 text-sm font-medium uppercase tracking-wider transition-all duration-base focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 ${
                        isSelected
                          ? 'scale-95 shadow-premium'
                          : isAvailable
                            ? 'hover:shadow-premium hover:-translate-y-0.5'
                            : 'cursor-not-allowed opacity-40 line-through'
                      }`}
                      style={{
                        backgroundColor: isSelected ? '#292929' : '#FFFFFF',
                        color: isSelected
                          ? '#FFFFFF'
                          : isAvailable
                            ? '#292929'
                            : '#9A9BA3',
                        border: isSelected
                          ? '2px solid #292929'
                          : isAvailable
                            ? '1.5px solid #DDDEE2'
                            : '1.5px solid #E8E9EC',
                        fontFamily: 'var(--font-sans)',
                        letterSpacing: '0.05em',
                      }}
                      aria-label={`Select size ${value}`}
                      aria-pressed={isSelected}
                      aria-disabled={!isAvailable}
                    >
                      {value}
                    </button>
                  );
                })}
              </div>
            ) : (
              // Other options: Simple buttons
              <div className="flex flex-wrap gap-2">
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
                      className={`py-2 px-4 text-sm font-medium transition-all duration-base focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 ${
                        isSelected
                          ? 'scale-95'
                          : isAvailable
                            ? 'hover:-translate-y-0.5'
                            : 'cursor-not-allowed opacity-40'
                      }`}
                      style={{
                        backgroundColor: isSelected ? '#292929' : '#FFFFFF',
                        color: isSelected
                          ? '#FFFFFF'
                          : isAvailable
                            ? '#292929'
                            : '#9A9BA3',
                        border: isSelected
                          ? '2px solid #292929'
                          : '1.5px solid #DDDEE2',
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
              className={`w-full text-sm py-4 px-8 uppercase tracking-widest font-semibold transition-all duration-base focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 ${
                selectedVariant.availableForSale && !isAdding
                  ? 'hover:shadow-premium-lg hover:-translate-y-0.5 active:scale-95'
                  : 'cursor-not-allowed'
              } ${addedToCart ? 'scale-95' : ''}`}
              style={{
                backgroundColor:
                  selectedVariant.availableForSale && !isAdding
                    ? '#292929'
                    : '#DDDEE2',
                color:
                  selectedVariant.availableForSale && !isAdding
                    ? '#FFFFFF'
                    : '#9A9BA3',
                border:
                  selectedVariant.availableForSale && !isAdding
                    ? '2px solid #292929'
                    : '2px solid #DDDEE2',
                fontFamily: 'var(--font-sans)',
                letterSpacing: '0.1em',
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
                ? 'Adding...'
                : addedToCart
                  ? '✓ Added'
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
