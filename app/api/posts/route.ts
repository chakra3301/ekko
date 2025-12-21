// API route for creating posts
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { MediaType, UserRole } from '@prisma/client';
import type { CreatePostRequest, PostResponse } from '@/lib/types/posts';

/**
 * POST /api/posts
 * Create a new post
 * Requires authentication and ARTIST role
 */
export async function POST(req: Request): Promise<NextResponse<PostResponse | { error: string }>> {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Only artists can create posts
  if (session.user.role !== UserRole.ARTIST) {
    return NextResponse.json({ error: 'Only artists can create posts' }, { status: 403 });
  }

  try {
    const body: CreatePostRequest = await req.json();

    // Validation
    if (!body.mediaUrls || body.mediaUrls.length === 0) {
      return NextResponse.json({ error: 'At least one media URL is required' }, { status: 400 });
    }

    if (!body.postType || !Object.values(MediaType).includes(body.postType)) {
      return NextResponse.json({ error: 'Invalid post type' }, { status: 400 });
    }

    // Create post
    const post = await prisma.post.create({
      data: {
        authorId: session.user.id,
        content: body.content || null,
        mediaUrls: body.mediaUrls,
        postType: body.postType,
      },
      include: {
        author: {
          include: {
            artistProfile: {
              select: {
                id: true,
                displayName: true,
                verificationTier: true,
                // Note: avatarUrl would come from User model if we add it
              },
            },
          },
        },
      },
    });

    // Format response
    const response: PostResponse = {
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
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

