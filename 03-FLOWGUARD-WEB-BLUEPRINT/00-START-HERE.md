# START HERE — FlowGuard AI Website Build Blueprint
**Updated 20 October 2026 · Language: Bahasa Indonesia for agents, product UI: English.**

## Objective
Berkas ini adalah *execution specification* untuk membangun **FlowGuard AI — AI-Powered Bug Hunting & Risk Detection Platform**, dari simulator statis menuju developer tool yang menghubungkan **business rule → potential risk → test plan → real execution → evidence**.

Kriteria kompetisi resmi Season 4: **40 Project Quality + 40 Tests That Run Themselves + 20 Innovation**, plus engagement bonus. **Top 5 adalah aspirasi, bukan janji/ranking yang dapat dipastikan dari dokumentasi.** Target praktis adalah menunjukkan satu alur end-to-end orisinal yang bisa diulang dan diuji melalui PR.

## Tiga folder paket, satu prioritas
1. **`01-DESIGN/`**: satu-satunya acuan konsistensi UX, navigasi, visual tokens, mobile/a11y, dan tulisan UI.
2. **`02-AI-RESEARCH-AND-TASKS/`**: kekuatan, keterbatasan dan mandat tiap keluarga model serta prosedur anti-konflik; *rekomendasi kerja*, bukan fakta bahwa model selalu mengungguli yang lain.
3. **`03-FLOWGUARD-WEB-BLUEPRINT/`** (folder ini): **source of truth untuk scope produk, alur, arsitektur, kontrak teknis, kualitas, jadwal, demo, dan submission**.

## Urutan baca untuk coding agent
1. `00-START-HERE.md` (file ini).
2. `01-NORTH-STAR-AND-COMPETITION.md` dan `02-PRODUCT-RESEARCH-AND-DIFFERENTIATION.md`.
3. `03-P0-REQUIREMENTS-AND-ACCEPTANCE.md`, `04-USER-JOURNEYS-AND-WEB-CONTENT.md`.
4. `05-ARCHITECTURE-AND-TECH-STACK.md`, `06-AI-AGENTS-AND-ORCHESTRATION.md`, `07-VERIFICATION-LAB.md`, `08-API-DATABASE-AND-CONTRACTS.md`.
5. `09-GITHUB-TESTSPRITE-PR-LOOP.md`, `10-SECURITY-AND-TRUST.md`, `11-TESTING-MATRIX.md`.
6. `12-ROLE-AND-MODEL-TASK-ORDERS.md`, `13-SPRINT-PLAN-AND-SCOPE-CUTS.md`, `14-TOP5-QUALITY-GATES.md`.
7. `15-DEMO-README-AND-SUBMISSION.md`, `16-AUTONOMOUS-BUILD-PROMPT.md`, `17-CURRENT-REPO-MIGRATION.md`.
8. Referensi teknis detail di `REFERENCE-TECHNICAL-BLUEPRINT/` (termasuk `specs/openapi.yaml` dan `specs/schema.sql`).

## Conflict resolution (WAJIB)
- Prioritas konflik: **aturan resmi & kejujuran hasil tes → keamanan → P0 acceptance criteria pada folder 03 → design system folder 01 → model tasks folder 02 → referensi blueprint lama**.
- `03` menentukan *what/why/when/proof*, `01` menentukan *how it looks/behaves*, `02` menentukan *which model executes/reviews*.
- Tidak boleh merepresentasikan uji fixture internal sebagai bukti bahwa bug pada PR eksternal telah dieksekusi.
- **Top 5 tidak dapat dijamin**: semua angka kesiapan dan rubric internal hanyalah proxy; fakta ditentukan juri.

## Immutable project anchors
- Repo existing: `https://github.com/allfridhosaragii/FlowGuard-AI`
- Known Vercel URL: `https://flowguard-ai-smoky.vercel.app/` (cek ulang live sebelum tes).
- Main branch: `main` (jangan force push atau overwrite; branch development + PR).
- TestSprite account/project: telah dibuat berdasarkan screenshot percakapan; **23 test planned ≠ 23 run/passing**.
- Deadline official: **22 October 2026, 23:59 Pacific Time = 23 October 2026, 13:59 WIB**.

## Absolutely do not
- Membangun ulang repo/deploy kosong, membuat README palsu, auto-merge tanpa PR check.
- Hardcode temuan lalu menamai AI inference, menampilkan fake telemetry/akurasi (`99.8%`, `<120ms`, zero-day) atau mock test result sebagai real.
- Menjalankan kode arbitrary GitHub PR pada Vercel atau menjadikan output LLM perintah shell tanpa allowlist.
- Membelokkan prioritas ke billing, multi-language arbitrary code execution, OAuth private repo, atau animasi mewah saat P0 belum lolos.

## End state observable
1. Fixture vulnerable benar-benar melanggar invariant; fixture fixed benar-benar menjaga invariant yang sama.
2. Input lab berubah → evidence berubah; server mengeksekusi kode nyata, bukan replay teks preset.
3. Tiga tahap agent server-side nyata bila provider dikonfigurasi; output tervalidasi Zod.
4. GitHub PR publik dianalisis **read-only**; hasilnya `POTENTIAL` sampai kode target benar-benar diuji.
5. Website dan API sehat, mobile dapat dipakai, happy-path/error-path tested.
6. PR *untuk repo FlowGuard sendiri* menghasilkan preview Vercel dan TestSprite 3.0 automatic check/comment yang dapat dibuka juri.

Mulai dari `17-CURRENT-REPO-MIGRATION.md`, baru tulis kode. Jangan tanya user berulang bila keputusan ada pada dokumen; minta aksi user hanya bila butuh autentikasi/approval eksternal yang memang tidak bisa dilakukan agent.
