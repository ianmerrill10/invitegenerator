# InviteGenerator Documentation

Welcome to the InviteGenerator documentation. This index provides links to all available documentation.

---

## 📚 Quick Links

| Document | Description |
|----------|-------------|
| [README](../README.md) | Project overview and quick start |
| [ARCHITECTURE](../ARCHITECTURE.md) | System architecture and design |
| [SETUP-GUIDE](../SETUP-GUIDE.md) | Detailed setup instructions |
| [HANDOFF](../HANDOFF.md) | Developer handoff notes |

---

## 🚀 Deployment

| Document | Description |
|----------|-------------|
| [Amplify Deployment Checklist](./AMPLIFY-DEPLOYMENT-CHECKLIST.md) | Step-by-step Amplify deployment |
| [Environment Variables](./ENVIRONMENT-VARIABLES.md) | All environment variables reference |
| [Production Readiness](./PRODUCTION-READINESS-CHECKLIST.md) | Pre-launch verification |

---

## 🔧 Integrations

| Document | Description |
|----------|-------------|
| [Prodigi Integration Guide](./PRODIGI-INTEGRATION-GUIDE.md) | Print-on-demand setup |

---

## 📱 Marketing

| Document | Description |
|----------|-------------|
| [TikTok Content Plan](./TIKTOK-CONTENT-PLAN.md) | Social media content strategy |

---

## 🛠️ Development

### Key Files

| Path | Purpose |
|------|---------|
| `/app` | Next.js App Router pages and API routes |
| `/components` | Reusable React components |
| `/lib` | Utilities, stores, and shared logic |
| `/services` | AWS service integrations |
| `/tests` | Unit and integration tests |

### Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Production build
npm run test         # Run tests
npm run type-check   # TypeScript check
npm run lint         # ESLint check
npm run smoke        # Full validation (type + test + build)
```

### Environment Setup

1. Copy `.env.example` to `.env.local`
2. Fill in AWS credentials
3. Set up Cognito, DynamoDB, S3
4. Configure Stripe for payments

---

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│   Next.js 14 (App Router) + React 18 + Tailwind CSS         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Layer                               │
│            Next.js API Routes (Serverless)                   │
└─────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  AWS Cognito    │ │  AWS DynamoDB   │ │   AWS S3        │
│  (Auth)         │ │  (Database)     │ │   (Storage)     │
└─────────────────┘ └─────────────────┘ └─────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  AWS Bedrock    │ │   AWS SES       │ │   Stripe        │
│  (AI)           │ │   (Email)       │ │   (Payments)    │
└─────────────────┘ └─────────────────┘ └─────────────────┘
                                                  │
                                                  ▼
                                        ┌─────────────────┐
                                        │    Prodigi      │
                                        │  (Printing)     │
                                        └─────────────────┘
```

---

## 🔐 Security

- JWT verification using Cognito JWKS
- Rate limiting on all auth endpoints
- Admin routes protected with API key
- Stripe webhook signature verification
- HttpOnly secure cookies for tokens

---

## 📞 Support

For questions or issues:
- Check [KNOWN_ISSUES](../logs/KNOWN_ISSUES.md)
- Review [WORK_LOG](../logs/WORK_LOG.md)
- Create a GitHub issue

---

*Documentation last updated: December 2024*
