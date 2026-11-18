import { defineConfig, devices } from '@playwright/test';

const port = 4321;
const draftsPort = 4322;

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${port}`,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] }, testIgnore: /drafts\.spec\.ts/ },
    { name: 'phone', use: { ...devices['Pixel 7'] }, testIgnore: /drafts\.spec\.ts/ },
    {
      name: 'drafts',
      use: { ...devices['Desktop Chrome'], baseURL: `http://localhost:${draftsPort}` },
      testMatch: /drafts\.spec\.ts/,
    },
  ],
  webServer: {
    command: 'node scripts/e2e-servers.mjs',
    url: `http://localhost:${port}`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
