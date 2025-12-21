// API route for blocking users
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { BlockUserRequest } from '@/lib/types/messages';

/**
 * POST /api/messages/block
 * Block a user (prevents them from messaging you)
 * Implementation: Creates a special message that indicates blocking
 */
export async function POST(req: Request): Promise<NextResponse<{ success: boolean } | { error: string }>> {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body: BlockUserRequest = await req.json();

    if (!body.userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (body.userId === session.user.id) {
      return NextResponse.json({ error: 'Cannot block yourself' }, { status: 400 });
    }

    // Verify user exists
    const userToBlock = await prisma.user.findUnique({
      where: { id: body.userId },
    });

    if (!userToBlock) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if already blocked
    const existingBlock = await prisma.message.findFirst({
      where: {
        senderId: session.user.id,
        receiverId: body.userId,
        body: { startsWith: '[BLOCKED]' },
      },
    });

    if (existingBlock) {
      return NextResponse.json({ error: 'User is already blocked' }, { status: 400 });
    }

    // Create a blocking message (simple implementation)
    // In production, you'd want a separate Block table
    await prisma.message.create({
      data: {
        senderId: session.user.id,
        receiverId: body.userId,
        body: '[BLOCKED]',
        isRequest: false,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error blocking user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

