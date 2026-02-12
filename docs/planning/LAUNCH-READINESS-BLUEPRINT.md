# InviteGenerator Launch Readiness Blueprint

**Generated:** December 27, 2025
**Current Status:** 72% Ready | NOT LAUNCH READY
**Estimated Work Remaining:** 30-42 hours (5-6 days full effort)

---

## Executive Summary

InviteGenerator has a **solid technical foundation** with professional architecture, proper security implementations, and complete core feature development. However, **critical revenue-generating features are incomplete**, making the platform unable to process payments reliably or fulfill print orders.

### Launch Blockers (Must Fix)
1. Stripe webhook handlers have 27 TODO items - payments won't process correctly
2. Email notification system not implemented - customers receive no communications
3. Canvas-to-image export missing - print orders use placeholder images
4. Import path error in webhook handler - will crash at runtime

### Key Metrics
- **83 API endpoints** (76 functional, 7 incomplete)
- **31 pages** (28 complete, 3 partial)
- **50+ UI components** (all functional)
- **Build Status:** PASSING
- **TypeScript:** Strict mode, 0 errors

---

## Part 1: Critical Blockers

### BLOCKER 1: Stripe Webhook Implementation
**Location:** `lib/webhooks/stripe-handler.ts`
**Impact:** Revenue pipeline completely broken
**Effort:** 4-6 hours

**27 TODO Items That Must Be Implemented:**

| Event | Missing Implementation |
|-------|----------------------|
| `payment_intent.succeeded` | Update order status, send confirmation email, trigger fulfillment, update analytics |
| `payment_intent.payment_failed` | Notify customer, update order status, send retry payment link |
| `customer.subscription.created` | Activate premium features, send welcome email, update user subscription status |
| `customer.subscription.updated` | Update subscription details, handle plan changes, update feature access |
| `customer.subscription.deleted` | Deactivate features, send cancellation email, update user status, trigger win-back campaign |
| `checkout.session.completed` | Create order in database, send order confirmation email, start fulfillment |
| `invoice.paid` | Extend subscription period, send invoice receipt |
| `invoice.payment_failed` | Notify customer, update subscription status, schedule payment retry |

**Additional Issues:**
- Idempotency checking not implemented (risk of duplicate charges)
- Import path error on line 208: `@/lib/prodigi/client` should be `@/lib/prodigi-client`

---

### BLOCKER 2: Email Notification System
**Impact:** Customers receive zero communications
**Effort:** 2-3 hours

**Required Email Templates:**
1. Order confirmation (print orders)
2. Payment success receipt
3. Payment failure notification
4. Subscription welcome email
5. Subscription cancellation confirmation
6. Shipment tracking notification
7. Print order status updates

**What Exists:**
- AWS SES configured in environment
- Email templates framework in `lib/email/`
- `sendPaymentFailedEmail()` partially implemented

**What's Missing:**
- SES domain verification
- Actual email sending implementation
- All template content

---

### BLOCKER 3: Canvas-to-Image Export
**Location:** `app/dashboard/invitations/[id]/order/page.tsx` line 222
**Impact:** Print orders ship with placeholder image instead of user's design
**Effort:** 3-4 hours

**Current Code:**
```typescript
// For now, we'll need an image URL - in production this would be generated from the canvas
const imageUrl = currentInvitation?.designData?.backgroundImage ||
  "https://placehold.co/1748x1748/D4919F/white?text=Invitation+Preview";
```

**Required:**
- Implement `html-to-image` export from design canvas
- Upload to S3 as print-ready file
- Pass S3 URL to Prodigi order

---

### BLOCKER 4: Import Path Error
**Location:** `lib/webhooks/stripe-handler.ts` line 208
**Impact:** Runtime crash on payment success
**Effort:** 5 minutes

**Current:**
```typescript
const { createPrintOrder } = await import("@/lib/prodigi/client");
```

**Fix:**
```typescript
const { createPrintOrder } = await import("@/lib/prodigi-client");
```

---

## Part 2: High Priority Items

### Item 1: Payment Idempotency
**Location:** `lib/webhooks/stripe-handler.ts` lines 236-247
**Impact:** Duplicate charges possible
**Effort:** 1-2 hours

**Current (non-functional):**
```typescript
async function isEventProcessed(eventId: string): Promise<boolean> {
  // TODO: Check database for processed event
  return false; // Always returns false!
}
```

