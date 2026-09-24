import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

const outputDirectory = resolve('dist')
const appShell = resolve(outputDirectory, 'index.html')
const site = 'https://fdnymxtrackerapp.harvestave.org'

// Every deployable entry point, with the metadata crawlers and social cards read.
// Titles match the document.title the app sets for the same route.
const routes = [
  {
    file: 'index.html',
    path: '/',
    title: 'FDNY Mutual Tracker · Built for our job',
    description: 'Built by an FDNY firefighter. Keep your tours, mutuals, crew, and overtime in one place. Explore step-by-step guides and help shape FDNY Mutual Tracker.',
  },
  {
    file: 'app-simulator/index.html',
    path: '/app-simulator',
    title: 'App Simulator · FDNY Mutual Tracker',
    description: 'Try the FDNY Mutual Tracker app simulator: a phone-framed, interactive demo of the calendar, mutuals, crew and overtime tools. Fictional data only, nothing leaves your browser.',
  },
  {
    file: 'guides/index.html',
    path: '/guides',
    title: 'How-to Guides · FDNY Mutual Tracker',
    description: 'Step-by-step how-to guides for FDNY Mutual Tracker: share your calendar with family, send mutuals to your MX partner, and scan and verify your MSOT.',
  },
  {
    file: 'guides/share-calendar/index.html',
    path: '/guides/share-calendar',
    title: 'Share your calendar with family · FDNY Mutual Tracker',
    description: 'Keep everyone in the loop. Share your tours, overtime and mutuals with the calendar your family already uses.',
  },
  {
    file: 'guides/send-mxp-mutuals/index.html',
    path: '/guides/send-mxp-mutuals',
    title: 'Send mutuals to your MX partner · FDNY Mutual Tracker',
    description: 'Send a mutual set to your MX partner, get approval, and let both calendars stay in sync automatically.',
  },
  {
    file: 'guides/overtime-equalization/index.html',
    path: '/guides/overtime-equalization',
    title: 'Scan and verify your MSOT · FDNY Mutual Tracker',
    description: 'Scan your Overtime Equalization Report, read the projected MSOT, and reconcile the report against your calendar.',
  },
  // Legacy URLs that redirect in the app still point search engines at the guide they redirect to.
  {
    file: 'how-to-share-calendar.html',
    path: '/guides/share-calendar',
    title: 'Share your calendar with family · FDNY Mutual Tracker',
    description: 'Keep everyone in the loop. Share your tours, overtime and mutuals with the calendar your family already uses.',
  },
  {
    file: 'Send-MxP-Mutuals.html',
    path: '/guides/send-mxp-mutuals',
    title: 'Send mutuals to your MX partner · FDNY Mutual Tracker',
    description: 'Send a mutual set to your MX partner, get approval, and let both calendars stay in sync automatically.',
  },
  {
    file: 'how-to-overtime-equalization.html',
    path: '/guides/overtime-equalization',
    title: 'Scan and verify your MSOT · FDNY Mutual Tracker',
    description: 'Scan your Overtime Equalization Report, read the projected MSOT, and reconcile the report against your calendar.',
  },
  {
    file: '404.html',
    path: '/',
    title: 'Page not found · FDNY Mutual Tracker',
    description: 'That page could not be found. Head back to FDNY Mutual Tracker or browse the how-to guides.',
    robots: 'noindex',
  },
]

const routeFiles = [
  'index.html',
  'app-simulator/index.html',
  'guides/index.html',
  'guides/share-calendar/index.html',
  'guides/send-mxp-mutuals/index.html',
  'guides/overtime-equalization/index.html',
  'how-to-share-calendar.html',
  'Send-MxP-Mutuals.html',
  'how-to-overtime-equalization.html',
  '404.html',
]

const metadataByFile = new Map(routes.map(route => [route.file, route]))
for (const file of routeFiles) {
  if (!metadataByFile.has(file)) throw new Error(`No route metadata declared for ${file}`)
}
for (const route of routes) {
  if (!routeFiles.includes(route.file)) throw new Error(`${route.file} has metadata but is not in routeFiles`)
}

const escapeAttribute = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')

function replaceOnce(html, pattern, replacement, label) {
  if (!pattern.test(html)) throw new Error(`The built app shell no longer contains ${label}`)
  return html.replace(pattern, replacement)
}

const setTitle = (html, title) => replaceOnce(html, /<title>[\s\S]*?<\/title>/, `<title>${escapeAttribute(title)}</title>`, 'the <title> tag')
const setCanonical = (html, url) => replaceOnce(html, /(<link\s+rel="canonical"\s+href=")[^"]*(")/, `$1${escapeAttribute(url)}$2`, 'the canonical link')
const setMeta = (html, attribute, key, value) => replaceOnce(
  html,
  new RegExp(`(<meta\\s+${attribute}="${key}"\\s+content=")[^"]*(")`),
  `$1${escapeAttribute(value)}$2`,
  `<meta ${attribute}="${key}">`,
)

function renderRoute(shell, route) {
  const url = new URL(route.path, site).href
  let html = shell
  html = setTitle(html, route.title)
  html = setCanonical(html, url)
  html = setMeta(html, 'name', 'description', route.description)
  html = setMeta(html, 'property', 'og:title', route.title)
  html = setMeta(html, 'property', 'og:description', route.description)
  html = setMeta(html, 'property', 'og:url', url)
  html = setMeta(html, 'name', 'twitter:title', route.title)
  html = setMeta(html, 'name', 'twitter:description', route.description)
  if (route.robots) {
    html = replaceOnce(html, /(<link\s+rel="canonical"[^\n]*\n)/, `$1    <meta name="robots" content="${escapeAttribute(route.robots)}" />\n`, 'the canonical link')
  }
  return html
}

const shell = await readFile(appShell, 'utf8')

for (const routeFile of routeFiles) {
  const destination = resolve(outputDirectory, routeFile)
  await mkdir(dirname(destination), { recursive: true })
  await writeFile(destination, renderRoute(shell, metadataByFile.get(routeFile)))
}
