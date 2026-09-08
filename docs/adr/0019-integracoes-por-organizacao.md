# ADR 0019 — Integrações externas por organização

**Estado:** aceita para implementação  
**Data:** 8 de setembro de 2026

## Decisão

Toda conexão externa terá `OrganizationId`, provedor, ativos externos verificados, estado, saúde e referências a segredos. O servidor resolve a conexão a partir de identificadores externos e assinatura válida; `organizationId` do payload nunca concede autoridade.

Segredos não retornam ao browser e ficam atrás de uma abstração de armazenamento cifrado. Webhooks são persistidos e deduplicados por provedor, conexão e evento. A configuração global legada será migrada para uma conexão vinculada explicitamente à organização atual e o fallback será removido após homologação A/B.

## Consequências

WhatsApp permanece opcional para ativação. Suspensão impede novos efeitos de negócio, preservando uma via técnica restrita para registrar e reconciliar callbacks legítimos.

