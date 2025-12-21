# Analytics & Notifications - Example Queries

## Analytics API

### Track Profile View

```bash
curl -X POST http://localhost:3000/api/analytics/profile-view \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=${SESSION_TOKEN}" \
  -d '{
    "artistId": "artist-profile-id"
  }'
```

**Response (200 OK)**:
```json
{
  "success": true
}
```

**What it does**:
- Increments `ArtistProfile.profileViews` counter
- Creates `ProfileView` log entry
- Creates notification for profile owner (if viewer is different user)

## Notifications API

### Get Notifications

```bash
curl http://localhost:3000/api/notifications \
  -H "Cookie: next-auth.session-token=${SESSION_TOKEN}"
```

**Response (200 OK)**:
```json
{
  "notifications": [
    {
      "id": "notification-id",
      "type": "MESSAGE",
      "actorId": "user-id",
      "targetUserId": "your-user-id",
      "read": false,
      "metadata": {
        "messageId": "message-id"
      },
      "createdAt": "2024-01-01T12:00:00.000Z",
      "actor": {
        "id": "user-id",
        "name": "John Doe",
        "email": "john@example.com",
        "artistProfile": {
          "id": "artist-id",
          "displayName": "John Photography"
        }
      }
    }
  ],
  "unreadCount": 5
}
```

### Get Unread Only

```bash
curl "http://localhost:3000/api/notifications?unreadOnly=true" \
  -H "Cookie: next-auth.session-token=${SESSION_TOKEN}"
```

### Get Limited Results

```bash
curl "http://localhost:3000/api/notifications?limit=20" \
  -H "Cookie: next-auth.session-token=${SESSION_TOKEN}"
```

### Mark Notification as Read

```bash
curl -X POST http://localhost:3000/api/notifications/notification-id/read \
  -H "Cookie: next-auth.session-token=${SESSION_TOKEN}"
```

**Response (200 OK)**:
```json
{
  "success": true
}
```

### Mark All Notifications as Read

```bash
curl -X POST http://localhost:3000/api/notifications/read-all \
  -H "Cookie: next-auth.session-token=${SESSION_TOKEN}"
```

**Response (200 OK)**:
```json
{
  "success": true
}
```

## Notification Types

### PROFILE_VIEW
Triggered when someone views an artist's profile.

**Metadata**:
```json
{
  "artistId": "artist-profile-id"
}
```

**Link**: `/artist/{artistId}`

### MESSAGE
Triggered when someone sends a message.

**Metadata**:
```json
{
  "messageId": "message-id"
}
```

**Link**: `/messages/new?userId={actorId}`

### LIKE (Future)
Triggered when someone likes a post.

**Metadata**:
```json
{
  "postId": "post-id"
}
```

**Link**: `/feed?post={postId}`

### COMMENT (Future)
Triggered when someone comments on a post.

**Metadata**:
```json
{
  "postId": "post-id",
  "commentId": "comment-id"
}
```

**Link**: `/feed?post={postId}`

## Frontend Usage

### Notification Bell

The notification bell appears in the navigation bar (top right) when signed in.

- Shows unread count badge
- Click to open notification panel
- Auto-refreshes every 30 seconds

### Notification Panel

- Lists all notifications
- Click notification to navigate to relevant content
- "Mark read" button for individual notifications
- "Mark all read" button for all notifications

### Profile View Tracking

Profile views are automatically tracked when visiting an artist profile page.

The `ProfileViewTracker` component:
- Runs client-side (non-blocking)
- Calls `/api/analytics/profile-view` on page load
- Handles errors silently (analytics are non-critical)

## Database Queries

### Check Profile Views

```sql
-- Get profile views count
SELECT profileViews FROM artist_profiles WHERE id = 'artist-id';

-- Get profile view logs
SELECT * FROM profile_views 
WHERE artistId = 'artist-id' 
ORDER BY createdAt DESC 
LIMIT 10;
```

### Check Notifications

```sql
-- Get unread notifications
SELECT * FROM notifications 
WHERE targetUserId = 'user-id' AND read = false 
ORDER BY createdAt DESC;

-- Get notification count
SELECT COUNT(*) FROM notifications 
WHERE targetUserId = 'user-id' AND read = false;
```

## Testing Flow

1. **Profile View**:
   - Visit `/artist/{id}` as User A
   - Check User B (artist owner) receives notification
   - Check `profileViews` counter increments

2. **Message Notification**:
   - User A sends message to User B
   - User B receives notification
   - Click notification → Opens messages page

3. **Mark as Read**:
   - Click notification → Automatically marked as read
   - Or click "Mark all read" → All notifications marked as read
   - Unread count updates in bell icon

## Notes

- **Analytics are non-blocking**: Profile view tracking doesn't block page load
- **Notifications are non-critical**: Failed notification creation is logged but doesn't fail the request
- **Anonymous views**: Profile views from non-authenticated users are tracked (viewerId = null)
- **Self-notifications**: Users don't receive notifications for their own actions (e.g., viewing own profile, liking own post)

