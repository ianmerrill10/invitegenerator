'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  GiftRegistry,
  RegistryType,
  RegistrySettings,
  PrivacyLevel,
  CreateRegistryRequest
} from '@/types/registry';

// -----------------------------------------------------------------------------
// TYPES
// -----------------------------------------------------------------------------

export interface RegistryBuilderProps {
  eventId: string;
  initialData?: Partial<GiftRegistry>;
  onSave: (registry: CreateRegistryRequest) => void;
  onCancel?: () => void;
  className?: string;
}

interface StepProps {
  data: Partial<CreateRegistryRequest>;
  onChange: (data: Partial<CreateRegistryRequest>) => void;
  errors?: Record<string, string>;
}

// -----------------------------------------------------------------------------
// CONSTANTS
// -----------------------------------------------------------------------------

const REGISTRY_TYPES: { value: RegistryType; label: string; description: string; icon: string }[] = [
  {
    value: RegistryType.TRADITIONAL,
    label: 'Gift Registry',
    description: 'Traditional gift registry with products from various stores',
    icon: '\uD83C\uDF81'
  },
  {
    value: RegistryType.CHARITY,
    label: 'Charity Registry',
    description: 'Request donations to causes you care about',
    icon: '\u2764\uFE0F'
  },
  {
    value: RegistryType.EXPERIENCE_FUND,
    label: 'Experience Fund',
    description: 'Collect funds for honeymoon, travel, or experiences',
    icon: '\u2708\uFE0F'
  },
  {
    value: RegistryType.GROUP_GIFT,
    label: 'Group Gift',
    description: 'Pool funds for one big-ticket item',
    icon: '\uD83D\uDC65'
  },
  {
    value: RegistryType.SERVICE_SIGNUP,
    label: 'Help & Services',
    description: 'Let guests sign up to help with tasks',
    icon: '\uD83D\uDE4F'
  },
  {
    value: RegistryType.HYBRID,
    label: 'Hybrid Registry',
    description: 'Combine multiple registry types in one',
    icon: '\uD83C\uDF1F'
  }
];

const STEPS = [
  { id: 'type', title: 'Registry Type', description: 'Choose what kind of registry you want' },
  { id: 'details', title: 'Basic Details', description: 'Name and describe your registry' },
  { id: 'settings', title: 'Settings', description: 'Customize how your registry works' },
  { id: 'review', title: 'Review', description: 'Review and create your registry' }
];

// -----------------------------------------------------------------------------
// STEP 1: REGISTRY TYPE SELECTION
// -----------------------------------------------------------------------------

