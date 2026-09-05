# Arquitetura Técnica do Frontend — Sabor Santè

> **Estado analisado:** 03 de setembro de 2026.
>
> **Fonte da implementação:** branch `main` dos repositórios públicos do projeto.
>
> Objetivo: registrar a topologia atual do frontend, responsabilidades de cada repositório, contratos de Module Federation, roteamento, estado demonstrativo, integração, segurança, build, validação e direção de evolução.
>
> Este documento não substitui `ESTUDO DE CASO.md` nem `GUIA UI.md`.

---

# 1. Relação entre os documentos

```text
ESTUDO DE CASO.md
→ negócio, invariantes, fluxos e escopo

ARQUITETURA FRONTEND.md
→ topologia, contratos, rotas, integração, build e qualidade técnica

GUIA UI.md
→ padrões de páginas, interação, responsividade e acessibilidade
```

Em caso de conflito:

```text
domínio
↓
arquitetura técnica
↓
guia de UI
↓
código atual
↓
conveniência
```

Uma simulação frontend não redefine uma regra de domínio.

---

# 2. Workspace atual

O workspace frontend é composto por cinco repositórios independentes:

```text
Workspace/
├── ts-components/
├── ts-host/
├── ts-module-operation/
├── ts-module-commercial/
└── ts-module-management/
```

Topologia:

```text
                        ┌──────────────────────────┐
                        │      ts-components       │
                        │ UI, tipos, CSS e ícones  │
                        └────────────▲─────────────┘
                                     │
                     @thiagoschoeffel/ts-components
                                     │
              ┌──────────────────────┼──────────────────────┐
              │                      │                      │
              ▼                      ▼                      ▼
      ts-module-operation   ts-module-commercial   ts-module-management
              ▲                      ▲                      ▲
              │                      │                      │
              └─────────────── Module Federation ──────────┘
                                     ▲
                                     │
                                  ts-host
```

---

# 3. Responsabilidades dos repositórios

## 3.1. `ts-components`

Responsável por:

- design system;
- componentes Vue genéricos;
- tipos públicos de UI;
- CSS empacotado;
- ícones aprovados;
- primitivas acessíveis;
- Storybook;
- documentação dos componentes.

Não deve conhecer:

- Pedido;
- Cliente;
- Oferta;
- Lote;
- Estoque;
- regras de negócio;
- host;
- remotes.

---

## 3.2. `ts-host`

Responsável por:

- bootstrap da aplicação;
- Vue Router;
- URLs públicas;
- composição de remotes;
- sidebar;
- drawer de navegação mobile;
- breadcrumbs;
- layout global;
- configuração das URLs dos remotes;
- fallback/erro de carregamento de remote;
- contexto global do shell.

Não deve:

- persistir entidades de negócio;
- implementar regra de Pedido;
- importar arquivos internos dos remotes;
- editar estado interno dos remotes.

---

## 3.3. `ts-module-operation`

Responsável pelas experiências operacionais:

```text
Hoje
Atendimento
Pedidos
Produção
Embalagem
Entregas
```

Estado atual relevante:

- Hoje combina os cards ainda demonstrativos das áreas futuras com contagem de Pedidos e capacidade diária consultadas na API;
- Pedidos possui lista, criação, edição, detalhe, confirmação, cancelamento e reagendamento integrados à API autenticada;
- Capacidade usa o snapshot autoritativo por data, apresenta projeção no Pedido aberto sem reservar e delega validação, reserva e liberação à transação da API; congelados ficam fora da contagem;
- Produção possui consulta operacional;
- Embalagem possui experiência própria;
- Entregas possui experiência própria;
- Atendimento possui caixa de entrada e jornada demonstrativa com histórico, handoff humano, retentativa e entrada no Pedido aberto; integração oficial e persistência permanecem pendentes.

---

## 3.4. `ts-module-commercial`

Responsável pelas experiências comerciais:

```text
Cardápios
Clientes
Planos e Créditos
Financeiro
```

Também concentra atualmente stores/mocks demonstrativos dessas áreas.

Estado atual relevante: Cardápios possui calendário diário e planejamento semanal demonstrativo separado. O planejamento registra intenção e pode derivar novos dias em rascunho sem sobrescrever cardápios diários existentes; revisão, publicação e alterações posteriores permanecem próprias de cada dia.

---

## 3.5. `ts-module-management`

Responsável por cadastros e configurações de Gestão:

```text
Catálogo
Produzíveis
Entregadores
Usuários
```

Evolução planejada pelo domínio atualizado:

```text
Congelados e estoque específico de congelados
```

