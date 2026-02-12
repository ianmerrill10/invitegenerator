# InviteGenerator - Monetization Blueprint & Path to Revenue

**Date:** February 6, 2026
**Goal:** First dollar ASAP, $50K net profit by end of 2026
**Current State:** Product 80-85% built, all revenue infrastructure wired, NOT yet launched

---

## THE BRUTAL TRUTH

You have a fully built product sitting on the shelf. Every day it's not live, it's earning $0. The code is 80-85% done. The blockers are **22-30 hours of work**. That's it. 3-4 focused days between you and revenue.

**The #1 priority is: GET LIVE. Ship imperfect. Fix in production.**

---

## PHASE 0: GET TO $1 (Week 1)

**Goal:** Fix blockers, deploy, get first paying customer.
**Timeline:** 3-4 days of focused work.

### Day 1-2: Fix the 4 Blockers

These are the ONLY things preventing the app from processing money:

1. **Import path fix** (5 minutes) — `@/lib/prodigi/client` → `@/lib/prodigi-client`
2. **Stripe webhook cleanup** (4-6 hours) — Make the 5 core payment events work reliably
3. **Email notifications** (2-3 hours) — At minimum: order confirmation + payment receipt via SES
4. **Canvas-to-image export** (3-4 hours) — Use `html-to-image` already in dependencies, upload to S3

### Day 2-3: Stripe Setup

1. Create products in Stripe Dashboard:
   - **Starter Plan:** $9.99/month or $99/year
   - **Pro Plan:** $19.99/month or $199/year
   - **Business Plan:** $49.99/month or $499/year
   - **Print Order Add-ons:** One-time prices per product
2. Copy all 6 price IDs to `.env.local` and Vercel env vars
3. Test checkout flow end-to-end (subscribe → webhook → credits assigned)
4. Test print order flow (select product → checkout → Prodigi order created)

### Day 3: Deploy

1. Verify SES domain (invitegenerator.com)
2. Set all env vars in Vercel
3. `vercel --prod`
4. Test every flow on production:
   - Signup → Login → Create invitation → AI generate → RSVP
   - Subscribe to Starter → Verify credits → Generate with credits
   - Order print → Checkout → Verify Prodigi receives order

### Day 4: First Customer

1. Create your own invitation (real one — use it, share it)
2. Post on personal social media: "I built this. Try it free."
3. Share in 3 relevant Reddit threads (r/weddingplanning, r/Weddingsunder10k, r/DIYweddings)
4. **Offer 5 people free premium access** in exchange for feedback + testimonials

---

## PHASE 1: FIRST $1,000 (Weeks 2-6)

### Revenue Stream #1: Print Orders (FASTEST MONEY)

**Why this is #1:** Every invitation creator is a potential print buyer. The margin on print is real and immediate.

**Prodigi Pricing (your cost):**
| Product | Your Cost | Suggested Price | Margin |
|---------|-----------|-----------------|--------|
| Greeting Cards (pack of 10) | ~$8-12 | $24.99 | ~$13-17 |
| Postcards (pack of 25) | ~$10-15 | $29.99 | ~$15-20 |
| Premium Cards (pack of 10) | ~$12-18 | $34.99 | ~$17-23 |
| Magnets (pack of 10) | ~$15-20 | $39.99 | ~$20-25 |

**Average order value target:** $30
**At 50 orders/month:** $750-1,000 net profit from print alone

**How to push print orders:**
- After every invitation is created, show a "Get these printed!" CTA
- Offer first-time print discount (15% off) to convert browsers
- Show mockup of printed invitation (use the canvas export)
- Add "Most Popular" badge to the 10-pack greeting cards
- Email reminder 2 weeks before event date: "Still time to order prints!"

### Revenue Stream #2: Subscriptions (RECURRING MONEY)

**Pricing tiers already built:**

| Plan | Price | Credits | Target Customer |
|------|-------|---------|-----------------|
| Free | $0 | 5 AI generations | Everyone (funnel entry) |
| Starter | $9.99/mo | 25 generations | Casual users, 1-2 events/year |
| Pro | $19.99/mo | 100 generations | Event planners, frequent hosts |
| Business | $49.99/mo | Unlimited | Wedding planners, businesses |

**Conversion strategy:**
- Free users hit 5-credit wall fast → upgrade prompt
- Show "Upgrade to unlock" on premium templates
- After 3rd invitation created, show "You're a power user! Upgrade to Pro"
- Annual plans at 2 months free (e.g., $99/year vs $120)

**Target:** 50 paying subscribers by month 2 = $500-2,500/month recurring

### Revenue Stream #3: Affiliate/Recommendations (PASSIVE MONEY)

