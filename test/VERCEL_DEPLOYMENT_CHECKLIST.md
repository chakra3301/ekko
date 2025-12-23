# Vercel Deployment Readiness Checklist

This checklist ensures your EKKO application is ready for deployment on Vercel.

## ✅ Pre-Deployment Checklist

### 1. Configuration Files
- [x] `vercel.json` created with proper serverless function configuration
- [x] `next.config.js` configured correctly
- [x] `package.json` has correct build scripts
- [x] `tsconfig.json` configured properly
- [x] `.env.example` template available (note: actual file is gitignored, use ENV_EXAMPLE.md)

### 2. Environment Variables Setup

**Critical Variables (Must Set in Vercel):**
- [ ] `DATABASE_URL` - Production PostgreSQL connection string
- [ ] `AUTH_URL` or `NEXTAUTH_URL` - Your production domain (e.g., `https://your-app.vercel.app`)
- [ ] `AUTH_SECRET` or `NEXTAUTH_SECRET` - Generated secret (use `openssl rand -base64 32`)

**Authentication (Optional but Recommended):**
- [ ] `GOOGLE_CLIENT_ID` - Google OAuth client ID
- [ ] `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- [ ] `EMAIL_SERVER` - SMTP server configuration
- [ ] `EMAIL_FROM` - Sender email address

**Stripe (If using payments):**
- [ ] `STRIPE_SECRET_KEY` - Stripe production secret key
- [ ] `STRIPE_WEBHOOK_SECRET` - Production webhook signing secret

**Admin:**
- [ ] `ADMIN_SECRET` - Secret for admin endpoints (generate with `openssl rand -base64 32`)

**Storage (Optional):**
- [ ] `STORAGE_PROVIDER` - `local` or `s3`
- [ ] `STORAGE_BUCKET` - S3 bucket name (if using S3)
- [ ] `STORAGE_ENDPOINT` - S3 endpoint URL
- [ ] `STORAGE_ACCESS_KEY_ID` - S3 access key
- [ ] `STORAGE_SECRET_ACCESS_KEY` - S3 secret key
- [ ] `STORAGE_REGION` - S3 region

### 3. Database Setup
- [ ] Production PostgreSQL database created (Supabase, Neon, Railway, etc.)
- [ ] Database connection string obtained
- [ ] Prisma migrations ready (or use `db:push` for initial setup)
- [ ] Database accessible from Vercel's IP ranges

### 4. Code Fixes Applied
- [x] Stripe checkout URLs use `AUTH_URL` or `NEXTAUTH_URL` (not hardcoded localhost)
- [x] NextAuth configuration supports both `AUTH_URL` (v5) and `NEXTAUTH_URL` (v4)
- [x] Serverless function timeout configured (30s in `vercel.json`)

### 5. Build & Dependencies
- [ ] `package.json` includes `postinstall` script: `"postinstall": "prisma generate"`
- [ ] All dependencies are in `dependencies` (not `devDependencies`)
- [ ] Node.js version specified: `"engines": { "node": ">=18.0.0" }`
- [ ] No build errors when running `npm run build` locally

### 6. OAuth & External Services
- [ ] Google OAuth redirect URI added for production domain:
  - `https://your-app.vercel.app/api/auth/callback/google`
- [ ] Stripe webhook endpoint configured:
  - `https://your-app.vercel.app/api/stripe/webhook`
- [ ] Email service configured (if using email auth)

### 7. Security
- [ ] All secrets are in Vercel environment variables (not in code)
- [ ] Admin endpoints protected with `ADMIN_SECRET`
- [ ] Stripe webhook signature verification enabled
- [ ] No hardcoded credentials in code

### 8. Testing
- [ ] Local build succeeds: `npm run build`
- [ ] Type checking passes: `npm run type-check`
- [ ] No linter errors: `npm run lint`
- [ ] Database migrations tested locally

## 🚀 Deployment Steps

### Step 1: Connect Repository to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your Git repository
4. Vercel will auto-detect Next.js

### Step 2: Configure Environment Variables
1. Go to Project → Settings → Environment Variables
2. Add all required variables from the checklist above
3. Set for **Production** environment
4. Optionally set different values for **Preview** (for PR deployments)

### Step 3: Configure Build Settings
Vercel should auto-detect:
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

The `vercel.json` file already configures:
- Serverless function timeout: 30s
- Framework: Next.js

### Step 4: Deploy
1. Push to your main branch (auto-deploys)
2. Or click "Deploy" in Vercel dashboard
3. Monitor build logs for errors

### Step 5: Post-Deployment
1. **Update OAuth Redirect URIs:**
   - Google Cloud Console → Add production callback URL
   - `https://your-app.vercel.app/api/auth/callback/google`

2. **Update Stripe Webhook:**
   - Stripe Dashboard → Webhooks → Add endpoint
   - URL: `https://your-app.vercel.app/api/stripe/webhook`
   - Copy webhook secret to Vercel env vars

3. **Test Critical Paths:**
   - [ ] Homepage loads
   - [ ] Authentication works (sign in)
   - [ ] Database connection works
   - [ ] API routes respond correctly
   - [ ] Stripe checkout works (if configured)

## 🔍 Common Issues & Solutions

### Build Fails: "Prisma Client not generated"
**Solution:** Ensure `postinstall` script is in `package.json`:
```json
"postinstall": "prisma generate"
```

### Build Fails: "Module not found"
**Solution:** Check that all dependencies are in `dependencies`, not `devDependencies`

### Authentication Not Working
**Solution:** 
- Verify `AUTH_URL` or `NEXTAUTH_URL` matches your Vercel domain exactly
- Check `AUTH_SECRET` or `NEXTAUTH_SECRET` is set
- Verify OAuth redirect URIs in Google Console

### Database Connection Errors
**Solution:**
- Verify `DATABASE_URL` is correct
- Check database allows connections from Vercel IPs
- Ensure SSL is enabled if required (`?sslmode=require`)

### Stripe Webhook Fails
**Solution:**
- Verify `STRIPE_WEBHOOK_SECRET` is set in Vercel
- Check webhook URL in Stripe Dashboard matches your domain
- Test with Stripe CLI first: `stripe listen --forward-to https://your-app.vercel.app/api/stripe/webhook`

### Serverless Function Timeout
**Solution:** Already configured in `vercel.json` (30s). Increase if needed:
```json
{
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 60
    }
  }
}
```

## 📋 Environment Variable Reference

See `ENV_EXAMPLE.md` for complete list of environment variables.

**Quick Generate Secrets:**
```bash
# Generate AUTH_SECRET
openssl rand -base64 32

# Generate ADMIN_SECRET
openssl rand -base64 32
```

## ✅ Final Verification

Before marking as "Ready for Production":
- [ ] All environment variables set in Vercel
- [ ] Build succeeds on Vercel
- [ ] Database migrations applied
- [ ] OAuth redirect URIs updated
- [ ] Stripe webhook configured
- [ ] Test authentication flow
- [ ] Test critical API endpoints
- [ ] Check Vercel function logs for errors

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma with Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [NextAuth.js Deployment](https://next-auth.js.org/configuration/options#nextauth_url)

---

**Last Updated:** $(date)
**Status:** ✅ Ready for Deployment

