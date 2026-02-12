# InviteGenerator - Master Test Plan

**Created:** 2026-02-11
**Purpose:** Comprehensive test plan covering every testable aspect of the application. Run these tests before every deployment and after major changes.

---

## Quick Reference - Run All Tests

```bash
# From project root:
cd invitegenerator/invitegenerator-app/invitegenerator-app

# 1. Type safety
npm run type-check

# 2. Linting
npm run lint

# 3. Unit tests (216 tests)
npm test

# 4. Production build
npm run build

# 5. Full validation pipeline (lint + type-check + test + build)
npm run smoke

# 6. HTTP route test (requires dev server running)
COOKIE="site_access_granted=InviteGen2025Preview!"
for route in / /about /affiliates /affiliates/join /affiliates/terms /affiliates/dashboard /blog /contact /faq /features /help /how-it-works /packages /pricing /privacy /templates /terms /auth/login /auth/signup /auth/forgot-password /dashboard /dashboard/analytics /dashboard/billing /dashboard/create /dashboard/invitations /dashboard/rsvp /dashboard/settings /dashboard/templates /admin /admin/contacts /site-access /registry/create; do
  status=$(curl -s -o /dev/null -w "%{http_code}" -b "$COOKIE" http://localhost:3002$route)
  echo "$route : $status"
done

# 7. Dependency security audit
npm audit --audit-level=high
```

---

## Test Categories

### Category 1: Build & Compile Tests

| # | Test | Command | What It Checks | Pass Criteria |
|---|------|---------|----------------|---------------|
| 1.1 | TypeScript Type Check | `npm run type-check` | All .ts/.tsx files compile without errors | Exit code 0, zero errors |
| 1.2 | ESLint | `npm run lint` | Code style, React rules, accessibility | Zero errors (warnings OK) |
| 1.3 | ESLint Auto-fix | `npm run lint:fix` | Auto-fixable lint issues | Fewer warnings than before |
| 1.4 | Production Build | `npm run build` | Full Next.js build completes | Exit code 0, all pages render |
| 1.5 | Bundle Size Check | Check build output | No page exceeds 250kB first load | All pages under threshold |

### Category 2: Unit Tests

| # | Test | File | Tests | What It Checks |
|---|------|------|-------|----------------|
| 2.1 | Button Component | `__tests__/components/ui/button.test.tsx` | UI | Button renders, variants, disabled state |
| 2.2 | Empty States | `__tests__/components/empty-states.test.tsx` | UI | Empty state renders correctly |
| 2.3 | Utils | `__tests__/lib/utils.test.ts` | Lib | Utility function correctness |
| 2.4 | Rate Limiting | `__tests__/lib/rate-limit.test.ts` | Lib | Rate limiter blocks/allows correctly |
| 2.5 | Errors | `__tests__/lib/errors.test.ts` | Lib | Custom error classes work |
| 2.6 | Security | `__tests__/lib/security.test.ts` | Lib | Input sanitization, URL validation |
| 2.7 | Performance | `__tests__/lib/performance.test.ts` | Lib | Performance monitoring utils |
| 2.8 | Prodigi Service | `__tests__/lib/prodigi-service.test.ts` | Service | Print order service |
| 2.9 | Affiliate Service | `__tests__/lib/affiliate-service.test.ts` | Service | Affiliate tracking/commission |
| 2.10 | Export/Import | `__tests__/api/export-import.test.ts` | API | CSV export/import logic |
| 2.11 | Invitations API | `__tests__/api/invitations-api.test.ts` | API | CRUD operations on invitations |

**Run:** `npm test` (216 total assertions)

### Category 3: HTTP Route Tests (32 pages)

