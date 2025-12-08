// Prodigi Print API Configuration
// Documentation: https://www.prodigi.com/print-api/docs/reference/

export const PRODIGI_CONFIG = {
  // API Environments
  sandboxApiUrl: "https://api.sandbox.prodigi.com/v4.0",
  liveApiUrl: "https://api.prodigi.com/v4.0",

  // Get the appropriate API URL based on environment
  get apiUrl() {
    return process.env.PRODIGI_ENVIRONMENT === "live"
      ? this.liveApiUrl
      : this.sandboxApiUrl;
  },

  // API Key from environment
  get apiKey() {
    return process.env.PRODIGI_API_KEY || "";
  },

  // Shipping methods
  shippingMethods: {
    budget: {
      id: "Budget",
      name: "Budget",
      description: "Economical shipping (7-14 business days)",
    },
    standard: {
      id: "Standard",
      name: "Standard",
      description: "Standard shipping (5-7 business days)",
    },
    express: {
      id: "Express",
      name: "Express",
      description: "Express shipping (2-4 business days)",
    },
    overnight: {
      id: "Overnight",
      name: "Overnight",
      description: "Next-day delivery where available",
    },
  },

  // Sizing options for image fitting
  sizingOptions: {
    fillPrintArea: "fillPrintArea",
    fitPrintArea: "fitPrintArea",
    stretchToPrintArea: "stretchToPrintArea",
  },

  // Supported currencies
  currencies: ["USD", "GBP", "EUR", "CAD", "AUD"],
  defaultCurrency: "USD",
} as const;

// Product catalog - all printable items we offer
export const PRODIGI_PRODUCTS = {
  // Main invitation products
  invitation: {
    id: "invitation",
    name: "Invitations",
    description: "Premium invitations with envelopes",
    sku: "GLOBAL-INV-148X148",
    category: "main",
    dimensions: { width: 148, height: 148, units: "mm" },
    recommendedResolution: { width: 1748, height: 1748 },
    includesEnvelope: true,
    paperWeight: "400gsm",
    minQuantity: 10,
    suggestedMarkup: 2.5, // Suggested retail markup multiplier
  },

  // Save the Date cards
  saveTheDate: {
    id: "saveTheDate",
    name: "Save the Date Cards",
    description: "Let guests know to mark their calendars",
    sku: "GLOBAL-GRC-A6",
    category: "pre-event",
    dimensions: { width: 105, height: 148, units: "mm" },
    recommendedResolution: { width: 1240, height: 1748 },
    includesEnvelope: true,
    paperWeight: "350gsm",
    minQuantity: 10,
    suggestedMarkup: 2.5,
  },

  // RSVP Cards
  rsvpCard: {
    id: "rsvpCard",
    name: "RSVP Cards",
    description: "Response cards for guests to confirm attendance",
    sku: "GLOBAL-GRC-A7",
    category: "main",
    dimensions: { width: 74, height: 105, units: "mm" },
    recommendedResolution: { width: 874, height: 1240 },
    includesEnvelope: true,
    paperWeight: "350gsm",
    minQuantity: 10,
    suggestedMarkup: 2.5,
  },

  // Thank You Cards
  thankYouCard: {
    id: "thankYouCard",
    name: "Thank You Cards",
    description: "Express gratitude to your guests",
    sku: "GLOBAL-GRC-A6",
    category: "post-event",
    dimensions: { width: 105, height: 148, units: "mm" },
    recommendedResolution: { width: 1240, height: 1748 },
    includesEnvelope: true,
    paperWeight: "350gsm",
    minQuantity: 10,
    suggestedMarkup: 2.5,
  },

  // Programs / Order of Service
  program: {
    id: "program",
    name: "Event Programs",
    description: "Order of service or event schedule",
    sku: "GLOBAL-GRC-A5",
    category: "event-day",
    dimensions: { width: 148, height: 210, units: "mm" },
    recommendedResolution: { width: 1748, height: 2480 },
    includesEnvelope: false,
    paperWeight: "350gsm",
    minQuantity: 10,
    suggestedMarkup: 2.0,
  },

  // Menu Cards
  menuCard: {
    id: "menuCard",
    name: "Menu Cards",
    description: "Elegant menu cards for your event",
    sku: "GLOBAL-GRC-DL",
    category: "event-day",
    dimensions: { width: 99, height: 210, units: "mm" },
    recommendedResolution: { width: 1169, height: 2480 },
    includesEnvelope: false,
    paperWeight: "350gsm",
    minQuantity: 10,
    suggestedMarkup: 2.0,
  },

  // Place Cards / Table Cards
  placeCard: {
    id: "placeCard",
    name: "Place Cards",
    description: "Personalized seating cards for tables",
    sku: "GLOBAL-GRC-A7",
    category: "event-day",
    dimensions: { width: 74, height: 105, units: "mm" },
    recommendedResolution: { width: 874, height: 1240 },
    includesEnvelope: false,
    paperWeight: "350gsm",
    minQuantity: 25,
    suggestedMarkup: 3.0,
  },

  // Table Numbers
  tableNumber: {
    id: "tableNumber",
    name: "Table Numbers",
    description: "Numbered cards for table identification",
    sku: "GLOBAL-GRC-SQ",
    category: "event-day",
    dimensions: { width: 125, height: 125, units: "mm" },
    recommendedResolution: { width: 1476, height: 1476 },
    includesEnvelope: false,
    paperWeight: "400gsm",
    minQuantity: 5,
    suggestedMarkup: 2.5,
  },

  // Photo Prints (for photo booths, favors, etc.)
  photoPrint: {
    id: "photoPrint",
    name: "Photo Prints",
    description: "High-quality photo prints for favors or displays",
    sku: "GLOBAL-PHO-4X6",
    category: "extras",
    dimensions: { width: 102, height: 152, units: "mm" },
    recommendedResolution: { width: 1200, height: 1800 },
    includesEnvelope: false,
    paperWeight: "300gsm",
    minQuantity: 10,
    suggestedMarkup: 2.0,
  },

  // Postcards (for destination events)
  postcard: {
    id: "postcard",
    name: "Postcards",
    description: "Perfect for destination event announcements",
    sku: "GLOBAL-PCD-A6",
    category: "pre-event",
    dimensions: { width: 105, height: 148, units: "mm" },
    recommendedResolution: { width: 1240, height: 1748 },
    includesEnvelope: false,
    paperWeight: "350gsm",
    minQuantity: 10,
    suggestedMarkup: 2.5,
  },

  // Stickers (for seals, favors, etc.)
  sticker: {
    id: "sticker",
    name: "Custom Stickers",
    description: "Envelope seals or favor stickers",
    sku: "GLOBAL-STK-CIR-50",
    category: "extras",
    dimensions: { width: 50, height: 50, units: "mm" },
    recommendedResolution: { width: 591, height: 591 },
    includesEnvelope: false,
    paperWeight: "n/a",
    minQuantity: 24,
    suggestedMarkup: 3.0,
  },
} as const;

