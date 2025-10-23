/**
 * Milestone Detection Cloud Function
 * Triggers when user streak data updates
 */

import {onDocumentWritten} from 'firebase-functions/v2/firestore';
import * as admin from 'firebase-admin';
import {FieldValue} from 'firebase-admin/firestore';
import {MILESTONE_SECONDS, getBadgeConfig} from './milestoneConstants';

// Note: Admin is initialized in index.ts, so we don't need to initialize here

export const checkMilestones = onDocumentWritten(
  'users/{userId}/kamehameha/streaks',
  async (event) => {
    const userId = event.params.userId;
    const beforeData = event.data?.before?.data();
    const afterData = event.data?.after?.data();

    // Skip if document was deleted or created (not updated)
    if (!beforeData || !afterData) {
      console.log('Skipping: Document created or deleted');
      return;
    }

    const db = admin.firestore();

    // Phase 5.1: Only check Main Streak (no discipline milestones)
    // Get current journey ID
    const currentJourneyId = afterData.currentJourneyId;
    if (!currentJourneyId) {
      console.log('⚠️ No currentJourneyId found, skipping milestone check');
      return;
    }

    console.log(`Checking milestones for journey: ${currentJourneyId}`);

    await checkStreakMilestone(
      db,
      userId,
      currentJourneyId,
      beforeData.main?.currentSeconds || 0,
      afterData.main?.currentSeconds || 0
    );
  }
);

/**
 * Check if a streak crossed a milestone threshold
 * Phase 5.1: Links badge to journey
 */
async function checkStreakMilestone(
  db: admin.firestore.Firestore,
  userId: string,
  journeyId: string,
  prevSeconds: number,
  currentSeconds: number
): Promise<void> {
  // Find milestone that was crossed
  const crossedMilestone = MILESTONE_SECONDS.find(
    (m) => prevSeconds < m && currentSeconds >= m
  );

  if (!crossedMilestone) {
    return; // No milestone crossed
  }

  console.log(
    `🎯 Milestone detected: User ${userId}, Journey ${journeyId}, ${crossedMilestone}s`
  );

  // Phase 5.1: Check if a badge for this milestone was earned recently in THIS journey
  // This prevents duplicate badges from being created by rapid updates
  const cutoffTime = Date.now() - 90000; // 90 seconds window
  console.log(`   Checking for existing badge (${crossedMilestone}s) in journey ${journeyId} after ${new Date(cutoffTime).toISOString()}`);
  
  const recentBadges = await db
    .collection('users')
    .doc(userId)
    .collection('kamehameha_badges')
    .where('journeyId', '==', journeyId) // ← Phase 5.1: Check by journeyId instead of streakType
    .where('milestoneSeconds', '==', crossedMilestone)
    .where('earnedAt', '>', cutoffTime) // Last 90 seconds
    .limit(1)
    .get();

  if (!recentBadges.empty) {
    console.log(`⏭️ Badge already exists (earned recently), skipping duplicate`);
    console.log(`   Found badge ID: ${recentBadges.docs[0].id}, earned ${Math.floor((Date.now() - recentBadges.docs[0].data().earnedAt) / 1000)}s ago`);
    return;
  }

  // Create badge linked to journey
  const badgeConfig = getBadgeConfig(crossedMilestone);
  const now = Date.now();
  
  await db
    .collection('users')
    .doc(userId)
    .collection('kamehameha_badges')
    .add({
      journeyId, // ← Phase 5.1: Link to current journey
      milestoneSeconds: crossedMilestone,
      earnedAt: now,
      badgeEmoji: badgeConfig.emoji,
      badgeName: badgeConfig.name,
      congratsMessage: badgeConfig.message,
    });

  // Phase 5.1: Increment journey achievements count
  await db
    .collection('users')
    .doc(userId)
    .collection('kamehameha_journeys')
    .doc(journeyId)
    .update({
      achievementsCount: FieldValue.increment(1),
      updatedAt: now,
    });

  console.log(`🎉 Badge created: ${badgeConfig.name} for journey ${journeyId}`);
  console.log(`   Journey achievements count incremented`);
}

