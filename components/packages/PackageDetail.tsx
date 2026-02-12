'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn, formatCurrency } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ItemSelector, CompactItemList } from './ItemSelector';
import { PriceBreakdownTable, SavingsBadge } from './PriceDisplay';
import { PackagePricingCalculator } from '@/lib/pricing-calculator';
import {
  InvitationPackage,
  PackageCategory,
  PackageTier,
  PaperType,
  PriceBreakdown,
  SelectedItemDetail,
  ShippingEstimate
} from '@/types/packages';

// -----------------------------------------------------------------------------
// TYPES
// -----------------------------------------------------------------------------

export interface PackageDetailProps {
  package: InvitationPackage;
  onAddToCart?: (customization: PackageCustomization) => void;
  className?: string;
}

export interface PackageCustomization {
  packageId: string;
  selectedItemIds: string[];
  invitationQuantity: number;
  paperType: PaperType;
  priceBreakdown: PriceBreakdown;
}

// -----------------------------------------------------------------------------
// CONSTANTS
// -----------------------------------------------------------------------------

const TIER_CONFIG: Record<PackageTier, { color: string; label: string }> = {
  [PackageTier.STARTER]: { color: 'default', label: 'Starter' },
  [PackageTier.CLASSIC]: { color: 'primary', label: 'Classic' },
  [PackageTier.DELUXE]: { color: 'success', label: 'Deluxe' },
  [PackageTier.ULTIMATE]: { color: 'primary', label: 'Ultimate' }
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

const PAPER_OPTIONS: { value: PaperType; label: string; description: string }[] = [
  { value: PaperType.STANDARD, label: 'Standard', description: 'Classic matte finish' },
  { value: PaperType.PREMIUM, label: 'Premium', description: 'Enhanced brightness' },
  { value: PaperType.CARDSTOCK, label: 'Cardstock', description: 'Thick & sturdy' },
  { value: PaperType.LINEN, label: 'Linen', description: 'Textured elegance' },
  { value: PaperType.COTTON, label: 'Cotton', description: 'Luxury feel' }
];

const QUANTITY_OPTIONS = [25, 50, 75, 100, 150, 200];

// -----------------------------------------------------------------------------
// IMAGE GALLERY COMPONENT
// -----------------------------------------------------------------------------

function ImageGallery({ images, packageName }: { images: InvitationPackage['images']; packageName: string }) {
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const primaryImage = images[selectedIndex] || images[0];

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-surface-100 rounded-2xl flex items-center justify-center">
        <svg className="w-20 h-20 text-surface-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative aspect-square bg-surface-100 rounded-2xl overflow-hidden">
        <Image
          src={primaryImage.url}
          alt={primaryImage.alt || packageName}
          fill
          className="object-cover"
          priority
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                'relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 transition-all',
                selectedIndex === index
                  ? 'ring-2 ring-brand-500 ring-offset-2'
                  : 'opacity-70 hover:opacity-100'
              )}
            >
              <Image
                src={image.url}
                alt={image.alt}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// QUANTITY SELECTOR COMPONENT
// -----------------------------------------------------------------------------

