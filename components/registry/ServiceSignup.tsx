'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  ServiceRequest,
  ServiceSlot,
  ServiceSignup as ServiceSignupType,
  ServiceSignupStatus
} from '@/types/registry';

// -----------------------------------------------------------------------------
// TYPES
// -----------------------------------------------------------------------------

export interface ServiceSignupCardProps {
  service: ServiceRequest;
  onSignup?: (service: ServiceRequest, slotId?: string) => void;
  isHost?: boolean;
  className?: string;
}

export interface ServiceSlotSelectorProps {
  slots: ServiceSlot[];
  selectedSlotId?: string;
  onSelectSlot: (slotId: string) => void;
  className?: string;
}

export interface SignupFormProps {
  service: ServiceRequest;
  selectedSlot?: ServiceSlot;
  onSubmit: (data: SignupFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export interface SignupFormData {
  volunteerName: string;
  volunteerEmail: string;
  volunteerPhone?: string;
  notes?: string;
}

// -----------------------------------------------------------------------------
// SERVICE SIGNUP CARD
// -----------------------------------------------------------------------------

export function ServiceSignupCard({
  service,
  onSignup,
  isHost = false,
  className
}: ServiceSignupCardProps) {
  const [showSlots, setShowSlots] = React.useState(false);
  const [selectedSlotId, setSelectedSlotId] = React.useState<string | undefined>();

  const availableSlots = service.availableSlots.filter(slot => !slot.isFilled);
  const filledPercentage = (service.slotsFilled / service.totalSlotsNeeded) * 100;
  const isFullyBooked = service.slotsFilled >= service.totalSlotsNeeded;

  const handleSignupClick = () => {
    if (availableSlots.length > 0) {
      setShowSlots(true);
    } else {
      onSignup?.(service);
    }
  };

  const handleSlotSelect = (slotId: string) => {
    setSelectedSlotId(slotId);
  };

  const handleConfirmSignup = () => {
    onSignup?.(service, selectedSlotId);
    setShowSlots(false);
    setSelectedSlotId(undefined);
  };

  return (
    <Card padding="md" className={cn('', className)}>
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
          <span className="text-2xl">{service.icon || '\uD83D\uDE4F'}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-heading font-semibold text-surface-900 mb-1">
            {service.title}
          </h3>
          <p className="text-sm text-surface-600 line-clamp-2">
            {service.description}
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-surface-600">
            {service.slotsFilled} of {service.totalSlotsNeeded} spots filled
          </span>
          {isFullyBooked && (
            <Badge variant="success" size="sm">Fully Booked</Badge>
          )}
        </div>
        <div className="h-2 bg-surface-200 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all',
              isFullyBooked ? 'bg-success-500' : 'bg-brand-500'
            )}
            style={{ width: `${filledPercentage}%` }}
          />
        </div>
      </div>

      {/* Slots Selection */}
      {showSlots && availableSlots.length > 0 && (
        <div className="mb-4 p-4 rounded-xl bg-surface-50 border border-surface-200">
          <h4 className="text-sm font-medium text-surface-700 mb-3">
            Select a time slot:
          </h4>
          <div className="space-y-2">
            {availableSlots.map(slot => (
              <label
                key={slot.id}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors',
                  selectedSlotId === slot.id
                    ? 'bg-brand-50 border-2 border-brand-500'
                    : 'bg-white border-2 border-transparent hover:bg-surface-100'
                )}
              >
                <input
                  type="radio"
                  name="slot"
                  value={slot.id}
                  checked={selectedSlotId === slot.id}
                  onChange={() => handleSlotSelect(slot.id)}
                  className="w-4 h-4 text-brand-600 focus:ring-brand-500"
                />
                <div>
                  <p className="font-medium text-surface-900">
                    {new Date(slot.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                  {slot.timeSlot && (
                    <p className="text-sm text-surface-500">{slot.timeSlot}</p>
                  )}
                </div>
              </label>
            ))}
          </div>

          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowSlots(false);
                setSelectedSlotId(undefined);
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!selectedSlotId}
              onClick={handleConfirmSignup}
            >
              Confirm Selection
            </Button>
          </div>
        </div>
      )}

