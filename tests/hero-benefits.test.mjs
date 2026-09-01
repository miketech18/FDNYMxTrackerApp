import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

test('hero uses a fast vertical benefits carousel with the approved copy', () => {
  const benefits = [...html.matchAll(/class="hero-benefit"[^>]*>([^<]+)/g)].map((match) => match[1].trim().replaceAll('&amp;', '&'));

  assert.deepEqual(benefits, [
    'Your calendar updates the family calendar automatically.',
    'Compares OT Sheet for missing marks in City Time.',
    "OT Log: know when you're getting paid for last week's 6x MSOT.",
    'Detailed Mutual tracking by name.',
    'RSOT notifications on your home screen.',
    'Track Vacation, Medical, and Military Leave.',
    'Track comp time and training dates.',
    'Post an MX Off on the Mutual Board.',
    'Swap sets with your MX Partner.',
    'iCloud and Google Drive backup & restore.',
    'Custom Colors.',
  ]);
  assert.match(html, /data-benefits-carousel/);
  assert.match(html, /prefers-reduced-motion/);
  assert.match(html, /setInterval\(advanceBenefit, 1300\)/);
});
