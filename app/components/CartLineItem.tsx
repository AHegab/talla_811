import { CartForm, Image, type OptimisticCartLine } from '@shopify/hydrogen';
import type { CartLineUpdateInput } from '@shopify/hydrogen/storefront-api-types';
import { Link } from 'react-router';
import type { CartApiQueryFragment } from 'storefrontapi.generated';
import type { CartLayout } from '~/components/CartMain';
import { useVariantUrl } from '~/lib/variants';
import { useAside } from './Aside';
import { ProductPrice } from './ProductPrice';

type CartLine = OptimisticCartLine<CartApiQueryFragment>;

/**
 * A single line item in the cart. It displays the product image, title, price.
 * It also provides controls to update the quantity or remove the line item.
 */
export function CartLineItem({
  layout,
  line,
}: {
  layout: CartLayout;
  line: CartLine;
}) {
  const {id, merchandise} = line;
  const {product, title, image, selectedOptions} = merchandise;
  const lineItemUrl = useVariantUrl(product.handle, selectedOptions);
  const {close} = useAside();

  return (
    <li key={id} className="flex gap-4 pb-6 border-b border-gray-200 last:border-0">
      {image && (
        <div className="flex-shrink-0">
          <Link
            prefetch="intent"
            to={lineItemUrl}
            onClick={() => {
              if (layout === 'aside') {
                close();
              }
            }}
          >
            <Image
              alt={title}
              aspectRatio="3/4"
              data={image}
              height={120}
              loading="lazy"
              width={90}
              className="object-cover"
            />
          </Link>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <Link
          prefetch="intent"
          to={lineItemUrl}
          onClick={() => {
            if (layout === 'aside') {
              close();
            }
          }}
          className="block mb-2 hover:text-talla-text/70 transition-colors group"
        >
          <h3 className="font-medium text-base leading-tight group-hover:underline">{product.title}</h3>
        </Link>
        
        <div className="text-sm text-talla-text/60 space-y-0.5 mb-3">
          {selectedOptions.map((option) => (
            <div key={option.name}>
              <span className="font-medium">{option.name}:</span> {option.value}
            </div>
          ))}
        </div>

        <div className="mt-auto flex items-end justify-between">
          <div className="font-medium text-lg">
            <ProductPrice price={line?.cost?.totalAmount} />
          </div>
          <CartLineQuantity line={line} />
        </div>
      </div>
    </li>
  );
}

/**
 * Provides the controls to update the quantity of a line item in the cart.
 * These controls are disabled when the line item is new, and the server
 * hasn't yet responded that it was successfully added to the cart.
 */
function CartLineQuantity({line}: {line: CartLine}) {
  if (!line || typeof line?.quantity === 'undefined') return null;
  const {id: lineId, quantity, isOptimistic} = line;
  const prevQuantity = Number(Math.max(0, quantity - 1).toFixed(0));
  const nextQuantity = Number((quantity + 1).toFixed(0));

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center border border-gray-300 rounded">
        <CartLineUpdateButton lines={[{id: lineId, quantity: prevQuantity}]}>
          <button
            aria-label="Decrease quantity"
            disabled={quantity <= 1 || !!isOptimistic}
            name="decrease-quantity"
            value={prevQuantity}
            className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-lg"
          >
            <span>−</span>
          </button>
        </CartLineUpdateButton>
        
        <span className="w-10 text-center text-sm font-medium border-x border-gray-300">{quantity}</span>
        
        <CartLineUpdateButton lines={[{id: lineId, quantity: nextQuantity}]}>
          <button
            aria-label="Increase quantity"
            name="increase-quantity"
            value={nextQuantity}
            disabled={!!isOptimistic}
            className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-lg"
          >
            <span>+</span>
          </button>
        </CartLineUpdateButton>
      </div>
      
      <CartLineRemoveButton lineIds={[lineId]} disabled={!!isOptimistic} />
    </div>
  );
}

/**
 * A button that removes a line item from the cart. It is disabled
 * when the line item is new, and the server hasn't yet responded
 * that it was successfully added to the cart.
 */
function CartLineRemoveButton({
  lineIds,
  disabled,
}: {
  lineIds: string[];
  disabled: boolean;
}) {
  return (
    <CartForm
      fetcherKey={getFetcherKey(CartForm.ACTIONS.LinesRemove, lineIds)}
      route="/cart"
      action={CartForm.ACTIONS.LinesRemove}
      inputs={{lineIds}}
    >
      <button 
        disabled={disabled} 
        type="submit"
        className="text-xs text-talla-text/50 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors underline underline-offset-2"
      >
        Remove
      </button>
    </CartForm>
  );
}

function CartLineUpdateButton({
  children,
  lines,
}: {
  children: React.ReactNode;
  lines: CartLineUpdateInput[];
}) {
  const lineIds = lines.map((line) => line.id);

  return (
    <CartForm
      fetcherKey={getFetcherKey(CartForm.ACTIONS.LinesUpdate, lineIds)}
      route="/cart"
      action={CartForm.ACTIONS.LinesUpdate}
      inputs={{lines}}
    >
      {children}
    </CartForm>
  );
}

/**
 * Returns a unique key for a given cart action and set of line ids. This is used to make sure actions
 * modifying the same line items are not run concurrently, but cancel each other. For example, if the user
 * clicks "Increase quantity" and then "Decrease quantity" in rapid succession, the actions will cancel
 * each other and only the last one will run. Using the action in the key prevents remove/update collisions.
 * @param action - CartForm action identifier
 * @param lineIds - line ids affected by the action
 * @returns a unique fetcher key string
 */
function getFetcherKey(action: string, lineIds: string[]) {
  return [action, ...lineIds].join('-');
}
