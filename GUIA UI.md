# Guia de Implementação de UI — Sabor Santè

> **Status geral:** frontend evolutivo, atualizado em 2 de setembro de 2026. Catálogo está concluído e a primeira entrega de Cardápios está integrada à operação. As seções detalhadas de Catálogo permanecem como especificação e checklist histórico de aceite.
>
> Projeto: **Sabor Santè**  
> Escopo deste guia: **somente frontend**  
> Stack: **Vue 3 + TypeScript + Vite + Module Federation + Tailwind CSS + `@thiagoschoeffel/ts-components`**  
> Remote existente: **`ts-module-management`**  
> Funcionalidade já existente no remote: **Produzíveis**  
> Nova funcionalidade: **Catálogo**  
> Host: **`ts-host`**  
> Referências visuais obrigatórias: **Produzíveis, Clientes e Pedidos**

---

# 0. Estado atual da UI e próximos passos

Esta seção é a referência rápida do estado real do workspace. Quando uma seção histórica deste documento disser que Cardápios ainda não existe, essa restrição deve ser entendida como pertencente ao escopo original de implementação do Catálogo; Cardápios foi desenvolvido posteriormente no módulo Comercial.

## 0.1. Funcionalidades prontas

| Área | Estado atual |
|---|---|
| Shell e navegação | Host federado, sidebar, rotas públicas e breadcrumbs em funcionamento. |
| Hoje | Dashboard operacional demonstrativo com leitura do cardápio publicado no dia. |
| Pedidos | Listagem, busca, filtros, paginação, criação, edição e detalhe com dados demonstrativos. |
| Clientes | Listagem, criação, edição, detalhe, endereços, preferências e restrições. |
| Produzíveis | Listagem, cadastro, detalhe e composição versionada. |
| Catálogo | Ofertas, tipos de componente, adicionais, componentes, grupos de escolha e compatibilidades. |
| Cardápios | Calendário mensal, criação e edição do cardápio diário, rascunho/publicação, disponibilidade por opção e oferta, preço efetivo e ordenação. |
| Integração Cardápio → Operação | Hoje e Novo Pedido consultam o cardápio publicado; itens esgotados ou suspensos não entram como disponíveis. |

O formulário de Cardápios já utiliza `DatePicker`, resumo lateral, alerta contextual, controles `medium` de ordenação e drag and drop com alça dedicada no desktop. As setas permanecem como alternativa acessível e para dispositivos móveis. A listagem mensal mantém o mês na URL e oferece inclusão diretamente no dia elegível.

## 0.2. Próximo desenvolvimento recomendado

O próximo recorte prático é **Entregadores**, dentro de Gestão. É um cadastro pequeno, já previsto no domínio e necessário para substituir referências textuais em Clientes e preparar a implementação real de Entregas.

Escopo mínimo recomendado:

```text
Entregadores
├── listagem com busca e status
├── cadastro e edição
├── nome, telefone opcional e ativo/inativo
├── detalhe ou edição direta conforme o padrão mais compacto existente
└── seleção tipada em Clientes e, futuramente, Rotas
```

## 0.3. Backlog funcional

Ordem recomendada, respeitando dependências atuais:

1. **Entregadores** — cadastro estruturado e integração com a preferência do Cliente.
2. **Usuários** — cadastro simples e perfis iniciais para preparar autoria e auditoria.
3. **Planos e Créditos** — planos, aquisições, saldo explicado por movimentações, consumo e estorno.
4. **Financeiro** — cobranças, pagamentos, alocações, crédito financeiro, descontos e taxas.
5. **Produção** — substituir o placeholder por necessidade agregada derivada de pedidos confirmados.
6. **Embalagem** — conferência simples e ação de pedido embalado com responsável e horário.
7. **Entregas** — rotas manuais, paradas ordenadas, tentativas, falhas e reagendamentos.
8. **Atendimento** — conversas, alternância automação/humano e montagem de Pedido Aberto.
9. **Planejamento semanal de Cardápios** — adicionar a camada de intenção semanal sem substituir a verdade operacional diária já pronta.

## 0.4. Pendências transversais

- substituir mocks e `localStorage` por APIs e persistência reais, preservando os tipos de domínio;
- trocar navegações com recarga completa por um contrato SPA compartilhado entre host e remotes;
- implementar autenticação, perfis e auditoria seletiva antes dos fluxos críticos de produção financeira;
- adicionar testes automatizados de unidade, integração e navegação federada aos fluxos já validados manualmente;
- manter host e módulos na mesma versão de `@thiagoschoeffel/ts-components` e validar alternância entre módulos após mudanças de CSS compartilhado;
- preservar snapshots históricos quando Cliente, Catálogo, Cardápio ou Produzível forem alterados.

---

# 1. Objetivo

Implementar a funcionalidade de **Catálogo** dentro do remote já existente `ts-module-management`, sem criar um novo microfrontend e sem reinicializar o módulo.

A implementação deve consolidar, no frontend, os conceitos comerciais que servirão posteriormente de dependência para Cardápios, Planos e Créditos e outros fluxos.

O Catálogo deve contemplar, nesta etapa:

```text
Catálogo
├── Ofertas
│   ├── dados comerciais
│   ├── componentes incluídos
│   ├── grupos de escolha
│   ├── opções dos grupos
│   └── adicionais permitidos
│
├── Tipos de componente
│   └── papéis comerciais estáveis
│
└── Adicionais
    ├── preço
    ├── item produzível correspondente
    ├── quantidade operacional
    └── unidade
```

A implementação deve:

- preservar a separação entre **Oferta**, **Item Produzível** e **Composição**;
- reutilizar Produzíveis já implementado dentro do mesmo `ts-module-management` quando for necessário selecionar um item produzível;
- não duplicar mocks ou estruturas de Produzíveis sem necessidade;
- manter o host como dono das URLs públicas, sidebar e breadcrumbs;
- manter `ts-module-management` como dono da experiência do Catálogo;
- consumir `@thiagoschoeffel/ts-components` como fonte visual de verdade;
- seguir rigidamente a linguagem visual já aplicada em Operações, Clientes e Produzíveis;
- usar apenas tipos de apresentação e mocks locais nesta fase;
- não criar contratos HTTP definitivos;
- não introduzir backend, `fetch`, Axios, Pinia ou bibliotecas novas sem necessidade real já presente no workspace;
- manter a implementação simples, operacional e coerente com uma empresa pequena;
- deixar Catálogo pronto para ser consumido futuramente por Cardápios e Planos, sem implementar essas áreas agora.

---

# 2. Fontes de verdade obrigatórias

Antes de alterar qualquer arquivo, o Codex deve ler e considerar como fonte de verdade:

1. `ESTUDO DE CASO.md`, principalmente:
   - princípios arquiteturais;
   - Catálogo comercial;
   - Oferta;
   - componentes da oferta;
   - tipos de componente;
   - grupos de escolha;
   - acréscimos em escolhas;
   - adicionais;
   - compatibilidade de adicionais;
   - Item Produzível e Composição;
   - separação entre comercial e produção;
   - Cardápio e resolução de componentes no dia;
   - limites da V1;
   - filosofia de evolução arquitetural.
2. `AGENTS.md` do host e dos módulos, principalmente:
   - responsabilidades do host, dos módulos e do design system;
   - estabilidade visual em Module Federation;
   - padrões de páginas, listagens, formulários e detalhes;
   - linguagem visual;
   - acessibilidade;
   - build e validação.
3. Código atual de `ts-module-management`, especialmente Produzíveis.
4. Código atual de `ts-module-commercial`, especialmente Clientes.
5. Código atual de `ts-module-operation`, especialmente lista, criação/edição e detalhe de Pedidos.
6. Código atual de `ts-host`.
7. API pública de `ts-components` em `src/index.ts`.
8. Stories dos componentes compartilhados sempre que houver dúvida sobre API, comportamento ou variação visual.

## 2.1. Regra de precedência

Quando houver divergência:

```text
Regra de domínio documentada
    ↓
Arquitetura técnica documentada
    ↓
Padrão consolidado no código atual
    ↓
Conveniência da implementação nova
```

Não alterar uma regra de negócio para simplificar a UI.

Não introduzir uma abstração nova apenas porque seria comum em outro projeto.

---

# 3. Estado esperado antes de começar

Assumir que o workspace já possui:

```text
Workspace/
├── ts-components/
├── ts-host/
├── ts-module-operation/
├── ts-module-commercial/
└── ts-module-management/
```