**Required:**
- Create DynamoDB table or add to existing: `processed_webhook_events`
- Store: eventId, timestamp, eventType
- Check before processing any webhook
- TTL: 7 days

---

### Item 2: Stripe Price ID Configuration
**Impact:** Subscription checkout fails
**Effort:** 30 minutes

**Required Environment Variables:**
```env
STRIPE_PRICE_STARTER_MONTHLY=price_xxx
STRIPE_PRICE_STARTER_YEARLY=price_xxx
STRIPE_PRICE_PRO_MONTHLY=price_xxx
STRIPE_PRICE_PRO_YEARLY=price_xxx
STRIPE_PRICE_BUSINESS_MONTHLY=price_xxx
STRIPE_PRICE_BUSINESS_YEARLY=price_xxx
```

**Action:**
1. Create products in Stripe Dashboard
2. Copy price IDs to `.env.local`
3. Add to Vercel environment variables

---

### Item 3: Remove Console.log from Production
**Impact:** Log noise, potential info leakage
**Effort:** 1 hour

**40+ console.log statements found in:**
- `app/api/auth/login/route.ts`
- `app/api/auth/signup/route.ts`
- `app/api/affiliate/conversion/route.ts`
- `app/templates/page.tsx`
- `app/admin/page.tsx`
- `app/admin/templates/page.tsx`

**Action:** Replace with proper logger from `lib/logging/`

---

### Item 4: Fix TypeScript Any Types
**Impact:** Type safety, refactoring risk
**Effort:** 2 hours

**18+ locations with `any` type:**

| File | Line | Fix |
|------|------|-----|
| `components/rsvp/rsvp-form.tsx` | 133 | Define proper FormData value types |
| `app/i/[shortId]/rsvp/page.tsx` | 175 | Use union type for RSVPFormData values |
| `app/api/rsvp/[invitationId]/route.ts` | 539-600 | Define Invitation and RSVP interfaces |
| `app/dashboard/page.tsx` | 70 | Import Invitation type |

---

## Part 3: Medium Priority Items

### Item 1: Customer Order Dashboard
**Impact:** Customers can't view order history
**Effort:** 3-4 hours

**Required:**
- `GET /api/user/orders` - List user's orders
- `GET /api/user/orders/[id]` - Order detail with tracking
- `GET /api/user/orders/[id]/invoice` - Generate PDF invoice
- Dashboard page: `/dashboard/orders`

---

### Item 2: Subscription Management UI
**Impact:** Customers can't manage subscriptions
**Effort:** 2-3 hours

**Required:**
- View current plan and billing cycle
- Upgrade/downgrade plan
- Update payment method (Stripe customer portal link)
- Cancel subscription
- View invoices

---

### Item 3: Analytics Revenue Tracking
**Impact:** Can't measure business success
**Effort:** 2 hours

**Add to analytics events:**
- `payment_success` with amount
- `subscription_created` with plan and amount
- `subscription_upgraded` with new/old plan
- `subscription_cancelled` with reason
- Calculate MRR, ARR, churn rate

---

### Item 4: Prodigi Email Notifications
**Location:** `app/api/webhooks/prodigi/route.ts` line 125
**Impact:** Customers don't know when orders ship
**Effort:** 1 hour

**Implement:**
```typescript
async function sendOrderNotification(order: PrintOrder): Promise<void> {
  // Send email with tracking info when status is 'shipped'
}
```

---

## Part 4: Implementation Blueprint

### Phase 1: Fix Critical Blockers (Days 1-2)

**Day 1 (8 hours):**

| Time | Task | Files |
|------|------|-------|
| 0:00-0:05 | Fix import path error | `lib/webhooks/stripe-handler.ts:208` |
| 0:05-2:00 | Implement Stripe webhook handlers (payment_intent events) | `lib/webhooks/stripe-handler.ts` |
| 2:00-4:00 | Implement subscription webhook handlers | `lib/webhooks/stripe-handler.ts` |
| 4:00-5:00 | Implement webhook idempotency | `lib/webhooks/stripe-handler.ts` |
| 5:00-7:00 | SES domain verification + email template setup | `lib/email/`, AWS Console |
| 7:00-8:00 | Implement order confirmation email | `lib/email/templates/` |

**Day 2 (8 hours):**

