# Task 8: Verification Workflow + Admin Endpoints - Implementation Summary

## Overview
Implemented a complete verification request flow with admin approval/rejection and Stripe subscription integration for paid verification tiers.

## Backend Implementation

### 1. POST /api/verifications/request
**File**: `app/api/verifications/request/route.ts`

**Features**:
- ✅ Creates `VerificationRequest` with `evidenceUrls`
- ✅ Validates artist profile exists
- ✅ Prevents duplicate pending requests
- ✅ Returns request with artist info

**Request Body**:
```typescript
{
  evidenceUrls: string[];
}
```

### 2. GET /api/verifications/pending
**File**: `app/api/verifications/pending/route.ts`

**Features**:
- ✅ Admin-only endpoint (protected by `ADMIN_SECRET`)
- ✅ Lists all pending verification requests
- ✅ Returns requests with artist info
- ✅ Sorted by creation date (oldest first)

**Authentication**:
- Header: `x-admin-secret: ${ADMIN_SECRET}`
- Or query param: `?adminSecret=${ADMIN_SECRET}`

### 3. POST /api/verifications/[id]/approve
**File**: `app/api/verifications/[id]/approve/route.ts`

**Features**:
- ✅ Admin-only endpoint
- ✅ Sets `status: APPROVED`
- ✅ Updates `ArtistProfile.verificationTier`
- ✅ Sets `reviewedAt` timestamp
- ✅ Stores optional `adminNote`

**Request Body**:
```typescript
{
  verificationTier: VerificationTier; // RED, BLACK, or PLATINUM
  adminNote?: string;
}
```

### 4. POST /api/verifications/[id]/reject
**File**: `app/api/verifications/[id]/reject/route.ts`

**Features**:
- ✅ Admin-only endpoint
- ✅ Sets `status: REJECTED`
- ✅ Sets `reviewedAt` timestamp
- ✅ Requires `adminNote` (reason for rejection)

**Request Body**:
```typescript
{
  adminNote: string; // Required
}
```

### 5. POST /api/stripe/create-checkout-session
**File**: `app/api/stripe/create-checkout-session/route.ts`

**Features**:
- ✅ Creates Stripe checkout session for RED or BLACK tier
- ✅ Validates user is artist
- ✅ Prevents downgrading (checks current tier)
- ✅ Returns `sessionId` and `url` for redirect
- ✅ Includes metadata (userId, artistId, requestedTier)

**Request Body**:
```typescript
{
  tier: 'RED' | 'BLACK';
}
```

**Pricing**:
- RED: $9.99/month
- BLACK: $29.99/month

### 6. POST /api/stripe/webhook
**File**: `app/api/stripe/webhook/route.ts`

**Features**:
- ✅ Handles `checkout.session.completed` event
- ✅ Updates `ArtistProfile.verificationTier` from metadata
- ✅ Webhook signature verification (optional in dev)
- ✅ Returns success response

**Events Handled**:
- `checkout.session.completed`: Updates verification tier

## Frontend Implementation

### 1. Verification Application Page
**File**: `app/verification/apply/page.tsx`

**Features**:
- ✅ Upload evidence files (images, PDFs, documents)
- ✅ Preview uploaded files
- ✅ Remove files before submission
- ✅ Submit verification request
- ✅ Success confirmation
- ✅ Redirects to dashboard after submission

### 2. Upgrade Verification Page
**File**: `app/verification/upgrade/page.tsx`

**Features**:
- ✅ Display RED and BLACK tier options
- ✅ Show pricing and features
- ✅ Create checkout session on click
- ✅ Redirect to Stripe checkout
- ✅ Error handling

### 3. Success Page
**File**: `app/verification/success/page.tsx`

**Features**:
- ✅ Displays success message
- ✅ Shows session ID
- ✅ Link to dashboard

### 4. Cancel Page
**File**: `app/verification/cancel/page.tsx`

**Features**:
- ✅ Displays cancellation message
- ✅ Option to try again or go to dashboard

## Admin Script

**File**: `scripts/admin-verification.sh`

**Features**:
- ✅ List pending requests
- ✅ Approve requests with tier selection
- ✅ Reject requests with reason
- ✅ Uses `ADMIN_SECRET` from environment

