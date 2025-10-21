# Kamehameha - Security & Privacy

**Last Updated:** October 21, 2025  
**Version:** 1.0

## Overview

This document covers security and privacy considerations for the Kamehameha PMO recovery tool, including:
- Security architecture
- Data protection
- Privacy compliance
- Authentication and authorization
- Threat mitigation
- Best practices

---

## Security Architecture

### Defense in Depth

```
┌─────────────────────────────────────────┐
│  Frontend (React)                       │
│  - Client-side validation               │
│  - No sensitive data in localStorage    │
│  - Secure API calls only                │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│  Firebase Authentication                │
│  - Google OAuth 2.0                     │
│  - Secure tokens (JWT)                  │
│  - Session management                   │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│  Firestore Security Rules               │
│  - User data isolation                  │
│  - Type validation                      │
│  - Rate limiting                        │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│  Cloud Functions                        │
│  - API key protection                   │
│  - Server-side validation               │
│  - Rate limiting                        │
│  - Logging and monitoring               │
└─────────────────────────────────────────┘
```

---

## Data Protection

### Sensitive Data Categories

**Highly Sensitive:**
- Journal entries
- Relapse reflections
- Chat messages
- Trigger information

**Moderately Sensitive:**
- Streak data
- Check-in records
- Badge achievements

**Public/Non-Sensitive:**
- User display name
- Profile photo (if user chooses)

### Data at Rest

**Current Implementation:**
- Firestore encrypts all data at rest automatically
- Google's infrastructure-level encryption (AES-256)

**Future Enhancements:**
- Application-level encryption for journal entries
- Encryption keys managed per user
- Option to enable additional encryption

### Data in Transit

**Current:**
- All Firebase connections use HTTPS/TLS 1.3
- Certificate pinning enforced

**Best Practices:**
- Never transmit sensitive data in URL parameters
- Use POST requests for all mutations
- Validate SSL certificates

---

## Authentication & Authorization

### Google OAuth 2.0

**Flow:**

```
1. User clicks "Sign in with Google"
2. Redirected to Google OAuth consent screen
3. User approves permissions
4. Google returns authorization code
5. Firebase exchanges code for ID token
6. Client receives secure JWT token
7. Token used for all subsequent requests
```

**Permissions Requested:**
- Email address (required)
- Profile information (name, photo)

**Security Features:**
- No password storage (delegated to Google)
- Multi-factor authentication (if user has it enabled)
- Automatic token refresh
- Secure token storage (httpOnly cookies)

### Session Management

**Token Lifecycle:**

```typescript
// Firebase handles automatically
firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);

// Tokens expire after 1 hour
// Auto-refresh before expiration
// User remains signed in unless explicitly signed out
```

**Security Considerations:**
- Tokens stored in memory (not localStorage for sensitive operations)
- Automatic logout after 30 days of inactivity
- Revoke tokens on password change (Google-side)
- Session invalidation on logout

---

## Firestore Security Rules

### Complete Production Rules

