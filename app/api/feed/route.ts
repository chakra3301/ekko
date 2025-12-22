// API route for fetching feed posts
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { VerificationTier } from '@prisma/client';
import type { FeedResponse } from '@/lib/types/posts';

// Verification tier priority for ranking (higher = better)
const VERIFICATION_TIER_PRIORITY: Record<VerificationTier, number> = {
  [VerificationTier.PLATINUM]: 4,
  [VerificationTier.BLACK]: 3,
  [VerificationTier.RED]: 2,
  [VerificationTier.NONE]: 1,
};

/**
 * GET /api/feed?mode=latest|foryou&cursor=&limit=
 * Fetch feed posts with ranking
 * mode=latest: Sort by createdAt desc
 * mode=foryou: Sort by verificationTier desc, then createdAt desc
 */
export async function GET(req: Request): Promise<NextResponse<FeedResponse | { error: string }>> {
  await auth(); // Check authentication but don't use session for now
  const { searchParams } = new URL(req.url);

  const mode = (searchParams.get('mode') || 'latest') as 'latest' | 'foryou';
  const cursor = searchParams.get('cursor') || undefined;
  const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 50);

  try {
    // Fetch posts with author and artist profile
    const posts = await prisma.post.findMany({
      take: limit + 1, // Fetch one extra to check if there are more
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      include: {
        author: {
          include: {
            artistProfile: {
              select: {
                id: true,
                displayName: true,
                verificationTier: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const hasMore = posts.length > limit;
    const postsToReturn = hasMore ? posts.slice(0, limit) : posts;

    // Apply ranking for "For You" mode
    let rankedPosts = postsToReturn;
    if (mode === 'foryou') {
      rankedPosts = [...postsToReturn].sort((a, b) => {
        const tierA = a.author.artistProfile?.verificationTier || VerificationTier.NONE;
        const tierB = b.author.artistProfile?.verificationTier || VerificationTier.NONE;
        
        const priorityA = VERIFICATION_TIER_PRIORITY[tierA];
        const priorityB = VERIFICATION_TIER_PRIORITY[tierB];

        // Sort by verification tier (desc), then by createdAt (desc)
        if (priorityA !== priorityB) {
          return priorityB - priorityA;
        }
        
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    }

    // Format response
    const response: FeedResponse = {
      posts: rankedPosts.map((post) => ({
        id: post.id,
        authorId: post.authorId,
        content: post.content,
        mediaUrls: post.mediaUrls,
        postType: post.postType,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
        author: {
          id: post.author.id,
          name: post.author.name,
          email: post.author.email,
          artistProfile: post.author.artistProfile
            ? {
                id: post.author.artistProfile.id,
                displayName: post.author.artistProfile.displayName,
                verificationTier: post.author.artistProfile.verificationTier,
              }
            : null,
        },
        isSaved: false, // TODO: Implement saved posts feature
        likeCount: 0, // TODO: Implement likes feature
        commentCount: 0, // TODO: Implement comments feature
      })),
      hasMore,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching feed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

