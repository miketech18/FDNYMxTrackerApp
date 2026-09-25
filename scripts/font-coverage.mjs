/**
 * Shared helpers for keeping the self-hosted fonts honest.
 *
 * `scripts/subset-fonts.mjs` uses these to prove that a regenerated subset still
 * covers every character the site renders. `tests/redesign-production.test.mjs`
 * uses them to stop a hand-edited font file from silently undoing that.
 */
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fontverter from 'fontverter'

/**
 * Every real WOFF2 file starts with these four bytes. The fonts committed before
 * this tooling was added were uncompressed TrueType files that had simply been
 * renamed to `.woff2`, so the magic bytes are the check that matters.
 */
export const WOFF2_MAGIC = 'wOF2'

const SOURCE_SUFFIXES = new Set(['.ts', '.tsx', '.css', '.html', '.json'])

/**
 * Every character the site's source tree can put on screen, as both a sorted
 * array and a ready-to-subset string.
 */
export async function collectSiteCharacters(root) {
  const base = fileURLToPath(root)
  const files = []

  async function walk(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue
      const full = path.join(directory, entry.name)
      if (entry.isDirectory()) await walk(full)
      else if (SOURCE_SUFFIXES.has(path.extname(entry.name))) files.push(full)
    }
  }

  await walk(path.join(base, 'src'))
  files.push(path.join(base, 'index.html'))

  const seen = new Set()
  for (const file of files) {
    for (const character of await readFile(file, 'utf8')) {
      const code = character.codePointAt(0)
      if (code >= 0x20 && code !== 0x7f) seen.add(character)
    }
  }

  const characters = [...seen].sort()
  return { characters, text: characters.join(''), files: files.length }
}

/** Decompress a WOFF/WOFF2 file (or pass a plain sfnt through) so it can be read. */
export async function decodeToSfnt(buffer) {
  return Buffer.from(await fontverter.convert(buffer, 'truetype'))
}

/** The sfnt table directory: tag → byte range. */
export function sfntTables(sfnt) {
  const count = sfnt.readUInt16BE(4)
  const tables = new Map()
  for (let index = 0; index < count; index += 1) {
    const entry = 12 + index * 16
    tables.set(sfnt.toString('latin1', entry, entry + 4), {
      offset: sfnt.readUInt32BE(entry + 8),
      length: sfnt.readUInt32BE(entry + 12),
    })
  }
  return tables
}

/** The variation axes a variable font exposes, with their ranges. */
export function fontAxes(sfnt) {
  const fvar = sfntTables(sfnt).get('fvar')
  if (!fvar) return []
  const axes = []
  const count = sfnt.readUInt16BE(fvar.offset + 8)
  const stride = sfnt.readUInt16BE(fvar.offset + 10)
  for (let index = 0; index < count; index += 1) {
    const axis = fvar.offset + 16 + index * stride
    axes.push({
      tag: sfnt.toString('latin1', axis, axis + 4),
      min: sfnt.readInt32BE(axis + 4) / 65536,
      default: sfnt.readInt32BE(axis + 8) / 65536,
      max: sfnt.readInt32BE(axis + 12) / 65536,
    })
  }
  return axes
}

/** Every Unicode code point the font's cmap can produce a glyph for. */
export function cmapCodepoints(sfnt) {
  const cmap = sfntTables(sfnt).get('cmap')
  const points = new Set()
  if (!cmap) return points

  const subtables = sfnt.readUInt16BE(cmap.offset + 2)
  for (let index = 0; index < subtables; index += 1) {
    const record = cmap.offset + 4 + index * 8
    const subtable = cmap.offset + sfnt.readUInt32BE(record + 4)
    const format = sfnt.readUInt16BE(subtable)

    if (format === 12) {
      const groups = sfnt.readUInt32BE(subtable + 12)
      for (let group = 0; group < groups; group += 1) {
        const start = sfnt.readUInt32BE(subtable + 16 + group * 12)
        const end = sfnt.readUInt32BE(subtable + 20 + group * 12)
        for (let point = start; point <= Math.min(end, 0x2ffff); point += 1) points.add(point)
      }
    } else if (format === 4) {
      const segmentBytes = sfnt.readUInt16BE(subtable + 6)
      const segments = segmentBytes / 2
      for (let segment = 0; segment < segments; segment += 1) {
        const end = sfnt.readUInt16BE(subtable + 14 + segment * 2)
        const start = sfnt.readUInt16BE(subtable + 16 + segmentBytes + segment * 2)
        if (start === 0xffff && end === 0xffff) continue
        for (let point = start; point <= end; point += 1) points.add(point)
      }
    }
  }
  return points
}

/** Load a font file from disk and report what it can render. */
export async function inspectFont(url) {
  const buffer = await readFile(url)
  const magic = buffer.subarray(0, 4).toString('latin1')
  if (magic !== WOFF2_MAGIC) {
    throw new Error(`${fileURLToPath(url)} is not WOFF2 (starts with ${JSON.stringify(magic)})`)
  }
  const sfnt = await decodeToSfnt(buffer)
  return {
    bytes: buffer.length,
    sfnt,
    tables: [...sfntTables(sfnt).keys()].sort(),
    axes: fontAxes(sfnt),
    points: cmapCodepoints(sfnt),
  }
}
