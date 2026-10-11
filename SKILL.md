---
name: particle-sculpture
description: Build interactive 3D particle sculptures for websites from a subject or reference, with sampled geometry, articulated motion, scatter-and-reform mouse/touch physics, and real browser GIF capture. Use for point-cloud objects, particle animals, rotating products, and api.lmm.best-style homepage effects.
---

# Particle sculpture

Create real three-dimensional sampled surfaces, animate their parts, then project them into a Canvas point field. The reusable renderer is extracted from [api.lmm.best](https://api.lmm.best/); it needs no React, Three.js, WebGL or runtime package. Preserve its AGPL notices when copying it.

## Start with the subject

Write a short brief: silhouette, recognizable details, color, camera, movement, and interaction. A text-only concept can be stylized. Inspect supplied references before claiming fidelity; one photograph does not establish the unseen side or measured anatomy. Keep a product's actual shape and distinguishing details.

Read [references/architecture.md](references/architecture.md) for the geometry/pose/render contract and tuning. The working apple/bird factories in [examples/apple-bird/scenes.js](examples/apple-bird/scenes.js) show rotation and paired wing joints.

## Use the starter

Run relative to this skill directory:

```sh
node scripts/create-demo.mjs --out /absolute/path/to/new-demo
python3 -m http.server 4177 --bind 127.0.0.1 --directory /absolute/path/to/new-demo
```

The script refuses an existing output directory. It creates a standalone static page, scene, renderer and license. Replace `scenes.js` with the requested model and update the page's title, description and controls. Keep user content and navigation outside the animation canvas. Adapt existing project styling when integrating into a site.

A factory returns `{ id, points, view, animate(seconds) }`. `Shape` samples geometry once. Points contain `x, y, z, color: [r,g,b], part`. `animate(t)` prepares transforms once per frame and returns a deformation that changes only a supplied scratch vector. Never mutate rest points or allocate a new vector for each particle. Tag moving parts; rotate a wing around its shoulder rather than the object origin.

Use the shared `createTimeline` for scatter/reform transitions and `mountSculpture` as the sole animation owner. `select(0)` fixes one scene; `select(null)` enables the sequence. `pause()` freezes the current pose; `dispose()` removes listeners, observers and pixel buffers. Put cleanup in the host framework's unmount hook.

Keep a recognizable silhouette under the 22,000-sample phone budget; the renderer caps desktop samples at 60,000 and pixel ratio at 1.5. Do not solve a poor model by increasing these caps. Keep CSS `--poster-ground` a six-digit hex matching the canvas background. Toggle the root `light` class for a theme update.

## Keep the interaction intact

Use passive pointer/touch listeners and canvas-local CSS-pixel coordinates. Velocity is pixels per second. Native vertical scroll and pinch zoom remain available. Do not intercept links, forms, or page scrolling. Leave the canvas to let the critically damped spring restore the object.

Respect reduced motion and data saving. Freeze the clock and pointer brush when paused; stop requesting frames while hidden or offscreen. Paint a static first frame for reduced motion. Keep a readable fallback if Canvas fails, accessible scene controls, and a pause button. Never add React state updates on every frame or a second RAF loop.

## Verify the actual result

Check finite positions/colors, immutable rest data, meaningful local motion, joined pivots and projected bounds at the requested poses. Check phone/desktop, both themes, scatter/recovery, pause/resume, reduced motion, touch scrolling, hidden/offscreen clocks and disposal in a real browser. A script assertion cannot establish visual quality; inspect the captured object and its movement.

For this repository, run `npm test` and `npm run check:browser` after `npm ci`. For a generated page, reuse the checks that apply and inspect its actual render. Use local checks; this skill does not install CI.

## Record when requested

Read [references/capture.md](references/capture.md), then use `npm run record` for the included apple/bird demo. It records a real Chromium viewport, moves the actual mouse through the sculpture, changes to the bird and converts that recording to GIF with FFmpeg. The optional visible cursor follows real events; it does not simulate particle motion. Review beginning/middle/end and interaction recovery before sharing. Do not label generated stills or a scripted illustration as browser footage.

Report the local files and tests actually run. Publishing a repository, deploying a site, uploading a GIF or posting on X requires that action to be part of the user's request; the skill itself grants no account authorization. Retain a permalink and visible media state for a requested public post.
