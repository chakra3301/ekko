# How to Get Your Session Token

## Method 1: From Browser (Easiest)

1. **Open your browser** and go to:
   ```
   http://localhost:3000/api/auth/signin
   ```

2. **Sign in** using:
   - Test Credentials (email: any email, name: optional)
   - Or your configured provider

3. **Open Browser DevTools** (F12 or Cmd+Option+I)

4. **Go to Application tab** (Chrome) or **Storage tab** (Firefox)

5. **Click on Cookies** → `http://localhost:3000`

6. **Find the cookie** named `next-auth.session-token`

7. **Copy the Value** - this is your session token

8. **Export it**:
   ```bash
   export SESSION_TOKEN='paste-your-token-here'
   ```

## Method 2: From Browser Console

1. **Sign in** at `http://localhost:3000/api/auth/signin`

2. **Open Browser Console** (F12)

3. **Run this JavaScript**:
   ```javascript
   document.cookie.split('; ').find(row => row.startsWith('next-auth.session-token='))?.split('=')[1]
   ```

4. **Copy the output** and export:
   ```bash
   export SESSION_TOKEN='paste-output-here'
   ```

## Method 3: Using curl to Sign In

```bash
# Sign in and get session token
curl -c cookies.txt -b cookies.txt -X POST http://localhost:3000/api/auth/callback/credentials \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=test@example.com&name=Test User"

# Extract token from cookies file
SESSION_TOKEN=$(grep "next-auth.session-token" cookies.txt | awk '{print $7}')
export SESSION_TOKEN
```

## Verify Token Works

After getting your token, test it:

```bash
# Test session
curl http://localhost:3000/api/auth/session \
  -H "Cookie: next-auth.session-token=${SESSION_TOKEN}"

# Should return your user data, not null
```

## Important Notes

- Session tokens expire (default: 30 days)
- Tokens are specific to your user account
- Make sure you're signed in as an **ARTIST** to create posts
- The token is a JWT - it's long and contains dots (.)

