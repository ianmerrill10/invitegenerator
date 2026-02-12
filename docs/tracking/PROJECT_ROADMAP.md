# Project Roadmap: The Next 100 Tasks

This document outlines the prioritized roadmap for completing the InviteGenerator project, broken down into 10 key categories.

## 1. Core Editor Implementation (Critical)
*The missing heart of the application. These tasks must be done first.*
1.  [ ] Scaffold `app/dashboard/invitations/[id]/edit/page.tsx` (The main editor page).
2.  [ ] Initialize `useEditorStore` with invitation data on page load.
3.  [ ] Implement the main Canvas area to render `DesignElement` array.
4.  [ ] Integrate `EditorToolbar` component into the layout.
5.  [ ] Integrate `ElementLibrary` sidebar for dragging in assets.
6.  [ ] Integrate `LayersPanel` for managing element order.
7.  [ ] Implement "Add Text" functionality (add text element to store).
8.  [ ] Implement "Add Image" functionality (upload & add to store).
9.  [ ] Implement "Add Shape" functionality (rectangles, circles).
10. [ ] Implement basic element selection and dragging logic on Canvas.

## 2. Editor Features & Enhancements
*Making the editor functional and user-friendly.*
11. [ ] Implement element resizing handles (corners/edges).
12. [ ] Implement element rotation logic.
13. [ ] Implement Z-index management (Bring to Front / Send to Back).
14. [ ] Connect Undo/Redo buttons to `useEditorStore` history.
15. [ ] Implement "Save Design" button (PUT to `/api/invitations/[id]`).
16. [ ] Add auto-save functionality (debounce save requests).
17. [ ] Implement keyboard shortcuts (Delete, Ctrl+Z, Ctrl+C, Ctrl+V).
18. [ ] Add alignment tools (Snap to grid, Smart guides).
19. [ ] Implement Group/Ungroup functionality for multiple elements.
20. [ ] Add "Preview Mode" to see how it looks for guests.

## 3. AI Integration
*Delivering on the "AI-Powered" promise.*
21. [ ] Verify and implement `api/ai/generate/route.ts` (Text-to-Design logic).
22. [ ] Create UI for AI prompt input in the "Create" wizard.
23. [ ] Implement `api/ai/remove-background/route.ts` using an external API.
24. [ ] Integrate Background Removal tool into the Editor UI.
25. [ ] Implement AI Text Assistant (rewriting invitation copy).
26. [ ] Implement AI Image Generation (DALL-E/Titan) for custom stickers.
27. [ ] Add "Magic Resize" to auto-adjust layout for mobile/desktop.
28. [ ] Implement AI-suggested color palettes based on uploaded images.
29. [ ] Add rate limiting specifically for expensive AI endpoints.
30. [ ] Implement caching for AI generated results to reduce costs.

## 4. Backend & Infrastructure
*Security, performance, and reliability.*
31. [ ] Audit all API routes to ensure `verifyAuth` is strictly typed.
32. [ ] Implement Zod schema validation for all API request bodies.
33. [ ] Enable Point-in-Time Recovery (PITR) for DynamoDB tables.
34. [ ] Optimize DynamoDB indexes (GSI) for query performance.
35. [ ] Configure S3 Lifecycle Policies to clean up temporary uploads.
36. [ ] Add structured server-side logging (CloudWatch integration).
37. [ ] Implement API Rate Limiting middleware.
38. [ ] Configure secure HTTP headers (CSP, HSTS) in `next.config.js`.
39. [ ] Review AWS IAM roles for least-privilege access.
40. [ ] Set up error tracking (Sentry or similar).

## 5. User Dashboard & Management
*Managing the user lifecycle.*
41. [ ] Implement User Profile page (`/dashboard/settings`).
42. [ ] Allow users to update name and email address.
43. [ ] Implement Password Reset flow (Cognito integration).
44. [ ] Add "My Designs" gallery with search and filter options.
45. [ ] Implement "Duplicate Invitation" feature.
46. [ ] Add "Archive" and "Delete" functionality for invitations.
47. [ ] Create a "Saved Templates" section for user's custom templates.
48. [ ] Implement Subscription/Billing page (Stripe placeholder).
49. [ ] Enforce usage quotas (e.g., max 5 active invites for free tier).
50. [ ] Add email notification preferences settings.

## 6. Public View & RSVP Experience
*The guest-facing experience.*
51. [ ] Add dynamic Open Graph meta tags for social sharing previews.
52. [ ] Optimize public view for mobile devices (responsive design).
53. [ ] Add "Add to Calendar" buttons (Google, Outlook, iCal).
54. [ ] Implement "Map View" for event location (Google Maps embed).
55. [ ] Add "Opening Envelope" animation effect.
56. [ ] Allow guests to edit their RSVP after submission (via email link).
57. [ ] Implement "Contact Host" form for guests.
58. [ ] Add ARIA labels and accessibility features to public view.
59. [ ] Optimize image loading with blur placeholders.
60. [ ] Generate QR codes for public invitation links.

## 7. Testing & Quality Assurance
*Ensuring stability.*
61. [ ] Set up Jest and React Testing Library.
62. [ ] Write unit tests for `lib/utils.ts` helper functions.
63. [ ] Write unit tests for `useEditorStore` logic.
64. [ ] Write component tests for `EditorToolbar`.
65. [ ] Set up Playwright or Cypress for E2E testing.
66. [ ] Write E2E test: User Signup & Login flow.
67. [ ] Write E2E test: Create Invitation flow.
68. [ ] Write E2E test: RSVP Submission flow.
69. [ ] Perform Accessibility Audit (Lighthouse/Axe).
70. [ ] Cross-browser testing (Safari, Firefox, Chrome).

## 8. UI/UX Polish
*Look and feel improvements.*
71. [ ] Standardize button styles and variants across the app.
72. [ ] Replace loading spinners with Skeleton loaders.
73. [ ] Add Toast notifications for all success/error actions.
74. [ ] Implement Dark Mode support.
75. [ ] Polish transitions in the "Create Wizard".
76. [ ] Add tooltips to all Editor icons/buttons.
77. [ ] Improve empty states (e.g., "No invitations yet").
78. [ ] Fix Layout Shifts (CLS) on dashboard loading.
79. [ ] Design custom 404 and 500 error pages.
80. [ ] Add Favicon and App Icons.

## 9. DevOps & Deployment
*Getting it to production.*
81. [ ] Create `Dockerfile` for containerized deployment.
82. [ ] Set up GitHub Actions for CI (Lint & Test).
83. [ ] Set up GitHub Actions for CD (Deploy to AWS/Vercel).
84. [ ] Configure environment variables for Staging vs Production.
85. [ ] Set up custom domain (Route53).
86. [ ] Configure CloudFront CDN for static assets.
87. [ ] Create database migration scripts (if needed).
88. [ ] Set up monitoring dashboard (CloudWatch/Datadog).
89. [ ] Create a "Maintenance Mode" switch.
90. [ ] Document deployment process.

## 10. Documentation & Maintenance
*Future-proofing the project.*
91. [ ] Update `README.md` with full local setup instructions.
92. [ ] Create `CONTRIBUTING.md` for future developers.
93. [ ] Document the DynamoDB schema design.
94. [ ] Document API endpoints (OpenAPI/Swagger).
95. [ ] Add JSDoc comments to complex functions.
96. [ ] Clean up unused code and imports.
97. [ ] Audit and update npm dependencies.
98. [ ] Refactor large components into smaller chunks.
99. [ ] Create a "Known Issues" list.
100. [ ] Update `AI_CONTEXT.md` with completed tasks.
