# Firebase Blaze Plan Setup Guide

**Date:** October 22, 2025  
**Purpose:** Enable Cloud Functions for AI Therapist Chat (Phase 4)

---

## 🔥 What is the Blaze Plan?

**Firebase Blaze Plan** is Firebase's "pay-as-you-go" pricing tier:

- ✅ **Free tier included** - Generous free quotas (same as Spark plan)
- ✅ **Only pay for what you use** beyond free tier
- ✅ **Required for Cloud Functions** (serverless backend code)
- ✅ **Set spending limits** to control costs
- ✅ **Billing alerts** when approaching limits

---

## 💰 Cost Overview

### Free Tier (Monthly)
You get these FREE every month on Blaze plan:
- **Cloud Functions:** 2M invocations, 400K GB-seconds
- **Firestore:** 50K reads, 20K writes, 20K deletes, 1GB storage
- **Authentication:** Unlimited users
- **Hosting:** 10GB storage, 360MB/day transfer

### Paid Usage (Only if you exceed free tier)
- **Cloud Functions:** $0.40 per million invocations
- **Firestore Reads:** $0.06 per 100K
- **Firestore Writes:** $0.18 per 100K

### Estimated Phase 4 Costs
With AI chat and rate limiting (10 messages/min):
- **Light use:** $0-5/month (stays in free tier)
- **Active use:** $10-30/month (AI + Firebase combined)
- **Heavy use:** $50+/month (many chat conversations)

**💡 Note:** Most costs come from OpenAI API (~$0.015 per message exchange), not Firebase.

---

## 🚀 How to Upgrade to Blaze Plan

### Step 1: Open Firebase Console

1. Go to: https://console.firebase.google.com/
2. Select your project (e.g., "pomodoro-app" or whatever you named it)
3. You should see your project dashboard

### Step 2: Navigate to Billing

**Option A - Via Upgrade Button:**
1. Look for the "Spark" plan indicator (usually top-right or in menu)
2. Click "Upgrade" button
3. This takes you directly to billing upgrade

**Option B - Via Settings:**
1. Click the ⚙️ gear icon (top-left near project name)
2. Select "Usage and billing"
3. Click "Details & settings" under "Billing"
4. Click "Modify plan"

### Step 3: Select Blaze Plan

1. You'll see plan options:
   - ❌ **Spark (Free)** - Your current plan
   - ✅ **Blaze (Pay as you go)** - Select this one

2. Click "Select plan" or "Continue" on Blaze

### Step 4: Set Up Billing

**If this is your first Google Cloud billing account:**

1. **Enter billing information:**
   - Country
   - Payment method (credit/debit card)
   - Billing address
   
2. **Accept terms:**
   - Read and accept Google Cloud Terms of Service
   - Review pricing details

3. **Complete setup:**
   - Click "Start my free trial" or "Purchase"
   - Wait for confirmation (usually instant)

**If you already have a Google Cloud billing account:**

1. Select existing billing account from dropdown
2. Link it to your Firebase project
3. Confirm the upgrade

### Step 5: Verify Upgrade

1. Back on Firebase Console, check top-right for "Blaze" indicator
2. Navigate to "Usage and billing"
3. Confirm you see "Blaze plan" active

---

## 🛡️ Set Up Cost Protection (IMPORTANT!)

### Step 1: Set Budget Alerts

1. In Firebase Console → Usage and billing → Details & settings
2. Click "Manage budgets & alerts" (opens Google Cloud Console)
3. Click "CREATE BUDGET"
4. **Set budget amount:** e.g., $20/month (adjust to your comfort)
5. **Set alert thresholds:**
   - 50% of budget ($10)
   - 90% of budget ($18)
   - 100% of budget ($20)
6. **Add email notifications** to your email
7. Click "Finish"

### Step 2: Monitor Usage

**Regular Checks:**
1. Firebase Console → Usage and billing
2. Review current month's usage
3. Check graphs for unusual spikes

**Set Calendar Reminder:**
- Check billing weekly (until you understand usage patterns)
- Monthly review of costs

