# Arquitetura de Domínio — Sabor Santè

> Documento arquitetural independente de linguagem de programação, framework, banco de dados, impressora ou infraestrutura específica.
>
> Objetivo: registrar a visão de negócio, limites de domínio, responsabilidades, fluxos, invariantes e decisões arquiteturais que devem orientar qualquer implementação futura do sistema da Sabor Santè.
>
> Esta versão incorpora a nova realidade operacional de **refeições congeladas mantidas em estoque** e a necessidade de **impressão de etiquetas de produto e de entrega**.

---

# 1. Objetivo do sistema

O sistema da Sabor Santè deve apoiar uma operação pequena, familiar, dinâmica e com dois ciclos operacionais distintos:

1. a **operação diária de refeições**, orientada ao cardápio e aos pedidos do dia;
2. a **operação de congelados**, produzida separadamente, armazenada em estoque e vendida posteriormente.

A arquitetura deve priorizar:

- redução de trabalho manual;
- mínimo de burocracia operacional;
- rastreabilidade suficiente para decisões críticas;
- histórico confiável;
- flexibilidade para evolução do negócio;
- automação assistiva, sem retirar o controle humano;
- experiência simples para operadores, cozinha, embalagem e entrega;
- preservação das regras reais do negócio;
- independência de canal de entrada;
- separação clara entre o que é vendido, o que é produzido, o que é estocado, o que é cobrado e o que é entregue;
- impressão rápida e confiável de etiquetas sem duplicar digitação;
- controle de validade e estoque apenas onde isso representa uma necessidade real do negócio.

O sistema não deve ser concebido como um ERP genérico. Deve ser um sistema operacional especializado na realidade da Sabor Santè.

---

# 2. Princípios arquiteturais

## 2.1. O negócio é a fonte de verdade

O sistema deve representar a operação real da Sabor Santè.

Sistemas anteriores, planilhas, mensagens, etiquetas existentes, cardápios antigos e cadastros existentes servem como referência histórica, mas não como fonte definitiva da modelagem.

Quando houver conflito entre estrutura antiga, conveniência técnica e operação real, deve prevalecer a operação real, preservando boas práticas de engenharia.

## 2.2. A arquitetura deve reduzir burocracia

A Sabor Santè é uma empresa pequena e familiar.

O sistema deve evitar:

- fluxos administrativos longos;
- checklists desnecessários;
- confirmações repetitivas;
- preenchimento obrigatório sem valor operacional;
- cadastros excessivamente genéricos;
- etapas criadas apenas por purismo arquitetural;
- reentrada de dados que o sistema já conhece;
- impressão automática de etiquetas que não serão utilizadas.

Regra:

> automatizar ou simplificar sempre que isso não comprometer consistência, segurança, validade, estoque ou rastreabilidade.

## 2.3. Existem dois ciclos operacionais

A operação principal continua sendo orientada ao **dia operacional**, mas congelados possuem um ciclo próprio.

### Operação diária

```text
Dia Operacional
├── cardápio
├── pedidos recebidos
├── pedidos confirmados
├── capacidade restante
├── necessidade de produção
├── pedidos em embalagem
├── pedidos prontos
├── rotas
└── entregas
```

### Operação de congelados

```text
Congelados
├── produto/oferta já existente no Catálogo
├── configuração de congelado
├── produção do lote
├── data de fabricação
├── validade
├── quantidade produzida
├── etiquetas do produto
├── estoque disponível
├── vendas
├── saídas
├── ajustes
├── vencimentos
└── conferência periódica
```

Esses ciclos podem se encontrar no Pedido, mas não devem ser artificialmente misturados.

A produção diária reage aos pedidos do dia.

A produção de congelados ocorre separadamente e gera estoque.

## 2.4. Histórico não pode depender de cadastro mutável

Sempre que um dado possa mudar no futuro, mas o passado precise permanecer verdadeiro, o sistema deve preservar o valor efetivamente usado.

Exemplos:

- endereço de entrega;
- telefone de contato usado no pedido;
- preço de oferta;
- preço de adicional;
- composição de preparação;
- condições da aquisição de plano;
- taxa de entrega;
- desconto aplicado;
- entregador efetivo;
- opção escolhida do cardápio;
- Configuração de Congelado efetivamente escolhida e seu preço;
- lote de congelado utilizado;
- data de fabricação;
- data de validade;
- apresentação do produto;
- conteúdo necessário para reimpressão de etiqueta histórica.

A alteração de um cadastro atual nunca deve reescrever silenciosamente o passado.

## 2.5. Preferência é diferente de fato histórico

Cadastros podem conter defaults e preferências.

Transações devem guardar o que realmente aconteceu.

Exemplos:

```text
Cliente → entregador preferencial
Pedido → entregador efetivamente atribuído
```

```text
Cliente → condição de pagamento preferencial
Pedido/Cobrança → condição efetivamente aplicada
```

```text
Cliente → preferência alimentar
Pedido → personalização efetivamente aplicada
```

```text
Item Produzível → configuração de congelado atual
Lote → fabricação, validade e apresentação efetivamente usadas
```

## 2.6. Impressão não é regra de domínio

A impressão de uma etiqueta é consequência operacional de informações já consolidadas.

Falha de impressão, reimpressão ou troca de impressora não deve:

- alterar estoque;
- alterar Pedido;
- alterar lote;
- alterar data de validade;
- alterar status operacional.

A etiqueta representa dados do domínio; ela não é a fonte desses dados.

---

# 3. Visão modular do domínio

A arquitetura deve ser tratada como um monólito modular ou solução equivalente, com fronteiras de domínio claras.

Principais módulos conceituais:

```text
Clientes
Catálogo
Cardápios
Pedidos
Planos e Créditos
Financeiro
Produção diária
Congelados e Estoque
Embalagem
Logística
Atendimento / WhatsApp
Usuários e Auditoria
```

A impressão de etiquetas é uma **capacidade transversal de aplicação**, utilizada principalmente por:

```text
Congelados
→ etiqueta do produto

Embalagem / Pedido
→ etiqueta individual dos itens da produção do dia
→ etiqueta externa do pacote kraft
```

Não é necessário criar um domínio isolado de “Etiquetas”.

---

# 4. Clientes

## 4.1. Cliente

O cliente representa a pessoa ou organização atendida pela Sabor Santè.

Pode possuir:

- dados cadastrais;
- múltiplos endereços;
- preferências recorrentes;
- restrições alimentares;
- entregador preferencial;
- condição/forma de pagamento preferencial;
- aquisições de planos;
- crédito financeiro;
- histórico de pedidos.

## 4.2. Endereços

Um cliente pode possuir vários endereços, como residência e trabalho.

O cadastro serve como fonte para novas escolhas.

No pedido, o endereço escolhido deve ser preservado como snapshot histórico.

```text
Cliente altera endereço amanhã
→ pedidos antigos continuam com o endereço original
```

A etiqueta de entrega deve utilizar o endereço histórico do Pedido, não o endereço atual do cadastro.

## 4.3. Telefone de contato

O telefone utilizado para contato/entrega pode mudar no futuro.

