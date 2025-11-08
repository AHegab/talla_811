import { useOptimisticCart } from '@shopify/hydrogen';
import { Link } from 'react-router';
import type { CartApiQueryFragment } from 'storefrontapi.generated';
import { useAside } from '~/components/Aside';
import { CartLineItem } from '~/components/CartLineItem';
import { CartSummary } from './CartSummary';

export type CartLayout = 'page' | 'aside';

export type CartMainProps = {
  cart: CartApiQueryFragment | null;
  layout: CartLayout;
};

/**
 * The main cart component that displays the cart items and summary.
 * It is used by both the /cart route and the cart aside dialog.
 */
export function CartMain({layout, cart: originalCart}: CartMainProps) {
  // The useOptimisticCart hook applies pending actions to the cart
  // so the user immediately sees feedback when they modify the cart.
  const cart = useOptimisticCart(originalCart);

  const linesCount = Boolean(cart?.lines?.nodes?.length || 0);
  const cartHasItems = cart?.totalQuantity ? cart.totalQuantity > 0 : false;

  return (
    <div className="flex flex-col bg-[#FBFBFB]" style={{ height: 'calc(100vh - var(--header-height))' }}>
      <CartEmpty hidden={linesCount} layout={layout} />
      
      {linesCount && (
        <>
          {/* Cart Items - Scrollable with flex-1 to take available space */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <ul className="space-y-3">
              {(cart?.lines?.nodes ?? []).map((line) => (
                <CartLineItem key={line.id} line={line} layout={layout} />
              ))}
            </ul>
          </div>

          {/* Cart Summary - Sticky at bottom */}
          {cartHasItems && (
            <div className="flex-shrink-0">
              <CartSummary cart={cart} layout={layout} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

function CartEmpty({
  hidden = false,
}: {
  hidden: boolean;
  layout?: CartMainProps['layout'];
}) {
  const {close} = useAside();
  return (
    <div hidden={hidden} className="flex flex-col items-center justify-center h-full px-6 text-center">
      <p className="text-[#292929]/60 mb-6 uppercase tracking-wide text-sm font-semibold" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
        Your cart is empty
      </p>
      <Link 
        to="/collections" 
        onClick={close} 
        prefetch="viewport"
        className="inline-block px-8 py-3.5 bg-[#292929] text-[#FBFBFB] font-bold uppercase tracking-[0.15em] text-sm hover:bg-[#1a1a1a] transition-all rounded-xl hover:shadow-lg"
        style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}
      >
        Continue Shopping
      </Link>
    </div>
  );
}
