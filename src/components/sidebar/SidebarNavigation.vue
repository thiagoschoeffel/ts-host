<script setup lang="ts">
import { ScrollArea } from '@thiagoschoeffel/ts-components'
import { navigationSections } from './navigation'

defineProps<{ collapsed?: boolean }>()
defineEmits<{ navigate: [] }>()
</script>

<template>
  <ScrollArea class="min-h-0 flex-1" aria-label="Navegação principal">
    <nav :class="collapsed ? 'p-3' : 'p-6'">
      <section
        v-for="(section, sectionIndex) in navigationSections"
        :key="section.label"
        :class="sectionIndex > 0 && (collapsed ? 'mt-3 border-t border-slate-700 pt-3' : 'mt-6')">
        <h2 v-if="!collapsed" class="px-2 text-sm font-semibold text-slate-400">
          {{ section.label }}
        </h2>

        <ul :class="['space-y-1', !collapsed && 'mt-2']">
          <li v-for="item in section.items" :key="item.label">
            <RouterLink
              v-if="item.to"
              :to="item.to"
              class="flex w-full items-center gap-3 rounded p-2 text-left text-sm transition-colors hover:bg-slate-700 hover:text-white"
              :class="collapsed && 'justify-center'"
              active-class="bg-slate-700 text-white"
              :title="collapsed ? item.label : undefined"
              @click="$emit('navigate')">
              <component :is="item.icon" :size="20" :stroke-width="1.75" class="shrink-0" />
              <span v-if="!collapsed">{{ item.label }}</span>
            </RouterLink>
            <button
              v-else
              class="flex w-full items-center gap-3 rounded p-2 text-left text-sm transition-colors hover:bg-slate-700 hover:text-white"
              :class="collapsed && 'justify-center'"
              :title="collapsed ? item.label : undefined"
              type="button">
              <component :is="item.icon" :size="20" :stroke-width="1.75" class="shrink-0" />
              <span v-if="!collapsed">{{ item.label }}</span>
            </button>
          </li>
        </ul>
      </section>
    </nav>
  </ScrollArea>
</template>
