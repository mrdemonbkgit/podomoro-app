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
- Emulator UI (port 4000)

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

## WSL Setup (Windows Subsystem for Linux)

If you're running the dev server from WSL but the emulator on Windows, additional setup is required.

### 1. Start Emulator on Windows

From Windows CMD or PowerShell:
```bash
firebase emulators:start --only firestore,auth
```

### 2. Configure Windows Firewall (One-time)

Run in PowerShell as Administrator:
```powershell
New-NetFirewallRule -DisplayName "Firebase Auth Emulator" -Direction Inbound -LocalPort 9099 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "Firebase Firestore Emulator" -Direction Inbound -LocalPort 8080 -Protocol TCP -Action Allow
```

### 3. Find Your Windows Host IP

From WSL, run:
```bash
ip route show default | awk '{print $3}'
```

This typically returns something like `172.22.16.1`.

### 4. Start Dev Server with Windows Host

```bash
VITE_USE_FIREBASE_EMULATOR=true VITE_EMULATOR_HOST=<windows-ip> npm run dev
```

Example:
```bash
VITE_USE_FIREBASE_EMULATOR=true VITE_EMULATOR_HOST=172.22.16.1 npm run dev
```

### 5. Run E2E Tests

```bash
FIREBASE_EMULATOR=true npx playwright test
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_USE_FIREBASE_EMULATOR` | Enable emulator mode | `false` |
| `VITE_EMULATOR_HOST` | Emulator host (for WSL) | `localhost` |

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

## Troubleshooting

### WSL can't connect to Windows emulator
1. Check firewall rules are set
2. Verify Windows IP: `ip route show default | awk '{print $3}'`
3. Test connection: `nc -z <windows-ip> 9099`

### Emulator takes too long to start
- Java may be slow on WSL; run emulator from Windows instead
- Use `--ui=false` flag to disable emulator UI for faster startup

### Tests skip authenticated flows
- Ensure `FIREBASE_EMULATOR=true` is set when running tests
- Verify dev server was started with `VITE_USE_FIREBASE_EMULATOR=true`