function QuantitySelector({
  value,
  onChange,
  baseQuantity,
  options = QUANTITY_OPTIONS
}: {
  value: number;
  onChange: (quantity: number) => void;
  baseQuantity: number;
  options?: number[];
}) {
  const allOptions = [...new Set([baseQuantity, ...options])].sort((a, b) => a - b);

  return (
    <div>
      <label className="block text-sm font-medium text-surface-700 mb-2">
        Invitation Quantity
      </label>
      <div className="flex flex-wrap gap-2">
        {allOptions.map(qty => (
          <button
            key={qty}
            onClick={() => onChange(qty)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              value === qty
                ? 'bg-brand-500 text-white'
                : 'bg-surface-100 text-surface-700 hover:bg-surface-200'
            )}
          >
            {qty}
            {qty === baseQuantity && <span className="ml-1 text-xs opacity-70">(base)</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// PAPER SELECTOR COMPONENT
// -----------------------------------------------------------------------------

function PaperSelector({
  value,
  onChange,
  basePaperType
}: {
  value: PaperType;
  onChange: (paper: PaperType) => void;
  basePaperType: PaperType;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-surface-700 mb-2">
        Paper Type
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {PAPER_OPTIONS.map(option => {
          const isBase = option.value === basePaperType;
          const isSelected = value === option.value;

          return (
            <button
              key={option.value}
              onClick={() => onChange(option.value)}
              className={cn(
                'p-3 rounded-lg text-left transition-all',
                isSelected
                  ? 'bg-brand-50 border-2 border-brand-500'
                  : 'bg-surface-50 border-2 border-transparent hover:border-surface-300'
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={cn(
                  'text-sm font-medium',
                  isSelected ? 'text-brand-700' : 'text-surface-900'
                )}>
                  {option.label}
                </span>
                {isBase && (
                  <Badge variant="default" size="sm">Included</Badge>
                )}
              </div>
              <p className="text-xs text-surface-500">{option.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// SHIPPING OPTIONS COMPONENT
// -----------------------------------------------------------------------------

function ShippingOptions({ options }: { options: ShippingEstimate[] }) {
  return (
    <div>
      <h4 className="text-sm font-medium text-surface-700 mb-2">Shipping Options</h4>
      <div className="space-y-2">
        {options.map(option => (
          <div
            key={option.method}
            className="flex items-center justify-between p-3 rounded-lg bg-surface-50"
          >
            <div>
              <p className="text-sm font-medium text-surface-900 capitalize">
                {option.method} ({option.carrier})
              </p>
              <p className="text-xs text-surface-500">
                {option.estimatedDays} business day{option.estimatedDays !== 1 ? 's' : ''}
              </p>
            </div>
            <span className="text-sm font-medium text-surface-900">
              {formatCurrency(option.cost)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// PACKAGE DETAIL COMPONENT
// -----------------------------------------------------------------------------

export function PackageDetail({
  package: pkg,
  onAddToCart,
  className
}: PackageDetailProps) {
  // State for customizations
  const [selectedItemIds, setSelectedItemIds] = React.useState<string[]>(() =>
    pkg.items.filter(item => item.isSelected || item.isRequired).map(item => item.id)
  );
  const [invitationQuantity, setInvitationQuantity] = React.useState(pkg.invitationConfig.quantity);
  const [paperType, setPaperType] = React.useState(pkg.invitationConfig.paperType);

  // Calculate pricing
  const calculator = React.useMemo(
    () => new PackagePricingCalculator(pkg, selectedItemIds, invitationQuantity, paperType),
    [pkg, selectedItemIds, invitationQuantity, paperType]
  );

  const priceBreakdown = calculator.calculate();
  const shippingOptions = calculator.getShippingOptions();
  const itemDetails = calculator.getItemDetails();

  // Handlers
  const handleToggleItem = (itemId: string) => {
    const item = pkg.items.find(i => i.id === itemId);
    if (item?.isRequired) return;

    setSelectedItemIds(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart({
        packageId: pkg.id,
        selectedItemIds,
        invitationQuantity,
        paperType,
        priceBreakdown
      });
    }
  };

  const tierConfig = TIER_CONFIG[pkg.tier];
  const categoryLabel = CATEGORY_LABELS[pkg.category];

  return (
    <div className={cn('', className)}>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-surface-500 mb-6">
        <Link href="/packages" className="hover:text-brand-600">Packages</Link>
        <span>/</span>
        <Link href={`/packages?category=${pkg.category}`} className="hover:text-brand-600">
          {categoryLabel}
        </Link>
        <span>/</span>
        <span className="text-surface-900">{pkg.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Left Column - Images */}
        <div>
          <ImageGallery images={pkg.images} packageName={pkg.name} />
        </div>

        {/* Right Column - Details & Customization */}
        <div className="space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={tierConfig.color as "default" | "primary" | "secondary" | "success" | "warning" | "error" | "outline" | "outline-primary"} size="sm">
                {tierConfig.label}
              </Badge>
              <Badge variant="outline" size="sm">
                {categoryLabel}
              </Badge>
              {pkg.isFeatured && (
                <Badge variant="warning" size="sm">Popular</Badge>
              )}
            </div>
            <h1 className="font-heading text-3xl font-bold text-surface-900 mb-2">
              {pkg.name}
            </h1>
            <p className="text-surface-600">{pkg.description}</p>
          </div>

          {/* Rating */}
          {pkg.reviewCount > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={cn(
                      'w-5 h-5',
                      i < Math.floor(pkg.averageRating)
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
              <span className="text-surface-700 font-medium">{pkg.averageRating.toFixed(1)}</span>
              <span className="text-surface-500">({pkg.reviewCount} reviews)</span>
            </div>
          )}

          {/* Price Display */}
          <Card padding="md" className="bg-surface-50">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-surface-500 mb-1">Package Total</p>
                <p className="text-3xl font-bold text-brand-600">
                  {formatCurrency(priceBreakdown.total)}
                </p>
              </div>
              {priceBreakdown.savings > 0 && (
                <SavingsBadge
                  savings={priceBreakdown.savings}
                  savingsPercentage={priceBreakdown.savingsPercentage}
                />
              )}
            </div>
            <PriceBreakdownTable breakdown={priceBreakdown} />
          </Card>

          {/* Quantity Selector */}
          <QuantitySelector
            value={invitationQuantity}
            onChange={setInvitationQuantity}
            baseQuantity={pkg.invitationConfig.quantity}
          />

          {/* Paper Selector */}
          <PaperSelector
            value={paperType}
            onChange={setPaperType}
            basePaperType={pkg.invitationConfig.paperType}
          />

          {/* Add to Cart Button */}
          <Button
            size="xl"
            fullWidth
            onClick={handleAddToCart}
            leftIcon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
          >
            Add to Cart - {formatCurrency(priceBreakdown.total)}
          </Button>

          {/* Shipping Info */}
          <ShippingOptions options={shippingOptions} />
        </div>
      </div>

      {/* Item Selector Section */}
      <div className="mt-12">
        <Card padding="lg">
          <ItemSelector
            items={itemDetails}
            onToggleItem={handleToggleItem}
          />
        </Card>
      </div>

      {/* What's Included Summary */}
      <div className="mt-8">
        <h2 className="font-heading text-xl font-semibold text-surface-900 mb-4">
          What&apos;s Included
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card padding="md">
            <h3 className="font-heading font-medium text-surface-900 mb-3">
              Invitations
            </h3>
            <ul className="space-y-2 text-sm text-surface-600">
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-success-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {invitationQuantity} printed invitations
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-success-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {PAPER_OPTIONS.find(p => p.value === paperType)?.label} paper
              </li>
              {pkg.invitationConfig.includesEnvelopes && (
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-success-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Matching envelopes included
                </li>
              )}
            </ul>
          </Card>

          <Card padding="md">
            <h3 className="font-heading font-medium text-surface-900 mb-3">
              Package Items ({itemDetails.filter(i => i.isIncluded).length} selected)
            </h3>
            <CompactItemList
              items={itemDetails.filter(i => i.isIncluded).map(d => d.item)}
              maxVisible={5}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