| # | Route | Expected | Category |
|---|-------|----------|----------|
| 3.1 | `/` | 200 | Public |
| 3.2 | `/about` | 200 | Public |
| 3.3 | `/affiliates` | 200 | Public |
| 3.4 | `/affiliates/join` | 200 | Public |
| 3.5 | `/affiliates/terms` | 200 | Public |
| 3.6 | `/affiliates/dashboard` | 200 | Public |
| 3.7 | `/blog` | 200 | Public |
| 3.8 | `/contact` | 200 | Public |
| 3.9 | `/faq` | 200 | Public |
| 3.10 | `/features` | 200 | Public |
| 3.11 | `/help` | 200 | Public |
| 3.12 | `/how-it-works` | 200 | Public |
| 3.13 | `/packages` | 200 | Public |
| 3.14 | `/pricing` | 200 | Public |
| 3.15 | `/privacy` | 200 | Public |
| 3.16 | `/templates` | 200 | Public |
| 3.17 | `/terms` | 200 | Public |
| 3.18 | `/auth/login` | 200 | Auth |
| 3.19 | `/auth/signup` | 200 | Auth |
| 3.20 | `/auth/forgot-password` | 200 | Auth |
| 3.21 | `/dashboard` | 200 | Dashboard |
| 3.22 | `/dashboard/analytics` | 200 | Dashboard |
| 3.23 | `/dashboard/billing` | 200 | Dashboard |
| 3.24 | `/dashboard/create` | 200 | Dashboard |
| 3.25 | `/dashboard/invitations` | 200 | Dashboard |
| 3.26 | `/dashboard/rsvp` | 200 | Dashboard |
| 3.27 | `/dashboard/settings` | 200 | Dashboard |
| 3.28 | `/dashboard/templates` | 200 | Dashboard |
| 3.29 | `/admin` | 200 | Admin |
| 3.30 | `/admin/contacts` | 200 | Admin |
| 3.31 | `/site-access` | 200 | Special |
| 3.32 | `/registry/create` | 200 | Special |

### Category 4: API Endpoint Tests (57 routes)

| # | Method | Endpoint | Auth | Expected (no auth) | Expected (auth) |
|---|--------|----------|------|--------------------|-----------------|
| 4.1 | GET | `/api/health` | No | 200 | 200 |
| 4.2 | GET | `/api/templates` | No | 200 | 200 |
| 4.3 | GET | `/api/auth/csrf` | No | 200 | 200 |
| 4.4 | POST | `/api/auth/login` | No | 400 (missing body) | N/A |
| 4.5 | POST | `/api/auth/signup` | No | 400 (missing body) | N/A |
| 4.6 | POST | `/api/auth/logout` | No | 200 | 200 |
| 4.7 | POST | `/api/auth/forgot-password` | No | 400 (missing body) | N/A |
| 4.8 | POST | `/api/auth/reset-password` | No | 400 (missing body) | N/A |
| 4.9 | POST | `/api/contact` | No | 400 (missing body) | N/A |
| 4.10 | POST | `/api/site-access` | No | 401 (wrong password) | N/A |
| 4.11 | POST | `/api/affiliates/apply` | No | 400 (missing body) | N/A |
| 4.12 | POST | `/api/affiliates/track` | No | 400 (missing body) | N/A |
| 4.13 | GET | `/api/affiliates/leaderboard` | No | 200 | 200 |
| 4.14 | GET | `/api/invitations` | Yes | 401 | 200 |
| 4.15 | POST | `/api/invitations` | Yes | 401 | 201 |
| 4.16 | GET | `/api/billing/subscription` | Yes | 401 | 200 |
| 4.17 | POST | `/api/billing/checkout` | Yes | 401 | 200 |
| 4.18 | POST | `/api/billing/portal` | Yes | 401 | 200 |
| 4.19 | POST | `/api/ai/generate` | Yes | 401 | 200 |
| 4.20 | POST | `/api/upload` | Yes | 401 | 200 |
| 4.21 | GET | `/api/user/profile` | Yes | 401 | 200 |
| 4.22 | GET | `/api/user/settings` | Yes | 401 | 200 |
| 4.23 | GET | `/api/notifications` | Yes | 401 | 200 |
| 4.24 | POST | `/api/webhooks/stripe` | No | 400 (bad sig) | N/A |
| 4.25 | POST | `/api/webhooks/prodigi` | No | 400 (bad sig) | N/A |

### Category 5: Security Tests

| # | Test | Method | What It Checks | Pass Criteria |
|---|------|--------|----------------|---------------|
| 5.1 | Hardcoded Secrets | Grep scan | No API keys/passwords in .ts/.tsx | Zero matches |
| 5.2 | npm Audit | `npm audit --audit-level=high` | Known vulnerabilities | Zero critical |
| 5.3 | CSRF Protection | Manual | CSRF tokens required for state-changing requests | All POST/PATCH/DELETE endpoints check CSRF |
| 5.4 | XSS via dangerouslySetInnerHTML | Grep scan | No user-supplied HTML rendered unsanitized | Only safe, hardcoded content |
| 5.5 | NoSQL Injection | Code review | All DynamoDB queries use parameterized values | No string concatenation in queries |
| 5.6 | Rate Limiting | Code review | Sensitive endpoints have rate limits | Auth, RSVP, upload, AI endpoints limited |
| 5.7 | Error Exposure | Code review | Production errors don't leak stack traces | Generic messages in production |
| 5.8 | Cookie Security | Code review | httpOnly, secure, sameSite on all auth cookies | All cookies properly configured |
| 5.9 | Security Headers | Check response | CSP, HSTS, X-Frame-Options, X-Content-Type | All headers present |
| 5.10 | Input Validation | Code review | All API inputs validated (Zod or manual) | No unvalidated user input |