| Time | Task | Files |
|------|------|-------|
| 0:00-3:00 | Implement canvas-to-image export | `app/dashboard/invitations/[id]/order/page.tsx` |
| 3:00-4:00 | S3 upload for print-ready images | `lib/s3.ts` |
| 4:00-5:00 | Connect export to Prodigi order flow | `lib/features/print-orders.ts` |
| 5:00-6:00 | Implement remaining email templates | `lib/email/templates/` |
| 6:00-7:00 | Configure Stripe price IDs | `.env.local`, Vercel |
| 7:00-8:00 | Test full payment flow end-to-end | Manual testing |

---

### Phase 2: High Priority Items (Day 3)

| Time | Task | Files |
|------|------|-------|
| 0:00-1:00 | Remove console.log from production code | Multiple API routes |
| 1:00-3:00 | Fix TypeScript any types | Listed files above |
| 3:00-5:00 | Implement customer order dashboard | `app/dashboard/orders/` |
| 5:00-7:00 | Implement subscription management UI | `app/dashboard/settings/` |
| 7:00-8:00 | Add revenue tracking to analytics | `lib/features/analytics.ts` |

---

### Phase 3: Testing & QA (Day 4)

| Time | Task |
|------|------|
| 0:00-2:00 | Test subscription creation/upgrade/cancel flow |
| 2:00-4:00 | Test print order flow with real Prodigi sandbox |
| 4:00-5:00 | Test email delivery for all templates |
| 5:00-6:00 | Test webhook idempotency (send duplicate events) |
| 6:00-7:00 | Test error scenarios (payment failure, network issues) |
| 7:00-8:00 | Fix any issues found |

---

### Phase 4: Security & Deployment (Day 5)

| Time | Task |
|------|------|
| 0:00-2:00 | Add security headers (CSP, HSTS, X-Frame-Options) |
| 2:00-3:00 | Review and rotate API credentials |
| 3:00-4:00 | Verify Stripe webhook endpoint in production |
| 4:00-5:00 | Deploy to Vercel production |
| 5:00-6:00 | Verify all environment variables |
| 6:00-7:00 | Run health check and smoke tests |
| 7:00-8:00 | Monitor logs for any errors |

---

## Part 5: LM Studio Prompts for Implementation

Per CLAUDE.md rules, all code must come from LM Studio. Here are the prompts to use:

### Prompt 1: Stripe Webhook Handler Implementation

```
You are implementing Stripe webhook handlers for InviteGenerator, a Next.js 14 invitation SaaS.

CONTEXT:
- File: lib/webhooks/stripe-handler.ts
- Database: AWS DynamoDB
- Tables: invitegenerator-users, invitegenerator-orders
- Email: AWS SES (already configured)

TASK: Implement the following functions that currently have TODO comments:

1. handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent)
   - Update order status to 'paid' in DynamoDB
   - Send confirmation email via SES
   - Log analytics event

2. handleCheckoutComplete(session: Stripe.Checkout.Session)
   - Create order record in DynamoDB if not exists
   - Extract customer email and line items
   - Send order confirmation email

3. handleSubscriptionCreated(subscription: Stripe.Subscription)
   - Update user record with subscription status
   - Activate premium features
   - Send welcome email

4. isEventProcessed(eventId: string) / markEventProcessed(eventId: string)
   - Store processed event IDs in DynamoDB with TTL
   - Prevent duplicate processing

REQUIREMENTS:
- Use existing DynamoDB client pattern (lazy initialization)
- Use existing email functions where available
- Full TypeScript types, no 'any'
- Proper error handling with try-catch
- Use logger from lib/logging instead of console.log

OUTPUT: Complete TypeScript implementation for each function.
```

### Prompt 2: Canvas to Image Export

```
You are implementing canvas-to-image export for print orders in InviteGenerator.

CONTEXT:
- File: app/dashboard/invitations/[id]/order/page.tsx
- Library available: html-to-image (already installed)
- Storage: AWS S3 bucket invitegenerator-templates-983101357971
- Print size: 1748x1748 pixels (for Prodigi 5x7" @ 300 DPI)

TASK: Create a function that:
1. Takes the invitation design canvas element
2. Converts it to a high-resolution PNG using html-to-image
3. Uploads the PNG to S3 with proper naming
4. Returns the S3 URL for use in Prodigi order

EXISTING PATTERNS:
```typescript
// S3 upload pattern from lib/s3.ts
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

