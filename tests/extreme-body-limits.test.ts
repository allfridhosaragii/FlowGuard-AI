import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as analyse } from '../src/app/api/v1/analyses/route';
import { POST as verify } from '../src/app/api/v1/lab/verify/route';

function postRequest(path: string, body: string) {
  return new NextRequest('http://localhost:3000' + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
}

describe('Extreme Bug Hunt: API body-size and parse boundaries', () => {
  it('XBUG-14: PR Analysis refuses request bodies larger than 64 KiB', async () => {
    // Well-formed JSON with fields below individual schema limits but a large irrelevant field.
    const req = postRequest('/api/v1/analyses', JSON.stringify({
      businessRule: 'Refund processing must not duplicate side effects.',
      codeSnippet: 'async function refund() { await sleep(20); await insertRefund(); }',
      unusedPadding: 'x'.repeat(80 * 1024),
    }));
    const res = await analyse(req);
    expect(res.status).toBe(413);
    expect((await res.json()).error.code).toBe('INPUT_TOO_LARGE');
  });

  it('XBUG-15: Verification Lab refuses request bodies larger than 16 KiB', async () => {
    const req = postRequest('/api/v1/lab/verify', JSON.stringify({
      fixture: 'fixed',
      paymentId: 'pay_demo_001',
      idempotencyKey: 'size-test',
      amountMinor: 25000,
      concurrency: 2,
      unusedPadding: 'x'.repeat(20 * 1024),
    }));
    const res = await verify(req);
    expect(res.status).toBe(413);
    expect((await res.json()).error.code).toBe('INPUT_TOO_LARGE');
  });

  it.each([
    ['PR Analysis', '/api/v1/analyses', analyse],
    ['Verification Lab', '/api/v1/lab/verify', verify],
  ])('XBUG-16: %s handles malformed JSON as 400 rather than 500', async (_label, path, handler) => {
    const req = postRequest(path, '{"malformedJson":');
    const res = await handler(req);
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe('INVALID_JSON');
  });
});
