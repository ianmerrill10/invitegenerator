// ============================================
// INVITEGENERATOR.COM - TYPE DEFINITIONS
// ============================================

// ==================== USER TYPES ====================
export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  plan: UserPlan;
  creditsRemaining: number;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  createdAt: string;
  updatedAt: string;
  settings: UserSettings;
}

export type UserPlan = "free" | "starter" | "pro" | "business";

export interface UserSettings {
  emailNotifications: boolean;
  rsvpReminders: boolean;
  marketingEmails: boolean;
  defaultTemplate?: string;
  timezone: string;
  language: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// ==================== INVITATION TYPES ====================
export interface Invitation {
  id: string;
  userId: string;
  shortId: string;
  title: string;
  eventType: EventType;
  eventDate: string;
  eventTime?: string;
  eventEndDate?: string;
  eventEndTime?: string;
  location: EventLocation;
  description?: string;
  hostName: string;
  hostEmail: string;
  designData: InvitationDesign;
  rsvpSettings: RSVPSettings;
  settings?: InvitationSettings;
  status: InvitationStatus;
  shareUrl: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface InvitationSettings {
  showCountdown?: boolean;
  showMap?: boolean;
  showWeather?: boolean;
  allowSharing?: boolean;
  requireAuth?: boolean;
  password?: string;
  canvasWidth?: number;
  canvasHeight?: number;
  backgroundColor?: string;
}

export type EventType =
  | "wedding"
  | "birthday"
  | "baby_shower"
  | "bridal_shower"
  | "anniversary"
  | "graduation"
  | "corporate"
  | "holiday"
  | "dinner_party"
  | "cocktail_party"
  | "retirement"
  | "memorial"
  | "religious"
  | "fundraiser"
  | "other";

export interface EventLocation {
  name: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  virtual?: boolean;
  virtualLink?: string;
  mapUrl?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface InvitationDesign {
  templateId: string;
  backgroundColor: string;
  backgroundImage?: string;
  backgroundPattern?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  headingFont: string;
  fontSize: number;
  textColor: string;
  layout: InvitationLayout;
  elements: DesignElement[];
  customCss?: string;
  width: number;
  height: number;
}

export type InvitationLayout =
  | "classic"
  | "modern"
  | "minimal"
  | "elegant"
  | "playful"
  | "rustic"
  | "bold"
  | "custom";

export interface DesignElement {
  id: string;
  type: ElementType;
  content: string;
  position: Position;
  size: Size;
  style: ElementStyle;
  rotation?: number;
  opacity?: number;
  zIndex: number;
  locked?: boolean;
  hidden?: boolean;
}

export type ElementType =
  | "text"
  | "image"
  | "shape"
  | "icon"
  | "divider"
  | "qrcode"
  | "map"
  | "countdown";

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface ElementStyle {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number | "normal" | "bold" | "lighter" | "bolder";
  fontStyle?: "normal" | "italic";
  textAlign?: "left" | "center" | "right" | "justify";
  textDecoration?: "none" | "underline" | "line-through";
  lineHeight?: number;
  letterSpacing?: number;
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  borderStyle?: "solid" | "dashed" | "dotted";
  boxShadow?: string;
  padding?: number;
  filter?: string;

  // Text Effects
  textShadow?: TextShadow;
  textOutline?: TextOutline;
  textGradient?: TextGradient;
  textTransform?: "none" | "uppercase" | "lowercase" | "capitalize";

  // Image Effects
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
  imageFilter?: ImageFilter;
}

// ==================== TEXT EFFECTS ====================
export interface TextShadow {
  enabled: boolean;
  offsetX: number;
  offsetY: number;
  blur: number;
  color: string;
  // Multiple shadows support
  shadows?: Array<{
    offsetX: number;
    offsetY: number;
    blur: number;
    color: string;
  }>;
}

export interface TextOutline {
  enabled: boolean;
  width: number;
  color: string;
  style?: "solid" | "dashed" | "dotted";
}

export interface TextGradient {
  enabled: boolean;
  type: "linear" | "radial";
  angle?: number; // For linear gradients (0-360)
  colors: GradientStop[];
}

export interface GradientStop {
  color: string;
  position: number; // 0-100 percentage
}

export interface ImageFilter {
  brightness?: number; // 0-200, 100 is default
  contrast?: number; // 0-200, 100 is default
  saturation?: number; // 0-200, 100 is default
  blur?: number; // 0-20px
  grayscale?: number; // 0-100
  sepia?: number; // 0-100
  hueRotate?: number; // 0-360
  invert?: number; // 0-100
}

// ==================== ELEMENT LIBRARY ====================
export interface LibraryItem {
  id: string;
  name: string;
  category: LibraryCategory;
  subcategory?: string;
  type: ElementType;
  content: string; // SVG string, icon name, or image URL
  thumbnail?: string;
  tags: string[];
  isPremium: boolean;
}

export type LibraryCategory =
  | "shapes"
  | "icons"
  | "stickers"
  | "decorations"
  | "borders"
  | "dividers"
  | "backgrounds"
  | "patterns";

export type InvitationStatus = "draft" | "published" | "archived" | "cancelled";

// ==================== RSVP TYPES ====================
export interface RSVPSettings {
  enabled: boolean;
  deadline?: string;
  maxGuests: number;
  allowPlusOne: boolean;
  plusOneLimit?: number;
  collectMealPreference: boolean;
  mealOptions?: string[];
  collectDietaryRestrictions: boolean;
  customQuestions: CustomQuestion[];
  requireMessage: boolean;
  sendConfirmationEmail: boolean;
  sendReminderEmail: boolean;
  reminderDaysBefore?: number;
}

export interface CustomQuestion {
  id: string;
  question: string;
  type: "text" | "select" | "multiselect" | "radio" | "checkbox";
  options?: string[];
  required: boolean;
}

export interface RSVPResponse {
  id: string;
  invitationId: string;
  guestName: string;
  guestEmail: string;
  response: "attending" | "not_attending" | "maybe";
  guestCount: number;
  plusOneName?: string;
  mealPreference?: string;
  dietaryRestrictions?: string;
  message?: string;
  customAnswers?: Record<string, string | string[]>;
  submittedAt: string;
  updatedAt: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface RSVPSummary {
  total: number;
  attending: number;
  notAttending: number;
  maybe: number;
  pending: number;
  totalGuests: number;
  mealCounts?: Record<string, number>;
}

// ==================== TEMPLATE TYPES ====================
export interface Template {
  id: string;
  name: string;
  description: string;
  category: EventType;
  tags: string[];
  thumbnail: string;
  previewImages: string[];
  design: InvitationDesign;
  isPremium: boolean;
  price?: number;
  popularity: number;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateCategory {
  id: EventType;
  name: string;
  description: string;
  icon: string;
  templateCount: number;
}

// ==================== AI GENERATION TYPES ====================
export interface AIGenerationRequest {
  eventType: EventType;
  eventDetails: {
    title?: string;
    date?: string;
    time?: string;
    location?: string;
    hostName?: string;
    description?: string;
  };
  style: AIStyle;
  colorPreferences?: string[];
  mood?: string;
  additionalInstructions?: string;
}

export interface AIStyle {
  aesthetic: "modern" | "classic" | "playful" | "elegant" | "minimalist" | "bold" | "rustic" | "whimsical";
  formality: "casual" | "semi-formal" | "formal";
  colorScheme: "warm" | "cool" | "neutral" | "vibrant" | "pastel" | "monochrome" | "custom";
}

export interface AIGenerationResponse {
  success: boolean;
  invitation?: Partial<Invitation>;
  suggestions?: AISuggestion[];
  error?: string;
  creditsUsed: number;
}

export interface AISuggestion {
  type: "text" | "color" | "layout" | "image";
  content: string;
  confidence: number;
}

// ==================== SUBSCRIPTION & BILLING ====================
export interface Subscription {
  id: string;
  userId: string;
  plan: UserPlan;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
}

export type SubscriptionStatus =
  | "active"
  | "past_due"
  | "canceled"
  | "incomplete"
  | "trialing";

export interface PlanFeatures {
  plan: UserPlan;
  name: string;
  price: number;
  priceYearly: number;
  invitationsPerMonth: number;
  aiCreditsPerMonth: number;
  guestsPerInvitation: number;
  customBranding: boolean;
  premiumTemplates: boolean;
  analytics: boolean;
  prioritySupport: boolean;
  apiAccess: boolean;
  teamMembers: number;
  features: string[];
}

// ==================== ANALYTICS TYPES ====================
export interface InvitationAnalytics {
  invitationId: string;
  views: number;
  uniqueViews: number;
  rsvpRate: number;
  shareCount: number;
  viewsByDate: DailyMetric[];
  viewsBySource: Record<string, number>;
  viewsByDevice: Record<string, number>;
  viewsByLocation: Record<string, number>;
}

export interface DailyMetric {
  date: string;
  value: number;
}

// ==================== API RESPONSE TYPES ====================
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: APIError;
  meta?: APIMeta;
}

export interface APIError {
  code: string;
  message: string;
  details?: Record<string, string>;
}

export interface APIMeta {
  page?: number;
  pageSize?: number;
  totalCount?: number;
  totalPages?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: APIMeta;
}

// ==================== FORM TYPES ====================
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export interface CreateInvitationFormData {
  title: string;
  eventType: EventType;
  eventDate: string;
  eventTime?: string;
  location: Partial<EventLocation>;
  description?: string;
  hostName: string;
  templateId?: string;
}

// ==================== UTILITY TYPES ====================
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

export type Nullable<T> = T | null;

export type ValueOf<T> = T[keyof T];

// ==================== AFFILIATE/REFERRAL TYPES ====================
export interface Affiliate {
  id: string;
  userId: string;
  code: string; // Unique referral code (e.g., "JOHN25")
  customSlug?: string; // Custom vanity URL slug
  status: AffiliateStatus;
  tier: AffiliateTier;
  payoutMethod: PayoutMethod;
  payoutDetails: PayoutDetails;
  stats: AffiliateStats;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  lastPayoutAt?: string;
}

export type AffiliateStatus = "pending" | "active" | "suspended" | "rejected";

export type AffiliateTier = "bronze" | "silver" | "gold" | "platinum" | "diamond";

export interface AffiliateTierConfig {
  tier: AffiliateTier;
  name: string;
  minReferrals: number;
  commissionRate: number; // Percentage (e.g., 30 = 30%)
  recurringCommission: boolean;
  recurringMonths: number; // How many months of recurring commission
  bonuses: TierBonus[];
}

export interface TierBonus {
  type: "signup" | "milestone" | "performance";
  amount: number;
  description: string;
  requirement?: number;
}

export type PayoutMethod = "paypal" | "stripe" | "bank_transfer" | "crypto";

export interface PayoutDetails {
  paypal?: { email: string };
  stripe?: { accountId: string };
  bankTransfer?: {
    accountName: string;
    accountNumber: string;
    routingNumber: string;
    bankName: string;
    country: string;
  };
  crypto?: {
    walletAddress: string;
    network: "ethereum" | "bitcoin" | "usdc";
  };
}

export interface AffiliateStats {
  totalClicks: number;
  totalSignups: number;
  totalConversions: number;
  conversionRate: number;
  totalEarnings: number;
  pendingEarnings: number;
  paidEarnings: number;
  currentMonthEarnings: number;
  lifetimeValue: number;
}

export interface Referral {
  id: string;
  affiliateId: string;
  referredUserId: string;
  referredEmail: string;
  status: ReferralStatus;
  source: string; // Where the click came from
  landingPage: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  convertedAt?: string;
  firstPurchaseAt?: string;
  totalRevenue: number;
  totalCommission: number;
}

export type ReferralStatus = "clicked" | "signed_up" | "converted" | "churned";

export interface AffiliateCommission {
  id: string;
  affiliateId: string;
  referralId: string;
  type: CommissionType;
  amount: number;
  percentage: number;
  baseAmount: number; // The sale amount commission is based on
  status: CommissionStatus;
  description: string;
  createdAt: string;
  paidAt?: string;
  payoutId?: string;
}

export type CommissionType = "signup_bonus" | "first_sale" | "recurring" | "milestone_bonus" | "performance_bonus";

export type CommissionStatus = "pending" | "approved" | "paid" | "cancelled";

export interface AffiliatePayout {
  id: string;
  affiliateId: string;
  amount: number;
  method: PayoutMethod;
  status: PayoutStatus;
  commissionIds: string[];
  transactionId?: string;
  notes?: string;
  createdAt: string;
  processedAt?: string;
  completedAt?: string;
}

export type PayoutStatus = "pending" | "processing" | "completed" | "failed";

export interface AffiliateApplication {
  id: string;
  userId?: string;
  email: string;
  name: string;
  website?: string;
  socialMedia?: {
    instagram?: string;
    twitter?: string;
    youtube?: string;
    tiktok?: string;
    linkedin?: string;
  };
  audience: string;
  promotionPlan: string;
  monthlyTraffic?: string;
  niche: string;
  status: "pending" | "approved" | "rejected";
  notes?: string;
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface AffiliateLink {
  affiliateCode: string;
  baseUrl: string;
  fullUrl: string;
  shortUrl?: string;
  campaign?: string;
  medium?: string;
  source?: string;
}

export interface AffiliateLeaderboard {
  period: "weekly" | "monthly" | "all_time";
  entries: LeaderboardEntry[];
  lastUpdated: string;
}

export interface LeaderboardEntry {
  rank: number;
  affiliateId: string;
  affiliateName: string;
  tier: AffiliateTier;
  referrals: number;
  earnings: number;
  badge?: string;
}

// ==================== CRM/CONTACTS TYPES ====================
export interface VendorContact {
  id: string;
  company: string;
  contactName: string;
  title?: string;
  email: string;
  phone?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  tiktok?: string;
  category: VendorCategory;
  subcategory?: string;
  location: ContactLocation;
  source: ContactSource;
  status: ContactStatus;
  tags: string[];
  notes: string;
  outreachHistory: OutreachRecord[];
  partnershipStatus: PartnershipStatus;
  createdAt: string;
  updatedAt: string;
  lastContactedAt?: string;
}

export interface ContactLocation {
  city?: string;
  state?: string;
  country: string;
  region?: string;
}

export type VendorCategory =
  | "venue"
  | "dj"
  | "musician"
  | "photographer"
  | "videographer"
  | "planner"
  | "caterer"
  | "florist"
  | "beauty"
  | "rentals"
  | "stationery"
  | "bakery"
  | "officiant"
  | "transportation"
  | "other";

export type ContactSource =
  | "the_knot"
  | "wedding_wire"
  | "instagram"
  | "facebook"
  | "linkedin"
  | "tiktok"
  | "referral"
  | "trade_show"
  | "cold_outreach"
  | "purchased_list"
  | "website_scrape"
  | "google"
  | "yelp"
  | "manual";

export type ContactStatus =
  | "new"
  | "contacted"
  | "responded"
  | "meeting_scheduled"
  | "negotiating"
  | "converted"
  | "rejected"
  | "unresponsive"
  | "do_not_contact";

export type PartnershipStatus =
  | "none"
  | "prospect"
  | "affiliate"
  | "advertiser"
  | "referral_partner"
  | "integration_partner"
  | "sponsor";

export interface OutreachRecord {
  id: string;
  date?: string;
  type: OutreachType;
  subject: string;
  notes: string;
  outcome?: "pending" | "positive" | "negative" | "no_response";
  followUpDate?: string;
  response?: string;
  nextFollowUp?: string;
  sentBy?: string;
}

export type OutreachType =
  | "email"
  | "phone"
  | "dm_instagram"
  | "dm_facebook"
  | "dm_linkedin"
  | "dm_tiktok"
  | "meeting"
  | "conference"
  | "other";

export interface ContactsFilter {
  category?: VendorCategory;
  status?: ContactStatus;
  partnershipStatus?: PartnershipStatus;
  source?: ContactSource;
  location?: string;
  search?: string;
  tags?: string[];
}

export interface ContactsStats {
  total: number;
  byStatus: Record<ContactStatus, number>;
  byCategory: Record<VendorCategory, number>;
  byPartnershipStatus: Record<PartnershipStatus, number>;
  contactedThisWeek: number;
  convertedThisMonth: number;
}
