#!/usr/bin/env node
/* Copyright (C) 2026 LIghtJUNction; SPDX-License-Identifier: AGPL-3.0-or-later */
import { chromium } from 'playwright';
import { mkdir, rename, writeFile, stat, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { localServer, launchOptions, root } from './browser-support.mjs';
const out=resolve(root,'output/playwright'), media=resolve(root,'media');
await mkdir(out,{recursive:true}); await mkdir(media,{recursive:true});
const server=await localServer(), browser=await chromium.launch(launchOptions());
const receipt={capture:'Real Chromium viewport with actual mouse input',viewport:{width:1280,height:800},samples:[]};
let context;
try {
  context=await browser.newContext({viewport:receipt.viewport,deviceScaleFactor:1,recordVideo:{dir:out,size:receipt.viewport}});
  const page=await context.newPage(), errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(server.url+'/?capture=1'); await page.waitForSelector('canvas[data-ready="true"]');
  await page.evaluate(()=>document.fonts.ready); await page.mouse.move(20,20);
  const started=Date.now();
  const sample=async name=>receipt.samples.push({name,elapsed:(Date.now()-started)/1000,...await page.evaluate(()=>window.particleDemo.inspect())});
  await sample('apple starts rotating'); await page.waitForTimeout(2500);
  const box=await page.locator('canvas').boundingBox();
  // Movement is actual Playwright mouse input through the normal browser path.
  async function stroke(duration, reverse=false) {
    const began=Date.now(), steps=60;
    for(let i=0;i<=steps;i++) {
      const u=i/steps, x=reverse ? .76-u*.5 : .24+u*.52;
      await page.mouse.move(box.x+box.width*x,box.y+box.height*(.5+Math.sin(u*Math.PI*2)*.13));
      const wait=began+(i+1)*duration/steps-Date.now(); if(wait>0)await page.waitForTimeout(wait);
    }
  }
  await stroke(1500); await sample('mouse scatters apple');
  assert.ok(receipt.samples.at(-1).maxOffset>2);
  await page.mouse.move(20,20); await page.waitForTimeout(1700); await sample('apple reforms');
  assert.ok(receipt.samples.at(-1).maxOffset<.1);
  await page.waitForTimeout(800);
  await page.getByRole('button',{name:'Bird',exact:true}).click(); await page.mouse.move(20,20);
  await page.waitForTimeout(3500); await sample('bird flaps');
  assert.equal(receipt.samples.at(-1).scene,'bird');
  await stroke(1100,true); await sample('mouse brushes bird');
  await page.mouse.move(20,20); await page.waitForTimeout(1600); await sample('bird reforms and keeps flapping');
  assert.ok(receipt.samples.at(-1).maxOffset<.1); assert.deepEqual(errors,[]);
  receipt.contentSeconds=(Date.now()-started)/1000;
  const original=await page.video().path(); await context.close(); context=null;
  const master=resolve(out,'recording.webm'); await rename(original,master);
  const probe=spawnSync('ffprobe',['-v','error','-show_entries','format=duration','-of','json',master],{encoding:'utf8'});
  if(probe.status!==0)throw new Error(probe.stderr);
  const duration=Number(JSON.parse(probe.stdout).format.duration);
  const trim=Math.max(0,duration-receipt.contentSeconds);
  receipt.videoSeconds=duration; receipt.trimStartSeconds=trim;
  const gif=resolve(media,'apple-bird.gif');
  const result=spawnSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-ss',String(trim),'-i',master,
    '-filter_complex','[0:v]fps=18,scale=960:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=192:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=3',
    '-loop','0',gif],{encoding:'utf8'});
  if(result.status!==0)throw new Error(result.stderr);
  receipt.gif={path:'media/apple-bird.gif',width:960,height:600,fps:18,bytes:(await stat(gif)).size};
  const gifProbe=spawnSync('ffprobe',['-v','error','-count_frames','-show_entries','stream=width,height,nb_read_frames:format=duration','-of','json',gif],{encoding:'utf8'});
  if(gifProbe.status!==0)throw new Error(gifProbe.stderr);
  const measured=JSON.parse(gifProbe.stdout), stream=measured.streams[0];
  await writeFile(gif+'.json',JSON.stringify({
    origin:'Real Chromium viewport capture of index.html with actual Playwright mouse movement and scene button clicks; WebM converted using FFmpeg.',
    prompt:'Browser-recorded rotating procedural apple, actual pointer scattering and recovery, followed by a procedural bird flapping its wings. The visible cursor follows actual events. No image generation.',
    source_project:'https://api.lmm.best/',source_revision:'8da4f3994299b7120c44b3fa579db35449a42188',capture_script:'scripts/record-demo.mjs',
    date:new Date().toISOString().slice(0,10),width:stream.width,height:stream.height,frames:Number(stream.nb_read_frames),fps:18,
    duration_seconds:Number(measured.format.duration),bytes:receipt.gif.bytes,sha256:createHash('sha256').update(await readFile(gif)).digest('hex'),
  },null,2)+'\n');
  await writeFile(resolve(out,'recording.json'),JSON.stringify(receipt,null,2)+'\n');
  console.log(JSON.stringify(receipt,null,2));
} finally { if(context)await context.close(); await browser.close(); await server.close(); }
