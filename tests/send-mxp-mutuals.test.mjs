import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const page = await readFile(new URL('../Send-MxP-Mutuals.html', import.meta.url), 'utf8');
const app = await readFile(new URL('../Send-MxP-Mutuals-assets/index-DHbFsI3A.js', import.meta.url), 'utf8');
const home = await readFile(new URL('../index.html', import.meta.url), 'utf8');

test('Send MxP Mutuals page is copied locally without an embedded frame', () => {
  assert.doesNotMatch(page, /<iframe\b/);
  assert.match(page, /src="Send-MxP-Mutuals-assets\/index-DHbFsI3A\.js"/);
  assert.match(page, /href="Send-MxP-Mutuals-assets\/index-B_kB5OCs\.css"/);
  assert.doesNotMatch(page, /pgug54-jcp3fvupf\.vercel\.app/);
  assert.doesNotMatch(page, /data-arena|data-element-picker|designarena\.ai|cdn\.jsdelivr\.net/);
  assert.match(app, /Send-MxP-Mutuals-assets\/1788729491787_0nrhy6es0\.png/);
  assert.doesNotMatch(app, /supabase\.co\/storage\/v1\/object\/sign/);
});

test('home page links to Send MxP Mutuals', () => {
  assert.match(home, /href="Send-MxP-Mutuals\.html"/);
});
