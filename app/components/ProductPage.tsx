import { useState } from 'react';
import { Link } from 'react-router';
import type { ProductQuery } from 'storefrontapi.generated';
import {
  ProductBuyBox,
  type PDPProduct,
  type PDPVariant,
  type SimilarProduct,
} from './ProductBuyBox';
import type { PDPImage } from './ProductGallery';
import { ProductGallery } from './ProductGallery';

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

type ShopifyProduct = NonNullable<ProductQuery['product']>;

interface ProductPageProps {
  product: ShopifyProduct;
  selectedVariant: ShopifyProduct['selectedOrFirstAvailableVariant'];
  similarProducts?: SimilarProduct[];
}

export function ProductPage({product, selectedVariant, similarProducts}: ProductPageProps) {
  // Transform selectedVariant to PDPVariant
  const transformVariant = (
    v: NonNullable<ShopifyProduct['selectedOrFirstAvailableVariant']>,
  ): PDPVariant => ({
    id: v.id,
    title: v.title,
    availableForSale: v.availableForSale,
    selectedOptions: v.selectedOptions.map((o) => ({
      name: o.name,
      value: o.value,
    })),
    price: {amount: v.price.amount, currencyCode: v.price.currencyCode},
    sku: v.sku || undefined,
  });

  const initialVariant = selectedVariant ? transformVariant(selectedVariant) : null;
  const [currentVariant, setCurrentVariant] =
    useState<PDPVariant | null>(initialVariant);
  const [userMeasurements, setUserMeasurements] =
    useState<UserMeasurements | null>(null);
  const [recommendedSize, setRecommendedSize] = useState<string | null>(null);

  // TODO: Load user measurements from localStorage and update recommendedSize
  // Example (pseudo):
  // useEffect(() => {
  //   const saved = window.localStorage.getItem('talla-user-measurements');
  //   if (saved) {
  //     const parsed = JSON.parse(saved) as UserMeasurements;
  //     setUserMeasurements(parsed);
  //     const size = calculateRecommendedSize(parsed, product);
  //     setRecommendedSize(size);
  //   }
  // }, [product]);

  // Transform Shopify product data to PDP format
  const images: PDPImage[] =
    product.images?.nodes?.map((img) => ({
      id: img.id || undefined,
      url: img.url,
      alt: img.altText || product.title,
      width: img.width || undefined,
      height: img.height || undefined,
    })) ?? [];

  const pdpVariants: PDPVariant[] =
    product.variants?.nodes?.map((v) => ({
      id: v.id,
      title: v.title,
      availableForSale: v.availableForSale,
      selectedOptions: v.selectedOptions.map((o) => ({
        name: o.name,
        value: o.value,
      })),
      price: {amount: v.price.amount, currencyCode: v.price.currencyCode},
      sku: v.sku || undefined,
    })) ?? [];

  const pdpProduct: PDPProduct = {
    id: product.id,
    title: product.title,
    handle: product.handle,
    vendor: product.vendor,
    description: product.description,
    productType: product.productType,
    tags: product.tags,
    options:
      product.options?.map((opt) => ({
        name: opt.name,
        values:
          opt.optionValues?.map((ov) => ov.name) ??
          // Fallback for legacy / different shapes
          // @ts-expect-error values may exist on older types
          opt.values ??
          [],
      })) ?? [],
    priceRange:
      product.priceRange ??
      (currentVariant?.price
        ? {minVariantPrice: currentVariant.price}
        : {
            minVariantPrice: {
              amount: '0',
              currencyCode: 'USD',
            },
          }),
    variants: pdpVariants,
    // sizeChartImage will be mapped later
  };

  // Extract size chart metafield and map to pdpProduct.sizeChartImage
  try {
    const nodes = (product as any)?.metafields?.nodes ?? [];
    const keyNames = ['size_chart', 'size-chart', 'sizeChart', 'sizechart', 'size_chart_image', 'size-chart-image', 'sizechartimage'];
    const found = nodes.find((m: any) => (m && m.key && keyNames.includes(m.key)) || (m && m.key && m.key.toLowerCase().includes('size')));
    if (found) {
      const ref = found.reference;
      if (ref && ref.__typename === 'MediaImage' && ref.image?.url) {
        pdpProduct.sizeChartImage = { url: ref.image.url, alt: ref.image.altText ?? 'Size chart' } as any;
      } else if (ref && (ref.url || ref.alt)) {
        pdpProduct.sizeChartImage = { url: ref.url ?? (found.value || ''), alt: found?.value ?? 'Size chart' } as any;
      } else if (found.value && typeof found.value === 'string' && found.value.startsWith('http')) {
        pdpProduct.sizeChartImage = { url: found.value, alt: 'Size chart' } as any;
      }
    }
  } catch (e) {
    // ignore: product might not contain metafields from the query; sizeChart remains undefined
  }

  // No fallback - show only loader-provided similar products that match tag overlap

  // Simple size recommendation algorithm (kept for future use)
  const calculateRecommendedSize = (
    measurements: UserMeasurements,
    _product: ShopifyProduct,
  ): string | null => {
    const {height, weight, bodyFit, gender} = measurements;

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
    else if (bmi > 30) sizeIndex += 2;

    // Body fit preference
    if (bodyFit === 'slim') sizeIndex -= 1;
    else if (bodyFit === 'athletic') sizeIndex += 0; // between regular & relaxed
    else if (bodyFit === 'relaxed') sizeIndex += 1;

    // Gender adjustment
    if (gender === 'female') sizeIndex -= 0.5;

    // Map to standard sizes
    const sizes = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL'];
    const finalIndex = Math.max(
      0,
      Math.min(sizes.length - 1, Math.round(sizeIndex)),
    );

    return sizes[finalIndex];
  };

  // You can later call calculateRecommendedSize + setRecommendedSize
  // whenever userMeasurements changes.
  void calculateRecommendedSize;
  void userMeasurements;
  void setUserMeasurements;
  void setRecommendedSize;

  // Image gallery handled by ProductGallery

  return (
    <>
      {/* MAIN PAGE */}
      <div className="min-h-screen bg-white overflow-x-hidden">
        <div className="product-container grid grid-cols-1 items-start gap-12 px-6 py-10 md:grid-cols-2 lg:px-12 lg:py-14 max-w-full">
          {/* Gallery: product gallery with hero image and static thumbnail carousel */}
          <div className="product-gallery flex w-full flex-col items-center justify-start md:items-start overflow-x-hidden">
            <ProductGallery images={images} productTitle={product.title} />

            {/* Similar Products Section - Desktop Only */}
            {similarProducts && similarProducts.length > 0 && (
              <div className="hidden md:block w-full mt-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Similar Products
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {similarProducts.map((similar) => (
                    <Link
                      key={similar.id}
                      to={`/products/${similar.handle}`}
                      className="group flex flex-col gap-2 rounded-lg border border-gray-200 bg-white p-3 transition-all hover:border-gray-900 hover:shadow-md"
                    >
                      {similar.featuredImage && (
                        <div className="aspect-square w-full overflow-hidden rounded-md bg-gray-100">
                          <img
                            src={similar.featuredImage.url}
                            alt={similar.featuredImage.altText || similar.title}
                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                          />
                        </div>
                      )}
                      <div className="flex flex-col gap-1">
                        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
                          {similar.title}
                        </h3>
                        <p className="text-sm font-semibold text-gray-900">
                          {similar.priceRange.minVariantPrice.currencyCode}{' '}
                          {similar.priceRange.minVariantPrice.amount}
                        </p>
                        {similar.tags && similar.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {similar.tags.slice(0, 2).map((tag, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-gray-100 text-gray-600"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Details (right side) */}
          <div className="product-details flex w-full flex-col justify-start md:items-start overflow-x-hidden">
            {currentVariant && (
              <ProductBuyBox
                product={pdpProduct}
                selectedVariant={currentVariant}
                onVariantChange={setCurrentVariant}
                recommendedSize={recommendedSize}
              />
            )}

            {/* Info sections */}
            <div className="mt-8 flex flex-col gap-6">
              {/* Description Panel */}
              <div className="flex min-h-[64px] flex-col rounded-xl border border-[#D1D5DB] bg-[#F8F9FB] shadow-md transition-all">
                <div className="flex min-h-[56px] items-center rounded-xl px-6 py-4 text-left text-[17px] font-semibold tracking-[0.02em] text-gray-700">
                  <span className="tracking-wide">Description</span>
                </div>
                <div className="min-h-[48px] px-6 pb-6 text-[16px] leading-relaxed text-gray-600">
                  {product.description || 'No description available.'}
                </div>
              </div>

              {/* Details & Care Panel */}
              <div className="flex min-h-[64px] flex-col rounded-xl border border-[#D1D5DB] bg-[#F8F9FB] shadow-md transition-all">
                <div className="flex min-h-[56px] items-center rounded-xl px-6 py-4 text-left text-[17px] font-semibold tracking-[0.02em] text-gray-700">
                  <span className="tracking-wide">Details &amp; Care</span>
                </div>
                <div className="min-h-[48px] px-6 pb-6 text-[16px] leading-relaxed text-gray-600">
                  <ul className="list-disc pl-4">
                    <li>Premium materials for comfort</li>
                    <li>Machine washable</li>
                    <li>Made with care for the environment</li>
                  </ul>
                  {/* Size chart preview and link */}
                  {pdpProduct.sizeChartImage && (
                    <div className="mt-4 flex items-center gap-4">
                      <img src={pdpProduct.sizeChartImage.url} alt={pdpProduct.sizeChartImage.alt || 'Size chart'} className="h-16 w-auto object-contain rounded-md border border-gray-100" />
                      <a href={pdpProduct.sizeChartImage.url} target="_blank" rel="noreferrer" className="text-sm font-semibold text-gray-700 hover:text-black underline">
                        View Size Chart
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Shipping & Returns Panel */}
              <div className="flex min-h-[64px] flex-col rounded-xl border border-[#D1D5DB] bg-[#F8F9FB] shadow-md transition-all">
                <div className="flex min-h-[56px] items-center rounded-xl px-6 py-4 text-left text-[17px] font-semibold tracking-[0.02em] text-gray-700">
                  <span className="tracking-wide">Shipping &amp; Returns</span>
                </div>
                <div className="min-h-[48px] px-6 pb-6 text-[16px] leading-relaxed text-gray-600">
                  <ul className="list-disc pl-4">
                    <li>Free shipping on orders over $100</li>
                    <li>Easy 30-day returns</li>
                    <li>Fast delivery (2–5 business days)</li>
                  </ul>
                </div>
              </div>

              {/* Similar Products Section - Mobile Only */}
              {similarProducts && similarProducts.length > 0 && (
                <div className="w-full md:hidden">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Similar Products
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    {similarProducts.map((similar) => (
                      <Link
                        key={similar.id}
                        to={`/products/${similar.handle}`}
                        className="group flex flex-col gap-2 rounded-lg border border-gray-200 bg-white p-3 transition-all hover:border-gray-900 hover:shadow-md"
                      >
                        {similar.featuredImage && (
                          <div className="aspect-square w-full overflow-hidden rounded-md bg-gray-100">
                            <img
                              src={similar.featuredImage.url}
                              alt={similar.featuredImage.altText || similar.title}
                              className="h-full w-full object-cover transition-transform group-hover:scale-105"
                            />
                          </div>
                        )}
                        <div className="flex flex-col gap-1">
                          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
                            {similar.title}
                          </h3>
                          <p className="text-sm font-semibold text-gray-900">
                            {similar.priceRange.minVariantPrice.currencyCode}{' '}
                            {similar.priceRange.minVariantPrice.amount}
                          </p>
                          {similar.tags && similar.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {similar.tags.slice(0, 2).map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-gray-100 text-gray-600"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Product gallery handles its own modal viewer */}
    </>
  );
}
