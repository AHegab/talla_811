import {
  type CartViewPayload,
  useAnalytics,
  useOptimisticCart,
} from '@shopify/hydrogen';
import { Suspense } from 'react';
import { Await, NavLink, useAsyncValue } from 'react-router';
import type { CartApiQueryFragment, HeaderQuery } from 'storefrontapi.generated';
import { useAside } from '~/components/Aside';

interface HeaderProps {
  header: HeaderQuery;
  cart: Promise<CartApiQueryFragment | null>;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
}

type Viewport = 'desktop' | 'mobile';

/* --------------------------------- */
/* Reusable icon button (44x44 tap)  */
/* --------------------------------- */
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
    'group relative inline-flex items-center justify-center',
    'h-9 w-9 rounded-xl',
    '!bg-transparent !text-white !border-none !p-0',
    'transition-all duration-200',
    'hover:!bg-white/6',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20',
    'active:scale-95',
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

  return (
    <>
      {/* Dark header bar */}
      <header
        className={[
          'fixed inset-x-0 top-0 z-50',
          'bg-[#2b2b2b] text-white',
          'shadow-[0_2px_8px_rgba(0,0,0,0.15)]',
          'supports-[padding:max(0px)]:pt-[env(safe-area-inset-top)]',
        ].join(' ')}
        role="banner"
      >
        <div className="mx-auto w-full max-w-[1920px] px-4 sm:px-6 lg:px-16 xl:px-20">
          <div className="flex h-14 sm:h-16 lg:h-[72px] items-center justify-center">
            {/* -------- Mobile (<= lg) -------- */}
            <div className="flex lg:hidden items-center w-full relative z-50">
              {/* Left: Burger */}
              <div className="flex items-center">
                <HeaderMenuMobileToggle />
              </div>

              {/* Spacer to center */}
              <div className="flex-1" />

              {/* Right: Search & Cart */}
              <div className="flex items-center gap-1.5">
                <SearchToggle />
                <CartToggle cart={cart} />
              </div>
            </div>

            {/* -------- Desktop (>= lg) -------- */}
            <div className="hidden lg:flex items-center justify-between w-full">
              {/* Left: Logo */}
              <NavLink prefetch="intent" to="/" end className="relative z-10 flex-shrink-0">
                <img
                  src="/talla-logo-white.svg"
                  alt={shop.name}
                  className="h-8 w-auto"
                  loading="eager"
                />
              </NavLink>

              {/* Center: Nav */}
              <HeaderMenu
                menu={menu}
                viewport="desktop"
                primaryDomainUrl={header.shop.primaryDomain.url}
                publicStoreDomain={publicStoreDomain}
              />

              {/* Right: CTAs */}
              <HeaderCtas isLoggedIn={isLoggedIn} cart={cart} />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile: Transparent logo overlay (below dark header) */}
      <div className="lg:hidden fixed top-14 sm:top-16 left-0 right-0 z-40 bg-transparent">
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
      {/* spacer so content (hero) is pushed below fixed header only; logo overlays the hero (transparent) */}
      <div className="lg:hidden h-14 sm:h-16" aria-hidden />
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
    <nav className="absolute left-1/2 -translate-x-1/2 hidden lg:flex items-center space-x-7 xl:space-x-8">
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
          style={{fontFamily: 'Aeonik, sans-serif', fontWeight: 700, letterSpacing: '0.05em'}}
        >
          {item.title}
          <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#00F4D2] transition-all duration-200 group-hover:w-full" />
        </NavLink>
      ))}
    </nav>
  );
}

/* --------------- CTAs ---------------- */

function HeaderCtas({
  isLoggedIn,
  cart,
}: Pick<HeaderProps, 'isLoggedIn' | 'cart'>) {
  return (
    <nav className="relative z-10 flex items-center gap-1.5">
      <SearchToggle />
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
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </IconButton>
      )}
    </NavLink>
  );
}

function HeaderMenuMobileToggle() {
  const {open} = useAside();
  return (
    <IconButton label="Open menu" onClick={() => open('mobile')}>
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </svg>
    </IconButton>
  );
}

function SearchToggle() {
  const {open} = useAside();
  return (
    <IconButton label="Search" onClick={() => open('search')}>
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="transition-transform duration-200 group-hover:rotate-12"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
    </IconButton>
  );
}

/* --------------- CART ---------------- */

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
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="transition-transform duration-200 group-hover:-rotate-12"
      >
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>

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