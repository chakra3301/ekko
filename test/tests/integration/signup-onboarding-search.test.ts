/**
 * End-to-end integration test
 * Simulates: signup → onboarding → create profile → GET /api/search
 */
import { POST as createOnboarding } from '@/app/api/onboarding/artist/route';
import { GET as searchArtists } from '@/app/api/search/artists/route';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

// Mock auth for search endpoint (search is public, but route might check it)
jest.mock('@/lib/auth');

// Mock dependencies
jest.mock('@/lib/auth');
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
    artistProfile: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

// Mock next-auth for search endpoint
jest.mock('next-auth', () => ({
  auth: jest.fn(),
}));

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('E2E: Signup → Onboarding → Search', () => {
  const userId = 'user-123';
  const artistId = 'artist-123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('completes full flow: signup → onboarding → search', async () => {
    // Step 1: User signs up (simulated by creating user)
    const createdUser = {
      id: userId,
      email: 'artist@example.com',
      role: 'ARTIST',
      profileCompleted: false,
      banned: false,
      name: 'Test Artist',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockPrisma.user.create.mockResolvedValue(createdUser as any);

    // Step 2: User completes onboarding
    mockAuth.mockResolvedValue({
      user: {
        id: userId,
        email: 'artist@example.com',
        role: 'ARTIST',
        profileCompleted: false,
      },
    });

    mockPrisma.user.findUnique.mockResolvedValue({
      ...createdUser,
      artistProfile: null,
      clientProfile: null,
    } as any);

    const createdProfile = {
      id: artistId,
      userId: userId,
      displayName: 'Test Artist',
      bio: 'A talented photographer',
      locationCity: 'New York',
      locationCountry: 'USA',
      disciplines: ['Photography', 'Portrait'],
      tools: ['Photoshop', 'Lightroom'],
      availability: 'OPEN',
      verificationTier: 'NONE',
      profileViews: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockPrisma.artistProfile.create.mockResolvedValue(createdProfile as any);
    mockPrisma.user.update.mockResolvedValue({
      ...createdUser,
      profileCompleted: true,
    } as any);

    const onboardingRequest = new NextRequest(
      'http://localhost:3000/api/onboarding/artist',
      {
        method: 'POST',
        body: JSON.stringify({
          displayName: 'Test Artist',
          disciplines: ['Photography', 'Portrait'],
          tools: ['Photoshop', 'Lightroom'],
          availability: 'OPEN',
          bio: 'A talented photographer',
        }),
      }
    );

    const onboardingResponse = await createOnboarding(onboardingRequest);
    const onboardingData = await onboardingResponse.json();

    expect(onboardingResponse.status).toBe(200);
    expect(onboardingData.success).toBe(true);
    expect(onboardingData.profile.displayName).toBe('Test Artist');

    // Step 3: Search for artists
    // Mock auth for search (search doesn't require auth, but the route might check it)
    mockAuth.mockResolvedValue(null); // Search is public

    mockPrisma.artistProfile.findMany.mockResolvedValue([
      {
        ...createdProfile,
        user: {
          id: userId,
          name: 'Test Artist',
          email: 'artist@example.com',
        },
      },
    ] as any);

    const searchRequest = new NextRequest(
      'http://localhost:3000/api/search/artists?q=Photography&limit=10'
    );

    const searchResponse = await searchArtists(searchRequest);
    const searchData = await searchResponse.json();

    expect(searchResponse.status).toBe(200);
    expect(searchData.artists).toHaveLength(1);
    expect(searchData.artists[0].displayName).toBe('Test Artist');
    expect(searchData.artists[0].disciplines).toContain('Photography');
  });

  it('searches artists by discipline', async () => {
    mockAuth.mockResolvedValue(null); // Search is public

    mockPrisma.artistProfile.findMany.mockResolvedValue([
      {
        id: 'artist-1',
        userId: 'user-1',
        displayName: 'Photographer 1',
        disciplines: ['Photography'],
        tools: [],
        availability: 'OPEN',
        verificationTier: 'NONE',
        profileViews: 0,
        locationCity: null,
        locationCountry: null,
        bio: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          id: 'user-1',
          name: 'Photographer 1',
          email: 'photo1@example.com',
        },
      },
      {
        id: 'artist-2',
        userId: 'user-2',
        displayName: 'Photographer 2',
        disciplines: ['Photography', 'Portrait'],
        tools: [],
        availability: 'OPEN',
        verificationTier: 'RED',
        profileViews: 50,
        locationCity: null,
        locationCountry: null,
        bio: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          id: 'user-2',
          name: 'Photographer 2',
          email: 'photo2@example.com',
        },
      },
    ] as any);

    const searchRequest = new NextRequest(
      'http://localhost:3000/api/search/artists?discipline=Photography'
    );

    const searchResponse = await searchArtists(searchRequest);
    const searchData = await searchResponse.json();

    expect(searchResponse.status).toBe(200);
    expect(searchData.artists.length).toBeGreaterThan(0);
    expect(
      searchData.artists.every((artist: any) =>
        artist.disciplines.includes('Photography')
      )
    ).toBe(true);
  });

  it('searches artists by location', async () => {
    mockAuth.mockResolvedValue(null); // Search is public

    mockPrisma.artistProfile.findMany.mockResolvedValue([
      {
        id: 'artist-3',
        userId: 'user-3',
        displayName: 'NYC Artist',
        disciplines: ['Design'],
        tools: [],
        availability: 'OPEN',
        verificationTier: 'NONE',
        profileViews: 0,
        locationCity: 'New York',
        locationCountry: 'USA',
        bio: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          id: 'user-3',
          name: 'NYC Artist',
          email: 'nyc@example.com',
        },
      },
    ] as any);

    const searchRequest = new NextRequest(
      'http://localhost:3000/api/search/artists?location=New York'
    );

    const searchResponse = await searchArtists(searchRequest);
    const searchData = await searchResponse.json();

    expect(searchResponse.status).toBe(200);
    expect(searchData.artists.length).toBeGreaterThan(0);
    expect(searchData.artists[0].locationCity).toBe('New York');
  });
});

