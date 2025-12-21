# Frontend Testing Guide - Feed & Post Creation

## Quick Start

1. **Start the dev server** (if not already running):
   ```bash
   npm run dev
   ```

2. **Open the feed page**:
   ```
   http://localhost:3000/feed
   ```

3. **Sign in** (if not already signed in):
   - Navigate to: `http://localhost:3000/api/auth/signin`
   - Use your credentials (Email/Google or Test Credentials)

## Testing Scenarios

### Test 1: View Feed (Latest Mode)

**Steps**:
1. Navigate to `http://localhost:3000/feed`
2. You should see the "Latest" tab selected by default
3. Posts should be displayed in reverse chronological order (newest first)

**Expected Results**:
- ✅ Feed page loads without errors
- ✅ "Latest" tab is active
- ✅ Posts are displayed in cards
- ✅ Each post shows:
  - Author avatar and name
  - Post content
  - Media (if any)
  - Like, comment, and save buttons
  - Timestamp

**Screenshot Checklist**:
- [ ] Feed page renders correctly
- [ ] Posts are visible
- [ ] No console errors

---

### Test 2: View Feed (For You Mode)

**Steps**:
1. Navigate to `http://localhost:3000/feed`
2. Click the "For You" tab
3. Observe the post ordering

**Expected Results**:
- ✅ "For You" tab becomes active
- ✅ Posts are sorted by verification tier:
  - PLATINUM verified artists first
  - Then BLACK, then RED, then NONE
- ✅ Within same tier, newest posts appear first

**Verification**:
- Check that posts with verification badges appear before unverified posts
- Check that within the same verification tier, newer posts appear first

---

### Test 3: Create Post (Artist Only)

**Prerequisites**:
- Must be signed in as an ARTIST
- User must have `role: ARTIST` in database

**Steps**:
1. Navigate to `http://localhost:3000/feed`
2. Click the "Create Post" button (top right)
3. Fill in the post composer:
   - Add text content (optional, max 2000 characters)
   - Click "Add Media" and select image/video/audio files
   - Preview uploaded media
   - Click "Post" button
4. Wait for confirmation

**Expected Results**:
- ✅ "Create Post" button is visible (only for artists)
- ✅ Post composer modal opens
- ✅ Can add text content
- ✅ Can upload media files
- ✅ Media previews appear
- ✅ Can remove media before posting
- ✅ "Post" button is disabled if no content and no media
- ✅ After posting, modal closes
- ✅ New post appears at the top of the feed
- ✅ Post shows your display name and avatar

**Error Cases to Test**:
- Try posting with no content and no media → Should show error
- Try uploading invalid file type → Should show error
- Try uploading file > 50MB → Should show error

---

### Test 4: Post Interactions

**Steps**:
1. View any post in the feed
2. Click the "Like" button (heart icon)
3. Click the "Save" button (bookmark icon)
4. Click the "Comment" button (speech bubble icon)
5. Click on the author's name/avatar

**Expected Results**:
- ✅ Like button toggles and count updates (client-side)
- ✅ Save button toggles and fills (client-side)
- ✅ Comment button shows count (placeholder for now)
- ✅ Clicking author navigates to their profile page

**Note**: Like, save, and comment are currently client-side only. Full functionality requires backend implementation.

---

### Test 5: Feed Pagination

**Steps**:
1. Scroll to the bottom of the feed
2. Click "Load More" button (if available)
3. Verify more posts load

**Expected Results**:
- ✅ "Load More" button appears when there are more posts
- ✅ Clicking it loads additional posts
- ✅ Loading state is shown while fetching
- ✅ New posts are appended to the feed

---

### Test 6: Responsive Design

**Steps**:
1. Open feed page on desktop
2. Resize browser window to mobile size
3. Test on different screen sizes

**Expected Results**:
- ✅ Layout adapts to screen size
- ✅ Post cards are readable on mobile
- ✅ Media displays correctly on all sizes
- ✅ Buttons are accessible on touch devices

---

## Browser Console Checks

Open browser DevTools (F12) and check:

### No Errors
- ✅ No red errors in console
- ✅ No failed network requests (except expected auth redirects)
- ✅ No React warnings

