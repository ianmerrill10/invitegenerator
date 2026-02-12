# AI Agent Context - InviteGenerator Project

This file provides context for AI agents working on this project.

## Quick Start

1. **Check work logs first**: `logs/WORK_LOG.md`
2. **Run build to verify**: `npm run build`
3. **Update logs after work**: Add entries to `logs/WORK_LOG.md`

## Project Overview

InviteGenerator is a SaaS application for creating AI-powered invitations.

### Core Features
- AI-powered invitation design generation
- Template library with customization
- RSVP management
- Digital delivery (email, SMS, WhatsApp)
- Print ordering via Prodigi
- Event websites
- Affiliate product recommendations

### Architecture

```
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── dashboard/         # Protected dashboard pages
│   └── (marketing)/       # Public marketing pages
├── components/            # React components
├── lib/                   # Utilities and services
│   ├── ai/               # AI integration (OpenAI, Bedrock)
│   ├── auth.ts           # Authentication helpers
│   ├── pricing.ts        # Pricing configuration
│   └── rate-limit.ts     # Rate limiting
├── types/                # TypeScript definitions
└── logs/                 # Work logs (update after tasks!)
```

## AWS Services Used

| Service | Purpose | Table/Bucket Name Pattern |
|---------|---------|---------------------------|
| Cognito | Authentication | User pool in env vars |
| DynamoDB | Database | `invitegenerator-*` |
| S3 | File storage | `invitegenerator-assets` |
| Bedrock | AI (Claude) | Model ID in env vars |
| SES | Email | Configured in env vars |

## Important Patterns

### Lazy Initialization for API Clients
Always use lazy initialization for external API clients to prevent build errors:

```typescript
let client: ClientType | null = null;
function getClient(): ClientType {
  if (!client) {
    client = new ClientType({ /* config */ });
  }
  return client;
}
```

### Error Response Format
```typescript
return NextResponse.json({
  success: false,
  error: { code: "ERROR_CODE", message: "Human readable message" }
}, { status: 400 });
```

### Success Response Format
```typescript
return NextResponse.json({
  success: true,
  data: { /* response data */ }
});
```

## Known Gotchas

1. **Stripe API Version**: Must match exactly. Check `package.json` for installed version.
2. **DynamoDB Table Names**: Use plural form (`DYNAMODB_RSVPS_TABLE`, not `RSVP`)
3. **Environment Variables**: Copy `.env.example` to `.env.local`
4. **Build Before Deploy**: Always run `npm run build` to catch type errors

## TODO Tracking

Major TODOs are tracked in `logs/WORK_LOG.md`. Check the "Remaining TODOs" section.

## Testing

```bash
npm run test        # Run tests
npm run lint        # Run linter
npm run type-check  # TypeScript checking
npm run build       # Full build
```