E que `ts-module-management` já está funcionando como remote, com Produzíveis implementado.

Antes de codificar Catálogo, confirmar no código real:

- nome do remote de management;
- exposição federada atual;
- porta local atual;
- props já aceitas por `ManagementPage.vue`;
- organização de `src/pages`, `src/components`, `src/types`, `src/mocks` e `src/config`;
- rotas de Produzíveis no host;
- forma atual de navegação do remote;
- como o host gera breadcrumbs para Gestão;
- como Produzíveis persiste dados demonstrativos;
- como Produzíveis expõe ou consulta sua lista de itens para uso interno do mesmo remote.

**Não reconfigurar o remote se ele já estiver correto.**

Catálogo deve ser uma evolução incremental do módulo existente.

---

# 4. Decisão arquitetural: Catálogo permanece em Management

O módulo deve continuar assim:

```text
ts-module-management
├── Produzíveis       ✅ existente
├── Catálogo          ← implementar agora
├── Entregadores      ← próximo
└── Usuários          ← futuro
```

Não criar:

```text
ts-module-catalog
```

Não criar um microfrontend para Oferta, Tipo de Componente ou Adicional.

Os três conceitos pertencem à mesma experiência administrativa de Catálogo.

---

# 5. Conceitos de domínio que a UI deve preservar

# 5.1. Oferta

`Oferta` é o principal conceito comercial e representa **aquilo que o cliente compra**.

Exemplos:

```text
Prato do dia
Prato + Salada P
Prato + Fruta
Prato + Salada P + Fruta
Salada G
Salada P + Proteína
Salada G + Proteína
```

Uma oferta pode possuir:

- identidade comercial;
- nome;
- preço base;
- situação ativa/inativa;
- componentes incluídos;
- grupos de escolha;
- opções dentro desses grupos;
- acréscimos em determinadas escolhas;
- adicionais permitidos;
- necessidade futura de escolha de opção de cardápio.

A UI nunca deve chamar Oferta de Item Produzível.

---

# 5.2. Item Produzível

Item Produzível já pertence à funcionalidade Produzíveis e significa **aquilo que pode ser preparado, montado ou utilizado na produção**.

A relação conceitual é:

```text
Oferta
→ o que é vendido

Item Produzível
→ o que é produzido

Composição
→ como é produzido
```

Catálogo não deve editar composição de Item Produzível.

Quando for necessário selecionar um Produzível, a UI deve apenas referenciá-lo.

---

# 5.3. Tipo de componente

Tipo de componente representa um papel comercial estável.

Exemplos:

```text
Prato do dia
Salada P
Salada G
Fruta
Proteína
```

Esses tipos devem ser configuráveis.

Não criar enum TypeScript fechado como fonte definitiva do domínio.

Mocks podem utilizar IDs conhecidos, mas a interface deve trabalhar conceitualmente com registros configuráveis.

---

# 5.4. Componente da oferta

Uma oferta declara estruturalmente o que inclui.

Exemplo:

```text
Oferta: Prato + Salada P + Fruta

Componentes:
- 1 x Prato do dia
- 1 x Salada P
- 1 x Fruta
```

Cada componente da oferta deve apontar para um **Tipo de Componente**, não diretamente para uma composição.

Na modelagem de apresentação, manter:

- tipo de componente;
- quantidade.

Não resolver agora o componente para o prato concreto do dia. Isso pertence a Cardápios.

---

# 5.5. Grupo de escolha

Algumas ofertas permitem escolhas internas.

Exemplo:

```text
Prato do dia + Salada OU Fruta
```

Representar grupo de escolha com:

- nome;
- quantidade mínima;
- quantidade máxima;
- opções permitidas.

Exemplo:

```text
Grupo: Acompanhamento
mínimo: 1
máximo: 1
opções:
- Salada P
- Fruta
```

Não transformar isso em texto livre.

---

# 5.6. Acréscimo da opção

Uma opção de grupo pode possuir acréscimo financeiro.

Exemplo conceitual:

```text
Opção A → + R$ 0,00
Opção B → + R$ 4,00
```

O valor é parte da configuração comercial da opção.

Nesta fase de frontend ele é demonstrativo e não deve ser tratado como cálculo financeiro autoritativo do backend.

---

# 5.7. Adicional

Adicional é algo comprado **além da configuração base da oferta**.

Exemplos:

```text
Proteína extra
Feijão extra
Molho extra
```

Adicional é diferente de:

- componente incluído;
- opção de grupo;
- substituição;
- desconto;
- taxa.

Um adicional pode possuir:

- nome;
- preço;
- item produzível correspondente;
- quantidade operacional;
- unidade de medida;
- ativo/inativo.

---

# 5.8. Compatibilidade de adicional

Nem todo adicional deve aparecer em toda oferta.

A Oferta deve definir quais adicionais são permitidos.

A UI deve permitir configurar essa compatibilidade explicitamente.

Não inferir compatibilidade pelo nome ou pelo Item Produzível.

---

# 6. Relação que NÃO deve ser implementada agora

Cardápios ainda não está implementado e não deve ser antecipado dentro de Catálogo.

Portanto:

```text
Oferta
→ define papéis e estrutura comercial

Cardápio futuro
→ resolverá esses papéis para itens concretos do dia
```

Não criar em Oferta campos como:

```text
pratoDeHoje
itemDoDia
tradicionalDeHoje
lowCarbDeHoje
vegetarianoDeHoje
```

Isso seria acoplamento indevido com Cardápios.

---

# 7. Estratégia de UX para Catálogo

Catálogo deve ser apresentado como uma única área de Gestão com três visões internas:

```text
Catálogo
├── Ofertas
├── Tipos de componente
└── Adicionais
```

## 7.1. Ofertas como visão principal

Ao acessar `/catalogo`, a experiência principal deve ser a lista de Ofertas.

Ofertas possuem maior complexidade e justificam páginas próprias para:

```text
Lista
Novo
Detalhe
Editar
```

## 7.2. Tipos de componente como cadastro auxiliar

Tipos de componente são registros pequenos e estáveis.

Não criar uma árvore complexa de páginas se o padrão visual atual permitir uma experiência mais simples.

Preferência:

- lista/tabela compacta;
- criar/editar por `Drawer`, `Popover` ou outra primitiva já utilizada no workspace e adequada ao comportamento;
- ativar/inativar sem apagar histórico conceitual.

Antes de escolher Drawer ou página, o Codex deve verificar os padrões atualmente consolidados em Produzíveis, Clientes e `ts-components`.

## 7.3. Adicionais como cadastro auxiliar

Adicionais também podem ser administrados dentro da área Catálogo.

Preferência:

- lista/tabela compacta;
- criar/editar com experiência consistente com Tipos de componente;
- seleção opcional de Item Produzível existente;
- valor e quantidade operacional claros.

## 7.4. Não criar um “dashboard de catálogo” sem necessidade

`/catalogo` deve abrir diretamente uma experiência útil.

Não criar uma página intermediária com cartões apenas para escolher:

```text
Ofertas
Tipos
Adicionais
```

Se Tabs ou navegação equivalente já resolverem isso com menos cliques, preferir a solução mais direta.

---

# 8. Rotas públicas

O host continua responsável pelas rotas.

Rotas obrigatórias para Oferta:

```text
/catalogo
/catalogo/novo
/catalogo/:id
/catalogo/:id/editar
```

Para as visões auxiliares, a preferência é manter a mesma rota `/catalogo` e representar a seção com query string quando isso estiver consistente com o padrão existente:

```text
/catalogo?secao=ofertas
/catalogo?secao=tipos-componentes
/catalogo?secao=adicionais
```

A query deve ser validada contra valores conhecidos.

Se o código atual do host já tiver adotado subrotas estáticas para funcionalidades equivalentes, o Codex pode utilizar:

```text
/catalogo/tipos-componentes
/catalogo/adicionais
```

Mas deve escolher **uma única estratégia**, seguir o padrão real do workspace e evitar duplicação de URLs para o mesmo estado.

## 8.1. Precedência de rotas

Caso use subrotas estáticas, garantir que:

```text
/catalogo/tipos-componentes
/catalogo/adicionais
```

não sejam capturadas acidentalmente por:

```text
/catalogo/:id
```

Validar a tabela de rotas do host.

## 8.2. Retorno para a lista

Ao abrir Oferta em detalhe, novo ou edição a partir da lista, preservar contexto útil da listagem seguindo o conceito de `retorno` já consolidado em Pedidos/Clientes quando aplicável.

