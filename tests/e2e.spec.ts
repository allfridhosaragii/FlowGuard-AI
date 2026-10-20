import { test, expect } from '@playwright/test';

test.describe('FlowGuard AI Core User Journey E2E', () => {
  test('E2E-01: Landing page loads cleanly with honest CTAs and navigation', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/FlowGuard AI/);
    await expect(page.locator('h1')).toContainText("Don't just review code. Prove it works.");

    // Check CTAs
    const labCta = page.locator('a[href="/lab"]').first();
    const analyzeCta = page.locator('a[href="/analyze"]').first();

    await expect(labCta).toBeVisible();
    await expect(analyzeCta).toBeVisible();
  });

  test('E2E-02: Controlled Verification Lab reproduces duplicate refund on vulnerable fixture', async ({
    page,
  }) => {
    await page.goto('/lab');

    await expect(page.locator('h1')).toContainText('Controlled Verification Lab');

    // Vulnerable fixture is default
    const runBtn = page.getByRole('button', { name: /Execute Verification Harness/i });
    await expect(runBtn).toBeVisible();
    await runBtn.click();

    // Expect real execution evidence to appear
    await expect(page.locator('text=Execution Run ID:')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Verified Fail')).toBeVisible();
    await expect(page.getByText('Observed Side Effects', { exact: true })).toBeVisible();
  });

  test('E2E-03: Controlled Verification Lab proves idempotency on corrected fixture', async ({
    page,
  }) => {
    await page.goto('/lab');

    // Switch to Corrected Fixture
    const fixedBtn = page.getByRole('button', { name: /Corrected Fixture/i });
    await fixedBtn.click();

    const runBtn = page.getByRole('button', { name: /Execute Verification Harness/i });
    await runBtn.click();

    // Expect real execution evidence of Verified Pass
    await expect(page.locator('text=Execution Run ID:')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Verified Pass')).toBeVisible();
    await expect(page.locator('text=Invariant Upheld')).toBeVisible();
  });

  test('E2E-04: PR & Code Analysis Workspace runs multi-agent analysis', async ({ page }) => {
    await page.goto('/analyze');

    await expect(page.locator('h1')).toContainText('Pull Request & Code Analysis Workspace');

    // Run analysis with default payment snippet
    const analyzeBtn = page.getByRole('button', { name: /Launch Multi-Agent Analysis/i });
    await expect(analyzeBtn).toBeVisible();
    await analyzeBtn.click();

    // Expect result view with Invariants, Findings, and Plans
    await expect(page.locator('text=Formal Invariants Extracted (Agent A)')).toBeVisible({
      timeout: 10000,
    });
    await expect(page.locator('text=Identified Risk Findings (Agent B)')).toBeVisible();
    await expect(page.locator('text=Verification Action Plans (Agent C)')).toBeVisible();
  });

  test('E2E-05: Architecture & Invariants page displays formal definitions and security bounds', async ({
    page,
  }) => {
    await page.goto('/about');

    await expect(page.locator('h1')).toContainText('Architecture, Philosophy & Security Guarantees');
    await expect(
      page.getByRole('heading', { name: /Evidence Precedes Verdicts/i })
    ).toBeVisible();
    await expect(page.locator('text=No Arbitrary Shell Execution')).toBeVisible();
  });

  test('E2E-06 (LAB-008): Generated verification assertion can be copied and shows Copied feedback', async ({
    page,
    context,
  }) => {
    // Grant clipboard permissions if supported
    await context.grantPermissions(['clipboard-read', 'clipboard-write']).catch(() => {});
    await page.goto('/lab');

    // Run verification to get assertion
    const runBtn = page.getByRole('button', { name: /Execute Verification Harness/i });
    await runBtn.click();
    await expect(page.locator('text=Execution Run ID:')).toBeVisible({ timeout: 10000 });

    // Click Copy Test button
    const copyBtn = page.getByRole('button', { name: /Copy Test/i });
    await expect(copyBtn).toBeVisible();
    await copyBtn.click();

    // Verify feedback changes to "Copied"
    await expect(page.getByRole('button', { name: /Copied/i })).toBeVisible({ timeout: 3000 });
  });

  test('E2E-07 (LAB-007): Empty idempotency key is rejected and clears previous execution report', async ({
    page,
  }) => {
    await page.goto('/lab');

    // 1. Run once successfully to have an active report
    const runBtn = page.getByRole('button', { name: /Execute Verification Harness/i });
    await runBtn.click();
    await expect(page.locator('text=Execution Run ID:')).toBeVisible({ timeout: 10000 });

    // 2. Clear Idempotency Key
    const keyInput = page.getByPlaceholder('e.g. retry-token-881');
    await keyInput.fill('');

    // 3. Click Run again with empty key
    await runBtn.click();

    // 4. Verify inline validation error appears
    await expect(
      page.getByText('Idempotency key is required and cannot be empty.', { exact: true })
    ).toBeVisible();

    // 5. Verify old execution report is cleared
    await expect(page.locator('text=Execution Run ID:')).not.toBeVisible();
  });

  test('E2E-08 (ANA-004): Empty code snippet is rejected before analysis without fake report', async ({
    page,
  }) => {
    await page.goto('/analyze');

    // 1. Clear code snippet
    const clearBtn = page.getByRole('button', { name: /Clear Code/i });
    await clearBtn.click();

    // 2. Click Launch Multi-Agent Analysis
    const launchBtn = page.getByRole('button', { name: /Launch Multi-Agent Analysis/i });
    await launchBtn.click();

    // 3. Verify actionable inline error appears
    await expect(
      page.getByText('Code snippet is required and cannot be empty.', { exact: true })
    ).toBeVisible();

    // 4. Verify no analysis result report is rendered
    await expect(page.locator('text=Run ID:')).not.toBeVisible();
    await expect(page.locator('text=Analysis Engine Ready')).toBeVisible();
  });

  test('E2E-09 (UX-001): Mobile viewport (390x844) supports all primary user flows', async ({
    page,
  }) => {
    // Set viewport to mobile standard 390x844 (iPhone 12/13/14)
    await page.setViewportSize({ width: 390, height: 844 });

    // 1. Home page loads without horizontal scroll
    await page.goto('/');
    await expect(page.locator('h1')).toContainText("Don't just review code. Prove it works.");

    // 2. Mobile navigation menu works
    const hamburger = page.getByRole('button', { name: /Toggle navigation menu/i });
    await expect(hamburger).toBeVisible();
    await hamburger.click();

    // Click Verification Lab from mobile menu
    const labLink = page.getByRole('link', { name: /Verification Lab/i }).last();
    await labLink.click();
    await expect(page).toHaveURL(/\/lab/);

    // 3. Verification Lab works on mobile
    const runBtn = page.getByRole('button', { name: /Execute Verification Harness/i });
    await expect(runBtn).toBeVisible();
    await runBtn.click();

    await expect(page.locator('text=Execution Run ID:')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Verified Fail')).toBeVisible();

    // 4. Code Analysis works on mobile
    await page.goto('/analyze');
    await expect(page.locator('h1')).toContainText('Pull Request & Code Analysis Workspace');

    // Load Payment Race preset
    const presetBtn = page.getByRole('button', { name: /Payment Race/i });
    await presetBtn.click();

    const analyzeBtn = page.getByRole('button', { name: /Launch Multi-Agent Analysis/i });
    await analyzeBtn.click();

    await expect(page.locator('text=Formal Invariants Extracted (Agent A)')).toBeVisible({
      timeout: 10000,
    });
  });
});
