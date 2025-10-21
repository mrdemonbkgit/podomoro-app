# Kamehameha - Data Schema

**Last Updated:** October 21, 2025  
**Version:** 1.0

## Overview

This document defines the complete data structure for the Kamehameha feature, including:
- Firestore collection hierarchy
- TypeScript interfaces
- Security rules
- Data validation
- Migration strategy

---

## Firestore Database Structure

### Collection Hierarchy

```
users/ (collection)
  {userId}/ (document)
    profile/ (subcollection)
      {profileId}/ (document)
    
    kamehameha/ (subcollection)
      streaks/ (document - single doc)
      config/ (document - single doc)
      
      checkIns/ (subcollection)
        {checkInId}/ (document)
      
      relapses/ (subcollection)
        {relapseId}/ (document)
      
      chatHistory/ (subcollection)
        {messageId}/ (document)
      
      badges/ (subcollection)
        {badgeId}/ (document)
```

---

## TypeScript Interfaces

### User Profile

```typescript
interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  createdAt: number; // timestamp
  lastLoginAt: number; // timestamp
}
```

**Firestore Path:** `users/{userId}/profile/main`

---

### Streaks

```typescript
interface Streaks {
  main: StreakData;
  discipline: StreakData;
  lastUpdated: number; // timestamp
}

interface StreakData {
  startDate: number; // timestamp when current streak started
  currentSeconds: number; // current streak length in seconds
  longestSeconds: number; // longest streak ever in seconds
  history: StreakHistory[];
}

interface StreakHistory {
  id: string;
  startDate: number;
  endDate: number;
  durationSeconds: number;
  endReason: 'relapse' | 'reset' | null;
}
```

**Firestore Path:** `users/{userId}/kamehameha/streaks`

**Example:**
```json
{
  "main": {
    "startDate": 1697932800000,
    "currentSeconds": 1296000,
    "longestSeconds": 3888000,
    "history": [
      {
        "id": "streak_001",
        "startDate": 1694000000000,
        "endDate": 1697932799999,
        "durationSeconds": 3888000,
        "endReason": "relapse"
      }
    ]
  },
  "discipline": {
    "startDate": 1698019200000,
    "currentSeconds": 1036800,
    "longestSeconds": 2592000,
    "history": []
  },
  "lastUpdated": 1698106000000
}
```

---

### Check-Ins

```typescript
interface CheckIn {
  id: string;
  timestamp: number;
  mood: 1 | 2 | 3 | 4 | 5; // 1=😢, 2=😕, 3=😐, 4=🙂, 5=😊
  urgeIntensity: number; // 0-10
  triggers: string[]; // Array of trigger names
  journalEntry: string;
  createdAt: number;
  updatedAt: number;
}
```

**Firestore Path:** `users/{userId}/kamehameha/checkIns/{checkInId}`

**Example:**
```json
{
  "id": "checkin_20251021_001",
  "timestamp": 1698106000000,
  "mood": 4,
  "urgeIntensity": 3,
  "triggers": ["Stress", "Tired"],
  "journalEntry": "Feeling strong today. Work was stressful but I managed well.",
  "createdAt": 1698106000000,
  "updatedAt": 1698106000000
}
```

---

### Relapses

```typescript
interface Relapse {
  id: string;
  timestamp: number;
  type: 'main' | 'discipline';
  reasons: string[]; // Array of reason strings
  reflection: {
    whatLed: string;
    willDoDifferently: string;
  };
  previousStreakSeconds: number;
  createdAt: number;
}
```

**Firestore Path:** `users/{userId}/kamehameha/relapses/{relapseId}`

**Example:**
```json
{
  "id": "relapse_20251020_001",
  "timestamp": 1698019200000,
  "type": "discipline",
  "reasons": ["Viewed pornography", "TikTok/social media triggers"],
  "reflection": {
    "whatLed": "Stayed up too late, got bored and scrolling social media",
    "willDoDifferently": "Set bedtime alarm, install content filter, avoid phone after 10pm"
  },
  "previousStreakSeconds": 1036800,
  "createdAt": 1698019200000
}
```

---

### Chat Messages

```typescript
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  emergency: boolean; // Was emergency mode active?
  tokenCount?: number; // Optional: track token usage
}
```

**Firestore Path:** `users/{userId}/kamehameha/chatHistory/{messageId}`

**Example:**
```json
{
  "id": "msg_20251021_001",
  "role": "user",
  "content": "Having strong urges right now",
  "timestamp": 1698106100000,
  "emergency": true
}
```

---

### Badges

```typescript
interface Badge {
  id: string;
  milestoneType: 'main' | 'discipline';
  milestoneDays: number; // 1, 3, 7, 14, 30, 60, 90, 180, 365
  name: string;
  emoji: string;
  earnedAt: number; // timestamp
}
```

