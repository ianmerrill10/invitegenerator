# INVITEGENERATOR.COM - DEVELOPMENT HANDOFF DOCUMENT
## Session: December 16, 2025 | Prepared for VS Code Continuation

---

# 🎯 EXECUTIVE SUMMARY

Two major new revenue features were designed for InviteGenerator.com:

1. **INVITATION PACKAGES** - Physical product bundles (printed invitations + curated Amazon items)
2. **REGISTRY & GIFT GUIDANCE** - Reverse monetization through gift registries and "in lieu of gifts" alternatives

**Combined Revenue Potential:** $300-500+ per event (vs ~$15 for digital-only invitations)

---

# 📋 PROJECT CONTEXT

## About InviteGenerator.com
- **What it is:** AI-powered digital invitation platform (SaaS, freemium model)
- **Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, AWS (Cognito, DynamoDB, S3, Bedrock, SES), Stripe
- **Design System:** Coral/orange primary (#FF6B47), teal accent (#14B8A6), Playfair Display headings, Inter body
- **Budget:** $100/month operational (IONOS hosting + AWS)
- **Current Status:** ~60% complete (Phase 4 of 5), 298/1001 templates done
- **Priority Order:** Security → Profitability/Growth → Maximum Work Output

## What Was Designed Today
Two interconnected feature systems that transform the platform from digital-only to physical+digital hybrid:

### Feature 1: Invitation Packages
**Concept:** Bundle printed invitations with curated physical items from Amazon

- Host selects a package (e.g., "Wedding Invitation Classic" - $149)
- Package includes printed invitations + 6-10 physical items
- User can deselect items to reduce price (flexible pricing)
- You earn margin on invitations + Amazon affiliate commission on items
- Zero inventory model: print partner handles invitations, Amazon ships items

### Feature 2: Registry & Gift Guidance
**Concept:** Printed cards that accompany invitations, guiding guests on gifts

- Traditional registry QR cards (link to Amazon registry)
- Curated gift list cards (your affiliate links)
- "In Lieu of Gifts" cards (charity donations, experience funds, service signups)
- Group gift coordination (pool money for big items)
- **Key insight:** You earn affiliate when HOST buys package AND when GUESTS buy gifts

---

# 💰 REVENUE MODEL BREAKDOWN

## Package Sales (Host Buys)
```
Example: $99 Wedding Package
├── Printed Invitations Cost: $30 → Charge: $50 = $20 margin
├── Amazon Items Cost: $35 → Affiliate: ~$2-4
├── Curation Fee: $15-25 (built into price)
├── Platform Fee: $10-15
└── YOUR PROFIT: $47-64 per package (47-65% margin)
```

## Registry Revenue (Guests Buy)
```
Example: Wedding with 100 guests
├── Registry Card Add-on to host: $15-25
├── 60 guests buy gifts (~$75 average each)
├── Total Gift GMV: $4,500
├── Your Affiliate (4%): $180
├── Experience Fund Fees (if used): $150-250
└── YOUR PROFIT: $345-455 additional per event
```

## Amazon Affiliate Commission Rates
| Category | Rate |
|----------|------|
| Home & Kitchen | 3% |
| Toys & Games | 3% |
| Office Products | 4% |
| Arts, Crafts & Sewing | 5% |
| Handmade | 5% |

---

# 📦 INVITATION PACKAGES - COMPLETE SPECIFICATION

## Tier System
| Tier | Name | Price Range | Items | Target |
|------|------|-------------|-------|--------|
| Starter | Essentials | $29-49 | 2-3 items | Budget-conscious |
| Popular | Classic | $59-99 | 4-6 items | Average host |
| Premium | Deluxe | $119-169 | 7-10 items | Quality-focused |
| Luxury | Ultimate | $199-299 | 12-15 items | Premium experience |

## All 35 Packages Designed

### WEDDING (6 packages)
1. **W1: Elegant Engagement Announcement** - $79
   - 25 invitations, ring dish, "Engaged" banner, champagne flutes, confetti cannon, photo frames
   
2. **W2: Save the Date Starter** - $49
   - 50 save-the-dates, magnetic backing strips, envelope seals, calendar stickers
   
3. **W3: Wedding Invitation Classic** - $149
   - 75 invitations, 75 RSVP cards, wax seal kit, ribbons, envelope liners, calligraphy pens, sealing wax
   
4. **W4: Wedding Invitation Ultimate** - $249
   - 100 invitations, 100 RSVPs, 100 details cards, custom wax seal, vellum wraps, silk ribbons, guest book, thank you cards
   
5. **W5: Bridal Shower Host Kit** - $99
   - 30 invitations, bride sash, tiara, games (5), balloon arch, straws, advice cards, ring toss
   
6. **W6: Rehearsal Dinner Elegance** - $89
   - 40 invitations, table numbers, place card holders, menu cards, votive holders

### BIRTHDAY (5 packages)
1. **B1: Kids Birthday Bash (1-5)** - $69
   - 25 invitations, number balloon, banner, party hats, goodie bags, stickers, tablecloth, cupcake toppers
   
2. **B2: Milestone Birthday (30/40/50/60)** - $119
   - 50 invitations, photo banner, "Cheers to XX Years" banner, number balloons, photo props, memory book, confetti, cake topper
   
3. **B3: Teen Birthday (13-19)** - $79
   - 30 invitations, LED light strip, photo props, glow sticks, camera/film, playlist QR cards
   
4. **B4: 1st Birthday Spectacular** - $99
   - 40 invitations, "ONE" balloons, smash cake topper, monthly photo banner, high chair banner, crown, fingerprint tree, thank you cards
   
5. **B5: Adult Birthday Soirée** - $89
   - 35 invitations, balloon garland, wine charms, cocktail napkins, photo guest book, candles

### BABY (4 packages)
1. **BA1: Baby Shower Classic** - $89
   - 35 invitations, "Baby" balloons, diaper raffle tickets, games (5), advice cards, mommy sash, bingo cards, favor bags, pacifier necklace supplies
   
2. **BA2: Gender Reveal Extravaganza** - $79
   - 30 invitations, confetti cannons (4), voting cards, reveal balloon, photo props, scratch-off cards
   
3. **BA3: Sip and See Welcome** - $69
   - 40 invitations, photo display stand, guest book, balloon bouquet, thank you cards
   
4. **BA4: Sprinkle (2nd+ Baby)** - $59
   - 25 invitations, sprinkle confetti, banner, mini diaper cake supplies, advice cards, favor bags

### GRADUATION (3 packages)
1. **G1: High School Graduation** - $79
   - 50 announcements, class banner, photo clips, confetti, guest book, diploma frame
   
2. **G2: College Graduation** - $99
   - 75 announcements, school colors balloon arch, "Tassel Worth Hassle" sign, memory book, thank you cards
   
3. **G3: Kindergarten/Elementary** - $49
   - 25 invitations, mini grad caps, "Future is Bright" banner, star stickers, photo frame craft kit

### HOLIDAY (6 packages)
1. **H1: Christmas Party Host Kit** - $89
2. **H2: Halloween Spooktacular** - $79
3. **H3: New Year's Eve Countdown** - $99
4. **H4: Thanksgiving Gathering** - $69
5. **H5: Easter Celebration** - $59
6. **H6: 4th of July Bash** - $69

### CORPORATE (3 packages)
1. **C1: Corporate Event Professional** - $149
2. **C2: Networking Event Kit** - $99
3. **C3: Retirement Celebration** - $89

### RELIGIOUS/CULTURAL (4 packages)
1. **R1: Baptism/Christening** - $79
2. **R2: First Communion** - $89
3. **R3: Bar/Bat Mitzvah** - $149
4. **R4: Quinceañera Princess** - $129

### SPECIAL OCCASION (4 packages)
1. **S1: Anniversary Celebration** - $99
2. **S2: Housewarming Welcome** - $59
3. **S3: Farewell/Going Away** - $69
4. **S4: Divorce Party** - $79

## Dynamic Pricing Logic
When user deselects an item:
```
New Price = Base Price - Item Price - (Proportional Curation Fee)

Example:
- Base Package: $99 with 6 items
- Curation Fee: $15 distributed across items by weight
- User deselects $12 item (weight: 2 of total 10)
- Curation reduction: $15 × (2/10) = $3
- New Price: $99 - $12 - $3 = $84
```

## Fulfillment Model (ZERO INVENTORY)
1. Customer buys package on InviteGenerator.com
2. You charge full package price via Stripe
3. Send invitation order to print partner (Printful/Gooten/Gelato)
4. Redirect customer to Amazon with pre-filled affiliate cart OR send them individual affiliate links
5. Customer receives 2 shipments (invitations + Amazon items)
6. You pocket the margin + affiliate commissions

---

# 🎁 REGISTRY & GIFT GUIDANCE - COMPLETE SPECIFICATION

## Product Offerings

### Add-On Cards (sold with packages)
| Card Type | Price | Contents |
|-----------|-------|----------|
| Basic QR Card | +$8 | QR code linking to registry |
| Curated List Card | +$15 | 8-10 items with prices + QR |
| Registry Booklet | +$25 | 4-page premium booklet |
| Multi-Cause Card | +$12 | 3-4 charity options |
| Experience Fund Card | +$18 | Fund with progress display |
| Group Gift Card | +$20 | Single item + tracking |
| Service Sign-Up Card | +$12 | Meal train, help schedule |
| Complete Suite | +$45 | All cards + online hub |

### Standalone Products
| Product | Price | Description |
|---------|-------|-------------|
| Registry Landing Page | $19/event | Custom URL with all registries |
| Gift Tracker Dashboard | $9/event | See what's purchased |
| Thank You Card Generator | $15/event | Auto-generate based on gifts |
| Group Gift Management | $12/campaign | Collect funds, track |
| Experience Fund Page | 3% + $0.50/tx | Payment processing |

## "In Lieu of Gifts" Alternatives

### By Event Type

**WEDDINGS:**
- Honeymoon fund (specific experiences)
- First home fund
- Date night fund
- Charity donations
- Tree planting
- Adventure fund

**BABY EVENTS:**
- 529 College fund
- Diaper fund
- Meal train signups
- Babysitting credits
- Children's hospital donation
- Book collection

**BIRTHDAYS:**
- Charity donations
- Experience fund
- Pay it forward
- Blood donation
- Volunteer hours
- Memory book contributions

**GRADUATIONS:**
- Student loan fund
- First apartment fund
- Professional wardrobe
- Gap year travel
- Certification fund

**RETIREMENT:**
- Bucket list fund
- Charity legacy
- Travel fund
- Hobby equipment
- Grandkid fund

## Charity Categories (100+ charities catalogued)
- Environmental (WWF, Ocean Conservancy, One Tree Planted)
- Animal Welfare (ASPCA, Humane Society)
- Health & Medical (St. Jude, American Cancer Society)
- Children & Education (UNICEF, DonorsChoose)
- Housing & Basic Needs (Habitat for Humanity, Feeding America)
- Veterans (Wounded Warrior Project)
- International Aid (CARE, Kiva)

## Experience Fund Templates
| Category | Examples | Suggested Amounts |
|----------|----------|-------------------|
| Honeymoon | Dinner, sailing, spa | $100-400 each |
| Baby | College, childcare, first vacation | $1,000-5,000 |
| Graduation | Loans, apartment, wardrobe | $500-5,000 |
| Retirement | Bucket list, travel, hobbies | $1,000-5,000 |

## Service/Time Signup Types
- Meal train (post-baby, illness)
- Dog walking
- Babysitting
- House cleaning
- Yard work
- Transportation
- Grocery shopping

## Group Gift Ideas
| Event | Items | Price Range |
|-------|-------|-------------|
| Wedding | Camera, KitchenAid, Dyson, furniture | $500-3,000 |
| Baby | UPPAbaby stroller, Snoo, nursery set | $400-2,500 |
| Graduation | MacBook, standing desk, car down payment | $1,000-5,000 |
| Retirement | E-bike, golf set, cruise cabin | $1,500-5,000 |

---

# 💻 CODE ALREADY CREATED

## TypeScript Interfaces

### packages.ts (~300 lines)
- `InvitationPackage` - Main package definition
- `PackageItem` - Individual items with Amazon info
- `InvitationConfig` - Print settings
- `CustomizedPackage` - User selections
- `PriceBreakdown` - Calculated pricing
- `PackageOrder` - Order tracking
- All enums: `PackageCategory`, `PackageTier`, `ItemCategory`, `PaperType`, `OrderStatus`

### registry.ts (~400 lines)
- `GiftRegistry` - Main registry
- `RegistryItem` - Products, donations, experiences
- `ExperienceFund` - Honeymoon/travel funds
- `ServiceRequest` & `ServiceSignup` - Time contributions
- `GroupGiftCampaign` - Pooled purchases
- `CharityOption` & `Charity` - Donation tracking
- `RegistryCardConfig` - Printed card settings
- All enums: `RegistryType`, `ItemType`, `CardType`, `PrivacyLevel`, etc.

### pricingCalculator.ts (~250 lines)
- `PackagePricingCalculator` class with methods:
  - `calculate()` - Full price breakdown
  - `getShippingOptions()` - All shipping tiers
  - `getItemDetails()` - Per-item impact
  - `calculateWithItemToggled()` - Preview price changes
  - `getMinimumPrice()` / `getMaximumPrice()`
- Constants for paper upgrades, shipping rates, tax, Amazon commissions
- Standalone functions: `calculatePackagePrice()`, `formatPrice()`, `getSavingsDisplay()`

---

# 🔨 WHAT NEEDS TO BE BUILT NEXT

## Priority 1: Package Display UI
- Package card component (image, name, price, items preview)
- Package grid/list view
- Category filter tabs
- Tier filter
- Price range filter
- Sort options (price, popularity, newest)

## Priority 2: Package Customization Interface
- Full package detail page
- Item list with checkboxes (select/deselect)
- Real-time price calculator display
- Savings badge ("Save $29!")
- Invitation quantity adjuster
- Paper upgrade selector
- "Add to Cart" CTA

## Priority 3: Amazon Product Database
- Create spreadsheet/database of all items
- Research ASINs for each item
- Capture current prices
- Generate affiliate link templates
- Store product images

## Priority 4: Registry Builder (Host Side)
- Registry creation wizard
- Item addition interface
- Fund creation (experience, group gift)
- Charity selection
- Service signup configuration
- Privacy/sharing settings

## Priority 5: Registry Public Page (Guest Side)
- Public registry landing page
- Item display with purchase links
- Fund progress bars
- Contribution forms
- Thank you confirmations

## Priority 6: Printed Card Generator
- Card template components (React → PDF)
- QR code generation
- Dynamic content insertion
- Print-ready export

---

# 🏗️ SUGGESTED DATABASE SCHEMA

## Packages Collection (DynamoDB)
```
PK: PACKAGE#{packageId}
SK: METADATA
- name, slug, category, tier
- description, shortDescription
- basePrice, curationFee
- images[], tags[]
- isActive, isFeatured
- popularity, reviewCount, averageRating
- createdAt, updatedAt

PK: PACKAGE#{packageId}
SK: ITEM#{itemId}
- name, description
- amazonAsin, affiliateLink
- basePrice, imageUrl
- isRequired, category, weight, sortOrder
```

## Registries Collection
```
PK: REGISTRY#{registryId}
SK: METADATA
- userId, eventId, type
- title, description, customUrl
- settings{}, stats{}
- isActive, expiresAt
- createdAt, updatedAt

PK: REGISTRY#{registryId}
SK: ITEM#{itemId}
- type, name, price
- amazonAsin, affiliateLink
- isPurchased, quantity, quantityFulfilled
- priority, category
```

## Orders Collection
```
PK: ORDER#{orderId}
SK: METADATA
- userId, orderNumber
- customizedPackageId
- status, priceBreakdown{}
- shippingAddress{}, billingAddress{}
- paymentIntentId
- amazonCartUrl, printOrderId
- trackingNumbers[]
- createdAt, completedAt
```

---

# ⚡ QUICK REFERENCE

## Design System
- Primary: #FF6B47 (coral/orange)
- Accent: #14B8A6 (teal)
- Headings: Playfair Display
- Body: Inter

## Key Files to Create
```
src/
├── types/
│   ├── packages.ts ✅ (created)
│   └── registry.ts ✅ (created)
├── services/
│   └── pricingCalculator.ts ✅ (created)
├── components/
│   ├── packages/
│   │   ├── PackageCard.tsx
│   │   ├── PackageGrid.tsx
│   │   ├── PackageDetail.tsx
│   │   ├── ItemSelector.tsx
│   │   ├── PriceDisplay.tsx
│   │   └── PackageCheckout.tsx
│   └── registry/
│       ├── RegistryBuilder.tsx
│       ├── RegistryPublicView.tsx
│       ├── FundProgress.tsx
│       ├── ServiceSignup.tsx
│       └── CardPreview.tsx
├── pages/
│   ├── packages/
│   │   ├── index.tsx (browse)
│   │   └── [slug].tsx (detail)
│   └── registry/
│       ├── create.tsx
│       └── [customUrl].tsx (public view)
└── lib/
    ├── amazon.ts (affiliate link generation)
    ├── stripe.ts (fund payments)
    └── print.ts (print partner API)
```

## API Routes Needed
```
/api/packages
  GET / - List packages with filters
  GET /:id - Get package details
  
/api/packages/calculate
  POST - Calculate price for selections

/api/orders
  POST - Create package order
  GET /:id - Get order status

/api/registries
  POST - Create registry
  GET /:customUrl - Get public registry
  PUT /:id - Update registry
  
/api/registries/:id/items
  POST - Add item
  PUT /:itemId - Update item
  DELETE /:itemId - Remove item

/api/contributions
  POST - Record gift purchase/fund contribution
```

---

# 🚨 IMPORTANT REMINDERS

1. **Security First** - Never sacrifice security for speed or cost savings
2. **No Unauthorized Changes** - Follow instructions exactly, no creative deviations
3. **Amazon Associates** - Need to apply once you have sales history
4. **Stripe Connect** - Required for experience fund payouts to hosts
5. **Print Partner** - Evaluate Printful vs Gooten vs Gelato for best rates

---

# 📁 FILES IN BACKUP ZIP

```
invitegenerator-packages-registry-backup.zip
├── README.md
├── 01-INVITATION-PACKAGES-STRATEGY.md
├── 02-PACKAGE-CATALOG.md
├── 03-REGISTRY-GIFT-GUIDANCE-STRATEGY.md
├── 04-IN-LIEU-OF-GIFTS-CATALOG.md
├── 05-CONVERSATION-SUMMARY.md
└── src/
    ├── types/
    │   ├── packages.ts
    │   └── registry.ts
    └── services/
        └── pricingCalculator.ts
```

---

# ✅ SESSION VERIFICATION

**Did I do exactly as told?** YES
- Created invitation packages concept as requested
- Designed flexible pricing with item deselection
- Created registry/gift guidance system (reverse concept)
- Included "in lieu of gifts" alternatives beyond just charity
- Provided comprehensive handoff documentation

**No unauthorized changes were made.**

---

*Handoff document created December 16, 2025 - Ready for VS Code continuation*
