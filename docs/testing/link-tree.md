# InviteGenerator - Complete Link Tree

**Last Updated:** 2026-02-11
**Purpose:** Master reference of every navigable route in the app. Use for regression testing.

---

## How to Run a Link Test

```bash
# Test all public routes (replace password if changed):
COOKIE="site_access_granted=InviteGen2025Preview!"
ROUTES=(/ /about /affiliates /affiliates/join /affiliates/terms /affiliates/dashboard /blog /contact /faq /features /help /how-it-works /packages /pricing /privacy /templates /terms /auth/login /auth/signup /dashboard /dashboard/analytics /dashboard/billing /dashboard/create /dashboard/invitations /dashboard/rsvp /dashboard/settings /dashboard/templates /admin /admin/contacts /site-access /registry/create)

for route in "${ROUTES[@]}"; do
  status=$(curl -s -o /dev/null -w "%{http_code}" -b "$COOKIE" http://localhost:3002$route)
  echo "$route : $status"
done
```

---

## Public Marketing Pages

| Route | Page File | Description | Linked From |
|-------|-----------|-------------|-------------|
| `/` | `app/page.tsx` | Homepage / Landing page | Logo in header |
| `/about` | `app/about/page.tsx` | About us page | Footer > Company |
| `/affiliates` | `app/affiliates/page.tsx` | Affiliate program landing | Footer > Company |
| `/affiliates/join` | `app/affiliates/join/page.tsx` | Affiliate signup form | Affiliates page CTA |
| `/affiliates/terms` | `app/affiliates/terms/page.tsx` | Affiliate terms & conditions | Affiliates page |
| `/affiliates/dashboard` | `app/affiliates/dashboard/page.tsx` | Affiliate dashboard (auth) | After affiliate join |
| `/blog` | `app/blog/page.tsx` | Blog listing | Footer > Resources, Footer > Company |
| `/blog/[slug]` | `app/blog/[slug]/page.tsx` | Individual blog post | Blog listing |
| `/contact` | `app/contact/page.tsx` | Contact form | Footer > Company |
| `/faq` | `app/faq/page.tsx` | FAQ page | Footer > Resources |
| `/features` | `app/features/page.tsx` | Features overview | Header nav, Footer > Product |
| `/help` | `app/help/page.tsx` | Help center | Footer > Resources, 404 page |
| `/how-it-works` | `app/how-it-works/page.tsx` | How it works / Demo | Header nav, Homepage "Watch Demo" |
| `/packages` | `app/packages/page.tsx` | Invitation packages | Footer > Product |
| `/packages/[slug]` | `app/packages/[slug]/page.tsx` | Individual package detail | Packages listing |
| `/pricing` | `app/pricing/page.tsx` | Pricing plans | Header nav, Footer > Product |
| `/privacy` | `app/privacy/page.tsx` | Privacy policy | Footer > Legal |
| `/templates` | `app/templates/page.tsx` | Template gallery | Header nav, Footer > Product, Homepage categories |
| `/templates?category=X` | `app/templates/page.tsx` | Filtered templates | Homepage category cards |
| `/terms` | `app/terms/page.tsx` | Terms of service | Footer > Legal |

## Authentication Pages

| Route | Page File | Description | Linked From |
|-------|-----------|-------------|-------------|
| `/auth/login` | `app/auth/login/page.tsx` | Login page | Header "Log in", Dashboard redirect |
| `/auth/signup` | `app/auth/signup/page.tsx` | Signup page | Header "Get Started Free", Homepage CTAs |

## Dashboard Pages (Auth Required)

