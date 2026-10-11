#!/usr/bin/env node
/* Copyright (C) 2026 LIghtJUNction; SPDX-License-Identifier: AGPL-3.0-or-later */
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { localServer, launchOptions, root } from './browser-support.mjs';
const server=await localServer(), browser=await chromium.launch({...launchOptions(),ignoreDefaultArgs:['--disable-back-forward-cache']});
const out=resolve(root,'.impeccable/review'); await mkdir(out,{recursive:true});
const generatedFolder=`output/starter-${Date.now()}-${process.pid}`;
const generatedPath=resolve(root,generatedFolder);
const scaffold=spawnSync(process.execPath,['scripts/create-demo.mjs','--out',generatedPath],{cwd:root,encoding:'utf8'});
assert.equal(scaffold.status,0,scaffold.stderr);
const receipt={checks:[], viewports:[]}, errors=[];
const check = (name, data={}) => receipt.checks.push({name,passed:true,...data});
try {
  const context=await browser.newContext({viewport:{width:1280,height:800},deviceScaleFactor:1});
  const page=await context.newPage(); page.on('pageerror',e=>errors.push(e.message));
  await page.goto(server.url); await page.waitForSelector('canvas[data-ready="true"]');
  await page.evaluate(()=>document.fonts.ready);
  const stats=()=>page.evaluate(()=>window.particleDemo.inspect());
  const canvas=page.locator('canvas'), box=await canvas.boundingBox();
  const first=await stats(); assert.equal(first.scene,'apple'); assert.ok(first.points>10000); check('real first frame',first);
  await page.screenshot({path:resolve(out,'desktop.png')}); receipt.viewports.push('1280x800 dark apple');
  const motionBefore=await stats(); await page.waitForTimeout(250); const motionAfter=await stats();
  assert.ok(motionAfter.time>motionBefore.time); check('animation advances');
  await page.mouse.move(box.x+box.width*.25,box.y+box.height*.5);
  await page.mouse.move(box.x+box.width*.65,box.y+box.height*.5,{steps:18});
  await page.waitForTimeout(160); const brushed=await stats(); assert.ok(brushed.maxOffset>5,JSON.stringify(brushed));
  await page.screenshot({path:resolve(out,'interaction.png')});
  await page.mouse.move(10,10); await page.waitForTimeout(1000); const recovered=await stats();
  assert.ok(recovered.maxOffset<.1,JSON.stringify(recovered)); check('mouse scattering and spring recovery',{peak:brushed.maxOffset,recovered:recovered.maxOffset});
  await page.getByRole('button',{name:'Pause',exact:true}).click(); const paused=await stats();
  await page.waitForTimeout(250); assert.equal((await stats()).time,paused.time); check('pause freezes clock');
  await page.getByRole('button',{name:'Use light background'}).click(); await page.waitForTimeout(80);
  await page.screenshot({path:resolve(out,'desktop-light.png')}); assert.equal((await stats()).time,paused.time); check('paused theme refresh');
  await page.getByRole('button',{name:'Use dark background'}).click();
  await page.getByRole('button',{name:'Play',exact:true}).click();
  await page.getByRole('button',{name:'Bird',exact:true}).click(); await page.waitForTimeout(120);
  assert.equal((await stats()).scene,'bird'); await page.screenshot({path:resolve(out,'bird.png')}); check('bird scene selection');
  await page.getByRole('button',{name:'Auto sequence',exact:true}).click();
  await page.waitForTimeout(7500); assert.ok((await stats()).maxOffset<.1); check('automatic morph runs');
  await page.emulateMedia({reducedMotion:'reduce'}); await page.waitForTimeout(100); const reduced=await stats();
  await page.waitForTimeout(200); assert.equal((await stats()).time,reduced.time);
  assert.equal(reduced.state,'reduced'); assert.ok(await page.getByRole('button',{name:'Reduced motion'}).isDisabled()); check('reduced motion freezes pose and brush');
  await page.emulateMedia({reducedMotion:'no-preference'});
  // Native page scrolling moves the canvas offscreen; its own observer stops time.
  await page.evaluate(()=>{document.body.style.paddingBottom='1600px';});
  await page.evaluate(()=>window.scrollTo(0,1400)); await page.waitForTimeout(120); const offscreen=await stats();
  await page.waitForTimeout(220); assert.equal((await stats()).time,offscreen.time); assert.equal(offscreen.visible,false); check('offscreen clock stops');
  await page.evaluate(()=>{window.scrollTo(0,0); document.body.style.paddingBottom='';});
  // Exercise the visibility handler explicitly; this is a browser-side simulation,
  // separate from the actual offscreen observer check above.
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true}); document.dispatchEvent(new Event('visibilitychange'));});
  const hidden=await stats(); await page.waitForTimeout(220);
  assert.equal((await stats()).time,hidden.time); assert.equal((await stats()).frames,hidden.frames);
  await page.evaluate(()=>{delete document.hidden; document.dispatchEvent(new Event('visibilitychange'));});
  await page.waitForTimeout(60); assert.ok((await stats()).time>hidden.time); check('visibility handler stops and resumes (simulated hidden event)');
  const cleanup=await page.evaluate(async()=>{
    const {mountSculpture}=await import('/assets/runtime/motion.js');
    const {createTimeline}=await import('/assets/runtime/timeline.js');
    const {apple}=await import('/examples/apple-bird/scenes.js');
    const extra=document.createElement('canvas'); extra.style.cssText='width:200px;height:200px'; document.body.append(extra);
    const owner=mountSculpture(extra,createTimeline([apple()])); owner.dispose();
    const before=owner.inspect(); await new Promise(r=>setTimeout(r,100)); const after=owner.inspect();
    const result={width:extra.width,height:extra.height,before:before.frames,after:after.frames}; extra.remove(); return result;
  });
  assert.equal(cleanup.width,0); assert.equal(cleanup.height,0); assert.equal(cleanup.before,cleanup.after); check('dispose clears canvas and stops frames');
  await page.evaluate(()=>window.dispatchEvent(new PageTransitionEvent('pagehide',{persisted:true})));
  assert.ok(await canvas.evaluate(e=>e.width>0)); check('persisted pagehide keeps the canvas owner');
  const marker=await page.evaluate(()=>window.particleCacheMarker=Math.random());
  await page.goto(server.url+'/'+generatedFolder+'/'); await page.waitForSelector('canvas[data-ready="true"]');
  await page.goBack({waitUntil:'commit'}); await page.waitForSelector('canvas[data-ready="true"]');
  const restored=await page.evaluate(()=>window.particleCacheMarker===undefined ? false : window.particleCacheMarker);
  const backBefore=await stats(); await page.waitForTimeout(150); const backAfter=await stats();
  assert.ok(backAfter.time>backBefore.time); check('real Back navigation resumes the sculpture',{backForwardCache:restored===marker});
  await context.close();
  for (const width of [390,320]) {
    const mobile=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1});
    const p=await mobile.newPage(); p.on('pageerror',e=>errors.push(e.message));
    await p.goto(server.url); await p.waitForSelector('canvas[data-ready="true"]'); await p.evaluate(()=>document.fonts.ready);
    assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await p.screenshot({path:resolve(out,width===390?'mobile.png':'mobile-320.png'),fullPage:true}); receipt.viewports.push(`${width}x844 dark apple`);
    const mobileBox=await p.locator('canvas').boundingBox(), session=await mobile.newCDPSession(p);
    await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:mobileBox.x+mobileBox.width*.3,y:mobileBox.y+mobileBox.height*.5}]});
    for (let i=0;i<12;i++) {
      await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:mobileBox.x+mobileBox.width*(.3+i*.035),y:mobileBox.y+mobileBox.height*.5}]});
      await p.waitForTimeout(20);
    }
    const touch=await p.evaluate(()=>window.particleDemo.inspect()); assert.ok(touch.maxOffset>2);
    await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]}); await p.waitForTimeout(900);
    assert.ok((await p.evaluate(()=>window.particleDemo.inspect())).maxOffset<.1);
    assert.match(await p.locator('canvas').evaluate(e=>getComputedStyle(e).touchAction),/pan-y/);
    // Vertical native touch scroll stays available alongside the horizontal brush.
    const scrollBefore=await p.evaluate(()=>scrollY);
    await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:mobileBox.x+mobileBox.width*.5,y:mobileBox.y+mobileBox.height*.7}]});
    for (let i=0;i<12;i++) await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:mobileBox.x+mobileBox.width*.5,y:mobileBox.y+mobileBox.height*.7-i*14}]});
    await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]}); await p.waitForTimeout(150);
    const scrollAfter=await p.evaluate(()=>scrollY); assert.ok(scrollAfter>scrollBefore);
    check(`touch brush, recovery, native scroll and no overflow at ${width}px`,{peak:touch.maxOffset,scrollDelta:scrollAfter-scrollBefore});
    await mobile.close();
  }
  const starter=await browser.newPage(); await starter.goto(server.url+'/'+generatedFolder+'/');
  await starter.waitForSelector('canvas[data-ready="true"]'); check('generated standalone starter renders'); await starter.close();
  assert.deepEqual(errors,[]); check('no browser JavaScript errors');
  await mkdir(resolve(root,'output/playwright'),{recursive:true});
  await writeFile(resolve(root,'output/playwright/browser-checks.json'),JSON.stringify(receipt,null,2)+'\n');
  console.log(JSON.stringify(receipt,null,2));
} finally { await browser.close(); await server.close(); await rm(generatedPath,{recursive:true,force:true}); }
