import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { AgentOrchestrator } from '@/lib/agents/orchestrator';
import { GitHubPRReader } from '@/lib/github/pr-reader';

const AnalysisRequestSchema = z
  .object({
    businessRule: z.string().trim().min(10, 'Business rule must be at least 10 characters').max(2000),
    githubPrUrl: z.string().trim().url('Invalid GitHub PR URL format').optional().or(z.literal('')),
    codeSnippet: z.string().trim().max(30000).optional().or(z.literal('')),
    filePaths: z.array(z.string()).optional(),
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
    const body = await req.json();
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
    let prContext: any = undefined;
    let sourceSha = 'manual:input';
    let sourceReference = 'Manual Code Input';
    let sourceType: 'GITHUB_PR' | 'MANUAL_CODE' = 'MANUAL_CODE';

    // If GitHub PR is provided, fetch via read-only REST API
    if (githubPrUrl) {
      sourceType = 'GITHUB_PR';
      sourceReference = githubPrUrl;
      try {
        const pr = await GitHubPRReader.fetchPR(githubPrUrl);
        diff = pr.diff;
        files = pr.changedFiles;
        sourceSha = pr.headSha;
        prContext = {
          title: pr.title,
          description: pr.description,
          files: pr.changedFiles,
        };
      } catch (err: any) {
        return NextResponse.json(
          {
            error: {
              code: 'GITHUB_FETCH_ERROR',
              message: err.message || 'Failed to read public GitHub pull request',
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
      sourceSha,
      codeDiff: diff,
      filePaths: files,
      prContext,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: {
          code: 'ORCHESTRATION_ERROR',
          message: error.message || 'Analysis pipeline encountered an unexpected error',
        },
      },
      { status: 500 }
    );
  }
}