Quando for relevante para entrega, o Pedido deve preservar o contato efetivamente utilizado.

A etiqueta externa da embalagem deve refletir o contato associado ao Pedido.

## 4.4. Preferências

Preferências representam comportamentos recorrentes desejados, mas não obrigatórios.

Exemplos:

- sem arroz;
- substituir arroz por legumes;
- reduzir carboidrato.

Uma preferência pode ser pré-aplicada ao pedido, aceita, alterada ou removida pelo operador.

## 4.5. Observações livres

Observações livres devem coexistir com preferências estruturadas para situações eventuais.

O sistema não deve tentar transformar toda exceção em regra formal.

## 4.6. Restrições alimentares

Restrição alimentar é diferente de preferência.

Possui maior severidade, deve ser validada e não deve ser ignorada silenciosamente.

Exemplos de marcadores:

- lactose;
- glúten;
- amendoim;
- castanhas;
- ovo;
- soja.

O sistema deve detectar incompatibilidades entre restrições do cliente e composição efetiva do pedido.

---

# 5. Catálogo comercial

## 5.1. Oferta

`Oferta` é o principal conceito comercial e representa aquilo que o cliente compra.

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

Uma oferta possui identidade comercial, pode possuir preço base, pode ser ativa/inativa, pode exigir escolha de opção, pode ser formada por componentes e grupos de escolha e pode permitir adicionais.

Oferta não é sinônimo de:

- preparação;
- composição;
- item produzível;
- item congelado;
- lote de estoque;
- opção do cardápio.

## 5.2. Componentes da oferta

Uma oferta deve declarar estruturalmente o que inclui.

```text
Oferta: Prato + Salada P + Fruta

Componentes:
- 1 x Prato do dia
- 1 x Salada P
- 1 x Fruta
```

## 5.3. Tipos de componente

Tipos de componente representam papéis comerciais estáveis, como:

- Prato do dia;
- Salada P;
- Salada G;
- Fruta;
- Proteína.

Devem ser configuráveis e não rigidamente presos a um conjunto fixo.

## 5.4. Grupos de escolha

Algumas ofertas possuem escolhas internas.

Exemplo:

```text
Prato do dia + Salada OU Fruta
```

Isso deve ser representado como grupo de escolha, contendo:

- nome;
- quantidade mínima;
- quantidade máxima;
- opções permitidas.

## 5.5. Acréscimos em escolhas

Uma opção de grupo pode ter acréscimo financeiro.

Quando um item é quitado por crédito de plano, o crédito cobre o benefício-base e upgrades permanecem financeiros.

## 5.6. Adicionais

Adicional é algo comprado além da configuração base da oferta.

Exemplos:

- proteína extra;
- feijão extra;
- molho extra.

Adicional é diferente de:

- componente incluído;
- escolha do grupo;
- substituição;
- desconto;
- taxa.

Um adicional pode ter:

- nome;
- preço;
- item produzível correspondente;
- quantidade operacional;
- unidade de medida.

## 5.7. Compatibilidade de adicionais

Nem todo adicional deve estar disponível para toda oferta.

A oferta deve definir quais adicionais fazem sentido para ela.

## 5.8. Congelado sempre nasce de Item Produzível

Congelado não exige uma Oferta individual que repita a identidade de cada preparação.

Toda refeição congelada deve obrigatoriamente corresponder a algo que a empresa já produz:

```text
Item Produzível existente
→ preparação e composição versionada

Configuração de Congelado
→ vincula obrigatoriamente o Item Produzível
→ acrescenta apresentação, preço de venda e comportamento de estoque/validade

Lote Congelado
→ produção física concreta com fabricação, validade e quantidade

Oferta genérica de Congelados
→ organiza a venda no Pedido sem duplicar uma Oferta para cada preparação
```

A área de Congelados não pode criar um segundo nome ou uma segunda composição para o mesmo produto. O preço variável pertence à Configuração de Congelado e é congelado no Pedido quando a apresentação é escolhida.

Regra:

> se não corresponde a um Item Produzível existente, não pode ser cadastrado nem produzido como congelado.

Quando um mesmo Item Produzível possuir mais de uma apresentação congelada válida, essas apresentações possuem configurações e preços distintos sem duplicar a preparação.

Alterar ou inativar a configuração de congelado não deve apagar o histórico de lotes, pedidos ou etiquetas já gerados.

---

# 6. Item produzível e composição

## 6.1. Item produzível

Item produzível pertence ao lado operacional e representa algo que pode ser preparado, montado ou utilizado na produção.

Exemplos:

- Estrogonofe de frango com arroz e legumes;
- Frango grelhado;
- Molho da casa;
- Salada de folhas;
- Chilli sem pimenta;
- Sopa de legumes com talharim.

Nem todo item produzível precisa ser vendido isoladamente.

## 6.2. Separação entre comercial e produção

```text
Oferta → o que é vendido
ItemProduzível → o que é produzido
Composição → como é produzido
```

Para congelados:

```text
ItemProduzível existente
        ↓
ConfiguraçãoCongelado
→ habilita apresentação e preço para controle por lote/estoque e venda
        ↓
LoteCongelado
→ produção física concreta
```

`ConfiguraçãoCongelado` não duplica uma Oferta por preparação. Ela habilita estoque e preço para um Item Produzível existente; no Pedido, a Oferta genérica de Congelados organiza a venda e a configuração identifica o produto efetivamente escolhido.

## 6.3. Composição versionada

A composição de um item produzível pode mudar ao longo do tempo.

```text
ItemProduzível → identidade estável
Composição → versionada
```

Pedidos e lotes antigos devem continuar associados às condições efetivamente utilizadas quando isso for necessário para preservar histórico.

## 6.4. Composição recursiva

Uma composição pode conter:

- ingredientes;
- preparações intermediárias;
- outros itens produzíveis.

Isso permite expandir a composição para calcular necessidades agregadas.

## 6.5. Quantidades e unidades

Quantidade e unidade são conceitos separados.

A arquitetura deve suportar:

- quantidades fracionárias;
- unidades controladas.

Exemplos de apresentações de congelados observadas na operação:

```text
300 g
400 ml
```

Conversões sofisticadas não são necessárias na primeira versão.

---

# 7. Cardápio

## 7.1. Planejamento semanal

O cardápio semanal representa intenção e planejamento.

Serve para comunicação e preparação prévia, mas não é a verdade operacional final do dia.

## 7.2. Cardápio diário

O cardápio diário representa a verdade operacional daquele dia.

Pode nascer a partir do planejamento semanal, mas depois possui vida própria.

## 7.3. Estados do cardápio

Estados mínimos:

```text
Rascunho
Publicado
```

Enquanto Rascunho:

- pode ser alterado livremente;
- não deve ser usado pelo atendimento automático.

Quando Publicado:

- passa a ser o cardápio operacional.

## 7.4. Categorias/opções do cardápio

Tradicional, Low Carb e Vegetariano representam categorias/opções do cardápio, não a preparação em si.

## 7.5. Resolução de componentes no dia