O retorno deve aceitar apenas destinos internos válidos do Catálogo.

---

# 9. Contrato federado do `ManagementPage`

Não criar uma segunda exposição federada apenas para Catálogo.

Evoluir a fachada existente de Gestão.

O formato final deve seguir a estrutura real já existente no projeto.

Exemplo conceitual:

```ts
export type ManagementSection =
  | 'produziveis'
  | 'catalogo'
  | 'entregadores'
  | 'usuarios'

export type CatalogPage =
  | 'list'
  | 'new'
  | 'detail'
  | 'edit'

export interface ManagementPageProps {
  section?: ManagementSection
  produciblePage?: ProduciblePage
  producibleId?: string
  catalogPage?: CatalogPage
  offerId?: string
}
```

Não copiar literalmente se o módulo atual usa outra convenção.

A regra é:

- contrato pequeno;
- props tipadas;
- host traduz URL em contexto;
- remote decide qual página interna renderizar.

---

# 10. Integração com sidebar e breadcrumbs

O item `Catálogo` da seção Gestão já deve existir visualmente no shell.

Transformá-lo em navegação real sem alterar sua aparência.

## 10.1. Sidebar

Esperado:

```text
Gestão
├── Catálogo       ← ativo
├── Produzíveis    ← já ativo
├── Entregadores
└── Usuários
```

Não reorganizar a sidebar sem necessidade.

Não mudar ícones, espaçamentos ou agrupamentos apenas por causa desta feature.

## 10.2. Breadcrumbs

Sugestão conceitual:

```text
Gestão > Catálogo
Gestão > Catálogo > Nova oferta
Gestão > Catálogo > Nome da oferta
Gestão > Catálogo > Nome da oferta > Editar
```

Se o host atualmente utiliza outra nomenclatura de breadcrumb, preservar o padrão real.

O breadcrumb não deve importar conhecimento interno do remote.

---

# 11. Estrutura recomendada dentro de `ts-module-management`

Adaptar à estrutura já existente. Não reorganizar Produzíveis apenas para acomodar Catálogo.

Estrutura conceitual:

```text
src/
├── ManagementPage.vue
├── config/
│   └── managementPages.ts
│
├── types/
│   ├── management.ts
│   ├── producible.ts
│   └── catalog.ts
│
├── pages/
│   ├── Producible...
│   ├── CatalogPage.vue
│   ├── OfferFormPage.vue
│   └── OfferDetailPage.vue
│
├── components/
│   ├── producibles/
│   └── catalog/
│       ├── CatalogNavigation.vue        # somente se necessário
│       ├── OfferList.vue                # se extração melhorar legibilidade
│       ├── OfferComponentsEditor.vue
│       ├── ChoiceGroupsEditor.vue
│       ├── AllowedAddonsEditor.vue
│       ├── ComponentTypesPanel.vue
│       └── AddonsPanel.vue
│
├── mocks/
│   ├── producibles...
│   └── catalog.ts
│
└── style.css
```

Os nomes acima são sugestões arquiteturais, não obrigação literal.

Não criar componentes de um único campo ou wrappers sem responsabilidade clara.

---

# 12. Modelo de apresentação

Os tipos desta fase representam necessidades da UI e **não são DTOs finais da API**.

## 12.1. Tipo de componente

Modelo sugerido:

```ts
export interface ComponentType {
  id: string
  name: string
  description?: string
  active: boolean
}
```

Campos adicionais só devem ser criados quando houver necessidade visual concreta suportada pelo domínio.

---

# 12.2. Adicional

Modelo sugerido:

```ts
export interface CatalogAddon {
  id: string
  name: string
  price: number
  producibleItemId?: string
  operationalQuantity?: number
  operationalUnit?: string
  active: boolean
}
```

Na apresentação, o nome do Produzível pode ser resolvido pelo catálogo interno de Produzíveis do mesmo remote.

Evitar guardar uma cópia duplicada e independente da lista inteira de Produzíveis dentro do mock de Catálogo.

---

# 12.3. Componente incluído da oferta

Modelo sugerido:

```ts
export interface OfferComponent {
  id: string
  componentTypeId: string
  quantity: number
}
```

O nome do tipo deve ser resolvido pelo cadastro de Tipos de Componente.

---

# 12.4. Opção de grupo

Modelo sugerido:

```ts
export interface OfferChoiceOption {
  id: string
  componentTypeId: string
  surcharge: number
}
```

O `surcharge` pode ser zero.

---

# 12.5. Grupo de escolha

Modelo sugerido:

```ts
export interface OfferChoiceGroup {
  id: string
  name: string
  minSelections: number
  maxSelections: number
  options: OfferChoiceOption[]
}
```

---

# 12.6. Oferta

Modelo sugerido:

```ts
export interface Offer {
  id: string
  name: string
  description?: string
  basePrice: number
  active: boolean
  requiresMenuChoice: boolean
  components: OfferComponent[]
  choiceGroups: OfferChoiceGroup[]
  allowedAddonIds: string[]
}
```

`requiresMenuChoice` deve ser usado apenas se a arquitetura/código atual precisar dessa informação para representar o conceito já documentado.

Não criar regras de Cardápio dentro desse campo.

---

# 13. Reutilização de Produzíveis dentro do mesmo remote

Como Catálogo e Produzíveis vivem no mesmo `ts-module-management`, Catálogo pode e deve reutilizar a camada local já existente para consultar Produzíveis.

Exemplo conceitual:

```text
Catálogo / Adicional
        ↓
seleciona Item Produzível
        ↓
consulta fonte local de Produzíveis
```

Evitar:

```text
mocks/catalog.ts
└── copia manual de todos os produzíveis
```

Preferir uma função/repository local já existente, por exemplo conceitual:

```ts
getProducibleItems()
getProducibleItemById(id)
```

Não criar camada artificial se Produzíveis hoje possui uma forma mais simples e adequada.

A prioridade é **uma única fonte local por conceito dentro do mesmo remote**.

---

# 14. Massa de mocks

Criar uma massa pequena, porém suficiente para exercitar todos os estados da UI.

## 14.1. Tipos de componente

Incluir exemplos como:

```text
Prato do dia
Salada P
Salada G
Fruta
Proteína
```

Adicionar pelo menos um registro inativo para validar estado visual.

## 14.2. Adicionais

Exemplos coerentes com o domínio:

```text
Proteína extra
Feijão extra
Molho extra
```

Variar:

- preço;
- Produzível associado ou ausência quando permitido;
- quantidade operacional;
- unidade;
- ativo/inativo.

## 14.3. Ofertas

Criar exemplos que cubram cenários diferentes:

```text
Prato do dia
Prato + Salada P
Prato + Fruta
Prato + Salada P + Fruta
Prato + Salada ou Fruta
Salada G
Salada P + Proteína
```

A massa deve possuir pelo menos:

- oferta simples;
- oferta com vários componentes;
- oferta com grupo de escolha;
- opção com acréscimo;
- oferta que permite adicionais;
- oferta inativa.

Não criar dezenas de registros apenas para preencher tela.

---

# 15. Persistência demonstrativa

Seguir o padrão já consolidado em Produzíveis e Clientes.

Se o `ts-module-management` já possui utilitário ou mecanismo local de persistência, reutilizá-lo.

Possível separação conceitual:

```text
management:catalog:offers:v1
management:catalog:component-types:v1
management:catalog:addons:v1
```

Mas **não introduzir novas chaves arbitrariamente** se o módulo atual usa uma estratégia centralizada diferente.

Requisitos:

- leitura tolerante a JSON inválido;
- dados mock servem como baseline;
- alterações locais prevalecem conforme o padrão atual;
- IDs demonstrativos devem seguir a convenção já adotada no remote;
- não usar dados reais;
- persistência local não deve ser apresentada como fonte de verdade de produção.

---

# 16. Página `/catalogo` — visão principal

A página deve parecer continuação direta das listas existentes.

Antes de construir, comparar obrigatoriamente:

- lista de Produzíveis;
- lista de Clientes;
- lista de Pedidos;
- `PageHeader`;
- `DataTable`;
- `Tabs`;
- `Badge`;
- `Pagination`;
- padrões mobile já utilizados.

## 16.1. Cabeçalho

Usar a mesma hierarquia do workspace.

Exemplo conceitual:

```text
Catálogo
Gerencie ofertas, tipos de componente e adicionais.

[Nova oferta]
```

Não usar texto excessivamente administrativo.

## 16.2. Navegação interna

