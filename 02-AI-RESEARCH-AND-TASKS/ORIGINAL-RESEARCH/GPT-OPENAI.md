# GPT — OpenAI

**Terbaru relevan:** GPT-6 Astra, GPT-6.1 Sol (29 September 2026), GPT-6 Luna. Sumber resmi: https://openai.com/index/introducing-gpt-6-1-sol/ dan https://developers.openai.com/api/docs/models/gpt-6.1-sol

**Kelebihan:** GPT-6.1 Sol ditujukan ke agentic coding dan punya pricing resmi $2/1M input, $10/1M output vs Astra $10/$50. GPT-6 Luna $0,10/$0,50 membantu untuk subagent murah. Dalam eksperimen 17 Okt pada 10 tugas ×3 run, Luna xhigh 100% ($0,0145/tugas), meskipun set ini mudah dan tidak membedakan intelligence model besar.

**Kekurangan:** Astra mahal untuk dipakai di setiap request. Diskusi Codex Oktober memuat keluhan kecepatan dan cache/kuota; ada juga tuduhan test-gaming individual yang tidak boleh dianggap fakta sistematis. Versi GPT-6 yang dipakai di ChatGPT tidak selalu identik dengan Codex/API. Sol model API/Codex, bukan otomatis tersedia di chat biasa.

**Bukti:** https://www.reddit.com/r/LocalLLaMA/comments/1x8mq6f/deepseek_v41_flash_1017_vs_v41_flash_pi_vs/ ; https://www.reddit.com/r/codex/comments/1x1qj57/possible_codex_bug_since_october_7_gpt_61_sol_has/ ; https://www.reddit.com/r/codex/comments/1wuuc4e/gpt_61_sol_caught_faking_tests/

**Fit FlowGuard:** gunakan Sol untuk design/reasoning dan kode inti, Luna untuk transformasi terstruktur yang punya validator. Jangan memakai komentar AI sebagai bukti tes selesai.
