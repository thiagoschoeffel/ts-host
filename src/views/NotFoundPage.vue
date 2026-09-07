<script setup lang="ts">
import { Button, EmptyState, SearchIcon } from '@thiagoschoeffel/ts-components'
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <EmptyState
    class="bg-white shadow-sm"
    size="large"
    title="Página não encontrada"
    description="O endereço informado não existe ou deixou de estar disponível.">
    <template #icon><SearchIcon /></template>
    <template #action>
      <Button @click="router.push('/operacoes/hoje')">Ir para Hoje</Button>
    </template>
  </EmptyState>
</template>
