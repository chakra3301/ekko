# Google OAuth Error Fix

## The Issue
The `authError` in the URL indicates that Google OAuth authentication failed. This is usually due to a **redirect URI mismatch**.

## The Problem
Your server is running on **port 3001** (because 3000 was in use), but your Google OAuth app might be configured for:
- `http://localhost:3000/api/auth/callback/google` (wrong port)
- Or your production URL

## The Fix

### Step 1: Update Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Find your OAuth 2.0 Client ID
4. Click **Edit**
5. Under **Authorized redirect URIs**, add:
   ```
   http://localhost:3001/api/auth/callback/google
   ```
6. Also keep your production URL if you have one:
   ```
   https://your-domain.vercel.app/api/auth/callback/google
   ```
7. Click **Save**

### Step 2: Alternative - Use Port 3000
If you want to use port 3000 instead:
1. Stop any process using port 3000
2. Restart your dev server: `npm run dev`
3. Make sure Google OAuth is configured for `http://localhost:3000/api/auth/callback/google`

### Step 3: Test Again
After updating the redirect URI in Google Cloud Console:
1. Wait a few minutes for changes to propagate
2. Try signing in with Google again
3. The error should be resolved

## Common OAuth Errors

### "redirect_uri_mismatch"
- **Cause**: Redirect URI in Google Console doesn't match what NextAuth is using
- **Fix**: Add the exact callback URL to Google Console

### "access_denied"
- **Cause**: User denied permission or OAuth app not approved
- **Fix**: Check OAuth consent screen settings

### "invalid_client"
- **Cause**: Wrong CLIENT_ID or CLIENT_SECRET
- **Fix**: Verify credentials in `.env.local` match Google Console

## Quick Test Without Google OAuth
If you want to test without setting up Google OAuth:
1. Remove or comment out `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` from `.env.local`
2. Restart the server
3. You'll see "Test Credentials" option instead
4. Sign in with: `test@example.com`

## Current Configuration
- **NEXTAUTH_URL**: `http://localhost:3000` (but server is on 3001)
- **Callback URL**: `http://localhost:3001/api/auth/callback/google`
- **Google OAuth**: Configured in `.env.local`

Make sure Google Console has the correct redirect URI!

