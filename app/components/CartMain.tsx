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
    <div className="flex flex-col h-full bg-white">
      <CartEmpty hidden={linesCount} layout={layout} />
      
      {linesCount && (
        <>
          {/* Cart Items - Scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <ul className="space-y-6">
              {(cart?.lines?.nodes ?? []).map((line) => (
                <CartLineItem key={line.id} line={line} layout={layout} />
              ))}
            </ul>
          </div>

          {/* Cart Summary - Fixed at bottom */}
          {cartHasItems && <CartSummary cart={cart} layout={layout} />}
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
      <p className="text-talla-text/60 mb-6">
        Your cart is empty
      </p>
      <Link 
        to="/collections" 
        onClick={close} 
        prefetch="viewport"
        className="inline-block px-8 py-3 bg-talla-text text-talla-bg font-medium hover:bg-talla-text/90 transition-colors"
      >
        Continue Shopping
      </Link>
    </div>
  );
}
