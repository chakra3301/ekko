// Search page for discovering artists
'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArtistCard } from '@/components/search/ArtistCard';
import { AvailabilityStatus, VerificationTier } from '@prisma/client';
import type { ArtistSearchResult, SearchArtistsResponse } from '@/lib/types/search';

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State
  const [query, setQuery] = useState(searchParams?.get('q') || '');
  const [discipline, setDiscipline] = useState(searchParams?.get('discipline') || '');
  const [location, setLocation] = useState(searchParams?.get('location') || '');
  const [tool, setTool] = useState(searchParams?.get('tool') || '');
  const [availability, setAvailability] = useState<AvailabilityStatus | ''>(
    (searchParams?.get('availability') as AvailabilityStatus) || ''
  );
  const [verification, setVerification] = useState<VerificationTier | ''>(
    (searchParams?.get('verification') as VerificationTier) || ''
  );
  
  const [artists, setArtists] = useState<ArtistSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);

  // Fetch search results
  const fetchArtists = useCallback(async (loadMore = false) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (query) params.set('q', query);
      if (discipline) params.set('discipline', discipline);
      if (location) params.set('location', location);
      if (tool) params.set('tool', tool);
      if (availability) params.set('availability', availability);
      if (verification) params.set('verification', verification);
      if (loadMore && cursor) params.set('cursor', cursor);
      params.set('limit', '20');

      const response = await fetch(`/api/search/artists?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to search artists');
      }

      const data: SearchArtistsResponse = await response.json();

      if (loadMore) {
        setArtists((prev) => [...prev, ...data.artists]);
      } else {
        setArtists(data.artists);
      }

      setHasMore(data.hasMore);
      setCursor(data.nextCursor);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search artists');
    } finally {
      setLoading(false);
    }
  }, [query, discipline, location, tool, availability, verification, cursor]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (discipline) params.set('discipline', discipline);
    if (location) params.set('location', location);
    if (tool) params.set('tool', tool);
    if (availability) params.set('availability', availability);
    if (verification) params.set('verification', verification);
    
    router.replace(`/search?${params.toString()}`, { scroll: false });
  }, [query, discipline, location, tool, availability, verification, router]);

  // Fetch on mount and when filters change
  useEffect(() => {
    fetchArtists();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, discipline, location, tool, availability, verification]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchArtists(true);
    }
  };

  const handleClearFilters = () => {
    setQuery('');
    setDiscipline('');
    setLocation('');
    setTool('');
    setAvailability('');
    setVerification('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Discover Artists</h1>

          {/* Search Box */}
          <div className="mb-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or bio..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Discipline */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discipline
              </label>
              <input
                type="text"
                value={discipline}
                onChange={(e) => setDiscipline(e.target.value)}
                placeholder="e.g., Photography"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., New York"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Tool */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tool
              </label>
              <input
                type="text"
                value={tool}
                onChange={(e) => setTool(e.target.value)}
                placeholder="e.g., Photoshop"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Availability */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Availability
              </label>
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value as AvailabilityStatus | '')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All</option>
                <option value={AvailabilityStatus.OPEN}>Open</option>
                <option value={AvailabilityStatus.LIMITED}>Limited</option>
                <option value={AvailabilityStatus.CLOSED}>Closed</option>
              </select>
            </div>

            {/* Verification */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Verification
              </label>
              <select
                value={verification}
                onChange={(e) => setVerification(e.target.value as VerificationTier | '')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All</option>
                <option value={VerificationTier.PLATINUM}>Platinum</option>
                <option value={VerificationTier.BLACK}>Black</option>
                <option value={VerificationTier.RED}>Red</option>
                <option value={VerificationTier.NONE}>Unverified</option>
              </select>
            </div>
          </div>

          {/* Clear Filters */}
          {(query || discipline || location || tool || availability || verification) && (
            <div className="mt-4">
              <button
                onClick={handleClearFilters}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
            <button
              onClick={() => fetchArtists()}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Try again
            </button>
          </div>
        )}

        {loading && artists.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : artists.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No artists found. Try adjusting your filters.</p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-600">
              Found {artists.length} {artists.length === 1 ? 'artist' : 'artists'}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {artists.map((artist) => (
                <ArtistCard key={artist.id} artist={artist} />
              ))}
            </div>

            {hasMore && (
              <div className="mt-8 text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}

