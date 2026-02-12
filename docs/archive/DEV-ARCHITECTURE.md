# 🏗️ INVITEGENERATOR - TECHNICAL ARCHITECTURE

## Business Model Overview

InviteGenerator uses a **data-driven freemium model**:
- **FREE** invitation creation to maximize user acquisition
- **Revenue** generated through:
  1. Targeted product recommendations (Shopify stores per event type)
  2. Affiliate marketing commissions
  3. Advertising revenue
  4. Premium features (optional upsells)

---

## 📊 Data Collection Strategy

### Data Points Collected Per User

```typescript
interface UserProfile {
  // Identity
  id: string;
  email: string;
  name: string;
  phone?: string;

  // Demographics (inferred + collected)
  location?: {
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };

  // Auth Provider Data
  authProvider: 'email' | 'google' | 'facebook' | 'apple' | 'twitter';
  socialProfiles?: {
    google?: { id: string; email: string; picture: string };
    facebook?: { id: string; email: string; };
    twitter?: { id: string; handle: string; };
  };

  // Marketing Consent (GDPR/CCPA compliant)
  consent: {
    marketing: boolean;        // Can we send marketing emails?
    thirdPartySharing: boolean; // Can we share with partners?
    analytics: boolean;        // Can we track behavior?
    personalization: boolean;  // Can we personalize experience?
    consentDate: string;       // When consent was given
    consentVersion: string;    // Version of privacy policy
  };

  // Engagement Metrics
  metrics: {
    invitationsCreated: number;
    totalGuests: number;
    lastActive: string;
    signupSource: string;      // How they found us
    referralCode?: string;
  };
}
```

### Data Points Collected Per Invitation

```typescript
interface InvitationInsights {
  // Event Intelligence
  eventType: EventType;        // birthday, wedding, baby_shower, etc.
  eventDate: string;           // When is the event?
  guestCount: number;          // How many guests?
  budgetIndicator?: string;    // Inferred from venue, style choices

  // Location Intelligence
  eventLocation: {
    venue: string;
    city: string;
    state: string;
    isVirtual: boolean;
  };

  // Style Preferences
  designPreferences: {
    colorScheme: string[];
    style: string;             // modern, classic, playful, elegant
    templateUsed: string;
  };

  // Timing Intelligence
  createdAt: string;
  daysBeforeEvent: number;     // Planning timeline indicator

  // Guest Demographics (aggregated from RSVPs)
  guestInsights?: {
    totalInvited: number;
    attending: number;
    dietaryRestrictions: string[];  // Vegetarian, vegan, gluten-free, etc.
  };
}
```

### User Segmentation for Marketing

```typescript
type UserSegment =
  | 'new_parent'           // Baby shower creators
  | 'engaged_couple'       // Wedding invitation creators
  | 'party_planner'        // Multiple birthday parties
  | 'corporate_organizer'  // Corporate events
  | 'frequent_host'        // 3+ events per year
  | 'luxury_buyer'         // High-end design choices
  | 'budget_conscious'     // Free templates only
  | 'social_butterfly';    // Large guest counts
```

---

## 🛒 Shopify Store Integration

### Event Type to Store Mapping

```typescript
const SHOPIFY_STORES: Record<EventType, ShopifyStoreConfig> = {
  birthday: {
    storeUrl: 'https://birthday-party-supplies.myshopify.com',
    storeName: 'Birthday Bash Supplies',
    categories: ['decorations', 'tableware', 'balloons', 'party_favors', 'games'],
    affiliateId: 'invitegen-birthday',
  },
  wedding: {
    storeUrl: 'https://wedding-essentials.myshopify.com',
    storeName: 'Wedding Day Essentials',
    categories: ['decorations', 'favors', 'accessories', 'gifts', 'stationery'],
    affiliateId: 'invitegen-wedding',
  },
  baby_shower: {
    storeUrl: 'https://baby-celebration.myshopify.com',
    storeName: 'Baby Celebration Shop',
    categories: ['decorations', 'games', 'gifts', 'diapers', 'nursery'],
    affiliateId: 'invitegen-baby',
  },
  bridal_shower: {
    storeUrl: 'https://bridal-party-shop.myshopify.com',
    storeName: 'Bridal Party Shop',
    categories: ['decorations', 'games', 'gifts', 'accessories'],
    affiliateId: 'invitegen-bridal',
  },
  graduation: {
    storeUrl: 'https://grad-celebration.myshopify.com',
    storeName: 'Graduation Celebration',
    categories: ['decorations', 'gifts', 'cards', 'party_supplies'],
    affiliateId: 'invitegen-grad',
  },
  corporate: {
    storeUrl: 'https://corporate-events.myshopify.com',
    storeName: 'Corporate Event Supplies',
    categories: ['signage', 'gifts', 'catering', 'promotional'],
    affiliateId: 'invitegen-corp',
  },
  holiday: {
    storeUrl: 'https://holiday-party-shop.myshopify.com',
    storeName: 'Holiday Party Shop',
    categories: ['decorations', 'tableware', 'gifts', 'costumes'],
    affiliateId: 'invitegen-holiday',
  },
  dinner_party: {
    storeUrl: 'https://dinner-party-essentials.myshopify.com',
    storeName: 'Dinner Party Essentials',
    categories: ['tableware', 'decorations', 'wine', 'gourmet'],
    affiliateId: 'invitegen-dinner',
  },
};
```

