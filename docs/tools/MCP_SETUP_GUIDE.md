# Chrome DevTools MCP Setup Guide

## What This Enables

Once configured, I (the AI assistant) will be able to:
- 🌐 Open and navigate to URLs automatically
- 📸 Take screenshots of your app
- 🔍 Inspect DOM elements
- 💻 Execute JavaScript in the browser console
- 📋 Get console logs and errors
- 🧪 Test interactions and validate UI
- 🐛 Debug visual issues in real-time

## Setup Instructions

### Step 1: Configure MCP in Cursor

1. Open Cursor Settings (Ctrl+,)
2. Search for "MCP" or navigate to Extensions → MCP Servers
3. Add the Chrome DevTools MCP configuration

**Or manually edit the settings file:**

Location: `%APPDATA%\Cursor\User\settings.json`

Add this to your settings:

```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": [
        "chrome-devtools-mcp@latest"
      ]
    }
  }
}
```

### Step 2: Launch Chrome with Remote Debugging

**Option A: Use the provided helper script**

Simply run:
```powershell
.\launch-chrome-debug.ps1
```

**Option B: Manual launch**

```powershell
Start-Process "C:\Program Files\Google\Chrome\Application\chrome.exe" -ArgumentList "--remote-debugging-port=9222"
```

### Step 3: Restart Cursor

After adding the MCP configuration, restart Cursor for the changes to take effect.

## Usage

Once configured, you can ask me to:
- "Open the app in Chrome and take a screenshot"
- "Check for console errors in the browser"
- "Test the timer functionality"
- "Verify the UI is displaying correctly"
- "Click the start button and see what happens"

## Troubleshooting

### Chrome DevTools MCP Not Working?

Try the Puppeteer MCP instead (simpler, doesn't require Chrome debugging flags):

```json
{
  "mcpServers": {
    "puppeteer": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-puppeteer"
      ]
    }
  }
}
```

### Port 9222 Already in Use?

Close any existing Chrome instances with debugging enabled:
```powershell
Get-Process chrome | Where-Object {$_.CommandLine -like "*remote-debugging*"} | Stop-Process
```

### Chrome Not Found?

Update the Chrome path in `launch-chrome-debug.ps1` to match your installation:
- Default: `C:\Program Files\Google\Chrome\Application\chrome.exe`
- Alternative: `C:\Program Files (x86)\Google\Chrome\Application\chrome.exe`

## Current Status

✅ Chrome has been launched with remote debugging on port 9222
✅ Your Pomodoro app is open at http://localhost:5173
⏳ Waiting for MCP configuration in Cursor settings

Once you configure the MCP, I'll be able to interact with the browser automatically!

