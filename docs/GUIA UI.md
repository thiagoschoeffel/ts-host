# Guia de Implementação de UI — Sabor Santè

> **Status:** guia canônico de UI/UX do frontend.
>
> **Escopo:** padrões permanentes de apresentação, interação, responsividade e acessibilidade para todas as telas do sistema.
>
> **Stack de referência:** Vue 3 + TypeScript + Vite + Module Federation + Tailwind CSS + `@thiagoschoeffel/ts-components`.
>
> Regras de negócio pertencem ao `ESTUDO DE CASO.md`. Fronteiras técnicas, Module Federation, rotas, contratos, build e validação pertencem ao `ARQUITETURA FRONTEND.md`.

---

# 1. Regra de precedência

Toda implementação frontend deve seguir esta ordem:

```text
ESTUDO DE CASO.md
→ regra de domínio

ARQUITETURA FRONTEND.md
→ fronteiras e contratos técnicos

GUIA UI.md
→ padrão visual e comportamento de interface

código atual
→ referência concreta de implementação
```

Não alterar uma regra de negócio para simplificar a UI.

Não criar uma nova linguagem visual apenas porque uma funcionalidade nova possui domínio diferente.

---

# 2. Fontes visuais canônicas

Para novas páginas, usar como referências prioritárias:

```text
Pedidos
→ macrodiagramação de lista, formulário e detalhe

Clientes
→ adaptação validada para cadastros

Produzíveis
→ cadastros de Gestão e conteúdo estruturado

Catálogo
→ tabs, cadastros auxiliares e estrutura comercial
```

As referências concretas atuais são:

```text
ts-module-operation/src/pages/OrderListPage.vue
ts-module-operation/src/pages/OrderDetailPage.vue
ts-module-operation/src/pages/NewOrderPage.vue

ts-module-commercial/src/pages/CustomerListPage.vue
ts-module-commercial/src/pages/CustomerDetailPage.vue
ts-module-commercial/src/pages/CustomerFormPage.vue
```

Os nomes de arquivos são referências atuais, não contratos permanentes.

A regra permanente é a coerência visual entre áreas.

---

# 3. Design system

`@thiagoschoeffel/ts-components` é a fonte visual compartilhada.

Antes de criar um controle local, verificar se a biblioteca já possui equivalente.

Componentes compartilhados existentes incluem, entre outros:

```text
Alert
AlertDialog
Avatar
Badge
Button
Card
Checkbox
Chips
Combobox
DataTable
DatePicker
DateRangePicker
Drawer
DropdownMenu
EmptyState
Input
MultiSelect
PageHeader
Pagination
Popover
Progress
RadioGroup
ScrollArea
SectionCard
Select
Tabs
Textarea
```

Não:

- recriar `Button`, `Input`, `Select`, `Drawer`, `Card` ou tabela genérica localmente;
- importar Lucide diretamente nos consumidores;
- criar um design system paralelo em um remote;
- importar caminhos internos de `ts-components/src`.

Componentes específicos do negócio permanecem no módulo de negócio.

---

# 4. Linguagem visual

A interface deve continuar compacta, operacional e consistente.

Características principais:

- fundo estrutural slate claro;
- superfícies de conteúdo brancas;
- bordas slate discretas;
- cantos predominantemente `rounded-lg`;
- sombras pequenas;
- tipografia Inter;
- alta densidade sem perda de legibilidade;
- hierarquia por peso, contraste e espaçamento;
- feedback semântico por cor e texto;
- comportamento responsivo desde telas pequenas.

Não introduzir:

- gradientes decorativos;
- cards sem função operacional;
- paleta própria por módulo;
- novos radius ou sombras sem motivo;
- estética de dashboard genérico;
- sidebar interna paralela ao shell.

O usuário deve perceber:

```text
Pedidos
Clientes
Catálogo
Produzíveis
Cardápios
Financeiro
Congelados
```

como partes da mesma aplicação.

---

# 5. Tamanhos de controles

Quando o componente suportar tamanhos compartilhados:

```text
small
medium
large
```

preservar o contrato do design system.

Controles combinados devem possuir alturas compatíveis.

Não corrigir desalinhamento com `height` arbitrário se a biblioteca já possui tamanho equivalente.

