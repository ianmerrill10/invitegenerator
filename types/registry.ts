// =============================================================================
// REGISTRY & GIFT GUIDANCE - TYPE DEFINITIONS
// InviteGenerator.com
// =============================================================================

// -----------------------------------------------------------------------------
// ENUMS
// -----------------------------------------------------------------------------

export enum RegistryType {
  TRADITIONAL = 'traditional',      // Standard gift registry
  CHARITY = 'charity',              // Charity donations
  EXPERIENCE_FUND = 'experience_fund', // Honeymoon, travel, etc.
  GROUP_GIFT = 'group_gift',        // Pooled money for one item
  SERVICE_SIGNUP = 'service_signup', // Time/help contributions
  HYBRID = 'hybrid'                 // Combination
}

export enum ItemType {
  PRODUCT = 'product',              // Physical gift
  DONATION = 'donation',            // Charity donation
  EXPERIENCE = 'experience',        // Experience fund contribution
  SERVICE = 'service',              // Time/service signup
  CASH_FUND = 'cash_fund'           // Direct cash contribution
}

export enum CardType {
  QR_SIMPLE = 'qr_simple',          // Just QR code
  CURATED_LIST = 'curated_list',    // Items with prices
  CHARITY_OPTIONS = 'charity_options', // Multiple charities
  EXPERIENCE_FUND = 'experience_fund', // Fund progress display
  GROUP_GIFT = 'group_gift',        // Single item focus
  SERVICE_SIGNUP = 'service_signup', // Help requests
  BOOKLET = 'booklet'               // Multi-page
}

export enum CardSize {
  STANDARD = 'standard',            // 5x7
  SMALL = 'small',                  // 4x6
  LARGE = 'large',                  // 6x8
  BOOKMARK = 'bookmark',            // 2x8
  SQUARE = 'square'                 // 5x5
}

export enum PrivacyLevel {
  PUBLIC = 'public',
  INVITE_ONLY = 'invite_only',
  PASSWORD = 'password'
}

export enum ServiceSignupStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum PaymentMethod {
  CARD = 'card',
  PAYPAL = 'paypal',
  VENMO = 'venmo'
}

export enum ContributionSource {
  AMAZON = 'amazon',
  DIRECT = 'direct',
  EXTERNAL = 'external',
  CASH = 'cash'
}

// -----------------------------------------------------------------------------
// CORE REGISTRY INTERFACES
// -----------------------------------------------------------------------------

/**
 * Main Gift Registry
 */
