import { copyFile, mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

const outputDirectory = resolve('dist')
const appShell = resolve(outputDirectory, 'index.html')
const routeFiles = [
  'guides/index.html',
  'guides/share-calendar/index.html',
  'guides/send-mxp-mutuals/index.html',
  'how-to-share-calendar.html',
  'Send-MxP-Mutuals.html',
  '404.html',
]

for (const routeFile of routeFiles) {
  const destination = resolve(outputDirectory, routeFile)
  await mkdir(dirname(destination), { recursive: true })
  await copyFile(appShell, destination)
}