### Network Tab
- ✅ API calls to `/api/feed` return 200
- ✅ API calls to `/api/posts` return 201 when creating posts
- ✅ Requests include session cookies

---

## Common Issues & Solutions

### Issue: "Create Post" button not visible

**Solution**:
- Make sure you're signed in
- Verify your user has `role: ARTIST` in database
- Check browser console for errors

### Issue: Posts not loading

**Solution**:
- Check if you're authenticated (session token valid)
- Check browser console for API errors
- Verify database has posts: `npm run db:studio`

### Issue: "For You" feed not sorted correctly

**Solution**:
- Make sure posts have artists with different verification tiers
- Check server logs for ranking logic execution
- Verify `app/api/feed/route.ts` ranking code is correct

### Issue: Post creation fails

**Solution**:
- Check if you're signed in as ARTIST
- Verify media files are valid (images/videos/audio)
- Check file size (max 50MB)
- Check browser console for error messages

### Issue: Modal doesn't close after posting

**Solution**:
- Check browser console for errors
- Verify API response is successful (201 Created)
- Check `handleCreatePost` function in `app/feed/page.tsx`

---

## Manual Test Checklist

### Feed Display
- [ ] Feed page loads at `/feed`
- [ ] Latest tab shows posts sorted by date (newest first)
- [ ] For You tab shows posts sorted by verification (PLATINUM first)
- [ ] Post cards display correctly with all information
- [ ] Media displays correctly (images, videos, audio)
- [ ] Author information is visible
- [ ] Timestamps are shown

### Post Creation
- [ ] "Create Post" button visible (for artists)
- [ ] Modal opens when clicking "Create Post"
- [ ] Can add text content
- [ ] Can upload media files
- [ ] Media previews work
- [ ] Can remove media before posting
- [ ] Validation prevents posting empty posts
- [ ] Post appears in feed after creation
- [ ] Modal closes after successful post

### Interactions
- [ ] Like button works (client-side)
- [ ] Save button works (client-side)
- [ ] Comment button shows count
- [ ] Clicking author navigates to profile
- [ ] All buttons are accessible

### Pagination
- [ ] "Load More" button appears when needed
- [ ] Clicking "Load More" loads more posts
- [ ] Loading state is shown

---

## Quick Test Commands

### Check if server is running
```bash
curl http://localhost:3000
```

### Check feed API directly
```bash
curl http://localhost:3000/api/feed?mode=latest \
  -H "Cookie: next-auth.session-token=your-token"
```

### Create test post via API (for testing)
```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=your-token" \
  -d '{"content": "Test post", "mediaUrls": ["/mock/test.jpg"], "postType": "IMAGE"}'
```

---

## Expected UI Elements

### Feed Page Header
- ✅ "Feed" title
- ✅ "Create Post" button (artists only)
- ✅ "Latest" and "For You" tabs

### Post Card
- ✅ Author avatar and name
- ✅ Verification badge (if verified)
- ✅ Post content text
- ✅ Media (images/videos/audio)
- ✅ Like button with count
- ✅ Comment button with count
- ✅ Save button
- ✅ Timestamp

### Post Composer Modal
- ✅ Text input area
- ✅ Character counter (X/2000)
- ✅ "Add Media" button
- ✅ Media preview grid
- ✅ Remove media buttons
- ✅ "Cancel" button
- ✅ "Post" button

---

## Testing with Different User Roles

### As Artist
- ✅ Can see "Create Post" button
- ✅ Can create posts
- ✅ Can view feed

### As Client
- ✅ Cannot see "Create Post" button
- ✅ Can view feed
- ✅ Cannot create posts (API will return 403)

---

## Next Steps After Testing

Once frontend testing is complete:

1. **Verify all acceptance criteria**:
   - ✅ Composer creates post visible in feed
   - ✅ ForYou mode orders posts with verified first

2. **Report any issues**:
   - Document bugs or unexpected behavior
   - Note browser/device used
   - Include console errors if any

3. **Test edge cases**:
   - Very long post content
   - Multiple media files
   - Large file uploads
   - Network errors
   - Slow connections

