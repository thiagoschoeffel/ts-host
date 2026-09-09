# Operação, deploy e rollback da V1

## Sinais operacionais

Toda chamada autenticada criada pelo host envia `X-Correlation-Id`; a API devolve o mesmo valor, inclui `CorrelationId` e `TraceId` nos logs JSON e persiste a correlação nos eventos auditáveis. Erros inesperados retornam também um `errorId`, sem expor stack trace. Erros globais e falhas de carregamento federado são enviados para `POST /api/telemetry/client-errors` quando existe sessão.

A API publica:

- `GET /health/live`: processo apto a responder;
- `GET /health/ready`: conectividade real com PostgreSQL;
- `GET /metrics`: contadores Prometheus de requisições, falhas, concorrência e duração acumulada.

O coletor de logs deve indexar `CorrelationId`, `TraceId`, `ErrorId`, status e rota. O scraper de métricas deve alertar para readiness indisponível, crescimento de `ts_api_http_request_failures_total` e saturação de `ts_api_http_requests_in_flight`.

## Ordem de deploy

1. Exigir CI verde em cada repositório e guardar os artefatos imutáveis pelo SHA do commit.
2. Fazer backup do PostgreSQL e aplicar migrations uma única vez, antes das novas réplicas, com `ConnectionStrings__Database=... ./scripts/apply-migrations.sh` no `ts-api`.
3. Publicar a API e aguardar `/health/live` e `/health/ready` verdes.
4. Publicar os quatro remotes em diretórios imutáveis versionados pelo SHA.
5. Apontar as URLs `VITE_*_REMOTE_URL` do host para esses diretórios e publicar o host por último.
6. Executar `npm run verify:deployment` com as cinco URLs do ambiente.

## Build dos frontends no Dokploy

O host e os quatro remotes usam o `Dockerfile` de cada repositório e publicam o Nginx na
porta `80`. A dependência privada `@thiagoschoeffel/ts-components` deve ser autenticada pelo
**Build-time Secret** `npm_token`; nunca coloque o token em Environment Variables ou Build
Arguments. O segredo existe somente durante o `npm ci` e não é copiado para a imagem final.

O host recebe como Build Arguments as configurações públicas incorporadas pelo Vite:

```text
VITE_OPERATION_REMOTE_URL
VITE_COMMERCIAL_REMOTE_URL
VITE_MANAGEMENT_REMOTE_URL
VITE_PLATFORM_REMOTE_URL
VITE_LABEL_PRINT_MODE
VITE_ZEBRA_BROWSER_PRINT_SCRIPT
VITE_ZEBRA_DPI
VITE_API_URL
VITE_OIDC_AUTHORITY
VITE_OIDC_CLIENT_ID
```

Os remotes não recebem esses argumentos. Todos usam o mesmo `nginx.conf`, que habilita CORS
para os artefatos federados, impede cache de `remoteEntry.js` e mantém assets com hash como
imutáveis.

`remoteEntry.js` deve usar `Cache-Control: no-store, max-age=0, must-revalidate`. Assets com hash em `/assets/` devem usar `Cache-Control: public, max-age=31536000, immutable`. `index.html` do host deve usar `no-cache`. O CDN precisa invalidar apenas `index.html` e `remoteEntry.js`; assets imutáveis antigos permanecem disponíveis para rollback.

## Compatibilidade federada

Vue e `@thiagoschoeffel/ts-components` são singletons com `strictVersion`. O host fornece o design system e os remotes não empacotam fallback próprio. Cada remote gera `@mf-types.zip` a partir dos props realmente expostos. CI bloqueia falhas de geração e orçamento.

Atualizações incompatíveis exigem esta ordem: publicar uma versão de host compatível com as duas gerações, publicar remotes, depois remover compatibilidade antiga. Falha de versão ou de carregamento chega ao `router.onError`, aparece como indisponibilidade recuperável e é registrada pela telemetria.

## Orçamentos acordados

- design system: JavaScript até 650 KB bruto/140 KB gzip; CSS até 75 KB/15 KB gzip;
- host: chunk JavaScript até 1,8 MB/450 KB gzip; CSS até 100 KB/20 KB gzip;
- remotes: chunk JavaScript até 520 KB/170 KB gzip; CSS até 100 KB/20 KB gzip;
- `remoteEntry.js`: até 25 KB/8 KB gzip.

O chunk compartilhado do design system no host é conscientemente o maior artefato da V1; ele é baixado uma vez e substitui as cópias de mais de 1 MB que antes existiam em cada remote. O XLSX comercial permanece isolado e abaixo do budget. Aumentar qualquer limite exige justificar a regressão neste documento.

## Rollback ensaiável

