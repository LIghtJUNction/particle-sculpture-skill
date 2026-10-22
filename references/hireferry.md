# HireFerry: reference principles, not another fixed template

Reference revision: [`4393a467aa91ed0124c6fcbba5e9734ced75e55e`](https://github.com/TokenNotIncluded/hireferry/commit/4393a467aa91ed0124c6fcbba5e9734ced75e55e). The observations below come from its source; source inspection alone does not certify a deployed render.

| Observed implementation | Transferable decision |
| --- | --- |
| Continuous paper/ink ground, borderless sculpture and spacious type | Compose text and sculpture together; framing and background remain a brand choice |
| Ferry → bridge → compass paired with three service chapters | Give the model a semantic job; keep one clear message per scene |
| Stable action buttons outside switching copy | Keep navigation and conversion controls predictable during motion |
| Six paired theme palettes and particle material mapping | Share semantic roles across interface and sculpture; recolor both when a theme changes |
| Fractional timeline seek with independent ambient time | Let scroll choose scene progress without restarting pose animation |
| Local boat, wake, bridge and needle movement | Separate whole-object motion, part articulation, camera and brush disturbance |
| Actual DOM glyph sampling for particle titles | Preserve selectable DOM text and handle loaded fonts, wrapping and fallbacks before replacing its visual layer |

## Inspect only what the task needs

- Composition and native page behavior: [app.css](https://github.com/TokenNotIncluded/hireferry/blob/4393a467aa91ed0124c6fcbba5e9734ced75e55e/static/app.css), [app.js](https://github.com/TokenNotIncluded/hireferry/blob/4393a467aa91ed0124c6fcbba5e9734ced75e55e/static/app.js).
- Palette roles: [theme-palettes.json](https://github.com/TokenNotIncluded/hireferry/blob/4393a467aa91ed0124c6fcbba5e9734ced75e55e/static/theme-palettes.json), [renderer.js](https://github.com/TokenNotIncluded/hireferry/blob/4393a467aa91ed0124c6fcbba5e9734ced75e55e/static/runtime/renderer.js).
- Scene semantics and articulation: [scenes.js](https://github.com/TokenNotIncluded/hireferry/blob/4393a467aa91ed0124c6fcbba5e9734ced75e55e/static/scenes.js).
- Reversible scroll progress: [home-story.js](https://github.com/TokenNotIncluded/hireferry/blob/4393a467aa91ed0124c6fcbba5e9734ced75e55e/static/home-story.js), [timeline.js](https://github.com/TokenNotIncluded/hireferry/blob/4393a467aa91ed0124c6fcbba5e9734ced75e55e/static/runtime/timeline.js).
- Text fallback strategy: [particle-type.js](https://github.com/TokenNotIncluded/hireferry/blob/4393a467aa91ed0124c6fcbba5e9734ced75e55e/static/particle-type.js).

Borrow the decisions, then choose the project's own shapes, type and pace. Do not turn its paper palette, three chapters, ferry, long sticky section or scatter/reform effect into universal requirements. Keep the built-in Canvas capability distinct from shader-based materials and from a complete scroll-story controller that the host still has to implement.
