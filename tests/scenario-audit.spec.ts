import { test, expect } from '@playwright/test';

test.describe('Additional controlled scenario fixtures', () => {
  test('SQL deadlock preset detects a synthetic cyclic lock dependency', async ({ page }) => {
    await page.goto('/lab');
    await page.getByRole('button', { name: 'SQL Deadlock', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'SQL Deadlock Preset' })).toBeVisible();
    await page.getByRole('button', { name: /Run SQL Deadlock Audit/i }).click();
    const results = page.getByTestId('scenario-audit-results');
    await expect(results).toBeVisible();
    await expect(results).toContainText('synthetic');
    await expect(results).toContainText('HIGH RISK');
    await expect(results).toContainText('Cycle detected: true');
    await expect(results).toContainText('Risk Findings');
    await expect(page.getByTestId('scenario-scope-limitation')).toContainText('does not establish a SQL deadlock in an actual database');
  });

  test('healthy stream preset produces low risk, clean findings and updated audit result', async ({ page }) => {
    await page.goto('/lab');
    await page.getByRole('button', { name: 'SQL Deadlock', exact: true }).click();
    await page.getByRole('button', { name: /Run SQL Deadlock Audit/i }).click();
    await expect(page.getByTestId('scenario-audit-results')).toContainText('HIGH RISK');

    await page.getByRole('button', { name: 'Normal Healthy Stream', exact: true }).click();
    await expect(page.getByTestId('scenario-audit-results')).toHaveCount(0);
    await page.getByRole('button', { name: /Run Healthy Stream Audit/i }).click();

    const results = page.getByTestId('scenario-audit-results');
    await expect(results).toBeVisible();
    await expect(results).toContainText('LOW RISK');
    await expect(results).toContainText('No Risk Detected');
    await expect(results).toContainText('0 findings');
    await expect(results).toContainText('synthetic-healthy-stream-v1');
    await expect(results).not.toContainText('Cycle detected: true');
  });

  test('SQL deadlock audit offers a working copy assertion control', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/lab');
    await page.getByRole('button', { name: 'SQL Deadlock', exact: true }).click();
    await page.getByRole('button', { name: /Run SQL Deadlock Audit/i }).click();

    const results = page.getByTestId('scenario-audit-results');
    await expect(results).toContainText('HIGH RISK');
    const copy = page.getByTestId('scenario-copy-assertion');
    await expect(copy).toBeVisible();
    await expect(copy).toBeEnabled();
    await expect(copy).toHaveText('Copy Assertion');
    await copy.click();
    await expect(copy).toHaveText('Copied');
    await expect(results.getByRole('status')).toContainText('Assertion copied to clipboard');
    const clipboard = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboard).toContain('/api/v1/lab/scenario');
    expect(clipboard).toContain("scenario: 'sql-deadlock'");
    expect(clipboard).toContain("expect(evidence.verdict).toBe('VERIFIED_FAIL')");
    expect(clipboard).not.toContain("scenario: 'healthy-stream'");
  });

  test('healthy stream copy action copies the current assertion, not a stale deadlock assertion', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/lab');
    await page.getByRole('button', { name: 'SQL Deadlock', exact: true }).click();
    await page.getByRole('button', { name: /Run SQL Deadlock Audit/i }).click();
    await page.getByTestId('scenario-copy-assertion').click();
    await expect(page.getByTestId('scenario-copy-assertion')).toHaveText('Copied');

    await page.getByRole('button', { name: 'Normal Healthy Stream', exact: true }).click();
    await expect(page.getByTestId('scenario-copy-assertion')).toHaveCount(0);
    await page.getByRole('button', { name: /Run Healthy Stream Audit/i }).click();
    const results = page.getByTestId('scenario-audit-results');
    await expect(results).toContainText('LOW RISK');
    const copy = page.getByTestId('scenario-copy-assertion');
    await expect(copy).toHaveText('Copy Assertion');
    await copy.click();
    await expect(copy).toHaveText('Copied');
    const clipboard = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboard).toContain('/api/v1/lab/scenario');
    expect(clipboard).toContain("scenario: 'healthy-stream'");
    expect(clipboard).toContain("expect(evidence.verdict).toBe('VERIFIED_PASS')");
    expect(clipboard).not.toContain("scenario: 'sql-deadlock'");
  });

  test('scenario API rejects unknown fixture names', async ({ request }) => {
    const response = await request.post('/api/v1/lab/scenario', {
      data: { scenario: 'unauthorized-code-execution' },
    });
    expect(response.status()).toBe(400);
  });
});
