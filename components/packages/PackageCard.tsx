'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn, formatCurrency } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  InvitationPackage,
  PackageCategory,
  PackageTier
} from '@/types/packages';

// -----------------------------------------------------------------------------
// TYPES
// -----------------------------------------------------------------------------

export interface PackageCardProps {
  package: InvitationPackage;
  variant?: 'default' | 'compact' | 'featured';
  showRating?: boolean;
  showItemCount?: boolean;
  className?: string;
}

// -----------------------------------------------------------------------------
// CONSTANTS
// -----------------------------------------------------------------------------

const TIER_COLORS: Record<PackageTier, { badge: string; label: string }> = {
  [PackageTier.STARTER]: { badge: 'default', label: 'Starter' },
  [PackageTier.CLASSIC]: { badge: 'primary', label: 'Classic' },
  [PackageTier.DELUXE]: { badge: 'success', label: 'Deluxe' },
  [PackageTier.ULTIMATE]: { badge: 'primary', label: 'Ultimate' }
};

const CATEGORY_LABELS: Record<PackageCategory, string> = {
  [PackageCategory.WEDDING]: 'Wedding',
  [PackageCategory.BIRTHDAY]: 'Birthday',
  [PackageCategory.BABY]: 'Baby',
  [PackageCategory.GRADUATION]: 'Graduation',
  [PackageCategory.HOLIDAY]: 'Holiday',
  [PackageCategory.CORPORATE]: 'Corporate',
  [PackageCategory.RELIGIOUS]: 'Religious',
  [PackageCategory.SPECIAL]: 'Special Occasion'
};

// -----------------------------------------------------------------------------
// STAR RATING COMPONENT
// -----------------------------------------------------------------------------

function StarRating({ rating, reviewCount }: { rating: number; reviewCount: number }) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={cn(
              'w-4 h-4',
              i < fullStars
                ? 'text-warning-500 fill-current'
                : i === fullStars && hasHalfStar
                ? 'text-warning-500 fill-current'
                : 'text-surface-300'
            )}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <span className="text-sm text-surface-500">
        ({reviewCount})
      </span>
    </div>
  );
}

// -----------------------------------------------------------------------------
// PACKAGE CARD COMPONENT
// -----------------------------------------------------------------------------

export function PackageCard({
  package: pkg,
  variant = 'default',
  showRating = true,
  showItemCount = true,
  className
}: PackageCardProps) {
  const tierConfig = TIER_COLORS[pkg.tier];
  const categoryLabel = CATEGORY_LABELS[pkg.category];
  const primaryImage = pkg.images.find(img => img.isPrimary) || pkg.images[0];
  const selectableItemCount = pkg.items.filter(item => !item.isRequired).length;

  if (variant === 'compact') {
    return (
      <Link href={`/packages/${pkg.slug}`}>
        <Card
          variant="interactive"
          padding="sm"
          className={cn('flex gap-4', className)}
        >
          <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-surface-100">
            {primaryImage ? (
              <Image
                src={primaryImage.url}
                alt={primaryImage.alt}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-surface-400">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-surface-500 mb-0.5">{categoryLabel}</p>
            <h3 className="font-heading font-semibold text-surface-900 truncate">
              {pkg.name}
            </h3>
            <p className="text-lg font-bold text-brand-600 mt-1">
              {formatCurrency(pkg.basePrice)}
            </p>
          </div>
        </Card>
      </Link>
    );
  }

  if (variant === 'featured') {
    return (
      <Link href={`/packages/${pkg.slug}`}>
        <Card
          variant="interactive"
          padding="none"
          className={cn('overflow-hidden', className)}
        >
          <div className="relative aspect-[4/3] bg-surface-100">
            {primaryImage ? (
              <Image
                src={primaryImage.url}
                alt={primaryImage.alt}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-surface-400">
                <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            <div className="absolute top-4 left-4 flex gap-2">
              <Badge variant={tierConfig.badge as "default" | "primary" | "secondary" | "success" | "warning" | "error" | "outline" | "outline-primary"} size="sm">
                {tierConfig.label}
              </Badge>
              {pkg.isFeatured && (
                <Badge variant="warning" size="sm">
                  Featured
                </Badge>
              )}
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <p className="text-sm text-surface-500 mb-1">{categoryLabel}</p>
                <h3 className="font-heading text-xl font-semibold text-surface-900">
                  {pkg.name}
                </h3>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-brand-600">
                  {formatCurrency(pkg.basePrice)}
                </p>
                {showItemCount && (
                  <p className="text-sm text-surface-500">
                    {pkg.items.length} items
                  </p>
                )}
              </div>
            </div>

            <p className="text-surface-600 mb-4 line-clamp-2">
              {pkg.shortDescription}
            </p>

            {showRating && pkg.reviewCount > 0 && (
              <div className="mb-4">
                <StarRating rating={pkg.averageRating} reviewCount={pkg.reviewCount} />
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-surface-200">
              <div className="flex items-center gap-2 text-sm text-surface-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span>{pkg.invitationConfig.quantity} invitations</span>
              </div>
              <Button size="sm">
                View Package
              </Button>
            </div>
          </div>
        </Card>
      </Link>
    );
  }

  // Default variant
  return (
    <Link href={`/packages/${pkg.slug}`}>
      <Card
        variant="interactive"
        padding="none"
        className={cn('overflow-hidden h-full flex flex-col', className)}
      >
        <div className="relative aspect-[3/2] bg-surface-100">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-surface-400">
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          <div className="absolute top-3 left-3">
            <Badge variant={tierConfig.badge as "default" | "primary" | "secondary" | "success" | "warning" | "error" | "outline" | "outline-primary"} size="sm">
              {tierConfig.label}
            </Badge>
          </div>
          {pkg.isFeatured && (
            <div className="absolute top-3 right-3">
              <Badge variant="warning" size="sm">
                Popular
              </Badge>
            </div>
          )}
        </div>

        <div className="p-4 flex-1 flex flex-col">
          <p className="text-xs text-surface-500 mb-1">{categoryLabel}</p>
          <h3 className="font-heading font-semibold text-surface-900 mb-2 line-clamp-2">
            {pkg.name}
          </h3>

          {showRating && pkg.reviewCount > 0 && (
            <div className="mb-2">
              <StarRating rating={pkg.averageRating} reviewCount={pkg.reviewCount} />
            </div>
          )}

          <p className="text-sm text-surface-600 line-clamp-2 mb-3 flex-1">
            {pkg.shortDescription}
          </p>

          <div className="flex items-center justify-between pt-3 border-t border-surface-200">
            <div>
              <p className="text-xl font-bold text-brand-600">
                {formatCurrency(pkg.basePrice)}
              </p>
              {showItemCount && selectableItemCount > 0 && (
                <p className="text-xs text-surface-500">
                  {selectableItemCount} customizable items
                </p>
              )}
            </div>
            <div className="flex items-center gap-1 text-sm text-surface-500">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span>{pkg.invitationConfig.quantity}</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