export interface GiftRegistry {
  id: string;
  eventId: string;
  userId: string;
  type: RegistryType;
  title: string;
  description: string;
  personalMessage?: string;
  coverImageUrl?: string;
  items: RegistryItem[];
  settings: RegistrySettings;
  stats: RegistryStats;
  customUrl: string;              // invitegenerator.com/registry/[customUrl]
  isActive: boolean;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Individual Registry Item
 */
export interface RegistryItem {
  id: string;
  registryId: string;
  type: ItemType;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  goalAmount?: number;            // For funds
  currentAmount?: number;         // For funds
  amazonAsin?: string;            // For affiliate products
  affiliateLink?: string;
  externalUrl?: string;           // For charities, external stores
  isPurchased: boolean;
  purchasedBy?: string;
  purchasedAt?: Date;
  quantity: number;
  quantityFulfilled: number;
  priority: 'high' | 'medium' | 'low';
  category: string;
  isVisible: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Registry Settings
 */
export interface RegistrySettings {
  allowAnonymousGifts: boolean;
  showPrices: boolean;
  showProgress: boolean;          // For funds
  showContributorNames: boolean;
  allowPartialContributions: boolean;
  allowMessages: boolean;
  thankYouMessage: string;
  privacyLevel: PrivacyLevel;
  password?: string;
  notifyOnPurchase: boolean;
  notifyOnContribution: boolean;
  theme: RegistryTheme;
}

/**
 * Registry Theme
 */
export interface RegistryTheme {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  backgroundStyle: 'solid' | 'gradient' | 'pattern';
  backgroundValue: string;
}

/**
 * Registry Statistics
 */
export interface RegistryStats {
  totalItems: number;
  itemsFulfilled: number;
  totalValue: number;
  valueFulfilled: number;
  uniqueContributors: number;
  views: number;
  conversionRate: number;         // Views to purchases
  affiliateEarnings: number;      // Internal tracking
  lastActivityAt: Date;
}

// -----------------------------------------------------------------------------
// CONTRIBUTION INTERFACES
// -----------------------------------------------------------------------------

/**
 * Gift Contribution (for tracking purchases)
 */
export interface GiftContribution {
  id: string;
  registryId: string;
  itemId: string;
  contributorName: string;
  contributorEmail: string;
  amount: number;
  isAnonymous: boolean;
  message?: string;
  source: ContributionSource;
  affiliateCommission?: number;
  isConfirmed: boolean;
  createdAt: Date;
}

/**
 * Fund Contribution (for experience/cash funds)
 */
export interface FundContribution {
  id: string;
  fundId: string;
  registryId: string;
  contributorName: string;
  contributorEmail: string;
  amount: number;
  message?: string;
  isAnonymous: boolean;
  paymentMethod: PaymentMethod;
  transactionId: string;
  stripePaymentIntentId?: string;
  platformFee: number;            // Your cut
  netAmount: number;              // Amount after fees
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  createdAt: Date;
}

// -----------------------------------------------------------------------------
// EXPERIENCE FUND INTERFACES
// -----------------------------------------------------------------------------

/**
 * Experience Fund
 */
export interface ExperienceFund {
  id: string;
  registryId: string;
  name: string;
  description: string;
  imageUrl: string;
  goalAmount: number;
  currentAmount: number;
  contributions: FundContribution[];
  isComplete: boolean;
  stripeProductId?: string;       // For payment processing
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Predefined Experience Templates
 */
export interface ExperienceTemplate {
  id: string;
  name: string;
  description: string;
  suggestedAmount: number;
  category: 'honeymoon' | 'travel' | 'dining' | 'adventure' | 'wellness' | 'entertainment';
  imageUrl: string;
  isPopular: boolean;
}

// -----------------------------------------------------------------------------
// SERVICE/TIME SIGNUP INTERFACES
// -----------------------------------------------------------------------------

/**
 * Service Request (what help is needed)
 */
export interface ServiceRequest {
  id: string;
  registryId: string;
  serviceType: string;
  title: string;
  description: string;
  icon: string;
  availableSlots: ServiceSlot[];
  totalSlotsNeeded: number;
  slotsFilled: number;
  externalLink?: string;          // Link to Meal Train, etc.
  createdAt: Date;
}

/**
 * Service Time Slot
 */
export interface ServiceSlot {
  id: string;
  serviceRequestId: string;
  date: Date;
  timeSlot?: string;              // "Morning", "Evening", etc.
  isFilled: boolean;
  filledBy?: ServiceSignup;
}

/**
 * Service Signup (volunteer commitment)
 */
export interface ServiceSignup {
  id: string;
  serviceRequestId: string;
  slotId?: string;
  volunteerName: string;
  volunteerEmail: string;
  volunteerPhone?: string;
  selectedDate?: Date;
  selectedTimeSlot?: string;
  notes?: string;
  status: ServiceSignupStatus;
  reminderSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// -----------------------------------------------------------------------------
// GROUP GIFT INTERFACES
// -----------------------------------------------------------------------------

/**
 * Group Gift Campaign
 */
export interface GroupGiftCampaign {
  id: string;
  registryId: string;
  organizerName: string;
  organizerEmail: string;
  targetItem: GroupGiftItem;
  goalAmount: number;
  currentAmount: number;
  contributors: GroupGiftContributor[];
  deadline?: Date;
  isComplete: boolean;
  isPurchased: boolean;
  purchaseProofUrl?: string;
  message: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Group Gift Target Item
 */
export interface GroupGiftItem {
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  purchaseUrl: string;
  amazonAsin?: string;
}

/**
 * Group Gift Contributor
 */
export interface GroupGiftContributor {
  id: string;
  campaignId: string;
  name: string;
  email: string;
  amount: number;
  message?: string;
  isAnonymous: boolean;
  paymentStatus: 'pending' | 'completed' | 'failed';
  transactionId?: string;
  createdAt: Date;
}

// -----------------------------------------------------------------------------
// CHARITY/CAUSE INTERFACES
// -----------------------------------------------------------------------------

/**
 * Charity Option
 */
export interface CharityOption {
  id: string;
  registryId: string;
  charityId: string;              // Reference to master charity list
  charity: Charity;
  personalMessage?: string;
  goalAmount?: number;
  currentAmount?: number;
  sortOrder: number;
}

/**
 * Master Charity Entry
 */
export interface Charity {
  id: string;
  name: string;
  description: string;
  mission: string;
  logoUrl: string;
  websiteUrl: string;
  donationUrl: string;
  ein?: string;                   // Tax ID for US charities
  category: CharityCategory;
  tags: string[];
  isVerified: boolean;
  rating?: number;                // Charity Navigator rating
  createdAt: Date;
}

export type CharityCategory =
  | 'environment'
  | 'animals'
  | 'health'
  | 'education'
  | 'children'
  | 'hunger'
  | 'housing'
  | 'veterans'
  | 'arts'
  | 'community'
  | 'international'
  | 'religious'
  | 'disaster_relief'
  | 'civil_rights'
  | 'other';

// -----------------------------------------------------------------------------
// PRINTED CARD INTERFACES
// -----------------------------------------------------------------------------

/**
 * Registry Card Configuration
 */
export interface RegistryCardConfig {
  id: string;
  registryId: string;
  cardType: CardType;
  layout: CardLayout;
  content: CardContent;
  design: CardDesign;
  printQuantity: number;
  paperType: string;
  size: CardSize;
  costPerCard: number;
  totalCost: number;
  createdAt: Date;
}

/**
 * Card Layout Options
 */
export interface CardLayout {
  columns: 1 | 2;
  showQrCode: boolean;
  qrCodePosition: 'top' | 'bottom' | 'left' | 'right' | 'center';
  showPrices: boolean;
  showProgress: boolean;
  maxItemsDisplayed: number;
}

/**
 * Card Content
 */
export interface CardContent {
  headline: string;
  subheadline?: string;
  personalMessage: string;
  itemIds: string[];              // Which items to show
  qrCodeUrl: string;
  footerText: string;
  showHostNames: boolean;
  hostNames?: string;
}

/**
 * Card Design
 */
export interface CardDesign {
  templateId: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  borderStyle: 'none' | 'simple' | 'decorative';
  backgroundPattern?: string;
}

// -----------------------------------------------------------------------------
// CARD TEMPLATE TYPES
// -----------------------------------------------------------------------------

/**
 * Card Template Definitions
 */
export interface CardTemplate {
  id: string;
  name: string;
  cardType: CardType;
  thumbnailUrl: string;
  previewUrl: string;
  defaultLayout: CardLayout;
  defaultDesign: CardDesign;
  supportedSizes: CardSize[];
  category: string;
  tags: string[];
  isPopular: boolean;
}

// -----------------------------------------------------------------------------
// "IN LIEU OF GIFTS" INTERFACES
// -----------------------------------------------------------------------------

/**
 * Alternative Gift Request
 */
export interface AlternativeGiftRequest {
  id: string;
  registryId: string;
  type: AlternativeType;
  title: string;
  description: string;
  options: AlternativeOption[];
  createdAt: Date;
}

export type AlternativeType =
  | 'charity_donation'
  | 'experience_fund'
  | 'service_time'
  | 'group_gift'
  | 'pay_it_forward'
  | 'presence_only'
  | 'future_date'
  | 'custom';

/**
 * Alternative Option
 */
export interface AlternativeOption {
  id: string;
  title: string;
  description: string;
  iconEmoji: string;
  actionUrl?: string;
  actionType: 'link' | 'qr_code' | 'signup' | 'donate';
  sortOrder: number;
}

// -----------------------------------------------------------------------------
// API INTERFACES
// -----------------------------------------------------------------------------

/**
 * Create Registry Request
 */
export interface CreateRegistryRequest {
  eventId: string;
  type: RegistryType;
  title: string;
  description: string;
  customUrl?: string;
  settings?: Partial<RegistrySettings>;
}

/**
 * Add Item to Registry Request
 */
export interface AddRegistryItemRequest {
  registryId: string;
  type: ItemType;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  amazonAsin?: string;
  externalUrl?: string;
  quantity?: number;
  priority?: 'high' | 'medium' | 'low';
  category?: string;
}

/**
 * Record Contribution Request
 */
export interface RecordContributionRequest {
  registryId: string;
  itemId: string;
  contributorName: string;
  contributorEmail: string;
  amount?: number;
  isAnonymous?: boolean;
  message?: string;
  source: ContributionSource;
}

/**
 * Create Fund Contribution Request
 */
export interface CreateFundContributionRequest {
  fundId: string;
  amount: number;
  contributorName: string;
  contributorEmail: string;
  message?: string;
  isAnonymous?: boolean;
  paymentMethodId: string;        // Stripe payment method
}

/**
 * Registry Public View Response
 */
export interface RegistryPublicView {
  registry: Omit<GiftRegistry, 'stats'>;
  items: RegistryItem[];
  experienceFunds?: ExperienceFund[];
  charityOptions?: CharityOption[];
  serviceRequests?: ServiceRequest[];
  groupGiftCampaigns?: GroupGiftCampaign[];
  publicStats: {
    totalItems: number;
    itemsFulfilled: number;
    percentComplete: number;
  };
}

// -----------------------------------------------------------------------------
// PRODUCT OFFERINGS
// -----------------------------------------------------------------------------

/**
 * Registry Card Add-On Package
 */
export interface RegistryCardPackage {
  id: string;
  name: string;
  description: string;
  cardTypes: CardType[];
  basePrice: number;
  includesQuantity: number;
  features: string[];
  isPopular: boolean;
}

/**
 * Registry Feature Tier
 */
export interface RegistryFeatureTier {
  id: string;
  name: string;
  price: number;
  billingPeriod: 'one_time' | 'per_event' | 'monthly' | 'yearly';
  features: RegistryFeature[];
  limits: RegistryLimits;
}

export interface RegistryFeature {
  name: string;
  description: string;
  isIncluded: boolean;
}

export interface RegistryLimits {
  maxItems: number;
  maxFunds: number;
  maxCharities: number;
  customUrl: boolean;
  analytics: boolean;
  thankYouCardGenerator: boolean;
}

// -----------------------------------------------------------------------------
// ANALYTICS
// -----------------------------------------------------------------------------

/**
 * Registry Analytics
 */
export interface RegistryAnalytics {
  registryId: string;
  periodStart: Date;
  periodEnd: Date;
  views: number;
  uniqueVisitors: number;
  itemViews: Record<string, number>;
  contributions: number;
  totalContributionValue: number;
  topItems: Array<{itemId: string; views: number; contributions: number}>;
  conversionRate: number;
  affiliateEarnings: number;
  sourceBreakdown: Record<ContributionSource, number>;
}

// -----------------------------------------------------------------------------
// HELPER TYPES
// -----------------------------------------------------------------------------

export type RegistryId = string;
export type RegistryItemId = string;
export type FundId = string;
export type ContributionId = string;

/**
 * Create Registry Input
 */
export type CreateRegistryInput = Omit<
  GiftRegistry,
  'id' | 'createdAt' | 'updatedAt' | 'stats' | 'items'
>;

/**
 * Update Registry Input
 */
export type UpdateRegistryInput = Partial<CreateRegistryInput>;
