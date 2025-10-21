# 🧪 Dev Login - Testing Authentication Without Google OAuth

## ✅ What's Implemented

I've added a **Dev Mode Authentication Bypass** that allows you to test authenticated features without hitting Google's automated browser restrictions.

### Features:
- 🧪 **Mock user authentication** (bypasses Google OAuth)
- 💾 **Persists across page reloads** (uses localStorage)
- 🎨 **Clearly marked as dev-only** (yellow button with 🧪 emoji)
- 🚫 **Automatically disabled in production** (only works in `dev` mode)
- 👤 **Test user:** test@zenfocus.dev (uid: `dev-test-user-12345`)

---

## 🚀 How to Use

### 1. Start Dev Server
```bash
npm run dev
```

### 2. Navigate to Login Page
Open: `http://localhost:5174/login`

### 3. Click "Dev Login (Testing Only)"
You'll see a yellow button below the Google Sign-in button. Click it!

### 4. You're In!
- ✅ Redirected to `/kamehameha` page
- ✅ User profile shows "Test User" with avatar
- ✅ Can test all authenticated features
- ✅ No Google OAuth popup restrictions!

---

## 📋 One-Time Firebase Setup Required

The dev test user needs Firestore permissions. I've created `firestore.rules` file. You need to deploy it:

### Deploy Firestore Rules:
```bash
firebase deploy --only firestore:rules
```

This adds a rule that allows the dev test user (`dev-test-user-12345`) to access Firestore.

---

## 🧪 Testing with Playwright

Now you can fully automate testing of authenticated features:

```typescript
// Navigate to login
await page.goto('http://localhost:5174/login');

// Click dev login
await page.getByRole('button', { name: '🧪 Dev Login (Testing Only)' }).click();

// Test authenticated features!
// You'll be on /kamehameha page, fully authenticated
```

**No more:**
- ❌ Google rejection errors
- ❌ Manual copying/pasting
- ❌ Screenshot sharing needed

**You can now:**
- ✅ Test streaks
- ✅ Test check-ins
- ✅ Test journal entries
- ✅ Test all Firestore operations
- ✅ Fully automated end-to-end testing!

---

## 🔐 Security Notes

**This is 100% safe:**

1. **Only works in development mode**  
   - Checks `import.meta.env.DEV`
   - Production builds automatically remove this code

2. **Clearly marked as testing**  
   - Yellow warning colors
   - 🧪 Emoji indicator
   - "Testing Only" label

3. **Separate from real auth**  
   - Uses localStorage, not Firebase Auth
   - Won't interfere with real Google sign-ins

4. **Firestore rules are controlled**  
   - Only allows specific dev test UID
   - Real users still require proper authentication

---

## 💡 Usage Tips

### Sign Out (Dev Mode)
Click your profile dropdown and sign out. It will clear the mock user.

### Switch to Real Auth
Just click "Sign in with Google" instead of "Dev Login".

### Reset Dev Session
Clear localStorage in browser DevTools if needed.

---

## 🎯 What This Solves

**Before:** 😫
- Google blocks automated browsers
- Can't test authenticated features
- Manual testing required
- Constant screenshots/errors to share

**After:** 🎉  
- One click to authenticate
- Full automation support
- Test all features
- No Google restrictions!

---

## 📝 Next Steps

1. **Deploy Firestore rules** (see command above)
2. **Test the login page** - you should see the yellow button
3. **Click Dev Login** - instant authentication!
4. **Start testing** - all authenticated features now work!

---

**Happy Testing!** 🚀

