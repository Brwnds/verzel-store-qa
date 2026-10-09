import { defineConfig, devices } from '@playwright/test';

export const BASE_URL = process.env.BASE_URL ?? 'https://verzel-store.qa-test-verzel-store.workers.dev';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: { timeout: 10_000 },
  // Ambiente compartilhado com outros candidatos: poucos workers para não gerar carga.
  workers: 2,
  retries: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: BASE_URL,
    locale: 'pt-BR',
    screenshot: 'on',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'ui',
      testDir: './tests/ui',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'api',
      testDir: './tests/api',
      use: { extraHTTPHeaders: { 'Content-Type': 'application/json' } },
    },
  ],
});
