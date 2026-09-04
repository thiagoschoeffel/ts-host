<script setup lang="ts">
import { Button, Card, TriangleAlertIcon } from '@thiagoschoeffel/ts-components'
import { remoteLoadError } from '../router'

function retry() {
  window.location.reload()
}
</script>

<template>
  <main class="flex isolate h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-slate-50">
    <div class="flex min-h-16 shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-1 bg-slate-100 px-6 py-3">
      <slot name="breadcrumbs" />
      <slot name="mobile-context" />
    </div>

    <section class="min-h-0 flex-1 overflow-y-auto p-6">
      <Card v-if="remoteLoadError" class="mx-auto mt-10 max-w-lg text-center" role="alert">
        <TriangleAlertIcon class="mx-auto size-10 text-amber-600" aria-hidden="true" />
        <h1 class="mt-4 text-lg font-semibold text-slate-900">Não foi possível carregar este módulo</h1>
        <p class="mt-2 text-sm text-slate-500">Verifique sua conexão e tente carregar o módulo novamente.</p>
        <Button class="mt-5" type="button" @click="retry">Tentar novamente</Button>
      </Card>
      <Suspense v-else>
        <slot />
        <template #fallback>
          <p class="py-10 text-center text-sm text-slate-500" role="status">Carregando módulo...</p>
        </template>
      </Suspense>
    </section>
  </main>
</template>
