/* Copyright (C) 2026 LIghtJUNction; SPDX-License-Identifier: AGPL-3.0-or-later */

// Style chooses a composition, not a compulsory palette or animation.
export const STYLES = {
  editorial: { name: 'Editorial crossing', subject: 'Ferry / bridge', title: 'A little space.\nA new direction.', description: 'Paper, generous type and a quiet sculpture that carries the story.', palette: 'neutral', theme: 'light', motion: 'float', transition: 'morph', projection: 'perspective' },
  blueprint: { name: 'Technical atlas', subject: 'Gyroscope / helix', title: 'See how\nit moves.', description: 'Measured lines, compact labels and an object built to be examined.', palette: 'ocean', theme: 'dark', motion: 'articulate', transition: 'dissolve', projection: 'orthographic' },
  gallery: { name: 'Ceramic gallery', subject: 'Vessel / bowl', title: 'Form,\nwithout hurry.', description: 'A warm exhibition space for shape, texture and a deliberate turn.', palette: 'amber', theme: 'light', motion: 'turntable', transition: 'dissolve', projection: 'perspective' },
  botanical: { name: 'Botanical folio', subject: 'Bloom / seed', title: 'Room\nto grow.', description: 'Soft pigment, organic silhouettes and movement from the joints.', palette: 'teal', theme: 'light', motion: 'articulate', transition: 'morph', projection: 'perspective' },
  playful: { name: 'Sculptural play', subject: 'Stack / balance', title: 'Make room\nfor play.', description: 'Bold type, offset solids and a small, buoyant rhythm.', palette: 'rose', theme: 'light', motion: 'breathe', transition: 'disperse', projection: 'orthographic' },
  nocturne: { name: 'Orbital nocturne', subject: 'Knot / orbit', title: 'After hours,\nin orbit.', description: 'A dark stage, luminous pigment and a slow passage through depth.', palette: 'violet', theme: 'dark', motion: 'turntable', transition: 'disperse', projection: 'perspective' },
};

const theme = (ground, ink, muted, accent) => ({ ground, ink, muted, accent, line: muted, onAccent: ground, primary: accent, secondary: muted, highlight: ink });
export const PALETTES = {
  neutral: { name: 'Paper & graphite', light: theme('#f5f1e8','#242923','#596057','#6a5138'), dark: theme('#111714','#edefe4','#b0bcae','#dec38e') },
  ocean: { name: 'Ocean blue', light: theme('#edf4f6','#142a38','#496272','#185b7b'), dark: theme('#0b1722','#e1f0f5','#a6becf','#73c9e8') },
  violet: { name: 'Violet dusk', light: theme('#f4f0f8','#2d2440','#655874','#6b43a5'), dark: theme('#171321','#f1e9fa','#c2b2d3','#c2a0f5') },
  rose: { name: 'Rose clay', light: theme('#fbf0f0','#3d222a','#77515e','#a03b59'), dark: theme('#241319','#f8e5ea','#d8adb9','#f2a3bc') },
  amber: { name: 'Amber sand', light: theme('#faf2e5','#392b1b','#6e5a3c','#8a5512'), dark: theme('#21180d','#f6ebd7','#ceb78f','#eac16f') },
  teal: { name: 'Botanical green', light: theme('#ebf4ee','#1d342a','#4d6b5b','#286649'), dark: theme('#101f19','#e4f1e8','#a6c7b4','#86d1aa') },
};
export const MOTIONS = { turntable: 'Slow turn', float: 'Float & bank', breathe: 'Gentle pulse', articulate: 'Move the parts', static: 'Still pose' };
export const TRANSITIONS = { morph: 'Direct morph', dissolve: 'Seeded dissolve', disperse: 'Disperse & reform', cut: 'Clean cut' };
export const PROJECTIONS = { perspective: 'Perspective', orthographic: 'Orthographic' };
const options = { style: STYLES, palette: PALETTES, theme: { light: true, dark: true }, motion: MOTIONS, transition: TRANSITIONS, projection: PROJECTIONS };

export function resolveDesign(input = {}) {
  const style = input.style ?? 'editorial';
  if (!Object.hasOwn(STYLES, style)) throw new Error(`Unknown style: ${style}`);
  const preset = STYLES[style];
  const design = Object.fromEntries(Object.keys(options).map(key => [key, key === 'style' ? style : input[key] ?? preset[key]]));
  for (const [key, value] of Object.entries(design)) {
    if (!Object.hasOwn(options[key], value)) throw new Error(`Unknown ${key}: ${value}`);
  }
  return design;
}

export const rgb = hex => [1,3,5].map(offset => parseInt(hex.slice(offset, offset + 2), 16));
export function materialColors(design) {
  const colors = PALETTES[design.palette][design.theme];
  return { primary: rgb(colors.primary), secondary: rgb(colors.secondary), accent: rgb(colors.highlight) };
}

/** Scope all palette and layout changes to the supplied host, including its canvas. */
export function applyDesign(host, input) {
  const design = resolveDesign(input), colors = PALETTES[design.palette][design.theme];
  host.dataset.style = design.style;
  host.dataset.theme = design.theme;
  host.style.colorScheme = design.theme;
  for (const key of ['ink','muted','line','accent','onAccent']) host.style.setProperty(`--${key.replace(/[A-Z]/g, letter => '-' + letter.toLowerCase())}`, colors[key]);
  host.style.setProperty('--poster-ground', colors.ground);
  return design;
}
