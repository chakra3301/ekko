// Notification creation helpers
import { prisma } from './prisma';
import { NotificationType } from '@prisma/client';

/**
 * Create a notification
 */
export async function createNotification(params: {
  type: NotificationType;
  targetUserId: string;
  actorId?: string;
  metadata?: Record<string, any>;
}): Promise<void> {
  try {
    await prisma.notification.create({
      data: {
        type: params.type,
        targetUserId: params.targetUserId,
        actorId: params.actorId || null,
        metadata: params.metadata || {},
      },
    });
  } catch (error) {
    // Log error but don't throw - notifications are non-critical
    console.error('Error creating notification:', error);
  }
}

/**
 * Create notification for profile view
 */
export async function notifyProfileView(params: {
  artistId: string;
  viewerId?: string;
}): Promise<void> {
  // Get artist's userId
  const artist = await prisma.artistProfile.findUnique({
    where: { id: params.artistId },
    select: { userId: true },
  });

  if (!artist) return;

  // Only notify if viewer is a different user
  if (params.viewerId && params.viewerId === artist.userId) return;

  await createNotification({
    type: NotificationType.PROFILE_VIEW,
    targetUserId: artist.userId,
    actorId: params.viewerId || undefined,
    metadata: {
      artistId: params.artistId,
    },
  });
}

/**
 * Create notification for new message
 */
export async function notifyMessage(params: {
  receiverId: string;
  senderId: string;
  messageId: string;
}): Promise<void> {
  await createNotification({
    type: NotificationType.MESSAGE,
    targetUserId: params.receiverId,
    actorId: params.senderId,
    metadata: {
      messageId: params.messageId,
    },
  });
}

/**
 * Create notification for like
 */
export async function notifyLike(params: {
  postAuthorId: string;
  likerId: string;
  postId: string;
}): Promise<void> {
  // Don't notify if user liked their own post
  if (params.postAuthorId === params.likerId) return;

  await createNotification({
    type: NotificationType.LIKE,
    targetUserId: params.postAuthorId,
    actorId: params.likerId,
    metadata: {
      postId: params.postId,
    },
  });
}

/**
 * Create notification for comment
 */
export async function notifyComment(params: {
  postAuthorId: string;
  commenterId: string;
  postId: string;
  commentId: string;
}): Promise<void> {
  // Don't notify if user commented on their own post
  if (params.postAuthorId === params.commenterId) return;

  await createNotification({
    type: NotificationType.COMMENT,
    targetUserId: params.postAuthorId,
    actorId: params.commenterId,
    metadata: {
      postId: params.postId,
      commentId: params.commentId,
    },
  });
}