**File:** `firestore.rules`

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ===========================
    // Helper Functions
    // ===========================
    
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    function isValidTimestamp(timestamp) {
      return timestamp is number 
        && timestamp > 0 
        && timestamp <= request.time.toMillis() + 300000; // Allow 5min future (clock skew)
    }
    
    function isValidString(str, minLen, maxLen) {
      return str is string 
        && str.size() >= minLen 
        && str.size() <= maxLen;
    }
    
    // ===========================
    // Users Collection
    // ===========================
    
    match /users/{userId} {
      allow read: if isOwner(userId);
      allow write: if false; // No direct writes to user doc
      
      // Profile
      match /profile/{profileId} {
        allow read: if isOwner(userId);
        allow create: if isOwner(userId)
          && request.resource.data.uid == userId
          && isValidString(request.resource.data.email, 3, 100);
        allow update: if isOwner(userId)
          && request.resource.data.uid == resource.data.uid; // Can't change uid
      }
      
      // Kamehameha Data
      match /kamehameha/{document=**} {
        allow read: if isOwner(userId);
      }
      
      // Streaks (single document)
      match /kamehameha/streaks {
        allow read: if isOwner(userId);
        allow write: if isOwner(userId)
          && request.resource.data.main is map
          && request.resource.data.discipline is map
          && isValidTimestamp(request.resource.data.lastUpdated);
      }
      
      // Configuration (single document)
      match /kamehameha/config {
        allow read: if isOwner(userId);
        allow write: if isOwner(userId)
          && isValidString(request.resource.data.systemPrompt, 0, 5000)
          && request.resource.data.rulesList is list;
      }
      
      // Check-ins
      match /kamehameha/checkIns/{checkInId} {
        allow read: if isOwner(userId);
        
        allow create: if isOwner(userId)
          && request.resource.data.mood is int
          && request.resource.data.mood >= 1
          && request.resource.data.mood <= 5
          && request.resource.data.urgeIntensity is int
          && request.resource.data.urgeIntensity >= 0
          && request.resource.data.urgeIntensity <= 10
          && request.resource.data.triggers is list
          && isValidTimestamp(request.resource.data.timestamp)
          && isValidString(request.resource.data.journalEntry, 0, 10000);
        
        allow update: if isOwner(userId)
          && request.resource.data.id == resource.data.id
          && request.resource.data.timestamp == resource.data.timestamp;
        
        allow delete: if isOwner(userId);
      }
      
      // Relapses
      match /kamehameha/relapses/{relapseId} {
        allow read: if isOwner(userId);
        
        allow create: if isOwner(userId)
          && request.resource.data.type in ['main', 'discipline']
          && request.resource.data.reasons is list
          && request.resource.data.reasons.size() > 0
          && isValidTimestamp(request.resource.data.timestamp)
          && request.resource.data.previousStreakSeconds is int
          && request.resource.data.previousStreakSeconds >= 0;
        
        allow update: if isOwner(userId)
          && request.resource.data.id == resource.data.id
          && request.resource.data.timestamp == resource.data.timestamp;
        
        allow delete: if isOwner(userId);
      }
      
      // Chat History
      match /kamehameha/chatHistory/{messageId} {
        allow read: if isOwner(userId);
        
        allow create: if isOwner(userId)
          && request.resource.data.role in ['user', 'assistant']
          && isValidString(request.resource.data.content, 1, 2000)
          && isValidTimestamp(request.resource.data.timestamp)
          && request.resource.data.emergency is bool;
        
        allow update: if false; // Messages are immutable
        
        allow delete: if isOwner(userId);
      }
      
      // Badges
      match /kamehameha/badges/{badgeId} {
        allow read: if isOwner(userId);
        allow create: if isOwner(userId); // Created by Cloud Functions
        allow update, delete: if false; // Badges are immutable
      }
    }
    
    // ===========================
    // Rate Limiting Collection
    // ===========================
    
    match /rateLimits/{limitId} {
      allow read, write: if false; // Only Cloud Functions can access
    }
  }
}
```

### Testing Security Rules

```bash
# Install Firebase emulator
npm install -g firebase-tools

# Start emulator with rules
firebase emulators:start --only firestore

# Run test suite
npm run test:rules
```

**Test File:** `firestore.test.ts`

```typescript
import { assertFails, assertSucceeds } from '@firebase/rules-unit-testing';

describe('Firestore Security Rules', () => {
  it('should deny unauthenticated users', async () => {
    const db = getFirestore(null); // No auth
    const ref = db.doc('users/user123/kamehameha/streaks');
    await assertFails(ref.get());
  });

  it('should allow users to read their own data', async () => {
    const db = getFirestore({ uid: 'user123' });
    const ref = db.doc('users/user123/kamehameha/streaks');
    await assertSucceeds(ref.get());
  });

  it('should deny users from reading others data', async () => {
    const db = getFirestore({ uid: 'user123' });
    const ref = db.doc('users/user456/kamehameha/streaks');
    await assertFails(ref.get());
  });

  // More tests...
});
```

---

## Threat Mitigation

### Common Threats & Mitigations

#### 1. Unauthorized Data Access

**Threat:** User tries to access another user's data

**Mitigation:**
- Firestore rules enforce user isolation
- All reads/writes check `isOwner(userId)`
- No way to query across users

**Test:**
```typescript
// Should fail
db.collection('users').get(); // Can't list all users
db.doc('users/OTHER_USER_ID/kamehameha/streaks').get(); // Can't read others
```

#### 2. Data Injection

**Threat:** Malicious data in fields (XSS, SQL injection)

**Mitigation:**
- React escapes all output by default (XSS protection)
- Firestore is NoSQL (no SQL injection)
- Input validation in rules and client
- Sanitize user input before display

**Example:**
```typescript
// Sanitize journal entries
function sanitizeInput(text: string): string {
  return text
    .trim()
    .replace(/<script>/gi, '') // Remove script tags
    .slice(0, 10000); // Enforce max length
}
```

#### 3. API Key Exposure

**Threat:** OpenAI API key leaked

**Mitigation:**
- API key stored in Cloud Functions config only
- Never sent to client
- Never logged
- Rotated regularly
- Rate limiting prevents abuse

**Check:**
```bash
# Never do this:
# const API_KEY = 'sk-...' in frontend code

