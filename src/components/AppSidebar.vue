<script setup lang="ts">
import SidebarNavigation from './sidebar/SidebarNavigation.vue'

defineProps<{ collapsed: boolean }>()
</script>

<template>
  <aside
    class="app-sidebar hidden h-full shrink-0 bg-slate-800 text-slate-100 transition-[width] duration-200 lg:block"
    :class="collapsed ? 'w-[4.5rem]' : 'w-64'">
    <div class="flex h-full flex-col">
      <SidebarNavigation :collapsed="collapsed" />
    </div>
  </aside>
</template>

<style scoped>
@media (width >= 64rem) {
  .app-sidebar {
    display: block;
  }
}
</style>
