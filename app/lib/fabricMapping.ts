/**
 * Fabric Material Mapping
 *
 * Maps actual material names (as entered in Shopify) to fabric types
 * used by the size recommendation algorithm.
 */

export type FabricType = 'cotton' | 'cotton_blend' | 'jersey_knit' | 'highly_elastic';

interface FabricMapping {
  fabricType: FabricType;
  description: string;
  stretchPercentage: number;
}

/**
 * Material to fabric type mappings.
 * Keys are case-insensitive and trimmed.
 */
const materialMappings: Record<string, FabricMapping> = {
  // Cotton + Lycra blends - High stretch (must come BEFORE pure cotton)
  '100% pure cotton + lycra': {
    fabricType: 'highly_elastic',
    description: 'Cotton-Lycra blend, high stretch and comfort',
    stretchPercentage: 15,
  },
  'pure cotton + lycra': {
    fabricType: 'highly_elastic',
    description: 'Cotton-Lycra blend, high stretch and comfort',
    stretchPercentage: 15,
  },
  '100% cotton + lycra': {
    fabricType: 'highly_elastic',
    description: 'Cotton-Lycra blend, high stretch and comfort',
    stretchPercentage: 15,
  },
  'cotton + lycra': {
    fabricType: 'highly_elastic',
    description: 'Cotton-Lycra blend, high stretch and comfort',
    stretchPercentage: 15,
  },

  // Pure Cotton - No stretch (plain cotton only, no lycra)
  'pure 100% cotton': {
    fabricType: 'cotton',
    description: 'Pure cotton, no stretch',
    stretchPercentage: 0,
  },
  'pure cotton': {
    fabricType: 'cotton',
    description: 'Pure cotton, no stretch',
    stretchPercentage: 0,
  },
  '100% cotton': {
    fabricType: 'cotton',
    description: 'Pure cotton, no stretch',
    stretchPercentage: 0,
  },

  // Milton - Cotton blend with slight stretch
  'milton': {
    fabricType: 'cotton_blend',
    description: 'Milton cotton blend, slight stretch',
    stretchPercentage: 5,
  },
  'refined summer milton': {
    fabricType: 'cotton_blend',
    description: 'Refined summer Milton, breathable with slight stretch',
    stretchPercentage: 5,
  },
  'summer milton': {
    fabricType: 'cotton_blend',
    description: 'Summer Milton, lightweight with slight stretch',
    stretchPercentage: 5,
  },

  // Polyester - Moderate stretch depending on weave
  'polyester': {
    fabricType: 'jersey_knit',
    description: 'Polyester, moderate stretch',
    stretchPercentage: 10,
  },
  'polyesteer': { // Handle the typo from user's message
    fabricType: 'jersey_knit',
    description: 'Polyester, moderate stretch',
    stretchPercentage: 10,
  },

  // Lycra/Spandex - High stretch
  'lycra': {
    fabricType: 'highly_elastic',
    description: 'Lycra/Spandex, high stretch',
    stretchPercentage: 15,
  },
  'spandex': {
    fabricType: 'highly_elastic',
    description: 'Spandex, high stretch',
    stretchPercentage: 15,
  },
  'elastane': {
    fabricType: 'highly_elastic',
    description: 'Elastane, high stretch',
    stretchPercentage: 15,
  },

  // Common blends
  'cotton lycra': {
    fabricType: 'highly_elastic',
    description: 'Cotton-Lycra blend, high stretch',
    stretchPercentage: 15,
  },
  'cotton spandex': {
    fabricType: 'highly_elastic',
    description: 'Cotton-Spandex blend, high stretch',
    stretchPercentage: 15,
  },
  'poly cotton': {
    fabricType: 'cotton_blend',
    description: 'Poly-cotton blend, slight stretch',
    stretchPercentage: 5,
  },
  'cotton polyester': {
    fabricType: 'cotton_blend',
    description: 'Cotton-polyester blend, slight stretch',
    stretchPercentage: 5,
  },
};

/**
 * Map a material name to a fabric type.
 * Case-insensitive, handles extra whitespace.
 */
export function mapMaterialToFabricType(material?: string | null): FabricType | undefined {
  if (!material) return undefined;

  // Normalize: lowercase, trim, collapse multiple spaces
  const normalized = material.toLowerCase().trim().replace(/\s+/g, ' ');

  // Direct match
  if (materialMappings[normalized]) {
    return materialMappings[normalized].fabricType;
  }

  // Check for cotton + lycra combinations FIRST (before other matches)
  if ((normalized.includes('cotton') || normalized.includes('coton')) &&
      (normalized.includes('lycra') || normalized.includes('spandex') || normalized.includes('elastane'))) {
    return 'highly_elastic';
  }

  // Fuzzy match - check if normalized contains any key
  for (const [key, mapping] of Object.entries(materialMappings)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return mapping.fabricType;
    }
  }

  // Check for keywords as fallback
  if (normalized.includes('lycra') || normalized.includes('spandex') || normalized.includes('elastane')) {
    return 'highly_elastic';
  }
  if (normalized.includes('polyester') || normalized.includes('poly')) {
    return 'jersey_knit';
  }
  if (normalized.includes('milton')) {
    return 'cotton_blend';
  }
  if (normalized.includes('cotton') && !normalized.includes('blend') && !normalized.includes('poly')) {
    return 'cotton';
  }

  // Default fallback
  return undefined;
}

/**
 * Get fabric mapping details for a material.
 */
export function getFabricMappingDetails(material?: string | null): FabricMapping | undefined {
  if (!material) return undefined;

  const normalized = material.toLowerCase().trim().replace(/\s+/g, ' ');

  // Direct match
  if (materialMappings[normalized]) {
    return materialMappings[normalized];
  }

  // Fuzzy match
  for (const [key, mapping] of Object.entries(materialMappings)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return mapping;
    }
  }

  return undefined;
}

/**
 * Get all supported materials (for Shopify metafield list).
 */
export function getSupportedMaterials(): string[] {
  return Object.keys(materialMappings).filter(key =>
    // Return user-friendly names (exclude technical duplicates)
    !key.includes('100%') && key !== 'polyesteer' && key !== 'pure cotton'
  );
}
