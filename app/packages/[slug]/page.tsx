'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PackageDetail, PackageCustomization } from '@/components/packages';
import {
  InvitationPackage,
  PackageCategory,
  PackageTier,
  PaperType,
  ItemCategory
} from '@/types/packages';

// -----------------------------------------------------------------------------
// MOCK DATA (Replace with API call)
// -----------------------------------------------------------------------------

const MOCK_PACKAGE: InvitationPackage = {
  id: 'w3-wedding-classic',
  name: 'Wedding Invitation Classic',
  slug: 'wedding-invitation-classic',
  category: PackageCategory.WEDDING,
  tier: PackageTier.DELUXE,
  description: 'The complete wedding invitation suite includes 75 elegantly printed invitations with matching RSVP cards, a professional wax seal kit, luxurious ribbons, envelope liners, and premium calligraphy pens. Perfect for couples who want a cohesive, sophisticated look for their wedding stationery. Each item has been carefully curated to complement your invitations and create a memorable first impression for your guests.',
  shortDescription: 'Complete wedding suite with invitations, RSVPs, and elegant accessories.',
  basePrice: 149,
  curationFee: 20,
  items: [
    {
      id: 'item-1',
      packageId: 'w3-wedding-classic',
      name: '75 Printed Wedding Invitations',
      description: 'High-quality printed invitations on your choice of premium paper stock.',
      amazonAsin: '',
      affiliateLink: '',
      basePrice: 48.75,
      imageUrl: '',
      thumbnailUrl: '',
      isRequired: true,
      isSelected: true,
      category: ItemCategory.INVITATION,
      weight: 3,
      sortOrder: 1,
      amazonCategory: 'office_products',
      estimatedCommission: 4
    },
    {
      id: 'item-2',
      packageId: 'w3-wedding-classic',
      name: '75 RSVP Cards with Envelopes',
      description: 'Matching RSVP cards with pre-addressed envelopes for easy guest responses.',
      amazonAsin: 'B08XYZ123',
      affiliateLink: 'https://amazon.com/...',
      basePrice: 24.99,
      imageUrl: '',
      thumbnailUrl: '',
      isRequired: false,
      isSelected: true,
      category: ItemCategory.STATIONERY,
      weight: 2,
      sortOrder: 2,
      amazonCategory: 'office_products',
      estimatedCommission: 4
    },
    {
      id: 'item-3',
      packageId: 'w3-wedding-classic',
      name: 'Wax Seal Kit',
      description: 'Custom wax seal stamp with sealing wax sticks in your wedding colors.',
      amazonAsin: 'B09ABC456',
      affiliateLink: 'https://amazon.com/...',
      basePrice: 18.99,
      imageUrl: '',
      thumbnailUrl: '',
      isRequired: false,
      isSelected: true,
      category: ItemCategory.STATIONERY,
      weight: 2,
      sortOrder: 3,
      amazonCategory: 'arts_crafts',
      estimatedCommission: 5
    },
    {
      id: 'item-4',
      packageId: 'w3-wedding-classic',
      name: 'Silk Ribbons (3 rolls)',
      description: 'Luxurious silk ribbons in coordinating colors for invitation wrapping.',
      amazonAsin: 'B07DEF789',
      affiliateLink: 'https://amazon.com/...',
      basePrice: 14.99,
      imageUrl: '',
      thumbnailUrl: '',
      isRequired: false,
      isSelected: true,
      category: ItemCategory.DECORATION,
      weight: 1,
      sortOrder: 4,
      amazonCategory: 'arts_crafts',
      estimatedCommission: 5
    },
    {
      id: 'item-5',
      packageId: 'w3-wedding-classic',
      name: 'Vellum Envelope Liners (75 pack)',
      description: 'Elegant translucent vellum liners to add sophistication to your envelopes.',
      amazonAsin: 'B08GHI012',
      affiliateLink: 'https://amazon.com/...',
      basePrice: 12.99,
      imageUrl: '',
      thumbnailUrl: '',
      isRequired: false,
      isSelected: true,
      category: ItemCategory.STATIONERY,
      weight: 1,
      sortOrder: 5,
      amazonCategory: 'office_products',
      estimatedCommission: 4
    },
    {
      id: 'item-6',
      packageId: 'w3-wedding-classic',
      name: 'Calligraphy Pen Set',
      description: 'Professional calligraphy pens for addressing envelopes with elegant script.',
      amazonAsin: 'B06JKL345',
      affiliateLink: 'https://amazon.com/...',
      basePrice: 16.99,
      imageUrl: '',
      thumbnailUrl: '',
      isRequired: false,
      isSelected: true,
      category: ItemCategory.STATIONERY,
      weight: 1,
      sortOrder: 6,
      amazonCategory: 'office_products',
      estimatedCommission: 4
    },
    {
      id: 'item-7',
      packageId: 'w3-wedding-classic',
      name: 'Sealing Wax Sticks (12 pack)',
      description: 'Extra sealing wax sticks in coordinating colors for your wax seal.',
      amazonAsin: 'B09MNO678',
      affiliateLink: 'https://amazon.com/...',
      basePrice: 8.99,
      imageUrl: '',
      thumbnailUrl: '',
      isRequired: false,
      isSelected: true,
      category: ItemCategory.STATIONERY,
      weight: 1,
      sortOrder: 7,
      amazonCategory: 'arts_crafts',
      estimatedCommission: 5
    }
  ],
  invitationConfig: {
    quantity: 75,
    costPerUnit: 0.65,
    paperType: PaperType.PREMIUM,
    includesEnvelopes: true,
    customizationOptions: [
      {
        id: 'opt-1',
        name: 'Event Name',
        type: 'text',
        isRequired: true,
        additionalCost: 0
      },
      {
        id: 'opt-2',
        name: 'Event Date',
        type: 'text',
        isRequired: true,
        additionalCost: 0
      },
      {
        id: 'opt-3',
        name: 'Venue',
        type: 'text',
        isRequired: true,
        additionalCost: 0
      }
    ]
  },
  images: [
    {
      id: 'img-1',
      url: '/images/packages/wedding-classic-1.jpg',
      alt: 'Wedding Invitation Classic Package',
      isPrimary: true,
      sortOrder: 1
    },
    {
      id: 'img-2',
      url: '/images/packages/wedding-classic-2.jpg',
      alt: 'Wedding invitation detail with wax seal',
      isPrimary: false,
      sortOrder: 2
    },
    {
      id: 'img-3',
      url: '/images/packages/wedding-classic-3.jpg',
      alt: 'Complete stationery suite flat lay',
      isPrimary: false,
      sortOrder: 3
    }
  ],
  popularity: 98,
  reviewCount: 156,
  averageRating: 4.9,
  tags: ['wedding', 'invitations', 'classic', 'elegant', 'wax seal'],
  isActive: true,
  isFeatured: true,
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-12-01')
};

