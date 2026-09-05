# Status frontend — Sabor Santè

Atualizado em 4 de setembro de 2026 após a consolidação demonstrativa das jornadas V1 e a conclusão dos épicos E02–E05 da API autoritativa.

Este arquivo registra o estado verificado, as lacunas e a sequência recomendada de evolução. As regras permanentes continuam pertencendo aos três documentos de referência.

## Leitura executiva

O frontend já é um **protótipo funcional amplo**: shell, três remotes, design system e as principais experiências anteriores ao novo estudo de caso estão implementados e navegáveis. Isso permite validar fluxos, conteúdo, responsividade e direção visual.

**Marco formal:** esta linha de base está consolidada para orientar os casos de uso autoritativos da API. Melhorias posteriores de bundle, CI, testes, contratos federados, navegação e refinamentos de UX continuam planejadas, mas não bloqueiam mais o backend nem transformam interfaces de mock em DTOs.

Ele ainda **não está pronto para operar todo o negócio com dados reais**. Congelados, Pedidos e capacidade já usam a API autenticada e autoritativa; Produção, Embalagem, Entregas, Atendimento, Catálogo e Comercial ainda preservam partes demonstrativas previstas nos próximos épicos. Observabilidade e CI nos aplicativos também permanecem incompletos.

A principal ampliação de escopo é **Congelados**. Gestão já integra consulta, entrada de produção, detalhe, movimentações e ajuste/descarte à API. Em Operação, o Pedido aceita itens mistos, consulta saldo vendável, delega a alocação FEFO e os estornos à transação autoritativa, mantém congelados fora da capacidade diária e preserva a futura composição com Embalagem. A integração Zebra/ZPL e a persistência dos fluxos físicos seguintes continuam pendentes. A topologia atual comporta a evolução sem criar outro remote nem um catálogo comercial paralelo:

```text
ts-module-management
→ configurações de congelado, estoque, lotes, vencimentos e etiqueta de produto

ts-module-operation
→ venda no Pedido, conferência na Embalagem, etiquetas individuais do dia e etiqueta externa do pacote

ts-host
→ rotas, sidebar e breadcrumbs
```

## Legenda de estado

| Estado | Significado |
| --- | --- |
| Implementado | Existe no código e atende ao propósito visual/técnico atual |
| Protótipo funcional | Fluxo navegável, porém sustentado por dados e efeitos demonstrativos |
| Parcial | Parte relevante existe, mas o fluxo previsto na V1 não está completo |
| Pendente | Não foi encontrado no código atual |
| Decisão pendente | A implementação depende de validação de negócio |

## Fundação técnica verificada

| Área | Estado | Evidência e lacuna |
| --- | --- | --- |
| Shell e Module Federation | Implementado | Host compõe Operation, Commercial e Management; Vue é compartilhado |
| URLs dos remotes | Implementado | Configuráveis por ambiente, validadas para HTTP(S), com fallback local |
| Falha de carregamento de remote | Implementado | O shell apresenta erro explícito e ação de nova tentativa |
| Rotas e breadcrumbs | Implementado | O host é o único proprietário do Vue Router e das URLs públicas |
| Navegação SPA | Parcial | Ações programáticas dos remotes usam a bridge do host, com fallback quando executadas isoladamente; links internos semânticos ainda dependem da interceptação global |
| Contratos federados | Parcial | Fachadas pequenas e declarações manuais no host; geração de tipos permanece desabilitada (`dts: false`) |
| Design system | Implementado | `ts-components` 0.7.8 está alinhado nos quatro consumidores e possui componentes, ícones e Storybook |
| Padrões do Guia UI | Parcial | Páginas recentes seguem os padrões principais; cenários determinísticos e estados completos ainda não são uniformes em toda tela antiga |
| API de negócio | Parcial | A API possui PostgreSQL, fundação SaaS multi-tenant, ciclo transacional do Pedido até cancelamento/reagendamento e identidade/autorização reais; Gestão de Congelados e Operação de Pedidos/capacidade já estão integradas |
| Autenticação e autorização | Implementado | Keycloak/OIDC com PKCE no shell, JWT na API, sessão validada, associação e papel por Organização, seleção revalidada no servidor e autoria derivada da identidade |
| Testes automatizados | Parcial | Management possui testes da validade civil de congelados; ainda faltam suítes de componente, contrato, integração e E2E nos fluxos críticos |
| CI dos aplicativos | Pendente | Apenas `ts-components` possui workflow, voltado à publicação; falta pipeline de qualidade dos aplicativos |
| Observabilidade | Parcial | A API propaga `X-Correlation-Id` e o preserva na auditoria crítica; captura central de erros, logs e métricas ponta a ponta permanecem para o E15 |
| Compatibilidade de deploy | Parcial | Builds e URLs independentes existem; não há negociação formal de versão host/remote |
| Desempenho de bundles | Parcial | Os cinco builds passam, mas Operation e Commercial emitem aviso de chunks acima de 500 kB |

