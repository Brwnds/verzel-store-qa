# language: pt
# Critério coberto: CA11 + "Regras de cálculo" (total = subtotal - desconto + frete)

Funcionalidade: Cálculo e arredondamento dos valores do carrinho

  @CA01 @CA11 @ui @api @automatizado
  Cenário: CT24 - Exemplo da documentação
    Dado o carrinho com 1 "P002" e 2 "P004"
    Quando aplico o cupom "BEMVINDO10"
    Então o subtotal é 239.70
    E o desconto é 23.97
    E o frete é 0
    E o total é 215.73

  @CA11 @api @manual
  Cenário: CT25 - Arredondamento em 40 carrinhos variados
    Dado 40 carrinhos com combinações e quantidades variadas, todos com "BEMVINDO10"
    Quando calculo cada um pela API
    Então subtotal, desconto, frete e total batem com o cálculo exato em centavos
    E nenhum valor tem mais de 2 casas decimais

  @CA11 @api @manual
  Esquema do Cenário: CT26 - Valores com casas decimais quebradas
    Dado o carrinho com <itens>
    Quando aplico o cupom "BEMVINDO10"
    Então o desconto é <desconto> e o total é <total>

    Exemplos:
      | itens    | desconto | total  |
      | 3 x P001 | 17.97    | 181.63 |
      | 1 x P006 | 2.99     | 46.81  |
