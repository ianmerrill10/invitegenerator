'use client';

import * as React from 'react';
import Image from 'next/image';
import { cn, formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { PackageItem, ItemCategory, SelectedItemDetail } from '@/types/packages';

// -----------------------------------------------------------------------------
// TYPES
// -----------------------------------------------------------------------------

export interface ItemSelectorProps {
  items: SelectedItemDetail[];
  onToggleItem: (itemId: string) => void;
  disabled?: boolean;
  className?: string;
}

export interface ItemCardProps {
  item: PackageItem;
  isSelected: boolean;
  priceImpact: number;
  curationFeeImpact: number;
  onToggle: () => void;
  disabled?: boolean;
  className?: string;
}

// -----------------------------------------------------------------------------
// CONSTANTS
// -----------------------------------------------------------------------------

const ITEM_CATEGORY_LABELS: Record<ItemCategory, string> = {
  [ItemCategory.INVITATION]: 'Invitations',
  [ItemCategory.DECORATION]: 'Decorations',
  [ItemCategory.PARTY_SUPPLIES]: 'Party Supplies',
  [ItemCategory.GAMES]: 'Games',
  [ItemCategory.PHOTO]: 'Photo',
  [ItemCategory.KEEPSAKE]: 'Keepsakes',
  [ItemCategory.TABLEWARE]: 'Tableware',
  [ItemCategory.WEARABLE]: 'Wearables',
  [ItemCategory.STATIONERY]: 'Stationery'
};

const ITEM_CATEGORY_ICONS: Record<ItemCategory, React.ReactNode> = {
  [ItemCategory.INVITATION]: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  [ItemCategory.DECORATION]: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
  [ItemCategory.PARTY_SUPPLIES]: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" />
    </svg>
  ),
  [ItemCategory.GAMES]: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  [ItemCategory.PHOTO]: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  [ItemCategory.KEEPSAKE]: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  [ItemCategory.TABLEWARE]: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  [ItemCategory.WEARABLE]: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  [ItemCategory.STATIONERY]: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  )
};

// -----------------------------------------------------------------------------
// ITEM CARD COMPONENT
// -----------------------------------------------------------------------------

export function ItemCard({
  item,
  isSelected,
  priceImpact,
  curationFeeImpact,
  onToggle,
  disabled = false,
  className
}: ItemCardProps) {
  const totalImpact = priceImpact + curationFeeImpact;
  const categoryLabel = ITEM_CATEGORY_LABELS[item.category];
  const categoryIcon = ITEM_CATEGORY_ICONS[item.category];

  return (
    <Card
      variant="default"
      padding="none"
      className={cn(
        'overflow-hidden transition-all',
        isSelected ? 'ring-2 ring-brand-500 ring-offset-2' : 'opacity-75 hover:opacity-100',
        disabled && 'pointer-events-none',
        className
      )}
    >
      <div className="flex">
        {/* Image */}
        <div className="relative w-24 h-24 flex-shrink-0 bg-surface-100">
          {item.thumbnailUrl ? (
            <Image
              src={item.thumbnailUrl}
              alt={item.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-surface-400">
              {categoryIcon}
            </div>
          )}
          {item.isRequired && (
            <div className="absolute top-1 left-1">
              <Badge variant="primary" size="sm">Required</Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-3 flex flex-col">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 text-xs text-surface-500 mb-0.5">
                {categoryIcon}
                <span>{categoryLabel}</span>
              </div>
              <h4 className="font-heading font-medium text-surface-900 text-sm line-clamp-1">
                {item.name}
              </h4>
            </div>
            {!item.isRequired && (
              <button
                onClick={onToggle}
                disabled={disabled}
                className={cn(
                  'w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors',
                  isSelected
                    ? 'bg-brand-500 border-brand-500 text-white'
                    : 'border-surface-300 hover:border-brand-400'
                )}
              >
                {isSelected && (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            )}
          </div>

          <p className="text-xs text-surface-500 line-clamp-2 flex-1">
            {item.description}
          </p>

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-surface-100">
            <span className={cn(
              'text-sm font-medium',
              isSelected ? 'text-brand-600' : 'text-surface-400'
            )}>
              {isSelected ? '+' : ''}{formatCurrency(totalImpact)}
            </span>
            {item.amazonAsin && (
              <span className="text-xs text-surface-400">Amazon</span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

// -----------------------------------------------------------------------------
// ITEM SELECTOR COMPONENT
// -----------------------------------------------------------------------------

export function ItemSelector({
  items,
  onToggleItem,
  disabled = false,
  className
}: ItemSelectorProps) {
  // Group items by category
  const groupedItems = React.useMemo(() => {
    const groups: Partial<Record<ItemCategory, SelectedItemDetail[]>> = {};

    items.forEach(detail => {
      const category = detail.item.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category]!.push(detail);
    });

    // Sort groups by category order
    const orderedCategories = Object.values(ItemCategory);
    return orderedCategories
      .filter(category => groups[category] && groups[category]!.length > 0)
      .map(category => ({
        category,
        label: ITEM_CATEGORY_LABELS[category],
        items: groups[category]!.sort((a, b) => a.item.sortOrder - b.item.sortOrder)
      }));
  }, [items]);

  const selectedCount = items.filter(i => i.isIncluded).length;
  const totalCount = items.length;

  return (
    <div className={cn('', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading font-semibold text-surface-900">
          Package Items
        </h3>
        <Badge variant="outline">
          {selectedCount} of {totalCount} selected
        </Badge>
      </div>

      {/* Grouped Items */}
      <div className="space-y-6">
        {groupedItems.map(({ category, label, items: categoryItems }) => (
          <div key={category}>
            <h4 className="flex items-center gap-2 text-sm font-medium text-surface-700 mb-3">
              {ITEM_CATEGORY_ICONS[category]}
              {label}
              <span className="text-surface-400">({categoryItems.length})</span>
            </h4>
            <div className="space-y-3">
              {categoryItems.map(detail => (
                <ItemCard
                  key={detail.item.id}
                  item={detail.item}
                  isSelected={detail.isIncluded}
                  priceImpact={detail.priceImpact}
                  curationFeeImpact={detail.curationFeeImpact}
                  onToggle={() => onToggleItem(detail.item.id)}
                  disabled={disabled || detail.item.isRequired}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// COMPACT ITEM LIST
// -----------------------------------------------------------------------------

export function CompactItemList({
  items,
  maxVisible = 5,
  className
}: {
  items: PackageItem[];
  maxVisible?: number;
  className?: string;
}) {
  const [showAll, setShowAll] = React.useState(false);
  const visibleItems = showAll ? items : items.slice(0, maxVisible);
  const hiddenCount = items.length - maxVisible;

  return (
    <div className={cn('', className)}>
      <ul className="space-y-2">
        {visibleItems.map(item => (
          <li key={item.id} className="flex items-center gap-2 text-sm">
            <svg className="w-4 h-4 text-success-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-surface-700">{item.name}</span>
            {item.isRequired && (
              <Badge variant="default" size="sm">Included</Badge>
            )}
          </li>
        ))}
      </ul>

      {hiddenCount > 0 && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="mt-3 text-sm text-brand-600 hover:text-brand-700 font-medium"
        >
          +{hiddenCount} more items
        </button>
      )}

      {showAll && hiddenCount > 0 && (
        <button
          onClick={() => setShowAll(false)}
          className="mt-3 text-sm text-brand-600 hover:text-brand-700 font-medium"
        >
          Show less
        </button>
      )}
    </div>
  );
}
