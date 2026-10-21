import { test, expect } from '@playwright/test';

test.describe('Keyboard Navigation & Accessibility (WCAG 2.1 AA)', () => {
  test('A11Y-01: Skip to main content link becomes focused on first Tab and navigates to main', async ({
    page,
  }) => {
    await page.goto('/');

    // Press Tab from initial page load
    await page.keyboard.press('Tab');

    // Skip to main content link should receive focus
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toBeVisible();

    // Press Enter to follow skip link
    await page.keyboard.press('Enter');

    // Main content landmark should be active/target
    const mainContent = page.locator('#main-content');
    await expect(mainContent).toBeAttached();
  });

  test('A11Y-02 (UX-002): Keyboard navigation on Code Snippet, Business Rule, and Launch Button', async ({
    page,
  }) => {
    await page.goto('/analyze');

    const snippetInput = page.locator('#code-snippet-input');
    const ruleInput = page.locator('#business-rule-input');
    const launchBtn = page.locator('#btn-launch-analysis');

    // 1. Focus the Code Snippet directly or through Tab sequence
    await snippetInput.focus();
    await expect(snippetInput).toBeFocused();

    // 2. Press Tab to advance focus to Business Rule input
    await page.keyboard.press('Tab');
    await expect(ruleInput).toBeFocused();

    // 3. Press Tab to advance focus to Launch Multi-Agent Analysis button
    await page.keyboard.press('Tab');
    await expect(launchBtn).toBeFocused();

    // 4. Press Enter on Launch button while empty: triggers validation without fake report
    await page.keyboard.press('Enter');
    await expect(page.locator('#code-snippet-error')).toBeVisible();
    await expect(page.locator('#code-snippet-error')).toContainText(
      'Code snippet is required and cannot be empty.'
    );

    // 5. Shift+Tab backward navigation: Launch -> Business Rule -> Code Snippet
    await page.keyboard.press('Shift+Tab');
    await expect(ruleInput).toBeFocused();

    await page.keyboard.press('Shift+Tab');
    await expect(snippetInput).toBeFocused();

    // 6. Test activating sample preset via keyboard (Enter / Space)
    const paymentPreset = page.locator('#btn-preset-payment');
    await paymentPreset.focus();
    await expect(paymentPreset).toBeFocused();
    await page.keyboard.press('Enter');

    // Verify snippet is populated (wait for React state update)
    await expect(snippetInput).not.toHaveValue('', { timeout: 3000 });

    // 7. Tab to launch button and activate via Space/Enter key
    await launchBtn.focus();
    await expect(launchBtn).toBeFocused();
    await page.keyboard.press('Space');

    // Verify multi-agent pipeline completes
    await expect(page.locator('text=Formal Invariants Extracted (Agent A)')).toBeVisible({
      timeout: 10000,
    });
    await expect(page.locator('text=Identified Risk Findings (Agent B)')).toBeVisible();
  });

  test('A11Y-03: Verification Lab keyboard navigation across fixtures, inputs, and execute button', async ({
    page,
    context,
  }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']).catch(() => {});
    await page.goto('/lab');

    const vulnerableBtn = page.locator('#fixture-vulnerable');
    const fixedBtn = page.locator('#fixture-fixed');
    const keyInput = page.locator('#lab-idempotency-key');
    const amountInput = page.locator('#lab-amount-input');
    const payloadMode = page.locator('#lab-payload-mode');
    const executeBtn = page.locator('#btn-execute-verification');

    // 1. Focus vulnerable fixture button
    await vulnerableBtn.focus();
    await expect(vulnerableBtn).toBeFocused();

    // 2. Tab to Corrected Fixture and activate with Space
    await page.keyboard.press('Tab');
    await expect(fixedBtn).toBeFocused();
    await page.keyboard.press('Space');
    await expect(fixedBtn).toHaveAttribute('aria-pressed', 'true');

    // 3. Focus Idempotency Key input
    await keyInput.focus();
    await expect(keyInput).toBeFocused();

    // 4. Tab to Amount input
    await page.keyboard.press('Tab');
    await expect(amountInput).toBeFocused();

    // 5. Tab to Payload Mode select
    await page.keyboard.press('Tab');
    await expect(payloadMode).toBeFocused();

    // 6. Tab to Execute Verification button
    await page.keyboard.press('Tab');
    await expect(executeBtn).toBeFocused();

    // 7. Press Enter on Execute button
    await page.keyboard.press('Enter');

    // 8. Verify execution evidence appears and copy button is focusable
    await expect(page.locator('text=Execution Run ID:')).toBeVisible({ timeout: 10000 });
    const copyBtn = page.locator('#btn-copy-test-assertion');
    await copyBtn.focus();
    await expect(copyBtn).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('button', { name: /Copied/i })).toBeVisible({ timeout: 3000 });
  });

  test('A11Y-04: Mobile navigation menu keyboard accessibility & Escape key dismissal', async ({
    page,
  }) => {
    // Mobile viewport
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    const toggleBtn = page.locator('#mobile-menu-toggle');
    await expect(toggleBtn).toBeVisible();

    // Focus hamburger button with keyboard
    await toggleBtn.focus();
    await expect(toggleBtn).toBeFocused();
    await expect(toggleBtn).toHaveAttribute('aria-expanded', 'false');

    // Press Enter to open menu
    await page.keyboard.press('Enter');
    await expect(toggleBtn).toHaveAttribute('aria-expanded', 'true');
    const mobileMenu = page.locator('#mobile-navigation-menu');
    await expect(mobileMenu).toBeVisible();

    // Press Escape to dismiss menu
    await page.keyboard.press('Escape');
    await expect(toggleBtn).toHaveAttribute('aria-expanded', 'false');
    await expect(mobileMenu).not.toBeVisible();

    // Verify focus is cleanly restored to the toggle button
    await expect(toggleBtn).toBeFocused();
  });
});