**Firestore Path:** `users/{userId}/kamehameha/badges/{badgeId}`

**Example:**
```json
{
  "id": "badge_main_7",
  "milestoneType": "main",
  "milestoneDays": 7,
  "name": "One Week Warrior",
  "emoji": "⚔️",
  "earnedAt": 1698019200000
}
```

---

### Configuration

```typescript
interface KamehamehaConfig {
  systemPrompt: string;
  rulesList: string[];
  notificationsEnabled: boolean;
  apiKeyEncrypted?: string; // Deprecated - store in Cloud Functions
  preferences: {
    badgeVisibility: boolean;
    shareAchievements: boolean;
  };
  createdAt: number;
  updatedAt: number;
}
```

**Firestore Path:** `users/{userId}/kamehameha/config`

**Example:**
```json
{
  "systemPrompt": "You are a compassionate PMO recovery therapist...",
  "rulesList": [
    "Viewed pornography",
    "Used AI sex chatbot",
    "Generated AI softcore porn",
    "Consumed text/audio erotica",
    "TikTok/social media triggers"
  ],
  "notificationsEnabled": true,
  "preferences": {
    "badgeVisibility": true,
    "shareAchievements": false
  },
  "createdAt": 1698000000000,
  "updatedAt": 1698106000000
}
```

---

## Firestore Security Rules

### Complete Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    function isValidTimestamp(timestamp) {
      return timestamp is number && timestamp > 0;
    }
    
    // Users collection
    match /users/{userId} {
      // User can read/write their own profile
      allow read, write: if isOwner(userId);
      
      // Profile subcollection
      match /profile/{profileId} {
        allow read, write: if isOwner(userId);
      }
      
      // Kamehameha subcollection
      match /kamehameha/{document=**} {
        allow read, write: if isOwner(userId);
      }
      
      // Specific validation for check-ins
      match /kamehameha/checkIns/{checkInId} {
        allow create: if isOwner(userId)
          && request.resource.data.mood is int
          && request.resource.data.mood >= 1
          && request.resource.data.mood <= 5
          && request.resource.data.urgeIntensity is int
          && request.resource.data.urgeIntensity >= 0
          && request.resource.data.urgeIntensity <= 10
          && isValidTimestamp(request.resource.data.timestamp);
        
        allow update: if isOwner(userId)
          && request.resource.data.id == resource.data.id;
        
        allow delete: if isOwner(userId);
      }
      
      // Specific validation for relapses
      match /kamehameha/relapses/{relapseId} {
        allow create: if isOwner(userId)
          && request.resource.data.type in ['main', 'discipline']
          && isValidTimestamp(request.resource.data.timestamp)
          && request.resource.data.reasons is list
          && request.resource.data.reasons.size() > 0;
        
        allow update, delete: if isOwner(userId);
      }
      
      // Chat history validation
      match /kamehameha/chatHistory/{messageId} {
        allow create: if isOwner(userId)
          && request.resource.data.role in ['user', 'assistant']
          && request.resource.data.content is string
          && request.resource.data.content.size() > 0
          && request.resource.data.content.size() <= 2000;
        
        allow update, delete: if isOwner(userId);
      }
    }
  }
}
```

### Security Principles

1. **User Isolation:** Users can only access their own data
2. **Authentication Required:** All operations require authentication
3. **Data Validation:** Check-ins, relapses validate data types and ranges
4. **No Cross-User Access:** No user can read another user's data
5. **Admin Access:** Consider separate admin rules for support (future)

---

## Data Validation

### Client-Side Validation

```typescript
// Check-in validation
function validateCheckIn(checkIn: Partial<CheckIn>): string[] {
  const errors: string[] = [];
  
  if (!checkIn.mood || checkIn.mood < 1 || checkIn.mood > 5) {
    errors.push('Mood must be between 1 and 5');
  }
  
  if (checkIn.urgeIntensity === undefined || 
      checkIn.urgeIntensity < 0 || 
      checkIn.urgeIntensity > 10) {
    errors.push('Urge intensity must be between 0 and 10');
  }
  
  if (!checkIn.timestamp || checkIn.timestamp <= 0) {
    errors.push('Valid timestamp required');
  }
  
  if (checkIn.journalEntry && checkIn.journalEntry.length > 10000) {
    errors.push('Journal entry too long (max 10,000 characters)');
  }
  
  return errors;
}

