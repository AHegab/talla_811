import { CartForm, Image, type OptimisticCartLine } from '@shopify/hydrogen';
import type { CartLineUpdateInput } from '@shopify/hydrogen/storefront-api-types';
import { Minus, Plus, Trash2 } from 'lucide-react';
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
    <li key={id} className="flex gap-3 p-3 bg-white rounded-lg border border-gray-200">
      {image && (
        <div className="flex-shrink-0 w-16 sm:w-20">
          <Link
            prefetch="intent"
            to={lineItemUrl}
            onClick={() => {
              if (layout === 'aside') {
                close();
              }
            }}
            className="block overflow-hidden rounded-md"
          >
            <Image
              alt={title}
              aspectRatio="3/4"
              data={image}
              height={80}
              loading="lazy"
              width={60}
              className="object-cover w-full"
            />
          </Link>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col gap-2 overflow-hidden">
        <div className="min-w-0">
          <Link
            prefetch="intent"
            to={lineItemUrl}
            onClick={() => {
              if (layout === 'aside') {
                close();
              }
            }}
            className="block hover:text-gray-700 transition-colors"
          >
            <h3 className="font-semibold text-sm leading-tight text-gray-900 whitespace-normal">{product.title}</h3>
          </Link>

          <div className="text-xs text-gray-500 mt-0.5">
            {selectedOptions.map((option, index) => (
              <span key={option.name} className="truncate">
                {option.value}{index < selectedOptions.length - 1 ? ', ' : ''}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="font-semibold text-sm text-gray-900">
            <ProductPrice price={line?.cost?.totalAmount} />
          </div>
          <div className="flex items-start">
            <CartLineQuantity line={line} />
          </div>
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
    <div className="flex items-center gap-2 text-sm">
      <div className="flex items-center bg-gray-900 rounded-md overflow-hidden">
        <CartLineUpdateButton lines={[{id: lineId, quantity: prevQuantity}]}>
          <button
            aria-label="Decrease quantity"
            disabled={quantity <= 1 || !!isOptimistic}
            name="decrease-quantity"
            value={prevQuantity}
            className="w-8 h-8 flex items-center justify-center text-white hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <Minus size={14} strokeWidth={2.5} />
          </button>
        </CartLineUpdateButton>

        <span className="min-w-[2.5rem] text-center text-sm font-semibold text-white">{quantity}</span>

        <CartLineUpdateButton lines={[{id: lineId, quantity: nextQuantity}]}>
          <button
            aria-label="Increase quantity"
            name="increase-quantity"
            value={nextQuantity}
            disabled={!!isOptimistic}
            className="w-8 h-8 flex items-center justify-center text-white hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <Plus size={14} strokeWidth={2.5} />
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
        className="w-8 h-8 flex items-center justify-center bg-gray-900 hover:bg-red-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all rounded-md text-white"
        aria-label="Remove item"
      >
        <Trash2 size={14} strokeWidth={2} />
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
