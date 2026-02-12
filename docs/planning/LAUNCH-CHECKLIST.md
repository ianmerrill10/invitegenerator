# INVITEGENERATOR.COM - 7-DAY LAUNCH CHECKLIST
## 100 Steps to Launch and Start Making Money

**Goal:** Launch InviteGenerator.com within 7 days and start generating revenue
**Created:** December 16, 2025

---

## OVERVIEW BY DAY

| Day | Focus | Key Milestones |
|-----|-------|----------------|
| Day 1 | Critical Infrastructure | Domain, hosting, environment setup |
| Day 2 | Core Features Complete | Auth, invitations, templates working |
| Day 3 | Payments & Monetization | Stripe live, pricing pages |
| Day 4 | Content & SEO | Templates, landing page, meta tags |
| Day 5 | Testing & Polish | Bug fixes, mobile testing, speed |
| Day 6 | Soft Launch | Friends/family test, collect feedback |
| Day 7 | Public Launch | Marketing push, go live |

---

## DAY 1: CRITICAL INFRASTRUCTURE (Steps 1-15)

### Domain & DNS Setup
- [ ] **1. Purchase/verify domain ownership**
  - Go to your domain registrar (IONOS, Namecheap, GoDaddy)
  - Confirm you own invitegenerator.com
  - Note down your registrar login credentials

- [ ] **2. Point domain to Vercel**
  - In Vercel dashboard: Settings → Domains → Add "invitegenerator.com"
  - Copy the DNS records Vercel provides
  - In your registrar, add these DNS records:
    - A record: @ → 76.76.21.21
    - CNAME record: www → cname.vercel-dns.com

- [ ] **3. Enable SSL/HTTPS**
  - Vercel does this automatically once DNS propagates
  - Wait 15-30 minutes, then verify https://invitegenerator.com works
  - If issues, check Vercel dashboard for SSL status

- [ ] **4. Set up www redirect**
  - In Vercel: Settings → Domains
  - Configure www.invitegenerator.com to redirect to invitegenerator.com
  - Or vice versa - pick one as canonical

### Production Environment Variables
- [ ] **5. Create production AWS resources**
  - Log into AWS Console (aws.amazon.com)
  - Region: us-east-1 (or closest to your users)
  - Create/verify these services exist:
    - DynamoDB tables (users, invitations, etc.)
    - S3 bucket for image uploads
    - Cognito user pool for authentication
    - SES for email sending

- [ ] **6. Get AWS production credentials**
  - AWS Console → IAM → Users → Create new user "invitegenerator-prod"
  - Attach policies: DynamoDB, S3, Cognito, SES access
  - Create access key, save Access Key ID and Secret

- [ ] **7. Set up Vercel environment variables**
  - Vercel Dashboard → Your Project → Settings → Environment Variables
  - Add these for "Production" environment:
  ```
  AWS_ACCESS_KEY_ID=your_prod_key
  AWS_SECRET_ACCESS_KEY=your_prod_secret
  AWS_REGION=us-east-1
  NEXTAUTH_SECRET=generate_random_32_char_string
  NEXTAUTH_URL=https://invitegenerator.com
  NEXT_PUBLIC_APP_URL=https://invitegenerator.com
  ```

- [ ] **8. Configure AWS SES for production email**
  - AWS Console → SES → Verified Identities
  - Add and verify invitegenerator.com domain
  - Add DNS records (DKIM, SPF) to your domain
  - Request production access (move out of sandbox)
  - This can take 24-48 hours - START NOW

- [ ] **9. Set up S3 bucket for production**
  - AWS Console → S3 → Create bucket
  - Name: invitegenerator-prod-assets
  - Enable public access for images
  - Set up CORS policy for your domain
  - Add bucket name to Vercel env vars

- [ ] **10. Configure Cognito for production**
  - AWS Console → Cognito → User Pools
  - Create production pool or use existing
  - Configure password policies, MFA (optional)
  - Set callback URLs to production domain
  - Add Pool ID and Client ID to Vercel env vars

### Initial Deployment
- [ ] **11. Connect GitHub repo to Vercel**
  - Vercel Dashboard → New Project
  - Import your GitHub repository
  - Select the correct branch (main/master)
  - Framework preset: Next.js

- [ ] **12. Configure build settings**
  - Build Command: `npm run build`
  - Output Directory: `.next`
  - Install Command: `npm install`
  - Node.js Version: 18.x or 20.x

