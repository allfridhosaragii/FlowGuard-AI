import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const BASE = (process.env.PRODUCTION_URL || 'https://flowguard-ai-smoky.vercel.app').replace(/\/$/, '');
assert.equal(BASE, 'https://flowguard-ai-smoky.vercel.app', 'Only the approved public production host is allowed');

const secretPattern = /\b(?:sk-(?:proj-)?[A-Za-z0-9_-]{20,}|ghp_[A-Za-z0-9]{30,}|gho_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}|AIza[0-9A-Za-z_-]{35})\b/;
const errors = [];
function scan(text, label) {
  assert.ok(!secretPattern.test(text), label + ' appears to contain a credential-like token (value intentionally not printed)');
}
async function get(path, expected = 200) {
  const response = await fetch(BASE + path, { signal: AbortSignal.timeout(30000) });
  const body = await response.text();
  scan(body, path);
  assert.equal(response.status, expected, 'Unexpected HTTP status for GET ' + path);
  console.log('PASS GET ' + path + ' (' + response.status + ')');
  return { body, response };
}
async function post(path, data, expected = 200) {
  const response = await fetch(BASE + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    signal: AbortSignal.timeout(35000),
  });
  const body = await response.text();
  scan(body, path);
  assert.equal(response.status, expected, 'Unexpected HTTP status for POST ' + path);
  const json = JSON.parse(body);
  console.log('PASS POST ' + path + ' (' + response.status + ')');
  return json;
}

for (const route of ['/', '/lab', '/analyze', '/about']) {
  const { body } = await get(route);
  assert.ok(body.includes('FlowGuard'), 'Missing FlowGuard app shell on ' + route);
  assert.match(body, /<meta[^>]+name="viewport"[^>]+content="[^"]*width=device-width/i, 'Viewport meta missing on ' + route);
}

const health = await get('/api/v1/health');
const healthJSON = JSON.parse(health.body);
assert.equal(healthJSON.status, 'ok');
assert.equal(healthJSON.features.verificationLab, true);
assert.equal(healthJSON.features.githubPrAnalysis, true);

const sharedInput = {
  paymentId: 'audit_synthetic_20261021',
  idempotencyKey: 'audit_synthetic_only',
  amountMinor: 125000,
  concurrency: 2,
  payloadMode: 'same_amount',
};
const vulnerable = await post('/api/v1/lab/verify', { ...sharedInput, fixture: 'vulnerable' });
const fixed = await post('/api/v1/lab/verify', { ...sharedInput, fixture: 'fixed' });
assert.equal(vulnerable.targetType, 'FIRST_PARTY_FIXTURE');
assert.equal(vulnerable.verdict, 'VERIFIED_FAIL');
assert.ok(vulnerable.observedEffects > 1, 'Vulnerable fixture did not reproduce duplicate synthetic refunds');
assert.equal(fixed.targetType, 'FIRST_PARTY_FIXTURE');
assert.equal(fixed.verdict, 'VERIFIED_PASS');
assert.equal(fixed.observedEffects, 1, 'Corrected fixture did not enforce idempotency');
console.log('PASS Verification Lab: vulnerable fails invariant; corrected fixture passes invariant');

const invalid = await post('/api/v1/lab/verify', { ...sharedInput, fixture: 'fixed', concurrency: 20 }, 400);
assert.equal(invalid.error.code, 'INVALID_INPUT');
console.log('PASS Verification Lab input validation');

const analyze = await post('/api/v1/analyses', {
  businessRule: 'A settled payment can create at most one refund side effect per idempotency key, even with repeated concurrent requests.',
  codeSnippet: "async function processRefund(key, amount) { const existing = await db.refunds.findOne({key}); if (!existing) { await sleep(20); await db.refunds.create({key, amount}); } }",
});
assert.ok(analyze.runId);
assert.equal(analyze.verdict, 'POTENTIAL');
assert.ok(Array.isArray(analyze.findings) && analyze.findings.length >= 1);
assert.ok(Array.isArray(analyze.plans) && analyze.plans.length >= 1);
assert.ok(analyze.findings.every((f) => f.status === 'POTENTIAL' || f.verdict === 'POTENTIAL' || (!f.status && !f.verdict)), 'A code-review finding was mislabeled as executed proof');
console.log('PASS PR Analysis three-agent response and potential-only provenance');

const invalidAnalysis = await post('/api/v1/analyses', {
  businessRule: 'Synthetic test requires a code snippet.',
  codeSnippet: '',
}, 400);
assert.equal(invalidAnalysis.error.code, 'INVALID_INPUT');
console.log('PASS PR Analysis input validation');

const home = (await get('/')).body;
const scripts = [...new Set([...home.matchAll(/<script[^>]*\bsrc="([^"]+)"/g)].map((m) => m[1]).filter((u) => u.startsWith('/_next/static/')))].slice(0, 32);
assert.ok(scripts.length > 0, 'No public Next.js JS bundles discovered');
for (const src of scripts) {
  const response = await fetch(BASE + src, { signal: AbortSignal.timeout(30000) });
  assert.equal(response.status, 200, 'Public JS bundle unavailable');
  const body = await response.text();
  scan(body, 'public JS bundle');
}
console.log('PASS public JS asset pattern scan, bundles checked=' + scripts.length + ' (pattern-based only; not a complete secret audit)');

await mkdir('smoke-artifacts', { recursive: true });
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined,
});
try {
  for (const mode of [
    { name: 'desktop', viewport: { width: 1280, height: 720 }, isMobile: false, hasTouch: false, deviceScaleFactor: 1 },
    { name: 'mobile-390x844', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 },
  ]) {
    const context = await browser.newContext({
      viewport: mode.viewport,
      isMobile: mode.isMobile,
      hasTouch: mode.hasTouch,
      deviceScaleFactor: mode.deviceScaleFactor,
    });
    const page = await context.newPage();
    const browserErrors = [];
    page.on('pageerror', (err) => browserErrors.push('pageerror: ' + err.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') browserErrors.push('console.error: ' + msg.text());
    });
    for (const route of ['/', '/lab', '/analyze', '/about']) {
      const response = await page.goto(BASE + route, { waitUntil: 'load', timeout: 30000 });
      assert.equal(response?.status(), 200, 'Browser navigation failed: ' + mode.name + ' ' + route);
      await page.locator('body').waitFor();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
      assert.equal(overflow, false, 'Horizontal overflow: ' + mode.name + ' ' + route);
      if (mode.isMobile && route === '/') {
        const toggle = page.locator('#mobile-menu-toggle');
        assert.equal(await toggle.isVisible(), true, 'Mobile navigation toggle not visible');
        await toggle.tap();
        assert.equal(await page.locator('#mobile-navigation-menu').isVisible(), true, 'Mobile menu not shown');
      }
      if (route === '/analyze') {
        assert.equal(await page.locator('#btn-launch-analysis').isVisible(), true, 'Analysis CTA hidden');
      }
    }
    await page.screenshot({ path: 'smoke-artifacts/' + mode.name + '-about.png', fullPage: true });
    if (browserErrors.length) {
      console.error('Browser JS errors found: count=' + browserErrors.length + ' in ' + mode.name);
      throw new Error('Browser console/page errors in ' + mode.name + ': ' + browserErrors.length + ' (details intentionally not printed to avoid secret disclosure)');
    }
    console.log('PASS live browser, ' + mode.name + ': 4 routes, no horizontal overflow, no JS console/page errors');
    await context.close();
  }
} finally {
  await browser.close();
}
console.log('SUCCESS: Production HTTP, real API calls, public asset scan, desktop and 390x844 mobile browser smoke checks passed');
