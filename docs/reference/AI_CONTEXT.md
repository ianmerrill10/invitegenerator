# AI Context & Project Status

> **FOR AI AGENTS:** Read this file FIRST before making any changes.
>
> **Key Documentation:**
> - **[FILES_REGISTRY.md](./FILES_REGISTRY.md)** - **MASTER FILE LIST** - Complete inventory of ALL files with status, description, and completion tracking (KEEP UPDATED!)
> - **[FILES_REGISTRY.csv](./FILES_REGISTRY.csv)** - Spreadsheet version of file registry for filtering/sorting
> - **[FIXES_PROGRESS_LOG.md](./FIXES_PROGRESS_LOG.md)** - Log of all completed fixes and improvements
> - **[PROJECT_FILES.md](./PROJECT_FILES.md)** - Project file overview
> - **[COMPLETED_FEATURES.md](./COMPLETED_FEATURES.md)** - Master list of ALL implemented features
> - **[FEATURE_TEST_REPORT.md](./FEATURE_TEST_REPORT.md)** - Testing status for all features
> - **[LAUNCH_PRIORITY_100.md](./LAUNCH_PRIORITY_100.md)** - 100 priority tasks for launch
> - **[1000-IMPROVEMENT-TASKS.md](./1000-IMPROVEMENT-TASKS.md)** - Code improvement backlog
> - **[1000-FIXES-TODO.md](./1000-FIXES-TODO.md)** - 1000 fixes checklist (in progress)
>
> **Last Updated:** December 18, 2025
> **Status:** DEPLOYED TO PRODUCTION - Live at https://invitegenerator.com

---

## CRITICAL: API Keys & Credentials Location

**ALL API KEYS ARE STORED IN `.env.local`** - Never ask the user for keys that are already there!

| Service | Environment Variable | Status |
|---------|---------------------|--------|
| AWS (DynamoDB, S3, Cognito, SES) | `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` | Configured |
| AWS Region | `AWS_REGION` | us-east-1 |
| Cognito User Pool | `NEXT_PUBLIC_COGNITO_USER_POOL_ID` | us-east-1_feKc3GwfT |
| Cognito Client | `NEXT_PUBLIC_COGNITO_CLIENT_ID` | 6tst47k67hcsui67uafgi13fvn |
| Claude API | `CLAUDE_API_KEY` | Configured |
| IONOS DNS | `IONOS_API_KEY` | Configured (for invitegenerator.com) |
| Stripe | `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Placeholder - User to configure |
| Site Password | `SITE_PASSWORD` | InviteGen2025Preview! |

**RULE:** Before asking user for any API key, CHECK `.env.local` first!

---

## CRITICAL: Template Storage Locations

**Templates are stored in AWS S3 - NOT just in local files!**

### Primary Template Storage (298 templates)
- **S3 Bucket:** `invitegenerator-templates-983101357971`
- **Region:** us-east-1
- **URL Pattern:** `s3://invitegenerator-templates-983101357971/templates/{category}/{subcategory}/...`

### AWS CLI Commands to Check Templates
```bash
# Count all templates
aws s3 ls s3://invitegenerator-templates-983101357971/templates/ --recursive | grep "_full.png" | wc -l

# Count by category
aws s3 ls s3://invitegenerator-templates-983101357971/templates/ --recursive | grep "_full.png" | awk -F'/' '{print $2}' | sort | uniq -c

# List all S3 buckets
aws s3 ls
```

### Template Locations Summary

| Location | Count | Purpose |
|----------|-------|---------|
| AWS S3 `invitegenerator-templates-983101357971` | 298 | **PRIMARY PRODUCTION TEMPLATES** |
| `lib/data/templates.ts` | 16 | Development samples only |
| `GEMINI TEMPLATES/` folder | 6 images | Source files for AI generation |

### Related S3 Buckets
- `invitegenerator-assets` - Production assets (empty)
- `invitegenerator-uploads` - User uploads
- `invitegen-ai-templates-983101357971` - AI template storage (empty)
- `wedding-invitation-templates` - Legacy/testing (empty)

