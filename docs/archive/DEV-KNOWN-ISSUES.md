# Known Issues and TODOs - InviteGenerator

Last Updated: December 12, 2025

## Critical Issues (Build Breaking)
None currently - build/type check is passing.

## High Priority (Functional Issues)
None - all major TODOs have been implemented.

## Medium Priority (Non-Critical)

### 1. ~~useEffect Missing Dependency~~ ✅ FIXED
**File**: `components/recommendations/product-recommendations.tsx`
**Status**: Fixed on December 12, 2025 - moved function inside useEffect

### 2. Image Accessibility (False Positive)
**Files**: Editor page components
**Warning**: Image elements missing alt prop
**Status**: Not an issue - ESLint detecting Lucide `<Image>` icon component, not HTML `<img>`

## Low Priority (Code Quality)

### 1. Console.log Statements
**Various files** - Intentional for debugging, remove before production.

### 2. Using <img> Instead of next/image
**Location**: QR code in invitation detail page
**Status**: External API URL, using native img is appropriate

## Resolved Issues

| Issue | Resolution | Date |
|-------|------------|------|
| useEffect missing dependency | Moved function inside useEffect | 2025-12-12 |
| Next.js security vulnerability | Updated to 14.2.33 | 2025-12-11 |
| OpenAI build error | Lazy initialization | 2025-12-11 |
| Missing API routes (7) | Created all routes | 2025-12-11 |
| DynamoDB table name mismatch | Standardized names | 2025-12-11 |
| Stripe API version mismatch | Updated to 2025-02-24.acacia | 2025-12-11 |
| Lint prefer-const error | Changed let to const | 2025-12-11 |
| Website route TODOs | Added DB operations | 2025-12-11 |
| Delivery route TODOs | Added credit check/deduct + DB | 2025-12-11 |
| Addons route TODOs | Added Stripe checkout + DB | 2025-12-11 |
| CardFooter missing export | Added to card.tsx | 2025-12-12 |
| buttonVariants/badgeVariants export | Fixed index.ts exports | 2025-12-12 |

## New DynamoDB Tables Required
These tables need to be created in AWS:
- `invitegen-websites` - Event websites (primary key: `id`)
- `invitegen-delivery-jobs` - Delivery job queue (primary key: `id`)
- `invitegen-purchases` - Add-on purchases (primary key: `id`)

## Environment Requirements
Required environment variables are documented in `.env.example`.
Copy to `.env.local` and fill in values before running.

## How to Verify

```bash
# Check for type errors
npm run type-check

# Check for lint errors  
npm run lint

# Run full build
npm run build

# Run tests
npm run test
```
