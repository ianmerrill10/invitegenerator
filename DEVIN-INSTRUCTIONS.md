# InviteGenerator - Deployment Instructions for Devin

## Overview
Deploy InviteGenerator, a digital invitation SaaS platform built with Next.js 14, to production using AWS and Vercel.

## Tech Stack
- **Frontend/Backend**: Next.js 14 (App Router)
- **Database**: AWS DynamoDB
- **Auth**: AWS Cognito
- **Storage**: AWS S3
- **Email**: AWS SES
- **Payments**: Stripe
- **Hosting**: Vercel

---

## STEP 1: Deploy AWS Infrastructure

### 1.1 Deploy CloudFormation Stack
```bash
# Navigate to project directory
cd /path/to/invitegenerator

# Deploy AWS infrastructure (creates all DynamoDB tables, S3, Cognito, IAM)
aws cloudformation create-stack \
    --stack-name InviteGenerator-Production \
    --template-body file://infrastructure/aws-cloudformation.yaml \
    --parameters ParameterKey=AppDomain,ParameterValue=YOUR_DOMAIN.com \
    --capabilities CAPABILITY_NAMED_IAM \
    --region us-east-1

# Wait for completion (3-5 minutes)
aws cloudformation wait stack-create-complete \
    --stack-name InviteGenerator-Production \
    --region us-east-1
```

### 1.2 Get CloudFormation Outputs
```bash
# Get all the credentials you need
aws cloudformation describe-stacks \
    --stack-name InviteGenerator-Production \
    --region us-east-1 \
    --query 'Stacks[0].Outputs' \
    --output table
```

**Save these values:**
- UserPoolId
- UserPoolClientId
- S3BucketName
- AccessKeyId
- SecretAccessKey (only shown once!)

### 1.3 Get Cognito Client Secret
```bash
# Get the User Pool Client Secret (needed for OAuth)
aws cognito-idp describe-user-pool-client \
    --user-pool-id <UserPoolId-from-above> \
    --client-id <UserPoolClientId-from-above> \
    --region us-east-1 \
    --query 'UserPoolClient.ClientSecret'
```

---

## STEP 2: Configure SES (Email)

### 2.1 Verify Email Domain or Address
```bash
# Verify domain (recommended for production)
aws ses verify-domain-identity --domain YOUR_DOMAIN.com --region us-east-1

# OR verify single email address for testing
aws ses verify-email-identity --email-address noreply@YOUR_DOMAIN.com --region us-east-1
```

### 2.2 Request Production Access
- Go to AWS SES Console > Account dashboard
- Request to move out of sandbox mode (required to send emails to anyone)

---

## STEP 3: Set Up Stripe

### 3.1 Create Products in Stripe Dashboard
Go to https://dashboard.stripe.com/products and create:

1. **Starter Plan**
   - Monthly: $9.99 (save price_id)
   - Yearly: $99.99 (save price_id)

2. **Pro Plan**
   - Monthly: $19.99 (save price_id)
   - Yearly: $199.99 (save price_id)

3. **Business Plan**
   - Monthly: $49.99 (save price_id)
   - Yearly: $499.99 (save price_id)

### 3.2 Create Webhook
Go to https://dashboard.stripe.com/webhooks and add:
- URL: `https://YOUR_DOMAIN.com/api/webhooks/stripe`
- Events:
  - checkout.session.completed
  - customer.subscription.updated
  - customer.subscription.deleted
  - invoice.paid
  - invoice.payment_failed
- Save the webhook signing secret (whsec_xxx)

### 3.3 Get API Keys
- Publishable key: pk_live_xxx (from API Keys page)
- Secret key: sk_live_xxx (from API Keys page)

---

## STEP 4: Set Up Google OAuth (Optional but recommended)

### 4.1 Create Google Cloud Project
1. Go to https://console.cloud.google.com
2. Create new project "InviteGenerator"
3. Enable "Google+ API" and "People API"

### 4.2 Create OAuth Credentials
1. Go to APIs & Services > Credentials
2. Create OAuth 2.0 Client ID (Web application)
3. Add authorized origins:
   - https://YOUR_DOMAIN.com
   - http://localhost:3000
4. Add authorized redirect URIs:
   - https://YOUR_DOMAIN.com/api/auth/social/google/callback
   - http://localhost:3000/api/auth/social/google/callback
5. Save Client ID and Client Secret

---

## STEP 5: Deploy to Vercel

### 5.1 Install Vercel CLI
```bash
npm i -g vercel
```

### 5.2 Link Project
```bash
cd /path/to/invitegenerator
vercel link
```

