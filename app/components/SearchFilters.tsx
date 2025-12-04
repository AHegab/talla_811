import React, { useState } from 'react';
import { useSearchParams } from 'react-router';
import { ChevronDown } from 'lucide-react';

/**
 * Enhanced search filters component with modern design.
 * Features circular color swatches, pill-shaped category buttons, and price range slider.
 * Designed to be used together with `SearchForm` so all filter inputs are submitted as query params.
 */
export function SearchFilters({
  colors = ['Black', 'White', 'Navy', 'Gray', 'Brown', 'Green', 'Beige', 'Red'],
  types = ['T-Shirts', 'Shirts', 'Pants', 'Jackets', 'Sweaters', 'Accessories'],
  minPriceLimit = 49,
  maxPriceLimit = 1999,
}: {
  colors?: string[];
  types?: string[];
  minPriceLimit?: number;
  maxPriceLimit?: number;
}) {
  const [searchParams] = useSearchParams();
  const selectedColors = searchParams.getAll('color');
  const selectedType = searchParams.get('type') ?? '';
  const minPrice = searchParams.get('minPrice') ?? minPriceLimit.toString();
  const maxPrice = searchParams.get('maxPrice') ?? maxPriceLimit.toString();
  const [isOpen, setIsOpen] = useState(true);

  const getColorHex = (color: string): string => {
    const colorMap: Record<string, string> = {
      black: '#1a1a1a',
      white: '#ffffff',
      navy: '#1e3a5f',
      gray: '#9ca3af',
      brown: '#92633b',
      green: '#4a5f4a',
      beige: '#c9b89a',
      red: '#b91c1c',
      blue: '#2563eb',
    };
    return colorMap[color.toLowerCase()] || color.toLowerCase();
  };

  const hasActiveFilters = selectedColors.length > 0 || selectedType !== '' ||
    minPrice !== minPriceLimit.toString() || maxPrice !== maxPriceLimit.toString();

  return (
    <div className="search-filters-enhanced" aria-label="Search filters">
      <div className="search-filters-container">
        {/* Collapsible Header */}
        <div className="search-filters-header-wrapper">
          <button
            type="button"
            className="search-filters-header"
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
          >
            <div className="search-filters-header-left">
              <div className="search-filters-icon-container">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="search-filters-icon"
                >
                  <line x1="4" y1="21" x2="4" y2="14"></line>
                  <line x1="4" y1="10" x2="4" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12" y2="3"></line>
                  <line x1="20" y1="21" x2="20" y2="16"></line>
                  <line x1="20" y1="12" x2="20" y2="3"></line>
                  <line x1="1" y1="14" x2="7" y2="14"></line>
                  <line x1="9" y1="8" x2="15" y2="8"></line>
                  <line x1="17" y1="16" x2="23" y2="16"></line>
                </svg>
              </div>
              <div className="search-filters-header-content">
                <h3 className="search-filters-title">Refine Selection</h3>
                <span className="search-filters-subtitle">
                  {hasActiveFilters ? (
                    <>
                      <span className="filters-active-dot"></span>
                      Filters Active
                    </>
                  ) : (
                    'Color • Category • Price Range'
                  )}
                </span>
              </div>
            </div>
            <div className="search-filters-header-right">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const url = new URL(window.location.href);
                    url.search = '';
                    window.location.href = url.toString();
                  }}
                  className="search-filters-clear-button"
                >
                  Clear All
                </button>
              )}
              <ChevronDown
                className={`search-filters-chevron ${isOpen ? 'rotate-180' : ''}`}
                size={20}
              />
            </div>
          </button>
        </div>

        {/* Filter Content */}
        {isOpen && (
          <div className="search-filters-content">
            {/* Color Filter */}
            <div className="search-filter-section">
              <div className="search-filter-header">
                <div className="search-filter-icon-wrapper">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 2a10 10 0 0 1 0 20"/>
                  </svg>
                </div>
                <h3 className="search-filter-title">COLOR</h3>
              </div>
              <div className="search-filter-color-grid">
                {colors.map((color) => {
                  const colorValue = color.toLowerCase();
                  const isSelected = selectedColors.includes(colorValue);
                  return (
                    <label key={color} className="search-filter-color-option">
                      <input
                        type="checkbox"
                        name="color"
                        value={colorValue}
                        defaultChecked={isSelected}
                        className="search-filter-color-input"
                      />
                      <div className="search-filter-color-swatch-wrapper">
                        <span
                          className={`search-filter-color-swatch ${isSelected ? 'selected' : ''}`}
                          style={{
                            backgroundColor: getColorHex(color),
                            border: color.toLowerCase() === 'white' ? '1px solid #e5e7eb' : 'none'
                          }}
                        />
                        <span className="search-filter-color-label">{color.toUpperCase()}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Category Filter */}
            <div className="search-filter-section">
              <div className="search-filter-header">
                <div className="search-filter-icon-wrapper">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="3" width="7" height="7"/>
                    <rect x="14" y="3" width="7" height="7"/>
                    <rect x="14" y="14" width="7" height="7"/>
                    <rect x="3" y="14" width="7" height="7"/>
                  </svg>
                </div>
                <h3 className="search-filter-title">CATEGORY</h3>
              </div>
              <div className="search-filter-category-grid">
                <label className="search-filter-category-button">
                  <input
                    type="radio"
                    name="type"
                    value=""
                    defaultChecked={!selectedType}
                    className="search-filter-category-input"
                  />
                  <span className="search-filter-category-label">ALL</span>
                </label>
                {types.map((type) => {
                  const typeValue = type.toLowerCase().replace(/\s+/g, '-');
                  const isSelected = selectedType === typeValue;
                  return (
                    <label key={type} className="search-filter-category-button">
                      <input
                        type="radio"
                        name="type"
                        value={typeValue}
                        defaultChecked={isSelected}
                        className="search-filter-category-input"
                      />
                      <span className="search-filter-category-label">
                        {type.toUpperCase()}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="search-filter-section">
              <div className="search-filter-header">
                <div className="search-filter-icon-wrapper">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 6v6l4 2"/>
                  </svg>
                </div>
                <h3 className="search-filter-title">PRICE RANGE</h3>
              </div>
              <div className="search-filter-price-wrapper">
                <div className="search-filter-price-labels">
                  <div className="search-filter-price-label">
                    <span className="search-filter-price-label-text">FROM</span>
                    <span className="search-filter-price-value">{minPrice} EGP</span>
                  </div>
                  <div className="search-filter-price-label">
                    <span className="search-filter-price-label-text">TO</span>
                    <span className="search-filter-price-value">{maxPrice} EGP</span>
                  </div>
                </div>
                <div className="search-filter-price-range">
                  <input
                    type="range"
                    name="minPrice"
                    min={minPriceLimit}
                    max={maxPriceLimit}
                    defaultValue={minPrice}
                    className="search-filter-range-input search-filter-range-min"
                  />
                  <input
                    type="range"
                    name="maxPrice"
                    min={minPriceLimit}
                    max={maxPriceLimit}
                    defaultValue={maxPrice}
                    className="search-filter-range-input search-filter-range-max"
                  />
                  <div className="search-filter-range-track">
                    <div className="search-filter-range-progress" />
                  </div>
                </div>
                <div className="search-filter-price-minmax">
                  <span>{minPriceLimit} EGP</span>
                  <span>{maxPriceLimit} EGP</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchFilters;