---

# 6. Estrutura geral de página

## 6.1. Cabeçalho

O padrão geral é:

```text
PageHeader                         Ação principal
Título                             ou
Subtítulo                          Voltar para {entidade}
```

A listagem principal não exibe ação de voltar.

Páginas internas podem exibir:

```text
Voltar para clientes
Voltar para pedidos
Voltar para catálogo
```

quando isso melhora a navegação.

A ação principal fica à direita em desktop e permanece acessível no mobile.

---

## 6.2. Espaçamento

Como referência atual:

```text
cabeçalho → conteúdo
mt-6

blocos relacionados
gap-4 / space-y-4

colunas principais
gap-6
```

Esses valores são padrões do workspace, não licença para duplicar classes em componentes compartilhados.

Se um componente do design system já resolve seu espaçamento interno, não sobrescrever sem necessidade.

---

## 6.3. Responsividade do cabeçalho

Em telas menores:

- empilhar título e ação quando necessário;
- preservar prioridade da ação;
- evitar truncar títulos importantes;
- não esconder ações críticas sem alternativa acessível.

---

# 7. Listagens

## 7.1. Estrutura

Listagens administrativas e operacionais devem, quando aplicável, seguir:

```text
PageHeader
↓
Card de busca/filtros
↓
Card de dados
   ├── loading / error / empty / lista
   └── paginação
```

Não criar um card adicional apenas para decorar a página.

---

## 7.2. Altura útil em desktop

Listagens que se beneficiam de ocupar o palco devem usar o padrão consolidado:

```text
md:h-[calc(100dvh-11rem)]
md:min-h-0
```

O contêiner da página pode usar layout flex e o `main` deve crescer.

A `DataTable` deve ocupar o espaço restante do card.

Evitar repetir cálculos diferentes de viewport em componentes internos.

---

## 7.3. Busca e filtros

O card superior concentra:

- busca;
- filtros;
- ações de limpar filtro quando necessárias.

Não repetir a quantidade total de registros se a paginação já comunica o total.

Contagens em Tabs só devem existir quando ajudam a diferenciar estados ou listas.

---

## 7.4. Tabs

Tabs que representam subseções ficam acima do cabeçalho específico da subseção.

A opção ativa usa a variante visual consolidada.

Exemplo:

```text
Catálogo
[Ofertas] [Tipos de componente] [Adicionais]

Catálogo → Ofertas
Gerencie...
```

Título, subtítulo e ação podem mudar com a subseção.

Não criar uma segunda navegação lateral dentro da página.

---

## 7.5. Ordenação

Colunas cujo valor possui ordenação operacionalmente útil devem permitir ordenação.

Exemplos úteis:

```text
nome
data
valor
status
quantidade
vencimento
```

Não adicionar ordenação apenas por uniformidade em colunas como:

```text
ações
resumo textual
estrutura complexa
observações
```

Toda listagem deve possuir ordenação inicial previsível.

---

## 7.6. Estado compartilhável

Quando busca, tab, filtros, ordenação ou página definem um contexto que o usuário espera recuperar, esse estado deve ser refletido na URL conforme o contrato técnico do workspace.

A experiência esperada é:

```text
filtrar lista
→ abrir detalhe
→ voltar
→ recuperar o mesmo contexto
```

O mecanismo técnico pertence ao `ARQUITETURA FRONTEND.md`.

---

## 7.7. Paginação

A paginação deve:

- ficar no rodapé da área de dados;
- comunicar total quando aplicável;
- manter contexto de busca/filtros;
- não ser duplicada com outro contador sem função adicional.

---

# 8. Estados de página

Toda experiência de dados relevante deve considerar:

```text
loading
success
empty
sem resultados
erro recuperável
```

---

## 8.1. Loading

Loading deve:

- indicar que o sistema está trabalhando;
- evitar saltos desnecessários de layout;
- não sugerir sucesso antes de resposta;
- manter ações mutáveis protegidas contra clique duplicado.

---

## 8.2. Empty geral

Quando não há nenhuma entidade:

```text
Nenhum cliente cadastrado.
Nenhum produto do catálogo habilitado para congelamento.
Nenhuma oferta cadastrada.
```

