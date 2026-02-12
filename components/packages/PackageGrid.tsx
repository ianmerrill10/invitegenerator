'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { PackageCard } from './PackageCard';
import { InvitationPackage } from '@/types/packages';

// -----------------------------------------------------------------------------
// TYPES
// -----------------------------------------------------------------------------

export interface PackageGridProps {
  packages: InvitationPackage[];
  columns?: 2 | 3 | 4;
  variant?: 'default' | 'compact' | 'featured';
  showRating?: boolean;
  showItemCount?: boolean;
  emptyMessage?: string;
  className?: string;
}

// -----------------------------------------------------------------------------
// LOADING SKELETON
// -----------------------------------------------------------------------------

function PackageCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white border border-surface-200 overflow-hidden animate-pulse">
      <div className="aspect-[3/2] bg-surface-200" />
      <div className="p-4">
        <div className="h-3 bg-surface-200 rounded w-16 mb-2" />
        <div className="h-5 bg-surface-200 rounded w-3/4 mb-3" />
        <div className="h-4 bg-surface-200 rounded w-full mb-2" />
        <div className="h-4 bg-surface-200 rounded w-2/3 mb-4" />
        <div className="pt-3 border-t border-surface-200 flex justify-between">
          <div className="h-6 bg-surface-200 rounded w-20" />
          <div className="h-4 bg-surface-200 rounded w-12" />
        </div>
      </div>
    </div>
  );
}

export function PackageGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(count)].map((_, i) => (
        <PackageCardSkeleton key={i} />
      ))}
    </div>
  );
}

// -----------------------------------------------------------------------------
// EMPTY STATE
// -----------------------------------------------------------------------------

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-20 h-20 rounded-full bg-surface-100 flex items-center justify-center mb-4">
        <svg
          className="w-10 h-10 text-surface-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
      </div>
      <p className="text-lg font-heading font-medium text-surface-900 mb-1">
        No packages found
      </p>
      <p className="text-surface-500 text-center max-w-md">
        {message}
      </p>
    </div>
  );
}

// -----------------------------------------------------------------------------
// PACKAGE GRID COMPONENT
// -----------------------------------------------------------------------------

export function PackageGrid({
  packages,
  columns = 3,
  variant = 'default',
  showRating = true,
  showItemCount = true,
  emptyMessage = 'Try adjusting your filters to find what you\'re looking for.',
  className
}: PackageGridProps) {
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  };

  if (packages.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <div className={cn('grid gap-6', gridCols[columns], className)}>
      {packages.map((pkg) => (
        <PackageCard
          key={pkg.id}
          package={pkg}
          variant={variant}
          showRating={showRating}
          showItemCount={showItemCount}
        />
      ))}
    </div>
  );
}
