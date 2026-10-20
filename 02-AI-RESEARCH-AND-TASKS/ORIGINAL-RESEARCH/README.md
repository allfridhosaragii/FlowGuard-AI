# Riset Model AI Coding: 7 Penyedia (snapshot 20 Oktober 2026, WIB)

**Tujuan:** Memilih model untuk pengembangan FlowGuard AI dan kemungkinan arsitektur tiga agent. **Penting:** penelitian dari sumber publik; **bukan pengujian yang kami jalankan sendiri**. Hasil A/B sosial tidak dapat menjadi peringkat universal. Tautan dan tanggal dibubuhkan untuk reproduksibilitas.

## Kesimpulan praktis

- **Reasoning arsitektur dan penilaian risiko paling kompleks:** uji silang GPT-6.1 Sol, Claude Opus 5.5, GPT-6 Astra, dan Gemini 4 Argon pada tugas yang sama. Jangan otomatis membeli tier tertinggi.
- **Daily coding/refactor & iteration:** Claude Sonnet 5.5, GPT-6.1 Sol, atau Gemini 3.8 Flash; perhatikan batas penggunaan Antigravity.
- **Murah / agent terotomasi:** GPT-6 Luna, Claude Haiku 5.5, DeepSeek V4.1 Flash 1017; model murah dapat lebih baik untuk tugas sempit, tetapi evaluasi tool-use wajib.
- **Open-weight challengers:** GLM-5.3 / Flash, Kimi K3, Qwen3.8-Max dan varian 27B/Flash-Next; periksa kebijakan lisensi, model weights, biaya provider dan sumber daya lokal.
- **FlowGuard MVP:** Requirement Analyst (model kuat), Risk Hunter (model yang berbeda sebagai adversarial review), Verification Planner (model hemat dengan kontrak JSON ketat). **Runner test deterministik** yang memutuskan PASS/FAIL; tidak pernah membiarkan model mengarang hasil pengujian.

## Cara menilai kualitas bukti

| Tingkat | Bukti | Batasan |
|---|---|---|
| A | Eksperimen dengan prompt, cara penilaian, jumlah pengulangan, hasil, dan log/artefak | Tugas bisa kecil atau belum mencerminkan seluruh penggunaan |
| B | Benchmark pihak ketiga yang menjelaskan metode dan harness | Benchmark tertentu tidak mencerminkan produk yang dibangun |
| C | Eksperimen individu dengan prompt/hasil terlihat, tetapi tanpa replikasi | Pengaruh kondisi akun, harness, hardware besar |
| D | Opini, pemasaran vendor, tangkapan layar tanpa metode, rumor | Tidak dipakai untuk menetapkan peringkat |

Catatan: hasil A *bukan* berarti benchmark independen berukuran besar. Replikasi dan tingkat keterbukaan penting.

## Peta model penting per 20 Oktober

| Penyedia | Model yang relevan | Keunggulan yang layak diuji | Risiko yang perlu dicermati |
|---|---|---|---|
| Google | Gemini 4 Argon; 3.8 Flash | Alur kerja kompleks, eksperimen UI/3D, akses Antigravity | Kuota subscription, hasil bervariasi, verifikasi browser tidak konsisten |
| OpenAI | GPT-6 Astra; 6.1 Sol; 6 Luna | Arsitektur, agentic coding, subagent murah | Biaya Astra, latensi dan limit Codex, tetap perlu tes independen |
| Anthropic | Claude Opus 5.5; Sonnet 5.5; Haiku 5.5; Fable 5.1 | Codebase reasoning; Sonnet iterasi; Haiku pencarian kode | Cost/limit Opus; false positive model kecil untuk audit |
| DeepSeek | V4.1 Flash 1017; V4 Pro (historis) | Harga/value, kekuatan coding-agent baru | Token boros, tool-use dapat melenceng, perbedaan harness |
| Qwen | Qwen3.8-Max; Qwen3.8-27B; 3.8-Flash-Next | Local/open-weight, coding skala kecil, kontrol data | Kualitas dipengaruhi quantization, sampling, GPU, kecepatan |
| Kimi | Kimi K3; K2.6 | Codebase long horizon, audit planted bugs | Biaya dan kapasitas saat release, risiko false positives |
| Z.ai | GLM-5.3; 5.3 Flash; 5.2 | Coding agent/open weights, tool use, cost performance | Bench vendor, konfigurasi thinking, sumber daya lokal |

## Bukti eksperimen pengguna yang layak dibaca

