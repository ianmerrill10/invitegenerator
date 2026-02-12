/**
 * Affiliate & Shopify Store Configuration
 *
 * Maps event types to relevant product categories and affiliate partners.
 * Used by the recommendation engine to generate personalised product
 * suggestions based on questionnaire data.
 *
 * MONETISATION STRATEGY:
 * - Shopify stores per event category (owned or partnership)
 * - Amazon Associates for general products
 * - Direct affiliate partnerships with vendors
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ShopifyStore {
  storeId: string;
  storeName: string;
  domain: string;
  categories: string[];
  affiliateCode: string;
}

export interface AffiliatePartner {
  id: string;
  name: string;
  type: "marketplace" | "retailer" | "print" | "service";
  baseUrl: string;
  affiliateTag: string;
  categories: string[];
  commission: number; // decimal, e.g. 0.04 = 4 %
}

export interface ProductCategoryConfig {
  category: string;
  products: string[];
}

// ---------------------------------------------------------------------------
// Shopify stores by event type
// ---------------------------------------------------------------------------

export const SHOPIFY_STORES: Record<string, ShopifyStore> = {
  birthday: {
    storeId: "birthday-party-supplies",
    storeName: "Birthday Party Supplies",
    domain: "birthdayparty.invitegenerator.com",
    categories: ["decorations", "tableware", "balloons", "party-favors", "cake-toppers"],
    affiliateCode: "INVGEN_BDAY",
  },
  wedding: {
    storeId: "wedding-essentials",
    storeName: "Wedding Essentials",
    domain: "wedding.invitegenerator.com",
    categories: ["decorations", "favors", "signage", "guest-books", "centerpieces"],
    affiliateCode: "INVGEN_WED",
  },
  baby_shower: {
    storeId: "baby-shower-shop",
    storeName: "Baby Shower Shop",
    domain: "babyshower.invitegenerator.com",
    categories: ["decorations", "games", "favors", "diaper-cakes", "gift-baskets"],
    affiliateCode: "INVGEN_BABY",
  },
  bridal_shower: {
    storeId: "bridal-shower-boutique",
    storeName: "Bridal Shower Boutique",
    domain: "bridalshower.invitegenerator.com",
    categories: ["decorations", "games", "sashes", "gifts", "favors"],
    affiliateCode: "INVGEN_BRIDAL",
  },
  graduation: {
    storeId: "graduation-celebration",
    storeName: "Graduation Celebration",
    domain: "graduation.invitegenerator.com",
    categories: ["decorations", "caps-tassels", "photo-props", "cake-toppers", "banners"],
    affiliateCode: "INVGEN_GRAD",
  },
  anniversary: {
    storeId: "anniversary-gifts",
    storeName: "Anniversary Gifts & Decor",
    domain: "anniversary.invitegenerator.com",
    categories: ["decorations", "gifts", "photo-frames", "candles", "flowers"],
    affiliateCode: "INVGEN_ANNIV",
  },
  corporate: {
    storeId: "corporate-events",
    storeName: "Corporate Event Supplies",
    domain: "corporate.invitegenerator.com",
    categories: ["name-badges", "banners", "promotional", "table-settings", "awards"],
    affiliateCode: "INVGEN_CORP",
  },
  holiday: {
    storeId: "holiday-party-shop",
    storeName: "Holiday Party Shop",
    domain: "holiday.invitegenerator.com",
    categories: ["christmas", "halloween", "thanksgiving", "easter", "valentines"],
    affiliateCode: "INVGEN_HOLIDAY",
  },
  dinner_party: {
    storeId: "dinner-party-essentials",
    storeName: "Dinner Party Essentials",
    domain: "dinnerparty.invitegenerator.com",
    categories: ["tableware", "linens", "candles", "wine-accessories", "serving"],
    affiliateCode: "INVGEN_DINNER",
  },
};

// ---------------------------------------------------------------------------
// Affiliate partner network
// ---------------------------------------------------------------------------

export const AFFILIATE_PARTNERS: AffiliatePartner[] = [
  {
    id: "amazon",
    name: "Amazon",
    type: "marketplace",
    baseUrl: "https://amazon.com",
    affiliateTag: process.env.AMAZON_AFFILIATE_TAG || "invitegen-20",
    categories: ["all"],
    commission: 0.04,
  },
  {
    id: "etsy",
    name: "Etsy",
    type: "marketplace",
    baseUrl: "https://etsy.com",
    affiliateTag: process.env.ETSY_AFFILIATE_ID || "",
    categories: ["custom", "handmade", "personalized"],
    commission: 0.04,
  },
  {
    id: "partycity",
    name: "Party City",
    type: "retailer",
    baseUrl: "https://partycity.com",
    affiliateTag: process.env.PARTYCITY_AFFILIATE_ID || "",
    categories: ["decorations", "costumes", "tableware", "balloons"],
    commission: 0.05,
  },
  {
    id: "orientaltrading",
    name: "Oriental Trading",
    type: "retailer",
    baseUrl: "https://orientaltrading.com",
    affiliateTag: process.env.ORIENTAL_AFFILIATE_ID || "",
    categories: ["bulk-supplies", "decorations", "favors"],
    commission: 0.06,
  },
  {
    id: "michaels",
    name: "Michaels",
    type: "retailer",
    baseUrl: "https://michaels.com",
    affiliateTag: process.env.MICHAELS_AFFILIATE_ID || "",
    categories: ["crafts", "decorations", "diy"],
    commission: 0.04,
  },
  {
    id: "zazzle",
    name: "Zazzle",
    type: "print",
    baseUrl: "https://zazzle.com",
    affiliateTag: process.env.ZAZZLE_AFFILIATE_ID || "",
    categories: ["custom", "printed", "personalized"],
    commission: 0.15,
  },
  {
    id: "vistaprint",
    name: "VistaPrint",
    type: "print",
    baseUrl: "https://vistaprint.com",
    affiliateTag: process.env.VISTAPRINT_AFFILIATE_ID || "",
    categories: ["printed", "signage", "banners"],
    commission: 0.08,
  },
  {
    id: "shutterfly",
    name: "Shutterfly",
    type: "print",
    baseUrl: "https://shutterfly.com",
    affiliateTag: process.env.SHUTTERFLY_AFFILIATE_ID || "",
    categories: ["photo", "cards", "gifts"],
    commission: 0.08,
  },
];

// ---------------------------------------------------------------------------
// Static product recommendations by event type
// ---------------------------------------------------------------------------

export const PRODUCT_RECOMMENDATIONS: Record<string, ProductCategoryConfig[]> = {
  birthday: [
    { category: "Decorations", products: ["balloons", "banners", "streamers", "table-centerpieces"] },
    { category: "Tableware", products: ["plates", "cups", "napkins", "tablecloths"] },
    { category: "Party Favors", products: ["goodie-bags", "candy", "small-toys", "stickers"] },
    { category: "Cake Supplies", products: ["cake-toppers", "candles", "cake-stands", "serving-sets"] },
    { category: "Games & Activities", products: ["pinatas", "party-games", "photo-props", "crafts"] },
  ],
  wedding: [
    { category: "Decorations", products: ["centerpieces", "fairy-lights", "flower-arrangements", "candles"] },
    { category: "Guest Favors", products: ["personalized-favors", "candy-boxes", "thank-you-tags"] },
    { category: "Signage", products: ["welcome-signs", "seating-charts", "table-numbers", "directional"] },
    { category: "Photo", products: ["guest-books", "photo-booths", "polaroid-frames", "hashtag-signs"] },
    { category: "Ceremony", products: ["aisle-runners", "pew-bows", "unity-candles", "ring-pillows"] },
  ],
  baby_shower: [
    { category: "Decorations", products: ["balloons", "banners", "centerpieces", "backdrops"] },
    { category: "Games", products: ["bingo", "word-games", "guess-games", "advice-cards"] },
    { category: "Favors", products: ["mini-bottles", "soap", "candles", "candy"] },
    { category: "Gifts", products: ["diaper-cakes", "gift-baskets", "onesies", "blankets"] },
    { category: "Tableware", products: ["plates", "cups", "napkins", "cake-toppers"] },
  ],
  graduation: [
    { category: "Decorations", products: ["balloons", "banners", "photo-displays", "centerpieces"] },
    { category: "Photo Props", products: ["frames", "signs", "selfie-props", "backdrops"] },
    { category: "Cake", products: ["toppers", "serving-sets", "cake-picks", "cupcake-wrappers"] },
    { category: "Party Supplies", products: ["plates", "cups", "napkins", "tablecloths"] },
    { category: "Gifts", products: ["cards", "money-holders", "keepsakes", "jewelry"] },
  ],
  anniversary: [
    { category: "Decorations", products: ["candles", "photo-frames", "flower-arrangements", "banners"] },
    { category: "Gifts", products: ["personalized-gifts", "jewelry", "photo-books", "keepsakes"] },
    { category: "Tableware", products: ["champagne-flutes", "plates", "napkins", "table-runners"] },
  ],
  corporate: [
    { category: "Branding", products: ["name-badges", "banners", "branded-pens", "lanyards"] },
    { category: "Table Settings", products: ["table-tents", "menus", "placards", "centerpieces"] },
    { category: "Awards", products: ["trophies", "plaques", "certificates", "gift-cards"] },
  ],
  holiday: [
    { category: "Decorations", products: ["lights", "ornaments", "wreaths", "banners"] },
    { category: "Tableware", products: ["themed-plates", "cups", "napkins", "tablecloths"] },
    { category: "Gifts", products: ["gift-wrap", "stockings", "gift-tags", "ornaments"] },
  ],
  dinner_party: [
    { category: "Tableware", products: ["plates", "glasses", "napkins", "placemats"] },
    { category: "Candles & Ambiance", products: ["candles", "fairy-lights", "lanterns", "votives"] },
    { category: "Serving", products: ["serving-boards", "wine-accessories", "pitchers", "trays"] },
  ],
};

// ---------------------------------------------------------------------------
// Quantity multipliers (guest count -> order quantity)
// ---------------------------------------------------------------------------

export const QUANTITY_MULTIPLIERS: Record<string, number> = {
  plates: 1.2,
  cups: 2,
  napkins: 2.5,
  balloons: 0.5,
  favors: 1.1,
  centerpieces: 0.1,
};

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

/**
 * Build an affiliate link by appending the partner's tag and UTM params.
 */
