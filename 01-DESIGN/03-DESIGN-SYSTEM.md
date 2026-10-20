# UI Design System — Evidence First

## Identitas visual

- **Character:** calm, precise, professional, developer-grade, polished. Bukan cyberpunk/neon dashboard.
- **Default theme:** light; dark opsional jika implementasi/testing selesai.
- **Tone:** technical but approachable; concise labels; no hype.
- **Layout:** max width ~1160px, reading width 680–760px; sidebar hanya jika dibutuhkan.
- **Typography:** Inter/Geist/system for UI; JetBrains Mono/ui-monospace untuk kode, hash, test IDs. Jangan monospace untuk paragraf panjang.
- **Rhythm:** base spacing 4/8 px; 8/12/16/24/32; radius 8–12px; border 1px. Hindari shadows tebal.

## Example light tokens (validasi kontras akhir di browser)

```css
:root {
  --bg: #FAFBFC;
  --surface: #FFFFFF;
  --surface-muted: #F4F6F8;
  --text: #17212B;
  --muted: #536477;
  --border: #D8E0E7;
  --accent: #2457A7;
  --accent-hover: #1C4687;
  --success: #176B45;
  --warning: #8A5B13;
  --danger: #AE2731;
  --focus: #2E6BE6;
  --radius: 10px;
}
```

**Warna tidak pernah menjadi satu-satunya penanda**. Badge harus menampilkan teks `Potential`, `Verified Fail`, `Verified Pass`, `Inconclusive`, `Error` dan ikon/label terkait. Kontras WCAG 2.2 AA perlu diuji; token di atas adalah kandidat, bukan sertifikasi.

## Component primitives

Button (`primary|secondary|ghost|destructive`), Input, Textarea, FieldError, FormHelper, Dialog, Alert, Toast, Tabs, Card, Separator, Badge, Skeleton, CodeBlock, EvidenceTable, Accordion, Stepper/Progress, CopyAction.

## Interaction states setiap kontrol

`idle`, `hover`, `focus-visible`, `disabled`, `pending`, `success`, `error`. Click harus punya outcome nyata. Button yang memanggil API wajib mencegah double submit saat pending; cancel/timeout ditunjukkan jujur. Copy button memberi feedback ketika clipboard berhasil, bukan sebelumnya.

## Hierarchy

Hero: 1 klaim value, 1 subcopy, 2 CTA. Lab: inputs kiri, hasil kanan (desktop), stacked pada mobile; kode panjang dapat di-scroll sendiri. Report: severity + proof scope + source links + evidence dahulu, baru AI explanation.

## Motion

100–200ms microtransition; reduced motion supported; tidak boleh ada artificial scan animation yang memalsukan kerja agent; progress mencerminkan tahapan aktual. Hindari auto-scrolling log palsu.

## Anti-patterns

Tidak boleh ada metrik `99.8% catch rate`, `<120ms`, `Zero-day`, `LIVE FEED` dengan dummy data, badge `TestSprite verified` tanpa check nyata, endpoint tes yang hanya tertulis tapi tidak berjalan.
