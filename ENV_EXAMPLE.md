# Environment Variables Template

This file contains the template for `.env.example`. Copy this content to create `.env.example` in your project root.

```bash
# ============================================================================
# EKKO MVP - Environment Variables Template
# ============================================================================
# Copy this file to .env.local for local development
# For production, set these in your hosting platform (Vercel, etc.)
# ============================================================================

# ----------------------------------------------------------------------------
# Database
# ----------------------------------------------------------------------------
DATABASE_URL=postgresql://user:password@localhost:5432/ekko

# ----------------------------------------------------------------------------
# NextAuth.js Configuration
# ----------------------------------------------------------------------------
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-here-generate-with-openssl-rand-base64-32

# ----------------------------------------------------------------------------
# Email Provider (for Email Authentication)
# ----------------------------------------------------------------------------
EMAIL_SERVER=smtp://user:password@smtp.example.com:587
EMAIL_FROM=noreply@example.com

# ----------------------------------------------------------------------------
# Google OAuth (for Google Sign-In)
# ----------------------------------------------------------------------------
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# ----------------------------------------------------------------------------
# Stripe (for Payment Processing)
# ----------------------------------------------------------------------------
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# ----------------------------------------------------------------------------
# Admin Configuration
# ----------------------------------------------------------------------------
ADMIN_SECRET=your-admin-secret-key-generate-with-openssl-rand-base64-32

# ----------------------------------------------------------------------------
# Storage Configuration (S3-Compatible)
# ----------------------------------------------------------------------------
STORAGE_PROVIDER=local
STORAGE_BUCKET=your-bucket-name
STORAGE_ENDPOINT=https://s3.amazonaws.com
STORAGE_ACCESS_KEY_ID=your-access-key-id
STORAGE_SECRET_ACCESS_KEY=your-secret-access-key
STORAGE_REGION=us-east-1

# ----------------------------------------------------------------------------
# Cron Jobs / Background Tasks
# ----------------------------------------------------------------------------
CRON_SECRET=your-cron-secret-key

# ----------------------------------------------------------------------------
# Node Environment
# ----------------------------------------------------------------------------
NODE_ENV=development

# ----------------------------------------------------------------------------
# Optional: Monitoring & Analytics
# ----------------------------------------------------------------------------
SENTRY_DSN=
ENABLE_ANALYTICS=true
ENABLE_NOTIFICATIONS=true
```

## Quick Setup

1. Copy this content to `.env.example`:
   ```bash
   cp ENV_EXAMPLE.md .env.example
   # Then edit .env.example to remove markdown formatting
   ```

2. Or create `.env.example` manually with the content above.

3. Copy to `.env.local` for local development:
   ```bash
   cp .env.example .env.local
   ```

4. Fill in your actual values in `.env.local` (never commit this file).

