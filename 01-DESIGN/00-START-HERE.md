# FlowGuard AI — Design Workspace

**Snapshot:** 20 Oktober 2026 | **Jenis paket:** dokumentasi Markdown untuk agent developer/desainer. Ini bukan file Figma atau kode aplikasi.

## Tujuan folder

Mengubah FlowGuard AI dari demo simulator menjadi developer tool *evidence-first* yang mudah digunakan di desktop/mobile, mempunyai trust states yang jujur, dan siap diuji TestSprite. Semua model yang membuat UI wajib menggunakan file di folder ini sebagai **source of truth**, bukan mengarang visual specification sendiri.

## Urutan baca dan pengerjaan

1. `01-PRODUCT-DESIGN-BRIEF.md` — sasaran, ruang lingkup dan anti-goals.
2. `02-INFORMATION-ARCHITECTURE-AND-FLOWS.md` — halaman dan perjalanan pengguna.
3. `03-DESIGN-SYSTEM.md` — token, komponen, visual hierarchy.
4. `04-SCREEN-SPECS.md` — kontrak layar dan perilaku.
5. `05-RESPONSIVE-A11Y.md` — mobile, keyboard, aksesibilitas.
6. `06-TRUST-AND-UX-WRITING.md` — copy/status risiko yang tidak menyesatkan.
7. `07-UX-TEST-CASES.md` — kriteria penerimaan UI.
8. `08-HANDOFF-PROMPT-FOR-DESIGN-AGENT.md` — instruksi siap tempel.

## Hal paling penting

- P0 = `/`, `/lab`, `/analyze`, `/about`. Jangan memaksakan dashboard, billing, RBAC, peta, social features.
- **Tidak ada fake live metrics**, fake telemetry, fake AI work, fake passing test, atau tombol mati.
- Pembedaan: `POTENTIAL` = dugaan dari analisis; `VERIFIED_FAIL`/`VERIFIED_PASS` = hasil tes pada target yang benar-benar dieksekusi; `INCONCLUSIVE` = bukti kurang; `ERROR` = proses gagal.
- Verifikasi dari *controlled lab* tidak membuktikan bug pada PR luar. Selalu tampilkan cakupan bukti.
- Mulai dari pengalaman demo nyata, baru polish.
- GitHub repo: https://github.com/allfridhosaragii/FlowGuard-AI ; deployment yang diketahui: https://flowguard-ai-smoky.vercel.app/ . Ketersediaan/runtime saat ini perlu diuji ulang.

## Deliverable desain

Inventaris komponen, UI route yang berjalan, responsive screenshots, hasil keyboard/contrast checks, loading/error/empty states, dan mapping UX test ID ke implementasi. Status selesai hanya bila ada bukti.
