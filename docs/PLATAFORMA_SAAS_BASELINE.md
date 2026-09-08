# Plataforma SaaS — baseline e contratos da S00

**Baseline fixado em:** 8 de setembro de 2026  
**Branch de trabalho:** `feat/e16-plataforma-saas`

## 1. Snapshot do workspace

| Repositório | SHA inicial | Alterações pendentes | Papel no E16 |
|---|---|---:|---|
| `ts-components` | `8d478b4731005a7fa3d650e8192495b7a046c04b` | nenhuma | somente lacunas genéricas comprovadas |
| `ts-host` | `20fd64b1c186c00bb17f27008013558300275db6` | nenhuma | shell, rotas, capacidades e transportes |
| `ts-module-operation` | `feca1b4b04fe27eee2fa23695541cbc955a84ead` | nenhuma | isolamento e habilitações operacionais |
| `ts-module-commercial` | `27ea45c6510e83e8f31fb4121820d2a0d692e1df` | nenhuma | isolamento e habilitações comerciais |
| `ts-module-management` | `7d4f0ac833f5aec63022435e29fea988e502521a` | nenhuma | membros da própria organização |
| `ts-api` | `7bb68342a7562f67a4106641ba9d2eb37e424adc` | nenhuma | autoridade de identidade, plataforma e tenants |

O arquivo de auditoria citado no plano não está presente no workspace nem junto ao plano recebido. Os achados foram revalidados diretamente contra estes SHAs; nenhum item depende de considerar a auditoria como estado atual.

## 2. Inventário revalidado

### API

- `Organization` é a entidade canônica de empresa e já preserva `Id`, `Name`, `Slug` e `IsActive`.
- `PlatformUser` é a identidade local, hoje única por `ExternalSubject`. A evolução para `(Issuer, Subject)` será aditiva e preservará os IDs.
- `OrganizationMembership` usa chave composta `(OrganizationId, UserId)`, papel `Owner`, `Administrator`, `Operator` ou `DeliveryDriver`, e filtro por organização.
- `AppDbContext` é o único contexto e dono atual de toda a cadeia de migrations no schema `app`.
- entidades operacionais implementam `ITenantOwned`; filtros globais e `ValidateTenantWrites()` impedem leitura e escrita cruzadas.
- `/api/session` já é a exceção de descoberta sem tenant: o middleware resolve o usuário e o endpoint lista associações ativas. Endpoints restantes exigem organização válida.
- `/api/memberships` já persiste associações reais e auditoria tenant-scoped. A criação exige uma identidade previamente provisionada e ainda não há convite, versionamento ou proteção transacional do último proprietário.
- o contexto `HttpRequestContext.IsAvailable` ainda significa usuário **e** organização disponíveis. Ele não representa adequadamente um ator exclusivamente global.
- o bypass de contexto é hoje uma comparação literal com `/api/session`. A evolução não usará prefixos para liberar grupos inteiros.
- a configuração e a resolução de WhatsApp continuam globais; duas conexões de organizações diferentes ainda não são suportadas com segurança.

### Host e remotes

- `auth.ts` já carrega sessão sem exigir organização e mantém a seleção somente em memória.
- `authenticatedFetch` exige organização ativa e envia `X-Organization-Id`, comportamento que deve permanecer nas APIs de negócio.
- ainda não há transporte autenticado exclusivo para identidade/plataforma.
- `App.vue` interrompe todo o shell quando `activeOrganizationId` é nulo; isso impede o operador exclusivamente global de chegar a uma área de plataforma.
- o host é dono do router, breadcrumbs e navegação e compõe três remotes (`4174`–`4176`).
- `ts-module-management` usa `/api/memberships` em modo conectado; a tela não grava membros apenas localmente. O fluxo ainda pede `ExternalSubject`, portanto não implementa a jornada de convite.

## 3. Decisões de compatibilidade

1. Não será criada uma entidade `Company` ou `Tenant`: `Organization` será evoluída.
2. `AppDbContext` continuará sendo o único dono das migrations. Um contexto de leitura/escrita estreito para o registro global poderá ser introduzido mais tarde, mas compartilhará os mesmos mapeamentos e nunca manterá histórico próprio.
3. `IsActive` continuará compatível durante a migração: `Active` equivale a `true`; `Provisioning`, `Suspended` e `Archived` equivalem a `false` para APIs de negócio. Depois da migração, o estado será a fonte de verdade e `IsActive` não será um segundo comando independente.
4. Filtros de entidades operacionais e `ValidateTenantWrites()` permanecem intactos. Repositórios globais só mapearão o registro administrativo.
5. `/api/session` será mantido como alias compatível enquanto o contrato canônico passa a `/api/identity/session`.
6. O host manterá `authenticatedFetch` para negócio e adicionará `identityRequest`/`platformRequest`, sem GUID vazio e sem `X-Organization-Id`.
7. O quarto remote será `modulePlatform`, exposição `./PlatformPage`, variável `VITE_PLATFORM_REMOTE_URL` e porta local `4177`.

## 4. Classificação e autorização

Todo endpoint `/api` deve pertencer exatamente a uma classe testável:

| Classe | Contexto | Políticas |
|---|---|---|
| identidade | usuário autenticado; tenant opcional | próprio usuário ou aceite de convite |
| plataforma | usuário autenticado e grant global ativo | capacidade global específica |
| negócio | usuário e organização ativos | papel tenant existente |
| webhook técnico | assinatura e conexão resolvidas no servidor | política técnica específica |

Endpoint novo sem metadado de classe falha no teste de arquitetura. Uma rota de plataforma não herda a política tenant do grupo `/api`, e esconder menus nunca substitui autorização.

