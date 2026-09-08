import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync(new URL('../tiiny-redirect/index.html', import.meta.url), 'utf8');

test('Tiiny page contains only the main-site redirect', () => {
  assert.match(html, /<!doctype html>/i);
  assert.match(html, /<html[ >]/i);
  assert.match(html, /<head>/i);
  assert.match(html, /<body>/i);
  assert.match(html, /window\.location(?:\.href)?\s*=\s*['"]https:\/\/fdnymxtrackerapp\.harvestave\.org\/?['"]/);
  assert.equal((html.match(/<a\b/gi) ?? []).length, 0);
  assert.doesNotMatch(html, /<img\b|data:image|<style\b|<meta\b|setTimeout|setInterval|apps\.apple\.com|play\.google\.com/i);
});
