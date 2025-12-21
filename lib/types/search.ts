// Type definitions for search functionality
import { AvailabilityStatus, VerificationTier } from '@prisma/client';

export interface SearchArtistsQueryParams {
  q?: string; // Search query (searches displayName, bio)
  discipline?: string; // Filter by discipline
  location?: string; // Filter by location (city or country)
  tool?: string; // Filter by tool
  availability?: AvailabilityStatus; // Filter by availability
  verification?: VerificationTier; // Filter by verification tier
  limit?: number; // Number of results per page
  cursor?: string; // Cursor for pagination
}

export interface ArtistSearchResult {
  id: string;
  displayName: string;
  bio: string | null;
  locationCity: string | null;
  locationCountry: string | null;
  disciplines: string[];
  tools: string[];
  availability: AvailabilityStatus;
  verificationTier: VerificationTier;
  profileViews: number;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

export interface SearchArtistsResponse {
  artists: ArtistSearchResult[];
  hasMore: boolean;
  nextCursor: string | null;
  total?: number; // Optional: total count (expensive query)
}

