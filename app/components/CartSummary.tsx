import { CartForm, Money, type OptimisticCart } from '@shopify/hydrogen';
import { useEffect, useRef, useState } from 'react';
import type { FetcherWithComponents } from 'react-router';
import { useFetcher } from 'react-router';
import type { CartApiQueryFragment } from 'storefrontapi.generated';
import type { CartLayout } from '~/components/CartMain';
import { CheckoutForm } from '~/components/CheckoutForm';

type CartSummaryProps = {
  cart: OptimisticCart<CartApiQueryFragment | null>;
  layout: CartLayout;
};

export function CartSummary({cart, layout}: CartSummaryProps) {
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);

  return (
    <>
      <div aria-labelledby="cart-summary" className="border-t border-gray-200 bg-white px-6 py-6 space-y-6">
        <CartDiscounts discountCodes={cart?.discountCodes} />
        <CartGiftCard giftCardCodes={cart?.appliedGiftCards} />
        
        <div className="pt-4 border-t border-gray-200">
          <div className="flex justify-between items-baseline mb-6">
            <dt className="text-sm uppercase tracking-wider text-talla-text/60 font-medium">Subtotal</dt>
            <dd className="text-2xl font-medium">
              {cart?.cost?.subtotalAmount?.amount ? (
                <Money data={cart?.cost?.subtotalAmount} />
              ) : (
                '-'
              )}
            </dd>
          </div>
          
          <button
            onClick={() => setShowCheckoutForm(true)}
            disabled={!cart?.checkoutUrl}
            className="block w-full px-6 py-4 bg-talla-text text-talla-bg text-center text-sm font-semibold uppercase tracking-wider hover:bg-talla-text/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg"
          >
            Continue to Checkout
          </button>
          
          <p className="text-xs text-center text-talla-text/50 mt-4">
            Taxes and shipping calculated at checkout
          </p>
        </div>
      </div>

      {/* Checkout Form Modal */}
      {showCheckoutForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="relative max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowCheckoutForm(false)}
              className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <CheckoutForm cart={cart as CartApiQueryFragment | null} />
          </div>
        </div>
      )}
    </>
  );
}

function CartDiscounts({
  discountCodes,
}: {
  discountCodes?: CartApiQueryFragment['discountCodes'];
}) {
  const codes: string[] =
    discountCodes
      ?.filter((discount) => discount.applicable)
      ?.map(({code}) => code) || [];

  return (
    <div className="space-y-3">
      {/* Have existing discount, display it with a remove option */}
      {codes.length > 0 && (
        <div className="flex items-center justify-between px-3 py-2.5 bg-green-50 border border-green-200 rounded text-sm">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-green-800 font-medium">{codes?.join(', ')}</span>
          </div>
          <UpdateDiscountForm>
            <button className="text-xs text-green-700 hover:text-green-900 underline underline-offset-2">
              Remove
            </button>
          </UpdateDiscountForm>
        </div>
      )}

      {/* Show an input to apply a discount */}
      <UpdateDiscountForm discountCodes={codes}>
        <div className="flex gap-2">
          <input 
            type="text" 
            name="discountCode" 
            placeholder="Discount code" 
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-talla-text focus:border-transparent"
          />
          <button 
            type="submit"
            className="px-5 py-2.5 bg-talla-text text-talla-bg text-sm font-semibold uppercase tracking-wider hover:bg-talla-text/90 transition-colors rounded"
          >
            Apply
          </button>
        </div>
      </UpdateDiscountForm>
    </div>
  );
}

function UpdateDiscountForm({
  discountCodes,
  children,
}: {
  discountCodes?: string[];
  children: React.ReactNode;
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.DiscountCodesUpdate}
      inputs={{
        discountCodes: discountCodes || [],
      }}
    >
      {children}
    </CartForm>
  );
}

function CartGiftCard({
  giftCardCodes,
}: {
  giftCardCodes: CartApiQueryFragment['appliedGiftCards'] | undefined;
}) {
  const appliedGiftCardCodes = useRef<string[]>([]);
  const giftCardCodeInput = useRef<HTMLInputElement>(null);
  const giftCardAddFetcher = useFetcher({key: 'gift-card-add'});

  // Clear the gift card code input after the gift card is added
  useEffect(() => {
    if (giftCardAddFetcher.data) {
      giftCardCodeInput.current!.value = '';
    }
  }, [giftCardAddFetcher.data]);

  function saveAppliedCode(code: string) {
    const formattedCode = code.replace(/\s/g, ''); // Remove spaces
    if (!appliedGiftCardCodes.current.includes(formattedCode)) {
      appliedGiftCardCodes.current.push(formattedCode);
    }
  }

  return (
    <div className="space-y-3">
      {/* Display applied gift cards with individual remove buttons */}
      {giftCardCodes && giftCardCodes.length > 0 && (
        <div className="space-y-2">
          {giftCardCodes.map((giftCard) => (
            <RemoveGiftCardForm key={giftCard.id} giftCardId={giftCard.id}>
              <div className="flex items-center justify-between px-3 py-2.5 bg-purple-50 border border-purple-200 rounded text-sm">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                  <code className="font-medium text-purple-800">***{giftCard.lastCharacters}</code>
                  <span className="text-purple-700">
                    <Money data={giftCard.amountUsed} />
                  </span>
                </div>
                <button 
                  type="submit"
                  className="text-xs text-purple-700 hover:text-purple-900 underline underline-offset-2"
                >
                  Remove
                </button>
              </div>
            </RemoveGiftCardForm>
          ))}
        </div>
      )}

      {/* Show an input to apply a gift card */}
      <UpdateGiftCardForm
        giftCardCodes={appliedGiftCardCodes.current}
        saveAppliedCode={saveAppliedCode}
        fetcherKey="gift-card-add"
      >
        <div className="flex gap-2">
          <input
            type="text"
            name="giftCardCode"
            placeholder="Gift card code"
            ref={giftCardCodeInput}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-talla-text focus:border-transparent"
          />
          <button 
            type="submit" 
            disabled={giftCardAddFetcher.state !== 'idle'}
            className="px-5 py-2.5 bg-talla-text text-talla-bg text-sm font-semibold uppercase tracking-wider hover:bg-talla-text/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded"
          >
            Apply
          </button>
        </div>
      </UpdateGiftCardForm>
    </div>
  );
}

function UpdateGiftCardForm({
  giftCardCodes,
  saveAppliedCode,
  fetcherKey,
  children,
}: {
  giftCardCodes?: string[];
  saveAppliedCode?: (code: string) => void;
  fetcherKey?: string;
  children: React.ReactNode;
}) {
  return (
    <CartForm
      fetcherKey={fetcherKey}
      route="/cart"
      action={CartForm.ACTIONS.GiftCardCodesUpdate}
      inputs={{
        giftCardCodes: giftCardCodes || [],
      }}
    >
      {(fetcher: FetcherWithComponents<any>) => {
        const code = fetcher.formData?.get('giftCardCode');
        if (code && saveAppliedCode) {
          saveAppliedCode(code as string);
        }
        return children;
      }}
    </CartForm>
  );
}

function RemoveGiftCardForm({
  giftCardId,
  children,
}: {
  giftCardId: string;
  children: React.ReactNode;
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.GiftCardCodesRemove}
      inputs={{
        giftCardCodes: [giftCardId],
      }}
    >
      {children}
    </CartForm>
  );
}
