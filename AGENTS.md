# AGENTS.md — Sabor Santè Frontend

> Instruções operacionais para agentes de código.  
> Não replique aqui os documentos canônicos; use este arquivo como roteador de decisões.

## 1. Fontes de verdade

Antes de alterar código, leia:

1. `ESTUDO DE CASO.md` — domínio, invariantes e escopo;
2. `ARQUITETURA FRONTEND.md` — fronteiras, Module Federation, rotas, contratos, estado e validação;
3. `GUIA UI.md` — padrões visuais, páginas, responsividade e acessibilidade.

Os documentos ficam no `ts-host`.

```text
em ts-host:
./docs/ESTUDO DE CASO.md
./docs/ARQUITETURA FRONTEND.md
./docs/GUIA UI.md

em um remote:
../ts-host/docs/ESTUDO DE CASO.md
../ts-host/docs/ARQUITETURA FRONTEND.md
../ts-host/docs/GUIA UI.md
```

Precedência:

```text
ESTUDO DE CASO
→ ARQUITETURA FRONTEND
→ GUIA UI
→ código atual
→ conveniência
```

Se a resposta estiver no workspace, não peça confirmação.  
Se houver ambiguidade real de negócio, não invente regra.

Decisão confirmada: a validade de congelados é de **90 dias corridos após a fabricação**. Centralize o cálculo no domínio, teste viradas de mês/ano e não recalcule lotes históricos.

Decisão confirmada: cada ConfiguraçãoCongelado referencia diretamente um Item Produzível e define apresentação e preço variável. Não criar uma Oferta por preparação; o Pedido usa uma Oferta genérica de Congelados e preserva a configuração e o preço escolhidos.

Decisão confirmada: o sistema evolui como SaaS multiempresa e a Sabor Santè é a primeira Organização. Toda entidade de negócio pertence a uma Organização; o tenant é resolvido pela identidade/sessão no servidor, nunca por `OrganizationId` arbitrário do frontend. Unicidades, idempotência, relações e auditoria devem respeitar essa fronteira.

Marco confirmado em 4 de setembro de 2026: o frontend demonstrativo foi consolidado como linha de base funcional e a implementação da API está autorizada. O frontend pode continuar evoluindo depois desse marco, sem bloquear o backend; preserve as jornadas consolidadas e mantenha mocks/adapters desacoplados dos DTOs autoritativos.

---

## 2. Inspeção obrigatória

Antes de codificar:

- abra a página equivalente existente;
- leia tipos, store/mock e utilitários da feature;
- confira a fachada federada do remote;
- confira a rota correspondente no host;
- consulte a API pública de `@thiagoschoeffel/ts-components`.

Referências visuais principais:

```text
Pedidos     → macrodiagramação
Clientes    → cadastros
Produzíveis → Gestão
Catálogo    → tabs e cadastros auxiliares
```

Não introduza um padrão novo sem verificar primeiro o que já existe.

---

## 3. Responsabilidades

```text
ts-components
→ design system, componentes genéricos, CSS, ícones e Storybook

ts-host
→ shell, Vue Router, URLs, sidebar, breadcrumbs e composição dos remotes

ts-module-operation
→ Hoje, Atendimento, Pedidos, Produção, Embalagem e Entregas

ts-module-commercial
→ Cardápios, Clientes, Planos e Créditos e Financeiro

ts-module-management
→ Catálogo, Produzíveis, Congelados, Entregadores e Usuários
```

Congelados pertencem a `ts-module-management`.

Etiquetas são contextuais:

```text
produto congelado → Congelados / lote
entrega            → Embalagem / Pedido
```

Não crie remote separado para tela/entidade isolada sem justificativa concreta.

---

## 4. Fronteiras obrigatórias

### Host

- é o único proprietário do Vue Router;
- define rotas públicas;
- define sidebar e breadcrumbs;
- traduz URL em props do remote.

### Remotes

- não instalam Vue Router;
- não manipulam estado interno do shell;
- não importam source de repositórios irmãos;
- mantêm composição e estado de apresentação da própria área.

### Design system

- reutilize `@thiagoschoeffel/ts-components`;
- não importe `@lucide/vue` diretamente em host/remotes;
- não importe `ts-components/src/...`;
- não recrie componente já disponível.

Se o problema é genérico, corrija em `ts-components`.  
Se é regra/composição de negócio, mantenha no remote.

---

## 5. Navegação

Nos remotes, use o utilitário existente:

```text
src/utils/navigation.ts
```

