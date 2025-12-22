// API route for fetching notifications
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { NotificationsResponse } from '@/lib/types/notifications';

/**
 * GET /api/notifications
 * List notifications for the authenticated user
 * Returns notifications with actor info and unread count
 */
export async function GET(req: Request): Promise<NextResponse<NotificationsResponse | { error: string }>> {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    const where: {
      targetUserId: string;
      read?: boolean;
    } = {
      targetUserId: session.user.id,
    };

    if (unreadOnly) {
      where.read = false;
    }

    // Fetch notifications
    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        include: {
          actor: {
            include: {
              artistProfile: {
                select: { id: true, displayName: true },
              },
              clientProfile: {
                select: { id: true, companyName: true },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
      }),
      prisma.notification.count({
        where: {
          targetUserId: session.user.id,
          read: false,
        },
      }),
    ]);

    // Format response
    const response: NotificationsResponse = {
      notifications: notifications.map((notification) => ({
        id: notification.id,
        type: notification.type,
        actorId: notification.actorId,
        targetUserId: notification.targetUserId,
        read: notification.read,
        metadata: notification.metadata as Record<string, unknown> | null,
        createdAt: notification.createdAt.toISOString(),
        actor: notification.actor
          ? {
              id: notification.actor.id,
              name: notification.actor.name,
              email: notification.actor.email,
              artistProfile: notification.actor.artistProfile
                ? {
                    id: notification.actor.artistProfile.id,
                    displayName: notification.actor.artistProfile.displayName,
                  }
                : null,
              clientProfile: notification.actor.clientProfile
                ? {
                    id: notification.actor.clientProfile.id,
                    companyName: notification.actor.clientProfile.companyName,
                  }
                : null,
            }
          : null,
      })),
      unreadCount,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

