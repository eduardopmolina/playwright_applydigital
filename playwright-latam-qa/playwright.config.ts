import { PlaywrightTestConfig, devices } from '@playwright/test';

const config: PlaywrightTestConfig = {
  testDir: './tests',
  timeout: 60000,
  expect: { timeout: 5000 },
  reporter: [['html', { outputFolder: 'reports/playwright-report', open: 'always' }]],
  use: {
    headless: false,
    viewport: { width: 1280, height: 720 },
    actionTimeout: 10000,
    baseURL: 'https://automationexercise.com/',
    ignoreHTTPSErrors: true
  },
  projects: [
    { name: 'chromium-desktop', use: { browserName: 'chromium', viewport: { width: 1280, height: 720 } } },
    { name: 'webkit-mobile', use: { browserName: 'webkit', ...devices['iPhone 12'] } }
  ]
};

export default config;