### 5.3 Set Environment Variables
```bash
# App URL
vercel env add NEXT_PUBLIC_APP_URL production
# Enter: https://YOUR_DOMAIN.com

# AWS
vercel env add AWS_REGION production
# Enter: us-east-1

vercel env add AWS_ACCESS_KEY_ID production
# Enter: <from CloudFormation output>

vercel env add AWS_SECRET_ACCESS_KEY production
# Enter: <from CloudFormation output>

# DynamoDB Tables
vercel env add DYNAMODB_USERS_TABLE production
# Enter: InviteGenerator-Users-production

vercel env add DYNAMODB_INVITATIONS_TABLE production
# Enter: InviteGenerator-Invitations-production

vercel env add DYNAMODB_RSVPS_TABLE production
# Enter: InviteGenerator-RSVPs-production

vercel env add DYNAMODB_TEMPLATES_TABLE production
# Enter: InviteGenerator-Templates-production

vercel env add DYNAMODB_BLOG_TABLE production
# Enter: InviteGenerator-BlogPosts-production

vercel env add DYNAMODB_CONSENT_TABLE production
# Enter: InviteGenerator-Consent-production

vercel env add DYNAMODB_EMAIL_QUEUE_TABLE production
# Enter: InviteGenerator-EmailQueue-production

# Cognito
vercel env add COGNITO_USER_POOL_ID production
# Enter: <from CloudFormation output>

vercel env add COGNITO_CLIENT_ID production
# Enter: <from CloudFormation output>

vercel env add COGNITO_CLIENT_SECRET production
# Enter: <from describe-user-pool-client command>

vercel env add NEXT_PUBLIC_COGNITO_USER_POOL_ID production
# Enter: <same as COGNITO_USER_POOL_ID>

vercel env add NEXT_PUBLIC_COGNITO_CLIENT_ID production
# Enter: <same as COGNITO_CLIENT_ID>

# S3
vercel env add S3_BUCKET_NAME production
# Enter: <from CloudFormation output>

# SES
vercel env add SES_FROM_EMAIL production
# Enter: noreply@YOUR_DOMAIN.com

# Stripe
vercel env add STRIPE_SECRET_KEY production
# Enter: sk_live_xxx

vercel env add STRIPE_WEBHOOK_SECRET production
# Enter: whsec_xxx

vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production
# Enter: pk_live_xxx

vercel env add STRIPE_PRICE_STARTER_MONTHLY production
vercel env add STRIPE_PRICE_STARTER_YEARLY production
vercel env add STRIPE_PRICE_PRO_MONTHLY production
vercel env add STRIPE_PRICE_PRO_YEARLY production
vercel env add STRIPE_PRICE_BUSINESS_MONTHLY production
vercel env add STRIPE_PRICE_BUSINESS_YEARLY production
# Enter price IDs from Stripe dashboard

# Google OAuth (if configured)
vercel env add GOOGLE_CLIENT_ID production
vercel env add GOOGLE_CLIENT_SECRET production

# Admin
vercel env add ADMIN_API_KEY production
# Enter: <generate a random 32-character string>
```

### 5.4 Deploy
```bash
vercel --prod
```

### 5.5 Add Custom Domain
```bash
vercel domains add YOUR_DOMAIN.com
```
Then configure DNS as instructed.

---

## STEP 6: Post-Deployment Verification

### 6.1 Test the Application
1. Visit https://YOUR_DOMAIN.com
2. Try logging in with Google (should only allow ianmerrll10@gmail.com)
3. Create a test invitation
4. Test RSVP flow
5. Test Stripe checkout (use test mode first)

### 6.2 Update Stripe Webhook URL
After Vercel deployment, update your Stripe webhook URL to the production domain.

### 6.3 Submit Sitemap to Google
1. Go to https://search.google.com/search-console
2. Add your domain
3. Submit sitemap: https://YOUR_DOMAIN.com/sitemap.xml

---

## Access Control

**IMPORTANT**: This app is restricted to a single user.

The file `lib/auth-config.ts` contains the allowed email list:
```typescript
export const AUTH_CONFIG = {
  ALLOWED_EMAILS: [
    "ianmerrll10@gmail.com",
  ],
};
```

Only this email can:
- Log in via Google
- Sign up
- Access the dashboard

To add more users, edit `lib/auth-config.ts` and redeploy.

---

## Quick Reference: All Environment Variables

```env
# Required
NEXT_PUBLIC_APP_URL=https://YOUR_DOMAIN.com
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
DYNAMODB_USERS_TABLE=InviteGenerator-Users-production
DYNAMODB_INVITATIONS_TABLE=InviteGenerator-Invitations-production
DYNAMODB_RSVPS_TABLE=InviteGenerator-RSVPs-production
DYNAMODB_TEMPLATES_TABLE=InviteGenerator-Templates-production
DYNAMODB_BLOG_TABLE=InviteGenerator-BlogPosts-production
DYNAMODB_CONSENT_TABLE=InviteGenerator-Consent-production
DYNAMODB_EMAIL_QUEUE_TABLE=InviteGenerator-EmailQueue-production
COGNITO_USER_POOL_ID=us-east-1_xxx
COGNITO_CLIENT_ID=xxx
COGNITO_CLIENT_SECRET=xxx
NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_xxx
NEXT_PUBLIC_COGNITO_CLIENT_ID=xxx
S3_BUCKET_NAME=invitegenerator-uploads-xxx
SES_FROM_EMAIL=noreply@YOUR_DOMAIN.com
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_PRICE_STARTER_MONTHLY=price_xxx
STRIPE_PRICE_STARTER_YEARLY=price_xxx
STRIPE_PRICE_PRO_MONTHLY=price_xxx
STRIPE_PRICE_PRO_YEARLY=price_xxx
STRIPE_PRICE_BUSINESS_MONTHLY=price_xxx
STRIPE_PRICE_BUSINESS_YEARLY=price_xxx
ADMIN_API_KEY=xxx

# Optional (for Google OAuth)
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx
```

---

## Troubleshooting

### Build Fails
```bash
npm run build
# Check for TypeScript errors
npx tsc --noEmit
```

### AWS Connection Issues
- Verify credentials are correct
- Check IAM permissions
- Ensure region matches (us-east-1)

### Stripe Webhook Not Working
- Verify webhook URL is correct
- Check webhook signing secret
- View webhook logs in Stripe dashboard

### Email Not Sending
- Verify SES is out of sandbox mode
- Check FROM email is verified
- View SES sending statistics

---

## Commands Summary

```bash
# Deploy AWS infrastructure
./scripts/deploy-aws.sh

# Build locally
npm run build

# Run locally
npm run dev

# Deploy to Vercel
vercel --prod

# View logs
vercel logs
```
