// Audits WCAG 2.5.8 (target size, minimum 24x24 CSS px) across every route.
//
// The measured box is the real hit region, not the element's rect: controls
// are allowed to grow their target with padding or an ::after overlay, and this
// probe discovers that by pushing elementFromPoint outward from the centre.
//
// Usage: node scripts/audit-tap-targets.mjs [--json]
//   BASE_URL        audit a running server instead of the built dist/ (e.g. http://localhost:5173)
//   AUDIT_ROUTES    comma-separated route list to replace the default sweep
//   AUDIT_VIEWPORTS comma-separated name:width:height entries, e.g. mobile:390:844
//   AUDIT_ALL       print every control, not just the undersized ones
//   --json          append the findings as JSON
//
// Controls inside the phone mock are skipped when the mock is transform-scaled:
// a scale reports presentation size, and the mock is an illustration of the app
// rather than the app UI itself. scripts/test.mjs enforces the same rule in CI.
//
// The measurement lives in scripts/tap-targets.mjs so this audit and the CI
// guard cannot disagree about what counts as a target or how big it is.

import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { resolve, extname } from 'node:path'
import { chromium } from '@playwright/test'
import { measureTargets, MIN_TARGET } from './tap-targets.mjs'

const MIN = MIN_TARGET
const ROUTES = (process.env.AUDIT_ROUTES ? process.env.AUDIT_ROUTES.split(',') : ['/', '/guides', '/guides/share-calendar', '/guides/overtime-equalization', '/app-simulator'])
const VIEWPORTS = process.env.AUDIT_VIEWPORTS
  ? process.env.AUDIT_VIEWPORTS.split(',').map(v => { const [name, width, height] = v.split(':'); return { name, width: +width, height: +height } })
  : [
      { name: 'mobile', width: 390, height: 844 },
      { name: 'desktop', width: 1440, height: 900 },
      { name: 'full', width: 1440, height: 1100 }
    ]

const hit = (item) => `${Math.round(item.width)}x${Math.round(item.height)}`.padStart(9)
const layout = (item) => `${Math.round(item.layoutWidth)}x${Math.round(item.layoutHeight)}`.padStart(9)

const root = resolve('dist')
let server
let base = process.env.BASE_URL

if (!base) {
  server = createServer(async (req, res) => {
    try {
      let path = resolve(root, '.' + new URL(req.url, 'http://localhost').pathname)
      if (!path.startsWith(root)) { res.writeHead(403); res.end(); return }
      try { if ((await stat(path)).isDirectory()) path = resolve(path, 'index.html') } catch { path = resolve(root, 'index.html') }
      const contents = await readFile(path)
      const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' }
      res.writeHead(200, { 'Content-Type': types[extname(path)] || 'application/octet-stream' }); res.end(contents)
    } catch { res.writeHead(404); res.end() }
  })
  await new Promise(r => server.listen(0, '127.0.0.1', r))
  base = `http://127.0.0.1:${server.address().port}`
}

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] })
const findings = []
try {
  for (const viewport of VIEWPORTS) {
    const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height }, deviceScaleFactor: 1 })
    for (const route of ROUTES) {
      await page.goto(base + route)
      await page.evaluate(() => document.fonts.ready)
      // The simulator is a lazy route; wait for it to paint before measuring.
      if (route === '/app-simulator') await page.locator('.sim-device').waitFor()
      await page.locator('#root a, #root button').first().waitFor()
      await page.waitForTimeout(150)
      const results = await measureTargets(page)
      const short = results.filter(r => r.undersized)
      if (process.env.AUDIT_ALL) for (const item of results) console.log(`    (all) ${hit(item)}  "${item.text}"`)
      if (short.length) findings.push({ viewport: viewport.name, route, short })
      console.log(`${viewport.name.padEnd(7)} ${route.padEnd(32)} ${String(results.length).padStart(3)} controls, ${short.length} under ${MIN}px`)
      for (const item of short) console.log(`    ${hit(item)}  layout ${layout(item)}  "${item.text}"  ${item.path.slice(0, 90)}`)
    }
    await page.close()
  }
} finally {
  await browser.close()
  server?.close()
}

if (process.argv.includes('--json')) console.log(JSON.stringify(findings, null, 2))
const total = findings.reduce((sum, f) => sum + f.short.length, 0)
console.log(total ? `\nRESULT: ${total} tap targets under ${MIN}x${MIN}` : `\nRESULT: all tap targets meet ${MIN}x${MIN}`)
process.exitCode = total ? 1 : 0
