# Stripe Setup Guide for InviteGenerator

## Step 1: Create Stripe Account (5 minutes)

1. Go to **https://dashboard.stripe.com/register**
2. Enter your email: `ianmerrill10@gmail.com`
3. Create a password
4. Verify your email
5. You're now in the Stripe Dashboard

---

## Step 2: Get Your API Keys (2 minutes)

1. In Stripe Dashboard, click **Developers** (top right)
2. Click **API keys**
3. You'll see two keys:
   - **Publishable key**: `pk_test_...` (starts with pk_test)
   - **Secret key**: Click "Reveal test key" → `sk_test_...`

4. Copy both keys somewhere safe

**Important:** Right now you're in TEST MODE (toggle at top says "Test mode"). This is correct for now.

---

## Step 3: Create Your Products (10 minutes)

### Product 1: Credit Packs

1. Click **Products** in left sidebar
2. Click **+ Add product**
3. Fill in:
   - **Name:** `5 AI Generation Credits`
   - **Description:** `Generate 5 unique AI invitation designs`
   - **Price:** `$2.99` / One time
4. Click **Save product**
5. **Copy the Price ID** (looks like `price_1ABC123...`) - you'll need this

Repeat for other credit packs:
- **15 AI Generation Credits** - $6.99
- **50 AI Generation Credits** - $14.99

### Product 2: Pro Subscription

1. Click **+ Add product**
2. Fill in:
   - **Name:** `InviteGenerator Pro`
   - **Description:** `Unlimited AI generations, no watermarks, premium templates`
   - **Price:** `$9.99` / Recurring / Monthly
3. Click **Save product**
4. **Copy the Price ID**

---

## Step 4: Set Up Webhook (5 minutes)

1. Click **Developers** → **Webhooks**
2. Click **+ Add endpoint**
3. Enter:
   - **Endpoint URL:** `https://invitegenerator.com/api/webhooks/stripe`
   - **Description:** `Production webhook`
4. Under "Select events to listen to", click **+ Select events**
5. Check these events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
   - `invoice.paid`
6. Click **Add endpoint**
7. On the webhook page, click **Reveal** under "Signing secret"
8. **Copy the signing secret** (starts with `whsec_...`)

---

## Step 5: Add Environment Variables

Add these to your `.env.local` file:

```env
# Stripe Keys (TEST MODE - switch to live when ready)
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE

# Price IDs (from Step 3)
STRIPE_PRICE_5_CREDITS=price_YOUR_5_CREDITS_PRICE_ID
STRIPE_PRICE_15_CREDITS=price_YOUR_15_CREDITS_PRICE_ID
STRIPE_PRICE_50_CREDITS=price_YOUR_50_CREDITS_PRICE_ID
STRIPE_PRICE_PRO_MONTHLY=price_YOUR_PRO_SUBSCRIPTION_PRICE_ID
```

---

## Step 6: Add to Vercel

1. Go to https://vercel.com/ian-merrills-projects/invitegenerator/settings/environment-variables
2. Add each variable:
   - `STRIPE_SECRET_KEY` → your sk_test key
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` → your pk_test key
   - `STRIPE_WEBHOOK_SECRET` → your whsec_ secret
   - Each price ID variable

---

## Step 7: Test Payment Flow

1. Deploy: `vercel --prod`
2. Go to your site and try to buy credits
3. Use test card: `4242 4242 4242 4242`
   - Any future date for expiry
   - Any 3 digits for CVC
   - Any zip code
4. Check Stripe Dashboard → Payments to see the test payment

---

## Step 8: Go Live (When Ready!)

**Only do this when you're ready to accept real money:**

1. In Stripe Dashboard, click **Activate your account** (or look for the banner)
2. Fill in:
   - Business information (your name, address)
   - Bank account for payouts
   - Tax information (SSN or EIN)
3. Once approved (usually instant), toggle off "Test mode" at the top
4. Get your **LIVE** API keys (they start with `pk_live_` and `sk_live_`)
5. Update your environment variables in Vercel with the live keys
6. Create a new webhook endpoint for production with live signing secret
7. Redeploy

---

## Quick Reference: Test Cards

| Card Number | Result |
|-------------|--------|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 0002 | Declined |
| 4000 0000 0000 3220 | 3D Secure required |

---

## Troubleshooting

### "No such price" error
- Make sure you copied the Price ID correctly (not the Product ID)
- Price IDs start with `price_`, Product IDs start with `prod_`

### Webhook not receiving events
- Check the endpoint URL is exactly `https://invitegenerator.com/api/webhooks/stripe`
- Make sure you deployed after adding the webhook secret
- Check Stripe Dashboard → Developers → Webhooks → click your endpoint → see failed attempts

### Payments stuck in "pending"
- Usually means webhook isn't processing
- Check Vercel logs for errors
- Verify STRIPE_WEBHOOK_SECRET is correct

---

## Summary Checklist

- [ ] Created Stripe account
- [ ] Got test API keys (pk_test, sk_test)
- [ ] Created 4 products (3 credit packs + 1 subscription)
- [ ] Copied all 4 Price IDs
- [ ] Created webhook endpoint
- [ ] Copied webhook signing secret
- [ ] Added all env vars to .env.local
- [ ] Added all env vars to Vercel
- [ ] Tested with test card 4242...
- [ ] (Later) Activated account for live payments
- [ ] (Later) Switched to live API keys

---

**Need help?** Just ask - I can walk you through any step!
