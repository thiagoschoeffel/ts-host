import { authenticatedFetch, hasAuthenticatedSession } from './auth'

let reporting = false

export async function reportClientError(reason: unknown, source: string) {
  if (reporting || !hasAuthenticatedSession()) return
  reporting = true
  const error = reason instanceof Error ? reason : new Error(String(reason))
  try {
    await authenticatedFetch('/api/telemetry/client-errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: error.name, message: error.message, source }),
    })
  }
  catch {
    // Telemetry must never replace the original user-facing failure.
  }
  finally {
    reporting = false
  }
}

export function installClientErrorCapture() {
  window.addEventListener('error', event => void reportClientError(event.error ?? event.message, 'window.error'))
  window.addEventListener('unhandledrejection', event => void reportClientError(event.reason, 'window.unhandledrejection'))
}
