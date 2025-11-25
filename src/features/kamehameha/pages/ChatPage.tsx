/**
 * AI Therapist Chat Page
 * Phase 4: Full chat interface with AI therapist
 */

import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import {
  sendMessage,
  subscribeToChatMessages,
} from '../services/aiChatService';
import type { ChatMessage } from '../types/kamehameha.types';

export function ChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEmergency, setIsEmergency] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Subscribe to real-time messages
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToChatMessages(user.uid, (newMessages) => {
      setMessages(newMessages);
    });

    return () => unsubscribe();
  }, [user]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const messageText = input.trim();
    setInput('');
    setError(null);
    setLoading(true);

    try {
      await sendMessage(messageText, isEmergency);
      // Message will appear via real-time subscription
    } catch (err: any) {
      setError(err.message || 'Failed to send message');
      // Restore input on error
      setInput(messageText);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleEmergency = () => {
    setIsEmergency(!isEmergency);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/30 backdrop-blur-md border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/kamehameha"
              className="text-white/60 hover:text-white transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white">AI Therapist</h1>
              <p className="text-xs text-white/60">
                Compassionate support, 24/7
              </p>
            </div>
          </div>

          {/* Emergency Button */}
          <button
            onClick={toggleEmergency}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-all ${
              isEmergency
                ? 'bg-red-600 text-white shadow-lg shadow-red-500/50'
                : 'bg-white/20 text-white/70 hover:bg-white/30'
            }`}
          >
            <span className="text-xl">🚨</span>
            <span className="hidden sm:inline">
              {isEmergency ? 'Emergency ON' : 'Emergency'}
            </span>
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="pt-24 pb-32 px-4 max-w-4xl mx-auto">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💜</div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Welcome to Your AI Therapist
            </h2>
            <p className="text-white/60 max-w-md mx-auto">
              I'm here to provide compassionate support for your recovery
              journey. Share what's on your mind, and I'll listen without
              judgment.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/10 text-white backdrop-blur-md border border-white/10'
                  }`}
                >
                  {message.isEmergency && message.role === 'user' && (
                    <div className="text-xs font-semibold text-red-300 mb-1">
                      🚨 EMERGENCY
                    </div>
                  )}
                  <div className="whitespace-pre-wrap break-words">
                    {message.content}
                  </div>
                  <div
                    className={`text-xs mt-1 ${message.role === 'user' ? 'text-white/60' : 'text-white/40'}`}
                  >
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div
                        className="w-2 h-2 bg-white/60 rounded-full animate-bounce"
                        style={{ animationDelay: '0ms' }}
                      />
                      <div
                        className="w-2 h-2 bg-white/60 rounded-full animate-bounce"
                        style={{ animationDelay: '150ms' }}
                      />
                      <div
                        className="w-2 h-2 bg-white/60 rounded-full animate-bounce"
                        style={{ animationDelay: '300ms' }}
                      />
                    </div>
                    <span className="text-sm text-white/60">
                      AI is thinking...
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/30 backdrop-blur-md border-t border-white/10 pb-safe">
        <div className="max-w-4xl mx-auto px-4 py-4">
          {error && (
            <div className="mb-3 p-3 bg-red-500/20 border border-red-500/50 rounded-xl">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {isEmergency && (
            <div className="mb-3 p-3 bg-red-500/20 border border-red-500/50 rounded-xl">
              <p className="text-red-200 text-sm font-semibold">
                🚨 Emergency mode active - AI will prioritize immediate support
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isEmergency
                  ? "I'm here for you. What's happening right now?"
                  : 'Type your message...'
              }
              disabled={loading}
              className="flex-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none min-h-[52px] max-h-32 disabled:opacity-50"
              rows={1}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="px-6 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white font-semibold rounded-2xl transition-colors disabled:cursor-not-allowed flex items-center justify-center min-w-[52px]"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              )}
            </button>
          </div>

          <p className="text-xs text-white/40 mt-2 text-center">
            Press Enter to send • Shift+Enter for new line •{' '}
            {2000 - input.length} characters remaining
          </p>
        </div>
      </div>
    </div>
  );
}
