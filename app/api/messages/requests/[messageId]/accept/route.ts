// API route for accepting message requests
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ messageId: string }>;
}

/**
 * POST /api/messages/requests/[messageId]/accept
 * Accept a message request (converts isRequest to false)
 */
export async function POST(
  req: Request,
  { params }: RouteParams
): Promise<NextResponse<{ success: boolean } | { error: string }>> {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { messageId } = await params;

    // Find the message request
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    // Verify user is the receiver
    if (message.receiverId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Verify it's a request
    if (!message.isRequest) {
      return NextResponse.json({ error: 'Message is not a request' }, { status: 400 });
    }

    // Update all messages in this conversation to not be requests
    await prisma.message.updateMany({
      where: {
        OR: [
          { senderId: message.senderId, receiverId: message.receiverId },
          { senderId: message.receiverId, receiverId: message.senderId },
        ],
        isRequest: true,
      },
      data: {
        isRequest: false,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error accepting request:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

