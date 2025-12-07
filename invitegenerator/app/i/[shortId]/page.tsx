'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Invitation, InvitationElement } from '@/types';

interface PublicInvitationData {
  invitation: Invitation;
  elements: InvitationElement[];
  rsvpEnabled: boolean;
  rsvpDeadline?: string;
  eventDate?: string;
  eventLocation?: string;
}

export default function PublicInvitationPage() {
  const params = useParams();
  const shortId = params.shortId as string;
  
  const [data, setData] = useState<PublicInvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInvitation() {
      try {
        const response = await fetch(`/api/public/invitation/${shortId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Invitation not found');
          } else if (response.status === 410) {
            setError('This invitation is no longer available');
          } else {
            setError('Failed to load invitation');
          }
          return;
        }
        
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError('Failed to load invitation');
      } finally {
        setLoading(false);
      }
    }
    
    if (shortId) {
      fetchInvitation();
    }
  }, [shortId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {error || 'Invitation Not Found'}
          </h1>
          <p className="text-gray-600 mb-6">
            The invitation you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/">
            <Button variant="primary">
              Create Your Own Invitation
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const { invitation, elements, rsvpEnabled, rsvpDeadline, eventDate, eventLocation } = data;
  
  // Check if RSVP deadline has passed
  const isRsvpClosed = rsvpDeadline ? new Date(rsvpDeadline) < new Date() : false;
  
  // Parse canvas dimensions from invitation
  const canvasWidth = invitation.settings?.canvasWidth || 800;
  const canvasHeight = invitation.settings?.canvasHeight || 600;
  const backgroundColor = invitation.settings?.backgroundColor || '#ffffff';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 py-8 px-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <Badge variant="secondary" className="mb-2">
          You're Invited!
        </Badge>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
          {invitation.title}
        </h1>
        {invitation.description && (
          <p className="text-gray-600 mt-2 max-w-xl mx-auto">
            {invitation.description}
          </p>
        )}
      </motion.div>

      {/* Event Details Bar */}
      {(eventDate || eventLocation) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-2xl mx-auto mb-6"
        >
          <div className="bg-white rounded-xl shadow-sm p-4 flex flex-wrap items-center justify-center gap-6">
            {eventDate && (
              <div className="flex items-center gap-2 text-gray-700">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="font-medium">
                  {new Date(eventDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            )}
            {eventLocation && (
              <div className="flex items-center gap-2 text-gray-700">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="font-medium">{eventLocation}</span>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Invitation Canvas */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="flex justify-center mb-8"
      >
        <div 
          className="relative shadow-2xl rounded-lg overflow-hidden"
          style={{
            width: '100%',
            maxWidth: `${canvasWidth}px`,
            aspectRatio: `${canvasWidth} / ${canvasHeight}`,
            backgroundColor
          }}
        >
          {/* Render invitation elements */}
          {elements.map((element) => (
            <InvitationElementRenderer key={element.id} element={element} />
          ))}
        </div>
      </motion.div>

      {/* RSVP Section */}
      {rsvpEnabled && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-md mx-auto text-center"
        >
          {isRsvpClosed ? (
            <div className="bg-gray-100 rounded-xl p-6">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">RSVP Closed</h3>
              <p className="text-gray-600">
                The deadline for RSVPs has passed.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Will you be attending?
              </h3>
              {rsvpDeadline && (
                <p className="text-sm text-gray-500 mb-4">
                  Please respond by {new Date(rsvpDeadline).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              )}
              <Link href={`/i/${shortId}/rsvp`}>
                <Button variant="primary" size="lg" className="w-full">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  RSVP Now
                </Button>
              </Link>
            </div>
          )}
        </motion.div>
      )}

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center mt-12 pt-6 border-t border-gray-200"
      >
        <p className="text-sm text-gray-500">
          Powered by{' '}
          <Link href="/" className="text-primary hover:underline font-medium">
            InviteGenerator
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

// Component to render individual invitation elements
function InvitationElementRenderer({ element }: { element: InvitationElement }) {
  const baseStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${element.x}px`,
    top: `${element.y}px`,
    width: `${element.width}px`,
    height: `${element.height}px`,
    transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
    opacity: element.opacity ?? 1,
    zIndex: element.zIndex || 0,
  };

  switch (element.type) {
    case 'text':
      return (
        <div
          style={{
            ...baseStyle,
            fontFamily: element.properties?.fontFamily || 'inherit',
            fontSize: `${element.properties?.fontSize || 16}px`,
            fontWeight: element.properties?.fontWeight || 'normal',
            fontStyle: element.properties?.fontStyle || 'normal',
            textDecoration: element.properties?.textDecoration || 'none',
            textAlign: element.properties?.textAlign || 'left',
            color: element.properties?.color || '#000000',
            lineHeight: element.properties?.lineHeight || 1.5,
            display: 'flex',
            alignItems: element.properties?.verticalAlign || 'flex-start',
            justifyContent: element.properties?.textAlign === 'center' ? 'center' : 
                           element.properties?.textAlign === 'right' ? 'flex-end' : 'flex-start',
            padding: '4px',
            wordBreak: 'break-word',
            overflow: 'hidden',
          }}
          dangerouslySetInnerHTML={{ 
            __html: sanitizeHTML(element.properties?.text || '') 
          }}
        />
      );

    case 'image':
      return (
        <div style={baseStyle} className="overflow-hidden">
          {element.properties?.src && (
            <img
              src={element.properties.src}
              alt={element.properties.alt || ''}
              style={{
                width: '100%',
                height: '100%',
                objectFit: (element.properties.objectFit as any) || 'cover',
                borderRadius: element.properties.borderRadius ? `${element.properties.borderRadius}px` : undefined,
              }}
            />
          )}
        </div>
      );

    case 'shape':
      const shapeType = element.properties?.shapeType || 'rectangle';
      const fillColor = element.properties?.fill || '#e5e7eb';
      const strokeColor = element.properties?.stroke || 'transparent';
      const strokeWidth = element.properties?.strokeWidth || 0;
      const borderRadius = element.properties?.borderRadius || 0;

      if (shapeType === 'circle' || shapeType === 'ellipse') {
        return (
          <div
            style={{
              ...baseStyle,
              borderRadius: '50%',
              backgroundColor: fillColor,
              border: strokeWidth ? `${strokeWidth}px solid ${strokeColor}` : undefined,
            }}
          />
        );
      }

      return (
        <div
          style={{
            ...baseStyle,
            backgroundColor: fillColor,
            border: strokeWidth ? `${strokeWidth}px solid ${strokeColor}` : undefined,
            borderRadius: `${borderRadius}px`,
          }}
        />
      );

    case 'icon':
      return (
        <div
          style={{
            ...baseStyle,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: element.properties?.color || '#000000',
            fontSize: `${Math.min(element.width, element.height) * 0.8}px`,
          }}
        >
          {element.properties?.icon && (
            <span dangerouslySetInnerHTML={{ __html: sanitizeHTML(element.properties.icon) }} />
          )}
        </div>
      );

    case 'divider':
      return (
        <div
          style={{
            ...baseStyle,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: '100%',
              height: `${element.properties?.thickness || 2}px`,
              backgroundColor: element.properties?.color || '#e5e7eb',
              borderRadius: element.properties?.style === 'rounded' ? '999px' : undefined,
            }}
          />
        </div>
      );

    default:
      return null;
  }
}

// Sanitize HTML to prevent XSS attacks
function sanitizeHTML(html: string): string {
  // Basic HTML sanitization - remove script tags and event handlers
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '');
}
