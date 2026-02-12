'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  PackageGrid,
  PackageGridSkeleton,
  CategoryTabs,
  PackageFiltersSidebar,
  PackageFiltersToolbar,
  ActiveFiltersChips
} from '@/components/packages';
import {
  InvitationPackage,
  PackageCategory,
  PackageTier,
  PackageFilters
} from '@/types/packages';

// -----------------------------------------------------------------------------
// MOCK DATA (Replace with API call)
// -----------------------------------------------------------------------------

const MOCK_PACKAGES: InvitationPackage[] = [
  {
    id: 'w1-elegant-engagement',
    name: 'Elegant Engagement Announcement',
    slug: 'elegant-engagement-announcement',
    category: PackageCategory.WEDDING,
    tier: PackageTier.CLASSIC,
    description: 'A beautiful package to announce your engagement to friends and family. Includes printed announcements and celebration essentials.',
    shortDescription: 'Announce your engagement in style with this complete celebration kit.',
    basePrice: 79,
    curationFee: 12,
    items: [],
    invitationConfig: {
      quantity: 25,
      costPerUnit: 0.80,
      paperType: 'standard' as never,
      includesEnvelopes: true,
      customizationOptions: []
    },
    images: [],
    popularity: 95,
    reviewCount: 47,
    averageRating: 4.8,
    tags: ['engagement', 'announcement', 'celebration'],
    isActive: true,
    isFeatured: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'w3-wedding-classic',
    name: 'Wedding Invitation Classic',
    slug: 'wedding-invitation-classic',
    category: PackageCategory.WEDDING,
    tier: PackageTier.DELUXE,
    description: 'The complete wedding invitation suite with RSVP cards, wax seal kit, and elegant stationery accessories.',
    shortDescription: 'Complete wedding suite with invitations, RSVPs, and elegant accessories.',
    basePrice: 149,
    curationFee: 20,
    items: [],
    invitationConfig: {
      quantity: 75,
      costPerUnit: 0.65,
      paperType: 'premium' as never,
      includesEnvelopes: true,
      customizationOptions: []
    },
    images: [],
    popularity: 98,
    reviewCount: 156,
    averageRating: 4.9,
    tags: ['wedding', 'invitations', 'classic', 'elegant'],
    isActive: true,
    isFeatured: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'b1-kids-birthday',
    name: 'Kids Birthday Bash (Ages 1-5)',
    slug: 'kids-birthday-bash',
    category: PackageCategory.BIRTHDAY,
    tier: PackageTier.CLASSIC,
    description: 'Everything you need for an amazing kids birthday party. Invitations plus fun party supplies and decorations.',
    shortDescription: 'Complete party kit for little ones with invitations and fun supplies.',
    basePrice: 69,
    curationFee: 10,
    items: [],
    invitationConfig: {
      quantity: 25,
      costPerUnit: 0.60,
      paperType: 'cardstock' as never,
      includesEnvelopes: true,
      customizationOptions: []
    },
    images: [],
    popularity: 92,
    reviewCount: 89,
    averageRating: 4.7,
    tags: ['birthday', 'kids', 'party', 'fun'],
    isActive: true,
    isFeatured: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'b2-milestone-birthday',
    name: 'Milestone Birthday Celebration',
    slug: 'milestone-birthday-celebration',
    category: PackageCategory.BIRTHDAY,
    tier: PackageTier.DELUXE,
    description: 'Celebrate the big milestones - 30, 40, 50, 60 and beyond! Premium invitations with photo displays and keepsakes.',
    shortDescription: 'Premium celebration kit for milestone birthdays with photo displays.',
    basePrice: 119,
    curationFee: 18,
    items: [],
    invitationConfig: {
      quantity: 50,
      costPerUnit: 0.70,
      paperType: 'premium' as never,
      includesEnvelopes: true,
      customizationOptions: []
    },
    images: [],
    popularity: 88,
    reviewCount: 64,
    averageRating: 4.8,
    tags: ['birthday', 'milestone', '30th', '40th', '50th', '60th'],
    isActive: true,
    isFeatured: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'ba1-baby-shower',
    name: 'Baby Shower Classic',
    slug: 'baby-shower-classic',
    category: PackageCategory.BABY,
    tier: PackageTier.CLASSIC,
    description: 'Host the perfect baby shower with this comprehensive kit including invitations, games, and celebration supplies.',
    shortDescription: 'Complete baby shower kit with games, decorations, and invitations.',
    basePrice: 89,
    curationFee: 14,
    items: [],
    invitationConfig: {
      quantity: 35,
      costPerUnit: 0.65,
      paperType: 'standard' as never,
      includesEnvelopes: true,
      customizationOptions: []
    },
    images: [],
    popularity: 94,
    reviewCount: 112,
    averageRating: 4.9,
    tags: ['baby', 'shower', 'games', 'celebration'],
    isActive: true,
    isFeatured: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'g1-high-school-grad',
    name: 'High School Graduation',
    slug: 'high-school-graduation',
    category: PackageCategory.GRADUATION,
    tier: PackageTier.CLASSIC,
    description: 'Celebrate academic achievement with graduation announcements and party essentials.',
    shortDescription: 'Graduation announcements with celebration supplies and keepsakes.',
    basePrice: 79,
    curationFee: 12,
    items: [],
    invitationConfig: {
      quantity: 50,
      costPerUnit: 0.55,
      paperType: 'cardstock' as never,
      includesEnvelopes: true,
      customizationOptions: []
    },
    images: [],
    popularity: 85,
    reviewCount: 43,
    averageRating: 4.6,
    tags: ['graduation', 'high school', 'achievement'],
    isActive: true,
    isFeatured: false,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// -----------------------------------------------------------------------------
// PACKAGES PAGE COMPONENT
// -----------------------------------------------------------------------------

function PackagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse filters from URL
  const [filters, setFilters] = React.useState<PackageFilters>(() => {
    const categories = searchParams.get('category')?.split(',').filter(Boolean) as PackageCategory[] | undefined;
    const tiers = searchParams.get('tier')?.split(',').filter(Boolean) as PackageTier[] | undefined;

    return {
      categories: categories?.length ? categories : undefined,
      tiers: tiers?.length ? tiers : undefined,
      minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
      maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
      minRating: searchParams.get('minRating') ? Number(searchParams.get('minRating')) : undefined,
      sortBy: (searchParams.get('sort') as PackageFilters['sortBy']) || 'popularity',
      page: 1,
      pageSize: 12
    };
  });

  const [isLoading] = React.useState(false);
  const [showMobileFilters, setShowMobileFilters] = React.useState(false);

  // Filter and sort packages
  const filteredPackages = React.useMemo(() => {
    let result = [...MOCK_PACKAGES];

    if (filters.categories?.length) {
      result = result.filter(pkg => filters.categories!.includes(pkg.category));
    }

    if (filters.tiers?.length) {
      result = result.filter(pkg => filters.tiers!.includes(pkg.tier));
    }

    if (filters.minPrice !== undefined) {
      result = result.filter(pkg => pkg.basePrice >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      result = result.filter(pkg => pkg.basePrice <= filters.maxPrice!);
    }

    if (filters.minRating !== undefined) {
      result = result.filter(pkg => pkg.averageRating >= filters.minRating!);
    }

    switch (filters.sortBy) {
      case 'price_asc':
        result.sort((a, b) => a.basePrice - b.basePrice);
        break;
      case 'price_desc':
        result.sort((a, b) => b.basePrice - a.basePrice);
        break;
      case 'rating':
        result.sort((a, b) => b.averageRating - a.averageRating);
        break;
      case 'newest':
        result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
      case 'popularity':
      default:
        result.sort((a, b) => b.popularity - a.popularity);
    }

    return result;
  }, [filters]);

  // Update URL when filters change
  const handleFiltersChange = (newFilters: PackageFilters) => {
    setFilters(newFilters);

    const params = new URLSearchParams();
    if (newFilters.categories?.length) params.set('category', newFilters.categories.join(','));
    if (newFilters.tiers?.length) params.set('tier', newFilters.tiers.join(','));
    if (newFilters.minPrice !== undefined) params.set('minPrice', String(newFilters.minPrice));
    if (newFilters.maxPrice !== undefined) params.set('maxPrice', String(newFilters.maxPrice));
    if (newFilters.minRating !== undefined) params.set('minRating', String(newFilters.minRating));
    if (newFilters.sortBy && newFilters.sortBy !== 'popularity') params.set('sort', newFilters.sortBy);

    const queryString = params.toString();
    router.push(queryString ? `/packages?${queryString}` : '/packages', { scroll: false });
  };

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Hero Section */}
      <div className="bg-white border-b border-surface-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="font-heading text-4xl font-bold text-surface-900 mb-4">
            Invitation Packages
          </h1>
          <p className="text-lg text-surface-600 max-w-2xl">
            Complete bundles with printed invitations and curated party supplies.
            Everything you need for your special event, delivered to your door.
          </p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="bg-white border-b border-surface-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <CategoryTabs
            selected={filters.categories || []}
            onSelect={(categories) => handleFiltersChange({
              ...filters,
              categories: categories.length ? categories : undefined
            })}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Filters (Desktop) */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <Card padding="md" className="sticky top-24">
              <PackageFiltersSidebar
                filters={filters}
                onFiltersChange={handleFiltersChange}
              />
            </Card>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="mb-6 space-y-4">
              <PackageFiltersToolbar
                filters={filters}
                onFiltersChange={handleFiltersChange}
                totalCount={filteredPackages.length}
              />

              <ActiveFiltersChips
                filters={filters}
                onFiltersChange={handleFiltersChange}
              />

              {/* Mobile Filter Button */}
              <div className="lg:hidden">
                <Button
                  variant="outline"
                  onClick={() => setShowMobileFilters(true)}
                  leftIcon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                  }
                >
                  Filters
                </Button>
              </div>
            </div>

            {/* Package Grid */}
            {isLoading ? (
              <PackageGridSkeleton count={6} />
            ) : (
              <PackageGrid
                packages={filteredPackages}
                columns={3}
                emptyMessage="No packages match your current filters. Try adjusting your selection."
              />
            )}

            {/* Load More */}
            {filteredPackages.length > 0 && filteredPackages.length >= 12 && (
              <div className="mt-8 text-center">
                <Button variant="outline" size="lg">
                  Load More Packages
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileFilters(false)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-xl overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-surface-200 px-4 py-4 flex items-center justify-between">
              <h2 className="font-heading font-semibold text-surface-900">Filters</h2>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setShowMobileFilters(false)}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>
            <div className="p-4">
              <PackageFiltersSidebar
                filters={filters}
                onFiltersChange={(newFilters) => {
                  handleFiltersChange(newFilters);
                  setShowMobileFilters(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-surface-50">
      <div className="bg-white border-b border-surface-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="h-10 w-64 bg-surface-200 rounded animate-pulse mb-4" />
          <div className="h-6 w-96 bg-surface-200 rounded animate-pulse" />
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PackageGridSkeleton count={6} />
      </div>
    </div>
  );
}

export default function PackagesPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PackagesContent />
    </Suspense>
  );
}
