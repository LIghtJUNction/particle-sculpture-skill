# Design scope

This skill supports multiple visual directions. Choose one for the user's project, then let its composition, material, camera and rhythm work together. Do not impose a global font, background, card treatment or motion pattern.

## Sources of truth

| Concern | Source |
| --- | --- |
| Workflow and delivery | [SKILL.md](SKILL.md) |
| Style selection and alternatives | [references/design-directions.md](references/design-directions.md) |
| Palette, transition and 3D decisions | [references/color-and-motion.md](references/color-and-motion.md) |
| Executable presets and color values | [assets/runtime/designs.js](assets/runtime/designs.js) |
| Existing Apple / Bird composition | [.impeccable/surfaces/apple-bird.md](.impeccable/surfaces/apple-bird.md) |

## Example boundaries

The root Apple / Bird showcase keeps its Bodoni headlines, green-black / warm-paper palette and understated text controls. Its `.impeccable/design.json` describes that surface only. Its historical screenshots and GIF establish that example's behavior, not the quality of every new style.

The [style studio](assets/starter/index.html) demonstrates independent style, color, transition, motion and camera choices. Presets are curated defaults; change them to fit the brief. Preserve a common runtime and semantic color roles instead of multiplying page templates.

Shared requirements are readable content, recognizable geometry, intentional motion, accessible controls and an honest fallback. Validate the resulting composition at its actual viewport sizes.
