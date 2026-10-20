# Protokol uji adil tujuh keluarga model untuk FlowGuard AI

Snapshot: 20 Oktober 2026 WIB. Ini **rencana tes**, bukan hasil tes yang sudah dijalankan.

## Tujuan

Memilih model untuk requirements reasoning, bug-risk discovery, testcase planning pada TypeScript backend transaksi. Prioritas: *verified correctness per dollar*, bukan skor impresi.

## Fixture

- F1: duplicate refund karena request retry dengan idempotency key yang tidak konsisten.
- F2: desain aman dengan `payment_intent_id` idempotent unik, respons ulang sukses tetapi efek tunggal.
- F3: unauthorized refund endpoint tanpa penegakan role.
- F4: normal refund authorized (negative control; model tidak boleh mencipta bug).
- F5: concurrent inventory decrement, race saat stok=1.
- F6: malformed input yang seharusnya ditolak tanpa mengeksekusi handler.

## Setup adil

1. Simpan `fixture_commit_sha`, `prompt_sha256`, agent/harness version, tanggal, provider endpoint, model version, reasoning effort, seed bila tersedia, budget token, retry, cache, dan jenis tools.
2. Semua model mendapat user story, diff yang sama, dan tool permission yang setara. Jika harness tidak bisa distandarkan, labeli hasil **end-to-end product comparison**, bukan model-only.
3. Jalankan sedikitnya tiga run per fixture per model; acak urutan model; batasi timeout dan biaya setara. Jangan ubah acceptance criteria untuk menyenangkan model.
4. Kode yang dihasilkan tidak dijalankan dengan secrets; gunakan sandbox dan test database ephemeral.
5. Untuk bug discovery, score hanya temuan yang bisa dikaitkan dengan fixture dan hasil test, bukan dugaan.

## Metrik

| Metrik | Definisi |
|---|---|
| Verified recall | Jumlah bug nyata yang ditemukan dan dibuktikan / total planted bugs |
| Precision | Temuan valid dengan bukti / seluruh klaim bug |
| False-positive rate | Temuan bug palsu pada fixture aman |
| Schema adherence | Output JSON diterima Zod / jumlah respons |
| Tool-call success | Pemanggilan tools valid / total calls |
| Test pass reliability | Proporsi pengulangan yang benar-benar berhasil |
| Cost | USD yang benar-benar ditagihkan per verified bug |
| Latency | Durasi wall-clock p50/p95 |
| Reproducibility | Bukti commit, perintah, output dan environment bisa diulang |

## Contoh JSONL per run

```json
{"provider":"example","model":"example-model","fixture":"F1","fixture_sha":"...","run":1,"effort":"high","harness":"flowguard-eval-v1","found":true,"verified":true,"false_positive_count":0,"input_tokens":12000,"output_tokens":3200,"cost_usd":null,"duration_seconds":null,"test_exit_code":1,"evidence_path":"runs/F1/run-001.json"}
```

## Kriteria pemilihan

Utamakan model yang konsisten dalam mengidentifikasi invariant dan kasus negative control. Model yang menemukan banyak bug tetapi sering membuat tuduhan palsu tidak layak untuk status `Verified`. Perbedaan kurang dari 3 tugas pada set 10 tugas jangan diperlakukan sebagai perbedaan berarti tanpa replikasi lebih banyak.
