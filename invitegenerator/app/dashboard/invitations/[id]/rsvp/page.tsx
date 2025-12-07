'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GuestList } from '@/components/rsvp/guest-list';

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

interface RSVPStats {
  total: number;
  attending: number;
  notAttending: number;
  maybe: number;
  totalGuests: number;
}

interface InvitationDetails {
  id: string;
  title: string;
  shortId: string;
  status: string;
  eventDate?: string;
  eventLocation?: string;
  rsvpSettings?: {
    enabled: boolean;
    deadline?: string;
    maxGuests?: number;
    customQuestions?: any[];
  };
}

export default function RSVPManagementPage() {
  const params = useParams();
  const router = useRouter();
  const invitationId = params.id as string;
  
  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [stats, setStats] = useState<RSVPStats>({
    total: 0,
    attending: 0,
    notAttending: 0,
    maybe: 0,
    totalGuests: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [attendingFilter, setAttendingFilter] = useState<string>('all');
  
  // Export state
  const [exporting, setExporting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch invitation details
      const invResponse = await fetch(`/api/invitations/${invitationId}`);
      if (!invResponse.ok) {
        if (invResponse.status === 404) {
          setError('Invitation not found');
          return;
        }
        throw new Error('Failed to fetch invitation');
      }
      const invData = await invResponse.json();
      setInvitation(invData);
      
      // Fetch RSVPs
      const rsvpResponse = await fetch(`/api/rsvp/${invitationId}`);
      if (!rsvpResponse.ok) {
        throw new Error('Failed to fetch RSVPs');
      }
      const rsvpData = await rsvpResponse.json();
      setRsvps(rsvpData.rsvps || []);
      setStats(rsvpData.stats || {
        total: 0,
        attending: 0,
        notAttending: 0,
        maybe: 0,
        totalGuests: 0,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [invitationId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter RSVPs
  const filteredRsvps = rsvps.filter((rsvp) => {
    // Attendance filter
    if (attendingFilter !== 'all' && rsvp.attending !== attendingFilter) {
      return false;
    }
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        rsvp.name.toLowerCase().includes(query) ||
        rsvp.email.toLowerCase().includes(query) ||
        (rsvp.phone && rsvp.phone.includes(query))
      );
    }
    
    return true;
  });

  const handleExport = async (format: 'csv' | 'xlsx') => {
    try {
      setExporting(true);
      
      const queryParams = new URLSearchParams({ format });
      if (attendingFilter !== 'all') {
        queryParams.set('attending', attendingFilter);
      }
      
      const response = await fetch(`/api/rsvp/${invitationId}/export?${queryParams}`);
      
      if (!response.ok) {
        throw new Error('Failed to export RSVPs');
      }
      
      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch ? filenameMatch[1] : `rsvp-export.${format}`;
      
      // Download file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Export error:', err);
      alert('Failed to export RSVPs');
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteRSVP = async (rsvpId: string) => {
    if (!confirm('Are you sure you want to delete this RSVP?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/rsvp/${invitationId}/${rsvpId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete RSVP');
      }
      
      // Refresh data
      await fetchData();
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete RSVP');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading RSVPs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md text-center p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{error}</h2>
          <Link href="/dashboard/invitations">
            <Button variant="outline">Back to Invitations</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const isRsvpEnabled = invitation?.rsvpSettings?.enabled;

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Link href="/dashboard/invitations" className="hover:text-primary">
            Invitations
          </Link>
          <span>/</span>
          <Link href={`/dashboard/invitations/${invitationId}`} className="hover:text-primary">
            {invitation?.title}
          </Link>
          <span>/</span>
          <span className="text-gray-900">RSVPs</span>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">RSVP Management</h1>
            <p className="text-gray-600 mt-1">{invitation?.title}</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Share Link */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const url = `${window.location.origin}/i/${invitation?.shortId}/rsvp`;
                navigator.clipboard.writeText(url);
                alert('RSVP link copied to clipboard!');
              }}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share RSVP Link
            </Button>
            
            {/* Export Dropdown */}
            <div className="relative group">
              <Button variant="outline" size="sm" disabled={exporting}>
                {exporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </>
                )}
              </Button>
              <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <button
                  onClick={() => handleExport('csv')}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                >
                  Export as CSV
                </button>
                <button
                  onClick={() => handleExport('xlsx')}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                >
                  Export as Excel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RSVP Not Enabled Warning */}
      {!isRsvpEnabled && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-3"
        >
          <svg className="w-5 h-5 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="flex-1">
            <p className="font-medium text-amber-800">RSVP is not enabled</p>
            <p className="text-sm text-amber-700">Enable RSVP in the invitation settings to allow guests to respond.</p>
          </div>
          <Link href={`/dashboard/invitations/${invitationId}/edit`}>
            <Button variant="outline" size="sm">Enable RSVP</Button>
          </Link>
        </motion.div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-4">
            <p className="text-sm text-gray-500 mb-1">Total Responses</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="p-4 bg-green-50 border-green-200">
            <p className="text-sm text-green-700 mb-1">Attending</p>
            <p className="text-3xl font-bold text-green-700">{stats.attending}</p>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-4 bg-red-50 border-red-200">
            <p className="text-sm text-red-700 mb-1">Not Attending</p>
            <p className="text-3xl font-bold text-red-700">{stats.notAttending}</p>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card className="p-4 bg-yellow-50 border-yellow-200">
            <p className="text-sm text-yellow-700 mb-1">Maybe</p>
            <p className="text-3xl font-bold text-yellow-700">{stats.maybe}</p>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-4 bg-primary/10 border-primary/20">
            <p className="text-sm text-primary mb-1">Total Guests</p>
            <p className="text-3xl font-bold text-primary">{stats.totalGuests}</p>
            {invitation?.rsvpSettings?.maxGuests && (
              <p className="text-xs text-gray-500 mt-1">
                of {invitation.rsvpSettings.maxGuests} max
              </p>
            )}
          </Card>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="mb-6"
      >
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="flex gap-2">
              {['all', 'yes', 'no', 'maybe'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setAttendingFilter(filter)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    attendingFilter === filter
                      ? filter === 'yes'
                        ? 'bg-green-100 text-green-700'
                        : filter === 'no'
                        ? 'bg-red-100 text-red-700'
                        : filter === 'maybe'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {filter === 'all'
                    ? 'All'
                    : filter === 'yes'
                    ? 'Attending'
                    : filter === 'no'
                    ? 'Not Attending'
                    : 'Maybe'}
                </button>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* RSVP List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        {filteredRsvps.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchQuery || attendingFilter !== 'all'
                ? 'No RSVPs match your filters'
                : 'No RSVPs yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || attendingFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Share your invitation link to start receiving RSVPs'}
            </p>
            {!searchQuery && attendingFilter === 'all' && (
              <Button
                variant="outline"
                onClick={() => {
                  const url = `${window.location.origin}/i/${invitation?.shortId}/rsvp`;
                  navigator.clipboard.writeText(url);
                  alert('RSVP link copied to clipboard!');
                }}
              >
                Copy RSVP Link
              </Button>
            )}
          </Card>
        ) : (
          <GuestList
            rsvps={filteredRsvps}
            customQuestions={invitation?.rsvpSettings?.customQuestions || []}
            onDelete={handleDeleteRSVP}
          />
        )}
      </motion.div>

      {/* Deadline Info */}
      {invitation?.rsvpSettings?.deadline && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center text-sm text-gray-500"
        >
          RSVP deadline:{' '}
          <span className={
            new Date(invitation.rsvpSettings.deadline) < new Date()
              ? 'text-red-600 font-medium'
              : 'font-medium'
          }>
            {new Date(invitation.rsvpSettings.deadline).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
          {new Date(invitation.rsvpSettings.deadline) < new Date() && (
            <Badge variant="error" className="ml-2">Passed</Badge>
          )}
        </motion.div>
      )}
    </div>
  );
}