      {/* External Link */}
      {service.externalLink && (
        <a
          href={service.externalLink}
          target="_blank"
          rel="noopener noreferrer"
          className="block mb-4 p-3 rounded-lg bg-surface-50 border border-surface-200 hover:bg-surface-100 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-surface-700">
              Sign up on external site
            </span>
            <svg className="w-4 h-4 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </div>
        </a>
      )}

      {/* Action */}
      {!isFullyBooked && !showSlots && !isHost && (
        <Button
          fullWidth
          onClick={handleSignupClick}
          leftIcon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        >
          Sign Up to Help
        </Button>
      )}

      {isHost && (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" fullWidth>
            View Signups
          </Button>
          <Button variant="ghost" size="sm">
            Edit
          </Button>
        </div>
      )}
    </Card>
  );
}

// -----------------------------------------------------------------------------
// SERVICE TYPE ICONS
// -----------------------------------------------------------------------------

const SERVICE_TYPE_ICONS: Record<string, string> = {
  meal_train: '\uD83C\uDF7D\uFE0F',
  babysitting: '\uD83D\uDC76',
  pet_care: '\uD83D\uDC15',
  house_cleaning: '\uD83E\uDDF9',
  yard_work: '\uD83C\uDF3F',
  transportation: '\uD83D\uDE97',
  grocery_shopping: '\uD83D\uDED2',
  moving_help: '\uD83D\uDCE6',
  tech_support: '\uD83D\uDCBB',
  other: '\uD83D\uDE4F'
};

// -----------------------------------------------------------------------------
// SERVICE REQUEST LIST
// -----------------------------------------------------------------------------

export function ServiceRequestList({
  services,
  onSignup,
  isHost = false,
  className
}: {
  services: ServiceRequest[];
  onSignup?: (service: ServiceRequest, slotId?: string) => void;
  isHost?: boolean;
  className?: string;
}) {
  if (services.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-surface-600">No service requests yet.</p>
      </div>
    );
  }

  return (
    <div className={cn('grid gap-4 md:grid-cols-2', className)}>
      {services.map(service => (
        <ServiceSignupCard
          key={service.id}
          service={service}
          onSignup={onSignup}
          isHost={isHost}
        />
      ))}
    </div>
  );
}

// -----------------------------------------------------------------------------
// SIGNUP CONFIRMATION
// -----------------------------------------------------------------------------

export function SignupConfirmation({
  service,
  slot,
  signup,
  onClose
}: {
  service: ServiceRequest;
  slot?: ServiceSlot;
  signup: ServiceSignupType;
  onClose: () => void;
}) {
  return (
    <div className="text-center py-8">
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-success-100 flex items-center justify-center">
        <svg className="w-10 h-10 text-success-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h2 className="font-heading text-2xl font-bold text-surface-900 mb-2">
        Thank You!
      </h2>

      <p className="text-surface-600 mb-6 max-w-md mx-auto">
        You&apos;ve signed up to help with <strong>{service.title}</strong>
        {slot && (
          <> on {new Date(slot.date).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
          })}</>
        )}.
      </p>

      <div className="bg-surface-50 rounded-xl p-4 max-w-sm mx-auto mb-6">
        <h3 className="font-medium text-surface-900 mb-2">Confirmation Details</h3>
        <dl className="text-sm text-left space-y-1">
          <div className="flex justify-between">
            <dt className="text-surface-500">Name:</dt>
            <dd className="text-surface-900">{signup.volunteerName}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-surface-500">Email:</dt>
            <dd className="text-surface-900">{signup.volunteerEmail}</dd>
          </div>
          {slot && (
            <div className="flex justify-between">
              <dt className="text-surface-500">Date:</dt>
              <dd className="text-surface-900">
                {new Date(slot.date).toLocaleDateString()}
              </dd>
            </div>
          )}
        </dl>
      </div>

      <p className="text-sm text-surface-500 mb-6">
        A confirmation email has been sent to {signup.volunteerEmail}
      </p>

      <Button onClick={onClose}>
        Done
      </Button>
    </div>
  );
}
