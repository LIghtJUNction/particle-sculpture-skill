#!/usr/bin/env node
/* Copyright (C) 2026 LIghtJUNction; SPDX-License-Identifier: AGPL-3.0-or-later */
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { STYLES, PALETTES } from '../assets/runtime/designs.js';
import { localServer, launchOptions, root } from './browser-support.mjs';

const server = await localServer();
let browser;
const out = resolve(root, 'output/playwright/studio');
const receipt = { checks: [], screenshots: [] }, errors = [];
const check = name => receipt.checks.push({ name, passed: true });
const inspect = page => page.evaluate(() => window.particleStudio.inspect());
async function settle(page) {
  await page.locator('canvas').scrollIntoViewIfNeeded();
  await page.waitForSelector('canvas[data-ready="true"]');
  await page.waitForTimeout(100);
}
async function assertPainting(page) {
  const result = await page.locator('canvas').evaluate(canvas => {
    const { data } = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
    let colored = 0;
    for (let i = 4; i < data.length; i += 4) {
      if (data[i] !== data[0] || data[i + 1] !== data[1] || data[i + 2] !== data[2]) colored++;
    }
    return { colored, background: [...data.slice(0, 3)], ground: getComputedStyle(canvas).getPropertyValue('--poster-ground').trim() };
  });
  assert.ok(result.colored > 300, `Expected a visible sculpture: ${JSON.stringify(result)}`);
  assert.deepEqual(result.background, [1, 3, 5].map(i => Number.parseInt(result.ground.slice(i, i + 2), 16)));
}
try {
  browser = await chromium.launch(launchOptions());
  await mkdir(out, { recursive: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1050 } });
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  for (const [style, preset] of Object.entries(STYLES)) {
    await page.goto(`${server.url}/assets/starter/?style=${style}`);
    await settle(page);
    assert.equal((await inspect(page)).design.style, style);
    assert.ok(await page.locator('#title').isVisible());
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await assertPainting(page);
    await page.getByRole('button', { name: 'Pause', exact: true }).click();
    await settle(page);
    const paused = await inspect(page);
    await page.screenshot({ path: resolve(out, `${style}.png`), fullPage: true });
    await page.locator('.hero').screenshot({ path: resolve(out, `${style}-hero.png`) });
    receipt.screenshots.push(`${style}.png`);
    await page.selectOption('#theme', preset.theme === 'light' ? 'dark' : 'light');
    await settle(page);
    assert.equal((await inspect(page)).time, paused.time, 'Theme changes must preserve paused time');
    await assertPainting(page);
  }
  check('six distinct styles render in both themes with matching canvas backgrounds');

  // User-edited axes survive direction changes; Reset explicitly clears them.
  await page.selectOption('#palette', 'ocean');
  await page.locator('summary').click();
  await page.selectOption('#motion', 'static');
  await page.selectOption('#projection', 'orthographic');
  await page.selectOption('#style', 'editorial');
  await settle(page);
  const retained = await inspect(page);
  assert.equal(retained.state, 'paused');
  assert.equal(retained.design.palette, 'ocean');
  assert.equal(retained.design.motion, 'static');
  assert.equal(retained.projection, 'orthographic');
  await page.getByRole('button', { name: 'Reset direction' }).click();
  await settle(page);
  assert.equal((await inspect(page)).design.palette, STYLES.editorial.palette);
  assert.equal((await inspect(page)).state, 'paused');
  check('direction changes preserve explicit choices and pause; reset restores defaults');

  for (const transition of ['morph', 'dissolve', 'disperse', 'cut']) {
    await page.selectOption('#transition', transition);
    for (const position of [.2, .8, .4, 1, 0]) {
      await page.locator('#progress').evaluate((input, value) => {
        input.value = String(value); input.dispatchEvent(new Event('input', { bubbles: true }));
      }, position);
      await settle(page);
      const state = await inspect(page);
      assert.equal(state.position, position); assert.equal(state.transition, transition);
      assert.equal(state.state, 'paused'); await assertPainting(page);
    }
  }
  check('all four transitions render endpoints and reversed manual progress while paused');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.locator('#progress').evaluate(input => { input.value = '.3'; input.dispatchEvent(new Event('input')); });
  await settle(page);
  const reduced = await inspect(page);
  assert.equal(reduced.state, 'reduced'); assert.equal(reduced.scene, 'editorial-0');
  assert.ok(await page.getByRole('button', { name: 'Reduced motion' }).isDisabled());
  await page.waitForTimeout(180); assert.equal((await inspect(page)).time, reduced.time);
  check('reduced motion freezes ambient time and uses discrete manual scenes');

  for (const width of [390, 320]) {
    const mobile = await browser.newContext({ viewport: { width, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
    const p = await mobile.newPage(); p.on('pageerror', error => errors.push(error.message));
    for (const style of Object.keys(STYLES)) {
      await p.goto(`${server.url}/assets/starter/?style=${style}`); await settle(p);
      assert.ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${style} overflows at ${width}px`);
      assert.ok((await inspect(p)).points <= 22000);
      assert.match(await p.locator('canvas').evaluate(canvas => getComputedStyle(canvas).touchAction), /pan-y/);
    }
    await p.screenshot({ path: resolve(out, `mobile-${width}.png`), fullPage: true });
    await mobile.close();
  }
  check('all six styles fit 390px and 320px touch viewports within the phone sample budget');

  await page.emulateMedia({ reducedMotion: 'no-preference' });
  for (const palette of Object.keys(PALETTES)) {
    await page.selectOption('#palette', palette); await settle(page); await assertPainting(page);
  }
  check('all palette selectors repaint the sculpture while paused');
  assert.deepEqual(errors, []); check('no JavaScript or failed resource errors in the studio');
  await writeFile(resolve(out, 'checks.json'), JSON.stringify(receipt, null, 2) + '\n');
  console.log(JSON.stringify(receipt, null, 2));
} finally {
  await browser?.close();
  await server.close();
}
