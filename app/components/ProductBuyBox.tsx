import { CartForm, Money, type OptimisticCartLineInput } from '@shopify/hydrogen';
import {
  Flame,
  Hash,
  Heart,
  Leaf,
  Shirt,
  Sparkle,
  Star,
  Sun,
  Tag,
  Tags,
  TrendingUp,
  User,
} from 'lucide-react';
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

  // Images for horizontal scroll
  const images = (product as any).images?.nodes || [];
  return (
    <div className="space-y-3 animate-fadein">
      {/* Product Images - Horizontal Scroll */}
      {images.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-2" style={{scrollbarWidth: 'thin'}}>
          {images.map((img: any, idx: number) => (
            <div key={img.id || idx} className="min-w-[96px] h-[96px] rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center" style={{boxShadow: '0 1px 4px 0 rgba(220,220,230,0.07)'}}>
              <img src={img.url} alt={img.altText || product.title} className="object-contain w-full h-full rounded-lg" />
            </div>
          ))}
        </div>
      )}
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


      {/* Title - Minimized */}
      <h1
        className="text-lg sm:text-xl font-medium leading-snug mb-2"
        style={{
          fontFamily: 'var(--font-sans)',
          color: '#292929',
          letterSpacing: '-0.01em',
          fontWeight: 500,
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

      {/* Product Metadata - Type and Tags - Modern Rectangles */}
      <div className="space-y-2">
        {product.productType && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#E3E6EA] bg-[#F8FAFB]" style={{boxShadow: '0 1px 4px 0 rgba(220,220,230,0.07)'}}>
            {(() => {
              const type = product.productType.toLowerCase();
              if (type.includes('t-shirt') || type === 't-shirt' || type === 'tee' || type.includes('shirt')) return <Shirt size={18} color="#6C63FF" />;
              if (type.includes('pant') || type.includes('trouser') || type.includes('short')) return <Tag size={18} color="#6C63FF" />;
              if (type.includes('shoe') || type.includes('sneaker')) return <Tag size={18} color="#6C63FF" />;
              if (type.includes('dress')) return <Sparkle size={18} color="#6C63FF" />;
              return <Tag size={18} color="#6C63FF" />;
            })()}
            <span className="text-xs uppercase tracking-wider font-medium" style={{color: '#7B7B8B', fontFamily: 'var(--font-sans)'}}>
              TYPE:
            </span>
            <span className="text-xs font-medium" style={{color: '#292929', fontFamily: 'var(--font-sans)'}}>
              {product.productType}
            </span>
          </div>
        )}
        {product.tags && product.tags.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#E3E6EA] bg-[#F8FAFB]" style={{boxShadow: '0 1px 4px 0 rgba(220,220,230,0.07)'}}>
            <Tags size={18} color="#6C63FF" className="mt-0.5" />
            <span className="text-xs uppercase tracking-wider font-medium flex-shrink-0" style={{color: '#7B7B8B', fontFamily: 'var(--font-sans)'}}>
              TAGS:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {product.tags.slice(0, 5).map((tag, index) => {
                const t = tag.toLowerCase();
                let Icon = Hash;
                let iconColor = '#6C63FF';
                if (t === 'basics' || t.includes('basic')) Icon = Star;
                else if (t === 'fashion' || t.includes('fashion')) Icon = TrendingUp;
                else if (t === 'men' || t === 'male' || t.includes('men')) Icon = User;
                else if (t === 'summer' || t.includes('summer')) Icon = Sun;
                else if (t === 'love' || t.includes('love') || t.includes('favorite')) { Icon = Heart; iconColor = '#FF6B6B'; }
                else if (t === 'eco' || t.includes('eco') || t.includes('green') || t.includes('organic')) { Icon = Leaf; iconColor = '#4CAF50'; }
                else if (t === 'hot' || t.includes('hot') || t.includes('fire')) { Icon = Flame; iconColor = '#FF9800'; }
                return (
                  <span 
                    key={index}
                    className="px-2 py-0.5 text-xs rounded flex items-center gap-1 shadow-sm border border-[#E3E6EA] bg-white"
                    style={{
                      color: '#292929',
                      fontFamily: 'var(--font-sans)',
                    }}
                  >
                    <Icon size={14} color={iconColor} />
                    {tag}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>

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
                        className={`min-w-[52px] px-5 py-3 text-sm font-medium rounded-xl transition-all duration-200 focus:outline-none shadow-md animate-fadein
                          ${isSelected ? 'scale-105 bg-[#F5F5F5] text-[#292929] border-2 border-[#D1D5DB]' : isAvailable ? 'hover:scale-105 hover:bg-[#F5F5F5] hover:border-[#D1D5DB]' : 'cursor-not-allowed opacity-40 line-through'}
                        `}
                        style={{
                          background: isSelected ? '#F5F5F5' : '#FFFFFF',
                          color: isSelected ? '#292929' : isAvailable ? '#292929' : '#BDBDBD',
                          border: isRecommended && isAvailable && !isSelected
                            ? '2px solid #A0FFE6'
                            : isSelected
                              ? '2px solid #D1D5DB'
                              : isAvailable
                                ? '1.5px solid #E5E5E5'
                                : '1px solid #F5F5F5',
                          fontFamily: 'var(--font-sans)',
                          boxShadow: isSelected ? '0 2px 8px 0 #D1D5DB22' : undefined,
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
                        className={`px-5 py-3 text-sm font-medium rounded-xl transition-all duration-200 focus:outline-none shadow-md animate-fadein
                        ${isSelected ? 'scale-105 bg-[#F5F5F5] text-[#292929] border-2 border-[#D1D5DB]' : isAvailable ? 'hover:scale-105 hover:bg-[#F5F5F5] hover:border-[#D1D5DB]' : 'cursor-not-allowed opacity-40'}
                      `}
                      style={{
                        background: isSelected ? '#F5F5F5' : '#FFFFFF',
                        color: isSelected ? '#292929' : isAvailable ? '#292929' : '#BDBDBD',
                        border: isSelected
                          ? '2px solid #D1D5DB'
                          : '1px solid #E0E0E0',
                        fontFamily: 'var(--font-sans)',
                        boxShadow: isSelected ? '0 2px 8px 0 #D1D5DB22' : undefined,
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
              className={`w-full text-sm py-4 px-8 font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-lg animate-fadein
                ${selectedVariant.availableForSale && !isAdding ? 'bg-[#292929] text-white hover:scale-105 hover:shadow-2xl active:scale-95 focus:ring-[#D1D5DB]' : 'cursor-not-allowed opacity-60 bg-[#F5F5F5] text-[#BDBDBD]'}
              `}
              style={{
                background: selectedVariant.availableForSale && !isAdding ? '#292929' : '#F5F5F5',
                border: 'none',
                fontFamily: 'var(--font-sans)',
                letterSpacing: '0.05em',
                boxShadow: selectedVariant.availableForSale && !isAdding ? '0 4px 24px 0 #D1D5DB22' : undefined,
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
