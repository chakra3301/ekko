// API route for reporting users
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ReportUserRequest } from '@/lib/types/messages';

/**
 * POST /api/messages/report
 * Report a user for inappropriate behavior
 * Stores report in database (using Message table with special format)
 */
export async function POST(req: Request): Promise<NextResponse<{ success: boolean } | { error: string }>> {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body: ReportUserRequest = await req.json();

    if (!body.userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (!body.reason || body.reason.trim().length === 0) {
      return NextResponse.json({ error: 'Reason is required' }, { status: 400 });
    }

    if (body.userId === session.user.id) {
      return NextResponse.json({ error: 'Cannot report yourself' }, { status: 400 });
    }

    // Verify user exists
    const userToReport = await prisma.user.findUnique({
      where: { id: body.userId },
    });

    if (!userToReport) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Store report (using Message table with special format)
    // In production, you'd want a separate Report table
    await prisma.message.create({
      data: {
        senderId: session.user.id,
        receiverId: body.userId,
        body: `[REPORT] ${body.reason.trim()}`,
        isRequest: false,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error reporting user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