Não criar um remote separado para Congelados sem necessidade concreta de autonomia de deploy/equipe.

---

# 4. Stack atual

As aplicações utilizam atualmente:

```text
Vue                 3.5.x
TypeScript           5.9.x
Vite                 8.2.x
Tailwind CSS         4.3.x
@module-federation/vite 1.21.x
vue-tsc              3.1.x
```

Os consumidores usam:

```text
@thiagoschoeffel/ts-components ^0.7.8
```

`ts-components` publica versão:

```text
0.7.8
```

O host também utiliza:

```text
vue-router 4.6.x
```

Somente o host é proprietário do Vue Router.

---

# 5. Portas de desenvolvimento

```text
ts-host                :4173
ts-module-operation    :4174
ts-module-commercial   :4175
ts-module-management   :4176
ts-components Storybook :6006
```

Os remotes usam `strictPort`, reduzindo risco de o host apontar para uma porta diferente sem perceber.

---

# 6. Module Federation

## 6.1. Host

O host declara:

```text
moduleOperation
moduleCommercial
moduleManagement
```

Todos usam:

```text
type: module
shareScope: default
shared: ['vue']
```

---

## 6.2. Exposições

### Operação

```text
moduleOperation/OperationPage
→ ./src/OperationPage.vue
```

### Comercial

```text
moduleCommercial/CommercialPage
→ ./src/CommercialPage.vue
```

### Gestão

```text
moduleManagement/ManagementPage
→ ./src/ManagementPage.vue
```

Cada remote expõe uma fachada pequena.

Não expor cada página interna individualmente sem necessidade.

---

# 7. Configuração das URLs dos remotes

O host usa variáveis de ambiente:

```text
VITE_OPERATION_REMOTE_URL
VITE_COMMERCIAL_REMOTE_URL
VITE_MANAGEMENT_REMOTE_URL
```

Com fallback de desenvolvimento:

```text
http://localhost:4174/remoteEntry.js
http://localhost:4175/remoteEntry.js
http://localhost:4176/remoteEntry.js
```

A configuração valida que a URL use:

```text
http:
ou
https:
```

Isso deve ser preservado.

Produção/homologação não devem exigir alteração manual do código-fonte.

---

# 8. Compartilhamento de Vue

Host e remotes declaram:

```text
shared: ['vue']
```

Isso evita múltiplos runtimes Vue incompatíveis dentro da mesma árvore de componentes.

Atualizações de Vue devem ser coordenadas entre consumidores.

---

# 9. Tipos federados

A geração automática de tipos federados está atualmente desabilitada:

```text
dts: false
```

O host mantém declarações manuais em:

```text
src/env.d.ts
```

Atualmente essas declarações tipam props das três fachadas.

Isso é melhor do que `DefineComponent` totalmente sem contrato, mas ainda existe duplicação manual entre:

```text
tipos do remote
e
declaração do host
```

## 9.1. Direção recomendada

Quando o contrato crescer, adotar uma estratégia que reduza divergência:

- tipos federados gerados; ou
- pacote pequeno dedicado apenas a contratos de fronteira frontend.

Não mover entidades completas de domínio para esse pacote por conveniência.

---

# 10. Propriedade das rotas

O `ts-host` é a única aplicação com Vue Router.

Regra:

```text
host
→ define URL pública

remote
→ recebe props
→ decide experiência interna
```

Os remotes não devem instalar Vue Router apenas para navegar entre suas páginas.

---

# 11. Rotas operacionais atuais

Prefixo:

```text
/operacoes
```

Rotas:

```text
/operacoes/hoje
/operacoes/atendimento
/operacoes/pedidos
/operacoes/pedidos/novo
/operacoes/pedidos/:id/editar
/operacoes/pedidos/:id
/operacoes/producao
/operacoes/embalagem
/operacoes/entregas
```

Props principais:

```text
section
orderPage
orderId
```

---

# 12. Rotas comerciais atuais

```text
/cardapios
/cardapios/novo
/cardapios/:date

/clientes
/clientes/novo
/clientes/:id/editar
/clientes/:id

/planos
/planos/novo
/planos/aquisicoes/nova
/planos/movimentacoes/nova
/planos/:id/editar

/financeiro
/financeiro/pagamentos/novo
/financeiro/cobrancas/:id
```

A fachada Comercial recebe contexto por props.

---

# 13. Rotas de Gestão atuais

```text
/catalogo
/catalogo/novo
/catalogo/:id/editar
/catalogo/:id

/produziveis
/produziveis/novo
/produziveis/:id/editar
/produziveis/:id/composicao/nova
/produziveis/:id

/entregadores
/entregadores/novo
/entregadores/:id/editar

/usuarios
/usuarios/novo
/usuarios/:id/editar
```

