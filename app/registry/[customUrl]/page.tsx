'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { RegistryPublicView } from '@/components/registry';
import {
  GiftRegistry,
  RegistryItem,
  ExperienceFund,
  CharityOption,
  ServiceRequest,
} from '@/types/registry';

// -----------------------------------------------------------------------------
// REGISTRY PUBLIC PAGE
// -----------------------------------------------------------------------------

export default function RegistryPublicPage() {
  const params = useParams();
  const customUrl = params.customUrl as string;

  const [isLoading, setIsLoading] = React.useState(true);
  const [registry, setRegistry] = React.useState<GiftRegistry | null>(null);
  const [items, setItems] = React.useState<RegistryItem[]>([]);
  const [funds, setFunds] = React.useState<ExperienceFund[]>([]);
  const [charities, setCharities] = React.useState<CharityOption[]>([]);
  const [services, setServices] = React.useState<ServiceRequest[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchRegistry = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/registry?customUrl=${encodeURIComponent(customUrl)}`);
        const result = await response.json();

        if (!response.ok || !result.success) {
          setError('Registry not found');
          return;
        }

        const registryData = result.data;
        setRegistry(registryData);
        setItems(registryData.items || []);
        setFunds(registryData.experienceFunds || []);
        setCharities(registryData.charityOptions || []);
        setServices(registryData.serviceRequests || []);
      } catch (err) {
        console.error('Failed to fetch registry:', err);
        setError('Registry not found');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRegistry();
  }, [customUrl]);

  const handlePurchaseItem = (item: RegistryItem) => {
    if (item.affiliateLink) {
      window.open(item.affiliateLink, '_blank');
    } else if (item.externalUrl) {
      window.open(item.externalUrl, '_blank');
    }
  };

  const handleContributeFund = (fund: ExperienceFund) => {
    // TODO: Open contribution modal with Stripe
  };

  const handleDonateCharity = (charity: CharityOption) => {
    window.open(charity.charity.donationUrl, '_blank');
  };

  const handleSignupService = (service: ServiceRequest, slotId?: string) => {
    // TODO: Open service signup modal
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-48 bg-surface-200 rounded-2xl mb-8" />
            <div className="text-center mb-8">
              <div className="h-10 bg-surface-200 rounded w-2/3 mx-auto mb-4" />
              <div className="h-6 bg-surface-200 rounded w-1/2 mx-auto" />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-square bg-surface-200 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !registry) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-surface-100 flex items-center justify-center">
            <svg className="w-10 h-10 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
          </div>
          <h1 className="text-2xl font-heading font-bold text-surface-900 mb-2">
            Registry Not Found
          </h1>
          <p className="text-surface-600 mb-6 max-w-md mx-auto">
            We couldn&apos;t find a registry at this address. Please check the URL and try again.
          </p>
          <a
            href="/"
            className="text-brand-600 hover:text-brand-700 font-medium"
          >
            Return to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <RegistryPublicView
          registry={registry}
          items={items}
          experienceFunds={funds}
          charityOptions={charities}
          serviceRequests={services}
          onPurchaseItem={handlePurchaseItem}
          onContributeFund={handleContributeFund}
          onDonateCharity={handleDonateCharity}
          onSignupService={handleSignupService}
        />
      </div>
    </div>
  );
}
