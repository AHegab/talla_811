import { useState } from 'react';
import { ProductBuyBox, type PDPProduct, type PDPVariant } from './ProductBuyBox';
import { ProductGallery, type PDPImage } from './ProductGallery';
import { SimilarItems } from './SimilarItems';

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
}

interface ProductPageProps {
  product: ShopifyProduct;
  selectedVariant: any;
}

export function ProductPage({product, selectedVariant}: ProductPageProps) {
  const [currentVariant, setCurrentVariant] = useState(selectedVariant);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

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
    options: product.options || [],
    variants: pdpVariants,
    priceRange: product.priceRange || {minVariantPrice: currentVariant.price},
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const primaryImageUrl = images[0]?.url || '';

  return (
    <div style={{backgroundColor: '#FBFBFB'}}>
      {/* Main Product Section */}
      <div className="max-w-content mx-auto px-6 sm:px-10 lg:px-16 xl:px-20 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16">
          {/* Left Column - Image Gallery */}
          <ProductGallery images={images} productTitle={product.title} />

          {/* Right Column - Buy Box */}
          <div>
            <ProductBuyBox
              product={pdpProduct}
              selectedVariant={currentVariant}
              onVariantChange={setCurrentVariant}
            />

            {/* Product Details Accordions */}
            <div className="mt-12 space-y-0" style={{borderTop: '1px solid #E8E9EC'}}>
              {/* Description */}
              {product.description && (
                <ExpandableSection
                  title="Description"
                  isExpanded={expandedSection === 'description'}
                  onToggle={() => toggleSection('description')}
                >
                  <div
                    className="prose prose-sm max-w-none text-sm leading-relaxed"
                    style={{color: '#4A4B52', fontFamily: 'var(--font-sans)'}}
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
                  className="space-y-3 text-sm leading-relaxed"
                  style={{color: '#4A4B52', fontFamily: 'var(--font-sans)'}}
                >
                  <p>
                    Crafted with meticulous attention to detail and premium materials.
                    Each piece is carefully curated to ensure exceptional quality.
                  </p>
                  <ul className="space-y-2 list-disc list-inside ml-2">
                    <li>Premium quality materials</li>
                    <li>Expert craftsmanship</li>
                    <li>Care instructions included with purchase</li>
                  </ul>
                </div>
              </ExpandableSection>

              {/* Shipping & Returns */}
              <ExpandableSection
                title="Delivery & Returns"
                isExpanded={expandedSection === 'shipping'}
                onToggle={() => toggleSection('shipping')}
              >
                <div
                  className="space-y-4 text-sm leading-relaxed"
                  style={{color: '#4A4B52', fontFamily: 'var(--font-sans)'}}
                >
                  <div>
                    <p className="font-semibold mb-1" style={{color: '#292929'}}>
                      Shipping
                    </p>
                    <p>
                      Free standard shipping on orders over $100. Orders are processed
                      within 1-2 business days. Delivery takes 3-5 business days.
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold mb-1" style={{color: '#292929'}}>
                      Returns
                    </p>
                    <p>
                      We accept returns within 30 days of delivery. Items must be
                      unworn, unwashed, and in original condition with all tags attached.
                    </p>
                  </div>
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
    <div style={{borderTop: '1px solid #E8E9EC'}}>
      <button
        onClick={onToggle}
        className="w-full py-5 flex items-center justify-between text-left transition-colors hover:opacity-70 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2"
        aria-expanded={isExpanded}
      >
        <span
          className="text-sm uppercase tracking-wider font-semibold"
          style={{fontFamily: 'var(--font-sans)', color: '#292929', letterSpacing: '0.05em'}}
        >
          {title}
        </span>
        <svg
          className={`w-5 h-5 transition-transform duration-300 ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
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
          isExpanded ? 'max-h-[800px] pb-6' : 'max-h-0'
        }`}
      >
        {children}
      </div>
    </div>
  );
}

