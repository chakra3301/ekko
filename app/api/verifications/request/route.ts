// API route for creating verification requests
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { UserRole, VerificationStatus } from '@prisma/client';
import type { CreateVerificationRequest, VerificationRequestResponse } from '@/lib/types/verification';

/**
 * POST /api/verifications/request
 * Create a verification request
 * Requires authentication and ARTIST role
 */
export async function POST(req: Request): Promise<NextResponse<VerificationRequestResponse | { error: string }>> {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Only artists can request verification
  if (session.user.role !== UserRole.ARTIST) {
    return NextResponse.json({ error: 'Only artists can request verification' }, { status: 403 });
  }

  try {
    const body: CreateVerificationRequest = await req.json();

    // Validation
    if (!body.evidenceUrls || body.evidenceUrls.length === 0) {
      return NextResponse.json({ error: 'At least one evidence URL is required' }, { status: 400 });
    }

    // Get artist profile
    const artistProfile = await prisma.artistProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!artistProfile) {
      return NextResponse.json({ error: 'Artist profile not found' }, { status: 404 });
    }

    // Check if there's already a pending request
    const existingRequest = await prisma.verificationRequest.findFirst({
      where: {
        artistId: artistProfile.id,
        status: VerificationStatus.PENDING,
      },
    });

    if (existingRequest) {
      return NextResponse.json({ error: 'You already have a pending verification request' }, { status: 409 });
    }

    // Create verification request
    const request = await prisma.verificationRequest.create({
      data: {
        artistId: artistProfile.id,
        evidenceUrls: body.evidenceUrls,
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
    });

    // Format response
    const response: VerificationRequestResponse = {
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
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating verification request:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

