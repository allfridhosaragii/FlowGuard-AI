import { describe, it, expect } from 'vitest';
import { GitHubPRReader } from '../src/lib/github/pr-reader';

describe('GitHub PR Reader and Safety Parser', () => {
  it('parses valid public GitHub PR URLs accurately', () => {
    const parsed = GitHubPRReader.parsePRUrl('https://github.com/allfridhosaragii/FlowGuard-AI/pull/1');
    expect(parsed.owner).toBe('allfridhosaragii');
    expect(parsed.repo).toBe('FlowGuard-AI');
    expect(parsed.pullNumber).toBe(1);
  });

  it('rejects malformed or non-PR URLs', () => {
    expect(() => GitHubPRReader.parsePRUrl('https://github.com/owner/repo/issues/1')).toThrow(
      /Invalid GitHub PR URL/
    );
    expect(() => GitHubPRReader.parsePRUrl('https://malicious-site.com/fake/pull/1')).toThrow(
      /Invalid GitHub PR URL/
    );
    expect(() => GitHubPRReader.parsePRUrl('not-a-url')).toThrow(/Invalid GitHub PR URL/);
  });
});
