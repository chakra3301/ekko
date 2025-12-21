// Public artist profile page
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Avatar } from '@/components/ui/Avatar';
import { TagList } from '@/components/ui/TagList';
import { MediaGrid } from '@/components/ui/MediaGrid';
import { VerificationBadge } from '@/components/ui/VerificationBadge';
import { AvailabilityPill } from '@/components/ui/AvailabilityPill';
import { ProfileViewTracker } from '@/components/analytics/ProfileViewTracker';
import Link from 'next/link';

interface ArtistProfilePageProps {
  params: Promise<{ id: string }>;
}

/**
 * Public artist profile page
 * Displays artist information, portfolio, and verification status
 * Tracks profile views via client-side API call
 */
export default async function ArtistProfilePage({ params }: ArtistProfilePageProps) {
  const { id } = await params;

  const artist = await prisma.artistProfile.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      portfolioItems: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!artist) {
    notFound();
  }

  // Track profile view (client-side to avoid blocking page load)
  // The client component will call the API

  // Convert portfolio items to MediaGrid format
  const portfolioItems = artist.portfolioItems.map((item) => ({
    id: item.id,
    type: item.type as 'IMAGE' | 'VIDEO' | 'AUDIO',
    mediaUrl: item.mediaUrl,
    thumbnailUrl: item.thumbnailUrl,
    title: item.title,
    description: item.description,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <ProfileViewTracker artistId={id} />
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar
              src={null}
              name={artist.displayName}
              size="xl"
              className="flex-shrink-0"
            />
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{artist.displayName}</h1>
                  {artist.locationCity && artist.locationCountry && (
                    <p className="text-gray-600 mt-1">
                      {artist.locationCity}, {artist.locationCountry}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <VerificationBadge tier={artist.verificationTier} />
                  <AvailabilityPill status={artist.availability} />
                </div>
              </div>

              {artist.bio && (
                <p className="mt-4 text-gray-700 leading-relaxed">{artist.bio}</p>
              )}

              <div className="mt-6 flex flex-wrap gap-4">
                <Link
                  href={`/messages/new?userId=${artist.userId}`}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                >
                  Message Artist
                </Link>
                <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium">
                  Save Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Portfolio */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Portfolio</h2>
              <MediaGrid items={portfolioItems} columns={3} />
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Disciplines */}
            {artist.disciplines.length > 0 && (
              <section className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Disciplines</h3>
                <TagList tags={artist.disciplines} variant="outline" />
              </section>
            )}

            {/* Tools */}
            {artist.tools.length > 0 && (
              <section className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Tools & Software</h3>
                <TagList tags={artist.tools} variant="outline" />
              </section>
            )}

            {/* Stats */}
            <section className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Profile Views</span>
                  <span className="font-semibold text-gray-900">{artist.profileViews}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Portfolio Items</span>
                  <span className="font-semibold text-gray-900">
                    {artist.portfolioItems.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Member Since</span>
                  <span className="font-semibold text-gray-900">
                    {new Date(artist.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