Pode oferecer a ação principal da página.

---

## 8.3. Sem resultados

Quando existem dados, mas busca/filtros não encontram resultado:

```text
Nenhum resultado para os filtros selecionados.
```

A ação prioritária deve ser:

```text
Limpar filtros
```

e não criar uma nova entidade sem contexto.

---

## 8.4. Erro

Erro recuperável deve:

- explicar que a operação falhou;
- não fingir estado vazio;
- oferecer `Tentar novamente` quando fizer sentido.

---

## 8.5. EmptyState dentro de detalhes

Em páginas de visualização de dados, `EmptyState` interno normalmente não possui CTA.

A ação de edição permanece no cabeçalho.

Exemplo:

```text
Cliente sem endereços
→ informa ausência

[Editar cliente]
→ continua no PageHeader
```

Essa regra não se aplica:

- à listagem inteira vazia;
- a erro de página inteira;
- a fluxos em que o EmptyState é o ponto natural para iniciar uma ação.

---

# 9. Cenários previsíveis para revisão visual

Páginas importantes devem ser exercitáveis em cenários determinísticos:

```text
padrão
sem dados
sem resultados
erro
loading quando necessário
```

O protótipo pode expor esses cenários por query string ou mecanismo equivalente.

A convenção técnica pertence ao `ARQUITETURA FRONTEND.md`.

O objetivo de UI é permitir revisar cada estado sem depender de manipulação manual complexa.

---

# 10. Mobile em listagens

Mantenha equivalência funcional.

Se uma tabela desktop virar cards:

- preservar os mesmos dados essenciais;
- preservar ações;
- preservar status;
- preservar navegação;
- preservar filtros.

Evitar scroll horizontal como única forma de operação quando uma representação compacta for possível.

---

# 11. Formulários

## 11.1. Estrutura principal

Formulários extensos usam, quando apropriado:

```text
conteúdo principal        resumo lateral
```

Referência atual:

```text
lg:grid-cols-[minmax(0,1fr)_20rem]
```

O resumo pode usar:

```text
sticky top-20
```

quando isso melhora a revisão.

Não usar resumo lateral vazio apenas para seguir o padrão.

---

## 11.2. Seções

Dividir formulários por responsabilidades compreensíveis.

Exemplo:

```text
Dados principais
Endereços
Preferências
Itens
Financeiro
Resumo
```

Usar `SectionCard` ou padrão equivalente quando a divisão for estrutural.

Não fragmentar cada dois campos em um card separado.

---

# 12. Controles por tipo de dado

## 12.1. Valores controlados

Quando o valor pertence a um conjunto estruturado, usar controle adequado:

```text
Select
MultiSelect
RadioGroup
Combobox
Checkbox
```

Escolher conforme:

- cardinalidade;
- número de opções;
- necessidade de busca;
- seleção única ou múltipla.

Não transformar em texto livre um valor cuja identidade precisa permanecer estruturada.

---

## 12.2. Combobox

Preferir `Combobox` quando:

- há muitas opções;
- reconhecimento por busca reduz esforço;
- a lista pode crescer.

Exemplos:

```text
Cliente
Produzível
Oferta
```

---

## 12.3. Valores repetíveis removíveis

Quando o padrão é uma coleção simples de valores removíveis, usar `Chips` quando aplicável.

Não usar Chips para estruturas que possuem vários campos internos.

---

## 12.4. Monetários

Campos monetários devem usar a convenção compartilhada.

Quando apropriado:

```text
Input
└── slot leading → R$
```

Não criar parser/estilo monetário diferente por módulo.

Acréscimo positivo pode utilizar semântica visual positiva, sem depender apenas da cor.

---

## 12.5. Quantidades

Quantidade deve ser numérica.

Não adicionar “x” ao valor quando o cabeçalho ou contexto já deixa explícito que é quantidade.

Quantidade e unidade permanecem separadas quando o domínio exige.

---

# 13. Drawers e fluxos auxiliares

## 13.1. Quando usar Drawer

Cadastros auxiliares e edições de baixa/média complexidade devem preferencialmente usar Drawer quando isso evita navegação desnecessária.

Exemplos:

```text
endereço
tipo de componente
adicional
ajuste auxiliar
```