# Instead:
firebase functions:config:set openai.key="sk-..."
```

#### 4. Rate Limit Bypass

**Threat:** User floods API with requests

**Mitigation:**
- Cloud Functions enforce rate limits (50 msgs/hour)
- Firestore security rules can add write limits
- Monitor usage patterns
- Ban abusive users

**Implementation:**
```typescript
// In Cloud Functions
await checkRateLimit(userId); // Throws error if exceeded

// In Firestore rules (alternative)
allow create: if isOwner(userId)
  && request.time > resource.data.lastMessageAt + duration.value(30, 's');
```

#### 5. Session Hijacking

**Threat:** Attacker steals user's session token

**Mitigation:**
- HTTPS only (TLS 1.3)
- Tokens expire after 1 hour
- Automatic refresh
- Logout invalidates tokens
- Monitor unusual login locations (future)

#### 6. Account Takeover

**Threat:** Attacker gains access to user's Google account

**Mitigation:**
- Delegated to Google (industry-leading security)
- Encourage users to enable 2FA
- Unusual activity detection (future)
- Email notifications for new logins (future)

---

## Privacy Compliance

### User Data Rights

**User Rights:**

1. **Right to Access:**
   - Export all user data (JSON download)
   - View all collected information

2. **Right to Deletion:**
   - Delete account functionality
   - Remove all associated data
   - 30-day retention for backups

3. **Right to Portability:**
   - Export data in machine-readable format (JSON)
   - Transfer to another service (future)

4. **Right to Rectification:**
   - Edit check-ins, relapses, journal entries
   - Update profile information

5. **Right to Restrict Processing:**
   - Disable AI therapist
   - Opt out of analytics (future)

**Implementation:**

```typescript
// Export all user data
async function exportAllData(userId: string): Promise<object> {
  // Fetch all subcollections
  const userData = await fetchAllUserData(userId);
  
  return {
    exportDate: new Date().toISOString(),
    userData,
  };
}

// Delete all user data
async function deleteAccount(userId: string): Promise<void> {
  // Delete all subcollections
  await deleteCollection(`users/${userId}/kamehameha/checkIns`);
  await deleteCollection(`users/${userId}/kamehameha/relapses`);
  await deleteCollection(`users/${userId}/kamehameha/chatHistory`);
  await deleteCollection(`users/${userId}/kamehameha/badges`);
  
  // Delete user documents
  await db.doc(`users/${userId}/kamehameha/streaks`).delete();
  await db.doc(`users/${userId}/kamehameha/config`).delete();
  await db.doc(`users/${userId}/profile/main`).delete();
  
  // Delete authentication
  await admin.auth().deleteUser(userId);
}
```

### Privacy Policy

**Must Include:**
- What data is collected
- How data is used
- Who has access to data
- Data retention period
- User rights and controls
- Contact information

**Location:** `/privacy-policy` page

**Template:**

```markdown
# Privacy Policy

Last Updated: [Date]

## What We Collect
- Email address and profile information (from Google)
- Streak data, check-ins, journal entries
- Chat messages with AI therapist
- Usage analytics (anonymous)

## How We Use Your Data
- Provide recovery support and tracking
- Improve AI therapist responses
- Analyze usage patterns (anonymous)

## Who Has Access
- Only you can access your data
- OpenAI processes chat messages (no storage)
- Firebase/Google infrastructure (encrypted)
- No third-party sharing

## Data Retention
- Active accounts: Data retained indefinitely
- Deleted accounts: Permanent deletion within 30 days
- Chat logs: Retained for context, deletable by user

## Your Rights
- Access your data (export)
- Delete your account
- Correct inaccurate data
- Restrict AI processing

## Security
- Industry-standard encryption
- Regular security audits
- Google-grade infrastructure

