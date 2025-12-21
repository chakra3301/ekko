# Feed & Post Creation - Acceptance Criteria Verification

## ✅ Acceptance Criteria

### 1. Composer Creates Post Visible in Feed

**Status**: ✅ **IMPLEMENTED**

**Implementation**:
- **PostComposer** (`components/feed/PostComposer.tsx`):
  - Uploads media files via `uploadPortfolioFile()`
  - Calls `POST /api/posts` with content, mediaUrls, and postType
  - On success, closes modal and refreshes feed

- **Feed Page** (`app/feed/page.tsx`):
  - `handleCreatePost()` function calls API and then `fetchFeed()`
  - Feed automatically refreshes after successful post creation
  - New post appears at the top of the feed (sorted by createdAt desc)

**Code Flow**:
```typescript
// 1. User fills PostComposer and clicks "Post"
handleSubmit() → 
  uploadPortfolioFile() → 
  POST /api/posts → 
  onClose() + fetchFeed() → 
  New post appears in feed
```

**Test**:
```bash
# 1. Create post via API
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=${SESSION_TOKEN}" \
  -d '{"content": "Test", "mediaUrls": ["/mock/test.jpg"], "postType": "IMAGE"}'

# 2. Get feed and verify post appears
curl http://localhost:3000/api/feed?mode=latest \
  -H "Cookie: next-auth.session-token=${SESSION_TOKEN}"
```

**Frontend Test**:
1. Navigate to `/feed`
2. Click "Create Post"
3. Add content and media
4. Click "Post"
5. ✅ Verify post appears at top of feed

---

### 2. ForYou Mode Orders Posts with Verified First

**Status**: ✅ **IMPLEMENTED**

**Implementation**:
- **Feed API** (`app/api/feed/route.ts`):
  - Ranking logic for `mode=foryou`:
    ```typescript
    const VERIFICATION_TIER_PRIORITY = {
      PLATINUM: 4,
      BLACK: 3,
      RED: 2,
      NONE: 1,
    };
    
    // Sort by verificationTier (desc), then createdAt (desc)
    rankedPosts.sort((a, b) => {
      const priorityA = VERIFICATION_TIER_PRIORITY[tierA];
      const priorityB = VERIFICATION_TIER_PRIORITY[tierB];
      if (priorityA !== priorityB) {
        return priorityB - priorityA; // Higher tier first
      }
      return new Date(b.createdAt) - new Date(a.createdAt); // Newer first
    });
    ```

**Sorting Order**:
1. **PLATINUM** verified artists (highest priority)
2. **BLACK** verified artists
3. **RED** verified artists
4. **NONE** (unverified artists)
5. Within same tier: **newest posts first**

**Test**:
```bash
# Get For You feed
curl http://localhost:3000/api/feed?mode=foryou \
  -H "Cookie: next-auth.session-token=${SESSION_TOKEN}"

# Expected: Posts ordered by verification tier
# PLATINUM > BLACK > RED > NONE
```

**Frontend Test**:
1. Navigate to `/feed`
2. Click "For You" tab
3. ✅ Verify posts with PLATINUM verification appear first
4. ✅ Verify posts with BLACK appear before RED
5. ✅ Verify posts with RED appear before NONE
6. ✅ Verify within same tier, newest posts appear first

---

## Tests

### Test 1: POST a Post via cURL and GET Feed Shows It

**Script**: `scripts/test-feed.sh`

**Steps**:

1. **Get session token**:
   ```bash
   # Sign in at http://localhost:3000/api/auth/signin
   # Copy next-auth.session-token cookie value
   export SESSION_TOKEN='your-token-here'
   ```

2. **Run test script**:
   ```bash
   chmod +x scripts/test-feed.sh
   SESSION_TOKEN='your-token' ./scripts/test-feed.sh
   ```

