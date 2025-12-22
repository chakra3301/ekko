// API route for listing conversations
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ConversationsResponse, ConversationPreview } from '@/lib/types/messages';

/**
 * GET /api/messages/conversations
 * List all conversations for the authenticated user
 * Returns last message preview and unread count for each conversation
 */
export async function GET(): Promise<NextResponse<ConversationsResponse | { error: string }>> {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get all unique conversation partners
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: session.user.id },
          { receiverId: session.user.id },
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
          include: {
            artistProfile: { select: { id: true, displayName: true } },
            clientProfile: { select: { id: true, companyName: true } },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Group messages by conversation partner
    const conversationMap = new Map<string, {
      userId: string;
      userName: string | null;
      userEmail: string;
      userDisplayName: string;
      messages: typeof messages;
      unreadCount: number;
      isRequest: boolean;
    }>();

    for (const message of messages) {
      // Determine conversation partner
      const partnerId = message.senderId === session.user.id 
        ? message.receiverId 
        : message.senderId;
      
      const partner = message.senderId === session.user.id 
        ? message.receiver 
        : message.sender;

      if (!conversationMap.has(partnerId)) {
        // Get display name from profile
        const displayName = partner.artistProfile?.displayName 
          || partner.clientProfile?.companyName 
          || partner.name 
          || partner.email;

        conversationMap.set(partnerId, {
          userId: partnerId,
          userName: partner.name,
          userEmail: partner.email,
          userDisplayName: displayName,
          messages: [],
          unreadCount: 0,
          isRequest: false,
        });
      }

      const conversation = conversationMap.get(partnerId)!;
      
      // Only add if this is the most recent message for this conversation
      // (since we're iterating in descending order)
      if (conversation.messages.length === 0) {
        conversation.messages.push(message);
      }

      // Count unread messages (messages sent to me that I haven't read)
      if (message.receiverId === session.user.id && !message.readAt) {
        conversation.unreadCount++;
      }

      // Check if latest message is a request (sent to me)
      if (message.receiverId === session.user.id && message.isRequest) {
        conversation.isRequest = true;
      }
    }

    // Format conversations
    const conversations: ConversationPreview[] = Array.from(conversationMap.values()).map((conv) => ({
      userId: conv.userId,
      userName: conv.userName,
      userEmail: conv.userEmail,
      userDisplayName: conv.userDisplayName,
      lastMessage: conv.messages.length > 0 ? {
        id: conv.messages[0].id,
        body: conv.messages[0].body,
        createdAt: conv.messages[0].createdAt.toISOString(),
        isRequest: conv.messages[0].isRequest,
      } : null,
      unreadCount: conv.unreadCount,
      isRequest: conv.isRequest,
    }));

    // Sort by last message date (most recent first)
    conversations.sort((a, b) => {
      if (!a.lastMessage && !b.lastMessage) return 0;
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;
      return new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime();
    });

    const response: ConversationsResponse = {
      conversations,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

