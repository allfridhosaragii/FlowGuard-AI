import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { AgentOrchestrator, AnalysisInput } from '@/lib/agents/orchestrator';
import { GitHubPRReader, PRCoverageMetadata } from '@/lib/github/pr-reader';
import { JsonBodyInputError, readBoundedJson } from '@/lib/http/bounded-json';

const AnalysisRequestSchema = z
  .object({
    businessRule: z.string().trim().min(10, 'Business rule must be at least 10 characters').max(2000),
    githubPrUrl: z.string().trim().url('Invalid GitHub PR URL format').max(2048).optional().or(z.literal('')),
    codeSnippet: z.string().trim().max(30000).optional().or(z.literal('')),
    filePaths: z.array(z.string().trim().min(1).max(512)).max(30).optional(),
  })
  .refine(
    (data) => {
      const hasPr = typeof data.githubPrUrl === 'string' && data.githubPrUrl.trim().length > 0;
      const hasSnippet = typeof data.codeSnippet === 'string' && data.codeSnippet.trim().length > 0;
      return hasPr || hasSnippet;
    },
    {
      message: 'Either a valid GitHub PR URL or a non-empty code snippet must be provided for analysis',
      path: ['codeSnippet'],
    }
  );

export async function POST(req: NextRequest) {
  try {
    const body = await readBoundedJson(req, 64 * 1024);
    const validated = AnalysisRequestSchema.safeParse(body);

    if (!validated.success) {
      const firstError = validated.error.errors[0]?.message || 'Validation failed for analysis request';
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_INPUT',
            message: firstError,
            details: validated.error.format(),
          },
        },
        { status: 400 }
      );
    }

    const { businessRule, githubPrUrl, codeSnippet, filePaths } = validated.data;

    let diff = codeSnippet || '';
    let files = filePaths || [];
    let prContext: AnalysisInput['prContext'];
    let prCoverage: PRCoverageMetadata | undefined = undefined;
    let sourceSha = 'manual:input';
    let sourceReference = 'Manual Code Input';
    let sourceType: 'GITHUB_PR' | 'MANUAL_CODE' = 'MANUAL_CODE';
    let prFetchStatus: AnalysisInput['prFetchStatus'];

    // If GitHub PR is provided, fetch via read-only REST API
    if (githubPrUrl) {
      sourceType = 'GITHUB_PR';
      sourceReference = githubPrUrl;
      try {
        const pr = await GitHubPRReader.fetchPR(githubPrUrl);
        if (!pr.diff || pr.diff.trim().length === 0 || pr.coverage.filesWithPatch === 0) {
          return NextResponse.json(
            {
              error: {
                code: 'GITHUB_FETCH_ERROR',
                message:
                  'GitHub PR contains no readable code patches or diff evidence for analysis. Cannot issue verdict without code evidence.',
              },
            },
            { status: 422 }
          );
        }
        diff = pr.diff;
        files = pr.changedFiles;
        sourceSha = pr.headSha;
        // All PR data came from a successful, non-cached GitHub API fetch.
        // Failed fetches return 422 above; we never silently substitute sample data.
        prFetchStatus = 'LIVE_FETCH';
        prCoverage = pr.coverage;
        prContext = {
          title: pr.title,
          description: pr.description,
          files: pr.changedFiles,
          coverage: pr.coverage,
        };
      } catch (err) {
        return NextResponse.json(
          {
            error: {
              code: 'GITHUB_FETCH_ERROR',
              message: err instanceof Error ? err.message : 'Failed to read public GitHub pull request',
            },
          },
          { status: 422 }
        );
      }
    }

    const result = await AgentOrchestrator.run({
      businessRule,
      sourceType,
      sourceReference,
      prFetchStatus,
      sourceSha,
      codeDiff: diff,
      filePaths: files,
      prContext,
      prCoverage,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof JsonBodyInputError) {
      return NextResponse.json({ error: { code: error.code, message: error.message } }, { status: error.status });
    }
    // Never expose internal exceptions or upstream provider messages to public callers.
    return NextResponse.json(
      {
        error: {
          code: 'ORCHESTRATION_ERROR',
          message: 'Analysis pipeline encountered an unexpected error',
        },
      },
      { status: 500 }
    );
  }
}