Tipos comerciais estáveis devem ser resolvidos para itens concretos no cardápio do dia.

```text
Oferta → define o papel
Cardápio → define opções válidas
Pedido → registra a escolha efetiva
```

## 7.6. Ofertas no cardápio

Uma oferta pode existir globalmente, mas ser disponibilizada ou não em determinado dia.

A disponibilização deve preservar:

- oferta;
- preço efetivo do dia;
- status;
- ordem de exibição.

## 7.7. Status de disponibilidade

Estados mínimos:

```text
Disponível
Esgotada
Suspensa
```

Devem existir tanto para oferta quanto para opção específica do cardápio.

## 7.8. Controle manual-first

O operador pode alterar disponibilidade manualmente.

O sistema pode sugerir esgotamento, mas não deve tomar decisões comerciais irreversíveis sozinho na primeira versão.

## 7.9. Congelados e cardápio

Congelados não formam um catálogo paralelo de Ofertas por preparação.

Uma Oferta genérica de Congelados organiza essa modalidade no Pedido. As opções apresentadas ao cliente são Configurações de Congelado ativas com estoque elegível, cada uma com seu próprio preço.

```text
Oferta genérica de Congelados
└── Configuração de Congelado escolhida
    ├── Item Produzível e apresentação
    ├── preço vigente
    └── disponibilidade condicionada ao estoque elegível
```

O sistema não deve criar uma Oferta nova para cada Item Produzível congelado.

A arquitetura também não deve obrigar a produção de congelados a entrar no cálculo da produção diária.

---

# 8. Pedido

## 8.1. Pedido como transação central

Pedido representa o que o cliente efetivamente solicitou e deve preservar:

- cliente;
- contato relevante;
- endereço histórico;
- itens;
- escolhas;
- personalizações;
- adicionais;
- valores;
- créditos consumidos;
- janela de entrega;
- situação operacional;
- origem.

Quando houver congelados, deve também preservar a relação entre o item vendido e a saída de estoque correspondente.

## 8.2. Status do pedido

Estados definidos:

```text
Aberto
Confirmado
EmProdução
EmEmbalagem
EmEntrega
Concluído
Cancelado
FalhaNaEntrega
```

Fluxo principal:

```text
Aberto
→ Confirmado
→ EmProdução
→ EmEmbalagem
→ EmEntrega
→ Concluído
```

Itens congelados não exigem nova produção diária para serem vendidos, mas continuam fazendo parte do Pedido.

## 8.3. Pedido aberto

Enquanto Aberto:

- pode ser alterado;
- créditos não foram consumidos;
- capacidade ainda não foi definitivamente comprometida;
- estoque congelado ainda não deve ser consumido definitivamente;
- composição ainda pode mudar;
- cobrança ainda não precisa estar consolidada.

## 8.4. Confirmação

`Confirmar Pedido` é uma operação de domínio crítica, não apenas alteração de status.

Na confirmação devem ocorrer, quando aplicável:

- validar capacidade da produção diária;
- validar restrições;
- consolidar composição efetiva;
- congelar escolhas;
- validar saldo de planos;
- selecionar aquisições elegíveis;
- consumir créditos;
- consumir crédito financeiro;
- validar estoque de congelados;
- selecionar/alocar estoque elegível de congelados;
- registrar saída de estoque correspondente;
- consolidar preços;
- consolidar descontos e taxas;
- gerar obrigações financeiras;
- registrar efeitos históricos;
- alterar status para Confirmado.

A operação deve ser atômica no nível conceitual.

## 8.5. PedidoItem

`PedidoItem` representa a oferta comprada.

Quando for um item atendido por estoque congelado, o `PedidoItem` referencia a Oferta genérica de Congelados e deve haver informação suficiente para explicar:

- qual configuração de congelado foi escolhida;
- qual preço unitário dessa configuração foi congelado no Pedido;
- quantas unidades foram atendidas por estoque;
- de quais lotes vieram as unidades, quando necessário.

O Pedido não deve criar uma Oferta individual para espelhar cada Item Produzível congelado.

## 8.6. PedidoItemComponente

Representa o que efetivamente compôs aquele item no pedido.

É importante para:

- produção;
- histórico;
- personalização;
- restrições;
- embalagem.

## 8.7. Pedido com itens mistos

Um mesmo Pedido pode conter:

```text
itens da operação diária
+
itens congelados
```

O sistema deve manter as responsabilidades separadas:

```text
itens do dia
→ afetam capacidade/produção diária

itens congelados
→ afetam estoque
```

---

# 9. Personalizações

Personalização modifica a composição base.

Tipos principais:

- remoção;
- substituição;
- ajuste de quantidade.

Adicional não é personalização.

```text
Substituição → altera o que já existia
Adicional → acrescenta algo além da base
```

A composição efetiva resulta de:

```text
composição base
+
remoções
+
substituições
+
ajustes
+
escolhas
```

Para produtos congelados já produzidos e estocados, personalizações que exijam alterar a composição física não devem ser tratadas como se pudessem ser executadas depois da produção.

---

# 10. Planos

## 10.1. Plano

Plano representa uma regra comercial.

Exemplos:

- Plano Prato do Dia;
- Plano Prato + Salada ou Fruta;
- Plano Prato + Salada + Fruta;
- Plano Salada G;
- Plano Salada G + Proteína;
- Plano Salada P + Proteína.

## 10.2. Aquisição de plano

Quando o cliente compra um plano, nasce uma aquisição independente, com:

- cliente;
- plano;
- quantidade adquirida;
- valor pago;
- data da compra;
- validade opcional;
- condições históricas contratadas.

Um cliente pode possuir várias aquisições simultâneas.

## 10.3. Crédito

Cada utilização consome exatamente 1 crédito, mas o benefício coberto depende do plano.

Crédito não é universal.

## 10.4. Sugestão versus consumo

O sistema sugere uso quando houver saldo compatível.

O operador pode alterar.

Consumo real ocorre apenas na confirmação.

## 10.5. FIFO

Regra inicial:

```text
usar primeiro a aquisição elegível mais antiga
```

FEFO pode ser avaliado futuramente se validade de créditos se tornar relevante.

## 10.6. Extrato de créditos

Saldo deve ser explicado por movimentações:

- CréditoAdquirido;
- Consumo;
- Estorno;
- AjusteManual.

Cada movimentação deve possuir origem rastreável.

Saldo não deve ser alterado diretamente sem movimentação.

## 10.7. Alocação de consumo

O pedido deve registrar de quais aquisições vieram os créditos consumidos, permitindo estorno correto.

---

# 11. Crédito financeiro

Crédito financeiro é diferente de crédito de plano.

```text
Crédito de plano → direito a benefício
Crédito financeiro → valor monetário
```

Nunca deve existir conversão implícita entre os dois.

O crédito financeiro possui extrato próprio e pode surgir por:

- pagamento excedente;
- ajuste administrativo;
- estorno;
- outra regra comercial futura.

---

# 12. Financeiro

## 12.1. Valor financeiro do pedido

Pedido pode consumir:

- créditos de plano;
- valores financeiros;
- crédito financeiro.

Essas grandezas não devem ser misturadas.

## 12.2. Desconto

Desconto reduz o valor devido e não é forma de pagamento.

Desconto manual deve registrar:

- motivo;
- responsável;
- data/hora.

Desconto não reduz créditos de plano.

## 12.3. Taxas e acréscimos

Taxas representam valores aplicados ao pedido, mas não são itens comprados.

Exemplo principal:

- taxa de entrega.

## 12.4. Taxa de entrega

A taxa aplicada deve ficar preservada no pedido.

Pode ser sugerida por política e ajustada pelo operador antes da confirmação.

---

# 13. Cobranças e pagamentos

## 13.1. Separação fundamental

```text
Pedido → o que foi comprado
Cobrança → o que deve ser recebido
Pagamento → o que efetivamente foi recebido
```

## 13.2. Cobranças

Um pedido pode gerar uma ou várias cobranças, com:

- valor;
- vencimento.

## 13.3. Pagamentos

Clientes podem pagar:

- à vista;
- na entrega;
- depois;
- em diferentes momentos.

## 13.4. Vencimento

Vencimento é diferente da data efetiva de pagamento.

## 13.5. Alocação de pagamentos

Uma cobrança pode receber vários pagamentos.

Um pagamento pode quitar várias cobranças.

```text
Pagamento ↔ Alocação ↔ Cobrança
```

## 13.6. Pagamento excedente

Valor recebido acima do que foi alocado deve virar crédito financeiro do cliente.

---

# 14. Capacidade operacional

## 14.1. Capacidade não é quantidade de pedidos

A carga deve ser medida sobre o que realmente gera esforço operacional.

Na primeira versão, pode ser medida principalmente por quantidade de refeições produzidas no dia.

## 14.2. Pedido aberto não reserva capacidade definitiva

```text
Aberto → não consome capacidade definitiva
Confirmado → consome capacidade
```

## 14.3. Congelados e capacidade diária

Venda de item congelado já produzido não deve consumir a capacidade de produção diária da cozinha.

```text
Pedido confirmado
├── item do dia → consome capacidade
└── congelado em estoque → consome estoque
```

## 14.4. Concorrência

A confirmação deve impedir que pedidos concorrentes:

- ultrapassem a capacidade real da produção diária;
- consumam o mesmo estoque congelado disponível.

## 14.5. Cancelamento e capacidade

Cancelamento antes da produção pode liberar capacidade.

Após início da produção, não deve liberar automaticamente.

## 14.6. Evolução futura

Peso operacional, capacidade por tipo, janela, cozinha e logística podem surgir quando houver necessidade concreta.

---

# 15. Produção diária

## 15.1. V1 orientada à consulta

Na primeira versão, a cozinha não alimenta o sistema para a operação diária.

O sistema deve responder quanto produzir.

## 15.2. Produção derivada dos pedidos confirmados

```text
Pedidos confirmados
→ itens
→ componentes
→ composição efetiva
→ agregação
```

## 15.3. Necessidade de ingredientes

Quando útil, a composição pode ser expandida para obter quantidades agregadas de ingredientes.

## 15.4. Congelados não entram automaticamente na produção diária

A produção de congelados é um ciclo separado.

Ela não deve aparecer como necessidade da produção do dia apenas porque um congelado foi vendido.

```text
Produção diária
→ reage a pedidos confirmados do dia

Produção de congelados
→ gera lote e estoque
```

## 15.5. Fora da V1 da produção diária

Não implementar inicialmente:

- ordem de produção diária;
- lote para refeições do dia;
- apontamento detalhado da cozinha;
- perdas da produção diária;
- controle de execução;
- estoque físico de ingredientes.

A exceção ao conceito de lote é o estoque de congelados, onde lote é necessário por causa de fabricação, validade e saldo.

---

# 16. Congelados e estoque

## 16.1. Nova necessidade de domínio

A Sabor Santè produz refeições congeladas separadamente da operação diária.

A operação atual é:

```text
produção do congelado
→ responsável informa o que foi produzido e a quantidade
→ operador registra entrada
→ produto fica em estoque
→ venda retira do estoque
→ conferência periódica identifica vencimentos
```

Esse estoque agora faz parte da primeira versão do sistema.

## 16.2. Configuração de Congelado

`ConfiguraçãoCongelado` representa a habilitação de estoque congelado para um Item Produzível que **já existe** no sistema.

Ela não é um novo produto.

Cada configuração deve obrigatoriamente referenciar um Item Produzível existente que represente aquilo que é efetivamente preparado.

Pode acrescentar somente informações próprias do armazenamento/venda congelada, como:

- apresentação;
- quantidade por unidade;
- unidade de medida;
- preço unitário de venda;
- categoria de organização, quando útil;
- ativo/inativo.

Exemplos de apresentação:

```text
300 g
400 ml
```

Não duplicar dentro de Congelados:

- nome da preparação;
- composição;
- adicionais;
- grupos de escolha.

Nome e composição continuam pertencendo a Produzíveis. Regras comuns de venda pertencem à Oferta genérica de Congelados; o preço variável da apresentação pertence à Configuração de Congelado.

Se o Item Produzível ou a configuração estiverem inativos, as referências históricas continuam resolvidas, mas não se permite nova produção/venda sem reabilitação explícita.

A configuração pode possuir identidade técnica própria para rastrear lotes e histórico, mas essa identidade não representa um produto comercial independente.

## 16.3. Lote Congelado

Cada produção relevante de congelados deve gerar um lote.

O lote preserva:

- configuração de congelado, que por sua vez referencia o Item Produzível e preserva apresentação e preço vigentes;
- data de fabricação;
- data de validade;
- quantidade produzida;
- responsável pelo registro;
- data/hora do registro.

O saldo atual não deve ser um número arbitrariamente editado no lote.

Deve ser explicado por movimentações.

## 16.4. Data de fabricação

A data de fabricação é informada pela operação no momento do registro da produção.

Ela deve ser armazenada no lote e utilizada na etiqueta do produto.

## 16.5. Política de validade

A regra operacional confirmada para congelados é:

```text
validade = data de fabricação + 90 dias corridos
```

O dia da fabricação não é contado como o primeiro dia de validade. O cálculo soma 90 dias corridos à data informada e deve ser independente de horário e fuso.

As etiquetas fotografadas anteriormente mostram exemplos equivalentes a “mesmo dia, três meses depois”:

```text
03/08/2026 → 03/11/2026
26/08/2026 → 26/11/2026
```

Esses exemplos não correspondem matematicamente a 90 dias corridos e permanecem apenas como evidência histórica. Não devem determinar o cálculo novo.

### Regra arquitetural

Não espalhar o cálculo de validade em telas ou templates.

Representar uma política central de validade.

A implementação deve tornar a soma de 90 dias corridos explícita e testável, incluindo virada de mês, ano e ano bissexto.

## 16.6. Movimento de estoque

Saldo deve ser explicado por movimentações.

Tipos mínimos:

```text
EntradaProducao
SaidaPedido
EstornoPedido
AjusteManual
DescarteVencimento
```

