# FlowGuard AI — Seven AI Model Families: Research & Agent Missions

**Research snapshot:** 20 Oct 2026 WIB. Source: previous FlowGuard AI research package, preserved in `ORIGINAL-RESEARCH/`; **not newly rerun** when assembling this ZIP.

## Cara pakai

1. Baca `01-MULTI-MODEL-WORKFLOW.md` — pembagian kerja agar agent tidak saling konflik.
2. Baca `02-QUALITY-GATES.md` — kriteria semua output.
3. Pilih satu `MODEL-MISSIONS/*.md` sesuai penyedia yang benar-benar tersedia pada tool kamu.
4. Salin bagian **Prompt siap pakai** ke chat agent yang sesuai. Sertakan `01-DESIGN` dan repo docs sebagai konteks.
5. Kumpulkan hasil lewat `03-HANDOFF-AND-REVIEW.md` + eksperimen dari `04-MODEL-EVALUATION.md`.
6. Referensi uji sosial dan pengumuman vendor ada di `ORIGINAL-RESEARCH/`. Jangan jadikan cerita satu posting sebagai jaminan kemampuan model.

## Aturan penelitian

- Kelebihan/kekurangan model adalah **hipotesis praktis** yang memerlukan pembuktian pada FlowGuard, bukan kepribadian permanen suatu model.
- Model tepat bergantung API endpoint, thinking effort, agent harness, tools, context budget, biaya, tanggal, dan prompt.
- Hasil uji sosial dari laporan sebelumnya bukan hasil eksperimen langsung oleh tim FlowGuard.
- `PASS/FAIL` harus dari executor, bukan narasi model.

## Prinsip pembagian kerja

Gemini -> UI prototyping / exploration; GPT -> integration/architecture; Claude -> deep risk review; DeepSeek -> cost-efficient implementation; Qwen -> efficient/local controlled module; Kimi -> long-context cross-file audit; Z.ai -> alternative engineering risk audit. **Semua harus dievaluasi terhadap task yang sama sebelum dianggap terbukti unggul.**

## Current repo reality

Repo existing `allfridhosaragii/FlowGuard-AI` pernah diverifikasi masih simulator client-side. Jangan menyatakan agent sudah live atau metrics valid hanya dari README. Selalu audit HEAD/branch sebelum mulai.
