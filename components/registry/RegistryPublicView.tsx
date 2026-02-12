'use client';

import * as React from 'react';
import Image from 'next/image';
import { cn, formatCurrency } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RegistryItemGrid } from './RegistryItem';
import { FundProgressCard } from './FundProgress';
import { ServiceRequestList } from './ServiceSignup';
import {
  GiftRegistry,
  RegistryItem,
  ExperienceFund,
  CharityOption,
  ServiceRequest,
  GroupGiftCampaign,
  RegistryType,
  ItemType
} from '@/types/registry';

// -----------------------------------------------------------------------------
// TYPES
// -----------------------------------------------------------------------------

export interface RegistryPublicViewProps {
  registry: GiftRegistry;
  items: RegistryItem[];
  experienceFunds?: ExperienceFund[];
  charityOptions?: CharityOption[];
  serviceRequests?: ServiceRequest[];
  groupGiftCampaigns?: GroupGiftCampaign[];
  onPurchaseItem?: (item: RegistryItem) => void;
  onContributeFund?: (fund: ExperienceFund) => void;
  onDonateCharity?: (charity: CharityOption) => void;
  onSignupService?: (service: ServiceRequest, slotId?: string) => void;
  className?: string;
}

// -----------------------------------------------------------------------------
// REGISTRY STATS BANNER
// -----------------------------------------------------------------------------

