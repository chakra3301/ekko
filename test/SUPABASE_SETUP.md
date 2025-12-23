# Supabase Setup Guide

## Quick Steps

1. **Get your Supabase connection string:**
   - Go to https://supabase.com
   - Create/select your project
   - Go to **Settings** → **Database**
   - Under **Connection string**, select **URI**
   - Copy the connection string (it includes your password)

2. **Update `.env.local`:**
   ```bash
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
   ```

3. **Important:** Replace `[YOUR-PASSWORD]` with your actual database password
   - If you don't know it, go to **Settings** → **Database** → **Database password**
   - You can reset it if needed

4. **Run database commands:**
   ```bash
   npm run db:generate
   npm run db:push
   ```

## Supabase Connection String Format

```
postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

**Example:**
```
postgresql://postgres:yourpassword123@db.abcdefghijklmnop.supabase.co:5432/postgres
```

## SSL Connection (Recommended for Production)

Supabase requires SSL. Add `?sslmode=require` to your connection string:

```
postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require
```

## Pooling Connection (For Serverless/Vercel)

For better performance on Vercel, use the connection pooler:

```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

Port `6543` is for connection pooling, port `5432` is direct connection.

## Next Steps

After setting up DATABASE_URL:

1. **Generate Prisma Client:**
   ```bash
   npm run db:generate
   ```

2. **Push schema to Supabase:**
   ```bash
   npm run db:push
   ```

3. **Verify in Supabase Dashboard:**
   - Go to **Table Editor** in Supabase
   - You should see all your tables created

4. **Add to Vercel:**
   - Copy your DATABASE_URL
   - Go to Vercel → Your Project → Settings → Environment Variables
   - Add `DATABASE_URL` for Production, Preview, and Development

## Troubleshooting

### Connection Refused
- Check if your IP is allowed (Supabase allows all IPs by default)
- Verify the connection string format
- Make sure you're using the correct password

### SSL Required
- Add `?sslmode=require` to connection string
- Or use connection pooler (port 6543)

### Schema Push Fails
- Check Supabase logs in Dashboard
- Verify Prisma schema syntax
- Make sure DATABASE_URL is correct

