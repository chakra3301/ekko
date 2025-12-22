// Type definitions for messaging system

export interface CreateMessageRequest {
  receiverId: string;
  body: string;
  isRequest?: boolean; // Set to true for initial contact
}

export interface MessageResponse {
  id: string;
  senderId: string;
  receiverId: string;
  body: string;
  isRequest: boolean;
  readAt: string | null;
  createdAt: string;
  sender: {
    id: string;
    name: string | null;
    email: string;
    artistProfile?: {
      id: string;
      displayName: string;
    } | null;
    clientProfile?: {
      id: string;
      companyName: string;
    } | null;
  };
  receiver: {
    id: string;
    name: string | null;
    email: string;
  };
}

export interface ConversationPreview {
  userId: string;
  userName: string | null;
  userEmail: string;
  userDisplayName: string; // From artistProfile or clientProfile
  lastMessage: {
    id: string;
    body: string;
    createdAt: string;
    isRequest: boolean;
  } | null;
  unreadCount: number;
  isRequest: boolean; // True if latest message is a request
}

export interface ConversationsResponse {
  conversations: ConversationPreview[];
}

export interface ConversationMessagesResponse {
  messages: MessageResponse[];
  hasMore: boolean;
  nextCursor: string | null;
}

export interface BlockUserRequest {
  userId: string;
}

export interface ReportUserRequest {
  userId: string;
  reason: string;
}

