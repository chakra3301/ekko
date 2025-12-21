// TypeScript types for onboarding API requests and responses
import { AvailabilityStatus } from '@prisma/client';

/**
 * Request body for artist onboarding
 */
export interface ArtistOnboardingRequest {
  disciplines: string[];
  bio?: string;
  tools: string[];
  availability: AvailabilityStatus;
  displayName: string;
}

/**
 * Request body for client onboarding
 */
export interface ClientOnboardingRequest {
  companyName: string;
  industryTags: string[];
}

/**
 * Response for successful onboarding
 */
export interface OnboardingResponse {
  success: true;
  profile: {
    id: string;
    userId: string;
    [key: string]: unknown;
  };
  user: {
    id: string;
    email: string;
    role: string;
    profileCompleted: boolean;
  };
}

/**
 * Error response
 */
export interface ErrorResponse {
  success: false;
  error: string;
  details?: Record<string, string[]>;
}

