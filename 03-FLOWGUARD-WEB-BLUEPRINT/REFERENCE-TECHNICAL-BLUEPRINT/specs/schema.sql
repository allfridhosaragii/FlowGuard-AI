-- FlowGuard AI Postgres schema proposal (optional saved-history module, P1)
-- Apply only if Neon PostgreSQL has been configured. P0 Lab must remain stateless and functional.
-- No raw full PR diff, API keys, real payment data or raw LLM prompts stored.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE analysis_status AS ENUM ('QUEUED', 'FETCHING_CONTEXT', 'EXTRACTING_RULES', 'HUNTING_RISKS', 'PLANNING_VERIFICATION', 'COMPLETED', 'FAILED');
CREATE TYPE finding_status AS ENUM ('POTENTIAL', 'VERIFIED_FAIL', 'VERIFIED_PASS', 'INCONCLUSIVE');
CREATE TYPE verification_outcome AS ENUM ('VERIFIED_PASS', 'VERIFIED_FAIL', 'INCONCLUSIVE', 'ERROR');

CREATE TABLE analysis_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_kind TEXT NOT NULL CHECK (source_kind IN ('PUBLIC_PR', 'FIRST_PARTY_FIXTURE')),
  repo_full_name TEXT,
  pr_number INTEGER CHECK (pr_number > 0),
  commit_sha CHAR(40),
  input_sha256 CHAR(64) NOT NULL,
  rule_excerpt TEXT NOT NULL CHECK (length(rule_excerpt) <= 400),
  status analysis_status NOT NULL DEFAULT 'QUEUED',
  model_id TEXT,
  prompt_version TEXT,
  error_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '24 hours'),
  CHECK ((source_kind = 'PUBLIC_PR' AND repo_full_name IS NOT NULL AND pr_number IS NOT NULL AND commit_sha IS NOT NULL)
      OR source_kind = 'FIRST_PARTY_FIXTURE')
);
CREATE INDEX idx_analysis_runs_expires_at ON analysis_runs(expires_at);
CREATE INDEX idx_analysis_runs_repo_created ON analysis_runs(repo_full_name, created_at DESC);

CREATE TABLE agent_stage_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID NOT NULL REFERENCES analysis_runs(id) ON DELETE CASCADE,
  stage TEXT NOT NULL CHECK (stage IN ('REQUIREMENT_ANALYST','RISK_HUNTER','VERIFICATION_PLANNER')),
  stage_status TEXT NOT NULL CHECK (stage_status IN ('COMPLETED','FAILED','SKIPPED')),
  output_sha256 CHAR(64),
  error_code TEXT,
  elapsed_ms INTEGER CHECK (elapsed_ms >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (analysis_id, stage)
);
CREATE INDEX idx_agent_stage_runs_analysis_id ON agent_stage_runs(analysis_id);

CREATE TABLE findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID NOT NULL REFERENCES analysis_runs(id) ON DELETE CASCADE,
  invariant_id TEXT NOT NULL,
  title TEXT NOT NULL CHECK (length(title) <= 300),
  category TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('LOW','MEDIUM','HIGH','CRITICAL')),
  status finding_status NOT NULL DEFAULT 'POTENTIAL',
  source_file TEXT,
  source_line_start INTEGER,
  source_line_end INTEGER,
  target_kind TEXT NOT NULL DEFAULT 'PUBLIC_PR',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (source_line_start IS NULL OR source_line_start > 0),
  CHECK (source_line_end IS NULL OR source_line_end >= source_line_start),
  CHECK (target_kind IN ('PUBLIC_PR','FIRST_PARTY_FIXTURE')),
  CHECK (target_kind <> 'PUBLIC_PR' OR status = 'POTENTIAL')
);
CREATE INDEX idx_findings_analysis ON findings(analysis_id);

CREATE TABLE verification_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID REFERENCES analysis_runs(id) ON DELETE SET NULL,
  finding_id UUID REFERENCES findings(id) ON DELETE SET NULL,
  target_kind TEXT NOT NULL CHECK (target_kind = 'FIRST_PARTY_FIXTURE'),
  fixture_id TEXT NOT NULL CHECK (fixture_id IN ('refund.vulnerable.v1','refund.fixed.v1')),
  target_revision TEXT NOT NULL,
  test_template_id TEXT NOT NULL CHECK (test_template_id = 'REFUND_DUPLICATE_REQUEST_V1'),
  input_sha256 CHAR(64) NOT NULL,
  evidence_sha256 CHAR(64) NOT NULL,
  observed_effect_count INTEGER NOT NULL CHECK (observed_effect_count >= 0),
  outcome verification_outcome NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  finished_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '24 hours'),
  CHECK (finished_at >= started_at)
);
CREATE INDEX idx_verification_runs_expires ON verification_runs(expires_at);

-- Implementation-level guard: only trusted executor can update findings to VERIFIED_*.
-- Enforce with service-role separation / application authorization, not database CHECK alone.
-- Retention job required before promising 24-hour deletion:
-- DELETE FROM verification_runs WHERE expires_at < now();
-- DELETE FROM analysis_runs WHERE expires_at < now();
