# language: pt
# Card VZS-142 - Cupom de desconto e frete grátis (v2.3.0)
# Critérios cobertos: CA01, CA02, CA03, CA04, CA05

Funcionalidade: Cupom de desconto no carrinho
  Como cliente da Verzel Store
  Quero aplicar um cupom de desconto no carrinho
  Para pagar menos nas minhas compras

  Contexto:
    Dado que o carrinho tem 1 unidade de "Mochila Urbana 20L" (R$ 100,00)

  @CA01 @ui @automatizado
  Cenário: CT01 - Aplicar o cupom BEMVINDO10
    Quando aplico o cupom "BEMVINDO10"
    Então vejo a mensagem "Cupom BEMVINDO10 aplicado."
    E o desconto é "- R$ 10,00"
    E o total é "R$ 109,90"

  @CA02 @ui @automatizado
  Cenário: CT02 - Cupom em minúsculas e com espaços no início e no fim
    Quando aplico o cupom "  bemvindo10  "
    Então o cupom "BEMVINDO10" é aplicado
    E o desconto é "- R$ 10,00"

  @CA02 @api @automatizado
  Cenário: CT03 - Cupom com letras maiúsculas e minúsculas misturadas
    Quando calculo o carrinho pela API com o cupom "BemVindo10"
    Então a resposta traz cupom.codigo "BEMVINDO10" e cupom.aplicado true

  @CA03 @ui @automatizado
  Cenário: CT04 - Cupom inexistente
    Quando aplico o cupom "XPTO"
    Então vejo a mensagem "Cupom inválido."
    E o desconto é "R$ 0,00"
    E o total é "R$ 119,90"

  @CA04 @ui @automatizado
  Cenário: CT05 - Cupom fora da validade
    Quando aplico o cupom "VERAO2026"
    Então vejo a mensagem "Cupom expirado."
    E o desconto é "R$ 0,00"
    E o total é "R$ 119,90"

  @CA02 @CA04 @api @manual
  Cenário: CT06 - Cupom expirado digitado em minúsculas
    Quando calculo o carrinho pela API com o cupom "verao2026"
    Então a mensagem do cupom é "Cupom expirado."
    E nenhum desconto é aplicado

  @ui @exploratorio
  Cenário: CT07 - Aplicar com o campo de cupom vazio
    Quando clico em "Aplicar cupom" sem digitar nada
    Então vejo a mensagem "Informe um cupom."
    E nenhuma chamada de cálculo com cupom é feita

  @CA05 @ui @automatizado
  Cenário: CT08 - Só é possível ter um cupom aplicado
    Dado que o cupom "BEMVINDO10" está aplicado
    Então o campo de cupom deixa de ser exibido
    E só existe a opção "Remover cupom"

  @CA05 @ui @automatizado
  Cenário: CT09 - Trocar de cupom removendo o atual
    Dado que o cupom "BEMVINDO10" está aplicado
    Quando clico em "Remover cupom"
    Então o desconto volta a ser "R$ 0,00"
    E o campo de cupom volta a ser exibido
    Quando aplico o cupom "VERAO2026"
    Então vejo a mensagem "Cupom expirado."

  @CA02 @api @exploratorio
  Esquema do Cenário: CT10 - Variações de código que NÃO devem ser aceitas
    Quando calculo o carrinho pela API com o cupom "<codigo>"
    Então a mensagem do cupom é "Cupom inválido."
    E nenhum desconto é aplicado

    Exemplos:
      | codigo      | motivo                                   |
      | BEM VINDO10 | espaço no meio não é ignorado (só pontas) |
      | BEMVINDO    | código parcial                           |
      | BEMVINDO100 | código com caractere a mais              |
