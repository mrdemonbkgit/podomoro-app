# Testing Guide

## 🧪 Test Infrastructure

This project uses **Vitest** for unit testing with React Testing Library for component and hook testing.

---

## 📦 Test Stack

- **Vitest** - Fast unit test framework (Vite-native)
- **@testing-library/react** - React hook and component testing
- **@testing-library/jest-dom** - Custom matchers for DOM assertions
- **jsdom** - Browser environment simulation

---

## 🚀 Running Tests

### Run all tests (CI mode)
```bash
npm test
```

### Watch mode (development)
```bash
npm run test:watch
```

### Coverage report
```bash
npm run test:coverage
```

### UI mode (interactive)
```bash
npm run test:ui
```

---

## 📂 Test Organization

```
src/
├── hooks/
│   ├── __tests__/
│   │   └── useTimer.test.ts
│   ├── useTimer.ts
│   └── useSettings.ts
└── test/
    └── setup.ts           # Global test setup
```

---

## ✅ Current Test Coverage

### Hooks
- ✅ **useTimer** (11 tests)
  - Initial state
  - Timer controls (start, pause, reset)
  - Settings changes
  - Pause button bug fix validation
  - State persistence
  - Session counter

### Not Yet Tested (Future)
- ⏳ useSettings
- ⏳ usePersistedState
- ⏳ Components (low priority)

---

## 🎯 Testing Philosophy

**We follow a pragmatic approach:**

1. ✅ **Test critical logic** - Hooks, state management, calculations
2. ✅ **Test bug fixes** - Ensure regressions don't happen
3. ❌ **Don't test UI** - Manual testing + MCP for E2E
4. ❌ **Don't test trivial code** - Presentational components

**Target Coverage:** 40-50% focused on critical paths

---

## 📝 Writing Tests

### Example: Testing a Hook

```typescript
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTimer } from '../useTimer';

describe('useTimer', () => {
  it('should start the timer', () => {
    const { result } = renderHook(() => useTimer({ settings: DEFAULT_SETTINGS }));

    act(() => {
      result.current.start();
    });

    expect(result.current.isActive).toBe(true);
  });
});
```

---

## 🔧 Test Configuration

### vitest.config.ts
- Environment: jsdom (browser simulation)
- Globals: true (no need to import describe/it/expect)
- Setup file: `src/test/setup.ts`
- Coverage provider: v8

### Global Setup (src/test/setup.ts)
- jest-dom matchers
- localStorage mock
- Audio API mock
- Automatic cleanup after each test

---

## 🐛 Testing Bug Fixes

When fixing a bug:
1. Write a failing test that reproduces the bug
2. Fix the bug
3. Verify the test passes
4. Keep the test to prevent regression

**Example:** Pause button reset bug test in `useTimer.test.ts`

---

## 🚨 CI/CD Integration

Tests run automatically on:
- Every push to `main`
- Every pull request

GitHub Actions workflow: `.github/workflows/ci.yml`

### CI Pipeline
1. Install dependencies
2. Run TypeScript type check
3. **Run tests** ⬅️
4. Build production bundle
5. Upload artifacts

---

## 📊 Coverage Goals

**Current:** ~30% (focused on critical hooks)  
**Target:** 40-50% (critical logic only)  
**Not a goal:** 80%+ (diminishing returns)

---

## 🎓 Best Practices

### DO
✅ Test public APIs, not implementation details  
✅ Test critical business logic  
✅ Test edge cases and error conditions  
✅ Write tests for new features  
✅ Keep tests simple and readable  

### DON'T
❌ Test implementation details  
❌ Test trivial code  
❌ Write tests just for coverage  
❌ Mock everything  
❌ Test UI components extensively  

---

## 🔄 Test Development Workflow

1. **Write test first** (for new features)
2. **See it fail** (red)
3. **Implement feature** (green)
4. **Refactor** (maintain green)
5. **Commit** (with passing tests)

---

## 📚 Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Docs](https://testing-library.com/react)
- [React Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

## 🤝 Contributing Tests

When adding new features:
1. Add tests in `__tests__` directory next to the code
2. Name test files: `*.test.ts` or `*.test.tsx`
3. Use descriptive test names
4. Group related tests with `describe`
5. Ensure tests pass before committing

---

**Last Updated:** October 17, 2025  
**Test Framework:** Vitest 3.2.4  
**Test Files:** 1  
**Total Tests:** 11  
**Status:** ✅ All Passing

