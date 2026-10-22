# Design directions

Choose the page's visual argument before tuning the renderer. Use the same brief and comparable viewport sizes for alternatives; do not win a comparison by giving one option better copy or a larger canvas.

## Six executable starting points

Use the exact IDs from `assets/runtime/designs.js`. These combine defaults rather than restricting later edits. The live studio is `assets/starter/index.html`; the CLI exposes the same catalogue through `--list-styles`.

| ID / direction | Composition and type | Geometry and depth | Motion character | Useful for / tradeoff |
| --- | --- | --- | --- | --- |
| `editorial` / Paper & ink | Asymmetric copy/sculpture, spacious readable headline, unframed stage | A ferry with visible hull depth | Restrained float and limited yaw | Human services, introductions, product narrative; needs strong copy |
| `blueprint` / Technical drawing | Grid-led composition, monospaced labels, compact hierarchy | Gyroscope, orthographic projection, visible structure | Local articulation | Tools, infrastructure, explainers; labels must convey actual information |
| `gallery` / Sculpture gallery | Framed exhibit, italic display type, quiet caption and generous negative space | Vessel, near-static framing | Slow turntable or still pose | Craft and premium products; avoid making interaction undiscoverable |
| `botanical` / Living forms | Soft paper, organic spacing, comfortable reading width | Bloom with separate petals | Breathing or local articulation | Ecology, wellbeing, learning; keep growth tied to geometry |
| `playful` / Constructed play | Bold type, offset composition, clear color blocks | Stacked solids with readable gaps | Controlled part motion | Creative tools and approachable brands; constrain bounce and saturation |
| `nocturne` / Night field | Dark stage, spare sans type, low information density | Orbital knot with layered depth | Slow orbital/turntable rhythm | Music, exploration, experimental work; light points are not physical bloom |

Adjust the subject to the product. A ferry makes sense for connection or travel; it is not a required shape for an unrelated business. The built-in scenes are stylized examples, not models of a real object.

## Present three choices without a parameter wall

Present each choice as **name — layout + subject + palette + movement — why it fits / one cost**. Use a comparable still or real short preview when available. If no preview has been rendered, call it a direction sketch.

For an open brief, select one close to the reference, one quieter or more structural, and one with a different visual character. Let the user choose or proceed with the stated recommendation. Once selected, expose independent advanced choices: palette/theme, transition, pose, projection, framing, brush strength. Keep existing brand colors and user overrides unless a reset is explicit.

Example for a collaboration product:

- **Paper connection** — asymmetrical text, a floating ferry, neutral paper/ink, soft dissolve; warm and legible, with restrained spectacle.
- **Visible structure** — monospaced hierarchy, an articulated assembly, ocean tones, orthographic view; explains the mechanism, with a more technical feel.
- **Constructed play** — bold offset type, interacting solids, rose/amber accents, direct morph; welcoming and lively, requiring a tighter motion budget.

## Additional authored directions

These are implementation recipes, not extra ready-made renderer modes. Combine them with the shared runtime only where its capabilities fit.

| Direction | Change the design through | Implementation requirement |
| --- | --- | --- |
| Print / risograph | Limited inks, visible grain, deliberate plate offset, broad typography | Deterministic point colors/offsets; test fine dots at phone scale; no random flicker per frame |
| Typographic sculpture | Real text as the dominant silhouette, dimensional layers and controlled reveal | Sample loaded glyph outlines/layout; keep the DOM heading readable/selectable; handle CJK, wrapping and font fallback |
| Exploded instrument | Part separation, hierarchy and reassembly | Authored part IDs, local pivots, exploded offsets, stable point correspondence; validate the widest pose |
| Liquid / optical | Refractive surfaces, soft volumetric glow or metal | A shader/WebGL renderer and separate performance/fallback work; the bundled Canvas rasterizer does not supply physical materials |

Break a repetitive result by changing its spatial relationship or movement grammar first. A new hue, a different noun inside an identical sphere, or an extra decorative dashboard is not enough.
