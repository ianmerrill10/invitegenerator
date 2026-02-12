# InviteGenerator - Complete Button & Action Map

**Last Updated:** 2026-02-11
**Purpose:** Master reference of every clickable button/action on each page. Use for regression testing.

---

## Homepage (`/`)

| # | Element | Type | Action | Target | Status |
|---|---------|------|--------|--------|--------|
| 1 | Logo (header) | Link | Navigate | `/` | OK |
| 2 | "Templates" (header nav) | Link | Navigate | `/templates` | OK |
| 3 | "Pricing" (header nav) | Link | Navigate | `/pricing` | OK |
| 4 | "Features" (header nav) | Link | Navigate | `/features` | OK |
| 5 | "How It Works" (header nav) | Link | Navigate | `/how-it-works` | OK |
| 6 | "Log in" (header) | Link+Button | Navigate | `/auth/login` | OK |
| 7 | "Get Started Free" (header) | Link+Button | Navigate | `/auth/signup` | OK |
| 8 | "Create Free Invitation" (hero) | Link+Button | Navigate | `/dashboard/create` | OK |
| 9 | "Watch Demo" (hero) | Link+Button | Navigate | `/how-it-works` | OK |
| 10 | Category cards (Wedding, Birthday, etc) | Link | Navigate | `/templates?category=X` | OK |
| 11 | "Browse All Templates" | Link+Button | Navigate | `/templates` | OK |
| 12 | "Start Creating Free" (bottom CTA) | Link+Button | Navigate | `/auth/signup` | OK |
| 13 | Footer product links | Links | Navigate | Various | OK |
| 14 | Footer resource links | Links | Navigate | Various | OK |
| 15 | Footer company links | Links | Navigate | Various | OK |
| 16 | Footer legal links | Links | Navigate | Various | OK |
| 17 | Footer social icons | Links | External | Twitter/IG/FB/Pinterest | OK |
| 18 | Mobile hamburger menu | Button | Toggle menu | N/A | OK |

## Header (global - `components/landing/header.tsx`)

| # | Element | Type | Action | Target |
|---|---------|------|--------|--------|
| 1 | Logo | Link | Navigate | `/` |
| 2 | Templates | Link | Navigate | `/templates` |
| 3 | Pricing | Link | Navigate | `/pricing` |
| 4 | Features | Link | Navigate | `/features` |
| 5 | How It Works | Link | Navigate | `/how-it-works` |
| 6 | Log in | Link+Button | Navigate | `/auth/login` |
| 7 | Get Started Free | Link+Button | Navigate | `/auth/signup` |
| 8 | Mobile menu toggle | Button | Open/close mobile nav | N/A |
| 9 | Mobile nav links | Links | Same as desktop nav | Same targets |
| 10 | Mobile Log in | Link+Button | Navigate | `/auth/login` |
| 11 | Mobile Get Started Free | Link+Button | Navigate | `/auth/signup` |

## Footer (global - `components/landing/footer.tsx`)

| # | Element | Type | Action | Target |
|---|---------|------|--------|--------|
| 1 | Logo | Link | Navigate | `/` |
| 2 | Features | Link | Navigate | `/features` |
| 3 | Templates | Link | Navigate | `/templates` |
| 4 | Pricing | Link | Navigate | `/pricing` |
| 5 | Packages | Link | Navigate | `/packages` |
| 6 | How It Works | Link | Navigate | `/how-it-works` |
| 7 | Blog | Link | Navigate | `/blog` |
| 8 | FAQ | Link | Navigate | `/faq` |
| 9 | Help Center | Link | Navigate | `/help` |
| 10 | About | Link | Navigate | `/about` |
| 11 | Contact | Link | Navigate | `/contact` |
| 12 | Affiliate Program | Link | Navigate | `/affiliates` |
| 13 | Blog (company) | Link | Navigate | `/blog` |
| 14 | Privacy Policy | Link | Navigate | `/privacy` |
| 15 | Terms of Service | Link | Navigate | `/terms` |
| 16 | Twitter icon | Link | External | `https://twitter.com/invitegenerator` |
| 17 | Instagram icon | Link | External | `https://instagram.com/invitegenerator` |
| 18 | Facebook icon | Link | External | `https://facebook.com/invitegenerator` |
| 19 | Pinterest icon | Link | External | `https://pinterest.com/invitegenerator` |