Evolução planejada:

```text
/congelados
/congelados/entrada
/congelados/lotes/:id
```

`/congelados` administra estoque e habilitação de Itens Produzíveis existentes; não representa um segundo catálogo de produtos.

`/congelados/entrada` registra uma produção realizada e cria lote e movimentação de entrada no mesmo caso de uso.

---

# 14. Sidebar

O host organiza navegação em três grupos:

```text
Operação
├── Hoje
├── Atendimento
├── Pedidos
├── Produção
├── Embalagem
└── Entregas

Comercial
├── Cardápios
├── Clientes
├── Planos e Créditos
└── Financeiro

Gestão
├── Catálogo
├── Produzíveis
├── Entregadores
└── Usuários
```

Evolução planejada:

```text
Gestão
├── Catálogo
├── Produzíveis
├── Congelados
├── Entregadores
└── Usuários
```

Não criar navegação interna paralela ao shell para domínios principais.

---

# 15. Breadcrumbs

Breadcrumbs são derivados da rota do host.

Metadados atuais usam:

```text
sectionLabel
parentLabel
parentHref
label
```

O remote não deve importar ou editar breadcrumb global.

Quando um detalhe precisa de nome dinâmico, o host pode usar parâmetros de rota ou evoluir o contrato deliberadamente.

---

# 16. Contrato `retorno`

Páginas de lista preservam contexto quando o usuário abre detalhe/edição.

Padrão:

```text
lista com filtros
→ cria URL de destino com ?retorno=...
→ página interna
→ volta para o contexto anterior
```

O valor de `retorno` deve aceitar apenas destinos internos conhecidos.

Exemplos atuais validam padrões como:

```text
/operacoes/pedidos
/clientes
/catalogo
/produziveis
/entregadores
/usuarios
/planos
```

Não usar query de retorno como open redirect.

---

# 17. Estado da listagem na URL

Quando apropriado, listagens armazenam contexto compartilhável em query string.

Exemplos:

```text
tab
busca
filtros
ordenar
direcao
pagina
```

Regras:

- validar valores contra conjuntos conhecidos;
- usar default seguro para valor inválido;
- preservar estado ao navegar;
- não permitir query arbitrária controlar destino externo;
- restaurar estado quando usuário volta.

A definição visual desses estados pertence ao `GUIA UI.md`.

---

# 18. Navegação nos remotes

Os remotes não possuem router próprio.

A implementação atual possui dois padrões:

```text
window.location.assign(...)
```

e, em módulos mais novos:

```text
utils/navigation
```

## 18.1. Direção recomendada

Convergir para um contrato SPA explícito que preserve a propriedade do host.

Não instalar Vue Router nos remotes.

Objetivo:

```text
remote solicita navegação
→ shell resolve rota
→ sem reload completo
```

Até existir contrato compartilhado estável, mudanças devem seguir o padrão mais recente do workspace sem criar uma terceira estratégia.

---

# 19. Carregamento e falha de remote

`ModuleContent.vue` já distingue:

```text
carregando
falha de remote
conteúdo carregado
```

Em falha, apresenta:

```text
Não foi possível carregar este módulo
[Tentar novamente]
```

O retry atual recarrega a página.

Esse comportamento deve ser preservado e posteriormente conectado a observabilidade.

Não apresentar tela vazia quando `remoteEntry.js` falhar.

---

# 20. Layout global

O shell mantém:

```text
AppHeader
AppSidebar
AppSidebarDrawer
AppBreadcrumbs
ModuleContent
RouterView
```

`ModuleContent` fornece área scrollável e isolada para os remotes.

Remotes não devem duplicar header/sidebar globais.

---

# 21. Estilos

Cada consumidor importa:

```text
@thiagoschoeffel/ts-components/style.css
```

e seu CSS local.

O host mantém estilo global da aplicação.

A implementação atual possui `focus-visible` explícito para links e botões do shell.

Não remover esse comportamento.

---

# 22. Estabilidade CSS em Module Federation

Como remotes são carregados em runtime, a ordem de injeção de CSS pode variar.

Regra:

> componente compartilhado não pode depender da ordem específica em que bundles de módulos foram carregados.

Evitar:

- utilitários conflitantes de mesma especificidade;
- overrides globais vindos de um remote;
- correções locais repetidas para bug estrutural da biblioteca.

Quando o problema pertence ao design system:

```text
corrigir em ts-components
→ publicar patch
→ atualizar consumidores
→ validar alternância entre módulos
```

