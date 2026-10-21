import { test, expect, devices } from '@playwright/test';

test.describe('Mobile Device Emulation & HTML Viewport Audit (Real Devices)', () => {
  // MOB-01: HTML Deployment Meta Viewport Audit across all primary routes
  test('MOB-01: Deployment HTML includes valid meta viewport on all primary routes', async ({
    page,
  }) => {
    const routes = ['/', '/lab', '/analyze', '/about'];

    for (const route of routes) {
      await page.goto(route);
      const metaViewport = await page.getAttribute('meta[name="viewport"]', 'content');
      expect(metaViewport, `Route ${route} should contain meta viewport tag`).toBeTruthy();
      expect(metaViewport).toContain('width=device-width');
      expect(metaViewport).toContain('initial-scale=1');
    }
  });

  // MOB-02: iPhone 14 Profile (iOS Safari, DPR: 3, 390x844)
  test.describe('iPhone 14 Emulation', () => {
    const { defaultBrowserType, ...iphone14Options } = devices['iPhone 14'];
    test.use({
      ...iphone14Options,
      viewport: { width: 390, height: 844 },
    });

    test('MOB-02: iPhone 14 touch navigation, hamburger toggle, and overflow check', async ({
      page,
    }) => {
      await page.goto('/');

      // Verify touch support and DPR
      const hasTouch = await page.evaluate(() => 'ontouchstart' in window);
      expect(hasTouch).toBe(true);
      const dpr = await page.evaluate(() => window.devicePixelRatio);
      expect(dpr).toBe(3);

      // Verify no horizontal overflow
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth
      );
      expect(overflow).toBe(false);

      // Tap hamburger menu
      const toggle = page.locator('#mobile-menu-toggle');
      await expect(toggle).toBeVisible();
      await toggle.tap();

      const mobileMenu = page.locator('#mobile-navigation-menu');
      await expect(mobileMenu).toBeVisible();

      // Tap navigation link to Lab
      const labLink = mobileMenu.locator('a[href="/lab"]');
      await expect(labLink).toBeVisible();
      await labLink.tap();
      await expect(page).toHaveURL(/\/lab/);

      // Screenshot evidence
      await page.screenshot({
        path: 'test-results/screenshots/mobile-emulation-iphone14-lab.png',
        fullPage: true,
      });
    });
  });

  // MOB-03: iPhone SE Profile (Compact 320px Viewport, DPR: 2, 320x568)
  test.describe('iPhone SE Emulation (320px Narrowest Mobile)', () => {
    const { defaultBrowserType, ...iphoneSeOptions } = devices['iPhone SE'];
    test.use({
      ...iphoneSeOptions,
      viewport: { width: 320, height: 568 },
    });

    test('MOB-03: iPhone SE 320px runs PR Analysis with touch tap and no horizontal overflow', async ({
      page,
    }) => {
      await page.goto('/analyze');

      // Verify initial overflow
      const overflowBefore = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth
      );
      expect(overflowBefore).toBe(false);

      // Tap Payment preset button
      const presetBtn = page.locator('#btn-preset-payment');
      await expect(presetBtn).toBeVisible();
      await presetBtn.tap();

      // Verify snippet loaded
      const snippet = page.locator('#code-snippet-input');
      await expect(snippet).not.toHaveValue('', { timeout: 3000 });

      // Tap Launch Analysis button
      const launchBtn = page.locator('#btn-launch-analysis');
      await expect(launchBtn).toBeVisible();
      await launchBtn.tap();

      // Verify results rendered
      await expect(page.locator('text=Formal Invariants Extracted (Agent A)')).toBeVisible({
        timeout: 10000,
      });

      // Verify post-render overflow stays false on 320px
      const overflowAfter = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth
      );
      expect(overflowAfter).toBe(false);

      // Screenshot evidence
      await page.screenshot({
        path: 'test-results/screenshots/mobile-emulation-iphonese-analyze.png',
        fullPage: true,
      });
    });
  });

  // MOB-04: Google Pixel 7 Profile (Android Chrome, DPR: 2.625, 412x839)
  test.describe('Google Pixel 7 Emulation (Android Mobile)', () => {
    const { defaultBrowserType, ...pixel7Options } = devices['Pixel 7'];
    test.use({
      ...pixel7Options,
      viewport: { width: 412, height: 839 },
    });

    test('MOB-04: Pixel 7 executes Verification Lab with touch tap and copies assertion', async ({
      page,
      context,
    }) => {
      await context.grantPermissions(['clipboard-read', 'clipboard-write']).catch(() => {});
      await page.goto('/lab');

      // Verify touch support and Android DPR
      const hasTouch = await page.evaluate(() => 'ontouchstart' in window);
      expect(hasTouch).toBe(true);
      const dpr = await page.evaluate(() => window.devicePixelRatio);
      expect(dpr).toBe(2.625);

      // Tap Execute Verification button
      const executeBtn = page.locator('#btn-execute-verification');
      await expect(executeBtn).toBeVisible();
      await executeBtn.tap();

      // Verify evidence rendered
      await expect(page.locator('text=Execution Run ID:')).toBeVisible({ timeout: 10000 });
      await expect(page.getByText('Observed Side Effects', { exact: true })).toBeVisible();

      // Tap Copy Test Assertion button
      const copyBtn = page.locator('#btn-copy-test-assertion');
      await expect(copyBtn).toBeVisible();
      await copyBtn.tap();
      await expect(page.getByRole('button', { name: /Copied/i })).toBeVisible({ timeout: 3000 });

      // Verify no horizontal overflow
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth
      );
      expect(overflow).toBe(false);

      // Screenshot evidence
      await page.screenshot({
        path: 'test-results/screenshots/mobile-emulation-pixel7-lab.png',
        fullPage: true,
      });
    });
  });

  // MOB-05: iPad Mini Profile (Tablet Touch, DPR: 2, 768x1024)
  test.describe('iPad Mini Emulation (Tablet Touch)', () => {
    const { defaultBrowserType, ...ipadOptions } = devices['iPad Mini'];
    test.use({
      ...ipadOptions,
      viewport: { width: 768, height: 1024 },
    });

    test('MOB-05: iPad Mini hybrid touch navigation and full layout integrity', async ({ page }) => {
      await page.goto('/');

      const hasTouch = await page.evaluate(() => 'ontouchstart' in window);
      expect(hasTouch).toBe(true);
      const dpr = await page.evaluate(() => window.devicePixelRatio);
      expect(dpr).toBe(2);

      // Verify desktop nav is visible on iPad (>=768px)
      const desktopLab = page.locator('nav[aria-label="Main Navigation"] a[href="/lab"]');
      await expect(desktopLab).toBeVisible();
      await desktopLab.tap();
      await expect(page).toHaveURL(/\/lab/);

      // Verify no horizontal overflow
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth
      );
      expect(overflow).toBe(false);

      // Screenshot evidence
      await page.screenshot({
        path: 'test-results/screenshots/mobile-emulation-ipadmini-lab.png',
        fullPage: true,
      });
    });
  });
});
