// ============================================
// QUESTIONNAIRE & RECOMMENDATION TYPES
// ============================================

import type { EventType } from "./index";

/**
 * Wedding style options for the event questionnaire.
 */
export type WeddingStyle =
  | "traditional"
  | "modern"
  | "rustic"
  | "bohemian"
  | "luxury"
  | "destination";

/**
 * Product categories for affiliate recommendations.
 */
export type ProductCategory =
  | "venue"
  | "catering"
  | "photography"
  | "videography"
  | "florist"
  | "music"
  | "decoration"
  | "wedding_dress"
  | "tuxedo"
  | "jewelry"
  | "honeymoon"
  | "travel"
  | "hotel"
  | "gift_registry"
  | "party_supplies"
  | "cake"
  | "invitations_print"
  | "favors"
  | "transportation"
  | "beauty"
  | "spa"
  | "experience";

/**
 * Affiliate network identifier.
 */
export type AffiliateNetwork =
  | "shareAsale"
  | "cj"
  | "impact"
  | "amazon"
  | "custom";

/**
 * The data collected via the multi-step event questionnaire.
 * Drives personalised product recommendations and affiliate matching.
 */
export interface EventQuestionnaire {
  invitationId: string;
  userId: string;
  eventType: EventType;

  // Core event details
  eventDate: string;
  guestCount?: number;
  estimatedBudget?: number;
  venueBooked: boolean;
  venueName?: string;
  venueCity?: string;
  venueState?: string;

  // Vendor needs
  needsPhotographer?: boolean;
  needsCatering?: boolean;
  needsFlorist?: boolean;
  needsMusic?: boolean;
  needsVenue?: boolean;
  needsHoneymoon?: boolean;

  // Wedding-specific
  weddingStyle?: WeddingStyle;
  weddingTheme?: string;
  honeymoonDestination?: string;
  honeymoonBudget?: number;

  // Birthday-specific
  birthdayAge?: number;
  birthdayTheme?: string;

  // Gift preferences
  giftRegistryInterest?: boolean;
  preferredGiftTypes?: string[];

  // Travel & accommodations
  outOfTownGuests?: number;
  needsHotelBlock?: boolean;

  // Additional data points
  hasChildren?: boolean;
  petFriendly?: boolean;
  dietaryRestrictions?: string[];
  culturalTraditions?: string[];

  completedAt?: string;
  createdAt: string;
}

/**
 * An affiliate product that can be recommended to a user.
 */
export interface AffiliateProduct {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  price: number;
  affiliateNetwork: AffiliateNetwork;
  affiliateLink: string;
  commission: number;
  imageUrl: string;
  rating?: number;
  targetEventTypes: EventType[];
  targetLocations?: string[];
  targetBudgetRange?: { min: number; max: number };
  targetGuestCount?: { min: number; max: number };
  tags: string[];
  priority: number;
  active: boolean;
  createdAt: string;
  updatedAt?: string;
}

/**
 * A customer profile used for recommendation personalisation.
 */
export interface CustomerProfile {
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;

  lastActive?: string;

  primaryEventType?: EventType;
  upcomingEvents: Array<{
    id: string;
    type: EventType;
    date: string;
    guestCount?: number;
    budget?: number;
  }>;

  interests: string[];

  totalInvitationsCreated: number;
  lastInvitationDate?: string;
  templatePreferences: EventType[];
  averageBudget?: number;
  preferredVendorTypes: ProductCategory[];

  affiliateClicks: number;
  affiliatePurchases: number;
  totalAffiliateRevenue: number;
  lastAffiliateClickDate?: string;

  lifetimeValue: number;
  segment: "cold" | "warm" | "hot" | "vip";
  tags: string[];

  createdAt: string;
  updatedAt: string;
}

/**
 * A single AI-generated product recommendation category.
 */
export interface AIRecommendation {
  category: string;
  reasoning: string;
  suggestedProducts: {
    name: string;
    description: string;
    estimatedPrice?: string;
    priority: "high" | "medium" | "low";
    searchTerms: string[];
  }[];
}

/**
 * The full response from the AI recommendation engine.
 */
export interface AIRecommendationResponse {
  recommendations: AIRecommendation[];
  eventTheme: string;
  styleAdvice: string;
}
