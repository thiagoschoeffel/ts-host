import { computed, ref } from 'vue'
import { UserManager, WebStorageStateStore, type User } from 'oidc-client-ts'

export interface SessionOrganization {
  id: string
  name: string
  slug: string
  role: 'Owner' | 'Administrator' | 'Operator' | 'DeliveryDriver'
  isActive: boolean
}

export interface Session {
  userId: string
  displayName: string
  activeOrganizationId: string | null
  organizations: SessionOrganization[]
  platform: {
    profiles: Array<'PlatformAdministrator' | 'PlatformOnboardingOperator' | 'PlatformSupportReader'>
    capabilities: string[]
  }
}

function requiredProductionSetting(name: string, value: string | undefined, developmentFallback: string) {
  if (value) return value
  if (import.meta.env.PROD) throw new Error(`${name} é obrigatória em produção.`)
  return developmentFallback
}

const authority = requiredProductionSetting('VITE_OIDC_AUTHORITY', import.meta.env.VITE_OIDC_AUTHORITY, 'http://localhost:8081/realms/ts')
const apiUrl = requiredProductionSetting('VITE_API_URL', import.meta.env.VITE_API_URL, 'http://localhost:8080').replace(/\/$/, '')
const redirectUri = `${window.location.origin}/auth/callback`
const manager = new UserManager({
  authority,
  client_id: import.meta.env.VITE_OIDC_CLIENT_ID || 'ts-host',
  redirect_uri: redirectUri,
  post_logout_redirect_uri: window.location.origin,
  response_type: 'code',
  scope: 'openid profile email',
  automaticSilentRenew: true,
  userStore: new WebStorageStateStore({ store: window.sessionStorage }),
})

const oidcUser = ref<User | null>(null)
const session = ref<Session | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const organizationError = ref<string | null>(null)
let postAuthenticationPath: string | null = null
let authenticationInitialization: Promise<void> | null = null

function isMissingSigninState(reason: unknown) {
  return reason instanceof Error && reason.message.includes('No matching state found in storage')
}

async function loadSession(organizationId?: string) {
  if (!oidcUser.value || oidcUser.value.expired)
    throw new Error('A sessão expirou.')

  const response = await fetch(`${apiUrl}/api/identity/session`, {
    headers: {
      Authorization: `Bearer ${oidcUser.value.access_token}`,
      ...(organizationId ? { 'X-Organization-Id': organizationId } : {}),
    },
  })
  if (!response.ok)
    throw new Error(response.status === 403
      ? 'Seu usuário não possui acesso ativo à organização.'
      : 'Não foi possível validar a sessão.')
  session.value = await response.json() as Session
}

async function runAuthenticationInitialization() {
  error.value = null
  organizationError.value = null
  if (oidcUser.value && !oidcUser.value.expired && session.value) {
    loading.value = false
    return
  }

  loading.value = true
  try {
    const isCallback = window.location.pathname === '/auth/callback'
      && new URLSearchParams(window.location.search).has('code')
    if (isCallback) {
      try {
        const authenticated = await manager.signinRedirectCallback()
        const returnUrl = typeof authenticated.state === 'string' && /^\/(?!\/)/.test(authenticated.state)
          ? authenticated.state
          : '/'
        postAuthenticationPath = returnUrl
      }
      catch (reason) {
        if (!isMissingSigninState(reason)) throw reason

        const authenticated = await manager.getUser()
        window.history.replaceState(null, document.title, '/')
        if (!authenticated || authenticated.expired) {
          await manager.signinRedirect({ state: '/' })
          return
        }
        oidcUser.value = authenticated
        postAuthenticationPath = '/'
      }
    }

    oidcUser.value ??= await manager.getUser()
    if (!oidcUser.value || oidcUser.value.expired) {
      await manager.signinRedirect({ state: `${window.location.pathname}${window.location.search}` })
      return
    }
    const identityOnlyPath = postAuthenticationPath ?? window.location.pathname
    if (!identityOnlyPath.startsWith('/convites/aceitar')) await loadSession()
  }
  catch (reason) {
    error.value = reason instanceof Error ? reason.message : 'Falha ao iniciar a sessão.'
  }
  finally {
    loading.value = false
  }
}

