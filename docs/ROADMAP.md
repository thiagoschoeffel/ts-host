# Roadmap de desenvolvimento — Sabor Santè

Atualizado em 4 de setembro de 2026.

Este é o checklist executivo e operacional das próximas evoluções do produto. Cada épico representa uma entrega coesa, planejada para ser executada em um único *one-shot*: compreender o contexto, implementar, validar, documentar, criar os commits e fazer o push de tudo que pertence à evolução.

O roadmap define a ordem de execução. O estudo de caso continua sendo a fonte de verdade do domínio, a arquitetura define as fronteiras técnicas e o Guia UI define a experiência.

## Como executar um épico

Um épico iniciado deve ser levado até uma destas situações:

- **concluído:** escopo e critérios de aceite atendidos, validações verdes, documentação atualizada, commits criados, branches de trabalho publicadas e pull requests abertos ou atualizados em todos os repositórios afetados;
- **bloqueado:** existe uma decisão de negócio, credencial, serviço externo ou falha irrecuperável que impede a conclusão; o bloqueio deve ser registrado objetivamente e nenhuma conclusão parcial deve ser marcada como entregue.

Regras de execução:

1. executar apenas um épico por vez, seguindo a ordem deste documento;
2. antes de alterar arquivos, verificar o estado Git de todos os repositórios envolvidos, preservar mudanças anteriores que não pertencem ao épico e criar em todos eles a mesma branch `feat/eNN-descricao-curta`;
3. não ampliar o escopo com itens de épicos futuros;
4. implementar a menor fatia completa que satisfaça os critérios de aceite;
5. executar todas as validações indicadas e as validações obrigatórias de cada repositório;
6. atualizar este checklist e a documentação afetada na mesma entrega;
7. criar um commit convencional e coeso em cada repositório alterado; uma evolução transversal pode, portanto, gerar mais de um commit;
8. nunca implementar, fazer commit ou push diretamente em `main` ou `master`; se commits do épico já estiverem na branch protegida local, criar a branch de trabalho no `HEAD` atual, sem reset ou descarte;
9. fazer push somente das branches de trabalho, configurar o upstream e abrir ou atualizar um pull request para `main` em cada repositório afetado;
10. somente depois de confirmar todos os pushes e pull requests marcar o épico como concluído; o merge permanece sujeito à revisão e às proteções do repositório;
11. se commit, push ou criação do pull request não puder ser realizado, manter o épico em andamento e informar precisamente o que falta.

Mudanças locais preexistentes e alheias ao épico nunca devem ser incluídas nos commits. Se houver sobreposição que não possa ser separada com segurança, a execução deve parar e registrar o impedimento.

## Checklist executivo

- [x] **E01 — Consolidar o frontend demonstrativo V1**
- [x] **E02 — Estabelecer a API, o SaaS multi-tenant e Congelados autoritativos**
- [x] **E03 — Concluir e publicar a primeira confirmação autoritativa de Pedido**
- [x] **E04 — Criar Pedido aberto e configurar capacidade diária**
- [x] **E05 — Completar a transação de confirmação do Pedido**
- [x] **E06 — Implementar cancelamento, reagendamento e reversões**
- [ ] **E07 — Estabelecer identidade, autorização e auditoria**
- [ ] **E08 — Integrar a Gestão de Congelados à API**
- [ ] **E09 — Integrar Pedidos e Capacidade à API**
- [ ] **E10 — Integrar Produção, Embalagem e impressão Zebra**
- [ ] **E11 — Integrar Catálogo, Produzíveis e Cardápios**
- [ ] **E12 — Integrar Clientes, Planos, Créditos e Financeiro**
- [ ] **E13 — Integrar Entregadores e Entregas**
- [ ] **E14 — Integrar Atendimento e WhatsApp oficial**
- [ ] **E15 — Consolidar observabilidade, qualidade e deploy da V1**

## Épicos

