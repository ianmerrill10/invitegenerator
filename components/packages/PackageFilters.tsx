'use client';

import * as React from 'react';
import { cn, formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  PackageCategory,
  PackageTier,
  PackageFilters as PackageFiltersType
} from '@/types/packages';

// -----------------------------------------------------------------------------
// TYPES
// -----------------------------------------------------------------------------

export interface PackageFiltersProps {
  filters: PackageFiltersType;
  onFiltersChange: (filters: PackageFiltersType) => void;
  totalCount?: number;
  className?: string;
}

// -----------------------------------------------------------------------------
// CONSTANTS
// -----------------------------------------------------------------------------

const CATEGORIES: { value: PackageCategory; label: string; icon: string }[] = [
  { value: PackageCategory.WEDDING, label: 'Wedding', icon: '' },
  { value: PackageCategory.BIRTHDAY, label: 'Birthday', icon: '' },
  { value: PackageCategory.BABY, label: 'Baby', icon: '' },
  { value: PackageCategory.GRADUATION, label: 'Graduation', icon: '' },
  { value: PackageCategory.HOLIDAY, label: 'Holiday', icon: '' },
  { value: PackageCategory.CORPORATE, label: 'Corporate', icon: '' },
  { value: PackageCategory.RELIGIOUS, label: 'Religious', icon: '' },
  { value: PackageCategory.SPECIAL, label: 'Special', icon: '' }
];

const TIERS: { value: PackageTier; label: string; priceRange: string }[] = [
  { value: PackageTier.STARTER, label: 'Starter', priceRange: '$29-49' },
  { value: PackageTier.CLASSIC, label: 'Classic', priceRange: '$59-99' },
  { value: PackageTier.DELUXE, label: 'Deluxe', priceRange: '$119-169' },
  { value: PackageTier.ULTIMATE, label: 'Ultimate', priceRange: '$199-299' }
];

const PRICE_RANGES = [
  { min: 0, max: 50, label: 'Under $50' },
  { min: 50, max: 100, label: '$50 - $100' },
  { min: 100, max: 150, label: '$100 - $150' },
  { min: 150, max: 200, label: '$150 - $200' },
  { min: 200, max: Infinity, label: '$200+' }
];

const SORT_OPTIONS: { value: PackageFiltersType['sortBy']; label: string }[] = [
  { value: 'popularity', label: 'Most Popular' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest' }
];

// -----------------------------------------------------------------------------
// FILTER SECTION COMPONENT
// -----------------------------------------------------------------------------

function FilterSection({
  title,
  children,
  className
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('', className)}>
      <h3 className="font-heading font-semibold text-surface-900 mb-3">
        {title}
      </h3>
      {children}
    </div>
  );
}

// -----------------------------------------------------------------------------
// CATEGORY TABS COMPONENT
// -----------------------------------------------------------------------------

export function CategoryTabs({
  selected,
  onSelect,
  className
}: {
  selected: PackageCategory[];
  onSelect: (categories: PackageCategory[]) => void;
  className?: string;
}) {
  const toggleCategory = (category: PackageCategory) => {
    if (selected.includes(category)) {
      onSelect(selected.filter(c => c !== category));
    } else {
      onSelect([...selected, category]);
    }
  };

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      <Button
        variant={selected.length === 0 ? 'primary' : 'outline'}
        size="sm"
        onClick={() => onSelect([])}
      >
        All
      </Button>
      {CATEGORIES.map(({ value, label }) => (
        <Button
          key={value}
          variant={selected.includes(value) ? 'primary' : 'outline'}
          size="sm"
          onClick={() => toggleCategory(value)}
        >
          {label}
        </Button>
      ))}
    </div>
  );
}

// -----------------------------------------------------------------------------
// PACKAGE FILTERS SIDEBAR COMPONENT
// -----------------------------------------------------------------------------

