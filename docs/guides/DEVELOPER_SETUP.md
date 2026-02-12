# Developer Setup Guide

This guide will help you set up the InviteGenerator development environment.

---

## Prerequisites

- **Node.js:** v18.17 or higher
- **npm:** v9 or higher
- **Git:** Latest version
- **AWS Account:** For DynamoDB, S3, Cognito, SES, Bedrock
- **Stripe Account:** For payment processing
- **VS Code:** Recommended editor

---

## Quick Start

```bash
# Clone the repository
git clone https://github.com/your-org/invitegenerator.git
cd invitegenerator/invitegenerator-app

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Configure environment variables (see below)
# Then start development server
npm run dev
```

---

## Environment Variables

Create a `.env.local` file with the following variables:

### Required Variables

```bash
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# AWS Credentials
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# AWS Cognito
COGNITO_USER_POOL_ID=us-east-1_xxxxxx
COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxx
COGNITO_CLIENT_SECRET=xxxxxxxxxxxxxxxxx

# AWS DynamoDB
DYNAMODB_USERS_TABLE=invitegenerator-users-dev
DYNAMODB_INVITATIONS_TABLE=invitegenerator-invitations-dev
DYNAMODB_RSVP_TABLE=invitegenerator-rsvp-dev
DYNAMODB_TEMPLATES_TABLE=invitegenerator-templates-dev

# AWS S3
AWS_S3_BUCKET=invitegenerator-assets-dev

# AWS SES
SES_FROM_EMAIL=noreply@yourdomain.com
SES_REGION=us-east-1

# Stripe
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_PRO_MONTHLY_PRICE_ID=price_xxxxx
STRIPE_PRO_ANNUAL_PRICE_ID=price_xxxxx

# JWT
JWT_SECRET=your-256-bit-secret
```

### Optional Variables

```bash
# AWS Bedrock (for AI features)
BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0

# Prodigi (for print-on-demand)
PRODIGI_API_KEY=your-prodigi-key
PRODIGI_API_URL=https://api.sandbox.prodigi.com/v4.0

# Development
DEV_PASSWORD=optional-dev-password
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

---

## AWS Setup

### DynamoDB Tables

Run the table creation script:

```bash
npx tsx scripts/create-tables.ts
```

Or create manually in AWS Console with these schemas:

**Users Table:**
- Primary Key: `id` (String)
- GSI: `email-index` on `email`

**Invitations Table:**
- Primary Key: `id` (String)
- GSI: `userId-index` on `userId`
- GSI: `shortId-index` on `shortId`

**RSVP Table:**
- Primary Key: `id` (String)
- Sort Key: `invitationId` (String)

### S3 Bucket

1. Create bucket with name matching `AWS_S3_BUCKET`
2. Enable CORS:
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
    "ExposeHeaders": ["ETag"]
  }
]
```

### Cognito User Pool

1. Create User Pool with email sign-in
2. Add app client (with secret)
3. Configure hosted UI if using OAuth
4. Note the Pool ID and Client credentials

---

## Stripe Setup

### Local Testing

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### Create Products

1. Create "Pro" product in Stripe Dashboard
2. Add monthly and annual prices
3. Note the price IDs for env vars

---

## Development Commands

```bash
# Start development server
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm test -- --watch

# Type check
npm run type-check

# Lint
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

---

## Project Structure

```
invitegenerator-app/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── auth/              # Auth pages (login, signup)
│   ├── dashboard/         # Dashboard pages
│   └── i/                 # Public invitation pages
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── editor/           # Invitation editor
│   ├── dashboard/        # Dashboard-specific
│   └── public/           # Public page components
├── lib/                   # Utilities and services
│   ├── services/         # Business logic services
│   ├── stores/           # Zustand state stores
│   └── utils.ts          # Utility functions
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript type definitions
├── styles/               # Global styles
├── public/               # Static assets
├── __tests__/            # Test files
├── scripts/              # Utility scripts
└── docs/                 # Documentation
```

---

## Coding Standards

### TypeScript

- Use strict mode
- Define types for all function parameters
- Avoid `any` type
- Use interfaces for object shapes

### React

- Use functional components with hooks
- Follow component naming: `ComponentName.tsx`
- Keep components focused and small
- Use Zustand for global state

### Styling

- Use Tailwind CSS classes
- Follow design system colors/spacing
- Mobile-first responsive design
- Use CSS variables for theming

### API Routes

- Return consistent JSON format
- Include proper error handling
- Add input validation
- Use rate limiting on public endpoints

---

## Testing

### Unit Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- --testPathPattern=utils

# Run with coverage
npm test -- --coverage
```

### Test Structure

```typescript
describe("FunctionName", () => {
  it("should do something", () => {
    expect(result).toBe(expected);
  });
});
```

---

## Debugging

### VS Code Launch Config

Add to `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev"
    },
    {
      "name": "Next.js: debug client",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    }
  ]
}
```

### Common Issues

**DynamoDB Connection Issues:**
- Check AWS credentials
- Verify table names match env vars
- Check region configuration

**Stripe Webhook Failures:**
- Run `stripe listen` in terminal
- Check webhook secret matches
- Verify event types are handled

**Image Upload Failures:**
- Check S3 bucket CORS
- Verify bucket permissions
- Check file size limits

---

## Deployment

### Vercel (Recommended)

1. Connect GitHub repository
2. Configure environment variables
3. Deploy automatically on push

### Manual

```bash
npm run build
npm start
```

---

## Getting Help

- Check existing documentation in `/docs`
- Review `AI_CONTEXT.md` for codebase overview
- Check `OPERATIONS_MANUAL.md` for procedures
- Open an issue on GitHub
