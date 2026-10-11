/* Copyright (C) 2026 LIghtJUNction; SPDX-License-Identifier: AGPL-3.0-or-later */
import { Shape, TAU, hash, rotate, tint, smooth } from '../../assets/runtime/geometry.js';

/** A lobed apple with a recessed crown, curved stem and a shaped leaf. */
export function apple() {
  const s = new Shape();
  for (let i = 0; i < 17000; i++) {
    const ny = 1 - 2 * (i + .5) / 17000, ring = Math.sqrt(1 - ny * ny);
    const a = i * 2.3999632297, nx = Math.cos(a) * ring, nz = Math.sin(a) * ring;
    const lobes = 1 + .045 * Math.cos(a * 5) * (.35 + .65 * Math.abs(ny));
    const radius = .86 * (1 + .1 * ny) * lobes;
    const crown = Math.exp(-((ring / .25) ** 2));
    const light = .48 + .52 * Math.max(0, -nx * .36 + ny * .58 + nz * .72);
    const stripe = Math.max(0, Math.sin(a * 19 + ny * 9)) ** 12;
    const freckle = hash(i * 3) > .985 ? 30 : 0;
    s.add([nx * radius, .85 * ny - crown * (ny > 0 ? .17 : -.08), nz * radius * .91],
      tint([235 + freckle * .4, 43 + stripe * 48 + freckle, 37 + stripe * 10 + freckle * .5], light));
  }
  s.tube(t => [.025 + .09 * t + .035 * Math.sin(t * Math.PI), .69 + t * .36, .015 - .05 * t],
    .033, [126, 88, 47], 1, 60, 12);
  s.surface(48, 25, (u, v) => {
    const width = Math.sin(Math.PI * u) * .14;
    return [.10 + u * .51, .99 + u * .26 + Math.sin(Math.PI * v) * width * .52,
      -.02 + (v - .5) * width * 2 + u * .09];
  }, (u, v) => tint([100, 173, 62], .55 + .45 * Math.sin(Math.PI * v)), 2);
  s.line([.10, .994, -.02], [.61, 1.25, .07], .007, [170, 199, 95], 2, 35);
  return { id: 'apple', ...s.model(t => {
    const spin = rotate(1, -t * TAU / 16), bob = Math.sin(t * TAU / 4) * .022;
    return (p, v) => { spin(p, v); v[1] += bob; };
  }, [.12, -.08]) };
}

/** Stylized flight: paired shoulder pivots and a delayed outer-wing stroke. */
export function bird() {
  const s = new Shape(), blue = [89, 157, 211], cream = [238, 225, 198];
  s.ellipsoid([0, 0, -.04], [.20, .21, .47], blue, 0, 4000);
  s.ellipsoid([0, -.10, .14], [.17, .15, .31], cream, 0, 1500);
  s.ellipsoid([0, .14, .39], [.16, .17, .19], blue, 0, 1500);
  // A tapered cone rather than a spherical beak.
  s.surface(35, 16, (u, v) => [Math.cos(v * TAU) * .073 * (1-u),
    .13 + Math.sin(v * TAU) * .047 * (1-u) - u * .035, .53 + u * .24],
    (u, v) => tint([235, 176, 83], .7 + .3 * Math.sin(v * Math.PI)), 0);
  for (const side of [-1, 1]) {
    const part = side < 0 ? 1 : 2;
    s.ellipsoid([side * .138, .19, .46], [.019, .024, .024], [12, 25, 37], 0, 110);
    s.ellipsoid([side * .151, .198, .473], [.007, .008, .008], cream, 0, 50);
    for (const face of [-1, 1]) {
      s.surface(70, 22, (u, v) => {
        const chord = .43 * Math.pow(1-u, .65) + .045;
        return [side * (.14 + u * 1.13), .06 + face * Math.sin(Math.PI * v) * .018,
          .13 - u * .5 - v * chord];
      }, (u, v) => tint([71 + u * 31, 127 + u * 30, 184 + u * 28], .58 + .42 * (1-v)), part);
    }
    for (let feather = 0; feather < 8; feather++) {
      const root = .46 + feather * .095;
      s.surface(24, 7, (u, v) => [side * (root + u * (.17 + feather * .009)),
        .05 + Math.sin(u * Math.PI) * .009,
        -.17 - (root-.46) * .38 - u * (.38 - feather * .022) + (v-.5) * Math.sin(u*Math.PI) * .077],
        tint(blue, .65 + feather * .025), part);
    }
    s.surface(32, 15, (u, v) => [side * (.03 + u * .20) + (v-.5) * Math.sin(u*Math.PI) * .09,
      -.02 + u * .06, -.39 - u * .43], (u) => tint(blue, .65 + .25 * u), 0);
  }
  return { id: 'bird', ...s.model(t => {
    const phase = t * TAU * 1.5, flap = .16 + Math.sin(phase) * .68;
    const tip = Math.sin(phase - .7) * .28;
    const shoulder = [rotate(2, -flap, [-.14, .06, .02]), rotate(2, flap, [.14, .06, .02])];
    const outer = [rotate(2, -tip, [-.73, .06, -.16]), rotate(2, tip, [.73, .06, -.16])];
    const bank = rotate(1, Math.sin(t * TAU / 8) * .10), bob = Math.sin(phase * 2) * .025;
    return (p, v) => {
      if (p.part === 1 || p.part === 2) {
        const wing = p.part - 1;
        const bend = smooth(Math.max(0, Math.min(1, (Math.abs(p.x) - .60) / .28)));
        if (bend > 0) {
          // Blend the elbow rotation into the inner wing without an open seam.
          const x = v[0], y = v[1]; outer[wing](p, v);
          v[0] = x + (v[0]-x) * bend; v[1] = y + (v[1]-y) * bend;
        }
        shoulder[wing](p, v);
      }
      bank(p, v); v[1] += bob;
    };
  }, [.62, -.20]) };
}
