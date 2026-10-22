/* Copyright (C) 2026 LIghtJUNction; SPDX-License-Identifier: AGPL-3.0-or-later */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createTimeline, TRANSITIONS } from '../assets/runtime/timeline.js';
import { createRenderer } from '../assets/runtime/renderer.js';
import { mountSculpture } from '../assets/runtime/motion.js';

const pointer = { x: 0, y: 0, previousX: 0, previousY: 0, vx: 0, vy: 0, active: false };
const scene = (id, x, z = 0) => ({
  id, points: Array.from({ length: 40 }, (_, i) => ({ x, y: (i - 20) / 50, z, color: [220, 160, 80] })),
  animate: () => () => {},
});

function environment(t) {
  const globals = new Map(), callbacks = new Map(), observers = [];
  let id = 0, ground = '#070707';
  const events = () => ({ addEventListener() {}, removeEventListener() {} });
  const root = { ...events(), className: '', parentElement: null };
  const host = { ...events(), parentElement: root };
  const reduced = { ...events(), matches: false };
  const document = { ...events(), documentElement: root, hidden: false };
  class Observer {
    nodes = []; disconnected = false;
    constructor(callback) { this.callback = callback; observers.push(this); }
    observe(node) { this.nodes.push(node); }
    disconnect() { this.disconnected = true; }
  }
  for (const [key, value] of Object.entries({
    document, window: { devicePixelRatio: 1 }, navigator: {}, innerWidth: 1280,
    getComputedStyle: () => ({ getPropertyValue: () => ground }),
    requestAnimationFrame: callback => { callbacks.set(++id, callback); return id; },
    cancelAnimationFrame: key => callbacks.delete(key),
    matchMedia: query => query.includes('reduced-motion') ? reduced : { ...events(), matches: true },
    ResizeObserver: Observer, IntersectionObserver: Observer, MutationObserver: Observer,
  })) {
    globals.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  }
  t.after(() => {
    for (const [key, descriptor] of globals) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  });
  const canvas = {
    ...events(), parentElement: host, dataset: {}, clientWidth: 320, clientHeight: 240, width: 0, height: 0,
    getBoundingClientRect: () => ({ left: 0, top: 0 }),
    getContext: () => ({
      createImageData: (w, h) => ({ data: new Uint8ClampedArray(w * h * 4) }),
      putImageData: bitmap => { canvas.pixels = new Uint32Array(bitmap.data.buffer).slice(); },
    }),
  };
  return {
    canvas, reduced, observers, callbacks,
    setGround(value) { ground = value; },
    step(now) {
      const scheduled = [...callbacks.values()]; callbacks.clear();
      for (const callback of scheduled) callback(now);
    },
  };
}

function painted(canvas) {
  const background = canvas.pixels[0];
  return [...canvas.pixels.entries()].filter(([, value]) => value !== background)
    .map(([index, value]) => ({ x: index % canvas.width, y: Math.floor(index / canvas.width), value }));
}

test('all transitions reach exact endpoints, loop continuously and retain ambient time under seek', () => {
  const scenes = [scene('left', -.8), scene('right', .8)];
  for (const transition of TRANSITIONS) {
    const timeline = createTimeline(scenes, { transition });
    assert.equal(timeline.at(0).mix, 0);
    assert.equal(timeline.at(42, null, 0).mix, 0);
    assert.equal(timeline.at(42, null, 1).from, scenes[1]);
    const seek = timeline.at(42, null, .7);
    assert.equal(seek.age, 42); assert.equal(seek.nextAge, 42);
    const before = timeline.at(timeline.duration - 1e-7), after = timeline.at(timeline.duration + 1e-7);
    assert.equal(before.to, after.from);
    assert.ok(Math.abs(before.nextAge - after.age) < 1e-6);
    assert.equal(timeline.at(3, null, -50).from, scenes[0]);
    assert.equal(timeline.at(3, null, 100).from, scenes[1]);
    timeline.setTransition('morph'); assert.equal(timeline.transition, 'morph');
    assert.throws(() => timeline.setTransition('magic'), /Unknown transition/);
    assert.equal(timeline.transition, 'morph');
  }
});

test('dissolve replaces stable subsets at their original positions; morph moves and cut switches', t => {
  const { canvas } = environment(t);
  const timeline = createTimeline([scene('left', -.8), scene('right', .8)]);
  const renderer = createRenderer(canvas, timeline, undefined, { projection: 'orthographic', spacing: 1 });
  t.after(() => renderer.dispose());
  timeline.setTransition('morph'); renderer.draw(10, pointer, 0, true, null, .5);
  assert.ok(painted(canvas).every(p => p.x >= 159 && p.x <= 161));
  timeline.setTransition('dissolve'); renderer.draw(10, pointer, 0, true, null, .5);
  const points = painted(canvas), first = canvas.pixels.slice();
  assert.ok(points.some(p => p.x < 100)); assert.ok(points.some(p => p.x > 220));
  assert.ok(points.every(p => p.x < 100 || p.x > 220), 'dissolve must not interpolate positions');
  renderer.draw(10, pointer, 0, true, null, .5); assert.deepEqual(canvas.pixels, first);
  timeline.setTransition('cut'); renderer.draw(10, pointer, 0, true, null, .49);
  assert.ok(painted(canvas).every(p => p.x < 100));
  renderer.draw(10, pointer, 0, true, null, .5); assert.ok(painted(canvas).every(p => p.x > 220));
});