### Product Recommendation Engine

```typescript
interface ProductRecommendation {
  // Based on event type
  eventProducts: Product[];

  // Based on guest count
  quantityRecommendations: {
    product: Product;
    recommendedQty: number;
    reason: string; // "For 50 guests, we recommend..."
  }[];

  // Based on event date
  urgencyDeals: {
    product: Product;
    discount: string;
    expiresIn: string;
  }[];

  // Based on location
  localServices: {
    type: 'catering' | 'venue' | 'photography' | 'entertainment';
    name: string;
    rating: number;
    affiliateLink: string;
  }[];
}
```

---

## 🔐 Authentication Architecture

### Supported Auth Providers

```typescript
const AUTH_PROVIDERS = {
  email: {
    enabled: true,
    provider: 'AWS Cognito',
  },
  google: {
    enabled: true,
    clientId: process.env.GOOGLE_CLIENT_ID,
    scopes: ['email', 'profile'],
    dataCollected: ['email', 'name', 'picture', 'locale'],
  },
  facebook: {
    enabled: true,
    clientId: process.env.FACEBOOK_APP_ID,
    scopes: ['email', 'public_profile'],
    dataCollected: ['email', 'name', 'picture', 'birthday', 'location'],
  },
  apple: {
    enabled: true,
    clientId: process.env.APPLE_CLIENT_ID,
    scopes: ['email', 'name'],
    dataCollected: ['email', 'name'],
  },
  twitter: {
    enabled: true,
    clientId: process.env.TWITTER_CLIENT_ID,
    scopes: ['tweet.read', 'users.read'],
    dataCollected: ['email', 'name', 'handle', 'followers_count'],
  },
};
```

### OAuth Flow

```
1. User clicks "Continue with Google"
2. Redirect to Google OAuth consent screen
3. User grants permissions
4. Google redirects back with auth code
5. Exchange code for tokens
6. Fetch user profile from Google
7. Create/update user in DynamoDB
8. Set session cookies
9. Track signup source for analytics
```

---

## 📧 Marketing & Email System

### Email Campaigns by User Segment

```typescript
const EMAIL_CAMPAIGNS = {
  // Triggered emails based on user actions
  triggers: {
    'invitation_created': {
      delay: '1 hour',
      subject: 'Your {eventType} invitation is ready! Here\'s what\'s next...',
      content: 'product_recommendations',
    },
    'rsvp_received': {
      delay: 'immediate',
      subject: '{guestName} is attending your {eventType}!',
      content: 'guest_count_upsell', // "Now that you have X guests..."
    },
    'event_approaching': {
      delay: '7 days before',
      subject: 'Your {eventType} is in 1 week! Last-minute essentials',
      content: 'urgency_products',
    },
    'post_event': {
      delay: '1 day after',
      subject: 'How was your {eventType}? Share photos & plan your next event!',
      content: 'retention_campaign',
    },
  },

  // Segment-based campaigns
  segments: {
    'new_parent': ['baby_products', 'parenting_tips', 'milestone_events'],
    'engaged_couple': ['wedding_planning', 'honeymoon_deals', 'registry'],
    'party_planner': ['bulk_discounts', 'planning_tools', 'vendor_network'],
    'corporate_organizer': ['enterprise_plans', 'team_features', 'expense_reports'],
  },
};
```

### Affiliate Partner Network