---

## 🔒 Optional: Set Hard Spending Cap

**Note:** Firebase/Google Cloud doesn't have a hard spending cap (by design for reliability), but you can:

1. **Monitor closely** with budget alerts
2. **Disable functions** if costs spike:
   ```bash
   firebase functions:delete chatWithAI
   ```
3. **Rate limiting** in code (we'll implement this)

---

## 🧪 After Upgrading

### Verify Cloud Functions are Available

1. In Firebase Console, check left menu
2. You should now see "Functions" option
3. Click it - you may see "Get started" or empty functions list

### Initialize Firebase Functions

Now you can run:
```bash
firebase init functions
```

This will:
- Ask to select your project (choose your Firebase project)
- Create `functions/` directory
- Install dependencies
- Set up TypeScript configuration

---

## 📊 Cost Monitoring Dashboard

**Best Practices:**

1. **Week 1:** Check daily to understand baseline usage
2. **Week 2-4:** Check every 2-3 days
3. **After 1 month:** Check weekly

**Where to Check:**
- Firebase Console → Usage and billing → Dashboard
- Google Cloud Console → Billing → Reports

**What to Watch:**
- Function invocations (should be low with rate limiting)
- Firestore reads/writes
- Any unexpected spikes

---

## ⚠️ What Could Cause High Costs?

**Potential Issues:**
1. ❌ **No rate limiting** → Users spam messages
2. ❌ **Infinite loops** in Cloud Functions
3. ❌ **Not pruning context** → Sending too many tokens to OpenAI
4. ❌ **Leaving functions running** after testing

**Our Protections:**
1. ✅ Rate limiting: 10 messages/minute per user
2. ✅ Context pruning: Last 10 messages only
3. ✅ Token limits in OpenAI API calls
4. ✅ User authentication required
5. ✅ Budget alerts at 50%, 90%, 100%

---

## 🎯 Cost Comparison

**Your Monthly Budget Scenarios:**

### Minimal ($5/month)
- 5-10 AI chat messages per day
- Regular check-ins and relapse tracking
- Stays mostly in free tier

### Moderate ($15/month)
- 20-30 AI chat messages per day
- Active use of all features
- Small overage on free tier

### Active ($30/month)
- 50+ AI chat messages per day
- Heavy chat usage
- Using AI as primary support tool

**Remember:** You can always:
- Start minimal and scale up
- Disable features if costs too high
- Use chat sparingly
- Switch back to Spark plan (lose Cloud Functions)

---

## ✅ Ready to Proceed?

Once you've upgraded to Blaze plan:

1. ✅ Return here and confirm upgrade complete
2. ✅ I'll initialize Firebase Functions
3. ✅ We'll set up OpenAI integration
4. ✅ Implement rate limiting and cost controls
5. ✅ Build the AI chat interface

---

## 🆘 Troubleshooting

### "Cannot upgrade - requires project owner"
- You need Owner or Editor role on the Firebase project
- Check with whoever created the project

### "Payment method declined"
- Try different card
- Check with your bank (some block Google Cloud)
- Use PayPal if available

### "Already have billing account"
- Great! Just link it to Firebase project
- Select from dropdown in Step 4

### "Worried about costs"
- Set budget to $10-20 to start
- Set up all 3 alert thresholds (50%, 90%, 100%)
- Monitor closely first month
- You can always disable functions if needed

---

## 📞 Need Help?

**Firebase Support:**
- https://firebase.google.com/support
- Firebase community forums

**Billing Questions:**
- Google Cloud support (from Cloud Console)
- Check billing FAQ

**This Project:**
- I'm here to help with setup
- We'll implement cost controls together
- Can always adjust or disable features

---

**Take your time with this - it's a one-time setup that enables the AI chat feature!** 🚀

**No pressure - we can also:**
- Skip Phase 4 for now
- Do Phases 5-6 first (no Cloud Functions needed)
- Come back to AI chat later

**What would you like to do?** 🤔

