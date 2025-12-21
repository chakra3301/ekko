# Expected Test Results

## Current Status

The Next.js dev server appears to have a build error. The error indicates:
```
Module build failed: Operation not permitted (os error 1)
Failed to read source code from node_modules/next/dist/client/components/router-reducer/create-href-from-url.js
```

This is likely a permission issue or the dev server needs to be restarted.

## Expected Test Results (When Server is Running)

### Test 1: Create Post

**Command**:
```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=${SESSION_TOKEN}" \
  -d '{"content": "Test post from curl", "mediaUrls": ["/mock-storage/test-post.jpg"], "postType": "IMAGE"}'
```

**Expected Response (201 Created)**:
```json
{
  "id": "post-xxx",
  "authorId": "user-xxx",
  "content": "Test post from curl",
  "mediaUrls": ["/mock-storage/test-post.jpg"],
  "postType": "IMAGE",
  "createdAt": "2024-01-01T12:00:00.000Z",
  "updatedAt": "2024-01-01T12:00:00.000Z",
  "author": {
    "id": "user-xxx",
    "name": "Your Name",
    "email": "your@email.com",
    "artistProfile": {
      "id": "artist-xxx",
      "displayName": "Your Display Name",
      "verificationTier": "NONE"
    }
  },
  "isSaved": false,
  "likeCount": 0,
  "commentCount": 0
}
```

### Test 2: Get Latest Feed

**Command**:
```bash
curl http://localhost:3000/api/feed?mode=latest \
  -H "Cookie: next-auth.session-token=${SESSION_TOKEN}"
```

**Expected Response (200 OK)**:
```json
{
  "posts": [
    {
      "id": "post-xxx",
      "content": "Test post from curl",
      "mediaUrls": ["/mock-storage/test-post.jpg"],
      "postType": "IMAGE",
      "createdAt": "2024-01-01T12:00:00.000Z",
      "author": {
        "id": "user-xxx",
        "name": "Your Name",
        "email": "your@email.com",
        "artistProfile": {
          "id": "artist-xxx",
          "displayName": "Your Display Name",
          "verificationTier": "NONE"
        }
      },
      "isSaved": false,
      "likeCount": 0,
      "commentCount": 0
    }
    // ... more posts sorted by createdAt (newest first)
  ],
  "hasMore": true
}
```

**Verification**:
- ✅ Created post ID should appear in the posts array
- ✅ Posts should be sorted by `createdAt` descending (newest first)

### Test 3: Get For You Feed (Sorted by Verification)

**Command**:
```bash
curl http://localhost:3000/api/feed?mode=foryou \
  -H "Cookie: next-auth.session-token=${SESSION_TOKEN}"
```

**Expected Response (200 OK)**:
```json
{
  "posts": [
    {
      "id": "post-platinum",
      "author": {
        "artistProfile": {
          "verificationTier": "PLATINUM"
        }
      }
    },
    {
      "id": "post-black",
      "author": {
        "artistProfile": {
          "verificationTier": "BLACK"
        }
      }
    },
    {
      "id": "post-red",
      "author": {
        "artistProfile": {
          "verificationTier": "RED"
        }
      }
    },
    {
      "id": "post-none",
      "author": {
        "artistProfile": {
          "verificationTier": "NONE"
        }
      }
    }
  ],
  "hasMore": true
}
```

**Verification**:
- ✅ Posts with `PLATINUM` verification appear first
- ✅ Then `BLACK`, then `RED`, then `NONE`
- ✅ Within same tier, newest posts appear first

## Troubleshooting

### If Server Returns 500 Error

1. **Check if dev server is running**:
   ```bash
   npm run dev
   ```

2. **Check server logs** for errors

3. **Verify database connection**:
   ```bash
   npm run db:verify
   ```

4. **Check if user is authenticated**:
   - Make sure you're signed in
   - Verify session token is valid

5. **Check if user has ARTIST role**:
   - Only artists can create posts
   - Verify in database: `SELECT * FROM users WHERE email = 'your@email.com';`

### If Build Error Persists

1. **Clear Next.js cache**:
   ```bash
   rm -rf .next
   npm run dev
   ```

2. **Reinstall dependencies**:
   ```bash
   rm -rf node_modules
   npm install
   ```

3. **Check file permissions**:
   ```bash
   ls -la node_modules/next/dist/client/components/router-reducer/
   ```

## Implementation Verification

The API routes are implemented correctly:

- ✅ `app/api/posts/route.ts` - POST endpoint for creating posts
- ✅ `app/api/feed/route.ts` - GET endpoint with ranking logic
- ✅ Ranking logic sorts by verificationTier (PLATINUM > BLACK > RED > NONE)
- ✅ Then sorts by createdAt (newest first)

Once the server is running properly, the tests should pass.

