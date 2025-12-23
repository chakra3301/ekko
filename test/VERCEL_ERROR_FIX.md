# Fixing 500 Errors on Vercel Deployment

## Common 500 Errors

If you're seeing 500 errors on `/api/feed` or `/api/search/artists`, it's most likely due to missing environment variables or database connection issues.

## Quick Fix Checklist

### 1. Check Environment Variables in Vercel

Go to your Vercel project → **Settings** → **Environment Variables** and ensure these are set:

#### **CRITICAL - Must Have:**
- ✅ `DATABASE_URL` - Your PostgreSQL connection string
  - Format: `postgresql://user:password@host:port/database?sslmode=require`
  - Get from: Supabase, Neon, Railway, or your database provider

- ✅ `AUTH_URL` or `NEXTAUTH_URL` - Your production domain
  - Example: `https://ekko-ten.vercel.app`
  - **Important:** Must match your Vercel deployment URL exactly

- ✅ `AUTH_SECRET` or `NEXTAUTH_SECRET` - Generated secret
  - Generate: `openssl rand -base64 32`
  - **Important:** Must be set for authentication to work

### 2. Verify Database Connection

**Test your DATABASE_URL:**
```bash
# Test connection locally first
psql "your-database-url-here" -c "SELECT 1"
```

**Common Database Issues:**
- ❌ Missing `?sslmode=require` (required for most cloud databases)
- ❌ Wrong credentials
- ❌ Database not accessible from Vercel's IP ranges
- ❌ Database not created yet

### 3. Check Prisma Migrations

Your database schema must be applied. In Vercel, Prisma Client is generated automatically via the `postinstall` script, but you need to ensure:

1. **Database tables exist** - Run migrations locally or use `prisma db push`:
   ```bash
   # Set DATABASE_URL to your production database
   export DATABASE_URL="your-production-database-url"
   npx prisma db push
   ```

2. **Or use migrations:**
   ```bash
   npx prisma migrate deploy
   ```

### 4. Check Vercel Build Logs

1. Go to Vercel Dashboard → Your Project → **Deployments**
2. Click on the latest deployment
3. Check **Build Logs** for errors like:
   - `DATABASE_URL is not set`
   - `Prisma Client not generated`
   - `Can't reach database server`

### 5. Check Vercel Function Logs

1. Go to Vercel Dashboard → Your Project → **Deployments**
2. Click on the latest deployment
3. Click **Functions** tab
4. Click on `/api/feed` or `/api/search/artists`
5. Check **Logs** for specific error messages

## Step-by-Step Fix

### Step 1: Set DATABASE_URL

1. Get your database connection string from your provider:
   - **Supabase**: Settings → Database → Connection string
   - **Neon**: Dashboard → Connection string
   - **Railway**: Service → Variables → DATABASE_URL

2. In Vercel:
   - Go to **Settings** → **Environment Variables**
   - Add `DATABASE_URL` with your connection string
   - Select **Production** environment
   - Click **Save**

3. **Redeploy** your application (Vercel will auto-deploy on env var changes, or click "Redeploy")

### Step 2: Set AUTH_URL

1. In Vercel:
   - Go to **Settings** → **Environment Variables**
   - Add `AUTH_URL` with your Vercel domain:
     - `https://ekko-ten.vercel.app` (or your custom domain)
   - Select **Production** environment
   - Click **Save**

2. **Redeploy**

### Step 3: Set AUTH_SECRET

1. Generate a secret:
   ```bash
   openssl rand -base64 32
   ```

2. In Vercel:
   - Go to **Settings** → **Environment Variables**
   - Add `AUTH_SECRET` with the generated value
   - Select **Production** environment
   - Click **Save**

3. **Redeploy**

### Step 4: Apply Database Schema

**Option A: Using Prisma Migrate (Recommended)**
```bash
# Set your production DATABASE_URL
export DATABASE_URL="your-production-database-url"

# Create and apply migration
npx prisma migrate deploy
```

**Option B: Using Prisma Push (Quick, for development)**
```bash
# Set your production DATABASE_URL
export DATABASE_URL="your-production-database-url"

# Push schema to database
npx prisma db push
```

**Option C: Using Supabase/Neon Dashboard**
- Use the SQL editor to run the schema manually
- Or use Prisma Studio: `npx prisma studio` (with DATABASE_URL set)

### Step 5: Verify

1. **Check Vercel Logs:**
   - Go to Deployments → Latest → Functions → `/api/feed` → Logs
   - Should see successful requests, not errors

2. **Test API Endpoints:**
   ```bash
   # Test feed endpoint
   curl https://ekko-ten.vercel.app/api/feed?mode=latest&limit=20
   
   # Test search endpoint
   curl https://ekko-ten.vercel.app/api/search/artists?limit=20
   ```

3. **Check Browser Console:**
   - Open your app in browser
   - Open DevTools → Network tab
   - Should see 200 responses, not 500

## Common Error Messages & Solutions

### "Database connection failed"
**Solution:** 
- Check `DATABASE_URL` is set in Vercel
- Verify connection string format
- Ensure database is accessible (not blocked by firewall)

### "PrismaClient is not configured"
**Solution:**
- Check build logs for Prisma Client generation errors
- Ensure `postinstall: prisma generate` is in `package.json` ✅ (already set)

### "Can't reach database server"
**Solution:**
- Check database is running
- Verify connection string is correct
- Check if database allows connections from Vercel IPs
- For Supabase/Neon: Check connection pooling settings

### "Table does not exist"
**Solution:**
- Run Prisma migrations: `npx prisma migrate deploy`
- Or push schema: `npx prisma db push`

## Still Having Issues?

1. **Check Vercel Function Logs:**
   - More detailed error messages are now logged
   - Look for specific Prisma error codes (P1001, P1003, etc.)

2. **Test Database Connection Locally:**
   ```bash
   # Set production DATABASE_URL
   export DATABASE_URL="your-production-database-url"
   
   # Test connection
   npx prisma db pull
   ```

3. **Verify Environment Variables:**
   - In Vercel, double-check all variables are set for **Production**
   - Check for typos in variable names
   - Ensure no extra spaces in values

4. **Check Database Provider Status:**
   - Supabase: https://status.supabase.com
   - Neon: Check their status page
   - Railway: Check their status page

## Quick Test Script

After setting environment variables, test locally:

```bash
# Set production DATABASE_URL
export DATABASE_URL="your-production-database-url"

# Test Prisma connection
npx prisma db pull

# If successful, test API locally
npm run dev
# Then visit: http://localhost:3000/api/feed?mode=latest&limit=20
```

---

**Most Common Issue:** Missing `DATABASE_URL` environment variable in Vercel.

**Quick Fix:** Add `DATABASE_URL` to Vercel environment variables and redeploy.