- [ ] **13. Deploy to production**
  - Click "Deploy"
  - Watch build logs for errors
  - If build fails, fix errors locally first
  - Re-deploy until successful

- [ ] **14. Verify production deployment**
  - Visit https://invitegenerator.com
  - Check browser console for errors
  - Test that pages load correctly
  - Verify images and styles load

- [ ] **15. Set up error monitoring (Sentry)**
  - Go to sentry.io, create free account
  - Create new project (Next.js)
  - Install: `npm install @sentry/nextjs`
  - Run: `npx @sentry/wizard@latest -i nextjs`
  - Add SENTRY_DSN to Vercel env vars

---

## DAY 2: CORE FEATURES COMPLETE (Steps 16-30)

### Authentication System
- [ ] **16. Test user registration flow**
  - Go to /auth/signup on production
  - Create a test account
  - Verify email is received (check spam)
  - Confirm account works

- [ ] **17. Test login/logout flow**
  - Log in with test account
  - Verify session persists across pages
  - Test logout functionality
  - Test "forgot password" flow

- [ ] **18. Test social login (if implemented)**
  - Configure OAuth apps for production URLs:
    - Google Cloud Console → Credentials → Update redirect URIs
    - Facebook Developer → App Settings → Update domains
  - Test each social login provider

- [ ] **19. Fix any auth-related bugs**
  - Common issues: redirect URLs, CORS, cookies
  - Check browser console for errors
  - Test on incognito/private browsing

### Invitation Creation Flow
- [ ] **20. Test invitation creation wizard**
  - Create new invitation as logged-in user
  - Fill in all event details
  - Upload/select design template
  - Verify invitation saves to database

- [ ] **21. Test invitation editing**
  - Edit existing invitation
  - Change text, colors, images
  - Save changes and verify they persist
  - Test undo/redo if available

- [ ] **22. Test invitation preview**
  - Preview invitation before sending
  - Check mobile preview
  - Verify all text renders correctly
  - Test download as image/PDF

- [ ] **23. Test public invitation view**
  - Share invitation link
  - Open in incognito browser
  - Verify non-logged-in users can view
  - Test RSVP functionality

### RSVP System
- [ ] **24. Test RSVP submission**
  - Open invitation as guest
  - Submit RSVP (attending/not attending)
  - Add dietary restrictions, +1, etc.
  - Verify confirmation shown

- [ ] **25. Test RSVP tracking for hosts**
  - Log in as host
  - View RSVP dashboard
  - Verify guest responses appear
  - Test export to CSV

- [ ] **26. Test RSVP email notifications**
  - Submit RSVP as guest
  - Verify host receives email notification
  - Check email formatting
  - Verify links in email work

### Template System
- [ ] **27. Verify template gallery loads**
  - Visit template gallery page
  - Check all templates display
  - Test category filtering
  - Test search functionality

- [ ] **28. Add at least 20 templates for launch**
  - Focus on most popular categories:
    - Wedding (5 templates)
    - Birthday (5 templates)
    - Baby Shower (3 templates)
    - Graduation (3 templates)
    - Holiday (4 templates)
  - Ensure variety in styles

- [ ] **29. Test template customization**
  - Select a template
  - Modify colors, fonts, text
  - Add/remove elements
  - Save customized version

- [ ] **30. Optimize template images**
  - Compress all template images (TinyPNG, Squoosh)
  - Use WebP format where possible
  - Ensure images are under 200KB each
  - Set up lazy loading

---

## DAY 3: PAYMENTS & MONETIZATION (Steps 31-50)

### Stripe Setup
- [ ] **31. Create Stripe account**
  - Go to stripe.com
  - Sign up with business email
  - Complete business verification
  - This can take 1-2 days - START NOW

- [ ] **32. Get Stripe API keys**
  - Stripe Dashboard → Developers → API keys
  - Copy Publishable key (pk_live_...)
  - Copy Secret key (sk_live_...)
  - Add both to Vercel env vars:
    - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    - STRIPE_SECRET_KEY

- [ ] **33. Create Stripe products/prices**
  - Dashboard → Products → Add Product
  - Create products for each plan:
    - Free tier (for tracking)
    - Starter: $4.99/month
    - Pro: $9.99/month
    - Business: $24.99/month
  - Copy Price IDs for each

- [ ] **34. Set up Stripe webhooks**
  - Dashboard → Developers → Webhooks
  - Add endpoint: https://invitegenerator.com/api/webhooks/stripe
  - Select events:
    - checkout.session.completed
    - customer.subscription.updated
    - customer.subscription.deleted
    - invoice.paid
    - invoice.payment_failed
  - Copy webhook signing secret to env vars

