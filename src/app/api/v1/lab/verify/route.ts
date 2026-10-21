import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { VerificationRunner } from '@/lib/verification/runner';

const LabVerifySchema = z.object({
  fixture: z.enum(['vulnerable', 'fixed']),
  paymentId: z.string().trim().min(1, 'Payment ID is required').max(64),
  idempotencyKey: z.string().trim().min(1, 'Idempotency Key is required').max(128),
  amountMinor: z.number().int().min(1, 'Amount must be greater than 0').max(1000000),
  concurrency: z.number().int().min(1, 'Concurrency must be at least 1').max(5, 'Concurrency cannot exceed 5'),
  payloadMode: z.enum(['same_amount', 'differing_amount']).optional(),
  iterations: z.number().int().min(1).max(20).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = LabVerifySchema.safeParse(body);

    if (!validated.success) {
      const firstError = validated.error.errors[0]?.message || 'Invalid verification input parameters';
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

    const evidence = await VerificationRunner.execute(validated.data);
    return NextResponse.json(evidence, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: 'RUNNER_ERROR',
          message: error instanceof Error ? error.message : 'Verification harness encountered an internal failure',
        },
      },
      { status: 500 }
    );
  }
}