### E01 — Consolidar o frontend demonstrativo V1

**Estado:** concluído em 4 de setembro de 2026.

**Resultado esperado:** disponibilizar uma linha de base navegável e responsiva das jornadas V1, sem promover mocks, stores locais ou interfaces de apresentação a contratos definitivos da API.

**Inclui:** shell e remotes; design system; Congelados em Gestão e no Pedido; capacidade demonstrativa; Produção; Embalagem e etiquetas; Entregas; Atendimento; Clientes; Catálogo; Cardápios; Planejamento semanal; Planos, Créditos e Financeiro.

**Aceite:** jornadas consolidadas contra o estudo de caso, arquitetura e Guia UI; builds dos cinco projetos frontend; registro formal autorizando a retomada da API.

### E02 — Estabelecer a API, o SaaS multi-tenant e Congelados autoritativos

**Estado:** concluído.

**Resultado esperado:** criar a fundação segura da API e a primeira fatia persistida do domínio.

**Inclui:** monólito modular .NET; PostgreSQL e migrations; Organização, usuários e associações; isolamento por tenant; fontes mínimas de Oferta e Item Produzível; Configuração de Congelado; entrada atômica de produção; lotes, validade, movimentos e idempotência.

**Aceite:** isolamento de leitura e escrita por Organização; integridade referencial composta; validade civil de 90 dias; saldo derivado de movimentos; testes e build Release verdes.

### E03 — Concluir e publicar a primeira confirmação autoritativa de Pedido

**Estado:** concluído em 4 de setembro de 2026.

**Resultado esperado:** confirmar um Pedido aberto já persistido de forma atômica, concorrente e repetível com segurança.

**Inclui:** agregado de Pedido e itens; status e versão otimista; capacidade diária; cobrança; transação serializável; idempotência; alocação FEFO de congelados; movimentos e rastreabilidade por `PedidoItem`; endpoint e migration.

**Aceite:** confirmar apenas Pedido elegível; não consumir capacidade para congelados; impedir estoque negativo e lotes vencidos; rejeitar versão concorrente; repetir a mesma chave sem duplicar efeitos; testes de sucesso, conflito e rollback; migration aplicável; `dotnet test` e build Release verdes; documentação atualizada; commit e push do `ts-api` e dos documentos relacionados.

### E04 — Criar Pedido aberto e configurar capacidade diária

**Estado:** concluído em 4 de setembro de 2026.

**Resultado esperado:** eliminar a dependência de dados inseridos diretamente no banco para que a confirmação possa ser exercitada por casos de uso públicos.

**Inclui:** contratos e endpoints para criar e editar o rascunho do Pedido; itens mistos com snapshots necessários; consulta do Pedido; configuração e consulta da capacidade por data; idempotência onde houver repetição por rede; tenant e concorrência em todas as escritas.

**Aceite:** criar um Pedido aberto válido somente com referências autoritativas; editar sem sobrescrever versão concorrente; rejeitar configuração congelada inválida; configurar capacidade sem duplicidade por Organização/data; consultar saldo coerente; confirmar o Pedido usando apenas APIs públicas; migration, testes de aplicação/integração, build, documentação, commits e push verdes.

### E05 — Completar a transação de confirmação do Pedido

**Estado:** concluído em 4 de setembro de 2026.

**Resultado esperado:** fazer `ConfirmarPedido` consolidar todas as invariantes comerciais e operacionais previstas para a V1 em uma única transação conceitual.

**Inclui:** componentes efetivos e seus snapshots históricos; restrições alimentares aplicáveis; preço, desconto e taxa; créditos de plano consumidos por FIFO; crédito financeiro; cobrança e saldo restante; auditoria dos efeitos.

**Aceite:** nenhum efeito parcial em falha; crédito normal consumido somente na confirmação; ausência de saldo ou incompatibilidade de restrição impede a operação; reexecução idempotente; histórico permanece estável após mudanças posteriores de catálogo; testes de concorrência e rollback; migrations, build, documentação, commits e push verdes.

