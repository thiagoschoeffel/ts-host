<template>
  <main class="flex isolate h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-slate-50">
    <div class="flex min-h-16 shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-1 bg-slate-100 px-6 py-3">
      <slot name="breadcrumbs" />
      <slot name="mobile-context" />
    </div>

    <section class="min-h-0 flex-1 overflow-y-auto p-6">
      <Suspense>
        <slot />
        <template #fallback>Loading module...</template>
      </Suspense>
    </section>
  </main>
</template>
