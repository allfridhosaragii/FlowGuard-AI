import { test, expect, type Page } from '@playwright/test';

/**
 * UX-002 extended evidence test: do not force focus or click on the app controls.
 * Earlier A11Y-02 and A11Y-03 coverage used locator.focus(), which cannot
 * establish the natural keyboard focus sequence or focus retention during requests.
 *
 * The historical TestSprite UX-002 specification covers both /analyze and /lab.
 */
async function tabUntil(page: Page, id: string, limit = 38) {
  for (let i = 0; i < limit; i++) {
    await page.keyboard.press('Tab');
    if (await page.evaluate(() => (document.activeElement as HTMLElement | null)?.id) === id) {
      await expect(page.locator('#' + id)).toBeFocused();
      return;
    }
  }
  throw new Error('Natural Tab cannot reach #' + id + ' within ' + limit + ' keypresses');
}
const slowApi = async (page: Page, endpoint: string) => {
  await page.route('**' + endpoint, async route => {
    await new Promise(resolve => setTimeout(resolve, 1300));
    await route.continue();
  });
};

test.describe('UX-002 deep keyboard and accessible status audit', () => {
  test('UX002-FULL: natural keyboard journey spans Analyze and Lab, with non-color-only verdict', async ({ page }) => {
    await page.goto('/analyze');
    await tabUntil(page, 'tab-code-snippet');
    for (const id of [
      'tab-github-pr', 'btn-preset-payment', 'btn-preset-jwt',
      'btn-preset-clean', 'code-snippet-input', 'business-rule-input',
      'btn-launch-analysis',
    ]) {
      await page.keyboard.press('Tab');
      await expect(page.locator('#' + id)).toBeFocused();
    }
    await page.keyboard.press('Enter');
    await expect(page.locator('#code-snippet-error')).toHaveText('Code snippet is required and cannot be empty.');
    await expect(page.locator('#code-snippet-input')).toHaveAttribute('aria-invalid', 'true');

    await page.goto('/lab');
    await tabUntil(page, 'fixture-vulnerable');
    await page.keyboard.press('Tab');
    await expect(page.locator('#fixture-fixed')).toBeFocused();
    await page.keyboard.press('Space');
    await expect(page.locator('#fixture-fixed')).toHaveAttribute('aria-pressed', 'true');

    await tabUntil(page, 'btn-execute-verification');
    await expect(page.locator('#btn-execute-verification')).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByText('Execution Run ID:')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Verified Pass', { exact: true })).toBeVisible();
    await expect(page.getByText('Invariant Upheld:', { exact: false })).toBeVisible();
  });

  test('UX002-ASYNC-LAB: keyboard activation retains focus and provides a live progress/verdict announcement', async ({ page }) => {
    await slowApi(page, '/api/v1/lab/verify');
    await page.goto('/lab');
    await tabUntil(page, 'btn-execute-verification');
    const button = page.locator('#btn-execute-verification');
    await page.keyboard.press('Enter');
    await expect(page.getByText('Executing Concurrent Async Requests...')).toBeVisible();
    await expect(button).toBeFocused();
    await expect(button).toHaveAttribute('aria-disabled', 'true');
    await expect(page.getByRole('status', { name: 'Lab verification progress' })).toContainText('Verification in progress');
    await expect(page.getByRole('status', { name: 'Lab verification progress' })).toContainText('Verification finished — observed effects exceeded the invariant limit');
  });

  test('UX002-ASYNC-ANALYZE: Enter activation retains focus and announces completion', async ({ page }) => {
    await slowApi(page, '/api/v1/analyses');
    await page.goto('/analyze');
    await tabUntil(page, 'code-snippet-input');
    await page.keyboard.type('function add(a, b) { return a + b; }');
    await page.keyboard.press('Tab');
    await expect(page.locator('#business-rule-input')).toBeFocused();
    await page.keyboard.press('Tab');
    const button = page.locator('#btn-launch-analysis');
    await expect(button).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByText('Agents Auditing Code...')).toBeVisible();
    await expect(button).toBeFocused();
    await expect(button).toHaveAttribute('aria-disabled', 'true');
    const status = page.getByRole('status', { name: 'Code analysis progress' });
    await expect(status).toContainText('Analysis in progress');
    await expect(status).toContainText('Analysis complete');
  });
});


