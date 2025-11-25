/**
 * Test utilities for rendering components and hooks with providers
 */

import React, { ReactElement } from 'react';
import {
  render,
  RenderOptions,
  renderHook,
  RenderHookOptions,
} from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../features/auth/context/AuthContext';
import { StreaksProvider } from '../features/kamehameha/context/StreaksContext';

/**
 * All providers wrapper for testing
 */
export function AllProviders({ children }: { children: React.ReactNode }) {
  return (
    <BrowserRouter>
      <AuthProvider>
        <StreaksProvider>{children}</StreaksProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

/**
 * Render a component with all providers
 *
 * @example
 * const { getByText } = renderWithProviders(<MyComponent />);
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AllProviders, ...options });
}

/**
 * Render a hook with all providers
 *
 * @example
 * const { result } = renderHookWithProviders(() => useMyHook());
 */
export function renderHookWithProviders<TResult>(
  hook: () => TResult,
  options?: Omit<RenderHookOptions<TResult>, 'wrapper'>
) {
  return renderHook(hook, { wrapper: AllProviders, ...options });
}

/**
 * Custom wrapper for auth-only tests (no StreaksProvider)
 */
export function AuthOnlyProvider({ children }: { children: React.ReactNode }) {
  return (
    <BrowserRouter>
      <AuthProvider>{children}</AuthProvider>
    </BrowserRouter>
  );
}

/**
 * Render with auth provider only (useful for auth-specific tests)
 */
export function renderWithAuth(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AuthOnlyProvider, ...options });
}

/**
 * Render hook with auth provider only
 */
export function renderHookWithAuth<TResult>(
  hook: () => TResult,
  options?: Omit<RenderHookOptions<TResult>, 'wrapper'>
) {
  return renderHook(hook, { wrapper: AuthOnlyProvider, ...options });
}

/**
 * Wait for a condition to be true
 * Useful for async assertions
 *
 * @example
 * await waitFor(() => expect(result.current.loading).toBe(false));
 */
export { waitFor } from '@testing-library/react';

/**
 * User event helper for simulating user interactions
 *
 * @example
 * await userEvent.click(button);
 */
export { default as userEvent } from '@testing-library/user-event';