Ele usa o evento:

```text
ts:navigate
```

com fallback.

Não adicione `window.location.assign(...)` diretamente em páginas quando o utilitário resolve o caso.

Ao criar rota nova:

1. atualizar `ts-host/src/router/index.ts`;
2. atualizar sidebar se for seção principal;
3. atualizar metadados/breadcrumb;
4. atualizar contrato federado do host se houver nova prop;
5. atualizar tipos/config/fachada do remote;
6. validar host + remote juntos.

---

## 6. URL e `retorno`

Quando relevante, preserve na URL:

```text
tab
busca
filtros
ordenar
direcao
pagina
```

Fluxo esperado:

```text
lista filtrada
→ detalhe/edição
→ voltar
→ mesmo contexto
```

Use `retorno` quando o padrão da feature já fizer isso.

Todo valor vindo da URL deve ser validado.  
`retorno` só aceita destinos internos conhecidos. Nunca crie open redirect.

---

## 7. UI

Detalhes completos ficam no `GUIA UI.md`.

Regras mínimas:

- use `PageHeader` e componentes do design system;
- preserve linguagem visual e densidade atuais;
- listagens tratam loading, empty, sem resultados e erro;
- mobile mantém equivalência funcional;
- valores estruturados usam controles estruturados;
- foco permanece visível;
- status não depende apenas de cor;
- ações destrutivas usam confirmação proporcional ao impacto;
- não crie cards decorativos ou design paralelo.

Colunas só são ordenáveis quando a ordenação tem utilidade real.

Drawers são adequados para auxiliares compatíveis; fluxos extensos podem usar página dedicada.

---

## 8. Mocks e estado demonstrativo

Mocks, stores locais, `setTimeout` e `localStorage` validam UX. Não são arquitetura final.

Não transforme automaticamente em contrato de API:

```text
interfaces de mock
IDs do navegador
chaves de localStorage
nomes atuais de propriedades
```

Ao usar `localStorage`:

- tolere JSON inválido;
- não assuma concorrência;
- não assuma autoria confiável;
- não armazene segredos.

Não crie sincronização complexa entre remotes só para unir mocks. Prefira adapters e fixtures locais simples, suficientes para consolidar o frontend sem antecipar a API.

---

## 9. Não antecipar backend fictício

Se a tarefa é frontend demonstrativo, não introduza sem necessidade explícita:

```text
fetch
Axios
cliente HTTP fictício
DTO definitivo
Repository HTTP fictício
Pinia por preferência
fila/WebSocket
```

Não mova regra autoritativa crítica para Vue porque o backend ainda não existe.

---

## 10. Guardrails de domínio

### Pedido

`Confirmar Pedido` é operação crítica, não simples troca de status.

No sistema real consolida, quando aplicável:

```text
capacidade
restrições
componentes efetivos
créditos
crédito financeiro
estoque congelado
preços
desconto
taxa
cobrança
auditoria
```

### Planos

Consumo normal de crédito ocorre **somente na confirmação do Pedido**.  
Ajuste manual é outro conceito.

### Produção

Produção diária deriva de pedidos confirmados e componentes efetivos estruturados.  
Não use texto de apresentação como fonte definitiva de cálculo.

### Embalagem

Fluxo desejado:

```text
conferir visualmente
→ imprimir etiqueta externa quando necessário
→ Embalado
```

Não exigir checklist item a item como regra de negócio.

### Congelados

```text
produção diária → capacidade do dia
congelados      → lote e estoque
```

Venda de congelado consome estoque, não capacidade diária.

Configuração de congelado referencia Item Produzível, apresentação e preço. A Oferta de Congelados é genérica e não deve ser duplicada por preparação.

Saldo deve ser explicado por movimentações.  
Produto vencido não pode ser vendido.

### Etiquetas

Impressão/reimpressão não altera:

- estoque;
- lote;
- Pedido;
- validade;
- status.

Não criar designer genérico de etiquetas na V1.

---

## 11. Limite do estoque de congelados

A nova necessidade não autoriza criar estoque genérico.

Não expandir automaticamente para:

```text
ingredientes
embalagens
compras
fornecedores
WMS
MRP
múltiplos depósitos
RFID
código de barras
```

Implemente apenas o escopo descrito no estudo de caso.

---

## 12. Componentes compartilhados

Antes de alterar `ts-components`, confirme reuso real.

Ao alterar API/comportamento compartilhado:

- Vue 3 + TypeScript estrito;
- API tipada;
- Reka UI quando apropriado;
- preservar `small`, `medium`, `large` quando aplicável;
- exportar por `src/index.ts`;
- ícones por `src/icons.ts`;
- criar/atualizar Storybook;
- validar em consumidor real.

Não espalhe overrides por vários remotes para corrigir bug da biblioteca.

---

## 13. Module Federation e CSS

Problemas de estilo podem aparecer somente depois da alternância de remotes.

Para mudanças em CSS compartilhado ou `ts-components`, teste:

```text
módulo A
→ módulo B
→ voltar ao módulo A
```

Host e remotes devem usar versões deliberadamente coordenadas de `@thiagoschoeffel/ts-components`.

Enquanto não houver estratégia formal de compatibilidade, mantenha a mesma versão nos consumidores.

Atualize `package-lock.json` quando alterar dependências.

---

## 14. Segurança e acessibilidade

Preserve:

- teclado e `focus-visible`;
- labels e erros associados;
- nome acessível em botões só com ícone;
- foco previsível em Drawer/Dialog;
- contraste e texto além da cor.

Também:

- valide query strings e `retorno`;
- sanitize rich-text antes de renderizar;
- use `rich-text` em todo `Textarea` dos aplicativos e preserve a formatação sanitizada em toda exibição correspondente;
- converta rich-text para texto simples somente em busca, validação ou outro uso não visual justificado;
- não exponha tokens/dados pessoais em logs;
- não trate botão oculto como autorização.

Autorização real pertence ao backend.

---

## 15. Dependências e escopo

Não adicione dependência se o workspace já resolve o problema.

Não altere incidentalmente versões de:

```text
Vue
Vite
Module Federation
ts-components
```

Faça a menor mudança coerente que resolve a tarefa.

Evite:

- reescrever módulo inteiro;
- reorganizar pastas por preferência;
- renomear código não relacionado;
- alterar design validado sem necessidade;
- implementar feature futura não solicitada.

---

## 16. Validação

No projeto alterado, execute obrigatoriamente:

```bash
git diff --check
npm run build
```

Nos projetos atuais, `npm run build` já inclui `vue-tsc --noEmit`.

Quando útil e disponível:

```bash
npm run typecheck
```

### `ts-components`

Se alterar API pública:

```bash
npm run typecheck
npm run build
```

Se alterar stories/apresentação:

```bash
npm run build-storybook
```

---

## 17. Validação integrada

Além do build local:

### rota/contrato

```text
host + remote afetado
```

### visual

```text
desktop + mobile + estados relevantes
```

### componente compartilhado

```text
Storybook + consumidor real + alternância entre módulos
```

### fluxo transversal

Valide o caminho relevante, por exemplo:

```text
Catálogo → Cardápio → Pedido
Pedido → Embalagem → Entregas
Congelados → Pedido → Embalagem
```

---

## 18. Não inventar resultado de validação

Ao concluir:

- informe comandos realmente executados;
- informe sucesso/falha real;
- não diga que testou navegador se não testou;
- não diga que build passou se não executou;
- registre limitações do ambiente.

---

## 19. Git

Não faça sem solicitação explícita:

```text
commit
push
release
publish
```

A execução solicitada de um épico de `docs/ROADMAP.md` é autorização explícita para criar os commits e fazer o push previstos na Definition of Done daquele épico. Nesse caso:

- valide antes de versionar;
- crie um commit convencional e coeso por repositório afetado;
- não inclua mudanças locais alheias ao épico;
- faça push da branch corrente em todos os repositórios afetados;
- só marque o épico como concluído depois que todos os pushes forem confirmados;
- se commit ou push falhar, mantenha o épico em andamento e relate a pendência real.

Não reverta alterações do usuário fora da tarefa.

Antes de concluir:

```bash
git diff
git diff --check
```

---

## 20. Entrega final

Informe objetivamente:

1. o que mudou;
2. arquivos principais;
3. decisões relevantes;
4. validações executadas;
5. resultado dos builds/testes;
6. limitações ou pendências reais.

---

## 21. Regra final

Antes de adicionar código, responda:

```text
Essa regra pertence ao domínio?
Essa responsabilidade pertence a este repositório?
Já existe padrão equivalente?
Já existe componente compartilhado?
O estado precisa estar na URL?
Isso é mock ou verdade futura?
Estou criando complexidade que o negócio não pediu?
```

A melhor implementação é a menor solução que preserva:

```text
domínio
+
fronteiras
+
design system
+
UX consistente
+
build
```