Already architected in your ARCHITECTURE.md. You collect:
- Event type (wedding, birthday, baby shower)
- Event date
- Guest count
- Location
- Budget indicators

**Monetize this data:**
- Partner with venue booking platforms (commission per referral)
- Partner with event supply stores (Amazon Associates for party supplies)
- Partner with catering/photography platforms
- Recommend complementary services at event creation time

**Start simple:** Add Amazon affiliate links to your blog content and invitation creation flow for event supplies.

---

## PHASE 2: PATH TO $50K (Months 3-12)

### Monthly Revenue Targets

| Month | Print Revenue | Subscription Revenue | Affiliate | Total Monthly | Cumulative |
|-------|--------------|---------------------|-----------|---------------|------------|
| 1 | $200 | $100 | $0 | $300 | $300 |
| 2 | $500 | $500 | $50 | $1,050 | $1,350 |
| 3 | $1,000 | $1,000 | $100 | $2,100 | $3,450 |
| 4 | $1,500 | $1,500 | $200 | $3,200 | $6,650 |
| 5 | $2,000 | $2,000 | $300 | $4,300 | $10,950 |
| 6 | $2,500 | $2,500 | $500 | $5,500 | $16,450 |
| 7 | $3,000 | $3,000 | $600 | $6,600 | $23,050 |
| 8 | $3,500 | $3,500 | $700 | $7,700 | $30,750 |
| 9 | $3,500 | $4,000 | $800 | $8,300 | $39,050 |
| 10 | $3,500 | $4,000 | $800 | $8,300 | $47,350 |
| 11 | $3,500 | $4,000 | $800 | $8,300 | $55,650 |

**This hits $50K+ by month 10-11.**

### Growth Levers

#### 1. SEO (Free Traffic Machine)
Your blog system is built. Use it.

**Target keywords (high intent, low competition):**
- "free wedding invitation maker" (12K searches/mo)
- "digital birthday invitation" (8K searches/mo)
- "baby shower invitation generator" (5K searches/mo)
- "AI invitation maker" (2K searches/mo, growing fast)
- "printable invitation templates" (15K searches/mo)
- "free RSVP tracker" (3K searches/mo)

**Content plan:** 2 blog posts per week, each targeting a long-tail keyword. Use AI to generate drafts, then polish. Every post should include:
- A CTA to try InviteGenerator free
- Embedded invitation examples
- "Create yours free" buttons

**SEO timeline:** Posts start ranking in 2-4 months. By month 6, organic traffic should be 2,000-5,000 visits/month.

#### 2. TikTok/Reels (Viral Potential)
You already have the strategy docs (TIKTOK-CONTENT-PLAN.md, CREATIFY-WORKFLOW.md).

**Content that works for invitation tools:**
- Before/after reveals (plain text → AI-designed invitation)
- "POV: You saved $500 on wedding invitations"
- Screen recordings of the creation process
- "Which invitation style?" polls
- Trending audio + invitation transformations

**Goal:** 3-5 posts/week. Even 1 viral hit (10K+ views) can drive 100+ signups.

#### 3. Pinterest (Sleeper Hit)
Pinterest users are ACTIVELY planning events. This is your highest-intent free traffic source.

**Strategy:**
- Pin every template design
- Create "inspiration board" style pins
- Post 10-15 pins/week
- Link every pin to your template gallery or blog
- Pinterest SEO: "wedding invitation ideas 2026", "birthday party invitation DIY"

#### 4. Wedding Season Push (April-October)
~40% of US weddings happen June-October. This is your gold rush.

**Timeline:**
- Feb-March: Build content library, SEO foundations
- April: Ramp up paid ads ($200 budget from Lean Launch Plan)
- May-June: Peak wedding planning season, maximum content output
- July-September: Print order season (invitations going out)

---

## PHASE 3: SCALING TO $200K+ (Year 2)

### New Revenue Streams to Add

#### 1. White-Label / Enterprise ($500-2,000/month per client)
- Wedding planners who want their own branded invitation tool
- Event companies that need bulk invitation management
- Already have admin tools built — extend with custom branding

#### 2. Marketplace (Template Sales)
- Let designers sell their templates on your platform
- Take 30% commission on every sale
- Designers promote their templates = free marketing for you

#### 3. Premium Add-Ons
- Video invitations ($4.99 each) — Creatify integration
- Animated invitations ($2.99 each)
- Custom domain for invitation pages ($9.99/year)
- Priority print shipping ($4.99 per order)
- RSVP analytics dashboard ($4.99/month)

#### 4. Gift Registry Partnership
- Registry feature is already built (`/registry/`)
- Partner with retail platforms for commission on purchases
- Average wedding registry = $2,000+, even 3% commission = $60/wedding

