# Firebase Configuration Reference

**Project:** ZenFocus
**Purpose:** Reference for environment variables needed in Vercel

---

## 🔐 Environment Variables for Vercel

**⚠️ IMPORTANT:** Get the actual values from Firebase Console or your `.env` file.

### Required Variables

| Variable Name | Description |
|---------------|-------------|
| `VITE_FIREBASE_API_KEY` | Your Firebase API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | `<project-id>.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Your Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | `<project-id>.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Your messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Your Firebase app ID |
| `VITE_USE_FIREBASE_EMULATOR` | `false` (for production) |

---

## 📋 How to Add to Vercel

1. Go to https://vercel.com/dashboard
2. Click on your **ZenFocus project**
3. Go to **Settings** > **Environment Variables**
4. For each variable:
   - Click **Add New**
   - Enter the **Name** (exact, case-sensitive)
   - Enter the **Value** (exact, no spaces, no quotes)
   - Select **All environments** (Production, Preview, Development)
   - Click **Save**

---

## ⚠️ Common Mistakes

### ❌ Wrong:
```
FIREBASE_API_KEY                    (missing VITE_ prefix)
VITE_API_KEY                        (missing FIREBASE_)
" AIzaSy... "                       (extra spaces)
"AIzaSy..."                         (quotes included)
```

### ✅ Correct:
```
VITE_FIREBASE_API_KEY               (exact name)
AIzaSy...                           (exact value, no spaces, no quotes)
```

---

## 🔄 After Adding/Updating Variables

1. Go to **Deployments** tab
2. Click latest deployment
3. Click **three dots (...)** > **Redeploy**
4. Select **"Redeploy without cache"** (important!)
5. Wait for build to complete (~3-5 minutes)

---

## 🧪 Testing After Deployment

1. Open your production URL
2. Open browser DevTools (F12)
3. Check Console tab
4. Should see NO Firebase errors
5. Try logging in with Google
6. Navigate to `/kamehameha`
7. Verify streaks load

---

## 📝 Local Development

For local development, copy `.env.example` to `.env`:

```bash
cp .env.example .env
# Then fill in your actual Firebase values
```

**Note:** `.env` is in `.gitignore` and won't be committed.

---

## 🔍 How to Get Latest Config

Get your config from Firebase Console or use:

```bash
firebase apps:sdkconfig web
```

---

## 🚨 Security Note

**These values are safe to expose in frontend code:**
- API Key is a public identifier (not a secret)
- App ID, Project ID are public
- **Actual security** comes from Firebase Rules

**Never expose:**
- Service account keys
- Private keys
- Database secrets
- Cloud Function secrets (like OPENAI_API_KEY)
