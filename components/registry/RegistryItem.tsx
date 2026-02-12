'use client';

import * as React from 'react';
import Image from 'next/image';
import { cn, formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MiniFundProgress } from './FundProgress';
import { RegistryItem as RegistryItemType, ItemType } from '@/types/registry';

// -----------------------------------------------------------------------------
// TYPES
// -----------------------------------------------------------------------------

export interface RegistryItemCardProps {
  item: RegistryItemType;
  variant?: 'default' | 'compact' | 'horizontal';
  onPurchase?: (item: RegistryItemType) => void;
  onContribute?: (item: RegistryItemType) => void;
  showPrice?: boolean;
  isHost?: boolean;
  className?: string;
}

// -----------------------------------------------------------------------------
// CONSTANTS
// -----------------------------------------------------------------------------

const ITEM_TYPE_CONFIG: Record<ItemType, { label: string; icon: React.ReactNode; color: string }> = {
  [ItemType.PRODUCT]: {
    label: 'Gift',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
      </svg>
    ),
    color: 'brand'
  },
  [ItemType.DONATION]: {
    label: 'Charity',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    color: 'error'
  },
  [ItemType.EXPERIENCE]: {
    label: 'Experience',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
    color: 'warning'
  },
  [ItemType.SERVICE]: {
    label: 'Service',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: 'success'
  },
  [ItemType.CASH_FUND]: {
    label: 'Cash Fund',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: 'brand'
  }
};

const PRIORITY_CONFIG = {
  high: { label: 'Most Wanted', variant: 'warning' as const },
  medium: { label: 'Wanted', variant: 'default' as const },
  low: { label: 'Nice to Have', variant: 'outline' as const }
};

// -----------------------------------------------------------------------------
// REGISTRY ITEM CARD COMPONENT
// -----------------------------------------------------------------------------

