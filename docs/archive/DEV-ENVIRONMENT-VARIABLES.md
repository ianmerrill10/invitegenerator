# Environment Variables Reference

This document lists all environment variables required for InviteGenerator.

## Quick Start

Copy `.env.example` to `.env.local` and fill in the values:
```bash
cp .env.example .env.local
```

---

## AWS Configuration

### Core AWS
| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `AWS_REGION` | Yes | AWS region for all services | `us-east-1` |
| `AWS_ACCESS_KEY_ID` | Yes | IAM access key | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | Yes | IAM secret key | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |

### Cognito (Authentication)
| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `COGNITO_USER_POOL_ID` | Yes | Cognito User Pool ID | `us-east-1_AbCdEfGhI` |
| `COGNITO_CLIENT_ID` | Yes | Cognito App Client ID | `1h2j3k4l5m6n7o8p9q0r1s2t3u` |
| `COGNITO_CLIENT_SECRET` | Yes | Cognito App Client Secret | `abc123...` |
| `NEXT_PUBLIC_COGNITO_USER_POOL_ID` | Yes | Same as COGNITO_USER_POOL_ID (client-side) | `us-east-1_AbCdEfGhI` |
| `NEXT_PUBLIC_COGNITO_CLIENT_ID` | Yes | Same as COGNITO_CLIENT_ID (client-side) | `1h2j3k4l5m6n7o8p9q0r1s2t3u` |

### DynamoDB Tables
| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `DYNAMODB_USERS_TABLE` | Yes | Users table name | `invitegenerator-users` |
| `DYNAMODB_INVITATIONS_TABLE` | Yes | Invitations table name | `invitegenerator-invitations` |
| `DYNAMODB_RSVPS_TABLE` | Yes | RSVPs table name | `invitegenerator-rsvps` |
| `DYNAMODB_TEMPLATES_TABLE` | Yes | Templates table name | `invitegenerator-templates` |
| `DYNAMODB_BLOG_TABLE` | No | Blog posts table name | `invitegenerator-blog` |
| `DYNAMODB_CONSENT_TABLE` | No | Consent tracking table | `invitegenerator-consent` |
| `DYNAMODB_EMAIL_QUEUE_TABLE` | No | Email queue table | `invitegenerator-email-queue` |

### S3 (Storage)
| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `S3_BUCKET_NAME` | Yes | S3 bucket for uploads | `invitegenerator-uploads` |
| `NEXT_PUBLIC_S3_BUCKET_NAME` | Yes | Same as S3_BUCKET_NAME (client-side) | `invitegenerator-uploads` |

### SES (Email)
| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `SES_FROM_EMAIL` | Yes | Verified sender email | `noreply@invitegenerator.com` |

---

## Stripe (Payments)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `STRIPE_SECRET_KEY` | Yes | Stripe secret key | `sk_live_...` or `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | Yes | Webhook signing secret | `whsec_...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | Stripe publishable key | `pk_live_...` or `pk_test_...` |

### Stripe Price IDs
| Variable | Required | Description |
|----------|----------|-------------|
| `STRIPE_STARTER_PRICE_ID` | Yes | Starter plan price ID |
| `STRIPE_PRO_PRICE_ID` | Yes | Pro plan price ID |
| `STRIPE_BUSINESS_PRICE_ID` | Yes | Business plan price ID |

---

## Application Settings

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_SITE_URL` | Yes | Full site URL | `https://invitegenerator.com` |
| `NEXT_PUBLIC_APP_NAME` | No | Application name | `InviteGenerator` |
| `ADMIN_API_KEY` | Yes | Admin API authentication | `your-secure-key` |
| `NODE_ENV` | Yes | Environment mode | `development` or `production` |

---

## AI/ML Services

### OpenAI (if using)
| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | No | OpenAI API key |

### AWS Bedrock (AI)
Uses AWS credentials above. Ensure Bedrock access is enabled in your AWS account.

---

## Third-Party Integrations

### Prodigi (Print-on-Demand)
| Variable | Required | Description |
|----------|----------|-------------|
| `PRODIGI_API_KEY` | No | Prodigi API key |
| `PRODIGI_ENVIRONMENT` | No | `sandbox` or `production` |

### Analytics
| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | No | Google Analytics ID |

---

## Development Only

| Variable | Required | Description |
|----------|----------|-------------|
| `SKIP_ENV_VALIDATION` | No | Skip env validation in development |

---

## Environment File Template

```env
# ======================
# AWS Configuration
# ======================
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=

# ======================
# Cognito
# ======================
COGNITO_USER_POOL_ID=
COGNITO_CLIENT_ID=
COGNITO_CLIENT_SECRET=
NEXT_PUBLIC_COGNITO_USER_POOL_ID=
NEXT_PUBLIC_COGNITO_CLIENT_ID=

# ======================
# DynamoDB
# ======================
DYNAMODB_USERS_TABLE=invitegenerator-users
DYNAMODB_INVITATIONS_TABLE=invitegenerator-invitations
DYNAMODB_RSVPS_TABLE=invitegenerator-rsvps
DYNAMODB_TEMPLATES_TABLE=invitegenerator-templates

# ======================
# S3
# ======================
S3_BUCKET_NAME=
NEXT_PUBLIC_S3_BUCKET_NAME=

# ======================
# SES
# ======================
SES_FROM_EMAIL=

# ======================
# Stripe
# ======================
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_STARTER_PRICE_ID=
STRIPE_PRO_PRICE_ID=
STRIPE_BUSINESS_PRICE_ID=

# ======================
# Application
# ======================
NEXT_PUBLIC_SITE_URL=http://localhost:3000
ADMIN_API_KEY=
NODE_ENV=development

# ======================
# Optional
# ======================
# OPENAI_API_KEY=
# PRODIGI_API_KEY=
# PRODIGI_ENVIRONMENT=sandbox
# NEXT_PUBLIC_GA_MEASUREMENT_ID=
```

---

## Security Notes

1. **Never commit `.env.local`** - It's in `.gitignore`
2. **Use different keys for production** - Never use test keys in production
3. **Rotate secrets regularly** - Especially API keys and client secrets
4. **Use IAM roles in production** - Instead of access keys when possible
5. **Limit IAM permissions** - Follow principle of least privilege

---

*Last Updated: December 2024*
