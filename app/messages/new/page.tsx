// New conversation page - start a conversation with a user
'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ConversationView } from '@/components/messages/ConversationView';

export default function NewConversationPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const artistId = searchParams.get('artistId');
  const userId = searchParams.get('userId');

  const [targetUserId, setTargetUserId] = useState<string | null>(null);
  const [targetUserName, setTargetUserName] = useState<string>('');
  const [targetUserDisplayName, setTargetUserDisplayName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      router.push('/api/auth/signin');
      return;
    }

    // If userId is provided, use it directly
    if (userId) {
      fetchUserInfo(userId);
    }
    // If artistId is provided, get the user ID from the artist profile
    else if (artistId) {
      fetchArtistUser(artistId);
    } else {
      // No target specified, redirect to messages
      router.push('/messages');
    }
  }, [session, userId, artistId, router]);

  const fetchArtistUser = async (id: string) => {
    try {
      const response = await fetch(`/api/artists/${id}/user`);
      if (response.ok) {
        const data = await response.json();
        setTargetUserId(data.userId);
        setTargetUserName(data.userName || '');
        setTargetUserDisplayName(data.displayName || '');
      } else {
        // Fallback: try to use artistId as userId (if it's actually a userId)
        setTargetUserId(id);
        setTargetUserDisplayName('User');
      }
    } catch (error) {
      // Fallback: use artistId as userId
      setTargetUserId(id);
      setTargetUserDisplayName('User');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserInfo = async (id: string) => {
    try {
      // Try to get user info from conversations API
      const response = await fetch('/api/messages/conversations');
      if (response.ok) {
        const data = await response.json();
        const conversation = data.conversations.find((c: { userId: string }) => c.userId === id);
        if (conversation) {
          setTargetUserName(conversation.userName || '');
          setTargetUserDisplayName(conversation.userDisplayName);
        }
      }
      setTargetUserId(id);
    } catch (error) {
      setTargetUserId(id);
      setTargetUserDisplayName('User');
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return null; // Will redirect
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!targetUserId) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">User not found</p>
          <button
            onClick={() => router.push('/messages')}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Go to messages
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-50">
      <div className="flex-1">
        <ConversationView
          userId={targetUserId}
          userName={targetUserName}
          userDisplayName={targetUserDisplayName}
        />
      </div>
    </div>
  );
}

