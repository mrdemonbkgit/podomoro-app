/**
 * Scheduled Milestone Detection Cloud Function
 * 
 * Runs every 1 minute via Cloud Scheduler
 * Checks all active journeys and creates badges for crossed milestones
 * 
 * Benefits:
 * - Works even when app is closed (offline milestone detection)
 * - No race conditions (not triggered by client writes)
 * - Reliable timing
 * - Idempotent (safe to retry)
 * 
 * Technical Implementation:
 * - Uses collectionGroup('kamehameha') to find all kamehameha collections
 * - Filters by FieldPath.documentId() == 'streaks' to get streak documents
 * - This works with our schema: users/{uid}/kamehameha/streaks (document)
 */

import {onSchedule} from 'firebase-functions/v2/scheduler';
import * as admin from 'firebase-admin';
import {FieldValue, FieldPath} from 'firebase-admin/firestore';
import {MILESTONE_SECONDS, getBadgeConfig} from './milestoneConstants';

/**
 * Scheduled function that runs every 1 minute
 * Checks all users with active journeys and creates badges as needed
 */
export const checkMilestonesScheduled = onSchedule(
  {
    schedule: 'every 1 minutes',
    timeZone: 'UTC',
    maxInstances: 1, // Only one instance at a time
    memory: '256MiB',
  },
  async (event) => {
    const db = admin.firestore();
    const now = Date.now();
    
    console.log(`🕐 Scheduled milestone check started at ${new Date(now).toISOString()}`);
    
    try {
      // Get all users with an active journey (currentJourneyId exists)
      // Query kamehameha collection group and filter for 'streaks' documents
      // This works with schema: users/{uid}/kamehameha/streaks (document)
      const usersSnapshot = await db
        .collectionGroup('kamehameha')
        .where(FieldPath.documentId(), '==', 'streaks')
        .where('currentJourneyId', '!=', null)
        .get();
      
      console.log(`   Found ${usersSnapshot.size} users with active journeys`);
      
      let totalBadgesCreated = 0;
      let usersProcessed = 0;
      
      // Process each user
      for (const streakDoc of usersSnapshot.docs) {
        try {
          // Extract userId from doc path: users/{userId}/kamehameha/streaks
          const pathParts = streakDoc.ref.path.split('/');
          const userId = pathParts[1];
          const currentJourneyId = streakDoc.data().currentJourneyId;
          
          if (!currentJourneyId) continue;
          
          // Load the active journey
          const journeyRef = db
            .collection('users')
            .doc(userId)
            .collection('kamehameha_journeys')
            .doc(currentJourneyId);
          
          const journeySnap = await journeyRef.get();
          
          if (!journeySnap.exists) {
            console.warn(`   ⚠️ Journey ${currentJourneyId} not found for user ${userId}`);
            continue;
          }
          
          const journey = journeySnap.data();
          
          // Skip if journey is not active
          if (journey?.endDate !== null) {
            console.log(`   ⏭️ Journey ${currentJourneyId} already ended, skipping`);
            continue;
          }
          
          // Calculate current duration
          const currentSeconds = Math.floor((now - journey.startDate) / 1000);
          
          // Check each milestone
          const badgesCreated = await checkJourneyMilestones(
            db,
            userId,
            currentJourneyId,
            journey.startDate,
            currentSeconds,
            now
          );
          
          totalBadgesCreated += badgesCreated;
          usersProcessed++;
          
        } catch (error) {
          console.error(`   ❌ Error processing user:`, error);
          // Continue with next user
        }
      }
      
      console.log(`✅ Milestone check complete: ${usersProcessed} users processed, ${totalBadgesCreated} badges created`);
      
    } catch (error) {
      console.error('❌ Fatal error in scheduled milestone check:', error);
      throw error;
    }
  }
);

/**
 * Check and create badges for a specific journey
 * Returns number of badges created
 */
async function checkJourneyMilestones(
  db: admin.firestore.Firestore,
  userId: string,
  journeyId: string,
  startDate: number,
  currentSeconds: number,
  now: number
): Promise<number> {
  
  let badgesCreated = 0;
  
  // Check each milestone threshold
  for (const milestoneSeconds of MILESTONE_SECONDS) {
    // Skip milestones not yet reached
    if (currentSeconds < milestoneSeconds) {
      continue;
    }
    
    // Use deterministic badge ID for idempotency
    const badgeId = `${journeyId}_${milestoneSeconds}`;
    const badgeRef = db
      .collection('users')
      .doc(userId)
      .collection('kamehameha_badges')
      .doc(badgeId);
    
    // Check if badge already exists (idempotent check)
    const badgeSnap = await badgeRef.get();
    
    if (badgeSnap.exists) {
      // Badge already created, skip
      continue;
    }
    
    // Create new badge
    const badgeConfig = getBadgeConfig(milestoneSeconds);
    
    try {
      // Use setDoc for idempotency (safe to call multiple times)
      await badgeRef.set({
        journeyId,
        milestoneSeconds,
        earnedAt: now,
        badgeEmoji: badgeConfig.emoji,
        badgeName: badgeConfig.name,
        congratsMessage: badgeConfig.message,
        createdBy: 'scheduled_function',
      });
      
      // Increment journey achievements count
      const journeyRef = db
        .collection('users')
        .doc(userId)
        .collection('kamehameha_journeys')
        .doc(journeyId);
      
      await journeyRef.update({
        achievementsCount: FieldValue.increment(1),
        updatedAt: now,
      });
      
      console.log(`   🎉 Badge created: ${badgeConfig.name} for user ${userId}, journey ${journeyId}`);
      badgesCreated++;
      
    } catch (error) {
      console.error(`   ❌ Error creating badge ${badgeId}:`, error);
      // Continue with next milestone
    }
  }
  
  return badgesCreated;
}

