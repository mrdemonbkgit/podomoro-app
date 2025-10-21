# Firebase Setup Guide

This guide will help you set up Firebase for the ZenFocus Kamehameha feature.

## Prerequisites

- Node.js 18+ installed
- Google account
- Firebase CLI (optional, for Cloud Functions later)

---

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Enter project name (e.g., `zenfocus-app`)
4. Disable Google Analytics (optional)
5. Click **"Create project"**

---

## Step 2: Register Web App

1. In Firebase Console, click the **web icon** (`</>`) to add a web app
2. Enter app nickname (e.g., `ZenFocus Web`)
3. **Don't check** "Also set up Firebase Hosting" (we'll do this later)
4. Click **"Register app"**
5. **Copy the Firebase configuration** (you'll need this next)

---

## Step 3: Configure Environment Variables

1. Create a file named `.env.local` in your project root
2. Copy this template and fill in your Firebase config values:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Firebase Emulator (Optional)
# VITE_USE_FIREBASE_EMULATOR=false
```

3. **Important:** `.env.local` is in `.gitignore` - never commit this file!

---

## Step 4: Enable Google Authentication

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Click **"Get started"** (if first time)
3. Click on **"Google"** provider
4. Toggle **"Enable"**
5. Select a **support email** (your email)
6. Click **"Save"**

---

## Step 5: Create Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click **"Create database"**
3. Choose **"Production mode"** (we'll set rules next)
4. Select a **location** (choose closest to your users)
5. Click **"Enable"**

---

## Step 6: Set Up Security Rules

1. In Firestore Database, go to **"Rules"** tab
2. Replace the default rules with these **basic rules**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User documents - users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // User sub-collections
      match /{collection}/{document=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

3. Click **"Publish"**

**Note:** More detailed security rules will be added in Phase 2. See `docs/kamehameha/SECURITY.md` for complete rules.

---

## Step 7: Test the Setup

1. Make sure dependencies are installed:
   ```bash
   npm install
   ```

2. Start the dev server:
   ```bash
   npm run dev
   ```

3. Open the app in your browser (usually `http://localhost:5173`)

4. Click the 🔥 icon in the floating nav to go to Kamehameha

5. You should be redirected to the login page

6. Click **"Sign in with Google"**

7. Complete the sign-in flow

8. You should be redirected to the Kamehameha page

9. If you see your profile picture in the top right, **authentication is working!** ✅

---

## Troubleshooting

### "Firebase not defined" error
- Make sure you created `.env.local` with your Firebase config
- Restart the dev server after creating `.env.local`

### "Auth domain not authorized"
- In Firebase Console → Authentication → Settings → Authorized domains
- Add `localhost` if not already present

### "Permission denied" in Firestore
- Check that security rules are published
- Make sure you're signed in
- Check browser console for specific error

### Sign-in popup blocked
- Allow popups for `localhost` in your browser
- Or check browser console for alternative sign-in method

---

## Optional: Firebase CLI

For Cloud Functions (Phase 4), you'll need Firebase CLI:

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project (later)
firebase init
```

---

## Next Steps

✅ Phase 1 Complete! You now have:
- Firebase project set up
- Google authentication working
- Basic Firestore security rules
- Protected routes

**Next:** Proceed to Phase 2 to build the Kamehameha dashboard with streak tracking!

See: `docs/kamehameha/PROGRESS.md` for Phase 2 tasks

---

## Cost Monitoring

Firebase has a generous free tier:
- **Authentication:** Free
- **Firestore:** 50K reads/day, 20K writes/day free
- **Hosting:** 10GB storage, 360MB/day transfer free

Monitor your usage:
1. Firebase Console → Usage and billing
2. Set up budget alerts (recommended)

---

## Security Best Practices

✅ **DO:**
- Keep `.env.local` in `.gitignore`
- Use Firebase security rules
- Test rules before deploying
- Monitor authentication logs

❌ **DON'T:**
- Commit API keys to git
- Disable security rules in production
- Share your Firebase config publicly
- Use test mode security rules in production

---

**Need help?** Check `docs/kamehameha/DEVELOPER_NOTES.md` for Firebase tips!