- [ ] **35. Test Stripe checkout flow**
  - Use Stripe test mode first
  - Complete a test purchase
  - Verify webhook receives event
  - Check user account upgrades

- [ ] **36. Switch Stripe to live mode**
  - Dashboard → Toggle "Test mode" off
  - Update API keys in Vercel to live keys
  - Update webhook to live endpoint
  - Do one real $1 test purchase (refund after)

### Pricing Page
- [ ] **37. Create/update pricing page**
  - Clear pricing tiers displayed
  - Feature comparison table
  - Monthly/annual toggle (annual = 20% off)
  - FAQ section

- [ ] **38. Add pricing to navigation**
  - Add "Pricing" link to main nav
  - Add upgrade prompts in dashboard
  - Show plan limits when reached

- [ ] **39. Implement usage limits**
  - Free: 3 invitations, 50 guests max
  - Track usage in database
  - Show usage meter in dashboard
  - Block actions when limit reached

- [ ] **40. Create upgrade prompts**
  - When user hits limit, show upgrade modal
  - Highlight benefits of upgrading
  - One-click upgrade button
  - Show savings for annual plans

### Amazon Associates Setup
- [ ] **41. Apply for Amazon Associates**
  - Go to affiliate-program.amazon.com
  - Sign up with business info
  - You need 3 qualifying sales in 180 days
  - Start with standard links, upgrade later

- [ ] **42. Get Amazon Associate ID**
  - After approval, find your Associate ID
  - Format: yourid-20
  - Add to env vars: AMAZON_ASSOCIATE_ID

- [ ] **43. Set up Amazon product links**
  - For each package item, create affiliate link
  - Use SiteStripe or Product Links
  - Store ASIN and affiliate link in database
  - Test links redirect correctly

- [ ] **44. Implement affiliate link tracking**
  - Track clicks on affiliate links
  - Log user, timestamp, product
  - Create analytics dashboard for tracking
  - Calculate estimated commissions

### Print Partner Setup
- [ ] **45. Research print partners**
  - Compare: Printful, Gooten, Gelato, Prodigi
  - Check pricing, quality, shipping times
  - Request samples if time permits
  - Read reviews from other sellers

- [ ] **46. Create print partner account**
  - Sign up for chosen partner (recommend Printful)
  - Complete store setup
  - Connect payment method for costs
  - Set up shipping preferences

- [ ] **47. Create print-ready templates**
  - Ensure invitation designs are 300 DPI
  - Set correct dimensions (5x7, 4x6, etc.)
  - Include bleed area
  - Test print one sample

- [ ] **48. Configure print partner API**
  - Get API credentials from partner
  - Add to Vercel env vars
  - Implement order submission API
  - Test order creation in sandbox

- [ ] **49. Set print pricing and margins**
  - Calculate cost per invitation
  - Add margin (recommend 40-60%)
  - Include shipping estimate
  - Display final price to users

- [ ] **50. Test end-to-end print flow**
  - Order test print through your site
  - Verify order appears in partner dashboard
  - Track shipping
  - Confirm quality when received

---

## DAY 4: CONTENT & SEO (Steps 51-65)

### Landing Page Polish
- [ ] **51. Write compelling headline**
  - Clear value proposition
  - Example: "Create Stunning Invitations in Minutes"
  - Include keyword: "AI invitation generator"

- [ ] **52. Add hero section with demo**
  - Show invitation example/animation
  - Clear CTA button "Create Free Invitation"
  - Trust badges (secure, no credit card)

- [ ] **53. Add feature highlights**
  - 3-4 key features with icons
  - AI-powered design
  - RSVP tracking
  - Digital & print options
  - Beautiful templates

- [ ] **54. Add social proof section**
  - Testimonials (create initial ones based on beta feedback)
  - "Trusted by X event planners"
  - Template usage counter
  - Star ratings

- [ ] **55. Add template showcase**
  - Grid of best templates
  - Filter by event type
  - Click to start creating
  - "View all templates" link

- [ ] **56. Optimize landing page CTA**
  - Multiple CTAs throughout page
  - Sticky header CTA on scroll
  - Exit-intent popup (optional)
  - Clear next step

### SEO Setup
- [ ] **57. Set up meta tags**
  - Title: "InviteGenerator - Create Beautiful Digital Invitations"
  - Description: "Free AI-powered invitation maker..."
  - Open Graph tags for social sharing
  - Twitter Card tags