---

## THE $200 LAUNCH BUDGET — HOW TO SPEND IT

You have $200 and existing Creatify credits. Here's exactly how to deploy:

### Week 1: $0 (Organic Only)
- Fix blockers + deploy (costs nothing)
- Post on personal social media
- Share in 5 Reddit communities
- Create 20 pins on Pinterest
- Post 3 TikToks
- Submit to Product Hunt

### Week 2: $50 on TikTok Ads
- Boost your best-performing organic TikTok ($10/day for 5 days)
- Target: Women 22-40, interested in weddings/parties/event planning
- Goal: 500-1,000 website visits, 50-100 signups

### Week 3: $50 on TikTok Ads (Retargeting)
- Retarget website visitors who didn't sign up
- Retarget people who started creating but didn't finish
- Goal: Convert 20-30% of retargeted visitors

### Week 4: $100 on Google Ads
- Target highest-intent keywords:
  - "free wedding invitation maker" (exact match)
  - "create birthday invitation online" (exact match)
  - "printable baby shower invitations" (exact match)
- $25/day for 4 days
- Goal: 100-200 high-intent visits, 30-50 signups

---

## PRICING PSYCHOLOGY — MAXIMIZE REVENUE

### Free Tier Strategy
The free tier is your funnel. Make it generous enough to hook users, limited enough to convert:
- 5 AI generations (enough to create 1-2 invitations)
- Basic templates only
- "Made with InviteGenerator" watermark on free designs
- No print ordering (must upgrade)

### Upgrade Triggers (Already Built, Just Need to Activate)
1. **Credit wall:** "You've used all 5 free AI generations. Upgrade for more."
2. **Premium template lock:** "This template is available on Starter plan and above."
3. **Feature gate:** Print ordering, CSV export, analytics — lock behind Starter+
4. **Social proof:** "12,000 invitations created this week. Join Pro for unlimited."

### Annual vs Monthly
- Always show annual price first (anchoring)
- "Save 17%" badge on annual plan
- Default the toggle to annual
- Starter: $9.99/mo vs $99/year (save $21)
- Pro: $19.99/mo vs $199/year (save $41)

---

## WHAT TO DO RIGHT NOW — TODAY

Here is your exact priority order:

### This Week (MUST DO)
1. Fix the import path error (5 minutes)
2. Fix Stripe webhook handler (4-6 hours via LM Studio)
3. Implement basic email notifications via SES (2-3 hours via LM Studio)
4. Implement canvas-to-image export (3-4 hours via LM Studio)
5. Create Stripe products in dashboard + set env vars (30 min)
6. Verify SES domain (30 min)
7. Deploy to Vercel production

### Next Week (SHOULD DO)
8. Write 3 blog posts targeting wedding/birthday/baby shower keywords
9. Create 20 Pinterest pins from template designs
10. Post 5 TikToks showing the product
11. Share in 5 Reddit communities
12. Submit to Product Hunt

### Within 30 Days (WANT TO DO)
13. Set up $200 ad campaigns (TikTok + Google)
14. Reach out to 10 wedding bloggers for features/reviews
15. Create an affiliate program page (system already built)
16. Set up Google Search Console + monitor rankings
17. Implement the upgrade trigger modals

---

## KEY METRICS TO TRACK

Once live, track these daily:

| Metric | Target (Month 1) | Target (Month 3) | Target (Month 6) |
|--------|-------------------|-------------------|-------------------|
| Signups/day | 5-10 | 20-30 | 50-100 |
| Free → Paid conversion | 3-5% | 5-8% | 8-12% |
| Print orders/week | 2-5 | 10-20 | 30-50 |
| MRR (Monthly Recurring) | $100-300 | $1,000-2,000 | $3,000-5,000 |
| Organic traffic/month | 200-500 | 2,000-5,000 | 10,000-20,000 |
| Blog posts published | 8 | 24 | 48 |

---

## BOTTOM LINE

You've built a real product with real revenue infrastructure. Stripe is wired. Prodigi is wired. AI generation works. The product solves a real problem (invitations are expensive and time-consuming).

**The gap between you and money is 22-30 hours of bug fixes and deployment.**

Stop building. Start shipping. Fix the 4 blockers, deploy, and get your first dollar. Everything else is optimization on top of a live, revenue-generating product.

$50K in year 1 is achievable if you launch in February and ride wedding season (April-October). Every week you delay costs you ~$1,000 in potential revenue.

---

*This blueprint supersedes LEAN-LAUNCH-PLAN-200.md and MARKETING-PLAN.md as the primary monetization strategy.*
