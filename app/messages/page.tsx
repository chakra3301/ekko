// Messages page with sidebar and conversation view
'use client';

import React, { useState } from 'react';
import { ConversationSidebar } from '@/components/messages/ConversationSidebar';
import { ConversationView } from '@/components/messages/ConversationView';
import { useSession } from 'next-auth/react';

export default function MessagesPage() {
  const { data: session } = useSession();
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>();
  const [selectedUserName, setSelectedUserName] = useState<string>('');
  const [selectedUserDisplayName, setSelectedUserDisplayName] = useState<string>('');


  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please sign in to view messages</p>
          <a
            href="/api/auth/signin"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Sign in
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-50">
      <ConversationSidebar
        onSelectConversation={(userId, userName, userDisplayName) => {
          setSelectedUserId(userId);
          setSelectedUserName(userName || '');
          setSelectedUserDisplayName(userDisplayName || '');
        }}
        selectedUserId={selectedUserId}
      />
      {selectedUserId ? (
        <ConversationView
          userId={selectedUserId}
          userName={selectedUserName}
          userDisplayName={selectedUserDisplayName}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center bg-white">
          <div className="text-center text-gray-500">
            <p className="text-lg mb-2">Select a conversation</p>
            <p className="text-sm">Choose a conversation from the sidebar to start messaging</p>
          </div>
        </div>
      )}
    </div>
  );
}

