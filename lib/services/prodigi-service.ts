/**
 * Prodigi Print-on-Demand Integration Service
 *
 * Prodigi is a global print-on-demand fulfillment service.
 * API Documentation: https://www.prodigi.com/print-api/docs/
 *
 * Key Features:
 * - Global fulfillment (US, UK, EU, AU)
 * - 250+ products including cards, invitations, stationery
 * - Automatic routing to nearest production facility
 * - White-label packaging
 * - Tracking and webhooks
 */

const PRODIGI_API_BASE = process.env.PRODIGI_API_URL || "https://api.prodigi.com/v4.0";
const PRODIGI_API_KEY = process.env.PRODIGI_API_KEY || "";

// Prodigi product SKUs for invitations and cards
export const PRODIGI_PRODUCTS = {
  // Flat Cards (single-sided)
  FLAT_CARD_4X6: "GLOBAL-FAC-4x6",
  FLAT_CARD_5X7: "GLOBAL-FAC-5x7",
  FLAT_CARD_A6: "GLOBAL-FAC-A6",
  FLAT_CARD_A5: "GLOBAL-FAC-A5",

  // Folded Cards (blank inside)
  FOLDED_CARD_5X7: "GLOBAL-FOC-5x7",
  FOLDED_CARD_A6: "GLOBAL-FOC-A6",

  // Postcards
  POSTCARD_4X6: "GLOBAL-POC-4x6",
  POSTCARD_A6: "GLOBAL-POC-A6",

  // Premium Cards (thicker stock)
  PREMIUM_CARD_4X6: "GLOBAL-PRC-4x6",
  PREMIUM_CARD_5X7: "GLOBAL-PRC-5x7",
} as const;

// Paper/finish options
export const PRODIGI_FINISHES = {
  MATTE: "matte",
  GLOSS: "gloss",
  LUSTER: "luster",
} as const;

// Shipping methods
export const PRODIGI_SHIPPING = {
  STANDARD: "Standard",
  EXPRESS: "Express",
  OVERNIGHT: "Overnight",
} as const;

export interface ProdigiAddress {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  countryCode: string; // ISO 3166-1 alpha-2
  phone?: string;
  email?: string;
}

export interface ProdigiOrderItem {
  sku: string;
  copies: number;
  sizing: "fillPrintArea" | "fitPrintArea" | "stretchToPrintArea";
  assets: {
    printArea: string; // URL to the image
  }[];
  attributes?: {
    finish?: string;
  };
}

export interface ProdigiOrder {
  merchantReference: string; // Your internal order ID
  shippingMethod: string;
  recipient: ProdigiAddress;
  items: ProdigiOrderItem[];
  metadata?: Record<string, string>;
}

export interface ProdigiQuoteRequest {
  shippingMethod: string;
  destinationCountryCode: string;
  currencyCode: string;
  items: {
    sku: string;
    copies: number;
    attributes?: {
      finish?: string;
    };
  }[];
}

export interface ProdigiQuoteResponse {
  outcome: "Created" | "CreatedWithIssues";
  quotes: {
    shipmentMethod: string;
    costSummary: {
      items: { cost: string; currency: string }[];
      shipping: { cost: string; currency: string };
      total: { cost: string; currency: string };
    };
  }[];
}

export interface ProdigiOrderResponse {
  outcome: "Created" | "CreatedWithIssues";
  order: {
    id: string;
    created: string;
    merchantReference: string;
    status: {
      stage: string;
      issues: string[];
      details: {
        downloadAssets: string;
        printReadyAssetsPrepared: string;
        allocateProductionLocation: string;
        inProduction: string;
        shipping: string;
      };
    };
    charges: {
      items: { cost: string; currency: string }[];
      shipping: { cost: string; currency: string };
      total: { cost: string; currency: string };
    };
    shipments: {
      id: string;
      carrier: { name: string; service: string };
      tracking: { number: string; url: string };
    }[];
  };
}

class ProdigiService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = PRODIGI_API_KEY;
    this.baseUrl = PRODIGI_API_BASE;
  }

  private async request<T>(
    endpoint: string,
    method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
    body?: unknown
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: {
        "X-API-Key": this.apiKey,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        `Prodigi API error: ${response.status} ${response.statusText} - ${JSON.stringify(error)}`
      );
    }

    return response.json();
  }

  /**
   * Get a shipping quote for an order
   */
  async getQuote(request: ProdigiQuoteRequest): Promise<ProdigiQuoteResponse> {
    return this.request<ProdigiQuoteResponse>("/quotes", "POST", request);
  }

  /**
   * Create a print order
   */
  async createOrder(order: ProdigiOrder): Promise<ProdigiOrderResponse> {
    return this.request<ProdigiOrderResponse>("/orders", "POST", order);
  }

  /**
   * Get order status
   */
  async getOrder(orderId: string): Promise<ProdigiOrderResponse> {
    return this.request<ProdigiOrderResponse>(`/orders/${orderId}`);
  }

  /**
   * Cancel an order (only if not yet in production)
   */
  async cancelOrder(orderId: string): Promise<void> {
    await this.request(`/orders/${orderId}/actions/cancel`, "POST");
  }

  /**
   * Get available products
   */
  async getProducts(): Promise<unknown> {
    return this.request("/products");
  }
}

