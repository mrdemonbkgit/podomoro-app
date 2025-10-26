/**
 * Context Builder for AI Chat
 * Fetches user data from Firestore to provide rich context to the AI
 */

import * as admin from 'firebase-admin';
import {
  UserContext,
  CheckInSummary,
  RelapseSummary,
  ChatMessage,
  FirestoreStreaks,
  FirestoreCheckIn,
  FirestoreRelapse,
  AI_CONFIG,
  DEFAULT_SYSTEM_PROMPT,
  EMERGENCY_SYSTEM_PROMPT_ADDITION,
} from './types';

/**
 * Build complete user context for AI conversation
 */
export async function buildUserContext(
  userId: string,
  isEmergency: boolean = false
): Promise<UserContext> {
  try {
    // Fetch all user data in parallel
    const [
      streaksData,
      checkInsData,
      relapsesData,
      messagesData,
      configData,
    ] = await Promise.all([
      getStreakInfo(userId),
      getRecentCheckIns(userId),
      getRecentRelapses(userId),
      getRecentMessages(userId),
      getAIConfig(userId),
    ]);

    const systemPrompt = configData
      ? configData.systemPrompt
      : DEFAULT_SYSTEM_PROMPT;

    const fullPrompt = isEmergency
      ? systemPrompt + EMERGENCY_SYSTEM_PROMPT_ADDITION
      : systemPrompt;

    return {
      userId,
      currentJourney: streaksData.currentJourney,
      longestStreak: streaksData.longestStreak,
      recentCheckIns: checkInsData,
      recentRelapses: relapsesData,
      recentMessages: messagesData,
      systemPrompt: fullPrompt,
      isEmergency,
    };
  } catch (error) {
    console.error('Error building user context:', error);
    // Return minimal context on error
    return {
      userId,
      currentJourney: null,
      longestStreak: 0,
      recentCheckIns: [],
      recentRelapses: [],
      recentMessages: [],
      systemPrompt: isEmergency
        ? DEFAULT_SYSTEM_PROMPT + EMERGENCY_SYSTEM_PROMPT_ADDITION
        : DEFAULT_SYSTEM_PROMPT,
      isEmergency,
    };
  }
}

/**
 * Get user's current journey and streak information (Phase 5.1 Schema)
 */
async function getStreakInfo(userId: string): Promise<{
  currentJourney: { durationSeconds: number; achievementsCount: number; violationsCount: number } | null;
  longestStreak: number;
}> {
  try {
    const streaksRef = admin.firestore()
      .collection('users')
      .doc(userId)
      .collection('kamehameha')
      .doc('streaks');

    const streaksDoc = await streaksRef.get();

    if (!streaksDoc.exists) {
      return {
        currentJourney: null,
        longestStreak: 0,
      };
    }

    const data = streaksDoc.data() as FirestoreStreaks;
    const currentJourneyId = data.currentJourneyId;
    let currentJourney = null;

    // If there's an active journey, fetch its details
    if (currentJourneyId) {
      const journeyRef = admin.firestore()
        .collection('users')
        .doc(userId)
        .collection('kamehameha_journeys')
        .doc(currentJourneyId);

      const journeyDoc = await journeyRef.get();
      if (journeyDoc.exists) {
        const journeyData = journeyDoc.data();
        const now = Date.now();
        const durationSeconds = journeyData?.endDate
          ? (journeyData.finalSeconds || 0)
          : Math.floor((now - (journeyData?.startDate || now)) / 1000);

        currentJourney = {
          durationSeconds,
          achievementsCount: journeyData?.achievementsCount || 0,
          violationsCount: journeyData?.violationsCount || 0,
        };
      }
    }

    return {
      currentJourney,
      longestStreak: data.main.longestSeconds,
    };
  } catch (error) {
    console.error('Error fetching streak info:', error);
    return {
      currentJourney: null,
      longestStreak: 0,
    };
  }
}

/**
 * Get user's recent check-ins
 */
async function getRecentCheckIns(userId: string): Promise<CheckInSummary[]> {
  try {
    const checkInsRef = admin.firestore()
      .collection('users')
      .doc(userId)
      .collection('kamehameha_checkIns')
      .orderBy('createdAt', 'desc')
      .limit(AI_CONFIG.MAX_CHECKINS_CONTEXT);

    const snapshot = await checkInsRef.get();

    return snapshot.docs.map((doc) => {
      const data = doc.data() as FirestoreCheckIn;
      return {
        date: data.createdAt,
        mood: data.mood || 'not specified',
        urgeIntensity: data.urgeIntensity || 0,
        triggers: data.triggers || [],
      };
    });
  } catch (error) {
    console.error('Error fetching check-ins:', error);
    return [];
  }
}

