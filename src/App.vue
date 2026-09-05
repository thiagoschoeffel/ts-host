<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Button } from '@thiagoschoeffel/ts-components'
import { RouterView, useRoute } from 'vue-router'
import AppBreadcrumbs, { type BreadcrumbItem } from './components/AppBreadcrumbs.vue'
import AppHeader from './components/AppHeader.vue'
import AppSidebar from './components/AppSidebar.vue'
import AppSidebarDrawer from './components/AppSidebarDrawer.vue'
import ModuleContent from './components/ModuleContent.vue'
import { formatCurrentDateLabel } from './utils/date'
import { useAuthentication } from './auth'

const SIDEBAR_STORAGE_KEY = 'ts-host:sidebar-collapsed'
const isSidebarCollapsed = ref(
  localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true'
)
const isMobileSidebarOpen = ref(false)
const currentDateLabel = formatCurrentDateLabel()
const route = useRoute()
const authentication = useAuthentication()
const breadcrumbs = computed(() => {
  const items: BreadcrumbItem[] = [
    { label: String(route.meta.sectionLabel ?? 'Operações') }
  ]
  const parentLabel = route.meta.parentLabel
  const parentHref = route.meta.parentHref
  const returnToOrders = typeof route.query.retorno === 'string'
    && /^\/operacoes\/pedidos(?:\?.*)?$/.test(route.query.retorno)
    ? route.query.retorno
    : undefined
  const returnToCustomers = typeof route.query.retorno === 'string'
    && /^\/clientes(?:\?.*)?$/.test(route.query.retorno)
    ? route.query.retorno
    : undefined
  const returnToProducibles = typeof route.query.retorno === 'string'
    && /^\/produziveis(?:\?.*)?$/.test(route.query.retorno)
    ? route.query.retorno
    : undefined
  const returnToCatalog = typeof route.query.retorno === 'string'
    && /^\/catalogo(?:\?.*)?$/.test(route.query.retorno)
    ? route.query.retorno
    : undefined
  const returnToDeliveryDrivers = typeof route.query.retorno === 'string'
    && /^\/entregadores(?:\?.*)?$/.test(route.query.retorno)
    ? route.query.retorno
    : undefined
  const returnToUsers = typeof route.query.retorno === 'string'
    && /^\/usuarios(?:\?.*)?$/.test(route.query.retorno)
    ? route.query.retorno
    : undefined
  const returnToPlans = typeof route.query.retorno === 'string'
    && /^\/planos(?:\?.*)?$/.test(route.query.retorno)
    ? route.query.retorno
    : undefined

  if (typeof parentLabel === 'string') {
    items.push({
      label: parentLabel,
      href: parentHref === '/operacoes/pedidos' && returnToOrders
        ? returnToOrders
        : parentHref === '/clientes' && returnToCustomers
          ? returnToCustomers
          : parentHref === '/produziveis' && returnToProducibles
            ? returnToProducibles
            : parentHref === '/catalogo' && returnToCatalog
              ? returnToCatalog
              : parentHref === '/entregadores' && returnToDeliveryDrivers
                ? returnToDeliveryDrivers
                : parentHref === '/usuarios' && returnToUsers
                  ? returnToUsers
                  : parentHref === '/planos' && returnToPlans
                    ? returnToPlans
          : typeof parentHref === 'string' ? parentHref : undefined
    })
  }

  const currentLabel = typeof route.params.id === 'string'
    && ['Pedido', 'Editar pedido', 'Item produzível', 'Editar item', 'Nova composição', 'Oferta', 'Editar oferta', 'Editar entregador', 'Editar usuário', 'Editar plano'].includes(String(route.meta.label))
    ? `${String(route.meta.label)} #${route.params.id}`
    : String(route.meta.label ?? '')
  items.push({ label: currentLabel })
  return items
})

watch(isSidebarCollapsed, (collapsed) => {
  localStorage.setItem(SIDEBAR_STORAGE_KEY, String(collapsed))
})
</script>

<template>
  <main v-if="authentication.loading.value" class="flex h-dvh items-center justify-center bg-slate-50">
    <div class="flex items-center gap-3 text-sm text-slate-600" role="status">
      <span class="size-2 animate-pulse rounded-full bg-slate-500" aria-hidden="true" />
      Validando sessão…
    </div>
  </main>
  <main v-else-if="authentication.error.value || !authentication.isAuthenticated.value"
    class="flex h-dvh items-center justify-center bg-slate-50 p-6">
    <section class="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 text-center shadow-xs">
      <h1 class="text-lg font-semibold text-slate-800">Não foi possível entrar</h1>
      <p class="mt-2 text-sm text-slate-500">{{ authentication.error.value }}</p>
      <Button class="mt-5" @click="authentication.initialize">Tentar novamente</Button>
    </section>
  </main>
  <div v-else class="flex h-dvh flex-col overflow-hidden">
    <AppHeader
      :current-date-label="currentDateLabel"
      :mobile-sidebar-open="isMobileSidebarOpen"
      :session="authentication.session.value!"
      @toggle-desktop-sidebar="isSidebarCollapsed = !isSidebarCollapsed"
      @toggle-mobile-sidebar="isMobileSidebarOpen = !isMobileSidebarOpen"
      @change-organization="authentication.changeOrganization"
      @logout="authentication.signOut" />
    <AppSidebarDrawer :open="isMobileSidebarOpen" @close="isMobileSidebarOpen = false" />
    <div class="flex min-h-0 flex-1 overflow-hidden">
      <AppSidebar :collapsed="isSidebarCollapsed" />
      <ModuleContent>
        <RouterView />
        <template #breadcrumbs>
          <AppBreadcrumbs :items="breadcrumbs" />
        </template>
        <template #mobile-context>
          <span class="shrink-0 whitespace-nowrap text-sm font-semibold text-slate-800 md:hidden">
            {{ currentDateLabel }}
          </span>
        </template>
      </ModuleContent>
    </div>
  </div>
</template>
