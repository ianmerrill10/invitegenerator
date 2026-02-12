# Wedding Vendor Outreach Research & Contact Sources

**Created:** 2024-12-18
**Goal:** Build database of wedding vendors to partner with as affiliates, advertisers, and referral sources

---

## TARGET VENDOR CATEGORIES

### 1. Wedding Venues
- Hotels with wedding facilities
- Banquet halls
- Country clubs
- Wineries/Vineyards
- Barns/Rustic venues
- Beach venues
- Garden venues
- Historic mansions
- Rooftop venues
- Destination wedding resorts

### 2. Wedding DJs & Entertainment
- DJ services
- Live bands
- Solo musicians
- String quartets
- Ceremony musicians
- Photo booth companies
- Dance floor rental

### 3. Wedding Singers & Musicians
- Ceremony singers
- Jazz vocalists
- Opera singers
- Gospel choirs
- Acoustic guitarists
- Pianists
- Harpists

### 4. Photographers & Videographers
- Wedding photographers
- Engagement photographers
- Drone videography
- Photo booth services

### 5. Planners & Coordinators
- Full-service wedding planners
- Day-of coordinators
- Destination wedding planners
- Budget wedding planners

### 6. Catering & Cake
- Wedding caterers
- Food trucks
- Cake designers
- Dessert bars

### 7. Florals & Decor
- Florists
- Rental companies (chairs, linens, etc.)
- Lighting companies
- Arch/arbor rentals

### 8. Beauty & Attire
- Bridal shops
- Tuxedo rentals
- Hair & makeup artists
- Mobile spa services

### 9. Stationery & Invitations (Competitors but potential partners)
- Print shops
- Calligraphers
- We complement their physical offerings with digital

---

## CONTACT LIST SOURCES TO PURCHASE

### 1. ZoomInfo / Apollo.io
- **Cost:** $5,000-15,000/year
- **Coverage:** Business emails with job titles
- **Best For:** Venue owners, event managers
- **URL:** zoominfo.com, apollo.io

### 2. The Knot Pro Marketplace
- **URL:** theknot.com/marketplace
- **Strategy:** Scrape vendor profiles (use LinkedIn Sales Navigator)
- **Note:** Many vendors pay $200+/month to be listed here

### 3. WeddingWire Vendor Directory
- **URL:** weddingwire.com/vendors
- **Strategy:** Build scraping tool or manual collection
- **Vendors Listed:** 500,000+

### 4. InfoUSA / Data.com
- **Cost:** $0.05-0.50 per contact
- **Coverage:** US business database
- **SIC Codes:** 7941 (Dance Studios), 5621 (Bridal Shops)

### 5. D&B Hoovers
- **Cost:** $10,000+/year
- **Coverage:** Comprehensive business data
- **Best For:** Enterprise-level outreach

### 6. UpLead
- **Cost:** $99-399/month
- **Coverage:** Verified B2B contacts
- **URL:** uplead.com

### 7. Hunter.io
- **Cost:** $49-399/month
- **Best For:** Finding emails from company websites
- **URL:** hunter.io

### 8. Clearbit
- **Cost:** Custom pricing
- **Best For:** Enriching existing contacts
- **URL:** clearbit.com

### 9. Lusha
- **Cost:** $99-199/month
- **Coverage:** Direct phone numbers + emails
- **URL:** lusha.com

### 10. LinkedIn Sales Navigator
- **Cost:** $99/month
- **Best For:** Finding decision makers at venues
- **Strategy:** Search "Wedding Coordinator" or "Event Manager"

---

## FREE/LOW-COST RESEARCH METHODS

### Social Media Mining

**Instagram:**
- Search hashtags: #weddingdj, #weddingvenue, #weddingplanner
- Location tags at wedding venues
- Follow wedding industry accounts
- Tools: PhantomBuster, Jarvee (caution with TOS)

**Facebook:**
- Wedding vendor groups
- Local wedding networking groups
- Business pages in wedding category
- Facebook Marketplace (venues for rent)

**TikTok:**
- #WeddingTok vendors
- Wedding vendor recommendations
- Behind-the-scenes content creators

**Pinterest:**
- Wedding professional accounts
- Pinterest business accounts in wedding niche

### Wedding Directories to Mine

1. **The Knot** - theknot.com/marketplace
2. **WeddingWire** - weddingwire.com
3. **Zola** - zola.com/wedding-vendors
4. **Brides** - brides.com/wedding-vendor-search
5. **Wedding Spot** - wedding-spot.com
6. **Here Comes The Guide** - herecomestheguide.com
7. **PartySlate** - partyslate.com
8. **Junebug Weddings** - junebugweddings.com
9. **Carats & Cake** - caratsandcake.com
10. **Borrowed & Blue** - borrowedandblue.com

### Industry Associations

**Wedding Industry Associations (Members Lists):**
1. Association of Bridal Consultants (ABC)
2. International Special Events Society (ISES)
3. Wedding International Professionals Association (WIPA)
4. National Association of Catering and Events (NACE)
5. Professional DJs of America (PDJA)
6. Professional Photographers of America (PPA)
7. American Institute of Floral Designers (AIFD)

**Strategy:** Many have member directories or attend conferences

### Trade Shows & Conferences

