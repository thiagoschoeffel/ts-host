<script setup lang="ts">
import { computed, ref } from 'vue'
import { Alert, Button, Card, CheckIcon, TriangleAlertIcon } from '@thiagoschoeffel/ts-components'
import { acceptInvitation } from '../auth'

const token = computed(() => new URLSearchParams(window.location.search).get('token') ?? '')
const accepting = ref(false)
const accepted = ref(false)
const error = ref('')

async function accept() {
  if (!token.value) { error.value = 'O link não contém um token de convite válido.'; return }
  accepting.value = true; error.value = ''
  try { await acceptInvitation(token.value); accepted.value = true }
  catch (reason) { error.value = reason instanceof Error ? reason.message : 'Não foi possível aceitar o convite.' }
  finally { accepting.value = false }
}
function continueToApp() { window.location.assign('/') }
</script>

<template>
  <section class="mx-auto flex min-h-[calc(100dvh-3rem)] max-w-md items-center">
    <Card class="w-full">
      <template #header>
        <h1 class="text-lg font-semibold text-slate-800">Convite de acesso</h1>
        <p class="mt-1 text-sm text-slate-500">Confirme para associar sua identidade autenticada à organização.</p>
      </template>
      <Alert v-if="accepted" variants="success" title="Convite aceito" description="Seu acesso foi ativado. Você já pode entrar na organização."><template #icon><CheckIcon /></template></Alert>
      <Alert v-else-if="error" variants="danger" title="Não foi possível aceitar" :description="error"><template #icon><TriangleAlertIcon /></template></Alert>
      <template #footer>
        <Button v-if="accepted" class="w-full" @click="continueToApp">Continuar</Button>
        <Button v-else class="w-full" :loading="accepting" :disabled="!token" @click="accept">Aceitar convite</Button>
      </template>
    </Card>
  </section>
</template>
