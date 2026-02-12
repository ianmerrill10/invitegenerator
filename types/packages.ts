// =============================================================================
// INVITATION PACKAGES - TYPE DEFINITIONS
// InviteGenerator.com
// =============================================================================

// -----------------------------------------------------------------------------
// ENUMS
// -----------------------------------------------------------------------------

export enum PackageCategory {
  WEDDING = 'wedding',
  BIRTHDAY = 'birthday',
  BABY = 'baby',
  GRADUATION = 'graduation',
  HOLIDAY = 'holiday',
  CORPORATE = 'corporate',
  RELIGIOUS = 'religious',
  SPECIAL = 'special'
}

export enum PackageTier {
  STARTER = 'starter',
  CLASSIC = 'classic',
  DELUXE = 'deluxe',
  ULTIMATE = 'ultimate'
}

export enum ItemCategory {
  INVITATION = 'invitation',
  DECORATION = 'decoration',
  PARTY_SUPPLIES = 'party_supplies',
  GAMES = 'games',
  PHOTO = 'photo',
  KEEPSAKE = 'keepsake',
  TABLEWARE = 'tableware',
  WEARABLE = 'wearable',
  STATIONERY = 'stationery'
}

export enum PaperType {
  STANDARD = 'standard',
  PREMIUM = 'premium',
  CARDSTOCK = 'cardstock',
  LINEN = 'linen',
  COTTON = 'cotton'
}

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  PRINTING = 'printing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

// -----------------------------------------------------------------------------
// CORE PACKAGE INTERFACES
// -----------------------------------------------------------------------------

/**
 * Main Package Definition
 */
export interface InvitationPackage {
  id: string;
  name: string;
  slug: string;
  category: PackageCategory;
  tier: PackageTier;
  description: string;
  shortDescription: string;
  basePrice: number;
  curationFee: number;
  items: PackageItem[];
  invitationConfig: InvitationConfig;
  images: PackageImage[];
  popularity: number;
  reviewCount: number;
  averageRating: number;
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  seasonalAvailability?: SeasonalAvailability;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Individual Item within a Package
 */
export interface PackageItem {
  id: string;
  packageId: string;
  name: string;
  description: string;
  amazonAsin: string;
  affiliateLink: string;
  basePrice: number;
  imageUrl: string;
  thumbnailUrl: string;
  isRequired: boolean;        // Some items can't be removed (invitations)
  isSelected: boolean;        // Default true, user can toggle
  category: ItemCategory;
  weight: number;             // For curation fee distribution (1-10 scale)
  sortOrder: number;
  amazonCategory: string;     // For commission tracking
  estimatedCommission: number;// Percentage
}

/**
 * Invitation Configuration within Package
 */
export interface InvitationConfig {
  quantity: number;
  costPerUnit: number;
  designTemplateId?: string;
  paperType: PaperType;
  includesEnvelopes: boolean;
  customizationOptions: CustomizationOption[];
}

/**
 * Customization Options for Invitations
 */
export interface CustomizationOption {
  id: string;
  name: string;
  type: 'text' | 'color' | 'image' | 'font' | 'layout';
  isRequired: boolean;
  defaultValue?: string;
  options?: string[];
  additionalCost: number;
}

/**
 * Package Images
 */
export interface PackageImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
  sortOrder: number;
}

/**
 * Seasonal Availability
 */
export interface SeasonalAvailability {
  startMonth: number;  // 1-12
  endMonth: number;    // 1-12
  isYearRound: boolean;
}

// -----------------------------------------------------------------------------
// USER CUSTOMIZATION INTERFACES
// -----------------------------------------------------------------------------

/**
 * User's Customized Package Selection
 */