test('semantic material updates preserve shading and rest points, while unmapped colors remain valid', t => {
  const { canvas, setGround } = environment(t), model = scene('material', 0);
  model.points.forEach(p => { p.material = 'primary'; p.shade = .5; });
  const rest = JSON.stringify(model.points);
  const renderer = createRenderer(canvas, createTimeline([model]), undefined,
    { materials: { primary: [240, 40, 20] }, spacing: 1 });
  t.after(() => renderer.dispose());
  renderer.draw(0, pointer, 0, true);
  const red = painted(canvas)[0].value; assert.ok((red & 255) > ((red >>> 16) & 255) * 4);
  renderer.configure({ materials: { primary: [20, 40, 240] } });
  renderer.draw(0, pointer, 0, true);
  const blue = painted(canvas)[0].value; assert.ok(((blue >>> 16) & 255) > (blue & 255) * 4);
  assert.ok(((blue >>> 16) & 255) < 125, 'explicit half shading survives palette substitution');
  assert.throws(() => renderer.configure({ materials: { primary: [NaN, 0, 0] } }), /Invalid RGB/);
  renderer.draw(0, pointer, 0, true); assert.equal(painted(canvas)[0].value, blue);
  setGround('#f4f0e8'); renderer.invalidateTheme(); renderer.draw(0, pointer, 0, true);
  assert.equal(canvas.pixels[0] & 255, 244);
  renderer.configure({ materials: {} }); renderer.draw(0, pointer, 0, true);
  assert.ok(painted(canvas).length > 0);
  assert.equal(JSON.stringify(model.points), rest);
});

test('projection and framing choices alter depth and scale without invalid render configurations', t => {
  const { canvas } = environment(t);
  const renderer = createRenderer(canvas, createTimeline([scene('depth', .6, 2)]), undefined, { spacing: 1 });
  t.after(() => renderer.dispose());
  renderer.draw(0, pointer, 0, true); const perspectiveX = painted(canvas)[0].x;
  renderer.configure({ projection: 'orthographic' }); renderer.draw(0, pointer, 0, true);
  const orthographicX = painted(canvas)[0].x; assert.ok(perspectiveX > orthographicX + 8);
  renderer.configure({ zoom: .5 }); renderer.draw(0, pointer, 0, true);
  assert.ok(painted(canvas)[0].x < orthographicX - 20);
  for (const option of [{ zoom: NaN }, { spacing: 0 }, { brush: -1 }, { projection: 'fish-eye' }]) {
    assert.throws(() => renderer.configure(option), RangeError);
  }
});

test('owner seeks without resetting clock, updates paused palettes, snaps reduced-motion chapters and disposes observers', t => {
  const env = environment(t), timeline = createTimeline([scene('left', -.8), scene('right', .8)], { transition: 'morph' });
  const owner = mountSculpture(env.canvas, timeline);
  env.step(100); env.step(134); const before = owner.inspect();
  owner.seek(.3); env.step(168);
  assert.ok(owner.inspect().time > before.time); assert.equal(owner.inspect().position, .3);
  owner.pause(); env.step(200); const paused = owner.inspect();
  owner.seek(.7); owner.configure({ projection: 'orthographic' }); env.step(234);
  assert.equal(owner.inspect().time, paused.time); assert.equal(owner.inspect().state, 'paused');
  assert.equal(owner.inspect().projection, 'orthographic'); assert.equal(env.callbacks.size, 0);
  assert.ok(env.observers.some(observer => observer.nodes.includes(env.canvas.parentElement)), 'observe host theme');
  env.reduced.matches = true; owner.seek(.49); env.step(268);
  assert.ok(painted(env.canvas).every(p => p.x < 100), 'reduced motion shows a discrete chapter');
  assert.equal(owner.inspect().time, paused.time);
  owner.seek(.51); env.step(302); assert.ok(painted(env.canvas).every(p => p.x > 220));
  owner.select(null); env.step(336); assert.equal(owner.inspect().position, null);
  owner.dispose(); owner.refresh();
  assert.ok(env.observers.every(observer => observer.disconnected));
  assert.equal(env.callbacks.size, 0); assert.equal(env.canvas.width, 0);
});
