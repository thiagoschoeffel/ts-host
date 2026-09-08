# ADR 0019 — Integrações externas por organização

**Estado:** aceita e implementada na S07
**Data:** 8 de setembro de 2026

## Decisão

Toda conexão externa terá `OrganizationId`, provedor, ativos externos verificados, estado, saúde e referências a segredos. O servidor resolve a conexão a partir de identificadores externos e assinatura válida; `organizationId` do payload nunca concede autoridade.

Segredos não retornam ao browser e ficam atrás de uma abstração de armazenamento cifrado. Webhooks são persistidos e deduplicados por provedor, conexão e evento. A configuração global legada será migrada para uma conexão vinculada explicitamente à organização atual e o fallback será removido após homologação A/B.

A implementação usa uma conexão WhatsApp única por organização, com conta externa, número da Meta,
número comercial, estado, saúde e versão otimista. O salvamento administrativo confirma o ativo na
Graph API antes de marcá-lo saudável. Token de acesso, app secret e token de verificação são
registros separados cifrados com AES-256-GCM e chave externa ao banco. O webhook público recebe o
ID opaco da conexão, valida HMAC e confere o `phone_number_id`; o tenant é então resolvido no
servidor. Recibos únicos por conexão/evento registram o processamento concluído; a idempotência das
mensagens e transições do Atendimento impede efeitos duplicados durante concorrência e retentativa.

O bootstrap compatível lê a configuração global anterior apenas quando o conjunto legado está
completo e ainda não existe conexão para a organização. Nesse caso, cria uma conexão auditada e
idempotente, com saúde desconhecida até a verificação administrativa. Novas configurações usam os
contratos `/api/platform/organizations/{id}/integrations`.

## Consequências

WhatsApp permanece opcional para ativação. Suspensão impede novos efeitos de negócio, preservando uma via técnica restrita para registrar e reconciliar callbacks legítimos.
