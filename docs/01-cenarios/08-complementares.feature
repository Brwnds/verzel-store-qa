# language: pt
# Testes além dos critérios de aceite do card VZS-142: funcionalidades da loja em volta da entrega,
# compatibilidade (celular, navegadores, teclado) e consistência entre interface e API.

Funcionalidade: Funcionalidades complementares da Verzel Store

  Regra: vitrine e navegação

    @ui @automatizado
    Cenário: CT52 - Contador do cabeçalho soma produtos diferentes
      Quando adiciono 1 "Camiseta Essencial", 2 "Calça Jeans Slim" e 1 "Kit 3 Pares de Meias"
      Então o contador do carrinho mostra 4
      E o card da "Calça Jeans Slim" mostra "2 no carrinho"

    @ui @automatizado
    Cenário: CT53 - Menu, logo e link "Ver as regras da promoção"
      Quando uso os links "Produtos", "Documentação", "Carrinho", o logo e "Ver as regras da promoção"
      Então cada um leva à página correspondente
      E o link da página atual fica marcado no menu

    @ui @automatizado
    Cenário: CT54 - Botões "Ver produtos", "Continuar comprando" e "Voltar ao carrinho"
      Quando uso cada botão
      Então ele leva à vitrine ou ao carrinho, conforme o texto

    @ui @automatizado
    Cenário: CT55 - Botão da vitrine volta a habilitar
      Dado que tenho 5 "Boné Aba Curva" no carrinho
      Quando reduzo para 4 no carrinho e volto à vitrine
      Então o botão "Adicionar ao carrinho" do boné está habilitado
      E o card mostra "4 no carrinho"

  Regra: carrinho com cupom aplicado

    @ui @automatizado
    Cenário: CT56 - Aplicar o cupom com a tecla Enter
      Quando digito "bemvindo10" e pressiono Enter
      Então o cupom é aplicado

    @CA06 @CA08 @ui @automatizado
    Cenário: CT57 - Aumentar a quantidade com cupom e passar de R$ 200,00
      Dado que tenho 1 "Calça Jeans Slim" e o cupom "BEMVINDO10" aplicado
      Quando aumento para 2 unidades (R$ 279,80)
      Então o desconto vira "- R$ 27,98", o frete fica "Grátis" e o total "R$ 251,82"

    @CA07 @ui @automatizado
    Cenário: CT58 - Diminuir a quantidade com cupom e ficar abaixo de R$ 200,00
      Dado que tenho 2 "Calça Jeans Slim" e o cupom "BEMVINDO10" aplicado
      Quando diminuo para 1 unidade
      Então o desconto vira "- R$ 13,99", o frete "R$ 19,90" e o total "R$ 145,81"

    @ui @automatizado @BUG-04
    Cenário: CT59 - Remover o último item limpa o cupom
      Dado que tenho 1 "Mochila Urbana 20L" e o cupom "BEMVINDO10" aplicado
      Quando removo a mochila pelo botão "Remover"
      E adiciono outro produto pela vitrine
      Então o carrinho aparece sem cupom, igual a quando uso "Esvaziar carrinho"

    @ui @manual
    Cenário: CT60 - "Esvaziar carrinho" limpa o cupom
      Dado que tenho itens e o cupom "BEMVINDO10" aplicado
      Quando clico em "Esvaziar carrinho" e adiciono outro produto
      Então o carrinho aparece sem cupom

  Regra: checkout e pedido

    @ui @automatizado
    Cenário: CT61 - Clique duplo em "Confirmar pedido"
      Dado que preenchi o checkout com dados válidos
      Quando clico duas vezes rapidamente em "Confirmar pedido"
      Então só uma requisição de pedido é enviada

    @ui @automatizado
    Cenário: CT62 - Acessar o checkout com o carrinho vazio
      Quando acesso /checkout sem itens no carrinho
      Então sou levado ao carrinho, que mostra "Seu carrinho está vazio"

    @ui @exploratorio
    Cenário: CT63 - Voltar no navegador depois de confirmar o pedido
      Dado que acabei de confirmar um pedido
      Quando uso o botão "voltar" do navegador
      Então vejo o carrinho vazio e nenhum pedido é reenviado

    @api @automatizado @BUG-05
    Cenário: CT68 - Nome só com números
      Quando envio um pedido com o nome "123 456"
      Então o pedido é recusado com "Informe nome e sobrenome."

    @api @automatizado @BUG-06
    Cenário: CT69 - E-mail com pontos seguidos no domínio
      Quando envio um pedido com o e-mail "maria@exemplo..com"
      Então o pedido é recusado com "Informe um e-mail válido."

    @ui @api @manual
    Cenário: CT70 - Formulário e API validam os dados da mesma forma
      Dado 10 valores de nome, e-mail e CEP, entre válidos e inválidos
      Quando envio cada um pelo formulário e direto pela API
      Então os dois aceitam ou recusam o mesmo valor

  Regra: documentação, compatibilidade e acessibilidade

    @ui @automatizado
    Cenário: CT64 - Menu "Nesta página" da documentação
      Quando clico em cada item do menu "Nesta página"
      Então a página rola até a seção correspondente

    @ui @automatizado
    Cenário: CT65 - Layout no celular
      Dado um iPhone 12 (390px) ou um Galaxy S9+ (320px)
      Quando abro a vitrine, o carrinho, o checkout e a documentação
      Então nenhuma página tem rolagem horizontal

    @ui @exploratorio
    Cenário: CT66 - Navegação pelo teclado
      Quando navego pela vitrine usando apenas Tab, Enter e Espaço
      Então o foco segue a ordem visual, fica visível em todos os elementos
      E Enter e Espaço adicionam o produto ao carrinho

    @ui @manual
    Cenário: CT67 - Firefox e WebKit (Safari)
      Quando faço uma compra completa com cupom no Firefox e no WebKit
      Então o fluxo funciona igual ao Chrome, sem erros no console

    @ui @exploratorio
    Cenário: CT71 - Sem erros no console
      Quando percorro vitrine, carrinho, checkout, confirmação e documentação
      Então nenhum erro de JavaScript é registrado no console

    @ui @automatizado @BUG-07
    Cenário: CT72 - Menu completo no celular
      Dado um celular com tela de 390px
      Quando abro qualquer página
      Então consigo acessar "Produtos" e "Documentação" pelo menu