## Estado funcional por domínio

“Protótipo funcional” abaixo descreve a UX existente, não a conclusão das regras transacionais do backend.

| Área | Estado | O que existe hoje | O que falta para a V1 |
| --- | --- | --- | --- |
| Hoje | Protótipo funcional | Dashboard operacional e estado demonstrativo de sincronização | Dados reais e consolidação pela API |
| Atendimento / WhatsApp | Protótipo funcional | Caixa de entrada responsiva, skeletons estruturais, histórico sanitizado, alternância Automação/Humano, envio manual, falha com retentativa idempotente, entrada no Pedido aberto e acompanhamento demonstrativo da franquia mensal | Integração oficial, webhook, persistência e controle autoritativos da franquia, processamento sequencial e sincronização com o aplicativo WhatsApp |
| Pedidos | Integrado | Lista, criação, edição, detalhe, confirmação, cancelamento e reagendamento usam API autenticada, versão otimista e idempotência; detalhe apresenta efeitos históricos | Integrar cadastro autoritativo de clientes/ofertas nos E11/E12 e derivar Produção/Embalagem nos épicos seguintes |
| Capacidade | Integrado | Formulário e painel Hoje consultam o saldo por data; a projeção não reserva, enquanto confirmação, cancelamento e reagendamento aplicam a regra autoritativa e concorrente na API | A configuração administrativa dedicada pode ser refinada junto das evoluções operacionais futuras |
| Produção diária | Protótipo funcional | Consulta agregada a partir de pedidos demonstrativos | API baseada apenas em pedidos confirmados; manter congelados fora dessa apuração |
| Embalagem | Protótipo funcional | Fila e conferência visual distinguem itens do dia e congelados já etiquetados; “Embalado” persiste snapshots e abre as etiquetas necessárias; reimpressão seletiva mantém status e estoque independentes | Persistência autoritativa e adapter Zebra/ZPL |
| Entregas | Protótipo funcional | Rotas, paradas, tentativas, falhas, reagendamento e folha de rota | Persistência, auditoria, validações de transição e integração com Pedido/entregadores reais |
| Clientes | Protótipo funcional | Lista, detalhe, cadastro, endereços, preferências, restrições e observações | Fonte única com Pedidos e persistência segura na API |
| Catálogo / Ofertas | Protótipo funcional | Ofertas, componentes, escolhas, adicionais e tipos de componente | API, contratos definitivos e vínculo real com cardápio/pedido |
| Produzíveis / Composições | Protótipo funcional | Cadastro, detalhe e versões de composição | Integrar a composição versionada já usada como snapshot pela confirmação e completar sua gestão autoritativa |
| Cardápio diário | Protótipo funcional | Calendário, criação/edição, publicação, disponibilidade e importação por planilha demonstrativa | API e integração autoritativa com catálogo e Pedido |
| Planejamento semanal | Protótipo funcional | Grade compacta com autocomplete para selecionar dias e resolver as três categorias, escolha e ordenação de ofertas, salvamento da intenção e derivação de novos cardápios diários em rascunho sem substituir dias existentes | Persistência autoritativa, comunicação externa do plano e integração com preparação/compra |
| Planos e Créditos | Protótipo funcional | Planos, aquisições, saldos, movimentações e estorno demonstrativos | Integrar consumo FIFO autoritativo da confirmação; completar gestão, consultas e estornos do cancelamento |
| Financeiro | Protótipo funcional | Cobranças, pagamentos, alocações, saldos e crédito financeiro demonstrativos | Integrar cobrança e crédito financeiro autoritativos da confirmação; completar pagamentos, consultas e reversões do cancelamento |
| Entregadores | Protótipo funcional | Lista e cadastro demonstrativos | Fonte única para preferência, atribuição e tentativa real |
| Usuários | Parcial | Lista e cadastro demonstrativos; identidade, sessão, associação, papéis e auditoria confiável já existem na plataforma/API | Integrar a gestão autoritativa de usuários e associações à tela |

