<script setup lang="ts">
export interface BreadcrumbItem {
  label: string
  href?: string
}

defineProps<{
  items: BreadcrumbItem[]
}>()
</script>

<template>
  <nav
    class="min-w-[min(20rem,100%)] max-w-full flex-1 overflow-hidden"
    aria-label="Breadcrumb">
    <ol class="flex min-w-0 items-center gap-2 text-sm">
      <li
        v-for="(item, index) in items"
        :key="`${item.label}-${index}`"
        class="flex min-w-0 items-center gap-2">
        <span v-if="index > 0" aria-hidden="true" class="text-slate-300">/</span>

        <a
          v-if="item.href && index < items.length - 1"
          :href="item.href"
          class="truncate text-slate-500 hover:text-slate-700">
          {{ item.label }}
        </a>
        <span
          v-else
          class="truncate"
          :aria-current="index === items.length - 1 ? 'page' : undefined"
          :class="index === items.length - 1 ? 'font-medium text-slate-700' : 'text-slate-500'">
          {{ item.label }}
        </span>
      </li>
    </ol>
  </nav>
</template>
