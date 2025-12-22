/**
 * API integration tests for /api/onboarding/artist
 * Tests with mocked Prisma client
 */
import { POST } from '../route';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

// Mock dependencies
jest.mock('@/lib/auth');
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    artistProfile: {
      create: jest.fn(),
    },
  },
}));

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('POST /api/onboarding/artist', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 if user is not authenticated', async () => {
    mockAuth.mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/onboarding/artist', {
      method: 'POST',
      body: JSON.stringify({
        displayName: 'Test Artist',
        disciplines: ['Photography'],
        tools: ['Photoshop'],
        availability: 'OPEN',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('returns 403 if user already has a profile', async () => {
    mockAuth.mockResolvedValue({
      user: {
        id: 'user-123',
        email: 'artist@example.com',
        role: 'ARTIST',
        profileCompleted: false,
      },
    });

    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user-123',
      email: 'artist@example.com',
      role: 'ARTIST',
      profileCompleted: false,
      banned: false,
      name: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      artistProfile: {
        id: 'profile-123',
        userId: 'user-123',
        displayName: 'Existing Artist',
        bio: null,
        locationCity: null,
        locationCountry: null,
        disciplines: [],
        tools: [],
        availability: 'OPEN',
        verificationTier: 'NONE',
        profileViews: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      clientProfile: null,
    } as unknown);

    const request = new NextRequest('http://localhost:3000/api/onboarding/artist', {
      method: 'POST',
      body: JSON.stringify({
        displayName: 'Test Artist',
        disciplines: ['Photography'],
        tools: ['Photoshop'],
        availability: 'OPEN',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toContain('already has a profile');
  });

  it('creates artist profile successfully', async () => {
    mockAuth.mockResolvedValue({
      user: {
        id: 'user-123',
        email: 'artist@example.com',
        role: 'ARTIST',
        profileCompleted: false,
      },
    });

    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user-123',
      email: 'artist@example.com',
      role: 'ARTIST',
      profileCompleted: false,
      banned: false,
      name: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      artistProfile: null,
      clientProfile: null,
    } as unknown);

    const createdProfile = {
      id: 'profile-123',
      userId: 'user-123',
      displayName: 'Test Artist',
      bio: null,
      locationCity: null,
      locationCountry: null,
      disciplines: ['Photography'],
      tools: ['Photoshop'],
      availability: 'OPEN',
      verificationTier: 'NONE',
      profileViews: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockPrisma.artistProfile.create.mockResolvedValue(createdProfile as any);
    mockPrisma.user.update.mockResolvedValue({
      id: 'user-123',
      profileCompleted: true,
    } as unknown);

    const request = new NextRequest('http://localhost:3000/api/onboarding/artist', {
      method: 'POST',
      body: JSON.stringify({
        displayName: 'Test Artist',
        disciplines: ['Photography'],
        tools: ['Photoshop'],
        availability: 'OPEN',
        bio: 'Test bio',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.profile.displayName).toBe('Test Artist');
    expect(data.profile.disciplines).toEqual(['Photography']);
    expect(mockPrisma.artistProfile.create).toHaveBeenCalled();
    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-123' },
      data: { profileCompleted: true },
    });
  });

  it('returns 400 for invalid data', async () => {
    mockAuth.mockResolvedValue({
      user: {
        id: 'user-123',
        email: 'artist@example.com',
        role: 'ARTIST',
        profileCompleted: false,
      },
    });

    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user-123',
      email: 'artist@example.com',
      role: 'ARTIST',
      profileCompleted: false,
      banned: false,
      name: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      artistProfile: null,
      clientProfile: null,
    } as unknown);

    const request = new NextRequest('http://localhost:3000/api/onboarding/artist', {
      method: 'POST',
      body: JSON.stringify({
        displayName: '', // Invalid: empty
        disciplines: [],
        tools: [],
        availability: 'OPEN',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
  });
});

