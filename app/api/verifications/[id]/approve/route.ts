// API route for approving verification requests (admin only)
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { VerificationStatus, VerificationTier } from '@prisma/client';
import type { ApproveVerificationRequest } from '@/lib/types/verification';

// Force dynamic rendering since we use request.url
export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/verifications/[id]/approve
 * Approve a verification request
 * Admin only - protected by ADMIN_SECRET
 * Updates ArtistProfile.verificationTier and sets reviewedAt
 */
export async function POST(
  req: Request,
  { params }: RouteParams
): Promise<NextResponse<{ success: boolean } | { error: string }>> {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check admin secret
  const adminSecret = req.headers.get('x-admin-secret') || new URL(req.url).searchParams.get('adminSecret');
  
  if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body: ApproveVerificationRequest = await req.json();

    // Validation
    if (!body.verificationTier || !Object.values(VerificationTier).includes(body.verificationTier)) {
      return NextResponse.json({ error: 'Invalid verification tier' }, { status: 400 });
    }

    // Find the verification request
    const request = await prisma.verificationRequest.findUnique({
      where: { id },
      include: {
        artist: true,
      },
    });

    if (!request) {
      return NextResponse.json({ error: 'Verification request not found' }, { status: 404 });
    }

    if (request.status !== VerificationStatus.PENDING) {
      return NextResponse.json({ error: 'Request is not pending' }, { status: 400 });
    }

    // Update verification request and artist profile in a transaction
    await prisma.$transaction([
      prisma.verificationRequest.update({
        where: { id },
        data: {
          status: VerificationStatus.APPROVED,
          reviewedAt: new Date(),
          adminNote: body.adminNote || null,
        },
      }),
      prisma.artistProfile.update({
        where: { id: request.artistId },
        data: {
          verificationTier: body.verificationTier,
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error approving verification:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

