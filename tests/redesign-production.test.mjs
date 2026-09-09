import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import test from 'node:test'

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('the production shell contains no DesignArena recording or editor code', async () => {
  const html = await read('index.html')

  assert.doesNotMatch(html, /designarena|rrweb|arena:|data-element-picker/i)
  assert.doesNotMatch(html, /rel="canonical"/i)
})

test('the React source and build configuration are present', async () => {
  const [app, packageJson, viteConfig] = await Promise.all([
    read('src/App.tsx'),
    read('package.json'),
    read('vite.config.ts'),
  ])

  assert.match(app, /BrowserRouter/)
  assert.match(packageJson, /"build"/)
  assert.doesNotMatch(viteConfig, /sourceTags|vite-source-tags/)
})

test('the deployment preserves the custom domain and supports direct routes', async () => {
  const [cname, workflow, routeScript] = await Promise.all([
    read('public/CNAME'),
    read('.github/workflows/deploy-pages.yml'),
    read('scripts/prepare-pages.mjs'),
  ])

  assert.equal(cname.trim(), 'fdnymxtrackerapp.harvestave.org')
  assert.match(workflow, /actions\/deploy-pages/)
  const installBrowser = workflow.indexOf('npx playwright install --with-deps chromium')
  const runTests = workflow.indexOf('npm test')
  assert.ok(installBrowser > -1 && runTests > installBrowser, 'Chromium must be installed before CI runs browser tests')
  for (const route of [
    'guides/index.html',
    'guides/share-calendar/index.html',
    'guides/send-mxp-mutuals/index.html',
    'how-to-share-calendar.html',
    'Send-MxP-Mutuals.html',
    '404.html',
  ]) {
    assert.match(routeScript, new RegExp(route.replaceAll('.', '\\.'), 'i'))
  }
})

test('the built Pages artifact contains every direct route and no preview instrumentation', async () => {
  const routeFiles = [
    'dist/index.html',
    'dist/guides/index.html',
    'dist/guides/share-calendar/index.html',
    'dist/guides/send-mxp-mutuals/index.html',
    'dist/how-to-share-calendar.html',
    'dist/Send-MxP-Mutuals.html',
    'dist/404.html',
  ]
  const assetFiles = (await readdir(new URL('../dist/assets/', import.meta.url))).filter(file => file.endsWith('.js'))

  assert.ok(assetFiles.length > 0, 'Expected a compiled JavaScript bundle')
  for (const path of [...routeFiles, ...assetFiles.map(file => `dist/assets/${file}`)]) {
    const contents = await read(path)
    assert.doesNotMatch(contents, /designarena|rrweb|data-element-picker|vite-source-tags/i, `${path} contains preview instrumentation`)
  }
})

test('local tooling and private experiment archives cannot be staged accidentally', async () => {
  const gitignore = await read('.gitignore')

  for (const path of ['.opencode/', 'opencode.json', 'old/experiments/', 'old/misc/']) {
    assert.match(gitignore, new RegExp(`^${path.replaceAll('.', '\\.').replaceAll('/', '\\/')}$`, 'm'))
  }
})

test('guide completion controls identify the step they affect', async () => {
  const guides = await read('src/pages/Guides.tsx')

  assert.match(guides, /mark-complete[^>]*aria-label=.*step\.title/)
})

test('the overtime equalization guide uses its dedicated route and source assets', async () => {
  const [guides, overtimeGuide] = await Promise.all([
    read('src/pages/Guides.tsx'),
    read('src/pages/OvertimeEqualizationGuide.tsx'),
  ])

  assert.match(guides, /import\s+\{\s*OvertimeEqualizationGuide\s*\}\s+from\s+['"]\.\/OvertimeEqualizationGuide['"]/)
  assert.match(guides, /guide\.slug\s*===\s*['"]overtime-equalization['"]/)
  for (const stepId of ['newReport', 'scanOptions', 'projectedMsot', 'calendarStats']) {
    assert.match(overtimeGuide, new RegExp(`id:\\s*['\"]${stepId}['\"]`))
  }
  assert.match(overtimeGuide, /Calendar hours/)
  assert.match(overtimeGuide, /fdny-howto3-checks/)
  for (const image of [1, 2, 3, 4]) {
    assert.match(overtimeGuide, new RegExp(`/images/equalization-step-${image}\\.png`))
  }
})

test('the overtime equalization guide explains the full scan workflow and exposes an accessible image dialog', async () => {
  const overtimeGuide = await read('src/pages/OvertimeEqualizationGuide.tsx')

  for (const instruction of [
    'SCAN YOUR OT SHEET',
    'START A NEW REPORT SCAN',
    'CAPTURE THE SHEET FLAT, LIT & FULL-PAGE',
    'READ YOUR PROJECTED MSOT NUMBER',
    'CLEAR THE CALENDAR ALERTS — 3 STATES',
    'Matching hours does not confirm payment',
  ]) {
    assert.match(overtimeGuide, new RegExp(instruction.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&')))
  }
  assert.match(overtimeGuide, /aria-modal=["']true["']/)
})

test('the overtime equalization guide includes the simulator states and persisted checklist', async () => {
  const overtimeGuide = await read('src/pages/OvertimeEqualizationGuide.tsx')

  for (const expectedState of ['CALENDAR HIGHER', 'HOURS MATCH', 'CALENDAR LOWER']) {
    assert.match(overtimeGuide, new RegExp(expectedState))
  }
  assert.match(overtimeGuide, /0 of 6 done/)
  assert.match(overtimeGuide, /localStorage\.getItem/)
  assert.match(overtimeGuide, /localStorage\.setItem/)
})

test('self-hosted WOFF2 fonts declare the correct format', async () => {
  const css = await read('src/index.css')

  assert.doesNotMatch(css, /\.woff2'\) format\('truetype'\)/)
  assert.match(css, /\.woff2'\) format\('woff2'\)/)
})
