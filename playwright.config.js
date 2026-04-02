import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  retries: 1,
  use: {
    headless: true,
    browserName: 'chromium',
  },
});
