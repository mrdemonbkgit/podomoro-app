/**
 * Milestone Detection Cloud Function
 * Triggers when user streak data updates
 */

import {onDocumentWritten} from 'firebase-functions/v2/firestore';
import * as admin from 'firebase-admin';
import {MILESTONE_SECONDS, getBadgeConfig} from './milestoneConstants';

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

    // Check Main Streak
    await checkStreakMilestone(
      db,
      userId,
      'main',
      beforeData.main?.currentSeconds || 0,
      afterData.main?.currentSeconds || 0
    );

    // Check Discipline Streak
    await checkStreakMilestone(
      db,
      userId,
      'discipline',
      beforeData.discipline?.currentSeconds || 0,
      afterData.discipline?.currentSeconds || 0
    );
  }
);

/**
 * Check if a streak crossed a milestone threshold
 */
async function checkStreakMilestone(
  db: admin.firestore.Firestore,
  userId: string,
  streakType: 'main' | 'discipline',
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
    `Milestone detected: User ${userId}, ${streakType}, ${crossedMilestone}s`
  );

  // Check if badge already exists (idempotent)
  const existingBadges = await db
    .collection('users')
    .doc(userId)
    .collection('kamehameha_badges')
    .where('streakType', '==', streakType)
    .where('milestoneSeconds', '==', crossedMilestone)
    .limit(1)
    .get();

  if (!existingBadges.empty) {
    console.log('Badge already exists, skipping');
    return; // Badge already earned
  }

  // Create badge
  const badgeConfig = getBadgeConfig(crossedMilestone);
  await db
    .collection('users')
    .doc(userId)
    .collection('kamehameha_badges')
    .add({
      streakType,
      milestoneSeconds: crossedMilestone,
      earnedAt: Date.now(),
      badgeEmoji: badgeConfig.emoji,
      badgeName: badgeConfig.name,
      congratsMessage: badgeConfig.message,
    });

  console.log(`🎉 Badge created: ${badgeConfig.name} for ${streakType} streak`);
}