## Templates Page (`/templates`)

| # | Element | Type | Action | Target |
|---|---------|------|--------|--------|
| 1 | Category filter tabs | Button | Filter templates | Query param `?category=X` |
| 2 | Template cards | Link/Button | View template detail | Opens preview/modal |
| 3 | "Use Template" on card | Button | Start creation | `/dashboard/create` |
| 4 | Search input | Input | Filter by keyword | Client-side filter |

## Pricing Page (`/pricing`)

| # | Element | Type | Action | Target |
|---|---------|------|--------|--------|
| 1 | Plan toggle (monthly/yearly) | Button | Toggle pricing | Client-side |
| 2 | "Get Started" (Free plan) | Link+Button | Navigate | `/auth/signup` |
| 3 | "Get Started" (Starter plan) | Link+Button | Navigate | `/auth/signup` |
| 4 | "Get Started" (Pro plan) | Link+Button | Navigate | `/auth/signup` |
| 5 | "Contact Sales" (Business) | Link+Button | Navigate | `/contact` |

## Features Page (`/features`)

| # | Element | Type | Action | Target |
|---|---------|------|--------|--------|
| 1 | "Get Started Free" CTA | Link+Button | Navigate | `/auth/signup` |
| 2 | Feature section links | Links | Navigate | Various |

## How It Works Page (`/how-it-works`)

| # | Element | Type | Action | Target |
|---|---------|------|--------|--------|
| 1 | Video placeholder | Video | Play demo | Non-functional (placeholder) |
| 2 | "Start Creating" CTA | Link+Button | Navigate | `/dashboard/create` |

## Auth - Login (`/auth/login`)

| # | Element | Type | Action | Target |
|---|---------|------|--------|--------|
| 1 | Email input | Input | Enter email | N/A |
| 2 | Password input | Input | Enter password | N/A |
| 3 | "Log in" submit | Button | POST to auth API | `/api/auth/login` |
| 4 | "Forgot password?" | Link | Navigate | `/auth/forgot-password` (may not exist) |
| 5 | "Sign up" link | Link | Navigate | `/auth/signup` |

## Auth - Signup (`/auth/signup`)

| # | Element | Type | Action | Target |
|---|---------|------|--------|--------|
| 1 | Name input | Input | Enter name | N/A |
| 2 | Email input | Input | Enter email | N/A |
| 3 | Password input | Input | Enter password | N/A |
| 4 | "Create Account" submit | Button | POST to auth API | `/api/auth/signup` |
| 5 | "Log in" link | Link | Navigate | `/auth/login` |

## Dashboard (`/dashboard`)

| # | Element | Type | Action | Target |
|---|---------|------|--------|--------|
| 1 | Sidebar: Dashboard | Link | Navigate | `/dashboard` |
| 2 | Sidebar: My Invitations | Link | Navigate | `/dashboard/invitations` |
| 3 | Sidebar: Create New | Link | Navigate | `/dashboard/create` |
| 4 | Sidebar: Templates | Link | Navigate | `/dashboard/templates` |
| 5 | Sidebar: RSVP Tracker | Link | Navigate | `/dashboard/rsvp` |
| 6 | Sidebar: Settings | Link | Navigate | `/dashboard/settings` |
| 7 | "Create New" button | Link+Button | Navigate | `/dashboard/create` |
| 8 | Invitation cards | Link | Navigate | `/dashboard/invitations/[id]` |
| 9 | Logout button | Button | POST logout | `/api/auth/logout` then `/` |

## Dashboard - Invitations List (`/dashboard/invitations`)

| # | Element | Type | Action | Target |
|---|---------|------|--------|--------|
| 1 | "Create New" button | Button | Navigate | `/dashboard/create` |
| 2 | Invitation row click | Link | Navigate | `/dashboard/invitations/[id]` |
| 3 | Edit button (per row) | Button | Navigate | `/dashboard/invitations/[id]/edit` |
| 4 | Delete button (per row) | Button | DELETE API call | `/api/invitations/[id]` |

