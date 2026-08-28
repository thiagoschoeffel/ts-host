<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import SidebarNavigation from './sidebar/SidebarNavigation.vue'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()

function closeOnEscape(event: KeyboardEvent) {
  if (event.key === 'Escape') emit('close')
}

onMounted(() => document.addEventListener('keydown', closeOnEscape))
onBeforeUnmount(() => document.removeEventListener('keydown', closeOnEscape))
</script>

<template>
  <Transition
    enter-active-class="transition-opacity duration-200"
    enter-from-class="opacity-0"
    leave-active-class="transition-opacity duration-200"
    leave-to-class="opacity-0">
    <button
      v-if="open"
      class="fixed inset-x-0 bottom-0 top-16 z-20 bg-slate-950/40 lg:hidden"
      aria-label="Fechar menu"
      type="button"
      @click="$emit('close')" />
  </Transition>

  <aside
    id="mobile-sidebar"
    class="fixed bottom-0 left-0 top-16 z-30 flex w-64 max-w-[calc(100vw-2rem)] flex-col bg-slate-800 text-slate-100 shadow-xl transition-transform duration-200 lg:hidden"
    :class="open ? 'translate-x-0' : '-translate-x-full'"
    :aria-hidden="!open"
    :inert="!open">
    <SidebarNavigation @navigate="$emit('close')" />
  </aside>
</template>