### E06 — Implementar cancelamento, reagendamento e reversões

**Estado:** concluído em 4 de setembro de 2026.

**Resultado esperado:** fechar o ciclo transacional do Pedido depois da confirmação.

**Inclui:** matriz de transições de status; cancelamento antes e depois da separação; liberação de capacidade; estorno de créditos e financeiro; devolução ao mesmo lote quando permitida; quarentena/descarte quando a cadeia fria for duvidosa; reagendamento com nova validação de capacidade; trilha de auditoria e idempotência.

**Aceite:** cada estágio aplica apenas reversões permitidas; não há saldo, crédito ou capacidade duplicados; reagendamento é atômico; estágios que exigem conferência humana não retornam estoque automaticamente; testes da matriz completa, build, documentação, commits e push verdes.

### E07 — Estabelecer identidade, autorização e auditoria

**Resultado esperado:** substituir o contexto de desenvolvimento por identidade real e tornar a API segura para integração operacional.

**Inclui:** provedor de identidade escolhido e documentado; autenticação; sessão do frontend; claim de Organização; associações de usuário; políticas por ação/recurso; seleção segura de empresa; auditoria com ator, tenant, instante e correlação; remoção do fallback fora de desenvolvimento.

**Aceite:** chamadas anônimas e cross-tenant são bloqueadas; usuário sem associação não acessa a Organização; troca de empresa não aceita `OrganizationId` arbitrário; ações críticas registram autoria confiável; testes de segurança, builds, documentação, commits e push verdes.

### E08 — Integrar a Gestão de Congelados à API

**Resultado esperado:** substituir o estado demonstrativo de Congelados por persistência autoritativa sem alterar a jornada validada.

**Inclui:** configurações; produtos habilitados; estoque e vencimentos; entrada de produção; detalhe e movimentos do lote; ajuste e descarte; loading, vazio, erro e retentativa; remoção do adapter local como fonte de verdade.

**Aceite:** todas as telas leem e escrevem pela API autenticada; saldo e validade vêm do domínio; falhas não deixam a UI otimista incorreta; fluxo funciona em desktop/mobile e após alternar remotes; testes de contrato/componente, builds integrados, documentação, commits e push verdes.

### E09 — Integrar Pedidos e Capacidade à API

**Resultado esperado:** tornar criação, edição, confirmação, detalhe e capacidade do Pedido fluxos reais.

**Inclui:** adapter HTTP tipado em Operação; tratamento de versão concorrente e idempotência; itens diários e congelados; disponibilidade vendável; projeção e reserva de capacidade; detalhes dos efeitos da confirmação; cancelamento e reagendamento autoritativos.

**Aceite:** não resta regra autoritativa de capacidade ou FEFO no Vue; conflitos têm recuperação compreensível; navegação preserva contexto; cenários de esgotamento, concorrência e retentativa passam; builds e testes integrados, documentação, commits e push verdes.

### E10 — Integrar Produção, Embalagem e impressão Zebra

**Resultado esperado:** operar a execução física a partir de Pedidos reais e imprimir etiquetas por um adapter de infraestrutura substituível.

**Inclui:** Hoje e Produção derivados de pedidos confirmados; fila e snapshots de Embalagem; transição para Embalado; etiquetas individuais da produção do dia e externa do pacote; reimpressão; descoberta e implementação do adapter Zebra/ZPL adequado ao ambiente; histórico de tentativas.

**Aceite:** congelados não entram na produção diária nem recebem etiqueta duplicada; impressão não altera estoque/status por si só; falha permite retentativa segura; reimpressão usa snapshot histórico; validação com impressora ou simulador acordado, testes, builds, documentação, commits e push verdes.

### E11 — Integrar Catálogo, Produzíveis e Cardápios

**Resultado esperado:** estabelecer fontes autoritativas para o que pode ser produzido e vendido em cada dia.

