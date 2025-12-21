# Test Feed Frontend - Browser Method

Since the server is running successfully, the easiest way to test is through the browser!

## Step 1: Sign In

1. **Open browser** and go to:
   ```
   http://localhost:3000/api/auth/signin
   ```

2. **Sign in** with:
   - **Email**: `test@example.com` (or any email)
   - **Name**: `Test Artist` (optional)
   - Click "Sign in with Test Credentials"

3. **Verify you're signed in**:
   - You should be redirected or see a success message
   - Check browser console (F12) - should see session data

## Step 2: Test Feed Page

1. **Navigate to feed**:
   ```
   http://localhost:3000/feed
   ```

2. **What you should see**:
   - ✅ Feed page loads
   - ✅ "Latest" and "For You" tabs
   - ✅ "Create Post" button (if you're an artist)
   - ✅ Posts displayed (if any exist)

## Step 3: Create a Post

1. **Click "Create Post" button**

2. **Fill in the form**:
   - Add text: "My first test post!"
   - Click "Add Media" and select an image file
   - Wait for upload preview

3. **Click "Post"**

4. **Verify**:
   - ✅ Modal closes
   - ✅ New post appears at top of feed
   - ✅ Post shows your display name
   - ✅ Post shows the uploaded image

## Step 4: Test "For You" Tab

1. **Click "For You" tab**

2. **Verify sorting**:
   - ✅ Posts with verification badges appear first
   - ✅ PLATINUM verified posts before BLACK
   - ✅ BLACK before RED
   - ✅ RED before NONE (unverified)

## Step 5: Test Post Interactions

1. **Click like button** (heart icon):
   - ✅ Count increases
   - ✅ Button fills red

2. **Click save button** (bookmark icon):
   - ✅ Button fills yellow

3. **Click author name/avatar**:
   - ✅ Navigates to artist profile page

## Troubleshooting

### "Create Post" button not showing?
- Make sure you're signed in
- Check your user role is ARTIST in database
- Open browser console (F12) and check for errors

### Posts not loading?
- Check browser console for API errors
- Check Network tab - should see `/api/feed` returning 200
- Verify you're authenticated (check Application → Cookies)

### Can't sign in?
- Make sure server is running
- Check terminal for errors
- Try refreshing the page

## Browser DevTools Checks

**Console Tab**:
- ✅ No red errors
- ✅ Session data visible

**Network Tab**:
- ✅ `/api/feed` returns 200
- ✅ `/api/posts` returns 201 when creating
- ✅ Requests include `next-auth.session-token` cookie

**Application Tab**:
- ✅ Cookie `next-auth.session-token` exists
- ✅ Cookie has a value (not empty)

---

**This is the easiest way to test!** Just use the browser instead of curl commands. 🎉

