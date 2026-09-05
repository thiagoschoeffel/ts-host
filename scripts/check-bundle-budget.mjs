import { readdirSync, readFileSync, statSync } from 'node:fs'
import { extname, join, relative } from 'node:path'
import { gzipSync } from 'node:zlib'

const config = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')).bundleBudget
if (!config) throw new Error('package.json não define bundleBudget.')

function files(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = join(directory, entry.name)
    return entry.isDirectory() ? files(path) : [path]
  })
}

let failed = false
for (const path of files('dist')) {
  const extension = extname(path).slice(1)
  const budget = path.endsWith('remoteEntry.js') || /remoteEntry-[^/]+\.js$/.test(path)
    ? config.remoteEntry
    : config[extension]
  if (!budget) continue
  const bytes = statSync(path).size
  const gzipBytes = gzipSync(readFileSync(path)).length
  const label = relative('.', path)
  console.log(`${label}: ${bytes} B; gzip ${gzipBytes} B`)
  if (bytes > budget.bytes || gzipBytes > budget.gzipBytes) {
    console.error(`ORÇAMENTO EXCEDIDO: ${label} (máximo ${budget.bytes} B; gzip ${budget.gzipBytes} B)`)
    failed = true
  }
}
if (failed) process.exitCode = 1

