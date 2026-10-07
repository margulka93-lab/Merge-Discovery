import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/production', outputDir: 'test-results-production', workers: 1, fullyParallel: false, timeout: 120000,
  use: { baseURL: 'http://127.0.0.1:5179', viewport: { width: 1440, height: 900 }, serviceWorkers: 'allow', trace: 'retain-on-failure' },
  webServer: { command: 'npx tsx scripts/serve-production-test.ts', url: 'http://127.0.0.1:5179', reuseExistingServer: false },
});
