<script setup lang="ts">
import SidebarNavigation from './sidebar/SidebarNavigation.vue'

defineProps<{ collapsed: boolean }>()
</script>

<template>
  <aside
    class="app-sidebar sticky top-16 hidden h-[calc(100vh-4rem)] shrink-0 flex-col bg-slate-800 text-slate-100 transition-[width] duration-200 lg:flex"
    :class="collapsed ? 'w-[4.5rem]' : 'w-64'">
    <SidebarNavigation :collapsed="collapsed" />
  </aside>
</template>

<style scoped>
@media (width >= 64rem) {
  .app-sidebar {
    display: flex;
  }
}
</style>