- [ ] **58. Create robots.txt**
  ```
  User-agent: *
  Allow: /
  Sitemap: https://invitegenerator.com/sitemap.xml
  ```

- [ ] **59. Generate sitemap.xml**
  - Include all public pages
  - Template pages
  - Blog posts (if any)
  - Update on new content

- [ ] **60. Set up Google Search Console**
  - Go to search.google.com/search-console
  - Add property: invitegenerator.com
  - Verify via DNS or HTML file
  - Submit sitemap

- [ ] **61. Set up Google Analytics 4**
  - Go to analytics.google.com
  - Create new property
  - Get Measurement ID (G-XXXXXXX)
  - Add to site via script or GTM

- [ ] **62. Add structured data**
  - Organization schema
  - Product schema for templates
  - FAQ schema on pricing page
  - Use Google's Rich Results Test

### Legal Pages
- [ ] **63. Create/update Privacy Policy**
  - What data you collect
  - How you use it
  - Cookie policy
  - GDPR compliance
  - Use template from TermsFeed or similar

- [ ] **64. Create/update Terms of Service**
  - User responsibilities
  - Your liabilities (limited)
  - Acceptable use
  - Payment terms
  - Use template and customize

- [ ] **65. Create cookie consent banner**
  - Show on first visit
  - Allow accept/decline
  - Remember preference
  - Link to cookie policy

---

## DAY 5: TESTING & POLISH (Steps 66-80)

### Cross-Browser Testing
- [ ] **66. Test on Chrome (desktop)**
  - All pages load correctly
  - Forms work
  - Payments work
  - No console errors

- [ ] **67. Test on Firefox (desktop)**
  - Same checks as Chrome
  - Note any styling differences
  - Fix any issues found

- [ ] **68. Test on Safari (desktop)**
  - Same checks
  - Safari often has unique bugs
  - Test date pickers especially

- [ ] **69. Test on Edge (desktop)**
  - Quick sanity check
  - Most issues are shared with Chrome

### Mobile Testing
- [ ] **70. Test on iPhone Safari**
  - Use real device if possible
  - Or BrowserStack/Sauce Labs
  - Check touch interactions
  - Verify responsive design

- [ ] **71. Test on Android Chrome**
  - Same mobile checks
  - Test on different screen sizes
  - Check keyboard behavior

- [ ] **72. Fix mobile-specific issues**
  - Touch targets large enough (44x44px)
  - No horizontal scroll
  - Text readable without zoom
  - Forms usable on mobile

### Performance Testing
- [ ] **73. Run Lighthouse audit**
  - Chrome DevTools → Lighthouse
  - Run for Mobile
  - Target scores: 90+ Performance, 90+ SEO
  - Note specific issues

- [ ] **74. Fix performance issues**
  - Optimize images (compress, lazy load)
  - Minimize JavaScript bundles
  - Enable caching
  - Use CDN for static assets

- [ ] **75. Test page load speed**
  - Use WebPageTest.org
  - Target: Under 3 seconds on 3G
  - Check Core Web Vitals
  - Fix any red flags

### Bug Fixing
- [ ] **76. Create bug tracking list**
  - Note all issues found during testing
  - Prioritize: Critical → High → Medium → Low
  - Critical = blocks launch
  - Fix critical bugs first

- [ ] **77. Fix critical bugs**
  - Anything that breaks core flow
  - Payment issues
  - Auth issues
  - Data loss issues

- [ ] **78. Fix high-priority bugs**
  - Bad user experience
  - Confusing UI
  - Missing error messages
  - Broken links

- [ ] **79. Test all fixes**
  - Verify each fix works
  - Check for regressions
  - Get someone else to test

- [ ] **80. Final production deploy**
  - Deploy all fixes to production
  - Clear any caches
  - Verify live site works
  - Do final smoke test

---

## DAY 6: SOFT LAUNCH (Steps 81-90)

### Beta Testing
- [ ] **81. Invite 5-10 friends/family to test**
  - Send personal email/message
  - Ask them to create a real invitation
  - Give them specific tasks to complete
  - Offer incentive (free premium month)

- [ ] **82. Create feedback form**
  - Use Google Forms or Typeform
  - Ask about:
    - Ease of use (1-10)
    - Would they recommend? (1-10)
    - What confused them?
    - What's missing?
    - Any bugs found?

- [ ] **83. Monitor beta users in real-time**
  - Watch for errors in Sentry
  - Check server logs
  - Be available to help if stuck
  - Note where they struggle

