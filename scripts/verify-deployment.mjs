const required = ['API_URL', 'HOST_URL', 'OPERATION_REMOTE_URL', 'COMMERCIAL_REMOTE_URL', 'MANAGEMENT_REMOTE_URL']
const missing = required.filter(name => !process.env[name])
if (missing.length) throw new Error(`Variáveis ausentes: ${missing.join(', ')}`)

async function expectOk(label, url) {
  const response = await fetch(url, { redirect: 'error' })
  if (!response.ok) throw new Error(`${label} respondeu ${response.status}: ${url}`)
  console.log(`${label}: ${response.status}`)
  return response
}

await expectOk('API liveness', `${process.env.API_URL}/health/live`)
await expectOk('API readiness', `${process.env.API_URL}/health/ready`)
await expectOk('API metrics', `${process.env.API_URL}/metrics`)
await expectOk('Host', process.env.HOST_URL)

for (const [label, baseUrl] of [
  ['Operação', process.env.OPERATION_REMOTE_URL],
  ['Comercial', process.env.COMMERCIAL_REMOTE_URL],
  ['Gestão', process.env.MANAGEMENT_REMOTE_URL],
]) {
  const response = await expectOk(`remoteEntry ${label}`, `${baseUrl}/remoteEntry.js`)
  const cacheControl = response.headers.get('cache-control') ?? ''
  if (!/(no-store|no-cache|max-age=0)/i.test(cacheControl))
    throw new Error(`remoteEntry ${label} permite cache incompatível: "${cacheControl || '<ausente>'}"`)
}
