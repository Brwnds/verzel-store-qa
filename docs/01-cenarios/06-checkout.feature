# language: pt
# Regras pré-existentes da loja (documentação, "Regras de cálculo"):
#   nome com nome e sobrenome; e-mail em formato válido; CEP com 8 dígitos, com ou sem hífen.

Funcionalidade: Finalização do pedido (checkout)

  @ui @automatizado
  Cenário: CT42 - Compra completa com cupom
    Dado que adiciono "Mochila Urbana 20L" pela vitrine
    E aplico o cupom "bemvindo10" no carrinho
    Quando finalizo a compra com nome "Maria Silva", e-mail "maria@exemplo.com" e CEP "01310-100"
    Então vejo "Pedido confirmado" e o número do pedido no formato "VZ-000000"
    E o resumo mostra desconto "- R$ 10,00" e total "R$ 109,90"
    E o carrinho fica vazio

  @ui @automatizado
  Cenário: CT43 - Campos obrigatórios vazios
    Quando clico em "Confirmar pedido" sem preencher nada
    Então vejo "Informe o nome completo.", "Informe o e-mail." e "Informe o CEP."
    E nenhum pedido é enviado para a API

  @ui @api @automatizado
  Cenário: CT44 - Dados inválidos
    Quando preencho nome "Maria", e-mail "maria@" e CEP "0131010"
    E clico em "Confirmar pedido"
    Então vejo "Informe nome e sobrenome.", "Informe um e-mail válido." e "Informe um CEP com 8 dígitos."

  @ui @manual
  Esquema do Cenário: CT45 - CEP fora do formato
    Quando preencho dados válidos com o CEP "<cep>"
    E clico em "Confirmar pedido"
    Então vejo "Informe um CEP com 8 dígitos."

    Exemplos:
      | cep       |
      | 013101000 |
      | abcde-fgh |

  @api @manual
  Cenário: CT46 - CEP somente com números
    Quando envio um pedido com o CEP "01310100"
    Então a resposta é 201

  @CA04 @ui @exploratorio
  Cenário: CT47 - Cupom expirado chega ao checkout
    Dado que o carrinho da aba está com o cupom "VERAO2026"
    Quando confirmo o pedido com dados válidos
    Então vejo "Cupom expirado." e o pedido não é criado
