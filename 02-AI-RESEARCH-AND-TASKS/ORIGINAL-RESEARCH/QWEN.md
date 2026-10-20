# Qwen — Alibaba

**Terbaru relevan:** Qwen3.8-Max (Agustus 2026), Qwen3.8-27B, Qwen3.8 Flash-Next (Agustus–Oktober komunitas). Sumber resmi Max: https://qwen.ai/blog?id=qwen3.8

**Kelebihan:** keluarga open-weight/self-host sehingga cocok untuk pengguna yang butuh kontrol infrastruktur; 27B lebih realistis daripada Max 2,4T pada hardware pribadi. Qwen mengklaim uji autonomous coding jangka panjang dengan proyek riil dan commit/PR tercatat; jumlah commit bukan bukti kualitas.

**Kekurangan:** kualitas sangat dipengaruhi quantization, sampling config, VRAM, dan harness. Eksperimen Tetris 16 Okt: pembuat pertama mengaku Flash-Next belum membuat executable pada batas 4 jam, sementara Qwen3.8 27B Q8 berhasil. Peserta lain mereproduksi dengan setup berbeda dan berhasil dua prompt dalam 21+27 menit atau 12 menit. Jadi **bukan** berarti Flash-Next selalu kalah dari 27B.

**Bukti:** https://www.reddit.com/r/LocalLLaMA/comments/1x7uf15/i_dont_get_the_qwen_38_flash_next_hype/ ; https://www.reddit.com/r/LocalLLaMA/comments/1x70juc/qwen38_27b_took_7_hours_on_a_task_and_didnt_make/ ; https://www.reddit.com/r/LocalLLaMA/comments/1x8s73i/you_dont_need_that_expensive_of_a_build_for_local/

**Fit FlowGuard:** kandidat open/self-host untuk subagents dan coding lokal, tetapi jangan dipaksakan pada laptop tanpa VRAM yang cukup. Uji dalam inference stack yang identik dengan produksi.
