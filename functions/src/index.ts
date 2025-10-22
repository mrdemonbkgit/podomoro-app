/**
 * Kamehameha Cloud Functions
 * Phase 4: AI Therapist Chat
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import {onCall, HttpsError} from 'firebase-functions/v2/https';
import {setGlobalOptions} from 'firebase-functions/v2';
import OpenAI from 'openai';
import * as dotenv from 'dotenv';

// Import our modules
import {buildUserContext, formatContextForAI} from './contextBuilder';
import {checkRateLimit} from './rateLimit';
import {
  ChatRequest,
  ChatResponse,
  ChatMessage,
  OpenAIMessage,
  AI_CONFIG,
} from './types';

// Load environment variables
dotenv.config();

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// Set global options for cost control
setGlobalOptions({
  maxInstances: 10,
  region: 'us-central1',
});

/**
 * AI Chat Function - Callable from frontend
 * Handles user messages and returns AI responses
 */
export const chatWithAI = onCall(
  {
    maxInstances: 5,
    timeoutSeconds: 60,
    memory: '256MiB',
  },
  async (request) => {
    try {
      // 1. Verify authentication
      if (!request.auth) {
        throw new HttpsError(
          'unauthenticated',
          'User must be authenticated to chat'
        );
      }

      const userId = request.auth.uid;
      const data = request.data as ChatRequest;

      // 2. Validate input
      if (!data.message || data.message.trim().length === 0) {
        throw new HttpsError('invalid-argument', 'Message cannot be empty');
      }

      if (data.message.length > 2000) {
        throw new HttpsError(
          'invalid-argument',
          'Message too long (max 2000 characters)'
        );
      }

      // 3. Check rate limit
      const rateLimitResult = await checkRateLimit(userId);
      if (!rateLimitResult.allowed) {
        const response: ChatResponse = {
          success: false,
          error: rateLimitResult.reason || 'Rate limit exceeded',
          rateLimitExceeded: true,
        };
        return response;
      }

      // 4. Save user message
      const userMessage: Omit<ChatMessage, 'id'> = {
        userId,
        role: 'user',
        content: data.message,
        createdAt: Date.now(),
        isEmergency: data.isEmergency || false,
      };

      await db
        .collection('users')
        .doc(userId)
        .collection('kamehameha_chatHistory')
        .add(userMessage);

      // 5. Build context
      const context = await buildUserContext(userId, data.isEmergency || false);
      const contextString = formatContextForAI(context);

      // 6. Prepare messages for OpenAI
      const messages: OpenAIMessage[] = [
        // System prompt with context
        {
          role: 'system',
          content: `${context.systemPrompt}\n\n${contextString}`,
        },
        // Recent conversation history
        ...context.recentMessages.map((msg) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        })),
        // Current user message
        {
          role: 'user',
          content: data.message,
        },
      ];

      // 7. Initialize OpenAI and call API
      const openaiApiKey = process.env.OPENAI_API_KEY || functions.config().openai?.key;
      if (!openaiApiKey) {
        throw new HttpsError('internal', 'OpenAI API key not configured');
      }
      
      const openai = new OpenAI({apiKey: openaiApiKey});
      
      const completion = await openai.chat.completions.create({
        model: AI_CONFIG.DEFAULT_MODEL,
        messages,
        temperature: AI_CONFIG.DEFAULT_TEMPERATURE,
        max_tokens: AI_CONFIG.DEFAULT_MAX_TOKENS,
        user: userId, // For OpenAI's abuse monitoring
      });

      const aiResponse = completion.choices[0]?.message?.content || '';

      if (!aiResponse) {
        throw new HttpsError('internal', 'No response from AI');
      }

      // 8. Save AI response
      const aiMessage: Omit<ChatMessage, 'id'> = {
        userId,
        role: 'assistant',
        content: aiResponse,
        createdAt: Date.now(),
        isEmergency: data.isEmergency || false,
      };

      const aiMessageRef = await db
        .collection('users')
        .doc(userId)
        .collection('kamehameha_chatHistory')
        .add(aiMessage);

      // 9. Return response
      const response: ChatResponse = {
        success: true,
        message: {
          ...aiMessage,
          id: aiMessageRef.id,
        },
      };

      // Log successful chat
      console.log(`Chat success - User: ${userId}, Emergency: ${data.isEmergency}`);

      return response;
    } catch (error: any) {
      console.error('Error in chatWithAI:', error);

      // Handle specific error types
      if (error instanceof HttpsError) {
        throw error;
      }

      // Handle OpenAI errors
      if (error.response?.status === 429) {
        throw new HttpsError(
          'resource-exhausted',
          'AI service is busy. Please try again in a moment.'
        );
      }

      if (error.response?.status === 401) {
        throw new HttpsError('internal', 'AI service authentication failed');
      }

      // Generic error
      throw new HttpsError(
        'internal',
        'An error occurred while processing your message'
      );
    }
  }
);

/**
 * Get chat history for a user
 */
export const getChatHistory = onCall(
  {
    maxInstances: 5,
  },
  async (request) => {
    try {
      if (!request.auth) {
        throw new HttpsError('unauthenticated', 'User must be authenticated');
      }

      const userId = request.auth.uid;
      const limit = request.data?.limit || 50;

      const messagesRef = db
        .collection('users')
        .doc(userId)
        .collection('kamehameha_chatHistory')
        .orderBy('createdAt', 'desc')
        .limit(limit);

      const snapshot = await messagesRef.get();

      const messages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return {
        success: true,
        messages: messages.reverse(), // Return in chronological order
      };
    } catch (error: any) {
      console.error('Error fetching chat history:', error);

      if (error instanceof HttpsError) {
        throw error;
      }

      throw new HttpsError('internal', 'Failed to fetch chat history');
    }
  }
);

/**
 * Clear chat history for a user
 */
export const clearChatHistory = onCall(async (request) => {
  try {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    const userId = request.auth.uid;

    const messagesRef = db
      .collection('users')
      .doc(userId)
      .collection('kamehameha_chatHistory');

    const snapshot = await messagesRef.get();

    // Delete in batches
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    console.log(`Chat history cleared for user: ${userId}`);

    return {
      success: true,
      message: `Deleted ${snapshot.size} messages`,
    };
  } catch (error: any) {
    console.error('Error clearing chat history:', error);

    if (error instanceof HttpsError) {
      throw error;
    }

    throw new HttpsError('internal', 'Failed to clear chat history');
  }
});