**RULE:** When asked about templates, CHECK AWS S3 FIRST using the commands above!

**DOCUMENTATION:**
- [TEMPLATE_INVENTORY.md](./TEMPLATE_INVENTORY.md) - Complete template spreadsheet
- [DIGITAL_ASSETS_REGISTRY.md](./DIGITAL_ASSETS_REGISTRY.md) - Full asset tracking and protection docs

### Local Backups
- `templates-local/` - Primary local copy of all templates (596 files)
- `templates-backup/` - Secondary backup with all categories
- `templates-backup/all-templates-backup-2025-12-18.zip` - Full 855MB ZIP archive

### Template Protection (lib/template-protection.ts)
- Hotlink prevention headers
- Rate limiting (60 requests/minute)
- Presigned URLs with 5-minute expiry
- Right-click and drag prevention
- Canvas rendering for display
- Print blocking CSS

---

## Quick Reference

| What | Where |
|------|-------|
| Types/Interfaces | `types/index.ts` |
| Utilities | `lib/utils.ts` |
| Zustand Stores | `lib/stores/` |
| AWS Services | `services/aws/` |
| Stripe Service | `services/stripe.ts` |
| UI Components | `components/ui/` |
| Editor Components | `components/editor/` |
| Template Components | `components/templates/` |
| Dashboard Components | `components/dashboard/` |
| Share Components | `components/share/` |
| Invitation Components | `components/invitation/` |
| Public Components | `components/public/` |
| Guest Components | `components/guests/` |
| Notification Components | `components/notifications/` |
| Billing Components | `components/billing/` |
| Media Components | `components/media/` |
| Layout Components | `components/layout/` |
| API Routes | `app/api/` |
| Environment Vars | `.env.example` |

---

## Project Overview

**InviteGenerator** is a full-stack Next.js 14 application for creating AI-powered digital event invitations.

### Tech Stack
- **Framework:** Next.js 14.2.18 (App Router)
- **Language:** TypeScript 5.6 (strict mode)
- **Styling:** Tailwind CSS 3.4 + custom design system
- **State:** Zustand 5.0
- **Forms:** React Hook Form + Zod validation
- **UI Components:** Radix UI primitives
- **Animation:** Framer Motion
- **Auth:** AWS Cognito
- **Database:** AWS DynamoDB
- **Storage:** AWS S3
- **Email:** AWS SES
- **AI:** AWS Bedrock (Claude)
- **Payments:** Stripe

---

## Directory Structure

```
invitegenerator-app/
├── app/                      # Next.js App Router
│   ├── api/                  # API routes
│   │   ├── auth/             # Auth endpoints (login, signup, logout)
│   │   ├── invitations/      # Invitation CRUD + publish
│   │   ├── rsvp/             # RSVP management
│   │   ├── ai/               # AI generation endpoints
│   │   ├── upload/           # File upload
│   │   └── public/           # Public API (no auth)
│   ├── auth/                 # Auth pages (login, signup)
│   ├── dashboard/            # Protected dashboard
│   │   ├── invitations/[id]/ # Edit, RSVP views
│   │   └── create/           # Create wizard
│   └── i/[shortId]/          # Public invitation view
├── components/
│   ├── ui/                   # Base UI components
│   ├── editor/               # Editor-specific components
│   ├── landing/              # Landing page components
│   └── rsvp/                 # RSVP components
├── lib/
│   ├── utils.ts              # Utility functions (cn, formatDate, etc.)
│   ├── constants.ts          # App constants
│   ├── auth-server.ts        # Server-side auth verification
│   └── stores/               # Zustand stores
│       ├── auth-store.ts
│       ├── editor-store.ts
│       └── invitation-store.ts
├── services/                 # External service integrations
│   ├── aws/
│   │   ├── s3.ts             # File uploads, presigned URLs
│   │   ├── dynamodb.ts       # Database operations
│   │   ├── bedrock.ts        # AI generation
│   │   ├── ses.ts            # Email sending
│   │   └── cognito.ts        # Authentication
│   └── stripe.ts             # Payments & subscriptions
├── hooks/                    # Custom React hooks
├── types/                    # TypeScript definitions
│   └── index.ts              # All type definitions
└── styles/
    └── globals.css           # Tailwind + custom CSS
```