Usar `Tabs` ou padrão equivalente já existente para:

```text
Ofertas
Tipos de componente
Adicionais
```

A aba selecionada deve ser evidente sem criar uma navegação visual nova.

## 16.3. Estado da URL

Se usar query `secao`, sincronizar o estado com a URL:

```text
?secao=ofertas
?secao=tipos-componentes
?secao=adicionais
```

Valores inválidos devem cair em `ofertas`.

Não permitir query gerar navegação externa.

---

# 17. Aba Ofertas

## 17.1. Busca

Permitir busca por nome da oferta.

Usar debounce apenas se o padrão atual das listas utilizar isso.

Não criar busca avançada desnecessária.

## 17.2. Filtros

Filtros mínimos úteis:

```text
Status
├── Todas
├── Ativas
└── Inativas
```

Outros filtros só devem existir se melhorarem claramente a operação.

Não criar filtro por cada característica da Oferta nesta etapa.

## 17.3. Tabela desktop

Colunas sugeridas:

```text
Oferta
Preço base
Estrutura
Adicionais
Status
Ações
```

`Estrutura` pode resumir algo como:

```text
3 componentes
1 grupo de escolha
```

Evitar despejar toda composição comercial na tabela.

## 17.4. Mobile

Seguir exatamente a estratégia usada nas listas existentes:

- se tabela vira cards/linhas compactas, repetir;
- manter ação principal acessível;
- não criar scroll horizontal desnecessário se o padrão atual evita isso;
- preservar informação essencial.

## 17.5. Estados

Implementar de forma coerente com as outras listas:

```text
loading
error
empty geral
empty por filtro/busca
success
```

---

# 18. Nova Oferta / Editar Oferta

Usar uma página dedicada, porque Oferta possui configuração suficiente para justificar um formulário completo.

Antes de implementar, comparar:

- formulário de Produzível;
- formulário de Cliente;
- criação/edição de Pedido;
- `SectionCard`;
- feedback de alterações não salvas já existente.

A tela deve ser organizada em seções claras.

Sugestão:

```text
Dados comerciais
↓
Componentes incluídos
↓
Grupos de escolha
↓
Adicionais permitidos
↓
Resumo / ações
```

---

# 19. Seção Dados comerciais

Campos mínimos:

```text
Nome
Descrição opcional
Preço base
Status ativo/inativo
Exige escolha de opção de cardápio, se aplicável ao modelo atual
```

## 19.1. Preço

Usar o componente/padrão monetário já utilizado no workspace.

Não implementar parser financeiro novo se já existir convenção.

O preço demonstrativo deve:

- aceitar zero quando isso fizer sentido para o mock;
- não aceitar valor negativo;
- ser formatado em reais na apresentação.

## 19.2. Ativo/inativo

Preferir estado explícito e reversível.

Não implementar exclusão destrutiva como fluxo principal.

---

# 20. Seção Componentes incluídos

A UI deve permitir montar a estrutura base da Oferta.

Exemplo:

```text
[Prato do dia]  quantidade [1]
[Salada P]      quantidade [1]
[Fruta]         quantidade [1]
```

## 20.1. Seleção

O seletor deve usar Tipos de Componente ativos.

Não selecionar Item Produzível aqui.

## 20.2. Quantidade

Quantidade deve ser separada do tipo.

Validar valor positivo.

## 20.3. Duplicidade

Evitar duas linhas independentes do mesmo Tipo de Componente quando a mesma intenção pode ser representada por quantidade.

Exemplo indesejado:

```text
Salada P x1
Salada P x1
```

Preferir:

```text
Salada P x2
```

## 20.4. Remoção

Permitir remover uma linha antes de salvar.

A ação deve seguir o mesmo padrão visual de ações secundárias/destrutivas do workspace.

---

# 21. Seção Grupos de escolha

A interface precisa representar grupos de forma compreensível sem virar um “rule builder” genérico.

Cada grupo contém:

```text
Nome
Quantidade mínima
Quantidade máxima
Opções
```

Exemplo visual conceitual:

```text
Acompanhamento
Escolha 1 opção

Salada P        + R$ 0,00
Fruta           + R$ 0,00
Salada G        + R$ 4,00
```

## 21.1. Criação de grupo

Permitir adicionar novo grupo.

Usar card/bloco coerente com o restante do formulário.

## 21.2. Mínimo e máximo

Validar:

```text
min >= 0
max >= 1
min <= max
max <= quantidade de opções disponíveis no grupo
```

Se o grupo representar escolha obrigatória simples:

```text
min = 1
max = 1
```

## 21.3. Opções

Cada opção deve selecionar um Tipo de Componente permitido.

Não permitir a mesma opção repetida dentro do mesmo grupo.

## 21.4. Acréscimo

Cada opção pode possuir acréscimo financeiro >= 0.

Zero deve ser permitido.

## 21.5. Sem motor genérico de regras

Não implementar:

- expressões booleanas;
- condições aninhadas;
- dependências entre grupos;
- scripts;
- fórmulas configuráveis.

A arquitetura explicitamente não pede um motor genérico de regras na V1.

---

# 22. Seção Adicionais permitidos

A Oferta deve escolher quais adicionais cadastrados podem ser comprados junto dela.

Usar `MultiSelect`, `Checkbox` ou padrão equivalente da biblioteca conforme melhor se encaixar no número de registros e no padrão atual.

Exemplo:

```text
Adicionais permitidos
☑ Proteína extra
☐ Feijão extra
☑ Molho extra
```

Mostrar preço como informação secundária quando isso ajudar a seleção.

Não editar o adicional dentro do formulário da Oferta.

Se o adicional não existe, o operador deve cadastrá-lo na aba Adicionais.

Evitar dois fluxos concorrentes de edição do mesmo conceito.

---

# 23. Validações da Oferta

A validação deve proteger consistência da configuração sem inventar regras de domínio inexistentes.

Obrigatório validar:

- nome preenchido;
- preço base não negativo;
- quantidades de componentes positivas;
- ausência de componente duplicado quando representável por quantidade;
- nome de grupo preenchido;
- mínimo/máximo coerentes;
- pelo menos uma opção em grupo criado;
- opções únicas dentro do grupo;
- acréscimos não negativos;
- adicionais permitidos sem IDs duplicados.

**Não obrigar uma Oferta a possuir um número mínimo de componentes se isso não estiver definido no domínio ou no padrão atual.**

Se uma regra não está documentada, não inventá-la silenciosamente.

---

# 24. Detalhe da Oferta

Criar página de leitura consistente com detalhes de Cliente, Pedido e Produzível.

Exibir:

```text
Nome
Status
Preço base
Descrição
Componentes incluídos
Grupos de escolha
Acréscimos
Adicionais permitidos
```

Ações principais:

```text
Editar
```

Ativar/inativar pode ficar na edição, evitando excesso de ações no detalhe.

## 24.1. Componentes

Apresentar de forma compacta:

```text
1 x Prato do dia
1 x Salada P
```

## 24.2. Grupos

Apresentar nome, regra de seleção e opções.

Exemplo:

```text
Acompanhamento
Escolha exatamente 1

Salada P
Fruta
Salada G + R$ 4,00
```

## 24.3. Adicionais

Mostrar apenas adicionais permitidos e seu preço.

Não mostrar todos os adicionais cadastrados.

---

# 25. Tipos de componente

Tipos de Componente devem ser simples.

Campos:

```text
Nome
Descrição opcional
Ativo/inativo
```

## 25.1. Lista

Mostrar:

```text
Nome
Descrição
Status
Ações
```

Se a massa for pequena, não adicionar paginação sem necessidade.

## 25.2. Criar/Editar

Preferir interação compacta e consistente com o design system.

Se o workspace já usa Drawer para cadastros auxiliares, reutilizar.

Se não usa, escolher a alternativa existente mais próxima.

## 25.3. Inativação

Não excluir fisicamente como fluxo principal.

Tipos inativos:

- continuam visíveis no cadastro quando o filtro permitir;
- não devem aparecer como nova opção padrão em novas configurações;
- se já estiverem referenciados por uma Oferta mockada, devem continuar resolvendo corretamente para exibição histórica/demonstrativa.

---

# 26. Adicionais

Campos:

```text
Nome
Preço
Item Produzível correspondente (opcional quando o domínio permitir)
Quantidade operacional
Unidade de medida
Ativo/inativo
```

## 26.1. Seleção de Produzível

Usar a fonte de Produzíveis existente no mesmo remote.

Preferir `Combobox` se a lista justificar busca.