test('UX002-HOME: natural Tab reaches both hero links and Enter navigates correctly', async ({ page }) => {
  for (const flow of [
    { text: 'Open Verification Lab', route: /\/lab$/, heading: /Controlled Verification Lab/ },
    { text: 'Analyze Pull Request', route: /\/analyze$/, heading: /Pull Request & Code Analysis Workspace/ },
  ]) {
    await page.goto('/');
    const hero = page.getByRole('link', { name: flow.text, exact: true });
    let reached = false;
    for (let i = 0; i < 25; i++) {
      await page.keyboard.press('Tab');
      reached = await hero.evaluate(el => el === document.activeElement);
      if (reached) break;
    }
    expect(reached, flow.text + ' is not reachable by natural Tab').toBe(true);
    await expect(hero).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(flow.route);
    await expect(page.getByRole('heading', { name: flow.heading })).toBeVisible();
  }
});

test('UX002-LAB-GROUPS: controls have proper accessible group names', async ({ page }) => {
  await page.goto('/lab');
  const fixture = page.getByRole('group', { name: /Target Implementation/ });
  const concurrency = page.getByRole('group', { name: /Concurrent Parallel Requests/ });
  await expect(fixture.getByRole('button', { name: /Vulnerable Fixture/ })).toBeVisible();
  await expect(fixture.getByRole('button', { name: /Corrected Fixture/ })).toBeVisible();
  await expect(concurrency.getByRole('button', { name: '2 concurrent asynchronous requests' })).toHaveAttribute('aria-pressed', 'true');
});

test('UX002-LAB-DOUBLE: repeat Enter while pending cannot duplicate API request', async ({ page }) => {
  await slowApi(page, '/api/v1/lab/verify');
  let requests = 0;
  page.on('request', req => {
    if (req.url().includes('/api/v1/lab/verify')) requests += 1;
  });
  await page.goto('/lab');
  await tabUntil(page, 'btn-execute-verification');
  await page.keyboard.press('Enter');
  const status = page.getByRole('status', { name: 'Lab verification progress' });
  await expect(status).toContainText('Verification in progress');
  await page.keyboard.press('Enter');
  await expect(status).toContainText('Verification finished');
  expect(requests).toBe(1);
});


test('UX002-SCENARIO: keyboard focus and live feedback survive slow synthetic scenario execution', async ({ page }) => {
  await slowApi(page, '/api/v1/lab/scenario');
  let dispatched = 0;
  page.on('request', request => {
    if (request.url().includes('/api/v1/lab/scenario')) dispatched++;
  });
  await page.goto('/lab');
  const preset = page.getByRole('button', { name: 'SQL Deadlock', exact: true });
  let presetReached = false;
  for (let i = 0; i < 26; i++) {
    await page.keyboard.press('Tab');
    presetReached = await preset.evaluate(el => document.activeElement === el);
    if (presetReached) break;
  }
  expect(presetReached).toBe(true);
  await page.keyboard.press('Enter');
  const execute = page.getByRole('button', { name: 'Run SQL deadlock audit' });
  let executeReached = false;
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press('Tab');
    executeReached = await execute.evaluate(el => document.activeElement === el);
    if (executeReached) break;
  }
  expect(executeReached).toBe(true);
  await page.keyboard.press('Enter');
  await expect(page.getByRole('status', { name: 'Scenario audit progress' })).toContainText('Scenario audit in progress');
  await expect(execute).toBeFocused();
  await expect(execute).toHaveAttribute('aria-disabled', 'true');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('status', { name: 'Scenario audit progress' })).toContainText('Scenario audit complete: HIGH risk');
  await expect(page.getByTestId('scenario-audit-results')).toContainText('HIGH RISK');
  expect(dispatched).toBe(1);
});

test('UX002-NAV-TO-FORM: header PR Analysis Enter restores focus to the new form through Tab', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'Main Navigation' });
  const analysis = nav.getByRole('link', { name: 'PR Analysis', exact: true });
  let reached = false;
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press('Tab');
    reached = await analysis.evaluate(el => document.activeElement === el);
    if (reached) break;
  }
  expect(reached, 'Tab must reach PR Analysis in the navigation').toBe(true);
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/analyze$/);
  await expect(page.locator('#main-content')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.locator('#tab-code-snippet')).toBeFocused();
  for (const id of [
    'tab-github-pr', 'btn-preset-payment', 'btn-preset-jwt', 'btn-preset-clean',
    'code-snippet-input', 'business-rule-input', 'btn-launch-analysis',
  ]) {
    await page.keyboard.press('Tab');
    await expect(page.locator('#' + id)).toBeFocused();
  }
  await page.keyboard.press('Enter');
  await expect(page.locator('#code-snippet-error')).toContainText(
    'Code snippet is required and cannot be empty.'
  );
});
