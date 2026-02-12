# InviteGenerator Project Files Inventory

> **Last Updated:** 2025-12-18
> **AI Agent Responsibility:** Keep this file accurate after any file additions, deletions, or moves.
> **Referenced by:** AI_CONTEXT.md

---

## Quick Stats
- **Total App Files:** 150+
- **Pages:** 35
- **API Routes:** 30
- **Components:** 70+
- **Services:** 10
- **Hooks:** 6

---

## Directory Structure

```
invitegenerator-app/
├── app/                          # Next.js App Router
├── components/                   # React Components
├── hooks/                        # Custom React Hooks
├── lib/                          # Utilities & Services
├── services/                     # AWS & External Services
├── types/                        # TypeScript Definitions
├── styles/                       # Global Styles
└── public/                       # Static Assets
```

---

## App Pages & Routes

### Root Pages
| File | Route | Description |
|------|-------|-------------|
| `app/page.tsx` | `/` | Landing page |
| `app/layout.tsx` | - | Root layout |
| `app/loading.tsx` | - | Global loading state |
| `app/error.tsx` | - | Error boundary |
| `app/global-error.tsx` | - | Root error boundary |
| `app/not-found.tsx` | `/404` | 404 page |

### Marketing Pages
| File | Route | Description |
|------|-------|-------------|
| `app/pricing/page.tsx` | `/pricing` | Pricing plans |
| `app/features/page.tsx` | `/features` | Feature list |
| `app/templates/page.tsx` | `/templates` | Template gallery |
| `app/how-it-works/page.tsx` | `/how-it-works` | How it works guide |
| `app/about/page.tsx` | `/about` | About page |
| `app/blog/page.tsx` | `/blog` | Blog index |
| `app/blog/[slug]/page.tsx` | `/blog/:slug` | Blog post |
| `app/faq/page.tsx` | `/faq` | FAQ page |
| `app/contact/page.tsx` | `/contact` | Contact form |
| `app/help/page.tsx` | `/help` | Help center |
| `app/privacy/page.tsx` | `/privacy` | Privacy policy |
| `app/terms/page.tsx` | `/terms` | Terms of service |

### Auth Pages
| File | Route | Description |
|------|-------|-------------|
| `app/auth/login/page.tsx` | `/auth/login` | Login page |
| `app/auth/signup/page.tsx` | `/auth/signup` | Signup page |
| `app/auth/layout.tsx` | - | Auth layout |
| `app/auth/loading.tsx` | - | Auth loading |
| `app/auth/error.tsx` | - | Auth error |

### Dashboard Pages
| File | Route | Description |
|------|-------|-------------|
| `app/dashboard/page.tsx` | `/dashboard` | Dashboard home |
| `app/dashboard/layout.tsx` | - | Dashboard layout |
| `app/dashboard/loading.tsx` | - | Dashboard loading |
| `app/dashboard/error.tsx` | - | Dashboard error |
| `app/dashboard/create/page.tsx` | `/dashboard/create` | Create wizard |
| `app/dashboard/invitations/page.tsx` | `/dashboard/invitations` | Invitations list |
| `app/dashboard/invitations/[id]/page.tsx` | `/dashboard/invitations/:id` | Invitation detail |
| `app/dashboard/invitations/[id]/edit/page.tsx` | `/dashboard/invitations/:id/edit` | Editor |
| `app/dashboard/invitations/[id]/rsvp/page.tsx` | `/dashboard/invitations/:id/rsvp` | RSVP management |
| `app/dashboard/invitations/[id]/share/page.tsx` | `/dashboard/invitations/:id/share` | Share dialog |
| `app/dashboard/invitations/[id]/guests/page.tsx` | `/dashboard/invitations/:id/guests` | Guest list |
| `app/dashboard/templates/page.tsx` | `/dashboard/templates` | Templates |
| `app/dashboard/rsvp/page.tsx` | `/dashboard/rsvp` | RSVP overview |
| `app/dashboard/analytics/page.tsx` | `/dashboard/analytics` | Analytics |
| `app/dashboard/billing/page.tsx` | `/dashboard/billing` | Billing |
| `app/dashboard/settings/page.tsx` | `/dashboard/settings` | Settings |

### Public Invitation Pages
| File | Route | Description |
|------|-------|-------------|
| `app/i/[shortId]/page.tsx` | `/i/:shortId` | Public invitation |
| `app/i/[shortId]/rsvp/page.tsx` | `/i/:shortId/rsvp` | RSVP form |

