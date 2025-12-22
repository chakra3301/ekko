// API route for searching artists
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AvailabilityStatus, VerificationTier } from '@prisma/client';
import type { SearchArtistsResponse } from '@/lib/types/search';

// Force dynamic rendering since we use request.url
export const dynamic = 'force-dynamic';

/**
 * GET /api/search/artists?q=&discipline=&location=&tool=&availability=&verification=&limit=&cursor=
 * Search artists with filters and pagination
 * 
 * Query Parameters:
 * - q: Search query (searches displayName and bio)
 * - discipline: Filter by discipline (array containment)
 * - location: Filter by location (city or country)
 * - tool: Filter by tool (array containment)
 * - availability: Filter by availability status
 * - verification: Filter by verification tier
 * - limit: Number of results (default: 20, max: 50)
 * - cursor: Cursor for pagination
 */
export async function GET(req: Request): Promise<NextResponse<SearchArtistsResponse | { error: string }>> {
  try {
    const { searchParams } = new URL(req.url);
    
    // Parse query parameters
    const q = searchParams.get('q') || undefined;
    const discipline = searchParams.get('discipline') || undefined;
    const location = searchParams.get('location') || undefined;
    const tool = searchParams.get('tool') || undefined;
    const availability = searchParams.get('availability') as AvailabilityStatus | null;
    const verification = searchParams.get('verification') as VerificationTier | null;
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 50);
    const cursor = searchParams.get('cursor') || undefined;

    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: Record<string, any> = {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const andConditions: Array<Record<string, any>> = [];

    // Search query (displayName or bio) - OR within this filter
    if (q) {
      andConditions.push({
        OR: [
          { displayName: { contains: q, mode: 'insensitive' } },
          { bio: { contains: q, mode: 'insensitive' } },
        ],
      });
    }

    // Location filter (city or country) - OR within this filter
    if (location) {
      andConditions.push({
        OR: [
          { locationCity: { contains: location, mode: 'insensitive' } },
          { locationCountry: { contains: location, mode: 'insensitive' } },
        ],
      });
    }

    // Discipline filter (PostgreSQL array containment)
    if (discipline) {
      andConditions.push({
        disciplines: {
          has: discipline, // PostgreSQL array containment operator
        },
      });
    }

    // Tool filter (PostgreSQL array containment)
    if (tool) {
      andConditions.push({
        tools: {
          has: tool, // PostgreSQL array containment operator
        },
      });
    }

    // Availability filter
    if (availability && Object.values(AvailabilityStatus).includes(availability)) {
      andConditions.push({
        availability: availability,
      });
    }

    // Verification tier filter
    if (verification && Object.values(VerificationTier).includes(verification)) {
      andConditions.push({
        verificationTier: verification,
      });
    }

    // Combine all conditions with AND
    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    // Fetch artists with pagination
    const artists = await prisma.artistProfile.findMany({
      take: limit + 1, // Fetch one extra to check if there are more
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [
        { verificationTier: 'desc' }, // Verified artists first
        { profileViews: 'desc' }, // Then by popularity
        { createdAt: 'desc' }, // Then by newest
      ],
    });

    const hasMore = artists.length > limit;
    const artistsToReturn = hasMore ? artists.slice(0, limit) : artists;
    const nextCursor = hasMore && artistsToReturn.length > 0 
      ? artistsToReturn[artistsToReturn.length - 1].id 
      : null;

    // Format response
    const response: SearchArtistsResponse = {
      artists: artistsToReturn.map((artist) => ({
        id: artist.id,
        displayName: artist.displayName,
        bio: artist.bio,
        locationCity: artist.locationCity,
        locationCountry: artist.locationCountry,
        disciplines: artist.disciplines,
        tools: artist.tools,
        availability: artist.availability,
        verificationTier: artist.verificationTier,
        profileViews: artist.profileViews,
        user: {
          id: artist.user.id,
          name: artist.user.name,
          email: artist.user.email,
        },
      })),
      hasMore,
      nextCursor,
    };

    return NextResponse.json(response);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error searching artists:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

