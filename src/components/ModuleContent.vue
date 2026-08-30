<template>
  <main class="flex isolate min-h-[calc(100vh-4rem)] min-w-0 flex-1 flex-col bg-slate-50">
    <div class="flex min-h-16 flex-wrap items-center justify-between gap-x-4 gap-y-1 bg-slate-100 px-6 py-3">
      <slot name="breadcrumbs" />
      <slot name="mobile-context" />
    </div>

    <section class="flex-1 p-6">
      <Suspense>
        <slot />
        <template #fallback>Loading module...</template>
      </Suspense>
    </section>
  </main>
</template>
