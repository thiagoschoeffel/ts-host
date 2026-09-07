import { authenticatedFetch, hasAuthenticatedSession } from './auth'

interface PendingError { name: string, message: string, source: string, fingerprint: string }
const queue: PendingError[] = []
const recent = new Map<string, number>()
let processing = false
const MAX_QUEUE_SIZE = 20
const DEDUPLICATION_WINDOW = 30_000

function scrub(value: string) {
  return value
    .replace(/Bearer\s+[A-Za-z0-9._~-]+/gi, 'Bearer [redacted]')
    .replace(/\b[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}\b/g, '[email]')
    .replace(/\+?\d[\d\s().-]{8,}\d/g, '[phone]')
    .slice(0, 1_000)
}

async function processQueue() {
  if (processing) return
  processing = true
  try {
    while (queue.length && hasAuthenticatedSession()) {
      const item = queue.shift()!
      try {
        await authenticatedFetch('/api/telemetry/client-errors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: item.name, message: item.message, source: item.source }),
        })
      }
      catch {
        // Telemetry must never replace the original user-facing failure.
      }
    }
  }
  finally { processing = false }
}

export async function reportClientError(reason: unknown, source: string) {
  if (!hasAuthenticatedSession()) return
  const error = reason instanceof Error ? reason : new Error(String(reason))
  const item = { name: scrub(error.name), message: scrub(error.message), source: scrub(source) }
  const fingerprint = `${item.name}:${item.message}:${item.source}`
  const now = Date.now()
  if ((recent.get(fingerprint) ?? 0) > now - DEDUPLICATION_WINDOW) return
  recent.set(fingerprint, now)
  for (const [key, occurredAt] of recent) if (occurredAt <= now - DEDUPLICATION_WINDOW) recent.delete(key)
  if (queue.length >= MAX_QUEUE_SIZE) queue.shift()
  queue.push({ ...item, fingerprint })
  await processQueue()
}

export function installClientErrorCapture() {
  window.addEventListener('error', event => void reportClientError(event.error ?? event.message, 'window.error'))
  window.addEventListener('unhandledrejection', event => void reportClientError(event.reason, 'window.unhandledrejection'))
}
