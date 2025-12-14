/**
 * Brand Fit Profiles
 *
 * Different brands have different sizing standards. This module provides
 * adjustments to account for how brands typically fit.
 *
 * Positive values = brand runs small (need larger garment size)
 * Negative values = brand runs large (need smaller garment size)
 */

export interface BrandFitProfile {
  adjustment: number; // cm adjustment to target garment width
  note: string; // Description of the brand's fit
}

/**
 * Brand fit profiles database.
 * Key: brand/vendor name (case-insensitive)
 * Value: fit profile with adjustment and note
 */
const brandProfiles: Record<string, BrandFitProfile> = {
  // Fast Fashion Brands
  zara: {
    adjustment: 2,
    note: 'Zara tends to run small - sized up accordingly',
  },
  uniqlo: {
    adjustment: 1.5,
    note: 'Uniqlo runs slightly small - adjusted for fit',
  },
  'h&m': {
    adjustment: 0,
    note: 'H&M is true to size',
  },
  hm: {
    adjustment: 0,
    note: 'H&M is true to size',
  },
  mango: {
    adjustment: 1,
    note: 'Mango runs slightly small - adjusted',
  },
  gap: {
    adjustment: -0.5,
    note: 'Gap runs slightly large',
  },

  // Athletic Brands
  nike: {
    adjustment: 0,
    note: 'Nike is true to size',
  },
  adidas: {
    adjustment: 0,
    note: 'Adidas is true to size',
  },
  'under armour': {
    adjustment: -0.5,
    note: 'Under Armour runs slightly fitted - may prefer larger',
  },
  lululemon: {
    adjustment: 0.5,
    note: 'Lululemon runs slightly small - adjusted',
  },

  // Premium Brands
  cos: {
    adjustment: 1,
    note: 'COS runs European sizing (smaller) - adjusted',
  },
  'massimo dutti': {
    adjustment: 1.5,
    note: 'Massimo Dutti runs small - adjusted',
  },
  everlane: {
    adjustment: 0,
    note: 'Everlane is true to size',
  },

  // American Brands
  'old navy': {
    adjustment: -1,
    note: 'Old Navy runs large - sized down',
  },
  'american eagle': {
    adjustment: 0,
    note: 'American Eagle is true to size',
  },
  abercrombie: {
    adjustment: 0.5,
    note: 'Abercrombie runs slightly small',
  },

  // Asian Brands
  muji: {
    adjustment: 2,
    note: 'Muji uses Asian sizing (runs small) - adjusted',
  },
  gu: {
    adjustment: 2,
    note: 'GU uses Asian sizing (runs small) - adjusted',
  },

  // European Brands
  'arket': {
    adjustment: 1,
    note: 'Arket runs European sizing - adjusted',
  },
  weekday: {
    adjustment: 0.5,
    note: 'Weekday runs slightly small',
  },
};

/**
 * Get brand fit profile for a given vendor name.
 * Returns undefined if brand is not in the database.
 */
export function getBrandFitProfile(vendor?: string | null): BrandFitProfile | undefined {
  if (!vendor) return undefined;

  // Normalize vendor name (lowercase, trim whitespace)
  const normalized = vendor.toLowerCase().trim();

  // Direct match
  if (brandProfiles[normalized]) {
    return brandProfiles[normalized];
  }

  // Fuzzy match - check if vendor contains brand name
  for (const [brandName, profile] of Object.entries(brandProfiles)) {
    if (normalized.includes(brandName) || brandName.includes(normalized)) {
      return profile;
    }
  }

  return undefined;
}

/**
 * Apply brand fit adjustment to target garment width.
 */
export function applyBrandAdjustment(
  targetWidth: number,
  vendor?: string | null
): { adjustedWidth: number; profile?: BrandFitProfile } {
  const profile = getBrandFitProfile(vendor);

  if (!profile) {
    return { adjustedWidth: targetWidth };
  }

  return {
    adjustedWidth: targetWidth + profile.adjustment,
    profile,
  };
}