Perfis iniciais: `PlatformAdministrator`, `PlatformOnboardingOperator` e `PlatformSupportReader`. O servidor armazena grants e deriva capacidades; papéis de organização nunca promovem um usuário globalmente.

## 5. Contratos de transporte

### Sessão

`GET /api/identity/session` (e alias temporário `GET /api/session`) retorna:

```ts
interface IdentitySession {
  userId: string
  displayName: string
  activeOrganizationId: string | null
  organizations: Array<{
    id: string
    name: string
    slug: string
    role: 'Owner' | 'Administrator' | 'Operator' | 'DeliveryDriver'
    isActive: boolean
  }>
  platform: {
    profiles: Array<'PlatformAdministrator' | 'PlatformOnboardingOperator' | 'PlatformSupportReader'>
    capabilities: string[]
  }
}
```

Ausência de associação é um estado válido. Ausência de grant global e de associação produz uma sessão autenticada sem área autorizada, nunca uma organização fictícia.

### Host–remote

```ts
type ApiRequest = (path: string, init?: RequestInit) => Promise<Response>

interface PlatformPageProps {
  section: 'organizations' | 'onboardings' | 'audit'
  organizationId?: string
  onboardingId?: string
  onboardingPage?: 'list' | 'new' | 'detail'
  platformRequest: ApiRequest
  capabilities: readonly string[]
}
```

O host fornece navegação por URL e um transporte que injeta somente bearer token e correlação. O remote não recebe token, não instala router e não consulta estado interno de outros remotes.

### Erros, concorrência e idempotência

- erros usam `ProblemDetails` com `code`, `correlationId`, título e detalhe seguros;
- `401` representa autenticação ausente/inválida; `403`, capacidade ausente; `404`, recurso não visível; `409`, idempotência/estado incompatível; `412`, `expectedVersion` divergente;
- comandos repetíveis recebem `Idempotency-Key`; chave repetida com fingerprint diferente retorna `409`;
- agregados mutáveis expõem `version` e escritas recebem `expectedVersion`.

## 6. Contratos HTTP da primeira fatia

Os contratos previstos são os do plano, sob `/api/identity/*` e `/api/platform/*`. S01 entrega sessão/capacidades e bootstrap administrativo; S02 entrega listagem/detalhe de organizações e auditoria; S03 entrega convites e membros; S04 entrega operações duráveis. Nenhuma tela conectada será criada antes do contrato correspondente existir.

Listagens usam `page` (a partir de 1), `pageSize` (default 20, máximo 100), ordenação estável com `id` como desempate e filtros server-side. Respostas globais não incluem dados operacionais nem segredos.

## 7. Condições obrigatórias de ativação

Uma organização só transita de `Provisioning` para `Active` se, na mesma decisão autoritativa:

- nome e slug normalizado forem válidos e únicos;
- configurações mínimas de fuso e localidade existirem;
- uma versão imutável de plano SaaS e suas habilitações estiverem atribuídas;
- houver exatamente ao menos um proprietário ativo, oriundo de convite consumido ou vínculo legado comprovado;
- todas as etapas técnicas marcadas como obrigatórias estiverem concluídas;
- onboarding não estiver cancelado e não houver operação obrigatória em `NeedsAttention`;
- `expectedVersion` corresponder ao estado persistido.

WhatsApp, catálogo, cardápio e estoque não são pré-condições da ativação básica. Suspensão preserva dados e outros vínculos da identidade.

## 8. Plano de testes obrigatório

Testes unitários/InMemory continuam úteis, mas não fecham gates de persistência. As garantias críticas usarão PostgreSQL descartável exclusivo:

1. aplicar todas as migrations sobre banco vazio;
2. aplicar sobre snapshot com a organização Sabor Santè e IDs existentes;
3. provar unicidade concorrente de slug, convite e associação;
4. provar que duas revogações concorrentes não removem o último proprietário;
5. provar lease/retry após reinício e idempotência com fingerprint;
6. executar matriz A/B de leitura, escrita, respostas fora de ordem, jobs e webhooks;
7. testar rollback da aplicação anterior sobre migration aditiva sem perda de dados.

O banco temporário será removido ao fim da execução; o volume persistente local nunca será limpo para esse teste.

## 9. Gates por dependência

| Fase | Gate objetivo | Estado em 08/09/2026 |
|---|---|---|
| S00 | baseline, ADRs, contratos e matriz de testes | concluído em 08/09/2026 |
| S01 | matriz de identidade/autorização global verde | implementação iniciada; homologação de MFA pendente |
| S02 | registro global e migration compatível em PostgreSQL | implementação iniciada; migration sobre organização existente validada |
| S03 | convite único e último proprietário protegido | integrado em 08/09/2026; homologação do domínio Resend pendente |
| S04 | retry/reinício sem duplicação | concluído em 08/09/2026; migration e retomada validadas em PostgreSQL descartável |
| S05 | quarto remote conectado, sem persistência simulada | concluído em 08/09/2026; empresas, auditoria e onboarding usam contratos autoritativos |
| S06 | direitos e suspensão aplicados no backend | concluído em 08/09/2026; plano versionado, habilitações, ativação e suspensão validados em API e PostgreSQL |
| S07 | conexões A/B isoladas e legado migrável | concluído em 08/09/2026; ativos verificados, segredos cifrados, webhook por conexão e migration validados |
| S08 | aceite completo A/B, runbooks e rollback | automação PostgreSQL, runbooks e ensaio de rollback concluídos em 08/09/2026; homologação externa de MFA e Resend pendente |