Mostrar apenas dados necessários para reconhecer o Produzível.

Não permitir editar Produzível por dentro do Adicional.

## 26.2. Quantidade e unidade

Manter conceitos separados.

Exemplo:

```text
Quantidade: 120
Unidade: g
```

Não armazenar como:

```text
"120g"
```

## 26.3. Unidade

Usar a mesma lista/convenção já definida em Produzíveis, se existir.

Não criar um segundo conjunto de unidades divergente dentro do mesmo remote.

## 26.4. Lista

Colunas sugeridas:

```text
Adicional
Preço
Produzível
Quantidade operacional
Status
Ações
```

## 26.5. Compatibilidade

Não configurar compatibilidade com ofertas dentro do cadastro de Adicional.

A responsabilidade deve permanecer na Oferta:

```text
Oferta
→ define quais adicionais são permitidos
```

Isso evita edição bidirecional do mesmo relacionamento.

---

# 27. Regras para dados inativos

O frontend deve lidar de forma previsível com referências para registros inativos.

Exemplo:

```text
Oferta antiga/configurada
→ usa Tipo de Componente que hoje está inativo
```

A tela de detalhe ainda precisa mostrar o nome corretamente.

Na edição:

- o registro inativo já selecionado pode ser exibido com indicação de inativo;
- não deve desaparecer e corromper a configuração;
- não deve ser oferecido como escolha nova por padrão.

Aplicar o mesmo princípio a Adicionais e Produzíveis referenciados.

Esse comportamento é importante para preparar a UI para histórico confiável sem implementar backend agora.

---

# 28. Estado, loading e simulação assíncrona

Seguir o comportamento atual do workspace.

Se as outras features simulam chamadas com `setTimeout`, Catálogo pode usar a mesma estratégia moderadamente para:

- carregar lista;
- carregar detalhe;
- salvar;
- atualizar auxiliares.

Não espalhar timers desnecessários em cada componente.

Quando APIs reais entrarem, essa camada deverá ser substituível.

Estados mínimos:

```text
idle
loading
success
error
```

Evitar feedback otimista que diga “salvo” antes da persistência demonstrativa realmente ter sido atualizada.

---

# 29. Regra visual obrigatória

Catálogo **não pode parecer uma aplicação nova**.

Antes de implementar cada elemento, localizar uma referência equivalente no workspace.

Tabela de referência:

| Necessidade | Referência prioritária |
|---|---|
| Page header | Produzíveis / Clientes / Pedidos |
| Lista e tabela | Produzíveis / Clientes / Pedidos |
| Busca e filtro | Clientes / Pedidos |
| Formulário em seções | Produzíveis / Clientes / Novo Pedido |
| Detalhe | Produzível / Cliente / Pedido |
| Badge de status | componentes compartilhados já usados |
| Tabs | `ts-components` e telas existentes |
| Drawer | telas existentes + story do componente |
| Diálogo destrutivo | `AlertDialog` já existente |
| Select/Combobox | formulários atuais |
| Empty state | listas existentes |
| Feedback loading/error | módulos existentes |
| Mobile | comportamento das telas equivalentes |

## 29.1. Proibido

Não:

- introduzir nova paleta;
- inventar novos shadows;
- usar radius diferente sem razão;
- aumentar densidade ou espaçamento de forma incompatível;
- importar Lucide diretamente;
- construir controles HTML customizados quando `ts-components` já possui equivalente;
- criar cards decorativos sem necessidade operacional;
- usar gradients ou estética de dashboard genérico;
- criar sidebar interna paralela ao shell.

## 29.2. Critério visual

Ao navegar entre:

```text
Clientes
Produzíveis
Catálogo
Pedidos
```

o usuário deve perceber **a mesma aplicação**, e não quatro produtos diferentes.

---

# 30. Responsividade

Testar no mínimo:

- mobile estreito;
- tablet;
- desktop padrão;
- desktop largo.

Validar especialmente:

- tabelas;
- editor de componentes da Oferta;
- grupos de escolha;
- seletores de adicionais;
- formulário de Adicional;
- drawers/modais;
- ações do cabeçalho;
- textos longos de ofertas e tipos.

Em mobile:

- ações críticas não podem desaparecer;
- campos devem empilhar de forma previsível;
- grupos de escolha não devem exigir scroll horizontal para edição;
- preço e status devem permanecer legíveis;
- usar o mesmo breakpoint e padrão das telas existentes.

---

# 31. Acessibilidade

Garantir:

- labels associados a campos;
- erros relacionados ao campo correto;
- botões apenas com ícone com nome acessível;
- foco previsível em Drawer/Dialog;
- operação por teclado;
- status não indicado apenas por cor;
- indicação textual de ativo/inativo;
- ordem de leitura coerente;
- foco visível;
- contraste coerente com o design system;
- `aria` apenas quando necessário e correto.

Se um componente do `ts-components` já resolve foco/teclado, não reimplementar manualmente.

---

# 32. Navegação sem reload desnecessário

A arquitetura técnica atual registra como dívida o uso frequente de `window.location.assign`.

Ao implementar Catálogo:

- verificar como Clientes e Produzíveis evoluíram a navegação;
- reutilizar a solução mais recente e correta do workspace;
- evitar introduzir novos reloads completos se já existir um contrato/navegação SPA apropriado;
- não instalar Vue Router dentro do remote apenas para resolver isso.

Se ainda não houver solução compartilhada, preservar o padrão atual em vez de criar uma arquitetura paralela somente para Catálogo.

---

# 33. Não duplicar responsabilidade entre Catálogo e Produzíveis

Catálogo pode consultar Produzíveis, mas não deve absorver sua edição.

Correto:

```text
Adicional
→ selecionar Item Produzível existente
```

Incorreto:

```text
Adicional
→ editar composição do Item Produzível
```

Correto:

```text
Oferta
→ selecionar Tipo de Componente
```

Incorreto:

```text
Oferta
→ editar composição do prato
```

---

# 34. Não antecipar Cardápios

Não implementar nesta entrega:

- calendário semanal;
- cardápio diário;
- rascunho/publicado;
- disponibilidade diária;
- disponível/esgotado/suspenso por data;
- Tradicional/Low Carb/Vegetariano como resolução diária;
- preço efetivo por dia;
- ordenação de ofertas no cardápio.

Esses conceitos entram na próxima camada, depois das dependências de Gestão.

---

# 35. Não antecipar Planos e Créditos

Oferta poderá futuramente participar de benefícios de Plano, mas não implementar agora:

- compatibilidade de plano;
- consumo de crédito;
- quantidade de créditos;
- FIFO;
- extrato;
- aquisição de plano;
- upgrades pagos por crédito.

Catálogo deve apenas fornecer a identidade/configuração comercial necessária para que outra área possa referenciá-la futuramente.

---

# 36. Não antecipar backend

É proibido nesta etapa criar:

```text
/api/catalog
CatalogApiClient
OfferDto definitivo
CreateOfferRequest definitivo
Repository HTTP fictício
Axios instance
fetch(...)
```

Os tipos atuais são de apresentação.

A futura API .NET será desenhada a partir das invariantes de domínio, não a partir de conveniência dos mocks Vue.

---

# 37. Refatorações permitidas

O Codex pode fazer pequenas refatorações dentro de `ts-module-management` quando forem necessárias para evitar duplicação real entre Produzíveis e Catálogo.

Exemplos aceitáveis:

- compartilhar formatter de moeda dentro do remote;
- compartilhar lista de unidades se Produzíveis já a possui;
- extrair acesso local a Produzíveis para uma função reutilizável;
- compartilhar utilitário de retorno seguro;
- ajustar tipos de `ManagementSection`.

Não usar Catálogo como justificativa para reescrever Produzíveis ou reorganizar o remote inteiro.

Refatoração deve ser mínima e comprovadamente útil.

---

# 38. Build e validação obrigatórios

Ao terminar, executar no mínimo:

## `ts-module-management`

```bash
npm run build
```

Se existir script separado:

```bash
npm run typecheck
```

## `ts-host`

```bash
npm run build
```

## Demais módulos

Se houver alteração em contrato compartilhado ou componente da biblioteca, validar consumidores afetados.

Como regra, Catálogo não deve exigir mudança em `ts-components` nesta primeira implementação, exceto se for identificada uma lacuna genérica real.

---

# 39. Validação integrada obrigatória

Executar host e remotes necessários conforme scripts reais do workspace.

Validar:

```text
/produziveis                         → continua funcionando
/clientes                            → continua funcionando
/operacoes/pedidos                   → continua funcionando
/catalogo                            → funciona
/catalogo/novo                       → funciona
/catalogo/:id                        → funciona
/catalogo/:id/editar                 → funciona
```

Validar também as visões auxiliares de Tipos de Componente e Adicionais conforme estratégia de URL escolhida.

---

# 40. Cenários funcionais de aceite

## 40.1. Oferta simples

Criar:

```text
Prato do dia
Preço: R$ 28,00
Componente:
1 x Prato do dia
```

Salvar, abrir detalhe e editar.

## 40.2. Oferta composta

Criar:

```text
Prato + Salada P + Fruta

Componentes:
1 x Prato do dia
1 x Salada P
1 x Fruta
```

Validar resumo e detalhe.

## 40.3. Grupo de escolha

Criar:

```text
Prato + Salada ou Fruta

Componente:
1 x Prato do dia

Grupo:
Acompanhamento
min 1
max 1

Opções:
Salada P + R$ 0,00
Fruta + R$ 0,00
```

Salvar e reabrir.

## 40.4. Opção com acréscimo

Adicionar opção:

```text
Salada G + R$ 4,00
```

Validar apresentação monetária.

## 40.5. Adicional

Cadastrar:

```text
Proteína extra
Preço: R$ 8,00
Produzível: Frango grelhado
Quantidade operacional: 120
Unidade: g
```

Depois habilitá-lo em uma Oferta.

## 40.6. Inativo

Inativar um Tipo de Componente ou Adicional já referenciado.

Confirmar que:

- detalhe continua resolvendo o nome;
- edição não perde a referência;
- novas seleções não o oferecem como opção ativa normal.

---

# 41. Cenários de erro de aceite

Validar:

- nome de Oferta vazio;
- preço negativo;
- quantidade de componente zero;
- componente duplicado;
- grupo sem nome;
- grupo sem opções;
- `min > max`;
- `max > quantidade de opções`;
- opção duplicada no grupo;
- acréscimo negativo;
- Adicional com preço negativo;
- quantidade operacional inválida;
- ID inexistente na rota de Oferta;
- `secao` inválida na URL;
- falha simulada de carregamento;
- storage inválido quando a implementação usa `localStorage`.

A UI deve falhar de forma controlada, seguindo os feedbacks do sistema atual.

---

# 42. Checklist técnico final

## Arquitetura

- [x] Catálogo foi implementado dentro de `ts-module-management`.
- [x] Nenhum novo remote foi criado.
- [x] `ts-host` continua dono das rotas públicas.
- [x] `ManagementPage` continua sendo fachada federada pequena.
- [x] Nenhum Vue Router foi instalado no remote.
- [x] Nenhum import de código-fonte de outro repositório foi criado.
- [x] Produzíveis foi reutilizado internamente sem duplicação desnecessária.

## Domínio

- [x] Oferta está separada de Item Produzível.
- [x] Tipo de Componente é configurável.
- [x] Oferta possui componentes estruturados.
- [x] Grupos possuem min/max/opções.
- [x] Opções podem possuir acréscimo.
- [x] Adicional é distinto de componente e grupo.
- [x] Adicional pode referenciar Produzível.
- [x] quantidade operacional e unidade estão separadas.
- [x] compatibilidade de adicionais pertence à Oferta.
- [x] nenhuma regra de Cardápio foi antecipada.

## Ofertas

- [x] lista funciona;
- [x] busca funciona;
- [x] status funciona;
- [x] loading/error/empty existem;
- [x] nova Oferta funciona;
- [x] detalhe funciona;
- [x] edição funciona;
- [x] componentes podem ser adicionados/removidos;
- [x] grupos podem ser adicionados/removidos;
- [x] opções podem ser configuradas;
- [x] acréscimo pode ser configurado;
- [x] adicionais permitidos podem ser selecionados;
- [x] alterações não salvas seguem padrão atual quando aplicável.

## Tipos de componente

- [x] listar;
- [x] criar;
- [x] editar;
- [x] ativar/inativar;
- [x] registros inativos referenciados continuam legíveis.

## Adicionais

- [x] listar;
- [x] criar;
- [x] editar;
- [x] ativar/inativar;
- [x] preço;
- [x] seleção de Produzível;
- [x] quantidade operacional;
- [x] unidade;
- [x] sem edição de Produzível dentro do fluxo.

## Visual

- [x] mesma tipografia;
- [x] mesma densidade;
- [x] mesmos espaçamentos;
- [x] mesmas bordas/radius;
- [x] mesmos componentes compartilhados;
- [x] mesma linguagem de badges;
- [x] mesma responsividade;
- [x] sem design system paralelo;
- [x] sem import direto de Lucide.

## Qualidade

- [x] TypeScript strict sem erros;
- [x] build de management passa;
- [x] build do host passa;
- [x] Produzíveis não regrediu;
- [x] Clientes não regrediu;
- [x] Operações não regrediu;
- [x] acessibilidade básica validada;
- [x] nenhum backend fictício foi introduzido.

---

# 43. Ordem recomendada de implementação

Para reduzir risco, executar nesta ordem:

```text
1. Auditoria do workspace atual
2. Evolução do contrato ManagementPage
3. Rotas + sidebar + breadcrumbs no host
4. Tipos de apresentação de Catálogo
5. Fonte local / mocks
6. Reuso da fonte de Produzíveis
7. Tipos de Componente
8. Adicionais
9. Lista de Ofertas
10. Formulário básico de Oferta
11. Componentes incluídos
12. Grupos de escolha
13. Adicionais permitidos
14. Detalhe da Oferta
15. Persistência demonstrativa
16. Estados loading/error/empty
17. Responsividade
18. Acessibilidade
19. Build
20. Regressão integrada
```

Fazer auxiliares antes do formulário completo de Oferta facilita testar seletores com dados reais do próprio mock do módulo.

---

# 44. Ordem sugerida de commits

## Entrega 1 — Estrutura e host

```text
feat(management): add catalog section and routes
```

Inclui:

- tipos de navegação;
- `ManagementPage`;
- host;
- sidebar;
- breadcrumbs;
- página inicial vazia/estrutural apenas quando necessária para conexão.

## Entrega 2 — Modelo e auxiliares

```text
feat(management): add catalog component types and addons
```

Inclui:

- tipos;
- mocks;
- Tipos de Componente;
- Adicionais;
- integração com Produzíveis.

## Entrega 3 — Ofertas base

```text
feat(management): add offers list and basic form
```

## Entrega 4 — Estrutura comercial da Oferta

```text
feat(management): add offer components and choice groups
```

## Entrega 5 — Compatibilidade de adicionais

```text
feat(management): add offer addon compatibility
```

## Entrega 6 — Detalhe e refinamento

```text
feat(management): complete catalog detail and ux states
```

## Entrega 7 — Qualidade

```text
refactor(management): align catalog ux with workspace patterns
```

Inclui:

- responsividade;
- a11y;
- feedbacks;
- revisão visual;
- regressões.

Não fazer commits artificiais se o fluxo de trabalho atual do repositório usa outra convenção.

---

# 45. PROMPT MASTER — pronto para colar no Codex

Copie integralmente o texto abaixo para o Codex quando quiser executar a implementação completa.

