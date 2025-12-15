import { Analytics, getShopAnalytics, useNonce } from '@shopify/hydrogen';
import {
    isRouteErrorResponse,
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
    useRouteError,
    useRouteLoaderData,
    type ShouldRevalidateFunction,
} from 'react-router';
import favicon from '~/assets/favicon.svg';
import { FOOTER_QUERY, HEADER_QUERY } from '~/lib/fragments';
import appStyles from '~/styles/app.css?url';
import fontsCss from '~/styles/fonts.css?url';
import type { Route } from './+types/root';
import { PageLayout } from './components/PageLayout';
import tailwindCss from './styles/tailwind.css?url';
import { ErrorBoundary as ReactErrorBoundary } from './components/ErrorBoundary';
import { AnalyticsProvider } from './lib/analytics/AnalyticsProvider';

export type RootLoader = typeof loader;

/**
 * This is important to avoid re-fetching root queries on sub-navigations
 */
export const shouldRevalidate: ShouldRevalidateFunction = ({
  formMethod,
  currentUrl,
  nextUrl,
}) => {
  // revalidate when a mutation is performed e.g add to cart, login...
  if (formMethod && formMethod !== 'GET') return true;

  // revalidate when manually revalidating via useRevalidator
  if (currentUrl.toString() === nextUrl.toString()) return true;

  // Defaulting to no revalidation for root loader data to improve performance.
  // When using this feature, you risk your UI getting out of sync with your server.
  // Use with caution. If you are uncomfortable with this optimization, update the
  // line below to `return defaultShouldRevalidate` instead.
  // For more details see: https://remix.run/docs/en/main/route/should-revalidate
  return false;
};

/**
 * The main and reset stylesheets are added in the Layout component
 * to prevent a bug in development HMR updates.
 *
 * This avoids the "failed to execute 'insertBefore' on 'Node'" error
 * that occurs after editing and navigating to another page.
 *
 * It's a temporary fix until the issue is resolved.
 * https://github.com/remix-run/remix/issues/9242
 */
export function links() {
  return [
    {
      rel: 'preconnect',
      href: 'https://cdn.shopify.com',
    },
    {
      rel: 'preconnect',
      href: 'https://shop.app',
    },
    {rel: 'icon', type: 'image/svg+xml', href: favicon},
  ];
}

