// Artist onboarding API route
// Creates ArtistProfile and marks user profile as completed
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';
import { validateArtistOnboarding } from '@/lib/validation/onboarding';
import type {
  OnboardingResponse,
  ErrorResponse,
} from '@/lib/types/onboarding';

/**
 * POST /api/onboarding/artist
 * Creates an ArtistProfile for the authenticated user
 * 
 * Request body:
 * {
 *   displayName: string;
 *   disciplines: string[];
 *   tools: string[];
 *   availability: AvailabilityStatus;
 *   bio?: string;
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
      include: { artistProfile: true },
    });

    if (!existingUser) {
      return NextResponse.json<ErrorResponse>(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    if (existingUser.artistProfile) {
      return NextResponse.json<ErrorResponse>(
        { success: false, error: 'Artist profile already exists' },
        { status: 403 }
      );
    }

    // Validate role - user should be ARTIST
    if (existingUser.role !== UserRole.ARTIST) {
      // Update role if needed
      await prisma.user.update({
        where: { id: userId },
        data: { role: UserRole.ARTIST },
      });
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = validateArtistOnboarding(body);

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

    const { displayName, disciplines, tools, availability, bio } = validation.data;

    // Create artist profile in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create ArtistProfile
      const artistProfile = await tx.artistProfile.create({
        data: {
          userId,
          displayName,
          bio: bio || null,
          disciplines,
          tools,
          availability,
        },
      });

      // Update user profileCompleted flag
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { profileCompleted: true },
      });

      return { artistProfile, user: updatedUser };
    });

    return NextResponse.json<OnboardingResponse>(
      {
        success: true,
        profile: {
          id: result.artistProfile.id,
          userId: result.artistProfile.userId,
          displayName: result.artistProfile.displayName,
          bio: result.artistProfile.bio,
          disciplines: result.artistProfile.disciplines,
          tools: result.artistProfile.tools,
          availability: result.artistProfile.availability,
          verificationTier: result.artistProfile.verificationTier,
          profileViews: result.artistProfile.profileViews,
          createdAt: result.artistProfile.createdAt,
          updatedAt: result.artistProfile.updatedAt,
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
    console.error('Error in artist onboarding:', error);

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

