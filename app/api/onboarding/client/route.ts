// Client onboarding API route
// Creates ClientProfile and marks user profile as completed
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';
import { validateClientOnboarding } from '@/lib/validation/onboarding';
import type {
  OnboardingResponse,
  ErrorResponse,
} from '@/lib/types/onboarding';

/**
 * POST /api/onboarding/client
 * Creates a ClientProfile for the authenticated user
 * 
 * Request body:
 * {
 *   companyName: string;
 *   industryTags: string[];
 * }
 * 
 * Response:
 * - 200: Success with profile data
 * - 400: Validation error
 * - 401: Unauthorized
 * - 403: User already has profile or wrong role
 * - 500: Server error
 */
export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json<ErrorResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Check if user already has a profile
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { clientProfile: true },
    });

    if (!existingUser) {
      return NextResponse.json<ErrorResponse>(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    if (existingUser.clientProfile) {
      return NextResponse.json<ErrorResponse>(
        { success: false, error: 'Client profile already exists' },
        { status: 403 }
      );
    }

    // Validate role - user should be CLIENT
    if (existingUser.role !== UserRole.CLIENT) {
      // Update role if needed
      await prisma.user.update({
        where: { id: userId },
        data: { role: UserRole.CLIENT },
      });
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = validateClientOnboarding(body);

    if (!validation.valid) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: 'Validation failed',
          details: {
            errors: validation.errors,
          },
        },
        { status: 400 }
      );
    }

    const { companyName, industryTags } = validation.data;

    // Create client profile in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create ClientProfile
      const clientProfile = await tx.clientProfile.create({
        data: {
          userId,
          companyName,
          industryTags,
        },
      });

      // Update user profileCompleted flag
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { profileCompleted: true },
      });

      return { clientProfile, user: updatedUser };
    });

    return NextResponse.json<OnboardingResponse>(
      {
        success: true,
        profile: {
          id: result.clientProfile.id,
          userId: result.clientProfile.userId,
          companyName: result.clientProfile.companyName,
          industryTags: result.clientProfile.industryTags,
          createdAt: result.clientProfile.createdAt,
          updatedAt: result.clientProfile.updatedAt,
        },
        user: {
          id: result.user.id,
          email: result.user.email,
          role: result.user.role,
          profileCompleted: result.user.profileCompleted,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error in client onboarding:', error);

    // Handle Prisma errors
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'P2002') {
        return NextResponse.json<ErrorResponse>(
          { success: false, error: 'Profile already exists for this user' },
          { status: 409 }
        );
      }
    }

    return NextResponse.json<ErrorResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

