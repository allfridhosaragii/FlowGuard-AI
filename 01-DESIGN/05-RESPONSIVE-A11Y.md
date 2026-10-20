# Responsive & Accessibility Requirements

## Viewports (test actual browser)

- Mobile 320, 360, 375, 390, 430 px; tablet 768; desktop 1024, 1280, 1440 px.
- At <= 768 px lab/editor/result become a single-column layout; status and primary action remain visible without sticky blocking.
- Prevent page-level horizontal scroll; allow dedicated scroll for long code blocks, hash and tables.
- Code line-wrapping optional in editor; never overflow document body.
- Touch targets aim >= 44x44 CSS px, with sufficient spacing.
- Test mobile keyboard opening on textarea; button remains reachable.

## Accessibility

- Semantic headings, nav/main/section, button vs link correct.
- `label` associated with inputs, `aria-describedby` for errors, `aria-live=polite` for asynchronous progress and results; no noisy live regions for every token.
- Keyboard flow: tab order logical, Escape closes dialog, focus moves into/out of modal, visible focus indicator.
- Status text plus icon beyond hue; color contrast minimum WCAG AA: text 4.5:1, large text 3:1; test actual theme.
- Zoom 200%, prefers-reduced-motion supported, no keyboard traps.
- Screen-reader label for code copy button and all icons; decorative SVG `aria-hidden`.
- Fail-safe: user can read generated reports without hover.

## Verification artifacts

Capture responsive screenshots for `/`, `/lab`, `/analyze`, `/about` at 375px & 1440px, plus keyboard run-through, contrast scan, Lighthouse/aXe findings and fix notes. Do not call it WCAG compliant without actual checks.
