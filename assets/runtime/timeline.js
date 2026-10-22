/* Copyright (C) 2026 LIghtJUNction; SPDX-License-Identifier: AGPL-3.0-or-later */
import { smooth } from './geometry.js';

export const TRANSITIONS = Object.freeze(['disperse', 'morph', 'dissolve', 'cut']);

/** Immutable models; time belongs to the motion owner, not the renderer. */
export function createTimeline(scenes, { hold = 7, morph = 1.6, transition = 'disperse' } = {}) {
  if (!scenes.length || !Number.isFinite(hold) || !Number.isFinite(morph) || hold <= 0 || morph <= 0) {
    throw new Error('Provide at least one scene and positive finite hold/morph durations.');
  }
  const duration = hold + morph;
  const setTransition = value => {
    if (!TRANSITIONS.includes(value)) throw new RangeError(`Unknown transition: ${value}`);
    transition = value;
  };
  setTransition(transition);
  const frame = (from, to, age, nextAge, progress) => ({
    from: scenes[from], to: scenes[to], age, nextAge, transition,
    mix: transition === 'cut' ? Number(progress >= .5) : smooth(progress),
  });
  return {
    scenes,
    duration,
    get transition() { return transition; },
    setTransition,
    at(seconds, selected = null, position = null) {
      const time = Math.max(0, Number.isFinite(seconds) ? seconds : 0);
      // Scroll/navigation progress is independent of the ambient animation clock.
      if (position !== null) {
        const bounded = Math.max(0, Math.min(scenes.length - 1, Number.isFinite(position) ? position : 0));
        const index = Math.floor(bounded);
        return frame(index, Math.min(scenes.length - 1, index + 1), time, time, bounded - index);
      }
      if (selected !== null) {
        const index = Math.max(0, Math.min(scenes.length - 1, Math.floor(Number.isFinite(selected) ? selected : 0)));
        return frame(index, index, time, time, 0);
      }
      const index = Math.floor(time / duration) % scenes.length;
      const phase = time % duration;
      return frame(index, (index + 1) % scenes.length, phase + morph, Math.max(0, phase - hold),
        scenes.length === 1 ? 0 : Math.max(0, Math.min(1, (phase - hold) / morph)));
    },
  };
}
