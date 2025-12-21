# Verification & Stripe Integration - Example Queries

## Verification API Endpoints

### 1. Create Verification Request

```bash
curl -X POST http://localhost:3000/api/verifications/request \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=${SESSION_TOKEN}" \
  -d '{
    "evidenceUrls": [
      "/mock/evidence1.jpg",
      "/mock/evidence2.pdf",
      "/mock/portfolio-link"
    ]
  }'
```

**Response (201 Created)**:
```json
{
  "id": "verification-request-id",
  "artistId": "artist-profile-id",
  "status": "PENDING",
  "evidenceUrls": [
    "/mock/evidence1.jpg",
    "/mock/evidence2.pdf",
    "/mock/portfolio-link"
  ],
  "adminNote": null,
  "createdAt": "2024-01-01T12:00:00.000Z",
  "reviewedAt": null,
  "artist": {
    "id": "artist-profile-id",
    "displayName": "Artist Name",
    "userId": "user-id"
  }
}
```

### 2. List Pending Verification Requests (Admin Only)

```bash
# Using header
curl http://localhost:3000/api/verifications/pending \
  -H "x-admin-secret: ${ADMIN_SECRET}"

# Using query parameter
curl "http://localhost:3000/api/verifications/pending?adminSecret=${ADMIN_SECRET}"
```

**Response (200 OK)**:
```json
{
  "requests": [
    {
      "id": "verification-request-id",
      "artistId": "artist-profile-id",
      "status": "PENDING",
      "evidenceUrls": ["/mock/evidence1.jpg"],
      "adminNote": null,
      "createdAt": "2024-01-01T12:00:00.000Z",
      "reviewedAt": null,
      "artist": {
        "id": "artist-profile-id",
        "displayName": "Artist Name",
        "userId": "user-id"
      }
    }
  ]
}
```

### 3. Approve Verification Request (Admin Only)

```bash
curl -X POST "http://localhost:3000/api/verifications/verification-request-id/approve?adminSecret=${ADMIN_SECRET}" \
  -H "Content-Type: application/json" \
  -H "x-admin-secret: ${ADMIN_SECRET}" \
  -d '{
    "verificationTier": "RED",
    "adminNote": "Approved - excellent portfolio"
  }'
```

**Response (200 OK)**:
```json
{
  "success": true
}
```

**Note**: This updates the `ArtistProfile.verificationTier` and sets `reviewedAt`.

### 4. Reject Verification Request (Admin Only)

```bash
curl -X POST "http://localhost:3000/api/verifications/verification-request-id/reject?adminSecret=${ADMIN_SECRET}" \
  -H "Content-Type: application/json" \
  -H "x-admin-secret: ${ADMIN_SECRET}" \
  -d '{
    "adminNote": "Insufficient evidence provided"
  }'
```

**Response (200 OK)**:
```json
{
  "success": true
}
```

## Stripe Integration

### 5. Create Checkout Session

```bash
curl -X POST http://localhost:3000/api/stripe/create-checkout-session \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=${SESSION_TOKEN}" \
  -d '{
    "tier": "RED"
  }'
```

**Response (200 OK)**:
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/c/pay/cs_test_..."
}
```

**Note**: Redirect user to `url` to complete payment.

### 6. Stripe Webhook (Development)

For local development, use Stripe CLI:

```bash
# Install Stripe CLI: https://stripe.com/docs/stripe-cli
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

This will output a webhook signing secret. Add it to `.env.local`:
```
STRIPE_WEBHOOK_SECRET=whsec_...
```

Then trigger test events:
```bash
stripe trigger checkout.session.completed
```

## Admin Script Usage

Use the provided admin script for easier management:

```bash
# Make executable
chmod +x scripts/admin-verification.sh

# List pending requests
export ADMIN_SECRET="your-admin-secret"
./scripts/admin-verification.sh list

# Approve a request
./scripts/admin-verification.sh approve <request-id> RED "Looks good!"

# Reject a request
./scripts/admin-verification.sh reject <request-id> "Insufficient evidence"
```

## Frontend Routes

### Apply for Verification
```
http://localhost:3000/verification/apply
```

### Upgrade Verification Tier
```
http://localhost:3000/verification/upgrade
```

### Success Page (after Stripe checkout)
```
http://localhost:3000/verification/success?session_id=cs_test_...
```

### Cancel Page (if user cancels)
```
http://localhost:3000/verification/cancel
```

## Environment Variables

Required environment variables:

```bash
# Admin
ADMIN_SECRET=your-secret-admin-key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...  # For webhook signature verification

# NextAuth (for redirect URLs)
NEXTAUTH_URL=http://localhost:3000
```

## Verification Flow

1. **Artist applies for verification**:
   - Navigate to `/verification/apply`
   - Upload evidence files
   - Submit request → Creates `VerificationRequest` with `status: PENDING`

2. **Admin reviews**:
   - List pending: `GET /api/verifications/pending`
   - Approve: `POST /api/verifications/[id]/approve` → Updates `ArtistProfile.verificationTier`
   - Reject: `POST /api/verifications/[id]/reject` → Sets `status: REJECTED`

3. **Artist upgrades tier** (paid):
   - Navigate to `/verification/upgrade`
   - Select RED or BLACK tier
   - Click "Upgrade" → Creates Stripe checkout session
   - Redirects to Stripe checkout
   - After payment → Webhook updates `verificationTier`

## Stripe Test Cards

For testing checkout:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

Use any future expiry date, any CVC, and any ZIP code.

## Notes

- **Verification Tiers**:
  - `NONE`: Default, free
  - `RED`: $9.99/month (paid)
  - `BLACK`: $29.99/month (paid)
  - `PLATINUM`: Highest tier (admin-granted only)

- **Admin Protection**:
  - All admin endpoints require `ADMIN_SECRET` in header or query param
  - Set `ADMIN_SECRET` in `.env.local`

- **Webhook in Development**:
  - Use Stripe CLI to forward webhooks to local server
  - Webhook signature verification is optional in dev (skipped if `STRIPE_WEBHOOK_SECRET` not set)

