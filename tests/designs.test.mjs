/* Copyright (C) 2026 LIghtJUNction; SPDX-License-Identifier: AGPL-3.0-or-later */
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { STYLES, PALETTES, MOTIONS, resolveDesign, materialColors, rgb } from '../assets/runtime/designs.js';
import { makeScene } from '../assets/starter/scenes.js';

const luminance=hex=>rgb(hex).map(c=>c/255).map(c=>c<=.04045?c/12.92:((c+.055)/1.055)**2.4).reduce((sum,c,i)=>sum+c*[.2126,.7152,.0722][i],0);
const contrast=(a,b)=>{const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
test('all palette themes provide readable text, controls and semantic particle colors',()=>{
  for(const [id,palette] of Object.entries(PALETTES))for(const mode of ['light','dark']) {
    const colors=palette[mode];
    for(const key of ['ink','muted','accent'])assert.ok(contrast(colors[key],colors.ground)>=4.5,`${id}/${mode}/${key}: ${contrast(colors[key],colors.ground)}`);
    assert.ok(contrast(colors.onAccent,colors.accent)>=4.5);
    for(const color of Object.values(materialColors(resolveDesign({palette:id,theme:mode}))))assert.ok(color.every(c=>Number.isFinite(c)&&c>=0&&c<=255));
  }
});
test('presets are overridable across independent axes and reject unknown choices',()=>{
  const design=resolveDesign({style:'blueprint',palette:'rose',theme:'light',motion:'float',transition:'cut',projection:'perspective'});
  assert.equal(design.style,'blueprint');assert.equal(design.palette,'rose');assert.equal(design.motion,'float');assert.equal(design.projection,'perspective');
  for(const key of ['style','palette','theme','motion','transition','projection'])assert.throws(()=>resolveDesign({[key]:'missing'}),new RegExp(`Unknown ${key}`));
  assert.throws(()=>resolveDesign({style:'toString'}),/Unknown style/);
});
test('every style has two distinct real 3D subjects and all motions preserve finite immutable rest samples',()=>{
  const signatures=new Set();
  for(const style of Object.keys(STYLES))for(const variant of [0,1]) {
    const settings={motion:'static'},scene=makeScene(style,settings,variant),rest=JSON.stringify(scene.points);
    assert.ok(scene.points.length>1000&&scene.points.length<=22000,`${scene.id}: ${scene.points.length}`);
    assert.ok(Math.max(...scene.points.map(p=>p.z))-Math.min(...scene.points.map(p=>p.z))>.2,scene.id);
    signatures.add(createHash('sha256').update(rest).digest('hex'));
    const v=[0,0,0];
    for(const motion of Object.keys(MOTIONS))for(const time of [0,.4,1.3,5]) {
      settings.motion=motion;const pose=scene.animate(time);
      for(const p of scene.points) {
        v[0]=p.x;v[1]=p.y;v[2]=p.z;pose(p,v);
        assert.ok(v.every(Number.isFinite)&&Math.hypot(...v)<2,`${scene.id}/${motion}`);
        assert.ok(['primary','secondary','accent'].includes(p.material));assert.ok(p.shade>=0&&p.shade<=1);
      }
    }
    assert.equal(JSON.stringify(scene.points),rest);
  }
  assert.equal(signatures.size,12);
});
test('scaffolder lists styles, validates before writing, and emits portable configured modules',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'particle-design-'));
  const run=(...args)=>spawnSync(process.execPath,['scripts/create-demo.mjs',...args],{encoding:'utf8'});
  try {
    const listing=run('--list-styles');assert.equal(listing.status,0,listing.stderr);for(const style of Object.keys(STYLES))assert.match(listing.stdout,new RegExp(style));
    for(const args of [['--style','missing'],['--palette','missing'],['--transition','fly-away']]) {
      const invalid=run('--out',join(dir,'invalid'),...args);assert.equal(invalid.status,1);assert.match(invalid.stderr,/Unknown/);assert.deepEqual(await readdir(dir),[]);
    }
    const out=join(dir,'demo'),result=run('--out',out,'--style','blueprint','--palette','rose','--theme','light','--motion','float','--transition','cut');
    assert.equal(result.status,0,result.stderr);
    const config=(await import(`file://${join(out,'config.js')}`)).default;
    assert.equal(config.style,'blueprint');assert.equal(config.palette,'rose');assert.equal(config.motion,'float');assert.equal(config.transition,'cut');
    for(const file of ['app.js','scenes.js'])assert.ok(!(await readFile(join(out,file),'utf8')).includes('../runtime/'));
    assert.ok((await import(`file://${join(out,'scenes.js')}`)).makeScene(config.style,config).points.length>1000);
    assert.equal(run('--out',out).status,1);
  } finally {await rm(dir,{recursive:true,force:true});}
});
