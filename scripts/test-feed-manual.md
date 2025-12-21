# Manual Feed Testing Guide

## Prerequisites

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Get a session token**:
   - Sign in at `http://localhost:3000/api/auth/signin`
   - Open browser DevTools → Application → Cookies
   - Copy the value of `next-auth.session-token`

3. **Set environment variable**:
   ```bash
   export SESSION_TOKEN='your-session-token-here'
   ```

## Test 1: Create a Post

### Using cURL

```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=${SESSION_TOKEN}" \
  -d '{
    "content": "Test post from curl - '$(date)'",
    "mediaUrls": ["/mock-storage/test-post.jpg"],
    "postType": "IMAGE"
  }'
```

### Expected Response (201 Created)

```json
{
  "id": "post-xxx",
  "authorId": "user-xxx",
  "content": "Test post from curl - ...",
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

## Test 2: Get Latest Feed

### Using cURL

```bash
curl http://localhost:3000/api/feed?mode=latest&limit=5 \
  -H "Cookie: next-auth.session-token=${SESSION_TOKEN}"
```

### Expected Response (200 OK)

```json
{
  "posts": [
    {
      "id": "post-xxx",
      "content": "Test post from curl - ...",
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

### Verification

✅ **Acceptance Criteria**: Created post should appear in Latest feed
- Check that the post ID from Test 1 appears in the posts array
- Posts should be sorted by `createdAt` descending (newest first)

## Test 3: Get For You Feed (Sorted by Verification)

### Using cURL

```bash
curl http://localhost:3000/api/feed?mode=foryou&limit=5 \
  -H "Cookie: next-auth.session-token=${SESSION_TOKEN}"
```

### Expected Response (200 OK)

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
    // ... more posts
  ],
  "hasMore": true
}
```

### Verification

✅ **Acceptance Criteria**: Posts should be ordered with verified first
- Posts with `PLATINUM` verification should appear first
- Then `BLACK`, then `RED`, then `NONE`
- Within the same verification tier, posts should be sorted by `createdAt` (newest first)

## Test 4: Automated Test Script

### Run the test script

```bash
chmod +x scripts/test-feed.sh
SESSION_TOKEN='your-session-token' ./scripts/test-feed.sh
```

The script will:
1. Create a post
2. Verify it appears in Latest feed
3. Check For You feed sorting by verification tier

## Test 5: Frontend Testing

### Test Composer Creates Post Visible in Feed

1. **Navigate to feed page**:
   ```
   http://localhost:3000/feed
   ```

2. **Sign in as an artist** (if not already signed in)

3. **Click "Create Post" button**

4. **Fill in the form**:
   - Add text content (optional)
   - Upload an image file
   - Click "Post"

5. **Verify**:
   - ✅ Post appears at the top of the feed
   - ✅ Post shows your display name and avatar
   - ✅ Post shows the uploaded image
   - ✅ Post has like, comment, and save buttons

### Test For You Mode Orders Posts with Verified First

1. **Navigate to feed page**:
   ```
   http://localhost:3000/feed
   ```

2. **Click "For You" tab**

3. **Verify**:
   - ✅ Posts with PLATINUM verification appear first
   - ✅ Then BLACK, then RED, then NONE
   - ✅ Within same tier, newest posts appear first

## Troubleshooting

### Issue: "Unauthorized" error

**Solution**: Make sure you're signed in and have a valid session token.

### Issue: "Only artists can create posts" error

**Solution**: Make sure your user has `role: ARTIST` in the database.

### Issue: Post doesn't appear in feed

**Solution**: 
- Check that the post was created successfully (check response status)
- Refresh the feed page
- Check browser console for errors

### Issue: For You feed not sorted correctly

**Solution**:
- Make sure you have posts from artists with different verification tiers
- Check the server logs for any errors
- Verify the ranking logic in `app/api/feed/route.ts`

## Database Verification

### Check posts in database

```bash
npm run db:studio
```

Or using Prisma CLI:

```bash
npx prisma db execute --stdin <<< "SELECT id, \"authorId\", content, \"postType\", \"createdAt\" FROM posts ORDER BY \"createdAt\" DESC LIMIT 10;"
```

### Check verification tiers

```bash
npx prisma db execute --stdin <<< "SELECT ap.id, ap.\"displayName\", ap.\"verificationTier\" FROM artist_profiles ap ORDER BY ap.\"verificationTier\" DESC;"
```

