# InviteGenerator API Documentation

**Version:** 1.0.0
**Base URL:** `https://invitegenerator.com/api`

---

## Authentication

All authenticated endpoints require a valid JWT token in the Authorization header or session cookie.

```
Authorization: Bearer <token>
```

Or via cookie:
```
Cookie: auth-token=<token>
```

---

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

---

## Endpoints

### Authentication

#### POST /api/auth/signup
Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe"
    }
  }
}
```

#### POST /api/auth/login
Authenticate a user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "jwt-token"
  }
}
```

#### POST /api/auth/logout
End the current session.

**Response:**
```json
{
  "success": true
}
```

---

### Invitations

#### GET /api/invitations
List all invitations for the authenticated user.

**Query Parameters:**
- `status` (optional): Filter by status (draft, published, archived)
- `limit` (optional): Number of results (default: 20, max: 100)
- `cursor` (optional): Pagination cursor

**Response:**
```json
{
  "success": true,
  "data": {
    "invitations": [
      {
        "id": "uuid",
        "title": "Birthday Party",
        "eventDate": "2024-12-25T18:00:00Z",
        "status": "published",
        "rsvpCount": 25,
        "createdAt": "2024-12-01T10:00:00Z"
      }
    ],
    "nextCursor": "cursor-string"
  }
}
```

#### POST /api/invitations
Create a new invitation.

**Request Body:**
```json
{
  "title": "Birthday Party",
  "description": "Join us for a celebration!",
  "eventDate": "2024-12-25T18:00:00Z",
  "location": {
    "address": "123 Main St",
    "city": "New York",
    "state": "NY"
  },
  "templateId": "template-uuid"
}
```

#### GET /api/invitations/:id
Get a specific invitation.

#### PUT /api/invitations/:id
Update an invitation.

#### DELETE /api/invitations/:id
Delete an invitation.

#### POST /api/invitations/:id/publish
Publish an invitation (make it publicly accessible).

#### POST /api/invitations/:id/duplicate
Create a copy of an invitation.

#### POST /api/invitations/:id/export
Export invitation for printing.

**Request Body:**
```json
{
  "format": "png-print",
  "size": "5x7",
  "width": 1500,
  "height": 2100,
  "dpi": 300,
  "includeBleed": false
}
```

**Response:** Binary file (PNG or PDF)

---

### RSVP

#### GET /api/rsvp/:invitationId
Get RSVPs for an invitation.

**Response:**
```json
{
  "success": true,
  "data": {
    "responses": [
      {
        "id": "uuid",
        "name": "Jane Doe",
        "email": "jane@example.com",
        "response": "yes",
        "guestCount": 2,
        "message": "Can't wait!",
        "createdAt": "2024-12-10T15:30:00Z"
      }
    ],
    "stats": {
      "total": 50,
      "yes": 35,
      "no": 10,
      "maybe": 5
    }
  }
}
```

#### POST /api/rsvp/:invitationId
Submit an RSVP (public endpoint).

**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "response": "yes",
  "guestCount": 2,
  "dietaryRestrictions": "Vegetarian",
  "message": "Looking forward to it!"
}
```

#### GET /api/rsvp/:invitationId/export
Export RSVPs as CSV.

---

### Templates

#### GET /api/templates
List available templates.

**Query Parameters:**
- `category` (optional): Filter by category
- `style` (optional): Filter by style
- `premium` (optional): Include premium templates

**Response:**
```json
{
  "success": true,
  "data": {
    "templates": [
      {
        "id": "uuid",
        "name": "Elegant Wedding",
        "category": "wedding",
        "thumbnail": "https://...",
        "isPremium": false
      }
    ]
  }
}
```

---

### Print Orders

#### POST /api/print/quote
Get a price quote for printing.

**Request Body:**
```json
{
  "invitationId": "uuid",
  "size": "5x7",
  "quantity": 50,
  "cardType": "flat",
  "finish": "matte",
  "shippingCountry": "US",
  "shippingMethod": "standard"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sku": "GLOBAL-FAC-5x7",
    "quantity": 50,
    "unitPrice": 1.69,
    "subtotal": 84.50,
    "shipping": 4.99,
    "total": 89.49,
    "currency": "USD",
    "estimatedDelivery": "5-7 business days"
  }
}
```

#### POST /api/print/order
Create a print order.

**Request Body:**
```json
{
  "invitationId": "uuid",
  "size": "5x7",
  "quantity": 50,
  "cardType": "flat",
  "finish": "matte",
  "shippingMethod": "standard",
  "shippingAddress": {
    "name": "John Doe",
    "line1": "123 Main St",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001",
    "country": "US"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "uuid",
    "checkoutUrl": "https://checkout.stripe.com/...",
    "sessionId": "cs_..."
  }
}
```

---

### Affiliates

#### GET /api/affiliates
Get affiliate dashboard data.

#### POST /api/affiliates/apply
Apply to become an affiliate.

#### POST /api/affiliates/payout
Request a payout.

#### GET /api/affiliates/referrals
Get referral history.

---

### Billing

#### GET /api/billing/subscription
Get current subscription status.

#### POST /api/billing/checkout
Create a checkout session for subscription.

#### POST /api/billing/portal
Create a billing portal session.

---

### Webhooks

#### POST /api/webhooks/stripe
Handle Stripe webhook events.

---

## Error Codes

| Code | Description |
|------|-------------|
| `UNAUTHORIZED` | Authentication required |
| `FORBIDDEN` | Access denied |
| `NOT_FOUND` | Resource not found |
| `INVALID_REQUEST` | Invalid request parameters |
| `RATE_LIMITED` | Too many requests |
| `UPGRADE_REQUIRED` | Premium feature requires upgrade |
| `INTERNAL_ERROR` | Server error |

---

## Rate Limits

- **Standard:** 100 requests per minute
- **Authenticated:** 200 requests per minute
- **API Keys:** 1000 requests per minute

---

## SDKs

Coming soon:
- JavaScript/TypeScript SDK
- Python SDK
- PHP SDK