export function initializeAuthentication() {
  if (authenticationInitialization) return authenticationInitialization
  authenticationInitialization = runAuthenticationInitialization()
    .finally(() => { authenticationInitialization = null })
  return authenticationInitialization
}

export async function changeOrganization(organizationId: string) {
  loading.value = true
  organizationError.value = null
  try {
    await loadSession(organizationId)
  }
  catch (reason) {
    organizationError.value = reason instanceof Error ? reason.message : 'Não foi possível trocar a organização.'
    throw reason
  }
  finally {
    loading.value = false
  }
}

export async function signOut() {
  await manager.signoutRedirect({ id_token_hint: oidcUser.value?.id_token })
}

manager.events.addUserLoaded((user) => {
  oidcUser.value = user
  void loadSession(session.value?.activeOrganizationId ?? undefined).catch((reason) => {
    session.value = null
    error.value = reason instanceof Error ? reason.message : 'Não foi possível atualizar a sessão.'
  })
})
manager.events.addUserUnloaded(() => { oidcUser.value = null; session.value = null })

export function useAuthentication() {
  return {
    session,
    loading,
    error,
    organizationError,
    isAuthenticated: computed(() => Boolean(oidcUser.value && !oidcUser.value.expired)),
    initialize: initializeAuthentication,
    changeOrganization,
    signOut,
  }
}

export function hasAuthenticatedSession() {
  return Boolean(oidcUser.value && !oidcUser.value.expired && session.value)
}

export function hasAuthenticatedIdentity() {
  return Boolean(oidcUser.value && !oidcUser.value.expired)
}

export async function acceptInvitation(token: string) {
  const response = await identityRequest('/api/identity/invitations/accept', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token })
  })
  if (!response.ok) {
    const problem = await response.json().catch(() => ({})) as { detail?: string, title?: string }
    throw new Error(problem.detail ?? problem.title ?? 'Não foi possível aceitar o convite.')
  }
  await loadSession()
}

export function getCurrentSession() {
  return session.value
}

export function takePostAuthenticationPath() {
  const path = postAuthenticationPath
  postAuthenticationPath = null
  return path
}

export async function authenticatedFetch(path: string, init: RequestInit = {}) {
  const user = oidcUser.value
  const activeSession = session.value
  if (!user || user.expired || !activeSession)
    throw new Error('A sessão autenticada não está disponível.')
  if (!activeSession.activeOrganizationId)
    throw new Error('Selecione uma organização ativa antes de acessar dados operacionais.')

  const headers = new Headers(init.headers)
  const correlationId = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`
  headers.set('Authorization', `Bearer ${user.access_token}`)
  headers.set('X-Organization-Id', activeSession.activeOrganizationId)
  headers.set('X-Correlation-Id', correlationId)
  return fetch(`${apiUrl}${path}`, { ...init, headers })
}

async function authenticatedContextFetch(path: string, expectedPrefix: string, init: RequestInit = {}) {
  const user = oidcUser.value
  if (!user || user.expired)
    throw new Error('A sessão autenticada não está disponível.')
  if (!path.startsWith(expectedPrefix))
    throw new Error(`O transporte só aceita rotas sob ${expectedPrefix}.`)

  const headers = new Headers(init.headers)
  const correlationId = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`
  headers.set('Authorization', `Bearer ${user.access_token}`)
  headers.set('X-Correlation-Id', correlationId)
  headers.delete('X-Organization-Id')
  return fetch(`${apiUrl}${path}`, { ...init, headers })
}

export function identityRequest(path: string, init: RequestInit = {}) {
  return authenticatedContextFetch(path, '/api/identity/', init)
}

export function platformRequest(path: string, init: RequestInit = {}) {
  return authenticatedContextFetch(path, '/api/platform/', init)
}
