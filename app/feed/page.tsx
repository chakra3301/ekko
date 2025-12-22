// Feed page with Latest and For You tabs
'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { PostCard } from '@/components/feed/PostCard';
import { PostComposer } from '@/components/feed/PostComposer';
import { UserRole, MediaType } from '@prisma/client';
import type { PostResponse, FeedResponse } from '@/lib/types/posts';

type FeedMode = 'latest' | 'foryou';

export default function FeedPage() {
  const { data: session } = useSession();
  const [mode, setMode] = useState<FeedMode>('latest');
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState<string | undefined>();

  const isArtist = session?.user?.role === UserRole.ARTIST;

  useEffect(() => {
    fetchFeed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const fetchFeed = async (loadMore = false) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        mode,
        ...(loadMore && cursor ? { cursor } : {}),
        limit: '20',
      });

      const response = await fetch(`/api/feed?${params.toString()}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch feed');
      }

      const data: FeedResponse = await response.json();

      if (loadMore) {
        setPosts((prev) => [...prev, ...data.posts]);
      } else {
        setPosts(data.posts);
      }

      setHasMore(data.hasMore);
      if (data.posts.length > 0) {
        setCursor(data.posts[data.posts.length - 1].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load feed');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (content: string, mediaUrls: string[], postType: MediaType) => {
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          content: content || undefined,
          mediaUrls,
          postType,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create post');
      }

      // Refresh feed to show new post
      await fetchFeed();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create post';
      setError(errorMessage);
      throw err; // Re-throw for PostComposer to handle
    }
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchFeed(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Feed</h1>
            {isArtist && (
              <button
                onClick={() => setIsComposerOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Create Post
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="mt-4 flex gap-4 border-b border-gray-200">
            <button
              onClick={() => setMode('latest')}
              className={`pb-2 px-1 font-medium transition-colors ${
                mode === 'latest'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Latest
            </button>
            <button
              onClick={() => setMode('foryou')}
              className={`pb-2 px-1 font-medium transition-colors ${
                mode === 'foryou'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              For You
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
            <button
              onClick={() => fetchFeed()}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Try again
            </button>
          </div>
        )}

        {loading && posts.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No posts yet. Be the first to post!</p>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onLike={() => {
                    // TODO: Implement like functionality
                  }}
                  onSave={() => {
                    // TODO: Implement save functionality
                  }}
                  onComment={() => {
                    // TODO: Implement comment functionality
                  }}
                />
              ))}
            </div>

            {hasMore && (
              <div className="mt-6 text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Post Composer Modal */}
      {isArtist && (
        <PostComposer
          isOpen={isComposerOpen}
          onClose={() => setIsComposerOpen(false)}
          onSubmit={handleCreatePost}
        />
      )}
    </div>
  );
}