**Inclui:** Ofertas, escolhas, adicionais, tipos de componente, Itens Produzíveis e versões de composição; Cardápio diário; publicação e disponibilidade; planejamento semanal e derivação de rascunhos; importação com validação e relatório de erros.

**Aceite:** não existe catálogo paralelo em Congelados; versões históricas não são reescritas; publicação é explícita; planejamento não sobrescreve dias existentes; Pedido consome apenas referências válidas; testes, builds, documentação, commits e push verdes.

### E12 — Integrar Clientes, Planos, Créditos e Financeiro

**Resultado esperado:** criar uma fonte única para o relacionamento comercial e os saldos usados pelo Pedido.

**Inclui:** clientes, endereços, preferências e restrições; planos e aquisições; ledger de créditos; cobranças, pagamentos, alocações e crédito financeiro; consultas e ajustes manuais auditáveis; integração dos efeitos do Pedido.

**Aceite:** saldos são derivados de movimentações; FIFO e estornos preservam origem; ajustes manuais não se confundem com consumo; dados pessoais respeitam tenant e autorização; telas deixam de usar stores locais; testes, builds, documentação, commits e push verdes.

### E13 — Integrar Entregadores e Entregas

**Resultado esperado:** persistir e controlar a jornada logística completa do Pedido.

**Inclui:** cadastro e disponibilidade de entregadores; preferência e atribuição; rotas e paradas; folha de rota; tentativas, falhas, reagendamento e conclusão; transições compatíveis com Pedido; auditoria operacional.

**Aceite:** transições inválidas são rejeitadas; tentativa nunca apaga histórico; reagendamento preserva rastreabilidade; atribuição respeita Organização; experiência desktop/mobile e fluxos integrados passam; testes, builds, documentação, commits e push verdes.

### E14 — Integrar Atendimento e WhatsApp oficial

**Resultado esperado:** substituir a simulação do Atendimento por mensageria oficial, persistente e observável.

**Inclui:** integração oficial escolhida; webhook autenticado e idempotente; processamento sequencial por conversa; histórico; envio e retentativa; handoff Automação/Humano; sincronização com o aplicativo WhatsApp dentro dos limites do provedor; franquia mensal autoritativa; vínculo com Cliente e Pedido.

**Aceite:** mensagens duplicadas não geram efeitos duplicados; ordem por conversa é preservada; falhas são recuperáveis; opt-in, privacidade e limites do provedor estão documentados; segredo não chega ao frontend; testes com sandbox do provedor, builds, documentação, commits e push verdes.

### E15 — Consolidar observabilidade, qualidade e deploy da V1

**Resultado esperado:** tornar o conjunto operável, diagnosticável e publicável com segurança.

**Inclui:** logs estruturados e correlação ponta a ponta; métricas e captura central de erros; health checks reais; testes unitários, integração, contrato, componente e E2E dos fluxos críticos; CI independente por repositório; contratos federados tipados; estratégia de versões host/remotes; cache e rollback de `remoteEntry.js`; orçamento e divisão de bundles; migrations como etapa de deploy; matriz desktop/mobile e regressão de ordem de CSS.

**Aceite:** pipelines bloqueiam regressões; uma requisição crítica é rastreável do frontend ao banco; deploy e rollback estão documentados e ensaiados; incompatibilidade host/remote é detectável; nenhum chunk crítico excede o orçamento acordado sem justificativa; suíte V1, builds, documentação, commits e push verdes.

## Fora do escopo deste roadmap V1

- estoque genérico de ingredientes, embalagens ou múltiplos depósitos;
- WMS, MRP, RFID ou designer genérico de etiquetas;
- novo remote apenas para Congelados ou Etiquetas;
- regras autoritativas mantidas no Vue;
- contratos de API derivados automaticamente de mocks;
- Redis, broker ou serviços adicionais sem caso de uso concreto.
