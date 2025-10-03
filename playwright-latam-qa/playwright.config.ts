import { PlaywrightTestConfig, devices } from '@playwright/test';

const config: PlaywrightTestConfig = {
  testDir: './tests',
  timeout: 60 * 1000,
  expect: { timeout: 5000 },
  reporter: [['html', { outputFolder: 'reports/playwright-report', open: 'never' }]],
  use: {
    headless: true,
    viewport: { width: 1280, height: 720 },
    actionTimeout: 10 * 1000,
    baseURL: 'https://automationexercise.com',
    ignoreHTTPSErrors: true,
    trace: 'on',
    // Optionally, also enable video recording
    video: 'on-first-retry',
    // Configure automatic screenshots for failures
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium-desktop', use: { browserName: 'chromium', viewport: { width: 1280, height: 720 } } },
    { name: 'webkit-mobile', use: { browserName: 'webkit', ...devices['iPhone 12'] } }
  ]
};

export default config;
export { config };