**Usage**:
```bash
./scripts/admin-verification.sh list
./scripts/admin-verification.sh approve <id> RED "Looks good!"
./scripts/admin-verification.sh reject <id> "Insufficient evidence"
```

## Database Interactions

### Create Verification Request
```typescript
await prisma.verificationRequest.create({
  data: {
    artistId: artistProfile.id,
    evidenceUrls: body.evidenceUrls,
    status: VerificationStatus.PENDING,
  },
});
```

### Approve Request (Transaction)
```typescript
await prisma.$transaction([
  prisma.verificationRequest.update({
    where: { id },
    data: {
      status: VerificationStatus.APPROVED,
      reviewedAt: new Date(),
      adminNote: body.adminNote,
    },
  }),
  prisma.artistProfile.update({
    where: { id: request.artistId },
    data: {
      verificationTier: body.verificationTier,
    },
  }),
]);
```

### Reject Request
```typescript
await prisma.verificationRequest.update({
  where: { id },
  data: {
    status: VerificationStatus.REJECTED,
    reviewedAt: new Date(),
    adminNote: body.adminNote,
  },
});
```

### Update Tier from Webhook
```typescript
await prisma.artistProfile.update({
  where: { id: artistId },
  data: {
    verificationTier: requestedTier,
  },
});
```

## Acceptance Criteria

### ✅ Request Creates DB Row

**Implementation**:
- POST /api/verifications/request creates `VerificationRequest` with `status: PENDING`
- Evidence URLs stored in `evidenceUrls` array
- Returns created request with artist info

**Test**:
```bash
curl -X POST http://localhost:3000/api/verifications/request \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=${SESSION_TOKEN}" \
  -d '{"evidenceUrls": ["/mock/evidence1.jpg"]}'
```

### ✅ Admin Approve Updates Profile Tier

**Implementation**:
- POST /api/verifications/[id]/approve updates both:
  - `VerificationRequest.status` → `APPROVED`
  - `ArtistProfile.verificationTier` → requested tier
- Uses transaction to ensure atomicity

**Test**:
```bash
curl -X POST "http://localhost:3000/api/verifications/${REQUEST_ID}/approve?adminSecret=${ADMIN_SECRET}" \
  -H "Content-Type: application/json" \
  -d '{"verificationTier": "RED"}'
```

### ✅ Create-Checkout-Session Returns sessionId

**Implementation**:
- POST /api/stripe/create-checkout-session creates Stripe session
- Returns `{ sessionId, url }`
- URL can be used to redirect user to Stripe checkout

**Test**:
```bash
curl -X POST http://localhost:3000/api/stripe/create-checkout-session \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=${SESSION_TOKEN}" \
  -d '{"tier": "RED"}'
```

## Example Queries

See `VERIFICATION_EXAMPLES.md` for detailed cURL examples for all endpoints.

## Files Created

### Backend
- `app/api/verifications/request/route.ts` - Create request
- `app/api/verifications/pending/route.ts` - List pending (admin)
- `app/api/verifications/[id]/approve/route.ts` - Approve (admin)
- `app/api/verifications/[id]/reject/route.ts` - Reject (admin)
- `app/api/stripe/create-checkout-session/route.ts` - Stripe checkout
- `app/api/stripe/webhook/route.ts` - Stripe webhook handler

### Frontend
- `app/verification/apply/page.tsx` - Application form
- `app/verification/upgrade/page.tsx` - Upgrade page
- `app/verification/success/page.tsx` - Success page
- `app/verification/cancel/page.tsx` - Cancel page

### Types
- `lib/types/verification.ts` - Type definitions

### Scripts
- `scripts/admin-verification.sh` - Admin management script

### Documentation
- `VERIFICATION_EXAMPLES.md` - Example queries
- `TASK_8_IMPLEMENTATION.md` - This file

## Environment Variables

Required:
```bash
ADMIN_SECRET=your-secret-admin-key
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...  # Optional in dev
NEXTAUTH_URL=http://localhost:3000
```

## Status: ✅ COMPLETE

All acceptance criteria met:
- ✅ Request creates DB row
- ✅ Admin approve updates profile tier
- ✅ Create-checkout-session returns sessionId
- ✅ Webhook stub for checkout.session.completed
- ✅ Frontend application flow
- ✅ Payment flow with Stripe redirect
- ✅ Admin script for approval/rejection

