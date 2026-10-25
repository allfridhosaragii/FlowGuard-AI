import { test, expect } from '@playwright/test';

// Independent diagnostics for TestSprite's vendor-blocked blank Analyze page.
// This does not claim vendor success or simulate vendor test results.
test.describe('Hosted Analyze rendering and assertion-copy diagnostics', () => {
  test('cold navigation and client navigation never leave an empty analysis workspace', async ({ page }) => {
    const exceptions: string[] = [];
    page.on('pageerror', error => exceptions.push(error.message));

    for (let attempt = 1; attempt <= 4; attempt++) {
      await test.step('cold page load #' + attempt, async () => {
        const response = await page.goto('/analyze', { waitUntil: 'domcontentloaded' });
        expect([200, 304], 'Server may legitimately revalidate cached SSR HTML with HTTP 304').toContain(response?.status());
        await expect(page.getByRole('heading', { name: /Pull Request & Code Analysis Workspace/i })).toBeVisible({ timeout: 15000 });
        await expect(page.locator('#code-snippet-input')).toBeVisible();
        await expect(page.locator('#business-rule-input')).toBeVisible();
        await expect(page.locator('#btn-launch-analysis')).toBeVisible();
        await expect(page.locator('#main-content')).toBeVisible();
      });
    }
    for (let attempt = 1; attempt <= 2; attempt++) {
      await test.step('client side navigation #' + attempt, async () => {
        await page.goto('/', { waitUntil: 'domcontentloaded' });
        await page.getByRole('navigation', { name: 'Main Navigation' }).getByRole('link', { name: 'PR Analysis' }).click();
        await expect(page).toHaveURL(/\/analyze$/);
        await expect(page.getByRole('heading', { name: /Pull Request & Code Analysis Workspace/i })).toBeVisible({ timeout: 15000 });
        await expect(page.locator('#code-snippet-input')).toBeVisible();
      });
    }
    expect(exceptions, 'Uncaught page errors during analysis page bootstrap').toEqual([]);
  });

  test('example assertion appears and copy gives true browser feedback', async ({ page }) => {
    const exceptions: string[] = [];
    page.on('pageerror', error => exceptions.push(error.message));
    const response = await page.goto('/analyze', { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { name: /Pull Request & Code Analysis Workspace/i })).toBeVisible({ timeout: 15000 });
    await page.getByRole('button', { name: /Payment Race/i }).click();
    await page.getByRole('button', { name: /Launch Multi-Agent Analysis/i }).click();
    const assertion = page.getByTestId('analysis-example-assertion');
    await expect(assertion).toBeVisible({ timeout: 25000 });
    await expect(assertion).toContainText('/api/v1/lab/verify');
    const button = page.getByTestId('analysis-copy-assertion');
    await expect(button).toBeEnabled();
    await button.click();
    const copied = page.getByText('Example assertion copied to clipboard.');
    const failed = page.getByText('Copy failed. Select the code below to copy it manually.');
    await expect(copied.or(failed).first()).toBeVisible({ timeout: 7000 });
    if (await copied.isVisible()) {
      await expect(button).toHaveText('Copied');
    }
    expect(exceptions, 'Uncaught errors in assertion/copy flow').toEqual([]);
  });
});