---

# 23. Compatibilidade de `ts-components`

Enquanto não existir uma estratégia formal de compatibilidade em runtime:

```text
host
operation
commercial
management
```

devem usar versões deliberadamente coordenadas do pacote.

A prática atual é manter a mesma versão.

Após atualizar:

- atualizar `package-lock.json`;
- validar consumidor;
- validar navegação entre dois remotes e retorno;
- evitar divergência de CSS entre versões.

---

# 24. Estado demonstrativo

O frontend ainda não possui API autoritativa conectada para o domínio completo. Por regra de sequência do projeto, a API só será retomada depois que o frontend estiver formalmente consolidado.

São usados:

- mocks TypeScript;
- `localStorage`;
- `setTimeout`;
- stores locais;
- pontes demonstrativas entre alguns módulos.

Esses mecanismos existem para validar UX.

Não são arquitetura final de domínio.

---

# 25. Regra para mocks

Mocks devem representar:

```text
necessidade de interface
```

e não determinar automaticamente:

```text
DTO definitivo
entidade de banco
aggregate root
contrato de API
```

A API .NET deve ser modelada, em sua etapa futura, a partir do estudo de caso e dos fluxos consolidados no frontend.

---

# 26. Cenários determinísticos de revisão

Páginas podem expor cenários por URL para facilitar revisão visual.

Convenção corrente em vários módulos:

```text
mock=padrao
sem-{entidade}
sem-resultados
erro
```

A nomenclatura específica pode variar por feature.

Regras:

- query é apenas ferramenta de demonstração;
- não usar em produção como regra de domínio;
- defaults devem ser seguros;
- cenários não devem modificar silenciosamente dados reais.

---

# 27. Persistência em `localStorage`

Enquanto demonstrativo, `localStorage` é aceitável para:

- criação/edição local;
- estados de protótipo;
- integração visual simples.

Limitações:

- isolado por navegador;
- sem concorrência real;
- sem transação;
- sem autoria confiável;
- usuário pode apagar;
- inadequado para dados pessoais reais;
- não serve como fonte de produção.

---

# 28. Integração transversal atual

Algumas áreas já possuem pontes demonstrativas.

Exemplo relevante:

```text
Cardápio
→ Operação
```

Outras ainda mantêm fontes locais diferentes:

```text
Clientes
Planos
Financeiro
vs
Pedido
```

Não criar uma infraestrutura excessiva de sincronização entre `localStorage`. Durante a consolidação do frontend, preferir adapters e fixtures locais simples e explicitamente demonstrativos.

A solução final deve convergir para backend autoritativo.

---

# 29. Estado remoto futuro

A implementação desse estado ocorre somente depois da consolidação formal do frontend. Antes disso, os adapters podem existir com implementações locais para estabilizar contratos de interface, estados e jornadas, sem executar trabalho no `ts-api`.

Ao conectar a API:

```text
UI
→ estado de apresentação

serviço/adaptador do remote
→ comunicação

API .NET
→ regra autoritativa

backend
→ persistência e transação
```

O frontend pode antecipar cálculo para UX, mas deve aceitar resposta autoritativa do servidor.

## 29.1. Capacidade operacional

Operação consulta `TotalUnits`, `ReservedUnits`, `AvailableUnits` e `Version` por data no adapter HTTP autenticado. O formulário apresenta apenas uma projeção informativa e não reserva capacidade. `ConfirmarPedido` relê e reserva o saldo em transação serializável; reagendamento transfere a reserva atomicamente e cancelamento libera somente no estágio permitido pelo domínio. Itens de estoque congelado não participam da contagem.

Conflitos de versão, capacidade e estoque retornam como erro recuperável. A interface mantém o rascunho ou recarrega o detalhe autoritativo para que o operador possa revisar e repetir a intenção com uma nova chave de idempotência.

## 29.2. Franquia do WhatsApp

Enquanto o backend está congelado, Atendimento usa um snapshot demonstrativo substituível para validar a apresentação da franquia mensal. O contrato de interface distingue mensagens de serviço entregues das reservadas para envios em andamento e inclui limite gratuito, margem de pausa, período, renovação, número comercial e estado autoritativo.

Na integração final:

```text
webhook de entrega / falha
→ API concilia reserva e consumo mensal em transação
→ QuotaGuard autoriza ou bloqueia antes do envio
→ frontend apenas apresenta o snapshot retornado
```

O frontend não pode usar seu contador local como proteção financeira. Aos 97%, a API pausa a automação sem desligar recebimento, histórico ou atendimento humano; ao esgotar a franquia, bloqueia o envio de serviço pela API enquanto não houver autorização explícita para custo pago.