## Dashboard - Invitation Detail (`/dashboard/invitations/[id]`)

| # | Element | Type | Action | Target |
|---|---------|------|--------|--------|
| 1 | "Edit" button | Link+Button | Navigate | `/dashboard/invitations/[id]/edit` |
| 2 | "Share" button | Link+Button | Navigate | `/dashboard/invitations/[id]/share` |
| 3 | "RSVPs" button | Link+Button | Navigate | `/dashboard/invitations/[id]/rsvp` |
| 4 | "Guests" button | Link+Button | Navigate | `/dashboard/invitations/[id]/guests` |
| 5 | "Publish" button | Button | POST API call | `/api/invitations/[id]/publish` |
| 6 | "Delete" button | Button | DELETE API call | `/api/invitations/[id]` |
| 7 | "Copy link" button | Button | Copy to clipboard | N/A |
| 8 | "Back to invitations" | Button | Navigate | `/dashboard/invitations` |

## Dashboard - Create (`/dashboard/create`)

| # | Element | Type | Action | Target |
|---|---------|------|--------|--------|
| 1 | Event type selection | Button | Select event type | Client-side |
| 2 | "Choose Template" | Button | Navigate | `/dashboard/templates?category=X` |
| 3 | "AI Generate" | Button | Navigate to editor | `/dashboard/invitations/[id]/edit` |
| 4 | Form inputs | Inputs | Fill event details | Client-side |

## Dashboard - Analytics (`/dashboard/analytics`)

| # | Element | Type | Action | Target |
|---|---------|------|--------|--------|
| 1 | "Create your first invitation" | Button | Navigate | `/dashboard/create` |
| 2 | Invitation rows | Clickable | Navigate | `/dashboard/invitations/[id]` |
| 3 | Tab buttons | Buttons | Switch tabs | Client-side |

## Dashboard - Billing (`/dashboard/billing`)

| # | Element | Type | Action | Target |
|---|---------|------|--------|--------|
| 1 | "Upgrade" buttons | Button | Stripe checkout | Redirect to Stripe |
| 2 | "Manage Subscription" | Button | Stripe portal | Redirect to Stripe |
| 3 | "Billing settings" | Button | Navigate | `/dashboard/settings?tab=billing` |

## Dashboard - Settings (`/dashboard/settings`)

| # | Element | Type | Action | Target |
|---|---------|------|--------|--------|
| 1 | Profile form | Form | Update profile | `/api/user/profile` |
| 2 | "Save" button | Button | POST API | Various |
| 3 | Tab buttons | Buttons | Switch tabs | Client-side |

## Packages Page (`/packages`)

| # | Element | Type | Action | Target |
|---|---------|------|--------|--------|
| 1 | Package cards | Link | Navigate | `/packages/[slug]` |
| 2 | Filter buttons | Buttons | Filter packages | Query params |

## Affiliates Page (`/affiliates`)

| # | Element | Type | Action | Target |
|---|---------|------|--------|--------|
| 1 | "Join Now" CTA | Link+Button | Navigate | `/affiliates/join` |
| 2 | "Terms" link | Link | Navigate | `/affiliates/terms` |

## Site Access (`/site-access`)

| # | Element | Type | Action | Target |
|---|---------|------|--------|--------|
| 1 | Password input | Input | Enter password | N/A |
| 2 | "Access Site" button | Button | POST API | `/api/site-access` |

## 404 Page (`not-found.tsx`)

| # | Element | Type | Action | Target |
|---|---------|------|--------|--------|
| 1 | "Go Home" | Link+Button | Navigate | `/` |
| 2 | "Dashboard" | Link+Button | Navigate | `/dashboard` |
| 3 | "contact support" | Link | Navigate | `/help` |

---

## Known Non-Functional Elements

| Page | Element | Issue | Status |
|------|---------|-------|--------|
| `/how-it-works` | Video player | Placeholder - no actual video | KNOWN |
| `/auth/login` | "Forgot password?" link | May point to non-existent page | NEEDS VERIFY |

---

## Update Instructions

When adding a new button or action:
1. Add to this doc under the appropriate page section
2. Test the action works (navigation, API call, etc)
3. Update the test log with results
