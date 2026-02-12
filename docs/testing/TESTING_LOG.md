# Testing Log

This file tracks what has been tested, what passed/failed, what was fixed, and what remains.

## How to use this log
- "Tested" means we opened/reviewed the file and ran at least one relevant check (type-check/build/lint/unit test/manual check).
- "Fixed" means code changes were made and verified (at least `npm run type-check`).
- "Open" means we found an issue but did not fully resolve it yet.

---

## 2025-12-12

### Initialization
- Created this testing log.
- Created the file test matrix in [FILE_TEST_STATUS.md](FILE_TEST_STATUS.md).

### Baseline checks (current session)
- Problems panel findings (not all are TypeScript errors):
  - Accessibility: buttons missing accessible name (icon-only buttons)
  - Accessibility: select missing accessible name
  - "No inline styles" rule triggered in several files (may be a workspace rule; dynamic editor positioning may legitimately require inline styles)

### Unit test run (Jest)
- Ran: `npx jest --runInBand --no-cache`
- Result: ✅ 2/2 suites passed, ✅ 18/18 tests passed
- Fixes made to get to green:
  - Updated `formatDate()` to be timezone-stable for ISO inputs.
  - Updated `truncate()` behavior to match expected output.
  - Updated Jest config to ignore `.next/` to avoid haste-map collisions.

### Next scheduled checks (project-level)
- Target schedule: daily quality check (type-check + unit tests) and weekly build check.
- Implementation note: for production hosting, this schedule typically runs in CI (GitHub Actions) or a server cron job, not inside the deployed Next.js runtime.

## Test Run: 2025-12-18 11:54:43 AM

- **Pass Rate:** 100.0%
- **Tests:** 22/22 passed
- **Report:** [test-report-2025-12-18.md](./test-reports/test-report-2025-12-18.md)


## Test Run: 2025-12-18 11:57:47 AM

- **Pass Rate:** 100.0%
- **Tests:** 39/39 passed
- **Report:** [test-report-2025-12-18.md](./test-reports/test-report-2025-12-18.md)

## Test Run: 2026-02-11 — Full Suite Validation

### Unit Tests (Jest)

- **Pass Rate:** 100.0%
- **Tests:** 216/216 passed (11 suites)
- **Suites:** button, empty-states, utils, rate-limit, errors, security, performance, prodigi-service, affiliate-service, export-import, invitations-api

### E2E Tests (Playwright) — NEW

- **Pass Rate:** 100.0%
- **Tests:** 23/23 passed (5 spec files)
- **Spec files:**
  - `e2e/homepage.spec.ts` — 4 tests (hero, nav, footer, pricing)
  - `e2e/login.spec.ts` — 5 tests (form, links, input, heading, social)
  - `e2e/signup.spec.ts` — 5 tests (form, password, input, links, terms)
  - `e2e/create-invitation.spec.ts` — 4 tests (auth redirects, templates, filtering)
  - `e2e/public-pages.spec.ts` — 5 tests (routes, SEO, assets, headers, webhook)

### Type Check & Build

- **TypeScript:** 0 errors
- **ESLint:** 0 errors (3 warnings — pre-existing)
- **Production Build:** SUCCESS (152kB shared JS)

### Bugs Fixed This Session

1. **Auth store isLoading bug** — `lib/stores/auth-store.ts` initialized `isLoading: true` but never resolved for unauthenticated users. Login/signup buttons permanently showed "Loading...". Fixed with `onRehydrateStorage` callback.
2. **Console.log cleanup** — Removed 3 debug `console.info` calls from packages and registry pages.
3. **robots.txt** — Orphaned Allow directives outside User-agent block. Restructured properly.