---

# 30. Segurança de redirects

Parâmetros como `retorno` devem ser validados para destinos internos.

Nunca:

```text
window.location.assign(queryArbitraria)
```

sem validação.

---

# 31. Conteúdo rich-text

Conteúdo HTML originado de entrada de usuário ou fonte externa deve ser tratado como não confiável.

Nos aplicativos, todo `Textarea` representa conteúdo rich-text e deve emitir HTML sanitizado. O consumidor deve preservar esse formato no estado e nos snapshots; não deve alternar silenciosamente o mesmo campo entre HTML e texto simples.

Quando renderizado:

```text
sanitizar HTML
```

Não usar `v-html` diretamente em conteúdo não confiável sem camada de sanitização.

Ao exibir o valor, sanitizar novamente e renderizar os elementos suportados com estilos coerentes. Conversão para texto simples fica restrita a busca, validação, indexação e outros usos não visuais explicitamente justificados.

O `GUIA UI.md` define a apresentação visual do conteúdo formatado.

---

# 32. Autenticação e autorização

Cadastro de Usuários não equivale a autenticação.

Antes de dados reais:

- autenticação deve existir;
- sessão deve ser validada;
- rotas podem ser protegidas visualmente;
- API deve validar autorização por ação/recurso;
- ocultar botão não é autorização.

## 32.1. Organização ativa

No produto SaaS, a sessão autenticada também precisa resolver a Organização ativa. Um usuário pode possuir associações com mais de uma Organização, mas toda operação de negócio ocorre sob uma única Organização por vez.

O frontend:

- pode apresentar a Organização ativa retornada pela sessão;
- pode solicitar uma troca de Organização quando esse fluxo for realmente implementado;
- deve atualizar ou invalidar estado, caches e dados carregados após uma troca confirmada;
- não pode usar `OrganizationId` de formulário, query string, `localStorage` ou estado de componente como autoridade de isolamento;
- não deve adicionar `OrganizationId` arbitrário aos DTOs de negócio para tentar controlar o escopo da API.

A API determina o tenant a partir da identidade autenticada e da Organização ativa validada no servidor. O E07 adotou Keycloak/OIDC: o host usa Authorization Code + PKCE e a API valida o JWT para a audiência `ts-api`. O endpoint `/api/session` devolve o usuário de plataforma, a Organização ativa e somente suas associações ativas.

Quando há mais de uma associação, o seletor do header envia `X-Organization-Id` como pedido de troca. O valor permanece apenas em memória, força a remontagem do conteúdo federado e só se torna ativo depois de `/api/session` confirmar a associação no servidor. A claim `organization_id` continua sendo o default emitido pelo provedor; nem claim nem header substituem a verificação da associação persistida.

Papéis iniciais são `Owner`, `Administrator`, `Operator` e `DeliveryDriver`. A API aplica políticas de leitura, operação e administração por endpoint; o frontend pode adequar a apresentação, mas nunca é a fronteira de autorização.

---

# 33. Auditoria

Ações críticas devem ser auditadas no backend.

A auditoria autoritativa preserva ator derivado do `sub`, Organização, instante UTC, ação, recurso e correlação. `ActorId` não pertence aos payloads HTTP e `X-Correlation-Id` é propagado pela API ou criado pelo servidor quando ausente.

Frontend pode exibir:

- responsável;
- data/hora;
- histórico.

Mas não deve ser a fonte confiável de autoria.

---

# 34. Dados pessoais

Clientes possuem:

- nome;
- telefone;
- endereço;
- restrições alimentares.

Dados reais não devem ser mantidos em `localStorage` como solução final.

Logs de frontend não devem expor:

- tokens;
- telefone;
- endereço;
- conteúdo sensível.

---

# 35. Acessibilidade técnica

O shell atual preserva foco visível em links e botões.

Princípios:

- não remover `focus-visible`;
- componentes genéricos complexos devem preferir primitivas acessíveis;
- overlays precisam gerenciar foco;
- botões somente com ícone precisam de nome acessível;
- status precisa de alternativa textual à cor.

Detalhes de apresentação ficam no `GUIA UI.md`.

---

# 36. `ts-components`

## 36.1. API pública

O pacote publica:

```text
@thiagoschoeffel/ts-components
@thiagoschoeffel/ts-components/style.css
```

Artefatos:

```text
ESM
CJS
declarações TypeScript
CSS
```

Vue permanece `peerDependency`.

---

## 36.2. Ícones

Fluxo:

```text
@lucide/vue
→ ts-components/src/icons.ts
→ ts-components/src/index.ts
→ consumidores
```

