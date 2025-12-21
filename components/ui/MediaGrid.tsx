// MediaGrid component - displays portfolio items in a grid
'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

// Note: For Next.js Image component, configure image domains in next.config.js
// if using external URLs or local storage paths

export type MediaType = 'IMAGE' | 'VIDEO' | 'AUDIO';

interface MediaItem {
  id: string;
  type: MediaType;
  mediaUrl: string;
  thumbnailUrl?: string | null;
  title?: string;
  description?: string | null;
}

interface MediaGridProps {
  items: MediaItem[];
  columns?: 2 | 3 | 4;
  className?: string;
  onItemClick?: (item: MediaItem) => void;
}

/**
 * MediaGrid component
 * Displays portfolio items in a responsive grid
 */
export function MediaGrid({
  items,
  columns = 3,
  className,
  onItemClick,
}: MediaGridProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  if (items.length === 0) {
    return (
      <div className={cn('text-center py-12 text-gray-500', className)}>
        <p>No portfolio items yet</p>
      </div>
    );
  }

  return (
    <div className={cn('grid gap-4', gridCols[columns], className)}>
      {items.map((item) => (
        <div
          key={item.id}
          className={cn(
            'relative group cursor-pointer rounded-lg overflow-hidden bg-gray-100 aspect-square',
            'transition-transform hover:scale-105'
          )}
          onMouseEnter={() => setHoveredId(item.id)}
          onMouseLeave={() => setHoveredId(null)}
          onClick={() => onItemClick?.(item)}
        >
          {item.type === 'IMAGE' && (
            <>
              {item.thumbnailUrl || item.mediaUrl ? (
                <Image
                  src={item.thumbnailUrl || item.mediaUrl}
                  alt={item.title || 'Portfolio item'}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
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
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}
            </>
          )}

          {item.type === 'VIDEO' && (
            <div className="w-full h-full flex items-center justify-center bg-gray-900">
              {item.thumbnailUrl ? (
                <Image
                  src={item.thumbnailUrl}
                  alt={item.title || 'Video thumbnail'}
                  fill
                  className="object-cover opacity-75"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              ) : null}
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  className="w-16 h-16 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
              </div>
            </div>
          )}

          {item.type === 'AUDIO' && (
            <div className="w-full h-full flex items-center justify-center bg-gray-800">
              <svg
                className="w-16 h-16 text-white"
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

          {/* Overlay with title on hover */}
          {hoveredId === item.id && item.title && (
            <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4">
              <p className="text-white text-sm font-medium text-center">{item.title}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

