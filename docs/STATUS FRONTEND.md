# Status frontend — Sabor Santè

Atualizado em 4 de setembro de 2026 após o fechamento das decisões operacionais de Congelados, a consolidação de sua origem obrigatória em Catálogo/Produzíveis e o cruzamento de `ESTUDO DE CASO.md`, `GUIA UI.md`, `ARQUITETURA FRONTEND.md` e das branches `main` dos cinco repositórios do frontend.

Este arquivo registra o estado verificado, as lacunas e a sequência recomendada de evolução. As regras permanentes continuam pertencendo aos três documentos de referência.

## Leitura executiva

O frontend já é um **protótipo funcional amplo**: shell, três remotes, design system e as principais experiências anteriores ao novo estudo de caso estão implementados e navegáveis. Isso permite validar fluxos, conteúdo, responsividade e direção visual.

Ele ainda **não está pronto para operar com dados reais**. A maior parte do comportamento de negócio usa mocks, stores locais, `localStorage` e atrasos simulados. Não há API autoritativa integrada para o domínio completo, autenticação, autorização, transações, concorrência, cobertura automatizada suficiente, observabilidade ou CI nos aplicativos.

A principal ampliação de escopo é **Congelados**. Configurações que habilitam Ofertas e Itens Produzíveis existentes para estoque congelado, lotes, movimentações, vencimentos, etiquetas de produto, alocação no Pedido e etiqueta externa de entrega entraram na V1, mas ainda não possuem implementação frontend. A topologia atual comporta a mudança sem criar outro remote nem um catálogo comercial paralelo:

