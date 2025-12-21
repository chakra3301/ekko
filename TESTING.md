# Testing Guide: Onboarding API

This guide shows how to test the onboarding endpoints end-to-end and verify database rows.

## Prerequisites

1. **Database Setup**
   ```bash
   # Set DATABASE_URL in .env.local
   DATABASE_URL="postgresql://user:password@localhost:5432/ekko?schema=public"
   
   # Generate Prisma Client
   npm run db:generate
   
   # Push schema to database (dev) or run migrations (prod)
   npm run db:push
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Environment Variables**
   - `NEXTAUTH_URL=http://localhost:3000`
   - `NEXTAUTH_SECRET=<your-secret>`
   - `DATABASE_URL=<your-database-url>`

## Testing Flow

### Step 1: Sign Up via NextAuth

1. **Visit the sign-in page:**
   ```
   http://localhost:3000/api/auth/signin
   ```

2. **Sign in with Email or Google:**
   - Email: Enter your email, check for magic link
   - Google: Click Google button and authorize

3. **Get Session Token:**
   - Open browser DevTools (F12)
   - Go to Application > Cookies
   - Copy the value of `next-auth.session-token`

### Step 2: Test Artist Onboarding

```bash
curl -X POST http://localhost:3000/api/onboarding/artist \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN_HERE" \
  -d '{
    "displayName": "John Doe Photography",
    "disciplines": ["Photography", "Portrait Photography", "Event Photography"],
    "tools": ["Canon EOS R5", "Adobe Lightroom", "Adobe Photoshop"],
    "availability": "OPEN",
    "bio": "Professional photographer with 10+ years of experience."
  }'
```

**Expected Response (201 Created):**
```json
{
  "success": true,
  "profile": {
    "id": "clx...",
    "userId": "clx...",
    "displayName": "John Doe Photography",
    "bio": "Professional photographer with 10+ years of experience.",
    "disciplines": ["Photography", "Portrait Photography", "Event Photography"],
    "tools": ["Canon EOS R5", "Adobe Lightroom", "Adobe Photoshop"],
    "availability": "OPEN",
    "verificationTier": "NONE",
    "profileViews": 0,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "user": {
    "id": "clx...",
    "email": "john@example.com",
    "role": "ARTIST",
    "profileCompleted": true
  }
}
```

### Step 3: Test Client Onboarding

```bash
curl -X POST http://localhost:3000/api/onboarding/client \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN_HERE" \
  -d '{
    "companyName": "Acme Corporation",
    "industryTags": ["Technology", "SaaS", "B2B", "Marketing"]
  }'
```

**Expected Response (201 Created):**
```json
{
  "success": true,
  "profile": {
    "id": "clx...",
    "userId": "clx...",
    "companyName": "Acme Corporation",
    "industryTags": ["Technology", "SaaS", "B2B", "Marketing"],
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "user": {
    "id": "clx...",
    "email": "client@example.com",
    "role": "CLIENT",
    "profileCompleted": true
  }
}
```

## Verify Database Rows

### Option 1: Using Prisma Studio (Recommended)

```bash
npm run db:studio
```

This opens a GUI at `http://localhost:5555` where you can:
- Browse all tables
- See User, ArtistProfile, and ClientProfile records
- Verify `profileCompleted` flag is `true`
- Check relationships

### Option 2: Using Verification Script

```bash
# Install tsx if not already installed
npm install -D tsx

# Run verification script
npx tsx scripts/verify-db.ts
```

This will:
- Count users and profiles
- Show users with completed profiles
- Verify data integrity (profileCompleted flags match profiles)

### Option 3: Using SQL Query

```sql
-- Check users with artist profiles
SELECT 
  u.id,
  u.email,
  u.role,
  u."profileCompleted",
  ap."displayName",
  ap.disciplines,
  ap.availability
FROM users u
LEFT JOIN artist_profiles ap ON u.id = ap."userId"
WHERE u."profileCompleted" = true;

-- Check users with client profiles
SELECT 
  u.id,
  u.email,
  u.role,
  u."profileCompleted",
  cp."companyName",
  cp."industryTags"
FROM users u
LEFT JOIN client_profiles cp ON u.id = cp."userId"
WHERE u."profileCompleted" = true;
```

