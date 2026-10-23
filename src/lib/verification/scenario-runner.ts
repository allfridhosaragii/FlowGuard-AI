/**
 * Opt-in first-party scenario fixtures. These are bounded, synthetic simulations.
 * SQL lock cycles are modelled in memory; no real database is contacted.
 * Stream checks execute against the bundled deterministic event fixture.
 */
export type ScenarioName = 'sql-deadlock' | 'healthy-stream';

export interface ScenarioAuditEvidence {
  runId: string;
  scenario: ScenarioName;
  fixtureId: string;
  scope: 'FIRST_PARTY_SYNTHETIC_FIXTURE';
  verdict: 'VERIFIED_FAIL' | 'VERIFIED_PASS' | 'INCONCLUSIVE';
  riskLevel: 'HIGH' | 'LOW';
  summary: string;
  invariant: string;
  observations: string[];
  findings: string[];
  timeline: Array<{ step: number; actor: string; action: string }>;
  runnableAssertion: string;
  limitations: string;
  executedAtUtc: string;
}

export class ScenarioAuditRunner {
  static async execute(scenario: ScenarioName): Promise<ScenarioAuditEvidence> {
    if (scenario !== 'sql-deadlock' && scenario !== 'healthy-stream') {
      throw new Error('Unsupported scenario fixture');
    }
    const runId = 'scenario_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    const timeline: ScenarioAuditEvidence['timeline'] = [];
    const record = (actor: string, action: string) => {
      timeline.push({ step: timeline.length + 1, actor, action });
    };

    if (scenario === 'sql-deadlock') {
      // A real concurrent lock-order model: two tasks acquire opposite resources
      // and, after a microtask checkpoint, attempt the other's resource.
      const owners = new Map<string, string>();
      const waitingFor = new Map<string, string>();
      const transaction = async (tx: string, first: string, second: string) => {
        if (owners.has(first)) throw new Error('Fixture initial lock collision');
        owners.set(first, tx);
        record(tx, 'Acquired synthetic lock on ' + first);
        await Promise.resolve();
        const owner = owners.get(second);
        if (owner && owner !== tx) {
          waitingFor.set(tx, owner);
          record(tx, 'Blocked waiting for ' + second + ' held by ' + owner);
        } else {
          owners.set(second, tx);
          record(tx, 'Acquired synthetic lock on ' + second);
        }
      };
      await Promise.all([
        transaction('TX_A', 'payments', 'ledger'),
        transaction('TX_B', 'ledger', 'payments'),
      ]);
      const cycle = waitingFor.get('TX_A') === 'TX_B' && waitingFor.get('TX_B') === 'TX_A';
      record('Detector', cycle ? 'Detected TX_A -> TX_B -> TX_A wait-for cycle' : 'No lock cycle found');

      const evidence: ScenarioAuditEvidence = {
        runId,
        scenario,
        fixtureId: 'synthetic-sql-lock-cycle-v1',
        scope: 'FIRST_PARTY_SYNTHETIC_FIXTURE',
        verdict: cycle ? 'VERIFIED_FAIL' : 'INCONCLUSIVE',
        riskLevel: cycle ? 'HIGH' : 'LOW',
        summary: cycle
          ? 'SQL deadlock risk reproduced in a synthetic two-transaction lock model'
          : 'No deadlock cycle observed in this simulation',
        invariant: 'Transaction wait-for graph must remain acyclic',
        observations: [
          'TX_A waits for: ' + (waitingFor.get('TX_A') || 'nobody'),
          'TX_B waits for: ' + (waitingFor.get('TX_B') || 'nobody'),
          'Cycle detected: ' + String(cycle),
        ],
        findings: cycle ? ['HIGH: Opposite lock acquisition order creates a wait-for cycle'] : [],
        timeline,
        runnableAssertion: [
          "import { test, expect } from '@playwright/test';",
          "test('Synthetic SQL lock cycle is reproducible', async ({ request }) => {",
          "  const response = await request.post('/api/v1/lab/scenario', { data: { scenario: 'sql-deadlock' } });",
          '  expect(response.status()).toBe(200);',
          '  const evidence = await response.json();',
          "  expect(evidence.fixtureId).toBe('synthetic-sql-lock-cycle-v1');",
          "  expect(evidence.verdict).toBe('VERIFIED_FAIL');",
          "  expect(evidence.observations).toContain('Cycle detected: true');",
          '});',
        ].join('\n'),
        limitations: 'Only an in-memory first-party lock-order model was executed. This does not establish a SQL deadlock in an actual database, deployed SQL service, or external repository.',
        executedAtUtc: new Date().toISOString(),
      };
      return evidence;
    }

    // Healthy event stream: real asynchronous processing of an immutable
    // first-party sample with unique, strictly increasing sequence numbers.
    const events = [
      { id: 'evt-001', sequence: 1 },
      { id: 'evt-002', sequence: 2 },
      { id: 'evt-003', sequence: 3 },
    ];
    const accepted: Array<{ id: string; sequence: number }> = [];
    await Promise.all(events.map(async (event) => {
      record(event.id, 'Received synthetic stream event #' + event.sequence);
      await Promise.resolve();
      accepted.push(event);
      record(event.id, 'Accepted event #' + event.sequence);
    }));
    const unique = new Set(accepted.map((event) => event.id)).size === accepted.length;
    const ordered = accepted.every((event, index) => index === 0 || event.sequence > accepted[index - 1].sequence);
    const healthy = unique && ordered && accepted.length === events.length;
    record('Detector', healthy ? 'No duplicate, missing, or out-of-order events observed' : 'Stream invariant violated');

    return {
      runId,
      scenario,
      fixtureId: 'synthetic-healthy-stream-v1',
      scope: 'FIRST_PARTY_SYNTHETIC_FIXTURE',
      verdict: healthy ? 'VERIFIED_PASS' : 'VERIFIED_FAIL',
      riskLevel: healthy ? 'LOW' : 'HIGH',
      summary: healthy ? 'Healthy stream preset: no risk detected in the tested sample' : 'Stream invariant violation detected',
      invariant: 'All fixture events must be accepted exactly once in strictly increasing sequence order',
      observations: [
        'Events submitted: ' + events.length,
        'Events accepted: ' + accepted.length,
        'Unique event IDs: ' + String(unique),
        'Strict sequence order: ' + String(ordered),
      ],
      findings: healthy ? [] : ['HIGH: Duplicated or out-of-order events'],
      timeline,
      runnableAssertion: [
        "import { test, expect } from '@playwright/test';",
        "test('Healthy stream fixture passes the audit', async ({ request }) => {",
        "  const response = await request.post('/api/v1/lab/scenario', { data: { scenario: 'healthy-stream' } });",
        '  expect(response.status()).toBe(200);',
        '  const evidence = await response.json();',
        "  expect(evidence.fixtureId).toBe('synthetic-healthy-stream-v1');",
        "  expect(evidence.verdict).toBe('VERIFIED_PASS');",
        "  expect(evidence.riskLevel).toBe('LOW');",
        '  expect(evidence.findings).toHaveLength(0);',
        '});',
      ].join('\n'),
      limitations: 'Only three bundled synthetic stream events were tested. This result does not certify real customer data, external message brokers, or arbitrary PRs.',
      executedAtUtc: new Date().toISOString(),
    };
  }
}
