/**
 * AI Chat Service
 * Frontend service for interacting with AI therapist Cloud Functions
 */

import {httpsCallable} from 'firebase/functions';
import {
  collection,
  query,
  orderBy,
  limit as firestoreLimit,
  onSnapshot,
  getDocs,
  deleteDoc,
  doc,
  Unsubscribe,
} from 'firebase/firestore';
import {db, functions} from '../../../services/firebase/config';
import type {ChatMessage} from '../types/kamehameha.types';
import {logger} from '../../../utils/logger';

// ============================================================================
// Cloud Function Interfaces
// ============================================================================

interface ChatRequest {
  message: string;
  isEmergency?: boolean;
}

interface ChatResponse {
  success: boolean;
  message?: ChatMessage & {userId: string; createdAt: number};
  error?: string;
  rateLimitExceeded?: boolean;
}

interface ClearHistoryResponse {
  success: boolean;
  message: string;
}

// ============================================================================
// Cloud Function References
// ============================================================================

const chatWithAIFunction = httpsCallable<ChatRequest, ChatResponse>(functions, 'chatWithAI');
const clearChatHistoryFunction = httpsCallable<void, ClearHistoryResponse>(functions, 'clearChatHistory');

// ============================================================================
// Chat Operations
// ============================================================================

/**
 * Send a message to the AI therapist
 */
export async function sendMessage(
  message: string,
  isEmergency: boolean = false
): Promise<ChatMessage> {
  try {
    const result = await chatWithAIFunction({
      message,
      isEmergency,
    });

    if (!result.data.success) {
      if (result.data.rateLimitExceeded) {
        throw new Error('Rate limit exceeded. Please wait a moment and try again.');
      }
      throw new Error(result.data.error || 'Failed to send message');
    }

    if (!result.data.message) {
      throw new Error('No response from AI');
    }

    // Convert to frontend ChatMessage format
    return {
      id: result.data.message.id,
      role: result.data.message.role,
      content: result.data.message.content,
      timestamp: result.data.message.createdAt,
      isEmergency: result.data.message.isEmergency,
    };
  } catch (error: any) {
    console.error('Error sending message:', error);
    
    // Handle specific error types
    if (error.code === 'unauthenticated') {
      throw new Error('You must be logged in to chat');
    }
    
    if (error.code === 'resource-exhausted') {
      throw new Error('AI service is busy. Please try again in a moment.');
    }
    
    throw new Error(error.message || 'Failed to send message');
  }
}

/**
 * Get chat history from Firestore
 */
export async function getChatHistory(
  userId: string,
  limitCount: number = 50
): Promise<ChatMessage[]> {
  try {
    const messagesRef = collection(db, 'users', userId, 'kamehameha_chatHistory');
    const q = query(messagesRef, orderBy('createdAt', 'desc'), firestoreLimit(limitCount));
    
    const snapshot = await getDocs(q);
    
    const messages = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        role: data.role as 'user' | 'assistant',
        content: data.content,
        timestamp: data.createdAt,
        isEmergency: data.isEmergency || false,
      };
    });
    
    // Return in chronological order (oldest first)
    return messages.reverse();
  } catch (error) {
    console.error('Error fetching chat history:', error);
    throw new Error('Failed to load chat history');
  }
}

/**
 * Subscribe to real-time chat updates
 */
export function subscribeToChatMessages(
  userId: string,
  callback: (messages: ChatMessage[]) => void,
  limitCount: number = 50
): Unsubscribe {
  const messagesRef = collection(db, 'users', userId, 'kamehameha_chatHistory');
  const q = query(messagesRef, orderBy('createdAt', 'desc'), firestoreLimit(limitCount));
  
  return onSnapshot(
    q,
    (snapshot) => {
      const messages = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          role: data.role as 'user' | 'assistant',
          content: data.content,
          timestamp: data.createdAt,
          isEmergency: data.isEmergency || false,
        };
      });
      
      // Call callback with messages in chronological order
      callback(messages.reverse());
    },
    (error) => {
      console.error('Error in chat subscription:', error);
    }
  );
}

/**
 * Clear all chat history
 */
export async function clearChatHistory(): Promise<void> {
  try {
    const result = await clearChatHistoryFunction();
    
    if (!result.data.success) {
      throw new Error('Failed to clear chat history');
    }
    
    logger.debug('Chat history cleared:', result.data.message);
  } catch (error: any) {
    console.error('Error clearing chat history:', error);
    
    if (error.code === 'unauthenticated') {
      throw new Error('You must be logged in to clear chat history');
    }
    
    throw new Error(error.message || 'Failed to clear chat history');
  }
}

/**
 * Delete a specific message
 */
export async function deleteMessage(userId: string, messageId: string): Promise<void> {
  try {
    const messageRef = doc(db, 'users', userId, 'kamehameha_chatHistory', messageId);
    await deleteDoc(messageRef);
  } catch (error) {
    console.error('Error deleting message:', error);
    throw new Error('Failed to delete message');
  }
}

/**
 * Get rate limit status (for UI feedback)
 * Note: This is client-side only, actual enforcement is server-side
 */
export async function getRateLimitStatus(): Promise<{
  remaining: number;
  resetAt: number;
}> {
  // This would need a separate Cloud Function to expose rate limit status
  // For now, return a default/estimated value
  // The server enforces the actual limit
  return {
    remaining: 10,
    resetAt: Date.now() + 60000, // 1 minute from now
  };
}