## Nova frente: Congelados e etiquetas

A frente foi iniciada em `/congelados`, dentro de Gestão, e já alcança o ciclo demonstrativo do Pedido em Operação. O quadro distingue os protótipos navegáveis das integrações autoritativas e das entregas ainda pendentes.

| Entrega | Estado | Repositório principal | Dependências |
| --- | --- | --- | --- |
| Configuração de congelado | Protótipo funcional | `ts-module-management` | Habilitação, edição, inativação e reativação demonstrativas referenciam diretamente o Item Produzível, preservam o histórico e definem apresentação e preço variável sem duplicar uma Oferta por preparação; falta persistência autoritativa |
| Estoque com tabs Estoque/Produtos habilitados/Vencimentos | Protótipo funcional | `ts-module-management` | Consulta responsiva, busca, estados visuais e ordenação FEFO dos vencimentos; falta fonte autoritativa |
| Entrada de produção congelada | Protótipo funcional | `ts-module-management` | Rota e formulário selecionam configuração ativa, calculam 90 dias corridos e criam lote + `EntradaProducao` juntos no estado da sessão; após salvar, oferecem impressão sem acoplá-la ao estoque |
| Detalhe do lote e movimentações | Protótipo funcional | `ts-module-management` | Resumo, responsável, motivo, saldo resultante e histórico demonstrativo; falta fonte autoritativa |
| Ajuste e descarte | Protótipo funcional | `ts-module-management` | Comandos demonstrativos exigem quantidade, motivo e responsável, preservam movimentos e impedem saldo negativo; falta persistência autoritativa |
| Etiqueta de produto 100 × 50 mm | Protótipo funcional | `ts-module-management` | Preview 2:1, quantidade independente do estoque, estados de progresso/erro e serviço com adapter de impressão do navegador; integração Zebra/ZPL permanece pendente |
| Reimpressão de produto | Protótipo funcional | `ts-module-management` | Reutiliza snapshot histórico do lote, registra tentativas e não altera estoque; falta integração com o adapter Zebra/ZPL |
| Congelados no Pedido | Integrado | `ts-module-operation` + `ts-api` | Configurações e saldo vendável vêm da API; confirmação faz alocação FEFO e o detalhe apresenta os lotes persistidos |
| Saída e estorno por Pedido | Integrado | `ts-module-operation` + `ts-api` | Confirmação, cancelamento e destinação física executam regras transacionais autoritativas e idempotentes |
| Congelados na Embalagem | Protótipo funcional | `ts-module-operation` | Conferência mostra produto, apresentação, lote/validade e informa que a etiqueta de estoque não será duplicada |
| Etiqueta individual da produção do dia 100 × 50 mm | Protótipo funcional | `ts-module-operation` | Uma por unidade física, gerada do snapshot do PedidoItem ao clicar em “Embalado”; reimpressão seletiva disponível |
| Etiqueta externa do pacote kraft 100 × 50 mm | Protótipo funcional | `ts-module-operation` | Uma por Pedido, com snapshot de cliente/Pedido e dados de entrega quando aplicáveis; retirada/balcão usa versão reduzida |
| Rotas, sidebar e breadcrumbs | Implementado | `ts-host` | `/congelados` integrado ao contrato federado de Management |

## Decisões operacionais fechadas

1. **Validade:** 90 dias corridos após a data de fabricação, em cálculo de data civil independente de horário/fuso. Lotes históricos não são recalculados.
2. **FEFO:** a saída usa primeiro o lote elegível com vencimento mais próximo; empates usam fabricação mais antiga e critério estável.
3. **Cancelamento com congelado:** há retorno automático ao mesmo lote somente antes da separação física, sob estoque controlado. Depois da separação, exige conferência humana registrada. Após expedição/entrega ou quando a cadeia fria for duvidosa, a unidade não volta ao estoque vendável e segue para quarentena/descarte.
4. **Rotulagem:** toda unidade física possui etiqueta individual e todo pacote kraft possui etiqueta externa. Congelados são etiquetados na produção para estoque; itens da produção do dia e o pacote externo são etiquetados ao clicar em “Embalado”, sem substituir eventual validação sanitária/regulatória.
5. **Zebra:** Zebra com driver ZPL é o destino confirmado. A página e o domínio permanecem independentes de ZPL; agente local, rede ou spooler será escolhido como detalhe do adapter no ambiente real.
6. **Arquitetura SaaS:** a Sabor Santè é a primeira Organização. Dados de negócio são isolados por Organização; usuários acessam empresas por associações explícitas e o frontend nunca determina o tenant por um `OrganizationId` arbitrário.

