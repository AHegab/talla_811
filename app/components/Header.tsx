import {
  type CartViewPayload,
  useAnalytics,
  useOptimisticCart,
} from '@shopify/hydrogen';
import { Suspense, useEffect, useRef, useState } from 'react';
import { Await, NavLink, useAsyncValue, useLocation } from 'react-router';
import type { CartApiQueryFragment, HeaderQuery } from 'storefrontapi.generated';
import { useAside } from '~/components/Aside';
import { SearchFormPredictive } from '~/components/SearchFormPredictive';
import { SearchResultsPredictive } from '~/components/SearchResultsPredictive';
import { Search, User, ShoppingBag, Menu, X } from 'lucide-react';

interface HeaderProps {
  header: HeaderQuery;
  cart: Promise<CartApiQueryFragment | null>;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
}

type Viewport = 'desktop' | 'mobile';

function IconButton({
  onClick,
  label,
  children,
  className = '',
  type = 'button',
}: {
  onClick?: () => void;
  label: string;
  children: React.ReactNode;
  className?: string;
  type?: 'button' | 'div';
}) {
  const classes = [
    'group relative flex items-center justify-center flex-shrink-0',
    'h-9 w-9 rounded-xl',
    'bg-transparent text-white border-none p-0 m-0',
    'transition-all duration-200',
    'hover:bg-white/10',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20',
    'active:scale-95',
    'cursor-pointer',
    className,
  ].join(' ');

  if (type === 'div') {
    return (
      <div
        onClick={onClick}
        aria-label={label}
        className={classes}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick?.();
          }
        }}
      >
        {children}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={classes}
    >
      {children}
    </button>
  );
}

