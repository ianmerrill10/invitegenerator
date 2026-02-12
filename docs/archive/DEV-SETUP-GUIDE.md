# InviteGenerator - Setup Guide (35 Easy Steps)

## PHASE 1: AWS INFRASTRUCTURE (Steps 1-10)
**Time: ~15 minutes**

### Step 1: Log into AWS
Go to https://console.aws.amazon.com and sign in.

### Step 2: Go to CloudFormation
1. In the search bar at top, type "CloudFormation"
2. Click on "CloudFormation"

### Step 3: Create Stack
1. Click the orange "Create stack" button
2. Select "With new resources (standard)"

### Step 4: Upload Template
1. Select "Upload a template file"
2. Click "Choose file"
3. Upload the file: `infrastructure/aws-cloudformation.yaml`
4. Click "Next"

### Step 5: Name Your Stack
1. Stack name: `InviteGenerator-Production`
2. AppDomain: Enter your domain (e.g., `invitegenerator.com`)
3. Click "Next"

### Step 6: Configure Stack Options
1. Leave everything as default
2. Click "Next"

### Step 7: Review and Create
1. Scroll to bottom
2. Check the box "I acknowledge that AWS CloudFormation might create IAM resources"
3. Click "Create stack"

### Step 8: Wait for Completion
1. Wait 3-5 minutes for status to show "CREATE_COMPLETE"
2. If it fails, check the "Events" tab for errors

### Step 9: Get Your Credentials
1. Click the "Outputs" tab
2. **COPY AND SAVE ALL VALUES** - You'll need them for .env.local:
   - UserPoolId
   - UserPoolClientId
   - S3BucketName
   - AccessKeyId
   - SecretAccessKey (⚠️ This only shows ONCE!)

### Step 10: Verify SES (Email)
1. Go to AWS SES (search "SES" in search bar)
2. Click "Verified identities" → "Create identity"
3. Select "Email address"
4. Enter your email (e.g., noreply@yourdomain.com)
5. Click "Create identity"
6. Check your email and click the verification link

---

## PHASE 2: STRIPE SETUP (Steps 11-18)
**Time: ~10 minutes**

### Step 11: Create Stripe Account
Go to https://stripe.com and sign up (or log in).

### Step 12: Get API Keys
1. Go to Developers → API Keys
2. Copy your "Publishable key" (starts with pk_)
3. Copy your "Secret key" (starts with sk_)

### Step 13: Create Products
1. Go to Products → Add Product
2. Create "Starter Plan":
   - Name: Starter
   - Monthly price: $9.99
   - Yearly price: $99.99
3. Save and copy the Price IDs

### Step 14: Create Pro Plan
1. Add Product → "Pro Plan"
   - Monthly: $19.99
   - Yearly: $199.99
2. Copy Price IDs

### Step 15: Create Business Plan
1. Add Product → "Business Plan"
   - Monthly: $49.99
   - Yearly: $499.99
2. Copy Price IDs

### Step 16: Set Up Webhook
1. Go to Developers → Webhooks
2. Click "Add endpoint"
3. URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select events:
   - checkout.session.completed
   - customer.subscription.updated
   - customer.subscription.deleted
   - invoice.paid
   - invoice.payment_failed
5. Click "Add endpoint"

### Step 17: Get Webhook Secret
1. Click on your new webhook
2. Click "Reveal" under Signing secret
3. Copy the secret (starts with whsec_)

### Step 18: Enable Live Mode
1. Toggle "Test mode" OFF when ready to go live
2. Complete Stripe's business verification

---

## PHASE 3: ENVIRONMENT SETUP (Steps 19-22)
**Time: ~5 minutes**

### Step 19: Create .env.local
1. Copy `.env.example` to `.env.local`
2. Open `.env.local` in a text editor

### Step 20: Fill in AWS Values
From CloudFormation Outputs (Step 9):
```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<your AccessKeyId>
AWS_SECRET_ACCESS_KEY=<your SecretAccessKey>
COGNITO_USER_POOL_ID=<your UserPoolId>
COGNITO_CLIENT_ID=<your UserPoolClientId>
S3_BUCKET_NAME=<your S3BucketName>
```

### Step 21: Fill in Stripe Values
From Stripe Dashboard (Steps 12-17):
```
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_PRICE_STARTER_MONTHLY=price_xxxxx
STRIPE_PRICE_STARTER_YEARLY=price_xxxxx
STRIPE_PRICE_PRO_MONTHLY=price_xxxxx
STRIPE_PRICE_PRO_YEARLY=price_xxxxx
STRIPE_PRICE_BUSINESS_MONTHLY=price_xxxxx
STRIPE_PRICE_BUSINESS_YEARLY=price_xxxxx
```

### Step 22: Set App URL
```
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

---

## PHASE 4: DEPLOY TO VERCEL (Steps 23-30)
**Time: ~10 minutes**

### Step 23: Create Vercel Account
Go to https://vercel.com and sign up with GitHub.

### Step 24: Push Code to GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 25: Import Project
1. In Vercel, click "Add New..." → "Project"
2. Select your GitHub repo "invitegenerator"
3. Click "Import"

### Step 26: Configure Build Settings
- Framework Preset: Next.js (auto-detected)
- Root Directory: ./
- Build Command: `npm run build`

### Step 27: Add Environment Variables
1. Click "Environment Variables"
2. Add ALL variables from your .env.local
3. One at a time, enter Name and Value

### Step 28: Deploy
1. Click "Deploy"
2. Wait 2-3 minutes for deployment

### Step 29: Add Custom Domain
1. Go to Project Settings → Domains
2. Enter your domain (e.g., invitegenerator.com)
3. Follow DNS instructions to point domain to Vercel

### Step 30: Verify Deployment
1. Visit your domain
2. Test signup/login
3. Test creating an invitation

---

## PHASE 5: FINAL SETUP (Steps 31-35)
**Time: ~5 minutes**

### Step 31: Update Stripe Webhook URL
1. Go back to Stripe → Webhooks
2. Update the endpoint URL to your real domain

### Step 32: Submit to Google Search Console
1. Go to https://search.google.com/search-console
2. Add your domain
3. Verify ownership
4. Submit sitemap: `https://yourdomain.com/sitemap.xml`

### Step 33: Test Everything
- [ ] Sign up works
- [ ] Login works
- [ ] Create invitation works
- [ ] RSVP works
- [ ] Payment works (use Stripe test mode first)

### Step 34: Switch Stripe to Live Mode
1. In Stripe, turn off "Test mode"
2. Update API keys in Vercel to live keys

### Step 35: 🎉 YOU'RE LIVE!
Start marketing your product!

---

## QUICK REFERENCE

### Vercel Environment Variables (all required):
```
NEXT_PUBLIC_APP_URL
AWS_REGION
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
COGNITO_USER_POOL_ID
COGNITO_CLIENT_ID
S3_BUCKET_NAME
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_PRICE_STARTER_MONTHLY
STRIPE_PRICE_STARTER_YEARLY
STRIPE_PRICE_PRO_MONTHLY
STRIPE_PRICE_PRO_YEARLY
STRIPE_PRICE_BUSINESS_MONTHLY
STRIPE_PRICE_BUSINESS_YEARLY
ADMIN_API_KEY
```

### Support
- AWS Issues: Check CloudFormation Events tab
- Stripe Issues: Check Stripe Dashboard → Logs
- Vercel Issues: Check Deployment → Functions logs

### Total Time: ~45 minutes