```typescript
interface AffiliatePartner {
  id: string;
  name: string;
  category: string;
  commission: string;        // "10%" or "$5 per lead"
  cookieDuration: number;    // Days
  trackingUrl: string;
  relevantEventTypes: EventType[];
}

const AFFILIATE_PARTNERS: AffiliatePartner[] = [
  {
    id: 'amazon',
    name: 'Amazon Associates',
    category: 'general_retail',
    commission: '4-10%',
    cookieDuration: 24, // hours
    trackingUrl: 'https://www.amazon.com/?tag=invitegen-20',
    relevantEventTypes: ['all'],
  },
  {
    id: 'etsy',
    name: 'Etsy Affiliate',
    category: 'handmade_gifts',
    commission: '5%',
    cookieDuration: 30,
    trackingUrl: 'https://www.etsy.com/?ref=invitegen',
    relevantEventTypes: ['wedding', 'baby_shower', 'bridal_shower'],
  },
  {
    id: 'vistaprint',
    name: 'Vistaprint',
    category: 'printing',
    commission: '15%',
    cookieDuration: 45,
    trackingUrl: 'https://www.vistaprint.com/?ref=invitegen',
    relevantEventTypes: ['wedding', 'corporate', 'graduation'],
  },
  {
    id: 'partycity',
    name: 'Party City',
    category: 'party_supplies',
    commission: '6%',
    cookieDuration: 7,
    trackingUrl: 'https://www.partycity.com/?aff=invitegen',
    relevantEventTypes: ['birthday', 'holiday', 'graduation'],
  },
  {
    id: 'zola',
    name: 'Zola Registry',
    category: 'registry',
    commission: '$25 per signup',
    cookieDuration: 30,
    trackingUrl: 'https://www.zola.com/?ref=invitegen',
    relevantEventTypes: ['wedding', 'bridal_shower'],
  },
  {
    id: 'babylist',
    name: 'Babylist Registry',
    category: 'registry',
    commission: '$20 per signup',
    cookieDuration: 30,
    trackingUrl: 'https://www.babylist.com/?ref=invitegen',
    relevantEventTypes: ['baby_shower'],
  },
];
```

---

## ⚖️ Legal Compliance

### GDPR Requirements

```typescript
// Data Subject Rights Implementation
const GDPR_COMPLIANCE = {
  rightToAccess: {
    endpoint: '/api/user/data-export',
    description: 'User can download all their data',
  },
  rightToErasure: {
    endpoint: '/api/user/delete-account',
    description: 'User can delete their account and all data',
  },
  rightToRectification: {
    endpoint: '/api/user/profile',
    description: 'User can update their information',
  },
  rightToPortability: {
    endpoint: '/api/user/data-export?format=json',
    description: 'User can export data in machine-readable format',
  },
  rightToObject: {
    endpoint: '/api/user/marketing-preferences',
    description: 'User can opt out of marketing',
  },
};
```

### CCPA Requirements

```typescript
const CCPA_COMPLIANCE = {
  rightToKnow: {
    description: 'Disclose what data we collect',
    implementation: 'Privacy Policy + /api/user/data-export',
  },
  rightToDelete: {
    description: 'Delete personal information on request',
    implementation: '/api/user/delete-account',
  },
  rightToOptOut: {
    description: 'Opt out of sale of personal information',
    implementation: 'Do Not Sell My Info link + /api/user/privacy-settings',
  },
  rightToNonDiscrimination: {
    description: 'Equal service regardless of privacy choices',
    implementation: 'Free features available to all users',
  },
};
```

### Required Legal Pages

1. **Privacy Policy** (`/privacy`)
   - What data we collect
   - How we use it
   - Who we share with
   - User rights
   - Cookie usage
   - Third-party services

2. **Terms of Service** (`/terms`)
   - User responsibilities
   - Acceptable use
   - Intellectual property
   - Limitation of liability
   - Dispute resolution

3. **Cookie Policy** (`/cookies`)
   - Types of cookies used
   - Purpose of each cookie
   - How to manage cookies
   - Third-party cookies

4. **Do Not Sell My Info** (`/do-not-sell`)
   - CCPA opt-out form
   - Verification process
   - Confirmation

---

## 🔄 Data Flow Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   User Signup   │────▶│  Data Enrichment │────▶│  Segmentation   │
│  (Social/Email) │     │  (Profile Build) │     │  (Marketing)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ Create Invitation│────▶│ Event Intelligence│────▶│Product Recommend│
│  (Event Data)   │     │  (Type, Date,    │     │  (Shopify API)  │
│                 │     │   Guests, Style) │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  RSVP Collection │────▶│ Guest Analytics  │────▶│ Email Campaigns │
│  (Guest Data)   │     │  (Dietary, Count)│     │  (Triggered)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ Affiliate Clicks │────▶│ Revenue Tracking │────▶│   Reporting     │
│  (Commission)   │     │  (Attribution)   │     │  (Dashboard)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

---

## 📈 Analytics & Tracking

### Events to Track

