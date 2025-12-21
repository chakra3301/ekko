// Type definitions for posts and feed
import { MediaType, VerificationTier } from '@prisma/client';

export interface CreatePostRequest {
  content?: string;
  mediaUrls: string[];
  postType: MediaType;
}

export interface PostResponse {
  id: string;
  authorId: string;
  content: string | null;
  mediaUrls: string[];
  postType: MediaType;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string | null;
    email: string;
    artistProfile?: {
      id: string;
      displayName: string;
      verificationTier: VerificationTier;
      avatarUrl?: string | null;
    } | null;
  };
  isSaved?: boolean;
  likeCount?: number;
  commentCount?: number;
}

export interface FeedResponse {
  posts: PostResponse[];
  hasMore: boolean;
}

export interface FeedQueryParams {
  mode?: 'latest' | 'foryou';
  cursor?: string;
  limit?: number;
}

