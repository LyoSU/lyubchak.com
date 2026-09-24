import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  use: { baseURL: 'http://localhost:4173', browserName: 'chromium' },
  webServer: { command: 'node serve.mjs', port: 4173, reuseExistingServer: true },
});