### Affiliate Pages
| File | Route | Description |
|------|-------|-------------|
| `app/affiliates/page.tsx` | `/affiliates` | Affiliate landing |
| `app/affiliates/join/page.tsx` | `/affiliates/join` | Affiliate signup |
| `app/affiliates/dashboard/page.tsx` | `/affiliates/dashboard` | Affiliate dashboard |
| `app/affiliates/terms/page.tsx` | `/affiliates/terms` | Affiliate terms |

---

## API Routes

### Auth API
| File | Method | Endpoint |
|------|--------|----------|
| `app/api/auth/login/route.ts` | POST | `/api/auth/login` |
| `app/api/auth/signup/route.ts` | POST | `/api/auth/signup` |
| `app/api/auth/logout/route.ts` | POST | `/api/auth/logout` |
| `app/api/auth/forgot-password/route.ts` | POST | `/api/auth/forgot-password` |
| `app/api/auth/reset-password/route.ts` | POST | `/api/auth/reset-password` |
| `app/api/auth/csrf/route.ts` | GET | `/api/auth/csrf` |

### Invitations API
| File | Method | Endpoint |
|------|--------|----------|
| `app/api/invitations/route.ts` | GET, POST | `/api/invitations` |
| `app/api/invitations/[id]/route.ts` | GET, PUT, DELETE | `/api/invitations/:id` |
| `app/api/invitations/[id]/publish/route.ts` | POST | `/api/invitations/:id/publish` |
| `app/api/invitations/[id]/duplicate/route.ts` | POST | `/api/invitations/:id/duplicate` |

### RSVP API
| File | Method | Endpoint |
|------|--------|----------|
| `app/api/rsvp/[invitationId]/route.ts` | GET, POST | `/api/rsvp/:invitationId` |
| `app/api/rsvp/[invitationId]/[rsvpId]/route.ts` | PUT, DELETE | `/api/rsvp/:invitationId/:rsvpId` |
| `app/api/rsvp/[invitationId]/export/route.ts` | GET | `/api/rsvp/:invitationId/export` |
| `app/api/rsvp/all/route.ts` | GET | `/api/rsvp/all` |

### Public API
| File | Method | Endpoint |
|------|--------|----------|
| `app/api/public/invitation/[shortId]/route.ts` | GET | `/api/public/invitation/:shortId` |
| `app/api/public/invitation/[shortId]/rsvp-details/route.ts` | GET | `/api/public/invitation/:shortId/rsvp-details` |

### AI API
| File | Method | Endpoint |
|------|--------|----------|
| `app/api/ai/generate/route.ts` | POST | `/api/ai/generate` |
| `app/api/ai/remove-background/route.ts` | POST | `/api/ai/remove-background` |

### Billing API
| File | Method | Endpoint |
|------|--------|----------|
| `app/api/billing/checkout/route.ts` | POST | `/api/billing/checkout` |
| `app/api/billing/portal/route.ts` | POST | `/api/billing/portal` |
| `app/api/billing/subscription/route.ts` | GET | `/api/billing/subscription` |

### Affiliate API
| File | Method | Endpoint |
|------|--------|----------|
| `app/api/affiliates/route.ts` | GET, POST, PATCH | `/api/affiliates` |
| `app/api/affiliates/track/route.ts` | POST | `/api/affiliates/track` |
| `app/api/affiliates/payout/route.ts` | POST | `/api/affiliates/payout` |
| `app/api/affiliates/leaderboard/route.ts` | GET | `/api/affiliates/leaderboard` |
| `app/api/affiliates/apply/route.ts` | POST | `/api/affiliates/apply` |

### Other API
| File | Method | Endpoint |
|------|--------|----------|
| `app/api/templates/route.ts` | GET | `/api/templates` |
| `app/api/upload/route.ts` | POST | `/api/upload` |
| `app/api/user/profile/route.ts` | GET, PUT | `/api/user/profile` |
| `app/api/user/settings/route.ts` | GET, PUT | `/api/user/settings` |
| `app/api/notifications/route.ts` | GET, POST | `/api/notifications` |
| `app/api/webhooks/stripe/route.ts` | POST | `/api/webhooks/stripe` |
| `app/api/health/route.ts` | GET | `/api/health` |
| `app/api/og/route.tsx` | GET | `/api/og` |

---

## Components

### UI Components (components/ui/)
| File | Component(s) |
|------|-------------|
| `button.tsx` | Button |
| `input.tsx` | Input |
| `card.tsx` | Card, CardHeader, CardContent, CardFooter |
| `badge.tsx` | Badge |
| `label.tsx` | Label |
| `textarea.tsx` | Textarea |
| `select.tsx` | Select, SelectTrigger, SelectContent, SelectItem |
| `checkbox.tsx` | Checkbox |
| `switch.tsx` | Switch |
| `dialog.tsx` | Dialog, DialogTrigger, DialogContent |
| `tooltip.tsx` | Tooltip |
| `avatar.tsx` | Avatar |
| `dropdown-menu.tsx` | DropdownMenu |
| `tabs.tsx` | Tabs, TabsList, TabsTrigger, TabsContent |
| `popover.tsx` | Popover |
| `skeleton.tsx` | Skeleton |
| `progress.tsx` | Progress |
| `spinner.tsx` | Spinner |
| `slider.tsx` | Slider |
| `separator.tsx` | Separator |
| `empty-state.tsx` | EmptyState, EmptyInvitations, EmptyGuests |
| `error-boundary.tsx` | ErrorBoundary, ErrorFallback |

