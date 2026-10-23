import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { JsonBodyInputError, readBoundedJson } from '@/lib/http/bounded-json';
import { ScenarioAuditRunner } from '@/lib/verification/scenario-runner';

const ScenarioSchema = z.object({
  scenario: z.enum(['sql-deadlock', 'healthy-stream']),
}).strict();

export async function POST(req: NextRequest) {
  try {
    const payload = await readBoundedJson(req, 4 * 1024);
    const validated = ScenarioSchema.safeParse(payload);
    if (!validated.success) {
      return NextResponse.json({
        error: { code: 'INVALID_INPUT', message: 'Only explicitly allowlisted scenario fixtures are supported' },
      }, { status: 400 });
    }
    const evidence = await ScenarioAuditRunner.execute(validated.data.scenario);
    return NextResponse.json(evidence, { status: 200 });
  } catch (error) {
    if (error instanceof JsonBodyInputError) {
      return NextResponse.json({
        error: { code: error.code, message: error.message },
      }, { status: error.status });
    }
    return NextResponse.json({
      error: { code: 'SCENARIO_ERROR', message: 'The bounded scenario fixture could not be executed' },
    }, { status: 500 });
  }
}
