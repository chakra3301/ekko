// API route for listing pending verification requests (admin only)
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { VerificationStatus } from '@prisma/client';
import type { PendingVerificationsResponse, VerificationRequestResponse } from '@/lib/types/verification';

/**
 * GET /api/verifications/pending
 * List all pending verification requests
 * Admin only - protected by ADMIN_SECRET environment variable
 */
export async function GET(req: Request): Promise<NextResponse<PendingVerificationsResponse | { error: string }>> {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check admin secret from header or query param
  const adminSecret = req.headers.get('x-admin-secret') || new URL(req.url).searchParams.get('adminSecret');
  
  if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }

  try {
    const requests = await prisma.verificationRequest.findMany({
      where: {
        status: VerificationStatus.PENDING,
      },
      include: {
        artist: {
          select: {
            id: true,
            displayName: true,
            userId: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc', // Oldest first
      },
    });

    // Format response
    const response: PendingVerificationsResponse = {
      requests: requests.map((request) => ({
        id: request.id,
        artistId: request.artistId,
        status: request.status,
        evidenceUrls: request.evidenceUrls,
        adminNote: request.adminNote,
        createdAt: request.createdAt.toISOString(),
        reviewedAt: request.reviewedAt?.toISOString() || null,
        artist: {
          id: request.artist.id,
          displayName: request.artist.displayName,
          userId: request.artist.userId,
        },
      })),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching pending verifications:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

