// Post card component for feed
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Avatar } from '@/components/ui/Avatar';
import { VerificationBadge } from '@/components/ui/VerificationBadge';
import type { PostResponse } from '@/lib/types/posts';
import { VerificationTier } from '@prisma/client';

interface PostCardProps {
  post: PostResponse;
  onLike?: (postId: string) => void;
  onSave?: (postId: string) => void;
  onComment?: (postId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onLike,
  onSave,
  onComment,
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(post.isSaved || false);
  const [likeCount, setLikeCount] = useState(post.likeCount || 0);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
    onLike?.(post.id);
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    onSave?.(post.id);
  };

  const handleComment = () => {
    onComment?.(post.id);
  };

  const displayName = post.author.artistProfile?.displayName || post.author.name || 'Unknown Artist';
  const verificationTier = post.author.artistProfile?.verificationTier || VerificationTier.NONE;

  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <Link
          href={`/artist/${post.author.artistProfile?.id || post.authorId}`}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <Avatar
            src={null}
            alt={displayName}
            size="md"
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">{displayName}</span>
              {verificationTier !== VerificationTier.NONE && (
                <VerificationBadge tier={verificationTier} />
              )}
            </div>
            <span className="text-xs text-gray-500">
              {new Date(post.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </span>
          </div>
        </Link>
      </div>

      {/* Content */}
      {post.content && (
        <div className="px-4 pb-3">
          <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
        </div>
      )}

      {/* Media */}
      {post.mediaUrls.length > 0 && (
        <div className="w-full">
          {post.mediaUrls.length === 1 ? (
            <div className="relative w-full aspect-square bg-gray-100">
              {post.postType === 'IMAGE' ? (
                <Image
                  src={post.mediaUrls[0]}
                  alt={post.content || 'Post media'}
                  fill
                  style={{ objectFit: 'cover' }}
                  className="w-full h-full"
                />
              ) : post.postType === 'VIDEO' ? (
                <video
                  src={post.mediaUrls[0]}
                  controls
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <svg
                    className="w-12 h-12"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                    />
                  </svg>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-1">
              {post.mediaUrls.slice(0, 4).map((url, index) => (
                <div key={index} className="relative aspect-square bg-gray-100">
                  {post.postType === 'IMAGE' ? (
                    <Image
                      src={url}
                      alt={`Media ${index + 1}`}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      Media {index + 1}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-6">
            <button
              onClick={handleLike}
              className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors"
              aria-label="Like post"
            >
              <svg
                className={`w-6 h-6 ${isLiked ? 'fill-red-600 text-red-600' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <span className="text-sm font-medium">{likeCount}</span>
            </button>

            <button
              onClick={handleComment}
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
              aria-label="Comment on post"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <span className="text-sm font-medium">{post.commentCount || 0}</span>
            </button>
          </div>

          <button
            onClick={handleSave}
            className={`text-gray-600 hover:text-yellow-600 transition-colors ${
              isSaved ? 'text-yellow-600' : ''
            }`}
            aria-label={isSaved ? 'Unsave post' : 'Save post'}
          >
            <svg
              className={`w-6 h-6 ${isSaved ? 'fill-yellow-600' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
};

