import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { AgentOrchestrator } from '@/lib/agents/orchestrator';
import { GitHubPRReader } from '@/lib/github/pr-reader';

const AnalysisRequestSchema = z
  .object({
    businessRule: z.string().min(10).max(2000),
    githubPrUrl: z.string().url().optional(),
    codeSnippet: z.string().max(30000).optional(),
    filePaths: z.array(z.string()).optional(),
  })
  .refine((data) => data.githubPrUrl || data.codeSnippet, {
    message: 'Either githubPrUrl or codeSnippet must be provided for analysis',
  });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = AnalysisRequestSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_INPUT',
            message: 'Validation failed for analysis request',
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
