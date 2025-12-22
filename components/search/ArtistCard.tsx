// Artist card component for search results
'use client';

import React from 'react';
import Link from 'next/link';
import { Avatar } from '@/components/ui/Avatar';
import { VerificationBadge } from '@/components/ui/VerificationBadge';
import { AvailabilityPill } from '@/components/ui/AvailabilityPill';
import { TagList } from '@/components/ui/TagList';
import type { ArtistSearchResult } from '@/lib/types/search';

interface ArtistCardProps {
  artist: ArtistSearchResult;
}

export const ArtistCard: React.FC<ArtistCardProps> = ({ artist }) => {
  const topDiscipline = artist.disciplines.length > 0 ? artist.disciplines[0] : null;
  const location = artist.locationCity 
    ? `${artist.locationCity}${artist.locationCountry ? `, ${artist.locationCountry}` : ''}`
    : artist.locationCountry || null;

  return (
    <Link
      href={`/artist/${artist.id}`}
      className="block bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <Avatar
            src={null}
            alt={artist.displayName}
            size="large"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {artist.displayName}
              </h3>
              {artist.verificationTier !== 'NONE' && (
                <VerificationBadge tier={artist.verificationTier} />
              )}
            </div>
            {topDiscipline && (
              <p className="text-sm text-gray-600 mb-2">{topDiscipline}</p>
            )}
            {location && (
              <p className="text-xs text-gray-500">{location}</p>
            )}
          </div>
        </div>

        {/* Bio */}
        {artist.bio && (
          <p className="text-sm text-gray-700 mb-4 line-clamp-2">
            {artist.bio}
          </p>
        )}

        {/* Disciplines */}
        {artist.disciplines.length > 0 && (
          <div className="mb-3">
            <TagList tags={artist.disciplines.slice(0, 3)} />
            {artist.disciplines.length > 3 && (
              <span className="text-xs text-gray-500 ml-2">
                +{artist.disciplines.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <AvailabilityPill status={artist.availability} />
          <div className="text-xs text-gray-500">
            {artist.profileViews} views
          </div>
        </div>
      </div>
    </Link>
  );
};

