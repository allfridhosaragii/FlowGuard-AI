import { describe, it, expect } from 'vitest';
import { ScenarioAuditRunner } from '../src/lib/verification/scenario-runner';

describe('Additional first-party scenario audits', () => {
  it('detects a real wait-for cycle in the bounded synthetic SQL lock fixture', async () => {
    const result = await ScenarioAuditRunner.execute('sql-deadlock');
    expect(result.scope).toBe('FIRST_PARTY_SYNTHETIC_FIXTURE');
    expect(result.fixtureId).toBe('synthetic-sql-lock-cycle-v1');
    expect(result.verdict).toBe('VERIFIED_FAIL');
    expect(result.riskLevel).toBe('HIGH');
    expect(result.observations).toContain('Cycle detected: true');
    expect(result.timeline.filter((event) => event.action.includes('Blocked waiting'))).toHaveLength(2);
    expect(result.findings).toHaveLength(1);
    expect(result.limitations).toContain('does not establish a SQL deadlock in an actual database');
    expect(result.runnableAssertion).toContain('/api/v1/lab/scenario');
  });

  it('processes healthy stream events and finds no duplicates or reorderings', async () => {
    const result = await ScenarioAuditRunner.execute('healthy-stream');
    expect(result.scope).toBe('FIRST_PARTY_SYNTHETIC_FIXTURE');
    expect(result.fixtureId).toBe('synthetic-healthy-stream-v1');
    expect(result.verdict).toBe('VERIFIED_PASS');
    expect(result.riskLevel).toBe('LOW');
    expect(result.findings).toHaveLength(0);
    expect(result.observations).toContain('Events accepted: 3');
    expect(result.observations).toContain('Unique event IDs: true');
    expect(result.observations).toContain('Strict sequence order: true');
    expect(result.runnableAssertion).toContain('/api/v1/lab/scenario');
  });

  it('rejects scenario names outside the allowlist', async () => {
    await expect(
      ScenarioAuditRunner.execute('arbitrary-shell-command' as 'sql-deadlock')
    ).rejects.toThrow(/Unsupported scenario fixture/);
  });
});
