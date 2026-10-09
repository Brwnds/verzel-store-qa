# language: pt
# Contrato da API descrito em /documentacao#api e na tabela "Códigos de erro"

Funcionalidade: Contrato e códigos de erro da API

  @api @automatizado
  Cenário: CT27 - Listar produtos
    Quando faço GET /api/produtos
    Então a resposta é 200 com os 8 produtos e os preços da tabela "Dados para teste"

  @api @automatizado
  Cenário: CT28 - Consultar produto inexistente
    Quando faço GET /api/produtos/P999
    Então a resposta é 404 com o código "PRODUTO_NAO_ENCONTRADO"

  @api @automatizado
  Cenário: CT29 - Corpo da requisição não é JSON válido
    Quando faço POST /api/carrinho/calcular com o corpo "{itens:"
    Então a resposta é 400 com o código "JSON_INVALIDO"

  @api @automatizado
  Cenário: CT30 - Rota inexistente
    Quando faço GET /api/xyz
    Então a resposta é 404 com o código "ROTA_NAO_ENCONTRADA"

  @api @automatizado
  Cenário: CT31 - Método não permitido
    Quando faço GET /api/carrinho/calcular
    Então a resposta é 405 com o código "METODO_NAO_PERMITIDO"

  @api @automatizado
  Esquema do Cenário: Validações da lista de itens (CT32, CT33, CT35, CT36)
    Quando faço POST /api/carrinho/calcular com <corpo>
    Então a resposta é 422 com o código "<codigo>"

    Exemplos:
      | cenario | corpo                                                       | codigo                 |
      | CT32    | {}                                                          | ITENS_OBRIGATORIOS     |
      | CT32    | {"itens": []}                                               | ITENS_OBRIGATORIOS     |
      | CT33    | {"itens": ["P001"]}                                         | ITEM_INVALIDO          |
      | CT35    | {"itens": [{"produtoId": "P999", "quantidade": 1}]}         | PRODUTO_NAO_ENCONTRADO |
      | CT36    | dois itens com "produtoId": "P001"                          | ITEM_DUPLICADO         |

  @api @automatizado @BUG-03
  Cenário: CT34 - Item sem produtoId
    Quando faço POST /api/carrinho/calcular com {"itens": [{"quantidade": 1}]}
    Então a resposta é 422 com o código "ITEM_INVALIDO"
    E a mensagem não expõe valores internos como "undefined"

  @api @automatizado
  Esquema do Cenário: CT37 - Quantidade inválida
    Quando calculo um carrinho com quantidade <quantidade>
    Então a resposta é 422 com o código "QUANTIDADE_INVALIDA" e campo "itens[0].quantidade"

    Exemplos:
      | quantidade |
      | 0          |
      | -1         |
      | 1.5        |
      | "2"        |

  @CA03 @CA04 @api @automatizado
  Cenário: CT38 - Cálculo com cupom inválido ou expirado não gera erro
    Quando calculo o carrinho com o cupom "XPTO" ou "VERAO2026"
    Então a resposta é 200 com desconto 0
    E cupom.aplicado false com a mensagem do motivo

  @CA03 @api @automatizado
  Cenário: CT39 - Pedido com cupom inexistente
    Quando envio um pedido válido com o cupom "XPTO"
    Então a resposta é 422 com o código "CUPOM_INVALIDO" e campo "cupom"

  @CA04 @api @automatizado
  Cenário: CT40 - Pedido com cupom expirado
    Quando envio um pedido válido com o cupom "VERAO2026"
    Então a resposta é 422 com o código "CUPOM_EXPIRADO" e campo "cupom"

  @api @automatizado
  Cenário: CT41 - Pedido válido
    Quando envio um pedido de 1 "P005" com o cupom " bemvindo10 " e CEP "01310-100"
    Então a resposta é 201
    E o número segue o formato "VZ-000000"
    E o CEP volta normalizado como "01310100"
    E os valores são subtotal 100, desconto 10, frete 19.9 e total 109.9
