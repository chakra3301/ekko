// Type definitions for notifications
import { NotificationType } from '@prisma/client';

export interface NotificationResponse {
  id: string;
  type: NotificationType;
  actorId: string | null;
  targetUserId: string;
  read: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: Record<string, any> | null;
  createdAt: string;
  actor?: {
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
  } | null;
}

export interface NotificationsResponse {
  notifications: NotificationResponse[];
  unreadCount: number;
}

export interface MarkReadRequest {
  notificationIds?: string[]; // If empty, marks all as read
}

