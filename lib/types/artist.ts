// TypeScript types for artist-related data
import type { AvailabilityStatus } from '@/components/ui/AvailabilityPill';
import type { VerificationTier } from '@/components/ui/VerificationBadge';
import type { MediaType } from '@/components/ui/MediaGrid';

export interface ArtistProfile {
  id: string;
  userId: string;
  displayName: string;
  bio: string | null;
  locationCity: string | null;
  locationCountry: string | null;
  disciplines: string[];
  tools: string[];
  availability: AvailabilityStatus;
  verificationTier: VerificationTier;
  profileViews: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PortfolioItem {
  id: string;
  artistId: string;
  type: MediaType;
  title: string;
  description: string | null;
  mediaUrl: string;
  thumbnailUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ArtistProfileWithPortfolio extends ArtistProfile {
  portfolioItems: PortfolioItem[];
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

