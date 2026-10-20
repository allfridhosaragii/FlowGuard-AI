# Kimi — Moonshot AI

**Terbaru relevan:** Kimi K3 (16 Juli 2026), K2.6 dan K2.5 sebagai lini sebelumnya. Sumber: https://www.kimi.com/en/blog/kimi-k3 ; https://www.kimi.com/en/blog/

**Kelebihan:** K3 adalah model besar dengan fokus coding long horizon dan konteks panjang; riset independen di GitHub menggunakan delapan tugas dan planted bugs: K3 mendeteksi 14/21, Opus 4.8 12/21. Ia menyelesaikan atau menyamai beberapa tugas coding frontier pada kasus uji tersebut. Moonshot menerbitkan model card, metode benchmark dan infrastruktur vendor verifier.

**Kekurangan:** dua false positive pada 21 planted bugs; launch day pernah terhambat kapasitas, sehingga proses jadi sangat lama atau DNF walaupun model bisa menyelesaikan tugas setelah server stabil. 2,8T parameters tidak realistis untuk lokal biasa; perhatikan harga provider dan lisensi.

**Bukti:** https://github.com/phuryn/experiments/blob/main/kimi-k3-day-one/README.md ; https://github.com/MoonshotAI/Kimi-K3/blob/main/README.md ; https://www.reddit.com/r/LocalLLM/comments/1x7ntbe/claude_mocking_qwen_38/

**Fit FlowGuard:** challenger untuk audit kode kompleks; jangan menggunakan hasilnya sendiri untuk mengesahkan bug tanpa tes nyata.
