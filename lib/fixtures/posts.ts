// Fixture data for posts and feed
import { MediaType, VerificationTier } from '@prisma/client';
import type { PostResponse } from '@/lib/types/posts';

export const mockPosts: PostResponse[] = [
  {
    id: 'post-1',
    authorId: 'user-1',
    content: 'Just finished an amazing photoshoot! Check out this behind-the-scenes look at my creative process. 🎨✨',
    mediaUrls: ['/mock-storage/post-1-image-1.jpg'],
    postType: MediaType.IMAGE,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    updatedAt: new Date().toISOString(),
    author: {
      id: 'user-1',
      name: 'Jane Doe',
      email: 'jane@example.com',
      artistProfile: {
        id: 'artist-1',
        displayName: 'Jane Doe Photography',
        verificationTier: VerificationTier.PLATINUM,
      },
    },
    isSaved: false,
    likeCount: 42,
    commentCount: 8,
  },
  {
    id: 'post-2',
    authorId: 'user-2',
    content: 'New video tutorial is live! Learn how to master portrait lighting in just 10 minutes.',
    mediaUrls: ['/mock-storage/post-2-video-1.mp4'],
    postType: MediaType.VIDEO,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    updatedAt: new Date().toISOString(),
    author: {
      id: 'user-2',
      name: 'John Smith',
      email: 'john@example.com',
      artistProfile: {
        id: 'artist-2',
        displayName: 'John Smith Visuals',
        verificationTier: VerificationTier.BLACK,
      },
    },
    isSaved: false,
    likeCount: 128,
    commentCount: 24,
  },
  {
    id: 'post-3',
    authorId: 'user-3',
    content: 'Working on a new album cover design. Here\'s a sneak peek! 🎵',
    mediaUrls: [
      '/mock-storage/post-3-image-1.jpg',
      '/mock-storage/post-3-image-2.jpg',
      '/mock-storage/post-3-image-3.jpg',
    ],
    postType: MediaType.IMAGE,
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
    updatedAt: new Date().toISOString(),
    author: {
      id: 'user-3',
      name: 'Alex Johnson',
      email: 'alex@example.com',
      artistProfile: {
        id: 'artist-3',
        displayName: 'Alex Design Studio',
        verificationTier: VerificationTier.RED,
      },
    },
    isSaved: false,
    likeCount: 67,
    commentCount: 12,
  },
  {
    id: 'post-4',
    authorId: 'user-4',
    content: 'Just dropped my latest track! Let me know what you think. 🎧',
    mediaUrls: ['/mock-storage/post-4-audio-1.mp3'],
    postType: MediaType.AUDIO,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    updatedAt: new Date().toISOString(),
    author: {
      id: 'user-4',
      name: 'Sam Wilson',
      email: 'sam@example.com',
      artistProfile: {
        id: 'artist-4',
        displayName: 'Sam Wilson Music',
        verificationTier: VerificationTier.NONE,
      },
    },
    isSaved: false,
    likeCount: 89,
    commentCount: 15,
  },
  {
    id: 'post-5',
    authorId: 'user-5',
    content: 'Excited to share my latest illustration series! Each piece tells a unique story. Which one resonates with you?',
    mediaUrls: [
      '/mock-storage/post-5-image-1.jpg',
      '/mock-storage/post-5-image-2.jpg',
    ],
    postType: MediaType.IMAGE,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    updatedAt: new Date().toISOString(),
    author: {
      id: 'user-5',
      name: 'Taylor Brown',
      email: 'taylor@example.com',
      artistProfile: {
        id: 'artist-5',
        displayName: 'Taylor Illustrations',
        verificationTier: VerificationTier.BLACK,
      },
    },
    isSaved: false,
    likeCount: 203,
    commentCount: 31,
  },
];

/**
 * Get posts sorted by verification tier (for "For You" feed simulation)
 */
export function getPostsSortedByVerification(posts: PostResponse[]): PostResponse[] {
  const tierPriority: Record<VerificationTier, number> = {
    [VerificationTier.PLATINUM]: 4,
    [VerificationTier.BLACK]: 3,
    [VerificationTier.RED]: 2,
    [VerificationTier.NONE]: 1,
  };

  return [...posts].sort((a, b) => {
    const tierA = a.author.artistProfile?.verificationTier || VerificationTier.NONE;
    const tierB = b.author.artistProfile?.verificationTier || VerificationTier.NONE;

    const priorityA = tierPriority[tierA];
    const priorityB = tierPriority[tierB];

    // Sort by verification tier (desc), then by createdAt (desc)
    if (priorityA !== priorityB) {
      return priorityB - priorityA;
    }

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