| Route | Page File | Description | Linked From |
|-------|-----------|-------------|-------------|
| `/dashboard` | `app/dashboard/page.tsx` | Main dashboard | After login, sidebar |
| `/dashboard/analytics` | `app/dashboard/analytics/page.tsx` | Analytics overview | Sidebar |
| `/dashboard/billing` | `app/dashboard/billing/page.tsx` | Billing & subscription | Sidebar |
| `/dashboard/create` | `app/dashboard/create/page.tsx` | Create new invitation | Sidebar, CTAs |
| `/dashboard/invitations` | `app/dashboard/invitations/page.tsx` | List all invitations | Sidebar |
| `/dashboard/invitations/[id]` | `app/dashboard/invitations/[id]/page.tsx` | Invitation detail | Invitations list |
| `/dashboard/invitations/[id]/edit` | `app/dashboard/invitations/[id]/edit/page.tsx` | Edit invitation | Invitation detail |
| `/dashboard/invitations/[id]/guests` | `app/dashboard/invitations/[id]/guests/page.tsx` | Guest management | Invitation detail |
| `/dashboard/invitations/[id]/rsvp` | `app/dashboard/invitations/[id]/rsvp/page.tsx` | RSVP management | Invitation detail |
| `/dashboard/invitations/[id]/share` | `app/dashboard/invitations/[id]/share/page.tsx` | Share invitation | Invitation detail |
| `/dashboard/rsvp` | `app/dashboard/rsvp/page.tsx` | RSVP tracker | Sidebar |
| `/dashboard/settings` | `app/dashboard/settings/page.tsx` | User settings | Sidebar |
| `/dashboard/templates` | `app/dashboard/templates/page.tsx` | Browse templates | Sidebar, Create flow |

## Admin Pages (Admin Auth Required)

| Route | Page File | Description | Linked From |
|-------|-----------|-------------|-------------|
| `/admin` | `app/admin/page.tsx` | Admin dashboard | Direct URL |
| `/admin/contacts` | `app/admin/contacts/page.tsx` | CRM contacts | Admin sidebar |

## Public Invitation Pages (No Auth)

| Route | Page File | Description | Linked From |
|-------|-----------|-------------|-------------|
| `/i/[shortId]` | `app/i/[shortId]/page.tsx` | View shared invitation | Share links, emails |
| `/i/[shortId]/rsvp` | `app/i/[shortId]/rsvp/page.tsx` | RSVP for invitation | Invitation view CTA |

## Special Pages

| Route | Page File | Description | Linked From |
|-------|-----------|-------------|-------------|
| `/site-access` | `app/site-access/page.tsx` | Password gate (preview mode) | Middleware redirect |
| `/registry/create` | `app/registry/create/page.tsx` | Create gift registry | Dashboard |
| `/registry/[customUrl]` | `app/registry/[customUrl]/page.tsx` | Public registry view | Share links |

## Navigation Constants

Defined in `lib/constants.ts` > `NAVIGATION`:

### Header Nav (`NAVIGATION.main`)
1. Templates → `/templates`
2. Pricing → `/pricing`
3. Features → `/features`
4. How It Works → `/how-it-works`

### Sidebar Nav (`NAVIGATION.dashboard`)
1. Dashboard → `/dashboard`
2. My Invitations → `/dashboard/invitations`
3. Create New → `/dashboard/create`
4. Templates → `/dashboard/templates`
5. RSVP Tracker → `/dashboard/rsvp`
6. Settings → `/dashboard/settings`

### Footer Nav (`NAVIGATION.footer`)
**Product:** Features, Templates, Pricing, Packages
**Resources:** How It Works, Blog, FAQ, Help Center
**Company:** About, Contact, Affiliate Program, Blog
**Legal:** Privacy Policy, Terms of Service

## External Links

| URL | Description | Source |
|-----|-------------|--------|
| `https://twitter.com/invitegenerator` | Twitter | Footer social |
| `https://instagram.com/invitegenerator` | Instagram | Footer social |
| `https://facebook.com/invitegenerator` | Facebook | Footer social |
| `https://pinterest.com/invitegenerator` | Pinterest | Footer social |
| `mailto:support@invitegenerator.com` | Support email | Footer, Help page |

---

## Update Instructions

When adding a new page:
1. Create `app/[route]/page.tsx`
2. Add to this link tree under the appropriate section
3. Add navigation link in `lib/constants.ts` if needed
4. Run the link test script above to verify