```typescript
const ANALYTICS_EVENTS = {
  // User Lifecycle
  'user.signup': { provider: string; source: string; },
  'user.login': { provider: string; },
  'user.consent_update': { marketing: boolean; thirdParty: boolean; },

  // Invitation Lifecycle
  'invitation.created': { eventType: string; templateId: string; },
  'invitation.published': { invitationId: string; guestCount: number; },
  'invitation.viewed': { invitationId: string; source: string; },
  'invitation.shared': { invitationId: string; platform: string; },

  // RSVP Lifecycle
  'rsvp.submitted': { invitationId: string; response: string; guestCount: number; },
  'rsvp.updated': { invitationId: string; },

  // Commerce Events
  'product.viewed': { productId: string; eventType: string; },
  'product.clicked': { productId: string; affiliateId: string; },
  'store.visited': { storeId: string; eventType: string; },
  'affiliate.clicked': { partnerId: string; productCategory: string; },

  // Email Events
  'email.sent': { campaignId: string; userId: string; },
  'email.opened': { campaignId: string; userId: string; },
  'email.clicked': { campaignId: string; linkId: string; },
  'email.unsubscribed': { userId: string; reason: string; },
};
```

---

## 🗄️ Database Schema (Extended)

### New Tables for Marketing

```
TABLE: invitegenerator-user-events
├── PK: userId (String)
├── SK: timestamp#eventType (String)
├── eventType (String)
├── eventData (Map)
├── createdAt (String)
└── GSI: eventType-index on eventType

TABLE: invitegenerator-affiliate-clicks
├── PK: clickId (String)
├── userId (String)
├── partnerId (String)
├── productId (String)
├── invitationId (String)
├── eventType (String)
├── clickedAt (String)
├── convertedAt (String)
├── commission (Number)
└── GSI: userId-index on userId
└── GSI: partnerId-index on partnerId

TABLE: invitegenerator-email-campaigns
├── PK: campaignId (String)
├── SK: recipientId (String)
├── status (String) - sent|delivered|opened|clicked|bounced
├── sentAt (String)
├── openedAt (String)
├── clickedAt (String)
└── GSI: recipientId-index on recipientId

TABLE: invitegenerator-consent-log
├── PK: consentId (String)
├── userId (String)
├── action (String) - granted|revoked|updated
├── consentType (String) - marketing|thirdParty|analytics
├── timestamp (String)
├── ipAddress (String)
├── userAgent (String)
└── GSI: userId-index on userId
```

---

## 🔌 API Endpoints Reference

### Authentication APIs
```
POST /api/auth/signup           - Email signup
POST /api/auth/login            - Email login
POST /api/auth/logout           - Logout
POST /api/auth/social/google    - Google OAuth
POST /api/auth/social/facebook  - Facebook OAuth
POST /api/auth/social/apple     - Apple OAuth
POST /api/auth/social/twitter   - Twitter OAuth
POST /api/auth/forgot-password  - Request password reset
POST /api/auth/reset-password   - Confirm password reset
```

### User APIs
```
GET  /api/user/profile          - Get user profile
PATCH /api/user/profile         - Update profile
GET  /api/user/data-export      - Export all user data (GDPR)
DELETE /api/user/account        - Delete account (GDPR)
GET  /api/user/marketing-preferences  - Get marketing prefs
PATCH /api/user/marketing-preferences - Update marketing prefs
POST /api/user/consent          - Record consent action
```

### Invitation APIs
```
GET  /api/invitations           - List user invitations
POST /api/invitations           - Create invitation
GET  /api/invitations/:id       - Get single invitation
PATCH /api/invitations/:id      - Update invitation
DELETE /api/invitations/:id     - Delete invitation
POST /api/invitations/:id/publish   - Publish invitation
DELETE /api/invitations/:id/publish - Unpublish invitation
POST /api/invitations/:id/duplicate - Duplicate invitation
```

### RSVP APIs
```
GET  /api/rsvp/:invitationId    - Get RSVPs (auth required)
POST /api/rsvp/:invitationId    - Submit RSVP (public)
GET  /api/rsvp/:invitationId/export - Export RSVPs to CSV
```

### Public APIs
```
GET  /api/public/invitation/:shortId - Get public invitation
```

### Commerce APIs
```
GET  /api/recommendations/:eventType  - Get product recommendations
POST /api/affiliate/click             - Track affiliate click
GET  /api/stores/:eventType           - Get Shopify store info
```

### Analytics APIs
```
POST /api/analytics/event       - Track analytics event
GET  /api/analytics/dashboard   - Get analytics (admin)
```

---

*Architecture Document - Last Updated: December 7, 2025*
