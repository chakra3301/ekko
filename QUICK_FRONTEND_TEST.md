# Quick Frontend Test Checklist

## 🚀 Start Testing

1. **Open your browser** and navigate to:
   ```
   http://localhost:3000/feed
   ```

2. **Sign in** (if needed):
   - Go to: `http://localhost:3000/api/auth/signin`
   - Use Test Credentials or your configured provider

## ✅ Quick Test Checklist

### Basic Feed Display
- [ ] Page loads without errors
- [ ] See "Feed" title at top
- [ ] See "Latest" and "For You" tabs
- [ ] Posts are displayed (if any exist in database)
- [ ] No red errors in browser console (F12)

### Create Post (Artist Only)
- [ ] "Create Post" button visible (if you're an artist)
- [ ] Clicking opens modal
- [ ] Can type text in textarea
- [ ] Can click "Add Media" and select files
- [ ] Media previews appear
- [ ] Can click "Post" to submit
- [ ] New post appears in feed after posting

### Tab Switching
- [ ] Click "Latest" tab → posts sorted by date
- [ ] Click "For You" tab → posts sorted by verification tier
- [ ] Tabs highlight correctly when selected

### Post Interactions
- [ ] Click heart icon → like count updates
- [ ] Click bookmark icon → icon fills (saves)
- [ ] Click comment icon → shows count
- [ ] Click author name/avatar → navigates to profile

## 🐛 Common Issues

### "Create Post" button not showing?
- Make sure you're signed in as an ARTIST
- Check browser console for errors
- Verify user role in database

### Posts not loading?
- Check browser console (F12) for errors
- Check Network tab for failed API calls
- Verify you're authenticated

### Modal doesn't open?
- Check browser console for errors
- Make sure you're signed in as an artist

## 📝 What to Test

1. **Create a post**:
   - Add text: "My first post!"
   - Upload an image
   - Click "Post"
   - ✅ Verify it appears at top of feed

2. **Switch to "For You" tab**:
   - ✅ Verify posts are sorted by verification (PLATINUM first)

3. **Interact with posts**:
   - Like a post
   - Save a post
   - Click author to view profile

## 🎯 Acceptance Criteria Check

- ✅ **Composer creates post visible in feed**: 
  - Create a post → Should appear at top of feed

- ✅ **ForYou mode orders posts with verified first**:
  - Switch to "For You" tab → Verified posts should appear first

## 📸 Screenshots to Take

1. Feed page with posts
2. Post composer modal
3. Post after creation (in feed)
4. "For You" tab showing sorted posts

## 🔍 Browser DevTools Checks

Open DevTools (F12) and check:

**Console Tab**:
- ✅ No red errors
- ✅ No React warnings

**Network Tab**:
- ✅ `/api/feed` returns 200
- ✅ `/api/posts` returns 201 when creating
- ✅ Requests include cookies

**Application Tab**:
- ✅ Session cookie is set
- ✅ No storage errors

---

**Ready to test?** Open `http://localhost:3000/feed` in your browser! 🎉

