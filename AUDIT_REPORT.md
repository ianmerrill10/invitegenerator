# InviteGenerator Code Audit Report

**Date:** December 9, 2025
**Commit:** 8cf41b4
**Branch:** claude/audit-latest-code-01E8e4FXdMyECD1sPjjq8wjR

---

## Executive Summary

This audit covers the InviteGenerator codebase - an AI-powered invitation creation SaaS application built with Next.js 14, AWS services (Cognito, DynamoDB, S3, Bedrock, SES), and Stripe for payments.

**Overall Assessment:** The codebase demonstrates good architectural patterns and has several security measures in place, but contains **critical security vulnerabilities** that require immediate attention before production deployment.

---

## Critical Security Issues

### 1. JWT Tokens Not Verified (CRITICAL - P0)

**Location:** Multiple API routes using `getUserFromToken()` function
**Files affected:**
- `app/api/invitations/route.ts:20-38`
- `app/api/invitations/[id]/route.ts:20-37`
- `app/api/rsvp/[invitationId]/route.ts:34-50`
- `app/api/ai/generate/route.ts:23-33`
- `app/api/user/profile/route.ts:20-34`

**Issue:** The `getUserFromToken()` function uses `jwt.decode()` instead of `jwt.verify()`:

```typescript
const decoded = jwt.decode(token!) as { sub?: string };
return decoded?.sub || null;
```

**Risk:** `jwt.decode()` only parses the token without verifying the signature. An attacker can forge any token by base64-encoding a custom payload. This completely bypasses authentication.

**Recommendation:** Use `jwt.verify()` with Cognito's public keys (JWKS) or use Cognito's built-in token verification. Example fix:

```typescript
import jwksClient from 'jwks-rsa';
// Verify with Cognito's JWKS endpoint
const client = jwksClient({
  jwksUri: `https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`
});
const decoded = jwt.verify(token, getKey, { algorithms: ['RS256'] });
```

---

### 2. Social Login User ID Cookie Manipulation (HIGH - P1)

**Location:** `app/api/user/profile/route.ts:24-27`

**Issue:**
```typescript
// Try user_id cookie (from social login)
const userId = cookieStore.get("user_id")?.value;
return userId || null;
```

The code reads a `user_id` cookie directly as a fallback for authentication. This cookie could be set by a malicious user to impersonate any user.

**Recommendation:** Remove this fallback or ensure the `user_id` cookie is cryptographically signed and verified.

---

### 3. Admin Endpoint Open in Development (MEDIUM - P2)

**Location:** `app/api/admin/templates/generate/route.ts:227-229`

**Issue:**
```typescript
const adminKey = request.headers.get("x-admin-key");
if (adminKey !== process.env.ADMIN_API_KEY && process.env.NODE_ENV === "production") {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

Admin endpoints are completely open when `NODE_ENV !== "production"`. If deployed with wrong environment settings, this endpoint allows unauthorized template generation and database writes.

**Recommendation:** Always require authentication regardless of environment:
```typescript
if (adminKey !== process.env.ADMIN_API_KEY) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

---

## High Priority Issues

### 4. Stripe Webhook Handler - findUserByStripeCustomer Returns Null

**Location:** `app/api/webhooks/stripe/route.ts:315-320`

**Issue:**
```typescript
async function findUserByStripeCustomer(customerId: string): Promise<string | null> {
  // This is a placeholder - in production, use a GSI query
  console.log("Looking up user for Stripe customer:", customerId);
  return null;
}
```

This function always returns `null`, causing all Stripe webhook events (subscription updates, cancellations, invoice payments) to fail silently after initial checkout.

**Impact:** Users won't have their subscriptions updated, credits won't be refreshed, and payment failures won't be processed.

**Recommendation:** Implement GSI query on `stripeCustomerId`:
```typescript
const result = await docClient.send(new QueryCommand({
  TableName: process.env.DYNAMODB_USERS_TABLE,
  IndexName: "stripeCustomerId-index",
  KeyConditionExpression: "stripeCustomerId = :cid",
  ExpressionAttributeValues: { ":cid": customerId },
}));
return result.Items?.[0]?.id || null;
```

---

### 5. No Rate Limiting Implementation

**Location:** Various API endpoints

**Issue:** While IP addresses are captured for RSVPs (`app/api/rsvp/[invitationId]/route.ts:222`), there's no actual rate limiting logic implemented.

**Risk:**
- Brute force attacks on login endpoint
- RSVP spam
- AI generation credit exhaustion attempts
- Denial of service via expensive operations

