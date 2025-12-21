// API route for declining message requests
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ messageId: string }>;
}

/**
 * POST /api/messages/requests/[messageId]/decline
 * Decline a message request (deletes the request message)
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

    // Delete the request message
    await prisma.message.delete({
      where: { id: messageId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error declining request:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

