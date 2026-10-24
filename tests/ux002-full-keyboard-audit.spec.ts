import { test, expect, type Page } from '@playwright/test';

/**
 * UX-002 extended evidence test: do not force focus or click on the app controls.
 * Earlier A11Y-02 and A11Y-03 coverage used locator.focus(), which cannot
 * establish the natural keyboard focus sequence or focus retention during requests.
 *
 * The historical TestSprite UX-002 specification covers both /analyze and /lab.
 */
async function tabUntil(page: Page, id: string, limit = 38) {
  for (let i = 0; i < limit; i++) {
    await page.keyboard.press('Tab');
    if (await page.evaluate(() => (document.activeElement as HTMLElement | null)?.id) === id) {
      await expect(page.locator('#' + id)).toBeFocused();
      return;
    }
  }
  throw new Error('Natural Tab cannot reach #' + id + ' within ' + limit + ' keypresses');
}
const slowApi = async (page: Page, endpoint: string) => {
  await page.route('**' + endpoint, async route => {
    await new Promise(resolve => setTimeout(resolve, 1300));
    await route.continue();
  });
};

test.describe('UX-002 deep keyboard and accessible status audit', () => {
  test('UX002-FULL: natural keyboard journey spans Analyze and Lab, with non-color-only verdict', async ({ page }) => {
    await page.goto('/analyze');
    await tabUntil(page, 'tab-code-snippet');
    for (const id of [
      'tab-github-pr', 'btn-preset-payment', 'btn-preset-jwt',
      'btn-preset-clean', 'code-snippet-input', 'business-rule-input',
      'btn-launch-analysis',
    ]) {
      await page.keyboard.press('Tab');
      await expect(page.locator('#' + id)).toBeFocused();
    }
    await page.keyboard.press('Enter');
    await expect(page.locator('#code-snippet-error')).toHaveText('Code snippet is required and cannot be empty.');
    await expect(page.locator('#code-snippet-input')).toHaveAttribute('aria-invalid', 'true');

    await page.goto('/lab');
    await tabUntil(page, 'fixture-vulnerable');
    await page.keyboard.press('Tab');
    await expect(page.locator('#fixture-fixed')).toBeFocused();
    await page.keyboard.press('Space');
    await expect(page.locator('#fixture-fixed')).toHaveAttribute('aria-pressed', 'true');

    await tabUntil(page, 'btn-execute-verification');
    await expect(page.locator('#btn-execute-verification')).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByText('Execution Run ID:')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Verified Pass', { exact: true })).toBeVisible();
    await expect(page.getByText('Invariant Upheld:', { exact: false })).toBeVisible();
  });

  test('UX002-ASYNC-LAB: keyboard activation retains focus and provides a live progress/verdict announcement', async ({ page }) => {
    await slowApi(page, '/api/v1/lab/verify');
    await page.goto('/lab');
    await tabUntil(page, 'btn-execute-verification');
    const button = page.locator('#btn-execute-verification');
    await page.keyboard.press('Enter');
    await expect(page.getByText('Executing Concurrent Async Requests...')).toBeVisible();
    await expect(button).toBeFocused();
    await expect(button).toHaveAttribute('aria-disabled', 'true');
    await expect(page.getByRole('status', { name: 'Lab verification progress' })).toContainText('Verification in progress');
    await expect(page.getByRole('status', { name: 'Lab verification progress' })).toContainText('Verification finished: Verified Fail');
  });

  test('UX002-ASYNC-ANALYZE: Enter activation retains focus and announces completion', async ({ page }) => {
    await slowApi(page, '/api/v1/analyses');
    await page.goto('/analyze');
    await tabUntil(page, 'code-snippet-input');
    await page.keyboard.type('function add(a, b) { return a + b; }');
    await page.keyboard.press('Tab');
    await expect(page.locator('#business-rule-input')).toBeFocused();
    await page.keyboard.press('Tab');
    const button = page.locator('#btn-launch-analysis');
    await expect(button).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByText('Agents Auditing Code...')).toBeVisible();
    await expect(button).toBeFocused();
    await expect(button).toHaveAttribute('aria-disabled', 'true');
    const status = page.getByRole('status', { name: 'Code analysis progress' });
    await expect(status).toContainText('Analysis in progress');
    await expect(status).toContainText('Analysis complete');
  });
});