## Test Status Codes

### Success Cases
- **201 Created**: Profile successfully created
- **200 OK**: (Not used, but valid)

### Error Cases
- **400 Bad Request**: Validation errors
  ```json
  {
    "success": false,
    "error": "Validation failed",
    "details": {
      "errors": ["displayName is required and must be a string"]
    }
  }
  ```

- **401 Unauthorized**: No session token or invalid token
  ```json
  {
    "success": false,
    "error": "Unauthorized"
  }
  ```

- **403 Forbidden**: Profile already exists
  ```json
  {
    "success": false,
    "error": "Artist profile already exists"
  }
  ```

- **404 Not Found**: User not found (shouldn't happen in normal flow)
- **409 Conflict**: Database constraint violation
- **500 Internal Server Error**: Server error

## Automated Testing Script

Run the test script:

```bash
chmod +x scripts/test-onboarding.sh
./scripts/test-onboarding.sh
```

This script tests:
1. Server availability
2. Authentication requirement (401)
3. Validation errors (400)
4. Endpoint accessibility

## Expected Database State After Onboarding

### User Table
```sql
id: cuid()
email: "user@example.com"
name: "User Name" (or null)
role: "ARTIST" or "CLIENT"
profileCompleted: true  ← Should be true after onboarding
createdAt: timestamp
updatedAt: timestamp
```

### ArtistProfile Table (if role = ARTIST)
```sql
id: cuid()
userId: (FK to users.id)
displayName: "John Doe Photography"
bio: "Professional photographer..."
disciplines: ["Photography", "Portrait Photography"]
tools: ["Canon EOS R5", "Adobe Lightroom"]
availability: "OPEN"
verificationTier: "NONE"
profileViews: 0
createdAt: timestamp
updatedAt: timestamp
```

### ClientProfile Table (if role = CLIENT)
```sql
id: cuid()
userId: (FK to users.id)
companyName: "Acme Corporation"
industryTags: ["Technology", "SaaS"]
createdAt: timestamp
updatedAt: timestamp
```

## Troubleshooting

### Issue: "Unauthorized" (401)
- **Solution**: Make sure you have a valid session token from NextAuth sign-in
- Check that `NEXTAUTH_SECRET` is set in `.env.local`

### Issue: "User not found" (404)
- **Solution**: The user must sign in via NextAuth first to create the User record
- The `signIn` callback creates the User record automatically

### Issue: "Profile already exists" (403)
- **Solution**: Each user can only have one profile. Delete existing profile or use a different user

### Issue: Database connection errors
- **Solution**: Verify `DATABASE_URL` is correct and database is running
- Run `npm run db:push` to sync schema

### Issue: Validation errors
- **Solution**: Check the error details in the response
- Ensure all required fields are provided and meet validation rules

## Complete Test Example

```bash
# 1. Start server
npm run dev

# 2. Sign up at http://localhost:3000/api/auth/signin
# 3. Get session token from browser cookies

# 4. Test artist onboarding
curl -v -X POST http://localhost:3000/api/onboarding/artist \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -d '{
    "displayName": "Test Artist",
    "disciplines": ["Photography"],
    "tools": ["Camera"],
    "availability": "OPEN"
  }'

# 5. Verify in database
npm run db:studio
# OR
npx tsx scripts/verify-db.ts
```

## Acceptance Criteria Verification

✅ **End-to-end signup + onboarding works**
- User signs up → User record created
- User calls onboarding → Profile created
- `profileCompleted` set to `true`

✅ **Proper status codes**
- 201 for successful creation
- 400 for validation errors
- 401 for unauthorized
- 403 for duplicate profiles
- 500 for server errors

✅ **Database rows confirmed**
- User row exists with `profileCompleted: true`
- ArtistProfile or ClientProfile row exists
- Foreign key relationship is correct
- Transaction ensures atomicity

