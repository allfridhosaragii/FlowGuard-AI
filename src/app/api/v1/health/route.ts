import { NextResponse } from 'next/server';
import { AIProvider } from '@/lib/ai/provider';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'FlowGuard AI — Verification & Risk Platform',
    buildVersion: '1.0.0',
    timestamp: new Date().toISOString(),
    features: {
      verificationLab: true,
      githubPrAnalysis: true,
      aiModelConfigured: AIProvider.isConfigured(),
      modelFamily: AIProvider.getModelName(),
    },
    supportedInvariants: ['INV-REFUND-001'],
    environment: process.env.NODE_ENV || 'production',
  });
}
