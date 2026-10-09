# Bugs encontrados: VZS-142

| ID | Título | Severidade | Prioridade | Onde | CA | Status |
|---|---|---|---|---|---|---|
| [BUG-01](#bug-01) | Subtotal de exatamente R$ 200,00 cobra frete de R$ 19,90 | Alta | Alta | API (refletido na UI) | CA06, CA08 | Aberto |
| [BUG-02](#bug-02) | API aceita mais de 5 unidades por produto e confirma o pedido | Alta | Alta | API | CA10 | Aberto |
| [BUG-03](#bug-03) | Item sem `produtoId` retorna "Produto undefined não encontrado." | Baixa | Baixa | API | Códigos de erro | Aberto |

**Critério de severidade usado**
- **Alta:** viola um critério de aceite, com impacto financeiro ou na regra de negócio.
- **Média:** a funcionalidade funciona, mas com comportamento incorreto em parte dos casos e sem impacto financeiro.
- **Baixa:** contrato ou mensagem incorreta, sem impacto para o cliente final.

---

## BUG-01

### Subtotal de exatamente R$ 200,00 cobra frete de R$ 19,90

| | |
|---|---|
| **Severidade / Prioridade** | Alta / Alta |
| **Componente** | API `POST /api/carrinho/calcular` e `POST /api/pedidos` (a interface só exibe o que a API calcula) |
| **Critério violado** | CA06: "O frete é grátis para compras com subtotal a partir de R$ 200,00, **inclusive**." Também afeta o CA08. |
| **Ambiente** | https://verzel-store.qa-test-verzel-store.workers.dev, versão 2.3.0, Chromium/Playwright, 09/10/2026 |
| **Cenários** | CT13, CT16 |

**Passos para reproduzir (UI)**
1. Acessar a loja.
2. Adicionar 2 unidades de "Mochila Urbana 20L" (R$ 100,00 cada).
3. Abrir o Carrinho.

**Resultado esperado**
- Subtotal R$ 200,00, Frete **Grátis**, Total **R$ 200,00**.
- Nenhuma mensagem de "Faltam ... para o frete grátis".

**Resultado obtido**
- Subtotal R$ 200,00, Frete **R$ 19,90**, Total **R$ 219,90**.
- A tela mostra **"Faltam R$ 0,00 para o frete grátis."**, uma mensagem contraditória.

**Reproduzir pela API**
```http
POST /api/carrinho/calcular
Content-Type: application/json

{ "itens": [ { "produtoId": "P005", "quantidade": 2 } ] }
```
Resposta obtida (200):
```json
{ "subtotal": 200, "desconto": 0, "frete": 19.9, "freteGratis": false, "valorFaltanteFreteGratis": 0, "total": 219.9 }
```
Esperado: `"frete": 0, "freteGratis": true, "total": 200`.

**Variações verificadas**
| Carrinho | Subtotal | Frete obtido | Esperado |
|---|---|---|---|
| 2 x P005 | 200,00 | 19,90 ❌ | 0 |
| 4 x P008 | 200,00 | 19,90 ❌ | 0 |
| 1 x P005 + 2 x P008 | 200,00 | 19,90 ❌ | 0 |
| 2 x P005 + BEMVINDO10 | 200,00 | 19,90 ❌ (total 199,90) | 0 (total 180,00) |
| P006 x5 + P008 | 199,50 | 19,90 ✅ | 19,90 |
| P001 + P002 | 199,80 | 19,90 ✅ | 19,90 |
| P003 + P006 | 219,80 | 0 ✅ | 0 |

**Análise:** só o valor exato do limite falha. O comportamento é compatível com uma comparação `subtotal > 200` no lugar de `subtotal >= 200`. O campo `valorFaltanteFreteGratis` já retorna `0` corretamente, o que deixa a resposta incoerente (`freteGratis: false` com R$ 0,00 faltando).

**Impacto:** o cliente que monta o carrinho exatamente no valor anunciado na página inicial ("Frete grátis a partir de R$ 200,00") paga R$ 19,90 a mais, e o pedido é confirmado com esse valor.

**Evidências**
- [Carrinho com R$ 200,00](evidencias/img/CT13-BUG01-exato-200.png)
- [Carrinho com R$ 200,00 e cupom](evidencias/img/CT16-BUG01-exato-200-cupom.png)
- [Log da API](evidencias/api-log.md#ct13---subtotal-exatamente-r-20000-2-x-p005---bug-01)
- Automação: `tests/ui/frete.spec.ts` › CT13 e `tests/api/carrinho.api.spec.ts` › CT13

![BUG-01](evidencias/img/CT13-BUG01-exato-200.png)

---

## BUG-02

### API aceita mais de 5 unidades por produto e confirma o pedido

| | |
|---|---|
| **Severidade / Prioridade** | Alta / Alta |
| **Componente** | API `POST /api/carrinho/calcular` e `POST /api/pedidos` |
| **Critério violado** | CA10: "Cada produto pode ter no máximo 5 unidades por pedido. A regra vale para a interface **e para a API**." Também viola a tabela de erros: `422 QUANTIDADE_MAXIMA_EXCEDIDA` nunca é retornado. |
| **Ambiente** | https://verzel-store.qa-test-verzel-store.workers.dev, versão 2.3.0, 09/10/2026 |
| **Cenários** | CT21, CT22, CT23 |

**Passos para reproduzir (API)**
```http
POST /api/pedidos
Content-Type: application/json

{
  "cliente": { "nome": "Maria Silva", "email": "maria@exemplo.com", "cep": "01310-100" },
  "itens": [ { "produtoId": "P005", "quantidade": 6 } ]
}
```

**Resultado esperado:** `422` com `{"erro": {"codigo": "QUANTIDADE_MAXIMA_EXCEDIDA", "campo": "itens[0].quantidade", ...}}`.

**Resultado obtido:** `201 Created` com o pedido confirmado:
```json
{ "numero": "VZ-843168", "itens": [ { "produtoId": "P005", "quantidade": 6, "total": 600 } ], "subtotal": 600, "total": 600 }
```

O mesmo acontece em `/api/carrinho/calcular`: `quantidade: 6` e `quantidade: 100` retornam `200` com o cálculo normal.

**Pela interface**
A interface bloqueia corretamente (o botão desabilita na 5ª unidade e o "+" trava em 5). Porém, como o carrinho fica no `sessionStorage` da aba, basta alterar `verzel-store:itens` para `[{"produtoId":"P001","quantidade":6}]` e recarregar:
1. O carrinho mostra "6" unidades, com o aviso "Limite de 5 unidades por produto." ao lado.
2. "Finalizar compra" → dados válidos → "Confirmar pedido".
3. O pedido é **confirmado** com "6x Camiseta Essencial".

**Impacto:** a regra de negócio depende apenas do front-end. Qualquer cliente da API, integração ou usuário com o DevTools aberto consegue fechar pedidos acima do limite.

**Evidências**
- [Log da API (cálculo)](evidencias/api-log.md#ct21---6-unidades-no-cálculo---bug-02)
- [Log da API (pedido)](evidencias/api-log.md#ct22---pedido-com-6-unidades---bug-02)
- [Carrinho com 6 unidades](evidencias/img/CT23-BUG02-carrinho-6-unidades.png)
- [Pedido com 6 unidades confirmado](evidencias/img/CT23-BUG02-pedido-6-unidades-confirmado.png)
- Automação: `tests/api/carrinho.api.spec.ts` › CT21 e `tests/api/produtos-pedidos.api.spec.ts` › CT22

![BUG-02](evidencias/img/CT23-BUG02-pedido-6-unidades-confirmado.png)

---

## BUG-03

### Item sem `produtoId` retorna "Produto undefined não encontrado."

| | |
|---|---|
| **Severidade / Prioridade** | Baixa / Baixa |
| **Componente** | API `POST /api/carrinho/calcular` (o mesmo vale para `/api/pedidos`) |
| **Referência** | Tabela "Códigos de erro": `422 ITEM_INVALIDO`, "Um item não é um objeto com produtoId e quantidade." |
| **Cenário** | CT34 |

**Passos para reproduzir**
```http
POST /api/carrinho/calcular
Content-Type: application/json

{ "itens": [ { "quantidade": 1 } ] }
```

**Resultado esperado:** `422` com `codigo: "ITEM_INVALIDO"` e uma mensagem como "Cada item deve ser um objeto com produtoId e quantidade.", como já acontece para `"itens": ["P001"]`.

**Resultado obtido:**
```json
{ "erro": { "codigo": "PRODUTO_NAO_ENCONTRADO", "mensagem": "Produto undefined não encontrado.", "campo": "itens[0].produtoId" } }
```

**Análise:** a API não valida a presença de `produtoId` e tenta buscar o produto com o valor `undefined`, que acaba exposto na mensagem. Não há impacto para o cliente da loja (a interface sempre envia o campo), mas a resposta quebra o contrato documentado e expõe um detalhe interno.

**Evidências**
- [Log da API](evidencias/api-log.md#ct34---item-sem-produtoid---bug-03)
- Automação: `tests/api/carrinho.api.spec.ts` › CT34
