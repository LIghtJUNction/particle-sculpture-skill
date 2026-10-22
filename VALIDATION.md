# Local validation

## 2026-10-22 — selectable design directions

Reference: HireFerry revision `4393a467aa91ed0124c6fcbba5e9734ced75e55e`; modified only this skill repository. Version `1.1.0`.

- `npm test`: **15 / 15 passed**. Includes all six original tests, actual rasterized transition/material/projection checks, seek/pause lifecycle checks, palette pair contrast, all twelve models across five motion modes, and configured standalone scaffolding.
- `CHROMIUM_PATH=/tmp/chromium npm run check:browser`: **24 browser check groups passed** (17 original + 7 studio), using Chromium **133.0.6943.0** with the installed Playwright tooling. No runtime dependencies were added.
- Studio: all six styles rendered in both themes; canvas backgrounds matched their scoped CSS tokens. Explicit overrides and pause survived direction changes. All four transitions rendered endpoints and reversed progress. Reduced motion produced discrete chapters. Six palette changes repainted while paused. No JavaScript or failed resource errors.
- Mobile: all six directions fit **390×844** and **320×844** touch viewports without horizontal overflow and stayed within the 22,000-sample limit. Original mouse/touch recovery and native scrolling checks also passed.
- Palette checks: ink, muted text, accent text and button-label/background pairs met **4.5:1** in every built-in palette/theme. This is a token-pair check, not a complete accessibility audit or a contrast guarantee for every rendered particle.
- Skill-creator validation: **valid**. An independent use of the skill produced three distinct directions for a student science-tool site and accurately separated built-in runtime features from custom scene work.
- Visually inspected the six desktop directions and narrow mobile layout. `media/design-directions.webp` assembles actual browser hero captures, with proportional resizing. No generated imagery or simulated animation is presented as footage.

Receipts and original screenshots: ignored `output/playwright/browser-checks.json` and `output/playwright/studio/`. The root Apple / Bird GIF remains the historical recording below; it was not regenerated for this update.

Limits: desktop Chromium emulation, not physical-phone performance testing. The visibility branch is explicitly simulated; offscreen detection is real. Back navigation passed, but the current run did **not** restore from the back/forward cache (`backForwardCache: false`); the persisted-pagehide guard was tested separately. Shader materials and a complete host scroll-story controller remain implementation recipes, not verified built-in features.

## 2026-10-11 — original extraction (historical)

Source extraction: api.lmm.best revision `8da4f3994299b7120c44b3fa579db35449a42188`. The source site's repository was read only; this task creates a separate repository.

## Executed

- `npm test`: **6 / 6 passed**. Finite geometry/poses, immutable rest samples, phone point budget, full apple rotation, shoulder contact, local wing motion, timeline continuity and standalone scaffold refusal to overwrite.
- `CHROMIUM_PATH=/usr/bin/chromium npm run check:browser`: **17 browser checks passed**. Actual first frame, clock progression, real mouse scattering and spring recovery, pause, paused theme refresh, bird selection, automatic sequence, reduced motion, actual offscreen observer, simulated hidden-event handler, disposal, 390px / 320px emulated touch with recovery/native scroll/no overflow, generated standalone starter, real Back navigation with back/forward-cache restoration, guarded persisted departure, and no JavaScript errors.
- Skill-creator `quick_validate.py`: **valid skill**. This validates frontmatter/packaging, not the quality of all possible generated subjects.
- Impeccable detector: degraded regex mode, no findings. Parser dependencies were unavailable; this was **not a computed contrast audit**.
- Browser screenshots inspected: 1280×800 dark/light apple, bird wing pose, pointer scatter, 390×844 and 320×844 phone layouts.
- Independent finish review: **ship** for the two scored fixes, both resolved (back/forward-cache lifecycle and authored SVG external-link arrows). The verdict covers those fixes and the six recaptured views.
- `CHROMIUM_PATH=/usr/bin/chromium npm run record`: **real browser capture completed** with actual input and no JavaScript errors. The recorder verifies apple/bird IDs, displacement during the brush, and spring recovery after leaving.
- GIF inspection: decoded frame count **232**, **960×600**, **18 fps**, **12.89 s**, **7,212,463 bytes**. Beginning/middle/end and wing phases checked in a contact sheet.

Apple: **19,200 points**. Bird: **17,688 points**. Both fit below the 22,000 phone sampling cap.

During the browser interaction check, maximum displacement reached **106.37 CSS pixels** and recovered below **0.00001 pixels** after leaving. During the recorded GIF, the apple reached **50.73 px**, bird **42.19 px**, and both recovered below **0.00001 px**.

GIF SHA-256: `f05b162859d59da654a4a4ec2a620e4a439a0f93303b0006d86a4e7dd3d25d8c`.

## Limits

Touch and phone layouts were checked with desktop Chromium emulation, not physical phones. The hidden-event branch was simulated explicitly in the browser; offscreen pausing used the actual IntersectionObserver. This does not claim measured performance on every browser or device, or a deployment of api.lmm.best itself.

Machine-specific raw captures and JSON receipts live in Git-ignored `output/playwright/`. The final shareable GIF and its provenance are committed in `media/`.
