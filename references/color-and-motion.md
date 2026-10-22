# Color, transition and 3D choices

Keep these axes independent. A quiet light page can use deep 3D, and a dark page can use static geometry. Treat ranges below as starting values to inspect, not performance or aesthetic guarantees.

## Color roles

Use the paired light/dark palettes in `assets/runtime/designs.js` as executable values. Choose neutral, ocean, violet, rose, amber or teal, then map the host's brand into roles. Avoid duplicating a hex catalogue here.

| Role | Responsibility |
| --- | --- |
| Surface / ink / muted | Canvas ground, readable body text and supporting text |
| Primary / on-primary | Main action and its label; validate this pair independently |
| Secondary / accent | Supporting particle material and sparing emphasis |
| Line / focus | Structural boundaries and visible keyboard location |

Assign a themed point's `material` explicitly (`primary`, `secondary`, `accent`); retain its RGB for fixed product colors or as a fallback. Use material roles for purposeful groups, not a heuristic that decides that every green pixel is primary. The renderer blends coverage/trails against the actual six-digit `--poster-ground`; set it on the canvas or its scoped host. Repaint theme changes even when paused.

Validate each selected light/dark foreground-background pair. Aim for at least 4.5:1 for ordinary text and 3:1 for large text, following [WCAG contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html). Do not interpret a color-pair test as a full accessibility audit. Examine the rendered sculpture too: sparse dots and antialiasing can look faint despite a valid UI palette. Preserve material hue and form; do not apply arbitrary whole-page inversion.

For custom palette transitions, choose the interpolation space explicitly. Interpolating endpoint RGB can pass through dull colors; use a perceptual color path only when implemented and verified, and cap gamut excursions. Keep text and action contrast valid during the transition; an immediate UI theme switch with a gentle object transition is often clearer. The built-in morph interpolates rendered RGB, not OKLCH.

## Transition vocabulary

| Choice | Built in? | Behavior and appropriate use |
| --- | --- | --- |
| `morph` | Yes | Interpolate stable sample indices without the dispersal burst; use related silhouettes and similar surface ordering |
| `dissolve` | Yes | Deterministically replace samples at their respective source/target positions; no geometry travel; useful for unrelated forms |
| `disperse` | Yes | Expand the point field between endpoints and regroup; reserve for a chapter or identity change |
| `cut` | Yes | Switch discretely; useful for deliberate pacing, debugging or a static fallback |
| Directional reveal / scan | Recipe | Gate stable samples by an authored spatial threshold; choose a direction meaningful to the content |
| Part assembly / exploded return | Recipe | Order part groups and animate their own pivots; keep roots and final alignments correct |
| Crossfade / optical wipe | Recipe | Composite layers with defined alpha/occlusion; do not label interpolated positions or seeded replacement as crossfade |

Start with 0.6–1.2s for gentle morph/dissolve and 1.0–1.6s for a deliberate disperse; provide a settled interval long enough to read. These are design suggestions, not fixed runtime defaults. Avoid making every hover, theme change and navigation event a full scene transition. Allow a new target to interrupt from the current state rather than replaying an entrance.

Index-based morphing is a low-cost fallback, not semantic point correspondence. For logos, articulated assemblies or very different point counts, author shared sampling/part IDs or choose dissolve/cut. Check endpoints, midpoint, unequal counts and reversed progress for clipping, noise and unwanted color mixing.

## Separate transforms and progress

| Layer | Choices | Guardrail |
| --- | --- | --- |
| Object pose | Static, float, turntable, breathing, local articulation | Make motion explain mass or structure; do not scale a rigid product to imply breathing |
| Camera | Fixed perspective, orthographic, restrained authored orbit/parallax | Use orthographic for proportion comparison; preserve readable projection and avoid moving camera and object in competing directions |
| Scene progress | Manual, timed sequence, native-scroll seek | Keep ambient time separate from chapter position; reversing scroll must not restart the object's pose |
| Pointer effect | Off, subtle brush, stronger scatter; custom parallax recipe | Preserve touch scrolling and pinch zoom; tune force to the subject and audience |

The studio implements five pose modes and two projection modes. Model `view` controls yaw/pitch; renderer `zoom` controls framing. A moving camera path or pointer-driven camera requires an authored extension; neither is implied by a perspective toggle. Keep anatomy- or mechanism-specific articulation in the scene's pose function.

For float, start around 1–4% of subject height over 4–8s. For a product turntable, start around 12–24s per revolution with a fixed camera. For articulation, determine real attachment points and delay distal parts rather than rotating an entire animal as a substitute. Resolve the settled silhouette before adding secondary motion.

## Scroll stories and fallbacks

Map native document scroll to a bounded fractional scene index and call `owner.seek(position)`. Do not register a second animation loop for the renderer. Keep the current action outside moving chapter copy; measure available travel instead of prescribing a fixed 300vh page. Short viewports, enlarged text and reduced motion should remain usable in normal document flow.

Keep pause independent from scene selection: a user may choose a new static view while ambient motion stays paused. Under [reduced motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion), omit decorative spatial travel, continuous rotation and pointer scattering; allow discrete content selection. Also check data saving, hidden/offscreen state and host disposal. See architecture for the exact runtime API and limits.
