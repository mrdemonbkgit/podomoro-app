# Firebase Functions Setup - Step by Step

**Status:** Firebase Blaze Plan ✅ Active  
**Next:** Initialize Cloud Functions

---

## 🚀 Step-by-Step Instructions

### Step 1: Login to Firebase CLI ⏳ (YOU DO THIS)

**In your PowerShell terminal, run:**
```bash
firebase login
```

**What happens:**
- Opens browser
- Sign in with Google (same account as Firebase Console)
- Grant permissions
- Returns to terminal with: ✔ Success! Logged in as [your-email]

**⚠️ IMPORTANT:** Come back here after you see the success message!

---

### Step 2: Initialize Firebase in This Project ⏳ (AFTER LOGIN)

Once logged in, run:
```bash
firebase init
```

**Select these options:**
1. **What do you want to set up?**
   - Use arrow keys to move
   - Press SPACE to select "Functions"
   - Press SPACE to select "Firestore" (if not already selected)
   - Press ENTER to continue

2. **Select a default Firebase project:**
   - Choose your project from the list
   - (It will show your project name/ID)

3. **What language would you like to use?**
   - Select "TypeScript"

4. **Do you want to use ESLint?**
   - Yes (Y)

5. **Do you want to install dependencies now?**
   - Yes (Y)

**This creates:**
```
functions/
├── src/
│   └── index.ts          # Your Cloud Functions
├── package.json
├── tsconfig.json
└── .eslintrc.js

.firebaserc                # Project configuration
firebase.json              # Firebase settings
firestore.rules           # (already exists)
firestore.indexes.json    # Firestore indexes
```

---

### Step 3: Install OpenAI SDK ⏳ (AFTER INIT)

```bash
cd functions
npm install openai
cd ..
```

---

### Step 4: Set OpenAI API Key 🔑 (YOU PROVIDE KEY)

**Using Firebase config:**
```bash
firebase functions:config:set openai.key="YOUR_OPENAI_API_KEY_HERE"
```

**Replace** `YOUR_OPENAI_API_KEY_HERE` with your actual OpenAI API key.

**Example:**
```bash
firebase functions:config:set openai.key="sk-proj-abc123..."
```

**Verify it's set:**
```bash
firebase functions:config:get
```

You should see:
```json
{
  "openai": {
    "key": "sk-proj-..."
  }
}
```

---

### Step 5: Create .env File for Local Development 🧪

**File:** `functions/.env`

```env
OPENAI_API_KEY=your_openai_api_key_here
```

**⚠️ Add to .gitignore:**
Already done! `.env` is ignored.

---

## ⏸️ Current Status

- [x] Firebase Blaze plan activated
- [x] Firebase CLI installed
- [ ] **← YOU ARE HERE:** Need to run `firebase login`
- [ ] Run `firebase init`
- [ ] Install OpenAI in functions/
- [ ] Set OpenAI API key
- [ ] Build Cloud Functions
- [ ] Build Chat UI

---

## 📝 What to Tell Me

After completing Step 1 (firebase login), tell me:

**"Firebase login complete"**

Then I'll guide you through the rest!

---

## 🆘 Troubleshooting

### "firebase: command not found" after npm install
- Close and reopen your terminal
- Or run: `npm install -g firebase-tools` again

### "Not authorized" or "Permission denied"
- Make sure you're signing in with the correct Google account
- Check you have Owner/Editor role on Firebase project

### "No projects found"
- You need to create a Firebase project first
- Go to https://console.firebase.google.com/

### Can't select Functions during init
- Make sure you pressed SPACE (not ENTER) to select
- SPACE = check/uncheck
- ENTER = confirm selection

---

**Once you run `firebase login` successfully, let me know!** 🚀

