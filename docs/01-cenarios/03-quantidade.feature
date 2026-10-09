# language: pt
# Critério coberto: CA10 - "Cada produto pode ter no máximo 5 unidades por pedido. A regra vale para a interface e para a API."

Funcionalidade: Limite de 5 unidades por produto

  @CA10 @ui @automatizado
  Cenário: CT18 - Vitrine bloqueia ao atingir 5 unidades
    Dado que estou na vitrine
    Quando clico 5 vezes em "Adicionar ao carrinho" da "Camiseta Essencial"
    Então o contador do carrinho mostra 5
    E vejo "Limite de 5 unidades atingido."
    E o botão "Adicionar ao carrinho" desse produto fica desabilitado

  @CA10 @ui @automatizado
  Cenário: CT19 - Seletor de quantidade do carrinho respeita os limites 1 e 5
    Dado que o carrinho tem 4 "Camiseta Essencial"
    Quando clico em "+"
    Então a quantidade é 5 e o "+" fica desabilitado
    E vejo "Limite de 5 unidades por produto."
    Quando clico em "-" até a quantidade ser 1
    Então o "-" fica desabilitado

  @CA10 @api @automatizado
  Cenário: CT20 - API aceita exatamente 5 unidades
    Quando calculo um carrinho com 5 "P001"
    Então a resposta é 200 com subtotal 299.5

  @CA10 @api @automatizado @BUG-02
  Esquema do Cenário: CT21 - API de cálculo recusa mais de 5 unidades
    Quando calculo um carrinho com <quantidade> "P001"
    Então a resposta é 422 com o código "QUANTIDADE_MAXIMA_EXCEDIDA"

    Exemplos:
      | quantidade |
      | 6          |
      | 100        |

  @CA10 @api @automatizado @BUG-02
  Cenário: CT22 - API de pedidos recusa mais de 5 unidades
    Quando envio um pedido válido com 6 "P005"
    Então a resposta é 422 com o código "QUANTIDADE_MAXIMA_EXCEDIDA"
    E nenhum número de pedido é gerado

  @CA10 @ui @exploratorio @BUG-02
  Cenário: CT23 - Carrinho com mais de 5 unidades não pode ser finalizado
    Dado que o carrinho da aba foi alterado para 6 "Camiseta Essencial"
    Quando finalizo a compra com dados válidos
    Então o pedido é recusado pela API e o cliente vê uma mensagem de limite
