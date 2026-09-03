<script setup lang="ts">
import { Avatar, LogOutIcon, MenuIcon } from '@thiagoschoeffel/ts-components'

defineProps<{
  currentDateLabel: string
  mobileSidebarOpen: boolean
}>()
defineEmits<{
  toggleDesktopSidebar: []
  toggleMobileSidebar: []
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
      <Avatar fallback="US" />
      <button class="rounded p-2 text-red-600" aria-label="Log out" title="Log out">
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