1. **9 Okt, tiga Claude, tugas yang sama, kode yang sama.** Dalam tugas pencarian file 48 file nyata: Opus 45, Sonnet 44, Haiku 44; biaya $6.17/$1.38/$0.44. Tetapi pada verifikasi fakta, Haiku memiliki jauh lebih banyak kesalahan/false positive daripada Opus. Data terdiri dari enam tugas nyata, bukan penelitian luas. https://www.reddit.com/r/ClaudeCode/comments/1x1e7ts/i_tested_haiku_55_sonnet_55_and_opus_55_as/
2. **17 Okt, 10 tugas coding × 3 run, hidden tests.** GPT-6 Luna xhigh, Haiku 5.5 high, DeepSeek V4.1 Flash 1017 high, Opus 5.5 low semuanya mencapai 100% pada set mudah yang dipakai. Biaya/tugas masing-masing $0.0145/$0.0208/$0.0450/$0.1168; DeepSeek memakai ~550k token per tugas berbanding ~30k Opus low dan hasil berbeda antar harness. **Kesimpulan: set terlalu mudah untuk membedakan model teratas.** https://www.reddit.com/r/LocalLLaMA/comments/1x8mq6f/deepseek_v41_flash_1017_vs_v41_flash_pi_vs/
3. **13 Okt, prompt Three.js sama, artefak dan waktu.** Gemini 4 Argon 5,5 menit dan $1,58; Claude Opus 5.5 14 menit dan $2,54. Tetapi Opus melakukan inspeksi halaman di browser tiga kali, Argon tidak berhasil menginspeksi hasil visual. **Sampel hanya satu prompt.** https://www.reddit.com/r/ClaudeCode/comments/1x56wuh/gemini_4_argon_vs_claude_opus_55_same_prompt_tiny/
4. **18 Okt, voxel space station dalam satu HTML.** Pembuat menguji Gemini 4 Argon atas prompt sama dengan enam model lain: 18 menit, 13 tool calls; Argon tidak membuka output di browser asli, menggunakan three.js r128 yang sudah tua. Bukan bukti Argon selalu lebih buruk; temuan untuk workflow itu. https://www.reddit.com/r/ClaudeAI/comments/1x94g6o/gemini_4_argon_built_a_voxel_space_station/
5. **16–18 Okt, Tetris Qwen3.8 Flash-Next.** Pembuat pertama tidak berhasil mendapatkan executable pada salah satu run selama empat jam, sedangkan Qwen 27B mampu membuat dan memperbaiki game; reproduksi komunitas dengan harness/sampling/quant lain justru berhasil ~21+27 menit, ada juga 12 menit. **Ini bukti kuat bahwa eksperimen model harus mencatat harness dan quantization.** https://www.reddit.com/r/LocalLLaMA/comments/1x7uf15/i_dont_get_the_qwen_38_flash_next_hype/
6. **16–18 Juli, Kimi K3, rig delapan tugas dan 21 bug sengaja ditanam.** K3 menemukan 14/21; Opus 4.8 12/21, tetapi K3 membuat dua false positive. Satu run per sel dan harness berbeda; launch-day throttling berat. Proyek mencantumkan evaluasi dan keterbatasan: https://github.com/phuryn/experiments/blob/main/kimi-k3-day-one/README.md
7. **30 Agustus, GLM-5.3 Flash self-hosting, log GitHub.** Peneliti independen mendapat 21/26 pada suite campuran (hanya sebagian coding) setelah memperbaiki dua bug harness, dengan pengujian latency/repetition. Tidak boleh dikutip sebagai skor coding murni. https://github.com/PixelML/GLM-5.3-Flash-CMP-170HX
8. **19 Okt, perbedaan DeepSeek-1017 Terminal-Bench 4.0.** Model card 42,3%, Artificial Analysis ~34%, Vals ~31,82% menurut diskusi. Jangan membandingkan angka tanpa memastikan harness dan run policy. https://www.reddit.com/r/LocalLLaMA/comments/1x9owju/deepseekv41flash1017_on_aa_vals_index/
9. **16 Okt, eksperimen pengguna Antigravity.** Laporan individu menghabiskan sekitar separuh kuota Gemini 4 Argon dalam ~12 menit. Ini bukti pengalaman akun tertentu, **bukan** kuota resmi. https://www.reddit.com/r/google_antigravity/comments/1x73yrd/my_thoughts_about_argon_4_in_antigravity_pro_user/
10. **1 Okt, klaim GPT-6.1 Sol memalsukan tes.** Post Reddit populer tetapi tidak cukup untuk membuktikan insiden sistematis; jadikan alasan memastikan log test runner, bukan vonis terhadap model. https://www.reddit.com/r/codex/comments/1wuuc4e/gpt_61_sol_caught_faking_tests/

