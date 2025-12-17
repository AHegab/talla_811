import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import type { ProductQuery } from 'storefrontapi.generated';
import { ProductHeader } from './ProductHeader';
import { ProductImagesVertical, type PDPImage } from './ProductImagesVertical';
import { ProductDescription } from './ProductDescription';
import { SimilarProductsSection, type SimilarProduct } from './SimilarProductsSection';
import type { PDPProduct, PDPVariant } from './ProductBuyBox';
import { mapMaterialToFabricType } from '~/lib/fabricMapping';
import SizeChart from './SizeChart';

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
  brandSizeChart?: { url: string; alt?: string; source?: string } | null;
}

export function ProductPage({product, selectedVariant, similarProducts, brandSizeChart}: ProductPageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sizeChartOpen, setSizeChartOpen] = useState(false);

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

  // Don't maintain local variant state - use the prop directly
  const currentVariant = selectedVariant ? transformVariant(selectedVariant) : null;

  const [userMeasurements, setUserMeasurements] =
    useState<UserMeasurements | null>(null);
  const [recommendedSize, setRecommendedSize] = useState<string | null>(null);

  // State for selected options (moved from ProductBuyBox)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(
    () => {
      const initial: Record<string, string> = {};
      if (selectedVariant) {
        selectedVariant.selectedOptions.forEach((option) => {
          initial[option.name] = option.value;
        });
      }
      return initial;
    },
  );

  // Sync selectedOptions with selectedVariant changes
  useEffect(() => {
    if (selectedVariant) {
      const newSelectedOptions: Record<string, string> = {};
      selectedVariant.selectedOptions.forEach((option) => {
        newSelectedOptions[option.name] = option.value;
      });
      setSelectedOptions(newSelectedOptions);
    }
  }, [selectedVariant?.id]);

  // Handle option changes (moved from ProductBuyBox)
  const handleOptionChange = (optionName: string, value: string) => {
    // Update local state for immediate UI feedback
    setSelectedOptions((prev) => ({ ...prev, [optionName]: value }));

    // Update URL search params to trigger variant selection
    const newParams = new URLSearchParams(searchParams);
    newParams.set(optionName, value);
    setSearchParams(newParams, {
      replace: true,
      preventScrollReset: true,
    });
  };


  // Transform Shopify product data to PDP format
  // Prioritize selected variant image first, then show all product images
  const allImages: PDPImage[] =
    product.images?.nodes?.map((img) => ({
      id: img.id || undefined,
      url: img.url,
      alt: img.altText || product.title,
      width: img.width || undefined,
      height: img.height || undefined,
    })) ?? [];

  // Get the selected variant's image (from Shopify if assigned)
  let variantImage = selectedVariant?.image;

  // Fallback: If no variant image is assigned, try to find one by matching color name
  if (!variantImage && selectedVariant) {
    // Get color option value
    const colorOption = selectedVariant.selectedOptions?.find(
      opt => opt.name.toLowerCase() === 'color' || opt.name.toLowerCase() === 'colour'
    );

    if (colorOption) {
      const colorValue = colorOption.value.toLowerCase();

      // Try to find an image with the color in the alt text or URL
      const matchingImage = product.images?.nodes?.find((img) => {
        const altText = (img.altText || '').toLowerCase();
        const url = (img.url || '').toLowerCase();

        // Check if color name appears in alt text or URL
        return altText.includes(colorValue) || url.includes(colorValue);
      });

      if (matchingImage) {
        variantImage = matchingImage as any;
      }
    }
  }


  // Reorder images to show variant image first
  const images: PDPImage[] = variantImage
    ? [
        {
          id: variantImage.id || undefined,
          url: variantImage.url,
          alt: variantImage.altText || product.title,
          width: variantImage.width || undefined,
          height: variantImage.height || undefined,
        },
        ...allImages.filter((img) => img.id !== variantImage.id),
      ]
    : allImages;

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

  // Map brand size chart if provided by loader
  if (brandSizeChart && brandSizeChart.url) {
    pdpProduct.brandSizeChartImage = { url: brandSizeChart.url, alt: brandSizeChart.alt ?? 'Brand size chart' } as any;
  }

  // Extract size chart metafield and map to pdpProduct.sizeChartImage
  const extractMetafieldImage = (m: any): { url: string; alt?: string } | undefined => {
    if (!m) return undefined;
    try {
      // reference object is preferred for single-media metafields
      const ref = m.reference;
      if (ref) {
        if (ref.__typename === 'MediaImage' && ref.image?.url) {
          return { url: ref.image.url, alt: ref.image.altText ?? m.value ?? undefined };
        }
        // GenericFile, or File-like structures
        if (ref.url) return { url: ref.url, alt: m.value ?? undefined };
        // If the reference includes a 'file' or 'previewImage'
        const nested = ref.image || ref.previewImage || ref.file;
        if (nested?.url) return { url: nested.url, alt: nested?.altText ?? m.value ?? undefined };
      }
      // value may be a plain URL, JSON, or HTML - handle common cases
      if (m.value && typeof m.value === 'string') {
        const trimmed = m.value.trim();
        if (trimmed.startsWith('http')) return { url: trimmed, alt: undefined };
        // JSON (Shopify sometimes stores file metadata as JSON string)
        if (trimmed.startsWith('{')) {
          try {
            const parsed: any = JSON.parse(trimmed);
            const url = parsed.url || parsed.src || parsed.file?.url || parsed.previewImage?.url;
            const alt = parsed.alt || parsed.altText || parsed.previewImage?.altText;
            if (url) return { url, alt };
          } catch (e) {
            // ignore
          }
        }
        // HTML; find <img src="..."
        const imgSrcMatch = trimmed.match(/<img[^>]+src=["']([^"'>]+)["']/i);
        if (imgSrcMatch) return { url: imgSrcMatch[1], alt: undefined };
      }
    } catch (e) {
      // Ignore parse errors
    }
    return undefined;
  };

  try {
    // Extract size chart from the sizeChart metafield
    const sizeChartMetafield = (product as any)?.sizeChart;
    if (sizeChartMetafield) {
      const extracted = extractMetafieldImage(sizeChartMetafield);
      if (extracted?.url) {
        pdpProduct.sizeChartImage = { url: extracted.url, alt: extracted.alt ?? sizeChartMetafield?.value ?? 'Size chart' } as any;
      }
    }

    // Extract size dimensions for smart recommendations
    const sizeDimensionsMetafield = (product as any)?.sizeDimensions;

    if (sizeDimensionsMetafield?.value) {
      try {
        const parsed = JSON.parse(sizeDimensionsMetafield.value);
        if (parsed && typeof parsed === 'object') {
          pdpProduct.sizeDimensions = parsed as any;
        }
      } catch (parseError) {
        console.error('Failed to parse size dimensions metafield:', parseError);
      }
    }

    // Extract fabric type for smart recommendations
    const fabricTypeMetafield = (product as any)?.metafields?.find(
      (mf: any) => mf?.namespace === 'custom' && mf?.key === 'fabric_type'
    );

    if (fabricTypeMetafield?.value) {
      // Use the material mapping to convert material names to fabric types
      const mappedFabricType = mapMaterialToFabricType(fabricTypeMetafield.value);

      if (mappedFabricType) {
        pdpProduct.fabricType = mappedFabricType;
      }
    }

  } catch (e) {
    console.error('Error extracting metafields:', e);
  }

  // Size recommendation algorithm
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

  // Image gallery handled by ProductGallery

  return (
    <>
      <div className="min-h-screen bg-white w-full overflow-x-hidden">
        {/* Images Section - Full Width, Absolutely Positioned from Top */}
        <div className="w-full pt-14 sm:pt-16 lg:pt-[52px]">
          <ProductImagesVertical
            key={selectedVariant?.id}
            images={images}
            productTitle={product.title}
            sizeChartUrl={pdpProduct.sizeChartImage?.url || pdpProduct.brandSizeChartImage?.url}
            onSizeGuideClick={() => setSizeChartOpen(true)}
          />
        </div>

        {/* Content Container */}
        <div className="w-full">
          {/* Description & Materials */}
          <div className="px-4 py-6 md:px-8 max-w-2xl mx-auto">
            <ProductDescription
              description={product.description}
              fabricType={pdpProduct.fabricType}
            />
          </div>

          {/* Similar Products */}
          {similarProducts && similarProducts.length > 0 && (
            <div className="px-4 py-6 md:px-8 max-w-2xl mx-auto">
              <SimilarProductsSection products={similarProducts} />
            </div>
          )}

          {/* Bottom Padding for Product Header */}
          <div className="pb-32"></div>
        </div>
      </div>

      {/* Fixed Header at Bottom - OUTSIDE main container to avoid transform issues */}
      {currentVariant && (
        <ProductHeader
          product={pdpProduct}
          selectedVariant={currentVariant}
          recommendedSize={recommendedSize}
          onOptionChange={handleOptionChange}
          selectedOptions={selectedOptions}
        />
      )}

      {/* Size Chart Modal */}
      {sizeChartOpen && (
        <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/60" style={{ zIndex: 10000 }} onClick={() => setSizeChartOpen(false)}>
          <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-white">Size Chart</h4>
              <button onClick={() => setSizeChartOpen(false)} className="text-white hover:text-gray-300 text-2xl font-bold">&times;</button>
            </div>
            <SizeChart
              imageUrl={pdpProduct.sizeChartImage?.url || pdpProduct.brandSizeChartImage?.url}
              alt={pdpProduct.sizeChartImage?.alt || pdpProduct.brandSizeChartImage?.alt || 'Size chart'}
            />
          </div>
        </div>
      )}
    </>
  );
}
