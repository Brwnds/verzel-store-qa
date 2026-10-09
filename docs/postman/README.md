# Coleção Postman: API da Verzel Store

Coleção com **37 requisições** e **123 verificações automáticas** cobrindo a API do card VZS-142: produtos, cupom, frete, cálculo, validações, códigos de erro, pedidos e a reprodução dos bugs.

Arquivo: [`verzel-store.postman_collection.json`](verzel-store.postman_collection.json)

## Como importar no Postman

1. Abra o Postman (app ou web).
2. Clique em **Import** (canto superior esquerdo).
3. Arraste o arquivo `verzel-store.postman_collection.json` ou selecione-o em **files**.
4. A coleção **"Verzel Store - VZS-142 (cupom e frete grátis)"** aparece na barra lateral.

A URL da loja já vem configurada na variável `baseUrl` da coleção. Não é preciso criar ambiente (environment).

## Como executar

**Uma requisição:** abra a requisição, clique em **Send** e veja a resposta em **Body** e os testes em **Test Results**.

**A coleção inteira:**
1. Clique nos `...` ao lado do nome da coleção e depois em **Run collection**.
2. Clique em **Run Verzel Store...**.
3. O resultado esperado é **todos os testes verdes**.

**Pelo terminal (sem abrir o Postman),** na raiz do repositório:

```bash
npm run test:postman
```

Esse comando usa o [Newman](https://github.com/postmanlabs/newman), a versão de linha de comando do Postman, que é instalado junto com o `npm install`. O resultado da última execução está em [`resultado-newman.txt`](resultado-newman.txt).

## Organização

| Pasta | O que cobre | Requisições |
|---|---|---|
| 01 - Produtos | Listagem, consulta e produto inexistente | 3 |
| 02 - Carrinho: cupom | CA01 a CA04: válido, minúsculo, com espaços, inválido, expirado | 7 |
| 03 - Carrinho: frete e cálculo | CA06 a CA09 e CA11: abaixo, perto e acima do limite, frete antes do desconto, arredondamento | 6 |
| 04 - Carrinho: validações e erros | CA10 e a tabela de códigos de erro (400, 404, 405, 422) | 10 |
| 05 - Pedidos | Pedido válido, CEP, cupom inválido/expirado, dados do cliente | 5 |
| 06 - Bugs (reprodução) | BUG-01, BUG-02 (x2), BUG-03, BUG-05, BUG-06 | 6 |

Os nomes das requisições usam os mesmos IDs dos cenários (CT01, CT13...) de [`docs/01-cenarios`](https://github.com/Brwnds/verzel-store-qa/tree/main/docs/01-cenarios) e do [relatório de execução](../02-execucao.md). A descrição de cada requisição diz o que é esperado.

## Sobre a pasta "06 - Bugs"

Os testes dessa pasta **confirmam que o bug ainda acontece**. Por isso ficam **verdes** enquanto o bug existir, com nomes como "BUG-01 reproduzido: subtotal 200 cobra frete 19.9 (esperado 0)".

Quando o time corrigir um bug, o teste correspondente fica **vermelho**. É o sinal para reescrevê-lo validando o comportamento correto, como teste de regressão. A automação Playwright segue a mesma lógica com `test.fail()`.

Os bugs BUG-04 e BUG-07 são só de interface (carrinho e menu no celular), por isso não estão nesta coleção. Detalhes de todos os bugs em [`docs/03-bugs.md`](../03-bugs.md).
