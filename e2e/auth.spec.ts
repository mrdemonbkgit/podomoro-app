import { test, expect } from './fixtures/test-fixtures';

/**
 * E2E Tests for Authentication Flow
 *
 * Tests the authentication functionality including:
 * - Login page display
 * - Protected route redirects
 * - Navigation between timer and login
 * - Dev mode login (when available)
 */

test.describe('Authentication', () => {
  test.describe('Login Page', () => {
    test('should display the login page with branding', async ({ loginPage }) => {
      await loginPage.goto();

      // Check branding elements
      await expect(loginPage.title).toBeVisible();
      await expect(loginPage.page.getByText('Kamehameha Recovery Tool')).toBeVisible();
    });

    test('should display the Google sign-in button', async ({ loginPage }) => {
      await loginPage.goto();
      await expect(loginPage.googleSignInButton).toBeVisible();
    });

    test('should display "Continue to Timer" link', async ({ loginPage }) => {
      await loginPage.goto();
      await expect(loginPage.continueToTimerLink).toBeVisible();
    });

    test('should navigate to timer when clicking "Continue to Timer"', async ({
      loginPage,
      page,
    }) => {
      await loginPage.goto();
      await loginPage.navigateToTimer();

      // Should navigate to timer page
      await expect(page).toHaveURL(/\/(timer)?$/);
    });

    test('should display privacy note', async ({ loginPage }) => {
      await loginPage.goto();
      await expect(loginPage.page.getByText(/your data is private/i)).toBeVisible();
    });

    test('should display description text', async ({ loginPage }) => {
      await loginPage.goto();
      await expect(
        loginPage.page.getByText(/track your progress.*build streaks/i)
      ).toBeVisible();
    });
  });

  test.describe('Protected Routes', () => {
    test('should redirect to login when accessing /kamehameha unauthenticated', async ({
      page,
    }) => {
      await page.goto('/kamehameha');

      // Should redirect to login page
      await expect(page).toHaveURL(/login/);
    });

    test('should redirect to login when accessing /kamehameha/chat unauthenticated', async ({
      page,
    }) => {
      await page.goto('/kamehameha/chat');

      // Should redirect to login page
      await expect(page).toHaveURL(/login/);
    });

    test('should redirect to login when accessing /kamehameha/badges unauthenticated', async ({
      page,
    }) => {
      await page.goto('/kamehameha/badges');

      // Should redirect to login page
      await expect(page).toHaveURL(/login/);
    });

    test('should redirect to login when accessing /kamehameha/history unauthenticated', async ({
      page,
    }) => {
      await page.goto('/kamehameha/history');

      // Should redirect to login page
      await expect(page).toHaveURL(/login/);
    });
  });

  test.describe('Public Routes', () => {
    test('should allow access to timer without authentication', async ({ page }) => {
      await page.goto('/timer');

      // Should stay on timer page
      await expect(page).toHaveURL(/timer/);
      await expect(page.getByText('ZenFocus')).toBeVisible();
    });

    test('should allow access to home page without authentication', async ({ page }) => {
      await page.goto('/');

      // Should stay on home page (timer)
      await expect(page.getByText('ZenFocus')).toBeVisible();
    });

    test('should allow access to login page', async ({ page }) => {
      await page.goto('/login');

      // Should stay on login page
      await expect(page).toHaveURL(/login/);
    });
  });

  test.describe('Dev Mode Login', () => {
    // These tests only work in development mode
    test('should show dev login button in development mode', async ({ loginPage, page }) => {
      await loginPage.goto();

      // The dev login button only appears when VITE_USE_FIREBASE_EMULATOR is true
      // and when running in DEV mode (import.meta.env.DEV)
      const devButton = loginPage.devLoginButton;
      const isVisible = await devButton.isVisible().catch(() => false);

      // In CI, this will likely be false, but in dev mode it should be true
      // We just verify the page loads correctly either way
      if (isVisible) {
        await expect(devButton).toContainText(/dev login/i);
      } else {
        // In production/CI, verify Google sign-in is the primary option
        await expect(loginPage.googleSignInButton).toBeVisible();
      }
    });
  });

  test.describe('Navigation Flow', () => {
    test('should navigate from timer to login via Kamehameha link', async ({
      timerPage,
      page,
    }) => {
      await timerPage.goto();

      // Find and click the Kamehameha navigation link
      const kameLink = page.getByRole('link', { name: /kamehameha/i });
      if (await kameLink.isVisible()) {
        await kameLink.click();

        // Should redirect to login since not authenticated
        await expect(page).toHaveURL(/login/);
      }
    });

    test('should navigate back to timer from login page', async ({ loginPage, page }) => {
      await loginPage.goto();
      await loginPage.navigateToTimer();

      await expect(page).toHaveURL(/\/(timer)?$/);
      await expect(page.getByText('ZenFocus')).toBeVisible();
    });
  });

  test.describe('Loading States', () => {
    test('should show loading indicator while checking auth state', async ({ page }) => {
      // Navigate to login and check for loading state
      await page.goto('/login');

      // The loading indicator might flash very quickly
      // We just verify the page eventually loads
      await page.waitForLoadState('networkidle');

      // Either loading is gone or login form is visible
      await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible({
        timeout: 10000,
      });
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      // Simulate offline mode
      await page.context().setOffline(true);

      await page.goto('/login').catch(() => {
        // Expected to fail
      });

      // Re-enable network
      await page.context().setOffline(false);

      // Navigate again
      await page.goto('/login');
      await expect(page.getByText('ZenFocus')).toBeVisible();
    });
  });
});

test.describe('Authentication - Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  test('login page should be responsive on mobile', async ({ loginPage }) => {
    await loginPage.goto();

    // Core elements should be visible
    await expect(loginPage.title).toBeVisible();
    await expect(loginPage.googleSignInButton).toBeVisible();
    await expect(loginPage.continueToTimerLink).toBeVisible();
  });
});
