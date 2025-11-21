import React from 'react';
import { useSearchParams } from 'react-router';

/**
 * Simple search filters component to add query parameters to the search form.
 * Designed to be used together with `SearchForm` so all filter inputs are submitted as query params.
 */
export function SearchFilters({
  colors = ['Black', 'White', 'Blue', 'Gray', 'Green', 'Brown', 'Red'],
  types = ['T-Shirt', 'Sweater', 'Jacket', 'Pants', 'Dress', 'Skirt', 'Accessories'],
}: {
  colors?: string[];
  types?: string[];
}) {
  const [searchParams] = useSearchParams();
  const selectedColors = searchParams.getAll('color');
  const selectedType = searchParams.get('type') ?? '';
  const minPrice = searchParams.get('minPrice') ?? '';
  const maxPrice = searchParams.get('maxPrice') ?? '';

  return (
    <div className="search-filters" aria-label="Search filters">
      <details className="search-filters-panel open" open>
        <summary className="search-filters-title">Refine results</summary>

        <div className="search-filter-row">
          <label className="search-filter-label">Color</label>
          <div className="search-filter-options">
            {colors.map((c) => (
              <label key={c} className="search-filter-chip">
                <input
                  type="checkbox"
                  name="color"
                  value={c.toLowerCase()}
                  defaultChecked={selectedColors.includes(c.toLowerCase())}
                />
                <span
                  className="search-filter-swatch"
                  aria-hidden
                  style={{backgroundColor: c.toLowerCase()}}
                />
                <span className="search-filter-chip-text">{c}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="search-filter-row">
          <label className="search-filter-label">Type</label>
          <div className="search-filter-options">
            <select name="type" defaultValue={selectedType} className="search-filter-select">
              <option value="">All types</option>
              {types.map((t) => (
                <option key={t} value={t.toLowerCase()}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="search-filter-row">
          <label className="search-filter-label">Price</label>
          <div className="search-filter-price">
            <input name="minPrice" type="number" placeholder="Min" defaultValue={minPrice} />
            <span className="search-filter-price-sep">—</span>
            <input name="maxPrice" type="number" placeholder="Max" defaultValue={maxPrice} />
          </div>
        </div>

        <div className="search-filter-row">
          <button type="submit" className="button" name="applyFilters">Apply</button>
          <a role="button" className="button button--secondary" href="/search">Reset</a>
        </div>
      </details>
    </div>
  );
}

export default SearchFilters;
