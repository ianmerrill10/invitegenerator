# Task Schedule - InviteGenerator

This document tracks planned work, priorities, and dependencies.

---

## ✅ COMPLETED TASKS

### Security (P0 - Critical)
- [x] JWT verification with Cognito JWKS
- [x] Remove user_id cookie fallback
- [x] Admin routes protected
- [x] Rate limiting on auth endpoints
- [x] Stripe webhook signature verification
- [x] findUserByStripeCustomer using GSI

### Build & Deployment (P0)
- [x] TypeScript compiles (0 errors)
- [x] Production build succeeds
- [x] All 98 tests passing
- [x] Smoke test script created
- [x] Error boundaries added
- [x] Dynamic route exports added

### Documentation (P1)
- [x] TikTok content plan
- [x] Amplify deployment checklist
- [x] Environment variables reference
- [x] Production readiness checklist
- [x] Prodigi integration guide
- [x] Documentation index
- [x] Work log updated
- [x] Testing log created
- [x] Task schedule created

### API Endpoints (P1)
- [x] Health check endpoint
- [x] Prodigi webhook handler
- [x] Auth routes (login, signup, etc.)
- [x] Invitation CRUD routes
- [x] RSVP routes
- [x] Template routes
- [x] User profile/settings routes

---

## 🔲 REMAINING TASKS

### High Priority (Before Launch)

#### Deployment
| Task | Status | Effort | Dependency |
|------|--------|--------|------------|
| Configure AWS Amplify app | 🔲 TODO | 30 min | AWS account |
| Set environment variables | 🔲 TODO | 15 min | Amplify app |
| Connect custom domain | 🔲 TODO | 30 min | Domain ownership |
| SSL certificate | 🔲 TODO | Auto | Domain connected |
| First deployment | 🔲 TODO | 20 min | All above |
| Verify production works | 🔲 TODO | 30 min | Deployed |

#### AWS Setup
| Task | Status | Effort | Dependency |
|------|--------|--------|------------|
| Create DynamoDB tables | 🔲 TODO | 30 min | AWS account |
| Create S3 bucket | 🔲 TODO | 15 min | AWS account |
| Configure Cognito | 🔲 TODO | 45 min | AWS account |
| SES out of sandbox | 🔲 TODO | 1-3 days | Verified domain |
| Enable Bedrock access | 🔲 TODO | 5 min | AWS account |

#### Stripe Setup
| Task | Status | Effort | Dependency |
|------|--------|--------|------------|
| Create Stripe products | 🔲 TODO | 30 min | Stripe account |
| Configure webhooks | 🔲 TODO | 15 min | Deployed URL |
| Test payment flow | 🔲 TODO | 30 min | All above |
| Switch to live mode | 🔲 TODO | 5 min | Testing complete |

### Medium Priority (Post-Launch)

#### Features
| Task | Status | Effort | Notes |
|------|--------|--------|-------|
| Prodigi live integration | 🔲 TODO | 2 hr | After testing |
| Email notification improvements | 🔲 TODO | 2 hr | Nice HTML templates |
| Analytics dashboard | 🔲 TODO | 4 hr | User engagement stats |
| Blog content | 🔲 TODO | Ongoing | SEO content |

#### Performance
| Task | Status | Effort | Notes |
|------|--------|--------|-------|
| Lighthouse audit | 🔲 TODO | 1 hr | Measure baseline |
| Image optimization | 🔲 TODO | 2 hr | Fix alt tags, optimize |
| Bundle size analysis | 🔲 TODO | 1 hr | Identify bloat |

#### Monitoring
| Task | Status | Effort | Notes |
|------|--------|--------|-------|
| CloudWatch alarms | 🔲 TODO | 1 hr | Error rate, latency |
| Error tracking (Sentry) | 🔲 TODO | 1 hr | Optional but recommended |
| Uptime monitoring | 🔲 TODO | 30 min | Use free service |

### Low Priority (Future)

| Task | Status | Notes |
|------|--------|-------|
| Add more templates | 🔲 TODO | Ongoing content |
| A/B testing | 🔲 TODO | Optimize conversion |
| Referral program | 🔲 TODO | Growth feature |
| Multi-language | 🔲 TODO | i18n support |
| Mobile app | 🔲 TODO | React Native |

---

## 📅 SUGGESTED TIMELINE

### Week 1: Infrastructure
- Day 1-2: AWS setup (DynamoDB, S3, Cognito)
- Day 3: Stripe configuration
- Day 4: Amplify deployment
- Day 5: Testing and fixes
- Day 6-7: Buffer

### Week 2: Launch Prep
- Day 1-2: SES verification (start early)
- Day 3: Final testing
- Day 4: Soft launch (limited users)
- Day 5-7: Monitor and fix issues

### Week 3: Marketing
- Start TikTok content posting
- Create initial blog posts
- Set up analytics

---

## 🤖 AUTOMATION OPPORTUNITIES

### Already Automated
- [x] Smoke test script (`npm run smoke`)
- [x] Type checking in build
- [x] ESLint in development
- [x] CI/CD pipeline (GitHub Actions)
- [x] Automated testing on PR (GitHub Actions)
- [x] Dependency updates (Dependabot)
- [x] Pre-commit validation script
- [x] Full validation script (validate.ps1/validate.sh)

### To Automate
| Automation | Tool | Priority |
|------------|------|----------|
| Performance monitoring | Lighthouse CI | Low |
| Uptime alerts | External service | Medium |

---

## 📋 DECISION LOG

| Date | Decision | Rationale |
|------|----------|-----------|
| 2025-12-11 | Use AWS Amplify | Simplifies deployment, integrates with AWS |
| 2025-12-11 | Lazy init for API clients | Prevents build failures |
| 2025-12-12 | Faceless TikTok strategy | Lower barrier to content creation |
| 2025-12-12 | Prodigi for printing | Global fulfillment, good API |

---

## 🚫 DO NOT REPEAT

These issues have been solved - don't redo this work:

1. **JWT Security** - Already using jwt.verify() with JWKS, NOT jwt.decode()
2. **Rate Limiting** - Already implemented on auth routes
3. **OpenAI Client** - Already using lazy initialization
4. **Stripe API Version** - Already set to 2025-02-24.acacia
5. **DynamoDB Table Names** - Standardized to plural (RSVPS not RSVP)
6. **CSS Import** - Using relative path, not @ alias
7. **Dynamic Exports** - Added to API routes that need cookies/request

---

*Last Updated: December 12, 2025*
