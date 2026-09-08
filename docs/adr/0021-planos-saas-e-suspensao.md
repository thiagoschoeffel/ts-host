# ADR 0021 — Planos SaaS, habilitações e suspensão

**Estado:** aceita e implementada  
**Data:** 8 de setembro de 2026

## Contexto

Uma organização ativa não pode obter acesso apenas por existir e possuir membros. A plataforma
precisa atribuir direitos comerciais sem confundi-los com os planos de refeições do tenant, e uma
suspensão administrativa deve interromper novos efeitos de negócio sem apagar dados ou vínculos.

## Decisão

O catálogo global usa versões imutáveis de plano SaaS. Cada versão possui habilitações por código;
a organização aponta para uma única versão por uma assinatura versionada e auditável. A versão
inicial `complete` v1 inclui `business.access`, `attendance`, `catalog`, `commerce`, `logistics` e
`operations`.

O middleware de negócio exige organização `Active`, associação ativa, `business.access` e a
habilitação correspondente à família da rota. Identidade, plataforma e webhooks técnicos não
herdam esse bloqueio. Suspensão muda o ciclo de vida para `Suspended`, preserva dados e impede
novas chamadas de negócio; reativação restaura o acesso conforme a mesma versão de plano.

Ativação inicial exige plano com `business.access`, proprietário ativo e operação obrigatória de
provisionamento concluída. Atribuição e transições recebem versão esperada; suspensão, ativação e
reativação exigem motivo e geram auditoria global com ator e correlação.

A migration atribui `complete` v1 somente a organizações ativas preexistentes com associação ativa,
sem alterar IDs ou versões do cadastro. A migration é aditiva para permitir rollback temporário da
aplicação anterior.

## Consequências

Menus continuam sendo conveniência de experiência; a autorização comercial é do servidor. Novas
versões de plano são novos registros, nunca edição retroativa dos direitos já atribuídos. Webhooks e
reconciliações técnicas permanecem fora do bloqueio tenant para que a S07 possa tratá-los com uma
política restrita por conexão.
