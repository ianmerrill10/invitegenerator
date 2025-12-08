// Prodigi Print API Client
// Documentation: https://www.prodigi.com/print-api/docs/reference/

import { PRODIGI_CONFIG, PRODIGI_PRODUCTS, type ProductId, type Currency } from "./config";

// Types for Prodigi API
export interface ProdigiRecipient {
  name: string;
  email?: string;
  phoneNumber?: string;
  address: {
    line1: string;
    line2?: string;
    postalOrZipCode: string;
    countryCode: string;
    townOrCity: string;
    stateOrCounty?: string;
  };
}

export interface ProdigiAsset {
  printArea: string;
  url: string;
  md5Hash?: string;
}

export interface ProdigiOrderItem {
  merchantReference?: string;
  sku: string;
  copies: number;
  sizing: "fillPrintArea" | "fitPrintArea" | "stretchToPrintArea";
  attributes?: Record<string, string>;
  recipientCost?: {
    amount: string;
    currency: string;
  };
  assets: ProdigiAsset[];
}

export interface ProdigiCreateOrderRequest {
  merchantReference?: string;
  shippingMethod: "Budget" | "Standard" | "StandardPlus" | "Express" | "Overnight";
  recipient: ProdigiRecipient;
  items: ProdigiOrderItem[];
  idempotencyKey?: string;
  callbackUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface ProdigiQuoteRequest {
  shippingMethod?: "Budget" | "Standard" | "StandardPlus" | "Express" | "Overnight";
  destinationCountryCode: string;
  currencyCode?: string;
  items: Array<{
    sku: string;
    copies: number;
    attributes?: Record<string, string>;
    assets: Array<{ printArea: string }>;
  }>;
}

export interface ProdigiCost {
  amount: string;
  currency: string;
}

export interface ProdigiQuoteItem {
  id: string;
  sku: string;
  copies: number;
  unitCost: ProdigiCost;
  attributes: Record<string, string>;
  assets: Array<{ printArea: string }>;
}

export interface ProdigiShipment {
  carrier: {
    name: string;
    service: string;
  };
  fulfillmentLocation: {
    countryCode: string;
    labCode: string;
  };
  cost: ProdigiCost;
  items: string[];
}

export interface ProdigiQuote {
  shipmentMethod: string;
  costSummary: {
    items: ProdigiCost;
    shipping: ProdigiCost;
  };
  shipments: ProdigiShipment[];
  items: ProdigiQuoteItem[];
}

export interface ProdigiQuoteResponse {
  outcome: string;
  quotes: ProdigiQuote[];
  issues?: Array<{
    errorCode: string;
    description: string;
  }>;
}

export interface ProdigiOrderStatus {
  stage: "InProgress" | "Complete" | "Cancelled";
  issues: Array<{
    objectId: string;
    errorCode: string;
    description: string;
  }>;
  details: {
    downloadAssets: string;
    printReadyAssetsPrepared: string;
    allocateProductionLocation: string;
    inProduction: string;
    shipping: string;
  };
}

export interface ProdigiOrder {
  id: string;
  created: string;
  lastUpdated: string;
  merchantReference?: string;
  shippingMethod: string;
  status: ProdigiOrderStatus;
  charges: Array<{
    id: string;
    prodigiInvoiceNumber?: string;
    totalCost: ProdigiCost;
  }>;
  shipments: Array<{
    id: string;
    status: string;
    carrier: { name: string; service: string };
    tracking?: { url: string; number: string };
    dispatchDate?: string;
  }>;
  recipient: ProdigiRecipient;
  items: Array<{
    id: string;
    status: string;
    sku: string;
    copies: number;
    assets: Array<{ id: string; status: string; url: string }>;
  }>;
}

export interface ProdigiOrderResponse {
  outcome: string;
  order: ProdigiOrder;
}

export interface ProdigiOrdersResponse {
  outcome: string;
  orders: ProdigiOrder[];
  hasMore: boolean;
  nextUrl?: string;
}

// Prodigi API Client
export class ProdigiClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey?: string, useSandbox: boolean = true) {
    this.apiKey = apiKey || PRODIGI_CONFIG.apiKey;
    this.baseUrl = useSandbox ? PRODIGI_CONFIG.sandboxApiUrl : PRODIGI_CONFIG.liveApiUrl;

