// API route for rejecting verification requests (admin only)
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { VerificationStatus } from '@prisma/client';
import type { RejectVerificationRequest } from '@/lib/types/verification';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/verifications/[id]/reject
 * Reject a verification request
 * Admin only - protected by ADMIN_SECRET
 * Sets status to REJECTED and stores adminNote
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
    const body: RejectVerificationRequest = await req.json();

    // Validation
    if (!body.adminNote || body.adminNote.trim().length === 0) {
      return NextResponse.json({ error: 'Admin note is required for rejection' }, { status: 400 });
    }

    // Find the verification request
    const request = await prisma.verificationRequest.findUnique({
      where: { id },
    });

    if (!request) {
      return NextResponse.json({ error: 'Verification request not found' }, { status: 404 });
    }

    if (request.status !== VerificationStatus.PENDING) {
      return NextResponse.json({ error: 'Request is not pending' }, { status: 400 });
    }

    // Update verification request
    await prisma.verificationRequest.update({
      where: { id },
      data: {
        status: VerificationStatus.REJECTED,
        reviewedAt: new Date(),
        adminNote: body.adminNote.trim(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error rejecting verification:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

