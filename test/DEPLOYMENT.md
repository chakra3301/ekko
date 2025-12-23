# EKKO MVP - Deployment Guide & Handoff Documentation

This document provides step-by-step instructions for deploying the EKKO MVP to production and handing off to the operations team.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Variables](#environment-variables)
3. [Database Setup & Migrations](#database-setup--migrations)
4. [Vercel Deployment](#vercel-deployment)
5. [Stripe Webhook Setup](#stripe-webhook-setup)
6. [Admin Scripts & Secrets](#admin-scripts--secrets)
7. [Monitoring & Observability](#monitoring--observability)
8. [Database Backup Strategy](#database-backup-strategy)
9. [QA Handoff Checklist](#qa-handoff-checklist)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

- ✅ Node.js 18+ installed
- ✅ PostgreSQL database (local or cloud-hosted)
- ✅ Vercel account (or alternative hosting platform)
- ✅ Stripe account (for payments)
- ✅ Google Cloud Console project (for OAuth)
- ✅ Email service (SMTP) configured
- ✅ S3-compatible storage (optional, for production media)

---

## Environment Variables

### 1. Create `.env.example` Template

A complete `.env.example` file is included in the repository. Copy it to `.env.local` for local development:

```bash
cp .env.example .env.local
```

### 2. Required Environment Variables

#### **Critical (Must Have)**

| Variable | Description | How to Get |
|----------|-------------|------------|
| `DATABASE_URL` | PostgreSQL connection string | From your database provider |
| `AUTH_URL` or `NEXTAUTH_URL` | Application URL | `http://localhost:3000` (dev) or `https://yourdomain.com` (prod)<br/>NextAuth v5 uses `AUTH_URL`, v4 uses `NEXTAUTH_URL` |
| `AUTH_SECRET` or `NEXTAUTH_SECRET` | JWT encryption secret | Generate: `openssl rand -base64 32`<br/>NextAuth v5 uses `AUTH_SECRET`, v4 uses `NEXTAUTH_SECRET` |

#### **Authentication**

| Variable | Description | How to Get |
|----------|-------------|------------|
| `EMAIL_SERVER` | SMTP server URL | From your email provider (Gmail, SendGrid, AWS SES) |
| `EMAIL_FROM` | Sender email address | Your verified email |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | [Google Cloud Console]() |https://console.cloud.google.com/
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | [Google Cloud Console](https://console.cloud.google.com/) |

#### **Payments (Stripe)**

| Variable | Description | How to Get |
|----------|-------------|------------|
| `STRIPE_SECRET_KEY` | Stripe API secret key | [Stripe Dashboard](https://dashboard.stripe.com/) → API Keys |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret | [Stripe Dashboard](https://dashboard.stripe.com/) → Webhooks |

#### **Admin & Security**

| Variable | Description | How to Get |
|----------|-------------|------------|
| `ADMIN_SECRET` | Secret for admin endpoints | Generate: `openssl rand -base64 32` |

#### **Storage (Optional)**

| Variable | Description | Default |
|----------|-------------|---------|
| `STORAGE_PROVIDER` | `local` or `s3` | `local` |
| `STORAGE_BUCKET` | S3 bucket name | - |
| `STORAGE_ENDPOINT` | S3 endpoint URL | - |
| `STORAGE_ACCESS_KEY_ID` | S3 access key | - |
| `STORAGE_SECRET_ACCESS_KEY` | S3 secret key | - |
| `STORAGE_REGION` | S3 region | `us-east-1` |

### 3. Generate Secrets

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate ADMIN_SECRET
openssl rand -base64 32

# Generate CRON_SECRET (optional)
openssl rand -base64 32
```

### 4. Set Environment Variables in Vercel

1. Go to your Vercel project → Settings → Environment Variables
2. Add each variable from `.env.example`
3. Set different values for:
   - **Development** (preview deployments)
   - **Production** (production deployments)

**Important**: Never commit `.env.local` or production secrets to Git!

---

## Database Setup & Migrations

### 1. Choose a Database Provider

**Recommended Options:**
- **Supabase** (free tier available): https://supabase.com
- **Neon** (serverless PostgreSQL): https://neon.tech
- **Railway** (easy setup): https://railway.app
- **AWS RDS** (enterprise): https://aws.amazon.com/rds
- **Self-hosted PostgreSQL**

### 2. Create Database

```bash
# Example with Supabase
# 1. Create project at https://supabase.com
# 2. Copy connection string from Settings → Database
# 3. Format: postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
```

### 3. Run Prisma Migrations

#### **Development (Initial Setup)**

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database (creates tables)
npm run db:push
```

#### **Production (Recommended)**

```bash
# Create migration
npm run db:migrate

# This will:
# 1. Create a migration file in prisma/migrations/
# 2. Apply it to your database
# 3. Generate Prisma Client
```

#### **Verify Database Schema**

```bash
# Open Prisma Studio to inspect database
npm run db:studio

# Or verify programmatically
npm run db:verify
```

### 4. Seed Database (Optional)

Create `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Add seed data here
  // Example: Create test users, artists, etc.
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Add to `package.json`:

```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

Run seed:

```bash
npx prisma db seed
```

### 5. Database Indexes

The schema includes optimized indexes:
- GIN indexes on array fields (`disciplines`, `tools`)
- Indexes on frequently queried fields (`verificationTier`, `availability`)
- Composite indexes for search queries

**No manual index creation needed** - Prisma handles this via migrations.

---

## Vercel Deployment

### 1. Connect Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your Git repository (GitHub, GitLab, Bitbucket)
4. Vercel will auto-detect Next.js

### 2. Configure Build Settings

**Framework Preset**: Next.js (auto-detected)

**Build Command**: `npm run build` (default)

**Output Directory**: `.next` (default)

**Install Command**: `npm install` (default)

**Root Directory**: `./` (default)

### 3. Environment Variables

Add all environment variables from `.env.example` in Vercel:

1. Go to Project → Settings → Environment Variables
2. Add each variable
3. Select environments:
   - **Production**: Production deployments
   - **Preview**: Preview deployments (PRs)
   - **Development**: Local development (optional)

**Critical Variables to Set:**
- `DATABASE_URL` (production database)
- `AUTH_URL` or `NEXTAUTH_URL` (your production domain, e.g., `https://your-app.vercel.app`)
- `AUTH_SECRET` or `NEXTAUTH_SECRET` (generated secret)
- `STRIPE_SECRET_KEY` (Stripe live key)
- `STRIPE_WEBHOOK_SECRET` (production webhook secret)
- `ADMIN_SECRET` (admin operations)
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` (with production redirect URI)

### 4. Build Environment Variables

Vercel automatically sets:
- `NODE_ENV=production`
- `VERCEL_ENV=production`
- `VERCEL_URL` (deployment URL)

### 5. Serverless Functions Configuration

Next.js API routes run as serverless functions on Vercel.

**Function Timeout**: Default 10s (can be increased in `vercel.json`)

Create `vercel.json` for custom configuration:

```json
{
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "crons": [
    {
      "path": "/api/cron/recompute-scores",
      "schedule": "0 2 * * *"
    }
  ]
}
```

### 6. Deploy

```bash
# Automatic deployment on git push
git push origin main

# Or deploy manually
vercel --prod
```

### 7. Custom Domain

1. Go to Project → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update `AUTH_URL` or `NEXTAUTH_URL` to your custom domain

### 8. Post-Deployment Checklist

- [ ] Verify database connection
- [ ] Test authentication (email + Google)
- [ ] Test Stripe webhook endpoint
- [ ] Verify admin endpoints are protected
- [ ] Check serverless function logs
- [ ] Test API endpoints
- [ ] Verify environment variables are set

---

## Stripe Webhook Setup

### 1. Create Webhook Endpoint in Stripe

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/) → Developers → Webhooks
2. Click "Add endpoint"
3. **Endpoint URL**: `https://yourdomain.com/api/stripe/webhook`
4. **Events to send**:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

### 2. Get Webhook Signing Secret

1. After creating the webhook, click on it
2. Copy the "Signing secret" (starts with `whsec_`)
3. Add to `STRIPE_WEBHOOK_SECRET` in Vercel environment variables

### 3. Test Webhook Locally (Development)

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe  # macOS
# or see: https://stripe.com/docs/stripe-cli

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Copy the webhook signing secret shown in terminal
# Add to .env.local: STRIPE_WEBHOOK_SECRET=whsec_...
```

### 4. Verify Webhook Signature

The webhook handler (`app/api/stripe/webhook/route.ts`) verifies the signature automatically using `STRIPE_WEBHOOK_SECRET`.

**Important**: Never skip signature verification in production!

### 5. Test Webhook Events

```bash
# Trigger test event
stripe trigger checkout.session.completed

# Or use Stripe Dashboard → Webhooks → Send test webhook
```

---

## Admin Scripts & Secrets

### 1. Admin Secret

The `ADMIN_SECRET` protects admin-only endpoints:

- `GET /api/verifications/pending`
- `POST /api/verifications/[id]/approve`
- `POST /api/verifications/[id]/reject`

**Generate Secret:**

```bash
openssl rand -base64 32
```

**Set in Environment:**

```bash
# .env.local (development)
ADMIN_SECRET=your-generated-secret

# Vercel (production)
# Add to Environment Variables
```

### 2. Using Admin Endpoints

#### **Via cURL**

```bash
# List pending verifications
curl -X GET "https://yourdomain.com/api/verifications/pending?adminSecret=${ADMIN_SECRET}"

# Approve verification
curl -X POST "https://yourdomain.com/api/verifications/${REQUEST_ID}/approve?adminSecret=${ADMIN_SECRET}" \
  -H "Content-Type: application/json" \
  -d '{"tier": "RED", "adminNote": "Approved"}'

# Reject verification
curl -X POST "https://yourdomain.com/api/verifications/${REQUEST_ID}/reject?adminSecret=${ADMIN_SECRET}" \
  -H "Content-Type: application/json" \
  -d '{"adminNote": "Insufficient evidence"}'
```

#### **Via Header**

```bash
curl -X GET "https://yourdomain.com/api/verifications/pending" \
  -H "x-admin-secret: ${ADMIN_SECRET}"
```

### 3. Admin CLI Scripts

Scripts are located in `scripts/`:

#### **Approve Verification**

```bash
node scripts/approveVerification.js <requestId> approve RED "Note"
```

#### **Ban User**

```bash
node scripts/banUser.js <userId> ban
node scripts/banUser.js <userId> unban
```

#### **Recompute Search Scores**

```bash
node scripts/recomputeSearchScores.js
```

**Running Scripts in Production:**

```bash
# Option 1: Run locally with production DATABASE_URL
export DATABASE_URL="postgresql://..."
node scripts/recomputeSearchScores.js

# Option 2: Use Vercel CLI
vercel env pull .env.production
node scripts/recomputeSearchScores.js

# Option 3: SSH into server (if self-hosted)
ssh user@server
cd /path/to/app
node scripts/recomputeSearchScores.js
```

### 4. Scheduled Tasks (Cron)

#### **Vercel Cron Jobs**

Add to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/recompute-scores",
      "schedule": "0 2 * * *"
    }
  ]
}
```

Create `app/api/cron/recompute-scores/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { spawn } from 'child_process';

export async function GET(req: Request) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Run script
  const script = spawn('node', ['scripts/recomputeSearchScores.js'], {
    env: process.env,
  });

  return NextResponse.json({ success: true });
}
```

#### **Alternative: GitHub Actions**

See `README.md` for GitHub Actions cron example.

---

## Monitoring & Observability

### 1. Sentry (Error Tracking)

#### **Setup**

1. Create account at [sentry.io](https://sentry.io)
2. Create a project (Next.js)
3. Get DSN from project settings
4. Add to environment variables: `SENTRY_DSN`

#### **Installation**

```bash
npm install @sentry/nextjs
```

#### **Configuration**

Create `sentry.client.config.ts`:

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

Create `sentry.server.config.ts`:

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

Update `next.config.js`:

```javascript
const { withSentryConfig } = require('@sentry/nextjs');

module.exports = withSentryConfig(
  {
    // Your Next.js config
  },
  {
    // Sentry options
  }
);
```

### 2. Vercel Analytics

Vercel provides built-in analytics:

1. Go to Project → Analytics
2. Enable Web Analytics
3. View metrics: page views, performance, etc.

### 3. Custom Metrics (Prometheus-style)

For custom metrics, consider:

- **Vercel Analytics** (built-in)
- **Datadog** (APM)
- **New Relic** (APM)
- **Grafana Cloud** (self-hosted)

Example custom metric endpoint:

```typescript
// app/api/metrics/route.ts
export async function GET() {
  const metrics = {
    users: await prisma.user.count(),
    artists: await prisma.artistProfile.count(),
    posts: await prisma.post.count(),
    // ... more metrics
  };
  return Response.json(metrics);
}
```

### 4. Logging

**Vercel Logs:**

- View in Vercel Dashboard → Deployments → [Deployment] → Logs
- Or use Vercel CLI: `vercel logs`

**Structured Logging:**

```typescript
// lib/logger.ts
export function log(level: 'info' | 'error' | 'warn', message: string, data?: any) {
  console.log(JSON.stringify({
    level,
    message,
    timestamp: new Date().toISOString(),
    ...data,
  }));
}
```

### 5. Health Check Endpoint

Create `app/api/health/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}
```

Use for uptime monitoring (UptimeRobot, Pingdom, etc.)

---

## Database Backup Strategy

### 1. Automated Backups

#### **Supabase** (Built-in)

- Automatic daily backups
- Point-in-time recovery (PITR) available
- Manual backup: Dashboard → Database → Backups

#### **Neon** (Built-in)

- Automatic backups
- Branching for point-in-time recovery

#### **Self-Hosted / AWS RDS**

Use `pg_dump`:

```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > backup_$DATE.sql

# Upload to S3
aws s3 cp backup_$DATE.sql s3://your-backup-bucket/
```

### 2. Manual Backup

```bash
# Export database
pg_dump $DATABASE_URL > backup.sql

# Restore database
psql $DATABASE_URL < backup.sql
```

### 3. Prisma Migrations Backup

Migrations are version-controlled in `prisma/migrations/`.

**Best Practice**: Always commit migrations to Git before deploying.

### 4. Backup Schedule Recommendations

- **Daily**: Full database dump
- **Weekly**: Archive old backups
- **Before major deployments**: Manual backup
- **Retention**: Keep 30 days of daily backups, 12 months of weekly backups

### 5. Disaster Recovery Plan

1. **Identify Critical Data**: Users, profiles, posts, messages
2. **Backup Frequency**: Daily automated backups
3. **Recovery Time Objective (RTO)**: < 1 hour
4. **Recovery Point Objective (RPO)**: < 24 hours
5. **Test Restores**: Monthly restore tests

---

## QA Handoff Checklist

### Pre-Launch Checklist

#### **Environment Setup**
- [ ] All environment variables configured in production
- [ ] Database migrations applied
- [ ] Database indexes created
- [ ] Stripe webhook endpoint configured
- [ ] Google OAuth redirect URI updated for production
- [ ] Email SMTP configured and tested

#### **Security**
- [ ] `NEXTAUTH_SECRET` is unique and secure
- [ ] `ADMIN_SECRET` is unique and secure
- [ ] `STRIPE_WEBHOOK_SECRET` is configured
- [ ] All admin endpoints require authentication
- [ ] CORS configured (if needed)
- [ ] Rate limiting implemented (recommended)

#### **Functionality Testing**
- [ ] User sign-up (email + Google)
- [ ] Artist onboarding flow
- [ ] Client onboarding flow
- [ ] Profile creation and editing
- [ ] Portfolio upload
- [ ] Post creation and feed
- [ ] Search functionality
- [ ] Messaging system
- [ ] Verification request flow
- [ ] Stripe checkout and webhook
- [ ] Admin approval/rejection

#### **Performance**
- [ ] Page load times < 3s
- [ ] API response times < 500ms (p95)
- [ ] Database queries optimized
- [ ] Images optimized (Next.js Image component)
- [ ] Serverless function timeouts configured

#### **Monitoring**
- [ ] Sentry configured and tested
- [ ] Health check endpoint working
- [ ] Error tracking active
- [ ] Logging configured
- [ ] Uptime monitoring set up

#### **Documentation**
- [ ] API documentation complete
- [ ] Admin scripts documented
- [ ] Environment variables documented
- [ ] Deployment process documented
- [ ] Troubleshooting guide available

### Post-Launch Monitoring

- [ ] Monitor error rates (Sentry)
- [ ] Monitor API response times
- [ ] Monitor database connection pool
- [ ] Monitor Stripe webhook delivery
- [ ] Monitor user sign-ups
- [ ] Monitor payment success rate

### Rollback Plan

1. **Identify Issues**: Monitor Sentry, logs, user reports
2. **Quick Fix**: Hotfix deployment via Vercel
3. **Rollback**: Revert to previous deployment in Vercel
4. **Database Rollback**: Restore from backup if needed

---

## Troubleshooting

### Common Issues

#### **Database Connection Errors**

```bash
# Check connection string format
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Check Prisma connection
npm run db:studio
```

#### **NextAuth Errors**

- Verify `AUTH_URL` or `NEXTAUTH_URL` matches your domain exactly
- Check `AUTH_SECRET` or `NEXTAUTH_SECRET` is set
- Verify OAuth redirect URIs in Google Console match your production domain

#### **Stripe Webhook Failures**

- Verify `STRIPE_WEBHOOK_SECRET` is correct
- Check webhook endpoint URL in Stripe Dashboard
- Test with Stripe CLI locally first

#### **Build Failures**

- Check Node.js version (18+)
- Verify all dependencies installed
- Check for TypeScript errors: `npm run type-check`
- Review Vercel build logs

#### **Serverless Function Timeouts**

- Increase timeout in `vercel.json`
- Optimize database queries
- Add caching where possible

### Getting Help

1. **Check Logs**: Vercel Dashboard → Deployments → Logs
2. **Check Sentry**: Error tracking and stack traces
3. **Review Documentation**: This guide and README.md
4. **Contact Support**: Vercel support, database provider support

---

## Additional Resources

- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **Vercel Documentation**: https://vercel.com/docs
- **Prisma Migrations**: https://www.prisma.io/docs/guides/migrate
- **Stripe Webhooks**: https://stripe.com/docs/webhooks
- **NextAuth.js**: https://next-auth.js.org/

---

## Support Contacts

- **DevOps Lead**: [Your Contact]
- **Backend Lead**: [Your Contact]
- **Database Admin**: [Your Contact]
- **Stripe Support**: https://support.stripe.com

---

**Last Updated**: [Date]
**Version**: 1.0.0