1. Reapontar primeiro o host para as URLs imutáveis dos remotes da última matriz compatível.
2. Reativar o artefato anterior do host.
3. Reverter a API somente se a versão anterior aceitar o schema já migrado. Migrations publicadas são aditivas por padrão; nunca executar `database update <migration-antiga>` automaticamente em produção.
4. Se uma mudança de dados impedir rollback, avançar com uma correção compatível ou restaurar o backup em janela controlada.
5. Reexecutar `npm run verify:deployment` e rastrear uma requisição pelo `X-Correlation-Id` até o log/auditoria.

## Matriz de regressão

Antes de promover produção, validar desktop e mobile nos fluxos: Catálogo → Cardápio → Pedido; Pedido → confirmação → Produção → Embalagem → Entrega; Congelados → Pedido → Embalagem; Clientes → Planos/Créditos → Financeiro; e Atendimento quando o sandbox Meta estiver configurado. Para CSS federado, navegar Operação → Comercial → Gestão → Operação e confirmar que altura, padding, overlays e rich-text permanecem estáveis.

## Onboarding SaaS e aceite A/B

### Pré-condições do ambiente

- exigir MFA no provedor OIDC para os operadores globais, emitir a evidência configurada em
  `Authentication:PlatformMfaClaimType`/`PlatformMfaClaimValue` somente após o segundo fator e
  confirmar com uma conta real que tokens sem essa evidência recebem `403`;
- configurar remetente Resend verificado, URL pública de convite e chave durável de derivação dos tokens;
- manter `IntegrationSecrets__EncryptionKey` como chave Base64 de 32 bytes fora do repositório;
- guardar SHAs da API, host e quatro remotes, URLs imutáveis atuais e backup do PostgreSQL;
- aplicar migrations antes da API e confirmar readiness antes de publicar o remote de Plataforma.

A chave de criptografia das integrações não pode ser trocada isoladamente: conexões existentes
ficariam ilegíveis. A rotação de token, app secret e token de webhook é feita salvando novos valores
no detalhe da empresa. A rotação da chave mestra exige uma rotina controlada de recifragem e não
faz parte de um deploy ordinário.

### Roteiro de homologação

1. Entrar como operador global com MFA e registrar a correlação da sessão.
2. Abrir a empresa A e registrar estado, versão, plano, membros e uma amostra de dados operacionais.
3. Criar a empresa B uma única vez pelo remote de Plataforma e guardar `onboardingId` e `operationId`.
4. Confirmar o envio do convite no Resend. Em falha, usar a retentativa da mesma operação; não criar
   outra empresa nem inserir dados por SQL.
5. Aceitar o convite com uma identidade cujo e-mail corresponda ao destinatário e confirmar a
   associação `Owner` somente na empresa B.
6. Atribuir uma versão de plano SaaS, ativar B e, se o canal for usado, cadastrar sua conexão
   WhatsApp própria e a URL de webhook por `connectionId`.
7. Selecionar B no host, validar as áreas habilitadas e confirmar ausência de clientes, pedidos,
   estoque, conversas e membros da empresa A.
8. Voltar à empresa A e comparar os registros do passo 2. Confirmar também que a conexão e os
   recibos de webhook de B não aparecem nem produzem efeitos em A.
9. Localizar criação, convite, plano, ativação e integração na auditoria global pelas correlações.

O CI executa a versão automatizada desse roteiro em PostgreSQL real: preserva dados da empresa A,
provisiona e ativa B, configura conexões distintas e tenta uma escrita cruzada que precisa falhar.
A homologação manual continua necessária para provar MFA e entrega real do e-mail no ambiente.

### Rollback da plataforma

O procedimento foi ensaiado localmente em 08/09/2026: a API anterior à S07 (`6e4fc8f`)
iniciou e respondeu `healthy` em `/health/ready` contra um banco já atualizado até
`20260908212732_AddOrganizationExternalIntegrations`.

1. Impedir novas criações de onboarding no gateway sem apagar operações já persistidas.
2. Reapontar host e remote de Plataforma para a última matriz imutável compatível.
3. Reverter a API somente para um artefato que aceite o schema aditivo atual. Não executar `down`
   migrations nem remover empresas, convites, grants, operações, assinaturas ou conexões.
4. Ao voltar para uma API anterior à S07, manter temporariamente as variáveis legadas do WhatsApp
   da empresa A; a conexão cifrada permanece preservada para o roll-forward.
5. Manter as chaves de convite e de criptografia exatamente iguais durante rollback e roll-forward.
6. Retomar operações em `Pending` ou com lease expirado. Para `NeedsAttention`, usar retentativa
   com a versão atual; nunca recriar B para contornar a falha.
7. Confirmar readiness, sessão da empresa A e auditoria. Depois do roll-forward, repetir o roteiro
   A/B antes de reabrir novos onboardings.
