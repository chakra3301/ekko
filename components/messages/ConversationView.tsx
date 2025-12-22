// Conversation view component with messages and input
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Avatar } from '@/components/ui/Avatar';
import type { MessageResponse, ConversationMessagesResponse } from '@/lib/types/messages';

interface ConversationViewProps {
  userId: string;
  userName: string;
  userDisplayName: string;
  onAcceptRequest?: (messageId: string) => void;
  onDeclineRequest?: (messageId: string) => void;
}

export const ConversationView: React.FC<ConversationViewProps> = ({
  userId,
  userName,
  userDisplayName,
  onAcceptRequest,
  onDeclineRequest,
}) => {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;
  
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [pendingRequest, setPendingRequest] = useState<MessageResponse | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (userId && currentUserId) {
      fetchMessages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, currentUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async (loadMore = false) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (loadMore && cursor) {
        params.set('cursor', cursor);
      }
      params.set('limit', '50');

      const response = await fetch(`/api/messages/conversations/${userId}?${params.toString()}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data: ConversationMessagesResponse = await response.json();

      if (loadMore) {
        setMessages((prev) => [...data.messages.reverse(), ...prev]);
      } else {
        setMessages(data.messages.reverse()); // Reverse to show oldest first
      }

      setHasMore(data.hasMore);
      setCursor(data.nextCursor);

      // Check for pending request (message sent to me that is a request and not yet accepted)
      // A request is pending if it's the latest message, sent to me, and isRequest is true
      if (data.messages.length > 0) {
        const latestMessage = data.messages[data.messages.length - 1]; // Last message (most recent)
        if (latestMessage.isRequest && latestMessage.receiverId === currentUserId && latestMessage.senderId === userId) {
          setPendingRequest(latestMessage);
        } else {
          setPendingRequest(null);
        }
      } else {
        setPendingRequest(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || sending) return;

    const text = messageText.trim();
    setMessageText('');
    setSending(true);

    try {
      // Check if this is first message (request)
      const isFirstMessage = messages.length === 0;

      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          receiverId: userId,
          body: text,
          isRequest: isFirstMessage,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send message');
      }

      const newMessage: MessageResponse = await response.json();
      setMessages((prev) => [...prev, newMessage]);

      // If it was a request, set pending request
      if (newMessage.isRequest) {
        setPendingRequest(newMessage);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      setMessageText(text); // Restore message text on error
    } finally {
      setSending(false);
    }
  };

  const handleAcceptRequest = async (messageId: string) => {
    try {
      const response = await fetch(`/api/messages/requests/${messageId}/accept`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to accept request');
      }

      // Update messages to remove request flag
      setMessages((prev) =>
        prev.map((m) => (m.isRequest ? { ...m, isRequest: false } : m))
      );
      setPendingRequest(null);
      onAcceptRequest?.(messageId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept request');
    }
  };

  const handleDeclineRequest = async (messageId: string) => {
    try {
      const response = await fetch(`/api/messages/requests/${messageId}/decline`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to decline request');
      }

      // Remove declined message
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
      setPendingRequest(null);
      onDeclineRequest?.(messageId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to decline request');
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  if (loading && messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar src={null} alt={userDisplayName} size="md" />
          <div>
            <h3 className="font-semibold text-gray-900">{userDisplayName}</h3>
            <p className="text-sm text-gray-500">{userName || 'User'}</p>
          </div>
        </div>
      </div>

      {/* Pending Request Banner */}
      {pendingRequest && (
        <div className="p-4 bg-yellow-50 border-b border-yellow-200">
          <p className="text-sm text-yellow-800 mb-3">
            You have a pending message request from {userDisplayName}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => handleAcceptRequest(pendingRequest.id)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              Accept
            </button>
            <button
              onClick={() => handleDeclineRequest(pendingRequest.id)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm"
            >
              Decline
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border-b border-red-200">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {hasMore && (
          <div className="text-center">
            <button
              onClick={() => fetchMessages(true)}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Load older messages
            </button>
          </div>
        )}

        {messages.map((message) => {
          const isMe = message.senderId === currentUserId;
          const senderDisplayName =
            message.sender.artistProfile?.displayName ||
            message.sender.clientProfile?.companyName ||
            message.sender.name ||
            message.sender.email;

          return (
            <div
              key={message.id}
              className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-2 max-w-[70%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                {!isMe && (
                  <Avatar src={null} alt={senderDisplayName} size="small" />
                )}
                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  {!isMe && (
                    <span className="text-xs text-gray-500 mb-1">{senderDisplayName}</span>
                  )}
                  <div
                    className={`rounded-lg px-4 py-2 ${
                      isMe
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    {message.isRequest && (
                      <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded mb-1 block">
                        Request
                      </span>
                    )}
                    <p className="text-sm whitespace-pre-wrap">{message.body}</p>
                  </div>
                  <span className="text-xs text-gray-500 mt-1">
                    {formatTime(message.createdAt)}
                    {isMe && message.readAt && ' ✓ Read'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <textarea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            rows={2}
            disabled={sending || !!pendingRequest}
          />
          <button
            onClick={handleSendMessage}
            disabled={!messageText.trim() || sending || !!pendingRequest}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </div>
        {pendingRequest && (
          <p className="text-xs text-gray-500 mt-2">
            Accept the message request to continue the conversation
          </p>
        )}
      </div>
    </div>
  );
};

