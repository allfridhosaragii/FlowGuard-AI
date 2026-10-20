# Information Architecture & User Flows

## Navigation P0

- `/`: Home — CTA `Try Verification Lab`, `Analyze a Public PR`.
- `/lab`: Controlled Verification Lab — test fixture dan evidence.
- `/analyze`: public PR URL + business invariant; hasil hipotesis risiko.
- `/about`: batas kemampuan, privasi, penjelasan badge, referensi GitHub/TestSprite.

Jangan membuat login mandatory, billing, dashboard kosong, atau fitur yang sengaja belum bekerja.

## Flow A — lab (critical path, 6 langkah atau kurang)

1. Home -> Try Lab.
2. Pilih `Vulnerable`.
3. Tentukan idempotency key, retry/concurrent requests, amount.
4. Klik `Run Verification` -> loading state berasal dari pekerjaan nyata.
5. Lihat `VERIFIED_FAIL` berisi observed duplicate side effects dan harness/fixture version.
6. Switch `Fixed` -> `Run Same Test` -> `VERIFIED_PASS` dengan nilai input identik.

Jika negative/control fixture berperilaku tak terduga, tunjukkan `INCONCLUSIVE` atau `ERROR`, bukan pass palsu.

## Flow B — PR Analysis

1. Buka `/analyze`, masukkan URL public PR GitHub yang valid.
2. Masukkan aturan bisnis yang hendak ditegakkan; contoh: `A payment must be refunded at most once per intent.`
3. Klik `Analyze PR` -> metadata repo, nomor PR, commit SHA benar-benar diambil dari GitHub.
4. Tahap tampilan: `Fetch PR → Extract Invariant → Identify Risk → Plan Verification`.
5. Tampilkan risiko `POTENTIAL` dengan path dan lokasi perubahan valid bila tersedia.
6. Sarankan langkah uji; jangan menampilkan `VERIFIED` kecuali kode yang relevan benar-benar dites.

## Flow C — errors

Input URL salah -> inline error + pertahankan isian. GitHub 404/rate limit -> error terarah. Provider AI tidak tersedia -> `Analysis unavailable — no verdict recorded`. Test runner crash -> `Verification could not complete`; jangan menyimpulkan aman.

## Deep linking

Header/nav harus selalu bisa kembali ke Home/Lab/Analyze/About. Report dapat memakai query atau route detail bila backend persisten sudah ada; jangan menambahkan link yang menuju 404. Gunakan hash anchors hanya jika section nyata tersedia.