/**
 * Get user's recent relapses
 */
async function getRecentRelapses(userId: string): Promise<RelapseSummary[]> {
  try {
    const relapsesRef = admin.firestore()
      .collection('users')
      .doc(userId)
      .collection('kamehameha_relapses')
      .orderBy('createdAt', 'desc')
      .limit(AI_CONFIG.MAX_RELAPSES_CONTEXT);

    const snapshot = await relapsesRef.get();

    return snapshot.docs.map((doc) => {
      const data = doc.data() as FirestoreRelapse;
      return {
        date: data.createdAt,
        type: data.type,
        streakType: data.streakType,
        previousStreakDays: Math.floor(data.previousStreakSeconds / 86400),
      };
    });
  } catch (error) {
    console.error('Error fetching relapses:', error);
    return [];
  }
}

/**
 * Get recent chat messages for context
 */
async function getRecentMessages(userId: string): Promise<ChatMessage[]> {
  try {
    const messagesRef = admin.firestore()
      .collection('users')
      .doc(userId)
      .collection('kamehameha_chatHistory')
      .orderBy('createdAt', 'desc')
      .limit(AI_CONFIG.MAX_CONTEXT_MESSAGES);

    const snapshot = await messagesRef.get();

    const messages = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        role: data.role,
        content: data.content,
        createdAt: data.createdAt,
        isEmergency: data.isEmergency || false,
      } as ChatMessage;
    });

    // Reverse to get chronological order (oldest first)
    return messages.reverse();
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
}

/**
 * Get user's AI configuration (custom system prompt)
 */
async function getAIConfig(userId: string): Promise<{systemPrompt: string} | null> {
  try {
    const configRef = admin.firestore()
      .collection('users')
      .doc(userId)
      .collection('kamehameha')
      .doc('config');

    const configDoc = await configRef.get();

    if (!configDoc.exists) {
      return null;
    }

    const data = configDoc.data();
    return {
      systemPrompt: data?.systemPrompt || DEFAULT_SYSTEM_PROMPT,
    };
  } catch (error) {
    console.error('Error fetching AI config:', error);
    return null;
  }
}

/**
 * Format user context into a human-readable string for system message
 */
export function formatContextForAI(context: UserContext): string {
  const parts: string[] = [];

  // Journey information (Phase 5.1)
  parts.push(`**User's Current Status:**`);
  if (context.currentJourney) {
    const days = Math.floor(context.currentJourney.durationSeconds / 86400);
    const hours = Math.floor((context.currentJourney.durationSeconds % 86400) / 3600);
    parts.push(`- Current Journey: ${days}d ${hours}h (${context.currentJourney.achievementsCount} achievements, ${context.currentJourney.violationsCount} violations)`);
  } else {
    parts.push(`- No active journey`);
  }
  const longestDays = Math.floor(context.longestStreak / 86400);
  parts.push(`- Longest Streak: ${longestDays} days`);

  // Recent check-ins
  if (context.recentCheckIns.length > 0) {
    parts.push(`\n**Recent Check-Ins:**`);
    context.recentCheckIns.forEach((checkIn, index) => {
      const date = new Date(checkIn.date).toLocaleDateString();
      parts.push(`${index + 1}. ${date} - Mood: ${checkIn.mood}, Urge: ${checkIn.urgeIntensity}/10${checkIn.triggers.length > 0 ? `, Triggers: ${checkIn.triggers.join(', ')}` : ''}`);
    });
  }

  // Recent relapses
  if (context.recentRelapses.length > 0) {
    parts.push(`\n**Recent Relapses:**`);
    context.recentRelapses.forEach((relapse, index) => {
      const date = new Date(relapse.date).toLocaleDateString();
      const typeText = relapse.type === 'full_pmo' ? 'Full PMO' : 'Rule Violation';
      parts.push(`${index + 1}. ${date} - ${typeText} (Lost ${relapse.previousStreakDays} day streak)`);
    });
  }

  // Emergency flag
  if (context.isEmergency) {
    parts.push(`\n⚠️ **EMERGENCY: User is experiencing strong urges right now!**`);
  }

  return parts.join('\n');
}

