// FlowGuard AI - Interactive Risk Engine & Simulation Client
document.addEventListener('DOMContentLoaded', () => {
  // Preset Data Scenarios
  const PRESETS = {
    payment_race: {
      raw: JSON.stringify({
        event: "checkout_order_settlement",
        trace_id: "trc_9942a_race",
        timestamp: new Date().toISOString(),
        actor_id: "usr_77190",
        order_amount_usd: 1250.00,
        concurrency: {
          parallel_requests: 4,
          distributed_lock_acquired: false,
          pessimistic_lock: null
        },
        execution_path: [
          "auth_check: OK (duration: 12ms)",
          "balance_deduction: [THREAD_A] deducted $1250",
          "balance_deduction: [THREAD_B] deducted $1250 (DIRTY READ)",
          "inventory_reservation: SUCCESS",
          "webhook_notification: QUEUED"
        ],
        db_isolation: "READ_COMMITTED"
      }, null, 2),
      score: 94,
      severity: "CRITICAL RISK",
      summary: "Double-spending race condition detected. Multiple concurrent threads invoked balance deduction with distributed lock missing under READ_COMMITTED isolation.",
      badgeClass: "status-critical",
      gaugeColor: "#ff1744",
      findings: [
        { text: "Distributed lock missing on critical financial settlement transaction.", type: "danger" },
        { text: "Double deduction race condition allows duplicate ledger settlement.", type: "danger" },
        { text: "Database isolation 'READ_COMMITTED' allows phantom reads during concurrent balances.", type: "warning" }
      ],
      assertion: `// TestSprite 3.0 Synthetic Assertion Spec
test('TestSprite: Guard against concurrent payment settlement double-spend', async ({ request }) => {
  const accountId = 'usr_77190';
  const initialBalance = await getLedgerBalance(accountId);
  
  // Launch parallel concurrent settlement triggers
  const [resA, resB] = await Promise.all([
    request.post('/api/checkout/settle', { data: { accountId, amount: 1250 } }),
    request.post('/api/checkout/settle', { data: { accountId, amount: 1250 } })
  ]);

  // Assert idempotency & locking
  expect([resA.status(), resB.status()]).toContain(409); // Conflict / Locked
  const finalBalance = await getLedgerBalance(accountId);
  expect(initialBalance - finalBalance).toBe(1250); // Exactly once
});`
    },

    jwt_leak: {
      raw: JSON.stringify({
        event: "api_gateway_ingress",
        trace_id: "trc_8811e_jwt",
        timestamp: new Date().toISOString(),
        endpoint: "/v1/admin/cluster/export-metrics",
        headers: {
          "host": "api.internal.cluster.local",
          "x-forwarded-for": "198.51.100.24",
          "authorization": "Bearer eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJhZG1pbiIsInJvbGUiOiJzdXBlcmFkbWluIn0."
        },
        tls_version: "TLSv1.3",
        policy_checks: {
          signature_required: true,
          algorithm_whitelist: ["RS256", "ES256"]
        }
      }, null, 2),
      score: 88,
      severity: "HIGH VULNERABILITY",
      summary: "Critical JWT signature bypass vulnerability ('none' algorithm). Attackers can forge superadmin tokens without cryptographic verification.",
      badgeClass: "status-critical",
      gaugeColor: "#ff1744",
      findings: [
        { text: "JWT header specifies forbidden algorithm 'none' (CVE-2015-9235 pattern).", type: "danger" },
        { text: "Gateway accepted unverified claim for superadmin privilege role.", type: "danger" },
        { text: "Signature verification bypassed prior to ingress proxying.", type: "warning" }
      ],
      assertion: `// TestSprite 3.0 Synthetic Assertion Spec
test('TestSprite: Reject unsigned JWT algorithm (none)', async ({ request }) => {
  const unsignedToken = 'Bearer eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJhZG1pbiIsInJvbGUiOiJzdXBlcmFkbWluIn0.';
  
  const response = await request.get('/v1/admin/cluster/export-metrics', {
    headers: { Authorization: unsignedToken }
  });

  expect(response.status()).toBe(401);
  const body = await response.json();
  expect(body.error).toMatch(/InvalidTokenSignature/i);
});`
    },

    db_deadlock: {
      raw: JSON.stringify({
        event: "batch_inventory_sync",
        trace_id: "trc_4432d_deadlock",
        timestamp: new Date().toISOString(),
        db_pool: {
          total_connections: 50,
          active_connections: 49,
          waiting_queries: 142
        },
        transactions: [
          "Tx 1042 locked row SKU_A, requesting lock on SKU_B",
          "Tx 1043 locked row SKU_B, requesting lock on SKU_A",
          "Deadlock detection timeout after 3000ms"
        ],
        query_pattern: "UNORDERED_MULTIPLE_ROW_UPDATE"
      }, null, 2),
      score: 72,
      severity: "MEDIUM RISK",
      summary: "Database deadlock cycle detected under high transaction throughput due to unordered row locking across parallel worker processes.",
      badgeClass: "status-scanning",
      gaugeColor: "#ffb300",
      findings: [
        { text: "Cyclic lock dependency between Tx 1042 and Tx 1043.", type: "warning" },
        { text: "Unordered lock acquisitions on composite SKU keys.", type: "warning" },
        { text: "Connection pool saturation (49/50 active connections).", type: "warning" }
      ],
      assertion: `// TestSprite 3.0 Synthetic Assertion Spec
test('TestSprite: Validate canonical lock order in batch inventory updates', async ({ request }) => {
  // Concurrently dispatch inverse key ordering
  const p1 = request.post('/api/inventory/batch-adjust', { data: { skus: ['SKU_A', 'SKU_B'] } });
  const p2 = request.post('/api/inventory/batch-adjust', { data: { skus: ['SKU_B', 'SKU_A'] } });

  const [res1, res2] = await Promise.all([p1, p2]);
  expect(res1.status()).toBe(200);
  expect(res2.status()).toBe(200);
});`
    },

    safe_flow: {
      raw: JSON.stringify({
        event: "user_session_heartbeat",
        trace_id: "trc_0019a_safe",
        timestamp: new Date().toISOString(),
        actor_id: "usr_44021",
        session: {
          valid: true,
          expires_in: 3600,
          mfa_verified: true
        },
        network: {
          latency_ms: 24,
          rate_limit_remaining: 994
        },
        status: "HEALTHY"
      }, null, 2),
      score: 4,
      severity: "LOW RISK (CLEAN)",
      summary: "Telemetry trace passes all known safety invariants. Cryptographic signatures valid, rate-limiting respected, no concurrency anomalies detected.",
      badgeClass: "status-safe",
      gaugeColor: "#00e676",
      findings: [
        { text: "Session token cryptographically validated via Ed25519.", type: "success" },
        { text: "MFA verified with valid hardware key challenge.", type: "success" },
        { text: "Request rate well below throttle limits (994 quota remaining).", type: "success" }
      ],
      assertion: `// TestSprite 3.0 Synthetic Assertion Spec
test('TestSprite: Normal heartbeat throughput verification', async ({ request }) => {
  const res = await request.get('/api/session/heartbeat');
  expect(res.status()).toBe(200);
  expect(await res.json()).toHaveProperty('status', 'HEALTHY');
});`
    }
  };

  // DOM Elements
  const traceInput = document.getElementById('traceInput');
  const presetBtns = document.querySelectorAll('.preset-btn');
  const scanBtn = document.getElementById('scanBtn');
  const scanBtnText = document.getElementById('scanBtnText');
  const scanSpinner = document.getElementById('scanSpinner');
  const scanStatusBadge = document.getElementById('scanStatusBadge');
  const scoreValue = document.getElementById('scoreValue');
  const gaugeBar = document.getElementById('gaugeBar');
  const severityLabel = document.getElementById('severityLabel');
  const severitySummary = document.getElementById('severitySummary');
  const findingsList = document.getElementById('findingsList');
  const assertionCode = document.getElementById('assertionCode');
  const copyAssertionBtn = document.getElementById('copyAssertionBtn');
  const terminalLogs = document.getElementById('terminalLogs');

  let currentPresetKey = 'payment_race';

  // Initialize Default State
  function loadPreset(key) {
    currentPresetKey = key;
    const preset = PRESETS[key];
    if (preset) {
      traceInput.value = preset.raw;
    }
  }

  loadPreset('payment_race');

  // Handle Preset Button Clicks
  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      presetBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const key = btn.getAttribute('data-preset');
      loadPreset(key);
      runScan(key);
    });
  });

  // Gauge calculation: 2 * PI * 42 = ~263.89
  const CIRCUMFERENCE = 264;

  function updateGauge(score, color) {
    const offset = CIRCUMFERENCE - (score / 100) * CIRCUMFERENCE;
    gaugeBar.style.strokeDashoffset = offset;
    gaugeBar.style.stroke = color;
    scoreValue.textContent = score;
    scoreValue.style.color = color;
  }

  // Run AI Risk Scan Simulation
  function runScan(presetKey = currentPresetKey) {
    const data = PRESETS[presetKey] || PRESETS.payment_race;

    // UI Loading state
    scanBtn.disabled = true;
    scanBtnText.textContent = 'Auditing Flow Invariants...';
    scanSpinner.classList.remove('hidden');
    scanStatusBadge.className = 'status-badge status-scanning';
    scanStatusBadge.textContent = 'Scanning Trace...';

    // Simulate AI inference delay (600ms)
    setTimeout(() => {
      scanBtn.disabled = false;
      scanBtnText.textContent = '⚡ Run AI Risk Audit';
      scanSpinner.classList.add('hidden');

      // Update Result View
      scanStatusBadge.className = `status-badge ${data.badgeClass}`;
      scanStatusBadge.textContent = data.severity;

      updateGauge(data.score, data.gaugeColor);
      severityLabel.textContent = data.severity;
      severityLabel.style.color = data.gaugeColor;
      severitySummary.textContent = data.summary;

      // Render Findings
      findingsList.innerHTML = '';
      data.findings.forEach(f => {
        const li = document.createElement('li');
        li.className = `finding-item ${f.type}`;
        li.textContent = f.text;
        findingsList.appendChild(li);
      });

      // Render TestSprite Assertion
      assertionCode.textContent = data.assertion;

      // Add Telemetry Log
      addTelemetryLog('WARN', `Audit complete for ${presetKey}: Risk Index = ${data.score}/100 [${data.severity}]`);
    }, 550);
  }

  // Scan Button Trigger
  scanBtn.addEventListener('click', () => {
    runScan(currentPresetKey);
  });

  // Copy Assertion Button
  copyAssertionBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(assertionCode.textContent).then(() => {
      copyAssertionBtn.textContent = 'Copied!';
      setTimeout(() => {
        copyAssertionBtn.textContent = 'Copy';
      }, 1500);
    });
  });

  // Live Telemetry Terminal Simulation
  function addTelemetryLog(level, message) {
    const line = document.createElement('div');
    line.className = 'log-line';

    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');

    let tagClass = 'info';
    if (level === 'WARN') tagClass = 'warn';
    if (level === 'DANGER') tagClass = 'danger';
    if (level === 'PASS') tagClass = 'pass';

    line.innerHTML = `
      <span class="log-time">[${timeStr}]</span>
      <span class="log-tag ${tagClass}">[${level}]</span>
      <span class="log-msg">${message}</span>
    `;

    terminalLogs.appendChild(line);
    terminalLogs.scrollTop = terminalLogs.scrollHeight;
  }

  // Seed Initial Terminal Logs
  addTelemetryLog('INFO', 'FlowGuard AI daemon initialized on Vercel preview runtime.');
  addTelemetryLog('INFO', 'Observability hooks connected to GitHub repository allfridhosaragii/FlowGuard-AI.');
  addTelemetryLog('PASS', 'TestSprite 3.0 bridge: ready for automated test assertions.');
  addTelemetryLog('INFO', 'Neural invariant parser loaded (latency baseline: 114ms).');

  // Background Telemetry Pulse
  const demoEvents = [
    { lvl: 'INFO', msg: 'Ingress node telemetry verified. 0 dropped packets.' },
    { lvl: 'PASS', msg: 'Periodic memory barrier integrity check: OK.' },
    { lvl: 'INFO', msg: 'Synthesizing edge invariant models from active trace repository.' },
    { lvl: 'INFO', msg: 'Vercel edge router heartbeat: 200 OK.' }
  ];

  let eventIdx = 0;
  setInterval(() => {
    const evt = demoEvents[eventIdx % demoEvents.length];
    addTelemetryLog(evt.lvl, evt.msg);
    eventIdx++;
  }, 6000);

  // Initial trigger to showcase live score immediately
  runScan('payment_race');
});
