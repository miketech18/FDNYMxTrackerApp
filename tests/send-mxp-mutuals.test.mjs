import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const page = await readFile(new URL('../Send-MxP-Mutuals.html', import.meta.url), 'utf8');
const home = await readFile(new URL('../index.html', import.meta.url), 'utf8');

test('Send MxP Mutuals page links directly to the Design Arena source', () => {
  assert.doesNotMatch(page, /<iframe\b/);
  assert.match(page, /href="https:\/\/pgug54-jcp3fvupf-arcadawebapps3\.vercel\.app\/"/);
});

test('home page links to Send MxP Mutuals', () => {
  assert.match(home, /href="Send-MxP-Mutuals\.html"/);
});