export function getAffiliateLink(
  partnerId: string,
  productUrl: string,
  eventType?: string
): string {
  const partner = AFFILIATE_PARTNERS.find((p) => p.id === partnerId);
  if (!partner) return productUrl;

  const url = new URL(productUrl);

  switch (partnerId) {
    case "amazon":
      url.searchParams.set("tag", partner.affiliateTag);
      break;
    case "etsy":
      url.searchParams.set("ref", partner.affiliateTag);
      break;
    default:
      url.searchParams.set("aff", partner.affiliateTag);
  }

  url.searchParams.set("utm_source", "invitegenerator");
  url.searchParams.set("utm_medium", "affiliate");
  if (eventType) {
    url.searchParams.set("utm_campaign", eventType);
  }

  return url.toString();
}

/**
 * Calculate recommended order quantity based on guest count.
 */
export function getRecommendedQuantity(
  product: string,
  guestCount: number
): number {
  const multiplier = QUANTITY_MULTIPLIERS[product] || 1;
  return Math.ceil(guestCount * multiplier);
}

/**
 * Get the Shopify store config for an event type (falls back to birthday).
 */
export function getStoreForEventType(eventType: string): ShopifyStore | null {
  return SHOPIFY_STORES[eventType] || SHOPIFY_STORES["birthday"] || null;
}

/**
 * Get static product recommendations for an event type.
 */
export function getProductRecommendations(eventType: string): ProductCategoryConfig[] {
  return PRODUCT_RECOMMENDATIONS[eventType] || PRODUCT_RECOMMENDATIONS["birthday"] || [];
}