**Recommendation:** Implement rate limiting using:
- Upstash Redis rate limiter
- Vercel's Edge Rate Limiting
- Or middleware-based solution with token bucket algorithm

---

### 6. CSP Allows unsafe-inline and unsafe-eval

**Location:** `next.config.js:59-62`

**Issue:**
```javascript
"script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com",
```

**Risk:** Weakens XSS protection. `unsafe-inline` allows inline scripts, `unsafe-eval` allows `eval()`.

**Recommendation:**
- Replace `unsafe-inline` with nonces for legitimate inline scripts
- Remove `unsafe-eval` if possible (may require build configuration changes)

---

## Medium Priority Issues

### 7. Duplicated Authentication Logic

**Issue:** The `getUserFromToken()` function is duplicated across 9+ files with slight variations.

**Files:**
- `app/api/invitations/route.ts`
- `app/api/invitations/[id]/route.ts`
- `app/api/rsvp/[invitationId]/route.ts`
- `app/api/ai/generate/route.ts`
- `app/api/user/profile/route.ts`
- And more...

**Recommendation:** Extract to a shared utility file:
```typescript
// lib/auth.ts
export async function getAuthenticatedUser(): Promise<string | null> {
  // Centralized, verified authentication logic
}
```

---

### 8. Email Whitelist Hard-coded

**Location:** `lib/auth-config.ts:10-14`

**Issue:**
```typescript
ALLOWED_EMAILS: [
  "ianmerrill10@gmail.com",
],
```

Only one email is whitelisted, and it's hardcoded. This is fine for beta testing but needs to be addressed for launch.

**Recommendation:**
- Move to environment variable or database configuration
- Implement invitation-based or waitlist system
- Remove when ready for public launch

---

### 9. Missing Email Notification on Payment Failure

**Location:** `app/api/webhooks/stripe/route.ts:308`

**Issue:**
```typescript
// TODO: Send email notification about failed payment
```

Users aren't notified when their payment fails, which could lead to unexpected service interruption.

---

### 10. Potential IDOR in RSVP Exports

**Location:** `app/api/rsvp/[invitationId]/export/route.ts` (if exists)

**Note:** The export endpoint should verify invitation ownership before allowing CSV/XLSX exports of RSVP data.

---

## Code Quality Issues

### 11. Environment Variable Fallbacks

**Issue:** Many AWS configuration defaults to `us-east-1`:
```typescript
region: process.env.AWS_REGION || "us-east-1",
```

While reasonable, failing explicitly would catch misconfiguration earlier.

---

### 12. Error Logging Exposes Stack Traces

**Issue:** `console.error()` calls may expose sensitive information in production logs:
```typescript
console.error("Cognito auth error:", {
  name: authError.name,
  message: authError.message,
  code: authError.$metadata?.httpStatusCode,
  hasClientSecret: !!clientSecret,
});
```

**Recommendation:** Use structured logging with log levels and ensure sensitive data is not logged.

---

## What's Working Well

### Security Positives:
1. **HTTP-only cookies** for token storage with `secure` flag in production
2. **Stripe webhook signature verification** properly implemented
3. **CORS and security headers** configured in `next.config.js`
4. **Input validation** with length limits and email regex
5. **XSS sanitization** in RSVP submissions
6. **Ownership verification** before CRUD operations on invitations
7. **Password strength validation** on signup
8. **HSTS and other security headers** properly configured

### Architecture Positives:
1. Clean separation of concerns
2. Proper TypeScript usage
3. Consistent error response format
4. Zustand for state management
5. Good use of AWS SDK v3

---

## Recommended Priority Order

| Priority | Issue | Effort | Impact |
|----------|-------|--------|--------|
| P0 | JWT token verification | Medium | Critical |
| P0 | Remove user_id cookie fallback | Low | High |
| P1 | Implement findUserByStripeCustomer | Medium | High |
| P1 | Add rate limiting | Medium | High |
| P2 | Fix admin auth check | Low | Medium |
| P2 | Centralize auth logic | Medium | Medium |
| P2 | Remove CSP unsafe directives | High | Medium |
| P3 | Add payment failure emails | Low | Low |
| P3 | Remove hardcoded email whitelist | Low | Low |

---

## Conclusion

The InviteGenerator codebase has a solid foundation with good architectural decisions and many security best practices already in place. However, the **JWT token verification issue is critical** and must be fixed before any production deployment. The Stripe webhook handler also needs completion to ensure subscription management works correctly.

Once these critical issues are addressed, the application will be in a much stronger security posture for production use.

---

*Report generated by automated code audit*
