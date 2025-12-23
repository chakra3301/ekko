# Task 9: Minimal Analytics + Notifications - Implementation Summary

## Overview
Implemented lightweight analytics tracking for profile views and a notification system for messages, likes, comments, and profile views.

## Database Changes

### New Models

1. **Notification Model**
   - `id`, `type` (PROFILE_VIEW, MESSAGE, LIKE, COMMENT)
   - `actorId` (user who triggered), `targetUserId` (user who receives)
   - `read` boolean, `metadata` JSON
   - Indexes on `targetUserId`, `read`, and `createdAt`

2. **ProfileView Model**
   - `id`, `artistId`, `viewerId` (nullable for anonymous)
   - `createdAt`
   - Indexes on `artistId` and `createdAt`

### Schema Updates
- Added `NotificationType` enum
- Added relations to `User` model
- Added `profileViews` relation to `ArtistProfile`

## Backend Implementation

### 1. POST /api/analytics/profile-view
**File**: `app/api/analytics/profile-view/route.ts`

**Features**:
- ✅ Increments `ArtistProfile.profileViews`
- ✅ Creates `ProfileView` log entry
- ✅ Creates notification for profile view
- ✅ Handles anonymous views (viewerId = null)

**Request Body**:
```typescript
{
  artistId: string;
}
```

### 2. GET /api/notifications
**File**: `app/api/notifications/route.ts`

**Features**:
- ✅ Lists notifications for authenticated user
- ✅ Returns unread count
- ✅ Includes actor info (name, profile)
- ✅ Supports `limit` and `unreadOnly` query params

**Query Parameters**:
- `limit` - Number of notifications (default: 50, max: 100)
- `unreadOnly` - Filter to unread only (default: false)

**Response**:
```typescript
{
  notifications: NotificationResponse[];
  unreadCount: number;
}
```

### 3. POST /api/notifications/[id]/read
**File**: `app/api/notifications/[id]/read/route.ts`

**Features**:
- ✅ Marks specific notification as read
- ✅ Validates notification belongs to user

### 4. POST /api/notifications/read-all
**File**: `app/api/notifications/read-all/route.ts`

**Features**:
- ✅ Marks all notifications for user as read
- ✅ Updates all unread notifications in one query

### 5. Notification Helpers
**File**: `lib/notifications.ts`

**Functions**:
- `createNotification()` - Generic notification creator
- `notifyProfileView()` - Profile view notification
- `notifyMessage()` - Message notification
- `notifyLike()` - Like notification (stub for future)
- `notifyComment()` - Comment notification (stub for future)

**Integration**:
- `notifyMessage()` called in POST /api/messages
- `notifyProfileView()` called in POST /api/analytics/profile-view

## Frontend Implementation

### 1. Profile View Tracker
**File**: `components/analytics/ProfileViewTracker.tsx`

**Features**:
- ✅ Client component that tracks profile views
- ✅ Calls POST /api/analytics/profile-view on mount
- ✅ Non-blocking (doesn't affect page load)

**Usage**:
```tsx
<ProfileViewTracker artistId={id} />
```

### 2. Notification Bell
**File**: `components/notifications/NotificationBell.tsx`

**Features**:
- ✅ Displays bell icon with unread count badge
- ✅ Opens/closes notification panel
- ✅ Auto-refreshes unread count every 30 seconds
- ✅ Shows "9+" for counts > 9

### 3. Notification Panel
**File**: `components/notifications/NotificationPanel.tsx`

**Features**:
- ✅ Lists notifications with actor info
- ✅ Shows notification message based on type
- ✅ Clickable links to relevant content:
  - Profile view → Artist profile
  - Message → Messages page
  - Like/Comment → Feed page
- ✅ Mark as read (individual or all)
- ✅ Time formatting (Just now, 5m ago, etc.)

### 4. Navigation Bar
**File**: `components/layout/NavBar.tsx`

**Features**:
- ✅ Includes NotificationBell component
- ✅ Navigation links (Feed, Search, Messages)
- ✅ Sign in/out buttons
- ✅ Responsive design

**Integration**:
- Added to root layout (`app/layout.tsx`)

## Acceptance Criteria

### ✅ Profile Views Increment and Visible to Artist

**Implementation**:
- POST /api/analytics/profile-view increments `profileViews`
- Creates `ProfileView` log entry
- Profile views displayed on artist profile page (already existed)
- `ProfileViewTracker` component tracks views automatically

**Test**:
1. Visit artist profile page
2. Check `profileViews` counter increments
3. View `ProfileView` entries in database

### ✅ Notifications Appear in UI and Can Be Marked Read

**Implementation**:
- NotificationBell shows unread count
- NotificationPanel displays notifications
- Mark as read (individual or all)
- Links to relevant content

**Test**:
1. Send a message → Notification appears
2. View artist profile → Notification appears
3. Click notification → Marks as read
4. Click "Mark all read" → All marked as read

## Example Queries

### Track Profile View
```bash
curl -X POST http://localhost:3000/api/analytics/profile-view \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=${SESSION_TOKEN}" \
  -d '{"artistId": "artist-id"}'
```

### Get Notifications
```bash
curl http://localhost:3000/api/notifications \
  -H "Cookie: next-auth.session-token=${SESSION_TOKEN}"
```

### Get Unread Only
```bash
curl "http://localhost:3000/api/notifications?unreadOnly=true" \
  -H "Cookie: next-auth.session-token=${SESSION_TOKEN}"
```

### Mark Notification as Read
```bash
curl -X POST http://localhost:3000/api/notifications/notification-id/read \
  -H "Cookie: next-auth.session-token=${SESSION_TOKEN}"
```

### Mark All as Read
```bash
curl -X POST http://localhost:3000/api/notifications/read-all \
  -H "Cookie: next-auth.session-token=${SESSION_TOKEN}"
```

## Files Created

### Backend
- `app/api/analytics/profile-view/route.ts` - Profile view tracking
- `app/api/notifications/route.ts` - List notifications
- `app/api/notifications/[id]/read/route.ts` - Mark as read
- `app/api/notifications/read-all/route.ts` - Mark all as read
- `lib/notifications.ts` - Notification helpers
- `lib/types/notifications.ts` - Type definitions

### Frontend
- `components/analytics/ProfileViewTracker.tsx` - Profile view tracker
- `components/notifications/NotificationBell.tsx` - Bell icon
- `components/notifications/NotificationPanel.tsx` - Notification panel
- `components/layout/NavBar.tsx` - Navigation bar

### Database
- Updated `prisma/schema.prisma` with Notification and ProfileView models

## Database Migration

After updating the schema, run:

```bash
npm run db:push
# or
npx prisma migrate dev --name add_notifications_and_analytics
```

## Notification Types

- **PROFILE_VIEW**: Someone viewed your profile
- **MESSAGE**: Someone sent you a message
- **LIKE**: Someone liked your post (stub for future)
- **COMMENT**: Someone commented on your post (stub for future)

## Status: ✅ COMPLETE

All acceptance criteria met:
- ✅ Profile views increment and visible to artist
- ✅ Notifications appear in UI
- ✅ Notifications can be marked read
- ✅ Notification bell in navigation
- ✅ Links to relevant content

