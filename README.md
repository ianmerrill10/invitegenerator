# InviteGenerator.com

AI-Powered Invitation Generator - Create stunning invitations for any event in seconds.

## 🚀 Features

- **AI-Powered Design**: Generate unique invitation designs using Claude AI
- **100+ Templates**: Professional templates for weddings, birthdays, corporate events, and more
- **RSVP Tracking**: Real-time guest response management
- **Easy Sharing**: Share via email, link, or social media
- **Customization**: Full design editor with drag-and-drop functionality
- **Analytics**: Track views and engagement

## 📋 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, AWS Lambda
- **Database**: AWS DynamoDB
- **Authentication**: AWS Cognito
- **AI**: AWS Bedrock (Claude)
- **Storage**: AWS S3
- **Email**: AWS SES
- **Payments**: Stripe

## 🛠️ Getting Started

### Prerequisites

- Node.js 20+
- AWS Account
- Stripe Account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/invitegenerator.git
cd invitegenerator
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
invitegenerator-app/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── invitations/   # Invitation CRUD
│   │   ├── ai/            # AI generation
│   │   └── rsvp/          # RSVP management
│   ├── auth/              # Auth pages (login, signup)
│   ├── dashboard/         # Dashboard pages
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── landing/          # Landing page components
│   ├── dashboard/        # Dashboard components
│   └── editor/           # Invitation editor
├── lib/                  # Utilities and configuration
│   ├── stores/           # Zustand stores
│   ├── utils.ts          # Helper functions
│   └── constants.ts      # App constants
├── types/                # TypeScript types
├── styles/               # Global styles
└── public/               # Static assets
```

## 🔧 AWS Setup

### DynamoDB Tables

Create the following tables:

1. **invitegenerator-users**
   - Partition key: `id` (String)

2. **invitegenerator-invitations**
   - Partition key: `id` (String)
   - GSI: `userId-index` on `userId`

3. **invitegenerator-rsvp**
   - Partition key: `invitationId` (String)
   - Sort key: `id` (String)

4. **invitegenerator-templates**
   - Partition key: `id` (String)
   - GSI: `category-index` on `category`

### Cognito User Pool

1. Create a User Pool with email sign-in
2. Enable hosted UI (optional)
3. Configure app client with USER_PASSWORD_AUTH flow

### S3 Bucket

1. Create bucket: `invitegenerator-assets`
2. Enable CORS for your domain
3. Configure public read for invitation images

### Bedrock

1. Enable Claude model access in AWS Bedrock
2. Ensure IAM permissions for `bedrock:InvokeModel`

## 💳 Stripe Setup

1. Create products and prices for each plan
2. Set up webhook endpoint: `/api/webhooks/stripe`
3. Configure webhook events: `checkout.session.completed`, `customer.subscription.*`

## 🚀 Deployment

### IONOS Deployment

1. Build the application:
```bash
npm run build
```

2. The `standalone` output is in `.next/standalone`

3. Upload to IONOS hosting:
   - Upload all files from `.next/standalone`
   - Upload `.next/static` to `.next/standalone/.next/static`
   - Upload `public` folder to `.next/standalone/public`

4. Start the server:
```bash
node server.js
```

### Environment Variables

Set all environment variables from `.env.example` in your hosting provider.

## 📊 Budget Breakdown ($100/month)

| Service | Monthly Cost |
|---------|-------------|
| IONOS Hosting | $12.00 |
| AWS Lambda (Free Tier) | $0.00 |
| AWS DynamoDB (Free Tier) | $0.00 |
| AWS S3 (Free Tier) | $0.00 |
| AWS Bedrock (AI) | $40.00 |
| AWS SES | $5.00 |
| AWS Cognito (Free Tier) | $0.00 |
| CloudFlare CDN (Free) | $0.00 |
| Stripe Fees | Variable |
| Buffer | $43.00 |
| **Total** | **~$57.00** |

## 📈 Pricing Tiers

| Plan | Price | Features |
|------|-------|----------|
| Free | $0 | 3 invitations/month, 5 AI credits |
| Starter | $9/mo | 10 invitations, 25 AI credits, premium templates |
| Pro | $24/mo | Unlimited invitations, 100 AI credits, custom branding |
| Business | $79/mo | Everything + API access, white-label, priority support |

## 🔐 Security Features

- HTTPS everywhere (enforced)
- HTTP-only cookies for tokens
- CSRF protection
- Rate limiting
- Input validation with Zod
- Content Security Policy
- AWS WAF integration ready

## 📝 License

MIT License - see LICENSE file

## 🤝 Support

- Email: support@invitegenerator.com
- Documentation: https://docs.invitegenerator.com
- Help Center: https://help.invitegenerator.com

---

Built with ❤️ for celebrating life's moments
