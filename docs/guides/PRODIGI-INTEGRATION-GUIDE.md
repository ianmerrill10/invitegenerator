# Prodigi Integration Guide

## Overview

InviteGenerator integrates with Prodigi to offer printed invitations, save-the-dates, and thank you cards. This guide covers the integration setup and usage.

---

## Current Integration Status

### ✅ Implemented
- Prodigi API client (`lib/prodigi/client.ts`)
- Product catalog configuration (`lib/prodigi/config.ts`)
- Order creation endpoint
- Shipping cost calculation
- Order status tracking

### 🔲 Not Yet Implemented
- Webhook handlers for order updates
- Print preview generation
- Direct checkout flow

---

## Product Catalog

### Available Products

| Product Type | SKU | Size | Price Range |
|-------------|-----|------|-------------|
| Flat Invitations | GLOBAL-FAC-5x7 | 5x7" | $0.50-1.50 |
| Flat Invitations | GLOBAL-FAC-A6 | A6 | $0.50-1.50 |
| Folded Cards | GLOBAL-FLD-5x7 | 5x7" | $0.75-2.00 |
| Postcards | GLOBAL-PSC-6x4 | 6x4" | $0.40-1.00 |
| Postcards | GLOBAL-PSC-A6 | A6 | $0.40-1.00 |
| Envelopes | ENV-C6 | C6 | $0.15-0.30 |
| Envelopes | ENV-5x7 | 5x7" | $0.15-0.30 |

### Paper Options
- Standard Matte (170gsm)
- Premium Matte (350gsm)
- Gloss (300gsm)
- Pearl (300gsm)
- Cotton (324gsm)
- Recycled (270gsm)

---

## API Configuration

### Environment Variables

```env
# Sandbox (for testing)
PRODIGI_API_KEY=your_sandbox_api_key
PRODIGI_ENVIRONMENT=sandbox

# Production (for live orders)
PRODIGI_API_KEY=your_live_api_key
PRODIGI_ENVIRONMENT=production
```

### API Endpoints

| Environment | Base URL |
|-------------|----------|
| Sandbox | https://api.sandbox.prodigi.com/v4.0 |
| Production | https://api.prodigi.com/v4.0 |

---

## Usage Examples

### Creating an Order

```typescript
import { ProdigiClient, createProdigiOrder } from '@/lib/prodigi/client';

const client = new ProdigiClient();

const order = await createProdigiOrder({
  userId: 'user-123',
  invitationId: 'inv-456',
  items: [
    {
      sku: 'GLOBAL-FAC-5x7',
      copies: 100,
      sizing: 'fillPrintArea',
      assets: [
        {
          printArea: 'default',
          url: 'https://invitegenerator.com/api/invitations/inv-456/render?format=pdf'
        }
      ]
    }
  ],
  recipient: {
    name: 'John Smith',
    address: {
      line1: '123 Main St',
      city: 'New York',
      stateOrCounty: 'NY',
      postalOrZipCode: '10001',
      countryCode: 'US'
    }
  },
  metadata: {
    orderId: 'internal-order-789',
    eventDate: '2025-06-15'
  }
});
```

### Getting Shipping Quote

```typescript
const quote = await client.getQuote({
  shippingMethod: 'standard',
  destinationCountryCode: 'US',
  items: [
    { sku: 'GLOBAL-FAC-5x7', copies: 100 }
  ]
});

console.log(quote.shipments[0].cost);
// { amount: '8.99', currency: 'USD' }
```

### Checking Order Status

```typescript
const status = await client.getOrder('ord_xxxxx');

console.log(status.status);
// 'Complete' | 'InProgress' | 'Cancelled' | 'AwaitingPayment'
```

---

## Order Flow

```
1. User designs invitation in editor
         ↓
2. User clicks "Order Prints"
         ↓
3. Select quantity and paper type
         ↓
4. Enter shipping address
         ↓
5. Calculate shipping cost (Prodigi API)
         ↓
6. User pays via Stripe
         ↓
7. Create order in Prodigi
         ↓
8. Prodigi prints and ships
         ↓
9. User receives tracking info
         ↓
10. Order delivered
```

---

## Webhook Setup (TODO)

### Registering Webhooks

```typescript
// In your deployment setup:
await client.registerWebhook({
  url: 'https://invitegenerator.com/api/webhooks/prodigi',
  events: [
    'order.created',
    'order.shipped',
    'order.completed',
    'order.cancelled'
  ]
});
```

### Webhook Endpoint

```typescript
// app/api/webhooks/prodigi/route.ts
export async function POST(request: Request) {
  const signature = request.headers.get('x-prodigi-signature');
  const body = await request.text();
  
  // Verify signature
  if (!verifyProdigiSignature(body, signature)) {
    return new Response('Invalid signature', { status: 401 });
  }
  
  const event = JSON.parse(body);
  
  switch (event.type) {
    case 'order.shipped':
      // Update order status in DynamoDB
      // Send tracking email to user
      break;
    case 'order.completed':
      // Mark as delivered
      break;
  }
  
  return new Response('OK');
}
```

---

## Pricing Strategy

### Markup Calculation

```typescript
const calculatePrice = (baseCost: number, quantity: number) => {
  const MARKUP_PERCENTAGE = 0.40; // 40% margin
  const PLATFORM_FEE = 2.00; // Flat platform fee
  
  const totalBaseCost = baseCost * quantity;
  const markup = totalBaseCost * MARKUP_PERCENTAGE;
  const customerPrice = totalBaseCost + markup + PLATFORM_FEE;
  
  return {
    baseCost: totalBaseCost,
    markup,
    platformFee: PLATFORM_FEE,
    customerPrice
  };
};
```

### Example Pricing

| Quantity | Base Cost | Our Price | Profit |
|----------|-----------|-----------|--------|
| 25 | $12.50 | $19.50 | $7.00 |
| 50 | $25.00 | $37.00 | $12.00 |
| 100 | $50.00 | $72.00 | $22.00 |
| 200 | $100.00 | $142.00 | $42.00 |

---

## Testing Checklist

### Sandbox Testing
- [ ] Can get product catalog
- [ ] Can calculate shipping quotes
- [ ] Can create test order
- [ ] Order appears in Prodigi dashboard
- [ ] Can retrieve order status
- [ ] Webhook events received (when implemented)

### Production Preparation
- [ ] Switch to production API key
- [ ] Verify pricing matches expectations
- [ ] Test with real address
- [ ] Confirm first real order manually

---

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | Invalid API key | Check PRODIGI_API_KEY |
| 422 Validation Error | Invalid request data | Check SKU, address format |
| 503 Service Unavailable | Prodigi API down | Retry with exponential backoff |

### Retry Strategy

```typescript
const withRetry = async (fn: () => Promise<any>, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
    }
  }
};
```

---

## Resources

- [Prodigi API Documentation](https://www.prodigi.com/print-api/docs/)
- [Prodigi Dashboard](https://dashboard.prodigi.com/)
- [Product Catalog](https://www.prodigi.com/products/)
- [Shipping Countries](https://www.prodigi.com/print-api/docs/shipping/)

---

*Last Updated: December 2024*
