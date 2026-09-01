import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { constants } from 'node:fs';

const root = new URL('../', import.meta.url);
const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

test('app screenshot carousel includes all numbered slides in order', async () => {
  const extensions = ['png', 'png', 'png', 'jpg', 'PNG', 'png', 'png', 'jpg', 'png', 'png', 'png', 'png'];
  for (let number = 1; number <= 12; number += 1) {
    await access(new URL(`Assets/carousel/${number}.${extensions[number - 1]}`, root), constants.R_OK);
  }

  const slideNumbers = [...html.matchAll(/data-slide="(\d+)"/g)].map((match) => Number(match[1]));
  assert.deepEqual(slideNumbers, Array.from({ length: 12 }, (_, index) => index + 1));
  assert.match(html, /class="app-carousel"/);
  assert.match(html, /hero-carousel/);
  assert.match(html, /legacyShots\.remove\(\)/);
  assert.match(html, /class="phone-frame"/);
  assert.match(html, /prefers-reduced-motion/);
  assert.match(html, /setInterval\(\(\) => showSlide\(current \+ 1\), 3000\)/);
  assert.doesNotMatch(html, /<div class="alert-banner">/);
});
