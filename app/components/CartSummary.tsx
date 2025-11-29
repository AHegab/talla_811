import { CartForm, Money, type OptimisticCart } from '@shopify/hydrogen';
import { Check, ShoppingBag } from 'lucide-react';
import { useEffect, useRef } from 'react';
import type { FetcherWithComponents } from 'react-router';
import { useFetcher } from 'react-router';
import type { CartApiQueryFragment } from 'storefrontapi.generated';
import type { CartLayout } from '~/components/CartMain';
// CheckoutForm has been removed — the checkout button now redirects directly to Shopify checkout.

type CartSummaryProps = {
  cart: OptimisticCart<CartApiQueryFragment | null>;
  layout: CartLayout;
};

export function CartSummary({cart, layout}: CartSummaryProps) {
  // removed showCheckoutForm state since the custom checkout page was removed

  return (
    <>
      <div aria-labelledby="cart-summary" className="border-t-2 border-gray-200 bg-white px-4 sm:px-6 py-6">
        {/* Subtotal */}
        <div className="flex justify-between items-center mb-3">
          <dt className="text-base font-medium text-gray-600">Subtotal</dt>
          <dd className="text-2xl sm:text-3xl font-bold text-gray-900">
            {cart?.cost?.subtotalAmount?.amount ? (
              <Money data={cart?.cost?.subtotalAmount} />
            ) : (
              '-'
            )}
          </dd>
        </div>

        {/* Shipping info */}
        <p className="text-xs text-gray-500 mb-5 flex items-center gap-1.5">
          <Check size={14} className="text-green-600 flex-shrink-0" />
          <span>Shipping & taxes calculated at checkout</span>
        </p>

        <button
          onClick={() => {
            if (cart?.checkoutUrl) {
              window.location.href = cart.checkoutUrl;
            }
          }}
          disabled={!cart?.checkoutUrl}
          className="flex items-center justify-center gap-3 w-full px-8 py-4 bg-gray-900 text-white text-center text-sm font-bold uppercase tracking-wider rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98]"
        >
          <ShoppingBag size={18} strokeWidth={2} className="flex-shrink-0" />
          Checkout Now
        </button>

        {/* Trust signals */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Secure checkout</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Easy returns</span>
          </div>
        </div>
      </div>

      {/* Custom checkout was removed; checkout now redirects to Shopify checkout */}
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
    <div className="space-y-4">
      {/* Have existing discount, display it with a remove option */}
      {codes.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 bg-[#292929]/5 border border-[#DDDEE2] rounded-xl text-sm">
          <div className="flex items-center gap-2.5">
            <svg className="w-4 h-4 text-[#292929]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-[#292929] font-semibold uppercase tracking-wider text-xs" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>{codes?.join(', ')}</span>
          </div>
          <UpdateDiscountForm>
            <button className="text-xs text-[#292929]/60 hover:text-[#292929] font-medium uppercase tracking-wide transition-colors">
              Remove
            </button>
          </UpdateDiscountForm>
        </div>
      )}

      {/* Show an input to apply a discount */}
      <UpdateDiscountForm discountCodes={codes}>
        <div className="flex gap-3">
          <input 
            type="text" 
            name="discountCode" 
            placeholder="DISCOUNT CODE" 
            className="flex-1 px-4 py-3 border-2 border-[#DDDEE2] rounded-xl text-sm font-medium uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-[#292929] focus:border-transparent placeholder:text-[#292929]/30 transition-all"
            style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}
          />
          <button 
            type="submit"
            className="px-6 py-3 bg-[#292929] text-[#FBFBFB] text-xs font-bold uppercase tracking-[0.15em] hover:bg-[#1a1a1a] transition-all duration-200 rounded-xl hover:shadow-md"
            style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}
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
    <div className="space-y-4">
      {/* Display applied gift cards with individual remove buttons */}
      {giftCardCodes && giftCardCodes.length > 0 && (
        <div className="space-y-3">
          {giftCardCodes.map((giftCard) => (
            <RemoveGiftCardForm key={giftCard.id} giftCardId={giftCard.id}>
              <div className="flex items-center justify-between px-4 py-3 bg-[#292929]/5 border border-[#DDDEE2] rounded-xl text-sm">
                <div className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 text-[#292929]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                  <code className="font-bold text-[#292929] text-xs tracking-wider" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>***{giftCard.lastCharacters}</code>
                  <span className="text-[#292929] font-medium">
                    <Money data={giftCard.amountUsed} />
                  </span>
                </div>
                <button 
                  type="submit"
                  className="text-xs text-[#292929]/60 hover:text-[#292929] font-medium uppercase tracking-wide transition-colors"
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
        <div className="flex gap-3">
          <input
            type="text"
            name="giftCardCode"
            placeholder="GIFT CARD CODE"
            ref={giftCardCodeInput}
            className="flex-1 px-4 py-3 border-2 border-[#DDDEE2] rounded-xl text-sm font-medium uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-[#292929] focus:border-transparent placeholder:text-[#292929]/30 transition-all"
            style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}
          />
          <button 
            type="submit" 
            disabled={giftCardAddFetcher.state !== 'idle'}
            className="px-6 py-3 bg-[#292929] text-[#FBFBFB] text-xs font-bold uppercase tracking-[0.15em] hover:bg-[#1a1a1a] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 rounded-xl hover:shadow-md"
            style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}
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
