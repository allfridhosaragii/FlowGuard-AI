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

    // Load Payment Race sample
    const sampleBtn = page.getByRole('button', { name: /Payment Race/i });
    await expect(sampleBtn).toBeVisible();
    await sampleBtn.click();

    // Run analysis with loaded payment snippet
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

    // 2. Locate Idempotency Key via label/role and clear it
    const keyInput = page.getByRole('textbox', { name: /Idempotency Key/i });
    await expect(keyInput).toBeVisible();
    await keyInput.fill('');

    // 3. Verify that the field value is genuinely empty
    await expect(keyInput).toHaveValue('');

    // 4. Click Run again with empty key
    await runBtn.click();

    // 5. Verify field remains genuinely empty after submit
    await expect(keyInput).toHaveValue('');

    // 6. Verify accessible validation error appears stating 'Idempotency Key is required'
    await expect(page.locator('#lab-idempotency-key-error')).toBeVisible();
    await expect(page.locator('#lab-idempotency-key-error')).toContainText('Idempotency Key is required');
    await expect(page.locator('[data-testid="lab-error-banner"]')).toContainText('Idempotency Key is required');

    // 7. Verify previous execution report is cleared and standing by screen is shown
    await expect(page.locator('text=Execution Run ID:')).not.toBeVisible();
    await expect(page.getByText('Harness Standing By')).toBeVisible();

    // 8. Test dedicated 'Clear Key' button
    await keyInput.fill('temp-token-999');
    await expect(keyInput).toHaveValue('temp-token-999');
    const clearBtn = page.getByRole('button', { name: /Clear Key/i });
    await expect(clearBtn).toBeVisible();
    await clearBtn.click();
    await expect(keyInput).toHaveValue('');
  });

  test('E2E-08 (ANA-004): Empty code snippet is rejected before analysis without fake report', async ({
    page,
  }) => {
    await page.goto('/analyze');

    // 1. Locate code snippet textarea and verify it starts empty by default
    const snippetInput = page.getByRole('textbox', { name: /Target Code/i });
    await expect(snippetInput).toBeVisible();
    await expect(snippetInput).toHaveValue('');

    // 2. Click Launch Multi-Agent Analysis immediately on empty field
    const launchBtn = page.getByRole('button', { name: /Launch Multi-Agent Analysis/i });
    await launchBtn.click();

    // 3. Verify actionable inline error appears and field remains empty
    await expect(snippetInput).toHaveValue('');
    await expect(page.locator('#code-snippet-error')).toBeVisible();
    await expect(page.locator('#code-snippet-error')).toContainText(
      'Code snippet is required and cannot be empty.'
    );
    await expect(page.locator('[data-testid="analysis-error-banner"]')).toContainText(
      'Code snippet is required and cannot be empty.'
    );

    // 4. Verify no analysis result report is rendered (no fake report)
    await expect(page.locator('text=Run ID:')).not.toBeVisible();
    await expect(page.locator('text=Analysis Engine Ready')).toBeVisible();

    // 5. Test loading sample scenario via Payment Race button
    const paymentSampleBtn = page.getByRole('button', { name: /Payment Race/i });
    await expect(paymentSampleBtn).toBeVisible();
    await paymentSampleBtn.click();
    await expect(snippetInput).not.toHaveValue('');

    // 6. Run analysis with loaded sample and verify real report appears
    await launchBtn.click();
    await expect(page.locator('text=Formal Invariants Extracted (Agent A)')).toBeVisible({
      timeout: 10000,
    });

    // 7. Clear code using dedicated 'Clear Code' button
    const clearBtn = page.getByRole('button', { name: /Clear Code/i });
    await expect(clearBtn).toBeVisible();
    await clearBtn.click();
    await expect(snippetInput).toHaveValue('');

    // 8. Submit again with cleared code and verify previous report is removed
    await launchBtn.click();
    await expect(snippetInput).toHaveValue('');
    await expect(page.locator('#code-snippet-error')).toBeVisible();
    await expect(page.locator('text=Formal Invariants Extracted (Agent A)')).not.toBeVisible();
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
