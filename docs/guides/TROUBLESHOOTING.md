# Troubleshooting Guide

Common issues and their solutions.

---

## Authentication Issues

### "Invalid credentials" on login

**Cause:** User doesn't exist or wrong password.

**Solution:**
1. Check Cognito User Pool for user
2. Try password reset
3. Verify email is confirmed

### "Session expired" errors

**Cause:** JWT token has expired.

**Solution:**
1. Clear cookies and re-login
2. Check JWT_SECRET is consistent across deployments
3. Verify token expiration settings

### "CSRF token mismatch"

**Cause:** Token not included in request or expired.

**Solution:**
1. Ensure CSRF token is sent in headers
2. Check if cookies are being set correctly
3. Verify same-site cookie settings

---

## Database Issues

### "Table not found" errors

**Cause:** DynamoDB table doesn't exist.

**Solution:**
```bash
# Create tables
npx tsx scripts/create-tables.ts

# Verify tables exist
aws dynamodb list-tables
```

### "Throughput exceeded" errors

**Cause:** Read/write capacity exhausted.

**Solution:**
1. Enable auto-scaling in DynamoDB
2. Increase provisioned capacity
3. Implement caching for frequent reads

### "Validation error" on save

**Cause:** Data doesn't match schema.

**Solution:**
1. Check required fields are present
2. Verify data types match
3. Check for string length limits

---

## File Upload Issues

### "Upload failed" for images

**Cause:** S3 permissions or CORS issue.

**Solution:**
1. Check S3 bucket CORS configuration
2. Verify IAM permissions include PutObject
3. Check file size limits

### "Access denied" viewing images

**Cause:** S3 object permissions.

**Solution:**
1. Check bucket policy allows GetObject
2. Verify object ACL
3. Check presigned URL expiration

---

## Payment Issues

### Stripe webhook failures

**Cause:** Webhook secret mismatch or endpoint issue.

**Solution:**
1. Verify STRIPE_WEBHOOK_SECRET matches
2. Check webhook endpoint is accessible
3. Review Stripe webhook logs
4. Test with: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

### "Card declined" errors

**Cause:** Stripe payment processing issue.

**Solution:**
1. This is user's issue - card problem
2. Suggest trying different card
3. Check Stripe Dashboard for details

### Subscription not updating

**Cause:** Webhook not processing correctly.

**Solution:**
1. Check webhook delivery in Stripe
2. Verify webhook handler processes event type
3. Check DynamoDB user record

---

## Email Issues

### Emails not sending

**Cause:** SES configuration or sandbox mode.

**Solution:**
1. Check SES is out of sandbox mode
2. Verify sender email is verified
3. Check SES sending limits
4. Review SES bounce/complaint rates

### Emails going to spam

**Cause:** Poor sender reputation or missing auth.

**Solution:**
1. Set up SPF record
2. Configure DKIM
3. Set up DMARC
4. Use consistent sender address

---

## Performance Issues

### Slow page loads

**Cause:** Large bundle or API delays.

**Solution:**
1. Check bundle size: `npm run build`
2. Add lazy loading for heavy components
3. Implement caching
4. Use Next.js Image component

### API timeout errors

**Cause:** Long-running operations.

**Solution:**
1. Check DynamoDB query efficiency
2. Add indexes for frequent queries
3. Implement pagination
4. Use background jobs for heavy tasks

---

## Build Issues

### TypeScript errors

**Cause:** Type mismatches.

**Solution:**
```bash
# Check types
npm run type-check

# Look for 'any' types that should be defined
# Check import paths are correct
```

### "Module not found" errors

**Cause:** Missing dependency or wrong import.

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules
npm install

# Check import path aliases in tsconfig.json
```

### Build fails on Vercel

**Cause:** Environment or dependency issue.

**Solution:**
1. Check Vercel build logs
2. Verify all env vars are set
3. Check Node.js version matches
4. Try building locally first

---

## Editor Issues

### Canvas not rendering

**Cause:** Missing element data or render error.

**Solution:**
1. Check browser console for errors
2. Verify invitation data loaded
3. Check for null elements in design

### Changes not saving

**Cause:** API error or validation failure.

**Solution:**
1. Check network tab for failed requests
2. Verify user is authenticated
3. Check for validation errors in response

---

## Mobile Issues

### Layout broken on mobile

**Cause:** Missing responsive styles.

**Solution:**
1. Check Tailwind responsive classes
2. Test with device tools
3. Verify viewport meta tag

### Touch events not working

**Cause:** Event handlers not supporting touch.

**Solution:**
1. Use onClick (works for touch)
2. Add touch-specific handlers if needed
3. Check for overlapping elements

---

## Debugging Commands

```bash
# Check logs
vercel logs --follow

# Test database connection
npx tsx scripts/test-db.ts

# Test email
npx tsx scripts/test-email.ts

# Test Stripe
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Check environment
npx tsx -e "console.log(process.env.AWS_REGION)"
```

---

## Getting More Help

1. Check error message in browser console
2. Check server logs in Vercel
3. Search existing issues on GitHub
4. Check AWS/Stripe status pages
5. Open a support ticket with details
