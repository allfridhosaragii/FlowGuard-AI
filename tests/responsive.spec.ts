import { test, expect, devices } from '@playwright/test';

interface ViewportConfig {
  name: string;
  width: number;
  height: number;
  isMobile: boolean;
  hasTouch: boolean;
  deviceScaleFactor: number;
  deviceProfile?: string;
}

const VIEWPORTS: ViewportConfig[] = [
  {
    name: 'iphone-se1-320x568',
    width: 320,
    height: 568,
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2,
    deviceProfile: 'iPhone SE',
  },
  {
    name: 'iphone-se2-375x667',
    width: 375,
    height: 667,
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2,
    deviceProfile: 'iPhone 8',
  },
  {
    name: 'iphone-14-390x844',
    width: 390,
    height: 844,
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 3,
    deviceProfile: 'iPhone 14',
  },
  {
    name: 'ipad-portrait-768x1024',
    width: 768,
    height: 1024,
    isMobile: false,
    hasTouch: false,
    deviceScaleFactor: 1,
  },
  {
    name: 'desktop-macbook-1440x900',
    width: 1440,
    height: 900,
    isMobile: false,
    hasTouch: false,
    deviceScaleFactor: 1,
  },
];

test.describe('Responsive Layout & Viewport Verification Matrix', () => {
  for (const vp of VIEWPORTS) {
    test.describe(`Viewport: ${vp.name} (${vp.width}x${vp.height})`, () => {
      if (vp.deviceProfile && devices[vp.deviceProfile]) {
        const { defaultBrowserType, ...profileOpts } = devices[vp.deviceProfile];
        test.use({
          ...profileOpts,
          viewport: { width: vp.width, height: vp.height },
          isMobile: vp.isMobile,
          hasTouch: vp.hasTouch,
          deviceScaleFactor: vp.deviceScaleFactor,
        });
      } else {
        test.use({
          viewport: { width: vp.width, height: vp.height },
          isMobile: vp.isMobile,
          hasTouch: vp.hasTouch,
          deviceScaleFactor: vp.deviceScaleFactor,
        });
      }

      test(`RESP-01: Homepage has no horizontal overflow & CTAs are reachable on ${vp.name}`, async ({
        page,
      }) => {
        await page.goto('/');

        // 1. Verify meta viewport is present and properly configured
        const metaViewport = await page.getAttribute('meta[name="viewport"]', 'content');
        expect(metaViewport).toBeTruthy();
        expect(metaViewport).toContain('width=device-width');

        // 2. Verify touch capability and devicePixelRatio when emulated
        if (vp.hasTouch) {
          const touchSupported = await page.evaluate(() => 'ontouchstart' in window);
          expect(touchSupported).toBe(true);
        }
        const dpr = await page.evaluate(() => window.devicePixelRatio);
        expect(dpr).toBe(vp.deviceScaleFactor);

        // 3. Verify no horizontal overflow
        const overflow = await page.evaluate(() => {
          return document.documentElement.scrollWidth > window.innerWidth;
        });
        expect(overflow).toBe(false);

        // 4. Verify title and heading are visible
        await expect(page.locator('h1')).toContainText("Don't just review code. Prove it works.");

        // 5. Verify CTAs are visible and interactable
        const labCta = page.locator('#cta-open-lab');
        const analyzeCta = page.locator('#cta-analyze-pr');
        await expect(labCta).toBeVisible();
        await expect(analyzeCta).toBeVisible();

        // 6. Capture screenshot artifact for audit evidence
        await page.screenshot({
          path: `test-results/screenshots/homepage-${vp.name}.png`,
          fullPage: true,
        });
      });

      test(`RESP-02: Navigation works appropriately (mobile hamburger vs desktop links) on ${vp.name}`, async ({
        page,
      }) => {
        await page.goto('/');

        if (vp.isMobile || vp.width < 768) {
          // Mobile: Hamburger button should be visible
          const hamburger = page.locator('#mobile-menu-toggle');
          await expect(hamburger).toBeVisible();

          // Tap or click based on touch support
          if (vp.hasTouch) {
            await hamburger.tap();
          } else {
            await hamburger.click();
          }

          const mobileMenu = page.locator('#mobile-navigation-menu');
          await expect(mobileMenu).toBeVisible();

          // Navigate to Lab via mobile link
          const labLink = mobileMenu.locator('a[href="/lab"]');
          await expect(labLink).toBeVisible();
          if (vp.hasTouch) {
            await labLink.tap();
          } else {
            await labLink.click();
          }
          await expect(page).toHaveURL(/\/lab/);
        } else {
          // Desktop/Tablet: Main nav links visible
          const desktopLab = page.locator('nav[aria-label="Main Navigation"] a[href="/lab"]');
          await expect(desktopLab).toBeVisible();
          await desktopLab.click();
          await expect(page).toHaveURL(/\/lab/);
        }
      });

      test(`RESP-03: Verification Lab executes and displays evidence cleanly on ${vp.name}`, async ({
        page,
        context,
      }) => {
        await context.grantPermissions(['clipboard-read', 'clipboard-write']).catch(() => {});
        await page.goto('/lab');

        // Check horizontal overflow on initial load
        const overflowBefore = await page.evaluate(() => {
          return document.documentElement.scrollWidth > window.innerWidth;
        });
        expect(overflowBefore).toBe(false);

        // Execute verification harness via tap or click
        const executeBtn = page.locator('#btn-execute-verification');
        await expect(executeBtn).toBeVisible();
        if (vp.hasTouch) {
          await executeBtn.tap();
        } else {
          await executeBtn.click();
        }

        // Verify evidence panel renders completely
        await expect(page.locator('text=Execution Run ID:')).toBeVisible({ timeout: 10000 });
        await expect(page.getByText('Observed Side Effects', { exact: true })).toBeVisible();

        // Verify copy button works via tap or click
        const copyBtn = page.locator('#btn-copy-test-assertion');
        await expect(copyBtn).toBeVisible();
        if (vp.hasTouch) {
          await copyBtn.tap();
        } else {
          await copyBtn.click();
        }
        await expect(page.getByRole('button', { name: /Copied/i })).toBeVisible({ timeout: 3000 });

        // Check no horizontal overflow after rendering heavy evidence
        const overflowAfter = await page.evaluate(() => {
          return document.documentElement.scrollWidth > window.innerWidth;
        });
        expect(overflowAfter).toBe(false);

        // Screenshot evidence
        await page.screenshot({
          path: `test-results/screenshots/lab-evidence-${vp.name}.png`,
          fullPage: true,
        });
      });

      test(`RESP-04: PR Analysis Workspace loads preset and renders multi-agent report on ${vp.name}`, async ({
        page,
      }) => {
        await page.goto('/analyze');

        // Check horizontal overflow
        const overflowBefore = await page.evaluate(() => {
          return document.documentElement.scrollWidth > window.innerWidth;
        });
        expect(overflowBefore).toBe(false);

        // Load Payment Race preset via tap or click
        const presetBtn = page.locator('#btn-preset-payment');
        await expect(presetBtn).toBeVisible();
        if (vp.hasTouch) {
          await presetBtn.tap();
        } else {
          await presetBtn.click();
        }

        // Verify snippet is loaded (wait for React state update)
        const snippet = page.locator('#code-snippet-input');
        await expect(snippet).not.toHaveValue('', { timeout: 3000 });

        // Launch Multi-Agent Analysis via tap or click
        const launchBtn = page.locator('#btn-launch-analysis');
        await expect(launchBtn).toBeVisible();
        if (vp.hasTouch) {
          await launchBtn.tap();
        } else {
          await launchBtn.click();
        }

        // Verify report rendered without page blowout
        await expect(page.locator('text=Formal Invariants Extracted (Agent A)')).toBeVisible({
          timeout: 10000,
        });
        await expect(page.locator('text=Identified Risk Findings (Agent B)')).toBeVisible();
        await expect(page.locator('text=Verification Action Plans (Agent C)')).toBeVisible();

        const overflowAfter = await page.evaluate(() => {
          return document.documentElement.scrollWidth > window.innerWidth;
        });
        expect(overflowAfter).toBe(false);

        // Screenshot evidence
        await page.screenshot({
          path: `test-results/screenshots/analyze-report-${vp.name}.png`,
          fullPage: true,
        });
      });
    });
  }
});
