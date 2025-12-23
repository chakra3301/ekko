# Task 7: Messaging System - Implementation Summary

## Overview
Implemented a complete messaging system with message requests, blocking, reporting, and read tracking.

## Backend Implementation

### 1. POST /api/messages
**File**: `app/api/messages/route.ts`

**Features**:
- ✅ Creates messages with senderId from session
- ✅ Validates receiver exists
- ✅ Validates only artists/clients can message each other
- ✅ Checks for blocking
- ✅ Auto-sets `isRequest: true` for first message between users
- ✅ Returns message with sender/receiver info

**Request Body**:
```typescript
{
  receiverId: string;
  body: string;
  isRequest?: boolean; // Optional, auto-set if first message
}
```

### 2. GET /api/messages/conversations
**File**: `app/api/messages/conversations/route.ts`

**Features**:
- ✅ Lists all conversations for authenticated user
- ✅ Returns last message preview
- ✅ Returns unread count per conversation
- ✅ Shows if conversation has pending request
- ✅ Sorted by last message date (most recent first)

**Response**:
```typescript
{
  conversations: [{
    userId: string;
    userName: string | null;
    userEmail: string;
    userDisplayName: string;
    lastMessage: { id, body, createdAt, isRequest } | null;
    unreadCount: number;
    isRequest: boolean;
  }]
}
```

### 3. GET /api/messages/conversations/[userId]
**File**: `app/api/messages/conversations/[userId]/route.ts`

**Features**:
- ✅ Fetches messages in conversation with specific user
- ✅ Pagination with cursor
- ✅ Marks messages as read when fetched
- ✅ Returns messages with sender/receiver info

**Query Parameters**:
- `limit` - Number of messages (default: 50, max: 100)
- `cursor` - Cursor for pagination

### 4. POST /api/messages/block
**File**: `app/api/messages/block/route.ts`

**Features**:
- ✅ Blocks a user (prevents them from messaging you)
- ✅ Implementation: Creates special `[BLOCKED]` message
- ✅ Validates user exists and not blocking self

**Request Body**:
```typescript
{
  userId: string;
}
```

### 5. POST /api/messages/report
**File**: `app/api/messages/report/route.ts`

**Features**:
- ✅ Reports a user for inappropriate behavior
- ✅ Stores report in database (using Message table with `[REPORT]` prefix)
- ✅ Validates reason is provided

**Request Body**:
```typescript
{
  userId: string;
  reason: string;
}
```

### 6. POST /api/messages/requests/[messageId]/accept
**File**: `app/api/messages/requests/[messageId]/accept/route.ts`

**Features**:
- ✅ Accepts a message request
- ✅ Updates all messages in conversation to `isRequest: false`
- ✅ Validates user is receiver and message is a request

### 7. POST /api/messages/requests/[messageId]/decline
**File**: `app/api/messages/requests/[messageId]/decline/route.ts`

**Features**:
- ✅ Declines a message request
- ✅ Deletes the request message
- ✅ Validates user is receiver and message is a request

## Frontend Implementation

### 1. Messages Page
**File**: `app/messages/page.tsx`

**Features**:
- ✅ Sidebar with conversation list
- ✅ Conversation view
- ✅ Empty state when no conversation selected
- ✅ Authentication check

### 2. Conversation Sidebar
**File**: `components/messages/ConversationSidebar.tsx`

**Features**:
- ✅ Lists all conversations
- ✅ Shows unread count badges
- ✅ Shows "Request" badge for pending requests
- ✅ Shows last message preview
- ✅ Auto-refreshes every 30 seconds
- ✅ Click to select conversation

### 3. Conversation View
**File**: `components/messages/ConversationView.tsx`

**Features**:
- ✅ Displays messages in conversation
- ✅ Message input with send button
- ✅ Auto-scroll to bottom
- ✅ Request accept/decline UI
- ✅ Read receipts (✓ Read)
- ✅ Load older messages
- ✅ Disables input when request pending

### 4. New Conversation Page
**File**: `app/messages/new/page.tsx`

**Features**:
- ✅ Starts new conversation with user
- ✅ Supports `?userId=` and `?artistId=` query params
- ✅ Fetches user info and displays conversation view

## Database Interactions

### Message Creation
```typescript
await prisma.message.create({
  data: {
    senderId: session.user.id,
    receiverId: body.receiverId,
    body: body.body.trim(),
    isRequest: isFirstMessage,
  },
});
```

