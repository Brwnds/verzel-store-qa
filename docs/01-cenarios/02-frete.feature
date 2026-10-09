# language: pt
# Critérios cobertos: CA06, CA07, CA08, CA09

Funcionalidade: Frete grátis a partir de R$ 200,00
  Como cliente da Verzel Store
  Quero ganhar frete grátis em compras maiores
  Para pagar menos nas minhas compras

  Regra: subtotal >= R$ 200,00 tem frete grátis; abaixo disso, frete fixo de R$ 19,90

    @CA07 @ui @automatizado
    Cenário: CT11 - Subtotal abaixo de R$ 200,00
      Dado que o carrinho tem 1 "Mochila Urbana 20L" (subtotal R$ 100,00)
      Quando abro o carrinho
      Então o frete é "R$ 19,90"
      E o total é "R$ 119,90"
      E vejo "Faltam R$ 100,00 para o frete grátis."

    @CA07 @ui @automatizado @valor-limite
    Cenário: CT12 - Subtotal logo abaixo do limite (R$ 199,80)
      Dado que o carrinho tem 1 "Camiseta Essencial" e 1 "Calça Jeans Slim"
      Quando abro o carrinho
      Então o subtotal é "R$ 199,80"
      E o frete é "R$ 19,90"
      E vejo "Faltam R$ 0,20 para o frete grátis."

    @CA06 @ui @api @automatizado @valor-limite @BUG-01
    Cenário: CT13 - Subtotal exatamente R$ 200,00
      Dado que o carrinho tem 2 "Mochila Urbana 20L" (subtotal R$ 200,00)
      Quando abro o carrinho
      Então o frete é "Grátis"
      E o total é "R$ 200,00"
      E não aparece a mensagem de quanto falta para o frete grátis

    @CA06 @ui @manual
    Cenário: CT14 - Subtotal acima de R$ 200,00
      Dado que o carrinho tem 1 "Jaqueta Corta-Vento" (subtotal R$ 229,90)
      Quando abro o carrinho
      Então o frete é "Grátis"
      E o total é "R$ 229,90"

  Regra: o frete grátis considera o subtotal ANTES do desconto, e o desconto não incide sobre o frete

    @CA08 @ui @automatizado
    Cenário: CT15 - Subtotal acima de R$ 200,00 que fica abaixo com o desconto
      Dado que o carrinho tem 1 "Tênis Casual Urbano" e 1 "Kit 3 Pares de Meias" (subtotal R$ 219,80)
      Quando aplico o cupom "BEMVINDO10"
      Então o desconto é "- R$ 21,98"
      E o frete continua "Grátis"
      E o total é "R$ 197,82"

    @CA06 @CA08 @ui @api @manual @valor-limite @BUG-01
    Cenário: CT16 - Subtotal exatamente R$ 200,00 com cupom
      Dado que o carrinho tem 2 "Mochila Urbana 20L" (subtotal R$ 200,00)
      Quando aplico o cupom "BEMVINDO10"
      Então o desconto é "- R$ 20,00"
      E o frete é "Grátis"
      E o total é "R$ 180,00"

    @CA09 @api @automatizado
    Cenário: CT17 - Desconto não é aplicado sobre o frete
      Dado que o carrinho tem 1 "Mochila Urbana 20L" (subtotal R$ 100,00)
      Quando aplico o cupom "BEMVINDO10"
      Então o desconto é R$ 10,00 (10% de R$ 100,00, sem considerar os R$ 19,90 do frete)
      E o total é R$ 109,90
