import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config — Flow Tester suite (Estudio Dental Mendieta).
 * Tests run against the DEPLOYED Azure Static Web App (never localhost).
 * The seed hydrates into localStorage on first load of any internal route
 * (SeedReadyGuard), so each test warms the seed via the helper in tests/_helpers.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  timeout: 60_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL: 'https://happy-coast-044ea7e0f.7.azurestaticapps.net',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  projects: [
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 900 } } },
    { name: 'mobile-chromium', use: { ...devices['Pixel 5'] } },
  ],
});
