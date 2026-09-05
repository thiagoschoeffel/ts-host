<script setup lang="ts">
import { Avatar, LogOutIcon, MenuIcon } from '@thiagoschoeffel/ts-components'
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

      <div class="flex items-center gap-3">
        <div class="flex size-8 items-center justify-center rounded bg-slate-800 text-sm font-bold text-white">L</div>
        <h1 class="text-lg font-semibold text-slate-800">System</h1>
      </div>
    </div>

    <span class="hidden flex-1 text-center font-semibold text-slate-800 md:block">
      {{ currentDateLabel }}
    </span>

    <div class="ml-auto flex items-center gap-3 md:ml-0">
      <label class="sr-only" for="active-organization">Organização ativa</label>
      <select
        id="active-organization"
        :value="session.activeOrganizationId"
        class="w-28 rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm text-slate-800 md:w-auto md:max-w-52 md:px-3"
        @change="$emit('changeOrganization', ($event.target as HTMLSelectElement).value)">
        <option v-for="organization in session.organizations" :key="organization.id" :value="organization.id">
          {{ organization.name }}
        </option>
      </select>
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