Cada movimentação deve preservar:

- item/lote;
- quantidade;
- origem;
- responsável;
- data/hora;
- motivo quando aplicável.

## 16.7. Entrada de produção

Fluxo mínimo:

```text
operador escolhe uma ConfiguraçãoCongelado ativa
→ sistema resolve o Item Produzível correspondente
→ informa data de fabricação
→ informa quantidade produzida
→ sistema determina a validade conforme política
→ registra lote
→ registra EntradaProducao
→ oferece impressão das etiquetas do produto
```

O registro de estoque deve ser concluído antes da impressão.

Falha na impressora não deve desfazer a entrada.

## 16.8. Saída por pedido

Quando um Pedido confirmado contém congelados:

```text
validar estoque
→ selecionar lote(s) elegível(is)
→ registrar saída
→ relacionar saída ao Pedido
```

Itens vencidos não são elegíveis para venda.

### Regra operacional

Como existe validade, a saída deve utilizar primeiro o lote elegível com vencimento mais próximo — FEFO.

Em empate de validade, utilizar primeiro o lote com fabricação mais antiga e, persistindo o empate, um critério determinístico estável. A escolha e a baixa devem ocorrer atomicamente na API.

## 16.9. Estoque disponível

O sistema deve distinguir:

```text
quantidade física registrada
quantidade disponível para venda
```

Produto vencido pode ainda estar fisicamente no freezer até a conferência/descarte, mas não deve ser oferecido como estoque vendável.

## 16.10. Conferência periódica

Hoje existe conferência aproximadamente mensal para verificar vencimentos.

O sistema deve facilitar, sem criar burocracia:

- visualizar lotes vencidos;
- visualizar lotes por ordem de vencimento;
- conferir saldo;
- registrar descarte;
- registrar ajuste quando quantidade física divergir.

Não é necessário criar inicialmente inventário complexo, contagem cega, coletor ou workflow de aprovação.

## 16.11. Ajuste manual

Ajuste de estoque deve exigir:

- quantidade;
- motivo;
- responsável;
- data/hora.

Não editar saldo diretamente.

## 16.12. Cancelamento de pedido com congelado

O cancelamento deve preservar segurança sanitária e rastreabilidade. A regra operacional é:

```text
unidade ainda não separada e sob estoque controlado
→ estorno automático para o mesmo lote

unidade separada, mas ainda sob guarda e cadeia fria controladas
→ bloquear retorno automático
→ exigir conferência humana registrada
→ retornar ao mesmo lote apenas se embalagem, temperatura e rastreabilidade estiverem íntegras

unidade expedida, entregue ao transportador/cliente ou com cadeia fria duvidosa
→ nunca retornar automaticamente ao estoque vendável
→ colocar em quarentena operacional e registrar descarte ou outra destinação autorizada
```

Reembolso financeiro e estorno de estoque são decisões distintas. O sistema deve registrar responsável, data/hora, motivo e destino físico em toda decisão manual.

---

# 17. Etiquetas

## 17.1. Três aplicações de etiqueta

Existem três aplicações distintas:

```text
Etiqueta de produto congelado
→ colada no recipiente do alimento
→ gerada na produção para estoque

Etiqueta de item da produção do dia
→ uma para cada unidade física do Pedido
→ colada no recipiente antes de entrar no pacote

Etiqueta externa do Pedido
→ uma para o pacote/saco kraft do Pedido
```

Todo item deve chegar ao cliente com sua etiqueta individual. O pacote kraft recebe ainda sua própria etiqueta externa.

Não misturar a identificação do alimento com a identificação externa do pacote.

## 17.2. Formato físico atual

O formato informado é:

```text
10 cm x 5 cm
```

ou:

```text
100 mm x 50 mm
```

A operação atual utiliza impressora Zebra com driver ZPL.

A arquitetura do domínio não deve depender do modelo específico da impressora.

## 17.3. Etiqueta do produto congelado

A etiqueta do produto deve ser gerada a partir da ConfiguraçãoCongelado e do LoteCongelado, usando o nome do Item Produzível existente.

Conteúdo operacional confirmado para a V1:

- nome do produto proveniente de Produzíveis;
- apresentação/porção quando aplicável;
- data de fabricação;
- data de validade;
- logomarca Sabor Santè.

Exemplo conceitual:

```text
CHILLI
PORÇÃO 300 GRAMAS

Fabricação: 26/08/2026
Validade:   <calculada pela política vigente>

[logo]
```

## 17.4. Quantidade de etiquetas do produto

Ao registrar produção de:

```text
12 unidades
```

o sistema deve permitir imprimir:

```text
12 etiquetas
```

A quantidade padrão pode seguir a quantidade produzida.

O operador pode imprimir menos, imprimir depois ou reimprimir.

Impressão não altera saldo.

## 17.5. Momento da etiqueta do produto

A etiqueta é utilizada quando o congelado é embalado para armazenamento.

O fluxo desejado é:

```text
produção
→ embalagem do congelado
→ registro do lote
→ impressão
→ colagem no produto
→ estoque
```

O software deve registrar o lote antes da impressão para evitar perda de dados em caso de falha da impressora.

## 17.6. Etiqueta do item da produção do dia

Cada unidade física produzida para o Pedido deve receber uma etiqueta individual antes de ser colocada no pacote kraft.

A quantidade de etiquetas deriva das quantidades dos itens confirmados, não apenas da quantidade de linhas do Pedido.

O conteúdo deve ser gerado a partir do snapshot do PedidoItem e destacar as informações necessárias para identificar e montar corretamente a unidade, incluindo:

- nome do produto;
- apresentação/porção, quando aplicável;
- personalizações, adicionais, restrições e observações relevantes para aquela unidade;
- identificação do Pedido ou do cliente quando necessária para evitar trocas durante a montagem.

O conteúdo final e sua hierarquia visual devem ser validados no protótipo sem transformar a etiqueta em um checklist operacional.

O congelado já etiquetado durante sua produção para estoque satisfaz a exigência de etiqueta individual. Na Embalagem do Pedido, o operador apenas confere essa etiqueta e não imprime uma duplicata sem necessidade.

## 17.7. Etiqueta externa do Pedido

A etiqueta externa identifica o pacote kraft do cliente.

Conteúdo mínimo solicitado:

- nome do cliente;
- identificação do Pedido;
- resumo do Pedido, quando couber;
- endereço de entrega e telefone, quando houver entrega;
- logomarca Sabor Santè.

Deve utilizar snapshots do Pedido.

Não deve buscar o endereço atual do cadastro na hora da reimpressão. Em retirada/balcão, a etiqueta externa continua identificando cliente e Pedido, omitindo os campos exclusivos de entrega.

## 17.8. Momento das etiquetas na Embalagem

As etiquetas dos itens da produção do dia e a etiqueta externa pertencem ao fluxo de Embalagem/Expedição.

```text
operador confere Pedido
→ clica em “Embalado”
→ sistema prepara uma etiqueta para cada unidade da produção do dia ainda sem etiqueta
→ sistema prepara uma etiqueta externa para o pacote kraft
→ operador cola as etiquetas individuais nos recipientes
→ operador coloca os itens no pacote e cola a etiqueta externa
```