## Sequência obrigatória do que vem a seguir

O planejamento executável por épicos, seus critérios de aceite e a regra de entrega por *one-shot* estão em [`ROADMAP.md`](./ROADMAP.md). Um épico somente é considerado concluído depois das validações, commits e push de todos os repositórios afetados.

Regra de projeto aplicada: a API só seria retomada depois da consolidação formal do frontend. Esse marco foi concluído em 4 de setembro de 2026 e a implementação autoritativa já está em andamento. Os mocks, fixtures e adapters locais continuam servindo como referência de experiência, sem se tornarem automaticamente DTOs ou modelos de persistência.

### 0. Decisões operacionais — concluído

- validade de 90 dias corridos e FEFO confirmados;
- política conservadora de devolução ao estoque definida;
- conteúdo operacional das etiquetas e destino Zebra/ZPL confirmados;
- seleção concreta do adapter de impressão transferida para descoberta técnica do ambiente.

### 1. Consolidar Congelados em Gestão no frontend — concluído no escopo demonstrativo

A jornada navegável de Gestão está consolidada com adapters e estado de sessão locais. Persistência real e integração Zebra/ZPL permanecem deliberadamente fora desta etapa e não impedem o início do passo 2.

- adicionar contrato federado, rotas e navegação;
- implementar Produtos habilitados, Estoque e Vencimentos;
- usar a ação “Habilitar item produzível” e impedir duplicação de nome ou composição dentro de Congelados;
- implementar entrada, lote, movimentos, ajuste e descarte;
- persistir snapshot e histórico de impressão para permitir reimpressão da etiqueta no detalhe do lote;
- consolidar estados de loading, vazio, sem resultados, erro, sucesso e responsividade;
- validar o fluxo de impressão e preparar um adapter local substituível, sem iniciar integração backend.

Mocks e stores desta fase existem para validar UX. Devem permanecer simples, encapsulados por adapters locais quando necessário e não podem ser tratados como contratos definitivos da API.

### 2. Consolidar Congelados no ciclo do Pedido — concluído no escopo demonstrativo

O Pedido agora representa a jornada completa de seleção até cancelamento com fixtures e adapter local. A decisão final de concorrência, atomicidade e persistência continua reservada à API.

- permitir que a Oferta genérica de Congelados receba uma configuração disponível e que o Pedido tenha itens mistos;
- representar disponibilidade vendável sem contar lotes vencidos nos cenários demonstrativos;
- representar alocação FEFO, saída e estorno nos fluxos e estados da interface;
- estornar apenas conforme a regra operacional validada;
- garantir que venda de congelado não entre na Produção diária.

### 3. Completar Embalagem e etiquetas no frontend — concluído no escopo demonstrativo

A Embalagem agora representa o conjunto físico completo de etiquetas por meio de snapshot local e adapter substituível. Persistência real, histórico autoritativo e integração Zebra/ZPL permanecem reservados às etapas posteriores.

- apresentar congelados na conferência visual;
- ao clicar em “Embalado”, imprimir uma etiqueta para cada unidade da produção do dia ainda sem etiqueta e uma etiqueta externa para o pacote kraft;
- reutilizar a etiqueta de estoque já aplicada ao congelado, sem duplicá-la automaticamente;
- imprimir a etiqueta externa também para retirada/balcão, omitindo dados de entrega que não se aplicam;
- permitir reimpressão seletiva das etiquetas individuais e externa a partir de snapshots históricos;
- manter impressão independente do status de Pedido e do estoque.

### 4. Fechar as demais lacunas funcionais do frontend V1 — consolidado como linha de base demonstrativa

