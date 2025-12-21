// API route to get user ID from artist profile ID
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/artists/[id]/user
 * Get user ID and display name from artist profile ID
 */
export async function GET(
  req: Request,
  { params }: RouteParams
): Promise<NextResponse<{ userId: string; userName: string | null; displayName: string } | { error: string }>> {
  try {
    const { id } = await params;

    const artist = await prisma.artistProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!artist) {
      return NextResponse.json({ error: 'Artist not found' }, { status: 404 });
    }

    return NextResponse.json({
      userId: artist.userId,
      userName: artist.user.name,
      displayName: artist.displayName,
    });
  } catch (error) {
    console.error('Error fetching artist user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

