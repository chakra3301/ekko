# Onboarding API Examples

## Prerequisites

1. Set up authentication (sign up via NextAuth)
2. Get a session token/cookie from NextAuth
3. Use the session cookie in your requests

## Artist Onboarding

### Request

```bash
curl -X POST http://localhost:3000/api/onboarding/artist \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "displayName": "John Doe Photography",
    "disciplines": ["Photography", "Portrait Photography", "Event Photography"],
    "tools": ["Canon EOS R5", "Adobe Lightroom", "Adobe Photoshop"],
    "availability": "OPEN",
    "bio": "Professional photographer specializing in portraits and events. 10+ years of experience."
  }'
```

### Success Response (201)

```json
{
  "success": true,
  "profile": {
    "id": "clx1234567890",
    "userId": "clx0987654321",
    "displayName": "John Doe Photography",
    "bio": "Professional photographer specializing in portraits and events. 10+ years of experience.",
    "disciplines": ["Photography", "Portrait Photography", "Event Photography"],
    "tools": ["Canon EOS R5", "Adobe Lightroom", "Adobe Photoshop"],
    "availability": "OPEN",
    "verificationTier": "NONE",
    "profileViews": 0,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "user": {
    "id": "clx0987654321",
    "email": "john@example.com",
    "role": "ARTIST",
    "profileCompleted": true
  }
}
```

### Error Responses

#### Validation Error (400)

```json
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "errors": [
      "displayName is required and must be a string",
      "At least one discipline is required"
    ]
  }
}
```

#### Unauthorized (401)

```json
{
  "success": false,
  "error": "Unauthorized"
}
```

#### Profile Already Exists (403)

```json
{
  "success": false,
  "error": "Artist profile already exists"
}
```

## Client Onboarding

### Request

```bash
curl -X POST http://localhost:3000/api/onboarding/client \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "companyName": "Acme Corporation",
    "industryTags": ["Technology", "SaaS", "B2B", "Marketing"]
  }'
```

### Success Response (201)

```json
{
  "success": true,
  "profile": {
    "id": "clx9876543210",
    "userId": "clx1234567890",
    "companyName": "Acme Corporation",
    "industryTags": ["Technology", "SaaS", "B2B", "Marketing"],
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "user": {
    "id": "clx1234567890",
    "email": "client@example.com",
    "role": "CLIENT",
    "profileCompleted": true
  }
}
```

### Error Responses

Same error format as artist onboarding.

## Testing with NextAuth Session

To get a session token for testing:

1. **Sign up via NextAuth:**
   - Visit `http://localhost:3000/api/auth/signin`
   - Sign in with email or Google
   - Check browser cookies for `next-auth.session-token`

2. **Use the token in curl:**
   ```bash
   # Extract cookie from browser DevTools > Application > Cookies
   # Or use a tool like Postman/Insomnia that handles cookies automatically
   ```

3. **Alternative: Test with authenticated fetch in browser console:**
   ```javascript
   fetch('/api/onboarding/artist', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     credentials: 'include',
     body: JSON.stringify({
       displayName: "Test Artist",
       disciplines: ["Photography"],
       tools: ["Camera"],
       availability: "OPEN"
     })
   }).then(r => r.json()).then(console.log)
   ```

## Validation Rules

### Artist Onboarding
- `displayName`: Required, string, 1-100 characters
- `disciplines`: Required, array of strings, 1-20 items, each non-empty
- `tools`: Required, array of strings, 0-50 items, each non-empty
- `availability`: Required, one of: `OPEN`, `LIMITED`, `CLOSED`
- `bio`: Optional, string, max 2000 characters

### Client Onboarding
- `companyName`: Required, string, 1-200 characters
- `industryTags`: Required, array of strings, 1-30 items, each non-empty

## Database Flow

1. User signs up via NextAuth → `User` record created with `profileCompleted: false`
2. User calls onboarding endpoint → `ArtistProfile` or `ClientProfile` created
3. User's `profileCompleted` flag set to `true`
4. User's `role` updated if needed (ARTIST/CLIENT)

All operations are wrapped in a database transaction to ensure consistency.