export function Header({
  header,
  isLoggedIn,
  cart,
  publicStoreDomain,
}: HeaderProps) {
  const {shop, menu} = header;
  const {open} = useAside();
  const location = useLocation();
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const ticking = useRef(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Check if current page is a product page
  const isProductPage = location.pathname.includes('/products/');

  useEffect(() => {
    function onScroll() {
      const currentY = window.scrollY || 0;
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          if (currentY > lastY.current && currentY > 100) {
            setHidden(true);
          } else {
            setHidden(false);
          }
          lastY.current = currentY;
          ticking.current = false;
        });
        ticking.current = true;
      }
    }

    window.addEventListener('scroll', onScroll, {passive: true});
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) {
      const t = setTimeout(() => searchInputRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
  }, [searchOpen]);

  return (
    <>
      {/* Dark header bar */}
      <header
        className={[
          'fixed inset-x-0 top-0 z-50 transition-colors duration-300',
          hidden
            ? 'bg-transparent shadow-none border-none'
            : 'bg-[#2b2b2b] text-white shadow-[0_2px_8px_rgba(0,0,0,0.15)]',
          'supports-[padding:max(0px)]:pt-[env(safe-area-inset-top)]',
        ].join(' ')}
        role="banner"
      >
        {/* make padding small so icons sit close to edges, like your screenshot */}
        <div className="w-full px-4 sm:px-4 lg:px-6 xl:px-6">
          {/* Desktop pinned logo - hidden on product pages */}
          {!isProductPage && (
            <NavLink
              prefetch="intent"
              to="/"
              end
              className="hidden lg:flex fixed left-6 top-6 lg:top-[72px] z-40 items-center justify-center pointer-events-auto"
              aria-label={`${shop.name} home`}
              style={{paddingTop: 'env(safe-area-inset-top)'}}
            >
              <div className="overflow-hidden inline-flex items-center justify-center w-[220px] h-[100px]">
                <img
                  src="/talla-logo-black.svg"
                  alt={shop.name}
                  className="w-full h-auto object-contain block transform translate-y-0 lg:-translate-y-1"
                  loading="eager"
                  width={220}
                  height={100}
                />
              </div>
            </NavLink>
          )}

          {/* Compact nav bar (same on mobile & desktop) */}
          <div
            className={[
              'flex h-14 sm:h-16 lg:h-[52px] items-center',
              'transform transition-transform duration-300 will-change-transform',
              hidden
                ? '-translate-y-full opacity-0'
                : 'translate-y-0 opacity-100',
            ].join(' ')}
          >
            <div className="flex items-center justify-between w-full relative z-50">
              {/* Left: hamburger menu */}
              <div className="flex items-center">
                <button
                  type="button"
                  aria-label="Open menu"
                  onClick={() => open('mobile')}
                  className="appearance-none bg-transparent text-white border-0 p-0 flex items-center justify-center focus:outline-none"
                >
                  <Menu className="h-5 w-5" strokeWidth={2} />
                </button>
              </div>

              {/* Center: Logo on product pages or Desktop nav */}
              {isProductPage ? (
                <div className="absolute left-1/2 -translate-x-1/2 pointer-events-auto flex items-center">
                  <NavLink prefetch="intent" to="/" end aria-label={`${shop.name} home`} className="flex items-center">
                    <img
                      src="/talla-logo-white.svg"
                      alt={shop.name}
                      className="h-3 lg:h-4 w-auto object-contain object-center"
                      loading="eager"
                      style={{
                        maxWidth: '70px',
                        display: 'block'
                      }}
                    />
                  </NavLink>
                </div>
              ) : menu ? (
                <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 max-w-[980px] w-full justify-center pointer-events-auto">
                  <HeaderMenu
                    menu={menu}
                    viewport="desktop"
                    primaryDomainUrl={shop.primaryDomain?.url ?? ''}
                    publicStoreDomain={publicStoreDomain}
                  />
                </div>
              ) : null}

              {/* Right: search, account, cart */}
              <div className="flex items-center gap-4 ml-auto">
                {/* Search */}
                <button
                  type="button"
                  aria-label="Search"
                  onClick={() => setSearchOpen((s) => !s)}
                  className="appearance-none bg-transparent text-white border-0 p-0 flex items-center justify-center focus:outline-none"
                >
                  <Search className="h-5 w-5" strokeWidth={2} />
                </button>

                {/* Account */}
                <NavLink
                  prefetch="intent"
                  to="/account"
                  aria-label="Account"
                  className="appearance-none bg-transparent text-white border-0 p-0 flex items-center justify-center focus:outline-none"
                >
                  <User className="h-5 w-5" strokeWidth={2} />
                </NavLink>

                {/* Cart */}
                <button
                  type="button"
                  aria-label="Cart"
                  onClick={() => open('cart')}
                  className="appearance-none bg-transparent text-white border-0 p-0 flex items-center justify-center relative focus:outline-none"
                >
                  <ShoppingBag className="h-5 w-5" strokeWidth={2} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile logo overlay - hidden on product pages */}
      {!isProductPage && (
        <div className="lg:hidden fixed top-14 sm:top-16 left-0 right-0 z-40 bg-transparent pointer-events-none">
          {/* pointer-events-none on the parent prevents interactions; add pointer-events-auto to the link so logo stays decorative but is clickable */}
          <NavLink prefetch="intent" to="/" end className="block pointer-events-auto" aria-label={`${shop.name} home`}>
            <div className="flex items-center justify-center h-[120px] w-full overflow-hidden bg-transparent">
              <div
                role="img"
                aria-label={shop.name}
                className="w-full h-full"
                style={{
                  backgroundImage: "url('/talla-logo-black.svg')",
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '60% auto',
                }}
              />
            </div>
          </NavLink>
        </div>
      )}

      <div className="lg:hidden h-14 sm:h-16" aria-hidden />

      {/* Inline header search (centered, compact) */}
      {searchOpen && (
        <div className="fixed inset-x-0 top-0 z-40 mt-14 sm:mt-16 lg:mt-[52px]">
          <div className="mx-auto max-w-[980px] px-4 sm:px-6 lg:px-16 xl:px-20 flex justify-center">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 w-full max-w-[600px] mx-auto relative">
              <SearchFormPredictive action="/search">
                {({inputRef, fetchResults, goToSearch}) => (
                  <div className="flex items-center gap-2 p-2">
                    <div className="flex items-center flex-1 bg-white rounded-md px-3 py-2">
                      <Search className="h-4 w-4 mr-2 flex-shrink-0 text-gray-400" strokeWidth={2} />
                      <input
                        ref={(el) => {
                          try {
                            (inputRef as React.MutableRefObject<
                              HTMLInputElement | null
                            >).current = el;
                          } catch (e) {
                            // ignore
                          }
                          searchInputRef.current = el;
                        }}
                        name="q"
                        defaultValue=""
                        aria-label="Search"
                        placeholder="Search products, articles..."
                        onChange={fetchResults}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            goToSearch();
                            setSearchOpen(false);
                          }
                          if (e.key === 'Escape') setSearchOpen(false);
                        }}
                        className="w-full bg-transparent outline-none text-sm text-gray-800 placeholder:text-gray-400 text-center px-3"
                      />
                    </div>

                    <button
                      type="button"
                      aria-label="Submit search"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        goToSearch();
                        setSearchOpen(false);
                      }}
                      className="flex items-center justify-center flex-shrink-0 w-9 h-9 rounded-md bg-gray-800 text-white border border-gray-800 hover:bg-gray-900 transition-colors p-0 m-0 cursor-pointer"
                    >
                      <Search className="h-4 w-4" strokeWidth={2} />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSearchOpen(false);
                      }}
                      aria-label="Close search"
                      className="flex items-center justify-center flex-shrink-0 w-9 h-9 rounded-md bg-gray-800 text-white border border-gray-800 hover:bg-gray-900 transition-colors p-0 m-0 cursor-pointer"
                    >
                      <X className="h-4 w-4" strokeWidth={2} />
                    </button>
                  </div>
                )}
              </SearchFormPredictive>

              <div className="mt-2 absolute left-1/2 -translate-x-1/2 top-full w-full max-w-[520px]">
                <SearchResultsPredictive>
                  {({items, total, inputRef, closeSearch, state, term}) => (
                    <div className="max-h-56 overflow-auto bg-white border border-gray-100 rounded-md shadow-sm text-sm">
                      <div className="p-2">
                        <SearchResultsPredictive.Products
                          term={term}
                          products={items.products ?? []}
                          closeSearch={closeSearch}
                        />
                        <SearchResultsPredictive.Collections
                          term={term}
                          collections={items.collections ?? []}
                          closeSearch={closeSearch}
                        />
                        <SearchResultsPredictive.Articles
                          term={term}
                          articles={items.articles ?? []}
                          closeSearch={closeSearch}
                        />
                        <SearchResultsPredictive.Pages
                          term={term}
                          pages={items.pages ?? []}
                          closeSearch={closeSearch}
                        />
                        {total === 0 && (
                          <SearchResultsPredictive.Empty term={term} />
                        )}
                      </div>
                    </div>
                  )}
                </SearchResultsPredictive>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ---------------- NAV (for Aside menu) ---------------- */

