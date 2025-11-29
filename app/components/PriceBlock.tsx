import React from "react";
import { Money, MoneyV2 } from "@shopify/hydrogen";

export type PriceBlockProps = {
  /** Product variant price money object */
  price: MoneyV2;
  /** Product variant compareAtPrice money object (optional) */
  compareAtPrice?: MoneyV2 | null;
  /** Optional className to pass into the wrapping element */
  className?: string;
};

/**
 * PriceBlock
 * - Displays a product price with optional compare-at price and discount badge
 * - Design: TALLA premium UI rules (Open Sauce body, Playfair Display SC for badges)
 */
export default function PriceBlock({
  price,
  compareAtPrice,
  className = "",
}: PriceBlockProps) {
  // Helper: check if there is a discount
  const isDiscounted =
    compareAtPrice && Number(compareAtPrice.amount) > Number(price.amount);

  // Helper: compute discount percentage
  const discountPercent = (priceAmount: string, compareAmount?: string | null) => {
    if (!compareAmount) return 0;
    const priceNum = Number(priceAmount);
    const compareNum = Number(compareAmount);
    if (!compareNum || compareNum <= priceNum) return 0;
    // round to nearest integer percent (e.g., 25)
    return Math.round(((compareNum - priceNum) / compareNum) * 100);
  };

  const percent = isDiscounted
    ? discountPercent(price.amount, compareAtPrice?.amount)
    : 0;

  return (
    <div
      className={`flex flex-row gap-2 items-center justify-start ${className}`}
      aria-live="polite"
    >
      <div className="flex items-center gap-2">
        {/* Current price - bold, Open Sauce, 20px (text-[20px]) */}
        <div className="font-open-sauce text-[20px] font-semibold text-[#292929] leading-none">
          <Money withoutTrailingZeros data={price} />
        </div>

        {/* Compare at price when discounted */}
        {isDiscounted && (
          <div className="text-[16px] text-[#A0A0A0] font-open-sauce leading-none">
            <span className="line-through decoration-[#A0A0A0] decoration-1">
              <Money withoutTrailingZeros data={compareAtPrice!} />
            </span>
          </div>
        )}
      </div>

      {/* Discount badge */}
      {isDiscounted && percent > 0 && (
        <span
          className="text-[10px] font-playfair-display-sc bg-[#00F4D2] text-black rounded-full px-[10px] py-[4px] leading-none"
          style={{
            // ensure pill is vertically centered and compact
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {`SALE — ${percent}% OFF`}
        </span>
      )}
    </div>
  );
}