```text
Você está trabalhando no workspace Sabor Santè.

OBJETIVO
Implemente a funcionalidade completa de CATÁLOGO dentro do remote existente `ts-module-management`. Produzíveis já está implementado nesse mesmo remote. Não crie um novo módulo nem reinicialize `ts-module-management`.

ANTES DE ALTERAR CÓDIGO
Leia obrigatoriamente:
1. `ESTUDO DE CASO.md`, com foco em Catálogo comercial, Oferta, componentes da oferta, Tipos de Componente, Grupos de Escolha, acréscimos em escolhas, Adicionais, compatibilidade de Adicionais, Item Produzível e separação entre comercial e produção.
2. `ARQUITETURA FRONTEND.md`, com foco em Module Federation, responsabilidades do host/remotes, ts-components, linguagem visual, acessibilidade, mocks, persistência, build e regras de contribuição.
3. Todo o código atual relevante de `ts-module-management`, principalmente Produzíveis.
4. `ts-module-commercial`, principalmente Clientes.
5. `ts-module-operation`, principalmente lista, criação/edição e detalhe de Pedidos.
6. `ts-host`, principalmente router, sidebar, breadcrumbs e configuração dos remotes.
7. API pública e stories relevantes de `ts-components`.

REGRA DE PRECEDÊNCIA
Domínio documentado > arquitetura técnica documentada > padrão atual do código > conveniência da nova implementação.

NÃO PEÇA CONFIRMAÇÃO PARA DECISÕES QUE PODEM SER RESOLVIDAS INSPECIONANDO O WORKSPACE. Faça a melhor implementação coerente com os padrões existentes e documente ao final decisões relevantes.

ARQUITETURA
- Catálogo pertence ao remote `ts-module-management`.
- Não criar `ts-module-catalog`.
- Não instalar Vue Router no remote.
- O `ts-host` continua dono das URLs públicas, sidebar e breadcrumbs.
- Evolua a fachada federada `ManagementPage` existente para suportar `section = catalogo` e páginas de Oferta, seguindo a convenção real já usada em Produzíveis.
- Não criar uma segunda exposição federada só para Catálogo.
- Não importar código-fonte de repositórios irmãos.
- Pode reutilizar internamente código/fonte de Produzíveis porque está no mesmo `ts-module-management`, desde que a responsabilidade permaneça correta.
- `ts-components` continua sendo a fonte visual de verdade.

DOMÍNIO OBRIGATÓRIO
Preserve estas separações:
Oferta = o que é vendido.
Item Produzível = o que é produzido.
Composição = como é produzido.
Catálogo não edita composição de Produzível.

Implemente:
1. Tipos de Componente configuráveis.
2. Ofertas.
3. Componentes incluídos em Ofertas, referenciando Tipos de Componente e quantidade.
4. Grupos de Escolha com nome, mínimo, máximo e opções.
5. Opções de grupo referenciando Tipo de Componente e acréscimo financeiro >= 0.
6. Adicionais com nome, preço, Item Produzível correspondente quando aplicável, quantidade operacional, unidade e ativo/inativo.
7. Compatibilidade de Adicionais definida pela Oferta.

NÃO IMPLEMENTE CARDÁPIOS AGORA.
Não resolver Tipo de Componente para prato concreto do dia. Não implementar planejamento semanal, cardápio diário, Rascunho/Publicado, Disponível/Esgotada/Suspensa, categorias Tradicional/Low Carb/Vegetariano ou preço diário.

NÃO IMPLEMENTE PLANOS/CRÉDITOS AGORA.
Não criar compatibilidade de plano, consumo, FIFO ou extrato.

ROTAS
O host deve suportar no mínimo:
- `/catalogo`
- `/catalogo/novo`
- `/catalogo/:id`
- `/catalogo/:id/editar`

A área `/catalogo` deve possuir três visões internas:
- Ofertas
- Tipos de componente
- Adicionais

Para as visões auxiliares, use query string validada (`?secao=...`) ou subrotas estáticas somente conforme o padrão mais coerente já existente no workspace. Escolha uma única estratégia. Se usar subrotas, não deixe `/catalogo/:id` capturar caminhos estáticos.

SIDEBAR / BREADCRUMBS
Ative o item Catálogo que já pertence à seção Gestão sem alterar o design da sidebar.
Breadcrumbs devem continuar sendo responsabilidade do host e seguir o padrão atual.

OFERTAS — LISTA
Crie lista visualmente derivada das listas de Produzíveis, Clientes e Pedidos.
- busca por nome;
- filtro de status Todas/Ativas/Inativas;
- ordenação/paginação apenas seguindo o padrão existente e quando fizer sentido;
- loading;
- error;
- empty geral;
- empty por busca/filtro;
- comportamento mobile equivalente às outras listas.

Sugestão de colunas desktop:
Oferta | Preço base | Estrutura | Adicionais | Status | Ações.
Não despeje toda a configuração na tabela.

OFERTA — NOVO/EDITAR
Use página dedicada e a mesma linguagem visual dos formulários existentes.
Organize em:
1. Dados comerciais.
2. Componentes incluídos.
3. Grupos de escolha.
4. Adicionais permitidos.
5. Ações/resumo conforme padrão atual.

Dados comerciais:
- nome;
- descrição opcional;
- preço base;
- ativo/inativo;
- informação de necessidade de escolha de cardápio apenas se necessária para representar o conceito já documentado, sem implementar Cardápios.

Componentes incluídos:
- selecionar Tipo de Componente ativo;
- quantidade positiva;
- evitar duplicidade do mesmo tipo quando quantidade resolve o caso;
- permitir adicionar/remover linhas.

Grupos de escolha:
- nome;
- minSelections;
- maxSelections;
- opções;
- cada opção seleciona Tipo de Componente;
- sem opção duplicada no mesmo grupo;
- acréscimo >= 0;
- validar min >= 0, max >= 1, min <= max e max <= número de opções.
- não criar motor genérico de regras.

Adicionais permitidos:
- selecionar entre Adicionais ativos;
- usar MultiSelect/Checkbox ou componente compartilhado mais adequado;
- mostrar preço como informação secundária quando útil;
- não editar o Adicional dentro da Oferta.

OFERTA — DETALHE
Exibir:
- nome;
- status;
- preço base;
- descrição;
- componentes incluídos;
- grupos e regra de seleção;
- opções e acréscimos;
- adicionais permitidos;
- ação Editar seguindo o padrão atual.

TIPOS DE COMPONENTE
Implementar cadastro auxiliar simples:
- nome;
- descrição opcional;
- ativo/inativo;
- lista compacta;
- criar/editar com Drawer ou padrão equivalente já consolidado no workspace;
- sem exclusão destrutiva como fluxo principal.
Tipos inativos já referenciados por uma Oferta devem continuar legíveis e não desaparecer da configuração existente.

ADICIONAIS
Implementar cadastro auxiliar:
- nome;
- preço;
- Item Produzível correspondente quando aplicável;
- quantidade operacional;
- unidade;
- ativo/inativo.

Reutilize a fonte de Produzíveis existente no MESMO remote. Não crie uma segunda massa independente de Produzíveis dentro do mock do Catálogo. Se Produzíveis já possui lista de unidades ou utilitário de acesso, reutilize.

Quantidade e unidade são conceitos separados. Não armazene `120g` como uma única string se o modelo atual suporta quantidade + unidade.

A compatibilidade Adicional x Oferta deve ser editada na Oferta, não nos dois lados.

MOCKS / PERSISTÊNCIA
- Modele somente tipos de apresentação, não DTOs definitivos de backend.
- Crie massa pequena e suficiente para exercitar todos os estados.
- Inclua ofertas simples, compostas, com grupo de escolha, com acréscimo, com adicionais e inativa.
- Inclua Tipos de Componente Prato do dia, Salada P, Salada G, Fruta e Proteína como exemplos configuráveis.
- Inclua Adicionais como Proteína extra, Feijão extra e Molho extra.
- Siga o mecanismo de mocks/localStorage já adotado no `ts-module-management`; não invente uma segunda arquitetura de persistência.
- Dados inválidos no storage devem ser tratados sem quebrar a aplicação.

VALIDAÇÕES
Implemente no mínimo:
- nome da Oferta obrigatório;
- preço >= 0;
- quantidade de componente > 0;
- sem duplicidade de componente quando quantidade resolve;
- nome de grupo obrigatório;
- grupo com pelo menos uma opção;
- min/max coerentes;
- opções únicas no grupo;
- acréscimo >= 0;
- Adicional com preço >= 0;
- quantidade operacional coerente quando preenchida.
Não invente uma regra não documentada dizendo que toda Oferta deve possuir obrigatoriamente X componentes.

REGISTROS INATIVOS
Quando Tipo de Componente, Adicional ou Produzível já referenciado estiver inativo:
- continuar resolvendo nome no detalhe;
- continuar aparecendo na configuração existente com indicação de inativo;
- não oferecer como nova seleção ativa por padrão.

VISUAL — REGRA RÍGIDA
Catálogo deve parecer parte da MESMA aplicação.
Antes de criar qualquer componente ou estilo, localize a referência equivalente em Produzíveis, Clientes, Pedidos ou `ts-components`.
Preserve:
- PageHeader;
- tipografia;
- densidade;
- espaçamentos;
- alturas de controles;
- cores semânticas;
- bordas/radius;
- feedbacks;
- tabelas;
- badges;
- estados de loading/error/empty;
- breakpoints;
- comportamento mobile;
- foco e acessibilidade.

Não:
- importe Lucide diretamente;
- crie design system local;
- crie novos Buttons/Inputs/Selects quando já existem no pacote;
- crie paleta, shadow ou radius próprios;
- crie dashboard decorativo;
- crie sidebar interna.

RESPONSIVIDADE
Valide mobile, tablet e desktop. Em particular, o editor de Componentes e Grupos de Escolha deve continuar utilizável em largura pequena, sem depender de tabela horizontal impossível de operar.

ACESSIBILIDADE
- labels corretos;
- erros associados aos campos;
- teclado;
- foco previsível;
- botões de ícone com nome acessível;
- status não comunicado somente por cor;
- foco visível.

NAVEGAÇÃO
Não introduza novos `window.location.assign` se Clientes/Produzíveis já possuem uma solução de navegação SPA melhor. Não instale router no remote para isso. Reutilize a solução mais nova e coerente do workspace.

FORA DO ESCOPO
Não implementar:
- backend;
- fetch;
- Axios;
- Pinia se não existe como padrão;
- API fictícia;
- contratos HTTP definitivos;
- Cardápios;
- Planos;
- Financeiro;
- Produção;
- estoque;
- promoções complexas;
- variantes avançadas;
- motor genérico de regras;
- exclusão física complexa;
- novo design system.

VALIDAÇÃO FINAL
Execute typecheck/build de `ts-module-management` conforme scripts existentes e `npm run build` do `ts-host`.
Faça regressão integrada de:
- Produzíveis;
- Clientes;
- Pedidos/Operações;
- Catálogo.

Valide no mínimo estes cenários:
1. criar Oferta simples;
2. criar Oferta com múltiplos componentes;
3. criar Oferta com grupo Salada OU Fruta;
4. criar opção com acréscimo;
5. cadastrar Adicional ligado a Produzível;
6. permitir Adicional em Oferta;
7. editar Oferta e reabrir detalhe;
8. inativar registro auxiliar referenciado sem perder exibição;
9. estados loading/error/empty;
10. mobile e desktop.

Ao final, entregue um resumo objetivo contendo:
- arquivos criados/alterados;
- decisões relevantes;
- comandos de validação executados;
- resultado dos builds;
- qualquer limitação que permaneceu por estar fora de escopo.
```

