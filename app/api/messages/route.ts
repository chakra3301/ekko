// API route for creating messages
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';
import { notifyMessage } from '@/lib/notifications';
import type { CreateMessageRequest, MessageResponse } from '@/lib/types/messages';

/**
 * POST /api/messages
 * Create a new message
 * Requires authentication
 * Validates that only artists/clients can message each other
 */
export async function POST(req: Request): Promise<NextResponse<MessageResponse | { error: string }>> {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body: CreateMessageRequest = await req.json();

    // Validation
    if (!body.receiverId) {
      return NextResponse.json({ error: 'Receiver ID is required' }, { status: 400 });
    }

    if (!body.body || body.body.trim().length === 0) {
      return NextResponse.json({ error: 'Message body is required' }, { status: 400 });
    }

    if (body.receiverId === session.user.id) {
      return NextResponse.json({ error: 'Cannot send message to yourself' }, { status: 400 });
    }

    // Get sender and receiver
    const [sender, receiver] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
          artistProfile: { select: { id: true, displayName: true } },
          clientProfile: { select: { id: true, companyName: true } },
        },
      }),
      prisma.user.findUnique({
        where: { id: body.receiverId },
      }),
    ]);

    if (!sender || !receiver) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Validate roles: only artists and clients can message each other
    if (sender.role === receiver.role) {
      return NextResponse.json({ error: 'Cannot message users with the same role' }, { status: 403 });
    }

    if (sender.role !== UserRole.ARTIST && sender.role !== UserRole.CLIENT) {
      return NextResponse.json({ error: 'Only artists and clients can send messages' }, { status: 403 });
    }

    // Check if receiver has blocked sender
    const isBlocked = await prisma.message.findFirst({
      where: {
        senderId: body.receiverId,
        receiverId: session.user.id,
        body: { startsWith: '[BLOCKED]' }, // Simple blocking mechanism
      },
    });

    if (isBlocked) {
      return NextResponse.json({ error: 'User has blocked you' }, { status: 403 });
    }

    // Check if this is the first message between users
    const existingMessages = await prisma.message.findFirst({
      where: {
        OR: [
          { senderId: session.user.id, receiverId: body.receiverId },
          { senderId: body.receiverId, receiverId: session.user.id },
        ],
      },
    });

    // If no existing messages, this is a request
    const isRequest = body.isRequest !== undefined ? body.isRequest : !existingMessages;

    // Create message
    const message = await prisma.message.create({
      data: {
        senderId: session.user.id,
        receiverId: body.receiverId,
        body: body.body.trim(),
        isRequest,
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
    });

    // Create notification (non-blocking)
    notifyMessage({
      receiverId: body.receiverId,
      senderId: session.user.id,
      messageId: message.id,
    }).catch((err) => {
      console.error('Failed to create message notification:', err);
    });

    // Format response
    const response: MessageResponse = {
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
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