export function HeaderMenu({
  menu,
  primaryDomainUrl,
  viewport,
  publicStoreDomain,
}: {
  menu: HeaderProps['header']['menu'];
  primaryDomainUrl: HeaderProps['header']['shop']['primaryDomain']['url'];
  viewport: Viewport;
  publicStoreDomain: HeaderProps['publicStoreDomain'];
}) {
  const {close} = useAside();
  const location = useLocation();

  const navItems = [
    {title: 'Women', url: '/collections/women'},
    {title: 'Men', url: '/collections/men'},
    {title: 'Accessories', url: '/collections/accessories'},
    {title: 'Brands', url: '/brands'},
    {title: 'Journal', url: '/blogs/journal'},
    {title: 'About', url: '/pages/about'},
  ];

  if (viewport === 'mobile') {
    return (
      <nav className="flex h-full flex-col bg-white">
        <div className="flex-1 px-6 py-8 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.url}
              to={item.url}
              onClick={close}
              prefetch="intent"
              className={({isActive}) =>
                [
                  'block py-3 text-base tracking-tight transition-colors',
                  isActive
                    ? 'text-[#00F4D2]'
                    : 'text-black hover:text-[#00F4D2]',
                ].join(' ')
              }
              style={{fontFamily: 'Aeonik, sans-serif', fontWeight: 700}}
            >
              {item.title}
            </NavLink>
          ))}
        </div>
        <div className="border-t border-gray-200 px-6 py-6">
          <NavLink
            to="/pages/contact"
            onClick={close}
            prefetch="intent"
            className="block text-sm text-gray-600 transition-colors hover:text-[#00F4D2]"
            style={{fontFamily: 'Quicking, sans-serif'}}
          >
            Contact Us
          </NavLink>
        </div>
      </nav>
    );
  }

  return (
    <nav className="flex items-center space-x-7 xl:space-x-8 uppercase">
      {navItems.map((item) => (
        <NavLink
          key={item.url}
          to={item.url}
          prefetch="intent"
          className={({isActive}) =>
            [
              'text-[13px] xl:text-sm tracking-wide transition-all duration-200 relative group',
              isActive ? 'text-[#00F4D2]' : 'text-white hover:text-[#00F4D2]',
            ].join(' ')
          }
          style={{
            fontFamily: 'Aeonik, sans-serif',
            fontWeight: 700,
            letterSpacing: '0.05em',
          }}
        >
          {item.title}
          <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#00F4D2] transition-all duration-200 group-hover:w-full" />
        </NavLink>
      ))}
    </nav>
  );
}