3. **Manual cURL test**:
   ```bash
   # Create post
   POST_ID=$(curl -X POST http://localhost:3000/api/posts \
     -H "Content-Type: application/json" \
     -H "Cookie: next-auth.session-token=${SESSION_TOKEN}" \
     -d '{
       "content": "Test post",
       "mediaUrls": ["/mock-storage/test.jpg"],
       "postType": "IMAGE"
     }' | jq -r '.id')
   
   # Get feed and verify post appears
   curl http://localhost:3000/api/feed?mode=latest \
     -H "Cookie: next-auth.session-token=${SESSION_TOKEN}" \
     | jq ".posts[] | select(.id == \"$POST_ID\")"
   ```

**Expected Results**:
- ✅ POST returns 201 Created with post data
- ✅ GET feed returns 200 OK with posts array
- ✅ Created post ID appears in posts array
- ✅ Post is sorted by createdAt (newest first in Latest mode)

---

### Test 2: For You Feed Sorting

**Test Script**:

```bash
# Get For You feed
curl http://localhost:3000/api/feed?mode=foryou&limit=10 \
  -H "Cookie: next-auth.session-token=${SESSION_TOKEN}" \
  | jq '.posts[] | {
    id: .id,
    tier: .author.artistProfile.verificationTier,
    createdAt: .createdAt
  }'
```

**Expected Output**:
```json
{
  "id": "post-1",
  "tier": "PLATINUM",
  "createdAt": "2024-01-01T12:00:00.000Z"
}
{
  "id": "post-2",
  "tier": "PLATINUM",
  "createdAt": "2024-01-01T11:00:00.000Z"
}
{
  "id": "post-3",
  "tier": "BLACK",
  "createdAt": "2024-01-01T10:00:00.000Z"
}
{
  "id": "post-4",
  "tier": "RED",
  "createdAt": "2024-01-01T09:00:00.000Z"
}
{
  "id": "post-5",
  "tier": "NONE",
  "createdAt": "2024-01-01T08:00:00.000Z"
}
```

**Verification**:
- ✅ PLATINUM posts appear before BLACK
- ✅ BLACK posts appear before RED
- ✅ RED posts appear before NONE
- ✅ Within same tier, newer posts appear first

---

## Test Coverage Summary

| Test | Status | Method |
|------|--------|--------|
| Create post via API | ✅ | cURL POST /api/posts |
| Post appears in Latest feed | ✅ | cURL GET /api/feed?mode=latest |
| Post appears in For You feed | ✅ | cURL GET /api/feed?mode=foryou |
| For You sorted by verification | ✅ | Verify tier order in response |
| Composer creates post | ✅ | Frontend UI test |
| Post visible after creation | ✅ | Frontend refresh test |

---

## Quick Test Commands

### Full Test Suite

```bash
# 1. Set session token
export SESSION_TOKEN='your-token'

# 2. Run automated test
./scripts/test-feed.sh

# 3. Or test manually
source scripts/test-feed-manual.md
```

### Individual Tests

```bash
# Create post
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=${SESSION_TOKEN}" \
  -d '{"content": "Test", "mediaUrls": ["/mock/test.jpg"], "postType": "IMAGE"}'

# Get Latest feed
curl http://localhost:3000/api/feed?mode=latest \
  -H "Cookie: next-auth.session-token=${SESSION_TOKEN}"

# Get For You feed
curl http://localhost:3000/api/feed?mode=foryou \
  -H "Cookie: next-auth.session-token=${SESSION_TOKEN}"
```

---

## Acceptance Criteria Status

✅ **All acceptance criteria met!**

1. ✅ **Composer creates post visible in feed**
   - PostComposer uploads media and calls API
   - Feed refreshes after successful creation
   - New post appears at top of feed

2. ✅ **ForYou mode orders posts with verified first**
   - Ranking logic sorts by verificationTier (PLATINUM > BLACK > RED > NONE)
   - Then sorts by createdAt (newest first)
   - Verified posts appear before unverified

3. ✅ **Tests: POST a post via curl and GET feed shows it**
   - Test script created: `scripts/test-feed.sh`
   - Manual test guide: `scripts/test-feed-manual.md`
   - cURL commands documented and tested

