'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface RSVPFormData {
  name: string;
  email: string;
  phone?: string;
  attending: 'yes' | 'no' | 'maybe';
  guestCount: number;
  guestNames?: string[];
  dietaryRestrictions?: string;
  message?: string;
}

interface InvitationDetails {
  id: string;
  shortId: string;
  title: string;
  eventDate?: string;
  eventLocation?: string;
  rsvpDeadline?: string;
  maxGuests?: number;
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
}

export default function RSVPPage() {
  const params = useParams();
  const router = useRouter();
  const shortId = params.shortId as string;
  
  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<RSVPFormData>({
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
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    async function fetchInvitationDetails() {
      try {
        const response = await fetch(`/api/public/invitation/${shortId}/rsvp-details`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Invitation not found');
          } else if (response.status === 410) {
            setError('RSVP is no longer available');
          } else {
            setError('Failed to load RSVP form');
          }
          return;
        }
        
        const result = await response.json();
        setInvitation(result);
      } catch (err) {
        setError('Failed to load RSVP form');
      } finally {
        setLoading(false);
      }
    }
    
    if (shortId) {
      fetchInvitationDetails();
    }
  }, [shortId]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    // Required fields
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (invitation?.requirePhone && !formData.phone?.trim()) {
      errors.phone = 'Phone number is required';
    }
    
    if (formData.attending === 'yes' && invitation?.allowPlusOne) {
      const maxGuests = invitation.maxPlusOnes ? invitation.maxPlusOnes + 1 : 10;
      if (formData.guestCount > maxGuests) {
        errors.guestCount = `Maximum ${maxGuests} guests allowed`;
      }
      if (formData.guestCount < 1) {
        errors.guestCount = 'At least 1 guest required';
      }
    }
    
    // Validate custom questions
    if (invitation?.customQuestions) {
      invitation.customQuestions.forEach((q) => {
        if (q.required && !customAnswers[q.id]) {
          errors[`custom_${q.id}`] = `${q.question} is required`;
        }
      });
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/rsvp/${invitation?.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          customAnswers,
        }),
      });
      
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to submit RSVP');
      }
      
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit RSVP');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof RSVPFormData, value: RSVPFormData[keyof RSVPFormData]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleGuestNameChange = (index: number, value: string) => {
    const newNames = [...(formData.guestNames || [])];
    newNames[index] = value;
    setFormData((prev) => ({ ...prev, guestNames: newNames }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading RSVP form...</p>
        </div>
      </div>
    );
  }

  if (error && !invitation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">{error}</h1>
          <p className="text-gray-600 mb-6">
            The RSVP form you're looking for is not available.
          </p>
          <Link href="/">
            <Button variant="primary">Go to Homepage</Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="max-w-md w-full text-center p-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Thank You!
            </h1>
            <p className="text-gray-600 mb-2">
              Your RSVP has been submitted successfully.
            </p>
            {formData.attending === 'yes' && (
              <p className="text-gray-600 mb-6">
                We're excited to see you{formData.guestCount > 1 ? ` and your ${formData.guestCount - 1} guest${formData.guestCount > 2 ? 's' : ''}` : ''}!
              </p>
            )}
            {formData.attending === 'no' && (
              <p className="text-gray-600 mb-6">
                We're sorry you can't make it. Thank you for letting us know.
              </p>
            )}
            {formData.attending === 'maybe' && (
              <p className="text-gray-600 mb-6">
                We hope you can make it! We'll keep your spot open.
              </p>
            )}
            <Link href={`/i/${shortId}`}>
              <Button variant="outline">View Invitation</Button>
            </Link>
          </Card>
        </motion.div>
      </div>
    );
  }

  const isDeadlinePassed = invitation?.rsvpDeadline 
    ? new Date(invitation.rsvpDeadline) < new Date() 
    : false;

  if (isDeadlinePassed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">RSVP Deadline Passed</h1>
          <p className="text-gray-600 mb-6">
            Unfortunately, the deadline for RSVPs has passed.
          </p>
          <Link href={`/i/${shortId}`}>
            <Button variant="outline">View Invitation</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <Link href={`/i/${shortId}`} className="inline-flex items-center text-gray-600 hover:text-primary mb-4">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Invitation
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{invitation?.title}</h1>
          <Badge variant="primary" className="mt-2">RSVP</Badge>
        </motion.div>

        {/* Event Info */}
        {(invitation?.eventDate || invitation?.eventLocation) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm p-4 mb-6"
          >
            <div className="flex flex-col gap-3">
              {invitation.eventDate && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">When</p>
                    <p className="font-medium text-gray-900">
                      {new Date(invitation.eventDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              )}
              {invitation.eventLocation && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Where</p>
                    <p className="font-medium text-gray-900">{invitation.eventLocation}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* RSVP Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              {/* Attending Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Will you be attending? <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'yes', label: 'Yes', icon: '✓', color: 'green' },
                    { value: 'no', label: 'No', icon: '✗', color: 'red' },
                    { value: 'maybe', label: 'Maybe', icon: '?', color: 'yellow' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleInputChange('attending', option.value)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        formData.attending === option.value
                          ? option.color === 'green'
                            ? 'border-green-500 bg-green-50'
                            : option.color === 'red'
                            ? 'border-red-500 bg-red-50'
                            : 'border-yellow-500 bg-yellow-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-2xl block mb-1">{option.icon}</span>
                      <span className="text-sm font-medium text-gray-700">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="John Doe"
                    error={formErrors.name}
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="john@example.com"
                    error={formErrors.email}
                  />
                </div>
              </div>

              {invitation?.requirePhone && (
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="(555) 123-4567"
                    error={formErrors.phone}
                  />
                </div>
              )}

              {/* Guest Count - Only show if attending and plus ones allowed */}
              {formData.attending === 'yes' && invitation?.allowPlusOne && (
                <div>
                  <label htmlFor="guestCount" className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Guests (including yourself)
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleInputChange('guestCount', Math.max(1, formData.guestCount - 1))}
                      className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                    >
                      -
                    </button>
                    <span className="text-xl font-semibold w-10 text-center">{formData.guestCount}</span>
                    <button
                      type="button"
                      onClick={() => handleInputChange('guestCount', Math.min(invitation.maxPlusOnes ? invitation.maxPlusOnes + 1 : 10, formData.guestCount + 1))}
                      className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                    >
                      +
                    </button>
                  </div>
                  {formErrors.guestCount && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.guestCount}</p>
                  )}
                  
                  {/* Guest Names */}
                  {formData.guestCount > 1 && (
                    <div className="mt-4 space-y-3">
                      <p className="text-sm text-gray-600">Guest names (optional):</p>
                      {Array.from({ length: formData.guestCount - 1 }).map((_, index) => (
                        <Input
                          key={index}
                          type="text"
                          value={formData.guestNames?.[index] || ''}
                          onChange={(e) => handleGuestNameChange(index, e.target.value)}
                          placeholder={`Guest ${index + 1} name`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Dietary Restrictions */}
              {(invitation?.requireDietary || formData.attending === 'yes') && (
                <div>
                  <label htmlFor="dietary" className="block text-sm font-medium text-gray-700 mb-1">
                    Dietary Restrictions {invitation?.requireDietary && <span className="text-red-500">*</span>}
                  </label>
                  <Input
                    id="dietary"
                    type="text"
                    value={formData.dietaryRestrictions}
                    onChange={(e) => handleInputChange('dietaryRestrictions', e.target.value)}
                    placeholder="Vegetarian, gluten-free, allergies, etc."
                  />
                </div>
              )}

              {/* Custom Questions */}
              {invitation?.customQuestions?.map((question) => (
                <div key={question.id}>
                  <label htmlFor={`custom-${question.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                    {question.question} {question.required && <span className="text-red-500">*</span>}
                  </label>
                  {question.type === 'text' && (
                    <Input
                      id={`custom-${question.id}`}
                      type="text"
                      value={(customAnswers[question.id] as string) || ''}
                      onChange={(e) => setCustomAnswers((prev) => ({ ...prev, [question.id]: e.target.value }))}
                      error={formErrors[`custom_${question.id}`]}
                    />
                  )}
                  {question.type === 'select' && question.options && (
                    <select
                      id={`custom-${question.id}`}
                      aria-label={question.question}
                      value={(customAnswers[question.id] as string) || ''}
                      onChange={(e) => setCustomAnswers((prev) => ({ ...prev, [question.id]: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    >
                      <option value="">Select an option</option>
                      {question.options.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  )}
                  {question.type === 'checkbox' && (
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={(customAnswers[question.id] as boolean) || false}
                        onChange={(e) => setCustomAnswers((prev) => ({ ...prev, [question.id]: e.target.checked }))}
                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-gray-600">Yes</span>
                    </label>
                  )}
                  {formErrors[`custom_${question.id}`] && (
                    <p className="text-red-500 text-sm mt-1">{formErrors[`custom_${question.id}`]}</p>
                  )}
                </div>
              ))}

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message to the Host (optional)
                </label>
                <textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  placeholder="Any special requests or notes..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary resize-none"
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1">{formData.message?.length || 0}/500 characters</p>
              </div>

              {/* RSVP Deadline Notice */}
              {invitation?.rsvpDeadline && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm flex items-center gap-2">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>
                    Please RSVP by {new Date(invitation.rsvpDeadline).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Submit RSVP
                  </>
                )}
              </Button>
            </form>
          </Card>
        </motion.div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Powered by{' '}
            <Link href="/" className="text-primary hover:underline font-medium">
              InviteGenerator
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