O mesmo gesto operacional inicia a marcação do Pedido como Embalado e o trabalho de impressão necessário, mas são efeitos tecnicamente independentes. A impressão não cria status adicional de domínio, e uma falha da impressora não desfaz estoque nem exige desmarcar o Pedido.

## 17.9. Reimpressão

Reimpressão deve ser simples.

Não exigir:

- ajuste de estoque;
- reversão de Pedido;
- alteração de lote;
- novo cadastro.

A reimpressão deve reutilizar os dados históricos já registrados.

## 17.10. Custo das etiquetas

Como etiquetas têm custo operacional relevante, o sistema não deve imprimir na confirmação do Pedido nem em massa sem ação explícita.

Preferir:

```text
ação explícita “Embalado”
→ gerar o conjunto de etiquetas daquele Pedido
→ imprimir
```

Congelados podem imprimir várias etiquetas de uma vez porque representam um lote produzido.

Na Embalagem, imprimir somente as etiquetas individuais ainda necessárias e uma etiqueta externa por pacote kraft. Reimpressões permanecem explícitas e selecionáveis para evitar duplicações.

## 17.11. Limite de escopo regulatório

As etiquetas descritas neste documento são requisitos operacionais informados pela Sabor Santè.

Este documento não afirma que o conteúdo descrito substitui eventuais obrigações legais ou sanitárias de rotulagem de alimentos.

Caso seja necessário atender rotulagem regulatória adicional, isso deve ser tratado como requisito próprio.

---

# 18. Embalagem

## 18.1. Princípio

A embalagem deve continuar extremamente simples.

```text
operador abre pedido
→ confere visualmente
→ clica em "Embalado"
→ imprime etiquetas individuais ainda necessárias e a etiqueta externa do pacote
```

Registrar apenas:

- Pedido;
- responsável;
- data/hora.

Evitar checklist detalhado por item.

## 18.2. Conferência visual

A tela pode exibir:

- itens;
- quantidades;
- personalizações;
- restrições;
- adicionais;
- congelados;
- observações.

A função dessa visualização é ajudar a conferência, não criar um processo de confirmação linha a linha.

## 18.3. Etiquetas da Embalagem

A impressão das etiquetas individuais da produção do dia e da etiqueta externa deve acontecer diretamente no contexto do Pedido em embalagem ao clicar em “Embalado”.

Não obrigar o operador a navegar para outra área apenas para imprimir ou reimprimir.

## 18.4. Congelados na embalagem do pedido

O congelado já deve chegar ao fluxo de Pedido com etiqueta individual aplicada durante sua produção/entrada em estoque.

Na embalagem do pedido, o operador não precisa recriar a etiqueta interna do congelado.

A ação “Embalado” imprime as etiquetas das unidades da produção do dia ainda sem identificação e a etiqueta externa do pacote kraft. O operador confere visualmente as etiquetas já presentes nos congelados.

---

# 19. Entrega e logística

## 19.1. Entregador

Cadastro mínimo:

- identificação;
- nome;
- telefone opcional;
- ativo/inativo.

## 19.2. Preferência e execução

```text
Cliente → entregador preferencial
Pedido → entregador atribuído
Tentativa → entregador que realmente executou
```

## 19.3. Rota de entrega

Rota é entidade operacional própria.

A sequência pertence à rota, não ao pedido.

Uma rota possui:

- data;
- janela;
- entregador;
- status;
- paradas ordenadas.

## 19.4. Planejamento de rota

Na V1, o operador monta e ordena manualmente.

A arquitetura deve permitir sugestão automática futura, mantendo decisão final humana.

## 19.5. Status da rota

```text
Planejada
EmExecução
Concluída
Cancelada
```

## 19.6. Início da rota

A rota não deve alterar pedidos cegamente.

Deve validar que todos estão aptos.

## 19.7. Paradas

RotaParada representa uma participação do pedido em uma rota.

Uma parada planejada não é uma tentativa de entrega.

## 19.8. Tentativa de entrega

Tentativa representa execução real e pode registrar:

- pedido;
- entregador;
- horário;
- resultado;
- motivo de falha;
- observação;
- quem recebeu.

## 19.9. Falha na entrega

Pode ocorrer por:

- cliente ausente;
- endereço incorreto;
- acesso impedido;
- cliente sem resposta;
- outro motivo operacional.

## 19.10. Nova tentativa

Falha não gera nova tentativa automaticamente.

O operador decide:

- reagendar;
- cancelar;
- tratar de outra forma.

## 19.11. Reagendamento

Deve preservar:

- janela anterior;
- nova janela;
- motivo;
- responsável;
- data/hora.

## 19.12. Conclusão da rota

Rota concluída significa que todas as paradas foram tratadas.

Não significa que todas tiveram sucesso.

## 19.13. Etiqueta de entrega e logística

A etiqueta externa é preparada na Embalagem e acompanha o pacote.

Ela auxilia identificação física, mas não substitui:

- Rota;
- endereço histórico no Pedido;
- parada;
- tentativa.

---

# 20. Cancelamento e reabertura

## 20.1. Cancelamento

Cancelamento é uma ação de negócio, não simples edição de status.

Deve registrar:

- motivo;
- estágio;
- responsável;
- data/hora.

## 20.2. Cancelamento antes da produção

Pode:

- liberar capacidade;
- estornar créditos;
- devolver crédito financeiro;
- cancelar cobranças pendentes;
- estornar saída de congelados quando a devolução for operacionalmente válida.

## 20.3. Cancelamento após início da produção

Não deve assumir automaticamente devolução integral.

Cancelamento operacional e estorno financeiro são conceitos diferentes.

## 20.4. Reabertura

Pode existir de Confirmado para Aberto, com reversão consistente dos efeitos.

A partir de EmProdução, reabertura simples não deve ser permitida.

---

# 21. Atendimento e WhatsApp

## 21.1. WhatsApp é canal, não núcleo

```text
WhatsApp → canal de entrada
Pedido → domínio central
```

## 21.2. Integração direta

A integração deve usar a plataforma oficial do WhatsApp, sem depender obrigatoriamente de intermediários.

## 21.3. Coexistência

A integração deve coexistir com o aplicativo oficial usado pela equipe, refletindo no sistema o que acontece na conversa mesmo quando o operador responde pelo aplicativo.

## 21.4. Conversas iniciadas pelo cliente

A API não deve iniciar conversas.

O cliente inicia.

O aplicativo oficial pode continuar sendo usado manualmente pela equipe.

## 21.5. Atendimento humano sempre disponível

O cliente nunca deve ficar preso na automação.

Estados conceituais:

```text
Automatizado
Humano
Encerrado
```

Quando humano assume:

- automação pausa;
- mensagens continuam sendo registradas.

## 21.6. Detecção de atendimento humano

Resposta humana detectada deve colocar o atendimento em modo Humano e impedir respostas automáticas concorrentes.

## 21.7. Conversação natural