export const prodigiService = new ProdigiService();

/**
 * Helper to convert our internal size format to Prodigi SKU
 */
export function getSKUForSize(
  size: string,
  type: "flat" | "folded" | "postcard" | "premium" = "flat"
): string {
  const sizeMap: Record<string, Record<string, string>> = {
    flat: {
      "4x6": PRODIGI_PRODUCTS.FLAT_CARD_4X6,
      "5x7": PRODIGI_PRODUCTS.FLAT_CARD_5X7,
      a6: PRODIGI_PRODUCTS.FLAT_CARD_A6,
      a5: PRODIGI_PRODUCTS.FLAT_CARD_A5,
    },
    folded: {
      "5x7": PRODIGI_PRODUCTS.FOLDED_CARD_5X7,
      a6: PRODIGI_PRODUCTS.FOLDED_CARD_A6,
    },
    postcard: {
      "4x6": PRODIGI_PRODUCTS.POSTCARD_4X6,
      a6: PRODIGI_PRODUCTS.POSTCARD_A6,
    },
    premium: {
      "4x6": PRODIGI_PRODUCTS.PREMIUM_CARD_4X6,
      "5x7": PRODIGI_PRODUCTS.PREMIUM_CARD_5X7,
    },
  };

  return sizeMap[type]?.[size.toLowerCase()] || PRODIGI_PRODUCTS.FLAT_CARD_5X7;
}

/**
 * Calculate retail price with markup
 * Prodigi gives us wholesale, we add our margin
 */
export function calculateRetailPrice(
  wholesaleCost: number,
  marginPercent: number = 40
): number {
  // Margin formula: retail = wholesale / (1 - margin)
  return Math.ceil((wholesaleCost / (1 - marginPercent / 100)) * 100) / 100;
}

/**
 * Standard invitation print pricing
 * These are suggested retail prices based on typical Prodigi wholesale costs
 */
export const PRINT_PRICING = {
  // Flat cards
  "flat-4x6": {
    base: 1.99, // Cost per card at 1 qty
    bulk25: 1.49, // Cost per card at 25+ qty
    bulk50: 1.29, // Cost per card at 50+ qty
    bulk100: 0.99, // Cost per card at 100+ qty
  },
  "flat-5x7": {
    base: 2.49,
    bulk25: 1.99,
    bulk50: 1.69,
    bulk100: 1.39,
  },
  // Folded cards (includes envelope)
  "folded-5x7": {
    base: 3.99,
    bulk25: 3.49,
    bulk50: 2.99,
    bulk100: 2.49,
  },
  // Premium cards (thick stock)
  "premium-5x7": {
    base: 3.49,
    bulk25: 2.99,
    bulk50: 2.49,
    bulk100: 1.99,
  },
};

/**
 * Get price per unit based on quantity
 */
export function getPricePerUnit(
  productType: keyof typeof PRINT_PRICING,
  quantity: number
): number {
  const pricing = PRINT_PRICING[productType];
  if (!pricing) return 2.99; // Default

  if (quantity >= 100) return pricing.bulk100;
  if (quantity >= 50) return pricing.bulk50;
  if (quantity >= 25) return pricing.bulk25;
  return pricing.base;
}

/**
 * Estimate shipping costs by region
 */
export const SHIPPING_ESTIMATES = {
  US: { standard: 4.99, express: 12.99, overnight: 29.99 },
  CA: { standard: 7.99, express: 19.99 },
  UK: { standard: 3.99, express: 9.99 },
  EU: { standard: 5.99, express: 14.99 },
  AU: { standard: 8.99, express: 24.99 },
  INTL: { standard: 12.99, express: 34.99 },
};

export function estimateShipping(
  countryCode: string,
  method: "standard" | "express" | "overnight" = "standard"
): number {
  let region: keyof typeof SHIPPING_ESTIMATES = "INTL";

  if (countryCode === "US") region = "US";
  else if (countryCode === "CA") region = "CA";
  else if (countryCode === "GB") region = "UK";
  else if (countryCode === "AU") region = "AU";
  else if (
    [
      "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE",
      "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT",
      "RO", "SK", "SI", "ES", "SE",
    ].includes(countryCode)
  ) {
    region = "EU";
  }

  const rates = SHIPPING_ESTIMATES[region];
  return rates[method as keyof typeof rates] || rates.standard;
}
