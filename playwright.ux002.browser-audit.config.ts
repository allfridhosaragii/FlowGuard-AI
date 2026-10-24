import { defineConfig, devices } from '@playwright/test';
import base from './playwright.config';

// Test the same production-build CSP under HTTPS instead of HTTP localhost.
// WebKit strictly applies "upgrade-insecure-requests" and will otherwise
// rewrite http://localhost static assets to an unavailable HTTPS port.
export default defineConfig(base, {
  use: { ignoreHTTPSErrors: true },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
