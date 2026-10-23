import { test, expect } from '@playwright/test';

test.describe('Additional AI-generated TestSprite suite — honest behavior regression coverage', () => {
  test('preset change reveals only an unexecuted trace preview and updates it on change', async ({ page }) => {
    await page.goto('/lab');
    await page.getByRole('button', { name: 'SQL Deadlock', exact: true }).click();
    let preview = page.getByTestId('scenario-trace-preview');
    await expect(preview).toContainText('Trace Preview');
    await expect(preview).toContainText('NOT EXECUTED');
    await expect(preview).toContainText('TX_A');
    await expect(page.getByTestId('scenario-audit-results')).toHaveCount(0);

    await page.getByRole('button', { name: 'Normal Healthy Stream', exact: true }).click();
    preview = page.getByTestId('scenario-trace-preview');
    await expect(preview).toContainText('Normal Healthy Stream');
    await expect(preview).toContainText('evt-001');
    await expect(preview).not.toContainText('TX_A');
    await page.getByRole('button', { name: /Run Healthy Stream Audit/i }).click();
    await expect(page.getByTestId('scenario-trace-preview')).toHaveCount(0);
    await expect(page.getByTestId('scenario-audit-results')).toContainText('LOW RISK');
  });

  test('synthetic refund concurrency violation has a scoped Critical illustration, not fake external evidence', async ({ page }) => {
    await page.goto('/lab');
    await page.getByRole('button', { name: /Execute Verification Harness/i }).click();
    const severity = page.getByTestId('lab-fixture-critical-severity');
    await expect(severity).toContainText('Illustrative Severity: Critical');
    await expect(severity).toContainText('synthetic vulnerable fixture');
    await page.getByRole('button', { name: /Corrected Fixture/i }).click();
    await page.getByRole('button', { name: /Execute Verification Harness/i }).click();
    await expect(page.getByTestId('lab-fixture-critical-severity')).toHaveCount(0);
  });

  test('code snippet payment race displays a truthful Example Assertion and copies the actual code', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']).catch(() => {});
    await page.goto('/analyze');
    await page.getByRole('button', { name: /Payment Race/i }).click();
    await page.getByRole('button', { name: /Launch Multi-Agent Analysis/i }).click();
    await expect(page.getByTestId('analysis-qualitative-severity')).toContainText('CRITICAL');
    const code = page.getByTestId('analysis-example-assertion');
    await expect(code).toContainText('/api/v1/lab/verify');
    await expect(code).toContainText("fixture: 'vulnerable'");
    await expect(page.getByTestId('analysis-assertion-scope')).toContainText('does not execute or verify');
    const copy = page.getByTestId('analysis-copy-assertion');
    await copy.click();
    await expect(copy).toContainText('Copied');
    const clipboard = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboard).toContain("expect(evidence.verdict).toBe('VERIFIED_FAIL')");
  });

  test('JWT analysis presents an explicitly unsupported skipped template rather than fake verification', async ({ page }) => {
    await page.goto('/analyze');
    await page.getByRole('button', { name: /JWT Leak/i }).click();
    await page.getByRole('button', { name: /Launch Multi-Agent Analysis/i }).click();
    const code = page.getByTestId('analysis-example-assertion');
    await expect(code).toContainText('test.skip(');
    await expect(code).toContainText('UNSUPPORTED');
    await expect(page.getByTestId('analysis-assertion-scope')).toContainText('NOT EXECUTED');
    await expect(page.getByText('AUTH_STATE', { exact: true })).toBeVisible();
  });

  test('homepage CTAs use the documented accessible routes, not invented inline homepage sections', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /Open Verification Lab/i }).first().click();
    await expect(page).toHaveURL(/\/lab\/?$/);
    await expect(page.getByRole('heading', { name: 'Controlled Verification Lab' })).toBeVisible();
    await page.getByRole('link', { name: /Architecture & Invariants/i }).first().click();
    await expect(page).toHaveURL(/\/about\/?$/);
    await expect(page.getByRole('heading', { name: /Architecture, Philosophy & Security Guarantees/i })).toBeVisible();
  });
});
