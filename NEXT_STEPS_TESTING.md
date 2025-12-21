# Next Steps - Testing the Feed

Great! You're signed in. Now let's test the feed functionality.

## Step 1: Go to Feed Page

Navigate to:
```
http://localhost:3000/feed
```

**What you should see**:
- ✅ Feed page loads
- ✅ "Latest" tab is selected
- ✅ "Create Post" button (if you're an artist)
- ✅ Posts displayed (if any exist in database)

## Step 2: Test Creating a Post

1. **Click "Create Post" button** (top right)

2. **Fill in the post composer**:
   - Type some text: "My first test post!"
   - Click "Add Media" and select an image file
   - Wait for the preview to appear

3. **Click "Post" button**

4. **Verify**:
   - ✅ Modal closes
   - ✅ New post appears at the **top** of the feed
   - ✅ Post shows your display name/avatar
   - ✅ Post shows the uploaded image
   - ✅ Post has like, comment, and save buttons

**This verifies**: ✅ Composer creates post visible in feed

## Step 3: Test "For You" Tab Sorting

1. **Click "For You" tab**

2. **Verify sorting**:
   - ✅ Posts with verification badges appear first
   - ✅ PLATINUM verified posts before BLACK
   - ✅ BLACK before RED  
   - ✅ RED before NONE (unverified)
   - ✅ Within same tier, newest posts first

**This verifies**: ✅ ForYou mode orders posts with verified first

## Step 4: Test Post Interactions

1. **Click the heart icon** (like button):
   - ✅ Count increases
   - ✅ Button fills red

2. **Click the bookmark icon** (save button):
   - ✅ Button fills yellow

3. **Click author name/avatar**:
   - ✅ Navigates to artist profile page

## Step 5: Create Test Data (Optional)

To better test the "For You" sorting, you can create posts from artists with different verification tiers:

1. **In Prisma Studio** (`http://localhost:5555`):
   - Update some artist profiles to have different `verificationTier` values
   - Create posts from those artists
   - Then test the "For You" tab to see sorting

## Acceptance Criteria Checklist

- [ ] **Composer creates post visible in feed**
  - Create a post → Appears at top of feed ✅

- [ ] **ForYou mode orders posts with verified first**
  - Switch to "For You" tab → Verified posts appear first ✅

## Browser DevTools Checks

Open DevTools (F12) and verify:

**Console Tab**:
- ✅ No red errors
- ✅ No React warnings

**Network Tab**:
- ✅ `/api/feed` returns 200
- ✅ `/api/posts` returns 201 when creating
- ✅ Requests include session cookies

**Application Tab**:
- ✅ `next-auth.session-token` cookie exists
- ✅ Cookie has a value

---

**Ready to test!** Go to `http://localhost:3000/feed` and start testing! 🎉

