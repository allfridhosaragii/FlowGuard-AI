# Claude — Anthropic

**Terbaru relevan:** Opus 5.5 (22 Sept), Sonnet 5.5 (28 Sept), Haiku 5.5 (7 Okt), Fable 5.1 (1 Sept). Sumber: https://www.anthropic.com/claude-opus-5-5 ; https://www.anthropic.com/claude-sonnet-5-5 ; https://www.anthropic.com/claude-haiku-5-5

**Kelebihan:** Codebase reasoning dan review. Eksperimen terstruktur 9 Okt, enam tugas yang sama: saat menemukan file untuk satu fitur, Opus 45/48, Sonnet 44/48, Haiku 44/48, tetapi biaya Opus $6,17 vs Sonnet $1,38 vs Haiku $0,44. Pada fact-checking dua tulisan, false positive Opus 0, Sonnet 6, Haiku 30 — menunjukkan model murah tidak ideal memutuskan fakta kritis tanpa verifikasi. Anthropic memposisikan Sonnet untuk well-scoped tasks dan Opus untuk penilaian kompleks.

**Kekurangan:** Opus bisa lebih mahal, Sonnet/Haiku dapat mengarang temuan atau gagal menjaga kedalaman audit. Limit penggunaan pada subscription bervariasi dan tidak sama dengan harga API. Fable 5.1 kuat di proyek jangka panjang tetapi jangan diasumsikan selalu tersedia pada semua akun.

**Bukti:** https://www.reddit.com/r/ClaudeCode/comments/1x1e7ts/i_tested_haiku_55_sonnet_55_and_opus_55_as/ ; https://www.reddit.com/r/ClaudeAI/comments/1x4yw9r/claude_really_outdid_everyone_with_opus_55_huh/

**Fit FlowGuard:** Opus sebagai risk-review paling kompleks bila dana tersedia; Sonnet untuk implementasi dan review regular; Haiku untuk lokasi file dan formatting spesifikasi tes yang dicek Zod.
