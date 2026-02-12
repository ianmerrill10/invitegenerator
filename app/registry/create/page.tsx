'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { RegistryBuilder } from '@/components/registry';
import { CreateRegistryRequest } from '@/types/registry';

function CreateRegistryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get('eventId') || 'new-event';

  const handleSave = async (registry: CreateRegistryRequest) => {
    const response = await fetch('/api/registry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registry),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error?.message || 'Failed to create registry');
    }

    const registryId = result.data.id;
    router.push(`/dashboard`);
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-surface-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-surface-900 mb-2">
            Create Your Registry
          </h1>
          <p className="text-surface-600">
            Set up a gift registry, experience fund, or request help from your guests.
          </p>
        </div>

        {/* Builder */}
        <Card padding="lg">
          <RegistryBuilder
            eventId={eventId}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </Card>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-surface-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="h-9 w-64 bg-surface-200 rounded animate-pulse mb-2" />
          <div className="h-5 w-96 bg-surface-200 rounded animate-pulse" />
        </div>
        <Card padding="lg">
          <div className="h-96 bg-surface-100 rounded animate-pulse" />
        </Card>
      </div>
    </div>
  );
}

export default function CreateRegistryPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CreateRegistryContent />
    </Suspense>
  );
}
