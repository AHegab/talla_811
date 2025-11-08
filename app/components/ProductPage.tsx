import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { ProductBuyBox, type PDPProduct, type PDPVariant } from './ProductBuyBox';
import { ProductGallery, type PDPImage } from './ProductGallery';
import { SimilarItems } from './SimilarItems';

interface UserMeasurements {
  gender: 'male' | 'female';
  height: number;
  weight: number;
  bodyFit: 'slim' | 'regular' | 'athletic' | 'relaxed';
  chest?: number;
  waist?: number;
  hips?: number;
  unit: 'metric';
}

interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  vendor?: string;
  description?: string;
  descriptionHtml?: string;
  images?: {nodes: any[]};
  options?: any[];
  variants?: {nodes: any[]};
  selectedOrFirstAvailableVariant?: any;
  priceRange?: any;
  productType?: string;
  tags?: string[];
}

interface ProductPageProps {
  product: ShopifyProduct;
  selectedVariant: any;
}

export function ProductPage({product, selectedVariant}: ProductPageProps) {
  const [currentVariant, setCurrentVariant] = useState(selectedVariant);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [userMeasurements, setUserMeasurements] = useState<UserMeasurements | null>(null);
  const [recommendedSize, setRecommendedSize] = useState<string | null>(null);

  // Load user measurements from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('talla_user_measurements');
      if (stored) {
        try {
          const measurements = JSON.parse(stored) as UserMeasurements;
          setUserMeasurements(measurements);
          
          // Calculate recommended size
          const sizeOption = product.options?.find(
            opt => opt.name.toLowerCase() === 'size'
          );
          if (sizeOption?.values) {
            const recommended = calculateRecommendedSize(measurements, product);
            if (recommended && sizeOption.values.includes(recommended)) {
              setRecommendedSize(recommended);
            }
          }
        } catch (error) {
          console.error('Failed to parse measurements:', error);
        }
      }
    }
  }, [product]);

  // Transform Shopify product data to PDP format
  const images: PDPImage[] = product.images?.nodes?.map((img) => ({
    id: img.id,
    url: img.url,
    alt: img.altText || product.title,
    width: img.width,
    height: img.height,
  })) || [];

  const pdpVariants: PDPVariant[] = product.variants?.nodes?.map((v) => ({
    id: v.id,
    title: v.title,
    availableForSale: v.availableForSale,
    selectedOptions: v.selectedOptions,
    price: v.price,
    sku: v.sku,
  })) || [];

  const pdpProduct: PDPProduct = {
    id: product.id,
    title: product.title,
    handle: product.handle,
    vendor: product.vendor,
    description: product.description,
    productType: product.productType,
    tags: product.tags,
    options: product.options?.map((opt: any) => ({
      name: opt.name,
      values: opt.optionValues?.map((ov: any) => ov.name) || opt.values || []
    })) || [],
    variants: pdpVariants,
    priceRange: product.priceRange || (currentVariant?.price ? {minVariantPrice: currentVariant.price} : {minVariantPrice: {amount: '0', currencyCode: 'USD'}}),
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // Simple size recommendation algorithm
  const calculateRecommendedSize = (measurements: UserMeasurements, product: ShopifyProduct): string | null => {
    const { height, weight, bodyFit, gender } = measurements;
    
    // All measurements are in metric (cm/kg)
    const heightCm = height;
    const weightKg = weight;
    
    // Calculate BMI
    const heightM = heightCm / 100;
    const bmi = weightKg / (heightM * heightM);
    
    // Basic size mapping based on height, BMI, and body fit
    let sizeIndex = 0;
    
    // Height contribution (taller = larger size)
    if (heightCm < 160) sizeIndex += 0;
    else if (heightCm < 170) sizeIndex += 1;
    else if (heightCm < 180) sizeIndex += 2;
    else if (heightCm < 190) sizeIndex += 3;
    else sizeIndex += 4;
    
    // BMI contribution
    if (bmi < 18.5) sizeIndex -= 1;
    else if (bmi > 25) sizeIndex += 1;
    else if (bmi > 30) sizeIndex += 2;
    
    // Body fit preference
    if (bodyFit === 'slim') sizeIndex -= 1;
    else if (bodyFit === 'athletic') sizeIndex += 0; // Athletic is between regular and relaxed
    else if (bodyFit === 'relaxed') sizeIndex += 1;
    
    // Gender adjustment (women tend to wear smaller sizes)
    if (gender === 'female') sizeIndex -= 0.5;
    
    // Map to standard sizes
    const sizes = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL'];
    const finalIndex = Math.max(0, Math.min(sizes.length - 1, Math.round(sizeIndex)));
    
    return sizes[finalIndex];
  };

  const primaryImageUrl = images[0]?.url || '';

  // Extract product metadata
  const materials = product.tags?.filter(tag => 
    tag.toLowerCase().includes('cotton') || 
    tag.toLowerCase().includes('polyester') || 
    tag.toLowerCase().includes('wool') ||
    tag.toLowerCase().includes('silk') ||
    tag.toLowerCase().includes('linen')
  ) || [];

  return (
    <div style={{backgroundColor: '#FFFFFF'}}>
      {/* Main Product Section */}
      <div className="mx-auto px-0 sm:px-4 lg:px-6 py-0 sm:py-6 lg:py-8 max-w-7xl">
        <div className="lg:grid lg:grid-cols-2 lg:gap-12">
          {/* Left Column - Image Gallery */}
          <div className="lg:sticky lg:top-20 lg:self-start">
            <ProductGallery images={images} productTitle={product.title} />
          </div>

          {/* Right Column - Buy Box */}
          <div className="px-4 py-6 sm:px-6 lg:px-0">
            <ProductBuyBox
              product={pdpProduct}
              selectedVariant={currentVariant}
              onVariantChange={setCurrentVariant}
              recommendedSize={recommendedSize}
            />

            {/* Prompt to add measurements if none exist */}
            {!userMeasurements && (
              <Link 
                to="/pages/size-guide"
                className="mt-5 block px-3 py-2.5 text-xs text-center transition-colors hover:bg-gray-50 rounded"
                style={{
                  border: '1px solid #E0E0E0',
                  color: '#757575',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                Get personalized size recommendations →
              </Link>
            )}

            {/* Product Details Accordions */}
            <div className="mt-10 pt-6 space-y-0" style={{borderTop: '1px solid #E0E0E0'}}>
              {/* Description */}
              {product.description && (
                <ExpandableSection
                  title="Description"
                  isExpanded={expandedSection === 'description'}
                  onToggle={() => toggleSection('description')}
                >
                  <div
                    className="prose prose-sm max-w-none text-sm leading-relaxed"
                    style={{color: '#424242', fontFamily: 'var(--font-sans)'}}
                  >
                    {product.descriptionHtml ? (
                      <div dangerouslySetInnerHTML={{__html: product.descriptionHtml}} />
                    ) : (
                      <p>{product.description}</p>
                    )}
                  </div>
                </ExpandableSection>
              )}

              {/* Details & Care */}
              <ExpandableSection
                title="Details & Care"
                isExpanded={expandedSection === 'details'}
                onToggle={() => toggleSection('details')}
              >
                <div
                  className="space-y-4 text-sm leading-relaxed"
                  style={{color: '#424242', fontFamily: 'var(--font-sans)'}}
                >
                  {/* Product Info List */}
                  {(product.vendor || product.productType || currentVariant.sku) && (
                    <dl className="space-y-2">
                      {product.vendor && (
                        <div className="flex">
                          <dt className="text-xs uppercase tracking-wider w-20 flex-shrink-0" style={{color: '#9E9E9E'}}>Brand</dt>
                          <dd className="text-sm" style={{color: '#424242'}}>{product.vendor}</dd>
                        </div>
                      )}
                      {product.productType && (
                        <div className="flex">
                          <dt className="text-xs uppercase tracking-wider w-20 flex-shrink-0" style={{color: '#9E9E9E'}}>Type</dt>
                          <dd className="text-sm" style={{color: '#424242'}}>{product.productType}</dd>
                        </div>
                      )}
                      {currentVariant.sku && (
                        <div className="flex">
                          <dt className="text-xs uppercase tracking-wider w-20 flex-shrink-0" style={{color: '#9E9E9E'}}>SKU</dt>
                          <dd className="text-sm font-mono" style={{color: '#424242'}}>{currentVariant.sku}</dd>
                        </div>
                      )}
                      {materials.length > 0 && (
                        <div className="flex">
                          <dt className="text-xs uppercase tracking-wider w-20 flex-shrink-0" style={{color: '#9E9E9E'}}>Material</dt>
                          <dd className="text-sm capitalize" style={{color: '#424242'}}>{materials.join(', ')}</dd>
                        </div>
                      )}
                    </dl>
                  )}
                </div>
              </ExpandableSection>

              {/* Shipping & Returns */}
              <ExpandableSection
                title="Shipping & Returns"
                isExpanded={expandedSection === 'shipping'}
                onToggle={() => toggleSection('shipping')}
              >
                <div
                  className="space-y-3 text-sm leading-relaxed"
                  style={{color: '#424242', fontFamily: 'var(--font-sans)'}}
                >
                  <p>
                    Free standard shipping on orders over $100. Orders are processed
                    within 1-2 business days.
                  </p>
                  <p>
                    We accept returns within 30 days of delivery. Items must be
                    unworn, unwashed, and in original condition.
                  </p>
                </div>
              </ExpandableSection>
            </div>
          </div>
        </div>
      </div>

      {/* Visually Similar Items */}
      {primaryImageUrl && (
        <SimilarItems
          seedImageUrl={primaryImageUrl}
          currentProductHandle={product.handle}
        />
      )}
    </div>
  );
}

function ExpandableSection({
  title,
  isExpanded,
  onToggle,
  children,
}: {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div style={{borderTop: '1px solid #E0E0E0'}}>
      <button
        onClick={onToggle}
        className="w-full py-4 flex items-center justify-between text-left transition-opacity hover:opacity-60 focus:outline-none"
        aria-expanded={isExpanded}
      >
        <span
          className="text-xs uppercase tracking-wider font-medium"
          style={{fontFamily: 'var(--font-sans)', color: '#000000', letterSpacing: '0.08em'}}
        >
          {title}
        </span>
        <svg
          className={`w-4 h-4 transition-transform duration-300 ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
          style={{color: '#757575'}}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isExpanded ? 'max-h-[1000px] pb-5' : 'max-h-0'
        }`}
      >
        {children}
      </div>
    </div>
  );
}