### Category 6: SEO & Accessibility Tests

| # | Test | What It Checks | Pass Criteria |
|---|------|----------------|---------------|
| 6.1 | Meta Tags | title, description, OG tags in layout.tsx | All present and correct |
| 6.2 | Robots.txt | Search engine directives | Blocks /api, /dashboard, /admin |
| 6.3 | Sitemap.xml | All public pages listed | 40+ URLs with proper priority |
| 6.4 | Favicon | favicon.ico exists | File exists in /public |
| 6.5 | OG Image | og-image.png exists | File exists in /public |
| 6.6 | Apple Touch Icon | apple-touch-icon.png exists | File exists in /public |
| 6.7 | PWA Icons | 8 icon sizes in /public/icons | All sizes present |
| 6.8 | Alt Text | All <img>/<Image> have alt | No missing alt attributes |
| 6.9 | ARIA Labels | Icon-only buttons have aria-label | All icon buttons labeled |
| 6.10 | Skip Link | Skip-to-content link exists | Present in layout.tsx |
| 6.11 | Heading Hierarchy | h1 > h2 > h3 in order | No skipped levels |
| 6.12 | Form Labels | All inputs have associated labels | htmlFor matches id |
| 6.13 | Focus Indicators | Visible focus on interactive elements | focus-visible ring on all |
| 6.14 | Color Contrast | Text meets WCAG AA 4.5:1 | All text passes AA |
| 6.15 | Manifest.json | PWA manifest valid | Theme color matches brand |

### Category 7: Dead Code & Code Quality

| # | Test | What It Checks | Pass Criteria |
|---|------|----------------|---------------|
| 7.1 | Duplicate Files | No duplicate implementations | Zero duplicates |
| 7.2 | Unused Exports | Exported items are imported somewhere | All exports used |
| 7.3 | Unused Dependencies | All package.json deps are imported | No unused deps |
| 7.4 | TODO/FIXME Comments | No unresolved TODOs in code | Zero unresolved |
| 7.5 | Commented-Out Code | No large blocks of dead code | No blocks > 3 lines |
| 7.6 | Console.log Cleanup | No debug console.logs | Only console.error/warn |
| 7.7 | TypeScript `any` | No unnecessary `any` types | Minimal, justified only |

### Category 8: Navigation & Link Tests

| # | Test | Method | Pass Criteria |
|---|------|--------|---------------|
| 8.1 | All page routes return 200 | HTTP curl | 32/32 routes return 200 |
| 8.2 | Header nav links valid | Code review | All 5 links → valid routes |
| 8.3 | Footer links valid | Code review | All 15+ links → valid routes |
| 8.4 | Sidebar links valid | Code review | All 6 links → valid routes |
| 8.5 | CTA buttons navigate | Code review | All CTAs → valid routes |
| 8.6 | 404 page renders | HTTP test | Unknown routes → 404 page |
| 8.7 | Auth redirect works | HTTP test | Protected → /auth/login redirect |

**See also:** [link-tree.md](link-tree.md) and [button-map.md](button-map.md) for full reference.

### Category 9: Performance Tests

| # | Test | Method | Pass Criteria |
|---|------|--------|---------------|
| 9.1 | First Load JS < 100kB | Build output | Shared JS bundle under 100kB |
| 9.2 | Page JS < 250kB | Build output | No page exceeds 250kB |
| 9.3 | Lighthouse Performance | Chrome DevTools | Score > 80 |
| 9.4 | Lighthouse Accessibility | Chrome DevTools | Score > 90 |
| 9.5 | Lighthouse SEO | Chrome DevTools | Score > 90 |
| 9.6 | Lighthouse Best Practices | Chrome DevTools | Score > 80 |
| 9.7 | Image Optimization | Code review | Next/Image used for all images |
| 9.8 | Code Splitting | Build output | Dynamic imports where appropriate |

### Category 10: E2E Tests (Playwright) — 23 tests, 5 spec files

**Run:** `npx playwright test` (requires dev server on port 3002)