Consumidores não importam Lucide diretamente.

---

## 36.3. Storybook

Storybook roda atualmente em:

```text
:6006
```

Todo componente/novo comportamento compartilhado deve ter story e documentação.

---

# 37. Desenvolvimento local

Instalar por repositório:

```bash
npm ci
```

ou, quando necessário durante desenvolvimento:

```bash
npm install
```

Execução integrada mínima:

```text
terminal 1 → ts-module-operation
terminal 2 → ts-module-commercial
terminal 3 → ts-module-management
terminal 4 → ts-host
```

Abrir:

```text
http://localhost:4173
```

---

# 38. Build

## Host

```bash
npm run build
```

Executa:

```text
vue-tsc --noEmit
+
vite build
```

## Operation

```bash
npm run build
```

## Commercial

```bash
npm run typecheck
npm run build
```

## Management

```bash
npm run typecheck
npm run build
```

## Components

```bash
npm run typecheck
npm run build
npm run build-storybook
```

quando stories/apresentação compartilhada forem alteradas.

---

# 39. `git diff --check`

Antes de concluir alteração:

```bash
git diff --check
```

Corrigir:

- whitespace inválido;
- conflitos;
- artefatos de edição.

Isso complementa build/typecheck.

---

# 40. Matriz mínima de validação

| Mudança | Validação mínima |
|---|---|
| página em um remote | typecheck/build do remote + fluxo integrado no host |
| rota/sidebar/breadcrumb | build do host + navegação integrada |
| contrato federado | build do host e do remote + execução conjunta |
| componente compartilhado | typecheck/build/Storybook + consumidor real |
| CSS compartilhado | alternar entre remotes e voltar à tela original |
| formulário | desktop + mobile + erros + dirty state quando aplicável |
| listagem | loading + empty + sem resultados + erro + mobile |
| impressão | preview + sucesso + erro + reimpressão |
| regra de URL | reload + back/forward + retorno ao contexto |

---

# 41. Regressão de Module Federation

Para problemas visuais ou CSS:

```text
abrir módulo A
→ navegar para módulo B
→ voltar ao módulo A
```

Não validar somente carregamento inicial.

A ordem de carregamento dos bundles pode revelar conflitos ausentes na primeira entrada.

---

# 42. Lockfiles

Cada repositório possui `package-lock.json`.

Mudança de dependência deve atualizar o lockfile correspondente.

Não commitar `package.json` e deixar lockfile incompatível.

---

# 43. Testes automatizados

O workspace ainda não apresenta cobertura automatizada completa nos scripts públicos atuais.

Direção recomendada:

```text
unit
component
contract
E2E
```

Prioridades:

- confirmação de Pedido;
- cálculos financeiros;
- Planos/Créditos;
- produção;
- estoque congelado;
- Embalagem;
- Entregas;
- roteamento federado.

---

# 44. CI

Cada repositório deve evoluir para CI independente:

```text
npm ci
typecheck
build
testes
```

Mudanças em `ts-components` devem validar consumidores relevantes.

---

# 45. Observabilidade

Antes de produção real, adicionar:

- captura de erro frontend;
- falha de remote;
- falha de API;
- correlação de request;
- métricas essenciais;
- rastreio de erro de impressão quando aplicável.

Não registrar dados pessoais desnecessários.

---

# 46. Deploy

Deploy precisa considerar:

- host independente;
- três remotes independentes;
- URLs por ambiente;
- CORS;
- cache de `remoteEntry.js`;
- chunks com hash;
- rollback;
- compatibilidade host/remote.

`remoteEntry.js` deve permitir descoberta da versão corrente sem cache indefinido incompatível.

---

# 47. Compatibilidade host/remote

Hoje não existe negociação formal de versão.

Compatibilidade depende de:

```text
nome do remote
exposição
props
Vue compatível
assets
URL
```

Mudanças incompatíveis exigem:

- backward compatibility; ou
- deploy coordenado.

---

# 48. Congelados — direção frontend

A nova demanda de congelados não muda a topologia física imediatamente.

Decisão recomendada:

```text
ts-module-management
→ configurações de congelado vinculadas a Produzíveis, preço por apresentação, estoque, lotes, vencimentos e etiqueta do produto

ts-module-operation
→ Pedido e Embalagem
→ etiqueta individual dos itens da produção do dia e etiqueta externa do pacote
```

Não criar:

```text
ts-module-frozen
ts-module-labels
```

sem motivo real de autonomia.

## 48.1. Congelado não duplica Ofertas por preparação

