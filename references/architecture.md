# Geometry → pose → projection → brush → pixels

Origin: [api.lmm.best source at 8da4f399](https://github.com/TokenNotIncluded/api.lmm.best/tree/8da4f3994299b7120c44b3fa579db35449a42188/apps/web/src/features/home).

`assets/runtime/geometry.js` is the original geometry sampler with TypeScript types removed. `renderer.js` extracts the pixel renderer; `motion.js` extracts the lifecycle and pointer smoothing. `timeline.js` replaces the homepage's five chapter registries with a supplied array of scenes. Attribution and license are in `NOTICE` and `LICENSE`.

## The scene contract

Coordinates are x right, y up, z toward the camera. RGB channels are 0–255. `view: [yaw,pitch]` is in radians. Keep an object near the origin; the baseline projected scale is `min(width * .34, height * .35)`. Aim for bounds around ±1.3, and review the widest animated pose. Bird wings can be larger than their body.

Points may add `material: 'primary' | 'secondary' | 'accent'` and `shade` (0–1). Renderer material roles are optional RGB overrides; unmapped points retain `color`. Cache semantic material paint outside the frame loop. Keep a recognizable product's fixed colors instead of recoloring it merely to match a theme.

```js
import { Shape, rotate } from './runtime/geometry.js';
export function makeScene() {
  const shape = new Shape();
  shape.ellipsoid([0,0,0], [.8,.8,.8], [205,128,88], 0, 12000);
  return { id: 'object', ...shape.model(t => {
    const spin = rotate(1, t * .4);
    return (point, scratch) => spin(point, scratch);
  }, [.2,-.1]) };
}
```

`Shape.surface(rows, columns, sample, color, part)` samples a parametric surface. Use `ellipsoid`, `tube`, `line`, `ring`, `box` for solid parts and details. A Fibonacci sphere avoids longitude crowding; a shaped surface is better for a cleft apple, feather or leaf. Do not flatten the subject onto a picture plane.

The pose function runs once per layer per frame. Its returned deformation receives a rest point and a reset scratch array. Precompute sines and pivot transforms in the outer function. Body, shoulder and elbow transforms must compose in the right order; transform the outer wing at its elbow, then the whole wing at its shoulder. Never write into `points`.

## Rendering

1. Evenly sample each model up to the device budget.
2. Deform rest samples into the current pose; apply camera yaw and pitch.
3. Apply the chosen transition: interpolate samples for `morph`; add stable mid-transition offsets for `disperse`; replace a deterministic subset at original endpoints for `dissolve`; choose one endpoint for `cut`.
4. Project with bounded perspective; quantize to the point lattice.
5. Find the shortest distance to the pointer's swept segment. Use velocity plus outward force to displace nearby points.
6. Integrate an analytic critically damped spring back toward the surface. Write dot pixels with a depth buffer, so front surfaces cover the back. Put the finished bitmap onto Canvas once.

The spring uses `omega=20`, `decay=exp(-omega*dt)` and the exact critical-damping step, so recovery does not change dramatically with frame rate. Clamping `dt` to .08s avoids a huge jump after a stall. The pointer owner caps velocity at 1600 CSS px/s and smooths position/velocity with exponential filters. Do not multiply CSS coordinates by the device-pixel ratio before applying forces.

The renderer uses packed RGBA integers and a reused `ImageData`, offset array and depth buffer. Paint is cached by points and theme. Do not replace this with one DOM node per dot or an allocation per point. Rasterization supports ordinary little-endian browser platforms.

## Lifecycle and integration

```js
import { createTimeline } from './runtime/timeline.js';
import { mountSculpture } from './runtime/motion.js';
const owner = mountSculpture(canvas, createTimeline([first(), second()]));
owner.select(0);       // fixed apple; rotation continues
owner.select(null);    // automatic sequence
owner.pause();         // toggle pause, preserving the current pose
owner.dispose();       // host unmount
```

### Independent choices

```js
const timeline = createTimeline([first(), second()], {
  hold: 7, morph: 1.2, transition: 'dissolve',
});
const owner = mountSculpture(canvas, timeline, {
  render: {
    projection: 'orthographic', // or 'perspective'
    zoom: 1, spacing: null, brush: .4,
    materials: { primary: [40, 100, 120], secondary: [95, 100, 90] },
  },
});
timeline.setTransition('morph');
owner.refresh(); // redraw even when paused
owner.configure({ projection: 'perspective', brush: 0 });
owner.seek(.65); // between scenes 0 and 1; ambient time keeps advancing
```

`zoom` accepts .25–2; `spacing` is automatic (`null`) or .75–8 CSS pixels; `brush` accepts 0–2. Changing render options preserves time and pause. Supplying `materials` replaces the complete role map, so send all desired roles. Invalid options fail before replacing working settings. `view` stays a per-model yaw/pitch; projection changes do not create a moving camera.

Use `seek(position)` for continuous manual or native-scroll progress. Clamp at the final scene; do not wrap a story. Fractional progress is separate from ambient pose time and supports reversal. Reduced motion snaps to a discrete scene. `select(index)` remains the backward-compatible integer selection and resets time; `select(null)` starts the timed loop. The host owns scroll measurement and event cleanup, not a second renderer RAF.

Use `applyDesign(host, design)` from `designs.js` for scoped theme/layout tokens and `materialColors(design)` for the render role map. Observe host/canvas theme changes or call `owner.refresh()` for stylesheet changes outside those attributes. The source starter imports `../runtime/`; `create-demo.mjs` rewrites that prefix to `./runtime/` when creating a self-contained directory.

There is one RAF owner. Resize and theme changes invalidate a frame even when paused. Hidden/offscreen canvases stop advancing time; reopening resets wall-clock timing. Reduced motion freezes a real first frame and disables the brush. `saveData` starts paused. Touch listeners are passive and `touch-action: pan-y pinch-zoom` preserves native vertical gestures.

For a static page, dispose on `pagehide` only when `event.persisted` is false. A persisted page belongs to the browser's back/forward cache and must keep its owner for restoration. Framework hosts should instead use their real unmount hook. Do not attach that guarded handler with `once: true`, because a cached departure is not the final departure.

The default caps are 22,000 samples on a narrow canvas, 60,000 on desktop and DPR 1.5; these are upper bounds, not speed guarantees. Resize down respects the narrow budget. Profile the chosen geometry, canvas size and device before raising cost.

This is a software point renderer, not a general-purpose triangle engine. It has no mesh loaders, physical lighting, shadows, collision system or real-device performance guarantee. Large canvases and dense models still consume CPU. Use the phone budget and bound expensive animation.