---

## Type System

All types are in `types/index.ts`. Key types:

### Core Types
- `User` - User account with plan, settings
- `Invitation` - Full invitation with design data
- `DesignElement` - Canvas element (text, image, shape)
- `RSVPResponse` - Guest RSVP submission
- `Template` - Reusable invitation template

### Important Notes
- Use `DesignElement` for canvas elements (NOT `InvitationElement`)
- `EventType` is a union of all event categories
- `UserPlan`: `"free" | "starter" | "pro" | "business"`

---

## Authentication

### Client-Side
```typescript
import { useAuthStore } from '@/lib/stores/auth-store';
const { user, isAuthenticated, login, logout } = useAuthStore();
```

### Server-Side (API Routes)
```typescript
import { verifyAuth } from '@/lib/auth-server';

export async function GET(request: Request) {
  const auth = await verifyAuth(request) as { authenticated: boolean; userId: string | null };
  if (!auth.authenticated) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // Use auth.userId
}
```

---

## Completed Work (as of Dec 7, 2025)

### Group 1: Project Structure (COMPLETE)
- [x] Folder structure (components, lib, hooks, types, services)
- [x] `.env.example` with all required variables
- [x] TypeScript path aliases (`@/*`)
- [x] Tailwind config with custom design system
- [x] Global CSS with variables and components

### Services Layer (COMPLETE)
- [x] `services/aws/s3.ts` - File uploads, presigned URLs
- [x] `services/aws/dynamodb.ts` - All CRUD operations
- [x] `services/aws/bedrock.ts` - AI text generation
- [x] `services/aws/ses.ts` - Email templates and sending
- [x] `services/aws/cognito.ts` - Full auth flow
- [x] `services/stripe.ts` - Subscriptions, checkout, portal

### Utilities (COMPLETE in lib/utils.ts)
- [x] `cn()` - Class name merging
- [x] Date formatting utilities
- [x] String utilities (slugify, truncate, capitalize)
- [x] Number formatting (currency, percent)
- [x] Validation helpers
- [x] URL generators (share, RSVP, calendar)
- [x] Array utilities
- [x] Color utilities
- [x] LocalStorage helpers
- [x] Debounce/throttle

### Types (COMPLETE in types/index.ts)
- [x] User, UserSettings, AuthState
- [x] Invitation, InvitationDesign, DesignElement
- [x] RSVP types
- [x] Template types
- [x] AI generation types
- [x] Subscription/billing types
- [x] API response types
- [x] Form types

### API Routes (COMPLETE)
- [x] Auth routes (signup, login, logout)
- [x] Invitations CRUD
- [x] Invitation publish
- [x] RSVP management
- [x] File upload
- [x] AI generation

### TypeScript Fixes (Dec 7, 2025)
- [x] Fixed hook file extension (use-editor-shortcuts.ts → .tsx)
- [x] Fixed Stripe API version (2025-02-24.acacia)
- [x] Added sanitizeExtension function to upload route
- [x] Fixed Buffer type in RSVP export route
- [x] Installed react-dnd and react-dnd-html5-backend
- [x] Added shortId and settings to Invitation type
- [x] Added InvitationSettings with canvas properties
- [x] Fixed ElementStyle fontWeight type
- [x] Fixed TextEffectsPanel required props
- [x] Fixed guest-list view mode comparisons
- [x] Fixed element-library search input icon

### UI Components (COMPLETE - 18 components)
- [x] Button, Input, Card, Badge (base components)
- [x] Label, Textarea, Select (form inputs)
- [x] Checkbox, Switch (toggle components)
- [x] Dialog, Tooltip, Avatar (overlay components)
- [x] DropdownMenu, Popover, Tabs (navigation)
- [x] Skeleton, Progress, Spinner (loading states)
- [x] Editor components (toolbar, layers, text-effects, canvas-element)
- [x] Element library with search
- [x] Guest list with cards/table views
- [x] UI components index file (components/ui/index.ts)