Fluxos extensos continuam merecendo página dedicada.

---

## 13.2. Tamanho

`Drawer size="large"` é a referência atual quando o conteúdo exige espaço equivalente aos cadastros consolidados.

Não usar `large` automaticamente para qualquer drawer.

---

## 13.3. Estrutura

Drawer auxiliar deve possuir:

```text
Título
Descrição
Campos
Rodapé
├── Cancelar à esquerda
└── Confirmar à direita
```

---

## 13.4. Subfluxos

Quando um cadastro auxiliar possui uma etapa interna, manter o fluxo dentro do mesmo Drawer quando isso preservar contexto.

Exemplo:

```text
Grupo de escolha
→ adicionar opção
→ voltar ao grupo
```

A etapa interna deve possuir:

- título claro;
- navegação de volta;
- validação local;
- ações próprias.

---

# 14. Cards e conteúdo estruturado

Listagens dentro ou fora de Drawers devem usar `Card` branco do design system.

Não usar `div` com fundo cinza para imitar Card.

Em detalhes, conjuntos estruturados podem usar:

```text
desktop → cabeçalho + linhas
mobile → representação compacta equivalente
```

Exemplos:

```text
componentes de oferta
adicionais permitidos
opções de grupo
movimentos de estoque
pagamentos alocados
```

---

# 15. Detalhes

Páginas de detalhe devem seguir a hierarquia de Pedidos:

```text
PageHeader + ações
↓
cards de informação
↓
histórico / estruturas relacionadas
```

Manter:

- títulos coerentes;
- alinhamentos consistentes;
- gaps previsíveis;
- leitura rápida.

No mobile:

- empilhar cards;
- não esconder ação principal;
- manter valores críticos legíveis.

---

# 16. Ações

## 16.1. Ação principal

A ação principal da listagem normalmente aparece no PageHeader.

Exemplo:

```text
[Novo cliente]
[Nova oferta]
[Nova entrada]
```

O ícone `+` fica reservado prioritariamente à criação principal.

---

## 16.2. Ações secundárias

Ações secundárias como:

```text
Adicionar endereço
Adicionar componente
Adicionar opção
```

preferem texto sem ícone `+`, salvo necessidade visual comprovada.

Isso diferencia a criação principal do fluxo das inclusões locais.

---

# 17. Ações destrutivas

## 17.1. Remoção local e reversível

Remover um item ainda não persistido de um formulário pode usar confirmação inline no próprio card:

```text
Remover?
[Cancelar] [Sim]
```

Botões devem descrever a ação.

Não usar apenas “x”.

---

## 17.2. Ação persistida com efeito de negócio

Ações com consequência real devem usar confirmação proporcional ao risco.

Exemplos:

```text
cancelar pedido
descartar congelados
estornar pagamento
cancelar rota
```

Usar `AlertDialog` ou fluxo explícito quando a decisão produz efeito persistente relevante.

Não aplicar a regra de confirmação inline indiscriminadamente.

---

# 18. Alertas

Usar `Alert` com ícone e semântica consistente.

```text
info
→ contexto, snapshot, explicação

warning
→ atenção operacional

danger
→ falha, bloqueio ou risco destrutivo
```

O texto deve explicar o que o operador precisa entender ou fazer.

Não usar cor como única mensagem.

---

# 19. Badges

Badge comunica estado ou contexto de forma compacta.

Semântica geral:

```text
neutral
→ informação sem julgamento, contagem, estado auxiliar

info
→ contexto ou informação complementar

success
→ estado positivo ou concluído

warning
→ atenção

danger
→ erro, bloqueio, risco ou estado crítico
```

A feature decide o significado concreto.

Não assumir que todo “inativo” precisa obrigatoriamente de `danger` se o estado for apenas neutro/administrativo.

Em resumos, `medium` é a referência atual quando precisa de maior destaque.

---

# 20. Observações formatadas

Quando a feature suporta conteúdo formatado:

- usar `Textarea rich-text` do padrão atual;
- preservar consistência de edição e leitura.

A sanitização do HTML é requisito técnico e de segurança documentado no `ARQUITETURA FRONTEND.md`.

---

# 21. Navegação e retorno

Quando o usuário entra em:

