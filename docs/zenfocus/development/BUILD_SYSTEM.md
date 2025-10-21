# Build System Documentation

## Automatic Build Number Generation

This project includes an automatic build number system that generates unique build identifiers with each production build.

## How It Works

### 1. Build Script
**File:** `scripts/generate-build-info.js`

This Node.js script runs automatically before each build (via `prebuild` npm script) and generates:

- **Build Number**: Timestamp-based unique identifier (format: `YYYYMMDDHHmmss`)
- **Build Date**: ISO 8601 timestamp
- **Git Commit**: Short commit hash (7 characters)
- **Git Branch**: Current branch name
- **Timestamp**: Unix timestamp in milliseconds

### 2. Generated File
**File:** `src/buildInfo.ts` (auto-generated, in `.gitignore`)

This TypeScript file is automatically created during the build process and contains:

```typescript
export interface BuildInfo {
  buildNumber: string;      // "20251016191908"
  buildDate: string;        // "2025-10-16T19:19:08.123Z"
  gitCommit: string;        // "06b6543"
  gitBranch: string;        // "main"
  timestamp: number;        // 1760642348123
}

export const buildInfo: BuildInfo = { ... };
```

### 3. Helper Functions

**`getBuildNumberShort()`**
- Returns: `"YYMMDD-HHmm"` (e.g., `"251016-1919"`)
- Use: Compact display format for UI

**`getBuildDateFormatted()`**
- Returns: Localized date/time string
- Use: Human-readable build date

**`getGitInfo()`**
- Returns: `"branch@commit"` (e.g., `"main@06b6543"`)
- Use: Quick git reference

## Usage in Code

```typescript
import { getBuildNumberShort, getGitInfo } from './buildInfo';

// Display in UI
<p>Build {getBuildNumberShort()} · {getGitInfo()}</p>
```

## Build Process

### Development
```bash
npm run dev
```
- Does NOT generate build info
- Uses existing `buildInfo.ts` if present

### Production Build
```bash
npm run build
```
**Steps:**
1. `prebuild`: Runs `scripts/generate-build-info.js`
2. Generates fresh `src/buildInfo.ts`
3. TypeScript compilation (`tsc -b`)
4. Vite build

**Console Output:**
```
> pomodoro-app@2.2.0 prebuild
> node scripts/generate-build-info.js

✅ Build info generated successfully!
   Build Number: 20251016191908
   Git Commit:   06b6543
   Git Branch:   main
   Output:       src/buildInfo.ts
```

## UI Display

The build information is displayed in the app footer:

```
v2.2.0 · Build 251016-1919 · main@06b6543
```

**Format Breakdown:**
- `v2.2.0` - Package version (manual)
- `Build 251016-1919` - Build number (auto, short format)
- `main@06b6543` - Git branch and commit (auto)

## Benefits

### 1. **Traceability**
- Every build is uniquely identified
- Easy to trace production issues to specific commits
- Build timestamp for debugging

### 2. **No Manual Updates**
- Build number increments automatically
- Always reflects current git state
- No merge conflicts

### 3. **Development Workflow**
- Developers can identify exact build version
- Support teams can reference specific builds
- Easy debugging: "Which build are you running?"

### 4. **CI/CD Integration**
- Works seamlessly with GitHub Actions
- Each CI build gets unique identifier
- Deployment tracking

## Troubleshooting

### Build Info Not Updating
**Solution:** Run a fresh build
```bash
npm run build
```

### Git Info Shows "unknown"
**Cause:** Not in a git repository or git not installed
**Solution:** Ensure you're in a git repo with `git` available in PATH

### TypeScript Errors About buildInfo
**Cause:** `buildInfo.ts` doesn't exist (first time setup)
**Solution:** Generate it manually:
```bash
node scripts/generate-build-info.js
```

## File Structure

```
pomodoro-app/
├── scripts/
│   └── generate-build-info.js    # Build script
├── src/
│   ├── buildInfo.ts               # Auto-generated (gitignored)
│   └── App.tsx                    # Imports build info
├── package.json                   # Contains prebuild script
└── .gitignore                     # Excludes buildInfo.ts
```

## Configuration

### package.json
```json
{
  "scripts": {
    "prebuild": "node scripts/generate-build-info.js",
    "build": "tsc -b && vite build"
  }
}
```

### .gitignore
```
# Build info (auto-generated)
src/buildInfo.ts
```

## Best Practices

### ✅ DO
- Let the build system generate build numbers automatically
- Reference build numbers in bug reports
- Use git commit info for production debugging
- Keep `buildInfo.ts` in `.gitignore`

### ❌ DON'T
- Manually edit `src/buildInfo.ts` (it will be overwritten)
- Commit `buildInfo.ts` to version control
- Hardcode build numbers anywhere

## Version History

| Date | Version | Change |
|------|---------|--------|
| Oct 16, 2025 | v2.2.0 | ✅ Automatic build system implemented |
| Oct 16, 2025 | v2.2.0 | ✅ Manual version display added |

## Examples

### Current Build Info
```typescript
{
  buildNumber: "20251016191908",
  buildDate: "2025-10-16T19:19:08.190Z",
  gitCommit: "06b6543",
  gitBranch: "main",
  timestamp: 1760642348190
}
```

### Display Formats
- **Full**: `20251016191908`
- **Short**: `251016-1919` (251016 = Oct 16, 2025, 1919 = 7:19 PM)
- **Git**: `main@06b6543`
- **Combined**: `v2.2.0 · Build 251016-1919 · main@06b6543`

## Future Enhancements

Potential improvements:
- Add build environment (dev/staging/prod)
- Include deployment URL
- Add CI/CD job ID
- Track build duration
- Include feature flags state