### Custom Hooks (COMPLETE - 5 hook files)
- [x] useDebounce, useDebouncedCallback (use-debounce.ts)
- [x] useLocalStorage, useReadLocalStorage (use-local-storage.ts)
- [x] useClickOutside, useClickOutsideMultiple (use-click-outside.ts)
- [x] useMediaQuery, useIsMobile, useIsTablet, useIsDesktop, useBreakpoint (use-media-query.ts)
- [x] usePrefersColorScheme, usePrefersReducedMotion (use-media-query.ts)
- [x] useCopyToClipboard (use-copy-to-clipboard.ts)
- [x] Hooks index file (hooks/index.ts)

### Template System (COMPLETE)
- [x] Template data with 16 sample templates (lib/data/templates.ts)
- [x] Template categories (wedding, birthday, baby_shower, corporate, holiday, dinner_party)
- [x] TemplateCard component with hover preview
- [x] TemplateGallery with search, filters, view modes
- [x] TemplatePreviewDialog for full preview
- [x] TemplateSelectionGallery for wizard integration
- [x] API route for templates (app/api/templates/route.ts)
- [x] Helper functions (getByCategory, search, filter, sort)

### Dashboard Components (COMPLETE)
- [x] StatsCard, StatsGrid, MiniStat (stats-card.tsx)
- [x] AnalyticsOverview, RSVPProgress (analytics-overview.tsx)
- [x] AccountSettings with profile, notifications, preferences (account-settings.tsx)
- [x] Settings page (app/dashboard/settings/page.tsx)
- [x] Separator UI component
- [x] Dashboard components index file

### Editor Enhancements (COMPLETE)
- [x] ColorPicker with palettes and custom input (color-picker.tsx)
- [x] ColorSwatch, QuickColorSelect components
- [x] FontPicker with categories and search (font-picker.tsx)
- [x] QuickFontSelect, FontSizeSelect components
- [x] PropertiesPanel for element editing (properties-panel.tsx)
- [x] EditorSidebar with panel navigation (editor-sidebar.tsx)
- [x] Slider UI component
- [x] Updated editor components index

### Pages (PARTIAL)
- [x] Landing page
- [x] Auth pages (login, signup)
- [x] Dashboard home
- [x] Create wizard
- [x] Public invitation view
- [x] RSVP pages
- [x] Editor page (basic functionality)

### Share Components (COMPLETE - Group 11)
- [x] ShareDialog with copy, social sharing (share-dialog.tsx)
- [x] ShareButtons for social networks
- [x] EmailInviteForm with validation (email-invite-form.tsx)
- [x] EmailListItem for sent invites
- [x] Share components index

### Invitation Components (COMPLETE - Group 12)
- [x] QRCode with dynamic generation (qr-code.tsx)
- [x] QRCodeDownload with size/format options
- [x] QRCodeSimple for compact display
- [x] AddToCalendar for Google, Outlook, Yahoo, ICS (add-to-calendar.tsx)
- [x] generateCalendarLinks utility
- [x] Invitation components index

### Public Components (COMPLETE - Group 13)
- [x] EventDetails with full event info (event-details.tsx)
- [x] EventDetailsCompact for cards/lists
- [x] RSVPForm with validation (rsvp-form.tsx)
- [x] QuickRSVP buttons
- [x] ResponseConfirmation with calendar add (response-confirmation.tsx)
- [x] InvitationPage full layout (invitation-page.tsx)
- [x] InvitationPageSkeleton loader
- [x] Public components index

### Guest Management (COMPLETE - Group 14)
- [x] GuestTable with sort, filter, bulk actions (guest-table.tsx)
- [x] GuestForm dialog for add/edit (guest-form.tsx)
- [x] QuickAddGuest inline form
- [x] GuestImport CSV upload (guest-import.tsx)
- [x] Guest components index