- [ ] **84. Collect and analyze feedback**
  - Review all feedback responses
  - Identify common themes
  - Prioritize quick wins
  - Note features for future

- [ ] **85. Make quick fixes based on feedback**
  - Fix any critical issues found
  - Improve confusing UX
  - Add missing help text
  - Polish rough edges

### Pre-Launch Prep
- [ ] **86. Write launch announcement**
  - What is InviteGenerator?
  - Key features/benefits
  - Launch special offer
  - Call to action

- [ ] **87. Create social media posts**
  - Twitter/X thread
  - LinkedIn post
  - Facebook post
  - Instagram post (if applicable)
  - Schedule for launch day

- [ ] **88. Set up email for launch**
  - If you have email list, prepare email
  - Launch announcement
  - Special offer details
  - Clear CTA

- [ ] **89. Prepare ProductHunt launch (optional)**
  - Create ProductHunt account
  - Prepare listing:
    - Tagline
    - Description
    - Screenshots
    - Logo
  - Schedule for next week if not ready

- [ ] **90. Final checklist review**
  - All critical features working ✓
  - Payments working ✓
  - Emails sending ✓
  - No critical bugs ✓
  - Legal pages in place ✓

---

## DAY 7: PUBLIC LAUNCH (Steps 91-100)

### Launch Morning
- [ ] **91. Final production check**
  - Visit site, create test account
  - Go through entire flow
  - Verify everything works
  - Check on mobile

- [ ] **92. Post launch announcement**
  - Post to all social channels
  - Send email to list
  - Post in relevant communities:
    - r/startups
    - r/SideProject
    - r/Entrepreneur
    - Indie Hackers
    - Hacker News (Show HN)

- [ ] **93. Enable paid ads (optional)**
  - Start small: $10-20/day
  - Google Ads for key terms:
    - "free invitation maker"
    - "digital wedding invitations"
    - "online RSVP"
  - Facebook/Instagram ads

### Launch Day Monitoring
- [ ] **94. Monitor server performance**
  - Watch Vercel analytics
  - Check for slow responses
  - Monitor error rates
  - Be ready to scale

- [ ] **95. Monitor user signups**
  - Track new registrations
  - Watch for stuck users
  - Check conversion funnel
  - Note drop-off points

- [ ] **96. Respond to user issues immediately**
  - Check support email frequently
  - Monitor social mentions
  - Quick response = happy users
  - Fix urgent issues ASAP

- [ ] **97. Engage with launch posts**
  - Reply to all comments
  - Answer questions
  - Thank supporters
  - Share user success stories

### Post-Launch
- [ ] **98. Analyze Day 1 metrics**
  - Total visitors
  - Signups
  - Invitations created
  - Conversions to paid
  - Revenue

- [ ] **99. Document what worked/didn't**
  - Marketing channels that drove traffic
  - Features users loved
  - Common complaints
  - Technical issues
  - Lessons learned

- [ ] **100. Plan Week 2 priorities**
  - Fix remaining bugs
  - Add most-requested features
  - Double down on working channels
  - Start building content/SEO
  - Set revenue goals

---

## REVENUE TARGETS

### Week 1 Goals
- [ ] 100+ signups
- [ ] 10+ invitations created
- [ ] 1-3 paid conversions ($15-75)
- [ ] First affiliate clicks

### Month 1 Goals
- [ ] 500+ signups
- [ ] 50+ invitations created
- [ ] 20+ paid conversions ($300+)
- [ ] First print order
- [ ] First affiliate commission

---

## QUICK WINS FOR IMMEDIATE REVENUE

1. **Launch day discount** - "50% off Pro for first 100 users"
2. **Annual plan push** - "2 months free with annual"
3. **Template upsells** - Premium templates at $2.99 each
4. **Print packages** - Higher margin on physical products
5. **Affiliate bundle** - Package items drive commission

---

## EMERGENCY CONTACTS & RESOURCES

- **Vercel Status:** status.vercel.com
- **AWS Status:** status.aws.amazon.com
- **Stripe Status:** status.stripe.com
- **Your Email:** [add your email]
- **Backup Deploy:** [add backup process]

---

## NOTES

_Use this space for notes during launch:_

```
Day 1 Notes:


Day 2 Notes:


Day 3 Notes:


Day 4 Notes:


Day 5 Notes:


Day 6 Notes:


Day 7 Notes:


```

---

**Remember:** Done is better than perfect. Launch with core features working, then iterate based on real user feedback.

Good luck! 🚀
