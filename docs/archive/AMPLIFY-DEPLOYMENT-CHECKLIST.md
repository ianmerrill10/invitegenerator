# AWS Amplify Deployment Checklist

## Pre-Deployment Requirements

### 1. ✅ Code Quality Checks
- [ ] TypeScript compiles without errors: `npm run type-check`
- [ ] All tests pass: `npm test`
- [ ] Production build succeeds: `npm run build`
- [ ] No console.log statements in production code
- [ ] All environment variables documented

### 2. ✅ AWS Resources Ready
- [ ] AWS Account with appropriate permissions
- [ ] Cognito User Pool created and configured
- [ ] DynamoDB tables created (see CloudFormation template)
- [ ] S3 bucket for uploads created
- [ ] SES configured and out of sandbox (for production email)
- [ ] Bedrock access enabled in your region

---

## Environment Variables Setup

### Required Variables (Add in Amplify Console → Environment Variables)

```bash
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key

# Cognito
COGNITO_USER_POOL_ID=us-east-1_xxxxxxxx
COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
COGNITO_CLIENT_SECRET=your_client_secret
NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_xxxxxxxx
NEXT_PUBLIC_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx

# DynamoDB Tables
DYNAMODB_USERS_TABLE=invitegenerator-users
DYNAMODB_INVITATIONS_TABLE=invitegenerator-invitations
DYNAMODB_RSVPS_TABLE=invitegenerator-rsvps
DYNAMODB_TEMPLATES_TABLE=invitegenerator-templates
DYNAMODB_BLOG_TABLE=invitegenerator-blog
DYNAMODB_CONSENT_TABLE=invitegenerator-consent

# S3
S3_BUCKET_NAME=invitegenerator-uploads
NEXT_PUBLIC_S3_BUCKET_NAME=invitegenerator-uploads

# Stripe
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxx

# Email (SES)
SES_FROM_EMAIL=noreply@invitegenerator.com
NEXT_PUBLIC_SITE_URL=https://invitegenerator.com

# Admin
ADMIN_API_KEY=generate_a_secure_random_key

# Optional: Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

---

## Step-by-Step Deployment

### Step 1: Connect Repository
1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify)
2. Click "New app" → "Host web app"
3. Select "GitHub" and authorize
4. Choose repository: `invitegeneratordevelopment`
5. Select branch: `main`

### Step 2: Configure Build Settings
The `amplify.yml` is already configured. Verify it includes:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*
```

### Step 3: Add Environment Variables
1. In Amplify Console → App settings → Environment variables
2. Add all variables from the list above
3. Mark sensitive values appropriately

### Step 4: Configure Compute Settings
1. Go to App settings → General
2. Framework: Next.js - SSR
3. Build image: Amazon Linux:2023
4. Set build timeout: 30 minutes (for large npm installs)

### Step 5: Set Up Custom Domain
1. Go to Domain management
2. Add domain: invitegenerator.com
3. Configure DNS (follow Amplify instructions)
4. Wait for SSL certificate provisioning

### Step 6: Deploy
1. Click "Deploy" or push to main branch
2. Monitor build logs for errors
3. Verify deployment at provided URL

---

## Post-Deployment Verification

### Smoke Tests
- [ ] Homepage loads correctly
- [ ] Login/Signup works
- [ ] Can create a new invitation
- [ ] Can view templates gallery
- [ ] RSVP page loads for public invitations
- [ ] Payment flow works (test mode first)

### API Tests
```bash
# Health check
curl https://invitegenerator.com/api/health

# Public API
curl https://invitegenerator.com/api/templates
```

### Performance
- [ ] Lighthouse score > 80
- [ ] First Contentful Paint < 2s
- [ ] Core Web Vitals passing

---

## Troubleshooting Common Issues

### Build Fails on npm ci
- Check Node.js version matches (18.x)
- Clear cache: Build settings → General → Clear cache

### Environment Variables Not Loading
- Ensure no spaces around `=` in variable values
- Rebuild after adding new variables
- Check variable names match exactly

### 502/504 Errors
- Check Lambda function logs in CloudWatch
- Verify DynamoDB table permissions
- Check function timeout settings

### Images Not Loading
- Verify S3 bucket CORS configuration
- Check S3 bucket policy allows public read

---

## Monitoring Setup

### CloudWatch Alarms
- [ ] Set up error rate alarm (> 5% 5xx errors)
- [ ] Set up latency alarm (p99 > 3s)
- [ ] Configure SNS notifications

### Logging
- Amplify provides built-in access logs
- Application logs available in CloudWatch
- Set up log retention policy (30 days recommended)

---

## Rollback Procedure

### Quick Rollback
1. Go to Amplify Console → Deployments
2. Find last successful deployment
3. Click "Redeploy this version"

### Code Rollback
```bash
git revert HEAD
git push origin main
```

---

## Security Checklist

- [ ] All API routes use proper authentication
- [ ] JWT tokens verified with Cognito JWKS
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Admin routes protected
- [ ] Stripe webhook signature verified
- [ ] No secrets in client-side code

---

## Cost Estimation

| Service | Estimated Monthly Cost |
|---------|----------------------|
| Amplify Hosting | $5-20 |
| DynamoDB | $5-25 (pay per request) |
| S3 | $1-5 |
| Cognito | Free tier (50k MAU) |
| SES | $0.10/1000 emails |
| Bedrock (AI) | Usage-based |

**Total Estimated:** $15-60/month for moderate traffic

---

## Maintenance Schedule

### Weekly
- Review error logs
- Check uptime metrics
- Monitor costs

### Monthly
- Update dependencies
- Review security advisories
- Analyze usage patterns

### Quarterly
- Performance audit
- Cost optimization review
- Backup verification

---

*Checklist Version: 1.0 | Last Updated: December 2024*
