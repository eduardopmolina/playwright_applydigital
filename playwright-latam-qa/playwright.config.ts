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
    trace: 'off',
    // Optionally, also enable video recording
    video: 'on-first-retry',
  },
  projects: [
    { 
      name: 'chromium-desktop', 
      use: { 
        browserName: 'chromium', 
        viewport: { width: 1280, height: 720 },
        channel: 'chrome' // Use Google Chrome
      } 
    },
    { 
      name: 'chromium-mobile', 
      use: { 
        browserName: 'chromium', 
        ...devices['iPhone 12'] 
      } 
    }
  ]
};

export default config;

export { config };