### Notification System (COMPLETE - Group 15)
- [x] NotificationItem with types and states (notification-item.tsx)
- [x] NotificationItemSkeleton loader
- [x] NotificationCenter dropdown (notification-center.tsx)
- [x] NotificationBell with count
- [x] notify toast functions (notification-toast.tsx)
- [x] NotificationToasterStyled component
- [x] NotificationService with DynamoDB (notification-service.ts)
- [x] Notification components index

### Billing Components (COMPLETE - Group 16)
- [x] PricingCard with features list (pricing-card.tsx)
- [x] PricingSection with billing toggle
- [x] SubscriptionStatus with usage bars (subscription-status.tsx)
- [x] SubscriptionBadge compact display
- [x] Billing components index

### Media Components (COMPLETE - Group 17)
- [x] ImageUpload with drag-drop (image-upload.tsx)
- [x] MultiImageUpload for galleries
- [x] MediaGallery with grid/list views (media-gallery.tsx)
- [x] MediaPicker dialog
- [x] Media components index

### Layout Components (COMPLETE - Group 18)
- [x] DashboardLayout with sidebar navigation (dashboard-layout.tsx)
- [x] PageHeader with breadcrumbs
- [x] Layout components index

---

## Pending Work

### Component Wiring Progress (Dec 7, 2025)

- [x] Task 1: DashboardLayout - NotificationCenter integrated
- [x] Task 2: Guest Management - guests page created at `/dashboard/invitations/[id]/guests`
- [x] Task 3: Editor Media Gallery - MediaPicker, ImageUpload, PropertiesPanel wired
- [x] Task 4: Billing/Pricing page - `/dashboard/billing` with PricingSection, SubscriptionStatus
- [x] Task 5: Editor Integration - Keyboard shortcuts (useEditorShortcuts hook)
- [x] Task 6: Share Dialog page - `/dashboard/invitations/[id]/share` with EmailInviteForm, QRCode, Calendar
- [x] Task 7: Analytics Dashboard - `/dashboard/analytics` with StatsGrid, RSVPProgress, overview
- [x] Task 8: Empty States - EmptyState, EmptyInvitations, EmptyGuests, etc. (components/ui/empty-state.tsx)
- [x] Task 9: Error Boundary - ErrorBoundary, ErrorFallback, PageError, ApiError (components/ui/error-boundary.tsx)
- [x] Task 10: Invitations List Page - /dashboard/invitations with grid/list views, search, filters, sorting
- [x] Task 11: Create Wizard polish - template redirect flow, sessionStorage data passing
- [x] Task 12: Templates Page - /dashboard/templates with TemplateGallery integration
- [x] Task 13: RSVP Dashboard - /dashboard/rsvp with stats, filters, response list
- [x] Task 14: ErrorBoundary wrapper in dashboard layout
- [x] Task 15: Settings page already exists with AccountSettings component
- [x] Task 16: Invitation Detail View - /dashboard/invitations/[id] with stats, QR, RSVP overview
- [x] Task 17: 404 Not Found page (app/not-found.tsx) with animations
- [x] Task 18: Help page (app/help/page.tsx) with FAQ sections and search
- [x] Task 19: Global error page (app/error.tsx) with animations, dev-only stack traces
- [x] Task 20: Loading states (app/loading.tsx, dashboard/loading.tsx, invitations/loading.tsx, templates/loading.tsx, auth/loading.tsx)
- [x] Task 21: Invitation edit page (/dashboard/invitations/[id]/edit) - already exists with full editor
- [x] Task 22: Public invitation view (/i/[shortId]) - already exists with element rendering
- [x] Task 23: Public RSVP route (/i/[shortId]/rsvp) - already exists with full form
- [x] Task 24: All pages verified - complete page coverage

### All Routes Complete
**Auth:** `/auth/login`, `/auth/signup`
**Dashboard:** `/dashboard`, `/dashboard/analytics`, `/dashboard/billing`, `/dashboard/create`, `/dashboard/invitations`, `/dashboard/invitations/[id]`, `/dashboard/invitations/[id]/edit`, `/dashboard/invitations/[id]/guests`, `/dashboard/invitations/[id]/rsvp`, `/dashboard/invitations/[id]/share`, `/dashboard/rsvp`, `/dashboard/settings`, `/dashboard/templates`
**Public:** `/`, `/help`, `/i/[shortId]`, `/i/[shortId]/rsvp`
**Error/Loading:** `error.tsx`, `not-found.tsx`, `loading.tsx` (multiple)

