import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests',
  use: {
    browserName: 'chromium',
    headless: true,
  },
  globalSetup: './global-setup.ts',
});