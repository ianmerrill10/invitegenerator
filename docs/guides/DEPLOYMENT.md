# Deployment Runbook

## Pre-Deployment Checklist

- [ ] All tests passing (`npm test`)
- [ ] Type check passes (`npm run type-check`)
- [ ] Build succeeds locally (`npm run build`)
- [ ] Environment variables configured in target
- [ ] Database migrations applied (if any)
- [ ] Feature flags configured
- [ ] Monitoring alerts configured

---

## Vercel Deployment

### Automatic Deployment

Push to `main` branch triggers automatic deployment:

```bash
git push origin main
```

### Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Environment Variables

Set in Vercel Dashboard → Settings → Environment Variables:

**Production:**
- `NODE_ENV=production`
- `NEXT_PUBLIC_APP_URL=https://invitegenerator.com`
- All AWS credentials
- Stripe live keys
- Production database tables

**Preview:**
- `NODE_ENV=development`
- `NEXT_PUBLIC_APP_URL` = preview URL
- Test Stripe keys
- Development database tables

---

## Rollback Procedure

### Via Vercel Dashboard

1. Go to Deployments
2. Find last working deployment
3. Click "..." → "Promote to Production"

### Via CLI

```bash
vercel rollback
```

---

## Database Operations

### Before Deployment

If schema changes needed:

```bash
# Run migration script
npx tsx scripts/migrate.ts

# Verify tables
aws dynamodb list-tables
```

### Creating Tables

```bash
npx tsx scripts/create-tables.ts
npx tsx scripts/create-affiliate-tables.ts
```

---

## Health Checks

After deployment, verify:

1. **Homepage loads:** https://invitegenerator.com
2. **Login works:** https://invitegenerator.com/auth/login
3. **API responds:** https://invitegenerator.com/api/health
4. **Dashboard accessible:** https://invitegenerator.com/dashboard

---

## Monitoring

### Vercel Analytics

- Check Functions tab for errors
- Monitor Edge function performance
- Review Web Vitals

### AWS CloudWatch

- DynamoDB: Read/Write capacity
- S3: Request counts
- SES: Bounce rates
- Cognito: Auth failures

### Stripe Dashboard

- Check webhook delivery
- Monitor payment success rate
- Review disputes

---

## Emergency Contacts

- **Vercel Support:** support@vercel.com
- **AWS Support:** Via AWS Console
- **Stripe Support:** support@stripe.com

---

## Post-Deployment

1. [ ] Verify health checks pass
2. [ ] Test critical user flows
3. [ ] Check error monitoring
4. [ ] Notify team of deployment
5. [ ] Update changelog