## Benchmarks independen vs benchmark vendor

- **Artificial Analysis, Gemini 4 Argon High vs Claude Opus 5.5 Xhigh:** Intelligence Index 53 vs 56; Terminal-Bench 4.0 57% vs 60%; AutomationBench-AA 78% vs 65%. Ini perbedaan **konfigurasi dan tugas**, bukan bukti “Opus lebih baik untuk semua”. Sumber: https://artificialanalysis.ai/models/comparisons/gemini-4-argon-vs-claude-opus-5-5-xhigh
- Vendor Qwen3.8-Max melaporkan eksperimen autonomous 16 hari/265 commits/127 PR; angka commit **bukan ukuran kode benar**. https://qwen.ai/blog?id=qwen3.8
- Vendor Z.ai melaporkan GLM-5.3 DeepSWE v1.1 66,9 vs 46,2 pada GLM-5.2; uji mandiri tetap perlu. https://z.ai/blog/glm-5.3
- Vendor Moonshot mempublikasikan Kimi K3 DeepSWE 67,5, Terminal-Bench 2.1 88,3, beserta kondisi harness berbeda. https://github.com/MoonshotAI/Kimi-K3/blob/main/README.md
- DeepSeek V4.1 Flash sekarang sudah diperbarui ke **1017** pada 17 Okt, model API `deepseek-flash` tetap. https://api-docs.deepseek.com/updates/

## Keputusan yang disarankan untuk FlowGuard AI

**Saat hackathon, jangan menukar kemampuan produk dengan tujuh model yang berjalan paralel.** Bangun satu jalur verified end-to-end dulu; ketujuh penyedia masuk sebagai matriks eksperimen off-line.

1. **Baseline model:** GPT-6.1 Sol *atau* Claude Sonnet 5.5 (pilih salah satu berdasarkan akses/kredit yang tersedia).
2. **Risk Hunter tandingan:** dari keluarga model berbeda, misalnya DeepSeek V4.1 Flash 1017 atau GLM-5.3 agar analisis tidak saling mengafirmasi satu model.
3. **Verification Planner:** model hemat seperti GPT-6 Luna/Claude Haiku 5.5 untuk menormalkan skenario ke JSON dengan Zod. Untuk skenario rumit, eskalasi ke model lebih kuat.
4. **Test runner:** Playwright/Vitest/fixture kontrol; PASS/FAIL harus berasal dari proses nyata, bukan model.
5. **Tes A/B pada 7 vendor:** tiga skenario fixture (duplicate refund, safe retry, unauthorized refund), mode identik bila mungkin, tiga run per kasus, catat latency, token, biaya, false positive, bukti reproduksi, tool-call success dan final PR diff.

### Stop conditions

- Tidak bisa menjalankan tes → `UNVERIFIED`, bukan `PASS`.
- Agent menyebut bug tanpa file/line/invariant → `POTENTIAL` saja.
- Model tidak mengikuti schema setelah retry yang dibatasi → gagal aman.
- Input berbentuk source code repo harus diperlakukan untrusted; jangan kirim `.env`, secrets, atau data pelanggan.

## Sumber primer & pengumuman model

- Gemini 4 Argon, 13 Okt: https://blog.google/innovation-and-ai/technology/developers-tools/build-with-gemini-4-argon/
- OpenAI GPT-6.1 Sol: https://openai.com/index/introducing-gpt-6-1-sol/
- Claude Opus 5.5: https://www.anthropic.com/claude-opus-5-5
- Claude Sonnet 5.5: https://www.anthropic.com/claude-sonnet-5-5
- Claude Haiku 5.5: https://www.anthropic.com/claude-haiku-5-5
- DeepSeek V4.1 update 1017: https://api-docs.deepseek.com/updates/
- Qwen3.8 Max: https://qwen.ai/blog?id=qwen3.8
- Kimi K3: https://www.kimi.com/en/blog/kimi-k3
- GLM-5.3: https://z.ai/blog/glm-5.3
- GLM-5.3 Flash: https://z.ai/blog/glm-5.3-flash

**Keterbatasan riset:** Kami tidak menjalankan API berbayar tujuh vendor dan tidak memiliki akses ke posting privat X/TikTok/Discord. Bukti media sosial yang disebut adalah laporan publik penguji, bukan audit independen oleh kami. Tidak ada ranking tunggal valid untuk semua jenis coding. 