export function RegistryItemCard({
  item,
  variant = 'default',
  onPurchase,
  onContribute,
  showPrice = true,
  isHost = false,
  className
}: RegistryItemCardProps) {
  const typeConfig = ITEM_TYPE_CONFIG[item.type];
  const priorityConfig = PRIORITY_CONFIG[item.priority];
  const isFund = item.type === ItemType.EXPERIENCE || item.type === ItemType.CASH_FUND;
  const hasFundProgress = isFund && item.goalAmount && item.currentAmount !== undefined;
  const isFullyPurchased = item.isPurchased || (item.quantity > 0 && item.quantityFulfilled >= item.quantity);

  // Horizontal variant for compact lists
  if (variant === 'horizontal') {
    return (
      <div className={cn(
        'flex items-center gap-4 p-3 rounded-xl border border-surface-200 bg-white',
        isFullyPurchased && 'opacity-60',
        className
      )}>
        {/* Image */}
        <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-surface-100">
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={item.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-surface-400">
              {typeConfig.icon}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-surface-900 truncate">{item.name}</h4>
            {isFullyPurchased && (
              <Badge variant="success" size="sm">Purchased</Badge>
            )}
          </div>
          {showPrice && (
            <p className="text-sm text-surface-600">{formatCurrency(item.price)}</p>
          )}
        </div>

        {/* Action */}
        {!isFullyPurchased && !isHost && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => isFund ? onContribute?.(item) : onPurchase?.(item)}
          >
            {isFund ? 'Contribute' : 'Purchase'}
          </Button>
        )}
      </div>
    );
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <Card
        variant={isFullyPurchased ? 'default' : 'hover'}
        padding="sm"
        className={cn(isFullyPurchased && 'opacity-60', className)}
      >
        <div className="flex gap-3">
          {/* Image */}
          <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-surface-100">
            {item.imageUrl ? (
              <Image
                src={item.imageUrl}
                alt={item.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-surface-400">
                {typeConfig.icon}
              </div>
            )}
            {isFullyPurchased && (
              <div className="absolute inset-0 bg-success-500/80 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-surface-900 line-clamp-1 mb-1">{item.name}</h4>
            {hasFundProgress ? (
              <MiniFundProgress
                currentAmount={item.currentAmount!}
                goalAmount={item.goalAmount!}
              />
            ) : showPrice ? (
              <p className="text-sm font-semibold text-brand-600">{formatCurrency(item.price)}</p>
            ) : null}
          </div>
        </div>
      </Card>
    );
  }

  // Default variant
  return (
    <Card
      variant={isFullyPurchased ? 'default' : 'interactive'}
      padding="none"
      className={cn('overflow-hidden', isFullyPurchased && 'opacity-60', className)}
    >
      {/* Image */}
      <div className="relative aspect-square bg-surface-100">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-surface-300">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-surface-200 flex items-center justify-center">
                {typeConfig.icon}
              </div>
              <span className="text-sm">{typeConfig.label}</span>
            </div>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {item.priority === 'high' && (
            <Badge variant={priorityConfig.variant} size="sm">
              {priorityConfig.label}
            </Badge>
          )}
        </div>

        {/* Purchased overlay */}
        {isFullyPurchased && (
          <div className="absolute inset-0 bg-success-500/80 flex items-center justify-center">
            <div className="text-center text-white">
              <svg className="w-12 h-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="font-heading font-semibold">Purchased</p>
              {item.purchasedBy && !item.isVisible && (
                <p className="text-sm opacity-80">by {item.purchasedBy}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <p className="text-xs text-surface-500 mb-1 flex items-center gap-1">
              {typeConfig.icon}
              {typeConfig.label}
            </p>
            <h3 className="font-heading font-semibold text-surface-900 line-clamp-2">
              {item.name}
            </h3>
          </div>
          {item.quantity > 1 && (
            <Badge variant="outline" size="sm">
              {item.quantityFulfilled}/{item.quantity}
            </Badge>
          )}
        </div>

        {item.description && (
          <p className="text-sm text-surface-600 line-clamp-2 mb-3">
            {item.description}
          </p>
        )}

        {/* Fund Progress */}
        {hasFundProgress && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-surface-600">
                {formatCurrency(item.currentAmount!)} raised
              </span>
              <span className="text-surface-500">
                of {formatCurrency(item.goalAmount!)}
              </span>
            </div>
            <div className="h-2 bg-surface-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-500 rounded-full transition-all"
                style={{ width: `${Math.min((item.currentAmount! / item.goalAmount!) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Price & Action */}
        <div className="flex items-center justify-between pt-3 border-t border-surface-100">
          {showPrice && !hasFundProgress && (
            <span className="text-lg font-bold text-brand-600">
              {formatCurrency(item.price)}
            </span>
          )}

          {!isFullyPurchased && !isHost && (
            <Button
              size="sm"
              onClick={() => isFund ? onContribute?.(item) : onPurchase?.(item)}
              className={!showPrice || hasFundProgress ? 'w-full' : ''}
            >
              {isFund ? 'Contribute' : 'Purchase'}
            </Button>
          )}

          {isHost && (
            <Button variant="ghost" size="sm">
              Edit
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

// -----------------------------------------------------------------------------
// REGISTRY ITEM GRID
// -----------------------------------------------------------------------------

export function RegistryItemGrid({
  items,
  onPurchase,
  onContribute,
  showPrice = true,
  isHost = false,
  columns = 3,
  className
}: {
  items: RegistryItemType[];
  onPurchase?: (item: RegistryItemType) => void;
  onContribute?: (item: RegistryItemType) => void;
  showPrice?: boolean;
  isHost?: boolean;
  columns?: 2 | 3 | 4;
  className?: string;
}) {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
          </svg>
        </div>
        <p className="text-surface-600">No items in this registry yet.</p>
      </div>
    );
  }

  return (
    <div className={cn('grid gap-4', gridCols[columns], className)}>
      {items.map(item => (
        <RegistryItemCard
          key={item.id}
          item={item}
          onPurchase={onPurchase}
          onContribute={onContribute}
          showPrice={showPrice}
          isHost={isHost}
        />
      ))}
    </div>
  );
}