// Relapse validation
function validateRelapse(relapse: Partial<Relapse>): string[] {
  const errors: string[] = [];
  
  if (!relapse.type || !['main', 'discipline'].includes(relapse.type)) {
    errors.push('Invalid relapse type');
  }
  
  if (!relapse.reasons || relapse.reasons.length === 0) {
    errors.push('At least one reason required');
  }
  
  if (!relapse.reflection?.whatLed || !relapse.reflection?.willDoDifferently) {
    errors.push('Both reflection prompts required');
  }
  
  return errors;
}

// Chat message validation
function validateChatMessage(message: Partial<ChatMessage>): string[] {
  const errors: string[] = [];
  
  if (!message.role || !['user', 'assistant'].includes(message.role)) {
    errors.push('Invalid message role');
  }
  
  if (!message.content || message.content.trim().length === 0) {
    errors.push('Message content required');
  }
  
  if (message.content && message.content.length > 2000) {
    errors.push('Message too long (max 2,000 characters)');
  }
  
  return errors;
}
```

---

## Indexes

### Required Firestore Indexes

**Query Pattern:** Per-user path queries (data already scoped by `users/{userId}/kamehameha/...`)

**Note:** Since we use per-user subcollections, `userId` is NOT needed in indexes (it's already in the document path).

```
Collection: users/{userId}/kamehameha/checkIns
Fields: timestamp DESC
Purpose: Query check-ins chronologically for specific user

Collection: users/{userId}/kamehameha/relapses
Fields: timestamp DESC
Purpose: Query relapses chronologically for specific user

Collection: users/{userId}/kamehameha/chatHistory
Fields: timestamp ASC
Purpose: Load chat messages in order for specific user

Collection: users/{userId}/kamehameha/badges
Fields: earnedAt DESC
Purpose: Display badges in order earned for specific user
```

**Why no `userId` field?**
- Documents are stored under `users/{userId}/kamehameha/{subcollection}`
- The path already scopes queries to specific user
- Query example: `db.collection('users').doc(userId).collection('checkIns').orderBy('timestamp', 'desc')`
- No collection group queries needed (each user only sees their own data)

### Creating Indexes

Via Firebase Console:
1. Go to Firestore Database
2. Navigate to Indexes tab
3. Create composite indexes as specified above

Or via Firebase CLI:
```bash
firebase deploy --only firestore:indexes
```

**Single-field indexes** (timestamp, earnedAt) are automatically created by Firestore.

---

## Data Migration Strategy

### Initial Setup (New Users)

```typescript
async function initializeUserData(userId: string, profile: UserProfile) {
  const batch = db.batch();
  
  // Create profile
  const profileRef = db.doc(`users/${userId}/profile/main`);
  batch.set(profileRef, profile);
  
  // Initialize streaks
  const streaksRef = db.doc(`users/${userId}/kamehameha/streaks`);
  const now = Date.now();
  batch.set(streaksRef, {
    main: {
      startDate: now,
      currentSeconds: 0,
      longestSeconds: 0,
      history: []
    },
    discipline: {
      startDate: now,
      currentSeconds: 0,
      longestSeconds: 0,
      history: []
    },
    lastUpdated: now
  });
  
  // Initialize config with defaults
  const configRef = db.doc(`users/${userId}/kamehameha/config`);
  batch.set(configRef, {
    systemPrompt: DEFAULT_SYSTEM_PROMPT,
    rulesList: DEFAULT_RULES,
    notificationsEnabled: true,
    preferences: {
      badgeVisibility: true,
      shareAchievements: false
    },
    createdAt: now,
    updatedAt: now
  });
  
  await batch.commit();
}
```

### Future Migrations

When schema changes, use versioning:

```typescript
interface KamehamehaConfig {
  schemaVersion: number; // Add version field
  // ... other fields
}