function TypeSelectionStep({ data, onChange }: StepProps) {
  return (
    <div>
      <h2 className="font-heading text-xl font-semibold text-surface-900 mb-2">
        What type of registry do you want?
      </h2>
      <p className="text-surface-600 mb-6">
        Choose the type that best fits your needs. You can always add more types later.
      </p>

      <div className="grid gap-3 md:grid-cols-2">
        {REGISTRY_TYPES.map(type => (
          <button
            key={type.value}
            onClick={() => onChange({ type: type.value })}
            className={cn(
              'p-4 rounded-xl text-left transition-all border-2',
              data.type === type.value
                ? 'border-brand-500 bg-brand-50'
                : 'border-surface-200 hover:border-surface-300 bg-white'
            )}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{type.icon}</span>
              <div>
                <h3 className={cn(
                  'font-heading font-semibold mb-1',
                  data.type === type.value ? 'text-brand-700' : 'text-surface-900'
                )}>
                  {type.label}
                </h3>
                <p className="text-sm text-surface-600">
                  {type.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// STEP 2: BASIC DETAILS
// -----------------------------------------------------------------------------

function DetailsStep({ data, onChange, errors }: StepProps) {
  return (
    <div>
      <h2 className="font-heading text-xl font-semibold text-surface-900 mb-2">
        Tell us about your registry
      </h2>
      <p className="text-surface-600 mb-6">
        Give your registry a name and description that guests will see.
      </p>

      <div className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-surface-700 mb-1.5">
            Registry Title *
          </label>
          <input
            type="text"
            value={data.title || ''}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="e.g., Sarah & John's Wedding Registry"
            className={cn(
              'w-full px-4 py-2.5 rounded-xl border text-surface-900',
              'focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500',
              errors?.title ? 'border-error-500' : 'border-surface-300'
            )}
          />
          {errors?.title && (
            <p className="mt-1 text-sm text-error-600">{errors.title}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-surface-700 mb-1.5">
            Description
          </label>
          <textarea
            value={data.description || ''}
            onChange={(e) => onChange({ description: e.target.value })}
            placeholder="Tell your guests about your registry..."
            rows={4}
            className={cn(
              'w-full px-4 py-2.5 rounded-xl border text-surface-900 resize-none',
              'focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500',
              'border-surface-300'
            )}
          />
          <p className="mt-1 text-sm text-surface-500">
            This message will appear at the top of your registry page.
          </p>
        </div>

        {/* Custom URL */}
        <div>
          <label className="block text-sm font-medium text-surface-700 mb-1.5">
            Custom URL (optional)
          </label>
          <div className="flex items-center gap-2">
            <span className="text-surface-500 text-sm">invitegenerator.com/registry/</span>
            <input
              type="text"
              value={data.customUrl || ''}
              onChange={(e) => onChange({ customUrl: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
              placeholder="sarah-and-john"
              className={cn(
                'flex-1 px-4 py-2.5 rounded-xl border text-surface-900',
                'focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500',
                'border-surface-300'
              )}
            />
          </div>
          <p className="mt-1 text-sm text-surface-500">
            Only letters, numbers, and hyphens. Leave blank for auto-generated URL.
          </p>
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// STEP 3: SETTINGS
// -----------------------------------------------------------------------------

function SettingsStep({ data, onChange }: StepProps) {
  const settings = data.settings || {};

  const updateSettings = (updates: Partial<RegistrySettings>) => {
    onChange({ settings: { ...settings, ...updates } });
  };

  return (
    <div>
      <h2 className="font-heading text-xl font-semibold text-surface-900 mb-2">
        Customize your registry
      </h2>
      <p className="text-surface-600 mb-6">
        Choose how your registry works and what guests can see.
      </p>

      <div className="space-y-6">
        {/* Privacy */}
        <div>
          <h3 className="font-medium text-surface-900 mb-3">Privacy</h3>
          <div className="space-y-2">
            {[
              { value: PrivacyLevel.PUBLIC, label: 'Public', description: 'Anyone with the link can view' },
              { value: PrivacyLevel.INVITE_ONLY, label: 'Invite Only', description: 'Only invited guests can view' },
              { value: PrivacyLevel.PASSWORD, label: 'Password Protected', description: 'Require a password to view' }
            ].map(option => (
              <label
                key={option.value}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors',
                  settings.privacyLevel === option.value
                    ? 'bg-brand-50 border-2 border-brand-500'
                    : 'bg-surface-50 border-2 border-transparent hover:bg-surface-100'
                )}
              >
                <input
                  type="radio"
                  name="privacy"
                  value={option.value}
                  checked={settings.privacyLevel === option.value}
                  onChange={() => updateSettings({ privacyLevel: option.value })}
                  className="mt-0.5 w-4 h-4 text-brand-600 focus:ring-brand-500"
                />
                <div>
                  <p className="font-medium text-surface-900">{option.label}</p>
                  <p className="text-sm text-surface-600">{option.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Display Options */}
        <div>
          <h3 className="font-medium text-surface-900 mb-3">Display Options</h3>
          <div className="space-y-3">
            {[
              { key: 'showPrices', label: 'Show prices', description: 'Display item prices to guests' },
              { key: 'showProgress', label: 'Show progress', description: 'Show how much has been purchased/funded' },
              { key: 'showContributorNames', label: 'Show contributor names', description: 'Display who purchased/contributed' },
              { key: 'allowAnonymousGifts', label: 'Allow anonymous gifts', description: 'Let guests give without revealing their name' }
            ].map(option => (
              <label
                key={option.key}
                className="flex items-center justify-between p-3 rounded-lg bg-surface-50 cursor-pointer hover:bg-surface-100 transition-colors"
              >
                <div>
                  <p className="font-medium text-surface-900">{option.label}</p>
                  <p className="text-sm text-surface-600">{option.description}</p>
                </div>
                <input
                  type="checkbox"
                  checked={(settings as Record<string, boolean>)[option.key] ?? true}
                  onChange={(e) => updateSettings({ [option.key]: e.target.checked } as Partial<RegistrySettings>)}
                  className="w-5 h-5 rounded text-brand-600 focus:ring-brand-500"
                />
              </label>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div>
          <h3 className="font-medium text-surface-900 mb-3">Notifications</h3>
          <div className="space-y-3">
            {[
              { key: 'notifyOnPurchase', label: 'Notify on purchase', description: 'Get notified when a gift is purchased' },
              { key: 'notifyOnContribution', label: 'Notify on contribution', description: 'Get notified when someone contributes' }
            ].map(option => (
              <label
                key={option.key}
                className="flex items-center justify-between p-3 rounded-lg bg-surface-50 cursor-pointer hover:bg-surface-100 transition-colors"
              >
                <div>
                  <p className="font-medium text-surface-900">{option.label}</p>
                  <p className="text-sm text-surface-600">{option.description}</p>
                </div>
                <input
                  type="checkbox"
                  checked={(settings as Record<string, boolean>)[option.key] ?? true}
                  onChange={(e) => updateSettings({ [option.key]: e.target.checked } as Partial<RegistrySettings>)}
                  className="w-5 h-5 rounded text-brand-600 focus:ring-brand-500"
                />
              </label>
            ))}
          </div>
        </div>

        {/* Thank You Message */}
        <div>
          <label className="block text-sm font-medium text-surface-700 mb-1.5">
            Thank You Message
          </label>
          <textarea
            value={settings.thankYouMessage || ''}
            onChange={(e) => updateSettings({ thankYouMessage: e.target.value })}
            placeholder="Thank you for your generosity! We're so grateful for your kindness."
            rows={3}
            className={cn(
              'w-full px-4 py-2.5 rounded-xl border text-surface-900 resize-none',
              'focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500',
              'border-surface-300'
            )}
          />
          <p className="mt-1 text-sm text-surface-500">
            This message appears at the bottom of your registry page.
          </p>
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// STEP 4: REVIEW
// -----------------------------------------------------------------------------

function ReviewStep({ data }: StepProps) {
  const typeInfo = REGISTRY_TYPES.find(t => t.value === data.type);
  const settings = data.settings || {};

  return (
    <div>
      <h2 className="font-heading text-xl font-semibold text-surface-900 mb-2">
        Review your registry
      </h2>
      <p className="text-surface-600 mb-6">
        Make sure everything looks good before creating your registry.
      </p>

      <div className="space-y-4">
        <Card padding="md">
          <h3 className="font-medium text-surface-900 mb-3">Registry Type</h3>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{typeInfo?.icon}</span>
            <div>
              <p className="font-medium text-surface-900">{typeInfo?.label}</p>
              <p className="text-sm text-surface-600">{typeInfo?.description}</p>
            </div>
          </div>
        </Card>

        <Card padding="md">
          <h3 className="font-medium text-surface-900 mb-3">Details</h3>
          <dl className="space-y-2">
            <div>
              <dt className="text-sm text-surface-500">Title</dt>
              <dd className="font-medium text-surface-900">{data.title || 'Not set'}</dd>
            </div>
            {data.description && (
              <div>
                <dt className="text-sm text-surface-500">Description</dt>
                <dd className="text-surface-700">{data.description}</dd>
              </div>
            )}
            {data.customUrl && (
              <div>
                <dt className="text-sm text-surface-500">Custom URL</dt>
                <dd className="text-brand-600">invitegenerator.com/registry/{data.customUrl}</dd>
              </div>
            )}
          </dl>
        </Card>

        <Card padding="md">
          <h3 className="font-medium text-surface-900 mb-3">Settings</h3>
          <div className="flex flex-wrap gap-2">
            <Badge variant={settings.privacyLevel === PrivacyLevel.PUBLIC ? 'success' : 'default'}>
              {settings.privacyLevel === PrivacyLevel.PUBLIC ? 'Public' :
               settings.privacyLevel === PrivacyLevel.PASSWORD ? 'Password Protected' : 'Invite Only'}
            </Badge>
            {settings.showPrices && <Badge variant="outline">Prices visible</Badge>}
            {settings.showProgress && <Badge variant="outline">Progress visible</Badge>}
            {settings.allowAnonymousGifts && <Badge variant="outline">Anonymous gifts allowed</Badge>}
          </div>
        </Card>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// REGISTRY BUILDER COMPONENT
// -----------------------------------------------------------------------------

export function RegistryBuilder({
  eventId,
  initialData,
  onSave,
  onCancel,
  className
}: RegistryBuilderProps) {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [data, setData] = React.useState<Partial<CreateRegistryRequest>>({
    eventId,
    type: initialData?.type || RegistryType.HYBRID,
    title: initialData?.title || '',
    description: initialData?.description || '',
    customUrl: initialData?.customUrl || '',
    settings: initialData?.settings || {
      privacyLevel: PrivacyLevel.PUBLIC,
      showPrices: true,
      showProgress: true,
      showContributorNames: false,
      allowAnonymousGifts: true,
      allowPartialContributions: true,
      allowMessages: true,
      notifyOnPurchase: true,
      notifyOnContribution: true,
      thankYouMessage: ''
    }
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleChange = (updates: Partial<CreateRegistryRequest>) => {
    setData(prev => ({ ...prev, ...updates }));
    // Clear relevant errors
    const newErrors = { ...errors };
    Object.keys(updates).forEach(key => delete newErrors[key]);
    setErrors(newErrors);
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 0 && !data.type) {
      newErrors.type = 'Please select a registry type';
    }

    if (step === 1) {
      if (!data.title?.trim()) {
        newErrors.title = 'Please enter a title for your registry';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < STEPS.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!data.type || !data.title) return;

    setIsSubmitting(true);
    try {
      await onSave({
        eventId,
        type: data.type,
        title: data.title,
        description: data.description || '',
        customUrl: data.customUrl,
        settings: data.settings
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    const stepProps = { data, onChange: handleChange, errors };
    switch (currentStep) {
      case 0: return <TypeSelectionStep {...stepProps} />;
      case 1: return <DetailsStep {...stepProps} />;
      case 2: return <SettingsStep {...stepProps} />;
      case 3: return <ReviewStep {...stepProps} />;
      default: return null;
    }
  };

  return (
    <div className={cn('', className)}>
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {STEPS.map((step, index) => (
            <React.Fragment key={step.id}>
              <button
                onClick={() => index < currentStep && setCurrentStep(index)}
                disabled={index > currentStep}
                className={cn(
                  'flex items-center gap-2',
                  index <= currentStep ? 'text-brand-600' : 'text-surface-400',
                  index < currentStep && 'cursor-pointer hover:text-brand-700'
                )}
              >
                <span className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                  index < currentStep
                    ? 'bg-brand-500 text-white'
                    : index === currentStep
                    ? 'bg-brand-100 text-brand-700 ring-2 ring-brand-500'
                    : 'bg-surface-100 text-surface-500'
                )}>
                  {index < currentStep ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </span>
                <span className="hidden sm:block text-sm font-medium">{step.title}</span>
              </button>
              {index < STEPS.length - 1 && (
                <div className={cn(
                  'flex-1 h-0.5 mx-2',
                  index < currentStep ? 'bg-brand-500' : 'bg-surface-200'
                )} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="mb-8">
        {renderStep()}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-6 border-t border-surface-200">
        <div>
          {currentStep > 0 && (
            <Button variant="outline" onClick={handleBack}>
              Back
            </Button>
          )}
        </div>
        <div className="flex items-center gap-3">
          {onCancel && (
            <Button variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button
            onClick={handleNext}
            loading={isSubmitting}
          >
            {currentStep === STEPS.length - 1 ? 'Create Registry' : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  );
}
