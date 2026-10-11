/* Copyright (C) 2026 LIghtJUNction; SPDX-License-Identifier: AGPL-3.0-or-later */
import { Shape, TAU, rotate } from './runtime/geometry.js';
export function makeScene() {
  const s = new Shape();
  s.ellipsoid([0,0,0], [.85,.72,.65], [102,182,162], 0, 14000);
  s.ring([0,0,0], 1.12, .025, [234,190,124], 1, 0);
  return { id: 'orb', ...s.model(t => {
    const spin = rotate(1, t*TAU/12), tilt = rotate(2, .3);
    return (p,v) => { tilt(p,v); spin(p,v); };
  }, [.2,-.12]) };
}
