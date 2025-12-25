import { Link, useLoaderData } from '@remix-run/react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import type { Route } from './+types/_index';

import { HeroCarousel } from '~/components/HeroCarousel';
import { Container } from '~/components/ui';

export const meta: Route.MetaFunction = () => {
  return [
    {title: 'TALLA | Premium Fashion'},
    {
      name: 'description',
      content:
        'Discover curated premium fashion from local brands on TALLA. Shop new arrivals, timeless essentials, and statement pieces.',
    },
  ];
};

type Collection = {
  id?: string;
  title?: string;
  handle?: string;
  image?: {
    url?: string;
    altText?: string;
  };
};

export async function loader({context}: Route.LoaderArgs) {
  // Fetch the "categories" menu from Shopify instead of all collections
  const {menu} = await context.storefront.query(CATEGORIES_MENU_QUERY, {
    variables: {
      handle: 'categories',
    },
  });

  // Transform menu items to collection format
  const collections = menu?.items.map((item: any) => {
    if (item.resource?.__typename === 'Collection') {
      return {
        id: item.resource.id,
        title: item.resource.title,
        handle: item.resource.handle,
        image: item.resource.image,
      };
    }
    return null;
  }).filter(Boolean) ?? [];

  return {
    collections,
  };
}

export default function Homepage() {
  const { collections } = useLoaderData<typeof loader>();

  return (
    <main className="min-h-screen bg-talla-bg">
      {/* Hero Section - starts below the fixed header */}
      <section className="w-full mt-28 sm:mt-32 lg:mt-40">
        <HeroCarousel />
      </section>

      {/* Categories Section */}
      <section className="w-full pt-6 pb-12 sm:pt-8 sm:pb-16 lg:pt-10 lg:pb-20">
        <Container>
          <div className="space-y-6">
            {collections.map((collection, index) => (
              <CategoryCard
                key={collection.id}
                collection={collection}
                isLast={index === collections.length - 1}
              />
            ))}
          </div>
        </Container>
      </section>
    </main>
  );
}

function CategoryCard({
  collection,
  isLast
}: {
  collection: Collection;
  isLast: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  // Scale: grows from 1 to 1.15 as it approaches the top
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.15, 1.15]);
  
  // Margin: increases as scale increases to prevent overlap
  const marginBottom = useTransform(scrollYProgress, [0, 0.5, 1], [24, 48, 48]);

  return (
    <motion.div
      ref={ref}
      style={{ 
        scale,
        marginBottom: isLast ? 0 : marginBottom,
      }}
      className="origin-center"
    >
      <Link
        to={`/collections/${collection.handle}`}
        className="group relative block w-full aspect-[3/4] overflow-hidden"
      >
        {/* Category Image */}
        {collection.image && (
          <motion.img
            src={collection.image.url}
            alt={collection.image.altText || collection.title}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </Link>
    </motion.div>
  );
}

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
              url
              altText
            }
          }
        }
      }
    }
  }
` as const;
