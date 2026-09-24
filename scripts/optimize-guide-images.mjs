/**
 * Converts the Overtime Equalization guide screenshots from heavy PNGs to
 * sized WebP. Chromium (already a devDependency for the UI tests) does the
 * resizing and encoding, so no extra image tooling is needed.
 *
 * Run with: npm run images:guide
 */
import { createServer } from 'node:http'
import { readFile, stat, writeFile } from 'node:fs/promises'
import { resolve, extname, basename } from 'node:path'
import { chromium } from '@playwright/test'

// maxWidth keeps the image sharp for its largest on-page size (the zoom dialog)
// without shipping a 2x-of-2x asset.
const targets = [
  { file: 'equalization-step-1.png', maxWidth: 1000, quality: 0.86 },
  { file: 'equalization-step-2.png', maxWidth: 1000, quality: 0.86 },
  { file: 'equalization-step-3.png', maxWidth: 1000, quality: 0.86 },
  { file: 'equalization-step-4.png', maxWidth: 1400, quality: 0.84 },
]

const root = resolve('public')
const server = createServer(async (req, res) => {
  try {
    let path = resolve(root, '.' + new URL(req.url, 'http://localhost').pathname)
    if (!path.startsWith(root)) { res.writeHead(403); res.end(); return }
    try { if ((await stat(path)).isDirectory()) path = resolve(path, 'index.html') } catch { /* fall through to 404 */ }
    const contents = await readFile(path)
    const types = { '.html': 'text/html', '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2' }
    res.writeHead(200, { 'Content-Type': types[extname(path)] || 'application/octet-stream' })
    res.end(contents)
  } catch { res.writeHead(404); res.end() }
})
await new Promise(done => server.listen(0, '127.0.0.1', done))
const base = `http://127.0.0.1:${server.address().port}`
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] })

try {
  const page = await browser.newPage()
  await page.goto(base + '/images/')
  let before = 0
  let after = 0
  for (const target of targets) {
    const source = resolve(root, 'images', target.file)
    const destination = resolve(root, 'images', basename(target.file, '.png') + '.webp')
    const originalSize = (await stat(source)).size
    const encoded = await page.evaluate(async ({ src, maxWidth, quality }) => {
      const image = await new Promise((done, fail) => {
        const element = new Image()
        element.onload = () => done(element)
        element.onerror = fail
        element.src = src
      })
      const scale = Math.min(1, maxWidth / image.naturalWidth)
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(image.naturalWidth * scale)
      canvas.height = Math.round(image.naturalHeight * scale)
      const context = canvas.getContext('2d')
      context.drawImage(image, 0, 0, canvas.width, canvas.height)
      return { dataUrl: canvas.toDataURL('image/webp', quality), width: canvas.width, height: canvas.height }
    }, { src: `/images/${target.file}`, maxWidth: target.maxWidth, quality: target.quality })
    await writeFile(destination, Buffer.from(encoded.dataUrl.split(',')[1], 'base64'))
    const savedSize = (await stat(destination)).size
    before += originalSize
    after += savedSize
    console.log(`${target.file} → ${basename(destination)}  ${encoded.width}x${encoded.height}  ${Math.round(originalSize / 1024)}KB → ${Math.round(savedSize / 1024)}KB`)
  }
  console.log(`total: ${(before / 1024 / 1024).toFixed(2)}MB → ${(after / 1024).toFixed(0)}KB (${Math.round((1 - after / before) * 100)}% smaller)`)
} finally {
  await browser.close()
  server.close()
}
