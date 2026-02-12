'use client';

import * as React from 'react';
import { cn, formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

// -----------------------------------------------------------------------------
// TYPES
// -----------------------------------------------------------------------------

export interface FundProgressProps {
  currentAmount: number;
  goalAmount: number;
  contributorCount?: number;
  showPercentage?: boolean;
  showAmounts?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'brand' | 'success' | 'warning';
  className?: string;
}

export interface FundProgressCardProps extends FundProgressProps {
  title: string;
  description?: string;
  imageUrl?: string;
  onContribute?: () => void;
}

// -----------------------------------------------------------------------------
// FUND PROGRESS BAR COMPONENT
// -----------------------------------------------------------------------------

export function FundProgress({
  currentAmount,
  goalAmount,
  contributorCount,
  showPercentage = true,
  showAmounts = true,
  size = 'md',
  color = 'brand',
  className
}: FundProgressProps) {
  const percentage = Math.min((currentAmount / goalAmount) * 100, 100);
  const isComplete = currentAmount >= goalAmount;

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  const colorClasses = {
    brand: 'bg-brand-500',
    success: 'bg-success-500',
    warning: 'bg-warning-500'
  };

  return (
    <div className={cn('', className)}>
      {/* Progress Bar */}
      <div className={cn(
        'w-full bg-surface-200 rounded-full overflow-hidden',
        sizeClasses[size]
      )}>
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            isComplete ? 'bg-success-500' : colorClasses[color]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Stats */}
      {(showPercentage || showAmounts) && (
        <div className="flex items-center justify-between mt-2">
          {showAmounts && (
            <div className="flex items-baseline gap-1">
              <span className="font-semibold text-surface-900">
                {formatCurrency(currentAmount)}
              </span>
              <span className="text-surface-500 text-sm">
                of {formatCurrency(goalAmount)}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            {contributorCount !== undefined && (
              <span className="text-sm text-surface-500">
                {contributorCount} contributor{contributorCount !== 1 ? 's' : ''}
              </span>
            )}
            {showPercentage && (
              <Badge
                variant={isComplete ? 'success' : 'default'}
                size="sm"
              >
                {percentage.toFixed(0)}%
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// FUND PROGRESS CARD COMPONENT
// -----------------------------------------------------------------------------

export function FundProgressCard({
  title,
  description,
  imageUrl,
  currentAmount,
  goalAmount,
  contributorCount,
  onContribute,
  className
}: FundProgressCardProps) {
  const isComplete = currentAmount >= goalAmount;
  const remaining = Math.max(goalAmount - currentAmount, 0);

  return (
    <div className={cn(
      'rounded-2xl bg-white border border-surface-200 overflow-hidden',
      className
    )}>
      {/* Image */}
      {imageUrl && (
        <div className="aspect-video bg-surface-100 relative">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
          {isComplete && (
            <div className="absolute inset-0 bg-success-500/90 flex items-center justify-center">
              <div className="text-center text-white">
                <svg className="w-12 h-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="font-heading font-semibold text-lg">Goal Reached!</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        <h3 className="font-heading font-semibold text-surface-900 mb-1">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-surface-600 mb-4 line-clamp-2">
            {description}
          </p>
        )}

        {/* Progress */}
        <FundProgress
          currentAmount={currentAmount}
          goalAmount={goalAmount}
          contributorCount={contributorCount}
          size="md"
          className="mb-4"
        />

        {/* Action */}
        {!isComplete && onContribute && (
          <button
            onClick={onContribute}
            className="w-full px-4 py-2.5 bg-brand-500 text-white font-heading font-medium rounded-xl hover:bg-brand-600 transition-colors"
          >
            Contribute to this fund
          </button>
        )}

        {/* Remaining */}
        {!isComplete && (
          <p className="text-center text-sm text-surface-500 mt-2">
            {formatCurrency(remaining)} still needed
          </p>
        )}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// MINI FUND PROGRESS (for lists)
// -----------------------------------------------------------------------------

export function MiniFundProgress({
  currentAmount,
  goalAmount,
  className
}: {
  currentAmount: number;
  goalAmount: number;
  className?: string;
}) {
  const percentage = Math.min((currentAmount / goalAmount) * 100, 100);

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex-1 h-1.5 bg-surface-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-brand-500 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs text-surface-500 tabular-nums">
        {percentage.toFixed(0)}%
      </span>
    </div>
  );
}

// -----------------------------------------------------------------------------
// CONTRIBUTION AMOUNT SELECTOR
// -----------------------------------------------------------------------------

export function ContributionAmountSelector({
  suggestedAmounts = [25, 50, 100, 250],
  selectedAmount,
  onAmountChange,
  minAmount = 1,
  maxAmount,
  currency = 'USD',
  className
}: {
  suggestedAmounts?: number[];
  selectedAmount: number;
  onAmountChange: (amount: number) => void;
  minAmount?: number;
  maxAmount?: number;
  currency?: string;
  className?: string;
}) {
  const [customAmount, setCustomAmount] = React.useState('');
  const [isCustom, setIsCustom] = React.useState(false);

  const handleSuggestedClick = (amount: number) => {
    setIsCustom(false);
    setCustomAmount('');
    onAmountChange(amount);
  };

  const handleCustomChange = (value: string) => {
    setCustomAmount(value);
    setIsCustom(true);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= minAmount) {
      onAmountChange(numValue);
    }
  };

  return (
    <div className={cn('', className)}>
      <label className="block text-sm font-medium text-surface-700 mb-2">
        Select Amount
      </label>

      {/* Suggested Amounts */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        {suggestedAmounts.map(amount => (
          <button
            key={amount}
            onClick={() => handleSuggestedClick(amount)}
            className={cn(
              'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              !isCustom && selectedAmount === amount
                ? 'bg-brand-500 text-white'
                : 'bg-surface-100 text-surface-700 hover:bg-surface-200'
            )}
          >
            {formatCurrency(amount)}
          </button>
        ))}
      </div>

      {/* Custom Amount */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500">
          $
        </span>
        <input
          type="number"
          placeholder="Custom amount"
          value={customAmount}
          onChange={(e) => handleCustomChange(e.target.value)}
          min={minAmount}
          max={maxAmount}
          className={cn(
            'w-full pl-7 pr-4 py-2.5 rounded-lg border text-surface-900',
            'focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500',
            isCustom ? 'border-brand-500' : 'border-surface-300'
          )}
        />
      </div>

      {maxAmount && (
        <p className="text-xs text-surface-500 mt-1">
          Maximum contribution: {formatCurrency(maxAmount)}
        </p>
      )}
    </div>
  );
}
