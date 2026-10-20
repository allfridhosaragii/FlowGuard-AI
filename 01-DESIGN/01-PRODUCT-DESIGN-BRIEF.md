# Product Design Brief — FlowGuard AI

## Problem statement

Developer yang dibantu AI cepat membuat kode, tetapi kesalahan logika bisnis sering tidak kelihatan dari review biasa. FlowGuard membantu menyusun hipotesis risiko dari *business rule* + kode PR, dan memberi bukti verifikasi pada lab yang didukung. Jangan berjanji menyelesaikan semua bug pada semua repo.

## Pengguna utama

1. Solo full-stack developer: ingin tahu apakah perubahan kode mematahkan aturan bisnis.
2. Developer memakai AI coding agent: ingin bukti, bukan kata-kata "looks good".
3. Reviewer engineering: ingin menemukan risiko yang bisa diprioritaskan dan direproduksi.

## One-liner

**Find the business logic your tests missed.**

Subtext: `Turn a business rule and code change into a testable risk hypothesis. Verify supported cases with actual execution evidence.`

## Core jobs-to-be-done

- Ketika mereview sebuah PR, saya ingin tahu invariant apa yang dapat rusak dan di mana dugaan itu muncul.
- Ketika menggunakan lab, saya ingin membandingkan fixture rentan dan diperbaiki dengan parameter yang sama.
- Ketika menerima status risiko, saya ingin tahu apakah hanya dugaan atau sudah ada log test yang membuktikan.

## P0 scope yang boleh diimplementasikan

- Public landing.
- Interactive controlled lab untuk duplicate refund/idempotency dengan input yang sungguh mempengaruhi hasil.
- Public GitHub PR analyser *read-only* (jika backend AI benar-benar dikonfigurasi), status `POTENTIAL` saja.
- Evidence report, validasi input, kegagalan yang jelas, metadata commit/fixture.
- Responsif, keyboard usable, TestSprite-ready.

## P1 dan P2 — jangan kerjakan sebelum P0 hijau

P1: saved reports, export JSON, second supported invariant. P2: GitHub App FlowGuard sendiri, private repos, arbitrary-code sandboxing, billing, teamwork, advanced observability. **TestSprite GitHub App** untuk lomba adalah integrasi yang berbeda.

## Non-goals

- Bukan antivirus, zero-day scanner, production payments, SAST untuk semua bahasa, compiler, atau CI pengganti TestSprite.
- Jangan menampilkan skenario demo sebagai hasil audit repository pengguna.
- Jangan menaruh API key di browser.

## Value proposition dan north-star signal

Value proposition: developer dapat melihat bukti test untuk satu invariant dengan cara yang dapat diulang. Leading metric P0: pengguna dapat mengulang `vulnerable FAIL -> fixed PASS` dengan parameter identik, tanpa log atau status yang dimanipulasi.

## Design trade-off

Kejelasan sumber bukti > visual futuristik; UX cepat > efek animasi; cakupan sempit yang jujur > dashboard kaya fitur yang belum bekerja.
