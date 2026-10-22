#!/usr/bin/env node
/* Copyright (C) 2026 LIghtJUNction; SPDX-License-Identifier: AGPL-3.0-or-later */
import { cp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { STYLES, resolveDesign } from '../assets/runtime/designs.js';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const usage = 'Usage: node scripts/create-demo.mjs --out /path/to/new-demo [--style editorial] [--palette ocean] [--theme light|dark] [--motion float] [--transition morph] [--projection perspective]\n       node scripts/create-demo.mjs --list-styles';
async function main(args) {
  if(args.length===1&&args[0]==='--list-styles') {
    for(const [id,style] of Object.entries(STYLES))console.log(`${id.padEnd(12)} ${style.name} · ${style.subject} · ${style.palette}/${style.theme} · ${style.motion}`);
    return;
  }
  if(args.length===1&&args[0]==='--help') {console.log(usage);return;}
  const values={};
  for(let i=0;i<args.length;i+=2) {
    const key=args[i].slice(2),value=args[i+1];
    if(!args[i].startsWith('--')||!['out','style','palette','theme','motion','transition','projection'].includes(key)||!value||value.startsWith('--')||Object.hasOwn(values,key))throw new Error(usage);
    values[key]=value;
  }
  if(!values.out)throw new Error(usage);
  const {out:output,...choices}=values,design=resolveDesign(choices),out=resolve(output);
  await mkdir(dirname(out),{recursive:true});
  try {await mkdir(out);}
  catch(error) {if(error.code==='EEXIST')throw new Error(`Refusing existing output directory: ${out}`);throw error;}
  try {
    await cp(resolve(root,'assets/starter'),out,{recursive:true});
    await cp(resolve(root,'assets/runtime'),resolve(out,'runtime'),{recursive:true});
    // The source studio runs at assets/starter/. Generated projects keep runtime/ beside app.js.
    for(const file of ['app.js','scenes.js']) {
      const path=resolve(out,file),source=await readFile(path,'utf8');
      await writeFile(path,source.replaceAll("from '../runtime/","from './runtime/"));
    }
    await writeFile(resolve(out,'config.js'),`/* SPDX-License-Identifier: AGPL-3.0-or-later */\nexport default ${JSON.stringify(choices,null,2)};\n`);
    await cp(resolve(root,'LICENSE'),resolve(out,'LICENSE'));
    await cp(resolve(root,'NOTICE'),resolve(out,'NOTICE'));
    await writeFile(resolve(out,'package.json'),JSON.stringify({private:true,type:'module'},null,2)+'\n');
    console.log(`Created ${out} (${design.style}, ${design.palette}, ${design.theme})\nServe with: python3 -m http.server 4177 --bind 127.0.0.1 --directory "${out}"`);
  } catch(error) {await rm(out,{recursive:true,force:true});throw error;}
}
try {
  await main(process.argv.slice(2));
} catch(error) {console.error(error.message);process.exitCode=1;}
