# MASTER CONTEXT FILE - InviteGenerator

**Last Updated:** December 19, 2025
**Status:** DEPLOYED TO PRODUCTION

> This is the SINGLE SOURCE OF TRUTH for all project information.
> Keep this file updated after every work session.

---

## TABLE OF CONTENTS

1. [Quick Reference](#quick-reference)
2. [Project Overview](#project-overview)
3. [Deployment & Hosting](#deployment--hosting)
4. [Authentication & Access Control](#authentication--access-control)
5. [AWS Services & Configuration](#aws-services--configuration)
6. [API Keys & Credentials](#api-keys--credentials)
7. [Environment Variables](#environment-variables)
8. [Project Structure](#project-structure)
9. [API Routes Reference](#api-routes-reference)
10. [Database Schema](#database-schema)
11. [Testing Log](#testing-log)
12. [Known Issues & Fixes](#known-issues--fixes)
13. [Marketing & Launch Plan](#marketing--launch-plan)
14. [Change Log](#change-log)
15. [How to Keep This File Updated](#how-to-keep-this-file-updated)

---

## QUICK REFERENCE

### Essential Commands

```powershell
# Project location
cd c:\Users\ianme\OneDrive\Desktop\invitegeneratordevelopment\invitegeneratordevelopment

# Build
npm run build

# Run locally
npm run dev

# Deploy to production (Vercel CLI installed)
vercel --prod --yes

# Type check
npm run type-check

# Lint
npm run lint

# View Vercel logs
vercel logs
```

### Live URLs

| Environment | URL |
|-------------|-----|
| Production | https://invitegenerator.com |
| Vercel Deploy | https://invitegenerator-2e34pqs6j-ian-merrills-projects.vercel.app |
| Vercel Dashboard | https://vercel.com/ian-merrills-projects/invitegenerator |

### Owner Access

- **Email:** ianmerrill10@gmail.com
- **Whitelist Enabled:** Yes (only this email can access)

---

## PROJECT OVERVIEW

### What is InviteGenerator?

AI-powered digital invitation creation SaaS platform.

### Business Model

- **FREE** invitation creation (user acquisition)
- **Revenue Streams:**
  1. Print orders via Prodigi
  2. Premium features (credits system)
  3. Affiliate marketing (future)

### Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | Next.js 14.2.18 (App Router) |
| Language | TypeScript (strict mode) |
| Auth | AWS Cognito |
| Database | AWS DynamoDB (9 tables) |
| Storage | AWS S3 |
| AI | AWS Bedrock (Claude) |
| Payments | Stripe |
| Print | Prodigi API |
| Video | Creatify API |
| Hosting | Vercel |
| State | Zustand |
| UI | Radix UI, Tailwind CSS, Lucide Icons |

---

## DEPLOYMENT & HOSTING

### Vercel Configuration

| Setting | Value |
|---------|-------|
| Team | ian-merrills-projects |
| Project | invitegenerator |
| Framework | Next.js |
| Node Version | 20.x |
| Build Command | `npm run build` |
| Output Directory | `.next` |

### Custom Domain

- **Domain:** invitegenerator.com
- **DNS:** Configured via Vercel

### Deployment Commands

```powershell
# Production deployment
vercel --prod --yes

# Preview deployment
vercel

# Add environment variable
vercel env add VARIABLE_NAME production

# View deployment logs
vercel logs --follow
```

---

## AUTHENTICATION & ACCESS CONTROL

### AWS Cognito

| Setting | Value |
|---------|-------|
| User Pool ID | us-east-1_feKc3GwfT |
| Client ID | 6tst47k67hcsui67uafgi13fvn |
| Region | us-east-1 |
| Issuer | https://cognito-idp.us-east-1.amazonaws.com/us-east-1_feKc3GwfT |

### Beta Whitelist System

**File:** `lib/auth-config.ts`

**How it works:**
- `ENABLE_WHITELIST=true` → Only whitelisted emails can access
- `ALLOWED_EMAILS=email1@gmail.com,email2@gmail.com` → Comma-separated list
- `middleware.ts` enforces the whitelist on all routes

**Current Whitelist:**
- ianmerrill10@gmail.com

**To Add Users:**
1. Add to `ALLOWED_EMAILS` env var in Vercel
2. Or edit `lib/auth-config.ts` line 29
3. Redeploy

**To Disable Whitelist (Public Launch):**
Set `ENABLE_WHITELIST=false` or remove the variable

---

## AWS SERVICES & CONFIGURATION

### Active Services

| Service | Purpose | Resource |
|---------|---------|----------|
| Cognito | Authentication | User Pool: us-east-1_feKc3GwfT |
| DynamoDB | Database | 9 tables (see below) |
| S3 | Storage | invitegenerator-templates-983101357971 |
| Bedrock | AI Generation | Claude model |
| SES | Email (pending) | Needs verification |

### DynamoDB Tables (9 Total)

| Table Name | Purpose |
|------------|---------|
| invitegenerator-users | User profiles |
| invitegenerator-invitations | Invitation data |
| invitegenerator-rsvps | RSVP responses |
| invitegenerator-templates | Template library |
| invitegenerator-orders | Print orders |
| invitegenerator-blog | Blog posts |
| invitegenerator-analytics | Analytics data |
| invitegenerator-marketing-ads | Marketing ads |
| invitegenerator-tiktok-tokens | TikTok OAuth tokens |

### IAM Credentials

| Key | Value |
|-----|-------|
| Access Key ID | [REDACTED] |
| Region | us-east-1 |

---

## API KEYS & CREDENTIALS

### AWS

```
AWS_ACCESS_KEY_ID=[REDACTED]
AWS_SECRET_ACCESS_KEY=[REDACTED]
AWS_REGION=us-east-1
```

### AWS Cognito

```
COGNITO_USER_POOL_ID=us-east-1_feKc3GwfT
COGNITO_CLIENT_ID=6tst47k67hcsui67uafgi13fvn
COGNITO_CLIENT_SECRET=[REDACTED]
```

### OpenAI

```
OPENAI_API_KEY=[REDACTED]
```

### Prodigi (Print-on-Demand)

```
PRODIGI_API_KEY=[REDACTED]
PRODIGI_ENVIRONMENT=sandbox
```

### Creatify (Video Generation)

```
CREATIFY_API_ID=[REDACTED]
CREATIFY_API_KEY=[REDACTED]
```

### TikTok

```
TIKTOK_CLIENT_KEY=[REDACTED]
TIKTOK_CLIENT_SECRET=[REDACTED]
TIKTOK_REDIRECT_URI=https://invitegenerator.com/api/auth/tiktok/callback
```

### Admin

```
ADMIN_API_KEY=[REDACTED]
ADMIN_EMAIL=ianmerrill10@gmail.com
```

### Gemini CLI (AI Automation)

```
GEMINI_API_KEY=[REDACTED]
```

**Usage:**
```powershell
# Set API key and run Gemini CLI
export GEMINI_API_KEY=your_gemini_key_here && gemini -o text

# Example: Generate content
echo "Your prompt here" | gemini -o text
```

**Installed:** Globally via `npm install -g @google/gemini-cli`
**Version:** 0.21.3

### Stripe (NEED LIVE KEYS)

```
# Test keys in .env.local - need live keys for production
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

---

## ENVIRONMENT VARIABLES

### Complete .env.local

**File Location:** `invitegeneratordevelopment/.env.local`

```env
# AWS Core
AWS_ACCESS_KEY_ID=[REDACTED]
AWS_SECRET_ACCESS_KEY=[REDACTED]
AWS_REGION=us-east-1

# Cognito
COGNITO_USER_POOL_ID=us-east-1_feKc3GwfT
COGNITO_CLIENT_ID=6tst47k67hcsui67uafgi13fvn
COGNITO_CLIENT_SECRET=[REDACTED]
COGNITO_ISSUER=https://cognito-idp.us-east-1.amazonaws.com/us-east-1_feKc3GwfT

# S3
S3_BUCKET_NAME=invitegenerator-templates-983101357971

# DynamoDB Tables
DYNAMODB_USERS_TABLE=invitegenerator-users
DYNAMODB_INVITATIONS_TABLE=invitegenerator-invitations
DYNAMODB_RSVPS_TABLE=invitegenerator-rsvps
DYNAMODB_TEMPLATES_TABLE=invitegenerator-templates
DYNAMODB_ORDERS_TABLE=invitegenerator-orders
DYNAMODB_BLOG_TABLE=invitegenerator-blog
DYNAMODB_ANALYTICS_TABLE=invitegenerator-analytics
DYNAMODB_MARKETING_ADS_TABLE=invitegenerator-marketing-ads
DYNAMODB_TIKTOK_TOKENS_TABLE=invitegenerator-tiktok-tokens

# App
NEXT_PUBLIC_APP_URL=https://invitegenerator.com

# Beta Access
ENABLE_WHITELIST=true
ALLOWED_EMAILS=ianmerrill10@gmail.com
ADMIN_EMAIL=ianmerrill10@gmail.com

# API Keys
OPENAI_API_KEY=[REDACTED]
PRODIGI_API_KEY=[REDACTED]
PRODIGI_ENVIRONMENT=sandbox
ADMIN_API_KEY=[REDACTED]

# Creatify
CREATIFY_API_ID=[REDACTED]
CREATIFY_API_KEY=[REDACTED]

# TikTok
TIKTOK_CLIENT_KEY=[REDACTED]
TIKTOK_CLIENT_SECRET=[REDACTED]
TIKTOK_REDIRECT_URI=https://invitegenerator.com/api/auth/tiktok/callback

# Push Notifications
NTFY_TOPIC=invitegenerator-marketing
```

---

## PROJECT STRUCTURE

### Root Directory

```
c:\Users\ianme\OneDrive\Desktop\invitegeneratordevelopment\
├── invitegeneratordevelopment/   # MAIN APP (deploy this)
├── invitegenerator/              # Old versions (backup)
├── MASTER_CONTEXT.md             # THIS FILE
├── CLAUDE.md                     # Quick reference
├── LEAN-LAUNCH-PLAN-200.md       # Marketing plan
└── STEP-BY-STEP-LAUNCH-GUIDE.md  # Launch guide
```

### Main App Structure

```
invitegeneratordevelopment/
├── app/                    # Next.js App Router
│   ├── api/               # 80+ API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── invitations/   # Invitation CRUD
│   │   ├── rsvp/          # RSVP management
│   │   ├── ai/            # AI generation
│   │   └── webhooks/      # Stripe, Prodigi webhooks
│   ├── dashboard/         # Protected user pages
│   ├── auth/              # Login, signup pages
│   ├── (marketing)/       # Public pages (pricing, features)
│   └── i/[shortId]/       # Public invitation view
├── components/            # React components
│   ├── ui/                # Reusable UI (button, card, etc)
│   └── recommendations/   # Product recommendations
├── lib/                   # Utilities
│   ├── ai/                # AI/Bedrock integration
│   ├── stores/            # Zustand state stores
│   ├── db/                # DynamoDB helpers
│   ├── auth.ts            # Auth utilities
│   ├── auth-config.ts     # Whitelist config
│   ├── dynamodb.ts        # DynamoDB client
│   ├── csrf.ts            # CSRF protection
│   └── rate-limit.ts      # Rate limiting
├── types/                 # TypeScript definitions
├── docs/                  # Documentation
├── logs/                  # Work logs
├── scripts/               # Build scripts
│   └── validate-env.cjs   # Env validation
├── middleware.ts          # Route protection
├── .env.local             # Environment variables
└── package.json           # Dependencies
```

---

## API ROUTES REFERENCE

### Authentication

| Method | Route | Purpose |
|--------|-------|---------|
| POST | /api/auth/signup | Create account |
| POST | /api/auth/login | Login |
| POST | /api/auth/logout | Logout |
| POST | /api/auth/forgot-password | Request password reset |
| POST | /api/auth/reset-password | Confirm password reset |
| POST | /api/auth/refresh | Refresh JWT token |

### Invitations

| Method | Route | Purpose |
|--------|-------|---------|
| GET | /api/invitations | List user's invitations |
| POST | /api/invitations | Create invitation |
| GET | /api/invitations/[id] | Get single invitation |
| PATCH | /api/invitations/[id] | Update invitation |
| DELETE | /api/invitations/[id] | Delete invitation |
| POST | /api/invitations/[id]/publish | Publish invitation |
| POST | /api/invitations/[id]/duplicate | Duplicate invitation |

### AI Generation

| Method | Route | Purpose |
|--------|-------|---------|
| POST | /api/ai/generate | Generate invitation design |
| POST | /api/ai/enhance | Enhance existing design |
| POST | /api/ai/suggestions | Get design suggestions |

### RSVP

| Method | Route | Purpose |
|--------|-------|---------|
| GET | /api/rsvp/[invitationId] | Get RSVPs (auth required) |
| POST | /api/rsvp/[invitationId] | Submit RSVP (public) |
| GET | /api/rsvp/[invitationId]/export | Export to CSV |

### Public

| Method | Route | Purpose |
|--------|-------|---------|
| GET | /api/public/invitation/[shortId] | Get public invitation |

---

## DATABASE SCHEMA

### Users Table

```
PK: USER#<userId>
SK: PROFILE

Attributes:
- email (String)
- name (String)
- credits (Number)
- plan (String: free|starter|pro|business)
- createdAt (String)
- updatedAt (String)
```

### Invitations Table

```
PK: USER#<userId>
SK: INV#<invitationId>

Attributes:
- title (String)
- eventType (String)
- eventDate (String)
- shortId (String) - for public URL
- designData (Map)
- isPublished (Boolean)
- createdAt (String)
```

### RSVPs Table

```
PK: INV#<invitationId>
SK: RSVP#<rsvpId>

Attributes:
- guestName (String)
- email (String)
- response (String: attending|not_attending|maybe)
- guestCount (Number)
- dietaryRestrictions (String)
- createdAt (String)
```

---

## TESTING LOG

### December 19, 2025 - All Core Features Tested

| Feature | Status | Notes |
|---------|--------|-------|
| Homepage | PASS | Loads correctly |
| Signup | PASS | Creates user in Cognito + DynamoDB |
| Login | PASS | Returns JWT tokens |
| Invitation Creation | PASS | Saves to DynamoDB |
| AI Generation | PASS | AWS Bedrock/Claude works |
| RSVP Flow | PASS | Public submission works |
| Build | PASS | No TypeScript errors |
| Vercel Deploy | PASS | Production live |

### Test User Created

- Email: testuser_1734578423@test.com
- Password: TestPass123!
- Status: Active in Cognito and DynamoDB

---

## KNOWN ISSUES & FIXES

### Resolved Issues

| Issue | Fix | Date |
|-------|-----|------|
| auth-store.ts duplicate code | Removed lines 99-109 | Dec 19, 2025 |
| Missing table.tsx | Created component | Dec 19, 2025 |
| Missing select.tsx | Created component | Dec 19, 2025 |
| Missing label.tsx | Created component | Dec 19, 2025 |
| BadgeVariant missing "premium" | Added to type and classes | Dec 19, 2025 |
| Cognito SECRET_HASH error | Added COGNITO_CLIENT_SECRET | Dec 19, 2025 |
| DynamoDB null tableName | Added all 9 table env vars | Dec 19, 2025 |
| User not found in AI gen | Created user after DB config | Dec 19, 2025 |

### Current Issues

None - build passing, all tests pass.

### Pending Setup

| Item | Status | Notes |
|------|--------|-------|
| Stripe Live Keys | PENDING | Need to add to Vercel |
| AWS SES | PENDING | Need to verify domain |
| Vercel Env Vars | PENDING | Need to add all vars |

---

## MARKETING & LAUNCH PLAN

### Budget

- Total: $200
- TikTok Ads: $100
- Reserve: $100

### Available Assets

| Asset | Details |
|-------|---------|
| Creatify | ~10 min video credits |
| Gemini Ultra | Nano Banana image generation |
| InviteGenerator | Demo content |

### Key Files

- `LEAN-LAUNCH-PLAN-200.md` - Full marketing strategy
- `STEP-BY-STEP-LAUNCH-GUIDE.md` - Hour-by-hour launch plan

### Generated Content Files (via Gemini CLI)

| File | Contents | Count |
|------|----------|-------|
| `lib/db/template-prompts.json` | AI image generation prompts | 25 prompts |
| `lib/db/tiktok-scripts.json` | TikTok video scripts | 10 scripts |
| `lib/db/seo-blog-ideas.json` | SEO blog post ideas | 15 posts |

### TikTok Content Scripts

See `STEP-BY-STEP-LAUNCH-GUIDE.md` for:
- 4 video scripts ready to use
- 10 Nano Banana image prompts
- Daily posting schedule

**NEW:** `lib/db/tiktok-scripts.json` has 10 complete viral TikTok scripts with:
- Hook text (first 3 seconds)
- Full script breakdown
- CTAs
- Hashtag sets

---

## TEMPLATE LOCATIONS

### Production (S3)
- **Bucket:** `invitegenerator-templates-983101357971`
- **Region:** `us-east-1`
- **Path pattern:** `templates/{category}/{subcategory}/tmpl_{category}_{subcategory}_{style}_{id}_{timestamp}_{thumb|full}.png`
- **Current count:** 298 unique templates (596 files - thumb + full pairs)

### Local Backups
| Location | Files | Unique |
|----------|-------|--------|
| `invitegenerator-app/templates-backup` | 596 | 298 |
| `invitegenerator-app/templates-local` | 596 | 298 |
| `gemini_templates` | 40 | 40 |
| `GEMINI TEMPLATES` | 6 | 6 |

### Target: 1001 templates
- **Current:** 344 unique templates
- **Needed:** 657 more

### Admin Page
- **URL:** `/admin/templates`
- **Access:** `ianmerrill10@gmail.com` only
- **Features:** Grid view, filters, search, preview, delete

### Inventory Script
```bash
node scripts/template-inventory.js
```
Outputs to `template-inventory.json`

---

## CHANGE LOG

### December 19, 2025 (Session 2)

- Created admin template management page with auth protection
- Added S3 template delete API endpoint
- Fixed build errors (route conflicts, component issues)
- Deployed to Vercel production
- Created template inventory script

### December 19, 2025

- Fixed all TypeScript build errors
- Created missing UI components (table, select, label)
- Added all 9 DynamoDB table env vars
- Added Cognito client secret
- Enabled beta whitelist for owner only
- Deployed to Vercel production
- Created MASTER_CONTEXT.md
- Installed Gemini CLI globally (v0.21.3)
- Generated 25 template image prompts via Gemini
- Generated 10 TikTok viral video scripts via Gemini
- Generated 15 SEO blog post ideas via Gemini
- Saved all generated content to lib/db/*.json files

### Previous Work

See `logs/WORK_LOG.md` for full history.

---

## HOW TO KEEP THIS FILE UPDATED

### After Every Work Session

1. **Update Change Log:** Add dated entry describing what was done
2. **Update Testing Log:** Mark any new features tested
3. **Update Known Issues:** Add/remove issues as needed
4. **Update API Keys:** If any credentials changed
5. **Update Environment Variables:** If any added/changed

### When Adding Features

1. Add to API Routes Reference
2. Add to Database Schema if new tables
3. Update Project Structure if new directories

### When Fixing Bugs

1. Add to Known Issues & Fixes table
2. Remove from Current Issues if resolved

### Template for Change Log Entry

```markdown
### [DATE]

**What was done:**
- Item 1
- Item 2

**Files changed:**
- path/to/file.ts

**Testing:**
- [ ] Feature tested and working

**Next steps:**
- Remaining work
```

---

## QUICK TROUBLESHOOTING

### Build Fails

```powershell
npm run type-check
# Fix TypeScript errors
```

### Login Not Working

1. Check COGNITO_CLIENT_SECRET is set
2. Verify user exists in Cognito User Pool
3. Check ENABLE_WHITELIST setting

### AI Generation Fails

1. Check AWS credentials
2. Verify Bedrock access enabled
3. Check user has credits

### Database Errors

1. Check all DYNAMODB_*_TABLE vars set
2. Verify table exists in AWS
3. Check IAM permissions

---

**END OF MASTER CONTEXT FILE**