1. **Wedding MBA** - Las Vegas (November)
2. **WIPA Annual Conference**
3. **The Special Event (TSE)** - January
4. **Engage! Summit** - Various locations
5. **ABC Annual Conference**
6. **WeddingPro Conference** (The Knot)

**Strategy:** Sponsor or attend for direct vendor contact

### Local Sources

- Chamber of Commerce business directories
- Local wedding magazines
- Regional bridal shows
- Convention center vendor lists

---

## CONTACT DATABASE SCHEMA (For CRM)

```typescript
interface VendorContact {
  id: string;
  company: string;
  contactName: string;
  title: string;
  email: string;
  phone?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  category: VendorCategory;
  subcategory?: string;
  location: {
    city: string;
    state: string;
    country: string;
  };
  source: ContactSource;
  status: ContactStatus;
  tags: string[];
  notes: string;
  outreachHistory: OutreachRecord[];
  partnershipStatus: PartnershipStatus;
  createdAt: string;
  updatedAt: string;
  lastContactedAt?: string;
}

type VendorCategory =
  | "venue"
  | "dj"
  | "musician"
  | "photographer"
  | "videographer"
  | "planner"
  | "caterer"
  | "florist"
  | "beauty"
  | "rentals"
  | "stationery"
  | "other";

type ContactSource =
  | "the_knot"
  | "wedding_wire"
  | "instagram"
  | "facebook"
  | "linkedin"
  | "referral"
  | "trade_show"
  | "cold_outreach"
  | "purchased_list"
  | "website_scrape"
  | "manual";

type ContactStatus =
  | "new"
  | "contacted"
  | "responded"
  | "meeting_scheduled"
  | "negotiating"
  | "converted"
  | "rejected"
  | "unresponsive"
  | "do_not_contact";

type PartnershipStatus =
  | "none"
  | "affiliate"
  | "advertiser"
  | "referral_partner"
  | "integration_partner";

interface OutreachRecord {
  id: string;
  date: string;
  type: "email" | "phone" | "social" | "meeting" | "conference";
  notes: string;
  response?: string;
  nextFollowUp?: string;
}
```

---

## OUTREACH TEMPLATES

### Initial Contact Email

**Subject:** Partnership opportunity for [Company Name] - InviteGenerator

Hi [Name],

I came across [Company Name] while researching top [category] in [location], and I'm impressed by your work!

I'm reaching out from InviteGenerator, a digital invitation platform that helps couples create stunning, shareable wedding invitations with built-in RSVP tracking.

I think there's a great opportunity for us to partner:

**For you:**
- Earn 30-50% recurring commission on referrals
- Offer your clients a complimentary digital solution
- Enhance your service offering

**For your clients:**
- Beautiful, customizable digital invitations
- Real-time RSVP tracking
- Eco-friendly alternative to paper

Would you be open to a quick 15-minute call to explore how we could work together?

Best,
[Your name]
InviteGenerator

---

### Follow-up Email (3 days later)

**Subject:** Quick follow-up - [Company Name] + InviteGenerator

Hi [Name],

Just wanted to follow up on my previous email about a potential partnership.

Our affiliate partners typically earn $500-2,000/month by recommending InviteGenerator to their clients. With your volume of weddings, I think you could easily exceed that.

I'd love to give you a quick demo and set you up with a free account to try.

Available for a brief call this week?

Best,
[Your name]

---

### Instagram DM Template

Hey [Name]! 👋

Love your work at [Company]! The [specific work/post] was stunning.

Quick question - do any of your couples ever ask about digital invitations? We've built a beautiful platform (InviteGenerator) and are partnering with top wedding pros like yourself.

Our partners earn 30-50% commission on referrals. Would you be interested in learning more?

---

## IMMEDIATE ACTION ITEMS

### Week 1:
1. [ ] Set up Hunter.io account ($49/month)
2. [ ] Export top 100 venues from The Knot (manual)
3. [ ] Create Instagram target list (50 vendors)
4. [ ] Send first 25 outreach emails
5. [ ] Join 5 wedding vendor Facebook groups

### Week 2:
1. [ ] Purchase targeted list from UpLead (500 contacts, ~$200)
2. [ ] Send 100 outreach emails
3. [ ] Follow up on Week 1 contacts
4. [ ] Start LinkedIn outreach (20/day)
5. [ ] DM 50 Instagram accounts

### Week 3-4:
1. [ ] Analyze response rates
2. [ ] Refine messaging based on results
3. [ ] Scale what's working
4. [ ] Book partnership calls
5. [ ] Onboard first partners

---

## METRICS TO TRACK

- Contacts added per week
- Emails sent per week
- Response rate (%)
- Meetings booked
- Partners signed
- Revenue from partnerships

---

## BUDGET ESTIMATE

| Item | Monthly Cost |
|------|-------------|
| Hunter.io | $49 |
| LinkedIn Sales Navigator | $99 |
| UpLead or Apollo | $200 |
| Email tools (Mailshake/Lemlist) | $99 |
| **Total** | **$447/month** |

Optional one-time purchases:
- Targeted list (5,000 contacts): $500-1,000
- ZoomInfo trial: Free for 14 days

---

**Next Review Date:** [Set weekly]
