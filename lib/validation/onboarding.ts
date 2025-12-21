// Validation functions for onboarding requests
import { AvailabilityStatus } from '@prisma/client';
import {
  ArtistOnboardingRequest,
  ClientOnboardingRequest,
} from '../types/onboarding';

/**
 * Validate artist onboarding request
 */
export function validateArtistOnboarding(
  data: unknown
): { valid: true; data: ArtistOnboardingRequest } | { valid: false; errors: string[] } {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  const body = data as Record<string, unknown>;

  // Validate displayName
  if (!body.displayName || typeof body.displayName !== 'string') {
    errors.push('displayName is required and must be a string');
  } else if (body.displayName.trim().length === 0) {
    errors.push('displayName cannot be empty');
  } else if (body.displayName.length > 100) {
    errors.push('displayName must be 100 characters or less');
  }

  // Validate disciplines
  if (!Array.isArray(body.disciplines)) {
    errors.push('disciplines is required and must be an array');
  } else if (body.disciplines.length === 0) {
    errors.push('At least one discipline is required');
  } else if (body.disciplines.length > 20) {
    errors.push('Maximum 20 disciplines allowed');
  } else {
    const invalidDisciplines = body.disciplines.filter(
      (d) => typeof d !== 'string' || d.trim().length === 0
    );
    if (invalidDisciplines.length > 0) {
      errors.push('All disciplines must be non-empty strings');
    }
  }

  // Validate tools
  if (!Array.isArray(body.tools)) {
    errors.push('tools is required and must be an array');
  } else if (body.tools.length > 50) {
    errors.push('Maximum 50 tools allowed');
  } else {
    const invalidTools = body.tools.filter(
      (t) => typeof t !== 'string' || t.trim().length === 0
    );
    if (invalidTools.length > 0) {
      errors.push('All tools must be non-empty strings');
    }
  }

  // Validate availability
  if (!body.availability) {
    errors.push('availability is required');
  } else if (!Object.values(AvailabilityStatus).includes(body.availability as AvailabilityStatus)) {
    errors.push(
      `availability must be one of: ${Object.values(AvailabilityStatus).join(', ')}`
    );
  }

  // Validate bio (optional)
  if (body.bio !== undefined) {
    if (typeof body.bio !== 'string') {
      errors.push('bio must be a string');
    } else if (body.bio.length > 2000) {
      errors.push('bio must be 2000 characters or less');
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    data: {
      displayName: (body.displayName as string).trim(),
      disciplines: (body.disciplines as string[]).map((d) => d.trim()),
      tools: (body.tools as string[]).map((t) => t.trim()),
      availability: body.availability as AvailabilityStatus,
      bio: body.bio ? (body.bio as string).trim() : undefined,
    },
  };
}

/**
 * Validate client onboarding request
 */
export function validateClientOnboarding(
  data: unknown
): { valid: true; data: ClientOnboardingRequest } | { valid: false; errors: string[] } {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  const body = data as Record<string, unknown>;

  // Validate companyName
  if (!body.companyName || typeof body.companyName !== 'string') {
    errors.push('companyName is required and must be a string');
  } else if (body.companyName.trim().length === 0) {
    errors.push('companyName cannot be empty');
  } else if (body.companyName.length > 200) {
    errors.push('companyName must be 200 characters or less');
  }

  // Validate industryTags
  if (!Array.isArray(body.industryTags)) {
    errors.push('industryTags is required and must be an array');
  } else if (body.industryTags.length === 0) {
    errors.push('At least one industry tag is required');
  } else if (body.industryTags.length > 30) {
    errors.push('Maximum 30 industry tags allowed');
  } else {
    const invalidTags = body.industryTags.filter(
      (t) => typeof t !== 'string' || t.trim().length === 0
    );
    if (invalidTags.length > 0) {
      errors.push('All industry tags must be non-empty strings');
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    data: {
      companyName: (body.companyName as string).trim(),
      industryTags: (body.industryTags as string[]).map((t) => t.trim()),
    },
  };
}

