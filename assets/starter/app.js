/* Copyright (C) 2026 LIghtJUNction; SPDX-License-Identifier: AGPL-3.0-or-later */
import { mountSculpture } from './runtime/motion.js';
import { createTimeline } from './runtime/timeline.js';
import { makeScene } from './scenes.js';
const button = document.querySelector('#pause');
const owner = mountSculpture(document.querySelector('canvas'), createTimeline([makeScene()]), {
  onState(state) {
    button.textContent = state === 'paused' ? 'Play' : state === 'reduced' ? 'Reduced motion' : 'Pause';
    button.setAttribute('aria-pressed', String(state === 'paused'));
    button.disabled = state === 'reduced' || state === 'unsupported';
    document.querySelector('#fallback').hidden = state !== 'unsupported';
  },
});
button.addEventListener('click', () => owner?.pause());
window.addEventListener('pagehide', event => { if (!event.persisted) owner?.dispose(); });
