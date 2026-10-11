/* Copyright (C) 2026 LIghtJUNction; SPDX-License-Identifier: AGPL-3.0-or-later */
import test from 'node:test';
import assert from 'node:assert/strict';
import { apple, bird } from '../examples/apple-bird/scenes.js';
import { createTimeline } from '../assets/runtime/timeline.js';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

for (const make of [apple, bird]) {
  test(`${make.name}: finite geometry and poses, phone budget, immutable rest samples`, () => {
    const model = make(), rest = JSON.stringify(model.points);
    assert.ok(model.points.length > 10000 && model.points.length <= 22000);
    const scratch = [0,0,0];
    for (const t of [0,.16,.33,.5,1,2,4,8,16]) {
      const pose = model.animate(t);
      for (const p of model.points) {
        assert.ok(p.color.every(c => Number.isFinite(c) && c >= 0 && c <= 255));
        scratch[0]=p.x; scratch[1]=p.y; scratch[2]=p.z; pose(p,scratch);
        assert.ok(scratch.every(Number.isFinite));
        assert.ok(Math.hypot(...scratch) < 1.6);
      }
    }
    assert.equal(JSON.stringify(model.points),rest);
  });
}
test('apple completes a full rotation while stem and leaf retain their distance to the body', () => {
  const model=apple();
  for (const p of [model.points[3000], model.points.find(p=>p.part===1), model.points.find(p=>p.part===2)]) {
    const at=t=>{ const v=[p.x,p.y,p.z]; model.animate(t)(p,v); return v; };
    assert.ok(Math.hypot(...at(0).map((n,i)=>n-at(16)[i])) < 1e-9);
    assert.ok(Math.hypot(at(4)[0]-p.x,at(4)[2]-p.z) > .01);
  }
});
test('bird flaps locally and both shoulder roots remain joined to the body frame', () => {
  const model=bird();
  for (const part of [1,2]) {
    const root=model.points.find(p=>p.part===part && Math.abs(Math.abs(p.x)-.14)<1e-9 && Math.abs(p.y-.06)<1e-9);
    assert.ok(root);
    for (const t of [.1,.3,.5,.7]) {
      const a=[root.x,root.y,root.z], b=[...a], pose=model.animate(t);
      pose(root,a); pose({...root,part:0},b);
      assert.ok(Math.hypot(...a.map((n,i)=>n-b[i]))<1e-9);
    }
    const tip=model.points.find(p=>p.part===part && Math.abs(p.x)>1.2);
    const ys=[.16,.50].map(t=>{const v=[tip.x,tip.y,tip.z]; model.animate(t)(tip,v); return v[1];});
    assert.ok(Math.abs(ys[0]-ys[1])>.7);
  }
});
test('timeline loops, bounds invalid clocks, keeps incoming pose continuous and supports manual selection', () => {
  const timeline=createTimeline([apple(),bird()]);
  assert.equal(timeline.at(NaN).from.id,'apple');
  assert.equal(timeline.at(-10).mix,0);
  assert.equal(timeline.at(timeline.duration).from.id,'bird');
  const before=timeline.at(timeline.duration-1e-6), after=timeline.at(timeline.duration+1e-6);
  assert.equal(before.to.id,after.from.id);
  assert.ok(Math.abs(before.nextAge-after.age)<1e-5);
  assert.equal(timeline.at(timeline.duration*2).from.id,'apple');
  assert.equal(timeline.at(42,1).from.id,'bird');
  assert.equal(timeline.at(42,1).mix,0);
  assert.throws(()=>createTimeline([]));
});
test('starter creates an independent runnable project and refuses to overwrite it', async () => {
  const dir=await mkdtemp(join(tmpdir(),'particle-skill-')), out=join(dir,'demo');
  try {
    const result=spawnSync(process.execPath,['scripts/create-demo.mjs','--out',out],{encoding:'utf8'});
    assert.equal(result.status,0,result.stderr);
    for (const file of ['index.html','app.js','scenes.js','runtime/renderer.js','LICENSE','NOTICE']) assert.ok((await readFile(join(out,file))).length>0);
    const module=await import(`file://${join(out,'scenes.js')}`);
    assert.ok(module.makeScene().points.length>1000);
    const second=spawnSync(process.execPath,['scripts/create-demo.mjs','--out',out],{encoding:'utf8'});
    assert.equal(second.status,1);
    assert.match(second.stderr,/Refusing existing output/);
  } finally { await rm(dir,{recursive:true,force:true}); }
});