### Editor Components (components/editor/)
| File | Component(s) |
|------|-------------|
| `canvas-element.tsx` | CanvasElement |
| `color-picker.tsx` | ColorPicker, ColorSwatch, QuickColorSelect |
| `font-picker.tsx` | FontPicker, QuickFontSelect |
| `editor-sidebar.tsx` | EditorSidebar |
| `properties-panel.tsx` | PropertiesPanel |
| `layers-panel.tsx` | LayersPanel |
| `text-effects-panel.tsx` | TextEffectsPanel |
| `element-library.tsx` | ElementLibrary |
| `image-upload.tsx` | ImageUpload |
| `background-removal.tsx` | BackgroundRemoval |

### Landing Components (components/landing/)
| File | Component(s) |
|------|-------------|
| `header.tsx` | Header |
| `footer.tsx` | Footer |
| `hero.tsx` | Hero |
| `features.tsx` | Features |
| `pricing.tsx` | PricingSection |

### Template Components (components/templates/)
| File | Component(s) |
|------|-------------|
| `template-gallery.tsx` | TemplateGallery, TemplateCard |

### Dashboard Components (components/dashboard/)
| File | Component(s) |
|------|-------------|
| `stats-card.tsx` | StatsCard, StatsGrid |
| `analytics-overview.tsx` | AnalyticsOverview |
| `account-settings.tsx` | AccountSettings |

### Share Components (components/share/)
| File | Component(s) |
|------|-------------|
| `share-dialog.tsx` | ShareDialog, ShareButtons |

### Invitation Components (components/invitation/)
| File | Component(s) |
|------|-------------|
| `qr-code.tsx` | QRCode, QRCodeDownload |
| `add-to-calendar.tsx` | AddToCalendar |

### Public Components (components/public/)
| File | Component(s) |
|------|-------------|
| `event-details.tsx` | EventDetails |
| `rsvp-form.tsx` | RSVPForm |
| `response-confirmation.tsx` | ResponseConfirmation |
| `invitation-page.tsx` | InvitationPage |

### Guest Components (components/guests/)
| File | Component(s) |
|------|-------------|
| `guest-table.tsx` | GuestTable |
| `guest-form.tsx` | GuestForm |
| `guest-import.tsx` | GuestImport |

### RSVP Components (components/rsvp/)
| File | Component(s) |
|------|-------------|
| `guest-list.tsx` | GuestList |

### Notification Components (components/notifications/)
| File | Component(s) |
|------|-------------|
| `notification-center.tsx` | NotificationCenter |
| `notification-toast.tsx` | NotificationToast |

### Billing Components (components/billing/)
| File | Component(s) |
|------|-------------|
| `pricing-card.tsx` | PricingCard |
| `subscription-status.tsx` | SubscriptionStatus |

### Media Components (components/media/)
| File | Component(s) |
|------|-------------|
| `media-gallery.tsx` | MediaGallery |
| `image-upload.tsx` | ImageUpload |

### Marketing Components (components/marketing/)
| File | Component(s) |
|------|-------------|
| `newsletter-signup.tsx` | NewsletterSignup |
| `testimonials.tsx` | Testimonials |
| `social-share.tsx` | SocialShare |

### Analytics Components (components/analytics/)
| File | Component(s) |
|------|-------------|
| `google-analytics.tsx` | GoogleAnalytics |

### Accessibility Components (components/accessibility/)
| File | Component(s) |
|------|-------------|
| `skip-to-content.tsx` | SkipToContent |

---

## Lib (lib/)

### Core Utilities
| File | Description |
|------|-------------|
| `utils.ts` | cn(), formatDate(), truncate(), etc. |
| `constants.ts` | APP_CONFIG, PRICING_PLANS, EVENT_CATEGORIES |
| `auth-server.ts` | verifyAuth() server-side auth |
| `security.ts` | Security utilities |
| `rate-limit.ts` | Rate limiting |
| `csrf.ts` | CSRF protection |

### Stores (lib/stores/)
| File | Description |
|------|-------------|
| `auth-store.ts` | Zustand auth state |
| `editor-store.ts` | Zustand editor state |
| `invitation-store.ts` | Zustand invitation state |

