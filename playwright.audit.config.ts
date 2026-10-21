import { defineConfig } from '@playwright/test';
import base from './playwright.config';

const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;

export default defineConfig(
  base,
  executablePath ? { use: { launchOptions: { executablePath } } } : {}
);
