/**
 * Rate Limiting for AI Chat
 * Prevents abuse and controls costs by limiting messages per user
 */

import * as admin from 'firebase-admin';
import {RateLimitData, RateLimitResult, RATE_LIMIT} from './types';

/**
 * Check if user is within rate limit and update count
 * Returns allowed status and remaining messages
 */
export async function checkRateLimit(userId: string): Promise<RateLimitResult> {
  try {
    const db = admin.firestore();
    const rateLimitRef = db
      .collection('users')
      .doc(userId)
      .collection('kamehameha_rateLimits')
      .doc('chat');

    // Use transaction to ensure atomic read-write
    const result = await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(rateLimitRef);
      const now = Date.now();

      let rateLimitData: RateLimitData;

      if (!doc.exists) {
        // First message ever - initialize rate limit
        rateLimitData = {
          userId,
          messageCount: 1,
          windowStart: now,
          windowEnd: now + RATE_LIMIT.WINDOW_DURATION_MS,
          lastReset: now,
        };

        transaction.set(rateLimitRef, rateLimitData);

        return {
          allowed: true,
          remaining: RATE_LIMIT.MAX_MESSAGES_PER_MINUTE - 1,
          resetAt: rateLimitData.windowEnd,
        };
      }

      rateLimitData = doc.data() as RateLimitData;

      // Check if window has expired
      if (now >= rateLimitData.windowEnd) {
        // Reset the window
        rateLimitData = {
          userId,
          messageCount: 1,
          windowStart: now,
          windowEnd: now + RATE_LIMIT.WINDOW_DURATION_MS,
          lastReset: now,
        };

        transaction.set(rateLimitRef, rateLimitData);

        return {
          allowed: true,
          remaining: RATE_LIMIT.MAX_MESSAGES_PER_MINUTE - 1,
          resetAt: rateLimitData.windowEnd,
        };
      }

      // Within current window - check count
      if (rateLimitData.messageCount >= RATE_LIMIT.MAX_MESSAGES_PER_MINUTE) {
        // Rate limit exceeded
        return {
          allowed: false,
          remaining: 0,
          resetAt: rateLimitData.windowEnd,
          reason: `Rate limit exceeded. Maximum ${RATE_LIMIT.MAX_MESSAGES_PER_MINUTE} messages per minute.`,
        };
      }

      // Increment count
      rateLimitData.messageCount += 1;
      transaction.update(rateLimitRef, {
        messageCount: rateLimitData.messageCount,
      });

      return {
        allowed: true,
        remaining: RATE_LIMIT.MAX_MESSAGES_PER_MINUTE - rateLimitData.messageCount,
        resetAt: rateLimitData.windowEnd,
      };
    });

    return result;
  } catch (error) {
    console.error('Error checking rate limit:', error);

    // On error, allow the message but log it
    // Better to let legitimate users through than block them on errors
    return {
      allowed: true,
      remaining: 0,
      resetAt: Date.now() + RATE_LIMIT.WINDOW_DURATION_MS,
      reason: 'Rate limit check failed, allowing message',
    };
  }
}

/**
 * Get current rate limit status for a user (without incrementing)
 */
export async function getRateLimitStatus(userId: string): Promise<RateLimitResult> {
  try {
    const db = admin.firestore();
    const rateLimitRef = db
      .collection('users')
      .doc(userId)
      .collection('kamehameha_rateLimits')
      .doc('chat');

    const doc = await rateLimitRef.get();
    const now = Date.now();

    if (!doc.exists) {
      return {
        allowed: true,
        remaining: RATE_LIMIT.MAX_MESSAGES_PER_MINUTE,
        resetAt: now + RATE_LIMIT.WINDOW_DURATION_MS,
      };
    }

    const rateLimitData = doc.data() as RateLimitData;

    // Check if window has expired
    if (now >= rateLimitData.windowEnd) {
      return {
        allowed: true,
        remaining: RATE_LIMIT.MAX_MESSAGES_PER_MINUTE,
        resetAt: now + RATE_LIMIT.WINDOW_DURATION_MS,
      };
    }

    // Within current window
    const remaining = RATE_LIMIT.MAX_MESSAGES_PER_MINUTE - rateLimitData.messageCount;

    return {
      allowed: remaining > 0,
      remaining: Math.max(0, remaining),
      resetAt: rateLimitData.windowEnd,
    };
  } catch (error) {
    console.error('Error getting rate limit status:', error);
    return {
      allowed: true,
      remaining: 0,
      resetAt: Date.now() + RATE_LIMIT.WINDOW_DURATION_MS,
    };
  }
}

/**
 * Reset rate limit for a user (admin/testing purposes)
 */
export async function resetRateLimit(userId: string): Promise<void> {
  try {
    const db = admin.firestore();
    const rateLimitRef = db
      .collection('users')
      .doc(userId)
      .collection('kamehameha_rateLimits')
      .doc('chat');

    await rateLimitRef.delete();
    console.log(`Rate limit reset for user: ${userId}`);
  } catch (error) {
    console.error('Error resetting rate limit:', error);
    throw error;
  }
}

