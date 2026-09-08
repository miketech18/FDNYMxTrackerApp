import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const page = await readFile(new URL('../Send-MxP-Mutuals.html', import.meta.url), 'utf8');
const app = await readFile(new URL('../Send-MxP-Mutuals-assets/index-DHbFsI3A.js', import.meta.url), 'utf8');
const styles = await readFile(new URL('../Send-MxP-Mutuals-assets/index-B_kB5OCs.css', import.meta.url), 'utf8');
const step42 = await readFile(new URL('../Send-MxP-Mutuals-assets/step-4.2.png', import.meta.url));
const step43 = await readFile(new URL('../Send-MxP-Mutuals-assets/step-4.3.png', import.meta.url));
const home = await readFile(new URL('../index.html', import.meta.url), 'utf8');

test('Send MxP Mutuals page is copied locally without an embedded frame', () => {
  assert.doesNotMatch(page, /<iframe\b/);
  assert.doesNotMatch(page, /<script type="module"[^>]+index-DHbFsI3A\.js/);
  assert.match(page, /<script defer src="Send-MxP-Mutuals-assets\/index-DHbFsI3A\.js"/);
  assert.match(page, /src="Send-MxP-Mutuals-assets\/index-DHbFsI3A\.js"/);
  assert.match(page, /href="Send-MxP-Mutuals-assets\/index-B_kB5OCs\.css"/);
  assert.doesNotMatch(page, /pgug54-jcp3fvupf\.vercel\.app/);
  assert.doesNotMatch(page, /data-arena|data-element-picker|designarena\.ai|cdn\.jsdelivr\.net/);
  assert.match(app, /Send-MxP-Mutuals-assets\/1788729491787_0nrhy6es0\.png/);
  assert.doesNotMatch(app, /supabase\.co\/storage\/v1\/object\/sign/);
  assert.match(app, /screenshot:"Send-MxP-Mutuals-assets\/step-4\.2\.png"/);
  assert.match(app, /screenshot2:"Send-MxP-Mutuals-assets\/step-4\.3\.png"/);
  assert.doesNotMatch(app, /Opposite Sets Required/);
  assert.doesNotMatch(app, /What.s the difference between MX On and MX Off\?/);
  assert.match(app, /Tap their name in My Crew Roster and tap "MAKE MY MX PARTNER"  Once they accept you can both send sets to each other\./);
  assert.doesNotMatch(app, /Go to My Crew → MX Partner tab\. If you don.t have a partner set/);
  assert.match(app, /children:\["Send Mutual Sets to",Y\.jsx\("br"/);
  assert.match(app, /className:"text-red not-italic"[^}]*children:"Your MX Partner"/);
  assert.match(app, /Y\.jsx\("span",\{className:"text-brass"[^}]*children:"for Approval"/);
  assert.match(app, /screenshot-scroll-multi/);
  assert.match(app, /screenshot-shuffle/);
  assert.match(styles, /\.screenshot-scroll-multi\{[^}]*overflow-x:auto/);
  assert.match(styles, /\.screenshot-scroll-multi\{[^}]*min-width:0/);
  assert.match(styles, /\.screenshot-scroll-multi\{[^}]*max-width:100%/);
  assert.match(styles, /\.screenshot-scroll-multi\{[^}]*-webkit-overflow-scrolling:touch/);
  assert.match(styles, /@media\(min-width:768px\)\{\.screenshot-scroll-multi\{[^}]*overflow-x:visible/);
  assert.match(styles, /\.screenshot-shuffle\{[^}]*position:relative/);
  assert.match(styles, /@keyframes screenshot-card-front/);
  assert.match(styles, /@keyframes screenshot-card-back/);
  assert.match(styles, /prefers-reduced-motion:reduce/);
  assert.ok(step42.length > 1000);
  assert.ok(step43.length > 1000);
});

test('home page links to Send MxP Mutuals', () => {
  assert.match(home, /href="Send-MxP-Mutuals\.html"/);
  assert.match(home, /class="nav-actions"/);
  assert.match(home, /class="nav-action-group"/);
  assert.match(home, /class="nav-feedback nav-feedback-primary"/);
  assert.match(home, /\.nav-feedback-primary[^}]*margin-right:auto/);
  assert.match(home, /\.nav-action-group[^}]*margin-left:auto/);
});
