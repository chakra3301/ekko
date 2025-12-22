# Next Steps to Make EKKO Fully Functional

## ✅ Completed
- [x] TypeScript and ESLint errors fixed
- [x] Build passes on Vercel
- [x] Prisma Client generation added to build process

## 🚀 Critical Next Steps (Required for Basic Functionality)

### 1. Database Setup (REQUIRED)

**Option A: Use a Cloud Database (Recommended for Vercel)**
- **Supabase** (Free tier): https://supabase.com
  - Create project → Get connection string
  - Copy `DATABASE_URL` from project settings
- **Neon** (Serverless PostgreSQL): https://neon.tech
  - Create project → Copy connection string
- **Railway**: https://railway.app
  - Create PostgreSQL service → Copy connection string

**Option B: Local Database (For Development)**
```bash
# Using Docker
docker run --name ekko-postgres \
  -e POSTGRES_PASSWORD=yourpassword \
  -e POSTGRES_DB=ekko \
  -p 5432:5432 \
  -d postgres:15

# Connection string:
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/ekko
```

**After Database Setup:**
```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# Or create migration (for production)
npm run db:migrate
```

### 2. Environment Variables Setup (REQUIRED)

**In Vercel:**
1. Go to your project → Settings → Environment Variables
2. Add the following **critical** variables:

#### Minimum Required Variables:
```bash
# Database (from step 1)
DATABASE_URL=postgresql://user:password@host:port/database

# NextAuth (generate with: openssl rand -base64 32)
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-generated-secret-here

# Admin (generate with: openssl rand -base64 32)
ADMIN_SECRET=your-generated-secret-here
```

**Generate Secrets:**
```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate ADMIN_SECRET
openssl rand -base64 32
```

### 3. Authentication Setup (Choose One or Both)

#### Option A: Email Authentication (Recommended for MVP)
1. **Choose an email service:**
   - **SendGrid** (Free tier: 100 emails/day): https://sendgrid.com
   - **Resend** (Free tier: 3,000 emails/month): https://resend.com
   - **AWS SES** (Pay-as-you-go): https://aws.amazon.com/ses
   - **Gmail SMTP** (For testing only)

2. **Get SMTP credentials** and add to Vercel:
```bash
# For SendGrid
EMAIL_SERVER=smtp://apikey:YOUR_API_KEY@smtp.sendgrid.net:587
EMAIL_FROM=noreply@yourdomain.com

# For Resend
EMAIL_SERVER=smtp://resend:YOUR_API_KEY@smtp.resend.com:587
EMAIL_FROM=noreply@yourdomain.com
```

#### Option B: Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. Add authorized redirect URI: `https://your-domain.vercel.app/api/auth/callback/google`
4. Add to Vercel:
```bash
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

### 4. Run Database Migration

After setting up `DATABASE_URL` in Vercel:
1. **Option A: Use Vercel CLI** (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Link to your project
vercel link

# Run migration
vercel env pull .env.local
npm run db:migrate
```

2. **Option B: Use Prisma Studio** (For manual setup)
```bash
# Connect to your production database
DATABASE_URL=your-production-url npm run db:studio
```

3. **Option C: Use a migration script** (See DEPLOYMENT.md)

## 🎯 Optional but Recommended

### 5. Stripe Setup (For Payments)

1. Create account at https://stripe.com
2. Get API keys from Dashboard → Developers → API keys
3. Add to Vercel:
```bash
STRIPE_SECRET_KEY=sk_test_...  # Use sk_live_... for production
STRIPE_WEBHOOK_SECRET=whsec_... # From webhook settings
```

4. **Set up webhook endpoint in Stripe:**
   - URL: `https://your-domain.vercel.app/api/webhooks/stripe`
   - Events to listen: `checkout.session.completed`, `customer.subscription.updated`

### 6. Storage Setup (For File Uploads)

**Option A: Keep Local Storage (Development)**
- No setup needed, but files won't persist on Vercel

**Option B: Use S3-Compatible Storage (Production)**
- **AWS S3**: https://aws.amazon.com/s3
- **DigitalOcean Spaces**: https://www.digitalocean.com/products/spaces
- **Cloudflare R2**: https://www.cloudflare.com/products/r2/

Add to Vercel:
```bash
STORAGE_PROVIDER=s3
STORAGE_BUCKET=your-bucket-name
STORAGE_ENDPOINT=https://s3.amazonaws.com  # Or your provider's endpoint
STORAGE_ACCESS_KEY_ID=your-access-key
STORAGE_SECRET_ACCESS_KEY=your-secret-key
STORAGE_REGION=us-east-1
```

**Note:** S3Storage implementation needs to be completed in `lib/storage.ts` (currently throws error)

### 7. Monitoring & Error Tracking

**Recommended: Sentry**
1. Sign up at https://sentry.io
2. Create Next.js project
3. Add to Vercel:
```bash
SENTRY_DSN=your-sentry-dsn
```

## 📋 Quick Start Checklist

For **minimum viable functionality**, you need:

- [ ] **Database**: Set up PostgreSQL (Supabase/Neon/Railway)
- [ ] **Environment Variables**: Add `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `ADMIN_SECRET` to Vercel
- [ ] **Database Migration**: Run `npm run db:push` or create migration
- [ ] **Authentication**: Set up at least one provider (Email or Google)
- [ ] **Test**: Deploy and test sign-in flow

## 🧪 Testing After Setup

1. **Test Authentication:**
   - Visit `https://your-domain.vercel.app/api/auth/signin`
   - Try signing in with email or Google

2. **Test Onboarding:**
   - Sign in → Complete artist/client onboarding
   - Verify profile creation

3. **Test Core Features:**
   - Create posts
   - Search artists
   - Send messages
   - View feed

## 🔧 Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` format: `postgresql://user:password@host:port/database`
- Check database allows connections from Vercel IPs
- Ensure SSL is enabled if required

### Authentication Not Working
- Verify `NEXTAUTH_URL` matches your domain exactly
- Check `NEXTAUTH_SECRET` is set
- Verify email/Google credentials are correct

### Build Failing
- Check all required environment variables are set
- Verify Prisma Client is generated (should happen automatically via `postinstall`)
- Check Vercel build logs for specific errors

## 📚 Additional Resources

- **Full Deployment Guide**: See `DEPLOYMENT.md`
- **Environment Variables**: See `ENV_EXAMPLE.md`
- **Database Schema**: See `prisma/schema.prisma`
- **API Examples**: See `ONBOARDING_API_EXAMPLES.md`, `MESSAGING_EXAMPLES.md`, etc.

## 🎉 Once Everything is Set Up

Your application will support:
- ✅ User authentication (Email/Google)
- ✅ Artist and Client onboarding
- ✅ Profile management
- ✅ Portfolio uploads
- ✅ Artist search and discovery
- ✅ Messaging system
- ✅ Feed with posts
- ✅ Verification system
- ✅ Stripe payments (if configured)

---

**Priority Order:**
1. Database + Environment Variables (CRITICAL)
2. Authentication Setup (CRITICAL)
3. Database Migration (CRITICAL)
4. Stripe (OPTIONAL - for payments)
5. Storage (OPTIONAL - for file uploads)
6. Monitoring (OPTIONAL - for production)

