'use client';

import * as React from 'react';
import { cn, formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { PriceBreakdown } from '@/types/packages';

// -----------------------------------------------------------------------------
// TYPES
// -----------------------------------------------------------------------------

export interface PriceDisplayProps {
  breakdown: PriceBreakdown;
  showDetails?: boolean;
  showSavings?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export interface SimplePriceDisplayProps {
  price: number;
  originalPrice?: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// -----------------------------------------------------------------------------
// SIMPLE PRICE DISPLAY
// -----------------------------------------------------------------------------

export function SimplePriceDisplay({
  price,
  originalPrice,
  label,
  size = 'md',
  className
}: SimplePriceDisplayProps) {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl'
  };

  const hasDiscount = originalPrice && originalPrice > price;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  return (
    <div className={cn('', className)}>
      {label && (
        <p className="text-sm text-surface-500 mb-1">{label}</p>
      )}
      <div className="flex items-baseline gap-2">
        <span className={cn('font-bold text-brand-600', sizeClasses[size])}>
          {formatCurrency(price)}
        </span>
        {hasDiscount && (
          <>
            <span className="text-surface-400 line-through">
              {formatCurrency(originalPrice)}
            </span>
            <Badge variant="success" size="sm">
              {discountPercent}% off
            </Badge>
          </>
        )}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// SAVINGS BADGE
// -----------------------------------------------------------------------------

export function SavingsBadge({
  savings,
  savingsPercentage,
  className
}: {
  savings: number;
  savingsPercentage: number;
  className?: string;
}) {
  if (savings <= 0) return null;

  return (
    <div className={cn(
      'inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-success-50 border border-success-200',
      className
    )}>
      <svg className="w-4 h-4 text-success-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
      <span className="text-sm font-medium text-success-700">
        Save {formatCurrency(savings)} ({savingsPercentage.toFixed(0)}% off)
      </span>
    </div>
  );
}

// -----------------------------------------------------------------------------
// FULL PRICE BREAKDOWN DISPLAY
// -----------------------------------------------------------------------------

export function PriceDisplay({
  breakdown,
  showDetails = false,
  showSavings = true,
  size = 'md',
  className
}: PriceDisplayProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const sizeClasses = {
    sm: { total: 'text-xl', label: 'text-xs' },
    md: { total: 'text-2xl', label: 'text-sm' },
    lg: { total: 'text-3xl', label: 'text-base' }
  };

  return (
    <div className={cn('', className)}>
      {/* Main Price */}
      <div className="flex items-baseline gap-3 mb-2">
        <span className={cn('font-bold text-brand-600', sizeClasses[size].total)}>
          {formatCurrency(breakdown.total)}
        </span>
        {showSavings && breakdown.savings > 0 && (
          <Badge variant="success" size="sm">
            Save {formatCurrency(breakdown.savings)}
          </Badge>
        )}
      </div>

      {/* Subtotal & Tax Summary */}
      <p className={cn('text-surface-500', sizeClasses[size].label)}>
        {formatCurrency(breakdown.subtotal)} + {formatCurrency(breakdown.estimatedShipping)} shipping + {formatCurrency(breakdown.tax)} tax
      </p>

      {/* Expandable Details */}
      {showDetails && (
        <div className="mt-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700 font-medium"
          >
            {isExpanded ? 'Hide' : 'Show'} price breakdown
            <svg
              className={cn('w-4 h-4 transition-transform', isExpanded && 'rotate-180')}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isExpanded && (
            <div className="mt-3 p-4 rounded-xl bg-surface-50 border border-surface-200">
              <PriceBreakdownTable breakdown={breakdown} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// PRICE BREAKDOWN TABLE
// -----------------------------------------------------------------------------

export function PriceBreakdownTable({
  breakdown,
  className
}: {
  breakdown: PriceBreakdown;
  className?: string;
}) {
  const lineItems = [
    { label: 'Invitations', value: breakdown.invitationsCost, show: true },
    { label: 'Package Items', value: breakdown.selectedItemsTotal, show: true },
    { label: 'Curation Fee', value: breakdown.curationFee, show: breakdown.curationFee > 0 },
    { label: 'Paper Upgrade', value: breakdown.paperUpgradeCost, show: breakdown.paperUpgradeCost > 0 },
    { label: 'Additional Quantity', value: breakdown.additionalQuantityCost, show: breakdown.additionalQuantityCost > 0 }
  ];

  return (
    <div className={cn('space-y-2', className)}>
      {lineItems.filter(item => item.show).map((item, index) => (
        <div key={index} className="flex justify-between text-sm">
          <span className="text-surface-600">{item.label}</span>
          <span className="text-surface-900 font-medium">{formatCurrency(item.value)}</span>
        </div>
      ))}

      <div className="pt-2 mt-2 border-t border-surface-200 flex justify-between text-sm">
        <span className="text-surface-600">Subtotal</span>
        <span className="text-surface-900 font-medium">{formatCurrency(breakdown.subtotal)}</span>
      </div>

      <div className="flex justify-between text-sm">
        <span className="text-surface-600">Shipping (Standard)</span>
        <span className="text-surface-900 font-medium">{formatCurrency(breakdown.estimatedShipping)}</span>
      </div>

      <div className="flex justify-between text-sm">
        <span className="text-surface-600">Estimated Tax</span>
        <span className="text-surface-900 font-medium">{formatCurrency(breakdown.tax)}</span>
      </div>

      <div className="pt-2 mt-2 border-t border-surface-200 flex justify-between">
        <span className="font-heading font-semibold text-surface-900">Total</span>
        <span className="font-heading font-bold text-brand-600 text-lg">
          {formatCurrency(breakdown.total)}
        </span>
      </div>

      {breakdown.savings > 0 && (
        <div className="pt-2 flex justify-between text-sm">
          <span className="text-success-600 font-medium">You save</span>
          <span className="text-success-600 font-medium">
            {formatCurrency(breakdown.savings)} ({breakdown.savingsPercentage.toFixed(0)}%)
          </span>
        </div>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// COMPACT PRICE SUMMARY
// -----------------------------------------------------------------------------

export function CompactPriceSummary({
  breakdown,
  className
}: {
  breakdown: PriceBreakdown;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center justify-between p-4 rounded-xl bg-surface-50 border border-surface-200', className)}>
      <div>
        <p className="text-sm text-surface-500">Total</p>
        <p className="text-2xl font-bold text-brand-600">
          {formatCurrency(breakdown.total)}
        </p>
      </div>
      {breakdown.savings > 0 && (
        <SavingsBadge savings={breakdown.savings} savingsPercentage={breakdown.savingsPercentage} />
      )}
    </div>
  );
}
