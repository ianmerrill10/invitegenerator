'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface RSVP {
  id: string;
  name: string;
  email: string;
  phone?: string;
  attending: 'yes' | 'no' | 'maybe';
  guestCount: number;
  guestNames?: string[];
  dietaryRestrictions?: string;
  message?: string;
  customAnswers?: Record<string, string | boolean>;
  createdAt: string;
  updatedAt: string;
}

interface CustomQuestion {
  id: string;
  question: string;
  type: 'text' | 'select' | 'checkbox';
}

interface GuestListProps {
  rsvps: RSVP[];
  customQuestions: CustomQuestion[];
  onDelete: (rsvpId: string) => void;
}

export function GuestList({ rsvps, customQuestions, onDelete }: GuestListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getAttendingBadge = (attending: string) => {
    switch (attending) {
      case 'yes':
        return <Badge variant="success">Attending</Badge>;
      case 'no':
        return <Badge variant="error">Not Attending</Badge>;
      case 'maybe':
        return <Badge variant="warning">Maybe</Badge>;
      default:
        return <Badge variant="secondary">{attending}</Badge>;
    }
  };

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  // Decode HTML entities for display
  const decodeHTML = (text: string) => {
    if (!text) return '';
    return text
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'")
      .replace(/&#x2F;/g, '/');
  };

  if (viewMode === 'table') {
    return (
      <div>
        {/* View Mode Toggle */}
        <div className="flex justify-end mb-4">
          <div className="flex rounded-lg overflow-hidden border border-gray-200">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 text-sm bg-white text-gray-600 hover:bg-gray-50`}
              aria-label="Switch to card view"
              title="Card view"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 text-sm bg-gray-900 text-white`}
              aria-label="Switch to table view"
              title="Table view"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Table View */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Guest</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Guests</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Dietary</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Submitted</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {rsvps.map((rsvp) => (
                  <tr key={rsvp.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{decodeHTML(rsvp.name)}</p>
                        <p className="text-sm text-gray-500">{rsvp.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">{getAttendingBadge(rsvp.attending)}</td>
                    <td className="px-4 py-4 text-gray-900">{rsvp.attending === 'yes' ? rsvp.guestCount : '-'}</td>
                    <td className="px-4 py-4 text-sm text-gray-600 max-w-xs truncate">
                      {rsvp.dietaryRestrictions ? decodeHTML(rsvp.dietaryRestrictions) : '-'}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">{formatDate(rsvp.createdAt)}</td>
                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() => onDelete(rsvp.id)}
                        className="text-red-600 hover:text-red-700 text-sm"
                        aria-label={`Delete RSVP from ${decodeHTML(rsvp.name)}`}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      {/* View Mode Toggle */}
      <div className="flex justify-end mb-4">
        <div className="flex rounded-lg overflow-hidden border border-gray-200">
          <button
            type="button"
            onClick={() => setViewMode('cards')}
            className={`px-3 py-1.5 text-sm bg-gray-900 text-white`}
            aria-label="Switch to card view"
            title="Card view"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 text-sm bg-white text-gray-600 hover:bg-gray-50`}
            aria-label="Switch to table view"
            title="Table view"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Cards View */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {rsvps.map((rsvp, index) => (
            <motion.div
              key={rsvp.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className={`overflow-hidden transition-all ${
                  expandedId === rsvp.id ? 'ring-2 ring-primary' : ''
                }`}
              >
                {/* Main Row */}
                <div
                  className="p-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleExpanded(rsvp.id)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleExpanded(rsvp.id); } }}
                  role="button"
                  tabIndex={0}
                  aria-expanded={expandedId === rsvp.id}
                  aria-label={`${decodeHTML(rsvp.name)} - ${rsvp.attending === 'yes' ? 'Attending' : rsvp.attending === 'no' ? 'Not attending' : 'Maybe'}. Click to ${expandedId === rsvp.id ? 'collapse' : 'expand'} details.`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg ${
                          rsvp.attending === 'yes'
                            ? 'bg-green-100 text-green-700'
                            : rsvp.attending === 'no'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {decodeHTML(rsvp.name).charAt(0).toUpperCase()}
                      </div>

                      {/* Info */}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">{decodeHTML(rsvp.name)}</h3>
                          {getAttendingBadge(rsvp.attending)}
                        </div>
                        <p className="text-sm text-gray-500">{rsvp.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      {/* Guest Count */}
                      {rsvp.attending === 'yes' && rsvp.guestCount > 0 && (
                        <div className="text-center">
                          <p className="text-2xl font-bold text-gray-900">{rsvp.guestCount}</p>
                          <p className="text-xs text-gray-500">
                            {rsvp.guestCount === 1 ? 'guest' : 'guests'}
                          </p>
                        </div>
                      )}

                      {/* Expand Icon */}
                      <svg
                        className={`w-5 h-5 text-gray-400 transition-transform ${
                          expandedId === rsvp.id ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {expandedId === rsvp.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pt-0 border-t border-gray-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          {/* Contact Info */}
                          <div>
                            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Contact</h4>
                            <div className="space-y-1">
                              <p className="text-sm flex items-center gap-2">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                {rsvp.email}
                              </p>
                              {rsvp.phone && (
                                <p className="text-sm flex items-center gap-2">
                                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                  </svg>
                                  {rsvp.phone}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Submitted */}
                          <div>
                            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Submitted</h4>
                            <p className="text-sm text-gray-700">{formatDate(rsvp.createdAt)}</p>
                            {rsvp.updatedAt !== rsvp.createdAt && (
                              <p className="text-xs text-gray-500 mt-1">
                                Updated: {formatDate(rsvp.updatedAt)}
                              </p>
                            )}
                          </div>

                          {/* Guest Names */}
                          {rsvp.guestNames && rsvp.guestNames.length > 0 && (
                            <div>
                              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Additional Guests</h4>
                              <ul className="space-y-1">
                                {rsvp.guestNames.map((name, i) => (
                                  <li key={i} className="text-sm text-gray-700">• {decodeHTML(name)}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Dietary Restrictions */}
                          {rsvp.dietaryRestrictions && (
                            <div>
                              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Dietary Restrictions</h4>
                              <p className="text-sm text-gray-700">{decodeHTML(rsvp.dietaryRestrictions)}</p>
                            </div>
                          )}

                          {/* Message */}
                          {rsvp.message && (
                            <div className="md:col-span-2">
                              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Message</h4>
                              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg italic">
                                "{decodeHTML(rsvp.message)}"
                              </p>
                            </div>
                          )}

                          {/* Custom Answers */}
                          {rsvp.customAnswers && Object.keys(rsvp.customAnswers).length > 0 && (
                            <div className="md:col-span-2">
                              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Custom Questions</h4>
                              <div className="space-y-2">
                                {customQuestions.map((question) => {
                                  const answer = rsvp.customAnswers?.[question.id];
                                  if (!answer && answer !== false) return null;
                                  
                                  return (
                                    <div key={question.id} className="text-sm">
                                      <span className="text-gray-600">{question.question}:</span>{' '}
                                      <span className="text-gray-900 font-medium">
                                        {typeof answer === 'boolean' ? (answer ? 'Yes' : 'No') : decodeHTML(String(answer))}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.location.href = `mailto:${rsvp.email}`;
                            }}
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Email
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(rsvp.id);
                            }}
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
