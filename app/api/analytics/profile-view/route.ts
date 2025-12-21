// API route for tracking profile views
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notifyProfileView } from '@/lib/notifications';

/**
 * POST /api/analytics/profile-view
 * Track a profile view and increment profileViews counter
 * Creates ProfileView log and notification
 */
export async function POST(req: Request): Promise<NextResponse<{ success: boolean } | { error: string }>> {
  try {
    const session = await auth();
    const viewerId = session?.user?.id || null;

    const body = await req.json();
    const { artistId } = body;

    if (!artistId) {
      return NextResponse.json({ error: 'Artist ID is required' }, { status: 400 });
    }

    // Verify artist exists
    const artist = await prisma.artistProfile.findUnique({
      where: { id: artistId },
    });

    if (!artist) {
      return NextResponse.json({ error: 'Artist not found' }, { status: 404 });
    }

    // Increment profile views and create log in a transaction
    await prisma.$transaction([
      // Increment counter
      prisma.artistProfile.update({
        where: { id: artistId },
        data: {
          profileViews: {
            increment: 1,
          },
        },
      }),
      // Create log entry
      prisma.profileView.create({
        data: {
          artistId,
          viewerId,
        },
      }),
    ]);

    // Create notification (non-blocking)
    await notifyProfileView({
      artistId,
      viewerId: viewerId || undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking profile view:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

