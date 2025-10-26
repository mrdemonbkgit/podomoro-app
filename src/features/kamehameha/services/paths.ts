/**
 * Centralized Firestore paths
 * Single source of truth for all path construction
 * 
 * IMPORTANT: Distinguishes between COLLECTIONS and DOCUMENTS
 * - COLLECTION_PATHS: Contains multiple documents (use with collection())
 * - DOCUMENT_PATHS: Single documents (use with doc())
 * 
 * All services and hooks MUST import from this file.
 * Do NOT use hardcoded path strings elsewhere.
 */

// Collections (contain multiple documents)
export const COLLECTION_PATHS = {
  checkIns: (userId: string) => `users/${userId}/kamehameha_checkIns`,
  relapses: (userId: string) => `users/${userId}/kamehameha_relapses`,
  journeys: (userId: string) => `users/${userId}/kamehameha_journeys`,
  badges: (userId: string) => `users/${userId}/kamehameha_badges`,
  chatMessages: (userId: string) => `users/${userId}/kamehameha_chatHistory`, // NOTE: Production uses 'chatHistory' not 'chat_messages'
} as const;

// Documents (single documents, NOT collections)
export const DOCUMENT_PATHS = {
  streak: (userId: string) => `users/${userId}/kamehameha/streaks`, // This is a DOCUMENT, not a collection!
} as const;

// Helper to get document references within collections
export const getDocPath = {
  checkIn: (userId: string, id: string) => `${COLLECTION_PATHS.checkIns(userId)}/${id}`,
  relapse: (userId: string, id: string) => `${COLLECTION_PATHS.relapses(userId)}/${id}`,
  journey: (userId: string, id: string) => `${COLLECTION_PATHS.journeys(userId)}/${id}`,
  badge: (userId: string, id: string) => `${COLLECTION_PATHS.badges(userId)}/${id}`,
  chatMessage: (userId: string, id: string) => `${COLLECTION_PATHS.chatMessages(userId)}/${id}`,
} as const;

