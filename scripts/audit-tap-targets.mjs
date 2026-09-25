// Audits WCAG 2.5.8 (target size, minimum 24x24 CSS px) across every route.
//
// The measured box is the real hit region, not the element's own rect: controls
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

import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { resolve, extname } from 'node:path'
import { chromium } from '@playwright/test'

const MIN = 24
const ROUTES = (process.env.AUDIT_ROUTES ? process.env.AUDIT_ROUTES.split(',') : ['/', '/guides', '/guides/share-calendar', '/guides/overtime-equalization', '/app-simulator'])
const VIEWPORTS = process.env.AUDIT_VIEWPORTS
  ? process.env.AUDIT_VIEWPORTS.split(',').map(v => { const [name, width, height] = v.split(':'); return { name, width: +width, height: +height } })
  : [
      { name: 'mobile', width: 390, height: 844 },
      { name: 'desktop', width: 1440, height: 900 },
      { name: 'full', width: 1440, height: 1100 }
    ]

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

// Runs in the page. Sticky chrome is switched to static first so it cannot
// shield the controls underneath it from the hit probe.
const measureInPage = (min) => {
  const isHit = (x, y, el) => {
    if (x < 0 || y < 0 || x > window.innerWidth - 1 || y > window.innerHeight - 1) return false
    const top = document.elementFromPoint(x, y)
    return !!top && (top === el || el.contains(top))
  }
  const boxOf = (el) => {
    const rect = el.getBoundingClientRect()
    if (!rect.width || !rect.height) return null
    const cx = Math.round(rect.left + rect.width / 2)
    const cy = Math.round(rect.top + rect.height / 2)
    if (!isHit(cx, cy, el)) return null
    let left = 0, right = 0, up = 0, down = 0
    while (left < 80 && isHit(Math.round(rect.left) - left - 1, cy, el)) left++
    while (right < 80 && isHit(Math.round(rect.right) + right, cy, el)) right++
    while (up < 80 && isHit(cx, Math.round(rect.top) - up - 1, el)) up++
    while (down < 80 && isHit(cx, Math.round(rect.bottom) + down, el)) down++
    return {
      width: rect.width + left + right,
      height: rect.height + up + down,
      layout: { width: rect.width, height: rect.height }
    }
  }
  const chrome = document.createElement('style')
  chrome.textContent = '.site-header,.download-bar,.announcement-banner,.guide-progress,.article-sidebar{position:static!important}'
  document.head.appendChild(chrome)

  const device = document.querySelector('.sim-device')
  const mockIsScaled = !!device && getComputedStyle(device).transform !== 'none'

  const selector = 'a[href], button, [role="button"], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  const results = []
  for (const el of document.querySelectorAll(selector)) {
    const style = getComputedStyle(el)
    if (style.visibility === 'hidden' || style.display === 'none' || style.opacity === '0') continue
    if (el.disabled) continue
    if (mockIsScaled && el.closest('.sim-device')) continue
    if (!el.getBoundingClientRect().height) continue
    const path = []
    let node = el
    while (node && node !== document.body) {
      const cls = typeof node.className === 'string' && node.className ? '.' + node.className.trim().split(/\s+/).join('.') : ''
      path.unshift(node.tagName.toLowerCase() + cls)
      node = node.parentElement
    }
    // Bring the control into view. The site sets scroll-behavior: smooth, so the
    // behaviour has to be forced to instant or the probe races the animation and
    // measures the control where it used to be.
    el.scrollIntoView({ block: 'center', behavior: 'instant' })
    let best = null
    for (const offset of [0, 120, -120, 260, -260]) {
      if (offset) window.scrollBy({ top: offset, behavior: 'instant' })
      const box = boxOf(el)
      if (!box) continue
      if (!best || box.width * box.height > best.width * best.height) best = box
      if (box.width >= min && box.height >= min) break
    }
    if (!best) continue
    results.push({
      path: path.join(' > '),
      text: (el.getAttribute('aria-label') || el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 46),
      hit: `${Math.round(best.width)}x${Math.round(best.height)}`,
      layout: `${Math.round(best.layout.width)}x${Math.round(best.layout.height)}`,
      short: best.width < min || best.height < min
    })
  }
  return results
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
      const results = await page.evaluate(measureInPage, MIN)
      const short = results.filter(r => r.short)
      if (process.env.AUDIT_ALL) for (const item of results) console.log(`    (all) ${item.hit.padStart(9)}  "${item.text}"`)
      if (short.length) findings.push({ viewport: viewport.name, route, short })
      console.log(`${viewport.name.padEnd(7)} ${route.padEnd(32)} ${String(results.length).padStart(3)} controls, ${short.length} under ${MIN}px`)
      for (const item of short) console.log(`    ${item.hit.padStart(9)}  layout ${item.layout.padStart(9)}  "${item.text}"  ${item.path.slice(0, 90)}`)
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
