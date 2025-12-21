// Type definitions for verification system
import { VerificationStatus, VerificationTier } from '@prisma/client';

export interface CreateVerificationRequest {
  evidenceUrls: string[];
}

export interface VerificationRequestResponse {
  id: string;
  artistId: string;
  status: VerificationStatus;
  evidenceUrls: string[];
  adminNote: string | null;
  createdAt: string;
  reviewedAt: string | null;
  artist: {
    id: string;
    displayName: string;
    userId: string;
  };
}

export interface PendingVerificationsResponse {
  requests: VerificationRequestResponse[];
}

export interface ApproveVerificationRequest {
  verificationTier: VerificationTier;
  adminNote?: string;
}

export interface RejectVerificationRequest {
  adminNote: string;
}

export interface CreateCheckoutSessionRequest {
  tier: 'RED' | 'BLACK'; // Only RED and BLACK are paid tiers
}

export interface CreateCheckoutSessionResponse {
  sessionId: string;
  url: string;
}

