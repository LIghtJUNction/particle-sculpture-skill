/* Copyright (C) 2026 LIghtJUNction; SPDX-License-Identifier: AGPL-3.0-or-later */
import { createTimeline } from '../../assets/runtime/timeline.js';
import { mountSculpture } from '../../assets/runtime/motion.js';
import { apple, bird } from './scenes.js';

const canvas = document.querySelector('#sculpture');
const title = document.querySelector('#scene-title');
const description = document.querySelector('#scene-description');
const pause = document.querySelector('#pause');
const interaction = document.querySelector('#interaction');
const buttons = [...document.querySelectorAll('[data-scene]')];
const labels = {
  apple: ['A little <br><em>gravity.</em>', 'An apple, turning in a field of points.<br>Move through it. Watch it find its shape.'],
  bird: ['A little <br><em>freedom.</em>', 'A bird, finding its rhythm in the air.<br>Brush its wings. Let it come together.'],
};
let lastScene, mode = 'playing';
const motion = mountSculpture(canvas, createTimeline([apple(), bird()]), {
  onFrame(stats) {
    if (lastScene === stats.scene) return;
    lastScene = stats.scene;
    title.innerHTML = labels[stats.scene][0]; description.innerHTML = labels[stats.scene][1];
  },
  onState(state) {
    mode = state;
    pause.textContent = state === 'paused' ? 'Play' : state === 'reduced' ? 'Reduced motion' : 'Pause';
    pause.setAttribute('aria-pressed', String(state === 'paused'));
    pause.disabled = state === 'reduced' || state === 'unsupported';
    interaction.textContent = state === 'reduced' ? 'Reduced motion is on. Choose a sculpture below.' :
      state === 'paused' ? 'Paused. Press Play to continue.' : 'Move to scatter. Leave to reform.';
    if (state === 'unsupported') document.querySelector('.fallback').hidden = false;
  },
});
motion?.select(0);
for (const button of buttons) button.addEventListener('click', () => {
  buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  motion?.select(button.dataset.scene === 'auto' ? null : Number(button.dataset.scene));
});
pause.addEventListener('click', () => motion?.pause());
const theme = document.querySelector('#theme');
theme.addEventListener('click', () => {
  const light = document.documentElement.classList.toggle('light');
  theme.textContent = light ? 'Dark' : 'Light'; theme.setAttribute('aria-label', light ? 'Use dark background' : 'Use light background');
});
// Recording overlay follows actual pointer events; it does not drive the physics.
if (new URLSearchParams(location.search).has('capture')) {
  document.body.classList.add('capture');
  const cursor = document.querySelector('.cursor');
  canvas.addEventListener('pointermove', event => {
    const rect = canvas.getBoundingClientRect();
    cursor.style.transform = `translate(${event.clientX - rect.left}px,${event.clientY - rect.top}px)`;
    cursor.setAttribute('data-active', '');
    if (mode === 'playing') interaction.textContent = 'Brush through the points.';
  });
  canvas.addEventListener('pointerleave', () => {
    cursor.removeAttribute('data-active');
    if (mode === 'playing') interaction.textContent = 'Leave to reform. Back to its own shape.';
  });
}
// Read-only diagnostics for real browser checks, outside the visitor interface.
window.particleDemo = { inspect: () => motion?.inspect() };
window.addEventListener('pagehide', event => { if (!event.persisted) motion?.dispose(); });
