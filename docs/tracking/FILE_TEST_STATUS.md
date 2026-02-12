# File Test Status

This file is a living “matrix” of files tested, when they were last checked, and what issues remain.

Legend:
- Status: ✅ OK | ⚠️ Needs follow-up | ❌ Broken
- Last Tested: date of last review/check

---

## Core (sampled)

| File | Status | Last Tested | Notes |
|---|---:|---:|---|
| [components/rsvp/guest-list.tsx](components/rsvp/guest-list.tsx) | ⚠️ | 2025-12-12 | Accessibility: icon-only buttons missing accessible label/title (from Problems panel). |
| [app/i/[shortId]/rsvp/page.tsx](app/i/%5BshortId%5D/rsvp/page.tsx) | ⚠️ | 2025-12-12 | Accessibility: `<select>` missing accessible name (from Problems panel). |
| [components/editor/element-library.tsx](components/editor/element-library.tsx) | ⚠️ | 2025-12-12 | Workspace rule flags inline style usage (from Problems panel). |
| [components/editor/canvas-element.tsx](components/editor/canvas-element.tsx) | ⚠️ | 2025-12-12 | Workspace rule flags inline style usage (dynamic positioning may require inline styles). |
| [app/i/[shortId]/page.tsx](app/i/%5BshortId%5D/page.tsx) | ⚠️ | 2025-12-12 | Workspace rule flags inline style usage (from Problems panel). |
| [components/notifications/notification-center.tsx](components/notifications/notification-center.tsx) | ✅ | 2025-12-12 | Notification dropdown UI present. |
| [components/notifications/notification-item.tsx](components/notifications/notification-item.tsx) | ✅ | 2025-12-12 | Notification item UI + types present. |
| [components/notifications/notification-toast.tsx](components/notifications/notification-toast.tsx) | ✅ | 2025-12-12 | Sonner toaster wrapper present. |
| [app/api/notifications/route.ts](app/api/notifications/route.ts) | ✅ | 2025-12-12 | GET/POST endpoints created (mark read / mark all read). |
| [lib/services/notification-service.ts](lib/services/notification-service.ts) | ⚠️ | 2025-12-12 | Uses DynamoDB table/index assumptions; needs deployment env + table/index confirmation. |
| [lib/utils.ts](lib/utils.ts) | ✅ | 2025-12-12 | Fixed timezone-stable `formatDate()` and `truncate()` behavior; Jest green. |
| [jest.config.js](jest.config.js) | ✅ | 2025-12-12 | Ignoring `.next/` to avoid haste-map collisions; Jest green. |

---

## Next batch (to be sampled)
We will continue sampling 10 random files per batch and updating this table.
