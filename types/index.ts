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
  status: InvitationStatus;
  shareUrl: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
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
  fontWeight?: number;
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
}

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

// ==================== EVENT WEBSITE TYPES ====================
export interface EventWebsite {
  id: string;
  invitationId: string;
  userId: string;
  subdomain: string; // e.g., "john-jane" for john-jane.invitegenerator.com
  customDomain?: string; // e.g., "johnandjanewedding.com"
  tier: EventWebsiteTier;
  template: string;
  settings: EventWebsiteSettings;
  sections: EventWebsiteSection[];
  seo: EventWebsiteSEO;
  analytics: WebsiteAnalytics;
  status: "draft" | "published" | "archived";
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  expiresAt?: string; // For time-limited events
}

export type EventWebsiteTier = "free" | "premium" | "pro";

export interface EventWebsiteSettings {
  passwordProtected: boolean;
  password?: string;
  showRsvp: boolean;
  showRegistry: boolean;
  showGallery: boolean;
  showAccommodations: boolean;
  showTravel: boolean;
  showFaq: boolean;
  showTimeline: boolean;
  backgroundColor: string;
  primaryColor: string;
  fontFamily: string;
  customCss?: string;
  backgroundMusic?: string;
  showCountdown: boolean;
}

export interface EventWebsiteSection {
  id: string;
  type: WebsiteSectionType;
  title: string;
  content: string;
  order: number;
  visible: boolean;
  settings: Record<string, unknown>;
}

export type WebsiteSectionType =
  | "hero"
  | "story"
  | "details"
  | "rsvp"
  | "registry"
  | "gallery"
  | "accommodations"
  | "travel"
  | "faq"
  | "timeline"
  | "party" // Wedding party, etc.
  | "custom";

export interface EventWebsiteSEO {
  title: string;
  description: string;
  ogImage?: string;
  noIndex: boolean;
}

export interface WebsiteAnalytics {
  totalViews: number;
  uniqueVisitors: number;
  rsvpConversionRate: number;
  topReferrers: Record<string, number>;
  viewsByDate: Array<{ date: string; views: number }>;
}

// ==================== DIGITAL DELIVERY TYPES ====================
export interface DeliveryJob {
  id: string;
  invitationId: string;
  userId: string;
  method: DeliveryMethod;
  status: DeliveryStatus;
  recipients: DeliveryRecipient[];
  scheduledFor?: string;
  sentAt?: string;
  completedAt?: string;
  stats: DeliveryStats;
  createdAt: string;
}

export type DeliveryMethod = "email" | "premiumEmail" | "sms" | "whatsapp";

export type DeliveryStatus =
  | "pending"
  | "scheduled"
  | "sending"
  | "completed"
  | "partial"
  | "failed";

export interface DeliveryRecipient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  status: "pending" | "sent" | "delivered" | "opened" | "clicked" | "failed" | "bounced";
  sentAt?: string;
  deliveredAt?: string;
  openedAt?: string;
  clickedAt?: string;
  errorMessage?: string;
}

export interface DeliveryStats {
  total: number;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  failed: number;
  bounced: number;
}

export interface DeliveryCreditBalance {
  userId: string;
  email: number;
  premiumEmail: number;
  sms: number;
  whatsapp: number;
  updatedAt: string;
}

// ==================== STATIONERY BUNDLE TYPES ====================
export interface StationeryBundle {
  id: string;
  name: string;
  description: string;
  products: StationeryProduct[];
  pricePerSet: number;
  savings: string;
  popular: boolean;
}

export interface StationeryProduct {
  id: string;
  name: string;
  description: string;
  sku: string;
  category: "pre-event" | "main" | "event-day" | "post-event" | "extras";
  dimensions: { width: number; height: number; units: string };
  includesEnvelope: boolean;
  paperWeight: string;
}

export interface BundleOrder {
  id: string;
  userId: string;
  invitationId: string;
  bundleId: string;
  quantity: number;
  customizations: BundleCustomization[];
  pricing: BundlePricing;
  rushProcessing?: RushProcessingOption;
  shippingAddress: ShippingAddress;
  status: OrderStatus;
  prodigiOrderIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface BundleCustomization {
  productId: string;
  designUrl: string;
  quantity: number;
}

export interface BundlePricing {
  subtotal: number;
  bundleDiscount: number;
  quantityDiscount: number;
  tierDiscount: number;
  rushFee: number;
  shippingCost: number;
  tax: number;
  total: number;
}

export interface RushProcessingOption {
  type: "standard" | "rush" | "priority" | "sameDay";
  fee: number;
  estimatedShipDate: string;
}

export interface ShippingAddress {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "printing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

// ==================== ADD-ON TYPES ====================
export interface AddOnPurchase {
  id: string;
  userId: string;
  type: AddOnType;
  quantity: number;
  price: number;
  status: "pending" | "completed" | "refunded";
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export type AddOnType =
  | "aiCredits"
  | "deliveryCredits"
  | "customDesign"
  | "designReview"
  | "addressCollection"
  | "envelopeAddressing"
  | "waxSeals"
  | "ribbons"
  | "photoEnhancement";

// ==================== ENHANCED PLAN FEATURES ====================
export interface EnhancedPlanFeatures extends PlanFeatures {
  digitalDeliveryCredits: number;
  smsCredits: number;
  eventWebsiteTier: EventWebsiteTier;
  bundleDiscount: number;
  rushProcessingDiscount: number;
  freeEnvelopeAddressing: boolean;
  freeEnvelopeAddressingLimit?: number;
}