### Remaining Work (Optional Polish)

1. **Email Templates** - Email notification designs
2. **Testing** - Component and integration tests
3. **Analytics** - Real tracking integration
4. **Deployment** - AWS infrastructure setup

### Full Task List (Groups 1-20) - ALL COMPLETE
- Group 1 (1-5): COMPLETE - Project structure & TypeScript fixes
- Group 2 (6-10): COMPLETE - Utilities (already in utils.ts)
- Group 3 (11-15): COMPLETE - Types (already in types/index.ts)
- Group 4 (16-20): COMPLETE - UI Components (base, form, toggle, overlay)
- Group 5 (21-25): COMPLETE - UI Components (dropdown, tabs, popover)
- Group 6 (26-30): COMPLETE - Loading Components (skeleton, progress, spinner)
- Group 7 (31-35): COMPLETE - Custom React hooks
- Group 8 (36-40): COMPLETE - Template system (data, gallery, API)
- Group 9 (41-45): COMPLETE - Dashboard analytics and settings
- Group 10 (46-50): COMPLETE - Editor enhancements (color, font, properties)
- Group 11 (51-55): COMPLETE - Share components
- Group 12 (56-60): COMPLETE - QR code and calendar components
- Group 13 (61-65): COMPLETE - Public invitation page components
- Group 14 (66-70): COMPLETE - Guest management components
- Group 15 (71-75): COMPLETE - Notification system
- Group 16 (76-80): COMPLETE - Billing/subscription components
- Group 17 (81-85): COMPLETE - Media upload components
- Group 18 (86-90): COMPLETE - Layout components
- Group 19 (91-95): COMPLETE - Services (notification-service.ts exists)
- Group 20 (96-100): COMPLETE - AI_CONTEXT.md updated

---

## Key Patterns

### API Route Pattern
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request) as { authenticated: boolean; userId: string | null };
  if (!auth.authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // Implementation
}
```

### Component Pattern
```typescript
import { cn } from '@/lib/utils';

interface ComponentProps {
  className?: string;
  children: React.ReactNode;
}

export function Component({ className, children }: ComponentProps) {
  return (
    <div className={cn('base-classes', className)}>
      {children}
    </div>
  );
}
```

### Zustand Store Pattern
```typescript
import { create } from 'zustand';

interface StoreState {
  value: string;
  setValue: (value: string) => void;
}

export const useStore = create<StoreState>((set) => ({
  value: '',
  setValue: (value) => set({ value }),
}));
```

---

## Environment Variables

All required env vars are documented in `.env.example`. Key categories:
- `AWS_*` - AWS credentials and regions
- `COGNITO_*` - User pool configuration
- `DYNAMODB_*` - Table names
- `S3_*` - Bucket configuration
- `BEDROCK_*` - AI model configuration
- `SES_*` - Email configuration
- `STRIPE_*` - Payment keys and price IDs
- `NEXT_PUBLIC_*` - Client-exposed variables

---

## Commands

```bash
# Development
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Build
npm run build
```

---

## Common Issues & Solutions

### Issue: Type errors with auth
**Solution:** Always cast verifyAuth result:
```typescript
const auth = await verifyAuth(request) as { authenticated: boolean; userId: string | null };
```

### Issue: Import errors
**Solution:** Use path aliases:
```typescript
import { cn } from '@/lib/utils';
import type { User } from '@/types';
```

### Issue: Tailwind classes not applying
**Solution:** Check tailwind.config.ts content array includes your file path

---

## For Future AI Agents

1. **Read this file first** before making changes
2. **Check types/index.ts** for existing type definitions
3. **Check lib/utils.ts** for existing utilities
4. **Check services/** for existing service functions
5. **Update this file** after completing significant work
6. **Run type-check** after making changes to verify
