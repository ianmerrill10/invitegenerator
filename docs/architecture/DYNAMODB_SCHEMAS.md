# DynamoDB Table Schemas

This document describes all DynamoDB tables used in InviteGenerator.

## Tables Overview

| Table Name | Primary Key | GSI(s) | Description |
|------------|-------------|--------|-------------|
| invitegenerator-users | id | email-index | User accounts |
| invitations | id | userId-index, shortId-index | User invitations |
| invitegenerator-rsvp | id | invitationId-index | RSVP responses |
| invitegenerator-templates | id | category-index | Invitation templates |
| invitegenerator-contacts | id | userId-index, email-index | CRM contacts |
| invitegenerator-affiliates | id | userId-index, affiliateCode-index | Affiliate accounts |
| invitegenerator-affiliate-referrals | id | affiliateId-index | Referral tracking |
| invitegenerator-affiliate-commissions | id | affiliateId-index | Commission records |
| invitegenerator-print-orders | id | userId-index, status-index | Print orders |
| invitegenerator-notifications | PK/SK | - | User notifications |
| invitegenerator-audit-logs | PK/SK | GSI1 (eventType) | Audit trail |

---

## invitegenerator-users

User account information.

### Schema

```
Primary Key: id (String)
```

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | String | Yes | UUID |
| email | String | Yes | User email (unique) |
| name | String | No | Display name |
| passwordHash | String | No | Bcrypt hash (Cognito users don't have this) |
| avatarUrl | String | No | Profile picture URL |
| role | String | No | User role (user, admin) |
| subscription | Object | No | Subscription details |
| stripeCustomerId | String | No | Stripe customer ID |
| cognitoId | String | No | Cognito user ID |
| createdAt | String | Yes | ISO timestamp |
| updatedAt | String | Yes | ISO timestamp |

### GSIs

- **email-index**: Query users by email
  - PK: email

---

## invitations

User-created invitations.

### Schema

```
Primary Key: id (String)
```

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | String | Yes | UUID |
| userId | String | Yes | Owner user ID |
| shortId | String | Yes | Short URL ID (10 chars) |
| title | String | Yes | Invitation title |
| eventType | String | Yes | Event category |
| eventDate | String | No | Event date ISO |
| eventTime | String | No | Event time |
| location | String | No | Event location |
| description | String | No | Event description |
| status | String | Yes | draft, published, archived |
| design | Object | No | Design JSON (elements, styles) |
| templateId | String | No | Base template ID |
| views | Number | No | View count |
| rsvpCount | Number | No | Total RSVPs |
| createdAt | String | Yes | ISO timestamp |
| updatedAt | String | Yes | ISO timestamp |
| publishedAt | String | No | Publication timestamp |
| archived | Boolean | No | Archive status |

### GSIs

- **userId-index**: Query invitations by user
  - PK: userId
  - SK: createdAt
- **shortId-index**: Lookup by short URL
  - PK: shortId

---

## invitegenerator-rsvp

Guest RSVP responses.

### Schema

```
Primary Key: id (String)
```

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | String | Yes | UUID |
| invitationId | String | Yes | Parent invitation |
| name | String | Yes | Guest name |
| email | String | No | Guest email |
| phone | String | No | Guest phone |
| response | String | Yes | yes, no, maybe, pending |
| guestCount | Number | No | Number in party |
| dietaryRestrictions | String | No | Dietary needs |
| message | String | No | Guest message |
| source | String | No | How added (manual, import, rsvp) |
| respondedAt | String | No | Response timestamp |
| createdAt | String | Yes | ISO timestamp |
| updatedAt | String | Yes | ISO timestamp |

### GSIs

- **invitationId-index**: Query RSVPs by invitation
  - PK: invitationId
  - SK: createdAt

---

## invitegenerator-templates

Invitation design templates.

### Schema

```
Primary Key: id (String)
```

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | String | Yes | UUID |
| name | String | Yes | Template name |
| category | String | Yes | Event category |
| subcategory | String | No | Subcategory |
| description | String | No | Template description |
| thumbnail | String | Yes | Preview image URL |
| previewImages | Array | No | Additional preview URLs |
| tier | String | Yes | free, pro, premium |
| tags | Array | No | Search tags |
| colors | Array | No | Color palette |
| fonts | Array | No | Font names used |
| design | Object | Yes | Design JSON |
| status | String | Yes | active, inactive |
| featured | Boolean | No | Show in featured |
| popularity | Number | No | Usage score |
| usageCount | Number | No | Times used |
| rating | String | No | Average rating |
| ratingCount | Number | No | Number of ratings |
| createdAt | String | Yes | ISO timestamp |
| updatedAt | String | Yes | ISO timestamp |

### GSIs

- **category-index**: Query templates by category
  - PK: category
  - SK: popularity

---

## invitegenerator-affiliates

Affiliate partner accounts.

### Schema

```
Primary Key: id (String)
```

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | String | Yes | UUID |
| userId | String | Yes | User ID |
| affiliateCode | String | Yes | Unique referral code |
| tier | String | Yes | bronze, silver, gold, platinum, diamond |
| status | String | Yes | pending, active, suspended |
| totalClicks | Number | No | Total referral clicks |
| totalReferrals | Number | No | Total signups |
| totalConversions | Number | No | Paid conversions |
| totalEarnings | Number | No | Lifetime earnings (cents) |
| pendingBalance | Number | No | Unpaid balance (cents) |
| paypalEmail | String | No | Payout email |
| createdAt | String | Yes | ISO timestamp |
| updatedAt | String | Yes | ISO timestamp |

### GSIs

- **userId-index**: Lookup by user ID
  - PK: userId
- **affiliateCode-index**: Lookup by referral code
  - PK: affiliateCode

---

## invitegenerator-print-orders

Print-on-demand orders.

### Schema

```
Primary Key: id (String)
```

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | String | Yes | UUID |
| userId | String | Yes | Customer user ID |
| invitationId | String | Yes | Invitation being printed |
| status | String | Yes | pending_payment, processing, printing, shipped, delivered, cancelled |
| stripeSessionId | String | No | Stripe checkout session |
| prodigiOrderId | String | No | Prodigi order reference |
| product | Object | Yes | SKU, size, quantity, price |
| shipping | Object | Yes | Address, method, cost |
| pricing | Object | Yes | Subtotal, shipping, tax, total |
| trackingNumber | String | No | Shipping tracking |
| trackingUrl | String | No | Tracking link |
| createdAt | String | Yes | ISO timestamp |
| updatedAt | String | Yes | ISO timestamp |
| shippedAt | String | No | Ship date |

### GSIs

- **userId-index**: Query orders by user
  - PK: userId
  - SK: createdAt
- **invitationId-index**: Query orders by invitation
  - PK: invitationId
- **status-index**: Query orders by status
  - PK: status

---

## invitegenerator-notifications

In-app notifications (Single Table Design).

### Schema

```
Primary Key: PK (String) - USER#<userId>
Sort Key: SK (String) - NOTIFICATION#<createdAt>#<id>
```

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | String | Yes | UUID |
| userId | String | Yes | Target user |
| type | String | Yes | Notification type |
| title | String | Yes | Notification title |
| message | String | Yes | Notification body |
| link | String | No | Navigation link |
| read | Boolean | Yes | Read status |
| createdAt | String | Yes | ISO timestamp |
| expiresAt | Number | No | TTL timestamp (seconds) |
| metadata | Object | No | Additional data |

### TTL

Enable TTL on `expiresAt` field for automatic cleanup.

---

## invitegenerator-audit-logs

Security audit trail (Single Table Design).

### Schema

```
Primary Key: PK (String) - USER#<userId> or SYSTEM
Sort Key: SK (String) - <timestamp>#<id>
```

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | String | Yes | UUID |
| timestamp | String | Yes | ISO timestamp |
| eventType | String | Yes | Event type code |
| userId | String | No | User involved |
| actorId | String | No | Admin who acted |
| resourceType | String | No | Type of resource |
| resourceId | String | No | Resource ID |
| action | String | Yes | Action description |
| details | Object | No | Additional details |
| ipAddress | String | No | Client IP |
| userAgent | String | No | Client user agent |
| status | String | Yes | success, failure, warning |

### GSIs

- **GSI1**: Query by event type
  - GSI1PK: eventType
  - GSI1SK: timestamp

---

## Environment Variables

Set these in your `.env.local`:

```env
# AWS Configuration
AWS_REGION=us-east-1

# Table Names (optional - defaults shown)
DYNAMODB_USERS_TABLE=invitegenerator-users
DYNAMODB_INVITATIONS_TABLE=invitations
DYNAMODB_RSVP_TABLE=invitegenerator-rsvp
DYNAMODB_TEMPLATES_TABLE=invitegenerator-templates
DYNAMODB_CONTACTS_TABLE=invitegenerator-contacts
DYNAMODB_AFFILIATES_TABLE=invitegenerator-affiliates
DYNAMODB_AFFILIATE_REFERRALS_TABLE=invitegenerator-affiliate-referrals
DYNAMODB_AFFILIATE_COMMISSIONS_TABLE=invitegenerator-affiliate-commissions
DYNAMODB_PRINT_ORDERS_TABLE=invitegenerator-print-orders
DYNAMODB_NOTIFICATIONS_TABLE=invitegenerator-notifications
DYNAMODB_AUDIT_LOG_TABLE=invitegenerator-audit-logs
```

---

## Creation Scripts

Use the scripts in `/scripts` directory to create tables:

```bash
# Create all affiliate tables
npx tsx scripts/create-affiliate-tables.ts

# Create print orders table
npx tsx scripts/create-print-orders-table.ts

# Create audit log table
npx tsx scripts/create-audit-log-table.ts

# Create notifications table
npx tsx scripts/create-notifications-table.ts
```

---

## Best Practices

1. **Use GSIs sparingly** - They cost additional read/write capacity
2. **Design for access patterns** - Know your queries before designing
3. **Use sparse indexes** - Only include items that need to be queried
4. **Enable TTL for ephemeral data** - Notifications, sessions, etc.
5. **Use batch operations** - BatchGetItem, BatchWriteItem for efficiency
6. **Consider single-table design** - For related entities (notifications, audit logs)
