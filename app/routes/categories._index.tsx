import { Image } from '@shopify/hydrogen';
import { Link, useLoaderData } from 'react-router';
import type { Route } from './+types/categories._index';

/**
 * Categories Index Page
 *
 * Fetches all category collections from the "categories" menu in Shopify.
 * Each menu item should link to a Collection that represents one category.
 *
 * To add this page to your navigation:
 * - Add a menu item in Shopify Admin linking to /categories
 * - Or manually add <Link to="/categories">Categories</Link> in your Header component
 */

// Page metadata
export const meta: Route.MetaFunction = () => {
  return [
    { title: 'TALLA | Categories' },
    { name: 'description', content: 'Shop our curated collection of fashion categories.' },
  ];
};

interface CategoryCard {
  id: string; 
  title: string;
  handle: string;
  // Keep the original image object so we can use Hydrogen's Image component
  image: any | null;
  imageAlt: string | null;
  url: string;
}

export async function loader({ context }: Route.LoaderArgs) {
  const { storefront } = context;

  // Use a shorter cache strategy in development so menu changes appear immediately.
  // In production, continue using a long-lived cache for performance.
  const cacheStrategy =
    process.env.NODE_ENV === 'development'
      ? storefront.CacheNone()
      : storefront.CacheLong();

  // Fetch the "categories" menu from Shopify
  const { menu } = await storefront.query(CATEGORIES_MENU_QUERY, {
    variables: {
      handle: 'categories',
    },
    cache: cacheStrategy,
  });

  if (!menu) {
    throw new Response('Categories menu not found', { status: 404 });
  }

  // Debug log the menu items so we can verify what the server returned
  // (This appears in server logs, not the browser console.)
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.log('Categories menu items:', menu?.items?.map((i: any) => ({ id: i.id, title: i.title, url: i.url, resourceType: i.resource?.__typename })));
  }

  // Transform menu items into category cards. We include any menu item so folks who added
  // menu links as custom URLs (eg. /collections/category-handle) can still see the category.
  // For custom URL items that look like collections, we'll try to fetch the collection
  // by handle to acquire image metadata.
  const fallbackHandles = new Set<string>();
  const itemsWithFallbackHandle: Record<string, any> = {};

  for (const item of menu.items) {
    if (item.resource?.__typename !== 'Collection') {
      const fallbackHandle = (item.url || '')?.match(/\/collections\/([^/?#]+)/)?.[1] ?? null;
      if (fallbackHandle) {
        fallbackHandles.add(fallbackHandle);
        itemsWithFallbackHandle[item.id] = fallbackHandle;
      }
    }
  }

  // If we discovered fallback handles, fetch collection details for each handle
  const fallbackCollectionsByHandle: Record<string, any> = {};
  if (fallbackHandles.size > 0) {
    const handles = [...fallbackHandles];
    const collectionQueryPromises = handles.map((h) =>
      storefront
        .query(GET_COLLECTION_BY_HANDLE_QUERY, {
          variables: { handle: h },
          cache: cacheStrategy,
        })
        .then((res: any) => ({ handle: h, collection: res.collectionByHandle }))
        .catch((err: unknown) => {
          // Swallow errors per loader pattern — logging is enough
          // eslint-disable-next-line no-console
          console.error(`Failed to fetch collection for handle: ${h}`, err);
          return { handle: h, collection: null };
        })
    );

    const collectionResults = await Promise.all(collectionQueryPromises);
    for (const result of collectionResults) {
      if (result.collection) fallbackCollectionsByHandle[result.handle] = result.collection;
    }
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.log('Fetched collections for fallback handles:', Object.keys(fallbackCollectionsByHandle));
    }
  }

  const categories: CategoryCard[] = menu.items.map((item: any) => {
    if (item.resource?.__typename === 'Collection') {
      const collection = item.resource;
      const image = collection.image || null;
      return {
        id: collection.id,
        title: collection.title,
        handle: collection.handle,
        image: image,
        imageAlt: image?.altText || collection.title,
        url: `/collections/${collection.handle}`,
      };
    }

    // Fallback: If the menu item doesn't point at a 'Collection' resource but links
    // to a collections URL (or is a custom URL pointing to /collections/handle), keep it.
    const fallbackHandle = itemsWithFallbackHandle[item.id];
    const fetchedCollection = fallbackHandle ? fallbackCollectionsByHandle[fallbackHandle] : null;
    if (fetchedCollection) {
      const img = fetchedCollection.image || null;
      return {
        id: fetchedCollection.id,
        title: fetchedCollection.title,
        handle: fetchedCollection.handle,
        image: img,
        imageAlt: img?.altText || fetchedCollection.title,
        url: `/collections/${fetchedCollection.handle}`,
      };
    }
    // else generic fallback card without image
    return {
      id: item.id,
      title: item.title,
      handle: fallbackHandle ?? item.title,
      image: null,
      imageAlt: item.title,
      url: item.url || '#',
    };
  });
    

  // Debug logging removed

  return { categories };
}

export default function CategoriesIndex() {
  const { categories } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-[#FDF8F7]">
      {/* HERO SECTION */}
      <section className="relative py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-[1440px] px-6 sm:px-10 lg:px-16">
          <div className="text-center">
            <p
              className="text-[11px] tracking-[0.28em] uppercase text-[#5A4A4C]/70 mb-3"
              style={{
                fontFamily: 'Georgia, "Playfair Display SC", serif',
              }}
            >
              Explore Our
            </p>
            <h1
              className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-[0.18em] uppercase text-[#1F191A] mb-6"
              style={{fontFamily: 'Aeonik, sans-serif'}}
            >
              Categories
            </h1>
            <div className="mx-auto h-[2px] w-16 rounded-full bg-[#1F191A] mb-5" />
            <p
              className="mx-auto max-w-2xl text-sm sm:text-base leading-relaxed text-[#5A4A4C] text-center"
              style={{fontFamily: 'Quicking, sans-serif'}}
            >
              Discover our curated selection of fashion categories, each chosen for exceptional quality and timeless style.
            </p>
          </div>
        </div>
      </section>

      {/* CATEGORIES GRID */}
      <section className="pb-20 lg:pb-24">
        <div className="mx-auto max-w-[1440px] px-6 sm:px-10 lg:px-16">
          {categories.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-[#5A4A4C] text-base">No categories available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={category.url}
                  prefetch="intent"
                  className="group block"
                >
                  <div className="relative overflow-hidden rounded-2xl bg-white border border-[#E8E9EC] shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-all duration-300 group-hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] group-hover:-translate-y-1">
                    {/* Category Image Container */}
                    <div className="aspect-square p-8 flex items-center justify-center bg-gradient-to-br from-white to-[#FAFAFA]">
                      {category.image ? (
                        <Image
                          data={category.image}
                          alt={category.imageAlt || category.title}
                          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
                          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span
                            className="text-4xl sm:text-5xl font-bold text-[#E8E9EC] uppercase tracking-[0.1em]"
                            style={{ fontFamily: 'Aeonik, sans-serif' }}
                          >
                            {category.title.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Category Name */}
                    <div className="px-5 py-4 border-t border-[#E8E9EC] bg-white">
                      <h2
                        className="text-sm sm:text-base font-semibold tracking-[0.12em] uppercase text-[#1F191A] text-center transition-colors duration-200 group-hover:text-[#5A4A4C]"
                        style={{fontFamily: 'Aeonik, sans-serif'}}
                      >
                        {category.title}
                      </h2>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

// GraphQL Query to fetch categories menu
const CATEGORIES_MENU_QUERY = `#graphql
  query CategoriesMenu($handle: String!) {
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
              id
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

// GraphQL Query to fetch a collection by handle (for URL fallback items)
const GET_COLLECTION_BY_HANDLE_QUERY = `#graphql
  query CollectionByHandle($handle: String!) {
    collectionByHandle(handle: $handle) {
      id
      title
      handle
      image {
        id
        url
        altText
        width
        height
      }
    }
  }
` as const;
