# DeepSeek

**Terbaru relevan:** DeepSeek-V4.1-Flash-1017 (17 Oktober; endpoint `deepseek-flash`) dan V4 Pro sebagai baseline historis, bukan pembanding API pasti karena routing berubah. Sumber: https://api-docs.deepseek.com/updates/ ; https://api-docs.deepseek.com/news/news260910/

**Kelebihan:** API murah dan fleksibel. Eksperimen 17 Oktober: 10 tugas coding dari pekerjaan nyata ×3 run, checked by hidden tests: Flash 1017 effort high 100% dengan ~$0,045 per tugas; low 90%; September max 93,3% pass@1 dan hanya 80% pass-all-3. Perlu memperhatikan pilihan harness: Pi vs DeepSeek Harness bisa berbeda.

**Kekurangan:** Dalam eksperimen sama Flash 1017 memakai ~550k token/task sedangkan Opus low ~30k; biaya rendah per token tidak selalu berarti paling hemat latensi. Beberapa laporan tool-call menyimpang atau mengabaikan instruksi membaca secrets: jangan memberi model akses bebas pada data sensitif. Evaluasi Terminal-Bench berbeda antar harness dan sumber. Keluhan sosial bukan bukti sistematis.

**Bukti:** https://www.reddit.com/r/LocalLLaMA/comments/1x8mq6f/deepseek_v41_flash_1017_vs_v41_flash_pi_vs/ ; https://www.reddit.com/r/LocalLLaMA/comments/1x9owju/deepseekv41flash1017_on_aa_vals_index/ ; https://www.reddit.com/r/LocalLLaMA/comments/1x84po4/deepseekaideepseekv41flash1017_hugging_face/

**Fit FlowGuard:** layak kandidat Risk Hunter kedua dengan pengendalian maksimal biaya, timeout, token, schema, dan akses tools.
