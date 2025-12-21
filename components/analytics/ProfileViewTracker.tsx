// Client component to track profile views
'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface ProfileViewTrackerProps {
  artistId: string;
}

export function ProfileViewTracker({ artistId }: ProfileViewTrackerProps) {
  const { data: session } = useSession();

  useEffect(() => {
    // Track profile view
    const trackView = async () => {
      try {
        await fetch('/api/analytics/profile-view', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ artistId }),
        });
      } catch (error) {
        // Silently fail - analytics are non-critical
        console.error('Failed to track profile view:', error);
      }
    };

    trackView();
  }, [artistId]);

  return null; // This component doesn't render anything
}

