import { test as base, expect, type Page } from '@playwright/test';

/**
 * Custom test fixtures for ZenFocus E2E tests
 */

// Page Object Models
export class TimerPage {
  constructor(public page: Page) {}

  // Locators
  get startButton() {
    return this.page.getByRole('button', { name: 'Start' });
  }

  get pauseButton() {
    return this.page.getByRole('button', { name: 'Pause' });
  }

  get resetButton() {
    return this.page.getByRole('button', { name: 'Reset timer' });
  }

  get settingsButton() {
    return this.page.getByRole('button', { name: 'Settings', exact: true });
  }

  get timerDisplay() {
    return this.page.locator('.tabular-nums').first();
  }

  get logo() {
    return this.page.getByText('ZenFocus');
  }

  get sessionInfo() {
    return this.page.locator('text=Work Session, text=Short Break, text=Long Break');
  }

  // Actions
  async goto() {
    await this.page.goto('/');
    await expect(this.logo).toBeVisible();
  }

  async start() {
    await this.startButton.click();
  }

  async pause() {
    await this.pauseButton.click();
  }

  async reset() {
    await this.resetButton.click();
  }

  async openSettings() {
    await this.settingsButton.click();
  }

  async getTimerText() {
    return this.timerDisplay.textContent();
  }

  async waitForTimerChange(initialTime: string) {
    await expect(async () => {
      const currentTime = await this.getTimerText();
      expect(currentTime).not.toBe(initialTime);
    }).toPass({ timeout: 5000 });
  }

  // Keyboard shortcuts
  async pressSpace() {
    await this.page.keyboard.press('Space');
  }

  async pressR() {
    await this.page.keyboard.press('r');
  }

  async pressS() {
    await this.page.keyboard.press('s');
  }

  async pressT() {
    await this.page.keyboard.press('t');
  }
}

export class LoginPage {
  constructor(public page: Page) {}

  // Locators
  get googleSignInButton() {
    return this.page.getByRole('button', { name: /sign in with google/i });
  }

  get devLoginButton() {
    return this.page.getByRole('button', { name: /dev login/i });
  }

  get continueToTimerLink() {
    return this.page.getByRole('button', { name: /continue to timer/i });
  }

  get title() {
    return this.page.getByRole('heading', { name: 'ZenFocus' });
  }

  get loadingIndicator() {
    return this.page.getByText('Loading...');
  }

  // Actions
  async goto() {
    await this.page.goto('/login');
    // Wait for either loading to disappear or page to be ready
    await this.page.waitForLoadState('networkidle');
  }

  async signInWithDevMode() {
    await this.devLoginButton.click();
  }

  async navigateToTimer() {
    await this.continueToTimerLink.click();
  }
}

export class KamehamehaPage {
  constructor(public page: Page) {}

  // Locators
  get title() {
    return this.page.getByRole('heading', { name: 'Kamehameha' });
  }

  get streakDisplay() {
    return this.page.locator('.text-6xl, .text-7xl, .text-8xl, .text-9xl').first();
  }

  get checkInButton() {
    return this.page.getByRole('button', { name: /daily check-in/i });
  }

  get aiTherapistLink() {
    return this.page.getByRole('link', { name: /ai therapist/i });
  }

  get viewBadgesLink() {
    return this.page.getByRole('link', { name: /view badges/i });
  }

  get journeyHistoryLink() {
    return this.page.getByRole('link', { name: /journey history/i });
  }

  get reportRelapseButton() {
    return this.page.getByRole('button', { name: /report relapse/i });
  }

  get backToTimerLink() {
    return this.page.getByRole('link', { name: /back to timer/i });
  }

  get loadingSpinner() {
    return this.page.getByText('Loading your streaks...');
  }

  get currentStreak() {
    return this.page.getByText(/current:/i);
  }

  get longestStreak() {
    return this.page.getByText(/longest:/i);
  }

  // Actions
  async goto() {
    await this.page.goto('/kamehameha');
  }

  async waitForLoad() {
    // Wait for either loading to finish or page to be ready
    await expect(this.loadingSpinner).toBeHidden({ timeout: 10000 }).catch(() => {
      // If loading spinner wasn't found, that's fine - page might have loaded fast
    });
  }

  async openCheckInModal() {
    await this.checkInButton.click();
  }

  async openRelapseFlow() {
    await this.reportRelapseButton.click();
  }

  async navigateToAIChat() {
    await this.aiTherapistLink.click();
  }

  async navigateToBadges() {
    await this.viewBadgesLink.click();
  }

  async navigateToJourneyHistory() {
    await this.journeyHistoryLink.click();
  }
}

export class SettingsPanel {
  constructor(public page: Page) {}

  // Locators
  get panel() {
    return this.page.locator('[role="dialog"]').filter({ hasText: /settings/i });
  }

  get backdrop() {
    // The backdrop that appears behind the settings panel
    return this.page.locator('.bg-black\\/50.opacity-100');
  }

  get closeButton() {
    return this.page.getByRole('button', { name: 'Close settings panel' });
  }

  get workDurationInput() {
    return this.page.getByLabel(/work duration/i);
  }

  get shortBreakInput() {
    return this.page.getByLabel(/short break/i);
  }

  get longBreakInput() {
    return this.page.getByLabel(/long break/i);
  }

  get saveButton() {
    return this.page.getByRole('button', { name: /save/i });
  }

  get resetButton() {
    return this.page.getByRole('button', { name: /reset/i });
  }

  // Actions
  async setWorkDuration(minutes: number) {
    await this.workDurationInput.fill(String(minutes));
  }

  async setShortBreak(minutes: number) {
    await this.shortBreakInput.fill(String(minutes));
  }

  async setLongBreak(minutes: number) {
    await this.longBreakInput.fill(String(minutes));
  }

  async save() {
    await this.saveButton.click();
  }

  async close() {
    await this.closeButton.click();
  }

  async reset() {
    await this.resetButton.click();
  }
}

// Extended test fixture with page objects
export const test = base.extend<{
  timerPage: TimerPage;
  loginPage: LoginPage;
  kamehamehaPage: KamehamehaPage;
  settingsPanel: SettingsPanel;
}>({
  timerPage: async ({ page }, use) => {
    await use(new TimerPage(page));
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  kamehamehaPage: async ({ page }, use) => {
    await use(new KamehamehaPage(page));
  },
  settingsPanel: async ({ page }, use) => {
    await use(new SettingsPanel(page));
  },
});

export { expect };