| # | Test | File | What It Checks |
|---|------|------|----------------|
| 10.1 | Hero section renders | `e2e/homepage.spec.ts` | Hero heading, CTA buttons visible |
| 10.2 | Header nav links | `e2e/homepage.spec.ts` | Templates, Pricing, Features links present |
| 10.3 | Footer renders | `e2e/homepage.spec.ts` | Footer links and copyright visible |
| 10.4 | Pricing page navigation | `e2e/homepage.spec.ts` | Clicking pricing → /pricing URL |
| 10.5 | Login form renders | `e2e/login.spec.ts` | Email, password fields, submit button |
| 10.6 | Forgot password link | `e2e/login.spec.ts` | Navigates to /auth/forgot-password |
| 10.7 | Signup link from login | `e2e/login.spec.ts` | Navigates to /auth/signup |
| 10.8 | Login form accepts input | `e2e/login.spec.ts` | Fill email/password, verify values |
| 10.9 | Login heading & social buttons | `e2e/login.spec.ts` | "Welcome back", Google/Apple buttons |
| 10.10 | Signup form renders | `e2e/signup.spec.ts` | Name, email, password, confirm, terms |
| 10.11 | Password validation attributes | `e2e/signup.spec.ts` | Password field type, name, toggle button |
| 10.12 | Signup form accepts input | `e2e/signup.spec.ts` | Fill all fields, verify values |
| 10.13 | Sign-in link from signup | `e2e/signup.spec.ts` | Navigates to /auth/login |
| 10.14 | Terms & privacy links | `e2e/signup.spec.ts` | Terms/privacy links visible |
| 10.15 | Unauthenticated redirect (create) | `e2e/create-invitation.spec.ts` | /dashboard/create → /auth/login |
| 10.16 | Unauthenticated redirect (dashboard) | `e2e/create-invitation.spec.ts` | /dashboard → /auth/login |
| 10.17 | Templates page loads | `e2e/create-invitation.spec.ts` | Template grid visible |
| 10.18 | Template category filtering | `e2e/create-invitation.spec.ts` | Filter buttons work |
| 10.19 | Marketing pages return 200 | `e2e/public-pages.spec.ts` | 11 routes all return 200 |
| 10.20 | Meta tags for SEO | `e2e/public-pages.spec.ts` | Title, meta description present |
| 10.21 | Favicon & brand assets | `e2e/public-pages.spec.ts` | favicon.ico, icon.svg return 200 |
| 10.22 | Security headers | `e2e/public-pages.spec.ts` | X-Frame-Options, CSP, etc. |
| 10.23 | Stripe webhook not CSRF-blocked | `e2e/public-pages.spec.ts` | POST /api/webhooks/stripe ≠ 403 |

---

## Testing Methods Available

| Method | Tool | Status | When to Use |
|--------|------|--------|-------------|
| TypeScript Checking | `tsc --noEmit` | Available | Every PR/deploy |
| ESLint | `next lint` | Available | Every PR/deploy |
| Unit Tests | Jest (216 tests) | Available | Every PR/deploy |
| E2E Tests | Playwright (23 tests, 5 specs) | Available | Before major releases |
| HTTP Route Tests | curl script | Available | After route changes |
| Security Audit | `npm audit` | Available | Weekly |
| Bundle Analysis | `ANALYZE=true npm run build` | Available | Monthly |
| Lighthouse | Chrome DevTools | Manual | Before launches |
| Coverage Report | `npm run test:coverage` | Available | Monthly |
| Gitleaks | GitHub Actions CI | Configured | Every push |
| Load Testing | k6/Artillery | Not set up | Before launch |
| Visual Regression | Percy/Chromatic | Not set up | Future |
| Accessibility Scanner | axe-core/pa11y | Not set up | Future |
| API Contract Testing | Pact/Dredd | Not set up | Future |

---

## Test Execution Schedule

| Frequency | Tests to Run |
|-----------|-------------|
| **Every code change** | type-check, lint, unit tests |
| **Every deployment** | Full smoke test (type-check + lint + test + build) |
| **Weekly** | npm audit, HTTP route test, link audit |
| **Monthly** | Lighthouse, coverage report, bundle analysis |
| **Before launch** | ALL tests + manual E2E walkthrough |

---

## Update Instructions

When adding new features:
1. Add corresponding test entries to this document
2. Write unit tests in `__tests__/` directory
3. Update route test list if new pages added
4. Update API endpoint list if new APIs added
5. Run full test suite before merging