let s3Client: S3Client | null = null;
function getS3Client(): S3Client {
  if (!s3Client) {
    s3Client = new S3Client({ region: process.env.AWS_REGION });
  }
  return s3Client;
}
```

REQUIREMENTS:
- Handle canvas scaling for print resolution
- Generate unique filename with invitationId and timestamp
- Set proper Content-Type for PNG
- Return public S3 URL
- Handle errors gracefully with user feedback
- TypeScript, no 'any' types

OUTPUT: Complete exportDesignForPrint function and S3 upload helper.
```

### Prompt 3: Email Templates

```
You are creating email templates for InviteGenerator transactional emails.

CONTEXT:
- Email service: AWS SES
- Sender: noreply@invitegenerator.com
- Brand colors: Primary #D4919F (rose), Secondary #1a1a1a (black)
- Logo: https://invitegenerator.com/logo.png

TASK: Create email template functions for:

1. sendOrderConfirmationEmail(order: PrintOrder, customerEmail: string)
   - Order number, items, total
   - Expected delivery timeframe
   - Support contact

2. sendPaymentSuccessEmail(payment: { amount: number, last4: string }, customerEmail: string)
   - Amount charged
   - Receipt/invoice link
   - Thank you message

3. sendShipmentNotificationEmail(order: PrintOrder, trackingUrl: string, customerEmail: string)
   - Order shipped message
   - Tracking link
   - Estimated delivery

4. sendSubscriptionWelcomeEmail(plan: string, customerEmail: string)
   - Welcome to [plan] plan
   - Feature highlights
   - Getting started tips

REQUIREMENTS:
- Use existing SES client pattern from lib/email/
- HTML email with inline CSS (email client compatible)
- Plain text fallback
- Responsive design
- TypeScript types for all parameters
- Proper error handling

OUTPUT: Complete email sending functions with HTML templates.
```

---

## Part 6: Verification Checklist

### Before Launch

- [ ] Stripe webhook handlers fully implemented
- [ ] All email templates working (test each one)
- [ ] Canvas export produces correct resolution images
- [ ] Print orders submit to Prodigi successfully
- [ ] Subscription flow works end-to-end
- [ ] Webhook idempotency prevents duplicates
- [ ] All console.log removed from production
- [ ] TypeScript any types fixed
- [ ] Security headers added
- [ ] Environment variables in Vercel

### Launch Day

- [ ] Deploy to production
- [ ] Verify Stripe webhook endpoint
- [ ] Test live payment (use real card, refund after)
- [ ] Verify emails delivered
- [ ] Check error logs
- [ ] Monitor first 24 hours

### Post-Launch Week 1

- [ ] Monitor analytics for conversion rates
- [ ] Check refund rate
- [ ] Review customer feedback
- [ ] Fix any reported issues
- [ ] Plan Phase 2 features

---

## Part 7: Risk Mitigation

### Payment Processing Risks

| Risk | Mitigation |
|------|------------|
| Duplicate charges | Implement idempotency checking |
| Failed fulfillment after payment | Queue system with retry |
| Refund delays | Clear refund policy, automated processing |
| Stripe account suspension | Follow Stripe guidelines, proper dispute handling |

### Print Fulfillment Risks

| Risk | Mitigation |
|------|------------|
| Wrong image printed | Preview confirmation before order |
| Prodigi API failure | Retry logic with exponential backoff |
| Shipping delays | Under-promise delivery dates |
| Quality issues | Prodigi sandbox testing first |

### Technical Risks

| Risk | Mitigation |
|------|------------|
| Webhook failures | Dead letter queue, alert monitoring |
| Email delivery issues | Verify SES domain, test deliverability |
| Performance under load | Start with invite-only beta |
| Security breach | Security audit before public launch |

---

## Summary

**Total Work Remaining:**
- Critical blockers: 12-17 hours
- High priority: 6-9 hours
- Testing/QA: 8-10 hours
- Deployment: 4-6 hours
- **Total: 30-42 hours**

**Recommended Timeline:**
- Days 1-2: Fix critical blockers
- Day 3: High priority items
- Day 4: Testing and QA
- Day 5: Security and deployment
- Days 6-7: Buffer for issues

**After completing this blueprint, InviteGenerator will be:**
- Processing payments reliably
- Fulfilling print orders correctly
- Communicating with customers via email
- Tracking revenue and analytics
- Ready for paying customers

---

*This blueprint should be executed using LM Studio for all code generation per project rules.*
