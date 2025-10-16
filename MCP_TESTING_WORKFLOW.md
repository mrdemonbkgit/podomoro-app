# Chrome DevTools MCP Testing Workflow

## Overview

This document outlines the workflow for testing features using Chrome DevTools MCP (Model Context Protocol) integration after implementation.

## Prerequisites

1. **Chrome DevTools MCP Server Installed**
   - See `MCP_SETUP_GUIDE.md` for installation instructions
   - Launch Chrome with debugging: `.\launch-chrome-debug.ps1`
   - Verify MCP is configured in Cursor

2. **Dev Server Running**
   - Run `npm run dev` to start the development server
   - Note the port (usually http://localhost:5173 or 5174)

## Testing Workflow

### Step 1: Navigate to the Application

```typescript
// List available pages
mcp_chrome-devtools_list_pages()

// Navigate to the dev server
mcp_chrome-devtools_navigate_page({
  url: "http://localhost:5174/"
})
```

### Step 2: Take Initial Snapshot

```typescript
// Capture page structure
mcp_chrome-devtools_take_snapshot()

// Take screenshot for visual verification
mcp_chrome-devtools_take_screenshot({
  format: "png"
})
```

### Step 3: Test Feature Interactions

#### Example: Testing Settings Modal

```typescript
// 1. Open settings modal
mcp_chrome-devtools_click({
  uid: "settings_button_uid"
})

// 2. Take snapshot to see modal structure
mcp_chrome-devtools_take_snapshot()

// 3. Fill form fields
mcp_chrome-devtools_fill({
  uid: "work_duration_input_uid",
  value: "30"
})

// 4. Take screenshot of changes
mcp_chrome-devtools_take_screenshot()

// 5. Save settings
mcp_chrome-devtools_click({
  uid: "save_button_uid"
})

// 6. Verify changes applied
mcp_chrome-devtools_take_snapshot()
```

### Step 4: Test Persistence

```typescript
// Refresh the page
mcp_chrome-devtools_navigate_page({
  url: "http://localhost:5174/"
})

// Verify state persisted
mcp_chrome-devtools_take_snapshot()
mcp_chrome-devtools_take_screenshot()
```

### Step 5: Check Console for Errors

```typescript
// List all console messages
mcp_chrome-devtools_list_console_messages()

// Verify no errors or warnings
```

### Step 6: Test Edge Cases

```typescript
// Use evaluate_script for complex interactions
mcp_chrome-devtools_evaluate_script({
  function: `() => {
    // Custom JavaScript to test edge cases
    return document.title;
  }`
})
```

### Step 7: Handle Dialogs

```typescript
// If a confirmation dialog appears
mcp_chrome-devtools_handle_dialog({
  action: "accept"  // or "dismiss"
})
```

## Standard Test Cases

### For Every Feature Implementation

1. ✅ **Visual Verification**
   - Initial state screenshot
   - After interaction screenshot
   - Modal/dialog screenshots

2. ✅ **Functional Testing**
   - Click buttons
   - Fill forms
   - Navigate pages
   - Test all interactive elements

3. ✅ **Persistence Testing**
   - Save data
   - Refresh page
   - Verify data restored

4. ✅ **Error Handling**
   - Check console for errors
   - Test invalid inputs
   - Test edge cases

5. ✅ **Accessibility**
   - Verify proper ARIA labels
   - Check button descriptions
   - Test keyboard navigation (if applicable)

## Example: Feature 2.1 Test Results

### Test Summary
- **Feature:** Customizable Timer Durations
- **Date:** October 16, 2025
- **Status:** ✅ All tests passed

### Tests Performed

1. **Settings Modal Display** ✅
   - Opened settings modal
   - Verified all form fields visible
   - Verified labels and units displayed

2. **Form Input** ✅
   - Changed work duration: 25 → 30 minutes
   - Changed short break: 5 → 10 minutes
   - Changed sessions until long break: 4 → 3

3. **Save Functionality** ✅
   - Clicked "Save Settings"
   - Modal closed automatically
   - Footer updated with new values

4. **Timer Update** ✅
   - Clicked Reset button
   - Timer changed from 25:00 → 30:00
   - Browser title updated

5. **Persistence** ✅
   - Refreshed page
   - Settings remained: 30/10/15
   - Timer showed 30:00

6. **Reset to Defaults** ✅
   - Clicked "Reset to Defaults"
   - Confirmed dialog
   - Settings reverted to 25/5/15

7. **Console Errors** ✅
   - No errors detected
   - Only info messages (Vite, React DevTools)

### Screenshots Captured
- Initial app state (25:00)
- Settings modal opened
- Form with custom values
- App with custom settings (30:00)
- Settings modal with saved values
- Resume prompt
- Final state after reset (25:00)

## Benefits of MCP Testing

1. **Automated Visual Verification** - Screenshots provide proof of functionality
2. **Accessibility Testing** - Snapshots show ARIA labels and roles
3. **Console Monitoring** - Catch JavaScript errors automatically
4. **Reproducible** - Tests can be re-run consistently
5. **Documentation** - Screenshots serve as visual documentation
6. **Fast Iteration** - Quick feedback loop during development

## Integration with Development Workflow

### After Implementing a Feature

1. **Build & Compile** ✅
   ```bash
   npm run build
   ```

2. **Start Dev Server** ✅
   ```bash
   npm run dev
   ```

3. **Launch Chrome with Debugging** ✅
   ```bash
   .\launch-chrome-debug.ps1
   ```

4. **Run MCP Tests** ✅
   - Use MCP tools in Cursor
   - Navigate to app
   - Test all functionality
   - Capture screenshots
   - Check console

5. **Document Results** ✅
   - Create test summary
   - Save screenshots
   - Update CHANGELOG

6. **Update Documentation** ✅
   - Mark feature complete in ROADMAP
   - Add entry to CHANGELOG
   - Update README if needed

## Tips & Best Practices

### 1. Always Take Fresh Snapshots
```typescript
// UIDs become stale after page updates
// Always take a new snapshot before interacting
mcp_chrome-devtools_take_snapshot()
mcp_chrome-devtools_click({ uid: "fresh_uid" })
```

### 2. Handle Async Operations
```typescript
// Some operations need time
// Use take_snapshot to wait for changes
mcp_chrome-devtools_click({ uid: "button_uid" })
// Wait a moment, then verify
mcp_chrome-devtools_take_snapshot()
```

### 3. Test Both Success and Error Paths
```typescript
// Test valid input
mcp_chrome-devtools_fill({ uid: "input", value: "30" })

// Test invalid input (if validation exists)
mcp_chrome-devtools_fill({ uid: "input", value: "0" })
```

### 4. Document Unexpected Behavior
- If a dialog times out, document the confirmation requirement
- If validation doesn't show visually, check console
- Save screenshots of any issues

### 5. Clean Up Test Data
- Reset settings to defaults after testing
- Clear localStorage if needed
- Start fresh for next test

## Common MCP Tools Reference

| Tool | Purpose | Example |
|------|---------|---------|
| `list_pages` | See open tabs | Initial check |
| `navigate_page` | Load URL | Go to app |
| `take_snapshot` | Get page structure | Find UIDs |
| `take_screenshot` | Visual capture | Documentation |
| `click` | Click element | Button press |
| `fill` | Enter text | Form input |
| `list_console_messages` | Check errors | Error detection |
| `evaluate_script` | Run JavaScript | Complex tests |
| `handle_dialog` | Accept/dismiss | Confirmations |

## Troubleshooting

### Issue: "UID is stale"
**Solution:** Take a new snapshot before interacting

### Issue: "Click timed out"
**Solution:** Element may require a dialog to be handled first

### Issue: "Element not found"
**Solution:** Check snapshot for correct UID, element may not be visible

### Issue: "Snapshot timeout"
**Solution:** Page may be loading, wait and retry

## Future Enhancements

- [ ] Create reusable test scripts
- [ ] Automate screenshot comparison
- [ ] Add performance testing with MCP
- [ ] Create test templates for common patterns
- [ ] Integrate with CI/CD pipeline

---

**Last Updated:** October 16, 2025  
**For Questions:** See `MCP_SETUP_GUIDE.md`