// -----------------------------------------------------------------------------
// PACKAGE DETAIL PAGE
// -----------------------------------------------------------------------------

export default function PackageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [packageData, setPackageData] = React.useState<InvitationPackage | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchPackage = async () => {
      setIsLoading(true);
      try {
        // Try fetching from the API first
        const response = await fetch(`/api/packages?slug=${encodeURIComponent(slug)}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data?.packages?.length > 0) {
            setPackageData(data.data.packages[0]);
            setIsLoading(false);
            return;
          }
        }

        // Fall back to mock data
        if (slug === 'wedding-invitation-classic' || slug === MOCK_PACKAGE.slug) {
          setPackageData(MOCK_PACKAGE);
        } else {
          setPackageData({
            ...MOCK_PACKAGE,
            slug,
            name: slug.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')
          });
        }
      } catch {
        // Use mock data on error
        setPackageData(MOCK_PACKAGE);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPackage();
  }, [slug]);

  const handleAddToCart = (customization: PackageCustomization) => {
    // TODO: Integrate with Stripe checkout
    alert(`Package added to cart!\nTotal: $${customization.priceBreakdown.total.toFixed(2)}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-4 bg-surface-200 rounded w-48 mb-6" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              <div className="aspect-square bg-surface-200 rounded-2xl" />
              <div className="space-y-4">
                <div className="h-6 bg-surface-200 rounded w-32" />
                <div className="h-10 bg-surface-200 rounded w-3/4" />
                <div className="h-4 bg-surface-200 rounded w-full" />
                <div className="h-4 bg-surface-200 rounded w-2/3" />
                <div className="h-32 bg-surface-200 rounded-xl mt-6" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !packageData) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-heading font-bold text-surface-900 mb-2">
            Package Not Found
          </h1>
          <p className="text-surface-600 mb-4">
            {error || "We couldn't find the package you're looking for."}
          </p>
          <button
            onClick={() => router.push('/packages')}
            className="text-brand-600 hover:text-brand-700 font-medium"
          >
            Browse all packages
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PackageDetail
          package={packageData}
          onAddToCart={handleAddToCart}
        />
      </div>
    </div>
  );
}
