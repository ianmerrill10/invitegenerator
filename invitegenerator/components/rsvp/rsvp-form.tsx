'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

interface RSVPFormProps {
  invitationId: string;
  invitationTitle: string;
  eventDate?: string;
  eventLocation?: string;
  rsvpDeadline?: string;
  requirePhone?: boolean;
  requireDietary?: boolean;
  allowPlusOne?: boolean;
  maxPlusOnes?: number;
  customQuestions?: Array<{
    id: string;
    question: string;
    type: 'text' | 'select' | 'checkbox';
    required: boolean;
    options?: string[];
  }>;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  attending: 'yes' | 'no' | 'maybe';
  guestCount: number;
  guestNames: string[];
  dietaryRestrictions: string;
  message: string;
}

export function RSVPForm({
  invitationId,
  invitationTitle,
  eventDate,
  eventLocation,
  rsvpDeadline,
  requirePhone = false,
  requireDietary = false,
  allowPlusOne = false,
  maxPlusOnes = 0,
  customQuestions = [],
  onSuccess,
  onError,
}: RSVPFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    attending: 'yes',
    guestCount: 1,
    guestNames: [],
    dietaryRestrictions: '',
    message: '',
  });
  
  const [customAnswers, setCustomAnswers] = useState<Record<string, string | boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    
    if (requirePhone && !formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    }
    
    if (formData.attending === 'yes' && allowPlusOne) {
      const maxGuests = maxPlusOnes + 1;
      if (formData.guestCount > maxGuests) {
        newErrors.guestCount = `Maximum ${maxGuests} guests`;
      }
    }
    
    customQuestions.forEach((q) => {
      if (q.required && !customAnswers[q.id]) {
        newErrors[`custom_${q.id}`] = 'Required';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSubmitting(true);
    
    try {
      const response = await fetch(`/api/rsvp/${invitationId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, customAnswers }),
      });
      
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to submit');
      }
      
      setSubmitted(true);
      onSuccess?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit';
      onError?.(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleGuestNameChange = (index: number, value: string) => {
    const newNames = [...formData.guestNames];
    newNames[index] = value;
    setFormData((prev) => ({ ...prev, guestNames: newNames }));
  };

  if (submitted) {
    return (
      <Card className="p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Thank You!</h3>
        <p className="text-gray-600">Your RSVP has been submitted.</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Attendance Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Will you attend? <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'yes', label: 'Yes', emoji: '✓', bg: 'green' },
              { value: 'no', label: 'No', emoji: '✗', bg: 'red' },
              { value: 'maybe', label: 'Maybe', emoji: '?', bg: 'yellow' },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleInputChange('attending', opt.value)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  formData.attending === opt.value
                    ? `border-${opt.bg}-500 bg-${opt.bg}-50`
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-xl block">{opt.emoji}</span>
                <span className="text-sm font-medium">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Name & Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Your name"
              error={errors.name}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="you@example.com"
              error={errors.email}
            />
          </div>
        </div>

        {/* Phone */}
        {requirePhone && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone <span className="text-red-500">*</span>
            </label>
            <Input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="(555) 123-4567"
              error={errors.phone}
            />
          </div>
        )}

        {/* Guest Count */}
        {formData.attending === 'yes' && allowPlusOne && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Guests
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleInputChange('guestCount', Math.max(1, formData.guestCount - 1))}
                className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
              >
                −
              </button>
              <span className="text-xl font-semibold w-8 text-center">{formData.guestCount}</span>
              <button
                type="button"
                onClick={() => handleInputChange('guestCount', Math.min(maxPlusOnes + 1, formData.guestCount + 1))}
                className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
              >
                +
              </button>
            </div>
            {errors.guestCount && <p className="text-red-500 text-sm mt-1">{errors.guestCount}</p>}
            
            {formData.guestCount > 1 && (
              <div className="mt-3 space-y-2">
                <p className="text-sm text-gray-600">Guest names (optional):</p>
                {Array.from({ length: formData.guestCount - 1 }).map((_, i) => (
                  <Input
                    key={i}
                    value={formData.guestNames[i] || ''}
                    onChange={(e) => handleGuestNameChange(i, e.target.value)}
                    placeholder={`Guest ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Dietary */}
        {(requireDietary || formData.attending === 'yes') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dietary Restrictions {requireDietary && <span className="text-red-500">*</span>}
            </label>
            <Input
              value={formData.dietaryRestrictions}
              onChange={(e) => handleInputChange('dietaryRestrictions', e.target.value)}
              placeholder="Allergies, preferences, etc."
            />
          </div>
        )}

        {/* Custom Questions */}
        {customQuestions.map((q) => (
          <div key={q.id}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {q.question} {q.required && <span className="text-red-500">*</span>}
            </label>
            {q.type === 'text' && (
              <Input
                value={(customAnswers[q.id] as string) || ''}
                onChange={(e) => setCustomAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
              />
            )}
            {q.type === 'select' && q.options && (
              <select
                value={(customAnswers[q.id] as string) || ''}
                onChange={(e) => setCustomAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
              >
                <option value="">Select...</option>
                {q.options.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            )}
            {q.type === 'checkbox' && (
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={(customAnswers[q.id] as boolean) || false}
                  onChange={(e) => setCustomAnswers((prev) => ({ ...prev, [q.id]: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm">Yes</span>
              </label>
            )}
            {errors[`custom_${q.id}`] && (
              <p className="text-red-500 text-sm mt-1">{errors[`custom_${q.id}`]}</p>
            )}
          </div>
        ))}

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Message (optional)
          </label>
          <textarea
            value={formData.message}
            onChange={(e) => handleInputChange('message', e.target.value)}
            placeholder="Any notes for the host..."
            rows={3}
            maxLength={500}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">{formData.message.length}/500</p>
        </div>

        {/* Submit */}
        <Button type="submit" variant="primary" size="lg" className="w-full" disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit RSVP'}
        </Button>
      </form>
    </Card>
  );
}
