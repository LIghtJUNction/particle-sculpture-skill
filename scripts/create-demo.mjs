#!/usr/bin/env node
/* Copyright (C) 2026 LIghtJUNction; SPDX-License-Identifier: AGPL-3.0-or-later */
import { cp, access, mkdir, writeFile, rm } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
if (args.length !== 2 || args[0] !== '--out') {
  console.error('Usage: node scripts/create-demo.mjs --out /path/to/new-demo'); process.exit(1);
}
const out = resolve(args[1]);
let exists = true;
try { await access(out); } catch (error) { if (error.code !== 'ENOENT') throw error; exists = false; }
if (exists) { console.error(`Refusing existing output directory: ${out}`); process.exit(1); }
await mkdir(out, { recursive: true });
try {
  await cp(resolve(root, 'assets/starter'), out, { recursive: true });
  await cp(resolve(root, 'assets/runtime'), resolve(out, 'runtime'), { recursive: true });
  await cp(resolve(root, 'LICENSE'), resolve(out, 'LICENSE'));
  await cp(resolve(root, 'NOTICE'), resolve(out, 'NOTICE'));
  await writeFile(resolve(out, 'package.json'), JSON.stringify({ private: true, type: 'module' }, null, 2) + '\n');
  console.log(`Created ${out}\nServe with: python3 -m http.server 4177 --bind 127.0.0.1 --directory "${out}"`);
} catch (error) { await rm(out, { recursive: true, force: true }); throw error; }
