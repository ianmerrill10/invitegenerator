# Environment Variables Reference

Complete list of all environment variables used by InviteGenerator.

---

## Core Application

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NODE_ENV` | Yes | Environment mode | `development`, `production` |
| `NEXT_PUBLIC_APP_URL` | Yes | Public URL of the app | `https://invitegenerator.com` |
| `JWT_SECRET` | Yes | Secret for JWT signing (256-bit) | `your-super-secret-key-here` |

---

## AWS General

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `AWS_REGION` | Yes | AWS region | `us-east-1` |
| `AWS_ACCESS_KEY_ID` | Yes | AWS access key | `AKIA...` |
| `AWS_SECRET_ACCESS_KEY` | Yes | AWS secret key | `wJal...` |

---

## AWS Cognito

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `COGNITO_USER_POOL_ID` | Yes | Cognito User Pool ID | `us-east-1_AbCdEfG` |
| `COGNITO_CLIENT_ID` | Yes | Cognito App Client ID | `1abc2def3ghi...` |
| `COGNITO_CLIENT_SECRET` | Yes | Cognito App Client Secret | `abc123...` |

---

## AWS DynamoDB

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `DYNAMODB_USERS_TABLE` | No | Users table name | `invitegenerator-users` |
| `DYNAMODB_INVITATIONS_TABLE` | No | Invitations table name | `invitegenerator-invitations` |
| `DYNAMODB_RSVP_TABLE` | No | RSVP table name | `invitegenerator-rsvp` |
| `DYNAMODB_TEMPLATES_TABLE` | No | Templates table name | `invitegenerator-templates` |
| `DYNAMODB_PRINT_ORDERS_TABLE` | No | Print orders table name | `invitegenerator-print-orders` |
| `DYNAMODB_TABLE_PREFIX` | No | Prefix for all tables | `invitegenerator` |

---

## AWS S3

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `AWS_S3_BUCKET` | Yes | S3 bucket for assets | `invitegenerator-assets` |

---

## AWS SES

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `SES_FROM_EMAIL` | Yes | Sender email address | `noreply@invitegenerator.com` |
| `SES_REGION` | No | SES region (if different) | `us-east-1` |

---

## AWS Bedrock

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `BEDROCK_MODEL_ID` | No | AI model for generation | `anthropic.claude-3-sonnet-20240229-v1:0` |

---

## Stripe

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `STRIPE_SECRET_KEY` | Yes | Stripe secret key | `sk_live_...` or `sk_test_...` |
| `STRIPE_PUBLISHABLE_KEY` | Yes | Stripe publishable key | `pk_live_...` or `pk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | Yes | Webhook signing secret | `whsec_...` |
| `STRIPE_PRO_MONTHLY_PRICE_ID` | Yes | Pro monthly price ID | `price_...` |
| `STRIPE_PRO_ANNUAL_PRICE_ID` | Yes | Pro annual price ID | `price_...` |
| `STRIPE_BUSINESS_MONTHLY_PRICE_ID` | No | Business monthly price ID | `price_...` |
| `STRIPE_BUSINESS_ANNUAL_PRICE_ID` | No | Business annual price ID | `price_...` |

---

## Prodigi (Print-on-Demand)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `PRODIGI_API_KEY` | No | Prodigi API key | `prod_...` |
| `PRODIGI_API_URL` | No | Prodigi API URL | `https://api.prodigi.com/v4.0` |

---

## Development

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DEV_PASSWORD` | No | Password protection for dev | `devpass123` |

---

## Analytics

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_GA_ID` | No | Google Analytics ID | `G-XXXXXXXXXX` |

---

## Security Notes

1. **Never commit secrets to git**
2. Use `.env.local` for local development
3. Set production secrets in Vercel Dashboard
4. Rotate secrets periodically
5. Use different keys for dev/staging/production

---

## Getting Values

### AWS Credentials
1. Go to AWS IAM Console
2. Create user with programmatic access
3. Attach required policies
4. Download credentials

### Cognito IDs
1. Go to AWS Cognito Console
2. Select your User Pool
3. Copy Pool ID from General Settings
4. Go to App Integration → App Clients
5. Copy Client ID and Secret

### Stripe Keys
1. Go to Stripe Dashboard
2. Click Developers → API Keys
3. Copy Publishable and Secret keys
4. For webhooks: Developers → Webhooks → Signing secret

### Prodigi Key
1. Sign up at prodigi.com
2. Go to API Settings
3. Generate API key (use sandbox for testing)
