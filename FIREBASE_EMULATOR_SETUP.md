# Firebase Emulator Setup for Testing

## Why Use Emulator?
- No CORS issues when testing locally
- Free (no API costs during development)
- Faster development cycle
- Test without affecting production data

## Quick Start

### 1. Start Firebase Emulator
```bash
firebase emulators:start
```

This will start:
- Auth Emulator (port 9099)
- Firestore Emulator (port 8080)
- Functions Emulator (port 5001)

### 2. Set Environment Variable
Create `.env.local` (if not exists) and add:
```
VITE_USE_FIREBASE_EMULATOR=true
```

### 3. Restart Dev Server
```bash
npm run dev
```

Now your app will use local emulators instead of production!

## Alternative: Add Localhost to Firebase (Option 2)

If you prefer to test against production functions:

1. Go to Firebase Console: https://console.firebase.google.com
2. Select your project: `zenfocus-app`
3. Go to **Authentication** → **Settings** → **Authorized domains**
4. Click **Add domain**
5. Add: `localhost`
6. Save

This will allow localhost to call your Cloud Functions.

## Which Should You Use?

**During Development:**
- ✅ Use Emulator (safer, faster, free)

**For Production Testing:**
- ✅ Add localhost to authorized domains

