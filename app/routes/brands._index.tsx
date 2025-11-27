import type { Route } from './+types/brands._index';
import { useLoaderData } from 'react-router';

/**
 * Brands Index Page
 *
 * Fetches all brand collections from the "brands" menu in Shopify.
 * Each menu item should link to a Collection that represents one brand.
 *
 * To add this page to your navigation:
 * - Add a menu item in Shopify Admin linking to /brands
 * - Or manually add <Link to="/brands">Brands</Link> in your Header component
 */

// Page metadata
export const meta: Route.MetaFunction = () => {
  return [
    { title: 'TALLA | Brands' },
    { name: 'description', content: 'Shop our curated collection of premium fashion brands.' },
  ];
};

interface BrandCard {
  id: string;
  title: string;
  handle: string;
  imageUrl: string | null;
  imageAlt: string | null;
  url: string;
}

export async function loader({ context }: Route.LoaderArgs) {
  const { storefront } = context;

  // Fetch the "brands" menu from Shopify
  const { menu } = await storefront.query(BRANDS_MENU_QUERY, {
    variables: {
      handle: 'brands',
    },
    cache: storefront.CacheLong(),
  });

  if (!menu) {
    throw new Response('Brands menu not found', { status: 404 });
  }

  // Transform menu items into brand cards
  const brands: BrandCard[] = menu.items
    .filter((item: any) => {
      // Only include items that link to collections
      return item.resource?.__typename === 'Collection';
    })
    .map((item: any) => {
      const collection = item.resource;
      const imageUrl = collection.image?.url || null;

      console.log('Brand:', collection.title, 'Image URL:', imageUrl);

      return {
        id: collection.id,
        title: collection.title,
        handle: collection.handle,
        imageUrl: imageUrl,
        imageAlt: collection.image?.altText || collection.title,
        url: `/collections/${collection.handle}`,
      };
    });

  console.log('Total brands loaded:', brands.length);
  console.log('Brands with images:', brands.filter(b => b.imageUrl).length);

  return { brands };
}

export default function BrandsIndex() {
  const { brands } = useLoaderData<typeof loader>();

  console.log('Component - brands:', brands);
  console.log('Component - brands with images:', brands.filter(b => b.imageUrl).length);

  return (
    <div className="min-h-screen bg-[var(--color-bg,#FBFBFB)] overflow-x-hidden">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-12 lg:py-16">
        {/* Page Header */}
        <header className="mb-12 text-center">
          <h1
            className="text-4xl md:text-5xl lg:text-6xl tracking-tight text-[var(--color-text,#292929)] mb-4"
            style={{ fontFamily: '"Playfair Display SC", serif' }}
          >
            Brands
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our curated selection of premium fashion brands
          </p>
        </header>

        {/* DEBUG BOX */}
        <div className="mb-8 border-2 border-yellow-500 bg-yellow-50 p-4 rounded">
          <h3 className="font-bold mb-2">DEBUG - Brand Images</h3>
          {brands.map((brand) => (
            <div key={brand.id} className="text-xs mb-1">
              <strong>{brand.title}:</strong> {brand.imageUrl || 'NO IMAGE'}
            </div>
          ))}
        </div>

        {/* Brands Grid */}
        {brands.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No brands available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 lg:gap-8">
            {brands.map((brand) => (
              <a
                key={brand.id}
                href={brand.url}
                className="group flex flex-col items-center justify-center rounded-2xl border border-[var(--color-surface,#DDDEE2)] bg-[var(--color-bg,#FBFBFB)] p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
              >
                {/* Brand Logo */}
                <div className="w-full aspect-square mb-4 flex items-center justify-center">
                  {brand.imageUrl ? (
                    <img
                      src={brand.imageUrl}
                      alt={brand.imageAlt || brand.title}
                      className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
                      <span
                        className="text-2xl font-semibold text-gray-400 uppercase tracking-wider"
                        style={{ fontFamily: '"Playfair Display SC", serif' }}
                      >
                        {brand.title.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Brand Name */}
                <h2 className="text-sm md:text-base font-medium uppercase tracking-wider text-[var(--color-text,#292929)] text-center">
                  {brand.title}
                </h2>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// GraphQL Query to fetch brands menu
const BRANDS_MENU_QUERY = `#graphql
  query BrandsMenu($handle: String!) {
    menu(handle: $handle) {
      id
      items {
        id
        title
        url
        resource {
          __typename
          ... on Collection {
            id
            title
            handle
            image {
              url
              altText
              width
              height
            }
          }
        }
      }
    }
  }
` as const;
