# InviteGenerator Operations Manual

**Version:** 1.0
**Last Updated:** December 18, 2024

---

## Table of Contents

1. [Overview](#1-overview)
2. [System Architecture](#2-system-architecture)
3. [Environment Setup](#3-environment-setup)
4. [Daily Operations](#4-daily-operations)
5. [Affiliate Program Management](#5-affiliate-program-management)
6. [Subscription & Billing](#6-subscription--billing)
7. [Customer Support](#7-customer-support)
8. [Monitoring & Alerts](#8-monitoring--alerts)
9. [Deployment & Updates](#9-deployment--updates)
10. [Troubleshooting](#10-troubleshooting)
11. [Emergency Procedures](#11-emergency-procedures)

---

## 1. Overview

InviteGenerator is a digital invitation creation platform that allows users to:
- Create custom digital invitations using templates and AI
- Share invitations via link, email, or QR code
- Collect RSVPs from guests
- Download print-ready files for home printing

### Key Metrics to Track
- Daily Active Users (DAU)
- New signups
- Conversion rate (free → paid)
- Affiliate referrals
- RSVP submissions
- API response times

---

## 2. System Architecture

### Tech Stack
- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** AWS DynamoDB
- **Storage:** AWS S3
- **Authentication:** AWS Cognito
- **AI:** AWS Bedrock (Claude)
- **Email:** AWS SES
- **Payments:** Stripe
- **Hosting:** Vercel

### DynamoDB Tables
| Table | Purpose |
|-------|---------|
| `invitegenerator-users` | User accounts and profiles |
| `invitegenerator-invitations` | User-created invitations |
| `invitegenerator-rsvp` | RSVP responses |
| `invitegenerator-templates` | Invitation templates |
| `invitegenerator-affiliates` | Affiliate profiles |
| `invitegenerator-affiliate-referrals` | Referral tracking |
| `invitegenerator-affiliate-commissions` | Commission records |
| `invitegenerator-affiliate-payouts` | Payout requests |
| `invitegenerator-affiliate-applications` | Affiliate applications |
| `invitegenerator-affiliate-clicks` | Click analytics |
| `invitegenerator-contacts` | CRM contacts |

### S3 Buckets
- `invitegenerator-assets` - User uploads, invitation images
- `invitegenerator-templates` - Template assets

---

## 3. Environment Setup

### Required Environment Variables
```bash
# AWS
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=invitegenerator-assets

# Cognito
COGNITO_USER_POOL_ID=your-pool-id
COGNITO_CLIENT_ID=your-client-id
COGNITO_CLIENT_SECRET=your-client-secret

# DynamoDB
DYNAMODB_USERS_TABLE=invitegenerator-users
DYNAMODB_INVITATIONS_TABLE=invitegenerator-invitations
DYNAMODB_RSVP_TABLE=invitegenerator-rsvp
DYNAMODB_TEMPLATES_TABLE=invitegenerator-templates

# Stripe
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRO_MONTHLY_PRICE_ID=price_xxx
STRIPE_PRO_ANNUAL_PRICE_ID=price_xxx
STRIPE_BUSINESS_MONTHLY_PRICE_ID=price_xxx
STRIPE_BUSINESS_ANNUAL_PRICE_ID=price_xxx

# App
NEXT_PUBLIC_APP_URL=https://invitegenerator.com
JWT_SECRET=your-jwt-secret

# Email
SES_FROM_EMAIL=noreply@invitegenerator.com
SES_REGION=us-east-1
```

### Local Development
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Type check
npm run type-check

# Build
npm run build
```

---

## 4. Daily Operations

### Morning Checklist
- [ ] Check error monitoring dashboard (Vercel logs)
- [ ] Review overnight signups and conversions
- [ ] Check Stripe dashboard for failed payments
- [ ] Review affiliate payout requests
- [ ] Check DynamoDB capacity metrics
- [ ] Review customer support queue

### Weekly Tasks
- [ ] Process pending affiliate payouts
- [ ] Review affiliate applications
- [ ] Analyze conversion funnel
- [ ] Update templates if needed
- [ ] Review and respond to feedback
- [ ] Check API rate limits and quotas

### Monthly Tasks
- [ ] Review and pay affiliates
- [ ] Analyze churn and retention
- [ ] Review hosting costs (Vercel, AWS)
- [ ] Update pricing if needed
- [ ] Review security logs
- [ ] Backup critical data

---

## 5. Affiliate Program Management

### Affiliate Tiers
| Tier | Commission Rate | Requirements |
|------|-----------------|--------------|
| Bronze | 30% | Default |
| Silver | 35% | 10+ referrals |
| Gold | 40% | 25+ referrals |
| Platinum | 45% | 50+ referrals |
| Diamond | 50% | 100+ referrals |

### Processing Affiliate Applications
1. Log into admin dashboard at `/admin/affiliates`
2. Review pending applications
3. Check applicant's website/social presence
4. Approve or reject with reason
5. System auto-sends email notification

### Processing Payouts
1. Navigate to `/admin/affiliates/payouts`
2. Review pending payout requests
3. Verify commission calculations
4. Approve payouts (minimum $50)
5. Process via PayPal or Wise
6. Mark as paid in system

### Affiliate Support
- Affiliate dashboard: `/dashboard/affiliate`
- Affiliate resources: `/affiliates/resources`
- Contact: affiliates@invitegenerator.com

### Creating Affiliate Tables (First Time Setup)
```bash
# Run the table creation script
npx tsx scripts/create-affiliate-tables.ts

# Or use AWS CLI (see script for commands)
```

---

## 6. Subscription & Billing

### Pricing Plans
| Plan | Monthly | Annual | Features |
|------|---------|--------|----------|
| Free | $0 | $0 | 3 invitations, basic templates |
| Pro | $9.99 | $99/yr | Unlimited invitations, all templates, print downloads |
| Business | $29.99 | $299/yr | Team features, custom branding, priority support |

### Handling Failed Payments
1. Stripe auto-retries failed payments (3 attempts over 7 days)
2. System sends payment failed email after first failure
3. After 3 failures, subscription is cancelled
4. User can resubscribe at any time

### Manual Subscription Management
```bash
# Via Stripe Dashboard
1. Go to https://dashboard.stripe.com/customers
2. Search for customer by email
3. View/modify subscription as needed

# Via API (for bulk operations)
# See lib/services/stripe-service.ts
```

### Refund Policy
- Within 14 days: Full refund
- 15-30 days: Pro-rated refund
- After 30 days: No refund (case-by-case exceptions)

---

## 7. Customer Support

### Support Channels
- Email: support@invitegenerator.com
- Contact form: invitegenerator.com/contact
- Response time target: 24 hours

### Common Issues & Solutions

#### "Can't log in"
1. Check if account exists in Cognito
2. Try password reset flow
3. Check for email typos
4. Clear browser cookies

#### "Invitation not saving"
1. Check browser console for errors
2. Verify DynamoDB connection
3. Check if user hit free plan limits
4. Look for S3 upload errors

#### "RSVP not showing"
1. Verify invitation is published
2. Check DynamoDB RSVP table
3. Look for duplicate submissions
4. Check if RSVP limit reached

#### "Download not working"
1. Check user's plan (print downloads require Pro)
2. Verify S3 permissions
3. Check export API logs
4. Try regenerating the download

### Escalation Path
1. Tier 1: Common issues (FAQ, guides)
2. Tier 2: Technical issues (logs, debugging)
3. Tier 3: Engineering (code changes needed)

---

## 8. Monitoring & Alerts

### Vercel Dashboard
- URL: https://vercel.com/dashboard
- Monitor: Deployments, functions, analytics
- Set up alerts for: Error spikes, slow responses

### AWS CloudWatch
- DynamoDB: Capacity, throttling, latency
- S3: Request counts, errors
- SES: Bounce rate, complaints
- Cognito: Sign-in failures

### Stripe Dashboard
- Failed payments
- Disputes/chargebacks
- Subscription metrics

### Recommended Alerts
1. **Critical:** Site down, database unreachable
2. **High:** Payment processing errors, auth failures
3. **Medium:** High error rate, slow responses
4. **Low:** Approaching quotas, unusual traffic

---

## 9. Deployment & Updates

### Deployment Process (Vercel)
1. Push code to `main` branch
2. Vercel auto-deploys
3. Preview deployment runs first
4. Production deploys after preview passes

### Manual Deployment
```bash
# Deploy to production
vercel --prod

# Rollback to previous deployment
vercel rollback
```

### Environment Variables
- Set in Vercel dashboard: Settings → Environment Variables
- Changes require redeployment

### Database Migrations
- DynamoDB is schema-less (no migrations needed)
- Add new attributes directly in code
- Old records get new attributes on update

### Pre-Deployment Checklist
- [ ] All tests passing (`npm test`)
- [ ] Type check passes (`npm run type-check`)
- [ ] Build succeeds (`npm run build`)
- [ ] Feature tested in preview environment
- [ ] No sensitive data in commits

---

## 10. Troubleshooting

### Site Not Loading
1. Check Vercel status: status.vercel.com
2. Check domain DNS settings
3. Review Vercel deployment logs
4. Check for build errors

### Database Issues
1. Check AWS status: status.aws.amazon.com
2. Review DynamoDB metrics in CloudWatch
3. Check for throttling (increase capacity if needed)
4. Verify IAM permissions

### Authentication Issues
1. Check Cognito user pool status
2. Verify JWT secret is correct
3. Check token expiration
4. Review Cognito CloudWatch logs

### Payment Issues
1. Check Stripe status: status.stripe.com
2. Review Stripe webhook logs
3. Verify webhook secret is correct
4. Check for API version mismatches

### Email Issues
1. Check SES sending limits
2. Review bounce/complaint rates
3. Verify domain authentication (DKIM, SPF)
4. Check if in SES sandbox mode

### Debug Commands
```bash
# Check logs
vercel logs --follow

# Test database connection
npx tsx scripts/test-db-connection.ts

# Test email sending
npx tsx scripts/test-email.ts

# Check Stripe webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

## 11. Emergency Procedures

### Site Down
1. Check Vercel status page
2. Check AWS status page
3. Try rollback to last working deployment
4. If AWS issue: Wait or switch regions
5. Post status update to customers

### Data Breach
1. Identify scope of breach
2. Rotate all secrets immediately
3. Notify affected users within 72 hours
4. Review and patch vulnerability
5. Document incident

### DDoS Attack
1. Enable Vercel's attack challenge mode
2. Review rate limiting settings
3. Block suspicious IPs if identified
4. Scale up if legitimate traffic

### Payment System Failure
1. Check Stripe status
2. Pause new subscriptions if needed
3. Communicate with affected customers
4. Process manually if critical

### Emergency Contacts
- Vercel Support: support@vercel.com
- AWS Support: AWS Console → Support
- Stripe Support: support@stripe.com
- Domain Registrar: [Your registrar support]

---

## Appendix

### Useful Links
- Vercel Dashboard: https://vercel.com
- AWS Console: https://console.aws.amazon.com
- Stripe Dashboard: https://dashboard.stripe.com
- Cognito Console: https://console.aws.amazon.com/cognito

### Code Repository
- Main repo: [Your GitHub/GitLab URL]
- Documentation: See `/docs` folder and markdown files

### Team Contacts
- Engineering Lead: [Email]
- Product Owner: [Email]
- Customer Support Lead: [Email]

---

*This manual should be reviewed and updated quarterly or after major changes.*