- Atendimento / WhatsApp — primeira jornada demonstrativa concluída, incluindo skeletons estruturais da lista e da conversa; integração oficial e efeitos autoritativos permanecem para a API;
- planejamento semanal do Cardápio — jornada demonstrativa concluída, preservando a independência de revisão e publicação de cada dia;
- experiência completa de capacidade — concluída no escopo demonstrativo, incluindo projeção no Pedido aberto, reserva na confirmação, liberação antes da produção e cenários de esgotamento/conflito;
- jornadas demonstrativas de Financeiro, Planos/Créditos e cancelamento consolidadas como referência funcional; efeitos autoritativos pertencem à API;
- Clientes e Entregadores possuem interfaces consolidadas; a fonte única será introduzida pela integração com a API.

### 5. Evoluir tecnicamente o frontend — trabalho posterior não bloqueante

- consolidar navegação SPA e contratos federados tipados;
- adicionar testes unitários, de componente, contrato e E2E nos fluxos críticos;
- criar CI independente por repositório e validação dos consumidores de `ts-components`;
- consolidar tratamento de falhas de remote e impressão;
- validar cache de `remoteEntry.js`, rollback e compatibilidade entre deploys;
- dividir carregamento de páginas pesadas e estabelecer orçamento de bundle, especialmente em Operation e Commercial;
- executar matriz integrada desktop/mobile e regressão de ordem de CSS entre remotes.

### 6. Declarar o frontend consolidado — concluído em 4 de setembro de 2026

- revisar todas as jornadas da V1 contra o estudo de caso e o Guia UI;
- fechar contratos de interface e limites dos adapters sem convertê-los automaticamente em DTOs;
- eliminar lacunas visuais, estados inacessíveis e fontes demonstrativas conflitantes que prejudiquem a validação;
- registrar formalmente que a consolidação terminou antes de autorizar qualquer nova alteração em `ts-api`.

### 7. Retomar a API e integrar o frontend — em andamento

- revisar o scaffold existente antes de aproveitá-lo;
- modelar contratos por caso de uso a partir do estudo de caso e das jornadas consolidadas;
- fundação SaaS multi-tenant concluída na API, com Organização, associação de usuários, isolamento automático de leitura e escrita, restrições compostas e migration dos dados existentes para o tenant Sabor Santè;
- persistência PostgreSQL, migrations e idempotência da primeira fatia de congelados concluídas;
- criação, edição e consulta públicas do Pedido, além da configuração e consulta da capacidade diária, concluídas;
- `ConfirmarPedido` concluído com status, versão otimista, capacidade diária, FEFO, estoque congelado, composição versionada, restrições alimentares, créditos de plano por FIFO, crédito financeiro, cobrança, auditoria, transação serializável e idempotência;
- cancelamento, reagendamento e reversões autoritativos concluídos;
- identidade Keycloak/OIDC, sessão do shell, autorização por associação/papel e auditoria correlacionada concluídas;
- substituir gradualmente os adapters locais dos remotes pela comunicação com a API;
- adicionar telemetria e correlação de requests na integração real.

## Prioridade consolidada

1. Congelados em Gestão, incluindo estoque por lote e etiqueta de produto — concluído no escopo demonstrativo.
2. Congelados no Pedido e na Embalagem, incluindo etiquetas individuais e externa — concluído no escopo demonstrativo.
3. Atendimento / WhatsApp — primeira jornada concluída no escopo demonstrativo.
4. Planejamento semanal, Capacidade, Financeiro, Planos/Créditos, Clientes e Entregadores — consolidados como linha de base demonstrativa.
5. Frontend formalmente consolidado em 4 de setembro de 2026; evoluções técnicas seguem como trabalho posterior não bloqueante.
6. API autoritativa concluída até o E07; a integração de Congelados dos remotes é a próxima entrega.

## Não promover a arquitetura definitiva

- interfaces e IDs dos mocks;
- saldos, responsáveis e timestamps locais;
- `localStorage` como sincronização entre domínios;
- cálculo de validade espalhado em componentes;
- seleção de lote ou concorrência resolvida no navegador;
- impressão acoplada diretamente à página ou ao domínio;
- lógica autoritativa no Vue;
- store global compartilhada entre remotes;
- catálogo, nome, preço ou composição paralelos dentro de Congelados;
- novo remote exclusivo para Congelados ou Etiquetas sem necessidade real de autonomia.
