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
  activeOrganizationId: string
  organizations: SessionOrganization[]
}

const authority = import.meta.env.VITE_OIDC_AUTHORITY || 'http://localhost:8081/realms/sabor-sante'
const apiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/$/, '')
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
let postAuthenticationPath: string | null = null

async function loadSession(organizationId?: string) {
  if (!oidcUser.value || oidcUser.value.expired)
    throw new Error('A sessão expirou.')

  const response = await fetch(`${apiUrl}/api/session`, {
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

export async function initializeAuthentication() {
  if (oidcUser.value && !oidcUser.value.expired && session.value) {
    loading.value = false
    return
  }

  loading.value = true
  error.value = null
  try {
    const isCallback = window.location.pathname === '/auth/callback'
      && new URLSearchParams(window.location.search).has('code')
    if (isCallback) {
      const authenticated = await manager.signinRedirectCallback()
      const returnUrl = typeof authenticated.state === 'string' && /^\/(?!\/)/.test(authenticated.state)
        ? authenticated.state
        : '/'
      postAuthenticationPath = returnUrl
    }

    oidcUser.value = await manager.getUser()
    if (!oidcUser.value || oidcUser.value.expired) {
      await manager.signinRedirect({ state: `${window.location.pathname}${window.location.search}` })
      return
    }
    await loadSession()
  }
  catch (reason) {
    error.value = reason instanceof Error ? reason.message : 'Falha ao iniciar a sessão.'
  }
  finally {
    loading.value = false
  }
}

export async function changeOrganization(organizationId: string) {
  loading.value = true
  error.value = null
  try {
    await loadSession(organizationId)
  }
  catch (reason) {
    error.value = reason instanceof Error ? reason.message : 'Não foi possível trocar a organização.'
    throw reason
  }
  finally {
    loading.value = false
  }
}

export async function signOut() {
  await manager.signoutRedirect({ id_token_hint: oidcUser.value?.id_token })
}

manager.events.addUserLoaded((user) => { oidcUser.value = user })
manager.events.addUserUnloaded(() => { oidcUser.value = null; session.value = null })

export function useAuthentication() {
  return {
    session,
    loading,
    error,
    isAuthenticated: computed(() => Boolean(oidcUser.value && session.value)),
    initialize: initializeAuthentication,
    changeOrganization,
    signOut,
  }
}

export function hasAuthenticatedSession() {
  return Boolean(oidcUser.value && !oidcUser.value.expired && session.value)
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

  const headers = new Headers(init.headers)
  headers.set('Authorization', `Bearer ${user.access_token}`)
  headers.set('X-Organization-Id', activeSession.activeOrganizationId)
  return fetch(`${apiUrl}${path}`, { ...init, headers })
}