    if (!this.apiKey) {
      throw new Error("Prodigi API key is required. Set PRODIGI_API_KEY environment variable.");
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        "X-API-Key": this.apiKey,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.statusText || `Prodigi API error: ${response.status}`
      );
    }

    return data;
  }

  // Get a quote for products
  async getQuote(request: ProdigiQuoteRequest): Promise<ProdigiQuoteResponse> {
    return this.request<ProdigiQuoteResponse>("/quotes", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  // Create an order
  async createOrder(request: ProdigiCreateOrderRequest): Promise<ProdigiOrderResponse> {
    return this.request<ProdigiOrderResponse>("/orders", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  // Get order by ID
  async getOrder(orderId: string): Promise<ProdigiOrderResponse> {
    return this.request<ProdigiOrderResponse>(`/orders/${orderId}`);
  }

  // Get all orders (with pagination)
  async getOrders(params?: {
    top?: number;
    skip?: number;
    status?: string;
  }): Promise<ProdigiOrdersResponse> {
    const queryParams = new URLSearchParams();
    if (params?.top) queryParams.set("top", params.top.toString());
    if (params?.skip) queryParams.set("skip", params.skip.toString());
    if (params?.status) queryParams.set("status", params.status);

    const query = queryParams.toString();
    return this.request<ProdigiOrdersResponse>(
      `/orders${query ? `?${query}` : ""}`
    );
  }

  // Cancel an order
  async cancelOrder(orderId: string): Promise<ProdigiOrderResponse> {
    return this.request<ProdigiOrderResponse>(
      `/orders/${orderId}/actions/cancel`,
      { method: "POST" }
    );
  }

  // Get product details
  async getProductDetails(sku: string): Promise<{
    outcome: string;
    product: {
      sku: string;
      description: string;
      productDimensions: { width: number; height: number; units: string };
      attributes: Record<string, string[]>;
      printAreas: Record<string, { required: boolean }>;
      variants: Array<{
        attributes: Record<string, string>;
        shipsTo: string[];
        printAreaSizes: Record<string, { horizontalResolution: number; verticalResolution: number }>;
      }>;
    };
  }> {
    return this.request(`/products/${sku}`);
  }
}

// Helper function to get quote for a product
export async function getProductQuote(
  productId: ProductId,
  quantity: number,
  countryCode: string,
  currency: Currency = "USD",
  shippingMethod?: "Budget" | "Standard" | "Express" | "Overnight"
): Promise<ProdigiQuoteResponse> {
  const client = new ProdigiClient();
  const product = PRODIGI_PRODUCTS[productId];

  return client.getQuote({
    shippingMethod,
    destinationCountryCode: countryCode,
    currencyCode: currency,
    items: [
      {
        sku: product.sku,
        copies: quantity,
        assets: [{ printArea: "default" }],
      },
    ],
  });
}

// Helper function to create order for printed items
export async function createPrintOrder(
  items: Array<{
    productId: ProductId;
    quantity: number;
    imageUrl: string;
    customerPrice?: number;
  }>,
  recipient: ProdigiRecipient,
  shippingMethod: "Budget" | "Standard" | "Express" | "Overnight" = "Standard",
  merchantReference?: string
): Promise<ProdigiOrderResponse> {
  const client = new ProdigiClient();

  const orderItems: ProdigiOrderItem[] = items.map((item) => {
    const product = PRODIGI_PRODUCTS[item.productId];
    return {
      sku: product.sku,
      copies: item.quantity,
      sizing: "fillPrintArea",
      assets: [
        {
          printArea: "default",
          url: item.imageUrl,
        },
      ],
      ...(item.customerPrice && {
        recipientCost: {
          amount: item.customerPrice.toFixed(2),
          currency: "USD",
        },
      }),
    };
  });

  return client.createOrder({
    merchantReference,
    shippingMethod,
    recipient,
    items: orderItems,
    idempotencyKey: merchantReference ? `${merchantReference}-${Date.now()}` : undefined,
  });
}

// Export singleton for convenience
export const prodigiClient = new ProdigiClient();