## Contact
support@zenfocus.app
```

---

## Audit Logging

### What to Log

**Security Events:**
- Login attempts (success/fail)
- Account creation
- Account deletion
- Failed authentication
- Rate limit violations
- Unusual access patterns

**User Actions:**
- Streak resets
- Data exports
- Configuration changes
- API key rotations (admin)

**System Events:**
- Cloud Function errors
- Firestore rule violations
- OpenAI API errors

### Implementation

```typescript
// Cloud Function logging
import * as functions from 'firebase-functions';

functions.logger.log('User action', {
  userId: context.auth.uid,
  action: 'chat_message',
  timestamp: Date.now(),
  emergency: data.emergency,
});

// Security event logging
functions.logger.warn('Rate limit exceeded', {
  userId: context.auth.uid,
  timestamp: Date.now(),
  attemptedAction: 'chat_message',
});

// Error logging
functions.logger.error('OpenAI API error', {
  userId: context.auth.uid,
  error: error.message,
  timestamp: Date.now(),
});
```

### Log Retention

- **Security logs:** 90 days
- **Error logs:** 30 days
- **Info logs:** 7 days
- **Audit logs:** 1 year (compliance)

---

## Incident Response Plan

### Response Procedures

**1. Detection:**
- Monitor error rates
- Alert on unusual patterns
- User reports

**2. Assessment:**
- Severity classification (Critical, High, Medium, Low)
- Scope determination
- Impact analysis

**3. Containment:**
- Isolate affected systems
- Revoke compromised credentials
- Block malicious IPs

**4. Remediation:**
- Fix vulnerability
- Deploy patch
- Verify fix

**5. Recovery:**
- Restore services
- Notify affected users
- Monitor for recurrence

**6. Post-Incident:**
- Document incident
- Update security measures
- Conduct retrospective

### Example: API Key Leak

**Immediate Actions:**
1. Revoke compromised API key
2. Generate new key
3. Update Cloud Functions config
4. Deploy new configuration
5. Monitor usage for unauthorized calls
6. Review logs for damage assessment

**Follow-up:**
1. Notify users (if data accessed)
2. Review security practices
3. Implement additional safeguards
4. Update incident response plan

---

## Best Practices

### For Developers

1. **Never Log Sensitive Data:**
   ```typescript
   // BAD
   console.log('User journal:', journalEntry);
   
   // GOOD
   console.log('Journal entry saved, length:', journalEntry.length);
   ```

2. **Validate All Inputs:**
   ```typescript
   if (!message || message.length > 2000) {
     throw new Error('Invalid message');
   }
   ```

3. **Use Parameterized Queries:**
   ```typescript
   // Always use Firestore's built-in methods
   db.collection('users').doc(userId); // Safe
   
   // Never string concatenation
   // db.collection('users/' + userId); // Unsafe
   ```

4. **Keep Dependencies Updated:**
   ```bash
   npm audit
   npm update
   ```

5. **Regular Security Reviews:**
   - Quarterly security audits
   - Penetration testing (annual)
   - Code reviews for security

### For Users

1. **Enable 2FA:** On Google account
2. **Strong Password:** For Google account
3. **Regular Logout:** On shared devices
4. **Monitor Activity:** Check for unusual logins
5. **Report Issues:** Contact support for suspicious activity

---

## Security Checklist

### Pre-Launch

- [ ] Firestore security rules tested
- [ ] API keys secured in Cloud Functions
- [ ] Authentication flow tested
- [ ] Rate limiting implemented
- [ ] Privacy policy published
- [ ] User data rights implemented
- [ ] Logging configured
- [ ] Error handling complete
- [ ] Input validation on all forms
- [ ] XSS protection verified

### Post-Launch

- [ ] Monitor error rates daily
- [ ] Review logs weekly
- [ ] Update dependencies monthly
- [ ] Security audit quarterly
- [ ] Penetration test annually
- [ ] Incident response plan tested
- [ ] Backup data regularly
- [ ] Rotate API keys quarterly

---

## Related Documentation

- [DATA_SCHEMA.md](DATA_SCHEMA.md) - Data structure and validation
- [AI_INTEGRATION.md](AI_INTEGRATION.md) - Cloud Functions and OpenAI
- [SPEC.md](SPEC.md) - Feature requirements
- [Firebase Security Docs](https://firebase.google.com/docs/rules)

---

## Support

For security concerns or to report vulnerabilities:
- Email: security@zenfocus.app
- Bug bounty: [Future program]

**Do not** publicly disclose security vulnerabilities.

---

**Documentation Complete!** All Kamehameha documentation is now in place. Next step: Begin implementation starting with Phase 1 (Firebase setup).