```text
lista
→ detalhe / edição
→ voltar
```

a experiência deve preservar, quando relevante:

- busca;
- tab;
- filtros;
- ordenação;
- página.

O usuário não deve perder o contexto da lista por abrir um registro.

A implementação segura do parâmetro `retorno` e a propriedade das rotas pertencem ao `ARQUITETURA FRONTEND.md`.

---

# 22. Responsividade

Testar no mínimo:

```text
mobile estreito
tablet
desktop padrão
desktop largo
```

Validar especialmente:

- cabeçalhos;
- filtros;
- tabelas;
- drawers;
- formulários em grid;
- resumo lateral;
- ações;
- textos longos;
- históricos;
- impressão/preview de etiquetas.

Em mobile:

- empilhar campos de forma previsível;
- manter ações críticas acessíveis;
- evitar controles pequenos demais;
- evitar informação dependente de hover.

---

# 23. Acessibilidade

Toda nova experiência deve garantir:

- operação por teclado;
- foco visível;
- foco previsível ao abrir/fechar overlays;
- labels associados aos campos;
- erros ligados aos campos;
- botões só com ícone com nome acessível;
- ordem de leitura coerente;
- contraste adequado;
- status não comunicado apenas por cor;
- conteúdo responsivo sem perda de ação.

Se `ts-components` já resolve foco/teclado, não reimplementar manualmente.

---

# 24. Estados de foco

Não remover `focus-visible` globalmente.

O shell atual possui indicador de foco para links e botões.

Componentes locais também devem preservar foco visível.

Não substituir foco por hover.

---

# 25. Padrões específicos de Congelados

Congelados pertencem visualmente à mesma aplicação.

A experiência planejada deve usar:

```text
Gestão > Congelados
```

com visões como:

```text
Estoque
Produtos habilitados
Vencimentos
```

Não criar um “ERP de estoque”.

## 25.1. Origem obrigatória no Catálogo

A área de Congelados **não cadastra produtos comerciais novos**.

Toda configuração de congelado deve partir de:

```text
Oferta existente no Catálogo
+
Item Produzível existente
```

A ação deve ser apresentada como:

```text
[Habilitar produto do catálogo]
```

e não como:

```text
[Novo congelado]
```

A configuração adiciona somente dados próprios do congelamento/estoque, como apresentação e vínculo operacional.

Não permitir editar em Congelados:

- nome comercial;
- preço;
- composição;
- adicionais;
- grupos de escolha.

Esses dados devem ser alterados em Catálogo ou Produzíveis.

Quando a relação entre a Oferta e o Item Produzível puder ser resolvida de forma inequívoca pelo sistema, não pedir ao operador para selecionar novamente o que o sistema já sabe.

Se houver mais de uma apresentação congelada válida para o mesmo produto, exibir configurações distintas sem duplicar a identidade comercial.

---

# 26. Listagem de estoque de congelados

Estrutura sugerida:

```text
PageHeader                         [Nova entrada]

Tabs
[Estoque] [Produtos habilitados] [Vencimentos]

Card de busca/filtros

Card de dados
Produto | Apresentação | Disponível | Lotes | Próximo vencimento | Status
```

No mobile, preservar:

- nome;
- apresentação;
- quantidade;
- vencimento;
- status;
- ação de abrir.

---

# 27. Entrada de congelados

Formulário mínimo:

```text
Produto do catálogo habilitado
Apresentação, quando houver mais de uma
Data de fabricação
Quantidade produzida
Validade calculada
```

O seletor deve listar somente configurações de congelado já vinculadas a produtos existentes no Catálogo e a Itens Produzíveis existentes.

Não permitir criar um produto novo a partir desta tela.

Não pedir ao operador para digitar informação que o sistema consegue derivar.

A validade deve vir do domínio como a data de fabricação acrescida de 90 dias corridos. A tela apenas apresenta o resultado e não permite editar a data calculada.

---

# 28. Lote de congelados

Detalhe do lote deve apresentar:

```text
Produto do catálogo
Apresentação
Fabricação
Validade
Quantidade produzida
Quantidade disponível
Status
Responsável
Movimentações
```

Ações possíveis:

