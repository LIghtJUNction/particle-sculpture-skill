---
name: particle-sculpture
description: Design and build interactive 3D particle sculptures, point-cloud heroes and scroll stories for websites. Offer distinct visual directions, coordinated light/dark palettes, transitions, object motion and camera choices; use the included zero-dependency Canvas runtime or identify when a shader engine is needed. Use for particle objects, animals, products, kinetic point fields, and HireFerry or api.lmm.best-inspired homepages.
---

# Particle sculpture

Compose a readable subject, then choose how it moves. Reuse the Canvas runtime when it fits and retain its AGPL notices. Treat examples as starting points, never a required house style.

## Choose a direction

Inspect the supplied reference and host brand. Write one brief: **message → subject → composition → palette → object motion → camera → transition → interaction**. Preserve recognizable geometry; distinguish stylization from measured fidelity.

Read [design directions](references/design-directions.md) to compare styles. For an open brief, offer three candidates differing in at least three of composition, typography, shape, motion and camera. Recommend one with its tradeoff. Honor an existing choice; proceed with the recommendation if feedback is unavailable. Do not block on a questionnaire or present recolors as distinct designs.

Use [color and motion](references/color-and-motion.md) for independent palette/animation choices and [HireFerry lessons](references/hireferry.md) for composition or scroll stories. Keep text, navigation and the main action usable during transitions.

## Build one shared implementation

Preview the style studio at `assets/starter/index.html` through a static server. Generate a standalone page relative to this skill directory:

```sh
node scripts/create-demo.mjs --list-styles
node scripts/create-demo.mjs --style editorial --out /absolute/path/to/new-demo
python3 -m http.server 4177 --bind 127.0.0.1 --directory /absolute/path/to/new-demo
```

Choose a preset, then override its controls. Share geometry/rendering/lifecycle code across styles. The script refuses existing destinations. Replace demo copy, controls and subjects for the actual brief; scope tokens to the component host.

Read [architecture](references/architecture.md) for the scene contract, render options, scroll binding and lifecycle. Sample immutable geometry once; animate around local pivots into reused scratch vectors. Use one animation owner. Assign `point.material` for themed roles; retain RGB for fixed product colors.

Separate object pose, camera, scene progress and brush. Offer static pose/camera and no brush. Choose morph, seeded dissolve, disperse or cut deliberately. Identify shader-based glass, bloom and physical lighting as extensions.

## Verify the chosen combinations

Run `npm test` and `npm run check:browser` with development dependencies installed. Inspect phone/desktop, selected light/dark palettes, widest poses and transition endpoints/reversal. Verify generated sites themselves; demo results do not certify them.

Check readable DOM/fallback content, keyboard controls, pause/reduced motion, native touch gestures, paused theme updates and lifecycle cleanup. Respect point/DPR budgets; profile before increasing them. Cover chosen combinations and representative boundaries, not every theoretical preset product.

Read [capture](references/capture.md) when recording is requested. Use real browser footage and report completed checks and remaining limits. Publish within the user's authorization.
