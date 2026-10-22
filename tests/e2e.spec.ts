import { test, expect } from '@playwright/test';

test.describe('FlowGuard AI Core User Journey E2E', () => {
  test('E2E-SEC-01: security headers defend pages and API responses', async ({ request }) => {
    const pageResponse = await request.get('/');
    expect(pageResponse.ok()).toBe(true);
    expect(pageResponse.headers()['x-content-type-options']).toBe('nosniff');
    expect(pageResponse.headers()['x-frame-options']).toBe('DENY');
    expect(pageResponse.headers()['referrer-policy']).toBe('strict-origin-when-cross-origin');
    expect(pageResponse.headers()['strict-transport-security']).toContain('max-age=31536000');
    const csp = pageResponse.headers()['content-security-policy'];
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("connect-src 'self'");
    expect(pageResponse.headers()['cross-origin-opener-policy']).toBe('same-origin');
    expect(pageResponse.headers()['cross-origin-embedder-policy']).toBe('require-corp');
    expect(pageResponse.headers()['cross-origin-resource-policy']).toBe('same-origin');
    const apiResponse = await request.get('/api/v1/health');
    expect(apiResponse.ok()).toBe(true);
    expect(apiResponse.headers()['cache-control']).toContain('no-store');
    // robots.txt is a real public static asset. Do not require a sitemap
    // route that the app doesn't expose just to validate cache headers.
    const robotsResponse = await request.get('/robots.txt');
    expect(robotsResponse.ok()).toBe(true);
    expect(await robotsResponse.text()).toContain('User-agent:');
    expect(robotsResponse.headers()['cache-control']).toContain('max-age=3600');
    expect(robotsResponse.headers()['cache-control']).not.toContain('no-store');
  });

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

  test('E2E-10: Context Isolation — JWT preset -> Clear Code -> arithmetic snippet -> Launch Analysis does NOT leak INV-AUTH-001', async ({
    page,
  }) => {
    await page.goto('/analyze');

    // 1. Load JWT Leak preset
    const jwtPresetBtn = page.getByRole('button', { name: /JWT Leak/i });
    await expect(jwtPresetBtn).toBeVisible();
    await jwtPresetBtn.click();

    // Verify code snippet and business rule contain JWT content
    const snippetInput = page.getByRole('textbox', { name: /Target Code/i });
    const ruleInput = page.locator('#business-rule-input');
    await expect(snippetInput).toContainText('verifyToken');
    await expect(ruleInput).toContainText('token');

    // 2. Click Clear Code
    const clearBtn = page.getByRole('button', { name: /Clear Code/i });
    await expect(clearBtn).toBeVisible();
    await clearBtn.click();

    // Assert code is cleared and preset business rule is not silently retained
    await expect(snippetInput).toHaveValue('');
    await expect(ruleInput).toHaveValue('');

    // 3. Input benign arithmetic snippet
    const arithmeticSnippet = `export function add(a: number, b: number): number {\n  return a + b;\n}`;
    await snippetInput.fill(arithmeticSnippet);

    // Business rule automatically aligns to pure arithmetic domain since rule was not custom-edited
    await expect(ruleInput).toContainText('arithmetic');

    // 4. Launch Multi-Agent Analysis
    const launchBtn = page.getByRole('button', { name: /Launch Multi-Agent Analysis/i });
    await launchBtn.click();

    // 5. Verify analysis completes with NO_RISK_FOUND and extracts INV-MATH-001
    await expect(page.locator('text=Formal Invariants Extracted (Agent A)')).toBeVisible({
      timeout: 10000,
    });
    await expect(page.locator('text=INV-MATH-001')).toBeVisible();
    await expect(page.locator('text=Arithmetic & Core Computational Logic')).toBeVisible();

    // CRITICAL REGRESSION ASSERTION: INV-AUTH-001 and Authentication scope MUST NOT exist anywhere
    await expect(page.locator('text=INV-AUTH-001')).not.toBeVisible();
    await expect(page.locator('text=Authentication & API Gateway')).not.toBeVisible();

    // Verify 0 risk findings
    await expect(page.locator('text=No logical regression or invariant violations detected')).toBeVisible();
    await expect(page.locator('text=No Risk Detected')).toBeVisible();
  });

  test('E2E-11: Clean Arithmetic preset loads consistent code & rule and verifies cleanly', async ({
    page,
  }) => {
    await page.goto('/analyze');

    // Click Clean Arithmetic preset
    const cleanPresetBtn = page.getByRole('button', { name: /Clean Arithmetic/i });
    await expect(cleanPresetBtn).toBeVisible();
    await cleanPresetBtn.click();

    const snippetInput = page.getByRole('textbox', { name: /Target Code/i });
    const ruleInput = page.locator('#business-rule-input');
    await expect(snippetInput).toContainText('function add');
    await expect(ruleInput).toContainText('arithmetic addition');

    const launchBtn = page.getByRole('button', { name: /Launch Multi-Agent Analysis/i });
    await launchBtn.click();

    await expect(page.locator('text=INV-MATH-001')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=No Risk Detected')).toBeVisible();
    await expect(page.locator('text=INV-AUTH-001')).not.toBeVisible();
    await expect(page.locator('text=INV-REFUND-001')).not.toBeVisible();
  });

  test('E2E-12: Domain mismatch between code and custom rule displays visible notice without certifying mismatched rule', async ({
    page,
  }) => {
    await page.goto('/analyze');

    // Fill arithmetic code
    const snippetInput = page.getByRole('textbox', { name: /Target Code/i });
    await snippetInput.fill('export function multiply(a: number, b: number): number { return a * b; }');

    // Intentionally enter a custom payment business rule
    const ruleInput = page.locator('#business-rule-input');
    await ruleInput.fill('A settled refund must strictly execute at most once per idempotency key.');

    // Verify domain mismatch warning is displayed in UI prior to launch
    const mismatchWarning = page.locator('[data-testid="domain-mismatch-warning"]');
    await expect(mismatchWarning).toBeVisible();
    await expect(mismatchWarning).toContainText('Domain Notice:');

    // Launch analysis
    const launchBtn = page.getByRole('button', { name: /Launch Multi-Agent Analysis/i });
    await launchBtn.click();

    // Verify Domain Mismatch Banner appears in results card
    await expect(page.locator('[data-testid="domain-mismatch-banner"]')).toBeVisible({
      timeout: 10000,
    });
    // Invariant evaluates arithmetic safety, NOT payment
    await expect(page.locator('text=INV-MATH-001')).toBeVisible();
    await expect(page.locator('text=INV-REFUND-001')).not.toBeVisible();
    await expect(page.locator('text=No Risk Detected')).toBeVisible();
  });

  test('E2E-13: Rapid consecutive requests drop stale in-flight responses without race condition', async ({
    page,
  }) => {
    await page.goto('/analyze');

    // 1. Load Payment preset first
    const paymentPreset = page.getByRole('button', { name: /Payment Race/i });
    await paymentPreset.click();

    // 2. Launch analysis
    const launchBtn = page.getByRole('button', { name: /Launch Multi-Agent Analysis/i });
    await launchBtn.click();

    // 3. Immediately switch to Clean Arithmetic preset and re-launch
    const cleanPreset = page.getByRole('button', { name: /Clean Arithmetic/i });
    await cleanPreset.click();
    await launchBtn.click();

    // 4. Verify only the latest request (Clean Arithmetic) is rendered
    await expect(page.locator('text=Formal Invariants Extracted (Agent A)')).toBeVisible({
      timeout: 10000,
    });
    await expect(page.locator('text=INV-MATH-001')).toBeVisible();
    await expect(page.locator('text=No Risk Detected')).toBeVisible();
    // Verify Payment race findings are NOT displayed
    await expect(page.locator('text=RISK-001')).not.toBeVisible();
  });

  test('E2E-14: selected PR URL and verified live fetch provenance appear in the report', async ({ page }) => {
    const prUrl = 'https://github.com/allfridhosaragii/FlowGuard-AI/pull/1';
    await page.route('**/api/v1/analyses', async (route) => {
      const requestBody = route.request().postDataJSON();
      expect(requestBody.githubPrUrl).toBe(prUrl);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          runId: 'provenance-e2e-001',
          sourceType: 'GITHUB_PR',
          sourceReference: prUrl,
          selectedPrUrl: prUrl,
          prFetchStatus: 'LIVE_FETCH',
          sourceSha: 'abcdef123456',
          businessRule: requestBody.businessRule,
          invariants: [],
          findings: [],
          plans: [],
          stages: [],
          modelUsed: 'deterministic-heuristic-v1',
          isRealModel: false,
          verdict: 'NO_RISK_FOUND',
          executedAtUtc: '2026-10-22T10:00:00.000Z',
          notes: ['Evidence Scope: All findings for external PRs are classified as POTENTIAL until target code is executed in an isolated verification sandbox.'],
        }),
      });
    });
    await page.goto('/analyze');
    await page.getByRole('tab', { name: 'Public GitHub PR' }).click();
    await page.getByRole('button', { name: /Load Sample PR/ }).click();
    await page.locator('#btn-launch-analysis').click();
    const provenance = page.getByTestId('pr-source-provenance');
    await expect(provenance).toBeVisible();
    await expect(provenance).toContainText(prUrl);
    await expect(page.getByTestId('pr-fetch-status')).toContainText('Live fetch (GitHub API)');
    await expect(provenance).toContainText('PR head SHA: abcdef123456');
    await expect(provenance).not.toContainText('Fallback data was used');
  });

  test('E2E-15: fallback provenance is never described as a live PR fetch', async ({ page }) => {
    const prUrl = 'https://github.com/allfridhosaragii/FlowGuard-AI/pull/1';
    await page.route('**/api/v1/analyses', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          runId: 'provenance-e2e-002',
          sourceType: 'GITHUB_PR',
          sourceReference: prUrl,
          selectedPrUrl: prUrl,
          prFetchStatus: 'FALLBACK_USED',
          sourceSha: 'fallback:unverified',
          businessRule: 'A settled payment can create at most one refund.',
          invariants: [],
          findings: [],
          plans: [],
          stages: [],
          modelUsed: 'heuristic-rule-engine-v1',
          isRealModel: false,
          verdict: 'INCONCLUSIVE',
          executedAtUtc: '2026-10-22T10:00:00.000Z',
          notes: ['Provenance is not live.'],
        }),
      });
    });
    await page.goto('/analyze');
    await page.getByRole('tab', { name: 'Public GitHub PR' }).click();
    await page.getByRole('button', { name: /Load Sample PR/ }).click();
    await page.locator('#btn-launch-analysis').click();
    const provenance = page.getByTestId('pr-source-provenance');
    await expect(provenance).toContainText(prUrl);
    await expect(page.getByTestId('pr-fetch-status')).toContainText('Fallback used');
    await expect(provenance).toContainText('This report does not claim a live GitHub PR fetch.');
    await expect(page.getByTestId('pr-fetch-status')).not.toContainText('Live fetch');
  });

  test('clearing code invalidates an analysis still in flight', async ({ page }) => {
    let routeHandled!: () => void;
    const handled = new Promise<void>((resolve) => { routeHandled = resolve; });
    await page.route('**/api/v1/analyses', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      try {
        await route.continue();
      } catch {
        // The browser may cancel this intercepted request after code is cleared.
      } finally {
        routeHandled();
      }
    });
    await page.goto('/analyze');
    await page.locator('#btn-preset-payment').click();
    const request = page.waitForRequest('**/api/v1/analyses');
    await page.locator('#btn-launch-analysis').click();
    await request;
    await page.locator('#btn-clear-code').click();
    await expect(page.locator('#code-snippet-input')).toHaveValue('');
    await handled;
    await expect(page.locator('#btn-launch-analysis')).toBeEnabled();
    await expect(page.getByText('Formal Invariants Extracted (Agent A)')).not.toBeVisible();
  });
});