export async function loader(args: Route.LoaderArgs) {
  try {
    // Start fetching non-critical data without blocking time to first byte
    const deferredData = loadDeferredData(args);

    // Await the critical data required to render initial state of the page
    const criticalData = await loadCriticalData(args);

    const {storefront, env} = args.context;

    return {
      ...deferredData,
      ...criticalData,
      publicStoreDomain: env.PUBLIC_STORE_DOMAIN,
      shop: getShopAnalytics({
        storefront,
        publicStorefrontId: env.PUBLIC_STOREFRONT_ID || '',
      }),
      consent: {
        checkoutDomain: env.PUBLIC_CHECKOUT_DOMAIN || env.PUBLIC_STORE_DOMAIN,
        storefrontAccessToken: env.PUBLIC_STOREFRONT_API_TOKEN,
        withPrivacyBanner: false,
        // localize the privacy banner
        country: args.context.storefront.i18n.country,
        language: args.context.storefront.i18n.language,
      },
    };
  } catch (error) {
    // Log the error
    console.error('Root loader error:', error);

    // Throw the error to trigger the ErrorBoundary
    throw new Response('Failed to load page data', { status: 500 });
  }
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context}: Route.LoaderArgs) {
  const {storefront} = context;

  const [header] = await Promise.all([
    storefront.query(HEADER_QUERY, {
      cache: storefront.CacheLong(),
      variables: {
        headerMenuHandle: 'main-menu', // Adjust to your header menu handle
      },
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  return {header};
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: Route.LoaderArgs) {
  const {storefront, customerAccount, cart} = context;

  // defer the footer query (below the fold)
  const footer = storefront
    .query(FOOTER_QUERY, {
      cache: storefront.CacheLong(),
      variables: {
        footerMenuHandle: 'footer', // Adjust to your footer menu handle
      },
    })
    .catch((error: Error) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });
  return {
    cart: cart.get(),
    isLoggedIn: customerAccount.isLoggedIn(),
    footer,
  };
}

export function Layout({children}: {children?: React.ReactNode}) {
  let nonce;
  try {
    nonce = useNonce();
  } catch (e) {
    // Fallback for SSR or when context is not available
    nonce = undefined;
  }

  return (
    <html lang="en" className="overflow-x-hidden">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="stylesheet" href={fontsCss}></link>
        <link rel="stylesheet" href={tailwindCss}></link>
        <link rel="stylesheet" href={appStyles}></link>
        <Meta />
        <Links />
      </head>
      <body className="overflow-x-hidden max-w-full">
        {children}
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  );
}

export default function App() {
  const data = useRouteLoaderData<RootLoader>('root');

  if (!data) {
    return (
      <ReactErrorBoundary>
        <Outlet />
      </ReactErrorBoundary>
    );
  }

  return (
    <ReactErrorBoundary>
      <Analytics.Provider
        cart={data.cart}
        shop={data.shop}
        consent={data.consent}
      >
        <AnalyticsProvider userId={undefined}>
          <PageLayout {...data}>
            <Outlet />
          </PageLayout>
        </AnalyticsProvider>
      </Analytics.Provider>
    </ReactErrorBoundary>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  let errorMessage = 'Unknown error';
  let errorStatus = 500;
  let errorTitle = 'Something went wrong';

  if (isRouteErrorResponse(error)) {
    errorMessage = error?.data?.message ?? error.data;
    errorStatus = error.status;

    // Customize messages based on error status
    switch (error.status) {
      case 404:
        errorTitle = 'Page not found';
        errorMessage = "Sorry, we couldn't find the page you're looking for.";
        break;
      case 401:
        errorTitle = 'Unauthorized';
        errorMessage = 'You need to be logged in to view this page.';
        break;
      case 403:
        errorTitle = 'Forbidden';
        errorMessage = "You don't have permission to access this page.";
        break;
      case 500:
        errorTitle = 'Server error';
        errorMessage = 'An unexpected error occurred on our server. Please try again later.';
        break;
      case 503:
        errorTitle = 'Service unavailable';
        errorMessage = 'The service is temporarily unavailable. Please try again later.';
        break;
      default:
        errorTitle = `Error ${error.status}`;
    }
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>{errorTitle}</title>
        <link rel="stylesheet" href={fontsCss}></link>
        <link rel="stylesheet" href={tailwindCss}></link>
        <link rel="stylesheet" href={appStyles}></link>
        <Meta />
        <Links />
      </head>
      <body className="overflow-x-hidden max-w-full">
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
            <div className="mb-4">
              {errorStatus === 404 ? (
                <svg
                  className="mx-auto h-16 w-16 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              ) : (
                <svg
                  className="mx-auto h-16 w-16 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{errorTitle}</h1>
            {errorStatus && (
              <div className="text-sm text-gray-500 mb-4">Error Code: {errorStatus}</div>
            )}
            <p className="text-gray-600 mb-6">{errorMessage}</p>
            <div className="space-y-3">
              <a
                href="/"
                className="block w-full bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition"
              >
                Go to Homepage
              </a>
              <button
                onClick={() => window.location.reload()}
                className="block w-full bg-gray-200 text-gray-800 px-6 py-3 rounded-md hover:bg-gray-300 transition"
              >
                Refresh Page
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && error instanceof Error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                  Error Details (Development Only)
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 p-4 rounded overflow-auto max-h-48 text-left">
                  {error.message}
                  {'\n\n'}
                  {error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
        <Scripts />
      </body>
    </html>
  );
}