---

# 46. Prompt alternativo 1 — somente estrutura + host

Usar se for preferível dividir a implementação em patches menores:

```text
Leia `ESTUDO DE CASO.md`, `ARQUITETURA FRONTEND.md`, o código atual de `ts-module-management`, `ts-host`, `ts-module-commercial`, `ts-module-operation` e a API de `ts-components`.

Evolua o remote `ts-module-management`, que já possui Produzíveis, para reconhecer a seção `catalogo`. Não implemente ainda as telas completas.

Atualize a fachada `ManagementPage` e os tipos/config necessários seguindo exatamente a convenção atual de Produzíveis. Integre Catálogo ao `ts-host`, ativando o item Catálogo da seção Gestão e criando as rotas `/catalogo`, `/catalogo/novo`, `/catalogo/:id` e `/catalogo/:id/editar`.

O host deve continuar dono das URLs e breadcrumbs. Não instale Vue Router no remote. Não crie outro remote. Não mude o visual da sidebar. Não introduza backend ou novas bibliotecas.

Crie apenas a estrutura mínima necessária para que todas as rotas carreguem o remote sem erro, preservando Produzíveis.

Ao final execute build de management e host e corrija os erros encontrados.
```

---

# 47. Prompt alternativo 2 — Tipos de Componente + Adicionais

```text
Implemente dentro da seção Catálogo de `ts-module-management` os dois cadastros auxiliares: Tipos de Componente e Adicionais.

Antes de codificar, releia as seções correspondentes de `ESTUDO DE CASO.md`, compare visualmente Produzíveis e Clientes e consulte `ts-components`.

Tipos de Componente:
- nome;
- descrição opcional;
- ativo/inativo;
- lista compacta;
- criar/editar usando Drawer ou padrão equivalente existente;
- sem exclusão física como fluxo principal.

Adicionais:
- nome;
- preço;
- Item Produzível correspondente quando aplicável;
- quantidade operacional;
- unidade;
- ativo/inativo.

Reutilize a fonte local de Produzíveis já existente no mesmo remote; não duplique a massa de Produzíveis. Reutilize também a convenção de unidades de Produzíveis, se existir.

Implemente mocks/persistência seguindo o mecanismo atual do módulo. Garanta que registros inativos já referenciados continuem resolvendo corretamente.

Visualmente siga rigidamente o sistema atual, sem novos componentes genéricos ou imports diretos de Lucide.

Ao final execute typecheck/build do módulo.
```

---

# 48. Prompt alternativo 3 — Ofertas

```text
Implemente Ofertas na seção Catálogo de `ts-module-management` usando os Tipos de Componente e Adicionais já existentes.

Crie:
- lista de Ofertas;
- nova Oferta;
- detalhe;
- edição.

Oferta deve possuir:
- nome;
- descrição opcional;
- preço base;
- ativo/inativo;
- componentes incluídos com Tipo de Componente + quantidade;
- grupos de escolha com nome, min, max e opções;
- opção de grupo com Tipo de Componente + acréscimo;
- adicionais permitidos.

Preserve rigorosamente:
Oferta != Item Produzível != Composição.
Não selecione Produzível como componente da Oferta; componentes usam Tipos de Componente. Não implemente Cardápio.

Valide duplicidades, min/max, preços e quantidades conforme o guia do projeto. Não crie motor genérico de regras.

Use a mesma linguagem visual das listas/formulários/detalhes de Produzíveis, Clientes e Pedidos, usando `ts-components`.

Implemente loading/error/empty, responsividade, acessibilidade e retorno de lista quando aplicável.

Ao final execute build de management e host e faça regressão de Produzíveis.
```

---

# 49. Prompt alternativo 4 — revisão final

```text
Faça uma revisão técnica, visual e funcional completa da implementação de Catálogo no workspace Sabor Santè.

Compare Catálogo lado a lado com Produzíveis, Clientes e Pedidos.

Corrija qualquer divergência injustificada em:
- PageHeader;
- tipografia;
- densidade;
- espaçamento;
- controle de tamanho;
- bordas/radius;
- badges;
- loading/error/empty;
- tabelas;
- formulários;
- drawers;
- responsividade;
- acessibilidade;
- navegação.

Revise também as invariantes conceituais:
- Oferta != Item Produzível;
- componentes usam Tipos de Componente;
- grupos possuem min/max/opções;
- opção pode ter acréscimo;
- Adicional é separado de componente e escolha;
- compatibilidade de Adicional pertence à Oferta;
- quantidade operacional e unidade são separadas;
- nenhum conceito de Cardápio foi antecipado.

Verifique que não há imports de código-fonte entre repositórios irmãos, imports diretos de Lucide, API fictícia, fetch/Axios ou design system paralelo.

Execute os builds disponíveis de `ts-module-management` e `ts-host` e corrija todos os erros. Faça regressão navegável de Produzíveis, Clientes, Pedidos e Catálogo.

Ao final informe objetivamente o que foi revisado, o que foi corrigido e o resultado dos comandos executados.
```

---

# 50. Evolução após Catálogo

Catálogo foi concluído e a primeira entrega de Cardápios também foi implementada. O roadmap atualizado está na seção 0; a sequência abaixo registra o estado consolidado:

```text
Clientes             ✅
Produzíveis           ✅
Catálogo              ✅
Cardápios diários     ✅
Integração operacional✅
Entregadores          ← próximo desenvolvimento recomendado
Usuários              pendente
Planos e Créditos
Financeiro
Produção
Embalagem
Entregas
Atendimento
Hoje / consolidação
```

Entregadores deve vir antes de Entregas porque é uma dependência logística simples e estruturante. O planejamento semanal de Cardápios permanece separado do cardápio diário, que já representa a verdade operacional do dia.

---

# 51. Regra final

A implementação de Catálogo será considerada correta quando conseguir representar a estrutura comercial necessária para o negócio sem misturar venda com produção e sem antecipar Cardápios.

A regra arquitetural central permanece:

```text
Oferta
→ o que o cliente compra

Item Produzível
→ o que a operação produz

Composição
→ como o item é produzido

Cardápio futuro
→ resolve a oferta para a realidade daquele dia
```

E tecnicamente:

```text
host simples
+
remote de Gestão coeso
+
design system compartilhado
+
mocks substituíveis
+
fronteiras claras
+
mesma linguagem visual
```

Não otimizar para uma arquitetura futura hipotética. Implementar o mínimo coerente que preserve as regras reais e facilite a próxima evolução.
