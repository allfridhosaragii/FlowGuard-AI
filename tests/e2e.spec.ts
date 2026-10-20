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
});