A preparação continua pertencendo a Produzíveis. Uma única Oferta genérica de Congelados organiza a modalidade comercial no Pedido, sem espelhar cada Item Produzível no Catálogo.

Dentro de `ts-module-management`, Congelados deve reutilizar a fonte existente de Itens Produzíveis e acrescentar somente apresentação, preço e comportamento de estoque.

Modelo de fronteira esperado:

```text
Item Produzível existente (obrigatório)
        ↓
ConfiguraçãoCongelado
→ apresentação + preço
        ↓
Lotes / estoque / validade / etiquetas

Pedido
→ Oferta genérica de Congelados + ConfiguraçãoCongelado escolhida
```

`ConfiguraçãoCongelado` possui ID próprio para identificar uma apresentação vendável e rastrear lotes, sem duplicar o nome nem a composição do Item Produzível.

Não duplicar como fonte de verdade em Congelados:

```text
nome
composição
adicionais
grupos de escolha
```

---

# 49. Contrato federado de Management para Congelados

Evolução conceitual:

```text
ManagementSection
├── produziveis
├── catalogo
├── congelados
├── entregadores
└── usuarios
```

O contrato implementado recebe:

```text
frozenPage
frozenLotId
apiRequest
```

O host continua dono das URLs e injeta `apiRequest`, uma função que adiciona o Bearer token e a Organização ativa. O remote não lê tokens nem duplica a sessão OIDC.

O `RouterView` inclui a Organização ativa em sua chave. Uma troca de empresa remonta a tela atual e elimina projeções do tenant anterior antes de carregar os novos dados.

---

# 50. Impressão de etiquetas

Impressão é infraestrutura, não domínio nem design system.

Arquitetura recomendada:

```text
Página
↓
serviço/aplicação de impressão
↓
adapter de impressão
↓
Zebra / mecanismo disponível
```

A página não deve conhecer detalhes de:

- USB;
- rede;
- spooler;
- ZPL;
- driver;
- browser agent.

Esses detalhes pertencem ao adapter.

Para a estação de Embalagem, a integração planejada usa Zebra Browser Print
com a impressora USB padrão e envia ZPL diretamente, sem acionar a janela de
impressão do navegador. O adapter aceita perfis de 203 e 300 dpi para etiquetas
de 100 × 50 mm; o dpi definitivo é configuração da estação e será confirmado
quando o modelo físico for conhecido. O modo de impressão pelo navegador
permanece apenas como fallback demonstrativo.

No modo Zebra, o clique em “Embalado” envia o trabalho diretamente. O preview
continua disponível na reimpressão; em ambientes sem o agente/hardware, também
serve para validar visualmente os templates sem simular uma Zebra existente.

---

# 51. Templates de etiqueta

V1 possui templates controlados:

```text
Produto congelado
Item da produção do dia
Pacote externo do Pedido
```

Não criar designer gráfico genérico.

Dados do template vêm de modelos históricos:

```text
Lote
PedidoItem
Pedido
```

Reimpressão deve produzir o mesmo conteúdo histórico quando aplicável.

Na Embalagem, o clique em “Embalado” solicita um trabalho composto por uma etiqueta para cada unidade da produção do dia ainda sem etiqueta e uma etiqueta externa para o pacote kraft. Itens congelados reutilizam a etiqueta aplicada na produção para estoque.

O comando de Embalagem e o trabalho de impressão podem compartilhar o mesmo gesto na interface, mas permanecem efeitos independentes. Falha ou reimpressão não altera o status do Pedido, estoque ou lote.

---

# 52. Falha de impressão

Falha de impressão não deve:

- desfazer lote;
- alterar estoque;
- confirmar/desconfirmar Pedido;
- criar nova movimentação;
- alterar validade.

O serviço deve retornar estado de erro recuperável.

---

# 53. Estoque congelado e API autoritativa

Desde o E08, configurações, saldo, validade, lotes e movimentos são lidos e alterados somente pela API autenticada. O adapter local de Congelados foi removido; filtros, busca e ordenação continuam como estado de apresentação do remote.

Na solução real:

```text
Confirmar Pedido
↓
API valida estoque
↓
API aloca lote
↓
API registra saída
↓
API confirma Pedido
```

Não tentar resolver concorrência de estoque apenas no navegador.

Políticas confirmadas que pertencem à API/domínio:

```text
origem comercial = Oferta genérica de Congelados + preço da configuração escolhida
origem produtiva = Item Produzível referenciado pela configuração
validade = data de fabricação + 90 dias corridos
alocação = FEFO entre lotes elegíveis
```