async function migrateConfigIfNeeded(userId: string) {
  const configRef = db.doc(`users/${userId}/kamehameha/config`);
  const config = await configRef.get();
  const data = config.data();
  
  if (!data.schemaVersion || data.schemaVersion < CURRENT_VERSION) {
    // Perform migration
    await migrateToVersion(configRef, data, CURRENT_VERSION);
  }
}
```

---

## Data Export Format

### Export Structure

```json
{
  "exportDate": "2025-10-21T14:30:00Z",
  "version": "1.0",
  "user": {
    "uid": "user123",
    "email": "user@example.com"
  },
  "kamehameha": {
    "streaks": { ... },
    "checkIns": [ ... ],
    "relapses": [ ... ],
    "chatHistory": [ ... ],
    "badges": [ ... ],
    "config": { ... }
  }
}
```

### Export Function

```typescript
async function exportUserData(userId: string): Promise<object> {
  // Fetch all subcollections
  const streaks = await db.doc(`users/${userId}/kamehameha/streaks`).get();
  const checkIns = await db.collection(`users/${userId}/kamehameha/checkIns`).get();
  const relapses = await db.collection(`users/${userId}/kamehameha/relapses`).get();
  const chatHistory = await db.collection(`users/${userId}/kamehameha/chatHistory`).get();
  const badges = await db.collection(`users/${userId}/kamehameha/badges`).get();
  const config = await db.doc(`users/${userId}/kamehameha/config`).get();
  
  return {
    exportDate: new Date().toISOString(),
    version: '1.0',
    user: {
      uid: userId,
      email: auth.currentUser?.email
    },
    kamehameha: {
      streaks: streaks.data(),
      checkIns: checkIns.docs.map(d => d.data()),
      relapses: relapses.docs.map(d => d.data()),
      chatHistory: chatHistory.docs.map(d => d.data()),
      badges: badges.docs.map(d => d.data()),
      config: config.data()
    }
  };
}
```

---

## Query Examples

### Recent Check-Ins

```typescript
async function getRecentCheckIns(userId: string, limit: number = 10) {
  const snapshot = await db
    .collection(`users/${userId}/kamehameha/checkIns`)
    .orderBy('timestamp', 'desc')
    .limit(limit)
    .get();
  
  return snapshot.docs.map(doc => doc.data() as CheckIn);
}
```

### Check-Ins by Date Range

```typescript
async function getCheckInsByDateRange(
  userId: string, 
  startDate: number, 
  endDate: number
) {
  const snapshot = await db
    .collection(`users/${userId}/kamehameha/checkIns`)
    .where('timestamp', '>=', startDate)
    .where('timestamp', '<=', endDate)
    .orderBy('timestamp', 'desc')
    .get();
  
  return snapshot.docs.map(doc => doc.data() as CheckIn);
}
```

### Recent Chat Messages

```typescript
async function getRecentChatMessages(userId: string, limit: number = 50) {
  const snapshot = await db
    .collection(`users/${userId}/kamehameha/chatHistory`)
    .orderBy('timestamp', 'asc')
    .limit(limit)
    .get();
  
  return snapshot.docs.map(doc => doc.data() as ChatMessage);
}
```

### Real-time Streak Updates

```typescript
function subscribeToStreaks(userId: string, callback: (streaks: Streaks) => void) {
  return db
    .doc(`users/${userId}/kamehameha/streaks`)
    .onSnapshot(snapshot => {
      const data = snapshot.data() as Streaks;
      callback(data);
    });
}
```

---

## Performance Optimization

### Best Practices

1. **Use Subcollections:** Organize data hierarchically for efficient queries
2. **Limit Query Results:** Always use `.limit()` to prevent large reads
3. **Index Fields:** Create indexes for frequently queried fields
4. **Batch Writes:** Use batch writes for multiple updates
5. **Cache Data:** Cache frequently accessed data (streaks, config)
6. **Pagination:** Implement pagination for large collections

### Caching Strategy

```typescript
// Cache streaks in memory with 1-minute refresh
let streaksCache: { data: Streaks; timestamp: number } | null = null;
const CACHE_DURATION = 60000; // 1 minute

async function getCachedStreaks(userId: string): Promise<Streaks> {
  const now = Date.now();
  
  if (streaksCache && now - streaksCache.timestamp < CACHE_DURATION) {
    return streaksCache.data;
  }
  
  const snapshot = await db.doc(`users/${userId}/kamehameha/streaks`).get();
  const data = snapshot.data() as Streaks;
  
  streaksCache = { data, timestamp: now };
  return data;
}
```

---

## Cost Estimation

### Firestore Pricing (as of 2025)

**Free Tier:**
- 50K document reads/day
- 20K document writes/day
- 20K document deletes/day
- 1 GB storage

**Paid Tier:**
- $0.06 per 100K document reads
- $0.18 per 100K document writes
- $0.02 per 100K document deletes
- $0.18 per GB/month storage

### Typical User Cost Estimate

**Assumptions:**
- 5 check-ins per week = 260/year
- 1 chat session/week = 52/year, ~20 messages each = 1,040 messages/year
- Real-time listeners: streaks (1), chat (1)

**Annual Operations:**
- Writes: ~1,300 (check-ins + chat)
- Reads: ~10,000 (loading data, real-time updates)
- Storage: ~10 MB per user

**Cost per user/year:** < $0.10 (well within free tier for most users)

---

## Related Documentation

- [SPEC.md](SPEC.md) - Feature requirements
- [AI_INTEGRATION.md](AI_INTEGRATION.md) - OpenAI and Cloud Functions
- [SECURITY.md](SECURITY.md) - Security and privacy
- [OVERVIEW.md](OVERVIEW.md) - Feature overview

---

**Next:** Read [AI_INTEGRATION.md](AI_INTEGRATION.md) for OpenAI setup and Cloud Functions implementation.