```text
ts-module-management
→ configurações de congelado, estoque, lotes, vencimentos e etiqueta de produto

ts-module-operation
→ venda no Pedido, conferência na Embalagem e etiqueta de entrega

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
| Navegação SPA | Parcial | Existe bridge no host e utilitários nos remotes, mas ainda há `window.location.assign` e links que dependem da interceptação global |
| Contratos federados | Parcial | Fachadas pequenas e declarações manuais no host; geração de tipos permanece desabilitada (`dts: false`) |
| Design system | Implementado | `ts-components` 0.7.4 está alinhado nos quatro consumidores e possui componentes, ícones e Storybook |
| Padrões do Guia UI | Parcial | Páginas recentes seguem os padrões principais; cenários determinísticos e estados completos ainda não são uniformes em toda tela antiga |
| API de negócio | Pendente | Não existe integração autoritativa para o domínio completo |
| Autenticação e autorização | Pendente | Cadastro demonstrativo de usuários não representa sessão nem permissão real |
| Testes automatizados | Pendente | Não foram encontrados scripts/suítes de testes nos cinco projetos |
| CI dos aplicativos | Pendente | Apenas `ts-components` possui workflow, voltado à publicação; falta pipeline de qualidade dos aplicativos |
| Observabilidade | Pendente | Sem captura central de erro, telemetria de API/remote ou correlação de requests |
| Compatibilidade de deploy | Parcial | Builds e URLs independentes existem; não há negociação formal de versão host/remote |
| Desempenho de bundles | Parcial | Os cinco builds passam, mas Operation e Commercial emitem aviso de chunks acima de 500 kB |

## Estado funcional por domínio

“Protótipo funcional” abaixo descreve a UX existente, não a conclusão das regras transacionais do backend.

| Área | Estado | O que existe hoje | O que falta para a V1 |
| --- | --- | --- | --- |
| Hoje | Protótipo funcional | Dashboard operacional e estado demonstrativo de sincronização | Dados reais e consolidação pela API |
| Atendimento / WhatsApp | Pendente | Entrada na navegação e placeholder | Canal, histórico, handoff humano, idempotência, ordem, retentativa e montagem de Pedido aberto |
| Pedidos | Protótipo funcional | Lista, criação, edição, detalhe, confirmação, cancelamento e reagendamento simulados | `ConfirmarPedido` autoritativo, capacidade, estoque congelado, créditos e financeiro em uma transação |
| Capacidade | Pendente | Consequências são apenas descritas/simuladas no Pedido | Reserva e liberação concorrentes na API |
| Produção diária | Protótipo funcional | Consulta agregada a partir de pedidos demonstrativos | API baseada apenas em pedidos confirmados; manter congelados fora dessa apuração |
| Embalagem | Parcial | Fila, conferência visual e ação única “Embalado” | Exibir congelados e imprimir/reimprimir etiqueta externa com snapshot do Pedido |
| Entregas | Protótipo funcional | Rotas, paradas, tentativas, falhas, reagendamento e folha de rota | Persistência, auditoria, validações de transição e integração com Pedido/entregadores reais |
| Clientes | Protótipo funcional | Lista, detalhe, cadastro, endereços, preferências, restrições e observações | Fonte única com Pedidos e persistência segura na API |
| Catálogo / Ofertas | Protótipo funcional | Ofertas, componentes, escolhas, adicionais e tipos de componente | API, contratos definitivos e vínculo real com cardápio/pedido |
| Produzíveis / Composições | Protótipo funcional | Cadastro, detalhe e versões de composição | Persistência autoritativa e uso histórico integrado na confirmação |
| Cardápio diário | Protótipo funcional | Calendário, criação/edição, publicação, disponibilidade e importação por planilha demonstrativa | API e integração autoritativa com catálogo e Pedido |
| Planejamento semanal | Pendente | A visualização por semana do calendário não implementa a entidade/processo de planejamento semanal | Planejar semana, derivar dias e preservar revisão/publicação diária |
| Planos e Créditos | Protótipo funcional | Planos, aquisições, saldos, movimentações e estorno demonstrativos | FIFO e consumo/estorno autoritativos na confirmação/cancelamento do Pedido |
| Financeiro | Protótipo funcional | Cobranças, pagamentos, alocações, saldos e crédito financeiro demonstrativos | Origem na confirmação, efeitos de cancelamento e transação na API |
| Entregadores | Protótipo funcional | Lista e cadastro demonstrativos | Fonte única para preferência, atribuição e tentativa real |
| Usuários | Protótipo funcional | Lista e cadastro de perfis/status | Identidade, sessão, autorização por ação/recurso e auditoria confiável |

## Nova frente: Congelados e etiquetas

Não foram encontrados no código atual rotas `/congelados`, seção de Gestão, tipos, mocks/stores ou páginas dessa frente. O quadro abaixo é, portanto, backlog novo da V1.

| Entrega | Estado | Repositório principal | Dependências |
| --- | --- | --- | --- |
| Configuração de congelado | Pendente | `ts-module-management` | Referências obrigatórias a Oferta e Item Produzível existentes; apresentação estocável; ativo/inativo; sem duplicar nome, preço ou composição |
| Estoque com tabs Estoque/Produtos habilitados/Vencimentos | Pendente | `ts-module-management` | Leitura agregada de configurações, lotes e movimentos |
| Entrada de produção congelada | Pendente | `ts-module-management` | Seleção de configuração já habilitada; validade de 90 dias corridos; criação atômica de lote + `EntradaProducao` |
| Detalhe do lote e movimentações | Pendente | `ts-module-management` | Saldo derivado, responsável, motivo e histórico |
| Ajuste e descarte | Pendente | `ts-module-management` | Comandos auditáveis; nunca edição direta de saldo |
| Etiqueta de produto 100 × 50 mm | Pendente | `ts-module-management` | Snapshot de lote, preview 2:1, quantidade, serviço/adapter de impressão |
| Reimpressão de produto | Pendente | `ts-module-management` | Reusar histórico sem alterar estoque |
| Congelados no Pedido | Pendente | `ts-module-operation` | Oferta existente habilitada, disponibilidade e alocação FEFO autoritativa |
| Saída e estorno por Pedido | Pendente | API + `ts-module-operation` | Confirmação atômica; retorno automático somente antes da separação física |
| Congelados na Embalagem | Pendente | `ts-module-operation` | Snapshot dos itens confirmados |
| Etiqueta externa 100 × 50 mm | Pendente | `ts-module-operation` | Snapshot de cliente/endereço/telefone do Pedido e impressão contextual |
| Rotas, sidebar e breadcrumbs | Pendente | `ts-host` | Contrato federado de Management definido |

## Decisões operacionais fechadas

1. **Validade:** 90 dias corridos após a data de fabricação, em cálculo de data civil independente de horário/fuso. Lotes históricos não são recalculados.
2. **FEFO:** a saída usa primeiro o lote elegível com vencimento mais próximo; empates usam fabricação mais antiga e critério estável.
3. **Cancelamento com congelado:** há retorno automático ao mesmo lote somente antes da separação física, sob estoque controlado. Depois da separação, exige conferência humana registrada. Após expedição/entrega ou quando a cadeia fria for duvidosa, a unidade não volta ao estoque vendável e segue para quarentena/descarte.
4. **Rotulagem:** o conteúdo operacional descrito para as etiquetas de produto e entrega está aprovado para a V1, sem substituir eventual validação sanitária/regulatória.
5. **Zebra:** Zebra com driver ZPL é o destino confirmado. A página e o domínio permanecem independentes de ZPL; agente local, rede ou spooler será escolhido como detalhe do adapter no ambiente real.

## Sequência recomendada do que vem a seguir

### 0. Decisões operacionais — concluído

- validade de 90 dias corridos e FEFO confirmados;
- política conservadora de devolução ao estoque definida;
- conteúdo operacional das etiquetas e destino Zebra/ZPL confirmados;
- seleção concreta do adapter de impressão transferida para descoberta técnica do ambiente.

### 1. Firmar a fronteira com a API

- definir contratos por caso de uso, sem transformar interfaces dos mocks em DTOs definitivos;
- definir `ConfiguraçãoCongelado` como vínculo obrigatório com IDs de Oferta e Item Produzível existentes, mantendo nome, preço e composição em suas fontes originais;
- centralizar a validade como data de fabricação + 90 dias corridos e testar viradas de mês, ano e ano bissexto;
- implementar `ConfirmarPedido` como operação atômica para capacidade, créditos, financeiro e estoque congelado;
- introduzir adaptadores de API nos remotes e remover gradualmente fontes locais duplicadas;
- implementar autenticação, autorização e auditoria antes de usar dados reais.

### 2. Entregar Congelados verticalmente em Gestão

- adicionar contrato federado, rotas e navegação;
- implementar Produtos habilitados, Estoque e Vencimentos;
- usar a ação “Habilitar produto do catálogo” e impedir criação ou edição de identidade comercial dentro de Congelados;
- implementar entrada, lote, movimentos, ajuste e descarte;
- implementar preview, impressão, erro recuperável e reimpressão da etiqueta do produto.

Uma fatia vertical deve ir da rota ao caso de uso da API. Criar apenas telas apoiadas em um novo ecossistema de `localStorage` aumentaria uma integração temporária que já precisa ser removida.

### 3. Integrar Congelados ao ciclo do Pedido

- permitir que uma Oferta existente seja atendida por estoque congelado e que o Pedido tenha itens mistos;
- consultar disponibilidade vendável sem contar lotes vencidos;
- alocar lote e registrar saída durante a confirmação;
- estornar apenas conforme a regra operacional validada;
- garantir que venda de congelado não entre na Produção diária.

### 4. Completar Embalagem e etiquetas

- apresentar congelados na conferência visual;
- imprimir/reimprimir etiqueta externa com snapshot histórico;
- dispensar impressão para retirada/balcão quando aplicável;
- manter impressão independente do status de Pedido e do estoque.

### 5. Fechar as demais lacunas funcionais da V1

- Atendimento / WhatsApp;
- planejamento semanal do Cardápio;
- capacidade autoritativa;
- integração completa de Financeiro, Planos/Créditos e cancelamento;
- unificação de Clientes e Entregadores entre os módulos.

### 6. Preparar operação real

- consolidar navegação SPA e contratos federados tipados;
- adicionar testes unitários, de componente, contrato e E2E nos fluxos críticos;
- criar CI independente por repositório e validação dos consumidores de `ts-components`;
- adicionar telemetria, captura de falhas de remote/API/impressão e correlação de requests;
- validar cache de `remoteEntry.js`, rollback e compatibilidade entre deploys;
- dividir carregamento de páginas pesadas e estabelecer orçamento de bundle, especialmente em Operation e Commercial;
- executar matriz integrada desktop/mobile e regressão de ordem de CSS entre remotes.

## Prioridade consolidada

1. Definir contratos da API e implementar a confirmação transacional do Pedido.
2. Entregar Congelados em Gestão, incluindo estoque por lote e etiqueta de produto.
3. Integrar congelados ao Pedido e à Embalagem, incluindo etiqueta externa.
4. Concluir Financeiro/Planos/Capacidade sobre a API.
5. Implementar Atendimento / WhatsApp e planejamento semanal.
6. Remover fontes locais duplicadas e integrar os demais cadastros.
7. Implementar identidade, autorização, auditoria, testes, CI e observabilidade.

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
