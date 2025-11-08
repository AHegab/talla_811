import { useState } from 'react';
import { ProductBuyBox, type PDPProduct, type PDPVariant } from './ProductBuyBox';
import { type PDPImage } from './ProductGallery';

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
  // ...existing code...

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

  return (
    <div className="product-page min-h-screen" style={{background: '#FAFAFA'}}>
      <div className="product-container grid grid-cols-1 md:grid-cols-2 gap-12 px-8 py-12 items-start">
        {/* Gallery: main image + vertical thumbnails below */}
        <div className="product-gallery w-full flex flex-col items-center justify-start" style={{maxWidth: '480px'}}>
          {/* Main image */}
          {images.length > 0 && (
            <div className="flex items-center justify-center mb-5">
              <img
                src={images[0].url}
                alt={images[0].alt || product.title}
                className="rounded-xl object-cover"
                style={{width: '340px', height: '440px', maxWidth: '100%', aspectRatio: '3/4', boxShadow: '0 2px 16px 0 rgba(220,220,230,0.12)'}}
              />
            </div>
          )}
          {/* Thumbnails grid below main image */}
          {images.length > 1 && (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-4 w-full justify-center mt-2">
              {images.slice(1).map((img, idx) => (
                <div key={img.id || idx} className="w-[80px] h-[110px] aspect-[3/4] rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center" style={{boxShadow: '0 1px 4px 0 rgba(220,220,230,0.07)'}}>
                  <img src={img.url} alt={img.alt || product.title} className="object-cover w-full h-full rounded-lg" style={{aspectRatio: '3/4'}} />
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Details: right side, vertically aligned */}
        <div className="product-details w-full flex flex-col justify-start" style={{maxWidth: '480px'}}>
          <ProductBuyBox product={pdpProduct} selectedVariant={currentVariant} onVariantChange={setCurrentVariant} recommendedSize={recommendedSize} />
          {/* Accordion Sections - Relaxing Colors & Modern Style */}
          <div className="mt-8 flex flex-col gap-6">
            {/* Description Panel - always expanded */}
            <div className="rounded-xl transition-all border shadow-sm bg-[#F8F9FB] border-[#D1D5DB] shadow-md flex flex-col" style={{minHeight: '64px'}}>
              <div className="w-full text-left px-6 py-4 font-semibold text-gray-700 flex items-center rounded-xl" style={{background: 'none', minHeight: '56px', fontSize: '17px', letterSpacing: '0.02em'}}>
                <span className="tracking-wide">Description</span>
              </div>
              <div className="px-6 pb-6 text-gray-600 text-[16px] leading-relaxed" style={{fontFamily: 'var(--font-sans)', minHeight: '48px'}}>
                {product.description || 'No description available.'}
              </div>
            </div>
            {/* Details & Care Panel - always expanded */}
            <div className="rounded-xl transition-all border shadow-sm bg-[#F8F9FB] border-[#D1D5DB] shadow-md flex flex-col" style={{minHeight: '64px'}}>
              <div className="w-full text-left px-6 py-4 font-semibold text-gray-700 flex items-center rounded-xl" style={{background: 'none', minHeight: '56px', fontSize: '17px', letterSpacing: '0.02em'}}>
                <span className="tracking-wide">Details &amp; Care</span>
              </div>
              <div className="px-6 pb-6 text-gray-600 text-[16px] leading-relaxed" style={{fontFamily: 'var(--font-sans)', minHeight: '48px'}}>
                <ul className="list-disc pl-4">
                  <li>Premium materials for comfort</li>
                  <li>Machine washable</li>
                  <li>Made with care for the environment</li>
                </ul>
              </div>
            </div>
            {/* Shipping & Returns Panel - always expanded */}
            <div className="rounded-xl transition-all border shadow-sm bg-[#F8F9FB] border-[#D1D5DB] shadow-md flex flex-col" style={{minHeight: '64px'}}>
              <div className="w-full text-left px-6 py-4 font-semibold text-gray-700 flex items-center rounded-xl" style={{background: 'none', minHeight: '56px', fontSize: '17px', letterSpacing: '0.02em'}}>
                <span className="tracking-wide">Shipping &amp; Returns</span>
              </div>
              <div className="px-6 pb-6 text-gray-600 text-[16px] leading-relaxed" style={{fontFamily: 'var(--font-sans)', minHeight: '48px'}}>
                <ul className="list-disc pl-4">
                  <li>Free shipping on orders over $100</li>
                  <li>Easy 30-day returns</li>
                  <li>Fast delivery (2-5 business days)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ...existing code...
// ...existing code...

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

}