function RegistryStatsBanner({
  totalItems,
  itemsFulfilled,
  percentComplete
}: {
  totalItems: number;
  itemsFulfilled: number;
  percentComplete: number;
}) {
  return (
    <div className="bg-surface-50 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-surface-600">
          {itemsFulfilled} of {totalItems} gifts purchased
        </span>
        <Badge variant={percentComplete >= 100 ? 'success' : 'default'} size="sm">
          {percentComplete.toFixed(0)}% complete
        </Badge>
      </div>
      <div className="h-2 bg-surface-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-brand-500 rounded-full transition-all"
          style={{ width: `${Math.min(percentComplete, 100)}%` }}
        />
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// SECTION HEADER
// -----------------------------------------------------------------------------

function SectionHeader({
  title,
  description,
  count
}: {
  title: string;
  description?: string;
  count?: number;
}) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-1">
        <h2 className="font-heading text-xl font-semibold text-surface-900">
          {title}
        </h2>
        {count !== undefined && (
          <Badge variant="default" size="sm">{count}</Badge>
        )}
      </div>
      {description && (
        <p className="text-surface-600">{description}</p>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// CHARITY CARD
// -----------------------------------------------------------------------------

function CharityCard({
  charityOption,
  onDonate
}: {
  charityOption: CharityOption;
  onDonate?: () => void;
}) {
  const { charity } = charityOption;
  const hasGoal = charityOption.goalAmount && charityOption.currentAmount !== undefined;
  const percentage = hasGoal
    ? (charityOption.currentAmount! / charityOption.goalAmount!) * 100
    : 0;

  return (
    <Card padding="md" variant="interactive">
      <div className="flex items-start gap-4 mb-4">
        {charity.logoUrl ? (
          <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-surface-100">
            <Image
              src={charity.logoUrl}
              alt={charity.name}
              fill
              className="object-contain"
            />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-lg bg-error-50 flex items-center justify-center flex-shrink-0">
            <svg className="w-8 h-8 text-error-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-heading font-semibold text-surface-900 mb-1">
            {charity.name}
          </h3>
          <p className="text-sm text-surface-600 line-clamp-2">
            {charityOption.personalMessage || charity.mission}
          </p>
        </div>
      </div>

      {hasGoal && (
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-surface-600">
              {formatCurrency(charityOption.currentAmount!)} raised
            </span>
            <span className="text-surface-500">
              Goal: {formatCurrency(charityOption.goalAmount!)}
            </span>
          </div>
          <div className="h-2 bg-surface-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-error-500 rounded-full"
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Button fullWidth onClick={onDonate}>
          Donate
        </Button>
        <Button
          variant="outline"
          size="icon"
          asChild
        >
          <a href={charity.websiteUrl} target="_blank" rel="noopener noreferrer">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </Button>
      </div>
    </Card>
  );
}

// -----------------------------------------------------------------------------
// GROUP GIFT CARD
// -----------------------------------------------------------------------------

function GroupGiftCard({
  campaign,
  onContribute
}: {
  campaign: GroupGiftCampaign;
  onContribute?: () => void;
}) {
  const percentage = (campaign.currentAmount / campaign.goalAmount) * 100;
  const remaining = campaign.goalAmount - campaign.currentAmount;
  const daysLeft = campaign.deadline
    ? Math.max(0, Math.ceil((new Date(campaign.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : undefined;

  return (
    <Card padding="none" variant="interactive" className="overflow-hidden">
      {/* Image */}
      <div className="relative aspect-video bg-surface-100">
        {campaign.targetItem.imageUrl ? (
          <Image
            src={campaign.targetItem.imageUrl}
            alt={campaign.targetItem.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-16 h-16 text-surface-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
          </div>
        )}
        <div className="absolute top-3 left-3">
          <Badge variant="primary" size="sm">Group Gift</Badge>
        </div>
        {campaign.isComplete && (
          <div className="absolute inset-0 bg-success-500/90 flex items-center justify-center">
            <div className="text-center text-white">
              <svg className="w-12 h-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="font-heading font-semibold">Goal Reached!</p>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-heading font-semibold text-surface-900 mb-1">
          {campaign.targetItem.name}
        </h3>
        <p className="text-sm text-surface-600 mb-4 line-clamp-2">
          {campaign.targetItem.description}
        </p>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium text-surface-900">
              {formatCurrency(campaign.currentAmount)}
            </span>
            <span className="text-surface-500">
              of {formatCurrency(campaign.goalAmount)}
            </span>
          </div>
          <div className="h-2 bg-surface-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-500 rounded-full transition-all"
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-surface-500 mb-4">
          <span>{campaign.contributors.length} contributors</span>
          {daysLeft !== undefined && (
            <span>{daysLeft} days left</span>
          )}
        </div>

        {/* Action */}
        {!campaign.isComplete && (
          <Button fullWidth onClick={onContribute}>
            Contribute {formatCurrency(remaining)} needed
          </Button>
        )}
      </div>
    </Card>
  );
}

// -----------------------------------------------------------------------------
// REGISTRY PUBLIC VIEW COMPONENT
// -----------------------------------------------------------------------------

export function RegistryPublicView({
  registry,
  items,
  experienceFunds = [],
  charityOptions = [],
  serviceRequests = [],
  groupGiftCampaigns = [],
  onPurchaseItem,
  onContributeFund,
  onDonateCharity,
  onSignupService,
  className
}: RegistryPublicViewProps) {
  const [activeTab, setActiveTab] = React.useState<'all' | 'gifts' | 'funds' | 'charity' | 'services'>('all');

  // Calculate stats
  const totalItems = items.length;
  const itemsFulfilled = items.filter(i => i.isPurchased || i.quantityFulfilled >= i.quantity).length;
  const percentComplete = totalItems > 0 ? (itemsFulfilled / totalItems) * 100 : 0;

  // Filter items by type
  const giftItems = items.filter(i => i.type === ItemType.PRODUCT);
  const hasContent = items.length > 0 || experienceFunds.length > 0 || charityOptions.length > 0 || serviceRequests.length > 0;

  // Tab configuration
  const tabs = [
    { id: 'all', label: 'All', count: items.length + experienceFunds.length + charityOptions.length },
    { id: 'gifts', label: 'Gifts', count: giftItems.length, show: giftItems.length > 0 },
    { id: 'funds', label: 'Funds', count: experienceFunds.length, show: experienceFunds.length > 0 },
    { id: 'charity', label: 'Charity', count: charityOptions.length, show: charityOptions.length > 0 },
    { id: 'services', label: 'Help', count: serviceRequests.length, show: serviceRequests.length > 0 }
  ].filter(tab => tab.show !== false);

  return (
    <div className={cn('', className)}>
      {/* Header */}
      <div className="text-center mb-8">
        {registry.coverImageUrl && (
          <div className="relative h-48 md:h-64 rounded-2xl overflow-hidden mb-6 bg-surface-100">
            <Image
              src={registry.coverImageUrl}
              alt={registry.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        <h1 className="font-heading text-3xl md:text-4xl font-bold text-surface-900 mb-2">
          {registry.title}
        </h1>
        <p className="text-lg text-surface-600 max-w-2xl mx-auto mb-4">
          {registry.description}
        </p>

        {registry.personalMessage && (
          <blockquote className="text-surface-700 italic max-w-xl mx-auto px-4 py-3 bg-surface-50 rounded-xl">
            &ldquo;{registry.personalMessage}&rdquo;
          </blockquote>
        )}
      </div>

      {/* Stats Banner */}
      {items.length > 0 && registry.settings.showProgress && (
        <RegistryStatsBanner
          totalItems={totalItems}
          itemsFulfilled={itemsFulfilled}
          percentComplete={percentComplete}
        />
      )}

      {/* Tabs */}
      {tabs.length > 1 && (
        <div className="flex flex-wrap gap-2 my-6 justify-center">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'all' | 'gifts' | 'funds' | 'charity' | 'services')}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                activeTab === tab.id
                  ? 'bg-brand-500 text-white'
                  : 'bg-surface-100 text-surface-700 hover:bg-surface-200'
              )}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className="ml-1.5 opacity-70">({tab.count})</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {!hasContent ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-surface-100 flex items-center justify-center">
            <svg className="w-10 h-10 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
          </div>
          <p className="text-lg text-surface-600">
            This registry doesn&apos;t have any items yet.
          </p>
        </div>
      ) : (
        <div className="space-y-12 mt-8">
          {/* Gift Items */}
          {(activeTab === 'all' || activeTab === 'gifts') && giftItems.length > 0 && (
            <section>
              <SectionHeader
                title="Gift Registry"
                description="Physical gifts the couple would love to receive"
                count={giftItems.length}
              />
              <RegistryItemGrid
                items={giftItems}
                onPurchase={onPurchaseItem}
                showPrice={registry.settings.showPrices}
              />
            </section>
          )}

          {/* Experience Funds */}
          {(activeTab === 'all' || activeTab === 'funds') && experienceFunds.length > 0 && (
            <section>
              <SectionHeader
                title="Experience Funds"
                description="Contribute to experiences and adventures"
                count={experienceFunds.length}
              />
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {experienceFunds.map(fund => (
                  <FundProgressCard
                    key={fund.id}
                    title={fund.name}
                    description={fund.description}
                    imageUrl={fund.imageUrl}
                    currentAmount={fund.currentAmount}
                    goalAmount={fund.goalAmount}
                    contributorCount={fund.contributions.length}
                    onContribute={() => onContributeFund?.(fund)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Group Gifts */}
          {(activeTab === 'all' || activeTab === 'funds') && groupGiftCampaigns.length > 0 && (
            <section>
              <SectionHeader
                title="Group Gifts"
                description="Pool together for a bigger gift"
                count={groupGiftCampaigns.length}
              />
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {groupGiftCampaigns.map(campaign => (
                  <GroupGiftCard
                    key={campaign.id}
                    campaign={campaign}
                    onContribute={() => {}}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Charity Options */}
          {(activeTab === 'all' || activeTab === 'charity') && charityOptions.length > 0 && (
            <section>
              <SectionHeader
                title="In Lieu of Gifts"
                description="Support causes close to their hearts"
                count={charityOptions.length}
              />
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {charityOptions.map(charity => (
                  <CharityCard
                    key={charity.id}
                    charityOption={charity}
                    onDonate={() => onDonateCharity?.(charity)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Service Requests */}
          {(activeTab === 'all' || activeTab === 'services') && serviceRequests.length > 0 && (
            <section>
              <SectionHeader
                title="Ways to Help"
                description="Offer your time and talents"
                count={serviceRequests.length}
              />
              <ServiceRequestList
                services={serviceRequests}
                onSignup={onSignupService}
              />
            </section>
          )}
        </div>
      )}

      {/* Thank You Message */}
      {registry.settings.thankYouMessage && (
        <div className="mt-12 text-center p-6 rounded-2xl bg-brand-50 border border-brand-100">
          <p className="text-brand-800">
            {registry.settings.thankYouMessage}
          </p>
        </div>
      )}
    </div>
  );
}
