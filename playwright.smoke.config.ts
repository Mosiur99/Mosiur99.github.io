import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/smoke',
  retries: 2,
  reporter: process.env.CI ? 'github' : 'list',
  use: { baseURL: process.env.SITE_URL ?? 'https://mosiur99.github.io' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'phone', use: { ...devices['Pixel 7'] } },
  ],
});