export interface CustomizedPackage {
  id: string;
  userId: string;
  packageId: string;
  selectedItemIds: string[];
  removedItemIds: string[];
  calculatedPrice: number;
  invitationQuantity: number;
  customizations: PackageCustomizations;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Package Customizations
 */
export interface PackageCustomizations {
  invitationDesignId?: string;
  eventDetails: EventDetails;
  paperUpgrade?: PaperType;
  additionalQuantity: number;
  personalizations: Record<string, string>;
}

/**
 * Event Details for Invitation
 */
export interface EventDetails {
  eventName: string;
  hostNames: string;
  eventDate: Date;
  eventTime: string;
  venueName: string;
  venueAddress: string;
  rsvpDeadline?: Date;
  rsvpContact?: string;
  additionalInfo?: string;
}

// -----------------------------------------------------------------------------
// PRICING INTERFACES
// -----------------------------------------------------------------------------

/**
 * Complete Price Breakdown
 */
export interface PriceBreakdown {
  invitationsCost: number;
  selectedItemsTotal: number;
  curationFee: number;
  paperUpgradeCost: number;
  additionalQuantityCost: number;
  subtotal: number;
  estimatedShipping: number;
  tax: number;
  total: number;
  savings: number;              // Compared to buying separately
  savingsPercentage: number;
  affiliateValue: number;       // Internal tracking
}

/**
 * Shipping Estimate
 */
export interface ShippingEstimate {
  method: 'standard' | 'express' | 'priority';
  carrier: string;
  estimatedDays: number;
  cost: number;
  trackingAvailable: boolean;
}

// -----------------------------------------------------------------------------
// ORDER INTERFACES
// -----------------------------------------------------------------------------

/**
 * Package Order
 */
export interface PackageOrder {
  id: string;
  orderNumber: string;
  userId: string;
  customizedPackageId: string;
  status: OrderStatus;
  priceBreakdown: PriceBreakdown;
  shippingAddress: ShippingAddress;
  billingAddress: ShippingAddress;
  shippingMethod: ShippingEstimate;
  paymentIntentId: string;
  amazonCartUrl?: string;       // For affiliate items
  printOrderId?: string;        // From print partner
  trackingNumbers: TrackingInfo[];
  notes: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

/**
 * Shipping Address
 */
export interface ShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

/**
 * Tracking Information
 */
export interface TrackingInfo {
  carrier: string;
  trackingNumber: string;
  type: 'invitations' | 'amazon_items';
  url: string;
  status: string;
  estimatedDelivery?: Date;
}

// -----------------------------------------------------------------------------
// ANALYTICS INTERFACES
// -----------------------------------------------------------------------------

/**
 * Package Analytics
 */
export interface PackageAnalytics {
  packageId: string;
  views: number;
  addedToCart: number;
  purchases: number;
  conversionRate: number;
  averageCustomizationValue: number;
  mostRemovedItems: ItemRemovalStat[];
  mostAddedItems: ItemAdditionStat[];
  revenueGenerated: number;
  affiliateEarnings: number;
  periodStart: Date;
  periodEnd: Date;
}

/**
 * Item Removal Statistics
 */
export interface ItemRemovalStat {
  itemId: string;
  itemName: string;
  removalCount: number;
  removalPercentage: number;
}

/**
 * Item Addition Statistics
 */
export interface ItemAdditionStat {
  itemId: string;
  itemName: string;
  additionCount: number;
  additionPercentage: number;
}

// -----------------------------------------------------------------------------
// API RESPONSE INTERFACES
// -----------------------------------------------------------------------------

/**
 * Package List Response
 */
export interface PackageListResponse {
  packages: InvitationPackage[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * Price Calculation Request
 */
export interface PriceCalculationRequest {
  packageId: string;
  selectedItemIds: string[];
  invitationQuantity: number;
  paperUpgrade?: PaperType;
  shippingZip?: string;
}

/**
 * Price Calculation Response
 */
export interface PriceCalculationResponse {
  breakdown: PriceBreakdown;
  shippingOptions: ShippingEstimate[];
  itemDetails: SelectedItemDetail[];
}

/**
 * Selected Item Detail
 */
export interface SelectedItemDetail {
  item: PackageItem;
  isIncluded: boolean;
  priceImpact: number;
  curationFeeImpact: number;
}

// -----------------------------------------------------------------------------
// FILTER/SEARCH INTERFACES
// -----------------------------------------------------------------------------

/**
 * Package Search Filters
 */
export interface PackageFilters {
  categories?: PackageCategory[];
  tiers?: PackageTier[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  tags?: string[];
  searchQuery?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'popularity' | 'rating' | 'newest';
  page?: number;
  pageSize?: number;
}

// -----------------------------------------------------------------------------
// HELPER TYPES
// -----------------------------------------------------------------------------

export type PackageId = string;
export type ItemId = string;
export type UserId = string;
export type OrderId = string;

/**
 * Create Package Input (for admin)
 */
export type CreatePackageInput = Omit<
  InvitationPackage,
  'id' | 'createdAt' | 'updatedAt' | 'popularity' | 'reviewCount' | 'averageRating'
>;

/**
 * Update Package Input (for admin)
 */
export type UpdatePackageInput = Partial<CreatePackageInput>;

/**
 * Create Item Input
 */
export type CreateItemInput = Omit<PackageItem, 'id'>;

/**
 * Update Item Input
 */
export type UpdateItemInput = Partial<CreateItemInput>;
