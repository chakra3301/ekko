# Application Testing Checklist

## ✅ Server Status
- **Development server**: Running at http://localhost:3000
- **Database**: Connected to Supabase
- **Status**: Ready for testing

## 🧪 Testing Guide

### 1. Homepage Test
**URL**: http://localhost:3000

**What to check:**
- [ ] Page loads without errors
- [ ] Navigation bar appears at top
- [ ] "EKKO" logo visible
- [ ] "Sign In" button visible
- [ ] "Feed" and "Search" links in navigation

---

### 2. Authentication Test

#### Sign In
**URL**: http://localhost:3000/api/auth/signin

**What to check:**
- [ ] Sign in page loads
- [ ] Available providers are shown (Email, Google, or Test Credentials)
- [ ] Can sign in with configured provider

**Note**: If you haven't set up Email/Google OAuth, you should see a "Test Credentials" option in `lib/nextauth.ts` that allows:
- Email: `test@example.com`
- Password: `password`

#### After Sign In
- [ ] Redirected to appropriate page
- [ ] Navigation shows "Dashboard" and "Sign Out" instead of "Sign In"
- [ ] User session is maintained

---

### 3. Artist Onboarding Test

**URL**: http://localhost:3000/onboard/artist

**Prerequisites**: Must be signed in

**What to test:**
- [ ] 5-step form loads
- [ ] Step 1: Enter display name
- [ ] Step 2: Add disciplines (tags)
- [ ] Step 3: Add bio (optional)
- [ ] Step 4: Add tools (tags)
- [ ] Step 5: Upload portfolio items and set availability
- [ ] Can navigate between steps
- [ ] Form validation works
- [ ] Submit creates artist profile

---

### 4. Feed Page Test

**URL**: http://localhost:3000/feed

**What to test:**

#### Basic Display
- [ ] Page loads without errors
- [ ] "Latest" and "For You" tabs visible
- [ ] Posts display (if any exist)
- [ ] Each post shows:
  - Author avatar and name
  - Post content
  - Media (if any)
  - Like, comment, save buttons
  - Timestamp

#### Create Post (Artist Only)
- [ ] "Create Post" button visible (if signed in as artist)
- [ ] Clicking opens modal
- [ ] Can type text (max 2000 chars)
- [ ] Can upload media (images/videos)
- [ ] Media previews appear
- [ ] Can submit post
- [ ] New post appears in feed

#### Tab Switching
- [ ] "Latest" tab shows posts by date (newest first)
- [ ] "For You" tab shows posts by verification tier (PLATINUM → BLACK → RED → NONE)
- [ ] Tabs highlight correctly when selected

---

### 5. Search Page Test

**URL**: http://localhost:3000/search

**What to test:**
- [ ] Search page loads
- [ ] Search bar visible
- [ ] Filters available:
  - Discipline
  - Location
  - Tools
  - Availability
  - Verification tier
- [ ] Can search for artists
- [ ] Results display in cards
- [ ] Each artist card shows:
  - Avatar
  - Display name
  - Verification badge (if verified)
  - Availability status
  - Disciplines
  - Profile views
- [ ] Can click artist card to view profile

---

### 6. Artist Profile Test

**URL**: http://localhost:3000/artist/[id]

**What to test:**
- [ ] Profile page loads
- [ ] Artist information displayed:
  - Large avatar
  - Display name
  - Location
  - Bio
  - Verification badge
  - Availability status
- [ ] Portfolio grid displays
- [ ] Disciplines and tools shown
- [ ] Profile stats visible (views, portfolio items, member since)
- [ ] "Message Artist" button works

---

### 7. Messages Test

**URL**: http://localhost:3000/messages

**Prerequisites**: Must be signed in

**What to test:**
- [ ] Messages page loads
- [ ] Sidebar shows conversation list
- [ ] Can select a conversation
- [ ] Messages display in conversation view
- [ ] Can send new messages
- [ ] Can start new conversation

**New Conversation**: http://localhost:3000/messages/new?userId=[userId]

---

### 8. Notifications Test

**What to test:**
- [ ] Notification bell appears in navbar (when signed in)
- [ ] Unread count badge shows (if notifications exist)
- [ ] Can click bell to open notification panel
- [ ] Notifications list displays
- [ ] Can mark notifications as read
- [ ] Can mark all as read

---

### 9. Verification Test

**URLs**:
- Apply: http://localhost:3000/verification/apply
- Upgrade: http://localhost:3000/verification/upgrade
- Success: http://localhost:3000/verification/success

**What to test:**
- [ ] Verification pages load
- [ ] Can apply for verification
- [ ] Can upgrade verification tier (requires Stripe)
- [ ] Success page shows after payment

---

## 🔍 Browser Console Checks

Open browser DevTools (F12) and check:

- [ ] No red errors in Console
- [ ] No failed network requests (Network tab)
- [ ] No TypeScript errors
- [ ] No React warnings

## 🐛 Common Issues & Solutions

### "Sign In" not working
- **Check**: `NEXTAUTH_SECRET` is set in `.env.local`
- **Check**: `NEXTAUTH_URL` matches your local URL
- **Solution**: Generate secret: `openssl rand -base64 32`

### Database errors
- **Check**: `DATABASE_URL` is correct in `.env.local`
- **Check**: Supabase database is accessible
- **Solution**: Verify connection string

### Posts/Artists not loading
- **Check**: Browser console for API errors
- **Check**: Network tab for failed requests
- **Check**: User is authenticated
- **Solution**: Check API route logs

### "Create Post" button not showing
- **Check**: User role is `ARTIST` in database
- **Check**: User is signed in
- **Solution**: Complete artist onboarding

## 📊 Database Verification

You can verify data in Supabase:
1. Go to your Supabase project
2. Navigate to **Table Editor**
3. Check tables:
   - `User` - Should have your test user
   - `ArtistProfile` - If you completed onboarding
   - `Post` - If you created posts
   - `Message` - If you sent messages

## 🎯 Quick Test Sequence

1. **Sign In** → http://localhost:3000/api/auth/signin
2. **Complete Artist Onboarding** → http://localhost:3000/onboard/artist
3. **Create a Post** → http://localhost:3000/feed
4. **Search for Artists** → http://localhost:3000/search
5. **View Your Profile** → http://localhost:3000/artist/[your-id]
6. **Send a Message** → http://localhost:3000/messages

## ✅ Success Criteria

Your application is working correctly if:
- ✅ All pages load without errors
- ✅ Authentication works
- ✅ Can create artist profile
- ✅ Can create posts
- ✅ Can search artists
- ✅ Can view profiles
- ✅ No console errors
- ✅ Database operations succeed

---

**Happy Testing!** 🚀

