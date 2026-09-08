# ADR 0016 — Autorização global da plataforma

**Estado:** aceita para implementação  
**Data:** 8 de setembro de 2026

## Contexto

O contexto atual une usuário e organização em `IsAvailable`, enquanto operadores globais podem não possuir associação empresarial. Papéis tenant não representam poderes sobre o SaaS.

## Decisão

Separar identidade autenticada, contexto tenant e ator global. Grants globais persistidos associam um `PlatformUser` a perfis/capacidades, com validade, revogação, autoria e versão. Policies/requirements do ASP.NET Core validam a capacidade em cada endpoint. Rotas recebem metadado explícito de classe; teste de arquitetura rejeita endpoint `/api` não classificado.

O bootstrap do primeiro operador será comando fora do frontend, idempotente e auditado. Não haverá promoção por e-mail, domínio, primeira organização ou papel `Owner`.

## Consequências

O middleware resolve sempre a identidade e só resolve tenant para endpoints de negócio. APIs globais não usam `X-Organization-Id`; APIs de negócio continuam fail-closed e com as policies existentes.