// Product bundles for upselling
export const PRODUCT_BUNDLES = {
  wedding: {
    name: "Wedding Stationery Suite",
    description: "Complete wedding stationery package",
    products: ["saveTheDate", "invitation", "rsvpCard", "program", "menuCard", "placeCard", "thankYouCard"],
    discount: 0.1, // 10% bundle discount
  },
  birthday: {
    name: "Birthday Party Pack",
    description: "Everything for your birthday celebration",
    products: ["invitation", "thankYouCard"],
    discount: 0.05,
  },
  babyShower: {
    name: "Baby Shower Bundle",
    description: "Beautiful baby shower stationery",
    products: ["invitation", "thankYouCard"],
    discount: 0.05,
  },
  corporate: {
    name: "Corporate Event Suite",
    description: "Professional event materials",
    products: ["invitation", "program", "placeCard", "tableNumber"],
    discount: 0.1,
  },
} as const;

// Categories for display
export const PRODUCT_CATEGORIES = {
  "pre-event": {
    name: "Pre-Event",
    description: "Send before your event",
    order: 1,
  },
  "main": {
    name: "Main Stationery",
    description: "Essential event stationery",
    order: 2,
  },
  "event-day": {
    name: "Event Day",
    description: "For the day of your event",
    order: 3,
  },
  "post-event": {
    name: "Post-Event",
    description: "After your celebration",
    order: 4,
  },
  "extras": {
    name: "Extras & Add-ons",
    description: "Extra touches for your event",
    order: 5,
  },
} as const;

// Type exports
export type ShippingMethod = keyof typeof PRODIGI_CONFIG.shippingMethods;
export type SizingOption = keyof typeof PRODIGI_CONFIG.sizingOptions;
export type Currency = (typeof PRODIGI_CONFIG.currencies)[number];
export type ProductId = keyof typeof PRODIGI_PRODUCTS;
export type ProductCategory = keyof typeof PRODUCT_CATEGORIES;
export type BundleId = keyof typeof PRODUCT_BUNDLES;
