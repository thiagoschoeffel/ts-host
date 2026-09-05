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
4. Publicar os três remotes em diretórios imutáveis versionados pelo SHA.
5. Apontar as URLs `VITE_*_REMOTE_URL` do host para esses diretórios e publicar o host por último.
6. Executar `npm run verify:deployment` com as cinco URLs do ambiente.

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