A automação deve:

- falar naturalmente;
- evitar menus rígidos;
- fazer perguntas curtas;
- manter contexto;
- confirmar entendimento;
- reconhecer incerteza;
- transferir para humano quando necessário.

## 21.8. Histórico local

Mensagens relevantes devem ser persistidas localmente com:

- identificador externo;
- direção;
- origem;
- conteúdo;
- horário da plataforma;
- horário de recebimento;
- estado de processamento.

## 21.9. Idempotência

A mesma mensagem não pode gerar efeito de negócio duplicado.

## 21.10. Ordem de processamento

Mensagens da mesma conversa devem ser processadas sequencialmente.

Conversas diferentes podem ser processadas em paralelo.

## 21.11. Estados de processamento

```text
Recebida
Processando
Processada
Falhou
Ignorada
```

Regra:

```text
persistir primeiro
→ processar depois
```

## 21.12. Retentativa

Falhas temporárias devem permitir reprocessamento seguro sem duplicação.

## 21.13. Webhook rápido

```text
evento chega
→ validar
→ persistir
→ responder rapidamente
→ processar posteriormente
```

## 21.14. Segurança

Eventos externos devem ser autenticados/validados.

Credenciais e segredos não pertencem ao código-fonte.

## 21.15. Automação monta pedido aberto

```text
mensagem
→ interpretação
→ Pedido Aberto estruturado
```

O texto da conversa não é o Pedido.

## 21.16. Ambiguidade

Se a automação não tiver segurança suficiente:

- pergunta;
- não inventa;
- pode transferir para humano.

## 21.17. Cliente confirmou ≠ Pedido Confirmado

Quando o cliente diz “sim, está certo”, isso apenas confirma o resumo.

A confirmação de domínio continua sendo ação operacional posterior.

## 21.18. Pronto para revisão

O pedido pode possuir estado auxiliar de preparação, como:

```text
EmMontagem
ProntoParaRevisão
```

sem poluir o status principal.

## 21.19. Propriedade da edição

No modo automatizado:

- automação pode alterar Pedido Aberto.

No modo humano:

- automação deixa de modificar;
- operador conduz.

## 21.20. Concorrência otimista

Alterações concorrentes não devem sobrescrever silenciosamente o trabalho de outro ator.

A arquitetura deve possuir controle equivalente a versão do pedido.

## 21.21. Congelados no atendimento

A automação pode informar e vender congelados, mas somente com base em disponibilidade real de estoque.

Não deve prometer item congelado indisponível.

---

# 22. Origem do pedido

Pedido pode registrar origem, como:

- WhatsApp;
- telefone;
- balcão;
- outro canal.

A origem serve para contexto e análise, sem tornar o núcleo dependente de um canal específico.

---

# 23. Usuários e auditoria

## 23.1. Usuários

Cadastro simples, com perfis iniciais possíveis como:

- Administrador;
- Operador;
- Entregador.

Não criar sistema complexo de permissões sem necessidade concreta.

## 23.2. Auditoria seletiva

Registrar responsável e data/hora em ações críticas, como:

- confirmar pedido;
- cancelar;
- reabrir;
- ajustar crédito;
- aplicar desconto manual;
- alterar taxa;
- registrar pagamento;
- montar/alterar rota;
- confirmar embalagem;
- reagendar entrega;
- registrar lote de congelado;
- ajustar estoque;
- registrar descarte de vencido.

Não auditar cada clique.

---

# 24. Estoque

## 24.1. Mudança em relação ao escopo anterior

Controle físico de estoque em geral continua fora da primeira versão.

Porém existe agora uma exceção concreta:

```text
estoque de refeições congeladas
→ entra na V1
```

## 24.2. O que continua fora

Não implementar inicialmente estoque físico de:

- ingredientes;
- embalagens;
- insumos;
- matéria-prima;
- saladas;
- pratos produzidos para o dia.

Também não implementar:

- inventário genérico;
- múltiplos depósitos complexos;
- endereçamento físico;
- gestão de compras;
- custo médio;
- FIFO contábil genérico.

## 24.3. O que entra para congelados

Implementar somente o necessário:

- itens congelados;
- lotes;
- fabricação;
- validade;
- quantidade;
- movimentos;
- saldo;
- bloqueio de vencidos;
- ajustes;
- descarte;
- conferência;
- integração com Pedido;
- etiquetas.

---

# 25. Limites da primeira versão

## 25.1. Deve entrar na V1

- Clientes;
- endereços;
- preferências;
- restrições alimentares;
- entregadores;
- usuários;
- catálogo;
- ofertas;
- tipos de componente;
- grupos de escolha;
- itens produzíveis;
- composições versionadas;
- cardápio semanal;
- cardápio diário;
- disponibilidade;
- pedido;
- itens;
- componentes;
- personalizações;
- adicionais;
- planos;
- aquisições;
- extrato de créditos;
- crédito financeiro;
- descontos;
- taxas;
- cobranças;
- pagamentos;
- alocações;
- capacidade simples;
- produção diária agregada;
- embalagem simples;
- rotas manuais;
- tentativas;
- falhas e reagendamentos;
- atendimento WhatsApp;
- auditoria seletiva;
- configurações de congelado vinculadas obrigatoriamente a Itens Produzíveis existentes, com apresentação e preço próprios;
- lotes de congelados;
- estoque de congelados;
- movimentos de estoque de congelados;
- conferência de vencimentos;
- etiqueta de produto congelado;
- etiqueta individual dos itens da produção do dia;
- etiqueta externa do pacote kraft;
- reimpressão.

## 25.2. Preparar para evolução

- alertas e exceções operacionais sobre FEFO;
- alertas configuráveis de proximidade do vencimento;
- sugestão automática de rotas;
- peso operacional de capacidade;
- regras avançadas de taxa;
- promoções complexas;
- variantes avançadas;
- permissões refinadas;
- canais adicionais;
- filas externas;
- automações comerciais futuras;
- impressão em múltiplos modelos de impressora;
- mais de um tamanho de etiqueta;
- múltiplos depósitos, caso um dia exista necessidade real.

## 25.3. Fora da V1

- estoque físico genérico de ingredientes;
- estoque de embalagens;
- lote da produção diária;
- apontamento detalhado da cozinha;
- perdas da produção diária;
- rastreamento contínuo de entregador;
- gestão de frota;
- prova de entrega com foto/assinatura;
- motor genérico de regras;
- integração contábil completa;
- marketing automatizado em massa;
- inventário industrial;
- WMS;
- MRP;
- impressão industrial complexa;
- designer genérico de etiquetas dentro do sistema.

---

# 26. Invariantes principais

## Pedido

- pedido confirmado não pode ser alterado livremente;
- pedido em produção não pode ser simplesmente reaberto;
- status não deve ser alterado arbitrariamente;
- confirmação é operação atômica;
- histórico de preço não depende do catálogo atual;
- endereço histórico não depende do cadastro atual;
- contato de entrega histórico não deve ser silenciosamente substituído;
- item congelado confirmado deve possuir estoque elegível.

## Plano

