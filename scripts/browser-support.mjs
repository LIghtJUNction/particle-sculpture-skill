/* Copyright (C) 2026 LIghtJUNction; SPDX-License-Identifier: AGPL-3.0-or-later */
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
export const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export async function localServer() {
  // A Python-owned ephemeral port avoids clashing with other development tasks.
  const child = spawn('python3', ['-u', '-c',
    'import http.server; s=http.server.ThreadingHTTPServer(("127.0.0.1",0),http.server.SimpleHTTPRequestHandler); print(s.server_port,flush=True); s.serve_forever()'],
    { cwd: root, stdio: ['ignore','pipe','pipe'] });
  const port = await new Promise((res,rej) => {
    let buffer=''; child.on('error',rej); child.stdout.on('data', chunk => {
      buffer+=chunk.toString(); if (buffer.includes('\n')) res(Number(buffer.split('\n')[0]));
    }); child.once('exit',code=>rej(new Error(`Server exited: ${code}`)));
  });
  return { url: `http://127.0.0.1:${port}`, async close() { child.kill(); await once(child,'exit'); } };
}
export function launchOptions() {
  return process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH, headless: true } : { headless: true };
}