/* --------------- CTAs (kept for compatibility) ---------------- */

function HeaderCtas({
  isLoggedIn,
  cart,
  onSearchToggle,
}: Pick<HeaderProps, 'isLoggedIn' | 'cart'> & {onSearchToggle?: () => void}) {
  return (
    <nav className="relative z-10 flex items-center gap-1.5">
      <SearchToggle onToggle={onSearchToggle} />
      <AccountLink />
      <CartToggle cart={cart} />
    </nav>
  );
}

function AccountLink() {
  return (
    <NavLink prefetch="intent" to="/account" aria-label="Account">
      {() => (
        <IconButton label="Account" type="div">
          <img
            src="/icons/account.svg"
            alt=""
            aria-hidden="true"
            className="h-4 w-4 object-contain"
          />
        </IconButton>
      )}
    </NavLink>
  );
}

function HeaderMenuMobileToggle() {
  const {open} = useAside();
  return (
    <IconButton label="Open menu" onClick={() => open('mobile')}>
      <img
        src="/icons/menu.svg"
        alt=""
        aria-hidden="true"
        className="h-4 w-4 object-contain"
      />
    </IconButton>
  );
}

function SearchToggle({onToggle}: {onToggle?: () => void}) {
  const {open} = useAside();
  function handle() {
    if (onToggle) return onToggle();
    open('search');
  }

  return (
    <IconButton label="Search" onClick={handle}>
      <img
        src="/icons/search.svg"
        alt=""
        aria-hidden="true"
        className="h-4 w-4 object-contain transition-transform duration-200 group-hover:rotate-12"
      />
    </IconButton>
  );
}

function CartBadge({count}: {count: number | null}) {
  const {open} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();

  return (
    <IconButton
      label={`Cart with ${count || 0} items`}
      onClick={(e?: any) => {
        e?.preventDefault?.();
        open('cart');
        publish('cart_viewed', {
          cart,
          prevCart,
          shop,
          url: window.location.href || '',
        } as CartViewPayload);
      }}
    >
      <img
        src="/icons/cart.svg"
        alt=""
        aria-hidden="true"
        className="h-4 w-4 object-contain transition-transform duration-200 group-hover:-rotate-12"
      />

      {typeof count === 'number' && count > 0 && (
        <span
          className={[
            'absolute -top-0.5 -right-0.5',
            'min-w-[18px] h-[18px] rounded-full',
            'bg-[#00F4D2] text-black text-[10px] font-bold',
            'flex items-center justify-center shadow',
          ].join(' ')}
        >
          {count}
        </span>
      )}
    </IconButton>
  );
}

function CartToggle({cart}: Pick<HeaderProps, 'cart'>) {
  return (
    <Suspense fallback={<CartBadge count={null} />}>
      <Await resolve={cart}>
        <CartBanner />
      </Await>
    </Suspense>
  );
}

function CartBanner() {
  const originalCart = useAsyncValue() as CartApiQueryFragment | null;
  const cart = useOptimisticCart(originalCart);
  return <CartBadge count={cart?.totalQuantity ?? 0} />;
}
