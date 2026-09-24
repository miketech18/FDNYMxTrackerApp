/**
 * Renders the 1200x630 social share card that index.html points at from
 * og:image / twitter:image. Chromium paints it with the site's own fonts so the
 * card matches the homepage instead of cropping the square app icon.
 *
 * Run with: npm run og:image
 */
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { resolve, extname } from 'node:path'
import { chromium } from '@playwright/test'

const root = resolve('public')
const destination = resolve(root, 'images/og-card.jpg')

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8" />
<style>
  @font-face { font-family: 'Bebas Neue'; src: url('/fonts/bebas-neue-0.woff2') format('woff2'); font-weight: 400; }
  @font-face { font-family: 'Inter'; src: url('/fonts/inter-0.woff2') format('woff2'); font-weight: 400; }
  @font-face { font-family: 'Inter'; src: url('/fonts/inter-3.woff2') format('woff2'); font-weight: 700; }
  * { margin: 0; box-sizing: border-box; }
  body {
    width: 1200px; height: 630px; display: flex; align-items: center; gap: 56px;
    padding: 0 70px; color: #f4f1ea; font-family: Inter, Arial, sans-serif;
    background: radial-gradient(ellipse 72% 125% at 88% 16%, #1b3448 0%, #101c28 46%, #080c12 88%), #080c12;
  }
  .copy { flex: 1; }
  .eyebrow { color: #d4a94e; font-size: 15px; font-weight: 700; letter-spacing: 3.2px; }
  h1 { font-family: 'Bebas Neue', Impact, sans-serif; font-weight: 400; font-size: 92px; line-height: .98; letter-spacing: 1px; margin-top: 20px; }
  h1 span { color: #d4a94e; }
  .lede { margin-top: 22px; color: #a2aebb; font-size: 23px; line-height: 1.45; }
  .footer { display: flex; align-items: center; gap: 16px; margin-top: 34px; color: #8b9aaa; font-size: 16px; }
  .pill { border: 1px solid #d4a94e73; color: #d4a94e; border-radius: 6px; padding: 11px 16px; font-size: 15px; font-weight: 700; letter-spacing: 1.3px; }
  .icon { width: 262px; height: 262px; border-radius: 46px; box-shadow: 0 34px 80px #00000085; }
</style></head>
<body>
  <div class="copy">
    <p class="eyebrow">FDNY MUTUAL TRACKER — BUILT FOR THE FIREHOUSE</p>
    <h1>BUILT BY AN FDNY<br />FIREFIGHTER.<br /><span>MADE FOR OUR JOB.</span></h1>
    <p class="lede">Tours, mutuals, crew and overtime.<br />All squared away.</p>
    <div class="footer"><span class="pill">TRY THE APP SIMULATOR</span><span>iOS &amp; Android</span></div>
  </div>
  <img class="icon" src="/images/app-icon.webp" alt="" />
</body></html>`

const server = createServer(async (req, res) => {
  const { pathname } = new URL(req.url, 'http://localhost')
  if (pathname === '/__og-card') {
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end(html)
    return
  }
  try {
    let path = resolve(root, '.' + pathname)
    if (!path.startsWith(root)) { res.writeHead(403); res.end(); return }
    const contents = await readFile(path)
    const types = { '.webp': 'image/webp', '.woff2': 'font/woff2' }
    res.writeHead(200, { 'Content-Type': types[extname(path)] || 'application/octet-stream' })
    res.end(contents)
  } catch { res.writeHead(404); res.end() }
})
await new Promise(done => server.listen(0, '127.0.0.1', done))
const base = `http://127.0.0.1:${server.address().port}`
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] })

try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })
  await page.goto(base + '/__og-card')
  await page.evaluate(() => document.fonts.ready)
  await page.evaluate(() => Promise.all([...document.images].map(image => image.decode().catch(() => undefined))))
  await page.screenshot({ path: destination, type: 'jpeg', quality: 88 })
  const size = (await stat(destination)).size
  console.log(`wrote public/images/og-card.jpg at 1200x630 (${Math.round(size / 1024)}KB)`)
} finally {
  await browser.close()
  server.close()
}
