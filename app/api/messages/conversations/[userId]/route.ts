// API route for fetching conversation messages with a specific user
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ConversationMessagesResponse, MessageResponse } from '@/lib/types/messages';

interface RouteParams {
  params: Promise<{ userId: string }>;
}

/**
 * GET /api/messages/conversations/[userId]?limit=&cursor=
 * Fetch messages in a conversation with a specific user
 * Marks messages as read when fetched
 */
export async function GET(
  req: Request,
  { params }: RouteParams
): Promise<NextResponse<ConversationMessagesResponse | { error: string }>> {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { userId } = await params;
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);
    const cursor = searchParams.get('cursor') || undefined;

    // Verify user exists
    const otherUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!otherUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch messages
    const messages = await prisma.message.findMany({
      take: limit + 1,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      where: {
        OR: [
          { senderId: session.user.id, receiverId: userId },
          { senderId: userId, receiverId: session.user.id },
        ],
      },
      include: {
        sender: {
          include: {
            artistProfile: { select: { id: true, displayName: true } },
            clientProfile: { select: { id: true, companyName: true } },
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const hasMore = messages.length > limit;
    const messagesToReturn = hasMore ? messages.slice(0, limit) : messages;
    const nextCursor = hasMore && messagesToReturn.length > 0
      ? messagesToReturn[messagesToReturn.length - 1].id
      : null;

    // Mark messages as read (messages sent to me)
    await prisma.message.updateMany({
      where: {
        id: { in: messagesToReturn.map((m) => m.id) },
        receiverId: session.user.id,
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });

    // Format response
    const response: ConversationMessagesResponse = {
      messages: messagesToReturn.map((message) => ({
        id: message.id,
        senderId: message.senderId,
        receiverId: message.receiverId,
        body: message.body,
        isRequest: message.isRequest,
        readAt: message.readAt?.toISOString() || null,
        createdAt: message.createdAt.toISOString(),
        sender: {
          id: message.sender.id,
          name: message.sender.name,
          email: message.sender.email,
          artistProfile: message.sender.artistProfile
            ? {
                id: message.sender.artistProfile.id,
                displayName: message.sender.artistProfile.displayName,
              }
            : null,
          clientProfile: message.sender.clientProfile
            ? {
                id: message.sender.clientProfile.id,
                companyName: message.sender.clientProfile.companyName,
              }
            : null,
        },
        receiver: {
          id: message.receiver.id,
          name: message.receiver.name,
          email: message.receiver.email,
        },
      })),
      hasMore,
      nextCursor,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