### Services (lib/services/)
| File | Description |
|------|-------------|
| `notification-service.ts` | Notification CRUD |
| `affiliate-service.ts` | Affiliate management |

### Email Templates (lib/email-templates/)
| File | Description |
|------|-------------|
| `affiliate-emails.ts` | Affiliate email templates |

### Data (lib/data/)
| File | Description |
|------|-------------|
| `templates.ts` | Sample templates data |

---

## Services (services/)

### AWS Services (services/aws/)
| File | Description |
|------|-------------|
| `s3.ts` | File uploads, presigned URLs |
| `dynamodb.ts` | Database operations |
| `bedrock.ts` | AI generation |
| `ses.ts` | Email sending |
| `cognito.ts` | Authentication |

### External Services
| File | Description |
|------|-------------|
| `stripe.ts` | Payment processing |

---

## Hooks (hooks/)
| File | Hook(s) |
|------|---------|
| `use-debounce.ts` | useDebounce, useDebouncedCallback |
| `use-local-storage.ts` | useLocalStorage |
| `use-click-outside.ts` | useClickOutside |
| `use-media-query.ts` | useMediaQuery, useIsMobile |
| `use-copy-to-clipboard.ts` | useCopyToClipboard |
| `use-editor-shortcuts.tsx` | useEditorShortcuts |
| `index.ts` | Barrel exports |

---

## Types (types/)
| File | Description |
|------|-------------|
| `index.ts` | All TypeScript type definitions |

---

## Configuration Files
| File | Description |
|------|-------------|
| `next.config.ts` | Next.js configuration |
| `tailwind.config.ts` | Tailwind CSS configuration |
| `tsconfig.json` | TypeScript configuration |
| `jest.config.js` | Jest testing configuration |
| `package.json` | Dependencies and scripts |
| `.env.example` | Environment variables template |
| `eslint.config.mjs` | ESLint configuration |

---

## Documentation Files
| File | Description |
|------|-------------|
| `AI_CONTEXT.md` | AI agent context (references this file) |
| `PROJECT_FILES.md` | This file - project inventory |
| `COMPLETED_FEATURES.md` | Feature completion status |
| `FILE_TEST_STATUS.md` | Testing status matrix |
| `TESTING_LOG.md` | Testing logs |
| `FEATURE_TEST_REPORT.md` | Comprehensive test report |
| `LAUNCH_PRIORITY_100.md` | 100 priority launch tasks |
| `1000-IMPROVEMENT-TASKS.md` | Code improvement backlog |
| `PROJECT_ROADMAP.md` | Product roadmap |
| `HANDOFF.md` | Project handoff notes |
| `README.md` | Project readme |
| `AFFILIATE_GROWTH_PLAN.md` | Affiliate program strategy |
| `VENDOR_OUTREACH_RESEARCH.md` | Vendor research |
| `MARKETING_LAUNCH_PLAN.md` | Marketing and launch strategy |
| `TEMPLATE_GENERATION_PROMPTS.md` | AI prompts for template generation |

---

## Scripts
| File | Description |
|------|-------------|
| `scripts/ai-test-agent.ts` | AI-powered automated testing agent |

---

## Admin Section (New)

### Admin Pages
| File | Route | Description |
|------|-------|-------------|
| `app/admin/layout.tsx` | - | Admin layout with sidebar |
| `app/admin/page.tsx` | `/admin` | Admin dashboard |
| `app/admin/contacts/page.tsx` | `/admin/contacts` | CRM contacts management |

### Admin API Routes
| File | Method | Endpoint |
|------|--------|----------|
| `app/api/admin/contacts/route.ts` | GET, POST | `/api/admin/contacts` |
| `app/api/admin/contacts/[id]/route.ts` | GET, PUT, DELETE | `/api/admin/contacts/:id` |
| `app/api/admin/contacts/[id]/outreach/route.ts` | POST | `/api/admin/contacts/:id/outreach` |

---

## Site Access Protection
| File | Route | Description |
|------|-------|-------------|
| `app/site-access/page.tsx` | `/site-access` | Password entry page |
| `app/api/site-access/route.ts` | POST | `/api/site-access` |

---

## Changelog

### 2025-12-18 (Evening Update)
- Added admin CRM system (pages, API routes)
- Added site password protection middleware
- Added AI testing agent script
- Added Marketing Launch Plan document
- Added Template Generation Prompts document
- Added site-access pages for password protection

### 2025-12-18
- Initial creation of PROJECT_FILES.md
- Documented all pages, API routes, components
- Added affiliate system files
- Added documentation file references

---

**Note for AI Agents:** When adding, removing, or moving files, update this document immediately to keep it accurate.