### Read Tracking
```typescript
await prisma.message.updateMany({
  where: {
    id: { in: messageIds },
    receiverId: session.user.id,
    readAt: null,
  },
  data: {
    readAt: new Date(),
  },
});
```

### Blocking Check
```typescript
const isBlocked = await prisma.message.findFirst({
  where: {
    senderId: body.receiverId,
    receiverId: session.user.id,
    body: { startsWith: '[BLOCKED]' },
  },
});
```

## Acceptance Criteria

### ✅ Messages Persist and Show in UI

**Implementation**:
- Messages are stored in database via POST /api/messages
- Messages are fetched via GET /api/messages/conversations/[userId]
- Messages display in ConversationView component
- Messages persist across page refreshes

**Test**:
1. Send a message → Message appears in conversation
2. Refresh page → Message still visible
3. Open conversation in sidebar → Messages load

### ✅ Blocking Prevents Further Messages

**Implementation**:
- POST /api/messages/block creates `[BLOCKED]` message
- POST /api/messages checks for blocking before creating message
- Returns 403 if user is blocked

**Test**:
1. Block a user via POST /api/messages/block
2. Try to send message to blocked user → Returns 403
3. Blocked user cannot send messages to you

### ✅ Message Request Flow Implemented Client-Side

**Implementation**:
- First message between users sets `isRequest: true`
- ConversationView shows accept/decline banner for pending requests
- Accept updates all messages in conversation to `isRequest: false`
- Decline deletes the request message
- Input is disabled while request is pending

**Test**:
1. Send first message to new user → `isRequest: true`
2. Receiver sees accept/decline banner
3. Accept → Messages become regular messages
4. Decline → Request message deleted

## Example Queries

### Create Message
```bash
curl -X POST http://localhost:3000/api/messages \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=${SESSION_TOKEN}" \
  -d '{
    "receiverId": "user-id",
    "body": "Hello! I would like to work with you."
  }'
```

### Get Conversations
```bash
curl http://localhost:3000/api/messages/conversations \
  -H "Cookie: next-auth.session-token=${SESSION_TOKEN}"
```

### Get Conversation Messages
```bash
curl "http://localhost:3000/api/messages/conversations/user-id?limit=50" \
  -H "Cookie: next-auth.session-token=${SESSION_TOKEN}"
```

### Block User
```bash
curl -X POST http://localhost:3000/api/messages/block \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=${SESSION_TOKEN}" \
  -d '{"userId": "user-id"}'
```

### Report User
```bash
curl -X POST http://localhost:3000/api/messages/report \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=${SESSION_TOKEN}" \
  -d '{
    "userId": "user-id",
    "reason": "Inappropriate behavior"
  }'
```

### Accept Request
```bash
curl -X POST http://localhost:3000/api/messages/requests/message-id/accept \
  -H "Cookie: next-auth.session-token=${SESSION_TOKEN}"
```

### Decline Request
```bash
curl -X POST http://localhost:3000/api/messages/requests/message-id/decline \
  -H "Cookie: next-auth.session-token=${SESSION_TOKEN}"
```

## Files Created

### Backend
- `app/api/messages/route.ts` - Create message
- `app/api/messages/conversations/route.ts` - List conversations
- `app/api/messages/conversations/[userId]/route.ts` - Get conversation
- `app/api/messages/block/route.ts` - Block user
- `app/api/messages/report/route.ts` - Report user
- `app/api/messages/requests/[messageId]/accept/route.ts` - Accept request
- `app/api/messages/requests/[messageId]/decline/route.ts` - Decline request
- `app/api/artists/[id]/user/route.ts` - Get user from artist profile

### Frontend
- `app/messages/page.tsx` - Messages page
- `app/messages/new/page.tsx` - New conversation page
- `components/messages/ConversationSidebar.tsx` - Sidebar component
- `components/messages/ConversationView.tsx` - Conversation view component

### Types
- `lib/types/messages.ts` - Type definitions

## Status: ✅ COMPLETE

All acceptance criteria met:
- ✅ Messages persist and show in UI
- ✅ Blocking prevents further messages
- ✅ Message request flow implemented client-side
- ✅ Read tracking with readAt timestamps
- ✅ Validation: only artists/clients message each other

