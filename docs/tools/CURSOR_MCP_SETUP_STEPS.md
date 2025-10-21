# 🔧 Cursor MCP Setup - Step by Step

## Current Status
✅ Chrome running with remote debugging (port 9222)
✅ chrome-devtools-mcp installed globally (v0.8.1)
✅ MCP config file created
❌ Not showing in Cursor UI yet

## 📍 How to Access MCP Settings in Cursor

### Option 1: Through Cline Extension
1. Look in the **LEFT SIDEBAR** for the **Cline/Claude Dev** icon (looks like a robot or AI icon)
2. Click it to open the Cline panel
3. In the Cline panel, find the **Settings/Gear icon** (usually top-right)
4. Look for **"MCP Servers"** or **"MCP Settings"**
5. Click **"Edit"** or **"Configure"**

### Option 2: Through Command Palette
1. Press **Ctrl+Shift+P** (Windows) or **Cmd+Shift+P** (Mac)
2. Type: **"MCP"**
3. Look for commands like:
   - "Cline: Configure MCP Servers"
   - "Cline: Edit MCP Settings"
   - "Claude Dev: MCP Settings"
4. Select the command

### Option 3: Settings UI
1. Open Settings: **Ctrl+,** (or File → Preferences → Settings)
2. In the search box, type: **"mcp"**
3. Look for any MCP-related settings
4. There might be a link to "Edit in settings.json" or "Configure MCP"

## 🔧 MCP Configuration to Add

Once you find the MCP settings editor, add this:

```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "chrome-devtools-mcp",
      "args": []
    }
  }
}
```

## 🚨 If You Still Don't See MCP Settings

This might mean:
1. **Cline extension not installed** - Install it from Cursor Extensions
2. **Wrong Cursor version** - Update to latest version
3. **MCP feature not enabled** - Check if MCP is available in your Cursor version

## 📦 Alternative: Use Puppeteer MCP Instead

If chrome-devtools doesn't show up, try Puppeteer (simpler setup):

```json
{
  "mcpServers": {
    "puppeteer": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-puppeteer"]
    }
  }
}
```

## ✅ How to Verify It's Working

After adding MCP config:
1. Restart Cursor completely
2. Open Cline panel
3. You should see MCP tools available
4. Ask the AI: "Take a screenshot of localhost:5173"

## 📸 Screenshot Guide

Take a screenshot showing:
1. Your Cursor window
2. The left sidebar (where extensions/Cline should be)
3. Any settings panels you see

This will help debug the issue!

---

**File location:** `C:\Users\Tony\AppData\Roaming\Cursor\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json`



