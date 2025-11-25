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
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const ticking = useRef(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

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
        <div className="mx-auto w-full max-w-[1920px] px-4 sm:px-6 lg:px-16 xl:px-20">
          {/* Pinned desktop logo (always visible on lg+) */}
          <NavLink
            prefetch="intent"
            to="/"
            end
            className="hidden lg:flex fixed left-6 top-6 lg:top-[72px] z-40 items-center justify-center pointer-events-auto"
            aria-label={`${shop.name} home`}
            style={{ paddingTop: 'env(safe-area-inset-top)' }}
          >
            {/* cropped container so the visible vertical space matches text height */}
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
            <div className={[
            'flex h-14 sm:h-16 lg:h-[72px] items-center justify-center',
            'transform transition-transform duration-300 will-change-transform',
            hidden ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100',
          ].join(' ')}>
            {/* Mobile: minimal icon buttons */}
            <div className="flex lg:hidden items-center w-full relative z-50">
              <div className="flex items-center">
                <button
                  type="button"
                  aria-label="Open menu"
                  onClick={() => open('mobile')}
                  className="bg-transparent text-white border-0 p-1 flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5 block">
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </svg>
                </button>
              </div>

              <div className="flex-1" />

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Search"
                  onClick={() => setSearchOpen((s) => !s)}
                  className="bg-transparent text-white border-0 p-1 flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5 block">
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                  </svg>
                </button>

                <button
                  type="button"
                  aria-label="Cart"
                  onClick={() => open('cart')}
                  className="bg-transparent text-white border-0 p-1 flex items-center justify-center relative"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5 block">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Desktop */}
            <div className="hidden lg:flex items-center justify-between w-full">
              {/* inset placeholder preserves spacing for centered nav */}
              <div className="flex-shrink-0 w-36 lg:w-44" aria-hidden />

              <HeaderMenu
                menu={menu}
                viewport="desktop"
                primaryDomainUrl={header.shop.primaryDomain.url}
                publicStoreDomain={publicStoreDomain}
              />

              <HeaderCtas isLoggedIn={isLoggedIn} cart={cart} onSearchToggle={() => setSearchOpen((s) => !s)} />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile logo overlay */}
      <div className="lg:hidden fixed top-14 sm:top-16 left-0 right-0 z-40 bg-transparent pointer-events-none">
        <NavLink prefetch="intent" to="/" end className="block">
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

      <div className="lg:hidden h-14 sm:h-16" aria-hidden />

      {/* Inline header search (centered, compact) */}
      {searchOpen && (
        <div className="fixed inset-x-0 top-0 z-40 mt-14 sm:mt-16 lg:mt-[72px]">
          <div className="mx-auto max-w-[980px] px-4 sm:px-6 lg:px-16 xl:px-20 flex justify-center">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 w-full max-w-[600px] mx-auto relative">
              <SearchFormPredictive action="/search">
                {({inputRef, fetchResults, goToSearch}) => (
                  <div className="flex items-center gap-2 p-2">
                    <div className="flex items-center flex-1 bg-white rounded-md px-3 py-2">
                      <img src="/icons/search.svg" alt="" aria-hidden="true" className="h-4 w-4 mr-2 flex-shrink-0 object-contain block" />
                      <input
                        ref={(el) => {
                          try {
                            (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = el;
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
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={1.6} className="h-4 w-4 block">
                        <circle cx="11" cy="11" r="7" />
                        <path d="M21 21l-4.5-4.5" />
                      </svg>
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
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={1.8} className="h-3.5 w-3.5 block">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                )}
              </SearchFormPredictive>

              <div className="mt-2 absolute left-1/2 -translate-x-1/2 top-full w-full max-w-[520px]">
                <SearchResultsPredictive>
                  {({items, total, inputRef, closeSearch, state, term}) => (
                    <div className="max-h-56 overflow-auto bg-white border border-gray-100 rounded-md shadow-sm text-sm">
                      <div className="p-2">
                        <SearchResultsPredictive.Products term={term} products={items.products ?? []} closeSearch={closeSearch} />
                        <SearchResultsPredictive.Collections term={term} collections={items.collections ?? []} closeSearch={closeSearch} />
                        <SearchResultsPredictive.Articles term={term} articles={items.articles ?? []} closeSearch={closeSearch} />
                        <SearchResultsPredictive.Pages term={term} pages={items.pages ?? []} closeSearch={closeSearch} />
                        {total === 0 && <SearchResultsPredictive.Empty term={term} />}
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

/* ---------------- NAV ---------------- */

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
  const maleActive = location?.pathname?.includes('/collections/men');

  const navItems = [
    {title: 'Women', url: '/collections/women'},
    {title: 'Men', url: '/collections/men'},
    {title: 'Accessories', url: '/collections/accessories'},
    {title: 'Brands', url: '/collections/brands'},
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
                  isActive ? 'text-[#00F4D2]' : 'text-black hover:text-[#00F4D2]',
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
    <nav className="absolute left-1/2 -translate-x-1/2 hidden lg:flex items-center space-x-7 xl:space-x-8 z-0">
      {navItems.map((item) => (
        // For the 'Women' item, render a small list icon button next to the nav link
        item.title === 'Women' ? (
          <div key={item.url} className="flex items-center gap-2">
            <NavLink
              to={`${item.url}?view=list`}
              prefetch="intent"
              aria-label="List view for Women"
              className="group"
            >
              <IconButton label="List view" className="h-7 w-7">
                <img src="/icons/menu.svg" alt="" aria-hidden="true" className="h-4 w-4 object-contain" />
              </IconButton>
            </NavLink>

            <NavLink
              to={item.url}
              prefetch="intent"
              className={({isActive}) =>
                [
                  'text-[13px] xl:text-sm tracking-wide transition-all duration-200 relative group',
                  isActive ? 'text-[#00F4D2]' : 'text-white hover:text-[#00F4D2]',
                ].join(' ')
              }
              style={{fontFamily: 'Aeonik, sans-serif', fontWeight: 700, letterSpacing: '0.05em'}}
            >
              {item.title}
              <span
                className="absolute -bottom-1 left-0 w-0 h-px bg-[#00F4D2] transition-all duration-200 group-hover:w-full"
              />
            </NavLink>
          </div>
        ) : (
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
            style={{fontFamily: 'Aeonik, sans-serif', fontWeight: 700, letterSpacing: '0.05em'}}
          >
            {item.title}
            <span
              className="absolute -bottom-1 left-0 w-0 h-px bg-[#00F4D2] transition-all duration-200 group-hover:w-full"
            />
          </NavLink>
        )
      ))}
    </nav>
  );
}

/* --------------- CTAs ---------------- */

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
      {({isActive}) => (
        <IconButton label="Account" type="div">
              <img src="/icons/account.svg" alt="" aria-hidden="true" className="h-4 w-4 object-contain" />
            </IconButton>
      )}
    </NavLink>
  );
}

function HeaderMenuMobileToggle() {
  const {open} = useAside();
  return (
    <IconButton label="Open menu" onClick={() => open('mobile')}>
      <img src="/icons/menu.svg" alt="" aria-hidden="true" className="h-4 w-4 object-contain" />
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
      <img src="/icons/search.svg" alt="" aria-hidden="true" className="h-4 w-4 object-contain transition-transform duration-200 group-hover:rotate-12" />
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
      <img src="/icons/cart.svg" alt="" aria-hidden="true" className="h-4 w-4 object-contain transition-transform duration-200 group-hover:-rotate-12" />

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