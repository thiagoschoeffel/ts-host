<script setup lang="ts">
import { Avatar, LogOutIcon, MenuIcon, Select } from '@thiagoschoeffel/ts-components'
import type { Session } from '../auth'

defineProps<{
  currentDateLabel: string
  mobileSidebarOpen: boolean
  session: Session
}>()
defineEmits<{
  toggleDesktopSidebar: []
  toggleMobileSidebar: []
  changeOrganization: [organizationId: string]
  logout: []
}>()
</script>

<template>
  <header class="z-10 flex h-16 shrink-0 items-center gap-4 bg-white px-4 shadow-xs">
    <div class="flex items-center gap-4">
      <button
        class="rounded p-2 lg:hidden"
        aria-label="Alternar menu"
        aria-controls="mobile-sidebar"
        :aria-expanded="mobileSidebarOpen"
        @click="$emit('toggleMobileSidebar')">
        <MenuIcon :size="20" />
      </button>
      <button
        class="desktop-sidebar-toggle hidden rounded p-2 lg:block"
        aria-label="Alternar barra lateral"
        @click="$emit('toggleDesktopSidebar')">
        <MenuIcon :size="20" />
      </button>

      <div class="flex size-8 items-center justify-center rounded bg-slate-800 text-sm font-bold text-white" aria-label="TS">TS</div>
    </div>

    <span class="hidden flex-1 text-center font-semibold text-slate-800 md:block">
      {{ currentDateLabel }}
    </span>

    <div class="ml-auto flex items-center gap-3 md:ml-0">
      <div class="w-28 md:w-52">
        <Select
          id="active-organization"
          :model-value="session.activeOrganizationId"
          :options="session.organizations.map(organization => ({ value: organization.id, label: organization.name }))"
          aria-label="Organização ativa"
          @update:model-value="$emit('changeOrganization', $event)" />
      </div>
      <span class="hidden sm:block">
        <Avatar :fallback="session.displayName.slice(0, 2).toUpperCase()" :title="session.displayName" />
      </span>
      <button class="rounded p-2 text-red-600 hover:bg-red-50" aria-label="Sair" title="Sair"
        @click="$emit('logout')">
        <LogOutIcon :size="20" />
      </button>
    </div>
  </header>
</template>

<style scoped>
@media (width >= 64rem) {
  .desktop-sidebar-toggle {
    display: block;
  }
}
</style>
