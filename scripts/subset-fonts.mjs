#!/usr/bin/env node
/**
 * Rebuilds `public/fonts` — the subset of Inter and Bebas Neue this site needs.
 *
 * Both faces are cut down to the characters that actually appear in the source
 * tree and written as real WOFF2. Inter's `opsz` axis is pinned to its default
 * (14) so the browser cannot silently re-render large text through optical
 * sizing, while `wght` stays live so every weight the CSS asks for — 400 through
 * 800, including the 650 and 550 accents — resolves from one file.
 *
 * Usage: npm run fonts
 */
import { mkdir, readdir, rm, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import subsetFont from 'subset-font'
import {
  SYSTEM_FALLBACK_CHARACTERS,
  collectSiteCharacters,
  inspectFont,
} from './font-coverage.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outDir = path.join(root, 'public/fonts')

const SOURCES = [
  {
    output: 'inter-var.woff2',
    // Inter's own distribution, which ships the full variable font. Google Fonts
    // and @fontsource only publish pre-cut latin subsets, and those drop the
    // arrows and geometric shapes the guide copy and simulator use.
    url: 'https://rsms.me/inter/font-files/InterVariable.woff2',
    // Pin the optical-size axis to its default so rendering matches the static
    // instances this replaces instead of drifting with `font-optical-sizing`.
    variationAxes: { opsz: 14 },
  },
  {
    output: 'bebas-neue.woff2',
    // Pinned to an exact release so this file can never drift underneath us.
    url: 'https://cdn.jsdelivr.net/npm/@fontsource/bebas-neue@5.3.0/files/bebas-neue-latin-400-normal.woff2',
    variationAxes: undefined,
  },
]

const kilobytes = bytes => `${(bytes / 1024).toFixed(1)} KB`

// Measured straight from disk: the files being replaced are not always valid
// WOFF2 (the first set were renamed TrueType), so nothing here may assume a
// format the way inspectFont does.
async function existingFontBytes() {
  const entries = await readdir(outDir).catch(() => [])
  let total = 0
  for (const entry of entries) {
    if (entry.endsWith('.woff2')) total += (await stat(path.join(outDir, entry))).size
  }
  return total
}

const { characters, text, files: scanned } = await collectSiteCharacters(new URL('../', import.meta.url))
const required = characters.filter(character => !SYSTEM_FALLBACK_CHARACTERS.includes(character))
console.log(`scanned ${scanned} source files → ${characters.length} characters, ${required.length} of them require a webfont glyph`)

const before = await existingFontBytes()
await mkdir(outDir, { recursive: true })

const written = []
for (const source of SOURCES) {
  const response = await fetch(source.url)
  if (!response.ok) throw new Error(`${source.url} responded ${response.status}`)
  const original = Buffer.from(await response.arrayBuffer())

  const subset = Buffer.from(
    await subsetFont(original, text, {
      targetFormat: 'woff2',
      variationAxes: source.variationAxes,
    }),
  )

  await writeFile(path.join(outDir, source.output), subset)
  written.push({ source, original: original.length, subset: subset.length })
  console.log(`✓ ${source.output}: ${kilobytes(original.length)} source → ${kilobytes(subset.length)}`)
}

// Drop anything left over so a previous, larger font set cannot linger in dist.
for (const entry of await readdir(outDir)) {
  if (!entry.endsWith('.woff2')) continue
  if (written.some(({ source }) => source.output === entry)) continue
  await rm(path.join(outDir, entry))
  console.log(`· removed stale ${entry}`)
}

let failed = false
const covered = new Set()
for (const { source } of written) {
  const font = await inspectFont(pathToFileURL(path.join(outDir, source.output)))
  for (const point of font.points) covered.add(point)
  const axes = font.axes.map(axis => `${axis.tag} ${axis.min}–${axis.max} (default ${axis.default})`).join(', ') || 'static'
  console.log(`  ${source.output}: ${font.points.size} codepoints, ${font.tables.length} tables, axes: ${axes}`)
}

const missing = required.filter(character => !covered.has(character.codePointAt(0)))
if (missing.length > 0) {
  failed = true
  console.error(`\n✗ the subset cannot render: ${missing.join(' ')}`)
  console.error(`  (${missing.map(character => `U+${character.codePointAt(0).toString(16).toUpperCase()}`).join(', ')})`)
}

const after = written.reduce((total, entry) => total + entry.subset, 0)
console.log(`\npublic/fonts: ${kilobytes(before)} → ${kilobytes(after)} (${(100 - (after / before) * 100).toFixed(1)}% smaller)`)
if (SYSTEM_FALLBACK_CHARACTERS.length > 0) {
  console.log(`drawn by the system fallback on every platform: ${[...SYSTEM_FALLBACK_CHARACTERS].join(' ')}`)
}

if (failed) process.exitCode = 1