- crédito só pode ser usado em benefício compatível;
- consumo só acontece na confirmação;
- movimentação explica saldo;
- saldo não deve ser alterado sem histórico;
- estorno deve devolver às aquisições corretas.

## Financeiro

- desconto não é pagamento;
- crédito financeiro não é desconto;
- crédito de plano não é dinheiro;
- pagamento não é cobrança;
- vencimento não é data de pagamento;
- um pagamento pode ser alocado em várias cobranças;
- uma cobrança pode receber vários pagamentos.

## Produção diária

- produção deriva de pedidos confirmados;
- pedidos abertos não devem inflar necessidade real;
- composição usada precisa ser historicamente determinística;
- congelado vendido do estoque não deve inflar produção diária.

## Congelados

- não existe uma Oferta duplicada para cada produto congelado;
- toda ConfiguraçãoCongelado deve referenciar um Item Produzível existente;
- a ConfiguraçãoCongelado define apresentação e preço variável sem duplicar nome ou composição;
- o Pedido usa a Oferta genérica de Congelados e preserva a configuração escolhida e o preço efetivo;
- saldo deve ser explicado por movimentos;
- lote deve preservar fabricação e validade;
- item vencido não pode ser vendido;
- saída por Pedido deve ser rastreável;
- ajuste manual exige motivo e responsável;
- impressão não muda estoque;
- reimpressão não cria nova entrada;
- produto vendido deve sair de lote elegível;
- alteração/inativação de cadastro não reescreve lote antigo.

## Embalagem

- conferência deve permanecer simples;
- não exigir checklist detalhado como regra de negócio;
- cada unidade física do Pedido deve possuir etiqueta individual;
- itens da produção do dia recebem sua etiqueta na Embalagem;
- congelados usam a etiqueta aplicada na produção para estoque, sem duplicação automática na Embalagem;
- etiqueta externa do pacote kraft deve usar snapshot do Pedido;
- clicar em “Embalado” dispara o conjunto de etiquetas necessário para o Pedido;
- imprimir ou reimprimir não altera status do Pedido.

## Logística

- sequência pertence à rota;
- pedido pode participar de mais de uma rota;
- rota concluída não significa que todas as entregas tiveram sucesso;
- tentativa de entrega é evento histórico.

## WhatsApp

- mensagem duplicada não pode gerar efeito duplicado;
- automação não deve competir com operador humano;
- automação não pode substituir regras de domínio;
- cliente não fica preso ao bot.

---

# 27. Fluxo macro da operação diária

```text
Planejamento semanal
↓
Cardápio diário em rascunho
↓
Revisão
↓
Publicação
↓
Clientes entram em contato
↓
Pedido é montado
↓
Preferências/restrições são consideradas
↓
Cliente revisa
↓
Pedido fica pronto para revisão
↓
Operador confere
↓
Confirmar Pedido
↓
Capacidade + créditos + financeiro + estoque congelado são consolidados
↓
Produção agregada do dia é atualizada
↓
Pedido entra no fluxo operacional
↓
Embalagem
↓
Conferência visual
↓
Ação “Embalado”
↓
Impressão das etiquetas individuais necessárias + etiqueta externa do pacote kraft
↓
Pedido apto para logística
↓
Operador monta rota
↓
Rota inicia
↓
Tentativas de entrega
↓
Concluído
ou
Falha → reagendamento/cancelamento
```

---

# 28. Fluxo macro dos congelados

```text
Produção para estoque congelado de Item Produzível existente
↓
Responsável informa produto habilitado + quantidade + data de fabricação
↓
Operador registra lote
↓
Sistema calcula/aplica política de validade
↓
Entrada de estoque
↓
Sistema disponibiliza impressão das etiquetas do produto
↓
Etiquetas são coladas nos recipientes
↓
Estoque disponível
↓
Pedido inclui congelado
↓
Confirmar Pedido
↓
Sistema valida e baixa estoque
↓
Congelado é separado
↓
Ação “Embalado” imprime as etiquetas ainda necessárias e a etiqueta externa do pacote
↓
Entrega
```

Em paralelo:

```text
Estoque
↓
monitoramento de vencimentos
↓
conferência periódica
↓
ajuste ou descarte quando necessário
```

---

# 29. Filosofia de evolução arquitetural

A arquitetura deve crescer por necessidade concreta.

Não introduzir uma abstração apenas porque ela existe como padrão conhecido.

```text
problema real
↓
regra de domínio
↓
modelo mínimo
↓
implementação
↓
teste
↓
evolução
```

Exemplos:

- transações surgem quando confirmar pedido altera várias coisas;
- controle de concorrência surge quando múltiplos atores editam ou disputam estoque;
- lote surge para congelados porque fabricação e validade precisam ser rastreadas;
- movimento de estoque surge porque saldo de congelados precisa ser explicado;
- impressão surge porque escrever manualmente gera trabalho e a operação já possui impressora;
- mensageria surge se processamento assíncrono exigir mais robustez;
- DDD tático surge onde invariantes de domínio justificarem;
- otimização de rota surge quando roteirização manual se tornar gargalo;
- estoque genérico só surge se uma nova dor real justificar.

---

# 30. Direção arquitetural

A implementação ideal deve respeitar:

```text
módulos de domínio claros
+
regras centralizadas
+
canais desacoplados
+
histórico confiável
+
estoque específico onde necessário
+
impressão desacoplada
+
mínima burocracia
+
evolução incremental
```

Diferentes interfaces devem utilizar o mesmo domínio:

```text
Operador interno
WhatsApp
Site futuro
Aplicativo futuro
Outros canais
```

Todos convergindo para as mesmas regras.

---

# 31. Decisão operacional de validade

Foi confirmado com a operação que a validade usa 90 dias corridos:

```text
validade = data de fabricação + 90 dias corridos
```

As etiquetas existentes que usam o mesmo dia após três meses permanecem como registro histórico de uma prática substituída:

```text
mesmo dia do mês + 3 meses
```

Exemplos observados:

```text
03/08/2026 → 03/11/2026
26/08/2026 → 26/11/2026
```

O sistema deve aplicar somente a regra confirmada nas novas entradas. Lotes históricos preservam a validade efetivamente registrada; não devem ser recalculados retroativamente.

---

# 32. Regra final

A arquitetura da Sabor Santè deve ser sofisticada onde o negócio exige consistência e simples onde a operação exige velocidade.

A nova demanda de congelados não justifica transformar o sistema em um ERP de estoque.

Ela justifica apenas o modelo mínimo necessário para:

```text
saber o que foi produzido
+
quando foi produzido
+
quando vence
+
quanto existe
+
quanto foi vendido
+
o que precisa ser descartado
+
imprimir as etiquetas corretas
```

E a nova demanda de etiquetas não justifica criar um designer gráfico genérico.

Ela justifica:

```text
dados confiáveis
+
template controlado
+
impressão rápida
+
reimpressão simples
```

> Complexidade técnica só é justificável quando protege uma regra real, reduz trabalho, preserva histórico, evita venda indevida ou prepara uma evolução concreta do negócio.
