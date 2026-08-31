<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import AppBreadcrumbs, { type BreadcrumbItem } from './components/AppBreadcrumbs.vue'
import AppHeader from './components/AppHeader.vue'
import AppSidebar from './components/AppSidebar.vue'
import AppSidebarDrawer from './components/AppSidebarDrawer.vue'
import ModuleContent from './components/ModuleContent.vue'
import { formatCurrentDateLabel } from './utils/date'

const SIDEBAR_STORAGE_KEY = 'ts-host:sidebar-collapsed'
const isSidebarCollapsed = ref(
  localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true'
)
const isMobileSidebarOpen = ref(false)
const currentDateLabel = formatCurrentDateLabel()
const route = useRoute()
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

  if (typeof parentLabel === 'string') {
    items.push({
      label: parentLabel,
      href: parentHref === '/operacoes/pedidos' && returnToOrders
        ? returnToOrders
        : typeof parentHref === 'string' ? parentHref : undefined
    })
  }

  const currentLabel = typeof route.params.id === 'string'
    && (route.meta.label === 'Pedido' || route.meta.label === 'Editar pedido')
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
  <div class="min-h-screen">
    <AppHeader
      :current-date-label="currentDateLabel"
      :mobile-sidebar-open="isMobileSidebarOpen"
      @toggle-desktop-sidebar="isSidebarCollapsed = !isSidebarCollapsed"
      @toggle-mobile-sidebar="isMobileSidebarOpen = !isMobileSidebarOpen" />
    <AppSidebarDrawer :open="isMobileSidebarOpen" @close="isMobileSidebarOpen = false" />
    <div class="flex">
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
