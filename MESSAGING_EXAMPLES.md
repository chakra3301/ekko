# Messaging System - Example Queries

## API Endpoints

### 1. Create Message

```bash
curl -X POST http://localhost:3000/api/messages \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=${SESSION_TOKEN}" \
  -d '{
    "receiverId": "user-id",
    "body": "Hello! I would like to work with you on a project."
  }'
```

**Response (201 Created)**:
```json
{
  "id": "message-id",
  "senderId": "your-user-id",
  "receiverId": "user-id",
  "body": "Hello! I would like to work with you on a project.",
  "isRequest": true,
  "readAt": null,
  "createdAt": "2024-01-01T12:00:00.000Z",
  "sender": {
    "id": "your-user-id",
    "name": "Your Name",
    "email": "your@email.com",
    "artistProfile": {
      "id": "artist-id",
      "displayName": "Your Display Name"
    }
  },
  "receiver": {
    "id": "user-id",
    "name": "Their Name",
    "email": "their@email.com"
  }
}
```

### 2. List Conversations

```bash
curl http://localhost:3000/api/messages/conversations \
  -H "Cookie: next-auth.session-token=${SESSION_TOKEN}"
```

**Response (200 OK)**:
```json
{
  "conversations": [
    {
      "userId": "user-id",
      "userName": "John Doe",
      "userEmail": "john@example.com",
      "userDisplayName": "John Photography",
      "lastMessage": {
        "id": "message-id",
        "body": "Hello!",
        "createdAt": "2024-01-01T12:00:00.000Z",
        "isRequest": false
      },
      "unreadCount": 2,
      "isRequest": false
    }
  ]
}
```

### 3. Get Conversation Messages

```bash
curl "http://localhost:3000/api/messages/conversations/user-id?limit=50" \
  -H "Cookie: next-auth.session-token=${SESSION_TOKEN}"
```

**Response (200 OK)**:
```json
{
  "messages": [
    {
      "id": "message-id",
      "senderId": "user-id",
      "receiverId": "your-user-id",
      "body": "Hello!",
      "isRequest": false,
      "readAt": "2024-01-01T12:05:00.000Z",
      "createdAt": "2024-01-01T12:00:00.000Z",
      "sender": { ... },
      "receiver": { ... }
    }
  ],
  "hasMore": false,
  "nextCursor": null
}
```

**Note**: Messages are automatically marked as read when fetched.

### 4. Block User

```bash
curl -X POST http://localhost:3000/api/messages/block \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=${SESSION_TOKEN}" \
  -d '{"userId": "user-id"}'
```

**Response (200 OK)**:
```json
{
  "success": true
}
```

### 5. Report User

```bash
curl -X POST http://localhost:3000/api/messages/report \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=${SESSION_TOKEN}" \
  -d '{
    "userId": "user-id",
    "reason": "Inappropriate behavior"
  }'
```

**Response (200 OK)**:
```json
{
  "success": true
}
```

### 6. Accept Message Request

```bash
curl -X POST http://localhost:3000/api/messages/requests/message-id/accept \
  -H "Cookie: next-auth.session-token=${SESSION_TOKEN}"
```

**Response (200 OK)**:
```json
{
  "success": true
}
```

### 7. Decline Message Request

```bash
curl -X POST http://localhost:3000/api/messages/requests/message-id/decline \
  -H "Cookie: next-auth.session-token=${SESSION_TOKEN}"
```

**Response (200 OK)**:
```json
{
  "success": true
}
```

## Frontend Usage

### Navigate to Messages

```
http://localhost:3000/messages
```

### Start New Conversation

From artist profile page:
```
http://localhost:3000/messages/new?userId=user-id
```

Or from artist profile:
```
http://localhost:3000/messages/new?artistId=artist-profile-id
```

## Message Request Flow

1. **First Message**:
   - User A sends first message to User B
   - Message is created with `isRequest: true`
   - User B sees request in conversation list

2. **Accept Request**:
   - User B clicks "Accept" button
   - All messages in conversation updated to `isRequest: false`
   - Conversation becomes regular conversation

3. **Decline Request**:
   - User B clicks "Decline" button
   - Request message is deleted
   - Conversation removed from list

## Blocking Flow

1. **Block User**:
   - User A blocks User B via POST /api/messages/block
   - Special `[BLOCKED]` message is created

2. **Attempt to Message**:
   - User B tries to send message to User A
   - API checks for blocking message
   - Returns 403 "User has blocked you"

## Read Tracking

- Messages are marked as read when:
  - GET /api/messages/conversations/[userId] is called
  - Messages sent to the authenticated user are updated with `readAt` timestamp

- Read status is shown in UI:
  - Messages you sent show "✓ Read" if `readAt` is set
  - Unread messages show unread count in sidebar

## Validation Rules

1. **Role Validation**:
   - Only ARTIST and CLIENT roles can send messages
   - Users with same role cannot message each other
   - Artists can only message Clients and vice versa

2. **Blocking**:
   - Blocked users cannot send messages
   - Returns 403 error

3. **Self-Messaging**:
   - Cannot send message to yourself
   - Returns 400 error

4. **Request Auto-Detection**:
   - First message between users is automatically `isRequest: true`
   - Subsequent messages are `isRequest: false`