export function PackageFiltersSidebar({
  filters,
  onFiltersChange,
  className
}: Omit<PackageFiltersProps, 'totalCount'>) {
  const updateFilters = (updates: Partial<PackageFiltersType>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const toggleTier = (tier: PackageTier) => {
    const currentTiers = filters.tiers || [];
    if (currentTiers.includes(tier)) {
      updateFilters({ tiers: currentTiers.filter(t => t !== tier) });
    } else {
      updateFilters({ tiers: [...currentTiers, tier] });
    }
  };

  const setPriceRange = (min: number, max: number) => {
    if (filters.minPrice === min && filters.maxPrice === max) {
      updateFilters({ minPrice: undefined, maxPrice: undefined });
    } else {
      updateFilters({ minPrice: min, maxPrice: max === Infinity ? undefined : max });
    }
  };

  const clearAllFilters = () => {
    onFiltersChange({
      page: 1,
      pageSize: filters.pageSize,
      sortBy: filters.sortBy
    });
  };

  const hasActiveFilters = (
    (filters.categories && filters.categories.length > 0) ||
    (filters.tiers && filters.tiers.length > 0) ||
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined ||
    filters.minRating !== undefined
  );

  return (
    <div className={cn('space-y-6', className)}>
      {hasActiveFilters && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-surface-600">Active filters</span>
          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            Clear all
          </Button>
        </div>
      )}

      <FilterSection title="Package Tier">
        <div className="space-y-2">
          {TIERS.map(({ value, label, priceRange }) => (
            <label
              key={value}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={filters.tiers?.includes(value) || false}
                onChange={() => toggleTier(value)}
                className="w-4 h-4 rounded border-surface-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="flex-1 text-surface-700 group-hover:text-surface-900">
                {label}
              </span>
              <span className="text-sm text-surface-500">{priceRange}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Price Range">
        <div className="space-y-2">
          {PRICE_RANGES.map(({ min, max, label }) => {
            const isSelected = filters.minPrice === min && (
              max === Infinity ? filters.maxPrice === undefined : filters.maxPrice === max
            );
            return (
              <label
                key={label}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <input
                  type="radio"
                  checked={isSelected}
                  onChange={() => setPriceRange(min, max)}
                  className="w-4 h-4 border-surface-300 text-brand-600 focus:ring-brand-500"
                />
                <span className="text-surface-700 group-hover:text-surface-900">
                  {label}
                </span>
              </label>
            );
          })}
        </div>
      </FilterSection>

      <FilterSection title="Minimum Rating">
        <div className="space-y-2">
          {[4, 3, 2].map(rating => (
            <label
              key={rating}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <input
                type="radio"
                checked={filters.minRating === rating}
                onChange={() => updateFilters({
                  minRating: filters.minRating === rating ? undefined : rating
                })}
                className="w-4 h-4 border-surface-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="flex items-center gap-1 text-surface-700 group-hover:text-surface-900">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={cn(
                      'w-4 h-4',
                      i < rating ? 'text-warning-500 fill-current' : 'text-surface-300'
                    )}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="ml-1">& up</span>
              </span>
            </label>
          ))}
        </div>
      </FilterSection>
    </div>
  );
}

// -----------------------------------------------------------------------------
// PACKAGE FILTERS TOOLBAR COMPONENT
// -----------------------------------------------------------------------------

export function PackageFiltersToolbar({
  filters,
  onFiltersChange,
  totalCount,
  className
}: PackageFiltersProps) {
  const updateFilters = (updates: Partial<PackageFiltersType>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  return (
    <div className={cn('flex flex-col sm:flex-row sm:items-center justify-between gap-4', className)}>
      <div className="flex items-center gap-2">
        {totalCount !== undefined && (
          <p className="text-surface-600">
            <span className="font-medium text-surface-900">{totalCount}</span>
            {' '}packages found
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2">
          <span className="text-sm text-surface-600">Sort by:</span>
          <select
            value={filters.sortBy || 'popularity'}
            onChange={(e) => updateFilters({ sortBy: e.target.value as PackageFiltersType['sortBy'] })}
            className="rounded-lg border border-surface-300 bg-white px-3 py-2 text-sm text-surface-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          >
            {SORT_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// ACTIVE FILTERS CHIPS
// -----------------------------------------------------------------------------

export function ActiveFiltersChips({
  filters,
  onFiltersChange,
  className
}: Omit<PackageFiltersProps, 'totalCount'>) {
  const chips: { label: string; onRemove: () => void }[] = [];

  filters.categories?.forEach(category => {
    const categoryInfo = CATEGORIES.find(c => c.value === category);
    if (categoryInfo) {
      chips.push({
        label: categoryInfo.label,
        onRemove: () => onFiltersChange({
          ...filters,
          categories: filters.categories?.filter(c => c !== category)
        })
      });
    }
  });

  filters.tiers?.forEach(tier => {
    const tierInfo = TIERS.find(t => t.value === tier);
    if (tierInfo) {
      chips.push({
        label: tierInfo.label,
        onRemove: () => onFiltersChange({
          ...filters,
          tiers: filters.tiers?.filter(t => t !== tier)
        })
      });
    }
  });

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    const label = filters.maxPrice
      ? `${formatCurrency(filters.minPrice || 0)} - ${formatCurrency(filters.maxPrice)}`
      : `${formatCurrency(filters.minPrice || 0)}+`;
    chips.push({
      label,
      onRemove: () => onFiltersChange({
        ...filters,
        minPrice: undefined,
        maxPrice: undefined
      })
    });
  }

  if (filters.minRating !== undefined) {
    chips.push({
      label: `${filters.minRating}+ stars`,
      onRemove: () => onFiltersChange({
        ...filters,
        minRating: undefined
      })
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {chips.map((chip, index) => (
        <Badge key={index} variant="outline" className="gap-1 pr-1">
          {chip.label}
          <button
            onClick={chip.onRemove}
            className="ml-1 p-0.5 rounded-full hover:bg-surface-200 transition-colors"
            aria-label={`Remove ${chip.label} filter`}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </Badge>
      ))}
      <button
        onClick={() => onFiltersChange({ page: 1, pageSize: filters.pageSize, sortBy: filters.sortBy })}
        className="text-sm text-brand-600 hover:text-brand-700 font-medium"
      >
        Clear all
      </button>
    </div>
  );
}
