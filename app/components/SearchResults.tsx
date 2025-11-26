import { Pagination } from '@shopify/hydrogen';
import { Link } from 'react-router';
import { ProductGrid } from '~/components/ProductGrid';
import { urlWithTrackingParams, type RegularSearchReturn } from '~/lib/search';

type SearchItems = RegularSearchReturn['result']['items'];
type PartialSearchResult<ItemType extends keyof SearchItems> = Pick<
  SearchItems,
  ItemType
> &
  Pick<RegularSearchReturn, 'term'>;

type SearchResultsProps = RegularSearchReturn & {
  children: (args: SearchItems & {term: string}) => React.ReactNode;
};

export function SearchResults({
  term,
  result,
  children,
}: Omit<SearchResultsProps, 'error' | 'type'>) {
  if (!result?.total) {
    return null;
  }

  return children({...result.items, term});
}

SearchResults.Articles = SearchResultsArticles;
SearchResults.Pages = SearchResultsPages;
SearchResults.Products = SearchResultsProducts;
SearchResults.Empty = SearchResultsEmpty;

function SearchResultsArticles({
  term,
  articles,
}: PartialSearchResult<'articles'>) {
  if (!articles?.nodes.length) {
    return null;
  }

  return (
    <div className="search-result">
      <h2>Articles</h2>
      <div>
        {articles?.nodes?.map((article) => {
          const articleUrl = urlWithTrackingParams({
            baseUrl: `/blogs/${article.handle}`,
            trackingParams: article.trackingParameters,
            term,
          });

          return (
            <div className="search-results-item" key={article.id}>
              <Link prefetch="intent" to={articleUrl}>
                {article.title}
              </Link>
            </div>
          );
        })}
      </div>
      <br />
    </div>
  );
}

function SearchResultsPages({term, pages}: PartialSearchResult<'pages'>) {
  if (!pages?.nodes.length) {
    return null;
  }

  return (
    <div className="search-result">
      <h2>Pages</h2>
      <div>
        {pages?.nodes?.map((page) => {
          const pageUrl = urlWithTrackingParams({
            baseUrl: `/pages/${page.handle}`,
            trackingParams: page.trackingParameters,
            term,
          });

          return (
            <div className="search-results-item" key={page.id}>
              <Link prefetch="intent" to={pageUrl}>
                {page.title}
              </Link>
            </div>
          );
        })}
      </div>
      <br />
    </div>
  );
}

function SearchResultsProducts({
  term,
  products,
}: PartialSearchResult<'products'>) {
  if (!products?.nodes.length) {
    return null;
  }

  return (
    <div className="search-result">
      <h2>Products</h2>
      <Pagination connection={products}>
        {({nodes, isLoading, NextLink}) => {
          const mapped = nodes.map((product) => ({
            id: product.id,
            title: product.title,
            handle: product.handle,
            featuredImage: product?.selectedOrFirstAvailableVariant?.image,
            priceRange: { minVariantPrice: product?.selectedOrFirstAvailableVariant?.price },
          }));

          const ItemsMarkup = (
            <div>
              <ProductGrid products={mapped as any} />
            </div>
          );

          return (
            <div>
              {/* PreviousLink removed intentionally for search results pagination */}
              <div>
                {ItemsMarkup}
                <br />
              </div>
              <div>
                <div className="load-more-wrap">
                  <NextLink className="load-more-btn" aria-label="Load more">
                  {isLoading ? (
                    <span className="load-btn-spinner" aria-hidden />
                  ) : (
                    <span className="load-btn">
                      <span className="load-btn-text">Load more</span>
                      <span className="load-btn-icon" aria-hidden>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="block">
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </span>
                    </span>
                  )}
                  </NextLink>
                </div>
              </div>
            </div>
          );
        }}
      </Pagination>
      <br />
    </div>
  );
}

function SearchResultsEmpty() {
  return <p>No results, try a different search.</p>;
}