A API não deve exigir uma Oferta individual para cada produto congelado. O cadastro referencia obrigatoriamente um Item Produzível e define apresentação e preço de venda.

Nome e composição vêm de Produzíveis. O preço variável vem da ConfiguraçãoCongelado e deve ser preservado como snapshot no Pedido; regras comuns de venda vêm da Oferta genérica de Congelados.

Em empate de validade, priorizar fabricação mais antiga e depois um critério determinístico estável.

No cancelamento, o estorno automático ao mesmo lote só é permitido antes da separação física, enquanto a unidade continua no estoque controlado. Unidade separada exige conferência humana registrada. Unidade expedida, entregue ou sem comprovação de cadeia fria não retorna ao estoque vendável e deve seguir para quarentena/descarte conforme decisão operacional.

O comando de cancelamento deve separar explicitamente o efeito financeiro do destino físico das unidades congeladas e ser idempotente.

---

# 54. Produção diária versus congelados

Não misturar as fontes:

```text
Produção diária
→ deriva de pedidos confirmados do dia

Congelados
→ produção independente
→ lote
→ estoque
```

Venda de congelado não deve inflar consulta de Produção diária.

---

# 55. Dívidas técnicas atuais relevantes

## 55.1. Navegação

Ainda coexistem navegações com reload completo e utilitários mais recentes.

Convergir para um contrato SPA único.

## 55.2. Tipos federados

`dts: false` exige manutenção manual do contrato no host.

Avaliar geração quando a API federada crescer.

## 55.3. Estado demonstrativo duplicado

Clientes/Planos/Financeiro ainda possuem fontes demonstrativas. Pedido persiste o identificador externo do cliente e apresenta os efeitos financeiros autoritativos, mas o diretório completo será integrado no E12.

Durante a consolidação do frontend, manter adapters e fixtures locais simples. Resolver definitivamente na API apenas na etapa final, depois que os fluxos estiverem consolidados.

## 55.4. Testes

Cobertura automatizada ainda é insuficiente.

## 55.5. Backend

Os fluxos de Pedido e capacidade já usam atomicidade, autorização, versão otimista e idempotência reais. Produção, Embalagem, Entregas, Atendimento, Catálogo e Comercial ainda possuem partes demonstrativas previstas nos épicos seguintes.

---

# 56. Pontos técnicos já corrigidos no estado atual

Não registrar como dívida itens já resolvidos:

```text
✅ URLs dos remotes podem vir de variáveis de ambiente
✅ host valida protocolo HTTP(S)
✅ há fallback visual para falha de remote
✅ foco visível existe no shell
✅ Commercial e Management são remotes reais
✅ ts-components está alinhado em 0.7.8 nos consumidores consultados
```

Documentação futura deve verificar o código antes de repetir uma dívida histórica.

---

# 57. Checklist para nova página

1. ler `ESTUDO DE CASO.md`;
2. identificar o remote correto;
3. verificar padrão no `GUIA UI.md`;
4. definir/ajustar rota no host;
5. manter contrato federado pequeno;
6. usar `ts-components`;
7. refletir estado compartilhável na URL quando necessário;
8. preservar `retorno` quando houver lista → detalhe;
9. implementar loading/empty/erro;
10. validar mobile;
11. validar teclado/foco;
12. executar build;
13. executar `git diff --check`;
14. validar integrado no host.

---

# 58. Checklist para componente compartilhado

1. confirmar reuso real;
2. implementar em `ts-components`;
3. usar TypeScript estrito;
4. usar Reka UI quando apropriado;
5. preservar tamanhos;
6. exportar no índice;
7. exportar ícone via `icons.ts`;
8. documentar no Storybook;
9. typecheck;
10. build;
11. build-storybook;
12. validar em consumidor real;
13. atualizar versão/lockfiles.

---

# 59. Regra de contribuição

Uma mudança deve ter um lugar evidente:

```text
regra de negócio
→ backend/domínio futuro

composição de negócio
→ remote correspondente

rota global
→ host

componente genérico
→ ts-components

padrão visual
→ GUIA UI

contrato técnico
→ ARQUITETURA FRONTEND
```

Não resolver um problema cruzando fronteiras apenas porque é mais rápido no curto prazo.

---

# 60. Regra final

A arquitetura frontend é saudável quando:

```text
host permanece simples
+
remotes permanecem coesos
+
contratos permanecem pequenos
+
design system é compartilhado
+
URL preserva contexto
+
falhas são explícitas
+
mocks continuam substituíveis
+
build integrado é reproduzível
```

> Module Federation é uma ferramenta de composição, não uma justificativa para fragmentar o domínio nem duplicar responsabilidades.
