import { test, expect, type Page } from '@playwright/test';

// Deliberately no locator.focus(), locator.click(), or locator.fill().
// This verifies the natural keyboard path that the pre-existing A11Y-02
// cannot prove because A11Y-02 starts with programmatic textarea focus.
const activeId = (page: Page) =>
  page.evaluate(() => (document.activeElement as HTMLElement | null)?.id ?? '');

async function reachModeByTab(page: Page) {
  for (let n = 0; n < 30; n++) {
    await page.keyboard.press('Tab');
    if ((await activeId(page)) === 'tab-code-snippet') {
      await expect(page.locator('#tab-code-snippet')).toBeFocused();
      return;
    }
  }
  throw new Error('Code Snippet mode was not reachable within 30 natural Tab presses');
}

test.describe('Isolated real-keyboard accessibility audit', () => {
  test('A11Y-AUDIT-01: natural Tab traverses form and Enter validates empty snippet', async ({ page }) => {
    await page.goto('/analyze');
    await expect(page.getByRole('heading', { name: /Pull Request & Code Analysis Workspace/ })).toBeVisible();

    await reachModeByTab(page);
    const subsequentIds = [
      'tab-github-pr',
      'btn-preset-payment',
      'btn-preset-jwt',
      'btn-preset-clean',
      'code-snippet-input',
      'business-rule-input',
      'btn-launch-analysis',
    ];

    for (const id of subsequentIds) {
      await page.keyboard.press('Tab');
      expect(await activeId(page), 'Expected natural Tab focus at #' + id).toBe(id);
      await expect(page.locator('#' + id)).toBeFocused();
    }

    const snippet = page.locator('#code-snippet-input');
    const rule = page.locator('#business-rule-input');
    const launch = page.locator('#btn-launch-analysis');
    await expect(snippet).toHaveValue('');
    await expect(rule).not.toHaveValue('');
    await expect(launch).toBeEnabled();
    for (const el of [snippet, rule, launch]) {
      await expect(el).toBeVisible();
      await expect(el).not.toHaveAttribute('aria-hidden', 'true');
      await expect(el).toBeEnabled();
      const label = await el.getAttribute('aria-label');
      expect(label?.trim().length).toBeGreaterThan(0);
    }
    expect(await launch.evaluate((el) => window.getComputedStyle(el).outlineStyle)).not.toBe('none');

    await page.keyboard.press('Enter');
    await expect(page.locator('#code-snippet-error')).toHaveText(
      'Code snippet is required and cannot be empty.'
    );
    await expect(snippet).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('[data-testid="analysis-error-banner"]')).toContainText(
      'Code snippet is required and cannot be empty.'
    );
    await expect(page.getByText('Formal Invariants Extracted (Agent A)')).not.toBeVisible();

    await page.keyboard.press('Shift+Tab');
    await expect(rule).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(snippet).toBeFocused();
  });

  test('A11Y-AUDIT-02: Enter/Space change input modes without trapping Tab', async ({ page }) => {
    await page.goto('/analyze');
    await reachModeByTab(page);

    await page.keyboard.press('Tab');
    await expect(page.locator('#tab-github-pr')).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('#github-pr-url-input')).toBeVisible();
    await expect(page.locator('#tab-github-pr')).toHaveAttribute('aria-selected', 'true');

    await page.keyboard.press('Shift+Tab');
    await expect(page.locator('#tab-code-snippet')).toBeFocused();
    await page.keyboard.press('Space');
    await expect(page.locator('#code-snippet-input')).toBeVisible();
    await expect(page.locator('#tab-code-snippet')).toHaveAttribute('aria-selected', 'true');

    await page.keyboard.press('Tab');
    await expect(page.locator('#tab-github-pr')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.locator('#btn-preset-payment')).toBeFocused();
  });
});
