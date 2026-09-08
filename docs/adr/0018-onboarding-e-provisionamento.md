# ADR 0018 — Onboarding e provisionamento durável

**Estado:** aceita para implementação  
**Data:** 8 de setembro de 2026

## Decisão

Onboarding é um agregado separado do ciclo de vida da organização e da assinatura. A criação registra intenção, organização em provisionamento, operação, etapa, outbox e auditoria em uma transação local, retornando `202` e `operationId`.

Um worker no deploy da API reivindica etapas com lease no PostgreSQL. Cada intenção e efeito externo é idempotente; tentativas usam backoff e limite, terminando em `NeedsAttention`. Não se mantém transação aberta durante Keycloak, SMTP ou Meta e não se adiciona broker/Redis na V1.

Convites armazenam somente hash do token de validação. Reemissão revoga o anterior; aceite é `POST`, de uso único, e cria associação na mesma transação.

## Consequências

Reload consulta o servidor. Falha retoma o primeiro passo incompleto e nunca apaga automaticamente identidade ou organização potencialmente compartilhada.

