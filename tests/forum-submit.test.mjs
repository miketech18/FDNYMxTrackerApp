import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

test('feedback form submits through native FormSubmit POST navigation', () => {
  assert.match(
    html,
    /<form[^>]*id="feedbackForm"[^>]*method="POST"[^>]*action="https:\/\/formsubmit\.co\/fdnyscheduler@gmail\.com"/,
  );
  assert.match(html, /name="_next" value="https:\/\/fdnymxtrackerapp\.harvestave\.org\/\?feedback=sent#feedback-section"/);
  assert.doesNotMatch(html, /event\.preventDefault\(\)/);
  assert.doesNotMatch(html, /fetch\(form\.action/);
});