```text
Reimprimir etiquetas
Ajustar estoque
Registrar descarte
```

Não oferecer edição direta de saldo.

---

# 29. Vencimentos

A tela deve ajudar a conferência periódica sem criar workflow burocrático.

Priorizar:

- ordenação por validade;
- vencidos;
- lotes mais próximos do vencimento;
- abertura do lote;
- descarte/ajuste.

Não exigir “abrir inventário” ou “encerrar conferência”.

Listas de lotes elegíveis seguem FEFO por padrão. A interface pode explicar qual lote será consumido, mas não deve implementar nem contornar a seleção autoritativa da API.

---

# 30. Etiqueta do produto congelado

Formato físico inicial:

```text
100 mm × 50 mm
```

Conteúdo confirmado:

```text
NOME DO PRODUTO (proveniente do Catálogo)
APRESENTAÇÃO

Fabricação: dd/mm/aaaa
Validade:   dd/mm/aaaa

[logo]
```

O preview não possui campo local para renomear o produto. Nome e identidade comercial vêm do Catálogo.

A hierarquia visual prioriza:

1. nome;
2. apresentação;
3. datas;
4. marca.

O preview deve ser proporcional a 2:1, alto contraste e preto e branco.

Não criar designer genérico de etiquetas.

---

# 31. Quantidade de etiquetas do lote

Depois de registrar a entrada:

```text
Entrada registrada: 12 unidades
[Imprimir 12 etiquetas]
```

A quantidade padrão de cópias pode seguir a quantidade produzida.

Alterar o número de cópias não altera estoque.

---

# 32. Estados de impressão

A experiência de impressão deve representar:

```text
idle
preparing
printing
success
error
```

Durante impressão:

- impedir clique duplicado;
- comunicar progresso.

Em erro:

```text
Não foi possível imprimir as etiquetas.
[Tentar novamente]
```

Não marcar estoque ou pedido como alterado por falha da impressora.

---

# 33. Etiqueta externa de entrega

A etiqueta externa pertence à Embalagem.

Formato inicial:

```text
100 mm × 50 mm
```

Conteúdo prioritário:

```text
NOME DO CLIENTE
Pedido #123
Endereço
Telefone
Resumo curto quando couber
[logo]
```

Quando não couber tudo, preservar:

1. identificação do cliente;
2. endereço;
3. Pedido;
4. telefone.

Não reduzir a fonte até ficar ilegível apenas para manter um resumo completo.

---

# 34. Embalagem

A UX de Embalagem deve ser simples:

```text
Pedido
├── cliente
├── janela
├── itens
├── personalizações
├── restrições
├── congelados
└── observações

[Imprimir etiqueta de entrega]
[Embalado]
```

A conferência é visual.

Não exigir checklist item a item como regra de negócio.

Não criar status “Etiqueta impressa”.

Reimpressão não altera status.

---

# 35. Pedido sem entrega

Quando o Pedido for retirada/balcão, a etiqueta externa pode ser dispensada.

Não imprimir automaticamente.

A impressão é contextual.

---

# 36. Custos de impressão

Como a etiqueta possui custo operacional:

- não imprimir automaticamente na confirmação do Pedido;
- não imprimir automaticamente lote sem ação do operador;
- permitir impressão em lote quando há ganho operacional;
- reimpressão deve ser explícita.

---

# 37. Revisão visual antes de concluir uma mudança

Para mudanças visuais:

- conferir desktop;
- conferir mobile;
- conferir loading;
- conferir empty;
- conferir erro;
- conferir foco;
- conferir navegação por teclado;
- conferir alternância entre módulos quando a alteração envolve componente compartilhado.

Comandos de build e validação técnica ficam no `ARQUITETURA FRONTEND.md`.

---

# 38. Regra final

Toda nova página deve responder positivamente:

```text
Parece parte do mesmo sistema?
O operador entende a ação principal rapidamente?
O formulário pede apenas o necessário?
A lista preserva contexto?
O mobile mantém as mesmas capacidades?
Erros e estados vazios são claros?
O foco é visível?
A UI protege a regra de domínio sem criar burocracia?
```

> A interface deve ser previsível o suficiente para reduzir treinamento e simples o suficiente para não virar uma etapa adicional do trabalho.
