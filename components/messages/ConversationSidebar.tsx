// Sidebar component for listing conversations
'use client';

import React, { useState, useEffect } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import type { ConversationPreview } from '@/lib/types/messages';

interface ConversationSidebarProps {
  onSelectConversation: (userId: string, userName?: string, userDisplayName?: string) => void;
  selectedUserId?: string;
}

export const ConversationSidebar: React.FC<ConversationSidebarProps> = ({
  onSelectConversation,
  selectedUserId,
}) => {
  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchConversations();
    // Refresh conversations every 30 seconds
    const interval = setInterval(fetchConversations, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/messages/conversations', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }

      const data = await response.json();
      setConversations(data.conversations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading && conversations.length === 0) {
    return (
      <div className="w-80 border-r border-gray-200 bg-white h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && conversations.length === 0) {
    return (
      <div className="w-80 border-r border-gray-200 bg-white h-full flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-600 mb-2">{error}</p>
          <button
            onClick={fetchConversations}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 border-r border-gray-200 bg-white h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <p>No conversations yet</p>
            <p className="text-sm mt-2">Start a conversation to get started!</p>
          </div>
        ) : (
          <div>
            {conversations.map((conversation) => (
              <button
                key={conversation.userId}
                onClick={() => onSelectConversation(
                  conversation.userId,
                  conversation.userName || undefined,
                  conversation.userDisplayName
                )}
                className={`w-full p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors text-left ${
                  selectedUserId === conversation.userId ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <Avatar
                    src={null}
                    alt={conversation.userDisplayName}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {conversation.userDisplayName}
                      </h3>
                      {conversation.lastMessage && (
                        <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                          {formatTime(conversation.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    {conversation.lastMessage && (
                      <div className="flex items-center gap-2">
                        {conversation.isRequest && (
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                            Request
                          </span>
                        )}
                        <p className="text-sm text-gray-600 truncate flex-1">
                          {conversation.lastMessage.body}
                        </p>
                      </div>
                    )}
                    {conversation.unreadCount > 0 && (
                      <div className="mt-1">
                        <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-600 text-white text-xs font-medium rounded-full">
                          {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

