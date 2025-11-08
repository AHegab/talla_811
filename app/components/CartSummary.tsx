import { CartForm, Money, type OptimisticCart } from '@shopify/hydrogen';
import { Check, ShoppingBag, Tag, X } from 'lucide-react';
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
      <div aria-labelledby="cart-summary" className="border-t border-[#DDDEE2] bg-[#FBFBFB] px-6 py-4">
        <div className="flex justify-between items-baseline mb-4">
          <dt className="text-xs uppercase tracking-[0.15em] text-[#292929]/60 font-semibold flex items-center gap-2">
            <Tag size={18} color="#292929" />
            Subtotal
          </dt>
          <dd className="text-xl font-bold text-[#292929]" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
            {cart?.cost?.subtotalAmount?.amount ? (
              <Money data={cart?.cost?.subtotalAmount} />
            ) : (
              '-'
            )}
          </dd>
        </div>
        
        <p className="text-[10px] text-center text-[#292929]/50 mb-4 tracking-wide flex items-center justify-center gap-2" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
          <Check size={12} color="#292929" className="opacity-50" />
          All prices include taxes. Shipping calculated at checkout.
        </p>
        
        <button
          onClick={() => setShowCheckoutForm(true)}
          disabled={!cart?.checkoutUrl}
          className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-[#292929] text-[#FBFBFB] text-center text-xs font-bold uppercase tracking-[0.15em] rounded-xl hover:bg-[#1a1a1a] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-lg hover:transform hover:-translate-y-0.5 active:scale-[0.98]"
          style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}
        >
          <ShoppingBag size={18} color="#FBFBFB" />
          Continue to Checkout
        </button>
      </div>

      {/* Checkout Form Modal */}
      {showCheckoutForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowCheckoutForm(false)}
              className="absolute top-6 right-6 z-10 w-12 h-12 flex items-center justify-center bg-white rounded-full shadow-xl hover:bg-gray-100 transition-all duration-200 hover:scale-110"
              aria-label="Close"
            >
              <X size={24} color="#292929" />
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
